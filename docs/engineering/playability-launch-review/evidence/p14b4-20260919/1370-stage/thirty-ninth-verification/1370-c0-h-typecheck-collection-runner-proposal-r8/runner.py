#!/usr/bin/env python3
"""UNRUN proposal: H full-era dependency, types and diagnostic collection only."""
import argparse, hashlib, json, math, os, pathlib, re, shutil, signal, stat, subprocess, sys, time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
OUT_ROOT=S/'1370-c0-h-typecheck-collection-results-r8'
MIRROR_ROOT=S/'1370-c0-h-m0-observer-mirrors-r2'
HEAD='9651546af98c44f04e8b6b2714d10d67dadb8f9c'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
REF='refs/heads/wip/headless-program-20260916-ts'
H_COMMIT='8708d6a98e6eb4ad53e3a54e431c4b40b974f79d'
H_TREE='0ee21d8179977aaa0726ffb5d1b2bb2568c9df97'
MANIFEST_SHA='e2f92aa60063b754f110ec31f08080bfd461f6a150f74394464739c2d4cab7ff'
REVIEW_SHA='5e6f23884af9527f991665020414404455f182cc3a62abe5a5602bb019804dbf'
LOCK_SHA='728ee1693d3d4f33d04fc731264e442cb5f00e922fb36943aee9db9bf2e7c5de'
BRIDGE_TREE='a697b042eccb85adacd40ef1303869be6d26239a'
BRIDGE_SOURCE_SHA='659b5a436fd874df8485cba90e3e1b5d5847e02f21f3b2dcc27c21e555a5785f'
BRIDGE_OBSERVED_SHA='f2baf6d6f44b3582f3a70384c1c3acae2a328de254101dad076d428c9ea57a9d'
OLD_TYPE_STOP_SHA='6c8e310bca8d581a479ffda929b3edad83670c5bdb52c2ef45b419e4953f0f4d'
OLD_TYPE_RESULT_SHA='3eb6294278eda61893738cdc1ee5b6a80c44ced5a3cd9fd7197511bbb6198216'
# Pending full 1,402-file observed readback digest/receipt are mandatory filled binding fields.

DEPS_CHECK_SHA='e61f6a88614eac49fcec3f326c162e4d44d75ea2999b6751581e30e7685b6a64'
NODE='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node'
WALL=300
FLOOR=3*1024**3
PREFLIGHT=int(3.5*1024**3)
START=globals().get('_BOOTSTRAP_START')
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
 need(type(START) in (int,float) and math.isfinite(float(START)),
      'invalid authenticated child start')
 elapsed=time.monotonic()-START
 need(math.isfinite(elapsed) and 0<=elapsed<WALL,'300-second whole-child deadline')
 return WALL-elapsed
# The recorder's SHA-authenticated bootstrap supplies START and arms the same 300s limit.
remaining()
def fields(st):
 return st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns

def open_dir_chain(path):
 need(path.is_absolute(),'absolute directory path')
 held=[os.open('/',os.O_RDONLY|os.O_DIRECTORY)]
 try:
  for name in path.parts[1:]:
   parent=held[-1]
   need(name not in ('','.','..'),'unsafe directory component')
   before=os.stat(name,dir_fd=parent,follow_symlinks=False)
   need(stat.S_ISDIR(before.st_mode),'symlink/non-directory parent')
   child=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
   need(fields(os.fstat(child))==fields(before)==fields(os.stat(name,dir_fd=parent,follow_symlinks=False)),
        'directory open drift')
   held.append(child)
  return held
 except BaseException:
  for fd in reversed(held):os.close(fd)
  raise

def verify_dir_chain(path,held):
 need(len(held)==len(path.parts),'directory chain length')
 for parent,child,name in zip(held,held[1:],path.parts[1:]):
  need(fields(os.fstat(child))==fields(os.stat(name,dir_fd=parent,follow_symlinks=False)),
       'directory chain drift')

def close_chain(held):
 for fd in reversed(held):os.close(fd)

