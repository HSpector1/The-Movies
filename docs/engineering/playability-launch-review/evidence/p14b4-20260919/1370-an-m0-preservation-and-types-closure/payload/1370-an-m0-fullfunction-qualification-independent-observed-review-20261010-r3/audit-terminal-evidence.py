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
  a=os.fstat(fd);need(stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=64*1024*1024,'bounded singlelink artifact')
  parts=[];h=hashlib.sha256();total=0
  while True:
   q=os.read(fd,65536)
   if not q:break
   total+=len(q);need(total<=64*1024*1024,'cap');h.update(q);parts.append(q)
  z=os.fstat(fd);need((a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns),'artifact race')
  r={'path':str(p),'bytes':total,'sha256':h.hexdigest()}
  if expected is not None:need(r==expected,'role mismatch '+p.name)
  return b''.join(parts),r
 finally:os.close(fd)
def exact(a,b):
 if type(a)!=type(b):return False
 if isinstance(a,dict):return set(a)==set(b) and all(exact(a[k],b[k]) for k in a)
 if isinstance(a,list):return len(a)==len(b) and all(exact(x,y) for x,y in zip(a,b))
 return a==b
i=decode((B/'TERMINAL-EVIDENCE-INPUT.json').read_bytes());raw={};roles={}
for k,r in i['roles'].items():raw[k],roles[k]=read(r['path'],r)
for k,p in i['extras'].items():raw[k],roles[k]=read(p)
rb=decode(raw['readback']);tool=decode(raw['actualTool']);cr=decode(raw['controllerResult']);rr=decode(raw['recorderResult']);g=decode(raw['grant']);first=decode(raw['firstProof']);binding=decode(raw['controllerBinding']);types=decode(raw['typesAdoption']);manifest=decode(raw['sourcePins']);review=decode(raw['sourceReview'])
need(tool['sessionId']==40169 and tool['finalExit']==2 and tool['allToolChunks'][-1]['exit_code']==2,'actual tool2')
need(rr['status']=='STOP_CHILD_EXIT_1' and rr['actualChildExit']==1 and rr['timedOut'] is False and rr['groupClear'] is True,'actual recorder STOP')
need(cr['status']=='STOP_NODE_EXIT' and cr['actualNodeExit']==1 and cr['nodePid']==35829 and cr['nodeResult'] is None and cr['sourceAfter'] is None and cr['dependencyAfter'] is None and cr['actualGameplayPrefixExecuted'] is None and cr['naturalBoundaryWeeks'] is None,'controller truthful STOP boundary')
need(exact(cr['sourceBefore'],first['sourceProof']) and exact(cr['sourceBefore'],binding['sourceBefore']) and exact(cr['sourceBefore'],types['freshSourceProof']) and exact(cr['sourceBefore'],rb['sourceBefore']),'complete source BEFORE')
need(exact(cr['dependencyBefore'],first['dependencyProof']) and exact(cr['dependencyBefore'],binding['dependencyBefore']) and exact(cr['dependencyBefore'],types['freshDependencyProof']) and exact(cr['dependencyBefore'],rb['dependencyBefore']),'complete deps BEFORE')
need(len(cr['sourceBefore'])==9,'nine source fields')
need(g['sourcePins']==roles['sourcePins'] and g['sourceReview']==roles['sourceReview'] and g['typesAdoption']==roles['typesAdoption'] and g['currentProtection']==roles['currentProtection'],'genuine grant roles')
for n in ['CONFIG.json','run-fullfunction.py','run-fullfunction.mjs','record-fullfunction.py','CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts','FULL-BODY-CONTROLS-TEMPLATE.ts','exact-json.mjs','run-parser-controls.mjs','canonical-typescript-transform.mjs']:
 r=manifest['files'][n];need(r==review['sourcePins'][n]==review['routeSourcePins'][n],'review alias');_,roles['qualifiedSource:'+n]=read(r['path'],r)
for key,name in [('coreTest','CORE-TEST-TEMPLATE.ts'),('fullBodyControls','FULL-BODY-CONTROLS-TEMPLATE.ts')]:
 need(roles[key]['bytes']==manifest['files'][name]['bytes'] and roles[key]['sha256']==manifest['files'][name]['sha256'],'actual exact template '+name)
need(rr['stdoutBytes']==roles['stdout']['bytes']==252 and rr['stdoutSha256']==roles['stdout']['sha256'] and rr['stderrBytes']==roles['stderr']['bytes']==0 and rr['stderrSha256']==roles['stderr']['sha256'],'recorder streams')
gen=decode(raw['generateReport']);base=decode(raw['baselineReport']);receipt=decode(raw['fixtureReceipt']);gc=decode(raw['generateControl']);gb=decode(raw['generateBinding']);bb=decode(raw['baselineBinding']);packet=decode(raw['fixturePacket'])
identity='recorded M0 whole-body fixture generation or controls'
for report,status in [(gen,'passed'),(base,'failed')]:
 ar=[a for suite in report['testResults'] for a in suite['assertionResults']]
 need(report['numTotalTests']==1 and len(ar)==1 and ar[0]['title']==ar[0]['fullName']==identity and ar[0]['status']==status,'actual exact test identity')
