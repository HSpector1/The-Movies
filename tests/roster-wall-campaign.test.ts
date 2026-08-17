import { describe, expect, it } from 'vitest'
import {
  ANNEX_FACILITY_ID,
  ANNEX_PROJECT_ID,
  exportSave,
  importSave,
  stableStringify,
} from '../src/core/index.js'
import { runFacilitiesArm } from '../src/harness/facilities/index.js'
import {
  ROSTER_WALL_OPERATING_POLICY_IDS,
  compareRosterWallWithFacilitiesVacantW196,
  foundRosterWallStudio,
  runRosterWallEntryCampaign,
  runRosterWallNeutralEntryCampaign,
  verifyRosterWallEntryObserverNeutrality,
} from '../src/harness/roster-wall/campaign.js'

const SOURCE = {
  sourceCommit: 'roster-wall-stage-1-test',
  sourceTree: 'roster-wall-stage-1-test-tree',
  worktreeDirty: false,
  runtime: 'vitest',
} as const

describe('Week-208 roster-wall campaign entry harvest', () => {
  for (const operatingPolicyId of ROSTER_WALL_OPERATING_POLICY_IDS) {
    it(`mechanically matches frozen facilities behavior through vacant Week 196 — ${operatingPolicyId}`, () => {
      const seed = `roster-wall-parity-${operatingPolicyId}`
      const harvest = runRosterWallEntryCampaign({
        seed,
        operatingPolicyId,
        estatePolicyId: 'vacant',
      })
      const facilities = runFacilitiesArm({
        seed,
        policyId: operatingPolicyId,
        mode: 'current',
        horizonWeeks: 196,
        source: SOURCE,
      })
      const comparison = compareRosterWallWithFacilitiesVacantW196(harvest, facilities)

      expect(comparison.byteIdentical).toBe(true)
      expect(comparison.rosterWallProjectionHash).toBe(comparison.facilitiesProjectionHash)
      expect(harvest.parity.weekly).toHaveLength(197)
      expect(harvest.parity.intents.some((intent) => intent.action?.kind === 'renewContract')).toBe(
        false,
      )
    })
  }

  it('captures pure 52/26/12-week timing shadows and exact SaveFileV13 replay', () => {
    const harvest = runRosterWallEntryCampaign({
      seed: 'roster-wall-entry-replay',
      operatingPolicyId: 'development-casting',
      estatePolicyId: 'vacant',
    })

    expect(harvest.entryWeek).toBe(196)
    expect(harvest.entrySave.saveVersion).toBe(13)
    expect(exportSave(importSave(harvest.entrySaveBytes))).toBe(harvest.entrySaveBytes)
    expect(harvest.replay).toEqual({
      importedSaveVersion: 12,
      importedReexportByteIdentical: true,
      remadeReexportByteIdentical: true,
    })
    expect(harvest.cohort.length).toBeGreaterThan(0)
    expect(harvest.cohort.every((member) => member.weeklySalary > 0)).toBe(true)
    expect(
      harvest.cohort.every(
        (member) =>
          member.startWeek === 0 &&
          member.endWeekExclusive === 208 &&
          member.termWeeks === 208,
      ),
    ).toBe(true)
    expect(harvest.shadows.map((shadow) => shadow.week)).toEqual([156, 182, 196])
    expect(harvest.shadows.map((shadow) => shadow.actionLegal)).toEqual([false, false, true])
    expect(
      harvest.shadows.every(
        (shadow) =>
          shadow.noActionStateHashBefore === shadow.noActionStateHashAfter &&
          shadow.rngBefore === shadow.rngAfter &&
          !shadow.observationConsumedRng,
      ),
    ).toBe(true)
    expect(harvest.shadows[2]!.owners.every((owner) => owner.renewalWindowOpen)).toBe(true)
    expect(
      harvest.shadows.every((shadow) =>
        shadow.owners.every(
          (owner) =>
            owner.earliestLaterLegalFeasibleWeek === null ||
            (owner.earliestLaterLegalFeasibleWeek >= 196 &&
              owner.earliestLaterLegalFeasibleWeek <= 207),
        ),
      ),
    ).toBe(true)
    const windowEve = harvest.preEntryWindowEve
    expect(windowEve.relation).toBe('window-eve')
    expect(windowEve.before.week).toBe(195)
    expect(windowEve.after.week).toBe(196)
    expect(windowEve.after.stateHash).toBe(harvest.entryStateHash)
    expect(windowEve.after.rngState).toBe(harvest.entryRngState)
    expect(windowEve.after.cashReconciliation.actualCash).toBe(
      harvest.entrySave.state.studio.cash,
    )
    expect(windowEve.after.cashReconciliation.delta).toBe(0)
    expect(windowEve.operatingIntents.some((intent) => intent.action?.kind === 'renewContract')).toBe(
      false,
    )
    expect(windowEve.transitionLedgerRows).toEqual(
      harvest.entrySave.state.ledger.slice(windowEve.before.cashReconciliation.ledgerLength),
    )
    expect(windowEve.before.cohortRetainedTalentIds).toEqual(
      harvest.cohort.map((member) => member.talentId).sort(),
    )
  })

  it('folds pre-entry cash in ledger order without a floating-point residual', () => {
    const harvest = runRosterWallEntryCampaign({
      seed: 'facilities-0001',
      operatingPolicyId: 'scaled-two-team',
      estatePolicyId: 'vacant',
    })

    expect(harvest.preEntryWindowEve.before.cashReconciliation.delta).toBe(0)
    expect(harvest.preEntryWindowEve.after.cashReconciliation.delta).toBe(0)
  })

  it('starts the real Annex only through its Week-0 public action and preserves its lifecycle', () => {
    const harvest = runRosterWallEntryCampaign({
      seed: 'roster-wall-real-annex-estate',
      operatingPolicyId: 'scaled-two-team',
      estatePolicyId: 'annex-start-week-0',
    })
    const state = harvest.entrySave.state

    // Placement Core V12: the Annex is a placed facility on the legacy parcel,
    // still carrying the canonical project id, still operational at Week 13.
    expect(state.placement.facilities).toContainEqual(
      expect.objectContaining({
        projectId: ANNEX_PROJECT_ID,
        facilityId: ANNEX_FACILITY_ID,
        parcelId: 'expansion',
        status: 'operational',
        placedWeek: 0,
        completesWeek: 13,
      }),
    )
    expect(state.construction.projects).toEqual([])
    expect(state.operations.facilities).toContainEqual(
      expect.objectContaining({ id: ANNEX_FACILITY_ID, capability: 'development-casting' }),
    )
    expect(
      state.ledger.filter(
        (entry) =>
          entry.kind === 'constructionCapex' &&
          entry.constructionProjectId === ANNEX_PROJECT_ID,
      ),
    ).toHaveLength(1)
  })

  it('is byte-neutral with timing, intent, and weekly observation disabled', () => {
    const result = verifyRosterWallEntryObserverNeutrality({
      seed: 'roster-wall-observer-neutrality',
      operatingPolicyId: 'direct-package',
      estatePolicyId: 'vacant',
    })

    expect(result.byteIdentical).toBe(true)
    expect(result.observedStateHash).toBe(result.observerDisabledStateHash)
    expect(result.observedEntrySaveHash).toBe(result.observerDisabledEntrySaveHash)
    expect(result.observedRngState).toBe(result.observerDisabledRngState)
    expect(stableStringify(result)).not.toContain('undefined')
  })

  it('returns only a byte-, state-, and RNG-neutral harvest from the accepted seam', () => {
    const result = runRosterWallNeutralEntryCampaign({
      seed: 'facilities-0001',
      operatingPolicyId: 'direct-package',
      estatePolicyId: 'vacant',
    })
    expect(result.observerNeutrality).toMatchObject({
      byteIdentical: true,
      stateHashIdentical: true,
      rngStateIdentical: true,
    })
    expect(result.observerNeutrality.observedEntrySaveHash).toBe(
      result.harvest.entrySaveHash,
    )
    expect(result.observerNeutrality.observedEntryStateHash).toBe(
      result.harvest.entryStateHash,
    )
  })

  it('assigns mixed founding terms round-robin in canonical talent-ID order', () => {
    const state = foundRosterWallStudio(
      'roster-wall-mixed-founding',
      'scaled-two-team',
      'round-robin-mixed',
    )
    const contracts = [...state.contracts].sort((a, b) => a.talentId.localeCompare(b.talentId))

    expect(contracts.map((contract) => contract.termWeeks)).toEqual(
      contracts.map((_contract, index) => [52, 104, 156, 208][index % 4]),
    )
    expect(contracts.map((contract) => contract.endWeekExclusive)).toEqual(
      contracts.map((_contract, index) => [52, 104, 156, 208][index % 4]),
    )
  })
})
