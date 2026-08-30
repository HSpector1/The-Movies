// ── P05A W2 CORRECTION SUITE — invariants the range review proved unproven ────
//
// The W2 range review (REJECT, F4) mutation-tested the closed projection and
// found five enforced-but-unproven laws: each of the mutations below survived
// every committed test. This suite exists to KILL them — every test here fails
// against the specific mutation named in its comment and passes against the
// real code. Perturbations are built on structuredClone'd walk states so no
// shared fixture is ever aliased into the adapter's WeakMap-keyed facts.
//
// It also pins the F3 correction: player-facing blocker copy speaks the
// engine's display vocabulary, never a raw enum identifier.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../../../../src/core/index.ts'
import type { GameState } from '../../../../src/core/index.ts'
import { studioLotSnapshot } from '../../engine/adapter.ts'
import {
  facilityBuildingIdOf,
  liveStageOf,
} from '../../engine/productionOperationsProjection.ts'
import type {
  LotProductionTarget,
  LotStageProductionState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from '../../lot/snapshot/StudioLotSnapshot.ts'
import { contendedStudio, freePackage } from '../../../../tests/_m4Fixtures.ts'
import { advance } from '../../../../tests/contracts/_contractFixtures.ts'

type ManagedSnapshot = StudioLotSnapshot & {
  productionOperations: NonNullable<StudioLotSnapshot['productionOperations']>
  stageProductions: NonNullable<StudioLotSnapshot['stageProductions']>
}

function managedSnapshot(state: GameState): ManagedSnapshot {
  const snapshot = studioLotSnapshot(state)
  expect(snapshot.operationsMode).toBe('managed')
  expect(Array.isArray(snapshot.productionOperations)).toBe(true)
  expect(Array.isArray(snapshot.stageProductions)).toBe(true)
  return snapshot as ManagedSnapshot
}

function rowOf(snapshot: ManagedSnapshot, productionId: string): ProductionOperationsState {
  const row = snapshot.productionOperations.find(
    (candidate) => candidate.productionId === productionId,
  )
  expect(row, `expected a closed row for ${productionId}`).toBeDefined()
  return row!
}

/** Three active productions — the exact regime where the W2 sort is the ONLY sort. */
function threeProductionState(seed: string): GameState {
  const { state, readyProjectIds } = contendedStudio(seed)
  let next = advance(state, 3)
  next = applyActions(next, [
    { kind: 'greenlightScriptProject', production: freePackage(next, readyProjectIds[0]!) },
  ])
  expect(next.studio.activeProductions.length).toBeGreaterThanOrEqual(3)
  return next
}

/** The two rehearsal leaders and their distinct stages, from a 3-week walk. */
function twoStageHolders(seed: string): {
  state: GameState
  holderA: string
  stageA: string
  holderB: string
  stageB: string
} {
  const { state } = contendedStudio(seed)
  const current = advance(state, 3)
  const holders: Array<{ productionId: string; stageFacilityId: string }> = []
  for (const workflow of current.operations.workflows) {
    const stage = workflow.reservations.find(
      (reservation) => reservation.capability === 'soundstage',
    )
    if (stage !== undefined) {
      holders.push({ productionId: workflow.productionId, stageFacilityId: stage.facilityId })
    }
  }
  expect(holders.length, 'fixture requires two distinct stage holders').toBe(2)
  expect(holders[0]!.stageFacilityId).not.toBe(holders[1]!.stageFacilityId)
  return {
    state: current,
    holderA: holders[0]!.productionId,
    stageA: holders[0]!.stageFacilityId,
    holderB: holders[1]!.productionId,
    stageB: holders[1]!.stageFacilityId,
  }
}

function workflowIn(state: GameState, productionId: string) {
  const workflow = state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )
  expect(workflow, `expected a workflow for ${productionId}`).toBeDefined()
  return workflow!
}

