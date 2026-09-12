// Render the proposal boards with a fresh headless Chromium context (no profile; every
// non-file:// request aborted). Usage: node render.js <design dir> <out dir> [quick]
const { chromium } = require(process.env.PW || '/Users/bruce/dynasty-blueprint/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(process.argv[2]); const OUT = path.resolve(process.argv[3]); const quick = process.argv[4] === 'quick';
fs.mkdirSync(OUT, { recursive: true });
const url = q => 'file://' + path.join(ROOT, 'index.html') + (q ? '?' + q : '');
const BOARDS = [
  ['X-A-overview', 'dir=a&screen=overview'], ['X-A2-pure-stack-overview', 'dir=a2&screen=overview'], ['X-B-overview', 'dir=b&screen=overview'],
  ['K1-overview', 'dir=rec&screen=overview'], ['K2-person', 'dir=rec&screen=person'], ['K3-production', 'dir=rec&screen=production'], ['K4-compare', 'dir=rec&screen=compare'],
  ['K1-overview-annotated', 'dir=rec&screen=overview&annotated'], ['K2-person-annotated', 'dir=rec&screen=person&annotated'], ['K3-production-annotated', 'dir=rec&screen=production&annotated'], ['K4-compare-annotated', 'dir=rec&screen=compare&annotated'],
  ['CMP-rec-on-r2-world', 'dir=rec&screen=overview&world=r2'], ['CMP-rec-person-on-r2-world', 'dir=rec&screen=person&world=r2'], ['CMP-rec-production-on-r2-world', 'dir=rec&screen=production&world=r2'], ['CMP-rec-compare-on-r2-world', 'dir=rec&screen=compare&world=r2'],
  ['V-early', 'dir=rec&screen=overview&fixture=early'], ['V-compact-rails', 'dir=rec&screen=overview&rails=compact'], ['V-long-names', 'dir=rec&screen=production&fixture=long'], ['V-waiting', 'dir=rec&screen=production&state=waiting'],
];
const SMALL = [['S-overview-1280-100', 'dir=rec&screen=overview&canvas=1280', 100], ['S-compare-1280-200', 'dir=rec&screen=compare&text=200&canvas=1280', 200], ['S-person-1280-200', 'dir=rec&screen=person&text=200&canvas=1280', 200], ['S-overview-1280-200', 'dir=rec&screen=overview&text=200&canvas=1280', 200]];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const log = { pageErrors: [], console: [], blocked: [] };
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://')) return r.continue(); log.blocked.push(u); r.abort(); });
  const page = await ctx.newPage();
  page.on('pageerror', e => log.pageErrors.push(String(e)));
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) log.console.push(m.type() + ': ' + m.text()); });
  const list = quick ? BOARDS.slice(0, 7) : BOARDS;
  for (const [name, q] of list) {
    await page.setViewportSize({ width: q.includes('annotated') ? 1740 : 1440, height: 900 });
    await page.goto(url(q)); await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(OUT, name + '.png'), clip: { x: 0, y: 0, width: q.includes('annotated') ? 1740 : 1440, height: 900 } });
  }
  if (!quick) for (const [name, q] of SMALL) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(url(q)); await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
  }
  // interaction journey capture (overview → hover → person → right-click facts → production → compare → Leon → Back)
  if (!quick) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url('dir=rec&screen=overview')); await page.waitForTimeout(400);
    await page.getByText('Nora Finch').first().hover(); await page.waitForTimeout(300); await page.screenshot({ path: path.join(OUT, 'J1-hover.png') });
    await page.locator('.search input').fill('Mara'); await page.waitForTimeout(200); await page.screenshot({ path: path.join(OUT, 'J2-search-mara.png') });
    await page.locator('.search input').fill('');
    await page.locator('.row.person[data-id="P-004"]').click(); await page.waitForTimeout(500); await page.screenshot({ path: path.join(OUT, 'J3-person.png') });
    await page.locator('.row.person[data-id="P-004"]').click({ button: 'right' }); await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, 'J4-person-facts.png') });
    await page.getByRole('button', { name: /^Back$/ }).first().click(); await page.waitForTimeout(400);
    await page.locator('.row.picture[data-id="FILM-014"]').click(); await page.waitForTimeout(500); await page.screenshot({ path: path.join(OUT, 'J5-production.png') });
    await page.locator('.face').first().click(); await page.waitForTimeout(500); await page.screenshot({ path: path.join(OUT, 'J6-person-from-production.png') });
    await page.getByRole('button', { name: /^Back$/ }).first().click(); await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, 'J7-back-to-production.png') });
    await page.getByRole('button', { name: /Schedule the shooting take/ }).click(); await page.waitForTimeout(150); await page.screenshot({ path: path.join(OUT, 'J8-pending.png') }); await page.waitForTimeout(1000); await page.screenshot({ path: path.join(OUT, 'J9-receipt.png') });
    await page.locator('.tabs button[data-act="pictures:Needs me"]').click(); await page.waitForTimeout(300); await page.screenshot({ path: path.join(OUT, 'J10-needs-me.png') });
    await page.locator('.row.picture[data-id="SCRIPT-021"]').click(); await page.waitForTimeout(500); await page.screenshot({ path: path.join(OUT, 'J11-compare.png') });
    await page.getByRole('button', { name: /Inspect record/ }).click(); await page.waitForTimeout(500); await page.screenshot({ path: path.join(OUT, 'J12-leon.png') });
    await page.keyboard.press('Escape'); await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, 'J13-back-to-compare.png') });
    // keyboard reach
    await page.goto(url('dir=rec&screen=overview')); await page.waitForTimeout(300);
    let tabs = 0; let focused = '';
    for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); tabs++; focused = await page.evaluate(() => (document.activeElement.getAttribute('aria-label') || document.activeElement.innerText || '').slice(0, 40)); if (/Mara Vale/.test(focused)) break; }
    log.keyboard = { tabsToFirstPerson: tabs, focused };
    await page.keyboard.press('Enter'); await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, 'J14-keyboard-enter.png') });
    log.metrics = await page.evaluate(() => { const els = Array.from(document.querySelectorAll('#game *')); const radii = new Set(els.map(e => getComputedStyle(e).borderRadius).filter(r => r && r !== '0px')); const shadows = new Set(els.map(e => getComputedStyle(e).boxShadow).filter(r => r && r !== 'none')); const leaf = els.filter(e => e.children.length === 0 && e.textContent.trim()); const isMicro = e => { const c = getComputedStyle(e); return c.textTransform === 'uppercase' || parseFloat(c.letterSpacing) >= 1; }; const small = leaf.filter(e => !isMicro(e)).map(e => parseFloat(getComputedStyle(e).fontSize)).filter(f => f < 12); const micro = leaf.filter(isMicro).map(e => parseFloat(getComputedStyle(e).fontSize)).filter(f => f < 10); const fonts = new Set(els.map(e => getComputedStyle(e).fontFamily)); const avatars = new Set(Array.from(document.querySelectorAll('.row.person .pt')).map(s => s.innerHTML.replace(/#[0-9a-f]{6}/g, ''))); return { radii: [...radii], shadows: [...shadows], readingTextUnder12: small.length, microLabelsUnder10: micro.length, minReadingFont: Math.min(...small, 99), fonts: [...fonts], uniqueAvatars: avatars.size, avatars: document.querySelectorAll('.row.person .pt').length }; });
  }
  fs.writeFileSync(path.join(OUT, 'render-log.json'), JSON.stringify(log, null, 2));
  await browser.close();
  console.log('rendered', list.length + (quick ? 0 : SMALL.length + 14), 'boards; pageErrors', log.pageErrors.length, 'console', log.console.length, 'blocked', log.blocked.length, log.pageErrors.slice(0, 3), log.console.slice(0, 3));
})().catch(e => { console.error(e); process.exit(1); });
