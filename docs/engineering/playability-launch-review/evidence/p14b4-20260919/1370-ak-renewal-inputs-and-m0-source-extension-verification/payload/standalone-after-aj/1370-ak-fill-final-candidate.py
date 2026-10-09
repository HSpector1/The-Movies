import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
C=S/'1370-c0-m0-additive-exact-guard-core-candidate-after-aj-20261009-r1'
F=S/'1370-c0-m0-additive-exact-final-candidate-after-aj-20261009-r1'
A={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(x):return json.dumps(x,sort_keys=True,separators=(',',':')).encode()
def encoded(x):return (json.dumps(x,sort_keys=True,indent=2)+'\n').encode()
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();assert len(b)==st.st_size;return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def write(p,b):
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
assert len(sys.argv)==3
review=Path(sys.argv[1]);assert role(review)['sha256']==sys.argv[2]
r=json.loads(review.read_text());assert r['decision']=='ACCEPT_M0_ADDITIVE_PREFLIGHT'
core='69f4a0a4e5bb4d686ef03178dafa9b4c27c11d8671745d61a0537fd725adf69d'
assert r['guardCoreSha256']==core and r['productionHead']=='f0fb818fe7534c3e3784206d16728b015c7f059a'
assert r['freshProductionCommonFullProofAccepted'] is True and r['r9PrivateRootReuseExplicitlyAccepted'] is True
assert role(C/'PINS.json')['sha256']=='1f524d59840874fd86a75d9fafa0cd6e8be94d6deff3c3e4be0d5e4d9d123983'
cp=json.loads((C/'PINS.json').read_text());original={}
for name,expected in cp['files'].items():
 actual=role(C/name);assert {k:actual[k] for k in ('bytes','sha256')}==expected;original[name]=(C/name).read_bytes()
assert set(original)=={'BINDING-DRAFT.json','GUARD-PROOF-ROLES.json','IDENTITY.json','LAUNCH-SPEC.json','REPORT.md'}
b=json.loads(original['BINDING-DRAFT.json']);before=dict(b)
assert b['executionAuthorization'] is False and all(b[k] is None for k in ['preflightReviewPath','preflightReviewSha256','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'])
b['preflightReviewPath']=str(review);b['preflightReviewSha256']=sys.argv[2]
assert {k for k in b if b[k]!=before[k]}=={'preflightReviewPath','preflightReviewSha256'}
assert sha(canonical({k:v for k,v in b.items() if k not in A|{'preflightReviewPath','preflightReviewSha256'}}))==core
semantic=sha(canonical({k:v for k,v in b.items() if k not in A}));binding=encoded(b)
l=json.loads(original['LAUNCH-SPEC.json']);assert l['bindingPath']==str(F/'BINDING-DRAFT.json') and l['runtimeArgv'][-1]==l['bindingPath'] and l['materializerArgv'][-1]==l['bindingPath']
l.update(status='EXACT_FILLED_SOURCE_CANDIDATE_INDEPENDENT_REVIEW_PENDING_UNRUN',bindingSha256=sha(binding),bindingSemanticSha256=semantic,preflightReview=role(review),executionAuthorization=False)
g=json.loads(original['GUARD-PROOF-ROLES.json']);g.update(status='AFTER_FILL_AND_GUARD_CORE_PREFLIGHT_ACCEPTED_EXACT_REVIEW_PENDING',afterFillFullEqualityStillRequired=False,preflightReview=role(review),immutableGuardCorePins=role(C/'PINS.json'),finalFillScript=role(Path(__file__)))
report=('Fresh final six-file exact candidate, held/unrun. Only preflightReviewPath and preflightReviewSha256 changed in binding from the immutable guard-core stage. Core '+core+'; full execution semantic '+semantic+'.\nIndependent preflight accepts current after-fill equality and the guard core. Binding execution is still false and exact review pointers are null. The IDENTITY file remains the original bounded fill-time observation, supported by the subsequent preflight; no new timestamps are invented.\nSeparate independent exact review is required. Preserve all six original files and their identities in the pre-adoption archive before parent changes exactly five authorization fields. Original LAUNCH/PINS remain historical after adoption; adopted launch must separately bind the new raw binding hash. No additive, type, collection, wiring, game or scientific acceptance is claimed.\n').encode()
files={'BINDING-DRAFT.json':binding,'LAUNCH-SPEC.json':encoded(l),'GUARD-PROOF-ROLES.json':encoded(g),'IDENTITY.json':original['IDENTITY.json'],'REPORT.md':report}
pins={'status':'EXACT_FILLED_UNRUN_INDEPENDENT_REVIEW_PENDING','guardCoreSha256':core,'bindingSemanticSha256':semantic,'bindingPath':l['bindingPath'],'immutableGuardCorePins':role(C/'PINS.json'),'files':{n:{'bytes':len(raw),'sha256':sha(raw)} for n,raw in files.items()}}
assert not os.path.lexists(F);F.mkdir(mode=0o700)
for n,raw in files.items():write(F/n,raw)
write(F/'PINS.json',encoded(pins))
for n,raw in files.items():assert (F/n).read_bytes()==raw
assert role(C/'PINS.json')['sha256']=='1f524d59840874fd86a75d9fafa0cd6e8be94d6deff3c3e4be0d5e4d9d123983'
print(json.dumps({'status':'EXACT_FILLED_HELD_UNRUN','pins':role(F/'PINS.json'),'binding':role(F/'BINDING-DRAFT.json'),'guardCoreSha256':core,'bindingSemanticSha256':semantic,'sourceImportedOrCandidateExecuted':False}))
