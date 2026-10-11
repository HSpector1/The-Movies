// ── P15A.1 Wave 2 RED r2 (records 1355-C, 1355-C2): the shared market in the live release pipeline ──
//
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/):
// 1355-A §3 (integration design), §4 (chronology and the K1/K2 controls), §7 (this RED list);
// 1355-F (Amendments 1-4: fact 8, all-or-none on the in-repo pattern, the old-save capture
// rule, one shared save step); 1355-F2 (BINDING: every assessment stores `p15DomainSequence`
// from the one allocator `p15Sequence` and the triple `phaseId: 'p15a1.marketBatch'`,
// `phaseOrdinal`, `phaseOrderVersion` from `src/core/p15Phases.ts`); 1355-B2 and 1355-F3
// (RED 12/14/16 extensions, `market-second-subject-failure-commits-nothing` — in the
// atomicity file — and `market-phase-version-immutable`, in the phases file); 1355-D and the
// binding 1355-F4 (r2: cross-root validation, sibling roots, the first subject's return, the
// v2-declared row). The Wave 1 law is `src/core/sharedMarket.ts` (`p15a1-market-v1`).
//
// LANDING ORDER (1355-F4). The writer queue lands P15A.2 slice 2a (the Power Ranking archive,
// `p15Sequence`, `p15Phases.ts`) before this wave, so at this wave's GREEN the ranking root exists.
// The pins hold whether the roots share one save step (1355-F Amendment 4) or land at separate
// steps. The shared capture (`genuine-below-p15-save-step`) serves ONE shared step only (1355-F5
// item 2): at separate steps each step's production mints its own capture below its own step, at
// its own path, and the RED 16 capture leaves are re-pinned then. tests/helpers/p15-roots.ts is SHARED with 1356-C: same path and contents, with
// `sharedMarket` added to `P15_ROOTS` here; whichever record lands second merges the list. Pins
// and comparisons strip every `P15_ROOTS` key, never a fixed set.
// DECLARED, re-pinned at a sibling landing (or if the landing order changes):
//   - Historical MARKET_STEP is now frozen at 45 (1363-N group 4).
//   - `market-validator-reconciles: across P15 roots …` (1355-F4 R1): it needs a sibling root's rows.
//   - `market-old-save: a non-empty root refuses the downgrade …` (week 70 holds ranking records):
//     re-pinned at the merge with 1356-C's `rank-root-downgrade-recorded-quarter-refuses`; the
//     production that lands second fixes the refusal order for both.
//
// SEAMS. The atomicity file wraps `assessBatch` and `resolveReception` with pass-through mocks, so
// production calls each through its module export from outside its own module.
//
// RED BY DESIGN against 1063ab4f: no root, no batch, no seam parameter, no save step. Each
// leaf fails on its own requirement; the CONTROL leaves (classification `control: true`)
// pin today's behaviour and pass today. FIXTURE-PENDING leaves read pins and a capture the
// 1355-P producer mints at the last writer below the step; until then they fail naming the
// missing file (and print what this commit computes).
//
// Names shared with 1356-C (P15A.2 slice 2a owns the allocator and the phase table):
// `p15Sequence: {version: 1, next}`; `p15Phases.ts` exports `P15_PHASE_TABLES` and
// `P15_PHASE_ORDER_VERSION`. The save step is the live constant `LIVE_SAVE_VERSION`; its
// functions are resolved by name (`validateSaveV${N}`, `convertV${N-1}ToV${N}`,
// `convertV${N}ToV${N-1}`, `migrateToV${N-1}`). No future version literal appears here.
//
// Method notes: states are compared at the serialization level (`canon`, 1344-X6), never with
// toEqual on objects. Routes decide from films and productions, never from the new root, so
// the same route runs on unchanged production (the pins) and on the candidate. Seeded RNG only.
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { OracleAgent } from '../src/core/agents.js'
import { advanceHollywoodWeek } from '../src/core/hollywoodTick.js'
import { forecastHistoryForOwner } from '../src/core/industryCareer.js'
import { computeBoxOffice, resolveReception, type ReceptionInputs, type ReceptionResult } from '../src/core/reception.js'
import { RngStream } from '../src/core/rng.js'
import * as saveModule from '../src/core/save.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { setNoveltyReceptionFactor } from '../src/core/sets.js'
import {
  assessBatch, MARKET_REASON_SOURCE_LIMIT, pressureFactor, reduceExposures, SHARED_MARKET_DEFINITION,
  type MarketExposure, type MarketReason,
} from '../src/core/sharedMarket.js'
import { tick } from '../src/core/tick.js'
import { GENRE_ORDER, TUNING } from '../src/core/tuning.js'
import type { GameState, Genre, SegmentId } from '../src/core/types.js'
import { makeReceptionInputs } from './_fixtures.js'
import { genuineV42Week130 } from './p14d1-rival-shelving-fixtures.js'
import {
  cancelPicture, canon, CAPTURE_DIRECTORY, commitPictures, detached, diffPaths, digest, k1AllowedPaths, keepKeys,
  capturePremise, kRoute, m0aRoute, MARKET_PHASE_ID, marketRoot, pairWeek, PERSISTED_ROW_KEYS, PIN_DIRECTORY,
  pressured, receptionPinCases, releaseHistory, rivalDue, rivalRouteAt, ROUTE_CAP_WEEK, routeAt, rowsAt, runPinCase, sequenceRoot,
  sha256, soloWeek, swapStudioIds, twinWeek, withEmptyMarketRoot, withSyntheticMarketRows,
  type Member, type PersistedAssessment, type PinManifest, type Released,
} from './helpers/p15a1-market-route.js'
import { P15_ROOTS, p15Rows, stripP15 } from './helpers/p15-roots.js'
import { historicalSave45Comparison } from './helpers/historical-save45-comparison.js'

