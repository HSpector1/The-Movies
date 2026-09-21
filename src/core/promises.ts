// ── P14B.1 — The First Kept Promise Core ─────────────────────────────────────
//
// A PURE module (like talentMarket/employment): no React/DOM/async/IO, no time,
// no unseeded entropy, NO RNG AT ALL. Every function here is a deterministic,
// replayable read or write over committed state, so `state.rngState` is
// untouched by every promise path (companion §4.3: "deterministic, consumes no
// RNG, reads only committed state").
//
// Authority: docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md
// ("P14B.1 — First Kept Promise Core — task expansion"), and by reference
// docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md §4.1
// (what a promise is), §4.2 (the five families and the qualifying event), §4.3
// (the feasibility service), §4.4 (outcomes) and §4.5 (trust).
//
// WHAT THIS MODULE DOES NOT OWN (never duplicated here): P10 the person, the
// contract and its price; P12 studio identity and the employer intervals; P14A
// the case, the proposal, reservation, ranking and settlement (`talentMarket.ts`
// calls in); the production lifecycle (`operations.ts` raises the first take,
// this module only records and reads it).
//
// WHERE THE TWO NEW ROOTS LIVE. `state.firstTakes` and `state.promises` are
// GAME-STATE roots, beside `talentMarket`, not inside it: the first take is a
// production-lifecycle fact that the market merely reads, and a promise outlives
// the case it was attached to (it is carried by the contract, evaluated for
// years, and read by trust long after the proposal is gone). The plan's phrase
// "the root's new firstTakes" is read as the SAVE root; the V29 save step lifts
// both, and `migrateToV28` refuses to discard either.

import { fnv1a64 } from './math.js'
import { occupiedResourceSlots } from './occupancy.js'
import { TUNING } from './tuning.js'
import type {
  CastRoleCountPredicate, CastSlot, FirstTakeReceipt, GameState, GameStateV30, ProfessionalPromise, ProfessionalPromiseV30, Production,
  PromiseClassification, PromiseFamily, PromiseFeasibilityReceipt, TalentMarketState,
} from './types.js'

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

/** The evaluator revision stamped on newly evaluated receipts and newly minted
 * roots. 4 = P14B.4 (record 600, D1 (a)): class-restricted fixed-seat paths for
 * tagged P2 plus shared residual capacity (`reserved + X` against the spare-event
 * buffer) on the count-family scalar, applied to fresh P1 and tagged P2 alike.
 * The bounded joint certificate and UNCERTIFIED -> FRAGILE are a later evaluator
 * revision (5). Stored root versions and old receipts are never rewritten. */
export const PROMISE_RULES_VERSION = 4

// ── the named HYPOTHESES (plan's OPEN section; none of these is settled law) ──

/** On schedule the first take completes in the FIFTH week after greenlight
 * (companion §4.3.1: the fixed eight-week countdown; verified against
 * `advanceManagedProductions`, whose first advance is skipped for a production
 * greenlit this week and whose 5 → 4 branch is therefore the fifth week). */
export const WEEKS_TO_FIRST_TAKE = 5

/** HYPOTHESIS: a person holds exactly ONE seat per production and is reserved
 * from greenlight through release (companion §4.3.1), so their qualifying events
 * are counted SEQUENTIALLY, one per production cycle. */
const SEAT_CYCLE_WEEKS = TUNING.PRODUCTION_TICKS

/** HYPOTHESIS (companion §4.3.2): the X-th event's expected first-take week must
 * leave at least this many weeks before the due week. */
export const PROMISE_SLACK_WEEKS = 8

/** HYPOTHESIS (companion §4.3.2): the count-family spare-event buffer — one
 * event, or 25% of `N_max` rounded up, whichever is larger. */
export function promiseBuffer(nMax: number): number {
  return Math.max(1, Math.ceil(0.25 * nMax))
}

/** HYPOTHESIS (companion §4.5): drivers older than this leave the current tier
 * but stay in history. */
export const TRUST_HORIZON_WEEKS = 260

/** HYPOTHESIS (companion §4.5): the two descriptor edges. `Reliable` needs a real
 * positive driver and NO negative one; `Distrusted` needs at least two negative
 * drivers that also outweigh the positives, so one firing inside a long, honoured
 * relationship is a Mixed record rather than a ruined one. */
const TRUST_DISTRUST_MIN_NEGATIVES = 2

// ── the two roots ────────────────────────────────────────────────────────────

/**
 * LOUD, never silent: a live state MUST carry the V29 roots. Treating a missing
 * root as "no promises" would let a state one save version behind run live verbs
 * and quietly record nothing — exactly the fault `advanceTalentMarketWeek` refuses
 * for the V28 market root, refused here the same way.
 */
function requirePromiseRoots(state: GameState): void {
  if (state.promises === undefined || state.firstTakes === undefined) {
    throw new Error('promises: the Save V29 roots are missing — migrate this state to V29 before acting on it')
  }
}

/** Every first take this world has recorded, in append order. */
export function firstTakeReceipts(state: Pick<GameState, 'firstTakes'>): readonly FirstTakeReceipt[] {
  return state.firstTakes
}

/** Every promise this world holds, open or terminal. */
export function allPromises(state: Pick<GameState, 'promises'>): readonly ProfessionalPromise[] {
  return state.promises
}

/** §4.4: the promises that have reached a TERMINAL outcome. */
export function promiseOutcomes(state: Pick<GameState, 'promises'>): readonly ProfessionalPromise[] {
  return state.promises.filter((p) => p.outcome !== null)
}

/**
 * The qualifying-event receipt, appended at the 5 → 4 advance for BOTH
 * `advanceManagedProductions` callers. IDEMPOTENT BY productionId: a production
 * records exactly one first take for its life, so re-entering the branch (or
 * replaying a tick) can never double-count a promise.
 *
 * ENGAGEMENT, exactly the market's own rule: no industry root means no studio
 * identity a receipt could name and no case, proposal or promise this world could
 * ever hold, so the headless M0A corpus and the roster-wall observatory stay
 * byte-identical apart from the empty V29 root itself.
 */
export function appendFirstTakes(
  state: GameState,
  entries: readonly { studioId: string; production: Production }[],
  week: number,
): GameState {
  if (entries.length === 0) return state
  requirePromiseRoots(state)
  if (state.hollywood === null) return state
  const takes = [...state.firstTakes]
  const seen = new Set(takes.map((t) => t.productionId))
  for (const { studioId, production } of entries) {
    if (seen.has(production.id)) continue
    seen.add(production.id)
    takes.push({
      eventId: `first-take-event-${String(takes.length)}`,
      week,
      productionId: production.id,
      studioId,
      directorId: production.directorId,
      cast: { lead: production.cast.lead, antagonist: production.cast.antagonist, support: production.cast.support },
    })
  }
  return takes.length === state.firstTakes.length ? state : { ...state, firstTakes: takes }
}

