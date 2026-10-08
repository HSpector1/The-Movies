// UNRUN pure observer-helper checks. No game modules.
import assert from 'node:assert/strict'
import { assertRetainedIdentity } from './retention.mjs'
const original = { contractId: 'genuine-contract', studioId: 'r04', terms: { annualSalary: 7 }, endedWeek: null }
const entry = { ordinal: 0, identity: ['genuine-contract', 0], row: original }
assertRetainedIdentity(entry, [{ ...original }])
assert.throws(() => assertRetainedIdentity(entry, [{ ...original, contractId: 'changed-contract' }]), /STOP_RETAINED_CONTRACT_ID/)
assert.throws(() => assertRetainedIdentity(entry, [{ ...original, studioId: 'different-studio' }]), /STOP_RETAINED_STUDIO_ID/)
const repeated = { ordinal: 1, identity: ['genuine-contract', 0], row: original }
assert.throws(() => assertRetainedIdentity(repeated, [{ ...original }, { ...original }]), /STOP_RETAINED_OCCURRENCE/)
process.stdout.write('retention helper 4/4\n')
