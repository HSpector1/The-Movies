#!/usr/bin/env python3
"""Read-only observed STOP audit for one recorded H r11 typecheck attempt."""
import hashlib,json,os,pathlib,shutil,stat,subprocess,time
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
HERE=S/'1370-c0-h-typecheck-r11-independent-observed-stop-audit-proposal-r1'
OUT=S/'1370-c0-h-typecheck-r11-independent-observed-stop-audit-results-r1/AUDIT.json'
RUN=S/'1370-c0-h-typecheck-collection-results-r11/20261008-h-types-r9'
MIRROR=S/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1'
PINS={
 S/'c0-h-types-20261008-h-types-r9.lane.log':'79f9eaaab17d28bcf1833aa72a93f8febf3f09e21e54116fd0c028faa705e8a7',
 S/'c0-h-types-20261008-h-types-r9.lane.log.meta':'42fcf04c191d69d0c7d7dc430ed88876ce56dec4f9c1050c10b6cec75a5d5815',
 S/'1370-c0-h-typecheck-collection-recorder-results-r3/20261008-h-types-r9.RECORDER-RESULT.json':'4677c6716660a584bc4e0cbe205a52b3398c6a4b6cec788a36322108da048290',
 RUN/'RESULT.json':'e701188970a432296f850369b5cc72dfd4ce1745692fc3154f7ed7c3d9a5e45c',
 S/'1370-c0-h-typecheck-collection-filled-exact-independent-review-r11-r3/RECEIPT.json':'c170c300898ad0b852ec1cb09837931749387b989a20ca5c87b4d5758001dd50',
 S/'1370-c0-h-typecheck-recorder-r3-independent-static-review-r1/RECEIPT.json':'14ac6279df85de332262d54e69726d185cdd4fe7806944d709350553998bbb6a',
 S/'1370-c0-h-typecheck-r11-source-independent-static-review-r1/RECEIPT.json':'5893c1dea2d14162cc6d666de0258ee8ebea7328f516aedc4cbcccc987acb5c1',
 S/'1370-c0-h-typecheck-recorder-r2-independent-static-review-r1/RECEIPT.json':'2d20cf6989abe6ae4960ce0fdbb312d83ea26497aca5f24af569d8e380199b49',
 S/'1370-c0-h-typecheck-r10-source-independent-static-review-r1/RECEIPT.json':'dcd6d7bc1315e5a3322b65b3b3de425b1ea8c92755adc452c74e69cd4aac0350',
 S/'1370-c0-h-typecheck-collection-independent-observed-stop-review-r9/RECEIPT.json':'4cffcd747b9b538631314997134561de143f4a7f0d45aaf0c577a893b4558db4',
 S/'1370-c0-h-typecheck-collection-runner-proposal-r11/runner.py':'83f4b7b07f68f8424824a6369a5e9425d423c0a6d10ef3581931a689c2c727e3',
 S/'1370-c0-h-typecheck-collection-recorder-proposal-r3/supervise.py':'6a138a6fd3b85f63da7618a589fa2e9f46b0dcd45bb5ba84346af0ce402b68d5'
}
HEAD='afea5fb6abba09bec6cada7e4c5a1ccfaf05caff'
SRC='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
EVIDENCE='6516532ac67ffcafc66fd424abb89bc1bc0acc2e'
ORIGIN='https://github.com/HSpector1/The-Movies.git'
FREE_FLOOR=3*1024**3
START=time.monotonic()
def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def guard():
 need(time.monotonic()-START<180,'STOP audit deadline')
 need(shutil.disk_usage(S).free>=FREE_FLOOR,'STOP audit disk floor')
 need(not os.path.lexists(S/'HEAVY-LANE-LOCK'),'STOP audit requires free heavy lane')
 p=subprocess.run(['pmset','-g','batt'],capture_output=True,timeout=10)
 need(p.returncode==0 and p.stdout.splitlines()[:1]==[b"Now drawing from 'AC Power'"],'STOP audit AC')