// ── the frozen P15 introduction step (coordinator; 1356-C) ──────────────────────
const MARKET_STEP: number = 45 // Frozen P15 introduction, independent of the current writer.
type Envelope = { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
type SaveFn = (save: unknown) => Envelope
function saveFn(name: string): SaveFn {
  const fn = (saveModule as unknown as Record<string, unknown>)[name]
  if (typeof fn !== 'function') throw new Error(`RED: save.ts does not export ${name} (the market's save step is ${MARKET_STEP})`)
  return fn as SaveFn
}
// Public migration admits its real input. For current saves it must refuse any
// nonempty recovery authority before the frozen P15 converter can run.
const migrateIntoStep = (save: unknown): Envelope => saveFn(`migrateToV${MARKET_STEP}`)(save)
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
const convertIntoStep = (save: unknown): Envelope => saveFn(`convertV${MARKET_STEP - 1}ToV${MARKET_STEP}`)(save)
const convertOutOfStep = (save: unknown): Envelope => saveFn(`convertV${MARKET_STEP}ToV${MARKET_STEP - 1}`)(migrateIntoStep(save))
const migrateBelowStep = (save: unknown): Envelope => saveFn(`migrateToV${MARKET_STEP - 1}`)(save)
const liveSave = (state: GameState): Envelope => makeSave(state) as unknown as Envelope
/** 1355-A §3.5 "refuse by name" (the save.ts:10686-10703 pattern). */
const DOWNGRADE_REFUSAL = /cannot downgrade or discard .*(shared.?market|market assessment)/i

// ── the new seam, typed locally so this file compiles before it exists ────────────
type SeamInputs = ReceptionInputs & { competitionFactor?: number }
type OpeningAppeal = { segmentAppealOpening: Record<SegmentId, number> }
type BoxOfficeWithFactor = (
  segmentAppeal: Record<SegmentId, number>, segments: ReceptionInputs['market']['segments'], baseMarketValue: number,
  standing: ReceptionInputs['standing'], promise: ReceptionInputs['promise'], budget: ReceptionInputs['budget'],
  shapeEffects: ReceptionInputs['shapeEffects'], openingSegmentAppeal: Record<SegmentId, number>, engaged: boolean,
  discoverabilityZ: number, openingStarDraw: number, setNoveltyFactor: number, competitionFactor: number,
) => ReturnType<typeof computeBoxOffice>
const boxOfficeWithFactor = computeBoxOffice as unknown as BoxOfficeWithFactor
type AdvanceWithFactors = (state: GameState, factorById?: ReadonlyMap<string, number>) => ReturnType<typeof advanceHollywoodWeek>
const advanceWithFactors = advanceHollywoodWeek as unknown as AdvanceWithFactors

// ── the phase table (1356-C's module, absent today) ──────────────────────────────
type PhaseTables = Record<number, { phaseId: string; phaseOrdinal: number }[]>
async function loadPhases(): Promise<{ tables: PhaseTables; version: number }> {
  let mod: Record<string, unknown>
  try {
    mod = (await import('../src/core/p15Phases.js')) as unknown as Record<string, unknown>
  } catch (error) {
    throw new Error(`RED: src/core/p15Phases.ts cannot be loaded (1355-F2 item 3; 1356-C owns it): ${(error as Error).message}`)
  }
  if (typeof mod.P15_PHASE_ORDER_VERSION !== 'number' || mod.P15_PHASE_TABLES === null || typeof mod.P15_PHASE_TABLES !== 'object') {
    throw new Error('RED: src/core/p15Phases.ts must export P15_PHASE_TABLES and P15_PHASE_ORDER_VERSION (1355-F2 item 3)')
  }
  return { tables: mod.P15_PHASE_TABLES as PhaseTables, version: mod.P15_PHASE_ORDER_VERSION }
}
async function marketTriple(): Promise<{ phaseId: string; phaseOrdinal: number; phaseOrderVersion: number }> {
  const { tables, version } = await loadPhases()
  const entry = tables[version]?.find((row) => row.phaseId === MARKET_PHASE_ID)
  if (entry === undefined) throw new Error(`p15Phases v${version} has no ${MARKET_PHASE_ID} entry (1355-F2 item 3)`)
  return { phaseId: MARKET_PHASE_ID, phaseOrdinal: entry.phaseOrdinal, phaseOrderVersion: version }
}

// ── pins and the capture (fixture-pending until 1355-P mints them) ──────────────
function readPins(computedNow: string): PinManifest {
  const url = new URL(`../${PIN_DIRECTORY}MANIFEST.json`, import.meta.url)
  if (!existsSync(url)) {
    throw new Error(`FIXTURE PENDING: ${PIN_DIRECTORY}MANIFEST.json is minted by 1355-P at the last writer below the ` +
      `P15 save step (1355-A §4 "pins minted at the RED commit on unchanged production"). Computed at this commit: ${computedNow}`)
  }
  const pins = JSON.parse(readFileSync(url, 'utf8')) as PinManifest
  expect(pins.record).toBe('1355-P')
  return pins
}
function readGz(directory: string, entry: { name: string; gzip: { bytes: number; sha256: string }; decoded: { bytes: number; sha256: string } }): string {
  const gz = readFileSync(new URL(`../${directory}${entry.name}.json.gz`, import.meta.url))
  expect(gz.byteLength).toBe(entry.gzip.bytes)
  expect(sha256(gz)).toBe(entry.gzip.sha256)
  const raw = gunzipSync(gz).toString('utf8')
  expect(Buffer.byteLength(raw, 'utf8')).toBe(entry.decoded.bytes)
  expect(sha256(raw)).toBe(entry.decoded.sha256)
  return raw
}

const MEDIUM = 300_000
const HEAVY = 600_000
const member = (row: { releaseId: string; studioId: string; genre: Genre }): Member =>
  ({ releaseId: row.releaseId, studioId: row.studioId, genre: row.genre })
const byRelease = <T extends { releaseId: string }>(rows: readonly T[]): T[] =>
  [...rows].sort((a, b) => (a.releaseId < b.releaseId ? -1 : a.releaseId > b.releaseId ? 1 : 0))
const playerId = (state: GameState): string => state.hollywood!.playerStudioId
const reason = (code: MarketReason['code'], sourceReleaseIds: string[], value: number): MarketReason => ({ code, sourceReleaseIds, value })

// ════════════════════════════════════════════════════════════════════════════════
// RED 1-2 — the reception seam (1355-A §3.2)
// ════════════════════════════════════════════════════════════════════════════════
describe('p15a1 market seam (RED 1-2, 1355-A §3.2)', () => {
  it('market-seam-default-exact: no factor and a factor of exactly 1 give bit-equal results [control]', () => {
    for (const c of receptionPinCases()) {
      const none = runPinCase(c)
      const one = runPinCase(c, { competitionFactor: 1 })
      // Object.is on every leaf (diffPaths): bit-equal, -0 included.
      expect(diffPaths(none, one), c.name).toEqual([])
      const args = [none.segmentAppeal, c.inputs.market.segments, c.inputs.market.baseMarketValue, c.inputs.standing,
        c.inputs.promise, c.inputs.budget, c.inputs.shapeEffects, (none as ReceptionResult & OpeningAppeal).segmentAppealOpening,
        c.engaged, c.z, none.starDraw, setNoveltyReceptionFactor(c.inputs.setNovelty ?? null)] as const
      expect(diffPaths(computeBoxOffice(...args), boxOfficeWithFactor(...args, 1)), c.name).toEqual([])
    }
  })

  it('market-seam-default-exact: the default path is bit-equal to the RED-commit pin [control, fixture-pending]', () => {
    const computed = receptionPinCases().map((c) => ({ name: c.name, digest: digest(runPinCase(c)) }))
    const pins = readPins(JSON.stringify(computed))
    expect(canon(computed)).toBe(canon(pins.reception))
  })

  it('market-seam-scales-opening-only: f < 1 scales the opening and total only; ReceptionResult reports f', () => {
    const factors = [pressureFactor(1), pressureFactor(2), 1 - TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY]
    for (const c of receptionPinCases()) {
      const control = runPinCase(c)
      for (const f of factors) {
        const scaled = runPinCase(c, { competitionFactor: f })
        expect(scaled.competitionFactor, `${c.name} f=${f}`).toBe(f)
        expect(scaled.criticScore).toBe(control.criticScore)
        expect(canon(scaled.segmentScores)).toBe(canon(control.segmentScores))
        expect(scaled.legs).toBe(control.legs)
        expect(scaled.weightedAudienceScore).toBe(control.weightedAudienceScore)
        const direct = boxOfficeWithFactor(control.segmentAppeal, c.inputs.market.segments, c.inputs.market.baseMarketValue,
          c.inputs.standing, c.inputs.promise, c.inputs.budget, c.inputs.shapeEffects,
          (control as ReceptionResult & OpeningAppeal).segmentAppealOpening, c.engaged, c.z, control.starDraw,
          setNoveltyReceptionFactor(c.inputs.setNovelty ?? null), f)
        expect(scaled.opening).toBe(direct.opening)
        expect(scaled.total).toBe(direct.total)
        expect(scaled.opening).toBeLessThan(control.opening)
      }
    }
  })

  it('market-seam-scales-opening-only: a factor outside [1 − SHARED_MARKET_FACTOR_MAX_PENALTY, 1] throws', () => {
    const floor = 1 - TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY
    const c = receptionPinCases()[1]!
    for (const f of [1 + 1e-9, 1.5, floor - 1e-9, 0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => runPinCase(c, { competitionFactor: f }), `f=${f}`).toThrow(/factor/i)
    }
    for (const f of [floor, 1]) expect(() => runPinCase(c, { competitionFactor: f })).not.toThrow()
    const inp: SeamInputs = { ...makeReceptionInputs(), competitionFactor: 0.5 }
    expect(() => resolveReception(inp, RngStream.fromSeed('p15a1-seam-oob'))).toThrow(/factor/i)
  })
})

// ════════════════════════════════════════════════════════════════════════════════
// RED 3 — forecast, package, agent and chooser paths ignore the root [controls]
// ════════════════════════════════════════════════════════════════════════════════
/** The root replaced by heavy pressure: two recent releases per genre on rivals, law-exact.
 * Today there is no root to replace and nothing that could read one, so the control compares
 * the state with itself (an unknown key would itself change today's tick: the live profession
 * proof is exact-keyed). With the step landed it asks whether any reader consumes the root.
 * The allocator is left as the state had it, so a sibling P15 step that allocates in the same
 * tick takes the same numbers in both runs (1356-F2 R3: survive a sibling P15 root). */
async function heavilyPressured(state: GameState): Promise<GameState> {
  if (!Object.hasOwn(state, 'sharedMarket')) return state
  const week = state.market.tick
  const rivals = state.hollywood!.businesses.map((b) => b.studioId)
  const releases: Released[] = GENRE_ORDER.flatMap((genre, i) => [0, 1].map((k) => ({
    releaseId: `p15a1-red-pressure-${genre}-${k}`, studioId: rivals[(i + k) % rivals.length]!, genre, week: week - 1 - k,
  })))
  const pressuredState = withSyntheticMarketRows(state, releases, await marketTriple())
  return { ...pressuredState, p15Sequence: (state as unknown as Record<string, unknown>).p15Sequence } as unknown as GameState
}
const withoutMarketRoot = (state: GameState): Record<string, unknown> => {
  const { sharedMarket: _market, ...rest } = detached(state) as unknown as Record<string, unknown>
  return rest
}

describe('p15a1 market forecast paths (RED 3, 1355-A §3.2 "never carry it")', () => {
  it('market-forecast-paths-unchanged: agent choices and forecast history ignore the root [control]', async () => {
    const state = routeAt(30)
    const heavy = await heavilyPressured(state)
    expect(canon(OracleAgent.chooseActions(heavy))).toBe(canon(OracleAgent.chooseActions(state)))
    for (const studioId of [playerId(state), ...state.hollywood!.businesses.map((b) => b.studioId)]) {
      expect(canon(forecastHistoryForOwner(heavy, studioId)), studioId).toBe(canon(forecastHistoryForOwner(state, studioId)))
    }
  }, MEDIUM)

  it('market-forecast-paths-unchanged: a week of rival decisions with no release ignores the root [control]', async () => {
    // The first rival-route week with no release due in which some rival greenlights: the
    // chooser, the forecast it locks and the package search all ran.
    let found: number | null = null
    for (let week = 2; week <= 120 && found === null; week++) {
      const before = rivalRouteAt(week)
      if (rivalDue(before).length > 0) continue
      const after = rivalRouteAt(week + 1)
      const ids = (s: GameState) => s.hollywood!.businesses.flatMap((b) => b.productions.map((p) => p.id))
      if (ids(after).some((id) => !ids(before).includes(id))) found = week
    }
    expect(found, 'premise: a no-release week with a rival greenlight by week 120').not.toBeNull()
    const state = rivalRouteAt(found!)
    expect(canon(withoutMarketRoot(tick(await heavilyPressured(state))))).toBe(canon(withoutMarketRoot(tick(state))))
  }, MEDIUM)
})

// ════════════════════════════════════════════════════════════════════════════════
// RED 4-5 — the due set and its witness (1355-A §3.1 items 3 and 5)
// ════════════════════════════════════════════════════════════════════════════════
describe('p15a1 market due set (RED 4-5, 1355-A §3.1)', () => {
  it('market-due-set-equals-releases: frozen members are the committed player release plus every rival picture at 1', () => {
    const pair = pairWeek()
    const ready = (s: GameState) => s.studio.activeProductions.filter((p) => p.remainingTicks === 1 && p.id !== pair.picture.productionId)
    const others = ready(pair.pre)
    expect(others.length, 'premise: two more held Release Ready pictures (one stays held, one is cancelled)').toBeGreaterThanOrEqual(2)
    const [held, cancelled] = [others[0]!, others[1]!]
    const state = cancelPicture(commitPictures(pair.pre, [pair.picture.productionId]), cancelled.id)
    const post = tick(state)
    const expected = byRelease([
      { releaseId: pair.picture.productionId, studioId: playerId(pair.pre), genre: pair.picture.genre },
      ...rivalDue(pair.pre),
    ])
    expect(canon(byRelease(rowsAt(post, pair.week).map(member)))).toBe(canon(expected))
    const assessed = new Set(marketRoot(post).assessments.map((row) => row.releaseId))
    expect(assessed.has(held.id), 'a held, uncommitted picture is not a member').toBe(false)
    expect(assessed.has(cancelled.id), 'a cancelled picture is not a member').toBe(false)
    expect(post.studio.activeProductions.some((p) => p.id === held.id && p.remainingTicks === 1)).toBe(true)
  }, MEDIUM)

  it('market-due-set-mismatch-fails-closed: a frozen batch missing a due rival picture throws, input unchanged', () => {
    const pair = pairWeek()
    const state = pair.pre
    const due = rivalDue(state)
    const before = canon(state)
    const lawful = new Map(due.map((m) => [m.releaseId, 1]))
    expect(() => advanceWithFactors(state, lawful)).not.toThrow()
    const missing = due[0]!
    const forged = new Map(due.slice(1).map((m) => [m.releaseId, 1]))
    expect(() => advanceWithFactors(state, forged)).toThrow(missing.releaseId)
    expect(canon(state)).toBe(before)
  }, MEDIUM)

  it('market-due-set-mismatch-fails-closed: a frozen batch naming a picture nobody releases throws, input unchanged', () => {
    const state = pairWeek().pre
    const before = canon(state)
    const phantom = new Map([...rivalDue(state).map((m) => [m.releaseId, 1] as const), ['p15a1-red-phantom-release', 1] as const])
    expect(() => advanceWithFactors(state, phantom)).toThrow('p15a1-red-phantom-release')
    expect(canon(state)).toBe(before)
  }, MEDIUM)
})

// ════════════════════════════════════════════════════════════════════════════════
// RED 6-9 — live batches (1355-A §3.1 items 2-4; Wave 1 law through the pipeline)
// ════════════════════════════════════════════════════════════════════════════════
describe('p15a1 market live batches (RED 6-9)', () => {
  it('market-live-one-player-one-rival: same genre, same week, both pressureFactor(1), each names the other', () => {
    const pair = pairWeek()
    const state = commitPictures(withEmptyMarketRoot(pair.pre, pair.week), [pair.picture.productionId])
    const post = tick(state)
    const rows = rowsAt(post, pair.week)
    const mine = rows.find((row) => row.releaseId === pair.picture.productionId)
    const theirs = rows.find((row) => row.releaseId === pair.rival.releaseId)
    expect(mine, 'the player release is assessed').toBeDefined()
    expect(theirs, 'the rival release is assessed').toBeDefined()
    const sameWeek = TUNING.SHARED_MARKET_WINDOW_WEIGHTS[0]!
    for (const [row, other, studioId] of [[mine!, theirs!, playerId(pair.pre)], [theirs!, mine!, pair.rival.studioId]] as const) {
      expect(row.studioId).toBe(studioId)
      expect(row.genre).toBe(pair.picture.genre)
      expect(row.pressure).toBe(sameWeek)
      expect(row.windowTerm).toBe(sameWeek)
      expect(row.stockTerm).toBe(0)
      expect(row.factor).toBe(pressureFactor(1))
      // Neither is the other's exposure: one same-week reason, no window or stock reason.
      expect(canon(row.reasons)).toBe(canon([reason('SAME_WEEK_RELEASES', [other.releaseId], sameWeek)]))
    }
  }, MEDIUM)

  it('market-live-window-stock-retire: releases at W−2, W−10 and W−26 act through WINDOW_RELEASES, GENRE_SATURATION and nothing', async () => {
    const solo = soloWeek()
    const week = solo.week
    const genre = solo.picture.genre
    const rivals = solo.pre.hollywood!.businesses.map((b) => b.studioId)
    const exposure = (offset: number, i: number): Released => ({
      releaseId: `p15a1-red-exposure-w${String(offset).padStart(2, '0')}`, studioId: rivals[i % rivals.length]!, genre, week: week - offset,
    })
    const retire = TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS
    const [retired, stock, window] = [exposure(retire, 0), exposure(10, 1), exposure(2, 2)]
    let state = withSyntheticMarketRows(solo.pre, [retired, stock, window], await marketTriple())
    state = commitPictures(state, [solo.picture.productionId])
    const post = tick(state)
    const rows = rowsAt(post, week)
    expect(rows.map((row) => row.releaseId)).toEqual([solo.picture.productionId])
    const row = rows[0]!
    const windowWeight = TUNING.SHARED_MARKET_WINDOW_WEIGHTS[2]!
    const stockWeight = TUNING.SHARED_MARKET_STOCK_START *
      2 ** (-(10 - TUNING.SHARED_MARKET_WINDOW_WEIGHTS.length) / TUNING.SHARED_MARKET_STOCK_HALF_LIFE_WEEKS)
    expect(row.windowTerm).toBe(windowWeight)
    expect(row.stockTerm).toBe(stockWeight)
    expect(row.pressure).toBe(windowWeight + stockWeight)
    expect(row.factor).toBe(pressureFactor(windowWeight + stockWeight))
    expect(canon(row.reasons)).toBe(canon([
      reason('WINDOW_RELEASES', [window.releaseId], windowWeight),
      reason('GENRE_SATURATION', [stock.releaseId], stockWeight),
    ]))
    expect(JSON.stringify(row)).not.toContain(retired.releaseId)
  }, MEDIUM)

  it('market-live-self-exclusion-clamp: one studio\'s two same-genre same-week releases see each other at 1.00, never themselves', () => {
    const twin = twinWeek()
    const ids = twin.twins.map((p) => p.productionId)
    const post = tick(commitPictures(withEmptyMarketRoot(twin.pre, twin.week), ids))
    const rows = rowsAt(post, twin.week).filter((row) => ids.includes(row.releaseId))
    expect(rows).toHaveLength(2)
    const sameWeek = TUNING.SHARED_MARKET_WINDOW_WEIGHTS[0]!
    const clamped = Math.min(sameWeek, TUNING.SHARED_MARKET_STUDIO_WINDOW_CAP)
    for (const row of rows) {
      const other = ids.find((id) => id !== row.releaseId)!
      expect(row.studioId).toBe(playerId(twin.pre))
      expect(row.windowTerm).toBe(clamped)
      expect(row.pressure).toBe(clamped)
      expect(row.factor).toBe(pressureFactor(clamped))
      expect(canon(row.reasons)).toBe(canon([reason('SAME_WEEK_RELEASES', [other], sameWeek)]))
      expect(row.reasons.flatMap((r) => r.sourceReleaseIds)).not.toContain(row.releaseId)
    }
  }, MEDIUM)

  it('market-live-no-player-flag: a persisted row carries exactly the law fields and the 1355-F2 fields, no owner', () => {
    const pair = pairWeek()
    const post = tick(commitPictures(withEmptyMarketRoot(pair.pre, pair.week), [pair.picture.productionId]))
    const rows = marketRoot(post).assessments
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) expect(Object.keys(row).sort()).toEqual([...PERSISTED_ROW_KEYS])
  }, MEDIUM)

  it('market-live-no-player-flag: mirror fixtures that swap the player studio give equal assessments after id normalization', () => {
    const pair = pairWeek()
    const base = detached(commitPictures(withEmptyMarketRoot(pair.pre, pair.week), [pair.picture.productionId]))
    const [p, r] = [playerId(base), pair.rival.studioId]
    const twin = swapStudioIds(base, p, r)
    expect(twin.hollywood!.playerStudioId).toBe(r)
    // Ids are relabelled, so the id-derived fields are set aside: the digest, the sequence (it
    // follows releaseId order) and the tie order inside a reason's source list (ties sort by id).
    const normalized = (rows: readonly PersistedAssessment[], swap: boolean): string => {
      const text = swap ? JSON.stringify(rows).split(p).join('\u0000').split(r).join(p).split('\u0000').join(r) : JSON.stringify(rows)
      return canon(byRelease((JSON.parse(text) as PersistedAssessment[])
        .map(({ p15DomainSequence: _s, inputDigest: _d, reasons, ...rest }) =>
          ({ ...rest, reasons: reasons.map((x) => ({ ...x, sourceReleaseIds: [...x.sourceReleaseIds].sort() })) }))))
    }
    const mine = rowsAt(tick(base), pair.week)
    const theirs = rowsAt(tick(twin), pair.week)
    expect(mine.length).toBeGreaterThanOrEqual(2)
    expect(normalized(theirs, true)).toBe(normalized(mine, false))
  }, MEDIUM)
})

