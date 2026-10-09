"""DRAFT: bounded exact JSON fill only. No imports of engine/route/guards; no launch.
Accepting fullguard is an external root/reviewer action. This script stays inert
until root supplies a concrete accepted receipt in RECEIPT_ROLE below.
"""
import hashlib,json,os,pathlib,stat,sys
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
HERE=pathlib.Path(__file__).resolve().parent
CANDIDATE=S/'1370-c0-m0-exact-guard-core-candidate-20261009-r1'
ROUTE=S/'1370-c0-m0-recorded-materialization-route-proposal-20261009-r3'
ROUTE_PINS_SHA='a37f4ffc9d315f0a621e9544776d7917d294f927adc1c1adfcf998700cc526c4'
ROUTE_REVIEW={'path':str(S/'1370-c0-m0-recorded-materialization-route-independent-source-review-20261009-r3/RECEIPT.json'),'sha256':'77889570601c9b25f182047de35fc7dc245f9b68b59ff039924323e4a92f82d6','decision':'ACCEPT_SOURCE_ONLY_UNRUN_REQUIRES_CHANGED_CONTROLS_EXACT_BINDING_AND_CURRENT_GUARDS'}
SNAPSHOT={'path':str(S/'1370-c0-m0-operational-full-guard-preparation-20261009-r1/evidence/before-fill-r1/SNAPSHOT.json'),'sha256':'28679dbcc0536c72ec9da4bff8e591b8988025101e1977914334e6f8a538ed15'}
TOOL_OUTCOME={'path':str(S/'1370-c0-m0-full-guard-parent-recorded-20261009-r1/BEFORE-FILL-TOOL-OUTCOME.json'),'sha256':'f72110dba9c7af9b08470c3d5ad6204fef4ff8fb62ebd91221b2a799053c3b48'}
R9_COPY={'path':str(S/'1370-c0-aging-era-sparse-r6-observed-independent-review-20261008-r1/RECEIPT.json'),'sha256':'3a43f85ec4bd0557b6ea6ef0a46d59bfc14570324ba1297e555dee3ff4d0767d','decision':'ACCEPT_OBSERVED_MATERIALIZATION_COPY'}
CONTROLS_ADOPTION_PATH=S/'1370-c0-m0-controls-root-recorded-20261009-r3/ADOPTION.json'
CONTROLS_REVIEW={'path':str(S/'1370-c0-m0-changed-route14-controls-independent-observed-review-20261009-r3/RECEIPT.json'),'sha256':'251c53a4089fbdaf0e6466a8fcf27f8489b31bad945264af4e152576d61b61c5'}
RECEIPT_ROLE={'path':str(S/'1370-c0-m0-operational-full-guard-independent-observed-review-20261009-r1/RECEIPT.json'),'sha256':'fe5073d75831162fb0de0ee702a38ed92e795c2f269c7621982bda2b97324fcf','decision':'ACCEPT_OBSERVED_M0_FULL_GUARD_BEFORE_FILL_READONLY'}
FULL_GUARD_ADOPTION={'path':str(S/'1370-c0-m0-full-guard-parent-recorded-20261009-r1/BEFORE-FILL-ADOPTION.json'),'sha256':'7a5f127f11eccf8cb3614756e4e538e6ea3b9281921264fd4d3ba639fd6a757e'}
EXCLUDED={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
INPUT_ROLES={}
def require(v,m):
 if not v:raise RuntimeError('STOP_EXACT_FILL_'+m)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':')).encode()
