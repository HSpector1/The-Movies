from pathlib import Path
import json,hashlib,re,difflib
S=Path('/Users/zacheryspector/studio-scratch');P=Path(__file__).parent
B=S/'1370-c0-initial23-source-order-pricing-verification-proposal-20261009-r1';G=S/'1370-c0-renewal208-input-gap-and-minimal-observer-design-20261009-r1';F=S/'1370-c0-renewal208-premium-floor-source-obligations-after-aj-20261009-r2';N=S/'1370-c0-renewal208-r03-2-first-draw-parent-recorded-after-aj-20261009-r1'
H=S/'1369-c0-preimage-replay-proposal-r7/arms/historical/tree';A=S/'1370-c0-aging-era-sparse-materialized-r6-20261008-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(n,x):
 b=(json.dumps(x,indent=2,sort_keys=True)+'\n') if not isinstance(x,str) else x
 (P/n).write_text(b)
def extract(text,name):
 m=re.search(r'(?:export )?function '+name+r'\(',text);assert m
 # All extracted functions here have scalar signatures except proposalPriceAt (return object).
 start=m.start();brace=text.index('{',m.end())
 if name in ('proposalPriceAt','releaseFloor'):
  marker='} {' if name=='proposalPriceAt' else '} | null {'
  brace=text.index('{',text.index(marker,brace)+len(marker)-1)
 depth=1;i=brace+1
 while depth:
  if text[i]=='{':depth+=1
  elif text[i]=='}':depth-=1
  i+=1
 return start,i,text[start:i]
slices=[];mapping=[];sources={}
for arm,root,commit in [('H',H,'8708d6a98e6eb4ad53e3a54e431c4b40b974f79d'),('A',A,'3aaf55e0c06c4b745b0b722cc56913050b1ee229')]:
 for file,names in {'talentSummary.ts':['skillVector','applyGates','ovrCore','roleOVR'],'worldgen.ts':['salaryCurve'],'employment.ts':['ageFactor','offerForTalent','contractOffer'],'talentMarket.ts':['releaseFloor','studioOffer','proposalPriceAt'],'math.ts':['clamp']}.items():
  path=root/'src/core'/file;text=path.read_text();sources[arm+'_'+file]=role(path)
  for name in names:
   st,en,body=extract(text,name);line=text[:st].count('\n')+1;last=text[:en].count('\n')+1
   slices.append(f'=== {arm} src/core/{file} {name} {line}-{last} ===\n{body}\n')
   raw=path.read_bytes();mapping.append({'arm':arm,'sourceCommit':commit,'sourceTreeLocator':commit+':src','treeOid':None,'file':'src/core/'+file,'gitBlobOidDerived':hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest(),'gitMode':None,'modeClaim':'No new mode authentication; original accepted roles retained.','function':name,'startLine':line,'endLine':last,'sliceSha256':hashlib.sha256(body.encode()).hexdigest(),'sourceRole':role(path)})
 # Exact finite constant/table ranges, preserved original source syntax.
 text=(root/'src/core/tuning.ts').read_text();sources[arm+'_tuning.ts']=role(root/'src/core/tuning.ts')
 for lo,hi in [(73,75),(205,212),(376,389),(406,406),(2027,2062),(2091,2097),(2160,2172)]:
  body='\n'.join(text.splitlines()[lo-1:hi])+'\n';slices.append(f'=== {arm} src/core/tuning.ts {lo}-{hi} ===\n'+body)
  mapping.append({'arm':arm,'sourceCommit':commit,'file':'src/core/tuning.ts','startLine':lo,'endLine':hi,'sliceSha256':hashlib.sha256(body.encode()).hexdigest(),'sourceRole':sources[arm+'_tuning.ts']})
