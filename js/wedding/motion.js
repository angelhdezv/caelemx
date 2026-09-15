// Progressive enhancement: content remains visible if observers are unavailable.
export function setupReveals(elements) {
 const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
 if(preference.matches || !("IntersectionObserver" in window)) return;
 let observer;
 const reveal = element => {element.classList.remove("reveal-pending");element.classList.add("is-revealed");observer?.unobserve(element);};
 const revealAll = () => elements.forEach(reveal);
 try {
  observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {if(entry.isIntersecting) reveal(entry.target);});
  },{threshold:0.08,rootMargin:"0px 0px -24px 0px"});
  elements.forEach((element,index) => {
   element.classList.add("reveal-item","reveal-pending");
   element.style.setProperty("--entry-x",index % 2 ? "64px" : "-64px");
   element.style.setProperty("--entry-delay",element.classList.contains("memory") ? (index % 3)*110+"ms" : "0ms");
   element.addEventListener("focusin",()=>reveal(element),{once:true});
   observer.observe(element);
  });
  preference.addEventListener("change",event=>{if(event.matches){revealAll();observer.disconnect();}});
  window.addEventListener("beforeprint",revealAll);
  window.addEventListener("pageshow",event=>{if(event.persisted)revealAll();});
 } catch {revealAll();observer?.disconnect();}
}
