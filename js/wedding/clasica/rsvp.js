import { confirmAttendance } from '../service.js';
import { interpolate } from './model.js';
import { el } from './dom.js';

export function setupRSVP(refs, data, signal) {
  const copy = data.presentation.clasica.copy, max = data.invitation.maxPasses;
  const sync = () => {
    refs.minus.disabled = Number(refs.select.value) <= 1 || refs.select.disabled;
    refs.plus.disabled = Number(refs.select.value) >= max || refs.select.disabled;
  };
  const step = delta => {
    refs.select.value = String(Math.min(max, Math.max(1, Number(refs.select.value) + delta)));
    refs.select.dispatchEvent(new Event('change', { bubbles: true }));
  };
  refs.minus.addEventListener('click', () => step(-1), { signal });
  refs.plus.addEventListener('click', () => step(1), { signal });
  refs.select.addEventListener('change', sync, { signal });
  sync();
  const available = () => {
    const expired = Date.now() >= Date.parse(data.rsvp.deadlineAt);
    if (!max || expired) {
      refs.form.hidden = true;
      refs.message.textContent = max ? copy.expired : copy.noPasses;
      return false;
    }
    return true;
  };
  available();
  refs.form.addEventListener('submit', async event => {
    event.preventDefault();
    if (refs.submit.disabled || !available() || !refs.form.reportValidity()) return;
    refs.submit.disabled = true; refs.select.disabled = true;
    refs.submit.textContent = copy.confirming; sync();
    try {
      const result = await confirmAttendance(data, Number(refs.select.value));
      if (signal.aborted) return;
      refs.form.hidden = true; refs.message.textContent = '';
      refs.result.replaceChildren(el('h3', '', copy.confirmedTitle), el('p', '', interpolate(copy.confirmed, {
        count: result.attendees,
        places: result.attendees === 1 ? copy.confirmedSingular : copy.confirmedPlural
      })));
      refs.result.hidden = false;
      refs.result.focus({ preventScroll: true });
    } catch (error) {
      if (signal.aborted) return;
      refs.message.textContent = error.message;
      refs.submit.disabled = false; refs.select.disabled = false; refs.submit.textContent = copy.confirm; sync();
    }
  }, { signal });
}
