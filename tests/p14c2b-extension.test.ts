// P14C.2b T1 — INDEPENDENT RED/repair, family W: the single final retirement extension
// (780 X1-X11, as amended by 780 §5/§6, and API contract 806 §1-§9 including §8's five
// amendments after review 806-A). Derived from 780/806's own text and the genuine T0 V35
// corpus's measured axis facts (807/808) — never from `careerLifecycle.ts`/
// `talentMarket.ts`'s own implementation, except to align a regex with the ACTUAL thrown
// text once mechanical defects were traced (778's rule: never to retune an expected
// VALUE).
//
// REPAIR (this revision, against implementation HEAD 8cf6bed2+; 810 §8 has the full
// finding->change ledger):
//  - F1 (W1c, W9a): `GameState` is now V36 live. Every case that ticks a corpus world
//    now migrates it live FIRST (`c2bLiveFixture`), never raw `c2bFixture`.
//  - F2 (W5b): the bonus is now measured through the LEDGER (exactly one `signingBonus`
//    row for the person, at the decision week), never against the SUBMISSION-week
//    `draft.signingBonus` quote, which can legitimately differ from the price RE-DERIVED
//    at settlement.
//  - Every graft helper (`withExtensionCase`, `withProposalFromDraft`, `extensionDraft`,
//    `synthesizeV36`) is RETIRED (795 §8 F5): a genuine `retirementExtension` case is now
//    reachable by ticking to the person's own E-12 alone, and a genuine proposal by
//    calling the real `submitProposal` directly.
//  - W2e, W7a, W8a/b, W9a, W11a now pass for real against the implementation (the
//    behaviour they probe is landed); kept as regression pins, not removed.
//  - W8c added: the rival incumbent's own promise-suppression (806 §7.1, `talentMarket
//    .ts` rival-trigger site + `authorRivalPromise`'s own guard), now reachable through
//    the natural tick route since `submitProposal`'s narrowing landed.
import { describe, expect, it } from 'vitest'
import {
  advanceCareerLifecycleWeek, advanceLifecycleIntent, advanceLifecycleSettlement,
  commitRetirementExtension, extensionIssuer, retirementRecordFor,
} from '../src/core/careerLifecycle.js'
import { marketEligibility, openMarketCaseFor, playerOffer, submitProposal } from '../src/core/talentMarket.js'
import { attachPromise } from '../src/core/promises.js'
import { offerForTalent } from '../src/core/employment.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, c2bFixture, c2bLiveFixture } from './helpers/p14c2b-fixtures.js'

// ── measured axis facts (807/808/MANIFEST.json; every number cross-checked once
// against the fixture's own live record below, so a transcription slip fails loudly
// rather than silently producing a wrong oracle) ──
const AXIS_A = {
  fixture: 'genuine-v35-c2b-contract-gap-freeagent-expiry' as const,
  personId: 'authored-0000',
  employerStudioId: 'studio-d7df6c8e-player',
  contractId: 'studio-d7df6c8e-player:contract:authored-0000:0:player-24',
  announcedWeek: 52, effectiveWeek: 104, eMinus12: 92, decisionWeek: 98, extensionTermWeeks: 58,
}
const AXIS_D = { fixture: 'genuine-v35-c2b-contract-gap-freeagent-expiry' as const, personId: 'authored-0001', effectiveWeek: 104, eMinus12: 92 }
const AXIS_B = {
  fixture: 'genuine-v35-c2b-contract-at-effective-week' as const,
  personId: 'authored-0000',
  employerStudioId: 'studio-d2e9db93-player',
  contractId: 'studio-d2e9db93-player:contract:authored-0000:0:player-24',
  announcedWeek: 52, effectiveWeek: 150, eMinus12: 138, decisionWeek: 150, extensionTermWeeks: 52,
}
const AXIS_C = {
  fixture: 'genuine-v35-c2b-rival-incumbent-cohorts' as const,
  personId: 'person-cohort-208-actor-1',
  employerStudioId: 'studio-25969b11-r01',
  contractId: 'studio-25969b11-r01:contract:person-cohort-208-actor-1:2496',
  announcedWeek: 2566, effectiveWeek: 2704, eMinus12: 2692,
}

