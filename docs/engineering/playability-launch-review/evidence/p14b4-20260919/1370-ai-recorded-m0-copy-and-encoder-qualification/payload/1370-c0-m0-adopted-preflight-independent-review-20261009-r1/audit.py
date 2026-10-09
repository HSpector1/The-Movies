import os, stat, json, hashlib, subprocess, shutil, time, datetime
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
HERE=Path(__file__).parent
PRIVATE=S/'1370-c0-m0-adopted-preflight-current-local-only-20261009-r1'
C=S/'1370-c0-m0-final-exact-candidate-20261009-r1'
P=S/'1370-c0-m0-exact-parent-adoption-20261009-r1'
ARCH=S/'1370-c0-m0-exact-pre-adoption-archive-20261009-r1'
facts={'schema':'m0-independent-adopted-current-audit/v1','startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'roles':{},'commands':[],'engineExecuted':False,'sourceImported':False,'fullInventoryRepeated':False}
def req(ok,message):
 if not ok: raise AssertionError(message)
def digest(b): return hashlib.sha256(b).hexdigest()
def signature(st): return [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]
def read(p,sha=None,links=1):
 p=Path(p); before=p.lstat(); req(stat.S_ISREG(before.st_mode) and before.st_nlink==links,'nonregular/link '+str(p))
 req(before.st_size<=32*1024*1024,'bounded read '+str(p))
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  req(signature(os.fstat(fd))==signature(before),'open identity '+str(p))
  chunks=[]; size=0
  while True:
   b=os.read(fd,1024*1024)
   if not b: break
   size+=len(b); req(size<=32*1024*1024,'growth cap '+str(p)); chunks.append(b)
  data=b''.join(chunks)
  req(signature(os.fstat(fd))==signature(before)==signature(p.lstat()),'read identity '+str(p))
 finally: os.close(fd)
 req(len(data)==before.st_size,'size '+str(p)); h=digest(data)
 if sha: req(h==sha,'sha '+str(p))
 facts['roles'][str(p)]={'sha256':h,'bytes':len(data),'identity':signature(before)}
 return data
def obj(p,sha=None): return json.loads(read(p,sha))
def write(p,b):
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 try:
  with os.fdopen(fd,'wb') as f: f.write(b); f.flush(); os.fsync(f.fileno())
 except: raise
def run(argv,private=None,allowed=(0,)):
 start=time.monotonic(); r=subprocess.run(argv,cwd=R,env=ENV,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=25)
 rec={'argv':argv,'exit':r.returncode,'seconds':time.monotonic()-start,'stdoutBytes':len(r.stdout),'stdoutSha256':digest(r.stdout),'stderrBytes':len(r.stderr),'stderrSha256':digest(r.stderr)}
 facts['commands'].append(rec)
 if private:
  path=PRIVATE/private; write(path,r.stdout)
  rec['localOnlyStdout']={'path':str(path),'archiveBytes':False,'bytes':len(r.stdout),'sha256':digest(r.stdout)}
 req(r.returncode in allowed,'command exit '+str(argv)); req(not r.stderr,'command stderr '+str(argv))
 return r.stdout
def directory(p,n):
 st=Path(p).lstat();req(stat.S_ISDIR(st.st_mode),'directory '+p)
 return [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_mtime_ns,st.st_ctime_ns][:n]
def roots():
 for p,expected in binding['strictRootMetadata'].items(): req(directory(p,5)==expected,'strict root '+p)
 for p,expected in binding['ancestryIdentity'].items(): req(directory(p,3)==expected,'ancestry '+p)
def package(path,sha):
 pins=obj(path,sha)
 for name,role in pins['files'].items():
  data=read(Path(path).parent/name,role['sha256']);req(len(data)==role['bytes'],'package bytes '+name)
 return len(pins['files'])
started=time.monotonic()
try:
 PRIVATE.mkdir(mode=0o700)
 binding=obj(C/'BINDING-DRAFT.json','71e2db2dbe2dabfbf9d885002a9096e0e291d0ed315b92129f8098e5ceada78e')
 req(stat.S_IMODE((C/'BINDING-DRAFT.json').lstat().st_mode)==0o600,'binding mode')
 R=binding['productionRoot']; ENV=dict(os.environ,**binding['launchEnvironment'])
 adoption=obj(P/'ADOPTION.json','364fab7501f5a5917e3425703773c88f5a0e49de1b518fcda209074751a285e8')
 archive=obj(ARCH/'ARCHIVE-MANIFEST.json','7728b59ddd6b817b5372d8d0878b935b6bd9e9e0ea977589f9db5aceb4ab312b')
 originals={}
 req(len(archive['files'])==6,'archive count')
 for role in archive['files']:
  data=read(role['archivePath'],role['sha256']); req(len(data)==role['bytes'],'archive bytes')
  req(stat.S_IMODE(Path(role['archivePath']).lstat().st_mode)==0o600,'archive mode')
  name=Path(role['sourcePath']).name; originals[name]=data
  if name!='BINDING-DRAFT.json': req(read(role['sourcePath'])==data,'other original '+name)
 old=json.loads(originals['BINDING-DRAFT.json']); auth={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
 delta={k for k in set(old)|set(binding) if old.get(k)!=binding.get(k)}
 req(delta==auth,'five field delta');req(binding['status']=='REVIEWED_FILLED_UNRUN' and binding['executionAuthorization'] is True,'adopted flags')
 review=obj(binding['exactBindingReviewPath'],binding['exactBindingReviewSha256']);req(review['decision']=='ACCEPT_EXACT_FILLED_UNRUN','exact decision')
 def semantic(exclude):return digest(json.dumps({k:v for k,v in binding.items() if k not in exclude},sort_keys=True,separators=(',',':')).encode())
 req(semantic(auth)=='4cfdbc36dae7fab7dc0687b48f3c7d84abc94b8ac0aca146273306d96bd261e4','full semantic')
 req(semantic(auth|{'preflightReviewPath','preflightReviewSha256'})=='d347b8e8504161c394d1338444919844871f80099b635538d8078ca3fc4a6020','core')
 launch=obj(P/'ADOPTED-LAUNCH-SPEC.json','e58ea56079b2dfc48bfb321ed9452e3ea5e373ae6a7a153768c77a9c8959ef79'); originalLaunch=json.loads(originals['LAUNCH-SPEC.json'])
 for k in ('argv','cwd','environment','bindingSemanticSha256','guardCoreSha256','helperSha256','bindingPath','unexpectedHelperWait'):req(launch[k]==originalLaunch[k],'launch semantic '+k)
 req(launch['bindingSha256']==facts['roles'][str(C/'BINDING-DRAFT.json')]['sha256'],'launch raw')
 req(launch['argv'][4:]==[binding['pythonPath'],'-I','-B',binding['supervisorPath'],str(C/'BINDING-DRAFT.json')],'exact route argv')
 read(launch['argv'][1],launch['helperSha256'])
 for k in ('materializer','recorder','supervisor'):read(binding[k+'Path'],binding[k+'Sha256'])
 for k in ('materializerSourceReview','routeSourceReview','materializerArgvRole','parentScopeAdoption','preflightReview'):obj(binding[k+'Path'],binding[k+'Sha256'])
 facts['sourcePackageFileCounts']=[package(Path(binding['materializerPath']).parent/'SOURCE-PINS.json','c08d9acd5eaddd721aa7867a109c62eb6081cad0ffa182ba95fbd2d66c6873b6'),package(Path(binding['recorderPath']).parent/'SOURCE-PINS.json','a37f4ffc9d315f0a621e9544776d7917d294f927adc1c1adfcf998700cc526c4')]
 read(S/'1370-c0-aging-era-sparse-materializer-source-r6/materialize.py','2d63876297bc85a1ab5192491f4255d2cce7d17de048bfec65c21b479d1f0896')
 manifest=obj(binding['materializerArgv'][9],binding['m0SourceManifestSha256'])
 read(binding['materializerArgv'][13],binding['m0ObserverSourceReviewSha256'])
 for role,expected in zip(manifest['files'],binding['expectedOverlayFiles']):
  req(all(role[k]==expected[k] for k in ('bytes','destination','sha256')),'overlay contract');req(len(read(role['source'],role['sha256']))==role['bytes'],'overlay bytes')
 read(S/'1370-c0-m0-operational-full-guard-independent-observed-review-20261009-r1/RECEIPT.json','fe5073d75831162fb0de0ee702a38ed92e795c2f269c7621982bda2b97324fcf')
 read(S/'1370-c0-m0-full-guard-parent-recorded-20261009-r1/AFTER-FILL-SCOPE-CLARIFICATION.json','93a585e81b1393c78740d68020ec47eba7ba37d1274f57abeb3a61c72e0353fe')
 read(P/'grant_and_launch.py')
 roots()
 for p,role in binding['toolRoles'].items():
  read(p,role['sha256'],role['identity'][3]); st=Path(p).lstat();req([st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink]==role['identity'],'tool identity '+p)
 def git(root,args):return run(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','-C',root]+args)
 req(git(R,['rev-parse','HEAD']).decode().strip()==binding['productionHead'],'production HEAD')
 req(git(R,['rev-parse','HEAD:src']).decode().strip()==binding['productionSourceTree'],'production src')
 req(not git(R,['status','--porcelain=v1','-z','--untracked-files=all']),'production clean')
 ref='refs/heads/wip/headless-program-20260916-ts'
 req(git(R,['ls-remote','--exit-code','origin',ref]).decode()==binding['productionHead']+'\t'+ref+'\n','live remote')
 private=str(S/'1370-c0-aging-era-sparse-materialized-r6-20261008-r1')
 req(git(private,['rev-parse','HEAD']).decode().strip()=='3aaf55e0c06c4b745b0b722cc56913050b1ee229','private HEAD')
 req(git(private,['rev-parse','HEAD:src']).decode().strip()=='b47ac0ba2785c9619209696cba2c883860d62894','private src')
 req(not git(private,['status','--porcelain=v1','-z','--untracked-files=all']),'private clean')
 req(run(['/usr/sbin/sysctl','-n','kern.bootsessionuuid']).decode().strip()==binding['bootSessionUuid'],'boot')
 req(b'AC Power' in run(['/usr/bin/pmset','-g','batt']),'AC')
 facts['freeBytes']=shutil.disk_usage(S).free; req(facts['freeBytes']>=binding['bounds']['preflightFreeBytes'],'free floor')
 groups=[85073,80407,6563,3779,18930,18939,18940,18944,18947,18948,18950,18952,18954,18956,18957,18958,18959,18961,18968,18972,96706,98020]
 facts['ownedGroupsAbsent']=[]
 for pgid in groups:
  try:os.killpg(pgid,0)
  except ProcessLookupError:facts['ownedGroupsAbsent'].append(pgid)
  else:raise AssertionError('owned group present '+str(pgid))
 ps=run(['/bin/ps','-axo','pid=,ppid=,pgid=,lstart=,state=,comm=,args='],'ps.raw')
 markers=[b'fixture_worker.py',b'vitest',b'/bin/tsc',b'/lib/tsc.js',b'witness.mts',b'outer-recorder.py',b'/1370-c0-aging-era-employment-witness-source-',b'/1370-c0-m0-operational-materializer-proposal-',b'/1370-c0-m0-recorded-materialization-route-proposal-']
 req(not any(m in ps for m in markers),'active worker marker')
 oldPids={25951,29271,21697};actualPids={int(line.split()[0]) for line in ps.splitlines() if line.split()};req(not(oldPids&actualPids),'historical parent/scanner present')
 raw=run(['/usr/sbin/lsof','-n','-P','-w','-F0pftan'],'fd.raw')
 scopes={binding['productionRoot'],binding['commonGitRoot']}
 for pair in binding['additionalFdScopes']: scopes.update(pair.values())
 pid=fd=access=None; count=0; numeric=0
 for field in raw.split(b'\0'):
  field=field.lstrip(b'\n')
  if not field:continue
  kind,value=field[:1],field[1:]
  if kind==b'p':pid=value.decode('ascii','strict');fd=access=None
  elif kind==b'f':fd=value.decode('ascii','strict');access=None
  elif kind==b'a':access=value.decode('ascii','strict')
  elif kind==b'n' and fd:
   name=value.decode('utf-8','surrogateescape')
   if any(name==scope or name.startswith(scope+os.sep) for scope in scopes):
    count+=1
    if fd[:1].isdigit():numeric+=1;req(access in ('r','w','u'),'unknown protected access')
    req(access not in ('w','u'),'protected writable descriptor')
 facts['protectedFdCheck']={'scopes':sorted(scopes),'matchedEntries':count,'numericEntries':numeric,'writeAccessEntries':0,'unknownNumericAccessEntries':0}
 absent=[binding[k] for k in ('scratchRoot','mirrorPath','materializeReceiptPath','outputRoot','recorderLockPath')]+[str(Path(launch['argv'][3]).parent),launch['argv'][3],launch['argv'][3]+'.meta',str(S/'HEAVY-LANE-LOCK')]
 for p in absent:req(not os.path.lexists(p),'runtime path occupied '+p)
 facts['absentRuntimePaths']=absent; roots()
 read(C/'BINDING-DRAFT.json',launch['bindingSha256']);read(P/'ADOPTED-LAUNCH-SPEC.json','e58ea56079b2dfc48bfb321ed9452e3ea5e373ae6a7a153768c77a9c8959ef79')
 facts.update(status='ACCEPT_CURRENT_BOUNDED_READONLY',bindingSemanticSha256=semantic(auth),guardCoreSha256=semantic(auth|{'preflightReviewPath','preflightReviewSha256'}),bindingSha256=launch['bindingSha256'],archiveFilesVerified=6,otherOriginalFilesVerified=5,changedBindingFields=sorted(delta),argv=launch['argv'],cwd=launch['cwd'],environment=launch['environment'],fullBaselineReuseUnderParentMaintainedFreeze=True,fullPostflightRequired=True)
except Exception as e:
 facts.update(status='STOP',error=type(e).__name__+': '+str(e))
facts['finishedUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat();facts['elapsedSeconds']=time.monotonic()-started
payload=(json.dumps(facts,indent=2,sort_keys=True)+'\n').encode();write(HERE/'CURRENT-FACTS.json',payload)
print(json.dumps({'status':facts['status'],'error':facts.get('error'),'factsSha256':digest(payload),'elapsedSeconds':facts['elapsedSeconds'],'freeBytes':facts.get('freeBytes'),'ownedGroupsAbsent':facts.get('ownedGroupsAbsent')}))
raise SystemExit(0 if facts['status'].startswith('ACCEPT') else 2)
