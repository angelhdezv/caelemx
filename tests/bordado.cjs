// Run: node --experimental-vm-modules tests/bordado.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
const cache = new Map();
async function load(file) {
 if (cache.has(file)) return cache.get(file);
 const mod = new vm.SourceTextModule(fs.readFileSync(file, 'utf8'), {
  identifier: file,
  importModuleDynamically: async (specifier, parent) => {
   const child = await load(path.resolve(path.dirname(parent.identifier), specifier));
   if (child.status === 'linked') await child.evaluate();
   return child;
  }
 });
 cache.set(file, mod);
 await mod.link((specifier, parent) => load(path.resolve(path.dirname(parent.identifier), specifier)));
 return mod;
}
(async () => {
 const service = await load(path.join(base, 'js/wedding/service.js')); await service.evaluate();
 const { getInvitation, confirmAttendance } = service.namespace;
 const model = cache.get(path.join(base, 'js/wedding/model.js')).namespace;
 const data = await getInvitation('bordado');
 assert.equal(data.event.couple[0].name, 'Valentina');
 assert.equal((await confirmAttendance(data, 2)).attendees, 2);
 for (const value of [0, 3, 1.5, NaN]) await assert.rejects(confirmAttendance(data, value));
 const expired = JSON.parse(JSON.stringify(data)); expired.rsvp.deadlineAt = '2020-01-01T00:00:00Z';
 await assert.rejects(confirmAttendance(expired, 1));
 assert.deepEqual(model.remaining(data.event.startsAt, Date.parse(data.event.startsAt) + 1), [0, 0, 0, 0]);
 const parts = zone => new Intl.DateTimeFormat('en', {timeZone:zone, day:'numeric'}).format(new Date(data.event.startsAt));
 assert.equal(parts('America/Mexico_City'), '20'); assert.equal(parts('Asia/Tokyo'), '21');
 for (const item of data.event.schedule) assert.match(item.startsAt, /Z$/);
 for (const file of ['js/wedding/bordado-app.js', 'js/wedding/bordado-data.js']) new vm.SourceTextModule(fs.readFileSync(path.join(base,file),'utf8'));
 for (const item of [data.media.cover, ...data.media.gallery]) if (item.src.startsWith('/')) assert.ok(fs.existsSync(path.join(base,item.src)));
 for (const asset of ['garland.webp','linen.webp','bird.webp','couple.jpg']) assert.ok(fs.statSync(path.join(base,'assets/wedding/bordado',asset)).size > 0);
 assert.match(fs.readFileSync(path.join(base,'catalogo/boda/index.html'),'utf8'), /href="\.\/bordado\/"/);
 console.log('PASS: module syntax, data loading, UTC day conversion, countdown, RSVP limits/deadline, local images and catalog route.');
})().catch(error => { console.error(error); process.exitCode = 1; });
