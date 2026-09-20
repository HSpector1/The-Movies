// Installed from independently frozen209 (210 qualified KEEP); original inert provenance below retained unchanged.
// INERT / UNEXECUTED. Intended tests/p14b4-started-replay-director.test.ts.
//209: genuine unassigned Shooting, explicit locked-director/order and non-grandfather refusal.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import { replayStartedProductionPlans, type StartedOwnerReplayInput,
  type StartedProductionCommand } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import { sceneryLoadInDecision } from '../src/core/sceneryLoadIn.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production } from '../src/core/types.js'
import { operationsStudio, productionPayload } from './contracts/_contractFixtures.js'

const clone = <T>(value: T): T => structuredClone(value)
const company = (rows: readonly Production[]) => new Set(rows.flatMap((row) =>
  [row.directorId, ...Object.values(row.cast), ...row.craftIds]))

function supported(state: GameState) {
  assert.ok(state.hollywood)
  const own = state.hollywood.playerStudioId
  expect(state.founding).toBeNull()
  expect(state.operations.mode).toBe('managed')
  expect(state.productionQueue).toEqual([])
  expect(state.physicalPlans.plans.filter((row) => row.studioId === own &&
    (row.status === 'queued' || row.status === 'held' || row.status === 'blocked'))).toEqual([])
  expect(state.construction.projects.filter((row) => row.status === 'building')).toEqual([])
  expect(state.placement.facilities.filter((row) => row.status === 'underConstruction')).toEqual([])
  expect(state.sets.filter((row) => row.status === 'under-construction')).toEqual([])
  expect(state.technology.projects.filter((row) => row.studioId === own && row.status === 'active')).toEqual([])
  expect(state.technology.adoptions.filter((row) => row.studioId === own &&
    row.cancelledWeek === null && row.operationalWeek === null)).toEqual([])
  const relevant = company(state.studio.activeProductions)
  for (const project of state.scriptDevelopment.projects) if (project.status === 'drafting' || project.status === 'rewriting') {
    for (const id of scriptProjectWriterIds(project)) relevant.add(id)
  }
  for (const business of state.hollywood.businesses.filter((row) => row.studioId !== own)) {
    expect([...company(business.productions)].filter((id) => relevant.has(id))).toEqual([])
    for (const ordinal of business.activeScriptOrdinals) {
      const project = business.development.projects[ordinal], costs = business.projects[ordinal]
      assert.ok(project && costs)
      expect(costs.scriptProjectId).toBe(project.id)
      expect(costs.conceptId).toBe(project.conceptId)
      expect(state.hollywood.concepts[costs.conceptOrdinal]?.id).toBe(project.conceptId)
      if (project.status === 'drafting' || project.status === 'rewriting') {
        expect(scriptProjectWriterIds(project).filter((id) => relevant.has(id))).toEqual([])
      }
    }
  }
  expect(state.technology.projects.filter((row) => row.studioId !== own && row.status === 'active')
    .flatMap((row) => row.seats.filter((seat) => seat.releasedWeek === null && relevant.has(seat.talentId)))).toEqual([])
  makeSave(state)
}


function unassigned() {
  //178's historical-control founder. Fresh industry is initialized at REAL week0.
  let state = operationsStudio('p13a-production-consumer')
  expect(state.market.tick).toBe(0)
  state = initializeHollywood(state, 'fresh')
  expect(state.hollywood).toMatchObject({ origin: 'fresh', originWeek: 0 })
  expect(state.scriptDevelopment.mode).toBe('legacy')
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, 0) }])
  expect(state.studio.activeProductions).toHaveLength(1)
  const id = state.studio.activeProductions[0]!.id
  for (let guard = 0; guard < 20 && state.studio.activeProductions[0]?.remainingTicks !== 5; guard++) state = tick(state)
  expect(state.studio.activeProductions[0]?.id).toBe(id)
  expect(state.studio.activeProductions[0]?.remainingTicks).toBe(5)
  expect(state.operations.workflows).toHaveLength(1)
  const production = state.studio.activeProductions[0]!, workflow = state.operations.workflows[0]!
  expect(workflow.productionId).toBe(id)
  expect(workflow.phase).toBe('shooting')
  expect(workflow.shootingTask).toMatchObject({ status: 'unassigned', directorId: production.directorId })
  expect(workflow.blocker).toBeNull()
  expect(workflow.bindings.requiresSetBinding).toBe(true)
  expect(workflow.bindings.stageFacilityId).not.toBeNull()
  expect(workflow.bindings.setId).not.toBeNull()
  expect(sceneryLoadInDecision(state, workflow, state.market.tick).kind).toBe('none')
  expect(state.firstTakes.filter((row) => row.productionId === id)).toEqual([])
  supported(state)
  return { state, production, workflow, week: state.market.tick }
}

