import { describe, expect, it } from 'vitest'
import { runRenewalDiagnosisCell } from '../economy-diagnosis/renewal.js'
import { runRosterWallEntryCampaign } from '../roster-wall/campaign.js'
import type { RosterWallSourceProvenance } from '../roster-wall/provenance.js'
import {
  RENEWAL_FRONTIER_TREATMENTS,
  buildRenewalFrontierCheckpoint,
  phaseOffsets,
  runRenewalFrontierArm,
  runRenewalFrontierCell,
} from './renewal.js'

const source: RosterWallSourceProvenance = {
  branch: 'codex/economy-intervention-frontier-03',
  commit: 'test',
  tree: 'test',
  worktreeDirty: false,
  runtime: 'vitest',
  saveVersion: 14,
  productionAuthorityCommit: 'test',
  productionAuthorityTree: 'test',
  authorityDiffPaths: [],
}

const seed = 'facilities-0002'
const policy = 'direct-package' as const

function treatment(id: string) {
  const result = RENEWAL_FRONTIER_TREATMENTS.find((candidate) => candidate.id === id)
  if (result === undefined) throw new Error(`missing renewal frontier treatment ${id}`)
  return result
}

describe('economy intervention frontier renewal timing lab', () => {
  it('uses exact zero-sum deterministic phase offsets', () => {
    const checkpoint = buildRenewalFrontierCheckpoint(seed, policy)
    const offsets = phaseOffsets(
      checkpoint.cohortContractKeys.map((key) => {
        const [talentId, startWeek, endWeekExclusive] = key.split(':')
        return {
          talentId: talentId!,
          startWeek: Number(startWeek),
          endWeekExclusive: Number(endWeekExclusive),
          annualSalary: 0,
          signingBonus: 0,
          termWeeks: 208,
        }
      }),
    )
    expect([...offsets.values()].reduce<number>((sum, value) => sum + value, 0)).toBe(0)
    expect(new Set(offsets.values())).toContain(-18)
    expect(new Set(offsets.values())).toContain(18)
  }, 60_000)

  it('matches the frozen W196 entry and D02 current outcome under sync W12 full-now', () => {
    const checkpoint = buildRenewalFrontierCheckpoint(seed, policy)
    const arm = runRenewalFrontierArm(checkpoint, treatment('sync-w12-full-now'))
    const harvest = runRosterWallEntryCampaign({
      seed,
      operatingPolicyId: policy,
      estatePolicyId: 'vacant',
    })
    const at196 = arm.milestones.find((milestone) => milestone.week === 196)
    expect(at196?.stateHash).toBe(harvest.entryStateHash)
    expect(at196?.rngState).toBe(harvest.entryRngState)
    const diagnosis = runRenewalDiagnosisCell(seed, policy, source)
    const at428 = arm.milestones.find((milestone) => milestone.week === 428)
    expect(at428?.stateHash).toBe(diagnosis.baseline428.finalStateHash)
    expect(at428?.rngState).toBe(diagnosis.baseline428.finalRngState)
    expect(arm.invariantFailures).toBe(0)
  }, 120_000)

  it('splits every quoted bonus exactly and preserves adapter reconciliation and RNG', () => {
    const checkpoint = buildRenewalFrontierCheckpoint(seed, policy)
    const arm = runRenewalFrontierArm(checkpoint, treatment('sync-w12-split-prior-expiry'))
    expect(arm.payments.length).toBeGreaterThan(0)
    for (const payment of arm.payments) {
      expect(payment.paidNow + payment.deferred).toBe(payment.quotedBonus)
    }
    expect(arm.invariants.cashReconciliationExact).toBe(true)
    expect(arm.invariants.adapterRngNeutral).toBe(true)
    expect(arm.invariants.splitPaymentsExactlyQuote).toBe(true)
    expect(arm.invariants.forcedPaymentsAtPriorExpiry).toBe(true)
  }, 120_000)

  it('reaches a recurrence horizon rather than stopping after the first expiry', () => {
    const cell = runRenewalFrontierCell(seed, policy)
    expect(cell.arms).toHaveLength(8)
    for (const arm of cell.arms) {
      expect(arm.milestones.some((milestone) => milestone.week === 442)).toBe(true)
      expect(arm.metrics.recurrenceAttempts).toBeGreaterThanOrEqual(0)
      expect(arm.metrics.retryAttempts).toBe(
        arm.metrics.cashPrecheckRejectionAttempts +
          arm.metrics.publicActionRejectionAttempts,
      )
      expect(arm.metrics.publicActionRejectionAttempts).toBe(
        arm.metrics.publicActionRenewalWindowRejections +
          arm.metrics.publicActionSolvencyRejections +
          arm.metrics.publicActionOtherRejections,
      )
      expect(arm.invariantFailures).toBe(0)
    }
  }, 120_000)

  it('keeps phased contracts internally valid and distinguishes Week 208 from cohort end', () => {
    const checkpoint = buildRenewalFrontierCheckpoint(seed, policy)
    const arm = runRenewalFrontierArm(checkpoint, treatment('phase-w26-full-now'))
    expect(arm.metrics.treatmentCohortEndWeek).toBeGreaterThan(208)
    expect(arm.invariants.phaseContractTermEndInvariantExact).toBe(true)
    for (const entry of arm.phaseJournal) {
      expect(entry.endWeekExclusive).toBe(entry.startWeek + entry.termWeeks)
      expect(entry.termWeeks - entry.priorTermWeeks).toBe(entry.offsetWeeks)
    }
    expect(arm.metrics.originalAcceptedOwners + arm.metrics.originalLostOwners).toBe(
      checkpoint.cohortContractKeys.length,
    )
  }, 120_000)
})
