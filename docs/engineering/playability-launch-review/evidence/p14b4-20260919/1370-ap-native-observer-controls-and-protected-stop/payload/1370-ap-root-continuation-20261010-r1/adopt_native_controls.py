import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;P=S/'1370-ap-native-observer-pure-controls-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
ir=role(sys.argv[1]);assert ir['sha256']==sys.argv[2];iv=read(ir['path'])
assert iv['schema']=='1370-native-observer-controls-independent-observed-review/v1' and iv['decision']=='ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_72_CONTROLS_ONLY' and iv['concreteFindings']==[] and iv['executionAuthorization'] is False
rr=role(P/'READBACK.json');r=read(rr['path']);assert iv['readback']==rr
assert r['schema']=='1370-root-native-observer-controls-actual-readback/v1' and r['status']=='ACTUAL_PURE_72_NATIVE_OBSERVER_CONTROLS_COMPLETE_PENDING_INDEPENDENT_REVIEW'
for v in r.values():
 if type(v) is dict and set(v)=={'path','bytes','sha256'}:assert role(v['path'])==v
for k in ('inputRoles','generatedModules'):
 for v in r[k].values():assert role(v['path'])==v
for k in ('result','recorderResult','actualTool'):assert iv[k]==r[k]
a=read(r['actualTool']['path']);assert a['sessionId']==r['toolSessionId'] and type(a['sessionId']) is int and a['finalExit']==a['allToolChunks'][-1]['exit_code']==r['toolExit']==0
ra=role(P/'READER-ACTUAL-TOOL.json');rav=read(ra['path']);assert rav['finalExit']==rav['allToolChunks'][-1]['exit_code']==0
assert r['caseCount']==72 and r['positiveCount']==13 and r['specificNegativeCount']==59 and r['originalOrderingCases']==18 and r['originalParserCasesReplayed']==0
assert r['laneReleased'] is True and r['allSpecificControlsPassed'] is True
for k in ('privateM0ReadOrWritten','game','fullQualificationAccepted','executionAuthorization'):assert r[k] is False
assert len(r['actualOwnedIds'])==2 and len(r['scopedOwnershipChecks'])==4 and all(x['result']=='ESRCH' for x in r['scopedOwnershipChecks'])
v=read(r['result']['path']);rec=read(r['recorderResult']['path']);matrix=read(r['inputRoles']['MATRIX.json']['path'])
assert v['results']==[{**x,'verdict':'ACCEPT_POSITIVE' if x['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for x in matrix['cases']] and len(v['results'])==72
assert rec['actualChildExit']==0 and rec['timedOut'] is False and rec['groupClear'] is True and rec['boundsSeconds']=={'node':300,'active':320,'whole':330}
impl=read(r['implementationSourcePins']['path']);template=impl['files']['FULL-BODY-CONTROLS-TEMPLATE.ts'];assert role(template['path'])==template
out={k:r[k] for k in ('result','workerResult','recorderResult','actualTool','inputRoles','generatedModules','sourceAdoption','sourcePins','sourceReview','implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption','implementationControlsSourceAdoption','api','apiAdoption','supplementAdoption','actualOwnedIds','scopedOwnershipChecks','caseCount','positiveCount','specificNegativeCount','recorderSeconds','preparationSeconds')}
out.update({'schema':'1370-root-native-observer-controls-observed-adoption/v1','status':'ROOT_ADOPTED_ACTUAL_NATIVE_OBSERVER_72_CONTROLS_ONLY','readback':rr,'independentObservedReview':ir,'rootReaderActualTool':ra,'rootAdopterSource':role(__file__),'actualSessionId':a['sessionId'],'actualExit':0,'soleLaneReleased':True,'originalOrderingCases':18,'historicalParser32Replayed':False,'historicalLossless49Replayed':False,'historicalObserver48Replayed':False,'historicalStopsPreserved':True,'nativePhysicalCaps':{'rows':512,'rowBytesIncludingNewline':16384,'totalBytesIncludingNewlines':2097152},'expandedLegacyAccountingExplicitlyAmended':True,'sourceReviewedFullBodyTemplate':template,'sameErrorAndCleanupControlsActuallyPassed':True,'physicalCapsRoundtripAndAffectedConsumersActuallyPassed':True,'actualOffendingGameRowMetrics':None,'fullBodyGameAssertionsExecuted':False,'fullQualificationAccepted':False,'privateM0ReadOrWritten':False,'game':False,'executionAuthorization':False,'scope':'Actual72 pure native observer controls only, including original18 actual ordering predicates. Exact canonical projection, native physical caps, actual consumer corruption refusal, sticky first failure and cleanup passed. Original gameplay fixture fit, fullfunction and specific market mutant remain unexecuted by this suite.'})
p=A/'NATIVE-OBSERVER-CONTROLS-OBSERVED-ADOPTION.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'adoption':role(p),'caseCount':72,'recorderSeconds':r['recorderSeconds']}))
