import assert from 'node:assert/strict';
const TUNING = { CONTRACT_MIN_WEEKS:52, CONTRACT_MAX_WEEKS:208,
  CONTRACT_ANNUAL_MULT:3.0, CONTRACT_LENGTH_FACTOR:{52:1.08,104:1.0,156:0.95,208:0.9},
  CONTRACT_AGE_PRIME:34, CONTRACT_AGE_FACTOR_MIN:0.85, CONTRACT_AGE_SPREAD:22,
  CONTRACT_SCARCITY_JITTER:0.08, CONTRACT_SIGNING_BONUS_FRACTION:0.18 };
// Type-only erasures of authenticated original primitives. Standard unmodified native builtins assumed.
function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v
}
const iround = (x) => Math.round(x)
function ageFactor(age) {
  const d = (age - TUNING.CONTRACT_AGE_PRIME) / TUNING.CONTRACT_AGE_SPREAD
  const bell = Math.max(0, 1 - d * d)
  return TUNING.CONTRACT_AGE_FACTOR_MIN + (1 - TUNING.CONTRACT_AGE_FACTOR_MIN) * bell
}

function price(salaryCurveValue, age, firstDraw, termWeeks, week) {
  const term = clamp(termWeeks, TUNING.CONTRACT_MIN_WEEKS, TUNING.CONTRACT_MAX_WEEKS)
  const lengthFactor = TUNING.CONTRACT_LENGTH_FACTOR[term] ?? 1.0
  const jitter = 1 + (firstDraw * 2 - 1) * TUNING.CONTRACT_SCARCITY_JITTER
  const annual = iround(
    salaryCurveValue * TUNING.CONTRACT_ANNUAL_MULT * lengthFactor * ageFactor(age) * jitter,
  )
  const signingBonus = iround(annual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
  assert.ok(Number.isSafeInteger(annual) && Number.isSafeInteger(signingBonus), 'FINITE_SAFE_PAY');
  return {annualSalary:annual,signingBonus,termWeeks:term,startWeek:week,endWeekExclusive:week+term};
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
export function verifyPricing(inputs, witness, HRaw, ARaw) {
  assert.equal(inputs.schema,'1370-initial23-transported-pricing-inputs-r1');
  assert.equal(inputs.originalOfferLocalCapture,false); assert.equal(inputs.renewalsExcluded,16);
  assert.ok(Array.isArray(inputs.rows) && inputs.rows.length===23,'PRICING_INPUT23');
  assert.equal(witness.status,'PURE_INITIAL23_FIRST_DRAWS_COMPLETE');
  assert.equal(witness.rngSourceSha256,inputs.drawRequest.rngSourceSha256);
  assert.equal(witness.salaryAttribution,false); assert.equal(witness.renewalAttribution,false);
  assert.ok(Array.isArray(witness.rows) && witness.rows.length===23,'WITNESS23');
  const H=pairRows(HRaw), A=pairRows(ARaw);
  // All44 are paired by contractId+source-occurrence; original order is a separate guard.
  for(const h of H.rows) {
    const a=A.index.get(h.key); assert.ok(a,'MISSING_A_PAIR'); assert.equal(a.order,h.order,'FULL_SOURCE_ORDER');
    assert.deepEqual(stripPay(a.row),stripPay(h.row),'FULL44_IMMUTABLE_FIELDS');
  }
  assert.equal(H.index.size,A.index.size,'PAIRED_IDENTITIES');
  const seen=new Set(), ledger=[];
  for(let i=0;i<23;i++) {
    const input=inputs.rows[i], observed=witness.rows[i], expected=inputs.drawRequest.rows[i];
    const {firstDraw,jitter,...drawInput}=observed;
    assert.deepEqual(drawInput,expected,'DRAW_SOURCE_IDENTITY_ORDER');
    assert.ok(Number.isFinite(firstDraw) && firstDraw>=0 && firstDraw<1,'FINITE_FIRST_DRAW');
    assert.ok(Number.isFinite(jitter) && jitter===1+(firstDraw*2-1)*0.08,'EXACT_FINITE_JITTER');
    assert.deepEqual(input.identity,expected.identity,'PRICING_IDENTITY');
    assert.equal(input.HSourceOrder,expected.ordinal,'H_INPUT_ORDER'); assert.equal(input.ASourceOrder,expected.ordinal,'A_INPUT_ORDER');
    assert.equal(input.talentId,expected.talentId); assert.ok(['writer','director','actor','craft'].includes(input.creativeRole),'CREATIVE_ONLY');
    assert.equal(input.week,0); assert.equal(input.termWeeks,208);
    const key=JSON.stringify(input.identity); assert.ok(!seen.has(key),'DUPLICATE_SELECTED_IDENTITY'); seen.add(key);
    const h=H.index.get(key),a=A.index.get(key); assert.ok(h && a,'MISSING_SELECTED_PAIR');
    assert.equal(h.order,input.HSourceOrder); assert.equal(a.order,input.ASourceOrder);
    const curve=input.generationSalaryCurve.value, HAge=input.HAuthoredInitialAge.value, AAge=input.ADerivedInitialAge.value;
    assert.ok(Number.isFinite(curve) && curve>0 && curve<1e9,'FINITE_TRANSPORTED_CURVE');
    assert.ok(Number.isFinite(HAge) && HAge>=28 && HAge<200 && AAge===Math.floor(HAge),'EXACT_INITIAL_AGE_FLOOR');
    for(const row of [h.row,a.row]) {
      assert.equal(row.terms.talentId,input.talentId);assert.equal(row.terms.startWeek,0);assert.equal(row.terms.termWeeks,208);assert.equal(row.terms.endWeekExclusive,208);
      assert.ok(Number.isSafeInteger(row.terms.annualSalary) && Number.isSafeInteger(row.terms.signingBonus),'ACTUAL_SAFE_PAY');
    }
    const HPred=price(curve,HAge,firstDraw,208,0), APred=price(curve,AAge,firstDraw,208,0);
    // Replace only the two predicted pay fields in the actual full row and compare every field.
    const HPriced={...h.row,terms:{...h.row.terms,...HPred}};
    const APriced={...a.row,terms:{...a.row.terms,...APred}};
    let completeH=true,completeA=true;
    try {assert.deepEqual(HPriced,h.row);} catch {completeH=false;}
    try {assert.deepEqual(APriced,a.row);} catch {completeA=false;}
    const differences=[];
    for(const arm of [['H',HPred,h.row.terms],['A',APred,a.row.terms]])
      for(const field of ['annualSalary','signingBonus']) if(arm[1][field]!==arm[2][field]) differences.push({arm:arm[0],field,predicted:arm[1][field],actual:arm[2][field]});
    ledger.push({identity:input.identity,sourceOrder:h.order,talentId:input.talentId,role:input.creativeRole,
      generationSalaryCurve:curve,HInitialAge:HAge,AInitialAge:AAge,firstDraw,jitter,
      HActual:h.row.terms,HPredicted:HPred,AActual:a.row.terms,APredicted:APred,
      completeH,completeA,differences,
      conclusion:completeH && completeA ? 'PAIR_AGREES_VIA_ACCEPTED_SOURCE_TRANSPORT' : 'UNRESOLVED_PRICING_DISCREPANCY'});
  }
  assert.equal(ledger[0].firstDraw,0.34857689985074103,'ROW0_DRAW_CONTROL');
  assert.equal(ledger[0].jitter,0.9757723039761186,'ROW0_JITTER_CONTROL');
  const mismatches=ledger.filter(x=>!x.completeH || !x.completeA).length;
  return {status:mismatches ? 'STOP_INITIAL23_PRICING_DISCREPANCY' : 'PURE_INITIAL23_PRICING_PAIRS_AGREE',
    selectedRows:23,immutablePairs:44,mismatches,ledger,
    attributionRole:'Exact numeric agreement with authenticated paired preimages through accepted source/input transports; no historical offer-local measurement',
    originalOfferLocalCapture:false,renewalAttribution:false,game:false};
}
export function renderLedger(report) {
  assert.ok(report && report.ledger.length===23,'LEDGER23');
  const cap=65536, pieces=[];let bytes=0;
  function add(text) {const n=Buffer.byteLength(text);assert.ok(bytes+n<=cap,'LEDGER_CAP');pieces.push(text);bytes+=n;}
  add('Initial pricing: accepted source transports, not historical offer-local capture. Renewals excluded.\n');
  add('order | talent | H annual actual/predicted | H bonus actual/predicted | A annual actual/predicted | A bonus actual/predicted | conclusion\n');
  for(const r of report.ledger) add([r.sourceOrder,r.talentId,
    r.HActual.annualSalary+'/'+r.HPredicted.annualSalary,r.HActual.signingBonus+'/'+r.HPredicted.signingBonus,
    r.AActual.annualSalary+'/'+r.APredicted.annualSalary,r.AActual.signingBonus+'/'+r.APredicted.signingBonus,r.conclusion].join(' | ')+'\n');
  // A fixed23 bounded record, validated primitives and authenticated inputs; no arbitrary object serialization.
  add(JSON.stringify(report)+'\n');return pieces.join('');
}
