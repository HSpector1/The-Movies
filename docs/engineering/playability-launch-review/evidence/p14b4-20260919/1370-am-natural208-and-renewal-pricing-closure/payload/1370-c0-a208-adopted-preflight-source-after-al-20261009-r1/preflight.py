#!/usr/bin/env python3
"""Source-only composition of original permitted adopted preflight.
Args: parent-approved external config path and exact raw config SHA.
Reuse admitted full after-fill observations only under protected freeze;
repeat original current checks and protected physical roots, authenticate
actual adopted raw binding/archive/auth-three changes/exact launch proposal.
No new full inventory, Node, sandbox or game. Parent grants observation only.
"""
import datetime,hashlib,importlib.util,json,os,shutil,stat,subprocess,sys,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH=Path('/Users/zacheryspector/studio-scratch')
CONFIG_SHA='20c3022895e55ad0f5e84a60014ee3416fe5b6c8f8545087e8b7d4e2b3c22b41'
EXCLUDED={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
def require(ok,msg):
 if not ok:raise RuntimeError('STOP: '+msg)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':')).encode()
def read(path,expected_links=1):
 p=Path(path);require(p.is_absolute() and p.resolve(strict=True)==p,'physical input '+str(p))
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);require(stat.S_ISREG(a.st_mode) and a.st_nlink==expected_links,'regular input with expected link count '+str(p))
  with os.fdopen(os.dup(fd),'rb') as f:raw=f.read()
  b=os.fstat(fd);require((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(b.st_dev,b.st_ino,b.st_size,b.st_mtime_ns,b.st_ctime_ns),'input changed '+str(p));return raw
 finally:os.close(fd)
def write(path,raw):
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(raw);f.flush();os.fsync(f.fileno())
def dump(path,value):write(path,(json.dumps(value,sort_keys=True,indent=2)+'\n').encode())
def command(argv,allowed=(0,)):
 p=subprocess.run(argv,cwd=REPO,env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1',GIT_OPTIONAL_LOCKS='0'),stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=180)
 require(p.returncode in allowed,'command exit '+str(p.returncode)+' '+argv[0]);return p

def directory_identity(path):
 p=Path(path);require(p.resolve(strict=True)==p and p.is_dir() and not p.is_symlink(),'physical directory '+str(p));s=p.lstat()
 return {'path':str(p),'device':s.st_dev,'inode':s.st_ino,'mode':stat.S_IMODE(s.st_mode),'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns}
def ancestry(path):
 result=[]
 for p in reversed([Path(path),*Path(path).parents]):
  row=directory_identity(p);result.append({k:row[k] for k in ('path','device','inode','mode')})
 return result

def current(config,binding,module,copied,owned):
 require(command(['/usr/sbin/sysctl','-n','kern.bootsessionuuid']).stdout.decode().strip()==config['bootSessionUuid'],'boot session drift')
 old=command(['/bin/ps','-p','25951,29271','-o','pid,ppid,pgid,lstart,state,command'],allowed=(0,1));require(old.returncode==1,'old numeric PID requires identity review')
 raw=command(['/bin/ps','-axo','pid=,ppid=,pgid=,lstart=,state=,comm=,args=']).stdout
 # Preserve complete identities; a second comm/args view avoids positional lstart parsing.
 lines=command(['/bin/ps','-axo','comm=,args=']).stdout.decode().splitlines()
 markers=('fixture_worker.py','vitest','/bin/tsc','/lib/tsc.js','witness.mts','outer-recorder.py','/1370-c0-aging-era-employment-witness-source-','/1370-c0-m0-operational-materializer-proposal-','/1370-c0-m0-recorded-materialization-route-proposal-','/1370-c0-m0-additive-recorded-route-proposal-')
 require(not any(any(marker in line for marker in markers) for line in lines),'fixture/heavy/witness worker activity')
 for pgid in owned:
  try:os.killpg(pgid,0)
  except ProcessLookupError:continue
  except PermissionError:raise RuntimeError('STOP: owned group clearance unknown '+str(pgid))
  raise RuntimeError('STOP: owned group survives '+str(pgid))
 require(not os.path.lexists(SCRATCH/'HEAVY-LANE-LOCK') and not os.path.lexists(binding['recorderLockPath']) and not os.path.lexists(config['m0RecorderLockPath']) and not os.path.lexists(config['additiveRecorderLockPath']),'active heavy/copy/M0/additive lock')
 power=command(['/usr/bin/pmset','-g','batt']).stdout.decode();require('AC Power' in power,'AC unavailable')
 free=shutil.disk_usage(SCRATCH).free;require(free>=config['requiredFreeBytes'],'disk floor/reserve')
 for where,head in ((REPO,config['productionHead']),(copied,binding['sourceSha'])):
  require(module.git(binding,where,'rev-parse','HEAD').decode().strip()==head,'HEAD drift '+str(where))
  require(module.git(binding,where,'status','--porcelain=v1','-z','--untracked-files=all')==b'','dirty root '+str(where))
 require(module.git(binding,REPO,'rev-parse','HEAD:src').decode().strip()==config['productionSourceTree'],'production src drift')
 require(module.git(binding,REPO,'ls-remote','origin','refs/heads/wip/headless-program-20260916-ts').decode()==config['productionHead']+'\trefs/heads/wip/headless-program-20260916-ts\n','live remote drift')
 module.assert_no_protected_writable_fds(binding)
 ephemeral=dict(binding,productionRoot=str(copied),commonGitRoot=str(copied/'.git'))
 module.assert_no_protected_writable_fds(ephemeral)
 module.assert_no_protected_writable_fds(dict(binding,productionRoot=config['retainedHParent'],commonGitRoot=config['retainedHParent']))
 module.assert_no_protected_writable_fds(dict(binding,productionRoot=config['m0FdProtectedRoot'],commonGitRoot=config['m0FdProtectedRoot']))
 lsof=command([binding['lsofPath'],'-n','-P','-w','-F0pftan']).stdout
 return {'bootSessionUuid':config['bootSessionUuid'],'power':power,'freeBytes':free,'oldNumericPidsAbsent':True,'relevantWorkersAbsent':True,'ownedGroupIdsChecked':owned,'ownedGroupClearanceClaim':bool(owned),'fdOriginalAndEphemeralAndRetainedHPassed':True,'fdOriginalM0ParentPassed':True,'psRawSha256':sha(raw),'psRawBytes':len(raw),'lsofRawSha256':sha(lsof),'lsofRawBytes':len(lsof),'psRaw':raw,'lsofRaw':lsof}

def exact_role(role):
 require(isinstance(role,dict) and set(role)=={'path','bytes','sha256'} and isinstance(role['path'],str) and type(role['bytes']) is int and role['bytes']>=0 and isinstance(role['sha256'],str) and len(role['sha256'])==64,'exact external physical role')
 raw=read(role['path']);require(len(raw)==role['bytes'] and sha(raw)==role['sha256'],'external role raw pin '+role['path']);return raw

def main():
 require(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3,'pinned Python -I -B source configPath configSHA')
 configraw=read(sys.argv[1]);require(sha(configraw)==sys.argv[2],'external preflight config raw SHA');c=json.loads(configraw)
 require(c['schema']=='1370-a208-adopted-preflight-external-role-config/v1' and c['executionAuthorization'] is False and c['protectedFreezeMustRemainTrue'] is True,'preflight is observation only under continuous protected freeze')
 for key in ('adoptedBinding','exactCandidateReview','afterFillSnapshot','adoptionResult','archiveManifest','adoptedLaunch'):require(isinstance(c.get(key),dict),'actual adopted role pending '+key)
 # Authenticated original observed-copy admission precedes every private-root read/tool.
 admission=c['observedCopyReceipt'];copied=Path(json.loads(exact_role(c['fullGuardConfig']))['copiedRoot']);receiptpath=Path(admission['path'])
 require(receiptpath.is_absolute() and str(receiptpath)!=str(copied) and not str(receiptpath).startswith(str(copied)+os.sep),'copy receipt outside private root')
 raw=read(receiptpath);require(sha(raw)==admission['sha256'],'copy receipt raw SHA');receipt=json.loads(raw)
 require(admission['decision']==receipt['decision']=='ACCEPT_OBSERVED_MATERIALIZATION_COPY' and str(copied) in [receipt.get(k) for k in ('materializedRoot','scratchRoot','repoRoot','reviewedMaterializedRoot')],'original observed copy admission')
 guardconfig=json.loads(exact_role(c['fullGuardConfig']));require(c['fullGuardConfig']['sha256']==CONFIG_SHA,'unchanged fullguard config');exact_role(c['fullGuardSource'])
 for key in ('originalParentGuardPlan','originalExactPreparationPlan','originalProcedureReview','r4Config','r4SourceReview'):exact_role(c[key])
 r4=json.loads(exact_role(c['r4Config']));require(c['adoptedBinding']['path']==r4['bindingPath'] and c['filledIdentity']['path']==str(Path(r4['candidatePath'])/'DRAFT-IDENTITY.json') and c['filledReport']['path']==str(Path(r4['candidatePath'])/'DRAFT-REPORT.json') and c['archivePath']==r4['archivePath'] and c['adoptionOutputPath']==r4['adoptionOutputPath'] and c['archiveManifest']['path']==str(Path(r4['adoptionOutputPath'])/'ARCHIVE-MANIFEST.json') and c['adoptionResult']['path']==str(Path(r4['adoptionOutputPath'])/'ADOPTION-RESULT.json') and c['adoptedLaunch']['path']==str(Path(r4['adoptionOutputPath'])/'ADOPTED-LAUNCH-SPEC.json'),'exact original R4 candidate/archive/adoption paths');require(c['knownBeforeFillAuthority']==r4['actualOperationalRuntimeAuthority'] and c['actualGuardBaseline']==r4['actualGuardBaseline'] and c['operationalRemoteRefs']==r4['operationalRemoteRefs'],'exact original R4 baseline/authority/current refs');beforeauthority=json.loads(exact_role(c['knownBeforeFillAuthority']));require(beforeauthority['status']=='ROOT_ADOPTED_OBSERVED_AL_A208_BEFORE_FILL_BASELINE_ONLY' and beforeauthority['beforeFillProtectionAccepted'] is True and beforeauthority['executionAuthorization'] is False and beforeauthority['protectedFreezeContinues'] is True and beforeauthority['actualGuardBaseline']==c['actualGuardBaseline'],'genuine before-fill authority')
 base=json.loads(exact_role(c['actualGuardBaseline']));after=json.loads(exact_role(c['afterFillSnapshot']));require(base['schema']==after['schema']=='1370-a208-current-operational-full-guard-snapshot-r2' and base['status']==after['status']=='GUARDS_ACCEPTED_READONLY' and base['phase']=='before-fill' and after['phase']=='after-fill' and after['baseline']=={'path':c['actualGuardBaseline']['path'],'sha256':c['actualGuardBaseline']['sha256']} and after['immutable']==base['immutable'],'accepted full before/after protected map continuity')
 require(c['fullGuardConfig']==beforeauthority['roles']['config'] and c['fullGuardSource']==beforeauthority['roles']['guardSource'] and after['configSha256']==c['fullGuardConfig']['sha256'] and after['snapshotProcedureSha256']==c['fullGuardSource']['sha256'] and after['admission']==admission and after['immutable']['operationalProductionHead']==r4['productionHead'] and after['immutable']['operationalSourceTree']==r4['productionSourceTree'],'actual fullguard producer/current AL')
 adoptedraw=exact_role(c['adoptedBinding']);binding=json.loads(adoptedraw);reviewraw=exact_role(c['exactCandidateReview']);review=json.loads(reviewraw);identity=json.loads(exact_role(c['filledIdentity']));report=json.loads(exact_role(c['filledReport']))
 require(binding['status']=='REVIEWED_FILLED_UNRUN' and binding['executionAuthorization'] is True and binding['witnessGrant'] is None and binding['exactReview']=={'path':c['exactCandidateReview']['path'],'sha256':c['exactCandidateReview']['sha256'],'decision':'ACCEPT_EXACT_FILLED_UNRUN'},'exact adopted binding and external final grant arrangement')
 require(review['decision']=='ACCEPT_EXACT_FILLED_UNRUN' and review['actualGuardAfterFill']==c['afterFillSnapshot'] and review['actualGuardBaseline']==c['actualGuardBaseline'] and review['operationalRuntimeAuthority']==c['knownBeforeFillAuthority'] and review['bindingWitnessGrantExplicitNull'] is True and review['causalOrderContractAdoption']==r4['causalOrderContractAdoption'] and review['externalFinalGrantContractAdoption']==r4['externalFinalGrantContractAdoption'],'existing exact review actual protections/contracts')
 for k,v in {'reviewedDraftBindingSha256':identity['draftBindingSha256'],'bindingSemanticSha256':identity['bindingSemanticSha256'],'candidatePinsSha256':identity['candidatePinsSha256'],'productionHead':r4['productionHead'],'sourcePinsSha256':identity['sourcePinsSha256']}.items():require(review[k]==v,'existing exact review role '+k)
 result=json.loads(exact_role(c['adoptionResult']));manifest=json.loads(exact_role(c['archiveManifest']));launch=json.loads(exact_role(c['adoptedLaunch']))
 excluded={'status','executionAuthorization','exactReview'};require(sha(canonical({k:v for k,v in binding.items() if k not in excluded}))==identity['bindingSemanticSha256'],'adopted semantic exact')
 require(result['schema']=='1370-witness-r7-adoption-result-r2' and result['status']=='ADOPTED_UNRUN_PREFLIGHT_REQUIRED' and result['bindingPath']==c['adoptedBinding']['path'] and result['newBindingSha256']==c['adoptedBinding']['sha256'] and result['oldBindingSha256']==identity['draftBindingSha256'] and result['bindingSemanticSha256']==identity['bindingSemanticSha256'] and result['changedFields']==sorted(excluded) and result['archivePath']==c['archivePath'] and result['archiveManifestSha256']==c['archiveManifest']['sha256'] and result['adoptedLaunchSpecSha256']==c['adoptedLaunch']['sha256'],'original actual adopter outputs')
 require(manifest['schema']=='1370-witness-r7-pre-adoption-archive-r2' and manifest['count']==6 and manifest['draftPath']==r4['candidatePath'] and set(manifest['files'])==set(identity['files'])|{'DRAFT-IDENTITY.json'},'actual archived original six')
 originals={}
 for name,pin in manifest['files'].items():
  raw=read(Path(c['archivePath'])/name);require(len(raw)==pin['bytes'] and sha(raw)==pin['sha256'],'archived original raw '+name);originals[name]=raw
 require(originals['DRAFT-IDENTITY.json']==exact_role(c['filledIdentity']) and originals['DRAFT-REPORT.json']==exact_role(c['filledReport']),'archive original identity/report')
 for name,value in identity['files'].items():require(sha(originals[name])==value,'archive original filled hash '+name)
 old=json.loads(originals['BINDING-DRAFT.json']);require({k for k in old if old[k]!=binding[k]}==excluded and {k:v for k,v in old.items() if k not in excluded}=={k:v for k,v in binding.items() if k not in excluded} and result['fieldDiff']=={k:{'before':old[k],'after':binding[k]} for k in sorted(excluded)},'original exactly three authorization mutations')
 for name,raw in originals.items():
  if name!='BINDING-DRAFT.json':require(read(Path(r4['candidatePath'])/name)==raw,'unchanged original candidate artifact '+name)
 require(launch['status']=='ADOPTED_UNRUN_PREFLIGHT_REQUIRED' and launch['launchAuthorized'] is False and launch['bindingSha256']==c['adoptedBinding']['sha256'] and launch['bindingSemanticSha256']==identity['bindingSemanticSha256'] and launch['exactReview']==binding['exactReview'],'actual unauthorized adopted launch proposal')
 expected=json.loads(originals['LAUNCH-SPEC-DRAFT.json']);expected.update(status='ADOPTED_UNRUN_PREFLIGHT_REQUIRED',launchAuthorized=False,bindingSha256=c['adoptedBinding']['sha256'],exactReview=binding['exactReview']);expected['argv'][-1]=c['adoptedBinding']['sha256'];require(launch==expected,'adopted launch original exact derivative')
 require(launch['argv'][6]==c['adoptedBinding']['path'] and launch['argv'][-1]==c['adoptedBinding']['sha256'] and launch['cwd']==str(REPO) and launch['requiredEnvironment']==report['launchEnvironment'],'exact actual argv/cwd/env')
 require(c['observedCopyReceipt']==report['materializationReceipt'] and binding['repoRoot']==str(copied) and binding['sourceSha']=='3aaf55e0c06c4b745b0b722cc56913050b1ee229' and binding['productionHeadAtPreparation']==r4['productionHead'] and binding['operationalRuntimeAuthority']==c['knownBeforeFillAuthority'],'historical source/current authority separation')
 mraw=read(c['materializerBinding']['path']);require(sha(mraw)==c['materializerBinding']['sha256']==report['materializerBindingSha256'],'original immutable copy binding');m=json.loads(mraw)
 require(m['scratchRoot']==str(copied) and m['productionHead']==r4['materializerProductionHead'] and m['status']=='REVIEWED_FILLED_UNRUN' and m['executionAuthorization'] is True and sha(canonical({k:v for k,v in m.items() if k not in EXCLUDED}))==guardconfig['bindingSemanticSha256'],'original accepted materializer semantics')
 source=Path(m['materializerPath']);require(sha(read(source))==m['materializerSha256']==guardconfig['materializerSha256'],'original read-only FD/Git helper source')
 # Import only after authenticating source and the original observed-copy gate.
 spec=importlib.util.spec_from_file_location('accepted_r6_adopted_preflight_readonly',source);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 require(Path(sys.executable).resolve(strict=True)==Path(guardconfig['requiredPythonPath']) and sha(read(guardconfig['requiredPythonPath']))==guardconfig['requiredPythonSha256'],'pinned Python identity')
 owned=c['ownedPgids'];require(isinstance(owned,list) and all(type(v) is int and v>1 for v in owned) and owned==sorted(set(owned)),'recorded supplied owned group IDs')
 strict=after['immutable']['strictRoots'];roots_before={k:directory_identity(v['path']) for k,v in strict.items()};require(roots_before==strict,'continuous protected physical roots before current checks')
 for k,v in strict.items():require(ancestry(v['path'])==after['immutable']['ancestry'][k],'continuous protected ancestry '+k)
 scratch=directory_identity(SCRATCH);require({k:scratch[k] for k in ('path','device','inode','mode')}==after['immutable']['scratchParentIdentity'],'strict scratch identity only')
 facts_before=current(guardconfig,m,module,copied,owned)
 require(module.git(m,REPO,'ls-remote','origin',*sorted(c['operationalRemoteRefs'])).decode()==''.join(c['operationalRemoteRefs'][key]+'\t'+key+'\n' for key in sorted(c['operationalRemoteRefs'])),'actual AL main+wip refs')
 for name,pin in report['roles'].items():
  raw=read(pin['path']);require(sha(raw)==pin['sha256'] and format(stat.S_IMODE(Path(pin['path']).lstat().st_mode),'04o')==pin['mode'],'original source/adapter/tool role '+name)
 pinsraw=read(report['roles']['witnessSourcePins']['path']);pins=json.loads(pinsraw);require(sha(pinsraw)==report['sourcePinsSha256'],'frozen observer18 manifest')
 for name,pin in pins['files'].items():require({'sha256':sha(read(Path(report['roles']['witnessSourcePins']['path']).parent/name)),'bytes':Path(report['roles']['witnessSourcePins']['path']).parent.joinpath(name).stat().st_size}==pin,'frozen observer file '+name)
 for rel,rec in report['actualFiles'].items():
  raw=read(copied/rel);st=(copied/rel).lstat();require(sha(raw)==rec['sha256'] and (st.st_dev,st.st_ino,format(stat.S_IMODE(st.st_mode),'04o'),len(raw),st.st_nlink)==(rec['device'],rec['inode'],rec['mode'],rec['bytes'],rec['links']),'original directly bound source/runtime identity '+rel)
 node=report['actualNode'];st=Path(node['path']).lstat();require(sha(read(node['path']))==node['sha256'] and (st.st_dev,st.st_ino,format(stat.S_IMODE(st.st_mode),'04o'))==(node['device'],node['inode'],node['mode']),'exact physical Node22')
 require(Path(shutil.which('node',path=report['launchEnvironment']['PATH'])).resolve(strict=True)==Path(node['path']),'bound Node for original shebang PATH')
 runner=Path(report['runner']['path']);require(runner.is_symlink() and os.readlink(runner)==report['runner']['target'] and str(runner.resolve(strict=True))==report['runner']['resolved'],'original contained runner')
 lane=Path(r4['laneParent']);require(directory_identity(lane)['mode']==0o700 and not os.path.lexists(r4['laneLog']) and not os.path.lexists(r4['laneLog']+'.meta'),'exclusive unused reviewed lane')
 facts_after=current(guardconfig,m,module,copied,owned);roots_after={k:directory_identity(v['path']) for k,v in strict.items()};require(roots_after==roots_before==strict,'continuous protected physical roots through adopted preflight')
 require(exact_role(c['adoptedBinding'])==adoptedraw and json.loads(exact_role(c['adoptedLaunch']))==launch,'adopted raw binding/launch unchanged through preflight')
 # No inventory/protected_snapshot/physical_source_paths call: original PLAN permits reuse only under continued protected freeze.
 output=Path(c['outputPath']);require(output.parent==SCRATCH and output.name and not os.path.lexists(output),'exclusive scratch-only preflight output');output.mkdir(mode=0o700)
 local=[]
 for label,facts in (('BEFORE',facts_before),('AFTER',facts_after)):
  for kind,key in (('PS','psRaw'),('LSOF','lsofRaw')):
   raw=facts.pop(key);q=output/(label+'-'+kind+'.LOCAL');write(q,raw);local.append({'path':str(q),'bytes':len(raw),'sha256':sha(raw),'archiveDisposition':'LOCAL_HASH_SIZE_ONLY'})
 result={'schema':'1370-a208-original-permitted-adopted-preflight-observation/v1','status':'ADOPTED_PREFLIGHT_COMPLETED_UNREVIEWED_UNRUN','executionAuthorization':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'adoptedBinding':c['adoptedBinding'],'adoptedRawBindingSha256':sha(adoptedraw),'bindingSemanticSha256':identity['bindingSemanticSha256'],'exactCandidateReview':c['exactCandidateReview'],'afterFillSnapshot':c['afterFillSnapshot'],'beforeFillBaseline':c['actualGuardBaseline'],'knownBeforeFillAuthority':c['knownBeforeFillAuthority'],'adoptionResult':c['adoptionResult'],'archiveManifest':c['archiveManifest'],'adoptedLaunch':c['adoptedLaunch'],'sourceProcedureSha256':sha(read(Path(__file__).resolve())),'externalConfigPath':sys.argv[1],'externalConfigSha256':sys.argv[2],'originalParentGuardPlan':c['originalParentGuardPlan'],'fullProtectedMapReusedUnderContinuedFreeze':True,'freshFullInventoryRun':False,'rootsBefore':roots_before,'rootsAfter':roots_after,'currentBefore':facts_before,'currentAfter':facts_after,'exactArgv':launch['argv'],'cwd':launch['cwd'],'environment':launch['requiredEnvironment'],'bounds':launch['bounds'],'rawLocalOnly':local,'ownedGroupScope':{'supplied':owned,'claimOnlyForSuppliedRecordedIds':True},'finalWitnessGrant':None,'game':False,'claimLimit':'Actual adopted raw-checksum/argv/current/root observation only; independent/root admission and exclusive external final grant still required. Complete actual after-fill full observations reused only under protected freeze per original accepted PLAN. No new full inventory, Node execution, sandbox, game or science.'}
 dump(output/'PREFLIGHT.json',result);dump(output/'RAW-LOCAL-ONLY-ROLES.json',{'rule':'Publish hash/size/path metadata only; retain all four raw current PS/LSOF payloads locally.','roles':local});dump(output/'PINS.json',{'files':{q.name:sha(read(q)) for q in sorted(output.iterdir())}})
 print(json.dumps({'status':result['status'],'preflightPath':str(output/'PREFLIGHT.json'),'preflightSha256':sha(read(output/'PREFLIGHT.json')),'pinsSha256':sha(read(output/'PINS.json')),'executionAuthorization':False,'game':False},sort_keys=True))
if __name__=='__main__':main()
