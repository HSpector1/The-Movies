from pathlib import Path
import os,stat,subprocess,json,time,sys
A=Path('/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012');R=Path('/Users/zacheryspector/The-Movies-headless-program');UID=os.getuid()
TARGETS=[('/Users/zacheryspector/.npm/_cacache','regenerable npm package download cache'),('/Users/zacheryspector/Library/Caches/Google/Chrome','regenerable browser HTTP/code cache after normal Chrome quit')]
INVENTORY=A/'P16-R12-CACHE-TARGETS.LOCAL.json';RECEIPT=A/'P16-R12-CACHE-RECEIPT.json'
def free():return int(subprocess.check_output(['df','-Pk',str(R)],text=True).splitlines()[1].split()[3])
def quiet():
 assert not os.path.lexists(A.parent/'HEAVY-LANE-LOCK'),'recorded lane active'
 ancestors=set();pid=os.getpid()
 while pid>1:
  ancestors.add(pid);pid=int(subprocess.check_output(['ps','-p',str(pid),'-o','ppid='],text=True).strip())
 blocked=[]
 for line in subprocess.check_output(['ps','-axo','pid=,args='],text=True).splitlines():
  bits=line.strip().split(None,1)
  if len(bits)<2 or int(bits[0]) in ancestors:continue
  pid,args=bits
  if args.startswith(('npm ci','npm install','npm run','pnpm ','yarn ')) or any(x in args for x in ['node_modules/typescript/bin/tsc','node_modules/vitest','next build','vite build','scripts/install-ci.mjs','scripts/install-dependencies.mjs','Google Chrome.app/Contents/MacOS/Google Chrome']):blocked.append(dict(pid=int(pid),command=args))
 assert not blocked,'active writer/application: '+json.dumps(blocked)
def literal(p):
 for q in [p,*p.parents]:assert not q.is_symlink(),'symlink path: '+str(q)
def snapshot(p):
 s=p.lstat();return dict(path=str(p),uid=s.st_uid,dev=s.st_dev,ino=s.st_ino,mode=s.st_mode,nlink=s.st_nlink,size=s.st_size,mtimeNs=s.st_mtime_ns,allocated=s.st_blocks*512)
def open_check(p):
 r=subprocess.run(['lsof','-nP','+D',str(p)],text=True,capture_output=True)
 assert r.returncode==1 and not r.stdout.strip() and not r.stderr.strip(),'open/ambiguous cache handles: '+str(p)
def inspect():
 quiet();data=dict(atEpoch=time.time(),beforeFreeKiB=free(),uid=UID,targets=[],protected='All project work, dependencies, Git, sessions, user documents and archives preserved; no symlink traversal',normalCommandChoice='Earlier npm cache clean failed on root-owned remnants; only verified owned regular cache files eligible; no escalation')
 for name,purpose in TARGETS:
  p=Path(name);literal(p);top=snapshot(p);assert stat.S_ISDIR(top['mode']) and top['uid']==UID
  files=[];dirs=[];skips=[];stack=[p]
  while stack:
   d=stack.pop()
   try:items=list(os.scandir(d))
   except PermissionError:skips.append(dict(path=str(d),reason='permission denied'));continue
   dirs.append(snapshot(d))
   for item in items:
    q=Path(item.path);v=snapshot(q)
    if stat.S_ISLNK(v['mode']):skips.append(dict(path=str(q),reason='symlink skipped'));continue
    if v['uid']!=UID:skips.append(dict(path=str(q),reason='not user owned',uid=v['uid']));continue
    if stat.S_ISDIR(v['mode']):stack.append(q)
    elif stat.S_ISREG(v['mode']) and v['nlink']==1:files.append(v)
    else:skips.append(dict(path=str(q),reason='nonregular or multiply linked'))
  open_check(p);quiet();data['targets'].append(dict(path=name,purpose=purpose,ownerUid=UID,root=top,files=files,dirs=dirs,skipped=skips,estimatedAllocatedBytes=sum(x['allocated'] for x in files),openHandles='none; lsof exit1 empty stdout/stderr'))
 with INVENTORY.open('x') as f:json.dump(data,f,indent=2)
 print(json.dumps(dict(beforeFreeKiB=data['beforeFreeKiB'],targets=[{k:v for k,v in x.items() if k not in ['files','dirs','root']}|dict(fileCount=len(x['files'])) for x in data['targets']])))
def clean():
 assert not RECEIPT.exists();data=json.loads(INVENTORY.read_text());quiet();receipt=dict(atEpoch=time.time(),reason='Actual R12 runtime floor97 after independent reconciliation; writers finished; literal disposable caches only',beforeFreeKiB=free(),targets=[],protectedItemsPreserved=data['protected'],normalMaintenanceChoice=data['normalCommandChoice'],symlinksFollowed=False)
 try:
  for target in data['targets']:
   if free()>=5242880:break
   p=Path(target['path']);assert (str(p),target['purpose']) in TARGETS;literal(p);quiet();open_check(p)
   top=snapshot(p);assert all(top[k]==target['root'][k] for k in ['uid','dev','ino','mode'])
   row=dict(path=str(p),purpose=target['purpose'],ownerUid=UID,estimatedAllocatedBytes=target['estimatedAllocatedBytes'],beforeFreeKiB=free(),removedFiles=0,removedEstimatedAllocatedBytes=0,skipped=target['skipped'],openHandles=target['openHandles']);receipt['targets'].append(row)
   for old in target['files']:
    if row['removedFiles']%100==0:
     quiet()
     if free()>=5242880:break
    q=Path(old['path']);assert q.is_relative_to(p);literal(q)
    try:
     now=snapshot(q)
     if now!=old:row['skipped'].append(dict(path=str(q),reason='changed since inspection'));continue
     fd=os.open(str(q.parent),os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
     try:
      final=os.stat(q.name,dir_fd=fd,follow_symlinks=False)
      assert final.st_uid==UID and final.st_ino==old['ino'] and final.st_dev==old['dev'] and final.st_nlink==1 and stat.S_ISREG(final.st_mode)
      os.unlink(q.name,dir_fd=fd)
     finally:os.close(fd)
     row['removedFiles']+=1;row['removedEstimatedAllocatedBytes']+=old['allocated']
    except (PermissionError,FileNotFoundError) as e:row['skipped'].append(dict(path=str(q),reason=type(e).__name__))
   row['afterFreeKiB']=free();row['actualNetRecoveredKiB']=row['afterFreeKiB']-row['beforeFreeKiB']
 finally:
  receipt['afterFreeKiB']=free();receipt['actualNetRecoveredKiB']=receipt['afterFreeKiB']-receipt['beforeFreeKiB'];receipt['remainingLaunchShortfallKiB']=max(0,3670016-receipt['afterFreeKiB']);receipt['targetShortfallKiB']=max(0,5242880-receipt['afterFreeKiB'])
  with RECEIPT.open('x') as f:json.dump(receipt,f,indent=2)
  print(json.dumps(receipt))
if sys.argv[1]=='inspect':inspect()
elif sys.argv[1]=='clean':clean()
else:raise SystemExit('inspect or clean only')
