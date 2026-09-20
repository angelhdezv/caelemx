// npm ci && npx playwright install chromium && npm run test:browser
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const base = path.resolve(__dirname, '..');
const out = path.join(base, 'test-results');
const url = 'http://127.0.0.1:8031/catalogo/boda/clasica/';
const source = JSON.parse(fs.readFileSync(path.join(base, 'data/invitations/clasica.json'), 'utf8'));
const report = [];
let browser, server;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function openPage(context) {
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date('2026-09-20T12:00:00Z'));
  await page.goto(url);
  await page.waitForSelector('body[data-ready="true"]');
  await page.evaluate(() => document.fonts.ready);
  return page;
}
async function assertFits(page) {
  const size = await page.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(size.scroll <= size.viewport, `Horizontal overflow: ${JSON.stringify(size)}`);
  assert.ok(await page.locator('.couple-names').evaluate(el => el.scrollWidth <= el.clientWidth + 1), 'Names overflow');
}
async function revealForScreenshot(page) {
  for (const card of await page.locator('.reveal').all()) {
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(800);
}

async function previewStyles(page) {
  return page.evaluate(() => {
    const selectors = ['.invitation-preview-header', '.invitation-preview-brand img',
      '.invitation-preview-breadcrumbs a', '.invitation-preview-actions', '.invitation-preview-back',
      '.invitation-preview-interest', '.invitation-footer', '.invitation-footer__logo',
      '.invitation-footer__tagline', '.invitation-footer__copyright'];
    const properties = ['backgroundColor', 'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderBottomWidth'];
    return Object.fromEntries(selectors.map(selector => {
      const style = getComputedStyle(document.querySelector(selector));
      return [selector, Object.fromEntries(properties.map(property => [property, style[property]]))];
    }));
  });
}

async function assertPreview(page) {
  for (const selector of ['.invitation-preview-header', '.invitation-preview-actions', '#brand-footer']) {
    assert.ok(await page.locator(selector).isVisible(), `${selector} must remain visible`);
    assert.ok(await page.locator(selector).evaluate(el => el.parentElement === document.body));
  }
  assert.deepEqual(await page.locator('.invitation-preview-breadcrumbs a').evaluateAll(links =>
    links.map(link => link.getAttribute('href'))), ['/catalogo/', '/catalogo/boda/']);
  assert.equal(await page.locator('.invitation-preview-breadcrumbs [aria-current]').innerText(), 'Clásica');
  assert.equal(await page.locator('.invitation-preview-back').getAttribute('href'), '/catalogo/boda/');
  assert.equal(await page.locator('.invitation-preview-interest').getAttribute('href'),
    `mailto:${source.branding.contactEmail}?subject=${encodeURIComponent(source.presentation.clasica.copy.emailSubject)}`);
  assert.equal(await page.locator('#brand-footer img').getAttribute('alt'), source.branding.name);
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  server = spawn('python3', ['-m', 'http.server', '8031', '--bind', '127.0.0.1'], { cwd: base, stdio: 'ignore' });
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { ready = (await fetch(url)).ok; if (ready) break; } catch {}
    await delay(100);
  }
  assert.ok(ready, 'Local static server did not start.');
  browser = await chromium.launch();
  for (const [name, viewport] of [['mobile', { width: 390, height: 844 }], ['narrow', { width: 320, height: 740 }], ['desktop', { width: 1440, height: 1100 }]]) {
    const context = await browser.newContext({ viewport, timezoneId: 'America/Mexico_City', deviceScaleFactor: 1 });
    const errors = [], missing = [];
    context.on('page', page => {
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
    });
    const page = await openPage(context);
    try {
      await assertFits(page);
      await assertPreview(page);
      const sharedStyles = await previewStyles(page);
      const comparisons = await browser.newContext({ viewport });
      try {
        for (const template of ['bordado', 'editorial', 'minimalista', 'solsticio']) {
          const reference = await comparisons.newPage();
          await reference.goto(url.replace('clasica/', `${template}/`), { waitUntil: 'domcontentloaded' });
          await reference.locator('#brand-footer img').waitFor();
          await reference.evaluate(() => document.fonts.ready);
          assert.deepEqual(sharedStyles, await previewStyles(reference), `Catalog navigation differs from ${template} at ${viewport.width}px`);
          await reference.close();
        }
      } finally { await comparisons.close(); }
      assert.equal(await page.locator('#letter').getAttribute('inert'), '');
      await page.screenshot({ path: path.join(out, `${name}-closed.png`), fullPage: true });
      await page.getByRole('button', { name: source.presentation.clasica.copy.openAccessible, exact: true }).click();
      if (name === 'mobile') {
        await page.waitForTimeout(750);
        await page.screenshot({ path: path.join(out, 'mobile-opening.png'), fullPage: true });
      }
      await page.locator('.folio[data-state="open"]').waitFor();
      await assertFits(page);
      await assertPreview(page);
      assert.ok(await page.locator('#passes').evaluate(el => el.previousElementSibling.classList.contains('locations')));
      assert.equal(await page.locator('#attendees').inputValue(), '2');
      assert.ok(await page.getByRole('button', { name: 'Agregar un asistente' }).isDisabled());
      await revealForScreenshot(page);
      await page.screenshot({ path: path.join(out, `${name}-open.png`), fullPage: true });
      await page.locator('#passes').screenshot({ path: path.join(out, `${name}-passes.png`) });
      await page.getByRole('button', { name: 'Quitar un asistente' }).click();
      assert.equal(await page.locator('#attendees').inputValue(), '1');
      assert.ok(await page.getByRole('button', { name: 'Quitar un asistente' }).isDisabled());
      await page.getByRole('button', { name: 'Confirmar asistencia', exact: true }).click();
      await page.locator('.rsvp-result').waitFor({ state: 'visible' });
      assert.match(await page.locator('.rsvp-result').innerText(), /Demostración: 1 lugar seleccionado/);
      await page.getByRole('button', { name: source.presentation.clasica.copy.reopen, exact: true }).click();
      assert.equal(await page.locator('.folio').getAttribute('data-state'), 'closed');
      assert.equal(await page.locator('.invitation-details').isVisible(), false);
      await page.locator('.open-invitation').focus();
      await page.keyboard.press('Enter');
      await page.locator('.folio[data-state="open"]').waitFor();
      await page.locator('.invitation-preview-back').click();
      assert.equal(new URL(page.url()).pathname, '/catalogo/boda/');
      await page.locator('[data-classic-couple]').filter({ hasText: source.event.couple.map(person => person.name).join(' & ') }).waitFor();
      assert.deepEqual(errors, []); assert.deepEqual(missing, []);
      report.push({ name, viewport, status: 'passed', errors, missing });
    } catch (error) {
      await page.screenshot({ path: path.join(out, `${name}-failure.png`), fullPage: true });
      report.push({ name, status: 'failed', message: error.message, errors, missing }); throw error;
    } finally { await context.close(); }
  }
  const alternate = JSON.parse(JSON.stringify(source));
  alternate.event.couple = [{ name: 'Ana María' }, { name: 'José Luis' }];
  alternate.presentation.clasica.theme.primary = '#603649';
  alternate.presentation.clasica.sections.family = false;
  alternate.event.quote = '<img src=x onerror=alert(1)>\nUna historia que comienza.';
  alternate.invitation.maxPasses = 1;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Tokyo', reducedMotion: 'reduce' });
  await context.route('**/data/invitations/clasica.json', route => route.fulfill({ json: alternate }));
  const page = await openPage(context);
  assert.equal(await page.locator('#invitation').evaluate(el => getComputedStyle(el).getPropertyValue('--primary').trim()), '#603649');
  await assertPreview(page);
  const defaultContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const defaultPage = await openPage(defaultContext);
    assert.deepEqual(await previewStyles(page), await previewStyles(defaultPage), 'The invitation palette must not change catalog navigation');
  } finally { await defaultContext.close(); }
  assert.equal(await page.locator('.letter-quote img').count(), 0);
  await page.screenshot({ path: path.join(out, 'mobile-alternate-color.png'), fullPage: true });
  await page.locator('.seal-button').click();
  assert.equal(await page.locator('.folio').getAttribute('data-state'), 'open');
  assert.equal(await page.locator('.family').count(), 0);
  assert.equal(await page.locator('#attendees option').count(), 1);
  await assertFits(page);
  report.push({ name: 'JSON customization, reduced motion, escaping, one pass and optional family', status: 'passed' });
  await context.close();
  for (const [name, alter, expected] of [
    ['zero-passes', data => { data.invitation.maxPasses = 0; }, source.presentation.clasica.copy.noPasses],
    ['expired', data => { data.rsvp.deadlineAt = '2000-01-01T00:00:00Z'; }, source.presentation.clasica.copy.expired]
  ]) {
    const data = JSON.parse(JSON.stringify(source)); alter(data);
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.route('**/data/invitations/clasica.json', route => route.fulfill({ json: data }));
    const page = await openPage(context); await page.locator('.seal-button').click();
    assert.equal(await page.locator('#rsvp-form').isVisible(), false);
    assert.equal(await page.locator('.rsvp-message').innerText(), expected);
    report.push({ name, status: 'passed' }); await context.close();
  }
  const failureContext = await browser.newContext();
  await failureContext.route('**/data/invitations/clasica.json', route => route.fulfill({ status: 404, body: '' }));
  const failurePage = await failureContext.newPage(); await failurePage.goto(url);
  await failurePage.getByRole('button', { name: 'Volver a intentar' }).waitFor();
  assert.equal(await failurePage.locator('#invitation').getAttribute('aria-busy'), 'false');
  await failurePage.locator('.invitation-preview-back').click();
  assert.equal(new URL(failurePage.url()).pathname, '/catalogo/boda/');
  await failureContext.close(); report.push({ name: 'Missing JSON fallback', status: 'passed' });
  console.log('PASS: shared header/footer across all five demos at three viewport sizes, navigation, theme isolation, opening/replay/keyboard, RSVP, JSON customization and error states.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser?.close(); server?.kill();
});
