import assert from 'node:assert/strict';
import { authenticateConfig } from './authenticate-inputs.mjs';
const {request} = authenticateConfig();
const {validateRequest,validateMeasuredRow,encodeReport} = await import('./first-draw-core.mjs');
const clone = () => JSON.parse(JSON.stringify(request));
let groups = 0;
function test(name, fn) { fn(); groups++; console.log('PASS ' + name); }
const known = { ...request.rows[0], firstDraw:0.5, jitter:1 }; // SYNTHETIC validation fixture only; no stream/next call or measured draw
const refusals = (fn, message) => assert.throws(fn, e => e instanceof Error && e.message.includes(message));
test('exact-one-admission-and-synthetic-validation-only', () => {
  assert.equal(validateRequest(request),request);
  validateMeasuredRow(known); assert.equal(known.firstDraw,0.5); assert.equal(known.jitter,1);
  const report=JSON.parse(encodeReport([known]));assert.equal(report.rows.length,1);assert.equal(report.salaryAttribution,false);
});
test('wrong-authenticated-source-refused', () => { const r=clone();r.rngSourceSha256='0'.repeat(64);refusals(()=>validateRequest(r),'SOURCE_ROLE'); });
test('wrong-key-refused', () => {const r=clone();r.rows[0].key+='x';refusals(()=>validateRequest(r),'KEY');});
test('wrong-seed-refused', () => {const r=clone();r.rows[0].seed+='x';refusals(()=>validateRequest(r),'SEED');});
test('duplicate-extra-row-cardinality-refused', () => {const r=clone();r.rows.push(r.rows[0]);refusals(()=>validateRequest(r),'ROW_COUNT');});
test('missing-row-refused', () => {const r=clone();r.rows.pop();refusals(()=>validateRequest(r),'ROW_COUNT');});
test('nonfinite-draw-or-jitter-refused', () => {
  for(const v of [NaN,Infinity,-Infinity]) {
    refusals(()=>validateMeasuredRow({...known,firstDraw:v}),'FINITE_DRAW');
    refusals(()=>validateMeasuredRow({...known,jitter:v}),'FINITE_JITTER');
  }
});
test('report-cap-refused-before-admission', () => {
  const bytes=Buffer.byteLength(encodeReport([known]));
  assert.equal(Buffer.byteLength(encodeReport([known],bytes)),bytes);
  refusals(()=>encodeReport([known],bytes-1),'REPORT_CAP');refusals(()=>encodeReport([known],1),'REPORT_CAP');
});
assert.equal(groups,8);
console.log(JSON.stringify({status:'PURE_RENEWAL208_R03_2_INPUT_AND_REFUSAL_CONTROLS_PASSED',groups,unknownDrawsMeasured:0,knownControlDraws:0,syntheticControlOnly:true,game:false}));
