// ── P15C Wave 2 — the Legacy in the live game: the fact adapter, the 2040 freeze and the
// root `campaignLegacy`. RED tests (record 1359-C; r2 1359-C2 under 1359-F2; r4 1359-C4 under 1359-F3; r6 1359-C6 under 1353-F7). ──
//
// Authority ($E = docs/engineering/playability-launch-review/evidence/p14b4-20260919):
// 1359-A §3 (the adapter), §4 (the boundary), §5 (the root), §8 (this RED list), as adopted
// by 1359-F: Amendment 1 (the validator replays the official manifest under the evaluator
// its definition names; `legacy-validate-replay`; an old-law fixture), Amendment 2 (the
// `state.concepts` retention guard, added to tests/p15c-wave-r-retention.test.ts) and
// Amendment 3 (save.ts may read `postFinaleMode`; D1-D3 moved to Wave 1, landed at
// 321a4378). 1353-J note 2: definition versioning is a comment today; the old-law leaf
// proves it in code. 1355-F2 item 7: a P15 watermark is the root's largest
// `p15DomainSequence`; the finale's phase id is `p15c.finale`. Out of scope: the end-of-run
// manifest (§6, Wave 5), the Bridge views and the ceremony (§7, Waves 3-4), the G-P/G-L
// measurements (§9, the parent's).
//
// FIXTURES. No natural campaign in a test reaches week 6240 from a fresh founding, so:
// - G6240: the genuine Save38 capture at week 6240 of the 1052 active endurance run (A,
//   observer fixed), pinned by bytes and sha256, migrated through the public chain. A
//   fresh-origin campaign: 122 player films with runs, 20 live and 8 authored rival films,
//   732 + 120 career events, 9 adoptions.
// - G6240F: G6240 with ONE named forgery, `campaignLegacy.recordedFromWeek` set to 0 (the
//   campaign as if it had carried the root from world start), then the freeze step
//   applied. The full validator accepts it before any leaf reads it (1359-A §8).
// - week 130: the genuine Save42 capture of tests/p14d1-rival-shelving-fixtures.ts
//   (rivals 5-9 not yet entered, a rival film still in its run).
// - Route L (late founding), natural throughout: generateWorld, a year of headless M0A
//   releases by OracleAgent (no economy: no run, no career event), idle headless ticks to
//   week 6188, the studio founded there through the migration origin (r4, 1359-F3: the
//   minimum roster signed and the draft closed before `initializeHollywood(…, 'migration')`;
//   every studio entered at 6188), then ordinary ticks through 6241 with the draft closed,
//   extended to 6760 for the post-freeze leaves. The code is tests/helpers/p15c2-route-l.ts,
//   shared with the capture producer 1359-P.
// - Route L's genuine captures at weeks 6239 and 6240, minted by 1359-P at the last writer
//   below the Legacy's save step (1355-F Amendment 3 rules): C2-C4 read them. Not minted yet
//   (FIXTURE PENDING); the parent mints them before the recorded RED (1359-F2).
// Adapter leaves also feed the adapter named edits of a validated base (sentinels, a
// removed concept, a legacyCompleted run, sibling roots shaped per 1355-A §3.3, 1356-A §5
// and 1357-A §4 with 1355-F2's sequence and triple). Those edits are never saved.
// DECLARED (1359-F2 item 6; 1359-D item 6): three leaves feed the engine a state the save
// validator refuses, by design. A9 and B5 remove a released film's concept (the validator's
// released-film check refuses it; the charter's B5 ticks it), and B3 ticks an official manifest
// at week 6239 (the marker rule refuses it; B3 asserts that refusal). None of them saves it.
//
// SAVE VERSION. Nothing here names a future version. STEP is the live constant; the step's
// own functions are found by name (`convertV${STEP-1}ToV${STEP}` and back,
// `migrateToV${STEP-1}`), the convention 1356-C uses. Today STEP is 44, so those leaves run
// the Save44 functions and fail on the missing root. A later step pins STEP in its sweep.
//
// SIBLING ROOTS (1356-F2 R3; 1359-F2 item 3). tests/helpers/p15-roots.ts holds the one list of P15
// root keys, `P15_ROOTS`, shared with 1356-C; this patch adds `campaignLegacy`, and whichever RED
// lands second merges the list. `p15Rows` walks those roots for any object carrying a
// `p15DomainSequence`, so no leaf guesses a sibling's row paths.
// ASSUMED ORDER (1359-A §10 item 3): P15C lands with or after its siblings. Under that order every
// leaf here passes at this wave's GREEN. If P15C lands first, the charter gives each sibling's §3
// branch and A7 case to that sibling's production; the forged-root leaves below then move to that
// sibling's landing patch, since P15C's production need not read a root that has not landed (the
// reference reads them untyped, so it passes them in either order).
// DECLARED, re-pinned at a sibling's landing:
//   - `P15_ROOTS`: the second landing merges the list.
//   - B1 `legacy-tick-freezes-once-at-6240` and C4 `legacy-migration-past-boundary-genuine-save38`
//     count new P15 rows over `P15_ROOTS`; they hold once the sibling's key is listed.
//   - A3, A5, A7, A8 and B4 forge sibling roots in the shapes of 1356-A §5 (`powerRanking.snapshots`),
//     1357-A §4 (`corporateCondition.events`, `loans`) and 1355-A §3.3 (`sharedMarket.assessments`);
//     each is re-pinned to the landed shape at that sibling's landing.
//   - C2 and C5 compare the keys a step adds or strips, so they hold for a shared step and a separate one.
// The leaves that need a sibling's step or root in the live state left this RED (1359-F2): B2,
// B4b, C3b, C8b and C10c are in 1359-p15c-wave2-sibling.patch, and B7 is a note for P15B's RED.
//
// BUDGETS: self-timed (1359-F2 item 2), measured by 1359-X2 and set by 1359-F4; see tests/helpers/p15c2-legacy.ts.
//
// ERAS (1353-F6 rulings 2-3, 1353-F7 ruling 3). The live law is `campaign-legacy/v2`: 1353-T's retune with 1353-F6's
// hit line (critic 60, hit line 49, share floor 20). `LEGACY_DEFINITIONS` keeps v1 frozen beside v2. C11 pins both
// entries, the table's key set and the live era as literals; the old-law leaf builds a real v1 manifest on this tree.
//
// RED REASONS. Every RED leaf first resolves the Wave 2 surface (`legacyFactsFromState`,
// `freezeCampaignLegacyWeek`, `LEGACY_DEFINITIONS`, the `campaignLegacy` root), so it fails
// fast and by name today; C2-C4 fail on their pending captures first. The two `legacy-control-*`
// leaves pass today, and no leaf here stays red after this wave's GREEN (1359-F2). Strict TypeScript;
// no unseeded randomness; TUNING by name; states compared at the serialization level (1344-X6).

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildLegacyManifest,
  CAMPAIGN_LEGACY_DEFINITION,
  LEGACY_ARCHETYPE_IDS,
  LEGACY_BOUNDARY_WEEK,
  LEGACY_BOUNDS,
  LEGACY_DOMAIN_IDS,
  LEGACY_LENS_IDS,
  LEGACY_POST_FINALE_MODE,
  type LegacyCareerEventFact,
  type LegacyFacts,
  type LegacyFilmFact,
} from '../src/core/campaignLegacy.js'
import type { IndustryFilm, LiveIndustryFilm } from '../src/core/hollywoodTypes.js'
import * as saveModule from '../src/core/save.js'
import { exportSave, importSave, makeSave, migrateToLive } from '../src/core/save.js'
import { TECHNOLOGY_CATALOGUE } from '../src/core/technologyCatalogue.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState, TalentCareerEvent } from '../src/core/types.js'
import { generateWorld } from '../src/core/worldgen.js'
import { P15_ROOTS, p15Rows, stripP15 } from './helpers/p15-roots.js'
import {
  asSaveFile,
  B,
  belowStepCaptures,
  budgeted,
  canon,
  captureAt,
  convertIntoStep,
  convertOutOfStep,
  definitionsTable,
  DOWNGRADE_REFUSAL,
  factsFn,
  genuine6240,
  genuineFrozen,
  genuineSave38,
  legacyOf,
  lensOf,
  MARKER,
  memo,
  migrateBelowStep,
  newRows,
  officialOf,
  EXTENSION_MS,
  FIXTURE_MS,
  POST_FREEZE_MS,
  ROUTE_MS,
  rawOf,
  refuses,
  sequenceOf,
  sourceOf,
  STEP,
  stepFn,
  tamper,
  thrownMessage,
  withoutStamp,
  withRoot,
  type Archetype,
  type DefinitionEntry,
  type Envelope,
  type Official,
  type Ref,
} from './helpers/p15c2-legacy.js'
import { FOUNDING_WEEK, ROUTE_SEED, routeAt, routeL } from './helpers/p15c2-route-l.js'
import { liveWeek130 } from './p14d1-rival-shelving-fixtures.js'

/** The live version at this RED's base, Save44 since relationship slice B (1358-L): a fact of the base. */
const BASE_LIVE_SAVE_VERSION = 44

// ── shapes and helpers only these leaves use (the shared ones: tests/helpers/p15c2-legacy.ts) ──
type Band = 'inTheRed' | 'strained' | 'stable' | 'thriving'
type Stage = 'stable' | 'warning' | 'distress' | 'recovery' | 'closed'

const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)
const byKey = <T>(rows: readonly T[], key: (row: T) => string): T[] => [...rows].sort((a, b) => compareText(key(a), key(b)))
const isLive = (film: IndustryFilm): film is LiveIndustryFilm => film.provenance === 'simulation/v1'

/** A cited ref's place: an archetype side or a lens's refs. */
type RefAt = { studio: number; archetype: number | null; lens: number | null; side: 'qualifying' | 'contrary' | 'refs'; index: number }
function findRef(official: Official, accept: (ref: Ref) => boolean): RefAt {
  for (const [studio, row] of official.studios.entries()) {
    for (const [archetype, result] of row.archetypes.entries()) {
      for (const side of ['qualifying', 'contrary'] as const) {
        const index = result[side].findIndex(accept)
        if (index >= 0) return { studio, archetype, lens: null, side, index }
      }
    }
    for (const [lens, result] of row.lenses.entries()) {
      const index = result.refs.findIndex(accept)
      if (index >= 0) return { studio, archetype: null, lens, side: 'refs', index }
    }
  }
  throw new Error('premise: the official manifest cites no ref of the kind this leaf tampers')
}
function refAt(official: Official, at: RefAt): Ref {
  const studio = official.studios[at.studio]!
  const list = at.lens !== null ? studio.lenses[at.lens]!.refs
    : studio.archetypes[at.archetype!]![at.side === 'contrary' ? 'contrary' : 'qualifying']
  return list[at.index]!
}
/** The first archetype that cites at least one ref. */
function citingArchetype(official: Official): Archetype {
  const found = official.studios.flatMap((row) => row.archetypes).find((a) => a.qualifying.length + a.contrary.length > 0)
  if (found === undefined) throw new Error('premise: an archetype that cites a ref')
  return found
}

/** Array domains: a ref's position is its row's index + 1 in the root (1359-A §5.1 item 7). */
function arrayRows(state: GameState): Record<string, readonly string[]> {
  const h = state.hollywood!
  return {
    playerFilms: state.studio.releasedFilms.map((film) => film.productionId),
    industryFilms: h.films.map((film) => film.filmId),
    playerCareerEvents: state.careerEvents.map((event) => event.eventId),
    industryCareerEvents: h.careerEvents.map((event) => event.eventId),
    technologyAdoptions: state.technology.adoptions.map((adoption) => adoption.id),
    technologyCatalogue: TECHNOLOGY_CATALOGUE.map((technology) => technology.id),
  }
}

