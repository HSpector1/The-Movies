#!/usr/bin/env python3
"""Original permitted current/root prelaunch reuse, no inventory or game."""
import datetime,hashlib,importlib.util,json,os,shutil,stat,subprocess,sys,time
from pathlib import Path
REPO=Path("/Users/zacheryspector/The-Movies-headless-program")
SCRATCH=Path("/Users/zacheryspector/studio-scratch")
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
 require(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3,'pinned Python-I-B externalConfigPath SHA')
 configpath=Path(sys.argv[1]);require(configpath.is_absolute() and configpath.parent in (SCRATCH,SCRATCH/'1370-ao-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r1',SCRATCH/'1370-c0-m0-current-proof-parent-recorded-after-al-20261009-r2',SCRATCH/'1370-c0-m0-types-parent-recorded-after-al-20261009-r5'),'exact external scratch config before any inputread')
 require(configpath.stat().st_size<=128*1024,'config cap');raw=read(configpath);require(sha(raw)==sys.argv[2],'actual external config SHA');c=json.loads(raw)
 require(c['schema']=='1370-root-m0-current-ao-root-prelaunch-config/v2' and c['protectedFreezeContinues'] is True and c['executionAuthorization'] is False,'observation under original protected freeze only')
 def pinned(r,cap):
  require(type(r) is dict and set(r)=={'path','bytes','sha256'} and type(r['bytes']) is int and 0<r['bytes']<=cap,'exactrole schema/cap');require(Path(r['path']).stat().st_size==r['bytes'],'role stat size');b=read(r['path']);require(len(b)==r['bytes'] and sha(b)==r['sha256'],'role exactbytes');return b
 gp=SCRATCH/'1370-ap-current-operational-fullguard-source-20261010-r1'
 require(c['guardConfig']['path']==str(gp/'CONFIG.json') and c['guardConfig']['sha256']=='2bc496099b22f228ba671a57aec531f4eb11fc5f7c3d2cc8c21b7608331f7814','unchanged originalguard config');guard=json.loads(pinned(c['guardConfig'],100000))
 require(c['guardSource']['path']==str(gp/'snapshot.py') and c['guardSource']['sha256']=='8e27bb8f5ba9ee51223da4db7fb521eac035a79b714a756b11e9d37949c9bf0f','unchanged originalguard source');pinned(c['guardSource'],100000)
 require(c['currentFullPreflightAdoption']=={'path': '/Users/zacheryspector/studio-scratch/1370-ao-root-continuation-20261010-r1/CURRENT-AO-FULL-PREFLIGHT-OBSERVED-ADOPTION.json', 'bytes': 4729, 'sha256': 'e3804904e003a7178e98c3d6d83c52ff32194f1117cef780d24c3d1c88849552'},'fixed genuine currentAO fullpreflight adoption');authority=json.loads(pinned(c['currentFullPreflightAdoption'],100000))
 require(authority['schema']=='1370-ap-root-current-ao-fullpreflight-adoption/v1' and authority['status']=='ROOT_ADOPTED_CURRENT_AO_FULL_PREFLIGHT' and authority['protectedFreezeContinues'] is True and authority['executionAuthorization'] is False and authority['game'] is False and authority['freshFullInventory'] is True,'genuine currentAO fullscan authority')
 require(authority['snapshot']==c['baseline']==c['protectedSnapshot'] and authority['config']==c['guardConfig'] and authority['guardSource']==c['guardSource'],'actual currentAO baseline and producer roles')
 for key in ('actualReadback','actualTool','independentObservedReview','sourceReview','sourcePins','sourceAdoption','snapshotPins','postOwnership'):pinned(authority[key],250000)
 accepted=json.loads(pinned(authority['independentObservedReview'],100000));require(accepted['decision']=='ACCEPT_ACTUAL_CURRENT_AO_FULL_PREFLIGHT_ONLY' and accepted['concreteFindings']==[] and accepted['executionAuthorization'] is False,'independently observed fresh fullpreflight')
 copied=Path(guard['copiedRoot']);private=SCRATCH/('1370-c0-aging-era-sparse-materialized-r6-20261008-r1');require(copied==private and not configpath.is_relative_to(private),'fixed originalcopy root/external config')
 ar=c['copyAdmission'];require(ar['sha256']=='3a43f85ec4bd0557b6ea6ef0a46d59bfc14570324ba1297e555dee3ff4d0767d' and not Path(ar['path']).is_relative_to(private),'observed copy admission before private read');admission=json.loads(pinned(ar,100000));require(admission['decision']=='ACCEPT_OBSERVED_MATERIALIZATION_COPY' and str(private) in [admission.get(k) for k in ('materializedRoot','scratchRoot','repoRoot','reviewedMaterializedRoot')],'original copy admitted')
 require(c['materializerBinding']['path']==guard['bindingPath'] and c['materializerBinding']['sha256']=='5f6de7413b9a28a9e30284062e99bf52a3ea83f9ba0074515b3257515c8b0c0f','fixed original materializer binding');m=json.loads(pinned(c['materializerBinding'],100000));require(m['scratchRoot']==str(private) and m['materializerSha256']==guard['materializerSha256'] and sha(canonical({k:v for k,v in m.items() if k not in {'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}}))==guard['bindingSemanticSha256'],'original materializer semantics')
 require(c['materializerSource']['path']==m['materializerPath'] and c['materializerSource']['sha256']==m['materializerSha256'],'original materializer source');pinned(c['materializerSource'],250000)
 require(c['originalPrelaunchSource']['sha256']=='fd2f806d140fbd74c34b130d299be20ff3382dd07e71ccf6da3f16d7c95e5fef','accepted original current/root definitions');pinned(c['originalPrelaunchSource'],100000)
 require(c['originalReusePlan']['sha256']=='acd0e3cb6ae3138f531cddba326bced7252c6f74fc13353b9ac728f68375413b','original permitted freeze reuse');pinned(c['originalReusePlan'],100000)
 snap=json.loads(pinned(c['protectedSnapshot'],16*1024*1024));base=json.loads(pinned(c['baseline'],16*1024*1024));require(c['baseline']['sha256']=='ed62b148395ad06a7e06ce68b2581097517a2483fa91c3baa4818513f358aad4','fresh admitted currentAO baseline')
 require(snap==base and snap['schema']=='1370-a208-current-operational-full-guard-snapshot-r2' and snap['status']=='GUARDS_ACCEPTED_READONLY' and snap['phase']=='before-fill' and snap['baseline'] is None,'truthful fresh before-fill baseline reuse under continuous freeze')
 require(snap['configSha256']==c['guardConfig']['sha256'] and snap['snapshotProcedureSha256']==c['guardSource']['sha256'],'actual unchanged fullguard producer/current scope')
 require(snap['immutable']['operationalProductionHead']==guard['productionHead']==authority['productionHead']=='f2f97c622db7f5332164b790d1646355e89c00f4' and snap['immutable']['operationalSourceTree']==guard['productionSourceTree']==authority['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','currentAO/src')
 spec=importlib.util.spec_from_file_location('accepted_r6_m0_prelaunch_readonly',m['materializerPath']);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 require(Path(sys.executable).resolve(strict=True)==Path(guard['requiredPythonPath']) and sha(read(guard['requiredPythonPath']))==guard['requiredPythonSha256'],'pinned Python')
 owned=c['ownedPgids'];require(type(owned) is list and all(type(v) is int and v>1 for v in owned) and owned==sorted(set(owned)),'actual recorded groups only')
 strict=snap['immutable']['strictRoots'];before={k:directory_identity(v['path']) for k,v in strict.items()};require(before==strict,'nine originalprotected roots before')
 for k,v in strict.items():require(ancestry(v['path'])==snap['immutable']['ancestry'][k],'originalprotected ancestry')
 scratch=directory_identity(SCRATCH);require({k:scratch[k] for k in ('path','device','inode','mode')}==snap['immutable']['scratchParentIdentity'],'scratch identity only')
 factsbefore=current(guard,m,module,copied,owned)
 refs=guard['operationalRemoteRefs'];require(module.git(m,REPO,'ls-remote','origin',*sorted(refs)).decode()==''.join(refs[k]+'\t'+k+'\n' for k in sorted(refs)),'currentAO advertised main/wip refs')
 require(module.git(m,REPO,'rev-parse','refs/remotes/origin/main').decode().strip()=='c902a704eb948cc576083d0973c8c23e59937dc1','actual local main remote-tracking role')
 factsafter=current(guard,m,module,copied,owned);after={k:directory_identity(v['path']) for k,v in strict.items()};require(after==before==strict,'originalprotected roots through checks')
 require(json.loads(pinned(c['protectedSnapshot'],16*1024*1024))==snap,'admitted raw snapshot stable')
 out=Path(c['outputPath']);require(out.parent==SCRATCH and not os.path.lexists(out),'fresh scratch output only');out.mkdir(mode=0o700);local=[]
 for label,facts in (('BEFORE',factsbefore),('AFTER',factsafter)):
  for kind,key in (('PS','psRaw'),('LSOF','lsofRaw')):
   b=facts.pop(key);q=out/(label+'-'+kind+'.LOCAL');write(q,b);local.append({'path':str(q),'bytes':len(b),'sha256':sha(b),'archiveDisposition':'LOCAL_HASH_SIZE_ONLY'})
 result={'schema':'1370-root-m0-current-ao-root-prelaunch-observation/v2','status':'CURRENT_AO_ROOT_PREFLIGHT_COMPLETED_UNREVIEWED','configPath':str(configpath),'configSha256':sys.argv[2],'protectedSnapshot':c['protectedSnapshot'],'baseline':c['baseline'],'currentFullPreflightAdoption':c['currentFullPreflightAdoption'],'baselinePhase':'before-fill','originalPrelaunchSource':c['originalPrelaunchSource'],'originalReusePlan':c['originalReusePlan'],'protectedFullMapReusedUnderContinuousFreeze':True,'freshFullInventoryRun':False,'scope':'OriginalA208 nineprotectedroots/R9/shareddeps/currentAO only; historical types and current M0 fullsource/dependency proofs remain separate','rootsBefore':before,'rootsAfter':after,'currentBefore':factsbefore,'currentAfter':factsafter,'rawLocalOnly':local,'executionAuthorization':False,'m0ProofOrTypesAccepted':False,'game':False}
 dump(out/'PREFLIGHT.json',result);dump(out/'RAW-LOCAL-ONLY-ROLES.json',{'roles':local});print(json.dumps({'status':result['status'],'path':str(out/'PREFLIGHT.json'),'sha256':sha(read(out/'PREFLIGHT.json'))}),flush=True)
if __name__=='__main__':main()