def read_pin(path,expected,cap=1<<20):
 need(path.is_absolute() and re.fullmatch('[0-9a-f]{64}',expected or ''),'pinned control path/SHA')
 held=open_dir_chain(path.parent)
 try:
  parent=held[-1];before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and 0<=before.st_size<=cap,'unsafe pinned file '+str(path))
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   need(fields(os.fstat(fd))==fields(before),'control open drift')
   data=bytearray()
   while True:
    remaining();chunk=os.read(fd,min(65536,cap+1-len(data)))
    if not chunk:break
    data.extend(chunk);need(len(data)<=before.st_size and len(data)<=cap,'control grew')
   need(len(data)==before.st_size and fields(os.fstat(fd))==fields(before)==
        fields(os.stat(path.name,dir_fd=parent,follow_symlinks=False)),'control changed')
  finally:os.close(fd)
  verify_dir_chain(path.parent,held)
  raw=bytes(data);need(sha(raw)==expected,'pin drift '+str(path));return raw
 finally:close_chain(held)

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
SOURCE_LAST_GUARD=float('-inf')
def source_step(run_id):
 global SOURCE_LAST_GUARD
 remaining()
 need(shutil.disk_usage(S).free>=FLOOR,'3 GiB disk floor')
 now=time.monotonic()
 if now-SOURCE_LAST_GUARD>=5:
  guard(run_id);SOURCE_LAST_GUARD=now

def bounded_names(fd,state,cap,run_id):
 names=[];local=0
 source_step(run_id)
 with os.scandir(fd) as it:
  for item in it:
   local+=1;state['entries']+=1
   need(local<=cap and state['entries']<=cap,'directory/global entry cap')
   if local%16==0:source_step(run_id)
   names.append(item.name)
 source_step(run_id)
 return sorted(names,key=lambda x:x.encode('utf-8'))

def walk_meta(root,run_id):
 """No-follow dependency proof with stable dirfd reads and a 512 MiB content cap."""
 held=open_dir_chain(root);rootfd=held[-1];root_before=fields(os.fstat(rootfd))
 digest=hashlib.sha256();state={'entries':0};content_bytes=0
 try:
  def descend(fd,prefix):
   nonlocal content_bytes
   before=fields(os.fstat(fd))
   for name in bounded_names(fd,state,500000,run_id):
    source_step(run_id)
    need(name not in ('','.','..') and '/' not in name and '\n' not in name,'unsafe dependency name')
    rel=prefix+name
    st=os.stat(name,dir_fd=fd,follow_symlinks=False)
    extra='';file_hash=None
    if stat.S_ISDIR(st.st_mode):
     child=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
     try:
      need(fields(os.fstat(child))==fields(st),'dependency directory open drift')
      # Metadata row precedes descendants, preserving a single deterministic walk.
      row=[rel,st.st_mode,st.st_dev,st.st_ino,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns,extra,file_hash]
      digest.update(json.dumps(row,separators=(',',':')).encode()+b'\n')
      descend(child,rel+'/')
      need(fields(os.fstat(child))==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),
           'dependency directory changed')
     finally:os.close(child)
    else:
     if stat.S_ISLNK(st.st_mode):
      extra=os.readlink(name,dir_fd=fd)
      need(fields(st)==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'dependency link drift')
     elif stat.S_ISREG(st.st_mode):
      need(0<=st.st_size<=512*1024**2-content_bytes,'dependency content audit cap')
      filefd=os.open(name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=fd)
      try:
       need(fields(os.fstat(filefd))==fields(st),'dependency file open drift')
       h=hashlib.sha256();size=0
       while True:
        source_step(run_id);chunk=os.read(filefd,1<<20)
        if not chunk:break
        size+=len(chunk);need(size<=st.st_size,'dependency grew during audit');h.update(chunk)
       need(size==st.st_size and fields(os.fstat(filefd))==fields(st)==
            fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'dependency file changed')
      finally:os.close(filefd)
      file_hash=h.hexdigest();content_bytes+=size
     else:raise RuntimeError('special dependency entry '+rel)
     row=[rel,st.st_mode,st.st_dev,st.st_ino,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns,extra,file_hash]
     digest.update(json.dumps(row,separators=(',',':')).encode()+b'\n')
   need(fields(os.fstat(fd))==before,'dependency directory mutation')
  descend(rootfd,'')
  need(fields(os.fstat(rootfd))==root_before,'dependency root mutation')
  verify_dir_chain(root,held)
  return {'entries':state['entries'],'contentBytes':content_bytes,
          'contentAndMetadataSha256':digest.hexdigest(),
          'rootDevice':root_before[0],'rootInode':root_before[1]}
 finally:close_chain(held)

