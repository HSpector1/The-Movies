import hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent;S=A.parent
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();q=p.lstat();assert (s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_ctime_ns)==(q.st_dev,q.st_ino,q.st_size,q.st_mtime_ns,q.st_ctime_ns)
 return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
v={'schema':'1370-root-pure-lossless-runtime-tools/v1','scope':'Named public tools only; physical readback, no compiler invocation or game import.','game':False,'executionAuthorization':False}
spec={
 'python':('/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14',50472,'7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'),
 'node':('/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node',115440320,'0b4f059915f3bf3c6cbb02422f4a529bfb21cbbec2d29851c9a5d833f78a04f6'),
 'helper':(str(S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh'),3361,'aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e'),
 'typescript':('/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/lib/typescript.js',9112572,'3ae902c92cc44dace175c0e69e13a4b0899f6983c6121d76b9ab8dd5795e7675')}
for k,(p,n,h) in spec.items():
 v[k]=role(p);assert v[k]['bytes']==n and v[k]['sha256']==h
v['typescriptPackage']=role('/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/package.json')
v['typescriptVersion']=json.loads(Path(v['typescriptPackage']['path']).read_bytes())['version'];assert v['typescriptVersion']=='5.9.3'
p=A/'LOSSLESS-CONTROLS-RUNTIME-TOOLS.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
