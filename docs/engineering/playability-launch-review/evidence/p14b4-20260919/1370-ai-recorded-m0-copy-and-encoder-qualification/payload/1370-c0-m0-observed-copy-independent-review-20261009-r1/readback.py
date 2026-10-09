import os,stat,json,hashlib,subprocess,time,datetime
from pathlib import Path,PurePosixPath
S=Path('/Users/zacheryspector/studio-scratch'); R=Path('/Users/zacheryspector/The-Movies-headless-program'); H=Path(__file__).parent
M=S/'1370-c0-m0-observer-mirrors-20261009-r2/20261009-m0-types-r2'; O=S/'1370-c0-m0-recorded-materialization-output-20261009-r2'
facts={'schema':'m0-independent-physical-source-readback/v1','startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'roles':{},'sourceImported':False,'engineExecuted':False,'protectedInventoryRepeated':False,'postflightAcceptancePending':True}
start=time.monotonic();env=dict(os.environ,GIT_OPTIONAL_LOCKS='0',PYTHONDONTWRITEBYTECODE='1')
def req(ok,msg):
 if not ok:raise AssertionError(msg)
def sig(s):return [s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns]
def open_dir(p):
 fd=os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:
  for part in Path(p).parts[1:]:
   nextfd=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd);os.close(fd);fd=nextfd
  return fd
 except BaseException:os.close(fd);raise
