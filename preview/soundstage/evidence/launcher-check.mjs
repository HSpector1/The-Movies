import {spawn,execFileSync,spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {once} from 'node:events';
import assert from 'node:assert/strict';
const root='/Users/zacheryspector/studio-scratch/browser-soundstage-preview/preview/soundstage';
const lock='/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK';
const out=root+'/evidence/launcher-check.json';
assert.ok(!existsSync(lock),'Recorded browser lane must be released first');assert.ok(!existsSync(out));
const report={started:new Date().toISOString(),headlessLauncherTest:true,checks:[]};
const child=spawn('/bin/bash',[root+'/START PREVIEW.command'],{cwd:root,env:{...process.env,PREVIEW_HEADLESS:'1'},stdio:['ignore','pipe','pipe']});
let output='';child.stdout.on('data',c=>{output+=String(c);});child.stderr.on('data',c=>{output+=String(c);});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const inventory=()=>execFileSync('/bin/ps',['-axo','pid=,ppid=,comm='],{encoding:'utf8'}).split('\n').flatMap(line=>{const m=line.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/);return m?[{pid:+m[1],parent:+m[2],name:m[3].split('/').at(-1)}]:[];});
function descendants(rows,pid){const ids=new Set([pid]);let size;do{size=ids.size;rows.forEach(r=>{if(ids.has(r.parent))ids.add(r.pid);});}while(size!==ids.size);return rows.filter(r=>ids.has(r.pid));}
try{
 let log;
 const deadline=Date.now()+60000;
 while(Date.now()<deadline){
  log=output.match(/Session log: (.+)/)?.[1];
  if(log&&existsSync(log)&&readFileSync(log,'utf8').includes('ISOLATED_BROWSER_READY'))break;
  if(child.exitCode!==null||child.signalCode!==null)throw new Error('Launcher ended before browser readiness: '+output);
  await delay(100);
 }
 assert.ok(log&&existsSync(log)&&readFileSync(log,'utf8').includes('ISOLATED_BROWSER_READY'),'Launcher browser readiness');
 const marker=readFileSync(lock,'utf8');assert.ok(marker.startsWith(`lane-run ${log} token=`));
 report.sessionLog=log;report.ownedBeforeStop=descendants(inventory(),child.pid);
 assert.ok(report.ownedBeforeStop.some(r=>r.name==='Google Chrome'));
 assert.equal((await fetch('http://127.0.0.1:4197/')).status,200);
 report.checks.push('Actual START command owns existing lane, builds selected preview, starts localhost server and isolated installed Chrome');
 const direct=spawnSync('/bin/bash',[root+'/scripts/session.sh',log,log+'.unowned-stop'],{cwd:root,encoding:'utf8'});
 assert.notEqual(direct.status,0);assert.match(direct.stdout+direct.stderr,/Required lane ancestor absent/);
 report.unownedSession={status:direct.status,output:direct.stdout+direct.stderr};report.checks.push('Direct session refuses matching lock without owned lane ancestor');
 const occupied=spawnSync(process.execPath,[root+'/scripts/server.mjs'],{cwd:root,encoding:'utf8'});
 assert.notEqual(occupied.status,0);assert.match(occupied.stderr,/EADDRINUSE/);assert.equal((await fetch('http://127.0.0.1:4197/')).status,200);
 report.occupiedPort={status:occupied.status,output:occupied.stderr};report.checks.push('Occupied port refuses second server and preserves the existing server');
 const exit=once(child,'exit');child.kill('SIGINT');await exit;
 assert.equal(child.exitCode,0);assert.ok(!existsSync(lock));
 const alive=inventory(),ownedIds=new Set(report.ownedBeforeStop.map(r=>r.pid));
 report.survivors=alive.filter(r=>ownedIds.has(r.pid)&&r.name!=='caffeinate');assert.deepEqual(report.survivors,[]);
 let stillServing=false;try{await fetch('http://127.0.0.1:4197/');stillServing=true;}catch{}assert.equal(stillServing,false);
 report.checks.push('Control-C closes owned Chrome/server, ends lane0, removes owned lock and leaves no owned process or listening preview');
 report.passed=true;report.sessionContents=readFileSync(log,'utf8');report.laneMetadata=readFileSync(log+'.meta','utf8');
}catch(error){report.passed=false;report.failure=String(error.stack||error);process.exitCode=1;}
finally{
 if(child.exitCode===null&&child.signalCode===null){const exit=once(child,'exit');child.kill('SIGINT');await exit;}
 report.finished=new Date().toISOString();report.launcherOutput=output;writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,failure:report.failure}));
}
