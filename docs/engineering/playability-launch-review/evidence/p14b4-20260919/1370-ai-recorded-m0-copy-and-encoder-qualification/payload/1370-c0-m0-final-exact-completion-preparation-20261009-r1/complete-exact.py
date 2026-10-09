"""Root-authorized finite artifact completion only; no import/guard/launch."""
import hashlib,json,os,pathlib,stat
S=pathlib.Path('/Users/zacheryspector/studio-scratch');HERE=pathlib.Path(__file__).resolve().parent
OLD=S/'1370-c0-m0-exact-guard-core-candidate-20261009-r1';NEW=S/'1370-c0-m0-final-exact-candidate-20261009-r1'
PF=S/'1370-c0-m0-guard-core-independent-preflight-20261009-r1/FINAL-RECEIPT.json';PF_SHA='742d071a72b97ebe1112ebb34482d078d0a335c56dbbad2492eb7601fc1b89fb';CORE='d347b8e8504161c394d1338444919844871f80099b635538d8078ca3fc4a6020'
A={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
def require(v,m):
 if not v:raise RuntimeError('STOP_EXACT_COMPLETION_'+m)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def canon(v):return json.dumps(v,sort_keys=True,separators=(',',':')).encode()
def enc(v):return (json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
def signature(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(p,wanted=None):
 p=pathlib.Path(p);require(p.resolve(strict=True)==p and not p.is_symlink(),'PHYSICAL_INPUT');s=p.lstat();require(stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size<=1024**2,'BOUNDED_REGULAR_INPUT');fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  require(signature(os.fstat(fd))==signature(s),'OPEN_RACE');raw=os.read(fd,1024**2+1);require(len(raw)==s.st_size and signature(os.fstat(fd))==signature(s)==signature(p.lstat()),'READ_RACE')
 finally:os.close(fd)
 require(wanted is None or sha(raw)==wanted,'INPUT_SHA');return raw

def write(p,raw):
 require(len(raw)<=1024**2,'OUTPUT_CAP');fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
oldpinsraw=read(OLD/'PINS.json','c3783530939165ca2a32732b10ef3ff950a707e3eac83fe14027e24facec3c99');oldpins=json.loads(oldpinsraw);original={}
for name,role in oldpins['files'].items():
 original[name]=read(OLD/name,role['sha256']);require(len(original[name])==role['bytes'],'ORIGINAL_SIZE')
original['PINS.json']=oldpinsraw;require(len(original)==6,'ORIGINAL_SIX_FILES')
pf=json.loads(read(PF,PF_SHA));require(pf['decision']=='ACCEPT_M0_MATERIALIZATION_PREFLIGHT' and pf['guardCoreSha256']==CORE and pf['productionHead']=='02d50716fe787eaed425b40f822ce91f4463deba' and pf['freshProductionCommonFullProofAccepted'] is True and pf['r9PrivateRootReuseExplicitlyAccepted'] is True,'FINAL_PREFLIGHT_ACCEPTANCE')
for rolekey in ('currentFacts','parentAfterFillScopeClarification','preservedBasePreflightReceipt'):read(pf[rolekey]['path'],pf[rolekey]['sha256'])
require(pf['parentAfterFillScopeClarification']['sha256']=='93a585e81b1393c78740d68020ec47eba7ba37d1274f57abeb3a61c72e0353fe','ROOT_SCOPE_CLARIFICATION')
before=json.loads(original['BINDING-DRAFT.json']);spec=dict(before);require(spec['executionAuthorization'] is False and all(spec[k] is None for k in ('preflightReviewPath','preflightReviewSha256','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision')),'ORIGINAL_HELD')
spec['preflightReviewPath']=str(PF);spec['preflightReviewSha256']=PF_SHA
changed={k for k in set(before)|set(spec) if before.get(k)!=spec.get(k)};require(changed=={'preflightReviewPath','preflightReviewSha256'} and set(before)==set(spec),'ONLY_TWO_DECLARED_POINTERS')
core=lambda b:sha(canon({k:v for k,v in b.items() if k not in A|{'preflightReviewPath','preflightReviewSha256'}}))
require(core(before)==core(spec)==CORE,'UNCHANGED_GUARD_CORE');semantic=sha(canon({k:v for k,v in spec.items() if k not in A}));binding=enc(spec)
launch=json.loads(original['LAUNCH-SPEC.json']);oldlaunch=dict(launch);launch['argv']=list(launch['argv']);launch.update(status='DRAFT_EXACT_REVIEW_PENDING_UNRUN',bindingPath=str(NEW/'BINDING-DRAFT.json'),bindingSha256=sha(binding),bindingSemanticSha256=semantic);launch['argv'][-1]=launch['bindingPath'];launch['note']='Concrete final preflight inserted; exact review and execution authorization remain pending. Full supervisor/recorder route retained; never invoke bare materializer.'
require(launch['argv'][:-1]==oldlaunch['argv'][:-1] and launch['executionAuthorization'] is False and launch['exactReview'] is None,'HELD_EXACT_LAUNCH')
guards=json.loads(original['GUARD-PROOF-ROLES.json']);guards.update(status='FINAL_PREFLIGHT_ACCEPTED_FULL_SEMANTIC_FILLED_EXACT_REVIEW_PENDING',finalPreflightReview={'path':str(PF),'sha256':PF_SHA,'decision':pf['decision']},acceptedAfterFillCurrentFacts=pf['currentFacts'],parentAfterFillScopeClarification=pf['parentAfterFillScopeClarification'],preservedBasePreflightReceipt=pf['preservedBasePreflightReceipt'],bindingSemanticSha256=semantic)
report=('Final exact candidate completed under root-adopted final preflight '+PF_SHA+'.\nOriginal six-file guard-core candidate preserved. Binding changes only preflightReviewPath and preflightReviewSha256. Authorization fields/status remain unchanged; executionfalse and exact receipt pointersnull.\nGuard core '+CORE+'\nFull semantic '+semantic+'\nFull semantic excludes exactly five authorization fields, including pinned preflight pointer/hash. Guard core additionally excludes exactly two preflight pointer fields. No receipt binds a digest containing its own hash.\nLaunch points to this new binding/raw/semantic with argv prefix/cwd/environment/helper source unchanged. IDENTITY bytes are exact original. GUARD-PROOF-ROLES retains fullguard/source/controls roles and adds accepted finalpreflight/currentfacts/root93a585 scope clarification pointers. Root must independently exact-review, archive these six exact bytes before changing five authorization fields, then externally review adopted launch. No materializer/import/tests/Git/fullscan/launch.\n').encode()
files={'BINDING-DRAFT.json':binding,'LAUNCH-SPEC.json':enc(launch),'IDENTITY.json':original['IDENTITY.json'],'GUARD-PROOF-ROLES.json':enc(guards),'REPORT.md':report}
pins={'status':'FINAL_EXACT_CANDIDATE_UNRUN_REVIEW_PENDING','guardCoreSha256':CORE,'bindingSemanticSha256':semantic,'files':{name:{'bytes':len(raw),'sha256':sha(raw)} for name,raw in files.items()}}
require(not os.path.lexists(NEW),'FRESH_CANDIDATE');NEW.mkdir(mode=0o700)
for name,raw in files.items():write(NEW/name,raw)
write(NEW/'PINS.json',enc(pins))
for name,raw in files.items():require(read(NEW/name)==raw,'FINAL_READBACK')
for name,raw in original.items():require(read(OLD/name)==raw,'ORIGINAL_PRESERVED')
roles={name:{'path':str(NEW/name),'bytes':len(read(NEW/name)),'sha256':sha(read(NEW/name))} for name in [*files,'PINS.json']}
proof={'status':'ACTUAL_FINITE_COMPLETION_HELD_UNRUN','originalCandidate':str(OLD),'newCandidate':str(NEW),'originalCandidatePinsSha256':sha(oldpinsraw),'finalPreflightPath':str(PF),'finalPreflightSha256':PF_SHA,'bindingChangedFields':sorted(changed),'noNewBindingKeys':set(before)==set(spec),'authorizationFieldsUnchanged':all(before[k]==spec[k] for k in A),'originalSixFilesRereadByteExact':True,'identityByteExact':files['IDENTITY.json']==original['IDENTITY.json'],'guardCoreSha256':CORE,'guardCoreBeforeAndAfterEqual':True,'fullSemanticSha256':semantic,'bindingRawSha256':sha(binding),'candidateSixFiles':roles,'executionAuthorization':False,'exactReviewFieldsNull':all(spec[k] is None for k in ('exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision')),'noMaterializerImportTestsFullscanGitOrLaunch':True}
write(HERE/'DELTA-PROOF.json',enc(proof));print(json.dumps({'candidatePath':str(NEW),'guardCoreSha256':CORE,'bindingSemanticSha256':semantic,'bindingRawSha256':sha(binding),'candidatePinsSha256':roles['PINS.json']['sha256'],'deltaProofSha256':sha(read(HERE/'DELTA-PROOF.json'))},sort_keys=True))
