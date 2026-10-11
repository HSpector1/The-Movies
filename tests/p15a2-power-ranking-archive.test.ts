// ── P15A.2 Wave 2 slice 2a — the quarterly Power Ranking archive, RED tests (record 1356-C; r2 1356-C2; r3 1356-C3) ──
//
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/):
// 1356-A §3 (adapter), §4 (tick step), §5 (root, validation, era versioning, migration),
// §8 RED items 1-8, 11-16; 1356-F (Amendment 2 adds `rank-validate-cadence-boundary`;
// Amendment 1 as replaced by its "Later ruling"); 1355-F2 items 1-6 (the one persisted P15
// allocator `p15Sequence`, `p15DomainSequence`, the phase triple and `src/core/p15Phases.ts`,
// record id `power-ranking-<p15DomainSequence>`); 1355-F Amendments 3-4 (the save step is
// allocated at execution; a genuine capture of the version below the step); 1351-F (authored
// films count in no lane). RED 9 and RED 10 live in
// tests/p15a2-power-ranking-archive-isolation.test.ts (they mock the step); RED 17 lives in
// tests/p15a2-power-ranking-archive-harness.test.ts (the 6,240-week campaign).
//
// RED MECHANISM. `src/core/powerRankingArchive.ts` and `src/core/p15Phases.ts` do not exist at
// BASE ff05430d, and no live state carries the `powerRanking` or `p15Sequence` root. Each leaf
// imports the new modules dynamically inside its own body (the 1346-C/1351-C precedent), so a
// missing module or export fails that leaf alone with its own message. Root reads go through
// `archiveOf`/`sequenceOf`, which throw a named RED message when the root is absent. Leaves
// marked CONTROL pin behaviour that exists today and must pass both today and after production.
//
// SAVE VERSION. The archive arrived at Save45. That introduction step stays
// frozen while current writers and strict validators use LIVE_SAVE_VERSION.
// Current-to-historical paths first use the public empty-only recovery downgrade;
// no recovery state is removed by this test's own object projections.

// SIBLING ROOTS (1356-F2 item 3). tests/helpers/p15-roots.ts holds the one list of P15 root keys,
// `P15_ROOTS`; each later P15 RED adds its key there at its landing. The leaves that read the
// allocator, strip the P15 roots or renumber a tamper hold whatever rows sibling roots carry.
// DECLARED, re-pinned at a sibling landing:
//   - Historical ARCHIVE_STEP is now frozen at 45 (1363-N group 4).
//   - RED 9 `rank-step-final-facts` (isolation file) and `rank-step-record-is-law-snapshot`: both
//     read the ranking step as tick()'s last expression, and 1356-A §4 runs the P15B condition step
//     (a rival's loan principal at W, 1357-A §5) and the P15C freeze after it. The patch that lands
//     a later end-of-tick step re-pins them to the state the ranking step returns.
//   - `rank-root-downgrade-round-trip-claims-less`, `rank-root-downgrade-recorded-quarter-refuses`
//     and `rank-root-downgrade-frozen-builders-refuse`: a sibling root holding rows in the ticked
//     state refuses the same downgrade, and may name itself first.
//   - `rank-root-migration-empty` and `rank-root-migration-genuine-below-step-capture`: "nothing
//     else moves at the step" holds while a sibling step adds only `P15_ROOTS` keys; P15B's step
//     also adds zero loan movements to every rival period (1357-A §4.2).
//
// COMPARISONS. States and saves are compared at the serialization level (`stableStringify`,
// `exportSave`), never with toEqual on objects (1344-X6). No RNG is drawn by this file; every
// campaign is a seeded natural campaign of the live engine.
//
// TIMEOUTS (1356-F5). `HEAVY` and `MEDIUM` are vitest timeouts, not budgets, and neither can stop a
// synchronous body. vitest 2.1.9 arms a test's timer only after the body's synchronous part returns
// (@vitest/runner `withTimeout`), and a timer never interrupts running code, so a campaign inside a
// leaf's body runs to its end (1356-D3). No leaf in this file declares a budget.

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { weeklyBurn, weeklyFacilityOperatingCost, weeklyOverhead } from '../src/core/economyView.js'
import { beginFounding, beginFoundingHistoricalControl, FOUNDING_MINIMUMS, weeklyPayroll } from '../src/core/employment.js'
import { initializeHollywood, rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { commitPlacement } from '../src/core/placement.js'
import {
  computePowerRanking,
  isPowerRankingWeek,
  POWER_RANKING_DEFINITION,
  type PowerRankingRow,
  type RankingFilm,
  type RankingInput,
} from '../src/core/powerRanking.js'
import * as saveModule from '../src/core/save.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { weeklyResearchSpend } from '../src/core/technology.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { generateWorld } from '../src/core/worldgen.js'
import type { AuthoredFilm, LiveIndustryFilm } from '../src/core/hollywoodTypes.js'
import type { FilmResult, GameState, TheatricalRun } from '../src/core/types.js'
import { p13aGeneratedStudio, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import { migrated } from './helpers/p14c3-fixtures.js'
import { P15_ROOTS, p15Rows, stripP15 } from './helpers/p15-roots.js'
import { genuineV42Week100, genuineV42Week130 } from './p14d1-rival-shelving-fixtures.js'

// ── the new modules, loaded per leaf ────────────────────────────────────────
async function archiveFn<T>(name: string): Promise<T> {
  const mod = (await import('../src/core/powerRankingArchive.js')) as unknown as Record<string, unknown>
  const fn = mod[name]
  if (typeof fn !== 'function') {
    throw new Error(`RED: src/core/powerRankingArchive.ts does not export a function named '${name}' (got ${typeof fn}); 1356-A §3 puts the adapter, the fixed cost, the step and the validator in this one module`)
  }
  return fn as T
}
type InputFn = (state: GameState) => RankingInput
type FixedCostFn = (state: GameState, studioId: string) => number
type StepFn = (state: GameState) => GameState
type PhaseTable = Readonly<Record<number, readonly { readonly phaseId: string; readonly phaseOrdinal: number }[]>>
async function phaseTableV1(): Promise<readonly { readonly phaseId: string; readonly phaseOrdinal: number }[]> {
  const mod = (await import('../src/core/p15Phases.js')) as unknown as Record<string, unknown>
  const tables = mod.P15_PHASE_TABLES as PhaseTable | undefined
  if (tables === undefined || tables[1] === undefined) {
    throw new Error("RED: src/core/p15Phases.ts does not export P15_PHASE_TABLES with a version-1 table (1355-F2 item 3)")
  }
  return tables[1]
}

// ── the archive and allocator as persisted (1356-A §5 + 1355-F2 items 2-5) ──
type Band = 'inTheRed' | 'strained' | 'stable' | 'thriving'
type ArchiveRow = {
  studioId: string; ranked: boolean; rank: number | null; filmsTenths: number; releases: number
  releasesTenths: number; countedFilmIds: string[]; band: Band
}
type ArchiveRecord = {
  id: string; p15DomainSequence: number; phaseId: string; phaseOrdinal: number; phaseOrderVersion: number
  week: number; definitionVersion: string; available: boolean; windowStartWeek: number; rows: ArchiveRow[]
}
type Archive = { version: number; recordedFromWeek: number; snapshots: ArchiveRecord[] }
type Sequence = { version: number; next: number }
type P15Roots = { powerRanking?: Archive; p15Sequence?: Sequence }
type Envelope = { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }

const ROOT_KEYS = ['recordedFromWeek', 'snapshots', 'version']
const RECORD_KEYS = ['available', 'definitionVersion', 'id', 'p15DomainSequence', 'phaseId', 'phaseOrderVersion',
  'phaseOrdinal', 'rows', 'week', 'windowStartWeek']
const ROW_KEYS = ['band', 'countedFilmIds', 'filmsTenths', 'rank', 'ranked', 'releases', 'releasesTenths', 'studioId']
const BANDS: readonly Band[] = ['inTheRed', 'strained', 'stable', 'thriving']
const RANKING_PHASE = 'p15a2.rankingRecord'
const QUARTER = 13 // 1350-A §3 cadence, `isPowerRankingWeek` (powerRanking.ts): week % 13 === 0
const WINDOW = TUNING.POWER_RANKING_WINDOW_WEEKS
const RUN_WEEKS = TUNING.THEATRICAL_WEEKS

function archiveOf(state: GameState): Archive {
  const archive = (state as unknown as P15Roots).powerRanking
  if (archive === undefined) {
    throw new Error(`RED: the state at week ${state.market.tick} has no top-level powerRanking root (1356-A §5)`)
  }
  return archive
}
function sequenceOf(state: GameState): Sequence {
  const sequence = (state as unknown as P15Roots).p15Sequence
  if (sequence === undefined) {
    throw new Error(`RED: the state at week ${state.market.tick} has no top-level p15Sequence root (1355-F2 item 1)`)
  }
  return sequence
}
function snapshotsLength(state: GameState): number {
  return (state as unknown as P15Roots).powerRanking?.snapshots.length ?? -1
}
function nextOf(state: GameState): number {
  return (state as unknown as P15Roots).p15Sequence?.next ?? -1
}
const sortedKeys = (value: object): string[] => Object.keys(value).sort()
const quartersIn = (fromExclusive: number, through: number): number[] => {
  const weeks: number[] = []
  for (let week = fromExclusive + 1; week <= through; week++) if (week % QUARTER === 0) weeks.push(week)
  return weeks
}
const lawRow = (row: PowerRankingRow): ArchiveRow => ({
  studioId: row.studioId, ranked: row.ranked, rank: row.rank, filmsTenths: row.filmsTenths, releases: row.releases,
  releasesTenths: row.releasesTenths, countedFilmIds: row.countedFilmIds, band: row.band,
})
const idOf = (row: object): string => {
  const keyed = row as { filmId?: string; studioId?: string }
  return keyed.filmId ?? keyed.studioId ?? ''
}
/** Films by filmId, studios by studioId: the adapter's order is not part of its contract. */
const byId = <T extends object>(rows: readonly T[]): T[] =>
  [...rows].sort((a, b) => (idOf(a) < idOf(b) ? -1 : idOf(a) > idOf(b) ? 1 : 0))

// ── the archive's frozen P15 introduction step ───────────────
const ARCHIVE_STEP: number = 45 // Frozen P15 introduction, independent of the current writer.
type SaveFn = (save: unknown) => Envelope
function saveFn(name: string): SaveFn {
  const fn = (saveModule as unknown as Record<string, unknown>)[name]
  if (typeof fn !== 'function') throw new Error(`RED: save.ts does not export ${name} (the archive's save step is ${ARCHIVE_STEP})`)
  return fn as SaveFn
}
const validateCurrent = (save: unknown): Envelope => saveFn(`validateSaveV${saveModule.LIVE_SAVE_VERSION}`)(save)
// Public migration admits its real input. For current saves it must refuse any
// nonempty recovery authority before the frozen P15 converter can run.
const migrateIntoStep = (save: unknown): Envelope => saveFn(`migrateToV${ARCHIVE_STEP}`)(save)
function currentFromStep(save: Envelope) {
  const before = stableStringify(save)
  const current = migrateToLive(save)
  expect(current.saveVersion).toBe(saveModule.LIVE_SAVE_VERSION)
  const bytes = exportSave(current)
  expect(exportSave(migrateToLive(current)), 'current migration remains a no-op').toBe(bytes)
  expect(exportSave(current), 'current reader is neutral').toBe(bytes)
  expect(stableStringify(save), 'the historical input remains unchanged').toBe(before)
  return current
}
const convertIntoStep = (save: unknown): Envelope => saveFn(`convertV${ARCHIVE_STEP - 1}ToV${ARCHIVE_STEP}`)(save)
const convertOutOfStep = (save: unknown): Envelope => saveFn(`convertV${ARCHIVE_STEP}ToV${ARCHIVE_STEP - 1}`)(migrateIntoStep(save))
const migrateBelowStep = (save: unknown): Envelope => saveFn(`migrateToV${ARCHIVE_STEP - 1}`)(save)
const liveSave = (state: GameState): Envelope => makeSave(state) as unknown as Envelope
const DOWNGRADE_REFUSAL = /cannot downgrade or discard a recorded Power Ranking quarter/

// ── campaigns ────────────────────────────────────────────────────────────────
const HEAVY = 900_000 // leaves that may advance the memoized campaign to week 572
const MEDIUM = 300_000

/** The memoized fresh natural campaign: `p13aGeneratedStudio()` (default seed, the seed of the
 * genuine V42 fixtures), natural ticks only. It advances lazily to the latest checkpoint a leaf
 * asks for and keeps a clone at each checkpoint plus the archive length and `p15Sequence.next`
 * after every produced week. */
const CHECKPOINTS = new Set([13, 52, 130, 520, 572])
type Memo = { cursor: GameState; saved: Map<number, GameState>; counts: number[]; nexts: number[] }
let memo: Memo | null = null
function campaign(): Memo {
  if (memo === null) {
    const start = p13aGeneratedStudio()
    memo = { cursor: start, saved: new Map(), counts: [snapshotsLength(start)], nexts: [nextOf(start)] }
  }
  return memo
}
function fresh(week: number): GameState {
  const m = campaign()
  const hit = m.saved.get(week)
  if (hit !== undefined) return hit
  if (!CHECKPOINTS.has(week) || week < m.cursor.market.tick) {
    throw new Error(`campaign memo: week ${week} is not a checkpoint at or after week ${m.cursor.market.tick}`)
  }
  while (m.cursor.market.tick < week) {
    m.cursor = tick(m.cursor)
    const produced = m.cursor.market.tick
    m.counts[produced] = snapshotsLength(m.cursor)
    m.nexts[produced] = nextOf(m.cursor)
    if (CHECKPOINTS.has(produced)) m.saved.set(produced, structuredClone(m.cursor))
  }
  return m.saved.get(week)!
}

let genuine130: GameState | null = null
/** The genuine Save42 week-130 capture (1344-P, sha-pinned by the shelving loader), lifted to live. */
function genuineLive130(): GameState {
  genuine130 ??= migrateToLive(genuineV42Week130()).state as GameState
  return structuredClone(genuine130)
}

/** Founds the studio on a headless world at its current week, then lets the industry in at that week
 * (1356-F3 item 1). `beginFoundingHistoricalControl` opens the founding draft with no industry
 * (employment.ts:572-576); `signContract` hires the first FOUNDING_MINIMUMS[role] applicants of each
 * required role, the recruitment fund paying the bonuses off the ledger (actions.ts:2560-2580);
 * `foundStudio` closes the draft (actions.ts:1201-1224); `initializeHollywood` opens the industry,
 * origin 'migration' at this week, and observes those contracts as existing player contracts
 * (hollywood.ts:185; industryEmployment.ts:29). This is the world a legacy save of a founded studio
 * gets when the industry arrives. `beginFounding` then signing cannot reach a valid world after week 0:
 * left open, its draft refuses every technology row from the first rival shooting week
 * (technology.ts:897; 1356-X F-1); closed by signings made after the industry exists, each contract
 * needs a ledger signing payment the fund never writes (hollywoodValidation.ts:568-569 exempts only
 * a fresh origin's week-0 signings). */
function foundMidGame(headless: GameState): GameState {
  const draft = beginFoundingHistoricalControl(headless)
  const applicants = draft.founding!.applicantIds.map((id) => draft.talent.find((t) => t.id === id)!)
  let state = draft
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const person of applicants.filter((t) => t.role === role).slice(0, FOUNDING_MINIMUMS[role])) {
      state = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks: TUNING.CONTRACT_MAX_WEEKS }])
    }
  }
  return initializeHollywood(applyActions(state, [{ kind: 'foundStudio' }]), 'migration')
}

