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
import { TUNING } from './tuning.js'
import type {
  CastSlot, FirstTakeReceipt, GameState, ProfessionalPromise, Production, PromiseClassification,
  PromiseFamily, PromiseFeasibilityReceipt, TalentMarketState,
} from './types.js'

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

/** The rules version stamped on every feasibility receipt: a later law change
 * mints a new version rather than silently re-reading an old receipt. */
export const PROMISE_RULES_VERSION = 1

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
export function promiseDigest(promise: ProfessionalPromise): string {
  return fnv1a64(JSON.stringify([promise.family, promise.predicate.count, promise.windowStartWeek, promise.dueWeekExclusive]))
}

/** The digest of whatever promises a proposal currently carries, resolved LIVE
 * against the promise root. `''` — the empty string — is the no-promise value and
 * is BYTE-PRESERVING: a proposal with no promise digests exactly as it did under
 * V28, so every migrated proposal re-derives its stored digest unchanged. */
export function attachedPromiseDigest(
  state: Pick<GameState, 'promises'>,
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

export type PromiseDraft = {
  family: PromiseFamily
  issuerStudioId: string
  beneficiaryPersonId: string
  predicate: { count: number }
  windowStartWeek: number
  dueWeekExclusive: number
  /** The PROPOSED CONTRACT interval the window must lie inside. */
  startWeek: number
  termWeeks: number
  /** Set when an ALREADY-MINTED promise is re-classified, so the service does not
   * count the promise against itself as an active seat reservation. */
  promiseId?: string
}

const NOT_OFFERED_IN_B1: Partial<Record<PromiseFamily, string>> = {
  LEAD_OR_SIGNIFICANT_ROLE_COUNT: 'a seat-class promise is not offered in this slice',
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
 * take is still ahead — the one path that needs no greenlight either. */
function seatedPreFirstTake(state: GameState, studioId: string, personId: string): readonly Production[] {
  const recorded = new Set(state.firstTakes.map((t) => t.productionId))
  return studioProductions(state, studioId).filter(
    (p) => !recorded.has(p.id) && CAST_SLOTS.some((slot) => p.cast[slot] === personId),
  )
}

/** Companion §4.3.1's "already-active promises … seats those promises reserve
 * inside the same window, subtracted before this promise is classified". */
function reservedByActivePromises(state: GameState, draft: PromiseDraft, from: number): number {
  let reserved = 0
  for (const promise of state.promises) {
    if (promise.outcome !== null) continue
    if (promise.promiseId === draft.promiseId) continue
    if (promise.beneficiaryPersonId !== draft.beneficiaryPersonId) continue
    if (promise.dueWeekExclusive <= from || promise.windowStartWeek >= draft.dueWeekExclusive) continue
    reserved += Math.max(0, promise.predicate.count - promise.progress)
  }
  return reserved
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
    const running = seatedPreFirstTake(state, draft.issuerStudioId, draft.beneficiaryPersonId)
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
  const inputs: readonly unknown[] = [
    draft.family, draft.issuerStudioId, draft.beneficiaryPersonId, X,
    draft.windowStartWeek, draft.dueWeekExclusive, draft.startWeek, draft.termWeeks, week,
  ]
  const refuse = (bottleneck: string): PromiseFeasibilityReceipt => receipt('IMPOSSIBLE', bottleneck, inputs, week)

  const notOffered = NOT_OFFERED_IN_B1[draft.family]
  if (notOffered !== undefined) return refuse(notOffered)
  if (!Number.isInteger(X) || X < 1) return refuse('the promised count must be a whole picture')
  if (draft.dueWeekExclusive <= draft.windowStartWeek) return refuse('the window closes before it opens')
  if (draft.dueWeekExclusive > draft.startWeek + draft.termWeeks) {
    return refuse('the due week falls outside the proposed contract')
  }
  // The engine's OWN seat law, not a P14-invented profession gate: `greenlight`
  // requires role `actor` for every cast slot (actions.ts M16.2), so a person who
  // takes no cast seat has no qualifying event this family could ever count.
  const person = state.talent.find((t) => t.id === draft.beneficiaryPersonId)
  if (person === undefined) return refuse('this person is not in the world')
  if (person.role !== 'actor') return refuse('this person takes no cast seat under the greenlight law')

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

  const existingPath = seatedPreFirstTake(state, draft.issuerStudioId, draft.beneficiaryPersonId).length
    + unproducedScripts(state, draft.issuerStudioId)
    + (stockGreenlightAvailable(state, draft.issuerStudioId) ? 1 : 0)
  const lastEventWeek = expectedFirstTakeWeek(state, draft, from, reserved + X - 1)

  if (X > nMax - promiseBuffer(nMax)) {
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
  predicate: { count: number }
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
  const promise: ProfessionalPromise = {
    promiseId: `promise-${String(state.promises.length)}`,
    family: draft.family,
    version: PROMISE_RULES_VERSION,
    issuerStudioId,
    beneficiaryPersonId: talentId,
    predicate: { count: draft.predicate.count },
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

function qualifyingTakes(state: GameState, promise: ProfessionalPromise): readonly FirstTakeReceipt[] {
  return state.firstTakes.filter((take) =>
    take.studioId === promise.issuerStudioId &&
    take.week >= promise.windowStartWeek && take.week < promise.dueWeekExclusive &&
    CAST_SLOTS.some((slot) => take.cast[slot] === promise.beneficiaryPersonId))
}

function settle(
  state: GameState,
  promise: ProfessionalPromise,
  next: Partial<ProfessionalPromise>,
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
 * in-state ordinal id; every promise names an entered studio, carries a bounded
 * predicate and progress, and is terminal at most once. Outcome receipts are
 * IDEMPOTENT BY ID: no promise may name two outcome events.
 */
export function validatePromiseRoots(state: unknown): void {
  const fail = (message: string): never => {
    throw new Error(`validateSaveV29: ${message}`)
  }
  if (!isRecord(state)) return fail('state is not a plain object')
  const takes = state.firstTakes
  const promises = state.promises
  if (!Array.isArray(takes)) return fail('state.firstTakes is not an array')
  if (!Array.isArray(promises)) return fail('state.promises is not an array')

  const hollywood = isRecord(state.hollywood) ? state.hollywood : null
  const identities = hollywood !== null && Array.isArray(hollywood.identities) ? hollywood.identities : []
  const entered = new Set(identities
    .filter((s): s is Record<string, unknown> => isRecord(s) && s.enteredWeek !== null)
    .map((s) => String(s.studioId)))

  const seenProduction = new Set<string>()
  for (let i = 0; i < takes.length; i++) {
    const row = takes[i]
    const at = `state.firstTakes[${String(i)}]`
    if (!isRecord(row)) return fail(`${at} is not a plain object`)
    if (row.eventId !== `first-take-event-${String(i)}`) return fail(`${at}.eventId is not this root's ordinal id`)
    if (!Number.isInteger(row.week) || (row.week as number) < 0) return fail(`${at}.week is not a campaign week`)
    const productionId = String(row.productionId)
    if (seenProduction.has(productionId)) return fail(`${at} records a second first take for production "${productionId}"`)
    seenProduction.add(productionId)
    if (entered.size > 0 && !entered.has(String(row.studioId))) {
      return fail(`${at}.studioId "${String(row.studioId)}" is not an entered studio of this world`)
    }
    if (!isRecord(row.cast)) return fail(`${at}.cast is not a plain object`)
    for (const slot of CAST_SLOTS) if (typeof row.cast[slot] !== 'string') return fail(`${at}.cast.${slot} is missing`)
  }

  const seenPromise = new Set<string>()
  const outcomeEvents = new Set<string>()
  for (let i = 0; i < promises.length; i++) {
    const row = promises[i]
    const at = `state.promises[${String(i)}]`
    if (!isRecord(row)) return fail(`${at} is not a plain object`)
    const promiseId = String(row.promiseId)
    if (seenPromise.has(promiseId)) return fail(`${at}.promiseId "${promiseId}" is recorded twice`)
    seenPromise.add(promiseId)
    if (entered.size > 0 && !entered.has(String(row.issuerStudioId))) {
      return fail(`${at}.issuerStudioId "${String(row.issuerStudioId)}" is not an entered studio of this world`)
    }
    if (!isRecord(row.predicate) || !Number.isInteger(row.predicate.count) || (row.predicate.count as number) < 1) {
      return fail(`${at}.predicate.count must be a whole picture`)
    }
    if (!Number.isInteger(row.progress) || (row.progress as number) < 0 || (row.progress as number) > (row.predicate.count as number)) {
      return fail(`${at}.progress is outside its own predicate`)
    }
    if ((row.dueWeekExclusive as number) <= (row.windowStartWeek as number)) return fail(`${at} closes before it opens`)
    if (row.outcome === null) {
      if (row.outcomeWeek !== null) return fail(`${at} has no outcome but names an outcome week`)
      continue
    }
    if (!['SATISFIED', 'BROKEN', 'WAIVED', 'VOIDED'].includes(String(row.outcome))) {
      return fail(`${at}.outcome "${String(row.outcome)}" is not an outcome of this catalogue`)
    }
    if (!Number.isInteger(row.outcomeWeek)) return fail(`${at} is terminal but names no outcome week`)
    const eventId = row.outcomeEventId
    if (eventId !== null) {
      if (outcomeEvents.has(String(eventId))) return fail(`${at}.outcomeEventId "${String(eventId)}" records a second outcome`)
      outcomeEvents.add(String(eventId))
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
