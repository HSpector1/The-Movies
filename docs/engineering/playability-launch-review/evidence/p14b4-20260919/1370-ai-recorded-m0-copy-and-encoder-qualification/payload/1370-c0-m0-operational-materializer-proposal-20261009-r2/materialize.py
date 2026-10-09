#!/usr/bin/env python3
"""One-shot, unrun isolated M0 diagnostic mirror materializer; accepted r10 source unchanged."""
import argparse,hashlib,json,os,pathlib,re,shutil,signal,stat,subprocess,tarfile,time

S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
INPUTS=S/'1370-c0-h-m0-observer-verification-design-r2/MIRROR-INPUTS.json'
DESIGN_REVIEW=S/'1370-c0-h-m0-observer-verification-independent-design-review-r2/RECEIPT.json'
OUT_ROOT=S/'1370-c0-m0-observer-mirrors-20261009-r2'
PARENT_ADOPTION=S/'1370-c0-m0-only-diagnostic-parent-adoption-20261009-r1/ADOPTION.json'
PARENT_ADOPTION_SHA='476c4bc1e33aa81ca9557e6942f9efe994a80f9378cf4abba1ae04ccce071017'
M0_SCOPE_REVIEW_SHA='a4591c34f4b6406f20e5e35c0d85cbab74945dc79b1ef79fffbdf8d75b1f1180'
INPUTS_SHA='84d89b19ffc40f02c9a908bf8ae3cdbf34e4ff65ce2c1cf63687c140746e1154'
DESIGN_REVIEW_SHA='d7ec88eeae8c97ed4d7a1eb42d9dfbd3e77ff14f1b2247c1ba5501636cf713f2'
PRODUCTION_HEAD='02d50716fe787eaed425b40f822ce91f4463deba'
PRODUCTION_TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
PRODUCTION_REF='refs/heads/wip/headless-program-20260916-ts'
PREFLIGHT=int(3.5*1024**3)
FLOOR=3*1024**3
MIRROR_CAP=160*1024**2
WALL=900
START=None
DIR_FLAGS=os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW

def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(b):return hashlib.sha256(b).hexdigest()
def remaining():
 n=START+WALL-time.monotonic();need(n>1,'900-second materializer deadline');return n
def free():return shutil.disk_usage(S).free
def guard(run_id):
 remaining()
 lock=S/'HEAVY-LANE-LOCK'
 need(lock.is_file() and not lock.is_symlink() and
      f'c0-mirror-{run_id}.lane.log' in lock.read_text(),'recorded sole heavy lane')
 p=subprocess.run(['pmset','-g','batt'],capture_output=True,text=True,timeout=min(10,remaining()))
 need(p.returncode==0 and p.stdout.splitlines()[:1]==["Now drawing from 'AC Power'"],'AC power')
 need(free()>=FLOOR,'3 GiB floor')
def cmd(*args,run_id):
 guard(run_id)
 p=subprocess.run(args,cwd=REPO,capture_output=True,text=True,timeout=remaining())
 need(p.returncode==0,f'command failure {args!r}: {p.stderr[-1000:]}')
 return p.stdout.strip()
def open_dir(path):
 need(path.is_absolute(),'nonabsolute directory')
 fd=os.open('/',DIR_FLAGS)
 try:
  for part in path.parts[1:]:
   next_fd=os.open(part,DIR_FLAGS,dir_fd=fd);os.close(fd);fd=next_fd
  return fd
 except BaseException:os.close(fd);raise