/** A generated world ticked headless to `foundAt`, founded there with the industry entering at that
 * week (`foundMidGame`, origin 'migration'; 1356-F3), then ticked to `through`. */
function foundedAt(seed: string, foundAt: number, through: number): GameState {
  let state = generateWorld(seed)
  while (state.market.tick < foundAt) state = tick(state)
  state = foundMidGame(state)
  while (state.market.tick < through) state = tick(state)
  return state
}

let research: { ready: GameState; researching: GameState } | null = null
/** P13A's genuine research route (src/harness/p13a/fixtures.ts): a Laboratory, a seated
 * Scientist at week 260, then `beginResearch` at 10,000 a week with no tick between. */
function researchRoute(): { ready: GameState; researching: GameState } {
  if (research === null) {
    const ready = p13aResearchReady()
    const projectId = ready.technology.projects[0]!.id
    research = { ready, researching: applyActions(ready, [{ kind: 'beginResearch', projectId, budgetPerWeek: 10_000 }]) }
  }
  return research
}

/** A rival's researchSpend movements to date: negative, and lower after each week it books one. */
function researchSpent(state: GameState, studioId: string): number {
  const business = state.hollywood!.businesses.find((b) => b.studioId === studioId)
  return business === undefined ? 0 : business.account.periods.reduce((sum, period) => sum + period.movements.researchSpend, 0)
}
type ResearchWindow = { before: GameState; at: GameState; payer: string }
let researchWindow: ResearchWindow | null = null
/** The rival research window (1356-F2 item 2). No leaf measures rival research on the memo's default
 * seed, so this memo follows the measured S8 research route (tests/bridge-p13b-s8-rivals.test.ts
 * header; the route of the genuine week-280 Save40 fixture in tests/p14r3-save-v41.test.ts): seed
 * 'p13b-s8-bridge-probe-01', a player Research Laboratory committed at week 0, natural ticks only.
 * Measured there (P13B-S8, re-measured at P14A.1 T2): rival r01 researches synchronized sound from
 * week 265 and completes it at 276. The memo stops at the first week W after
 * that technology's researchableWeek at which a rival booked researchSpend in the tick producing W
 * and still holds an active project, and searches no further than the memo's last checkpoint. */
function rivalResearchWindow(): ResearchWindow {
  if (researchWindow !== null) return researchWindow
  const opens = technologyEntry('synchronized-sound').researchableWeek
  const last = Math.max(...CHECKPOINTS)
  let state = commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-probe-01'), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
  for (;;) {
    if (state.market.tick >= last) throw new Error(`premise: no rival booked researchSpend in weeks ${opens + 1}-${last} of the S8 research route`)
    const before = state
    const next = tick(before)
    const payer = next.market.tick <= opens ? undefined : next.hollywood!.businesses.find((b) =>
      researchSpent(next, b.studioId) < researchSpent(before, b.studioId) &&
      next.technology.projects.some((p) => p.studioId === b.studioId && p.status === 'active'))
    if (payer !== undefined) return (researchWindow = { before, at: next, payer: payer.studioId })
    state = next
  }
}

// ── synthetic player releases on a genuine state (adapter leaves only) ───────
function liveFilms(state: GameState): LiveIndustryFilm[] {
  return state.hollywood!.films.filter((f): f is LiveIndustryFilm => f.provenance === 'simulation/v1')
}
function playerRelease(donor: FilmResult, productionId: string, releaseTick: number, criticScore: number, totalGross: number): FilmResult {
  return { ...structuredClone(donor), productionId, releaseTick, criticScore, boxOffice: { opening: Math.round(totalGross / 3), total: totalGross } }
}
/** A D-12 run as tick.ts:786-796 leaves it at `week`: one payment per produced week from the release tick. */
function runAt(productionId: string, conceptId: string, releaseTick: number, week: number): TheatricalRun {
  const weekIndex = Math.min(RUN_WEEKS, week - releaseTick)
  return {
    productionId, conceptId, releaseTick, totalWeeks: RUN_WEEKS, weekIndex, weeklyGross: new Array<number>(RUN_WEEKS).fill(0),
    studioShare: 0.5, cumulativeGrossPaid: 0, cumulativeStudioRevenuePaid: 0, economyModelVersion: 1,
    status: weekIndex >= RUN_WEEKS ? 'completed' : 'active',
  }
}
/** A migrated V3 release (economy.ts legacyTheatricalRun): one week, paid once, legacyCompleted. */
function legacyRun(productionId: string, conceptId: string, releaseTick: number): TheatricalRun {
  return {
    productionId, conceptId, releaseTick, totalWeeks: 1, weekIndex: 1, weeklyGross: [0], studioShare: 1,
    cumulativeGrossPaid: 0, cumulativeStudioRevenuePaid: 0, economyModelVersion: 0, status: 'legacyCompleted',
  }
}
function inputFilm(input: RankingInput, filmId: string): RankingFilm {
  const film = input.films.find((f) => f.filmId === filmId)
  if (film === undefined) throw new Error(`the adapter passed no film ${filmId}`)
  return film
}
function lawRowFor(input: RankingInput, studioId: string): PowerRankingRow {
  const row = computePowerRanking(input).rows.find((r) => r.studioId === studioId)
  if (row === undefined) throw new Error(`the law returned no row for ${studioId}`)
  return row
}

