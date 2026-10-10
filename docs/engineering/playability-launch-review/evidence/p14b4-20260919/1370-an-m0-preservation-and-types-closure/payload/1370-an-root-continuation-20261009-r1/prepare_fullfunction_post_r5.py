import difflib,hashlib,json,os
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');B=S/'1370-an-fullfunction-shared-fullpostflight-source-20261010-r4';Q=S/'1370-an-fullfunction-shared-fullpostflight-source-20261010-r5'
assert hashlib.sha256((B/'SOURCE-PINS.json').read_bytes()).hexdigest()=='f98fcdbffe35eab67ebd18e3da43cafc91b4b719f6831166c5a58cce4f76ad36';Q.mkdir(mode=0o700)
def put(n,v):
 p=Q/n
 with p.open('x') as f:f.write(v);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
files={};changes=[('1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r2','1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r3'),('postflight-fullfunction-qualification-r2','postflight-fullfunction-qualification-r3')]
for n in ('launch-fullpostflight.py','read-fullpostflight.py'):
 old=(B/n).read_text();new=old
 for a,b in changes:
  assert new.count(a)==1;new=new.replace(a,b)
 restored=new
 for a,b in reversed(changes):restored=restored.replace(b,a)
 assert restored==old;compile(new,str(Q/n),'exec');files[n]=put(n,new);files['BASE-r4-'+n]=put('BASE-r4-'+n,old)
 for suffix,a,b in [('forward.diff',old,new),('inverse.diff',new,old)]:files[n+'.'+suffix]=put(n+'.'+suffix,''.join(difflib.unified_diff(a.splitlines(True),b.splitlines(True),fromfile='before',tofile='after')))
files['SOURCE-PROOF.json']=put('SOURCE-PROOF.json',json.dumps({'schema':'1370-shared-fullpost-path-only-source-proof/v1','baseManifestPath':str(B/'SOURCE-PINS.json'),'baseManifestSha256':'f98fcdbffe35eab67ebd18e3da43cafc91b4b719f6831166c5a58cce4f76ad36','changes':changes,'wholeInversesExact':True,'allOtherBytesUnchanged':True,'actualRouteReadback':None,'executionAuthorization':False},sort_keys=True,indent=2)+'\n')
print(json.dumps(put('SOURCE-PINS.json',json.dumps({'schema':'1370-fullfunction-shared-fullpostflight-source-pins/v1','files':files,'executionAuthorization':False},sort_keys=True,indent=2)+'\n')))
