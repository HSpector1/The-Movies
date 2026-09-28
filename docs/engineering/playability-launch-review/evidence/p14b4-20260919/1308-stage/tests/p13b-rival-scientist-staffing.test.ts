// ── P14 task 1305-C, revised by 1308-C2: the P13B rival Scientist under-hiring witness
// (1305-F amendment 2's "suspected existing defect", separate gate, separate from R3 —
// reused/cited by p14r3-rival-release.test.ts's "Scientists are never R3-surplus" leaf, but
// this file is the one authorized to test the STAFFING defect itself) ──
//
// STAGED FILE (1308-C revised import paths only, mechanical, re-pointed from the 1305-stage
// physical-location depth to the destination tests/ depth — per the 1308-C brief this file is
// a separate hypothesis-witness gate, not part of R3 GREEN). 1308-C2 revises the PREMISE and
// WINDOW per 1308-F item 4 / 1308-X defect 2 / 1308-Q (see below) — no change to the
// mechanism/caveat reasoning, which stays as 1305-C authored it. Physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1308-stage/tests/, has
// NOT been executed, type-checked, or moved from there by this author. Independent-test-
// engineer authored, mode IMPLEMENT.
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
// 1308-C2 PREMISE CORRECTION (1308-F item 4 / 1308-X defect 2, superseding 1308-D check 7's
// source-reading-only judgment): the ORIGINAL premise ("four Scientists seated week 265")
// cites tests/bridge-p13b-s8-rivals.test.ts's own header fact — but that fact is the RECEIPT
// week written during the tick that PROCESSES week 265, not the STATE at week 265 before that
// tick runs. Measured directly on the unchanged engine (1308-Q-scientist-deficit-probe.ts /
// .txt, HEAD 7af5412c, seed 'p13b-s8-bridge-probe-01' with the player Laboratory, weeks
// 260-420): every rival reports deficit 4 (0 employed Scientists) at STATE week 265; from
// STATE week 266 onward r01 employs 4 Scientists with deficit 0, every week through 420,
// cashOK (`cash > reserve`) true throughout. The premise and window below move to week 266
// accordingly. This is a genuine premise correction, not a change to what the witness tests.
//
// NATURAL ROUTE REUSED, NOT SEARCHED (per instruction: "do not search seeds or extend
// routes"): tests/bridge-p13b-s8-rivals.test.ts (already landed, read in full) carries its
// own measured-fact header, "probed 2026-09-18 via `npx vite-node` against the already-landed
// engine, never invented": seed `p13b-s8-bridge-probe-01`, a player Research Laboratory
// committed at week 0 (`commitPlacement`), rival `r01` (`hollywood.businesses[0]`) reaches
// "instrument operational week 265, four Scientists seated week 265, project verifiedWork
// 60/64 at week 275, researchCompleted at week 276, a second Laboratory laboratoryCommitted
// week 266 / laboratoryOperational week 278, technologyAdopted (commercial capability)
// week 288." This file reuses that exact seed and that exact placement — no new seed is
// tried; only the STATE week read (266, not 265) and the checked window (below) are corrected
// per the parent's own measurement (1308-Q), which is itself a bounded natural route on the
// SAME seed, not a search.
//
// WINDOW: state weeks 266 through 420 inclusive — the FULL measured window
// (1308-Q-scientist-deficit-probe.ts/.txt), not a newly invented or extended bound. Affordability
// is read with the SAME definition the measurement used (`business.account.cash >
// rivalWeeklyOperatingCost(...) * business.policy.reserveWeeks`, no extra margin) so this
// leaf's own "affordable" set matches exactly what was measured, rather than diverging with
// an independently invented cushion.
//
// EXPECTED OUTCOME, STATED HONESTLY (per 1308-F item 4): on the measured route this leaf is
// EXPECTED TO PASS. 1308-Q shows `rivalScientistDemand` reporting deficit 0 for r01 at every
// state week in [266,420], with `cashOK` true throughout — the hypothesis is NOT witnessed on
// this route, and per 1305-F/1308-F no production correction follows from an unwitnessed
// hypothesis. A passing result here is the correct, informative outcome of a genuine test,
// not a broken or vacuous one — this file's PRECONDITION leaf (four Scientists at week 266)
// is the assertion that actually exercises new ground (it was RED at week 265 in the original
// draft; it is expected to PASS at week 266).
//
// STOP RULE: if the natural route above does not reproduce (e.g. the cited week-266 fact does
// not hold on a re-read of the current engine), this file's own sanity assertions fail loudly
// at the PRECONDITION check, distinct from the defect-witness assertion itself — see the
// handback for how to tell the two failure modes apart. Per instruction, no seed search or
// window extension follows from either failure mode without explicit parent authorization.

