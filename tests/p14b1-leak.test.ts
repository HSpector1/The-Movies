// ── P14B.1 test 9: leak — a rival's promise terms never disclosed, settlement
// reasons stay ordering-only even when a promise decides the case ───────────
//
// Requirement source: P14-HEADLESS-PLAN.md, "## P14B.1 — First Kept Promise
// Core — task expansion", Tests item 9: "9 leak: the rival's promise terms
// absent from every DTO and from the settlement reasons (ordering only)."
// Law, by reference to docs/engineering/p14-preparation-8ef5246a/
// P14-PREPARATION-COMPANION.md §2.1.5 ("What is lawfully known, and what
// says UNKNOWN"), row: "the competing proposal's attached promises (P14B) |
// UNKNOWN | UNKNOWN | private" — this is an authored widening of the
// EXISTING `caseDisclosure` DTO (src/core/talentMarket.ts), not a new bridge
// surface: every other private-figure row on that same table (premium tier,
// salary, bonus) already says literally `'UNKNOWN'` to every non-issuer, and
// this test extends the SAME leak invariant to the newly attached promise.
//
// RED-FIRST: `src/core/promises.ts` does not exist yet. `attachPromise` is
// imported from it and CALLED below, so this file fails at module
// resolution before any test body runs (one TS2307, nothing else).
//
// INTERPRETATIONS NAMED:
//   1. `attachPromise(state, talentId, issuerStudioId, draft)` attaches a P1
//      (APPEARANCE_COUNT) promise draft to that studio's CURRENT proposal on
//      the open case for `talentId`, minting a `promiseId` and widening the
//      proposal's digest (tested directly in tests/p14b1-promises.test.ts,
//      test 2) — this file only needs the attach call to exist so a promise
//      is genuinely ON the rival's proposal for the leak check to be
//      non-vacuous.
//   2. `CaseDisclosure`'s widened `DisclosedProposal` carries a new `promise`
//      field: `'UNKNOWN'` for every non-issuer, and — for the issuer's own
//      row — some non-`'UNKNOWN'` disclosed value (its classification, per
//      the market comparison row named in "Scope — bridge"). Only the
//      UNKNOWN/non-UNKNOWN distinction is asserted here, never the issuer's
//      own disclosed shape (that is bridge work, test 10, out of this file's
//      scope). Accessed through an inline `as unknown as { promise: unknown
//      }` cast on each found row, exactly as this suite's disclosure file
//      widens fields the CURRENT `DisclosedProposal` type does not carry —
//      `caseDisclosure` itself is a REAL, already-resolving export, so a
//      bare `.promise` read on its typed return would be a SEPARATE
//      typecheck error the cast avoids.
//
// PREMISES NOT SATISFIED:
//   - Bridge-level DTOs (the Profile case block, the market comparison row,
//     the quote family) are OUT OF SCOPE for this file (P14B.1-T1 is engine
//     tests 1-9 only; test 10 is bridge, a separate task). "Every DTO" is
//     therefore read here as every ENGINE-level disclosure surface that
//     exists today (`caseDisclosure`) plus the settlement receipt's
//     `reasons`, not a claim about bridge projections this task does not
//     touch.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import { caseDisclosure, submitProposal } from '../src/core/talentMarket.js'
// RED-by-design: src/core/promises.ts does not exist. attachPromise is
// CALLED below.
import { attachPromise } from '../src/core/promises.js'

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

function promiseRow(disclosure: ReturnType<typeof caseDisclosure>, issuerStudioId: string): { promise: unknown } {
  const row = disclosure.proposals.find((p) => p.issuerStudioId === issuerStudioId)
  if (row === undefined) throw new Error(`leak test premise failed: no disclosed row for issuer "${issuerStudioId}"`)
  return row as unknown as { promise: unknown }
}

describe('P14B.1 test 9: leak — a rival promise never discloses to a non-issuer, and settlement reasons stay ordering-only', () => {
  it("a promise attached to the RIVAL's proposal says UNKNOWN on the player's disclosure view and something other than UNKNOWN on the rival's own", () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const atWindow = advanceTo(signed, 45)
    const week = atWindow.market.tick
    const playerStudioId = atWindow.hollywood!.playerStudioId
    const rivalStudioId = atWindow.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId

    let state = submitProposal(atWindow, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.1 })
    state = submitProposal(state, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: 1.05 })
    state = attachPromise(state, talentId, rivalStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: week,
      dueWeekExclusive: week + 52,
    })

    const asPlayer = caseDisclosure(state, talentId, playerStudioId, week)
    expect(promiseRow(asPlayer, rivalStudioId).promise).toBe('UNKNOWN') // not the issuer: hidden

    const asRival = caseDisclosure(state, talentId, rivalStudioId, week)
    expect(promiseRow(asRival, rivalStudioId).promise).not.toBe('UNKNOWN') // its OWN draft: real

    // Nothing private leaks structurally: the rival's minted promiseId never
    // appears anywhere in the player's serialized view, derived from state
    // (never hardcoded — the exact id format is not this file's business).
    const rivalProposal = state.talentMarket.proposals.find((p) => p.talentId === talentId && p.issuerStudioId === rivalStudioId) as unknown as { promises: readonly string[] }
    expect(rivalProposal.promises.length).toBeGreaterThan(0) // sanity: attachPromise genuinely attached something
    const promiseId = rivalProposal.promises[0]!
    expect(JSON.stringify(asPlayer)).not.toContain(promiseId)
  })

  it('settlement reasons stay ordering-only (no dollar sign, no bare 3+-digit figure) even when an attached promise is part of the decision', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const atSubmission = advanceTo(signed, 45)
    const week = atSubmission.market.tick
    const playerStudioId = atSubmission.hollywood!.playerStudioId
    const rivalStudioId = atSubmission.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId

    // Player dominates on every LIVE descriptor (extreme tier + incumbency,
    // mirroring tests/p14a1-settlement.test.ts's own dominance construction)
    // so the outcome is deterministic regardless of the OPEN band-edge
    // hypotheses; the promise rides along on the player's own proposal so a
    // real attach exists on the winning side too.
    let state = submitProposal(atSubmission, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
    state = submitProposal(state, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: 1.0 })
    state = attachPromise(state, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: week,
      dueWeekExclusive: week + 52,
    })

    let next = state
    while (next.market.tick < 52) next = tick(next)

    const settlement = next.talentMarket.receipts.find((r) => r.talentId === talentId && (r.kind === 'settled' || r.kind === 'declined'))
    if (settlement === undefined) throw new Error('leak test premise failed: no settlement receipt was written by week 52')
    expect(settlement.reasons.length).toBeGreaterThan(0)
    for (const reason of settlement.reasons) {
      expect(reason).not.toMatch(/\$|\d{3,}/)
    }
    for (const dropped of settlement.dropped) {
      expect(dropped).not.toMatch(/\$|\d{3,}/)
    }
  })
})