def attrs(v):return v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns
def read(path,cap,pin=None):
 need(path.is_absolute(),'absolute path')
 held=[os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)]
 try:
  for name in path.parts[1:-1]:
   a=os.stat(name,dir_fd=held[-1],follow_symlinks=False)
   fd=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=held[-1])
   need(stat.S_ISDIR(a.st_mode) and (a.st_dev,a.st_ino,a.st_mode)==(os.fstat(fd).st_dev,os.fstat(fd).st_ino,os.fstat(fd).st_mode),'parent drift')
   held.append(fd)
  p=held[-1];a=os.stat(path.name,dir_fd=p,follow_symlinks=False)
  need(stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=cap,'input size/type')
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=p)
  try:
   need(attrs(a)==attrs(os.fstat(fd)),'input open drift')
   buf=bytearray()
   while part:=os.read(fd,65536):
    need(time.monotonic()-START<180,'STOP audit deadline')
    buf.extend(part);need(len(buf)<=a.st_size and len(buf)<=cap,'input growth')
   need(len(buf)==a.st_size and attrs(a)==attrs(os.fstat(fd))==attrs(os.stat(path.name,dir_fd=p,follow_symlinks=False)),'input changed')
  finally:os.close(fd)
  for parent,child,name in zip(held,held[1:],path.parts[1:-1]):
   a=os.fstat(child);b=os.stat(name,dir_fd=parent,follow_symlinks=False)
   need((a.st_dev,a.st_ino,a.st_mode)==(b.st_dev,b.st_ino,b.st_mode),'parent pathname drift')
  raw=bytes(buf);digest=hashlib.sha256(raw).hexdigest()
  if pin is not None:need(digest==pin,'input SHA '+str(path))
  return raw,digest
 finally:
  for fd in reversed(held):os.close(fd)
