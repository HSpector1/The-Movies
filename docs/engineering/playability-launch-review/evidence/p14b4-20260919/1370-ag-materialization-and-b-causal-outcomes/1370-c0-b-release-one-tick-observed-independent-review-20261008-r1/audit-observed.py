import collections,datetime,difflib,hashlib,json,os,pathlib,shutil,stat,subprocess,sys,time
P=pathlib.Path('/Users/zacheryspector/studio-scratch');O=P/'1370-b-release-one-tick-run-20261008-4812-r1';S=P/'1370-c0-b-release-one-tick-source-proposal-20261008-r3';D=P/'1370-c0-b-release-one-tick-exact-draft-20261008-r1';R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program');started=time.monotonic()
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p,expected=None,cap=16*1024**2):
 p=pathlib.Path(p);s=p.lstat();assert stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size<=cap;fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  t=os.fstat(fd);assert (s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns)==(t.st_dev,t.st_ino,t.st_size,t.st_mtime_ns);data=b''
  while True:
   block=os.read(fd,65536)
   if not block:break
   data+=block;assert len(data)<=cap
  u=os.fstat(fd);v=p.lstat();assert (t.st_dev,t.st_ino,t.st_size,t.st_mtime_ns)==(u.st_dev,u.st_ino,u.st_size,u.st_mtime_ns)==(v.st_dev,v.st_ino,v.st_size,v.st_mtime_ns)
 finally:os.close(fd)
 assert len(data)==s.st_size
 if expected:assert sha(data)==expected,str(p)
 return data
pins={}
def pin(p,expected=None):
 raw=read(p,expected);pins[str(p)]={'sha256':sha(raw),'bytes':len(raw)};return raw
def jread(p,expected=None):return json.loads(pin(p,expected))
result=jread(O/'RESULT.json','eac07318cf3dc9149865b35660a78b22ada54866c0013240a0bc972f8ae07e11');comp=jread(O/'COMPARISON.json','27b876198ca705008c275a6e2a2f2434bbadb9c8f7e6b7e28048acbc3fe12ba9');manifest=jread(S/'MANIFEST.json','36dcb154af74caad0803f9ae175a75693e13001fa9183efb7c70d8fdd4d8bab5');binding=jread(D/'BINDING-DRAFT.json','1d961e6badb90588e304938b75d6b488a2e35188992e30232426f823b23f12d2')
preflight=jread(P/'1370-c0-b-release-one-tick-adopted-independent-preflight-20261008-r1/RECEIPT.json','d11ca0ac29e13ff1d03cc3c16c7b44edd603cbab3e0fa5673d06e4d38d90ffa8');assert preflight['decision']=='ACCEPT_ADOPTED_EXACT_PREFLIGHT_UNRUN'
assert result['status']=='ONE_TICK_DIAGNOSTIC_CANDIDATE' and result['classification']=='ONE_TICK_DIAGNOSTIC_ONLY' and result['followOn109Weeks']=='NOT_IMPLEMENTED_NOT_RUN'
assert result['manifestSha256']==sha(read(S/'MANIFEST.json')) and result['bindingSha256']==sha(read(D/'BINDING-DRAFT.json'))
for k,v in result['artifacts'].items():raw=pin(O/k,v['sha256']);assert len(raw)==v['bytes']
for n,p in manifest['files'].items():assert len(pin(S/n,p['sha256']))==p['bytes']
external={k:pin(v['path'],v['sha256']) for k,v in manifest['externalPins'].items()}
# Authenticate compressed capture without decoding any unrelated member.
capture=pathlib.Path(manifest['capture']['path']);h=hashlib.sha256();size=0
with capture.open('rb') as f:
 for b in iter(lambda:f.read(1024*1024),b''):h.update(b);size+=len(b)
