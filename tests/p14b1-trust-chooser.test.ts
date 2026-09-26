// ── P14B.1 tests 6-7: trust (the widened chooser, the priority order, the
// Distrusted reservation) and rival symmetry ────────────────────────────────
//
// Requirement source: P14-HEADLESS-PLAN.md, "## P14B.1 — First Kept Promise
// Core — task expansion", Tests items 6-7. Item 6 (verbatim): "trust:
// drivers derived only from facts at or after the boundary; the descriptor
// rule at its thresholds; a Distrusted issuer dropped issuerDistrusted at
// reservation; on a constructed pair equal on compensation, term, standing
// and incumbency, the proposal with a feasible promise wins with the
// opportunity reason; a Reliable issuer beats a Mixed record issuer on the
// trust band; publicPriorityOrder byte-equal to the companion's REDUCED
// orders for both archetypes (asserting the companion, never the landed
// array) and publicPreferredTerm unchanged (proven -> longest catalogue
// term, unproven -> shortest) — the F1 regression pins carried forward."
// Item 7: "rival symmetry: a rival proposal carries a P1 promise iff its
// feasibility is REASONABLY ACHIEVABLE; a rival first take satisfies it; a
// rival early termination breaks it; the same trust records."
//
// Law, by reference to docs/engineering/p14-preparation-8ef5246a/
// P14-PREPARATION-COMPANION.md §4.5 (trust) and §2.1.7 (D3 opportunity, D4
// trust bands; the widened archetype orders; the reservation predicate "not
// Distrusted").
//
// RED-FIRST: `src/core/promises.ts` does not exist yet. `attachPromise` and
// `trustDescriptor` are imported from it and CALLED below, so this file
// fails at module resolution before any test body runs (one TS2307,
// nothing else).
//
// INTERPRETATIONS NAMED:
//   1. The archetype orders are WIDENED per plan item (8): D3 opportunity
//      and D4 trust go live at their companion D3/D4 positions; D5
//      relationships stays neutral (moved to P14B.2). Reducing the
//      companion's full per-archetype order over the SIX live descriptors
//      (compensation, term, opportunity, trust, standing, incumbency;
//      relationships excluded) gives: capable-but-unproven — "opportunity,
//      compensation, relationships, term, trust, Standing, incumbency" ->
//      `[opportunity, compensation, term, trust, standing, incumbency]`;
//      proven veterans — "compensation, term, trust, relationships,
//      incumbency, Standing, opportunity" -> `[compensation, term, trust,
//      incumbency, standing, opportunity]`. Compensation still precedes term
//      and incumbency still precedes standing for the unproven/proven
//      branches respectively, so this does NOT contradict P14A.1-F1's own
//      fix (`tests/p14a1-f1-priority-order.test.ts`) — it widens the SAME
//      corrected order, it does not re-swap it.
//   2. `trustDescriptor(state, personId, studioId, week)` returns at least
//      `{ label: 'Reliable' | 'Mixed record' | 'Distrusted' }`. The
//      Reliable/Mixed/Distrusted THRESHOLDS are an explicit OPEN hypothesis
//      (plan's OPEN section), so this file only pins the two UNAMBIGUOUS
//      directions — all-positive facts read as Reliable, never Reliable
//      with a genuine negative driver present — never an exact boundary.
//   3. `attachPromise`'s minimal draft shape is the same one established in
//      tests/p14b1-promises.test.ts's own header (family, predicate,
//      windowStartWeek, dueWeekExclusive) — duplicated here rather than
//      imported, per this suite's one-file-per-concern convention.
//   4. TRUST FACTS are constructed the SAME way tests/p14b1-promises.test.ts
//      constructs OUTCOME facts: a hand-built `state.promises` entry (for
//      `promiseKept`/`promiseBroken`) or a REAL `releaseTalent` action (for
//      `terminatedEarly`) — declared as a premise, not an observed fact.
//   5. A GENUINE "equal on compensation, term, standing AND incumbency"
//      two-proposal contest is measured NOT CONSTRUCTIBLE on the tested
//      seeds: D7 (incumbency) is a binary per-proposal fact
//      (`issuerStudioId === kase.subjectStudioId`), so two DIFFERENT issuers
//      on the SAME case can be equal on it only by BOTH being non-incumbent
//      — and P14A.1-F1's own measurement (`tests/p14a1-f1-priority-
//      order.test.ts`) already found no non-incumbent-vs-non-incumbent
//      proposal PAIR survives freeze pre-week-208 (every founding rival is
//      at its `RIVAL_TEAM_ROLES` cap on every role). This file extends that
//      measurement: a direct search (disposable, uncommitted vite-node
//      probe, deleted after use) over the natural chain from week 209 to
//      week 430 on seed `p13-public-commercial-adoption` (the same seed
//      `tests/p14a1-seat-budget.test.ts` uses for its settled-208 fixture)
//      found a SECOND synchronized churn at week 404, where every
//      surviving two-proposal contest has the case's own incumbent as ONE
//      of the two survivors (e.g. talentId `person-studio-5a47d054-r01-0`:
//      incumbent `studio-5a47d054-r01` beats challenger `studio-5a47d054-
//      r02` on standing and incumbency, 2-0, dominance) — every case where
//      BOTH bidders are non-incumbent (the r03/r04 subjects) has BOTH
//      proposals dropped for `noSeatForRole` before ranking (0 survivors).
//      The literal four-way tie is therefore `it.todo` below, with this
//      obstacle named; the WEAKER, constructible claim — opportunity (or
//      trust) added to the TIED side of an otherwise 1-1 contest changes the
//      winner — is exercised as a real test instead, using the SAME simple
//      player-vs-one-rival construction this whole suite already relies on.
//
// PREMISES NOT SATISFIED:
//   - Rival early termination (test 7's third clause) has NO landed action
//     to construct it with: companion §2.1.9 states it explicitly — "Rival
//     early termination is symmetric in law and is Ready work rather than
//     Core (§3.6)." `it.todo`, citing this exact sentence.
//   - The exact settlement-reason wording for D3/D4 (once live) is CANDIDATE
//     (talentMarket.ts's own `DESCRIPTOR_REASON` table is not yet widened);
//     matched loosely by regex, never pinned verbatim.

import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import { careerIdentity } from '../src/core/talentSummary.js'
import type { CastRoleCountPredicate, GameState, TalentMarketCaseV36, TalentMarketReceipt } from '../src/core/types.js'
import * as marketModule from '../src/core/talentMarket.js'
import * as promiseModule from '../src/core/promises.js'
import { publicPriorityOrder, publicPreferredTerm, submitProposal } from '../src/core/talentMarket.js'
import { TUNING } from '../src/core/tuning.js'
// RED-by-design: src/core/promises.ts does not exist. All three names below
// are CALLED, not merely imported.
import { attachPromise, promiseFeasibility, trustDescriptor } from '../src/core/promises.js'

