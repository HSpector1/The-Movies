// 955/960: bridge-owned continuation and historical journal cases moved intact
// from the core suite. Root tsconfig excludes bridge*.test.ts; bridge typechecks
// own the .ts import graph. Small fixture helpers are duplicated without bridge
// dependencies in the core suite. No assertion or outcome is weakened.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../bridge/session.ts'

const CORPUS = 'tests/fixtures/p14/genuine-v37-c3-corpus'
const PRE207 = 'genuine-v37-c3-preretirement-week207.json.gz'
const CONTINUOUS208 = 'genuine-v37-c3-retired-week208.json.gz'
const RUNTIME208 = 'genuine-v37-c3-runtime-current208.json.gz'
const RUNTIME52 = 'runtime52-current208-saved207.json.gz'
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const bytes = (state: GameState) => exportSave(makeSave(state))
type Manifest = {
  sourceSha: string; producerSha256: string; projectionVersion: number; saveVersion: number;
  knownParityDefect: { status: string; parsed208: { count: number; first: { path: string }[] } };
  artifacts: { filename: string; compressedSha256: string; uncompressedSha256: string }[];
}
function manifest(): Manifest {
  const value = JSON.parse(readFileSync(`${CORPUS}/MANIFEST.json`, 'utf8')) as Manifest
  expect(value).toMatchObject({ sourceSha: '1f44aa505c0d677430451ab5fcacaf5e0ce205d6',
    producerSha256: 'aba3b5c101a1982e2994ce69de0e78633a16d499ebe6cb26bdcc31875235bb4c',
    projectionVersion: 52, saveVersion: 37, knownParityDefect: { status: 'FAIL', parsed208: { count: 12 } } })
  return value
}
function artifact(filename: string): string {
  const record = manifest().artifacts.find(row => row.filename === filename)
  assert.ok(record, `genuine953 artifact is listed: ${filename}`)
  const compressed = readFileSync(`${CORPUS}/${filename}`), raw = gunzipSync(compressed).toString('utf8')
  expect(sha(compressed)).toBe(record.compressedSha256)
  expect(sha(raw)).toBe(record.uncompressedSha256)
  return raw
}
function pre207(): GameState {
  const state = migrateToLive(importSave(artifact(PRE207))).state
  expect(state.market.tick).toBe(207)
  return state
}
// Deliberately permute only object insertion order. No array order, scalar,
// property membership, clock, receipt or gameplay fact is changed.
function reverseObjectKeys<T>(value: T): T {
  if (Array.isArray(value)) return value.map(reverseObjectKeys) as T
  if (value !== null && typeof value === 'object') {
    assert.equal(Object.getPrototypeOf(value), Object.prototype)
    return Object.fromEntries(Object.keys(value).reverse().map(key => [key,
      reverseObjectKeys((value as Record<string, unknown>)[key])])) as T
  }
  return value
}
function reordered(state: GameState): GameState {
  const next = reverseObjectKeys(state)
  expect(next, 'permutation changes no actual value').toEqual(state)
  expect(stableStringify(next)).toBe(stableStringify(state))
  expect(JSON.stringify(next), 'permutation must really change object insertion order').not.toBe(JSON.stringify(state))
  expect(bytes(next), 'whole live-save validation admits the same world').toBe(bytes(state))
  return next
}
describe('955 genuine207 normal-development continuation', () => {
  it('matches actual BridgeSession advance from saved207 with uninterrupted develop:true on the reordered raw world', () => {
    const raw = reordered(pre207()), save = bytes(raw), direct = tick(raw, { develop: true })
    const session = BridgeSession.fromSaveJson(save, '955-public-continuation')
    const snapshot = session.snapshot(), advance = snapshot.availableIntents.find(intent => intent.kind === 'advanceWeek')
    assert.ok(advance)
    const response = session.command({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
      sessionId: snapshot.sessionId, expectedStateRevision: snapshot.stateRevision, commandId: '955-advance207',
      type: 'submitIntent', payload: { intentId: advance.intentId } })
    expect(response.accepted).toBe(true)
    expect(session.gameState.market.tick).toBe(208)
    expect(session.stateRevision).toBe(1)
    expect(session.exportRuntimeCheckpoint().journal).toHaveLength(1)
    expect(bytes(session.gameState)).toBe(bytes(direct))
  })
})

describe('955 historical preservation and interim projection52 journal authority', () => {
  it('preserves the current52 historical command journal and exact duplicate response without replaying gameplay', () => {
    // Interim-only identity: C.3 projection53 must instead register52 as prior
    // and reset incompatible journal authority. That separate requirement must
    // replace this current-identity control at the explicit53 cutover.
    expect(PROJECTION_VERSION).toBe(52)
    const raw = artifact(RUNTIME52), original = decodeBridgeRuntimeCheckpoint(raw).checkpoint
    expect(original.journal).toHaveLength(1)
    expect(original.stateRevision).toBe(1)
    expect(original.currentSaveJson).toBe(artifact(RUNTIME208))
    expect(original.savedSaveJson).toBe(artifact(PRE207))
    expect(original.currentSaveJson).not.toBe(artifact(CONTINUOUS208))
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => { throw new Error('current52 must not migrate') })
    expect(loaded.migratedFromProtocolVersion).toBeNull()
    const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated), entry = original.journal[0]!
    expect(encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())).toBe(raw)
    const before = bytes(session.gameState), response = session.command(JSON.parse(entry.requestJson))
    expect(canonicalJson(response)).toBe(entry.responseJson)
    expect(bytes(session.gameState)).toBe(before)
    expect(session.stateRevision).toBe(1)
    expect(encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())).toBe(raw)
    expect(artifact(RUNTIME52)).toBe(raw)
  })
})