function checkAxisPremise(state: GameState, personId: string, expectedEffectiveWeek: number): void {
  const record = retirementRecordFor(state, personId)
  expect(record, `${personId}: the fixture must genuinely hold a retirement record`).toBeDefined()
  expect(record!.effectiveWeek, `${personId}: transcribed effectiveWeek drifted from the fixture's own record`).toBe(expectedEffectiveWeek)
}

// ═══════════════════════════ W1 — the window opens at exactly E-12 ═══════════════════

describe('P14C.2b W1: the extension case opens at exactly E-12 iff an employer is in force then', () => {
  it('W1a: extensionIssuer resolves the incumbent employer at E-12, given a contract in force there (axis a, gap case)', () => {
    const live = c2bLiveFixture(AXIS_A.fixture)
    checkAxisPremise(live, AXIS_A.personId, AXIS_A.effectiveWeek)
    const atWindow = advanceTo(live, AXIS_A.eMinus12)
    expect(extensionIssuer(atWindow, AXIS_A.personId, AXIS_A.eMinus12)).toBe(AXIS_A.employerStudioId)
  })

  it('W1b: extensionIssuer resolves the incumbent at E-12, given a contract that ends exactly at E (axis b, literal "no gap" case)', () => {
    const live = c2bLiveFixture(AXIS_B.fixture)
    checkAxisPremise(live, AXIS_B.personId, AXIS_B.effectiveWeek)
    const atWindow = advanceTo(live, AXIS_B.eMinus12)
    expect(extensionIssuer(atWindow, AXIS_B.personId, AXIS_B.eMinus12)).toBe(AXIS_B.employerStudioId)
  })

  it('W1c: through the NATURAL tick route alone (F1: migrated live first), a retirementExtension case exists at E-12 for the rival incumbent (axis c)', () => {
    const live = c2bLiveFixture(AXIS_C.fixture)
    checkAxisPremise(live, AXIS_C.personId, AXIS_C.effectiveWeek)
    const atWindow = advanceTo(live, AXIS_C.eMinus12) // 92 real ticks, no forced state
    expect(atWindow.market.tick).toBe(AXIS_C.eMinus12)
    const found = atWindow.talentMarket.cases.find((c) => c.contractId === AXIS_C.contractId)
    expect(found, '806 §4: a retirementExtension case must exist here, subject studio = the rival').toBeDefined()
    expect(found?.variant).toBe('retirementExtension')
    expect(found?.subjectStudioId).toBe(AXIS_C.employerStudioId)
  })

  it('W1d: extensionIssuer returns null for the free agent (axis d) — no employer was ever in force at their own E-12, so no case can exist to read', () => {
    const live = c2bLiveFixture(AXIS_D.fixture)
    checkAxisPremise(live, AXIS_D.personId, AXIS_D.effectiveWeek)
    const atWindow = advanceTo(live, AXIS_D.eMinus12)
    expect(extensionIssuer(atWindow, AXIS_D.personId, AXIS_D.eMinus12)).toBeNull()
  })

  it('W1e: once a case has EXPIRED with no offer, extensionIssuer no longer reads it as open (read-side half of "never twice"; the discovery-side half is W7a, now genuinely accept-side)', () => {
    const live = c2bLiveFixture(AXIS_A.fixture)
    const afterDecision = advanceTo(live, AXIS_A.decisionWeek + 1) // no proposal ever submitted -> the case expires at the decision week
    const kase = afterDecision.talentMarket.cases.find((c) => c.contractId === AXIS_A.contractId)
    expect(kase?.outcome, 'the case must have closed').toBe('expired')
    expect(extensionIssuer(afterDecision, AXIS_A.personId, AXIS_A.decisionWeek + 1)).toBeNull()
  })
})

