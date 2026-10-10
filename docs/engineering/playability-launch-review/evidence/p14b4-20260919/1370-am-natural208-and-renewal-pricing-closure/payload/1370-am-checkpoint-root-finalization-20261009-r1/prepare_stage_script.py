import hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).parent
p=S/'1370-al-checkpoint-root-finalization-20261009-r2/stage_and_verify.py';old=p.read_text();new=old
changes=[
 ('1370-al-owned-cleanup-repair-and-a208-control-completion','1370-am-natural208-and-renewal-pricing-closure'),
 ('1370-AL-owned-cleanup-repair-and-a208-control-completion.md','1370-AM-natural208-and-renewal-pricing-closure.md'),
 ("HEAD='372d15e1ae53b898be2cf633a6bb8bb0058cb01f'","HEAD='8cb704e2f18e6a635943893422c9cfdc206e106d'"),
 ("manifest['summary']['roles']==483 and manifest['summary']['localHashSizeOnlyRoles']==2","manifest['summary']['roles']==len(manifest['files']) and manifest['summary']['localHashSizeOnlyRoles']==41"),
 ('len(paths)==len(set(paths))==393','len(paths)==len(set(paths)) and len(paths)>5')]
for before,after in changes:
 assert new.count(before)==1;new=new.replace(before,after)
inverse=new
for before,after in reversed(changes):
 assert inverse.count(after)==1;inverse=inverse.replace(after,before)
assert inverse==old
import ast
ast.parse(new)
out=D/'stage_and_verify.py'
with out.open('x') as f:f.write(new);f.flush();os.fsync(f.fileno())
out.chmod(0o444)
print(json.dumps({'path':str(out),'bytes':len(new.encode()),'sha256':hashlib.sha256(new.encode()).hexdigest(),'wholeInverseExact':True,'executed':False}))
