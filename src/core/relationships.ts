// ── P14B.5 — First Shared-Work Bond Core ─────────────────────────────────────
//
// A PURE module (like promises/talentMarket): no React/DOM/async/IO, no time, no
// unseeded entropy, NO RNG AT ALL. Every function here is a deterministic,
// replayable read or write over committed state, so `state.rngState` is untouched
// by every relationship path (plan scope (8); companion §8 :641).
//
// Authority: docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md
// ("P14B.5 — First Shared-Work Bond Core — task expansion"), and by reference the
// companion §5 (§5.1 scale, §5.2 two facts per pair, §5.3 the ladder, §5.4 the
// drivers, §5.5 drift and history, §5.6 consumers, §5.7 identity and cost).
//
// WHAT THIS MODULE DOES NOT OWN (never duplicated here): P10 the person; P12 the
// employer intervals (the roster-at-W helper lives in `talentMarket.ts`, which
// calls in — this module never imports it); the first-take fact (`promises.ts`
// appends it, this module only reads the receipt); the release fact (the tick's
// release step and `advanceHollywoodWeek`); the promise law and trust derivation.
//
// WHERE THE ROOT LIVES. `state.relationships` is a GAME-STATE root at the top
// level beside `firstTakes`/`promises` (R22: never inside `hollywood`); its
// version is the save version (V31), no second version field. Every edge is
// keyed by the CANONICAL pair `a < b` (code-unit order) and minted ONLY from
// this advance's delta — never from a scan of a root, so a migrated save forms
// no edge from its old credits (Q3, OPEN 2 stays open).

import type {
  CastSlot, FilmResult, FirstTakeReceipt, GameState, Production, RelationshipDriver, RelationshipDriverKind,
  RelationshipEdge, RelationshipTier,
} from './types.js'

// ── the versioned rule and the named HYPOTHESES (plan :761; none is settled law) ──

/** The tier rule revision (code-only: the chooser receipt carries no rules
 * version, the B.1 precedent). 1 = value bands with the named floors PLUS the
 * §5.3 evidence condition: Nemeses/Enemies need a conflict record, and B.5
 * mints no conflict-record kind, so those bands READ Strained. */
export const RELATIONSHIP_RULES_VERSION = 1

/** §5.1 :401's random 45–55 replaced by ONE fixed constant (647-B ruling (i) on
 * OPEN 4; §8 :641 forbids a new RNG stream). Inside Acquaintances. */
export const RELATIONSHIP_BASELINE = 50

/** The eight-member friendship ladder, lowest first (§5.3 :423-430). Partners is
 * the romance track, held ALONGSIDE the tier, never a rung (647-B on OPEN 8). */
export const RELATIONSHIP_TIERS: readonly RelationshipTier[] =
  ['Nemeses', 'Enemies', 'Strained', 'Acquaintances', 'Colleagues', 'Friends', 'CloseFriends', 'Inseparable'] as const

/** The lower edge of every band, mirroring the original's bands (§5.3): Nemeses
 * ≤ 10, Enemies 11–30, Strained 31–44, Acquaintances 45–55, Colleagues 56–60,
 * Friends 61–70, Close Friends 71–80, Inseparable ≥ 81. HYPOTHESES by name. */
export const RELATIONSHIP_TIER_FLOOR: Readonly<Record<RelationshipTier, number>> = {
  Nemeses: 0, Enemies: 11, Strained: 31, Acquaintances: 45, Colleagues: 56, Friends: 61, CloseFriends: 71, Inseparable: 81,
}

/** The five driver kinds B.5 mints (§5.4 :439-445). No conflict-record kind. */
export const RELATIONSHIP_DRIVER_KINDS: readonly RelationshipDriverKind[] =
  ['sharedProduction', 'repeatedCollaboration', 'sharedSuccess', 'sharedFailure', 'cancelledAfterFirstTake'] as const

/** §5.4 :439 proximity classes on one shared take: director–lead and lead–antagonist
 * HIGH, director–antagonist and lead–support MID, director–support and
 * antagonist–support LOW. */
