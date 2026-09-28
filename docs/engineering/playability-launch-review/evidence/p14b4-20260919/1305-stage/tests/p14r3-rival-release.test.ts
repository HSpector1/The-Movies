// ── P14 task 1305-C: R3 rival early release under the player's law (Save41 companion is
// p14r3-save-v41.test.ts; the scientist-staffing witness is p13b-rival-scientist-staffing.test.ts) ──
//
// STAGED FILE — not under tests/. Independent-test-engineer authored RED, mode IMPLEMENT
// (staged test source + evidence only, no live-tree edit, no execution by the author).
// Requirement source, read in full and binding: 1305-A (parent proposal, frozen), 1305-B
// (independent contract-auditor review, REFINE, 3 amendments), 1305-F (parent adoption,
// amendments 1-3 controlling). Companion: P14-PREPARATION-COMPANION.md §2.1.9, §3.2 (the
// charge law), §3.4 (refusal/disclosure), §3.5 E4 (rival symmetry cost check), §3.6.
//
// LAW UNDER TEST (1305-A Law, amended by 1305-F amendments 1-3):
//   1. charge = terminationCost(terms, week) [[weekly x min(remaining,26)]], debited from
//      rival Cash as movement kind `termination`, lump sum, ungated by solvency.
//   2. effective end = release week: row.endedWeek = week, leaves activeEmploymentOrdinals,
//      one employment end receipt reason 'termination' (fromStudioId = rival, toStudioId = null).
//   3. the person joins state.freeAgents that week (amendment 1: finishHollywoodWeek is the
//      ONE owner — it already unions expired rows by endWeekExclusive<=week; the amended
//      contract is that it ALSO unions the talentId of every rival employment end receipt
//      with reason 'termination' at this week; no second list is threaded through
//      advanceHollywoodWeek).
//   4. R2 binds rivals: a person seated on the rival's own production/writing/research seat
//      cannot be released.
//   5. R1 binds rivals: a later re-hire by the SAME releasing rival prices through the
//      already-landed, already-studio-agnostic `releaseFloor`/`studioOffer`
//      (talentMarket.ts:209-259 — confirmed by source read, not asserted on faith: the
//      player-only branch at :223-224 only SKIPS a candidate memory when
//      releasingStudioId===playerStudioId AND no ledger row exists; for any OTHER
//      releasingStudioId that guard never fires, so a rival's own memory is read exactly
//      like the player's).
//
// STRATEGY UNDER TEST (1305-A Strategy, amended by 1305-F amendment 2): inside staff(),
// after the slot loop, a rival releases a surplus own-active-employee (ascending employment-
// ordinal order) only when ALL hold:
//   (a) not seated on this rival's own production/writing/research (industryBusyTalentIds
//       plus an unreleased seat on this rival's own technology project);
//   (b) more than HIRING_TERMINATION_CAP_WEEKS (26) weeks remain;
//   (c) no open or current promise issued by this rival to this person;
//   (d) Cash after the charge >= operatingReserve computed WITHOUT this employee.
// "Surplus" (amendment 2, the corrected premise): an own active employee whose role is
// outside RIVAL_TEAM_ROLES and not scientist (UNSATISFIABLE today — CreativeRole is exactly
// {writer,director,actor,craft,scientist} and RIVAL_TEAM_ROLES already covers the first four;
// confirmed src/core/types.ts:18-19), OR a team-role employee beyond that role's count in
// RIVAL_TEAM_ROLES after the slot loop. Scientists are NEVER R3-surplus.
//
// SYNTHETIC SURPLUS MECHANISM (amendment 3, the ONLY fabrication this file performs): the
// real transition primitive `advanceProfessionTransitions` (professionTransitions.ts:139-197)
// is NOT usable here — it throws "still holds work or employment" for anyone with an active
// employment row (professionTransitions.ts:163-164), which every rival team-role employee
// has by construction. Per amendment 3's "otherwise" clause: a single labeled `Talent.role`
// rewrite. Concretely: the rival's founding CRAFT employee (`person-${studioId}-5`,
// RIVAL_TEAM_ROLES[5]==='craft', hollywoodStartingData.ts:46) has their `Talent.role`
// rewritten, and ONLY their role, from 'craft' to 'actor'. This makes the rival's own-actor
// count 4 against a 3-actor target — the slot loop's `.slice(0,3)` (hollywoodTick.ts:198,
// employment-ordinal order) retains the 3 ORIGINAL actors (lower ordinals) and leaves this
// reassigned person unretained: a genuine instance of "a team-role employee beyond that
// role's count in RIVAL_TEAM_ROLES after the slot loop." No other fact of the state is
// touched by this rewrite function. See `withSurplusActor` below — it is called EXACTLY once
// per test, always on the SAME craft-role founder, always changing only `.role`.
//
// FIXTURE: `p13aGeneratedStudio()` (harness default seed 'p13a-core-causal-01'), the SAME
// seed and row-2-rival facts already measured and pinned by tests/p14a1-rival-trigger.test.ts
// (read in full): row 2's rival enters at week 0 (RIVAL_ARRIVAL_WEEKS[1]===0,
// src/core/calendar.ts:3), signs its fixed 6-person founding roster on ONE 208-week contract
// all starting week 0, and the founding roster's renewal window opens together at week 196
// (`renewalWindowOpen` opens at 0<remaining<=12). HOLLYWOOD_DECISION_WEEKS===1
// (tuning.ts:29), so staff()/decide() run EVERY week for every entered rival — no cadence
// bookkeeping is needed to land on a "decision week."
//
// INTERPRETATIONS NAMED (RED-by-design, matching the project's own precedent style in
// p14a1-rival-trigger.test.ts):
//   1. R3 is assumed to live inside staff() and to be observable purely through its PUBLIC
//      effects (employment row, receipt, freeAgents, rival Cash movement) reached via
//      tick() — no new exported symbol is assumed or imported from hollywoodTick.ts (staff()
//      itself is not exported; only advanceHollywoodWeek/finishHollywoodWeek are, and this
//      file never imports either directly — tick() alone drives both in the right order,
//      exactly as tests/p14a1-rival-trigger.test.ts already does).
//   2. `terminationCost` (src/core/employment.ts:197-200) is assumed to be the exact charge
//      function R3 calls — this is 1305-A Law item 1 verbatim, not an implementation guess.
//   3. The RIVAL_MONEY_KINDS widening to include `termination` is assumed as the movement
//      key name (1305-A Persistence: "`termination` joins RivalMoneyKind and
//      RIVAL_MONEY_KINDS"). Reading `period.movements.termination` against TODAY's
//      RivalFinancePeriod type (hollywoodTypes.ts:53-55, no `termination` key) is expected to
//      read `undefined` at runtime under esbuild/vitest's untyped transpile (no compile-time
//      type gate blocks the test from loading) and fail the numeric assertion — a real,
//      non-spurious RED, not an import-binding accident (RED-first tests import from a
//      missing module memory note does not apply: nothing here is a named import from a
//      not-yet-existing module).
//
// STOP RULE APPLIED: no fabricated state beyond the one labeled `Talent.role` rewrite
// (`withSurplusActor`). Two of the four strategy-failure leaves (promise open/current;
// cash below reserve) could not be reached this way without EITHER executing the
// not-yet-built R3 mechanism (impossible — it doesn't exist) or fabricating additional state
// (a forged promise/proposal chain, or a hand-set `account.cash`) beyond that one rewrite;
// both are STOPPED below (`it.skip`) with the reason recorded in the test and in the 1305-C
// handback, per instruction: "if a premise cannot be reached publicly, stop that leaf and
// report." The R1 re-hire-pricing leaf is ALSO stopped for the same reason (a rival re-hire
// of a PREVIOUSLY-RELEASED person needs a real release to have already happened — which
// needs R3 to exist — or a forged termination receipt, which is the same kind of
// out-of-scope fabrication); see the handback for why `releaseFloor`/`studioOffer` are
// independently confirmed NOT to need any R3 change (they are already releasing-studio
// generic), so this is a coverage gap in SEQUENCING, not a missing production fact.

