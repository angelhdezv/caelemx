import { getInvitation, confirmAttendance } from './service.js';
import { remaining } from './model.js';

const root = document.querySelector('#invitation');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const safeURL = value => { const url = new URL(value, location.href); if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Enlace no válido.'); return escape(url.href); };
const photo = (item, eager = false) => `<img src="${safeURL(item.src)}" alt="${escape(item.alt)}" width="1200" height="800" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const flowers = '<img class="flowers" src="/assets/wedding/bordado/garland.webp" alt="" width="1536" height="512" aria-hidden="true">';
const bird = side => `<span class="bird bird--${side}" aria-hidden="true"><img src="/assets/wedding/bordado/bird.webp" alt="" width="256" height="256"></span>`;

try {
 const data = await getInvitation('bordado');
 const { event, media, story, dressCode, gifts, invitation, rsvp } = data;
 document.title = `${event.couple.map(person => person.name).join(' & ')} · Bordado`;
 const format = (value, options) => new Intl.DateTimeFormat(data.locale, options).format(new Date(value));
 const date = new Date(event.startsAt);
 const fullDate = format(date, { dateStyle: 'full', timeStyle: 'short' });
 const datePieces = ['day', 'month', 'year'].map(part => format(date, { [part]: part === 'month' ? 'short' : 'numeric' }));
 root.innerHTML = `
  <section class="hero" aria-labelledby="couple-names">
   <div class="hero-copy"><p class="eyebrow">${escape(event.headline)}</p><h1 id="couple-names">${event.couple.map(person => `<span>${escape(person.name)}</span>`).join('<i>&amp;</i>')}</h1><p class="love-note">${escape(event.quote)}</p></div>
   <time class="date-ribbon" datetime="${escape(event.startsAt)}" aria-label="${escape(fullDate)}">${datePieces.map(piece => `<span>${escape(piece)}</span>`).join('')}<small>${escape(format(date, { timeStyle: 'short' }))}</small></time>
   <div class="hero-embroidery">${flowers}${bird('left')}${bird('right')}</div>
   <p class="countdown" aria-label="Cuenta regresiva"><span id="countdown-days"></span><small id="countdown-clock"></small></p>
  </section>
  <section class="story" aria-labelledby="story-title"><figure class="story-photo">${photo(media.cover, true)}<figcaption>${escape(story.label)}</figcaption></figure><div class="story-chapter"><div class="chapter-flower" aria-hidden="true">${flowers}</div><div><h2 id="story-title">${escape(story.title)}</h2><p>${escape(story.text)}</p></div></div><div class="contact-strip">${media.gallery.map((item, index) => `<figure class="reveal" style="--order:${index}">${photo(item)}</figure>`).join('')}</div></section>
  <div class="celebration-layout"><section class="itinerary" aria-label="Lugares y horarios"><div class="itinerary-thread" aria-hidden="true"><span></span></div>${event.schedule.map(item => `<article><span class="thread-flower" aria-hidden="true">✳</span><p class="eyebrow">${escape(item.label)}</p><h2>${escape(item.title)}</h2><p><time datetime="${escape(item.startsAt)}">${escape(format(item.startsAt, { dateStyle: 'medium', timeStyle: 'short' }))}</time><br>${escape(item.venue.name)}</p><p class="address">${escape(item.venue.address)}</p><a class="stitched-link" href="${safeURL(item.venue.mapsUrl)}" target="_blank" rel="noopener noreferrer">Ver ubicación <span aria-hidden="true">↗</span></a></article>`).join('')}</section>
  <section class="details" aria-labelledby="details-title"><h2 id="details-title">Los pequeños detalles</h2>
   <div class="detail-item"><h3><button class="detail-toggle" aria-expanded="false" aria-controls="attire-content">Cómo vestir<small>${escape(dressCode.title)}</small><span aria-hidden="true">+</span></button></h3><div class="detail-panel" id="attire-content" inert><div><ul>${dressCode.guidelines.map(line => `<li>${escape(line)}</li>`).join('')}</ul><p>${escape(dressCode.note)}</p></div></div></div>
   <div class="detail-item"><h3><button class="detail-toggle" aria-expanded="false" aria-controls="gifts-content">Mesa de regalos<small>${escape(gifts.message)}</small><span aria-hidden="true">+</span></button></h3><div class="detail-panel" id="gifts-content" inert><div class="gift-links">${gifts.registries.map(registry => `<a class="stitched-link" href="${safeURL(registry.url)}" target="_blank" rel="noopener noreferrer">${escape(registry.label)} ↗</a>`).join('')}</div></div></div>
  </section></div>
  <section class="rsvp-wrap" aria-labelledby="rsvp-title"><div class="rsvp-card reveal"><span class="corner tl" aria-hidden="true">×</span><span class="corner tr" aria-hidden="true">×</span><span class="corner bl" aria-hidden="true">×</span><span class="corner br" aria-hidden="true">×</span><p class="eyebrow">Guardamos un lugar para ti</p><h2 id="rsvp-title">¿Vienes a celebrar?</h2><p>Tienes ${invitation.maxPasses} ${invitation.maxPasses === 1 ? 'pase reservado' : 'pases reservados'}.</p>
   <form id="rsvp-form"><label for="attendees">Personas que asistirán</label><div class="pass-stepper"><button type="button" id="minus" aria-label="Quitar un asistente">−</button><input id="attendees" name="attendees" type="number" min="1" max="${invitation.maxPasses}" value="${Math.max(1, invitation.maxPasses)}" step="1" inputmode="numeric" required><button type="button" id="plus" aria-label="Agregar un asistente">+</button></div><button class="confirm" type="submit">Confirmar asistencia <span aria-hidden="true">→</span></button><p class="deadline">Confirma antes del ${escape(format(rsvp.deadlineAt, { dateStyle: 'long' }))}.</p><small class="demo-note">Invitación de muestra · Confirmación simulada</small></form>
   <div id="rsvp-result" role="status" tabindex="-1" hidden><svg class="stitched-check" viewBox="0 0 60 60" aria-hidden="true"><path d="m12 30 12 12 25-26"/></svg><h3>¡Asistencia confirmada!</h3><p></p></div><p id="rsvp-error" role="alert"></p>
  </div></section><footer class="signature"><div class="signature-embroidery">${flowers}${bird('footer')}</div><a href="${safeURL(data.branding.url)}">— ${escape(data.branding.name)} —</a></footer>`;

 const updateCountdown = () => {
  const [days, hours, minutes, seconds] = remaining(event.startsAt);
  document.querySelector('#countdown-days').textContent = Date.now() >= date.getTime() ? 'Llegó el día de nuestro sí' : `${days} ${days === 1 ? 'día' : 'días'} para nuestro sí`;
  document.querySelector('#countdown-clock').textContent = `${String(hours).padStart(2, '0')} h · ${String(minutes).padStart(2, '0')} min · ${String(seconds).padStart(2, '0')} s`;
 };
 updateCountdown();
 const timer = setInterval(updateCountdown, 1000);
 window.addEventListener('pagehide', () => clearInterval(timer), { once: true });

 document.querySelectorAll('.detail-toggle').forEach(button => button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  panel.inert = !open;
  panel.classList.toggle('is-open', open);
 }));
 const form = document.querySelector('#rsvp-form');
 const input = document.querySelector('#attendees');
 const minus = document.querySelector('#minus');
 const plus = document.querySelector('#plus');
 const sync = () => { minus.disabled = Number(input.value) <= 1; plus.disabled = Number(input.value) >= invitation.maxPasses; };
 minus.addEventListener('click', () => { input.stepDown(); sync(); });
 plus.addEventListener('click', () => { input.stepUp(); sync(); });
 input.addEventListener('input', sync); sync();
 if (!invitation.maxPasses || Date.now() >= Date.parse(rsvp.deadlineAt)) {
  form.hidden = true;
  document.querySelector('#rsvp-error').textContent = invitation.maxPasses ? 'El periodo de confirmación terminó.' : 'No hay pases disponibles en esta invitación.';
 }
 form.addEventListener('submit', async event => {
  event.preventDefault(); if (!form.reportValidity()) return;
  const submit = form.querySelector('[type="submit"]'); submit.disabled = true;
  try {
   const result = await confirmAttendance(data, Number(input.value));
   form.hidden = true;
   const accepted = document.querySelector('#rsvp-result'); accepted.hidden = false;
   accepted.querySelector('p').textContent = `${result.attendees} ${result.attendees === 1 ? 'lugar confirmado' : 'lugares confirmados'}. ¡Te esperamos!`;
   document.querySelector('#rsvp-error').textContent = '';
   accepted.focus({ preventScroll: true });
  } catch (error) { document.querySelector('#rsvp-error').textContent = error.message; submit.disabled = false; }
 });

 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 let observer;
 const configureMotion = () => {
  observer?.disconnect();
  document.documentElement.classList.toggle('motion-enabled', !motion.matches && 'IntersectionObserver' in window);
  if (motion.matches || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(entries => entries.forEach(entry => {
   if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(element => observer.observe(element));
 };
 configureMotion(); motion.addEventListener('change', configureMotion);
 const itinerary = document.querySelector('.itinerary');
 let frame = 0;
 const updateThread = () => { frame = 0; const rect = itinerary.getBoundingClientRect(); const progress = Math.max(0, Math.min(1, (innerHeight * .75 - rect.top) / rect.height)); itinerary.style.setProperty('--progress', motion.matches ? 1 : progress); };
 const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateThread); };
 addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); motion.addEventListener('change', updateThread); updateThread();
} catch (error) {
 root.innerHTML = '<p class="loading" role="alert">No pudimos cargar la invitación. Intenta recargar la página.</p>';
 console.error('Bordado:', error);
}