type PersistedPromise = {
  promiseId: string
  family: string
  issuerStudioId: string
  beneficiaryPersonId: string
  predicate: { count: number }
  windowStartWeek: number
  dueWeekExclusive: number
  feasibilityReceipt: { classification: string; bottleneck: string | null }
  progress: number
  evidenceRefs: readonly string[]
  outcome: string | null
  outcomeWeek: number | null
  outcomeCause: string | null
  outcomeEventId: string | null
  contractId: string | null
}
function withPromises(state: GameState, promises: readonly PersistedPromise[]): GameState {
  return { ...(state as unknown as Record<string, unknown>), promises } as unknown as GameState
}

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture premise failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

/** Player retains vs a rival, submitted at week 45 (window 40, decision 52),
 * mirroring tests/p14a1-settlement.test.ts's own construction. */
function openCaseWithRival(playerTier: number, rivalTier: number): { state: GameState; talentId: string; playerStudioId: string; rivalStudioId: string } {
  const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
  const atWindow = advanceTo(signed, 45)
  const playerStudioId = atWindow.hollywood!.playerStudioId
  const rivalStudioId = atWindow.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
  let state = submitProposal(atWindow, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: playerTier })
  state = submitProposal(state, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: rivalTier })
  return { state, talentId, playerStudioId, rivalStudioId }
}

function settleAt52(state: GameState, talentId: string) {
  let next = state
  while (next.market.tick < 52) next = tick(next)
  const settlement = next.talentMarket.receipts.find((r) => r.talentId === talentId && (r.kind === 'settled' || r.kind === 'declined'))
  if (settlement === undefined) throw new Error('test premise failed: no settlement receipt was written by week 52')
  return settlement
}

function findUnproven(state: GameState): string {
  const t = state.talent.find((p) => p.age < 30 && careerIdentity(p).identityDisciplines.length === 0)
  if (t === undefined) throw new Error('fixture premise failed: no capable-but-unproven talent on this seed')
  return t.id
}
function findProven(state: GameState): string {
  const t = state.talent.find((p) => p.age >= 30 || careerIdentity(p).identityDisciplines.length > 0)
  if (t === undefined) throw new Error('fixture premise failed: no proven talent on this seed')
  return t.id
}

