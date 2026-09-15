import { bouquet, meadowGround } from "./botanicals.js";

function art(name, className) {
 const image = document.createElement("img");
 image.src = `/assets/wedding/solsticio/${name}.svg`;
 image.alt = ""; image.setAttribute("aria-hidden", "true");
 image.className = className; return image;
}
function meadow(data, placement) {
 const layer = document.createElement("div");
 layer.className = `sol-garden sol-garden--${placement}`;
 layer.setAttribute("aria-hidden", "true");
 layer.append(meadowGround());
 for (const side of ["left", "right"]) {
  const slot = document.createElement("div"); slot.className = `sol-garden-side sol-garden-side--${side}`;
  const image = document.createElement("img");
  image.src = data.presentation.solsticio.artwork.border;
  image.alt = ""; image.width = 1024; image.height = 1536;
  image.decoding = "async"; image.loading = placement === "hero" ? "eager" : "lazy";
  image.className = "sol-garden-image"; slot.append(image); layer.append(slot);
 }
 return layer;
}
export function enhanceSolsticio(root, data) {
 const copy = data.presentation.solsticio;
 const hero = root.querySelector("#portada");
 hero.querySelector(".rings").remove();
 const title = hero.querySelector("h1"); title.replaceChildren();
 data.event.couple.forEach((person,index) => {
  const line = document.createElement("span");
  line.textContent = (index ? "& " : "") + person.name; title.append(line);
 });
 const content = document.createElement("div"); content.className = "sol-cover-content";
 content.append(art("sun", "sol-sun"), ...hero.children);
 title.after(content.querySelector("time"));
 hero.append(meadow(data, "hero"), content, art("butterfly", "sol-butterfly"));
 const note = document.createElement("p"); note.className = "sol-margin-note"; note.textContent = copy.heroNote; hero.append(note);

 const gallery = root.querySelector("#nosotros");
 gallery.querySelector("h2").textContent = copy.galleryTitle;
 gallery.querySelector(".quote").textContent = copy.galleryNote;
 const heading = document.createElement("header"); heading.className = "sol-story-heading";
 heading.append(gallery.querySelector("h2"), gallery.querySelector(".quote")); gallery.prepend(heading);
 [...gallery.querySelectorAll(".gallery img")].forEach((image,index) => {
  const metadata = data.media.gallery[index];
  const frame = document.createElement("figure"); frame.className = "sol-memory";
  const crop = document.createElement("div"); crop.className = "sol-photo-window";
  image.replaceWith(frame); crop.append(image); frame.append(crop);
  image.width = 1536; image.height = 1024;
  image.style.objectPosition = metadata.position || "center";
  if (metadata.crop) {
   image.style.setProperty("--photo-scale", String(metadata.crop.scale));
   image.style.setProperty("--photo-origin", metadata.crop.origin);
  }
  if (metadata.caption) {
   const caption = document.createElement("figcaption"); caption.textContent = metadata.caption; frame.append(caption);
  }
 });
 gallery.append(art("sprig", "sol-story-sprig"));

 const venue = root.querySelector("#lugar");
 venue.querySelector("h2").textContent = copy.venueTitle;
 venue.querySelector(".venue-grid>div").prepend(venue.querySelector("h2"));
 venue.querySelector(".button").textContent = copy.mapsLabel;
 venue.append(bouquet("foliage", "sol-venue-sprig"));
 const gifts = root.querySelector("#regalos"); gifts.querySelector("h2").after(art("gift", "sol-gift"));
 const dress = root.querySelector("#vestimenta");
 const pair = document.createElement("div"); pair.className = "sol-details";
 dress.before(pair); pair.append(dress, gifts);

 const rsvp = root.querySelector("#rsvp");
 const rsvpContent = document.createElement("div"); rsvpContent.className = "sol-rsvp-content";
 rsvpContent.append(...rsvp.children); rsvp.append(meadow(data, "closing"), rsvpContent);
 root.addEventListener("attendanceconfirmed", event => {
  const status = rsvp.querySelector(".rsvp-status");
  status.prepend(bouquet("bloom", "sol-confirmation-flower"));
  status.querySelector("strong").textContent = copy.acceptedTitle;
  status.querySelector("p").textContent = `${copy.acceptedMessage} · ${event.detail.attendees} ${event.detail.attendees === 1 ? "persona" : "personas"}`;
  rsvp.classList.add("sol-confirmed");
 }, {once:true});
}