// ═══════════════════════════════════════════════════════════════════════════
// A. module surface and the shared P15 phase table
// ═══════════════════════════════════════════════════════════════════════════
describe('p15a2 archive: module surface (1356-A §3; 1355-F2 item 3)', () => {
  it('rank-archive-module-exports', async () => {
    for (const name of ['powerRankingInput', 'studioWeeklyFixedCost', 'recordPowerRankingQuarter', 'validatePowerRankingArchive']) {
      expect(typeof (await archiveFn<unknown>(name))).toBe('function')
    }
  })

  it('p15-phase-table-v1', async () => {
    const mod = (await import('../src/core/p15Phases.js')) as unknown as Record<string, unknown>
    expect(mod.P15_PHASE_ORDER_VERSION).toBe(1)
    const v1 = await phaseTableV1()
    // 1355-F2 item 3: one documented domain-local table, version 1, ordinals ascending in this order.
    expect(v1.map((entry) => entry.phaseId)).toEqual(['p15a1.marketBatch', 'p15a2.rankingRecord', 'p15b.condition', 'p15c.finale'])
    for (const entry of v1) expect(sortedKeys(entry)).toEqual(['phaseId', 'phaseOrdinal'])
    for (const [i, entry] of v1.entries()) {
      expect(Number.isSafeInteger(entry.phaseOrdinal)).toBe(true)
      if (i > 0) expect(entry.phaseOrdinal).toBeGreaterThan(v1[i - 1]!.phaseOrdinal)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// B. the adapter `powerRankingInput(state)` and the shared fixed cost (RED 1-7)
// ═══════════════════════════════════════════════════════════════════════════
describe('p15a2 archive: the state-to-facts adapter (1356-A §3; RED 1-4, 6-7)', () => {
  it('rank-adapter-player-films', async () => {
    const powerRankingInput = await archiveFn<InputFn>('powerRankingInput')
    const state = genuineLive130()
    const h = state.hollywood!
    const W = state.market.tick
    const donor = liveFilms(state)[0]!
    expect(state.studio.releasedFilms, 'premise: the idle player of the genuine capture has released nothing').toHaveLength(0)
    // Six player releases on the genuine state: one per run case of 1356-A §3's player rule, and two
    // runs whose status and weekIndex contradict the arithmetic (1356-F2 item 1). The adapter decides
    // by `releaseTick + totalWeeks <= W` alone, so a validator rebuilding a past record week years
    // later, when every run reads completed, gets the step's answer.
    state.studio.releasedFilms = [
      playerRelease(donor.result, 'pr-1356-ended', W - 30, 61, 4_000_000), // 6-week run, last payment long before W
      playerRelease(donor.result, 'pr-1356-running', W - 1, 55, 900_000), // released in the tick producing W
      playerRelease(donor.result, 'pr-1356-norun', W - 40, 70, 2_500_000), // unengaged release: paid once, no run
      playerRelease(donor.result, 'pr-1356-legacy', W - 50, 40, 700_000), // migrated V3 release
      playerRelease(donor.result, 'pr-1356-completed-running', W - 2, 58, 1_200_000), // completed, yet W−2 + 6 > W
      playerRelease(donor.result, 'pr-1356-active-ended', W - 30, 47, 1_500_000), // active, yet W−30 + 6 <= W
    ]
    state.theatricalRuns = [
      ...state.theatricalRuns,
      runAt('pr-1356-ended', donor.conceptId, W - 30, W),
      runAt('pr-1356-running', donor.conceptId, W - 1, W),
      legacyRun('pr-1356-legacy', donor.conceptId, W - 50),
      { ...runAt('pr-1356-completed-running', donor.conceptId, W - 2, W), weekIndex: RUN_WEEKS, status: 'completed' },
      { ...runAt('pr-1356-active-ended', donor.conceptId, W - 30, W), weekIndex: 0, status: 'active' },
    ]
    const input = powerRankingInput(state)
    // The law's input and nothing else: no player flag anywhere.
    expect(sortedKeys(input)).toEqual(['baseMarketValue', 'films', 'originWeek', 'studios', 'week'])
    for (const film of input.films) {
      expect(sortedKeys(film)).toEqual(['authoredPreCampaign', 'criticScore', 'filmId', 'releaseTick', 'runEndedByWeek', 'studioId', 'totalGross'])
    }
    const ended: Record<string, boolean> = {
      'pr-1356-ended': true, 'pr-1356-running': false, 'pr-1356-norun': true, 'pr-1356-legacy': true,
      'pr-1356-completed-running': false, 'pr-1356-active-ended': true,
    }
    const expected = state.studio.releasedFilms.map((f) => ({
      filmId: f.productionId, studioId: h.playerStudioId, releaseTick: f.releaseTick, runEndedByWeek: ended[f.productionId],
      criticScore: f.criticScore, totalGross: f.boxOffice.total, authoredPreCampaign: false,
    }))
    const playerFilms = input.films.filter((f) => f.studioId === h.playerStudioId)
    expect(stableStringify(byId(playerFilms))).toBe(stableStringify(byId(expected)))
    // The player's studio entry: `studio.cash`, its identity's entry week, the shared fixed cost.
    const player = input.studios.find((s) => s.studioId === h.playerStudioId)
    const identity = h.identities.find((s) => s.studioId === h.playerStudioId)!
    expect(stableStringify(player)).toBe(stableStringify({
      studioId: h.playerStudioId, enteredWeek: identity.enteredWeek, cash: state.studio.cash,
      weeklyFixedCost: weeklyBurn(state) - weeklyResearchSpend(state),
    }))
  }, MEDIUM)

  it('rank-adapter-field-mapping-rivals-and-cohort', async () => {
    const powerRankingInput = await archiveFn<InputFn>('powerRankingInput')
    const state = genuineLive130()
    const h = state.hollywood!
    const W = state.market.tick
    const input = powerRankingInput(state)
    expect(input.week).toBe(W)
    expect(input.originWeek).toBe(h.originWeek)
    expect(input.baseMarketValue).toBe(state.market.baseMarketValue)
    // Studios: identities entered by W (the chart's cohort rule, hollywoodValidation.ts:595).
    const notEntered = h.identities.filter((s) => s.enteredWeek === null).map((s) => s.studioId)
    expect(notEntered.length, 'premise: rows 5-9 have not entered by week 130').toBeGreaterThan(0)
    const expectedStudios = h.identities.filter((s) => s.enteredWeek !== null && s.enteredWeek <= W).map((s) => {
      const business = h.businesses.find((b) => b.studioId === s.studioId)
      return {
        studioId: s.studioId, enteredWeek: s.enteredWeek, cash: business === undefined ? state.studio.cash : business.account.cash,
        weeklyFixedCost: business === undefined ? weeklyBurn(state) - weeklyResearchSpend(state) : rivalWeeklyOperatingCost(business, h, W),
      }
    })
    expect(stableStringify(byId(input.studios))).toBe(stableStringify(byId(expectedStudios)))
    // Rival live films: facts from `result`, ended when settledWeek < W.
    const expectedLive = liveFilms(state).map((f) => ({
      filmId: f.filmId, studioId: f.studioId, releaseTick: f.result.releaseTick,
      runEndedByWeek: f.settledWeek !== null && f.settledWeek < W, criticScore: f.result.criticScore,
      totalGross: f.result.boxOffice.total, authoredPreCampaign: false,
    }))
    expect(expectedLive.length, 'premise: the rivals have released live films by 130').toBeGreaterThan(0)
    const passedLive = input.films.filter((f) => f.studioId !== h.playerStudioId && !f.authoredPreCampaign)
    expect(stableStringify(byId(passedLive))).toBe(stableStringify(byId(expectedLive)))
  }, MEDIUM)

  it('rank-adapter-run-end-parity', async () => {
    const powerRankingInput = await archiveFn<InputFn>('powerRankingInput')
    let state = migrateToLive(genuineV42Week100()).state as GameState
    // Natural ticks until a rival releases in the tick just run (hollywoodTick.ts:389: releaseTick W−1).
    let film: LiveIndustryFilm | undefined
    for (let guard = 0; guard < 60 && film === undefined; guard++) {
      state = tick(state)
      const produced = state.market.tick
      film = liveFilms(state).find((f) => f.result.releaseTick === produced - 1)
    }
    if (film === undefined) throw new Error('premise: no rival released within 60 natural weeks after week 100')
    const R = film.result.releaseTick
    const twin = 'pr-1356-twin'
    const seen: { week: number; rival: boolean; player: boolean }[] = []
    for (let k = 0; k < 8; k++) {
      // The player twin: same release week, same run length, run as the tick would leave it at W.
      const copy = structuredClone(state)
      copy.studio.releasedFilms = [...copy.studio.releasedFilms, playerRelease(film.result, twin, R, film.result.criticScore, film.result.boxOffice.total)]
      copy.theatricalRuns = [...copy.theatricalRuns, runAt(twin, film.conceptId, R, copy.market.tick)]
      const input = powerRankingInput(copy)
      const entry = { week: copy.market.tick, rival: inputFilm(input, film.filmId).runEndedByWeek, player: inputFilm(input, twin).runEndedByWeek }
      seen.push(entry)
      expect(entry.player, `week ${entry.week}: the player and rival rules disagree`).toBe(entry.rival)
      state = tick(state)
    }
    // Non-vacuous: both read running at R+5 (five payments) and ended at R+6 (the sixth was at R+5).
    expect(seen.find((s) => s.week === R + RUN_WEEKS - 1)).toEqual({ week: R + RUN_WEEKS - 1, rival: false, player: false })
    expect(seen.find((s) => s.week === R + RUN_WEEKS)).toEqual({ week: R + RUN_WEEKS, rival: true, player: true })
    // A no-run release and a legacyCompleted run read ended; an engaged run released at W−1 does not.
    const W = state.market.tick
    const copy = structuredClone(state)
    copy.studio.releasedFilms = [
      ...copy.studio.releasedFilms,
      playerRelease(film.result, 'pr-1356-norun', W - 1, 50, 1_000_000),
      playerRelease(film.result, 'pr-1356-legacy', W - 1, 50, 1_000_000),
      playerRelease(film.result, 'pr-1356-active', W - 1, 50, 1_000_000),
    ]
    copy.theatricalRuns = [...copy.theatricalRuns, legacyRun('pr-1356-legacy', film.conceptId, W - 1), runAt('pr-1356-active', film.conceptId, W - 1, W)]
    const input = powerRankingInput(copy)
    expect(inputFilm(input, 'pr-1356-norun').runEndedByWeek).toBe(true)
    expect(inputFilm(input, 'pr-1356-legacy').runEndedByWeek).toBe(true)
    expect(inputFilm(input, 'pr-1356-active').runEndedByWeek).toBe(false)
  }, MEDIUM)

  it('rank-adapter-authored', async () => {
    const powerRankingInput = await archiveFn<InputFn>('powerRankingInput')
    const state = genuineLive130()
    const W = state.market.tick
    const authored = state.hollywood!.films.filter((f): f is AuthoredFilm => f.provenance === 'authored-start/v1')
    expect(authored.length, 'premise: fresh-origin rivals carry authored films (hollywood.ts:263-267)').toBeGreaterThan(0)
    const input = powerRankingInput(state)
    for (const a of authored) {
      // The Bridge chronology tick (bridge/industry.ts:232): (year − 1920) × 52.
      expect(stableStringify(inputFilm(input, a.filmId))).toBe(stableStringify({
        filmId: a.filmId, studioId: a.studioId, releaseTick: (a.released.year - 1920) * 52, runEndedByWeek: true,
        criticScore: a.criticScore, totalGross: a.totalGross, authoredPreCampaign: true,
      }))
    }
    // No lane moved (1351-F): without them, or with them moved inside the window, the law's rows are the same.
    const ids = new Set(authored.map((a) => a.filmId))
    const without = { ...input, films: input.films.filter((f) => !ids.has(f.filmId)) }
    const inside = { ...input, films: input.films.map((f) => (ids.has(f.filmId) ? { ...f, releaseTick: W - 1 } : f)) }
    const rows = stableStringify(computePowerRanking(input).rows)
    expect(stableStringify(computePowerRanking(without).rows)).toBe(rows)
    expect(stableStringify(computePowerRanking(inside).rows)).toBe(rows)
  }, MEDIUM)

  it('rank-adapter-pre-origin', async () => {
    const powerRankingInput = await archiveFn<InputFn>('powerRankingInput')
    const founded = foundedAt('1356-p15a2-wave2-pre-origin', 60, 70)
    const h = founded.hollywood!
    expect(h.origin, 'premise: a migration-origin industry').toBe('migration')
    expect(h.originWeek).toBe(60)
    const donor = structuredClone(founded)
    // Two player releases with no run: one before originWeek (inside the window [18, 70)), one after.
    const template: FilmResult = {
      productionId: 'template', releaseTick: 0, delivered: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 }, cohesion: 0.5,
      craft: 0.5, criticMean: 60, criticSigma: 5, criticScore: 60, reviewVariance: 0,
      segmentScores: { youngAdult: 50, family: 50, adult: 50, prestige: 50 }, boxOffice: { opening: 0, total: 0 },
      conceptId: founded.concepts[0]!.id, directorId: 'director-none',
    }
    donor.studio.releasedFilms = [
      ...donor.studio.releasedFilms,
      playerRelease(template, 'pr-1356-pre', 30, 80, 3_000_000),
      playerRelease(template, 'pr-1356-post', 65, 60, 1_000_000),
    ]
    const input = powerRankingInput(donor)
    expect(input.films.some((f) => f.filmId === 'pr-1356-pre')).toBe(false)
    expect(inputFilm(input, 'pr-1356-post').authoredPreCampaign).toBe(false)
    const player = lawRowFor(input, h.playerStudioId)
    expect(player.releases).toBe(1)
    expect(player.countedFilmIds).toEqual(['pr-1356-post'])
    // No lane moved by the pre-origin film.
    const withoutPre = structuredClone(donor)
    withoutPre.studio.releasedFilms = withoutPre.studio.releasedFilms.filter((f) => f.productionId !== 'pr-1356-pre')
    expect(stableStringify(computePowerRanking(powerRankingInput(withoutPre)).rows)).toBe(stableStringify(computePowerRanking(input).rows))
  }, MEDIUM)

  it('rank-adapter-owner-swap', async () => {
    const powerRankingInput = await archiveFn<InputFn>('powerRankingInput')
    const state = genuineLive130()
    const h = state.hollywood!
    const W = state.market.tick
    const inWindow = (studioId: string) => liveFilms(state).filter((f) => f.studioId === studioId && f.result.releaseTick >= W - WINDOW && f.result.releaseTick < W).length
    const rival = h.businesses.map((b) => b.studioId).sort((a, b) => inWindow(b) - inWindow(a) || (a < b ? -1 : 1))[0]!
    expect(inWindow(rival), 'premise: the busiest rival released at least two films in the window').toBeGreaterThanOrEqual(2)
    const business = h.businesses.find((b) => b.studioId === rival)!
    // Equal fixed cost by construction: the player holds the rival's active contract terms; neither
    // side keeps a facility charge (rival capacity opex reads its facilities; the player's reads placement).
    business.operations = { ...business.operations, facilities: [] }
    state.contracts = h.activeEmploymentOrdinals.map((i) => h.employment[i]!)
      .filter((row) => row.studioId === rival && row.endedWeek === null && row.terms.startWeek <= W && W < row.terms.endWeekExclusive)
      .map((row) => ({ ...row.terms }))
    state.placement = { ...state.placement, facilities: [] }
    const cost = rivalWeeklyOperatingCost(business, h, W)
    expect(cost, 'premise: a positive rival fixed cost').toBeGreaterThan(0)
    expect(weeklyBurn(state) - weeklyResearchSpend(state), 'premise: equal fixed cost, computed by the existing helpers').toBe(cost)
    // Equal cash (20 weeks of cover: Stable) and equal film facts: the player re-releases each of the rival's films.
    const cash = cost * 20
    business.account = { ...business.account, cash }
    state.studio.cash = cash
    const twins = liveFilms(state).filter((f) => f.studioId === rival)
    state.studio.releasedFilms = twins.map((f) => playerRelease(f.result, `P:${f.filmId}`, f.result.releaseTick, f.result.criticScore, f.result.boxOffice.total))
    state.theatricalRuns = [...state.theatricalRuns, ...twins.map((f) => runAt(`P:${f.filmId}`, f.conceptId, f.result.releaseTick, W))]
    const input = powerRankingInput(state)
    const player = lawRowFor(input, h.playerStudioId)
    const other = lawRowFor(input, rival)
    const facts = (row: PowerRankingRow) => stableStringify({ ranked: row.ranked, rank: row.rank, filmsTenths: row.filmsTenths, releases: row.releases, releasesTenths: row.releasesTenths, band: row.band })
    expect(facts(player)).toBe(facts(other))
    expect(player.countedFilmIds).toEqual(other.countedFilmIds.map((id) => `P:${id}`))
    expect(player.band).toBe('stable')
    expect(player.releases).toBeGreaterThanOrEqual(2)
  }, MEDIUM)

  it('rank-adapter-no-leak', async () => {
    const studioWeeklyFixedCost = await archiveFn<FixedCostFn>('studioWeeklyFixedCost')
    const recordPowerRankingQuarter = await archiveFn<StepFn>('recordPowerRankingQuarter')
    // 1. Archive bytes: tick the genuine state from 130 to 143 (one recorded quarter) and read
    //    every cash and fixed-cost value the step could have seen at 143.
    let state = genuineLive130()
    while (state.market.tick < 143) state = tick(state)
    const h = state.hollywood!
    const record = archiveOf(state).snapshots.at(-1)
    expect(record?.week, 'premise: one quarter recorded at 143').toBe(143)
    const probes: number[] = []
    for (const row of record!.rows) {
      const business = h.businesses.find((b) => b.studioId === row.studioId)
      probes.push(business === undefined ? state.studio.cash : business.account.cash, studioWeeklyFixedCost(state, row.studioId))
    }
    const bytes = stableStringify({ powerRanking: archiveOf(state), p15Sequence: sequenceOf(state) })
    const numbers: number[] = []
    const walk = (value: unknown): void => {
      if (typeof value === 'number') numbers.push(value)
      else if (Array.isArray(value)) value.forEach(walk)
      else if (value !== null && typeof value === 'object') Object.values(value).forEach(walk)
    }
    walk(JSON.parse(bytes))
    // Weeks, tenths, counts and sequences are small; every balance or cost of at least 1,000 is a probe.
    const distinctive = probes.filter((probe) => Math.abs(probe) >= 1_000)
    expect(distinctive.length, 'premise: each studio has a fixed cost of at least 1,000').toBeGreaterThanOrEqual(record!.rows.length)
    for (const probe of distinctive) {
      expect(numbers.includes(probe), `finance value ${probe} appears as an archive number`).toBe(false)
      if (!Number.isInteger(probe)) expect(bytes.includes(String(probe)), `finance value ${probe} appears in archive bytes`).toBe(false)
    }
    // 2. Thrown messages: the step refusing a non-finite rival cash, and the validator refusing two
    //    tampers, echo none of the distinctive probe balances nor any fixed cost.
    const poisoned = genuineLive130()
    const rivals = poisoned.hollywood!.businesses
    const balances = rivals.map((_, i) => 7_123_456.789 + i * 1_111.111)
    rivals.forEach((b, i) => { b.account = { ...b.account, cash: i === 1 ? Number.NaN : balances[i]! } })
    poisoned.studio.cash = 6_543_210.987
    const secrets = [...balances, 6_543_210.987, ...rivals.map((b) => studioWeeklyFixedCost(poisoned, b.studioId))].map(String)
    let message = ''
    try { recordPowerRankingQuarter(poisoned) } catch (error) { message = (error as Error).message }
    expect(message, 'the step must refuse a non-finite rival cash').not.toBe('')
    for (const secret of secrets) expect(message.includes(secret), `the step's message echoes ${secret}`).toBe(false)
    const env = JSON.parse(JSON.stringify(liveSave(state))) as Envelope
    archiveOf(env.state).snapshots.at(-1)!.rows[0]!.band = 'leveraged' as unknown as Band
    let refused = ''
    try { validateCurrent(env) } catch (error) { refused = (error as Error).message }
    expect(refused).toMatch(/power ranking/i)
    for (const probe of probes.map(String)) expect(refused.includes(probe), `the validator echoes ${probe}`).toBe(false)
  }, MEDIUM)
})

describe('p15a2 archive: the one weekly fixed cost (1356-A §3; RED 5)', () => {
  it('rank-fixed-cost-player-after-founding-excludes-research', async () => {
    const studioWeeklyFixedCost = await archiveFn<FixedCostFn>('studioWeeklyFixedCost')
    const { ready, researching } = researchRoute()
    const player = ready.hollywood!.playerStudioId
    expect(ready.founding, 'premise: a founded studio').toBeNull()
    expect(weeklyResearchSpend(ready)).toBe(0)
    expect(weeklyResearchSpend(researching), 'premise: research genuinely spends this week').toBeGreaterThan(0)
    expect(weeklyBurn(researching) - weeklyBurn(ready), 'premise: beginResearch moves only the research term').toBe(weeklyResearchSpend(researching))
    expect(studioWeeklyFixedCost(ready, player)).toBe(weeklyBurn(ready) - weeklyResearchSpend(ready))
    expect(studioWeeklyFixedCost(ready, player)).toBe(weeklyPayroll(ready) + weeklyOverhead(ready) + weeklyFacilityOperatingCost(ready))
    expect(studioWeeklyFixedCost(ready, player)).toBeGreaterThan(0)
    // Research moves it not.
    expect(studioWeeklyFixedCost(researching, player)).toBe(weeklyBurn(researching) - weeklyResearchSpend(researching))
    expect(studioWeeklyFixedCost(researching, player)).toBe(studioWeeklyFixedCost(ready, player))
  }, MEDIUM)

  it('rank-fixed-cost-player-zero-while-founding', async () => {
    const studioWeeklyFixedCost = await archiveFn<FixedCostFn>('studioWeeklyFixedCost')
    // The draft opens at week 70 (`beginFounding`) and the leaf reads it there, so no tick runs under
    // an open draft (1356-F3): founding the studio, as foundedAt does, would void this leaf's premise.
    let headless = generateWorld('1356-p15a2-wave2-pre-origin')
    while (headless.market.tick < 70) headless = tick(headless)
    const founding = beginFounding(headless)
    const player = founding.hollywood!.playerStudioId
    expect(founding.founding, 'premise: the founding draft is open').not.toBeNull()
    expect(studioWeeklyFixedCost(founding, player)).toBe(0)
    // The founding gate, not an absence of charges, is what reads 0: closed, the same studio pays overhead.
    const closed = { ...founding, founding: null }
    expect(studioWeeklyFixedCost(closed, player)).toBe(weeklyBurn(closed) - weeklyResearchSpend(closed))
    expect(studioWeeklyFixedCost(closed, player)).toBeGreaterThan(0)
  }, MEDIUM)

  it('rank-fixed-cost-rival-research-window-premise', () => {
    // CONTROL (passes today; 1356-F2 item 2): a seeded natural campaign reaches a paying rival
    // inside the memo's weeks, so the rival half of "research moves neither" is not vacuous.
    const { before, at, payer } = rivalResearchWindow()
    const W = at.market.tick
    expect(W).toBeGreaterThan(technologyEntry('synchronized-sound').researchableWeek)
    expect(W).toBeLessThanOrEqual(Math.max(...CHECKPOINTS))
    expect(before.market.tick).toBe(W - 1)
    expect(at.hollywood!.businesses.some((b) => b.studioId === payer), 'the payer is a rival business').toBe(true)
    expect(researchSpent(at, payer), 'the tick producing W booked researchSpend').toBeLessThan(researchSpent(before, payer))
    expect(at.technology.projects.some((p) => p.studioId === payer && p.status === 'active'),
      'its project is still active at W, so its next advance books research again').toBe(true)
  }, MEDIUM)

  it('rank-fixed-cost-rival-operating-cost', async () => {
    const studioWeeklyFixedCost = await archiveFn<FixedCostFn>('studioWeeklyFixedCost')
    const paying = rivalResearchWindow()
    for (const state of [genuineLive130(), researchRoute().researching, paying.at]) {
      const h = state.hollywood!
      expect(h.businesses.length).toBeGreaterThan(0)
      for (const business of h.businesses) {
        // rivalWeeklyOperatingCost carries no research term: a rival's research (its own
        // researchSpend movement) moves neither side.
        expect(studioWeeklyFixedCost(state, business.studioId)).toBe(rivalWeeklyOperatingCost(business, h, state.market.tick))
      }
    }
    // Research moves neither (1356-A §8 item 5): at W the payer booked researchSpend and still
    // researches (rank-fixed-cost-rival-research-window-premise), yet its fixed cost is its
    // operating cost alone.
    const industry = paying.at.hollywood!
    const payer = industry.businesses.find((b) => b.studioId === paying.payer)!
    expect(studioWeeklyFixedCost(paying.at, paying.payer)).toBe(rivalWeeklyOperatingCost(payer, industry, paying.at.market.tick))
  }, MEDIUM)
})

// ═══════════════════════════════════════════════════════════════════════════
// C. the tick step and the record (RED 8, 11; §5 record; 1355-F2 items 2-3, 5)
// ═══════════════════════════════════════════════════════════════════════════
describe('p15a2 archive: the tick step (1356-A §4; RED 8, 11)', () => {
  it('rank-step-cadence', async () => {
    const at130 = fresh(130)
    const weeks = archiveOf(at130).snapshots.map((r) => r.week)
    expect(weeks).toEqual(quartersIn(0, 130))
    const { counts } = campaign()
    expect(counts[0], 'a fresh world starts with an empty archive').toBe(0)
    for (let week = 1; week <= 130; week++) {
      expect(counts[week]! - counts[week - 1]!, `week ${week}`).toBe(isPowerRankingWeek(week) ? 1 : 0)
    }
    // None at originWeek+1 (the chart's off-cadence first observation is not a ranking).
    expect(at130.hollywood!.originWeek).toBe(0)
    expect(counts[1]).toBe(0)
  }, HEAVY)

  it('rank-step-cadence-no-industry', () => {
    let state = generateWorld('1356-p15a2-wave2-headless')
    expect(state.hollywood, 'premise: a headless world has no industry').toBeNull()
    while (state.market.tick < 27) {
      state = tick(state)
      expect(archiveOf(state).snapshots, `week ${state.market.tick}`).toHaveLength(0)
    }
  }, MEDIUM)

  it('rank-step-cadence-founded-midgame-none-at-origin-plus-one', () => {
    let state = generateWorld('1356-p15a2-wave2-founded-27')
    while (state.market.tick < 27) state = tick(state)
    state = foundMidGame(state) // founded, the industry entering at 27, before any tick (1356-F3)
    expect(state.hollywood!.originWeek).toBe(27)
    state = tick(state)
    // CONTRAST (existing law): the chart builds at originWeek+1 (hollywoodTick.ts:456-463) ...
    expect(state.hollywood!.chart?.week).toBe(28)
    // ... the ranking does not.
    expect(archiveOf(state).snapshots).toHaveLength(0)
    while (state.market.tick < 40) state = tick(state)
    expect(archiveOf(state).snapshots.map((r) => r.week)).toEqual([39])
  }, MEDIUM)

  it('rank-step-record-is-law-snapshot', async () => {
    const powerRankingInput = await archiveFn<InputFn>('powerRankingInput')
    for (const week of [13, 52, 130]) {
      const state = fresh(week)
      const record = archiveOf(state).snapshots.at(-1)!
      expect(record.week).toBe(week)
      // 1356-A §5: the law's snapshot over the returned state, minus pointsTenths, honors, distressStage.
      const law = computePowerRanking(powerRankingInput(state))
      expect(stableStringify({ week: record.week, definitionVersion: record.definitionVersion, available: record.available,
        windowStartWeek: record.windowStartWeek, rows: record.rows }))
        .toBe(stableStringify({ week: law.week, definitionVersion: law.definitionVersion, available: law.available,
          windowStartWeek: law.windowStartWeek, rows: law.rows.map(lawRow) }))
    }
  }, HEAVY)

  it('rank-step-record-shape', () => {
    const archive = archiveOf(fresh(130))
    expect(sortedKeys(archive)).toEqual(ROOT_KEYS)
    expect(archive.version).toBe(1)
    expect(archive.recordedFromWeek).toBe(0) // worldgen seeds 0 (1356-A §5 "Migration")
    for (const record of archive.snapshots) {
      expect(sortedKeys(record)).toEqual(RECORD_KEYS)
      expect(record.definitionVersion).toBe(POWER_RANKING_DEFINITION)
      expect(record.windowStartWeek).toBe(record.week - WINDOW)
      for (const row of record.rows) {
        expect(sortedKeys(row)).toEqual(ROW_KEYS) // no pointsTenths, honors or distressStage is stored
        expect(BANDS).toContain(row.band)
        expect(row.rank === null).toBe(!row.ranked)
        expect(row.countedFilmIds.length).toBeLessThanOrEqual(TUNING.POWER_RANKING_FILM_CAP)
        expect(new Set(row.countedFilmIds).size).toBe(row.countedFilmIds.length)
      }
    }
    // Every quarter is recorded, including those before ranks are available (1356-A §5).
    expect(archive.snapshots.filter((r) => !r.available).map((r) => r.week)).toEqual([13, 26, 39])
  }, HEAVY)

  it('rank-record-sequence-allocation', () => {
    // Sibling-proof (1356-F2 item 3): it holds whatever rows sibling P15 roots hold.
    const at130 = fresh(130)
    const records = archiveOf(at130).snapshots
    expect(records.length, 'premise: a non-empty archive').toBeGreaterThan(0)
    // 1355-F2 items 1, 2, 5: whole numbers from the one allocator at append, distinct and ascending
    // in append order; the id cites the sequence.
    const values = records.map((r) => r.p15DomainSequence)
    values.forEach((value, i) => {
      expect(Number.isSafeInteger(value) && value >= 1, `record ${records[i]!.week}`).toBe(true)
      if (i > 0) expect(value, `record ${records[i]!.week}`).toBeGreaterThan(values[i - 1]!)
    })
    for (const record of records) expect(record.id).toBe(`power-ranking-${record.p15DomainSequence}`)
    // 1355-F2 item 4: distinct across every P15 root; next is one more than the largest
    // p15DomainSequence over every row of every root in P15_ROOTS.
    const all = p15Rows(at130).map((row) => row.p15DomainSequence)
    expect(new Set(all).size, 'distinct across every P15 root').toBe(all.length)
    expect(stableStringify(sequenceOf(at130))).toBe(stableStringify({ version: 1, next: Math.max(...all) + 1 }))
    // Contiguity 1..n, and one allocation per produced record, only while no sibling root holds a row.
    if (p15Rows(at130, P15_ROOTS.filter((key) => key !== 'powerRanking')).length === 0) {
      expect(values).toEqual(records.map((_, i) => i + 1))
      // 1355-F3: allocated only in a tick that produces a record.
      const { counts, nexts } = campaign()
      for (let week = 0; week <= 130; week++) expect(nexts[week]! - 1, `week ${week}`).toBe(counts[week])
    }
  }, HEAVY)

  it('rank-record-phase-triple', async () => {
    const v1 = await phaseTableV1()
    const ordinal = v1.find((entry) => entry.phaseId === RANKING_PHASE)!.phaseOrdinal
    const records = archiveOf(fresh(130)).snapshots
    expect(records.length, 'premise: a non-empty archive (1356-F2 item 4)').toBeGreaterThan(0)
    for (const record of records) {
      expect(stableStringify({ phaseId: record.phaseId, phaseOrdinal: record.phaseOrdinal, phaseOrderVersion: record.phaseOrderVersion }))
        .toBe(stableStringify({ phaseId: RANKING_PHASE, phaseOrdinal: ordinal, phaseOrderVersion: 1 }))
    }
  }, HEAVY)

  it('rank-step-entrant', () => {
    const at520 = fresh(520)
    const entrant = at520.hollywood!.identities.find((s) => s.row === 5)!
    // Premise: scheduled entry at its eligible week (calendar.ts RIVAL_ARRIVAL_WEEKS, tick.ts:1118-1121).
    expect(entrant.enteredWeek).toBe(520)
    const records = archiveOf(at520).snapshots
    const at = (week: number) => records.find((r) => r.week === week)!
    const row = at(520).rows.find((r) => r.studioId === entrant.studioId)
    expect(row, 'a rival entering at W is in the W record').toBeDefined()
    expect(row!.ranked).toBe(false)
    expect(row!.rank).toBeNull()
    expect(at(507).rows.some((r) => r.studioId === entrant.studioId)).toBe(false)
  }, HEAVY)
})

// ═══════════════════════════════════════════════════════════════════════════
// D. root, migration, downgrade, append-only, round trip (RED 12, 13, 16; 1355-F2 items 1, 6)
// ═══════════════════════════════════════════════════════════════════════════
describe('p15a2 archive: root and persistence (1356-A §5; RED 12, 13, 16)', () => {
  it('rank-root-fresh', () => {
    const empty = stableStringify({ version: 1, recordedFromWeek: 0, snapshots: [] })
    const allocator = stableStringify({ version: 1, next: 1 })
    for (const state of [generateWorld('1356-p15a2-wave2-fresh'), p13aGeneratedStudio()]) {
      expect(state.market.tick).toBe(0)
      expect(stableStringify(archiveOf(state))).toBe(empty)
      expect(stableStringify(sequenceOf(state))).toBe(allocator)
      const save = liveSave(state)
      expect(save.saveVersion).toBe(saveModule.LIVE_SAVE_VERSION)
      expect(() => validateCurrent(JSON.parse(JSON.stringify(save)))).not.toThrow()
    }
  }, MEDIUM)

  it('rank-root-migration-empty', () => {
    const v42 = genuineV42Week130()
    const below = migrateBelowStep(v42)
    expect(below.saveVersion).toBe(ARCHIVE_STEP - 1)
    expect(Object.hasOwn(below.state, 'powerRanking'), 'premise: the root is new at the step').toBe(false)
    expect(Object.hasOwn(below.state, 'p15Sequence'), 'premise: the allocator arrives with the first P15 root').toBe(false)
    const live = migrateIntoStep(v42)
    expect(live.saveVersion).toBe(ARCHIVE_STEP)
    // An empty archive at the save's own week; the allocator at 1; no past quarter recorded (annex G.2).
    expect(stableStringify(archiveOf(live.state))).toBe(stableStringify({ version: 1, recordedFromWeek: 130, snapshots: [] }))
    expect(stableStringify(sequenceOf(live.state))).toBe(stableStringify({ version: 1, next: 1 }))
    // Nothing else moves at the step.
    expect(stableStringify(stripP15(live.state))).toBe(stableStringify(below.state))
    // A second migration is a no-op.
    expect(exportSave(migrateIntoStep(live) as never)).toBe(exportSave(live as never))
    currentFromStep(live)
    // The step's own converter, by name, agrees.
    expect(stableStringify(convertIntoStep(below))).toBe(stableStringify(live))
  }, MEDIUM)

  it('rank-root-migration-genuine-below-step-capture', () => {
    // 1356-A §9 and 1355-F Amendment 3: a genuine capture written by the last writer of the
    // version below the step, minted before that writer moves, with sha256 provenance, shared by
    // every root of the step. RED until the parent mints it at this path. After minting, pin the
    // capture's sha256 here as well (the 1344-P precedent).
    const directory = new URL('./fixtures/p15/genuine-below-p15-save-step/', import.meta.url)
    const manifestUrl = new URL('MANIFEST.json', directory)
    if (!existsSync(manifestUrl)) {
      throw new Error(`RED: no genuine capture below the P15 save step at tests/fixtures/p15/genuine-below-p15-save-step/ (1356-A §9: mint it at the last Save${ARCHIVE_STEP - 1} writer)`)
    }
    type Manifest = { saveVersion: number; inputs: { name: string; gzip: { bytes: number; sha256: string }; decoded: { bytes: number; sha256: string } }[] }
    const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8')) as Manifest
    expect(manifest.saveVersion).toBe(ARCHIVE_STEP - 1)
    expect(manifest.inputs.length).toBeGreaterThan(0)
    const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
    for (const input of manifest.inputs) {
      const gz = readFileSync(new URL(`${input.name}.json.gz`, directory))
      expect(gz.byteLength).toBe(input.gzip.bytes)
      expect(sha(gz)).toBe(input.gzip.sha256)
      const raw = gunzipSync(gz).toString('utf8')
      expect(Buffer.byteLength(raw, 'utf8')).toBe(input.decoded.bytes)
      expect(sha(raw)).toBe(input.decoded.sha256)
      const capture = importSave(raw) as unknown as Envelope
      expect(capture.saveVersion).toBe(ARCHIVE_STEP - 1)
      const upgraded = convertIntoStep(capture)
      expect(stableStringify(archiveOf(upgraded.state)))
        .toBe(stableStringify({ version: 1, recordedFromWeek: capture.state.market.tick, snapshots: [] }))
      expect(stableStringify(sequenceOf(upgraded.state))).toBe(stableStringify({ version: 1, next: 1 }))
      expect(stableStringify(stripP15(upgraded.state))).toBe(stableStringify(capture.state))
      expect(exportSave(migrateIntoStep(upgraded) as never)).toBe(exportSave(upgraded as never))
      currentFromStep(upgraded)
    }
  }, MEDIUM)

  it('rank-root-downgrade-empty-strips', () => {
    const v42 = genuineV42Week130()
    const below = migrateBelowStep(v42)
    const live = migrateIntoStep(v42)
    expect(archiveOf(live.state).snapshots, 'premise: an empty archive').toHaveLength(0)
    currentFromStep(live)
    const down = convertOutOfStep(live)
    expect(down.saveVersion).toBe(ARCHIVE_STEP - 1)
    expect(Object.hasOwn(down.state, 'powerRanking')).toBe(false)
    expect(Object.hasOwn(down.state, 'p15Sequence')).toBe(false)
    // V(N−1) → VN → V(N−1) is byte-identical.
    expect(stableStringify(down)).toBe(stableStringify(below))
  }, MEDIUM)

  it('rank-root-downgrade-round-trip-claims-less', () => {
    let state = genuineLive130()
    while (state.market.tick < 135) state = tick(state)
    const before = archiveOf(state)
    expect(stableStringify(before), 'premise: no quarter between 130 and 135').toBe(stableStringify({ version: 1, recordedFromWeek: 130, snapshots: [] }))
    const currentSave = liveSave(state)
    const currentBefore = stableStringify(currentSave)
    expect(() => convertOutOfStep(currentSave)).toThrow(/^migrateToV45: cannot downgrade or discard recovery authority: costCutting\.since, facilityDemolitionRefund, facilityDisposed$/)
    expect(stableStringify(currentSave), 'the refused current input remains unchanged').toBe(currentBefore)

    // An original Save45 engine advanced the genuine Save42 week-130 capture through five
    // default ticks. Its claims-less week-135 save predates recovery authority and can
    // exercise the frozen ranking step without projecting fields out of a current save.
    const directory = new URL('./fixtures/p15/genuine-original45-rank130-135-1368/', import.meta.url)
    const manifest = JSON.parse(readFileSync(new URL('MANIFEST.json', directory), 'utf8')) as {
      originalEngineHead: string; startWeek: number; endWeek: number; saveVersion: number
      file: { path: string; sha256: string; rawSha256: string; bytes: number; rawBytes: number }
    }
    expect(manifest.originalEngineHead).toBe('2eaa697effc38538c37da28b486786ce267a2284')
    expect([manifest.startWeek, manifest.endWeek, manifest.saveVersion]).toEqual([130, 135, ARCHIVE_STEP])
    const gzip = readFileSync(new URL(manifest.file.path, directory))
    expect(gzip.byteLength).toBe(manifest.file.bytes)
    expect(createHash('sha256').update(gzip).digest('hex')).toBe(manifest.file.sha256)
    const raw = gunzipSync(gzip).toString('utf8')
    expect(Buffer.byteLength(raw, 'utf8')).toBe(manifest.file.rawBytes)
    expect(createHash('sha256').update(raw).digest('hex')).toBe(manifest.file.rawSha256)
    const historical = importSave(raw) as unknown as Envelope
    const historicalBefore = stableStringify(historical)
    expect(historical.saveVersion).toBe(ARCHIVE_STEP)
    expect(historical.state.market.tick).toBe(135)
    expect(stableStringify(archiveOf(historical.state))).toBe(stableStringify(before))
    const again = convertIntoStep(convertOutOfStep(historical))
    // A round trip can only claim less history, never more (1356-A §5 "Migration").
    expect(stableStringify(archiveOf(again.state))).toBe(stableStringify({ version: 1, recordedFromWeek: 135, snapshots: [] }))
    expect(stableStringify(stripP15(again.state))).toBe(stableStringify(stripP15(historical.state)))
    expect(stableStringify(historical), 'the historical input remains unchanged').toBe(historicalBefore)
    currentFromStep(again)
  }, MEDIUM)

  it('rank-root-downgrade-recorded-quarter-refuses', () => {
    const at13 = fresh(13)
    expect(archiveOf(at13).snapshots, 'premise: one recorded quarter').toHaveLength(1)
    const save = liveSave(at13)
    expect(() => convertOutOfStep(save)).toThrow(DOWNGRADE_REFUSAL)
    // Every older migrateToVxx refuses by name too (the downgrade line per older migrator, save.ts:7414 pattern).
    let checked = 0
    for (let version = 4; version < ARCHIVE_STEP; version++) {
      const migrate = (saveModule as unknown as Record<string, unknown>)[`migrateToV${version}`]
      if (typeof migrate !== 'function') continue
      expect(() => (migrate as (s: unknown) => unknown)(save), `migrateToV${version}`).toThrow(DOWNGRADE_REFUSAL)
      checked++
    }
    expect(checked).toBeGreaterThanOrEqual(30)
  }, HEAVY)

  it('rank-root-downgrade-frozen-builders-refuse', () => {
    const at13 = fresh(13)
    expect(archiveOf(at13).snapshots, 'premise: one recorded quarter').toHaveLength(1)
    const builders = Object.keys(saveModule).filter((name) => /^makeSaveV\d+$/.test(name))
    expect(builders.length).toBeGreaterThanOrEqual(18)
    for (const name of builders) {
      const build = (saveModule as unknown as Record<string, (s: unknown) => unknown>)[name]!
      expect(() => build(at13), name).toThrow(DOWNGRADE_REFUSAL)
    }
  }, HEAVY)

  it('rank-root-frozen-builder-headless-control', () => {
    // CONTROL (passes today): a headless engaged world, the P11 scale test's shape
    // (tests/p11-finance-history-scale.test.ts), still builds a frozen V18 save, and that save
    // carries no P15 root. After the step its empty archive must strip, never refuse.
    let state = applyActions({ ...generateWorld('1356-p15a2-wave2-headless-v18'), economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }])
    while (state.market.tick < 26) state = tick(state)
    const frozen = stableStringify(saveModule.makeSaveV18(state))
    expect(frozen.includes('"powerRanking"')).toBe(false)
    expect(frozen.includes('"p15Sequence"')).toBe(false)
  }, MEDIUM)

  it('rank-append-only', () => {
    const final = archiveOf(fresh(572)).snapshots
    expect(final.map((r) => r.week)).toEqual(quartersIn(0, 572))
    // 520 more ticks from week 52 leave every earlier record byte-identical.
    for (const week of [52, 130, 520]) {
      const earlier = archiveOf(fresh(week)).snapshots
      expect(earlier.length).toBe(week / QUARTER)
      earlier.forEach((record, i) => expect(stableStringify(final[i]), `record ${record.week} at 572`).toBe(stableStringify(record)))
    }
  }, HEAVY)

  it('rank-round-trip', () => {
    const at520 = fresh(520)
    const reloaded = migrateToLive(importSave(exportSave(makeSave(at520)))).state as GameState
    expect(stableStringify(archiveOf(reloaded))).toBe(stableStringify(archiveOf(at520)))
    expect(stableStringify(sequenceOf(reloaded))).toBe(stableStringify(sequenceOf(at520)))
    let state = reloaded
    while (state.market.tick < 572) state = tick(state)
    // A save/load mid-campaign continues byte-identically to the uninterrupted campaign.
    expect(exportSave(makeSave(state))).toBe(exportSave(makeSave(fresh(572))))
  }, HEAVY)
})

// ═══════════════════════════════════════════════════════════════════════════
// E. validation (RED 14, 15; 1356-F Amendments 1-2; 1355-F2 item 4)
// ═══════════════════════════════════════════════════════════════════════════
let baseJson: string | null = null
/** The genuine week-130 save of the memoized campaign: ten records, 13..130 (39 and earlier unavailable). */
function base(): { env: Envelope; archive: Archive; sequence: Sequence } {
  baseJson ??= JSON.stringify(liveSave(fresh(130)))
  const env = JSON.parse(baseJson) as Envelope
  const archive = archiveOf(env.state)
  expect(archive.snapshots.map((r) => r.week), 'premise: the week-130 base holds the ten quarters').toEqual(quartersIn(0, 130))
  return { env, archive, sequence: sequenceOf(env.state) }
}
const POWER_RANKING = /power ranking/i
const ALLOCATOR = /power ranking|p15/i
const refuses = (env: Envelope, pattern: RegExp = POWER_RANKING): void => {
  expect(() => validateCurrent(env)).toThrow(pattern)
}
const recordAt = (archive: Archive, week: number): ArchiveRecord => {
  const record = archive.snapshots.find((r) => r.week === week)
  if (record === undefined) throw new Error(`no record at ${week}`)
  return record
}
/** Give the archive's records fresh ascending sequences above every P15 row, sibling rows included,
 * ids to match, and next one above them, so a cadence tamper meets only the cadence rule whatever
 * rows sibling roots hold (1355-F2 item 4; 1356-F2 item 3). */
function renumber(state: GameState): void {
  const archive = archiveOf(state)
  const top = Math.max(0, ...p15Rows(state).map((row) => row.p15DomainSequence))
  archive.snapshots.forEach((record, i) => { record.p15DomainSequence = top + 1 + i; record.id = `power-ranking-${top + 1 + i}` })
  sequenceOf(state).next = top + 1 + archive.snapshots.length
}
function filmWeek(state: GameState, filmId: string): number {
  const film = state.hollywood!.films.find((f) => f.filmId === filmId)
  if (film === undefined) throw new Error(`no industry film ${filmId}`)
  return film.provenance === 'authored-start/v1' ? (film.released.year - 1920) * 52 : film.result.releaseTick
}

describe('p15a2 archive: validation, §5 items 1-4 (RED 14; 1356-F Amendments 1-2)', () => {
  it('rank-validate-genuine-archive-validates', () => {
    const { env } = base()
    expect(() => validateCurrent(env)).not.toThrow()
  }, HEAVY)

  it('rank-validate-keys-root', () => {
    const { env, archive } = base()
    ;(archive as unknown as Record<string, unknown>).nextRecord = 11 // 1355-F2 item 5 withdrew a per-root counter
    refuses(env)
  }, HEAVY)

  it('rank-validate-keys-record-extra', () => {
    const { env, archive } = base()
    ;(recordAt(archive, 65) as unknown as Record<string, unknown>).cohortLabel = 'all entered studios'
    refuses(env)
  }, HEAVY)

  it('rank-validate-keys-record-missing', () => {
    const { env, archive } = base()
    delete (recordAt(archive, 65) as unknown as Record<string, unknown>).windowStartWeek
    refuses(env)
  }, HEAVY)

  it('rank-validate-keys-row-points', () => {
    const { env, archive } = base()
    const row = recordAt(archive, 130).rows[0]!
    ;(row as unknown as Record<string, unknown>).pointsTenths = row.filmsTenths + row.releasesTenths // points stay derived (annex :253)
    refuses(env)
  }, HEAVY)

  it('rank-validate-keys-row-honors-and-stage', () => {
    for (const [key, value] of [['honors', 'notRecorded'], ['distressStage', 'notRecorded']] as const) {
      const { env, archive } = base()
      ;(recordAt(archive, 130).rows[0]! as unknown as Record<string, unknown>)[key] = value // 1356-A §7: no record stores either
      refuses(env)
    }
  }, HEAVY)

  it('rank-validate-version', () => {
    const { env, archive } = base()
    archive.version = 2
    refuses(env)
  }, HEAVY)

  it('rank-validate-recorded-from-week-range', () => {
    for (const recordedFromWeek of [-1, 0.5, 131]) {
      const { env, archive } = base()
      archive.recordedFromWeek = recordedFromWeek
      refuses(env)
    }
  }, HEAVY)

  it('rank-validate-cadence-gap', () => {
    const { env, archive } = base()
    archive.snapshots = archive.snapshots.filter((r) => r.week !== 65)
    renumber(env.state)
    refuses(env)
  }, HEAVY)

  it('rank-validate-cadence-duplicate', () => {
    const { env, archive } = base()
    const i = archive.snapshots.findIndex((r) => r.week === 65)
    archive.snapshots.splice(i + 1, 0, structuredClone(archive.snapshots[i]!))
    renumber(env.state)
    refuses(env)
  }, HEAVY)

  it('rank-validate-cadence-off-cadence', () => {
    const { env, archive } = base()
    recordAt(archive, 65).week = 66
    refuses(env)
  }, HEAVY)

  it('rank-validate-cadence-future', () => {
    const { env, archive } = base()
    archive.snapshots.push({ ...structuredClone(recordAt(archive, 130)), week: 143, windowStartWeek: 143 - WINDOW })
    renumber(env.state)
    refuses(env)
  }, HEAVY)

  it('rank-validate-cadence-order', () => {
    const { env, archive } = base()
    const a = archive.snapshots.findIndex((r) => r.week === 52)
    const b = archive.snapshots.findIndex((r) => r.week === 65)
    ;[archive.snapshots[a], archive.snapshots[b]] = [archive.snapshots[b]!, archive.snapshots[a]!]
    renumber(env.state)
    refuses(env)
  }, HEAVY)

  it('rank-validate-cadence-no-industry', () => {
    const record = structuredClone(recordAt(base().archive, 13))
    let state = generateWorld('1356-p15a2-wave2-headless')
    while (state.market.tick < 27) state = tick(state)
    const env = JSON.parse(JSON.stringify(liveSave(state))) as Envelope
    expect(env.state.hollywood).toBeNull()
    archiveOf(env.state).snapshots = [record]
    renumber(env.state)
    refuses(env)
  }, HEAVY)

  it('rank-validate-cadence-boundary', async () => {
    // 1356-F Amendment 2: in each case the step's records equal the validator's expected weeks,
    // the multiples of 13 in (max(recordedFromWeek, originWeek), market.tick].
    const recordPowerRankingQuarter = await archiveFn<StepFn>('recordPowerRankingQuarter')
    const expectedWeeks = (state: GameState) => quartersIn(Math.max(archiveOf(state).recordedFromWeek, state.hollywood!.originWeek), state.market.tick)
    const agrees = (state: GameState, weeks: number[]) => {
      expect(archiveOf(state).snapshots.map((r) => r.week)).toEqual(weeks)
      expect(expectedWeeks(state)).toEqual(weeks)
      expect(() => validateCurrent(liveSave(state))).not.toThrow()
    }
    /** The excluded lower end refuses even as the step's own true record, renumbered first. */
    const lowerEndRefuses = (state: GameState, lower: GameState) => {
      const env = JSON.parse(JSON.stringify(liveSave(state))) as Envelope
      const archive = archiveOf(env.state)
      const truth = archiveOf(recordPowerRankingQuarter(lower)).snapshots.at(-1)!
      expect(truth.week).toBe(lower.market.tick)
      archive.snapshots = [JSON.parse(JSON.stringify(truth)) as ArchiveRecord, ...archive.snapshots]
      renumber(env.state)
      refuses(env)
    }
    /** Removing the first record refuses (no gap below the open lower end). */
    const firstRequired = (state: GameState) => {
      const env = JSON.parse(JSON.stringify(liveSave(state))) as Envelope
      const archive = archiveOf(env.state)
      archive.snapshots = archive.snapshots.slice(1)
      renumber(env.state)
      refuses(env)
    }

    // (a) A world founded at a multiple of 13 (26): first record 39. The studio is founded at 26,
    //     minimum roster then `foundStudio`, and the industry enters at 26, before any tick
    //     (1356-F3 item 1; `foundMidGame`). `agrees` re-derives the weeks from originWeek and
    //     recordedFromWeek.
    let headless = generateWorld('1356-p15a2-wave2-boundary-a')
    while (headless.market.tick < 26) headless = tick(headless)
    const founded26 = foundMidGame(headless)
    expect(founded26.hollywood!.originWeek, 'premise: the industry enters at the founding week, origin week 26').toBe(26)
    let a = founded26
    expect(a.founding, 'premise: the founding draft is closed at week 26').toBeNull()
    while (a.market.tick < 66) {
      a = tick(a)
      expect(a.founding, `premise: the founding draft stays closed at week ${a.market.tick}`).toBeNull()
    }
    agrees(a, [39, 52, 65])
    lowerEndRefuses(a, founded26)
    firstRequired(a)

    // (b) A save migrated at a multiple of 13 (the genuine week-130 capture): first record 143.
    const migrated130 = genuineLive130()
    expect(archiveOf(migrated130).recordedFromWeek).toBe(130)
    let b = migrated130
    while (b.market.tick < 156) b = tick(b)
    agrees(b, [143, 156])
    lowerEndRefuses(b, migrated130)
    firstRequired(b)

    // (c) A save migrated one week before a multiple of 13: the genuine Save37 week-103 save of the
    //     C3 corpus (tests/helpers/p14c3-fixtures.ts checks its manifest sha256), migrated: first
    //     record 104. No downgrade of a ticked state, which a sibling root holding rows refuses
    //     (1356-F2 item 3).
    const c103 = migrated('genuine-v37-c3-preannouncement-week103.json.gz')
    expect(c103.market.tick).toBe(103)
    expect(archiveOf(c103).recordedFromWeek).toBe(103)
    const c = tick(c103)
    agrees(c, [104])
    firstRequired(c)

    // (d) A world founded one week before a multiple of 13 (25): its first record is originWeek+1 = 26.
    //     Founded at 25 before any tick, as in (a) (1356-F3).
    let headlessD = generateWorld('1356-p15a2-wave2-boundary-d')
    while (headlessD.market.tick < 25) headlessD = tick(headlessD)
    let d = foundMidGame(headlessD)
    while (d.market.tick < 27) d = tick(d)
    expect(d.founding, 'premise: the founding draft is closed').toBeNull()
    agrees(d, [26])
    firstRequired(d)
  }, HEAVY)

  it('rank-validate-definition', () => {
    for (const definitionVersion of ['power-ranking/v2', 'power-ranking/v0']) {
      const { env, archive } = base()
      recordAt(archive, 65).definitionVersion = definitionVersion // annex G.3: an unknown future version refuses
      refuses(env)
    }
  }, HEAVY)

  it('rank-validate-cohort-missing-row', () => {
    const { env, archive } = base()
    const record = recordAt(archive, 130)
    const player = env.state.hollywood!.playerStudioId
    record.rows = record.rows.filter((r) => r.studioId !== player)
    refuses(env)
  }, HEAVY)

  it('rank-validate-cohort-extra-row', () => {
    const { env, archive } = base()
    const record = recordAt(archive, 130)
    const absent = env.state.hollywood!.identities.find((s) => s.enteredWeek === null)!
    record.rows.push({ ...structuredClone(record.rows.at(-1)!), studioId: absent.studioId, ranked: false, rank: null })
    refuses(env)
  }, HEAVY)

  it('rank-validate-cohort-duplicate-row', () => {
    const { env, archive } = base()
    const record = recordAt(archive, 130)
    record.rows.push(structuredClone(record.rows[0]!))
    refuses(env)
  }, HEAVY)

  it('rank-validate-id-week-only', () => {
    const { env, archive } = base()
    // A record whose sequence is not its week, so the week-only id differs from the true one even
    // when sibling rows move a sequence onto its week (1356-F2 item 3).
    const record = archive.snapshots.find((r) => r.p15DomainSequence !== r.week)
    expect(record, 'premise: a record whose sequence is not its week').toBeDefined()
    record!.id = `power-ranking-${record!.week}` // annex D.7: no week-only identity
    refuses(env)
  }, HEAVY)

  it('rank-validate-sequence-duplicate', () => {
    const { env, archive } = base()
    const first = recordAt(archive, 65)
    const second = recordAt(archive, 78)
    second.p15DomainSequence = first.p15DomainSequence
    second.id = first.id // D.7: collision and duplicate-load refusal
    refuses(env, ALLOCATOR)
  }, HEAVY)

  it('rank-validate-sequence-at-or-above-next', () => {
    const { env, archive, sequence } = base()
    const last = recordAt(archive, 130)
    last.p15DomainSequence = sequence.next
    last.id = `power-ranking-${sequence.next}`
    refuses(env, ALLOCATOR)
  }, HEAVY)

  it('rank-validate-next-stale', () => {
    for (const delta of [1, -1]) {
      const { env, sequence } = base()
      sequence.next += delta // next must be one more than the largest p15DomainSequence
      refuses(env, ALLOCATOR)
    }
  }, HEAVY)

  it('rank-validate-sequence-ascends-with-weeks', () => {
    const { env, archive } = base()
    const a = recordAt(archive, 65)
    const b = recordAt(archive, 78)
    ;[a.p15DomainSequence, b.p15DomainSequence] = [b.p15DomainSequence, a.p15DomainSequence]
    a.id = `power-ranking-${a.p15DomainSequence}`
    b.id = `power-ranking-${b.p15DomainSequence}`
    refuses(env, ALLOCATOR)
  }, HEAVY)

  it('rank-validate-phase-triple', async () => {
    const v1 = await phaseTableV1()
    const condition = v1.find((entry) => entry.phaseId === 'p15b.condition')!
    const tampers: ((record: ArchiveRecord) => void)[] = [
      (record) => { record.phaseOrdinal += 1 },
      (record) => { record.phaseId = condition.phaseId; record.phaseOrdinal = condition.phaseOrdinal },
      (record) => { record.phaseOrderVersion = 2 },
    ]
    for (const tamper of tampers) {
      const { env, archive } = base()
      tamper(recordAt(archive, 65))
      refuses(env, ALLOCATOR)
    }
  }, HEAVY)

  it('p15-validate-sequence-root', () => {
    const tampers: ((sequence: Sequence) => void)[] = [
      (sequence) => { (sequence as unknown as Record<string, unknown>).cursor = 0 },
      (sequence) => { sequence.version = 2 },
      (sequence) => { delete (sequence as unknown as Record<string, unknown>).next },
    ]
    for (const tamper of tampers) {
      const { env, sequence } = base()
      tamper(sequence)
      refuses(env, ALLOCATOR)
    }
  }, HEAVY)
})

describe('p15a2 archive: validation, §5 item 5 recompute by era (RED 15)', () => {
  /** The latest record holding a ranked rival row with counted films, and that row. */
  function rankedRivalRow(archive: Archive, state: GameState): { record: ArchiveRecord; row: ArchiveRow } {
    const player = state.hollywood!.playerStudioId
    for (const record of [...archive.snapshots].reverse()) {
      const row = record.rows.find((r) => r.ranked && r.studioId !== player && r.countedFilmIds.length > 0)
      if (row !== undefined) return { record, row }
    }
    throw new Error('premise: no ranked rival row with counted films between 52 and 130')
  }

  it('rank-validate-recompute-films-lane', () => {
    const { env, archive } = base()
    const { row } = rankedRivalRow(archive, env.state)
    row.filmsTenths += row.filmsTenths > 0 ? -1 : 1
    refuses(env)
  }, HEAVY)

  it('rank-validate-recompute-releases-lane', () => {
    const { env, archive } = base()
    const { row } = rankedRivalRow(archive, env.state)
    row.releasesTenths = row.releasesTenths === 100 ? 75 : row.releasesTenths + 25
    refuses(env)
  }, HEAVY)

  it('rank-validate-recompute-rank', () => {
    const { env, archive } = base()
    const { row } = rankedRivalRow(archive, env.state)
    row.rank = row.rank! + 1
    refuses(env)
  }, HEAVY)

  it('rank-validate-recompute-ranked', () => {
    const { env, archive } = base()
    const { row } = rankedRivalRow(archive, env.state)
    row.ranked = false
    row.rank = null
    refuses(env)
  }, HEAVY)

  it('rank-validate-recompute-releases', () => {
    const { env, archive } = base()
    const { row } = rankedRivalRow(archive, env.state)
    row.releases += 1
    refuses(env)
  }, HEAVY)

  it('rank-validate-recompute-film-outside-window', () => {
    const { env, archive } = base()
    const { record, row } = rankedRivalRow(archive, env.state)
    const outside = env.state.hollywood!.films.find((f) => f.studioId === row.studioId && filmWeek(env.state, f.filmId) < record.windowStartWeek)
    expect(outside, 'premise: the studio has a film released before the window').toBeDefined()
    row.countedFilmIds[0] = outside!.filmId
    refuses(env)
  }, HEAVY)

  it('rank-validate-recompute-swapped-film', () => {
    const { env, archive } = base()
    const player = env.state.hollywood!.playerStudioId
    const record = [...archive.snapshots].reverse().find((r) => r.rows.filter((row) => row.studioId !== player && row.countedFilmIds.length > 0).length >= 2)
    expect(record, 'premise: a record where two rivals have counted films').toBeDefined()
    const [a, b] = record!.rows.filter((row) => row.studioId !== player && row.countedFilmIds.length > 0)
    a!.countedFilmIds[0] = b!.countedFilmIds[0]! // another studio's finished release in the window
    refuses(env)
  }, HEAVY)

  it('rank-validate-recompute-available', () => {
    for (const week of [39, 130]) {
      const { env, archive } = base()
      const record = recordAt(archive, week)
      record.available = !record.available
      refuses(env)
    }
  }, HEAVY)

  it('rank-validate-recompute-window-start', () => {
    const { env, archive } = base()
    recordAt(archive, 130).windowStartWeek -= 1
    refuses(env)
  }, HEAVY)

  it('rank-validate-recompute-row-order', () => {
    const { env, archive } = base()
    const record = recordAt(archive, 130)
    ;[record.rows[0], record.rows[1]] = [record.rows[1]!, record.rows[0]!]
    refuses(env)
  }, HEAVY)

  it('rank-validate-band-another-valid-band-passes', () => {
    // Cash at W is not recoverable, so the band is checked only as an enum member (1356-A §5 item 5).
    const { env, archive } = base()
    for (const record of archive.snapshots) {
      for (const row of record.rows) row.band = BANDS[(BANDS.indexOf(row.band) + 1) % BANDS.length]!
    }
    expect(() => validateCurrent(env)).not.toThrow()
  }, HEAVY)

  it('rank-validate-band-unknown-refuses', () => {
    const { env, archive } = base()
    recordAt(archive, 130).rows[0]!.band = 'leveraged' as unknown as Band // the deferred label (1350-A §3) is no v1 member
    refuses(env)
  }, HEAVY)
})
