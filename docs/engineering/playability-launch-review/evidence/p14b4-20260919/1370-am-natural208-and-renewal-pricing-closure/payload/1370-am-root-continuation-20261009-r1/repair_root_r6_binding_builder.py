import hashlib,json,os
from pathlib import Path
A=Path('/Users/zacheryspector/studio-scratch/1370-am-root-continuation-20261009-r1')
old=A/'prepare_root_r6_routes.py';b=old.read_text()
before='("mode in (\'proof\',\'types\')","mode==\'types\'")'
after='("assert mode in (\'proof\',\'types\')","assert mode==\'types\'")'
assert b.count(before)==1
p=A/'prepare_root_r6_routes_r2.py'
with p.open('x') as f:f.write(b.replace(before,after,1));f.flush();os.fsync(f.fileno())
p.chmod(0o444)
d={'schema':'1370-root-source-binding-builder-preparation-stop/v1','status':'PRESERVED_PARENT_SOURCE_PREPARATION_STOP_ONLY','actualToolChunk':'92a396','actualToolExit':1,'failure':'Inverse assertion found two occurrences of the broad replacement mode==types because the original already has an if mode==types branch. The first derivative was not written.','firstDerivativeWritten':False,'runtimeGrantIssued':False,'actualR6TypeRun':False,'originalBuilderSha256':hashlib.sha256(old.read_bytes()).hexdigest(),'freshBuilderPath':str(p),'freshBuilderSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'repair':'Restrict replacement to the assert mode expression, preserving the preexisting conditional and exact inverse.'}
out=A/'M0-R6-ROOT-BINDING-PREPARATION-R1-STOP.json'
with out.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
out.chmod(0o444)
print(json.dumps({'freshBuilder':str(p),'stop':str(out)}))