export const RELATIONSHIP_PROXIMITY_HIGH = 6
export const RELATIONSHIP_PROXIMITY_MID = 4
export const RELATIONSHIP_PROXIMITY_LOW = 2
/** §5.4 :442 "increasing, capped": the repeat accelerator is
 * `min(sharedProductions − 1, RELATIONSHIP_REPEAT_CAP)`. */
export const RELATIONSHIP_REPEAT_CAP = 3
/** §5.4 :440-441 shared success / failure at release. The ONE pinned relation
 * (647-B ruling (ii) on OPEN 5): `RELATIONSHIP_FAILURE_DELTA > RELATIONSHIP_PROXIMITY_LOW`,
 * so a released flop nets a low-proximity pair below where it stood before the take. */
export const RELATIONSHIP_SUCCESS_DELTA = 5
export const RELATIONSHIP_FAILURE_DELTA = 4
/** §5.4 :445 "small". */
export const RELATIONSHIP_CANCEL_DELTA = 2
/** The release thresholds on `FilmResult.criticScore` (0..100, always present —
 * 647-B ruling on OPEN 9). Today they mirror the shipped critic bands
 * (`receptionVerdict.ts`: hit at 60, flop below 40) without being bound to them. */
export const RELATIONSHIP_SUCCESS_CRITIC_SCORE = 60
export const RELATIONSHIP_FAILURE_CRITIC_SCORE = 40
/** §5.5 :467 drift hypotheses: no drift inside the grace window, then a linear
 * return to the baseline over the return horizon, from either side. */
export const RELATIONSHIP_DRIFT_GRACE_WEEKS = 52
export const RELATIONSHIP_DRIFT_RETURN_WEEKS = 260
/** §5.5 :468 / plan (9): `recent` holds at most this many drivers; the oldest
 * folds OUT at write and the exact counters keep the count.
 * ponytail: fold-by-count only; the §5.5 :468 windowed 260-week compaction is
 * the upgrade path once PERF-010 measures the need. */
export const RELATIONSHIP_RECENT_CAP = 8

// ── the root ──────────────────────────────────────────────────────────────────

/**
 * LOUD, never silent: a live state MUST carry the V31 root. Treating a missing
 * root as "no relationships" would let a state one save version behind run live
 * verbs and quietly record nothing — exactly the fault `requirePromiseRoots`
 * refuses for the V29 roots, refused here the same way.
 */
export function requireRelationshipsRoot(state: GameState): void {
  if (state.relationships === undefined) {
    throw new Error('relationships: the Save V31 root is missing — migrate this state to V31 before acting on it')
  }
}

// ── value, drift and tier — pure, integer, no RNG (plan scope (3)) ───────────

const clamp = (value: number): number => Math.max(0, Math.min(100, value))
const rank = (tier: RelationshipTier): number => RELATIONSHIP_TIERS.indexOf(tier)
const canonicalPair = (x: string, y: string): readonly [string, string] => (x < y ? [x, y] : [y, x])
const pairKey = (a: string, b: string): string => `${a}\u0000${b}`

/** The value at `week`, drift materialized on read (§5.5 :467; §5.2 :413): the
 * stored value inside the grace window, else a linear return toward the baseline
 * from either side, complete at GRACE + RETURN and never past the baseline. */
export function currentCloseness(edge: Pick<RelationshipEdge, 'closeness' | 'lastEventWeek'>, week: number): number {
  const dormant = week - edge.lastEventWeek
  if (dormant <= RELATIONSHIP_DRIFT_GRACE_WEEKS) return edge.closeness
  const span = Math.min(dormant - RELATIONSHIP_DRIFT_GRACE_WEEKS, RELATIONSHIP_DRIFT_RETURN_WEEKS)
  return edge.closeness + Math.trunc((RELATIONSHIP_BASELINE - edge.closeness) * span / RELATIONSHIP_DRIFT_RETURN_WEEKS)
}

/** The value band by the named floors alone (no evidence condition). */
function bandOf(closeness: number): RelationshipTier {
  let band: RelationshipTier = 'Nemeses'
  for (const tier of RELATIONSHIP_TIERS) if (closeness >= RELATIONSHIP_TIER_FLOOR[tier]) band = tier
  return band
}

