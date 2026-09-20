// Installed from independently frozen182; original inert provenance below retained unchanged.
// INERT / UNEXECUTED. Intended tests/p14b4-started-owner-replay.test.ts.
//137 API;169 endpoint correction; actual178/179 fixture proof and180/181 KEEP.
import assert from 'node:assert/strict'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import * as technologyModule from '../src/core/technologyProduction.js'
import * as setupModule from '../src/core/productionSetup.js'
import { productionCompanyTalentIds } from '../src/core/productionPeople.js'
import { searchPromiseCapacityTraces, type Boundary, type Hold,
  type JointTraceCapacityInput } from '../src/core/promiseCapacityKernel.js'
import { replayStartedProductionPlans, type StartedOwnerReplayInput,
  type StartedOwnerSource, type StartedPicture, type StartedReplayProjection } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import { sceneryLoadInDecision } from '../src/core/sceneryLoadIn.js'
import { scriptProjectWriterIds, scriptWorkDueAt } from '../src/core/scriptDevelopment.js'
import { castingWorkDueAt } from '../src/core/castingSessions.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production, ScriptProject, CastingSession } from '../src/core/types.js'
import { operationsStudio, productionPayload } from './contracts/_contractFixtures.js'

const clone = <T>(value: T): T => structuredClone(value)
const cache = new Map<1 | 2, GameState>()

function assertSupportedFacts(state: GameState) {
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
  const relevant = productionCompanyTalentIds(state.studio.activeProductions)
  for (const project of state.scriptDevelopment.projects) {
    if (project.status === 'drafting' || project.status === 'rewriting') {
      for (const id of scriptProjectWriterIds(project)) relevant.add(id)
    }
  }
  for (const business of state.hollywood.businesses.filter((row) => row.studioId !== own)) {
    expect([...productionCompanyTalentIds(business.productions)].filter((id) => relevant.has(id))).toEqual([])
    for (const ordinal of business.activeScriptOrdinals) {
      const project = business.development.projects[ordinal]
      const costs = business.projects[ordinal]
      assert.ok(project && costs, 'actual indexed foreign project joins')
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
}

function scheduled(count: 1 | 2): GameState {
  const cached = cache.get(count)
  if (cached !== undefined) return clone(cached)
  // EXACT178 route: historical-control founding, real hires/industry/greenlights.
  // Managed operations / legacy development; no clock/cash/history mutation.
  let state = initializeHollywood(operationsStudio('p13a-production-consumer'), 'fresh')
  expect(state.scriptDevelopment.mode).toBe('legacy')
  for (let offset = 0; offset < count; offset++) state = applyActions(state,
    [{ kind: 'greenlight', production: productionPayload(state, offset) }])
  expect(state.studio.activeProductions).toHaveLength(count)
  const ids = state.studio.activeProductions.map((row) => row.id)
  for (let guard = 0; guard < 20 && !state.studio.activeProductions.every((row) => row.remainingTicks === 5); guard++) state = tick(state)
  expect(state.studio.activeProductions.map((row) => row.remainingTicks)).toEqual(Array(count).fill(5))
  for (const id of ids) {
    const production = state.studio.activeProductions.find((row) => row.id === id)!
    state = applyActions(state, [{ kind: 'assignShootingDirector', productionId: id, directorId: production.directorId }])
  }
  const ready = () => ids.every((id) => state.operations.workflows.find((row) => row.productionId === id)?.shootingTask?.status === 'ready')
  for (let guard = 0; guard < 8 && !ready(); guard++) {
    expect(state.studio.activeProductions.map((row) => row.remainingTicks)).toEqual(Array(count).fill(5))
    state = tick(state)
  }
  expect(ready()).toBe(true)
  const week = state.market.tick
  for (const id of ids) state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: id }])
  expect(state.market.tick).toBe(week)
  expect(week).toBe(4) // qualified180 reached witness, not a restamped clock
  expect(state.operations.workflows).toHaveLength(count)
  expect(new Set(state.studio.activeProductions.flatMap((row) => Object.values(row.cast))).size).toBe(3 * count)
  expect(productionCompanyTalentIds(state.studio.activeProductions).size).toBe(5 * count)
  for (const production of state.studio.activeProductions) {
    const workflow = state.operations.workflows.find((row) => row.productionId === production.id)!
    expect(production.startTick).toBeLessThan(week)
    expect(workflow.phase).toBe('shooting')
    expect(workflow.shootingTask?.status).toBe('scheduled')
    expect(workflow.blocker).toBeNull()
    expect(workflow.bindings.stageFacilityId).not.toBeNull()
    expect(workflow.bindings.setId).not.toBeNull()
    expect(sceneryLoadInDecision(state, workflow, week).kind).toBe('none')
    expect(state.firstTakes.filter((row) => row.productionId === production.id)).toEqual([])
  }
  assertSupportedFacts(state)
  makeSave(state)
  cache.set(count, clone(state))
  return state
}

