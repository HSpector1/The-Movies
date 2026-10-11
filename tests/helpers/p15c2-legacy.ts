// ── P15C Wave 2: shared RED helpers (records 1359-C, 1359-C2) ──
//
// The Legacy accessors, the genuine fixtures, the route L captures, the save-step lookup and the
// budgets, shared by tests/p15c2-campaign-legacy-integration.test.ts and the sibling
// leaves of 1359-p15c-wave2-sibling.patch. Every Wave 2 name resolves at call time, so a leaf fails
// by name today. Route L itself is tests/helpers/p15c2-route-l.ts (no vitest; the producer uses it).

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import * as legacyModule from '../../src/core/campaignLegacy.js'
import { LEGACY_BOUNDARY_WEEK, type LegacyFacts } from '../../src/core/campaignLegacy.js'
import * as saveModule from '../../src/core/save.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify, type SaveFile } from '../../src/core/save.js'
import type { GameState } from '../../src/core/types.js'
import { p15Rows } from './p15-roots.js'
import { CAPTURE_DIRECTORY, captureName, CAPTURE_WEEKS } from './p15c2-route-l.js'

export const B = LEGACY_BOUNDARY_WEEK // 6240 = 2040 · Week 1, derived from the calendar (Wave 1)
export const STEP: number = 45 // Frozen P15 introduction, independent of the current writer.

// BUDGETS (1359-F2 item 2; 1359-D item 2). vitest 2.1.9 runs a synchronous body before it arms its timer
// (@vitest/runner `withTimeout` races the timer against `fn()` after `fn()` returns), so a timeout
// argument cannot fire on these leaves. Each budgeted leaf times its own body and asserts the elapsed
// time. A leaf's budget covers the memoized builds it pays for when it runs first or alone.
// MEASURED by 1359-X2 (single-file runs on a quiet lane, Node v22.23.2) and SET by 1359-F4. The rule: each
// budget is about six times the slowest single-file time of its class, rounded up to a round number.
// Full-suite load gives about four times (1353-F3 measured up to 3.7 times for the Wave R guard); the
// pinned Node v20.20.2 gives about 1.4 times (1344-J3 item 9: v22.23.2 ran at a median 0.67-0.75 of
// v20.20.2 durations). The slowest measured leaf of each class stands above its number.
// Route L to 6241 (6,188 headless ticks, then 53 industry ticks). Slowest: the control, 9,095 ms (route build
// 3,111.5 + 5,563.7); a route leaf run alone pays the route and its body, about 13.4 s (`legacy-determinism`).
export const ROUTE_MS = 90_000
// Route L's 520 post-freeze industry ticks to 6760. Measured: `extension520Ms` 13,707.6 ms.
export const EXTENSION_MS = 90_000
// Route plus extension, 180,000 ms. Slowest: `legacy-adapter-only-at-boundary`, 13,879 ms with the route
// memoized, about 23 s alone.
export const POST_FREEZE_MS = ROUTE_MS + EXTENSION_MS
// The 6.7 MB genuine save parsed, migrated, frozen, validated a dozen times. Slowest:
// `legacy-migration-empty-root-genuine-save38`, 17,259 ms.
export const FIXTURE_MS = 120_000

/** Times the leaf's own body against its budget (1359-F2 item 2). */
export function budgeted(budgetMs: number, body: () => void): () => void {
  return () => {
    const started = performance.now()
    body()
    const ms = performance.now() - started
    expect(ms, `elapsed ${Math.round(ms)} ms against the ${budgetMs} ms budget`).toBeLessThanOrEqual(budgetMs)
  }
}

/** The three sibling roots and the Legacy domain each feeds (1355-A, 1356-A, 1357-A). */
export const P15_SIBLINGS = [['powerRanking', 'powerRanking'], ['corporateCondition', 'corporateCondition'], ['sharedMarket', 'marketAssessments']] as const

