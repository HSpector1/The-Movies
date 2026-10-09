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

import { castingSessionForProject } from './castingSessions.js'
import { SLOT_ORDER } from './tuning.js'
import type {
  CastSlot, FilmResult, FirstTakeReceipt, GameState, Production, RelationshipCompetition, RelationshipDriver,
  RelationshipDriverKind, RelationshipEdge, RelationshipTier, RomanceTrack,
} from './types.js'

// ── the versioned rule and the named HYPOTHESES (plan :761; none is settled law) ──

/** The tier rule revision (code-only: the chooser receipt carries no rules
 * version, the B.1 precedent). 1 = value bands with the named floors PLUS the
 * §5.3 evidence condition: Nemeses/Enemies need a conflict record, and B.5
 * mints no conflict-record kind, so those bands READ Strained. 2 (D-1312-1 and
 * 1342-O item 8; 1347-A §2.2 as adopted by 1347-F) = the same bands and floors;
 * the conflict record is `hasConflictEvidence`, so a value in the Nemeses/Enemies
 * bands reads that band with evidence and Strained without it. Evidence never
 * moves closeness, and the tier reads CURRENT closeness, never `peakTier`.
 * No persisted value carries or is validated against this version: `peakTier`
 * is checked for catalogue membership only (`validateRelationshipsRoot`), so a
 * rules-1 save reads under rules 2 with no era split (record 1348-E). */
export const RELATIONSHIP_RULES_VERSION = 2

/** D-1312-1 (1340-O): "initially three distinct recorded casting competitions
 * between the same pair". One competition is one `sharedCompetitions` increment,
 * under `recordCastingCompetition`'s per-production de-duplication. Owner-named
 * initial value; no new counter, driver kind or delta at the threshold. */
export const RELATIONSHIP_CONFLICT_COMPETITIONS = 3

/** HIS-014 (1340-O): Professional Rivals needs "at least two distinct recorded
 * competitions between the pair for the same casting slot". An Owner definition, not
 * tuning (1347-A §3); a label only, read from the `competitions` log. */
export const RIVALS_SAME_SLOT_COMPETITIONS = 2

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

/** The five driver kinds B.5 minted (§5.4 :439-445): the FROZEN catalogue every
 * Save31..Save41 reader validates against, never widened. */
export const RELATIONSHIP_DRIVER_KINDS_V31: readonly RelationshipDriverKind[] =
  ['sharedProduction', 'repeatedCollaboration', 'sharedSuccess', 'sharedFailure', 'cancelledAfterFirstTake'] as const

/** The live catalogue: B.5's five plus the casting competition and its accelerator
 * (§5.4 rows 5-6; 1313-A/F, Save42). No conflict-record kind. */
export const RELATIONSHIP_DRIVER_KINDS: readonly RelationshipDriverKind[] =
  [...RELATIONSHIP_DRIVER_KINDS_V31, 'castingCompetitionLost', 'repeatedCompetition'] as const

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
/** PROVISIONAL CANDIDATE TUNING, 4 → 5, not settled balance: a capped repeat cycle
 * nets `RELATIONSHIP_PROXIMITY_LOW + RELATIONSHIP_REPEAT_CAP − RELATIONSHIP_FAILURE_DELTA`,
 * so at 4 a repeatedly-flopping low-proximity pair still GAINED a point per picture and
 * could never reach the Strained band; at 5 the cycle breaks even and the band opens.
 * The pinned relation above still holds (5 > 2). Record 683 (the Owner ruling on record
 * 680, finding 1 option (b)), measured in 679 / 681 / 682. Driver constant, not part of
 * `RELATIONSHIP_RULES_VERSION`: it applies prospectively at write time and no stored
 * `delta: -4` is restamped. */
export const RELATIONSHIP_FAILURE_DELTA = 5
/** §5.4 :445 "small". */
export const RELATIONSHIP_CANCEL_DELTA = 2
/** §5.4 row 5, "the principal source of negative relationships" (1313-A): between
 * the cancel driver and the failure driver. HYPOTHESIS by name. */
export const RELATIONSHIP_COMPETITION_DELTA = 3
/** §5.4 row 6 "small", the competition mirror of the repeat accelerator: the
 * accelerator is `min(sharedCompetitions − 1, RELATIONSHIP_COMPETITION_REPEAT_CAP)`. */
