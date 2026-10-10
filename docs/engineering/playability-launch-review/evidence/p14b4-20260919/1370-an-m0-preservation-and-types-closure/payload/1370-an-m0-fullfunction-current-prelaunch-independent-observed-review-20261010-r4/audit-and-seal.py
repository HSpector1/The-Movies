import hashlib,json,os,stat
from pathlib import Path
BASE=Path(__file__).parent
def need(v,m):
 if not v:raise RuntimeError(m)
def pairs(rows):
 d={}
 for k,v in rows:need(k not in d,'duplicate key');d[k]=v
 return d
def parse(b):return json.loads(b,object_pairs_hook=pairs,parse_constant=lambda x:(_ for _ in ()).throw(ValueError(x)))
def exact(a,b):
 if type(a)!=type(b):return False
 if isinstance(a,dict):return set(a)==set(b) and all(exact(a[k],b[k]) for k in a)
 if isinstance(a,list):return len(a)==len(b) and all(exact(x,y) for x,y in zip(a,b))
 return a==b
roles={}
def read(r=None,path=None,key=None):
 p=Path(r['path'] if r else path);need(str(p).startswith('/Users/zacheryspector/studio-scratch/') and p.resolve(strict=True)==p,'named scratch only')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);need(stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=32*1024*1024,'regular artifact cap')
  parts=[];h=hashlib.sha256()
  while True:
   b=os.read(fd,65536)
   if not b:break
   parts.append(b);h.update(b)
  z=os.fstat(fd);need((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns),'race')
  raw=b''.join(parts);actual={'path':str(p),'bytes':len(raw),'sha256':h.hexdigest()}
  if r:need(actual==r,'role mismatch '+p.name)
  if key:roles[key]=actual
  return raw
 finally:os.close(fd)
data=parse((BASE/'INPUT.json').read_bytes());rb=parse(read(data['readback'],key='readback'))
for k,v in rb.items():
 if isinstance(v,dict) and set(v)=={'path','bytes','sha256'}:read(v,key=k)
grant=parse(read(rb['grant']));pre=parse(read(rb['preflight']));cfg=parse(read(grant['config'],key='config'))
guard=parse(read(cfg['guardConfig'],key='guardConfig'));source=parse(read(grant['sourcePins'],key='originalCurrentSourcePins'))
for n,r in source['files'].items():read(r,key='originalCurrentSource:'+n)
prep=parse(read(data['preparationPins'],key='preparationSourcePins'))
for n,r in prep['files'].items():read(r,key='preparationSource:'+n)
prep_review=parse(read(path=data['preparationReviewPath'],key='preparationSourceReview'))
need(roles['preparationSourceReview']['sha256'].startswith(data['preparationReviewSha256']),'qualified review SHA prefix')
need(prep_review['decision']=='ACCEPT_STATIC_FULLFUNCTION_RETRY_CURRENT_PRELAUNCH_PREPARATION_SOURCE_ONLY' and prep_review['concreteFindings']==[] and prep_review['executionAuthorization'] is False and exact(prep_review['sourceManifest'],data['preparationPins']),'accepted preparation')
need(exact(grant['rootLauncher'],prep['files']['run_fullfunction_current_prelaunch_once.py']),'actual prepared launcher')
actual=parse(read(rb['actualTool']));reader=parse(read(path=data['readerActualToolPath'],key='readerActualTool'))
need(actual['toolSessionId']==67992 and actual['finalExit']==0 and actual['chunks'][-1]['exit_code']==0,'terminal scanner')
need(reader['toolSessionId']==23931 and reader['finalExit']==0 and reader['chunks'][-1]['exit_code']==0 and exact(parse(reader['chunks'][-1]['output']),data['readback']),'terminal reader')
need(grant['ownedPid']==grant['ownedPgid']==grant['ownedSid']==17359 and grant['directExecPreservesPid'] is True and grant['noHelperOriginalLockAbsentRequired'] is True,'own direct scanner')
need(grant['perCommandTimeoutSeconds']==180 and grant['actualFullInventoryRun'] is False and grant['automaticRetry'] is False and rb['newFullInventory'] is False,'original current/reuse scope')
need(rb['postOwnScannerChecks']==[{'id':17359,'kind':'pid','result':'ESRCH'},{'id':17359,'kind':'pgid','result':'ESRCH'}] and rb['scannerAbsent'] is True,'recorded scanner absences')
need(pre['protectedFullMapReusedUnderContinuousFreeze'] is True and pre['freshFullInventoryRun'] is False and cfg['protectedFreezeContinues'] is True and grant['protectedFreezeContinues'] is True and rb['protectedFreezeContinues'] is True,'continuous freeze')
latest=parse(read(rb['latestSharedFullPostflightSnapshot']));baseline=parse(read(rb['baseline']));types_snapshot=parse(read(rb['fullPostflightSnapshot']))
need(exact(latest['immutable'],baseline['immutable']) and exact(types_snapshot['immutable'],baseline['immutable']),'complete reused map equality')
need(exact(pre['rootsBefore'],pre['rootsAfter']) and exact(pre['rootsAfter'],latest['immutable']['strictRoots']) and len(pre['rootsAfter'])==9,'fresh nine strict roots exact')
need(exact(cfg['protectedSnapshot'],rb['latestSharedFullPostflightSnapshot']) and exact(pre['protectedSnapshot'],cfg['protectedSnapshot']) and exact(grant['latestSharedFullPostflightSnapshot'],cfg['protectedSnapshot']),'latest snapshot scope')
ids=[35444,35699,35700,37856]
for f in (pre['currentBefore'],pre['currentAfter']):
 for k in ['oldNumericPidsAbsent','relevantWorkersAbsent','ownedGroupClearanceClaim','fdOriginalAndEphemeralAndRetainedHPassed','fdOriginalM0ParentPassed']:need(f[k] is True,'fresh current '+k)
 need(f['ownedGroupIdsChecked']==ids and f['bootSessionUuid']==guard['bootSessionUuid'] and 'AC Power' in f['power'] and type(f['freeBytes']) is int and f['freeBytes']>=guard['requiredFreeBytes'],'fresh prior group/boot/AC/disk')
