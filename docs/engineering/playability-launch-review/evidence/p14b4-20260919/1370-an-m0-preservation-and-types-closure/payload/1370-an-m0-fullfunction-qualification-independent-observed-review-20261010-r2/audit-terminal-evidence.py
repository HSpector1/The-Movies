import json,os,stat,hashlib
from pathlib import Path
B=Path(__file__).parent
def need(ok,m):
 if not ok:raise RuntimeError(m)
def pairs(rows):
 out={}
 for k,v in rows:need(k not in out,'duplicate JSON');out[k]=v
 return out
def decode(raw):return json.loads(raw.decode('utf-8','strict'),object_pairs_hook=pairs,parse_constant=lambda x: (_ for _ in ()).throw(ValueError(x)))
def read(path,expected=None):
 p=Path(path);need(p.is_absolute() and str(p).startswith('/Users/zacheryspector/studio-scratch/') and p.resolve(strict=True)==p,'scratch physical artifact')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);need(stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=8*1024*1024,'bounded singlelink artifact')
  parts=[];h=hashlib.sha256();total=0
  while True:
   q=os.read(fd,65536)
   if not q:break
   total+=len(q);need(total<=8*1024*1024,'cap');h.update(q);parts.append(q)
  z=os.fstat(fd);need((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns),'artifact race')
  role={'path':str(p),'bytes':total,'sha256':h.hexdigest()}
  if expected is not None:need(role==expected,'role mismatch '+p.name)
  return b''.join(parts),role
 finally:os.close(fd)
def exact(a,b):
 if type(a)!=type(b):return False
 if isinstance(a,dict):return set(a)==set(b) and all(exact(a[k],b[k]) for k in a)
 if isinstance(a,list):return len(a)==len(b) and all(exact(x,y) for x,y in zip(a,b))
 return a==b
i=decode((B/'TERMINAL-EVIDENCE-INPUT.json').read_bytes());raw={};roles={}
for k,r in i['roles'].items():raw[k],roles[k]=read(r['path'],r)
for k,p in i['extras'].items():raw[k],roles[k]=read(p)
rb=decode(raw['readback']);tool=decode(raw['actualTool']);cr=decode(raw['controllerResult']);rr=decode(raw['recorderResult']);g=decode(raw['grant']);first=decode(raw['firstProof']);binding=decode(raw['controllerBinding']);types=decode(raw['typesAdoption']);manifest=decode(raw['sourcePins']);review=decode(raw['sourceReview']);report=decode(raw['generateReport'])
need(tool['sessionId']==21388 and tool['finalExit']==2 and tool['allToolChunks'][-1]['exit_code']==2,'actual tool2')
need(rr['status']=='STOP_CHILD_EXIT_1' and rr['actualChildExit']==1 and rr['timedOut'] is False and rr['groupClear'] is True,'actual recorder STOP')
need(cr['status']=='STOP_NODE_EXIT' and cr['actualNodeExit']==1 and cr['nodePid']==50425 and cr['nodeResult'] is None and cr['sourceAfter'] is None and cr['dependencyAfter'] is None and cr['actualGameplayPrefixExecuted'] is None and cr['naturalBoundaryWeeks'] is None,'controller truthful STOP boundary')
need(exact(cr['sourceBefore'],first['sourceProof']) and exact(cr['sourceBefore'],binding['sourceBefore']) and exact(cr['sourceBefore'],types['freshSourceProof']) and exact(cr['sourceBefore'],rb['sourceBefore']),'complete source BEFORE')
need(exact(cr['dependencyBefore'],first['dependencyProof']) and exact(cr['dependencyBefore'],binding['dependencyBefore']) and exact(cr['dependencyBefore'],types['freshDependencyProof']) and exact(cr['dependencyBefore'],rb['dependencyBefore']),'complete deps BEFORE')
need(len(cr['sourceBefore'])==9,'nine source fields')
need(g['sourcePins']==roles['sourcePins'] and g['sourceReview']==roles['sourceReview'] and g['typesAdoption']==roles['typesAdoption'] and g['currentProtection']==roles['currentProtection'],'genuine grant roles')
for name in ['CONFIG.json','run-fullfunction.py','run-fullfunction.mjs','record-fullfunction.py','CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts','FULL-BODY-CONTROLS-TEMPLATE.ts','exact-json.mjs','run-parser-controls.mjs']:
 r=manifest['files'][name];need(r==review['sourcePins'][name]==review['routeSourcePins'][name],'review alias');_,roles['qualifiedSource:'+name]=read(r['path'],r)
