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

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import { careerIdentity } from '../src/core/talentSummary.js'
import type { GameState } from '../src/core/types.js'
import { publicPriorityOrder, publicPreferredTerm, submitProposal } from '../src/core/talentMarket.js'
import { TUNING } from '../src/core/tuning.js'
// RED-by-design: src/core/promises.ts does not exist. Both names below are
// CALLED, not merely imported.
import { attachPromise, trustDescriptor } from '../src/core/promises.js'

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
  it('publicPriorityOrder is the WIDENED companion order (opportunity and trust inserted, relationships still excluded) for both archetypes, byte-equal', () => {
    const state = p13aGeneratedStudio()
    expect(publicPriorityOrder(state, findUnproven(state))).toEqual(['opportunity', 'compensation', 'term', 'trust', 'standing', 'incumbency'])
    expect(publicPriorityOrder(state, findProven(state))).toEqual(['compensation', 'term', 'trust', 'incumbency', 'standing', 'opportunity'])
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
      contractId: null,
    }))
    const state = withPromises(opened, negativeFacts)
    const settlement = settleAt52(state, talentId)
    expect(settlement.kind).toBe('settled')
    expect(settlement.studioId).toBe(playerStudioId)
    expect(settlement.dropped.some((sentence) => /distrust/i.test(sentence))).toBe(true)
  })

  it('opportunity breaks an otherwise 1-1 tie: a rival ahead on compensation vs the incumbent ahead on incumbency (companion Case 2 shape) — attaching a feasible promise to the incumbent side tips the case to it, with an opportunity-naming reason', () => {
    // Rival wins D1 (tier 1.10 vs 1.00); player wins D7 (incumbent). A 1-1
    // tie under today's 4-live-descriptor law. Adding D3 (a feasible
    // promise) to the PLAYER side gives it 2 wins (D3+D7) against the
    // rival's 1 (D1) — an outright pairwise win, needing no tie-break.
    const { state: opened, talentId, playerStudioId } = openCaseWithRival(1.0, 1.1)
    const week = opened.market.tick
    const state = attachPromise(opened, talentId, playerStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: week,
      dueWeekExclusive: week + 52,
    })
    const settlement = settleAt52(state, talentId)
    expect(settlement.kind).toBe('settled')
    expect(settlement.studioId).toBe(playerStudioId)
    expect(settlement.reasons.some((reason) => /opportunit/i.test(reason))).toBe(true)
  })

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
    const attached = attachPromise(opened, talentId, rivalStudioId, {
      family: 'APPEARANCE_COUNT',
      predicate: { count: 1 },
      windowStartWeek: week,
      dueWeekExclusive: week + 52,
    })
    const proposal = attached.talentMarket.proposals.find((p: { talentId: string; issuerStudioId: string }) => p.talentId === talentId && p.issuerStudioId === rivalStudioId) as unknown as { promises: readonly string[] } | undefined
    if (proposal === undefined) throw new Error('test premise failed: no rival proposal found after attachPromise')
    expect(proposal.promises.length).toBe(1)
  })

  it('a rival proposal carries a P1 promise IFF its own feasibility is REASONABLY_ACHIEVABLE — derived from the FIRST rival proposalSubmitted receipt on the natural chain, never assumed', () => {
    let state = p13aGeneratedStudio()
    let rivalSubmission: { talentId: string; studioId: string } | undefined
    for (let week = 0; week < 220 && rivalSubmission === undefined; week++) {
      const hit = state.talentMarket.receipts.find(
        (r) => r.kind === 'proposalSubmitted' && r.studioId !== null && r.studioId !== state.hollywood!.playerStudioId,
      )
      if (hit !== undefined) rivalSubmission = { talentId: hit.talentId, studioId: hit.studioId! }
      else state = tick(state)
    }
    if (rivalSubmission === undefined) throw new Error('search premise failed: no rival ever submitted a proposal within 220 weeks on the default seed')

    const proposal = state.talentMarket.proposals.find((p) => p.talentId === rivalSubmission!.talentId && p.issuerStudioId === rivalSubmission!.studioId)
    if (proposal === undefined) throw new Error('test premise failed: the found proposalSubmitted receipt has no live matching proposal (already settled)')
    const carries = (proposal as unknown as { promises: readonly string[] }).promises.length > 0

    // The independent, this-file-computed classification for the SAME
    // (issuer, beneficiary) under a whole-contract window — the DEFAULT
    // shape companion item 9 describes ("X = 1 iff its own feasibility is
    // REASONABLY ACHIEVABLE"), read here as spanning the full proposed term.
    const myClassification = attachPromise(
      state,
      rivalSubmission.talentId,
      rivalSubmission.studioId,
      { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + proposal.termWeeks },
    )
    const minted = (myClassification as unknown as { promises: readonly PersistedPromise[] }).promises.find(
      (p) => p.beneficiaryPersonId === rivalSubmission!.talentId && p.issuerStudioId === rivalSubmission!.studioId,
    )
    if (minted === undefined) throw new Error('test premise failed: attachPromise minted no promise record for the rival probe')
    expect(carries).toBe(minted.feasibilityReceipt.classification === 'REASONABLY_ACHIEVABLE')
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
      contractId: null,
    }
    state = withPromises(state, [record])
    let next = tick(state)
    // bounded (<= 3 ticks) for the same reason as tests/p14b1-promises.test.ts's
    // own SATISFIED case: outcome evaluation timing relative to the first-take
    // tick is not assumed.
    let record2: { outcome: string | null } | undefined
    for (let i = 0; i < 2; i++) {
      const proms = (next as unknown as { promises: readonly PersistedPromise[] }).promises
      record2 = proms.find((p) => p.promiseId === record.promiseId)
      if (record2?.outcome !== null && record2?.outcome !== undefined) break
      next = tick(next)
    }
    if (record2 === undefined) throw new Error('test premise failed: the promise record disappeared from state')
    expect(record2.outcome).toBe('SATISFIED')
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
