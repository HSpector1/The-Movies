// SOURCE ONLY: disposable paired controls. No original M0 cause or execution authority.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const HERE=path.dirname(fileURLToPath(import.meta.url)), CAP=1024*1024, MAP_CAP=65536;
const started=performance.now(), records=[];
let artifactRoot=null;
function need(value, code) { if (!value) throw new Error('STOP_'+code); }
function sha(raw) { return crypto.createHash('sha256').update(raw).digest('hex'); }
function guard() { need(performance.now()-started<60000,'AGGREGATE_60'); }
function identity(st) { return ['dev','ino','mode','nlink','size','mtimeNs','ctimeNs'].map(k=>String(st[k])); }
function stableRead(p, cap) {
  need(fs.realpathSync(p)===p,'PHYSICAL_FILE');
  const before=fs.lstatSync(p,{bigint:true});need(before.isFile()&&before.nlink===1n&&before.size<=BigInt(cap),'FILE_KIND_CAP');
  const fd=fs.openSync(p,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
  try {
    need(JSON.stringify(identity(fs.fstatSync(fd,{bigint:true})))===JSON.stringify(identity(before)),'OPEN_RACE');
    const raw=fs.readFileSync(fd);
    need(raw.length<=cap&&JSON.stringify(identity(fs.fstatSync(fd,{bigint:true})))===JSON.stringify(identity(before))&&JSON.stringify(identity(fs.lstatSync(p,{bigint:true})))===JSON.stringify(identity(before)),'READ_RACE');
    return raw;
  } finally { fs.closeSync(fd); }
}
function auth(role, cap=16*1024*1024) { const raw=stableRead(role.path,cap);need(raw.length===role.bytes&&sha(raw)===role.sha256,'ROLE_HASH');guard();return raw; }
function durable(p,raw,cap=CAP) {
  need(raw.length<=cap,'ARTIFACT_CAP');
  const fd=fs.openSync(p,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL|fs.constants.O_NOFOLLOW,0o600);
  try {fs.writeFileSync(fd,raw);fs.fsyncSync(fd);} finally {fs.closeSync(fd);}
  return {path:p,bytes:raw.length,sha256:sha(raw)};
}
function jsonArtifact(p,obj,cap=MAP_CAP) { return durable(p,Buffer.from(JSON.stringify(obj,null,2)+'\n'),cap); }
function tree(root) {
  // Only this newly created disposable fixture is traversed. The dependency link is never followed.
  const entries=[];
  function visit(relative) {
    need(entries.length<16,'FIXTURE_ROSTER_CAP');
    const p=path.join(root,relative), st=fs.lstatSync(p,{bigint:true});
    const row={path:relative||'.',metadata:identity(st)};
    if(st.isSymbolicLink()) {need(relative==='node_modules','UNEXPECTED_LINK');row.kind='link';row.target=fs.readlinkSync(p);}
    else if(st.isDirectory()) {row.kind='directory';}
    else {need(st.isFile()&&st.nlink===1n,'FIXTURE_FILE');const raw=stableRead(p,MAP_CAP);row.kind='file';row.bytes=raw.length;row.sha256=sha(raw);}
    entries.push(row);
    if(st.isDirectory()) for(const name of fs.readdirSync(p).sort()) visit(relative?relative+'/'+name:name);
  }
  visit('');return {schema:'1370-disposable-strict-metadata-map/v1',root,metadataFields:['dev','ino','mode','nlink','size','mtimeNs','ctimeNs'],entries};
}
function compareMaps(before,after,arm) {
  need(before.root===after.root&&before.entries.length===8&&after.entries.length===8,'ROSTER_COUNT');
  need(before.entries.map(r=>r.path).join('\n')===['.','core.config.mts','node_modules','package.json','tests','tests/meta-control.test.ts','vitest.config.mts','vitest.workspace.mts'].join('\n'),'EXACT_FIXTURE_ROSTER');
  need(before.entries.map(r=>r.path).join('\n')===after.entries.map(r=>r.path).join('\n'),'FINAL_ROSTER');
  need(JSON.stringify(before.entries.slice(1))===JSON.stringify(after.entries.slice(1)),'NONROOT_METADATA_CONTENT');
  const b=before.entries[0].metadata,a=after.entries[0].metadata;
  const strictEqual=JSON.stringify(b)===JSON.stringify(a);
  if(arm==='RED') {
    need(b.slice(0,4).join(':')===a.slice(0,4).join(':'),'RED_ROOT_IDENTITY');
    need(!strictEqual&&b[5]!==a[5]&&b[6]!==a[6],'RED_METADATA_CHANGE');
  } else need(strictEqual,'GREEN_ROOT_METADATA');
  return {strictRootEqual:strictEqual,completeMapEqual:JSON.stringify(before)===JSON.stringify(after),
    changedRootFields:before.metadataFields.filter((_,i)=>b[i]!==a[i]),nonrootEqual:true,finalRosterEqual:true};
}
async function collect(config,arm,fixture,configDir,external,streams) {
  guard();
  const output=path.join(streams,arm+'-collection.json');
  const argv=[config.roles.cli.path,'list','tests/meta-control.test.ts','--config',path.join(configDir,'vitest.config.mts'),
    '--workspace',path.join(configDir,'vitest.workspace.mts'),'--project','core','--json',output,'--no-cache'];
  const before=tree(fixture), beforeRole=jsonArtifact(path.join(streams,arm+'-before.json'),before);
  const env={...process.env,TMPDIR:path.join(external,'tmp'),TMP:path.join(external,'tmp'),TEMP:path.join(external,'tmp'),
    XDG_CACHE_HOME:path.join(external,'cache'),CI:'1',NO_COLOR:'1'};
  delete env.NODE_OPTIONS;delete env.NODE_PATH;
  const begin=performance.now(), out=[],err=[];let outBytes=0,errBytes=0,child=null;
  let actualExit=null,actualSignal=null,runError=null;
  try {
    await new Promise((resolve,reject)=>{
      child=spawn(config.nodePath,argv,{cwd:fixture,env,stdio:['ignore','pipe','pipe'],detached:false});
      // CLI and its descendants inherit the recorder's recorded owned group; no new detached group.
      child.once('error',reject);
      const capture=(name,chunk)=>{
        if(name==='stdout') {outBytes+=chunk.length;if(outBytes<=CAP)out.push(chunk);}
        else {errBytes+=chunk.length;if(errBytes<=CAP)err.push(chunk);}
        if(outBytes>CAP||errBytes>CAP) reject(new Error('STOP_NESTED_STREAM_CAP'));
      };
      child.stdout.on('data',chunk=>capture('stdout',chunk));
      child.stderr.on('data',chunk=>capture('stderr',chunk));
      child.once('close',(code,signal)=>{actualExit=code;actualSignal=signal;resolve();});
    });
  } catch(exc) {runError=String(exc);}
  const stdoutRole=durable(path.join(streams,arm+'-stdout.bin'),Buffer.concat(out));
  const stderrRole=durable(path.join(streams,arm+'-stderr.bin'),Buffer.concat(err));
  let after=null,afterRole=null;
  try {after=tree(fixture);afterRole=jsonArtifact(path.join(streams,arm+'-after.json'),after);} catch(exc) {if(!runError)runError=String(exc);}
  const record={arm,argv:[config.nodePath,...argv],cwd:fixture,cliPid:child?.pid??null,
    actualExit,actualSignal,elapsedSeconds:(performance.now()-begin)/1000,stdout:stdoutRole,stderr:stderrRole,
    before:beforeRole,after:afterRole,configDir,rootConfig:path.join(configDir,'vitest.config.mts'),
    workspaceConfig:path.join(configDir,'vitest.workspace.mts'),projectConfig:path.join(configDir,'core.config.mts'),runError};
  records.push(record);jsonArtifact(path.join(streams,arm+'-run.json'),record);
  need(runError===null&&Number.isInteger(actualExit)&&actualExit===0&&actualSignal===null,'NESTED_EXIT');
  guard();
  const raw=stableRead(output,MAP_CAP), rows=JSON.parse(raw);
  record.collection={path:output,bytes:raw.length,sha256:sha(raw)};
  need(Array.isArray(rows)&&rows.length===1,'ONE_COLLECTION');
  const row=rows[0];
  need(row&&Object.keys(row).sort().join(',')==='file,name,projectName'&&row.name==='metadata-collected-only'
    &&row.file===path.join(fixture,'tests/meta-control.test.ts')&&row.projectName==='core','COLLECTION_IDENTITY');
  record.collected=rows;record.metadata=compareMaps(before,after,arm);
  jsonArtifact(path.join(streams,arm+'-validated.json'),record);
  return record;
}
async function main() {
  need(process.argv.length===3&&/^[a-f0-9]{64}$/.test(process.argv[2]),'ARGV');
  const configRaw=stableRead(path.join(HERE,'CONFIG.json'),MAP_CAP);need(sha(configRaw)===process.argv[2],'CONFIG_HASH');
  const config=JSON.parse(configRaw);
  need(config.schema==='1370-disposable-config-metadata-controls/v1'&&config.executionAuthorization===false
    &&config.originalM0CauseAdmission===false,'SOURCE_CONFIG');
  need(process.version==='v22.23.2'&&fs.realpathSync(process.execPath)===config.nodePath,'NODE_IDENTITY');
  for(const role of Object.values(config.roles))auth(role);
  const loader=auth(config.roles.viteLoader).toString('utf8');
  need(loader.includes('await fsp.writeFile(fileNameTmp, bundledCode)')&&loader.includes('fs__default.unlink(fileNameTmp'),'PINNED_REAL_LOADER_BRANCH');
  const version=JSON.parse(auth(config.roles.vitestPackage)).version;
  const viteVersion=JSON.parse(auth(config.roles.vitePackage)).version;
  need(version==='2.1.9'&&viteVersion==='5.4.21','REAL_VERSIONS');
  const resolved=createRequire(config.roles.vitestPackage.path).resolve('vite/package.json');
  need(fs.realpathSync(resolved)===config.roles.vitePackage.path,'ACTUAL_NESTED_VITE');
  artifactRoot=config.artifactRoot;
  need(path.dirname(artifactRoot)===config.scratchRoot&&fs.realpathSync(config.scratchRoot)===config.scratchRoot&&!fs.existsSync(artifactRoot),'FRESH_DISPOSABLE_ROOT');
  fs.mkdirSync(artifactRoot,{mode:0o700});
  const fixture=path.join(artifactRoot,'mirror'),external=path.join(artifactRoot,'external'),streams=path.join(artifactRoot,'streams');
  for(const p of [fixture,external,streams,path.join(fixture,'tests'),path.join(external,'cache'),path.join(external,'tmp')])fs.mkdirSync(p,{mode:0o700});
  fs.symlinkSync(config.dependencyRoot,path.join(fixture,'node_modules'),'dir');
  durable(path.join(fixture,'package.json'),auth(config.roles.fixturePackage));
  durable(path.join(fixture,'tests/meta-control.test.ts'),auth(config.roles.fixtureTest));
  const templates=JSON.parse(auth(config.roles.templates));
  const generated=[];
  for(const configDir of [fixture,external]) {
    const rootOptions={root:fixture,cacheDir:path.join(external,'cache'),test:{name:'root-unselected',
      workspace:path.join(configDir,'vitest.workspace.mts'),include:['tests/never-root.test.ts'],watch:false,cache:false}};
    const projectOptions={root:fixture,cacheDir:path.join(external,'cache'),test:{name:'core',
      include:['tests/meta-control.test.ts'],environment:'node',globals:false,watch:false,cache:false,
      pool:'forks',poolOptions:{forks:{singleFork:true}},fileParallelism:false,
      deps:{optimizer:{ssr:{enabled:false},web:{enabled:false}}}}};
    generated.push(durable(path.join(configDir,'vitest.config.mts'),Buffer.from('export default '+JSON.stringify(rootOptions)+';\n')));
    generated.push(durable(path.join(configDir,'core.config.mts'),Buffer.from('export default '+JSON.stringify(projectOptions)+';\n')));
    generated.push(durable(path.join(configDir,'vitest.workspace.mts'),Buffer.from(templates.workspace)));
  }
  jsonArtifact(path.join(streams,'generated-configs.json'),generated);
  const red=await collect(config,'RED',fixture,fixture,external,streams);
  const green=await collect(config,'GREEN',fixture,external,external,streams);
  need(JSON.stringify(red.collected)===JSON.stringify(green.collected)&&red.collection.bytes===green.collection.bytes&&red.collection.sha256===green.collection.sha256,'SAME_COLLECTION');
  guard();
  const report={schema:'1370-disposable-config-metadata-controls-report/v1',status:'M0_CONFIG_METADATA_CONTROLS_AGREE',
    configSha256:process.argv[2],artifactRoot,fixtureRoot:fixture,versions:{node:process.version,vitest:version,vite:viteVersion},
    arms:records,collectedTests:1,sameCollectedIdentity:true,redMetadataChanged:true,greenStrictMetadataStable:true,
    aggregateElapsedSeconds:(performance.now()-started)/1000,generatedConfigs:generated,
    transientFileEventEvidence:null,eventTracerInstalled:false,sourceLoaderBranchAuthenticated:true,
    originalM0CauseAdmission:false,originalM0SourcePreservationAdmission:false,game:false,executionAuthorization:false};
  jsonArtifact(path.join(streams,'REPORT.json'),report);
  guard();console.log(JSON.stringify(report));
}
main().catch(exc=>{
  const report={schema:'1370-disposable-config-metadata-controls-report/v1',status:'STOP_DISPOSABLE_METADATA_CONTROLS',
    error:String(exc),artifactRoot,arms:records,originalM0CauseAdmission:false,game:false,executionAuthorization:false};
  try {if(artifactRoot)jsonArtifact(path.join(artifactRoot,'STOP.json'),report);} catch(writeError){report.stopWriteError=String(writeError);}
  console.log(JSON.stringify(report));process.exitCode=2;
});
