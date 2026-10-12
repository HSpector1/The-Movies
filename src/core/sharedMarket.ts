// ── P15A.1 Wave 1: the pure shared-market law `p15a1-market-v1` ──────────────
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/):
// 1323-A §3 as amended by 1323-F (Amendment 3 and the adopted eligibility note),
// Owner decision D-1323-1 (1340-O), and the parent's API decisions 1346-X and 1346-F.
//
// Pure `(inputs) => outputs`: no RNG, no GameState, no save, Bridge or UI. Wave 1 is
// unintegrated; Wave 2 owns the batch extraction, the P07 seam and persistence.
//
// A release at week R weighs, at week t: by offset inside the window [R, R+4); then
// 0.20·2^(−(t−(R+4))/13) in the stock [R+4, R+26); nothing from R+26. For subject s of
// genre g in the batch at week W: P = Σk min(Wk, cap) + stock, where Wk is studio k's
// genre-g window weight (its exposures plus its other batch members at 1.00 each; never
// s itself) and stock sums every genre-g stock weight, unclamped. The factor is
// f(P) = 1 − m·(1 − e^(−P/2)), m the era's maximum penalty: 0.25 under `p15a1-market-v1`
// (frozen below), 0.15 under the live `p15a1-market-v2` (the 1365 retune, 1361-F5 ruling 3,
// the Owner's named weaker alternative of 1323-F). Other genres contribute nothing.
//
// Eras (1355-A §3.4 item 5): every function takes the law it prices under; the default is the
// live law read from TUNING at the call. A stored row reconciles under the law its
// `definitionVersion` names, through `MARKET_LAWS`, so a retune never rewrites an old row.
//
// Exactness: every term is evaluated from each week offset's summed release contribution
// (`releaseContribution`; 1 per release in v1, so these are integer counts), in a fixed
// offset order. No input order, studio order or id relabelling can move a bit of
// pressure, factor or either term, and no studio flag or owner enters the formula.
//
// Work (1323-F Amendment 3): one pass folds each exposure and each member into
// per-(studio, genre) window books and per-genre books; each subject is then derived in
// constant time by taking its own release out of its studio's window and re-clamping.
// The optional step counter counts exactly those visits: one per exposure, one per member
// folded, one per subject derived. The canonical member sort (m·log m comparisons) and
// the per-genre finish (six genres at most) are outside it.

import { fnv1a64 } from './math.js'
import { GENRE_ORDER, TUNING } from './tuning.js'
import type { Genre } from './types.js'

export type MarketDefinitionId = 'p15a1-market-v1' | 'p15a1-market-v2'
/** The live era. A change to any of the seven SHARED_MARKET_* values bumps it (tuning.ts). */
export const SHARED_MARKET_DEFINITION: MarketDefinitionId = 'p15a1-market-v2'

/** The seven numbers one era prices under (1355-A §3.4 item 5). */
export type MarketLaw = Readonly<{
  definition: MarketDefinitionId
  windowWeights: readonly number[]
  stockStart: number
  stockHalfLifeWeeks: number
  retireAfterWeeks: number
  factorMaxPenalty: number
  pressureScale: number
  studioWindowCap: number
}>
/** v1's seven numbers as Wave 1 landed them (D-1323-1). A v1 row reconciles under these forever. */
export const SHARED_MARKET_LAW_V1: MarketLaw = Object.freeze({
  definition: 'p15a1-market-v1' as const,
  windowWeights: Object.freeze([1, 0.55, 0.55, 0.2]) as readonly number[],
  stockStart: 0.2,
  stockHalfLifeWeeks: 13,
  retireAfterWeeks: 26,
  factorMaxPenalty: 0.25,
  pressureScale: 2,
  studioWindowCap: 1,
})
/** The live law: the live definition over TUNING, read at the call. */
export function liveMarketLaw(): MarketLaw {
  return {
    definition: SHARED_MARKET_DEFINITION,
    windowWeights: TUNING.SHARED_MARKET_WINDOW_WEIGHTS,
    stockStart: TUNING.SHARED_MARKET_STOCK_START,
    stockHalfLifeWeeks: TUNING.SHARED_MARKET_STOCK_HALF_LIFE_WEEKS,
    retireAfterWeeks: TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS,
    factorMaxPenalty: TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY,
    pressureScale: TUNING.SHARED_MARKET_PRESSURE_SCALE,
    studioWindowCap: TUNING.SHARED_MARKET_STUDIO_WINDOW_CAP,
  }
}
/** The era table: each definition a stored row may name, to its law. A later retune adds an entry
 * and leaves the earlier ones untouched. */
