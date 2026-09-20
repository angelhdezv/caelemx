// Run from the repository root: node --experimental-vm-modules tests/clasica.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
const modules = new Map();
async function load(file) {
  if (modules.has(file)) return modules.get(file);
  const module = new vm.SourceTextModule(fs.readFileSync(file, 'utf8'), { identifier: file });
  modules.set(file, module);
  await module.link((specifier, parent) => load(path.resolve(path.dirname(parent.identifier), specifier)));
  return module;
}
const clone = data => JSON.parse(JSON.stringify(data));
(async () => {
  const service = await load(path.join(base, 'js/wedding/service.js')); await service.evaluate();
  const model = await load(path.join(base, 'js/wedding/clasica/model.js')); await model.evaluate();
  const { validateClasica, themeTokens, calendarFor, safeURL } = model.namespace;
  const { getInvitation, confirmAttendance } = service.namespace;
  const fetchImpl = async url => {
    const file = path.join(base, new URL(url).pathname);
    return { ok: fs.existsSync(file), json: async () => JSON.parse(fs.readFileSync(file, 'utf8')) };
  };
  const data = validateClasica(await getInvitation('clasica', { fetchImpl }));
  assert.equal(data.event.couple[0].name, 'Sandra');
  const custom = clone(data);
  custom.event.couple = [{ name: 'Ana María' }, { name: 'José Luis' }];
  custom.presentation.clasica.theme.primary = '#623444';
  const changed = validateClasica(await getInvitation('clasica', {
    source: 'https://example.org/wedding.json', fetchImpl: async () => ({ ok: true, json: async () => custom })
  }));
  assert.equal(changed.event.couple[0].name, 'Ana María');
  assert.notEqual(themeTokens(changed.presentation.clasica.theme).background, themeTokens(data.presentation.clasica.theme).background);
  assert.equal(data.presentation.clasica.theme.primary, '#315b46');
  for (const badColor of ['green', '#abc', 'url(https://example.com)', '#000000; color:red']) {
    const invalid = clone(data); invalid.presentation.clasica.theme.primary = badColor;
    assert.throws(() => validateClasica(invalid), /Color/);
  }
  assert.throws(() => safeURL('javascript:alert(1)'));
  const unsafeMap = clone(data); unsafeMap.event.schedule[0].venue.mapsUrl = 'data:text/html,hello';
  assert.throws(() => validateClasica(unsafeMap), /Enlace/);
  const incomplete = clone(data); delete incomplete.presentation.clasica.copy.maps;
  assert.throws(() => validateClasica(incomplete), /etiquetas/);
  const wrongLabels = clone(data); wrongLabels.presentation.clasica.copy.countdownLabels = 'test';
  assert.throws(() => validateClasica(wrongLabels), /etiquetas/);
  const noFamily = clone(data); noFamily.presentation.clasica.sections.family = false;
  delete noFamily.presentation.clasica.family; assert.doesNotThrow(() => validateClasica(noFamily));
  const november = calendarFor('2026-11-21T18:00:00Z', 'es-MX', 'America/Mexico_City');
  assert.equal(november.cells[0], 1); assert.equal(november.cells[20], 21); assert.equal(november.cells[29], 30);
  assert.equal(november.cells.filter(Boolean).length, 30); assert.equal(november.day, 21);
  assert.equal(calendarFor('2028-02-29T18:00:00Z', 'es-MX', 'UTC').cells.filter(Boolean).length, 29);
  assert.equal(calendarFor('2027-02-28T18:00:00Z', 'es-MX', 'UTC').cells.filter(Boolean).length, 28);
  assert.equal(calendarFor('2026-11-21T23:30:00Z', 'es-MX', 'Asia/Tokyo').day, 22);
  assert.equal(calendarFor('2026-11-21T23:30:00Z', 'es-MX', 'America/Mexico_City').day, 21);
  const future = clone(data); future.rsvp.deadlineAt = '2099-11-14T23:59:00Z';
  assert.equal((await confirmAttendance(future, 2)).attendees, 2);
  for (const invalid of [0, 3, 1.5, NaN, '2']) await assert.rejects(confirmAttendance(future, invalid));
  const noPasses = clone(future); noPasses.invitation.maxPasses = 0;
  assert.doesNotThrow(() => validateClasica(noPasses)); await assert.rejects(confirmAttendance(noPasses, 1));
  const expired = clone(future); expired.rsvp.deadlineAt = '2000-01-01T00:00:00Z';
  await assert.rejects(confirmAttendance(expired, 1), /terminó/);
  const unsupported = clone(data); unsupported.rsvp.mode = 'live';
  assert.throws(() => validateClasica(unsupported), /adaptador/);
  for (const value of Object.values(data.presentation.clasica.assets)) assert.ok(fs.existsSync(path.join(base, value)), value);
  for (const file of fs.readdirSync(path.join(base, 'js/wedding/clasica')).filter(name => name.endsWith('.js'))) {
    new vm.SourceTextModule(fs.readFileSync(path.join(base, 'js/wedding/clasica', file), 'utf8'));
  }
  console.log('PASS: Clásica/custom JSON, independent themes, local calendars and leap years, URL validation, optional family, pass boundaries and expiry, PNGs, and module syntax.');
})().catch(error => { console.error(error); process.exitCode = 1; });
