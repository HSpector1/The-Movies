"""Finite source artifact byte/hash readback only. Never imports candidate code or traverses a repository."""
import hashlib,json,os,pathlib,stat,sys
spec=json.loads(pathlib.Path(sys.argv[1]).read_bytes())
assert set(spec)=={'paths','output'} and type(spec['paths']) is list
roles={}
for text in spec['paths']:
 p=pathlib.Path(text);assert p.is_absolute() and str(p).startswith('/Users/zacheryspector/studio-scratch/') and p.resolve(strict=True)==p
 before=p.lstat();assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<2*1024*1024
 raw=p.read_bytes();after=p.lstat()
 attrs=lambda s:(s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
 assert attrs(before)==attrs(after) and len(raw)==before.st_size
 roles[p.name]={'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
out=pathlib.Path(spec['output']);assert str(out).startswith('/Users/zacheryspector/studio-scratch/')
with out.open('x') as f:json.dump({'schema':'1370-finite-retained-source-bytes-readback/v1','roles':roles,'candidateImported':False,'privateInventory':False},f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
print(json.dumps({'path':str(out),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