put('SOURCE-SLICES.txt','\n'.join(slices));put('SOURCE-MAP.json',mapping)
# Build only type-erased original OVR functions. No source imports/evaluation.
orig=(H/'src/core/talentSummary.ts').read_text();transforms={': Talent':'',': Discipline':'',': SkillUse':'',': number[]':'',': number':'','export function':'function','keys[i]!':'keys[i]','profile[keys[i]]!':'profile[keys[i]]','w[i]!':'w[i]','skills[i]!':'skills[i]'}
ovr=[]
for name in ['skillVector','applyGates','ovrCore','roleOVR']:
 raw=extract(orig,name)[2];a=extract((A/'src/core/talentSummary.ts').read_text(),name)[2];assert raw==a
 for x,y in transforms.items():raw=raw.replace(x,y)
 assert '!' not in raw;ovr.append(raw)
# Constants are literal projections; finite source slices above preserve exact evidence.
const="""const TUNING={SALARY_BASE:25000,SALARY_SKILL_COEF:150000,SALARY_FAME_COEF:600000,
OVR_WEAKNESS_KNEE:80,OVR_WEAKNESS_COEF:0.5,OVR_BREADTH_FLOOR:70,OVR_BREADTH_COEF:6,
OVR_GATE_99_MEAN:98,OVR_GATE_99_MINCORE:94,OVR_GATE_95_MEAN:93,OVR_GATE_95_MINCORE:88,
CONTRACT_MIN_WEEKS:52,CONTRACT_MAX_WEEKS:208,CONTRACT_ANNUAL_MULT:3.0,
CONTRACT_LENGTH_FACTOR:{52:1.08,104:1.0,156:0.95,208:0.9},CONTRACT_AGE_PRIME:34,
CONTRACT_AGE_FACTOR_MIN:0.85,CONTRACT_AGE_SPREAD:22,CONTRACT_SCARCITY_JITTER:0.08,
CONTRACT_SIGNING_BONUS_FRACTION:0.18,MARKET_PREMIUM_TIERS:[1.0,1.05,1.1,1.15,1.2,1.25]};
const ROLE_TO_DISCIPLINE={writer:'writing',director:'directing',actor:'acting',craft:'craft'};
const SKILL_ORDER={acting:['actingTechnique','emotionalRange','dialogueDelivery','comicTiming','physicalPerformance','screenPresence'],writing:['storyStructure','characterDevelopment','dialogue','originality','narrativePacing','rewriting'],directing:['visualStorytelling','performanceDirection','toneControl','directingPacing','productionManagement','adaptability'],craft:['cinematography','editing','productionDesign','soundAndMusic','effectsExecution','technicalCoordination']};
const OVR_WEIGHTS={acting:[0.18,0.2,0.16,0.1,0.14,0.22],writing:[0.2,0.2,0.16,0.14,0.17,0.13],directing:[0.2,0.2,0.18,0.14,0.15,0.13],craft:[0.17,0.17,0.17,0.17,0.16,0.16]};
"""
base=(B/'verify-pricing-core.mjs').read_text();clamp=extract((H/'src/core/math.ts').read_text(),'clamp')[2].replace('export function','function').replace(': number','')
age=extract((H/'src/core/employment.ts').read_text(),'ageFactor')[2].replace(': number','')
curve=extract((H/'src/core/worldgen.ts').read_text(),'salaryCurve')[2].replace('export function','function').replace(': Talent','').replace(': number','')
curve=curve.replace("  if (talent.role === 'scientist') return SCIENTIST_ANNUAL_SALARY / TUNING.CONTRACT_ANNUAL_MULT\n",'')
compare=base[base.index('function pairRows'):base.index('export function verifyPricing')]
# Every used constant/table source range is arm-identical; additional original math iround evidence.
for lo,hi in [(73,75),(205,212),(376,389),(406,406),(2027,2062),(2091,2097),(2160,2172)]:
 assert (H/'src/core/tuning.ts').read_text().splitlines()[lo-1:hi]==(A/'src/core/tuning.ts').read_text().splitlines()[lo-1:hi]
for file,name in [('employment.ts','ageFactor'),('worldgen.ts','salaryCurve'),('math.ts','clamp')]:
 assert extract((H/'src/core'/file).read_text(),name)[2]==extract((A/'src/core'/file).read_text(),name)[2]