import { describe, expect, it } from 'vitest'
import { tick } from '../../../../../../../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../../../../../../../src/harness/p13a/fixtures.js'
import { commitPlacement } from '../../../../../../../src/core/placement.js'
import { terminationCost } from '../../../../../../../src/core/employment.js'
import { industryBusyTalentIds, rivalWeeklyOperatingCost, studioEmployerId } from '../../../../../../../src/core/hollywood.js'
import { RIVAL_TEAM_ROLES } from '../../../../../../../src/core/hollywoodStartingData.js'
import type { GameState } from '../../../../../../../src/core/types.js'

function rowStudioId(state: GameState, row: number): string {
  return state.hollywood!.identities.find((s) => s.row === row)!.studioId
}

/** The ONE synthetic fact this file introduces (amendment 3): a single labeled
 * `Talent.role` rewrite of the rival's founding craft employee, and nothing else. */
function withSurplusActor(state: GameState, personId: string): GameState {
  const person = state.talent.find((t) => t.id === personId)
  if (!person) throw new Error(`p14r3 fixture: ${personId} not found in state.talent`)
  if (person.role !== 'craft') throw new Error(`p14r3 fixture: expected ${personId} to be 'craft' before the labeled rewrite, was '${person.role}'`)
  return { ...state, talent: state.talent.map((t) => (t.id === personId ? { ...t, role: 'actor' as const } : t)) }
}

