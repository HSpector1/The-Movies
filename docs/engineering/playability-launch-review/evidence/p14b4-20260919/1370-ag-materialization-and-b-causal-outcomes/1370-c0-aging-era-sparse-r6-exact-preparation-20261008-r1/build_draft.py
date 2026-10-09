import datetime, hashlib, importlib.util, json, os, shutil, stat, subprocess
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
D=S/'1370-c0-aging-era-sparse-materializer-r6-exact-draft-20261008-r1'
P=Path(__file__).parent
OLD=S/'1370-c0-aging-era-sparse-materializer-r4-exact-draft-20261008-r3'
SOURCE=S/'1370-c0-aging-era-sparse-materializer-source-r6'
HEAD='4812bb123781632dd39e44f918eb85a6a2c12623'
EXCLUDED={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
def require(ok,msg):
 if not ok: raise RuntimeError(msg)
def sha(raw): return hashlib.sha256(raw).hexdigest()
def dump(path,value):
 raw=(json.dumps(value,sort_keys=True,indent=2)+'\n').encode()
 with path.open('xb') as f: f.write(raw); f.flush(); os.fsync(f.fileno())
 return sha(raw)
def run(argv,ok=(0,)):
 p=subprocess.run(argv,cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=180)
 require(p.returncode in ok,(argv,p.returncode,p.stderr.decode(errors='replace')))
 return {'argv':argv,'exit':p.returncode,'stdout':p.stdout.decode(errors='replace'),'stderr':p.stderr.decode(errors='replace')}
def git(*args): return run(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0',*args])['stdout']
def role(path):
 p=Path(path); st=p.lstat(); require(stat.S_ISREG(st.st_mode) and not p.is_symlink(),str(p))
 return {'path':str(p),'sha256':sha(p.read_bytes()),'mode':format(stat.S_IMODE(st.st_mode),'04o'),'regular':True,'symlink':False,'device':st.st_dev,'inode':st.st_ino,'links':st.st_nlink}
def root(path):
 p=Path(path); require(p.resolve(strict=True)==p and p.is_dir() and not p.is_symlink(),str(p))
 st=p.lstat(); ancestry=[]
 for q in [p,*p.parents]:
  t=q.lstat(); require(stat.S_ISDIR(t.st_mode) and not q.is_symlink(),str(q)); ancestry.append({'path':str(q),'device':t.st_dev,'inode':t.st_ino,'mode':format(stat.S_IMODE(t.st_mode),'04o')})
 return {'path':str(p),'device':st.st_dev,'inode':st.st_ino,'mode':format(stat.S_IMODE(st.st_mode),'04o'),'physicalAncestry':ancestry}
require(git('rev-parse','HEAD').strip()==HEAD,'HEAD changed')
require(git('rev-parse','HEAD:src').strip()=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','source changed')
require(git('status','--porcelain=v1','--untracked-files=all')=='','repo dirty')
remote=git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts','refs/heads/main','refs/heads/evidence/1370-r10-clean-captures')
refs={line.split('\t')[1]:line.split('\t')[0] for line in remote.splitlines()}
require(refs['refs/heads/wip/headless-program-20260916-ts']==HEAD,'remote changed')
b=json.loads((OLD/'BINDING-DRAFT.json').read_text()); b['productionHead']=HEAD
b['sourcePinsPath']=str(SOURCE/'SOURCE-PINS.json'); b['sourcePinsSha256']=sha((SOURCE/'SOURCE-PINS.json').read_bytes())
b['sourceReviewPath']='/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materializer-source-review-20261008-r6/RECEIPT.json'; b['sourceReviewSha256']='065670e290e80eefae8593a18cdb6126a7188c35726cadaadf9acab8cc16e794'
for key,name in (('materializer','materialize.py'),('recorder','record.py'),('supervisor','supervise.py')):
 b[key+'Path']=str(SOURCE/name); b[key+'Sha256']=sha((SOURCE/name).read_bytes())
b['xattrPath']='/usr/bin/xattr'; b['xattrSha256']=sha(Path('/usr/bin/xattr').read_bytes())
b['scratchRoot']=str(S/'1370-c0-aging-era-sparse-materialized-r6-20261008-r1')
b['outputRoot']=str(S/'1370-c0-aging-era-sparse-output-r6-20261008-r1')
b['recorderLockPath']=str(S/'1370-c0-aging-era-sparse-r6-20261008-r1.lock')
require(b['executionAuthorization'] is False and all(b[k] is None for k in EXCLUDED-{'status','executionAuthorization'}),'not draft')
for k in ('scratchRoot','outputRoot','recorderLockPath'): require(not os.path.lexists(b[k]),'reserved child exists '+k)
lane=S/'1370-c0-aging-era-sparse-r6-20261008-r1-lane'; require(not os.path.lexists(lane),'lane exists')
require(not os.path.lexists(S/'HEAVY-LANE-LOCK'),'global lock exists')
require(not os.path.lexists(D),'draft exists'); D.mkdir(mode=0o700); lane.mkdir(mode=0o700)
roles={}
for k in ('cp','git','ls','node','lsof','du','xattr','materializer','recorder','supervisor','sourcePins','sourceReview','designReceipt','feasibilityNote'):
 roles[k]=role(b[k+'Path']); require(roles[k]['sha256']==b[k+'Sha256'],k+' bytes changed')
for name,digest in json.loads((SOURCE/'SOURCE-PINS.json').read_text())['files'].items(): require(sha((SOURCE/name).read_bytes())==digest,'source drift '+name)
for name,digest in b['runtimeFiles'].items(): require(sha((R/name).read_bytes())==digest,'runtime drift '+name)
require(run([b['nodePath'],'--version'])['stdout'].strip()=='v22.23.2','Node version')
python=Path('/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14')
extra={'pythonResolved':python,'bash':Path('/bin/bash'),'acceptedR8Helper':S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh','helperSourcePins':S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/SOURCE-PINS.json','helperIndependentSourceReview':S/'1370-c0-stage41-r8-lane-source-independent-review-r1-rwa7o4oe/RECEIPT.json','independentCopyScopeReview':S/'1370-materialization-survivor-scope-review-20261008-r2/RECEIPT.json','parentAdoptedAmendment':R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-AD-copy-only-operational-amendment-and-p16a-preparation.md','postRestartClearance':S/'1370-post-restart-clearance-20261008-r1/RESULT.json'}
roles.update({k:role(v) for k,v in extra.items()})
expected={'acceptedR8Helper':'aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e','helperSourcePins':'9e11563756fb516cfa92591492a1de6fe8d0d0ccfdb93c34bc9b9feffbb94003','helperIndependentSourceReview':'e03a740c5d9fcc704a105adb977759e6393d279c929c166fd35812946c3c7475','independentCopyScopeReview':'6804fd7e2b7fd53d6023bf089fe22cec9c399dbaf2ea7ba03c5c91981719d6cc','parentAdoptedAmendment':'337c9ec87a9e3b3eebd55c647c7219b6afee8043505ad2aa6a01c1b329c47032','postRestartClearance':'ae3757ca42e740d4d04dbeb113297ad22ea54535acbde1b0af34dc8c22fb8258'}
for k,v in expected.items(): require(roles[k]['sha256']==v,k+' changed')
roles['parentAdoptedR6Source']=role('/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-AF-post-restart-materializer-repairs-and-diagnostics.md')
require(roles['parentAdoptedR6Source']['sha256']=='429a7d2d43580221f000879ca5c9dda07b011eb66dcc22dd8ccae3343f1ffc3c','r6 parent scope document changed')
# Reuse historical source manifest only after fresh immutable blob verification;
# full actual dependency metadata inventory remains fresh.
# Import pinned ordinary stdlib-only source for read-only inventory. No main, tests, copy or fixture invocation.
spec=importlib.util.spec_from_file_location('r4_readonly_source',SOURCE/'materialize.py'); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
oldmanifest=json.loads((OLD/'SOURCE-MANIFEST.json').read_text()); rows=m.parse_tree(bytes.fromhex('')+subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','ls-tree','-rz',b['sourceSha'],'--','src',*sorted(m.EXTRA)],cwd=R))
require(set(rows)==set(oldmanifest['files']),'manifest set drift')
for name,oid in rows.items():
 raw=subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','cat-file','blob',oid],cwd=R)
 require(oldmanifest['files'][name]=={'bytes':len(raw),'mode':'100644','oid':oid,'sha256':sha(raw)},'historical blob drift '+name)
compatibility={'platform':__import__('sys').platform,'status':'R6_SOURCE_REPAIRS_REVIEWED_SOURCE_ONLY','claimLimit':'Fresh exact/launch/adopted/observed reviews still required; no materialization.'}
# Fresh metadata/link/inode/ACL/xattr/full-byte read-only inventory using reviewed r6.
inventory_started=__import__('time').monotonic()
deps=m.inventory(Path(b['dependencyRoot']),b)
inventory_seconds=__import__('time').monotonic()-inventory_started
counts={t:sum(v['type']==t for v in deps.values()) for t in ('regular','directory','symlink')}
require(counts=={'regular':11060,'directory':1401,'symlink':24},'dependency shape drift')
links={'dependencyRoot':b['dependencyRoot'],'directoryCount':counts['directory'],'regularCount':counts['regular'],'symlinkCount':counts['symlink'],'schema':'1370-c0-aging-era-dependency-link-manifest-r4','links':[{'path':k,'target':v['target']} for k,v in sorted(deps.items()) if v['type']=='symlink']}
require(links==json.loads((OLD/'DEPENDENCY-LINKS.json').read_text()),'dependency links drift')
dep_hash=dump(P/'DEPENDENCY-INVENTORY.json',deps)
boot=run(['/usr/sbin/sysctl','kern.boottime']); require('sec = 1791493855,' in boot['stdout'],'unexpected reboot')
oldpids=run(['/bin/ps','-p','25951,29271','-o','pid,ppid,pgid,lstart,state,command'],ok=(0,1)); require(oldpids['exit']==1 and len(oldpids['stdout'].splitlines())==1,'old PID identity present')
ps=run(['/bin/ps','-axo','pid,ppid,pgid,lstart,state,comm,args']); (P/'PS.txt').write_text(ps['stdout'])
matching=[line for line in ps['stdout'].splitlines() if 'fixture_worker.py' in line or ('node' in line and ('vitest' in line or '/bin/tsc' in line or '/lib/tsc.js' in line))]; require(not matching,'workers/heavy process present')
fd=subprocess.run(['/usr/sbin/lsof','-n','-P','-w','-F0pftan'],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=180); require(fd.returncode==0,'lsof unreadable'); (P/'LSOF.bin').write_bytes(fd.stdout); (P/'LSOF.stderr').write_bytes(fd.stderr)
pid=number=access=kind=None; writable=[]
protected=[b['productionRoot'],b['commonGitRoot']]
for field in fd.stdout.split(b'\0'):
 field=field.lstrip(b'\n')
 if not field: continue
 key=field[:1]; v=field[1:].decode(errors='replace')
 if key==b'p': pid=v; number=access=kind=None
 elif key==b'f': number=v; access=kind=None
 elif key==b'a': access=v
 elif key==b't': kind=v
 elif key==b'n' and (access in ('u','w') or (number and number[-1:] in ('u','w'))) and any(v==q or v.startswith(q+'/') for q in protected): writable.append({'pid':pid,'fd':number,'access':access,'type':kind,'name':v})
require(not writable,'protected writable FD')
power=run(['/usr/bin/pmset','-g','batt']); require('AC Power' in power['stdout'],'AC unavailable')
roots={k:root(b[k]) for k in ('productionRoot','commonGitRoot','commonObjects','dependencyRoot','scratchParent','outputParent')}
roots['worktreeGitRoot']=root(git('rev-parse','--absolute-git-dir').strip()); roots['laneParent']=root(lane)
require(roots['dependencyRoot']['device']==roots['scratchParent']['device'],'APFS device mismatch')
free=shutil.disk_usage(S).free; required=3758096384; require(free>=required,'space floor')
obs={'schema':'1370-r6-r1-fresh-draft-observations-r1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'boot':boot,'oldPids':oldpids,'matchingFixtureOrHeavyWorkers':matching,'allProcessSnapshotSha256':sha((P/'PS.txt').read_bytes()),'lsofSha256':sha(fd.stdout),'lsofStderrSha256':sha(fd.stderr),'protectedWritableFds':writable,'power':power,'roots':roots,'freeBytes':free,'requiredFreeBytes':required,'remoteRefs':refs,'productionHead':HEAD,'sourceTree':git('rev-parse','HEAD:src').strip(),'dependencyInventorySha256':dep_hash,'dependencyInventoryComparableSha256':sha(m.canonical_json(m.comparable(deps))),'dependencyInventoryElapsedSeconds':inventory_seconds,'threeInventoryProjectionSeconds':3*inventory_seconds,'dependencyCounts':counts,'dependencyAllocatedBytes':m.allocated_bytes(Path(b['dependencyRoot']),b),'roles':roles,'runtimeCompatibility':compatibility,'claimLimit':'Read-only draft observations; repeat immediately at review/adoption/launch. Full protected byte snapshots are required by the accepted recorder pre/postflight; root identity and visible FD observations do not substitute.'}
obs_hash=dump(P/'OBSERVATIONS.json',obs)
for name in ('SOURCE-MANIFEST.json','DEPENDENCY-LINKS.json'): (D/name).write_bytes((OLD/name).read_bytes())
bsha=dump(D/'BINDING-DRAFT.json',b); semantic={k:v for k,v in b.items() if k not in EXCLUDED}; semanticsha=sha(m.canonical_json(semantic)); dump(D/'BINDING-SEMANTIC.json',semantic)
log=lane/'materialize-r6-r1.lane.log'
report=json.loads((OLD/'DRAFT-REPORT.json').read_text()); report.update(schema='1370-c0-aging-era-sparse-materializer-exact-draft-report-r6',productionHead=HEAD,remoteRefsAtDraft=refs,freeBytesAtDraft=free,surplusBytesAtDraft=free-required,oldProcessRecheck={'psLines':[],'oldPidsAbsent':True,'oldFixtureWorkersAbsent':True,'visibleProtectedWritableFdCount':0,'claimLimit':'Fresh post-restart visible snapshot; repeat at pre/postflight'},restart={'bootSeconds':1791493855,'clearanceReceiptPath':str(extra['postRestartClearance']),'clearanceReceiptSha256':expected['postRestartClearance']},freshObservationsPath=str(P/'OBSERVATIONS.json'),freshObservationsSha256=obs_hash,dependencyFullInventoryPath=str(P/'DEPENDENCY-INVENTORY.json'),dependencyFullInventorySha256=dep_hash)
for k in report['reservedChildren']: report['reservedChildren'][k]['path']=b[k]
report['inventoryTiming']={'singleInventoryElapsedSeconds':inventory_seconds,'threeInventoryProjectionSeconds':3*inventory_seconds,'unchangedSupervisorSeconds':930,'remainingSecondsAfterInventoryProjection':930-3*inventory_seconds,'basis':'One actual read-only full inventory, monotonic; no extra benchmark; excludes other work and does not guarantee whole materialization.'}
report['parentAdoptedReplacementSource']=roles['parentAdoptedR6Source']
report['runtimeCompatibility']=compatibility
report['r6SourcePinsSha256']=b['sourcePinsSha256']
report['r6SourceReviewSha256']=b['sourceReviewSha256']
report['lane'].update(parent=str(lane),log=str(log),meta=str(log)+'.meta')
dump(D/'DRAFT-REPORT.json',report)
plan=f'''# Fresh post-checkpoint r6 exact draft — unreviewed and unrun

Bound to clean local/remote HEAD {HEAD} and production src 13880d9b0ba72aff5d4c5bcf5d12fe682c5de554. Historical source, source review, design and accepted r6 source repairs are pinned; r4 code and failure evidence remain preserved. This draft is unauthorized; status DRAFT_UNREVIEWED_UNRUN and three exact-review fields are null. Prior r3 approval remains historical.

Fresh read-only evidence at {P}/OBSERVATIONS.json (SHA-256 {obs_hash}) records reboot1791493855, absent old PIDs25951/29271 and fixture workers, no heavy lane or global lock, physical root ancestry/device/inode, executable/tool/receipt bytes and modes, AC power, no visible protected writable FD, and {free} free bytes against3758096384 required. Full source verification matched176 blobs/4803106 bytes. Fresh full dependency inventory matched11060 regular files/1401 directories/24 contained symlinks with byte/mode/ACL/xattr/inode checks. Recheck all immediately at adoption and launch; full protected byte pre/postflight remains mandatory. No-external-same-UID-renamer is an operational assumption, not something this snapshot proves.

R6 retains reviewed Darwin xattr and lsof access repairs and fixes exact owned-FD0644/0600 modes under actual helper umask077. Parent replacement-source adoption is explicit in tracked1370-AF; r5 copy STOP remains STOP. Ordinary r6 inventory ran read-only; source tests are separately observed tiny controls, not historical materialization. Source review does not authorize this exact draft or launch.\n\nThe copy-only amendment in1370-AD remains binding. No witness, H/native, game fixture or digest acceptance follows from worker clearance. The supervisor930-second whole clock begins before its binding read/fork, but the accepted r8 helper waits on locks/heavy workers before that clock. WaitPID0, absent global lock and idle heavy processes are required. Any unexpected helper wait is STOP; no whole-helper930-second claim. Launch/adoption proposal: {P}/LAUNCH-SPEC.json and {P}/adopt_reviewed_binding.py. Neither was executed.

Independent exact review must bind this ORIGINAL path, raw draft checksum, candidate pins checksum, semantic checksum and current HEAD. Preserve a validator-compatible ACCEPT_EXACT_FILLED_UNRUN receipt. Independently review the adoption procedure, then exclusively archive all seven draft files at the reserved versioned archive path before mutating only status, executionAuthorization, exactBindingReviewPath, exactBindingReviewSha256 and exactBindingReviewDecision in the original binding. Record the newly adopted raw checksum, separately review adopted preflight and exact helper argv, then one recorded copy-only lane. Original source and prior packages are preserved. Any SUPERVISOR-OVERRIDE-STOP.json beats success; helper/child/meta exit, group clearance, lock cleanup, physical byte/allocation and protected root/FD acceptance remain independently observed gates.
'''
(D/'ADOPTION-PLAN.md').write_text(plan)
pins=json.loads((OLD/'CANDIDATE-PINS.json').read_text()); pins.update(schema='1370-c0-aging-era-sparse-exact-candidate-pins-r6',bindingSemanticSha256=semanticsha,freeBytesAtDraft=free,files={p.name:sha(p.read_bytes()) for p in sorted(D.iterdir())},freshObservationsSha256=obs_hash,dependencyFullInventorySha256=dep_hash,productionHead=HEAD,sourcePinsSha256=b['sourcePinsSha256'],sourceReviewSha256=b['sourceReviewSha256'])
candidate=dump(D/'CANDIDATE-PINS.json',pins)
launch=json.loads((R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-ae-restart-checkpoint/1370-c0-aging-era-sparse-r4-r3-launch-spec-proposal-20261008-r1/LAUNCH-SPEC.json').read_text())
launch.update(schema='1370-c0-aging-era-sparse-r6-r1-launch-command-proposal-r1',productionHead=HEAD,bindingSemanticSha256=semanticsha,draftBindingSha256=bsha,candidatePinsSha256=candidate,exactBindingReviewPath=None,exactBindingReviewSha256=None,adoptedBindingSha256=None,adoptedPreflightReviewPath=None,adoptedPreflightReviewSha256=None)
launch['requiredEnvironment']={'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'}
launch['requiredPreflight'].insert(0,'Require PYTHONDONTWRITEBYTECODE=1 for supervisor/recorder/materializer inheritance and Python -B on supervisor')
launch['runtimeCompatibility']=compatibility
launch['requiredPreflight'].insert(0,'Independently accepted r6 owned-FD mode and preserved compatibility/FD repairs; fresh exact review still required')
launch['argv']=[str(extra['bash']),str(extra['acceptedR8Helper']),'0',str(log),str(python),'-B',b['supervisorPath'],str(D/'BINDING-DRAFT.json')]
launch['lane'].update(parent=str(lane),log=str(log),meta=str(log)+'.meta')
launch['roles']={k:v for k,v in roles.items() if k in ('bash','pythonResolved','acceptedR8Helper','helperSourcePins','helperIndependentSourceReview','independentCopyScopeReview','parentAdoptedAmendment','parentAdoptedR6Source','postRestartClearance')}
for k,name in (('r6BindingDraft','BINDING-DRAFT.json'),('r6BindingSemanticFile','BINDING-SEMANTIC.json'),('r6CandidatePins','CANDIDATE-PINS.json')): launch['roles'][k]=role(D/name)
for k in ('sourcePins','sourceReview','supervisor','xattr'): launch['roles'][k]=roles[k]
launch['requiredPreflight']=[s.replace('filled r3','filled r6').replace('old PID identity and protected writable FD scope unchanged','old exact workers remain absent and protected writable FD scope unchanged') for s in launch['requiredPreflight']]
dump(P/'LAUNCH-SPEC.json',launch)
dump(P/'DRAFT-IDENTITY.json',{'draftPath':str(D),'bindingPath':str(D/'BINDING-DRAFT.json'),'draftBindingSha256':bsha,'candidatePinsSha256':candidate,'bindingSemanticSha256':semanticsha,'productionHead':HEAD,'sourcePinsSha256':b['sourcePinsSha256'],'archivePath':str(S/'1370-c0-aging-era-sparse-r6-r1-pre-adoption-archive-20261008-r1'),'sevenDraftFiles':{p.name:sha(p.read_bytes()) for p in D.iterdir()},'launchAuthorized':False})
require(git('rev-parse','HEAD').strip()==HEAD and git('status','--porcelain=v1','--untracked-files=all')=='','production changed during draft')
print(json.dumps({'draft':str(D),'preparation':str(P),'binding':bsha,'semantic':semanticsha,'candidate':candidate,'observations':obs_hash,'freeBytes':free,'dependencyInventory':dep_hash},sort_keys=True))