export const RELATIONSHIP_COMPETITION_REPEAT_CAP = 2
/** The release thresholds on `FilmResult.criticScore` (0..100, always present —
 * 647-B ruling on OPEN 9). Today they mirror the shipped critic bands
 * (`receptionVerdict.ts`: hit at 60, flop below 40) without being bound to them. */
export const RELATIONSHIP_SUCCESS_CRITIC_SCORE = 60
export const RELATIONSHIP_FAILURE_CRITIC_SCORE = 40
/** §5.5 :467 drift hypotheses: no drift inside the grace window, then a linear
 * return to the baseline over the return horizon, from either side. */
export const RELATIONSHIP_DRIFT_GRACE_WEEKS = 52
export const RELATIONSHIP_DRIFT_RETURN_WEEKS = 260
/** D-1312-2 romance track (1347-A §3): PROVISIONAL TUNING by name; the Owner delegated
 * the numbers. Formation at 75 takes about six high-proximity pictures with successes
 * after Friends, and the exit at 40 sits well below it so a bond does not flicker. */
export const ROMANCE_FORMATION_THRESHOLD = 75
export const ROMANCE_EXIT_THRESHOLD = 40
/** The main driver (§5.4a :456): a high-proximity shared take from the second shared production. */
export const ROMANCE_PROXIMITY_GAIN = 10
export const ROMANCE_SUCCESS_GAIN = 5
/** Separation: the value holds for the grace window, then falls linearly to 0 over the
 * decay window, the `currentCloseness` shape. A bond at 75 ends 229 weeks after the last
 * shared picture; a bond at 100 after 263. */
export const ROMANCE_GRACE_WEEKS = 104
export const ROMANCE_DECAY_WEEKS = 260
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
 * from either side, complete at GRACE + RETURN and never past the baseline.
 * D-1312-2 (1358-F §3): Partners are exempt while their bond is open; after the ending,
 * recorded or derived on read, dormancy counts from max(lastEventWeek, the ending). */
export function currentCloseness(edge: Pick<RelationshipEdge, 'closeness' | 'lastEventWeek' | 'romance'>, week: number): number {
  const ending = romanceEndWeek(edge.romance)
  if (ending !== null && week < ending) return edge.closeness
  const dormant = week - Math.max(edge.lastEventWeek, ending ?? edge.lastEventWeek)
  if (dormant <= RELATIONSHIP_DRIFT_GRACE_WEEKS) return edge.closeness
  const span = Math.min(dormant - RELATIONSHIP_DRIFT_GRACE_WEEKS, RELATIONSHIP_DRIFT_RETURN_WEEKS)
  return edge.closeness + Math.trunc((RELATIONSHIP_BASELINE - edge.closeness) * span / RELATIONSHIP_DRIFT_RETURN_WEEKS)
}

/** The romance value at `week` (1347-A §2.3): the stored value inside the grace window,
 * else a linear fall to 0 over the decay window, `currentCloseness`'s shape with 0 as
 * its target. */
export function currentRomanceValue(romance: RomanceTrack, week: number): number {
  const dormant = week - romance.anchorWeek
  if (dormant <= ROMANCE_GRACE_WEEKS) return romance.value
  const span = Math.min(dormant - ROMANCE_GRACE_WEEKS, ROMANCE_DECAY_WEEKS)
  return romance.value - Math.trunc(romance.value * span / ROMANCE_DECAY_WEEKS)
}

/** The first week `currentRomanceValue` reads below ROMANCE_EXIT_THRESHOLD, in closed
 * form (record 1358-E checks it against the week-by-week read for every value 0..100);
 * a stored value already below the threshold ends at its anchor. */
function derivedEndWeek(romance: RomanceTrack): number {
  if (romance.value < ROMANCE_EXIT_THRESHOLD) return romance.anchorWeek
  return romance.anchorWeek + ROMANCE_GRACE_WEEKS
    + Math.ceil(ROMANCE_DECAY_WEEKS * (romance.value - ROMANCE_EXIT_THRESHOLD + 1) / romance.value)
}

/** The last bond's ending week, recorded or derived on read; null when no bond ever
 * formed. Only the last bond can be open, and `value`/`anchorWeek` describe it. A staged
 * edge built without the field reads as `romance: null`. */