// ── the persisted shapes these leaves read (1359-A §5; 1355-F2 items 1-3) ─────────
export type Ref = { domainId: string; id: string }
export type Archetype = {
  archetypeId: string; outcome: string; limitedBy: string[]; qualifyingCount: number; contraryCount: number
  qualifying: Ref[]; contrary: Ref[]
}
export type Lens = { lensId: string; status: string; counts: Record<string, number>; refs: Ref[] }
export type Source = { domainId: string; highWatermark: number; recordedFromWeek: number | null; status: string }
export type ManifestStudio = { studioId: string; standingAtBoundary: Record<string, number>; archetypes: Archetype[]; lenses: Lens[] }
export type Official = {
  kind: string; definition: string; boundaryWeek: number; postFinaleMode: string | null; sources: Source[]
  studios: ManifestStudio[]; legacySnapshotId: string; p15DomainSequence: number; phaseId: string
  phaseOrdinal: number; phaseOrderVersion: number
}
export type LegacyRoot = { version: number; recordedFromWeek: number; official: Official | null; endOfRun: unknown }
export type Sequence = { version: number; next: number }
export type Envelope = { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
export type DefinitionEntry = {
  boundaryWeek: number; postFinaleMode: string; archetypeIds: readonly string[]; lensIds: readonly string[]
  lensCountKeys: Record<string, readonly string[]>; bounds: Record<string, number>; domainIds: readonly string[]
  thresholds: Record<string, number>
}

export const canon = (value: unknown): string => stableStringify(value)
export const rawOf = (state: GameState): Record<string, unknown> => state as unknown as Record<string, unknown>
export const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')

export function memo<T>(build: () => T): () => T {
  let value: { readonly v: T } | undefined
  let failure: { readonly e: unknown } | undefined
  return () => {
    if (failure !== undefined) throw failure.e
    if (value === undefined) {
      try {
        value = { v: build() }
      } catch (error) {
        failure = { e: error }
        throw error
      }
    }
    return value.v
  }
}

export function thrownMessage(run: () => unknown): string {
  try {
    run()
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
  throw new Error('expected a refusal, but the call returned')
}

/** The full live validator refuses `state`, and its message names every token. */
export function refuses(state: GameState, ...tokens: (string | RegExp)[]): void {
  const message = thrownMessage(() => makeSave(state))
  for (const token of tokens) {
    if (typeof token === 'string') expect(message, `the refusal names ${token}`).toContain(token)
    else expect(message, `the refusal matches ${String(token)}`).toMatch(token)
  }
}

// ── the Wave 2 surface, resolved per leaf (RED today, by name) ────────────────
const wave2 = legacyModule as unknown as Record<string, unknown>
function wave2Fn<T>(name: string): T {
  const fn = wave2[name]
  if (typeof fn !== 'function') {
    throw new Error(`RED: src/core/campaignLegacy.ts does not export a function named '${name}' (1359-A §3-§5)`)
  }
  return fn as unknown as T
}
type FactsFn = (state: GameState, boundaryWeek: number) => LegacyFacts
type StepFn = (state: GameState) => GameState
export const factsFn = (): FactsFn => wave2Fn<FactsFn>('legacyFactsFromState')
export const stepFn = (): StepFn => wave2Fn<StepFn>('freezeCampaignLegacyWeek')
export function definitionsTable(): Record<string, DefinitionEntry> {
  const table = wave2.LEGACY_DEFINITIONS
  if (table === null || typeof table !== 'object') {
    throw new Error('RED: src/core/campaignLegacy.ts does not export LEGACY_DEFINITIONS (1359-A §5.1 era versioning)')
  }
  return table as Record<string, DefinitionEntry>
}

export function legacyOf(state: GameState): LegacyRoot {
  const root = rawOf(state).campaignLegacy
  if (root === undefined) throw new Error('RED: the state carries no campaignLegacy root (1359-A §5: a top-level GameState key)')
  return root as LegacyRoot
}
export function sequenceOf(state: GameState): Sequence {
  const root = rawOf(state).p15Sequence
  if (root === undefined) throw new Error('RED: the state carries no p15Sequence root (1355-F2 item 1)')
  return root as Sequence
}
export function officialOf(state: GameState): Official {
  const official = legacyOf(state).official
  if (official === null) throw new Error('premise: the state holds no official 2040 Legacy')
  return official
}
export function withRoot(state: GameState, key: string, value: unknown): GameState {
  const copy: Record<string, unknown> = { ...rawOf(state) }
  if (value === undefined) delete copy[key]
  else copy[key] = value
  return copy as unknown as GameState
}
const STAMP_KEYS = ['legacySnapshotId', 'p15DomainSequence', 'phaseId', 'phaseOrdinal', 'phaseOrderVersion'] as const
export function withoutStamp(official: Official): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...official }
  for (const key of STAMP_KEYS) delete copy[key]
  return copy
}
export function tamper(state: GameState, edit: (official: Official) => void): GameState {
  const root = structuredClone(legacyOf(state))
  if (root.official === null) throw new Error('premise: no official manifest to tamper')
  edit(root.official)
  return withRoot(state, 'campaignLegacy', root)
}
export const sourceOf = (official: Official, domainId: string): Source => {
  const source = official.sources.find((row) => row.domainId === domainId)
  if (source === undefined) throw new Error(`premise: the manifest has no ${domainId} source`)
  return source
}
export const lensOf = (studio: ManifestStudio, lensId: string): Lens => {
  const lens = studio.lenses.find((row) => row.lensId === lensId)
  if (lens === undefined) throw new Error(`premise: studio ${studio.studioId} has no ${lensId} lens`)
  return lens
}

