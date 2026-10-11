import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { busyTalentIds } from '../../src/core/employment.js'
import { stream } from '../../src/core/rng.js'
import { scriptDraftWeeks, writingPaceExperience } from '../../src/core/screenplay.js'
import { makeSave, validateSaveV46, stableStringify } from '../../src/core/save.js'
import { GENRE_ORDER } from '../../src/core/tuning.js'
import type { GameState } from '../../src/core/types.js'
import { ordinaryPath } from './1368-archived-route.js'

export const SEED = 'p13b-s7-independence-01'
export const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
export function snap(value: unknown): string {
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

export function admitted(state: GameState): GameState {
  const before = snap(state)
  const saved = makeSave(state)
  expect(saved.saveVersion).toBe(46)
  const readerInput = structuredClone(saved), readerBefore = snap(readerInput)
  const read = validateSaveV46(readerInput)
  expect(snap(readerInput)).toBe(readerBefore)
  expect(stableStringify(read)).toBe(stableStringify(saved))
  expect(stableStringify(read.state)).toBe(stableStringify(state))
  expect(snap(state)).toBe(before)
  return state
}
export function subject(state: GameState) {
  const h = state.hollywood!
  const owner = h.identities.find(row => row.row === 1 && row.role === 'rival')!
  const originalWriterOwner = h.identities.find(row => row.row === 3 && row.role === 'rival')!
  expect(owner).toBeDefined(); expect(originalWriterOwner).toBeDefined()
  const writerId = `person-${originalWriterOwner.studioId}-0`
  const business = h.businesses.find(row => row.studioId === owner.studioId)!
  return { h, business, writerId }
}
export function premise414(state: GameState) {
  expect(state.seed).toBe(SEED); expect(state.market.tick).toBe(414)
  const { h, business, writerId } = subject(state)
  expect(business.costCutting.since, 'premise: ordinary, non-cutting rival').toBeNull()
  expect(business.nextDecisionWeek).toBeLessThanOrEqual(414)
  const rows = h.activeEmploymentOrdinals.map(i => h.employment[i]!)
    .filter(row => row.studioId === business.studioId)
  const busy = busyTalentIds(state)
  const selected = rows.map(row => state.talent.find(person => person.id === row.terms.talentId)!)
    .find(person => person.role === 'writer' && !busy.has(person.id))
  expect(selected?.id, 'premise: actual ordered idle writer, not a substituted person').toBe(writerId)
  const employment = rows.find(row => row.terms.talentId === writerId)!
  expect(employment).toMatchObject({ endedWeek: null, terms: { startWeek: 208, endWeekExclusive: 416 } })
  expect(state.careerLifecycle.records.filter(row => row.personId === writerId)).toEqual([])
  expect(state.talentMarket.cases.find(row => row.contractId === employment.contractId && row.variant === 'expiry'))
    .toMatchObject({ openedWeek: 404, outcome: null })
  const ordinal = business.development.projects.length
  expect(ordinal).toBe(34)
  // Reproduce only the existing keyed genre selection to establish the draft-duration premise.
  // This derived stream never advances state.rngState; it makes no policy choice for the tick.
  const rng = state.rngState
  const chooser = stream(state.seed, 'hollywood-v1', `${business.studioId}:package:${ordinal}`)
  let roll = chooser.next() * GENRE_ORDER.reduce((sum, genre) => sum + business.policy.affinities[genre], 0)
  const genre = GENRE_ORDER.find(g => (roll -= business.policy.affinities[g]) < 0) ?? GENRE_ORDER[0]!
  const duration = scriptDraftWeeks({ origin: 'original', officeTierAtMint: 'baseline',
    writerExperience: writingPaceExperience([selected!], genre), writerCount: 1 })
  expect(duration).toBe(3); expect(state.rngState).toEqual(rng)
  expect(414 + duration).toBe(417)
  return { ...subject(state), employment, duration }
}

export function load414(): GameState {
  const suppliedRoot = process.env.RIVAL_WRITING_CAPTURE_DIR
  const suppliedPin = process.env.RIVAL_WRITING_MANIFEST_SHA256
  assert((suppliedRoot === undefined) === (suppliedPin === undefined),
    'capture root/pin overrides must be supplied together')
  // Normal broad tests use the independently accepted repository fixture.
  // Isolated candidates may bind the same accepted bytes at an explicit ordinary path.
  const directory = suppliedRoot ?? fileURLToPath(new URL('../fixtures/p14/genuine-v46-rival-writing-pre414-1368/', import.meta.url))
  const pin = suppliedPin ?? 'd097bbf131c1dc495b881d73e96994953b2f6a0ef50f88bd3b043f263024f205'
  assert(directory && pin === 'd097bbf131c1dc495b881d73e96994953b2f6a0ef50f88bd3b043f263024f205',
    'the independently accepted original pre414 capture is required')
  ordinaryPath(directory)
  const bytes = readFileSync(ordinaryPath(join(directory, 'MANIFEST.json')))
  expect(sha(bytes)).toBe(pin)
  const manifest = JSON.parse(bytes.toString('utf8'))
  expect(manifest).toMatchObject({ format: '1368-rival-writing-pre414/v1', seed: SEED,
    route: { initial: 'p13aGeneratedStudio', tickOptions: 'default', from: 0, to: 414 }, saveVersion: 46 })
  const compressed = readFileSync(ordinaryPath(join(directory, 'pre414.save46.json.gz')))
  expect(sha(compressed)).toBe(manifest.gzipSha256)
  const raw = gunzipSync(compressed)
  expect(sha(raw)).toBe(manifest.rawSha256)
  const parsed: unknown = JSON.parse(raw.toString('utf8')), before = snap(parsed)
  const saved = validateSaveV46(parsed)
  expect(snap(parsed)).toBe(before)
  expect(stableStringify(saved)).toBe(raw.toString('utf8'))
  const state = admitted(saved.state)
  premise414(state)
  return state
}
