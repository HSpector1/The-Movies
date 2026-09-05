import { describe, expect, it } from 'vitest'
import { FOUNDING_MINIMUMS } from '../src/core/index.js'
import type {
  RosterWallAcceptedArtifactCounts,
} from '../src/harness/roster-wall/artifacts.js'
import { rosterWallAcceptedArtifactMatrix } from '../src/harness/roster-wall/artifacts.js'
import { runRosterWallNeutralEntryCampaign } from '../src/harness/roster-wall/campaign.js'
import {
  rosterWallContinuationRows,
  runRosterWallContinuationCorpus,
} from '../src/harness/roster-wall/continuation.js'
import {
  runRosterWallPlayerPolicy,
  serializeRosterWallPlayerPolicyEvidence,
} from '../src/harness/roster-wall/player-policy.js'
import type { RosterWallSourceProvenance } from '../src/harness/roster-wall/provenance.js'
import {
  makeRosterWallEntryRecord,
  makeRosterWallShadowRecords,
} from '../src/harness/roster-wall/schema.js'
import { orderedRosterWallPlayerRecords } from '../src/harness/roster-wall/corpus.js'
import {
  assertRosterWallResearchSummaryMatches,
  renderRosterWallSummaryMarkdown,
  rosterWallMetricDistribution,
  rosterWallPairSigns,
  RosterWallSummaryAccumulator,
  validateRosterWallResearchSummary,
} from '../src/harness/roster-wall/summary.js'
import type {
  RosterWallResearchSummary,
  RosterWallSummaryGovernance,
} from '../src/harness/roster-wall/summary.js'

const SOURCE: RosterWallSourceProvenance = {
  branch: 'operation-hollywood-autonomous-marathon',
  commit: '1'.repeat(40),
  tree: '2'.repeat(40),
  worktreeDirty: false as const,
  runtime: 'node test',
  saveVersion: 18 as const,
  productionAuthorityCommit: '8b7e95eb92f6f809522a595b4b458d4f19e26852',
  productionAuthorityTree: '3'.repeat(40),
  authorityDiffPaths: ['src/harness/roster-wall/summary.ts'],
}

const GOVERNANCE: RosterWallSummaryGovernance = {
  schemaVersion: 'roster-wall-observer-v1',
  experimentId: 'week-208-roster-wall-v1',
  seedSetId: 'canonical-facilities-25-v1',
  profile: 'smoke',
  completeEvidence: false,
  source: SOURCE,
  matrix: rosterWallAcceptedArtifactMatrix('smoke'),
}

const COUNTS: RosterWallAcceptedArtifactCounts = {
  entries: 0,
  rows: 0,
  recordTypes: {
    entry: 0,
    weekly: 0,
    renewalIntent: 0,
    boundary: 0,
    windowShadow: 0,
    mechanicsFixture: 0,
    pair: 0,
  },
}

function emptySummary(): RosterWallResearchSummary {
  const finding = {
    status: 'not-observed' as const,
    numerator: 0,
    denominator: 0,
    statement: 'No observed rows in this validator fixture.',
    facts: {},
  }
  return {
    ...GOVERNANCE,
    counts: COUNTS,
    invariantFailures: 0,
    denominators: {
      maximumEntries: 0,
      playerEntries: 0,
      continuationRuns: 0,
      cohorts: 0,
      intendedOriginalOwners: 0,
      attemptedOriginalOwners: 0,
      acceptedOriginalOwners: 0,
      uniqueRejectedOriginalOwners: 0,
      originalRetryAttempts: 0,
      allAttemptedContractObligations: 0,
      allAcceptedContractObligations: 0,
      allUniqueRejectedContractObligations: 0,
      allRetryAttempts: 0,
      exactPairs: 0,
      fixtureRows: 0,
    },
    invariantChecks: {
      evaluated: 0,
      failures: 0,
      entryReplayRows: 0,
      cashReconciliationRows: 0,
      payrollLedgerAgreementRows: 0,
      overheadLedgerAgreementRows: 0,
      receiptLedgerAgreementRows: 0,
      renewalRngNeutralRows: 0,
      fixtureInvariantRows: 0,
    },
    warningFacts: [],
    runFacts: [],
    strata: {
      bySeed: [],
      byOperatingPolicy: [],
      byEstate: [],
      byContinuationPolicy: [],
      byCashAtWindow: [],
      byTaxonomyOutcome: [],
    },
    exactVacantPairs: { facts: [], aggregates: [] },
    playerPolicy: { runFacts: [], aggregatesByOperatingPolicy: [] },
    mechanicsFixtures: [],
    hypotheses: {
      H1: finding,
      H2: finding,
      H3: finding,
      H4: finding,
      H5: finding,
      H6: finding,
    },
    decisionGates: {
      D1: finding,
      D2: finding,
      D3: finding,
      D4: finding,
      D5: finding,
      D6: finding,
      D7: finding,
    },
    interpretationBoundary: {
      researchOnly: true,
      productionBehaviorChanged: false,
      facilityCausalityEstimated: false,
      implementationAuthorized: false,
      separateContractAndOwnerAuthorizationRequired: true,
      openMacroeconomyResiduals: ['week-208 synchronized roster wall'],
    },
  }
}

