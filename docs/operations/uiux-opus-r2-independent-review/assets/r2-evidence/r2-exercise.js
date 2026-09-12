// Isolated R2 prototype exercise: fresh Chromium context, no profile, all non-file requests blocked.
const { chromium } = require('/Users/bruce/dynasty-blueprint/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const ROOT = process.argv[2]; const OUT = process.argv[3];
const url = (q='') => 'file://' + path.join(ROOT, 'index.html') + q;
(async () => {
  const browser = await chromium.launch({ headless: true });
  const log = { pageErrors: [], console: [], blocked: [], obs: {} };
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://')) return r.continue(); log.blocked.push(u); r.abort(); });
  const page = await ctx.newPage();
  page.on('pageerror', e => log.pageErrors.push(String(e)));
  page.on('console', m => { if (['error','warning'].includes(m.type())) log.console.push(m.type()+': '+m.text()); });
  const shot = async (name) => { await page.waitForTimeout(150); await page.screenshot({ path: path.join(OUT, name + '.png') }); };
  const txt = async (sel) => (await page.locator(sel).first().innerText().catch(()=>'')).trim();

  // 1. Home overview
  await page.goto(url()); await page.waitForTimeout(400); await shot('01-home');
  // measure typography / hit targets
  log.obs.metrics = await page.evaluate(() => {
    const cs = (el) => el ? getComputedStyle(el) : null;
    const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); const c = cs(el); return { sel, w: Math.round(r.width), h: Math.round(r.height), font: c.fontSize, family: c.fontFamily.split(',')[0], weight: c.fontWeight, color: c.color, bg: c.backgroundColor, radius: c.borderRadius, shadow: c.boxShadow }; };
    const all = (sel) => Array.from(document.querySelectorAll(sel)).map(el => { const r = el.getBoundingClientRect(); return { text: el.innerText.trim().slice(0,40), w: Math.round(r.width), h: Math.round(r.height), font: getComputedStyle(el).fontSize }; });
    const out = {};
    out.candidates = ['header','.hud','#game > *','.people','.rail','.rail-people','.rail-films','aside','button','.avatar','.card','.tools','.tool'].map(pick).filter(Boolean);
    out.buttons = all('button').slice(0, 40);
    out.smallText = Array.from(document.querySelectorAll('#game *')).filter(el => el.children.length===0 && el.innerText && el.innerText.trim()).map(el => ({ t: el.innerText.trim().slice(0,30), fs: parseFloat(getComputedStyle(el).fontSize), color: getComputedStyle(el).color })).filter(x => x.fs < 12).slice(0, 30);
    out.fontFamilies = Array.from(new Set(Array.from(document.querySelectorAll('#game *')).map(el => getComputedStyle(el).fontFamily))).slice(0,10);
    out.radii = Array.from(new Set(Array.from(document.querySelectorAll('#game *')).map(el => getComputedStyle(el).borderRadius).filter(r => r && r !== '0px')));
    out.shadows = Array.from(new Set(Array.from(document.querySelectorAll('#game *')).map(el => getComputedStyle(el).boxShadow).filter(r => r && r !== 'none'))).slice(0,12);
    out.avatarSvgs = Array.from(new Set(Array.from(document.querySelectorAll('.avatar svg')).map(s => s.innerHTML.replace(/fill="#[0-9a-f]+"/g,'')))).length;
    out.avatarCount = document.querySelectorAll('.avatar').length;
    out.gameRect = document.querySelector('#game').getBoundingClientRect().toJSON();
    return out;
  });
  // 2. hover an employee card
  const cards = page.locator('#game [data-act]');
  log.obs.actCount = await cards.count();
  const firstPerson = page.locator('#game .employee, #game [data-employee], #game [data-person]').first();
  const peopleCard = page.getByText('Nora Finch').first();
  await peopleCard.hover(); await page.waitForTimeout(500); await shot('02-hover-nora');
  // 3. search Mara
  const search = page.locator('#game input[type="search"], #game input[type="text"], #game input').first();
  await search.fill('Mara'); await page.waitForTimeout(300); await shot('03-search-mara');
  log.obs.searchMara = await page.locator('#game').innerText().then(t => (t.match(/Mara Vale/g)||[]).length);
  await search.fill('');
  // 4. click Mara (director) → located + compact person
  await page.getByText('Director · P-004').first().click(); await page.waitForTimeout(500); await shot('04-person-mara');
  // 5. right-click → More details
  await page.getByText('Director · P-004').first().click({ button: 'right' }); await page.waitForTimeout(400); await shot('05-person-rightclick');
  // 6. Back
  const back = page.getByRole('button', { name: /back/i }).first(); if (await back.count()) { await back.click(); await page.waitForTimeout(400); }
  await shot('06-after-back');
  // 7. click The Glass Harbor on right
  await page.getByText('The Glass Harbor').first().click(); await page.waitForTimeout(500); await shot('07-production-harbor');
  // 8. view company & production (detailed)
  const vcp = page.getByRole('button', { name: /View company/i }).first(); if (await vcp.count()) { await vcp.click(); await page.waitForTimeout(500); await shot('08-production-detail'); }
  // 9. Needs me filter
  await page.goto(url()); await page.waitForTimeout(300);
  const show = page.locator('#game select').nth(1);
  const opts = await show.locator('option').allTextContents(); log.obs.showOptions = opts;
  const needs = opts.find(o => /need/i.test(o)); if (needs) { await show.selectOption({ label: needs }); await page.waitForTimeout(300); await shot('09-needs-me'); }
  const wait = opts.find(o => /wait/i.test(o)); if (wait) { await show.selectOption({ label: wait }); await page.waitForTimeout(300); await shot('10-waiting'); }
  // group filter
  const grp = page.locator('#game select').nth(0); const gopts = await grp.locator('option').allTextContents(); log.obs.groupOptions = gopts;
  // 11. After the Rain (normal wait)
  await page.goto(url()); await page.waitForTimeout(300);
  await page.getByText('After the Rain').first().click(); await page.waitForTimeout(500); await shot('11-post-wait');
  // 12. Long Way Home → casting building
  await page.goto(url()); await page.waitForTimeout(300);
  await page.getByText('The Long Way Home').first().click(); await page.waitForTimeout(500); await shot('12-script-casting-card');
  const castBtn = page.locator('#game button', { hasText: /^Casting$/ }).first(); if (await castBtn.count()) { await castBtn.click(); await page.waitForTimeout(500); await shot('13-casting-building'); }
  const lead = page.locator('#game button', { hasText: /Lead/ }).first(); if (await lead.count()) { await lead.click(); await page.waitForTimeout(500); await shot('14-compare'); }
  const leon = page.locator('#game button', { hasText: /Review this candidate/ }).nth(1); if (await leon.count()) { await leon.click(); await page.waitForTimeout(500); await shot('15-leon'); const b = page.getByRole('button', { name: /back/i }).first(); if (await b.count()) { await b.click(); await page.waitForTimeout(400); await shot('16-back-to-compare'); } }
  // 17. Build catalogue → soundstage → invalid → cancel
  await page.goto(url()); await page.waitForTimeout(300);
  await page.locator('#game button[data-act="build-toggle"]').first().click(); await page.waitForTimeout(400); await shot('17-build-catalogue');
  const ss = page.locator('#game button', { hasText: /Soundstage/ }).first(); if (await ss.count()) { await ss.click(); await page.waitForTimeout(400); await shot('18-build-placement'); }
  const inv = page.locator('#game button', { hasText: /invalid|Invalid|overlap/i }).first(); if (await inv.count()) { await inv.click(); await page.waitForTimeout(400); await shot('19-build-invalid'); }
  // 20. Menu → campaigns
  await page.goto(url()); await page.waitForTimeout(300);
  await page.locator('#game button', { hasText: 'Menu' }).first().click(); await page.waitForTimeout(400); await shot('20-menu');
  // 21. Studio menu corner
  await page.goto(url()); await page.waitForTimeout(300);
  await page.locator('#game button[data-act="studio-tools"]').first().click(); await page.waitForTimeout(400); await shot('21-studio-corner');
  // 22. keyboard: tab through
  await page.goto(url()); await page.waitForTimeout(300);
  for (let i=0;i<8;i++) await page.keyboard.press('Tab'); await page.waitForTimeout(200); await shot('22-keyboard-focus');
  log.obs.focused = await page.evaluate(() => document.activeElement && (document.activeElement.innerText||document.activeElement.outerHTML).slice(0,80));
  await page.keyboard.press('Enter'); await page.waitForTimeout(400); await shot('23-keyboard-enter');
  // 24. early
  await page.goto(url('?screen=home&state=early')); await page.waitForTimeout(400); await shot('24-early');
  // 25. small canvas 200%
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(url('?screen=home&text=200')); await page.waitForTimeout(400); await shot('25-home-1280-200');
  await page.goto(url('?screen=casting&state=compare&text=200')); await page.waitForTimeout(400); await shot('26-compare-1280-200');
  await page.goto(url('?screen=production&text=200')); await page.waitForTimeout(400); await shot('27-production-1280-200');
  // 28. directions (alternatives) board
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url('?screen=alternatives')); await page.waitForTimeout(400); await shot('28-alternatives');
  await page.goto(url('?screen=result')); await page.waitForTimeout(400); await shot('29-result');
  await page.goto(url('?screen=finance')); await page.waitForTimeout(400); await shot('30-finance');
  await page.goto(url('?screen=campaigns&state=name')); await page.waitForTimeout(400); await shot('31-save-as');
  fs.writeFileSync(path.join(OUT, 'exercise-log.json'), JSON.stringify(log, null, 2));
  await browser.close();
  console.log('done; pageErrors=' + log.pageErrors.length + ' consoleIssues=' + log.console.length + ' blocked=' + log.blocked.length);
})().catch(e => { console.error(e); process.exit(1); });
