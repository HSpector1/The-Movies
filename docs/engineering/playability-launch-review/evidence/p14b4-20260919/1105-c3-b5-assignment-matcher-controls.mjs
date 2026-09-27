// Parent-only zero-gameplay verification. Imports only node libraries and pure/file-only adapters.
import assert from 'node:assert/strict'
import { readFileSync, realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ASSIGNMENT_ERROR_PREFIX, exactAssignmentCollisionPerson } from './1105-c3-b5-assignment-matcher.mjs'
import { E, identity, verifyAmendment } from './1105-c3-b5-forensic-verification.mjs'

const args = process.argv.slice(2)
assert.equal(args.length, 2); assert.equal(args[0], '--provenance-sha'); assert.match(args[1], /^[a-f0-9]{64}$/)
const root = realpathSync(fileURLToPath(new URL('../../../../../', import.meta.url)))
const protocolPath = resolve(root, E, '1105-c3-b5-forensic-provenance.json')
const protocolBytes = readFileSync(protocolPath)
assert.equal(identity(protocolBytes).sha256, args[1])
const before = verifyAmendment(root), protocol = JSON.parse(protocolBytes)
const stoppedInput = protocol.amendment.hostOnlyInputs.find(row => row.path === `${E}/1100-c3-b5-forensic-result.json`)
assert.ok(stoppedInput)
const raw = readFileSync(resolve(root, stoppedInput.path)); assert.deepEqual(identity(raw), stoppedInput.identity)
const stopped = JSON.parse(raw)
assert.equal(stopped.counterfactualStatus, 'STOPPED'); assert.equal(stopped.attributionStatus, 'INCOMPLETE')
assert.equal(stopped.attemptedTicks, 212); assert.equal(stopped.completedTicks, 212); assert.equal(stopped.arrivedWeek, 212)
assert.equal(stopped.firstRejectedStateObserved, null); assert.equal(stopped.guardFailure, null)
assert.deepEqual(stopped.firstFailure, { phase: 'whole38-212', message: 'exact current simultaneous-assignment law, not another validation cause' })
const candidates = stopped.admissions.filter(row => row.week === 212)
assert.equal(candidates.length, 1)
const admission = candidates[0]
assert.equal(admission.status, 'REFUSED'); assert.equal(admission.forensicAllowed, false)
const { message, census } = admission
assert.equal(typeof message, 'string'); assert.equal(census.collisions.length, 2)
const priorRows = JSON.stringify(census.collisions), priorMessage = message
const actualPerson = 'person-studio-efb645e3-r02-0'
assert.equal(exactAssignmentCollisionPerson(message, census.collisions), actualPerson)
assert.equal(message, ASSIGNMENT_ERROR_PREFIX + `Hollywood save: person ${actualPerson} has simultaneous active assignments`)
assert.equal(exactAssignmentCollisionPerson(message, [...census.collisions].reverse()), actualPerson)
const frames = ASSIGNMENT_ERROR_PREFIX.split(' — ').filter(Boolean)
assert.equal(frames.length, 12)
const suffix = `Hollywood save: person ${actualPerson} has simultaneous active assignments`
const refusals = [
  ['bare Hollywood suffix', suffix, census.collisions],
  ['omitted first wrapper', frames.slice(1).join(' — ') + ' — ' + suffix, census.collisions],
  ['duplicated first wrapper', frames[0] + ' — ' + message, census.collisions],
  ['reordered wrappers', [frames[1], frames[0], ...frames.slice(2)].join(' — ') + ' — ' + suffix, census.collisions],
  ['extra prefix', 'extra: ' + message, census.collisions],
  ['extra suffix', message + ' extra', census.collisions],
  ['trailing newline', message + '\n', census.collisions],
  ['changed punctuation', message.replace(' — ', ' - '), census.collisions],
  ['changed Hollywood law', message.replace('simultaneous active assignments', 'overlapping industry employers'), census.collisions],
  ['unknown person', message.replace(actualPerson, 'unknown-for-control'), census.collisions],
  ['no actual collision', message, []],
  ['different census person', message, census.collisions.filter(row => row.personId !== actualPerson)],
  ['duplicated matching census', message, [...census.collisions, census.collisions.find(row => row.personId === actualPerson)]],
  ['wrong V29 wrapper inserted', message.replace('validateSaveV30: frozen V28', 'validateSaveV30: frozen V29'), census.collisions],
  ['unobserved V38 wrapper', 'validateSaveV38: state is invalid — ' + message, census.collisions],
]
for (const [name, variant, collisions] of refusals)
  assert.equal(exactAssignmentCollisionPerson(variant, collisions), null, name)
assert.equal(JSON.stringify(census.collisions), priorRows); assert.equal(message, priorMessage)
assert.ok(readFileSync(resolve(root, stoppedInput.path)).equals(raw))
assert.ok(readFileSync(protocolPath).equals(protocolBytes))
assert.deepEqual(verifyAmendment(root), before)
const output = JSON.stringify({ marker: 'C3_B5_WRAPPER_MATCHER_VERIFIED', gameplayCalls: 0, projectModulesEvaluated: 0,
  originalStoppedResult: stoppedInput.identity, actualMessage: identity(message), actualPerson,
  positiveControls: 2, refusalControls: refusals.length, completeSourceReconstruction: before })
assert.ok(Buffer.byteLength(output) <= 32 * 1024)
console.log(output)
