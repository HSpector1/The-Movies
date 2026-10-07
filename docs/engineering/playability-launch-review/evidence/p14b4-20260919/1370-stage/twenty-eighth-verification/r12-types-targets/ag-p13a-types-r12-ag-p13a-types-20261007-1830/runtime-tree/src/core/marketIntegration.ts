// ── P15A.1 Wave 2: the shared market in the live release pipeline ─────────────
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/): 1355-A §3 as
// adopted by 1355-F, 1355-F2, 1355-F3 and 1355-F5; 1361-F rulings 3 to 6. The law is Wave 1's
// `sharedMarket.ts` (`p15a1-market-v1`), always called through its module export.
//
// The root `sharedMarket` holds each assessment the law returned, plus the row's P15 domain
// sequence and phase triple, in (week, releaseId) order. Active exposures derive from it and are
// never stored. Its validator refuses by name. The one allocator check across every P15 root runs
// once in save.ts (1361-F ruling 5), so no copy of it lives here.

import { P15_PHASE_TABLES } from './p15Phases.js'
import { assessBatch, SHARED_MARKET_DEFINITION } from './sharedMarket.js'
import { GENRE_ORDER, TUNING } from './tuning.js'
import type { HollywoodState } from './hollywoodTypes.js'
import type { GameState, Genre, PersistedMarketAssessment, SharedMarketRoot } from './types.js'

export const MARKET_PHASE_ID = 'p15a1.marketBatch'

/** The empty root a fresh world, a migration and a historical lift write: nothing assessed,
 * recording from `week`. No earlier release becomes an exposure (P15:677; annex:558). */
export const initialSharedMarket = (week: number): SharedMarketRoot => ({ version: 1, recordedFromWeek: week, assessments: [] })

/** The root a live tick reads. A state without it fails here by name, never with a default. */
export function requireSharedMarket(state: GameState): SharedMarketRoot {
  const root = (state as Partial<GameState>).sharedMarket
  if (root === undefined) throw new Error('shared market: the state has no sharedMarket root; migrate it to Save45 before ticking it')
  return root
}

// ── the save validator (1355-A §3.4; 1355-F3 RED 14; 1355-F5 ruling 1) ─────────────
const ROOT_KEYS = ['assessments', 'recordedFromWeek', 'version']
const ROW_KEYS = ['definitionVersion', 'factor', 'genre', 'inputDigest', 'p15DomainSequence', 'phaseId', 'phaseOrderVersion',
  'phaseOrdinal', 'pressure', 'reasons', 'releaseId', 'stockTerm', 'studioId', 'week', 'windowTerm']
const REASON_KEYS = ['code', 'sourceReleaseIds', 'value']
/** The era map (1355-A §3.4 item 5): each definition version to its law; v1 is the live TUNING. A
 * retune adds a definition and its law here, so old rows keep reconciling under their own. */
const LAWS: Readonly<Record<string, typeof assessBatch>> = { [SHARED_MARKET_DEFINITION]: assessBatch }
const LAW_FIELDS = ['pressure', 'factor', 'windowTerm', 'stockTerm', 'inputDigest'] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const sameKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => {
  const own = Object.keys(value).sort()
  return own.length === keys.length && own.every((key, i) => key === keys[i])
}
const isWeek = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0

/**
 * Validates `sharedMarket` against the whole state, refusing by name. The step runs it after the
 * frozen V44 chain has proved the rest of the state, so `market`, `hollywood`, `concepts` and
 * `studio` are well formed here. Checks: exact keys and version; `recordedFromWeek` in
 * [0, market.tick]; each row's exact keys and fields, known definition and the phase triple of its
 * own `phaseOrderVersion`; `recordedFromWeek <= week < market.tick`; strict (week, releaseId) and
 * p15DomainSequence ascent; no row without an industry; the film bijection; the law reconciled.
 */
