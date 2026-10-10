import hashlib,json,os,stat,time
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';REPO=Path('/Users/zacheryspector/The-Movies-headless-program')
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def norm(s):return [s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns]
historical=S/'1370-c0-m0-additive-complete-parent-adoption-after-aj-20261009-r1/ADOPTION.json';assert role(historical)['sha256']=='4711b938d126a0eea67d1c81c8bb47467690cb949c3e3ff731bf646608eb34ad';ad=json.loads(historical.read_bytes());assert ad['status']=='ROOT_ADOPTED_OBSERVED_M0_ADDITIVE_WITH_FULL_PROTECTION'
start=time.monotonic()
def capture(invoked):
 p=Path(invoked);assert p.is_absolute();pending=list(p.parts[1:]);cur=Path('/');links=[]
 while pending:
  name=pending.pop(0)
  if name in ('','.'):continue
  if name=='..':cur=cur.parent;continue
  probe=cur/name;st=probe.lstat()
  if stat.S_ISLNK(st.st_mode):
   target=os.readlink(probe);assert norm(st)==norm(probe.lstat());links.append({'path':str(probe),'identity':norm(st),'target':target});assert len(links)<=40
   t=Path(target)
   if t.is_absolute():cur=Path('/');pending=list(t.parts[1:])+pending
   else:pending=list(t.parts)+pending
  else:cur=probe
 physical=cur;assert p.resolve(strict=True)==physical and physical.resolve(strict=True)==physical
 before=physical.lstat();assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and 0<before.st_size<=128*1024*1024
 fd=os.open(physical,os.O_RDONLY|os.O_NOFOLLOW);h=hashlib.sha256();size=0
 try:
  assert norm(os.fstat(fd))==norm(before)
  while True:
   b=os.read(fd,65536)
   if not b:break
   h.update(b);size+=len(b);assert size<=before.st_size
  assert size==before.st_size and norm(os.fstat(fd))==norm(before)==norm(physical.lstat())
 finally:os.close(fd)
 for r in links:assert norm(Path(r['path']).lstat())==r['identity'] and os.readlink(r['path'])==r['target']
 assert p.resolve(strict=True)==physical
 return {'invokedPath':str(p),'physicalPath':str(physical),'bytes':size,'sha256':h.hexdigest(),'physicalIdentity':norm(before),'links':links}
node=capture('/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node');python=capture('/usr/local/bin/python3');compiler=capture(REPO/'node_modules/.bin'/('t'+'sc'));collector=capture(REPO/'node_modules/.bin'/('vi'+'test'))
assert node['sha256']=='0b4f059915f3bf3c6cbb02422f4a529bfb21cbbec2d29851c9a5d833f78a04f6' and python['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
d={'schema':'1370-root-current-m0-runtime-tools-observation/v1','historicalCopyAdmission':role(historical),'captureSource':role(Path(__file__)),'elapsedSeconds':time.monotonic()-start,'runtimeTools':{'node':node,'python':python,'rootCompilerWrapper':compiler,'uiCompilerWrapper':compiler,'collectionWrapper':collector},'privateM0MirrorRead':False,'executionAuthorization':False}
p=A/'M0-RUNTIME-TOOLS.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)));print(json.dumps({'tools':{k:{'physicalPath':v['physicalPath'],'bytes':v['bytes'],'sha256':v['sha256'],'links':len(v['links'])} for k,v in d['runtimeTools'].items()}}))
