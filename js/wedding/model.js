export function remaining(startsAt, now = Date.now()) {
 const total = Math.max(0, Math.floor((Date.parse(startsAt) - now) / 1000));
 return [Math.floor(total / 86400), Math.floor(total / 3600) % 24, Math.floor(total / 60) % 60, total % 60];
}
export function localDate(value, locale, options = {}) {
 return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short", ...options }).format(new Date(value));
}
export function validPasses(value, max) {
 return Number.isInteger(value) && value >= 1 && value <= max;
}
export function validate(data) {
 if (data?.schemaVersion !== 1) throw new Error("Versión de datos no compatible.");
 const text = value => typeof value === 'string' && value.trim().length > 0;
 const utc = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
 const image = value => value && text(value.src) && typeof value.alt === 'string';
 if (!text(data.id) || !text(data.locale) || !text(data.branding?.logo) || !text(data.branding?.favicon) || !text(data.branding?.url) || !text(data.branding?.name)) throw new Error('Faltan la identidad o la marca de la invitación.');
 if (!Array.isArray(data.event?.couple) || !data.event.couple.length || !data.event.couple.every(person => text(person.name))) throw new Error("Faltan los nombres.");
 if (!utc(data.event.startsAt) || !utc(data.rsvp?.deadlineAt)) throw new Error("La fecha debe ser ISO 8601 UTC.");
 if (!Number.isInteger(data.invitation?.maxPasses) || data.invitation.maxPasses < 0 || !text(data.invitation.id)) throw new Error("Número de pases o identificador inválido.");
 if (!text(data.event.headline) || !text(data.event.quote) || !text(data.story?.label) || !text(data.story?.title) || !text(data.story?.text)) throw new Error('Faltan los textos del evento.');
 if (!Array.isArray(data.event.schedule) || !data.event.schedule.length) throw new Error('Falta el itinerario.');
 const ids = new Set();
 for (const item of data.event.schedule) {
  if (!text(item.id) || ids.has(item.id) || !text(item.title) || !text(item.label)) throw new Error('Los momentos del itinerario deben tener un identificador único, título y etiqueta.');
  ids.add(item.id);
  if (!utc(item.startsAt)) throw new Error('Cada horario del itinerario debe estar en UTC.');
  if (![item.venue?.name, item.venue?.address, item.venue?.mapsUrl].every(text)) throw new Error('Faltan los datos de una ubicación.');
  if (item.venue.image && !image(item.venue.image)) throw new Error('Imagen de ubicación inválida.');
 }
 if (!image(data.media?.cover) || !Array.isArray(data.media?.gallery) || !data.media.gallery.every(image)) throw new Error('Faltan las imágenes o sus textos alternativos.');
 if (!text(data.dressCode?.title) || !image(data.dressCode?.illustration) || typeof data.dressCode.note !== 'string' || !Array.isArray(data.dressCode?.guidelines) || !data.dressCode.guidelines.every(text)) throw new Error('Código de vestimenta inválido.');
 if (!text(data.gifts?.message) || !Array.isArray(data.gifts?.registries) || !data.gifts.registries.every(item => text(item.label) && text(item.url))) throw new Error('Mesa de regalos inválida.');
 return data;
}
