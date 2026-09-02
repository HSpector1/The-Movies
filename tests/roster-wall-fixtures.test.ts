import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  contractOffer,
} from '../src/core/index.js'
import type { CreativeRole } from '../src/core/index.js'
import {
  ROSTER_CONTINUATION_POLICY_IDS,
  createRenewalPolicyMemory,
  planRenewals,
} from '../src/harness/roster-wall/renewal.js'
import {
  ROSTER_WALL_MECHANICS_ENTRY_WEEK,
  ROSTER_WALL_MECHANICS_EXPERIMENT_ID,
  ROSTER_WALL_MECHANICS_EXPIRY_WEEK,
  ROSTER_WALL_MECHANICS_FIXTURE_COHORTS,
  ROSTER_WALL_MECHANICS_FIXTURE_MATRIX,
  ROSTER_WALL_MECHANICS_FIXTURE_ROW_COUNT,
  ROSTER_WALL_MECHANICS_MODE,
  ROSTER_WALL_MECHANICS_RECORD_TYPE,
  ROSTER_WALL_MECHANICS_SCHEMA_VERSION,
  ROSTER_WALL_MECHANICS_THRESHOLD_IDS,
  buildRosterWallMechanicsFixtureState,
  deriveRosterWallMechanicsThresholds,
  runRosterWallMechanicsFixtures,
} from '../src/harness/roster-wall/fixtures.js'
import type { RosterWallSourceProvenance } from '../src/harness/roster-wall/provenance.js'
import type {
  RosterWallMechanicsCohortSize,
  RosterWallMechanicsFixtureRow,
} from '../src/harness/roster-wall/fixtures.js'

const ROLE_ORDER = ['actor', 'director', 'writer', 'craft'] as const

const SOURCE: RosterWallSourceProvenance = {
  branch: 'operation-hollywood-autonomous-marathon',
  commit: 'fixtures-test-commit',
  tree: 'fixtures-test-tree',
  worktreeDirty: false,
  runtime: 'vitest',
  saveVersion: 16,
  productionAuthorityCommit: '8b7e95eb92f6f809522a595b4b458d4f19e26852',
  productionAuthorityTree: 'fixtures-test-authority-tree',
  authorityDiffPaths: ['src/harness/roster-wall/fixtures.ts'],
}

let cachedRows: RosterWallMechanicsFixtureRow[] | null = null

function rows(): RosterWallMechanicsFixtureRow[] {
  cachedRows ??= runRosterWallMechanicsFixtures(SOURCE)
  return cachedRows
}

function row(
  cohortSize: RosterWallMechanicsCohortSize,
  thresholdId: (typeof ROSTER_WALL_MECHANICS_THRESHOLD_IDS)[number],
  continuationPolicyId: (typeof ROSTER_CONTINUATION_POLICY_IDS)[number],
): RosterWallMechanicsFixtureRow {
  const found = rows().find(
    (candidate) =>
      candidate.cohortSize === cohortSize &&
      candidate.threshold.thresholdId === thresholdId &&
      candidate.continuationPolicyId === continuationPolicyId,
  )
  if (found === undefined) throw new Error('fixture matrix row missing')
  return found
}

function coverageForTalentIds(
  state: ReturnType<typeof buildRosterWallMechanicsFixtureState>,
  talentIds: readonly string[],
): Record<CreativeRole, number> {
  const coverage: Record<CreativeRole, number> = {
    actor: 0,
    director: 0,
    writer: 0,
    craft: 0,
  }
  for (const talentId of talentIds) {
    const role = state.talent.find((talent) => talent.id === talentId)?.role
    if (role === undefined) throw new Error(`unknown fixture talent ${talentId}`)
    coverage[role]++
  }
  return coverage
}