describe('P05A W2 correction — mutation-killing invariants (review F4)', () => {
  // KILLS: removing the W2 ascending sort (adapter). With ≥3 productions the
  // pre-existing P04A company projection is null and its sort never runs, so
  // the W2 sort is the only order authority — exactly the regime no committed
  // test exercised.
  it('keeps ≥3 closed rows ascending when the active array is reversed', () => {
    const base = threeProductionState('w2-kill-order')
    const reversed = structuredClone(base)
    reversed.studio.activeProductions.reverse()
    const snapshot = managedSnapshot(reversed)
    const ids = snapshot.productionOperations.map((row) => row.productionId)
    expect(ids.length).toBeGreaterThanOrEqual(3)
    expect(ids).toEqual([...ids].sort())
  })

  // KILLS: replacing duplicate-holder withholding with last-writer-wins.
  // The collision is built ENGINE-LAWFULLY — a capacity-2 stage with both
  // companies' reservations, bindings, and mounted sets agreeing — so it
  // travels the full snapshot path. This is precisely the future the law
  // exists for: today's stages are capacity 1, so the one-holder rule can
  // never over-withhold, but a bigger stage must withhold rather than guess.
  it('withholds a stage claimed by two holders and corrupts no other row', () => {
    const { state, holderA, stageA, holderB, stageB } = twoStageHolders('w2-kill-dup-holder')
    const collided = structuredClone(state)
    for (const facility of collided.operations.facilities) {
      if (facility.id === stageA) facility.capacity = 2
    }
    const intruder = workflowIn(collided, holderB)
    for (const reservation of intruder.reservations) {
      if (reservation.capability === 'soundstage') {
        reservation.facilityId = stageA
        reservation.slot = 1
      }
    }
    if (intruder.bindings.requiresSetBinding !== false) {
      intruder.bindings.stageFacilityId = stageA
    }
    const intruderSet = collided.sets.find(
      (candidate) => candidate.id === intruder.bindings.setId,
    )
    if (intruderSet !== undefined) intruderSet.mountedOn = stageA
    const snapshot = managedSnapshot(collided)
    const contested = snapshot.stageProductions.find(
      (stage: LotStageProductionState) => stage.stageFacilityId === stageA,
    )!
    expect(contested.presentationState).toBe('withheld')
    expect(contested.holderProductionId).toBeNull()
    expect(contested.holderTitle).toBeNull()
    expect(contested.holderCopy).toBeNull()
    // Never a guess for EITHER claimant — and the vacated stage is not withheld.
    const vacated = snapshot.stageProductions.find(
      (stage: LotStageProductionState) => stage.stageFacilityId === stageB,
    )!
    expect(vacated.holderProductionId).toBeNull()
    expect(vacated.presentationState).not.toBe('withheld')
    expect(rowOf(snapshot, holderA)).toBeDefined()
    expect(rowOf(snapshot, holderB)).toBeDefined()
  })

  // KILLS: removing liveStageOf's >1-stage withhold. The engine's own
  // invariant sweep ("wrong current-phase reservation set") forbids this
  // state on every composition path, so the guard is provable only as the
  // exported unit law it is: contradictory stage truth withholds, never picks.
  it('withholds the live stage when a workflow holds two soundstage reservations', () => {
    const { state, holderA, stageA, stageB } = twoStageHolders('w2-kill-two-stages')
    const workflow = structuredClone(workflowIn(state, holderA))
    expect(liveStageOf(workflow)).toEqual(
      expect.objectContaining({ stageFacilityId: stageA }),
    )
    const stageReservation = workflow.reservations.find(
      (reservation) => reservation.capability === 'soundstage',
    )!
    workflow.reservations.push({ ...structuredClone(stageReservation), facilityId: stageB })
    expect(liveStageOf(workflow)).toBe('withheld')
  })

  // KILLS: removing liveStageOf's reservation/binding-disagreement withhold.
  // Same engine invariant ("bindings.stageFacilityId disagrees with its
  // soundstage reservation") forbids the state upstream; direct unit law.
  it('withholds the live stage when the binding names a different stage than the reservation', () => {
    const { state, holderA, stageB } = twoStageHolders('w2-kill-binding-disagreement')
    const workflow = structuredClone(workflowIn(state, holderA))
    expect(workflow.bindings.requiresSetBinding).not.toBe(false)
    workflow.bindings.stageFacilityId = stageB
    expect(liveStageOf(workflow)).toBe('withheld')
  })

  // KILLS: removing the mounted-set agreement guard — a bound set that does
  // not actually stand on this stage must never populate the current Set.
  it('nulls the current Set when the bound set is mounted on a different stage', () => {
    const { state, holderA, stageA, stageB } = twoStageHolders('w2-kill-mounted-set')
    const baseline = managedSnapshot(structuredClone(state))
    expect(rowOf(baseline, holderA).currentSetId).not.toBeNull()

    const moved = structuredClone(state)
    const boundSetId = workflowIn(moved, holderA).bindings.setId
    expect(boundSetId).toBeTruthy()
    const set = moved.sets.find((candidate) => candidate.id === boundSetId)!
    set.mountedOn = stageB
    const snapshot = managedSnapshot(moved)
    const row = rowOf(snapshot, holderA)
    expect(row.stageFacilityId).toBe(stageA)
    expect(row.currentSetId).toBeNull()
    const stageRow = snapshot.stageProductions.find(
      (stage: LotStageProductionState) => stage.stageFacilityId === stageA,
    )!
    expect(stageRow.currentSetId).toBeNull()
  })

  // KILLS: making facilityBuildingIdOf guess structures[0] on an ambiguous
  // body (two structures both claiming to house one facility → null, never a
  // guess; recon §6.1's "never fall back to the first array member"). The
  // engine's own placement invariant ('facility ... is provided by both')
  // rejects this state on every composition path — composeClosedProduction's
  // first act is studioQueueView, which asserts it — so the guard is provable
  // only as the exported unit law it is.
  it('resolves no building for a facility housed by two structures', () => {
    const base = threeProductionState('w2-kill-ambiguous-body')
    const trailer =
      base.studio.activeProductions[base.studio.activeProductions.length - 1]!.id
    const baselineRow = rowOf(managedSnapshot(structuredClone(base)), trailer)
    const ownedWithBody = (baselineRow.ownedWorksites ?? []).filter(
      (candidate: LotProductionTarget) =>
        candidate.capability !== 'soundstage' && candidate.buildingId !== null,
    )
    expect(ownedWithBody.length, 'fixture requires a housed non-stage worksite').toBeGreaterThan(0)
    const victim = ownedWithBody[0]!

    const ambiguous = structuredClone(base)
    const housing = ambiguous.property.structures.find(
      (structure) =>
        Array.isArray(structure.providesFacilityIds) &&
        structure.providesFacilityIds.includes(victim.resourceId),
    )
    expect(housing, 'fixture requires the worksite to be structure-housed').toBeDefined()
    // Unambiguous baseline: the direct call resolves the housed body exactly.
    expect(facilityBuildingIdOf(ambiguous, victim.resourceId!)).toBe(victim.buildingId!)
    const twin = structuredClone(housing!)
    twin.id = `${housing!.id}-twin`
    // Shifted so the twin overlaps nothing: the contradiction under test is
    // two structures PROVIDING one facility, not two structures on one spot.
    twin.origin = { gx: 23, gy: 23 }
    ambiguous.property.structures.push(twin)
    expect(facilityBuildingIdOf(ambiguous, victim.resourceId!)).toBeNull()
  })
})