/** RULES 1: the band, under §5.3's evidence condition — Nemeses (:423) and Enemies
 * (:424) require a conflict record; B.5 mints none, so those bands read Strained
 * (:425 "a recent negative driver without a conflict record"). */
function tierOf(closeness: number): RelationshipTier {
  const band = bandOf(closeness)
  return band === 'Nemeses' || band === 'Enemies' ? 'Strained' : band
}

/** The tier at `week` under `RELATIONSHIP_RULES_VERSION`, a pure read. */
export function currentTier(edge: Pick<RelationshipEdge, 'closeness' | 'lastEventWeek'>, week: number): RelationshipTier {
  return tierOf(currentCloseness(edge, week))
}

/**
 * OPEN 1 (Q2, stays open): every delta passes through this ONE pure gain, which
 * returns it unchanged — growth at one base rate for every pair. A later Owner
 * choice replaces the body with a bounded factor from the public temperament
 * descriptor; no shape or version change.
 */
export function driverGain(state: GameState, a: string, b: string, delta: number): number {
  void state; void a; void b
  return delta
}

// ── the write (plan scope (3): materialize drift, apply, clamp, peak, fold) ──

/** The exact counter each kind folds into (§5.5 :468); the accelerator has none. */
function counted(edge: RelationshipEdge, kind: RelationshipDriverKind): RelationshipEdge {
  switch (kind) {
    case 'sharedProduction': return { ...edge, sharedProductions: edge.sharedProductions + 1 }
    case 'sharedSuccess': return { ...edge, sharedSuccesses: edge.sharedSuccesses + 1 }
    case 'sharedFailure': return { ...edge, sharedFailures: edge.sharedFailures + 1 }
    case 'cancelledAfterFirstTake': return { ...edge, sharedCancellations: edge.sharedCancellations + 1 }
    case 'repeatedCollaboration': return edge
  }
}

/** One driver applied to an existing edge: drift materialized first, then the
 * delta, clamped to [0, 100]; the anchor moves to `week`; the peak rises only on
 * a HIGHER tier; the driver appends and the oldest folds out past the cap (the
 * counters are the fold target — §5.5 :468). Spread-preserving. */
function writeEdge(edge: RelationshipEdge, week: number, driver: RelationshipDriver): RelationshipEdge {
  const closeness = clamp(currentCloseness(edge, week) + driver.delta)
  const tier = tierOf(closeness)
  const higher = rank(tier) > rank(edge.peakTier)
  return {
    ...counted(edge, driver.kind),
    closeness,
    lastEventWeek: week,
    peakTier: higher ? tier : edge.peakTier,
    peakTierWeek: higher ? week : edge.peakTierWeek,
    recent: [...edge.recent, driver].slice(-RELATIONSHIP_RECENT_CAP),
  }
}

/** A new edge from its first shared take: the baseline with the proximity delta
 * applied (drift materialized on a fresh baseline is the baseline itself). */
function newEdge(index: number, a: string, b: string, week: number, driver: RelationshipDriver): RelationshipEdge {
  const closeness = clamp(RELATIONSHIP_BASELINE + driver.delta)
  const tier = tierOf(closeness)
  return {
    edgeId: `relationship-edge-${String(index)}`,
    a, b, closeness,
    firstSharedWeek: week, lastEventWeek: week,
    sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0,
    peakTier: tier, peakTierWeek: week,
    recent: [driver],
  }
}

const hasDriver = (edge: RelationshipEdge, kind: RelationshipDriverKind, ref: string): boolean =>
  edge.recent.some((d) => d.kind === kind && d.ref === ref)

/** The six pairs of one take in the RECEIPT'S OWN SEAT ORDER (director–lead,
 * director–antagonist, director–support, lead–antagonist, lead–support,
 * antagonist–support; §5.4 :439 proximity classes) — the append order is the
 * seat order, never id or Map order; only the KEY compares ids. A person seated
 * twice on one take is refused loudly, never skipped. */