assert size==manifest['capture']['bytes'] and h.hexdigest()==manifest['capture']['sha256'];pins[str(capture)]={'sha256':h.hexdigest(),'bytes':size,'hashOnlyNoFullDecode':True}
rg={'__name__':'authenticated_runtime_guard'};exec(compile(external['runtimeGuard'],manifest['externalPins']['runtimeGuard']['path'],'exec'),rg)
a={'__name__':'authenticated_assembler','_AUTHENTICATED_RUNNER_BYTES':external['assembler'],'_AUTHENTICATED_MANIFEST_BYTES':external['routeManifest'],'_AUTHENTICATED_REVIEW_BYTES':external['sourceReview'],'_AUTHENTICATED_VERIFY_RUNTIME':rg['verify_runtime']};exec(compile(external['assembler'],manifest['externalPins']['assembler']['path'],'exec'),a);route=json.loads(external['routeManifest'])
mirrors=[]
for child,folder in zip(result['children'],['baseline-tree','intervention-tree']):
 expected=json.loads(json.dumps(route['assembledInventory']));expected['files']['tests/full-state-neutrality.test.ts']=manifest['files']['one-tick.test.ts']['sha256'];expected['files']['vitest.neutrality.config.ts']=manifest['files']['vitest.one-tick.config.ts']['sha256'];expected['files']['tests/retention.mjs']=manifest['files']['retention.mjs']['sha256'];expected['files']['tests/retention.d.mts']=manifest['files']['retention.d.mts']['sha256']
 if folder=='intervention-tree':expected['files']['src/core/hollywoodTick.ts']=manifest['candidateWholeFileSha256']
 actual=a['inventory'](O/folder);assert actual==expected;digest=sha(json.dumps(actual,sort_keys=True).encode());assert digest==child['sourceInventorySha256'];mirrors.append({'folder':folder,'inventorySha256':digest,'regularFiles':len(actual['files']),'links':actual['links']})
 assert child['actualExit']==0 and child['groupClear'] and child['startupOwnedBeforeExec'] and child['pgidConfirmed'] and child['pid']==child['pgid']
 launch=jread(O/(child['arm']+'.LAUNCH.json'));assert launch['pid']==child['pid'] and launch['pgid']==child['pgid'] and launch['command']==child['command'] and launch['sourceInventorySha256']==digest and launch['startupOwnedBeforeExec'] and launch['actualExit'] is None
 report=jread(O/(child['arm']+'.vitest.json'));assert report['numTotalTests']==report['numPassedTests']==report['numTotalTestSuites']==report['numPassedTestSuites']==1 and report['numFailedTests']==report['numFailedTestSuites']==0 and report['success'] and len(report['testResults'])==1
 assert len(read(O/(child['arm']+'.stderr.log')))==0 and len(read(O/(child['arm']+'.stdout.log')))+len(read(O/(child['arm']+'.stderr.log')))<=1024**2
 try:os.killpg(child['pgid'],0)
 except ProcessLookupError:pass
 else:raise AssertionError('child group still exists')
raws={f:read(O/f) for f in ['boundary-307.ndjson','boundary-308.ndjson','EBG.json','EBG_R04_RELEASE_OFF.json']};rows={k:json.loads(v) for k,v in raws.items()};before=rows['boundary-307.ndjson'];expected=rows['boundary-308.ndjson'];left=rows['EBG.json'];right=rows['EBG_R04_RELEASE_OFF.json']
decoder=json.JSONDecoder()
def spans(s):
 i=0;out={}
 while s[i].isspace():i+=1
 assert s[i]=='{';i+=1
 while True:
  while s[i].isspace():i+=1
  if s[i]=='}':return out
  key,i=decoder.raw_decode(s,i)
  while s[i].isspace():i+=1
  assert s[i]==':';i+=1
  while s[i].isspace():i+=1
  start=i;_,i=decoder.raw_decode(s,i);out[key]=s[start:i]
  while s[i].isspace():i+=1
  if s[i]=='}':return out
  assert s[i]==',';i+=1
