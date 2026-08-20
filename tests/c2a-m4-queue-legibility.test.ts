// ── C2a-M4 — G16: the queue answers all four law-2 questions ────────────────
//
// *The player must know WHAT IS WAITING, WHAT IT NEEDS, WHAT OCCUPIES IT, and
// HOW TO RELIEVE THE BOTTLENECK.* Four facts, rendered non-empty for EVERY
// waiter in a seeded contended run, with the remedies actionable rather than
// decorative — a remedy that names a verb the engine does not have is a promise
// the studio cannot keep.

import { describe, expect, it } from 'vitest'
import {
  FACILITY_BLUEPRINTS,
  SET_BLUEPRINTS,
  applyActions,
  studioCalendar,
  studioQueueView,
  tick,
} from '../src/core/index.js'
import type { GameState, StudioQueueRemedy } from '../src/core/index.js'
import { hasQueuedGreenlightScriptProject } from '../src/core/productionQueue.js'
import { contendedStudio, freePackageOrNull, nextCommissionOrNull } from './_m4Fixtures.js'

function starved(seed: string): { state: GameState; readyProjectIds: readonly string[] } {
  const { state, readyProjectIds } = contendedStudio(seed)
  return {
    state: {
      ...state,
      operations: {
        ...state.operations,
        facilities: state.operations.facilities
          .filter((facility) => facility.id !== 'facility-soundstage-12')
          .map((facility) =>
            facility.capability === 'post' ? { ...facility, capacity: 1 } : facility,
          ),
      },
      sets: state.sets.filter((set) => set.mountedOn !== 'facility-soundstage-12'),
    },
    readyProjectIds,
  }
}

function driveTakes(state: GameState): GameState {
  let next = state
  for (const workflow of state.operations.workflows) {
    if (workflow.phase !== 'shooting' || workflow.shootingTask?.status !== 'unassigned') continue
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )!
    next = applyActions(next, [
      {
        kind: 'assignShootingDirector',
        productionId: production.id,
        directorId: production.directorId,
      },
      { kind: 'clearSceneryLoadIn', productionId: production.id },
      { kind: 'scheduleShootingTake', productionId: production.id },
    ])
  }
  return next
}