describe('P05A W2 correction — no raw enum identifier in player copy (review F3)', () => {
  const RAW_IDENTIFIER =
    /\b(preProduction|postProduction|releaseReady|development-casting|set-scenery)\b/

  function copyOf(row: ProductionOperationsState): string[] {
    const lines: string[] = [row.stateLabel ?? '', row.nextMilestone ?? '']
    const anatomy = row.blockerAnatomy
    if (anatomy != null) {
      lines.push(anatomy.headline, anatomy.detail, anatomy.consequence)
      for (const remedy of anatomy.remedies) lines.push(remedy.label)
    }
    for (const target of [
      ...(row.ownedWorksites ?? []),
      ...(row.relatedTargets ?? []),
      ...(row.locateTargets ?? []),
      ...(row.primaryWorkTarget == null ? [] : [row.primaryWorkTarget]),
    ]) {
      lines.push(target.label)
      if (target.reason !== null) lines.push(target.reason)
    }
    return lines
  }

  it('speaks the display vocabulary in the capacity cause line, exactly', () => {
    // Reach a wrapped-waiting-for-post picture the same way the sealed W2
    // walk does: one Post slot, three pictures, drive to the first wrap.
    const { state, readyProjectIds } = contendedStudio('w2-kill-enum-leak')
    let next = structuredClone(state)
    for (const facility of next.operations.facilities) {
      if (facility.id === 'facility-post-building') facility.capacity = 1
    }
    next = advance(next, 3)
    next = applyActions(next, [
      { kind: 'greenlightScriptProject', production: freePackage(next, readyProjectIds[0]!) },
    ])
    let capacityRow: ProductionOperationsState | null = null
    for (let week = 0; week < 16 && capacityRow === null; week++) {
      for (const workflow of next.operations.workflows) {
        if (workflow.phase !== 'shooting' || workflow.shootingTask === null) continue
        const production = next.studio.activeProductions.find(
          (candidate) => candidate.id === workflow.productionId,
        )!
        if (workflow.shootingTask.status === 'unassigned') {
          next = applyActions(next, [
            {
              kind: 'assignShootingDirector',
              productionId: production.id,
              directorId: production.directorId,
            },
          ])
        }
        const settled = next.operations.workflows.find(
          (candidate) => candidate.productionId === production.id,
        )
        if (settled?.shootingTask?.status === 'ready') {
          next = applyActions(next, [
            { kind: 'scheduleShootingTake', productionId: production.id },
          ])
        }
      }
      next = advance(next, 1)
      const snapshot = managedSnapshot(next)
      capacityRow =
        snapshot.productionOperations.find(
          (row) => row.operationalState === 'wrapped-waiting-for-post',
        ) ?? null
      if (capacityRow !== null) {
        expect(capacityRow.blockerAnatomy).not.toBeNull()
        expect(capacityRow.blockerAnatomy!.detail).toBe(
          'No Post Building slot was available for the transition to Post-production.',
        )
        for (const row of snapshot.productionOperations) {
          for (const line of copyOf(row)) {
            expect(line).not.toMatch(RAW_IDENTIFIER)
            expect(line).not.toMatch(/%/)
          }
        }
        if (snapshot.stageProductions !== undefined) {
          for (const stage of snapshot.stageProductions) {
            if (stage.holderCopy !== null) {
              expect(stage.holderCopy).not.toMatch(RAW_IDENTIFIER)
            }
          }
        }
      }
    }
    expect(capacityRow, 'walk never reached wrapped-waiting-for-post').not.toBeNull()
  })
})