function source<P extends StartedPicture>(state: GameState, productions: readonly P[]): StartedOwnerSource<P> {
  return { technology: state.technology, market: { tick: state.market.tick },
    placement: state.placement, property: state.property, hollywood: state.hollywood,
    operations: state.operations, sets: state.sets, releaseAuthority: state.releaseAuthority,
    scriptDevelopment: state.scriptDevelopment, castingSessions: state.castingSessions,
    construction: state.construction, physicalPlans: state.physicalPlans,
    productionQueue: state.productionQueue, founding: state.founding, firstTakes: state.firstTakes,
    concepts: state.concepts, studio: { activeProductions: productions } }
}
function input<P extends StartedPicture>(state: GameState, productions: readonly P[], weeks: number,
  traceKey = 'empty-command-plan'): StartedOwnerReplayInput<P> {
  assert.ok(state.hollywood)
  return { source: source(state, productions), issuerId: state.hollywood.playerStudioId,
    claimPersonIds: state.studio.activeProductions.map((row) => row.cast.lead),
    plans: [{ traceKey, commands: [] }], horizonEndWeek: state.market.tick + weeks,
    preparationWork: 0, limits: { work: 200000, span: 220, alternatives: 1024 } }
}

function observed<P extends StartedPicture>(value: StartedOwnerReplayInput<P>) {
  const before = clone(value)
  const owner = operationsModule.advanceManagedProductions
  const calls: { week: number; ids: string[]; before: number[]; after: number[]; takes: string[] }[] = []
  const external = { arrival: 0, technology: 0, setup: 0 }
  const arrival = operationsModule.arriveDueScenery
  const technology = technologyModule.createProductionTechnologyPolicy
  const setup = setupModule.createProductionSetupRouteResolver
  const arrivalSpy = vi.spyOn(operationsModule, 'arriveDueScenery').mockImplementation((...args) => {
    external.arrival++
    return arrival(...args)
  })
  const technologySpy = vi.spyOn(technologyModule, 'createProductionTechnologyPolicy').mockImplementation((...args) => {
    external.technology++
    return technology(...args)
  })
  const setupSpy = vi.spyOn(setupModule, 'createProductionSetupRouteResolver').mockImplementation((...args) => {
    external.setup++
    return setup(...args)
  })
  const spy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
    const next = owner(...args) // actual original owner, never a result stub
    calls.push({ week: args[2], ids: args[1].map((row) => row.id),
      before: args[1].map((row) => row.remainingTicks), after: next.productions.map((row) => row.remainingTicks),
      takes: next.firstTakes.map((row) => row.id) })
    return next
  })
  try {
    const result = replayStartedProductionPlans(value)
    expect(value).toEqual(before)
    return { result, calls, external }
  } finally {
    spy.mockRestore(); arrivalSpy.mockRestore(); technologySpy.mockRestore(); setupSpy.mockRestore()
  }
}

function complete<P extends StartedPicture>(value: StartedOwnerReplayInput<P>) {
  const observedResult = observed(value)
  expect(observedResult.result.attempts).toHaveLength(1)
  const attempt = observedResult.result.attempts[0]!
  if (attempt.kind !== 'complete') throw new Error(`genuine fixture replay cut: ${attempt.reason}: ${attempt.detail}`)
  expect(observedResult.result.omissions).toEqual([])
  expect(attempt.trace.traceKey).toBe(value.plans[0]!.traceKey)
  expect(observedResult.result.preparationWork).toBeGreaterThanOrEqual(value.preparationWork)
  expect(observedResult.result.preparationWork).toBeLessThanOrEqual(200000)
  return { ...observedResult, attempt }
}

function checkProjection<P extends StartedPicture>(projection: StartedReplayProjection<P>,
  original: GameState, real: GameState) {
  assert.ok(original.hollywood)
  const own = original.hollywood.playerStudioId
  expect(projection.week).toBe(real.market.tick)
  expect(projection.productions.map((row) => row.id)).toEqual(real.studio.activeProductions.map((row) => row.id))
  expect(projection.operations).toEqual(real.operations)
  expect(projection.sets).toEqual(real.sets)
  expect(projection.releaseAuthority).toEqual(real.releaseAuthority)
  expect(projection.completedBackgroundPathKeys).toEqual([])
  expect(projection.technology.productions.filter((row) => row.studioId === own))
    .toEqual(real.technology.productions.filter((row) => row.studioId === own))
  // Foreign technology is intentionally not simulated by this player replay.
  expect(projection.technology.productions.filter((row) => row.studioId !== own))
    .toEqual(original.technology.productions.filter((row) => row.studioId !== own))
  expect(projection).not.toHaveProperty('firstTakes') // no fabricated durable receipts
}

