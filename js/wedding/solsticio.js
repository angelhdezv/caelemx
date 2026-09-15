import { bouquet } from "./botanicals.js";
function art(name, className) {
 const image = document.createElement("img");
 image.src = `/assets/wedding/solsticio/${name}.svg`;
 image.alt = ""; image.setAttribute("aria-hidden", "true");
 image.className = className; return image;
}
export function enhanceSolsticio(root, data) {
 const copy = data.presentation.solsticio;
 const hero = root.querySelector("#portada");
 hero.querySelector(".rings").remove();
 hero.prepend(art("sun", "sol-sun"));
 const title = hero.querySelector("h1"); title.replaceChildren();
 data.event.couple.forEach((person,index) => {
  const line = document.createElement("span");
  line.textContent = (index ? "& " : "") + person.name; title.append(line);
 });
 title.after(hero.querySelector("time"));
 const meadow = document.createElement("div");
 meadow.className = "sol-hero-meadow"; meadow.setAttribute("aria-hidden","true");
 meadow.append(bouquet("meadow", "sol-meadow-full"), bouquet("airy", "sol-meadow-airy"), bouquet("foliage", "sol-meadow-tiny"));
 hero.append(meadow);
 const gallery = root.querySelector("#nosotros");
 gallery.querySelector("h2").textContent = copy.galleryTitle;
 gallery.querySelector(".quote").textContent = copy.galleryNote;
 const venue = root.querySelector("#lugar");
 venue.querySelector("h2").textContent = copy.venueTitle;
 venue.querySelector(".venue-grid>div").prepend(venue.querySelector("h2"));
 venue.querySelector(".button").textContent = copy.mapsLabel;
 venue.append(bouquet("foliage", "sol-flower sol-flower--venue"));
 root.querySelector("#regalos").prepend(art("gift", "sol-gift"));
 root.querySelector("#rsvp").append(bouquet("airy", "sol-flower sol-flower--rsvp"), bouquet("meadow", "sol-flower sol-flower--rsvp-left"));
 // Dedicated ornament rows reserve space for the stems and their moving edges.
 for (const id of ["nosotros", "vestimenta"]) {
  const border = document.createElement("div");
  border.className = "sol-bouquet-border";
  border.setAttribute("aria-hidden", "true");
  border.append(bouquet(id === "nosotros" ? "airy" : "foliage", "sol-flower sol-bouquet--left"), bouquet("meadow", "sol-flower sol-bouquet--center"), bouquet(id === "nosotros" ? "foliage" : "airy", "sol-flower sol-bouquet--right"));
  root.querySelector("#" + id).after(border);
 }

 const images = [...gallery.querySelectorAll(".gallery img")];
 images.forEach((image,index) => {
  const frame = document.createElement("figure");
  frame.className = "sol-memory";
  image.replaceWith(frame); frame.append(image);
  const metadata = data.media.gallery[index];
  image.style.objectPosition = metadata.position || "center";
  if(metadata.detail) {
   const crop = document.createElement("div"); crop.className = "sol-detail-crop";
   image.replaceWith(crop); crop.append(image);
  }
  if(metadata.caption) {
   const caption = document.createElement("figcaption");
   caption.textContent = metadata.caption; frame.append(caption);
  }
 });
 root.addEventListener("attendanceconfirmed", event => {
  const status = root.querySelector(".rsvp-status");
  const flower = bouquet("bloom", "sol-confirmation-flower");
  status.prepend(flower);
  status.querySelector("strong").textContent = copy.acceptedTitle;
  status.querySelector("p").textContent = `${copy.acceptedMessage} · ${event.detail.attendees} ${event.detail.attendees === 1 ? "persona" : "personas"}`;
  root.querySelector("#rsvp").classList.add("sol-confirmed");
 }, {once:true});

}