function activeEmployment(state: GameState, studioId: string, talentId: string) {
  return state.hollywood!.activeEmploymentOrdinals
    .map((i) => state.hollywood!.employment[i]!)
    .find((e) => e.studioId === studioId && e.terms.talentId === talentId)
}

function endReceiptsFor(state: GameState, contractId: string) {
  return state.hollywood!.receipts.filter(
    (r): r is Extract<typeof r, { kind: 'employment' }> => r.kind === 'employment' && r.contractId === contractId && r.toStudioId === null,
  )
}

const BASE = p13aGeneratedStudio() // seed 'p13a-core-causal-01', matches p14a1-rival-trigger.test.ts
const ROW2 = rowStudioId(BASE, 2)
const CRAFT_ID = `person-${ROW2}-5` // RIVAL_TEAM_ROLES[5] === 'craft'

describe('P14 1305-C R3: rival early release — decision and effects (happy path, all four strategy conditions hold)', () => {
  it('releases the synthetic-surplus employee exactly at the tested week: charge, movement, end receipt, ordinal removal, freeAgents, signability', () => {
    const WEEK = 20 // >26 weeks before the founding contract's endWeekExclusive (208) and
    // far inside the pre-renewal-window span (renewal opens 196) — chosen so conditions
    // (b) is trivially true by construction; see sanity assertions below for (a)/(c)/(d).
    let state = advanceTo(BASE, WEEK)
    const before = activeEmployment(state, ROW2, CRAFT_ID)
    if (!before) throw new Error(`p14r3 premise: ${CRAFT_ID} is not actively employed by ${ROW2} at week ${WEEK}`)
    expect(before.terms.talentId).toBe(CRAFT_ID)
    const remaining = before.terms.endWeekExclusive - WEEK
    expect(remaining).toBeGreaterThan(26) // sanity: condition (b) genuinely holds

    state = withSurplusActor(state, CRAFT_ID) // the ONE labeled fabrication

    // Sanity for condition (a): not seated on the rival's own busy set before the tick.
    expect(industryBusyTalentIds(state.hollywood).has(CRAFT_ID)).toBe(false)
    // Sanity for condition (c): no promise exists anywhere in this fresh, unmodified world.
    expect(state.promises.length).toBe(0)
    // Sanity for condition (d): cash is comfortably above reserve plus the charge (founding
    // capital is $20M-$38M per hollywoodStartingData.ts; weekly operating cost for a 6-person
    // team is on the order of $1e5 per companion §3.5 E4's worked MID-team figure).
    const business = state.hollywood!.businesses.find((b) => b.studioId === ROW2)!
    const reserve = rivalWeeklyOperatingCost(business, state.hollywood!, WEEK) * business.policy.reserveWeeks
    const expectedCharge = terminationCost(before.terms, WEEK)
    expect(business.account.cash).toBeGreaterThan(reserve + expectedCharge + 1_000_000)

    const next = tick(state)

    // Effect 1: the charge, debited as movement kind `termination` (RED today —
    // RivalFinancePeriod carries no `termination` key; see INTERPRETATIONS 3 above). A
    // cash-delta assertion (cashBefore - charge) is deliberately NOT made here: the same
    // week can carry unrelated credits (e.g. `studioRevenue` from an ongoing theatrical run)
    // or debits (a replacement craft hire's signing bonus, from the slot loop's own,
    // unrelated, already-correct behavior — see file header), so a cash-delta bound would be
    // a fragile, potentially-false-failing proxy for the one precise fact under test: the
    // `termination` movement itself, asserted exactly below.
    const nextBusiness = next.hollywood!.businesses.find((b) => b.studioId === ROW2)!
    const period = nextBusiness.account.periods[nextBusiness.account.periods.length - 1]!
    expect((period.movements as unknown as Record<string, number>).termination).toBe(-expectedCharge)

    // Effect 2: effective end this week, ordinal removed.
    const row = next.hollywood!.employment.find((e) => e.contractId === before.contractId)!
    expect(row.endedWeek).toBe(WEEK)
    expect(activeEmployment(next, ROW2, CRAFT_ID)).toBeUndefined()

    // Effect 3: exactly one end receipt, reason 'termination', rival -> null.
    const ends = endReceiptsFor(next, before.contractId)
    expect(ends).toHaveLength(1)
    expect(ends[0]!.reason).toBe('termination')
    expect(ends[0]!.fromStudioId).toBe(ROW2)
    expect(ends[0]!.week).toBe(WEEK)

    // Effect 4: freeAgents entry and signability this week (after finishHollywoodWeek, which
    // tick() calls in the same pass — src/core/tick.ts:1139).
    expect(next.freeAgents).toContain(CRAFT_ID)
    expect(studioEmployerId(next, CRAFT_ID, WEEK)).toBeNull()
  })
})

