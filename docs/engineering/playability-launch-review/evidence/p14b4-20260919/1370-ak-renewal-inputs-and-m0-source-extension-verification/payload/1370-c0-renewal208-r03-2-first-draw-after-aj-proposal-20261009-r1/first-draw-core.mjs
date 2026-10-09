// UNRUN pure first-draw witness. Standard unmodified native JS builtins assumed.
// Expected input roles are frozen author-time projections of the pinned source-input artifact.
import assert from 'node:assert/strict';
import { stream } from './rng.type-erased.mjs';
export const RNG_SOURCE_SHA = '2f21996018c6f5399e1a68a1bf765e505db4d17360a939aa00cae0740cc6c57a';
const EXPECTED = {"schema":"1370-renewal208-r03-2-first-draw-inputs-r1","rngSourceSha256":"2f21996018c6f5399e1a68a1bf765e505db4d17360a939aa00cae0740cc6c57a","sourceInputRolesSha256":"505f6afbf22085bab0aec2f721cc78d2e0e8fe177be0d200d065354aea5f4d46","rows":[{"ordinal":38,"identity":["studio-aca408ec-r03:contract:person-studio-aca408ec-r03-2:208",0],"talentId":"person-studio-aca408ec-r03-2","seed":"p13a-core-causal-01","purpose":"hiring","key":"offer-person-studio-aca408ec-r03-2","streamSeed":"p13a-core-causal-01::hiring::offer-person-studio-aca408ec-r03-2","role":"missing-renewal208-isolated-first-draw"}]};
export const REPORT_CAP = 8192;
export function validateRequest(request) {
  assert.equal(request?.rngSourceSha256, RNG_SOURCE_SHA, 'SOURCE_ROLE');
  assert.equal(request?.sourceInputRolesSha256, EXPECTED.sourceInputRolesSha256, 'INPUT_ROLE');
  assert.equal(request?.schema, EXPECTED.schema, 'INPUT_SCHEMA');
  assert.ok(Array.isArray(request.rows) && request.rows.length === 1, 'ROW_COUNT');
  const keys = new Set();
  for (let i = 0; i < 1; i++) {
    const row = request.rows[i], expected = EXPECTED.rows[i];
    assert.ok(row && typeof row === 'object', 'ROW');
    assert.equal(row.seed, expected.seed, 'SEED');
    assert.equal(row.purpose, 'hiring', 'PURPOSE');
    assert.ok(!keys.has(row.key), 'DUPLICATE'); keys.add(row.key);
    assert.equal(row.key, expected.key, 'KEY');
    assert.deepEqual(row, expected, 'EXACT_IDENTITY_ORDER_ROLE');
  }
  assert.deepEqual(request, EXPECTED, 'EXACT_REQUEST');
  return request;
}
export function firstDraw(row) {
  assert.deepEqual(row, EXPECTED.rows.find(r => r.ordinal === row?.ordinal), 'EXACT_DRAW_ROW');
  // Exactly one new keyed stream and one next() call. No shared/game stream, extra draw, or cache.
  const firstDraw = stream(row.seed, row.purpose, row.key).next();
  const jitter = 1 + (firstDraw * 2 - 1) * 0.08; // employment.ts281 + tuning.ts388
  const result = { ...row, firstDraw, jitter };
  validateMeasuredRow(result);
  return result;
}
export function validateMeasuredRow(row) {
  assert.ok(row && typeof row === 'object', 'MEASURED_ROW');
  const { firstDraw, jitter, ...input } = row;
  assert.deepEqual(input, EXPECTED.rows.find(r => r.ordinal === row.ordinal), 'MEASURED_INPUT_ROLE');
  assert.ok(Number.isFinite(firstDraw) && firstDraw >= 0 && firstDraw < 1, 'FINITE_DRAW');
  assert.ok(Number.isFinite(jitter) && jitter === 1 + (firstDraw * 2 - 1) * 0.08, 'FINITE_JITTER');
}
export function encodeReport(rows, cap = REPORT_CAP) {
  assert.ok(Number.isSafeInteger(cap) && cap >= 1 && cap <= REPORT_CAP, 'REPORT_CAP_ARGUMENT');
  assert.ok(Array.isArray(rows) && rows.length === 1, 'REPORT_ROWS');
  // All row shapes/strings derive from fixed bounded inputs; stringify never receives arbitrary objects.
  const prefix = '{"status":"PURE_RENEWAL208_R03_2_FIRST_DRAW_COMPLETE","rngSourceSha256":"' + RNG_SOURCE_SHA + '","rows":[';
  const suffix = '],"salaryAttribution":false,"renewalAttribution":false}\n';
  let bytes = Buffer.byteLength(prefix) + Buffer.byteLength(suffix);
  assert.ok(bytes <= cap, 'REPORT_CAP');
  const pieces = [prefix], seen = new Set();
  for (const row of rows) {
    validateMeasuredRow(row); assert.ok(!seen.has(row.ordinal), 'REPORT_DUPLICATE'); seen.add(row.ordinal);
    const token = (seen.size > 1 ? ',' : '') + JSON.stringify(row);
    const nextBytes = bytes + Buffer.byteLength(token);
    assert.ok(nextBytes <= cap, 'REPORT_CAP'); // before admission to pieces or final string growth
    pieces.push(token); bytes = nextBytes;
  }
  pieces.push(suffix);
  const text = pieces.join(''); assert.equal(Buffer.byteLength(text), bytes);
  return text;
}
export function measureAll(request) {
  validateRequest(request); // complete admission precedes every RNG operation
  const rows = request.rows.map(firstDraw);
  assert.equal(rows.length, 1);
  return rows;
}
