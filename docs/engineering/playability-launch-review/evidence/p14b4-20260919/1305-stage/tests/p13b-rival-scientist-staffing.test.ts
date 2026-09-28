// ── P14 task 1305-C: the P13B rival Scientist under-hiring witness (1305-F amendment 2's
// "suspected existing defect", separate gate, separate from R3 — reused/cited by
// p14r3-rival-release.test.ts's "Scientists are never R3-surplus" leaf, but this file is
// the one authorized to test the STAFFING defect itself) ──
//
// STAGED FILE — not under tests/. Independent-test-engineer authored, mode IMPLEMENT.
// Requirement source, read in full: 1305-F "Amendment 2: surplus is defined against the role
// targets, not the deficit slots" and its "Suspected existing defect" paragraph (quoted):
//   "The same deficit-slot interaction means a rival with n > 0 employed Scientists and
//   deficit d > 0 retains min(n, d) existing Scientists into the deficit slots and hires only
//   max(0, d - n). It ends at max(n, d) instead of the target n + d, and when d <= n it never
//   hires. This contradicts `rivalScientistDemand`'s own contract ('How many Scientists this
//   rival still needs to fill the seats its own policy demands') and P13B-S8's symmetric
//   research staffing. ... Before any change: a RED witness on a generated world must show a
//   rival whose employed Scientists stay below min(capacity, demanded) across consecutive
//   weeks with affordable reserve."
// Task assignment (1305-C) restates the same contract, citing rivalResearch.ts's own doc
// comment (":107-111", read directly): "How many Scientists this rival still needs to fill
// the seats its own policy demands on Laboratories that are actually equipped for that
// research."
//
// MECHANISM (INTERPRETATION, since rivalScientistDemand returns only the DEFICIT
// max(0,min(capacity,demanded)-employed), never capacity/demanded separately — neither is
// independently exported): "employed === min(capacity,demanded)" is algebraically equivalent
// to "rivalScientistDemand(...) === 0" (deficit is zero iff employed already meets the
// min(capacity,demanded) target; deficit CANNOT be negative by construction, `Math.max(0,…)`).
// This file therefore asserts `rivalScientistDemand(state, hollywood, business, talent, week)
// === 0` at each tested week. CAVEAT (named honestly): deficit-zero literally proves
// `employed >= min(capacity,demanded)`, not exact equality — an OVER-hire could also read as
// deficit 0. Over-hiring is not a structural possibility of the mechanism this witness
// targets (each week's own slot loop hires at most exactly that week's deficit, so it cannot
// overshoot the target it computes), so under that mechanism deficit-zero and exact equality
// coincide; this is not re-derived as a separate, independent proof here.
//
// NATURAL ROUTE REUSED, NOT SEARCHED (per instruction: "do not search seeds or extend
// routes"): tests/bridge-p13b-s8-rivals.test.ts (already landed, read in full) carries its
// own measured-fact header, "probed 2026-09-18 via `npx vite-node` against the already-landed
// engine, never invented": seed `p13b-s8-bridge-probe-01`, a player Research Laboratory
// committed at week 0 (`commitPlacement`), rival `r01` (`hollywood.businesses[0]`) reaches
// "instrument operational week 265, four Scientists seated week 265, project verifiedWork
// 60/64 at week 275, researchCompleted at week 276, a second Laboratory laboratoryCommitted
// week 266 / laboratoryOperational week 278, technologyAdopted (commercial capability)
// week 288." This file reuses that exact seed, that exact placement, and that exact
// bounded tick count (265) — no new tick count is invented and no seed is tried.
//
// BOUNDED WINDOW: weeks 265 through 270 inclusive (6 weeks, matching the task's "across
// consecutive weeks" wording) — chosen to sit inside the cited "instrument operational week
// 265 ... researchCompleted week 276" span, comfortably before any of the cited cash-related
// concerns ("rival r01's own cash goes deeply negative ... at week 400 on an UNRELATED seed",
// same sibling file, not this one — named here only as the reason this file does not extend
// the window past ~week 290 without a fresh affordability measurement).
//
// STOP RULE: if the natural route above does not reproduce (e.g. the cited week-265 fact does
// not hold on a re-read of the current engine), this file's own sanity assertions fail loudly
// at the PRECONDITION checks, distinct from the defect-witness assertion itself — see the
// handback for how to tell the two failure modes apart.

