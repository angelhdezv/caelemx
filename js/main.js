'use strict';

const yearElement = document.querySelector('[data-current-year]');
const headerElement = document.querySelector('[data-site-header]');

if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
}

const updateHeader = () => {
    headerElement?.classList.toggle('is-scrolled', window.scrollY > 12);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