def stamp(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(path,expected=None,cap=10*1024**2,links=1):
 p=pathlib.Path(path);require(p.is_absolute() and p.resolve(strict=True)==p and not p.is_symlink(),'PHYSICAL_INPUT')
 before=p.lstat();require(stat.S_ISREG(before.st_mode) and before.st_nlink==links and before.st_size<=cap,'BOUNDED_REGULAR_INPUT')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  require(stamp(os.fstat(fd))==stamp(before),'INPUT_OPEN_RACE');parts=[];size=0
  while True:
   block=os.read(fd,65536)
   if not block:break
   size+=len(block);require(size<=cap,'INPUT_CAP');parts.append(block)
  raw=b''.join(parts);require(stamp(os.fstat(fd))==stamp(before)==stamp(p.lstat()),'INPUT_READ_RACE')
 finally:os.close(fd)
 digest=sha(raw);require(expected is None or digest==expected,'INPUT_HASH')
 INPUT_ROLES[str(p)]={'path':str(p),'bytes':len(raw),'sha256':digest}
 return raw,before

def role_json(role):return json.loads(read(role['path'],role['sha256'])[0])
def directory(path):
 p=pathlib.Path(path);require(p.resolve(strict=True)==p and not p.is_symlink(),'PHYSICAL_DIRECTORY');s=p.lstat();require(stat.S_ISDIR(s.st_mode),'DIRECTORY');return [s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_mtime_ns,s.st_ctime_ns]
def absent(paths):
 for p in paths:require(not os.path.lexists(p),'FRESH_ABSENCE_'+str(p))
def write_once(path,raw):
 require(len(raw)<=1024**2,'CANDIDATE_FILE_CAP');fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
def encoded(v):return (json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
def main():
 require(sys.dont_write_bytecode and sys.flags.isolated and not sys.flags.optimize,'EXACT_PYTHON_I_B')
 require(RECEIPT_ROLE is not None,'MISSING_INDEPENDENT_OBSERVED_FULL_GUARD_RECEIPT')
 # This decision is concretely pinned by root after independent observed review.
 accepted=role_json(RECEIPT_ROLE);require(accepted.get('decision')==RECEIPT_ROLE['decision'],'FULL_GUARD_REVIEW_DECISION')
 # Original copy admission occurs before any copied-root metadata or read.
 original=role_json(R9_COPY);require(original.get('decision')==R9_COPY['decision'] and original.get('qualifiedSourceSha')=='3aaf55e0c06c4b745b0b722cc56913050b1ee229','ORIGINAL_R9_COPY_ADMISSION')
 raw,_=read(ROUTE/'SOURCE-PINS.json',ROUTE_PINS_SHA);sourcepins=json.loads(raw)
 for name,pin in sourcepins['files'].items():
  data,_=read(ROUTE/name,pin['sha256']);require(len(data)==pin['bytes'],'ROUTE_SOURCE_SIZE')
 review=role_json(ROUTE_REVIEW);require(review.get('decision')==ROUTE_REVIEW['decision'],'ROUTE_SOURCE_REVIEW')
 spec=json.loads(read(ROUTE/'BINDING-UNFILLED.json')[0]);require(pathlib.Path(sys.executable).resolve(strict=True)==pathlib.Path(spec['pythonPath']),'EXACT_PYTHON_PATH');launch=json.loads(read(ROUTE/'LAUNCH-UNFILLED.json')[0])
 snapshot=role_json(SNAPSHOT);outcome=role_json(TOOL_OUTCOME)
 require(snapshot.get('status')=='GUARDS_ACCEPTED_READONLY' and snapshot.get('phase')=='before-fill','SNAPSHOT_ROLE')
 require(outcome.get('actualToolExit')==outcome.get('directSnapshotExit')==0 and outcome.get('snapshotSha256')==SNAPSHOT['sha256'] and outcome.get('protectedFreezeMaintainedByParent') is True,'ACTUAL_TOOL_OUTCOME')
 imm=snapshot['immutable'];require(imm['operationalProductionHead']==spec['productionHead'] and imm['operationalSourceTree']==spec['productionSourceTree'],'OPERATIONAL_SOURCE_ROLES')
 require(snapshot['admission']==R9_COPY and imm['retainedHLeaf']==outcome['retainedHLeaf'],'ORIGINAL_COPY_AND_H_ROLES')
 require(accepted.get('snapshotSha256')==SNAPSHOT['sha256'] and accepted.get('snapshotPath')==SNAPSHOT['path'] and accepted.get('parentActualOutcomeSha256')==TOOL_OUTCOME['sha256'],'FULL_GUARD_REVIEW_ROLES')
 fulladoption=role_json(FULL_GUARD_ADOPTION)
 require(fulladoption.get('reviewSha256')==RECEIPT_ROLE['sha256'] and fulladoption.get('snapshotSha256')==SNAPSHOT['sha256'] and fulladoption.get('productionHead')==spec['productionHead'] and fulladoption.get('freshProductionCommonFullProofAccepted') is True and fulladoption.get('r9PrivateRootReuseExplicitlyAccepted') is True and fulladoption.get('protectedWriteAndRenamerFreezeMaintained') is True,'PARENT_FULL_GUARD_ADOPTION')
 adoption=json.loads(read(CONTROLS_ADOPTION_PATH,'6b9d0df891caeb96c95600f94bd57a83ecbd4bae9baa6203c69abe7f0ebb81fc')[0]);require(adoption.get('all14Passed') is True and adoption.get('reviewSha256')==CONTROLS_REVIEW['sha256'],'CONTROLS_ADOPTION')
 role_json(CONTROLS_REVIEW)
 for pkey,hkey in [('materializerPath','materializerSha256'),('recorderPath','recorderSha256'),('supervisorPath','supervisorSha256'),('materializerArgvRolePath','materializerArgvRoleSha256'),('materializerSourceReviewPath','materializerSourceReviewSha256'),('parentScopeAdoptionPath','parentScopeAdoptionSha256')]:read(spec[pkey],spec[hkey])
 argv=json.loads(read(spec['materializerArgvRolePath'],spec['materializerArgvRoleSha256'])[0]);require(argv['materializerArgv']==spec['materializerArgv'] and argv['requiredEnvironment']==spec['launchEnvironment'] and argv['cwd']==spec['launchCwd'],'EXACT_MATERIALIZER_ARGV')
 # The source manifest/review argv roles are literal and have separately pinned hashes.
 for pathflag,hashflag in [('--source-manifest','--source-manifest-sha'),('--source-review','--source-review-sha')]:read(spec['materializerArgv'][spec['materializerArgv'].index(pathflag)+1],spec['materializerArgv'][spec['materializerArgv'].index(hashflag)+1])
 spec.update(status='DRAFT_EXACT_REVIEW_PENDING_UNRUN',executionAuthorization=False,routeSourceReviewPath=ROUTE_REVIEW['path'],routeSourceReviewSha256=ROUTE_REVIEW['sha256'],routeSourceReviewDecision=ROUTE_REVIEW['decision'],retainedHLeafPath=imm['retainedHLeaf'])
 require(all(spec[k] is None for k in ('preflightReviewPath','preflightReviewSha256','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision')),'HELD_REVIEW_POINTERS')
 roots=imm['strictRoots'];require(len(roots)==9,'NINE_STRICT_ROOTS')
 strict={row['path']:[row[k] for k in ('device','inode','mode','mtimeNs','ctimeNs')] for row in roots.values()}
 for path,wanted in strict.items():require(directory(path)==wanted,'STRICT_ROOT_DRIFT')
 ancestors={}
 for rootrole in roots:
  for row in imm['ancestry'][rootrole]:
   value=[row[k] for k in ('device','inode','mode')];require(row['path'] not in ancestors or ancestors[row['path']]==value,'ANCESTRY_CONFLICT');ancestors[row['path']]=value
 wanted_ancestors=set()
 for path in strict:
  p=pathlib.Path(path);wanted_ancestors.update(map(str,[p,*p.parents]))
 require(set(ancestors)==wanted_ancestors,'EXACT_ANCESTRY_CLOSURE')
 for path,wanted in ancestors.items():require(directory(path)[:3]==wanted,'ANCESTRY_DRIFT')
 tools={}
 for path in (spec['pythonPath'],spec['gitPath'],spec['lsofPath'],'/usr/bin/pmset','/usr/sbin/sysctl'):
  raw,s=read(path,cap=64*1024**2,links=76 if path=='/usr/bin/git' else 1);require(os.access(path,os.X_OK),'TOOL_EXECUTABLE');tools[path]={'identity':[s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_nlink],'sha256':sha(raw)}
 require(tools[spec['pythonPath']]['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835','ADMITTED_PYTHON_HASH')
 spec['strictRootMetadata']=strict;spec['ancestryIdentity']=ancestors;spec['toolRoles']=tools
 lane=pathlib.Path(launch['argv'][3]);fresh=[spec['scratchRoot'],spec['outputRoot'],spec['recorderLockPath'],str(lane.parent),str(lane),str(lane)+'.meta',S/'HEAVY-LANE-LOCK',CANDIDATE];absent(fresh)
 core=sha(canonical({k:v for k,v in spec.items() if k not in EXCLUDED|{'preflightReviewPath','preflightReviewSha256'}}));binding=encoded(spec)
 launch.update(status='GUARD_CORE_FILLED_PREFLIGHT_AND_EXACT_REVIEW_PENDING_UNRUN',executionAuthorization=False,bindingPath=str(CANDIDATE/'BINDING-DRAFT.json'),bindingSha256=sha(binding),bindingSemanticSha256=None,guardCoreSha256=core);launch['argv'][-1]=launch['bindingPath']
 identity={'status':'CURRENT_NARROW_IDENTITIES_EQUAL_ADMITTED_SNAPSHOT','strictRootMetadata':strict,'ancestryIdentity':ancestors,'toolRoles':tools,'bootSessionUuid':spec['bootSessionUuid'],'noNewRefProcessFdPowerOrFullInventoryCommands':True}
 guardroles={'status':'ADMITTED_FULL_GUARD_AND_NULL_PREFLIGHT_GUARD_CORE','guardCoreSha256':core,'fullGuardSnapshot':SNAPSHOT,'fullGuardObservedReview':RECEIPT_ROLE,'fullGuardParentAdoption':FULL_GUARD_ADOPTION,'actualToolOutcome':TOOL_OUTCOME,'originalCopyAdmission':R9_COPY,'controlsObservedReview':CONTROLS_REVIEW,'controlsParentAdoption':INPUT_ROLES[str(CONTROLS_ADOPTION_PATH)],'sourceRouteReview':ROUTE_REVIEW,'protectedDigests':imm['protectedDigests'],'privateAcceptedFullProof':imm['privateAcceptedFullProof'],'currentObservationBefore':snapshot['currentBefore'],'currentObservationAfter':snapshot['currentAfter'],'narrowFillInputRoles':INPUT_ROLES,'rawPsFdArchived':False,'groupLimit':'Snapshot ownedGroupIdsChecked empty; no fresh numeric R9 game group claim. Prior root adopted tiny-control groups independently cleared.'}
 report=('Exact guard core filled from accepted source templates and independently admitted full guard; execution disabled.\nGuard core SHA256 '+core+'\nPreflight and exact receipt pointers remain null. Root must independently accept guard core, insert preflight receipt, compute full semantic and launch/raw pins, independently review exact candidate, archive all six files, then adopt only five authorization fields. No launch or imported source.\nStrict roots/ancestry and five tool identities freshly matched/read; refs/process/FD/AC/disk are snapshot-time facts under parent freeze, not newly measured here. Fresh absent r2 output/mirror/lane/locks checked without deletion. Raw machine PS/FD not copied. No inventories/Git/tests/materializer/engine operations.\n').encode()
 files={'BINDING-DRAFT.json':binding,'LAUNCH-SPEC.json':encoded(launch),'IDENTITY.json':encoded(identity),'GUARD-PROOF-ROLES.json':encoded(guardroles),'REPORT.md':report}
 candidatepins={'status':'GUARD_CORE_CANDIDATE_PREFLIGHT_PENDING_UNRUN','guardCoreSha256':core,'bindingSemanticSha256':None,'files':{name:{'bytes':len(data),'sha256':sha(data)} for name,data in files.items()}}
 for path,wanted in strict.items():require(directory(path)==wanted,'FINAL_STRICT_ROOT_DRIFT')
 for path,wanted in ancestors.items():require(directory(path)[:3]==wanted,'FINAL_ANCESTRY_DRIFT')
 absent(fresh)
 CANDIDATE.mkdir(mode=0o700)
 for name,data in files.items():write_once(CANDIDATE/name,data)
 write_once(CANDIDATE/'PINS.json',encoded(candidatepins))
 for name,data in files.items():require(read(CANDIDATE/name)[0]==data,'CANDIDATE_READBACK')
 print(json.dumps({'status':'GUARD_CORE_FILLED_HELD_UNRUN','candidatePath':str(CANDIDATE),'guardCoreSha256':core,'bindingSha256':sha(binding),'executionAuthorization':False},sort_keys=True))
if __name__=='__main__':main()