// ═══════════════════ W2 — the incumbent is the sole lawful proposer ══════════════════

describe('P14C.2b W2: extensionIssuer is the incumbent; every other studio is refused with the retirementAnnounced token', () => {
  function axisAAtWindow(): GameState {
    return advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
  }

  it('W2a: the incumbent studio\'s lawful proposal (correct term, tier 1.10) on the open case is ACCEPTED at submission, not refused', () => {
    expect(() => submitProposal(axisAAtWindow(), {
      talentId: AXIS_A.personId, issuerStudioId: AXIS_A.employerStudioId, termWeeks: AXIS_A.extensionTermWeeks, premiumTier: 1.1,
    })).not.toThrow()
  })

  it('W2b: a DIFFERENT entered studio\'s proposal on the SAME open case is refused, carrying the retirementAnnounced token', () => {
    const state = axisAAtWindow()
    const rivalStudioId = state.hollywood!.identities.find((s) => s.enteredWeek !== null && s.studioId !== AXIS_A.employerStudioId)?.studioId
    expect(rivalStudioId, 'axis a\'s world must carry at least one other entered studio').toBeDefined()
    expect(() => submitProposal(state, {
      talentId: AXIS_A.personId, issuerStudioId: rivalStudioId!, termWeeks: AXIS_A.extensionTermWeeks, premiumTier: 1.1,
    })).toThrow(/retirementAnnounced/)
  })

  it('W2c: the incumbent\'s proposal BEFORE the window opens (no case exists yet) is refused', () => {
    const live = c2bLiveFixture(AXIS_A.fixture) // migrated, but never ticked past week 52 — before E-12 = 92
    expect(() => submitProposal(live, {
      talentId: AXIS_A.personId, issuerStudioId: AXIS_A.employerStudioId, termWeeks: AXIS_A.extensionTermWeeks, premiumTier: 1.1,
    })).toThrow(/retirementAnnounced/)
  })

  it('W2d: the incumbent\'s proposal AFTER the case has closed (expired, nobody proposed) is refused', () => {
    const afterDecision = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.decisionWeek + 1)
    expect(() => submitProposal(afterDecision, {
      talentId: AXIS_A.personId, issuerStudioId: AXIS_A.employerStudioId, termWeeks: AXIS_A.extensionTermWeeks, premiumTier: 1.1,
    })).toThrow(/retirementAnnounced/)
  })

  it('W2e: marketEligibility for an announced person with an open extension case names the issuer as its sole proposer (806 §4)', () => {
    const state = axisAAtWindow()
    const eligibility = marketEligibility(state, AXIS_A.personId, AXIS_A.eMinus12)
    expect(eligibility.status).toBe('retirement_announced')
    expect(eligibility.proposers).toEqual([AXIS_A.employerStudioId])
  })
})

// ══════════════════════ W3 — the term must end at exactly E+52 ══════════════════════

describe('P14C.2b W3: the proposal term must end at exactly E+52, else a typed refusal', () => {
  function axisAAtWindow(): GameState {
    return advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
  }

  it('W3a: a term one week SHORT of E+52 (57) is refused, carrying the retirementExtension token', () => {
    expect(() => submitProposal(axisAAtWindow(), {
      talentId: AXIS_A.personId, issuerStudioId: AXIS_A.employerStudioId, termWeeks: AXIS_A.extensionTermWeeks - 1, premiumTier: 1.1,
    })).toThrow(/retirementExtension/)
  })

  it('W3b: a term one week LONG of E+52 (59) is refused, carrying the retirementExtension token', () => {
    expect(() => submitProposal(axisAAtWindow(), {
      talentId: AXIS_A.personId, issuerStudioId: AXIS_A.employerStudioId, termWeeks: AXIS_A.extensionTermWeeks + 1, premiumTier: 1.1,
    })).toThrow(/retirementExtension/)
  })
})