// ════════════════════════════════════════════════════════════════════════════════
// RED 10-11 — K1 and K2 (1355-A §4): pins minted on unchanged production
// ════════════════════════════════════════════════════════════════════════════════
describe('p15a1 market chronology controls (RED 10-11, 1355-A §4 K1/K2)', () => {
  it('market-week-diff-confined (K1): the K1 week is pressured exactly where the law says', () => {
    const { k1 } = kRoute()
    const post = tick(k1.pre)
    const due = [...rivalDue(k1.pre), ...(k1.committed === null ? [] : [{ releaseId: k1.committed,
      studioId: playerId(k1.pre), genre: k1.pre.concepts.find((c) => c.id === k1.pre.studio.activeProductions
        .find((p) => p.id === k1.committed)!.conceptId)!.genre }])]
    const history = releaseHistory(k1.pre)
    const rows = rowsAt(post, k1.week)
    expect(canon(byRelease(rows.map(member)))).toBe(canon(byRelease(due)))
    for (const row of rows) expect(row.factor < 1, row.releaseId).toBe(pressured(member(row), due, history, k1.week))
    expect(rows.some((row) => row.factor < 1)).toBe(true)
  }, MEDIUM)

  it('market-week-diff-confined (K1): one pressured tick differs from the RED-commit pin only inside the pressured chain [control, fixture-pending]', () => {
    const { k1 } = kRoute()
    const post = tick(k1.pre)
    const pins = readPins(`K1 week ${k1.week}, committed ${String(k1.committed)}, post-tick digest ${digest(post)}`)
    expect(k1.week).toBe(pins.k1.week)
    expect(k1.committed).toBe(pins.k1.committed)
    const old = JSON.parse(readGz(PIN_DIRECTORY, pins.k1.capture)) as Record<string, unknown>
    const now = keepKeys(detached(historicalSave45Comparison(post)), pins.k1.keys)
    const root = (post as unknown as { sharedMarket?: { assessments: PersistedAssessment[] } }).sharedMarket
    const pressuredIds = new Set((root?.assessments ?? []).filter((row) => row.week === k1.week && row.factor < 1).map((row) => row.releaseId))
    // 1355-A §4 K1: identical facts, named.
    const h = (s: Record<string, unknown>) => s.hollywood as GameState['hollywood']
    expect(now.rngState).toBe(old.rngState)
    expect(canon(h(now)!.receipts.map((r) => [r.eventId, r.kind, r.week, r.studioId]))).toBe(canon(h(old)!.receipts.map((r) => [r.eventId, r.kind, r.week, r.studioId])))
    expect(canon(h(now)!.films.map((f) => f.filmId))).toBe(canon(h(old)!.films.map((f) => f.filmId)))
    expect(canon(h(now)!.businesses.map((b) => b.productions.map((p) => p.id)))).toBe(canon(h(old)!.businesses.map((b) => b.productions.map((p) => p.id))))
    expect(canon(now.firstTakes)).toBe(canon(old.firstTakes))
    expect(canon(h(now)!.businesses.map((b) => b.screenplayShelving))).toBe(canon(h(old)!.businesses.map((b) => b.screenplayShelving)))
    expect(canon([h(now)!.employment, h(now)!.activeEmploymentOrdinals])).toBe(canon([h(old)!.employment, h(old)!.activeEmploymentOrdinals]))
    // Every other difference stays inside the pressured releases' chain.
    const allowed = k1AllowedPaths(post, pressuredIds, k1.week)
    const outside = diffPaths(old, now).filter((path) => !allowed.some((pattern) => pattern.test(path)))
    expect(outside).toEqual([])
  }, MEDIUM)

  it('market-no-pressure-week-identity (K2): every release of the K2 week is assessed at P = 0 and f = 1', () => {
    const { k2 } = kRoute()
    const post = tick(k2.pre)
    const rows = rowsAt(post, k2.week)
    expect(canon(byRelease(rows.map(member)))).toBe(canon(byRelease(rivalDue(k2.pre))))
    for (const row of rows) {
      expect(row.pressure).toBe(0)
      expect(row.factor).toBe(1)
      expect(canon(row.reasons)).toBe(canon([reason('NO_PRESSURE', [], 0)]))
    }
  }, MEDIUM)

  it('market-no-pressure-week-identity (K2): the post-tick state minus the new roots is byte-equal to the RED-commit pin [control, fixture-pending]', () => {
    const { k2 } = kRoute()
    const post = tick(k2.pre)
    const keys = Object.keys(stripP15(post)).sort()
    const pins = readPins(`K2 week ${k2.week}, digest ${digest(keepKeys(post, keys))}`)
    expect(k2.week).toBe(pins.k2.week)
    expect(digest(keepKeys(historicalSave45Comparison(post), pins.k2.keys))).toBe(pins.k2.digest)
  }, MEDIUM)
})

