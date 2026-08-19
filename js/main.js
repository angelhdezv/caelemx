'use strict';

/**
 * Cáele.mx
 *
 * Client-side enhancements only.
 * Core content and navigation must continue working
 * when JavaScript is unavailable.
 */

const selectors = {
    currentYear: '[data-current-year]',
};

/**
 * Updates copyright year without making the footer
 * dependent on JavaScript.
 */
const updateCurrentYear = () => {
    const yearElement = document.querySelector(selectors.currentYear);

    if (!yearElement) {
        return;
    }

    yearElement.textContent = String(
        new Date().getFullYear(),
    );
};

/**
 * Application entry point.
 */
const init = () => {
    updateCurrentYear();
};

init();