"""Bounded metadata/authenticated JSON authoring only; never imports/executes proposed guard or route."""
from pathlib import Path
import ast,datetime,hashlib,json,os,shutil,stat,subprocess,sys,time
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program');HERE=Path(__file__).parent
C=S/'1370-c0-m0-additive-exact-guard-core-candidate-after-aj-20261009-r1'
FINAL=S/'1370-c0-m0-additive-exact-final-candidate-after-aj-20261009-r1'
ROUTE=S/'1370-c0-m0-additive-recorded-route-proposal-20261009-r4'
REVIEW=S/'1370-c0-m0-additive-recorded-route-independent-source-review-after-aj-20261009-r4/RECEIPT.json'
GUARD_REVIEW=S/'1370-c0-m0-additive-full-guard-observed-independent-review-after-aj-20261009-r1/RECEIPT.json'
GUARD_ADOPTION=S/'1370-c0-m0-additive-full-guard-parent-recorded-after-aj-20261009-r2/BEFORE-FILL-ADOPTION.json'
OLD_CANDIDATE=S/'1370-c0-m0-exact-guard-core-candidate-20261009-r1'
MAP=S/'1370-c0-m0-additive-exact-fill-mapping-after-aj-20261009-r1'
A={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
CORE_EXCLUDED=A|{'preflightReviewPath','preflightReviewSha256'}
roles={};start=time.monotonic()
def require(v,m):
 if not v:raise RuntimeError('STOP_BOUNDED_FILL_'+m)
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(x):return json.dumps(x,sort_keys=True,separators=(',',':')).encode()
def encoded(x):return (json.dumps(x,indent=2,sort_keys=True)+'\n').encode()
def stamp(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(path,expected=None,cap=16*1024**2,links=1):
 p=Path(path);require(p.resolve(strict=True)==p,'physical input');st=p.lstat();require(stat.S_ISREG(st.st_mode) and st.st_nlink==links and st.st_size<=cap,'regular bounded input')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  require(stamp(os.fstat(fd))==stamp(st),'open race');parts=[];count=0
  while True:
   b=os.read(fd,65536)
   if not b:break
   count+=len(b);require(count<=cap,'read growth cap');parts.append(b)
  raw=b''.join(parts);require(stamp(os.fstat(fd))==stamp(st)==stamp(p.lstat()) and len(raw)==st.st_size,'read stability')
 finally:os.close(fd)
 role={'path':str(p),'bytes':len(raw),'sha256':sha(raw)};require(expected is None or role['sha256']==expected,'hash '+str(p));roles[str(p)]=role;return raw,st

def data(path,expected=None):return json.loads(read(path,expected)[0])
def role(path):return roles[str(path)]
def directory(path):
 p=Path(path);require(p.resolve(strict=True)==p,'physical directory');st=p.lstat();require(stat.S_ISDIR(st.st_mode),'directory');return [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_mtime_ns,st.st_ctime_ns]
def absent(paths):
 for p in paths:require(not os.path.lexists(p),'fresh absent '+str(p))
def write(path,raw):
 require(len(raw)<=1024**2,'owned output cap');fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
def command(argv,timeout=10):
 z=subprocess.run(argv,cwd=R,env=dict(os.environ,GIT_OPTIONAL_LOCKS='0',PYTHONDONTWRITEBYTECODE='1'),stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout)
 require(z.returncode==0 and len(z.stdout)<=65536 and len(z.stderr)<=65536,'bounded command');return z.stdout.decode().strip()
def git(*args):return command(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],30)
def main():
 require(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize,'isolated no-bytecode authoring')
 sr=data(REVIEW,'30fec9b708aee9355cbf4ddae37a80a752901a5535dd4d546707ed0468f8a7dc');require(sr['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_ADDITIVE_RECORDED_ROUTE','r4 source review')
 pins=data(ROUTE/'SOURCE-PINS.json','6158d78ede4cf86aa5a6a68fec56a9c7e29c085399ef0d6cbe198a1655df4f5e')
 for n,expected in pins['files'].items():raw,_=read(ROUTE/n,expected['sha256']);require(len(raw)==expected['bytes'],'source bytes')
 for n in ['SOURCE_PINS','MATERIALIZER','RECORDER','SUPERVISOR','INPUTS']:read(sr['roles'][n]['path'],sr['roles'][n]['sha256'])
 spec=data(ROUTE/'BINDING-UNFILLED.json');inp=data(pins['externalImmutableInputs']['path'],'a9f50c1d0cb6ae54084becf514ed7908c41572050e0df19a50007e3a804ff881')
 copyrole=next(x for x in inp['roles'].values() if x.get('sha256')==spec['copyFactsSha256']);copyfacts=data(copyrole['path'],copyrole['sha256'])
 require(copyfacts['actualFileCount']==1677,'original1677 copy facts')
 rootmeta=copyfacts['materializedDirectoryIdentities']['.'];require(spec['originalM0RootMetadata']==[rootmeta[0],rootmeta[1],stat.S_IFDIR|rootmeta[2],*rootmeta[3:]],'original7 source authority')
 gr=data(GUARD_REVIEW,'0efcbe97fc3ecbfbd25fa4a75355ba1d87ef5ddaaed423ef87c9b61a6075be35');require(gr['decision']=='ACCEPT_OBSERVED_READONLY_CURRENT_AJ_BEFORE_FILL_FULL_GUARD' and gr['actualToolExit']==0,'observed fullguard')
 adoption=data(GUARD_ADOPTION,'201d1aba2f3569321539f639c246f92f795e1cbd81924afcfa8933ec48e56fa0');require(adoption['independentObservedReview']==role(GUARD_REVIEW) and adoption['freshProductionCommonFullProofAccepted'] is True and adoption['r9PrivateRootReuseExplicitlyAccepted'] is True and adoption['exactFillAuthorized'] is True,'baseline adoption')
 snapshot=data(gr['roles']['snapshot']['path'],gr['snapshotSha256']);require(adoption['snapshot']==role(gr['roles']['snapshot']['path']) and snapshot['status']=='GUARDS_ACCEPTED_READONLY' and snapshot['phase']=='before-fill','snapshot chain')
 imm=snapshot['immutable'];require(imm['operationalProductionHead']==spec['productionHead'] and imm['operationalSourceTree']==spec['productionSourceTree'],'current source identity')
 require(imm['retainedHLeaf']=='/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1','actual H leaf')
 read(gr['roles']['outcome']['path'],gr['outcomeSha256']);read(ROUTE/'CONTROL-REUSE-MAPPING.json');read(spec['parentScopeAdoptionPath'],spec['parentScopeAdoptionSha256'])
 mapping=data(MAP/'FIELD-MAP.json','f5aa51bdbf77b2eb8c937b386a3d6ba233e8413864efc829a0a3db0c74433bd1');read(MAP/'PROCEDURE.md');require(len(mapping['fields'])==59,'59-field map')
 old=data(OLD_CANDIDATE/'BINDING-DRAFT.json','c9eed71d414c1b747d12ced8521003ff963dfee1c19ecec1cf0df05ddc9fa08d')
 strict={v['path']:[v[k] for k in ['device','inode','mode','mtimeNs','ctimeNs']] for v in imm['strictRoots'].values()};require(len(strict)==9,'original9 guard strict roots')
 for path,want in strict.items():require(directory(path)==want,'strict root drift '+path)
 strict[spec['scratchRoot']]=directory(spec['scratchRoot']);require(len(strict)==10,'ten exact strict roots')
 leaf=Path(spec['mirrorPath']);require(leaf.resolve(strict=True)==leaf,'physical original M0 leaf');ls=leaf.lstat();require(stat.S_ISDIR(ls.st_mode),'M0 directory');actual=[ls.st_dev,ls.st_ino,ls.st_mode,ls.st_nlink,ls.st_size,ls.st_mtime_ns,ls.st_ctime_ns];require(actual==spec['originalM0RootMetadata'],'M0 original7 drift; no refresh')
 ancestry={}
 for path in [*strict,spec['mirrorPath']]:
  p=Path(path)
  for a in [p,*p.parents]:
   ident=directory(a)[:3];require(str(a) not in ancestry or ancestry[str(a)]==ident,'ancestry conflict');ancestry[str(a)]=ident
 for xs in imm['ancestry'].values():
  for x in xs:require(ancestry[x['path']]==[x[k] for k in ['device','inode','mode']],'guard ancestry drift')
 tools={}
 for path,want in old['toolRoles'].items():
  raw,st=read(path,want['sha256'],cap=64*1024**2,links=want['identity'][3]);ident=[st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink];require(ident==want['identity'] and os.access(path,os.X_OK),'prior physical tool identity');tools[path]={'identity':ident,'sha256':sha(raw)}
 require(set(tools)=={spec['pythonPath'],spec['gitPath'],spec['lsofPath'],'/usr/bin/pmset','/usr/sbin/sysctl'},'exact five tools')
 head=git('rev-parse','HEAD');tree=git('rev-parse','HEAD:src');clean=git('status','--porcelain=v1','--untracked-files=all');common=git('rev-parse','--git-common-dir')
 require(head==spec['productionHead'] and tree==spec['productionSourceTree'] and not clean and str((R/common).resolve())==spec['commonGitRoot'],'fresh local roles/clean/common')
 remote=git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts','refs/heads/main');require(set(remote.splitlines())=={head+'\trefs/heads/wip/headless-program-20260916-ts','c902a704eb948cc576083d0973c8c23e59937dc1\trefs/heads/main'},'fresh remote refs')
 uuid=command(['/usr/sbin/sysctl','-n','kern.bootsessionuuid']);require(uuid==snapshot['currentAfter']['bootSessionUuid'],'fresh UUID')
 power=command(['/usr/bin/pmset','-g','batt']);require('AC Power' in power,'AC');free=shutil.disk_usage(S).free;require(free>=3758096384,'free floor')
 for check in (os.kill,os.killpg):
  try:check(93713,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('STOP_BOUNDED_FILL_previous scanner93713 exists')
 log=S/spec['helperLogName'];fresh=[spec['outputRoot'],spec['recorderLockPath'],S/'HEAVY-LANE-LOCK',log,log.with_suffix('.meta'),Path(str(log)+'.meta'),S/'1370-c0-m0-additive-input-output-20261009-r2',C,FINAL]
 absent(fresh)
 bounded={'schema':'m0-additive-exact-bounded-current-metadata-after-aj-r1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'strictRootMetadata':strict,'ancestryIdentity':ancestry,'originalM0RootMetadata':actual,'originalM0MetadataAuthority':copyrole,'toolRoles':tools,'freshHead':head,'freshSourceTree':tree,'freshWorkingTreeClean':True,'freshRemoteRefs':remote.splitlines(),'bootSessionUuid':uuid,'acPower':True,'powerTextSha256':sha(power.encode()),'freeBytes':free,'freshScannerPidAndPgidAbsent':[93713],'globalWorkerClearanceClaim':False,'freshAbsentPaths':list(map(str,fresh)),'protectedFreezeAuthority':role(GUARD_ADOPTION),'noFullScanOrMirrorInventory':True,'noProposalImportsTestsNodeEngineOrGame':True,'elapsedSeconds':time.monotonic()-start}
 write(HERE/'BOUNDED-CURRENT-METADATA.json',encoded(bounded));read(HERE/'BOUNDED-CURRENT-METADATA.json')
 finalbinding=str(FINAL/'BINDING-DRAFT.json');argrole=data(ROUTE/'ARGV-ROLE.json');argrole['materializerArgv'][-1]=finalbinding;write(HERE/'FILLED-ARGV-ROLE.json',encoded(argrole));read(HERE/'FILLED-ARGV-ROLE.json')
 spec.update(materializerArgv=argrole['materializerArgv'],materializerArgvRolePath=str(HERE/'FILLED-ARGV-ROLE.json'),materializerArgvRoleSha256=role(HERE/'FILLED-ARGV-ROLE.json')['sha256'],materializerSourceReviewPath=str(REVIEW),materializerSourceReviewSha256=role(REVIEW)['sha256'],routeSourceReviewPath=str(REVIEW),routeSourceReviewSha256=role(REVIEW)['sha256'],routeSourceReviewDecision=sr['decision'],retainedHLeafPath=imm['retainedHLeaf'],strictRootMetadata=strict,ancestryIdentity=ancestry,toolRoles=tools,bootSessionUuid=uuid)
 additions={'currentFullGuardSnapshotPath':gr['roles']['snapshot']['path'],'currentFullGuardSnapshotSha256':gr['snapshotSha256'],'currentFullGuardReviewPath':str(GUARD_REVIEW),'currentFullGuardReviewSha256':role(GUARD_REVIEW)['sha256'],'currentFullGuardParentAdoptionPath':str(GUARD_ADOPTION),'currentFullGuardParentAdoptionSha256':role(GUARD_ADOPTION)['sha256'],'currentBoundedMetadataPath':str(HERE/'BOUNDED-CURRENT-METADATA.json'),'currentBoundedMetadataSha256':role(HERE/'BOUNDED-CURRENT-METADATA.json')['sha256']};require(set(additions)==set(mapping['proposedAdditionalAuthenticatedBindingRoles']),'exact eight additional authorities');spec.update(additions)
 require(len(spec)==67 and spec['executionAuthorization'] is False and all(spec[k] is None for k in ['preflightReviewPath','preflightReviewSha256','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision']),'held67-field candidate')
 for kind in ['materializer','recorder','supervisor']:require(role(spec[kind+'Path'])['sha256']==spec[kind+'Sha256'],'program hash')
 require(spec['materializerArgv']==argrole['materializerArgv'] and spec['materializerArgv'][3]==spec['materializerPath'] and spec['materializerArgv'][-1]==finalbinding,'actual body argv')
 # Structural consumption proof only: no eval/import of validated_spec or runtime predicates.
 record=read(ROUTE/'record.py')[0].decode();require(spec['materializerPath'] in record,'corrected required body literal')
 body=read(ROUTE/'add_inputs.py')[0].decode();require("INPUTS=S/'1370-c0-m0-additive-recorded-route-proposal-20261009-r3/INPUTS.json'" in body and pins['externalImmutableInputs']['sha256'] in body,'external immutable INPUTS exact')
 core=sha(canonical({k:v for k,v in spec.items() if k not in CORE_EXCLUDED}));binding=encoded(spec)
 helper=S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh';read(helper,'aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e')
 supervisorargv=[spec['pythonPath'],'-I','-B',spec['supervisorPath'],finalbinding]
 launch={'status':'GUARD_CORE_FILLED_PREFLIGHT_AND_EXACT_REVIEW_PENDING_UNRUN','argv':['/bin/bash',str(helper),'0',str(log),*supervisorargv],'runtimeArgv':supervisorargv,'materializerArgv':spec['materializerArgv'],'cwd':spec['launchCwd'],'environment':spec['launchEnvironment'],'bindingPath':finalbinding,'guardCoreCandidateBindingPath':str(C/'BINDING-DRAFT.json'),'bindingSha256':sha(binding),'guardCoreSha256':core,'bindingSemanticSha256':None,'executionAuthorization':False,'helperSha256':role(helper)['sha256'],'sourceAuthenticatedOuterBootstrapRequired':True,'exactReview':None,'unexpectedHelperWait':'STOP; no recorder or supervisor clock covers an outer helper wait'}
 for path,want in strict.items():require(directory(path)==want,'final strict drift')
 require(stamp(leaf.lstat())==stamp(ls),'final original M0 drift')
 for path,want in ancestry.items():require(directory(path)[:3]==want,'final ancestry drift')
 absent(fresh)
 identity=dict(bounded,status='BOUNDED_CURRENT_IDENTITIES_MATCH_ACCEPTED_BASELINE_AND_ORIGINAL_M0')
 proofroles={'status':'ACCEPTED_BEFORE_FILL_PLUS_BOUNDED_METADATA_AFTER_FILL_AND_PREFLIGHT_PENDING','guardCoreSha256':core,'fullGuardSnapshot':role(gr['roles']['snapshot']['path']),'fullGuardObservedReview':role(GUARD_REVIEW),'fullGuardParentAdoption':role(GUARD_ADOPTION),'sourceRouteReview':role(REVIEW),'sourcePins':role(ROUTE/'SOURCE-PINS.json'),'externalImmutableInputs':role(pins['externalImmutableInputs']['path']),'originalM0CopyFacts':copyrole,'boundedMetadata':role(HERE/'BOUNDED-CURRENT-METADATA.json'),'filledArgvRole':role(HERE/'FILLED-ARGV-ROLE.json'),'fieldMap':role(MAP/'FIELD-MAP.json'),'procedure':role(MAP/'PROCEDURE.md'),'originalM0InventoryExcludedFromFullGuard':True,'afterFillFullEqualityStillRequired':True,'rawPsFdExported':False,'inputRoles':roles}
 report=('SOURCE-ONLY guard-core candidate, held/unrun. Core SHA256 '+core+'.\nAccepted current AJ full baseline744095/observed0efcbe/adoption201d1aba plus bounded current ten roots, exact ancestry, original M0 seven-field metadata, five tools, refs/UUID/AC/free and absence. No full inventory repeated. Original1677 preservation is separate copy/check_old/expanded readback; guard does not inventory M0.\nPreflight/exact pointers null, executionfalse. Core excludes five authorization and two preflight fields. Full execution semantic waits admitted preflight and excludes only five authorization fields. Required after-fill full equality remains unperformed. Root independently reviews this author-created fill.\nThese six guard-core files and consumed PINS remain immutable. Allocated still-absent final six-file directory '+str(FINAL)+' contains the eventual adopted binding path already frozen in external FILLED-ARGV-ROLE.json. Root constructs the final exact stage separately after preflight; no guard-core PINS overwrite is needed. Both runtime and body argv resolve that same intended final binding.\nNo proposed source imports, tests/Node/RNG/prices/engine/game/Git mutations/protected writes or mirror scan. Current refs used read-only Git. Actual launch remains root-owned after after-fill, preflight/exact review/archive/adoption/adopted guards. No H waiver.\n').encode()
 files={'REPORT.md':report,'BINDING-DRAFT.json':binding,'LAUNCH-SPEC.json':encoded(launch),'IDENTITY.json':encoded(identity),'GUARD-PROOF-ROLES.json':encoded(proofroles)}
 cp={'status':'GUARD_CORE_CANDIDATE_PREFLIGHT_PENDING_UNRUN','guardCoreSha256':core,'bindingSemanticSha256':None,'bindingPath':finalbinding,'guardCoreCandidateBindingPath':str(C/'BINDING-DRAFT.json'),'files':{n:{'bytes':len(b),'sha256':sha(b)} for n,b in files.items()}}
 C.mkdir(mode=0o700)
 for n,b in files.items():write(C/n,b)
 write(C/'PINS.json',encoded(cp))
 for n,b in files.items():require(read(C/n)[0]==b,'candidate readback')
 read(C/'PINS.json')
 out={'status':'READY_GUARD_CORE_CANDIDATE_HELD_UNRUN','candidatePath':str(C),'guardCoreSha256':core,'bindingSha256':sha(binding),'pins':role(C/'PINS.json'),'launch':role(C/'LAUNCH-SPEC.json'),'futureFinalCandidatePath':str(FINAL),'executionAuthorization':False,'authorFillElapsedSeconds':time.monotonic()-start,'sourceImportedOrCandidateExecuted':False,'gitMutationOrFullScan':False}
 write(HERE/'FILL-TOOL-OUTCOME.json',encoded(out));print(json.dumps(out,sort_keys=True))
if __name__=='__main__':
 try:main()
 except BaseException as exc:
  if not (HERE/'FILL-STOP.json').exists():write(HERE/'FILL-STOP.json',encoded({'status':'STOP_AUTHOR_BOUNDED_FILL','error':repr(exc),'sourceImportedOrCandidateExecuted':False,'executionAuthorization':False}))
  raise
