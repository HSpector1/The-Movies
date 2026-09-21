// ── 629-T: independent behavioral RED for the breakPromisesOnCancel causal-coupling correction ──
//
// Authority: record 628 NEXT628 (b); record 26 §2 (docs/engineering/playability-launch-review/evidence/
// p14b4-20260919/26-live-cutover-implementation-map.md :73-82); plan P14B4-HEADLESS-PLAN.md :237-258
// ("Outcome and bridge boundary"), :331-336 (bound-target remaining count) and :348-355 (immediate
// studio-caused outcome checks use the separate target-specific physical predicate proof, not the offer
// result). Each case names the sentence its expectation derives from.
//
// AUTHORED AGAINST THE LAW, NOT THE OUTPUT. The pre-writer coupling (record 629, promises.ts :753 at
// cb13a457) broke a promise whenever `reclassifyPromise(...).classification === 'IMPOSSIBLE'`. Every RED
// case therefore asserts, BEFORE the cancel, that the quote service refuses with the exact
// NON-target-specific bottleneck the case isolates (a joint reservation, the classless fresh-offer refusal,
// an unsupported family, a class-blind physical bound, or the ORIGINAL count instead of the remaining
// count). A case that later turns GREEN because its premise stopped holding fails at the premise line, not
// at the expectation. The landed coupling (record 630 R1/R2, commit c5a2ecdc; promises.ts :779-796) breaks
// iff the separate exported proof `targetSpecificImpossibility` (:661-667), run on the POST-cancel state
// (actions.ts :599 passes `withoutProduction`), finds `remaining > nMax` for a root whose class mask seats
// the person on the cancelled picture. The 629-T2 cases at the end of this file pin the parts of that law
// the 629-T cases could not separate (remaining >= 2, the window-start clamp, the class-qualified take).
//
// FIXTURES (labeled, disposable): the generated world `p13aGeneratedStudio()` and the real
// signContract / greenlight / setProductionSetupRecipe / assignShootingDirector / scheduleShootingTake /
// tick / cancel / releaseTalent routes. Every promise is a REAL BOUND ROOT installed by the labeled state
// variant `bind`: its `contractId` is read from the person's actual `hollywood.employment` row (never
// invented); its `feasibilityReceipt` is a placeholder no outcome owner reads; the installed state is
// then passed through the live V30 writer (`makeSave` -> validateSaveV30) so only a lawful persisted
// record is tested. No first take, binding, receipt or outcome is invented: first takes come from the
// real 5 -> 4 advance (`took`), outcomes only from `advancePromisesWeek`, `tick` and the action seams.
//
// PAPER (no test): a RIVAL cancellation never reaches this seam. `applyCancel` (actions.ts :567-600) reads
// `state.studio.activeProductions` — the player's slate — and calls `breakPromisesOnCancel` with
// `hollywood.playerStudioId` (:599); rival pictures live under `hollywood.businesses[].productions` and
// no rival code path builds a `{kind:'cancel'}` action. `breakPromisesOnCancel`'s only caller is
// actions.ts :599; `breakPromisesOnTermination`'s only caller is `applyReleaseTalent` (:2637).
//
// QUOTE LAW TRANSCRIBED (promises.ts :352-370 `expectedFirstTakeWeek`, consumed by the offer service
// `promiseFeasibility` :416-427 with `from = max(windowStartWeek, week)`). This is the quote's
// SEAT_CYCLE_WEEKS ESTIMATE, used here only to compute the RED premises (what `reclassifyPromise` says);
// it is NOT the landed cancel bound:
//   - a person's k-th sequential fresh event first-takes at `from + k*SEAT_CYCLE_WEEKS + WEEKS_TO_FIRST_TAKE`
//     (SEAT_CYCLE_WEEKS = TUNING.PRODUCTION_TICKS = 8, WEEKS_TO_FIRST_TAKE = 5);
//   - event 0 may instead be a RUNNING pre-first-take picture the person is seated on inside the class
//     mask: `from + max(1, remainingTicks - 4) + (startTick >= from ? 1 : 0)`.
//   A picture greenlit THIS week (remainingTicks 8, startTick = week) therefore expects its take at
//   week + 5 — the same week as a fresh greenlight — so in the "greenlit this week" shape the cancel
//   does not move the physical clock, only the existing-path count. A picture at remainingTicks 5
//   expects its take at week + 1, so cancelling it moves the clock from week + 1 to week + 5 (case 6c).
//
// LANDED BOUND (record 630 R1; promises.ts :661-667 `targetSpecificImpossibility`), transcribed by
// `hardBound` below and pinned directly in the 629-T2 section:
//   remaining = max(0, count - |qualifyingTakes(state, promise)|); remaining 0 -> null (not judged);
//   t0 = max(windowStartWeek, expectedFirstTakeWeek(state, promise, week, 0));
//   nMax = t0 < due ? ceil((due - t0) / WEEKS_TO_FIRST_TAKE) : 0;   BROKEN iff remaining > nMax.
//   The quote estimate and the hard bound coincide for remaining = 1 (every 629-T pin) and separate at
//   remaining >= 2 (the quote's k = 1 event is from + 13, the hard bound's is t0 + 5): 629-T2 separator.
//   The quote clamps the GREENLIGHT week to the window start (`from`); the hard bound clamps the TAKE
//   week (t0) — a picture greenlit before the window opens may be held at ticks 5 (629-B D1): 629-T2 D1.
//
// CAUSE STRINGS pinned below are DESIGN-OWNED: the cancel cause is the landed :791 literal (byte-identical
// to the pre-writer :756); if a later change renames it, change `CANCEL_CAUSE` here (one line) and record
// the new string.

import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import {
  PROMISE_RULES_VERSION, WEEKS_TO_FIRST_TAKE, advancePromisesWeek, qualifyingTakes, reclassifyPromise,
  targetSpecificImpossibility,
} from '../src/core/promises.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { CastSlot, FirstTakeReceipt, GameState, ProfessionalPromise, PromiseFamily, SegmentId } from '../src/core/types.js'

