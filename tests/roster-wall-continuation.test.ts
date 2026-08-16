import { describe, expect, it } from 'vitest'
import { stableStringify } from '../src/core/index.js'
import { runRosterWallEntryCampaign } from '../src/harness/roster-wall/campaign.js'
import {
  runRosterWallContinuationArm,
  runRosterWallContinuationCorpus,
  verifyRosterWallContinuationObserverNeutrality,
} from '../src/harness/roster-wall/continuation.js'
import type { RosterWallSourceProvenance } from '../src/harness/roster-wall/provenance.js'

const SOURCE: RosterWallSourceProvenance = {
  branch: 'operation-hollywood-autonomous-marathon',
  commit: 'roster-wall-continuation-test',
  tree: 'roster-wall-continuation-test-tree',
  worktreeDirty: false,
  runtime: 'vitest',
  saveVersion: 12,
  productionAuthorityCommit: '8b7e95eb92f6f809522a595b4b458d4f19e26852',
  productionAuthorityTree: 'test-production-tree',
  authorityDiffPaths: ['src/harness/roster-wall/continuation.ts'],
}

function harvest(seed: string) {
  return runRosterWallEntryCampaign({
    seed,
    operatingPolicyId: 'direct-package',
    estatePolicyId: 'vacant',
  })
}

