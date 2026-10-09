import os,stat,json,hashlib,collections,datetime
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');HERE=Path(__file__).parent
G=S/'1370-c0-m0-operational-full-guard-preparation-20261009-r1';P=S/'1370-c0-m0-full-guard-parent-recorded-20261009-r1'
facts={'schema':'m0-independent-observed-postflight-comparison/v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'roles':{},'rawLocalOnlyRoles':[],'inventoryRepeated':False,'physicalMirrorReadbackRepeated':False,'sourceImported':False}
def req(ok,msg):
 if not ok:raise AssertionError(msg)
def sig(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(p,expected=None,local=False):
 p=Path(p);st=p.lstat();req(stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=32*1024*1024,'regular/link/cap '+str(p));fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  req(sig(os.fstat(fd))==sig(st),'open identity')
  with os.fdopen(fd,'rb') as f:b=f.read(32*1024*1024+1);req(sig(os.fstat(f.fileno()))==sig(st)==sig(p.lstat()),'retained FD/path identity')
 except BaseException:raise
 req(len(b)==st.st_size,'bytes');h=hashlib.sha256(b).hexdigest()
 if expected:req(h==expected,'SHA '+str(p))
 role={'path':str(p),'sha256':h,'bytes':len(b)}
 if local:role['archiveBytes']=False;facts['rawLocalOnlyRoles'].append(role)
 else:facts['roles'][str(p)]=role
 return b
def obj(p,h=None):return json.loads(read(p,h))
out=obj(P/'POSTFLIGHT-TOOL-OUTCOME.json','01ac54475b7f235ede88fba9b0d2404d236d4444c531b88d6659d37306cf7264')
req(out['actualToolExit']==0 and out['actualToolSession']==66152 and out['protectedFreezeMaintained'] is True,'actual fullguard outcome')
pins=obj(G/'evidence/postflight-r1/PINS.json','da51ab104ee0d699d5f420afa8e93c02baf1a2612715bfa957d9487b8869c58d')
post=obj(G/'evidence/postflight-r1/SNAPSHOT.json','e2437a790741acdca15e515200bdc9a308062ded72e2aa5ebaeb8fd86977e6c8')
base=obj(G/'evidence/before-fill-r1/SNAPSHOT.json','28679dbcc0536c72ec9da4bff8e591b8988025101e1977914334e6f8a538ed15')
source=read(G/'snapshot.py','259c4bac30fd506a67779d2c59fd29f51c8a6f75e140f7c37f6cff625aa23a58');config=obj(G/'CONFIG.json','03d8bdfeba06f14d9f371484805f66d7fcc1013825e9d0875a4368f0d5a9033d')
grant=obj(out['postflightGrant']['path'],out['postflightGrant']['sha256'])
req(post['status']==base['status']==pins['status']=='GUARDS_ACCEPTED_READONLY' and post['phase']=='postflight' and base['phase']=='before-fill','status/phase')
req(post['immutable']==base['immutable'],'complete immutable map differs')
req(post['baseline']==out['baseline']|{} if False else post['baseline']=={'path':out['baseline']['path'],'sha256':out['baseline']['sha256']},'baseline role')
req(post['admission']==base['admission'] and post['snapshotProcedureSha256']==base['snapshotProcedureSha256']=='259c4bac30fd506a67779d2c59fd29f51c8a6f75e140f7c37f6cff625aa23a58' and post['configSha256']==base['configSha256']=='03d8bdfeba06f14d9f371484805f66d7fcc1013825e9d0875a4368f0d5a9033d','source/config/admission identity')
immutable=post['immutable'];req(immutable['operationalProductionHead']=='02d50716fe787eaed425b40f822ce91f4463deba' and immutable['operationalSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','HEAD/src')
req(immutable['retainedHLeaf']==str(S/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1'),'retained H exact leaf')
counts={}
for key in ('productionDependencies','copiedDependencies'):
 rows=immutable[key];counts[key]=dict(collections.Counter(r['type'] for r in rows.values()));req(len(rows)==12485 and counts[key]=={'regular':11060,'directory':1401,'symlink':24},'complete dependency shape')
regular=[p for p,r in immutable['productionDependencies'].items() if r['type']=='regular'];req(all(immutable['productionDependencies'][p]['inode']!=immutable['copiedDependencies'][p]['inode'] for p in regular),'regular copied inode independence')
req(len(immutable['physicalCheckout'])==176,'private physical source scope')
strict={k:v for k,v in post['rootsBefore'].items() if k!='scratchParent'};req(strict=={k:v for k,v in post['rootsAfter'].items() if k!='scratchParent'}==immutable['strictRoots'],'all strict root equality')
for when in ('Before','After'):
 c=post['current'+when];req(c['bootSessionUuid']==config['bootSessionUuid'] and 'AC Power' in c['power'] and c['freeBytes']>=config['requiredFreeBytes'],'boot/power/free')
 req(c['oldNumericPidsAbsent'] and c['relevantWorkersAbsent'] and c['fdOriginalAndEphemeralAndRetainedHPassed'] and c['ownedGroupClearanceClaim'] and c['ownedGroupIdsChecked']==[10639,10655],'current source guard/group/FD scope')
for role in out['files']:
 p=Path(role['path']);local=role['preservationAction']=='LOCAL_HASH_SIZE_ONLY';b=read(p,role['sha256'],local);req(len(b)==role['bytes'],'parent output sizes');req(p.name not in pins['files'] or pins['files'][p.name]==role['sha256'],'pins concordance')
for key in ('stdout','stderr'):
 role=out[key];b=read(role['path'],role['sha256']);req(len(b)==role['bytes'],'direct tool stream bytes')
 if key=='stdout':stdout=json.loads(b);req(stdout['status']=='GUARDS_ACCEPTED_READONLY' and stdout['snapshotSha256']==out['snapshot']['sha256'] and stdout['pinsSha256']==facts['roles'][str(G/'evidence/postflight-r1/PINS.json')]['sha256'],'direct stdout summary')
 else:req(not b,'direct stderr nonempty')
scopes=[str(Path('/Users/zacheryspector/The-Movies-headless-program')),str(Path('/Users/zacheryspector/The Movies - Unity Production Convergence 80H/.git')),config['copiedRoot'],str(Path(config['copiedRoot'])/'.git'),config['retainedHParent']]
rawAggregates={}
for prefix,current in (('BEFORE',post['currentBefore']),('AFTER',post['currentAfter'])):
 b=(G/'evidence/postflight-r1'/(prefix+'-LSOF.bin')).read_bytes();req(hashlib.sha256(b).hexdigest()==current['lsofRawSha256'] and len(b)==current['lsofRawBytes'],'raw FD current role');pid=fd=access=None;matched=numeric=0
 for field in b.split(b'\0'):
  field=field.lstrip(b'\n')
  if not field:continue
  kind,value=field[:1],field[1:]
  if kind==b'p':pid=value.decode('ascii');fd=access=None
  elif kind==b'f':fd=value.decode('ascii');access=None
  elif kind==b'a':access=value.decode('ascii')
  elif kind==b'n' and fd:
   name=value.decode('utf-8','surrogateescape')
   if any(name==scope or name.startswith(scope+os.sep) for scope in scopes):
    matched+=1
    if fd[:1].isdigit():numeric+=1;req(access in ('r','w','u'),'unknown numeric FD access')
    req(access not in ('w','u'),'protected writable FD')
 rawAggregates[prefix]={'protectedMatches':matched,'numericMatches':numeric,'writeMatches':0,'unknownNumericAccessMatches':0}
 req(current['psRawSha256']==pins['files'][prefix+'-PS.txt'],'raw PS current hash')
copy=obj(HERE/'COPY-READBACK-FACTS.json','e46dcc9cf81f7ce3462e1cdd34618f37f68ac75a90d5f95f112ee93966e96bfe')
req(copy['status']=='PHYSICAL_SOURCE_READBACK_PASSED_AWAIT_POSTFLIGHT' and copy['actualFileCount']==1677 and copy['actualBytes']==117875377 and copy['baselineGitBlobsVerified']==1672 and copy['overlaysVerified']==5,'completed physical readback')
req(copy['preoverlaySourceFileCount']==1675 and copy['preoverlaySourceBytes']==117828630 and copy['physicalFileRegularSingleLinkExactModes'] and copy['physicalDirectoriesNoSymlinksMode0700'],'physical shape')
materialization=obj(S/'1370-c0-m0-exact-parent-adoption-20261009-r1/TOOL-OUTCOME.json','a414715aea926a344c5308e9db3e006391437e3689a49d58acba57c1ae98a1fc')
for role in materialization['roles']:req(len(read(role['path'],role['sha256']))==role['bytes'],'materialization immutable output roles')
binding=obj(S/'1370-c0-m0-final-exact-candidate-20261009-r1/BINDING-DRAFT.json','71e2db2dbe2dabfbf9d885002a9096e0e291d0ed315b92129f8098e5ceada78e')
lane=Path(S/'1370-c0-m0-operational-materialization-lane-20261009-r2/c0-mirror-20261009-m0-types-r2.lane.log');lane_meta=json.loads(read(str(lane)+'.meta'))
req(lane_meta.get('exit')==0 or lane_meta.get('exitCode')==0 or lane_meta.get('command_exit_code')==0,'helper meta actual zero')
actualTotal=copy['actualBytes']+copy['recordedOutputBytes']+facts['roles'][str(lane)]['bytes']+facts['roles'][str(lane)+'.meta']['bytes']+1549
req(actualTotal<=binding['bounds']['totalNewScratchBytes'] and copy['actualBytes']<=binding['bounds']['mirrorBytes'],'actual total output budget')
groups=[]
for pgid in (10372,10639,10655,17678):
 try:os.killpg(pgid,0)
 except ProcessLookupError:groups.append(pgid)
 else:raise AssertionError('retained actual group survives')
try:os.kill(17678,0)
except ProcessLookupError:pass
else:raise AssertionError('actual snapshot PID survives')
req(not os.path.lexists(binding['recorderLockPath']) and not os.path.lexists(Path(binding['outputRoot'])/'SUPERVISOR-OVERRIDE-STOP.json'),'M0 lock/override')
facts.update(status='ACCEPT_OBSERVED_FULL_POSTFLIGHT_AND_SOURCE_COPY',immutableDeepEquality=True,dependencyCounts=counts,independentCopiedRegularInodes=len(regular),physicalPrivateSourcePaths=176,protectedDigests=immutable['protectedDigests'],strictProtectedRoots=len(strict),currentBeforeAfterWorkerChildGroups=[10639,10655],freshActualOwnedGroupsAbsent=groups,snapshotPidAbsent=True,rawFdPermittedAggregates=rawAggregates,actualNewScratchBytes=actualTotal,mirrorSourceFiles=copy['actualFileCount'],mirrorSourceBytes=copy['actualBytes'],noTypesReadyClaim=True,noHistoricalHScientificWaiver=True,acceptedSourceOnly=True)
raw=(json.dumps(facts,indent=2,sort_keys=True)+'\n').encode();fd=os.open(HERE/'POSTFLIGHT-COMPARISON-FACTS.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
print(json.dumps({'status':facts['status'],'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'dependencyCounts':counts,'rawFdPermittedAggregates':rawAggregates,'actualNewScratchBytes':actualTotal,'freshActualOwnedGroupsAbsent':groups}))
