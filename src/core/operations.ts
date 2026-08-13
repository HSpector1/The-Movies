// ── Production Operations V1 ────────────────────────────────────────────────
// Authoritative, deterministic facility allocation and production workflow.
// This module is pure: it consumes no RNG, reads no wall clock, and never mutates
// caller-owned state.

import type {
  FacilityCapability,
  FacilityReservation,
  Production,
  ProductionBlocker,
  ProductionPhase,
  ProductionWorkflow,
  ShootingTask,
  StudioFacility,
  StudioOperations,
} from './types.js'

// Deep-frozen because this template is part of the public core surface. The live
// state always receives mutable-by-replacement clones; no consumer can alter the
// authoritative defaults or the invariant baseline through this singleton.
export const INITIAL_STUDIO_FACILITIES: readonly StudioFacility[] = Object.freeze([
  Object.freeze({
    id: 'facility-development-casting',
    name: 'Development & Casting',
    capability: 'development-casting',
    capacity: 2,
  }),
  Object.freeze({ id: 'facility-post-building', name: 'Post Building', capability: 'post', capacity: 2 }),
  Object.freeze({ id: 'facility-scenery-shop', name: 'Scenery Shop', capability: 'set-scenery', capacity: 2 }),
  Object.freeze({ id: 'facility-soundstage-07', name: 'Soundstage 7', capability: 'soundstage', capacity: 1 }),
  Object.freeze({ id: 'facility-soundstage-12', name: 'Soundstage 12', capability: 'soundstage', capacity: 1 }),
]) as readonly StudioFacility[]

export function emptyStudioOperations(): StudioOperations {
  return { mode: 'legacy', facilities: [], workflows: [] }
}

export function initialManagedStudioOperations(): StudioOperations {
  return {
    mode: 'managed',
    facilities: INITIAL_STUDIO_FACILITIES.map((facility) => ({ ...facility })),
    workflows: [],
  }
}

export function productionPhaseForRemainingTicks(remainingTicks: number): ProductionPhase {
  switch (remainingTicks) {
    case 8:
      return 'development'
    case 7:
      return 'preProduction'
    case 6:
      return 'rehearsal'
    case 5:
    case 4:
      return 'shooting'
    case 3:
    case 2:
      return 'postProduction'
    case 1:
      return 'releaseReady'
    default:
      throw new Error(
        `productionPhaseForRemainingTicks: remainingTicks ${String(remainingTicks)} is outside managed production range [1, 8]`,
      )
  }
}

function requirementsForPhase(phase: ProductionPhase): readonly FacilityCapability[] {
  switch (phase) {
    case 'development':
    case 'preProduction':
      return ['development-casting']
    case 'rehearsal':
      return ['soundstage']
    case 'shooting':
      return ['soundstage', 'set-scenery']
    case 'postProduction':
      return ['post']
    case 'releaseReady':
      return []
  }
}

function compareId<T extends { id: string }>(a: T, b: T): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

function occupiedSlots(
  workflows: readonly ProductionWorkflow[],
  excludingProductionId: string,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
): Set<string> {
  const occupied = new Set<string>(externallyOccupiedSlots)
  for (const workflow of workflows) {
    if (workflow.productionId === excludingProductionId) continue
    for (const reservation of workflow.reservations) {
      occupied.add(`${reservation.facilityId}:${String(reservation.slot)}`)
    }
  }
  return occupied
}

type AllocationResult =
  | { ok: true; reservations: FacilityReservation[] }
  | { ok: false; blocker: ProductionBlocker }