encoded={f:spans(v.decode()) for f,v in raws.items()}
for week,row in [(307,before),(308,expected)]:
 assert row['boundary']==row['week']==week and row['role']=='EBG' and row['seed']=='p13-public-commercial-adoption'
 assert sha(raws[f'boundary-{week}.ndjson'])==manifest['members'][str(week)]['sha256'];state_raw=encoded[f'boundary-{week}.ndjson']['originalState'];assert sha(state_raw.encode())==row['originalStateSha256'] and spans(encoded[f'boundary-{week}.ndjson']['save'])['state']==state_raw
 assert result['inputs'][str(week)]['rawSha256']==manifest['members'][str(week)]['sha256'] and result['inputs'][str(week)]['stateSha256']==row['originalStateSha256'] and result['inputs'][str(week)]['serializedSaveSha256']==row['serializedSaveSha256'] and result['inputs'][str(week)]['rng']==row['rng']
assert encoded['EBG.json']['state']==encoded['boundary-308.ndjson']['originalState'];assert encoded['EBG.json']['save']==encoded['boundary-308.ndjson']['save'];assert left['state']==expected['originalState'] and left['stateSha256']==expected['originalStateSha256'] and left['serializedSaveSha256']==expected['serializedSaveSha256']
for arm,file in [(left,'EBG.json'),(right,'EBG_R04_RELEASE_OFF.json')]:
 assert sha(encoded[file]['state'].encode())==arm['stateSha256'] and spans(encoded[file]['save'])['state']==encoded[file]['state'];assert arm['save']['saveVersion']==46 and arm['state']==arm['save']['state'];assert arm['state']['market']['tick']==308 and arm['inputStateSha256']==before['originalStateSha256'];assert arm['admission']=='ordinary importSave(exportSave), input/output semantic equality' and arm['conservation']=='unchanged ordinary Save46 full validator'
assert before['rng']==expected['rng']==left['rng']==right['rng']==left['state']['rngState']==right['state']['rngState']
# Independent complete value diff; object order is kept from raw JSON only for deterministic path ordering.
def paths(x,y,p='$',out=None):
 if out is None:out=[]
 if not isinstance(x,(dict,list)) or not isinstance(y,(dict,list)):
  if x!=y or isinstance(x,bool)!=isinstance(y,bool):out.append(p)
  return out
 if type(x)!=type(y):out.append(p);return out
 if isinstance(x,list):
  for i in range(max(len(x),len(y))):
   child=f'{p}[{i}]'
   if i>=len(x) or i>=len(y):out.append(child)
   else:paths(x[i],y[i],child,out)
  if len(x)!=len(y):out.append(p+'.length')
 else:
  for k in list(x)+[k for k in y if k not in x]:
   child=p+'.'+k
   if k not in x or k not in y:out.append(child)
   else:paths(x[k],y[k],child,out)
 return out
changes=paths(left['state'],right['state']);assert changes==comp['completeDifferentPaths'] and comp['firstDifferingField']==changes[0] and len(changes)==32
join=lambda rs:[{'identity':[r['contractId'],sum(q['contractId']==r['contractId'] for q in rs[:i])],'ordinal':i,'row':r} for i,r in enumerate(rs)]
bh=before['originalState']['hollywood'];lh=left['state']['hollywood'];rh=right['state']['hollywood'];lj=join(lh['employment']);rj=join(rh['employment']);assert len(lj)==len(rj)==52;assert left['employment']==lj and right['employment']==rj;rm={tuple(r['identity']):r for r in rj};assert set(rm)=={tuple(r['identity']) for r in lj}
matched=[{'identity':r['identity'],'baselineOrdinal':r['ordinal'],'intervention':rm[tuple(r['identity'])],'baselineRow':r['row']} for r in lj];assert matched==comp['employmentMatched'] and comp['employmentOnlyIntervention']==[]
selected=join(bh['employment'])[42:48];assert left['selectedContracts']==right['selectedContracts']==[r['identity'] for r in selected]
for r in selected:
 i=r['ordinal'];assert r['row']['studioId']=='studio-5a47d054-r04' and r['row']['endedWeek'] is None and r['row']['terms']['endWeekExclusive']==416;assert lj[i]['identity']==rj[i]['identity']==r['identity'];assert lj[i]['row']==r['row']|{'endedWeek':307};assert rj[i]['row']==r['row'] and i in rh['activeEmploymentOrdinals'] and i not in lh['activeEmploymentOrdinals']