mathsrc=(H/'src/core/employment.ts').read_text();roundline=next(x for x in mathsrc.splitlines() if 'iround' in x and 'Math.round' in x)
assert roundline in (A/'src/core/employment.ts').read_text();assert roundline in (H/'src/core/talentMarket.ts').read_text();put('ROUND-SOURCE.txt',roundline+'\n')
put('PRIMITIVE-ERASURE.json',{'typeOnlyReplacements':transforms,'scientistBranchOmission':'Selected creative roles checked before pricing; scientist unsupported and refused.','rngSubstitution':'Original fresh-stream expression replaced only by independently admitted firstDraw; no RNG import/call.','premiumOrder':'rounded base annual -> rounded annual*premium -> rounded finalannual*0.18; base signing bonus still evaluated before premium','nullFloor':'Admitted source proof gates exact selected precommit null; studioOffer returns original offer without new arithmetic.','ovrFunctionsIdenticalAcrossArms':True})
core="import assert from 'node:assert/strict';\n"+const+clamp+'\nconst iround=(x)=>Math.round(x);\n'+'\n'.join(ovr)+'\n'+age+'\n'+curve+'\n'+compare
core+='''function price(person, firstDraw, tierIndex) {
  const term=clamp(208,TUNING.CONTRACT_MIN_WEEKS,TUNING.CONTRACT_MAX_WEEKS);
  const lengthFactor=TUNING.CONTRACT_LENGTH_FACTOR[term] ?? 1.0;
  const jitter=1+(firstDraw*2-1)*TUNING.CONTRACT_SCARCITY_JITTER;
  const annual=iround(salaryCurve(person)*TUNING.CONTRACT_ANNUAL_MULT*lengthFactor*ageFactor(person.age)*jitter);
  const baseSigningBonus=iround(annual*TUNING.CONTRACT_SIGNING_BONUS_FRACTION);
  // Admitted null precommit floor: studioOffer returns offer unchanged.
  const annualSalary=iround(annual*TUNING.MARKET_PREMIUM_TIERS[tierIndex]);
  const signingBonus=iround(annualSalary*TUNING.CONTRACT_SIGNING_BONUS_FRACTION);
  for(const n of [annual,baseSigningBonus,annualSalary,signingBonus]) assert.ok(Number.isSafeInteger(n),'SAFE_PAY');
  return {talentId:person.id,annualSalary,signingBonus,termWeeks:term,startWeek:208,endWeekExclusive:208+term};
}
function validatePerson(p,talentId,role) {
  assert.deepEqual(Object.keys(p).sort(),['age','fame','id','role','skills']);
  assert.equal(p.id,talentId);assert.equal(p.role,role);assert.ok(Object.hasOwn(ROLE_TO_DISCIPLINE,role),'CREATIVE_ROLE');
  assert.ok(Number.isFinite(p.age)&&p.age>=0&&p.age<200,'AGE');assert.ok(Number.isFinite(p.fame)&&p.fame>=0&&p.fame<=100,'FAME');
  const d=ROLE_TO_DISCIPLINE[role];assert.deepEqual(Object.keys(p.skills),[d]);assert.deepEqual(Object.keys(p.skills[d]),SKILL_ORDER[d]);
  for(const key of SKILL_ORDER[d]) {assert.deepEqual(Object.keys(p.skills[d][key]),['perceived']);const n=p.skills[d][key].perceived;assert.ok(Number.isFinite(n)&&n>=0&&n<=100,'PERCEIVED_SKILL');}
}
export function verifyPricing(inputs, snapshot, HRaw, ARaw) {
  assert.equal(inputs.schema,'1370-renewal208-pure16-pricing-inputs-r1');assert.equal(inputs.rows.length,16);
  assert.equal(snapshot.schema,'1370-a208-selected16-snapshot-r1');assert.equal(snapshot.phase,'after-natural-tick208-return');assert.equal(snapshot.week,208);assert.equal(snapshot.seed,'p13a-core-causal-01');
  assert.equal(snapshot.pricingHelpersCalled,0);assert.equal(snapshot.extraRngCalls,0);assert.equal(snapshot.premiumAttribution,false);assert.equal(snapshot.floorAttribution,false);assert.equal(snapshot.rows.length,16);
  const H=pairRows(HRaw),A=pairRows(ARaw);
  for(const h of H.rows) {const a=A.index.get(h.key);assert.ok(a,'MISSING_PAIR');assert.equal(a.order,h.order,'FULL_ORDER');assert.deepEqual(stripPay(a.row),stripPay(h.row),'ALL44_NONPAY');}
  assert.equal(H.index.size,A.index.size);
  const seen=new Set();
  // Validate every identity, vector, source phase and observed context before evaluating any prices.
  for(let i=0;i<16;i++) {
    const x=inputs.rows[i],y=snapshot.rows[i],key=JSON.stringify(x.identity),h=H.index.get(key),a=A.index.get(key);
    assert.ok(!seen.has(key),'DUPLICATE_SELECTED');seen.add(key);assert.ok(h&&a);
    assert.equal(x.HSourceOrder,24+i);assert.equal(x.ASourceOrder,24+i);assert.equal(h.order,x.HSourceOrder);assert.equal(a.order,x.ASourceOrder);
    assert.deepEqual(y.identity,x.identity);assert.equal(y.sourceOrder,x.ASourceOrder);assert.equal(x.releaseFloor,null);assert.ok([1,2].includes(x.premiumTierIndex));
    validatePerson(x.HPerson,x.talentId,x.creativeRole);validatePerson(y.person,x.talentId,x.creativeRole);
    assert.ok(Number.isFinite(x.firstDraw)&&x.firstDraw>=0&&x.firstDraw<1);assert.equal(x.jitter,1+(x.firstDraw*2-1)*0.08);
    assert.equal(x.key,`offer-${x.talentId}`);assert.equal(x.seed,snapshot.seed);assert.equal(x.purpose,'hiring');
    assert.equal(y.currentProposalCount,0);assert.equal(y.business.studioId,x.winningStudioId);assert.equal(y.business.policy.reserveWeeks,x.reserveWeeks);
    assert.equal(y.case.row.talentId,x.talentId);assert.equal(y.case.row.subjectStudioId,x.subjectStudioId);assert.equal(y.case.row.contractId,x.AOriginalContract.contractId);assert.equal(y.case.row.openedWeek,196);assert.equal(y.case.row.closedWeek,208);assert.equal(y.case.row.outcome,'settled');
    assert.equal(y.winnerReceipt.row.talentId,x.talentId);assert.equal(y.winnerReceipt.row.studioId,x.winningStudioId);assert.equal(y.winnerReceipt.row.week,208);assert.equal(y.winnerReceipt.row.kind,'settled');
    assert.deepEqual(y.oldEmployment.row,x.AOriginalContract);assert.equal(y.oldEmployment.sourceOrder,A.index.get(JSON.stringify([x.AOriginalContract.contractId,0])).order);
    assert.equal(y.currentEmployment.sourceOrder,a.order);assert.deepEqual(stripPay(y.currentEmployment.row),stripPay({...a.row,endedWeek:null}));assert.deepEqual(y.currentEmployment.row.terms,a.row.terms);
    for(const row of [h.row,a.row]) {assert.equal(row.studioId,x.winningStudioId);assert.equal(row.terms.talentId,x.talentId);assert.equal(row.terms.startWeek,208);assert.equal(row.terms.termWeeks,208);assert.equal(row.terms.endWeekExclusive,416);assert.ok(Number.isSafeInteger(row.terms.annualSalary)&&Number.isSafeInteger(row.terms.signingBonus));}
  }
  const ledger=inputs.rows.map((x,i)=>{
    const h=H.index.get(JSON.stringify(x.identity)),a=A.index.get(JSON.stringify(x.identity));
    const HPredicted=price(x.HPerson,x.firstDraw,x.premiumTierIndex),APredicted=price(snapshot.rows[i].person,x.firstDraw,x.premiumTierIndex);
    let completeH=true,completeA=true;try{assert.deepEqual({...h.row,terms:{...h.row.terms,...HPredicted}},h.row);}catch{completeH=false;}
    try{assert.deepEqual({...a.row,terms:{...a.row.terms,...APredicted}},a.row);}catch{completeA=false;}
    return {identity:x.identity,sourceOrder:h.order,talentId:x.talentId,firstDraw:x.firstDraw,jitter:x.jitter,premiumTierIndex:x.premiumTierIndex,releaseFloor:null,HActual:h.row.terms,HPredicted,AActual:a.row.terms,APredicted,completeH,completeA,conclusion:completeH&&completeA?'PAIR_AGREES_VIA_ADMITTED_SOURCE_TRANSPORT':'UNRESOLVED_PRICING_DISCREPANCY'};
  });
  const mismatches=ledger.filter(x=>!x.completeH||!x.completeA).length;
  return {status:mismatches?'STOP_RENEWAL208_PRICING_DISCREPANCY':'PURE_RENEWAL208_PRICING_PAIRS_AGREE',selectedRows:16,immutablePairs:44,mismatches,ledger,originalOfferLocalCapture:false,renewalCauseAdmission:false,game:false};
}
export function renderLedger(report) {
  assert.equal(report.ledger.length,16);const raw=JSON.stringify(report)+'\\n';assert.ok(Buffer.byteLength(raw)<=65536,'LEDGER_CAP');return raw;
}
'''
put('verify-pricing-core.mjs',core)
facts=json.loads((G/'FACTS.json').read_text());selected=json.loads((F/'SELECTED16.json').read_text());new=json.loads((S/'1370-c0-renewal208-r03-2-first-draw-after-aj-witness-output-20261009-r1/stdout.bin').read_text())['rows'][0]
rows=[]
for x,y in zip(facts['remainingRenewalRows'],selected):
 assert x['identity']==y['identity'];person=x['H208Person'];disc={'writer':'writing','director':'directing','actor':'acting','craft':'craft'}[person['role']]
 # Preserve source insertion order of the six skill keys, not JSON sorted order.
 table=re.search(r'  '+disc+r': \[(.*?)\]',(H/'src/core/tuning.ts').read_text()[ (H/'src/core/tuning.ts').read_text().index('export const SKILL_ORDER') :],re.S).group(1);keys=re.findall(r"'([^']+)'",table)
 hp={'id':person['id'],'role':person['role'],'age':person['age'],'fame':person['fame'],'skills':{disc:{k:{'perceived':person['skills'][disc][k]['perceived']} for k in keys}}}
 draw=x['jitterRole'].get('acceptedWitnessRow') or new;assert draw['talentId']==x['talentId']
 rows.append({'identity':x['identity'],'HSourceOrder':x['HSourceOrder'],'ASourceOrder':x['ASourceOrder'],'talentId':x['talentId'],'creativeRole':x['creativeRole'],'HPerson':hp,'HContextRawLineSha256':x['HContextRawLineSha256'],'firstDraw':draw['firstDraw'],'jitter':draw['jitter'],'seed':draw['seed'],'purpose':draw['purpose'],'key':draw['key'],'drawOriginIdentity':draw['identity'],'premiumTierIndex':int(y['commonSourceDerivedPremiumExpression'][6]),'releaseFloor':None,'subjectStudioId':y['subjectStudioId'],'winningStudioId':y['winningStudioId'],'reserveWeeks':y['HObservedWinningReserveWeeks'],'AOriginalContract':y['AOriginalContract']})
