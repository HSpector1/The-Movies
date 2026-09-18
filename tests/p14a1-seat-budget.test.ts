// ── P14A.1 — the rival seat budget at freeze ─────────────────────────────────
//
// Law: docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md
// §2.1.4 line 74 ("What makes a rival propose (the trigger)"): "Rival
// maintenance today fills deficits against six fixed seats and never
// proposes... The rival proposes for a case subject when: (a) the subject is
// its own person in the window..., or (b) the rival holds a same-role
// contract ending at or before the subject's effective week, or (c) it has a
// seat deficit at that role at the effective week. A policy-driven 'upgrade'
// that would require the rival to release a current employee needs the Ready
// rival-termination path (§3.6) and is not in Core." §2.1.7 line 104
// ("Reservation"): "Proposals that fail reservation, legality or
// affordability at freeze are dropped with typed reasons before ranking."
//
// Plan: docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md,
// P14A.1 T2 log, the rival-cash-diagnosis rulings and "THE ONE DEFECT, AND
// ITS EXACT SITE" paragraphs (2026-09-18): "the inherited rival insolvency is
// a P13 finance balance fact recorded OPEN for the Owner ...; H2/H3/H5 are
// genuine behaviour under the pinned law ...". "DEFECT (fix in scope, RED
// first): `commitRivalWinner` appends employment rows with NO seat budget and
// nothing releases a surplus, so a rival that wins challenger cases grows
// past `RIVAL_TEAM_ROLES` without bound; at a synchronized expiry ... trigger
// branches (b) and (c) fire for every case in the industry BY THE COMPANION'S
// OWN TEXT ..., so the trigger is law-conformant and the missing piece is the
// legality predicate the companion places at freeze: a proposal is DROPPED
// when the issuer has no seat for that role at the effective week (rows held
// after W plus wins committed earlier in the same fixed-order weekly pass),
// typed reason naming the seat — a seventh `FreezeDrop`; the resulting
// dependence on case order ... is recorded OPEN for the Owner (own-person
// priority is a product choice, not invented here)."
//
// Evidence: docs/engineering/playability-launch-review/evidence/
// p14a1-20260918/18-rival-cash-diagnosis.txt (285 lines). Headline tables
// (seed p13-public-commercial-adoption, founding rivals r01-r04): "208 r01
// ... 12 ... 208 r04 ... 0" and H5 ("challenger wins shuffle people across
// rivals with a bonus each cycle — CONFIRMED, and it is the large roster
// effect: on p13-public-commercial-adoption r01 wins 12 at week 208 (its own
// 6 plus all 6 of r04's) ... By week 420 r01 holds 28 people on a six-seat
// team (RIVAL_TEAM_ROLES) at 267,276/week, having won 42 cases."). "THE ONE
// DEFECT" section: `rivalProposalTrigger` branch (c)
// (src/core/talentMarket.ts ≈582-601) is `heldAtEffectiveWeek < required`
// against `hollywood.activeEmploymentOrdinals` filtered to the same studio
// and role; at a synchronized expiry every one of the studio's own rows has
// `endWeekExclusive` EQUAL to the decision week, so the filter counts zero
// held for every role and branch (c) fires for every case in the industry.
//
// Coordinator ruling (pinned exactly, per the assigning instruction): the
// missing legality predicate is the SEAT BUDGET at freeze — a proposal is
// dropped when the issuing rival has no seat for the subject's role at the
// effective week, counting rows it still holds after W plus the wins it
// committed earlier in the same fixed-order weekly pass; the drop carries a
// typed reason naming the seat (a seventh `FreezeDrop`; CANDIDATE wording —
// this file pins only that the sentence names the studio and contains
// "seat"). The player's own proposals are NOT seat-budgeted (the player's
// roster law is P10's, unchanged — no `RIVAL_TEAM_ROLES`-shaped cap exists on
// the player anywhere in `src/core/employment.ts`/`actions.ts`). Consequence
// pinned: after any settlement week no rival's active roster exceeds
// `RIVAL_TEAM_ROLES` per role.
//
// RED-by-design: `src/core/talentMarket.ts`'s `survivesFreeze` (≈910-926) has
// only six `FreezeDrop` predicates (none of them a seat check) and
// `commitRivalWinner` (≈827-872) appends the winner's employment row
// unconditionally. Cases A and B below are expected to fail against that
// current code; case C is expected to already pass (a guard against
// over-reach of the eventual fix).
//
// PREMISES DECLARED (searched empirically via disposable, uncommitted
// vite-node probes under the session scratchpad — never committed, deleted
// after use):
//   - Case A uses seed 'p13-public-commercial-adoption' (the same seed
//     tests/p13a-rival-adoption.test.ts uses), matching the assigning
//     instruction. Measured directly: at week 208 on this seed all 24 open
//     founding-roster cases SETTLE (0 decline) — r01 wins 12 (its own 6 plus
//     all 6 of r04's), r02 and r03 each win their own 6, r04 loses all 6 and
//     refills its 6 seats via the ordinary `staff()` replacement path by week
//     209 (reason 'replacement', not the poached people). Measured per-role
//     breakdown at week 209: r01 {writer:2, director:2, actor:6, craft:2}
//     (total 12) against caps {writer:1, director:1, actor:3, craft:1}
//     (total 6); r02/r03/r04 each {writer:1, director:1, actor:3, craft:1}
//     (total 6), inside cap. This is the exact "12 against 6" the assigning
//     instruction names.
//   - Because 0 cases decline at week 208 on this seed under the CURRENT
//     (unfixed) code, the "at least one week-208 receipt carries a drop
//     sentence containing 'seat'" assertion below is UNSATISFIABLE right now
//     for a second, independent reason beyond the missing predicate: there is
//     no declined case at all to carry it. Per the assigning instruction
//     ("if after the fix no proposal would need dropping on this seed, say
//     so; the roster bound is the primary claim"): whether the eventual fix
//     produces a genuine seat-drop sentence on THIS seed at week 208 is
//     itself open — it depends on the case-order dependence the coordinator
//     ruling records OPEN (whether r01's own six incumbent-renewal proposals
//     settle, in the fixed processing order, before its six challenge
//     proposals on r04's people, which determines whether r01 still has seat
//     room to legally win any of r04's people or must have all six of those
//     challenge proposals dropped as seat-unavailable). The roster-cap
//     assertions (every rival's active roster ≤ RIVAL_TEAM_ROLES per role and
//     in total) are the PRIMARY claim of this file and hold regardless of how
//     that case-order question resolves.
//   - Case B's "a rival whose actor seats are full through W" premise is
//     picked PROGRAMMATICALLY (never a hardcoded studio suffix), verified
//     against the live state, and the test throws loud if no entered rival
//     satisfies it. Measured on the default seed (p13aGeneratedStudio()) at
//     week 40 for a week-0/52-week player signing (decision week 52): EVERY
//     founding rival already holds its full 3 actor rows past week 52 (each
//     ends at week 208, from the founding roster's single 208-week term), so
//     NO copy-on-write extension of an `endWeekExclusive` was needed — the
//     premise the assigning instruction anticipated as a possible fallback is
//     satisfied naturally on this seed and is named here rather than invented.
//   - Case C signs every signable actor in the week-0 hiring market
//     (`hiringMarketIds`) to exceed `RIVAL_TEAM_ROLES`'s 3-actor cap on the
//     PLAYER's own roster. Measured on the default seed: 6 actor candidates
//     are listed, 2 refuse (D-11.14, already unavailable), 4 sign
//     successfully — more than the 3-actor cap, satisfying the premise. The
//     test throws loud if fewer than 4 (i.e. <= 3) sign, rather than silently
//     running a case that no longer over-caps the player.
//   - Case D (added test-author, P14A.1 T2, guarding the landed
//     `noSeatForRole` predicate at the unit scale): reuses case B's own
//     programmatic "full rival" discovery unchanged, but ALSO submits the
//     player's own dominant proposal on the same subject, so the case
//     SETTLES to the player while the full rival's challenge is still
//     seat-dropped — the disclosure ruling's `dropped[]` on a SETTLED
//     receipt, not only a declined one.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import { submitProposal, caseForTalent } from '../src/core/talentMarket.js'
import { RIVAL_TEAM_ROLES } from '../src/core/hollywoodStartingData.js'

