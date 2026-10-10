#!/usr/bin/env python3
"""UNRUN original-path adoption only; never launches witness or helper.
Args: independently accepted exact receipt path, receipt SHA256, filled identity SHA256.
The parent must approve these concrete pins and this procedure before invocation.
"""
import hashlib,json,os,shutil,stat,subprocess,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH=Path('/Users/zacheryspector/studio-scratch')
CONFIG_SHA='f0ec5af36040f321410d37d7dc7d2767408e519e8537a55ceb0738e7708337d3'
EXCLUDED={'status','executionAuthorization','exactReview'}
def require(ok,msg):
 if not ok:raise RuntimeError('STOP: '+msg)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def read(path):
 p=Path(path);require(p.is_absolute() and p.resolve(strict=True)==p,'physical input '+str(p))
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  before=os.fstat(fd);require(stat.S_ISREG(before.st_mode) and before.st_nlink==1,'regular single-link input '+str(p))
  with os.fdopen(os.dup(fd),'rb') as f:raw=f.read()
  after=os.fstat(fd)
  require((before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns,before.st_ctime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns,after.st_ctime_ns),'input changed '+str(p))
  return raw,before
 finally:os.close(fd)
def durable(path,raw):
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(raw);f.flush();os.fsync(f.fileno())
def sync(path):
 fd=os.open(path,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:os.fsync(fd)
 finally:os.close(fd)
def encoded(v):return (json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
def command(argv,cwd=REPO,env=None,allowed=(0,)):
 p=subprocess.run(argv,cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=30)
 require(p.returncode in allowed,'command failed '+argv[0]);return p.stdout

def external_final_grant_contract(config, profile=None):
 # Source contract only; final runtime permission remains external and issued last.
 values={}
 for key in ('externalFinalGrantDesign','externalFinalGrantContractReview','externalFinalGrantContractAdoption','causalOrderDesign','causalOrderContractReview','causalOrderContractAdoption'):
  expected=config[key];require(set(expected)=={'path','bytes','sha256'},'exact external grant contract role shape');raw,_=read(expected['path']);require(len(raw)==expected['bytes'] and sha(raw)==expected['sha256'],'external grant contract pin '+key);values[key]=json.loads(raw)
 owner=values['externalFinalGrantContractAdoption'];review=values['externalFinalGrantContractReview']
 require(owner['status']=='ROOT_ADOPTED_SOURCE_CONTRACT_EXTERNAL_FINAL_WITNESS_GRANT' and owner['executionAuthorization'] is False and owner['sourcePreparationAuthorized'] is True and owner['bindingWitnessGrantMustBeExplicitNull'] is True and owner['frozenObserverAndAdaptersRemainUnchanged'] is True,'exact external grant source contract')
 require(owner['design']==config['externalFinalGrantDesign'] and owner['independentReview']==config['externalFinalGrantContractReview'] and owner['semanticExclusionsExactly']==['status','executionAuthorization','exactReview'],'source contract role and unchanged exclusions')
 require(review['decision']=='ACCEPT_SOURCE_ONLY_EXTERNAL_FINAL_WITNESS_GRANT_ORDERING_DESIGN' and review['executionAuthorization'] is False and review['design']==config['externalFinalGrantDesign'],'independent external grant source contract')
 require(EXCLUDED=={'status','executionAuthorization','exactReview'} and config['bindingWitnessGrantExplicitNull'] is True and config['externalFinalGrantIssuanceAfterAdoptedPreflightRequired'] is True,'external grant semantics')
 if profile is not None:require('witnessGrant' in profile and profile['witnessGrant'] is None,'immutable binding witnessGrant must remain explicit null')
 causal=values['causalOrderContractAdoption'];causalreview=values['causalOrderContractReview']
 require(causal['status']=='ROOT_ADOPTED_SOURCE_ONLY_A208_CAUSAL_ORDER_CONTRACT' and causal['executionAuthorization'] is False and causal['knownBeforeFillConfigOnly'] is True and causal['beforeFillAuthorityScopeOnly'] is True and causal['finalExternalGrantAfterActualAdoptedPreflight'] is True and causal['witnessGrantBindingExplicitNullPermanent'] is True,'exact causal source contract')
 require(causal['design']==config['causalOrderDesign'] and causal['independentReview']==config['causalOrderContractReview'] and causal['archiveOriginals']==6 and causal['adoptionFields']==['status','executionAuthorization','exactReview'] and causal['semanticExclusions']==['status','executionAuthorization','exactReview'],'causal source roles and original adoption')
 require(causalreview['decision']=='ACCEPT_SOURCE_ONLY_A208_PREPARATION_CAUSAL_ORDER_CONTRACT_DESIGN' and causalreview['executionAuthorization'] is False and causalreview['design']==config['causalOrderDesign'],'independent causal source contract')
 require(not any(key in config for key in ('actualGuardAfterFill','adoptedPreflight','witnessGrant')),'before-fill config must not contain future observations')
 return owner

def current_operational_roles(config):
 # Exact actual roles filled in a fresh independently reviewed config; scope is design only.
 for key in ('actualOperationalRuntimeAuthority','actualGuardBaseline'):
  require(isinstance(config.get(key),dict),'current AL observed protection role pending '+key)
 require(isinstance(config.get('actualOperationalRuntimeAuthorityExpectedStatus'),str),'actual protection status pending')
 require(config['actualOperationalRuntimeAuthority']!=config['sourceScopeAdoption'],'source-only scope is not observed protection authority')
 names=['publishedReadback','sourceScopeAdoption','actualOperationalRuntimeAuthority','actualGuardBaseline']
 values={}
 for key in names:
  expected=config[key];raw,_=read(expected['path']);require(sha(raw)==expected['sha256'] and len(raw)==expected['bytes'],'exact current operational role '+key);values[key]=json.loads(raw)
 publication=values['publishedReadback'];scope=values['sourceScopeAdoption'];authority=values['actualOperationalRuntimeAuthority']
 require(publication['status']=='PUSHED_REMOTE_AND_COMMITTED_TREE_VERIFIED' and publication['head']==publication['trackingWorkingHead']==config['productionHead'] and publication['sourceTree']==config['productionSourceTree'] and publication['workingTreeClean'] is True and publication['docsOnlyTransitionVerified'] is True,'current published AL role')
 require(scope['status']=='PARENT_ADOPTED_A208_OPERATIONAL_GUARD_SCOPE_ONLY' and scope['productionGuardHead']==config['productionHead'] and scope['productionSourceTree']==config['productionSourceTree'] and scope['executionAuthorization'] is False and scope['combinedHFirstRouteUnchanged'] is True and scope['H8708Waived'] is False and scope['operationalTransition']['actualHead']==config['productionHead'] and scope['operationalTransition']['docsOnlyVerified'] is True and scope['remoteRefsVerified']==config['operationalRemoteRefs'],'truthful current source-only scope')
 require(authority['status']==config['actualOperationalRuntimeAuthorityExpectedStatus'] and authority['status']!=scope['status'],'exact observed protection authority status')
 require(authority['schema']=='1370-root-a208-observed-before-fill-operational-authority/v1' and authority['status']=='ROOT_ADOPTED_OBSERVED_AL_A208_BEFORE_FILL_BASELINE_ONLY' and authority['beforeFillProtectionAccepted'] is True and authority['executionAuthorization'] is False and authority['protectedFreezeContinues'] is True and authority['combinedHFirstRouteUnchanged'] is True and authority['H8708Waived'] is False and authority['actualFillGrant'] is None and authority['gameGrant'] is None,'honest before-fill-only observed authority')
 require(authority['productionHead']==config['productionHead'] and authority['productionSourceTree']==config['productionSourceTree'] and authority['operationalRemoteRefs']==config['operationalRemoteRefs'] and authority['actualGuardBaseline']==config['actualGuardBaseline'] and authority['roles']['actualScope']==config['sourceScopeAdoption'] and authority['roles']['publishedReadback']==config['publishedReadback'] and authority['roles']['actualControlsAdoption']['sha256']==config['roles']['actualControlsAdoption']['sha256'],'observed baseline/current source role linkage')
 baseline=values['actualGuardBaseline'];require(baseline['schema']=='1370-a208-current-operational-full-guard-snapshot-r2' and baseline['status']=='GUARDS_ACCEPTED_READONLY' and baseline['phase']=='before-fill' and baseline['baseline'] is None and baseline['configSha256']==authority['roles']['config']['sha256'] and baseline['snapshotProcedureSha256']==authority['roles']['guardSource']['sha256'] and baseline['immutable']['operationalProductionHead']==config['productionHead'] and baseline['immutable']['operationalSourceTree']==config['productionSourceTree'],'actual admitted before-fill producer/source phase')
 return values

def reviewed_after_fill(config, review):
 # Existing exact candidate review is the actual after-fill admission carrier.
 require(review.get('actualGuardBaseline')==config['actualGuardBaseline'] and review.get('operationalRuntimeAuthority')==config['actualOperationalRuntimeAuthority'],'exact review before-fill roles')
 require(review.get('causalOrderContractAdoption')==config['causalOrderContractAdoption'],'exact review causal contract')
 role=review.get('actualGuardAfterFill');require(isinstance(role,dict) and set(role)=={'path','bytes','sha256'} and isinstance(role['path'],str) and type(role['bytes']) is int and role['bytes']>0 and isinstance(role['sha256'],str) and len(role['sha256'])==64,'exact actual after-fill role shape')
 require(role!=config['actualGuardBaseline'],'after-fill is separate actual observation')
 raw,_=read(role['path']);require(len(raw)==role['bytes'] and sha(raw)==role['sha256'],'actual after-fill raw pin');after=json.loads(raw)
 baserole=config['actualGuardBaseline'];baseraw,_=read(baserole['path']);require(len(baseraw)==baserole['bytes'] and sha(baseraw)==baserole['sha256'],'admitted actual baseline raw pin');base=json.loads(baseraw)
 schema='1370-a208-current-operational-full-guard-snapshot-r2'
 require(base['schema']==after['schema']==schema and base['status']==after['status']=='GUARDS_ACCEPTED_READONLY' and base['phase']=='before-fill' and after['phase']=='after-fill','exact real fullguard producer schema/status/phases')
 require(after['baseline']=={'path':baserole['path'],'sha256':baserole['sha256']} and after['configSha256']==base['configSha256'] and after['snapshotProcedureSha256']==base['snapshotProcedureSha256'] and after['admission']==base['admission'] and after['immutable']==base['immutable'],'actual after-fill baseline/producer/full immutable equality')
 require(base['immutable']['operationalProductionHead']==config['productionHead'] and base['immutable']['operationalSourceTree']==config['productionSourceTree'] and base['immutable']['parentScopeAdoption']=={'path':config['sourceScopeAdoption']['path'],'sha256':config['sourceScopeAdoption']['sha256']},'actual fullguard current AL/source/scope')
 return role

def main():
 require(sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==4,'invoke Python -B with exact receipt/hash/identity hash')
 configraw,_=read(HERE/'CONFIG-PENDING.json');require(sha(configraw)==CONFIG_SHA,'config drift');config=json.loads(configraw)
 external_final_grant_contract(config)
 current_operational_roles(config)
 draft=Path(config['candidatePath']);binding=Path(config['bindingPath']);archive=Path(config['archivePath']);output=Path(config['adoptionOutputPath'])
 require(draft.resolve(strict=True)==draft and draft.parent==SCRATCH and archive.parent==SCRATCH and output.parent==SCRATCH,'owned physical paths')
 require(not os.path.lexists(archive) and not os.path.lexists(output),'archive/adoption output already used')
 identityraw,_=read(draft/'DRAFT-IDENTITY.json');require(sha(identityraw)==sys.argv[3],'approved filled identity hash');identity=json.loads(identityraw)
 require(identity['draftPath']==str(draft) and identity['bindingPath']==str(binding) and identity['productionHead']==config['productionHead'],'filled identity roles')
 reviewpath=Path(sys.argv[1]);reviewraw,_=read(reviewpath);require(sha(reviewraw)==sys.argv[2],'approved exact receipt hash');review=json.loads(reviewraw)
 for k,v in {'decision':'ACCEPT_EXACT_FILLED_UNRUN','reviewedDraftBindingSha256':identity['draftBindingSha256'],'bindingSemanticSha256':identity['bindingSemanticSha256'],'candidatePinsSha256':identity['candidatePinsSha256'],'productionHead':config['productionHead'],'sourcePinsSha256':identity['sourcePinsSha256'],'adoptionProcedureSha256':sha(read(Path(__file__).resolve())[0]),'fillProcedureSha256':sha(read(HERE/'fill_actual_candidate.py')[0])}.items():require(review.get(k)==v,'exact receipt role '+k)
 require(str(binding) in (review.get('bindingPath'),review.get('reviewedBindingPath'),review.get('draftBindingPath')) or str(draft) in (review.get('draftPath'),review.get('reviewedDraftPath'),review.get('candidatePath')),'exact original path missing')
 require(review.get('externalFinalGrantContractAdoption')==config['externalFinalGrantContractAdoption'] and review.get('bindingWitnessGrantExplicitNull') is True,'exact review must admit intentional external final grant arrangement')
 reviewed_after_fill(config,review)
 old,oldstat=read(binding);require(sha(old)==identity['draftBindingSha256'],'draft binding drift');profile=json.loads(old)
 external_final_grant_contract(config,profile)
 require(profile['operationalRuntimeAuthority']==config['actualOperationalRuntimeAuthority'] and profile['productionHeadAtPreparation']==config['productionHead'],'current AL actual binding roles')
 require(profile['status']=='DRAFT_FILLED_UNREVIEWED_UNRUN' and profile['executionAuthorization'] is False and profile['exactReview'] is None,'draft already adopted')
 semantic={k:v for k,v in profile.items() if k not in EXCLUDED};require(sha(json.dumps(semantic,sort_keys=True,separators=(',',':')).encode())==identity['bindingSemanticSha256'],'semantic drift')
 require(semantic==json.loads(read(draft/'BINDING-SEMANTIC.json')[0]),'semantic artifact drift')
 require(set(identity['files'])=={'BINDING-DRAFT.json','BINDING-SEMANTIC.json','DRAFT-REPORT.json','CANDIDATE-PINS.json','LAUNCH-SPEC-DRAFT.json'},'filled file set')
 require({p.name for p in draft.iterdir()}==set(identity['files'])|{'DRAFT-IDENTITY.json'},'unexpected filled files')
 originals={'DRAFT-IDENTITY.json':identityraw}
 for name,h in identity['files'].items():
  raw,_=read(draft/name);require(sha(raw)==h,'filled artifact drift '+name);originals[name]=raw
 report=json.loads(originals['DRAFT-REPORT.json']);require(report['actualGuardBaseline']==config['actualGuardBaseline'] and report['operationalRuntimeAuthority']==config['actualOperationalRuntimeAuthority'] and report['causalOrderContractAdoption']==config['causalOrderContractAdoption'],'filled known-before-fill provenance');admission=report['materializationReceipt'];receipt_raw,_=read(admission['path']);receipt=json.loads(receipt_raw)
 require(sha(receipt_raw)==admission['sha256'] and receipt['decision']==admission['decision'] and admission['decision'].startswith('ACCEPT_OBSERVED_') and any(x in admission['decision'] for x in ('MATERIALIZ','COPY')),'observed materialization receipt drift')
 root=Path(config['materializedRoot']);require(str(root) in [receipt.get(k) for k in ('materializedRoot','scratchRoot','repoRoot','reviewedMaterializedRoot')],'observed receipt root')
 require(profile['repoRoot']==str(root) and root.resolve(strict=True)==root and root.is_dir(),'completed physical root')
 root_stat=root.stat();root_rec=report['rootIdentity'];require((root_stat.st_dev,root_stat.st_ino,format(stat.S_IMODE(root_stat.st_mode),'04o'),root_stat.st_mtime_ns,root_stat.st_ctime_ns)==(root_rec['device'],root_rec['inode'],root_rec['mode'],root_rec['mtimeNs'],root_rec['ctimeNs']),'completed root metadata drift')
 mraw,_=read(config['materializerBindingPath']);m=json.loads(mraw);require(sha(mraw)==report['materializerBindingSha256'] and m['scratchRoot']==str(root),'materializer binding drift')
 materialized_output=Path(m['outputRoot']);require(not os.path.lexists(materialized_output/'SUPERVISOR-OVERRIDE-STOP.json'),'authoritative copy override STOP')
 supervisorraw,_=read(materialized_output/'SUPERVISOR.json');supervisor=json.loads(supervisorraw);workerraw,_=read(materialized_output/'RESULT.json');worker=json.loads(workerraw)
 require(sha(supervisorraw)==report['materializerActualSupervisorSha256'] and sha(workerraw)==report['materializerActualResultSha256'],'observed actual copy receipt byte drift')
 require(supervisor['status']=='MATERIALIZED_UNREVIEWED_UNRUN' and worker['status']=='MATERIALIZED_UNREVIEWED_UNRUN' and supervisor['specSha256']==sha(mraw) and worker['specSha256']==sha(mraw) and supervisor['recorderSha256']==sha(workerraw),'actual materialization evidence drift')
 require(supervisor.get('workerExit')==0 and supervisor.get('timedOut') is False and supervisor.get('workerGroupClear') is True and supervisor.get('childGroupClear') is True and worker.get('groupClear') is True,'copy exit/group evidence')
 require(not os.path.lexists(m['recorderLockPath']) and not os.path.lexists(SCRATCH/'HEAVY-LANE-LOCK'),'active copy/heavy lock')
 for name,role in config['roles'].items():
  raw,st=read(role['path']);require(sha(raw)==role['sha256'] and format(stat.S_IMODE(st.st_mode),'04o')==role['mode'],'source/adapter/tool drift '+name)
 source=Path(config['roles']['witnessSourcePins']['path']).parent;pins=json.loads(read(source/'SOURCE-PINS.json')[0])
 for name,pin in pins['files'].items():
  raw,_=read(source/name);require(pin=={'sha256':sha(raw),'bytes':len(raw)},'witness source drift '+name)
 for rel,rec in report['actualFiles'].items():
  raw,st=read(root/rel);require(sha(raw)==rec['sha256'] and (st.st_dev,st.st_ino,format(stat.S_IMODE(st.st_mode),'04o'),len(raw),st.st_nlink)==(rec['device'],rec['inode'],rec['mode'],rec['bytes'],rec['links']),'actual worktree/runtime identity drift '+rel)
 node=report['actualNode'];raw,st=read(node['path']);require(sha(raw)==node['sha256'] and (st.st_dev,st.st_ino,format(stat.S_IMODE(st.st_mode),'04o'))==(node['device'],node['inode'],node['mode']),'actual Node drift')
 runner=Path(report['runner']['path']);require(runner.is_symlink() and os.readlink(runner)==report['runner']['target'] and str(runner.resolve(strict=True))==report['runner']['resolved'],'runner link drift')
 env=dict(os.environ,**report['launchEnvironment']);git=[m['gitPath'],'-c','gc.auto=0','-c','maintenance.auto=0']
 for where,head in ((REPO,config['productionHead']),(root,profile['sourceSha'])):
  require(command(git+['rev-parse','HEAD'],where,env).decode().strip()==head,'HEAD drift');require(command(git+['status','--porcelain=v1','-z','--untracked-files=all'],where,env)==b'','dirty repository')
 require(command(git+['rev-parse','HEAD:src'],REPO,env).decode().strip()==config['productionSourceTree'],'production source drift')
 require(command(git+['ls-remote','origin','refs/heads/wip/headless-program-20260916-ts','refs/heads/main'],REPO,env).decode()==''.join(config['operationalRemoteRefs'][key]+'\t'+key+'\n' for key in sorted(config['operationalRemoteRefs'])),'live current AL refs drift')
 require(b'AC Power' in command(['/usr/bin/pmset','-g','batt']),'AC unavailable');require(command(['/usr/sbin/sysctl','-n','kern.bootsessionuuid']).decode().strip()==config['bootSessionUuid'],'boot session identity drift')
 require(shutil.disk_usage(SCRATCH).free>=3*1024**3+128*1024**2,'disk floor/reserve')
 require(not any('fixture_worker.py' in line or (line.split() and line.split()[0].endswith('node') and ('vitest' in line or '/bin/tsc' in line or '/lib/tsc.js' in line)) for line in command(['/bin/ps','-axo','comm=,args=']).decode().splitlines()),'fixture/heavy activity')
 require(command(['/bin/ps','-p','25951,29271','-o','pid='],allowed=(0,1))==b'','old numeric PID needs identity review')
 import importlib.util
 materializer_path=Path(m['materializerPath']);require(sha(read(materializer_path)[0])==m['materializerSha256'],'FD guard bytes');spec=importlib.util.spec_from_file_location('r6_witness_adoption_fd_guard',materializer_path);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);module.assert_no_protected_writable_fds(m)
 lane=Path(config['laneParent']);require(lane.resolve(strict=True)==lane and stat.S_IMODE(lane.lstat().st_mode)==0o700,'lane parent drift')
 for p in (Path(config['laneLog']),Path(config['laneLog']+'.meta')):require(not os.path.lexists(p),'lane path used')
 archive.mkdir(mode=0o700)
 manifest={'schema':'1370-witness-r7-pre-adoption-archive-r2','draftPath':str(draft),'count':len(originals),'files':{}}
 for name,raw in originals.items():durable(archive/name,raw);require(read(archive/name)[0]==raw,'archive verification '+name);manifest['files'][name]={'sha256':sha(raw),'bytes':len(raw)}
 sync(archive);sync(SCRATCH);output.mkdir(mode=0o700);durable(output/'ARCHIVE-MANIFEST.json',encoded(manifest));sync(output);sync(SCRATCH)
 for name,raw in originals.items():require(read(draft/name)[0]==raw,'original changed after archive '+name)
 adopted=dict(profile);adopted.update(status='REVIEWED_FILLED_UNRUN',executionAuthorization=True,exactReview={'path':str(reviewpath),'sha256':sys.argv[2],'decision':'ACCEPT_EXACT_FILLED_UNRUN'})
 require({k for k in profile if profile[k]!=adopted[k]}==EXCLUDED,'unexpected field changes');new=encoded(adopted);newsha=sha(new)
 temp=draft/'.BINDING-DRAFT.json.adopting';durable(temp,new);now,nowstat=read(binding);require(now==old and (nowstat.st_dev,nowstat.st_ino,nowstat.st_mtime_ns,nowstat.st_ctime_ns)==(oldstat.st_dev,oldstat.st_ino,oldstat.st_mtime_ns,oldstat.st_ctime_ns),'binding replaced before adoption');os.replace(temp,binding);sync(draft)
 require(read(binding)[0]==new,'adopted readback')
 for name,raw in originals.items():
  if name!='BINDING-DRAFT.json':require(read(draft/name)[0]==raw,'other artifact changed '+name)
 launch=json.loads(originals['LAUNCH-SPEC-DRAFT.json']);launch.update(status='ADOPTED_UNRUN_PREFLIGHT_REQUIRED',launchAuthorized=False,bindingSha256=newsha,exactReview=adopted['exactReview']);launch['argv'][-1]=newsha;durable(output/'ADOPTED-LAUNCH-SPEC.json',encoded(launch))
 result={'schema':'1370-witness-r7-adoption-result-r2','status':'ADOPTED_UNRUN_PREFLIGHT_REQUIRED','bindingPath':str(binding),'oldBindingSha256':sha(old),'newBindingSha256':newsha,'bindingSemanticSha256':identity['bindingSemanticSha256'],'changedFields':sorted(EXCLUDED),'fieldDiff':{k:{'before':profile[k],'after':adopted[k]} for k in sorted(EXCLUDED)},'archivePath':str(archive),'archiveManifestSha256':sha(read(output/'ARCHIVE-MANIFEST.json')[0]),'adoptedLaunchSpecSha256':sha(read(output/'ADOPTED-LAUNCH-SPEC.json')[0]),'claimLimit':'Adoption only; fresh independent adopted preflight including full protected bytes/dependency/root/FD/disk/no-detach/argv review required before one witness lane.'}
 durable(output/'ADOPTION-RESULT.json',encoded(result));sync(output);print(json.dumps(result,sort_keys=True))
if __name__=='__main__':main()