export function romanceEndWeek(romance: RomanceTrack | null): number | null {
  const bond = romance?.bonds.at(-1)
  if (romance == null || bond === undefined) return null
  return bond.endedWeek ?? derivedEndWeek(romance)
}

/** The pair's bond at `week` (1347-A §2.3): 'partners' before the last bond's ending,
 * 'ended' from it on, null when none ever formed. It reads the track and the week only,
 * so a studio change, a retirement or a fall in the friendship tier ends nothing. */
export function romanceStatus(edge: Pick<RelationshipEdge, 'romance'>, week: number): 'partners' | 'ended' | null {
  const ending = romanceEndWeek(edge.romance)
  return ending === null ? null : week < ending ? 'partners' : 'ended'
}

/** The value band by the named floors alone (no evidence condition). */
function bandOf(closeness: number): RelationshipTier {
  let band: RelationshipTier = 'Nemeses'
  for (const tier of RELATIONSHIP_TIERS) if (closeness >= RELATIONSHIP_TIER_FLOOR[tier]) band = tier
  return band
}

/** D-1312-1: the pair's conflict record — evidence only, never a tier or a value
 * by itself (1342-O item 8). Kept for good: recovery and drift leave it intact. */
export function hasConflictEvidence(edge: Pick<RelationshipEdge, 'sharedCompetitions'>): boolean {
  return edge.sharedCompetitions >= RELATIONSHIP_CONFLICT_COMPETITIONS
}

/** RULES 2: the band, under §5.3's evidence condition — Nemeses (:423) and Enemies
 * (:424) require a conflict record; without one those bands read Strained (:425
 * "a recent negative driver without a conflict record"). */
function tierOf(closeness: number, evidence: boolean): RelationshipTier {
  const band = bandOf(closeness)
  return (band === 'Nemeses' || band === 'Enemies') && !evidence ? 'Strained' : band
}

/** The tier at `week` under `RELATIONSHIP_RULES_VERSION`, a pure read. */
export function currentTier(edge: Pick<RelationshipEdge, 'closeness' | 'lastEventWeek' | 'sharedCompetitions' | 'romance'>, week: number): RelationshipTier {
  return tierOf(currentCloseness(edge, week), hasConflictEvidence(edge))
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
    case 'castingCompetitionLost': return { ...edge, sharedCompetitions: edge.sharedCompetitions + 1 }
    case 'repeatedCollaboration':
    case 'repeatedCompetition': return edge
  }
}

/** 1347-A §2.3: a derived romance ending is written into `endedWeek` once, at the next
 * write that touches the edge (or either person's formation check), before any new
 * driver applies. It writes no driver and moves no closeness, counter, peak or `recent`. */
function recordEnding(edge: RelationshipEdge, week: number): RelationshipEdge {
  const romance = edge.romance
  const bond = romance?.bonds.at(-1)
  if (romance == null || bond === undefined || bond.endedWeek !== null) return edge
  const endedWeek = derivedEndWeek(romance)
  if (endedWeek > week) return edge
  return { ...edge, romance: { ...romance, bonds: [...romance.bonds.slice(0, -1), { ...bond, endedWeek }] } }
}

/** One driver applied to an existing edge: any derived romance ending recorded,
 * drift materialized, then the delta, clamped to [0, 100]; the anchor moves to `week`;
 * the peak rises only on a HIGHER tier; the driver appends and the oldest folds out
 * past the cap (the counters are the fold target — §5.5 :468). Spread-preserving. */
function writeEdge(edge: RelationshipEdge, week: number, driver: RelationshipDriver): RelationshipEdge {
  const next = counted(recordEnding(edge, week), driver.kind)
  const closeness = clamp(currentCloseness(next, week) + driver.delta)
  const tier = tierOf(closeness, hasConflictEvidence(next))
  const higher = rank(tier) > rank(edge.peakTier)
  return {
    ...next,
    closeness,
    lastEventWeek: week,
    peakTier: higher ? tier : edge.peakTier,
    peakTierWeek: higher ? week : edge.peakTierWeek,
    recent: [...edge.recent, driver].slice(-RELATIONSHIP_RECENT_CAP),
  }
}

/** A new edge from its first shared take, or from a first lost casting competition
 * (1313-F note 5: no shared production yet): the baseline with the driver's delta
 * applied (drift materialized on a fresh baseline is the baseline itself). */
