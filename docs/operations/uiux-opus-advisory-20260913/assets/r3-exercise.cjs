const { chromium } = require('/Users/bruce/dynasty-blueprint/node_modules/playwright'); const path=require('path'); const fs=require('fs');
const ROOT=process.argv[2], OUT=process.argv[3]; const url=q=>'file://'+path.join(ROOT,'index.html')+(q?'?'+q:'');
(async()=>{const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}}); const log={errors:[],blocked:[],obs:{}};
await ctx.route('**/*',r=>{const u=r.request().url(); if(u.startsWith('file://'))return r.continue(); log.blocked.push(u); r.abort();});
const p=await ctx.newPage(); p.on('pageerror',e=>log.errors.push(String(e)));
const shot=async n=>{await p.waitForTimeout(250); await p.screenshot({path:path.join(OUT,n+'.png')});};
await p.goto(url()); await p.waitForTimeout(500);
log.obs.home=await p.evaluate(()=>{const q=s=>document.querySelector(s); const all=s=>Array.from(document.querySelectorAll(s));
 const rowsP=all('[class*=person-row],[data-id^="P-"],.person'); const rowsPic=all('[data-id^="FILM"],[data-id^="SCRIPT"],[class*=picture]');
 const vis=el=>{const r=el.getBoundingClientRect(); return r.bottom<=900&&r.top>=84;};
 const fonts={}; all('#game *, main *').filter(e=>e.children.length===0&&e.textContent.trim()).forEach(e=>{const f=parseFloat(getComputedStyle(e).fontSize); fonts[f]=(fonts[f]||0)+1;});
 const radii=new Set(all('body *').map(e=>getComputedStyle(e).borderRadius).filter(r=>r&&r!=='0px'));
 const shadows=new Set(all('body *').map(e=>getComputedStyle(e).boxShadow).filter(r=>r&&r!=='none'));
 const selects=all('select').map(s=>({id:s.id, opts:Array.from(s.options).map(o=>o.textContent)}));
 const buttons=all('button').map(b=>({t:b.innerText.trim().slice(0,30), w:Math.round(b.getBoundingClientRect().width), h:Math.round(b.getBoundingClientRect().height)}));
 return {peopleRowsTotal:rowsP.length, peopleRowsFullyVisible:rowsP.filter(vis).length, picRowsTotal:rowsPic.length, picRowsFullyVisible:rowsPic.filter(vis).length, fonts, radii:[...radii], shadows:shadows.size, selects, smallButtons:buttons.filter(b=>b.h&&b.h<32).slice(0,20)};});
await shot('r3-01-home');
// keyboard reach
let tabs=0, focused='';
for(let i=0;i<40;i++){await p.keyboard.press('Tab'); tabs++; focused=await p.evaluate(()=>{const a=document.activeElement; return (a.getAttribute('aria-label')||a.innerText||a.outerHTML||'').slice(0,60)}); if(/Mara Vale/.test(focused)) break;}
log.obs.tabsToFirstPerson={tabs,focused};
// how many tabs from HUD to first picture card
await p.goto(url()); await p.waitForTimeout(300); tabs=0;
for(let i=0;i<60;i++){await p.keyboard.press('Tab'); tabs++; focused=await p.evaluate(()=>{const a=document.activeElement; return (a.getAttribute('aria-label')||a.innerText||'').slice(0,60)}); if(/Letters from June/.test(focused)) break;}
log.obs.tabsToFirstPicture={tabs,focused};
// hover a picture
await p.goto(url()); await p.waitForTimeout(300);
await p.getByText('The Glass Harbor').first().hover(); await shot('r3-02-hover-picture');
await p.getByText('The Glass Harbor').first().click(); await shot('r3-03-selected');
log.obs.inspector=await p.evaluate(()=>{const el=document.querySelector('[class*=inspector],[role=dialog],[aria-label^="Picture"]'); if(!el) return null; const r=el.getBoundingClientRect(); return {w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top),left:Math.round(r.left)};});
// right filter dropdown options
await p.keyboard.press('Escape'); await p.waitForTimeout(200);
const sel=p.locator('select').filter({hasText:'Active'}).first(); if(await sel.count()){ const opts=await sel.locator('option').allTextContents(); log.obs.filterOptions=opts; await sel.selectOption({index:1}); await shot('r3-04-filter-decisions'); }
// paging
await p.goto(url('fixture=busy')); await p.waitForTimeout(400); await shot('r3-05-busy');
const down=p.locator('#pictures-down, [aria-label*="ext"], button:has-text("›")').first(); if(await down.count()){await down.click(); await shot('r3-06-busy-paged');}
// early
await p.goto(url('fixture=early')); await p.waitForTimeout(400); await shot('r3-07-early');
// enlarged 1280
await p.setViewportSize({width:1280,height:720}); await p.goto(url('text=200')); await p.waitForTimeout(400); await shot('r3-08-1280-enlarged');
log.obs.enlarged=await p.evaluate(()=>{const all=s=>Array.from(document.querySelectorAll(s)); const vis=el=>{const r=el.getBoundingClientRect(); return r.bottom<=720&&r.top>=84;}; const rowsP=all('[data-id^="P-"]'); const rowsPic=all('[data-id^="FILM"],[data-id^="SCRIPT"]'); const hud=all('header *, .hud *').filter(e=>e.children.length===0&&e.textContent.trim()).map(e=>parseFloat(getComputedStyle(e).fontSize)); return {peopleFullyVisible:rowsP.filter(vis).length, picFullyVisible:rowsPic.filter(vis).length, hudFontMin:Math.min(...hud), hudFontMax:Math.max(...hud)};});
await p.goto(url('text=200&screen=production&id=FILM-014')); await p.waitForTimeout(400); await shot('r3-09-1280-enlarged-inspector');
log.obs.enlargedInspector=await p.evaluate(()=>{const el=document.querySelector('[class*=inspector],[aria-label^="Picture"]'); if(!el) return null; const r=el.getBoundingClientRect(); const tools=document.querySelector('[class*=corner],[aria-label*="tools"]'); const tr=tools?tools.getBoundingClientRect():null; return {w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top),coversTools: tr? !(r.right<tr.left||r.left>tr.right||r.bottom<tr.top||r.top>tr.bottom):null};});
fs.writeFileSync(path.join(OUT,'r3-log.json'),JSON.stringify(log,null,1)); await b.close(); console.log(JSON.stringify(log.obs,null,1), 'errors',log.errors,'blocked',log.blocked.length);})().catch(e=>{console.error(e);process.exit(1);});
