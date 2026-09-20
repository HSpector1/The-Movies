// Installed from frozen253 after parent full read and independent254 KEEP; original inert provenance retained.
// INERT / UNEXECUTED. Intended tests/p14b4-ready-replay-command.test.ts.
//253: independent240 command-boundary supplement; immutable244 remains unchanged.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import * as admissionModule from '../src/core/productionAdmission.js'
import { replayReadyProductionPlans, type ReadyOwnerReplayInput } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import * as scriptsModule from '../src/core/scriptDevelopment.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production, StudioOperations } from '../src/core/types.js'
import { commissionPayload, contractedByRole, foundedStudio, projectById,
  remainingPackage, SEED, writingIds } from './_p04a2WriterCreditFixtures.js'

type Choice = ReadyOwnerReplayInput['plans'][number]['readyChoice']
const clone = <T>(value: T): T => structuredClone(value)
const company = (row: Readonly<{ directorId: string; cast: Readonly<Production['cast']>; craftIds: readonly string[] }>) =>
  [row.directorId, ...Object.values(row.cast), ...row.craftIds]

function supported(state: GameState, choice: Choice) {
  assert.ok(state.hollywood)
  const own = state.hollywood.playerStudioId
  expect(state.founding).toBeNull()
  expect(state.operations.mode).toBe('managed')
  expect(state.scriptDevelopment.mode).toBe('managed')
  expect(state.productionQueue).toEqual([])
  expect(state.physicalPlans.plans.filter((row) => row.studioId === own &&
    (row.status === 'queued' || row.status === 'held' || row.status === 'blocked'))).toEqual([])
  expect(state.construction.projects.filter((row) => row.status === 'building')).toEqual([])
  expect(state.placement.facilities.filter((row) => row.status === 'underConstruction')).toEqual([])
  expect(state.sets.filter((row) => row.status === 'under-construction')).toEqual([])
  expect(state.technology.projects.filter((row) => row.studioId === own && row.status === 'active')).toEqual([])
  expect(state.technology.adoptions.filter((row) => row.studioId === own &&
    row.cancelledWeek === null && row.operationalWeek === null)).toEqual([])
  const relevant = new Set([...state.studio.activeProductions.flatMap(company), ...company(choice)])
  for (const project of state.scriptDevelopment.projects) if (project.status === 'drafting' || project.status === 'rewriting') {
    for (const id of scriptProjectWriterIds(project)) relevant.add(id)
  }
  for (const business of state.hollywood.businesses.filter((row) => row.studioId !== own)) {
    expect(business.productions.flatMap(company).filter((id) => relevant.has(id))).toEqual([])
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

function baseReady() {
  // Same disclosed historical-control founding/action route as242/244; fresh at real0.
  let state = foundedStudio(SEED, { actor: 3, director: 1, craft: 1 })
  expect(state.market.tick).toBe(0)
  state = initializeHollywood(state, 'fresh')
  expect(state.hollywood).toMatchObject({ origin: 'fresh', originWeek: 0 })
  makeSave(state)
  state = applyActions(state, [{ kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }])
  expect(contractedByRole(state, 'writer')).toHaveLength(1)
  const writerId = contractedByRole(state, 'writer')[0]!.id, concept = state.concepts[0]!
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(concept, writerId) }])
  const projectId = state.scriptDevelopment.projects[0]!.id
  expect(projectById(state, projectId)).toMatchObject({ status: 'drafting', dueWeek: 1 })
  state = tick(state)
  expect(projectById(state, projectId).status).toBe('review')
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  expect(projectById(state, projectId)).toMatchObject({ status: 'ready', productionId: null, dueWeek: null, reservation: null })
  expect(projectById(state, projectId).assessment).not.toBeNull()
  expect(state.studio.activeProductions).toEqual([])
  expect(writingIds(state)).toEqual([])
  expect(state.promises).toEqual([])
  const payload = { projectId, ...remainingPackage(state, concept) }
  supported(state, payload)
  return { state, payload, writerId }
}


type Command = ReadyOwnerReplayInput['plans'][number]['commands'][number]

function input(state: GameState, choice: Choice, commands: readonly Command[] = []): ReadyOwnerReplayInput {
  assert.ok(state.hollywood)
  return { source: state, issuerId: state.hollywood.playerStudioId, claimPersonIds: [choice.cast.lead],
    plans: [{ traceKey: '253-ready-command', readyChoice: choice, commands }],
    horizonEndWeek: state.market.tick + 1, preparationWork: 0,
    limits: { work: 200000, span: 220, alternatives: 1024 } }
}