export function validateSharedMarketRoot(raw: Record<string, unknown>, label: string): void {
  const fail = (message: string): never => { throw new Error(`${label}: sharedMarket ${message}`) }
  const root = raw.sharedMarket
  if (!isRecord(root)) return fail('root must be an object')
  if (!sameKeys(root, ROOT_KEYS)) fail(`root must have exactly the keys ${ROOT_KEYS.join(', ')}`)
  if (root.version !== 1) fail(`version ${String(root.version)} is unknown`)
  const state = raw as unknown as GameState
  const tick = state.market.tick
  const recordedFromWeek = root.recordedFromWeek
  if (!isWeek(recordedFromWeek) || recordedFromWeek > tick) return fail(`recordedFromWeek ${String(recordedFromWeek)} is not a week in [0, ${tick}]`)
  const values: unknown = root.assessments
  if (!Array.isArray(values)) return fail('assessments must be an array')
  if (state.hollywood === null && values.length > 0) fail('holds assessments in a world with no industry')

  const rows: PersistedMarketAssessment[] = []
  const seen = new Set<string>()
  for (const [i, value] of (values as unknown[]).entries()) {
    if (!isRecord(value)) return fail(`assessment ${i} is not an object`)
    if (!sameKeys(value, ROW_KEYS)) {
      const keys = Object.keys(value)
      const unexpected = keys.filter((key) => !ROW_KEYS.includes(key))
      const missing = ROW_KEYS.filter((key) => !keys.includes(key))
      fail(`assessment ${i} must have exactly the persisted keys (unexpected key: ${unexpected.join(', ') || 'none'}; missing: ${missing.join(', ') || 'none'})`)
    }
    const row = value as unknown as PersistedMarketAssessment
    if (typeof row.releaseId !== 'string' || typeof row.studioId !== 'string' || !(GENRE_ORDER as readonly unknown[]).includes(row.genre) ||
      !isWeek(row.week) || typeof row.definitionVersion !== 'string' || typeof row.inputDigest !== 'string' ||
      ![row.pressure, row.factor, row.windowTerm, row.stockTerm].every((n) => Number.isFinite(n)) ||
      !Number.isSafeInteger(row.p15DomainSequence) || typeof row.phaseId !== 'string' ||
      !Number.isSafeInteger(row.phaseOrdinal) || !Number.isSafeInteger(row.phaseOrderVersion) || !Array.isArray(row.reasons)) {
      fail(`assessment ${i} has a malformed field`)
    }
    for (const reason of row.reasons as unknown[]) {
      if (!isRecord(reason) || !sameKeys(reason, REASON_KEYS) || typeof reason.code !== 'string' || typeof reason.value !== 'number' ||
        !Array.isArray(reason.sourceReleaseIds) || !reason.sourceReleaseIds.every((id: unknown) => typeof id === 'string')) {
        fail(`assessment ${row.releaseId} has a malformed reason`)
      }
    }
    if (!Object.hasOwn(LAWS, row.definitionVersion)) fail(`assessment ${row.releaseId} definitionVersion ${row.definitionVersion} is unknown`)
    // 1355-F5 ruling 1: the entry of the row's own version, read through the module's exported binding.
    const entry = P15_PHASE_TABLES[row.phaseOrderVersion]?.find((candidate) => candidate.phaseId === MARKET_PHASE_ID)
    if (row.phaseId !== MARKET_PHASE_ID || entry === undefined || entry.phaseOrdinal !== row.phaseOrdinal) {
      fail(`assessment ${row.releaseId} phase triple (${row.phaseId}, ${row.phaseOrdinal}, ${row.phaseOrderVersion}) does not match its phaseOrderVersion's table entry`)
    }
    if (row.week < recordedFromWeek) fail(`assessment ${row.releaseId} week ${row.week} is before recordedFromWeek ${recordedFromWeek}`)
    if (row.week >= tick) fail(`assessment ${row.releaseId} week ${row.week} is not before market.tick ${tick}`)
    if (seen.has(row.releaseId)) fail(`holds a duplicate assessment of ${row.releaseId}`)
    seen.add(row.releaseId)
    const previous: PersistedMarketAssessment | undefined = rows[rows.length - 1]
    if (previous !== undefined && (previous.week > row.week || (previous.week === row.week && previous.releaseId >= row.releaseId))) {
      fail(`assessments are out of (week, releaseId) order at ${row.releaseId}`)
    }
    if (row.p15DomainSequence < 1) fail(`assessment ${row.releaseId} p15DomainSequence ${row.p15DomainSequence} is below 1`)
    if (previous !== undefined && row.p15DomainSequence <= previous.p15DomainSequence) {
      fail(`assessment ${row.releaseId} p15DomainSequence ${row.p15DomainSequence} does not ascend`)
    }
    rows.push(row)
  }
  if (state.hollywood !== null) validateFilmBijection(state, state.hollywood, rows, recordedFromWeek, fail)
  reconcileLaw(rows, fail)
}