describe('P14B4 genuine already-started owner replay — local first-take parity', () => {
  it.each([1, 2] as const)('replays all %i scheduled picture(s) in ONE real sweep to horizon5', (count) => {
    const state = scheduled(count), before = clone(state)
    const real = tick(state) // reference BEFORE installing owner observer
    const value = input(state, state.studio.activeProductions, 1)
    const { attempt, calls } = complete(value)
    const ids = state.studio.activeProductions.map((row) => row.id)
    expect(calls).toEqual([{ week: 4, ids, before: Array(count).fill(5),
      after: Array(count).fill(4), takes: ids }])
    checkProjection(attempt.projection, state, real)
    expect(attempt.projection.productions).toEqual(real.studio.activeProductions)
    expect(attempt.projection.sets).toEqual(state.sets)
    expect(attempt.provenance.filter((row) => row.kind === 'firstTake'))
      .toEqual(ids.map((productionId) => ({ kind: 'firstTake', at: { week: 5, step: 0 }, productionId })))
    expect(attempt.provenance.filter((row) => row.kind === 'ownerEvent')).toEqual([])
    expect(attempt.provenance.filter((row) => row.kind === 'releaseAdmitted')).toEqual([])
    for (const production of state.studio.activeProductions) {
      const take = real.firstTakes.filter((row) => row.productionId === production.id)
      expect(take).toHaveLength(1)
      expect(take[0]).toMatchObject({ week: 5, studioId: value.issuerId,
        directorId: production.directorId, cast: production.cast })
    }
    expect(state).toEqual(before)
    // The event is exactly H; no claim-credit/ACHIEVABLE assertion here.
  })

  it.each([1, 2] as const)('executes the NEXT real wrap/Post sweep for %i picture(s), not an invented horizon tail', (count) => {
    const state = scheduled(count), once = tick(state), twice = tick(once)
    const { attempt, calls } = complete(input(state, state.studio.activeProductions, 2))
    const ids = state.studio.activeProductions.map((row) => row.id)
    expect(calls).toEqual([
      { week: 4, ids, before: Array(count).fill(5), after: Array(count).fill(4), takes: ids },
      { week: 5, ids, before: Array(count).fill(4), after: Array(count).fill(3), takes: [] },
    ])
    checkProjection(attempt.projection, state, twice)
    expect(attempt.projection.productions).toEqual(twice.studio.activeProductions)
    const realEvents = twice.studioEvents.rows.filter((row) => row.seq >= once.studioEvents.nextSeq)
    const ownerEvents = attempt.provenance.filter((row) => row.kind === 'ownerEvent')
    expect(ownerEvents.map((row) => ({ week: row.ownerWeek, draft: row.draft })))
      .toEqual(realEvents.map(({ seq: _seq, week, ...draft }) => ({ week, draft })))
    expect(ownerEvents.every((row) => row.at.week === 5)).toBe(true)
    for (let index = 1; index < ownerEvents.length; index++) {
      expect(ownerEvents[index]!.at.step).toBeGreaterThan(ownerEvents[index - 1]!.at.step)
    }
    expect(realEvents.filter((row) => row.kind === 'wrapped')).toHaveLength(count)
    expect(realEvents.filter((row) => row.kind === 'reservationReleased')).toHaveLength(2 * count)
    expect(realEvents.filter((row) => row.kind === 'reservationGranted')).toHaveLength(count)
    for (const workflow of attempt.projection.operations.workflows) {
      expect(workflow.phase).toBe('postProduction')
      expect(workflow.bindings.stageFacilityId).toBeNull()
      expect(workflow.shootingTask).toBeNull()
      expect(workflow.bindings.setId).not.toBeNull() // history, NOT ongoing Set occupancy
    }
    for (const oldSet of state.sets) {
      const after = attempt.projection.sets.find((row) => row.id === oldSet.id)!
      const used = state.operations.workflows.some((row) => row.bindings.setId === oldSet.id)
      expect(after).toEqual({ ...oldSet, condition: used ? 91 : 100 })
    }
    expect(attempt.provenance.filter((row) => row.kind === 'firstTake')).toHaveLength(count)
    expect(attempt.provenance.filter((row) => row.kind === 'releaseAdmitted')).toEqual([])
    // Now take5 is in a window due6; still not B2/eight-week-slack feasibility.
  })

  it('retains genuine Post at 3→2, then releases its exact slot at 2→1 without another take or wrap', () => {
    // 410 retained-property control: every clock/reservation comes from the
    // original scheduled fixture and real ticks, never a rewritten campaign.
    const shooting = scheduled(1), shootingBefore = clone(shooting)
    const filmed = tick(shooting), state = tick(filmed), before = clone(state)
    makeSave(filmed); makeSave(state)
    assertSupportedFacts(state)
    assert.ok(state.hollywood)
    const own = state.hollywood.playerStudioId, week = state.market.tick
    expect(state.studio.activeProductions).toHaveLength(1)
    const production = state.studio.activeProductions[0]!, id = production.id
    expect(production.remainingTicks).toBe(3)
    expect(production.startTick).toBeLessThan(week)
    expect(state.operations.workflows).toHaveLength(1)
    const workflow = state.operations.workflows[0]!
    expect(workflow.productionId).toBe(id)
    expect(workflow.phase).toBe('postProduction')
    expect(workflow.shootingTask).toBeNull()
    expect(workflow.bindings.stageFacilityId).toBeNull()
    expect(workflow.reservations).toHaveLength(1)
    const post = workflow.reservations[0]!
    expect(post.capability).toBe('post')
    expect(post.phase).toBe('postProduction')
    const takes = state.firstTakes.filter((row) => row.productionId === id && row.studioId === own)
    expect(takes).toHaveLength(1)
    expect(takes[0]!.week).toBe(shooting.market.tick + 1)
    expect(filmed.firstTakes.filter((row) => row.productionId === id && row.studioId === own)).toEqual(takes)
    const once = tick(state), twice = tick(once)
    makeSave(once); makeSave(twice)
    expect(once.studio.activeProductions[0]?.remainingTicks).toBe(2)
    expect(once.operations.workflows[0]?.phase).toBe('postProduction')
    expect(once.operations.workflows[0]?.reservations).toEqual([post])
    expect(twice.studio.activeProductions[0]?.remainingTicks).toBe(1)
    expect(twice.operations.workflows[0]?.phase).toBe('releaseReady')
    expect(twice.operations.workflows[0]?.reservations).toEqual([])
    expect(once.studioEvents.rows.filter((row) => row.seq >= state.studioEvents.nextSeq)).toEqual([])
    for (const [weeks, real] of [[1, once], [2, twice]] as const) {
      const { attempt, result, calls } = complete(input(state, state.studio.activeProductions, weeks))
      expect(calls).toEqual([
        { week, ids: [id], before: [3], after: [2], takes: [] },
        ...(weeks === 2 ? [{ week: week + 1, ids: [id], before: [2], after: [1], takes: [] }] : []),
      ])
      checkProjection(attempt.projection, state, real)
      const technology = { ...state.technology, productions: state.technology.productions.map((row) => {
        if (row.studioId !== own) return row
        const updated = real.technology.productions.find((candidate) =>
          candidate.studioId === own && candidate.productionId === row.productionId)
        assert.ok(updated)
        return updated
      }) }
      expect(attempt.projection).toEqual({ week: real.market.tick,
        productions: real.studio.activeProductions, operations: real.operations,
        sets: real.sets, technology, releaseAuthority: real.releaseAuthority,
        completedBackgroundPathKeys: [] })
      expect(attempt.projection.sets).toEqual(state.sets)
      expect(real.firstTakes.filter((row) => row.productionId === id && row.studioId === own)).toEqual(takes)
      expect(attempt.provenance.filter((row) => row.kind === 'firstTake' || row.kind === 'releaseAdmitted')).toEqual([])
      const picturePath = JSON.stringify(['production', own, id])
      const pictures = attempt.trace.paths.filter((row) => row.kind === 'jointTracePicture')
      expect(pictures).toHaveLength(1)
      expect(pictures[0]).toMatchObject({ pathKey: picturePath, firstTake: null, personRelease: null })
      // Existing filmed history is retained, not emitted as a future take.
      const postHolds = result.fixedHolds.filter((hold) => hold.ownerPathKey === picturePath && hold.subject.kind === 'resource')
      expect(postHolds).toHaveLength(1)
      const hold = postHolds[0]!
      expect(hold.subject).toEqual({ kind: 'resource', resourceKey: JSON.stringify(['facility', own, post.facilityId]), slot: post.slot })
      expect(hold.from).toEqual({ week, step: 0 })
      expect(hold.until).toEqual({ week: week + weeks, step: 0 })
      const companyHolds = result.fixedHolds.filter((row) => row.ownerPathKey === picturePath && row.subject.kind === 'person')
      expect(companyHolds.flatMap((row) => row.subject.kind === 'person' ? [row.subject.personId] : []).sort())
        .toEqual([...productionCompanyTalentIds([production])].sort())
      expect(result.fixedHolds).toHaveLength(6 + state.sets.filter((row) => row.status === 'standing').length)
      expect(attempt.trace.additionalHolds).toEqual([])
      const events = attempt.provenance.filter((row) => row.kind === 'ownerEvent')
      const realEvents = real.studioEvents.rows.filter((row) => row.seq >= state.studioEvents.nextSeq)
      expect(events.map((row) => ({ week: row.ownerWeek, draft: row.draft })))
        .toEqual(realEvents.map(({ seq: _seq, week: ownerWeek, ...draft }) => ({ week: ownerWeek, draft })))
      expect(events.map((row) => row.draft.kind)).toEqual(weeks === 1 ? [] : ['reservationReleased', 'phaseEntered'])
      if (weeks === 1) expect(attempt.trace.fixedHoldReplacements).toEqual([])
      else {
        const release = events[0]!
        expect(release.draft).toEqual({ kind: 'reservationReleased', ownerId: id, resourceKey: `${post.facilityId}:${post.slot}` })
        expect(release.at.week).toBe(week + 1)
        const sweep = attempt.provenance.find((row) => row.kind === 'sweepStarted' && row.at.week === week + 1)
        assert.ok(sweep)
        expect(release.at.step).toBeGreaterThan(sweep.at.step)
        expect(events[1]!.at.step).toBeGreaterThan(release.at.step)
        expect(events[1]!.draft).toEqual({ kind: 'phaseEntered', productionId: id, phase: 'releaseReady' })
        expect(attempt.trace.fixedHoldReplacements).toEqual([{ holdId: hold.holdId, newUntil: release.at }])
      }
      expect(state).toEqual(before)
    }
    expect(shooting).toEqual(shootingBefore)
  })

  it('at H==now retains every current path and zero-length holds without owner execution', () => {
    const state = scheduled(2)
    const { attempt, calls, result, external } = complete(input(state, state.studio.activeProductions, 0))
    expect(calls).toEqual([])
    expect(external).toEqual({ arrival: 0, technology: 0, setup: 0 })
    checkProjection(attempt.projection, state, state)
    expect(attempt.projection.productions).toEqual(state.studio.activeProductions)
    expect(attempt.provenance).toEqual([])
    expect(result.fixedHolds.length).toBeGreaterThan(0)
    for (const hold of result.fixedHolds) {
      expect(hold.from).toEqual({ week: 4, step: 0 })
      expect(hold.until).toEqual({ week: 4, step: 0 })
    }
    const pictures = attempt.trace.paths.filter((row) => row.kind === 'jointTracePicture')
    expect(pictures.map((row) => row.pathKey).sort()).toEqual(state.studio.activeProductions
      .map((row) => JSON.stringify(['production', state.hollywood!.playerStudioId, row.id])).sort())
    for (const picture of pictures) {
      expect(picture.firstTake).toBeNull()
      expect(picture.personRelease).toBeNull()
    }
  })

  it('preserves complete generic P fields and opaque nested marker references', () => {
    const state = scheduled(1), real = tick(state)
    type Marked = Production & Readonly<{ fixtureMarker: Readonly<{ label: string; opaque: readonly string[] }>; extraCallerField: number }>
    const marked: readonly Marked[] = state.studio.activeProductions.map((row) => ({ ...row,
      fixtureMarker: Object.freeze({ label: 'not-persisted-history', opaque: Object.freeze(['opaque'.repeat(1000)]) }),
      extraCallerField: 73 }))
    const { attempt, result } = complete(input(state, marked, 1))
    expectTypeOf(attempt.projection.productions).toEqualTypeOf<readonly Marked[]>()
    expect(attempt.projection.productions[0]).toEqual({ ...marked[0], remainingTicks: 4 })
    expect(attempt.projection.productions[0]!.fixtureMarker).toBe(marked[0]!.fixtureMarker)
    expect(attempt.projection.productions[0]!.fixtureMarker.opaque).toBe(marked[0]!.fixtureMarker.opaque)
    checkProjection(attempt.projection, state, real)
    const small = marked.map((row) => ({ ...row,
      fixtureMarker: Object.freeze({ label: 'not-persisted-history', opaque: Object.freeze(['x']) }) }))
    const smallerOpaque = complete(input(state, small, 1))
    expect(smallerOpaque.result.preparationWork).toBe(result.preparationWork)
    expect(result.preparationWork).toBeGreaterThan(complete(input(state, state.studio.activeProductions, 1)).result.preparationWork)
    // This typed internal fact view is NOT stamped into GameState or a save.
  })

  it('charges an over-budget caller trace identity before a sweep, without reminting owner IDs', () => {
    const state = scheduled(1)
    complete(input(state, state.studio.activeProductions, 1))
    // Actual consumed string span alone exceeds the unchanged200000 allowance.
    const traceKey = `actual-empty-plan:${'x'.repeat(200001)}`
    const value = input(state, state.studio.activeProductions, 1, traceKey)
    const { result, calls } = observed(value)
    expect(calls).toEqual([])
    expect(result.attempts.some((row) => row.kind === 'complete')).toBe(false)
    expect(result.omissions.length).toBeGreaterThan(0)
    expect(result.preparationWork).toBe(200000)
  })
})