function input(state: GameState, commands: readonly StartedProductionCommand[]): StartedOwnerReplayInput<Production> {
  assert.ok(state.hollywood)
  return { source: { technology: state.technology, market: { tick: state.market.tick },
    placement: state.placement, property: state.property, hollywood: state.hollywood,
    operations: state.operations, sets: state.sets, releaseAuthority: state.releaseAuthority,
    scriptDevelopment: state.scriptDevelopment, castingSessions: state.castingSessions,
    construction: state.construction, physicalPlans: state.physicalPlans,
    productionQueue: state.productionQueue, founding: state.founding, firstTakes: state.firstTakes,
    concepts: state.concepts, studio: { activeProductions: state.studio.activeProductions } },
  issuerId: state.hollywood.playerStudioId, claimPersonIds: [state.studio.activeProductions[0]!.cast.lead],
  plans: [{ traceKey: '209-explicit-director', commands }], horizonEndWeek: state.market.tick + 1,
  preparationWork: 0, limits: { work: 200000, span: 220, alternatives: 1024 } }
}

function observed(value: StartedOwnerReplayInput<Production>) {
  const before = clone(value), order: string[] = []
  const assignments: { id: string; directorId: string }[] = []
  const schedules: string[] = [], clears: string[] = []
  const arrivals: { before: (string | undefined)[]; after: (string | undefined)[] }[] = []
  const sweeps: { week: number; ids: string[]; before: number[]; after: number[] }[] = []
  const assign = operationsModule.assignShootingDirector, schedule = operationsModule.scheduleShootingTake
  const clear = operationsModule.clearSceneryLoadIn, arrival = operationsModule.arriveDueScenery
  const advance = operationsModule.advanceManagedProductions
  const assignSpy = vi.spyOn(operationsModule, 'assignShootingDirector').mockImplementation((...args) => {
    order.push('assign'); assignments.push({ id: args[1].id, directorId: args[2] })
    return assign(...args)
  })
  const scheduleSpy = vi.spyOn(operationsModule, 'scheduleShootingTake').mockImplementation((...args) => {
    order.push('schedule'); schedules.push(args[1])
    return schedule(...args)
  })
  const clearSpy = vi.spyOn(operationsModule, 'clearSceneryLoadIn').mockImplementation((...args) => {
    order.push('clear'); clears.push(args[1])
    return clear(...args)
  })
  const arrivalSpy = vi.spyOn(operationsModule, 'arriveDueScenery').mockImplementation((...args) => {
    order.push('arrival')
    const next = arrival(...args)
    arrivals.push({ before: args[0].workflows.map((row) => row.shootingTask?.status),
      after: next.workflows.map((row) => row.shootingTask?.status) })
    return next
  })
  const sweepSpy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
    order.push('sweep')
    const next = advance(...args)
    sweeps.push({ week: args[2], ids: args[1].map((row) => row.id),
      before: args[1].map((row) => row.remainingTicks), after: next.productions.map((row) => row.remainingTicks) })
    return next
  })
  try {
    const result = replayStartedProductionPlans(value)
    expect(value).toEqual(before)
    expect(result.preparationWork).toBeLessThanOrEqual(200000)
    expect(result.attempts).toHaveLength(1)
    return { result, attempt: result.attempts[0]!, order, assignments, schedules, clears, arrivals, sweeps }
  } finally {
    assignSpy.mockRestore(); scheduleSpy.mockRestore(); clearSpy.mockRestore()
    arrivalSpy.mockRestore(); sweepSpy.mockRestore()
  }
}