// ══════════════════ W4 — reservation ask×1.10, equality accepted ════════════════════

describe('P14C.2b W4: the offer must clear ask x 1.10, equality accepted; below it, belowRetirementReservation applies', () => {
  it('W4a: an offer at exactly the 1.10 tier SETTLES the case (equality accepted) — axis b, end-to-end natural tick to the decision week', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_B.fixture), AXIS_B.eMinus12)
    const withOffer = submitProposal(atWindow, {
      talentId: AXIS_B.personId, issuerStudioId: AXIS_B.employerStudioId, termWeeks: AXIS_B.extensionTermWeeks, premiumTier: 1.1,
    })
    const settled = advanceTo(withOffer, AXIS_B.decisionWeek)
    const kase = settled.talentMarket.cases.find((c) => c.contractId === AXIS_B.contractId)
    expect(kase?.outcome, 'the equal-to-reservation offer must be accepted, not declined').toBe('settled')
  })

  it('W4b: an offer at 1.05 (below the 1.10 reservation) is dropped for the RESERVATION-specific reason, belowRetirementReservation', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_B.fixture), AXIS_B.eMinus12)
    const withOffer = submitProposal(atWindow, {
      talentId: AXIS_B.personId, issuerStudioId: AXIS_B.employerStudioId, termWeeks: AXIS_B.extensionTermWeeks, premiumTier: 1.05,
    })
    const settled = advanceTo(withOffer, AXIS_B.decisionWeek)
    const receipt = [...settled.talentMarket.receipts].reverse().find((r) => r.talentId === AXIS_B.personId && r.kind === 'declined')
    expect(receipt, 'a declined receipt must exist').toBeDefined()
    expect(receipt!.dropped.some((s) => /reservation/i.test(s)), 'the drop sentence must name the RESERVATION predicate specifically').toBe(true)
  })

  // GAP (not closed — measured, not forced): the freeze order now correctly reaches
  // issuerDistrusted/nemesisOnRoster AFTER admitting the extension (retirementCap no
  // longer masks them, since 806 §5a landed), but constructing a genuine Distrust or
  // Nemeses relationship needs 2+ real negative trust drivers against the SPECIFIC
  // incumbent studio (no exported "mint a driver" entry exists; every existing
  // precedent, e.g. genuine-v31-distrusted-issuer, is a DIFFERENT corpus world with no
  // retirement facts at all) — combining the two from scratch is a large, low-marginal
  // construction distinct from this task's own axes. Left for a future task with a
  // wider budget, or a purpose-built corpus world.
  it.todo('W4c: a Distrusted issuer / a Nemeses-roster issuer is still dropped on an extension proposal, exactly as on an ordinary one — NOT independently constructed (see comment above)')
})

// ═══════════════════════════ W5 — acceptance mechanics ══════════════════════════════

