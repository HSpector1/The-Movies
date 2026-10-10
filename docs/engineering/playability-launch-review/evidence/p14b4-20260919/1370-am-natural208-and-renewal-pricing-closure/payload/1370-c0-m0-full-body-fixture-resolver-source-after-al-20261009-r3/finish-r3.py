from pathlib import Path
import hashlib,json
P=Path(__file__).resolve().parent
S=P.parent/'1370-c0-m0-full-body-fixture-resolver-source-after-al-20261009-r2'
def role(p):
 raw=p.read_bytes();return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def put(name,data):
 with (P/name).open('x') as f:f.write(json.dumps(data,indent=2,sort_keys=True)+'\n')
order=['issuerNotEntered','retirementCap','issuerDistrusted','nemesisOnRoster','subjectCommittedElsewhere','startWeekMoved','noSeatForRole','belowAsk','belowRetirementReservation','materialTermsChanged','promiseNotFeasible','bonusUnaffordable']
probe={'calls':[],'evaluations':[]};market=[];tuples=[]
for i,issuer in enumerate(['synthetic-issuer-a','synthetic-issuer-b']):
 context={'era':'M0','week':196,'caseKey':'synthetic-case-key','caseOccurrence':0,'caseSourceIndex':0,
  'subject':'synthetic-subject','issuer':issuer,'proposalKey':'synthetic-proposal-key-'+str(i),
  'proposalOccurrence':0,'proposalSourceIndex':0,'phase':'authorCandidate','candidateOrdinal':0}
 projection={'context':context,'cases':[{'sourceIndex':0,'key':context['caseKey']}],
  'proposals':[{'sourceIndex':0,'key':context['proposalKey'],'talentId':context['subject'],'issuer':issuer,'digest':'synthetic-digest-'+str(i)}]}
 probe['calls'].append({'sequence':i,'name':'m0SourceArrays','detail':projection})
 probe['evaluations'].append({'context':context})
 tuples.append({'kind':'inputTuple','context':context})
 attachment={'family':'APPEARANCE_COUNT','predicate':{'count':1},'windowStartWeek':208,'dueWeekExclusive':416}
 market.extend([{'sequence':2*i,'week':196,'phase':'candidateOrder','issuerStudioId':issuer,
  'detail':{'candidates':[{'ordinal':0,'attachment':attachment}]}},
  {'sequence':2*i+1,'week':196,'phase':'candidateFeasibility','issuerStudioId':issuer,
   'detail':{'candidateOrdinal':0,'attachment':attachment,'feasibility':{'classification':'REASONABLY_ACHIEVABLE'}}}])
refs=[{'digest':'synthetic-digest-a','proposalSourceIndex':2,'proposalOccurrence':0},
 {'digest':'synthetic-digest-b','proposalSourceIndex':5,'proposalOccurrence':0}]
freezes=[];predicates=[]
for i,ref in enumerate(refs):
 issuer=['synthetic-issuer-a','synthetic-issuer-b'][i];drop=None if i==0 else 'startWeekMoved'
 freezes.append({'sequence':100+i,'week':208,'phase':'freezeProposal','issuerStudioId':issuer,'detail':{'drop':drop,'proposal':{'digest':ref['digest']}}})
 for ordinal,predicate in enumerate(order):
  result=('NOT_EVALUATED' if ordinal==6 else 'PASSED') if i==0 else ('PASSED' if ordinal<5 else 'FAILED' if ordinal==5 else 'NOT_REACHED')
  predicates.append({'sequence':i*12+ordinal,'week':208,'phase':'freezePredicate','issuerStudioId':issuer,
   'detail':{'proposalDigest':ref['digest'],'proposalSourceIndex':ref['proposalSourceIndex'],'proposalOccurrence':ref['proposalOccurrence'],
    'predicateOrdinal':ordinal,'predicate':predicate,'result':result,'values':'NOT_EVALUATED' if result=='NOT_REACHED' else {}}})
bases={'author-two-issuers':{'method':'author','args':{'probe':probe,'marketValues':market,'feasibilityValues':tuples}},
 'freeze-pass-and-first-failure':{'method':'freeze','args':{'marketValues':predicates,'freezeValues':freezes,'refs':refs}}}
cases=[{'id':'author-two-issuers-schema-GREEN','base':'author-two-issuers','expected':'GREEN','edits':[]},
 {'id':'freeze-complete-prefix-failure-suffix-GREEN','base':'freeze-pass-and-first-failure','expected':'GREEN','edits':[]}]
def red(name,base,path,value,message,op='set',other=None):
 edit={'op':op,'path':path}
 if op=='set':edit['value']=value
 if op=='swap':edit['other']=other
 cases.append({'id':name,'base':base,'expected':'RED','assertion':message,'edits':[edit]})
