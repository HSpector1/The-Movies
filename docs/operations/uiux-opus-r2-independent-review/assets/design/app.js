'use strict';
// Opus review proposal — small linked prototype (overview → person → production → compare → Back).
// Fictional in-memory state only. No fetch, storage, timers that mutate money/time, or game access.
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const params = new URLSearchParams(location.search);
const ROLE_ICON = { Director: 'megaphone', Actor: 'star', Writer: 'quill', 'Craft lead': 'wrench' };
const GENRE = { Drama: '#7a4a5c', Romance: '#b46a7a', Horror: '#3d4a5a', Action: '#a2552f', Comedy: '#c9a03a', 'Sci-fi': '#4d7a8a' };
// One drawn icon set (filled, two-tone). Sizes 16/20/28.
const ICON = {
  quill: '<path d="M4 20c6-1 12-6 15-15-6 2-11 7-13 13l-2 2z"/><path d="M9 15l6-6" stroke="#fff" stroke-width="1.4" fill="none"/>',
  clapper: '<path d="M3 9h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 4l17-2 1 5-18 2z"/><path d="M7 3.5l2 3M12 3l2 3M17 2.5l2 3" stroke="#fff" stroke-width="1.4"/>',
  camera: '<rect x="2" y="9" width="13" height="10" rx="2"/><circle cx="6" cy="6" r="3.2"/><circle cx="12.5" cy="6" r="3.2"/><path d="M15 12l6-3v8l-6-3z"/>',
  reel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="7" r="1.8" fill="#fff"/><circle cx="7.5" cy="14" r="1.8" fill="#fff"/><circle cx="16.5" cy="14" r="1.8" fill="#fff"/><circle cx="12" cy="12" r="1.4" fill="#fff"/>',
  can: '<rect x="3" y="6" width="18" height="12" rx="2"/><rect x="6" y="9" width="12" height="6" rx="1" fill="#fff" opacity=".6"/><path d="M3 10h18" stroke="#fff" stroke-width="1"/>',
  star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>',
  megaphone: '<path d="M3 10v4h3l8 5V5L6 10z"/><path d="M17 8a5 5 0 0 1 0 8" stroke="#fff" stroke-width="1.6" fill="none"/>',
  wrench: '<path d="M21 6.5a5 5 0 0 1-6.6 6.2L7 20.1a2 2 0 0 1-2.8-2.8l7.4-7.4A5 5 0 0 1 17.8 3l-2.7 2.7 1.4 2.8 2.8 1.4z"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  play: '<path d="M6 4l14 8-14 8z"/>',
  fast: '<path d="M3 5l9 7-9 7zM12 5l9 7-9 7z"/>',
  build: '<path d="M4 20h16v2H4z"/><path d="M6 20V9l6-5 6 5v11h-4v-6h-4v6z"/>',
  ledger: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#fff" stroke-width="1.6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  bang: '<path d="M11 3h2l-.5 11h-1zM12 17.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
  check: '<path d="M4 12l5 5 11-11" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  search: '<circle cx="10" cy="10" r="6" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  pin: '<path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.6" fill="#fff"/>',
  back: '<path d="M14 5l-7 7 7 7" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M12 6v12M9 9.5c0-1.4 1.3-2 3-2s3 .8 3 2-1.3 1.6-3 2-3 .8-3 2 1.3 2 3 2 3-.6 3-2" stroke="#fff" stroke-width="1.6" fill="none"/>',
};
const icon = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[k] || ''}</svg>`;
const STAGE_ICON = ['quill', 'clapper', 'camera', 'reel', 'can'];

let S;
function reset() {
  S = { screen: params.get('screen') || 'overview', dir: params.get('dir') || 'rec', world: params.get('world') || 'target',
    fixture: params.get('fixture') || 'mature', text: Number(params.get('text') || 100), annotated: params.has('annotated'),
    rails: params.get('rails') || 'full', selectedPerson: '', selectedProject: '', people: 'All', pictures: 'All', search: '', expanded: false, hover: null, trail: [],
    response: 'ready', candidate: '' };
  document.documentElement.classList.toggle('canvas-1280', params.get('canvas') === '1280');
  if (S.screen === 'person') { S.selectedPerson = 'P-004'; }
  if (S.screen === 'production') { S.selectedProject = params.get('state') === 'waiting' ? 'FILM-018' : 'FILM-014'; }
  if (S.screen === 'compare') { S.selectedProject = 'SCRIPT-021'; }
  render();
}
const people = () => S.fixture === 'early' ? FIXTURE.employees.slice(0, 3).map(p => ({ ...p, work: 'No assignment', place: 'Casting', status: 'Available', x: 21, y: 41 }))
  : S.fixture === 'long' ? [...LONG_FIXTURE.employees, ...FIXTURE.employees] : FIXTURE.employees;
const projects = () => S.fixture === 'early' ? [FIXTURE.projects[2]] : S.fixture === 'long' ? [...LONG_FIXTURE.projects, ...FIXTURE.projects] : FIXTURE.projects;
const person = id => people().find(p => p.id === id) || FIXTURE.candidates.find(c => c.id === id);
const project = id => projects().find(p => p.id === id);
const buildingFor = place => FIXTURE.buildings.find(b => b.name === place) || (place === 'Production Office' ? FIXTURE.buildings[4] : null);
const needsMe = p => p.action && !(p.id === 'FILM-014' && S.response === 'success');
const isWait = p => !!p.waiting;
const statusKind = p => p.status === 'Working' || p.status === 'Writing' ? 'work' : (p.status === 'Waiting' || /^Unavailable/.test(p.status)) ? 'wait' : 'free';
const statusWord = p => p.status === 'Working' ? 'On set' : p.status === 'Writing' ? 'Writing' : p.status === 'Waiting' ? 'Waiting' : /^Unavailable/.test(p.status) ? 'Unavailable' : 'Free';

// ---------- anchors: where a building sits on screen (game px) ----------
function anchorOf(place) {
  const b = buildingFor(place); if (!b) return null;
  if (S.world === 'r2') { const W = 1440, H = 868 - 68; return { x: W * b.x / 100, y: 68 + H * b.y / 100, id: b.id, name: b.name }; }
  const a = LOT.anchor(b.id); return a ? { x: a.x, y: a.y, top: a.top, topX: a.topX, id: b.id, name: b.name } : null;
}
function worldShift() {
  // Pan so the located target sits in the centre of the free lot region (rails excluded) — same intent as R2's translation.
  const target = S.selectedPerson ? person(S.selectedPerson) : S.selectedProject ? project(S.selectedProject) : null;
  if (!target || S.screen === 'compare') return { x: 0, y: 0 };
  const a = anchorOf(target.place); if (!a) return { x: 0, y: 0 };
  const cx = 720, cy = S.screen === 'overview' ? 470 : 330; return { x: Math.max(-260, Math.min(260, cx - a.x)), y: Math.max(-200, Math.min(200, cy - a.y)) };
}

// ---------- pieces ----------
const statusChip = (p, cls = '') => `<span class="chip st-${statusKind(p)} ${cls}">${icon(statusKind(p) === 'work' ? (p.status === 'Writing' ? 'quill' : 'camera') : statusKind(p) === 'wait' ? 'clock' : 'check')}<span>${esc(statusWord(p))}</span></span>`;
function personRow(p, i) {
  const sel = S.selectedPerson === p.id;
  return `<button class="row person ${sel ? 'selected' : ''}" data-act="person:${p.id}" data-id="${p.id}" aria-pressed="${sel}" aria-label="${esc(p.name)}, ${esc(p.role)}, ${esc(p.id)}, ${esc(statusWord(p))}">
    ${portraitSVG(p, 44, { rank: i < 3 ? String(31 + i * 7) : '' })}
    <span class="txt"><strong>${esc(p.name)}</strong><span class="meta">${icon(ROLE_ICON[p.role] || 'star', 'role')}${esc(p.role)} <em>${esc(p.id)}</em>${statusChip(p)}</span></span></button>`;
}
function phaseDots(p, size = '') {
  const cur = PHASE_INDEX[p.phase] ?? 0;
  return `<span class="phases ${size}" aria-label="Phase ${esc(p.phase)}">${FIXTURE.phases.map((ph, i) => `<i class="${i < cur ? 'done' : i === cur ? 'now' : ''}" title="${ph}">${icon(STAGE_ICON[i])}</i>`).join('')}</span>`;
}
function pictureRow(p) {
  const sel = S.selectedProject === p.id, need = needsMe(p), wait = isWait(p);
  const state = p.id === 'FILM-014' && S.response !== 'ready' ? ({ pending: 'Submitting schedule…', success: 'Take scheduled · receipt', refusal: 'Schedule changed · review again' })[S.response] : p.state;
  return `<button class="row picture ${sel ? 'selected' : ''} ${need ? 'need' : ''} ${wait ? 'wait' : ''}" data-act="project:${p.id}" data-id="${p.id}" aria-pressed="${sel}">
    <span class="poster" style="--g:${GENRE[p.genre] || '#666'}">${icon(STAGE_ICON[PHASE_INDEX[p.phase] ?? 0])}</span>
    <span class="txt"><strong>${esc(p.title)}</strong>${phaseDots(p)}<span class="meta">${esc(state)}</span></span>
    ${need ? `<span class="tab need" aria-label="Needs your decision">${icon('bang')}</span>` : wait ? `<span class="tab wait" aria-label="Normal wait">${icon('clock')}</span>` : p.released ? `<span class="tab lib">${icon('can')}</span>` : ''}</button>`;
}
function groups(list) {
  const order = ['Scripts', 'Making movies', 'Post & release', 'Film library'];
  const label = { 'Scripts': 'Scripts', 'Making movies': 'Shooting', 'Post & release': 'Post & release', 'Film library': 'Library' };
  return order.map(g => { const rows = list.filter(p => p.group === g); return rows.length ? `<h4 class="grp">${label[g]} <b>${rows.length}</b></h4>${rows.map(pictureRow).join('')}` : ''; }).join('');
}
function railPeople() {
  const all = people(); const q = S.search.trim().toLowerCase();
  const list = all.filter(p => (S.people === 'All' || p.group === S.people) && (!q || (p.name + ' ' + p.role + ' ' + p.id).toLowerCase().includes(q)));
  const counts = { All: all.length, Talent: all.filter(p => p.group === 'Talent').length, Writing: all.filter(p => p.group === 'Writing').length, Crew: all.filter(p => p.group === 'Crew').length };
  const free = all.filter(p => p.status === 'Available').length;
  return `<aside class="rail rail-people" aria-label="People">
    <div class="rail-head"><h3>People <b>${all.length}</b></h3><span class="free">${free} free</span><button class="collapse" data-act="rails" aria-label="${S.rails === 'compact' ? 'Expand the people list' : 'Collapse to portraits'}">${icon(S.rails === 'compact' ? 'fast' : 'back')}</button></div>
    <div class="tabs" role="tablist">${['All', 'Talent', 'Writing', 'Crew'].map(g => `<button role="tab" tabindex="${S.people === g ? 0 : -1}" aria-selected="${S.people === g}" class="${S.people === g ? 'on' : ''}" data-act="people:${g}">${g === 'Writing' ? 'Writers' : g}<b>${counts[g]}</b></button>`).join('')}</div>
    <label class="search">${icon('search')}<input type="search" placeholder="Name, role or ID" value="${esc(S.search)}" aria-label="Find a person"></label>
    <div class="list" id="people-list">${list.length ? list.map((p, i) => personRow(p, all.indexOf(p))).join('') : '<p class="empty">No one matches. Clear the search to see everyone.</p>'}</div>
  </aside>`;
}
function railPictures() {
  const all = projects();
  const list = all.filter(p => S.pictures === 'All' || (S.pictures === 'Needs me' && needsMe(p)) || (S.pictures === 'Waiting' && isWait(p)) || (S.pictures === 'Library' && p.released));
  const nNeed = all.filter(needsMe).length, nWait = all.filter(isWait).length, nLib = all.filter(p => p.released).length;
  return `<aside class="rail rail-pictures" aria-label="Pictures">
    <div class="rail-head"><h3>Pictures <b>${all.length}</b></h3>${nNeed ? `<span class="need-count">${icon('bang')}${nNeed} need you</span>` : ''}<button class="collapse" data-act="rails" aria-label="${S.rails === 'compact' ? 'Expand the pictures list' : 'Collapse to posters'}">${icon(S.rails === 'compact' ? 'back' : 'fast')}</button></div>
    <div class="tabs" role="tablist">${[['All', all.length], ['Needs me', nNeed], ['Waiting', nWait], ['Library', nLib]].map(([g, n]) => `<button role="tab" tabindex="${S.pictures === g ? 0 : -1}" aria-selected="${S.pictures === g}" class="${S.pictures === g ? 'on' : ''} ${g === 'Needs me' ? 'need' : ''}" data-act="pictures:${g}">${g}<b>${n}</b></button>`).join('')}</div>
    <div class="list" id="pictures-list">${list.length ? groups(list) : '<p class="empty">Nothing in this group right now.</p>'}</div>
  </aside>`;
}
function hud() {
  const f = FIXTURE.studio; const years = [];
  for (let y = 1924; y <= 1934; y++) years.push(y);
  return `<header class="hud">
    <div class="transport"><button class="tb on" data-act="noop" aria-pressed="true" aria-label="Paused">${icon('pause')}</button><button class="tb" data-act="noop" aria-label="Play">${icon('play')}</button><button class="tb" data-act="noop" aria-label="Fast">${icon('fast')}</button>
      <span class="date"><strong>Week ${f.week}</strong><em>${f.year} · Spring</em></span><span class="paused-stamp">PAUSED</span></div>
    <div class="marque"><span class="name">${esc(f.name)}</span><span class="timeline" aria-label="Timeline 1924 to 1934">${years.map(y => `<i class="${y === f.year ? 'now' : ''}" data-y="${y}">${y % 2 === 0 ? `<b>${y}</b>` : ''}</i>`).join('')}<span class="pin release" style="left:31%" title="A Summer in Red released (1925)"></span><span class="pin award" style="left:58%" title="Awards season (illustrative)"></span></span></div>
    <div class="money"><button class="cash" data-act="finance" aria-label="Cash ${f.cash}, opens Finance">${icon('coin')}<span><strong>${f.cash}</strong><em>${esc(f.cashDelta)}</em></span></button><span class="rank" title="Studio rank (illustrative)">${icon('star')}${f.rank.value}</span><button class="menu" data-act="menu" aria-label="Menu">${icon('menu')}</button></div>
  </header>`;
}
function corner() { return `<nav class="corner" aria-label="Studio tools"><button class="tool build" data-act="build">${icon('build')}<span>Build</span></button><button class="tool" data-act="records">${icon('ledger')}<span>Records</span></button></nav>`; }
function world() {
  const shift = worldShift();
  const target = S.selectedPerson ? person(S.selectedPerson) : S.selectedProject ? project(S.selectedProject) : null;
  const a = target ? anchorOf(target.place) : null;
  const labels = FIXTURE.buildings.filter(b => S.fixture !== 'early' || ['script', 'casting', 'stage07', 'admin'].includes(b.id)).map(b => { const p = anchorOf(b.name); const lit = a && a.id === b.id; return `<button class="site ${lit ? 'lit' : ''}" style="left:${p.x}px;top:${p.y}px" data-act="site:${b.id}">${esc(b.name)}</button>`; }).join('');
  let marker = '';
  if (a) {
    const fp = S.world === 'target' ? `<svg class="fp" viewBox="0 0 1440 868"><polygon points="${LOT.footprint(a.id).map(p => p.join(',')).join(' ')}" /></svg>` : '';
    marker = `${fp}<div class="marker ${target.id.startsWith('P') ? 'person' : 'site'}" style="left:${(a.topX ?? a.x)}px;top:${(a.top ?? (a.y - 70))}px"><span class="who">${target.id.startsWith('P') ? portraitSVG(target, 28) : icon(STAGE_ICON[PHASE_INDEX[target.phase] ?? 0])}<b>${esc(target.name || target.title)}</b><em>${esc(a.name)}</em></span></div>`;
  }
  const art = S.world === 'r2' ? `<div class="lot lot-r2"></div>` : LOT.svg({ early: S.fixture === 'early' });
  return `<div class="world" aria-hidden="false"><div class="canvas" style="transform:translate(${shift.x}px,${shift.y}px)">${art}${labels}${marker}</div>${S.hover ? tooltip() : ''}</div>`;
}
function tooltip() {
  const h = S.hover; const p = h.kind === 'person' ? person(h.id) : project(h.id); if (!p) return '';
  return `<div class="peek" style="left:${h.x}px;top:${h.y}px">${h.kind === 'person' ? `${portraitSVG(p, 40)}<div><strong>${esc(p.name)}</strong><span>${esc(p.role)} · ${esc(p.id)}</span><span>${esc(p.work)} · ${esc(p.place)}</span><em>Click to locate · right-click for facts</em></div>` : `<div><strong>${esc(p.title)}</strong><span>${esc(p.phase)} · ${esc(p.place)}</span><span>${esc(p.state)}</span><em>Click to open the picture</em></div>`}</div>`;
}
function factGroups(p) {
  return `<div class="facts">
    <div><small>Current work</small><b>${esc(p.work)}</b></div><div><small>Location</small><b>${esc(p.place)}</b></div>
    <div><small>Relevant ability</small><b>Perceived role OVR 81</b></div><div><small>Commitment</small><b>Salary $2,000/week</b></div>
    ${S.expanded ? `<div class="wide"><small>More about this person</small><b>Employment overhead $1,500/week · 12 weeks remain. Availability follows the current picture.</b></div>` : ''}
  </div>`;
}
function inspectorPerson() {
  const p = person(S.selectedPerson); if (!p) return '';
  return `<section class="inspector person" aria-label="Person ${esc(p.id)}">
    <header><span class="eyebrow">${icon('pin')}Person · ${esc(p.id)}</span><button class="back" data-act="back">${icon('back')}Back</button></header>
    <div class="ident">${portraitSVG(p, 72, { rank: '31' })}<div><h2>${esc(p.name)}</h2><span class="sub">${icon(ROLE_ICON[p.role] || 'star', 'role')}${esc(p.role)} · ${esc(p.id)} ${statusChip(p, 'big')}</span></div></div>
    ${factGroups(p)}
    <footer><button class="btn ghost" data-act="expand">${S.expanded ? 'Fewer facts' : 'More facts'}</button><button class="btn ghost" data-act="noop">Open full profile</button><span class="grow"></span><button class="btn primary" data-act="back">Return to task</button></footer>
  </section>`;
}
function inspectorProduction() {
  const p = project(S.selectedProject); if (!p) return '';
  const wait = isWait(p), lead = p.person ? person(p.person) : null;
  const strip = wait ? `<div class="strip wait">${icon('clock')}<div><b>Normal wait — no action from you.</b><span>Post capacity is occupied by another cut. Weekly costs continue; nothing here is broken.</span></div></div>`
    : S.response === 'pending' ? `<div class="strip pending">${icon('clock')}<div><b>Submitting schedule…</b><span>Repeated submit is disabled until the response arrives.</span></div></div>`
    : S.response === 'success' ? `<div class="strip ok">${icon('check')}<div><b>Take scheduled — receipt (simulated).</b><span>The calendar did not advance in this demo.</span></div></div>`
    : S.response === 'refusal' ? `<div class="strip refused">${icon('bang')}<div><b>Refused — schedule changed.</b><span>Review the current state before trying again.</span></div></div>`
    : `<div class="strip need">${icon('bang')}<div><b>Your decision: schedule the shooting take.</b><span>The company and set are ready. Scheduling permits the next work step; weekly costs continue.</span></div></div>`;
  return `<section class="inspector production" aria-label="Picture ${esc(p.id)}">
    <header><span class="eyebrow">${icon('pin')}Picture · ${esc(p.id)}</span><button class="back" data-act="back">${icon('back')}Back</button></header>
    <div class="ident"><span class="poster big" style="--g:${GENRE[p.genre]}">${icon(STAGE_ICON[PHASE_INDEX[p.phase] ?? 0])}<b>${esc(p.genre)}</b></span><div><h2>${esc(p.title)}</h2><span class="sub">${esc(p.phase)} · ${esc(p.place)}</span>${phaseDots(p, 'lg')}</div></div>
    <div class="facts">
      <div><small>Current work</small><b>${esc(p.state)}</b></div>
      <div><small>Where</small><button class="link" data-act="site:${buildingFor(p.place)?.id}">${esc(p.place)}</button></div>
      ${lead ? `<div class="who-row wide"><small>Company on this picture</small><span class="faces">${[lead, ...people().filter(q => q.work === p.title && q.id !== lead.id)].map(q => `<button class="face" data-act="person:${q.id}" title="${esc(q.name)} · ${esc(q.role)}">${portraitSVG(q, 34)}<b>${esc(q.name.split(' ')[0])}</b></button>`).join('')}</span></div>` : ''}
    </div>
    ${strip}
    <footer>${wait ? `<button class="btn ghost" data-act="noop">Open Post schedule</button><span class="grow"></span><button class="btn primary" data-act="back">Back to studio</button>`
      : `<button class="btn ghost" data-act="noop">View company & production</button><span class="grow"></span><button class="btn primary" data-act="schedule" ${S.response === 'pending' ? 'disabled' : ''}>${S.response === 'success' ? 'Scheduled' : 'Schedule the shooting take'}</button>`}</footer>
  </section>`;
}
function workspaceCompare() {
  const p = project('SCRIPT-021'); const [celia, leon] = FIXTURE.candidates; const selected = S.candidate || celia.id;
  const card = c => `<article class="cand ${c.id === selected ? 'selected' : ''} ${c.status.startsWith('Unavailable') ? 'unavail' : ''}">
      <div class="ident">${portraitSVG(c, 96)}<div><h3>${esc(c.name)}</h3><span class="sub">${esc(c.role)} · ${esc(c.id)}</span><span class="chip ${c.status.startsWith('Unavailable') ? 'st-wait' : 'st-free'}">${icon(c.status.startsWith('Unavailable') ? 'clock' : 'check')}<span>${esc(c.status)}</span></span></div></div>
      <dl class="kv"><div><dt>Role fit</dt><dd><b>${c.fit}</b><i class="bar"><s style="width:${c.fit}%"></s></i></dd></div><div><dt>Perceived OVR</dt><dd><b>${c.ovr}</b><i class="bar"><s style="width:${c.ovr}%"></s></i></dd></div><div><dt>Camera test</dt><dd>${esc(c.test)}</dd></div><div><dt>Picture fee</dt><dd>${esc(c.fee)}</dd></div></dl>
      <p class="note">${esc(c.note)}</p>
      <footer>${c.status.startsWith('Unavailable') ? `<button class="btn ghost" data-act="candidate:${c.id}">Inspect record</button><span class="why">Cannot be assigned from this view</span>` : `<button class="btn ${c.id === selected ? 'primary' : 'ghost'}" data-act="candidate:${c.id}">${c.id === selected ? 'In the lead draft' : 'Use in lead draft'}</button>`}</footer>
    </article>`;
  return `<section class="workspace compare" aria-label="Casting comparison">
    <header><div><span class="eyebrow">${icon('clapper')}Casting · ${esc(p.id)}</span><h2>${esc(p.title)}</h2><span class="sub">${esc(p.genre)} · lead role · uncommitted company</span></div><button class="back" data-act="back">${icon('back')}Back</button></header>
    <div class="draft"><div class="slots">${[['Director', 'P-004'], ['Craft lead', 'P-022'], ['Antagonist', 'P-019'], ['Support', 'P-018']].map(([r, id]) => { const q = person(id); return `<span class="slot">${portraitSVG(q, 28)}<span><small>${r}</small><b>${esc(q.name)}</b></span></span>`; }).join('')}<span class="slot lead"><span class="ph">${icon('star')}</span><span><small>Lead</small><b>${esc(person(selected).name)}</b></span></span></div><span class="budget"><small>Draft budget + marketing</small><b>$700,000</b><em>Draft intact · selection does not sign</em></span></div>
    <h3 class="cmp-title">Compare for the lead</h3>
    <div class="cols">${card(celia)}${card(leon)}</div>
    <footer class="ws-foot"><span><b>Draft commitment · $700,000</b><em>Illustrative immediate budget; payroll is reviewed separately.</em></span><span class="grow"></span><button class="btn ghost" data-act="back">Back to candidates</button><button class="btn primary" data-act="noop">Review greenlight</button></footer>
  </section>`;
}
function screenNote() {
  const notes = { overview: 'Overview', person: 'Person', production: 'Production', compare: 'Casting compare' };
  return notes[S.screen] || '';
}
// ---------- annotations ----------
const ANNOT = {
  overview: { title: 'Cards over the world, not panels over a page', items: [
    ['A', 'HUD recedes', 'Dark 52 px strip: transport, date, the year timeline with event pins, cash with last-week delta, rank, Menu. Pause is a HUD-wide stamp.'],
    ['B', 'People stack', 'A translucent shelf holds tabs with counts, search, and index cards: portrait with rank badge, name, role + ID, status chip. Left edge colour repeats the status.'],
    ['C', 'Pictures stack', 'Genre-coloured poster tile with the stage pictogram, title, five phase pictograms with the current one lit, state line. Edge tab: gold "!" = your decision, grey clock = normal wait.'],
    ['D', 'Lot is the ground', 'Textured ground, shaded materials, painted stage numbers, signage that is not the label, posed people, props. Site labels are anchored to the building base.'],
    ['E', 'Corner', 'Build + Records only. Cash opens Finance; Menu holds campaigns and help.']] },
  person: { title: 'Compact exact person, studio still tracked', items: [
    ['A', 'Selection travels', 'The rail card, the lot footprint, the site label and the located marker share one gold state.'],
    ['B', 'Index card', 'Portrait, name in the display face, role + ID + status chip. Facts in labelled pairs; "More facts" expands in place (right-click does the same).'],
    ['C', 'Both rails stay', 'Neither list moves; the lot pans so the person is centred in the free region.'],
    ['D', 'Actions', 'Ghost buttons for navigation, one green primary. Nothing here signs or spends.']] },
  production: { title: 'Decision strip, company faces, honest waiting', items: [
    ['A', 'Poster + phases', 'Genre tile and the five stage pictograms with the current stage lit replace the thin segment bar.'],
    ['B', 'Company faces', 'Everyone on this picture as small portraits — click to inspect that exact person.'],
    ['C', 'Decision strip', 'Gold "!" strip states the decision and the consequence; a normal wait uses the grey clock strip and never invents a remedy.'],
    ['D', 'Site link', 'Where the work is; the lot has already panned there and lit the footprint.']] },
  compare: { title: 'Same family at higher density', items: [
    ['A', 'Draft strip', 'The retained draft as faces + roles; the lead slot shows who is currently in it.'],
    ['B', 'Candidate cards', 'Same portrait system at 96 px; fit/OVR with bars (words and numbers stay primary).'],
    ['C', 'Unavailable', 'Leon keeps his facts but the card is muted and says why he cannot be assigned.'],
    ['D', 'Rails retained', 'Deliberately larger workspace; both rails still visible and interactive.']] },
};
function annotations() {
  if (!S.annotated) return '';
  const a = ANNOT[S.screen]; if (!a) return '';
  return `<div class="annot-title"><small>OPUS PROPOSAL · ANNOTATED</small><h2>${esc(a.title)}</h2></div>${a.items.map(([k, t, b]) => `<section><h3><b>${k}</b>${esc(t)}</h3><p>${esc(b)}</p></section>`).join('')}<p class="stamp">PROPOSED DESIGN / MOCK DATA — NOT IMPLEMENTED</p>`;
}
const CALLOUTS = {
  overview: [['A', 700, 60], ['B', 26, 120], ['C', 1410, 120], ['D', 720, 600], ['E', 60, 820]],
  person: [['A', 560, 330], ['B', 480, 470], ['C', 1410, 120], ['D', 940, 800]],
  production: [['A', 430, 500], ['B', 700, 640], ['C', 700, 740], ['D', 950, 580]],
  compare: [['A', 300, 210], ['B', 300, 330], ['C', 1140, 330], ['D', 1410, 120]],
};
function callouts() { if (!S.annotated) return ''; return (CALLOUTS[S.screen] || []).map(([k, x, y]) => `<span class="callout" style="left:${x}px;top:${y}px">${k}</span>`).join(''); }

// ---------- render ----------
function render() {
  const g = $('#game');
  g.className = `game dir-${S.dir} world-${S.world} text-${S.text} screen-${S.screen} rails-${S.rails}`;
  document.body.classList.toggle('annotated', S.annotated);
  g.innerHTML = hud() + railPeople() + railPictures() + corner() + world() +
    (S.screen === 'person' ? inspectorPerson() : S.screen === 'production' ? inspectorProduction() : S.screen === 'compare' ? workspaceCompare() : '') + callouts();
  $('#annotations').innerHTML = annotations();
  $('#board').value = S.screen; $('#dir').value = S.dir; $('#worldsel').value = S.world; $('#fixture').value = S.fixture;
}
// ---------- input ----------
function go(screen, extra = {}) { S.trail.push({ screen: S.screen, selectedPerson: S.selectedPerson, selectedProject: S.selectedProject, candidate: S.candidate, expanded: S.expanded }); Object.assign(S, extra, { screen, hover: null }); render(); }
function back() { const t = S.trail.pop(); if (!t) { Object.assign(S, { screen: 'overview', selectedPerson: '', selectedProject: '', hover: null }); } else Object.assign(S, t, { hover: null }); render(); }
function act(a, el) {
  const [k, v] = a.split(':');
  if (k === 'person') { if (S.screen === 'compare') go('person', { selectedPerson: v, selectedProject: '' }); else go('person', { selectedPerson: v, selectedProject: '', expanded: false }); }
  else if (k === 'project') { const p = project(v); if (p.released) return; if (p.phase === 'Casting') go('compare', { selectedProject: v, selectedPerson: '' }); else go('production', { selectedProject: v, selectedPerson: '' }); }
  else if (k === 'site') { const b = FIXTURE.buildings.find(b => b.id === v); const pr = projects().find(p => p.place === b.name && !p.released); if (pr) act('project:' + pr.id); }
  else if (k === 'rails') { S.rails = S.rails === 'compact' ? 'full' : 'compact'; render(); }
  else if (k === 'people') { S.people = v; render(); }
  else if (k === 'pictures') { S.pictures = v; render(); }
  else if (k === 'back') back();
  else if (k === 'expand') { S.expanded = !S.expanded; render(); }
  else if (k === 'candidate') { if (v === 'P-015') go('person', { selectedPerson: v }); else { S.candidate = v; render(); } }
  else if (k === 'schedule') { S.response = 'pending'; render(); setTimeout(() => { S.response = 'success'; render(); }, 900); }
  else if (k === 'build' || k === 'records' || k === 'finance' || k === 'menu' || k === 'noop') { toast(k === 'noop' ? 'Static in this proposal — the R2 prototype keeps this behaviour.' : `“${k}” is unchanged from R2 in this proposal (see the review).`); }
}
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200); }
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && $('#game').contains(b)) { e.preventDefault(); act(b.dataset.act, b); } });
document.addEventListener('contextmenu', e => { const b = e.target.closest('.row.person'); if (b) { e.preventDefault(); if (S.screen === 'person' && S.selectedPerson === b.dataset.id) { S.expanded = !S.expanded; render(); } else go('person', { selectedPerson: b.dataset.id, selectedProject: '', expanded: true }); } });
document.addEventListener('mouseover', e => { const b = e.target.closest('.row'); if (!b) { if (S.hover) { S.hover = null; const pk = $('.peek'); if (pk) pk.remove(); } return; } const r = b.getBoundingClientRect(); const g = $('#game').getBoundingClientRect(); const kind = b.classList.contains('person') ? 'person' : 'project'; S.hover = { kind, id: b.dataset.id, x: kind === 'person' ? r.right - g.left + 10 : r.left - g.left - 286, y: r.top - g.top }; const old = $('.peek'); if (old) old.remove(); $('.world').insertAdjacentHTML('beforeend', tooltip()); });
document.addEventListener('input', e => { if (e.target.matches('.search input')) { S.search = e.target.value; const list = $('#people-list'); const all = people(); const q = S.search.trim().toLowerCase(); const l = all.filter(p => (S.people === 'All' || p.group === S.people) && (!q || (p.name + ' ' + p.role + ' ' + p.id).toLowerCase().includes(q))); list.innerHTML = l.length ? l.map(p => personRow(p, all.indexOf(p))).join('') : '<p class="empty">No one matches. Clear the search to see everyone.</p>'; } });
document.addEventListener('keydown', e => {
  if (e.target.matches('input')) return;
  if (e.key === 'Escape' && S.screen !== 'overview') back(); else if (e.key === 'Escape' && S.hover) { S.hover = null; render(); }
  if (e.key === '1') { const r = $('#people-list .row'); if (r) r.focus(); }
  if (e.key === '2') { const r = $('#pictures-list .row'); if (r) r.focus(); }
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target.matches('[role=tab]')) { const tabs = Array.from(e.target.parentNode.querySelectorAll('[role=tab]')); const i = tabs.indexOf(e.target); const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.click(); const again = Array.from($('#game').querySelectorAll('[role=tab]')).find(t => t.dataset.act === n.dataset.act); if (again) again.focus(); }
  if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.target.matches('.row')) { e.preventDefault(); const rows = Array.from(e.target.closest('.list').querySelectorAll('.row')); const i = rows.indexOf(e.target); const n = rows[Math.max(0, Math.min(rows.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))]; if (n) n.focus(); }
});
$('#board').addEventListener('change', e => { params.set('screen', e.target.value); location.search = params.toString(); });
$('#dir').addEventListener('change', e => { params.set('dir', e.target.value); location.search = params.toString(); });
$('#worldsel').addEventListener('change', e => { params.set('world', e.target.value); location.search = params.toString(); });
$('#fixture').addEventListener('change', e => { params.set('fixture', e.target.value); location.search = params.toString(); });
$('#reset').addEventListener('click', () => { location.search = ''; });
reset();