function allocateForPhase(
  operations: StudioOperations,
  workflow: ProductionWorkflow,
  targetPhase: ProductionPhase,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
): AllocationResult {
  const occupied = occupiedSlots(
    operations.workflows,
    workflow.productionId,
    externallyOccupiedSlots,
  )
  const reservations: FacilityReservation[] = []
  const facilities = [...operations.facilities].sort(compareId)

  for (const capability of requirementsForPhase(targetPhase)) {
    // Rehearsal → Shooting retains the physical soundstage. Since the workflow's
    // own reservations are excluded from occupiedSlots, this slot remains legal.
    const retained =
      capability === 'soundstage'
        ? workflow.reservations.find((reservation) => reservation.capability === 'soundstage')
        : undefined
    if (retained !== undefined) {
      reservations.push({ ...retained, phase: targetPhase })
      occupied.add(`${retained.facilityId}:${String(retained.slot)}`)
      continue
    }

    let allocated: FacilityReservation | null = null
    for (const facility of facilities) {
      if (facility.capability !== capability) continue
      for (let slot = 0; slot < facility.capacity; slot++) {
        const key = `${facility.id}:${String(slot)}`
        if (occupied.has(key)) continue
        allocated = {
          productionId: workflow.productionId,
          facilityId: facility.id,
          capability,
          slot,
          phase: targetPhase,
        }
        occupied.add(key)
        break
      }
      if (allocated !== null) break
    }

    if (allocated === null) {
      return {
        ok: false,
        blocker: { kind: 'facility-capacity', capability, targetPhase },
      }
    }
    reservations.push(allocated)
  }

  return { ok: true, reservations }
}

function replaceWorkflow(
  operations: StudioOperations,
  replacement: ProductionWorkflow,
): StudioOperations {
  return {
    ...operations,
    workflows: operations.workflows.map((workflow) =>
      workflow.productionId === replacement.productionId ? replacement : workflow,
    ),
  }
}

export function addManagedProductionWorkflow(
  operations: StudioOperations,
  production: Production,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
): StudioOperations {
  if (operations.mode !== 'managed') return operations
  if (operations.workflows.some((workflow) => workflow.productionId === production.id)) {
    throw new Error(
      `applyActions: managed greenlight found duplicate workflow for productionId "${production.id}"`,
    )
  }
  const phase = productionPhaseForRemainingTicks(production.remainingTicks)
  const draft: ProductionWorkflow = {
    productionId: production.id,
    phase,
    reservations: [],
    shootingTask: null,
    blocker: null,
  }
  const withDraft: StudioOperations = {
    ...operations,
    workflows: [...operations.workflows, draft],
  }
  const allocation = allocateForPhase(
    withDraft,
    draft,
    phase,
    externallyOccupiedSlots,
  )
  if (!allocation.ok) {
    throw new Error(
      `applyActions: managed greenlight rejected — no ${allocation.blocker.kind === 'facility-capacity' ? allocation.blocker.capability : 'required facility'} capacity for productionId "${production.id}"`,
    )
  }
  return replaceWorkflow(withDraft, { ...draft, reservations: allocation.reservations })
}

export function removeManagedProductionWorkflow(
  operations: StudioOperations,
  productionId: string,
): StudioOperations {
  if (operations.mode !== 'managed') return operations
  return {
    ...operations,
    workflows: operations.workflows.filter((workflow) => workflow.productionId !== productionId),
  }
}

function requireManagedWorkflow(
  operations: StudioOperations,
  productionId: string,
  actionName: string,
): ProductionWorkflow {
  if (operations.mode !== 'managed') {
    throw new Error(`applyActions: ${actionName} rejected — studio operations are not managed`)
  }
  const workflow = operations.workflows.find((candidate) => candidate.productionId === productionId)
  if (workflow === undefined) {
    throw new Error(
      `applyActions: ${actionName} references productionId "${productionId}" without an active managed workflow`,
    )
  }
  return workflow
}

export function assignShootingDirector(
  operations: StudioOperations,
  production: Production,
  directorId: string,
): StudioOperations {
  const workflow = requireManagedWorkflow(operations, production.id, 'assignShootingDirector')
  if (workflow.phase !== 'shooting' || workflow.shootingTask === null) {
    throw new Error(
      `applyActions: assignShootingDirector rejected — productionId "${production.id}" is not in Shooting`,
    )
  }
  if (directorId !== production.directorId || directorId !== workflow.shootingTask.directorId) {
    throw new Error(
      `applyActions: assignShootingDirector rejected — directorId "${directorId}" is not productionId "${production.id}"'s locked director`,
    )
  }
  if (workflow.shootingTask.status !== 'unassigned' || workflow.blocker !== null) {
    throw new Error(
      `applyActions: assignShootingDirector rejected — productionId "${production.id}" task is ${workflow.shootingTask.status}`,
    )
  }
  const task: ShootingTask = { ...workflow.shootingTask, status: 'blocked' }
  return replaceWorkflow(operations, {
    ...workflow,
    shootingTask: task,
    blocker: { kind: 'scenery-load-in', taskId: task.id },
  })
}

