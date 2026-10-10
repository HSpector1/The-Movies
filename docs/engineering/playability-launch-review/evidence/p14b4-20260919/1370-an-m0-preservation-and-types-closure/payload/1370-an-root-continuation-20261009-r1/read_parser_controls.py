import hashlib,json,os,re,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-an-exact-identity-json-controls-parent-recorded-20261010-r1';O=S/'1370-an-exact-identity-json-controls-recorded-results-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==2
a=read(P/'ACTUAL-TOOL.json');assert a['sessionId']==int(sys.argv[1]) and type(a['finalExit']) is int and a['finalExit']==a['allToolChunks'][-1]['exit_code']==0
g=read(P/'GRANT.json');claim=read(P/'LAUNCH-CLAIM.json');assert claim['grant']==role(P/'GRANT.json') and claim['actualOwnGroupConfirmed'] and claim['directExecPreservesOuterIdentity']
for key in ('sourcePins','sourceReview','config','recipe','sourceAdoption','runtimeToolsObservation'):assert role(g[key]['path'])==g[key]
r=read(O/'RESULT.json');v=read(O/'CONTROLS-RESULT.json');c=read(g['config']['path'])
assert r['status']=='EXACT_IDENTITY_JSON_CONTROLS_COMPLETE_UNADOPTED' and r['actualChildExit']==0 and r['groupClear'] is True and r['timedOut'] is False and r['childPid']==r['ownedPgid'] and r['startupOwnedBeforeExec'] and r['pgidConfirmed']
assert not (O/'OVERRIDE-STOP.json').exists() and r['boundsSeconds']=={'node':300,'active':320,'whole':330} and r['configSha256']==g['configSha256']
for name in ('stdout','stderr'):
 x=role(O/(name+'.bin'));assert x['bytes']==r[name+'Bytes'] and x['sha256']==r[name+'Sha256'] and x['bytes']<=8388608
assert (O/'stderr.bin').stat().st_size==0 and json.loads((O/'stdout.bin').read_bytes())==v
assert v['schema']=='1370-exact-identity-json-pure-controls-result/v1' and v['status']=='PASS_EXACT_IDENTITY_JSON_PURE_CONTROLS_ALL_CASES_ONLY' and v['caseCount']==len(v['results'])==32
assert v['parserSource']==c['inputs']['exact-json.mjs'] and v['controlsSource']==c['inputs']['run-parser-controls.mjs']
for key in ('parserSource','controlsSource'):assert role(v[key]['path'])==v[key]
ids=re.findall(r"^check\('([^']+)'",Path(v['controlsSource']['path']).read_text(),re.M);assert len(ids)==len(set(ids))==32 and [x['id'] for x in v['results']]==ids and all(x['verdict']=='PASS_SPECIFIC_PURE_CONTROL' for x in v['results'])
for key in ('privateM0ReadOrWritten','game','executionAuthorization','originalJsonArtifactBytesChanged'):assert v[key] is False
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
out={'schema':'1370-root-exact-json-controls-actual-readback/v1','status':'ACTUAL_PURE_32_CONTROLS_COMPLETE_PENDING_INDEPENDENT_REVIEW','actualTool':role(P/'ACTUAL-TOOL.json'),'toolSessionId':a['sessionId'],'toolExit':0,'grant':role(P/'GRANT.json'),'parentClaim':role(P/'LAUNCH-CLAIM.json'),'result':role(O/'CONTROLS-RESULT.json'),'recorderResult':role(O/'RESULT.json'),'stdout':role(O/'stdout.bin'),'stderr':role(O/'stderr.bin'),'laneLog':role(lane),'laneMetadata':role(meta),'caseCount':32,'allSpecificControlsPassed':True,'actualOwnedIds':owned,'scopedOwnershipChecks':checks,'laneReleased':True,'recorderSeconds':r['elapsedSeconds'],'preparationSeconds':claim['preparationElapsedSeconds'],'parserSource':v['parserSource'],'controlsSource':v['controlsSource'],'privateM0ReadOrWritten':False,'game':False,'executionAuthorization':False}
p=P/'READBACK.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'readback':role(p),'recorderSeconds':r['elapsedSeconds'],'actualOwnedIds':owned,'caseCount':32}))