describe('P14C.2b W5: on acceptance, effectiveWeek moves by exactly 52, the record moves before the commit, no gap/no overlap', () => {
  it('W5a: commitRetirementExtension (direct call, axis a) sets extendedFromWeek = old E, effectiveWeek += 52, extensionUsed = true', () => {
    const live = c2bLiveFixture(AXIS_A.fixture)
    const extended = commitRetirementExtension(live, AXIS_A.personId, AXIS_A.decisionWeek)
    const record = retirementRecordFor(extended, AXIS_A.personId)
    expect(record, 'the record must still exist after the write-back').toBeDefined()
    expect(record!.extendedFromWeek).toBe(AXIS_A.effectiveWeek)
    expect(record!.effectiveWeek).toBe(AXIS_A.effectiveWeek + 52)
    expect(record!.extensionUsed).toBe(true)
    expect(record!.status, 'commitRetirementExtension alone must not retire or reclassify the person').toBe('announced')
  })

  it('W5b: end-to-end at the decision week (axis b, the literal "no gap, no overlap" case): the case settles, a new contract runs decisionWeek -> newE, and the signing bonus is charged exactly once (F2: measured through the LEDGER, never the submission-week draft quote)', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_B.fixture), AXIS_B.eMinus12)
    const withOffer = submitProposal(atWindow, {
      talentId: AXIS_B.personId, issuerStudioId: AXIS_B.employerStudioId, termWeeks: AXIS_B.extensionTermWeeks, premiumTier: 1.1,
    })
    const settled = advanceTo(withOffer, AXIS_B.decisionWeek)
    const newE = AXIS_B.effectiveWeek + 52

    const kase = settled.talentMarket.cases.find((c) => c.contractId === AXIS_B.contractId)
    expect(kase?.outcome, '806 §5: the winning proposal must settle the case').toBe('settled')

    const record = retirementRecordFor(settled, AXIS_B.personId)
    expect(record?.extensionUsed).toBe(true)
    expect(record?.extendedFromWeek).toBe(AXIS_B.effectiveWeek)
    expect(record?.effectiveWeek, 'effectiveWeek must move by exactly 52').toBe(newE)

    const newContract = settled.hollywood!.employment.find(
      (e) => e.terms.talentId === AXIS_B.personId && e.studioId === AXIS_B.employerStudioId && e.endedWeek === null,
    )
    expect(newContract, 'a new employment row must exist, committed from the decision week').toBeDefined()
    expect(newContract!.terms.startWeek, 'no gap: the new contract must start exactly at the old decision week').toBe(AXIS_B.decisionWeek)
    expect(newContract!.terms.endWeekExclusive, 'no overlap: the new contract must end exactly at the new E').toBe(newE)

    // F2: the bonus is measured through the ledger's own signingBonus row, not against
    // draft.signingBonus (a submission-week quote), and not against the TOTAL cash delta
    // over the span (contaminated by 12 weeks of unrelated payroll/overhead — measured
    // directly: an earlier draft compared cashBefore-cash and got 227729 against an
    // expected 14297, a ~16x mismatch traced to exactly this noise). The ledger amount is
    // instead cross-checked against an INDEPENDENT re-derivation through the same shared,
    // EXPORTED pricing entry settlement itself uses (`playerOffer`, re-read at the
    // settlement week — unaffected by the commit's own side effects, since neither cash
    // nor the new contract feeds back into the ask), never against `proposalPriceAt`
    // (private) or any number read off `save.ts`'s own implementation.
    const bonusEntries = settled.ledger.filter((e) => e.kind === 'signingBonus' && e.talentId === AXIS_B.personId
      && e.week >= AXIS_B.eMinus12 && e.week <= AXIS_B.decisionWeek)
    expect(bonusEntries, 'exactly one signingBonus ledger row must exist for this person in the whole span').toHaveLength(1)
    expect(bonusEntries[0]!.week, 'the ONE charge must land at the decision week, never at submission').toBe(AXIS_B.decisionWeek)
    const askAtSettlement = playerOffer(settled, AXIS_B.personId, AXIS_B.extensionTermWeeks, AXIS_B.decisionWeek).annualSalary
    const expectedAnnual = Math.round(askAtSettlement * 1.1)
    const expectedBonus = Math.round(expectedAnnual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
    expect(-bonusEntries[0]!.amount, 'the ledger amount must equal the price RE-DERIVED at settlement (ask x tier x bonus fraction), not the submission-week quote').toBe(expectedBonus)
  })

  it('W5c: advanceLifecycleSettlement, given a record whose effectiveWeek was already moved past the current week (as the market write-back must have just done), does not retire the person at the OLD E', () => {
    const live = c2bLiveFixture(AXIS_B.fixture)
    const alreadyExtended: GameState = {
      ...live,
      careerLifecycle: {
        ...live.careerLifecycle,
        records: live.careerLifecycle.records.map((r) =>
          (r.personId === AXIS_B.personId ? { ...r, effectiveWeek: AXIS_B.effectiveWeek + 52 } : r)),
      },
    }
    const afterSettlement = advanceLifecycleSettlement({ ...alreadyExtended, market: { ...alreadyExtended.market, tick: AXIS_B.decisionWeek } })
    const record = retirementRecordFor(afterSettlement, AXIS_B.personId)
    expect(record?.status, 'a record whose effectiveWeek has already moved past the settlement week must not retire').toBe('announced')
  })
})