assert [r['ordinal'] for r in lj if r['row']!=rm[tuple(r['identity'])]['row']]==list(range(42,48))
assert left['selectedTerminations']==left['addedIndustryReceipts'] and len(left['selectedTerminations'])==6 and right['selectedTerminations']==right['addedIndustryReceipts']==[];assert [r['eventId'] for r in left['selectedTerminations']]==[f'industry-event-{i}' for i in range(419,425)];assert lh['receipts']==bh['receipts']+left['selectedTerminations'] and rh['receipts']==bh['receipts']
assert left['state']['talentMarket']==right['state']['talentMarket'] and left['state']['firstTakes']==right['state']['firstTakes'] and [(r['studioId'],r['costCutting']) for r in lh['businesses']]==[(r['studioId'],r['costCutting']) for r in rh['businesses']]
def target(h):return next(r for r in h['businesses'] if r['studioId']=='studio-5a47d054-r04')
bb,lb,rb=target(bh),target(lh),target(rh);termination=lambda b:sum(p['movements']['termination'] for p in b['account']['periods']);tdl=termination(lb)-termination(bb);tdr=termination(rb)-termination(bb);cdl=lb['account']['cash']-bb['account']['cash'];cdr=rb['account']['cash']-bb['account']['cash'];assert tdl==left['terminationMovementDelta']==comp['baselineTerminationDelta']==-1224444 and tdr==right['terminationMovementDelta']==comp['interventionTerminationDelta']==0;assert cdl==left['cashDelta']==comp['baselineCashDelta']==-1267944 and cdr==right['cashDelta']==comp['interventionCashDelta']==-99594
net=rb['account']['cash']-lb['account']['cash'];payroll=rb['account']['periods'][-1]['movements']['payroll']-lb['account']['periods'][-1]['movements']['payroll'];overhead=rb['account']['periods'][-1]['movements']['overhead']-lb['account']['periods'][-1]['movements']['overhead'];assert net==1168350 and payroll==-47094 and overhead==-9000 and net==1224444+payroll+overhead
conservation=[]
for arm,h in [('EBG',lh),('EBG_R04_RELEASE_OFF',rh)]:
 error=max(abs(p['opening']+sum(p['movements'].values())-p['closing']) for b in h['businesses'] for p in b['account']['periods']);assert error<1e-6;conservation.append({'arm':arm,'maxPeriodArithmeticResidual':error,'ordinaryValidatorObservedInPassedSourceTest':True})
base=read(O/'baseline-tree/src/core/hollywoodTick.ts');inter=read(O/'intervention-tree/src/core/hollywoodTick.ts');assert sha(inter)==manifest['candidateWholeFileSha256'];patch=list(difflib.unified_diff(base.decode().splitlines(),inter.decode().splitlines(),fromfile='EBG',tofile='EBG_R04_RELEASE_OFF',lineterm=''));assert sum(x.startswith('+') and not x.startswith('+++') for x in patch)==2 and sum(x.startswith('-') and not x.startswith('---') for x in patch)==0
budget=0;budgetfiles=[]
def visit(folder):
 global budget
 for p in sorted(folder.iterdir()):
  s=p.lstat();assert not stat.S_ISLNK(s.st_mode)
  if stat.S_ISDIR(s.st_mode):
   if p not in [O/'baseline-tree',O/'intervention-tree']:visit(p)
  else:
   assert stat.S_ISREG(s.st_mode) and s.st_nlink==1
   if p.suffix=='.json':assert s.st_size<=16777216
   budget+=s.st_size;budgetfiles.append({'path':str(p.relative_to(O)),'bytes':s.st_size})