describe('P14 1305-C R3: one leaf per failed strategy condition keeps the person', () => {
  it('condition (b) fails — 26 or fewer weeks remain (still outside the 12-week renewal window): the person is kept', () => {
    const WEEK = 190 // 208-190=18 remaining: <=26 (condition b fails) and >12 (not yet a
    // case subject, so this is a clean test of (b) alone, not entangled with the renewal
    // loop's own case-open exclusion at hollywoodTick.ts:110).
    let state = advanceTo(BASE, WEEK)
    const before = activeEmployment(state, ROW2, CRAFT_ID)!
    expect(before.terms.endWeekExclusive - WEEK).toBe(18)
    state = withSurplusActor(state, CRAFT_ID)
    // Sanity: conditions (a)/(c) still hold at this later week (isolating (b) alone).
    expect(industryBusyTalentIds(state.hollywood).has(CRAFT_ID)).toBe(false)
    expect(state.promises.length).toBe(0)
    const next = tick(state)
    expect(activeEmployment(next, ROW2, CRAFT_ID)).toBeDefined()
    expect(endReceiptsFor(next, before.contractId)).toHaveLength(0)
  })

  it('condition (a) fails — seated on the rival\'s own active production keeps the person (bounded natural search, weeks 1..150, NOT the synthetic rewrite)', () => {
    // Busy-set membership (industryBusyTalentIds) is keyed by talentId occurring in a
    // production's cast/craftIds/writerId/directorId fields, independent of current
    // Talent.role — so the search below runs on the UNMODIFIED founding craft employee
    // (still genuinely 'craft'); the one labeled rewrite is applied only once a matching
    // week is found, exactly as everywhere else in this file.
    let state = BASE
    let found: GameState | null = null
    while (state.market.tick < 150) {
      if (industryBusyTalentIds(state.hollywood).has(CRAFT_ID)) { found = state; break }
      state = tick(state)
    }
    if (!found) {
      throw new Error(
        'p14r3 leaf (a): no week in [0,150) shows the rival founding craft employee naturally seated on an ' +
        'active production, writing assignment or research seat via industryBusyTalentIds. STOP (per instruction): ' +
        'this leaf\'s premise is not confirmed reachable via public ticks without execution; see 1305-C handback.',
      )
    }
    const week = found.market.tick
    expect(week + 26).toBeLessThan(208) // sanity: condition (b) still holds at the found week
    const before = activeEmployment(found, ROW2, CRAFT_ID)!
    const surplus = withSurplusActor(found, CRAFT_ID)
    const next = tick(surplus)
    expect(activeEmployment(next, ROW2, CRAFT_ID)).toBeDefined()
    expect(endReceiptsFor(next, before.contractId)).toHaveLength(0)
  })

  it.skip(
    'condition (c) fails — an open/current promise from this rival to the person keeps them: STOPPED, not written. ' +
    'attachPromise (promises.ts:690) requires an EXISTING proposal from this issuer to this person ' +
    '(state.talentMarket.proposals.find(...), promises.ts:702-705), which under P14A only exists for a person ' +
    'inside an OPEN CASE — i.e. inside the 12-week renewal window (remaining<=12), which is INCOMPATIBLE with ' +
    'condition (b) (more than 26 weeks remain) at the SAME contract. A promise attached during an EARLIER case ' +
    '(a prior contract\'s renewal) could still be open on a later, longer contract, but constructing that requires ' +
    'driving an entire proposal/settlement cycle via public actions not verified to exist for rival-authored ' +
    'promises in this pass, or fabricating a promise/proposal pair directly (state beyond the one labeled role ' +
    'rewrite). Per the stop rule this leaf is not written; see 1305-C handback for the parent-prerequisite note.',
    () => {},
  )

  it.skip(
    'condition (d) fails — cash after the charge is below reserve computed without the person: STOPPED, not written. ' +
    'Founding rival capital is $20M-$38M (hollywoodStartingData.ts) against a ~$1e5/week operating cost ' +
    '(companion §3.5 E4\'s worked MID-team figure); depleting cash to within one termination charge of reserve via ' +
    'ONLY public ticks (no fabricated account.cash) was not judged reachable within a bounded, statable tick count ' +
    'without executing the simulation to check. Per the stop rule this leaf is not written; see 1305-C handback.',
    () => {},
  )
})

