import hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
rr=role(sys.argv[1]);assert rr['sha256']==sys.argv[2];r=read(rr['path'])
assert r['decision']=='ACCEPT_OBSERVED_FULLFUNCTION_FEASIBILITY_ROW_BYTE_CAP_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT' and r['executionAuthorization'] is False and r['concreteFindings']==[]
keys=('readback','fullPostflightReadback','fullPostflightSnapshot','currentTypesAdoption','generationReport','generationReceipt','fixture','baselineReport')
for k in keys:assert role(r[k]['path'])==r[k]
assert r['readback']['sha256']=='321035432c082f1238587d7783300b0c49d10c4935042d05968136cb6c727489' and r['currentTypesAdoption']['sha256']=='be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83'
assert r['fullPostflightReadback']['sha256']=='1af7a89810d94e59fc70e043aa9c478a09feae62511d2b128fe270365d97be67' and r['fullPostflightSnapshot']['sha256']=='8222e0888b5f05f82295d16b2941ac5de46e4a9269b48751d6d177d9e3b63cf0'
assert r['fixture']['sha256']=='0ae4a9a261600c23b1bfd05eb860d65ef0f6769c9918670eb97bf7120b74ec62' and r['fixture']['bytes']==12428510
b=read(r['readback']['path']);f=read(r['fullPostflightReadback']['path']);t=read(r['currentTypesAdoption']['path']);g=read(r['generationReport']['path']);gr=read(r['generationReceipt']['path']);bl=read(r['baselineReport']['path'])
assert b['completed'] and b['laneReleased'] and b['toolSessionId']==56544 and b['toolExit']==b['helperExit']==b['recorderExit']==2 and b['runnerExit']==1 and b['controllerStatus']=='STOP_NODE_EXIT'
assert b['actualGameplayPrefixExecuted'] is None and b['sourceAfter'] is None and b['dependencyAfter'] is None and b['sourceBefore']==t['freshSourceProof'] and b['dependencyBefore']==t['freshDependencyProof']
assert g['success'] is True and g['numTotalTests']==g['numPassedTests']==1 and g['numFailedTests']==0 and gr['sourcePhase']=='tick.before.advanceTalentMarketWeek' and gr['naturalWeeks']==[196,197,208] and gr['artifact']==r['fixture'] and gr['outcome']=='GENERATED_UNADMITTED'
assert bl['success'] is False and bl['numTotalTests']==bl['numFailedTests']==1 and bl['numPassedTests']==0
messages=bl['testResults'][0]['assertionResults'][0]['failureMessages'];assert len(messages)==1 and messages[0].startswith('Error: M0 feasibility row byte bound exceeded\n') and '/controls/full-body-controls.ts:85:16' in messages[0]
assert f['toolSessionId']==92358 and f['toolExit']==0 and f['fullImmutableEqual'] and f['nineStrictRootsEqual'] and f['laneReleased'] and f['priorStopPreserved'] and f['actualRouteReadback']==r['readback'] and f['fullPostflightSnapshot']==r['fullPostflightSnapshot']
for k in ('priorGenerationFixture','currentGenerationFixture'):assert role(r[k]['path'])==r[k]
assert r['currentGenerationFixture']==r['fixture'] and all(r['priorGenerationFixture'][k]==r['fixture'][k] for k in ('bytes','sha256')) and r['repeatedFixtureBytesEqual'] is True and r['actualGenerationPhaseSucceeded'] is True
for x in (b,f):
 assert role(x['actualTool']['path'])==x['actualTool'];actual=read(x['actualTool']['path']);assert actual['sessionId']==x['toolSessionId'] and actual['finalExit']==x['toolExit'] and actual['allToolChunks'][-1]['exit_code']==x['toolExit']
rec=read(b['recorderResult']['path']);assert role(b['recorderResult']['path'])==b['recorderResult'] and rec['timedOut'] is False and rec['groupClear'] is True and rec['boundsSeconds']=={'aggregateChild':300,'active':320,'whole':330}
assert len(f['scopedOwnershipChecks'])==9 and all(x['result']=='ESRCH' for x in f['scopedOwnershipChecks']) and not os.path.lexists(S/'HEAVY-LANE-LOCK')
v={'schema':'1370-root-fullfunction-protected-stop-observed-adoption/v1','status':'ROOT_ADOPTED_FULLFUNCTION_FEASIBILITY_ROW_BYTE_CAP_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT','independentObservedReview':rr,**{k:r[k] for k in keys},'originalAttemptRemainsStop':True,'fullSharedPostflightAccepted':True,'soleLaneReleased':True,'executionAuthorization':False,'game':False,'actualGameplayPrefixExecuted':None,'actualGenerationPhaseSucceeded':True,'generatedNaturalBoundaryWeeks':[196,197,208],'observedFixtureWithinApprovedCap':True,'baselineAccepted':False,'mutantAccepted':False,'fixtureQualificationAccepted':False,'neutralityAccepted':False,'sourceAfter':None,'dependencyAfter':None,'completeBeforeSourceAndDependenciesMatch':True,'fullM0AfterProofAccepted':False,'protectedFreezeContinues':True,'diagnosis':{'error':'M0 feasibility row byte bound exceeded','observerRowLimit':16384,'actualFailedRowBytes':None,'actualFailedRowKind':None,'actualFailedTupleFamily':None,'actualFailedLoopIteration':None},'priorGenerationFixture':r['priorGenerationFixture'],'currentGenerationFixture':r['currentGenerationFixture'],'repeatedFixtureBytesEqual':True,'broadReplayAccepted':False,'observerLimitsChanged':False,'recorderSeconds':rec['elapsedSeconds'],'freshPassingSharedPostSession':92358,'scope':'Actual56544 repeated real natural generation then failed original feasibility observer row-byte predicate in synthetic opportunity loop. Earlier natural checks returned by exact sequential source, not a complete baseline or independent per-pair result. Unknown offending bytes/kind/family/iteration remain null. Actual92358 proves full shared preservation, not missing M0 AFTER proofs. No full qualification, catch-mutant, neutrality, ledger or downstream acceptance.'}
p=A/'FULLFUNCTION-R5-STOP-OBSERVED-ADOPTION.json'
with p.open('x') as h:json.dump(v,h,sort_keys=True,indent=2);h.write('\n');h.flush();os.fsync(h.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
