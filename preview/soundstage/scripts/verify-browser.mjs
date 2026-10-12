import { chromium } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('..',import.meta.url));
const output=new URL('../evidence/browser-r5/',import.meta.url);
assert.ok(!existsSync(new URL('results.json',output)),'Use a fresh evidence directory');
mkdirSync(output,{recursive:true});
const files=['src/main.ts','src/style.css','index.html','package.json','tsconfig.json','scripts/build.mjs','scripts/server.mjs','scripts/verify-browser.mjs','scripts/session.sh','scripts/launch.mjs','scripts/open-browser.mjs','START PREVIEW.command','PROVENANCE.json'];
const hashes=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(root+'/'+f)).digest('hex')]));
const report={started:new Date().toISOString(),inputHashes:hashes(),checks:[],measurements:[],screenshots:[],resourceObservations:[],viewport:{width:1280,height:1000},deviceScaleFactor:1,headless:true};
const save=()=>writeFileSync(new URL('results.json',output),JSON.stringify(report,null,2)+'\n');
const server=spawn(process.execPath,['scripts/server.mjs'],{cwd:root,env:{...process.env,PREVIEW_OPEN:'0'},stdio:['ignore','pipe','pipe']});
let browser,resourceTimer,resourceFailure;
function resourceCheck(){
 const row=execFileSync('/bin/df',['-k',root],{encoding:'utf8'}).trim().split('\n')[1].trim().split(/\s+/);
 const freeKiB=Number(row[3]),ac=execFileSync('/usr/bin/pmset',['-g','batt'],{encoding:'utf8'}).includes('AC Power');
 report.resourceObservations.push({at:new Date().toISOString(),freeKiB,ac});
 if(freeKiB<3145728||!ac){resourceFailure=new Error('Live disk/AC requirement lost');void browser?.close();server.kill('SIGTERM');}
}
const url='http://127.0.0.1:4197/';
const ready=p=>p.waitForFunction(()=>window.preview?.snapshot().ready,{},{timeout:20000});
const shot=async(p,name)=>{await p.screenshot({path:fileURLToPath(new URL(name,output)),fullPage:true});report.screenshots.push(name);};
try{
 resourceCheck();assert.ok(report.resourceObservations[0].freeKiB>=3670016,'3.5GiB launch floor');
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('Server readiness timeout')),10000);
  server.stdout.on('data',c=>{if(String(c).includes('READY')){clearTimeout(timer);resolve();}});
  server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited ${code}`));});
  server.stderr.on('data',c=>process.stderr.write(c));
 });
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 resourceTimer=setInterval(resourceCheck,5000);report.browser=browser.version();
 const page=await browser.newPage({viewport:report.viewport,deviceScaleFactor:1});
 const errors=[],requests=[];let expectedFailure=false;
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('console',m=>{if(m.type()==='error'&&!expectedFailure)errors.push(m.text());});
 page.on('request',r=>{if(r.url().startsWith('http'))requests.push(r.url());});
 let releaseLoad;const gate=new Promise(r=>{releaseLoad=r;});
 await page.route('**/Arch_M01_StageWall.glb',async r=>{await gate;await r.continue();});
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.preview);
 assert.equal(await page.locator('#material').isDisabled(),true);assert.equal(await page.locator('#pose').isDisabled(),true);
 releaseLoad();await ready(page);await page.unroute('**/Arch_M01_StageWall.glb');
 assert.equal(requests.filter(u=>u.endsWith('.glb')).length,9);assert.equal(requests.filter(u=>u.endsWith('.jpg')).length,0);
 assert.ok(requests.every(u=>new URL(u).origin==='http://127.0.0.1:4197'));
 report.checks.push('Delayed initial loading disables selectors; baseline loads exactly9GLBs, no candidate maps or external app requests');
 // Inject the missing-file fault before this document has loaded any candidate.
 // Later image decode caches can avoid a network route even with HTTP no-store.
 expectedFailure=true;let faultHit=0;
 await page.route('**/concrete_floor_rough_1k.jpg',r=>{faultHit++;return r.abort();});
 const failed=await page.evaluate(()=>window.preview.setMaterial('concrete').then(()=>false,()=>true));
 assert.equal(faultHit,1);assert.ok(failed);assert.equal(await page.locator('#error').isVisible(),true);
 assert.equal((await page.evaluate(()=>window.preview.snapshot())).mode,'baseline');
 await page.unroute('**/concrete_floor_rough_1k.jpg');await page.waitForTimeout(100);expectedFailure=false;
 await page.evaluate(()=>window.preview.setMaterial('concrete'));await page.evaluate(()=>window.preview.setMaterial('baseline'));
 report.checks.push('Actual uncached missing map rejects, shows actionable error, retains baseline and retries successfully');
 await page.selectOption('#figure','director');
 for(const pose of ['idle','walk','direct','work']){
  await page.selectOption('#pose',pose);assert.equal((await page.evaluate(()=>window.preview.snapshot())).poses.director,pose);
  await page.evaluate(p=>{window.preview.freeze(p==='walk'?.25:0);window.preview.view('crew');},pose);
  await shot(page,`pose-${pose}.png`);
 }
 await page.selectOption('#pose','idle');await page.evaluate(()=>{window.preview.freeze();window.preview.view();window.preview.setPaused(false);});
 report.rig=await page.evaluate(()=>window.preview.rig());
 assert.equal(report.rig.director.bones.length,65);assert.deepEqual(report.rig.director.bones,report.rig.operator.bones);
 const dh=report.rig.director.worldHandOrigins,oh=report.rig.operator.worldHandOrigins;
 assert.ok(Math.abs((dh[0][0]+dh[1][0])/2+1.3)<.02,'Idle hands symmetric about director root');
 assert.ok(dh.every(v=>v[1]<1.2),'Idle hands lowered');assert.ok(oh.every(v=>v[2]>.95),'Both work hands forward of operator root');
 report.checks.push('All4 procedural selectors work; idle hands symmetric/lowered and work hands forward on exact65-bone rigs');
 await page.click('#pause');const paused=await page.evaluate(()=>window.preview.snapshot());await page.waitForTimeout(200);
 assert.equal((await page.evaluate(()=>window.preview.snapshot())).renderCount,paused.renderCount);await page.click('#pause');
 report.checks.push('Pause halts render loop and resume restarts');
 for(const path of ['/HANDOFF.md','/src/main.ts','/@fs/etc/passwd','/../package.json'])assert.equal((await page.request.get(url.slice(0,-1)+path)).status(),404);
 report.checks.push('Static server refuses repository/source/traversal probes');
 const baseResources=(await page.evaluate(()=>window.preview.snapshot())).resources;
 for(let i=0;i<3;i++){await page.evaluate(()=>window.preview.setMaterial('both'));await page.evaluate(()=>window.preview.setMaterial('baseline'));}
 assert.deepEqual((await page.evaluate(()=>window.preview.snapshot())).resources,baseResources);
 const race=await page.evaluate(async()=>{const a=window.preview.setMaterial('both'),b=window.preview.setMaterial('baseline');await Promise.all([a,b]);return window.preview.snapshot();});
 assert.equal(race.mode,'baseline');assert.equal(race.pending,0);assert.deepEqual(race.resources,baseResources);
 report.checks.push('Repeated toggles and stale asynchronous requests return texture/geometry counts to baseline');
 const refusedPending=await page.evaluate(async()=>{const p=window.preview.setMaterial('concrete');let refused=false;try{window.preview.measure();}catch{refused=true;}await p;return refused;});
 assert.ok(refusedPending);report.checks.push('Measurement refuses pending material loads');
 await page.evaluate(()=>{window.preview.setPaused(false);window.samplePromise=window.preview.measure();});
 await page.setViewportSize({width:1180,height:950});await page.waitForTimeout(100);
 assert.ok((await page.evaluate(()=>window.preview.snapshot())).measurement.invalidReasons.includes('Comparison setting changed'));
 const invalid=await page.evaluate(async()=>{
  window.preview.setPaused(true);window.preview.setPaused(false);
  Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));
  await new Promise(r=>setTimeout(r,100));const n=window.preview.snapshot().renderCount;
  await new Promise(r=>setTimeout(r,100));const noHiddenRenders=window.preview.snapshot().renderCount===n;
  delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));
  await window.preview.setMaterial('baseline');window.preview.view('crew');
  const reasons=window.preview.snapshot().measurement.invalidReasons;
  window.preview.cleanup();return{sample:await window.samplePromise,reasons,noHiddenRenders};
 });
 assert.equal(invalid.sample.aborted,true);assert.ok(invalid.noHiddenRenders);
 for(const reason of ['Motion paused','Page hidden','Material selection requested','Comparison setting changed'])assert.ok(invalid.reasons.includes(reason));
 report.invalidSample=invalid;report.checks.push('Actual resize plus pause/synthetic hidden/material/camera faults invalidate sample; hidden rendering stops; cleanup aborts sample');
 await page.waitForTimeout(150);const disposed=await page.evaluate(()=>window.preview.snapshot());
 await page.waitForTimeout(100);assert.equal((await page.evaluate(()=>window.preview.snapshot())).renderCount,disposed.renderCount);
 assert.equal(disposed.contextLost,true);assert.equal(disposed.resources.geometries,0);
 assert.deepEqual(disposed.ownedResourceCounts,{geometries:0,materials:0,textures:0,skeletons:0});
 report.disposed=disposed;report.checks.push('Cleanup stops renders, clears owned resource references, and loses actual WebGL context; residual renderer counter recorded');
 assert.deepEqual(errors,[]);await page.close();
 const bad=await browser.newPage({viewport:report.viewport});await bad.route('**/Char_Director_Standard.glb',r=>r.abort());
 await bad.goto(url);await bad.waitForFunction(()=>window.preview?.snapshot().disposed&&!window.preview.snapshot().loadingModels);
 assert.equal(await bad.locator('#error').isVisible(),true);assert.equal((await bad.evaluate(()=>window.preview.snapshot())).contextLost,true);await bad.close();
 report.checks.push('Missing GLB shows actionable error and disposes partial load');
 const cancelled=await browser.newPage({viewport:report.viewport});
 await cancelled.addInitScript(()=>{window.createImageBitmap=async()=>{await new Promise(r=>setTimeout(r,100));throw new Error('Injected embedded bitmap decode failure');};});
 let releaseCancel;const cancelGate=new Promise(r=>{releaseCancel=r;});
 await cancelled.route('**/Arch_M01_StageWall.glb',async r=>{await cancelGate;await r.continue();});
 await cancelled.goto(url,{waitUntil:'domcontentloaded'});await cancelled.waitForFunction(()=>!!window.preview);
 await cancelled.evaluate(()=>window.preview.cleanup());releaseCancel();
 await cancelled.waitForFunction(()=>!window.preview.snapshot().loadingModels);
 const cancelState=await cancelled.evaluate(()=>window.preview.snapshot());assert.deepEqual(cancelState.ownedResourceCounts,{geometries:0,materials:0,textures:0,skeletons:0});
 assert.ok(cancelState.contextLost);report.cancelledLoad=cancelState;await cancelled.close();
 report.checks.push('Stop followed by late model/embedded-image failure releases newly tracked resources');
 // Fresh context: actual screenshots and performance use successful native image decoding.
 const perf=await browser.newPage({viewport:report.viewport,deviceScaleFactor:1});const perfErrors=[];
 perf.on('pageerror',e=>perfErrors.push(String(e)));perf.on('console',m=>{if(m.type()==='error')perfErrors.push(m.text());});
 await perf.goto(url);await ready(perf);await perf.bringToFront();
 report.webgl=await perf.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return{version:gl.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),visibility:document.visibilityState};});
 for(const material of ['baseline','concrete','asphalt','both']){
  await perf.evaluate(()=>window.preview.freeze());await perf.evaluate(m=>window.preview.setMaterial(m),material);
  for(const view of ['management','crew','service']){
   await perf.evaluate(v=>window.preview.view(v),view);const fixed=await perf.evaluate(()=>window.preview.snapshot());
   assert.deepEqual(fixed.drawingBuffer,[1232,693]);
   if(material==='baseline')report['fixed_'+view]=fixed;else for(const key of ['camera','target','geometry','lighting','poses','drawingBuffer'])assert.deepEqual(fixed[key],report['fixed_'+view][key],`${material}/${view}/${key}`);
   await shot(perf,`${material}-${view}.png`);
  }
 }
 report.checks.push('12 matched frozen-phase screenshots preserve scene transforms/camera/lights/poses/drawingbuffer across all4 material modes');save();
 if(process.env.PREVIEW_REVIEW_GATE){console.log('AWAITING_VISUAL_REVIEW '+process.env.PREVIEW_REVIEW_GATE);const deadline=Date.now()+180000;while(!existsSync(process.env.PREVIEW_REVIEW_GATE)){if(Date.now()>deadline)throw new Error('Bounded visual-review wait expired');await perf.waitForTimeout(250);}report.visualReview=JSON.parse(readFileSync(process.env.PREVIEW_REVIEW_GATE));assert.equal(report.visualReview.proceed,true);}
 for(const material of ['baseline','concrete','asphalt','both']){
  await perf.evaluate(()=>{window.preview.freeze();window.preview.view();});await perf.evaluate(m=>window.preview.setMaterial(m),material);
  await perf.evaluate(()=>window.preview.setPaused(false));await perf.waitForTimeout(2000);
  console.log(`MEASURING ${material} 60000ms foreground`);const measurement=await perf.evaluate(()=>window.preview.measure());
  assert.equal(measurement.valid,true);assert.equal(measurement.visibility,'visible');assert.ok(measurement.durationMs>=60000&&measurement.durationMs<65000);assert.ok(measurement.renderedFps<=30.05);
  report.measurements.push({material,...measurement});save();console.log(`MEASURED ${material} ${measurement.renderedFps.toFixed(2)} FPS`);
 }
 report.checks.push('Four valid60s foreground runs at fixed management view with30FPS target');
 assert.deepEqual(perfErrors,[]);report.unexpectedBrowserErrors=perfErrors;
 server.kill('SIGTERM');await once(server,'exit');await perf.waitForFunction(()=>window.preview.snapshot().disposed);
 report.checks.push('Server shutdown automatically disposes open preview');await perf.close();
 assert.deepEqual(hashes(),report.inputHashes);report.checks.push('Measured source inputs unchanged');
 if(resourceFailure)throw resourceFailure;report.passed=true;
}catch(error){report.passed=false;report.failure=String(error.stack||error);throw error;}
finally{
 clearInterval(resourceTimer);if(browser)await browser.close();if(server.exitCode===null&&server.signalCode===null){server.kill('SIGTERM');await once(server,'exit');}
 report.finished=new Date().toISOString();report.serverExit={code:server.exitCode,signal:server.signalCode};save();console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,failure:report.failure}));
}