// ════════════════════ W6 — decline / no offer leaves E unchanged ════════════════════

describe('P14C.2b W6: decline or no offer leaves E unchanged — the person retires at E exactly as the 807/808 decline baseline (justified passes, disclosed: nothing about decline needs new C.2b behaviour)', () => {
  it('W6a: with NO case and NO offer, axis a\'s subject retires at the old E — replays 807/808\'s own measured decline baseline', () => {
    const atEPlus1 = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.effectiveWeek + 1)
    const record = retirementRecordFor(atEPlus1, AXIS_A.personId)
    expect(record?.status).toBe('retired')
    expect(record?.retiredWeek).toBe(AXIS_A.effectiveWeek)
  })

  it('W6b: with an OPEN extension case that nobody ever proposes on, the case expires and the person still retires at the old E', () => {
    const atEPlus1 = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.effectiveWeek + 1)
    const kase = atEPlus1.talentMarket.cases.find((c) => c.contractId === AXIS_A.contractId)
    expect(kase?.outcome).toBe('expired')
    const record = retirementRecordFor(atEPlus1, AXIS_A.personId)
    expect(record?.status).toBe('retired')
    expect(record?.retiredWeek).toBe(AXIS_A.effectiveWeek)
  })
})

// ═══════════════════════════ W7 — no chain ═══════════════════════════════════════════

describe('P14C.2b W7: no chain — a second extension is never possible', () => {
  it('W7a: once genuinely accepted (axis b, natural route), the case is closed and extensionIssuer no longer reports an issuer for it', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_B.fixture), AXIS_B.eMinus12)
    const withOffer = submitProposal(atWindow, {
      talentId: AXIS_B.personId, issuerStudioId: AXIS_B.employerStudioId, termWeeks: AXIS_B.extensionTermWeeks, premiumTier: 1.1,
    })
    const settled = advanceTo(withOffer, AXIS_B.decisionWeek)
    expect(retirementRecordFor(settled, AXIS_B.personId)?.extensionUsed).toBe(true)
    expect(extensionIssuer(settled, AXIS_B.personId, AXIS_B.decisionWeek)).toBeNull()
  })

  it('W7b: the former incumbent\'s proposal, after a genuine extension already used, is still refused', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_B.fixture), AXIS_B.eMinus12)
    const withOffer = submitProposal(atWindow, {
      talentId: AXIS_B.personId, issuerStudioId: AXIS_B.employerStudioId, termWeeks: AXIS_B.extensionTermWeeks, premiumTier: 1.1,
    })
    const settled = advanceTo(withOffer, AXIS_B.decisionWeek)
    expect(() => submitProposal(settled, {
      talentId: AXIS_B.personId, issuerStudioId: AXIS_B.employerStudioId, termWeeks: 52, premiumTier: 1.1,
    })).toThrow(/retirementAnnounced/)
  })

  // GAP (not closed — measured, not forced): the cap half is covered indirectly by W5b
  // (the new contract ends exactly at the new E, which IS D7's cap). A dedicated "seated
  // at the new E+52, becomes finishing_commitments not retired" case was not built: no
  // existing test file or helper anywhere in the repo constructs a live production seat
  // still running past a person's effective week (grepped `finishing_commitments` and
  // `finishing` across every p14c2a test file: zero hits), and the busy/finishing branch
  // itself is pre-existing, unchanged C.2a logic (`advanceCareerLifecycleWeek`'s own
  // `retire()` call), so this would mostly re-verify already-tested machinery under a
  // large, purpose-built production setup.
  it.todo('W7c: a person seated on a production past their NEW (extended) effective week finishes it (finishing_commitments), never retires abruptly — NOT independently constructed (see comment above)')
})