const boundaryOrder = (a: Boundary, b: Boundary) => a.week - b.week || a.step - b.step
const subjectKey = (value: Hold['subject']) => value.kind === 'person'
  ? JSON.stringify(['person', value.personId]) : JSON.stringify(['resource', value.resourceKey, value.slot])

function checkLedger(state: GameState, checked: ReturnType<typeof complete<Production>>, horizon: number) {
  assert.ok(state.hollywood)
  const own = state.hollywood.playerStudioId, now = { week: state.market.tick, step: 0 }, end = { week: horizon, step: 0 }
  const { trace, provenance } = checked.attempt
  const productionPath = (id: string) => JSON.stringify(['production', own, id])
  const mountPath = (id: string) => JSON.stringify(['setMount', own, id])
  const resource = (kind: string, id: string) => JSON.stringify([kind, own, id])
  const pictures = trace.paths.filter((row) => row.kind === 'jointTracePicture')
  expect(trace.paths.map((row) => row.pathKey).sort()).toEqual([
    ...state.studio.activeProductions.map((row) => productionPath(row.id)),
    ...state.sets.filter((row) => row.status === 'standing').map((row) => mountPath(row.id)),
  ].sort())
  expect(pictures).toHaveLength(state.studio.activeProductions.length)
  for (const production of state.studio.activeProductions) {
    const picture = pictures.find((row) => row.pathKey === productionPath(production.id))!
    expect(picture.cast).toEqual(production.cast)
    expect(picture.greenlight).toEqual({ week: production.startTick, step: 0 })
    expect(picture.firstTake).toEqual({ week: 5, step: 0 })
    expect(picture.personRelease).toBeNull()
    expect(picture.existingPath).toBe(true)
    expect(picture.additionalHolds).toEqual([])
    expect(picture.holdReplacements).toEqual([])
    expect(picture.ownerFactRefs.length).toBeGreaterThan(0)
  }
  const expectedFixed: { path: string; subject: Hold['subject'] }[] = []
  for (const production of state.studio.activeProductions) {
    const path = productionPath(production.id)
    for (const personId of productionCompanyTalentIds([production])) expectedFixed.push({ path, subject: { kind: 'person', personId } })
    const workflow = state.operations.workflows.find((row) => row.productionId === production.id)!
    for (const reservation of workflow.reservations) expectedFixed.push({ path,
      subject: { kind: 'resource', resourceKey: resource('facility', reservation.facilityId), slot: reservation.slot } })
    assert.ok(workflow.bindings.setId)
    expectedFixed.push({ path, subject: { kind: 'resource', resourceKey: resource('set', workflow.bindings.setId), slot: 0 } })
  }
  for (const set of state.sets.filter((row) => row.status === 'standing')) expectedFixed.push({
    path: mountPath(set.id), subject: { kind: 'resource', resourceKey: resource('mount', set.mountedOn), slot: 0 },
  })
  expect(checked.result.fixedHolds).toHaveLength(expectedFixed.length)
  for (const expected of expectedFixed) {
    const matches = checked.result.fixedHolds.filter((row) => row.ownerPathKey === expected.path && subjectKey(row.subject) === subjectKey(expected.subject))
    expect(matches).toHaveLength(1)
    expect(matches[0]!.from).toEqual(now)
    expect(matches[0]!.until).toEqual(end)
  }
  const effective = new Map(checked.result.fixedHolds.map((row) => [row.holdId, { ...row }]))
  expect(effective.size).toBe(expectedFixed.length)
  const replacements = new Set<string>()
  for (const change of trace.fixedHoldReplacements) {
    const original = effective.get(change.holdId)
    assert.ok(original && original.replaceableFrom)
    expect(replacements.has(change.holdId)).toBe(false)
    replacements.add(change.holdId)
    expect(boundaryOrder(change.newUntil, original.replaceableFrom)).toBeGreaterThanOrEqual(0)
    expect(boundaryOrder(change.newUntil, original.until)).toBeLessThanOrEqual(0)
    effective.set(change.holdId, { ...original, until: change.newUntil })
  }
  const events = provenance.filter((row) => row.kind === 'ownerEvent')
  const findEvent = (kind: 'reservationReleased' | 'reservationGranted', id: string, bareKey: string) => {
    const matches = events.filter((row) => row.draft.kind === kind && row.draft.ownerId === id && row.draft.resourceKey === bareKey)
    expect(matches).toHaveLength(1)
    return matches[0]!
  }
  for (const hold of checked.result.fixedHolds) {
    let expectedUntil = end
    const production = state.studio.activeProductions.find((row) => productionPath(row.id) === hold.ownerPathKey)
    if (horizon === 6 && production !== undefined && hold.subject.kind === 'resource') {
      const workflow = state.operations.workflows.find((row) => row.productionId === production.id)!
      const reservation = workflow.reservations.find((row) => resource('facility', row.facilityId) ===
        (hold.subject.kind === 'resource' ? hold.subject.resourceKey : ''))
      if (reservation !== undefined) expectedUntil = findEvent('reservationReleased', production.id,
        `${reservation.facilityId}:${reservation.slot}`).at
      else {
        expect(hold.subject.resourceKey).toBe(resource('set', workflow.bindings.setId!))
        const stage = workflow.reservations.find((row) => row.capability === 'soundstage')!
        const wrapped = events.filter((row) => row.draft.kind === 'wrapped' && row.draft.productionId === production.id)
        expect(wrapped).toHaveLength(1)
        expect(wrapped[0]!.draft).toEqual({ kind: 'wrapped', productionId: production.id,
          stageFacilityId: stage.facilityId, setId: workflow.bindings.setId })
        //186: wrap supplies Set identity; matching stage release supplies BOTH endpoints.
        expectedUntil = findEvent('reservationReleased', production.id, `${stage.facilityId}:${stage.slot}`).at
        expect(boundaryOrder(wrapped[0]!.at, expectedUntil)).toBeLessThanOrEqual(0)
      }
    }
    expect(effective.get(hold.holdId)).toEqual({ ...hold, until: expectedUntil })
  }
  expect(trace.additionalHolds).toHaveLength(horizon === 6 ? state.studio.activeProductions.length : 0)
  for (const production of state.studio.activeProductions) if (horizon === 6) {
    const workflow = checked.attempt.projection.operations.workflows.find((row) => row.productionId === production.id)!
    expect(workflow.reservations).toHaveLength(1)
    const reservation = workflow.reservations[0]!
    expect(reservation.capability).toBe('post')
    const matches = trace.additionalHolds.filter((hold) => hold.ownerPathKey === productionPath(production.id))
    expect(matches).toHaveLength(1)
    expect(matches[0]!.subject).toEqual({ kind: 'resource', resourceKey: resource('facility', reservation.facilityId), slot: reservation.slot })
    expect(matches[0]!.from).toEqual(findEvent('reservationGranted', production.id, `${reservation.facilityId}:${reservation.slot}`).at)
    expect(matches[0]!.until).toEqual(end)
  }
  const all: readonly Hold[] = [...effective.values(), ...trace.additionalHolds]
  expect(new Set(all.map((row) => row.holdId)).size).toBe(all.length)
  for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) {
    const left = all[a]!, right = all[b]!
    if (subjectKey(left.subject) !== subjectKey(right.subject)) continue
    expect(boundaryOrder(left.from, right.until) < 0 && boundaryOrder(right.from, left.until) < 0).toBe(false)
  }
}