describe('P14 1305-C R3: Scientists are never R3-surplus', () => {
  // Reuses the measured natural route from tests/bridge-p13b-s8-rivals.test.ts (read in
  // full; not re-derived here): seed 'p13b-s8-bridge-probe-01', a player Research
  // Laboratory committed at week 0, advanced to week 265 — "rival r01 ... instrument
  // operational week 265, four Scientists seated week 265" (that file's own measured-fact
  // header, probed via vite-node against the landed engine 2026-09-18, not invented here).
  it('a rival with employed Scientists and no surplus team-role employee releases nobody (natural world, no synthetic rewrite)', () => {
    const withPlayerLab = commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-probe-01'), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    const atWeek265 = advanceTo(withPlayerLab, 265)
    const r01 = atWeek265.hollywood!.businesses[0]!
    const scientistIds = atWeek265.hollywood!.activeEmploymentOrdinals
      .map((i) => atWeek265.hollywood!.employment[i]!)
      .filter((e) => e.studioId === r01.studioId && atWeek265.talent.find((t) => t.id === e.terms.talentId)?.role === 'scientist')
      .map((e) => e.terms.talentId)
    expect(scientistIds.length).toBeGreaterThan(0) // precondition per the cited measured fact

    // Precondition: no team-role surplus exists on r01 at this week (own-employee count per
    // RIVAL_TEAM_ROLES role does not exceed that role's target count).
    const ownByRole = new Map<string, number>()
    for (const i of atWeek265.hollywood!.activeEmploymentOrdinals) {
      const e = atWeek265.hollywood!.employment[i]!
      if (e.studioId !== r01.studioId) continue
      const role = atWeek265.talent.find((t) => t.id === e.terms.talentId)?.role
      if (role && role !== 'scientist') ownByRole.set(role, (ownByRole.get(role) ?? 0) + 1)
    }
    const targetByRole = new Map<string, number>()
    for (const role of RIVAL_TEAM_ROLES) targetByRole.set(role, (targetByRole.get(role) ?? 0) + 1)
    for (const [role, count] of ownByRole) expect(count).toBeLessThanOrEqual(targetByRole.get(role) ?? 0)

    const next = tick(atWeek265)
    for (const scientistId of scientistIds) {
      const row = next.hollywood!.employment.find((e) => e.studioId === r01.studioId && e.terms.talentId === scientistId && e.endedWeek === atWeek265.market.tick)
      expect(row).toBeUndefined() // no scientist ended this week
    }
    expect(next.hollywood!.receipts.filter((r) => r.kind === 'employment' && r.studioId === r01.studioId && r.reason === 'termination')).toHaveLength(0)
  })
})

