// ── P14A.1 test 4: The rival proposal trigger inside `nextDecisionWeek`
// (pure policy) AND the `staff()` case-subject exclusion ────────────────────
//
// Requirement source: P14-HEADLESS-PLAN.md, P14A.1 expansion, Tests item 4:
// "4 rival trigger inside `nextDecisionWeek` (pure policy, receipt-backed)
// AND the `staff()` case-subject exclusion: a rival's expiring person under
// an open case is not auto-renewed in the discovery week, so the rival
// contest of the Core pass sentence is reachable." Law, by reference to
// docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md
// §2.1.4 ("What makes a rival propose"): "the rival evaluates, inside its
// existing weekly decision (`nextDecisionWeek`), a pure P12 policy function
// over a case description P14 hands it... The rival proposes for a case
// subject when: (a) the subject is its own person in the window (the
// incumbent-rival proposal)..." and §2.1.3 ("The one accepted behavior P14A
// changes"): "a solvent rival renews its own people on the first week of the
// window (`staff()`), so a rival's person never reaches a contested expiry...
// Under P14A, for a person under a case, the incumbent's renewal becomes the
// incumbent's proposal... This is a SHARED GENERALIZATION with P10 (player)
// and P12 (rival maintenance: the renewal loop in `staff()` skips case
// subjects)." Scope line: "hollywoodTick.ts ≈95-111, which runs BEFORE
// decide() in the same weekly pass and would otherwise auto-renew a rival's
// expiring person for 208 weeks in the discovery week) EXCLUDES case
// subjects — the exclusion lands with the case-open check, not with
// settlement."
//
// GENUINE, UNFORGED SCENARIO: a fresh natural campaign (p13aGeneratedStudio,
// default seed) enters rows 2-4 as rivals at week 0, each signing its fixed
// 6-person RIVAL_TEAM_ROLES founding roster (writer, director, 3×actor,
// craft) on a single 208-week contract, all starting week 0 — measured via
// vite-node probe, 2026-09-18: row 2's studioId is deterministic for this
// seed and its whole roster's renewal window opens together, since every
// founding contract shares the same startWeek/termWeeks. `renewalWindowOpen`
// opens when `0 < endWeekExclusive - week <= 12`, i.e. at week 196 for a
// week-0/208-week contract. `person-<studioId>-2` is RIVAL_TEAM_ROLES[2] =
// 'actor' (hollywoodStartingData.ts).
//
// RED-by-design: `src/core/talentMarket.ts` does not exist yet. `rivalProposalTrigger`
// is the ONE import from that new module, and it is CALLED below, so this
// file fails at module resolution before any test body runs.
//
// INTERPRETATIONS NAMED:
//   1. `rivalProposalTrigger(state, hollywood, business, caseDescriptor, week)`
//      is assumed pure and to return a boolean-ish "would propose" decision
//      (truthy when any of branches a/b/c applies). Only branch (a) — "the
//      subject is its own person in the window" — is exercised directly;
//      branches (b) same-role-expiry and (c) same-role-deficit are NOT
//      independently fixture-tested (see PREMISES below).
//   2. `caseDescriptor` is passed as `{ talentId, subjectStudioId, decisionWeek }`
//      — the minimal shape §2.1.4's trigger law names ("a case description
//      P14 hands it"). T2 may need more fields; only these three are read
//      by the assertions below.
//   3. The `staff()` exclusion is tested as an OBSERVABLE INVARIANT over the
//      WHOLE open-case span (week 196 through week 207, the week before the
//      decision week 208), not only the single discovery-week tick — per the
//      plan's own words, "the exclusion lands with the case-open check, not
//      with settlement", which reads as a standing exclusion for as long as
//      the case is open, not a one-week special case. This is a deliberate
//      generalization beyond the literal "discovery week" wording, named here.
//
// PREMISES NOT SATISFIED:
//   - Trigger branches (b) "a same-role contract ending at or before the
//     subject's effective week" and (c) "a seat deficit at that role" are not
//     independently exercised: constructing a natural fixture with a second
//     rival's same-role expiry aligned to this case, or a genuine seat
//     deficit not already filled by the SAME weekly `staff()` pass, was not
//     attempted — doing so without inventing unreviewed fixture shape was not
//     judged tractable in this pass. Only branch (a) is covered.
//   - "Receipt-backed": this file does not assert a specific receipt kind for
//     the rival's proposal (P14's receipt-writing side of the trigger); test
//     3 (tests/p14a1-proposals.test.ts) and test 5 (settlement) are the
//     files that exercise proposal/settlement receipts.

import { describe, expect, it } from 'vitest'
import { tick } from '../src/core/tick.js'
import { renewalWindowOpen } from '../src/core/employment.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/talentMarket.ts does not exist. This is the ONE
// import from that new module in this file.
import { rivalProposalTrigger } from '../src/core/talentMarket.js'

function rowStudioId(state: GameState, row: number): string {
  return state.hollywood!.identities.find((s) => s.row === row)!.studioId
}

describe('P14A.1 test 4: rival proposal trigger (pure policy) and the staff() case-subject exclusion', () => {
  it('branch (a) — own person in the window: the trigger fires (deterministically, twice) for a rival subject at its own window-open week (196)', () => {
    const atWindow = advanceTo(p13aGeneratedStudio(), 196)
    const row2 = rowStudioId(atWindow, 2)
    const actorId = `person-${row2}-2` // RIVAL_TEAM_ROLES[2] === 'actor'
    const employment = atWindow.hollywood!.employment.find((e) => e.studioId === row2 && e.terms.talentId === actorId)!
    expect(renewalWindowOpen(employment.terms, atWindow.market.tick)).toBe(true) // sanity: genuinely inside the window
    const descriptor = { talentId: actorId, subjectStudioId: row2, decisionWeek: employment.terms.endWeekExclusive }
    const business = atWindow.hollywood!.businesses.find((b) => b.studioId === row2)!
    const first = rivalProposalTrigger(atWindow, atWindow.hollywood!, business, descriptor, atWindow.market.tick)
    const second = rivalProposalTrigger(atWindow, atWindow.hollywood!, business, descriptor, atWindow.market.tick)
    expect(first).toBeTruthy()
    expect(first).toBe(second) // deterministic, no RNG
  })

  it("staff()'s renewal loop excludes the case subject for the whole open-case span (week 196 through 207): the founding contract is never renewed early", () => {
    let state = advanceTo(p13aGeneratedStudio(), 196)
    const row2 = rowStudioId(state, 2)
    const actorId = `person-${row2}-2`
    const originalEnd = state.hollywood!.employment.find((e) => e.studioId === row2 && e.terms.talentId === actorId)!.terms.endWeekExclusive
    expect(originalEnd).toBe(208)
    for (let week = 196; week < 207; week++) {
      state = tick(state)
      const active = state.hollywood!.activeEmploymentOrdinals.map((i) => state.hollywood!.employment[i]!).find((e) => e.studioId === row2 && e.terms.talentId === actorId)
      expect(active).toBeDefined() // still actively employed by its own studio — not released, not orphaned
      expect(active!.terms.endWeekExclusive).toBe(originalEnd) // NOT renewed while the case is open
      expect(active!.terms.startWeek).toBe(0) // the ORIGINAL founding contract, not a fresh 'renewal' row
    }
  })
})
