import {spawn} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
const root=fileURLToPath(new URL('..',import.meta.url));
const lane='/Users/zacheryspector/studio-scratch/1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh';
const lock='/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK';
if(!existsSync(lane))throw new Error('Existing intensive-work lane unavailable. Coordinate with the integrator.');
const run=root+'/.runs/'+new Date().toISOString().replaceAll(':','-')+'-'+randomUUID();mkdirSync(run,{recursive:true});
const log=run+'/session.log',stop=run+'/stop';
console.log('Waiting for the existing intensive-work lane, then opening an isolated Chrome window.');
console.log('Close that window or press Control-C here to stop and release the lane.');
console.log('Session log: '+log);
// The separate process group permits orderly owned-browser/server shutdown
// before the lane process exits and releases its lock.
const child=spawn('/bin/bash',[lane,'0',log,'/bin/bash',root+'/scripts/session.sh',log,stop],{cwd:root,detached:true,stdio:['ignore','inherit','inherit']});
let stopping=false;
function requestStop(){if(stopping)return;stopping=true;writeFileSync(stop,'stop\n',{flag:'wx'});console.log('Stopping at the next safe point; waiting for browser/server cleanup…');let owned=false;try{owned=readFileSync(lock,'utf8').startsWith(`lane-run ${log} token=`);}catch{}
 // A waiting lane has not started work. If it acquires during this check,
 // the session sees the stop file before any intensive command.
 if(!owned)child.kill('SIGTERM');
}
process.on('SIGINT',requestStop);process.on('SIGTERM',requestStop);process.on('SIGHUP',requestStop);
child.once('error',error=>{console.error(error);process.exitCode=1;});
child.once('exit',(code,signal)=>{console.log(`Preview session ended (${code??signal}).`);if(code!==0&&!stopping){try{console.error(readFileSync(log,'utf8').slice(-6000));}catch{}process.exitCode=code||1;}});