// ════════════════════════════════════════════════════════════════════════════════
// RED 12-13 — the root append, derived exposures, allocation, in-flight replay
// ════════════════════════════════════════════════════════════════════════════════
const APPEND_WEEKS = 80
describe('p15a1 market root (RED 12-13, 1355-A §3.3; 1355-F2 item 2; 1355-F3)', () => {
  it('market-root-append-canonical: one ordered append per week; derived exposures equal reduceExposures', () => {
    let exposures: MarketExposure[] = []
    let assessedWeeks = 0
    for (let week = 0; week < APPEND_WEEKS; week++) {
      const pre = rivalRouteAt(week)
      const post = rivalRouteAt(week + 1)
      const before = marketRoot(pre)
      const after = marketRoot(post)
      expect(after.version).toBe(before.version)
      expect(after.recordedFromWeek).toBe(before.recordedFromWeek)
      expect(canon(after.assessments.slice(0, before.assessments.length)), `week ${week} prefix`).toBe(canon(before.assessments))
      const appended = after.assessments.slice(before.assessments.length)
      expect(canon(appended.map(member)), `week ${week} members`).toBe(canon(rivalDue(pre)))
      expect(appended.every((row) => row.week === week)).toBe(true)
      // Allocation (1355-F2 item 2): the batch takes the tick's first numbers, (week, releaseId) order.
      const next = sequenceRoot(pre).next
      expect(appended.map((row) => row.p15DomainSequence)).toEqual(appended.map((_, i) => next + i))
      expect(sequenceRoot(post).next).toBeGreaterThanOrEqual(next + appended.length)
      if (appended.length > 0) assessedWeeks++
      exposures = reduceExposures(exposures, { week, members: appended.map(member) }).exposures
      const derived = after.assessments
        .filter((row) => row.week <= week && row.week > week - TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS)
        .map((row) => ({ releaseId: row.releaseId, studioId: row.studioId, genre: row.genre, releaseWeek: row.week }))
      expect(canon(byRelease(derived)), `week ${week} exposures`).toBe(canon(byRelease(exposures)))
    }
    expect(assessedWeeks, 'premise: the rival route releases in several weeks').toBeGreaterThanOrEqual(3)
  }, HEAVY)

  it('market-root-append-canonical: rows ascend in (week, releaseId) and in p15DomainSequence, each with its v1 phase triple', async () => {
    const triple = await marketTriple()
    const rows = marketRoot(rivalRouteAt(APPEND_WEEKS)).assessments
    expect(rows.length).toBeGreaterThan(0)
    for (let i = 1; i < rows.length; i++) {
      const [a, b] = [rows[i - 1]!, rows[i]!]
      expect(a.week < b.week || (a.week === b.week && a.releaseId < b.releaseId), `row ${i} order`).toBe(true)
      expect(a.p15DomainSequence).toBeLessThan(b.p15DomainSequence)
    }
    for (const row of rows) {
      expect([row.phaseId, row.phaseOrdinal, row.phaseOrderVersion]).toEqual([triple.phaseId, triple.phaseOrdinal, triple.phaseOrderVersion])
    }
  }, HEAVY)

  it('market-inflight-save-replay: save during an active exposure, reload, run 30 weeks: assessments and terminal save equal an unsaved run', () => {
    let week = 20
    for (; week <= 100; week++) {
      const state = rivalRouteAt(week)
      const recent = releaseHistory(state).some((f) => week - f.week >= 1 && week - f.week < TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS)
      if (recent && rivalDue(state).length > 0) break
    }
    expect(week, 'premise: a week with a recent release and a release due').toBeLessThanOrEqual(100)
    const state = rivalRouteAt(week)
    expect(marketRoot(state).assessments.some((row) => row.week > week - TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS),
      'an active exposure at the save').toBe(true)
    let reloaded = migrateToLive(importSave(exportSave(makeSave(state)))).state as GameState
    for (let i = 0; i < 30; i++) reloaded = tick(reloaded)
    const unsaved = rivalRouteAt(week + 30)
    expect(canon(marketRoot(reloaded).assessments)).toBe(canon(marketRoot(unsaved).assessments))
    expect(exportSave(makeSave(reloaded))).toBe(exportSave(makeSave(unsaved)))
  }, HEAVY)
})