// ── P15 rows, through the shared walk of tests/helpers/p15-roots.ts ───────────
/** P15 rows in `after` the allocator handed out since `before` (1355-F2 item 1), over `P15_ROOTS`. */
export const newRows = (before: GameState, after: GameState): number =>
  p15Rows(after).filter((row) => row.p15DomainSequence >= sequenceOf(before).next).length
/** A sibling root's own P15 rows, read through the shared walk (no guessed paths). */
export type SiblingRow = { p15DomainSequence: number; week?: number; id?: string; eventId?: string }
export const siblingRows = (state: GameState, key: string): SiblingRow[] => p15Rows(state, [key]) as SiblingRow[]
export function requireRoot(state: GameState, key: string, why: string): void {
  if (rawOf(state)[key] === undefined) {
    throw new Error(`SIBLING PENDING: the ${key} root is not in this tree; ${why} (1359-A §10 item 3)`)
  }
}
export function requireSiblings(state: GameState, why: string): void {
  if (P15_SIBLINGS.every(([key]) => rawOf(state)[key] === undefined)) {
    throw new Error(`SIBLING PENDING: no P15 sibling root (powerRanking, corporateCondition, sharedMarket) is in this tree; ${why} (1359-A §10 item 3)`)
  }
}

// ── genuine captures ─────────────────────────────────────────────────────────
const EVIDENCE = '../../docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
const GENUINE_6240 = {
  path: '1052-c3-endurance-A-observer-fixed/authority-6240.json', bytes: 6_720_108,
  sha256: 'c9bfb1428cf27dad13c26b6f135f3cd3ee00b9303c45076e97abecb357c8aab1',
} as const
/** G6240: the genuine Save38 at week 6240 of the 1052 active endurance run, pinned by bytes and sha256. */
export const genuineSave38 = memo((): Envelope => {
  const raw = readFileSync(new URL(EVIDENCE + GENUINE_6240.path, import.meta.url))
  expect(raw.byteLength).toBe(GENUINE_6240.bytes)
  expect(sha256(raw)).toBe(GENUINE_6240.sha256)
  const save = importSave(raw.toString('utf8')) as unknown as Envelope
  expect(save.saveVersion).toBe(38)
  expect(save.state.market.tick).toBe(B)
  return save
})
export const genuine6240 = memo((): GameState => migrateToLive(genuineSave38()).state as GameState)

/** G6240F: the one named forgery (recordedFromWeek 0), the step, then the full validator. */
export const genuineFrozen = memo((): GameState => {
  const step = stepFn()
  const base = genuine6240()
  const root = legacyOf(base)
  // C4's rule on a genuine save: migrated at week 6240, it records from its own week, unfrozen.
  expect(root.recordedFromWeek).toBe(B)
  expect(root.official).toBeNull()
  const frozen = step(withRoot(base, 'campaignLegacy', { ...root, recordedFromWeek: 0 }))
  makeSave(frozen) // 1359-A §8: a forged state passes the full validator before any leaf reads it
  return frozen
})