red('candidate-other-issuer-grouping-RED','author-two-issuers',['marketValues',3,'issuerStudioId'],'synthetic-issuer-a','evaluated and skipped candidates preserve full order')
red('candidate-context-issuer-correlation-RED','author-two-issuers',['probe','calls',1,'detail','context','issuer'],'synthetic-issuer-a','every actual evaluation binds an authenticated source-array projection')
block='freeze-pass-and-first-failure';identity='complete identity-bound freeze predicate order'
red('freeze-missing-slot-RED',block,['marketValues',4],None,identity,'remove')
red('freeze-swapped-slots-RED',block,['marketValues',3],None,identity,'swap',4)
red('freeze-wrong-name-RED',block,['marketValues',3,'detail','predicate'],'belowAsk',identity)
red('freeze-wrong-ordinal-RED',block,['marketValues',3,'detail','predicateOrdinal'],4,identity)
red('freeze-wrong-occurrence-RED',block,['marketValues',3,'detail','proposalOccurrence'],1,identity)
red('freeze-wrong-issuer-RED',block,['marketValues',13,'issuerStudioId'],'synthetic-issuer-a',identity)
red('freeze-failure-slot-missing-RED',block,['marketValues',17,'detail','result'],'PASSED','freeze predicate FAILED slot agrees with drop')
red('freeze-drop-disagrees-RED',block,['freezeValues',1,'detail','drop'],'belowAsk','freeze predicate FAILED slot agrees with drop')
red('freeze-early-unreached-RED',block,['marketValues',14,'detail','result'],'NOT_REACHED','freeze predicate prefix status')
red('freeze-suffix-resumes-RED',block,['marketValues',18,'detail','result'],'PASSED','freeze predicate suffix is NOT_REACHED')
red('freeze-suffix-values-forged-RED',block,['marketValues',19,'detail','values'],{},'unreached predicate has no evaluated values')
red('freeze-second-failure-RED',block,['marketValues',18,'detail','result'],'FAILED','freeze predicate FAILED slot agrees with drop')
red('freeze-illegal-not-evaluated-prefix-RED',block,['marketValues',8,'detail','result'],'NOT_EVALUATED','freeze predicate prefix status')
red('freeze-unknown-drop-RED',block,['freezeValues',1,'detail','drop'],'inventedPredicate','freeze drop names an existing predicate')
put('ORDERING-SOURCE-CASES.json',{'schema':'1370-m0-ordering-synthetic-source-inputs/v1',
 'claim':'SYNTHETIC_WITNESS_CONSUMER_INPUTS_NOT_GAME_STATES_OR_OBSERVED_RESULTS','bases':bases,'cases':cases,
 'expectedGreen':2,'expectedRed':len(cases)-2,'executionAuthorization':False,'executionPerformed':False})
proof=json.loads((P/'SOURCE-PROOF.json').read_text())
proof['consumerRepair']['sourceCases']=role(P/'ORDERING-SOURCE-CASES.json')
proof['consumerRepair']['sourceCaseMethod']=role(P/'ordering-source-controls.ts')
# This is the newly authored scratch proof, not an admitted predecessor.
(P/'SOURCE-PROOF.json').write_text(json.dumps(proof,indent=2,sort_keys=True)+'\n')
names=[str(p.relative_to(P)) for p in sorted(P.rglob('*')) if p.is_file() and p.name not in ('SOURCE-PINS.json','SEAL.json')]
payload={name:role(P/name) for name in names}
put('SOURCE-PINS.json',{'schema':'1370-m0-full-body-source-continuation-pins/v1','revision':'r3-two-consumer-repairs',
 'executionAuthorization':False,'executionPerformed':False,'controlsReadyForRuntime':False,
 'actualM0Types':None,'operationalProtection':None,'fixtureRoles':None,'files':payload,'sourceOnlyMethodsNotRuntimeGrants':True})
put('SEAL.json',{'schema':'1370-m0-full-body-source-continuation-seal/v1','sourcePins':role(P/'SOURCE-PINS.json'),
 'sourceProof':role(P/'SOURCE-PROOF.json'),'roles':len(payload),'executionAuthorization':False,
 'claim':'HELD_SOURCE_TWO_CONSUMER_REPAIRS_AND_UNRUN_SYNTHETIC_CASE_INPUTS'})
for name,expected in payload.items():assert role(P/name)==expected
print(json.dumps({'sourcePins':role(P/'SOURCE-PINS.json'),'seal':role(P/'SEAL.json'),
 'sourceProof':role(P/'SOURCE-PROOF.json'),'ordering':role(P/'ordering.ts'),
 'cases':role(P/'ORDERING-SOURCE-CASES.json'),'roles':len(payload),
 'proposedUnrunGreen':2,'proposedUnrunRed':len(cases)-2},indent=2))