// ── design-owned strings (promises.ts :736 due, :762 termination, :791 cancel, :793 receipt reason) ──
const CANCEL_CAUSE = 'the studio cancelled the picture this person was cast in, and no path was left'
const DUE_CAUSE = 'the window closed before the promised pictures began filming'
const TERMINATION_CAUSE = 'the studio terminated this contract early, ending the window'
// quote-service NON-target-specific refusal bottlenecks the RED premises isolate (promises.ts :214, :399, :426-427);
// the landed proof reuses the PHYSICAL_BOUND sentence (:666) and none of the other three
const JOINT_RESERVATION = 'promises already made to this person exhaust the window'
const CLASSLESS_REFUSAL = 'a seat-class promise needs its seat class selected (lead, or lead-or-antagonist); without one it is not offered'
const FAMILY_REFUSAL = 'a directing promise is not offered in this slice'
const PHYSICAL_BOUND = 'no filming week inside the window can reach that many pictures'

// ── quote law, transcribed (see header): the offer service's ESTIMATE, used for RED premises only ──
const CYCLE = TUNING.PRODUCTION_TICKS
const W5 = WEEKS_TO_FIRST_TAKE
const freshEventWeek = (from: number, k: number): number => from + k * CYCLE + W5
const runningEventWeek = (from: number, p: { remainingTicks: number; startTick: number }): number =>
  from + Math.max(1, p.remainingTicks - 4) + (p.startTick >= from ? 1 : 0)
/** The QUOTE LAW's N_max once the person's only running picture is gone: fresh events on the
 * SEAT_CYCLE_WEEKS cadence expected strictly before `due` (promiseFeasibility :420-425). This is what the
 * `reclassifyPromise` premises compare `count` against; it is NOT the landed cancel bound (see `hardBound`).
 * It equals the hard bound whenever the relevant count is 1 and undercounts it from 2 upward. */
function quoteNMax(from: number, due: number): number {
  let n = 0
  while (freshEventWeek(from, n) < due) n += 1
  return n
}
// ── landed bound, transcribed (record 630 R1; promises.ts :664-665) ──────────
/** nMax = ceil((due - t0) / WEEKS_TO_FIRST_TAKE) when the earliest take week t0 lies before `due`, else 0. */
const hardBound = (t0: number, due: number): number => (t0 < due ? Math.ceil((due - t0) / W5) : 0)

// ── local helpers (self-contained; nothing imported from another test file) ──
const STAGE_7 = 'facility-soundstage-07'
const SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support']

function signOne(state: GameState, role: 'actor' | 'director' | 'writer' | 'craft', termWeeks = 208): { state: GameState; id: string } {
  let next = state
  for (let i = 0; i < 60; i++) {
    const week = next.market.tick
    const person = hiringMarketIds(next, week).map((id) => next.talent.find((t) => t.id === id)).find((t) => t?.role === role)
    if (person !== undefined) return { state: applyActions(next, [{ kind: 'signContract', talentId: person.id, termWeeks }]), id: person.id }
    next = tick(next)
  }
  throw new Error(`UNEXECUTED premise: no free-agent ${role} found within 60 weeks`)
}
function fundTo(state: GameState, target: number): GameState {
  const delta = target - state.studio.cash
  if (delta === 0) return state
  return {
    ...state,
    studio: { ...state.studio, cash: target },
    ledger: [...state.ledger, { week: state.market.tick, kind: (delta > 0 ? 'studioRevenue' : 'overhead') as 'studioRevenue' | 'overhead', amount: delta, note: '629-T fixture cash bootstrap' }],
  }
}

type Roster = { state: GameState; directorId: string; writerId: string; craftId: string; actors: readonly string[] }
let rosterCache: Roster | undefined
/** Signed roster (director, writer, craft, FOUR actors) with the grand-ballroom set built on stage 7 —
 * the P14B.1 fixture recipe — so a picture can walk to its real first take. Cached once, cloned per use. */
function roster(): Roster {
  if (rosterCache === undefined) {
    let state = p13aGeneratedStudio()
    const director = signOne(state, 'director'); state = director.state
    const writer = signOne(state, 'writer'); state = writer.state
    const craft = signOne(state, 'craft'); state = craft.state
    const actors: string[] = []
    for (let i = 0; i < 4; i++) { const a = signOne(state, 'actor'); state = a.state; actors.push(a.id) }
    state = fundTo(state, 30_000_000)
    const mounted = state.sets.find((s) => s.mountedOn === STAGE_7 && s.status !== 'retired')
    if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
    state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_7 } }])
    for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)
    expect(state.studio.activeProductions).toEqual([])
    expect(state.promises.filter((p) => p.issuerStudioId === state.hollywood!.playerStudioId)).toEqual([])
    rosterCache = { state, directorId: director.id, writerId: writer.id, craftId: craft.id, actors }
  }
  return structuredClone(rosterCache)
}
const player = (state: GameState): string => state.hollywood!.playerStudioId

function greenlightPayload(r: Roster, state: GameState, conceptIndex: number, cast: Record<CastSlot, string>) {
  const concept = state.concepts[conceptIndex]!
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] },
    },
    writerId: r.writerId,
    directorId: r.directorId,
    cast,
    craftIds: [r.craftId],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}
type Greenlit = { state: GameState; productionId: string; week: number }
/** The real `greenlight` door at the current week: remainingTicks 8, startTick = week, no first take. */
function greenlit(r: Roster, state: GameState, cast: Record<CastSlot, string>, conceptIndex = 0): Greenlit {
  const week = state.market.tick
  const next = applyActions(state, [{ kind: 'greenlight', production: greenlightPayload(r, state, conceptIndex, cast) }])
  const production = next.studio.activeProductions.at(-1)!
  expect(production.cast).toEqual(cast)
  expect(production).toMatchObject({ startTick: week, remainingTicks: TUNING.PRODUCTION_TICKS })
  expect(next.firstTakes.some((t) => t.productionId === production.id)).toBe(false)
  return { state: next, productionId: production.id, week }
}
function productionOf(state: GameState, productionId: string) {
  const found = state.studio.activeProductions.find((p) => p.id === productionId)
  assert.ok(found, 'UNEXECUTED premise: the production is not on the player slate')
  return found
}
/** Walk a greenlit picture to remainingTicks 5 (shooting entry) through the real managed workflow. */
function atFive(r: Roster, cast: Record<CastSlot, string>): Greenlit & { greenlightWeek: number } {
  const g = greenlit(r, r.state, cast)
  let state = tick(tick(tick(g.state)))
  const rehearsal = state.operations.workflows.find((w) => w.productionId === g.productionId)
  assert.ok(rehearsal, 'UNEXECUTED premise: no workflow for the greenlit picture')
  expect(rehearsal.phase).toBe('rehearsal')
  state = applyActions(state, [{ kind: 'setProductionSetupRecipe', productionId: g.productionId,
    recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: rehearsal.planRevision }])
  for (let steps = 0; productionOf(state, g.productionId).remainingTicks !== 5; steps++) {
    if (steps >= 40) throw new Error('UNEXECUTED premise: the picture never reached shooting entry within 40 ticks')
    state = tick(state)
  }
  expect(state.firstTakes.some((t) => t.productionId === g.productionId)).toBe(false)
  return { state, productionId: g.productionId, week: state.market.tick, greenlightWeek: g.week }
}
type Took = { state: GameState; productionId: string; greenlightWeek: number; take: FirstTakeReceipt }
const tookCache = new Map<'lead' | 'support', Took>()
/** actors[0] seated `seat` (LEAD by default; SUPPORT for the 629-T2 class-qualified negative) on picture A,
 * walked to its REAL first take (assign director, schedule, tick 5 -> 4). One cached build per seat. */