// ── the proposal digest (P14B.1 (3): the promise is a MATERIAL term) ─────────

/** One promise's own material definition, digested. A drifted predicate, window
 * or family mints a different value, which is what makes a drifted promise drop
 * `materialTermsChanged` at freeze. */
export function promiseDigest(promise: ProfessionalPromiseV30): string {
  const material: readonly unknown[] = [promise.family, promise.predicate.count, promise.windowStartWeek, promise.dueWeekExclusive]
  // Preserve the exact historical tuple for every count-only family. The tag
  // and selected class are additional material, never inferred from a version.
  return fnv1a64(JSON.stringify('kind' in promise.predicate
    ? [...material, promise.predicate.kind, promise.predicate.seatClass]
    : material))
}

/** The digest of whatever promises a proposal currently carries, resolved LIVE
 * against the promise root. `''` — the empty string — is the no-promise value and
 * is BYTE-PRESERVING: a proposal with no promise digests exactly as it did under
 * V28, so every migrated proposal re-derives its stored digest unchanged. */
export function attachedPromiseDigest(
  state: Pick<GameStateV30, 'promises'>,
  promiseIds: readonly string[],
): string {
  if (promiseIds.length === 0) return ''
  return fnv1a64(JSON.stringify(promiseIds.map((id) => {
    const promise = state.promises.find((p) => p.promiseId === id)
    return promise === undefined ? `missing:${id}` : promiseDigest(promise)
  })))
}

/** The ONE proposal-digest formula (companion §2.1.4, widened by P14B.1 (3)).
 * Material terms only; price is derived and never material. */
export function proposalDigest(
  talentId: string,
  issuerStudioId: string,
  termWeeks: number,
  startWeek: number,
  premiumTier: number,
  promisePart: string,
): string {
  const material: readonly unknown[] = promisePart === ''
    ? [talentId, issuerStudioId, termWeeks, startWeek, premiumTier]
    : [talentId, issuerStudioId, termWeeks, startWeek, premiumTier, promisePart]
  return fnv1a64(JSON.stringify(material))
}

// ── §4.3 the feasibility service ─────────────────────────────────────────────

/** The material predicate: count-only for every family, or the explicitly
 * selected P2 seat class. The class is never inferred from a version. */
export type PromisePredicate = { count: number } | CastRoleCountPredicate

export type PromiseDraft = {
  family: PromiseFamily
  issuerStudioId: string
  beneficiaryPersonId: string
  predicate: PromisePredicate
  windowStartWeek: number
  dueWeekExclusive: number
  /** The PROPOSED CONTRACT interval the window must lie inside. */
  startWeek: number
  termWeeks: number
  /** Set when an ALREADY-MINTED promise is re-classified, so the service does not
   * count the promise against itself as an active seat reservation. */
  promiseId?: string
}

// P14B.4 (record 600): the P2 line left this map; a seat-class promise is offered
// exactly when its class is explicitly selected (see `promiseFeasibility`).
const NOT_OFFERED_IN_B1: Partial<Record<PromiseFamily, string>> = {
  DIRECTING_COUNT: 'a directing promise is not offered in this slice',
  PREFERRED_GENRE_OPPORTUNITY: 'a genre promise is not offered in this slice',
  SPECIFIC_PROJECT: 'a named-project promise is not offered in this slice',
}

function receipt(
  classification: PromiseClassification,
  bottleneck: string | null,
  inputs: readonly unknown[],
  week: number,
): PromiseFeasibilityReceipt {
  return { classification, bottleneck, inputsDigest: fnv1a64(JSON.stringify(inputs)), rulesVersion: PROMISE_RULES_VERSION, week }
}

/** The studio's live pictures, whichever owner holds them. */
function studioProductions(state: GameState, studioId: string): readonly Production[] {
  if (state.hollywood !== null && studioId !== state.hollywood.playerStudioId) {
    return state.hollywood.businesses.find((b) => b.studioId === studioId)?.productions ?? []
  }
  return state.studio.activeProductions
}

/** The studio's committed, not-yet-produced screenplays — each one a picture that
 * ALREADY EXISTS and needs no new commission (companion §4.3.2's existing-path
 * test; Example A's "one script ready … one script drafting"). */
function unproducedScripts(state: GameState, studioId: string): number {
  const development = state.hollywood !== null && studioId !== state.hollywood.playerStudioId
    ? state.hollywood.businesses.find((b) => b.studioId === studioId)?.development
    : state.scriptDevelopment
  if (development === undefined || development.mode !== 'managed') return 0
  return development.projects.filter((p) => p.status !== 'produced').length
}

/**
 * Can this studio start ONE more picture right now out of stock, with no
 * commission at all? In the accepted runtime the plain `greenlight` door takes an
 * UNUSED CONCEPT plus contracted people directly, so a concept the studio already
 * holds IS an existing-pipeline path — bounded at one because the beneficiary can
 * occupy only one seat at a time, so a second stock picture would be a future
 * commitment the studio has not made (that is exactly "a picture not yet
 * commissioned"). Rivals commission before they greenlight and hold no such stock
 * door, so this term is the player's alone.
 */
function stockGreenlightAvailable(state: GameState, studioId: string): boolean {
  if (state.hollywood !== null && studioId !== state.hollywood.playerStudioId) return false
  const used = new Set<string>()
  for (const p of state.studio.activeProductions) used.add(p.conceptId)
  for (const f of state.studio.releasedFilms) used.add(f.conceptId)
  if (state.scriptDevelopment.mode === 'managed') for (const p of state.scriptDevelopment.projects) used.add(p.conceptId)
  if (!state.concepts.some((c) => !used.has(c.id))) return false
  const stages = state.operations.facilities.filter((f) => f.capability === 'soundstage').length
  return state.studio.activeProductions.length < stages
}

/** This person's seat on an ALREADY-STARTED picture of this studio whose first
 * take is still ahead — the one path that needs no greenlight either. Only a seat
 * inside the promise's class mask counts (record 600): a fixed seat outside the
 * mask is not an event. A recorded first take means no NEW event from that picture. */
function seatedPreFirstTake(
  state: GameState,
  studioId: string,
  personId: string,
  slots: readonly CastSlot[],
): readonly Production[] {
  const recorded = new Set(state.firstTakes.map((t) => t.productionId))
  return studioProductions(state, studioId).filter(
    (p) => !recorded.has(p.id) && slots.some((slot) => p.cast[slot] === personId),
  )
}

/** Companion §4.3.1's "already-active promises … seats those promises reserve
 * inside the same window". Bound commitments and CURRENT attached drafts reserve;
 * abandoned unbound roots remain history without claiming a future seat. Both the
 * arithmetic and its receipt digest consume this ONE membership rule. Competing
 * current issuers still count under the existing policy; none is optimized away. */