describe('P14B4 compulsory ledger and shared budget — frozen176 / endpoint186', () => {
  it.each([1, 2] as const)('keeps all %i picture(s)/mounts and passes the REAL kernel within the SAME allowance', (count) => {
    const state = scheduled(count), value = input(state, state.studio.activeProductions, 2)
    const checked = complete(value)
    checkLedger(state, checked, 6)
    // Independently established empty relevant obligations, not caller harmlessness.
    expect(state.promises.filter((row) => row.issuerStudioId === value.issuerId ||
      row.beneficiaryPersonId === state.studio.activeProductions[0]!.cast.lead)).toEqual([])
    const kernel: JointTraceCapacityInput = { mode: 'jointOwnerTraces', now: { week: 4, step: 0 },
      horizonEndWeek: 6, issuerId: value.issuerId,
      target: { promiseId: null, personId: state.studio.activeProductions[0]!.cast.lead,
        mask: ['lead', 'antagonist', 'support'], window: { startWeek: 4, dueWeekExclusive: 6 },
        state: 'unbound', count: 1, actualQualifiedCount: 0 },
      priorClaims: [], foreignDebits: [], traces: [checked.attempt.trace], fixedHolds: checked.result.fixedHolds,
      coverage: { claimsAndHolds: 'complete', existingCalendars: 'incomplete',
        allOwnerTraces: 'incomplete', omissions: ['explicit command plans only'] },
      preparationWork: checked.result.preparationWork,
      limits: { claims: 32, units: 64, alternatives: 1024, work: 200000, span: 220 } }
    const eligible = checked.attempt.trace.paths.filter((row) => row.kind === 'jointTracePicture'
      && row.firstTake !== null && row.firstTake.week >= 4 && row.firstTake.week < 6
      && Object.values(row.cast).includes(kernel.target.personId))
    expect(eligible).toHaveLength(1) // real count progress, NOT a fabricated returned witness
    const before = clone(kernel)
    const result = searchPromiseCapacityTraces(kernel) // strict full-ledger normalization must actually succeed
    expect(result.status).toBe('UNCERTIFIED')
    if (result.status !== 'UNCERTIFIED') throw new Error('finite plans cannot supply a B/slack/complete-choice certificate')
    expect(result.reason).toBe('domainIncomplete')
    expect(result.workUsed).toBeGreaterThan(checked.result.preparationWork)
    expect(result.workUsed).toBeLessThanOrEqual(200000)
    expect(kernel).toEqual(before)
  })

  it('zero and genuinely tiny work never invoke scenery, factories or the sweep', () => {
    const state = scheduled(1), base = input(state, state.studio.activeProductions, 2)
    for (const work of [0, 1]) {
      const { result, calls, external } = observed({ ...base, limits: { ...base.limits, work } })
      expect(calls).toEqual([])
      expect(external).toEqual({ arrival: 0, technology: 0, setup: 0 })
      expect(result.preparationWork).toBe(work)
      expect(result.attempts.some((row) => row.kind === 'complete')).toBe(false)
      expect(result.omissions.length).toBeGreaterThan(0)
      if (work === 0) {
        expect(result.fixedHolds).toEqual([])
        expect(result.attempts).toEqual([])
      }
    }
  })

  //176 explicitly allows bounded behavioral threshold discovery. No expected
  // tariff is obtained from a private cost function; source conservatism is a
  // separate review obligation. Every invocation here still calls the real owner.
  function threshold(value: StartedOwnerReplayInput<Production>, wantedCalls: number) {
    expect(observed(value).calls.length).toBeGreaterThanOrEqual(wantedCalls)
    let low = 0, high = 200000
    for (let step = 0; high - low > 1; step++) {
      expect(step).toBeLessThan(18)
      const middle = Math.floor((low + high) / 2)
      const check = observed({ ...value, limits: { ...value.limits, work: middle } })
      if (check.calls.length >= wantedCalls) high = middle
      else low = middle
    }
    return { low, high,
      below: observed({ ...value, limits: { ...value.limits, work: low } }),
      above: observed({ ...value, limits: { ...value.limits, work: high } }) }
  }

  it.each([1, 2])('pre-reserves the whole actual sweep at invocation boundary %i', (wantedCalls) => {
    const state = scheduled(1), value = input(state, state.studio.activeProductions, 2)
    const edge = threshold(value, wantedCalls)
    expect(edge.high).toBe(edge.low + 1)
    expect(edge.below.calls).toHaveLength(wantedCalls - 1)
    expect(edge.above.calls).toHaveLength(wantedCalls)
    expect(edge.below.result.preparationWork).toBe(edge.low)
    expect(edge.below.result.omissions.length).toBeGreaterThan(0)
    for (const check of [edge.below, edge.above]) {
      const starts = check.result.attempts.flatMap((row) => row.provenance).filter((row) => row.kind === 'sweepStarted')
      expect(starts).toHaveLength(check.calls.length)
      for (let index = 0; index < check.calls.length; index++) {
        expect(starts[index]!.at.week).toBe(check.calls[index]!.week)
        expect(check.calls[index]!.ids).toEqual(state.studio.activeProductions.map((row) => row.id))
      }
      for (const attempt of check.result.attempts) if (attempt.kind === 'cut') expect(attempt.reason).toBe('workLimit')
    }
  })

  it('uses one canonical cumulative allowance across plans and preserves prior preparation expenditure', () => {
    const state = scheduled(1), base = input(state, state.studio.activeProductions, 1)
    const plans = [{ traceKey: 'A', commands: [] }, { traceKey: 'B', commands: [] }]
    const value: StartedOwnerReplayInput<Production> = { ...base, plans, preparationWork: 17 }
    const edge = threshold(value, 2)
    expect(edge.below.calls).toHaveLength(1)
    const forward = observed({ ...value, limits: { ...value.limits, work: edge.low } })
    const reverse = observed({ ...value, plans: [...plans].reverse(), limits: { ...value.limits, work: edge.low } })
    expect(reverse).toEqual(forward)
    expect(forward.result.preparationWork).toBe(edge.low)
    expect(forward.result.omissions.length).toBeGreaterThan(0)
    expect(forward.result.attempts.filter((row) => row.kind === 'complete')).toHaveLength(1)
    expect(forward.result.attempts[0]!.kind).toBe('complete')
    const zeroPrior = observed({ ...value, preparationWork: 0 })
    const withPrior = observed(value)
    expect(withPrior.result.attempts.every((row) => row.kind === 'complete')).toBe(true)
    expect(withPrior.result.preparationWork).toBe(zeroPrior.result.preparationWork + 17)
  })
})