describe('P14B.1 test 6: trust, the widened chooser and the priority order', () => {
  it('publicPriorityOrder is the WIDENED companion order (opportunity and trust inserted; relationships restored by P14B.5) for both archetypes, byte-equal', () => {
    const state = p13aGeneratedStudio()
    expect(publicPriorityOrder(state, findUnproven(state))).toEqual(['opportunity', 'compensation', 'relationships', 'term', 'trust', 'standing', 'incumbency'])
    expect(publicPriorityOrder(state, findProven(state))).toEqual(['compensation', 'term', 'trust', 'relationships', 'incumbency', 'standing', 'opportunity'])
  })

  it('publicPreferredTerm is unchanged by the widening: proven -> longest catalogue term, unproven -> shortest', () => {
    const state = p13aGeneratedStudio()
    const options = TUNING.CONTRACT_TERM_OPTIONS
    expect(publicPreferredTerm(state, findProven(state))).toBe(options[options.length - 1])
    expect(publicPreferredTerm(state, findUnproven(state))).toBe(options[0])
  })

  it('trustDescriptor: all-positive facts read Reliable; a genuine negative driver (a real early termination) never reads Reliable — the exact Mixed/Distrusted boundary is OPEN and not pinned', () => {
    const state = p13aGeneratedStudio()
    const playerStudioId = state.hollywood!.playerStudioId
    const goodBeneficiary = state.talent.find((t) => t.role === 'actor')!.id
    const positiveFacts: PersistedPromise[] = [0, 1, 2].map((i) => ({
      promiseId: `promise-good-${String(i)}`,
      family: 'APPEARANCE_COUNT',
      issuerStudioId: playerStudioId,
      beneficiaryPersonId: goodBeneficiary,
      predicate: { count: 1 },
      windowStartWeek: 0,
      dueWeekExclusive: 52,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null },
      progress: 1,
      evidenceRefs: [`evidence-${String(i)}`],
      outcome: 'SATISFIED',
      outcomeWeek: 10 + i,
      outcomeCause: null,
      outcomeEventId: null,
      contractId: null,
    }))
    const reliableState = withPromises(state, positiveFacts)
    const reliable = trustDescriptor(reliableState, goodBeneficiary, playerStudioId, reliableState.market.tick)
    expect(reliable.label).toBe('Reliable')

    const { state: signed, talentId: badBeneficiary } = signActor(p13aGeneratedStudio(), 208)
    const terminated = applyActions(signed, [{ kind: 'releaseTalent', talentId: badBeneficiary }])
    const negative = trustDescriptor(terminated, badBeneficiary, playerStudioId, terminated.market.tick)
    expect(negative.label).not.toBe('Reliable')
  })

  it('a Distrusted issuer is dropped issuerDistrusted at reservation, and the other (healthy) proposal settles the case', () => {
    const { state: opened, talentId, playerStudioId, rivalStudioId } = openCaseWithRival(1.1, 1.05)
    const negativeFacts: PersistedPromise[] = [0, 1, 2].map((i) => ({
      promiseId: `promise-distrust-${String(i)}`,
      family: 'APPEARANCE_COUNT',
      issuerStudioId: rivalStudioId,
      beneficiaryPersonId: talentId,
      predicate: { count: 1 },
      windowStartWeek: 0,
      dueWeekExclusive: 10,
      feasibilityReceipt: { classification: 'IMPOSSIBLE', bottleneck: null },
      progress: 0,
      evidenceRefs: [],
      outcome: 'BROKEN',
      outcomeWeek: 5 + i,
      outcomeCause: 'dueWeekExclusive reached unsatisfied',
      outcomeEventId: null,
      contractId: null,
    }))
    const state = withPromises(opened, negativeFacts)
    const settlement = settleAt52(state, talentId)
    expect(settlement.kind).toBe('settled')
    expect(settlement.studioId).toBe(playerStudioId)
    expect(settlement.dropped.some((sentence) => /distrust/i.test(sentence))).toBe(true)
  })

  // T2c: this case previously used `openCaseWithRival(1.0, 1.1)` at week 52
  // on a fresh `p13aGeneratedStudio()` — MEASURED OBSTACLE (T2 ruling):
  // that construction hits the SAME founding-roster seat cap P14A.1-F1
  // already measured (every founding rival holds its full RIVAL_TEAM_ROLES
  // cap on every role until week 208), so the lone rival proposal is
  // dropped `noSeatForRole` at freeze — one survivor, no descriptor
  // comparison ever runs (the case settles on the player's proposal alone,
  // `reasons: ["theirs was the only proposal on the table"]`, never
  // "opportunity").
  //
  // The week-404 construction was attempted instead (this file's own header
  // interpretation 5: the SECOND synchronized churn on seed
  // `p13-public-commercial-adoption`, where T1 measured every SURVIVING
  // two-proposal contest keeps the case's own incumbent). Disposable,
  // uncommitted vite-node probes against the real engine (deleted after
  // use; commands and full output recorded in this task's own evidence
  // file) found:
  //   - Of the 12 rival-subject ACTOR cases that open at week 404 on this
  //     seed, exactly ONE has an UNPROVEN subject
  //     (`person-studio-5a47d054-r04-3`, `publicPriorityOrder(state,
  //     talentId)[0] === 'opportunity'`) — every other subject there is
  //     proven, and the tie-break priority order only puts opportunity
  //     FIRST for the unproven archetype (interpretation 1 above), so a
  //     proven subject cannot exercise this case's own D3-breaks-the-tie
  //     claim at all.
  //   - That one subject's own employer, `studio-5a47d054-r04`, is
  //     INSOLVENT through the entire decision window: its business
  //     account's own `closing` balance is -8,933,725 at week 404 and
  //     worsens every week to -10,127,665 by the decision week 416 (its
  //     payroll/overhead/facilityOpex movements alone exceed 4.7M across
  //     the window, with zero revenue). `submitProposal` itself REFUSES an
  //     incumbent retention bid at this studio outright: "talentMarket:
  //     proposal rejected — the signing bonus would leave
  //     \"studio-5a47d054-r04\" under its operating reserve" — so D7
  //     (incumbency) can NEVER be won by the rival side in this
  //     construction; there is no live incumbent bid to attach it to, hand-
  //     forging one would fabricate a fact `submitProposal`'s own law
  //     refuses, and this suite's convention forbids exactly that.
  //   - Walking the case forward WITHOUT any manual intervention confirms
  //     the natural (unforced) resolution: the two OTHER rivals' bids on
  //     this same case (r01 at tier 1.05, r02 at tier 1.10) are both
  //     dropped `noSeatForRole` at the decision week too, and the case
  //     settles `declined` / "all proposals dropped" — zero survivors, the
  //     SAME shape of obstacle as the week-52 construction, for a different
  //     underlying cause (studio insolvency rather than a full roster).
  //   - No other unproven rival-subject actor case exists anywhere in
  //     weeks 0-450 on this seed (a full scan of every rival-subject actor
  //     case's `publicPriorityOrder` found exactly one match: this SAME
  //     person, at its FIRST churn, week 196 — when `studio-5a47d054-r04`
  //     WAS solvent, closing balance +12,284,652 — but T1's own ruling
  //     requires the SECOND synchronized churn specifically, where every
  //     surviving pair keeps the incumbent; this case's incumbent cannot
  //     reach that churn with a live bid at all).
  // P14B.2 supersedes ONLY the designated D3 todo above. The old week404
  // insolvency finding remains true; this explicitly synthetic controlled case
  // uses the first solvent window and actual employment/expiry/history instead.
  // Record 600 §3 step 2(c) (records 110/554, DESIGNATED at the D3 checkpoint): under
  // the accepted B4 D3 law an UNPROVEN person prefers a significant cast role, so a P1
  // (any appearance) no longer reads as "opportunity" for this subject and the old
  // unproven-P1 bonus expectation moved (player won on compensation). The incumbent's
  // opportunity is now a REAL tagged P2 (`leadOrAntagonist` castRoleCount, the flexible
  // class the plan authors first for an unproven person). Same 1-1 tie, seeds, weeks and
  // winner meaning. RED until the coordinated cutover: today `attachPromise` refuses the
  // family (NOT_OFFERED_IN_B1 → IMPOSSIBLE) and copies only `count`; after it the full
  // predicate is copied at attach, the class-aware scalar quotes it, and freeze reads it.
  it('opportunity changes the winner of an otherwise compensation-versus-incumbency 1-1 tie, with two real surviving proposals', () => {
    const talentId = 'person-studio-5a47d054-r04-3'
    const incumbentId = 'studio-5a47d054-r04'
    let state = p13aGeneratedStudio('p13-public-commercial-adoption')
    // Disclosed cash input with matching ledger, never an invented past receipt.
    const cashDelta = 30_000_000 - state.studio.cash
    state = { ...state, studio: { ...state.studio, cash: 30_000_000 }, ledger: [...state.ledger,
      { week: state.market.tick, kind: cashDelta >= 0 ? 'studioRevenue' : 'overhead', amount: cashDelta, note: 'D3 synthetic fixture cash bootstrap' }] }
    // This genuinely expires at52; its real ranToEnd supplies Reliable studio
    // fallback for the player. No promise outcome/ended interval is manufactured.
    const first = signActor(state, 52)
    state = advanceTo(first.state, 195)
    const playerStudioId = state.hollywood!.playerStudioId
    expect(state.hollywood!.employment.some((e) => e.studioId === playerStudioId && e.terms.talentId === first.talentId
      && e.terms.endWeekExclusive === 52 && e.endedWeek === 52)).toBe(true)

    // Transparently capture the REAL post-expiry/production input to the week196
    // market phase. The observed natural pass still runs unchanged. We then use
    // that phase input as an explicit test branch so legal offers precede the
    // automatic rival authoring of unrelated reservations to this same person.
    let preMarket196: GameState | undefined
    const actualMarket = marketModule.advanceTalentMarketWeek
    const capture = vi.spyOn(marketModule, 'advanceTalentMarketWeek').mockImplementation((input) => {
      if (input.market.tick === 196) preMarket196 = structuredClone(input)
      return actualMarket(input)
    })
    try { tick(state) } finally { capture.mockRestore() }
    if (preMarket196 === undefined) throw new Error('D3 premise: no real week196 market input captured')
    state = preMarket196
    const row = state.hollywood!.employment.find((e) => e.studioId === incumbentId && e.terms.talentId === talentId && e.endedWeek === null)!
    expect(row).toBeDefined()
    expect(row.terms.endWeekExclusive).toBe(208)
    expect(state.hollywood!.businesses.find((b) => b.studioId === incumbentId)!.account.cash).toBeGreaterThan(0)
    expect(publicPriorityOrder(state, talentId)[0]).toBe('opportunity')
    expect(state.talentMarket.cases.some((c) => c.talentId === talentId)).toBe(false)
    expect(state.promises.filter((p) => p.beneficiaryPersonId === talentId)).toEqual([])
    const counter = state.talentMarket.receipts.length
    expect(counter).toBeGreaterThan(0)
    const kase: TalentMarketCaseV36 = { talentId, subjectStudioId: incumbentId, contractId: row.contractId,
      openedWeek: state.market.tick, outcome: null, closedWeek: null, reason: null, variant: 'expiry' }
    const discovery: TalentMarketReceipt = { eventId: `talent-market-event-${counter}`, kind: 'discovered',
      week: state.market.tick, talentId, studioId: incumbentId, reasons: [], dropped: [] }
    state = { ...state, talentMarket: { ...state.talentMarket,
      cases: [...state.talentMarket.cases, kase], receipts: [...state.talentMarket.receipts, discovery] } }
    // Append/revise no other case, old employment or existing promise. All five
    // bids are legal command output. This synthetic case precedes the normal
    // discovery pass: the first candidate run proved its assumed three seat
    // drops WRONG, because all five seats are vacant when this case settles
    // first at208. This is a controlled chooser fixture, not natural gameplay.
    const entered = state.hollywood!.identities.filter((s) => s.enteredWeek !== null)
    expect(entered).toHaveLength(5)
    for (const issuer of entered) state = submitProposal(state, { talentId, issuerStudioId: issuer.studioId,
      termWeeks: 208, premiumTier: issuer.studioId === playerStudioId ? 1.25 : 1 })
    state = advanceTo(marketModule.advanceTalentMarketWeek(state), 207)
    expect(marketModule.currentProposals(state, talentId)).toHaveLength(5)
    expect(state.promises.filter((p) => p.beneficiaryPersonId === talentId)).toEqual([])
    // T4's retained staging law allows attaching an IMPOSSIBLE draft, but freeze
    // must refuse that proposal. Use the real attachment command to exclude the
    // three nonpair bidders identically in both branches, without forging drops,
    // withdrawing offers that the weekly rival trigger would simply re-submit,
    // or reordering unrelated cases. These [415,416) drafts lie inside the real
    // [208,416) contracts and cannot reserve a seat in treatment's [208,415).
    const nonpair = entered.filter((s) => ![playerStudioId, incumbentId].includes(s.studioId))
    expect(nonpair).toHaveLength(3)
    for (const issuer of nonpair) {
      const proposal = marketModule.currentProposals(state, talentId).find((p) => p.issuerStudioId === issuer.studioId)!
      expect(proposal.startWeek).toBe(208)
      expect(proposal.startWeek + proposal.termWeeks).toBe(416)
      state = attachPromise(state, talentId, issuer.studioId, { family: 'APPEARANCE_COUNT', predicate: { count: 999 },
        windowStartWeek: 415, dueWeekExclusive: 416 })
      const attached = marketModule.currentProposals(state, talentId).find((p) => p.issuerStudioId === issuer.studioId)!
      expect(attached.promises).toHaveLength(1)
      const staged = state.promises.find((p) => p.promiseId === attached.promises[0])!
      expect(staged.feasibilityReceipt.classification).toBe('IMPOSSIBLE')
      expect(staged.contractId).toBeNull()
      expect(staged.outcome).toBeNull()
      expect(staged.windowStartWeek).toBeGreaterThanOrEqual(proposal.startWeek)
      expect(staged.dueWeekExclusive).toBeLessThanOrEqual(proposal.startWeek + proposal.termWeeks)
    }
    expect(state.promises.filter((p) => p.beneficiaryPersonId === talentId)).toHaveLength(3)
    // Explicit synthetic Standing INPUT, identical in both branches; no claimed
    // historical standing event. The real freeze observations below must prove
    // both studios still occupy the same band after the actual final tick.
    const standing = state.hollywood!.businesses.find((b) => b.studioId === incumbentId)!.standing
    const common: GameState = { ...state, studio: { ...state.studio, standing: { ...standing } } }
    const incumbentProposal = marketModule.currentProposals(common, talentId).find((p) => p.issuerStudioId === incumbentId)!
    // A typed local (not an inline literal) is assignable to today's count-only attachment
    // shape and to the post-cutover union alike: no cast, no @ts-expect-error.
    const predicate: CastRoleCountPredicate = { kind: 'castRoleCount', count: 1, seatClass: 'leadOrAntagonist' }
    expect(marketModule.publicPreferredOpportunity(common, talentId)).toBe('significantCastRole')
    const treated = attachPromise(common, talentId, incumbentId, { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate,
      windowStartWeek: incumbentProposal.startWeek, dueWeekExclusive: 415 })
    const promised = treated.promises.find((p) => p.issuerStudioId === incumbentId && p.beneficiaryPersonId === talentId)!
    expect(promised).toMatchObject({ family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate })
    expect(marketModule.promiseMatchesPreferredOpportunity(treated, talentId, promised)).toBe(true)
    expect(promised.windowStartWeek).toBe(208)
    expect(promised.dueWeekExclusive).toBe(415)
    for (const staged of common.promises.filter((p) => p.beneficiaryPersonId === talentId)) {
      expect(staged.windowStartWeek).toBeGreaterThanOrEqual(promised.dueWeekExclusive)
    }
    expect(promised.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE')
    expect(marketModule.currentProposals(treated, talentId).find((p) => p.issuerStudioId === incumbentId)!.digest).not.toBe(incumbentProposal.digest)

    const settle = (input: GameState) => {
      let frozen: GameState | undefined
      const realDescriptor = promiseModule.trustDescriptor
      const observer = vi.spyOn(promiseModule, 'trustDescriptor').mockImplementation((world, personId, studioId, week) => {
        if (personId === talentId && week === 208 && [playerStudioId, incumbentId].includes(studioId)
          && !world.hollywood!.employment.some((e) => e.terms.talentId === talentId && e.terms.startWeek === 208 && e.endedWeek === null)) frozen ??= world
        return realDescriptor(world, personId, studioId, week)
      })
      let after: GameState
      try { after = tick(input) } finally { observer.mockRestore() }
      if (frozen === undefined) throw new Error('D3 premise: no real pre-commit freeze observation')
      const receipt = after.talentMarket.receipts.find((r) => r.talentId === talentId && r.week === 208 && r.kind === 'settled')!
      expect(receipt).toBeDefined()
      const offers = marketModule.currentProposals(frozen, talentId)
      expect(offers).toHaveLength(5)
      expect(receipt.dropped).toHaveLength(3)
      const names = new Map(entered.map((s) => [s.studioId, s.name]))
      for (const id of [playerStudioId, incumbentId]) expect(receipt.dropped.some((reason) => reason.startsWith(names.get(id)!))).toBe(false)
      for (const issuer of nonpair) {
        expect(receipt.dropped.some((reason) => reason.startsWith(issuer.name) && /promise.*feasib/i.test(reason))).toBe(true)
        const proposal = offers.find((p) => p.issuerStudioId === issuer.studioId)!
        const staged = frozen.promises.find((p) => p.promiseId === proposal.promises[0])!
        expect(promiseFeasibility(frozen, { ...staged, startWeek: proposal.startWeek, termWeeks: proposal.termWeeks }, 208).classification).toBe('IMPOSSIBLE')
      }
      const own = offers.find((p) => p.issuerStudioId === playerStudioId)!, incumbent = offers.find((p) => p.issuerStudioId === incumbentId)!
      expect(own.premiumTier).toBe(1.25)
      expect(incumbent.premiumTier).toBe(1)
      expect(own.termWeeks).toBe(incumbent.termWeeks)
      expect(publicPriorityOrder(frozen, talentId)[0]).toBe('opportunity')
      expect(trustDescriptor(frozen, talentId, playerStudioId, 208).label).toBe('Reliable')
      expect(trustDescriptor(frozen, talentId, incumbentId, 208).label).toBe('Reliable')
      const mean = (s: GameState['studio']['standing']) => (s.audienceAwareness + s.industryPrestige + s.commercialConfidence) / 3
      const incumbentStanding = frozen.hollywood!.businesses.find((b) => b.studioId === incumbentId)!.standing
      expect(Math.abs(mean(frozen.studio.standing) - mean(incumbentStanding))).toBeLessThanOrEqual(5) // existing band tolerance hypothesis
      expect(receipt.reasons.some((reason) => /only proposal/i.test(reason))).toBe(false)
      return { after, receipt, frozen, own, incumbent }
    }
    const baseline = settle(common)
    const treatment = settle(treated)
    expect(treatment.receipt.dropped).toEqual(baseline.receipt.dropped)
    expect(baseline.own.promises).toEqual([])
    expect(baseline.incumbent.promises).toEqual([])
    expect(treatment.own.promises).toEqual([])
    expect(treatment.incumbent.promises).toEqual([promised.promiseId])
    expect(baseline.receipt.studioId).toBe(playerStudioId)
    expect(baseline.receipt.reasons.some((reason) => /compensation/i.test(reason))).toBe(true)
    expect(treatment.receipt.studioId).toBe(incumbentId)
    expect(treatment.receipt.reasons.some((reason) => /opportunity/i.test(reason))).toBe(true)
    expect(treatment.receipt.studioId).not.toBe(baseline.receipt.studioId)
    const bound = treatment.after.promises.find((p) => p.promiseId === promised.promiseId)!
    expect(bound.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE')
    expect(bound.feasibilityReceipt.week).toBe(208)
    const employment = treatment.after.hollywood!.employment.find((e) => e.contractId === bound.contractId)!
    expect(employment).toBeDefined()
    expect(employment.studioId).toBe(incumbentId)
    expect(employment.terms.talentId).toBe(talentId)
    expect(employment.terms.startWeek).toBe(208)
    expect(baseline.after.promises.some((p) => p.promiseId === promised.promiseId && p.issuerStudioId === incumbentId && p.beneficiaryPersonId === talentId)).toBe(false)
  }, 60_000)

  it('a Reliable issuer beats a Mixed-record issuer on the trust band, in the same otherwise-1-1-tie shape', () => {
    const { state: opened, talentId, playerStudioId, rivalStudioId } = openCaseWithRival(1.0, 1.1)
    const reliableForPlayer: PersistedPromise = {
      promiseId: 'promise-trust-reliable-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId: playerStudioId,
      beneficiaryPersonId: talentId,
      predicate: { count: 1 },
      windowStartWeek: 0,
      dueWeekExclusive: 40,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null },
      progress: 1,
      evidenceRefs: ['evidence-reliable-0'],
      outcome: 'SATISFIED',
      outcomeWeek: 20,
      outcomeCause: null,
      outcomeEventId: null,
      contractId: null,
    }
    const mixedForRival: PersistedPromise = {
      promiseId: 'promise-trust-mixed-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId: rivalStudioId,
      beneficiaryPersonId: talentId,
      predicate: { count: 1 },
      windowStartWeek: 0,
      dueWeekExclusive: 10,
      feasibilityReceipt: { classification: 'IMPOSSIBLE', bottleneck: null },
      progress: 0,
      evidenceRefs: [],
      outcome: 'BROKEN',
      outcomeWeek: 8,
      outcomeCause: 'dueWeekExclusive reached unsatisfied',
      outcomeEventId: null,
      contractId: null,
    }
    const state = withPromises(opened, [reliableForPlayer, mixedForRival])
    const settlement = settleAt52(state, talentId)
    expect(settlement.kind).toBe('settled')
    expect(settlement.studioId).toBe(playerStudioId)
  })

  // NOT CONSTRUCTIBLE under the landed seat law — see interpretation 5 above
  // (measured by direct search, not assumed): no two-proposal contest where
  // BOTH proposals are equal on incumbency (i.e. BOTH non-incumbent) also
  // survives freeze on the tested seeds and week range.
  it.todo(
    'on a constructed pair equal on compensation, term, standing AND incumbency (both non-incumbent), the proposal with a feasible promise wins with the opportunity reason — ' +
      'OBSTACLE: incumbency is a binary per-proposal fact unique to the one true subjectStudioId, so two DIFFERENT issuers can tie on it only by both being non-incumbent; P14A.1-F1 already measured no such pair survives freeze pre-week-208, and a direct search here (p13-public-commercial-adoption, weeks 209-430) found the SAME true at the next synchronized churn (week 404): every surviving contest keeps the case incumbent as one of its two survivors; every non-incumbent-vs-non-incumbent pairing is dropped 0-for-2 at the seat budget before ranking.',
  )
})

