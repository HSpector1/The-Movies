import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;P=S/'1370-ao-current-an-fullpreflight-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve()==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
br,b=check(P/'READBACK.json','30c12b895a4308311b7594a2a2b11cb53f421a3a1ac41f9a762a50ca5f9c3297')
rr,r=check(S/'1370-ao-current-an-fullpreflight-independent-observed-review-20261010-r1/RECEIPT.json','79114d5d556b9383c16e6b3b684cf4728e59b04bc703772179a57cf09c6bb962')
assert r['decision']=='ACCEPT_ACTUAL_CURRENT_AN_FULL_PREFLIGHT_ONLY' and r['concreteFindings']==[] and r['executionAuthorization'] is False and r['readback']==br
for k,v in b.items():
 if isinstance(v,dict) and set(v)=={'path','bytes','sha256'}:assert role(v['path'])==v
for k in ['actualTool','snapshot','grant','postOwnership','sourcePins','sourceReview','config','snapshotPins','sourceAdoption']:
 assert r[k]==b[k]
assert b['productionHead']==r['productionHead']=='0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4'
assert b['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and b['freshFullInventory'] is True
actual=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert actual['actualSessionId']==61858 and actual['finalExit']==actual['allToolChunks'][-1]['exit_code']==0
ra=P/'READER-ACTUAL-TOOL.json';rv=json.loads(ra.read_bytes());assert rv['actualSessionId'] is None and rv['finalExit']==rv['allToolChunks'][-1]['exit_code']==0;ra.chmod(0o444)
assert b['originalM0ContentProof'] is False and b['game'] is False and b['executionAuthorization'] is False
out={**b,'schema':'1370-ao-root-current-an-fullpreflight-adoption/v1','status':'ROOT_ADOPTED_CURRENT_AN_FULL_PREFLIGHT','actualReadback':br,'independentObservedReview':rr,'rootReaderActualTool':role(ra),'protectedFreezeContinues':True}
p=A/'CURRENT-AN-FULL-PREFLIGHT-OBSERVED-ADOPTION.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'adoption':role(p)}))
