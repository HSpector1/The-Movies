#!/usr/bin/env python3
"""Unrun fresh-HTTPS byte audit of stage37's exact 191-file evidence commit."""
import argparse,hashlib,json,os,pathlib,re,shutil,signal,stat,subprocess,time

S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
HERE=S/'1370-c0-stage37-remote-audit-proposal-r1'
SPEC=HERE/'SPEC.json'
OUT=S/'1370-c0-stage37-remote-audit-recorded-r1'
LANE='1370-c0-stage37-remote-audit-20261008-r1.lane.log'
TIP=None
PARENT='2a4ca902ca4390017238e9a6cc398697e25feaa8'
HEAD='f8c0628739227accfa446276b0613f47bc805a78'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
PREFIX='docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-stage/thirty-seventh-verification/'
SPEC_SHA=None
MAP_SHA='37e2421cf3de26224aa838fc21eb3c8a21c5ad646e2bfe96df4f5c0ebd62c203'
PUBLISH_RESULT_SHA=None
PUBLISH_OBSERVED=S/'1370-c0-stage37-publisher-independent-observed-review-r1/RECEIPT.json'
PUBLISH_OBSERVED_SHA='65417cf29d7aa870c57a14f1987c62d715153b698c518274e2ab9d6f43699f41'
FLOOR=3*1024**3
WALL=900
START=None
GIT_ENV={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}

def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(b):return hashlib.sha256(b).hexdigest()
def remaining():
 n=START+WALL-time.monotonic();need(n>1,'900-second deadline');return n
def guard():
 remaining()
 lock=S/'HEAVY-LANE-LOCK'
 need(lock.is_file() and not lock.is_symlink() and LANE in lock.read_text(),'recorded heavy lane')
 p=subprocess.run(['pmset','-g','batt'],capture_output=True,text=True,timeout=min(10,remaining()))
 need(p.returncode==0 and p.stdout.splitlines()[:1]==["Now drawing from 'AC Power'"],'AC power')
 need(shutil.disk_usage(S).free>=FLOOR,'3 GiB free-space floor')
def cmd(*args,cwd=None):
 guard()
 p=subprocess.run(args,cwd=cwd,capture_output=True,text=True,env=GIT_ENV,timeout=remaining())
 need(p.returncode==0,f'command failed {args!r}: {p.stderr[-1000:]}')
 return p.stdout.strip()
def pinned(path,digest,cap):
 for parent in path.parents:need(stat.S_ISDIR(parent.lstat().st_mode),'symlink control parent')
 before=path.lstat()
 need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap,'unsafe control')
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  opened=os.fstat(fd)
  fields=lambda v:(v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns)
  need(fields(before)==fields(opened),'control open drift')
  raw=os.read(fd,cap+1)
  need(fields(opened)==fields(os.fstat(fd))==fields(path.lstat()),'control read drift')
  need(len(raw)==before.st_size and sha(raw)==digest,'control SHA')
  return raw
 finally:os.close(fd)