function newEdge(index: number, a: string, b: string, week: number, driver: RelationshipDriver): RelationshipEdge {
  const closeness = clamp(RELATIONSHIP_BASELINE + driver.delta)
  const competition = driver.kind === 'castingCompetitionLost'
  const sharedCompetitions = competition ? 1 : 0
  const tier = tierOf(closeness, hasConflictEvidence({ sharedCompetitions }))
  return {
    edgeId: `relationship-edge-${String(index)}`,
    a, b, closeness,
    firstSharedWeek: week, lastEventWeek: week,
    sharedProductions: competition ? 0 : 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0,
    sharedCompetitions,
    peakTier: tier, peakTierWeek: week,
    recent: [driver],
    competitions: [],
    romance: null,
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
    if (kind === 'sharedSuccess') writeRomance(ledger, i, week, ROMANCE_SUCCESS_GAIN, false)
  }
}

/** The formation check of 1347-A §2.3 for edge `i`: does either person hold an open
 * bond with anyone else at `week`? It records every third-party ending it reads, so a
 * bond that already ended on read neither blocks nor stays open. */
function thirdPartyBond(ledger: Ledger, i: number, week: number): boolean {
  const { a, b } = ledger.edges[i]!
  let open = false
  for (let j = 0; j < ledger.edges.length; j++) {
    const other = ledger.edges[j]!
    if (j === i || other.romance == null || ![a, b].some((person) => person === other.a || person === other.b)) continue
    const recorded = recordEnding(other, week)
    if (recorded !== other) {
      ledger.edges[j] = recorded
      ledger.changed = true
    }
    if (romanceStatus(recorded, week) === 'partners') open = true
  }
  return open
}

/**
 * One romance write on edge `i` at the tick seam, after that write's friendship drivers
 * (1347-A §2.3; 1358-F §1-§2; 1358-F2 item 1): the derived ending recorded first, then
 * the value read at `week`, the gain added and clamped to 0..100, and the anchor moved to
 * `week`. A gain needs the pair at Friends or above, read on the edge as this write left
 * it, and no open bond for either person with anyone but each other: the pair's own bond
 * never blocks it (Reading B). A gain that reaches ROMANCE_FORMATION_THRESHOLD while the
 * pair holds no open bond forms one, dated `week`. A shared take always writes, since any
 * shared take resets separation; a success writes only when it gains.
 */
function writeRomance(ledger: Ledger, i: number, week: number, gain: number, take: boolean): void {
  const edge = recordEnding(ledger.edges[i]!, week)
  ledger.edges[i] = edge
  const gains = gain > 0 && rank(currentTier(edge, week)) >= rank('Friends') && !thirdPartyBond(ledger, i, week)
  if (!gains && (!take || edge.romance == null)) return
  const track: RomanceTrack = edge.romance ?? { value: 0, anchorWeek: week, bonds: [] }
  const value = clamp(currentRomanceValue(track, week) + (gains ? gain : 0))
  const forms = gains && value >= ROMANCE_FORMATION_THRESHOLD && track.bonds.at(-1)?.endedWeek !== null
  const bonds = forms ? [...track.bonds, { formedWeek: week, endedWeek: null }] : track.bonds
  ledger.edges[i] = { ...edge, romance: { value, anchorWeek: week, bonds } }
  ledger.changed = true
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
 * takes are — 647-B R1). Idempotent by (edgeId, kind, ref) over `recent`. The
 * romance track grows, forms and records its ending here too, from the same delta
 * (1358-F §2): see `writeRomance`.
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
      // D-1312-2: from the pair's second shared production, a high-proximity take gains.
      const proximity = pair.weight === RELATIONSHIP_PROXIMITY_HIGH && next.sharedProductions >= 2
      writeRomance(ledger, i, week, proximity ? ROMANCE_PROXIMITY_GAIN : 0, true)
    }
  }
  // (2b) shared success / failure at release, joined to the recorded take by
  // productionId on `criticScore` alone; nothing between the two edges; a success
  // also gains on the romance track.
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