function watched<T>(value: ReadyOwnerReplayInput, read: (input: ReadyOwnerReplayInput) => T) {
  const before = clone(value), order: string[] = []
  const schedules: { id: string; before: StudioOperations }[] = []
  const originalAdd = operationsModule.addManagedProductionWorkflow
  const originalLink = scriptsModule.linkScriptProjectToProduction
  const originalSchedule = operationsModule.scheduleShootingTake
  const header = vi.spyOn(admissionModule, 'requireGreenlightHeader')
  const staffing = vi.spyOn(admissionModule, 'resolveGreenlightStaffing')
  const add = vi.spyOn(operationsModule, 'addManagedProductionWorkflow').mockImplementation((...args) => {
    order.push('admit')
    return originalAdd(...args)
  })
  const link = vi.spyOn(scriptsModule, 'linkScriptProjectToProduction').mockImplementation((...args) => {
    order.push('link')
    return originalLink(...args)
  })
  const schedule = vi.spyOn(operationsModule, 'scheduleShootingTake').mockImplementation((...args) => {
    order.push('schedule')
    schedules.push({ id: args[1], before: clone(args[0]) })
    return originalSchedule(...args)
  })
  const arrival = vi.spyOn(operationsModule, 'arriveDueScenery')
  const sweep = vi.spyOn(operationsModule, 'advanceManagedProductions')
  try {
    const result = read(value)
    return { result, order, schedules, counts: { header: header.mock.calls.length,
      staffing: staffing.mock.calls.length, add: add.mock.calls.length, link: link.mock.calls.length,
      schedule: schedule.mock.calls.length, arrival: arrival.mock.calls.length, sweep: sweep.mock.calls.length } }
  } finally {
    header.mockRestore(); staffing.mockRestore(); add.mockRestore(); link.mockRestore()
    schedule.mockRestore(); arrival.mockRestore(); sweep.mockRestore()
    expect(value).toEqual(before)
  }
}

function fixture() {
  const { state, payload } = baseReady()
  const choice: Choice = { projectId: payload.projectId, directorId: payload.directorId,
    cast: payload.cast, craftIds: payload.craftIds }
  return { state, payload, choice }
}

describe('P14B4 Ready replay — explicit command boundary', () => {
  it('admits first, resolves the Ready-project target to its real new clock, then preserves the actual Development schedule refusal without sweeping', () => {
    const { state, payload, choice } = fixture(), sourceBefore = clone(state)
    const immediate = applyActions(state, [{ kind: 'greenlightScriptProject', production: payload }])
    makeSave(immediate)
    expect(immediate.studio.activeProductions).toHaveLength(1)
    const production = immediate.studio.activeProductions[0]!, beforeAction = clone(immediate)
    expect(production.startTick).toBe(state.market.tick)
    expect(production.remainingTicks).toBe(8)
    expect(immediate.operations.workflows[0]).toMatchObject({
      productionId: production.id, phase: 'development', shootingTask: null, blocker: null,
    })
    const message = `applyActions: scheduleShootingTake rejected — productionId "${production.id}" shooting task is not ready`
    expect(() => applyActions(immediate, [{ kind: 'scheduleShootingTake', productionId: production.id }])).toThrow(message)
    expect(immediate).toEqual(beforeAction)
    const command: Command = { week: state.market.tick, ordinal: 1, kind: 'scheduleTake', readyProjectId: payload.projectId }
    const seen = watched(input(state, choice, [command]), replayReadyProductionPlans)
    expect(seen.result.preparationWork).toBeLessThanOrEqual(200000)
    expect(seen.result.attempts).toHaveLength(1)
    const attempt = seen.result.attempts[0]!
    if (attempt.kind !== 'cut') throw new Error('253 early Development schedule produced a complete trace')
    expect(attempt.reason).toBe('commandRefused')
    expect(attempt.detail).toContain(message)
    expect(attempt.through.week).toBe(state.market.tick)
    expect(attempt.provenance.filter((row) => row.kind === 'readyAdmitted')).toEqual([
      { kind: 'readyAdmitted', at: { week: state.market.tick, step: 1 },
        projectId: payload.projectId, productionId: production.id },
    ])
    expect(attempt.provenance.filter((row) => row.kind === 'sweepStarted')).toEqual([])
    expect(attempt).not.toHaveProperty('projection')
    expect(attempt).not.toHaveProperty('trace')
    expect(seen.order).toEqual(['admit', 'link', 'schedule'])
    expect(seen.schedules).toEqual([{ id: production.id, before: immediate.operations }])
    expect(seen.counts.add).toBe(1)
    expect(seen.counts.link).toBe(1)
    expect(seen.counts.schedule).toBe(1)
    expect(seen.counts.arrival).toBe(0)
    expect(seen.counts.sweep).toBe(0)
    expect(seen.result.omissions.length).toBeGreaterThan(0)
    expect(state).toEqual(sourceBefore)
    expect(state.studio.activeProductions).toEqual([])
    expect(projectById(state, payload.projectId)).toMatchObject({ status: 'ready', productionId: null })
  })

  it('rejects Ready admission at H==now as invalid input before owner calls, not a zero-duration admitted picture', () => {
    const { state, choice } = fixture(), base = input(state, choice)
    const seen = watched({ ...base, horizonEndWeek: state.market.tick }, (value) =>
      expect(() => replayReadyProductionPlans(value)).toThrow(Error))
    expect(seen.order).toEqual([])
    expect(seen.schedules).toEqual([])
    expect(seen.counts).toEqual({ header: 0, staffing: 0, add: 0, link: 0, schedule: 0, arrival: 0, sweep: 0 })
  })

  it('reserves source-now ordinal0 for admission and rejects an ordinary Ready-target command in that slot before owner calls', () => {
    const { state, choice } = fixture()
    const command: Command = { week: state.market.tick, ordinal: 0, kind: 'scheduleTake', readyProjectId: choice.projectId }
    const seen = watched(input(state, choice, [command]), (value) =>
      expect(() => replayReadyProductionPlans(value)).toThrow(Error))
    expect(seen.order).toEqual([])
    expect(seen.schedules).toEqual([])
    expect(seen.counts).toEqual({ header: 0, staffing: 0, add: 0, link: 0, schedule: 0, arrival: 0, sweep: 0 })
  })
})
