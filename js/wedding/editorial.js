import { setupReveals } from "./motion.js";

function node(tag, text, className) {
 const element = document.createElement(tag);
 if (text != null) element.textContent = text;
 if (className) element.className = className;
 return element;
}
function flourish() {
 const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 300 100");
 svg.setAttribute("aria-hidden","true");
 svg.classList.add("editorial-flourish");
 const path = document.createElementNS(svg.namespaceURI,"path");
 path.setAttribute("d","M5 75 C70 8 170 18 235 53 C275 80 290 30 271 28 C250 26 250 55 271 64");
 path.setAttribute("pathLength","1"); svg.append(path);
 return svg;
}
export function enhanceEditorial(root, data) {
 const copy = data.presentation?.editorial || {};
 const cover = root.querySelector("#portada");
 const title = cover.querySelector("h1"); title.replaceChildren();
 data.event.couple.forEach((person,i) => {
  if(i) title.append(node("em","y","name-join"));
  title.append(node("span",person.name,"couple-name"));
 });
 const coverCopy = node("div",null,"cover-copy");
 [...cover.children].filter(child => child.tagName !== "IMG").forEach(child => coverCopy.append(child));
 cover.append(coverCopy);
 const signature = node("div",null,"cover-signature");
 signature.append(flourish(),node("p",copy.coverNote,"handwritten"));
 cover.append(signature);
 root.querySelector("#cuenta-regresiva h2").textContent = "Cada vez más cerca";

 const gallery = root.querySelector("#nosotros");
 gallery.querySelector("h2").textContent = copy.galleryTitle || "Nosotros";
 gallery.querySelector(".quote").textContent = copy.galleryNote || "";
 const images = [...gallery.querySelectorAll(".gallery img")];
 images.forEach((image,i) => {
  const figure = node("figure",null,"memory memory-" + (i+1));
  image.replaceWith(figure); figure.append(image);
  if(copy.photoNotes?.[i]) figure.append(node("figcaption",copy.photoNotes[i],"handwritten"));
 });
 gallery.append(flourish());

 const venue = root.querySelector("#lugar");
 const venueDetails = venue.querySelector(".venue-grid > div");
 venueDetails.prepend(venue.querySelector("h2"));
 const dress = root.querySelector("#vestimenta");
 const dressCopy = node("div",null,"dress-copy");
 dressCopy.append(dress.querySelector("h2"),node("p",copy.dressHeading,"editorial-heading"),dress.querySelector("h3"),dress.querySelector(".guidelines"),dress.querySelector(".quote"));
 dress.prepend(dressCopy); dress.append(flourish());

 const gifts = root.querySelector("#regalos");
 gifts.insertBefore(node("p",copy.giftsHeading,"editorial-heading"),gifts.firstChild);
 gifts.prepend(flourish());
 root.querySelector("#rsvp h2").after(node("p",copy.rsvpNote,"rsvp-intro"));
 const select = root.querySelector("#attendees");
 const stepper = node("div",null,"pass-stepper");
 stepper.setAttribute("role","group"); stepper.setAttribute("aria-label","Número de asistentes");
 const minus = node("button","−"); minus.type = "button"; minus.setAttribute("aria-label","Quitar un asistente");
 const plus = node("button","+"); plus.type = "button"; plus.setAttribute("aria-label","Agregar un asistente");
 const middle = node("div",null,"pass-value");
 select.before(stepper); middle.append(select,node("span","PERSONAS"));
 stepper.append(minus,middle,plus);
 const sync = () => {
  const n = Number(select.value);
  minus.disabled = select.disabled || n <= 1;
  plus.disabled = select.disabled || n >= data.invitation.maxPasses;
 };
 minus.addEventListener("click",()=>{select.value=String(Math.max(1,Number(select.value)-1));select.dispatchEvent(new Event("change",{bubbles:true}));});
 plus.addEventListener("click",()=>{select.value=String(Math.min(data.invitation.maxPasses,Number(select.value)+1));select.dispatchEvent(new Event("change",{bubbles:true}));});
 select.addEventListener("change",sync); sync();
 // Retain the real labelled select: native keyboard and screen-reader operation,
 // plus/minus controls and submit all use the same value.
 const targets = [
  ...root.querySelectorAll(".cover-copy,.cover-signature,.memory,.venue-grid>img,.venue-grid>div,.dress-copy,.attire,.editorial-flourish,#regalos>.editorial-heading,#regalos>.registries")
 ];
 setupReveals(targets);
}
