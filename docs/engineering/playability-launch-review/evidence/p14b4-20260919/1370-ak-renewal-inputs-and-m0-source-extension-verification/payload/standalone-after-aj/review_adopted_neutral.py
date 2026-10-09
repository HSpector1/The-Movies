from pathlib import Path
import os,json,hashlib,stat,ast,subprocess,shutil,datetime
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program');P=S/'1370-c0-m0-additive-exact-parent-adoption-after-aj-20261009-r1';F=S/'1370-c0-m0-additive-exact-final-candidate-after-aj-20261009-r1';D=S/'1370-c0-m0-additive-adopted-preflight-independent-review-after-aj-20261009-r1';ARCH=S/'1370-c0-m0-additive-exact-pre-adoption-archive-after-aj-20261009-r1'
assert not os.path.lexists(D);D.mkdir(mode=0o700)
def sha(b):return hashlib.sha256(b).hexdigest()
def stamp(st):return [st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]
def read(p,tool=False):
 st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and (tool or st.st_nlink==1);b=p.read_bytes();assert stamp(p.lstat())==stamp(st);return b
def role(p):
 b=read(p,str(p).startswith('/usr/'));return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def auth(rr):
 b=read(Path(rr['path']),str(rr['path']).startswith('/usr/'));assert len(b)==rr['bytes'] and sha(b)==rr['sha256'];return b
def write(n,b):
 fd=os.open(D/n,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(b);f.flush();os.fsync(f.fileno())
def dump(n,x):write(n,(json.dumps(x,sort_keys=True,indent=2)+'\n').encode())
adrole=role(P/'ADOPTION.json');assert adrole['sha256']=='81984fa53c5f69f93ae718b35d2d85c306feaab8acc4e0fdc3c5eeb3a34134cb';ad=json.loads(auth(adrole))
Lrole=role(P/'ADOPTED-LAUNCH-SPEC.json');assert Lrole==ad['adoptedLaunch'] and Lrole['sha256']=='4bdca6f36f0dd20067da512a5f3bf01c840043a236c1000862f8acf93ab27c08';L=json.loads(auth(Lrole))
assert role(F/'BINDING-DRAFT.json')==ad['adoptedBinding'] and ad['adoptedBinding']['sha256']=='35e596a0ee6d5119fd2a84f03f3fc0a7398be1208a8f65e4c4824ca67e269a50'
B=json.loads(auth(ad['adoptedBinding']));exact=json.loads(auth(ad['exactReview']));assert exact['decision']=='ACCEPT_EXACT_FILLED_UNRUN'
manifest=json.loads(auth(ad['archiveManifest']));assert ad['archiveManifest']['sha256']=='d93b83ce358c59c4ce44b9af262d0fb72c7e17e606f3433b843089c2de37b041' and len(manifest['files'])==6
original={}
for n,entry in manifest['files'].items():
 data=auth(entry['archive']);original[n]=data;assert len(data)==entry['original']['bytes'] and sha(data)==entry['original']['sha256'] and entry['original']['metadata']==exact['candidateFileIdentities'][n]
 assert entry['archive']['path']==str(ARCH/n) and stat.S_IMODE((ARCH/n).lstat().st_mode)==0o600
 if n!='BINDING-DRAFT.json':assert read(F/n)==data and stamp((F/n).lstat())==entry['original']['metadata']
assert role(F/'PINS.json')==exact['candidatePins'] and auth(exact['candidatePins'])==original['PINS.json']
old=json.loads(original['BINDING-DRAFT.json']);A={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'};pre={'preflightReviewPath','preflightReviewSha256'}
assert set(B)==set(old) and {k for k in B if B[k]!=old[k]}==A==set(ad['changedFields'])
assert B['status']=='REVIEWED_FILLED_UNRUN' and B['executionAuthorization'] is True and B['exactBindingReviewDecision']=='ACCEPT_EXACT_FILLED_UNRUN' and B['exactBindingReviewPath']==ad['exactReview']['path'] and B['exactBindingReviewSha256']==ad['exactReview']['sha256']
def digest(x,excluded):return sha(json.dumps({k:v for k,v in x.items() if k not in excluded},sort_keys=True,separators=(',',':')).encode())
semantic=digest(B,A);core=digest(B,A|pre);assert semantic==digest(old,A)==ad['bindingSemanticSha256']==exact['bindingSemanticSha256']==L['bindingSemanticSha256']=='3949fb78642c7324d61e1c23f967f10a056e17d3a5ae5a850ebbb73969c4e8e5';assert core==digest(old,A|pre)==ad['guardCoreSha256']==L['guardCoreSha256']=='69f4a0a4e5bb4d686ef03178dafa9b4c27c11d8671745d61a0537fd725adf69d'
originalLaunch=json.loads(original['LAUNCH-SPEC.json']);expectedLaunch=dict(originalLaunch,status='PARENT_ADOPTED_EXACT_LAUNCH_REQUIRES_ADOPTED_PREFLIGHT_AND_ROOT_GRANT',executionAuthorization=True,bindingSha256=ad['adoptedBinding']['sha256'],exactReview=ad['exactReview'],originalExactLaunchArchive=role(ARCH/'LAUNCH-SPEC.json'),originalExactPinsArchive=role(ARCH/'PINS.json'));assert L==expectedLaunch
wrapper=role(S/'1370-ak-grant-additive.py');assert wrapper['sha256']=='be3a92487ba1ffd55865444e5b27cf487658fbceb56a2b8a8039045799cd4a06'
for key in ('materializer','recorder','supervisor','materializerSourceReview','routeSourceReview','materializerArgvRole','preflightReview','parentScopeAdoption','currentFullGuardSnapshot','currentFullGuardReview','currentFullGuardParentAdoption','currentBoundedMetadata'):
 assert role(Path(B[key+'Path']))['sha256']==B[key+'Sha256']
assert role(Path(ad['sourceScript']['path']))==ad['sourceScript'] and ad['protectedFreezeMaintained'] is True and ad['runtimeLaunchGranted'] is False
assert L['bindingPath']==str(F/'BINDING-DRAFT.json') and L['bindingSha256']==ad['adoptedBinding']['sha256'] and L['argv']==['/bin/bash',L['argv'][1],'0',str(S/B['helperLogName']),B['pythonPath'],'-I','-B',B['supervisorPath'],str(F/'BINDING-DRAFT.json')]
assert L['runtimeArgv']==L['argv'][4:] and B['materializerArgv']==[B['pythonPath'],'-I','-B',B['materializerPath'],L['bindingPath']] and L['environment']==B['launchEnvironment'] and L['cwd']==str(R)
assert role(Path(L['argv'][1]))['sha256']==L['helperSha256']=='aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e'
for p,expected in B['strictRootMetadata'].items():
 st=Path(p).lstat();assert Path(p).resolve(strict=True)==Path(p) and stat.S_ISDIR(st.st_mode) and [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_mtime_ns,st.st_ctime_ns]==expected
assert len(B['strictRootMetadata'])==10
for p,expected in B['ancestryIdentity'].items():
 st=Path(p).lstat();assert Path(p).resolve(strict=True)==Path(p) and stat.S_ISDIR(st.st_mode) and [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode)]==expected
assert stamp(Path(B['mirrorPath']).lstat())==B['originalM0RootMetadata']
for p,expected in B['toolRoles'].items():
 st=Path(p).lstat();assert Path(p).resolve(strict=True)==Path(p) and stat.S_ISREG(st.st_mode) and os.access(p,os.X_OK) and [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink]==expected['identity'] and role(Path(p))['sha256']==expected['sha256']
env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_CONFIG_NOSYSTEM='1',GIT_CONFIG_GLOBAL='/dev/null',GIT_TERMINAL_PROMPT='0',GIT_OPTIONAL_LOCKS='0')
commands=[]
def command(argv,*,env=env):
 p=subprocess.run(argv,cwd=R,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=30,close_fds=True);assert p.returncode==0 and len(p.stdout)<=2*1024**2 and len(p.stderr)<=65536;commands.append({'argv':argv,'exit':p.returncode,'stdoutBytes':len(p.stdout),'stdoutSha256':sha(p.stdout),'stderrBytes':len(p.stderr),'stderrSha256':sha(p.stderr)});return p.stdout