def git_source_sha(path):return sha(subprocess.check_output(['git','show',H_COMMIT+':'+path],cwd=REPO,timeout=min(15,remaining())))
def full_source_check(mirror,manifest,run_id,allow_deps_link=False):
 """Rebuild the H 1,402-file Git/overlay proof through no-follow dirfds."""
 paths=['src','tests','ui','bridge','package.json','package-lock.json','tsconfig.json','tsconfig.src.json','vitest.config.ts','vitest.workspace.ts']
 proc=subprocess.run(['git','ls-tree','-rl','-z',H_COMMIT,*paths],cwd=REPO,capture_output=True,timeout=min(15,remaining()))
 need(proc.returncode==0,'H Git roster failure')
 base={}
 for rec in proc.stdout.split(b'\0'):
  if not rec:continue
  header,name=rec.split(b'\t',1);mode,kind,oid,size=header.decode().split();rel=name.decode()
  need(kind=='blob' and mode in ('100644','100755') and rel not in base,'H Git roster entry')
  base[rel]=(mode,oid,int(size))
 need(len(base)==1400 and sum(v[2] for v in base.values())==99472197,'H Git+bridge roster count/bytes')
 need(cmd(['git','rev-parse',H_COMMIT+':bridge'])==BRIDGE_TREE,'H bridge tree drift')
 overlays={r['destination']:r for r in manifest['files']}
 need(len(overlays)==4,'H overlay roster')
 expected=set(base)|set(overlays);need(len(expected)==1402,'H amended mirror expected count')
 held=open_dir_chain(mirror);rootfd=held[-1];root_before=fields(os.fstat(rootfd))
 proof_rows={};state={'entries':0};total=0;deps_link=None
 try:
  def descend(fd,prefix):
   nonlocal total,deps_link
   before=fields(os.fstat(fd))
   for name in bounded_names(fd,state,1500,run_id):
    source_step(run_id)
    need(name not in ('','.','..') and '/' not in name,'unsafe mirror name')
    rel=prefix+name;st=os.stat(name,dir_fd=fd,follow_symlinks=False)
    if stat.S_ISDIR(st.st_mode):
     need(any(x.startswith(rel+'/') for x in expected),'extra mirror directory '+rel)
     child=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
     try:
      need(fields(os.fstat(child))==fields(st),'mirror directory open drift')
      descend(child,rel+'/')
      need(fields(os.fstat(child))==fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),
           'mirror directory changed')
     finally:os.close(child)
    elif stat.S_ISLNK(st.st_mode):
     need(allow_deps_link and rel=='node_modules' and deps_link is None and st.st_nlink==1,
          'unexpected dependency link')
     target=os.readlink(name,dir_fd=fd)
     need(target==str(REPO/'node_modules') and fields(st)==
          fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'dependency link changed')
     deps_link=fields(st)+(target,)
    else:
     need(rel in expected and rel not in proof_rows,'extra/duplicate mirror file '+rel)
     need(stat.S_ISREG(st.st_mode) and st.st_nlink==1,'unsafe mirror file '+rel)
     if rel in overlays:
      mode='100644';oid=None;size=overlays[rel]['bytes']
     else:mode,oid,size=base[rel]
     need(st.st_size==size and stat.S_IMODE(st.st_mode)==
          (0o755 if mode=='100755' else 0o644),'mirror file size/mode '+rel)
     filefd=os.open(name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=fd)
     try:
      need(fields(os.fstat(filefd))==fields(st),'mirror open drift '+rel)
      blob=hashlib.sha1(f'blob {size}\0'.encode());content=hashlib.sha256();count=0
      while True:
       source_step(run_id);chunk=os.read(filefd,1<<20)
       if not chunk:break
       count+=len(chunk);need(count<=size,'mirror file grew '+rel)
       blob.update(chunk);content.update(chunk)
      need(count==size and fields(os.fstat(filefd))==fields(st)==
           fields(os.stat(name,dir_fd=fd,follow_symlinks=False)),'mirror file read drift '+rel)
     finally:os.close(filefd)
     got_oid=blob.hexdigest();got_sha=content.hexdigest();got_mode=stat.S_IMODE(st.st_mode)
     if rel in overlays:need(got_sha==overlays[rel]['sha256'],'overlay SHA '+rel)
     else:need(got_oid==oid,'Git blob OID '+rel)
     proof_rows[rel]=[rel,size,got_oid,got_sha,got_mode];total+=size
   need(fields(os.fstat(fd))==before,'mirror directory mutation')
  descend(rootfd,'')
  need(set(proof_rows)==expected and len(proof_rows)==1402 and total==99516095 and
       (deps_link is not None)==allow_deps_link and state['entries']<=1500,
       'amended mirror roster/count/bytes/link')
  need(fields(os.fstat(rootfd))==root_before,'mirror root mutation')
  verify_dir_chain(mirror,held)
  return {'fileProofDigestSha256':canonical_proof(proof_rows),'mirrorFiles':len(proof_rows),
          'mirrorBytes':total,'dependencyLink':deps_link,'traversedEntries':state['entries'],'mirrorRootIdentity':root_before}
 finally:close_chain(held)