need(exact(cfg['ownedPgids'],ids) and exact(grant['ownedPgidsPassedToOriginalCurrent'],ids),'owned group args')
need(exact(grant['argv'],[guard['requiredPythonPath'],'-I','-B',grant['sourcePins']['path'].replace('SOURCE-PINS.json','original-current-root-prelaunch.py'),grant['config']['path'],grant['config']['sha256']]),'exact scanner argv')
need(pre['configSha256']==grant['config']['sha256'] and pre['configPath']==grant['config']['path'],'actual config binding')
for key in ['originalPrelaunchSource','originalReusePlan','copyAdmission','guardSource','materializerBinding','materializerSource']:read(cfg[key],key=key)
raw=parse(read(rb['rawLocalOnlyClassification']));need(exact(raw['roles'],pre['rawLocalOnly']) and len(raw['roles'])==4,'raw local four roles')
for i,r in enumerate(raw['roles']):
 need(r['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY','raw exclusion');read({k:r[k] for k in ['path','bytes','sha256']},key='rawLocalRole'+str(i))
 f=pre['currentBefore' if i<2 else 'currentAfter'];prefix='ps' if i%2==0 else 'lsof';need(r['sha256']==f[prefix+'RawSha256'] and r['bytes']==f[prefix+'RawBytes'],'raw current binding')
need(sum(r['bytes'] for r in raw['roles'])==rb['rawLocalOnlyBytes']==1520659,'raw sizes')
need(read(rb['stderr'])==b'','producer stderr')
stdout=parse(read(rb['stdout']));need(stdout['status']=='ORIGINAL_CURRENT_ROOT_PREFLIGHT_COMPLETED_UNREVIEWED' and stdout['path']==rb['preflight']['path'] and stdout['sha256']==rb['preflight']['sha256'],'actual scanner stdout')
prior=parse(read(rb['reviewedPriorStopAdoption']));need(prior['originalAttemptRemainsStop'] is True,'prior STOP preserved')
need(rb['latestSharedFullPostflightReadback']['sha256']=='ecd96dcdd8056b646f2df1c2a89da7d5aaf956b099a813cdc88c821aa8b6df10' and rb['latestSharedFullPostflightSnapshot']['sha256']=='f240937b656180b175253bf025fe13243b4591e5d05b895de1152956d44283d9','actual latest anchors')
audit={'schema':'1370-finite-current-prelaunch-r4-retained-evidence-audit/v1','roles':roles,'allRolesAuthenticated':True,'losslessTypedRootAndMapComparisons':True,'duplicateKeysRejected':True,'completeReusedImmutableEqual':True,'freshNineRootsEqual':True,'freshCurrentFactsAccepted':True,'recordedPriorOwnedGroups':ids,'recordedScannerAbsences':rb['postOwnScannerChecks'],'rawLocalFourHashSizeRolesAuthenticated':True,'rawBytesExcluded':True,'scannerActualExit':0,'readerActualExit':0,'candidateExecuted':False,'privateInventory':False,'newProcessProbes':False}
def write(name,d):
 b=(json.dumps(d,sort_keys=True,indent=2)+'\n').encode();p=BASE/name;fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 try:os.write(fd,b);os.fsync(fd)
 finally:os.close(fd)
 need(p.read_bytes()==b,'written readback');return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
ar=write('EVIDENCE-READBACK.json',audit)
receipt={'schema':'1370-current-am-fullfunction-prelaunch-independent-observed-review/v1','decision':'ACCEPT_ACTUAL_CURRENT_AM_FULLFUNCTION_PRELAUNCH_ONLY','readback':data['readback'],'preflight':rb['preflight'],'actualTool':rb['actualTool'],'readerActualTool':roles['readerActualTool'],'grant':rb['grant'],'latestSharedFullPostflightReadback':rb['latestSharedFullPostflightReadback'],'latestSharedFullPostflightSnapshot':rb['latestSharedFullPostflightSnapshot'],'reviewedPriorStopAdoption':rb['reviewedPriorStopAdoption'],'typesObservedAdoption':rb['typesObservedAdoption'],'sourceManifest':data['preparationPins'],'sourceReview':roles['preparationSourceReview'],'originalCurrentSourcePins':grant['sourcePins'],'originalCurrentSourceReview':grant['sourceReview'],'evidenceReadback':ar,'executionAuthorization':False,'concreteFindings':[],'findings':[],'scope':'Only original current prelaunch under continuous freeze and fresh current facts/nine roots; complete M0 proofs, real fixture/baseline/catch qualification remain separate.','accepted':{'actualScanner67992Exit0':True,'actualReader23931Exit0':True,'sourceAndActualArgvBoundToQualifiedPreparationR6':True,'originalPerCommand180':True,'newAggregateClock':False,'noHelperDirectOwnPidPgidSid17359':True,'fullLatestMapReuseUnderOriginalContinuousFreezeProvision':True,'completeLatestBaselineTypesSharedImmutableLosslesslyEqual':True,'freshCurrentFdProcessPriorGroupsBootAcDiskRefsAndAncestryAcceptedByOriginalProcedure':True,'freshNineRootMetadataLosslesslyEqual':True,'originalAttemptRemainsStop':True,'recordedScannerPidAndPgidFreshlyAbsent':True,'rawLocalFourRolesHashSizeOnly':True,'privateInventoryByReviewer':False,'newScansOrProbesByReviewer':False},'runtimeToolsAuthorityUnchanged':True,'fullFunctionQualificationAccepted':False,'gameAccepted':False,'typesAcceptedByThisPrelaunch':False,'independence':{'reviewer':'/root/b109_focused_route_review','actualExecutor':'/root','originalSourceAuthor':'/root/m0_types_source_review','preparationAuthor':'/root/cleanup_independent_red','method':'Finite named retained data authentication, original admitted source/argv chain and lossless typed proof comparisons only.'}}
rr=write('RECEIPT.json',receipt)
files={n:{'path':str(BASE/n),'bytes':len((BASE/n).read_bytes()),'sha256':hashlib.sha256((BASE/n).read_bytes()).hexdigest()} for n in ['INPUT.json','audit-and-seal.py','EVIDENCE-READBACK.json','RECEIPT.json']}
sr=write('SEAL.json',{'schema':'1370-independent-observed-review-seal/v1','files':files,'executionAuthorization':False})
for n in list(files)+['SEAL.json']:os.chmod(BASE/n,0o444)
os.chmod(BASE,0o555)
print(json.dumps({'receipt':rr,'seal':sr}))