// ── forged sibling rows, shaped per their adopted charters (the adapter reads few fields) ──
function rankingRecord(sequence: number, week: number, rows: { studioId: string; rank: number | null; band: Band }[]): Record<string, unknown> {
  return {
    id: `power-ranking-${sequence}`, p15DomainSequence: sequence, phaseId: 'p15a2.rankingRecord', phaseOrdinal: 2, phaseOrderVersion: 1,
    week, definitionVersion: 'power-ranking/v1', available: true, windowStartWeek: week - 52,
    rows: rows.map((row) => ({ studioId: row.studioId, ranked: row.rank !== null, rank: row.rank, filmsTenths: 0, releases: 0,
      releasesTenths: 0, countedFilmIds: [], band: row.band })),
  }
}
const rankingRoot = (recordedFromWeek: number, snapshots: Record<string, unknown>[]): Record<string, unknown> =>
  ({ version: 1, recordedFromWeek, snapshots })
function conditionEvent(sequence: number, n: number, studioId: string, week: number, from: Stage, to: Stage, causes: number[] = [1]): Record<string, unknown> {
  return {
    eventId: `corporate-event-${n}`, studioId, week, from, to, causes, definitionVersion: 'corporate-condition/v1',
    p15DomainSequence: sequence, phaseId: 'p15b.condition', phaseOrdinal: 3, phaseOrderVersion: 1,
  }
}
function conditionLoan(sequence: number, n: number, studioId: string, week: number, money = 1_000_000): Record<string, unknown> {
  return {
    loanId: `corporate-loan-${n}`, studioId, lawVersion: 'studio-loan/v1', contractedWeek: week, weeklyFixedCostAtContract: money,
    principal: money, total: money, installments: Array.from({ length: 52 }, () => money),
    p15DomainSequence: sequence, phaseId: 'p15b.condition', phaseOrdinal: 3, phaseOrderVersion: 1,
  }
}
const conditionRoot = (recordedFromWeek: number, events: Record<string, unknown>[], loans: Record<string, unknown>[],
  studios: Record<string, unknown>[] = []): Record<string, unknown> =>
  ({ version: 1, recordedFromWeek, nextEvent: events.length + 1, nextLoan: loans.length + 1, studios, events, loans })
function assessment(sequence: number, releaseId: string, studioId: string, week: number, factor: number): Record<string, unknown> {
  return {
    releaseId, studioId, genre: 'drama', week, definitionVersion: 'p15a1-market-v1', pressure: 1 - factor, factor,
    windowTerm: 0, stockTerm: 0, inputDigest: 'digest', reasons: [],
    p15DomainSequence: sequence, phaseId: 'p15a1.marketBatch', phaseOrdinal: 1, phaseOrderVersion: 1,
  }
}
const marketRoot = (recordedFromWeek: number, assessments: Record<string, unknown>[]): Record<string, unknown> =>
  ({ version: 1, recordedFromWeek, assessments })

// ── the adapter's expected output, derived here from 1359-A §3.1-§3.2 (never from production) ──
function expectedFilms(state: GameState, boundary: number): LegacyFilmFact[] {
  const h = state.hollywood!
  const genreOf = new Map(state.concepts.map((concept) => [concept.id, concept.genre]))
  const runOf = new Map(state.theatricalRuns.map((run) => [run.productionId, run]))
  const films: LegacyFilmFact[] = []
  for (const film of state.studio.releasedFilms) {
    const run = runOf.get(film.productionId)
    const settledWeek = run === undefined || run.status === 'legacyCompleted' ? film.releaseTick
      : film.releaseTick + run.totalWeeks <= boundary ? film.releaseTick + run.totalWeeks - 1 : null
    films.push({
      filmId: film.productionId, studioId: h.playerStudioId, domainId: 'playerFilms', provenance: 'campaign',
      releaseWeek: film.releaseTick, genre: genreOf.get(film.conceptId)!, criticScore: film.criticScore, audienceScore: null,
      status: settledWeek === null ? 'inRun' : 'settled', settledWeek,
      grossSettled: settledWeek === null ? null : film.boxOffice.total, credits: [],
    })
  }
  for (const film of h.films) {
    if (isLive(film)) {
      const settled = film.settledWeek !== null && film.settledWeek < boundary
      films.push({
        filmId: film.filmId, studioId: film.studioId, domainId: 'industryFilms', provenance: 'campaign',
        releaseWeek: film.result.releaseTick, genre: film.genre, criticScore: film.result.criticScore, audienceScore: null,
        status: settled ? 'settled' : 'inRun', settledWeek: settled ? film.settledWeek : null,
        grossSettled: settled ? film.result.boxOffice.total : null, credits: [],
      })
    } else {
      // Authored: settled, null (1359-A §3.1). The landed law refuses a settled film without a
      // whole settledWeek (campaignLegacy.ts:351); see the handback, finding F1.
      films.push({
        filmId: film.filmId, studioId: film.studioId, domainId: 'industryFilms', provenance: 'authored', releaseWeek: null,
        genre: film.genre, criticScore: film.criticScore, audienceScore: film.audienceScore, status: 'settled',
        settledWeek: null, grossSettled: film.totalGross, credits: film.credits.map((c) => ({ talentId: c.talentId, role: c.role })),
      })
    }
  }
  return films
}
const eventFact = (event: TalentCareerEvent, domainId: LegacyCareerEventFact['domainId']): LegacyCareerEventFact => ({
  eventId: event.eventId, filmId: event.filmId, talentId: event.talentId, domainId, role: event.role,
  releaseWeek: event.releaseWeek, genre: event.genre, audienceScore: event.audienceScore,
})
function expectedDomains(state: GameState): { domainId: string; highWatermark: number; recordedFromWeek: number | null }[] {
  const h = state.hollywood!
  const raw = rawOf(state)
  const largest = (rows: readonly { p15DomainSequence: number }[]): number => rows.reduce((max, row) => Math.max(max, row.p15DomainSequence), 0)
  const sibling = (domainId: string, key: string, rowsOf: (root: Record<string, unknown>) => { p15DomainSequence: number }[]) => {
    const root = raw[key] as Record<string, unknown> | undefined
    return root === undefined || (root.recordedFromWeek as number) >= B
      ? { domainId, highWatermark: 0, recordedFromWeek: null }
      : { domainId, highWatermark: largest(rowsOf(root)), recordedFromWeek: root.recordedFromWeek as number }
  }
  type Rows = { p15DomainSequence: number }[]
  return [
    { domainId: 'playerFilms', highWatermark: state.studio.releasedFilms.length, recordedFromWeek: 0 },
    { domainId: 'industryFilms', highWatermark: h.films.length, recordedFromWeek: h.originWeek },
    { domainId: 'playerRuns', highWatermark: state.theatricalRuns.length, recordedFromWeek: 0 },
    { domainId: 'playerCareerEvents', highWatermark: state.careerEvents.length, recordedFromWeek: 0 },
    { domainId: 'industryCareerEvents', highWatermark: h.careerEvents.length, recordedFromWeek: h.originWeek },
    { domainId: 'technologyAdoptions', highWatermark: state.technology.adoptions.length, recordedFromWeek: state.technology.recordingStartedWeek },
    { domainId: 'technologyCatalogue', highWatermark: TECHNOLOGY_CATALOGUE.length, recordedFromWeek: 0 },
    sibling('powerRanking', 'powerRanking', (root) => root.snapshots as Rows),
    sibling('corporateCondition', 'corporateCondition', (root) => [...(root.events as Rows), ...(root.loans as Rows)]),
    sibling('marketAssessments', 'sharedMarket', (root) => root.assessments as Rows),
  ]
}
const domainOf = (facts: LegacyFacts, domainId: string): unknown => facts.domains.find((row) => row.domainId === domainId)
const pickStatus = (film: LegacyFilmFact | undefined): unknown =>
  film === undefined ? undefined : { status: film.status, settledWeek: film.settledWeek, grossSettled: film.grossSettled }
function enteredIds(state: GameState): string[] {
  return state.hollywood!.identities.filter((identity) => identity.enteredWeek !== null)
    .sort((a, b) => a.row - b.row).map((identity) => identity.studioId)
}

const week130 = memo((): GameState => liveWeek130())