function expectedPolicyBasisOffers(
  cohortSize: RosterWallMechanicsCohortSize,
  continuationPolicyId: (typeof ROSTER_CONTINUATION_POLICY_IDS)[number],
  cash: number,
) {
  const cohort = ROSTER_WALL_MECHANICS_FIXTURE_COHORTS.find(
    (candidate) => candidate.cohortSize === cohortSize,
  )!
  const state = buildRosterWallMechanicsFixtureState(cohortSize, cash)
  if (continuationPolicyId === 'C0-no-renewal') {
    return cohort.talentIds.map((talentId, policyOrderRank) => ({
      continuationPolicyId,
      policyOrderRank,
      talentId,
      role: state.talent.find((talent) => talent.id === talentId)!.role,
      selectedTerm: 208 as const,
      signingBonus: contractOffer(state, talentId, 208).signingBonus,
    }))
  }
  const orderingPolicy =
    continuationPolicyId === 'C4-last-legal-role-first' ||
    continuationPolicyId === 'C5-spread-role-first'
      ? 'C3-role-coverage-first'
      : continuationPolicyId
  return planRenewals(
    state,
    orderingPolicy,
    createRenewalPolicyMemory(ROSTER_WALL_MECHANICS_ENTRY_WEEK),
  ).plans.map((plan, policyOrderRank) => ({
    continuationPolicyId,
    policyOrderRank,
    talentId: plan.talentId,
    role: plan.role,
    selectedTerm: plan.selectedTerm,
    signingBonus: plan.offer.signingBonus,
  }))
}

