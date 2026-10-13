// Author-only draft. Parent executes later in owned lane; no source/index writes.
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {readFileSync,writeFileSync,realpathSync,lstatSync,existsSync} from 'node:fs'
import {resolve,dirname,isAbsolute} from 'node:path'
import {stableStringify,LIVE_SAVE_VERSION} from '/Users/zacheryspector/studio-specialists/p15b/src/core/save.ts'

const K='/Users/zacheryspector/studio-specialists/p15b'
const A='/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012'
const packet=A+'/p15b-save48-nonleak-lawful-r1'
const HEAD='d68d4b13b454922cf84eff5c0c73cae3e780eebe'
const PACKET='174012ced86ed0b2a597378926713500da8ef8588164735a176cf634a482f396'
const PACKET_MANIFEST='cd7e25fc80a63eefc282653f771baf081d62cdd70d5509e7dd82781aded71ac2'
const bases:Record<string,string>={
 'src/core/hollywoodTick.ts':'393ad2d92c51889633804ac5a0144d1993f75f3644be4d9694f45266030a93b9',
 'src/core/hollywoodPolicy.ts':'ea2994dbb980aa60ce70d1e53ecc6c2a0acf1365145f0e6aad148e5cd0a9bce1'}
const observed:Record<string,string>={
 'src/core/hollywoodTick.ts':'52b07bd0bd2fd8e68b002416240c64bad65ce9887ac29925956dcbcbe3fd56f7',
 'src/core/hollywoodPolicy.ts':'c090d5f9a811387f1dba2ac5cd779f5ef97e8ed50b29703a02cf80599fcf6ff3'}
const probes:Record<string,string>={
 'tests/zz-s7-lib.ts':'2d58f57506312a149f153be11688181ec3045a3a22c3be0e7a358b59dc7e7b12',
 'tests/zz-s7-natural-route.test.ts':'96e46eebb5ace875710a8a3ad8e741c0c15466b4b27669935ed9a28c6faf7e41',
 'tests/zz-s7-decide-diag.test.ts':'00966e3873d571c2c475f9a0ff9e275c8a8688909d7294adf5dbcf296997fdf2'}
const configs=['package.json','package-lock.json','vitest.config.ts','vitest.workspace.ts','tsconfig.json']
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex')
function need(value:unknown,message:string):asserts value {if(!value)throw new Error('STOP: '+message)}
function regular(path:string):Buffer {
 need(isAbsolute(path)&&realpathSync(path)===path,'symlink/path identity '+path)
 const st=lstatSync(path);need(st.isFile()&&st.nlink===1,'not single regular file '+path)
 return readFileSync(path)
}
const git=(...args:string[])=>execFileSync('git',['-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','-C',K,...args])
const paths=(...args:string[])=>[...new Set(git(...args).toString().split('\0').filter(Boolean))].sort()
const same=(a:unknown,b:unknown)=>stableStringify(a)===stableStringify(b)
const [mode,out,cleanPath,cleanPin,...extra]=process.argv.slice(2)
need(mode==='clean'||mode==='decide','mode clean|decide')
need(extra.length===0&&(mode==='clean'?cleanPath===undefined&&cleanPin===undefined:!!cleanPath&&!!cleanPin?.match(/^[a-f0-9]{64}$/)),'clean: output only; decide: output + clean reference + exact hash')
need(process.version==='v20.20.2','Node20.20.2')
need(LIVE_SAVE_VERSION===48,'actual current save48')
need(process.cwd()===K&&realpathSync(K)===K,'execute from exact candidate root')
need(!!out&&isAbsolute(out)&&resolve(out)===out&&out.startsWith(A+'/')&&!existsSync(out),'fresh absolute A output required')
need(realpathSync(dirname(out))===dirname(out)&&lstatSync(dirname(out)).isDirectory(),'existing nonsymlink output parent')
// Existing owned lane, not an independent scheduler or replacement lock.
const lock='/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK'
const marker=regular(lock).toString().trim()
let pid=process.pid,owned=false
while(pid>1){
 const args=execFileSync('ps',['-p',String(pid),'-o','args='],{encoding:'utf8'}).trim()
 const run=args.match(/(?:^|\s)\S*\/lane-run-r8\.sh\s+\S+\s+(\S+)/)
 if(run&&marker.startsWith('lane-run '+run[1]+' token='))owned=true
 pid=Number(execFileSync('ps',['-p',String(pid),'-o','ppid='],{encoding:'utf8'}).trim())
}
need(owned,'must be child of existing owned lane-run-r8')
need(hash(regular(packet+'/PATCH.diff'))===PACKET,'packet patch pin')
const packetRaw=regular(packet+'/MANIFEST.json')
need(hash(packetRaw)===PACKET_MANIFEST,'159 manifest pin')
const adopted=JSON.parse(packetRaw.toString()) as {files:{path:string;sha256:string;mode:string}[]}
need(adopted.files.length===159,'exact159 packet')
const packetPaths=adopted.files.map(f=>f.path).sort()
function gitFreeze(){return {head:git('rev-parse','HEAD').toString().trim(),
 indexSHA256:hash(git('ls-files','--stage','-z')),
 cachedSHA256:hash(git('diff','--cached','--binary',HEAD,'--','.',':(exclude)HANDOFF.md')),
 unmerged:git('ls-files','--unmerged','-z').toString(),
 staged:paths('diff','--cached','--name-only','-z'),
 unstaged:paths('diff','--name-only','-z'),
 untracked:paths('ls-files','--others','--exclude-standard','-z')}}