import { describe, expect, it } from 'vitest'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import { commitPlacement } from '../src/core/placement.js'
import { rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { rivalScientistDemand } from '../src/core/rivalResearch.js'

const SEED = 'p13b-s8-bridge-probe-01' // reused verbatim from tests/bridge-p13b-s8-rivals.test.ts
const WINDOW_END = 420 // the full measured window (1308-Q-scientist-deficit-probe.ts/.txt)

describe('P13B-S8 rival Scientist staffing witness (1305-F amendment 2 suspected defect)', () => {
  it('r01 has an operational Laboratory with real research interest and 4 employed Scientists at week 266 (precondition, cites the parent\'s 1308-Q measurement, state week — not the receipt week 265 the sibling file\'s header names)', () => {
    const withPlayerLab = commitPlacement(p13aGeneratedStudio(SEED), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    const state = advanceTo(withPlayerLab, 266)
    const r01 = state.hollywood!.businesses[0]!
    expect(r01.operations.facilities.some((f) => f.capability === 'laboratory')).toBe(true)
    const employedScientistIds = state.hollywood!.activeEmploymentOrdinals
      .map((i) => state.hollywood!.employment[i]!)
      .filter((e) => e.studioId === r01.studioId && state.talent.find((t) => t.id === e.terms.talentId)?.role === 'scientist')
      .map((e) => e.terms.talentId)
    expect(employedScientistIds).toHaveLength(4) // the 1308-Q measured fact, state week 266
  })

  it(`the deficit rivalScientistDemand reports is 0 (employed === min(capacity,demanded)) at every affordable state week in [266,${String(WINDOW_END)}] (the full 1308-Q measured window) — EXPECTED TO PASS on this route; see header`, () => {
    const withPlayerLab = commitPlacement(p13aGeneratedStudio(SEED), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    let state = advanceTo(withPlayerLab, 266)
    const rivalId = state.hollywood!.businesses[0]!.studioId
    let checkedAtLeastOneAffordableWeek = false
    for (let week = 266; week <= WINDOW_END; week++) {
      expect(state.market.tick).toBe(week)
      const business = state.hollywood!.businesses.find((b) => b.studioId === rivalId)!
      const reserve = rivalWeeklyOperatingCost(business, state.hollywood!, week) * business.policy.reserveWeeks
      // Affordability read with the SAME bare definition the parent's own measurement used
      // (1308-Q-scientist-deficit-probe.ts:15, `cash > reserve`, no extra margin) — matching
      // what was actually measured rather than diverging with an independently invented cushion.
      const affordable = business.account.cash > reserve
      if (affordable) {
        checkedAtLeastOneAffordableWeek = true
        const deficit = rivalScientistDemand(state, state.hollywood!, business, state.talent, week)
        expect(deficit, `week ${week}: rival ${rivalId} has affordable reserve (cash ${business.account.cash} vs reserve ${reserve}) but rivalScientistDemand reports a nonzero deficit`).toBe(0)
      }
      state = tick(state)
    }
    if (!checkedAtLeastOneAffordableWeek) {
      throw new Error(
        `p13b-rival-scientist-staffing: no week in [266,${String(WINDOW_END)}] showed the rival with cash above reserve — ` +
        'the affordability precondition itself was never met in this bounded window; this is a STOPPED leaf per ' +
        'instruction (do not search seeds or extend routes), not a witnessed absence of the defect. Report and widen ' +
        'the window only on explicit parent instruction.',
      )
    }
  })
})