// ── route L (tests/helpers/p15c2-route-l.ts, shared with the 1359-P capture producer) ──
type Extension = { at: Map<number, GameState>; firstRootChange: number | null; ms: number }
/** Route L from 6241 to 6760: 520 ticks after the freeze (1353-A §8, carried). */
const extension = memo((): Extension => {
  const started = performance.now()
  const frozenRoot = canon(legacyOf(routeAt(B)))
  const keep = new Map<number, GameState>()
  let state = routeAt(B + 1)
  let firstRootChange: number | null = canon(legacyOf(state)) === frozenRoot ? null : state.market.tick
  while (state.market.tick < B + 520) {
    state = tick(state)
    if (firstRootChange === null && canon(legacyOf(state)) !== frozenRoot) firstRootChange = state.market.tick
    if (state.market.tick === 6300 || state.market.tick === B + 520) keep.set(state.market.tick, state)
  }
  return { at: keep, firstRootChange, ms: performance.now() - started }
})
function extended(week: 6300 | 6760): GameState {
  const state = extension().at.get(week)
  if (state === undefined) throw new Error(`route premise: no extended state at week ${week}`)
  return state
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLS — pass today: the fixtures are lawful without Wave 2
// ═══════════════════════════════════════════════════════════════════════════
describe('p15c2 controls: the fixtures are lawful at RED and at GREEN', () => {
  it('legacy-control-late-founding-route-lawful', budgeted(ROUTE_MS, () => {
    const run = routeL()
    const founded = run.foundedAtFounding
    expect(founded.hollywood?.origin).toBe('migration')
    expect(founded.hollywood?.originWeek).toBe(FOUNDING_WEEK)
    expect(founded.hollywood!.identities.every((identity) => identity.enteredWeek === FOUNDING_WEEK)).toBe(true)
    // The two rules a public founding after week 0 breaks (1359-F3; 1356-F5): the draft is closed, so rival
    // method locks are lawful (technology.ts:897), and the roster was signed before the industry arrived,
    // so each contract is observed, not signed inside it (hollywoodValidation.ts:568-569).
    expect(founded.founding, 'the founding draft is closed (1359-F3)').toBeNull()
    const roster = founded.hollywood!.employment.filter((row) => row.studioId === founded.hollywood!.playerStudioId)
    expect(roster.length, 'premise: the founding roster').toBeGreaterThan(0)
    expect(roster.every((row) => row.reason === 'existing-player-contract'), 'observed at the origin (1359-F3)').toBe(true)
    const runs = new Set(founded.theatricalRuns.map((r) => r.productionId))
    expect(founded.studio.releasedFilms.length, 'the headless year released player films').toBeGreaterThan(0)
    expect(founded.studio.releasedFilms.every((film) => !runs.has(film.productionId) && film.releaseTick < FOUNDING_WEEK)).toBe(true)
    expect(founded.careerEvents).toHaveLength(0)
    makeSave(founded)
    for (const week of [B - 2, B - 1, B, B + 1]) {
      expect(routeAt(week).market.tick).toBe(week)
      expect(makeSave(routeAt(week)).saveVersion).toBe(STEP)
    }
    for (const week of [B - 1, B, B + 1]) {
      const state = run.headless.get(week)!
      expect(state.hollywood).toBeNull()
      makeSave(state)
    }
    console.info(JSON.stringify({ kind: '1359-legacy-route-timing', seed: ROUTE_SEED, ...run.ms }))
    expect(run.ms.headlessTo6188 + run.ms.industry6188To6241, 'route L build against its budget').toBeLessThanOrEqual(ROUTE_MS)
  }), ROUTE_MS)

  it('legacy-control-genuine-save38-6240-lawful', budgeted(FIXTURE_MS, () => {
    expect(genuineSave38().state.hollywood?.origin).toBe('fresh')
    const state = genuine6240()
    expect(state.market.tick).toBe(B)
    expect(state.studio.releasedFilms).toHaveLength(122)
    expect(state.hollywood!.films.filter(isLive)).toHaveLength(20)
    expect(state.hollywood!.films.filter((film) => !isLive(film))).toHaveLength(8)
    expect(state.careerEvents).toHaveLength(732)
    expect(state.hollywood!.careerEvents).toHaveLength(120)
    expect(state.technology.adoptions).toHaveLength(9)
    expect(makeSave(state).saveVersion).toBe(STEP)
  }), FIXTURE_MS)
})

// ═══════════════════════════════════════════════════════════════════════════
// A. the fact adapter `legacyFactsFromState(state, boundaryWeek)` (1359-A §3)
// ═══════════════════════════════════════════════════════════════════════════
describe('p15c2 adapter: legacyFactsFromState (1359-A §3.1-§3.2, RED A1-A9)', () => {
  it('legacy-adapter-film-facts', budgeted(FIXTURE_MS, () => {
    const facts = factsFn()
    const cases: [string, GameState, number][] = [['genuine Save38 at 6240', genuine6240(), B], ['genuine Save42 at 130', week130(), 130]]
    for (const [label, state, boundary] of cases) {
      const actual = facts(state, boundary)
      expect(actual.boundaryWeek, label).toBe(boundary)
      expect(canon(byKey(actual.films, (f) => f.filmId)), label).toBe(canon(byKey(expectedFilms(state, boundary), (f) => f.filmId)))
    }
    const kinds = new Set(facts(genuine6240(), B).films.map((f) => `${f.domainId}/${f.provenance}`))
    expect([...kinds].sort(), 'premise: all three film kinds').toEqual(['industryFilms/authored', 'industryFilms/campaign', 'playerFilms/campaign'])
  }), FIXTURE_MS)

  it('legacy-adapter-run-status', budgeted(FIXTURE_MS, () => {
    const facts = factsFn()
    const base = genuine6240()
    const film = (state: GameState, boundary: number, id: string) => facts(state, boundary).films.find((f) => f.filmId === id)
    const runs = [...base.theatricalRuns].sort((a, b) => a.releaseTick + a.totalWeeks - (b.releaseTick + b.totalWeeks) || compareText(a.productionId, b.productionId))
    const last = runs[runs.length - 1]!
    expect(last.totalWeeks, 'premise: a run longer than one week').toBeGreaterThan(1)
    const end = last.releaseTick + last.totalWeeks
    const gross = base.studio.releasedFilms.find((f) => f.productionId === last.productionId)!.boxOffice.total
    // A completed run whose last payment falls at B − 1 against B: settled at releaseTick + totalWeeks − 1.
    expect(pickStatus(film(base, end, last.productionId))).toEqual({ status: 'settled', settledWeek: end - 1, grossSettled: gross })
    // The same run one week earlier: in run, no week, no gross.
    expect(pickStatus(film(base, end - 1, last.productionId))).toEqual({ status: 'inRun', settledWeek: null, grossSettled: null })
    // legacyCompleted (named edit): settled at its release week, whatever its length.
    const legacy: GameState = { ...base, theatricalRuns: base.theatricalRuns.map((r) => (r.productionId === last.productionId ? { ...r, status: 'legacyCompleted' as const } : r)) }
    expect(pickStatus(film(legacy, end - 1, last.productionId))).toEqual({ status: 'settled', settledWeek: last.releaseTick, grossSettled: gross })
    // No run (named edit): settled at its release week. Route L's natural no-run films: the next leaf.
    const runless: GameState = { ...base, theatricalRuns: base.theatricalRuns.filter((r) => r.productionId !== last.productionId) }
    expect(pickStatus(film(runless, end - 1, last.productionId))).toEqual({ status: 'settled', settledWeek: last.releaseTick, grossSettled: gross })
    // Rival: settledWeek null reads in run; settledWeek B − 1 reads settled; settledWeek B reads in run.
    const state = week130()
    const live = state.hollywood!.films.filter(isLive)
    const open = live.find((f) => f.settledWeek === null)
    expect(open, 'premise: a rival film still in its run at week 130').toBeDefined()
    expect(pickStatus(film(state, 130, open!.filmId))).toEqual({ status: 'inRun', settledWeek: null, grossSettled: null })
    const closed = live.filter((f) => f.settledWeek !== null).sort((a, b) => a.settledWeek! - b.settledWeek! || compareText(a.filmId, b.filmId))
    const latest = closed[closed.length - 1]!
    const settledWeek = latest.settledWeek!
    expect(pickStatus(film(state, settledWeek + 1, latest.filmId))).toEqual({ status: 'settled', settledWeek, grossSettled: latest.result.boxOffice.total })
    expect(pickStatus(film(state, settledWeek, latest.filmId))).toEqual({ status: 'inRun', settledWeek: null, grossSettled: null })
  }), FIXTURE_MS)

  it('legacy-adapter-run-status-natural-no-run', budgeted(ROUTE_MS, () => {
    const facts = factsFn()
    const state = routeAt(B)
    const runs = new Set(state.theatricalRuns.map((r) => r.productionId))
    const runless = state.studio.releasedFilms.filter((film) => !runs.has(film.productionId))
    expect(runless.length, 'route premise: the headless year released films with no run').toBeGreaterThan(0)
    const byId = new Map(facts(state, B).films.map((f) => [f.filmId, f]))
    const genreOf = new Map(state.concepts.map((concept) => [concept.id, concept.genre]))
    for (const film of runless) {
      expect(pickStatus(byId.get(film.productionId))).toEqual({ status: 'settled', settledWeek: film.releaseTick, grossSettled: film.boxOffice.total })
      expect(byId.get(film.productionId)!.genre).toBe(genreOf.get(film.conceptId))
    }
  }), ROUTE_MS)

  it('legacy-adapter-private-money-never-read', budgeted(FIXTURE_MS, () => {
    const facts = factsFn()
    const S = {
      rivalAccount: 987654321.111, rivalRuns: 987654322.222, directCommitment: 987654323.333, studioRevenueReceived: 987654324.444,
      loan: 987654325.555, careerMoney: 987654326.666, careerSkill: 987654327.777, playerCash: 987654328.888,
      ledger: 987654329.999, inRunPaid: 987654330.123, unsettledGross: 987654331.234, conditionCounters: 987654332.345,
    } as const
    const leaks = (text: string): string[] => Object.entries(S).filter(([, value]) => text.includes(String(value))).map(([key]) => key)
    // Case 1: the genuine 6240 campaign at a B where its last player run is still paying.
    const base = genuine6240()
    expect(base.ledger.length, 'premise').toBeGreaterThan(0)
    expect(base.careerEvents.length, 'premise').toBeGreaterThan(0)
    expect(base.hollywood!.careerEvents.length, 'premise').toBeGreaterThan(0)
    const runs = [...base.theatricalRuns].sort((a, b) => a.releaseTick + a.totalWeeks - (b.releaseTick + b.totalWeeks))
    const last = runs[runs.length - 1]!
    const boundary = last.releaseTick + last.totalWeeks - 1
    const s = structuredClone(base)
    const h = s.hollywood!
    const rivals = enteredIds(s).filter((id) => id !== h.playerStudioId)
    for (const business of h.businesses) {
      business.account.cash = S.rivalAccount
      business.account.openingBalance = S.rivalAccount
      for (const period of business.account.periods) {
        period.opening = S.rivalAccount
        period.closing = S.rivalAccount
        for (const kind of Object.keys(period.movements) as (keyof typeof period.movements)[]) period.movements[kind] = S.rivalAccount
      }
      business.runs = [...business.runs, {
        productionId: `${business.studioId}:sentinel`, conceptId: 'sentinel', releaseTick: 0, totalWeeks: 1, weekIndex: 0,
        weeklyGross: [S.rivalRuns], studioShare: S.rivalRuns, cumulativeGrossPaid: S.rivalRuns,
        cumulativeStudioRevenuePaid: S.rivalRuns, economyModelVersion: 1, status: 'active',
      }]
    }
    for (const film of h.films) {
      if (!isLive(film)) continue
      film.directCommitment = S.directCommitment
      film.studioRevenueReceived = S.studioRevenueReceived
    }
    for (const event of [...s.careerEvents, ...h.careerEvents]) {
      event.realizedOpening = S.careerMoney
      event.realizedTotal = S.careerMoney
      event.forecastComparator = S.careerMoney
      for (const key of ['billingWeight', 'ovrBefore', 'ovrAfter', 'genreExpBefore', 'genreExpAfter', 'workHistoryBefore',
        'workHistoryAfter', 'starPowerBefore', 'starPowerAfter', 'starPowerDelta'] as const) event[key] = S.careerSkill
      for (const map of [event.skillsBefore, event.skillsAfter, event.skillDeltas]) for (const skill of Object.keys(map)) map[skill] = S.careerSkill
    }
    s.studio.cash = S.playerCash
    s.ledger = s.ledger.map((entry) => ({ ...entry, amount: S.ledger }))
    s.theatricalRuns = s.theatricalRuns.map((run) => ({ ...run, weeklyGross: run.weeklyGross.map(() => S.inRunPaid),
      studioShare: S.inRunPaid, cumulativeGrossPaid: S.inRunPaid, cumulativeStudioRevenuePaid: S.inRunPaid }))
    s.studio.releasedFilms = s.studio.releasedFilms.map((film) => (film.productionId === last.productionId
      ? { ...film, boxOffice: { opening: S.unsettledGross, total: S.unsettledGross } } : film))
    const withLoan = withRoot(s, 'corporateCondition', conditionRoot(6000,
      [conditionEvent(1, 1, rivals[0]!, 6100, 'stable', 'warning', [S.conditionCounters])],
      [conditionLoan(2, 1, rivals[0]!, 6101, S.loan)],
      [{ studioId: rivals[0]!, firstEvaluatedWeek: 6001, definitionVersion: 'corporate-condition/v1', condition: { cash: S.conditionCounters } }]))
    const genuineFacts = facts(withLoan, boundary)
    expect(genuineFacts.films.find((f) => f.filmId === last.productionId)?.status, 'premise: the sentinel film is in its run').toBe('inRun')
    expect(leaks(JSON.stringify(genuineFacts)), 'facts').toEqual([])
    expect(leaks(JSON.stringify(buildLegacyManifest(genuineFacts, 'endOfRun'))), 'manifest').toEqual([])
    // Case 2: a rival film in its run at week 130 keeps its gross to date private.
    const w130 = structuredClone(week130())
    const open = w130.hollywood!.films.filter(isLive).find((f) => f.settledWeek === null)!
    open.result.boxOffice = { opening: S.unsettledGross, total: S.unsettledGross }
    const rivalFacts = facts(w130, 130)
    expect(leaks(JSON.stringify(rivalFacts)), 'facts at 130').toEqual([])
    expect(leaks(JSON.stringify(buildLegacyManifest(rivalFacts, 'endOfRun'))), 'manifest at 130').toEqual([])
  }), FIXTURE_MS)

  it('legacy-adapter-career-events', budgeted(FIXTURE_MS, () => {
    const facts = factsFn()
    const state = genuine6240()
    expect(state.careerEvents.length, 'premise').toBeGreaterThan(0)
    expect(state.hollywood!.careerEvents.length, 'premise').toBeGreaterThan(0)
    const actual = facts(state, B).careerEvents
    for (const row of actual) {
      expect(Object.keys(row).sort()).toEqual(['audienceScore', 'domainId', 'eventId', 'filmId', 'genre', 'releaseWeek', 'role', 'talentId'])
    }
    const expected = [
      ...state.careerEvents.map((event) => eventFact(event, 'playerCareerEvents')),
      ...state.hollywood!.careerEvents.map((event) => eventFact(event, 'industryCareerEvents')),
    ]
    expect(canon(byKey(actual, (e) => e.eventId))).toBe(canon(byKey(expected, (e) => e.eventId)))
  }), FIXTURE_MS)

  it('legacy-adapter-studios', budgeted(FIXTURE_MS, () => {
    const facts = factsFn()
    const state = genuine6240()
    const h = state.hollywood!
    const channels = (st: { audienceAwareness: number; industryPrestige: number; commercialConfidence: number }) =>
      ({ audienceAwareness: st.audienceAwareness, industryPrestige: st.industryPrestige, commercialConfidence: st.commercialConfidence })
    const standingOf = (studioId: string) => (studioId === h.playerStudioId ? state.studio.standing
      : h.businesses.find((business) => business.studioId === studioId)!.standing)
    const expected = h.identities.filter((identity) => identity.enteredWeek !== null).sort((a, b) => a.row - b.row)
      .map((identity) => ({ studioId: identity.studioId, row: identity.row, enteredWeek: identity.enteredWeek, closedWeek: null,
        standing: channels(standingOf(identity.studioId)) }))
    // Row order, both Standing sources, and closedWeek null without the condition root.
    expect(canon(facts(state, B).studios)).toBe(canon(expected))
    // With the root: the week of the studio's → closed event; every other studio null.
    const r03 = h.identities.find((identity) => identity.row === 3)!.studioId
    const withCondition = withRoot(state, 'corporateCondition', conditionRoot(6000, [
      conditionEvent(1, 1, r03, 6100, 'stable', 'warning'), conditionEvent(2, 2, r03, 6110, 'warning', 'distress'),
      conditionEvent(3, 3, r03, 6140, 'distress', 'closed')], []))
    const studios = facts(withCondition, B).studios
    expect(studios.find((row) => row.studioId === r03)?.closedWeek).toBe(6140)
    expect(studios.filter((row) => row.studioId !== r03).map((row) => row.closedWeek)).toEqual(Array.from({ length: studios.length - 1 }, () => null))
    // Entered identities only: at week 130 rows 5-9 have not entered.
    const w130 = week130()
    expect(facts(w130, 130).studios.map((row) => row.studioId)).toEqual(enteredIds(w130))
    expect(enteredIds(w130).length, 'premise').toBeLessThan(w130.hollywood!.identities.length)
  }), FIXTURE_MS)

  it('legacy-adapter-domain-facts', budgeted(FIXTURE_MS, () => {
    const facts = factsFn()
    const state = genuine6240()
    const actual = facts(state, B)
    expect(actual.domains.map((row) => row.domainId).sort()).toEqual(LEGACY_DOMAIN_IDS.filter((id) => id !== 'awards').slice().sort())
    expect(canon(byKey(actual.domains, (row) => row.domainId))).toBe(canon(byKey(expectedDomains(state), (row) => row.domainId)))
    expect(actual.baseMarketValue).toBe(state.market.baseMarketValue)
    expect(canon(byKey(actual.technologies, (t) => t.technologyId)))
      .toBe(canon(byKey(TECHNOLOGY_CATALOGUE.map((t) => ({ technologyId: t.id, commercialWeek: t.commercialWeek })), (t) => t.technologyId)))
    expect(canon(byKey(actual.adoptions, (a) => a.adoptionId))).toBe(canon(byKey(state.technology.adoptions.map((a) => ({
      adoptionId: a.id, studioId: a.studioId, technologyId: a.technologyId, operationalWeek: a.operationalWeek,
      cancelledWeek: a.cancelledWeek })), (a) => a.adoptionId)))
  }), FIXTURE_MS)

  it('legacy-adapter-sibling-roots', budgeted(FIXTURE_MS, () => {
    const facts = factsFn()
    const base = week130()
    const [s0, s1, s2] = enteredIds(base)
    expect(s2, 'premise: three entered studios').toBeDefined()
    const live = base.hollywood!.films.filter(isLive)
    const cases = [
      {
        key: 'powerRanking', domainId: 'powerRanking', factKey: 'rankingSnapshots',
        empty: (from: number) => rankingRoot(from, []),
        rows: rankingRoot(100, [rankingRecord(3, 104, [{ studioId: s0!, rank: 1, band: 'stable' }, { studioId: s1!, rank: null, band: 'thriving' }]),
          rankingRecord(7, 117, [{ studioId: s0!, rank: 2, band: 'strained' }])]),
        expected: [{ recordId: 'power-ranking-3', week: 104, studioId: s0, rank: 1, band: 'stable' },
          { recordId: 'power-ranking-3', week: 104, studioId: s1, rank: null, band: 'thriving' },
          { recordId: 'power-ranking-7', week: 117, studioId: s0, rank: 2, band: 'strained' }],
        watermark: 7,
      },
      {
        key: 'corporateCondition', domainId: 'corporateCondition', factKey: 'conditionEvents',
        empty: (from: number) => conditionRoot(from, [], []),
        rows: conditionRoot(100, [conditionEvent(4, 1, s2!, 105, 'stable', 'warning'), conditionEvent(6, 2, s2!, 110, 'warning', 'stable')],
          [conditionLoan(5, 1, s2!, 106)]),
        expected: [{ eventId: 'corporate-event-1', studioId: s2, week: 105, from: 'stable', to: 'warning' },
          { eventId: 'corporate-event-2', studioId: s2, week: 110, from: 'warning', to: 'stable' }],
        watermark: 6,
      },
      {
        key: 'sharedMarket', domainId: 'marketAssessments', factKey: 'marketAssessments',
        empty: (from: number) => marketRoot(from, []),
        rows: marketRoot(100, [assessment(2, live[0]!.filmId, live[0]!.studioId, 110, 0.9), assessment(8, live[1]!.filmId, live[1]!.studioId, 112, 1)]),
        expected: [{ assessmentId: live[0]!.filmId, studioId: live[0]!.studioId, week: 110, assessed: true, underPressure: true },
          { assessmentId: live[1]!.filmId, studioId: live[1]!.studioId, week: 112, assessed: true, underPressure: false }],
        watermark: 8,
      },
    ]
    const rowsOf = (f: LegacyFacts, key: string): unknown => (f as unknown as Record<string, unknown>)[key]
    const sorted = (rows: unknown): string => canon(byKey(rows as Record<string, unknown>[], (row) => canon(row)))
    for (const c of cases) {
      const absent = facts(withRoot(base, c.key, undefined), 130)
      expect(domainOf(absent, c.domainId), `${c.key} absent`).toEqual({ domainId: c.domainId, highWatermark: 0, recordedFromWeek: null })
      expect(rowsOf(absent, c.factKey), `${c.key} absent`).toBeUndefined()
      const empty = facts(withRoot(base, c.key, c.empty(100)), 130)
      expect(domainOf(empty, c.domainId), `${c.key} empty from 100`).toEqual({ domainId: c.domainId, highWatermark: 0, recordedFromWeek: 100 })
      expect(rowsOf(empty, c.factKey), `${c.key} empty from 100`).toEqual([])
      const withRows = facts(withRoot(base, c.key, c.rows), 130)
      expect(domainOf(withRows, c.domainId), `${c.key} with rows`).toEqual({ domainId: c.domainId, highWatermark: c.watermark, recordedFromWeek: 100 })
      expect(sorted(rowsOf(withRows, c.factKey)), `${c.key} with rows`).toBe(sorted(c.expected))
      buildLegacyManifest(withRows, 'endOfRun') // the adapter's facts are lawful input for the law
      // Recorded from B or later: it arrived after the boundary and reads exactly as absent (1359-A §5.1 item 6).
      const late = facts(withRoot(base, c.key, c.empty(130)), 130)
      expect(domainOf(late, c.domainId), `${c.key} recorded from B`).toEqual({ domainId: c.domainId, highWatermark: 0, recordedFromWeek: null })
      expect(rowsOf(late, c.factKey), `${c.key} recorded from B`).toBeUndefined()
    }
  }), FIXTURE_MS)

  it('legacy-adapter-p15-watermarks', budgeted(FIXTURE_MS, () => {
    const facts = factsFn()
    const base = week130()
    const [s0, s1] = enteredIds(base)
    const live = base.hollywood!.films.filter(isLive)
    const watermark = (key: string, root: Record<string, unknown>, domainId: string): unknown =>
      (domainOf(facts(withRoot(base, key, root), 130), domainId) as { highWatermark?: unknown } | undefined)?.highWatermark
    const row = (studioId: string, rank: number) => ({ studioId, rank, band: 'stable' as const })
    expect(watermark('powerRanking', rankingRoot(100, [rankingRecord(3, 104, [row(s0!, 1)]), rankingRecord(12, 117, [row(s0!, 1)])]), 'powerRanking')).toBe(12)
    expect(watermark('powerRanking', rankingRoot(100, []), 'powerRanking')).toBe(0)
    // The condition domain's largest sequence spans its events AND its loans.
    expect(watermark('corporateCondition', conditionRoot(100, [conditionEvent(4, 1, s1!, 105, 'stable', 'warning'),
      conditionEvent(8, 2, s1!, 110, 'warning', 'stable')], [conditionLoan(5, 1, s1!, 106)]), 'corporateCondition')).toBe(8)
    expect(watermark('corporateCondition', conditionRoot(100, [conditionEvent(4, 1, s1!, 105, 'stable', 'warning'),
      conditionEvent(6, 2, s1!, 110, 'warning', 'stable')], [conditionLoan(5, 1, s1!, 106), conditionLoan(9, 2, s1!, 111)]), 'corporateCondition')).toBe(9)
    expect(watermark('corporateCondition', conditionRoot(100, [], []), 'corporateCondition')).toBe(0)
    expect(watermark('sharedMarket', marketRoot(100, [assessment(2, live[0]!.filmId, live[0]!.studioId, 110, 1),
      assessment(5, live[1]!.filmId, live[1]!.studioId, 111, 1)]), 'marketAssessments')).toBe(5)
    expect(watermark('sharedMarket', marketRoot(100, []), 'marketAssessments')).toBe(0)
  }), FIXTURE_MS)

  it('legacy-adapter-missing-concept-refuses', budgeted(FIXTURE_MS, () => {
    const facts = factsFn()
    const base = genuine6240()
    const film = base.studio.releasedFilms[0]!
    const without: GameState = { ...base, concepts: base.concepts.filter((concept) => concept.id !== film.conceptId) }
    expect(without.concepts).toHaveLength(base.concepts.length - 1)
    const message = thrownMessage(() => facts(without, B))
    expect(message).toContain(film.conceptId)
    expect(message).toMatch(/concept/i)
    expect(() => facts(base, B)).not.toThrow()
  }), FIXTURE_MS)
})

// ═══════════════════════════════════════════════════════════════════════════
// B. the boundary: the tick producing 6240 (1359-A §4)
// ═══════════════════════════════════════════════════════════════════════════
describe('p15c2 boundary: the freeze as the tick\'s last step (1359-A §4, RED B1-B9)', () => {
  it('legacy-tick-freezes-once-at-6240', budgeted(ROUTE_MS, () => {
    stepFn()
    const facts = factsFn()
    const [s6238, s6239, s6240, s6241] = [routeAt(B - 2), routeAt(B - 1), routeAt(B), routeAt(B + 1)]
    // 6238 → 6239 writes nothing.
    expect(legacyOf(s6239).official).toBeNull()
    expect(canon(legacyOf(s6239))).toBe(canon(legacyOf(s6238)))
    expect(sequenceOf(s6239).next).toBe(sequenceOf(s6238).next + newRows(s6238, s6239))
    // 6239 → 6240 writes the official manifest, its stamp, and one allocation, last.
    const official = officialOf(s6240)
    const next = sequenceOf(s6240).next
    expect(next).toBe(sequenceOf(s6239).next + newRows(s6239, s6240)) // the sibling rows, then the official
    expect(official.p15DomainSequence).toBe(next - 1)
    expect(official.legacySnapshotId).toBe(`campaign-legacy-${official.p15DomainSequence}`)
    expect(official.phaseId).toBe('p15c.finale')
    expect(official.phaseOrderVersion).toBe(1)
    expect(Number.isSafeInteger(official.phaseOrdinal)).toBe(true)
    expect([official.kind, official.definition, official.boundaryWeek, official.postFinaleMode])
      .toEqual(['official2040', 'campaign-legacy/v2', B, LEGACY_POST_FINALE_MODE])
    // The law over the tick's final facts, plus the stamp: nothing else (the step reads the final state).
    expect(canon(withoutStamp(official))).toBe(canon(buildLegacyManifest(facts(s6240, B), 'official2040')))
    expect(official.studios.map((row) => row.studioId)).toEqual(enteredIds(s6240))
    expect(legacyOf(s6240).recordedFromWeek).toBe(legacyOf(s6239).recordedFromWeek)
    expect(legacyOf(s6240).endOfRun).toBeNull()
    // 6240 → 6241 writes nothing.
    expect(canon(legacyOf(s6241))).toBe(canon(legacyOf(s6240)))
    expect(sequenceOf(s6241).next).toBe(next + newRows(s6240, s6241))
    makeSave(s6240)
    makeSave(s6241)
  }), ROUTE_MS)

  it('legacy-freeze-writes-only-its-root', budgeted(ROUTE_MS, () => {
    stepFn()
    const s6239 = routeAt(B - 1)
    // K1: the same input with the step's guard closed (an official manifest already present).
    // DECLARED (1359-F2 item 6): that input is a state the save validator refuses, since an official
    // manifest at week 6239 breaks the marker rule (asserted first). Ticking it is lawful for this leaf:
    // tick() runs only its fixed boundary asserts (tick.ts:203-228, :1028), never the save validator, and K1
    // needs the step's guard closed with every other input byte-identical. The leaf compares the two
    // tick outputs and never saves the forged input.
    const forged = withRoot(s6239, 'campaignLegacy', { ...legacyOf(s6239), official: officialOf(routeAt(B)) })
    refuses(forged, MARKER)
    const normal = tick(s6239)
    const bypassed = tick(forged)
    expect(legacyOf(normal).official).not.toBeNull()
    expect(sequenceOf(normal).next - sequenceOf(bypassed).next).toBe(1)
    const keys = Object.keys(rawOf(normal)).sort()
    expect(Object.keys(rawOf(bypassed)).sort()).toEqual(keys)
    for (const key of keys) {
      if (key === 'campaignLegacy' || key === 'p15Sequence') continue
      expect(canon(rawOf(bypassed)[key]), key).toBe(canon(rawOf(normal)[key]))
    }
    expect(bypassed.rngState).toBe(normal.rngState)
    expect(canon(rawOf(normal))).toBe(canon(rawOf(routeAt(B))))
    // No RNG and no clock in the module that holds the adapter, the step and the validator.
    const source = readFileSync(new URL('../src/core/campaignLegacy.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/from ['"]\.\/rng\.js['"]/)
    expect(source).not.toMatch(/Date\.now|new Date\(|Math\.random|performance\.now/)
  }), ROUTE_MS)

  it('legacy-condition-at-6240-outside', budgeted(FIXTURE_MS, () => {
    const facts = factsFn()
    const base = genuine6240()
    const ids = enteredIds(base)
    const [r01, r03] = [ids[1]!, ids[3]!]
    const rows = (week: number) => ids.map((studioId, row) => ({ studioId, rank: week === B && studioId === r01 ? 1 : row + 2, band: 'stable' as const }))
    const state = withRoot(withRoot(base, 'corporateCondition', conditionRoot(6200, [
      conditionEvent(2, 1, r03, 6205, 'stable', 'warning'), conditionEvent(4, 2, r03, 6213, 'warning', 'distress'),
      conditionEvent(6, 3, r03, B, 'distress', 'closed')], [])),
    'powerRanking', rankingRoot(6200, [rankingRecord(3, 6214, rows(6214)), rankingRecord(5, 6227, rows(6227)), rankingRecord(7, B, rows(B))]))
    const f = facts(state, B)
    expect(f.studios.find((row) => row.studioId === r03)?.closedWeek, 'the adapter passes the week; the law cuts').toBe(B)
    const manifest = buildLegacyManifest(f, 'official2040') as unknown as Official
    const closedStudio = manifest.studios.find((row) => row.studioId === r03)!
    // A closure stamped 6240 is not a closure before B.
    expect(lensOf(closedStudio, 'resilience').counts).toEqual({ warnings: 1, distressEntries: 1, returnsToStable: 0, closures: 0 })
    expect(lensOf(closedStudio, 'resilience').refs.map((ref) => ref.id)).toEqual(['corporate-event-1', 'corporate-event-2'])
    expect(closedStudio.archetypes.find((a) => a.archetypeId === 'resilient-survivor')!.contrary.map((ref) => ref.id)).not.toContain('corporate-event-3')
    // The 6240 ranking record is inside.
    const ranking = lensOf(manifest.studios.find((row) => row.studioId === r01)!, 'ranking')
    expect(ranking.counts).toEqual({ rankedQuarters: 3, quartersAtFirst: 1, bestRank: 1 })
    expect(ranking.refs).toEqual([{ domainId: 'powerRanking', id: 'power-ranking-7' }])
  }), FIXTURE_MS)

  it('legacy-adapter-only-at-boundary', budgeted(POST_FREEZE_MS, () => {
    stepFn()
    const film = routeAt(B - 2).studio.releasedFilms[0]
    expect(film, 'route premise: the headless year released a player film').toBeDefined()
    const drop = (state: GameState): GameState => ({ ...state, concepts: state.concepts.filter((concept) => concept.id !== film!.conceptId) })
    // 6238 → 6239: the adapter does not run.
    const quiet = tick(drop(routeAt(B - 2)))
    expect(canon(legacyOf(quiet))).toBe(canon(legacyOf(routeAt(B - 1))))
    expect(sequenceOf(quiet).next).toBe(sequenceOf(routeAt(B - 1)).next)
    // 6239 → 6240: the freeze runs the adapter, which refuses by name.
    const message = thrownMessage(() => tick(drop(routeAt(B - 1))))
    expect(message).toContain(film!.conceptId)
    expect(message).toMatch(/concept/i)
    // 6300 → 6301: after the freeze no tick reads facts again.
    const s6300 = extended(6300)
    expect(canon(legacyOf(tick(drop(s6300))))).toBe(canon(legacyOf(s6300)))
  }), POST_FREEZE_MS)

  it('legacy-ticks-after-freeze', budgeted(POST_FREEZE_MS, () => {
    stepFn()
    const ext = extension()
    expect(ext.firstRootChange, 'the week the campaignLegacy root first changed after the freeze').toBeNull()
    const [s6240, s6760] = [routeAt(B), extended(6760)]
    expect(s6760.market.tick).toBe(B + 520)
    expect(canon(legacyOf(s6760))).toBe(canon(legacyOf(s6240)))
    // Ordinary play continues: releases and events still append.
    expect(s6760.hollywood!.films.filter(isLive).some((film) => film.result.releaseTick >= B)).toBe(true)
    expect(s6760.hollywood!.careerEvents.some((event) => event.releaseWeek >= B)).toBe(true)
    expect(s6760.hollywood!.receipts.length).toBeGreaterThan(s6240.hollywood!.receipts.length)
    // The save still validates: the replay reads 520 weeks of later rows and cuts them.
    expect(makeSave(s6760).saveVersion).toBe(STEP)
    console.info(JSON.stringify({ kind: '1359-legacy-extension-timing', ...routeL().ms, extension520Ms: ext.ms }))
    expect(ext.ms, 'the 520-tick extension against its budget').toBeLessThanOrEqual(EXTENSION_MS)
  }), POST_FREEZE_MS)

  it('legacy-hollywood-null-no-freeze', budgeted(ROUTE_MS, () => {
    stepFn()
    const fresh = generateWorld(ROUTE_SEED)
    for (const week of [B - 1, B, B + 1]) {
      const state = routeL().headless.get(week)!
      expect(state.hollywood).toBeNull()
      expect(canon(legacyOf(state)), `week ${week}`).toBe(canon(legacyOf(fresh)))
      expect(sequenceOf(state).next).toBe(sequenceOf(fresh).next)
      expect(makeSave(state).saveVersion).toBe(STEP)
    }
  }), ROUTE_MS)

  it('legacy-determinism', budgeted(ROUTE_MS, () => {
    stepFn()
    // K2: a second run of the industry era, from the founding save through a JSON round trip.
    const bytes = exportSave(makeSave(routeL().foundedAtFounding))
    let state = migrateToLive(importSave(bytes)).state as GameState
    while (state.market.tick < B) state = tick(state)
    expect(canon(officialOf(state))).toBe(canon(officialOf(routeAt(B))))
    expect(sequenceOf(state).next).toBe(sequenceOf(routeAt(B)).next)
  }), ROUTE_MS)
})

// ═══════════════════════════════════════════════════════════════════════════
// C. the root `campaignLegacy`: seed, migration, downgrade, validation (1359-A §5)
// ═══════════════════════════════════════════════════════════════════════════
describe('p15c2 root: seed, migration and downgrade (1359-A §5.2, RED C1-C5)', () => {
  it('legacy-root-fresh', () => {
    const fresh = generateWorld('1359-legacy-fresh-01')
    expect(canon(legacyOf(fresh))).toBe(canon({ version: 1, recordedFromWeek: 0, official: null, endOfRun: null }))
    const save = makeSave(fresh)
    expect(save.saveVersion).toBe(STEP)
    expect(STEP, 'the Legacy root arrives in a save step above this base').toBeGreaterThan(BASE_LIVE_SAVE_VERSION)
    expect(canon(legacyOf(save.state as GameState))).toBe(canon(legacyOf(fresh)))
  })

  it('legacy-migration-empty-root', budgeted(FIXTURE_MS, () => {
    const captures = belowStepCaptures()
    expect(captures.length, 'premise: at least one genuine capture below the step (1359-F2 item 4)').toBeGreaterThan(0)
    for (const capture of captures) {
      const upgraded = convertIntoStep(capture)
      expect(upgraded.saveVersion).toBe(STEP)
      expect(canon(legacyOf(upgraded.state))).toBe(canon({ version: 1, recordedFromWeek: capture.state.market.tick, official: null, endOfRun: null }))
      // The step adds only P15 roots, the Legacy among them, and they arrive empty; every key the
      // capture already held is byte-identical (a shared step adds every P15 root, a separate one the Legacy).
      const added = Object.keys(rawOf(upgraded.state)).filter((key) => !Object.hasOwn(rawOf(capture.state), key))
      expect(added).toContain('campaignLegacy')
      for (const key of added) expect(P15_ROOTS, `${key} is a P15 root`).toContain(key)
      expect(p15Rows(upgraded.state, added), 'no ranking, condition, market or Legacy row arrives with the step').toEqual([])
      for (const key of Object.keys(rawOf(capture.state))) expect(canon(rawOf(upgraded.state)[key]), key).toBe(canon(rawOf(capture.state)[key]))
      expect(exportSave(migrateToLive(upgraded)), 'a second migration is a no-op').toBe(exportSave(asSaveFile(upgraded)))
    }
  }), FIXTURE_MS)

  it('legacy-migration-empty-root-genuine-save38', budgeted(FIXTURE_MS, () => {
    const save38 = genuineSave38()
    const live = migrateToLive(save38) as unknown as Envelope
    expect(live.saveVersion).toBe(STEP)
    expect(canon(legacyOf(live.state))).toBe(canon({ version: 1, recordedFromWeek: B, official: null, endOfRun: null }))
    expect(p15Rows(live.state), 'no ranking, condition, market or Legacy row: every P15 root migrated at 6240').toEqual([])
    const below = migrateBelowStep(save38)
    expect(canon(stripP15(live.state))).toBe(canon(stripP15(below.state)))
    expect(canon(convertIntoStep(below)), "the step's own converter agrees").toBe(canon(live))
    expect(exportSave(migrateToLive(live)), 'a second migration is a no-op').toBe(exportSave(asSaveFile(live)))
  }), FIXTURE_MS)

  it('legacy-migration-before-boundary', budgeted(ROUTE_MS, () => {
    const capture = captureAt((state) => state.market.tick === B - 1, 'at week 6239')
    const state = convertIntoStep(capture).state
    expect(legacyOf(state).recordedFromWeek).toBe(B - 1)
    expect(legacyOf(state).official).toBeNull()
    const next = tick(state)
    const official = officialOf(next)
    expect(official.p15DomainSequence).toBe(sequenceOf(next).next - 1)
    expect(canon(withoutStamp(official))).toBe(canon(buildLegacyManifest(factsFn()(next, B), 'official2040')))
    makeSave(next)
  }), ROUTE_MS)

  it('legacy-migration-past-boundary', budgeted(ROUTE_MS, () => {
    const capture = captureAt((state) => state.market.tick >= B, 'at week 6240 or later')
    const state = convertIntoStep(capture).state
    expect(legacyOf(state).recordedFromWeek).toBe(capture.state.market.tick)
    const next = tick(state)
    expect(legacyOf(next).official, 'a save at or past B never freezes').toBeNull()
    expect(makeSave(next).saveVersion).toBe(STEP)
  }), ROUTE_MS)

  it('legacy-migration-past-boundary-genuine-save38', budgeted(FIXTURE_MS, () => {
    const state = genuine6240()
    expect(legacyOf(state).recordedFromWeek).toBe(B)
    const next = tick(state)
    expect(next.market.tick).toBe(B + 1)
    expect(legacyOf(next).official, 'a save migrated at 6240 never freezes').toBeNull()
    expect(sequenceOf(next).next).toBe(sequenceOf(state).next + newRows(state, next))
    expect(makeSave(next).saveVersion).toBe(STEP)
  }), FIXTURE_MS)

  it('legacy-root-downgrade', budgeted(FIXTURE_MS, () => {
    // An empty root strips: V(N−1) → VN → V(N−1) is byte-identical.
    const save38 = genuineSave38()
    const below = migrateBelowStep(save38)
    const live = convertIntoStep(below)
    expect(legacyOf(live.state).official).toBeNull()
    const down = convertOutOfStep(live)
    expect(down.saveVersion).toBe(STEP - 1)
    expect(Object.hasOwn(rawOf(down.state), 'campaignLegacy')).toBe(false)
    expect(canon(down)).toBe(canon(below))
    // A frozen 2040 Legacy refuses by name: the step's converter and every older migrator.
    const frozen = makeSave(genuineFrozen())
    expect(() => convertOutOfStep(frozen)).toThrow(DOWNGRADE_REFUSAL)
    let checked = 0
    for (let version = 4; version < STEP; version++) {
      const migrate = (saveModule as unknown as Record<string, unknown>)[`migrateToV${version}`]
      if (typeof migrate !== 'function') continue
      expect(() => (migrate as (save: unknown) => unknown)(frozen), `migrateToV${version}`).toThrow(DOWNGRADE_REFUSAL)
      checked++
    }
    expect(checked).toBeGreaterThanOrEqual(30)
    // Frozen builders refuse a non-empty root and still project an empty one.
    const builders = Object.keys(saveModule).filter((name) => /^makeSaveV\d+$/.test(name))
    expect(builders.length).toBeGreaterThanOrEqual(18)
    for (const name of builders) {
      const build = (saveModule as unknown as Record<string, (state: unknown) => unknown>)[name]!
      expect(() => build(genuineFrozen()), name).toThrow(DOWNGRADE_REFUSAL)
    }
    const v18 = saveModule.makeSaveV18(generateWorld('1359-legacy-frozen-builder-01'))
    expect(Object.hasOwn(v18.state as unknown as Record<string, unknown>, 'campaignLegacy')).toBe(false)
  }), FIXTURE_MS)
})

// ── the frozen definition table as literals (1359-F2 item 1; 1353-F6 ruling 2; 1353-F7 ruling 3) ──
// A pin that copied TUNING or the live exports at load would pass a comparison with them, and a retune that edits an
// era in place would pass too while every stored manifest of that era failed its replay. Literals catch both.
// 1353-T moved three thresholds and nothing else, so the two eras share every other field.
const ERA_SHAPE = {
  boundaryWeek: 6240,
  postFinaleMode: 'ordinary-simulation/v1',
  archetypeIds: ['artistic-voice', 'audience-institution', 'commercial-engine', 'technology-pioneer',
    'talent-foundry', 'genre-specialist', 'resilient-survivor', 'awards-dynasty'],
  lensIds: ['catalog', 'people', 'technology', 'ranking', 'financialBand', 'market', 'resilience', 'awards'],
  domainIds: ['playerFilms', 'industryFilms', 'playerRuns', 'playerCareerEvents', 'industryCareerEvents',
    'technologyAdoptions', 'technologyCatalogue', 'powerRanking', 'corporateCondition', 'marketAssessments', 'awards'],
  bounds: { domains: 16, archetypes: 8, refsPerSide: 12, lenses: 12 },
  // 1353-F2 §2.
  lensCountKeys: {
    catalog: ['releases', 'settled', 'inReleaseAtBoundary', 'authoredPre1920'], people: ['credited', 'discoveries'],
    technology: ['operationalAdoptions'], ranking: ['rankedQuarters', 'quartersAtFirst', 'bestRank'],
    financialBand: ['inTheRed', 'strained', 'stable', 'thriving'], market: ['assessed', 'underPressure'],
    resilience: ['warnings', 'distressEntries', 'returnsToStable', 'closures'], awards: [],
  },
}
/** `campaign-legacy/v1`: the fifteen values of 1353-A §5.5 as Wave 1 landed them. Frozen, never live again. */
const V1 = {
  ...ERA_SHAPE,
  thresholds: {
    LEGACY_CRITIC_ACCLAIM_MIN: 70, LEGACY_CRITIC_PAN_BELOW: 35, LEGACY_AUDIENCE_LIKED_MIN: 57, LEGACY_MIN_FILMS: 5,
    LEGACY_MIN_SHARE_PERCENT: 25, LEGACY_HIT_REACH_PERCENT: 90, LEGACY_FLOP_REACH_PERCENT: 30,
    LEGACY_AUDIENCE_MIN_DECADES: 4, LEGACY_DECADE_MIN_RELEASES: 2, LEGACY_PIONEER_WEEKS: 52,
    LEGACY_TECH_LATE_WEEKS: 260, LEGACY_FOUNDRY_MIN_PEOPLE: 3, LEGACY_FOUNDRY_MIN_CREDITS: 10,
    LEGACY_FOUNDRY_SETTLE_WEEKS: 260, LEGACY_GENRE_MIN_FILMS: 8,
  },
}
/** `campaign-legacy/v2`, the live era: 1353-T with 1353-F6's hit line. Critic 60, hit line 49 and share floor 20;
 * the other twelve as v1. */
const V2 = {
  ...ERA_SHAPE,
  thresholds: {
    LEGACY_CRITIC_ACCLAIM_MIN: 60, LEGACY_CRITIC_PAN_BELOW: 35, LEGACY_AUDIENCE_LIKED_MIN: 57, LEGACY_MIN_FILMS: 5,
    LEGACY_MIN_SHARE_PERCENT: 20, LEGACY_HIT_REACH_PERCENT: 49, LEGACY_FLOP_REACH_PERCENT: 30,
    LEGACY_AUDIENCE_MIN_DECADES: 4, LEGACY_DECADE_MIN_RELEASES: 2, LEGACY_PIONEER_WEEKS: 52,
    LEGACY_TECH_LATE_WEEKS: 260, LEGACY_FOUNDRY_MIN_PEOPLE: 3, LEGACY_FOUNDRY_MIN_CREDITS: 10,
    LEGACY_FOUNDRY_SETTLE_WEEKS: 260, LEGACY_GENRE_MIN_FILMS: 8,
  },
}
/** A frozen entry's literal fields: everything but its evaluator. */
const fieldsOf = (entry: DefinitionEntry): string => canon({
  boundaryWeek: entry.boundaryWeek, postFinaleMode: entry.postFinaleMode, archetypeIds: entry.archetypeIds, lensIds: entry.lensIds,
  domainIds: entry.domainIds, bounds: entry.bounds, lensCountKeys: entry.lensCountKeys, thresholds: entry.thresholds,
})
/** Runs `body` with TUNING's Legacy values set to `values`, then restores every one of them. */
function underThresholds<T>(values: Readonly<Record<string, number>>, body: () => T): T {
  const t = TUNING as unknown as Record<string, number>
  const saved = Object.keys(values).map((name) => [name, t[name]!] as const)
  try {
    for (const [name, value] of Object.entries(values)) t[name] = value
    return body()
  } finally {
    for (const [name, value] of saved) t[name] = value
  }
}

describe('p15c2 validation: validateSaveVN over the root (1359-A §5.1 with 1359-F Amendment 1, RED C6-C12)', () => {
  it('legacy-validate-marker', budgeted(FIXTURE_MS, () => {
    const frozen = genuineFrozen()
    const official = officialOf(frozen)
    // Missing when due.
    refuses(withRoot(frozen, 'campaignLegacy', { ...legacyOf(frozen), official: null }), MARKER)
    // Present when not due: a save recorded from B (migrated at 6240), and a world with no industry.
    const stamped = (state: GameState): GameState => withRoot(withRoot(state, 'campaignLegacy', { ...legacyOf(state), official }),
      'p15Sequence', { ...sequenceOf(state), next: official.p15DomainSequence + 1 })
    refuses(stamped(genuine6240()), MARKER)
    refuses(stamped(generateWorld('1359-legacy-marker-01')), MARKER)
    makeSave(genuine6240())
  }), FIXTURE_MS)

  it('legacy-validate-manifest-identity', budgeted(FIXTURE_MS, () => {
    const frozen = genuineFrozen()
    refuses(tamper(frozen, (o) => { o.kind = 'endOfRun' }), 'campaignLegacy.official.kind')
    refuses(tamper(frozen, (o) => { o.boundaryWeek = B - 1 }), 'campaignLegacy.official.boundaryWeek')
    refuses(tamper(frozen, (o) => { o.postFinaleMode = null }), 'campaignLegacy.official.postFinaleMode')
    refuses(tamper(frozen, (o) => { o.definition = 'campaign-legacy/v0' }), 'campaignLegacy.official.definition')
    refuses(withRoot(frozen, 'campaignLegacy', { ...legacyOf(frozen), endOfRun: withoutStamp(officialOf(frozen)) }), 'campaignLegacy.endOfRun')
  }), FIXTURE_MS)

  it('legacy-validate-stamp', budgeted(FIXTURE_MS, () => {
    const frozen = genuineFrozen()
    const next = sequenceOf(frozen).next
    expect(officialOf(frozen).legacySnapshotId.startsWith('campaign-legacy-')).toBe(true)
    refuses(tamper(frozen, (o) => { o.p15DomainSequence = next; o.legacySnapshotId = `campaign-legacy-${next}` }), /p15/i)
    refuses(tamper(frozen, (o) => { o.p15DomainSequence = 0; o.legacySnapshotId = 'campaign-legacy-0' }), /p15/i)
    refuses(tamper(frozen, (o) => { o.legacySnapshotId = `campaign-legacy-${o.p15DomainSequence + 1}` }), 'campaignLegacy.official.legacySnapshotId')
    refuses(tamper(frozen, (o) => { o.legacySnapshotId = `power-ranking-${o.p15DomainSequence}` }), 'campaignLegacy.official.legacySnapshotId')
    refuses(tamper(frozen, (o) => { o.phaseId = 'p15b.condition' }), 'campaignLegacy.official.phase')
    refuses(tamper(frozen, (o) => { o.phaseOrdinal += 1 }), 'campaignLegacy.official.phase')
    refuses(tamper(frozen, (o) => { o.phaseOrderVersion = 2 }), 'campaignLegacy.official.phase')
  }), FIXTURE_MS)

  it('legacy-validate-bounds', budgeted(FIXTURE_MS, () => {
    const frozen = genuineFrozen()
    const withRefs = citingArchetype
    refuses(tamper(frozen, (o) => {
      for (let i = o.sources.length; i < LEGACY_BOUNDS.domains + 1; i++) o.sources.push({ domainId: `extra-${i}`, highWatermark: 0, recordedFromWeek: null, status: 'notRecorded' })
    }), 'campaignLegacy.official.sources')
    refuses(tamper(frozen, (o) => { o.studios[0]!.archetypes.push(structuredClone(o.studios[0]!.archetypes[0]!)) }), 'archetypes')
    refuses(tamper(frozen, (o) => { const a = o.studios[0]!.archetypes; [a[0], a[1]] = [a[1]!, a[0]!] }), 'archetypes')
    refuses(tamper(frozen, (o) => {
      const lenses = o.studios[0]!.lenses
      while (lenses.length < LEGACY_BOUNDS.lenses + 1) lenses.push({ lensId: `extra-${lenses.length}`, status: 'notRecorded', counts: {}, refs: [] })
    }), 'lenses')
    refuses(tamper(frozen, (o) => { o.studios[0]!.lenses[0]!.lensId = 'unknownLens' }), 'lens')
    refuses(tamper(frozen, (o) => { delete lensOf(o.studios[0]!, 'catalog').counts.releases }), 'counts')
    refuses(tamper(frozen, (o) => { lensOf(o.studios[0]!, 'catalog').counts.extra = 0 }), 'counts')
    refuses(tamper(frozen, (o) => {
      const a = withRefs(o)
      const side = a.qualifying.length > 0 ? a.qualifying : a.contrary
      while (side.length < LEGACY_BOUNDS.refsPerSide + 1) side.push(side[0]!)
      a.qualifyingCount = Math.max(a.qualifyingCount, a.qualifying.length)
      a.contraryCount = Math.max(a.contraryCount, a.contrary.length)
    }), /qualifying|contrary/)
    refuses(tamper(frozen, (o) => {
      const a = withRefs(o)
      if (a.qualifying.length > 0) a.qualifyingCount = a.qualifying.length - 1
      else a.contraryCount = a.contrary.length - 1
    }), /qualifyingCount|contraryCount/)
    refuses(tamper(frozen, (o) => { const s = o.studios; [s[0], s[1]] = [s[1]!, s[0]!] }), 'studios')
    refuses(tamper(frozen, (o) => { o.studios[0]!.studioId = 'studio-never-entered' }), 'studios')
  }), FIXTURE_MS)

  it('legacy-validate-refs', budgeted(FIXTURE_MS, () => {
    const frozen = genuineFrozen()
    const rows = arrayRows(frozen)
    const official = officialOf(frozen)
    const where = findRef(official, (ref) => Object.hasOwn(rows, ref.domainId))
    const ref = refAt(official, where)
    const position = rows[ref.domainId]!.indexOf(ref.id) + 1
    expect(position, 'premise: the ref names an array-domain row').toBeGreaterThan(0)
    const SIDES = /qualifying|contrary|refs/
    refuses(tamper(frozen, (o) => { refAt(o, where).id = 'no-such-row' }), SIDES)
    refuses(tamper(frozen, (o) => { refAt(o, where).domainId = 'playerRuns' }), /playerRuns|domainId/)
    refuses(tamper(frozen, (o) => { refAt(o, where).domainId = 'awards' }), /awards|domainId/)
    // A cited row above its domain's watermark (the watermark itself stays within the root).
    refuses(tamper(frozen, (o) => { sourceOf(o, ref.domainId).highWatermark = position - 1 }), /highWatermark|qualifying|contrary|refs/)
    // An array watermark above its root's length.
    refuses(tamper(frozen, (o) => { sourceOf(o, 'playerFilms').highWatermark = frozen.studio.releasedFilms.length + 1 }), 'highWatermark')
    // A P15 watermark or a recordedFromWeek that is not the re-derived value.
    refuses(tamper(frozen, (o) => { sourceOf(o, 'powerRanking').highWatermark += 5 }), 'highWatermark')
    refuses(tamper(frozen, (o) => { sourceOf(o, 'industryFilms').recordedFromWeek = (sourceOf(o, 'industryFilms').recordedFromWeek ?? 0) + 1 }), 'recordedFromWeek')
  }), FIXTURE_MS)

  it('legacy-validate-refs-post-boundary-row', budgeted(POST_FREEZE_MS, () => {
    stepFn()
    // Route L at 6300: rows appended after the freeze sit above their domain's watermark.
    const state = extended(6300)
    const rows = arrayRows(state)
    const official = officialOf(state)
    const grown = (domainId: string): boolean =>
      Object.hasOwn(rows, domainId) && rows[domainId]!.length > sourceOf(official, domainId).highWatermark
    const where = findRef(official, (ref) => grown(ref.domainId))
    const domainId = refAt(official, where).domainId
    const watermark = sourceOf(official, domainId).highWatermark
    const late = rows[domainId]![watermark]! // the first row appended after the freeze
    // Position above the watermark.
    refuses(tamper(state, (o) => { refAt(o, where).id = late }), /qualifying|contrary|refs/)
    // Week at or after B: the watermark raised to the root's length (still lawful by item 6) admits the
    // position, and the row's own week refuses it.
    refuses(tamper(state, (o) => {
      sourceOf(o, domainId).highWatermark = rows[domainId]!.length
      refAt(o, where).id = late
    }), /qualifying|contrary|refs/)
  }), POST_FREEZE_MS)

  it('legacy-definition-era-guard', budgeted(FIXTURE_MS, () => {
    // 1359-F2 item 1 (1359-D item 1; 1353-J note 2) with 1353-F6 ruling 2 and 1353-F7 ruling 3: both frozen eras and
    // the live era are pinned as literals (above). An in-place edit of v1 or v2, or a retune of TUNING without a
    // definition bump, fails here, whatever Wave 1's own pin says.
    const table = definitionsTable()
    // The table holds exactly two eras: v1 kept frozen (1353-F6 ruling 2) and v2 beside it.
    expect(Object.keys(table).sort(), 'the frozen table').toEqual(['campaign-legacy/v1', 'campaign-legacy/v2'])
    // Each frozen entry equals its literals, field by field.
    expect(fieldsOf(table['campaign-legacy/v1']), "the frozen 'campaign-legacy/v1' entry").toBe(canon(V1))
    expect(fieldsOf(table['campaign-legacy/v2']), "the frozen 'campaign-legacy/v2' entry").toBe(canon(V2))
    // The era guard: the live definition is v2, and the live exports and TUNING equal v2's literals.
    expect(CAMPAIGN_LEGACY_DEFINITION).toBe('campaign-legacy/v2')
    expect(canon({
      boundaryWeek: LEGACY_BOUNDARY_WEEK, postFinaleMode: LEGACY_POST_FINALE_MODE, archetypeIds: LEGACY_ARCHETYPE_IDS,
      lensIds: LEGACY_LENS_IDS, domainIds: LEGACY_DOMAIN_IDS, bounds: LEGACY_BOUNDS,
    })).toBe(canon({ boundaryWeek: V2.boundaryWeek, postFinaleMode: V2.postFinaleMode, archetypeIds: V2.archetypeIds,
      lensIds: V2.lensIds, domainIds: V2.domainIds, bounds: V2.bounds }))
    const t = TUNING as unknown as Record<string, number>
    expect(Object.keys(t).filter((key) => key.startsWith('LEGACY_')).sort()).toEqual(Object.keys(V2.thresholds).sort())
    for (const [name, value] of Object.entries(V2.thresholds)) expect(t[name], name).toBe(value)
    // An unknown definition refuses by name: an id outside the table (1353-U finding 6).
    refuses(tamper(genuineFrozen(), (o) => { o.definition = 'campaign-legacy/v3' }), 'campaignLegacy.official.definition')
  }), FIXTURE_MS)

  it('legacy-round-trip', budgeted(ROUTE_MS, () => {
    stepFn()
    const s6241 = routeAt(B + 1)
    const bytes = exportSave(makeSave(s6241))
    const loaded = migrateToLive(importSave(bytes)).state as GameState
    expect(exportSave(makeSave(loaded))).toBe(bytes)
    expect(canon(legacyOf(loaded))).toBe(canon(legacyOf(s6241)))
    expect(canon(legacyOf(tick(loaded))), 'unchanged by the next tick').toBe(canon(legacyOf(s6241)))
  }), ROUTE_MS)
})

// ═══════════════════════════════════════════════════════════════════════════
// 1359-F Amendment 1: the replay and the old-law fixture (with 1353-J note 2)
// ═══════════════════════════════════════════════════════════════════════════
describe('p15c2 replay: the validator re-runs the definition the manifest names (1359-F Amendment 1)', () => {
  it('legacy-validate-replay', budgeted(FIXTURE_MS, () => {
    const frozen = genuineFrozen()
    const facts = factsFn()(frozen, B)
    const evaluated = (o: Official): { si: number; ai: number } => {
      for (const [si, studio] of o.studios.entries()) {
        const ai = studio.archetypes.findIndex((a) => a.outcome === 'held' || a.outcome === 'notHeld')
        if (ai >= 0) return { si, ai }
      }
      throw new Error('premise: an evaluated archetype')
    }
    // A tampered outcome.
    refuses(tamper(frozen, (o) => {
      const { si, ai } = evaluated(o)
      const a = o.studios[si]!.archetypes[ai]!
      a.outcome = a.outcome === 'held' ? 'notHeld' : 'held'
    }), 'outcome')
    // A tampered count that still covers its refs.
    refuses(tamper(frozen, (o) => { const { si, ai } = evaluated(o); o.studios[si]!.archetypes[ai]!.qualifyingCount += 1 }), 'qualifyingCount')
    // A tampered ref list: real, in-bounds ids in another order.
    refuses(tamper(frozen, (o) => {
      const a = o.studios.flatMap((s) => s.archetypes).find((x) => x.qualifying.length > 1 || x.contrary.length > 1)
      if (a === undefined) throw new Error('premise: a side with two refs')
      if (a.qualifying.length > 1) a.qualifying.reverse()
      else a.contrary.reverse()
    }), /qualifying|contrary/)
    // 1359-B's case: commercial engine claimed held over real, pre-B film ids of the studio.
    refuses(tamper(frozen, (o) => {
      const player = o.studios.find((s) => s.studioId === frozen.hollywood!.playerStudioId)!
      const engine = player.archetypes.find((a) => a.archetypeId === 'commercial-engine')!
      const real = facts.films.filter((f) => f.studioId === player.studioId && f.provenance === 'campaign').slice(0, 12)
      engine.outcome = engine.outcome === 'held' ? 'notHeld' : 'held'
      engine.qualifying = real.map((f) => ({ domainId: f.domainId, id: f.filmId }))
      engine.qualifyingCount = engine.qualifying.length
    }), /outcome|qualifying/)
    // A tampered lens value.
    refuses(tamper(frozen, (o) => { lensOf(o.studios[0]!, 'catalog').counts.releases! += 1 }), 'counts')
    // standingAtBoundary is range-checked only: inside its range passes; outside refuses.
    const rival = officialOf(frozen).studios.findIndex((s) => {
      const v = s.standingAtBoundary.audienceAwareness!
      return v > 1 && v < 99
    })
    expect(rival, 'premise: a channel strictly inside [0, 100]').toBeGreaterThanOrEqual(0)
    expect(makeSave(tamper(frozen, (o) => { o.studios[rival]!.standingAtBoundary.audienceAwareness! += 1 })).saveVersion).toBe(STEP)
    refuses(tamper(frozen, (o) => { o.studios[rival]!.standingAtBoundary.audienceAwareness = 100.5 }), 'standingAtBoundary')
    refuses(tamper(frozen, (o) => { o.studios[rival]!.standingAtBoundary.industryPrestige = -0.5 }), 'standingAtBoundary')
  }), FIXTURE_MS)

  it('legacy-old-law-fixture-v1-validates-after-retune', budgeted(FIXTURE_MS, () => {
    // 1353-F6 ruling 2 and 1353-F7 ruling 3: the retune from v1 to v2 is real, so the old-law fixture is a real v1
    // manifest on this v2 tree. CONSTRUCTION (1359-C6): Wave 1's builder over G6240F's own facts, run once with
    // TUNING's fifteen Legacy values set to v1's literals and restored after; the live step's stamp, which no era
    // changes; and the id a v1 tree writes, `campaign-legacy/v1`. That is the manifest a v1 tree freezes for this
    // campaign. It validates only if the frozen v1 entry's replay reproduces it, id included, so it cannot pass by
    // replaying itself (1353-U findings 7-8).
    const frozen = genuineFrozen()
    const table = definitionsTable()
    const t = TUNING as unknown as Record<string, number>
    expect(Object.keys(t).filter((key) => key.startsWith('LEGACY_')).sort(), 'premise: the fifteen Legacy values')
      .toEqual(Object.keys(V1.thresholds).sort())
    const facts = factsFn()(frozen, B)
    const built = underThresholds(V1.thresholds, () => buildLegacyManifest(facts, 'official2040')) as unknown as Official
    const v1Official: Official = { ...officialOf(frozen), ...built, definition: 'campaign-legacy/v1' }
    const asOfficial = (official: Official): GameState => withRoot(frozen, 'campaignLegacy', { ...legacyOf(frozen), official })
    const oldLaw = asOfficial(v1Official)
    // The retune is material on this campaign. The player released 122 films before B. Seven reach v1's critic 70,
    // and 100 × 7 < 25 × 122, so v1 holds no artistic voice; 37 reach v2's critic 60, and 100 × 37 ≥ 20 × 122.
    const player = (official: Official) => official.studios.find((s) => s.studioId === frozen.hollywood!.playerStudioId)!
    const voice = (official: Official) => {
      const a = player(official).archetypes.find((x) => x.archetypeId === 'artistic-voice')!
      return [a.qualifyingCount, a.outcome]
    }
    expect(lensOf(player(v1Official), 'catalog').counts.releases, 'premise: the player released 122 films before B').toBe(122)
    expect(voice(v1Official), 'v1: 7 acclaimed of 122, not held').toEqual([7, 'notHeld'])
    expect(voice(officialOf(frozen)), 'v2: 37 acclaimed of 122, held').toEqual([37, 'held'])
    // It validates under live v2 TUNING: the replay runs the frozen v1 entry, never TUNING.
    for (const [name, value] of Object.entries(V2.thresholds)) expect(t[name], `live ${name}`).toBe(value)
    expect(makeSave(oldLaw).saveVersion).toBe(STEP)
    // Relabelled as the other era, the same manifest refuses on replay: v2's evaluator holds the voice v1's did not.
    refuses(asOfficial({ ...v1Official, definition: 'campaign-legacy/v2' }), /outcome|qualifying/)
    // Relabelled as v1, the genuine v2 manifest refuses on replay: the validator runs the frozen v1 entry (1359-F6 ruling 1).
    refuses(asOfficial({ ...officialOf(frozen), definition: 'campaign-legacy/v1' }), /outcome|qualifying/)
    // An unbumped retune (kept from r5): every live value moved and the definition not bumped.
    const RETUNE: Record<string, number> = {
      LEGACY_CRITIC_ACCLAIM_MIN: 40, LEGACY_CRITIC_PAN_BELOW: 60, LEGACY_AUDIENCE_LIKED_MIN: 30, LEGACY_MIN_FILMS: 1,
      LEGACY_MIN_SHARE_PERCENT: 1, LEGACY_HIT_REACH_PERCENT: 5, LEGACY_FLOP_REACH_PERCENT: 95, LEGACY_AUDIENCE_MIN_DECADES: 1,
      LEGACY_DECADE_MIN_RELEASES: 1, LEGACY_PIONEER_WEEKS: 5000, LEGACY_TECH_LATE_WEEKS: 1, LEGACY_FOUNDRY_MIN_PEOPLE: 1,
      LEGACY_FOUNDRY_MIN_CREDITS: 1, LEGACY_FOUNDRY_SETTLE_WEEKS: 1, LEGACY_GENRE_MIN_FILMS: 1,
    }
    expect(Object.keys(RETUNE).sort()).toEqual(Object.keys(V2.thresholds).sort())
    const live = table[CAMPAIGN_LEGACY_DEFINITION]
    underThresholds(RETUNE, () => {
      // The retune is material: the live law now builds a different manifest from the same facts.
      expect(canon(buildLegacyManifest(facts, 'official2040'))).not.toBe(canon(withoutStamp(officialOf(frozen))))
      // Both stored manifests still validate: each replay runs its own entry's frozen thresholds, not live TUNING.
      expect(makeSave(frozen).saveVersion).toBe(STEP)
      expect(makeSave(oldLaw).saveVersion).toBe(STEP)
      // And the era guard sees the retune that skipped its definition bump.
      expect(Object.keys(RETUNE).some((name) => live.thresholds[name] !== t[name])).toBe(true)
    })
    for (const [name, value] of Object.entries(V2.thresholds)) expect(t[name], `${name} restored`).toBe(value)
  }), FIXTURE_MS)
})

// ═══════════════════════════════════════════════════════════════════════════
// 1359-F2 F1: the law accepts a null settled week on an authored film, and only there
// ═══════════════════════════════════════════════════════════════════════════
describe('p15c2 law: an authored film may settle with no week (1359-F2 F1; 1359-D item 7)', () => {
  it('legacy-law-settled-week-null-authored-only', () => {
    // 1359-A §3.1 gives an authored pre-1920 film a null settledWeek; the landed law refuses every
    // settled film without a whole week (campaignLegacy.ts:351). 1359-F2 relaxes it for authored films
    // only (its "authoredPreCampaign: true" is LegacyFilmFact's provenance 'authored'). Both sides are
    // pinned: a null week on any other film still refuses by name, so the relaxation cannot let a gross
    // through `settledWeek < B` (1359-D item 7). The refusal quotes line 351's rule: line 358 also names
    // `.settledWeek` and would refuse this film (`null < 100`) under a law that accepted null on every
    // film, so matching the path alone would pass that law (1359-D2 fix 2).
    const facts = (films: LegacyFilmFact[]): LegacyFacts => ({
      boundaryWeek: B,
      baseMarketValue: 1_000_000,
      studios: [{ studioId: 'S', row: 0, enteredWeek: 0, closedWeek: null,
        standing: { audienceAwareness: 50, industryPrestige: 50, commercialConfidence: 50 } }],
      films,
      careerEvents: [],
      adoptions: [],
      technologies: [],
      domains: ['playerFilms', 'industryFilms', 'playerRuns', 'playerCareerEvents', 'industryCareerEvents',
        'technologyAdoptions', 'technologyCatalogue'].map((domainId) => ({ domainId, highWatermark: films.length, recordedFromWeek: 0 })),
    })
    const authored: LegacyFilmFact = {
      filmId: 'AUTHORED', studioId: 'S', domainId: 'industryFilms', provenance: 'authored', releaseWeek: null, genre: 'drama',
      criticScore: 80, audienceScore: 70, status: 'settled', settledWeek: null, grossSettled: 2_000_000, credits: [],
    }
    // Accepted: authored, settled, no week. It counts as authored history and never as a release.
    const manifest = buildLegacyManifest(facts([authored]), 'official2040') as unknown as Official
    expect(lensOf(manifest.studios[0]!, 'catalog').counts).toEqual({ releases: 0, settled: 0, inReleaseAtBoundary: 0, authoredPre1920: 1 })
    // Refused by name: the same null week on a campaign film.
    const campaign: LegacyFilmFact = { ...authored, filmId: 'CAMPAIGN', provenance: 'campaign', releaseWeek: 100, audienceScore: null }
    expect(() => buildLegacyManifest(facts([campaign]), 'official2040'))
      .toThrow(/films\[0\] \(CAMPAIGN\)\.settledWeek must be a whole week once settled/)
  })
})
