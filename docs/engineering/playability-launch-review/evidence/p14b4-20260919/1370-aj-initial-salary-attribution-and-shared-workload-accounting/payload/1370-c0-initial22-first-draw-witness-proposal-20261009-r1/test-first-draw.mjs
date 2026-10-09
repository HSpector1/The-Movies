import assert from 'node:assert/strict';
import { authenticateConfig } from './authenticate-inputs.mjs';
const {request} = authenticateConfig();
const {validateRequest,firstDraw,validateMeasuredRow,encodeReport} = await import('./first-draw-core.mjs');
const clone = () => JSON.parse(JSON.stringify(request));
let groups = 0;
function test(name, fn) { fn(); groups++; console.log('PASS ' + name); }
const known = firstDraw(request.rows[0]); // only known control; never measures the other22 in controls
const refusals = (fn, message) => assert.throws(fn, e => e instanceof Error && e.message.includes(message));
test('exact23-admission-and-known-row0', () => {
  assert.equal(validateRequest(request),request);
  assert.equal(known.firstDraw,0.34857689985074103); assert.equal(known.jitter,0.9757723039761186);
  const report=JSON.parse(encodeReport([known]));assert.equal(report.rows.length,1);assert.equal(report.salaryAttribution,false);
});
test('wrong-authenticated-source-refused', () => { const r=clone();r.rngSourceSha256='0'.repeat(64);refusals(()=>validateRequest(r),'SOURCE_ROLE'); });
test('wrong-key-refused', () => {const r=clone();r.rows[1].key+='x';refusals(()=>validateRequest(r),'KEY');});
test('wrong-seed-refused', () => {const r=clone();r.rows[1].seed+='x';refusals(()=>validateRequest(r),'SEED');});
test('duplicate-row-refused', () => {const r=clone();r.rows[2]=r.rows[1];refusals(()=>validateRequest(r),'DUPLICATE');});
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
console.log(JSON.stringify({status:'PURE_INITIAL23_INPUT_AND_REFUSAL_CONTROLS_PASSED',groups,unknownDrawsMeasured:0,knownControlDraws:1,game:false}));