def git(*args):return command([B['gitPath'],'-c','gc.auto=0','-c','maintenance.auto=0','-c','core.hooksPath=/dev/null','--no-optional-locks',*args])
head=git('rev-parse','HEAD').decode().strip();tree=git('rev-parse','HEAD:src').decode().strip();status=git('status','--porcelain=v1','-z','--untracked-files=all');refs=git('ls-remote','origin','refs/heads/main','refs/heads/wip/headless-program-20260916-ts').decode().splitlines()
assert head==B['productionHead']=='f0fb818fe7534c3e3784206d16728b015c7f059a' and tree==B['productionSourceTree'] and not status and set(refs)=={'c902a704eb948cc576083d0973c8c23e59937dc1\trefs/heads/main',head+'\trefs/heads/wip/headless-program-20260916-ts'}
uuid=command(['/usr/sbin/sysctl','-n','kern.bootsessionuuid']).decode().strip();assert uuid==B['bootSessionUuid'];power=command(['/usr/bin/pmset','-g','batt']).decode();assert 'AC Power' in power;free=shutil.disk_usage(S).free;assert free>=3758096384
rawps=command(['/bin/ps','-axo','pid=,ppid=,pgid=,lstart=,state=,comm=,args=']);write('CURRENT-PS.LOCAL.txt',rawps);workerView=command(['/bin/ps','-axo','comm=,args=']).decode()
markers=['fixture_worker.py','vitest','/bin/tsc','/lib/tsc.js','witness.mts','outer-recorder.py','/1370-c0-aging-era-employment-witness-source-','/1370-c0-m0-operational-materializer-proposal-','/1370-c0-m0-recorded-materialization-route-proposal-','/1370-c0-m0-additive-recorded-route-proposal-'];assert not any(m in line for line in workerView.splitlines() for m in markers)
ids=[93713,78074]
for pid in ids:
 for fn in (os.kill,os.killpg):
  try:fn(pid,0)
  except ProcessLookupError:pass
  else:raise AssertionError('known scanner numeric PID/group present '+str(pid))