/**
 * 1313-A/F: the casting competition, synchronously inside `applyGreenlight` once a
 * script-project production is admitted (1312-F note 3; the `applyCancel` precedent
 * for the studio guard). For each cast slot whose seated person is one of that
 * slot's two auditioned candidates, the pair (seated person, the slot's other
 * candidate); a slot filled from outside its slate names no pair. Pairs are
 * canonical and de-duplicated, so a pair contesting two slots of one production
 * records ONE competition (1313-F amendment 2). Each pair: `castingCompetitionLost`
 * (ref = the production id, stamped `state.market.tick`), then from its second
 * competition the capped `repeatedCompetition` accelerator, and one `competitions`
 * row `{week, productionId, slots}` with the slots it contested in slot order (Save44,
 * 1347-A §2.1): the row is appended exactly where the counter counts, so the log never
 * outgrows `sharedCompetitions`. A project without a complete session mints nothing
 * (the SAME reference comes back). No RNG. Rivals hold no casting session, so the
 * reachable set is player-only (1312-F amendment 1).
 */
export function recordCastingCompetition(state: GameState, studioId: string, production: Production, projectId: string): GameState {
  const session = castingSessionForProject(state.castingSessions, projectId)
  if (session === undefined || session.status !== 'complete') return state
  requireRelationshipsRoot(state)
  if (studioId !== state.hollywood?.playerStudioId) {
    throw new Error(`relationships: casting session "${session.id}" belongs to the player studio, not ${studioId}`)
  }
  const pairs = new Map<string, { a: string; b: string; slots: CastSlot[] }>() // first-contest order
  for (const slot of SLOT_ORDER) {
    const seated = production.cast[slot]
    const [x, y] = session.slate[slot]
    const other = seated === x ? y : seated === y ? x : null
    if (other === null) continue
    const [a, b] = canonicalPair(seated, other)
    const pair = pairs.get(pairKey(a, b))
    if (pair === undefined) pairs.set(pairKey(a, b), { a, b, slots: [slot] })
    else pair.slots.push(slot)
  }
  if (pairs.size === 0) return state
  const week = state.market.tick
  const ledger = openLedger(state)
  for (const { a, b, slots } of pairs.values()) {
    const driver: RelationshipDriver = { kind: 'castingCompetitionLost', week, ref: production.id,
      delta: driverGain(state, a, b, -RELATIONSHIP_COMPETITION_DELTA) }
    const row: RelationshipCompetition = { week, productionId: production.id, slots }
    const i = ledger.index.get(pairKey(a, b))
    if (i === undefined) {
      ledger.index.set(pairKey(a, b), ledger.edges.length)
      ledger.edges.push({ ...newEdge(ledger.edges.length, a, b, week, driver), competitions: [row] })
      ledger.changed = true
      continue
    }
    const edge = ledger.edges[i]!
    if (hasDriver(edge, 'castingCompetitionLost', production.id)) continue
    let next = writeEdge(edge, week, driver)
    const accelerator = Math.min(next.sharedCompetitions - 1, RELATIONSHIP_COMPETITION_REPEAT_CAP)
    if (accelerator > 0) {
      next = writeEdge(next, week, { kind: 'repeatedCompetition', week, ref: production.id, delta: driverGain(state, a, b, -accelerator) })
    }
    ledger.edges[i] = { ...next, competitions: [...next.competitions, row] }
    ledger.changed = true
  }
  return commitLedger(state, ledger)
}

// ── reads (plan scope (5)-(7)) ───────────────────────────────────────────────

/** One roster counterpart's tie for D5: the current tier, and whether the pair are Partners. */
export type RosterTie = { tier: RelationshipTier; partners: boolean }

/** The D5 / reservation read: the subject's current tie with every counterpart in
 * `roster` at `week` (the roster itself is the caller's — `talentMarket.ts` owns the
 * employer-interval predicate). Order is immaterial to every consumer. */
export function rosterTies(state: GameState, subject: string, roster: ReadonlySet<string>, week: number): readonly RosterTie[] {
  requireRelationshipsRoot(state)
  const ties: RosterTie[] = []
  for (const edge of state.relationships) {
    const counterpart = edge.a === subject ? edge.b : edge.b === subject ? edge.a : null
    if (counterpart !== null && roster.has(counterpart)) ties.push({ tier: currentTier(edge, week), partners: romanceStatus(edge, week) === 'partners' })
  }
  return ties
}

