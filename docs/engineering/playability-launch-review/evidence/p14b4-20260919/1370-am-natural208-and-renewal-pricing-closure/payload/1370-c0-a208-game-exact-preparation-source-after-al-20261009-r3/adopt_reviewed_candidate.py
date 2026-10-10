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
CONFIG_SHA='96459fcc3914e1b3c535ecb2f5ebe8ef2ba7a2749b10b35104d5e8b3d5b2405d'
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
 for key in ('externalFinalGrantDesign','externalFinalGrantContractReview','externalFinalGrantContractAdoption'):
  expected=config[key];require(set(expected)=={'path','bytes','sha256'},'exact external grant contract role shape');raw,_=read(expected['path']);require(len(raw)==expected['bytes'] and sha(raw)==expected['sha256'],'external grant contract pin '+key);values[key]=json.loads(raw)
 owner=values['externalFinalGrantContractAdoption'];review=values['externalFinalGrantContractReview']
 require(owner['status']=='ROOT_ADOPTED_SOURCE_CONTRACT_EXTERNAL_FINAL_WITNESS_GRANT' and owner['executionAuthorization'] is False and owner['sourcePreparationAuthorized'] is True and owner['bindingWitnessGrantMustBeExplicitNull'] is True and owner['frozenObserverAndAdaptersRemainUnchanged'] is True,'exact external grant source contract')
 require(owner['design']==config['externalFinalGrantDesign'] and owner['independentReview']==config['externalFinalGrantContractReview'] and owner['semanticExclusionsExactly']==['status','executionAuthorization','exactReview'],'source contract role and unchanged exclusions')
 require(review['decision']=='ACCEPT_SOURCE_ONLY_EXTERNAL_FINAL_WITNESS_GRANT_ORDERING_DESIGN' and review['executionAuthorization'] is False and review['design']==config['externalFinalGrantDesign'],'independent external grant source contract')
 require(EXCLUDED=={'status','executionAuthorization','exactReview'} and config['bindingWitnessGrantExplicitNull'] is True and config['externalFinalGrantIssuanceAfterAdoptedPreflightRequired'] is True,'external grant semantics')
 if profile is not None:require('witnessGrant' in profile and profile['witnessGrant'] is None,'immutable binding witnessGrant must remain explicit null')
 return owner

def current_operational_roles(config, adopting=False):
 # Exact actual roles filled in a fresh independently reviewed config; scope is design only.
 for key in ('actualOperationalRuntimeAuthority','actualGuardBaseline'):
  require(isinstance(config.get(key),dict),'current AL observed protection role pending '+key)
 require(isinstance(config.get('actualOperationalRuntimeAuthorityExpectedStatus'),str),'actual protection status pending')
 require(config['actualOperationalRuntimeAuthority']!=config['sourceScopeAdoption'],'source-only scope is not observed protection authority')
 names=['publishedReadback','sourceScopeAdoption','actualOperationalRuntimeAuthority','actualGuardBaseline']
 if adopting:
  require(isinstance(config.get('actualGuardAfterFill'),dict),'current AL after-fill protection pending');names.append('actualGuardAfterFill')
 values={}
 for key in names:
  expected=config[key];raw,_=read(expected['path']);require(sha(raw)==expected['sha256'] and len(raw)==expected['bytes'],'exact current operational role '+key);values[key]=json.loads(raw)
 publication=values['publishedReadback'];scope=values['sourceScopeAdoption'];authority=values['actualOperationalRuntimeAuthority']
 require(publication['status']=='PUSHED_REMOTE_AND_COMMITTED_TREE_VERIFIED' and publication['head']==publication['trackingWorkingHead']==config['productionHead'] and publication['sourceTree']==config['productionSourceTree'] and publication['workingTreeClean'] is True and publication['docsOnlyTransitionVerified'] is True,'current published AL role')
 require(scope['status']=='PARENT_ADOPTED_A208_OPERATIONAL_GUARD_SCOPE_ONLY' and scope['productionGuardHead']==config['productionHead'] and scope['productionSourceTree']==config['productionSourceTree'] and scope['executionAuthorization'] is False and scope['combinedHFirstRouteUnchanged'] is True and scope['H8708Waived'] is False and scope['operationalTransition']['actualHead']==config['productionHead'] and scope['operationalTransition']['docsOnlyVerified'] is True and scope['remoteRefsVerified']==config['operationalRemoteRefs'],'truthful current source-only scope')
 require(authority['status']==config['actualOperationalRuntimeAuthorityExpectedStatus'] and authority['status']!=scope['status'],'exact observed protection authority status')
 return values

def main():
 require(sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==4,'invoke Python -B with exact receipt/hash/identity hash')
 configraw,_=read(HERE/'CONFIG-PENDING.json');require(sha(configraw)==CONFIG_SHA,'config drift');config=json.loads(configraw)
 external_final_grant_contract(config)
 current_operational_roles(config,adopting=True)
 draft=Path(config['candidatePath']);binding=Path(config['bindingPath']);archive=Path(config['archivePath']);output=Path(config['adoptionOutputPath'])
 require(draft.resolve(strict=True)==draft and draft.parent==SCRATCH and archive.parent==SCRATCH and output.parent==SCRATCH,'owned physical paths')
 require(not os.path.lexists(archive) and not os.path.lexists(output),'archive/adoption output already used')
 identityraw,_=read(draft/'DRAFT-IDENTITY.json');require(sha(identityraw)==sys.argv[3],'approved filled identity hash');identity=json.loads(identityraw)
 require(identity['draftPath']==str(draft) and identity['bindingPath']==str(binding) and identity['productionHead']==config['productionHead'],'filled identity roles')
 reviewpath=Path(sys.argv[1]);reviewraw,_=read(reviewpath);require(sha(reviewraw)==sys.argv[2],'approved exact receipt hash');review=json.loads(reviewraw)
 for k,v in {'decision':'ACCEPT_EXACT_FILLED_UNRUN','reviewedDraftBindingSha256':identity['draftBindingSha256'],'bindingSemanticSha256':identity['bindingSemanticSha256'],'candidatePinsSha256':identity['candidatePinsSha256'],'productionHead':config['productionHead'],'sourcePinsSha256':identity['sourcePinsSha256'],'adoptionProcedureSha256':sha(read(Path(__file__).resolve())[0]),'fillProcedureSha256':sha(read(HERE/'fill_actual_candidate.py')[0])}.items():require(review.get(k)==v,'exact receipt role '+k)
 require(str(binding) in (review.get('bindingPath'),review.get('reviewedBindingPath'),review.get('draftBindingPath')) or str(draft) in (review.get('draftPath'),review.get('reviewedDraftPath'),review.get('candidatePath')),'exact original path missing')
 require(review.get('externalFinalGrantContractAdoption')==config['externalFinalGrantContractAdoption'] and review.get('bindingWitnessGrantExplicitNull') is True,'exact review must admit intentional external final grant arrangement')
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
 report=json.loads(originals['DRAFT-REPORT.json']);admission=report['materializationReceipt'];receipt_raw,_=read(admission['path']);receipt=json.loads(receipt_raw)
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
