import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
def role(p):
 p=Path(p);s=p.lstat();assert stat.S_ISREG(s.st_mode) and s.st_nlink==1 and p.resolve()==p
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,b):
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
base=S/'1370-an-root-continuation-20261009-r1/read_current_fullpreflight.py';old=base.read_bytes();new=old
changes=[
 (b'1370-an-current-am-fullpreflight-parent-recorded-20261009-r1',b'1370-ao-current-an-fullpreflight-parent-recorded-20261010-r1'),
 (b'1370-an-current-operational-fullguard-source-20261009-r1',b'1370-ao-current-operational-fullguard-source-20261010-r1'),
 (b'before-fill-current-am-r1',b'before-fill-current-an-r1'),
 (b'7087f116cf998fd86e33fb8e004df628e0686dbd',b'0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4'),
 (b'1370-an-fullpreflight-owned-absence/v1',b'1370-ao-fullpreflight-owned-absence/v1'),
 (b'1370-an-fullpreflight-raw-local-only/v1',b'1370-ao-fullpreflight-raw-local-only/v1'),
 (b'1370-an-current-am-fullpreflight-readback/v1',b'1370-ao-current-an-fullpreflight-readback/v1'),
 (b'ACTUAL_CURRENT_AM_FULL_PREFLIGHT_COMPLETE_UNADOPTED',b'ACTUAL_CURRENT_AN_FULL_PREFLIGHT_COMPLETE_UNADOPTED'),
]
for x,y in changes:assert new.count(x)>=1 and y not in new;new=new.replace(x,y)
inverse=new
for x,y in reversed(changes):inverse=inverse.replace(y,x)
assert inverse==old;compile(new,str(A/'read_current_fullpreflight.py'),'exec')
out=put(A/'read_current_fullpreflight.py',new)
pr=put(A/'GUARD-ROOT-READER-PROOF.json',(json.dumps({'schema':'1370-ao-current-fullguard-root-reader-binding-proof/v1','base':role(base),'new':out,'changes':[{'before':x.decode(),'after':y.decode(),'occurrences':old.count(x)} for x,y in changes],'fullInverseEqualsBase':True,'logicChanged':False,'actualReadbackExecuted':False,'executionAuthorization':False},sort_keys=True,indent=2)+'\n').encode())
print(json.dumps({'reader':out,'proof':pr}))
