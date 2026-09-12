'use strict';
// Generated from app.js (icon set + row builders) so the sheet and the prototype share one source.
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const params = new URLSearchParams('');
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


let S = { selectedPerson: 'P-006', selectedProject: 'FILM-014', response: 'ready', fixture: 'mature', rails: 'full' };
const people = () => FIXTURE.employees; const projects = () => FIXTURE.projects;
const person = id => people().find(p => p.id === id);
const needsMe = p => !!p.action; const isWait = p => !!p.waiting;
const statusKind = p => p.status === 'Working' || p.status === 'Writing' ? 'work' : (p.status === 'Waiting' || /^Unavailable/.test(p.status)) ? 'wait' : 'free';
const statusWord = p => p.status === 'Working' ? 'On set' : p.status === 'Writing' ? 'Writing' : p.status === 'Waiting' ? 'Waiting' : /^Unavailable/.test(p.status) ? 'Unavailable' : 'Free';
const statusChip = (p, cls = '') => `<span class="chip st-${statusKind(p)} ${cls}">${icon(statusKind(p) === 'work' ? (p.status === 'Writing' ? 'quill' : 'camera') : statusKind(p) === 'wait' ? 'clock' : 'check')}<span>${esc(statusWord(p))}</span></span>`;
function personRow(p, i, extra = '') { const sel = S.selectedPerson === p.id; return `<button class="row person ${sel ? 'selected' : ''} ${extra}" data-id="${p.id}">${portraitSVG(p, 44, { rank: i < 3 ? String(31 + i * 7) : '' })}<span class="txt"><strong>${esc(p.name)}</strong><span class="meta">${icon(ROLE_ICON[p.role] || 'star', 'role')}${esc(p.role)} <em>${esc(p.id)}</em>${statusChip(p)}</span></span></button>`; }
function phaseDots(p) { const cur = PHASE_INDEX[p.phase] ?? 0; return `<span class="phases">${FIXTURE.phases.map((ph, i) => `<i class="${i < cur ? 'done' : i === cur ? 'now' : ''}">${icon(STAGE_ICON[i])}</i>`).join('')}</span>`; }
function pictureRow(p, extra = '') { const sel = S.selectedProject === p.id, need = needsMe(p), wait = isWait(p); return `<button class="row picture ${sel ? 'selected' : ''} ${need ? 'need' : ''} ${wait ? 'wait' : ''} ${extra}"><span class="poster" style="--g:${GENRE[p.genre] || '#666'}">${icon(STAGE_ICON[PHASE_INDEX[p.phase] ?? 0])}</span><span class="txt"><strong>${esc(p.title)}</strong>${phaseDots(p)}<span class="meta">${esc(p.state)}</span></span>${need ? `<span class="tab need">${icon('bang')}</span>` : wait ? `<span class="tab wait">${icon('clock')}</span>` : p.released ? `<span class="tab lib">${icon('can')}</span>` : ''}</button>`; }
// palette
const PAL = [['Ink', '#2b221c', 'text, icons on stock'], ['Card stock', '#f5eddc', 'cards, inspectors, labels'], ['Shelf', 'rgba(26,21,16,.66)', 'translucent rail ground'], ['Gold', '#d9a93b', 'selection, decision, timeline now'], ['Greenlight', '#2e7a4d', 'the one primary action'], ['Signal', '#b5352a', 'refusal / alert'], ['Wait', '#5b7381', 'normal waiting'], ['On set', '#3f7a4f', 'working status'], ['Free', '#8a7f6a', 'available status'], ['Gold deep', '#8f6a16', 'gold on stock (text)'], ['Muted', '#6e6153', 'secondary text on stock'], ['Muted on dark', '#cdbfa8', 'secondary text on shelf/HUD']];
$('#palette').innerHTML = PAL.map(([n, c, u]) => `<div class="sw"><i style="background:${c}"></i><b>${n}</b><span>${c} · ${u}</span></div>`).join('');
const lum = h => { const c = h.replace('#', ''); const [r, g, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return ((Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05)).toFixed(2) + ':1'; };
const PAIRS = [['Ink / card stock', '#2b221c', '#f5eddc', 'body text'], ['Muted / card stock', '#6e6153', '#f5eddc', 'secondary text (12 px+)'], ['Gold deep / card stock', '#8f6a16', '#f5eddc', 'eyebrows, links'], ['Ink / gold', '#2b221c', '#d9a93b', 'selected label, decision tab'], ['White / greenlight', '#ffffff', '#2e7a4d', 'primary button'], ['White / on-set', '#ffffff', '#3f7a4f', 'status chip'], ['White / wait', '#ffffff', '#5b7381', 'wait chip'], ['Cream / HUD', '#f2e8d2', '#1b1612', 'HUD text'], ['Muted-on-dark / HUD', '#cdbfa8', '#1b1612', 'HUD secondary'], ['Focus ring / stock', '#2a7fd4', '#f5eddc', 'keyboard focus']];
$('#contrast tbody').innerHTML = PAIRS.map(([n, f, b, u]) => `<tr><td>${n}</td><td><code>${f}</code> / <code>${b}</code></td><td><b>${ratio(f, b)}</b></td><td>${u}</td></tr>`).join('');
// type
const TYPE = [['Display · HUD numerals', 'font: 700 18px/1 var(--display); letter-spacing:.03em', '$2,480,000', 'Futura-class geometric (system: Futura → Avenir Next Condensed → Gill Sans → Trebuchet MS). Production: one licensed geometric Deco-flavoured display face — art dependency.'], ['Display · inspector title', 'font: 700 22px/1.05 var(--display)', 'The Glass Harbor', 'Titles, names in inspectors; never below 20 px.'], ['Display · rail name', 'font: 700 14px/1.15 var(--display)', 'Mara Vale', 'Rail names and picture titles; clamp 2 lines.'], ['Display · micro label', 'font: 700 11px/1 var(--display); letter-spacing:.16em; text-transform:uppercase', 'PERSON · P-004', 'Eyebrows, group headers, tool labels: tracked caps, floor 10 px.'], ['Body · reading', 'font: 14px/1.35 var(--body)', 'The company and set are ready. Scheduling permits the next work step.', 'Humanist sans (system: Avenir Next → Gill Sans → Segoe UI → Trebuchet MS). Floor 12 px anywhere at 1440×900.'], ['Body · meta', 'font: 12px/1.2 var(--body); color: var(--ink-2)', 'Director · P-004 · Stage 07', 'Role, ID, state lines. R2 used 10 px.'], ['Body · button', 'font: 700 13px/1 var(--body)', 'Schedule the shooting take', 'Min height 34 px; workspace actions 40 px.']];
$('#type').innerHTML = TYPE.map(([n, st, sample, note]) => `<div class="type-row"><small>${n}</small><span style="${st}">${sample}</span><span style="margin-left:auto;width:360px;color:var(--muted);font:11px var(--body)">${note}</span></div>`).join('');
// icons
$('#icons').innerHTML = Object.keys(ICON).map(k => `<figure class="${['pause','play','fast','build','ledger','coin'].includes(k) ? 'dark' : ''}">${icon(k)}<figcaption>${k}</figcaption></figure>`).join('');
// portraits
const mara = person('P-004'); const nora = person('P-006');
$('#portraits').innerHTML = [[44, 'rail 44'], [72, 'compact 72'], [96, 'compare 96'], [120, 'dossier 120']].map(([s, l]) => `<figure>${portraitSVG(mara, s, { rank: '31' })}<figcaption>${l}</figcaption></figure>`).join('') + `<figure style="margin-left:20px"><div style="display:flex;gap:6px">${FIXTURE.employees.map(p => portraitSVG(p, 36)).join('')}</div><figcaption>twelve distinguishable fixture faces (procedural placeholders)</figcaption></figure>`;
// rows
const pp = people();
$('#rows-people').innerHTML = `<aside class="rail rail-people"><div class="list">${personRow(pp[0], 0)}${personRow(pp[1], 1)}${personRow(pp[7], 7)}${personRow(pp[5], 5)}${personRow({ ...FIXTURE.candidates[1], group: 'Talent', work: 'Another film', place: 'Elsewhere', status: 'Unavailable' }, 9, 'unavail')}</div></aside>`;
const pr = projects();
$('#rows-pictures').innerHTML = `<aside class="rail rail-pictures"><div class="list"><h4 class="grp">Scripts <b>2</b></h4>${pictureRow(pr[0])}${pictureRow(pr[2])}<h4 class="grp">Shooting <b>1</b></h4>${pictureRow(pr[3])}<h4 class="grp">Post &amp; release <b>1</b></h4>${pictureRow(pr[5])}<h4 class="grp">Library <b>1</b></h4>${pictureRow(pr[7])}</div></aside>`;
document.querySelectorAll('#rows-people .row')[1].classList.add('hover-demo'); document.querySelectorAll('#rows-people .row')[1].style.background = '#fbf5e6';
document.querySelectorAll('#rows-people .row')[4].style.opacity = '.7';
// buttons
$('#buttons').innerHTML = [['Normal', ''], ['Hover', 'hover'], ['Pressed', 'pressed'], ['Focus', 'focus'], ['Disabled', 'disabled']].map(([l, c]) => `<figure style="margin:0;text-align:center;font:11px var(--body);color:var(--muted)"><div class="btnrow"><button class="btn primary ${c}" ${c === 'disabled' ? 'disabled' : ''}>Greenlight</button><button class="btn ghost ${c}" ${c === 'disabled' ? 'disabled' : ''}>Back to candidates</button></div><figcaption>${l}</figcaption></figure>`).join('');
$('#strips').innerHTML = [
  ['need', 'bang', 'Your decision: schedule the shooting take.', 'Consequence stated; one primary action.'],
  ['wait', 'clock', 'Normal wait — no action from you.', 'Reason stated; no invented remedy.'],
  ['pending', 'clock', 'Submitting schedule…', 'Repeat submit disabled.'],
  ['ok', 'check', 'Take scheduled — receipt (simulated).', 'Calendar unchanged in the demo.'],
  ['refused', 'bang', 'Refused — schedule changed.', 'Review the current state, then retry.'],
  ['refused', 'bang', 'Unresolved — response not received.', 'Retry recovers the same request.'],
].map(([k, ic, b, s]) => `<figure><div class="strip ${k}" style="margin:0">${icon(ic)}<div><b>${b}</b><span>${s}</span></div></div><figcaption>${k}</figcaption></figure>`).join('');
