import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-ap-native-observer-pure-controls-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==2
a=read(P/'ACTUAL-TOOL.json');assert a['sessionId']==int(sys.argv[1]) and type(a['finalExit']) is int and a['finalExit']==a['allToolChunks'][-1]['exit_code']==0
g=read(P/'GRANT.json');claim=read(P/'LAUNCH-CLAIM.json')
assert claim['grant']==role(P/'GRANT.json') and claim['actualOwnGroupConfirmed'] and claim['directExecPreservesOuterIdentity']
for key in ('sourcePins','sourceReview','config','recipe','sourceAdoption','runtimeToolsObservation','implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption','implementationControlsSourceAdoption','api','apiAdoption','supplementAdoption'):assert role(g[key]['path'])==g[key]
c=read(g['config']['path']);O=Path(c['recorderOutputPath']);W=Path(c['outputPath']);assert O!=W
r=read(O/'RESULT.json');v=read(O/'CONTROLS-RESULT.json');wv=read(W/'CONTROLS-RESULT.json')
assert r['status']=='NATIVE_OBSERVER_PURE_CONTROLS_COMPLETE_UNADOPTED' and r['actualChildExit']==0 and r['groupClear'] is True and r['timedOut'] is False and r['childPid']==r['ownedPgid'] and r['startupOwnedBeforeExec'] and r['pgidConfirmed']
assert not (O/'OVERRIDE-STOP.json').exists() and r['boundsSeconds']=={'node':300,'active':320,'whole':330} and r['configSha256']==g['configSha256']
for name in ('stdout','stderr'):
 x=role(O/(name+'.bin'));assert x['bytes']==r[name+'Bytes'] and x['sha256']==r[name+'Sha256'] and x['bytes']<=8388608
assert (O/'stderr.bin').stat().st_size==0 and json.loads((O/'stdout.bin').read_bytes())==v==wv
assert v['schema']=='1370-native-observer-independent-controls-result/v1' and v['status']=='PURE_NATIVE_OBSERVER_CODEC_SINK_AND_AFFECTED_CONSUMERS_COMPLETED_UNADOPTED'
assert v['positiveCount']==c['positiveCount']==13 and v['specificNegativeCount']==c['specificNegativeCount']==59
assert v['caseCount']==len(v['results'])==c['caseCount']==72
assert v['originalOrderingCases']==18 and v['originalParserCasesReplayed']==0 and v['historicalObserverControlsReplayed']==0
assert v['inputRoles']==c['inputs']
for x in v['inputRoles'].values():assert role(x['path'])==x
matrix=read(c['inputs']['MATRIX.json']['path'])
assert v['results']==[{**x,'verdict':'ACCEPT_POSITIVE' if x['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for x in matrix['cases']]
assert len(set(x['id'] for x in v['results']))==72
for k in ('implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption'):assert v[k]==g[k]
assert v['sourceReview']==g['sourceReview'] and v['sourceManifest']==g['sourcePins']
assert v['grantSha256']==role(P/'GRANT.json')['sha256'] and v['runtimeTools']==g['runtimeTools']
for x in v['runtimeTools'].values():assert role(x['path'])==x
emitted={name:name.replace('.ts','.mjs') for name in ('m0NativeObserverRows.mjs','m0ObserverRowDiagnostic.mjs','run-native-observer-controls.mjs','m0TraceCodec.mjs','traceSequences.mjs','original-m0FeasibilityWitness.ts','m0FeasibilityWitness-native.ts','ordering.ts','ordering-source-controls.ts')}
assert set(v['generatedModules'])==set(emitted)
for name,target in emitted.items():
 x=v['generatedModules'][name];assert x['path']==str(W/target) and role(x['path'])==x and x['bytes']<=131072
 if name.endswith('.mjs'):assert all(x[k]==c['inputs'][name][k] for k in ('bytes','sha256'))
for k in ('privateM0ReadOrWritten','game','fullQualificationAccepted','executionAuthorization'):assert v[k] is False
lane=Path(g['laneLog']);meta=Path(str(lane)+'.meta');frames=[]
for line in lane.read_text().splitlines():
 if line.startswith('{'):frames.append(json.loads(line))
assert len(frames)==1 and frames[0]['status']==r['status'] and frames[0]['actualChildExit']==0 and frames[0]['groupClear'] is True and 'end, exit 0;' in meta.read_text()
owned=[claim['helperPid'],r['ownedPgid']];assert len(set(owned))==2 and claim['helperPid']==claim['helperPgid']==claim['helperSid'];checks=[]
for n in owned:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('Actual owned identity still present')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
out={'schema':'1370-root-native-observer-controls-actual-readback/v1','status':'ACTUAL_PURE_72_NATIVE_OBSERVER_CONTROLS_COMPLETE_PENDING_INDEPENDENT_REVIEW','actualTool':role(P/'ACTUAL-TOOL.json'),'toolSessionId':a['sessionId'],'toolExit':0,'grant':role(P/'GRANT.json'),'parentClaim':role(P/'LAUNCH-CLAIM.json'),'result':role(O/'CONTROLS-RESULT.json'),'workerResult':role(W/'CONTROLS-RESULT.json'),'recorderResult':role(O/'RESULT.json'),'stdout':role(O/'stdout.bin'),'stderr':role(O/'stderr.bin'),'laneLog':role(lane),'laneMetadata':role(meta),'caseCount':72,'positiveCount':13,'specificNegativeCount':59,'historicalControlSetsReplayed':False,'originalOrderingCases':18,'originalParserCasesReplayed':0,'fullQualificationAccepted':False,'allSpecificControlsPassed':True,'actualOwnedIds':owned,'scopedOwnershipChecks':checks,'laneReleased':True,'recorderSeconds':r['elapsedSeconds'],'preparationSeconds':claim['preparationElapsedSeconds'],'inputRoles':v['inputRoles'],'generatedModules':v['generatedModules'],'privateM0ReadOrWritten':False,'game':False,'executionAuthorization':False,**{k:g[k] for k in ('sourceAdoption','sourcePins','sourceReview','implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption','implementationControlsSourceAdoption','api','apiAdoption','supplementAdoption')}}
p=P/'READBACK.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'readback':role(p),'recorderSeconds':r['elapsedSeconds'],'actualOwnedIds':owned,'caseCount':72}))