const before=gitFreeze()
need(before.head===HEAD&&before.cachedSHA256===PACKET&&!before.unmerged,'HEAD/index packet identity')
need(same(before.staged,packetPaths),'complete staged159 set')
need(same(before.untracked,Object.keys(probes).sort()),'exact three temporary untracked probes; index unchanged')
const permitted=new Set(['HANDOFF.md',...(mode==='decide'?Object.keys(observed):[])])
need(before.unstaged.every(p=>permitted.has(p)),'foreign unstaged path')
for(const row of adopted.files){
 need(hash(git('show',':'+row.path))===row.sha256,'indexed postimage '+row.path)
 const raw=regular(K+'/'+row.path)
 need('0o'+(lstatSync(K+'/'+row.path).mode&0o777).toString(8)===row.mode,'worktree mode '+row.path)
 need(hash(raw)===(mode==='decide'&&row.path in observed?observed[row.path]:row.sha256),'working packet postimage '+row.path)
}
for(const [path,pin] of Object.entries(probes))need(hash(regular(K+'/'+path))===pin,'R2 probe pin '+path)
for(const path of Object.keys(bases))need(hash(regular(K+'/'+path))===(mode==='clean'?bases[path]:observed[path]),'exact observer source '+path)
// Same complete path selection used by reviewed zz-s7-lib.requireTree.
const all=paths('ls-files','-z','--cached','--others','--exclude-standard')
const selected=all.filter(p=>p.startsWith('src/')||p.startsWith('generated/')||configs.includes(p)||p in probes)
for(const path of [...configs,...Object.keys(probes)])need(selected.includes(path),'required runtime member '+path)
const files:Record<string,string>={}
for(const path of selected){
 need(!isAbsolute(path)&&resolve(K,path).startsWith(K+'/'),'unsafe tracked path')
 files[path]=hash(regular(resolve(K,path)))
}
const core=Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/')||p.startsWith('generated/')))
let candidateFiles:Record<string,string>=core
let cleanReference:{path:string;sha256:string}|null=null
if(mode==='decide'){
 need(!!cleanPath&&isAbsolute(cleanPath),'absolute immutable clean manifest')
 const raw=regular(cleanPath);need(hash(raw)===cleanPin,'clean reference pin')
 const clean=JSON.parse(raw.toString()) as {arm:string;head:string;liveSaveVersion:number;candidateSourceIdentity:string;candidateFiles:Record<string,string>;files:Record<string,string>;admission:{mode:string;indexSHA256:string;cachedSHA256:string}}
 need(clean.arm==='final-current'&&clean.head===HEAD&&clean.liveSaveVersion===48&&clean.admission.mode==='clean','clean reference shape')
 need(clean.admission.indexSHA256===before.indexSHA256&&clean.admission.cachedSHA256===before.cachedSHA256,'index changed since clean')
 need(hash(stableStringify(clean.candidateFiles))===clean.candidateSourceIdentity,'clean canonical identity')
 need(same(Object.keys(clean.files).sort(),Object.keys(files).sort()),'complete runtime path set changed')
 candidateFiles=clean.candidateFiles
 need(same(Object.keys(candidateFiles).sort(),Object.keys(core).sort()),'candidate source path set changed')
 for(const [path,pin] of Object.entries(files)){
  const want=path in observed?observed[path]:clean.files[path]
  need(pin===want,'only two observer file differences allowed '+path)
 }
 need(Object.keys(bases).every(p=>candidateFiles[p]===bases[p]&&clean.files[p]===bases[p]),'exact clean observer preimages')
 for(const [path,pin] of Object.entries(candidateFiles))need(core[path]===(path in observed?observed[path]:pin),'candidate core differs '+path)
 cleanReference={path:cleanPath,sha256:cleanPin!}
}
const identity=hash(stableStringify(candidateFiles))
// Repeat file/index guards before exclusive publication; no source/index mutation.
for(const [path,pin] of Object.entries(files))need(hash(regular(K+'/'+path))===pin,'input changed while hashing '+path)
need(same(gitFreeze(),before),'Git/index/path state changed during helper')
need(hash(regular(packet+'/PATCH.diff'))===PACKET&&hash(regular(packet+'/MANIFEST.json'))===PACKET_MANIFEST,'packet changed during helper')
if(cleanReference)need(hash(regular(cleanReference.path))===cleanReference.sha256,'clean reference changed')
const manifest={arm:'final-current',head:HEAD,liveSaveVersion:48,candidateSourceIdentity:identity,candidateFiles,files,
 admission:{mode,packetPATCHSHA256:PACKET,packetMANIFESTSHA256:PACKET_MANIFEST,indexSHA256:before.indexSHA256,cachedSHA256:before.cachedSHA256,cleanReference}}
const bytes=JSON.stringify(manifest,null,2)+'\n'
writeFileSync(out,bytes,{flag:'wx',mode:0o600})
console.log(JSON.stringify({output:out,sourceManifestSHA256:hash(bytes),candidateSourceIdentity:identity,head:HEAD,mode,
 files:Object.keys(files).length,candidateFiles:Object.keys(candidateFiles).length,indexSHA256:before.indexSHA256}))
