#!/usr/bin/env python3
"""UNRUN proposal: H full-era dependency, types and diagnostic collection only."""
import argparse, hashlib, json, os, pathlib, re, shutil, signal, stat, subprocess, sys, time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
OUT_ROOT=S/'1370-c0-h-typecheck-collection-results-r5'
MIRROR_ROOT=S/'1370-c0-h-m0-observer-mirrors-r2'
HEAD='f8c0628739227accfa446276b0613f47bc805a78'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REF='refs/heads/wip/headless-program-20260916-ts'
H_COMMIT='8708d6a98e6eb4ad53e3a54e431c4b40b974f79d'
H_TREE='0ee21d8179977aaa0726ffb5d1b2bb2568c9df97'
MANIFEST_SHA='e2f92aa60063b754f110ec31f08080bfd461f6a150f74394464739c2d4cab7ff'
REVIEW_SHA='5e6f23884af9527f991665020414404455f182cc3a62abe5a5602bb019804dbf'
LOCK_SHA='728ee1693d3d4f33d04fc731264e442cb5f00e922fb36943aee9db9bf2e7c5de'
OBSERVED_MIRROR_DIGEST='55fd1afb4437386867cdb23c5daf137e9613d41e51f31dafc619bedf37bc59a4'
DEPS_CHECK_SHA='e61f6a88614eac49fcec3f326c162e4d44d75ea2999b6751581e30e7685b6a64'
NODE='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node'
WALL=300
FLOOR=3*1024**3
PREFLIGHT=int(3.5*1024**3)
START=time.monotonic()
CURRENT=None
def stop_current():
 global CURRENT
 proc=CURRENT;CURRENT=None
 if proc is None:return
 try:os.killpg(proc.pid,signal.SIGTERM)
 except ProcessLookupError:pass
 try:proc.wait(timeout=2)
 except subprocess.TimeoutExpired:pass
 try:os.killpg(proc.pid,signal.SIGKILL)
 except ProcessLookupError:pass
 try:proc.wait(timeout=2)
 except subprocess.TimeoutExpired:raise RuntimeError('active child survived cleanup')
 try:os.killpg(proc.pid,0)
 except ProcessLookupError:pass
 else:raise RuntimeError('active child process group survived cleanup')
def on_signal(signum,_frame):
 stop_current()
 raise InterruptedError('runner interrupted by signal '+str(signum))

def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def remaining():
 n=WALL-(time.monotonic()-START)
 need(n>0,'300-second child deadline')
 return n
def read_pin(path,expected,cap=1<<20):
 need(path.is_absolute() and path.is_file() and not path.is_symlink(),'missing/unsafe pinned file '+str(path))
 need(path.stat().st_size<=cap,'oversized pinned file '+str(path))
 raw=path.read_bytes();need(sha(raw)==expected,'pin drift '+str(path));return raw
def cmd(argv,cwd=REPO):
 p=subprocess.run(argv,cwd=cwd,capture_output=True,text=True,timeout=min(15,remaining()))
 need(p.returncode==0,'guard command failed: '+repr(argv)+' '+p.stderr[-500:])
 return p.stdout.strip()
def guard(run_id):
 remaining()
 lane=S/'HEAVY-LANE-LOCK'
 need(lane.is_file() and not lane.is_symlink() and f'c0-h-types-{run_id}.lane.log' in lane.read_text(),'wrong heavy lane')
 need(cmd(['pmset','-g','batt']).splitlines()[:1]==["Now drawing from 'AC Power'"],'AC power')
 need(shutil.disk_usage(S).free>=FLOOR,'3 GiB disk floor')
 need(cmd(['git','rev-parse','HEAD'])==HEAD and cmd(['git','rev-parse','HEAD:src'])==TREE and
      cmd(['git','status','--porcelain=v1'])=='','production source drift')
 need(cmd(['git','ls-remote','origin',REF])==HEAD+'\t'+REF,'remote production drift')