/** `rosterTies`, tiers only. */
export function tiersOnRoster(state: GameState, subject: string, roster: ReadonlySet<string>, week: number): readonly RelationshipTier[] {
  return rosterTies(state, subject, roster, week).map((tie) => tie.tier)
}

/**
 * 1348-F2/F3: the D5 settlement reason, keyed by the WINNER's own relationships band
 * (`talentMarket.ts` `bandsFor`: 2 close ties here, 1 none, 0 enemies here). The
 * sentence class of the other descriptor reasons: ordering-only, naming no person,
 * tier or number (P14B.5 (5) candidate wording). `chooseProposal` names a
 * descriptor only where the winner stands strictly above every other proposal, so
 * a band-1 winner only ever beats band-0 rosters.
 */
export function relationshipsReasonSentence(band: 0 | 1 | 2): string {
  if (band === 2) return "their roster holds this person's close ties"
  // Band 0 is the floor of {0, 1, 2}: it can never be a decisive winner's band, so
  // it is unreachable through `chooseProposal` and shares band 1's sentence rather
  // than inventing a third (1348-F3).
  return 'every other offer comes from a roster holding someone this person is at odds with'
}

export type PairChemistry = { tier: RelationshipTier | null; sign: -1 | 0 | 1; reasons: readonly string[] }

/** Kind → copy at read (the B.2 pattern); no number in any string. */
const DRIVER_COPY: Readonly<Record<RelationshipDriverKind, string>> = {
  sharedProduction: 'they have worked on a picture together',
  repeatedCollaboration: 'they have worked together more than once',
  sharedSuccess: 'a picture they shared was well received',
  sharedFailure: 'a picture they shared was poorly received',
  cancelledAfterFirstTake: 'a picture they shared was cancelled after its first take',
  castingCompetitionLost: 'competed for the same role',
  repeatedCompetition: 'competed again',
}

/**
 * §5.6 :476/:482 — the SHARED GENERALIZATION, exported read-only with NO consumer
 * in B.5 (the result owner's bound, formula and seam are a later slice; R17).
 * `null`/`0`/`[]` without an edge; `sign` +1 for Colleagues and above, 0 for
 * Acquaintances, −1 for Strained and below; reasons from the recent kinds and
 * the dormancy, none carrying a number. D-1312-2 (1347-A §2.3, §6 item 3): Partners
 * carry Inseparable's +1 at Strained and above, add one reason, and read −1 at
 * Enemies or Nemeses, where current hostility governs.
 */
export function pairChemistry(state: GameState, x: string, y: string, week: number): PairChemistry {
  requireRelationshipsRoot(state)
  const [a, b] = canonicalPair(x, y)
  const edge = state.relationships.find((e) => e.a === a && e.b === b)
  if (edge === undefined) return { tier: null, sign: 0, reasons: [] }
  const tier = currentTier(edge, week)
  const partners = romanceStatus(edge, week) === 'partners'
  const sign = rank(tier) >= rank('Colleagues') || (partners && rank(tier) >= rank('Strained')) ? 1 : tier === 'Acquaintances' ? 0 : -1
  const reasons = RELATIONSHIP_DRIVER_KINDS.filter((kind) => edge.recent.some((d) => d.kind === kind)).map((kind) => DRIVER_COPY[kind])
  if (partners) reasons.push('they are partners')
  if (week - edge.lastEventWeek > RELATIONSHIP_DRIFT_GRACE_WEEKS) {
    reasons.push(edge.sharedProductions === 0 ? 'they have never worked together' : 'they have not worked together lately')
  }
  return { tier, sign, reasons }
}

// ── Save V31: the root validator and the downgrade projection (plan scope (10)) ──

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const EDGE_KEYS = ['edgeId', 'a', 'b', 'closeness', 'firstSharedWeek', 'lastEventWeek', 'sharedProductions', 'sharedSuccesses',
  'sharedFailures', 'sharedCancellations', 'peakTier', 'peakTierWeek', 'recent'] as const
const EDGE_KEYS_V42 = [...EDGE_KEYS, 'sharedCompetitions'] as const
const EDGE_KEYS_V44 = [...EDGE_KEYS_V42, 'competitions', 'romance'] as const
const DRIVER_KEYS = ['kind', 'week', 'ref', 'delta'] as const
const COMPETITION_KEYS = ['week', 'productionId', 'slots'] as const
const ROMANCE_KEYS = ['value', 'anchorWeek', 'bonds'] as const
const BOND_KEYS = ['formedWeek', 'endedWeek'] as const