describe('P14B4 shared due predicates and readonly company facts', () => {
  it('extracts EXACT screenplay refusal negation, including the existing narrow NaN behavior', () => {
    const cases: readonly [ScriptProject['status'], number | null, number, boolean][] = [
      ['drafting', 5, 5, true], ['rewriting', 4, 5, true], ['drafting', 6, 5, false],
      ['drafting', null, 5, false], ['review', 4, 5, false], ['ready', 4, 5, false],
      ['inProduction', 4, 5, false], ['produced', 4, 5, false],
      // Invalid save facts, explicit pure typed-number probes. No validator admits these.
      ['drafting', Number.NaN, 5, true], ['rewriting', 5, Number.NaN, true],
    ]
    for (const [status, dueWeek, arrival, expected] of cases) {
      const facts = Object.freeze({ status, dueWeek })
      expect(scriptWorkDueAt(facts, arrival)).toBe(expected)
    }
  })

  it('extracts EXACT audition refusal negation without moving caller mode/week validation', () => {
    const cases: readonly [CastingSession['status'], number | null, number, boolean][] = [
      ['auditioning', 5, 5, true], ['auditioning', 4, 5, true], ['auditioning', 6, 5, false],
      ['auditioning', null, 5, false], ['review', 4, 5, false], ['complete', 4, 5, false],
      ['auditioning', Number.NaN, 5, true], ['auditioning', 5, Number.NaN, true],
    ]
    for (const [status, dueWeek, arrival, expected] of cases) {
      expect(castingWorkDueAt(Object.freeze({ status, dueWeek }), arrival)).toBe(expected)
    }
  })

  it('accepts genuine readonly narrow company facts without converting credited writer to a seat', () => {
    const state = scheduled(2), before = clone(state)
    const narrow = Object.freeze(state.studio.activeProductions.map((row) => Object.freeze({
      directorId: row.directorId, cast: Object.freeze({ ...row.cast }), craftIds: row.craftIds,
      marker: Object.freeze({ id: row.id }),
    })))
    const ids = productionCompanyTalentIds(narrow)
    expectTypeOf(ids).toEqualTypeOf<Set<string>>()
    expect([...ids]).toEqual(state.studio.activeProductions.flatMap((row) =>
      [row.directorId, row.cast.lead, row.cast.antagonist, row.cast.support, ...row.craftIds]))
    expect(ids.size).toBe(10)
    for (const row of state.studio.activeProductions) expect(ids.has(row.writerId)).toBe(false)
    expect(state).toEqual(before)
  })
})