describe('P14 1305-C R3: worlds without surplus are unaffected (comparison method stated below)', () => {
  // Comparison method: R3's own logic (once implemented) never finds surplus on an
  // unmodified natural world if own-employee counts per RIVAL_TEAM_ROLES role never exceed
  // that role's target — which this describe block confirms is true for weeks 1..150 on the
  // default fixture across all four founding rivals (rows 1-4, all entered week 0). If R3's
  // logic is correct, "no surplus found" implies "no termination receipt written" and
  // "no employment row ends early for reason other than renewal" — both asserted directly
  // below. This does NOT depend on R3 being absent from production (it reads the SAME
  // receipts/rows R3 itself would write); it depends on R3 correctly finding zero surplus
  // on a genuinely unmodified world, which is the actual claim under test.
  it('no rival ever exceeds its RIVAL_TEAM_ROLES role counts, and no rival termination receipt appears, across weeks 1..150 on all four founding rivals', () => {
    let state = BASE
    while (state.market.tick < 150) {
      state = tick(state)
      for (const business of state.hollywood!.businesses) {
        const ownByRole = new Map<string, number>()
        for (const i of state.hollywood!.activeEmploymentOrdinals) {
          const e = state.hollywood!.employment[i]!
          if (e.studioId !== business.studioId) continue
          const role = state.talent.find((t) => t.id === e.terms.talentId)?.role
          if (role && role !== 'scientist') ownByRole.set(role, (ownByRole.get(role) ?? 0) + 1)
        }
        const targetByRole = new Map<string, number>()
        for (const role of RIVAL_TEAM_ROLES) targetByRole.set(role, (targetByRole.get(role) ?? 0) + 1)
        for (const [role, count] of ownByRole) {
          expect(count, `week ${state.market.tick} studio ${business.studioId} role ${role}`).toBeLessThanOrEqual(targetByRole.get(role) ?? 0)
        }
      }
    }
    const rivalTerminationReceipts = state.hollywood!.receipts.filter(
      (r) => r.kind === 'employment' && r.reason === 'termination' && r.studioId !== state.hollywood!.playerStudioId,
    )
    expect(rivalTerminationReceipts).toHaveLength(0)
  })
})