import { describe, expect, it } from 'vitest'
import { tick } from '../../../../../../../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../../../../../../../src/harness/p13a/fixtures.js'
import { commitPlacement } from '../../../../../../../src/core/placement.js'
import { rivalWeeklyOperatingCost } from '../../../../../../../src/core/hollywood.js'
import { rivalScientistDemand } from '../../../../../../../src/core/rivalResearch.js'

const SEED = 'p13b-s8-bridge-probe-01' // reused verbatim from tests/bridge-p13b-s8-rivals.test.ts

describe('P13B-S8 rival Scientist staffing witness (1305-F amendment 2 suspected defect)', () => {
  it('r01 has an operational Laboratory with real research interest and 4 employed Scientists at week 265 (precondition, cites the already-measured fact)', () => {
    const withPlayerLab = commitPlacement(p13aGeneratedStudio(SEED), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    const state = advanceTo(withPlayerLab, 265)
    const r01 = state.hollywood!.businesses[0]!
    expect(r01.operations.facilities.some((f) => f.capability === 'laboratory')).toBe(true)
    const employedScientistIds = state.hollywood!.activeEmploymentOrdinals
      .map((i) => state.hollywood!.employment[i]!)
      .filter((e) => e.studioId === r01.studioId && state.talent.find((t) => t.id === e.terms.talentId)?.role === 'scientist')
      .map((e) => e.terms.talentId)
    expect(employedScientistIds).toHaveLength(4) // the cited measured fact
  })

  it('the deficit rivalScientistDemand reports is 0 (employed === min(capacity,demanded)) at every affordable week in [265,270]', () => {
    const withPlayerLab = commitPlacement(p13aGeneratedStudio(SEED), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    let state = advanceTo(withPlayerLab, 265)
    const rivalId = state.hollywood!.businesses[0]!.studioId
    let checkedAtLeastOneAffordableWeek = false
    for (let week = 265; week <= 270; week++) {
      expect(state.market.tick).toBe(week)
      const business = state.hollywood!.businesses.find((b) => b.studioId === rivalId)!
      const reserve = rivalWeeklyOperatingCost(business, state.hollywood!, week) * business.policy.reserveWeeks
      // Affordable-reserve headroom, stated explicitly: enough above reserve to plausibly
      // afford one more Scientist's signing bonus (companion §3.3's worked salary tables put
      // even a STAR signing bonus under $0.5M; $2M is a stated, generous margin, not tuned to
      // this seed's actual numbers, which were not independently re-measured in this pass).
      const affordable = business.account.cash > reserve + 2_000_000
      if (affordable) {
        checkedAtLeastOneAffordableWeek = true
        const deficit = rivalScientistDemand(state, state.hollywood!, business, state.talent, week)
        expect(deficit, `week ${week}: rival ${rivalId} has affordable reserve (cash ${business.account.cash} vs reserve ${reserve}) but rivalScientistDemand reports a nonzero deficit`).toBe(0)
      }
      state = tick(state)
    }
    if (!checkedAtLeastOneAffordableWeek) {
      throw new Error(
        'p13b-rival-scientist-staffing: no week in [265,270] showed the rival with cash above reserve+2,000,000 — ' +
        'the affordability precondition itself was never met in this bounded window; this is a STOPPED leaf per ' +
        'instruction (do not search seeds or extend routes), not a witnessed absence of the defect. Report and widen ' +
        'the window or lower the margin only on explicit parent instruction.',
      )
    }
  })
})