function activePromiseReservations(state: GameState, draft: PromiseDraft, from: number): readonly ProfessionalPromise[] {
  const attached = new Set(state.talentMarket.proposals.flatMap((proposal) => proposal.promises))
  return state.promises.filter((promise) =>
    promise.outcome === null
    && (promise.contractId !== null || attached.has(promise.promiseId))
    && promise.promiseId !== draft.promiseId
    && promise.beneficiaryPersonId === draft.beneficiaryPersonId
    && promise.dueWeekExclusive > from
    && promise.windowStartWeek < draft.dueWeekExclusive)
}

function reservedByActivePromises(state: GameState, draft: PromiseDraft, from: number): number {
  return activePromiseReservations(state, draft, from)
    .reduce((reserved, promise) => reserved + Math.max(0, promise.predicate.count - promise.progress), 0)
}

/** The receipt identifies the committed inputs, not just the requested terms.
 * Keep this bounded to current pipeline/availability facts from their owners:
 * no account balances, RNG, outcome history or whole-campaign serialization. */
function feasibilityInputs(state: GameState, draft: PromiseDraft, week: number): readonly unknown[] {
  const rival = state.hollywood !== null && draft.issuerStudioId !== state.hollywood.playerStudioId
  const business = rival ? state.hollywood?.businesses.find((b) => b.studioId === draft.issuerStudioId) : undefined
  const productions = studioProductions(state, draft.issuerStudioId)
  const productionIds = new Set(productions.map((p) => p.id))
  const operations = rival ? business?.operations : state.operations
  const development = rival ? business?.development : state.scriptDevelopment
  const occupancy = occupiedResourceSlots(rival
    ? business === undefined ? {} : { operations: business.operations, scriptDevelopment: business.development }
    : state)
  const from = Math.max(draft.windowStartWeek, week)
  const person = state.talent.find((t) => t.id === draft.beneficiaryPersonId)
  return [
    draft.family, draft.issuerStudioId, draft.beneficiaryPersonId, draft.predicate.count,
    draft.windowStartWeek, draft.dueWeekExclusive, draft.startWeek, draft.termWeeks, week,
    person === undefined ? null : person.skills.acting !== undefined,
    productions.map((p) => [p.id, p.conceptId, p.startTick, p.remainingTicks, p.directorId, p.cast]),
    operations?.facilities.map((f) => [f.id, f.capability, f.capacity]) ?? [],
    operations?.workflows ?? [],
    development?.projects.filter((p) => p.status !== 'produced')
      .map((p) => [p.id, p.conceptId, p.status, p.writerIds, p.dueWeek, p.reservation, p.productionId]) ?? [],
    [...occupancy].map(([key, claims]) => [key, claims.map((c) => [c.owner, c.ownerId, c.capability, c.slot])]),
    rival ? [] : state.productionQueue,
    rival ? [] : state.placement.facilities.filter((f) => f.status !== 'cancelled')
      .map((f) => [f.facilityId, f.blueprintId, f.status, f.completesWeek]),
    rival ? false : stockGreenlightAvailable(state, draft.issuerStudioId),
    state.firstTakes.filter((t) => productionIds.has(t.productionId)).map((t) => [t.eventId, t.productionId, t.week]),
    state.hollywood?.employment.filter((e) => e.terms.talentId === draft.beneficiaryPersonId
      && e.terms.startWeek < draft.dueWeekExclusive && (e.endedWeek ?? e.terms.endWeekExclusive) > from)
      .map((e) => [e.contractId, e.studioId, e.terms.startWeek, e.terms.endWeekExclusive, e.endedWeek]) ?? [],
    activePromiseReservations(state, draft, from)
      .map((p) => [p.promiseId, p.family, p.issuerStudioId, p.windowStartWeek, p.dueWeekExclusive, p.predicate.count, p.progress]),
    // Appended only for a tagged draft so every count-only tuple stays byte-identical.
    ...('kind' in draft.predicate ? [[draft.predicate.kind, draft.predicate.seatClass]] : []),
  ]
}

/**
 * The expected first-take week of this person's k-th sequential qualifying event
 * (0-based), counting only paths the studio controls. Event 0 may already be
 * running: a picture the person is seated on advances on its own clock
 * (`remainingTicks` counts down to the 5 → 4 take), and nothing needs to be
 * greenlit for it at all.
 */
function expectedFirstTakeWeek(state: GameState, draft: PromiseDraft, from: number, k: number): number {
  if (k === 0) {
    const running = seatedPreFirstTake(state, draft.issuerStudioId, draft.beneficiaryPersonId, promiseCastSlots(draft))
    let earliest: number | null = null
    for (const production of running) {
      // `remainingTicks` 5 is the week BEFORE the take; the first advance is
      // skipped for a picture greenlit this very week.
      const weeks = Math.max(1, production.remainingTicks - 4) + (production.startTick >= from ? 1 : 0)
      if (earliest === null || from + weeks < earliest) earliest = from + weeks
    }
    if (earliest !== null) return earliest
  }
  return from + k * SEAT_CYCLE_WEEKS + WEEKS_TO_FIRST_TAKE
}

/**
 * §4.3: does this studio's own authoritative schedule show a reasonable path to
 * satisfy this promise? Pure, no RNG, committed state by reference.
 *
 * The COUNT-FAMILY rule of §4.3.2, with all three conditions:
 *   1. `X ≤ N_max − buffer`                       (spare events)
 *   2. the X earliest events lie on EXISTING-pipeline paths
 *   3. the X-th event's expected first take leaves `slack` weeks before the due week
 * REASONABLY ACHIEVABLE iff all three hold; FRAGILE iff `X ≤ N_max` but one
 * fails; IMPOSSIBLE iff `X > N_max`, the window lies outside the contract, or
 * active promises already exhaust the seats.
 *
 * THE RETIREMENT INPUT IS ABSENT, not assumed: §4.3.1's "announced retirement
 * effective week" has no engine fact before P14C, so it is read as absent and
 * stated here rather than silently defaulted.
 */
