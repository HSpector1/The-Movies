#!/usr/bin/env python3
"""UNRUN proposal. Original-path adoption only; does not launch any command.
Args: independently reviewed exact RECEIPT.json path, its SHA-256.
The parent must explicitly adopt the receipt and independently approve this procedure first.
"""
import hashlib, json, os, shutil, stat, subprocess, sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=Path('/Users/zacheryspector/The-Movies-headless-program')
SCRATCH=Path('/Users/zacheryspector/studio-scratch')
IDENTITY_SHA='a1d3cd613ddce69e3852f595c4452a16229ecacc929756b2b31cce6af2db8af2'
EXCLUDED={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
def require(ok,msg):
 if not ok: raise RuntimeError('STOP: '+msg)
def sha(raw): return hashlib.sha256(raw).hexdigest()
def read(path):
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  before=os.fstat(fd); require(stat.S_ISREG(before.st_mode) and before.st_nlink==1,'nonregular/hardlinked input '+str(path))
  with os.fdopen(os.dup(fd),'rb') as f: raw=f.read()
  after=os.fstat(fd)
  require((before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns,before.st_ctime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns,after.st_ctime_ns),'input changed '+str(path))
  return raw,before
 finally: os.close(fd)
def durable(path,raw):
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f: f.write(raw); f.flush(); os.fsync(f.fileno())
def directory_sync(path):
 fd=os.open(path,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try: os.fsync(fd)
 finally: os.close(fd)
def json_bytes(value): return (json.dumps(value,sort_keys=True,indent=2)+'\n').encode()
def command(argv,allowed=(0,)):
 p=subprocess.run(argv,cwd=REPO,env=dict(os.environ,GIT_OPTIONAL_LOCKS="0",PYTHONDONTWRITEBYTECODE="1"),stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=180)
 require(p.returncode in allowed,'command failed '+argv[0]); return p

def main():
 require(len(sys.argv)==3,'expected exact review path and independently approved SHA-256')
 require(not sys.flags.optimize,'optimized Python forbidden')
 require(sys.dont_write_bytecode,'invoke Python with -B to preserve pinned source packages')
 identity_raw,_=read(HERE/'DRAFT-IDENTITY.json'); require(sha(identity_raw)==IDENTITY_SHA,'identity drift')
 identity=json.loads(identity_raw); draft=Path(identity['draftPath']); binding=Path(identity['bindingPath']); archive=Path(identity['archivePath'])
 require(draft.parent==SCRATCH and draft.resolve(strict=True)==draft and draft.is_dir(),'draft physical root')
 require(archive.parent==SCRATCH and not os.path.lexists(archive),'versioned archive already used')
 result=HERE/'ADOPTION-RESULT.json'; manifestpath=HERE/'PRE-ADOPTION-ARCHIVE-MANIFEST.json'
 require(not os.path.lexists(result) and not os.path.lexists(manifestpath) and not os.path.lexists(HERE/'ADOPTED-LAUNCH-SPEC.json'),'one-shot result/manifest/spec used')
 reviewpath=Path(sys.argv[1]); reviewsha=sys.argv[2]
 require(reviewpath.is_absolute() and reviewpath.resolve(strict=True)==reviewpath and len(reviewsha)==64,'review path/hash')
 reviewraw,_=read(reviewpath); require(sha(reviewraw)==reviewsha,'review hash mismatch'); review=json.loads(reviewraw)
 required={'decision':'ACCEPT_EXACT_FILLED_UNRUN','reviewedDraftBindingSha256':identity['draftBindingSha256'],'bindingSemanticSha256':identity['bindingSemanticSha256'],'candidatePinsSha256':identity['candidatePinsSha256'],'sourcePinsSha256':identity['sourcePinsSha256'],'productionHead':identity['productionHead']}
 for k,v in required.items(): require(review.get(k)==v,'review role mismatch '+k)
 # Receipt must explicitly name this original binding/draft path to prevent approval transfer.
 require(str(binding) in (review.get('bindingPath'),review.get('reviewedBindingPath'),review.get('draftBindingPath')) or str(draft) in (review.get('draftPath'),review.get('reviewedDraftPath'),review.get('candidatePath')),'receipt missing exact original path')
 git=['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0']
 require(command(git+['rev-parse','HEAD']).stdout.decode().strip()==identity['productionHead'],'HEAD drift')
 require(command(git+['rev-parse','HEAD:src']).stdout.decode().strip()=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','source drift')
 require(command(git+['status','--porcelain=v1','-z','--untracked-files=all']).stdout==b'','dirty repository')
 require(command(git+['ls-remote','origin','refs/heads/wip/headless-program-20260916-ts']).stdout.decode()==identity['productionHead']+'\trefs/heads/wip/headless-program-20260916-ts\n','remote HEAD drift')
 require(shutil.disk_usage(SCRATCH).free>=3758096384,'free space floor')
 old,oldstat=read(binding); require(sha(old)==identity['draftBindingSha256'],'raw binding drift'); bound=json.loads(old)
 require(bound.get('status')=='DRAFT_UNREVIEWED_UNRUN' and bound.get('executionAuthorization') is False,'not unauthorized draft')
 require(all(bound.get(k) is None for k in EXCLUDED-{'status','executionAuthorization'}),'review fields already used')
 semantic={k:v for k,v in bound.items() if k not in EXCLUDED}
 require(sha(json.dumps(semantic,sort_keys=True,separators=(',',':')).encode())==identity['bindingSemanticSha256'],'semantic identity drift')
 require(semantic==json.loads(read(draft/'BINDING-SEMANTIC.json')[0]),'semantic artifact drift')
 names=identity['sevenDraftFiles']; require(len(names)==7 and set(names)=={p.name for p in draft.iterdir()},'draft file set')
 originals={}
 for name,digest in names.items():
  raw,_=read(draft/name); require(sha(raw)==digest,'draft artifact drift '+name); originals[name]=raw
 observations=json.loads(read(HERE/'OBSERVATIONS.json')[0])
 pins=json.loads(originals['CANDIDATE-PINS.json'])
 require(sha(read(HERE/'OBSERVATIONS.json')[0])==pins['freshObservationsSha256'],'observations drift')
 for rec in observations['roots'].values():
  for entry in rec['physicalAncestry']:
   p=Path(entry['path']); st=p.lstat(); require(stat.S_ISDIR(st.st_mode) and not p.is_symlink() and (st.st_dev,st.st_ino,format(stat.S_IMODE(st.st_mode),'04o'))==(entry['device'],entry['inode'],entry['mode']),'root ancestry drift '+str(p))
 for rec in observations['roles'].values():
  p=Path(rec['path']); st=p.lstat(); require(stat.S_ISREG(st.st_mode) and not p.is_symlink() and sha(p.read_bytes())==rec['sha256'] and format(stat.S_IMODE(st.st_mode),'04o')==rec['mode'],'role drift '+str(p))
 require('AC Power' in command(['/usr/bin/pmset','-g','batt']).stdout.decode(),'AC unavailable')
 require(command(['/usr/sbin/sysctl','-n','kern.bootsessionuuid']).stdout.decode().strip()=='452DE205-E1D6-462E-8673-553462BB0166','boot session identity drift')
 oldpid=command(['/bin/ps','-p','25951,29271','-o','pid,ppid,pgid,lstart,state,command'],allowed=(0,1)); require(oldpid.returncode==1,'old numeric PID requires fresh identity review')
 ps=command(['/bin/ps','-axo','comm=,args=']).stdout.decode()
 require(not any('fixture_worker.py' in line or (line.split() and line.split()[0].endswith('node') and ('vitest' in line or '/bin/tsc' in line or '/lib/tsc.js' in line)) for line in ps.splitlines()),'fixture/heavy activity')
 # Import pinned reviewed r6 guard, so adoption uses the same access-field policy.
 import importlib.util
 materializer_path=Path(bound['materializerPath'])
 require(sha(materializer_path.read_bytes())==bound['materializerSha256'],'materializer bytes changed')
 spec=importlib.util.spec_from_file_location('r6_adoption_readonly_guard',materializer_path)
 module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
 module.assert_no_protected_writable_fds(bound)
 for k in ('outputRoot','scratchRoot','recorderLockPath'): require(not os.path.lexists(bound[k]),'reserved child used '+k)
 launch=json.loads(read(HERE/'LAUNCH-SPEC.json')[0]); lane=Path(launch['lane']['parent']); log=Path(launch['lane']['log'])
 require(lane.resolve(strict=True)==lane and stat.S_IMODE(lane.lstat().st_mode)==0o700,'lane parent drift')
 for p in (log,Path(str(log)+'.meta'),SCRATCH/'HEAVY-LANE-LOCK'): require(not os.path.lexists(p),'lane path used '+str(p))
 # Archive ORIGINAL bytes first, with exclusive creation and durable verification.
 archive.mkdir(mode=0o700)
 manifest={'schema':'1370-r6-r1-pre-adoption-archive-r1','draftPath':str(draft),'archivePath':str(archive),'count':7,'draftBindingSha256':identity['draftBindingSha256'],'candidatePinsSha256':identity['candidatePinsSha256'],'bindingSemanticSha256':identity['bindingSemanticSha256'],'files':{}}
 for name,raw in originals.items():
  durable(archive/name,raw); require(read(archive/name)[0]==raw,'archive copy mismatch '+name); manifest['files'][name]={'sha256':sha(raw),'bytes':len(raw)}
 directory_sync(archive); directory_sync(SCRATCH); durable(manifestpath,json_bytes(manifest)); directory_sync(HERE)
 for name,raw in originals.items(): require(read(draft/name)[0]==raw,'original changed after archive '+name)
 adopted=dict(bound); adopted.update(status='REVIEWED_FILLED_UNRUN',executionAuthorization=True,exactBindingReviewPath=str(reviewpath),exactBindingReviewSha256=reviewsha,exactBindingReviewDecision='ACCEPT_EXACT_FILLED_UNRUN')
 require({k for k in bound if bound[k]!=adopted[k]}==EXCLUDED,'unexpected field diff')
 new=json_bytes(adopted); newsha=sha(new); temp=draft/'.BINDING-DRAFT.json.adopting'; durable(temp,new)
 now,nowstat=read(binding); require(now==old and (nowstat.st_dev,nowstat.st_ino,nowstat.st_mtime_ns,nowstat.st_ctime_ns)==(oldstat.st_dev,oldstat.st_ino,oldstat.st_mtime_ns,oldstat.st_ctime_ns),'binding changed before replacement')
 os.replace(temp,binding); directory_sync(draft)
 require(read(binding)[0]==new,'adopted bytes mismatch')
 for name,raw in originals.items():
  if name!='BINDING-DRAFT.json': require(read(draft/name)[0]==raw,'other draft artifact changed '+name)
 resultvalue={'schema':'1370-r6-r1-adoption-result-r1','status':'ADOPTED_UNRUN_PREFLIGHT_REQUIRED','bindingPath':str(binding),'oldBindingSha256':sha(old),'newBindingSha256':newsha,'bindingSemanticSha256':identity['bindingSemanticSha256'],'changedFields':sorted(EXCLUDED),'fieldDiff':{k:{'before':bound[k],'after':adopted[k]} for k in sorted(EXCLUDED)},'reviewPath':str(reviewpath),'reviewSha256':reviewsha,'archiveManifestPath':str(manifestpath),'archiveManifestSha256':sha(read(manifestpath)[0]),'claimLimit':'Adoption only; requires fresh independent adopted checksum/preflight and exact argv review before any launch.'}
 adopted_launch=dict(launch)
 adopted_launch.update(status='ADOPTED_UNRUN_PREFLIGHT_REQUIRED',launchAuthorized=False,adoptedBindingSha256=newsha,exactBindingReviewPath=str(reviewpath),exactBindingReviewSha256=reviewsha)
 adopted_launch['roles']=dict(launch['roles']); adopted_launch['roles'].pop('r6BindingDraft',None)
 st=binding.lstat(); adopted_launch['roles']['r6BindingAdopted']={'path':str(binding),'sha256':newsha,'mode':format(stat.S_IMODE(st.st_mode),'04o'),'device':st.st_dev,'inode':st.st_ino,'regular':True,'symlink':False,'links':st.st_nlink}
 adopted_launch['claimLimit']='Adopted checksum and exact argv proposal only; independent adopted preflight/launch review required. Helper prechild waits remain outside930 and unexpected waits STOP.'
 durable(HERE/'ADOPTED-LAUNCH-SPEC.json',json_bytes(adopted_launch))
 resultvalue['adoptedLaunchSpecPath']=str(HERE/'ADOPTED-LAUNCH-SPEC.json')
 resultvalue['adoptedLaunchSpecSha256']=sha(read(HERE/'ADOPTED-LAUNCH-SPEC.json')[0])
 durable(result,json_bytes(resultvalue)); directory_sync(HERE)
 print(json.dumps({'status':resultvalue['status'],'newBindingSha256':newsha,'adoptionResultSha256':sha(read(result)[0])},sort_keys=True))
if __name__=='__main__': main()