/** Route L's genuine captures below the Legacy's save step (1359-F2 item 5), minted by 1359-P at the last
 * writer below that step with sha256 provenance (1355-F Amendment 3). The step may be shared with the
 * siblings or separate (1359-A §10 item 4); either way the captures are Save(STEP − 1). */
const CAPTURES = new URL(`../../${CAPTURE_DIRECTORY}`, import.meta.url)
type CaptureManifest = {
  saveVersion: number
  inputs: { name: string; week: number; gzip: { bytes: number; sha256: string }; decoded: { bytes: number; sha256: string } }[]
}
export const belowStepCaptures = memo((): Envelope[] => {
  const manifestUrl = new URL('MANIFEST.json', CAPTURES)
  if (!existsSync(manifestUrl)) {
    throw new Error(`FIXTURE PENDING: ${CAPTURE_DIRECTORY}MANIFEST.json does not exist; the parent mints it with 1359-P `
      + `at the last writer below the Legacy's save step (route L at weeks ${CAPTURE_WEEKS.join(' and ')})`)
  }
  const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8')) as CaptureManifest
  if (manifest.saveVersion === STEP) {
    throw new Error(`RED: the route L captures are Save${STEP}, the live version: the Legacy's save step has not landed above them (1359-A §5.2)`)
  }
  expect(manifest.saveVersion).toBe(STEP - 1)
  expect(manifest.inputs.map((input) => input.name).sort()).toEqual(CAPTURE_WEEKS.map(captureName).sort())
  return manifest.inputs.map((input) => {
    const gz = readFileSync(new URL(`${input.name}.json.gz`, CAPTURES))
    expect(gz.byteLength).toBe(input.gzip.bytes)
    expect(sha256(gz)).toBe(input.gzip.sha256)
    const raw = gunzipSync(gz).toString('utf8')
    expect(Buffer.byteLength(raw, 'utf8')).toBe(input.decoded.bytes)
    expect(sha256(raw)).toBe(input.decoded.sha256)
    const capture = importSave(raw) as unknown as Envelope
    expect(capture.saveVersion).toBe(STEP - 1)
    expect(capture.state.market.tick).toBe(input.week)
    return capture
  })
})
export function captureAt(accept: (state: GameState) => boolean, what: string): Envelope {
  const capture = belowStepCaptures().find((row) => row.state.hollywood !== null && accept(row.state))
  if (capture === undefined) throw new Error(`premise: no route L capture ${what}`)
  return capture
}

// ── the frozen P15 introduction step ──────────────────────────────────────
function saveFn(name: string): (save: unknown) => Envelope {
  const fn = (saveModule as unknown as Record<string, unknown>)[name]
  if (typeof fn !== 'function') throw new Error(`RED: save.ts does not export ${name} (the Legacy's save step is ${STEP})`)
  return fn as (save: unknown) => Envelope
}
// Public migration admits its real input. For current saves it must refuse any
// nonempty recovery authority before the frozen P15 converter can run.
export const migrateIntoStep = (save: unknown): Envelope => saveFn(`migrateToV${STEP}`)(save)
export function currentFromStep(save: Envelope) {
  const before = stableStringify(save)
  const current = migrateToLive(save)
  expect(current.saveVersion).toBe(saveModule.LIVE_SAVE_VERSION)
  const bytes = exportSave(current)
  expect(exportSave(migrateToLive(current)), 'current migration remains a no-op').toBe(bytes)
  expect(exportSave(current), 'current reader is neutral').toBe(bytes)
  expect(stableStringify(save), 'the historical input remains unchanged').toBe(before)
  return current
}
export const convertIntoStep = (save: unknown): Envelope => saveFn(`convertV${STEP - 1}ToV${STEP}`)(save)
export const convertOutOfStep = (save: unknown): Envelope => saveFn(`convertV${STEP}ToV${STEP - 1}`)(migrateIntoStep(save))
export const migrateBelowStep = (save: unknown): Envelope => saveFn(`migrateToV${STEP - 1}`)(save)
export const asSaveFile = (save: Envelope): SaveFile => save as unknown as SaveFile
export const DOWNGRADE_REFUSAL = /cannot downgrade or discard the frozen 2040 Legacy/
/** The marker rule's refusal names the field itself, never a path below it (C6, B3). */
export const MARKER = /campaignLegacy\.official(?![.[\w])/
