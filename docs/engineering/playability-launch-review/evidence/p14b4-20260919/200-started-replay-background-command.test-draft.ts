// INERT / UNEXECUTED. Intended tests/p14b4-started-replay-background-command.test.ts.
// Independent193 supplement to FIXED182; contracts137/132/169/176/186.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import { replayStartedProductionPlans, type StartedOwnerReplayInput,
  type StartedProductionCommand, type StartedReplayProjection } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production } from '../src/core/types.js'
import { commissionPayload, contractedByRole, foundedStudio, greenlightA, projectById,
  remainingPackage, SEED, writingIds, type Scenario } from './_p04a2WriterCreditFixtures.js'
import { operationsStudio, productionPayload } from './contracts/_contractFixtures.js'

const clone = <T>(value: T): T => structuredClone(value)
const company = (rows: readonly Production[]) => new Set(rows.flatMap((row) =>
  [row.directorId, ...Object.values(row.cast), ...row.craftIds]))
const readyCache = new Map<'take' | 'release', GameState>()

function supported(state: GameState) {
  // Actual root conjunctions, NOT a repair or an availability attestation.
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

function freshScenario(): Scenario {
  // Preserve the historical-control founding/action recipe, but initialize the
  // FRESH industry at its actual week-zero boundary, before any script ticks.
  let state = foundedStudio(SEED)
  expect(state.market.tick).toBe(0)
  state = initializeHollywood(state, 'fresh')
  expect(state.hollywood).toMatchObject({ origin: 'fresh', originWeek: 0 })
  makeSave(state)
  state = applyActions(state, [{ kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }])
  const writers = contractedByRole(state, 'writer')
  expect(writers).toHaveLength(1)
  const writerId = writers[0]!.id, conceptA = state.concepts[0]!, conceptB = state.concepts[1]!
  expect(conceptB.id).not.toBe(conceptA.id)
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(conceptA, writerId) }])
  const projectAId = state.scriptDevelopment.projects[0]!.id
  expect(projectById(state, projectAId).status).toBe('drafting')
  expect(writingIds(state)).toContain(writerId)
  state = tick(state)
  expect(projectById(state, projectAId).status).toBe('review')
  state = applyActions(state, [{ kind: 'acceptScript', projectId: projectAId }])
  expect(projectById(state, projectAId)).toMatchObject({ status: 'ready', writerId, reservation: null, dueWeek: null })
  expect(writingIds(state)).not.toContain(writerId)
  const readyOnly = state
  const deadlock = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(conceptB, writerId) }])
  const projectB = deadlock.scriptDevelopment.projects.find((row) => row.conceptId === conceptB.id)
  assert.ok(projectB)
  expect(projectB.status).toBe('drafting')
  expect(writingIds(deadlock)).toContain(writerId)
  makeSave(readyOnly); makeSave(deadlock)
  return { readyOnly, deadlock, writerId, projectAId, projectBId: projectB.id,
    conceptA, conceptB, packageA: remainingPackage(deadlock, conceptA) }
}

function readyForTake(): GameState {
  const cached = readyCache.get('take')
  if (cached) return clone(cached)
  //178's real historical-control founding route, stopping BEFORE scheduleTake.
  let state = initializeHollywood(operationsStudio('p13a-production-consumer'), 'fresh')
  expect(state.scriptDevelopment.mode).toBe('legacy')
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, 0) }])
  expect(state.studio.activeProductions).toHaveLength(1)
  const id = state.studio.activeProductions[0]!.id
  for (let guard = 0; guard < 20 && state.studio.activeProductions[0]?.remainingTicks !== 5; guard++) state = tick(state)
  const production = state.studio.activeProductions[0]!
  expect(production.remainingTicks).toBe(5)
  state = applyActions(state, [{ kind: 'assignShootingDirector', productionId: id, directorId: production.directorId }])
  for (let guard = 0; guard < 8 && state.operations.workflows[0]?.shootingTask?.status !== 'ready'; guard++) state = tick(state)
  expect(state.market.tick).toBe(4)
  expect(state.studio.activeProductions[0]?.remainingTicks).toBe(5)
  expect(state.operations.workflows[0]?.shootingTask?.status).toBe('ready')
  expect(state.operations.workflows[0]?.blocker).toBeNull()
  expect(state.firstTakes.filter((row) => row.productionId === id)).toEqual([])
  supported(state)
  readyCache.set('take', clone(state))
  return state
}

