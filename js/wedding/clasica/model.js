// Clásica extends the shared invitation contract without coupling other templates
// to its paper, family or interaction settings. Pure functions are reusable in tests.
const HEX = /^#[\da-f]{6}$/i;
const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;

export function safeURL(value, base = globalThis.location?.href || 'https://caele.mx/') {
  const url = new URL(value, base);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Enlace no permitido.');
  return url.href;
}

export function validateClasica(data) {
  const config = data.presentation?.clasica;
  if (!config) throw new Error('Falta la configuración de Clásica.');
  for (const key of ['primary', 'paper', 'ink', 'gold', 'goldLight']) {
    if (!HEX.test(config.theme?.[key])) throw new Error(`Color no válido: ${key}. Usa #RRGGBB.`);
  }
  for (const key of ['sealFlowers', 'corner', 'rings', 'paper']) {
    if (!nonEmpty(config.assets?.[key])) throw new Error(`Falta el recurso ${key}.`);
    safeURL(config.assets[key]);
  }
  if (!config.copy || !Object.values(config.copy).every(value =>
    nonEmpty(value) || (Array.isArray(value) && value.length === 4 && value.every(nonEmpty)))) {
    throw new Error('Los textos de Clásica están incompletos.');
  }
  const copyKeys = ['templateName','greeting','open','openAccessible','opening','reopen','saveTheDate',
    'familyIntro','celebrate','menu','back','interest','emailSubject','skip','maps','localTime',
    'countdownTitle','countdownComplete','passesTitle','reserved','passSingular','passPlural','passNote',
    'attendees','attendeeSingular','attendeePlural','minus','plus','confirm','confirming','deadline',
    'demoNote','confirmedTitle','confirmed','confirmedSingular','confirmedPlural','expired','noPasses',
    'dressTitle','more','less','giftsTitle','footerCredit','loading','error','retry'];
  if (!copyKeys.every(key => nonEmpty(config.copy[key])) || !Array.isArray(config.copy.countdownLabels) || config.copy.countdownLabels.length !== 4) {
    throw new Error('Faltan etiquetas de la interfaz.');
  }
  if (!['countdown','family','dressCode','gifts','story'].every(key => typeof config.sections?.[key] === 'boolean')) {
    throw new Error('Configura las secciones con true o false.');
  }
  if (!nonEmpty(data.invitation.guestName) || data.invitation.maxPasses > 100) {
    throw new Error('Invitado o límite de pases inválido.');
  }
  // The catalog uses the existing demo adapter. An unsupported mode must never
  // render a button that claims to send a real response.
  if (data.rsvp.mode !== 'demo') throw new Error('Configura un adaptador antes de activar confirmaciones reales.');
  new Intl.DateTimeFormat(data.locale, { timeZone: data.event.timeZone });
  safeURL(data.branding.url); safeURL(data.branding.favicon);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.branding.contactEmail)) throw new Error('Correo de contacto inválido.');
  data.event.schedule.forEach(item => safeURL(item.venue.mapsUrl));
  data.gifts.registries.forEach(item => safeURL(item.url));
  if (config.sections.family) {
    const family = config.family;
    if (!family || !['title','parentsLabel','sponsorsLabel'].every(key => nonEmpty(family[key])) ||
      !Array.isArray(family.parents) || !family.parents.every(group => nonEmpty(group.label) &&
        Array.isArray(group.names) && group.names.length > 0 && group.names.every(nonEmpty)) ||
      !Array.isArray(family.sponsors) || !family.sponsors.every(nonEmpty)) {
      throw new Error('Datos de familias inválidos.');
    }
  }
  return data;
}

export function themeTokens(theme) {
  const mix = (hex, amount, target = 0) => '#' + hex.slice(1).match(/../g)
    .map(part => Math.round(parseInt(part, 16) * (1 - amount) + target * amount).toString(16).padStart(2, '0')).join('');
  return { primary: theme.primary, background: mix(theme.primary, .43), paper: theme.paper,
    ink: theme.ink, gold: theme.gold, 'gold-light': theme.goldLight,
    'gold-edge': mix(theme.gold, .24, 255), 'cover-light': mix(theme.primary, .07, 255) };
}

// Display dates in the visitor's time zone, consistently with the other templates.
// Calendar math stays in UTC after extracting that local day to avoid DST drift.
export function calendarFor(startsAt, locale, timeZone) {
  const options = { year: 'numeric', month: 'numeric', day: 'numeric', ...(timeZone ? { timeZone } : {}) };
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', options)
    .formatToParts(new Date(startsAt)).map(part => [part.type, part.value]));
  const year = Number(parts.year), month = Number(parts.month), day = Number(parts.day);
  const offset = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((offset + length) / 7) * 7 }, (_, index) => {
    const value = index - offset + 1;
    return value > 0 && value <= length ? value : null;
  });
  const weekdays = Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale,
    { weekday: 'narrow', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 10, index + 1))));
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', ...(timeZone ? { timeZone } : {}) }).format(new Date(startsAt));
  return { year, month, day, cells, weekdays, monthName };
}

export function interpolate(text, values) {
  return text.replace(/\{(\w+)\}/g, (token, key) => Object.hasOwn(values, key) ? String(values[key]) : token);
}