def validate_spec(x):
 need(x.get('schema')=='1370-c0-stage37-fresh-https-remote-audit-spec-r1' and
      x.get('classification')=='PUBLISHED_REMOTE_BYTES_PENDING','wrong spec')
 for k,v in {'tip':TIP,'parent':PARENT,'sourceHead':HEAD,'sourceTree':TREE,'prefix':PREFIX,
             'remote':'https://github.com/HSpector1/The-Movies.git',
             'ref':'refs/heads/evidence/1370-r10-clean-captures',
             'branch':'evidence/1370-r10-clean-captures','mapSha256':MAP_SHA,
             'publicationResultSha256':PUBLISH_RESULT_SHA,'fileCount':191,
             'mappedSourceCount':183,'publicationControlCount':8,'totalBytes':4298338}.items():
  need(x.get(k)==v,f'wrong {k}')
 rows=x.get('files')
 need(isinstance(rows,list) and len(rows)==191 and
      [r['path'] for r in rows]==sorted(r['path'] for r in rows) and
      len({r['path'] for r in rows})==191,'wrong path roster')
 need(sum(r.get('bytes',-1) for r in rows)==4298338,'wrong total bytes')
 for r in rows:
  path=r.get('path');parts=pathlib.PurePosixPath(path).parts
  need(isinstance(path,str) and path.startswith(PREFIX) and '\\' not in path and
       '..' not in parts and '.' not in parts and
       pathlib.PurePosixPath(path).as_posix()==path,'unsafe path')
  need(isinstance(r.get('bytes'),int) and 0<=r['bytes']<100000000,'unsafe blob size')
  need(re.fullmatch(r'[0-9a-f]{64}',r.get('sha256','')) and
       re.fullmatch(r'[0-9a-f]{40}',r.get('gitBlob','')),'invalid hash')
 by={r['path'][len(PREFIX):]:r for r in rows}
 need(by['publication/SOURCE-MAP.json']['sha256']==MAP_SHA and
      by['1370-c0-m0-feasibility-hook-overlay-independent-route-stop-r8-r1/RECEIPT.json']['sha256']==
      'e4896f6ec384e7a59e6f7b7dee68d68a1e5d3c03c1f8b8acc7f63ec83a7d8359' and
      by['1370-c0-h-m0-corrected-overlay-source-manifest-independent-review-r2/H-RECEIPT.json']['sha256']==
      '5e6f23884af9527f991665020414404455f182cc3a62abe5a5602bb019804dbf' and
      by['1370-c0-h-m0-corrected-overlay-source-manifest-independent-review-r2/M0-RECEIPT.json']['sha256']==
      'bcd090ec6e8ef391aa7578dd9719f0adda67e8f38610396355ea0c8238549fa8',
      'key authority mismatch')
 return rows
def remote_blob(clone,commit,row):
 guard();path=row['path']
 oid=cmd('git','-C',str(clone),'rev-parse',f'{commit}:{path}')
 need(oid==row['gitBlob'],f'blob OID mismatch {path}')
 proc=subprocess.Popen(['git','-C',str(clone),'show',f'{commit}:{path}'],
                       stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=GIT_ENV)
 digest=hashlib.sha256();count=0
 try:
  while True:
   chunk=proc.stdout.read(1<<20)
   if not chunk:break
   count+=len(chunk);need(count<=row['bytes'],'remote blob too large')
   digest.update(chunk);guard()
  error=proc.stderr.read().decode(errors='replace')[-1000:]
  need(proc.wait(timeout=remaining())==0,f'remote blob read failed {path}: {error}')
 except BaseException:
  proc.kill();proc.wait();raise
 need(count==row['bytes'] and digest.hexdigest()==row['sha256'],f'remote bytes {path}')
 guard()
 return {'path':path,'bytes':count,'sha256':digest.hexdigest(),'gitBlob':oid}
def source_guard():
 need(cmd('git','rev-parse','HEAD',cwd=REPO)==HEAD and
      cmd('git','rev-parse','HEAD:src',cwd=REPO)==TREE and
      cmd('git','status','--porcelain=v1',cwd=REPO)=='','production source drift')
