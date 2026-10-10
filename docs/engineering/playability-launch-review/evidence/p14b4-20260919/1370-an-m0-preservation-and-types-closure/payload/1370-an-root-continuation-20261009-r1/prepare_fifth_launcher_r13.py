import ast,hashlib,json,os
from pathlib import Path
A=Path(__file__).parent
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
old=A/'run_fullfunction_fifth_once.py';r=role(old)
assert r['bytes']==6400 and r['sha256']=='50670f38f20f78e9ace2a7364e598c1938698fd63b8f02ccef4e23a58d2a3c9c'
before=old.read_text();after=before
changes=[('1370-an-m0-fullfunction-qualification-source-20261010-r12','1370-an-m0-fullfunction-qualification-source-20261010-r13'),('79d9400a49dc02abc836d9e3b9e9f4a814966da47cae67293f299b1993deb283','5eb4371205271d8ae2b88d6c4dd2f7f20057b8ae30430fd8905e1ed3816d98d3')]
for oldvalue,newvalue in changes:
 assert after.count(oldvalue)==1 and newvalue not in after
 after=after.replace(oldvalue,newvalue)
inverse=after
for oldvalue,newvalue in reversed(changes):inverse=inverse.replace(newvalue,oldvalue)
assert inverse==before
compile(after,'run_fullfunction_fifth_once_r2.py','exec')
p=A/'run_fullfunction_fifth_once_r2.py'
with p.open('x') as f:f.write(after);f.flush();os.fsync(f.fileno())
p.chmod(0o444)
v={'schema':'1370-root-r5-launcher-r13-binding-correction/v1','predecessor':r,'candidate':role(p),'exactSingleSubstitutions':changes,'completeInverseRestoresPredecessor':True,'compileOnly':True,'runtimeExecuted':False,'sourceOnly':True,'preservedHeldR12Launcher':True}
d=A/'FULLFUNCTION-R5-ROOT-LAUNCHER-R13-DELTA.json'
with d.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
d.chmod(0o444);print(json.dumps({'launcher':role(p),'delta':role(d)}))