function seatPairs(seats: { directorId: string; cast: Record<CastSlot, string> }, ref: string): readonly { a: string; b: string; weight: number }[] {
  const { directorId: d } = seats
  const { lead: l, antagonist: n, support: s } = seats.cast
  if (new Set([d, l, n, s]).size !== 4) {
    throw new Error(`relationships: production "${ref}" seats one person twice; a pair needs two people`)
  }
  return [[d, l, RELATIONSHIP_PROXIMITY_HIGH], [d, n, RELATIONSHIP_PROXIMITY_MID], [d, s, RELATIONSHIP_PROXIMITY_LOW],
    [l, n, RELATIONSHIP_PROXIMITY_HIGH], [l, s, RELATIONSHIP_PROXIMITY_MID], [n, s, RELATIONSHIP_PROXIMITY_LOW]]
    .map(([x, y, weight]) => { const [a, b] = canonicalPair(x as string, y as string); return { a, b, weight: weight as number } })
}

/** Copy-on-write working set over the root: the array is copied once, edges are
 * replaced by index, and the state is rebuilt only if something moved. */
type Ledger = { edges: RelationshipEdge[]; index: Map<string, number>; changed: boolean }
function openLedger(state: GameState): Ledger {
  const edges = [...state.relationships]
  return { edges, index: new Map(edges.map((e, i) => [pairKey(e.a, e.b), i] as const)), changed: false }
}
function commitLedger(state: GameState, ledger: Ledger): GameState {
  return ledger.changed ? { ...state, relationships: ledger.edges } : state
}

/** A release or cancel driver for one recorded take (plan (2b)/(2c) with the
 * 657-B I2 precision): it never CREATES an edge, and applies to a pair's edge iff
 * the edge exists AND that take was counted by it (`take.week >= firstSharedWeek`)
 * — the invariant `sharedSuccesses + sharedFailures <= sharedProductions` holds by
 * construction. Idempotent by (edgeId, kind, productionId). */
function driveTake(state: GameState, ledger: Ledger, take: FirstTakeReceipt, kind: RelationshipDriverKind, delta: number, week: number): void {
  for (const pair of seatPairs(take, take.productionId)) {
    const i = ledger.index.get(pairKey(pair.a, pair.b))
    if (i === undefined) continue
    const edge = ledger.edges[i]!
    if (take.week < edge.firstSharedWeek) continue
    if (hasDriver(edge, kind, take.productionId)) continue
    ledger.edges[i] = writeEdge(edge, week, { kind, week, ref: take.productionId, delta: driverGain(state, pair.a, pair.b, delta) })
    ledger.changed = true
  }
}

// ── the ONE tail seam (plan scope (2)) ───────────────────────────────────────

/** This advance's delta: the same take entries the tail hands `appendFirstTakes`
 * and this advance's release results (the player's and every rival's). */
export type RelationshipDelta = {
  takes: readonly { studioId: string; production: Production }[]
  releases: readonly FilmResult[]
}

/**
 * Edge minting at the tick tail, between `appendFirstTakes` and
 * `advancePromisesWeek`, FROM THE DELTA (never a scan of a root). Guard order
 * copied from `appendFirstTakes`: an empty delta returns the state unchanged
 * BEFORE the root guard; then the loud root guard; then no industry → unchanged,
 * so the headless corpus and the roster-wall observatory stay byte-identical
 * apart from the empty root. Every driver is stamped `week` (the tail week, as
 * takes are — 647-B R1). Idempotent by (edgeId, kind, ref) over `recent`.
 */
