// Sprite frames supply head turns and wing poses; CSS supplies a six-second flight.
export function setupBirds(root) {
 const birds = [...root.querySelectorAll('.bird')];
 const regions = [...root.querySelectorAll('.hero-embroidery, .signature-embroidery')];
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 const visible = new Set();
 const image = new Image();
 let loaded = false;
 let observer;
 let resizeObserver;
 let pendingFrame = 0;

 function measure() {
  const invitation = root.getBoundingClientRect();
  birds.forEach(bird => {
   const bounds = bird.getBoundingClientRect();
   const distance = bird.classList.contains('bird--right')
    ? bounds.right - invitation.left + bounds.width
    : invitation.right - bounds.left + bounds.width;
   bird.style.setProperty('--flight-distance', `${Math.ceil(distance)}px`);
   bird.style.setProperty('--flight-lift', `${Math.min(32, bounds.width * .3)}px`);
  });
 }
 function update() {
  regions.forEach(region => {
   const active = loaded && !motion.matches && !document.hidden && visible.has(region);
   region.classList.toggle('birds-active', active);
  });
 }
 function requestMeasure() {
  if (pendingFrame) return;
  pendingFrame = requestAnimationFrame(() => { pendingFrame = 0; measure(); });
 }
 if ('IntersectionObserver' in window) {
  observer = new IntersectionObserver(entries => {
   entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
   update();
  }, { threshold: 0 });
  regions.forEach(region => observer.observe(region));
 } else regions.forEach(region => visible.add(region));
 if ('ResizeObserver' in window) {
  resizeObserver = new ResizeObserver(requestMeasure);
  resizeObserver.observe(root);
 }
 image.onload = () => {
  loaded = true;
  root.classList.add('birds-ready');
  measure();
  update();
 };
 // The original bird remains visible if the sprite asset is unavailable.
 image.src = '/assets/wedding/bordado/bird-poses.webp';
 measure();
 addEventListener('resize', requestMeasure);
 addEventListener('pageshow', requestMeasure);
 document.addEventListener('visibilitychange', update);
 motion.addEventListener('change', update);

 return () => {
  observer?.disconnect(); resizeObserver?.disconnect();
  cancelAnimationFrame(pendingFrame);
  removeEventListener('resize', requestMeasure);
  removeEventListener('pageshow', requestMeasure);
  document.removeEventListener('visibilitychange', update);
  motion.removeEventListener('change', update);
 };
}
