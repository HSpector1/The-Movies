import os,sys,json,stat,hashlib,subprocess,shutil,importlib.util,datetime
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program');HERE=Path(__file__).resolve().parent
P=S/'1370-c0-aging-era-witness-r9-exact-preparation-20261008-r1';D=S/'1370-c0-aging-era-employment-witness-r9-exact-draft-20261008-r1'
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 p=Path(p);assert p.resolve(strict=True)==p
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  st=os.fstat(fd);assert stat.S_ISREG(st.st_mode)
  with os.fdopen(os.dup(fd),'rb') as f:b=f.read()
  en=os.fstat(fd);assert (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns)==(en.st_dev,en.st_ino,en.st_size,en.st_mtime_ns,en.st_ctime_ns)
  return b,st
 finally:os.close(fd)
def j(p):return json.loads(read(p)[0])
def cmd(a,cwd=R,allowed=(0,)):
 q=subprocess.run(a,cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=30);assert q.returncode in allowed,(a[0],q.returncode);return q.stdout
A=S/'1370-c0-aging-era-employment-witness-r9-pre-adoption-archive-20261008-r1';O=S/'1370-c0-aging-era-employment-witness-r9-adoption-output-20261008-r1'
assert sha(read(O/'ARCHIVE-MANIFEST.json')[0])=='395985f545d887a7e593e4fd712f7d102e27e3cc916a23d2da2038a596953cb5'
archive=j(O/'ARCHIVE-MANIFEST.json');assert archive['count']==6 and archive['draftPath']==str(D) and set(x.name for x in A.iterdir())==set(archive['files'])
for n,rec in archive['files'].items():
 raw,_=read(A/n);assert sha(raw)==rec['sha256'] and len(raw)==rec['bytes']
 if n!='BINDING-DRAFT.json':assert read(D/n)[0]==raw,n
