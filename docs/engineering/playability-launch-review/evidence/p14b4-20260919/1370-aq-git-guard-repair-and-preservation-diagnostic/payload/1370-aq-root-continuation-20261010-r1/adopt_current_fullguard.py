import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');Q=Path(__file__).parent;P=S/'1370-aq-current-ap-fullpreflight-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];r=read(rr['path']);br=role(P/'READBACK.json');b=read(br['path'])
assert r['schema']=='1370-current-ap-fullpreflight-independent-observed-review/v1' and r['decision']=='ACCEPT_ACTUAL_CURRENT_AP_FULL_PREFLIGHT_ONLY' and r['concreteFindings']==[] and r['executionAuthorization'] is False and r['readback']==br
assert b['schema']=='1370-ap-current-ap-fullpreflight-readback/v1' and b['status']=='ACTUAL_CURRENT_AP_FULL_PREFLIGHT_COMPLETE_UNADOPTED'
for v in b.values():
 if isinstance(v,dict) and set(v)=={'path','bytes','sha256'}:assert role(v['path'])==v
for k in ('actualTool','snapshot','grant','postOwnership','sourcePins','sourceReview','config','snapshotPins','sourceAdoption'):assert r[k]==b[k]
assert b['productionHead']==r['productionHead']=='d20347b83ea7497ed17c48ec14d8f64a3ce69cc8' and b['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
assert b['freshFullInventory'] is True and (b['strictRoots'],b['dependencyEntriesPerCopy'],b['privateSourceEntries'])==(9,12485,176)
actual=read(P/'ACTUAL-TOOL.json');assert actual['sessionId']==88384 and actual['finalExit']==actual['allToolChunks'][-1]['exit_code']==0
ra=role(P/'READER-ACTUAL-TOOL.json');rv=read(ra['path']);assert rv['sessionId'] is None and rv['finalExit']==rv['allToolChunks'][-1]['exit_code']==0
assert b['originalM0ContentProof'] is False and b['game'] is False and b['executionAuthorization'] is False and not os.path.lexists(S/'HEAVY-LANE-LOCK')
cr=role(Q/'CURRENT-AP-FULLGUARD-ADOPTION-PROSPECTIVE-CONTRACT.json');assert cr['sha256']=='998f932cb9ded3667f702bde23fd1c7d4baceb06349f4dbb99759ad1411d39bd';c=read(cr['path'])
out={**b,'schema':c['adoptionSchema'],'status':c['adoptionStatus'],'actualReadback':br,'independentObservedReview':rr,'rootReaderActualTool':ra,'protectedFreezeContinues':True,'prospectiveContract':cr,'rootAdopterSource':role(__file__)}
p=Path(c['adoptionPath']);assert p==Q/'CURRENT-AP-FULL-PREFLIGHT-OBSERVED-ADOPTION.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'adoption':role(p)}))
