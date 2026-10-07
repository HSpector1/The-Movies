// ── P15A.2 Wave 2 slice 2a: the quarterly Power Ranking archive ─────────────────
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/): 1356-A §3-§5 as
// adopted in 1356-F (Amendment 2; Amendment 1 as replaced by 1355-F2 item 5), 1355-F2 items 1-6,
// 1355-F5 ruling 1, 1351-F (authored films count in no lane), and 1361-F rulings 5, 6 and 9.
// One module holds the adapter, the shared weekly fixed cost, the tick step and the validator.
// No RNG. Cash and fixed cost leave src/core only as the band; no error here echoes a finance value.

import {
  computePowerRanking,
  isPowerRankingWeek,
  POWER_RANKING_DEFINITION,
  type FinancialStrengthBand,
  type PowerRankingRow,
  type RankingFilm,
  type RankingInput,
  type RankingStudio,
} from './powerRanking.js'
import { rivalWeeklyOperatingCost } from './hollywood.js'
import { weeklyPayroll } from './employment.js'
import { weeklyFacilityOperatingCost, weeklyOverhead } from './economyView.js'
import { P15_PHASE_TABLES, p15PhaseTriple } from './p15Phases.js'
import type { HollywoodState } from './hollywoodTypes.js'
import type { GameState, PowerRankingRecord, PowerRankingRecordRow } from './types.js'

const RANKING_PHASE = 'p15a2.rankingRecord'
const BANDS: readonly FinancialStrengthBand[] = ['inTheRed', 'strained', 'stable', 'thriving']
const ROOT_KEYS = ['recordedFromWeek', 'snapshots', 'version'] as const
const RECORD_KEYS = ['available', 'definitionVersion', 'id', 'p15DomainSequence', 'phaseId', 'phaseOrderVersion',
  'phaseOrdinal', 'rows', 'week', 'windowStartWeek'] as const
const ROW_KEYS = ['band', 'countedFilmIds', 'filmsTenths', 'rank', 'ranked', 'releases', 'releasesTenths', 'studioId'] as const

function industryOf(state: GameState): HollywoodState {
  if (state.hollywood === null) throw new Error('power ranking archive: no industry to rank')
  return state.hollywood
}

function rivalOf(h: HollywoodState, studioId: string) {
  const business = h.businesses.find((b) => b.studioId === studioId)
  if (business === undefined) throw new Error(`power ranking archive: studio ${studioId} has no business`)
  return business
}

/**
 * The one weekly fixed cost (1352-A §2, 1352-F amendment 4; P15B imports it): the charge the next
 * advance makes, discretionary research excluded. Player: 0 while founding, else payroll + overhead
 * + facility opex (= weeklyBurn − weeklyResearchSpend). Rival: rivalWeeklyOperatingCost at the
 * current week.
 */
export function studioWeeklyFixedCost(state: GameState, studioId: string): number {
  const h = industryOf(state)
  if (studioId === h.playerStudioId) {
    return state.founding !== null ? 0 : weeklyPayroll(state) + weeklyOverhead(state) + weeklyFacilityOperatingCost(state)
  }
  return rivalWeeklyOperatingCost(rivalOf(h, studioId), h, state.market.tick)
}

function cashOf(state: GameState, h: HollywoodState, studioId: string): number {
  return studioId === h.playerStudioId ? state.studio.cash : rivalOf(h, studioId).account.cash
}

/** The law's input at `week` from persisted facts; `finance` false reads cash and cost as 0. */
function rankingInputAt(state: GameState, week: number, finance: boolean): RankingInput {
  const h = industryOf(state)
  const studios: RankingStudio[] = []
  for (const identity of h.identities) {
    if (identity.enteredWeek === null || identity.enteredWeek > week) continue
    studios.push({
      studioId: identity.studioId,
      enteredWeek: identity.enteredWeek,
      cash: finance ? cashOf(state, h, identity.studioId) : 0,
      weeklyFixedCost: finance ? studioWeeklyFixedCost(state, identity.studioId) : 0,
    })
  }
  const runs = new Map(state.theatricalRuns.map((run) => [run.productionId, run]))
  const films: RankingFilm[] = []
  for (const film of state.studio.releasedFilms) {
    // A pre-origin player film (migration-origin saves only) is not passed (1356-A §3).
    if (film.releaseTick < h.originWeek) continue
    const run = runs.get(film.productionId)
    films.push({
      filmId: film.productionId,
      studioId: h.playerStudioId,
      releaseTick: film.releaseTick,
      // The last payment week, releaseTick + totalWeeks − 1, is before `week`: arithmetic, never
      // `status`, so the validator reaches the step's answer years later (1356-F2 item 1).
      runEndedByWeek: run === undefined || run.status === 'legacyCompleted' || run.releaseTick + run.totalWeeks <= week,
      criticScore: film.criticScore,
      totalGross: film.boxOffice.total,
      authoredPreCampaign: false,
    })
  }
  for (const film of h.films) {
    if (film.provenance === 'authored-start/v1') {
      films.push({
        filmId: film.filmId,
        studioId: film.studioId,
        // The Bridge chronology tick (bridge/industry.ts:232).
        releaseTick: (film.released.year - 1920) * 52,
        runEndedByWeek: true,
        criticScore: film.criticScore,
        totalGross: film.totalGross,
        authoredPreCampaign: true,
      })
      continue
    }
    if (film.result.releaseTick < h.originWeek) continue
    films.push({
      filmId: film.filmId,
      studioId: film.studioId,
      releaseTick: film.result.releaseTick,
      runEndedByWeek: film.settledWeek !== null && film.settledWeek < week,
      criticScore: film.result.criticScore,
      totalGross: film.result.boxOffice.total,
      authoredPreCampaign: false,
    })
  }
  return { week, originWeek: h.originWeek, baseMarketValue: state.market.baseMarketValue, studios, films }
}

