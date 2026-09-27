// Two read calls on retained1056 week0; no world generation, commands or ticks.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { BridgeSession } from '../../../../../bridge/session.ts'
import { BRIDGE_SCHEMA } from '../../../../../bridge/schema/bridge-schema.ts'
import { canonicalJson } from '../../../../../bridge/schema/canonical.ts'
import { parseWireValue } from '../../../../../bridge/schema/runtime.ts'
import { exportSave, makeSave, validateSaveV38 } from '../../../../../src/core/save.ts'

const hash = (text: string) => createHash('sha256').update(text).digest('hex')
const inputPath = new URL('./1052-c3-endurance-A-first/metadata.json', import.meta.url)
const input = readFileSync(inputPath, 'utf8')
assert.equal(hash(input), '6bdc57689fd61d77c26fb35ce1fd1768bc376a81e9d3102c43840e1829cb5181')
const metadata = JSON.parse(input)
assert.equal(metadata.status, 'FAIL')
assert.equal(metadata.source.head, '8599ee2a2254bde7c2e6be61e712cdc4dc686eea')
assert.equal(metadata.counters.tickAttempts, 0)
const raw: string = metadata.initialCheckpoint
assert.equal(hash(raw), '597997206fa098ec8664e58b797db30dee30ccd2063cdce371762f5c4159e614')
assert.equal(validateSaveV38(JSON.parse(raw)).state.market.tick, 0)
const session = BridgeSession.fromSaveJson(raw)
assert.equal(exportSave(makeSave(session.gameState)), raw)
const responses = []
let reserved = 0
for (let i = 0; i < 2; i++) {
  assert.ok(reserved < 2); reserved++
  const response = session.snapshot()
  parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, response)
  assert.ok(Number.isFinite(response.metrics.serializationMs) && response.metrics.serializationMs >= 0)
  assert.equal(exportSave(makeSave(session.gameState)), raw, 'complete authority after each actual read')
  responses.push(response)
}
const changes: { path: string; first: unknown; second: unknown }[] = []
const actualResponses = responses.map(response => ({ bytes: Buffer.byteLength(canonicalJson(response)),
  sha256: hash(canonicalJson(response)), metrics: response.metrics }))
console.log(JSON.stringify({ marker: 'ACTUAL_SNAPSHOT_RESPONSES', responses: actualResponses }))
function compare(a: unknown, b: unknown, path: string): void {
  if (Object.is(a, b)) return
  assert.ok(changes.length < 64, 'bounded differing-path output')
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    const aa = a as Record<string, unknown>, bb = b as Record<string, unknown>
    const keys = [...new Set([...Object.keys(aa), ...Object.keys(bb)])].sort()
    for (const key of keys) compare(aa[key], bb[key], path + '/' + key)
  } else changes.push({ path, first: a, second: b })
}
compare(responses[0], responses[1], '')
console.log(JSON.stringify({ marker: 'ACTUAL_SNAPSHOT_DIFFERENCES', ticks: 0, reserved, changes,
  input: { bytes: Buffer.byteLength(input), sha256: hash(input) },
  save: { bytes: Buffer.byteLength(raw), sha256: hash(raw) },
  responses: actualResponses }))
assert.ok(changes.every(row => row.path === '/metrics/serializationMs'), 'only measured serialization time may differ')
const stable = responses.map(response => {
  const { serializationMs: _timing, ...metrics } = response!.metrics
  return canonicalJson({ ...response, metrics })
})
assert.equal(stable[0], stable[1], 'all other actual response fields remain exact')
assert.equal(readFileSync(inputPath, 'utf8'), input, 'retained evidence input unchanged')
console.log(JSON.stringify({ marker: 'SNAPSHOT_REPEAT_CAUSE_CONFIRMED', ticks: 0, calls: reserved,
  stable: { bytes: Buffer.byteLength(stable[0]!), sha256: hash(stable[0]!) } }))
