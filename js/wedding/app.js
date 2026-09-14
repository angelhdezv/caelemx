import { getInvitation, confirmAttendance } from "./service.js";
import { remaining, localDate } from "./model.js";
const root = document.querySelector("#invitation");
const el = (tag, text, cls) => {
 const node = document.createElement(tag);
 if (text != null) node.textContent = text;
 if (cls) node.className = cls;
 return node;
};
function safeUrl(value) {
 const url = new URL(value, location.href);
 if (!["http:", "https:"].includes(url.protocol)) throw new Error("Enlace no permitido.");
 return url.href;
}
function link(text, href, cls = "button") {
 const a = el("a", text, cls); a.href = safeUrl(href);
 if (new URL(a.href).origin !== location.origin) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
 return a;
}
function photo(image, eager = false) {
 const img = el("img"); img.src = safeUrl(image.src); img.alt = image.alt;
 img.loading = eager ? "eager" : "lazy"; img.decoding = "async";
 img.addEventListener("error", () => { img.classList.add("image-unavailable"); }, {once:true});
 return img;
}
function section(id, label) {
 const s = el("section", null, "section"); s.id = id;
 const h = el("h2", label, "eyebrow"); h.id = id + "-title"; s.setAttribute("aria-labelledby", h.id); s.append(h);
 return s;
}
try {
 const data = await getInvitation();
 const editorial = document.body.dataset.template === "editorial";
 const names = data.event.couple.map(p => p.name).join(editorial ? " y " : " & ");
 document.title = names + " · Invitación de boda | Cáele.mx";
 document.querySelector('link[rel="icon"]').href = safeUrl(data.branding.favicon);
 const nav = el("nav", null, "invitation-nav"); nav.setAttribute("aria-label", "Secciones de la invitación");
 for (const [id, label] of [["portada","Inicio"],["nosotros","Nosotros"],["lugar","Detalles"],["rsvp","Confirmar"]]) nav.append(link(label,"#" + id,""));
 root.append(nav);
 const hero = section("portada", data.event.headline); hero.classList.add("cover");
 if (editorial) hero.prepend(photo(data.media.cover,true));
 else { const rings = el("div", "○○", "rings"); rings.setAttribute("aria-hidden","true"); hero.append(rings); }
 hero.append(el("h1",names),el("p",data.event.quote,"quote"));
 const date = el("time",localDate(data.event.startsAt,data.locale)); date.dateTime = data.event.startsAt; hero.append(date);
 hero.append(el("p","Fecha y hora en tu zona: " + Intl.DateTimeFormat().resolvedOptions().timeZone,"timezone"));
 root.append(hero);
 const countdown = section("cuenta-regresiva","Falta poco para encontrarnos");
 const digits = el("div",null,"countdown");
 const values = ["Días","Horas","Min","Seg"].map(label => { const cell = el("div"); const value = el("span","00"); cell.append(value,el("small",label)); digits.append(cell); return value; });
 countdown.append(digits); root.append(countdown);
 const tick = () => { remaining(data.event.startsAt).forEach((n,i) => values[i].textContent = String(n).padStart(2,"0")); };
 tick(); const interval = setInterval(tick,1000);
 window.addEventListener("pagehide",() => clearInterval(interval),{once:true});
 window.addEventListener("pageshow",e => { if(e.persisted) location.reload(); });
 const gallery = section("nosotros","Nosotros"); gallery.append(el("p","Misma historia. Más aventuras.","quote"));
 const grid = el("div",null,"gallery"); data.media.gallery.forEach(img => grid.append(photo(img))); gallery.append(grid); root.append(gallery);
 const venue = section("lugar","La celebración");
 const venueGrid = el("div",null,"venue-grid"); venueGrid.append(photo(data.event.venue.image));
 const details = el("div"); details.append(el("h3",data.event.venue.name),el("p",data.event.venue.address),el("p",localDate(data.event.startsAt,data.locale)),link("Ver en Google Maps",data.event.venue.mapsUrl));
 venueGrid.append(details); venue.append(venueGrid); root.append(venue);
 const dress = section("vestimenta","Código de vestimenta"); dress.append(el("h3",data.dressCode.title));
 const illustration = photo(data.dressCode.illustration); illustration.className = "attire"; dress.append(illustration);
 const guidelines = el("ul",null,"guidelines"); data.dressCode.guidelines.forEach(item => guidelines.append(el("li",item))); dress.append(guidelines,el("p",data.dressCode.note,"quote")); root.append(dress);
 const gifts = section("regalos","Mesa de regalos"); gifts.append(el("p",data.gifts.message));
 const registries = el("div",null,"registries"); data.gifts.registries.forEach(registry => registries.append(link(registry.label,registry.url))); gifts.append(registries); root.append(gifts);
 const rsvp = section("rsvp","¿Nos acompañas?");
 rsvp.append(el("p","Tienes " + data.invitation.maxPasses + " pases reservados"));
 const form = el("form"); const label = el("label","Personas que asistirán"); label.htmlFor = "attendees";
 const select = el("select"); select.id = "attendees"; select.name = "attendees"; select.required = true;
 for(let n = 1; n <= data.invitation.maxPasses; n++) { const option = el("option",String(n)); option.value = String(n); select.append(option); }
 select.value = String(data.invitation.maxPasses);
 const button = el("button","Confirmar asistencia","button primary"); button.type = "submit";
 const status = el("div",null,"rsvp-status"); status.setAttribute("role","status"); status.setAttribute("aria-live","polite");
 const expired = Date.now() >= Date.parse(data.rsvp.deadlineAt);
 if(expired || !data.invitation.maxPasses) { button.disabled = true; select.disabled = true; status.textContent = expired ? "El periodo de confirmación terminó." : "Esta invitación no tiene pases asignados."; }
 form.append(label,select,button); rsvp.append(form,status,el("p","Confirma antes del " + localDate(data.rsvp.deadlineAt,data.locale),"deadline"),el("p","Demostración: no se enviará una confirmación real.","demo-note"));
 form.addEventListener("submit",async event => {
  event.preventDefault(); button.disabled = true;
  try {
   const result = await confirmAttendance(data,Number(select.value));
   form.hidden = true; status.classList.add("accepted");
   status.append(el("strong","✓ ¡Asistencia confirmada!"),el("p","Te esperamos · " + result.attendees + (result.attendees === 1 ? " persona" : " personas")));
  } catch(error) { status.textContent = error.message; button.disabled = false; }
 });
 root.append(rsvp);
 const footer = document.querySelector("#brand-footer");
 const logo = photo({src:data.branding.logo,alt:data.branding.name}); const home = link("",data.branding.url,"footer-logo"); home.append(logo);
 footer.append(el("p","Developed by","eyebrow"),el("hr"),home,el("p",data.branding.tagline),el("small","© " + new Date().getFullYear() + " " + data.branding.name));
} catch(error) {
 root.replaceChildren(el("h1","No pudimos cargar la invitación"),el("p","Intenta recargar la página."),link("Volver al catálogo","/catalogo/boda/"));
 console.error(error);
}