describe('Week-208 roster-wall continuation layer', () => {
  it('fresh-loads the exact Week-196 entry, applies renewal first, and reconciles every transition', () => {
    const entry = harvest('roster-wall-continuation-fresh-load')
    const entryBytesBefore = entry.entrySaveBytes
    const arm = runRosterWallContinuationArm({
      harvest: entry,
      continuationPolicyId: 'C1-current-retry-all',
      source: SOURCE,
      horizonWeeks: 220,
    })

    expect(entry.entrySaveBytes).toBe(entryBytesBefore)
    expect(arm.freshImportSaveHash).toBe(entry.entrySaveHash)
    expect(arm.freshImportStateHash).toBe(entry.entryStateHash)
    expect(arm.weekly[0]).toMatchObject({ week: 196, arrivalWeek: 197 })
    expect(arm.renewalIntents.length).toBeGreaterThanOrEqual(entry.cohort.length)
    expect(arm.renewalIntents.slice(0, entry.cohort.length).every((intent) => intent.actualWeek === 196)).toBe(true)
    expect(arm.renewalIntents.every((intent) => intent.actualWeek >= 196 && intent.actualWeek <= 207)).toBe(true)
    expect(arm.renewalIntents.every((intent) => intent.rngBefore === intent.rngAfter)).toBe(true)
    expect(
      arm.weekly.every((row) =>
        row.renewalIntentIds.every(
          (intentId, index) =>
            arm.renewalIntents.filter((intent) => intent.actualWeek === row.week)[index]
              ?.intentId === intentId,
        ) &&
        row.renewalIntentIds.length ===
          arm.renewalIntents.filter((intent) => intent.actualWeek === row.week).length,
      ),
    ).toBe(true)
    expect(arm.weekly.every((row) => Math.abs(row.cashReconciliationAfter.delta) <= 1e-6)).toBe(true)
    expect(arm.weekly.every((row) => row.scheduledPayroll === row.ledgerPayroll)).toBe(true)
    expect(arm.weekly.every((row) => row.scheduledOverhead === row.ledgerOverhead)).toBe(true)
    expect(
      arm.weekly.every(
        (row) =>
          row.theatricalReceiptReconciliation.delta === 0 &&
          row.theatricalReceiptReconciliation.scheduledTotal ===
            row.theatricalReceiptReconciliation.ledgerTotal &&
          row.theatricalReceiptReconciliation.ledgerRowCount ===
            row.theatricalReceiptRows.length,
      ),
    ).toBe(true)
    expect(arm.summary.theatricalReceiptsReceived).toBe(
      arm.weekly.reduce(
        (total, row) => total + row.theatricalReceiptReconciliation.ledgerTotal,
        0,
      ),
    )
    expect(arm.boundaries.map((row) => row.relation)).toEqual(
      expect.arrayContaining([
        'window-eve',
        'window-arrival',
        'expiry-eve',
        'expiry-arrival',
        'post-expiry-12',
      ]),
    )
    const windowEve = arm.boundaries.find((row) => row.relation === 'window-eve')!
    expect(windowEve.week).toBe(195)
    expect(windowEve.arrivalWeek).toBe(196)
    expect(windowEve.arrivalStateHash).toBe(entry.entryStateHash)
    expect(windowEve.arrivalRngState).toBe(entry.entryRngState)
    expect(windowEve.transitionLedgerRows).toEqual(entry.preEntryWindowEve.transitionLedgerRows)
    expect(arm.summary.taxonomy.intendedOriginalCohortOwners).toBe(entry.cohort.length)
    expect(arm.summary.taxonomy.attemptedOriginalCohortOwners).toBeGreaterThan(0)
    expect(arm.summary.taxonomy.originalExpiryObserved).toBe(true)
    expect(arm.summary.taxonomy.partialCohortWall).toBe(
      arm.summary.taxonomy.retainedOriginalCohort > 0 &&
        (arm.summary.taxonomy.rejectedOriginalCohortOwners > 0 ||
          arm.summary.taxonomy.expiredIntendedOriginalCohortOwners > 0),
    )
    expect(arm.summary.taxonomy.fullInvoluntaryCohortWall).toBe(
      arm.summary.taxonomy.retainedOriginalCohort === 0 &&
        arm.summary.taxonomy.attemptedOriginalCohortOwners > 0,
    )
    expect(Object.values(arm.summary.evaluatedInvariants)).toEqual(
      Array(Object.keys(arm.summary.evaluatedInvariants).length).fill(true),
    )
    expect(arm.summary.invariantFailures).toBe(0)
  })

  it('keeps C0 voluntary attrition out of involuntary-wall taxonomy', () => {
    const entry = harvest('roster-wall-continuation-c0')
    const arm = runRosterWallContinuationArm({
      harvest: entry,
      continuationPolicyId: 'C0-no-renewal',
      source: SOURCE,
      horizonWeeks: 220,
    })

    expect(arm.renewalIntents).toHaveLength(0)
    expect(arm.summary.taxonomy.retainedOriginalCohort).toBe(0)
    expect(arm.summary.taxonomy.intendedOriginalCohortOwners).toBe(0)
    expect(arm.summary.taxonomy.attemptedOriginalCohortOwners).toBe(0)
    expect(arm.summary.taxonomy.voluntaryNoRenewalControl).toBe(true)
    expect(arm.summary.taxonomy.fullInvoluntaryCohortWall).toBe(false)
    expect(arm.summary.taxonomy.partialCohortWall).toBe(false)
    expect(arm.weekly.every((row) => row.economyEngagedEver)).toBe(true)
    expect(arm.weekly.every((row) => !row.absorbingNoDecisionState)).toBe(true)
  })

  it('runs all seven primary policies from one entry and builds exact-entry C1 pairs', () => {
    const entry = harvest('roster-wall-continuation-corpus')
    const corpus = runRosterWallContinuationCorpus({
      harvest: entry,
      source: SOURCE,
      includeLongHorizon: false,
    })

    expect(corpus.arms).toHaveLength(7)
    expect(corpus.observerNeutrality).toEqual({
      checkedArms: 7,
      byteIdenticalArms: 7,
      stateHashIdenticalArms: 7,
      rngStateIdenticalArms: 7,
      failures: 0,
    })
    expect(new Set(corpus.arms.map((arm) => arm.continuationPolicyId)).size).toBe(7)
    expect(new Set(corpus.arms.map((arm) => arm.freshImportStateHash))).toEqual(
      new Set([entry.entryStateHash]),
    )
    expect(corpus.pairs).toHaveLength(6)
    expect(corpus.pairs.every((pair) => pair.commonEntry.entrySaveHash === entry.entrySaveHash)).toBe(
      true,
    )
    expect(
      corpus.pairs.every(
        (pair) =>
          pair.causalBoundaryLabel ===
          'renewal-policy-only-after-byte-identical-week-196-entry',
      ),
    ).toBe(true)
    for (const pair of corpus.pairs) {
      expect(pair.facilityCausality).toBe('not-estimated-by-within-estate-policy-pair')
      expect(pair.estateInterpretation).toBe('causal-renewal-policy-within-vacant-entry')
      expect(pair.exactEntryPairedTableEligible).toBe(true)
      expect(pair.commonEntry.rngState).toBe(entry.entryRngState)
      expect(pair.commonEntry.cashReconciliation.delta).toBe(0)
      expect(pair.signingBonusTotals.delta).toBe(
        pair.signingBonusTotals.compared - pair.signingBonusTotals.baseline,
      )
      expect(pair.payroll.delta).toBe(pair.payroll.compared - pair.payroll.baseline)
      expect(pair.employeeOverhead.delta).toBe(
        pair.employeeOverhead.compared - pair.employeeOverhead.baseline,
      )
      expect(pair.packageStaffabilityBlockers.delta).toBe(
        pair.packageStaffabilityBlockers.compared - pair.packageStaffabilityBlockers.baseline,
      )
      expect(pair.theatricalReceiptsReceived.delta).toBe(
        pair.theatricalReceiptsReceived.compared -
          pair.theatricalReceiptsReceived.baseline,
      )
      expect(pair.finalCash.delta).toBe(pair.finalCash.compared - pair.finalCash.baseline)
      expect(pair.roleCoverage.delta.actor).toBe(
        pair.roleCoverage.compared.actor - pair.roleCoverage.baseline.actor,
      )
    }
    expect(stableStringify(corpus)).not.toContain('undefined')
  })

  it('keeps Annex same-entry policy pairs out of facility-causal paired tables', () => {
    const entry = runRosterWallEntryCampaign({
      seed: 'roster-wall-continuation-annex-pairs',
      operatingPolicyId: 'direct-package',
      estatePolicyId: 'annex-start-week-0',
    })
    const corpus = runRosterWallContinuationCorpus({
      harvest: entry,
      source: SOURCE,
      includeLongHorizon: false,
    })

    expect(corpus.pairs).toHaveLength(6)
    expect(
      corpus.pairs.every(
        (pair) =>
          pair.estateInterpretation === 'descriptive-renewal-policy-within-annex-entry' &&
          !pair.exactEntryPairedTableEligible &&
          pair.facilityCausality === 'not-estimated-by-within-estate-policy-pair',
      ),
    ).toBe(true)
  })

  it('keeps recurrence attempts out of the original-expiry wall taxonomy', () => {
    const entry = harvest('roster-wall-continuation-original-taxonomy')
    const arm = runRosterWallContinuationArm({
      harvest: entry,
      continuationPolicyId: 'C1-current-retry-all',
      source: SOURCE,
      horizonWeeks: 428,
    })
    const originalKeys = new Set(
      entry.cohort.map(
        (member) =>
          `${member.talentId}:${String(member.startWeek)}:${String(member.endWeekExclusive)}`,
      ),
    )
    const originalIntents = arm.renewalIntents.filter((intent) =>
      originalKeys.has(intent.contractKey),
    )
    const originalAccepted = new Set(
      originalIntents.filter((intent) => intent.accepted).map((intent) => intent.contractKey),
    )
    const originalRejected = new Set(
      originalIntents.filter((intent) => !intent.accepted).map((intent) => intent.contractKey),
    )

    expect(arm.summary.taxonomy.attemptedOriginalCohortOwnerKeys).toEqual(
      [...new Set(originalIntents.map((intent) => intent.contractKey))].sort(),
    )
    expect(arm.summary.taxonomy.acceptedOriginalCohortOwnerKeys).toEqual(
      [...originalAccepted].sort(),
    )
    expect(arm.summary.taxonomy.rejectedOriginalCohortOwnerKeys).toEqual(
      [...originalRejected].sort(),
    )
    expect(arm.summary.taxonomy.originalCohortRetryAttempts).toBe(
      originalIntents.filter((intent) => !intent.accepted).length,
    )
    expect(
      arm.renewalIntents.some((intent) => !originalKeys.has(intent.contractKey)),
    ).toBe(arm.summary.recurrence.length > 0)
  })

  it('is byte-identical with continuation observation disabled', () => {
    const entry = harvest('roster-wall-continuation-neutrality')
    const result = verifyRosterWallContinuationObserverNeutrality({
      harvest: entry,
      continuationPolicyId: 'C5-spread-role-first',
      source: SOURCE,
      horizonWeeks: 220,
    })

    expect(result.byteIdentical).toBe(true)
    expect(result.observedStateHash).toBe(result.observerDisabledStateHash)
    expect(result.observedSaveHash).toBe(result.observerDisabledSaveHash)
    expect(result.observedRngState).toBe(result.observerDisabledRngState)
    expect(result.finalWeek).toBe(220)
  })
})
