import assert from 'node:assert/strict'
/** Ordinal is only a locator; identity/occurrence must still name the same row. */
export function assertRetainedIdentity(entry, rows) {
  const row = rows[entry.ordinal]
  assert.ok(row)
  assert.equal(row.contractId, entry.row.contractId, 'STOP_RETAINED_CONTRACT_ID')
  assert.equal(row.studioId, entry.row.studioId, 'STOP_RETAINED_STUDIO_ID')
  const occurrence = rows.slice(0, entry.ordinal).filter(r => r.contractId === row.contractId).length
  assert.deepEqual([row.contractId, occurrence], entry.identity, 'STOP_RETAINED_OCCURRENCE')
}