export function clearSceneryLoadIn(
  operations: StudioOperations,
  productionId: string,
): StudioOperations {
  const workflow = requireManagedWorkflow(operations, productionId, 'clearSceneryLoadIn')
  const task = workflow.shootingTask
  if (
    workflow.phase !== 'shooting' ||
    task === null ||
    task.status !== 'blocked' ||
    workflow.blocker?.kind !== 'scenery-load-in' ||
    workflow.blocker.taskId !== task.id
  ) {
    throw new Error(
      `applyActions: clearSceneryLoadIn rejected — productionId "${productionId}" has no active scenery-load-in blocker`,
    )
  }
  return replaceWorkflow(operations, {
    ...workflow,
    shootingTask: { ...task, status: 'ready' },
    blocker: null,
  })
}

export function scheduleShootingTake(
  operations: StudioOperations,
  productionId: string,
): StudioOperations {
  const workflow = requireManagedWorkflow(operations, productionId, 'scheduleShootingTake')
  const task = workflow.shootingTask
  if (
    workflow.phase !== 'shooting' ||
    task === null ||
    task.status !== 'ready' ||
    workflow.blocker !== null
  ) {
    throw new Error(
      `applyActions: scheduleShootingTake rejected — productionId "${productionId}" shooting task is not ready`,
    )
  }
  return replaceWorkflow(operations, {
    ...workflow,
    shootingTask: { ...task, status: 'scheduled' },
  })
}

function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`operations invariant: ${message}`)
}

