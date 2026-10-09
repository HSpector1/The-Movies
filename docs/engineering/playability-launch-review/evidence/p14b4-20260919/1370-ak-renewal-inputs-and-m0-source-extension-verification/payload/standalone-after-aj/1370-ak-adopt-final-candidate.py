import datetime,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
F=S/'1370-c0-m0-additive-exact-final-candidate-after-aj-20261009-r1'
ARCH=S/'1370-c0-m0-additive-exact-pre-adoption-archive-after-aj-20261009-r1'
P=S/'1370-c0-m0-additive-exact-parent-adoption-after-aj-20261009-r1'
A={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
CORE='69f4a0a4e5bb4d686ef03178dafa9b4c27c11d8671745d61a0537fd725adf69d'
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(x):return json.dumps(x,sort_keys=True,separators=(',',':')).encode()
def encoded(x):return (json.dumps(x,sort_keys=True,indent=2)+'\n').encode()
def stamp(st):return [st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();assert stamp(p.lstat())==stamp(st) and len(b)==st.st_size
 return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def write(p,raw):
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
assert len(sys.argv)==3
review=Path(sys.argv[1]);assert role(review)['sha256']==sys.argv[2]
r=json.loads(review.read_text());assert r['decision']=='ACCEPT_EXACT_FILLED_UNRUN'
pins=json.loads((F/'PINS.json').read_text());names=set(pins['files'])|{'PINS.json'};assert len(names)==6 and set(x.name for x in F.iterdir())==names
assert r['candidatePins']==role(F/'PINS.json')
original={n:(F/n).read_bytes() for n in names};identities={n:stamp((F/n).lstat()) for n in names}
for n,expected in pins['files'].items():assert len(original[n])==expected['bytes'] and sha(original[n])==expected['sha256']
b=json.loads(original['BINDING-DRAFT.json']);assert b['executionAuthorization'] is False and b['status']=='DRAFT_EXACT_REVIEW_PENDING_UNRUN'
assert all(b[k] is None for k in ['exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'])
semantic=sha(canonical({k:v for k,v in b.items() if k not in A}));assert semantic==pins['bindingSemanticSha256']==r['bindingSemanticSha256']
assert sha(canonical({k:v for k,v in b.items() if k not in A|{'preflightReviewPath','preflightReviewSha256'}}))==CORE==pins['guardCoreSha256']
assert not os.path.lexists(ARCH) and not os.path.lexists(P)
ARCH.mkdir(mode=0o700);P.mkdir(mode=0o700)
for n in sorted(names):write(ARCH/n,original[n])
manifest={'status':'SIX_ORIGINAL_EXACT_CANDIDATE_FILES_ARCHIVED_BEFORE_AUTHORIZATION_MUTATION','originalDirectory':str(F),'guardCoreSha256':CORE,'bindingSemanticSha256':semantic,'exactReview':role(review),'files':{n:{'original':{'path':str(F/n),'bytes':len(original[n]),'sha256':sha(original[n]),'metadata':identities[n]},'archive':role(ARCH/n)} for n in sorted(names)}}
write(ARCH/'ARCHIVE-MANIFEST.json',encoded(manifest))
for n in names:assert (ARCH/n).read_bytes()==original[n] and (F/n).read_bytes()==original[n] and stamp((F/n).lstat())==identities[n]
before=dict(b);b.update(status='REVIEWED_FILLED_UNRUN',executionAuthorization=True,exactBindingReviewPath=str(review),exactBindingReviewSha256=sys.argv[2],exactBindingReviewDecision='ACCEPT_EXACT_FILLED_UNRUN')
changed={k for k in b if before[k]!=b[k]};assert changed==A
assert sha(canonical({k:v for k,v in b.items() if k not in A}))==semantic
assert sha(canonical({k:v for k,v in b.items() if k not in A|{'preflightReviewPath','preflightReviewSha256'}}))==CORE
tmp=P/'ADOPTED-BINDING.tmp';write(tmp,encoded(b));os.replace(tmp,F/'BINDING-DRAFT.json')
for n in names-{'BINDING-DRAFT.json'}:assert (F/n).read_bytes()==original[n] and stamp((F/n).lstat())==identities[n]
l=json.loads(original['LAUNCH-SPEC.json']);l.update(status='PARENT_ADOPTED_EXACT_LAUNCH_REQUIRES_ADOPTED_PREFLIGHT_AND_ROOT_GRANT',executionAuthorization=True,bindingSha256=role(F/'BINDING-DRAFT.json')['sha256'],exactReview=role(review),originalExactLaunchArchive=role(ARCH/'LAUNCH-SPEC.json'),originalExactPinsArchive=role(ARCH/'PINS.json'))
write(P/'ADOPTED-LAUNCH-SPEC.json',encoded(l))
adoption={'status':'ROOT_ARCHIVED_SIX_ORIGINALS_AND_ADOPTED_EXACTLY_FIVE_AUTHORIZATION_FIELDS_UNRUN','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exactReview':role(review),'archiveManifest':role(ARCH/'ARCHIVE-MANIFEST.json'),'originalRawBindingSha256':sha(original['BINDING-DRAFT.json']),'adoptedBinding':role(F/'BINDING-DRAFT.json'),'adoptedLaunch':role(P/'ADOPTED-LAUNCH-SPEC.json'),'guardCoreSha256':CORE,'bindingSemanticSha256':semantic,'changedFields':sorted(changed),'nonbindingFiveBytesAndMetadataUnchanged':True,'sourceScript':role(Path(__file__)),'runtimeLaunchGranted':False,'protectedFreezeMaintained':True,'claimLimit':'Parent adoption only; independent adopted preflight and separate owned recorded launch remain required. Original six files retained exactly. No source extension, types or game execution claimed.'}
write(P/'ADOPTION.json',encoded(adoption));print(json.dumps({'adoption':role(P/'ADOPTION.json'),'archiveManifest':role(ARCH/'ARCHIVE-MANIFEST.json'),'adoptedLaunch':role(P/'ADOPTED-LAUNCH-SPEC.json'),'adoptedBinding':role(F/'BINDING-DRAFT.json')}))
