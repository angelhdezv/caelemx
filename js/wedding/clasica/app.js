import { getInvitation } from '../service.js';
import { remaining } from '../model.js';
import { safeURL, themeTokens, validateClasica } from './model.js';
import { renderInvitation } from './view.js';
import { setupOpening, setupSectionMotion } from './motion.js';
import { setupRSVP } from './rsvp.js';
import { el, button } from './dom.js';

const root = document.querySelector('#invitation');
let controller;

function applyPresentation(data) {
  const config = data.presentation.clasica;
  for (const [key, value] of Object.entries(themeTokens(config.theme))) {
    document.documentElement.style.setProperty(`--${key}`, value);
    document.body.style.setProperty(`--${key}`, value);
  }
  const assets = { 'paper-texture': config.assets.paper, 'corner-image': config.assets.corner, 'rings-image': config.assets.rings };
  for (const [key, value] of Object.entries(assets)) document.body.style.setProperty(`--${key}`, `url("${safeURL(value)}")`);
  document.documentElement.lang = data.locale;
  document.title = `${data.event.couple.map(person => person.name).join(' & ')} · ${config.copy.templateName} | ${data.branding.name}`;
  document.querySelector('meta[name="description"]').content = data.event.quote.replaceAll('\n', ' ');
  document.querySelector('meta[name="theme-color"]').content = themeTokens(config.theme).background;
  document.querySelector('link[rel="icon"]').href = safeURL(data.branding.favicon);
}

function setupCountdown(refs, data, signal) {
  if (!refs.countdown) return;
  let timer;
  const update = () => {
    const values = remaining(data.event.startsAt);
    values.forEach((value, index) => { refs.countdown.values[index].textContent = String(value).padStart(2, '0'); });
    if (Date.now() >= Date.parse(data.event.startsAt)) {
      refs.countdown.section.querySelector('.countdown-title').textContent = data.presentation.clasica.copy.countdownComplete;
      clearInterval(timer);
    }
  };
  update();
  if (Date.now() < Date.parse(data.event.startsAt)) timer = setInterval(update, 1000);
  document.addEventListener('visibilitychange', update, { signal });
  signal.addEventListener('abort', () => clearInterval(timer), { once: true });
}

function setupMenu(root, signal) {
  const menu = root.querySelector('.classic-menu');
  document.addEventListener('pointerdown', event => { if (!menu.contains(event.target)) menu.open = false; }, { signal });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); }
  }, { signal });
}

async function mount() {
  controller?.abort(); controller = new AbortController();
  const current = controller, signal = current.signal;
  try {
    const data = validateClasica(await getInvitation('clasica', { source: document.body.dataset.source }));
    if (signal.aborted) return;
    applyPresentation(data);
    const refs = renderInvitation(root, data);
    setupOpening(refs, data.presentation.clasica.copy, signal);
    setupSectionMotion(refs, signal);
    setupRSVP(refs.passes, data, signal);
    setupCountdown(refs, data, signal);
    setupMenu(root, signal);
    document.body.dataset.ready = 'true';
  } catch (error) {
    if (signal.aborted) return;
    // A malformed or missing JSON cannot supply its own fallback labels.
    const message = el('section', 'load-error');
    message.setAttribute('role', 'alert');
    message.append(el('p', '', 'No pudimos abrir esta invitación. Inténtalo de nuevo.'));
    const retry = button('gold-button', 'Volver a intentar');
    retry.addEventListener('click', mount, { once: true }); message.append(retry);
    root.replaceChildren(message); root.setAttribute('aria-busy', 'false');
    console.error('[Clásica]', error);
  }
}

addEventListener('pagehide', event => { if (!event.persisted) controller?.abort(); });
mount();
