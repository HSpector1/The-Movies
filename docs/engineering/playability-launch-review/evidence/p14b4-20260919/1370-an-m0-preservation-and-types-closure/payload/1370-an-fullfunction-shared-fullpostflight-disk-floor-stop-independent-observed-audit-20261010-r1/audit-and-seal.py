import hashlib,json,os,stat
from pathlib import Path
BASE=Path(__file__).parent;PARENT=Path('/Users/zacheryspector/studio-scratch/1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4')
def need(v,m):
 if not v:raise RuntimeError(m)
def pairs(rows):
 d={}
 for k,v in rows:need(k not in d,'duplicate key');d[k]=v
 return d
def parse(b):return json.loads(b,object_pairs_hook=pairs,parse_constant=lambda x:(_ for _ in ()).throw(ValueError(x)))
roles={}
def read(key,path=None,expected=None):
 p=Path(path if path else expected['path']);need(str(p).startswith('/Users/zacheryspector/studio-scratch/') and p.resolve(strict=True)==p,'named scratch artifact')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);need(stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=32*1024*1024,'regular bounded artifact')
  parts=[];h=hashlib.sha256()
  while True:
   b=os.read(fd,65536)
   if not b:break
   parts.append(b);h.update(b)
  z=os.fstat(fd);need((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns),'artifact changed')
  raw=b''.join(parts);role={'path':str(p),'bytes':len(raw),'sha256':h.hexdigest()}
  if expected:need(role==expected,'role mismatch')
  roles[key]=role;return raw
 finally:os.close(fd)