/** The law's input at W = state.market.tick (1356-A §3). No player flag, no RNG. */
export function powerRankingInput(state: GameState): RankingInput {
  return rankingInputAt(state, state.market.tick, true)
}

function recordRow(row: PowerRankingRow): PowerRankingRecordRow {
  return {
    studioId: row.studioId,
    ranked: row.ranked,
    rank: row.rank,
    filmsTenths: row.filmsTenths,
    releases: row.releases,
    releasesTenths: row.releasesTenths,
    countedFilmIds: [...row.countedFilmIds],
    band: row.band,
  }
}

/**
 * The tick step (1356-A §4). tick() wraps its last expression with it, so the band reads the week's
 * final cash and contracts; P15C's freeze later wraps this step (1361-F ruling 9). With an industry
 * and a quarter week it appends one record, allocated from `p15Sequence.next`, and writes nothing
 * else; otherwise it returns the state unchanged.
 *
 * Invariant (1356-F Amendment 2): `originWeek` and a migration's `recordedFromWeek` are stamped at
 * the current week before any further tick runs, so the first week this step can produce is
 * strictly above both. The validator's interval (max(recordedFromWeek, originWeek), market.tick]
 * is open at its lower end for exactly that reason.
 */
export function recordPowerRankingQuarter(state: GameState): GameState {
  const week = state.market.tick
  if (state.hollywood === null || !isPowerRankingWeek(week)) return state
  const snapshot = computePowerRanking(powerRankingInput(state))
  const n = state.p15Sequence.next
  const record: PowerRankingRecord = {
    id: `power-ranking-${n}`,
    p15DomainSequence: n,
    ...p15PhaseTriple(RANKING_PHASE),
    week,
    definitionVersion: snapshot.definitionVersion,
    available: snapshot.available,
    windowStartWeek: snapshot.windowStartWeek,
    rows: snapshot.rows.map(recordRow),
  }
  return {
    ...state,
    powerRanking: { ...state.powerRanking, snapshots: [...state.powerRanking.snapshots, record] },
    p15Sequence: { ...state.p15Sequence, next: n + 1 },
  }
}

function refuse(reason: string): never {
  throw new Error(`validatePowerRankingArchive: Power Ranking archive ${reason}`)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const own = Object.keys(value).sort()
  return own.length === keys.length && own.every((key, i) => key === keys[i])
}

const rowFacts = (row: Pick<PowerRankingRecordRow, 'studioId' | 'ranked' | 'rank' | 'filmsTenths' | 'releases' | 'releasesTenths' | 'countedFilmIds'>): string =>
  JSON.stringify([row.studioId, row.ranked, row.rank, row.filmsTenths, row.releases, row.releasesTenths, row.countedFilmIds])

/**
 * The root's own validator, run by validateSaveV45 after the frozen chain (1356-A §5 items 1-5):
 * keys, version and range; cadence; definition; each record's own sequence, id and phase triple;
 * cohort; the recompute by era. The allocator across every P15 root is save.ts's
 * `validateP15Allocator`, which the step runs once (1361-F ruling 5). Refuses by name; never repairs.
 */
