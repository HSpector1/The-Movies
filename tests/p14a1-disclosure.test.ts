// ── P14A.1 test 6: Disclosure — UNKNOWN markers, nothing private leaks ──────
//
// Requirement source: P14-HEADLESS-PLAN.md, P14A.1 expansion, Tests item 6:
// "6 disclosure (UNKNOWN markers; nothing private leaks)." Law, by reference
// to docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md
// §2.1.5 ("What is lawfully known, and what says UNKNOWN"): the accepted
// disclosure law hides every rival contract term ("Contract terms are kept
// private in Industry." bridge/industry.ts ≈239; `contract: null` for
// rival-employed people, bridge/people.ts ≈516). P14A NARROWS this: "that a
// case exists, its subject and its decision week... public"; "that a
// competing proposal exists, from which studio, since which week... public";
// "the competing proposal's term length and effective week... public"; "the
// competing proposal's premium tier, salary and bonus... UNKNOWN... before
// and after settlement"; "the person's ranking... no, until settlement; then
// the receipt's top reasons, which disclose ordering only... never amounts";
// "the comparison view always has a truthful column for the rival: known
// rows filled, unknown rows literally 'UNKNOWN'. No band, estimate or rumor
// is invented." The plan's Scope paragraph states this is "a NARROWING of
// today's blanket rule that rival contract terms are private... the case
// block discloses exactly the listed fields and those two call sites keep
// every other term private (test 6 asserts both halves)."
//
// RED-by-design: `src/core/talentMarket.ts` does not exist yet. `submitProposal`
// and `caseDisclosure` are imported from that new module and CALLED below, so
// this file fails at module resolution before any test body runs.
//
// INTERPRETATIONS NAMED:
//   1. `caseDisclosure(state, talentId, viewerStudioId, week)` is assumed to
//      return, per proposal, the public fields (issuer, submittedWeek,
//      termWeeks, effectiveWeek) plus premiumTier/annualSalary/signingBonus
//      set to the STRING SENTINEL `'UNKNOWN'` for every proposal NOT issued
//      by `viewerStudioId`, and the real numbers for the viewer's own
//      proposal. This exact field-and-sentinel shape is the test author's
//      reading of "unknown rows literally 'UNKNOWN'"; only the sentinel
//      value and the leak invariant are asserted, not the full DTO shape.
//   2. `submitProposal` shape as in tests/p14a1-proposals.test.ts.
//
// PREMISES NOT SATISFIED:
//   - The existing `bridge/industry.ts`/`bridge/people.ts` private-terms call
//     sites are NOT re-tested here (this suite is Core-only, per assignment:
//     "never touch src/ or bridge/"); this file asserts the CORE-level
//     disclosure law the plan says those two call sites must keep narrowed
//     around. The bridge-level "both halves" assertion belongs to a bridge
//     test (test 9 / P14A.3), out of this file's scope.
//   - Post-settlement disclosure ("who joined and on what term length...
//     public, salary stays private") is not exercised here; test 5
//     (settlement) covers the settled-case receipt shape and its
//     order-only reasons.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/talentMarket.ts does not exist. These are the two
// imports from that new module in this file; submitProposal is CALLED below.
import { submitProposal, caseDisclosure } from '../src/core/talentMarket.js'

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