export function advanceRelationshipsWeek(state: GameState, delta: RelationshipDelta, week: number): GameState {
  if (delta.takes.length === 0 && delta.releases.length === 0) return state
  requireRelationshipsRoot(state)
  if (state.hollywood === null) return state
  const ledger = openLedger(state)
  // (2a) shared production + repeated collaboration, from the entry's own seats.
  for (const { production } of delta.takes) {
    for (const pair of seatPairs(production, production.id)) {
      const gained = driverGain(state, pair.a, pair.b, pair.weight)
      const driver: RelationshipDriver = { kind: 'sharedProduction', week, ref: production.id, delta: gained }
      const i = ledger.index.get(pairKey(pair.a, pair.b))
      if (i === undefined) {
        ledger.index.set(pairKey(pair.a, pair.b), ledger.edges.length)
        ledger.edges.push(newEdge(ledger.edges.length, pair.a, pair.b, week, driver))
        ledger.changed = true
        continue
      }
      const edge = ledger.edges[i]!
      if (hasDriver(edge, 'sharedProduction', production.id)) continue
      let next = writeEdge(edge, week, driver)
      const accelerator = Math.min(next.sharedProductions - 1, RELATIONSHIP_REPEAT_CAP)
      if (accelerator > 0) {
        next = writeEdge(next, week, { kind: 'repeatedCollaboration', week, ref: production.id, delta: driverGain(state, pair.a, pair.b, accelerator) })
      }
      ledger.edges[i] = next
      ledger.changed = true
    }
  }
  // (2b) shared success / failure at release, joined to the recorded take by
  // productionId on `criticScore` alone; nothing between the two edges.
  for (const film of delta.releases) {
    const kind: RelationshipDriverKind | null = film.criticScore >= RELATIONSHIP_SUCCESS_CRITIC_SCORE ? 'sharedSuccess'
      : film.criticScore < RELATIONSHIP_FAILURE_CRITIC_SCORE ? 'sharedFailure' : null
    if (kind === null) continue
    const take = state.firstTakes.find((t) => t.productionId === film.productionId)
    if (take === undefined) continue // no recorded take: no seats to join, no edge (Q3)
    driveTake(state, ledger, take, kind, kind === 'sharedSuccess' ? RELATIONSHIP_SUCCESS_DELTA : -RELATIONSHIP_FAILURE_DELTA, week)
  }
  return commitLedger(state, ledger)
}

/**
 * (2c) The player cancel, synchronously beside `breakPromisesOnCancel`: fires iff
 * `state.firstTakes` holds a take for the picture — the exact complement of the
 * promise seam's early return — for that take's six pairs, stamped
 * `state.market.tick` at the action. A picture without a take is not shared work
 * and mints nothing (the SAME reference comes back). The law is one pure helper;
 * no rival cancel verb exists, so the reachable set is player-only.
 */
export function recordCancelledAfterFirstTake(state: GameState, studioId: string, cancelled: Production): GameState {
  const take = state.firstTakes.find((t) => t.productionId === cancelled.id)
  if (take === undefined) return state
  requireRelationshipsRoot(state)
  if (take.studioId !== studioId) {
    throw new Error(`relationships: the first take of "${cancelled.id}" belongs to ${take.studioId}, not the cancelling studio ${studioId}`)
  }
  const ledger = openLedger(state)
  driveTake(state, ledger, take, 'cancelledAfterFirstTake', -RELATIONSHIP_CANCEL_DELTA, state.market.tick)
  return commitLedger(state, ledger)
}

// ── reads (plan scope (5)-(7)) ───────────────────────────────────────────────

/** The D5 / reservation read: the subject's current tier with every counterpart
 * in `roster` at `week` (the roster itself is the caller's — `talentMarket.ts`
 * owns the employer-interval predicate). Order is immaterial to every consumer. */
export function tiersOnRoster(state: GameState, subject: string, roster: ReadonlySet<string>, week: number): readonly RelationshipTier[] {
  requireRelationshipsRoot(state)
  const tiers: RelationshipTier[] = []
  for (const edge of state.relationships) {
    const counterpart = edge.a === subject ? edge.b : edge.b === subject ? edge.a : null
    if (counterpart !== null && roster.has(counterpart)) tiers.push(currentTier(edge, week))
  }
  return tiers
}

export type PairChemistry = { tier: RelationshipTier | null; sign: -1 | 0 | 1; reasons: readonly string[] }

/** Kind → copy at read (the B.2 pattern); no number in any string. */
const DRIVER_COPY: Readonly<Record<RelationshipDriverKind, string>> = {
  sharedProduction: 'they have worked on a picture together',
  repeatedCollaboration: 'they have worked together more than once',
  sharedSuccess: 'a picture they shared was well received',
  sharedFailure: 'a picture they shared was poorly received',
  cancelledAfterFirstTake: 'a picture they shared was cancelled after its first take',
}

