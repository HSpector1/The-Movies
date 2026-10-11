// ── P14 task 1305-C, revised by 1308-C: R3 rival early release under the player's law (Save41
// companion is p14r3-save-v41.test.ts; the scientist-staffing witness is
// p13b-rival-scientist-staffing.test.ts) ──
//
// STAGED FILE. Import paths below are written for this file's INTENDED destination,
// `tests/p14r3-rival-release.test.ts` (one level below repo root, beside every other
// `tests/*.test.ts`). It is physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1308-stage/tests/ and
// has NOT been executed, type-checked, or moved from there by this author. 1308-C REVISIONS
// versus the original 1305-C stage (1305-D REFINE, required changes 1-2; full accounting in
// the 1308-C handback): (1) import paths corrected from the 1305-stage physical-location
// depth to the destination tests/ depth (mechanical only, no logic change); (2) the wrong
// hollywoodTick.ts:198 citation for the slot loop corrected to :138-141 (SYNTHETIC SURPLUS
// MECHANISM note below); (3) the "worlds without surplus" describe block renamed to claim
// only the invariant it actually checks, not 1305-A's stronger "byte-identical" framing;
// (4) the happy-path leaf's WEEK moved 20 -> 22: the parent's measured probe (mid-task
// message, E/1308-P-r3-unseated-probe.ts/.txt, unchanged HEAD 3c6a7732) found CRAFT_ID
// genuinely seated (industryBusyTalentIds) at week 20 on the rival's own active production,
// which would fail that leaf's own condition-(a) sanity check before any R3 law runs; week 22
// is on the same probe's measured unseated list for this person. Independent-test-engineer
// authored RED, mode IMPLEMENT (staged test source + evidence only, no live-tree edit, no
// execution by the author). Requirement source, read in full and binding: 1305-A (parent
// proposal, frozen), 1305-B (independent contract-auditor review, REFINE, 3 amendments),
// 1305-F (parent adoption, amendments 1-3 controlling), 1305-D (independent RED review,
// REFINE, required changes 1-4, both applicable ones addressed here). Companion:
// P14-PREPARATION-COMPANION.md §2.1.9, §3.2 (the charge law), §3.4 (refusal/disclosure),
// §3.5 E4 (rival symmetry cost check), §3.6.
//
// 1308-C2 REVISIONS (parent dry run 1308-X against a scratch production draft; disposition
// 1308-F): (a) "Scientists are never R3-surplus" moved from `advanceTo(...,265)` to `266` —
// the state at week 265 has 0 employed Scientists and a deficit of 4 for every rival; the
// S8 sibling file's "week 265" fact is the RECEIPT week written during the tick that
// PROCESSES week 265, not the state before it (measured, 1308-Q-scientist-deficit-probe.txt).
// (b) LAW UNDER TEST item 4 below corrected: R2 itself binds rivals only for production and
// writing seats; the research-seat exclusion is a STRATEGY choice (1305-A), not part of R2's
// own law — the prior "production/writing/research" phrasing conflated the two (1308-D
// check 2 / 1308-F item 6, non-blocking, adopted).
//
// SAVE-VALIDATION EXCLUSION (parent mid-task note): the synthetic `Talent.role` rewrite
// (`withSurplusActor`) makes the state fail `validateSaveV41` by design (profession history:
// a role change without its anchored change-history row) — no leaf in this file pipes a
// rewritten state through `makeSave`/`validateSaveV41`, and none did before this note either;
// recorded here for the record, not as a code change.
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
//   4. R2 binds rivals for PRODUCTION and WRITING seats only (1305-A Law item 4, verbatim:
//      "R2 binds rivals: a person seated on the rival's active production or writing for it
//      cannot be released" — 1308-D check 2 / 1308-F item 6, correcting the 1305-C/1308-C
//      draft's "production/writing/research" phrasing, which conflated law with strategy).
//      The STRATEGY (item below) is stricter than R2 by CHOICE and additionally never
//      touches a research seat (1305-A Strategy: "the strategy is stricter than R2 and never
//      touches a research seat, so no rival research release handler is needed") — no leaf in
//      this file asserts a legal refusal for a research-seated rival release; only the
//      strategy's own exclusion is exercised.
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
// count 4 against a 3-actor target — staff()'s own slot loop (hollywoodTick.ts:138-141, no
// `.slice`; CORRECTED CITATION, 1305-D required change 1 — hollywoodTick.ts:198's `.slice(0,3)`
// is inside decide()'s cast-selection, a different function, and was the wrong line number in
// the 1305-C draft) retains the 3 ORIGINAL actors first: `currentEmployees` (hollywoodTick.ts:
// 56-58) returns `own` in `activeEmploymentOrdinals` order, which is mint order (writer=0,
// director=1, actor=2/3/4, craft=5 — hollywood.ts:225,231), so the three `'actor'` slot
// iterations' `own.find(...)` retains the 3 lower-ordinal genuine actors before the relabeled
// ordinal-5 craft->actor person is ever reached, leaving this reassigned person unretained: a
// genuine instance of "a team-role employee beyond that role's count in RIVAL_TEAM_ROLES after
// the slot loop." No other fact of the state is touched by this rewrite function. See
// `withSurplusActor` below — it is called EXACTLY once per test, always on the SAME craft-role
// founder, always changing only `.role`.
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
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import { commitPlacement } from '../src/core/placement.js'
import { terminationCost } from '../src/core/employment.js'
import { industryBusyTalentIds, rivalCapacityOpex, rivalWeeklyOperatingCost, studioEmployerId } from '../src/core/hollywood.js'
import { RIVAL_TEAM_ROLES } from '../src/core/hollywoodStartingData.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'

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
    const WEEK = 22 // >26 weeks before the founding contract's endWeekExclusive (208) and
    // far inside the pre-renewal-window span (renewal opens 196) — chosen so condition (b) is
    // trivially true by construction; see sanity assertions below for (a)/(c)/(d). WEEK=22, not
    // 20: the parent's measured probe (E/1308-P-r3-unseated-probe.ts/.txt, unchanged HEAD
    // 3c6a7732, weeks 0-190) shows CRAFT_ID (person-studio-aca408ec-r02-5) IS seated
    // (industryBusyTalentIds) at week 20 on the rival's own active production — the condition
    // (a) sanity below would fail there before any R3 law is exercised. Week 22 is on the
    // probe's own unseated list for this person (0,1,2,3,4,13,22,31,40,...,115-190).
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
  // Reuses the seed and route from tests/bridge-p13b-s8-rivals.test.ts (read in full; not
  // re-derived here): seed 'p13b-s8-bridge-probe-01', a player Research Laboratory committed
  // at week 0. WEEK CORRECTED TO 266 (1308-X defect 2 / 1308-F item 3 / 1308-Q): the sibling
  // file's own header cites "instrument operational week 265, four Scientists seated week
  // 265," but that S8 fact is the RECEIPT week written during the tick that PROCESSES week
  // 265 — the STATE at week 265 (before that tick runs) still shows 0 employed Scientists and
  // a deficit of 4 for every rival; from state week 266 onward r01 employs 4 with deficit 0.
  // Measured on the unchanged engine (1308-Q-scientist-deficit-probe.txt, HEAD 7af5412c):
  // "265 r01 sci 0 deficit 4 cashOK true" / "266 r01 sci 4 deficit 0 cashOK true" through 420.
  it('a rival with employed Scientists and no surplus team-role employee releases nobody (natural world, no synthetic rewrite)', () => {
    const withPlayerLab = commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-probe-01'), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    const atWeek266 = advanceTo(withPlayerLab, 266)
    const r01 = atWeek266.hollywood!.businesses[0]!
    const scientistIds = atWeek266.hollywood!.activeEmploymentOrdinals
      .map((i) => atWeek266.hollywood!.employment[i]!)
      .filter((e) => e.studioId === r01.studioId && atWeek266.talent.find((t) => t.id === e.terms.talentId)?.role === 'scientist')
      .map((e) => e.terms.talentId)
    expect(scientistIds.length).toBeGreaterThan(0) // precondition per the measured fact above

    // Precondition: no team-role surplus exists on r01 at this week (own-employee count per
    // RIVAL_TEAM_ROLES role does not exceed that role's target count).
    const ownByRole = new Map<string, number>()
    for (const i of atWeek266.hollywood!.activeEmploymentOrdinals) {
      const e = atWeek266.hollywood!.employment[i]!
      if (e.studioId !== r01.studioId) continue
      const role = atWeek266.talent.find((t) => t.id === e.terms.talentId)?.role
      if (role && role !== 'scientist') ownByRole.set(role, (ownByRole.get(role) ?? 0) + 1)
    }
    const targetByRole = new Map<string, number>()
    for (const role of RIVAL_TEAM_ROLES) targetByRole.set(role, (targetByRole.get(role) ?? 0) + 1)
    for (const [role, count] of ownByRole) expect(count).toBeLessThanOrEqual(targetByRole.get(role) ?? 0)

    const next = tick(atWeek266)
    for (const scientistId of scientistIds) {
      const row = next.hollywood!.employment.find((e) => e.studioId === r01.studioId && e.terms.talentId === scientistId && e.endedWeek === atWeek266.market.tick)
      expect(row).toBeUndefined() // no scientist ended this week
    }
    expect(next.hollywood!.receipts.filter((r) => r.kind === 'employment' && r.studioId === r01.studioId && r.reason === 'termination')).toHaveLength(0)
  })
})

