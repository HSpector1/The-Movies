// Re-measurement of the R3 prototype with exact selectors and recorded state.
// Usage: node r3-remeasure.cjs <r3-picture-cards dir> <out dir>
// Isolated: fresh Chromium context, every non-file:// request aborted, no storage, no game connection.
'use strict';
const { chromium } = require('/Users/bruce/dynasty-blueprint/node_modules/playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = process.argv[2], OUT = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const url = q => 'file://' + path.join(ROOT, 'index.html') + (q ? '?' + q : '');

const HELPERS = `
window.__m = (() => {
  const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
  const f1 = n => Math.round(n * 10) / 10;
  const rect = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: f1(r.left), y: f1(r.top), w: f1(r.width), h: f1(r.height), right: f1(r.right), bottom: f1(r.bottom) }; };
  const area = r => Math.max(0, r.w) * Math.max(0, r.h);
  const inter = (a, b) => { if (!a || !b) return null; const x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y), x2 = Math.min(a.right, b.right), y2 = Math.min(a.bottom, b.bottom); const w = Math.max(0, x2 - x1), h = Math.max(0, y2 - y1); const ia = w * h; return { w: f1(w), h: f1(h), area: Math.round(ia), fractionOfB: area(b) ? +(ia / area(b)).toFixed(3) : null }; };
  const state = () => ({ screen: S.screen, fixture: S.fixture, text: S.text, treatment: S.treatment, selectedPerson: S.selectedPerson, selectedProject: S.selectedProject, selectedSite: S.selectedSite, expanded: S.expanded, pictures: S.pictures, people: S.people, viewport: [innerWidth, innerHeight], dpr: devicePixelRatio, gameClass: $('#game').className });
  const focusDesc = () => { const a = document.activeElement; if (!a || a === document.body) return { inGame: false, desc: 'body' }; return { inGame: !!a.closest('#game'), desc: (a.dataset.focus || a.id || a.getAttribute('aria-label') || a.textContent.trim().slice(0, 40) || a.tagName).slice(0, 60), sel: a.className.split(' ').slice(0, 2).join('.') }; };
  const listVis = (listSel, itemSel) => { const list = $(listSel); if (!list) return null; const lr = list.getBoundingClientRect(); const items = $$(listSel + ' ' + itemSel); const full = [], part = []; items.forEach((e, i) => { const r = e.getBoundingClientRect(); if (r.top >= lr.top - 1 && r.bottom <= lr.bottom + 1) full.push(i + 1); else if (r.bottom > lr.top && r.top < lr.bottom) part.push(i + 1); }); return { total: items.length, fullyVisible: full, partiallyVisible: part, listRect: rect(list), scrollTop: f1(list.scrollTop), scrollHeight: list.scrollHeight, clientHeight: list.clientHeight }; };
  const leaves = rootSel => $$(rootSel + ' *').filter(e => e.children.length === 0 && e.textContent.trim() && !e.closest('.sr-only') && getComputedStyle(e).display !== 'none');
  const fontHist = rootSel => { const h = {}; leaves(rootSel).forEach(e => { const cs = getComputedStyle(e); const k = parseFloat(cs.fontSize); (h[k] = h[k] || { n: 0, samples: [] }).n++; if (h[k].samples.length < 3) h[k].samples.push(e.textContent.trim().slice(0, 24)); }); return h; };
  const fontFaces = rootSel => { const m = new Map(); leaves(rootSel).forEach(e => { const cs = getComputedStyle(e); const k = cs.fontFamily + '|' + cs.fontWeight + '|' + parseFloat(cs.fontSize); if (!m.has(k)) m.set(k, { family: cs.fontFamily, weight: cs.fontWeight, size: parseFloat(cs.fontSize), sample: e.textContent.trim().slice(0, 24), n: 0 }); m.get(k).n++; }); return [...m.values()]; };
  const c = document.createElement('canvas').getContext('2d');
  // XAG 101 body height = ascender + x-height + descender of rendered glyphs; measured on "Hhfg" (the letters in XAG's own diagram).
  const bodyHeight = (family, weight, size) => { c.font = weight + ' ' + size + 'px ' + family; const m = c.measureText('Hhfg'); return f1(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent); };
  const fontAvailable = name => { const t = 'mmmmmmmmmmlli'; c.font = '40px monospace'; const a = c.measureText(t).width; c.font = '40px "' + name + '", monospace'; return c.measureText(t).width !== a; };
  const tokens = () => { const rad = {}, sh = {}; $$('#game *').forEach(e => { const cs = getComputedStyle(e); if (cs.borderRadius && cs.borderRadius !== '0px') rad[cs.borderRadius] = (rad[cs.borderRadius] || 0) + 1; if (cs.boxShadow && cs.boxShadow !== 'none') sh[cs.boxShadow] = (sh[cs.boxShadow] || 0) + 1; }); return { radii: rad, shadows: sh }; };
  const hud = () => { const name = rect($('.hud .marque .name')); const labels = $$('.hud .timeline i b').map(b => ({ year: b.textContent, r: rect(b) })); const now = rect($('.hud .timeline i.now')); const tl = rect($('.hud .timeline')); const overlaps = labels.map(l => ({ year: l.year, withName: inter(name, l.r) })).filter(o => o.withName && o.withName.area > 0); return { name, timeline: tl, now, labels, nameOverlapsLabels: overlaps, verticalOverlapNameVsLabels: name && labels.length ? f1(Math.min(name.bottom, Math.max(...labels.map(l => l.r.bottom))) - Math.max(name.y, Math.min(...labels.map(l => l.r.y)))) : null }; };
  const layout = () => ({ hud: rect($('header.hud')), railPeople: rect($('aside.rail-people')), railPictures: rect($('aside.rail-pictures')), corner: rect($('nav.corner')), world: rect($('.world')) });
  const inspector = () => { const el = $('section.inspector'); if (!el) return null; const fp = $('.world svg.fp polygon'); const marker = $('.world .marker'); const lit = $('.world button.site.lit'); const corner = $('nav.corner'); const rp = rect($('aside.rail-people')), rr = rect($('aside.rail-pictures')), hud = rect($('header.hud')); const free = { x: rp.right, y: hud.bottom, right: rr.x, bottom: innerHeight, w: rr.x - rp.right, h: innerHeight - hud.bottom }; const ir = rect(el); const sc = $('#inspector-scroll'); return { selector: 'section.' + el.className.trim().split(/\\s+/).join('.'), rect: ir, contentScroll: sc ? { scrollHeight: sc.scrollHeight, clientHeight: sc.clientHeight, clipped: sc.scrollHeight > sc.clientHeight + 1 } : null, footprint: rect(fp), marker: rect(marker), litSite: lit ? { text: lit.textContent, rect: rect(lit) } : null, corner: rect(corner), freeLot: { x: f1(free.x), y: f1(free.y), w: f1(free.w), h: f1(free.h) }, covers: { footprint: inter(ir, rect(fp)), marker: inter(ir, rect(marker)), litSite: lit ? inter(ir, rect(lit)) : null, corner: inter(ir, rect(corner)), freeLot: inter(ir, { x: free.x, y: free.y, right: free.right, bottom: free.bottom, w: free.w, h: free.h }) } }; };
  const twoAxis = () => $$('#game *').filter(e => { const cs = getComputedStyle(e); return /auto|scroll/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1; }).map(e => ({ sel: e.id ? '#' + e.id : e.className, scrollWidth: e.scrollWidth, clientWidth: e.clientWidth }));
  return { rect, inter, state, focusDesc, listVis, fontHist, fontFaces, bodyHeight, fontAvailable, tokens, hud, layout, inspector, twoAxis, $ , $$ };
})();`;

(async () => {
  const b = await chromium.launch();
  const log = { meta: { date: '2026-09-13', platform: os.platform() + ' ' + os.release(), chromium: b.version(), playwright: require('/Users/bruce/dynasty-blueprint/node_modules/playwright/package.json').version, root: ROOT, isolation: 'fresh context; all non-file:// requests aborted; no storage', note: 'CSS px at devicePixelRatio 1; Chromium/macOS font fallback; not a native Unity rendering' }, errors: [], blocked: [], results: {} };
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://')) return r.continue(); log.blocked.push(u); r.abort(); });
  await ctx.addInitScript(HELPERS);
  const p = await ctx.newPage(); p.on('pageerror', e => log.errors.push(String(e)));
  const shot = async n => { await p.waitForTimeout(200); await p.screenshot({ path: path.join(OUT, n + '.png') }); };
  const ev = (fn, ...a) => p.evaluate(fn, ...a);
  const R = log.results;

  // ---------- A. 1440x900 · text 100 · mature · overview ----------
  await p.goto(url()); await p.waitForTimeout(400);
  R.A_state = await ev(() => __m.state());
  R.A_fonts_available = await ev(() => ({ Futura: __m.fontAvailable('Futura'), 'Avenir Next': __m.fontAvailable('Avenir Next'), 'Avenir Next Condensed': __m.fontAvailable('Avenir Next Condensed'), 'Gill Sans': __m.fontAvailable('Gill Sans') }));
  R.A_layout = await ev(() => __m.layout());
  // A1 tab walk
  const stops = [];
  for (let i = 0; i < 80; i++) { await p.keyboard.press('Tab'); const d = await ev(() => __m.focusDesc()); stops.push(d); if (/^picture-row-/.test(d.desc)) break; }
  const firstPerson = stops.findIndex(s => /^person-row-/.test(s.desc)) + 1, firstPicture = stops.findIndex(s => /^picture-row-/.test(s.desc)) + 1;
  const external = stops.filter(s => !s.inGame).length;
  R.A1_tabWalk = { totalStops: stops.length, firstPersonTab: firstPerson, firstPictureTab: firstPicture, externalPrototypeStopsBeforeFirstPicture: external, inGameTabsToFirstPerson: firstPerson - stops.slice(0, firstPerson).filter(s => !s.inGame).length, inGameTabsToFirstPicture: firstPicture - stops.slice(0, firstPicture).filter(s => !s.inGame).length, stops: stops.map((s, i) => `${i + 1}${s.inGame ? '' : ' [demo bar]'} ${s.desc}`) };
  // A2 existing keyboard affordances
  await p.goto(url()); await p.waitForTimeout(300);
  await ev(() => __m.$('#people-list .row.person').focus());
  await p.keyboard.press('ArrowDown'); const afterDown = await ev(() => __m.focusDesc());
  await p.keyboard.press('2'); const afterTwo = await ev(() => __m.focusDesc());
  await p.keyboard.press('1'); const afterOne = await ev(() => __m.focusDesc());
  const rowTabindex = await ev(() => ({ personRows: __m.$$('#people-list .row.person').map(e => e.tabIndex), movieCards: __m.$$('#pictures-list .movie-card').map(e => e.tabIndex) }));
  R.A2_keyboard = { arrowDownFromFirstPerson: afterDown, hotkey2: afterTwo, hotkey1: afterOne, rowTabindex, note: 'ArrowUp/Down inside a list and 1/2 hotkeys exist in R3 (movie-cards.js keydown handler); every row is still a Tab stop (tabIndex 0).' };
  // A3 range vs independent count
  await p.goto(url()); await p.waitForTimeout(300);
  const rangeAt = async st => { await ev(s => { const l = __m.$('#pictures-list'); l.scrollTop = s === 'max' ? l.scrollHeight : s; }, st); await p.waitForTimeout(150); return ev(() => ({ range: __m.$('#movie-range').textContent, list: __m.listVis('#pictures-list', '.movie-card'), up: __m.$('[data-act="page-up"]').getAttribute('aria-disabled'), down: __m.$('[data-act="page-down"]').getAttribute('aria-disabled') })); };
  R.A3_range = { scroll0: await rangeAt(0), scroll40: await rangeAt(40), scrollMax: await rangeAt('max') };
  await ev(() => { __m.$('#pictures-list').scrollTop = 0; }); await p.waitForTimeout(150);
  await p.click('[data-act="page-down"]'); await p.waitForTimeout(150);
  R.A3_range.afterPageDownFromTop = await ev(() => ({ range: __m.$('#movie-range').textContent, list: __m.listVis('#pictures-list', '.movie-card') }));
  await p.click('[data-act="page-up"]'); await p.waitForTimeout(150);
  R.A3_range.afterPageUp = await ev(() => ({ range: __m.$('#movie-range').textContent, list: __m.listVis('#pictures-list', '.movie-card') }));
  R.A3_range.source = 'movie-cards.js updateRange(): range from element rects; page-up/down add ±0.8×clientHeight to #pictures-list.scrollTop then call updateRange(); scroll listener calls updateRange()';
  // A4 rows
  await p.goto(url()); await p.waitForTimeout(300);
  R.A4_rows = await ev(() => ({ people: __m.listVis('#people-list', '.row.person'), pictures: __m.listVis('#pictures-list', '.movie-card'), personRowHeights: __m.$$('#people-list .row.person').map(e => Math.round(e.getBoundingClientRect().height)), personRowLines: __m.$$('#people-list .row.person').slice(0, 12).map(e => ({ name: e.querySelector('strong').textContent, lines: Math.round(e.querySelector('.txt').getBoundingClientRect().height / 14) })) }));
  await shot('rm-01-1440-std-home');
  // A5 HUD
  R.A5_hud = await ev(() => __m.hud());
  // A6 fonts and body heights
  R.A6_fonts = await ev(() => { const areas = { hud: 'header.hud', railPeople: 'aside.rail-people', railPictures: 'aside.rail-pictures', world: '.world', corner: 'nav.corner' }; const out = {}; for (const [k, s] of Object.entries(areas)) out[k] = __m.fontHist(s); const faces = __m.fontFaces('#game').map(f => ({ ...f, bodyHeightPx: __m.bodyHeight(f.family, f.weight, f.size) })).sort((a, b) => a.size - b.size); const body = getComputedStyle(document.documentElement).getPropertyValue('--body').trim(); const disp = getComputedStyle(document.documentElement).getPropertyValue('--display').trim(); const probe = {}; for (const sz of [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]) probe[sz] = { body400: __m.bodyHeight(body, '400', sz), body600: __m.bodyHeight(body, '600', sz), display700: __m.bodyHeight(disp, '700', sz) }; return { byArea: out, faces, bodyHeightProbe: probe, stacks: { body, display: disp } }; });
  // A7 tokens
  R.A7_tokens = await ev(() => __m.tokens());
  // A8 early fixture rails
  await p.goto(url('fixture=early')); await p.waitForTimeout(300);
  R.A8_early = await ev(() => { const rp = __m.rect(__m.$('aside.rail-people')); const rows = __m.$$('#people-list .row.person').map(e => __m.rect(e)); const last = rows.at(-1); const rr = __m.rect(__m.$('aside.rail-pictures')); const cards = __m.$$('#pictures-list .movie-card').map(e => __m.rect(e)); return { state: __m.state(), railPeople: rp, peopleRows: rows.length, peopleContentBottom: last ? last.bottom : null, peopleEmptyBelowRowsPx: last ? Math.round(rp.bottom - last.bottom) : null, railPictures: rr, cards: cards.length, picturesContentBottom: cards.at(-1)?.bottom, picturesEmptyBelowCardsPx: cards.length ? Math.round(rr.bottom - cards.at(-1).bottom) : null }; });
  await shot('rm-02-1440-std-early');
  // A9 busy fixture tab count
  await p.goto(url('fixture=busy')); await p.waitForTimeout(400);
  { const st = []; for (let i = 0; i < 120; i++) { await p.keyboard.press('Tab'); const d = await ev(() => __m.focusDesc()); st.push(d); if (/^picture-row-/.test(d.desc)) break; } const fp = st.findIndex(s => /^picture-row-/.test(s.desc)) + 1; R.A9_busyTabs = { people: await ev(() => __m.$$('#people-list .row.person').length), pictures: await ev(() => __m.$$('#pictures-list .movie-card').length), firstPictureTab: fp, externalStops: st.filter(s => !s.inGame).length, inGameTabsToFirstPicture: fp - st.slice(0, fp).filter(s => !s.inGame).length }; }

  // ---------- B. inspectors at 1440x900 · text 100 ----------
  await p.goto(url()); await p.waitForTimeout(300);
  await p.click('#pictures-list .movie-card[data-id="FILM-014"]'); await p.waitForTimeout(300);
  R.B1_production_1440 = { state: await ev(() => __m.state()), inspector: await ev(() => __m.inspector()) };
  await shot('rm-03-1440-std-production-FILM-014');
  await p.goto(url('screen=production&id=FILM-014')); await p.waitForTimeout(300);
  R.B1_production_1440.viaUrlSameRect = JSON.stringify(await ev(() => __m.inspector().rect)) === JSON.stringify(R.B1_production_1440.inspector.rect);
  await p.goto(url()); await p.waitForTimeout(300);
  await p.click('#people-list .row.person[data-id="P-004"]'); await p.waitForTimeout(300);
  R.B2_person_1440 = { state: await ev(() => __m.state()), inspector: await ev(() => __m.inspector()) };
  await p.click('[data-act="expand"]'); await p.waitForTimeout(300);
  R.B2_person_1440_expanded = { state: await ev(() => __m.state()), inspector: await ev(() => __m.inspector()) };
  await shot('rm-04-1440-std-person-P-004-expanded');
  // the rail rectangle my earlier script mislabelled
  R.B3_railRectForComparison_1440 = await ev(() => ({ selectorMatchedByOldScript: (() => { const el = document.querySelector('[class*=inspector],[role=dialog],[aria-label^="Picture"]'); return el ? el.tagName.toLowerCase() + '.' + el.className.trim().split(/\s+/).join('.') + '[aria-label="' + el.getAttribute('aria-label') + '"]' : null; })(), railPictures: __m.rect(__m.$('aside.rail-pictures')) }));

  // ---------- C. 1280x720 · text 200 (Enlarged) ----------
  await p.setViewportSize({ width: 1280, height: 720 });
  await p.goto(url('text=200')); await p.waitForTimeout(400);
  R.C0_state = await ev(() => __m.state());
  R.C0_layout = await ev(() => __m.layout());
  R.C1_rows = await ev(() => ({ people: __m.listVis('#people-list', '.row.person'), pictures: __m.listVis('#pictures-list', '.movie-card') }));
  R.C2_hud = await ev(() => __m.hud());
  R.C3_fonts200 = await ev(() => { const areas = { hud: 'header.hud', railPeople: 'aside.rail-people', railPictures: 'aside.rail-pictures', corner: 'nav.corner' }; const out = {}; for (const [k, s] of Object.entries(areas)) out[k] = __m.fontHist(s); return out; });
  R.C3_twoAxisScroll = await ev(() => __m.twoAxis());
  await shot('rm-05-1280-enl-home');
  await p.goto(url('text=100')); await p.waitForTimeout(300);
  R.C3_fonts100_1280 = await ev(() => ({ hud: __m.fontHist('header.hud'), railPeople: __m.fontHist('aside.rail-people'), railPictures: __m.fontHist('aside.rail-pictures') }));
  await p.goto(url('text=200')); await p.waitForTimeout(300);
  await p.click('#pictures-list .movie-card[data-id="FILM-014"]'); await p.waitForTimeout(300);
  R.C4_production_1280_enl = { state: await ev(() => __m.state()), inspector: await ev(() => __m.inspector()), twoAxis: await ev(() => __m.twoAxis()) };
  await shot('rm-06-1280-enl-production-FILM-014');
  await p.goto(url('text=200')); await p.waitForTimeout(300);
  await p.click('#people-list .row.person[data-id="P-004"]'); await p.waitForTimeout(300);
  R.C5_person_1280_enl = { state: await ev(() => __m.state()), inspector: await ev(() => __m.inspector()) };
  await p.click('[data-act="expand"]'); await p.waitForTimeout(300);
  R.C5_person_1280_enl_expanded = { state: await ev(() => __m.state()), inspector: await ev(() => __m.inspector()) };
  await shot('rm-07-1280-enl-person-P-004-expanded');
  R.C6_railRectForComparison_1280 = await ev(() => __m.rect(__m.$('aside.rail-pictures')));
  // waiting picture (FILM-018) at 1280 enlarged
  await p.goto(url('text=200&screen=production&state=waiting')); await p.waitForTimeout(300);
  R.C7_waiting_1280_enl = { state: await ev(() => __m.state()), inspector: await ev(() => __m.inspector()) };

  fs.writeFileSync(path.join(OUT, 'r3-remeasure-log.json'), JSON.stringify(log, null, 1));
  await b.close();
  console.log('errors', log.errors.length, 'blocked', log.blocked.length);
})().catch(e => { console.error(e); process.exit(1); });