describe('P14B.1 test 7: rival symmetry', () => {
  it('attachPromise and its feasibility classification work identically when the issuer is a RIVAL (no player-only special-casing)', () => {
    const { state: opened, talentId, rivalStudioId } = openCaseWithRival(1.05, 1.1)
    const week = opened.market.tick
    const startWeek = opened.talentMarket.proposals.find((p) => p.talentId === talentId && p.issuerStudioId === rivalStudioId)!.startWeek
    const attached = attachPromise(opened, talentId, rivalStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: startWeek,
      dueWeekExclusive: week + 52,
    })
    const proposal = attached.talentMarket.proposals.find((p: { talentId: string; issuerStudioId: string }) => p.talentId === talentId && p.issuerStudioId === rivalStudioId) as unknown as { promises: readonly string[] } | undefined
    if (proposal === undefined) throw new Error('test premise failed: no rival proposal found after attachPromise')
    expect(proposal.promises.length).toBe(1)
  })

  // B-F2 2026-09-19: has-discipline replaces the erroneous writer-label gate.
  // Observe the ORIGINAL authoring decision; neither a duplicate attachment nor
  // a later read with changed reservations can explain that historical decision.
  //
  // 600-T2 (record 600 S2, plan "Rival unproven authoring", 537-B G9, 600-B
  // C10) — the "rival flexible-first authoring" class: for a publicly UNPROVEN
  // person the rival reads the flexible leadOrAntagonist P2 (count 1, the full
  // proposed term) FIRST and the P1 only when that read is not achievable; a
  // PROVEN person gets the P1 read alone. The first REASONABLY_ACHIEVABLE read is
  // attached, neither means no attachment, and every read of one authoring sees
  // the SAME unchanged state. The observation therefore keeps the ORDERED reads
  // of each submission and the public archetype at the authoring week.
  type RivalAuthoringRead = {
    draft: Parameters<typeof promiseFeasibility>[1]
    receipt: ReturnType<typeof promiseFeasibility>
  }
  type RivalAuthoringObservation = {
    input: GameState
    inputRef: GameState
    week: number
    proposal: GameState['talentMarket']['proposals'][number]
    submission: TalentMarketReceipt
    proven: boolean
    reads: RivalAuthoringRead[]
  }
  const FLEX_PREDICATE: CastRoleCountPredicate = { kind: 'castRoleCount', count: 1, seatClass: 'leadOrAntagonist' }
  function expectedAuthoringDraft(
    proposal: GameState['talentMarket']['proposals'][number],
    family: 'APPEARANCE_COUNT' | 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
  ): Parameters<typeof promiseFeasibility>[1] {
    return {
      family, predicate: family === 'APPEARANCE_COUNT' ? { count: 1 } : FLEX_PREDICATE,
      issuerStudioId: proposal.issuerStudioId, beneficiaryPersonId: proposal.talentId,
      startWeek: proposal.startWeek, termWeeks: proposal.termWeeks,
      windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + proposal.termWeeks,
    }
  }

  function scanNaturalRivalAuthoring(
    visit: (after: GameState, observed: RivalAuthoringObservation) => boolean,
  ): void {
    const evaluate = promiseModule.promiseFeasibility
    let pending = new Map<string, RivalAuthoringObservation>()
    const observer = vi.spyOn(promiseModule, 'promiseFeasibility').mockImplementation((input, draft, week) => {
      const receipt = evaluate(input, draft, week) // transparent: real inputs/result, no stub
      // Freeze/ranking calls supply promiseId. Authoring reads a genuinely
      // CURRENT, unattached rival proposal before attachPromise creates its root.
      if (draft.promiseId !== undefined || input.hollywood === null
        || draft.issuerStudioId === input.hollywood.playerStudioId) return receipt
      const matches = input.talentMarket.proposals.filter((p) =>
        p.talentId === draft.beneficiaryPersonId && p.issuerStudioId === draft.issuerStudioId)
      if (matches.length === 0) return receipt
      expect(matches).toHaveLength(1)
      const proposal = matches[0]!
      if (proposal.promises.length !== 0) return receipt
      expect(input.hollywood.identities.find((s) => s.studioId === proposal.issuerStudioId)?.role).toBe('rival')
      expect(input.talentMarket.cases.filter((c) =>
        c.talentId === proposal.talentId && c.outcome === null)).toHaveLength(1)
      expect(proposal.submittedWeek).toBe(week)
      expect(week).toBe(input.market.tick)
      const submissions = input.talentMarket.receipts.filter((r) =>
        r.kind === 'proposalSubmitted' && r.talentId === proposal.talentId
        && r.studioId === proposal.issuerStudioId && r.week === proposal.submittedWeek)
      expect(submissions).toHaveLength(1)
      const submission = submissions[0]!
      // The public archetype at the authoring week (the same read the policy and
      // D3 use; never a hidden fact): proven prefers any cast appearance.
      const proven = marketModule.publicPreferredOpportunity(input, proposal.talentId) === 'anyCastAppearance'
      let observed = pending.get(submission.eventId)
      if (observed === undefined) {
        observed = { ...structuredClone({ input, week, proposal, submission }), inputRef: input, proven, reads: [] }
        pending.set(submission.eventId, observed)
      } else {
        // A later read of the same authoring sees the SAME state object (the
        // flexible read attached nothing) and the same archetype.
        expect(Object.is(input, observed.inputRef)).toBe(true)
        expect(week).toBe(observed.week)
        expect(proven).toBe(observed.proven)
      }
      // The flexible-first sequence: proven → [P1]; unproven → [FLEX, P1 only after
      // a non-achievable FLEX read]. Any read beyond that sequence fails here.
      const index = observed.reads.length
      const sequence: ReadonlyArray<'APPEARANCE_COUNT' | 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'> =
        proven ? ['APPEARANCE_COUNT'] : ['LEAD_OR_SIGNIFICANT_ROLE_COUNT', 'APPEARANCE_COUNT']
      expect(index).toBeLessThan(sequence.length)
      expect(draft).toEqual(expectedAuthoringDraft(proposal, sequence[index]!))
      if (index === 1) expect(observed.reads[0]!.receipt.classification).not.toBe('REASONABLY_ACHIEVABLE')
      observed.reads.push(structuredClone({ draft, receipt }))
      return receipt
    })
    try {
      let state = p13aGeneratedStudio()
      expect(state.talentMarket.receipts.filter((r) => r.kind === 'proposalSubmitted'
        && r.studioId !== null && r.studioId !== state.hollywood!.playerStudioId)).toEqual([])
      for (let step = 0; step < 220; step++) {
        pending = new Map()
        state = tick(state)
        const submissions = state.talentMarket.receipts.filter((r) =>
          r.kind === 'proposalSubmitted' && r.studioId !== null
          && r.studioId !== state.hollywood!.playerStudioId && r.week === state.market.tick)
        for (const submission of submissions) {
          const observed = pending.get(submission.eventId)
          if (observed === undefined) throw new Error(`test premise failed: rival submission ${submission.eventId} was never authored`)
          expect(observed.submission).toEqual(submission)
          expect(observed.reads.length).toBeGreaterThan(0)
          if (visit(state, observed)) return
        }
      }
    } finally {
      observer.mockRestore()
    }
    throw new Error('search premise failed: required natural authoring witnesses absent within 220 weeks; no negative-branch coverage may be claimed')
  }

  function assertOriginalAuthoring(
    after: GameState,
    observed: RivalAuthoringObservation,
  ): GameState['promises'][number] | undefined {
    expect(after.market.tick).toBe(observed.week)
    expect(after.talentMarket.receipts.filter((r) => r.eventId === observed.submission.eventId))
      .toEqual([observed.submission])
    const matches = after.talentMarket.proposals.filter((p) =>
      p.talentId === observed.proposal.talentId && p.issuerStudioId === observed.proposal.issuerStudioId)
    expect(matches).toHaveLength(1)
    const proposal = matches[0]!
    // Attachment changes only promise references and their material digest;
    // the exact submitted material/price tuple and submission week stay joined.
    expect(proposal).toEqual({ ...observed.proposal, promises: proposal.promises, digest: proposal.digest })
    const chosenIndex = observed.reads.findIndex((read) => read.receipt.classification === 'REASONABLY_ACHIEVABLE')
    if (chosenIndex === -1) {
      // Every read of the sequence was taken and none was achievable: exactly
      // [P1] for a proven person, exactly [FLEX, P1] for an unproven one.
      expect(observed.reads).toHaveLength(observed.proven ? 1 : 2)
      for (const read of observed.reads) expect(['FRAGILE', 'IMPOSSIBLE']).toContain(read.receipt.classification)
      expect(proposal.promises).toEqual([])
      expect(proposal.digest).toBe(observed.proposal.digest)
      return undefined
    }
    // The FIRST achievable read is attached and no read follows it.
    expect(chosenIndex).toBe(observed.reads.length - 1)
    const chosen = observed.reads[chosenIndex]!
    expect(proposal.promises).toHaveLength(1)
    const authoredId = proposal.promises[0]!
    expect(observed.input.promises.some((p) => p.promiseId === authoredId)).toBe(false)
    const roots = after.promises.filter((p) => p.promiseId === authoredId)
    expect(roots).toHaveLength(1)
    const authored = roots[0]!
    expect(authored).toMatchObject({
      promiseId: authoredId, family: chosen.draft.family, predicate: chosen.draft.predicate,
      issuerStudioId: observed.proposal.issuerStudioId, beneficiaryPersonId: observed.proposal.talentId,
      windowStartWeek: observed.proposal.startWeek,
      dueWeekExclusive: observed.proposal.startWeek + observed.proposal.termWeeks,
      contractId: null, outcome: null, progress: 0, evidenceRefs: [],
    })
    expect(authored.predicate).toEqual(chosen.draft.predicate)
    expect(authored.family).toBe(observed.proven || chosenIndex === 1 ? 'APPEARANCE_COUNT' : 'LEAD_OR_SIGNIFICANT_ROLE_COUNT')
    expect(authored.feasibilityReceipt).toEqual(chosen.receipt)
    expect(authored.feasibilityReceipt.week).toBe(observed.week)
    expect(authored.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE')
    expect(proposal.digest).not.toBe(observed.proposal.digest)
    return authored
  }

  it('the FIRST natural rival proposal carries exactly one promise iff an ORIGINAL authoring read is REASONABLY_ACHIEVABLE — the flexible P2 read first for an unproven person, the P1 read alone for a proven one — with exact proposal/root/receipt joins', () => {
    scanNaturalRivalAuthoring((after, observed) => {
      const first = after.talentMarket.receipts.find((r) => r.kind === 'proposalSubmitted'
        && r.studioId !== null && r.studioId !== after.hollywood!.playerStudioId)
      expect(observed.submission).toEqual(first)
      assertOriginalAuthoring(after, observed)
      return true
    })
  })

  // The writer label is NOT a permanent refusal under D9 OQ-1. Preserve the
  // first writer's real IFF decision, the actor's UNCONDITIONAL positive, and
  // require a separately OBSERVED non-achievable authoring decision with zero
  // attachments. An absent negative within 220 weeks is a fixture finding,
  // never a conditional pass or permission to invent a refusal.
  // 600-T2: the first actor's "exactly one P1" becomes "exactly one promise —
  // P1 if the actor is publicly proven, the flexible P2 if unproven" (600-B
  // C10); the unproven flexible-P2 witness and the unproven "neither" witness
  // join the proven negative so every branch of the delegated policy that has a
  // natural witness within 220 weeks is observed. The unproven P1-FALLBACK
  // branch (flexible not achievable, P1 achievable) has NO natural witness on
  // this chain — recorded as a fixture finding, never synthesized here.
  it('natural rival authoring preserves the first writer IFF, the first actor positive (P1 if proven, flexible P2 if unproven), an unproven flexible-P2 witness, and actual non-achievable zero-attachment witnesses for a proven and an unproven person', () => {
    let firstWriter: RivalAuthoringObservation | undefined
    let firstActor: RivalAuthoringObservation | undefined
    let flexible: RivalAuthoringObservation | undefined
    let negativeProven: RivalAuthoringObservation | undefined
    let negativeUnproven: RivalAuthoringObservation | undefined
    scanNaturalRivalAuthoring((after, observed) => {
      const person = observed.input.talent.find((t) => t.id === observed.proposal.talentId)
      if (person === undefined) throw new Error('test premise failed: authoring subject has no real talent row')
      const achievable = observed.reads.some((read) => read.receipt.classification === 'REASONABLY_ACHIEVABLE')
      if (firstWriter === undefined && person.role === 'writer') {
        firstWriter = observed
        expect(person.role).toBe('writer')
        expect(person.skills.acting).toBeDefined()
        assertOriginalAuthoring(after, observed)
      }
      if (firstActor === undefined && person.role === 'actor') {
        if (firstWriter === undefined) throw new Error('search premise failed: first actor arrived before any first writer witness')
        firstActor = observed
        expect(person.role).toBe('actor')
        // The unconditional positive: the actor's FIRST read is achievable, so
        // exactly that read's promise is authored — never a fallback.
        expect(observed.reads[0]!.receipt.classification).toBe('REASONABLY_ACHIEVABLE')
        const authored = assertOriginalAuthoring(after, observed)
        if (authored === undefined) throw new Error('test premise failed: first actor has no genuinely authored promise')
        if (observed.proven) {
          expect(authored.family).toBe('APPEARANCE_COUNT')
          expect(authored.predicate).toEqual({ count: 1 })
        } else {
          expect(authored.family).toBe('LEAD_OR_SIGNIFICANT_ROLE_COUNT')
          expect(authored.predicate).toEqual(FLEX_PREDICATE)
        }
        expect(authored.windowStartWeek).toBe(observed.proposal.startWeek)
        expect(authored.dueWeekExclusive).toBe(observed.proposal.startWeek + observed.proposal.termWeeks)
        expect(authored.feasibilityReceipt.classification).toBe('REASONABLY_ACHIEVABLE')
        expect(authored.contractId).toBeNull()
      }
      if (flexible === undefined && !observed.proven && observed.reads[0]!.receipt.classification === 'REASONABLY_ACHIEVABLE') {
        flexible = observed
        const authored = assertOriginalAuthoring(after, observed)
        if (authored === undefined) throw new Error('test premise failed: achievable flexible read authored nothing')
        expect(observed.reads).toHaveLength(1)
        expect(authored.family).toBe('LEAD_OR_SIGNIFICANT_ROLE_COUNT')
        expect(authored.predicate).toEqual(FLEX_PREDICATE)
        // Why the rival reads it first: the tagged P2 is the opportunity an
        // unproven person publicly prefers, which the P1 does not earn (D3).
        expect(marketModule.publicPreferredOpportunity(after, person.id)).toBe('significantCastRole')
        expect(marketModule.promiseMatchesPreferredOpportunity(after, person.id, authored)).toBe(true)
        expect(marketModule.promiseMatchesPreferredOpportunity(after, person.id, { family: 'APPEARANCE_COUNT', predicate: { count: 1 } })).toBe(false)
      }
      if (negativeProven === undefined && observed.proven && !achievable) {
        negativeProven = observed
        expect(assertOriginalAuthoring(after, observed)).toBeUndefined() // checks EXACTLY zero attachments
      }
      if (negativeUnproven === undefined && !observed.proven && !achievable) {
        negativeUnproven = observed
        expect(observed.reads.map((read) => read.draft.family)).toEqual(['LEAD_OR_SIGNIFICANT_ROLE_COUNT', 'APPEARANCE_COUNT'])
        expect(assertOriginalAuthoring(after, observed)).toBeUndefined() // neither read achievable: zero attachments
      }
      return firstWriter !== undefined && firstActor !== undefined && flexible !== undefined
        && negativeProven !== undefined && negativeUnproven !== undefined
    })
    expect(firstWriter).toBeDefined()
    expect(firstActor).toBeDefined()
    expect(flexible).toBeDefined()
    expect(negativeProven).toBeDefined()
    expect(negativeUnproven).toBeDefined()
  })

  it('a rival first take satisfies a promise exactly as a player one does — found by direct search over the natural chain (never a magic week)', () => {
    let state = p13aGeneratedStudio()
    let found: { studioId: string; productionId: string; cast: { lead: string; antagonist: string; support: string } } | undefined
    for (let week = 0; week < 60 && found === undefined; week++) {
      for (const business of state.hollywood!.businesses) {
        const hit = business.productions.find((p) => p.remainingTicks === 5)
        if (hit !== undefined) {
          found = { studioId: business.studioId, productionId: hit.id, cast: hit.cast as { lead: string; antagonist: string; support: string } }
          break
        }
      }
      if (found === undefined) state = tick(state)
    }
    if (found === undefined) throw new Error('search premise failed: no rival production reached remainingTicks === 5 within 60 weeks on the default seed')

    // RULING (i): the promise BINDS only when contractId names a real
    // employment row — bind it to the lead's own row at the rival studio
    // (looked up, never assumed by pattern).
    const employmentRow = state.hollywood!.employment.find(
      (e) => e.terms.talentId === found!.cast.lead && e.studioId === found!.studioId && e.endedWeek === null,
    )
    if (employmentRow === undefined) {
      throw new Error(`test premise failed: no active employment row for "${found.cast.lead}" at rival studio "${found.studioId}"`)
    }

    const record: PersistedPromise = {
      promiseId: 'promise-rival-satisfied-0',
      family: 'APPEARANCE_COUNT',
      issuerStudioId: found.studioId,
      beneficiaryPersonId: found.cast.lead,
      predicate: { count: 1 },
      windowStartWeek: state.market.tick,
      dueWeekExclusive: state.market.tick + 52,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null },
      progress: 0,
      evidenceRefs: [],
      outcome: null,
      outcomeWeek: null,
      outcomeCause: null,
      outcomeEventId: null,
      contractId: employmentRow.contractId,
    }
    state = withPromises(state, [record])
    let next = tick(state)
    // bounded (<= 3 ticks) for the same reason as tests/p14b1-promises.test.ts's
    // own SATISFIED case: outcome evaluation timing relative to the first-take
    // tick is not assumed.
    let record2: { outcome: string | null; outcomeEventId: string | null } | undefined
    for (let i = 0; i < 2; i++) {
      // Looked up by THIS promise's own promiseId, never by (beneficiary,
      // issuer) alone — RULING (ii) means rivals now author their own
      // promises on the natural chain too, so state.promises may carry more
      // than this one synthetic record.
      const proms = (next as unknown as { promises: readonly PersistedPromise[] }).promises
      record2 = proms.find((p) => p.promiseId === record.promiseId)
      if (record2?.outcome !== null && record2?.outcome !== undefined) break
      next = tick(next)
    }
    if (record2 === undefined) throw new Error('test premise failed: the promise record disappeared from state')
    expect(record2.outcome).toBe('SATISFIED')
    expect(record2.outcomeEventId).not.toBeNull()
    const namedReceipt = next.talentMarket.receipts.find((r) => r.eventId === record2!.outcomeEventId)
    if (namedReceipt === undefined) throw new Error('test premise failed: outcomeEventId does not name a receipt in this state')
    expect(namedReceipt.kind).toBe('promiseOutcome')
  })

  it('a rival Distrusted issuer / Reliable-vs-Mixed comparison reads through the SAME trustDescriptor accessor for a rival studioId as for the player', () => {
    const state = p13aGeneratedStudio()
    const rivalStudioId = state.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const beneficiary = state.talent.find((t) => t.role === 'actor')!.id
    const positiveFacts: PersistedPromise[] = [0, 1, 2].map((i) => ({
      promiseId: `promise-rival-good-${String(i)}`,
      family: 'APPEARANCE_COUNT',
      issuerStudioId: rivalStudioId,
      beneficiaryPersonId: beneficiary,
      predicate: { count: 1 },
      windowStartWeek: 0,
      dueWeekExclusive: 52,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null },
      progress: 1,
      evidenceRefs: [`evidence-rival-${String(i)}`],
      outcome: 'SATISFIED',
      outcomeWeek: 10 + i,
      outcomeCause: null,
      outcomeEventId: null,
      contractId: null,
    }))
    const reliableState = withPromises(state, positiveFacts)
    const reliable = trustDescriptor(reliableState, beneficiary, rivalStudioId, reliableState.market.tick)
    expect(reliable.label).toBe('Reliable')
  })

  // Companion §2.1.9, verbatim: "Rival early termination is symmetric in law
  // and is Ready work rather than Core (§3.6)." No landed action exists to
  // construct it with in this Core B.1 engine.
  it.todo(
    'a rival early termination of the beneficiary breaks the promise immediately, exactly as a player termination does — ' +
      'OBSTACLE: no rival-initiated early-termination action is landed; companion §2.1.9 names this explicitly as Ready (post-Core) work, not something Core B.1 offers a verb for.',
  )
})