function took(seat: 'lead' | 'support' = 'lead'): Took {
  let tookCached = tookCache.get(seat)
  if (tookCached === undefined) {
    const r = roster()
    const five = atFive(r, seat === 'lead'
      ? { lead: r.actors[0]!, antagonist: r.actors[1]!, support: r.actors[2]! }
      : { lead: r.actors[1]!, antagonist: r.actors[2]!, support: r.actors[0]! })
    let state = applyActions(five.state, [
      { kind: 'assignShootingDirector', productionId: five.productionId, directorId: r.directorId },
      { kind: 'scheduleShootingTake', productionId: five.productionId },
    ])
    expect(state.operations.workflows.find((w) => w.productionId === five.productionId)!.shootingTask?.status).toBe('scheduled')
    state = tick(state)
    expect(productionOf(state, five.productionId).remainingTicks).toBe(4)
    const takes = state.firstTakes.filter((t) => t.productionId === five.productionId)
    expect(takes).toHaveLength(1)
    const take = takes[0]!
    expect(take).toMatchObject({ studioId: player(state), week: state.market.tick, cast: { [seat]: r.actors[0] } })
    tookCached = { state, productionId: five.productionId, greenlightWeek: five.greenlightWeek, take }
    tookCache.set(seat, tookCached)
  }
  return structuredClone(tookCached)
}

type Predicate = { count: number } | { kind: 'castRoleCount'; count: number; seatClass: 'lead' | 'leadOrAntagonist' }
type BindSpec = { promiseId: string; family: PromiseFamily; predicate: Predicate; beneficiaryPersonId: string; windowStartWeek: number; dueWeekExclusive: number; progress?: number }
/**
 * LABELED STATE VARIANT: install a REAL BOUND OPEN root. `contractId` is the person's actual active
 * employment row at the player studio (looked up, never guessed). The feasibility receipt is a placeholder
 * no outcome owner reads. Callers run `lawful()` on the result so the live V30 validator judges the record.
 */