need(gen['success'] is True and gen['numPassedTests']==1 and gen['numFailedTests']==0 and base['success'] is False and base['numPassedTests']==0 and base['numFailedTests']==1,'generation pass baseline fail')
error=base['testResults'][0]['assertionResults'][0]['failureMessages'][0]
need(error.startswith('AssertionError [ERR_ASSERTION]: complete bounded helper/RNG trace, never dropped evidence') and 'true !== false' in error and 'full-body-controls.ts:29:10' in error and 'full-body-controls.ts:67:15' in error,'exact baseline evidence drop STOP')
need(receipt['schema']=='1370-fullfunction-real-boundary-generation/v1' and receipt['sourcePhase']=='tick.before.advanceTalentMarketWeek' and receipt['naturalWeeks']==[196,197,208] and receipt['artifact']==roles['fixturePacket'] and receipt['outcome']=='GENERATED_UNADMITTED' and receipt['actualNaturalReturnedWeeksUsedAsBoundaries'] is False and receipt['syntheticOutcomeClaims'] is False,'partial generation receipt')
need(gc['status']=='REAL_BOUNDARY_AND_EXPLICIT_VARIANTS_GENERATED_UNADMITTED' and gc['fixture']==roles['fixturePacket']==bb['fixtureRole'],'same packet generation and attempted baseline')
need(packet['schema']=='1370-m0-boundary-fixtures/v1' and set(packet['natural'])=={'author196','offWeek','freeze208'} and set(packet['fixtures'])=={'author196','offWeek','freeze208','opportunity196','opportunity208','offSubject','offIssuer196'},'finite packet role separation')
for k,week in [('author196',196),('offWeek',197),('freeze208',208)]:
 n=packet['natural'][k];need(n['sourcePhase']=='tick.before.advanceTalentMarketWeek' and n['state']['market']['tick']==week and exact(n,packet['fixtures'][k]),'actual natural field '+k)
need(len(packet['synthetic'])==4 and packet['fixtures']['opportunity196']['sourcePhase']==packet['fixtures']['opportunity208']['sourcePhase']=='synthetic.valid-market-state','explicit synthetic roles')
c=decode(read(manifest['files']['CONFIG.json']['path'])[0]);need(receipt['generatedSourceRoles']==gb['sourceRoles']==bb['sourceRoles']==c['inputs'],'qualified generation source roles')
root=decode(raw['rootLaunchClaim']);inner=decode(raw['recorderLaunchClaim'])
need(root['ownedHelper']=={'pid':35444,'pgid':35444,'sid':35444} and inner['ownedRecorder']=={'pid':35699,'pgid':35699,'sid':35699},'actual identities')
need(rr['childPid']==rr['ownedPgid']==35700 and rr['startupOwnedBeforeExec'] is True and rr['pgidConfirmed'] is True,'owned controller group')
need(rb['recordedOwnedPids']==[35444,35699,35700,35829] and rb['recordedOwnedGroupIds']==[35444,35699,35700],'recorded ownership roster')
need(len(rb['scopedOwnershipChecks'])==7 and {(x['kind'],x['id'],x['result']) for x in rb['scopedOwnershipChecks']}=={('pid',v,'ESRCH') for v in [35444,35699,35700,35829]}|{('pgid',v,'ESRCH') for v in [35444,35699,35700]},'fresh recorded absences')
need(rb['laneReleased'] is True and 'end, exit 2;' in raw['laneMetadata'].decode('utf-8','strict'),'lane terminal text')
report={'schema':'1370-finite-fullfunction-r3-terminal-retained-evidence-audit/v1','allExactExpectedRolesMatched':True,'roles':roles,'completeSourceBeforeExactCurrentTypes':True,'completeDependencyBeforeExactCurrentTypes':True,'losslessTypedProofEquality':True,'sourceAfter':None,'dependencyAfter':None,'controllerReportedActualGameplayPrefixExecuted':None,'controllerReportedNaturalBoundaryWeeks':None,'actualGenerationPrefixExecutedByAuthenticatedPassingGeneration':True,'actualGeneratedNaturalBoundaryWeeks':[196,197,208],'packetNaturalAndFixtureCopiesTypeExact':True,'explicitSyntheticRoles':packet['synthetic'],'fullStateOccurrences':10,'fixtureBytes':roles['fixturePacket']['bytes'],'actualNodePid':35829,'controllerStatus':cr['status'],'controllerElapsedSeconds':cr['elapsedSeconds'],'recorderElapsedSeconds':rr['elapsedSeconds'],'actualToolFinalExit':2,'generateReport':gen,'baselineReport':base,'retainedTexts':{k:raw[k].decode('utf-8','strict') for k in ['stdout','stderr','nodeStdout','nodeStderr','generateStdout','generateStderr','baselineStdout','baselineStderr','laneLog']},'recordedOwnershipChecks':rb['scopedOwnershipChecks'],'baselineAccepted':False,'meaningfulCatchMutantRedAccepted':False,'fullSharedPostflightAccepted':False,'candidateImported':False,'privateInventory':False,'processProbesExecuted':False}
encoded=(json.dumps(report,sort_keys=True,indent=2)+'\n').encode();output=B/'INITIAL-TERMINAL-EVIDENCE-AUDIT.json';fd=os.open(output,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
print(json.dumps({'path':str(output),'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest(),'allChecksPassed':True}))