function readyForRelease(): GameState {
  const cached = readyCache.get('release')
  if (cached) return clone(cached)
  let state = readyForTake()
  const id = state.studio.activeProductions[0]!.id
  state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: id }])
  for (let guard = 0; guard < 20 && state.studio.activeProductions[0]?.remainingTicks !== 1; guard++) state = tick(state)
  expect(state.studio.activeProductions).toHaveLength(1)
  expect(state.studio.activeProductions[0]?.id).toBe(id)
  expect(state.studio.activeProductions[0]?.remainingTicks).toBe(1)
  expect(state.operations.workflows[0]?.phase).toBe('releaseReady')
  expect(state.releaseAuthority.commitments).toEqual([])
  expect(state.firstTakes.filter((row) => row.productionId === id)).toHaveLength(1)
  supported(state)
  readyCache.set('release', clone(state))
  return state
}

function input(state: GameState, weeks: number, commands: readonly StartedProductionCommand[] = []): StartedOwnerReplayInput<Production> {
  assert.ok(state.hollywood)
  return { source: { technology: state.technology, market: { tick: state.market.tick },
    placement: state.placement, property: state.property, hollywood: state.hollywood,
    operations: state.operations, sets: state.sets, releaseAuthority: state.releaseAuthority,
    scriptDevelopment: state.scriptDevelopment, castingSessions: state.castingSessions,
    construction: state.construction, physicalPlans: state.physicalPlans, productionQueue: state.productionQueue,
    founding: state.founding, firstTakes: state.firstTakes, concepts: state.concepts,
    studio: { activeProductions: state.studio.activeProductions } },
  issuerId: state.hollywood.playerStudioId,
  claimPersonIds: state.studio.activeProductions.map((row) => row.cast.lead),
  plans: [{ traceKey: '193-real-owner-commands', commands }], horizonEndWeek: state.market.tick + weeks,
  preparationWork: 0, limits: { work: 200000, span: 220, alternatives: 1024 } }
}

function observed(value: StartedOwnerReplayInput<Production>) {
  const before = clone(value), original = operationsModule.advanceManagedProductions
  const calls: { week: number; ids: string[]; before: number[]; after: number[]; admitted: string[] }[] = []
  const spy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
    const next = original(...args)
    calls.push({ week: args[2], ids: args[1].map((row) => row.id), before: args[1].map((row) => row.remainingTicks),
      after: next.productions.map((row) => row.remainingTicks), admitted: [...next.admittedReleaseIds] })
    return next
  })
  try {
    const result = replayStartedProductionPlans(value)
    expect(value).toEqual(before)
    expect(result.preparationWork).toBeLessThanOrEqual(200000)
    expect(result.attempts).toHaveLength(1)
    return { result, attempt: result.attempts[0]!, calls }
  } finally { spy.mockRestore() }
}

function complete(value: StartedOwnerReplayInput<Production>) {
  const seen = observed(value)
  if (seen.attempt.kind !== 'complete') throw new Error(`193 actual replay cut: ${seen.attempt.reason}: ${seen.attempt.detail}`)
  expect(seen.result.omissions).toEqual([])
  return { ...seen, attempt: seen.attempt }
}

function projection(projection: StartedReplayProjection<Production>, original: GameState, real: GameState,
  completedBackgroundPathKeys: readonly string[] = []) {
  assert.ok(original.hollywood)
  const own = original.hollywood.playerStudioId
  expect(projection.week).toBe(real.market.tick)
  expect(projection.productions).toEqual(real.studio.activeProductions)
  expect(projection.operations).toEqual(real.operations)
  expect(projection.sets).toEqual(real.sets)
  expect(projection.releaseAuthority).toEqual(real.releaseAuthority)
  expect([...projection.completedBackgroundPathKeys].sort()).toEqual([...completedBackgroundPathKeys].sort())
  expect(projection.technology.productions.filter((row) => row.studioId === own))
    .toEqual(real.technology.productions.filter((row) => row.studioId === own))
  expect(projection.technology.productions.filter((row) => row.studioId !== own))
    .toEqual(original.technology.productions.filter((row) => row.studioId !== own))
  expect(projection).not.toHaveProperty('firstTakes')
  expect(projection).not.toHaveProperty('films')
}

