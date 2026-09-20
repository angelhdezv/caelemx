import { safeURL } from './model.js';

// Event content is always textContent, including names and personalized messages.
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function button(className, text) {
  const node = el('button', className, text);
  node.type = 'button';
  return node;
}

export function link(className, text, url, external = false) {
  const node = el('a', className, text);
  node.href = safeURL(url);
  if (external) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
  return node;
}

export function ornament(type) {
  const node = el('span', `ornament ornament--${type}`);
  node.setAttribute('aria-hidden', 'true');
  return node;
}

export function paperCard(className = '', { corners = false, tag = 'section' } = {}) {
  const card = el(tag, `paper-card ${className}`.trim());
  if (corners) {
    for (const position of ['tl','tr','bl','br']) card.append(ornament(`corner corner--${position}`));
  }
  return card;
}