describe('P14 R3 and recovery: natural role targets and accounted cutting releases', () => {
  // 1363-A §4.2 changes surplus while cutting; no role-count excess is needed then.
  // Preserve the original seed, 150 default ticks and every weekly role-count check.
  // Six releases are this measured route's witness, not a universal policy count.
  // 1368's accepted six-termination attribution establishes the week-91 commission
  // cash refusal. This leaf checks the persisted entry and complete-tick effects;
  // it does not claim to observe private decide()/staff() intermediate returns.
  it('keeps role targets and accounts for every lawful cutting release across weeks 1..150', () => {
    type Business = NonNullable<GameState['hollywood']>['businesses'][number]
    type MoneyKind = keyof Business['account']['periods'][number]['movements']
    const total = (business: Business, kind: MoneyKind) =>
      business.account.periods.reduce((sum, period) => sum + period.movements[kind], 0)
    const rivalId = rowStudioId(BASE, 4)
    const expectedCharges = [367016, 395070, 189514, 447746, 197600, 366730]
    const expected = expectedCharges.map((_, i) => ({
      talentId: `person-${rivalId}-${i}`,
      contractId: `${rivalId}:contract:person-${rivalId}-${i}:0`,
      week: 92, studioId: rivalId, fromStudioId: rivalId, toStudioId: null,
      kind: 'employment', reason: 'termination', eventId: `industry-event-${145 + i}`,
    }))
    let state = BASE
    while (state.market.tick < 150) {
      const before = state
      const week = before.market.tick
      state = tick(state)
      const newEnds = state.hollywood!.receipts.slice(before.hollywood!.receipts.length).filter(
        (r): r is Extract<typeof r, { kind: 'employment' }> =>
          r.kind === 'employment' && r.reason === 'termination' && r.studioId !== state.hollywood!.playerStudioId,
      )
      if (week === 91) {
        const prior = before.hollywood!.businesses.find(b => b.studioId === rivalId)!
        const entered = state.hollywood!.businesses.find(b => b.studioId === rivalId)!
        expect(prior.costCutting.since).toBeNull()
        expect(entered.costCutting.since).toBe(91)
        expect(entered.productions).toEqual([])
        expect(entered.runs).toEqual([])
        expect(entered.development.projects).toHaveLength(prior.development.projects.length)
        expect(entered.activeScriptOrdinals.map(i => entered.development.projects[i]!)
          .filter(p => p.status === 'drafting' || p.status === 'rewriting')).toEqual([])
        // The lawful earlier refund remains in history; it is not release-week income.
        expect(total(entered, 'facilityDemolitionRefund') - total(prior, 'facilityDemolitionRefund')).toBe(450000)
      }
      for (const prior of before.hollywood!.businesses) {
        const next = state.hollywood!.businesses.find(b => b.studioId === prior.studioId)!
        const ends = newEnds.filter(r => r.studioId === prior.studioId)
        let chargeSum = 0
        if (ends.length > 0) {
          expect(week).toBe(92)
          expect(prior.studioId).toBe(rivalId)
          expect(prior.costCutting.since).toBe(91)
          expect(next.costCutting.since).toBe(91)
          expect(ends).toEqual(expected)
          const own = before.hollywood!.activeEmploymentOrdinals
            .filter(i => before.hollywood!.employment[i]!.studioId === prior.studioId)
          expect(own).toEqual([18, 19, 20, 21, 22, 23])
          const busy = industryBusyTalentIds(before.hollywood)
          const capacityOpex = rivalCapacityOpex(prior, before.hollywood!.receipts)
          let remaining = [...own]
          let cash = prior.account.cash
          for (const [index, receipt] of ends.entries()) {
            const ordinal = own[index]!
            const row = before.hollywood!.employment[ordinal]!
            expect(row.contractId).toBe(receipt.contractId)
            expect(row.terms.talentId).toBe(receipt.talentId)
            expect(row.endedWeek).toBeNull()
            expect(row.terms.startWeek).toBe(0)
            expect(row.terms.endWeekExclusive).toBe(208)
            expect(busy.has(receipt.talentId)).toBe(false)
            expect(before.technology.projects.filter(p => p.studioId === prior.studioId)
              .flatMap(p => p.seats.filter(s => s.releasedWeek === null && s.talentId === receipt.talentId))).toEqual([])
            expect(before.promises.filter(p => p.issuerStudioId === prior.studioId &&
              p.beneficiaryPersonId === receipt.talentId && p.outcome === null)).toEqual([])
            const salary = Math.round(row.terms.annualSalary / TUNING.TICKS_PER_YEAR)
            const termLeft = row.terms.endWeekExclusive - week
            expect(termLeft).toBeGreaterThan(TUNING.HIRING_TERMINATION_CAP_WEEKS)
            const charge = salary * Math.min(termLeft, TUNING.HIRING_TERMINATION_CAP_WEEKS)
            expect(charge).toBe(expectedCharges[index])
            expect(terminationCost(row.terms, week)).toBe(charge)
            const operatingCost = remaining.reduce((sum, i) => sum + Math.round(
              before.hollywood!.employment[i]!.terms.annualSalary / TUNING.TICKS_PER_YEAR), 0) +
              TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * remaining.length + capacityOpex
            const saving = salary + TUNING.OVERHEAD_PER_EMPLOYEE
            expect(cash - charge).toBeGreaterThanOrEqual((operatingCost - saving) * prior.policy.reserveWeeks)
            expect(charge * operatingCost).toBeLessThanOrEqual(cash * saving)
            cash -= charge
            chargeSum += charge
            remaining = remaining.filter(i => i !== ordinal)
            expect(state.hollywood!.employment[ordinal]).toEqual({ ...row, endedWeek: week })
            expect(state.hollywood!.activeEmploymentOrdinals).not.toContain(ordinal)
            expect(endReceiptsFor(state, row.contractId)).toEqual([receipt])
            expect(state.freeAgents).toContain(receipt.talentId)
            expect(studioEmployerId(state, receipt.talentId, week)).toBeNull()
          }
          expect(chargeSum).toBe(1963676)
          const kinds = Object.keys(prior.account.periods[0]!.movements) as MoneyKind[]
          let net = 0
          for (const kind of kinds) {
            const delta = total(next, kind) - total(prior, kind)
            const expectedDelta = kind === 'termination' ? -chargeSum :
              kind === 'overhead' ? -TUNING.OVERHEAD_BASE : kind === 'facilityOpex' ? -capacityOpex : 0
            expect(delta, `week ${week} ${kind}`).toBe(expectedDelta)
            net += delta
          }
          expect(capacityOpex).toBe(23500)
          expect(total(next, 'facilityDemolitionRefund')).toBe(total(prior, 'facilityDemolitionRefund'))
          // Only the sum of floating cash movements needs a rounding tolerance.
          expect(Math.abs(next.account.cash - prior.account.cash - net)).toBeLessThanOrEqual(0.00001)
          expect(next.account.periods.at(-1)!.closing).toBe(next.account.cash)
        }
        // A debit without a matching receipt, or an unexplained release at any
        // other rival/week, fails; no non-cutting receipts are filtered away.
        expect(total(next, 'termination') - total(prior, 'termination')).toBe(0 - chargeSum)
      }
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
    expect(rivalTerminationReceipts).toEqual(expected)
  })
})