type TalentMarketRoot = {
  cases: { talentId: string; outcome: string | null; reason: string | null; closedWeek: number | null }[]
  receipts: { kind: string; week: number; talentId: string; studioId: string | null; reasons: readonly string[]; dropped: readonly string[] }[]
}
function marketOf(state: GameState): TalentMarketRoot {
  return (state as unknown as { talentMarket: TalentMarketRoot }).talentMarket
}

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

describe('P14A.1: rival seat budget at freeze (commitRivalWinner has no seat cap; rivalProposalTrigger branch (c) fires for everyone at a synchronized expiry)', () => {
  it("A. natural synchronized expiry at week 208 (seed 'p13-public-commercial-adoption'): every rival studio's active roster stays within RIVAL_TEAM_ROLES per role and in total at week 209", () => {
    const state = advanceTo(p13aGeneratedStudio('p13-public-commercial-adoption'), 209)
    const hollywood = state.hollywood!
    const rivals = hollywood.identities.filter((s) => s.role === 'rival' && s.enteredWeek !== null && s.enteredWeek <= 208)
    expect(rivals.length).toBeGreaterThan(0) // sanity: the founding cohort actually entered

    const requiredByRole = new Map<string, number>()
    for (const role of RIVAL_TEAM_ROLES) requiredByRole.set(role, (requiredByRole.get(role) ?? 0) + 1)

    for (const rival of rivals) {
      const active = hollywood.activeEmploymentOrdinals.map((i) => hollywood.employment[i]!).filter((e) => e.studioId === rival.studioId)
      const byRole = new Map<string, number>()
      for (const e of active) {
        const role = state.talent.find((t) => t.id === e.terms.talentId)?.role ?? 'UNKNOWN'
        byRole.set(role, (byRole.get(role) ?? 0) + 1)
      }
      for (const [role, cap] of requiredByRole) {
        // PRIMARY CLAIM. Expected RED now for r01: 6 actor rows held against a cap of 3 (12 total against 6).
        expect(byRole.get(role) ?? 0, `${rival.studioId} role ${role} at week 209`).toBeLessThanOrEqual(cap)
      }
      expect(active.length, `${rival.studioId} total roster at week 209`).toBeLessThanOrEqual(RIVAL_TEAM_ROLES.length)
    }

    // SECONDARY CLAIM, PREMISE CORRECTED (test-author, disclosure ruling
    // postdates this file's original assertion): a seat drop rides the
    // case's `dropped[]` list, never `reasons[]` — `reasons[]` stays the
    // winner's order-only list (never mentions "seat" on this seed: measured
    // 0 of 24 settled receipts' `reasons[]` contain it). All 24 week-208
    // cases SETTLE on this seed (the case-order question the file header
    // names OPEN resolves in favour of settlement here), and `dropped[]`
    // rides the SETTLED receipt too, so this is no longer conditional on an
    // open case existing. Measured fresh (evidence
    // 20-seat-budget-measurements.txt): 36 seat-drop sentences across the 24
    // week-208 receipts.
    const receipts208 = marketOf(state).receipts.filter((r) => r.week === 208)
    const seatDrops = receipts208.filter((r) => r.dropped.some((sentence) => sentence.toLowerCase().includes('seat')))
    expect(seatDrops.length).toBeGreaterThanOrEqual(1)
  })

  it("B. unit-scale: a rival that already holds its full RIVAL_TEAM_ROLES actor seats through the decision week submits a challenge proposal on a player's expiring actor → declined, reason 'all proposals dropped', one drop sentence naming the rival and containing 'seat'; the rival's roster does not grow", () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const at40 = advanceTo(signed, 40)
    const decisionWeek = 52
    const requiredActors = RIVAL_TEAM_ROLES.filter((r) => r === 'actor').length

    // PREMISE (verified programmatically — see file header): the first entered
    // rival that already holds >= requiredActors same-role rows ending AFTER
    // the decision week, i.e. genuinely has no seat for one more actor at W.
    const hollywood = at40.hollywood!
    const fullRival = hollywood.identities.find((s) => {
      if (s.role !== 'rival' || s.enteredWeek === null) return false
      const own = hollywood.activeEmploymentOrdinals.map((i) => hollywood.employment[i]!).filter((e) => e.studioId === s.studioId)
      const heldPastW = own.filter((e) =>
        e.terms.endWeekExclusive > decisionWeek && at40.talent.find((t) => t.id === e.terms.talentId)?.role === 'actor').length
      return heldPastW >= requiredActors
    })
    if (fullRival === undefined) {
      throw new Error('fixture premise failed: no entered rival naturally holds a full actor roster through the decision week on this seed')
    }
    const rivalStudioId = fullRival.studioId
    const rivalName = fullRival.name
    const rosterBefore = hollywood.activeEmploymentOrdinals.map((i) => hollywood.employment[i]!).filter((e) => e.studioId === rivalStudioId).length

    let state = submitProposal(at40, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: 1.0 })
    state = advanceTo(state, 51)
    state = tick(state) // market.tick 51 -> 52, the decision week: settlement runs
    expect(state.market.tick).toBe(52)

    const settledView = caseForTalent(state, talentId, state.market.tick)!
    // RED: currently 'settled' — commitRivalWinner has no seat budget (evidence 18).
    expect(settledView.status).toBe('declined')

    const kase = marketOf(state).cases.find((c) => c.talentId === talentId)!
    expect(kase.outcome).toBe('declined')
    expect(kase.reason).toBe('all proposals dropped')

    const declineReceipts = marketOf(state).receipts.filter((r) => r.talentId === talentId && r.kind === 'declined')
    expect(declineReceipts.length).toBe(1)
    const reasons = declineReceipts[0]!.reasons
    expect(reasons.length).toBe(1) // one proposal submitted, one proposal dropped
    expect(reasons[0].includes(rivalStudioId) || reasons[0].includes(rivalName)).toBe(true)
    expect(reasons[0].toLowerCase()).toContain('seat')

    // The rival's roster did not grow past what it already held.
    const rosterAfter = state.hollywood!.activeEmploymentOrdinals.map((i) => state.hollywood!.employment[i]!).filter((e) => e.studioId === rivalStudioId).length
    expect(rosterAfter).toBe(rosterBefore)

    expect(state.contracts.find((c) => c.talentId === talentId && c.startWeek === 52)).toBeUndefined()
  })

  it('C. the player is NOT seat-budgeted: a dominant incumbent player proposal settles even though the player already holds more actor contracts than RIVAL_TEAM_ROLES\'s 3-actor cap (guard against over-reach of the fix) — GREEN now, must stay GREEN', () => {
    const requiredActors = RIVAL_TEAM_ROLES.filter((r) => r === 'actor').length // 3

    const state0 = p13aGeneratedStudio()
    const candidates = hiringMarketIds(state0, 0)
    const actorCandidates = candidates.map((id) => state0.talent.find((t) => t.id === id)).filter((t) => t?.role === 'actor')
    let state = state0
    const signedActorIds: string[] = []
    for (const t of actorCandidates) {
      try {
        state = applyActions(state, [{ kind: 'signContract', talentId: t!.id, termWeeks: 52 }])
        signedActorIds.push(t!.id)
      } catch {
        // Not every candidate is available at week 0 (D-11.14) — skip, not required.
      }
    }
    // PREMISE (verified programmatically — see file header): more than
    // requiredActors actually signed on this seed.
    if (signedActorIds.length <= requiredActors) {
      throw new Error(`fixture premise failed: only ${String(signedActorIds.length)} actors signed, need > ${String(requiredActors)} to exceed the rival per-role cap`)
    }
    const talentId = signedActorIds[0]!

    const atSubmission = advanceTo(state, 45)
    const playerStudioId = atSubmission.hollywood!.playerStudioId
    const rivalStudioId = atSubmission.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId

    let atW = submitProposal(atSubmission, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
    atW = submitProposal(atW, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: 1.0 })
    atW = advanceTo(atW, 51)

    const activeActorContracts = atW.contracts.filter((c) => atW.talent.find((t) => t.id === c.talentId)?.role === 'actor').length
    expect(activeActorContracts).toBeGreaterThan(requiredActors) // the player DOES exceed a rival's per-role cap here

    const settled = tick(atW) // market.tick 51 -> 52, the decision week: settlement runs
    expect(settled.market.tick).toBe(52)
    const settledCase = caseForTalent(settled, talentId, settled.market.tick)!
    expect(settledCase.status).toBe('settled')

    const renewed = settled.contracts.find((c) => c.talentId === talentId && c.startWeek === 52)
    expect(renewed).toBeDefined()
    expect(renewed!.endWeekExclusive).toBe(104)
  })

  it('D. a rival that IS full at the decision week has its challenge on the player\'s expiring actor seat-dropped (dropped[] names the rival and contains "seat"), while the case still settles to the incumbent player', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const at40 = advanceTo(signed, 40)
    const decisionWeek = 52
    const requiredActors = RIVAL_TEAM_ROLES.filter((r) => r === 'actor').length

    // PREMISE (verified programmatically — identical discovery to case B, see
    // file header): the first entered rival that already holds >= requiredActors
    // same-role rows ending AFTER the decision week.
    const hollywood = at40.hollywood!
    const fullRival = hollywood.identities.find((s) => {
      if (s.role !== 'rival' || s.enteredWeek === null) return false
      const own = hollywood.activeEmploymentOrdinals.map((i) => hollywood.employment[i]!).filter((e) => e.studioId === s.studioId)
      const heldPastW = own.filter((e) =>
        e.terms.endWeekExclusive > decisionWeek && at40.talent.find((t) => t.id === e.terms.talentId)?.role === 'actor').length
      return heldPastW >= requiredActors
    })
    if (fullRival === undefined) {
      throw new Error('fixture premise failed: no entered rival naturally holds a full actor roster through the decision week on this seed')
    }
    const rivalStudioId = fullRival.studioId
    const rivalName = fullRival.name
    const playerStudioId = at40.hollywood!.playerStudioId
    const rosterBefore = hollywood.activeEmploymentOrdinals.map((i) => hollywood.employment[i]!).filter((e) => e.studioId === rivalStudioId).length

    // The player's own dominant proposal (tier 1.25) plus the full rival's
    // challenge (tier 1.0, the floor) — the rival must be seat-dropped before
    // ranking, not merely outbid.
    let state = submitProposal(at40, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
    state = submitProposal(state, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: 1.0 })
    state = advanceTo(state, 51)
    state = tick(state) // market.tick 51 -> 52, the decision week: settlement runs
    expect(state.market.tick).toBe(52)

    const settledView = caseForTalent(state, talentId, state.market.tick)!
    expect(settledView.status).toBe('settled')

    const kase = marketOf(state).cases.find((c) => c.talentId === talentId)!
    expect(kase.outcome).toBe('settled')

    const settledReceipts = marketOf(state).receipts.filter((r) => r.talentId === talentId && r.kind === 'settled')
    expect(settledReceipts.length).toBe(1)
    const dropped = settledReceipts[0]!.dropped
    expect(dropped.length).toBe(1) // the rival's challenge, dropped before ranking — SETTLED receipts carry dropped[] too
    expect(dropped[0]!.includes(rivalStudioId) || dropped[0]!.includes(rivalName)).toBe(true)
    expect(dropped[0]!.toLowerCase()).toContain('seat')

    const renewed = state.contracts.find((c) => c.talentId === talentId && c.startWeek === 52)
    expect(renewed).toBeDefined()
    expect(renewed!.endWeekExclusive).toBe(104)

    // The rival's roster did not grow past what it already held — its
    // challenge never committed.
    const rosterAfter = state.hollywood!.activeEmploymentOrdinals.map((i) => state.hollywood!.employment[i]!).filter((e) => e.studioId === rivalStudioId).length
    expect(rosterAfter).toBe(rosterBefore)
  })
})
