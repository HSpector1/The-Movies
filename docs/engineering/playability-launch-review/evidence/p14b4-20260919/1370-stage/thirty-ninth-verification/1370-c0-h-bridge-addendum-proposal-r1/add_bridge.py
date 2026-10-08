#!/usr/bin/env python3
"""UNRUN one-shot H bridge source addendum. Requires independent static-review SHA."""
import argparse,hashlib,json,os,pathlib,shutil,signal,stat,subprocess,sys,tarfile,time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
MIRROR=S/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1'
OUT=S/'1370-c0-h-bridge-addendum-results-r1/20261008-h-bridge-addendum-r1.RESULT.json'
INPUTS=S/'1370-c0-h-bridge-addendum-proposal-r1/BRIDGE-INPUTS.json'
INPUTS_SHA='2598b0c372eed48d9be04192eb7e33aa52e398a9323d4e2155c176e4cce5efaa'
H='8708d6a98e6eb4ad53e3a54e431c4b40b974f79d'
HEAD=None # filled exact launch pins published documentation checkpoint HEAD
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REF='refs/heads/wip/headless-program-20260916-ts'
LANE_LOG='c0-h-bridge-addendum-20261008-r1.lane.log'
WALL=180
START=time.monotonic()
PRE=3758096384
FLOOR=3221225472

def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def remaining():
 n=WALL-(time.monotonic()-START);need(n>1,'180-second addendum deadline');return n
def sha(raw):return hashlib.sha256(raw).hexdigest()
def read_pin(path,pin,cap):
 need(path.is_absolute() and path.is_file() and not path.is_symlink(),'missing pinned file '+str(path))
 before=path.lstat();need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap,'unsafe pinned file '+str(path))
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  chunks=[]
  while part:=os.read(fd,65536):remaining();chunks.append(part)
  raw=b''.join(chunks);after=os.fstat(fd);path_after=path.lstat()
  fields=lambda x:(x.st_dev,x.st_ino,x.st_mode,x.st_nlink,x.st_size,x.st_mtime_ns,x.st_ctime_ns)
  need(fields(before)==fields(after)==fields(path_after) and len(raw)==before.st_size,'pinned file read drift')
 finally:os.close(fd)
 need(sha(raw)==pin,'pinned file SHA drift '+str(path));return raw
def guard():
 remaining()
 lane=S/'HEAVY-LANE-LOCK'
 need(lane.is_file() and not lane.is_symlink() and LANE_LOG in lane.read_text(),'sole recorded lane')
 p=subprocess.run(['pmset','-g','batt'],capture_output=True,text=True,timeout=min(10,remaining()))
 need(p.returncode==0 and p.stdout.splitlines()[:1]==["Now drawing from 'AC Power'"],'AC power')
 need(shutil.disk_usage(S).free>=FLOOR,'3 GiB floor')
def cmd(argv):
 guard();p=subprocess.run(argv,cwd=REPO,capture_output=True,timeout=remaining())
 need(p.returncode==0,'command failed '+repr(argv)+repr(p.stderr[-500:]));return p.stdout
def source_guard():
 need(cmd(['git','rev-parse','HEAD']).strip().decode()==HEAD,'production HEAD')
 need(cmd(['git','rev-parse','HEAD:src']).strip().decode()==TREE,'production src')
 need(cmd(['git','status','--porcelain=v1'])==b'','production dirty')
 need(cmd(['git','ls-remote','origin',REF]).strip().decode()==HEAD+'\t'+REF,'production remote')
def old_mirror_proof():
 runner=S/'1370-c0-h-typecheck-collection-runner-proposal-r5/runner.py'
 raw=read_pin(runner,'0fe66879521909362fa746044485b58b8a61b411038d40343465042aa183b50b',1<<20)
 scope={'__name__':'bridge_addendum_readonly_helper','__file__':str(runner)}
 exec(compile(raw,str(runner),'exec'),scope)
 manifest_path=S/'1370-c0-h-m0-corrected-overlay-source-manifest-r2/H-SOURCE-MANIFEST.json'
 manifest=json.loads(read_pin(manifest_path,'e2f92aa60063b754f110ec31f08080bfd461f6a150f74394464739c2d4cab7ff',100000))
 proof=scope['full_source_check'](MIRROR,manifest,True)
 need(proof['fileProofDigestSha256']=='55fd1afb4437386867cdb23c5daf137e9613d41e51f31dafc619bedf37bc59a4' and
      proof['mirrorFiles']==1344 and proof['mirrorBytes']==98158847 and proof['dependencyLink'] is not None,'old H mirror drift')
 return proof

