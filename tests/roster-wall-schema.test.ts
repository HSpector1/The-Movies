import { describe, expect, it } from 'vitest'
import {
  generateWorld,
  openTheatricalRun,
} from '../src/core/index.js'
import { runRosterWallEntryCampaign } from '../src/harness/roster-wall/campaign.js'
import {
  makeRosterWallEntryRecord,
  makeRosterWallShadowRecords,
  ROSTER_WALL_CANONICAL_SEEDS,
  rosterWallCashReconciliation,
  rosterWallCohortWeeklySalary,
  rosterWallEntryId,
  rosterWallTheatricalReceiptReconciliation,
} from '../src/harness/roster-wall/schema.js'
import type { RosterWallSourceProvenance } from '../src/harness/roster-wall/provenance.js'

const SOURCE: RosterWallSourceProvenance = {
  branch: 'operation-hollywood-autonomous-marathon',
  commit: 'schema-test-commit',
  tree: 'schema-test-tree',
  worktreeDirty: false,
  runtime: 'vitest',
  saveVersion: 17,
  productionAuthorityCommit: '8b7e95eb92f6f809522a595b4b458d4f19e26852',
  productionAuthorityTree: 'schema-test-authority-tree',
  authorityDiffPaths: ['src/harness/roster-wall/schema.ts'],
}

describe('Week-208 roster-wall evidence schema', () => {
  it('pins the canonical 25-seed identity in governed order', () => {
    expect(ROSTER_WALL_CANONICAL_SEEDS).toHaveLength(25)
    expect(ROSTER_WALL_CANONICAL_SEEDS[0]).toBe('facilities-0001')
    expect(ROSTER_WALL_CANONICAL_SEEDS.at(-1)).toBe('facilities-0025')
    expect(new Set(ROSTER_WALL_CANONICAL_SEEDS).size).toBe(25)
  })

  it('projects the exact V11 entry, accounting, dimensions and three warning shadows', () => {
    const harvest = runRosterWallEntryCampaign({
      seed: 'roster-wall-schema',
      operatingPolicyId: 'direct-package',
      estatePolicyId: 'vacant',
    })
    const entryId = rosterWallEntryId(harvest, 'all-208')
    const entry = makeRosterWallEntryRecord(harvest, SOURCE, 'all-208', 'current')

    expect(entry).toMatchObject({
      schemaVersion: 'roster-wall-observer-v1',
      recordType: 'entry',
      mode: 'current',
      experimentId: 'week-208-roster-wall-v1',
      seedSetId: 'canonical-facilities-25-v1',
      seed: 'roster-wall-schema',
      operatingPolicyId: 'direct-package',
      estatePolicyId: 'vacant',
      foundingTermPolicyId: 'all-208',
      continuationPolicyId: null,
      horizonWeeks: null,
      entryId,
      entryWeek: 196,
      week: 196,
      entryFileSha256: harvest.entrySaveHash,
      economyEngagedEver: true,
    })
    expect(entry.cashReconciliation.delta).toBe(0)
    expect(entry.cashReconciliation.actualCash).toBe(entry.cash)
    expect(entry.cohort).toHaveLength(harvest.cohort.length)
    expect(rosterWallCohortWeeklySalary(harvest)).toBeGreaterThan(0)

    const shadows = makeRosterWallShadowRecords(harvest, SOURCE, 'all-208', entryId)
    expect(shadows.map((row) => row.week)).toEqual([156, 182, 196])
    expect(shadows.every((row) => row.continuationPolicyId === null)).toBe(true)
    expect(shadows.every((row) => row.mode === 'reference-shadow')).toBe(true)
    expect(shadows.every((row) => row.warning.observationConsumedRng === false)).toBe(true)
  })

  it('rejects even a sub-cent cash mismatch instead of applying tolerance', () => {
    const harvest = runRosterWallEntryCampaign({
      seed: 'roster-wall-schema-exact-cash',
      operatingPolicyId: 'direct-package',
      estatePolicyId: 'vacant',
    })
    const state = structuredClone(harvest.entrySave.state)
    state.studio.cash += 0.0000005
    expect(() => rosterWallCashReconciliation(state)).toThrow(/cash reconciliation failed/)
  })

  it('reconciles existing and same-tick opening receipts in exact engine order', () => {
    const base = generateWorld('roster-wall-schema-receipts')
    const existing = openTheatricalRun(
      {
        productionId: 'existing-production',
        conceptId: 'existing-concept',
        releaseTick: 4,
        boxOffice: { opening: 1_000_000, total: 2_000_000 },
      } as never,
      1_000_000,
      2,
      4,
    )
    const opening = openTheatricalRun(
      {
        productionId: 'opening-production',
        conceptId: 'opening-concept',
        releaseTick: 8,
        boxOffice: { opening: 2_000_000, total: 4_000_000 },
      } as never,
      2_000_000,
      2,
      8,
    )
    const before = {
      ...base,
      market: { ...base.market, tick: 8 },
      economyEngagedEver: true,
      theatricalRuns: [existing],
    }
    const credit = (run: typeof existing) => ({
      ...run,
      weekIndex: run.weekIndex + 1,
      cumulativeGrossPaid: run.weeklyGross[run.weekIndex]!,
      cumulativeStudioRevenuePaid:
        run.weeklyGross[run.weekIndex]! * run.studioShare,
    })
    const after = {
      ...before,
      market: { ...before.market, tick: 9 },
      theatricalRuns: [credit(existing), credit(opening)],
    }
    const ledgerRows = [existing, opening].map((run) => ({
      week: 8,
      kind: 'studioRevenue' as const,
      amount: run.weeklyGross[run.weekIndex]! * run.studioShare,
      productionId: run.productionId,
      note: 'fixture receipt',
    }))

    expect(
      rosterWallTheatricalReceiptReconciliation(before, after, ledgerRows),
    ).toEqual({
      scheduledExistingReceipts: ledgerRows[0]!.amount,
      scheduledOpeningReceipts: ledgerRows[1]!.amount,
      scheduledTotal: ledgerRows[0]!.amount + ledgerRows[1]!.amount,
      ledgerTotal: ledgerRows[0]!.amount + ledgerRows[1]!.amount,
      ledgerRowCount: 2,
      delta: 0,
    })
    expect(() =>
      rosterWallTheatricalReceiptReconciliation(before, after, [
        ledgerRows[1]!,
        ledgerRows[0]!,
      ]),
    ).toThrow(/scheduled theatrical receipts disagree/)
    expect(() =>
      rosterWallTheatricalReceiptReconciliation(before, after, [
        ledgerRows[0]!,
        { ...ledgerRows[1]!, amount: ledgerRows[1]!.amount + 0.000001 },
      ]),
    ).toThrow(/scheduled theatrical receipts disagree/)
  })

  it('keeps Annex state descriptive and distinct in the entry ID', () => {
    const harvest = runRosterWallEntryCampaign({
      seed: 'roster-wall-schema-annex',
      operatingPolicyId: 'development-casting',
      estatePolicyId: 'annex-start-week-0',
    })
    const entry = makeRosterWallEntryRecord(harvest, SOURCE, 'all-208', 'current')

    expect(entry.entryId).toContain('annex-start-week-0')
    expect(entry.construction.projects).toEqual([])
    expect(entry.placement.facilities[0]?.status).toBe('operational')
    expect(
      entry.ledger.filter((ledger) => ledger.kind === 'constructionCapex'),
    ).toHaveLength(1)
  })
})