describe('P14B4 started replay — real background and explicit command supplement', () => {
  it('releases original due-writing holds BEFORE sweep while new-start A keeps a DIFFERENT slot through later 8→7', () => {
    const scenario = freshScenario()
    //200: real fresh origin at week0, then the unchanged commission/tick recipe.
    // The original193/194 late-init failure remains archived in198.
    const state = applyActions(scenario.deadlock, [greenlightA(scenario)])
    supported(state)
    assert.ok(state.hollywood)
    const own = state.hollywood.playerStudioId, week = state.market.tick
    const a = state.studio.activeProductions[0]!, aProject = projectById(state, scenario.projectAId)
    const b = projectById(state, scenario.projectBId), workflow = state.operations.workflows[0]!
    expect(state.studio.activeProductions).toHaveLength(1)
    expect(aProject.status).toBe('inProduction')
    expect(aProject.productionId).toBe(a.id)
    expect(a.conceptId).toBe(aProject.conceptId)
    expect(a.writerId).toBe(scenario.writerId)
    expect(a.startTick).toBe(week)
    expect(a.remainingTicks).toBe(8)
    expect(b.status).toBe('drafting')
    expect(b.dueWeek).toBe(week + 1)
    expect(scriptProjectWriterIds(b)).toEqual([scenario.writerId])
    assert.ok(b.reservation)
    expect(workflow.productionId).toBe(a.id)
    expect(workflow.reservations).toHaveLength(1)
    const slotA = workflow.reservations[0]!, slotB = b.reservation
    expect(slotA.capability).toBe('development-casting')
    expect(slotA.phase).toBe('development')
    expect(slotA.facilityId).toBe(slotB.facilityId)
    expect(slotA.slot).not.toBe(slotB.slot)
    expect(company([a]).has(scenario.writerId)).toBe(false)
    expect(company([a]).size).toBe(5)
    const before = clone(state), once = tick(state), twice = tick(once)
    expect(projectById(once, b.id).status).toBe('review')
    expect(projectById(once, b.id).reservation).toBeNull()
    expect(once.studio.activeProductions[0]?.remainingTicks).toBe(8)
    expect(twice.studio.activeProductions[0]?.remainingTicks).toBe(7)
    expect(once.operations.workflows[0]?.reservations).toEqual([slotA])
    expect(twice.operations.workflows[0]?.reservations).toEqual([{ ...slotA, phase: 'preProduction' }])
    expect(twice.operations.workflows[0]?.phase).toBe('preProduction')
    makeSave(once); makeSave(twice)
    const value = input(state, 2), { result, attempt, calls } = complete(value)
    const pathA = JSON.stringify(['production', own, a.id]), pathB = JSON.stringify(['screenplay', own, b.id])
    projection(attempt.projection, state, twice, [pathB])
    expect(calls).toEqual([
      { week, ids: [a.id], before: [8], after: [8], admitted: [] },
      { week: week + 1, ids: [a.id], before: [8], after: [7], admitted: [] },
    ])
    expect(attempt.trace.paths.map((row) => row.pathKey).sort()).toEqual([pathA, pathB,
      ...state.sets.filter((row) => row.status === 'standing').map((row) => JSON.stringify(['setMount', own, row.id]))].sort())
    expect(attempt.trace.paths.find((row) => row.pathKey === pathB)?.kind).toBe('jointTraceBackground')
    expect(attempt.trace.paths.some((row) => row.pathKey === JSON.stringify(['screenplay', own, aProject.id]))).toBe(false)
    for (const path of attempt.trace.paths) expect(path.ownerFactRefs.length).toBeGreaterThan(0)
    const picture = attempt.trace.paths.find((row) => row.pathKey === pathA)
    assert.ok(picture && picture.kind === 'jointTracePicture')
    expect(picture.firstTake).toBeNull()
    expect(picture.personRelease).toBeNull()
    const completions = attempt.provenance.filter((row) => row.kind === 'backgroundCompleted')
    expect(completions).toHaveLength(1)
    const completion = completions[0]!
    expect(completion).toMatchObject({ kind: 'backgroundCompleted', pathKey: pathB, owner: 'screenplay', dueWeek: week + 1 })
    expect(completion.at.week).toBe(week)
    const sweeps = attempt.provenance.filter((row) => row.kind === 'sweepStarted')
    expect(sweeps).toHaveLength(2)
    expect(sweeps[0]!.at.week).toBe(week)
    expect(completion.at.step).toBeLessThan(sweeps[0]!.at.step)
    for (const sweep of sweeps) expect(sweep.externalSlotKeys).not.toContain(`${slotB.facilityId}:${slotB.slot}`)
    const backgroundHolds = result.fixedHolds.filter((row) => row.ownerPathKey === pathB)
    expect(backgroundHolds).toHaveLength(2)
    expect(backgroundHolds.map((row) => row.subject)).toEqual(expect.arrayContaining([
      { kind: 'person', personId: scenario.writerId },
      { kind: 'resource', resourceKey: JSON.stringify(['facility', own, slotB.facilityId]), slot: slotB.slot },
    ]))
    expect(attempt.trace.fixedHoldReplacements).toHaveLength(2)
    for (const hold of backgroundHolds) {
      expect(hold.from).toEqual({ week, step: 0 })
      expect(hold.until).toEqual({ week: week + 2, step: 0 })
      expect(attempt.trace.fixedHoldReplacements.filter((row) => row.holdId === hold.holdId))
        .toEqual([{ holdId: hold.holdId, newUntil: completion.at }])
    }
    const companyHolds = result.fixedHolds.filter((row) => row.ownerPathKey === pathA && row.subject.kind === 'person')
    expect(companyHolds).toHaveLength(5)
    expect(companyHolds.flatMap((row) => row.subject.kind === 'person' ? [row.subject.personId] : []).sort())
      .toEqual([...company([a])].sort())
    for (const hold of result.fixedHolds.filter((row) => row.ownerPathKey === pathA)) {
      expect(hold.until).toEqual({ week: week + 2, step: 0 })
      expect(attempt.trace.fixedHoldReplacements.some((row) => row.holdId === hold.holdId)).toBe(false)
    }
    expect(attempt.trace.additionalHolds).toEqual([])
    expect(attempt.provenance.filter((row) => row.kind === 'firstTake')).toEqual([])
    expect(state).toEqual(before)
  })

  it('executes an explicit scheduleTake only from actual Ready and matches the real action + next tick', () => {
    const state = readyForTake(), id = state.studio.activeProductions[0]!.id, week = state.market.tick
    const command: StartedProductionCommand = { week, ordinal: 0, productionId: id, kind: 'scheduleTake' }
    const chosen = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: id }]), real = tick(chosen)
    expect(chosen.operations.workflows[0]?.shootingTask?.status).toBe('scheduled')
    const { attempt, calls } = complete(input(state, 1, [command]))
    projection(attempt.projection, state, real)
    expect(calls).toEqual([{ week, ids: [id], before: [5], after: [4], admitted: [] }])
    const commands = attempt.provenance.filter((row) => row.kind === 'command')
    expect(commands).toHaveLength(1)
    expect(commands[0]!.command).toEqual(command)
    const sweep = attempt.provenance.find((row) => row.kind === 'sweepStarted')!
    expect(commands[0]!.at.week).toBe(week)
    expect(commands[0]!.at.step).toBeLessThan(sweep.at.step)
    expect(attempt.provenance.filter((row) => row.kind === 'firstTake'))
      .toEqual([{ kind: 'firstTake', at: { week: week + 1, step: 0 }, productionId: id }])
    expect(real.firstTakes.filter((row) => row.productionId === id)).toHaveLength(1)
    // Take is exactly H; this case makes no count/feasibility-certification claim.
  })

  it('refuses a release command in the same Shooting phase after a lawful schedule choice, before ANY sweep', () => {
    const state = readyForTake(), id = state.studio.activeProductions[0]!.id, week = state.market.tick
    const scheduled = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: id }])
    expect(() => applyActions(scheduled, [{ kind: 'commitPictureToRelease', productionId: id }])).toThrow(/not Release Ready/)
    const schedule: StartedProductionCommand = { week, ordinal: 0, productionId: id, kind: 'scheduleTake' }
    const bad: StartedProductionCommand = { week, ordinal: 1, productionId: id, kind: 'commitRelease' }
    const { attempt, calls, result } = observed(input(state, 1, [schedule, bad]))
    if (attempt.kind !== 'cut') throw new Error('unlawful same-phase commit was replayed as complete')
    expect(attempt.reason).toBe('commandRefused')
    expect(attempt.detail.length).toBeGreaterThan(0)
    expect(attempt.through.week).toBe(week)
    expect(attempt.provenance.filter((row) => row.kind === 'command').map((row) => row.command)).toContainEqual(schedule)
    expect(attempt.provenance.filter((row) => row.kind === 'releaseAdmitted' || row.kind === 'firstTake' || row.kind === 'sweepStarted')).toEqual([])
    expect(calls).toEqual([])
    expect(result.omissions.length).toBeGreaterThan(0)
    expect(state.operations.workflows[0]?.shootingTask?.status).toBe('ready')
    expect(state.releaseAuthority.commitments).toEqual([])
  })

  it('resolves a formerly valid ID against CURRENT branch state after real committed release, without resurrection', () => {
    const state = readyForRelease(), id = state.studio.activeProductions[0]!.id, week = state.market.tick
    const committed = applyActions(state, [{ kind: 'commitPictureToRelease', productionId: id }]), real = tick(committed)
    expect(committed.releaseAuthority.commitments).toHaveLength(1)
    expect(real.studio.activeProductions).toEqual([])
    expect(real.releaseAuthority.commitments).toEqual([])
    expect(() => applyActions(real, [{ kind: 'commitPictureToRelease', productionId: id }])).toThrow(/no active production/)
    makeSave(real)
    const first: StartedProductionCommand = { week, ordinal: 0, productionId: id, kind: 'commitRelease' }
    const baseline = complete(input(state, 1, [first]))
    projection(baseline.attempt.projection, state, real)
    expect(baseline.calls).toEqual([{ week, ids: [id], before: [1], after: [0], admitted: [id] }])
    const releases = baseline.attempt.provenance.filter((row) => row.kind === 'releaseAdmitted')
    expect(releases).toHaveLength(1)
    expect(releases[0]!.productionId).toBe(id)
    expect(releases[0]!.at.week).toBe(week) // post-sweep, before visible increment
    const picture = baseline.attempt.trace.paths.find((row) => row.kind === 'jointTracePicture')
    assert.ok(picture && picture.kind === 'jointTracePicture')
    expect(picture.firstTake).toBeNull() // real already-filmed source, not another future credit
    expect(picture.personRelease).toEqual(releases[0]!.at)
    const own = input(state, 1).issuerId, path = JSON.stringify(['production', own, id])
    const held = baseline.result.fixedHolds.filter((row) => row.ownerPathKey === path && row.subject.kind === 'person')
    expect(held).toHaveLength(company(state.studio.activeProductions).size)
    for (const hold of held) expect(baseline.attempt.trace.fixedHoldReplacements.filter((row) => row.holdId === hold.holdId))
      .toEqual([{ holdId: hold.holdId, newUntil: releases[0]!.at }])
    const again: StartedProductionCommand = { week: week + 1, ordinal: 0, productionId: id, kind: 'commitRelease' }
    const stale = observed(input(state, 2, [first, again]))
    if (stale.attempt.kind !== 'cut') throw new Error('released production was resurrected for a later command')
    expect(stale.attempt.reason).toBe('commandRefused')
    expect(stale.attempt.through.week).toBe(week + 1)
    expect(stale.attempt.detail.length).toBeGreaterThan(0)
    expect(stale.calls).toEqual(baseline.calls) // no second owner reuse of original production
    expect(stale.attempt.provenance.filter((row) => row.kind === 'releaseAdmitted')).toEqual(releases)
    expect(stale.attempt.provenance.filter((row) => row.kind === 'firstTake')).toEqual([])
    expect(stale.result.omissions.length).toBeGreaterThan(0)
    expect(state.studio.activeProductions[0]?.remainingTicks).toBe(1)
    expect(state.releaseAuthority.commitments).toEqual([])
  })
})