# Preserve order for six-vector extraction; JSON sort_keys disabled for input file.
(P/'PRICING-INPUTS.json').write_text(json.dumps({'schema':'1370-renewal208-pure16-pricing-inputs-r1','rows':rows},indent=2)+'\n')
put('A208-INPUT-CONTRACT.json',{'schema':'1370-a208-selected16-snapshot-r1','phase':'after-natural-tick208-return','week':208,'seed':'p13a-core-causal-01','rows':16,'sourceOrders':list(range(24,40)),'observerSchemaAgreement':'Exact direct message from c0: person id/role/age/fame and primary six perceived skills in SKILL_ORDER; old/current employment, case, winnerReceipt, business, currentProposalCount, terminationReceipts. Frozen payload 65536 bytes.','futureObservedRole':None,'futureObservedIndependentReceipt':None,'historicalOfferLocalCapture':False})
# No arithmetic is evaluated by preparation: only source and admitted data projections.
external={**sources,'gapFacts':role(G/'FACTS.json'),'gapReceipt':role(G/'RECEIPT.json'),'premiumSelected':role(F/'SELECTED16.json'),'premiumSourceMap':role(F/'SOURCE-MAP.json'),'premiumReview':role(S/'1370-c0-renewal208-premium-floor-independent-review-after-aj-20261009-r2/RECEIPT.json'),'premiumSupplement':role(S/'1370-c0-renewal208-premium-floor-independent-review-after-aj-20261009-r2/COMPLETE-TYPED-FUNCTION-SUPPLEMENT.txt'),'premiumAdoption':role(S/'1370-c0-renewal208-premium-floor-parent-adoption-after-aj-20261009-r1/ADOPTION.json'),'existingNumericReview':facts['roles']['numericObservedReview'],'existingNumericStdout':facts['roles']['numericStdout'],'newNumericReview':role(S/'1370-c0-renewal208-r03-2-first-draw-witness-independent-observed-review-after-aj-20261009-r1/RECEIPT.json'),'newNumericStdout':role(S/'1370-c0-renewal208-r03-2-first-draw-after-aj-witness-output-20261009-r1/stdout.bin'),'newNumericAdoption':role(N/'WITNESS-ADOPTION.json'),'HPreimage':facts['roles']['HEmployment'],'APreimage':facts['roles']['AEmployment'],'initialCore':role(B/'verify-pricing-core.mjs'),'initialRecorder':role(B/'record-pure-node.py'),'qualifiedFailureRecorderReview':role(S/'1370-c0-b109-recorder-failure-capture-observed-independent-review-20261009-r4/RECEIPT.json')}
for name in ['H_context','H_diagnostic','H_result','phaseProof','phaseReview','phaseRootAdoption']:
 external[name]=facts['roles'][name]
