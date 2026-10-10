import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=S/'1370-ao-root-continuation-20261010-r1';P=S/'1370-ao-m0-fullfunction-observer-row-diagnostic-parent-recorded-20261010-r1';J=S/'1370-ao-fullfunction-observer-row-diagnostic-shared-fullpostflight-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def get(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
assert len(sys.argv)==3 and sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
ir,i=get(sys.argv[1],sys.argv[2]);assert i['decision']=='ACCEPT_OBSERVED_FULLFUNCTION_ORIGINAL_OBSERVER_ROW_CAP_STOP_WITH_AVAILABLE_DIAGNOSTIC_AND_FULL_SHARED_POSTFLIGHT' and i['concreteFindings']==[] and i['executionAuthorization'] is False
rr,r=get(P/'READBACK.json','cd974aecb5d3580eb223cfde74dda04542362762c52fbd6e58ef3a965926266e');jr,j=get(J/'READBACK.json','fe8ddca7ccf46e38bcf4609313e05a031f4f6f7b87270cdccf259763ea8f3312')
mr,m=get(S/'1370-ao-fullfunction-observer-row-diagnostic-independent-measured-row-review-20261010-r1/RECEIPT.json','f80ac6764ca924afe1b2a33152280db573a4235f0fa0d0cb7037083977fdb156')
for x in (r,j,m):
 for v in x.values():
  if type(v) is dict and set(v)=={'path','bytes','sha256'}:assert role(v['path'])==v
assert rr in list(i.values()) and jr in list(i.values()) and j['fullPostflightSnapshot'] in list(i.values())
assert r['completed'] is True and r['laneReleased'] is True and r['toolSessionId']==57182 and [r[k] for k in ('toolExit','helperExit','recorderExit','runnerExit')]==[2,2,2,1]
assert r['controllerStatus']=='STOP_NODE_EXIT' and all(r[k] is None for k in ('sourceAfter','dependencyAfter','nodeResult','naturalBoundaryWeeks','actualGameplayPrefixExecuted')) and r['retainedInconsistencies']==[]
assert j['toolSessionId']==22313 and j['toolExit']==0 and j['fullImmutableEqual'] is True and j['nineStrictRootsEqual'] is True and j['laneReleased'] is True and j['priorStopPreserved'] is True and j['actualRouteReadback']==rr and len(j['scopedOwnershipChecks'])==9
assert all(x['result']=='ESRCH' for x in j['scopedOwnershipChecks'])
rec=json.loads(Path(r['recorderResult']['path']).read_bytes());assert rec['timedOut'] is False and rec['elapsedSeconds']==65.98286025400739
meta=m['metadata'];assert m['decision']=='ACCEPT_RETAINED_MEASURED_ROW_METADATA_ONLY' and m['diagnosticCount']==1 and m['byteOffset']==0 and meta['rowBytes']==17305 and meta['rowLimit']==16384 and meta['canonicalInputBytes']==15360 and meta['detailBytes']==16733 and meta['contextBytes']==468 and meta['family']=='PREFERRED_GENRE_OPPORTUNITY'
assert json.loads(Path(m['diagnosticLine']['path']).read_bytes())==meta
v={'schema':'1370-root-fullfunction-observer-row-diagnostic-stop-adoption/v1','status':'ROOT_ADOPTED_FULLFUNCTION_ORIGINAL_ROW_CAP_STOP_WITH_AVAILABLE_DIAGNOSTIC_AND_FULL_SHARED_POSTFLIGHT','independentObservedReview':ir,'readback':rr,'result':r['controllerResult'],'recorderResult':r['recorderResult'],'actualTool':r['actualTool'],'readerActualTool':role(P/'READER-ACTUAL-TOOL.json'),'sourcePins':r['sourcePins'],'sourceReview':r['sourceReview'],'currentProtection':r['currentProtection'],'historicalTypesAdoption':r['typesAdoption'],'observerControlsAdoption':r['observerDiagnosticControlsObservedAdoption'],'independentMeasuredRowReview':mr,'diagnosticLine':m['diagnosticLine'],'diagnosis':meta,'measuredArithmetic':m['measuredArithmetic'],'fullPostflightReadback':jr,'fullPostflightSnapshot':j['fullPostflightSnapshot'],'fullPostflightActualTool':j['actualTool'],'fullPostflightReaderActualTool':role(J/'READER-ACTUAL-TOOL.json'),'rawLocalOnlyClassification':j['rawLocalOnlyClassification'],'sourceBefore':r['sourceBefore'],'dependencyBefore':r['dependencyBefore'],'sourceAfter':None,'dependencyAfter':None,'actualSessionId':57182,'toolExit':2,'recorderSeconds':rec['elapsedSeconds'],'timedOut':False,'freshPassingSharedPostSession':22313,'fullSharedPostflightAccepted':True,'soleLaneReleased':True,'protectedFreezeContinues':True,'productionHead':'0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4','productionSourceTree':'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','captureEnabled':True,'fixtureIteration':None,'naturalVersusSyntheticUnknown':True,'originalStopsPreserved':True,'fullQualificationAccepted':False,'baselineAccepted':False,'mutantExecuted':False,'neutralityAccepted':False,'game':False,'executionAuthorization':False}
out=A/'FULLFUNCTION-OBSERVER-DIAGNOSTIC-STOP-OBSERVED-ADOPTION.json'
with out.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
out.chmod(0o444)
for p in (P/'ACTUAL-TOOL.json',P/'READER-ACTUAL-TOOL.json',J/'ACTUAL-TOOL.json',J/'READER-ACTUAL-TOOL.json'):p.chmod(0o444)
print(json.dumps(role(out)))