guard=Path(S/'1370-c0-aging-era-sparse-materializer-source-r6/materialize.py');guardRole=role(guard);assert guardRole['sha256']=='2d63876297bc85a1ab5192491f4255d2cce7d17de048bfec65c21b479d1f0896'
node=next(n for n in ast.parse(read(guard)).body if isinstance(n,ast.FunctionDef) and n.name=='assert_no_protected_writable_fds')
def require(ok,why):
 if not ok:raise RuntimeError(why)
ns={'Path':Path,'os':os,'command':command,'clean_env':lambda:env,'require':require,'Stop':RuntimeError};exec(compile(ast.Module(body=[node],type_ignores=[]),str(guard),'exec'),ns)
fdroles=[];scopes=[{'productionRoot':B['productionRoot'],'commonGitRoot':B['commonGitRoot']},*B['additionalFdScopes']]
for i,scope in enumerate(scopes):
 capture=[]
 def captured_command(argv,*,env=env):
  raw=command(argv,env=env);capture.append(raw);return raw
 ns['command']=captured_command;ns['assert_no_protected_writable_fds'](dict(B,**scope));assert len(capture)==1;name=f'CURRENT-LSOF-{i}.LOCAL.bin';write(name,capture[0]);fdroles.append({'scope':scope,'rawLocalOnly':role(D/name)})
fresh=[S/'HEAVY-LANE-LOCK',Path(B['outputRoot']),Path(B['recorderLockPath']),Path(L['argv'][3]),Path(L['argv'][3]).with_suffix('.meta'),Path(L['argv'][3]+'.meta'),P/'GRANT.json'];assert all(not os.path.lexists(p) for p in fresh)
dump('FACTS.json',{'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'adoption':adrole,'archiveManifest':ad['archiveManifest'],'archiveOriginalSixBytesAndMetadataAuthenticated':True,'fiveAuthorizationChangesOnly':sorted(A),'nonbindingFiveLiveBytesAndIdentitiesUnchanged':True,'bindingSemanticSha256':semantic,'guardCoreSha256':core,'wrapper':wrapper,'adoptedLaunch':Lrole,'freshTenRootsAndExactAncestryAndOriginalM0MetadataMatch':True,'fivePhysicalToolsMatch':True,'currentLocalHead':head,'currentLocalSourceTree':tree,'currentWorkingTreeClean':True,'remoteRefsSeparatelyObserved':refs,'bootSessionUuid':uuid,'acPower':True,'freeBytes':free,'knownScannerPidsAndPgidsAbsent':ids,'relevantWorkerMarkersFreshAbsent':True,'fdScopesPassed':fdroles,'fdParserSource':guardRole,'fdParserFunctionAstSha256':sha(ast.dump(node,include_attributes=False).encode()),'fdMechanism':'Exact authenticated accepted r6 single parser function compiled for bounded readonly FD guard; no full materializer/proposed recorder/body/supervisor import or inventory execution.','rawPsLocalOnly':role(D/'CURRENT-PS.LOCAL.txt'),'commands':commands,'freshAbsentPaths':list(map(str,fresh)),'continuousFreezeAuthority':ad['protectedFreezeMaintained'],'scopeLimit':'Actual readonly adopted preflight; root grant/owned additive execution/readback/full postflight remain pending. Numeric/FD/process observations are scoped snapshots, not future blanket absence. Raw machine records local hash/size-only for archive.'})
dump('RECEIPT.json',{'schema':'1370-m0-additive-adopted-preflight-independent-review-r1','decision':'ACCEPT_M0_ADDITIVE_ADOPTED_PREFLIGHT','wrapper':wrapper,'adoptedLaunch':Lrole,'bindingSemanticSha256':semantic,'guardCoreSha256':core,'adoptedBinding':ad['adoptedBinding'],'archiveManifest':ad['archiveManifest'],'productionHead':head,'freshProductionCommonFullProofAccepted':True,'r9PrivateRootReuseExplicitlyAccepted':True,'facts':role(D/'FACTS.json'),'actualAdditiveExecuted':False,'executionAuthorization':False,'findings':[]})
print(json.dumps({'directory':str(D),'receipt':role(D/'RECEIPT.json'),'fdScopes':len(scopes),'freeBytes':free,'commandCount':len(commands)}))