def open_dir(parts,create=False):
 fd=os.open(MIRROR,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:
  for part in parts:
   need(part not in ('','.','..') and '/' not in part,'unsafe directory component')
   if create:
    try:os.mkdir(part,0o755,dir_fd=fd)
    except FileExistsError:pass
   nextfd=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
   if create:os.fchmod(nextfd,0o755)
   os.close(fd);fd=nextfd
  return fd
 except BaseException:os.close(fd);raise

def add_bridge(rows):
 expected={r['path']:r for r in rows};need(len(expected)==58 and sum(x['bytes'] for x in rows)==1357248,'bridge roster size')
 need(not os.path.lexists(MIRROR/'bridge'),'bridge already exists')
 rootfd=open_dir(())
 try:os.mkdir('bridge',0o755,dir_fd=rootfd);os.fsync(rootfd)
 finally:os.close(rootfd)
 actual=set();total=0
 proc=subprocess.Popen(['git','archive','--format=tar',H,'bridge'],cwd=REPO,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 try:
  with tarfile.open(fileobj=proc.stdout,mode='r|') as tar:
   for member in tar:
    guard();parts=pathlib.PurePosixPath(member.name).parts
    need(parts and parts[0]=='bridge' and '..' not in parts and member.name==pathlib.PurePosixPath(member.name).as_posix(),'tar traversal')
    if member.isdir():
     need(member.mode==0o775 and any(x.startswith(member.name.rstrip('/')+'/') for x in expected),'tar directory identity')
     fd=open_dir(parts,True);os.close(fd)
     continue
    need(member.isfile() and member.name in expected and member.name not in actual,'unexpected tar member')
    row=expected[member.name];need(row['mode']=='100644' and row['kind']=='blob' and member.size==row['bytes'] and member.mode==0o664,'tar file identity')
    parentfd=open_dir(parts[:-1],True)
    try:
     fd=os.open(parts[-1],os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o644,dir_fd=parentfd)
     try:
      blob=hashlib.sha1();blob.update(f"blob {member.size}\0".encode());count=0
      f=tar.extractfile(member);need(f is not None,'tar file missing')
      while True:
       guard();chunk=f.read(1<<20)
       if not chunk:break
       count+=len(chunk);need(count<=member.size,'tar overflow')
       blob.update(chunk)
       view=memoryview(chunk)
       while view:view=view[os.write(fd,view):]
      need(count==member.size and blob.hexdigest()==row['oid'],'Git blob mismatch')
      os.fchmod(fd,0o644);os.fsync(fd)
      written=os.fstat(fd);pathstat=os.stat(parts[-1],dir_fd=parentfd,follow_symlinks=False)
      attrs=lambda x:(x.st_dev,x.st_ino,x.st_mode,x.st_nlink,x.st_size,x.st_mtime_ns,x.st_ctime_ns)
      need(attrs(written)==attrs(pathstat) and stat.S_ISREG(written.st_mode) and written.st_nlink==1 and written.st_size==member.size and stat.S_IMODE(written.st_mode)==0o644,'written bridge file drift')
     finally:os.close(fd)
     os.fsync(parentfd)
    finally:os.close(parentfd)
    actual.add(member.name);total+=member.size
  stderr=proc.stderr.read()[-1000:];need(proc.wait(timeout=remaining())==0,'git archive failed '+repr(stderr))
  need(actual==set(expected) and total==1357248,'bridge file set/bytes')
  return {'bridgeTree':'a697b042eccb85adacd40ef1303869be6d26239a','bridgeFiles':len(actual),'bridgeBytes':total}
 except BaseException:
  proc.kill();proc.wait();raise

def main():
 global HEAD
 signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('180-second addendum deadline')))
 signal.setitimer(signal.ITIMER_REAL,WALL)
 ap=argparse.ArgumentParser();ap.add_argument('--static-review',required=True);ap.add_argument('--static-review-sha',required=True);ap.add_argument('--production-head',required=True)
 args=ap.parse_args();need(len(args.production_head)==40 and all(x in '0123456789abcdef' for x in args.production_head),'production HEAD argument');HEAD=args.production_head;review=pathlib.Path(args.static_review)
 need(review.is_absolute() and review.is_relative_to(S),'static review path outside scratch')
 authority=json.loads(read_pin(review,args.static_review_sha,100000))
 need(authority.get('decision')=='ACCEPT_STATIC_H_BRIDGE_ADDENDUM_ONLY' and authority.get('inputsSha256')==INPUTS_SHA,'addendum not independently reviewed')
 inputs=json.loads(read_pin(INPUTS,INPUTS_SHA,100000));h=inputs['arms']['H']
 need(h['sourceCommit']==H and h['bridgeTree']=='a697b042eccb85adacd40ef1303869be6d26239a','bridge source pin')
 stop=S/'1370-c0-h-typecheck-independent-observed-stop-review-r1/RECEIPT.json'
 read_pin(stop,'6c8e310bca8d581a479ffda929b3edad83670c5bdb52c2ef45b419e4953f0f4d',100000)
 prior=S/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1.MATERIALIZE-RESULT.json'
 read_pin(prior,'b8c70f731fc730cea3ba7238674fb964fb973e6ffcf58fcb03e0dbbd139196b6',100000)
 need(shutil.disk_usage(S).free>=PRE,'3.5 GiB preflight');guard();source_guard()
 need(MIRROR.is_dir() and not MIRROR.is_symlink() and not os.path.lexists(MIRROR/'bridge'),'mirror/bridge preflight')
 need(cmd(['git','rev-parse',H+':bridge']).strip().decode()==h['bridgeTree'],'bridge tree OID')
 raw=cmd(['git','ls-tree','-rl','-z',H,'bridge']);observed=[]
 for rec in raw.split(b'\0'):
  if rec:
   head,name=rec.split(b'\t',1);mode,kind,oid,size=head.decode().split();observed.append({'path':name.decode(),'mode':mode,'kind':kind,'oid':oid,'bytes':int(size)})
 need(observed==h['files'],'full bridge Git roster drift')
 old=old_mirror_proof()
 need(not os.path.lexists(OUT),'one-shot result collision')
 OUT.parent.mkdir(mode=0o700,exist_ok=True)
 out_parent=OUT.parent.lstat();need(stat.S_ISDIR(out_parent.st_mode) and not stat.S_ISLNK(out_parent.st_mode),'unsafe result parent')
 result={'schema':'1370-c0-h-bridge-addendum-result-r1','status':'RUNNING','sourceCommit':H,'oldMirrorProof':old,
         'originalMaterializerResultSha256':'b8c70f731fc730cea3ba7238674fb964fb973e6ffcf58fcb03e0dbbd139196b6',
         'observedTypeStopReceiptSha256':'6c8e310bca8d581a479ffda929b3edad83670c5bdb52c2ef45b419e4953f0f4d',
         'bridgeInputsSha256':INPUTS_SHA,'staticReviewSha256':args.static_review_sha,'productionHead':HEAD}
 try:
  result.update(add_bridge(h['files']))
  source_guard();guard()
  result['status']='BRIDGE_ADDED_SOURCE_ONLY_PENDING_INDEPENDENT_FULL_READBACK'
 except BaseException as error:
  result['status']='STOP_PARTIAL_BRIDGE_ADDENDUM';result['error']=repr(error)
  raise
 finally:
  result['elapsedSeconds']=round(time.monotonic()-START,3)
  with OUT.open('x') as f:json.dump(result,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
  parentfd=os.open(OUT.parent,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
  try:os.fsync(parentfd)
  finally:os.close(parentfd)
  print(json.dumps({'status':result['status'],'resultSha256':sha(OUT.read_bytes())}),flush=True)
if __name__=='__main__':
 try:main()
 except BaseException as e:print('STOP_H_BRIDGE_ADDENDUM '+repr(e),file=sys.stderr,flush=True);sys.exit(1)
