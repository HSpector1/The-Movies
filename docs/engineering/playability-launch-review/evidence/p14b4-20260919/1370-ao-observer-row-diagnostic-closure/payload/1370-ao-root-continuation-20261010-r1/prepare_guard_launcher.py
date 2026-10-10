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
base=S/'1370-an-root-continuation-20261009-r1/run_current_fullguard_once.py';old=base.read_bytes();new=old
replacements=[
 (b'1370-an-current-operational-fullguard-source-20261009-r1',b'1370-ao-current-operational-fullguard-source-20261010-r1'),
 (b'1370-an-current-am-fullpreflight-parent-recorded-20261009-r1',b'1370-ao-current-an-fullpreflight-parent-recorded-20261010-r1'),
 (b'e638252b8082aa756f56471552327706a17dcf0e2d6bd01628710624ce7ec435',b'9df63e39d302e3b8481198999e129233ab4eb5709848d91cb1d45af0dfee0e88'),
 (b'ACCEPT_CURRENT_AM_FULLGUARD_BINDINGS_SOURCE_ONLY',b'ACCEPT_CURRENT_AN_FULLGUARD_BINDINGS_SOURCE_ONLY'),
 (b'7087f116cf998fd86e33fb8e004df628e0686dbd',b'0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4'),
 (b'before-fill-current-am-r1',b'before-fill-current-an-r1'),
 (b'CURRENT-AM-FULLGUARD-SOURCE-ADOPTION.json',b'CURRENT-AN-FULLGUARD-SOURCE-ADOPTION.json'),
 (b'1370-an-root-current-am-fullguard-source-adoption/v1',b'1370-ao-root-current-an-fullguard-source-adoption/v1'),
 (b'ROOT_ADOPTED_CURRENT_AM_FULLGUARD_BINDINGS_SOURCE_ONLY',b'ROOT_ADOPTED_CURRENT_AN_FULLGUARD_BINDINGS_SOURCE_ONLY'),
 (b'1370-an-root-direct-current-am-fullpreflight-grant/v1',b'1370-ao-root-direct-current-an-fullpreflight-grant/v1'),
 (b'GRANTED_ONCE_ORIGINAL_COMPLETE_CURRENT_AM_FULL_PREFLIGHT',b'GRANTED_ONCE_ORIGINAL_COMPLETE_CURRENT_AN_FULL_PREFLIGHT'),
]
for before,after in replacements:
 assert new.count(before)>=1 and after not in new;new=new.replace(before,after)
inverse=new
for before,after in reversed(replacements):inverse=inverse.replace(after,before)
assert inverse==old
compile(new,str(A/'run_current_fullguard_once.py'),'exec')
out=put(A/'run_current_fullguard_once.py',new)
proof={'schema':'1370-ao-current-fullguard-root-launcher-binding-proof/v1','base':role(base),'new':out,'replacements':[{'before':x.decode(),'after':y.decode(),'occurrences':old.count(x)} for x,y in replacements],'fullInverseEqualsBase':True,'logicChanged':False,'actualGuardExecuted':False,'executionAuthorization':False}
pr=put(A/'GUARD-ROOT-LAUNCHER-PROOF.json',(json.dumps(proof,sort_keys=True,indent=2)+'\n').encode());print(json.dumps({'launcher':out,'proof':pr}))
