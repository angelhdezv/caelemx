import { validate, validPasses } from "./model.js";
// Replace these two functions with the API adapter. Keep credentials and authorization on the server.
const sources = Object.freeze({
 minimalist: '/data/invitations/minimalista.json',
 minimalista: '/data/invitations/minimalista.json',
 editorial: '/data/invitations/editorial.json',
 solsticio: '/data/invitations/solsticio.json',
 bordado: '/data/invitations/bordado.json',
 clasica: '/data/invitations/clasica.json'
});
export async function getInvitation(template, { source, fetchImpl = globalThis.fetch } = {}) {
 if (!Object.hasOwn(sources, template)) throw new Error('Plantilla no compatible.');
 const url = new URL(source || sources[template], globalThis.location?.href || 'http://localhost/');
 if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Fuente de datos no permitida.');
 const response = await fetchImpl(url.href, { cache: 'no-cache' });
 if (!response.ok) throw new Error('No se pudieron cargar los datos de la invitación.');
 return validate(await response.json());
}
export async function confirmAttendance(data, attendees) {
 if (data.rsvp.mode !== "demo") throw new Error("Servicio de confirmación no configurado.");
 if (!validPasses(attendees, data.invitation.maxPasses)) throw new Error("Selecciona un número válido de asistentes.");
 if (Date.now() >= Date.parse(data.rsvp.deadlineAt)) throw new Error("El periodo de confirmación terminó.");
 return { invitationId: data.invitation.id, status: "accepted", attendees, confirmedAt: new Date().toISOString(), simulated: true };
}
