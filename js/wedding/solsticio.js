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
 hero.append(art("blue-flower", "sol-flower sol-flower--hero"));
 const gallery = root.querySelector("#nosotros");
 gallery.querySelector("h2").textContent = copy.galleryTitle;
 gallery.querySelector(".quote").textContent = copy.galleryNote;
 const venue = root.querySelector("#lugar");
 venue.querySelector("h2").textContent = copy.venueTitle;
 venue.querySelector(".venue-grid>div").prepend(venue.querySelector("h2"));
 venue.querySelector(".button").textContent = copy.mapsLabel;
 venue.append(art("sprig", "sol-flower sol-flower--venue"));
 root.querySelector("#regalos").prepend(art("gift", "sol-gift"));
 root.querySelector("#rsvp").append(art("daisy", "sol-flower sol-flower--rsvp"));
}