describe('C2a-M4 G16 — studioQueueView answers law 2', () => {
  it('renders all four facts non-empty for every waiter in a contended run', () => {
    const { state, readyProjectIds } = starved('m4-legibility')
    let next = state
    let sawProductionWaiter = false
    let sawIntentWaiter = false

    for (let week = 0; week < 18; week++) {
      // Keep asking for more than the lot can carry, so both kinds of waiter
      // exist: pictures held at a phase gate and intents held at a front door.
      for (const projectId of readyProjectIds) {
        const project = next.scriptDevelopment.projects.find(
          (candidate) => candidate.id === projectId,
        )
        if (project?.status !== 'ready') continue
        if (hasQueuedGreenlightScriptProject(next.productionQueue, projectId)) continue
        const payload = freePackageOrNull(next, projectId)
        if (payload === null) continue
        next = applyActions(next, [{ kind: 'greenlightScriptProject', production: payload }])
      }
      // A commission the rooms cannot carry becomes a queued intent.
      const commission = nextCommissionOrNull(next)
      if (commission !== null) {
        next = applyActions(next, [{ kind: 'commissionScript', project: commission }])
      }
      next = tick(driveTakes(next))

      const view = studioQueueView(next)
      expect(view.week).toBe(next.market.tick)
      for (const waiter of view.waiters) {
        // WHAT IS WAITING.
        expect(waiter.title.length).toBeGreaterThan(0)
        expect(waiter.headline.length).toBeGreaterThan(0)
        expect(waiter.waitWeeks).toBeGreaterThanOrEqual(0)
        // WHAT IT NEEDS.
        expect(waiter.needs.label.length).toBeGreaterThan(0)
        // WHAT OCCUPIES IT — or, when nothing does, a detail that says so
        // rather than an empty sentence.
        expect(waiter.detail.length).toBeGreaterThan(0)
        for (const occupant of waiter.occupiedBy) {
          expect(occupant.ownerId.length).toBeGreaterThan(0)
          expect(occupant.title.length).toBeGreaterThan(0)
          expect(occupant.activity.length).toBeGreaterThan(0)
          expect(occupant.resourceId.length).toBeGreaterThan(0)
          if (occupant.freesInWeeks !== null) {
            expect(occupant.freesInWeeks).toBeGreaterThanOrEqual(0)
          }
        }
        // HOW TO RELIEVE IT — never empty.
        expect(waiter.remedies.length).toBeGreaterThan(0)
        if (waiter.kind === 'production') sawProductionWaiter = true
        if (waiter.kind === 'intent') sawIntentWaiter = true
      }
      // Service order: longest-waiting-first.
      const waits = view.waiters.map((waiter) => waiter.waitWeeks)
      expect([...waits].sort((a, b) => b - a)).toEqual(waits)
    }

    expect(sawProductionWaiter).toBe(true)
    expect(sawIntentWaiter).toBe(true)
  })

  it('names the HOLDER on the blocker detail — the presence truth-gap closes', () => {
    const { state } = starved('m4-holder-named')
    let next = state
    for (let week = 0; week < 6; week++) {
      next = tick(driveTakes(next))
      const waiter = studioQueueView(next).waiters.find(
        (candidate) => candidate.kind === 'production' && candidate.occupiedBy.length > 0,
      )
      if (waiter === undefined) continue
      const holder = waiter.occupiedBy[0]!
      // The sentence carries the holder's TITLE, not its id — the join the
      // blocker itself cannot make, because it carries only {capability, phase}.
      expect(waiter.detail).toContain(holder.title)
      expect(waiter.remedies.some((remedy) => remedy.kind === 'wait-for-holder')).toBe(true)
      return
    }
    throw new Error('legibility fixture: no picture was ever held behind a named holder')
  })

  it('offers only remedies the engine can actually perform', () => {
    const { state, readyProjectIds } = starved('m4-remedies-actionable')
    let next = state
    const seen = new Set<StudioQueueRemedy['kind']>()
    for (let week = 0; week < 12; week++) {
      for (const projectId of readyProjectIds) {
        const payload = freePackageOrNull(next, projectId)
        const project = next.scriptDevelopment.projects.find(
          (candidate) => candidate.id === projectId,
        )
        if (project?.status !== 'ready' || payload === null) continue
        if (hasQueuedGreenlightScriptProject(next.productionQueue, projectId)) continue
        next = applyActions(next, [{ kind: 'greenlightScriptProject', production: payload }])
      }
      const commission = nextCommissionOrNull(next)
      if (commission !== null) {
        next = applyActions(next, [{ kind: 'commissionScript', project: commission }])
      }
      next = tick(driveTakes(next))
      for (const waiter of studioQueueView(next).waiters) {
        for (const remedy of waiter.remedies) {
          seen.add(remedy.kind)
          switch (remedy.kind) {
            case 'build-blueprint': {
              // The blueprint exists in ITS catalog, at the price the remedy quotes.
              if (remedy.catalog === 'facility') {
                const blueprint = FACILITY_BLUEPRINTS.find(
                  (candidate) => candidate.id === remedy.blueprintId,
                )
                expect(blueprint).toBeDefined()
                expect(remedy.cost).toBe(blueprint!.capex)
                expect(remedy.weeks).toBe(blueprint!.buildWeeks)
                expect(blueprint!.capability).toBe(remedy.capability)
                expect(blueprint!.capacity).toBeGreaterThan(0)
              } else {
                const blueprint = SET_BLUEPRINTS.find(
                  (candidate) => candidate.id === remedy.blueprintId,
                )
                expect(blueprint).toBeDefined()
                expect(remedy.cost).toBe(blueprint!.capex)
                expect(remedy.weeks).toBe(blueprint!.buildWeeks)
                expect(remedy.capability).toBeNull()
              }
              break
            }
            case 'wait-for-holder':
              expect(
                next.operations.workflows.some(
                  (workflow) => workflow.productionId === remedy.ownerId,
                ) ||
                  next.scriptDevelopment.projects.some(
                    (project) => project.id === remedy.ownerId,
                  ) ||
                  next.castingSessions.sessions.some(
                    (session) => session.id === remedy.ownerId,
                  ),
              ).toBe(true)
              break
            case 'repair-set':
            case 'strike-and-mount':
              expect(next.sets.some((set) => set.id === remedy.setId)).toBe(true)
              break
            case 'cancel-queued-intent': {
              // THE VERB EXISTS, and it does what the remedy says: the intent
              // leaves the queue, holding nothing and releasing nothing.
              const before = next
              const after = applyActions(before, [
                { kind: 'cancelQueuedIntent', ordinal: remedy.ordinal },
              ])
              expect(after.productionQueue.length).toBe(before.productionQueue.length - 1)
              expect(after.studio.cash).toBe(before.studio.cash)
              expect(after.ledger).toEqual(before.ledger)
              expect(
                after.studioEvents.rows.some(
                  (row) => row.kind === 'queueIntentExpired' && row.ordinal === remedy.ordinal,
                ),
              ).toBe(true)
              break
            }
          }
        }
      }
    }
    // The run has to have exercised the two remedies every contended studio has.
    expect(seen.has('wait-for-holder')).toBe(true)
    expect(seen.has('build-blueprint')).toBe(true)
  })

  it('speaks the set wait on the Production Board too', () => {
    // A picture with a free stage and nothing standing on it reads as HELD, not
    // as on schedule — the calendar learned the `set-unavailable` arm.
    const { state } = contendedStudio('m4-set-wait-board')
    // Strike the scenery off both stages by retiring the sets, so the next
    // rehearsal entry finds a stage and no set.
    let next: GameState = {
      ...state,
      sets: state.sets.map((set) => ({ ...set, status: 'retired' as const, condition: 0 })),
    }
    next = tick(tick(tick(next)))
    const held = next.operations.workflows.find(
      (workflow) => workflow.blocker?.kind === 'set-unavailable',
    )
    expect(held).toBeDefined()
    const board = studioCalendar(next).productionOutlook.find(
      (view) => view.productionId === held!.productionId,
    )!
    expect(board.status).toBe('held')
    expect(board.blocker?.kind).toBe('set-unavailable')
    expect(board.blocker?.headline).toContain('set')
    const waiter = studioQueueView(next).waiters.find(
      (candidate) => candidate.id === held!.productionId,
    )!
    expect(waiter.needs.kind).toBe('set')
    expect(waiter.remedies.length).toBeGreaterThan(0)
  })
})
