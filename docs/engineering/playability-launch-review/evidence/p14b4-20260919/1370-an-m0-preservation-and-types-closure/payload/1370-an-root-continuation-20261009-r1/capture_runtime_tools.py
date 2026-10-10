import datetime,hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
expected={
 'python':('/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14',50472,'7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'),
 'node':('/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node',115440320,'0b4f059915f3bf3c6cbb02422f4a529bfb21cbbec2d29851c9a5d833f78a04f6')}
def ident(s):return [s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns]
rows={}
for name,(filename,size,wanted) in expected.items():
 p=Path(filename);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size==size and os.access(p,os.X_OK)
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW);h=hashlib.sha256();total=0
 try:
  assert ident(os.fstat(fd))==ident(s)
  while True:
   block=os.read(fd,1024*1024)
   if not block:break
   total+=len(block);assert total<=size;h.update(block)
  assert total==size and ident(os.fstat(fd))==ident(s)==ident(p.lstat()) and h.hexdigest()==wanted
 finally:os.close(fd)
 rows[name]={'physicalPath':str(p),'bytes':size,'sha256':h.hexdigest(),'beforeIdentity':ident(s),'afterIdentity':ident(p.lstat()),'executable':True}
assert str(Path(sys.executable).resolve(strict=True))==rows['python']['physicalPath']
d={'schema':'1370-an-actual-runtime-tool-file-observation/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'runtimeTools':rows,'runningPythonReportedPath':sys.executable,'runningPythonPhysicalPath':str(Path(sys.executable).resolve(strict=True)),'runningPythonVersion':list(sys.version_info[:3]),'scope':'Actual stable physical executable file observations. Python is this running interpreter; Node is hashed but not executed here. Actual Node version and nested loader identity remain required controller checks.','nodeExecutedHere':False,'executionAuthorization':False,'sourceOrGameAcceptance':False}
p=A/'RUNTIME-TOOLS.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);b=p.read_bytes();print(json.dumps({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}))