/**
 * The V31 root's own validator (the `validatePromiseRoots` model): array; each
 * row exact keys; the ordinal `edgeId`; `a < b`, both people of this world; no
 * duplicate pair; `closeness` an integer 0..100; every week inside the campaign's
 * own recording interval (the `recordedWeek` device — §8 :642 satisfied the way
 * B.1 satisfied it, no per-root anchor); `firstSharedWeek ≤ lastEventWeek`;
 * counters non-negative with `sharedSuccesses + sharedFailures ≤ sharedProductions`
 * and `sharedCancellations ≤ sharedProductions`; `peakTier` in the catalogue;
 * `recent` within the cap, each driver in the catalogue with `week ≤ lastEventWeek`.
 * `era` 31 (every frozen Save31..Save41 reader) is exactly that law with the frozen
 * five-kind catalogue; `era` 42 adds the exact `sharedCompetitions` counter and the
 * two casting kinds (1313-A §3, 1313-F note 8); `era` 44 adds the `competitions` log and
 * the `romance` track (1347-A §4). The log: weeks in order, equal weeks allowed (two
 * productions can contest in one week, the parent's reading of "ascending"), distinct
 * production refs, a non-empty subset of the cast slots in slot order, and no more rows
 * than `sharedCompetitions`. Romance: an integer value 0..100 and bonds in order, only the
 * last of them open, an open bond formed at or before the track's `anchorWeek`, and no
 * person holding open bonds on two edges (1358-F8 ruling 2: no engine route writes either
 * shape, so a save holding one is forged). Every week inside the recording interval, as above.
 */