def git(*args):
 env={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
 p=subprocess.run(['git',*args],cwd=R,env=env,capture_output=True,timeout=15)
 need(p.returncode==0 and len(p.stdout)<2*1024**2 and len(p.stderr)<2*1024**2,'Git guard failure')
 return p.stdout.strip().decode()
def refs():
 need(git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')==SRC and git('status','--porcelain=v1')=='','production identity')
 need(git('remote','get-url','origin')==ORIGIN and git('config','--get','remote.origin.url')==ORIGIN,'origin')
 for ref,oid in [('refs/heads/wip/headless-program-20260916-ts',HEAD),('refs/heads/evidence/1370-r10-clean-captures',EVIDENCE)]:
  need(git('rev-parse',ref)==oid and git('ls-remote','origin',ref)==oid+'\t'+ref,'local/remote ref')
def write(row):
 raw=(json.dumps(row,sort_keys=True,indent=2)+'\n').encode();need(len(raw)<128*1024,'STOP receipt cap')
 need(not os.path.lexists(OUT),'STOP receipt collision')
 OUT.parent.mkdir(mode=0o700,parents=True,exist_ok=True)
 parent=os.open(OUT.parent,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:
  need(not os.path.lexists(OUT),'STOP receipt collision')
  fd=os.open(OUT.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
  try:os.write(fd,raw);os.fsync(fd)
  finally:os.close(fd)
  os.fsync(parent)
 finally:os.close(parent)
 got,digest=read(OUT,128*1024);need(got==raw,'STOP receipt readback')
 return digest
def main():
 guard();refs()
 inputs={str(p):read(p,128*1024 if p.suffix=='.json' or p.name=='runner.py' else 250*1024,pin)[1] for p,pin in PINS.items()}
 lane=PINS.keys();log=next(p for p in lane if p.name.endswith('.lane.log'))
 meta=pathlib.Path(str(log)+'.meta')
 lane_raw=read(log,2000,PINS[log])[0];meta_raw=read(meta,10000,PINS[meta])[0]
 lines=meta_raw.splitlines();terminal=[x for x in lines if x.startswith(b'end, exit ')]
 need(len(terminal)==1 and lines[-1]==terminal[0] and terminal[0].startswith(b'end, exit 1; '),'recorded child exit1')
 recorder=json.loads(read(RECORDER,10000,PINS[RECORDER])[0]);runner=json.loads(read(RUN/'RESULT.json',128*1024,PINS[RUN/'RESULT.json'])[0])
 need(recorder['schema']=='1370-c0-h-typecheck-collection-recorder-result-r3' and recorder['status']=='STOP_CHILD_NONZERO' and recorder['childExit']==1 and recorder['groupClear'] is True,'recorder STOP identity')
 need(recorder['sourceDeadlineSeconds']==300 and recorder['recorderActiveSeconds']==320 and recorder['recorderWholeSeconds']==330 and recorder['elapsedSeconds']<330,'recorded bounds')
 need(runner['schema']=='1370-c0-h-typecheck-collection-result-r11' and runner['status']=='STOP_TYPECHECK_COLLECTION' and runner['runId']=='20261008-h-types-r9' and runner['arm']=='H','runner STOP identity')
 need(runner['error']=="PermissionError(1, 'Operation not permitted')" and runner['elapsedSeconds']<300,'runner STOP error/bound')
 need([x['name'] for x in runner['children']]==['dependency-versions'] and runner['children'][0]['exit']==0,'only dependency child completed')
 need([x['name'] for x in runner['rootChildBoundaries']]==['dependency-versions','root-tsc'] and runner['rootChildBoundaries'][1]['childError']==runner['error'],'root-tsc childError')
 for row in runner['rootChildBoundaries']:
  need(row['before']==row['after'] and row['before']['identity']==[16777220,166418911,16832,13,416,1791456989842583410,1791456989842583410],'recorded root checkpoint continuity')
 need(runner['sourceBefore']==runner['sourceAfter'] and runner['sourceBefore']['fileProofDigestSha256']=='1534ca888a99c1f41e3eb2a7201d6d6d56f1343bab3f4040518348cc34d276b4' and runner['sourceBefore']['mirrorFiles']==1402 and runner['sourceBefore']['mirrorBytes']==99516095,'recorded source proof continuity')
 need(runner['nodeModulesBefore']==runner['nodeModulesAfter'],'recorded dependency proof continuity')
 need(b'"status": "STOP_TYPECHECK_COLLECTION"' in lane_raw and b'"recorderStatus": "STOP_CHILD_NONZERO"' in lane_raw,'lane printed STOP identities')
 sidecars={}
 for name in ('dependency-versions.stdout','dependency-versions.stderr','root-tsc.stdout','root-tsc.stderr'):
  raw,digest=read(RUN/name,8*1024**2);sidecars[name]={'bytes':len(raw),'sha256':digest}
  if name.startswith('dependency-versions'):
   key=name.split('.')[1];need(digest==runner['children'][0][key+'Sha256'] and len(raw)==runner['children'][0][key+'Bytes'],'completed child sidecar')
 need(not os.path.lexists(RUN/'collection.json') and not os.path.lexists(RUN/'preimage-output'),'no collection result')
 mirror_stat=MIRROR.lstat();need(list(attrs(mirror_stat))==runner['sourceAfter']['mirrorRootIdentity'],'mirror root tuple now')
 ps=subprocess.run(['/bin/ps','-axo','pid=,pgid=,stat='],capture_output=True,text=True,timeout=10,check=True)
 need(not [x for x in ps.stdout.splitlines() if len(x.split())>=3 and x.split()[1]==str(recorder['childPid'])],'no recorded child group member')
 guard();refs()
 row={'schema':'1370-c0-h-typecheck-r11-independent-observed-stop-audit-r1','decision':'ACCEPT_OBSERVED_STOP_H_TYPECHECK_COLLECTION_R11_ONLY',
      'runId':'20261008-h-types-r9','firstFailure':'root-tsc child raised PermissionError(1); compile result unobserved',
      'recordedChildExit':1,'groupClear':True,'runnerStatus':runner['status'],'recorderStatus':recorder['status'],
      'sourceProofClaim':'RECORDED_EQUAL_BEFORE_AFTER_PLUS_CURRENT_ROOT_TUPLE_ONLY; no independent full mirror re-read',
      'inputsSha256':inputs,'sidecars':sidecars,'productionHead':HEAD,'productionSourceTree':SRC,'evidenceTip':EVIDENCE,
      'priorR9StopPreserved':PINS[S/'1370-c0-h-typecheck-collection-independent-observed-stop-review-r9/RECEIPT.json'],
      'r10RefinePreserved':PINS[S/'1370-c0-h-typecheck-r10-source-independent-static-review-r1/RECEIPT.json'],
      'recorderR2RefinePreserved':PINS[S/'1370-c0-h-typecheck-recorder-r2-independent-static-review-r1/RECEIPT.json'],
      'claimLimit':'No full-era type pass, no diagnostic collection, no C0 neutrality, no 416-tick run, no 1363 or main acceptance'}
 print(json.dumps({'auditSha256':write(row),'decision':row['decision']}))
if __name__=='__main__':main()
