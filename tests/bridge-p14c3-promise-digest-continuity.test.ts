// 955/960: bridge-owned continuation and historical journal cases moved intact
// from the core suite. Root tsconfig excludes bridge*.test.ts; bridge typechecks
// own the .ts import graph. Small fixture helpers are duplicated without bridge
// dependencies in the core suite. No assertion or outcome is weakened.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it, vi } from 'vitest'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV37 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
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
    // Stable historical leaf title is retained for the paired selector. Under
    // the explicit53 cutover this actual52 journal is preserved as old evidence;
    // it must lose replay authority when both genuine37 slots migrate to38.
    expect(PROJECTION_VERSION).toBe(55)
    const outgoing52 = 'sha256:f036ccdd62c4ac2a700a27796631e1c4f8c85f9cccfb14ac6850083fb8dba5f2'
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(outgoing52)).toBe('projection-v52')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
    const raw = artifact(RUNTIME52), original = JSON.parse(raw) as {
      protocolVersion: number; schemaId: string; sessionId: string; stateRevision: number;
      currentSaveJson: string; savedSaveJson: string; currentStateDigest: string; savedStateDigest: string;
      journalDigest: string; journal: { commandId: string; requestJson: string; responseJson: string }[];
    }
    expect(canonicalJson(original) + '\n').toBe(raw)
    expect(original).toMatchObject({ protocolVersion: 4, schemaId: outgoing52 })
    expect(original.journal).toHaveLength(1)
    expect(original.stateRevision).toBe(1)
    expect(sha(canonicalJson(original.journal))).toBe(original.journalDigest)
    expect(JSON.parse(original.journal[0]!.responseJson)).toMatchObject({ accepted: true })
    expect(original.currentSaveJson).toBe(artifact(RUNTIME208))
    expect(original.savedSaveJson).toBe(artifact(PRE207))
    expect(original.currentSaveJson).not.toBe(artifact(CONTINUOUS208))
    expect(() => decodeBridgeRuntimeCheckpoint(raw)).toThrow(/schemaId/)
    const factory = vi.fn(() => '955-governed-current53')
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, factory)
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    expect(factory).toHaveBeenCalledTimes(1)
    const next = loaded.hydrated.checkpoint
    expect(next.sessionId).toBe('955-governed-current53')
    expect(next.sessionId).not.toBe(original.sessionId)
    expect(next.schemaId).toBe(SCHEMA_ID)
    expect(next.stateRevision).toBe(0)
    expect(next.journal).toEqual([])
    expect(next.journalDigest).toBe(sha('[]'))
    for (const [slot, week, digest] of [['currentSaveJson', 208, 'currentStateDigest'],
      ['savedSaveJson', 207, 'savedStateDigest']] as const) {
      const old = validateSaveV37(JSON.parse(original[slot]))
      expect(old.state.market.tick).toBe(week)
      expect(exportSave(old)).toBe(original[slot])
      expect(sha(original[slot])).toBe(original[digest])
      const current = migrateToLive(old)
      const { transitionBoundaryWeek, professionAnchors, transitionEvaluations, professionChanges,
        industryRetirements, transitionDue, ...oldLifecycle } = current.state.careerLifecycle
      expect(canonicalJson({ ...current.state, careerLifecycle: oldLifecycle })).toBe(canonicalJson(old.state))
      expect({ transitionBoundaryWeek, professionAnchors, transitionEvaluations, professionChanges,
        industryRetirements, transitionDue }).toEqual({ transitionBoundaryWeek: week,
        professionAnchors: old.state.talent.map(person => ({ personId: person.id, profession: person.role,
          kind: 'existing', recordedWeek: week })),
        transitionEvaluations: [], professionChanges: [], industryRetirements: [],
        transitionDue: old.state.hollywood === null ? [] : old.state.careerLifecycle.records
          .filter(row => row.status === 'retired').map(row => ({ personId: row.personId, week: week + 1 }))
          .sort((a, b) => a.personId < b.personId ? -1 : a.personId > b.personId ? 1 : 0) })
      expect(current.saveVersion).toBe(40)
      expect(next[slot]).toBe(exportSave(current))
      expect(next[digest]).toBe(sha(exportSave(current)))
    }
    const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated), entry = original.journal[0]!
    const before = bytes(session.gameState), encoded = encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())
    expect(session.command(JSON.parse(entry.requestJson))).toMatchObject({ accepted: false })
    expect(bytes(session.gameState)).toBe(before)
    expect(session.stateRevision).toBe(0)
    expect(encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())).toBe(encoded)
    const noRemigration = vi.fn(() => { throw new Error('current53 must not migrate again') })
    const reopened = loadBridgeRuntimeCheckpoint(encoded, undefined, noRemigration)
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(noRemigration).not.toHaveBeenCalled()
    expect(encodeBridgeRuntimeCheckpoint(reopened.hydrated.checkpoint)).toBe(encoded)
    expect(artifact(RUNTIME52)).toBe(raw)
  })
})
