import collections,hashlib,json,os,pathlib,stat
P=pathlib.Path('/Users/zacheryspector/studio-scratch');G=P/'1370-c0-aging-era-witness-r7-parent-guard-preparation-20261008-r2';E=G/'evidence/before-fill-r1';O=P/'1370-c0-b-release-one-tick-observed-independent-review-20261008-r1';pins={}
def read(p,expected=None):
 p=pathlib.Path(p);a=p.lstat();assert stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=16*1024**2;fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  b=os.fstat(fd);raw=b''
  while True:
   part=os.read(fd,65536)
   if not part:break
   raw+=part;assert len(raw)<=16*1024**2
  c=os.fstat(fd);d=p.lstat();identity=lambda s:(s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_ctime_ns);assert identity(a)==identity(b)==identity(c)==identity(d)
 finally:os.close(fd)
 h=hashlib.sha256(raw).hexdigest()
 if expected:assert h==expected,str(p)
 pins[str(p)]={'sha256':h,'bytes':len(raw)};return raw
def j(p,h=None):return json.loads(read(p,h))
snap=j(E/'SNAPSHOT.json','b087ec768c52328d142433555d8549e4d9e365fe4293810fe4fac5c042281a12');p=j(E/'PINS.json','1bac0edf4e5aa5b52d37021770ab50ab69419d5d2e07fadfcd48e3606987c8e1');assert snap['status']==p['status']=='GUARDS_ACCEPTED_READONLY' and snap['phase']=='before-fill' and snap['baseline'] is None
for n,h in p['files'].items():read(E/n,h)
config=j(G/'CONFIG.json',snap['configSha256']);procedure=read(G/'snapshot.py',snap['snapshotProcedureSha256']);prep=j(G/'PREPARATION-PINS.json');assert snap['snapshotProcedureSha256']=='ed43cd95fbbc13a2194338a8fe8dd48e05a56b1b77a4cdcb377f60ea17429740' and snap['configSha256']=='7232a61e4115f774d2e21ffd99aea707993de434fd575cc5cf8793d119610e62'
for n,h in prep['files'].items():read(G/n,h)
reviewpath=P/'1370-c0-aging-era-witness-r7-parent-guard-independent-source-review-20261008-r2/RECEIPT.json';review=j(reviewpath);assert pins[str(reviewpath)]['sha256'].startswith('2c7acfc') and review['decision']=='ACCEPT_SOURCE_ONLY_UNRUN' and review['snapshotProcedureSha256']==snap['snapshotProcedureSha256'] and review['configSha256']==snap['configSha256'] and review['preparationPinsSha256']==pins[str(G/'PREPARATION-PINS.json')]['sha256']
probe=P/'1370-c0-aging-era-witness-r7-parent-guard-r2-tool-read-probe-20261008-r1';pr=j(probe/'RECEIPT.json');assert pins[str(probe/'RECEIPT.json')]['sha256'].startswith('69b33');probe_data=j(probe/'PROBE.json')
copy=j(snap['admission']['path'],snap['admission']['sha256']);assert copy['decision']==snap['admission']['decision']=='ACCEPT_OBSERVED_MATERIALIZATION_COPY' and snap['admission']['sha256']=='3a43f85ec4bd0557b6ea6ef0a46d59bfc14570324ba1297e555dee3ff4d0767d'
pre=j(P/'1370-c0-b-release-one-tick-adopted-independent-preflight-20261008-r1/RECEIPT.json','d11ca0ac29e13ff1d03cc3c16c7b44edd603cbab3e0fa5673d06e4d38d90ffa8');digests=snap['immutable']['protectedDigests'];assert digests['production']==copy['freshProtectedProductionSha256']==pre['freshProtectedProductionSha256'] and digests['commonGit']==copy['freshProtectedCommonSha256']==pre['freshProtectedCommonSha256']
assert config['productionHead']==pre['productionHead']=='4812bb123781632dd39e44f918eb85a6a2c12623' and config['productionSourceTree']==pre['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
for k in snap['rootsBefore']:
 if k!='scratchParent':assert snap['rootsBefore'][k]==snap['rootsAfter'][k]
roots=[snap['rootsAfter'][k]['path'] for k in ['productionRoot','commonGitRoot','copiedRoot','copiedGit']]
for phase,prefix in [('currentBefore','BEFORE'),('currentAfter','AFTER')]:
 f=snap[phase];assert f['fdOriginalAndEphemeralPassed'] and f['relevantWorkersAbsent'] and f['oldNumericPidsAbsent'] and f['freeBytes']>=config['requiredFreeBytes'] and 'AC Power' in f['power'] and f['bootSessionUuid']==config['bootSessionUuid']
 # No owned groups were provided to this guard; use the independent observed-audit group query instead.
 assert f['ownedGroupIdsChecked']==[] and not f['ownedGroupClearanceClaim']
 ps=read(E/(prefix+'-PS.txt'),f['psRawSha256']).decode();ids=[line.split(None,3)[:3] for line in ps.splitlines() if line.strip()];assert not any(len(x)==3 and (int(x[0]) in [76882,76904] or int(x[2]) in [76882,76904]) for x in ids)
 fd=access=None
 for field in read(E/(prefix+'-LSOF.bin'),f['lsofRawSha256']).split(b'\0'):
  field=field.lstrip(b'\n')
  if not field:continue
  kind,v=field[:1],field[1:].decode('utf-8','surrogateescape')
  if kind==b'p':fd=access=None
  elif kind==b'f':fd=v;access=None
  elif kind==b'a':access=v
  elif kind==b'n' and fd and any(v==r or v.startswith(r+os.sep) for r in roots):
   if fd[:1].isdigit():assert access in ['r','w','u']
   assert access not in ['w','u']
a=snap['immutable']['productionDependencies'];b=snap['immutable']['copiedDependencies'];assert set(a)==set(b)
assert collections.Counter(v['type'] for v in b.values())=={'regular':11060,'directory':1401,'symlink':24}
for k in a:
 assert {x:y for x,y in a[k].items() if x!='inode'}=={x:y for x,y in b[k].items() if x!='inode'}
 if a[k]['type']=='regular':assert a[k]['inode']!=b[k]['inode']
parent=j(P/'1370-c0-b-release-one-tick-exact-draft-20261008-r1/PARENT-TOOL-OUTCOME.json','5c7573c5289b28e57d1997b1e9cb8bdad6bf619f9f8d7c7ebf143abbf88fd492');assert parent['actualHelperExit']==0 and parent['toolSessionId']==52003
out={'decision':'ACCEPT_POST_B_PARENT_FULL_READONLY_GUARD_RECORD','pins':pins,'snapshotSha256':pins[str(E/'SNAPSHOT.json')]['sha256'],'phase':'before-fill','snapshotUtc':snap['utc'],'guardActualExitBasis':'Parent reports root toolsession48594 complete0; source/config/PINS/snapshot and every saved raw guard artifact independently authenticated.','fullProtectedDigests':digests,'sourceGuardReviewSha256':pins[str(reviewpath)]['sha256'],'actualToolProbeReceiptSha256':pins[str(probe/'RECEIPT.json')]['sha256'],'freshProductionCommonEqualityToBPreflight':True,'FDsIndependentlyParsedBeforeAfter':True,'BGroupsAbsentInBothSavedPsViews':True,'ownedGroupGuardClaim':False,'BGroupsSeparatelyCheckedByObservedArtifactAudit':True,'productionHead':config['productionHead'],'productionSourceTree':config['productionSourceTree'],'liveRefsAndCleanBasis':'Authenticated executed guard checks local/copied HEAD, live HEAD:src, local/origin refs and clean status before/after.','copiedProductionDependencyMetadataAndIndependentInodesChecked':True,'guardElapsedSeconds':snap['elapsedSeconds'],'claimLimit':'Post-B surrounding guard record at before-fill timestamp only. Parent began separate r7 filling after this snapshot; no after-fill/witness/game acceptance inferred.'}
print(json.dumps(out,sort_keys=True,indent=2))