describe('P14B4 real locked-director replay commands', () => {
  it('assigns the actual locked director, settles due-at-call scenery, then schedules by ordinal before the real sweep', () => {
    const { state, production, week } = unassigned(), before = clone(state)
    // Non-vacuous ordering: scheduling this actual unassigned task is illegal.
    expect(() => applyActions(state, [{ kind: 'scheduleShootingTake', productionId: production.id }])).toThrow(/not ready/)
    const assigned = applyActions(state, [{ kind: 'assignShootingDirector', productionId: production.id,
      directorId: production.directorId }])
    // Hard fixture guard: actual geometry is due NOW; do not forge a trip or wait in the replay.
    expect(assigned.operations.workflows[0]?.shootingTask?.status).toBe('ready')
    expect(assigned.operations.workflows[0]?.blocker).toBeNull()
    const chosen = applyActions(assigned, [{ kind: 'scheduleShootingTake', productionId: production.id }])
    expect(chosen.operations.workflows[0]?.shootingTask?.status).toBe('scheduled')
    const real = tick(chosen)
    makeSave(assigned); makeSave(chosen); makeSave(real)
    const director: StartedProductionCommand = { week, ordinal: 0, productionId: production.id, kind: 'assignLockedDirector' }
    const schedule: StartedProductionCommand = { week, ordinal: 1, productionId: production.id, kind: 'scheduleTake' }
    // Reversed caller array must still honor the settled (week,ordinal) command law.
    const value = input(state, [schedule, director]), seen = observed(value)
    if (seen.attempt.kind !== 'complete') throw new Error('209 legal real director/schedule plan cut: ' + seen.attempt.reason)
    expect(seen.result.omissions).toEqual([])
    expect(seen.assignments).toEqual([{ id: production.id, directorId: production.directorId }])
    expect(seen.schedules).toEqual([production.id])
    expect(seen.clears).toEqual([])
    expect(seen.order).toEqual(['assign', 'arrival', 'schedule', 'arrival', 'sweep'])
    expect(seen.arrivals).toEqual([
      { before: ['blocked'], after: ['ready'] },
      { before: ['scheduled'], after: ['scheduled'] },
    ])
    expect(seen.sweeps).toEqual([{ week, ids: [production.id], before: [5], after: [4] }])
    const projected = seen.attempt.projection
    expect(projected.week).toBe(real.market.tick)
    expect(projected.productions).toEqual(real.studio.activeProductions)
    expect(projected.operations).toEqual(real.operations)
    expect(projected.sets).toEqual(real.sets)
    expect(projected.releaseAuthority).toEqual(real.releaseAuthority)
    expect(projected.completedBackgroundPathKeys).toEqual([])
    expect(projected.technology.productions.filter((row) => row.studioId === value.issuerId))
      .toEqual(real.technology.productions.filter((row) => row.studioId === value.issuerId))
    expect(projected.technology.productions.filter((row) => row.studioId !== value.issuerId))
      .toEqual(state.technology.productions.filter((row) => row.studioId !== value.issuerId))
    const commands = seen.attempt.provenance.filter((row) => row.kind === 'command')
    expect(commands.map((row) => row.command)).toEqual([director, schedule])
    expect(commands.every((row) => row.at.week === week)).toBe(true)
    expect(commands[0]!.at.step).toBeLessThan(commands[1]!.at.step)
    const actualRows = chosen.studioEvents.rows.filter((row) => row.seq >= state.studioEvents.nextSeq)
    expect(actualRows).toHaveLength(1)
    expect(actualRows[0]).toMatchObject({ kind: 'sceneryArrived', productionId: production.id, week })
    const ownerEvents = seen.attempt.provenance.filter((row) => row.kind === 'ownerEvent')
    expect(ownerEvents.map((row) => ({ week: row.ownerWeek, draft: row.draft })))
      .toEqual(actualRows.map(({ seq: _seq, week: ownerWeek, ...draft }) => ({ week: ownerWeek, draft })))
    expect(ownerEvents[0]!.at.week).toBe(week)
    expect(ownerEvents[0]!.at.step).toBeLessThan(commands[1]!.at.step)
    expect(seen.attempt.provenance.filter((row) => row.kind === 'firstTake'))
      .toEqual([{ kind: 'firstTake', at: { week: week + 1, step: 0 }, productionId: production.id }])
    expect(real.firstTakes.filter((row) => row.productionId === production.id)).toHaveLength(1)
    expect(seen.attempt.trace.fixedHoldReplacements).toEqual([])
    expect(seen.attempt.trace.additionalHolds).toEqual([])
    expect(state).toEqual(before)
    // Take lies exactly at H; no capacity/count or ACHIEVABLE conclusion follows.
  })

  it('refuses grandfather-only clear on the genuine current unassigned workflow before lower clear or sweep', () => {
    const { state, production, workflow, week } = unassigned(), before = clone(state)
    expect(workflow.bindings.requiresSetBinding).toBe(true)
    expect(sceneryLoadInDecision(state, workflow, week).kind).toBe('none')
    expect(() => applyActions(state, [{ kind: 'clearSceneryLoadIn', productionId: production.id }]))
      .toThrow(/no active scenery-load-in blocker/)
    const command: StartedProductionCommand = { week, ordinal: 0, productionId: production.id,
      kind: 'clearGrandfatheredScenery' }
    const seen = observed(input(state, [command]))
    if (seen.attempt.kind !== 'cut') throw new Error('209 non-grandfather clear became a complete trace')
    expect(seen.attempt.reason).toBe('commandRefused')
    expect(seen.attempt.through.week).toBe(week)
    expect(seen.attempt.detail.length).toBeGreaterThan(0)
    expect(seen.order).toEqual([])
    expect(seen.clears).toEqual([])
    expect(seen.sweeps).toEqual([])
    expect(seen.attempt.provenance.filter((row) => row.kind !== 'command')).toEqual([])
    expect(seen.result.omissions.length).toBeGreaterThan(0)
    expect(state).toEqual(before)
    expect(state.operations.workflows[0]?.shootingTask?.status).toBe('unassigned')
  })
})