export function promiseFeasibility(state: GameState, draft: PromiseDraft, week: number): PromiseFeasibilityReceipt {
  const X = draft.predicate.count
  const inputs = feasibilityInputs(state, draft, week)
  const refuse = (bottleneck: string): PromiseFeasibilityReceipt => receipt('IMPOSSIBLE', bottleneck, inputs, week)

  const notOffered = NOT_OFFERED_IN_B1[draft.family]
  if (notOffered !== undefined) return refuse(notOffered)
  // Record 600: a seat-class promise is offered only with its class selected; a
  // legacy count-only P2 stays nonofferable at a new quote/freeze with the missing
  // fact named. A class on any other family is a shape refusal, not a search miss.
  if (draft.family === 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' && !('kind' in draft.predicate)) {
    return refuse('a seat-class promise needs its seat class selected (lead, or lead-or-antagonist); without one it is not offered')
  }
  if ('kind' in draft.predicate && draft.family !== 'LEAD_OR_SIGNIFICANT_ROLE_COUNT') {
    return refuse('a selected seat class applies only to a seat-class promise')
  }
  if (!Number.isInteger(X) || X < 1) return refuse('the promised count must be a whole picture')
  if (draft.dueWeekExclusive <= draft.windowStartWeek) return refuse('the window closes before it opens')
  if (draft.windowStartWeek < draft.startWeek) return refuse('the window starts before the proposed contract')
  if (draft.dueWeekExclusive > draft.startWeek + draft.termWeeks) {
    return refuse('the due week falls outside the proposed contract')
  }
  // Match greenlight's has-discipline law (actions.ts `requireRole`): an acting
  // skill profile permits a cast assignment regardless of primary profession.
  const person = state.talent.find((t) => t.id === draft.beneficiaryPersonId)
  if (person === undefined) return refuse('this person is not in the world')
  if (person.skills.acting === undefined) return refuse('this person lacks an acting skill profile')

  const from = Math.max(draft.windowStartWeek, week)
  const reserved = reservedByActivePromises(state, draft, from)

  // N_max: the events this person can reach inside the window, counted
  // sequentially (one seat at a time), each on the minimum lawful pipeline.
  let nMax = 0
  while (expectedFirstTakeWeek(state, draft, from, nMax) < draft.dueWeekExclusive) {
    nMax += 1
    if (nMax > 1000) break // bounded: a window can never buy more than this
  }
  if (X > nMax) return refuse('no filming week inside the window can reach that many pictures')
  if (reserved + X > nMax) return refuse('promises already made to this person exhaust the window')

  const existingPath = seatedPreFirstTake(state, draft.issuerStudioId, draft.beneficiaryPersonId, promiseCastSlots(draft)).length
    + unproducedScripts(state, draft.issuerStudioId)
    + (stockGreenlightAvailable(state, draft.issuerStudioId) ? 1 : 0)
  const lastEventWeek = expectedFirstTakeWeek(state, draft, from, reserved + X - 1)

  // Evaluator 4 (record 600): active reservations are subtracted before the
  // spare-event buffer is tested — shared residual capacity, for fresh P1 and
  // tagged P2 alike.
  if (reserved + X > nMax - promiseBuffer(nMax)) {
    return receipt('FRAGILE', 'the schedule leaves no spare picture inside the window', inputs, week)
  }
  if (reserved + X > existingPath) {
    return receipt('FRAGILE', 'needs a picture not yet commissioned', inputs, week)
  }
  if (draft.dueWeekExclusive - lastEventWeek < PROMISE_SLACK_WEEKS) {
    return receipt('FRAGILE', 'the due week leaves too little room before filming would start', inputs, week)
  }
  return receipt('REASONABLY_ACHIEVABLE', null, inputs, week)
}

/** Re-classification of an ALREADY-MINTED promise against committed state — the
 * freeze step (§2.1.8) and the studio-caused-event step (§4.4) share it. The
 * window itself is the interval: a live promise no longer asks whether it fits
 * inside a contract it already rode in on. */
export function reclassifyPromise(state: GameState, promise: ProfessionalPromise, week: number): PromiseFeasibilityReceipt {
  return promiseFeasibility(state, {
    family: promise.family,
    issuerStudioId: promise.issuerStudioId,
    beneficiaryPersonId: promise.beneficiaryPersonId,
    predicate: promise.predicate,
    windowStartWeek: promise.windowStartWeek,
    dueWeekExclusive: promise.dueWeekExclusive,
    startWeek: promise.windowStartWeek,
    termWeeks: promise.dueWeekExclusive - promise.windowStartWeek,
    promiseId: promise.promiseId,
  }, week)
}

// ── §4.1 attachment: the promise rides on a CURRENT proposal ────────────────

export type PromiseAttachment = {
  family: PromiseFamily
  predicate: PromisePredicate
  windowStartWeek: number
  dueWeekExclusive: number
}

function appendMarketReceipt(
  market: TalentMarketState,
  draft: { kind: 'promiseOutcome'; week: number; talentId: string; studioId: string | null; reasons: readonly string[] },
): TalentMarketState {
  return {
    ...market,
    receipts: [...market.receipts, { ...draft, dropped: [], eventId: `talent-market-event-${String(market.receipts.length)}` }],
  }
}

/**
 * Attach ONE promise to the studio's current proposal for this person. The
 * contract interval and the parties are read off the target proposal (companion
 * §4.1: a promise "is attached to a proposal"); only the promise's own fields are
 * drafted here.
 *
 * AT MOST ONE PROMISE PER PROPOSAL (plan item 3, bounded hypothesis) is ENFORCED
 * BY REFUSAL, not by silent replacement: a revision re-submits the proposal —
 * this codebase's own "revised in place" convention, which restores the material
 * terms and clears the promise — and then attaches a new draft.
 */
export function attachPromise(
  state: GameState,
  talentId: string,
  issuerStudioId: string,
  draft: PromiseAttachment,
): GameState {
  const week = state.market.tick
  const proposal = state.talentMarket.proposals.find((p) => p.talentId === talentId && p.issuerStudioId === issuerStudioId)
  if (proposal === undefined) {
    throw new Error(`promises: studio "${issuerStudioId}" has no current proposal for "${talentId}" to attach a promise to`)
  }
  if (proposal.promises.length > 0) {
    throw new Error(
      `promises: studio "${issuerStudioId}"'s proposal for "${talentId}" already carries a promise — P14B.1 attaches at most one; re-submit the proposal to revise it`,
    )
  }
  // A selected class is legal only on the P2 family (the V30 writer refuses any
  // other root); fail loud here rather than stage an unsaveable state.
  if ('kind' in draft.predicate && draft.family !== 'LEAD_OR_SIGNIFICANT_ROLE_COUNT') {
    throw new Error(
      `promises: a selected seat class is legal only on a LEAD_OR_SIGNIFICANT_ROLE_COUNT promise, not "${draft.family}"`,
    )
  }
  const feasibilityReceipt = promiseFeasibility(state, {
    family: draft.family,
    issuerStudioId,
    beneficiaryPersonId: talentId,
    predicate: draft.predicate,
    windowStartWeek: draft.windowStartWeek,
    dueWeekExclusive: draft.dueWeekExclusive,
    startWeek: proposal.startWeek,
    termWeeks: proposal.termWeeks,
  }, week)
  const base = {
    promiseId: `promise-${String(state.promises.length)}`,
    version: PROMISE_RULES_VERSION,
    issuerStudioId,
    beneficiaryPersonId: talentId,
    windowStartWeek: draft.windowStartWeek,
    dueWeekExclusive: draft.dueWeekExclusive,
    feasibilityReceipt,
    progress: 0,
    evidenceRefs: [],
    outcome: null,
    outcomeWeek: null,
    outcomeCause: null,
    outcomeEventId: null,
    contractId: null,
  }
  // The COMPLETE predicate is copied as a detached object, minted in two typed
  // branches against the correlated V30 members (the tagged branch is P2 by the
  // guard above).
  const promise: ProfessionalPromise = 'kind' in draft.predicate
    ? {
        ...base,
        family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
        predicate: { kind: 'castRoleCount', count: draft.predicate.count, seatClass: draft.predicate.seatClass },
      }
    : { ...base, family: draft.family, predicate: { count: draft.predicate.count } }
  const promises = [...state.promises, promise]
  const promised = { ...proposal, promises: [promise.promiseId] }
  const redigested = {
    ...promised,
    digest: proposalDigest(
      promised.talentId, promised.issuerStudioId, promised.termWeeks, promised.startWeek, promised.premiumTier,
      attachedPromiseDigest({ promises }, promised.promises),
    ),
  }
  return {
    ...state,
    promises,
    talentMarket: {
      ...state.talentMarket,
      proposals: state.talentMarket.proposals.map((p) => (p === proposal ? redigested : p)),
    },
  }
}