for x in external.values():assert role(Path(x['path']))==x
# Require prospective observed payload packet before any Node pricing-module import.
entry="""import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {authenticateConfig} from './authenticate-inputs.mjs';
const {config,readRole}=authenticateConfig();
const parse=n=>JSON.parse(readRole(n));
const packet=config.futureA208;
const accepted=parse('A208IndependentReceipt');
assert.ok(accepted.decision.startsWith('ACCEPT_OBSERVED'),'A208_ACCEPTED_OBSERVED');
for(const [field,name] of [['sourcePinsSha256','A208SourcePins'],['configSha256','A208Config'],['resultSha256','A208Result'],['stdoutSha256','A208Stdout'],['snapshotSha256','A208Snapshot']]) {
 assert.equal(packet[field],config.roles[name].sha256,'FILLED_PACKET_HASH');assert.equal(accepted[field],packet[field],'OBSERVED_EXACT_ROLE');
}
assert.equal(packet.reviewSha256,config.roles.A208IndependentReceipt.sha256);
const stdout=parse('A208Stdout'),payload=readRole('A208Snapshot');
assert.ok(payload.length<=65536,'SNAPSHOT_CAP');assert.equal(stdout.settlement208Rows,16);assert.equal(stdout.settlement208Bytes,payload.length);
assert.equal(stdout.settlement208Sha256,crypto.createHash('sha256').update(payload).digest('hex'));
assert.equal(stdout.settlement208Base64,payload.toString('base64'),'EXACT_FROZEN_FRAME');
const result=parse('A208Result');assert.equal(result.actualChildExit,0);assert.equal(result.groupClear,true);assert.equal(result.timedOut,false);
const {verifyPricing,renderLedger}=await import('./verify-pricing-core.mjs');
const report=verifyPricing(parse('pricingInputs'),JSON.parse(payload),parse('HPreimage'),parse('APreimage'));
fs.writeSync(1,renderLedger(report));if(report.mismatches)process.exitCode=2;
"""
put('verify-renewal-pricing.mjs',entry)
auth=(B/'authenticate-inputs.mjs').read_text().replace("assert.ok(config.futureWitness && typeof config.futureWitness === 'object', 'WITNESS_UNFILLED');","assert.ok(config.futureA208 && typeof config.futureA208 === 'object', 'A208_UNFILLED');\n  for(const name of ['A208SourcePins','A208Config','A208Result','A208Stdout','A208Snapshot','A208IndependentReceipt']) assert.ok(config.roles[name], 'A208_ROLE_UNFILLED');")
put('authenticate-inputs.mjs',auth)
config=json.loads((B/'CONFIG-UNFILLED.json').read_text());config.update({'schema':'1370-renewal208-pure16-pricing-config-r1','selectedRows':16,'futureA208':None,'productionHeadAtPreparation':'f0fb818fe7534c3e3784206d16728b015c7f059a','renewalPricingCauseAdmission':False})
for n in ['futureWitness','renewalsExcludedFromPricing']:config.pop(n,None)
config['roles']={**external,**{key:role(P/name) for key,name in [('core','verify-pricing-core.mjs'),('verification','verify-renewal-pricing.mjs'),('authenticate','authenticate-inputs.mjs'),('pricingInputs','PRICING-INPUTS.json'),('sourceMap','SOURCE-MAP.json'),('sourceSlices','SOURCE-SLICES.txt'),('primitiveErasure','PRIMITIVE-ERASURE.json'),('inputContract','A208-INPUT-CONTRACT.json')]}}
put('CONFIG.json',config);csha=role(P/'CONFIG.json')['sha256']
raw=(B/'record-pure-node.py').read_text();changes=[('0e78eda5ad73702635054003d49560f77545c16e2fe5abef297ad456a5498168',csha),('1370-c0-initial23-pricing-','1370-c0-renewal208-pure16-pricing-'),("require(isinstance(config.get('futureWitness'),dict),'WITNESS_UNFILLED')","require(isinstance(config.get('futureA208'),dict),'A208_UNFILLED');require(all(config['roles'].get(n) for n in ['A208SourcePins','A208Config','A208Result','A208Stdout','A208Snapshot','A208IndependentReceipt']),'A208_ROLES_UNFILLED')"),('PURE_INITIAL23_PRICING_','PURE_RENEWAL208_PURE16_PRICING_')]
rec=raw
for x,y in changes:assert x in rec;rec=rec.replace(x,y)
put('record-pure-node.py',rec);put('RECORDER-REUSE.diff',''.join(difflib.unified_diff(raw.splitlines(True),rec.splitlines(True),fromfile='initial23/record-pure-node.py',tofile='renewal208/record-pure-node.py')))
put('RECORDER-REUSE.json',{'baseline':role(B/'record-pure-node.py'),'candidate':role(P/'record-pure-node.py'),'changes':changes,'qualifiedFailurePreservation':external['qualifiedFailureRecorderReview'],'unchanged':'60/75/90 clocks; owned fork/READY/GO; finite streams; sticky failure/override preservation. A208 check remains before output mkdir and fork.','execution':False})
recipe=json.loads((B/'RECIPE.json').read_text());recipe['argv']=[v.replace('1370-c0-initial23-pricing-','1370-c0-renewal208-pure16-pricing-').replace(str(B),str(P)) for v in recipe['argv']];recipe['cwd']=str(P);recipe['observedAcceptance']='Independent source and exact filled input-packet review, root operational grant, actual tool/helper/recorder/Node0 and fresh owned-group clearance;16 paypairs/44 nonpaypairs. Discrepancy retained STOP; no auto-retry or cause admission.';recipe['unlaunchableUntil']='futureA208 null: no fork/output until separately reviewed observed packet fills all six exact roles and separately reviewed new CONFIG/recorder hashes; actual current operational guards and root grant still required.';put('RECIPE.json',recipe)
put('FILL-REQUIREMENTS.json',{'futureA208':None,'rolesMissing':['A208SourcePins','A208Config','A208Result','A208Stdout','A208Snapshot','A208IndependentReceipt'],'packetFields':['sourcePinsSha256','configSha256','resultSha256','stdoutSha256','snapshotSha256','reviewSha256'],'reviewInterface':'Observed A208 receipt must expose these exact five payload/launch hashes; c0 frame uses settlement208Rows/Bytes/Sha256/Base64. Any schema discrepancy requires fresh separately reviewed source adaptation, not guessed fill.','freshFilledPackageIndependentReviewRequired':True,'currentOperationalGuards':None,'rootExecutionGrant':None,'numericEvaluation':False})
put('REPORT.md','''Source-only, after AJ. Pure16 verifier preparation; no numeric prices evaluated, source imported, Node/tests/game run, or protected files changed.

Each H208 person is projected from the accepted exact context into id/role/age/fame and primary perceived skills. Fifteen already admitted keyed draws and the independently observed r03-2 draw are reused by talent/key, preserving their original draw identity without relabeling as a historical renewal observation. The selected renewal identity/occurrence/source order remains separate. Admitted symbolic tiers[1]/tiers[2] and null precommit floors are mapped from the independently reviewed source proof.

OVR helpers are mechanically type-erased; weighted mean, weakness RMS, breadth penalty, minCore, elite gates, floor/clamp and salaryCurve multiplication preserve original order. Contract base annual is rounded, base bonus computed, null floor returns unchanged, premium annual rounded, final bonus rounded. Scientist is explicitly outside selected creative roles. Original H/A finite function and constant slices with blob/source mappings are retained. Initial pairRows/stripPay comparator text is reused exactly; all44 nonpay fields/order and16 complete predicted terms are compared.

A208 schema is agreed with c0, but its observed payload and review remain null. Both recorder and authenticator refuse before output/fork/pricing import. A future independent review must approve exact fill and the observer review interface; there is no execution authority. Output capped65536; recorder retains qualified60/75/90 bounds and failure preservation. Agreement is numeric source-transport evidence only, never automatic renewal cause closure.
''')
files={n:role(p) for p in P.iterdir() if p.is_file() and (n:=p.name) not in ['SOURCE-PINS.json','RECEIPT.json']}
put('SOURCE-PINS.json',{'schema':'1370-renewal208-pure16-pricing-source-pins-r1','status':'READY_SOURCE_ONLY_HELD_A208_UNFILLED','files':files,'externalRoles':external,'futureA208':None,'executionAuthorization':False,'sourceExecution':False,'numericPricesEvaluated':False,'renewalPricingCausesClosed':0})
put('RECEIPT.json',{'schema':'1370-renewal208-pure16-pricing-preparation/v1','decision':'READY_SOURCE_ONLY_HELD_RENEWAL208_PURE16_PRICING_PENDING_INDEPENDENT_REVIEW','sourcePins':role(P/'SOURCE-PINS.json'),'sourcePinsSha256':role(P/'SOURCE-PINS.json')['sha256'],'config':role(P/'CONFIG.json'),'core':role(P/'verify-pricing-core.mjs'),'recorder':role(P/'record-pure-node.py'),'futureA208':None,'sourceExecution':False,'numericPricesEvaluated':False,'executionAuthorization':False,'renewalPricingCausesClosed':0,'afterAJScope':True})
print(json.dumps({'receipt':role(P/'RECEIPT.json'),'pins':role(P/'SOURCE-PINS.json')}))
