// One brand signature shared by every wedding template.
export function renderBrandFooter(footer, branding) {
 if (!footer) return;
 const element = (tag, className, text) => {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
 };
 const safeURL = value => {
  const url = new URL(value, location.href);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Enlace de marca no válido.');
  return url.href;
 };
 footer.className = 'invitation-footer';
 footer.setAttribute('aria-label', 'Desarrollado por Cáele');
 const credit = element('div', 'invitation-footer__credit');
 const home = element('a', 'invitation-footer__brand');
 home.href = safeURL(branding.url);
 home.setAttribute('aria-label', `${branding.name}, inicio`);
 const logo = element('img', 'invitation-footer__logo');
 logo.src = safeURL(branding.logo);
 logo.alt = branding.name;
 logo.width = 110;
 logo.height = 40;
 logo.loading = 'lazy';
 home.append(logo);
 credit.append(element('span', 'invitation-footer__label', 'Developed by'), home);
 const copy = element('div', 'invitation-footer__copy');
 copy.append(
  element('p', 'invitation-footer__tagline', branding.tagline || 'Invitaciones digitales para momentos especiales.'),
  element('small', 'invitation-footer__copyright', `© ${new Date().getFullYear()} ${branding.name}`)
 );
 footer.replaceChildren(credit, copy);
}