function bind(state: GameState, spec: BindSpec): GameState {
  const issuerStudioId = player(state)
  const row = state.hollywood!.employment.find((e) => e.terms.talentId === spec.beneficiaryPersonId && e.studioId === issuerStudioId && e.endedWeek === null)
  if (row === undefined) throw new Error(`UNEXECUTED premise: no active employment row for "${spec.beneficiaryPersonId}" at the player studio`)
  if (state.promises.some((p) => p.promiseId === spec.promiseId)) throw new Error(`fixture: promiseId "${spec.promiseId}" already installed`)
  const base = {
    promiseId: spec.promiseId,
    version: PROMISE_RULES_VERSION,
    issuerStudioId,
    beneficiaryPersonId: spec.beneficiaryPersonId,
    windowStartWeek: spec.windowStartWeek,
    dueWeekExclusive: spec.dueWeekExclusive,
    feasibilityReceipt: { classification: 'FRAGILE' as const, bottleneck: '629-T labeled variant receipt (not evaluated by any owner)',
      inputsDigest: '0000000000000000', rulesVersion: PROMISE_RULES_VERSION, week: state.market.tick },
    progress: spec.progress ?? 0,
    evidenceRefs: [],
    outcome: null,
    outcomeWeek: null,
    outcomeCause: null,
    outcomeEventId: null,
    contractId: row.contractId,
  }
  if ('kind' in spec.predicate && spec.family !== 'LEAD_OR_SIGNIFICANT_ROLE_COUNT') throw new Error('fixture: a seat class is legal only on a P2 root')
  const promise: ProfessionalPromise = 'kind' in spec.predicate
    ? { ...base, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: spec.predicate.count, seatClass: spec.predicate.seatClass } }
    : { ...base, family: spec.family, predicate: { count: spec.predicate.count } }
  return { ...state, promises: [...state.promises, promise] }
}
/** The live V30 writer validates the whole state (validateSaveV30); a refusal fails the case with its text. */
function lawful(state: GameState): void {
  expect(makeSave(state).saveVersion).toBe(30)
}
function root(state: GameState, promiseId: string): ProfessionalPromise {
  const rows = state.promises.filter((p) => p.promiseId === promiseId)
  expect(rows).toHaveLength(1)
  return rows[0]!
}
function outcomeReceipts(state: GameState, talentId?: string) {
  return state.talentMarket.receipts.filter((r) => r.kind === 'promiseOutcome' && (talentId === undefined || r.talentId === talentId))
}
/** ONE own `promiseOutcome` receipt per terminal promise (plan :243). */
function ownReceipt(state: GameState, promiseId: string) {
  const promise = root(state, promiseId)
  assert.notEqual(promise.outcomeEventId, null)
  const rows = state.talentMarket.receipts.filter((r) => r.eventId === promise.outcomeEventId)
  expect(rows).toHaveLength(1)
  expect(rows[0]).toMatchObject({ kind: 'promiseOutcome', week: promise.outcomeWeek, talentId: promise.beneficiaryPersonId, studioId: promise.issuerStudioId })
  expect(promise.evidenceRefs).not.toContain(promise.outcomeEventId)
  return rows[0]!
}
function cancel(state: GameState, productionId: string): GameState {
  const next = applyActions(state, [{ kind: 'cancel', productionId }])
  expect(next.studio.activeProductions.some((p) => p.id === productionId)).toBe(false)
  expect(next.market.tick).toBe(state.market.tick)
  return next
}
/** The immediate-cause seam changed NOTHING on the promise root or the receipt log. */
function untouched(before: GameState, after: GameState): void {
  expect(after.promises).toEqual(before.promises)
  expect(after.talentMarket.receipts).toEqual(before.talentMarket.receipts)
}
function advanceTo(state: GameState, week: number): GameState {
  while (state.market.tick < week) state = tick(state)
  return state
}
const tagged = (seatClass: 'lead' | 'leadOrAntagonist', count = 1): Predicate => ({ kind: 'castRoleCount', count, seatClass })
const P2 = 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' as const
const P1 = 'APPEARANCE_COUNT' as const

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T case 1: a joint reservation conflict is not causal proof (plan :249-256; 26 §2 "a joint reservation conflict ... is not target-specific physical impossibility")', () => {
  it('one person, two bound OPEN count-1 promises, seated LEAD on one greenlit picture, one event still reachable after the cancel: NEITHER is BROKEN at the cancel; the due-week owner decides', () => {
    const r = roster()
    const P = r.actors[0]!
    const g = greenlit(r, r.state, { lead: P, antagonist: r.actors[1]!, support: r.actors[2]! })
    const w = g.week
    const due = w + CYCLE // [w, w+8): one fresh event (w+5) reachable after the cancel, a second (w+13) is not
    // paper (transcribed law): nMax after the cancel = 1; X = 1 <= 1 for EACH promise; reserved (the other
    // promise) + X = 2 > 1 — the JOINT bottleneck, not a target-specific one
    expect(quoteNMax(w, due)).toBe(1)
    expect(runningEventWeek(w, productionOf(g.state, g.productionId))).toBe(freshEventWeek(w, 0)) // greenlit this week: the cancel does not move the bound
    let state = bind(g.state, { promiseId: '629-1-p1', family: P1, predicate: { count: 1 }, beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
    state = bind(state, { promiseId: '629-1-p2', family: P2, predicate: tagged('lead'), beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
    lawful(state)
    // RED PREMISE (executed): the current service already refuses BOTH on the joint reservation, which
    // the current coupling would read as causal proof.
    for (const id of ['629-1-p1', '629-1-p2']) {
      expect(reclassifyPromise(state, root(state, id), w)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: JOINT_RESERVATION })
    }
    const cancelled = cancel(state, g.productionId)
    // plan :249-251: "Joint failure of several promises is NOT proof that a particular beneficiary's
    // predicate is impossible"; :255-256: "never break-all or pick a beneficiary loser from a portfolio conflict".
    untouched(state, cancelled)
    // plan :254-255: "Otherwise real takes/due-week evaluation decide outcomes." No take follows, so the
    // due-week owner (advancePromisesWeek inside tick) breaks both AT the due week with the due cause.
    const later = advanceTo(cancelled, due)
    for (const id of ['629-1-p1', '629-1-p2']) {
      expect(root(later, id)).toMatchObject({ outcome: 'BROKEN', outcomeWeek: due, outcomeCause: DUE_CAUSE, progress: 0, evidenceRefs: [] })
      ownReceipt(later, id)
    }
    expect(outcomeReceipts(later, P)).toHaveLength(2)
  })

  it('"either lead claimant could still be kept when one film remains": two beneficiaries each promised ONE lead, both seated on the cancelled picture (lead / antagonist), one film reachable — neither is BROKEN (plan :251-252)', () => {
    const r = roster()
    const A = r.actors[0]!, B = r.actors[1]!
    const g = greenlit(r, r.state, { lead: A, antagonist: B, support: r.actors[2]! })
    const w = g.week
    const due = w + CYCLE
    expect(quoteNMax(w, due)).toBe(1)
    let state = bind(g.state, { promiseId: '629-1b-A', family: P2, predicate: tagged('lead'), beneficiaryPersonId: A, windowStartWeek: w, dueWeekExclusive: due })
    state = bind(state, { promiseId: '629-1b-B', family: P2, predicate: tagged('lead'), beneficiaryPersonId: B, windowStartWeek: w, dueWeekExclusive: due })
    lawful(state)
    const cancelled = cancel(state, g.productionId)
    // A: seated lead (relevant seam), judged target-specifically: one lead event reachable, count 1 -> possible.
    // B: seated antagonist under a 'lead' mask — the cancelled picture could never have served this class,
    //    so the seam is not relevant for B at all (26 §2 "check whether the cancelled picture could satisfy
    //    this class"). That only ONE of A/B can finally be kept is a portfolio fact, not a causal proof.
    untouched(state, cancelled)
    const later = advanceTo(cancelled, due)
    for (const id of ['629-1b-A', '629-1b-B']) {
      expect(root(later, id)).toMatchObject({ outcome: 'BROKEN', outcomeWeek: due, outcomeCause: DUE_CAUSE })
      ownReceipt(later, id)
    }
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T case 2: a bound legacy P2 is never routed through fresh-offer refusal (26 §2 last sentence; plan :257 "legacy generic-cast compatibility")', () => {
  it('legacy count-only P2 (no kind), person seated SUPPORT (generic cast qualifies any seat), wide window: NOT broken at the cancel', () => {
    const r = roster()
    const P = r.actors[0]!
    const g = greenlit(r, r.state, { lead: r.actors[1]!, antagonist: r.actors[2]!, support: P })
    const w = g.week
    const due = w + 20 // two fresh events (w+5, w+13) reachable after the cancel; count 1
    expect(quoteNMax(w, due)).toBe(2)
    const state = bind(g.state, { promiseId: '629-2a', family: P2, predicate: { count: 1 }, beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
    lawful(state)
    // RED PREMISE (executed): the fresh-offer service refuses the classless root before any schedule is read.
    expect(reclassifyPromise(state, root(state, '629-2a'), w)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: CLASSLESS_REFUSAL })
    const cancelled = cancel(state, g.productionId)
    // 26 §2: "Do not route a bound legacy P2 through fresh-offer refusal to decide its outcome."
    untouched(state, cancelled)
  })

  it('legacy count-only P2, person seated SUPPORT, window physically too tight after the cancel (due = week + 2): BROKEN at the cancel — target-specific physical impossibility applies to legacy roots too', () => {
    const r = roster()
    const P = r.actors[0]!
    const g = greenlit(r, r.state, { lead: r.actors[1]!, antagonist: r.actors[2]!, support: P })
    const w = g.week
    const due = w + 2
    expect(quoteNMax(w, due)).toBe(0)
    const state = bind(g.state, { promiseId: '629-2b', family: P2, predicate: { count: 1 }, beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
    lawful(state)
    const cancelled = cancel(state, g.productionId)
    // plan :252-254: "Immediate BROKEN requires TARGET-SPECIFIC hard physical/lawful impossibility after the
    // studio action" — no filming week inside [w, w+2) can reach a first take for this person.
    expect(root(cancelled, '629-2b')).toMatchObject({ outcome: 'BROKEN', outcomeWeek: w, outcomeCause: CANCEL_CAUSE, progress: 0 })
    expect(cancelled.talentMarket.receipts).toHaveLength(state.talentMarket.receipts.length + 1)
    ownReceipt(cancelled, '629-2b')
    lawful(cancelled)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T case 3: an unsupported legacy family is not causal proof (26 §2 "unsupported legacy family ... is not target-specific physical impossibility")', () => {
  it('a bound OPEN DIRECTING_COUNT root is a lawful persisted record (validateSaveV30) and is NOT broken by a cancel with a wide window', () => {
    const r = roster()
    const P = r.actors[0]!
    const g = greenlit(r, r.state, { lead: P, antagonist: r.actors[1]!, support: r.actors[2]! })
    const w = g.week
    const due = w + 20
    const state = bind(g.state, { promiseId: '629-3', family: 'DIRECTING_COUNT', predicate: { count: 1 }, beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
    // BOUNDARY CHECK: the V30 root validator admits every catalogue family with a count-only predicate
    // (promises.ts :969-970, :986-990). A refusal here is a boundary finding, not a proof.
    lawful(state)
    // RED PREMISE (executed): the fresh-offer service refuses the family outright (NOT_OFFERED_IN_B1).
    expect(reclassifyPromise(state, root(state, '629-3'), w)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: FAMILY_REFUSAL })
    expect(quoteNMax(w, due)).toBe(2)
    const cancelled = cancel(state, g.productionId)
    // plan :252-254 (impossibility must be independent of "analysis limits") — a family this slice does not
    // offer is an analysis limit. REVIEWER FLAG: this source reads a legacy count-only root of ANY family
    // with generic-cast semantics (promiseCastSlots :592-597), so the seam is "relevant" for the seated
    // person; even so the wide window leaves two reachable events and no physical proof exists.
    untouched(state, cancelled)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T case 4: the cancelled picture must be able to satisfy THIS class (26 §2 "check whether the cancelled picture could satisfy this class"; plan :246 "relevant ... seams")', () => {
  it.each([
    { seatClass: 'lead' as const, slot: 'support' as const },
    { seatClass: 'leadOrAntagonist' as const, slot: 'support' as const },
  ])('tagged $seatClass P2, person seated $slot on the cancelled picture, due = week + 2: NOT broken at the cancel (no path was removed); the due-week owner breaks it at the due week', ({ seatClass, slot }) => {
    const r = roster()
    const P = r.actors[0]!
    const cast: Record<CastSlot, string> = { lead: r.actors[1]!, antagonist: r.actors[2]!, support: r.actors[3]! }
    cast[slot] = P
    const g = greenlit(r, r.state, cast)
    const w = g.week
    const due = w + 2
    expect(quoteNMax(w, due)).toBe(0)
    const state = bind(g.state, { promiseId: `629-4-${seatClass}-${slot}`, family: P2, predicate: tagged(seatClass), beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
    lawful(state)
    // RED PREMISE (executed): a class-blind physical probe already says IMPOSSIBLE before the cancel.
    expect(reclassifyPromise(state, root(state, `629-4-${seatClass}-${slot}`), w)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: PHYSICAL_BOUND })
    const cancelled = cancel(state, g.productionId)
    // The studio action removed no in-class path: not a relevant seam. plan :254-255: the due-week owner decides.
    untouched(state, cancelled)
    const atDue = advanceTo(cancelled, due)
    expect(root(atDue, `629-4-${seatClass}-${slot}`)).toMatchObject({ outcome: 'BROKEN', outcomeWeek: due, outcomeCause: DUE_CAUSE, progress: 0 })
    ownReceipt(atDue, `629-4-${seatClass}-${slot}`)
  })

  it('tagged leadOrAntagonist P2, person seated ANTAGONIST (in class), due = week + 2: a relevant seam, judged physically -> BROKEN at the cancel', () => {
    const r = roster()
    const P = r.actors[0]!
    const g = greenlit(r, r.state, { lead: r.actors[1]!, antagonist: P, support: r.actors[2]! })
    const w = g.week
    const due = w + 2
    expect(quoteNMax(w, due)).toBe(0)
    const state = bind(g.state, { promiseId: '629-4c', family: P2, predicate: tagged('leadOrAntagonist'), beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
    lawful(state)
    const cancelled = cancel(state, g.productionId)
    expect(root(cancelled, '629-4c')).toMatchObject({ outcome: 'BROKEN', outcomeWeek: w, outcomeCause: CANCEL_CAUSE })
    ownReceipt(cancelled, '629-4c')
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T case 5: the remaining count uses ACTUAL class-qualified takes (plan :331-334)', () => {
  function countTwoAfterOneTake(stale: boolean) {
    const t = took() // actors[0] LEAD on A; A's real first take is recorded this week
    const r = roster()
    const P = r.actors[0]!
    const w = t.state.market.tick
    expect(t.take.week).toBe(w)
    const due = w + CYCLE // after cancelling B exactly ONE more fresh event (w+5) is reachable
    const id = stale ? '629-5-stale' : '629-5'
    let state = bind(t.state, { promiseId: id, family: P2, predicate: tagged('lead', 2), beneficiaryPersonId: P, windowStartWeek: t.greenlightWeek, dueWeekExclusive: due })
    // the ONE real class-qualified take (lead seat, exact issuer, inside the half-open window)
    expect(qualifyingTakes(state, root(state, id)).map((x) => x.eventId)).toEqual([t.take.eventId])
    if (!stale) {
      state = advancePromisesWeek(state) // the real progress owner writes 1 (count 2: no outcome)
      expect(root(state, id)).toMatchObject({ progress: 1, outcome: null, evidenceRefs: [] })
    } else {
      expect(root(state, id).progress).toBe(0) // STALE counter: the take exists, the field was never refreshed
    }
    lawful(state)
    // first take THEN cancel of A: immune (plan :244) — needed to free the person for B
    const afterA = cancel(state, t.productionId)
    untouched(state, afterA)
    // B: the person seated LEAD on a second, pre-first-take picture, greenlit this week
    const b = greenlit(r, afterA, { lead: P, antagonist: r.actors[1]!, support: r.actors[2]! }, 1)
    expect(b.week).toBe(w)
    return { state: b.state, productionId: b.productionId, id, w, due }
  }

  it('count-2 tagged lead P2, ONE real qualifying take on A (progress 1), seated LEAD on pre-first-take B, one more event reachable: NOT broken when B is cancelled', () => {
    const { state, productionId, id, w, due } = countTwoAfterOneTake(false)
    // paper: nMax = 1 (before AND after the cancel: B greenlit this week expects w+5, as does a fresh
    // greenlight), original count 2 > 1, REMAINING = 2 - 1 = 1 <= 1.
    expect(quoteNMax(w, due)).toBe(1)
    expect(runningEventWeek(w, productionOf(state, productionId))).toBe(freshEventWeek(w, 0))
    // RED PREMISE (executed, pre-cancel): the service feeds the ORIGINAL count into the physical bound.
    expect(reclassifyPromise(state, root(state, id), w)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: PHYSICAL_BOUND })
    lawful(state)
    const cancelled = cancel(state, productionId)
    // plan :331-334: "remaining X is count minus ACTUAL class-qualified distinct first takes ... never blindly
    // use the original total"
    untouched(state, cancelled)
  })

  it('stale progress counter (0) while the real take exists: still NOT broken — the proof reads qualifyingTakes, not progress', () => {
    const { state, productionId, id, w } = countTwoAfterOneTake(true)
    expect(root(state, id).progress).toBe(0)
    expect(qualifyingTakes(state, root(state, id))).toHaveLength(1)
    expect(reclassifyPromise(state, root(state, id), w)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: PHYSICAL_BOUND })
    const cancelled = cancel(state, productionId)
    // plan :333: "never ... trust a stale progress counter"
    untouched(state, cancelled)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T case 6: target-specific physical impossibility still breaks at the cancel (plan :252-254)', () => {
  it.each([
    { label: 'tagged lead P2', family: P2, predicate: tagged('lead') },
    { label: 'P1 APPEARANCE_COUNT', family: P1, predicate: { count: 1 } as Predicate },
  ])('$label count-1, person LEAD on the only pre-first-take picture, due = week + 2: BROKEN at the cancel with ONE own receipt, idempotent under a following owner pass and tick', ({ label, family, predicate }) => {
    const r = roster()
    const P = r.actors[0]!
    const g = greenlit(r, r.state, { lead: P, antagonist: r.actors[1]!, support: r.actors[2]! })
    const w = g.week
    const due = w + 2
    expect(quoteNMax(w, due)).toBe(0)
    const id = `629-6-${label}`
    const state = bind(g.state, { promiseId: id, family, predicate, beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
    lawful(state)
    expect(reclassifyPromise(state, root(state, id), w)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: PHYSICAL_BOUND })
    const cancelled = cancel(state, g.productionId)
    const broken = root(cancelled, id)
    expect(broken).toMatchObject({ outcome: 'BROKEN', outcomeWeek: w, outcomeCause: CANCEL_CAUSE, progress: 0, evidenceRefs: [] })
    expect(cancelled.talentMarket.receipts).toHaveLength(state.talentMarket.receipts.length + 1)
    expect(cancelled.talentMarket.receipts.slice(0, -1)).toEqual(state.talentMarket.receipts)
    const receipt = ownReceipt(cancelled, id)
    expect(receipt).toMatchObject({ reasons: ['a promise to this person was broken by a cancelled picture'] })
    lawful(cancelled)
    // idempotent: the owner pass on the same week and the next real tick add no second outcome or receipt
    const sameWeek = advancePromisesWeek(advancePromisesWeek(cancelled))
    expect(root(sameWeek, id)).toEqual(broken)
    expect(sameWeek.talentMarket.receipts).toEqual(cancelled.talentMarket.receipts)
    const nextWeek = tick(cancelled)
    expect(root(nextWeek, id)).toEqual(broken)
    expect(outcomeReceipts(nextWeek, P)).toEqual(outcomeReceipts(cancelled, P))
  })

  it('differential shape: the picture at remainingTicks 5 COULD have served (take expected week + 1 < due = week + 3) and nothing else can after the cancel — BROKEN at the cancel', () => {
    const r = roster()
    const P = r.actors[0]!
    const five = atFive(r, { lead: P, antagonist: r.actors[1]!, support: r.actors[2]! })
    const w = five.week
    const due = w + 3
    const picture = productionOf(five.state, five.productionId)
    expect(picture.remainingTicks).toBe(5)
    expect(runningEventWeek(w, picture)).toBe(w + 1) // before: the running picture's own clock reaches a take
    expect(quoteNMax(w, due)).toBe(0) // after: a fresh greenlight first-takes at w+5 >= due
    const state = bind(five.state, { promiseId: '629-6c', family: P2, predicate: tagged('lead'), beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
    lawful(state)
    expect(reclassifyPromise(state, root(state, '629-6c'), w).classification).not.toBe('IMPOSSIBLE') // possible before the studio action
    const cancelled = cancel(state, five.productionId)
    expect(reclassifyPromise(cancelled, root(cancelled, '629-6c'), w)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: PHYSICAL_BOUND }) // impossible after it
    expect(root(cancelled, '629-6c')).toMatchObject({ outcome: 'BROKEN', outcomeWeek: w, outcomeCause: CANCEL_CAUSE })
    ownReceipt(cancelled, '629-6c')
    lawful(cancelled)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T case 7: immunity and the other owners are unchanged (plan :244, :256-257)', () => {
  it('first take THEN cancel never un-satisfies (re-pin of tests/p14b4-cast-class-outcomes :488): the real owner SATISFIES at the take; the cancel changes nothing', () => {
    const t = took()
    const r = roster()
    const P = r.actors[0]!
    const w = t.state.market.tick
    let state = bind(t.state, { promiseId: '629-7a', family: P2, predicate: tagged('lead'), beneficiaryPersonId: P, windowStartWeek: t.greenlightWeek, dueWeekExclusive: w + CYCLE })
    state = advancePromisesWeek(state) // the real outcome owner, same week as the take
    const kept = root(state, '629-7a')
    expect(kept).toMatchObject({ outcome: 'SATISFIED', outcomeWeek: w, progress: 1, evidenceRefs: [t.take.eventId] })
    ownReceipt(state, '629-7a')
    lawful(state)
    const cancelled = cancel(state, t.productionId)
    expect(root(cancelled, '629-7a')).toEqual(kept)
    expect(cancelled.firstTakes.find((x) => x.eventId === t.take.eventId)).toEqual(t.take)
    untouched(state, cancelled)
    expect(root(advancePromisesWeek(cancelled), '629-7a')).toEqual(kept)
  })

  it('early termination owner unchanged: releaseTalent breaks every open promise to that person immediately on the real route', () => {
    const r = roster()
    const P = r.actors[3]! // employed, seated nowhere
    const w = r.state.market.tick
    const state = bind(r.state, { promiseId: '629-7b', family: P1, predicate: { count: 1 }, beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: w + 20 })
    lawful(state)
    const released = applyActions(state, [{ kind: 'releaseTalent', talentId: P }])
    expect(root(released, '629-7b')).toMatchObject({ outcome: 'BROKEN', outcomeWeek: w, outcomeCause: TERMINATION_CAUSE })
    ownReceipt(released, '629-7b')
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T case 8: no-change control', () => {
  it('cancelling a picture whose cast holds nobody with a bound OPEN promise leaves state.promises and the receipts byte-identical', () => {
    const r = roster()
    const g = greenlit(r, r.state, { lead: r.actors[0]!, antagonist: r.actors[1]!, support: r.actors[2]! })
    const w = g.week
    // a bound OPEN promise exists — to actors[3], who is NOT in the cast
    const state = bind(g.state, { promiseId: '629-8', family: P1, predicate: { count: 1 }, beneficiaryPersonId: r.actors[3]!, windowStartWeek: w, dueWeekExclusive: w + 2 })
    lawful(state)
    for (const slot of SLOTS) expect(productionOf(state, g.productionId).cast[slot]).not.toBe(r.actors[3])
    const cancelled = cancel(state, g.productionId)
    untouched(state, cancelled)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
// ── 629-T2: extension after the writer landed (record 630 R1/R2 and its "629-T2 follow-ups" 1-5) ──
// Every case below is authored from the landed law sentence it names and computes t0 / nMax / remaining on
// paper next to the real route; the proof runs on the post-cancel state (actions.ts :599), where the person
// sits on no running picture, so expectedFirstTakeWeek(k = 0) = week + 5 in every shape used here.
// ═════════════════════════════════════════════════════════════════════════════
describe('629-T2 case 5N: the remaining count is CLASS-qualified — a SUPPORT take never serves a lead mask (plan :324-326, :331-334; R1 "actual class-qualified distinct first takes")', () => {
  it('count-2 tagged lead P2, the ONE real take on A recorded with the person in SUPPORT, then seated LEAD on pre-first-take B at 30, window [21,38): BROKEN when B is cancelled (remaining 2 > nMax 1)', () => {
    const t = took('support') // actors[0] SUPPORT on A; A's real first take is recorded this week (30)
    const r = roster()
    const P = r.actors[0]!
    const w = t.state.market.tick
    expect(t.take.week).toBe(w)
    expect(t.take.cast.support).toBe(P)
    const due = w + CYCLE
    let state = bind(t.state, { promiseId: '629-5N', family: P2, predicate: tagged('lead', 2), beneficiaryPersonId: P, windowStartWeek: t.greenlightWeek, dueWeekExclusive: due })
    // plan :324-326: the take is real, this issuer, inside the window — and OUTSIDE the lead mask: it does not qualify
    expect(qualifyingTakes(state, root(state, '629-5N'))).toEqual([])
    state = advancePromisesWeek(state) // the real progress owner counts nothing either
    expect(root(state, '629-5N')).toMatchObject({ progress: 0, outcome: null, evidenceRefs: [] })
    lawful(state)
    const afterA = cancel(state, t.productionId) // A already filmed: immune (plan :244), frees the person for B
    untouched(state, afterA)
    const b = greenlit(r, afterA, { lead: P, antagonist: r.actors[1]!, support: r.actors[2]! }, 1)
    expect(b.week).toBe(w)
    lawful(b.state)
    // R1: remaining = 2 - 0 = 2; t0 = max(21, 30 + 5) = 35; nMax = ceil((38 - 35) / 5) = 1; 2 > 1 -> the sentence.
    // Case 5 differs ONLY in the seat of the take on A (lead there: remaining 1 <= 1 -> untouched); a proof that
    // counted takes class-blind would leave this root untouched too.
    expect(hardBound(Math.max(t.greenlightWeek, w + W5), due)).toBe(1)
    expect(targetSpecificImpossibility(b.state, root(b.state, '629-5N'), w)).toBe(PHYSICAL_BOUND) // B greenlit this week: its clock is 35 as well
    const cancelled = cancel(b.state, b.productionId)
    expect(root(cancelled, '629-5N')).toMatchObject({ outcome: 'BROKEN', outcomeWeek: w, outcomeCause: CANCEL_CAUSE, progress: 0, evidenceRefs: [] })
    expect(cancelled.talentMarket.receipts).toHaveLength(b.state.talentMarket.receipts.length + 1)
    ownReceipt(cancelled, '629-5N')
    lawful(cancelled)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T2 separator: the landed bound is the 5-week floor chain t0 + 5k, not the quote\'s SEAT_CYCLE_WEEKS cadence (record 630 R1; 629-B Q2 D2; plan :341-343, :350-351 "a valid hard bound")', () => {
  it('count-2 tagged lead P2, person LEAD on the greenlit-this-week picture, window [21,33): the quote estimate refuses (its nMax 1 < 2) yet the cancel leaves the root untouched (hard nMax 2); the due-week owner breaks it at 33', () => {
    const r = roster()
    const P = r.actors[0]!
    const g = greenlit(r, r.state, { lead: P, antagonist: r.actors[1]!, support: r.actors[2]! })
    const w = g.week
    const due = w + 12
    // quote estimate: k = 0 at 21 + 5 = 26 < 33, k = 1 at 21 + 8 + 5 = 34 >= 33 -> 1.
    // hard bound: t0 = max(21, 26) = 26; nMax = ceil((33 - 26) / 5) = 2; remaining 2 <= 2.
    expect(quoteNMax(w, due)).toBe(1)
    expect(hardBound(w + W5, due)).toBe(2)
    const state = bind(g.state, { promiseId: '629-S', family: P2, predicate: tagged('lead', 2), beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
    lawful(state)
    // PREMISE (executed, pre-cancel): the quote service refuses with the physical sentence (original count 2 > its nMax 1)
    expect(reclassifyPromise(state, root(state, '629-S'), w)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: PHYSICAL_BOUND })
    const cancelled = cancel(state, g.productionId)
    // Under the quote's SEAT_CYCLE_WEEKS cadence this root would be BROKEN here (the pre-writer coupling did exactly
    // that). Under the landed hard bound the lawful path greenlight 21 -> take 26 -> cancel 26 (immune, take kept)
    // -> greenlight 26 -> take 31 < 33 (629-B Q2 D2) still reaches two pictures: untouched.
    untouched(state, cancelled)
    expect(targetSpecificImpossibility(cancelled, root(cancelled, '629-S'), w)).toBeNull()
    // plan :254-255: no greenlight follows, so the due-week owner breaks it at 33 with the due cause
    const atDue = advanceTo(cancelled, due)
    expect(root(atDue, '629-S')).toMatchObject({ outcome: 'BROKEN', outcomeWeek: due, outcomeCause: DUE_CAUSE, progress: 0, evidenceRefs: [] })
    ownReceipt(atDue, '629-S')
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T2 D1: the window start clamps the TAKE week t0, not the greenlight week (record 630 R1 "the window start is a floor because a picture can be held at ticks 5"; 629-B Q2 D1)', () => {
  it('count-1 tagged lead, person LEAD on the picture greenlit at 21, window [23,28): untouched at the cancel (t0 = max(23, 26) = 26 < 28 -> nMax 1); the due-week owner breaks it at 28', () => {
    const r = roster()
    const P = r.actors[0]!
    const g = greenlit(r, r.state, { lead: P, antagonist: r.actors[1]!, support: r.actors[2]! })
    const w = g.week
    const windowStart = w + 2, due = w + 7
    expect(hardBound(Math.max(windowStart, w + W5), due)).toBe(1)
    expect(quoteNMax(windowStart, due)).toBe(0) // the quote clamps the GREENLIGHT week: from = max(23, 21) = 23 -> take 28 >= 28
    const state = bind(g.state, { promiseId: '629-D1', family: P2, predicate: tagged('lead'), beneficiaryPersonId: P, windowStartWeek: windowStart, dueWeekExclusive: due })
    lawful(state)
    // quote estimate before the cancel: the running picture reaches 23 + 4 = 27 < 28, so it is not IMPOSSIBLE ...
    expect(reclassifyPromise(state, root(state, '629-D1'), w).classification).not.toBe('IMPOSSIBLE')
    const cancelled = cancel(state, g.productionId)
    // ... and after it the quote estimate says IMPOSSIBLE (fresh from 23 -> 28 >= 28): the pre-writer coupling, which
    // re-ran the quote on the post-cancel state, BROKE this root. The lawful path greenlight 21 -> take 26 in [23, 28)
    // exists (qualifyingTakes :633-634 admits a take at 26), so the landed bound leaves it to the due-week owner.
    expect(reclassifyPromise(cancelled, root(cancelled, '629-D1'), w)).toMatchObject({ classification: 'IMPOSSIBLE', bottleneck: PHYSICAL_BOUND })
    untouched(state, cancelled)
    expect(targetSpecificImpossibility(cancelled, root(cancelled, '629-D1'), w)).toBeNull()
    const atDue = advanceTo(cancelled, due)
    expect(root(atDue, '629-D1')).toMatchObject({ outcome: 'BROKEN', outcomeWeek: due, outcomeCause: DUE_CAUSE, progress: 0 })
    ownReceipt(atDue, '629-D1')
  })

  it('mirror, window [23,26): t0 = max(23, 26) = 26 >= 26 -> nMax 0 -> BROKEN at the cancel with the cancel cause and ONE own receipt', () => {
    const r = roster()
    const P = r.actors[0]!
    const g = greenlit(r, r.state, { lead: P, antagonist: r.actors[1]!, support: r.actors[2]! })
    const w = g.week
    const windowStart = w + 2, due = w + 5
    expect(hardBound(Math.max(windowStart, w + W5), due)).toBe(0)
    const state = bind(g.state, { promiseId: '629-D1m', family: P2, predicate: tagged('lead'), beneficiaryPersonId: P, windowStartWeek: windowStart, dueWeekExclusive: due })
    lawful(state)
    const cancelled = cancel(state, g.productionId)
    expect(root(cancelled, '629-D1m')).toMatchObject({ outcome: 'BROKEN', outcomeWeek: w, outcomeCause: CANCEL_CAUSE, progress: 0 })
    expect(cancelled.talentMarket.receipts).toHaveLength(state.talentMarket.receipts.length + 1)
    ownReceipt(cancelled, '629-D1m')
    lawful(cancelled)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('629-T2 direct pins on the exported proof (record 630 R1 boundaries; promises.ts :661-667)', () => {
  it('bound tagged lead roots, no running picture at week 21 (t0 = 26): the sentence iff remaining > ceil((due - 26) / 5)', () => {
    const r = roster()
    const P = r.actors[0]!
    const w = r.state.market.tick
    expect(r.state.studio.activeProductions).toEqual([])
    const probe = (id: string, count: number, due: number): string | null => {
      const state = bind(r.state, { promiseId: id, family: P2, predicate: tagged('lead', count), beneficiaryPersonId: P, windowStartWeek: w, dueWeekExclusive: due })
      lawful(state)
      return targetSpecificImpossibility(state, root(state, id), w)
    }
    expect(probe('629-P1', 1, w + 5)).toBe(PHYSICAL_BOUND) // t0 = 26 >= due 26 -> nMax 0 < 1
    expect(probe('629-P2', 1, w + 6)).toBeNull()            // nMax = ceil(1 / 5) = 1 >= 1
    expect(probe('629-P3', 2, w + 10)).toBe(PHYSICAL_BOUND) // nMax = ceil(5 / 5) = 1 < 2
    expect(probe('629-P4', 2, w + 11)).toBeNull()           // nMax = ceil(6 / 5) = 2 >= 2
    for (const [due, n] of [[w + 5, 0], [w + 6, 1], [w + 10, 1], [w + 11, 2]] as const) expect(hardBound(w + W5, due)).toBe(n)
  })

  it('remaining 0 (count 1 with the real qualifying lead take on A) -> null even with due = week + 1: a met predicate belongs to the weekly owner, not the proof', () => {
    const t = took()
    const r = roster()
    const P = r.actors[0]!
    const w = t.state.market.tick
    const state = bind(t.state, { promiseId: '629-P0', family: P2, predicate: tagged('lead'), beneficiaryPersonId: P, windowStartWeek: t.greenlightWeek, dueWeekExclusive: w + 1 })
    lawful(state)
    expect(qualifyingTakes(state, root(state, '629-P0')).map((x) => x.eventId)).toEqual([t.take.eventId])
    expect(targetSpecificImpossibility(state, root(state, '629-P0'), w)).toBeNull()
  })
})