// ════════════════════════════════════════════════════════════════════════════════
// RED 14 — the save validator refuses by name (1355-A §3.4; 1355-F3 RED 14)
// ════════════════════════════════════════════════════════════════════════════════
const VALIDATOR_WEEK = 70
const SIBLING_WEEK = 66 // just after the week-65 quarter tick (1355-F4 R1)
function validatorBase(): GameState {
  return rivalRouteAt(VALIDATOR_WEEK)
}
type Forge = (state: GameState) => void
const rowsOf = (state: GameState): PersistedAssessment[] => marketRoot(state).assessments
const tripleOf = (row: PersistedAssessment) => ({ phaseId: row.phaseId, phaseOrdinal: row.phaseOrdinal, phaseOrderVersion: row.phaseOrderVersion })
/** Appends a row for `releaseId` at `week` (no earlier than the last row's week), sequenced at
 * `next`, and re-assesses that week's batch with it, so every stored row stays law-exact and only
 * the forged fact (a release with no film, or a week at the tick) is wrong, whatever order a
 * validator checks in. */
function appendLawRow(state: GameState, releaseId: string, week: number): void {
  const rows = rowsOf(state)
  const retire = TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS
  const genres = new Set(rows.filter((row) => row.week > week - retire).map((row) => row.genre))
  const genre = GENRE_ORDER.find((g) => !genres.has(g)) ?? GENRE_ORDER[0]!
  const exposures = rows.filter((row) => row.week < week && week - row.week < retire)
    .map((row) => ({ releaseId: row.releaseId, studioId: row.studioId, genre: row.genre, releaseWeek: row.week }))
  const sameWeek = rows.filter((row) => row.week === week)
  const studioId = state.hollywood!.businesses[0]!.studioId
  const assessed = assessBatch(exposures, { week, members: [...sameWeek.map(member), { releaseId, studioId, genre }] })
  const lawOf = (id: string) => assessed.find((row) => row.releaseId === id)!
  for (const row of sameWeek) Object.assign(row, lawOf(row.releaseId))
  const next = sequenceRoot(state).next
  rows.push({ ...lawOf(releaseId), p15DomainSequence: next, ...tripleOf(rows[0]!) })
  sequenceRoot(state).next = next + 1
}
const lastRow = (state: GameState): PersistedAssessment => rowsOf(state)[rowsOf(state).length - 1]!