def walk_meta(root):
 """Read every regular dependency file, with exact before/after stat and a 512 MiB cap."""
 need(root.is_dir() and not root.is_symlink(),'dependency root drift')
 digest=hashlib.sha256();count=0;content_bytes=0
 for base,dirs,files in os.walk(root,topdown=True,followlinks=False):
  remaining()
  dirs.sort();files.sort()
  for name in dirs+files:
   remaining()
   p=pathlib.Path(base)/name;st=p.lstat();rel=p.relative_to(root).as_posix()
   need('\n' not in rel and '\0' not in rel,'unsafe dependency path')
   extra=os.readlink(p) if stat.S_ISLNK(st.st_mode) else ''
   file_hash=None
   if stat.S_ISREG(st.st_mode):
    need(st.st_size>=0 and content_bytes+st.st_size<=512*1024**2,'dependency content audit cap')
    fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
    try:
     before=os.fstat(fd)
     need((before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns,before.st_ctime_ns)==
          (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns),'dependency read race before')
     h=hashlib.sha256();size=0
     while True:
      remaining()
      chunk=os.read(fd,1<<20)
      if not chunk:break
      h.update(chunk);size+=len(chunk)
      need(size<=st.st_size,'dependency grew during audit')
     after=os.fstat(fd);path_after=p.lstat()
     fields=lambda v:(v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns)
     need(size==st.st_size and fields(after)==fields(st)==fields(path_after),'dependency read race after/path replacement')
     file_hash=h.hexdigest();content_bytes+=size
    finally:os.close(fd)
   elif not (stat.S_ISDIR(st.st_mode) or stat.S_ISLNK(st.st_mode)):
    raise RuntimeError('special dependency entry '+rel)
   line=json.dumps([rel,st.st_mode,st.st_dev,st.st_ino,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns,extra,file_hash],separators=(',',':'))
   digest.update(line.encode()+b'\n');count+=1
   need(count<=500000,'dependency audit entry cap')
 return {'entries':count,'contentBytes':content_bytes,'contentAndMetadataSha256':digest.hexdigest(),
         'rootDevice':root.stat().st_dev,'rootInode':root.stat().st_ino}
def git_source_sha(path):return sha(subprocess.check_output(['git','show',H_COMMIT+':'+path],cwd=REPO,timeout=min(15,remaining())))
def full_source_check(mirror,manifest,allow_deps_link=False):
 """Rebuild the independent H 1,344-file Git/overlay byte and mode proof."""
 paths=['src','tests','ui','package.json','package-lock.json','tsconfig.json','tsconfig.src.json','vitest.config.ts','vitest.workspace.ts']
 proc=subprocess.run(['git','ls-tree','-rl','-z',H_COMMIT,*paths],cwd=REPO,capture_output=True,timeout=min(15,remaining()))
 need(proc.returncode==0,'H Git roster failure')
 base={}
 for rec in proc.stdout.split(b'\0'):
  if not rec:continue
  header,name=rec.split(b'\t',1);mode,kind,oid,size=header.decode().split();rel=name.decode()
  need(kind=='blob' and mode in ('100644','100755') and rel not in base,'H Git roster entry')
  base[rel]=(mode,oid,int(size))
 need(len(base)==1342 and sum(v[2] for v in base.values())==98114949,'H Git roster count/bytes')
 overlays={r['destination']:r for r in manifest['files']}
 need(len(overlays)==4,'H overlay roster')
 expected=set(base)|set(overlays);need(len(expected)==1344,'H mirror expected count')
 actual=set();digest=hashlib.sha256();total=0;deps_link=None
 need(mirror.is_dir() and not mirror.is_symlink(),'unsafe mirror root')
 for root,dirs,files in os.walk(mirror,topdown=True,followlinks=False):
  remaining();dirs.sort();files.sort()
  for name in dirs+files:
   remaining();path=pathlib.Path(root)/name;rel=path.relative_to(mirror).as_posix();st=path.lstat()
   if rel=='node_modules':
    need(allow_deps_link and stat.S_ISLNK(st.st_mode) and os.readlink(path)==str(REPO/'node_modules'),
         'unexpected dependency link')
    deps_link=(st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns,os.readlink(path))
    continue
   if name in dirs:
    need(stat.S_ISDIR(st.st_mode) and any(e.startswith(rel+'/') for e in expected),'extra/non-directory mirror path '+rel)
    continue
   need(rel in expected and rel not in actual,'extra/duplicate mirror file '+rel)
   need(stat.S_ISREG(st.st_mode) and st.st_nlink==1,'unsafe mirror file '+rel)
   mode,oid,size=base.get(rel,('100644',None,overlays[rel]['bytes'])) if rel in overlays else base[rel]
   if rel in overlays:size=overlays[rel]['bytes']
   need(st.st_size==size,'mirror file size '+rel)
   fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
   try:
    fields=lambda v:(v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns)
    need(fields(os.fstat(fd))==fields(st),'mirror open drift '+rel)
    blob=hashlib.sha1();blob.update(f'blob {size}\0'.encode());content=hashlib.sha256();count=0
    while True:
     remaining();chunk=os.read(fd,1<<20)
     if not chunk:break
     count+=len(chunk);need(count<=size,'mirror file grew '+rel)
     blob.update(chunk);content.update(chunk)
    need(count==size and fields(os.fstat(fd))==fields(st)==fields(path.lstat()),'mirror file read drift '+rel)
   finally:os.close(fd)
   got_oid=blob.hexdigest();got_sha=content.hexdigest();got_mode=stat.S_IMODE(st.st_mode)
   need(got_mode==(0o644 if rel in overlays else (0o755 if mode=='100755' else 0o644)),'mirror mode '+rel)
   if rel in overlays:need(got_sha==overlays[rel]['sha256'],'overlay SHA '+rel)
   else:need(got_oid==oid,'Git blob OID '+rel)
   digest.update(json.dumps([rel,size,got_oid,got_sha,got_mode],separators=(',',':')).encode()+b'\n')
   actual.add(rel);total+=size
 need(actual==expected and len(actual)==1344 and total==98158847,'mirror roster/count/bytes')
 need(digest.hexdigest()==OBSERVED_MIRROR_DIGEST,'mirror full-content digest drift')
 need((deps_link is not None)==allow_deps_link,'dependency link presence')
 return {'fileProofDigestSha256':digest.hexdigest(),'mirrorFiles':len(actual),'mirrorBytes':total,'dependencyLink':deps_link}

