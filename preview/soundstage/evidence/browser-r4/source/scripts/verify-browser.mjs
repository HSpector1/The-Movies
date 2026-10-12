import { chromium } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('..', import.meta.url));
const output = new URL('../evidence/browser-r4/', import.meta.url);
mkdirSync(output, { recursive: true });
const files = ['src/main.ts', 'src/style.css', 'index.html', 'package.json', 'tsconfig.json', 'scripts/server.mjs', 'scripts/verify-browser.mjs', 'scripts/session.sh', 'scripts/launch.mjs', 'scripts/open-browser.mjs', 'START PREVIEW.command', 'PROVENANCE.json'];
const hashes = () => Object.fromEntries(files.map(f => [f, createHash('sha256').update(readFileSync(root + '/' + f)).digest('hex')]));
const report = { started: new Date().toISOString(), inputHashes: hashes(), checks: [], measurements: [], screenshots: [], resourceObservations: [] };
const save = () => writeFileSync(new URL('results.json', output), JSON.stringify(report, null, 2) + '\n');
const server = spawn(process.execPath, ['scripts/server.mjs'], { cwd: root, env: { ...process.env, PREVIEW_OPEN: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
let browser, resourceTimer, resourceFailure;
function resourceCheck() { const row = execFileSync('/bin/df', ['-k', root], { encoding: 'utf8' }).trim().split('\n')[1].trim().split(/\s+/); const freeKiB = Number(row[3]); const ac = execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8' }).includes('AC Power'); report.resourceObservations.push({ at: new Date().toISOString(), freeKiB, ac }); if (freeKiB < 3145728 || !ac) {
    resourceFailure = new Error('Live disk/AC requirement lost');
    void browser?.close();
    server.kill('SIGTERM');
} }
try {
    resourceCheck();
    assert.ok(report.resourceObservations[0].freeKiB >= 3670016, '3.5GiB launch floor');
    await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('Server readiness timeout')), 10000); server.stdout.on('data', chunk => { if (String(chunk).includes('READY')) {
        clearTimeout(timer);
        resolve();
    } }); server.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited ${code}`)); }); server.stderr.on('data', c => process.stderr.write(c)); });
    browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
    resourceTimer = setInterval(resourceCheck, 5000);
    report.browser = browser.version();
    report.headless = true;
    report.viewport = { width: 1280, height: 1000 };
    report.deviceScaleFactor = 1;
    const page = await browser.newPage({ viewport: report.viewport, deviceScaleFactor: 1 });
    const errors = [], requests = [];
    let expectedFailure = false;
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', msg => { if (msg.type() === 'error' && !expectedFailure)
        errors.push(msg.text()); });
    page.on('request', r => { if (r.url().startsWith('http'))
        requests.push(r.url()); });
    let releaseLoad;
    const loadGate=new Promise(resolve=>{releaseLoad=resolve;});
    await page.route('**/Arch_M01_StageWall.glb',async route=>{await loadGate;await route.continue();});
    await page.goto('http://127.0.0.1:4197/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!window.preview);
    assert.equal(await page.locator('#material').isDisabled(),true);
    assert.equal(await page.locator('#pose').isDisabled(),true);
    releaseLoad();
    report.checks.push('Delayed model loading keeps material/pose selectors disabled');
    await page.waitForFunction(() => window.preview?.snapshot().ready, {}, { timeout: 20000 });
    await page.bringToFront();
    report.webgl = await page.evaluate(() => { const gl = document.querySelector('canvas').getContext('webgl2'), ext = gl.getExtension('WEBGL_debug_renderer_info'); return { version: gl.getParameter(gl.VERSION), renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), visibility: document.visibilityState }; });
    assert.equal(requests.filter(x => x.endsWith('.glb')).length, 9);
    assert.equal(requests.filter(x => x.endsWith('.jpg')).length, 0);
    assert.ok(requests.every(x => new URL(x).origin === 'http://127.0.0.1:4197'));
    report.checks.push('Baseline loads exactly9 GLBs, no candidate maps, no external app requests');
    const before = await page.evaluate(() => window.preview.snapshot());
    assert.deepEqual(before.drawingBuffer, [1232, 693]);
    report.rig = await page.evaluate(() => window.preview.rig());
    assert.equal(report.rig.director.bones.length, 65);
    assert.deepEqual(report.rig.director.bones, report.rig.operator.bones);
    await page.selectOption('#figure', 'director');
    for (const value of ['walk', 'direct', 'work', 'idle']) {
        await page.selectOption('#pose', value);
        assert.equal((await page.evaluate(() => window.preview.snapshot())).poses.director, value);
    }
    report.checks.push('Visible figure/pose selectors activate all4 explicitly procedural poses');
    await page.click('#pause');
    const pause1 = await page.evaluate(() => window.preview.snapshot());
    await page.waitForTimeout(250);
    assert.equal((await page.evaluate(() => window.preview.snapshot())).renderCount, pause1.renderCount);
    await page.click('#pause');
    report.checks.push('Pause stops render loop, resume restarts');
    for (const path of ['/HANDOFF.md', '/src/main.ts', '/@fs/etc/passwd', '/../package.json']) {
        const response = await page.request.get('http://127.0.0.1:4197' + path);
        assert.equal(response.status(), 404);
    }
    report.checks.push('Static server refuses source/repository/traversal probes');
    for (const material of ['baseline', 'concrete', 'asphalt', 'both']) {
        await page.evaluate(() => window.preview.freeze());
        await page.evaluate(m => window.preview.setMaterial(m), material);
        for (const view of ['management', 'crew', 'service']) {
            await page.evaluate(v => window.preview.view(v), view);
            const fixed = await page.evaluate(() => window.preview.snapshot());
            if (material === 'baseline')
                report['fixed_' + view] = fixed;
            else
                for (const key of ['camera', 'target', 'geometry', 'lighting', 'poses'])
                    assert.deepEqual(fixed[key], report['fixed_' + view][key], `${material}/${view}/${key}`);
            const name = `${material}-${view}.png`;
            await page.screenshot({ path: fileURLToPath(new URL(name, output)), fullPage: true });
            report.screenshots.push(name);
        }
        await page.evaluate(() => { window.preview.view(); window.preview.setPaused(false); });
        await page.waitForTimeout(2000);
        console.log(`MEASURING ${material} 60000ms visible foreground`);
        const measurement = await page.evaluate(() => window.preview.measure());
        assert.equal(measurement.valid, true);
        assert.ok(measurement.renderedFps<=30.05,'30FPS cadence target respected');
        assert.equal(measurement.visibility, 'visible');
        assert.ok(measurement.durationMs >= 60000 && measurement.durationMs < 65000);
        report.measurements.push({ material, ...measurement });
        save();
        console.log(`MEASURED ${material} ${measurement.renderedFps.toFixed(2)} FPS`);
    }
    report.checks.push('12 real screenshots; all4 modes retain exact object transforms/camera/lighting/poses at all3 views; four valid60s samples');
    await page.evaluate(() => window.preview.setMaterial('baseline'));
    const baseResources = (await page.evaluate(() => window.preview.snapshot())).resources;
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.preview.setMaterial('both'));
        await page.evaluate(() => window.preview.setMaterial('baseline'));
    }
    assert.deepEqual((await page.evaluate(() => window.preview.snapshot())).resources, baseResources);
    report.checks.push('Repeated material toggles return resource counts to baseline');
    expectedFailure = true;
    await page.route('**/concrete_floor_rough_1k.jpg', route => route.abort());
    const failed = await page.evaluate(() => window.preview.setMaterial('concrete').then(() => false, () => true));
    assert.ok(failed);
    assert.equal(await page.locator('#error').isVisible(), true);
    assert.equal((await page.evaluate(() => window.preview.snapshot())).mode, 'baseline');
    await page.unroute('**/concrete_floor_rough_1k.jpg');
    expectedFailure = false;
    await page.evaluate(() => window.preview.setMaterial('concrete'));
    report.checks.push('Missing map shows error, retains prior material, and retry succeeds');
    const race = await page.evaluate(async () => { const a = window.preview.setMaterial('both'); const b = window.preview.setMaterial('baseline'); await Promise.all([a, b]); return window.preview.snapshot(); });
    assert.equal(race.mode, 'baseline');
    assert.equal(race.pending, 0);
    assert.deepEqual(race.resources, baseResources);
    report.checks.push('Stale asynchronous material request releases its resources');
    await page.route('**/concrete_floor_rough_1k.jpg',async route=>{await new Promise(r=>setTimeout(r,200));await route.continue();});
    const refusedPending=await page.evaluate(async()=>{const load=window.preview.setMaterial('concrete');let refused=false;try{window.preview.measure();}catch{refused=true;}await load;return refused;});
    assert.equal(refusedPending,true);await page.unroute('**/concrete_floor_rough_1k.jpg');
    report.checks.push('Measurement refuses pending map loads');
    const aborted=await page.evaluate(async()=>{
        window.preview.setPaused(false);const p=window.preview.measure();window.preview.setPaused(true);window.preview.setPaused(false);
        // Explicit fault injection of visibility signals; not a claim of native OS tab hiding.
        Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));
        await new Promise(r=>setTimeout(r,100));const hiddenCount=window.preview.snapshot().renderCount;
        await new Promise(r=>setTimeout(r,100));const noHiddenRenders=window.preview.snapshot().renderCount===hiddenCount;
        delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));
        await window.preview.setMaterial('baseline');window.preview.view('crew');
        const invalid=window.preview.snapshot().measurement;
        window.preview.cleanup();return {sample:await p,invalid,noHiddenRenders};
    });
    assert.equal(aborted.sample.aborted,true);assert.equal(aborted.noHiddenRenders,true);
    for(const reason of ['Motion paused','Page hidden','Material selection requested','Comparison setting changed'])assert.ok(aborted.invalid.invalidReasons.includes(reason));
    report.invalidSample=aborted;report.checks.push('Pause, synthetic hidden event, material and camera changes invalidate sample; hidden rendering stops; disposal aborts sample');
    await page.waitForTimeout(150);const disposed=await page.evaluate(()=>window.preview.snapshot());
    await page.waitForTimeout(150);assert.equal((await page.evaluate(()=>window.preview.snapshot())).renderCount,disposed.renderCount);
    assert.equal(disposed.resources.geometries,0);assert.equal(disposed.contextLost,true);
    report.disposed=disposed;
    report.checks.push('Cleanup stops rendering and loses actual WebGL context; remaining renderer texture counter is recorded, not interpreted as live GPU bytes');
    await page.close();
    const bad = await browser.newPage({ viewport: report.viewport });
    await bad.route('**/Char_Director_Standard.glb', route => route.abort());
    await bad.goto('http://127.0.0.1:4197/');
    await bad.waitForFunction(() => window.preview?.snapshot().disposed);
    assert.equal(await bad.locator('#error').isVisible(), true);
    await bad.waitForTimeout(100);assert.equal((await bad.evaluate(() => window.preview.snapshot())).contextLost, true);
    await bad.close();
    report.checks.push('Missing GLB gives actionable error and disposes already loaded resources');
    const lastPage = await browser.newPage({ viewport: report.viewport });
    await lastPage.goto('http://127.0.0.1:4197/');
    await lastPage.waitForFunction(() => window.preview?.snapshot().ready);
    server.kill('SIGTERM');
    await once(server, 'exit');
    await lastPage.waitForFunction(() => window.preview.snapshot().disposed);
    report.checks.push('Server shutdown automatically disposes open preview tab');
    await lastPage.close();
    assert.deepEqual(errors, []);
    report.unexpectedBrowserErrors = errors;
    assert.deepEqual(hashes(), report.inputHashes);
    report.checks.push('Measured source inputs unchanged');
    if (resourceFailure)
        throw resourceFailure;
    report.passed = true;
}
catch (error) {
    report.passed = false;
    report.failure = String(error.stack || error);
    throw error;
}
finally {
    clearInterval(resourceTimer);
    if (browser)
        await browser.close();
    if (server.exitCode === null && server.signalCode === null) {
        server.kill('SIGTERM');
        await once(server, 'exit');
    }
    report.finished = new Date().toISOString();
    report.serverExit = { code: server.exitCode, signal: server.signalCode };
    save();
    console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, failure: report.failure }));
}