// Shared core/save boundary. Callers should first establish the outer object/array
// shape; this assertion then enforces every cross-reference and capacity law.
export function assertStudioOperationsInvariants(
  operations: StudioOperations,
  productions: readonly Production[],
  options?: { facilityPolicy?: 'initial-v1' | 'configured' },
): void {
  if (operations.mode === 'legacy') {
    invariant(operations.facilities.length === 0, 'legacy mode must have no facilities')
    invariant(operations.workflows.length === 0, 'legacy mode must have no workflows')
    return
  }
  invariant(operations.mode === 'managed', `unknown mode ${String(operations.mode)}`)
  const facilityIds = new Set<string>()
  const facilityCapabilities = new Set<FacilityCapability>()
  for (const facility of operations.facilities) {
    invariant(facility.id.length > 0, 'facility id must be non-empty')
    invariant(facility.name.length > 0, `facility "${facility.id}" name must be non-empty`)
    invariant(!facilityIds.has(facility.id), `duplicate facility id "${facility.id}"`)
    invariant(
      Number.isInteger(facility.capacity) && facility.capacity > 0,
      `facility "${facility.id}" capacity must be a positive integer`,
    )
    facilityIds.add(facility.id)
    facilityCapabilities.add(facility.capability)
  }
  for (const capability of [
    'development-casting',
    'soundstage',
    'set-scenery',
    'post',
  ] as const) {
    invariant(facilityCapabilities.has(capability), `managed operations have no ${capability} facility`)
  }

  if ((options?.facilityPolicy ?? 'initial-v1') === 'initial-v1') {
    invariant(
      operations.facilities.length === INITIAL_STUDIO_FACILITIES.length,
      'managed V1 facility count differs from the initial facility truth',
    )
    for (let i = 0; i < INITIAL_STUDIO_FACILITIES.length; i++) {
      const actual = operations.facilities[i]!
      const expected = INITIAL_STUDIO_FACILITIES[i]!
      invariant(
        actual.id === expected.id &&
          actual.name === expected.name &&
          actual.capability === expected.capability &&
          actual.capacity === expected.capacity,
        `managed facility at index ${String(i)} differs from ${expected.id}`,
      )
    }
  }

  const productionById = new Map<string, Production>()
  for (const production of productions) {
    invariant(!productionById.has(production.id), `duplicate active productionId "${production.id}"`)
    productionById.set(production.id, production)
  }
  invariant(
    operations.workflows.length === productions.length,
    'managed active productions and workflows must be one-to-one',
  )
  const workflowIds = new Set<string>()
  const occupied = new Set<string>()
  const facilityById = new Map(operations.facilities.map((facility) => [facility.id, facility]))

  for (const workflow of operations.workflows) {
    invariant(!workflowIds.has(workflow.productionId), `duplicate workflow for "${workflow.productionId}"`)
    workflowIds.add(workflow.productionId)
    const production = productionById.get(workflow.productionId)
    invariant(production !== undefined, `workflow "${workflow.productionId}" has no active production`)
    invariant(
      workflow.phase === productionPhaseForRemainingTicks(production.remainingTicks),
      `workflow "${workflow.productionId}" phase disagrees with remainingTicks`,
    )

    const expectedCapabilities = [...requirementsForPhase(workflow.phase)].sort()
    const actualCapabilities = workflow.reservations.map((reservation) => reservation.capability).sort()
    invariant(
      JSON.stringify(actualCapabilities) === JSON.stringify(expectedCapabilities),
      `workflow "${workflow.productionId}" has the wrong current-phase reservation set`,
    )
    for (const reservation of workflow.reservations) {
      const facility = facilityById.get(reservation.facilityId)
      invariant(facility !== undefined, `reservation references unknown facility "${reservation.facilityId}"`)
      invariant(
        reservation.productionId === workflow.productionId,
        `reservation owner disagrees with workflow "${workflow.productionId}"`,
      )
      invariant(
        reservation.capability === facility.capability,
        `reservation capability disagrees with facility "${facility.id}"`,
      )
      invariant(reservation.phase === workflow.phase, 'reservation phase disagrees with workflow phase')
      invariant(
        Number.isInteger(reservation.slot) && reservation.slot >= 0 && reservation.slot < facility.capacity,
        `reservation slot is outside facility "${facility.id}" capacity`,
      )
      const key = `${facility.id}:${String(reservation.slot)}`
      invariant(!occupied.has(key), `facility slot "${key}" is overbooked`)
      occupied.add(key)
    }

    if (workflow.phase === 'shooting') {
      const task = workflow.shootingTask
      invariant(task !== null, `shooting workflow "${workflow.productionId}" has no shooting task`)
      invariant(task.id === `shooting:${production.id}`, 'shooting task id is not canonical')
      invariant(task.productionId === production.id, 'shooting task owner disagrees with production')
      invariant(task.directorId === production.directorId, 'shooting task director is not the locked director')
      const stage = workflow.reservations.find(
        (reservation) => reservation.capability === 'soundstage',
      )
      invariant(stage !== undefined, 'shooting task has no soundstage reservation')
      invariant(
        task.soundstageFacilityId === stage.facilityId,
        'shooting task destination disagrees with its soundstage reservation',
      )
      if (production.remainingTicks === 4) {
        invariant(task.status === 'completed', 'second Shooting week requires a completed take')
      } else {
        invariant(production.remainingTicks === 5, 'Shooting remainingTicks must be 5 or 4')
        invariant(task.status !== 'completed', 'take cannot be completed before its advancing tick')
      }
      if (task.status === 'blocked') {
        invariant(
          workflow.blocker?.kind === 'scenery-load-in' && workflow.blocker.taskId === task.id,
          'blocked shooting task must own the scenery-load-in blocker',
        )
      } else if (task.status === 'completed') {
        invariant(
          workflow.blocker === null || workflow.blocker.kind === 'facility-capacity',
          'a completed take may only be held by next-phase facility capacity',
        )
      } else {
        invariant(workflow.blocker === null, `shooting task status ${task.status} cannot have a blocker`)
      }
    } else {
      invariant(workflow.shootingTask === null, 'shooting task must be cleared outside Shooting')
      invariant(
        workflow.blocker === null || workflow.blocker.kind === 'facility-capacity',
        'scenery blocker may exist only in Shooting',
      )
    }

    if (workflow.blocker?.kind === 'facility-capacity') {
      const reachableBlocker =
        production.remainingTicks === 7
          ? { capability: 'soundstage' as const, targetPhase: 'rehearsal' as const }
          : production.remainingTicks === 6
            ? { capability: 'set-scenery' as const, targetPhase: 'shooting' as const }
            : production.remainingTicks === 4
              ? { capability: 'post' as const, targetPhase: 'postProduction' as const }
              : null
      invariant(
        reachableBlocker !== null,
        `workflow "${workflow.productionId}" cannot have a capacity blocker at remainingTicks ${String(production.remainingTicks)}`,
      )
      invariant(
        workflow.blocker.targetPhase === reachableBlocker.targetPhase &&
          workflow.blocker.capability === reachableBlocker.capability,
        `capacity blocker must be ${reachableBlocker.capability} for ${reachableBlocker.targetPhase}`,
      )
    }
  }
  for (const production of productions) {
    invariant(workflowIds.has(production.id), `active production "${production.id}" has no workflow`)
  }
}

