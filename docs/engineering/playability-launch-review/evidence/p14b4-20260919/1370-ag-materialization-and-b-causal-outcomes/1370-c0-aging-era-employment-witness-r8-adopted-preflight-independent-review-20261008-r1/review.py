import os,sys,json,stat,hashlib,subprocess,shutil,importlib.util,datetime
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program');HERE=Path(__file__).resolve().parent
P=S/'1370-c0-aging-era-witness-r8-exact-preparation-20261008-r2';D=S/'1370-c0-aging-era-employment-witness-r8-exact-draft-20261008-r1'
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
A=S/'1370-c0-aging-era-employment-witness-r8-pre-adoption-archive-20261008-r1';O=S/'1370-c0-aging-era-employment-witness-r8-adoption-output-20261008-r1'
assert sha(read(O/'ARCHIVE-MANIFEST.json')[0])=='f012f879d0a84c1e4e432c8785f3bd92c3810c605bea257c32765ff8faa1eefd'
archive=j(O/'ARCHIVE-MANIFEST.json');assert archive['count']==6 and archive['draftPath']==str(D) and set(x.name for x in A.iterdir())==set(archive['files'])
for n,rec in archive['files'].items():
 raw,_=read(A/n);assert sha(raw)==rec['sha256'] and len(raw)==rec['bytes']
 if n!='BINDING-DRAFT.json':assert read(D/n)[0]==raw,n
original=j(A/'BINDING-DRAFT.json');adopted=j(D/'BINDING-DRAFT.json');adoption=j(O/'ADOPTION-RESULT.json')
assert sha(read(D/'BINDING-DRAFT.json')[0])==adoption['newBindingSha256']=='1ee08ede7b250087cde4dbd64ad88dd9513b4e1a150a993ae341bad6a1d16dac'
assert set(original)==set(adopted) and {k for k in original if original[k]!=adopted[k]}=={'status','executionAuthorization','exactReview'}
assert adoption['changedFields']==['exactReview','executionAuthorization','status'] and adoption['fieldDiff']=={k:{'before':original[k],'after':adopted[k]} for k in adoption['changedFields']}
assert adopted['exactReview']=={'path':str(S/'1370-c0-aging-era-employment-witness-r8-exact-independent-review-20261008-r1/RECEIPT.json'),'sha256':'dc04b2825346faa467610ed5770c160d94740e5780f9f84aba1e256d244c88ad','decision':'ACCEPT_EXACT_FILLED_UNRUN'}
assert sha(read(adopted['exactReview']['path'])[0])==adopted['exactReview']['sha256']
assert sha(read(O/'ADOPTED-LAUNCH-SPEC.json')[0])==adoption['adoptedLaunchSpecSha256']=='4ea5ef752f9f378ff5c157da547b5ee37eb658d90aa2e962396c1700d121a596'
expected_launch=j(A/'LAUNCH-SPEC-DRAFT.json');expected_launch.update(status='ADOPTED_UNRUN_PREFLIGHT_REQUIRED',launchAuthorized=False,bindingSha256=adoption['newBindingSha256'],exactReview=adopted['exactReview']);expected_launch['argv'][-1]=adoption['newBindingSha256'];assert j(O/'ADOPTED-LAUNCH-SPEC.json')==expected_launch
assert sys.dont_write_bytecode
assert sha(read(P/'PREPARATION-PINS.json')[0])=='077ef3087757fde8db18777347a611a81f5454f95dfc654d866a00a5bcad65e9'
prep=j(P/'PREPARATION-PINS.json')
for n,h in prep['files'].items():assert sha(read(P/n)[0])==h,n
assert sha(read(S/'1370-c0-aging-era-witness-r8-exact-procedure-independent-review-20261008-r2/RECEIPT.json')[0])=='64b87ac489f5ae407b53550f66c010cbff66fa84950639b10bf6b4871282beee'
identraw=read(D/'DRAFT-IDENTITY.json')[0];assert sha(identraw)=='c18c090129e643ca41af30242d3afe9a1d46386706181d5b53fdacc30cee2294';ident=json.loads(identraw)
assert set(x.name for x in D.iterdir())==set(ident['files'])|{'DRAFT-IDENTITY.json'}
for n,h in ident['files'].items():assert sha(read(A/n)[0])==h,n
b=j(D/'BINDING-DRAFT.json');launch=j(O/'ADOPTED-LAUNCH-SPEC.json');report=j(D/'DRAFT-REPORT.json');pins=j(D/'CANDIDATE-PINS.json');config=j(P/'CONFIG-PENDING.json')
assert ident['draftBindingSha256']=='73b9eb634eed2fd3ef11e1c5ebebb5822f41d430a7e75b71712eb86b5e5d6488'
assert ident['candidatePinsSha256']=='2181b1b79c276ea9f21ca973c041dd68f2247fcdab87b8bffeb45aa6ddbf7684'
assert b['status']=='REVIEWED_FILLED_UNRUN' and b['executionAuthorization'] is True and b['exactReview']==adopted['exactReview']
semantic={k:v for k,v in b.items() if k not in {'status','executionAuthorization','exactReview'}}
assert semantic==j(D/'BINDING-SEMANTIC.json') and sha(json.dumps(semantic,sort_keys=True,separators=(',',':')).encode())==ident['bindingSemanticSha256']=='e2b89c293dbe867a31c94f3669e2b9840db8603b297ce158cc26a6fed6f191d4'
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
assert sha(read(P/'adopt_reviewed_candidate.py')[0])=='84c78ff72c3b9277578c73c8867ed5b47a9a5bc15af6b75480967b833d05e1fb'
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
spec=importlib.util.spec_from_file_location('accepted_r8_supervisor_validators',source/'supervise.py');v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v);v.validate_source_review(b,source);v.validate_bounds_roles(b)
result={'status':'ADOPTED_PREFLIGHT_CURRENT_CHECKS_PASS','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'candidatePath':str(D),'reviewedDraftBindingSha256':ident['draftBindingSha256'],'adoptedBindingSha256':adoption['newBindingSha256'],'adoptedLaunchSpecSha256':adoption['adoptedLaunchSpecSha256'],'archiveManifestSha256':adoption['archiveManifestSha256'],'changedFields':adoption['changedFields'],'archiveByteProof':True,'bindingSemanticSha256':ident['bindingSemanticSha256'],'candidatePinsSha256':ident['candidatePinsSha256'],'draftIdentitySha256':sha(identraw),'productionHead':config['productionHead'],'sourcePinsSha256':sp and ident['sourcePinsSha256'],'fullInventoryRepeated':False,'reusedFullPostflightSha256':config['acceptedFrozenPostflight']['sha256'],'actualWorktreeFilesChecked':8,'actualRuntimeFilesChecked':5,'observerFilesChecked':7,'sourceFilesChecked':len(sp['files']),'strictRootsAndAncestryCurrent':True,'twoProtectedFdScopesClear':True,'freeBytes':free,'rawProcessHashOnly':{'sha256':sha(ps),'bytes':len(ps)},'noActualR8OwnedPgidYet':True,'gameRun':False,'launchAuthorized':False}
(HERE/'CHECKS.json').write_text(json.dumps(result,indent=2,sort_keys=True)+'\n');print(json.dumps(result,sort_keys=True))