visit(O);assert budget<=67108864
meta=pin(D/'one-tick.lane.log.meta').decode();log=pin(D/'one-tick.lane.log').decode();assert 'waiting for lock' not in meta and 'waiting for heavy' not in meta and 'waiting for pid 0;' in meta and '\nstart;' in meta and '\nend, exit 0;' in meta and json.loads(log)['status']==result['status']
assert 0<result['elapsedSeconds']<75<90 and result['groupClear'];reports=[jread(O/(c['arm']+'.vitest.json')) for c in result['children']];reported_span=(reports[-1]['testResults'][0]['endTime']-reports[0]['startTime'])/1000;assert reported_span<60
assert result['preflight']['head']==result['postflight']['head']==binding['productionHead'] and result['preflight']['source']==result['postflight']['source']==binding['productionSourceTree'] and result['preflight']['runtime']==result['postflight']['runtime']==preflight['runtime'];assert result['preflight']['freeBytes']>=3456106496 and result['postflight']['freeBytes']>=3*1024**3+128*1024**2
assert not os.path.lexists(P/'HEAVY-LANE-LOCK')
facts={'schema':'1370-b-release-one-tick-independent-observed-artifact-audit-r1','decision':'ACCEPT_OBSERVED_ONE_TICK_DIAGNOSTIC_PENDING_POST_B_ROOT_GUARD','elapsedAuditSeconds':time.monotonic()-started,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pins':pins,'baselineCompleteRawStateMatches308':True,'baselineRawSaveObjectMatchesCaptured308':True,'inputStateSha256':before['originalStateSha256'],'baselineStateSha256':left['stateSha256'],'interventionStateSha256':right['stateSha256'],'baselineSerializedSaveSha256':left['serializedSaveSha256'],'interventionSerializedSaveSha256':right['serializedSaveSha256'],'rng':left['rng'],'ordinaryAdmission':'Input/output ordinary importSave(exportSave) equality executed by both authenticated passed tests; independently raw saved-state values/ordering checked. No game code re-executed.','mirrors':mirrors,'soleProductionDelta':patch,'selectedContracts':selected,'employmentPaired':52,'employmentOnlyEither':0,'employmentChangedOrdinals':list(range(42,48)),'terminationReceipts':left['selectedTerminations'],'baselineTerminationDelta':tdl,'interventionTerminationDelta':tdr,'baselineCashDelta':cdl,'interventionCashDelta':cdr,'baselineCash':lb['account']['cash'],'interventionCash':rb['account']['cash'],'netCashDifference':net,'additionalPayroll':payroll,'additionalOverhead':overhead,'accountConservation':conservation,'completeDifferentPaths':changes,'fullFieldDiffCount':len(changes),'marketFirstTakesRngAndCostCuttingEqual':True,'wholeRecorderSeconds':result['elapsedSeconds'],'vitestReportedSpanSeconds':reported_span,'combinedNodeBoundBasis':'Authenticated runner enforced shared monotonic60 before startup/poll/observed exit and final candidate; reporter timestamps corroborate13.2s reported span, not claimed as exact process-lifetime span.','actualChildExits':[c['actualExit'] for c in result['children']],'groupsFreshAbsent':[c['pgid'] for c in result['children']],'actualHelperExitBasis':'Parent toolsession52003 reported0 corroborated by accepted helper meta end exit0 and diagnostic stdout.','unexpectedWaitAbsent':True,'outputBytesIncludingResultAndCachesExcludingExactlyTwoSourceMirrors':budget,'outputBudgetFiles':budgetfiles,'diskPreBytes':result['preflight']['freeBytes'],'diskPostBytes':result['postflight']['freeBytes'],'internalReleasePredicates':'UNOBSERVED','followOn109Weeks':'NOT_IMPLEMENTED_NOT_RUN','claimLimit':'One seed, genuine input307 and one public tick per arm to308, target r04 release loop only. No 109-week outcome, final causal closure, protected repin, general product or 1363 admission.'}
print(json.dumps(facts,sort_keys=True,indent=2))
