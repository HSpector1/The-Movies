// ── P05A W2 CONTRACT SUITE — the CLOSED Production projection ────────────────
//
// Written from CODEX-P05A-IMPLEMENTATION-CHARTER.md@b1d506d WAVE 2 and the
// final reconnaissance §5.3–§5.5/§6.1, NOT from the implementation. Families
// proven here: all-active exact-ID rows in deterministic order; the closed
// operational states; worksite/Locate resolution; blocker anatomy; the
// Stage-local collection invariants (one holder per stage, withheld duplicate,
// current holder before Wrap history, explicit-grandfather null Set); presence
// joins by exact owner+facility; same-title isolation; wrap receipts.

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  applyActions,
  firstFilmJourney,
  loadSave,
  tick,
} from '../../../../src/core/index.ts'
import type { GameState, ProductionWorkflow } from '../../../../src/core/index.ts'
import { studioLotSnapshot } from '../../engine/adapter.ts'
import type {
  LotPresencePerson,
  LotProductionTarget,
  LotStageProductionState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from '../../lot/snapshot/StudioLotSnapshot.ts'
import { contendedStudio, freePackage } from '../../../../tests/_m4Fixtures.ts'
import { advance } from '../../../../tests/contracts/_contractFixtures.ts'

const POST_FACILITY = 'facility-post-building'

function withOnePostSlot(state: GameState): GameState {
  return {
    ...state,
    operations: {
      ...state.operations,
      facilities: state.operations.facilities.map((facility) =>
        facility.id === POST_FACILITY ? { ...facility, capacity: 1 } : facility,
      ),
    },
  }
}

function workflowOf(state: GameState, productionId: string): ProductionWorkflow {
  return state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )!
}