original=j(A/'BINDING-DRAFT.json');adopted=j(D/'BINDING-DRAFT.json');adoption=j(O/'ADOPTION-RESULT.json')
assert sha(read(D/'BINDING-DRAFT.json')[0])==adoption['newBindingSha256']=='5e1c3010c5369423cadb4cf46c1efc8b445890e52ed42ebb934d88e92834fba1'
assert set(original)==set(adopted) and {k for k in original if original[k]!=adopted[k]}=={'status','executionAuthorization','exactReview'}
assert adoption['changedFields']==['exactReview','executionAuthorization','status'] and adoption['fieldDiff']=={k:{'before':original[k],'after':adopted[k]} for k in adoption['changedFields']}
assert adopted['exactReview']=={'path':str(S/'1370-c0-aging-era-employment-witness-r9-exact-independent-review-20261008-r1/RECEIPT.json'),'sha256':'352d9f86d493c745823fc4c7af25e7bbac2f56ecf3ca6b030e08961d39fbbc68','decision':'ACCEPT_EXACT_FILLED_UNRUN'}
assert sha(read(adopted['exactReview']['path'])[0])==adopted['exactReview']['sha256']
assert sha(read(O/'ADOPTED-LAUNCH-SPEC.json')[0])==adoption['adoptedLaunchSpecSha256']=='b9dcfb46d2c9cbd465e028a2835a42ff0d01c7e0897e608fff45032543e2ffbe'
expected_launch=j(A/'LAUNCH-SPEC-DRAFT.json');expected_launch.update(status='ADOPTED_UNRUN_PREFLIGHT_REQUIRED',launchAuthorized=False,bindingSha256=adoption['newBindingSha256'],exactReview=adopted['exactReview']);expected_launch['argv'][-1]=adoption['newBindingSha256'];assert j(O/'ADOPTED-LAUNCH-SPEC.json')==expected_launch
assert sys.dont_write_bytecode
assert sha(read(P/'PREPARATION-PINS.json')[0])=='f1ff248f06536603f3d7ba29f93a68f0bf9a9b15df71e4ca13ce22b4cf2b259f'
prep=j(P/'PREPARATION-PINS.json')
for n,h in prep['files'].items():assert sha(read(P/n)[0])==h,n
assert sha(read(S/'1370-c0-aging-era-witness-r9-exact-procedure-independent-review-20261008-r1/RECEIPT.json')[0])=='37b18a4ccdb19afaa3dfe4664edb7a470f394f1698c0f9d6216b2841c500a58b'
identraw=read(D/'DRAFT-IDENTITY.json')[0];assert sha(identraw)=='a35c7d74a0011dcfa588ca89b012bab6cc5dc785cfc0b6ffb2365b11eb15f44b';ident=json.loads(identraw)
assert set(x.name for x in D.iterdir())==set(ident['files'])|{'DRAFT-IDENTITY.json'}
for n,h in ident['files'].items():assert sha(read(A/n)[0])==h,n
b=j(D/'BINDING-DRAFT.json');launch=j(O/'ADOPTED-LAUNCH-SPEC.json');report=j(D/'DRAFT-REPORT.json');pins=j(D/'CANDIDATE-PINS.json');config=j(P/'CONFIG-PENDING.json')
assert ident['draftBindingSha256']=='854991c8f0ad245d6d8a4f8bd20bf5e4200542f0992bd2a181e5b60f04d69de6'
assert ident['candidatePinsSha256']=='1e7b944771c699d05274fac24d11bafdedffe5c57956092d02ed3f14b393a875'
assert b['status']=='REVIEWED_FILLED_UNRUN' and b['executionAuthorization'] is True and b['exactReview']==adopted['exactReview']
semantic={k:v for k,v in b.items() if k not in {'status','executionAuthorization','exactReview'}}
assert semantic==j(D/'BINDING-SEMANTIC.json') and sha(json.dumps(semantic,sort_keys=True,separators=(',',':')).encode())==ident['bindingSemanticSha256']=='760b7a45d6a2df8e3fbc45e2362128d8dcda3ba2ae6d7d59a300c62dc7e9f5c3'
for n,h in pins['files'].items():assert sha(read(A/n)[0])==h,n
assert launch['exactReview']==b['exactReview'] and launch['launchAuthorized'] is False and ident['launchAuthorized'] is False
assert launch['bindingPath']==str(D/'BINDING-DRAFT.json') and launch['bindingSha256']==adoption['newBindingSha256'] and launch['bindingSemanticSha256']==ident['bindingSemanticSha256'] and launch['candidatePinsSha256']==ident['candidatePinsSha256']
assert launch['bounds']=={'activeStopSeconds':742,'innerSeconds':720,'preimageBytes':262144,'sinkForwardSeconds':10,'sinkReadSeconds':760,'stderrBytes':65536,'stdoutFrameBytes':524288,'wholeRecorderSeconds':750}
assert launch['roles']==report['roles']==config['roles'] and launch['requiredEnvironment']==report['launchEnvironment']
assert launch['argv']==['/bin/bash',config['roles']['acceptedLaneHelper']['path'],'0',config['laneLog'],'/bin/bash',config['roles']['pipeAdapter']['path'],str(D/'BINDING-DRAFT.json'),adoption['newBindingSha256']]
assert launch['cwd']==str(R)
# Authenticate observed acceptance before touching the copied root.
admission=report['materializationReceipt'];assert admission['sha256']=='3a43f85ec4bd0557b6ea6ef0a46d59bfc14570324ba1297e555dee3ff4d0767d' and sha(read(admission['path'])[0])==admission['sha256'];observed=j(admission['path'])
assert observed['decision']==admission['decision']=='ACCEPT_OBSERVED_MATERIALIZATION_COPY' and observed['materializedRoot']==observed['scratchRoot']==config['materializedRoot']
assert sha(read(P/'adopt_reviewed_candidate.py')[0])=='9941da0801f2b0db3cd0fee68582c6e2151bee45efc83a59f9e944b38a7b210d'
spec=importlib.util.spec_from_file_location('accepted_r8_adopter_readonly',P/'adopt_reviewed_candidate.py');a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
source_review=report['sourceReviewReceipt'];a.source_review_gate(config,source_review['path'],source_review['sha256']);a.frozen_postflight_gate(config)
snap=j(config['acceptedFrozenPostflight']['path'])
for records in snap['immutable']['ancestry'].values():
 for r in records:
  p=Path(r['path']);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISDIR(st.st_mode) and (st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode))==(r['device'],r['inode'],r['mode'])