/**
 * §5.6 :476/:482 — the SHARED GENERALIZATION, exported read-only with NO consumer
 * in B.5 (the result owner's bound, formula and seam are a later slice; R17).
 * `null`/`0`/`[]` without an edge; `sign` +1 for Colleagues and above, 0 for
 * Acquaintances, −1 for Strained and below; reasons from the recent kinds and
 * the dormancy, none carrying a number.
 */
export function pairChemistry(state: GameState, x: string, y: string, week: number): PairChemistry {
  requireRelationshipsRoot(state)
  const [a, b] = canonicalPair(x, y)
  const edge = state.relationships.find((e) => e.a === a && e.b === b)
  if (edge === undefined) return { tier: null, sign: 0, reasons: [] }
  const tier = currentTier(edge, week)
  const sign = rank(tier) >= rank('Colleagues') ? 1 : tier === 'Acquaintances' ? 0 : -1
  const reasons = RELATIONSHIP_DRIVER_KINDS.filter((kind) => edge.recent.some((d) => d.kind === kind)).map((kind) => DRIVER_COPY[kind])
  if (week - edge.lastEventWeek > RELATIONSHIP_DRIFT_GRACE_WEEKS) reasons.push('they have not worked together lately')
  return { tier, sign, reasons }
}

// ── Save V31: the root validator and the downgrade projection (plan scope (10)) ──

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const EDGE_KEYS = ['edgeId', 'a', 'b', 'closeness', 'firstSharedWeek', 'lastEventWeek', 'sharedProductions', 'sharedSuccesses',
  'sharedFailures', 'sharedCancellations', 'peakTier', 'peakTierWeek', 'recent'] as const
const DRIVER_KEYS = ['kind', 'week', 'ref', 'delta'] as const

/**
 * The V31 root's own validator (the `validatePromiseRoots` model): array; each
 * row exact keys; the ordinal `edgeId`; `a < b`, both people of this world; no
 * duplicate pair; `closeness` an integer 0..100; every week inside the campaign's
 * own recording interval (the `recordedWeek` device — §8 :642 satisfied the way
 * B.1 satisfied it, no per-root anchor); `firstSharedWeek ≤ lastEventWeek`;
 * counters non-negative with `sharedSuccesses + sharedFailures ≤ sharedProductions`
 * and `sharedCancellations ≤ sharedProductions`; `peakTier` in the catalogue;
 * `recent` within the cap, each driver in the catalogue with `week ≤ lastEventWeek`.
 */
