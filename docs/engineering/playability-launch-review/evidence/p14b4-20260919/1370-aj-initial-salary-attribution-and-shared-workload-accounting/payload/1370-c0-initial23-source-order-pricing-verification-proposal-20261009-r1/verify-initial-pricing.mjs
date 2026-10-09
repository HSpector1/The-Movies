import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { authenticateConfig } from './authenticate-inputs.mjs';
const {config,readRole} = authenticateConfig();
const parse = name => JSON.parse(readRole(name));
const future = config.futureWitness;
for(const role of ['actualWitnessSourcePins','actualWitnessConfig','actualWitnessResult','actualWitnessStdout','actualWitnessIndependentReceipt']) assert.ok(config.roles[role], 'MISSING_WITNESS_ROLE');
const receipt=parse('actualWitnessIndependentReceipt'), result=parse('actualWitnessResult'), sourcePins=parse('actualWitnessSourcePins');
assert.equal(receipt.decision,'ACCEPT_OBSERVED_PURE_INITIAL23_FIRST_DRAWS','INDEPENDENT_NUMERIC_ACCEPTANCE');
for(const [field,role] of [['sourcePinsSha256','actualWitnessSourcePins'],['configSha256','actualWitnessConfig'],['resultSha256','actualWitnessResult'],['stdoutSha256','actualWitnessStdout']]) {
  assert.equal(receipt[field],config.roles[role].sha256,'ACCEPTED_WITNESS_BYTE_ROLE');assert.equal(future[field],receipt[field],'EXACT_FILLED_ACCEPTANCE');
}
assert.equal(receipt.actualToolExit,0);assert.equal(receipt.actualHelperExit,0);assert.equal(receipt.rows,23);assert.equal(receipt.numericOnly,true);assert.equal(receipt.row0ControlAccepted,true);
assert.equal(result.mode,'witness');assert.equal(result.status,'PURE_INITIAL23_WITNESS_COMPLETE_UNADOPTED');assert.equal(result.actualChildExit,0);assert.equal(result.groupClear,true);assert.equal(result.timedOut,false);
assert.ok(Number.isInteger(result.ownedPgid) && result.ownedPgid>0 && result.childPid===result.ownedPgid,'ACCEPTED_NUMERIC_OWNERSHIP');
assert.ok(result.elapsedSeconds>=0 && result.elapsedSeconds<90,'ACCEPTED_CLOCK');
assert.equal(result.configSha256,receipt.configSha256);assert.equal(result.stdoutSha256,receipt.stdoutSha256);assert.equal(result.stderrBytes,0);assert.equal(result.stderrSha256,crypto.createHash('sha256').update('').digest('hex'));
assert.equal(sourcePins.executionAuthorization,false); // source proposal is not an execution grant
const raw=readRole('actualWitnessStdout');assert.equal(raw.length,result.stdoutBytes);assert.ok(raw.length<=32768,'WITNESS_REPORT_CAP');
const witness=JSON.parse(raw);
const {verifyPricing,renderLedger} = await import('./verify-pricing-core.mjs');
const report=verifyPricing(parse('pricingInputs'),witness,parse('HPreimage'),parse('APreimage'));
fs.writeSync(1,renderLedger(report));
if(report.mismatches) process.exitCode=2;