def read(p,expected=None,cap=32*1024*1024,git_oid=None,mode=None):
 p=Path(p);parent=open_dir(p.parent)
 try:
  named=os.stat(p.name,dir_fd=parent,follow_symlinks=False)
  req(stat.S_ISREG(named.st_mode) and named.st_nlink==1 and named.st_size<=cap,'unsafe regular input '+str(p))
  if mode is not None:req(stat.S_IMODE(named.st_mode)==mode,'file mode '+str(p))
  fd=os.open(p.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   req(sig(os.fstat(fd))==sig(named),'open identity '+str(p));h=hashlib.sha256();g=hashlib.sha1();g.update(('blob '+str(named.st_size)+'\0').encode());size=0;pieces=[]
   while True:
    b=os.read(fd,1024*1024)
    if not b:break
    size+=len(b);req(size<=cap,'read cap '+str(p));h.update(b);g.update(b)
    if not git_oid:pieces.append(b)
   req(size==named.st_size and sig(os.fstat(fd))==sig(named)==sig(os.stat(p.name,dir_fd=parent,follow_symlinks=False))==sig(p.lstat()),'retained FD/path drift '+str(p))
  finally:os.close(fd)
 finally:os.close(parent)
 digest=h.hexdigest()
 if expected:req(digest==expected,'sha256 '+str(p))
 if git_oid:req(g.hexdigest()==git_oid,'Git blob OID '+str(p))
 row={'bytes':size,'sha256':digest,'gitBlobOid':g.hexdigest(),'identity':sig(named)}
 return (b''.join(pieces) if not git_oid else None),row
def obj(p,h=None):
 b,row=read(p,h);facts['roles'][str(p)]={'path':str(p),**row};return json.loads(b)
def git(*args):
 argv=['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','-C',str(R),*args]
 r=subprocess.run(argv,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=25);req(r.returncode==0 and not r.stderr,'Git read-only command');facts.setdefault('commands',[]).append({'argv':argv,'exit':r.returncode,'stdoutBytes':len(r.stdout),'stdoutSha256':hashlib.sha256(r.stdout).hexdigest()});return r.stdout
def safe(name):
 p=PurePosixPath(name);req(not p.is_absolute() and p.as_posix()==name and '\\' not in name and all(x not in ('','..','.') for x in p.parts),'unsafe roster name');return p
def inventory(root):
 files={};dirs={}
 def visit(p):
  st=p.lstat();req(stat.S_ISDIR(st.st_mode) and stat.S_IMODE(st.st_mode)==0o700,'physical directory mode/type');dirs[str(p.relative_to(root))]=sig(st)
  for child in sorted(p.iterdir()):
   st=child.lstat()
   if stat.S_ISDIR(st.st_mode):visit(child)
   else:req(stat.S_ISREG(st.st_mode) and st.st_nlink==1,'unexpected link/nonregular');files[str(child.relative_to(root))]=sig(st)
 visit(root);return files,dirs
try:
 binding=obj(S/'1370-c0-m0-final-exact-candidate-20261009-r1/BINDING-DRAFT.json','71e2db2dbe2dabfbf9d885002a9096e0e291d0ed315b92129f8098e5ceada78e')
 receipt=obj(M.with_name(M.name+'.MATERIALIZE-RESULT.json'),'f584835a2893a3f9fc8e26df8765423a62096ced49a94d4f09ff1c935401e0f9')
 req(receipt['status']=='MIRROR_MATERIALIZED_SOURCE_ONLY' and receipt['arm']=='M0' and receipt['sourceCommit']==binding['sourceSha'] and receipt['mirrorPath']==str(M) and receipt['runId']==binding['runId'],'sibling receipt identity/status')
 req(facts['roles'][str(M.with_name(M.name+'.MATERIALIZE-RESULT.json'))]['identity'][2]==0o600,'sibling mode')
 result=obj(O/'RESULT.json','3041a1b7bb8b5b820238c708d3ab2d634651fd6019b81544f8a7bf61ddf8eff9');sup=obj(O/'SUPERVISOR.json','2e7160b79225eae23e4fb0983e00c945b4588092f188b36285c3aac859cb281f')
 req(result['status']==sup['status']=='MATERIALIZED_UNREVIEWED_UNRUN' and result['childExit']==sup['workerExit']==0 and result['groupClear'] and sup['workerGroupClear'] and sup['childGroupClear'] and not sup['timedOut'] and result['specSha256']==sup['specSha256']==facts['roles'][str(S/'1370-c0-m0-final-exact-candidate-20261009-r1/BINDING-DRAFT.json')]['sha256'],'actual recorder/supervisor')
 req(result['materializeReceiptSha256']==facts['roles'][str(M.with_name(M.name+'.MATERIALIZE-RESULT.json'))]['sha256'],'sibling linkage')
 manifest=obj(binding['materializerArgv'][9],binding['m0SourceManifestSha256']);inputs=obj(S/'1370-c0-h-m0-observer-verification-design-r2/MIRROR-INPUTS.json','84d89b19ffc40f02c9a908bf8ae3cdbf34e4ff65ce2c1cf63687c140746e1154')
 req(receipt['sourceManifestSha256']==binding['m0SourceManifestSha256'] and receipt['sourceReviewSha256']==binding['m0ObserverSourceReviewSha256'] and receipt['overlayFiles']==binding['expectedOverlayFiles'],'source role linkage')
 commit=receipt['sourceCommit'];arm=inputs['arms']['M0'];req(commit==arm['sourceCommit']==manifest['sourceCommit'] and receipt['sourceTree']==arm['sourceTree']==manifest['sourceTree']==binding['productionSourceTree'],'source commit/tree')
 for tree in ('src','tests','ui'):
  expected=arm['sourceTree' if tree=='src' else tree+'Tree'];req(git('rev-parse',commit+':'+tree).decode().strip()==expected,'historical tree '+tree)
 paths=['src','tests','ui','package.json','package-lock.json','tsconfig.json','tsconfig.src.json','vitest.config.ts','vitest.workspace.ts'];raw=git('ls-tree','-rl','-z',commit,*paths);roster={}
 for line in raw.split(b'\0'):
  if not line:continue
  head,name=line.split(b'\t',1);mode,kind,oid,size=head.decode().split();name=name.decode();safe(name);req(kind=='blob' and mode in ('100644','100755') and name not in roster,'Git roster type/duplicate');roster[name]={'gitMode':mode,'gitBlobOid':oid,'bytes':int(size)}
 req(len(roster)==receipt['sourceFileCount']==1675 and sum(r['bytes'] for r in roster.values())==receipt['sourceBytes']==result['materializerSourceBytes']==117828630,'source count/bytes')
 req(sum(r['bytes'] for k,r in roster.items() if k.startswith(('src/','tests/','ui/')))==arm['selectedSrcTestsUiBlobBytes'],'selected source bytes')
 for name,pin in arm['rootAndFixtureInputs'].items():req(roster[name]['gitBlobOid']==pin['gitBlob'] and roster[name]['bytes']==pin['bytes'],'root/fixture role')
 overlays={r['destination']:r for r in manifest['files']};req(len(overlays)==5,'overlay count')
 expected=set(roster)|set(overlays);files_before,dirs_before=inventory(M);req(set(files_before)==expected,'whole mirror physical file roster')
 actual={};total=0;baseline_verified=0
 for name in sorted(expected):
  if name in overlays:
   pin=overlays[name];b,row=read(M/name,pin['sha256'],cap=1024*1024,mode=0o644);req(row['bytes']==pin['bytes'],'overlay readback bytes');b2,_=read(pin['source'],pin['sha256'],cap=1024*1024);req(b==b2,'overlay source byte equality')
  else:
   pin=roster[name];_,row=read(M/name,git_oid=pin['gitBlobOid'],mode=0o755 if pin['gitMode']=='100755' else 0o644);req(row['bytes']==pin['bytes'],'Git file size');baseline_verified+=1
  req(row['identity']==files_before[name],'physical initial identity');actual[name]=row;total+=row['bytes'];req(total<=binding['bounds']['mirrorBytes'],'mirror cap')
 files_after,dirs_after=inventory(M);req(files_after==files_before and dirs_after==dirs_before,'mirror file/dir identities drift')
 for p in [S/'1370-c0-m0-observer-mirrors-20261009-r2']:
  st=p.lstat();req(stat.S_ISDIR(st.st_mode) and stat.S_IMODE(st.st_mode)==0o700,'mirror parent mode')
 parent_names=sorted(p.name for p in M.parent.iterdir());req(parent_names==[M.name,M.name+'.MATERIALIZE-RESULT.json'],'mirror parent exact children')
 output_files={};outbytes=0
 for p in sorted(O.iterdir()):
  b,row=read(p);outbytes+=row['bytes'];output_files[p.name]=row
 req('SUPERVISOR-OVERRIDE-STOP.json' not in output_files and outbytes<=binding['bounds']['totalNewScratchBytes'],'output override/cap')
 req(output_files['child.stdout']['sha256']==result['stdoutSha256'] and output_files['child.stderr']['sha256']==result['stderrSha256'] and output_files['child.stderr']['bytes']==0,'child streams')
 req(output_files['child.stdout']['bytes']+output_files['child.stderr']['bytes']<=binding['bounds']['combinedChildLogsBytes'],'log cap')
 groups=[10372,10639,10655];clear=[]
 for pgid in groups:
  try:os.killpg(pgid,0)
  except ProcessLookupError:clear.append(pgid)
  else:raise AssertionError('actual group present')
 req(not os.path.lexists(S/'HEAVY-LANE-LOCK') and not os.path.lexists(binding['recorderLockPath']),'locks')
 req(obj(M.with_name(M.name+'.MATERIALIZE-RESULT.json'))==receipt and obj(O/'RESULT.json')==result and obj(O/'SUPERVISOR.json')==sup,'actual output identity/content stability')
 facts.update(status='PHYSICAL_SOURCE_READBACK_PASSED_AWAIT_POSTFLIGHT',sourceCommit=commit,sourceTree=receipt['sourceTree'],sourceRoster=roster,materializedFiles=actual,materializedDirectoryIdentities=dirs_after,preoverlaySourceFileCount=len(roster),preoverlaySourceBytes=receipt['sourceBytes'],actualFileCount=len(actual),actualBytes=total,baselineGitBlobsVerified=baseline_verified,overlaysVerified=5,physicalFileRegularSingleLinkExactModes=True,physicalDirectoriesNoSymlinksMode0700=True,mirrorParentChildren=parent_names,recordedOutputFiles=output_files,recordedOutputBytes=outbytes,freshActualOwnedGroupsAbsent=clear,locksAbsent=True)
except Exception as e:facts.update(status='STOP',error=type(e).__name__+': '+str(e))
facts['finishedUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat();facts['elapsedSeconds']=time.monotonic()-start
raw=(json.dumps(facts,indent=2,sort_keys=True)+'\n').encode();fd=os.open(H/'COPY-READBACK-FACTS.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
print(json.dumps({'status':facts['status'],'error':facts.get('error'),'factsSha256':hashlib.sha256(raw).hexdigest(),'elapsedSeconds':facts['elapsedSeconds'],'actualFileCount':facts.get('actualFileCount'),'actualBytes':facts.get('actualBytes')}))
raise SystemExit(2 if facts['status']=='STOP' else 0)