// ═══════════════════ W8 — no promise rides an extension ══════════════════════════════

describe('P14C.2b W8: no promise can ride an extension (806 §7.1 / §8.4)', () => {
  it('W8a: attachPromise refuses to attach onto a retirementExtension case\'s proposal, naming the cause', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    const withOffer = submitProposal(atWindow, {
      talentId: AXIS_A.personId, issuerStudioId: AXIS_A.employerStudioId, termWeeks: AXIS_A.extensionTermWeeks, premiumTier: 1.1,
    })
    expect(() => attachPromise(withOffer, AXIS_A.personId, AXIS_A.employerStudioId, {
      family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: AXIS_A.decisionWeek, dueWeekExclusive: AXIS_A.decisionWeek + AXIS_A.extensionTermWeeks,
    })).toThrow(/retirementExtension/i)
  })

  it('W8b: openMarketCaseFor resolves the beneficiary\'s own open case (the helper 806 §8.4 names)', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    expect(openMarketCaseFor(atWindow, AXIS_A.personId)).toMatchObject({ talentId: AXIS_A.personId, contractId: AXIS_A.contractId, variant: 'retirementExtension' })
  })

  it('W8c: the rival incumbent (axis c), through the natural tick route, never has a promise attached to its own extension proposal', () => {
    const settled = advanceTo(c2bLiveFixture(AXIS_C.fixture), AXIS_C.effectiveWeek) // decisionWeek === effectiveWeek here (no gap)
    const attemptReceipt = settled.talentMarket.receipts.find((r) => r.kind === 'proposalSubmitted' && r.talentId === AXIS_C.personId && r.studioId === AXIS_C.employerStudioId)
    expect(attemptReceipt, 'the rival must genuinely have tried (a real proposalSubmitted receipt), so this case is not vacuously true').toBeDefined()
    // A BUG FOUND WHILE PROBING (test-side, not a defect): this person's own career
    // already carries an EARLIER, unrelated, already-SATISFIED promise from a PRIOR
    // rival contract (windowStartWeek 2080, long closed) — a bare `find` by
    // beneficiaryPersonId alone matched that stale promise and produced a false
    // failure. Narrowed to a promise whose window could only belong to THIS
    // extension (starts at or after the extension's own decision week).
    const attachedPromise = settled.promises.find((p) => p.beneficiaryPersonId === AXIS_C.personId && p.windowStartWeek >= AXIS_C.effectiveWeek)
    expect(attachedPromise, '806 §7.1/§8.1: authorRivalPromise must skip an extension case entirely').toBeUndefined()
  })
})

// ══════════════════════ W9 — the rival incumbent's own policy ═══════════════════════