def canonical_proof(rows):
 """Match the accepted r5 readback: UTF-8 path order and exact five-field rows."""
 need(isinstance(rows,dict) and len(rows)==len(set(rows)), 'proof row map')
 digest=hashlib.sha256()
 for rel in sorted(rows,key=lambda x:x.encode('utf-8')):
  row=rows[rel]
  need(isinstance(row,list) and len(row)==5 and row[0]==rel, 'proof row schema/order')
  digest.update(json.dumps(row,separators=(',',':')).encode('utf-8')+b'\n')
 return digest.hexdigest()

def validate_r6_chain(binding,readback):
 """Authenticate actual r6 child0 source proof; never self-award observed acceptance."""
 expect={
  'fullReadbackResultPath':S/'1370-c0-h-bridge-full-readback-recorded-r6/READBACK.json',
  'fullReadbackR6RecorderResultPath':S/'1370-c0-h-bridge-full-readback-recorder-results-r3/20261008-h-bridge-full-readback-r6.RECORDER-RESULT.json',
  'fullReadbackR6LaneLogPath':S/'c0-h-bridge-full-readback-20261008-r6.lane.log',
  'fullReadbackR6LaneMetaPath':S/'c0-h-bridge-full-readback-20261008-r6.lane.log.meta',
  'fullReadbackR6ExactReviewPath':S/'1370-c0-h-bridge-full-readback-filled-exact-independent-review-r6/RECEIPT.json',
  'fullReadbackR6StaticReceiptPath':S/'1370-c0-h-bridge-full-readback-independent-static-review-r6/RECEIPT.json'}
 for field,path in expect.items():need(binding.get(field)==str(path),'r6 path '+field)
 need(binding.get('fullReadbackDigestSha256')=='1534ca888a99c1f41e3eb2a7201d6d6d56f1343bab3f4040518348cc34d276b4','r6 digest pin')
 need(binding.get('fullReadbackR6RunnerSha256')=='6d2c51bc6a802e7e19e41849d27569e35bcfcee31dfc12480c0f6a22998314d1' and
      binding.get('fullReadbackR6SpecSha256')=='24952774515fd0e36eb2d2895e3e1d6996371c93617995612e3db5c75ac3a5d5' and
      binding.get('fullReadbackR6SourceManifestSha256')=='e70a1382c47019e70acac5739fbc33ca0da7c0961f70dda13cca9ba8ac31a11e',
      'r6 source pins')
 need(binding.get('fullReadbackR6StaticReceiptSha256')=='63767792d0a2e43a052141c13f3e1e15c2d4c3dbc450f4a73a3210d5daa564e1' and
      binding.get('fullReadbackR6ExactReviewSha256')=='feb6a592008230f89767693aefcf1077b01b110297e30ed8cfcc9e6c790a762d',
      'r6 review pins')
 need(binding.get('fullReadbackResultSha256')=='3da9e86417520a6e75591e107e85f4bacf3ba8b7e9fef4b33bca30f854723724' and
      binding.get('fullReadbackR6RecorderResultSha256')=='3341a65bae54cae0ca481c652a36621556da8ed885436947078f3fc48bd9f88a' and
      binding.get('fullReadbackR6LaneLogSha256')=='323aea0900a0a074371651fd52c21ee9b3785047903f32275a1ccbc571793a42' and
      binding.get('fullReadbackR6LaneMetaSha256')=='7037896827b418977e06959e48652e68fbc7581243fc4a87726171ce3e0ed0b5',
      'r6 observed raw pins')
 need(readback.get('decision')=='SOURCE_BYTES_CHECKED_OBSERVED_REVIEW_PENDING' and
      readback.get('fileProofDigestSha256')==binding['fullReadbackDigestSha256'] and
      readback.get('regularFiles')==1402 and readback.get('regularBytes')==99516095 and
      readback.get('symlinks')==1 and readback.get('sourceCommit')==H_COMMIT and
      readback.get('sourceTree')==H_TREE and readback.get('bridgeTree')==BRIDGE_TREE and
      readback.get('addendumResultSha256')==BRIDGE_SOURCE_SHA and
      readback.get('recorderResultSha256')=='613b0487f37cfe9b2e0267ec8e0c5943ace463a531705567e96e4e41de656b10' and
      readback.get('productionHead')==HEAD and readback.get('productionSrcTree')==TREE and
      readback.get('sourceManifestSha256')==MANIFEST_SHA and
      readback.get('evidenceTip')=='fe9e8a7d84da164e9a413dc2c3efe49f529c2a78',
      'r6 raw source proof')
 static=json.loads(read_pin(expect['fullReadbackR6StaticReceiptPath'],binding['fullReadbackR6StaticReceiptSha256'],100000))
 exact=json.loads(read_pin(expect['fullReadbackR6ExactReviewPath'],binding['fullReadbackR6ExactReviewSha256'],100000))
 need(static.get('decision')=='ACCEPT_STATIC_H_BRIDGE_FULL_READBACK_ONLY' and
      static.get('scriptSha256')==binding['fullReadbackR6RunnerSha256'] and
      static.get('specSha256')==binding['fullReadbackR6SpecSha256'] and
      static.get('manifestSha256')==binding['fullReadbackR6SourceManifestSha256'] and
      exact.get('decision')=='ACCEPT_EXACT_H_BRIDGE_FULL_READBACK_RETRY_R6_ONLY' and
      exact.get('readbackSourceSha256')==binding['fullReadbackR6RunnerSha256'] and
      exact.get('readbackR6StaticReviewSha256')==binding['fullReadbackR6StaticReceiptSha256'] and
      exact.get('bindingSha256')=='09120c19b820efcdf4d534b07b818a4b08129a10857bdcc5b370e5a7b8ef74a4',
      'r6 independent static/exact authority')
 recorder=json.loads(read_pin(expect['fullReadbackR6RecorderResultPath'],binding['fullReadbackR6RecorderResultSha256'],100000))
 need(recorder.get('schema')=='1370-c0-h-bridge-full-readback-recorder-result-r3' and
      recorder.get('status')=='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW' and
      recorder.get('childExit')==0 and recorder.get('groupClear') is True and
      recorder.get('sourceDeadlineSeconds')==600 and recorder.get('recorderActiveSeconds')==620 and
      recorder.get('recorderWholeSeconds')==630 and 0<=recorder.get('elapsedSeconds',-1)<=630 and
      recorder.get('sourceSha256')==binding['fullReadbackR6RunnerSha256'] and
      recorder.get('staticReviewSha256')==binding['fullReadbackR6StaticReceiptSha256'] and
      recorder.get('productionHead')==HEAD and recorder.get('productionSourceTree')==TREE and
      'error' not in recorder and 'cleanupError' not in recorder,
      'r6 recorder child/timeout/group')
 lane=read_pin(expect['fullReadbackR6LaneLogPath'],binding['fullReadbackR6LaneLogSha256'],100000)
 meta=read_pin(expect['fullReadbackR6LaneMetaPath'],binding['fullReadbackR6LaneMetaSha256'],100000)
 lines=meta.splitlines();terminal=[x for x in lines if x.startswith(b'end, exit ')]
 need(len(terminal)==1 and lines[-1]==terminal[0] and terminal[0].startswith(b'end, exit 0; '),
      'r6 lane child terminal')
 need(b'Traceback' not in lane,'r6 lane traceback')
 records=[json.loads(x) for x in lane.splitlines()]
 need(len(records)==2 and records[0].get('decision')==readback['decision'] and
      records[0].get('receiptSha256')==binding['fullReadbackResultSha256'] and
      records[0].get('regularFiles')==1402 and records[0].get('regularBytes')==99516095 and
      records[1].get('recorderStatus')==recorder['status'] and records[1].get('childExit')==0 and
      records[1].get('groupClear') is True,'r6 lane result/recorder lines')
 old4=S/'1370-c0-h-bridge-full-readback-independent-observed-stop-review-r4/RECEIPT.json'
 old5=S/'1370-c0-h-bridge-full-readback-independent-observed-stop-review-r5/RECEIPT.json'
 need(binding.get('fullReadbackR4ObservedStopReceiptSha256')=='8d7c904eefdaacc5e8905c2a3166d80907768cb7c97c75d46be1c26de98beec6' and
      binding.get('fullReadbackR5ObservedStopReceiptSha256')=='ded3a4f895ca393dedb3099712a7d01f1ee6f2c22cc780d215f51de397d37fd9',
      'r4/r5 STOP pins')
 need(json.loads(read_pin(old4,binding['fullReadbackR4ObservedStopReceiptSha256'],100000)).get('decision')=='ACCEPT_OBSERVED_STOP_H_BRIDGE_FULL_READBACK_R4' and
      json.loads(read_pin(old5,binding['fullReadbackR5ObservedStopReceiptSha256'],100000)).get('decision')=='ACCEPT_OBSERVED_STOP_H_BRIDGE_FULL_READBACK_R5',
      'r4/r5 preserved STOP')
 need(readback.get('nodeModulesLinkIdentity') is not None and
      isinstance(readback.get('mirrorRootIdentity'),list),'r6 source/link identity shape')
 return {'rawSha256':binding['fullReadbackResultSha256'],'proofDigestSha256':binding['fullReadbackDigestSha256'],
         'recorderSha256':binding['fullReadbackR6RecorderResultSha256']}