/** 1355-A §3.4 item 3: from max(recordedFromWeek, originWeek), every simulated release has exactly
 * one assessment with its id, week, studio and genre, and every assessment has its film. */
function validateFilmBijection(state: GameState, hollywood: HollywoodState, rows: readonly PersistedMarketAssessment[],
  recordedFromWeek: number, fail: (message: string) => never): void {
  const from = Math.max(recordedFromWeek, hollywood.originWeek)
  const genres = new Map(state.concepts.map((concept) => [concept.id, concept.genre]))
  const films = new Map<string, { week: number; studioId: string; genre: Genre | undefined }>()
  for (const film of state.studio.releasedFilms) {
    if (film.releaseTick >= from) films.set(film.productionId, { week: film.releaseTick, studioId: hollywood.playerStudioId, genre: genres.get(film.conceptId) })
  }
  for (const film of hollywood.films) {
    if (film.provenance === 'simulation/v1' && film.result.releaseTick >= from) {
      films.set(film.filmId, { week: film.result.releaseTick, studioId: film.studioId, genre: film.genre })
    }
  }
  for (const row of rows) {
    const film = films.get(row.releaseId)
    if (film === undefined) fail(`assessment ${row.releaseId} has no film released from week ${from}`)
    else if (film.week !== row.week || film.studioId !== row.studioId || film.genre !== row.genre) {
      fail(`assessment ${row.releaseId} disagrees with its film's week, studio or genre`)
    }
  }
  if (films.size === rows.length) return
  const assessed = new Set(rows.map((row) => row.releaseId))
  for (const [id, film] of films) if (!assessed.has(id)) fail(`film ${id} released at week ${film.week} has no assessment`)
}

/** 1355-A §3.4 item 4: week by week, rebuild the exposures and members from the stored rows alone
 * and re-run the law of the week's definition; every law field and every reason must be exactly
 * equal (the law is order-free, sharedMarket.ts:16-19). One pass, O(sum of active + members). */
function reconcileLaw(rows: readonly PersistedMarketAssessment[], fail: (message: string) => never): void {
  let windowStart = 0
  for (let start = 0; start < rows.length;) {
    const week = rows[start]!.week
    let end = start
    while (end < rows.length && rows[end]!.week === week) end++
    while (rows[windowStart]!.week <= week - TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS) windowStart++
    const exposures = rows.slice(windowStart, start)
      .map((row) => ({ releaseId: row.releaseId, studioId: row.studioId, genre: row.genre, releaseWeek: row.week }))
    const members = rows.slice(start, end)
    const law = LAWS[members[0]!.definitionVersion]!
    const expected = law(exposures, { week, members: members.map((row) => ({ releaseId: row.releaseId, studioId: row.studioId, genre: row.genre })) })
    members.forEach((row, k) => {
      const lawRow = expected[k]!
      for (const field of LAW_FIELDS) {
        if (row[field] !== lawRow[field]) fail(`assessment ${row.releaseId} ${field} does not reconcile with ${row.definitionVersion}`)
      }
      const reasonsMatch = row.reasons.length === lawRow.reasons.length && row.reasons.every((reason, r) => {
        const other = lawRow.reasons[r]!
        return reason.code === other.code && reason.value === other.value &&
          reason.sourceReleaseIds.length === other.sourceReleaseIds.length &&
          reason.sourceReleaseIds.every((id, s) => id === other.sourceReleaseIds[s])
      })
      if (!reasonsMatch) fail(`assessment ${row.releaseId} reasons do not reconcile with ${row.definitionVersion}`)
    })
    start = end
  }
}
