import { describe, expect, it } from 'vitest'
import { generateWorld, stableStringify } from '../src/core/index.js'
import {
  createFacilitiesProductionHoldIntent,
  FACILITIES_OBSERVER_SCHEMA_VERSION,
  runFacilitiesArm,
  runFacilitiesCorpus,
  summarizeFacilitiesProductionHolds,
  verifyFacilitiesObserverNeutrality,
} from '../src/harness/facilities/index.js'
import type {
  FacilitiesHeldWorkflow,
  FacilitiesProductionHoldIntentBase,
} from '../src/harness/facilities/index.js'

const SOURCE = {
  sourceCommit: 'test-commit',
  sourceTree: 'test-tree',
  worktreeDirty: false,
  runtime: 'node test',
} as const

describe('Facilities & Construction research observatory', () => {
  it('is deterministic, ledger-reconciled, and samples exact Calendar slot-weeks', () => {
    const first = runFacilitiesArm({
      seed: 'facilities-observer-determinism',
      policyId: 'direct-package',
      mode: 'current',
      horizonWeeks: 16,
      source: SOURCE,
    })
    const second = runFacilitiesArm({
      seed: 'facilities-observer-determinism',
      policyId: 'direct-package',
      mode: 'current',
      horizonWeeks: 16,
      source: SOURCE,
    })

    expect(stableStringify(first)).toBe(stableStringify(second))
    expect(first.schemaVersion).toBe(FACILITIES_OBSERVER_SCHEMA_VERSION)
    expect(first.rows).toHaveLength(17)
    expect(first.summary.observedWeeks).toBe(16)
    expect(first.summary.arrivalWeekObserved).toBe(true)
    expect(first.summary.finalWeek).toBe(16)
    expect(first.summary.initialExpiryClusterWeek).toBe(208)
    expect(first.facilityManifest).toHaveLength(5)
    expect(
      first.rows.every((row) => Math.abs(row.cashReconciliationDelta) <= 1e-6),
    ).toBe(true)
    for (const metric of Object.values(first.summary.capability)) {
      expect(metric.occupiedSlotWeeks + metric.idleSlotWeeks).toBe(metric.capacitySlotWeeks)
    }
  })

  it('keeps every arm explicit and uses one-boundary shadows for current capacity rejections', () => {
    const current = runFacilitiesArm({
      seed: 'facilities-observer-shadow',
      policyId: 'development-casting',
      mode: 'current',
      horizonWeeks: 20,
      source: SOURCE,
    })
    const counterfactual = runFacilitiesArm({
      seed: 'facilities-observer-shadow',
      policyId: 'development-casting',
      mode: 'counterfactual',
      horizonWeeks: 20,
      source: SOURCE,
    })

    expect(current.rows.every((row) => row.mode === 'current')).toBe(true)
    expect(counterfactual.rows.every((row) => row.mode === 'counterfactual')).toBe(true)
    expect(counterfactual.facilityManifest).toHaveLength(6)
    expect(
      counterfactual.facilityManifest.find(
        (facility) => facility.id === 'research-development-casting-plus-one',
      ),
    ).toMatchObject({ capability: 'development-casting', capacity: 1 })
    expect(current.summary.capacityRejectedIntents).toBeGreaterThan(0)
    expect(current.shadows.length).toBeGreaterThan(0)
    expect(current.shadows.every((shadow) => shadow.mode === 'one-boundary-shadow')).toBe(true)
    expect(current.shadows.every((shadow) => !shadow.configurationConsumedRng)).toBe(true)
  })

  it('counts simultaneous production holds separately but charges studio exposure once', () => {
    const base: FacilitiesProductionHoldIntentBase = {
      schemaVersion: FACILITIES_OBSERVER_SCHEMA_VERSION,
      recordType: 'intent',
      mode: 'current',
      seed: 'facilities-simultaneous-hold-fixture',
      policyId: 'scaled-two-team',
      horizonWeeks: 20,
      week: 11,
      facilityManifestId: 'fixture-manifest',
      facilityManifest: [],
      initialSaveHash: 'fixture-save',
      ...SOURCE,
    }
    const heldWorkflow = (productionId: string): FacilitiesHeldWorkflow => ({
      productionId,
      phase: 'shooting',
      reservations: [
        {
          productionId,
          facilityId: 'fixture-soundstage',
          capability: 'soundstage',
          slot: 0,
          phase: 'shooting',
        },
        {
          productionId,
          facilityId: 'fixture-scenery',
          capability: 'set-scenery',
          slot: 0,
          phase: 'shooting',
        },
      ],
      shootingTask: {
        id: `fixture:${productionId}:take`,
        productionId,
        directorId: `fixture:${productionId}:director`,
        soundstageFacilityId: 'fixture-soundstage',
        status: 'completed',
      },
      blocker: {
        kind: 'facility-capacity',
        capability: 'post',
        targetPhase: 'postProduction',
      },
    })
    const hold = (productionId: string) =>
      createFacilitiesProductionHoldIntent({
        base,
        workflow: heldWorkflow(productionId),
        shadowId: `fixture:${productionId}:shadow`,
        delayExposure: {
          payroll: 125,
          overhead: 25,
          activeRunReceipts: 40,
          netCommittedBurn: 110,
        },
      })
    const intents = [hold('production-a'), hold('production-b')]

    expect(intents.map((intent) => intent.ownerId)).toEqual([
      'production-a',
      'production-b',
    ])
    expect(intents.map((intent) => intent.targetPhase)).toEqual([
      'postProduction',
      'postProduction',
    ])
    expect(summarizeFacilitiesProductionHolds(intents)).toEqual({
      productionHoldWeeks: 2,
      productionHoldWeeksByCapability: {
        'development-casting': 0,
        soundstage: 0,
        'set-scenery': 0,
        post: 2,
      },
      uniqueHeldStudioWeeks: 1,
      holdDelayExposure: {
        payroll: 125,
        overhead: 25,
        activeRunReceipts: 40,
        netCommittedBurn: 110,
      },
    })
  })

  it('emits canonical seed-major/policy-major pairs with frozen provenance boundaries', () => {
    const result = runFacilitiesCorpus({
      seeds: ['facilities-corpus-a', 'facilities-corpus-b'],
      policyIds: ['direct-package', 'scaled-two-team'],
      horizonWeeks: 8,
      source: SOURCE,
    })

    expect(result.runs.map((run) => [run.seed, run.policyId, run.mode])).toEqual([
      ['facilities-corpus-a', 'direct-package', 'current'],
      ['facilities-corpus-a', 'direct-package', 'counterfactual'],
      ['facilities-corpus-a', 'scaled-two-team', 'current'],
      ['facilities-corpus-a', 'scaled-two-team', 'counterfactual'],
      ['facilities-corpus-b', 'direct-package', 'current'],
      ['facilities-corpus-b', 'direct-package', 'counterfactual'],
      ['facilities-corpus-b', 'scaled-two-team', 'current'],
      ['facilities-corpus-b', 'scaled-two-team', 'counterfactual'],
    ])
    expect(result.provenance).toMatchObject({
      ...SOURCE,
      saveVersion: 10,
      horizonWeeks: 8,
      maxConcurrentProductions: 2,
      productionTicks: 8,
    })
    expect(result.aggregate).toMatchObject({ runCount: 8, pairCount: 4 })
    expect(
      result.pairs.every(
        (pair) => pair.delta.interpretation === 'descriptive-after-policy-feedback' && !pair.delta.causal,
      ),
    ).toBe(true)
    for (const policy of result.aggregate.policies) {
      expect(policy.descriptivePairDeltas.releases.pairCount).toBe(2)
      expect(
        policy.descriptivePairDeltas.releases.negativePairs +
          policy.descriptivePairDeltas.releases.zeroPairs +
          policy.descriptivePairDeltas.releases.positivePairs,
      ).toBe(2)
      expect(policy.descriptivePairDeltas.finalCash.interpretation).toBe(
        'descriptive-after-policy-feedback',
      )
    }
    expect(result.aggregate.boundaryStatement).toMatch(/research-only/i)
    expect(result.aggregate.boundaryStatement).toMatch(/D-17B residuals remain open/i)
  })

  it('reaches the Week-260 horizon and reports Week-208 staffing separately', () => {
    const result = runFacilitiesArm({
      seed: 'facilities-observer-week-260',
      policyId: 'direct-package',
      mode: 'current',
      horizonWeeks: 260,
      source: SOURCE,
    })

    expect(result.summary.finalWeek).toBe(260)
    expect(result.rows[208]?.week).toBe(208)
    expect(result.rows.at(-1)).toMatchObject({
      week: 260,
      sampleKind: 'horizon-arrival',
    })
    expect(result.summary.initialExpiryClusterWeek).toBe(208)
    expect(result.summary.renewalAttempts).toBeGreaterThan(0)
    expect(result.staffingRows.map((row) => row.boundary)).toEqual([
      'renewal-window-pre',
      'renewal-window-post',
      'expiry-pre-tick',
      'expiry-post-tick',
    ])
    expect(result.summary.staffingStratum.preExpiryWindow).toMatchObject({
      startWeek: 196,
      endWeekExclusive: 208,
      observedWeeks: 12,
    })
    expect(result.summary.staffingStratum.postExpiryWindow).toMatchObject({
      startWeek: 208,
      endWeekExclusive: 220,
      observedWeeks: 12,
    })
    expect(
      result.staffingRows.every((row) => row.sourceCommit === SOURCE.sourceCommit),
    ).toBe(true)
  })

  it('does not alter an ordinary engine replay through module-global state', () => {
    const before = stableStringify(generateWorld('facilities-observer-neutrality'))
    runFacilitiesArm({
      seed: 'facilities-observer-independent-run',
      policyId: 'scaled-two-team',
      mode: 'counterfactual',
      horizonWeeks: 12,
      source: SOURCE,
    })
    const after = stableStringify(generateWorld('facilities-observer-neutrality'))

    expect(after).toBe(before)
  })

  it('proves the same controller is byte-identical with evidence capture disabled', () => {
    const comparison = verifyFacilitiesObserverNeutrality({
      seed: 'facilities-observer-capture-neutrality',
      policyId: 'development-casting',
      mode: 'current',
      horizonWeeks: 20,
      source: SOURCE,
    })

    expect(comparison.byteIdentical).toBe(true)
    expect(comparison.observedStateHash).toBe(comparison.observerDisabledStateHash)
    expect(comparison.observedRngState).toBe(comparison.observerDisabledRngState)
  })

  it('uses the role-specific camera-test slate when packaging auditioned projects', () => {
    const result = runFacilitiesArm({
      seed: 'facilities-observer-audition-decision',
      policyId: 'development-casting',
      mode: 'current',
      horizonWeeks: 60,
      source: SOURCE,
    })
    const slates = new Map<string, Record<string, [string, string]>>()
    for (const intent of result.intents) {
      if (intent.intentKind !== 'casting-session' || !intent.accepted || intent.action === null) {
        continue
      }
      if (intent.action.kind !== 'startCastingSession') continue
      slates.set(intent.action.session.projectId, intent.action.session.slate)
    }
    const packages = result.intents.filter(
      (intent) => intent.intentKind === 'production-greenlight' && intent.accepted,
    )
    expect(packages.length).toBeGreaterThan(0)
    for (const intent of packages) {
      if (intent.action?.kind !== 'greenlightScriptProject') {
        throw new Error('expected managed greenlight action')
      }
      const slate = slates.get(intent.action.production.projectId)
      expect(slate).toBeDefined()
      for (const slot of ['lead', 'antagonist', 'support'] as const) {
        expect(slate![slot]).toContain(intent.action.production.cast[slot])
      }
    }
  })
})
