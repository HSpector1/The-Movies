// ── P14A.1 — typed decline reasons (tie exhausted / all proposals dropped) ──
//
// Requirement source: docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md
// §2.1.7, line 104 ("Reservation…"): "Proposals that fail reservation, legality
// or affordability at freeze are dropped with typed reasons before ranking."
// And line 120 (the tie order): "…then by earliest submission week, then by
// incumbent-if-present, then decline-all. Reasons are the descriptors won
// (…), ordering-only."
//
// Diagnosis: docs/engineering/playability-launch-review/evidence/p14a1-20260918/
// 14-settlement-decline-diagnosis.txt (356 lines; seed p13b-s8-bridge-probe-01,
// week 208). NOTHING IS DROPPED on that probe — all 96 rival proposals across
// the 24 cases pass every survivesFreeze predicate with multi-million headroom;
// the 13 declines are `chooseProposal`'s terminal decline-all reached with a
// FULL LEGAL SURVIVOR SET, because `rivalPremiumTier` discriminates on two bits
// so non-incumbent challengers submitted at the same week share exact
// descriptor vectors the tie ladder cannot separate. `closeCase` nonetheless
// stamps every decline — a tie exhaustion or an actual drop, alike — with the
// fixed text "no proposal cleared this person's reservation", which is FALSE
// for a tie exhaustion (nothing failed reservation) and uninformative for a
// drop (no predicate named). Companion §2.1.7 line 104 requires typed reasons.
//
// COORDINATOR RULING (pinned exactly, per the assigning instruction): a
// declined case's `reason` is one of two typed codes —
//   'tie exhausted'        — a full legal survivor set; the §2.1.7 tie order
//                             ran out (chooseProposal returned null with
//                             survivors.length > 0).
//   'all proposals dropped' — every submitted proposal failed a freeze
//                             predicate before ranking (survivors.length === 0
//                             with submitted.length > 0).
// The decline receipt's `reasons[]`:
//   - for a tie: exactly ONE sentence naming the number of tied proposals,
//     containing neither "reservation" nor any amount.
//   - for drops: exactly one sentence PER dropped proposal, naming the issuing
//     studio and its predicate, from a typed vocabulary (not entered;
//     committed elsewhere; start week no longer matches; terms changed since
//     submission; below the ask; could not fund the signing bonus; no seat
//     open for the role — `FreezeDrop`, `src/core/talentMarket.ts`).
// The exact sentence WORDING is CANDIDATE (not pinned by the coordinator);
// this file pins only: the count, the studio's identification (studioId or
// its public display name — the coordinator did not choose between them),
// the word "reservation" absent (unless the predicate is the ask), and the
// predicate keyword present ("bonus" for affordability, "seat" for the rival
// seat budget).
//
// LANDED SINCE THIS FILE WAS FIRST WRITTEN (`1f3fcd6`): the rival seat budget
// (`daaf95f`, plan P14A.1 T2 log, evidence
// p14a1-20260918/20-seat-budget-measurements.txt / 20-seat-budget-suites.txt)
// added a SEVENTH `FreezeDrop`, `noSeatForRole`: a rival proposal is dropped
// at freeze when the issuer has no seat for the subject's role at the
// decision week. `survivesFreeze` checks it BEFORE reservation/affordability
// (`src/core/talentMarket.ts` ≈936-960), so a rival that is genuinely full at
// the decision week is seat-dropped before the tie ladder or the bonus check
// ever runs for it.
//
// THREE-CONFLICT ADJUDICATION (coordinator, cited by the assigning
// instruction verbatim): "`p14a1-decline-reasons` A/B hand-submit a rival
// challenge on the player's week-52 actor and every founding rival is full
// through 52, so both are seat-dropped before the tie/affordability they
// test — re-expressed with a seat-free issuer (construction and premises
// declared by the test-author; the claims unchanged)." This re-expression
// (test-author, P14A.1 T2, second pass) is that work. Both cases' underlying
// CLAIMS (a genuine tie exhaustion; a genuine affordability drop) are
// unchanged from the original file; only the fixture construction moves.
//
// ── CASE A: SEARCHED, NOT SATISFIED, CONVERTED TO it.todo (coordinator
// ruling, test-author; premise declared, not a silent weakening) ──────────
//
// COORDINATOR RULING (pinned exactly): "the claim stands and is NOT
// weakened, but a permanently failing case cannot enter the matched pass";
// converted to `it.todo(...)` (the `tests/bridge-p13b-s6-cancellation.test.ts`
// precedent — a real `it` whose body is retained as the SECOND argument to
// `it.todo(name, fn)`, which vitest accepts and never executes, so every
// helper the body calls (`submitProposal`, `closestStandingRivalPair`,
// `standingMean`, `STANDING_BAND_TOLERANCE`) stays referenced and
// `noUnusedLocals` stays clean — confirmed empirically with a disposable
// `tests/tmp-todo-check.test.ts` probe before editing this file: a thrown,
// failing body under `it.todo` reports "1 todo", never runs, never fails).
// The tie-exhausted typed reason was last exercised GREEN at `b3ad486`
// (before the seat budget `daaf95f` landed) and is a recorded COVERAGE
// LIMIT, not a defect — follow-up (not built here): construct it under the
// final law with three computed cash drains at a synchronized expiry, so
// two rivals lose their own EXPENSIVE people (freeing a seat each, the same
// mechanism Case B below uses) and then tie with each other on a CHEAPER
// third subject neither has a seat conflict over.
//
// The companion instruction's preferred constructions, in order, and what was
// found for each (disposable `npx vite-node` probes under the session
// scratchpad throughout — never committed, deleted after use):
//
// (i) NATURAL: searched for two ENTERED rivals, tied in Standing (within the
//     D6 band, `STANDING_BAND_TOLERANCE`), BOTH with an open seat for the
//     SAME role at some decision week, BOTH still solvent enough to submit
//     and settle an affordable tier-1.00 proposal for a modest-fame actor.
//     Measured across the default seed, 'p13-public-commercial-adoption' and
//     >90 additional seeded probes (`p14a1-dr-search-0..159`) at weeks
//     196-400: whenever two rivals are BOTH short the same role, they are
//     also the seed's financially weak pair (e.g. seed
//     'p14a1-dr-search-56': r01/r02 both short one actor seat at week
//     208-209, Standing diff 2.33 — WITHIN tolerance — cash 588,835 /
//     1,168,322; submitting a tier-1.00 proposal for the CHEAPEST available
//     actor (fame 11.6, not the first-found fame-46.3 one) STILL drops both
//     for "could not fund the signing bonus" — the operating RESERVE alone
//     (`rivalOperatingReserve`, independent of the specific bonus) already
//     exceeds their cash). This is not a coincidence: under the LANDED seat
//     budget, own-person cases settle first in the fixed processing order
//     (plan P14A.1 T2 log, the seat-budget "OPEN product consequence"), so a
//     rival only shows up short a seat when it FAILED to defend its own
//     incumbent — and failing that defense is itself typically a symptom of
//     being the seed's cash-weak studio. No naturally-occurring pair of
//     mutually solvent, close-Standing, same-role-short rivals was found.
// (ii) CONSTRUCTED (a declared copy-on-write edit): measured directly (see
//     Case B below for the full mechanics) that ending an employee's row or
//     lowering `terms.endWeekExclusive` while leaving the row in
//     `activeEmploymentOrdinals` does NOT survive to the decision week —
//     `staff()` (`src/core/hollywoodTick.ts`, `HOLLYWOOD_DECISION_WEEKS: 1`)
//     runs every week for every entered rival, in the SAME tick as market
//     settlement and BEFORE it, and either (a) auto-RENEWS the row the
//     moment its renewal window opens (the retention loop, unless the
//     employee is itself an open market-case subject — the ONLY protection
//     the engine has), or (b) if the row is fully removed from
//     `activeEmploymentOrdinals`, SYNTHESIZES a brand-new hire for the role
//     deficit unconditionally, subject only to affordability. Confirmed
//     empirically on three timings (edit at week 5, at week 40, and
//     immediately before the settling tick at week 51): the seat is back to
//     full within one week every time the rival can afford a hire, and
//     drops as low as $0 the SAME way construction (i) does when it can't.
//     Making the rival's OWN role-slot genuinely protected the way a real
//     founding-cohort person is (via an open market case of its own,
//     resolving without the studio winning it back) is a SECOND, nested,
//     independently-resolved market case per rival — materially larger than
//     "a declared copy-on-write edit", and is not built here.
// Given (i) and (ii) both fail, per the assigning instruction: the case is
// left AS ORIGINALLY WRITTEN (same seed, same `closestStandingRivalPair`
// construction, same 'tie exhausted' claim, UNCHANGED and UNWEAKENED) and is
// EXPECTED TO FAIL against current law — `expected 'all proposals dropped'
// to be 'tie exhausted'` — because on the default seed both members of the
// closest Standing pair are full through week 208 and are seat-dropped
// before the tie ladder ever runs. This is the named obstacle, not a defect
// in the seat-budget law: the assigning instruction's own "OPEN product
// consequence" already records that challenger proposals almost always
// seat-drop at a synchronized expiry.
//
// ── CASE B: RE-EXPRESSED, construction (i)/(ii) HYBRID (declared) ─────────
//
// Reuses seed 'p13-public-commercial-adoption' and decision week 208 — the
// SAME synchronized founding-cohort expiry `tests/p14a1-seat-budget.test.ts`
// case A exercises — so the player's subject case is decided in the SAME
// weekly pass as the 24 native cases. Measured fresh: at week 208 every
// ENTERED rival's OWN same-role row also ends at week 208, so
// `rivalProposalTrigger` branch (b) ("holds a same-role contract ending at or
// before the subject's effective week") fires for ALL FOUR automatically —
// no manual `submitProposal` call is needed or made. ONE declared
// copy-on-write edit, applied to the FIRST entered rival (the same
// non-hardcoded selection the file's original case B used — no studio suffix
// named), immediately before the settling tick (week 207): its cash is
// drained to 0, the same induced-premise idiom `tests/p14a1-settlement.test.ts`
// uses for induced fame drift. Measured fresh (confirmed symmetric across all
// four entered rivals — draining any one produces the identical shape): this
// single edit ALSO causes that rival to fail its own six incumbent defenses
// in the SAME pass (no affordable signing bonus, no winner — those six seats
// simply lapse), so by the time our subject's case is evaluated the drained
// rival genuinely has no held seat for the role (passes `noSeatForRole`) and
// THEN fails on affordability for our subject's bonus specifically — while
// every OTHER entered rival, still solvent and having just defended its own
// six seats, is seat-dropped. The seat-freedom and the affordability failure
// are therefore not two independent premises but one declared, causally
// connected consequence of a single edit — named here, not hidden. The
// underlying CLAIM (a rival that has room for one more seat still gets
// declined on affordability, never on "reservation") is exactly the file's
// original claim.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import { submitProposal, caseForTalent } from '../src/core/talentMarket.js'

