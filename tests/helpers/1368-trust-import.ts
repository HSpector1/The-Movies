// Genuine historical Save45 input; subsequent authoring uses current production.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { makeSave, migrateToLive, stableStringify, validateSaveV45, validateSaveV46 } from '../../src/core/save.js'
import type { GameState } from '../../src/core/types.js'
import { ordinaryPath } from './1368-archived-route.js'

const MANIFEST_SHA = '0b98763001eb96949d8e312df5dfe600f1adf599f5466dd59eec214e1f229991'
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
function snap(value: unknown): string {
  const ancestors = new Set<object>()
  const visit = (v: unknown): unknown => {
    if (v === null) return ['null']
    if (v === undefined) return ['undefined']
    if (typeof v === 'number') return ['number', Object.is(v, -0) ? '-0' : String(v)]
    if (typeof v === 'string' || typeof v === 'boolean' || typeof v === 'bigint') return [typeof v, String(v)]
    assert(typeof v === 'object', 'unsupported full-state value')
    assert(!ancestors.has(v), 'cyclic full-state value')
    ancestors.add(v)
    try {
      assert.equal(Object.getOwnPropertySymbols(v).length, 0, 'unsupported symbol state keys')
      if (v instanceof Map) return ['Map', [...v].map(([k, x]) => [visit(k), visit(x)])]
      if (v instanceof Set) return ['Set', [...v].map(visit)]
      if (v instanceof Date) return ['Date', v.toISOString()]
      if (ArrayBuffer.isView(v)) return [v.constructor.name, Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString('base64')]
      if (v instanceof ArrayBuffer) return ['ArrayBuffer', Buffer.from(v).toString('base64')]
      if (Array.isArray(v)) return ['Array', Array.from({ length: v.length }, (_, i) => i in v ? visit(v[i]) : ['hole'])]
      const proto: unknown = Object.getPrototypeOf(v)
      assert(proto === Object.prototype || proto === null, 'unsupported full-state object prototype')
      const record = v as Record<string, unknown>
      return [proto === null ? 'null-object' : 'object', Object.keys(record).sort().map(k => [k, visit(record[k])])]
    } finally { ancestors.delete(v) }
  }
  return JSON.stringify(visit(value))
}

export function loadImportedTrust195(): GameState {
  const suppliedRoot = process.env.TRUST_AUTHORING_CAPTURE_DIR
  const suppliedPin = process.env.TRUST_AUTHORING_MANIFEST_SHA256
  assert((suppliedRoot === undefined) === (suppliedPin === undefined),
    'trust capture root/pin overrides must be supplied together')
  const root = suppliedRoot ?? fileURLToPath(new URL('../fixtures/p14/genuine-v45-trust-authoring-week195-1368/', import.meta.url))
  const pin = suppliedPin ?? MANIFEST_SHA
  assert(root && pin === MANIFEST_SHA, 'independently accepted original week195 capture required')
  ordinaryPath(root)
  const manifestBytes = readFileSync(ordinaryPath(join(root, 'MANIFEST.json')))
  assert.equal(sha(manifestBytes), MANIFEST_SHA)
  const manifest = JSON.parse(manifestBytes.toString('utf8')) as {
    kind: string; originalEngineHead: string; originalSrcTree: string; seed: string;
    saveVersion: number; week: number; priorRivalSubmissions: number;
    file: { path: string; sha256: string; bytes: number; rawSha256: string; rawBytes: number };
  }
  assert.equal(manifest.kind, 'genuine-original-save45-default-seed-week195')
  assert.equal(manifest.originalEngineHead, '2eaa697effc38538c37da28b486786ce267a2284')
  assert.equal(manifest.originalSrcTree, '88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837')
  assert.equal(manifest.seed, 'p13a-core-causal-01')
  assert.equal(manifest.saveVersion, 45); assert.equal(manifest.week, 195)
  assert.equal(manifest.priorRivalSubmissions, 0)
  assert.equal(manifest.file.path, 'week195.save45.json.gz')
  const compressed = readFileSync(ordinaryPath(join(root, 'week195.save45.json.gz')))
  assert.equal(sha(compressed), manifest.file.sha256); assert.equal(compressed.length, manifest.file.bytes)
  const raw = gunzipSync(compressed)
  assert.equal(sha(raw), manifest.file.rawSha256); assert.equal(raw.length, manifest.file.rawBytes)
  const parsed: unknown = JSON.parse(raw.toString('utf8')), parsedBefore = snap(parsed)
  // Own-era admission precedes migration; no casts or invented recovery fields.
  const old = validateSaveV45(parsed)
  assert.equal(snap(parsed), parsedBefore)
  assert.equal(stableStringify(old), raw.toString('utf8'))
  assert.equal(old.state.market.tick, 195); assert.equal(old.seed, manifest.seed)
  assert(old.state.hollywood !== null, 'original rival industry required')
  assert.deepEqual(old.state.talentMarket.receipts.filter(r => r.kind === 'proposalSubmitted'
    && r.studioId !== null && r.studioId !== old.state.hollywood!.playerStudioId), [])
  const oldBefore = snap(old), current = migrateToLive(old)
  assert.equal(snap(old), oldBefore); assert.equal(current.saveVersion, 46)
  const currentBefore = snap(current), admitted = validateSaveV46(current)
  assert.equal(snap(current), currentBefore)
  assert.equal(stableStringify(admitted), stableStringify(current))
  const state = admitted.state, before = snap(state), saved = makeSave(state)
  assert.equal(saved.saveVersion, 46)
  const readerInput = structuredClone(saved), readerBefore = snap(readerInput)
  const read = validateSaveV46(readerInput)
  assert.equal(snap(readerInput), readerBefore)
  assert.equal(stableStringify(read), stableStringify(saved))
  assert.equal(stableStringify(read.state), stableStringify(state))
  assert.equal(snap(state), before)
  assert.equal(state.seed, manifest.seed); assert.equal(state.market.tick, 195)
  assert(state.hollywood !== null, 'imported rival industry required')
  assert.deepEqual(state.talentMarket.receipts.filter(r => r.kind === 'proposalSubmitted'
    && r.studioId !== null && r.studioId !== state.hollywood!.playerStudioId), [])
  return state
}
