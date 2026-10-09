import assert from 'node:assert/strict';
const TUNING={SALARY_BASE:25000,SALARY_SKILL_COEF:150000,SALARY_FAME_COEF:600000,
OVR_WEAKNESS_KNEE:80,OVR_WEAKNESS_COEF:0.5,OVR_BREADTH_FLOOR:70,OVR_BREADTH_COEF:6,
OVR_GATE_99_MEAN:98,OVR_GATE_99_MINCORE:94,OVR_GATE_95_MEAN:93,OVR_GATE_95_MINCORE:88,
CONTRACT_MIN_WEEKS:52,CONTRACT_MAX_WEEKS:208,CONTRACT_ANNUAL_MULT:3.0,
CONTRACT_LENGTH_FACTOR:{52:1.08,104:1.0,156:0.95,208:0.9},CONTRACT_AGE_PRIME:34,
CONTRACT_AGE_FACTOR_MIN:0.85,CONTRACT_AGE_SPREAD:22,CONTRACT_SCARCITY_JITTER:0.08,
CONTRACT_SIGNING_BONUS_FRACTION:0.18,MARKET_PREMIUM_TIERS:[1.0,1.05,1.1,1.15,1.2,1.25]};
const ROLE_TO_DISCIPLINE={writer:'writing',director:'directing',actor:'acting',craft:'craft'};
const SKILL_ORDER={acting:['actingTechnique','emotionalRange','dialogueDelivery','comicTiming','physicalPerformance','screenPresence'],writing:['storyStructure','characterDevelopment','dialogue','originality','narrativePacing','rewriting'],directing:['visualStorytelling','performanceDirection','toneControl','directingPacing','productionManagement','adaptability'],craft:['cinematography','editing','productionDesign','soundAndMusic','effectsExecution','technicalCoordination']};
const OVR_WEIGHTS={acting:[0.18,0.2,0.16,0.1,0.14,0.22],writing:[0.2,0.2,0.16,0.14,0.17,0.13],directing:[0.2,0.2,0.18,0.14,0.15,0.13],craft:[0.17,0.17,0.17,0.17,0.16,0.16]};
function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v
}
const iround=(x)=>Math.round(x);
function skillVector(talent, discipline, use) {
  const keys = SKILL_ORDER[discipline]
  const profile = talent.skills[discipline]
  const out = new Array(keys.length)
  for (let i = 0; i < keys.length; i++) {
    out[i] = profile[keys[i]][use]
  }
  return out
}
function applyGates(x, weightedMeanVal, minCore) {
  let gate
  if (weightedMeanVal >= TUNING.OVR_GATE_99_MEAN && minCore >= TUNING.OVR_GATE_99_MINCORE) {
    gate = 99
  } else if (weightedMeanVal >= TUNING.OVR_GATE_95_MEAN && minCore >= TUNING.OVR_GATE_95_MINCORE) {
    gate = 95
  } else {
    gate = 94 // hard cap below the elite gate
  }
  return Math.min(x, gate)
}
function ovrCore(skills, discipline) {
  const w = OVR_WEIGHTS[discipline]

  let weightedMeanVal = 0
  for (let i = 0; i < skills.length; i++) weightedMeanVal += w[i] * skills[i]

  // Weakness penalty — core-weighted RMS of deficits below the "no-weak-spot" line.
  let deficitSq = 0
  for (let i = 0; i < skills.length; i++) {
    const deficit = Math.max(0, TUNING.OVR_WEAKNESS_KNEE - skills[i])
    deficitSq += w[i] * deficit * deficit
  }
  const weaknessPen = TUNING.OVR_WEAKNESS_COEF * Math.sqrt(deficitSq)

  // Breadth requirement — reward covering all six (core-weighted fraction ≥ floor).
  let breadth = 0
  for (let i = 0; i < skills.length; i++) {
    if (skills[i] >= TUNING.OVR_BREADTH_FLOOR) breadth += w[i]
  }
  const breadthPen = TUNING.OVR_BREADTH_COEF * (1 - breadth)

  const raw = weightedMeanVal - weaknessPen - breadthPen

  let minCore = Infinity
  for (const s of skills) if (s < minCore) minCore = s

  return clamp(Math.floor(applyGates(raw, weightedMeanVal, minCore)), 1, 99)
}
function roleOVR(talent, discipline) {
  return ovrCore(skillVector(talent, discipline, 'perceived'), discipline)
}
function ageFactor(age) {
  const d = (age - TUNING.CONTRACT_AGE_PRIME) / TUNING.CONTRACT_AGE_SPREAD
  const bell = Math.max(0, 1 - d * d)
  return TUNING.CONTRACT_AGE_FACTOR_MIN + (1 - TUNING.CONTRACT_AGE_FACTOR_MIN) * bell
}
function salaryCurve(talent) {
  const primaryDiscipline = ROLE_TO_DISCIPLINE[talent.role]
  const primaryOVR = roleOVR(talent, primaryDiscipline)
  const s = primaryOVR / 100
  const f = talent.fame / 100
  return TUNING.SALARY_BASE + TUNING.SALARY_SKILL_COEF * s * s + TUNING.SALARY_FAME_COEF * f * f
}
function pairRows(raw) {
  assert.ok(Array.isArray(raw) && raw.length === 44, 'EXACT44_PREIMAGE');
  const counts = new Map(), index = new Map();
  const rows = raw.map((row, order) => {
    assert.ok(row && typeof row.contractId === 'string' && row.contractId.length <= 200, 'CONTRACT_ID');
    assert.ok(row.terms && typeof row.terms === 'object', 'TERMS');
    const occurrence = counts.get(row.contractId) ?? 0; counts.set(row.contractId, occurrence+1);
    const key = JSON.stringify([row.contractId,occurrence]); assert.ok(!index.has(key),'DUPLICATE_IDENTITY');
    const entry = {row,order,key,identity:[row.contractId,occurrence]}; index.set(key,entry); return entry;
  });
  return {rows,index};
}
function stripPay(row) {
  const {annualSalary,signingBonus,...terms} = row.terms;
  return {...row,terms};
}
function price(person, firstDraw, tierIndex) {
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
  assert.equal(report.ledger.length,16);const raw=JSON.stringify(report)+'\n';assert.ok(Buffer.byteLength(raw)<=65536,'LEDGER_CAP');return raw;
}