export function validateRelationshipsRoot(state: unknown): void {
  const fail = (message: string): never => {
    throw new Error(`validateSaveV31: ${message}`)
  }
  if (!isRecord(state)) return fail('state is not a plain object')
  const rows = state.relationships
  if (!Array.isArray(rows)) return fail('state.relationships is not an array')

  const record = (value: unknown, at: string): Record<string, unknown> => {
    if (!isRecord(value)) return fail(`${at} is not a plain object`)
    return value
  }
  const exact = (row: Record<string, unknown>, keys: readonly string[], at: string): void => {
    for (const key of keys) if (!Object.hasOwn(row, key)) fail(`${at}.${key} is missing`)
    for (const key of Object.keys(row)) if (!keys.includes(key)) fail(`${at}.${key} is not a field of this record`)
  }
  const text = (value: unknown, at: string): string => {
    if (typeof value !== 'string' || value.trim() === '') return fail(`${at} must be a non-empty string`)
    return value
  }
  const integer = (value: unknown, at: string): number => {
    if (typeof value !== 'number' || !Number.isSafeInteger(value)) return fail(`${at} must be an integer`)
    return value
  }
  const nonnegative = (value: unknown, at: string): number => {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) return fail(`${at} must be a non-negative integer`)
    return value
  }
  const currentWeek = nonnegative(record(state.market, 'state.market').tick, 'state.market.tick')
  const boundary = nonnegative(record(state.studioHistory, 'state.studioHistory').recordingStartedWeek,
    'state.studioHistory.recordingStartedWeek')
  const recordedWeek = (value: unknown, at: string): number => {
    const week = nonnegative(value, at)
    if (week < boundary || week > currentWeek) return fail(`${at} is outside this campaign's recording interval`)
    return week
  }
  const people = new Set((Array.isArray(state.talent) ? state.talent : []).filter(isRecord).map((person) => person.id))
  const personId = (value: unknown, at: string): string => {
    const id = text(value, at)
    if (!people.has(id)) return fail(`${at} does not name a person of this world`)
    return id
  }

  const seenPairs = new Set<string>()
  for (let i = 0; i < rows.length; i++) {
    const at = `state.relationships[${String(i)}]`
    const row = record(rows[i], at)
    exact(row, EDGE_KEYS, at)
    if (row.edgeId !== `relationship-edge-${String(i)}`) return fail(`${at}.edgeId is not this root's ordinal id`)
    const a = personId(row.a, `${at}.a`)
    const b = personId(row.b, `${at}.b`)
    if (!(a < b)) return fail(`${at} is not a canonical pair: a < b is required`)
    const key = pairKey(a, b)
    if (seenPairs.has(key)) return fail(`${at} records a second edge for the pair "${a}" and "${b}"`)
    seenPairs.add(key)
    const closeness = integer(row.closeness, `${at}.closeness`)
    if (closeness < 0 || closeness > 100) return fail(`${at}.closeness must be an integer from 0 to 100`)
    const first = recordedWeek(row.firstSharedWeek, `${at}.firstSharedWeek`)
    const last = recordedWeek(row.lastEventWeek, `${at}.lastEventWeek`)
    if (first > last) return fail(`${at}.firstSharedWeek is after lastEventWeek`)
    const productions = nonnegative(row.sharedProductions, `${at}.sharedProductions`)
    const successes = nonnegative(row.sharedSuccesses, `${at}.sharedSuccesses`)
    const failures = nonnegative(row.sharedFailures, `${at}.sharedFailures`)
    const cancellations = nonnegative(row.sharedCancellations, `${at}.sharedCancellations`)
    if (successes + failures > productions) return fail(`${at} counters are inconsistent: sharedSuccesses + sharedFailures exceeds sharedProductions`)
    if (cancellations > productions) return fail(`${at} counters are inconsistent: sharedCancellations exceeds sharedProductions`)
    if (!RELATIONSHIP_TIERS.includes(row.peakTier as RelationshipTier)) return fail(`${at}.peakTier is not a tier of the catalogue`)
    recordedWeek(row.peakTierWeek, `${at}.peakTierWeek`)
    const recent = row.recent
    if (!Array.isArray(recent)) return fail(`${at}.recent is not an array`)
    if (recent.length > RELATIONSHIP_RECENT_CAP) return fail(`${at}.recent holds more drivers than the cap`)
    for (let j = 0; j < recent.length; j++) {
      const d = `${at}.recent[${String(j)}]`
      const driver = record(recent[j], d)
      exact(driver, DRIVER_KEYS, d)
      if (!RELATIONSHIP_DRIVER_KINDS.includes(driver.kind as RelationshipDriverKind)) return fail(`${d}.kind is not a driver kind of the catalogue`)
      const week = recordedWeek(driver.week, `${d}.week`)
      if (week > last) return fail(`${d}.week is after lastEventWeek`)
      text(driver.ref, `${d}.ref`)
      integer(driver.delta, `${d}.delta`)
    }
  }
}

/**
 * The POSITIVE projection to every version before V31 (the `projectPromisesPreV29`
 * precedent): a world that holds ANY edge is REFUSED rather than flattened — an
 * envelope that quietly dropped a friendship would misreport a campaign that
 * formed one. Lossless exactly when the root is empty.
 */
export function projectRelationshipsPreV31(state: unknown): void {
  if (!isRecord(state)) return
  const rows = state.relationships
  if (Array.isArray(rows) && rows.length > 0) {
    throw new Error(`frozen save projection cannot discard authoritative V31 relationships (${String(rows.length)} held)`)
  }
}