def attrs(st):return (st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def exact_mode(fd,mode):
 os.fchmod(fd,mode)
 st=os.fstat(fd)
 need(stat.S_ISREG(st.st_mode) and st.st_nlink==1 and stat.S_IMODE(st.st_mode)==mode,
      'output mode/type drift')
def write_all(fd,data):
 view=memoryview(data)
 while view:
  n=os.write(fd,view);need(n>0,'short output write');view=view[n:]
def pinned(path,digest,cap):
 parent=open_dir(path.parent)
 try:
  named=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  need(stat.S_ISREG(named.st_mode) and named.st_nlink==1 and named.st_size<=cap,'unsafe input file')
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   before=os.fstat(fd);need(attrs(before)==attrs(named),'input open drift')
   data=b''
   while part:=os.read(fd,65536):
    data+=part;need(len(data)<=cap,'input cap')
   need(attrs(before)==attrs(os.fstat(fd))==attrs(os.stat(path.name,dir_fd=parent,follow_symlinks=False)),'input changed')
   need(len(data)==named.st_size and sha(data)==digest,'input SHA drift')
   return data
  finally:os.close(fd)
 finally:os.close(parent)
def safe_rel(path):
 need(isinstance(path,str) and not path.startswith('/') and '\\' not in path,'unsafe relative path')
 p=pathlib.PurePosixPath(path)
 need(p.as_posix()==path and all(x not in ('','.','..') for x in p.parts),'path traversal')
 return p
def expected_overlays(arm):
 core=['src/core/talentMarket.ts','src/core/promises.ts','src/core/m0FeasibilityWitness.ts']
 if arm=='M0':core.append('src/core/opportunityPromises.ts')
 return set(core+['tests/diagnostic.test.ts'])
def validate_manifest(m,arm,inputs):
 need(m.get('schema')=='1370-c0-h-m0-corrected-overlay-source-manifest-r1' and
      m.get('classification')=='INDEPENDENT_SOURCE_REVIEW_REQUIRED','wrong source manifest')
 need(m.get('arm')==arm and m.get('sourceCommit')==inputs['arms'][arm]['sourceCommit'] and
      m.get('sourceTree')==inputs['arms'][arm]['sourceTree'],'wrong era source')
 rows=m.get('files');need(isinstance(rows,list) and len(rows)==len(expected_overlays(arm)),'wrong overlay count')
 seen=set()
 for row in rows:
  dest=row.get('destination');safe_rel(dest)
  need(dest in expected_overlays(arm) and dest not in seen,'wrong/colliding overlay destination')
  seen.add(dest)
  path=row.get('source')
  need(isinstance(path,str) and pathlib.Path(path).is_absolute() and
       pathlib.Path(path).is_relative_to(S) and '..' not in pathlib.Path(path).parts,
       'unsafe overlay source')
  need(isinstance(row.get('bytes'),int) and 0<row['bytes']<=1<<20,'wrong overlay size')
  need(re.fullmatch(r'[0-9a-f]{64}',row.get('sha256','')),'missing overlay SHA')
 need(seen==expected_overlays(arm),'missing overlay')
 test=next(r for r in rows if r['destination']=='tests/diagnostic.test.ts')
 entry=m.get('entrypoint')
 need(entry=={'path':'tests/diagnostic.test.ts','sha256':test['sha256']},'wrong test entrypoint')
 need(m.get('fixtureSha256')==inputs['arms'][arm]['rootAndFixtureInputs']['src/harness/p13a/fixtures.ts']['sha256'],
      'fixture drift')
 return rows
def verify_archive_roster(commit,arm,inputs,run_id):
 paths=['src','tests','ui','package.json','package-lock.json','tsconfig.json','tsconfig.src.json','vitest.config.ts','vitest.workspace.ts']
 raw=subprocess.check_output(['git','ls-tree','-rl','-z',commit,*paths],cwd=REPO,timeout=remaining())
 rows={};selected_size=0
 for rec in raw.split(b'\0'):
  if not rec:continue
  head,name=rec.split(b'\t',1);mode,kind,oid,size_text=head.decode().split();name=name.decode()
  safe_rel(name);need(mode in ('100644','100755') and kind=='blob','nonregular Git source')
  need(name not in rows,'duplicate Git source')
  size=int(size_text)
  rows[name]=(mode,oid,size)
  if name.startswith(('src/','tests/','ui/')):selected_size+=size
 need(selected_size==inputs['arms'][arm]['selectedSrcTestsUiBlobBytes'],'selected tree byte drift')
 for tree in ('src','tests','ui'):
  need(cmd('git','rev-parse',f'{commit}:{tree}',run_id=run_id)==
       inputs['arms'][arm]['sourceTree' if tree=='src' else tree+'Tree'],'tree OID drift')
 for path,pin in inputs['arms'][arm]['rootAndFixtureInputs'].items():
  need(path in rows and rows[path][1]==pin['gitBlob'] and rows[path][2]==pin['bytes'],
       f'root/fixture OID drift {path}')
 need(sum(v[2] for v in rows.values())<=MIRROR_CAP,'160 MiB mirror source cap')
 return paths,rows
def write_archive(commit,paths,expected,out,run_id):
 proc=subprocess.Popen(['git','archive','--format=tar',commit,*paths],cwd=REPO,
                       stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 seen=set();total=0
 try:
  with tarfile.open(fileobj=proc.stdout,mode='r|') as archive:
   for member in archive:
    guard(run_id);rel=safe_rel(member.name.rstrip('/'))
    dest=out.joinpath(*rel.parts)
    need(dest.is_relative_to(out),'archive escape')
    if member.isdir():
     dest.mkdir(mode=0o700,parents=True,exist_ok=True)
     need(stat.S_ISDIR(dest.lstat().st_mode),'unsafe archive directory')
     continue
    need(member.isfile() and member.name in expected and member.name not in seen,
         'unexpected/duplicate/nonregular tar member')
    mode,oid,size=expected[member.name]
    need(member.size==size,'tar member size drift')
    dest.parent.mkdir(mode=0o700,parents=True,exist_ok=True)
    parent=open_dir(dest.parent)
    try:
     fd=os.open(dest.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,
                0o755 if mode=='100755' else 0o644,dir_fd=parent)
     try:
      source=archive.extractfile(member);need(source is not None,'unreadable tar member')
      h=hashlib.sha1();h.update(f'blob {size}\0'.encode());count=0
      while chunk:=source.read(1<<20):
       count+=len(chunk);total+=len(chunk)
       need(count<=size and total<=MIRROR_CAP,'mirror size cap')
       write_all(fd,chunk);h.update(chunk);guard(run_id)
      need(count==size and h.hexdigest()==oid,'Git blob byte mismatch')
      need(os.fstat(fd).st_size==size,'mirror output size mismatch')
      exact_mode(fd,0o755 if mode=='100755' else 0o644)
      os.fsync(fd)
     finally:os.close(fd)
    finally:os.close(parent)
    seen.add(member.name)
  error=proc.stderr.read().decode(errors='replace')[-1000:]
  need(proc.wait(timeout=remaining())==0,f'git archive failed: {error}')
  need(seen==set(expected),'archive roster incomplete')
  return total
 except BaseException:
  proc.kill();proc.wait();raise
def apply_overlay(rows,out,run_id):
 result=[]
 for row in rows:
  guard(run_id)
  source=pathlib.Path(row['source']);raw=pinned(source,row['sha256'],1<<20)
  need(len(raw)==row['bytes'],'overlay size drift')
  dest=out.joinpath(*safe_rel(row['destination']).parts)
  dest.parent.mkdir(mode=0o700,parents=True,exist_ok=True)
  need(not os.path.lexists(dest) or
       (stat.S_ISREG(dest.lstat().st_mode) and dest.lstat().st_nlink==1),'overlay target unsafe')
  temp=dest.with_name(dest.name+'.overlay-tmp')
  parent=open_dir(dest.parent)
  try:
   fd=os.open(temp.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o644,dir_fd=parent)
   try:write_all(fd,raw);exact_mode(fd,0o644);os.fsync(fd)
   finally:os.close(fd)
   os.replace(temp.name,dest.name,src_dir_fd=parent,dst_dir_fd=parent)
   os.fsync(parent)
  finally:os.close(parent)
  need(sha(pinned(dest,row['sha256'],1<<20))==row['sha256'],'overlay postwrite drift')
  result.append({'destination':row['destination'],'sha256':row['sha256'],'bytes':row['bytes']})
 return result
def main():
 global START
 START=time.monotonic()
 signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('900-second materializer deadline')))
 signal.setitimer(signal.ITIMER_REAL,WALL)
 ap=argparse.ArgumentParser()
 ap.add_argument('--arm',choices=['M0'],required=True)
 ap.add_argument('--run-id',required=True)
 ap.add_argument('--source-manifest',required=True)
 ap.add_argument('--source-manifest-sha',required=True)
 ap.add_argument('--source-review',required=True)
 ap.add_argument('--source-review-sha',required=True)
 args=ap.parse_args();arm=args.arm;run_id=args.run_id
 need(re.fullmatch(r'20261009-m0-(types|route)-r[0-9]+',run_id) and
      run_id.split('-')[1]==arm.lower(),'wrong run ID')
 need(free()>=PREFLIGHT,'3.5 GiB preflight')
 guard(run_id)
 inputs=json.loads(pinned(INPUTS,INPUTS_SHA,100000))
 review=json.loads(pinned(DESIGN_REVIEW,DESIGN_REVIEW_SHA,100000))
 need(review.get('decision')=='ACCEPT_DESIGN_ONLY' and review.get('inputsSha256')==INPUTS_SHA,
      'design review not bound')
 need(inputs.get('schema')=='1370-c0-h-m0-observer-verification-inputs-design-r2','wrong inputs')
 adoption=json.loads(pinned(PARENT_ADOPTION,PARENT_ADOPTION_SHA,100000))
 need(adoption.get('status')=='PARENT_ADOPTED_ISOLATED_M0_DIAGNOSTIC_DESIGN_ONLY' and
      adoption.get('sourceReviewSha256')==M0_SCOPE_REVIEW_SHA and
      adoption.get('productionGuardHead')==PRODUCTION_HEAD and
      adoption.get('productionSourceTree')==PRODUCTION_TREE and
      adoption.get('canonicalM0Source')==inputs['arms']['M0']['sourceCommit'] and
      adoption.get('combinedHFirstRouteUnchanged') is True and
      adoption.get('H8708Waived') is False and
      adoption.get('executionAuthorization') is False and
      adoption.get('productionSourceChangesAuthorized') is False,
      'isolated M0 parent design scope not bound')
 for key in ('source-manifest-sha','source-review-sha'):
  need(re.fullmatch(r'[0-9a-f]{64}',getattr(args,key.replace('-','_'))),'missing source hash')
 mpath=pathlib.Path(args.source_manifest);rpath=pathlib.Path(args.source_review)
 need(mpath.is_absolute() and rpath.is_absolute() and mpath.is_relative_to(S) and rpath.is_relative_to(S),
      'source/review outside scratch')
 manifest=json.loads(pinned(mpath,args.source_manifest_sha,100000))
 rows=validate_manifest(manifest,arm,inputs)
 source_review=json.loads(pinned(rpath,args.source_review_sha,100000))
 need(source_review.get('decision')=='ACCEPT_STATIC_FULL_ERA_OBSERVER_ONLY' and
      source_review.get('sourceManifestSha256')==args.source_manifest_sha and
      source_review.get('arm')==arm,'corrected source not independently accepted')
 need(cmd('git','rev-parse','HEAD',run_id=run_id)==PRODUCTION_HEAD and
      cmd('git','rev-parse','HEAD:src',run_id=run_id)==PRODUCTION_TREE and
      cmd('git','status','--porcelain=v1',run_id=run_id)=='','production checkout drift')
 need(cmd('git','ls-remote','origin',PRODUCTION_REF,run_id=run_id)==
      PRODUCTION_HEAD+'\t'+PRODUCTION_REF,'remote production drift')
 commit=inputs['arms'][arm]['sourceCommit']
 paths,expected=verify_archive_roster(commit,arm,inputs,run_id)
 if not os.path.lexists(OUT_ROOT):OUT_ROOT.mkdir(mode=0o700)
 need(stat.S_ISDIR(OUT_ROOT.lstat().st_mode),'unsafe mirror root')
 out=OUT_ROOT/run_id
 receipt=OUT_ROOT/(run_id+'.MATERIALIZE-RESULT.json')
 need(not os.path.lexists(out) and not os.path.lexists(receipt) and
      not any(p.is_dir() for p in OUT_ROOT.iterdir()),
      'output collision/concurrent mirror')
 out.mkdir(mode=0o700)
 result={'schema':'1370-c0-m0-isolated-operational-materializer-result-r1','status':'RUNNING',
         'arm':arm,'runId':run_id,'sourceCommit':commit,'sourceTree':inputs['arms'][arm]['sourceTree'],
         'mirrorPath':str(out),'sourceManifestSha256':args.source_manifest_sha,
         'sourceReviewSha256':args.source_review_sha}
 try:
  total=write_archive(commit,paths,expected,out,run_id)
  overlays=apply_overlay(rows,out,run_id)
  need(cmd('git','rev-parse','HEAD',run_id=run_id)==PRODUCTION_HEAD and
       cmd('git','rev-parse','HEAD:src',run_id=run_id)==PRODUCTION_TREE and
       cmd('git','status','--porcelain=v1',run_id=run_id)=='','production postflight drift')
  guard(run_id)
  result.update(status='MIRROR_MATERIALIZED_SOURCE_ONLY',sourceFileCount=len(expected),
                sourceBytes=total,overlayFiles=overlays,elapsedSeconds=round(time.monotonic()-START,3))
 except BaseException as error:
  result.update(status='STOP_PARTIAL_MIRROR',error=repr(error))
  raise
 finally:
  parent=open_dir(OUT_ROOT)
  try:
   fd=os.open(receipt.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
   try:
    with os.fdopen(fd,'w',closefd=False) as f:
     json.dump(result,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(fd)
   finally:os.close(fd)
   os.fsync(parent)
  finally:os.close(parent)
 signal.setitimer(signal.ITIMER_REAL,0)
 print(json.dumps({'status':result['status'],'runId':run_id,'receiptSha256':sha(receipt.read_bytes())}))
if __name__=='__main__':main()
