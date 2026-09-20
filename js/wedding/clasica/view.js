import { el, button, link, ornament, paperCard } from './dom.js';
import { calendarFor, interpolate } from './model.js';

const timeText = (value, locale) => new Intl.DateTimeFormat(locale,
  { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
const dateText = (value, locale) => new Intl.DateTimeFormat(locale,
  { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));

function renderLetter(data, config, calendar) {
  const card = paperCard('letter', { corners: true, tag: 'article' });
  card.id = 'letter'; card.tabIndex = -1;
  const names = el('h1', 'couple-names', data.event.couple.map(person => person.name).join(' & '));
  names.id = 'couple-names'; card.setAttribute('aria-labelledby', names.id);
  const date = el('div', 'letter-date');
  const time = el('time', 'letter-date__day', calendar.day); time.dateTime = data.event.startsAt;
  const month = el('span', 'letter-date__month', calendar.monthName);
  date.append(month, time, el('span', 'letter-date__year', `${calendar.year} · ${timeText(data.event.startsAt, data.locale)} h`));
  card.append(names, ornament('rings'), el('h2', 'letter-headline', data.event.headline),
    el('p', 'letter-quote', data.event.quote), date, ornament('divider'),
    el('p', 'letter-family', config.copy.familyIntro), el('p', 'letter-welcome', config.copy.celebrate));
  return card;
}

function renderCalendar(calendar, copy) {
  const block = el('div', 'cover-calendar'); block.setAttribute('aria-hidden', 'true');
  block.classList.toggle('has-six-weeks', calendar.cells.length === 42);
  block.append(el('span', 'cover-month', calendar.monthName));
  const grid = el('div', 'calendar-grid');
  calendar.weekdays.forEach(day => grid.append(el('span', 'calendar-weekday', day)));
  calendar.cells.forEach(day => {
    const cell = el('span', day === calendar.day ? 'calendar-day is-wedding-day' : 'calendar-day', day ?? '');
    grid.append(cell);
  });
  block.append(el('span', 'cover-year', calendar.year), grid, el('span', 'cover-caption', copy.saveTheDate));
  return block;
}

function renderCountdown(copy) {
  const section = el('section', 'countdown');
  section.setAttribute('aria-label', copy.countdownTitle);
  section.append(el('p', 'countdown-title', copy.countdownTitle));
  const clock = el('div', 'countdown-clock');
  const values = copy.countdownLabels.map(label => {
    const group = el('div', 'countdown-unit');
    const value = el('span', 'countdown-value', '00');
    group.append(value, el('span', 'countdown-label', label)); clock.append(group);
    return value;
  });
  section.append(clock);
  return { section, values };
}

function renderLocations(data, copy) {
  const section = paperCard('locations reveal');
  data.event.schedule.forEach((event, index) => {
    const venue = el('article', 'venue');
    const title = el('h2', 'card-title', event.title); title.id = `venue-${index}`;
    venue.setAttribute('aria-labelledby', title.id);
    const time = el('time', 'venue-time', `${dateText(event.startsAt, data.locale)} · ${timeText(event.startsAt, data.locale)} h`);
    time.dateTime = event.startsAt;
    const map = link('gold-button', copy.maps, event.venue.mapsUrl, true);
    map.setAttribute('aria-label', `${copy.maps}: ${event.venue.name}`);
    venue.append(el('p', 'eyebrow', event.label), title, el('p', 'venue-name', event.venue.name),
      el('p', 'venue-address', event.venue.address), time);
    if (Intl.DateTimeFormat().resolvedOptions().timeZone !== data.event.timeZone) {
      venue.append(el('p', 'time-zone-note', copy.localTime));
    }
    venue.append(map); section.append(venue);
  });
  return section;
}

function renderPasses(data, copy) {
  const card = paperCard('passes reveal', { corners: true });
  card.id = 'passes';
  const title = el('h2', 'card-title', copy.passesTitle); title.id = 'passes-title';
  card.setAttribute('aria-labelledby', title.id);
  const reservation = el('div', 'reservation');
  reservation.append(el('span', 'reservation-number', data.invitation.maxPasses),
    el('span', 'reservation-unit', data.invitation.maxPasses === 1 ? copy.passSingular : copy.passPlural));
  card.append(el('p', 'eyebrow', data.invitation.guestName), title, el('p', '', copy.reserved), reservation,
    el('p', 'pass-note', copy.passNote));
  const form = el('form', 'rsvp-form'); form.id = 'rsvp-form';
  const label = el('label', 'rsvp-label', copy.attendees); label.htmlFor = 'attendees';
  const stepper = el('div', 'pass-stepper');
  const minus = button('stepper-button', '−'); minus.setAttribute('aria-label', copy.minus);
  const plus = button('stepper-button', '+'); plus.setAttribute('aria-label', copy.plus);
  const select = el('select', 'attendees'); select.id = 'attendees'; select.name = 'attendees'; select.required = true;
  for (let number = 1; number <= data.invitation.maxPasses; number++) {
    const option = el('option', '', `${number} ${number === 1 ? copy.attendeeSingular : copy.attendeePlural}`);
    option.value = String(number); select.append(option);
  }
  if (data.invitation.maxPasses > 0) select.value = String(data.invitation.maxPasses);
  stepper.append(minus, select, plus);
  const submit = button('gold-button confirm-button', copy.confirm); submit.type = 'submit';
  const deadline = el('p', 'deadline', interpolate(copy.deadline, { date: dateText(data.rsvp.deadlineAt, data.locale) }));
  form.append(label, stepper, submit, deadline);
  const message = el('p', 'rsvp-message'); message.setAttribute('role', 'status');
  const result = el('div', 'rsvp-result'); result.hidden = true; result.tabIndex = -1;
  card.append(form, message, result, el('p', 'demo-note', copy.demoNote));
  return { card, form, select, minus, plus, submit, message, result };
}

function renderFamily(family) {
  const card = paperCard('family reveal');
  card.append(ornament('divider'), el('h2', 'card-title', family.title));
  if (family.parents.length) {
    card.append(el('p', 'eyebrow', family.parentsLabel));
    const groups = el('div', 'family-groups');
    family.parents.forEach(group => {
      const names = el('div', 'family-group');
      names.setAttribute('aria-label', group.label);
      group.names.forEach(name => names.append(el('p', '', name))); groups.append(names);
    }); card.append(groups);
  }
  if (family.sponsors.length) {
    card.append(el('p', 'eyebrow sponsors-label', family.sponsorsLabel));
    family.sponsors.forEach(name => card.append(el('p', 'sponsor', name)));
  }
  return card;
}

function renderDressCode(data, copy) {
  const card = paperCard('dress-code reveal');
  card.append(el('p', 'eyebrow', copy.dressTitle), el('h2', 'card-title dress-title', data.dressCode.title), el('p', '', data.dressCode.note));
  const details = el('details', 'dress-details');
  const summary = el('summary', 'gold-button', copy.more);
  const list = el('ul', 'guidelines');
  data.dressCode.guidelines.forEach(text => list.append(el('li', '', text)));
  details.append(summary, list);
  details.addEventListener('toggle', () => { summary.textContent = details.open ? copy.less : copy.more; });
  card.append(details); return card;
}

function renderGifts(data, copy) {
  const card = paperCard('gifts reveal');
  card.append(ornament('divider'), el('h2', 'card-title', copy.giftsTitle), el('p', 'gift-message', data.gifts.message));
  const links = el('div', 'registry-links');
  data.gifts.registries.forEach(registry => links.append(link('gold-button', registry.label, registry.url, true)));
  card.append(links); return card;
}

export function renderInvitation(root, data) {
  const config = data.presentation.clasica, copy = config.copy;
  const calendar = calendarFor(data.event.startsAt, data.locale);
  const shell = el('div', 'classic-shell');
  const skip = button('skip-invitation', copy.skip);
  const greeting = el('div', 'intro-greeting');
  greeting.append(el('p', '', copy.greeting), ornament('divider'));
  const stage = el('div', 'folio-stage');
  const folio = el('div', 'folio'); folio.dataset.state = 'closed';
  const letter = renderLetter(data, config, calendar); letter.inert = true;
  const cover = el('div', 'folio-cover');
  const cord = el('span', 'cover-cord'); cord.setAttribute('aria-hidden', 'true');
  const seal = button('seal-button'); seal.setAttribute('aria-label', copy.openAccessible);
  const image = el('img', 'seal-flowers'); image.src = config.assets.sealFlowers;
  image.alt = ''; image.width = 640; image.height = 960; image.fetchPriority = 'high';
  seal.append(image); cover.append(cord, seal, renderCalendar(calendar, copy));
  const flapBack = el('div', 'flap-back'); flapBack.setAttribute('aria-hidden', 'true');
  cover.append(flapBack);
  folio.append(letter, cover); stage.append(folio);
  const open = button('open-invitation', copy.open);
  const openStatus = el('span', 'sr-only'); openStatus.setAttribute('role', 'status');
  const details = el('div', 'invitation-details'); details.id = 'invitation-details'; details.hidden = true; details.inert = true;
  const countdown = config.sections.countdown ? renderCountdown(copy) : null;
  if (countdown) details.append(countdown.section);
  details.append(renderLocations(data, copy));
  // Pases immediately follow the location card, sharing the same paper component.
  const passes = renderPasses(data, copy); details.append(passes.card);
  if (config.sections.family) details.append(renderFamily(config.family));
  if (config.sections.dressCode) details.append(renderDressCode(data, copy));
  if (config.sections.gifts) details.append(renderGifts(data, copy));
  if (config.sections.story) {
    const story = el('section', 'closing-story reveal');
    story.append(el('p', 'eyebrow', data.story.label), el('h2', '', data.story.title),
      el('p', '', data.story.text), ornament('rings'));
    details.append(story);
  }
  const replay = button('replay-invitation', copy.reopen); details.append(replay);
  shell.append(skip, greeting, stage, open, openStatus, details);
  root.replaceChildren(shell); root.setAttribute('aria-busy', 'false');
  return { shell, greeting, stage, folio, letter, cover, seal, open, openStatus, details, passes, countdown, replay, skip };
}