def validate_r6_observed(binding,readback):
 path=S/'1370-c0-h-bridge-full-readback-independent-observed-review-r6/RECEIPT.json'
 pin='35ca2012f0a6122cd88f509cc6f484c1ec489a08d8752d500877095293ca328a'
 need(binding.get('fullReadbackObservedReceiptPath')==str(path) and
      binding.get('fullReadbackObservedReceiptSha256')==pin and
      binding.get('fullReadbackObservedDecision')=='ACCEPT_OBSERVED_H_BRIDGE_FULL_SOURCE_BYTES_ONLY',
      'r6 observed receipt route')
 observed=json.loads(read_pin(path,pin,100000))
 need(observed.get('schema')=='1370-c0-h-bridge-full-readback-independent-observed-review-r6' and
      observed.get('decision')==binding['fullReadbackObservedDecision'] and
      observed.get('independentByteAuditDecision')=='PASS_INDEPENDENT_H_MIRROR_BYTES_ONLY' and
      observed.get('readbackSha256')==binding['fullReadbackResultSha256'] and
      observed.get('fileProofDigestSha256')==binding['fullReadbackDigestSha256'] and
      observed.get('recorderResultSha256')==binding['fullReadbackR6RecorderResultSha256'] and
      observed.get('laneLogSha256')==binding['fullReadbackR6LaneLogSha256'] and
      observed.get('laneMetaSha256')==binding['fullReadbackR6LaneMetaSha256'] and
      observed.get('exactLaunchReviewSha256')==binding['fullReadbackR6ExactReviewSha256'] and
      observed.get('sourceSha256')==binding['fullReadbackR6RunnerSha256'] and
      observed.get('sourceStaticReviewSha256')==binding['fullReadbackR6StaticReceiptSha256'] and
      observed.get('sourceCommit')==H_COMMIT and observed.get('sourceTree')==H_TREE and
      observed.get('bridgeTree')==BRIDGE_TREE and observed.get('productionHead')==HEAD and
      observed.get('productionSrcTree')==TREE and
      observed.get('r4ObservedStopSha256')==binding['fullReadbackR4ObservedStopReceiptSha256'] and
      observed.get('r5ObservedStopSha256')==binding['fullReadbackR5ObservedStopReceiptSha256'] and
      observed.get('regularFiles')==1402 and observed.get('regularBytes')==99516095 and
      observed.get('symlinks')==1 and observed.get('entries')==1479 and
      observed.get('laneChildExit')==0 and observed.get('recorderChildExit')==0 and
      observed.get('recorderGroupClear') is True and
      observed.get('postflightNoLaneLockPartialsOrSurvivors') is True and
      observed.get('postflightAC') is True and
      observed.get('postflightProductionClean') is True and
      observed.get('postflightRemoteRefsMatch') is True and
      observed.get('mirrorRootIdentity')==readback.get('mirrorRootIdentity') and
      observed.get('nodeModulesLinkIdentity')==readback.get('nodeModulesLinkIdentity'),
      'r6 independent observed source-only proof')
 return observed

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
 need(binding.get('productionHead')==HEAD and binding.get('productionSrcTree')==TREE and
      binding.get('sourceCommit')==H_COMMIT and binding.get('sourceTree')==H_TREE and
      binding.get('bridgeTree')==BRIDGE_TREE and binding.get('childWallSeconds')==300 and
      binding.get('recorderWallSeconds')==330,'binding role/bounds drift')
 need(re.fullmatch('[0-9a-f]{64}',binding.get('fullReadbackResultSha256','')) and
      re.fullmatch('[0-9a-f]{64}',binding.get('fullReadbackDigestSha256','')) and
      re.fullmatch('[0-9a-f]{64}',binding.get('fullReadbackObservedReceiptSha256','')),'unfilled full-readback authority')
 mirror=MIRROR_ROOT/binding['mirrorRunId'];result_path=MIRROR_ROOT/(binding['mirrorRunId']+'.MATERIALIZE-RESULT.json')
 need(binding['mirrorRunId']=='20261008-h-types-r1' and str(mirror)==binding.get('mirrorPath') and
      str(result_path)==binding.get('materializerResultPath'),'mirror binding mismatch')
 readback_path=pathlib.Path(binding.get('fullReadbackResultPath',''))
 need(readback_path.is_absolute() and readback_path.is_relative_to(S),'readback receipt path')
 readback=json.loads(read_pin(readback_path,binding['fullReadbackResultSha256'],100000))
 need(readback.get('decision')=='SOURCE_BYTES_CHECKED_OBSERVED_REVIEW_PENDING' and
      readback.get('fileProofDigestSha256')==binding['fullReadbackDigestSha256'] and
      readback.get('regularFiles')==1402 and readback.get('regularBytes')==99516095 and
      readback.get('sourceCommit')==H_COMMIT and readback.get('sourceTree')==H_TREE and
      readback.get('bridgeTree')==BRIDGE_TREE and
      readback.get('addendumResultSha256')==BRIDGE_SOURCE_SHA,'raw full mirror readback authority')
 validate_r6_chain(binding,readback)
 validate_r6_observed(binding,readback)
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
 bridge_source_path=S/'1370-c0-h-bridge-addendum-results-r3/20261008-h-bridge-addendum-r3.RESULT.json'
 bridge_observed_path=S/'1370-c0-h-bridge-addendum-independent-observed-source-review-r1/RECEIPT.json'
 old_stop_path=S/'1370-c0-h-typecheck-independent-observed-stop-review-r1/RECEIPT.json'
 old_result_path=S/'1370-c0-h-typecheck-collection-results-r5/20261008-h-types-r3/RESULT.json'
 bridge_source=json.loads(read_pin(bridge_source_path,BRIDGE_SOURCE_SHA,100000))
 bridge_observed=json.loads(read_pin(bridge_observed_path,BRIDGE_OBSERVED_SHA,100000))
 read_pin(old_stop_path,OLD_TYPE_STOP_SHA,100000)
 old_result=json.loads(read_pin(old_result_path,OLD_TYPE_RESULT_SHA,100000))
 need(bridge_source.get('status')=='BRIDGE_ADDED_SOURCE_ONLY_PENDING_INDEPENDENT_FULL_READBACK' and
      bridge_source.get('bridgeTree')==BRIDGE_TREE and bridge_source.get('bridgeFiles')==58 and
      bridge_source.get('bridgeBytes')==1357248 and
      bridge_observed.get('decision')=='ACCEPT_OBSERVED_H_BRIDGE_SOURCE_ROUTE_ONLY' and
      bridge_observed.get('sourceResultSha256')==BRIDGE_SOURCE_SHA and
      old_result.get('status')=='STOP_TYPECHECK_COLLECTION','prior/addendum authority mismatch')
 need(mirror.is_dir() and not mirror.is_symlink(),'mirror absent/unsafe')
 need(shutil.disk_usage(S).free>=PREFLIGHT,'3.5 GiB preflight')
 guard(run_id)
 need(not OUT_ROOT.exists() or (OUT_ROOT.is_dir() and not OUT_ROOT.is_symlink()),'unsafe result root')
 out=OUT_ROOT/run_id;need(not out.exists(),'output collision')
 source_before=full_source_check(mirror,manifest,run_id,True)
 need(source_before['fileProofDigestSha256']==binding['fullReadbackDigestSha256'] and
      source_before['dependencyLink']==tuple(old_result['sourceAfter']['dependencyLink']) and
      source_before['mirrorRootIdentity']==tuple(readback['mirrorRootIdentity']) and
      source_before['dependencyLink'][:7]==tuple(readback['nodeModulesLinkIdentity']),
      'amended mirror proof/root/link drift')
 prod_deps=REPO/'node_modules';need(prod_deps.is_dir() and not prod_deps.is_symlink(),'production deps root')
 dep_before=walk_meta(prod_deps,run_id)
 link=mirror/'node_modules';need(link.is_symlink() and os.readlink(link)==str(prod_deps),'preexisting dependency link drift')
 OUT_ROOT.mkdir(mode=0o700,exist_ok=True);out.mkdir(mode=0o700)
 record={'schema':'1370-c0-h-typecheck-collection-result-r8','status':'RUNNING','arm':'H','runId':run_id,
         'mirrorRunId':binding['mirrorRunId'],'materializerResultSha256':binding['materializerResultSha256'],
         'sourceManifestSha256':MANIFEST_SHA,'sourceReviewSha256':REVIEW_SHA,
         'bridgeSourceResultSha256':BRIDGE_SOURCE_SHA,'fullReadbackResultSha256':binding['fullReadbackResultSha256'],
         'fullReadbackDigestSha256':binding['fullReadbackDigestSha256'],'sourceBefore':source_before,
         'nodeModulesBefore':dep_before,'children':[]}
 try:
  guard(run_id)
  node=NODE;tsc=str(REPO/'node_modules/.bin/tsc');vitest=str(REPO/'node_modules/.bin/vitest')
  dependency_check=str(S/'1370-c0-h-m0-typecheck-collection-route-template-r1/check-deps.mjs')
  read_pin(pathlib.Path(dependency_check),DEPS_CHECK_SHA,100000)
  need(cmd([NODE,'--version'])=='v22.23.2','Node runtime drift')
  for name,argv in [
      ('dependency-versions',[node,dependency_check,str(mirror),str(REPO),LOCK_SHA]),
      ('root-tsc',[tsc,'--noEmit']),
      ('ui-tsc',[tsc,'-p','ui/tsconfig.json','--noEmit']),
      ('diagnostic-collection',[vitest,'list','tests/diagnostic.test.ts','--project','core','--json',str(out/'collection.json'),'--no-cache'])]:
   child=run_child(name,argv,mirror,out,run_id)
   record['children'].append(child)
   need(child['exit']==0,name+' child exit '+str(child['exit']))
  collection=out/'collection.json'
  need(collection.is_file() and not collection.is_symlink() and collection.stat().st_size<=1<<20,'collection missing/large')
  raw=collection.read_bytes();parsed=json.loads(raw)
  need('tests/diagnostic.test.ts' in json.dumps(parsed) and len(raw)>10,'diagnostic test not collected')
  record['collectionSha256']=sha(raw)
  need(full_source_check(mirror,manifest,run_id,True)['fileProofDigestSha256']==source_before['fileProofDigestSha256'],'source changed during checks')
  guard(run_id)
  record['status']='PASS_FULL_ERA_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY'
 except BaseException as error:
  record['status']='STOP_TYPECHECK_COLLECTION';record['error']=repr(error)
  raise
 finally:
  try:
   record['sourceAfter']=full_source_check(mirror,manifest,run_id,True)
   record['nodeModulesAfter']=walk_meta(prod_deps,run_id)
   if (record['sourceAfter']['fileProofDigestSha256']!=source_before['fileProofDigestSha256'] or
       record['sourceAfter']['dependencyLink']!=source_before['dependencyLink'] or
       record['sourceAfter']['mirrorRootIdentity']!=source_before['mirrorRootIdentity'] or
       record['nodeModulesAfter']!=dep_before):
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