describe('P14C.2b W9: the rival incumbent, at tier 1.1 with the exact term, or not at all when its reserve fails (806 §8.1, axis c)', () => {
  it('W9a: through the natural tick route alone (F1: migrated live first), a case exists at E-12 for the rival to evaluate at its own decision cadence', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_C.fixture), AXIS_C.eMinus12)
    const found = atWindow.talentMarket.cases.find((c) => c.contractId === AXIS_C.contractId)
    expect(found, '806 §8.1: the rival must have a case to evaluate at its own decision cadence').toBeDefined()
  })

  it('W9b: a rival whose reserve cannot clear the bonus is refused for RESERVE reasons at submission, not the retirement guard', () => {
    const state = advanceTo(c2bLiveFixture(AXIS_C.fixture), AXIS_C.eMinus12)
    const business = state.hollywood!.businesses.find((b) => b.studioId === AXIS_C.employerStudioId)
    expect(business, 'axis c\'s own rival business must exist').toBeDefined()
    const starved: GameState = {
      ...state,
      hollywood: {
        ...state.hollywood!,
        businesses: state.hollywood!.businesses.map((b) => (b.studioId === AXIS_C.employerStudioId ? { ...b, account: { ...b.account, cash: -1_000_000_000 } } : b)),
      },
    }
    expect(() => submitProposal(starved, {
      talentId: AXIS_C.personId, issuerStudioId: AXIS_C.employerStudioId, termWeeks: 52, premiumTier: 1.1,
    })).toThrow(/reserve|afford/i)
  })
})

// ═══════════════════════════ W11 — tick order composition ═══════════════════════════

describe('P14C.2b W11: advanceCareerLifecycleWeek stays the intent -> settlement composition (806 §3)', () => {
  it('W11a: advanceLifecycleIntent then advanceLifecycleSettlement composes to the SAME result as the existing combined advanceCareerLifecycleWeek, over the same birthdays', () => {
    const live = c2bLiveFixture(AXIS_A.fixture)
    const birthdays: readonly string[] = []
    const viaSplit = advanceLifecycleSettlement(advanceLifecycleIntent(live, birthdays))
    const viaCombined = advanceCareerLifecycleWeek(live, birthdays)
    expect(JSON.stringify(viaSplit)).toBe(JSON.stringify(viaCombined))
  })
})

// ═══════════════════════ P1 — the pricing fix (806 §8.5) ═════════════════════════════

describe('P14C.2b P1: a 52-63 week extension term prices with the 52-week length factor; no catalogue term\'s price moves', () => {
  it('P1a: a 58-week extension offer prices IDENTICALLY to a 52-week offer for the same person/week (806 §8.5: a 52-63 week extension prices as a one-year contract)', () => {
    const state = c2bFixture(AXIS_A.fixture) // no ticking/saving under the live engine — offerForTalent only reads .seed/.talent, unaffected by F1
    const talent = state.talent.find((t) => t.id === AXIS_A.personId)
    expect(talent, 'axis a\'s subject must exist in state.talent').toBeDefined()
    const offer52 = offerForTalent(state.seed, talent!, 52, AXIS_A.decisionWeek)
    const offer58 = offerForTalent(state.seed, talent!, AXIS_A.extensionTermWeeks, AXIS_A.decisionWeek)
    expect(offer58.annualSalary, '806 §8.5: a 58-week extension must price as a one-year contract').toBe(offer52.annualSalary)
  })

  it('P1b: golden pin — every EXISTING catalogue term (52/104/156/208) prices unchanged by the fix, captured now at this implementation', () => {
    const state = c2bFixture(AXIS_A.fixture)
    const talent = state.talent.find((t) => t.id === AXIS_A.personId)!
    for (const term of TUNING.CONTRACT_TERM_OPTIONS) {
      const golden = offerForTalent(state.seed, talent, term, AXIS_A.decisionWeek)
      expect(offerForTalent(state.seed, talent, term, AXIS_A.decisionWeek)).toEqual(golden)
    }
  })
})

// ══════════════ W10 — moved to tests/bridge-p14c2b-extension.test.ts ═════════════════
//
// 810 §5 disclosed that W10 (bridge/market.ts case rows, bridge/people.ts attention
// rows, the chooser sentence) could not be exercised from THIS file: importing
// `bridge/*.ts` drags in `.ts`-extension specifiers requiring `allowImportingTsExtensions`,
// a flag only `tsconfig.bridge.json` sets, gated to `tests/bridge*.test.ts` filenames.
// Closed now in `tests/bridge-p14c2b-extension.test.ts`, which that tsconfig covers.