// ── §4.4 outcomes ────────────────────────────────────────────────────────────

/** The qualifying first takes for one promise: this studio's own, inside the
 * window, with this person in a cast seat. Ordered as they were recorded. */
/**
 * RULING (i) (plan, P14B.1 T2): a promise BINDS only when the proposal that
 * carried it is COMMITTED at settlement — `commitWinningPromise` setting the
 * `contractId` it rode in on (companion §4.1). A promise whose proposal LOST,
 * was dropped at freeze, or was withdrawn is UNBOUND and is NEVER evaluated: no
 * due-week BROKEN, no SATISFIED, no termination or cancellation BROKEN, no
 * `promiseOutcome` receipt and therefore no trust driver — its record keeps
 * `outcome: null` and `contractId: null` for good. B.1 mints no outcome for an
 * offer nobody took.
 *
 * DELIBERATELY NOT GATED: the feasibility quote (`reservedByActivePromises`) and
 * the freeze re-classification act on ATTACHED, not-yet-bound promises by
 * design — quoting a promise before anyone has accepted it is what they are for.
 */
function evaluable(promise: ProfessionalPromise): boolean {
  return promise.outcome === null && promise.contractId !== null
}

export function promiseCastSlots(promise: Pick<ProfessionalPromiseV30, 'predicate'>): readonly CastSlot[] {
  // Legacy count-only records of every family retain generic-cast semantics.
  // Only the explicit predicate shape selects a restricted seat class.
  if (!('kind' in promise.predicate)) return CAST_SLOTS
  return promise.predicate.seatClass === 'lead' ? ['lead'] : ['lead', 'antagonist']
}

export function qualifyingTakes(
  state: Pick<GameStateV30, 'firstTakes'>,
  promise: ProfessionalPromiseV30,
): readonly FirstTakeReceipt[] {
  const slots = promiseCastSlots(promise)
  const productions = new Set<string>()
  return state.firstTakes.filter((take) => {
    if (productions.has(take.productionId)
      || take.studioId !== promise.issuerStudioId
      || take.week < promise.windowStartWeek || take.week >= promise.dueWeekExclusive
      || !slots.some((slot) => take.cast[slot] === promise.beneficiaryPersonId)) return false
    productions.add(take.productionId)
    return true
  })
}

/** The five outcome fields a settlement may write; identical on both V30 members. */
type PromiseSettlement = Partial<Pick<ProfessionalPromise, 'progress' | 'evidenceRefs' | 'outcome' | 'outcomeCause' | 'outcomeEventId'>>

function settle(
  state: GameState,
  promise: ProfessionalPromise,
  next: PromiseSettlement,
  week: number,
  reason: string,
): GameState {
  const market = appendMarketReceipt(state.talentMarket, {
    kind: 'promiseOutcome',
    week,
    talentId: promise.beneficiaryPersonId,
    studioId: promise.issuerStudioId,
    reasons: [reason],
  })
  const eventId = market.receipts[market.receipts.length - 1]!.eventId
  return {
    ...state,
    promises: state.promises.map((p) => (p.promiseId === promise.promiseId
      ? { ...p, ...next, outcomeWeek: week, outcomeEventId: next.outcomeEventId ?? eventId }
      : p)),
    talentMarket: market,
  }
}

/**
 * The weekly promise pass: SATISFIED at the X-th qualifying first take inside the
 * window, BROKEN at `dueWeekExclusive` when the window passes unsatisfied.
 * Outcomes are TERMINAL and emitted ONCE — a promise that already carries one is
 * never re-evaluated, so a replayed or repeated tick cannot duplicate it.
 *
 * WAIVED and VOIDED are enumerated members no B.1 path reaches: there is no
 * waiver acceptance rule and no P14C retirement or profession transition to
 * produce an external cause.
 */
export function advancePromisesWeek(state: GameState): GameState {
  requirePromiseRoots(state)
  const week = state.market.tick
  let next = state
  for (const promise of state.promises) {
    if (!evaluable(promise)) continue
    const takes = qualifyingTakes(next, promise)
    const progress = Math.min(promise.predicate.count, takes.length)
    if (takes.length >= promise.predicate.count) {
      const evidenceRefs = takes.slice(0, promise.predicate.count).map((t) => t.eventId)
      next = settle(next, promise, {
        progress,
        evidenceRefs,
        outcome: 'SATISFIED',
        outcomeCause: 'the promised pictures began filming inside the window',
        // `outcomeEventId` names this promise's OWN outcome event — the
        // `promiseOutcome` receipt `settle` appends — in every branch, never the
        // causing first take, which `evidenceRefs` already names. ONE take seats
        // up to three promised people (measured: r01's `first-take-event-76`
        // satisfies three of its own promises at week 216), so pointing the field
        // at the take made several promises name one event and the V29 root
        // validator refused the save: "records a second outcome".
        outcomeEventId: null,
      }, week, 'a promise to this person was kept')
      continue
    }
    if (week >= promise.dueWeekExclusive) {
      next = settle(next, promise, {
        progress,
        outcome: 'BROKEN',
        outcomeCause: 'the window closed before the promised pictures began filming',
        outcomeEventId: null,
      }, week, 'a promise to this person went unmet to its due week')
      continue
    }
    if (progress !== promise.progress) {
      next = { ...next, promises: next.promises.map((p) => (p.promiseId === promise.promiseId ? { ...p, progress } : p)) }
    }
  }
  return next
}

/**
 * §4.4, recorded IMMEDIATELY at the causing action: the issuing studio terminated
 * the beneficiary early, so every open promise it made them is BROKEN at the
 * termination, not at the next weekly pass.
 */
export function breakPromisesOnTermination(state: GameState, issuerStudioId: string, personId: string): GameState {
  requirePromiseRoots(state)
  const week = state.market.tick
  let next = state
  for (const promise of state.promises) {
    if (!evaluable(promise)) continue
    if (promise.issuerStudioId !== issuerStudioId || promise.beneficiaryPersonId !== personId) continue
    next = settle(next, promise, {
      outcome: 'BROKEN',
      outcomeCause: 'the studio terminated this contract early, ending the window',
      outcomeEventId: null,
    }, week, 'a promise to this person was broken by an early termination')
  }
  return next
}

