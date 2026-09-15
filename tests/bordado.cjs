// Run: node --experimental-vm-modules tests/bordado.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
const cache = new Map();
const fetchJSON = async url => {
 const file = path.join(base, new URL(url).pathname);
 return { ok: fs.existsSync(file), json: async () => JSON.parse(fs.readFileSync(file, 'utf8')) };
};
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
 const data = await getInvitation('bordado', { fetchImpl: fetchJSON });
 assert.equal(data.event.couple[0].name, 'Valentina');
 assert.equal((await confirmAttendance(data, 2)).attendees, 2);
 for (const value of [0, 3, 1.5, NaN]) await assert.rejects(confirmAttendance(data, value));
 const expired = JSON.parse(JSON.stringify(data)); expired.rsvp.deadlineAt = '2020-01-01T00:00:00Z';
 await assert.rejects(confirmAttendance(expired, 1));
 assert.deepEqual(model.remaining(data.event.startsAt, Date.parse(data.event.startsAt) + 1), [0, 0, 0, 0]);
 const parts = zone => new Intl.DateTimeFormat('en', {timeZone:zone, day:'numeric'}).format(new Date(data.event.startsAt));
 assert.equal(parts('America/Mexico_City'), '20'); assert.equal(parts('Asia/Tokyo'), '21');
 for (const item of data.event.schedule) assert.match(item.startsAt, /Z$/);
 for (const file of fs.readdirSync(path.join(base, 'js/wedding')).filter(file => file.endsWith('.js'))) new vm.SourceTextModule(fs.readFileSync(path.join(base,'js/wedding',file),'utf8'));
 for (const item of [data.media.cover, ...data.media.gallery]) if (item.src.startsWith('/')) assert.ok(fs.existsSync(path.join(base,item.src)));
 for (const asset of ['garland.webp','linen.webp','bird.webp','couple.jpg','attire.webp']) assert.ok(fs.statSync(path.join(base,'assets/wedding/bordado',asset)).size > 0);
 assert.match(fs.readFileSync(path.join(base,'catalogo/boda/index.html'),'utf8'), /href="\.\/bordado\/"/);
 for (const template of ['minimalista', 'editorial', 'solsticio', 'bordado']) {
  const original = await getInvitation(template, { fetchImpl: fetchJSON });
  const custom = JSON.parse(JSON.stringify(original));
  custom.event.couple = [{ name: 'Ana' }, { name: 'Luis' }];
  custom.event.quote = 'Una frase de este cliente.';
  custom.story.text = 'Una historia independiente.';
  custom.invitation.maxPasses = 5;
  custom.dressCode.title = 'Cóctel';
  custom.dressCode.illustration = { src: '/assets/wedding/attire.svg', alt: 'Vestimenta del cliente' };
  custom.event.schedule[0].venue.name = 'Lugar del cliente';
  custom.event.schedule[0].venue.mapsUrl = 'https://maps.google.com/?q=Teoloyucan';
  custom.media.gallery = [{ src: '/assets/wedding/bordado/couple.jpg', alt: 'Foto del cliente', caption: 'Nuestro recuerdo' }];
  custom.gifts.registries = [{ id: 'client', label: 'Mi mesa de regalos', url: 'https://example.com/regalos' }];
  const result = await getInvitation(template, { source: '/data/invitations/cliente.json', fetchImpl: async url => {
   assert.equal(new URL(url).pathname, '/data/invitations/cliente.json');
   return { ok: true, json: async () => JSON.parse(JSON.stringify(custom)) };
  }});
  assert.deepEqual(result, custom);
  assert.equal((await confirmAttendance(result, 5)).attendees, 5);
  assert.deepEqual(await getInvitation(template, { fetchImpl: fetchJSON }), original, 'Client changes must not bleed into another invitation');
  for (const media of [original.media.cover, ...original.media.gallery, original.dressCode.illustration, ...original.event.schedule.map(item => item.venue.image).filter(Boolean)]) {
   if (media.src.startsWith('/')) assert.ok(fs.existsSync(path.join(base,media.src)),media.src);
  }
  const html = fs.readFileSync(path.join(base, `catalogo/boda/${template}/index.html`), 'utf8');
  assert(html.includes(`data-source="/data/invitations/${template}.json"`));
 }
 await assert.rejects(getInvitation('bordado', {source:'/missing.json', fetchImpl:fetchJSON}));
 await assert.rejects(getInvitation('unknown', {fetchImpl:fetchJSON}));
 const invalid = JSON.parse(JSON.stringify(data));
 invalid.event.schedule[0].startsAt = '2027-11-20T17:00:00-06:00';
 assert.throws(() => model.validate(invalid), /UTC/);
 invalid.event.schedule[0].startsAt = data.event.schedule[0].startsAt;
 invalid.event.schedule[1].id = invalid.event.schedule[0].id;
 assert.throws(() => model.validate(invalid), /único/);
 console.log('PASS: all four JSON sources and custom client data, isolation, UTC and schedule validation, RSVP, assets and module syntax.');
})().catch(error => { console.error(error); process.exitCode = 1; });