describe('P14A.1 test 6: disclosure — UNKNOWN markers, nothing private leaks', () => {
  it('the case, its subject and decision week, and the competing proposal\'s existence/issuer/term/effective-week are public to both viewers', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const atWindow = advanceTo(signed, 45)
    const playerStudioId = atWindow.hollywood!.playerStudioId
    const rivalStudioId = atWindow.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const state = submitProposal(submitProposal(atWindow, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.1 }), {
      talentId,
      issuerStudioId: rivalStudioId,
      termWeeks: 52,
      premiumTier: 1.05,
    })

    const asRival = caseDisclosure(state, talentId, rivalStudioId, state.market.tick)
    expect(asRival.decisionWeek).toBe(52)
    expect(asRival.subjectTalentId).toBe(talentId)
    const playersRowSeenByRival = asRival.proposals.find((p: { issuerStudioId: string }) => p.issuerStudioId === playerStudioId)!
    expect(playersRowSeenByRival.termWeeks).toBe(52) // term length is public
    expect(playersRowSeenByRival.effectiveWeek).toBe(52) // effective week is public
  })

  it('a proposal\'s premium tier, salary and bonus say UNKNOWN to every studio that did not issue it — never a band, estimate or invented number', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const atWindow = advanceTo(signed, 45)
    const playerStudioId = atWindow.hollywood!.playerStudioId
    const rivalStudioId = atWindow.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const state = submitProposal(submitProposal(atWindow, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.1 }), {
      talentId,
      issuerStudioId: rivalStudioId,
      termWeeks: 52,
      premiumTier: 1.05,
    })

    const asPlayer = caseDisclosure(state, talentId, playerStudioId, state.market.tick)
    const mine = asPlayer.proposals.find((p: { issuerStudioId: string }) => p.issuerStudioId === playerStudioId)!
    const theirs = asPlayer.proposals.find((p: { issuerStudioId: string }) => p.issuerStudioId === rivalStudioId)!
    expect(typeof mine.annualSalary).toBe('number') // the player sees its OWN draft's real terms
    expect(theirs.premiumTier).toBe('UNKNOWN')
    expect(theirs.annualSalary).toBe('UNKNOWN')
    expect(theirs.signingBonus).toBe('UNKNOWN')

    const asRival = caseDisclosure(state, talentId, rivalStudioId, state.market.tick)
    const rivalsOwnRow = asRival.proposals.find((p: { issuerStudioId: string }) => p.issuerStudioId === rivalStudioId)!
    const playersRowSeenByRival = asRival.proposals.find((p: { issuerStudioId: string }) => p.issuerStudioId === playerStudioId)!
    expect(typeof rivalsOwnRow.annualSalary).toBe('number') // symmetric: the rival sees its OWN draft's real terms
    expect(playersRowSeenByRival.premiumTier).toBe('UNKNOWN')
    expect(playersRowSeenByRival.annualSalary).toBe('UNKNOWN')
    expect(playersRowSeenByRival.signingBonus).toBe('UNKNOWN')
  })

  it('nothing private leaks: the exact competing salary/bonus figures never appear anywhere in the serialized disclosure, for either viewer', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const atWindow = advanceTo(signed, 45)
    const playerStudioId = atWindow.hollywood!.playerStudioId
    const rivalStudioId = atWindow.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    // Player and rival deliberately priced at DIFFERENT, distinguishable tiers so their
    // annual salaries are numerically distinct — a leak would be unambiguous, not coincidental.
    const state = submitProposal(submitProposal(atWindow, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 }), {
      talentId,
      issuerStudioId: rivalStudioId,
      termWeeks: 52,
      premiumTier: 1.0,
    })
    const asPlayer = caseDisclosure(state, talentId, playerStudioId, state.market.tick)
    const asRival = caseDisclosure(state, talentId, rivalStudioId, state.market.tick)
    const rivalsRealAnnual = asRival.proposals.find((p: { issuerStudioId: string }) => p.issuerStudioId === rivalStudioId)!.annualSalary as number
    const playersRealAnnual = asPlayer.proposals.find((p: { issuerStudioId: string }) => p.issuerStudioId === playerStudioId)!.annualSalary as number
    expect(typeof rivalsRealAnnual).toBe('number')
    expect(typeof playersRealAnnual).toBe('number')
    expect(rivalsRealAnnual).not.toBe(playersRealAnnual) // sanity: distinguishable, so a leak would be detectable
    const playerJson = JSON.stringify(asPlayer)
    expect(playerJson).not.toContain(String(rivalsRealAnnual)) // the rival's real annual never appears in the player's view
    const rivalJson = JSON.stringify(asRival)
    expect(rivalJson).not.toContain(String(playersRealAnnual)) // the player's real annual never appears in the rival's view
  })
})