/** Issue whatever shooting commands the week is waiting on (house idiom, W1 form). */
function driveTakes(state: GameState): GameState {
  let next = state
  for (const workflow of state.operations.workflows) {
    if (workflow.phase !== 'shooting' || workflow.shootingTask === null) continue
    const production = state.studio.activeProductions.find(
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
  return next
}

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

function rowOf(snapshot: ManagedSnapshot, productionId: string) {
  const row = snapshot.productionOperations.find(
    (candidate: ProductionOperationsState) => candidate.productionId === productionId,
  )
  expect(row, `expected a closed row for ${productionId}`).toBeDefined()
  return row!
}

function stageRowOf(snapshot: ManagedSnapshot, stageFacilityId: string) {
  const row = snapshot.stageProductions.find(
    (candidate: LotStageProductionState) => candidate.stageFacilityId === stageFacilityId,
  )
  expect(row, `expected a stage row for ${stageFacilityId}`).toBeDefined()
  return row!
}

/** The full walk used across families: two leaders + a stage-waiting trailer. */
function walkToTheWrapWeek(seed: string): {
  before: GameState
  after: GameState
  leaders: readonly string[]
  trailer: string
} {
  const { state, readyProjectIds } = contendedStudio(seed)
  let next = withOnePostSlot(state)
  const leaders = next.studio.activeProductions.map((production) => production.id)
  next = advance(next, 3)
  next = applyActions(next, [
    { kind: 'greenlightScriptProject', production: freePackage(next, readyProjectIds[0]!) },
  ])
  const trailer = next.studio.activeProductions[next.studio.activeProductions.length - 1]!.id
  let before = next
  for (let week = 0; week < 12; week++) {
    const driven = driveTakes(before)
    const advanced = tick(driven)
    if (advanced.studioEvents.rows.some((row) => row.kind === 'wrapped')) {
      return { before: driven, after: advanced, leaders, trailer }
    }
    before = advanced
  }
  throw new Error('w2 fixture: no picture reached its wrap week')
}

describe('P05A W2 — all-active closed rows, deterministic order', () => {
  it('emits every closed field for every active production, ascending by exact id', () => {
    const { state } = contendedStudio('w2-rows-all-active')
    const snapshot = managedSnapshot(state)
    expect(snapshot.productionOperations.length).toBeGreaterThanOrEqual(2)
    const ids = snapshot.productionOperations.map((row: ProductionOperationsState) => row.productionId)
    expect(ids).toEqual([...ids].sort())
    for (const row of snapshot.productionOperations) {
      expect(typeof row.conceptId).toBe('string')
      expect(typeof row.operationalState).toBe('string')
      expect(typeof row.stateLabel).toBe('string')
      expect(typeof row.nextMilestone).toBe('string')
      expect(['exact', 'none', 'withheld']).toContain(row.worksiteResolution)
      expect(Array.isArray(row.ownedWorksites)).toBe(true)
      expect(Array.isArray(row.relatedTargets)).toBe(true)
      expect(Array.isArray(row.locateTargets)).toBe(true)
      // No generic percentage anywhere in the closed copy (charter law).
      expect(row.stateLabel).not.toMatch(/%/)
      expect(row.nextMilestone).not.toMatch(/%/)
    }
  })

  it('keeps rows ascending regardless of active-production array order', () => {
    const { state } = contendedStudio('w2-rows-order')
    const reversed: GameState = {
      ...state,
      studio: {
        ...state.studio,
        activeProductions: [...state.studio.activeProductions].reverse(),
      },
    }
    const ids = managedSnapshot(reversed).productionOperations.map((row: ProductionOperationsState) => row.productionId)
    expect(ids).toEqual([...ids].sort())
  })

  it('keeps same-title productions distinct by exact id', () => {
    const { state } = contendedStudio('w2-same-title')
    const [first, second] = state.studio.activeProductions
    expect(first && second).toBeTruthy()
    // Title collision by concept surgery: both concepts share one title.
    const firstTitle = state.concepts.find((concept) => concept.id === first!.conceptId)!.title
    const collided: GameState = {
      ...state,
      concepts: state.concepts.map((concept) =>
        concept.id === second!.conceptId ? { ...concept, title: firstTitle } : concept,
      ),
    }
    const snapshot = managedSnapshot(collided)
    const rows = snapshot.productionOperations.filter((row: ProductionOperationsState) => row.title === firstTitle)
    expect(rows.length).toBeGreaterThanOrEqual(2)
    expect(new Set(rows.map((row: ProductionOperationsState) => row.productionId)).size).toBe(rows.length)
    // Stage rows join by exact holder id, never by title.
    for (const stage of snapshot.stageProductions) {
      if (stage.holderProductionId === null) continue
      const holderRow = rowOf(snapshot, stage.holderProductionId)
      expect(stage.holderTitle).toBe(holderRow.title)
      expect(stage.stageFacilityId).toBe(holderRow.stageFacilityId)
    }
  })
})

describe('P05A W2 — closed operational states across the lifecycle', () => {
  it('walks one picture through the closed states without ever guessing', () => {
    const { state } = contendedStudio('w2-closed-walk')
    const productionId = state.studio.activeProductions[0]!.id
    let current = state

    const seen: string[] = []
    const stateOf = (candidate: GameState) =>
      rowOf(managedSnapshot(candidate), productionId).operationalState!
    for (let guard = 0; guard < 16; guard++) {
      const operationalState = stateOf(current)
      if (seen[seen.length - 1] !== operationalState) seen.push(operationalState)
      const workflow = workflowOf(current, productionId)
      if (workflow.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
        current = applyActions(current, [
          {
            kind: 'assignShootingDirector',
            productionId,
            directorId: current.studio.activeProductions.find((p) => p.id === productionId)!
              .directorId,
          },
        ])
        continue
      }
      if (workflow.phase === 'shooting' && workflow.shootingTask?.status === 'ready') {
        current = applyActions(current, [{ kind: 'scheduleShootingTake', productionId }])
        continue
      }
      if (workflow.phase === 'postProduction') break
      current = tick(current)
    }

    // The exact closed-state chain for the founding lot (due-at-call settles,
    // so no scenery state ever appears between the call and the take).
    expect(seen).toEqual([
      'development-working',
      'pre-production-working',
      'rehearsal-working',
      'director-required',
      'ready-to-schedule',
      'shooting-working',
      'post-handoff',
    ])
  })

  it('states resource-wait with holders and remedy routes when capacity refuses', () => {
    const { after, leaders } = walkToTheWrapWeek('w2-resource-wait')
    const waiting = leaders.find((id) => workflowOf(after, id).phase === 'shooting')!
    const snapshot = managedSnapshot(after)
    const row = rowOf(snapshot, waiting)
    expect(row.operationalState).toBe('wrapped-waiting-for-post')
    expect(row.stateLabel).toBe('Wrapped — waiting for Post')
    expect(row.worksiteResolution).toBe('none')
    expect(row.ownedWorksites).toEqual([])
    expect(row.blockerAnatomy?.kind).toBe('facility-capacity')
    expect(row.blockerAnatomy!.holders.length).toBeGreaterThanOrEqual(1)
    expect(row.blockerAnatomy!.consequence).toMatch(/payroll and studio overhead/)
    // The wrapped picture's own receipt stands beside, not instead of, truth.
    expect(row.wrapReceipt).not.toBeNull()
    expect(row.wrapReceipt!.currentWeek).toBe(true)
    expect(row.currentSetId).toBeNull()
    expect(row.stageFacilityId).toBeNull()
  })

  // ── P06C Priority Zero (§5): rail ↔ guidance-card state agreement ──────────
  // A wrapped picture keeps workflow.phase === 'shooting' until a Post slot frees
  // up. The rail reads that as 'wrapped-waiting-for-post' (POST · WAITING); the
  // guidance card (firstFilmJourney) must speak the SAME current truth for the
  // identical productionId, never the raw 'shooting' phase. This is the exact
  // contradiction P06C §5 names; the test pins cross-surface agreement so it can
  // never silently regress.
  it('the guidance card agrees with the rail on the wrapped-waiting oracle fixture — never SHOOTING (P06C §5)', () => {
    // The canonical wrapped-waiting-for-post scenario (Visual Oracle scenario 2):
    // a picture that has wrapped but keeps workflow.phase === 'shooting' while it
    // waits for a Post slot. This is the exact state the P06B report flagged.
    const fixture = 'e2e/p06-visual-oracle-v1/s2-wrapped-waiting-for-post.save.json'
    const fixturePath = [`ui/${fixture}`, fixture].find(existsSync)
    expect(fixturePath, 'wrapped-waiting oracle fixture must exist').toBeDefined()
    const raw = JSON.parse(readFileSync(fixturePath!, 'utf8')) as unknown
    const state = (loadSave(raw) as { state: GameState }).state
    const waiting = 'prod-0002'

    // Rail side: the authoritative current state.
    expect(rowOf(managedSnapshot(state), waiting).operationalState).toBe('wrapped-waiting-for-post')

    // Guidance-card side: firstFilmJourney focuses on the attention picture and
    // MUST speak the same current truth — never the raw 'shooting' phase.
    const journey = firstFilmJourney(state)
    expect(journey.productionId).toBe(waiting)
    expect(journey.headline).toBe('WAITING FOR POST')
    expect(journey.headline).not.toBe('SHOOTING')
    expect(journey.beat).toBe('post-production')
    expect(journey.whatHappened).toBe('Principal photography wrapped.')
    // No surface may re-introduce the raw shooting narrative for a wrapped picture.
    expect(journey.whatHappened).not.toMatch(/Principal photography started/)
    expect(journey.next.label).not.toMatch(/Shooting continues/)
  })
})

describe('P05A W2 — the Stage-local collection', () => {
  it('gives every soundstage a row; a stage with no holder is dark', () => {
    const { state } = contendedStudio('w2-stage-rows')
    const snapshot = managedSnapshot(state)
    expect(snapshot.stageProductions.length).toBeGreaterThanOrEqual(2)
    const ids = snapshot.stageProductions.map((row: LotStageProductionState) => row.stageFacilityId)
    expect(new Set(ids).size).toBe(ids.length)
    for (const stage of snapshot.stageProductions) {
      if (stage.holderProductionId === null && stage.wrapReceipt === null) {
        expect(stage.presentationState).toBe('dark')
        expect(stage.holderTitle).toBeNull()
        expect(stage.currentSetId).toBeNull()
        expect(stage.presenceTalentIds).toEqual([])
      }
    }
  })

  it('binds holder, live Set, presence, and copy by exact ids during rehearsal/shooting', () => {
    const { state } = contendedStudio('w2-stage-holder')
    let current = advance(state, 3) // leaders at rehearsal
    const snapshot = managedSnapshot(current)
    const held = snapshot.stageProductions.filter(
      (stage: LotStageProductionState) => stage.holderProductionId !== null,
    )
    expect(held.length).toBeGreaterThanOrEqual(1)
    for (const stage of held) {
      const row = rowOf(snapshot, stage.holderProductionId!)
      expect(row.stageFacilityId).toBe(stage.stageFacilityId)
      expect(stage.presentationState).toBe('rehearsal')
      expect(stage.holderCopy).toBe(`${row.title} · Company rehearsing`)
      expect(stage.currentSetId).toBe(row.currentSetId)
      expect(stage.currentSetId).not.toBeNull()
      // Presence joins by exact owner AND exact facility — never proximity.
      for (const talentId of stage.presenceTalentIds) {
        const person = snapshot.presence!.people.find(
          (candidate: LotPresencePerson) => candidate.talentId === talentId,
        )!
        expect(person.ownerId).toBe(stage.holderProductionId)
        expect(person.facilityId).toBe(stage.stageFacilityId)
      }
    }
  })

  it('CURRENT HOLDER BEATS WRAP: a same-week handoff paints the new holder, receipt beside', () => {
    const { after, leaders, trailer } = walkToTheWrapWeek('w2-holder-precedence')
    const snapshot = managedSnapshot(after)
    const trailing = workflowOf(after, trailer)
    expect(trailing.phase).toBe('rehearsal')
    const takenStage = trailing.reservations.find(
      (reservation) => reservation.capability === 'soundstage',
    )!.facilityId
    const stageRow = stageRowOf(snapshot, takenStage)
    // The new holder owns the stage THIS week…
    expect(stageRow.holderProductionId).toBe(trailer)
    expect(stageRow.presentationState).toBe('rehearsal')
    // …and the just-wrapped leader survives only as a receipt, never as state.
    if (stageRow.wrapReceipt !== null) {
      expect(stageRow.wrapReceipt.currentWeek).toBe(true)
      expect(stageRow.holderProductionId).not.toBe(
        leaders.find((id) => workflowOf(after, id).phase === 'shooting'),
      )
    }
    // A wrapped stage with NO new holder shows the bounded wrap cue.
    const wrappedLeaderStages = snapshot.stageProductions.filter(
      (stage: LotStageProductionState) =>
        stage.holderProductionId === null && stage.wrapReceipt !== null,
    )
    for (const stage of wrappedLeaderStages) {
      expect(stage.presentationState).toBe('wrap')
      expect(stage.wrapReceipt!.currentWeek).toBe(true)
    }
  })
})

describe('P05A W2 — worksites and Locate', () => {
  it('resolves the exact primary work target during stage phases', () => {
    const { state } = contendedStudio('w2-worksite-exact')
    const current = advance(state, 3)
    const snapshot = managedSnapshot(current)
    for (const row of snapshot.productionOperations) {
      if (row.phase !== 'rehearsal' && row.phase !== 'shooting') continue
      expect(row.worksiteResolution).toBe('exact')
      expect(row.primaryWorkTarget).not.toBeNull()
      expect(row.primaryWorkTarget!.capability).toBe('soundstage')
      expect(row.primaryWorkTarget!.buildingId).toBe(row.locationBuildingId)
      expect(row.primaryWorkTarget!.locatable).toBe(true)
      // Locate targets are deduplicated by exact resource id.
      const resourceIds = row.locateTargets!.map((target: LotProductionTarget) => target.resourceId)
      expect(new Set(resourceIds).size).toBe(resourceIds.length)
      for (const target of row.locateTargets!) expect(target.locatable).toBe(true)
    }
  })

  it('never invents a worksite for a wrapped picture waiting for Post', () => {
    const { after, leaders } = walkToTheWrapWeek('w2-worksite-none')
    const waiting = leaders.find((id) => workflowOf(after, id).phase === 'shooting')!
    const row = rowOf(managedSnapshot(after), waiting)
    expect(row.worksiteResolution).toBe('none')
    expect(row.primaryWorkTarget).toBeNull()
    expect(row.ownedWorksites).toEqual([])
    expect(row.stageBuildingId).toBeNull()
  })
})