root=Path(config['materializedRoot']);assert b['repoRoot']==str(root)
for role in config['roles'].values():
 raw,st=read(role['path']);assert sha(raw)==role['sha256'] and format(stat.S_IMODE(st.st_mode),'04o')==role['mode']
source=Path(config['roles']['witnessSourcePins']['path']).parent;sp=j(source/'SOURCE-PINS.json')
for n,pin in sp['files'].items():
 raw,_=read(source/n);assert pin=={'sha256':sha(raw),'bytes':len(raw)}
assert len(b['observerSha256'])==7 and all(h==sp['files'][n]['sha256'] for n,h in b['observerSha256'].items())
mraw,_=read(config['materializerBindingPath']);m=json.loads(mraw);assert sha(mraw)==report['materializerBindingSha256'] and m['scratchRoot']==str(root)
mo=Path(m['outputRoot']);assert not os.path.lexists(mo/'SUPERVISOR-OVERRIDE-STOP.json')
supraw,_=read(mo/'SUPERVISOR.json');resraw,_=read(mo/'RESULT.json');sup=json.loads(supraw);res=json.loads(resraw)
assert sha(supraw)==report['materializerActualSupervisorSha256'] and sha(resraw)==report['materializerActualResultSha256']==sup['recorderSha256']
assert sup['specSha256']==res['specSha256']==sha(mraw) and sup['workerExit']==0 and sup['timedOut'] is False and sup['workerGroupClear'] is True and sup['childGroupClear'] is True and res['groupClear'] is True
for rel,rec in report['actualFiles'].items():
 raw,st=read(root/rel);assert sha(raw)==rec['sha256'] and (st.st_dev,st.st_ino,format(stat.S_IMODE(st.st_mode),'04o'),len(raw),st.st_nlink)==(rec['device'],rec['inode'],rec['mode'],rec['bytes'],rec['links'])
assert {n:report['actualFiles'][n]['sha256'] for n in b['runtimeSha256']}==b['runtimeSha256']==m['runtimeFiles']
assert {n:report['actualFiles'][n]['sha256'] for n in b['worktreeSha256']}==b['worktreeSha256']
# Authenticate all eight historical Git blob identities from the accepted filler constants.
spec=importlib.util.spec_from_file_location('accepted_r8_filler_readonly',P/'fill_actual_candidate.py');f=importlib.util.module_from_spec(spec);spec.loader.exec_module(f)
for rel,oid in f.BLOBS.items():
 raw,_=read(root/rel);assert hashlib.sha1(('blob '+str(len(raw))+'\0').encode()+raw).hexdigest()==oid
node=report['actualNode'];raw,st=read(node['path']);assert sha(raw)==node['sha256']==m['nodeSha256'] and (st.st_dev,st.st_ino,format(stat.S_IMODE(st.st_mode),'04o'))==(node['device'],node['inode'],node['mode'])
runner=Path(report['runner']['path']);assert runner.is_symlink() and os.readlink(runner)==report['runner']['target'] and str(runner.resolve(strict=True))==report['runner']['resolved']
env=dict(os.environ,**report['launchEnvironment']);git=[m['gitPath'],'-c','gc.auto=0','-c','maintenance.auto=0']
assert Path(shutil.which('node',path=env['PATH'])).resolve(strict=True)==Path(node['path'])
assert json.loads(cmd([node['path'],'-p','JSON.stringify({version:process.version,execPath:require("node:fs").realpathSync(process.execPath)})']))=={'version':b['nodeVersion'],'execPath':b['nodeExecPath']}
for cwd,head in [(R,config['productionHead']),(root,b['sourceSha'])]:
 assert cmd(git+['rev-parse','HEAD'],cwd).decode().strip()==head and cmd(git+['status','--porcelain=v1','-z','--untracked-files=all'],cwd)==b''