tool=parse(read('actualTool',str(PARENT/'ACTUAL-TOOL.json')))
grant=parse(read('grant',expected={'path':str(PARENT/'GRANT.json'),'bytes':5235,'sha256':'a397d1e42a7ae8537e1e30cb9dcea7aca77109f9cdcb532767c038031666c84c'}))
need(tool['sessionId']==7509 and tool['finalExit']==1 and tool['allToolChunks'][-1]['exit_code']==1 and tool['allToolChunks'][-1]['chunk_id']=='5c13e9','genuine terminal STOP')
launch=parse(tool['allToolChunks'][0]['output']);need(launch['grant']==roles['grant'] and launch['scannerPid']==launch['scannerPgid']==35222,'actual launch claim')
need(grant['ownedScannerPid']==grant['ownedScannerPgid']==grant['ownedScannerSid']==35222 and grant['directExecPreservesPid'] is True and grant['noHelperOriginalLockAbsentRequired'] is True,'direct own scanner')
need(grant['automaticRetry'] is False and grant['priorStopPreserved'] is True and grant['priorRouteExits']=={'toolExit':2,'helperExit':2,'recorderExit':2,'runnerExit':1},'original route STOP')
for key in ['guardSource','guardConfig','guardSourcePins','guardSourceReview','rootLauncher','actualRouteReadback']:read(key,expected=grant[key])
source=read('guardSource',expected=grant['guardSource']).decode('utf-8','strict');cfg=parse(read('guardConfig',expected=grant['guardConfig']))
stderr=read('stderr',grant['stderrPath']).decode('utf-8','strict');stdout=read('stdout',grant['stdoutPath'])
need(stdout==b'' and stderr.endswith('RuntimeError: STOP: disk floor/reserve\n'),'actual streams')
lines=source.splitlines();need(lines[59].strip()=="free=shutil.disk_usage(SCRATCH).free;require(free>=config['requiredFreeBytes'],'disk floor/reserve')",'exact guard floor source')
need(lines[145].strip()=='facts_after=current(config,binding,module,copied,owned);roots_after=roots()','exact failed after-current call')
need('line 146, in main' in stderr and 'line 60, in current' in stderr and 'line 17, in require' in stderr,'precise failure traceback')
need(lines[157].strip()=="dump(output/'SNAPSHOT.json',snapshot)" and 'dump(output/\'PINS.json\',manifest)' in lines[158],'snapshot output after failed boundary')
need(grant['guardSource']['sha256']=='9e2618b58849ccf0bc36512b20de16c23e49b2f08cdc6982ca9fe2fc20143047' and grant['guardConfig']['sha256']=='e0c7a2b839eaa1e0940665711c8e9b57af4f09738290ca5d15d828f01200b42e','unchanged admitted original scanner/config')
need(grant['actualRouteReadback']['sha256']=='568c92e332879885a53726cc359b296d4279c9f763236edeed019f7d92a06e28','genuine R4 route')
need(grant['perCommandTimeoutSeconds']==180 and grant['wholeScanDeadline'] is None,'original clock scope')
need(grant['rootLauncher']['sha256']=='a54e130d1fa13f1ab4ac8733a4e2ec63a20ecef53cdff1198c944816a5636a78','qualified original R6 postflight path adapter')
receipt={'schema':'1370-failed-shared-postflight-disk-floor-independent-observed-audit/v1','decision':'OBSERVED_SHARED_FULL_POSTFLIGHT_DISK_FLOOR_STOP_ONLY_NO_PROTECTION_ADMISSION','executionAuthorization':False,'concreteFindings':[],'findings':[],'roles':roles,'actualTool':roles['actualTool'],'grant':roles['grant'],'stderr':roles['stderr'],'stdout':roles['stdout'],'guardSource':roles['guardSource'],'guardConfig':roles['guardConfig'],'actualRouteReadback':roles['actualRouteReadback'],
 'observed':{'toolSessionId':7509,'actualFinalExit':1,'actualTerminalChunk':'5c13e9','scannerOwnedClaim':{'pid':35222,'pgid':35222,'sid':35222},'error':'RuntimeError: STOP: disk floor/reserve','sourceFailureBoundary':'snapshot.py main line146 -> current line60 -> require line17','requiredFreeBytes':cfg['requiredFreeBytes'],'actualFreeBytesAtFailure':None,'stdoutEmpty':True,'stderrRetained':True,'factsAfterIncomplete':True,'rootsAfterNotReached':True,'immutableFinalConstructionNotReached':True,'finalBaselineEqualityNotReached':True,'snapshotAndPinsEmissionNotReached':True,'inventoryMetricsUnavailable':True,'elapsedSecondsUnavailable':True,'postScannerFreshAbsenceNotClaimed':True},
 'qualification':{'originalRouteR4RemainsStop':True,'fullSharedPostflightAccepted':False,'fullProtectedMapAccepted':False,'nineRootAfterEqualityAccepted':False,'noCompletedInventoryPromotedToSnapshotSuccess':True,'snapshotRoleForAcceptance':None,'finalR4ObservedRouteAdmission':False,'priorGenerationAndFirstOverflowEvidenceRetainedSeparately':True,'missingM0AfterProofsStillMissing':True,'noAutomaticRetry':True,'noCapFloorWaiver':True,'freshSeparatelyRecordedOriginalPostRequiredByRoot':True},
 'scope':'Finite initial failed-post audit only. Authenticates original scanner/config, actual grant/transcript and precise floor refusal before final current/roots/immutable/snapshot completion. Does not accept preservation, infer complete protected maps from earlier inventory control flow, invent missing results or authorize recovery/retry.',
 'independence':{'reviewer':'/root/b109_focused_route_review','actualExecutor':'/root','method':'Named retained source/grant/streams/transcript only; no source imports, runtime, private inventory, output-directory scans or new process probes.'}}
def write(name,value):
 b=(json.dumps(value,sort_keys=True,indent=2)+'\n').encode();p=BASE/name;fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 try:os.write(fd,b);os.fsync(fd)
 finally:os.close(fd)
 need(p.read_bytes()==b,'output readback');return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
rr=write('RECEIPT.json',receipt)
b=(BASE/'audit-and-seal.py').read_bytes();sr=write('SEAL.json',{'schema':'1370-independent-failed-post-audit-seal/v1','files':{'RECEIPT.json':rr,'audit-and-seal.py':{'path':str(BASE/'audit-and-seal.py'),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}},'executionAuthorization':False})
for n in ['RECEIPT.json','SEAL.json','audit-and-seal.py']:os.chmod(BASE/n,0o444)
os.chmod(BASE,0o555)
print(json.dumps({'receipt':rr,'seal':sr}))
