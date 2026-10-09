# SOURCE ONLY, HELD. No engine/proposal imports; no child processes or mirror writes.
import os,stat,json,hashlib,time,datetime,signal,sys,re
from pathlib import Path,PurePosixPath
HERE=Path(__file__).resolve().parent
END=None
ROLES={}
def clock_guard():
 if END is not None and time.monotonic()>=END:raise TimeoutError('STOP_READBACK_240_SECONDS')
def req(ok,msg):
 if not ok:raise AssertionError(msg)
def sig(s):return [s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns]
def open_dir(p):
 fd=os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 try:
  for part in Path(p).parts[1:]:
   nextfd=os.open(part,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd);os.close(fd);fd=nextfd
  return fd
 except BaseException:os.close(fd);raise
def read(p,expected=None,cap=32*1024*1024,git_oid=None,mode=None):
 p=Path(p);parent=open_dir(p.parent)
 try:
  named=os.stat(p.name,dir_fd=parent,follow_symlinks=False)
  req(stat.S_ISREG(named.st_mode) and named.st_nlink==1 and named.st_size<=cap,'unsafe regular input '+str(p))
  if mode is not None:req(stat.S_IMODE(named.st_mode)==mode,'file mode '+str(p))
  fd=os.open(p.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   req(sig(os.fstat(fd))==sig(named),'open identity '+str(p));h=hashlib.sha256();g=hashlib.sha1();g.update(('blob '+str(named.st_size)+'\0').encode());size=0;pieces=[]
   while True:
    b=os.read(fd,1024*1024)
    if not b:break
    size+=len(b);req(size<=cap,'read cap '+str(p));h.update(b);g.update(b)
    if not git_oid:pieces.append(b)
   req(size==named.st_size and sig(os.fstat(fd))==sig(named)==sig(os.stat(p.name,dir_fd=parent,follow_symlinks=False))==sig(p.lstat()),'retained FD/path drift '+str(p))
  finally:os.close(fd)
 finally:os.close(parent)
 digest=h.hexdigest()
 if expected:req(digest==expected,'sha256 '+str(p))
 if git_oid:req(g.hexdigest()==git_oid,'Git blob OID '+str(p))
 row={'bytes':size,'sha256':digest,'gitBlobOid':g.hexdigest(),'identity':sig(named)}
 return (b''.join(pieces) if not git_oid else None),row

def bounded_read(p,expected=None,cap=32*1024*1024,git_oid=None,mode=None):
 clock_guard();raw,row=read(p,expected,cap,git_oid,mode);clock_guard()
 ROLES[str(p)]={'path':str(p),**row};return raw,row
def obj(role):
 raw,row=bounded_read(Path(role['path']),role['sha256'],min(role['bytes'],32*1024*1024),mode=role.get('mode'))
 req(row['bytes']==role['bytes'],'role bytes');return json.loads(raw)
def fullsig(s):return [s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns]
def physical_dir(p):
 fd=open_dir(p)
 try:req(fullsig(os.fstat(fd))==fullsig(Path(p).lstat()),'physical directory identity');return fullsig(os.fstat(fd))
 finally:os.close(fd)
def absence(ids):
 req(len(ids)==3 and len(set(ids))==3 and all(type(x) is int and x>1 for x in ids),'three actual owned identities')
 for pid in ids:
  for check in (os.kill,os.killpg):
   try:check(pid,0)
   except ProcessLookupError:pass
   else:raise AssertionError('actual owned PID/PGID still present '+str(pid))
def safe(name):
 p=PurePosixPath(name);req(not p.is_absolute() and p.as_posix()==name and chr(92) not in name and all(x not in ('','..','.') for x in p.parts),'unsafe relative name');return p

def inventory(root,rootfd,expected_files,expected_dirs,target):
 files={};dirs={};links={}
 def visit(fd,prefix):
  clock_guard();before=os.fstat(fd);req(stat.S_ISDIR(before.st_mode) and stat.S_IMODE(before.st_mode)==0o700,'directory type/mode');dirs[prefix or '.']=sig(before)
  for name in sorted(os.listdir(fd)):
   rel=prefix+'/'+name if prefix else name;safe(rel);st=os.stat(name,dir_fd=fd,follow_symlinks=False)
   if stat.S_ISDIR(st.st_mode):
    req(rel in expected_dirs,'extra directory');child=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
    try:req(fullsig(os.fstat(child))==fullsig(st),'directory open race');visit(child,rel)
    finally:os.close(child)
   elif stat.S_ISREG(st.st_mode):req(rel in expected_files and st.st_nlink==1,'extra/linked file');files[rel]=sig(st)
   else:
    req(rel=='node_modules' and stat.S_ISLNK(st.st_mode) and st.st_nlink==1,'extra special path')
    text=os.readlink(name,dir_fd=fd);req(text==target and fullsig(os.stat(name,dir_fd=fd,follow_symlinks=False))==fullsig(st),'exact stable dependency link');links[rel]={'target':text,'identity':sig(st)}
  req(fullsig(os.fstat(fd))==fullsig(before),'directory changed during walk')
 visit(rootfd,'');req(set(files)==set(expected_files) and set(dirs)==set(expected_dirs) and set(links)=={'node_modules'},'complete exact expanded roster')
 req(fullsig(os.fstat(rootfd))==fullsig(Path(root).lstat()),'mirror retained FD/path');clock_guard();return files,dirs,links

def main():
 global END
 started=time.monotonic();END=started+240
 signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(TimeoutError('STOP_READBACK_240_SECONDS')));signal.setitimer(signal.ITIMER_REAL,240)
 req(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==4,'isolated exact argv')
 req(re.fullmatch('[0-9a-f]{64}',sys.argv[1]) and re.fullmatch('[0-9a-f]{64}',sys.argv[3]),'exact SHA argv')
 raw,_=bounded_read(HERE/'SOURCE-PINS.json',sys.argv[1],100000);pins=json.loads(raw)
 for r in pins['files'].values():
  raw,row=bounded_read(Path(r['path']),r['sha256'],1000000);req(row['bytes']==r['bytes'],'source file bytes')
 cfg=obj(pins['files']['CONFIG.json']);future=cfg['futureAuthority']
 req(isinstance(future,dict),'STOP_FUTURE_ACTUAL_AUTHORITY_UNFILLED') # BEFORE any output or mutable mirror/target access.
 grant=obj({'path':sys.argv[2],'sha256':sys.argv[3],'bytes':Path(sys.argv[2]).lstat().st_size})
 req(grant['decision']=='GRANT_READONLY_EXPANDED_M0_READBACK' and grant['sourcePinsSha256']==sys.argv[1] and grant['configSha256']==pins['files']['CONFIG.json']['sha256'] and grant['soleLaneReserved'] is True and grant['readbackLimitSeconds']==240,'separate exact readback grant')
 required=['binding','exactReview','preflightReview','parentToolOutcome','actualTool','helperMeta','recorderResult','supervisorResult','bodyResult','firstWritePhase','childOwned','childStdout','childStderr','originalSiblingReceipt']
 req(set(future['roles'])==set(required),'complete future actual role packet')
 packet=future['roles'];loaded={}
 for name,r in cfg['fixedRoles'].items():loaded[name]=obj(r)
 src=loaded['routeSourcePins'];review=loaded['routeSourceReview']
 req(review['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_ADDITIVE_RECORDED_ROUTE' and review['sourcePinsSha256']==cfg['fixedRoles']['routeSourcePins']['sha256'],'source review pins linkage')
 for r in src['files'].values():
  raw,row=bounded_read(Path(r['path']),r['sha256'],1000000);req(row['bytes']==r['bytes'],'all route source pins')
 for name in ['binding','exactReview','preflightReview','parentToolOutcome','actualTool','recorderResult','supervisorResult','bodyResult','firstWritePhase','childOwned','originalSiblingReceipt']:loaded[name]=obj(packet[name])
 b=loaded['binding'];outcome=loaded['parentToolOutcome'];rec=loaded['recorderResult'];sup=loaded['supervisorResult'];body=loaded['bodyResult'];phase=loaded['firstWritePhase'];owner=loaded['childOwned']
 req(grant['bindingSha256']==packet['binding']['sha256'],'grant actual binding')
 for k in ['actualToolExit','actualHelperExit','actualSupervisorExit','actualRecorderExit','actualChildExit']:req(type(outcome[k]) is int and outcome[k]==0,'actual zero '+k)
 req(outcome['unexpectedHelperWait'] is False and outcome['bindingSha256']==packet['binding']['sha256'],'actual parent authority')
 chunks=loaded['actualTool']['chunks'];req(chunks and chunks[-1]['exit_code']==0,'raw actual tool zero')
 meta,mr=bounded_read(Path(packet['helperMeta']['path']),packet['helperMeta']['sha256'],65536);req(mr['bytes']==packet['helperMeta']['bytes'],'helper meta bytes')
 lines=meta.decode().splitlines();req(len(lines)==3 and lines[0].startswith('waiting for pid 0; then: ') and lines[1].startswith('start; ') and lines[2].startswith('end, exit 0; '),'actual helper/meta zero/no waits')
 req(b['executionAuthorization'] is True and b['status']=='REVIEWED_FILLED_UNRUN','actual adopted binding')
 canonical=lambda v:json.dumps(v,sort_keys=True,separators=(',',':')).encode()
 excluded={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
 semantic=hashlib.sha256(canonical({k:v for k,v in b.items() if k not in excluded})).hexdigest();core=hashlib.sha256(canonical({k:v for k,v in b.items() if k not in excluded|{'preflightReviewPath','preflightReviewSha256'}})).hexdigest()
 req(loaded['exactReview']['decision']=='ACCEPT_EXACT_FILLED_UNRUN' and loaded['exactReview']['bindingSemanticSha256']==semantic and b['exactBindingReviewPath']==packet['exactReview']['path'] and b['exactBindingReviewSha256']==packet['exactReview']['sha256'],'actual exact receipt')
 pre=loaded['preflightReview'];req(pre['decision']=='ACCEPT_M0_ADDITIVE_PREFLIGHT' and pre['guardCoreSha256']==core and pre['productionHead']==b['productionHead'] and pre['freshProductionCommonFullProofAccepted'] is True and pre['r9PrivateRootReuseExplicitlyAccepted'] is True and b['preflightReviewPath']==packet['preflightReview']['path'] and b['preflightReviewSha256']==packet['preflightReview']['sha256'],'actual preflight authority')
 for name,field in [('add_inputs.py','materializer'),('record.py','recorder'),('supervise.py','supervisor')]:
  r=src['files'][name];req(b[field+'Path']==r['path'] and b[field+'Sha256']==r['sha256'] and review[field+'Sha256' if field!='materializer' else 'sourceSha256']==r['sha256'],'actual program source role')
 req(b['routeSourceReviewPath']==b['materializerSourceReviewPath']==cfg['fixedRoles']['routeSourceReview']['path'] and b['routeSourceReviewSha256']==b['materializerSourceReviewSha256']==cfg['fixedRoles']['routeSourceReview']['sha256'],'actual source receipt')
 req(rec['status']==sup['status']=='ADDITIVE_UNREVIEWED_UNRUN' and rec['childExit']==sup['workerExit']==0 and rec['groupClear'] is True and sup['workerGroupClear'] is True and sup['childGroupClear'] is True and sup['timedOut'] is False,'complete recorder/supervisor zero')
 req(rec['specSha256']==sup['specSha256']==packet['binding']['sha256'] and sup['recorderSha256']==packet['recorderResult']['sha256'],'actual receipt linkage')
 req(owner['workerPid']==sup['workerPid']==outcome['actualWorkerPid'] and owner['childPid']==rec['childPid']==sup['childGroup']==body['childPid']==phase['pid']==outcome['actualChildPid'],'durable numeric ownership')
 ids=[outcome['actualHelperPid'],sup['workerPid'],rec['childPid']];absence(ids)
 inputs=loaded['inputs'];facts=loaded['copyFacts'];mirror=Path(cfg['mirrorPath']);target=inputs['dependencyTarget'];output=Path(b['outputRoot'])
 req(b['mirrorPath']==str(mirror) and inputs['mirrorPath']==str(mirror) and b['productionHead']==inputs['operationalHead']==cfg['productionHead'] and b['sourceSha']==inputs['sourceCommit']==cfg['sourceCommit'] and b['productionSourceTree']==inputs['sourceTree']==cfg['sourceTree'],'exact mirror/source scope')
 req(packet['recorderResult']['path']==str(output/'RESULT.json') and packet['supervisorResult']['path']==str(output/'SUPERVISOR.json') and packet['childOwned']['path']==str(output/'CHILD-OWNED.json') and packet['bodyResult']['path']==b['additiveReceiptPath'] and packet['firstWritePhase']['path']==b['phaseReceiptPath'] and packet['childStdout']['path']==str(output/'child.stdout') and packet['childStderr']['path']==str(output/'child.stderr'),'exact output roles')
 req(body['status']=='ADDITIVE_SOURCE_INPUTS_PENDING_INDEPENDENT_EXPANDED_READBACK' and body['regularFiles']==1740 and body['regularBytes']==119393120 and body['originalFilesUnchanged']==1677 and body['bridgeFiles']==63 and body['bridgeBytes']==1517743 and body['typesReady'] is False and body['gameAccepted'] is False,'actual body completion scope')
 req(body['inputsSha256']==cfg['fixedRoles']['inputs']['sha256'] and body['mirrorPath']==str(mirror) and body['sourceCommit']==cfg['sourceCommit'] and body['sourceTree']==cfg['sourceTree'],'actual body identity')
 before=facts['materializedDirectoryIdentities']['.'];beforefull=[before[0],before[1],stat.S_IFDIR|before[2],*before[3:]]
 req(phase['status']=='ORIGINAL_PREFLIGHT_COMPLETE_FIRST_WRITE_ALLOWED' and phase['originalFiles']==1677 and phase['originalBytes']==117875377 and phase['copyFactsSha256']==cfg['fixedRoles']['copyFacts']['sha256'] and phase['mirrorPath']==str(mirror),'first-write authority')
 req(phase['rootBefore']==body['rootBefore']==rec['rootBefore']==b['originalM0RootMetadata']==beforefull,'original root before exact')
 req(body['rootAfter']==body['rootFinal']==rec['rootAfter'] and body['rootAfter'][:3]==beforefull[:3] and body['intentionalRootTransition']==['bridge directory','node_modules symlink'],'only admitted root transition')
 stdout,so=bounded_read(Path(packet['childStdout']['path']),packet['childStdout']['sha256'],33554432);stderr,se=bounded_read(Path(packet['childStderr']['path']),packet['childStderr']['sha256'],33554432)
 req(so['sha256']==rec['stdoutSha256'] and se['sha256']==rec['stderrSha256'] and se['bytes']==0 and so['bytes']+se['bytes']<=33554432,'actual child streams')
 child=json.loads(stdout);req(child['status']==body['status'] and child['receiptSha256']==rec['additiveReceiptSha256']==packet['bodyResult']['sha256'] and child['mirrorPath']==str(mirror),'actual stdout body receipt')
 req(not any(os.path.lexists(output/n) for n in ['SUPERVISOR-OVERRIDE-STOP.json','OVERRIDE-STOP.json']) and not os.path.lexists(b['recorderLockPath']),'no override or stale recorder lock')
 sibling=loaded['originalSiblingReceipt'];siblingpath=str(mirror.with_name(mirror.name+'.MATERIALIZE-RESULT.json'))
 originalSibling=cfg['originalSiblingReceipt'];req(all(packet['originalSiblingReceipt'][k]==originalSibling[k] for k in ['path','bytes','sha256']),'original sibling immutable byte role')
 req(ROLES[siblingpath]['identity']==originalSibling['identity'] and ROLES[siblingpath]['gitBlobOid']==originalSibling['gitBlobOid'],'original sibling strict physical metadata and blob identity')
 req(originalSibling['path']==siblingpath and sibling['status']=='MIRROR_MATERIALIZED_SOURCE_ONLY' and sibling['sourceCommit']==cfg['sourceCommit'] and sibling['sourceTree']==cfg['sourceTree'] and sibling['mirrorPath']==str(mirror),'original sibling preserved')
 old=facts['materializedFiles'];bridge={r['path']:r for r in inputs['bridge']['files']};req(len(old)==1677 and len(bridge)==63 and not(set(old)&set(bridge)) and len(inputs['dependencyPackages'])==21,'fixed expected cardinalities')
 expected=set(old)|set(bridge);dirs=set(facts['materializedDirectoryIdentities'])
 for name in bridge:
  parts=safe(name).parts;req(parts[0]=='bridge','bridge scope')
  dirs.update('/'.join(parts[:i]) for i in range(1,len(parts)))
 targetbefore=physical_dir(target);req(targetbefore==body['dependencyTargetIdentity'],'actual dependency target authority')
 for r in inputs['dependencyPackages']:
  pkg=obj(r);req(pkg['name']==r['name'] and pkg['version']==r['version'],'21 bounded installed package roles')
 rootfd=open_dir(mirror)
 try:
  req(fullsig(os.fstat(rootfd))==body['rootAfter']==physical_dir(mirror),'actual mirror root after')
  files0,dirs0,links0=inventory(mirror,rootfd,expected,dirs,target);rows={};total=0
  for name in sorted(expected):
   clock_guard();r=old[name] if name in old else bridge[name];mode=r['identity'][2] if name in old else 0o644;oid=r['gitBlobOid'] if name in old else r['oid']
   if name in bridge:req(r['kind']=='blob' and r['mode']=='100644','canonical bridge blob kind/mode')
   raw,row=bounded_read(mirror/name,r['sha256'],32*1024*1024,git_oid=oid,mode=mode);req(row['bytes']==r['bytes'] and row['identity']==files0[name],'exact bytes and initial identity')
   if name in old:req(row['identity']==r['identity'],'strict original file identity unchanged')
   rows[name]=row;total+=row['bytes'];req(total<=119393120,'expanded byte cap')
  req(len(rows)==1740 and total==119393120,'expanded totals')
  for name,want in facts['materializedDirectoryIdentities'].items():
   if name!='.':req(dirs0[name]==want,'strict original nonroot directory unchanged')
  files1,dirs1,links1=inventory(mirror,rootfd,expected,dirs,target);req((files1,dirs1,links1)==(files0,dirs0,links0),'complete before/after identities')
  req(fullsig(os.fstat(rootfd))==fullsig(mirror.lstat())==body['rootAfter'],'retained final root after exact')
 finally:os.close(rootfd)
 req(physical_dir(target)==targetbefore,'dependency target final unchanged');absence(ids)
 # All immutable observed receipt bytes remain pinned through readback; no new scientific or runtime admission.
 for r in packet.values():
  raw,row=bounded_read(Path(r['path']),r['sha256'],33554432);req(row['bytes']==r['bytes'],'final observed role identity')
 result={'status':'EXPANDED_M0_READBACK_CANDIDATE_AWAITING_FULL_PROTECTED_POSTFLIGHT','bindingSha256':packet['binding']['sha256'],'sourcePinsSha256':cfg['fixedRoles']['routeSourcePins']['sha256'],'actualRegularFiles':1740,'actualRegularBytes':total,'original1677StrictFileMetadataPreserved':True,'originalNonrootDirectoryMetadataPreserved':True,'bridgeFiles':63,'bridgeBytes':1517743,'symlinks':links1,'files':rows,'directories':dirs1,'originalRootBefore':beforefull,'admittedRootAfter':body['rootAfter'],'ownedPidAndPgidFreshAbsent':ids,'roleIdentities':ROLES,'sourceImported':False,'protectedInventoryRepeated':False,'fullPostflightAccepted':False,'typesReady':False,'gameAccepted':False,'executionAuthorization':False,'elapsedSeconds':time.monotonic()-started}
 raw=(json.dumps(result,indent=2,sort_keys=True)+'\n').encode();req(len(raw)<=4*1024*1024,'facts output4MiB');clock_guard()
 out=Path(cfg['outputPath']);req(out.parent==HERE.parent and not os.path.lexists(out),'fresh single scratch output');fd=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
 clock_guard();print(json.dumps({'status':result['status'],'factsPath':str(out),'factsBytes':len(raw),'factsSha256':hashlib.sha256(raw).hexdigest(),'elapsedSeconds':time.monotonic()-started}),flush=True);clock_guard()
if __name__=='__main__':
 try:main()
 except BaseException as exc:
  print(json.dumps({'status':'STOP_EXPANDED_READBACK','error':repr(exc),'noObservedAcceptance':True}),file=sys.stderr,flush=True);sys.exit(2)
 finally:signal.setitimer(signal.ITIMER_REAL,0)
