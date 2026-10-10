import hashlib,json,os,stat
from pathlib import Path
A=Path(__file__).parent;S=A.parent;P=S/'1370-an-lossless-trace-pure-controls-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
rr=role(S/'1370-an-lossless-trace-pure-controls-independent-observed-review-20261010-r1/RECEIPT.json')
assert rr['sha256']=='9879d8a775565f7bf78fe11fe0f9d336d8f1b46742cc1533b5ce28f10ff18bd9';r=read(rr['path'])
assert r['decision']=='ACCEPT_ACTUAL_PURE_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_CONTROLS_ONLY' and r['concreteFindings']==[] and r['executionAuthorization'] is False
br=role(P/'READBACK.json');assert br['sha256']=='465611a4c3c8693616d0a857804400117cf8452a71ca9b1a0658b1f4718ebdd5';b=read(br['path'])
assert r['readback']==br and b['toolSessionId']==17643 and b['toolExit']==0 and b['caseCount']==49 and b['positiveCount']==9 and b['specificNegativeCount']==40 and b['allSpecificControlsPassed'] is True and b['laneReleased'] is True
keys=('result','workerResult','actualTool','implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','rootDesignAdoption','sourceAdoption','implementationControlsSourceAdoption')
for k in keys:assert role(b[k]['path'])==b[k] and r[k]==b[k]
assert b['inputRoles']==r['inputRoles']
for x in b['inputRoles'].values():assert role(x['path'])==x
v=read(b['result']['path']);matrix=read(b['inputRoles']['MATRIX.json']['path'])
assert v['results']==[{**x,'verdict':'ACCEPT_POSITIVE' if x['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for x in matrix['cases']] and len(v['results'])==49
assert v['positiveCount']==9 and v['specificNegativeCount']==40 and v['originalOrderingCases']==18 and v['originalParserCasesReplayed']==0
assert v['game'] is False and v['originalM0ReadOrWritten'] is False and v['executionAuthorization'] is False
a=read(b['actualTool']['path']);assert a['sessionId']==17643 and a['finalExit']==a['allToolChunks'][-1]['exit_code']==0
im=read(b['implementationSourcePins']['path']);fr=im['files']['FULL-BODY-CONTROLS-TEMPLATE.ts'];assert role(fr['path'])==fr and fr['sha256']=='324c7cc754497e43cc5a9d46865f4cbf7e1a635b5e2ce5ac0857defab8661a02'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
out={'schema':'1370-root-lossless-trace-controls-observed-adoption/v1','status':'ROOT_ADOPTED_ACTUAL_LOSSLESS_TRACE_49_CONTROLS_ONLY','independentObservedReview':rr,'readback':br,**{k:b[k] for k in keys},'inputRoles':b['inputRoles'],'sourceReviewedFullBodyTemplate':fr,'fullBodyGameAssertionsExecuted':False,'caseCount':49,'positiveCount':9,'specificNegativeCount':40,'originalOrderingCases':18,'originalParserCasesReplayed':0,'actualExit':0,'soleLaneReleased':True,'executionAuthorization':False,'game':False,'privateM0ReadOrWritten':False,'fullQualificationAccepted':False,'actualNaturalFixtureFit':None,'recorderSeconds':b['recorderSeconds'],'scope':'Actual finite49 pure codec/probe/pair/ordering controls only. Original18 changed-consumer regressions included; original parser32 not replayed. Fullbody template source reviewed/authenticated only; no real game assertions, natural fixture fit, baseline, typed-catch mutant, neutrality or ledger acceptance.'}
p=A/'LOSSLESS-CONTROLS-OBSERVED-ADOPTION.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