/**
 * §4.4's "any studio-caused event that makes the predicate unsatisfiable": the
 * studio cancelled a picture the beneficiary was seated on BEFORE its first take.
 * The service is re-run against committed state and the promise is BROKEN IFF the
 * result is IMPOSSIBLE — a cancellation the schedule can still absorb costs the
 * studio nothing here (it is priced by trust, §4.5), and a first take already
 * taken is never un-taken (companion §4.2: "first take, then cancellation").
 */
export function breakPromisesOnCancel(state: GameState, issuerStudioId: string, cancelled: Production): GameState {
  requirePromiseRoots(state)
  const week = state.market.tick
  if (state.firstTakes.some((t) => t.productionId === cancelled.id)) return state
  const seated = new Set(CAST_SLOTS.map((slot) => cancelled.cast[slot]))
  let next = state
  for (const promise of state.promises) {
    if (!evaluable(promise)) continue
    if (promise.issuerStudioId !== issuerStudioId || !seated.has(promise.beneficiaryPersonId)) continue
    if (reclassifyPromise(next, promise, week).classification !== 'IMPOSSIBLE') continue
    next = settle(next, promise, {
      outcome: 'BROKEN',
      outcomeCause: 'the studio cancelled the picture this person was cast in, and no path was left',
      outcomeEventId: null,
    }, week, 'a promise to this person was broken by a cancelled picture')
  }
  return next
}

// ── §4.5 trust: professional memory, DERIVED ON READ ────────────────────────

export type TrustLabel = 'Reliable' | 'Mixed record' | 'Distrusted'
export type TrustDriverKind = 'promiseKept' | 'promiseBroken' | 'terminatedEarly' | 'ranToEnd' | 'cancelledAfterFirstTake'
export type TrustDriver = { kind: TrustDriverKind; week: number; positive: boolean; reason: string }
export type TrustDescriptor = { label: TrustLabel; drivers: readonly TrustDriver[]; scope: 'person' | 'studio' }

/**
 * The FOUR driver kinds of §4.5 (the fourth splits into the two cancellation
 * cases the accepted records can witness), for one (person, studio) pair. Nothing
 * is persisted: every driver is read from a fact some other owner already holds —
 * this module's own promise outcomes, P12's termination receipts and employment
 * intervals, and the first-take root joined against what became of the picture.
 *
 * THE RECORDING BOUNDARY (Q3, no behavioral backfill): drivers dated before the
 * campaign's own recording boundary are not read at all, so a migrated save never
 * acquires a professional history it never recorded.
 */
export function trustDrivers(
  state: GameState,
  personId: string | null,
  studioId: string,
  week: number,
): readonly TrustDriver[] {
  const boundary = state.studioHistory.recordingStartedWeek
  const horizon = week - TRUST_HORIZON_WEEKS
  const drivers: TrustDriver[] = []
  // Inside the recency horizon and at or after the campaign's own recording
  // boundary. Nothing is filtered by "not in the future": a driver's week comes
  // from the record that produced it, and second-guessing that here would hide a
  // real clock fault instead of reporting it.
  const keep = (at: number): boolean => at >= boundary && at > horizon

  for (const promise of state.promises) {
    if (promise.issuerStudioId !== studioId) continue
    if (personId !== null && promise.beneficiaryPersonId !== personId) continue
    if (promise.outcome === null || promise.outcomeWeek === null || !keep(promise.outcomeWeek)) continue
    if (promise.outcome === 'SATISFIED') {
      drivers.push({ kind: 'promiseKept', week: promise.outcomeWeek, positive: true, reason: 'kept a promise' })
    } else if (promise.outcome === 'BROKEN') {
      drivers.push({ kind: 'promiseBroken', week: promise.outcomeWeek, positive: false, reason: 'broke a promise' })
    }
  }

  const hollywood = state.hollywood
  if (hollywood !== null) {
    for (const row of hollywood.employment) {
      if (row.studioId !== studioId) continue
      if (personId !== null && row.terms.talentId !== personId) continue
      if (row.endedWeek === null || !keep(row.endedWeek)) continue
      const terminated = hollywood.receipts.some((r) => r.kind === 'employment' && r.contractId === row.contractId
        && r.toStudioId === null && r.reason === 'termination')
      if (terminated) drivers.push({ kind: 'terminatedEarly', week: row.endedWeek, positive: false, reason: 'ended a contract early' })
      else if (row.endedWeek >= row.terms.endWeekExclusive) {
        drivers.push({ kind: 'ranToEnd', week: row.endedWeek, positive: true, reason: 'ran a contract to its end' })
      }
    }
  }

  // A picture that filmed and then vanished without a release was cancelled after
  // its first take — derived from the two records that already exist (the first
  // take, and what became of the picture), never a new one.
  const live = new Set<string>()
  for (const p of state.studio.activeProductions) live.add(p.id)
  for (const f of state.studio.releasedFilms) live.add(f.productionId)
  for (const business of hollywood?.businesses ?? []) for (const p of business.productions) live.add(p.id)
  for (const f of hollywood?.films ?? []) live.add(f.filmId)
  for (const take of state.firstTakes) {
    if (take.studioId !== studioId || live.has(take.productionId) || !keep(take.week)) continue
    if (personId !== null && !CAST_SLOTS.some((slot) => take.cast[slot] === personId)) continue
    drivers.push({ kind: 'cancelledAfterFirstTake', week: take.week, positive: false, reason: 'cancelled a picture after filming began' })
  }
  return drivers.sort((a, b) => (a.week === b.week ? a.kind.localeCompare(b.kind) : b.week - a.week))
}

function label(drivers: readonly TrustDriver[]): TrustLabel {
  const positive = drivers.filter((d) => d.positive).length
  const negative = drivers.length - positive
  if (negative === 0) return positive > 0 ? 'Reliable' : 'Mixed record'
  return negative >= TRUST_DISTRUST_MIN_NEGATIVES && negative > positive ? 'Distrusted' : 'Mixed record'
}

/**
 * §4.5's public descriptor: per (person, studio), with the STUDIO-LEVEL aggregate
 * as the fallback when this pair has no shared history at all. Never a hidden
 * multiplier and never a persisted meter — two reads of the same state give the
 * same label, and no tick writes one.
 */
export function trustDescriptor(state: GameState, personId: string, studioId: string, week: number): TrustDescriptor {
  const own = trustDrivers(state, personId, studioId, week)
  if (own.length > 0) return { label: label(own), drivers: own.slice(0, 3), scope: 'person' }
  return studioTrustDescriptor(state, studioId, week)
}

/** The public studio aggregate, labelled from ALL drivers before the display cap. */
export function studioTrustDescriptor(state: GameState, studioId: string, week: number): TrustDescriptor {
  const aggregate = trustDrivers(state, null, studioId, week)
  return { label: label(aggregate), drivers: aggregate.slice(0, 3), scope: 'studio' }
}