const FORGERIES: { title: string; refusal: RegExp; forge: Forge }[] = [
  { title: 'a forged pressure', refusal: /pressure/i, forge: (s) => { rowsOf(s)[0]!.pressure += 0.125 } },
  { title: 'a forged factor', refusal: /factor/i, forge: (s) => { const r = rowsOf(s)[0]!; r.factor = r.factor === 1 ? 0.99 : 1 } },
  { title: 'a forged windowTerm', refusal: /windowTerm|term/i, forge: (s) => { rowsOf(s)[0]!.windowTerm += 0.5 } },
  { title: 'a forged stockTerm', refusal: /stockTerm|term/i, forge: (s) => { rowsOf(s)[0]!.stockTerm += 0.5 } },
  { title: 'a forged reason', refusal: /reason/i, forge: (s) => {
    const r = rowsOf(s)[0]!
    r.reasons = r.pressure > 0 ? [reason('NO_PRESSURE', [], 0)] : [reason('WINDOW_RELEASES', ['p15a1-red-ghost'], 0.55)]
  } },
  { title: 'a forged inputDigest', refusal: /inputDigest|digest/i, forge: (s) => { rowsOf(s)[0]!.inputDigest = '0000000000000000' } },
  { title: 'rows out of (week, releaseId) order', refusal: /order|ascend|sort/i, forge: (s) => {
    const rows = rowsOf(s)
    const i = rows.findIndex((row, k) => k > 0 && (row.week !== rows[k - 1]!.week || row.releaseId !== rows[k - 1]!.releaseId))
    ;[rows[i - 1], rows[i]] = [rows[i]!, rows[i - 1]!]
  } },
  { title: 'a duplicate assessment', refusal: /duplicate|twice|order|ascend/i, forge: (s) => {
    const rows = rowsOf(s)
    rows.splice(1, 0, structuredClone(rows[0]!))
  } },
  { title: 'an orphan assessment with no film', refusal: /zzzz-p15a1-red-orphan/, forge: (s) => {
    appendLawRow(s, 'zzzz-p15a1-red-orphan', lastRow(s).week)
  } },
  { title: 'a missing assessment', refusal: /missing|no assessment|lacks|without/i, forge: (s) => {
    const rows = rowsOf(s)
    // The latest row whose genre no later or same-week row shares: removing it moves no law value.
    const k = [...rows.keys()].reverse().find((i) => !rows.some((other, j) => j !== i && other.genre === rows[i]!.genre &&
      other.week >= rows[i]!.week && other.week - rows[i]!.week < TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS))
    if (k === undefined) throw new Error('fixture premise: no removable row')
    rows.splice(k, 1)
    sequenceRoot(s).next = Math.max(0, ...p15Rows(s).map((row) => row.p15DomainSequence)) + 1
  } },
  { title: 'an assessment before recordedFromWeek', refusal: /recordedFromWeek/, forge: (s) => {
    marketRoot(s).recordedFromWeek = rowsOf(s)[0]!.week + 1
  } },
  // A row at the tick has no film either, so the refusal may come from the range rule (naming the
  // tick) or from the bijection (naming the row); either names the forged fact.
  { title: 'an assessment at the tick', refusal: /tick|zzzz-p15a1-red-current-week/i, forge: (s) => {
    appendLawRow(s, 'zzzz-p15a1-red-current-week', s.market.tick)
  } },
  { title: 'an unknown definitionVersion', refusal: /definitionVersion|unknown/i, forge: (s) => {
    (rowsOf(s)[0] as unknown as { definitionVersion: string }).definitionVersion = 'p15a1-market-v2'
  } },
  { title: 'an unknown root version', refusal: /version/i, forge: (s) => { marketRoot(s).version = 2 } },
  { title: 'an owner field on a row (exact keys)', refusal: /key|owner|unexpected/i, forge: (s) => {
    (rowsOf(s)[0] as unknown as Record<string, unknown>).owner = 'player'
  } },
  { title: 'a duplicate p15DomainSequence', refusal: /p15DomainSequence|sequence/i, forge: (s) => {
    const rows = rowsOf(s)
    rows[rows.length - 1]!.p15DomainSequence = rows[rows.length - 2]!.p15DomainSequence
  } },
  { title: 'a p15DomainSequence at p15Sequence.next', refusal: /p15DomainSequence|sequence|next/i, forge: (s) => {
    lastRow(s).p15DomainSequence = sequenceRoot(s).next
  } },
  { title: 'a p15DomainSequence below 1', refusal: /p15DomainSequence|sequence/i, forge: (s) => { rowsOf(s)[0]!.p15DomainSequence = 0 } },
  { title: 'a stale p15Sequence.next', refusal: /p15Sequence|next/i, forge: (s) => {
    sequenceRoot(s).next = Math.max(...p15Rows(s).map((row) => row.p15DomainSequence))
  } },
  { title: 'a phase ordinal off its version\'s table entry', refusal: /phase/i, forge: (s) => { rowsOf(s)[0]!.phaseOrdinal += 1 } },
  { title: 'another phase\'s phaseId', refusal: /phase/i, forge: (s) => { rowsOf(s)[0]!.phaseId = 'p15a2.rankingRecord' } },
  { title: 'an unknown phaseOrderVersion', refusal: /phase|version/i, forge: (s) => { rowsOf(s)[0]!.phaseOrderVersion = 99 } },
]

