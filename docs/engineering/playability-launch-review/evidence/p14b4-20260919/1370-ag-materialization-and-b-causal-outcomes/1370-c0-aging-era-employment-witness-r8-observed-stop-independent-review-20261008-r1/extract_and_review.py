import os,stat,json,base64,hashlib,datetime,subprocess
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program');H=Path(__file__).resolve().parent
L=S/'1370-c0-aging-era-employment-witness-r8-lane-20261008-r1';D=S/'1370-c0-aging-era-employment-witness-r8-exact-draft-20261008-r1';SRC=S/'1370-c0-aging-era-employment-witness-source-r8-diagnostic-proposal-20261008-r1'
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 p=Path(p);assert p.resolve(strict=True)==p
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  st=os.fstat(fd);assert stat.S_ISREG(st.st_mode) and st.st_nlink==1
  with os.fdopen(os.dup(fd),'rb') as f:b=f.read()
  en=os.fstat(fd);assert (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns)==(en.st_dev,en.st_ino,en.st_size,en.st_mtime_ns,en.st_ctime_ns)
  return b,{'path':str(p),'sha256':sha(b),'bytes':len(b),'device':st.st_dev,'inode':st.st_ino,'mode':format(stat.S_IMODE(st.st_mode),'04o')}
 finally:os.close(fd)
