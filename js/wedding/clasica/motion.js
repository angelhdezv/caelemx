// Keep animation state outside rendering and data. Both the seal and its text
// control the same state machine; rapid taps cannot start overlapping openings.
export function setupOpening(refs, copy, signal) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let fallback;
  const finish = () => {
    if (refs.folio.dataset.state !== 'opening') return;
    clearTimeout(fallback);
    refs.folio.dataset.state = 'open';
    refs.shell.classList.add('is-open');
    refs.letter.inert = false;
    refs.cover.inert = true;
    refs.details.hidden = false;
    refs.details.inert = false;
    refs.open.hidden = true;
    refs.openStatus.textContent = '';
    refs.letter.focus({ preventScroll: true });
    refs.shell.dispatchEvent(new Event('classic:opened'));
  };
  const open = ({ immediate = false } = {}) => {
    if (refs.folio.dataset.state !== 'closed') return;
    refs.folio.dataset.state = 'opening';
    refs.seal.disabled = true; refs.open.disabled = true;
    refs.openStatus.textContent = copy.opening;
    if (preference.matches || immediate) return finish();
    // Animation events can be dropped after a background-tab transition.
    fallback = setTimeout(finish, 2300);
  };
  refs.cover.addEventListener('animationend', event => {
    if (event.animationName === 'open-cover') finish();
  }, { signal });
  refs.seal.addEventListener('click', () => open(), { signal });
  refs.open.addEventListener('click', () => open(), { signal });
  refs.skip.addEventListener('click', () => {
    open({ immediate: true });
    if (refs.folio.dataset.state === 'opening') finish();
    refs.details.scrollIntoView({ behavior: 'auto', block: 'start' });
    refs.details.querySelector('a, button')?.focus({ preventScroll: true });
  }, { signal });
  refs.replay.addEventListener('click', () => {
    clearTimeout(fallback);
    refs.details.inert = true; refs.details.hidden = true;
    refs.letter.inert = true; refs.cover.inert = false;
    refs.shell.classList.remove('is-open');
    refs.folio.dataset.state = 'closed';
    refs.seal.disabled = false; refs.open.disabled = false; refs.open.hidden = false;
    window.scrollTo({ top: 0, behavior: 'auto' });
    refs.seal.focus({ preventScroll: true });
  }, { signal });
  preference.addEventListener('change', () => { if (preference.matches) finish(); }, { signal });
  signal.addEventListener('abort', () => clearTimeout(fallback), { once: true });
}

export function setupSectionMotion(refs, signal) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const refresh = () => {
    observer?.disconnect();
    const enabled = !preference.matches && 'IntersectionObserver' in window;
    refs.details.classList.toggle('motion-enabled', enabled);
    if (!enabled) return;
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
      }
    }, { threshold: .08 });
    refs.details.querySelectorAll('.reveal:not(.is-visible)').forEach(node => observer.observe(node));
  };
  refs.shell.addEventListener('classic:opened', refresh, { signal });
  preference.addEventListener('change', refresh, { signal });
  signal.addEventListener('abort', () => observer?.disconnect(), { once: true });
}