def main():
 global START,TIP,SPEC_SHA,PUBLISH_RESULT_SHA
 START=time.monotonic()
 signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('900-second remote audit deadline')))
 signal.setitimer(signal.ITIMER_REAL,WALL)
 parser=argparse.ArgumentParser()
 parser.add_argument('--tip',required=True)
 parser.add_argument('--spec-sha',required=True)
 parser.add_argument('--publisher-result-sha',required=True)
 args=parser.parse_args()
 need(re.fullmatch(r'[0-9a-f]{40}',args.tip) and
      re.fullmatch(r'[0-9a-f]{64}',args.spec_sha) and
      re.fullmatch(r'[0-9a-f]{64}',args.publisher_result_sha),'missing exact launch pins')
 TIP=args.tip;SPEC_SHA=args.spec_sha;PUBLISH_RESULT_SHA=args.publisher_result_sha
 spec=json.loads(pinned(SPEC,SPEC_SHA,1000000));rows=validate_spec(spec)
 pub=S/'1370-c0-stage37-publisher-proposal-r1/PUBLISH-RESULT.json'
 publication=json.loads(pinned(pub,PUBLISH_RESULT_SHA,100000))
 observed=json.loads(pinned(PUBLISH_OBSERVED,PUBLISH_OBSERVED_SHA,100000))
 need(publication['status']=='PUBLISHED_REMOTE_TIP_VERIFIED_REMOTE_BYTES_PENDING' and
      publication['commit']==TIP and publication['base']==PARENT and publication['fileCount']==191 and
      publication['mapSha256']==MAP_SHA and publication['productionHead']==HEAD and
      publication['sourceTree']==TREE and publication['remoteRef']==spec['ref'],
      'publication result mismatch')
 need(observed.get('decision')=='ACCEPT_OBSERVED_PUBLICATION_TIP_ONLY' and
      observed.get('tip')==TIP and observed.get('parent')==PARENT and
      observed.get('resultSha256')==PUBLISH_RESULT_SHA and observed.get('fileCount')==191 and
      observed.get('childExit')==0,'publication observed review mismatch')
 guard();source_guard();need(not os.path.lexists(OUT),'one-shot output exists')
 OUT.mkdir(mode=0o700)
 work=OUT/'fresh-https-clone'
 result={'schema':'1370-c0-stage37-fresh-https-remote-audit-result-r1',
         'status':'RUNNING','specSha256':SPEC_SHA,'remote':spec['remote'],
         'expectedCommit':TIP,'expectedParent':PARENT,'files':[]}
 failure=None
 try:
  advertised=cmd('git','ls-remote',spec['remote'],spec['ref'])
  need(advertised==TIP+'\t'+spec['ref'],'remote ref tip mismatch')
  cmd('git','clone','--no-checkout','--filter=blob:none','--depth=2','--single-branch',
      '--branch',spec['branch'],spec['remote'],str(work))
  need(not (work/'.git/objects/info/alternates').exists(),'clone uses alternates')
  need(cmd('git','-C',str(work),'remote','get-url','origin')==spec['remote'],'clone origin')
  need(cmd('git','-C',str(work),'rev-parse','HEAD')==TIP,'fresh tip')
  need(cmd('git','-C',str(work),'rev-parse','HEAD^')==PARENT,'direct parent')
  expected=[r['path'] for r in rows]
  delta=cmd('git','-C',str(work),'diff','--name-only',PARENT,TIP).splitlines()
  subtree=cmd('git','-C',str(work),'ls-tree','-r','--name-only',TIP,PREFIX).splitlines()
  need(delta==expected and subtree==expected,'191-path delta/subtree mismatch')
  for row in rows:result['files'].append(remote_blob(work,TIP,row))
  need(cmd('git','ls-remote',spec['remote'],spec['ref'])==advertised,'remote ref advanced')
  source_guard();guard()
  shutil.rmtree(work)
  need(not os.path.lexists(work),'clone cleanup incomplete')
  guard()
  result.update(status='ACCEPT_REMOTE_STAGE37_C0_EVIDENCE_BYTES_ONLY',remoteCommit=TIP,
                directParent=PARENT,fileCount=191,totalBytes=4298338,noAlternates=True,
                cloneCleanup='COMPLETE',elapsedSeconds=round(time.monotonic()-START,3))
 except BaseException as error:
  result.update(status='STOP_REMOTE_STAGE37_AUDIT',error=repr(error))
  failure=error
  if os.path.lexists(work):
   try:shutil.rmtree(work)
   except BaseException as cleanup_error:result['cleanupError']=repr(cleanup_error)
 receipt=OUT/'RECEIPT.json'
 with receipt.open('x') as handle:
  json.dump(result,handle,sort_keys=True,indent=2);handle.write('\n');handle.flush();os.fsync(handle.fileno())
 need(json.loads(receipt.read_text())==result,'receipt readback')
 signal.setitimer(signal.ITIMER_REAL,0)
 if failure is not None:raise RuntimeError('remote audit STOP; see receipt') from failure
 print(json.dumps({'decision':result['status'],'remoteCommit':TIP,'receiptSha256':sha(receipt.read_bytes())},sort_keys=True))
if __name__=='__main__':main()