raw,lr=read(L/'witness-r8.lane.log');assert lr['sha256']=='c1e14e2d10ac05ca3c18804ca6628dcfe181a638f7cbdec745bf43c4925d63d3' and len(raw)==4055
lines=raw.splitlines();assert len(lines)==3;outer=json.loads(lines[0]);sink=json.loads(lines[1]);pipe=json.loads(lines[2]);assert outer['status']=='STOP_SUPERVISOR_EXIT_2' and sink=={'status':'STOP_FRAME_SHAPE'} and pipe=={'status':'PIPELINE_EXITS_CANDIDATE','outerExit':2,'sinkExit':2}
of=outer['failure'];assert of['ownedPgid']==of['supervisorPid']==94462 and of['ownedGroupCleared'] is True and of['supervisorExit']==2 and of['stdoutBytes']==0
inner=base64.b64decode(of['stderrPrefixBase64'],validate=True);assert of['stderrTruncated'] is False and len(inner)==of['stderrBytes']==of['stderrPrefixBytes']==2475 and sha(inner)==of['stderrSha256'];ij=json.loads(inner);assert ij['status']=='STOP_CHILD_EXIT_2' and ij['reporterPid']==ij['reporterPgid']==94462
f=ij['failure'];assert f['childPid']==94463 and f['ownedPgid']==94462 and f['childExit']==2 and f['directChildReaped'] is True and f['stdoutBytes']==0
leaf=base64.b64decode(f['stderrPrefixBase64'],validate=True);assert f['stderrTruncated'] is False and len(leaf)==f['stderrBytes']==f['stderrPrefixBytes']==1363 and sha(leaf)==f['stderrSha256']=='796b7cda5e2746020578f2e9c565e190b65bd57afb905ce8e438bab1d058c4f5'
assert b"could not open '/dev/null' for reading and writing: Operation not permitted" in leaf and b'Error: Command failed: git rev-parse HEAD' in leaf
assert b'witness.mts:34:7' in leaf and b'witness.mts:61:21' in leaf
(H/'OUTER-RECORD-RAW.json').write_bytes(lines[0]+b'\n');(H/'INNER-STDERR-RAW.bin').write_bytes(inner);(H/'LEAF-STDERR-RAW.bin').write_bytes(leaf)
(H/'INNER-RECORD.json').write_text(json.dumps(ij,indent=2,sort_keys=True)+'\n')
meta,mr=read(L/'witness-r8.lane.log.meta');assert meta.count(b'\n')==3 and b'; 2026-10-08 18:50:17 CDT\nstart; 2026-10-08 18:50:17 CDT\nend, exit 2; 2026-10-08 18:50:19 CDT\n' in meta
binding,br=read(D/'BINDING-DRAFT.json');assert br['sha256']=='1ee08ede7b250087cde4dbd64ad88dd9513b4e1a150a993ae341bad6a1d16dac';b=json.loads(binding)
sourcepins,pr=read(SRC/'SOURCE-PINS.json');assert pr['sha256']=='0d8e9d26fecfdf4765267b9e4a2708418870551a0a80b96abfaadc5290375715';sp=json.loads(sourcepins)
policy,pcr=read(SRC/'POLICY.sb');witness,wr=read(SRC/'witness.mts');supervisor,sr=read(SRC/'supervise.py')
for n,rec in [('POLICY.sb',pcr),('witness.mts',wr),('supervise.py',sr)]:assert b['observerSha256'][n]==sp['files'][n]['sha256']==rec['sha256']
assert policy==b'(version 1)\n(allow default)\n(deny file-write*)\n'
wl=witness.decode().splitlines();assert "git(root, 'rev-parse', 'HEAD')" in wl[33] and 'const preflight = sourceGuard(root, thisDir, binding)' in wl[60] and 'await import' in wl[63] and 'await import' in wl[64]
assert b"'/usr/bin/sandbox-exec'" in supervisor and b"source_dir / 'POLICY.sb'" in supervisor
try:os.killpg(94462,0)
except ProcessLookupError:groupAbsent=True
else:groupAbsent=False
assert groupAbsent
q=subprocess.run(['/bin/ps','-p','94462,94463','-o','pid=,pgid=,comm='],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=30);assert q.returncode==1 and q.stdout==b''
null=Path('/dev/null');ns=null.lstat();assert stat.S_ISCHR(ns.st_mode);nullrec={'path':str(null),'characterDevice':True,'device':ns.st_dev,'inode':ns.st_ino,'mode':format(stat.S_IMODE(ns.st_mode),'04o'),'rdev':ns.st_rdev}
git=Path('/usr/bin/git');st=git.lstat();gitrec={'path':str(git),'regular':stat.S_ISREG(st.st_mode),'device':st.st_dev,'inode':st.st_ino,'mode':format(stat.S_IMODE(st.st_mode),'04o'),'links':st.st_nlink};assert gitrec['regular'] and gitrec['links']==76 and gitrec['mode']=='0755'
facts={'schema':'1370-r8-observed-stop-facts-r1','status':'STOP_NO_FRAME_KNOWN_FIRST_GIT_DENIAL_FULL_POSTFLIGHT_PENDING','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'lane':lr,'meta':mr,'binding':br,'sourcePins':pr,'policy':pcr,'witness':wr,'supervisor':sr,'outerStatus':outer['status'],'outerExit':pipe['outerExit'],'sinkExit':pipe['sinkExit'],'innerStatus':ij['status'],'knownOwnedPgid':94462,'innerChildPid':94463,'ownedGroupClearRecorded':True,'directInnerChildReapedRecorded':True,'knownOwnedGroupCurrentlyAbsent':True,'knownChildPidsCurrentlyAbsent':True,'innerStderr':{'bytes':len(inner),'sha256':sha(inner),'truncated':False},'leafStderr':{'bytes':len(leaf),'sha256':sha(leaf),'truncated':False},'outerStdoutBytes':0,'innerStdoutBytes':0,'devNullMetadata':nullrec,'gitMetadata':gitrec,'actualParentToolSession':29121,'parentReportedToolExit':2,'helperMetaExit':2,'startCDT':'2026-10-08 18:50:17','endCDT':'2026-10-08 18:50:19','noHelperWaitObserved':True,'sourcePhase':'first sourceGuard git rev-parse HEAD at witness.mts34, called main61 before fixture/engine dynamic imports64/65','claimLimit':'Observed r8 Node/vite-node witness guard failed Git on /dev/null under authenticated deny file-write* policy. No game module load through main64/65 or observeLedger call reached. No valid frame. Full protected/dependency postflight pending. R7 cause stays unknown.','gameExecutedThroughWitnessMain':False,'noRetroactiveR7CauseInference':True,'fullPostflightPending':True}
(H/'FACTS.json').write_text(json.dumps(facts,indent=2,sort_keys=True)+'\n');print(json.dumps({'factsPath':str(H/'FACTS.json'),'factsSha256':sha((H/'FACTS.json').read_bytes()),'leafSha256':sha(leaf),'innerSha256':sha(inner),'knownOwnedGroupAbsent':groupAbsent,'status':facts['status']}))
