import hashlib,json,os,stat
from pathlib import Path
A=Path(__file__).parent
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size<128*1024**2
 h=hashlib.sha256();n=0
 with p.open('rb') as f:
  for x in iter(lambda:f.read(65536),b''):n+=len(x);h.update(x)
 t=p.lstat();assert (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)==(t.st_dev,t.st_ino,t.st_mode,t.st_nlink,t.st_size,t.st_mtime_ns,t.st_ctime_ns)
 return {'path':str(p),'bytes':n,'sha256':h.hexdigest()}
op=A/'M0-RUNTIME-TOOLS.json';obsrole=role(op);assert obsrole['sha256']=='a681efc4a9b29dfc62bffb6c1e7cd434107bfb1064769f712fca48227bd64106';v=json.loads(op.read_bytes())
rt={}
for key,original in [('python','python'),('node','node'),('vitestEntry','collectionWrapper')]:
 x=v['runtimeTools'][original];r=role(x['physicalPath']);assert r=={'path':x['physicalPath'],'bytes':x['bytes'],'sha256':x['sha256']};rt[key]=r
package=Path(rt['vitestEntry']['path']).parent/'package.json';rt['vitestPackage']=role(package);version=json.loads(package.read_bytes())['version'];assert version=='2.1.9'
out={'schema':'1370-root-fullfunction-runtime-tools-observation/v1','runtimeTools':rt,'priorAuthenticToolsObservation':obsrole,'vitestVersion':version,'compilerOrGameExecuted':False,'privateM0Read':False,'executionAuthorization':False,'scope':'Physical public tool rehash and literal package version only; not a runtime test.'}
p=A/'FULLFUNCTION-RUNTIME-TOOLS.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