describe('roster-wall summary', () => {
  it('uses deterministic nearest-rank quartiles and exact signs', () => {
    expect(rosterWallMetricDistribution([9, 1, 5, 3])).toEqual({
      n: 4,
      min: 1,
      p25: 1,
      median: 3,
      p75: 5,
      max: 9,
    })
    expect(rosterWallMetricDistribution([])).toEqual({
      n: 0,
      min: null,
      p25: null,
      median: null,
      p75: null,
      max: null,
    })
    expect(rosterWallPairSigns([-2, 0, 7, -1, 0])).toEqual({
      negative: 2,
      zero: 2,
      positive: 1,
    })
  })

  it('requires all H1-H6, D1-D7, denominators, and the research boundary', () => {
    const summary = emptySummary()
    const expected = { ...GOVERNANCE, counts: COUNTS }
    expect(validateRosterWallResearchSummary(summary, expected)).toEqual(summary)
    expect(assertRosterWallResearchSummaryMatches(summary, summary)).toEqual(summary)
    const skeletal = { ...summary, hypotheses: undefined }
    expect(() => validateRosterWallResearchSummary(skeletal, expected)).toThrow(/hypotheses|H\/D/)
  })

  it('renders deterministic Markdown from summary facts only', () => {
    const summary = emptySummary()
    const first = renderRosterWallSummaryMarkdown(summary)
    const second = renderRosterWallSummaryMarkdown(structuredClone(summary))
    expect(first).toBe(second)
    expect(first).toContain('## H1-H6')
    expect(first).toContain('## D1-D7')
    expect(first).toContain('research, not an implementation authorization')
    expect(first.endsWith('\n')).toBe(true)
  })

  it('derives boundary, recurrence, and player obligations from a real evidence slice', () => {
    const neutral = runRosterWallNeutralEntryCampaign({
      seed: 'roster-wall-summary-integration',
      operatingPolicyId: 'direct-package',
      estatePolicyId: 'vacant',
    })
    const harvest = neutral.harvest
    const accumulator = new RosterWallSummaryAccumulator(GOVERNANCE)
    const entry = makeRosterWallEntryRecord(harvest, SOURCE, 'all-208', 'current')
    accumulator.observe(entry)
    for (const shadow of makeRosterWallShadowRecords(harvest, SOURCE, 'all-208')) {
      accumulator.observe(shadow)
    }
    const continuation = runRosterWallContinuationCorpus({
      harvest,
      source: SOURCE,
      includeLongHorizon: true,
    })
    for (const row of rosterWallContinuationRows(continuation)) accumulator.observe(row)

    const player = runRosterWallPlayerPolicy({
      seed: 'roster-wall-summary-integration',
      operatingPolicyId: 'direct-package',
    })
    const playerEvidence = serializeRosterWallPlayerPolicyEvidence(player, SOURCE)
    accumulator.observe(playerEvidence.entry)
    for (const row of orderedRosterWallPlayerRecords(playerEvidence)) accumulator.observe(row)

    const summary = accumulator.finish()
    expect(summary.runFacts).toHaveLength(10)
    expect(summary.hypotheses.H1).toMatchObject({
      status: 'review-required',
      numerator: 1,
      denominator: 1,
      facts: { materialityThresholdFrozen: false },
    })

    const primaryComparable = continuation.arms.filter(
      (arm) =>
        arm.horizonWeeks === 260 &&
        arm.continuationPolicyId !== 'C0-no-renewal' &&
        arm.continuationPolicyId !== 'C6-mixed-term-role-first',
    )
    const originalKeys = new Set(
      harvest.cohort.map(
        (member) =>
          `${member.talentId}:${String(member.startWeek)}:${String(member.endWeekExclusive)}`,
      ),
    )
    const week196Owners = new Map(
      harvest.shadows
        .find((shadow) => shadow.week === 196)!
        .owners.map((owner) => [owner.talentId, owner]),
    )
    const expectedH4 = primaryComparable.reduce((total, arm) => {
      const qualifying = new Set(
        arm.renewalIntents
          .filter(
            (intent) =>
              !intent.accepted &&
              originalKeys.has(intent.contractKey) &&
              week196Owners.get(intent.talentId)?.earliestLaterLegalFeasibleWeek !== null &&
              week196Owners.get(intent.talentId)!.earliestLaterLegalFeasibleWeek! <
                intent.actualWeek,
          )
          .map((intent) => intent.contractKey),
      )
      return total + qualifying.size
    }, 0)
    const expectedH4Denominator = primaryComparable.reduce(
      (total, arm) =>
        total +
        new Set(
          arm.renewalIntents
            .filter((intent) => !intent.accepted && originalKeys.has(intent.contractKey))
            .map((intent) => intent.contractKey),
        ).size,
      0,
    )
    expect(summary.hypotheses.H4).toMatchObject({
      numerator: expectedH4,
      denominator: expectedH4Denominator,
    })
    expect(summary.decisionGates.D3.denominator).toBe(expectedH4Denominator)

    const c1Primary = continuation.arms.find(
      (arm) =>
        arm.horizonWeeks === 260 &&
        arm.continuationPolicyId === 'C1-current-retry-all',
    )!
    const c1RejectedOriginal = new Set(
      c1Primary.renewalIntents
        .filter((intent) => !intent.accepted && originalKeys.has(intent.contractKey))
        .map((intent) => intent.contractKey),
    )
    const c1NeverFeasible = [...c1RejectedOriginal].filter((contractKey) => {
      const talentId = contractKey.slice(0, contractKey.indexOf(':'))
      return week196Owners.get(talentId)?.earliestLaterLegalFeasibleWeek === null
    })
    expect(summary.hypotheses.H2).toMatchObject({
      numerator: c1NeverFeasible.length,
      denominator: c1RejectedOriginal.size,
    })

    const expectedOrderingPairs = continuation.pairs.filter((pair) =>
      ['C2-cheapest-bonus-first', 'C3-role-coverage-first'].includes(
        pair.comparedPolicyId,
      ),
    )
    const expectedRoleImprovements = expectedOrderingPairs.filter((pair) => {
      const baselineMissing = Object.entries(pair.roleCoverage.baseline).filter(
        ([role, count]) => count < FOUNDING_MINIMUMS[role as keyof typeof FOUNDING_MINIMUMS],
      ).length
      const comparedMissing = Object.entries(pair.roleCoverage.compared).filter(
        ([role, count]) => count < FOUNDING_MINIMUMS[role as keyof typeof FOUNDING_MINIMUMS],
      ).length
      return (
        comparedMissing < baselineMissing &&
        pair.acceptedOriginalOwnerCounts.delta === 0
      )
    })
    expect(summary.hypotheses.H3).toMatchObject({
      numerator: expectedRoleImprovements.length,
      denominator: expectedOrderingPairs.length,
      facts: { fixedAffordableSubsetProven: false },
    })
    expect(summary.decisionGates.D2).toMatchObject({
      numerator: expectedRoleImprovements.length,
      denominator: expectedOrderingPairs.length,
      facts: { fixedAffordableSubsetProven: false },
    })

    const displacement = continuation.arms.filter(
      (arm) =>
        arm.horizonWeeks === 428 &&
        ['C5-spread-role-first', 'C6-mixed-term-role-first'].includes(
          arm.continuationPolicyId,
        ),
    )
    const recurrentDisplacement = displacement.filter((arm) =>
      arm.boundaries.some(
        (row) =>
          row.relation === 'recurrence-window' ||
          row.relation === 'recurrence-post-expiry',
      ),
    )
    expect(summary.hypotheses.H5).toMatchObject({
      numerator: recurrentDisplacement.length,
      denominator: displacement.length,
    })
    expect(summary.decisionGates.D4).toMatchObject({
      status: recurrentDisplacement.length > 0 ? 'review-required' : 'not-observed',
      numerator: recurrentDisplacement.length,
      denominator: displacement.length,
      facts: { materialityThresholdFrozen: false },
    })
    const c6Long = continuation.arms.find(
      (arm) =>
        arm.horizonWeeks === 428 &&
        arm.continuationPolicyId === 'C6-mixed-term-role-first',
    )!
    const c6Fact = summary.runFacts.find(
      (fact) =>
        fact.horizonWeeks === 428 &&
        fact.continuationPolicyId === 'C6-mixed-term-role-first',
    )!
    for (const obligation of c6Fact.recurrenceQuotedObligations) {
      const expectedSelectedTermQuote = new Map<string, number>()
      for (const intent of c6Long.renewalIntents.filter(
        (candidate) =>
          !originalKeys.has(candidate.contractKey) &&
          Number(candidate.contractKey.slice(candidate.contractKey.lastIndexOf(':') + 1)) - 12 ===
            obligation.week,
      )) {
        if (!expectedSelectedTermQuote.has(intent.contractKey)) {
          expectedSelectedTermQuote.set(intent.contractKey, intent.offer.signingBonus)
        }
      }
      expect(obligation.signingBonus).toBe(
        [...expectedSelectedTermQuote.values()].reduce((sum, amount) => sum + amount, 0),
      )
    }
    const c6IntendedOriginalKeys = originalKeys
    const c6AttemptedKeys = new Set(c6Long.renewalIntents.map((intent) => intent.contractKey))
    const c6AcceptedKeys = new Set(
      c6Long.renewalIntents.filter((intent) => intent.accepted).map((intent) => intent.contractKey),
    )
    const c6RejectedKeys = new Set(
      c6Long.renewalIntents.filter((intent) => !intent.accepted).map((intent) => intent.contractKey),
    )
    const c6OriginalAttempted = [...c6AttemptedKeys].filter((key) =>
      c6IntendedOriginalKeys.has(key),
    )
    const c6OriginalAccepted = [...c6AcceptedKeys].filter((key) =>
      c6IntendedOriginalKeys.has(key),
    )
    const c6OriginalRejected = [...c6RejectedKeys].filter((key) =>
      c6IntendedOriginalKeys.has(key),
    )
    const c6OriginalRetries = c6Long.renewalIntents.filter(
      (intent) => !intent.accepted && c6IntendedOriginalKeys.has(intent.contractKey),
    ).length
    expect(c6Fact).toMatchObject({
      intendedOriginalOwners: c6IntendedOriginalKeys.size,
      attemptedOriginalOwners: c6OriginalAttempted.length,
      acceptedOriginalOwners: c6OriginalAccepted.length,
      uniqueRejectedOriginalOwners: c6OriginalRejected.length,
      originalRetryAttempts: c6OriginalRetries,
      allAttemptedContractObligations: c6AttemptedKeys.size,
      allAcceptedContractObligations: c6AcceptedKeys.size,
      allUniqueRejectedContractObligations: c6RejectedKeys.size,
      allRetryAttempts: c6Long.renewalIntents.filter((intent) => !intent.accepted).length,
      recurrenceAttemptedContractObligations:
        c6AttemptedKeys.size - c6OriginalAttempted.length,
      recurrenceAcceptedContractObligations:
        c6AcceptedKeys.size - c6OriginalAccepted.length,
      recurrenceUniqueRejectedContractObligations:
        c6RejectedKeys.size - c6OriginalRejected.length,
      recurrenceRetryAttempts:
        c6Long.renewalIntents.filter((intent) => !intent.accepted).length -
        c6OriginalRetries,
    })

    const c6OperationallyCovered =
      c6Long.weekly.every(
        (row) =>
          row.missingFoundingRoles.length === 0 &&
          row.packageStaffabilityBlockers.length === 0,
      ) && c6Long.weekly.at(-1)!.missingFoundingRoles.length === 0
    expect(summary.decisionGates.D5).toMatchObject({
      numerator: Number(c6OperationallyCovered),
      denominator: 1,
    })
    const c1Fact = summary.runFacts.find(
      (fact) =>
        fact.horizonWeeks === 260 &&
        fact.continuationPolicyId === 'C1-current-retry-all',
    )!
    expect(c1Fact).toMatchObject({
      intendedOriginalOwners: c1Primary.summary.taxonomy.intendedOriginalCohortOwners,
      attemptedOriginalOwners: c1Primary.summary.taxonomy.attemptedOriginalCohortOwners,
      acceptedOriginalOwners: c1Primary.summary.taxonomy.acceptedOriginalCohortOwners,
      uniqueRejectedOriginalOwners: c1Primary.summary.taxonomy.rejectedOriginalCohortOwners,
      originalRetryAttempts: c1Primary.summary.taxonomy.originalCohortRetryAttempts,
      allAttemptedContractObligations: c1Primary.summary.taxonomy.uniqueAcceptedOwners +
        c1Primary.summary.taxonomy.uniqueRejectedOwners -
        c1Primary.summary.taxonomy.uniqueAcceptedOwnerKeys.filter((key) =>
          c1Primary.summary.taxonomy.uniqueRejectedOwnerKeys.includes(key),
        ).length,
      allRetryAttempts: c1Primary.summary.taxonomy.retryAttempts,
      firstPostExpiryDecisionStaffabilityBlockers:
        c1Primary.weekly.find((row) => row.week === 208)!.packageStaffabilityBlockers.length,
      firstPostExpiryDecisionAffordabilityBlockers:
        c1Primary.weekly.find((row) => row.week === 208)!.packageAffordabilityBlockers.length,
      postExpiry12DecisionStaffabilityBlockers:
        c1Primary.weekly.find((row) => row.week === 220)!.packageStaffabilityBlockers.length,
      postExpiry12DecisionAffordabilityBlockers:
        c1Primary.weekly.find((row) => row.week === 220)!.packageAffordabilityBlockers.length,
    })

    const playerFact = summary.playerPolicy.runFacts[0]!
    expect(playerFact).toMatchObject({
      foundingOwners: player.summary.foundingOwners,
      uniqueContractObligations: player.summary.uniqueContractObligations,
      uniqueAcceptedContractObligations: player.summary.uniqueAcceptedContractOwners,
      uniqueAcceptedTalents: player.summary.uniqueAcceptedTalents,
      uniqueRejectedContractObligations: player.summary.uniqueRejectedOwners,
      uniqueRejectedTalents: player.summary.uniqueRejectedTalents,
      retryAttempts: player.summary.retryAttempts,
      acceptedRenewals: player.summary.acceptedRenewals,
      totalQuotedSigningBonusObligation: player.summary.totalSigningBonusObligation,
      totalSigningBonusesPaid: player.summary.totalSigningBonusPaid,
      finalCash: player.summary.finalCash.actualCash,
      finalRoleCoverage: player.summary.finalRoleCoverage.counts,
    })
    expect(playerFact.acceptedExpiryMoves).toEqual(
      player.expiryMoves.map((move) => ({
        contractKey: `${move.talentId}:${String(move.previousStartWeek)}:${String(move.previousEndWeekExclusive)}`,
        talentId: move.talentId,
        role: move.role,
        acceptedWeek: move.acceptedWeek,
        previousEndWeekExclusive: move.previousEndWeekExclusive,
        nextEndWeekExclusive: move.nextEndWeekExclusive,
        selectedTerm: move.nextTermWeeks,
        signingBonus: move.signingBonusPaid,
      })),
    )
    expect(playerFact.finalActiveContractTalentIds).toEqual(
      player.ownerCadence
        .filter((owner) => owner.activeAtHorizon)
        .map((owner) => owner.talentId)
        .sort(),
    )
    expect(playerFact.uniqueContractObligations).toBeGreaterThanOrEqual(
      playerFact.uniqueAcceptedTalents,
    )

    const markdown = renderRosterWallSummaryMarkdown(summary)
    expect(markdown).toContain('Representative player-view warnings')
    expect(markdown).toContain('Representative original-expiry consequences')
    expect(markdown).toContain('Week-428 recurrence cadence')
    expect(markdown).toContain('Accepted obligations / people')
    expect(markdown).toContain('Minimum-role subset (jointly affordable?)')
    expect(markdown).toContain('Every accepted expiry move')
  }, 60_000)
})