need(roles['coreTest']['bytes']==manifest['files']['CORE-TEST-TEMPLATE.ts']['bytes'] and roles['coreTest']['sha256']==manifest['files']['CORE-TEST-TEMPLATE.ts']['sha256'],'actual exact core template')
need(rr['stdoutBytes']==roles['stdout']['bytes']==252 and rr['stdoutSha256']==roles['stdout']['sha256'] and rr['stderrBytes']==roles['stderr']['bytes']==0 and rr['stderrSha256']==roles['stderr']['sha256'],'recorder streams')
need(report['numTotalTests']==0 and report['numPassedTests']==0 and report['success'] is False,'zero actual framework tests')
root=decode(raw['rootLaunchClaim']);inner=decode(raw['recorderLaunchClaim'])
need(root['ownedHelper']=={'pid':47616,'pgid':47616,'sid':47616} and inner['ownedRecorder']=={'pid':47871,'pgid':47871,'sid':47871},'actual identities')
need(rr['childPid']==rr['ownedPgid']==47872 and rr['startupOwnedBeforeExec'] is True and rr['pgidConfirmed'] is True,'owned controller group')
need(rb['recordedOwnedPids']==[47616,47871,47872,50425] and rb['recordedOwnedGroupIds']==[47616,47871,47872],'recorded ownership roster')
need(len(rb['scopedOwnershipChecks'])==7 and {(x['kind'],x['id'],x['result']) for x in rb['scopedOwnershipChecks']}=={('pid',v,'ESRCH') for v in [47616,47871,47872,50425]}|{('pgid',v,'ESRCH') for v in [47616,47871,47872]},'fresh recorded absences')
need(rb['laneReleased'] is True and 'end, exit 2;' in raw['laneMetadata'].decode('utf-8','strict'),'lane terminal text')
need(report['numFailedTestSuites']==1 and len(report['testResults'])==1 and report['testResults'][0]['assertionResults']==[] and report['testResults'][0]['message']=="Expected ',', got '{'",'specific generation syntax failure')
reportout={'schema':'1370-finite-fullfunction-r2-terminal-retained-evidence-audit/v1','allExactExpectedRolesMatched':True,'roles':roles,'completeSourceBeforeExactCurrentTypes':True,'completeDependencyBeforeExactCurrentTypes':True,'losslessTypedProofEquality':True,'sourceAfter':None,'dependencyAfter':None,'actualGameplayPrefixExecuted':None,'naturalBoundaryWeeks':None,'actualNodeStarted':True,'actualNodePid':50425,'controllerStatus':cr['status'],'controllerElapsedSeconds':cr['elapsedSeconds'],'recorderElapsedSeconds':rr['elapsedSeconds'],'actualToolFinalExit':2,'generateReport':report,'retainedTexts':{k:raw[k].decode('utf-8','strict') for k in ['stdout','stderr','nodeStdout','nodeStderr','generateStdout','generateStderr','laneLog']},'recordedOwnershipChecks':rb['scopedOwnershipChecks'],'fullSharedPostflightAccepted':False,'candidateImported':False,'privateInventory':False,'processProbesExecuted':False}
encoded=(json.dumps(reportout,sort_keys=True,indent=2)+'\n').encode();output=B/'INITIAL-TERMINAL-EVIDENCE-AUDIT.json';fd=os.open(output,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
print(json.dumps({'path':str(output),'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest(),'allChecksPassed':True}))