describe('p15a1 market validator (RED 14, 1355-A §3.4)', () => {
  it('market-validator-reconciles: the unforged route state validates (premise of every refusal below)', () => {
    const state = validatorBase()
    expect(rowsOf(state).length, 'premise: rows in at least two weeks').toBeGreaterThanOrEqual(3)
    expect(new Set(rowsOf(state).map((row) => row.week)).size).toBeGreaterThanOrEqual(2)
    expect(() => makeSave(state)).not.toThrow()
  }, MEDIUM)

  for (const forgery of FORGERIES) {
    it(`market-validator-reconciles: refuses ${forgery.title} by name`, () => {
      const forged = structuredClone(validatorBase())
      forgery.forge(forged)
      expect(() => makeSave(forged)).toThrow(/sharedMarket|p15Sequence|p15DomainSequence/)
      expect(() => makeSave(forged)).toThrow(forgery.refusal)
    }, MEDIUM)
  }

  // 1355-F4 R1 (1355-F2 item 4): the allocator spans every P15 root. It reads sibling rows only
  // through `P15_ROOTS` and `p15DomainSequence` (the record field 1356-C pins). DECLARED re-pinned
  // at a sibling landing: by the landing order the ranking root exists at this wave's GREEN.
  it('market-validator-reconciles: across P15 roots, a sibling row may hold the largest sequence and a market row may not reuse a sibling\'s', () => {
    marketRoot(rivalRouteAt(SIBLING_WEEK)) // RED until the root exists
    const siblings = P15_ROOTS.filter((key) => key !== 'sharedMarket')
    const top = (state: GameState, roots?: readonly string[]): number =>
      Math.max(0, ...p15Rows(state, roots).map((row) => row.p15DomainSequence))
    const siblingHoldsTop = (state: GameState): boolean => top(state, siblings) > top(state, ['sharedMarket'])
    // rivalRouteAt(66) (1355-F4), or the next state whose largest sequence a sibling row holds: a
    // market batch in week 65 would otherwise take the largest number at 66.
    let week = SIBLING_WEEK
    while (week < ROUTE_CAP_WEEK && !siblingHoldsTop(rivalRouteAt(week))) week++
    const state = rivalRouteAt(week)
    expect(siblingHoldsTop(state), `premise (landing order): a sibling P15 row holds the largest p15DomainSequence by week ${week}`).toBe(true)
    // (a) It validates: `next` is one more than a sibling row's sequence, above every market row.
    expect(() => makeSave(state)).not.toThrow()
    // (b) A market row given a sibling row's sequence, with the market ascent kept, refuses by name.
    const forged = structuredClone(state)
    const market = rowsOf(forged)
    const reused = p15Rows(forged, siblings).map((row) => row.p15DomainSequence).sort((a, b) => a - b)
      .find((n) => market.some((row) => row.p15DomainSequence > n))
    expect(reused, 'premise: a sibling sequence below some market row').toBeDefined()
    market.find((row) => row.p15DomainSequence > reused!)!.p15DomainSequence = reused!
    expect(() => makeSave(forged)).toThrow(/p15DomainSequence/)
    expect(() => makeSave(forged)).toThrow(/duplicate/i)
  }, HEAVY)
})

// ════════════════════════════════════════════════════════════════════════════════
// RED 15 — the era guard (1355-A §3.4 item 5) [control]
// ════════════════════════════════════════════════════════════════════════════════
describe('p15a1 market era guard (RED 15)', () => {
  it('market-definition-era-guard: while the definition is p15a1-market-v1 its seven TUNING values are v1\'s [control]', () => {
    const seven = {
      SHARED_MARKET_WINDOW_WEIGHTS: TUNING.SHARED_MARKET_WINDOW_WEIGHTS,
      SHARED_MARKET_STOCK_START: TUNING.SHARED_MARKET_STOCK_START,
      SHARED_MARKET_STOCK_HALF_LIFE_WEEKS: TUNING.SHARED_MARKET_STOCK_HALF_LIFE_WEEKS,
      SHARED_MARKET_RETIRE_AFTER_WEEKS: TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS,
      SHARED_MARKET_FACTOR_MAX_PENALTY: TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY,
      SHARED_MARKET_PRESSURE_SCALE: TUNING.SHARED_MARKET_PRESSURE_SCALE,
      SHARED_MARKET_STUDIO_WINDOW_CAP: TUNING.SHARED_MARKET_STUDIO_WINDOW_CAP,
    }
    // The v1 era, frozen (1355-A §3.4 item 5): a retune bumps the definition, keeps these
    // numbers reachable for old records and adds an old-law fixture; it never edits them here.
    const v1 = {
      SHARED_MARKET_WINDOW_WEIGHTS: [1, 0.55, 0.55, 0.2], SHARED_MARKET_STOCK_START: 0.2,
      SHARED_MARKET_STOCK_HALF_LIFE_WEEKS: 13, SHARED_MARKET_RETIRE_AFTER_WEEKS: 26,
      SHARED_MARKET_FACTOR_MAX_PENALTY: 0.25, SHARED_MARKET_PRESSURE_SCALE: 2, SHARED_MARKET_STUDIO_WINDOW_CAP: 1,
    }
    if (SHARED_MARKET_DEFINITION === 'p15a1-market-v1') expect(canon(seven)).toBe(canon(v1))
    else expect(SHARED_MARKET_DEFINITION, 'a later definition must ship its own old-law fixture').not.toBe('p15a1-market-v1')
  })
})

// ════════════════════════════════════════════════════════════════════════════════
// RED 16 — the old save (1355-A §3.5; 1355-F Amendment 3; 1355-F3 RED 16)
// ════════════════════════════════════════════════════════════════════════════════
type CaptureManifest = { saveVersion: number; inputs: { name: string; gzip: { bytes: number; sha256: string }; decoded: { bytes: number; sha256: string } }[] }
/** 1355-F4: the minted MANIFEST's sha256, pinned here after 1355-P runs (it covers every input). From the recorded mint 1360-p15a1-mint (1360-F ruling 4). */
const CAPTURE_MANIFEST_SHA256: string | null = '410d48a8c8590e9c6177db2df34b186aab875525626d726eadf09263555dc794'
function belowStepCaptures(): Envelope[] {
  const url = new URL(`../${CAPTURE_DIRECTORY}MANIFEST.json`, import.meta.url)
  if (!existsSync(url)) {
    throw new Error(`FIXTURE PENDING: no genuine capture below the P15 save step at ${CAPTURE_DIRECTORY} ` +
      `(1355-F Amendment 3: minted by 1355-P at the last Save${MARKET_STEP - 1} writer)`)
  }
  const bytes = readFileSync(url)
  if (CAPTURE_MANIFEST_SHA256 === null) {
    throw new Error(`FIXTURE PENDING: pin CAPTURE_MANIFEST_SHA256 = '${sha256(bytes)}' (the minted ${CAPTURE_DIRECTORY}MANIFEST.json) in this file`)
  }
  expect(sha256(bytes)).toBe(CAPTURE_MANIFEST_SHA256)
  const manifest = JSON.parse(bytes.toString('utf8')) as CaptureManifest
  expect(manifest.saveVersion).toBe(MARKET_STEP - 1)
  expect(manifest.inputs.length).toBeGreaterThan(0)
  return manifest.inputs.map((input) => {
    const capture = importSave(readGz(CAPTURE_DIRECTORY, input)) as unknown as Envelope
    expect(capture.saveVersion).toBe(MARKET_STEP - 1)
    return capture
  })
}

