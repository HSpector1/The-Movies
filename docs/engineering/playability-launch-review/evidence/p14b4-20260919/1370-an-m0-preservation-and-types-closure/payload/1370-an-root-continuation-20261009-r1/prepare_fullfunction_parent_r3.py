import ast,difflib,hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');B=S/'1370-an-m0-fullfunction-parent-source-20261010-r2/launch-fullfunction.py';Q=S/'1370-an-m0-fullfunction-parent-source-20261010-r3'
old=B.read_text();assert hashlib.sha256(old.encode()).hexdigest()=='eb09e8a20b7ee6039c059108c11262cc9a01130a90e2f1fd39646b1b68b93180'
a='1370-an-m0-fullfunction-parent-recorded-20261010-r2';b='1370-an-m0-fullfunction-parent-recorded-20261010-r3';assert old.count(a)==1
new=old.replace(a,b);assert new.replace(b,a)==old;compile(new,str(Q/'launch-fullfunction.py'),'exec');Q.mkdir(mode=0o700)
def put(n,v):
 p=Q/n
 with p.open('x') as f:f.write(v);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);raw=p.read_bytes();return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
files={'launch-fullfunction.py':put('launch-fullfunction.py',new),'BASE-r2-parent.py.txt':put('BASE-r2-parent.py.txt',old)}
for name,x,y in [('forward.diff',old,new),('inverse.diff',new,old)]:files[name]=put(name,''.join(difflib.unified_diff(x.splitlines(True),y.splitlines(True),fromfile='before',tofile='after')))
proof={'schema':'1370-fullfunction-parent-r3-path-only-source-proof/v1','sourceOnly':True,'executionAuthorization':False,'baseSource':{'path':str(B),'bytes':len(old.encode()),'sha256':hashlib.sha256(old.encode()).hexdigest()},'change':{'before':a,'after':b,'occurrences':1},'wholeInverseExact':True,'allHelpersAndClocksAndRoleChecksUnchanged':True}
files['SOURCE-PROOF.json']=put('SOURCE-PROOF.json',json.dumps(proof,sort_keys=True,indent=2)+'\n');print(json.dumps(put('SOURCE-PINS.json',json.dumps({'schema':'1370-fullfunction-parent-source-pins/v1','files':files,'executionAuthorization':False},sort_keys=True,indent=2)+'\n')))
