// ── P14A.1 test 2: The case lifecycle, the derived decision week,
// invalidation triggers, and the `underMarketCase` renewal refusal ─────────
//
// Requirement source: P14-HEADLESS-PLAN.md, P14A.1 expansion, Tests item 2:
// "2 case lifecycle and derived decision week; invalidation triggers." Files
// list: "tests/p14a1-case.test.ts (2, incl. `underMarketCase`)." Law, by
// reference to docs/engineering/p14-preparation-8ef5246a/
// P14-PREPARATION-COMPANION.md §2.1.3 ("The case, without an intermediary"):
//   `discovered → proposals_open → decision_pending → settled | declined |
//   expired | invalidated`
//   "Discovery is authoritative and public: a case is `discovered` the week
//   eligibility opens..."
//   "The decision week is derived on read from the live contract, never
//   copied: it is the subject's `endWeekExclusive` at the time of reading."
//   "Invalidation triggers: the subject is released early (§3; the person is
//   a free agent now); retirement is announced (§6.2); the subject otherwise
//   leaves eligibility. An invalidated case closes every proposal with a
//   typed reason and settles nothing."
//   "`renewContract` on a cased person is refused with a new typed refusal
//   (`underMarketCase`) that redirects to the proposal path." — also
//   companion R6 (§7.2) and rulings §3.4.1 direction 4.
//
// RED-by-design: `src/core/talentMarket.ts` does not exist yet. `caseForTalent`
// is the ONE import from that new module, and it is CALLED below, so this file
// fails at module resolution before any test body runs.
//
// INTERPRETATIONS NAMED:
//   1. `caseForTalent(state, talentId, week)` is assumed to return the case
//      descriptor or `null` when no case exists: `{ status: CaseStatus;
//      decisionWeek: number; subjectTalentId: string }` at minimum. Only
//      `status` and `decisionWeek` are asserted below.
//   2. `underMarketCase` is asserted as a substring of the thrown Error's
//      message from `applyActions(state,[{kind:'renewContract',...}])`,
//      mirroring the existing thrown-Error idiom every other D-11 refusal in
//      src/core/actions.ts already uses (e.g. "(D-11.7)", "(D-12 solvency
//      gate)"). If T2 instead returns a typed `{ok:false,reason:'underMarketCase'}`
//      value from a non-throwing path, this assertion's mechanism (not its
//      law) needs revision.
//
// PREMISES NOT SATISFIED:
//   - The "retirement announced" invalidation trigger (companion §6.2, P14C)
//     is not reachable pre-P14C (see tests/p14a1-eligibility.test.ts's
//     premise note) and is not exercised here.
//   - Whether the case's status is literally `'discovered'` for one tick
//     before advancing to `'proposals_open'`, or the two collapse to the same
//     observable week, is not stated by the plan with week-level precision
//     beyond "the week eligibility opens"; this file asserts `'discovered'`
//     at the exact window-open week only, per that direct wording, and takes
//     no position on when `'proposals_open'` first appears.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/talentMarket.ts does not exist. This is the ONE
// import from that new module in this file.
import { caseForTalent } from '../src/core/talentMarket.js'

function freshWorld(): GameState {
  return p13aGeneratedStudio()
}

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

describe('P14A.1 test 2: case lifecycle, derived decision week, invalidation, underMarketCase', () => {
  it('no case exists for a contracted_outside_window subject', () => {
    const world = freshWorld()
    const { state, talentId } = signActor(world, 208)
    expect(caseForTalent(state, talentId, state.market.tick)).toBeNull()
  })

  it('discovery: a case exists with status "discovered" at the exact window-open week (week 40 for a 52-week contract)', () => {
    const world = freshWorld()
    const { state: signed, talentId } = signActor(world, 52)
    const atWindow = advanceTo(signed, 40)
    const found = caseForTalent(atWindow, talentId, atWindow.market.tick)
    expect(found).not.toBeNull()
    expect(found!.status).toBe('discovered')
  })

  it('the decision week is derived from the subject\'s live endWeekExclusive, not a stored copy', () => {
    const world = freshWorld()
    const { state: signed, talentId } = signActor(world, 52)
    const atWindow = advanceTo(signed, 40)
    const contract = atWindow.contracts.find((c) => c.talentId === talentId)!
    const found = caseForTalent(atWindow, talentId, atWindow.market.tick)!
    expect(found.decisionWeek).toBe(contract.endWeekExclusive)
    expect(found.decisionWeek).toBe(52)
    // Read again one week later: the SAME live contract still reports the SAME
    // endWeekExclusive (nothing renewed it), so the derived decision week is
    // stable under re-reading — exactly what "derived on read" requires.
    const oneWeekLater = advanceTo(atWindow, 41)
    const foundLater = caseForTalent(oneWeekLater, talentId, oneWeekLater.market.tick)!
    expect(foundLater.decisionWeek).toBe(52)
  })

  it('invalidation: an early release invalidates the open case', () => {
    const world = freshWorld()
    const { state: signed, talentId } = signActor(world, 52)
    const atWindow = advanceTo(signed, 40)
    expect(caseForTalent(atWindow, talentId, atWindow.market.tick)!.status).toBe('discovered')
    const released = applyActions(atWindow, [{ kind: 'releaseTalent', talentId }])
    const afterRelease = caseForTalent(released, talentId, released.market.tick)
    expect(afterRelease).not.toBeNull()
    expect(afterRelease!.status).toBe('invalidated')
  })

  it('underMarketCase: renewContract on a cased person is refused, redirecting to the proposal path', () => {
    const world = freshWorld()
    const { state: signed, talentId } = signActor(world, 52)
    const atWindow = advanceTo(signed, 40)
    expect(caseForTalent(atWindow, talentId, atWindow.market.tick)).not.toBeNull()
    expect(() => applyActions(atWindow, [{ kind: 'renewContract', talentId, termWeeks: 52 }])).toThrow(/underMarketCase/)
  })

  it('outside a case, renewContract keeps its accepted D-11.7 refusal (contract not yet in its renewal window) — unchanged by P14A', () => {
    const world = freshWorld()
    const { state, talentId } = signActor(world, 208)
    expect(caseForTalent(state, talentId, state.market.tick)).toBeNull()
    expect(() => applyActions(state, [{ kind: 'renewContract', talentId, termWeeks: 52 }])).toThrow(/D-11\.7/)
  })
})