export function validatePowerRankingArchive(raw: Record<string, unknown>): void {
  const archive = raw.powerRanking
  if (!isObject(archive) || !hasExactKeys(archive, ROOT_KEYS)) refuse('root must be exactly {version, recordedFromWeek, snapshots}')
  if (archive.version !== 1) refuse('version must be 1')
  const tick = (raw.market as { tick: number }).tick
  const recordedFromWeek = archive.recordedFromWeek
  if (typeof recordedFromWeek !== 'number' || !Number.isSafeInteger(recordedFromWeek) || recordedFromWeek < 0 || recordedFromWeek > tick) {
    refuse('recordedFromWeek must be a whole week in [0, market.tick]')
  }
  if (!Array.isArray(archive.snapshots)) refuse('snapshots must be an array')
  const records = archive.snapshots as unknown[]

  // The frozen chain has proved every root outside the P15 roots, so the state reads as GameState.
  const state = raw as unknown as GameState
  const h = state.hollywood
  if (h === null) {
    if (records.length > 0) refuse('holds a record without an industry')
    return
  }
  // Cadence: exactly the quarters in (max(recordedFromWeek, originWeek), market.tick], ascending.
  const expected: number[] = []
  for (let week = Math.max(recordedFromWeek, h.originWeek) + 1; week <= tick; week++) {
    if (isPowerRankingWeek(week)) expected.push(week)
  }
  if (records.length !== expected.length) {
    refuse(`cadence: ${records.length} records where the quarters in (max(recordedFromWeek, originWeek), market.tick] number ${expected.length}`)
  }

  let previous = 0
  for (const [index, value] of records.entries()) {
    if (!isObject(value) || !hasExactKeys(value, RECORD_KEYS)) refuse(`record ${index} has the wrong keys`)
    const record = value as unknown as PowerRankingRecord
    if (record.week !== expected[index]) refuse(`cadence: record ${index} is not the quarter ${expected[index]}`)
    if (record.definitionVersion !== POWER_RANKING_DEFINITION) refuse(`record ${record.week} names an unknown definition`)
    // This root's own rule (1355-F2 item 4): whole sequences that ascend with weeks, and the id
    // that cites them (annex D.7). Distinct across roots and below `next` is the allocator's rule.
    const n = record.p15DomainSequence
    if (typeof n !== 'number' || !Number.isSafeInteger(n) || n < 1) refuse(`record ${record.week} has no whole p15DomainSequence`)
    if (n <= previous) refuse(`record ${record.week} p15DomainSequence does not ascend with weeks`)
    if (record.id !== `power-ranking-${n}`) refuse(`record ${record.week} id is not power-ranking-<p15DomainSequence>`)
    // 1355-F5 ruling 1: the record's own version's entry, read through the exported table. A version
    // with no table, or a table with no entry for this phase, refuses (1361-F3 R2).
    const entry = Number.isSafeInteger(record.phaseOrderVersion)
      ? P15_PHASE_TABLES[record.phaseOrderVersion]?.find((candidate) => candidate.phaseId === RANKING_PHASE) : undefined
    if (record.phaseId !== RANKING_PHASE || entry === undefined || entry.phaseOrdinal !== record.phaseOrdinal) {
      refuse(`record ${record.week} phase triple does not match its phase-order version`)
    }
    previous = n

    if (!Array.isArray(record.rows)) refuse(`record ${record.week} rows must be an array`)
    for (const row of record.rows as unknown[]) {
      if (!isObject(row) || !hasExactKeys(row, ROW_KEYS)) refuse(`record ${record.week} has a row with the wrong keys`)
      if (!BANDS.includes(row.band as FinancialStrengthBand)) refuse(`record ${record.week} has an unknown band`)
    }
    const cohort = h.identities.filter((s) => s.enteredWeek !== null && s.enteredWeek <= record.week).map((s) => s.studioId).sort()
    const rowIds = record.rows.map((row) => row.studioId).sort()
    if (JSON.stringify(rowIds) !== JSON.stringify(cohort)) refuse(`cohort: record ${record.week} rows are not exactly the studios entered by its week`)

    // Recompute by era: v1 is computePowerRanking with today's pinned TUNING. Cash and cost read 0,
    // because cash at W is not recoverable, so every field but the band must match, row order included.
    const law = computePowerRanking(rankingInputAt(state, record.week, false))
    if (record.available !== law.available || record.windowStartWeek !== law.windowStartWeek) {
      refuse(`record ${record.week} availability or window differs from the recomputed law`)
    }
    // `rank` is compared directly as well: rowFacts serializes, and JSON writes an in-memory
    // `undefined` as the law's `null` (1361-F3 R2).
    if (record.rows.length !== law.rows.length ||
      record.rows.some((row, i) => row.rank !== law.rows[i]!.rank || rowFacts(row) !== rowFacts(law.rows[i]!))) {
      refuse(`record ${record.week} rows differ from the recomputed law`)
    }
  }
}