const STANDING_BAND_TOLERANCE = 5 // talentMarket.ts D6 band edge, named not imported (private const)

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

function standingMean(s: { audienceAwareness: number; industryPrestige: number; commercialConfidence: number }): number {
  return (s.audienceAwareness + s.industryPrestige + s.commercialConfidence) / 3
}

/** The two entered rivals whose Standing means are closest — the tightest
 * natural D6 band tie available on this seed at this week (see file header
 * PREMISE). Throws loud if no pair actually ties within tolerance: a faulty
 * premise must break the scenario, not silently mis-score it. */
function closestStandingRivalPair(state: GameState, week: number): [string, string] {
  const hollywood = state.hollywood!
  const entered = hollywood.identities.filter((s) => s.role === 'rival' && s.enteredWeek !== null && s.enteredWeek <= week)
  const withStanding = entered
    .map((s) => ({ studioId: s.studioId, mean: standingMean(hollywood.businesses.find((b) => b.studioId === s.studioId)!.standing) }))
    .sort((a, b) => a.mean - b.mean)
  let best: { a: string; b: string; diff: number } | null = null
  for (let i = 0; i < withStanding.length - 1; i++) {
    const diff = withStanding[i + 1]!.mean - withStanding[i]!.mean
    if (best === null || diff < best.diff) best = { a: withStanding[i]!.studioId, b: withStanding[i + 1]!.studioId, diff }
  }
  if (best === null || best.diff > STANDING_BAND_TOLERANCE) {
    throw new Error(`fixture premise failed: no two entered rivals tie Standing within ${STANDING_BAND_TOLERANCE} on this seed at week ${week}`)
  }
  return [best.a, best.b]
}

