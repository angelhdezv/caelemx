import { weddingData } from "./data.js";
import { validate, validPasses } from "./model.js";
// Replace these two functions with the API adapter. Keep credentials and authorization on the server.
export async function getInvitation(template) {
 if (template === "solsticio") {
  const { solsticioData } = await import("./solsticio-data.js");
  return validate(JSON.parse(JSON.stringify(solsticioData)));
 }
 return validate(JSON.parse(JSON.stringify(weddingData)));
}
export async function confirmAttendance(data, attendees) {
 if (data.rsvp.mode !== "demo") throw new Error("Servicio de confirmación no configurado.");
 if (!validPasses(attendees, data.invitation.maxPasses)) throw new Error("Selecciona un número válido de asistentes.");
 if (Date.now() >= Date.parse(data.rsvp.deadlineAt)) throw new Error("El periodo de confirmación terminó.");
 return { invitationId: data.invitation.id, status: "accepted", attendees, confirmedAt: new Date().toISOString(), simulated: true };
}