describe('p15a1 market old saves (RED 16)', () => {
  it('market-old-save: the genuine capture below the step loads to the empty root at its tick; a second migration is a no-op; it round-trips while empty [fixture-pending]', () => {
    for (const capture of belowStepCaptures()) {
      const live = convertIntoStep(capture)
      expect(live.saveVersion).toBe(MARKET_STEP)
      expect(canon(marketRoot(live.state))).toBe(canon({ version: 1, recordedFromWeek: capture.state.market.tick, assessments: [] }))
      expect(exportSave(migrateIntoStep(live) as never)).toBe(exportSave(live as never))
      currentFromStep(live)
      expect(canon(convertOutOfStep(live))).toBe(canon(capture))
    }
  }, MEDIUM)

  it('market-old-save: the first batches after migration see no pre-migration release [fixture-pending]', () => {
    // 1355-F4: the ramp premise is asserted here (moved from the producer): a recent rival release and
    // an in-flight rival picture of its genre that it would press if the migration carried it.
    const ramped = belowStepCaptures().flatMap((capture) => {
      const premise = capturePremise(capture.state)
      return premise === null ? [] : [{ capture, premise }]
    })
    expect(ramped.length, 'premise: a capture with a recent rival release and an in-flight rival picture of its genre').toBeGreaterThan(0)
    for (const { capture, premise } of ramped) {
      const migrationWeek = capture.state.market.tick
      const before = new Set(releaseHistory(capture.state).map((film) => film.releaseId))
      let state = currentFromStep(convertIntoStep(capture)).state
      for (let i = 0; i < TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS; i++) state = tick(state)
      const rows = marketRoot(state).assessments
      const paired = rows.find((row) => row.releaseId === premise.inFlightProductionId)
      expect(paired, `${premise.inFlightProductionId} is assessed within 26 weeks of the migration`).toBeDefined()
      expect(JSON.stringify(paired!.reasons)).not.toContain(premise.recentReleaseId)
      const firstWeek = rows[0]!.week
      for (const row of rows) {
        expect(row.week).toBeGreaterThanOrEqual(migrationWeek)
        for (const r of row.reasons) for (const id of r.sourceReleaseIds) expect(before.has(id), `${row.releaseId} cites ${id}`).toBe(false)
        if (row.week === firstWeek) expect(row.reasons.map((r) => r.code)).not.toContain('WINDOW_RELEASES')
        if (row.week === firstWeek) expect(row.reasons.map((r) => r.code)).not.toContain('GENRE_SATURATION')
      }
      // The stored law reconciles from post-migration rows alone, so no earlier release adds pressure.
      expect(() => makeSave(state)).not.toThrow()
    }
  }, HEAVY)

  it('market-old-save: the genuine Save42 week-130 capture lifts to an empty root at its own week and steps down losslessly while empty', () => {
    const v42 = genuineV42Week130()
    const live = migrateIntoStep(v42)
    expect(canon(marketRoot(live.state))).toBe(canon({ version: 1, recordedFromWeek: 130, assessments: [] }))
    expect(exportSave(migrateIntoStep(live) as never)).toBe(exportSave(live as never))
    currentFromStep(live)
    const down = convertOutOfStep(live)
    expect(down.saveVersion).toBe(MARKET_STEP - 1)
    expect(Object.hasOwn(down.state, 'sharedMarket')).toBe(false)
    expect(canon(down)).toBe(canon(migrateBelowStep(v42)))
  }, MEDIUM)

  it('market-old-save: a non-empty root refuses the downgrade by name, at the step and through every older migrator', () => {
    const state = validatorBase()
    expect(rowsOf(state).length, 'premise: a recorded assessment').toBeGreaterThan(0)
    const save = liveSave(state)
    expect(() => convertOutOfStep(save)).toThrow(DOWNGRADE_REFUSAL)
    for (let version = 4; version < MARKET_STEP; version++) {
      const migrate = saveFn(`migrateToV${version}`)
      expect(() => migrate(save), `migrateToV${version}`).toThrow(DOWNGRADE_REFUSAL)
    }
  }, MEDIUM)
})

// ════════════════════════════════════════════════════════════════════════════════
// RED 17 — the disengaged world (1355-A §3.1 item 1)
// ════════════════════════════════════════════════════════════════════════════════
let m0aMemo: GameState[] | null = null
const m0aStates = (): GameState[] => (m0aMemo ??= m0aRoute())
describe('p15a1 market disengaged world (RED 17)', () => {
  it('market-disengaged-world: with no industry there is no batch: the root stays empty at week 0 and no market row exists anywhere', () => {
    const states = m0aStates()
    expect(states[states.length - 1]!.studio.releasedFilms.length, 'premise: the M0A route releases films').toBeGreaterThan(0)
    for (const state of states) {
      expect(state.hollywood).toBeNull()
      expect(canon(marketRoot(state)), `week ${state.market.tick}`).toBe(canon({ version: 1, recordedFromWeek: 0, assessments: [] }))
      expect(JSON.stringify(state), `week ${state.market.tick}`).not.toContain(MARKET_PHASE_ID)
    }
  }, HEAVY)

  it('market-disengaged-world: the M0A outputs equal the RED-commit pin [control, fixture-pending]', () => {
    const states = m0aStates()
    const last = states[states.length - 1]!
    const keys = Object.keys(stripP15(last)).sort()
    const pins = readPins(`M0A ${states.length} weeks, digest ${digest(keepKeys(last, keys))}`)
    expect(states.length).toBe(pins.m0a.weeks)
    expect(digest(keepKeys(last, pins.m0a.keys))).toBe(pins.m0a.digest)
  }, HEAVY)
})

// ════════════════════════════════════════════════════════════════════════════════
// RED 18 — persisted storage stays linear (annex L.6 invariant 11)
// ════════════════════════════════════════════════════════════════════════════════
const ROW_BYTE_CEILING = 3_200 // Wave 1's 3,000-byte law-record ceiling plus the four 1355-F2 scalars
describe('p15a1 market persisted storage (RED 18)', () => {
  it('market-large-batch-persisted-linear: every live row is bounded: exact keys, at most five reasons of at most five ids', () => {
    const rows = marketRoot(rivalRouteAt(APPEND_WEEKS)).assessments
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(Object.keys(row).sort()).toEqual([...PERSISTED_ROW_KEYS])
      expect(row.reasons.length).toBeLessThanOrEqual(5)
      for (const r of row.reasons) expect(r.sourceReleaseIds.length).toBeLessThanOrEqual(MARKET_REASON_SOURCE_LIMIT)
      expect(JSON.stringify(row).length).toBeLessThan(ROW_BYTE_CEILING)
    }
  }, HEAVY)

  it('market-large-batch-persisted-linear: 32- and 512-member batches persist equal-bounded rows and linear root bytes', () => {
    const template = marketRoot(rivalRouteAt(APPEND_WEEKS)).assessments[0]
    expect(template, 'premise: a live row supplies the persisted shape').toBeDefined()
    const persisted = (size: number, tag: string): string[] => {
      const members = Array.from({ length: size }, (_, i) => ({
        releaseId: `${tag}-${String(i).padStart(4, '0')}`, studioId: `S-${String(i % 64).padStart(2, '0')}`, genre: GENRE_ORDER[i % GENRE_ORDER.length]!,
      }))
      return assessBatch([], { week: 900, members }).map((row, i) => JSON.stringify({
        ...row, p15DomainSequence: 1_000_000 + i, ...tripleOf(template!),
      }))
    }
    const small = persisted(32, 'SMLL')
    const large = persisted(512, 'LRGE')
    const bytes = (rows: string[]) => rows.reduce((sum, row) => sum + row.length, 0)
    // Per-assessment bytes do not grow with the batch: both sizes sit under one constant
    // ceiling and their means stay within half of each other (a denser batch can fill more
    // of the five reason slots, never more than five). Root bytes are therefore linear.
    for (const rows of [small, large]) expect(Math.max(...rows.map((row) => row.length))).toBeLessThan(ROW_BYTE_CEILING)
    const meanRatio = (bytes(large) / large.length) / (bytes(small) / small.length)
    expect(meanRatio).toBeGreaterThan(1 / 1.5)
    expect(meanRatio).toBeLessThan(1.5)
    expect(bytes(large) / bytes(small)).toBeLessThan(16 * 1.5)
  }, HEAVY)
})