function drainCash(state: GameState, studioId: string): GameState {
  const hollywood = state.hollywood!
  return {
    ...state,
    hollywood: {
      ...hollywood,
      businesses: hollywood.businesses.map((b) => (b.studioId === studioId ? { ...b, account: { ...b.account, cash: 0 } } : b)),
    },
  }
}

type TalentMarketRoot = {
  cases: { talentId: string; outcome: string | null; reason: string | null }[]
  receipts: { kind: string; talentId: string; studioId: string | null; reasons: readonly string[] }[]
}
function marketOf(state: GameState): TalentMarketRoot {
  return (state as unknown as { talentMarket: TalentMarketRoot }).talentMarket
}

describe('P14A.1: typed decline reasons', () => {
  it.todo('A. tie exhaustion: two entered rivals with identical material terms and tier, tied Standing band → reason "tie exhausted", one order-only sentence naming the tied count, never "reservation" — UNCONSTRUCTIBLE under the seat law with staff() refilling every freed seat in the same tick before the freeze: no pair of entered rivals is simultaneously seat-free, solvent and Standing-tied on any of >90 probed seeds; last exercised GREEN at b3ad486 before the seat budget landed — recorded coverage limit; follow-up: three computed cash drains at a synchronized expiry so two rivals lose their own expensive people and tie on a cheaper third subject', () => {
    // NOT SATISFIED under the landed seat budget on this construction — see
    // the file header "CASE A: SEARCHED, NOT SATISFIED" for the searched
    // alternatives and the named obstacle. Left unweakened: both rivals in
    // the closest Standing pair are full through week 208 on this seed, so
    // they are seat-dropped (kase.reason 'all proposals dropped') before the
    // tie ladder this case targets ever runs. Body retained, never executed
    // under it.todo (coordinator ruling) — kept exactly as originally
    // written so the claim and its would-be assertions stay legible for the
    // follow-up construction.
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const at40 = advanceTo(signed, 40)
    const [rivalA, rivalB] = closestStandingRivalPair(at40, 40)

    // Both proposals: identical material terms (52 weeks) and identical tier
    // (1.0, the floor) — every D1/D2/D7 band ties by construction; D6 ties by
    // the premise above. Neither is the incumbent (the player is).
    let state = submitProposal(at40, { talentId, issuerStudioId: rivalA, termWeeks: 52, premiumTier: 1.0 })
    state = submitProposal(state, { talentId, issuerStudioId: rivalB, termWeeks: 52, premiumTier: 1.0 })
    expect(caseForTalent(state, talentId, state.market.tick)!.status).not.toBe('settled')

    state = advanceTo(state, 51)
    const preSettlement = state.contracts.find((c) => c.talentId === talentId)!
    expect(preSettlement.endWeekExclusive).toBe(52) // original contract, unrenewed, one week before decision

    state = tick(state) // market.tick 51 -> 52, the decision week: settlement runs
    expect(state.market.tick).toBe(52)

    const settledView = caseForTalent(state, talentId, state.market.tick)!
    expect(settledView.status).toBe('declined')

    const kase = marketOf(state).cases.find((c) => c.talentId === talentId)!
    expect(kase.outcome).toBe('declined')
    expect(kase.reason).toBe('tie exhausted') // RED, expected: see NOT SATISFIED note above

    const declineReceipts = marketOf(state).receipts.filter((r) => r.talentId === talentId && r.kind === 'declined')
    expect(declineReceipts.length).toBe(1)
    const reasons = declineReceipts[0]!.reasons
    expect(reasons.length).toBe(1) // exactly one sentence for a tie, not one per proposal
    expect(reasons[0]).toContain('2') // the tied count
    expect(reasons[0]).not.toMatch(/reservation/i)
    expect(reasons[0]).not.toMatch(/\$|\d{3,}/) // no amount

    // No contract was created for the person at 52 — the case declined.
    expect(state.contracts.find((c) => c.talentId === talentId && c.startWeek === 52)).toBeUndefined()
    expect(state.hollywood!.employment.find((e) => e.terms.talentId === talentId && e.terms.startWeek === 52)).toBeUndefined()
  })

  it('B. all proposals dropped: a single rival proposal fails affordability at the decision week → reason "all proposals dropped", one sentence naming the studio and the bonus predicate, never "reservation"', () => {
    // RE-EXPRESSED (test-author, P14A.1 T2) — see the file header "CASE B"
    // note for the full construction and its declared causal chain.
    const { state: signed, talentId } = signActor(p13aGeneratedStudio('p13-public-commercial-adoption'), 208)
    const preDecision = advanceTo(signed, 207)

    const rivalStudioId = preDecision.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const rivalName = preDecision.hollywood!.identities.find((s) => s.studioId === rivalStudioId)!.name

    let state = drainCash(preDecision, rivalStudioId)
    state = tick(state) // market.tick 207 -> 208, the decision week
    expect(state.market.tick).toBe(208)

    const settledView = caseForTalent(state, talentId, state.market.tick)!
    expect(settledView.status).toBe('declined')

    const kase = marketOf(state).cases.find((c) => c.talentId === talentId)!
    expect(kase.outcome).toBe('declined')
    expect(kase.reason).toBe('all proposals dropped')

    const declineReceipts = marketOf(state).receipts.filter((r) => r.talentId === talentId && r.kind === 'declined')
    expect(declineReceipts.length).toBe(1)
    const reasons = declineReceipts[0]!.reasons
    // Every entered rival's own same-role row also ends at week 208 (the
    // synchronized expiry), so every entered rival auto-proposes (branch b) —
    // four sentences, one per issuer (see file header; the original file's
    // single-proposal premise no longer holds under the seat budget).
    expect(reasons.length).toBe(4)
    const drainedSentence = reasons.find((r) => r.includes(rivalStudioId) || r.includes(rivalName))
    expect(drainedSentence).toBeDefined()
    // Interpretation named (file header): the coordinator did not choose
    // between studioId and display name for "the studio name present".
    expect(drainedSentence).toMatch(/bonus/i) // the affordability predicate keyword
    expect(drainedSentence).not.toMatch(/reservation/i)
    const others = reasons.filter((r) => r !== drainedSentence)
    expect(others).toHaveLength(3)
    for (const sentence of others) expect(sentence.toLowerCase()).toContain('seat') // the other three: genuinely full, seat-dropped

    expect(state.contracts.find((c) => c.talentId === talentId && c.startWeek === 208)).toBeUndefined()
    expect(state.hollywood!.employment.find((e) => e.terms.talentId === talentId && e.terms.startWeek === 208)).toBeUndefined()
  })
})