describe('Week-208 roster-wall synthetic mechanics fixtures', () => {
  it('refuses artifact-facing fixture rows without accepted source authority', () => {
    expect(() =>
      runRosterWallMechanicsFixtures({
        ...SOURCE,
        productionAuthorityCommit: 'not-the-governed-authority',
      }),
    ).toThrow(/accepted clean SaveFileV16 source/)
  })

  it('uses exact explicit 1/7/13 cohorts with stable IDs and role compositions', () => {
    expect(ROSTER_WALL_MECHANICS_FIXTURE_COHORTS.map((cohort) => cohort.cohortSize)).toEqual([
      1, 7, 13,
    ])
    expect(ROSTER_WALL_MECHANICS_FIXTURE_COHORTS.map((cohort) => cohort.talentIds.length)).toEqual([
      1, 7, 13,
    ])

    const expected = {
      1: { actor: 1, director: 0, writer: 0, craft: 0 },
      7: { actor: 4, director: 1, writer: 1, craft: 1 },
      13: { actor: 7, director: 2, writer: 2, craft: 2 },
    } as const
    for (const cohort of ROSTER_WALL_MECHANICS_FIXTURE_COHORTS) {
      const state = buildRosterWallMechanicsFixtureState(cohort.cohortSize, 0)
      expect(state.contracts.map((contract) => contract.talentId)).toEqual(cohort.talentIds)
      expect(state.contracts.every((contract) => contract.startWeek === 0)).toBe(true)
      expect(
        state.contracts.every(
          (contract) =>
            contract.endWeekExclusive === ROSTER_WALL_MECHANICS_EXPIRY_WEEK &&
            contract.termWeeks === 208,
        ),
      ).toBe(true)
      expect(coverageForTalentIds(state, cohort.talentIds)).toEqual(expected[cohort.cohortSize])
      expect(state.market.tick).toBe(ROSTER_WALL_MECHANICS_ENTRY_WEEK)
      expect(state.studio.cash).toBe(0)
      expect(state.cashLedgerCheckpoint).toEqual({ cash: 0, ledgerLength: 0 })
    }
  })

  it('derives every named cash threshold from each policy\'s exact offers and retains N/A role rows', () => {
    for (const cohort of ROSTER_WALL_MECHANICS_FIXTURE_COHORTS) {
      for (const continuationPolicyId of ROSTER_CONTINUATION_POLICY_IDS) {
        const thresholds = deriveRosterWallMechanicsThresholds(
          cohort.cohortSize,
          continuationPolicyId,
        )
        expect(thresholds.map((threshold) => threshold.thresholdId)).toEqual(
          ROSTER_WALL_MECHANICS_THRESHOLD_IDS,
        )
        const state = buildRosterWallMechanicsFixtureState(cohort.cohortSize, 0)
        const byId = Object.fromEntries(
          thresholds.map((threshold) => [threshold.thresholdId, threshold]),
        )

        expect(byId['cash-negative-one']).toMatchObject({ applicable: true, value: -1 })
        expect(byId['cash-zero']).toMatchObject({ applicable: true, value: 0 })
        expect(byId['minimum-single-quote-minus-one']).toMatchObject({
          applicable: true,
          adjustment: -1,
        })
        expect(byId['minimum-single-quote-exact']).toMatchObject({
          applicable: true,
          adjustment: 0,
        })
        expect(byId['all-cohort-bonuses-minus-one']).toMatchObject({
          applicable: true,
          adjustment: -1,
        })
        expect(byId['all-cohort-bonuses-exact']).toMatchObject({
          applicable: true,
          adjustment: 0,
        })

        for (const threshold of thresholds) {
          const actualOffers = expectedPolicyBasisOffers(
            cohort.cohortSize,
            continuationPolicyId,
            threshold.value ?? 0,
          )
          const actualOfferByTalentId = new Map(
            actualOffers.map((offer) => [offer.talentId, offer]),
          )
          expect(
            threshold.basisOffers.every(
              (offer) => {
                const actual = actualOfferByTalentId.get(offer.talentId)
                return (
                  offer.continuationPolicyId === continuationPolicyId &&
                  actual !== undefined &&
                  offer.policyOrderRank === actual.policyOrderRank &&
                  offer.role === actual.role &&
                  offer.selectedTerm === actual.selectedTerm &&
                  offer.signingBonus === actual.signingBonus &&
                  contractOffer(
                    state,
                    offer.talentId,
                    offer.selectedTerm,
                  ).signingBonus === offer.signingBonus
                )
              },
            ),
          ).toBe(true)
          if (threshold.referenceAmount !== null) {
            expect(
              threshold.basisOffers.reduce(
                (sum, offer) => sum + offer.signingBonus,
                0,
              ),
            ).toBe(threshold.referenceAmount)
          }
          if (
            threshold.thresholdId === 'all-cohort-bonuses-minus-one' ||
            threshold.thresholdId === 'all-cohort-bonuses-exact'
          ) {
            expect(threshold.basisOffers).toEqual(actualOffers)
          }
        }

        const coverageExact = byId['minimum-full-role-coverage-exact']!
        const coverageMinusOne = byId['minimum-full-role-coverage-minus-one']!
        if (cohort.cohortSize === 1) {
          expect(coverageExact).toMatchObject({
            applicability: 'not-applicable',
            applicable: false,
            value: null,
            referenceAmount: null,
            basisOffers: [],
          })
          expect(coverageMinusOne).toMatchObject({
            applicability: 'not-applicable',
            applicable: false,
            value: null,
            referenceAmount: null,
            basisOffers: [],
          })
          expect(coverageExact.missingRoles).toEqual([
            { role: 'actor', required: 3, available: 1, missing: 2 },
            { role: 'director', required: 1, available: 0, missing: 1 },
            { role: 'writer', required: 1, available: 0, missing: 1 },
            { role: 'craft', required: 1, available: 0, missing: 1 },
          ])
        } else {
          expect(coverageExact.applicable).toBe(true)
          expect(coverageExact.value).toBe(coverageExact.referenceAmount)
          expect(coverageMinusOne.value).toBe(coverageExact.value! - 1)
          expect(coverageExact.missingRoles).toEqual([])
          const selectedCoverage = coverageForTalentIds(state, coverageExact.basisTalentIds)
          expect(
            ROLE_ORDER.every((role) => selectedCoverage[role] >= FOUNDING_MINIMUMS[role]),
          ).toBe(true)
          expect(
            coverageExact.basisOffers.reduce(
              (sum, offer) => sum + offer.signingBonus,
              0,
            ),
          ).toBe(coverageExact.value)
        }
      }
    }
  })

  it('ranks frozen quote metadata in each C0-C6 policy\'s actual complete basis order', () => {
    let observedNonCanonicalCheapestOrder = false
    for (const cohort of ROSTER_WALL_MECHANICS_FIXTURE_COHORTS) {
      for (const continuationPolicyId of ROSTER_CONTINUATION_POLICY_IDS) {
        const threshold = deriveRosterWallMechanicsThresholds(
          cohort.cohortSize,
          continuationPolicyId,
        ).find((candidate) => candidate.thresholdId === 'all-cohort-bonuses-exact')!
        const expected = expectedPolicyBasisOffers(
          cohort.cohortSize,
          continuationPolicyId,
          threshold.value!,
        )
        expect(threshold.basisOffers).toEqual(expected)
        expect(threshold.basisOffers.map((offer) => offer.policyOrderRank)).toEqual(
          Array.from({ length: cohort.cohortSize }, (_, index) => index),
        )
        if (
          continuationPolicyId === 'C2-cheapest-bonus-first' &&
          threshold.basisTalentIds.some(
            (talentId, index) => talentId !== cohort.talentIds[index],
          )
        ) {
          observedNonCanonicalCheapestOrder = true
        }
      }
    }
    // This proves the fixture is adversarial: an implementation that merely
    // stamps cohort-ID ranks onto every policy would fail the assertions above.
    expect(observedNonCanonicalCheapestOrder).toBe(true)
  })

  it('exercises distinct C0-C6 order, timing, retry, and term semantics', () => {
    const allThreshold = deriveRosterWallMechanicsThresholds(
      13,
      'C1-current-retry-all',
    ).find(
      (threshold) => threshold.thresholdId === 'all-cohort-bonuses-exact',
    )!
    const allState = buildRosterWallMechanicsFixtureState(13, allThreshold.value!)
    const memory = createRenewalPolicyMemory(ROSTER_WALL_MECHANICS_ENTRY_WEEK)

    expect(planRenewals(allState, 'C0-no-renewal', memory).plans).toEqual([])

    const current = planRenewals(allState, 'C1-current-retry-all', memory).plans
    expect(current.map((plan) => plan.talentId)).toEqual(
      [...current.map((plan) => plan.talentId)].sort(),
    )
    expect(current.every((plan) => plan.selectedTerm === 208 && plan.targetWeek === null)).toBe(
      true,
    )

    const cheapest = planRenewals(allState, 'C2-cheapest-bonus-first', memory).plans
    expect(cheapest.map((plan) => [plan.offer.signingBonus, plan.talentId])).toEqual(
      [...cheapest]
        .sort(
          (a, b) =>
            a.offer.signingBonus - b.offer.signingBonus ||
            (a.talentId < b.talentId ? -1 : a.talentId > b.talentId ? 1 : 0),
        )
        .map((plan) => [plan.offer.signingBonus, plan.talentId]),
    )

    const roleThreshold = deriveRosterWallMechanicsThresholds(
      13,
      'C3-role-coverage-first',
    ).find(
      (threshold) => threshold.thresholdId === 'minimum-full-role-coverage-exact',
    )!
    const roleState = buildRosterWallMechanicsFixtureState(13, roleThreshold.value!)
    const roleFirst = planRenewals(roleState, 'C3-role-coverage-first', memory).plans
    const selected = roleFirst.filter((plan) => plan.selectedForAffordableRoleSet)
    expect(selected.map((plan) => plan.talentId).sort()).toEqual(
      [...roleThreshold.basisTalentIds].sort(),
    )
    expect(roleFirst.slice(0, selected.length).every((plan) => plan.selectedForAffordableRoleSet)).toBe(
      true,
    )
    expect(roleFirst.slice(selected.length).every((plan) => !plan.selectedForAffordableRoleSet)).toBe(
      true,
    )

    expect(planRenewals(allState, 'C4-last-legal-role-first', memory).plans).toEqual([])
    const lastLegalState = {
      ...allState,
      market: { ...allState.market, tick: ROSTER_WALL_MECHANICS_EXPIRY_WEEK - 1 },
    }
    expect(planRenewals(lastLegalState, 'C4-last-legal-role-first', memory).plans).toHaveLength(13)

    const spread = planRenewals(allState, 'C5-spread-role-first', memory)
    const spreadSchedule = Object.values(spread.memory.scheduleByContractKey)
      .sort((a, b) => a.priorityRank - b.priorityRank)
    expect(spreadSchedule.map((schedule) => schedule.targetWeek)).toEqual(
      Array.from({ length: 13 }, (_, index) =>
        ROSTER_WALL_MECHANICS_ENTRY_WEEK + Math.floor((index * 12) / 13),
      ),
    )
    expect(spread.plans.every((plan) => plan.targetWeek === ROSTER_WALL_MECHANICS_ENTRY_WEEK)).toBe(
      true,
    )

    const mixed = planRenewals(allState, 'C6-mixed-term-role-first', memory)
    const canonicalRoleOrder = planRenewals(
      allState,
      'C3-role-coverage-first',
      memory,
    ).plans.map((plan) => plan.talentId)
    expect(
      canonicalRoleOrder.map((talentId) => mixed.memory.mixedTermByTalentId[talentId]),
    ).toEqual(Array.from({ length: 13 }, (_, index) => [52, 104, 156, 208][index % 4]))
    expect(
      mixed.plans.every(
        (plan) => mixed.memory.mixedTermByTalentId[plan.talentId] === plan.selectedTerm,
      ),
    ).toBe(true)
    expect(
      planRenewals(allState, 'C6-mixed-term-role-first', mixed.memory).plans.map(
        (plan) => plan.selectedTerm,
      ),
    ).toEqual(mixed.plans.map((plan) => plan.selectedTerm))
  })

  it('emits the complete canonical-data-ready matrix deterministically', () => {
    expect(ROSTER_WALL_MECHANICS_FIXTURE_MATRIX).toMatchObject({
      cohortCount: 3,
      thresholdsPerCohort: 8,
      policiesPerThreshold: 7,
      rowCount: 168,
      executedRowCount: 154,
      notApplicableRowCount: 14,
    })
    expect(ROSTER_WALL_MECHANICS_FIXTURE_ROW_COUNT).toBe(168)
    expect(rows()).toHaveLength(168)
    expect(new Set(rows().map((fixture) => fixture.fixtureId)).size).toBe(168)
    expect(JSON.stringify(runRosterWallMechanicsFixtures(SOURCE))).toBe(JSON.stringify(rows()))
    expect(
      rows().every(
        (fixture) =>
          fixture.schemaVersion === ROSTER_WALL_MECHANICS_SCHEMA_VERSION &&
          fixture.recordType === ROSTER_WALL_MECHANICS_RECORD_TYPE &&
          fixture.mode === ROSTER_WALL_MECHANICS_MODE &&
          fixture.experimentId === 'week-208-roster-wall-v1' &&
          fixture.fixtureExperimentId === ROSTER_WALL_MECHANICS_EXPERIMENT_ID &&
          fixture.seedSetId === 'canonical-facilities-25-v1' &&
          fixture.operatingPolicyId === null &&
          fixture.estatePolicyId === null &&
          fixture.foundingTermPolicyId === null &&
          fixture.initialSaveHash === null &&
          fixture.entryId === null &&
          fixture.entrySaveHash === null &&
          fixture.entryStateHash === null &&
          fixture.week === ROSTER_WALL_MECHANICS_ENTRY_WEEK &&
          fixture.source.worktreeDirty === false &&
          fixture.actualInvariants.allPassed,
      ),
    ).toBe(true)

    const notApplicable = rows().filter((fixture) => !fixture.threshold.applicable)
    expect(notApplicable).toHaveLength(14)
    expect(
      notApplicable.every(
        (fixture) =>
          fixture.cohortSize === 1 &&
          fixture.threshold.value === null &&
          fixture.threshold.missingRoles.length === 4 &&
          fixture.intents.length === 0 &&
          fixture.outcome === null &&
          fixture.payrollOverheadLedger === null &&
          fixture.actualInvariants.notApplicableMissingRolesRetained,
      ),
    ).toBe(true)
  })

  it('proves half-open expiry, final payroll, free-agent transfer, and separated overhead', () => {
    const rejected = row(7, 'cash-zero', 'C1-current-retry-all')
    expect(rejected.outcome).not.toBeNull()
    expect(rejected.payrollOverheadLedger).not.toBeNull()
    expect(rejected.intents).toHaveLength(7 * 12)
    expect(rejected.intents.every((intent) => !intent.accepted)).toBe(true)
    expect(rejected.intents.every((intent) => intent.rngBefore === intent.rngAfter)).toBe(true)
    expect(
      rejected.intents.every(
        (intent) =>
          intent.signingBonusLedgerIndex === null && intent.signingBonusLedgerEntry === null,
      ),
    ).toBe(true)
    expect(rejected.outcome!.signingBonusRows).toEqual([])
    expect(rejected.outcome!.retainedTalentIds).toEqual([])
    expect(rejected.outcome!.releasedTalentIds).toEqual(rejected.cohortTalentIds)
    expect(rejected.outcome!.transferredFreeAgentIds).toEqual(rejected.cohortTalentIds)
    expect(rejected.outcome!.finalFreeAgentIds.slice(1)).toEqual(rejected.cohortTalentIds)

    const ledger = rejected.payrollOverheadLedger!
    expect(ledger.transitions).toHaveLength(12)
    expect(ledger.payrollRowCount).toBe(12)
    expect(ledger.overheadRowCount).toBe(12)
    expect(ledger.finalPayrollWeek).toBe(207)
    expect(ledger.finalPayrollLedgerAmount).toBe(-ledger.finalPayrollScheduled)
    expect(ledger.finalOverheadLedgerAmount).toBe(-ledger.finalOverheadScheduled)
    const expiryAdvance = ledger.transitions[11]!
    expect(expiryAdvance.activeTalentIdsBeforeTick).toEqual(rejected.cohortTalentIds)
    expect(expiryAdvance.activeTalentIdsAfterTick).toEqual([])
    expect(expiryAdvance.payrollRows).toHaveLength(1)
    expect(expiryAdvance.payrollRows[0]!.entry.kind).toBe('payroll')
    expect(expiryAdvance.overheadRows).toHaveLength(1)
    expect(expiryAdvance.overheadRows[0]!.entry.kind).toBe('overhead')
    expect(expiryAdvance.appendedLedger.map((item) => item.entry.kind)).toEqual([
      'payroll',
      'overhead',
    ])
    expect(rejected.actualInvariants).toMatchObject({
      halfOpenExpiryExact: true,
      finalPayrollMatched: true,
      rejectedHaveNoSigningBonus: true,
      renewalRngUnchanged: true,
      finalRngUnchangedWithoutProductions: true,
      expiredTransferredToFreeAgents: true,
      payrollAndOverheadSeparate: true,
      cashLedgerReconciles: true,
      allPassed: true,
    })
  })

  it('records exactly one matching bonus per acceptance and distinguishes partial retention', () => {
    const accepted = row(7, 'all-cohort-bonuses-exact', 'C1-current-retry-all')
    expect(accepted.intents).toHaveLength(7)
    expect(accepted.intents.every((intent) => intent.accepted)).toBe(true)
    expect(accepted.outcome!.acceptedOwnerIds).toHaveLength(7)
    expect(accepted.outcome!.retainedTalentIds).toEqual(accepted.cohortTalentIds)
    expect(accepted.outcome!.releasedTalentIds).toEqual([])
    expect(accepted.outcome!.signingBonusRows).toHaveLength(7)
    expect(
      accepted.outcome!.signingBonusRows.reduce((sum, row) => sum - row.entry.amount, 0),
    ).toBe(accepted.threshold.value)
    for (const intent of accepted.intents) {
      expect(intent.rngAfter).toBe(intent.rngBefore)
      expect(intent.signingBonusLedgerEntry).toMatchObject({
        week: 196,
        kind: 'signingBonus',
        amount: -intent.offer.signingBonus,
        talentId: intent.talentId,
        note: 'renewal signing bonus',
      })
    }
    expect(accepted.actualInvariants.acceptedHaveExactlyOneSigningBonus).toBe(true)

    const partial = row(7, 'minimum-single-quote-exact', 'C2-cheapest-bonus-first')
    expect(partial.outcome!.acceptedOwnerIds).toHaveLength(1)
    expect(partial.outcome!.retainedTalentIds).toEqual(partial.outcome!.acceptedOwnerIds)
    expect(partial.outcome!.releasedTalentIds).toHaveLength(6)
    expect(partial.outcome!.signingBonusRows).toHaveLength(1)

    const noRenewal = row(7, 'all-cohort-bonuses-exact', 'C0-no-renewal')
    expect(noRenewal.intents).toEqual([])
    expect(noRenewal.outcome!.acceptedOwnerIds).toEqual([])
    expect(noRenewal.outcome!.rejectedOwnerIds).toEqual([])
    expect(noRenewal.outcome!.retryAttempts).toBe(0)
    expect(noRenewal.outcome!.releasedTalentIds).toEqual(noRenewal.cohortTalentIds)
  })

  it('prices C6 thresholds from its mixed 52/104/156/208 offers, not 208-week quotes', () => {
    const mixedThresholds = deriveRosterWallMechanicsThresholds(
      13,
      'C6-mixed-term-role-first',
    )
    const mixedAll = mixedThresholds.find(
      (threshold) => threshold.thresholdId === 'all-cohort-bonuses-exact',
    )!
    const maximumTermState = buildRosterWallMechanicsFixtureState(13, 0)
    const maximumTermAll = ROSTER_WALL_MECHANICS_FIXTURE_COHORTS[2].talentIds.reduce(
      (sum, talentId) =>
        sum + contractOffer(maximumTermState, talentId, 208).signingBonus,
      0,
    )

    expect(mixedAll.basisOffers.map((offer) => offer.selectedTerm)).toEqual(
      Array.from({ length: 13 }, (_, index) => [52, 104, 156, 208][index % 4]),
    )
    expect(mixedAll.referenceAmount).toBe(
      mixedAll.basisOffers.reduce((sum, offer) => sum + offer.signingBonus, 0),
    )
    expect(mixedAll.referenceAmount).not.toBe(maximumTermAll)

    const exact = row(13, 'all-cohort-bonuses-exact', 'C6-mixed-term-role-first')
    expect(exact.threshold).toEqual(mixedAll)
    expect(exact.intents).toHaveLength(13)
    expect(exact.intents.every((intent) => intent.accepted)).toBe(true)
    expect(exact.outcome!.acceptedOwnerIds).toHaveLength(13)
    expect(exact.outcome!.signingBonusRows).toHaveLength(13)

    const minusOne = row(
      13,
      'all-cohort-bonuses-minus-one',
      'C6-mixed-term-role-first',
    )
    expect(minusOne.threshold.referenceAmount).toBe(mixedAll.referenceAmount)
    const firstPass = minusOne.intents.filter(
      (intent) => intent.actualWeek === ROSTER_WALL_MECHANICS_ENTRY_WEEK,
    )
    expect(firstPass.filter((intent) => intent.accepted)).toHaveLength(12)
    expect(firstPass.filter((intent) => !intent.accepted)).toHaveLength(1)
    expect(new Set(minusOne.intents.filter((intent) => !intent.accepted).map(
      (intent) => intent.talentId,
    ))).toHaveLength(1)
  })
})