export const MARKET_LAWS: Readonly<Record<MarketDefinitionId, () => MarketLaw>> = Object.freeze({
  'p15a1-market-v1': () => SHARED_MARKET_LAW_V1,
  'p15a1-market-v2': liveMarketLaw,
})

/** Hard maximum of source ids on one reason (1346-F). Bounds a record, not a market outcome. */
export const MARKET_REASON_SOURCE_LIMIT = 5

export type MarketLane = 'window' | 'stock' | 'retired'
export type MarketReasonCode =
  | 'SAME_WEEK_RELEASES'
  | 'WINDOW_RELEASES'
  | 'GENRE_SATURATION'
  | 'STUDIO_CLAMPED'
  | 'NO_PRESSURE'
export type MarketRelease = { releaseId: string; studioId: string; genre: Genre; releaseWeek: number }
/** An exposure is a past release. */
export type MarketExposure = MarketRelease
export type MarketBatchMember = { releaseId: string; studioId: string; genre: Genre }
export type MarketBatch = { week: number; members: readonly MarketBatchMember[] }
/**
 * One reason per applicable code. Its contributors are releases, each weighing its
 * contribution times its lane weight at the batch week; `value` is the full sum over
 * every contributor, and `sourceReleaseIds` lists the heaviest MARKET_REASON_SOURCE_LIMIT
 * of them in selection order, ties by ascending releaseId (1346-F):
 * - SAME_WEEK_RELEASES: the other same-genre batch members;
 * - WINDOW_RELEASES: same-genre pre-batch exposures in the window lane;
 * - GENRE_SATURATION: same-genre exposures in the stock lane (value = stockTerm);
 * - STUDIO_CLAMPED: the window-lane releases of every studio whose window, without the
 *   subject, exceeds the cap (value = those windows' full sum; each adds only the cap);
 * - NO_PRESSURE: alone, when pressure is 0.
 */
export type MarketReason = { code: MarketReasonCode; sourceReleaseIds: string[]; value: number }
export type MarketAssessment = {
  releaseId: string
  studioId: string
  genre: Genre
  week: number
  definitionVersion: MarketDefinitionId
  pressure: number
  factor: number
  windowTerm: number
  stockTerm: number
  inputDigest: string
  reasons: MarketReason[]
}
export type MarketLaneTransition = { releaseId: string; from: MarketLane; to: MarketLane }

// ── the lanes and the factor ─────────────────────────────────────────────────

/** 1323-A §3 reach-scaling seam: every release weight is multiplied through it once. v1 returns 1. */
export function releaseContribution(_release: MarketRelease): number {
  return 1
}

/** A release's lane and weight at `week` under `law`. Exactly one lane per week; `week < releaseWeek` is a caller error. */
export function exposureWeight(releaseWeek: number, week: number, law: MarketLaw = liveMarketLaw()): { lane: MarketLane; weight: number } {
  if (!Number.isInteger(releaseWeek) || !Number.isInteger(week)) {
    throw new Error(`shared market: weeks must be integers (release ${releaseWeek}, week ${week})`)
  }
  const offset = week - releaseWeek
  if (offset < 0) throw new Error(`shared market: week ${week} precedes release week ${releaseWeek}`)
  const window = law.windowWeights
  if (offset < window.length) return { lane: 'window', weight: window[offset] as number }
  if (offset < law.retireAfterWeeks) {
    return {
      lane: 'stock',
      weight: law.stockStart * 2 ** (-(offset - window.length) / law.stockHalfLifeWeeks),
    }
  }
  return { lane: 'retired', weight: 0 }
}

/** f(P) = 1 − m·(1 − e^(−P/s)) as written, under `law` (live: m = 0.15, s = 2, so f ∈ [0.85, 1]; v1: m = 0.25,
 * f ∈ [0.75, 1]). f(0) = 1 exactly; float64 reaches the floor exactly past P ≈ 72. */
export function pressureFactor(pressure: number, law: MarketLaw = liveMarketLaw()): number {
  if (!Number.isFinite(pressure) || pressure < 0) {
    throw new Error(`shared market: pressure must be finite and non-negative (got ${pressure})`)
  }
  return 1 - law.factorMaxPenalty * (1 - Math.exp(-pressure / law.pressureScale))
}

