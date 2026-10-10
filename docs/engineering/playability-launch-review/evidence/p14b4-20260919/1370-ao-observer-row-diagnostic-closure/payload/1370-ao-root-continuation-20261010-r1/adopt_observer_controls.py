import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;P=S/'1370-ao-observer-row-diagnostic-pure-controls-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve()==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(p,h):
 r=role(p);assert r['sha256']==h;return r,json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
ir,iv=check(sys.argv[1],sys.argv[2]);assert iv['decision']=='ACCEPT_ACTUAL_PURE_OBSERVER_ROW_DIAGNOSTIC_CONTROLS_ONLY' and iv['concreteFindings']==[] and iv['executionAuthorization'] is False
br,b=check(P/'READBACK.json','e82d8783ee95ee8dc7cdfdaee1979380c809d8d3eaa108eee8e994cb53d2fb64')
assert iv['readback']==br
for r in b.values():
 if isinstance(r,dict) and set(r)=={'path','bytes','sha256'}:assert role(r['path'])==r
for r in [*b['inputRoles'].values(),*b['generatedModules'].values()]:assert role(r['path'])==r
actual=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert actual['sessionId']==75448 and actual['finalExit']==actual['allToolChunks'][-1]['exit_code']==0
reader=json.loads((P/'READER-ACTUAL-TOOL.json').read_bytes());assert reader['sessionId'] is None and reader['finalExit']==reader['allToolChunks'][-1]['exit_code']==0
grant=json.loads((P/'GRANT.json').read_bytes());config=json.loads(Path(grant['config']['path']).read_bytes())
matrix=json.loads(Path(b['inputRoles']['MATRIX.json']['path']).read_bytes());result=json.loads(Path(b['result']['path']).read_bytes())
assert result==json.loads(Path(b['workerResult']['path']).read_bytes())
assert result['results']==[{**r,'verdict':'ACCEPT_POSITIVE' if r['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for r in matrix['cases']]
assert b['caseCount']==result['caseCount']==config['caseCount']==48 and b['positiveCount']==result['positiveCount']==6 and b['specificNegativeCount']==result['specificNegativeCount']==42
assert b['allSpecificControlsPassed'] and b['laneReleased'] and all(c['result']=='ESRCH' for c in b['scopedOwnershipChecks']) and len(b['scopedOwnershipChecks'])==4
assert b['toolSessionId']==75448 and b['toolExit']==0 and not os.path.lexists(S/'HEAVY-LANE-LOCK')
implementation=json.loads(Path(grant['implementationSourcePins']['path']).read_bytes())
template=implementation['files']['FULL-BODY-CONTROLS-TEMPLATE.ts'];assert role(template['path'])==template and template['sha256']=='6057cdc52bc7db089bd701ff5578bbd4d4c574ed72b4abaa39d20a4e2c87a783'
out={'schema':'1370-root-observer-row-diagnostic-controls-observed-adoption/v1','status':'ROOT_ADOPTED_ACTUAL_OBSERVER_ROW_DIAGNOSTIC_48_CONTROLS_ONLY','readback':br,'independentObservedReview':ir,'actualTool':b['actualTool'],'rootReaderActualTool':role(P/'READER-ACTUAL-TOOL.json'),'result':b['result'],'workerResult':b['workerResult'],'recorderResult':b['recorderResult'],'inputRoles':b['inputRoles'],'generatedModules':b['generatedModules'],'sourceReviewedFullBodyTemplate':template,'fullBodyGameAssertionsExecuted':False,'historicalParser32Replayed':False,'historicalLossless49Replayed':False,'caseCount':48,'positiveCount':6,'specificNegativeCount':42,'actualSessionId':75448,'actualExit':0,'recorderSeconds':b['recorderSeconds'],'preparationSeconds':b['preparationSeconds'],'actualOwnedIds':b['actualOwnedIds'],'scopedOwnershipChecks':b['scopedOwnershipChecks'],'soleLaneReleased':True,'originalObserverLimits':{'rows':512,'rowBytesIncludingNewline':16384,'totalBytesIncludingNewlines':2097152},'historicalStopsPreserved':True,'sameErrorAndCleanupControlsActuallyPassed':True,'actualOffendingGameRowMetrics':None,'game':False,'privateM0ReadOrWritten':False,'fullQualificationAccepted':False,'executionAuthorization':False,'scope':'Actual finite pure48 original public witness/diagnostic/shared-helper controls only. All exact ordered positive and specific refusal results passed within original recorded limits with source/tool readbacks and owned cleanup. Fullbody template is reviewed source only; no game, real offending-row measurement, fixture repair, full qualification or downstream acceptance.',**{k:grant[k] for k in ['implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','implementationControlsSourceAdoption','rootDesignAdoption','api','sourceAdoption','sourcePins','sourceReview']}}
p=A/'OBSERVER-DIAGNOSTIC-CONTROLS-OBSERVED-ADOPTION.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'adoption':role(p)}))