// ── the V29 save-root validator (R22: no authority without its backing fact) ──

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * The two V29 roots, validated where the save boundary can name the real fault:
 * every first take is dated inside the campaign, once per production, with an
 * in-state ordinal id. Proposals, contracts, outcomes and qualifying evidence
 * resolve to their actual records, including the parties those records name.
 * A first take may serve several beneficiaries; each outcome has its own receipt.
 */
export function validatePromiseRoots(state: unknown): void {
  validatePromiseRootsForVersion(state, 29)
}

/** V30 validates selected P2 seats without reinterpreting legacy count-only
 * records. V29 still invokes the exact count-only policy and error prefix. */
export function validatePromiseRootsV30(state: unknown): void {
  validatePromiseRootsForVersion(state, 30)
}

function validatePromiseRootsForVersion(state: unknown, saveVersion: 29 | 30): void {
  const fail = (message: string): never => {
    throw new Error(`validateSaveV${String(saveVersion)}: ${message}`)
  }
  if (!isRecord(state)) return fail('state is not a plain object')
  const takes = state.firstTakes
  const promises = state.promises
  if (!Array.isArray(takes)) return fail('state.firstTakes is not an array')
  if (!Array.isArray(promises)) return fail('state.promises is not an array')

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

  const hollywood = isRecord(state.hollywood) ? state.hollywood : null
  const identities = hollywood !== null && Array.isArray(hollywood.identities) ? hollywood.identities : []
  const entered = new Set(identities
    .filter((s): s is Record<string, unknown> => isRecord(s) && s.enteredWeek !== null)
    .map((s) => String(s.studioId)))
  const people = new Set((Array.isArray(state.talent) ? state.talent : [])
    .filter(isRecord).map((person) => person.id))
  const personId = (value: unknown, at: string): string => {
    const id = text(value, at)
    if (!people.has(id)) return fail(`${at} does not name a person of this world`)
    return id
  }
  const studioId = (value: unknown, at: string): string => {
    const id = text(value, at)
    if (!entered.has(id)) return fail(`${at} is not an entered studio of this world`)
    return id
  }
  const employment = hollywood !== null && Array.isArray(hollywood.employment)
    ? hollywood.employment.filter(isRecord) : []
  const market = record(state.talentMarket, 'state.talentMarket')
  if (!Array.isArray(market.proposals)) return fail('state.talentMarket.proposals is not an array')
  if (!Array.isArray(market.receipts)) return fail('state.talentMarket.receipts is not an array')
  const receiptsById = new Map(market.receipts.filter(isRecord).map((r) => [r.eventId, r]))

  const seenProduction = new Set<string>()
  const takesById = new Map<string, FirstTakeReceipt>()
  for (let i = 0; i < takes.length; i++) {
    const at = `state.firstTakes[${String(i)}]`
    const row = record(takes[i], at)
    exact(row, ['eventId', 'week', 'productionId', 'studioId', 'directorId', 'cast'], at)
    if (row.eventId !== `first-take-event-${String(i)}`) return fail(`${at}.eventId is not this root's ordinal id`)
    recordedWeek(row.week, `${at}.week`)
    const productionId = text(row.productionId, `${at}.productionId`)
    if (seenProduction.has(productionId)) return fail(`${at} records a second first take for production "${productionId}"`)
    seenProduction.add(productionId)
    studioId(row.studioId, `${at}.studioId`)
    personId(row.directorId, `${at}.directorId`)
    const cast = record(row.cast, `${at}.cast`)
    exact(cast, CAST_SLOTS, `${at}.cast`)
    for (const slot of CAST_SLOTS) personId(cast[slot], `${at}.cast.${slot}`)
    // A cancellation can remove the production. Its durable take remains valid
    // without reconstructing a production that no longer exists.
    takesById.set(row.eventId as string, row as unknown as FirstTakeReceipt)
  }

  const promisesById = new Map<string, ProfessionalPromiseV30>()
  const outcomeEvents = new Set<string>()
  for (let i = 0; i < promises.length; i++) {
    const at = `state.promises[${String(i)}]`
    const row = record(promises[i], at)
    exact(row, ['promiseId', 'family', 'version', 'issuerStudioId', 'beneficiaryPersonId', 'predicate',
      'windowStartWeek', 'dueWeekExclusive', 'feasibilityReceipt', 'progress', 'evidenceRefs',
      'outcome', 'outcomeWeek', 'outcomeCause', 'outcomeEventId', 'contractId'], at)
    const promiseId = text(row.promiseId, `${at}.promiseId`)
    if (promisesById.has(promiseId)) return fail(`${at}.promiseId "${promiseId}" is recorded twice`)
    if (!['APPEARANCE_COUNT', 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', 'DIRECTING_COUNT', 'PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT']
      .includes(String(row.family))) return fail(`${at}.family is not in the promise catalogue`)
    if (nonnegative(row.version, `${at}.version`) < 1) return fail(`${at}.version must be positive`)
    studioId(row.issuerStudioId, `${at}.issuerStudioId`)
    personId(row.beneficiaryPersonId, `${at}.beneficiaryPersonId`)
    const predicate = record(row.predicate, `${at}.predicate`)
    let qualifyingSlots: readonly CastSlot[] = CAST_SLOTS
    if (saveVersion === 30 && Object.hasOwn(predicate, 'kind')) {
      exact(predicate, ['kind', 'count', 'seatClass'], `${at}.predicate`)
      if (predicate.kind !== 'castRoleCount') return fail(`${at}.predicate.kind is not a supported promise predicate`)
      if (row.family !== 'LEAD_OR_SIGNIFICANT_ROLE_COUNT') {
        return fail(`${at}.predicate.castRoleCount is only valid for LEAD_OR_SIGNIFICANT_ROLE_COUNT`)
      }
      if (predicate.seatClass !== 'lead' && predicate.seatClass !== 'leadOrAntagonist') {
        return fail(`${at}.predicate.seatClass is not a selected P2 seat class`)
      }
      qualifyingSlots = predicate.seatClass === 'lead' ? ['lead'] : ['lead', 'antagonist']
    } else {
      // All legacy catalogue families retain generic-cast evidence. Neither
      // root.version nor receipt.rulesVersion selects a new predicate shape.
      exact(predicate, ['count'], `${at}.predicate`)
    }
    const count = nonnegative(predicate.count, `${at}.predicate.count`)
    if (count < 1) return fail(`${at}.predicate.count must be a whole picture`)
    const progress = nonnegative(row.progress, `${at}.progress`)
    if (progress > count) return fail(`${at}.progress is outside its own predicate`)
    const start = nonnegative(row.windowStartWeek, `${at}.windowStartWeek`)
    const due = nonnegative(row.dueWeekExclusive, `${at}.dueWeekExclusive`)
    if (due <= start) return fail(`${at} closes before it opens`)

    const feasibility = record(row.feasibilityReceipt, `${at}.feasibilityReceipt`)
    exact(feasibility, ['classification', 'bottleneck', 'inputsDigest', 'rulesVersion', 'week'], `${at}.feasibilityReceipt`)
    if (!['REASONABLY_ACHIEVABLE', 'FRAGILE', 'IMPOSSIBLE'].includes(String(feasibility.classification))) {
      return fail(`${at}.feasibilityReceipt.classification is not in the catalogue`)
    }
    if (feasibility.classification === 'REASONABLY_ACHIEVABLE') {
      if (feasibility.bottleneck !== null) return fail(`${at}.feasibilityReceipt names a bottleneck for an achievable promise`)
    } else text(feasibility.bottleneck, `${at}.feasibilityReceipt.bottleneck`)
    if (!/^[0-9a-f]{16}$/.test(text(feasibility.inputsDigest, `${at}.feasibilityReceipt.inputsDigest`))) {
      return fail(`${at}.feasibilityReceipt.inputsDigest is not a feasibility digest`)
    }
    if (nonnegative(feasibility.rulesVersion, `${at}.feasibilityReceipt.rulesVersion`) < 1) {
      return fail(`${at}.feasibilityReceipt.rulesVersion must be positive`)
    }
    recordedWeek(feasibility.week, `${at}.feasibilityReceipt.week`)

    if (row.contractId !== null) {
      const contractId = text(row.contractId, `${at}.contractId`)
      const contract = employment.find((e) => e.contractId === contractId)
      if (contract === undefined || !isRecord(contract.terms)
        || contract.studioId !== row.issuerStudioId || contract.terms.talentId !== row.beneficiaryPersonId) {
        return fail(`${at}.contractId does not name this person's employment at the issuing studio`)
      }
      if (due > Number(contract.terms.endWeekExclusive)) return fail(`${at}.contractId ends before the promised window`)
      const contractStart = nonnegative(contract.terms.startWeek, `${at}.contractId start week`)
      if (contractStart > currentWeek) return fail(`${at}.contractId has not started in this campaign`)
      if (row.outcome !== null && Number(row.outcomeWeek) < contractStart) {
        return fail(`${at}.outcomeWeek precedes the contract that carried this promise`)
      }
      // Earlier V29 writers retained the submission receipt and admitted a lower
      // window edge before the contract. Read those facts without inventing a
      // historical freeze. New quote/freeze paths enforce both interval edges.
    }

    if (!Array.isArray(row.evidenceRefs)) return fail(`${at}.evidenceRefs is not an array`)
    const evidence = new Set<string>()
    for (const ref of row.evidenceRefs) {
      const id = text(ref, `${at}.evidenceRefs`)
      if (evidence.has(id)) return fail(`${at}.evidenceRefs repeats a first take`)
      evidence.add(id)
      const take = takesById.get(id)
      if (take === undefined || take.studioId !== row.issuerStudioId
        || !qualifyingSlots.some((slot) => take.cast[slot] === row.beneficiaryPersonId)
        || take.week < start || take.week >= due
        || (row.outcomeWeek !== null && take.week > Number(row.outcomeWeek))) {
        return fail(`${at}.evidenceRefs does not name a qualifying first take inside this promise's window`)
      }
    }
    if (evidence.size > progress) return fail(`${at}.evidenceRefs exceeds its recorded progress`)
    promisesById.set(promiseId, row as unknown as ProfessionalPromiseV30)
    if (row.outcome === null) {
      if (row.outcomeWeek !== null) return fail(`${at} has no outcome but names an outcome week`)
      if (row.outcomeCause !== null || row.outcomeEventId !== null) return fail(`${at} has outcome evidence but no outcome`)
      continue
    }
    if (!['SATISFIED', 'BROKEN', 'WAIVED', 'VOIDED'].includes(String(row.outcome))) {
      return fail(`${at}.outcome "${String(row.outcome)}" is not an outcome of this catalogue`)
    }
    if (row.contractId === null) return fail(`${at} is terminal without a committed contract`)
    const outcomeWeek = recordedWeek(row.outcomeWeek, `${at}.outcomeWeek`)
    text(row.outcomeCause, `${at}.outcomeCause`)
    const eventId = text(row.outcomeEventId, `${at}.outcomeEventId`)
    if (outcomeEvents.has(eventId)) return fail(`${at}.outcomeEventId "${eventId}" records a second outcome`)
    outcomeEvents.add(eventId)
    const outcomeReceipt = receiptsById.get(eventId)
    if (outcomeReceipt === undefined || outcomeReceipt.kind !== 'promiseOutcome'
      || outcomeReceipt.talentId !== row.beneficiaryPersonId || outcomeReceipt.studioId !== row.issuerStudioId
      || outcomeReceipt.week !== outcomeWeek) return fail(`${at}.outcomeEventId does not name this promise's own outcome receipt`)
    if (row.outcome === 'SATISFIED' && (progress !== count || evidence.size !== count)) {
      return fail(`${at} is satisfied without the promised number of qualifying first takes`)
    }
    if (row.outcome === 'BROKEN' && progress >= count) return fail(`${at} is broken despite a satisfied predicate`)
  }

  for (let i = 0; i < market.proposals.length; i++) {
    const at = `state.talentMarket.proposals[${String(i)}]`
    const row = record(market.proposals[i], at)
    if (!Array.isArray(row.promises) || row.promises.length > 1) return fail(`${at}.promises must be an array of at most one promise ID`)
    for (const ref of row.promises) {
      const promise = promisesById.get(text(ref, `${at}.promises`))
      if (promise === undefined || promise.issuerStudioId !== row.issuerStudioId
        || promise.beneficiaryPersonId !== row.talentId) return fail(`${at}.promises does not name this proposal's own promise`)
      if (promise.contractId !== null || promise.outcome !== null) return fail(`${at}.promises names an already committed promise`)
    }
  }
}

/**
 * The POSITIVE projection to every version before V29. A world that actually
 * carries a first take or a promise is REFUSED rather than flattened, exactly as
 * `projectTalentMarketPreV28` refuses a case: an envelope that quietly dropped a
 * kept promise would misreport a campaign that honoured one as a campaign that
 * never made it. Lossless exactly when both roots are empty and no proposal
 * carries a promise.
 */
export function projectPromisesPreV29(state: unknown): void {
  if (!isRecord(state)) return
  for (const key of ['firstTakes', 'promises'] as const) {
    const rows = state[key]
    if (Array.isArray(rows) && rows.length > 0) {
      throw new Error(`frozen save projection cannot discard authoritative V29 ${key} (${String(rows.length)} held)`)
    }
  }
  const market = state.talentMarket
  const proposals = isRecord(market) && Array.isArray(market.proposals) ? market.proposals : []
  for (const row of proposals) {
    if (isRecord(row) && Array.isArray(row.promises) && row.promises.length > 0) {
      throw new Error('frozen save projection cannot discard an authoritative V29 promise attached to a proposal')
    }
  }
}