assert cmd(git+['rev-parse','HEAD:src']).decode().strip()==config['productionSourceTree']
assert cmd(git+['ls-remote','origin','refs/heads/wip/headless-program-20260916-ts']).decode()==config['productionHead']+'\trefs/heads/wip/headless-program-20260916-ts\n'
assert cmd(['/usr/sbin/sysctl','-n','kern.bootsessionuuid']).decode().strip()==config['bootSessionUuid']
assert b'AC Power' in cmd(['/usr/bin/pmset','-g','batt'])
ps=cmd(['/bin/ps','-axo','comm=,args=']);assert not any('fixture_worker.py' in line or (line.split() and line.split()[0].endswith('node') and ('vitest' in line or '/bin/tsc' in line or '/lib/tsc.js' in line)) for line in ps.decode().splitlines())
assert cmd(['/bin/ps','-p','25951,29271','-o','pid='],allowed=(0,1))==b''
mp=Path(m['materializerPath']);assert sha(read(mp)[0])==m['materializerSha256'];spec=importlib.util.spec_from_file_location('accepted_r6_fd_guard_readonly',mp);g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g);g.assert_no_protected_writable_fds(m);g.assert_no_protected_writable_fds(dict(m,productionRoot=str(root),commonGitRoot=str(root/'.git')))
assert not os.path.lexists(m['recorderLockPath']) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
for p in [config['laneLog'],config['laneLog']+'.meta']:assert not os.path.lexists(p),p
assert stat.S_IMODE(Path(config['laneParent']).lstat().st_mode)==0o700
free=shutil.disk_usage(S).free;assert free>=3*1024**3+128*1024**2
# Check source admission and bounds as ordinary pure validators; never call any main/run function.
spec=importlib.util.spec_from_file_location('accepted_r8_supervisor_validators',source/'supervise.py');v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v);v.validate_source_review(b,source);v.validate_bounds_roles(b);null_device=v.validate_null_device()
src_receipt=j(source_review['path']);assert null_device==src_receipt['actualSourceNullGuardResult']
controls=src_receipt['actualControlsResult'];assert sha(read(controls['path'])[0])==controls['sha256']=='b3124183608cb5cd1e758f719d8a633659b46809593e6eeb3d0dbb445a7e8561'
assert read(source/'POLICY.sb')[0]==b'(version 1)\n(allow default)\n(deny file-write*)\n(allow file-write-data (literal "/dev/null"))\n'
bstop_path=S/'1370-c0-b-release-109-tick-observed-stop-independent-review-20261008-r1/RECEIPT.json';assert sha(read(bstop_path)[0])=='7f3cc51cb452009d7fff1790b3db49ce639a001d04130d54e93c8abdfbee67f8';bstop=j(bstop_path);assert bstop['freshCurrentGuardsPassed'] is True and bstop['reusedProtectedSnapshotSha256']==config['acceptedFrozenPostflight']['sha256'] and bstop['recordedAndFreshGroupClear'] is True
for pgid in [66578,64755,94462]:
 try:os.killpg(pgid,0)
 except ProcessLookupError:pass
 else:raise AssertionError('prior actual owned group still present')
result={'status':'ADOPTED_PREFLIGHT_CURRENT_CHECKS_PASS','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'candidatePath':str(D),'reviewedDraftBindingSha256':ident['draftBindingSha256'],'adoptedBindingSha256':adoption['newBindingSha256'],'adoptedLaunchSpecSha256':adoption['adoptedLaunchSpecSha256'],'archiveManifestSha256':adoption['archiveManifestSha256'],'changedFields':adoption['changedFields'],'archiveByteProof':True,'bindingSemanticSha256':ident['bindingSemanticSha256'],'candidatePinsSha256':ident['candidatePinsSha256'],'draftIdentitySha256':sha(identraw),'productionHead':config['productionHead'],'sourcePinsSha256':sp and ident['sourcePinsSha256'],'fullInventoryRepeated':False,'reusedFullPostflightSha256':config['acceptedFrozenPostflight']['sha256'],'actualWorktreeFilesChecked':8,'actualRuntimeFilesChecked':5,'observerFilesChecked':7,'sourceFilesChecked':len(sp['files']),'strictRootsAndAncestryCurrent':True,'twoProtectedFdScopesClear':True,'freeBytes':free,'rawProcessHashOnly':{'sha256':sha(ps),'bytes':len(ps)},'noActualR9OwnedPgidYet':True,'nullDevice':null_device,'policyControlsAccepted':17,'b109StopGuardReviewSha256':'7f3cc51cb452009d7fff1790b3db49ce639a001d04130d54e93c8abdfbee67f8','gameRun':False,'launchAuthorized':False}
(HERE/'CHECKS.json').write_text(json.dumps(result,indent=2,sort_keys=True)+'\n');print(json.dumps(result,sort_keys=True))
