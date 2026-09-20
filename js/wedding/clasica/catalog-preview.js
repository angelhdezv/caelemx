import { getInvitation } from '../service.js';
import { validateClasica, themeTokens, calendarFor, safeURL } from './model.js';

// The catalog thumbnail uses the very same event, color and PNGs as the invitation.
const preview = document.querySelector('[data-clasica-preview]');
if (preview) {
  try {
    const data = validateClasica(await getInvitation('clasica'));
    const config = data.presentation.clasica;
    const calendar = calendarFor(data.event.startsAt, data.locale);
    for (const [key, value] of Object.entries(themeTokens(config.theme))) {
      preview.style.setProperty(`--classic-${key}`, value);
    }
    preview.style.setProperty('--classic-texture', `url("${safeURL(config.assets.paper)}")`);
    preview.querySelector('[data-classic-couple]').textContent = data.event.couple.map(person => person.name).join(' & ');
    preview.querySelector('[data-classic-headline]').textContent = data.event.headline;
    preview.querySelector('[data-classic-day]').textContent = `${calendar.day} · ${calendar.year}`;
    preview.querySelector('[data-classic-month]').textContent = calendar.monthName;
    preview.querySelector('[data-classic-seal]').src = safeURL(config.assets.sealFlowers);
  } catch (error) {
    // Other catalog designs and the Clásica link remain usable when its JSON fails.
    console.error('[Clásica preview]', error);
  }
}