// ── batch assessment ─────────────────────────────────────────────────────────

type Source = { releaseId: string; weight: number }

/** One studio's genre-g releases in the window lane: contribution summed per week offset (0 = the batch week). */
type StudioWindow = { counts: number[]; raw: number; sources: Source[] }

type GenreBook = {
  studios: Map<string, StudioWindow>
  windowCounts: number[] // window-lane contribution per offset: members at 0, exposures at 1..3
  sameWeekSources: Source[] // one spare, for self-exclusion
  windowSources: Source[]
  clamped: number // studio windows over the cap
  clampedCounts: number[] // their contribution per offset
  clampedTop: StudioWindow[] // the clamped windows with the heaviest leads, one spare
  stockCounts: number[] // stock-lane contribution per offset
  stockSources: Source[]
  stockTerm: number
  digest: bigint // order-free sum of the genre's record digests
  digestHex: string
}

const DIGEST_MASK = 0xffffffffffffffffn

/**
 * One assessment per batch member, in canonical `(week, releaseId)` order. Each subject
 * reads the same pre-batch exposures plus the other batch members, never itself.
 */
export function assessBatch(
  exposures: readonly MarketExposure[],
  batch: MarketBatch,
  options: { steps?: { count: number }; law?: MarketLaw } = {},
): MarketAssessment[] {
  const law = options.law ?? liveMarketLaw()
  const week = requireWeek(batch.week)
  const step = (): void => {
    if (options.steps !== undefined) options.steps.count++
  }
  const seen = new Set<string>()
  const books = new Map<Genre, GenreBook>()
  const bookFor = (genre: Genre): GenreBook => {
    let book = books.get(genre)
    if (book === undefined) {
      book = {
        studios: new Map(),
        windowCounts: zeros(law.windowWeights.length),
        sameWeekSources: [],
        windowSources: [],
        clamped: 0,
        clampedCounts: zeros(law.windowWeights.length),
        clampedTop: [],
        stockCounts: zeros(law.retireAfterWeeks),
        stockSources: [],
        stockTerm: 0,
        digest: 0n,
        digestHex: '',
      }
      books.set(genre, book)
    }
    return book
  }

  for (const exposure of exposures) {
    step()
    requirePreBatch(exposure, week, seen)
    const offset = week - exposure.releaseWeek
    const { lane, weight } = exposureWeight(exposure.releaseWeek, week, law)
    if (lane === 'retired') continue
    const book = bookFor(exposure.genre)
    addDigest(book, exposure.releaseWeek, exposure.releaseId, exposure.studioId)
    const contribution = releaseContribution(exposure)
    const source = { releaseId: exposure.releaseId, weight: contribution * weight }
    if (lane === 'window') foldWindow(book, exposure.studioId, source, offset, contribution, law)
    else {
      book.stockCounts[offset]! += contribution
      keepHeaviest(book.stockSources, source, MARKET_REASON_SOURCE_LIMIT)
    }
  }

  const members = canonicalMembers(batch.members)
  const sameWeekWeight = law.windowWeights[0] as number
  for (const member of members) {
    step()
    requireRelease(member, seen)
    const book = bookFor(member.genre)
    addDigest(book, week, member.releaseId, member.studioId)
    const contribution = releaseContribution(asRelease(member, week))
    foldWindow(book, member.studioId, { releaseId: member.releaseId, weight: contribution * sameWeekWeight }, 0, contribution, law)
  }

  for (const book of books.values()) {
    for (let offset = law.windowWeights.length; offset < book.stockCounts.length; offset++) {
      book.stockTerm += book.stockCounts[offset]! * exposureWeight(0, offset, law).weight
    }
    book.digestHex = book.digest.toString(16).padStart(16, '0')
  }

  return members.map((member) => {
    step()
    return assessSubject(member, week, books.get(member.genre)!, law)
  })
}