export function validateRelationshipsRoot(state: unknown, era: 31 | 42 | 44 = 31): void {
  const fail = (message: string): never => {
    throw new Error(`validateSaveV${String(era)}: ${message}`)
  }
  const catalogue = era === 31 ? RELATIONSHIP_DRIVER_KINDS_V31 : RELATIONSHIP_DRIVER_KINDS
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
  const openBonds = new Map<string, string>() // era 44: person -> the edge holding their open bond
  for (let i = 0; i < rows.length; i++) {
    const at = `state.relationships[${String(i)}]`
    const row = record(rows[i], at)
    exact(row, era === 44 ? EDGE_KEYS_V44 : era === 42 ? EDGE_KEYS_V42 : EDGE_KEYS, at)
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
    const competitions = era === 31 ? 0 : nonnegative(row.sharedCompetitions, `${at}.sharedCompetitions`)
    if (!RELATIONSHIP_TIERS.includes(row.peakTier as RelationshipTier)) return fail(`${at}.peakTier is not a tier of the catalogue`)
    recordedWeek(row.peakTierWeek, `${at}.peakTierWeek`)
    const recent = row.recent
    if (!Array.isArray(recent)) return fail(`${at}.recent is not an array`)
    if (recent.length > RELATIONSHIP_RECENT_CAP) return fail(`${at}.recent holds more drivers than the cap`)
    for (let j = 0; j < recent.length; j++) {
      const d = `${at}.recent[${String(j)}]`
      const driver = record(recent[j], d)
      exact(driver, DRIVER_KEYS, d)
      if (!catalogue.includes(driver.kind as RelationshipDriverKind)) return fail(`${d}.kind is not a driver kind of the catalogue`)
      const week = recordedWeek(driver.week, `${d}.week`)
      if (week > last) return fail(`${d}.week is after lastEventWeek`)
      text(driver.ref, `${d}.ref`)
      integer(driver.delta, `${d}.delta`)
    }
    if (era !== 44) continue
    const log = row.competitions
    if (!Array.isArray(log)) return fail(`${at}.competitions is not an array`)
    if (log.length > competitions) return fail(`${at}.competitions holds more rows than sharedCompetitions`)
    const refs = new Set<string>()
    let previousWeek = boundary
    for (let j = 0; j < log.length; j++) {
      const c = `${at}.competitions[${String(j)}]`
      const entry = record(log[j], c)
      exact(entry, COMPETITION_KEYS, c)
      const week = recordedWeek(entry.week, `${c}.week`)
      if (week < previousWeek) return fail(`${c}.week is before the previous row's week: the log must be in week order`)
      previousWeek = week
      const ref = text(entry.productionId, `${c}.productionId`)
      if (refs.has(ref)) return fail(`${c}.productionId repeats an earlier row's production`)
      refs.add(ref)
      const slots = entry.slots
      if (!Array.isArray(slots) || slots.length === 0) return fail(`${c}.slots must be a non-empty array of cast slots`)
      let previousSlot = -1
      for (const slot of slots) {
        const order = SLOT_ORDER.indexOf(slot as CastSlot)
        if (order <= previousSlot) return fail(`${c}.slots must name distinct cast slots in slot order (lead, antagonist, support)`)
        previousSlot = order
      }
    }
    if (row.romance === null) continue
    const r = `${at}.romance`
    const romance = record(row.romance, r)
    exact(romance, ROMANCE_KEYS, r)
    const value = integer(romance.value, `${r}.value`)
    if (value < 0 || value > 100) return fail(`${r}.value must be an integer from 0 to 100`)
    const anchor = recordedWeek(romance.anchorWeek, `${r}.anchorWeek`)
    const bonds = romance.bonds
    if (!Array.isArray(bonds)) return fail(`${r}.bonds is not an array`)
    let previousEnd = boundary
    let open = false
    for (let j = 0; j < bonds.length; j++) {
      const b = `${r}.bonds[${String(j)}]`
      const bond = record(bonds[j], b)
      exact(bond, BOND_KEYS, b)
      const formed = recordedWeek(bond.formedWeek, `${b}.formedWeek`)
      if (formed < previousEnd) return fail(`${b} is out of order: it forms before the previous bond ended`)
      if (bond.endedWeek === null) {
        if (j !== bonds.length - 1) return fail(`${b} is open, but only the last bond may be open`)
        // Formation anchors the track at its own week and every later write moves the anchor forward.
        if (formed > anchor) return fail(`${b} is open but forms after ${r}.anchorWeek: an open bond forms at or before the track's anchor`)
        open = true
        continue
      }
      previousEnd = recordedWeek(bond.endedWeek, `${b}.endedWeek`)
      if (previousEnd < formed) return fail(`${b}.endedWeek is before its formedWeek`)
    }
    if (!open) continue
    // The formation check records every third-party ending before a bond forms (1347-A §2.3).
    const edgeId = `relationship-edge-${String(i)}`
    for (const person of [a, b]) {
      const held = openBonds.get(person)
      if (held !== undefined) return fail(`${r}: ${person} holds an open romance bond on ${held} and on ${edgeId}; a person holds at most one`)
      openBonds.set(person, edgeId)
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

/**
 * Save42 → the era-31 edge every frozen reader knows (1313-A §3): `sharedCompetitions`
 * dropped and the two casting kinds removed from `recent` (and the Save44 fields, when the
 * live state is handed down directly). `validateSaveV42` hands the frozen V41 chain this
 * projection after validating its own root at era 42; the downgrade calls it only after
 * `assertRelationshipsAtV31` has refused real history.
 */
export function relationshipsAtV31(rows: readonly RelationshipEdge[]): Record<string, unknown>[] {
  return rows.map(({ sharedCompetitions: _competitions, competitions: _log, romance: _romance, ...edge }) =>
    ({ ...edge, recent: edge.recent.filter((d) => RELATIONSHIP_DRIVER_KINDS_V31.includes(d.kind)) }))
}

/** Save44 → the era-42 edge the V43 chain knows (1347-A §4): `competitions` and `romance`
 * dropped. `validateSaveV44` hands the frozen V43 chain this projection after validating
 * its own root at era 44; the downgrade calls it only after refusing real history. */
export function relationshipsAtV42(rows: readonly RelationshipEdge[]): Record<string, unknown>[] {
  return rows.map(({ competitions: _log, romance: _romance, ...edge }) => edge)
}

/** The 42→41 refusal (1313-A §3): lossless exactly while no pair ever competed. */
export function assertRelationshipsAtV31(rows: readonly RelationshipEdge[], caller: string): void {
  if (rows.some((edge) => edge.sharedCompetitions !== 0 || edge.recent.some((d) => !RELATIONSHIP_DRIVER_KINDS_V31.includes(d.kind)))) {
    throw new Error(`${caller}: cannot downgrade or discard a casting competition`)
  }
}
