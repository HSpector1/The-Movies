import assert from 'node:assert/strict';
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