function enterPhase(
  operations: StudioOperations,
  workflow: ProductionWorkflow,
  production: Production,
  targetPhase: ProductionPhase,
  externallyOccupiedSlots: ReadonlySet<string>,
): { operations: StudioOperations; production: Production; advanced: boolean } {
  const allocation = allocateForPhase(
    operations,
    workflow,
    targetPhase,
    externallyOccupiedSlots,
  )
  if (!allocation.ok) {
    return {
      operations: replaceWorkflow(operations, { ...workflow, blocker: allocation.blocker }),
      production,
      advanced: false,
    }
  }

  const shootingTask: ShootingTask | null =
    targetPhase === 'shooting'
      ? {
          id: `shooting:${production.id}`,
          productionId: production.id,
          directorId: production.directorId,
          soundstageFacilityId: allocation.reservations.find(
            (reservation) => reservation.capability === 'soundstage',
          )!.facilityId,
          status: 'unassigned',
        }
      : null

  const replacement: ProductionWorkflow = {
    ...workflow,
    phase: targetPhase,
    reservations: allocation.reservations,
    shootingTask,
    blocker: null,
  }
  return {
    operations: replaceWorkflow(operations, replacement),
    production: { ...production, remainingTicks: production.remainingTicks - 1 },
    advanced: true,
  }
}

export type ManagedProductionAdvance = {
  productions: Production[]
  operations: StudioOperations
}

export function advanceManagedProductions(
  operations: StudioOperations,
  productions: readonly Production[],
  currentTick: number,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
): ManagedProductionAdvance {
  if (operations.mode !== 'managed') {
    return {
      productions: productions.map((production) =>
        production.startTick < currentTick
          ? { ...production, remainingTicks: production.remainingTicks - 1 }
          : production,
      ),
      operations,
    }
  }

  let nextOperations = operations
  const byId = new Map<string, Production>()
  for (const production of productions) byId.set(production.id, production)
  const ordered = [...productions].sort(compareId)

  for (const original of ordered) {
    if (original.startTick >= currentTick) continue
    let production = byId.get(original.id)!
    const workflow = nextOperations.workflows.find(
      (candidate) => candidate.productionId === production.id,
    )
    if (workflow === undefined) {
      throw new Error(
        `tick: managed productionId "${production.id}" has no authoritative workflow`,
      )
    }
    const expectedPhase = productionPhaseForRemainingTicks(production.remainingTicks)
    if (workflow.phase !== expectedPhase) {
      throw new Error(
        `tick: managed productionId "${production.id}" phase ${workflow.phase} disagrees with remainingTicks ${String(production.remainingTicks)}`,
      )
    }

    // The first Shooting week advances only after the authoritative take was
    // scheduled; that same tick completes it. All other same-phase weeks advance.
    if (production.remainingTicks === 5) {
      const task = workflow.shootingTask
      if (task === null || task.status !== 'scheduled' || workflow.blocker !== null) continue
      production = { ...production, remainingTicks: 4 }
      nextOperations = replaceWorkflow(nextOperations, {
        ...workflow,
        shootingTask: { ...task, status: 'completed' },
      })
      byId.set(production.id, production)
      continue
    }

    const nextRemaining = production.remainingTicks - 1
    if (nextRemaining === 0) {
      byId.set(production.id, { ...production, remainingTicks: 0 })
      nextOperations = removeManagedProductionWorkflow(nextOperations, production.id)
      continue
    }

    const targetPhase = productionPhaseForRemainingTicks(nextRemaining)
    if (targetPhase === workflow.phase) {
      byId.set(production.id, { ...production, remainingTicks: nextRemaining })
      continue
    }

    const result = enterPhase(
      nextOperations,
      workflow,
      production,
      targetPhase,
      externallyOccupiedSlots,
    )
    nextOperations = result.operations
    if (result.advanced) byId.set(production.id, result.production)
  }

  // Preserve the caller's production-array order; allocation order alone is the
  // governed ascending-id order.
  return {
    productions: productions.map((production) => byId.get(production.id)!),
    operations: nextOperations,
  }
}