def run_child(name,argv,mirror,out,run_id):
 global CURRENT
 guard(run_id);remaining()
 stdout=out/(name+'.stdout');stderr=out/(name+'.stderr')
 need(not stdout.exists() and not stderr.exists(),'child output collision')
 started=time.monotonic()
 with stdout.open('xb') as so,stderr.open('xb') as se:
  blocked={signal.SIGTERM,signal.SIGINT}
  oldmask=signal.pthread_sigmask(signal.SIG_BLOCK,blocked)
  try:
   proc=subprocess.Popen(argv,cwd=mirror,stdin=subprocess.DEVNULL,stdout=so,stderr=se,start_new_session=True,
                         preexec_fn=lambda:signal.pthread_sigmask(signal.SIG_UNBLOCK,blocked),
                         env={**os.environ,'PATH':str(pathlib.Path(NODE).parent)+':/usr/local/bin:/usr/bin:/bin','HOME':str(out),'TMPDIR':str(out),'VITEST_CACHE_DIR':str(out/'vitest-cache')})
   CURRENT=proc
  finally:signal.pthread_sigmask(signal.SIG_SETMASK,oldmask)
  try:
   while proc.poll() is None:
    try:proc.wait(timeout=min(10,remaining()))
    except subprocess.TimeoutExpired:guard(run_id)
   guard(run_id)
   need(proc.returncode==0,name+' child exit '+str(proc.returncode))
   try:os.killpg(proc.pid,0)
   except ProcessLookupError:pass
   else:raise RuntimeError(name+' process group survivor')
  except BaseException:
   stop_current()
   raise
  finally:CURRENT=None
 return {'name':name,'argv':argv,'exit':proc.returncode,'seconds':round(time.monotonic()-started,3),
         'stdoutSha256':sha(stdout.read_bytes()),'stderrSha256':sha(stderr.read_bytes())}

