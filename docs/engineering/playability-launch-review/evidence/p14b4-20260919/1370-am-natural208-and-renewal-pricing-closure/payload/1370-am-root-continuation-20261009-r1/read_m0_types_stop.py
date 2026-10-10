import hashlib,json,os,re
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-am-root-continuation-20261009-r1';Q=S/'1370-c0-m0-proof-types-parent-launch-preparation-after-al-20261009-r2'
profile=json.loads((Q/'PROFILES.json').read_bytes())['types'];P=Path(profile['parentPath']);O=Path(profile['resultRoot'])/profile['runId'];L=Path(profile['laneLog'])
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
a=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert a['toolSessionId']==79362 and a['finalExit']==1
r=json.loads(Path(profile['recorderResult']).read_bytes());v=json.loads((O/'RESULT.json').read_bytes());prot=json.loads((A/'M0-CURRENT-TYPES-PROTECTION.json').read_bytes())
assert role(O/'RESULT.json')['sha256']=='85106763c640e105578d5b38b97c5af732611f34bf307688a8069de6ab241963'
assert r['status']=='STOP_CHILD_NONZERO' and r['childExit']==1 and r['groupClear'] is True and r['sourceDeadlineSeconds']==300 and r['recorderActiveSeconds']==320 and r['recorderWholeSeconds']==330 and r['elapsedSeconds']<320
assert v['status']=='STOP_TYPECHECK_COLLECTION' and v['error']=="RuntimeError('root-tsc child exit 2')" and v['elapsedSeconds']<300 and v['h13MetadataStopWaived'] is False and v['gameAccepted'] is False
assert v['sourceBefore']==v['sourceAfter']==prot['freshSourceProof'] and v['nodeModulesBefore']==v['nodeModulesAfter']==prot['freshDependencyProof']
assert [(x['name'],x['exit']) for x in v['children']]==[('dependency-versions',0),('root-tsc',2)] and [x['name'] for x in v['rootChildBoundaries']]==['dependency-versions','root-tsc']
for child,boundary in zip(v['children'],v['rootChildBoundaries']):
 assert boundary['before']==boundary['after']
 for stream in ('stdout','stderr'):
  rr=role(O/(child['name']+'.'+stream));assert rr['bytes']==child[stream+'Bytes']<=8388608 and rr['sha256']==child[stream+'Sha256']
errors=(O/'root-tsc.stdout').read_text().splitlines();assert len(errors)==11
pattern=re.compile(r"(bridge/[^()]+)\((\d+),(\d+)\): error TS5097: An import path can only end with a '\.ts' extension when 'allowImportingTsExtensions' is enabled\.")
parsed=[]
for line in errors:
 m=pattern.fullmatch(line);assert m;parsed.append({'file':m[1],'line':int(m[2]),'column':int(m[3]),'code':'TS5097'})
assert len(set(x['file'] for x in parsed))==5
f=json.loads((P/'FILL-RESULT.json').read_bytes());assert 0<=f['preparationElapsedSeconds']<60 and f['preparationDeadlineSeconds']==60
for key in ('context','grant','ownedIdentity'):assert role(f[key]['path'])==f[key]
assert f['context']['sha256']==r['contextSha256'] and f['grant']['sha256']==v['actualGrantSha256']
assert 'end, exit 1;' in Path(str(L)+'.meta').read_text()
g=json.loads((P/'ROOT-LANE-GRANT.json').read_bytes());assert g['ownedOuterHelperPid']==g['ownedOuterHelperPgid']==g['ownedOuterHelperSid']==49780 and r['helperPid']==r['helperPgid']==r['helperSid']==50035 and r['childPid']==50062
ids=[49780,50035,50062];checks=[]
for n in ids:
 for fn,label in ((os.kill,'pid'),(os.killpg,'pgid')):
  try:fn(n,0)
  except ProcessLookupError:checks.append({'kind':label,'id':n,'result':'ESRCH'})
  else:raise RuntimeError('STOP recorded owner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
d={'schema':'1370-root-m0-types-actual-stop-readback/v1','status':'ACTUAL_M0_TYPES_STOP_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW','mode':'types','actualTool':role(P/'ACTUAL-TOOL.json'),'toolSessionId':79362,'toolExit':1,'helperExit':1,'recorderExit':1,'runnerExit':1,'rootLaneGrant':role(P/'ROOT-LANE-GRANT.json'),'fill':role(P/'FILL-RESULT.json'),'context':f['context'],'grant':f['grant'],'recorderResult':role(profile['recorderResult']),'typesResult':role(O/'RESULT.json'),'laneLog':role(L),'laneMetadata':role(Path(str(L)+'.meta')),'preparationElapsedSeconds':f['preparationElapsedSeconds'],'recorderElapsedSeconds':r['elapsedSeconds'],'runnerElapsedSeconds':v['elapsedSeconds'],'children':v['children'],'compilerErrors':parsed,'rootCompilerExit':2,'rootCompilerStdout':role(O/'root-tsc.stdout'),'commandsNotExecuted':['ui-tsc','diagnostic-collection'],'twoChildRootBoundariesEqual':True,'sourceProofsEqual':True,'dependencyProofsEqual':True,'recordedOwnedIds':ids,'scopedOwnershipChecks':checks,'laneReleased':True,'executionAuthorization':False,'proofOrTypesAccepted':False,'game':False,'h13HistoricalStopWaived':False,'automaticRetry':False,'unexplainedUpstreamConfigurationCausePending':True}
p=P/'READBACK.json'
with p.open('x') as z:json.dump(d,z,sort_keys=True,indent=2);z.write('\n');z.flush();os.fsync(z.fileno())
p.chmod(0o444);print(json.dumps(role(p)));print(json.dumps({'result':'STOP_PRESERVED','compilerErrors':len(parsed),'recordedOwnedIds':ids,'sourceAndDependenciesUnchanged':True}))
