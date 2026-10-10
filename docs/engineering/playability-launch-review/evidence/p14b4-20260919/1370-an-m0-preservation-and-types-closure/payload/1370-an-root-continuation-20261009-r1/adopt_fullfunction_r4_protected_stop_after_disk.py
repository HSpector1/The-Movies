import hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==4
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];r=read(rr['path'])
assert r['decision']=='ACCEPT_OBSERVED_FULLFUNCTION_HELPER_PROBE_TOTAL_BYTE_CAP_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT' and r['executionAuthorization'] is False and r['concreteFindings']==[]
keys=('readback','fullPostflightReadback','fullPostflightSnapshot','currentTypesAdoption','generationReport','generationReceipt','fixture','baselineReport')
for k in keys:assert role(r[k]['path'])==r[k]
assert r['readback']['sha256']=='568c92e332879885a53726cc359b296d4279c9f763236edeed019f7d92a06e28' and r['currentTypesAdoption']['sha256']=='be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83' and r['fixture']['sha256']=='0ae4a9a261600c23b1bfd05eb860d65ef0f6769c9918670eb97bf7120b74ec62' and r['fixture']['bytes']==12428510
b=read(r['readback']['path']);f=read(r['fullPostflightReadback']['path']);t=read(r['currentTypesAdoption']['path']);g=read(r['generationReport']['path']);gr=read(r['generationReceipt']['path']);bl=read(r['baselineReport']['path'])
assert b['completed'] and b['laneReleased'] and b['toolSessionId']==21948 and b['toolExit']==2 and b['runnerExit']==1 and b['controllerStatus']=='STOP_NODE_EXIT' and b['actualGameplayPrefixExecuted'] is None and b['sourceAfter'] is None and b['dependencyAfter'] is None and b['sourceBefore']==t['freshSourceProof'] and b['dependencyBefore']==t['freshDependencyProof']
assert g['success'] is True and g['numTotalTests']==g['numPassedTests']==1 and g['numFailedTests']==0 and gr['sourcePhase']=='tick.before.advanceTalentMarketWeek' and gr['naturalWeeks']==[196,197,208] and gr['artifact']==r['fixture'] and gr['outcome']=='GENERATED_UNADMITTED'
assert bl['success'] is False and bl['numTotalTests']==bl['numFailedTests']==1 and bl['numPassedTests']==0
assert f['toolSessionId']==int(sys.argv[3]) and f['toolExit']==0 and f['fullImmutableEqual'] and f['nineStrictRootsEqual'] and f['laneReleased'] and f['priorStopPreserved'] and f['actualRouteReadback']==r['readback'] and f['fullPostflightSnapshot']==r['fullPostflightSnapshot']
expected={'entryCap':False,'rowByteCap':False,'totalByteCap':True,'entries':1450,'calls':1298,'evaluations':152,'retainedBytes':2075516,'nextRowBytes':32241}
assert r['diagnosis']==expected and all(type(r['diagnosis'][k]) is type(v) for k,v in expected.items())
for k in ('priorGenerationFixture','currentGenerationFixture'):assert role(r[k]['path'])==r[k]
assert r['currentGenerationFixture']==r['fixture'] and all(r['priorGenerationFixture'][k]==r['fixture'][k] for k in ('bytes','sha256')) and r['repeatedFixtureBytesEqual'] is True and r['actualGenerationPhaseSucceeded'] is True
messages=bl['testResults'][0]['assertionResults'][0]['failureMessages'];assert len(messages)==1
tail=messages[0].split('firstOverflow=',1)[1];actual=json.JSONDecoder().raw_decode(tail)[0]
assert actual==expected and all(type(actual[k]) is type(v) for k,v in expected.items())
assert expected['entries']==expected['calls']+expected['evaluations'] and expected['entries']<16384 and expected['nextRowBytes']<=65536 and expected['retainedBytes']+expected['nextRowBytes']-2097152==10605
assert sys.argv[3].isdigit() and int(sys.argv[3])>1 and int(sys.argv[3])!=7509
assert role(f['actualTool']['path'])==f['actualTool']
actualPost=read(f['actualTool']['path']);assert actualPost['sessionId']==int(sys.argv[3]) and actualPost['finalExit']==0 and actualPost['allToolChunks'][-1]['exit_code']==0
failedPostRole=role(A/'FULLFUNCTION-R4-SHARED-POST-DISK-STOP-OBSERVED-ADOPTION.json');assert failedPostRole['sha256']=='317c5e580df7599c83c390b1269e1d2a64f34788b1622d89941c7b077a763307'
failedPost=read(failedPostRole['path']);assert failedPost['original7509RemainsFailure'] is True and failedPost['fullSharedPostflightAccepted'] is False and failedPost['executionAuthorization'] is False
failedScannerChecks=[]
for fn,kind in ((os.kill,'pid'),(os.killpg,'pgid')):
 try:fn(35222,0)
 except ProcessLookupError:failedScannerChecks.append({'kind':kind,'id':35222,'result':'ESRCH'})
 else:raise RuntimeError('Old failed post scanner remains')
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
v={'schema':'1370-root-fullfunction-protected-stop-observed-adoption/v1','status':'ROOT_ADOPTED_FULLFUNCTION_HELPER_PROBE_TOTAL_BYTE_CAP_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT','independentObservedReview':rr,**{k:r[k] for k in keys},'originalAttemptRemainsStop':True,'fullSharedPostflightAccepted':True,'soleLaneReleased':True,'executionAuthorization':False,'game':False,'actualGameplayPrefixExecuted':None,'actualGenerationPhaseSucceeded':True,'generatedNaturalBoundaryWeeks':[196,197,208],'observedFixtureWithinApprovedCap':True,'baselineAccepted':False,'mutantAccepted':False,'fixtureQualificationAccepted':False,'neutralityAccepted':False,'sourceAfter':None,'dependencyAfter':None,'completeBeforeSourceAndDependenciesMatch':True,'fullM0AfterProofAccepted':False,'protectedFreezeContinues':True,'scope':'Actual21948 reproduced the same real natural boundary packet then failed first off author196 baseline. Total-byte cap alone failed:2075516+32241=2107757 exceeds2097152 by10605. Preserve phase success and finite repeated-packet identity separately from aggregate STOP, terminal nulls and missing afterproofs. No full qualification, broad replay, intended mutant RED, neutrality or ledger acceptance.'}
v.update({'diagnosis':expected,'priorGenerationFixture':r['priorGenerationFixture'],'currentGenerationFixture':r['currentGenerationFixture'],'repeatedFixtureBytesEqual':True,'broadReplayAccepted':False,'limitsChanged':False})
v.update({'failedSharedPostPreserved':failedPostRole,'failedPostScannerChecksAfterFreshPost':failedScannerChecks,'originalSharedPost7509RemainsFailure':True,'freshPassingSharedPostSession':int(sys.argv[3])})
p=A/'FULLFUNCTION-R4-STOP-OBSERVED-ADOPTION.json'
with p.open('x') as h:json.dump(v,h,sort_keys=True,indent=2);h.write('\n');h.flush();os.fsync(h.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
