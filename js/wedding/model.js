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
 if (data.schemaVersion !== 1) throw new Error("Versión de datos no compatible.");
 for (const value of [data.event.startsAt, data.rsvp.deadlineAt]) {
  if (!/Z$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error("La fecha debe ser ISO 8601 UTC.");
 }
 if (!Number.isInteger(data.invitation.maxPasses) || data.invitation.maxPasses < 0) throw new Error("Número de pases inválido.");
 if (!data.event.couple.length) throw new Error("Faltan los nombres.");
 return data;
}