def main():
 signal.signal(signal.SIGTERM,on_signal);signal.signal(signal.SIGINT,on_signal)
 ap=argparse.ArgumentParser()
 ap.add_argument('--binding',required=True);ap.add_argument('--binding-sha',required=True)
 args=ap.parse_args();need(re.fullmatch('[0-9a-f]{64}',args.binding_sha),'binding SHA')
 binding=json.loads(read_pin(pathlib.Path(args.binding),args.binding_sha,100000))
 run_id=binding.get('runId');need(isinstance(run_id,str) and re.fullmatch('20261008-h-types-r[0-9]+',run_id),'run ID')
 need(binding.get('status')=='FILLED_INDEPENDENT_REVIEW_REQUIRED' and binding.get('arm')=='H','unfilled binding')
 mirror=MIRROR_ROOT/binding['mirrorRunId'];result_path=MIRROR_ROOT/(binding['mirrorRunId']+'.MATERIALIZE-RESULT.json')
 need(binding['mirrorRunId']=='20261008-h-types-r1' and str(mirror)==binding.get('mirrorPath') and
      str(result_path)==binding.get('materializerResultPath'),'mirror binding mismatch')
 manifest_path=S/'1370-c0-h-m0-corrected-overlay-source-manifest-r2/H-SOURCE-MANIFEST.json'
 review_path=S/'1370-c0-h-m0-corrected-overlay-source-manifest-independent-review-r2/H-RECEIPT.json'
 manifest=json.loads(read_pin(manifest_path,MANIFEST_SHA));review=json.loads(read_pin(review_path,REVIEW_SHA))
 need(review.get('decision')=='ACCEPT_STATIC_FULL_ERA_OBSERVER_ONLY' and review.get('sourceManifestSha256')==MANIFEST_SHA,'source review')
 need(manifest.get('arm')=='H' and manifest.get('sourceCommit')==H_COMMIT and manifest.get('sourceTree')==H_TREE,'source role')
 result=json.loads(read_pin(result_path,binding['materializerResultSha256'],100000))
 need(result.get('status')=='MIRROR_MATERIALIZED_SOURCE_ONLY' and result.get('arm')=='H' and
      result.get('runId')==binding['mirrorRunId'] and result.get('sourceCommit')==H_COMMIT and
      result.get('sourceTree')==H_TREE and result.get('mirrorPath')==str(mirror) and
      result.get('sourceManifestSha256')==MANIFEST_SHA and result.get('sourceReviewSha256')==REVIEW_SHA and
      len(result.get('overlayFiles',[]))==4,'materializer authority')
 need(mirror.is_dir() and not mirror.is_symlink(),'mirror absent/unsafe')
 need(shutil.disk_usage(S).free>=PREFLIGHT,'3.5 GiB preflight')
 guard(run_id)
 need(not OUT_ROOT.exists() or (OUT_ROOT.is_dir() and not OUT_ROOT.is_symlink()),'unsafe result root')
 out=OUT_ROOT/run_id;need(not out.exists(),'output collision')
 source_before=full_source_check(mirror,manifest,False)
 prod_deps=REPO/'node_modules';need(prod_deps.is_dir() and not prod_deps.is_symlink(),'production deps root')
 dep_before=walk_meta(prod_deps)
 link=mirror/'node_modules';need(not os.path.lexists(link),'mirror dependency link collision')
 OUT_ROOT.mkdir(mode=0o700,exist_ok=True);out.mkdir(mode=0o700)
 record={'schema':'1370-c0-h-typecheck-collection-result-r5','status':'RUNNING','arm':'H','runId':run_id,
         'mirrorRunId':binding['mirrorRunId'],'materializerResultSha256':binding['materializerResultSha256'],
         'sourceManifestSha256':MANIFEST_SHA,'sourceReviewSha256':REVIEW_SHA,'sourceBefore':source_before,
         'nodeModulesBefore':dep_before,'children':[]}
 try:
  os.symlink(prod_deps,link)
  guard(run_id)
  node=NODE;tsc=str(REPO/'node_modules/.bin/tsc');vitest=str(REPO/'node_modules/.bin/vitest')
  dependency_check=str(S/'1370-c0-h-m0-typecheck-collection-route-template-r1/check-deps.mjs')
  read_pin(pathlib.Path(dependency_check),DEPS_CHECK_SHA,100000)
  need(cmd([NODE,'--version'])=='v22.23.2','Node runtime drift')
  record['children'].append(run_child('dependency-versions',[node,dependency_check,str(mirror),str(REPO),LOCK_SHA],mirror,out,run_id))
  record['children'].append(run_child('root-tsc',[tsc,'--noEmit'],mirror,out,run_id))
  record['children'].append(run_child('ui-tsc',[tsc,'-p','ui/tsconfig.json','--noEmit'],mirror,out,run_id))
  collection=out/'collection.json'
  record['children'].append(run_child('diagnostic-collection',[vitest,'list','tests/diagnostic.test.ts','--project','core','--json',str(collection),'--no-cache'],mirror,out,run_id))
  need(collection.is_file() and not collection.is_symlink() and collection.stat().st_size<=1<<20,'collection missing/large')
  raw=collection.read_bytes();parsed=json.loads(raw)
  need('tests/diagnostic.test.ts' in json.dumps(parsed) and len(raw)>10,'diagnostic test not collected')
  record['collectionSha256']=sha(raw)
  need(full_source_check(mirror,manifest,True)['fileProofDigestSha256']==source_before['fileProofDigestSha256'],'source changed during checks')
  guard(run_id)
  record['status']='PASS_FULL_ERA_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY'
 except BaseException as error:
  record['status']='STOP_TYPECHECK_COLLECTION';record['error']=repr(error)
  raise
 finally:
  try:
   record['sourceAfter']=full_source_check(mirror,manifest,True)
   record['nodeModulesAfter']=walk_meta(prod_deps)
   if record['sourceAfter']['fileProofDigestSha256']!=source_before['fileProofDigestSha256'] or record['nodeModulesAfter']!=dep_before:
    record['status']='STOP_POSTFLIGHT_DRIFT'
  except BaseException as post_error:
   record['status']='STOP_POSTFLIGHT_UNVERIFIED';record['postflightError']=repr(post_error)
  record['elapsedSeconds']=round(time.monotonic()-START,3)
  receipt=out/'RESULT.json'
  with receipt.open('x') as f:json.dump(record,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
  print(json.dumps({'status':record['status'],'receipt':str(receipt),'sha256':sha(receipt.read_bytes())}),flush=True)
  need(record['status']=='PASS_FULL_ERA_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY','postflight or child failure')

if __name__=='__main__':
 try:main()
 except BaseException as e:
  print('STOP_TYPECHECK_COLLECTION '+repr(e),file=sys.stderr,flush=True)
  sys.exit(1)
