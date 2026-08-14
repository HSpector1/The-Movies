import { describe, expect, it } from 'vitest'
import { exportSave, importSave, stableStringify } from '../src/core/index.js'
import {
  ROSTER_WALL_PLAYER_POLICY_LABEL,
  projectRosterWallPlayerPolicyEntry,
  reconcilePlayerPolicyCash,
  runRosterWallPlayerPolicy,
  runRosterWallPlayerPolicyCorpus,
  serializeRosterWallPlayerPolicyEvidence,
  summarizePlayerPolicyRejectedOwners,
  validateRosterWallPlayerPolicyCorpusSeeds,
} from '../src/harness/roster-wall/player-policy.js'
import { ROSTER_WALL_CANONICAL_SEEDS } from '../src/harness/roster-wall/schema.js'
import type { RosterWallSourceProvenance } from '../src/harness/roster-wall/provenance.js'

const SOURCE: RosterWallSourceProvenance = {
  branch: 'operation-hollywood-autonomous-marathon',
  commit: 'player-policy-test-commit',
  tree: 'player-policy-test-tree',
  worktreeDirty: false,
  runtime: 'vitest',
  saveVersion: 11,
  productionAuthorityCommit: '8b7e95eb92f6f809522a595b4b458d4f19e26852',
  productionAuthorityTree: 'player-policy-test-authority-tree',
  authorityDiffPaths: ['src/harness/roster-wall/player-policy.ts'],
}