function assessSubject(member: MarketBatchMember, week: number, book: GenreBook, law: MarketLaw): MarketAssessment {
  const cap = law.studioWindowCap
  const windowLength = law.windowWeights.length
  // Self-exclusion: the subject is one same-week release in its own studio's window.
  // Take it out and re-clamp that studio; every other studio stands as folded.
  const own = book.studios.get(member.studioId)!
  const contribution = releaseContribution(asRelease(member, week))
  const ownCounts = own.counts.slice()
  ownCounts[0]! -= contribution
  const ownWasClamped = own.raw > cap
  const ownIsClamped = laneSum(ownCounts, 0, windowLength, law) > cap
  const counts = book.windowCounts.slice()
  counts[0]! -= contribution
  const clampedCounts = book.clampedCounts.slice()
  if (ownWasClamped) addCounts(clampedCounts, own.counts, -1)
  if (ownIsClamped) addCounts(clampedCounts, ownCounts, 1)
  const clamped = book.clamped - Number(ownWasClamped) + Number(ownIsClamped)
  // Clamped windows add exactly the cap each; the rest add their releases' weights.
  const unclamped = counts.map((n, offset) => n - clampedCounts[offset]!)
  const windowTerm = clamped * cap + laneSum(unclamped, 0, windowLength, law)
  const stockTerm = book.stockTerm
  const pressure = windowTerm + stockTerm

  const reasons: MarketReason[] = []
  if (counts[0]! > 0) {
    reasons.push(reason('SAME_WEEK_RELEASES', laneSum(counts, 0, 1, law), book.sameWeekSources.filter((s) => s.releaseId !== member.releaseId)))
  }
  const windowExposures = laneSum(counts, 1, windowLength, law)
  if (windowExposures > 0) reasons.push(reason('WINDOW_RELEASES', windowExposures, book.windowSources))
  if (stockTerm > 0) reasons.push(reason('GENRE_SATURATION', stockTerm, book.stockSources))
  if (clamped > 0) {
    // The heaviest clamped releases come from the clamped windows with the heaviest leads.
    const pool: Source[] = []
    let studios = 0
    for (const studio of book.clampedTop) {
      if (studio !== own && studios < MARKET_REASON_SOURCE_LIMIT) {
        pool.push(...studio.sources.slice(0, MARKET_REASON_SOURCE_LIMIT))
        studios++
      }
    }
    if (ownIsClamped) pool.push(...own.sources.filter((s) => s.releaseId !== member.releaseId))
    reasons.push(reason('STUDIO_CLAMPED', laneSum(clampedCounts, 0, windowLength, law), pool.sort(compareSources)))
  }
  if (reasons.length === 0) reasons.push({ code: 'NO_PRESSURE', sourceReleaseIds: [], value: 0 })

  return {
    releaseId: member.releaseId,
    studioId: member.studioId,
    genre: member.genre,
    week,
    definitionVersion: law.definition,
    pressure,
    factor: pressureFactor(pressure, law),
    windowTerm,
    stockTerm,
    inputDigest: fnv1a64(JSON.stringify([law.definition, week, member.releaseId, member.studioId, member.genre, book.digestHex])),
    reasons,
  }
}

/** `sources` arrive heaviest first; the reason keeps the first MARKET_REASON_SOURCE_LIMIT. */
function reason(code: MarketReasonCode, value: number, sources: readonly Source[]): MarketReason {
  return { code, sourceReleaseIds: sources.slice(0, MARKET_REASON_SOURCE_LIMIT).map((s) => s.releaseId), value }
}

function foldWindow(book: GenreBook, studioId: string, source: Source, offset: number, contribution: number, law: MarketLaw): void {
  const cap = law.studioWindowCap
  let studio = book.studios.get(studioId)
  if (studio === undefined) {
    studio = { counts: zeros(law.windowWeights.length), raw: 0, sources: [] }
    book.studios.set(studioId, studio)
  }
  const wasClamped = studio.raw > cap
  studio.counts[offset]! += contribution
  studio.raw = laneSum(studio.counts, 0, studio.counts.length, law)
  keepHeaviest(studio.sources, source, MARKET_REASON_SOURCE_LIMIT + 1)
  book.windowCounts[offset]! += contribution
  if (offset === 0) keepHeaviest(book.sameWeekSources, source, MARKET_REASON_SOURCE_LIMIT + 1)
  else keepHeaviest(book.windowSources, source, MARKET_REASON_SOURCE_LIMIT)
  if (wasClamped) book.clampedCounts[offset]! += contribution
  else if (studio.raw > cap) {
    book.clamped++
    addCounts(book.clampedCounts, studio.counts, 1)
  }
  if (studio.raw > cap) {
    // A clamped window stays clamped and its lead only gets heavier (or ties earlier by
    // id), so this bounded list stays exactly the top MARKET_REASON_SOURCE_LIMIT + 1.
    if (!book.clampedTop.includes(studio)) book.clampedTop.push(studio)
    book.clampedTop.sort((a, b) => compareSources(a.sources[0]!, b.sources[0]!))
    if (book.clampedTop.length > MARKET_REASON_SOURCE_LIMIT + 1) book.clampedTop.pop()
  }
}

/** Σ counts[offset] × window weight over [from, to), in offset order: exact for any release order. */
function laneSum(counts: readonly number[], from: number, to: number, law: MarketLaw): number {
  const weights = law.windowWeights
  let sum = 0
  for (let offset = from; offset < to; offset++) sum += counts[offset]! * weights[offset]!
  return sum
}

function addCounts(into: number[], counts: readonly number[], sign: 1 | -1): void {
  for (let offset = 0; offset < counts.length; offset++) into[offset]! += sign * counts[offset]!
}

function compareSources(a: Source, b: Source): number {
  return b.weight - a.weight || compareIds(a.releaseId, b.releaseId)
}

function keepHeaviest(sources: Source[], source: Source, limit: number): void {
  sources.push(source)
  sources.sort(compareSources)
  if (sources.length > limit) sources.pop()
}

function addDigest(book: GenreBook, releaseWeek: number, releaseId: string, studioId: string): void {
  const record = BigInt(`0x${fnv1a64(JSON.stringify([releaseWeek, releaseId, studioId]))}`)
  book.digest = (book.digest + record) & DIGEST_MASK
}

// ── the exposure reducer ─────────────────────────────────────────────────────

/**
 * Appends the batch members as exposures at `batch.week` and drops every exposure
 * retired at that week. A transition is an exposure whose lane at `batch.week − 1`
 * differs from its lane at `batch.week`; an appended member has no earlier lane (1346-F).
 */
export function reduceExposures(
  exposures: readonly MarketExposure[],
  batch: MarketBatch,
  law: MarketLaw = liveMarketLaw(),
): { exposures: MarketExposure[]; retired: string[]; transitions: MarketLaneTransition[] } {
  const week = requireWeek(batch.week)
  const seen = new Set<string>()
  const kept: MarketExposure[] = []
  const retired: string[] = []
  const transitions: MarketLaneTransition[] = []
  for (const exposure of exposures) {
    requirePreBatch(exposure, week, seen)
    const from = exposureWeight(exposure.releaseWeek, week - 1, law).lane
    const to = exposureWeight(exposure.releaseWeek, week, law).lane
    if (from !== to) transitions.push({ releaseId: exposure.releaseId, from, to })
    if (to === 'retired') retired.push(exposure.releaseId)
    else kept.push(exposure)
  }
  for (const member of canonicalMembers(batch.members)) {
    requireRelease(member, seen)
    kept.push({ releaseId: member.releaseId, studioId: member.studioId, genre: member.genre, releaseWeek: week })
  }
  return { exposures: kept, retired, transitions }
}

// ── inputs ───────────────────────────────────────────────────────────────────

function canonicalMembers(members: readonly MarketBatchMember[]): MarketBatchMember[] {
  return [...members].sort((a, b) => compareIds(a.releaseId, b.releaseId))
}

function asRelease(member: MarketBatchMember, week: number): MarketRelease {
  return { releaseId: member.releaseId, studioId: member.studioId, genre: member.genre, releaseWeek: week }
}

function requireWeek(week: number): number {
  if (!Number.isInteger(week)) throw new Error(`shared market: batch week must be an integer (got ${week})`)
  return week
}

function requirePreBatch(exposure: MarketExposure, week: number, seen: Set<string>): void {
  if (exposure.releaseWeek >= week) {
    throw new Error(`shared market: exposure ${exposure.releaseId} (week ${exposure.releaseWeek}) is not before batch week ${week}`)
  }
  requireRelease(exposure, seen)
}

/** Eligibility: a catalogue genre, and one appearance per release across exposures and members. */
function requireRelease(release: { releaseId: string; genre: Genre }, seen: Set<string>): void {
  if (!(GENRE_ORDER as readonly unknown[]).includes(release.genre)) {
    throw new Error(`shared market: release ${release.releaseId} has no catalogue genre (${String(release.genre)})`)
  }
  if (seen.has(release.releaseId)) throw new Error(`shared market: release ${release.releaseId} appears twice`)
  seen.add(release.releaseId)
}

function compareIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function zeros(length: number): number[] {
  return new Array<number>(length).fill(0)
}