describe('Week-208 roster-wall mixed-founding-term player policy', () => {
  const run = runRosterWallPlayerPolicy({
    seed: 'roster-wall-player-policy-smoke',
    operatingPolicyId: 'development-casting',
  })

  it('uses canonical mixed founding terms and stays explicitly descriptive', () => {
    expect(run).toMatchObject({
      mode: 'player-policy',
      evidenceLabel: ROSTER_WALL_PLAYER_POLICY_LABEL,
      pairingEligible: false,
      causalClaim: null,
      estatePolicyId: 'vacant',
      foundingTermPolicyId: 'round-robin-mixed',
      continuationPolicyId: 'C1-current-retry-all',
      renewalTermWeeks: 208,
      horizonWeek: 428,
    })
    expect(run.initialSaveHash).toMatch(/^[a-f0-9]{64}$/)
    const canonical = [...run.foundingCohort].sort((a, b) =>
      a.talentId.localeCompare(b.talentId),
    )
    expect(canonical.map((member) => member.termWeeks)).toEqual(
      canonical.map((_member, index) => [52, 104, 156, 208][index % 4]),
    )
    expect(canonical.map((member) => member.endWeekExclusive)).toEqual(
      canonical.map((member) => member.termWeeks),
    )
  })

  it('harvests and reloads exact validated Week-196 SaveFileV11 bytes', () => {
    expect(run.entry.week).toBe(196)
    expect(run.entry.save.saveVersion).toBe(11)
    expect(exportSave(importSave(run.entry.saveBytes))).toBe(run.entry.saveBytes)
    expect(run.entry.replay).toMatchObject({
      importedSaveVersion: 11,
      importReexportByteIdentical: true,
      remadeReexportByteIdentical: true,
      freshContinuationImportMatchesEntry: true,
    })
    expect(run.entry.replay.freshContinuationImportStateHash).toBe(run.entry.stateHash)
    expect(run.weekly[196]!.startRngState).toBe(run.entry.rngState)
    expect(run.weekly[196]!.startCash.actualCash).toBe(
      importSave(run.entry.saveBytes).state.studio.cash,
    )
    expect(run.entry.cash.exact).toBe(true)
    expect(run.weekly).toHaveLength(428)
    expect(run.weekly[195]!.arrivalWeek).toBe(196)
    expect(run.weekly[196]!.startStateHash).toBe(run.entry.stateHash)
  })

  it('serializes the exact Week-196 entry and every player row through one envelope', () => {
    const entry = projectRosterWallPlayerPolicyEntry(run, SOURCE)
    const evidence = serializeRosterWallPlayerPolicyEvidence(run, SOURCE)

    expect(evidence.entry).toEqual(entry)
    expect(entry).toMatchObject({
      schemaVersion: 'roster-wall-observer-v1',
      recordType: 'entry',
      mode: 'player-policy',
      experimentId: 'week-208-roster-wall-v1',
      seedSetId: 'canonical-facilities-25-v1',
      seed: run.seed,
      operatingPolicyId: run.operatingPolicyId,
      estatePolicyId: 'vacant',
      foundingTermPolicyId: 'round-robin-mixed',
      continuationPolicyId: 'C1-current-retry-all',
      horizonWeeks: 428,
      initialSaveHash: run.initialSaveHash,
      entryWeek: 196,
      entrySaveHash: run.entry.saveHash,
      entryStateHash: run.entry.stateHash,
      week: 196,
      entryFileSha256: run.entry.saveHash,
    })
    expect(entry.cohort).toHaveLength(run.entry.roster.length)
    expect(entry.cohort.every((member) => member.weeklySalary > 0)).toBe(true)
    expect(entry.cohort.every((member) => member.renewalQuote208.termWeeks === 208)).toBe(
      true,
    )
    expect(entry.ledger).toEqual(run.entry.save.state.ledger)
    expect(entry.construction).toEqual(run.entry.save.state.construction)
    expect(entry.operationsFacilities).toEqual(run.entry.save.state.operations.facilities)
    expect(evidence.weekly.every((row) =>
      [...row.activeContractTalentIds].sort().join('|') ===
      row.activeContractTalentIds.join('|'),
    )).toBe(true)

    const commonKeys = [
      'schemaVersion',
      'recordType',
      'mode',
      'experimentId',
      'seedSetId',
      'seed',
      'operatingPolicyId',
      'estatePolicyId',
      'foundingTermPolicyId',
      'continuationPolicyId',
      'horizonWeeks',
      'source',
      'initialSaveHash',
      'entryId',
      'entryWeek',
      'entrySaveHash',
      'entryStateHash',
      'week',
    ]
    expect(evidence.rows.length).toBe(
      1 + run.weekly.length + evidence.renewalIntents.length + run.boundaryCadence.length,
    )
    expect(
      evidence.rows.every((row) => commonKeys.every((key) => key in row)),
    ).toBe(true)
    expect(stableStringify(evidence)).not.toContain('undefined')
  })

  it('serializes weekly operations and keeps staffing distinct from affordability', () => {
    const evidence = serializeRosterWallPlayerPolicyEvidence(run, SOURCE)
    expect(evidence.weekly).toHaveLength(428)
    expect(
      evidence.weekly.every(
        (week) =>
          week.operations.activeContractTalentIds.length ===
            week.arrivalRoleCoverage.retainedOwners &&
          week.operations.readyPackageProxyCount ===
            week.operations.readyPackageProxyProjectIds.length &&
          week.scheduledPayroll === week.ledgerPayroll &&
          week.scheduledOverhead === week.ledgerOverhead &&
          week.theatricalReceiptReconciliation.delta === 0 &&
          week.theatricalReceiptReconciliation.scheduledTotal ===
            week.theatricalReceiptReconciliation.ledgerTotal &&
          week.theatricalReceiptReconciliation.ledgerRowCount ===
            week.theatricalReceiptRows.length &&
          week.packageStaffabilityBlockers.every(
            (intent) => intent.action === null && !intent.accepted,
          ) &&
          week.packageAffordabilityBlockers.every(
            (intent) => intent.action !== null && !intent.accepted,
          ),
      ),
    ).toBe(true)
    expect(
      evidence.weekly.every((week) =>
        week.packageStaffabilityBlockers.every(
          (staffing) =>
            !week.packageAffordabilityBlockers.some(
              (affordability) =>
                affordability.week === staffing.week &&
                affordability.ownerId === staffing.ownerId,
            ),
        ),
      ),
    ).toBe(true)
    expect(evidence.weekly[195]).toMatchObject({
      week: 195,
      arrivalWeek: 196,
      arrivalStateHash: run.entry.stateHash,
    })
    expect(evidence.weekly[195]!.operations).toMatchObject({
      construction: run.entry.save.state.construction,
      operationsFacilities: run.entry.save.state.operations.facilities,
      freeAgentIdsInStateOrder: run.entry.save.state.freeAgents,
    })
  })

  it('records current retry-all cadence, moved expiries, recurrences, and exact bonuses', () => {
    const intents = run.weekly.flatMap((week) => week.renewalIntents)
    expect(intents.length).toBeGreaterThan(0)
    expect(intents.every((intent) => intent.selectedTerm === 208)).toBe(true)
    expect(intents.every((intent) => intent.rngBefore === intent.rngAfter)).toBe(true)
    expect(run.summary.acceptedRenewals).toBe(
      intents.filter((intent) => intent.accepted).length,
    )
    expect(run.summary.retryAttempts).toBe(
      intents.filter((intent) => !intent.accepted).length,
    )
    expect(run.summary.totalSigningBonusPaid).toBe(
      intents
        .filter((intent) => intent.accepted)
        .reduce((total, intent) => total + intent.offer.signingBonus, 0),
    )
    expect(run.summary.movedExpiries).toBe(run.expiryMoves.length)
    expect(run.expiryMoves.every((move) => move.nextTermWeeks === 208)).toBe(true)
    expect(run.boundaryCadence.some((row) => row.relation === 'window-arrival')).toBe(true)
    expect(run.boundaryCadence.some((row) => row.relation === 'recurrence-window')).toBe(true)
    expect(run.ownerCadence.every((owner) => owner.expirySequence.length >= 1)).toBe(true)
    expect(run.ownerCadence.some((owner) => owner.expirySequence.length >= 2)).toBe(true)
    expect(run.summary.totalSigningBonusObligation).toBeGreaterThan(0)
    expect(run.summary.totalTheatricalReceipts).toBeGreaterThan(0)
    expect(run.summary.existingRunTheatricalReceipts).toBeGreaterThan(0)
    expect(run.summary.openingRunTheatricalReceipts).toBeGreaterThan(0)
    expect(
      run.summary.existingRunTheatricalReceipts +
        run.summary.openingRunTheatricalReceipts,
    ).toBeCloseTo(run.summary.totalTheatricalReceipts, 8)
    expect(run.summary.totalTheatricalReceipts).toBe(
      run.weekly.reduce(
        (total, week) => total + week.theatricalReceiptReconciliation.ledgerTotal,
        0,
      ),
    )
    expect(run.summary.receiptReconciliationFailures).toBe(0)
    expect(run.summary.uniqueOwnersDue).toBe(run.foundingCohort.length)
    const accepted = intents.filter((intent) => intent.accepted)
    expect(run.summary.uniqueAcceptedContractOwners).toBe(
      new Set(accepted.map((intent) => intent.contractKey)).size,
    )
    expect(run.summary.uniqueAcceptedTalents).toBe(
      new Set(accepted.map((intent) => intent.talentId)).size,
    )
    const rejected = intents.filter((intent) => !intent.accepted)
    expect(run.summary.uniqueRejectedOwners).toBe(
      new Set(rejected.map((intent) => intent.contractKey)).size,
    )
    expect(run.summary.uniqueRejectedTalents).toBe(
      new Set(rejected.map((intent) => intent.talentId)).size,
    )
  })

  it('serializes complete canonical boundary accounting and pipeline facts', () => {
    const evidence = serializeRosterWallPlayerPolicyEvidence(run, SOURCE)
    const foundingIds = new Set(run.foundingCohort.map((founder) => founder.talentId))
    const relations = new Set([
      'window-arrival',
      'expiry-arrival',
      'recurrence-window',
      'recurrence-post-expiry',
    ])

    expect(evidence.boundaries.length).toBeGreaterThan(0)
    for (const boundary of evidence.boundaries) {
      expect(relations.has(boundary.relation)).toBe(true)
      expect(boundary.cash.exact).toBe(true)
      expect(boundary.cohortRetainedTalentIds.length + boundary.cohortReleasedTalentIds.length).toBe(
        foundingIds.size,
      )
      expect(
        [...boundary.cohortRetainedTalentIds, ...boundary.cohortReleasedTalentIds].sort(),
      ).toEqual([...foundingIds].sort())
      expect(boundary.cohortRoleCoverage.retainedOwners).toBe(
        boundary.cohortRetainedTalentIds.length,
      )
      expect(boundary.missingFoundingRoles).toEqual(
        boundary.cohortRoleCoverage.missingRoles,
      )
      expect(boundary.activeTheatricalReceipts).toBeGreaterThanOrEqual(0)
      expect(boundary.expectedWeeklyRunRevenue).toBeGreaterThanOrEqual(0)
      expect(boundary.activeProductions).toBeGreaterThanOrEqual(0)
      expect(boundary.screenplayProjects).toBeGreaterThanOrEqual(0)
      expect(boundary.castingSessions).toBeGreaterThanOrEqual(0)
      expect(boundary.readyScreenplays).toBeGreaterThanOrEqual(
        boundary.packageReadyScreenplays,
      )
      expect(boundary.packageStaffabilityBlockers).toBeGreaterThanOrEqual(0)
      expect(boundary.packageAffordabilityBlockers).toBeGreaterThanOrEqual(0)

      if (boundary.relation === 'window-arrival' || boundary.relation === 'recurrence-window') {
        expect(boundary.payrollDelta).toBeNull()
        expect(boundary.baseOverheadDelta).toBeNull()
        expect(boundary.employeeOverheadDelta).toBeNull()
        expect(boundary.overheadDelta).toBeNull()
        expect(boundary.transitionLedgerRows).toEqual([])
        expect(boundary.talentIds.every((talentId) =>
          boundary.cohortRetainedTalentIds.includes(talentId),
        )).toBe(true)
      } else {
        expect(boundary.payrollDelta).not.toBeNull()
        expect(boundary.baseOverheadDelta).not.toBeNull()
        expect(boundary.employeeOverheadDelta).not.toBeNull()
        expect(boundary.overheadDelta).not.toBeNull()
        const transition = run.weekly.find((week) => week.arrivalWeek === boundary.week)
        expect(transition).toBeDefined()
        expect(boundary.transitionLedgerRows).toEqual(transition!.appendedLedger)
        expect(boundary.talentIds.every((talentId) =>
          boundary.cohortReleasedTalentIds.includes(talentId),
        )).toBe(true)
      }
    }
  })

  it('counts rejected owners by expiring-contract key without collapsing recurrence', () => {
    expect(
      summarizePlayerPolicyRejectedOwners([
        { accepted: false, contractKey: 't-act-00:0:52', talentId: 't-act-00' },
        { accepted: false, contractKey: 't-act-00:52:260', talentId: 't-act-00' },
        { accepted: false, contractKey: 't-act-00:52:260', talentId: 't-act-00' },
        { accepted: true, contractKey: 't-dir-00:0:104', talentId: 't-dir-00' },
      ]),
    ).toEqual({ uniqueRejectedOwners: 2, uniqueRejectedTalents: 1 })
  })

  it('reconciles every cash/checkpoint boundary and proves observer neutrality', () => {
    expect(run.weekly.every((week) => week.startCash.exact && week.arrivalCash.exact)).toBe(
      true,
    )
    expect(run.boundaryCadence.every((boundary) => boundary.cash.exact)).toBe(true)
    expect(run.summary.finalCash.exact).toBe(true)
    expect(reconcilePlayerPolicyCash(run.entry.save.state)).toEqual(run.entry.cash)
    expect(run.observerNeutrality).toMatchObject({
      entryByteIdentical: true,
      entryStateHashIdentical: true,
      finalByteIdentical: true,
      finalStateHashIdentical: true,
      finalRngStateIdentical: true,
    })
    expect(stableStringify(run)).not.toContain('undefined')
  })

  it('replays deterministically from the same seed and policy', () => {
    const replay = runRosterWallPlayerPolicy({
      seed: 'roster-wall-player-policy-smoke',
      operatingPolicyId: 'development-casting',
    })
    expect(stableStringify(replay)).toBe(stableStringify(run))
  })

  it('guards the governed 25-seed corpus matrix before execution', () => {
    expect(() => runRosterWallPlayerPolicyCorpus(['too-small'])).toThrow(/exactly 25 seeds/)
    expect(() =>
      runRosterWallPlayerPolicyCorpus(Array.from({ length: 25 }, () => 'duplicate')),
    ).toThrow(/unique/)
    expect(() =>
      runRosterWallPlayerPolicyCorpus(
        Array.from({ length: 25 }, (_, index) => `wrong-${String(index)}`),
      ),
    ).toThrow(/canonical/)
    expect(validateRosterWallPlayerPolicyCorpusSeeds(ROSTER_WALL_CANONICAL_SEEDS)).toEqual(
      ROSTER_WALL_CANONICAL_SEEDS,
    )
  })

  it.each(['direct-package', 'scaled-two-team'] as const)(
    'completes the other governed operating policy — %s',
    (operatingPolicyId) => {
      const policyRun = runRosterWallPlayerPolicy({
        seed: `roster-wall-player-policy-${operatingPolicyId}`,
        operatingPolicyId,
      })
      expect(policyRun.entry.week).toBe(196)
      expect(policyRun.weekly).toHaveLength(428)
      expect(policyRun.summary.finalCash.exact).toBe(true)
      expect(policyRun.observerNeutrality.finalByteIdentical).toBe(true)
    },
  )
})
