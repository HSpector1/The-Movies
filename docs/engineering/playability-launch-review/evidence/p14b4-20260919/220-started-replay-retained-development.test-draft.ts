// INERT / UNEXECUTED. Intended tests/p14b4-started-replay-retained-development.test.ts.
//220: independent two-picture retained-Development control;137/176, no218 implementation oracle.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds } from '../src/core/employment.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import { replayStartedProductionPlans, type StartedOwnerReplayInput } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production } from '../src/core/types.js'
import { commissionPayload, contractedByRole, foundedStudio, projectById,
  remainingPackage, SEED, writingIds } from './_p04a2WriterCreditFixtures.js'

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


function twoNewPictures() {
  //200's lawful early-initialization recipe, with actual extra hires for TWO companies.
  let state = foundedStudio(SEED, { actor: 3, director: 1, craft: 1 })
  expect(state.market.tick).toBe(0)
  state = initializeHollywood(state, 'fresh')
  expect(state.hollywood).toMatchObject({ origin: 'fresh', originWeek: 0 })
  makeSave(state)
  state = applyActions(state, [{ kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }])
  const writers = contractedByRole(state, 'writer')
  expect(writers).toHaveLength(1)
  expect(contractedByRole(state, 'actor')).toHaveLength(6)
  expect(contractedByRole(state, 'director')).toHaveLength(2)
  expect(contractedByRole(state, 'craft')).toHaveLength(2)
  const writerId = writers[0]!.id, concepts = [state.concepts[0]!, state.concepts[1]!]
  expect(concepts[0]!.id).not.toBe(concepts[1]!.id)
  const projectIds: string[] = []
  for (const concept of concepts) {
    expect(busyTalentIds(state).has(writerId)).toBe(false)
    state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(concept, writerId) }])
    const project = state.scriptDevelopment.projects.find((row) => row.conceptId === concept.id)
    assert.ok(project)
    expect(project.status).toBe('drafting')
    expect(writingIds(state)).toEqual([writerId])
    const due = state.market.tick + 1
    expect(project.dueWeek).toBe(due)
    state = tick(state)
    expect(state.market.tick).toBe(due)
    expect(projectById(state, project.id).status).toBe('review')
    state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
    expect(projectById(state, project.id)).toMatchObject({ status: 'ready', writerId, dueWeek: null, reservation: null })
    expect(writingIds(state)).toEqual([])
    projectIds.push(project.id)
    makeSave(state)
  }
  expect(state.studio.activeProductions).toEqual([])
  expect(state.scriptDevelopment.projects.map((row) => row.status)).toEqual(['ready', 'ready'])
  const week = state.market.tick
  const packages = concepts.map((concept, index) => remainingPackage(state, concept,
    { actor: index * 3, director: index, craft: index }))
  expect(new Set(packages.flatMap((row) => [row.directorId, ...Object.values(row.cast), ...row.craftIds])).size).toBe(10)
  for (let index = 0; index < 2; index++) state = applyActions(state, [{
    kind: 'greenlightScriptProject', production: { projectId: projectIds[index]!, ...packages[index]! },
  }])
  expect(state.market.tick).toBe(week)
  expect(state.studio.activeProductions).toHaveLength(2)
  expect(state.operations.workflows).toHaveLength(2)
  expect(state.studio.activeProductions.map((row) => row.startTick)).toEqual([week, week])
  expect(state.studio.activeProductions.map((row) => row.remainingTicks)).toEqual([8, 8])
  expect(state.studio.activeProductions.map((row) => row.writerId)).toEqual([writerId, writerId])
  expect(company(state.studio.activeProductions).size).toBe(10)
  expect(company(state.studio.activeProductions).has(writerId)).toBe(false)
  expect(busyTalentIds(state).has(writerId)).toBe(false)
  expect(writingIds(state)).toEqual([])
  const writerContracts = state.contracts.filter((row) => row.talentId === writerId)
  expect(writerContracts).toHaveLength(1)
  expect(writerContracts[0]!.endWeekExclusive).toBeGreaterThan(week + 2)
  for (const projectId of projectIds) {
    const project = projectById(state, projectId)
    expect(project.status).toBe('inProduction')
    expect(state.studio.activeProductions.some((row) => row.id === project.productionId && row.conceptId === project.conceptId)).toBe(true)
  }
  const slots = state.studio.activeProductions.map((production) => {
    const workflow = state.operations.workflows.find((row) => row.productionId === production.id)
    assert.ok(workflow)
    expect(workflow.phase).toBe('development')
    expect(workflow.shootingTask).toBeNull()
    expect(workflow.blocker).toBeNull()
    expect(workflow.bindings.stageFacilityId).toBeNull()
    expect(workflow.bindings.setId).toBeNull()
    expect(workflow.reservations).toHaveLength(1)
    const slot = workflow.reservations[0]!
    expect(slot.capability).toBe('development-casting')
    expect(slot.phase).toBe('development')
    return slot
  })
  expect(slots[0]!.facilityId).toBe(slots[1]!.facilityId)
  expect(slots[0]!.slot).not.toBe(slots[1]!.slot)
  expect(state.firstTakes.filter((row) => state.studio.activeProductions.some((production) => production.id === row.productionId))).toEqual([])
  supported(state)
  return { state, week, writerId, slots }
}

describe('P14B4 two genuine retained-Development pictures', () => {
  it('replays both new8 skips then both sticky8→7 in one whole-slate call each week with exact unchanged occupancy', () => {
    const { state, week, writerId, slots } = twoNewPictures(), before = clone(state)
    assert.ok(state.hollywood)
    const own = state.hollywood.playerStudioId, ids = state.studio.activeProductions.map((row) => row.id)
    const once = tick(state), twice = tick(once)
    expect(once.studio.activeProductions.map((row) => row.remainingTicks)).toEqual([8, 8])
    expect(twice.studio.activeProductions.map((row) => row.remainingTicks)).toEqual([7, 7])
    expect(once.operations.workflows.map((row) => row.phase)).toEqual(['development', 'development'])
    expect(twice.operations.workflows.map((row) => row.phase)).toEqual(['preProduction', 'preProduction'])
    for (let index = 0; index < ids.length; index++) {
      expect(once.operations.workflows.find((row) => row.productionId === ids[index])?.reservations).toEqual([slots[index]])
      expect(twice.operations.workflows.find((row) => row.productionId === ids[index])?.reservations)
        .toEqual([{ ...slots[index]!, phase: 'preProduction' }])
    }
    expect(once.sets).toEqual(state.sets)
    expect(twice.sets).toEqual(state.sets)
    expect(twice.firstTakes.filter((row) => ids.includes(row.productionId))).toEqual([])
    makeSave(once); makeSave(twice)
    const actualEvents = twice.studioEvents.rows.filter((row) => row.seq >= state.studioEvents.nextSeq)
    expect(actualEvents).toHaveLength(2)
    expect(actualEvents.map((row) => row.kind)).toEqual(['phaseEntered', 'phaseEntered'])
    expect(actualEvents.flatMap((row) => row.kind === 'phaseEntered' ? [row.productionId] : []).sort()).toEqual([...ids].sort())
    for (const productionId of ids) expect(actualEvents).toContainEqual(expect.objectContaining({
      kind: 'phaseEntered', productionId, phase: 'preProduction', week: week + 1,
    }))
    const value: StartedOwnerReplayInput<Production> = { source: {
      technology: state.technology, market: { tick: week }, placement: state.placement, property: state.property,
      hollywood: state.hollywood, operations: state.operations, sets: state.sets, releaseAuthority: state.releaseAuthority,
      scriptDevelopment: state.scriptDevelopment, castingSessions: state.castingSessions, construction: state.construction,
      physicalPlans: state.physicalPlans, productionQueue: state.productionQueue, founding: state.founding,
      firstTakes: state.firstTakes, concepts: state.concepts, studio: { activeProductions: state.studio.activeProductions },
    }, issuerId: own, claimPersonIds: state.studio.activeProductions.map((row) => row.cast.lead),
    plans: [{ traceKey: '220-two-genuine-development-pictures', commands: [] }], horizonEndWeek: week + 2,
    preparationWork: 0, limits: { work: 200000, span: 220, alternatives: 1024 } }
    const original = operationsModule.advanceManagedProductions, beforeInput = clone(value)
    const calls: { week: number; ids: string[]; before: number[]; after: number[]; takes: string[]; releases: string[] }[] = []
    const spy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
      const next = original(...args)
      calls.push({ week: args[2], ids: args[1].map((row) => row.id), before: args[1].map((row) => row.remainingTicks),
        after: next.productions.map((row) => row.remainingTicks), takes: next.firstTakes.map((row) => row.id),
        releases: [...next.admittedReleaseIds] })
      return next
    })
    try {
      const result = replayStartedProductionPlans(value)
      expect(value).toEqual(beforeInput)
      expect(state).toEqual(before)
      expect(result.preparationWork).toBeLessThanOrEqual(200000)
      expect(result.attempts).toHaveLength(1)
      const attempt = result.attempts[0]!
      if (attempt.kind !== 'complete') throw new Error('220 real two-picture Development replay cut: ' + attempt.reason + ': ' + attempt.detail)
      expect(result.omissions).toEqual([])
      expect(calls).toEqual([
        { week, ids, before: [8, 8], after: [8, 8], takes: [], releases: [] },
        { week: week + 1, ids, before: [8, 8], after: [7, 7], takes: [], releases: [] },
      ])
      expect(attempt.projection.week).toBe(week + 2)
      expect(attempt.projection.productions).toEqual(twice.studio.activeProductions)
      expect(attempt.projection.operations).toEqual(twice.operations)
      expect(attempt.projection.sets).toEqual(twice.sets)
      expect(attempt.projection.releaseAuthority).toEqual(twice.releaseAuthority)
      expect(attempt.projection.completedBackgroundPathKeys).toEqual([])
      expect(attempt.projection.technology.productions.filter((row) => row.studioId === own))
        .toEqual(twice.technology.productions.filter((row) => row.studioId === own))
      expect(attempt.projection.technology.productions.filter((row) => row.studioId !== own))
        .toEqual(state.technology.productions.filter((row) => row.studioId !== own))
      const sweeps = attempt.provenance.filter((row) => row.kind === 'sweepStarted')
      expect(sweeps.map((row) => row.at.week)).toEqual([week, week + 1])
      for (const row of sweeps) expect(row.externalSlotKeys).toEqual([])
      const events = attempt.provenance.filter((row) => row.kind === 'ownerEvent')
      expect(events.map((row) => ({ week: row.ownerWeek, draft: row.draft })))
        .toEqual(actualEvents.map(({ seq: _seq, week: ownerWeek, ...draft }) => ({ week: ownerWeek, draft })))
      expect(events.every((row) => row.at.week === week + 1 && row.at.step > sweeps[1]!.at.step)).toBe(true)
      expect(attempt.provenance.filter((row) => row.kind !== 'sweepStarted' && row.kind !== 'ownerEvent')).toEqual([])
      const productionPath = (id: string) => JSON.stringify(['production', own, id])
      const mounts = state.sets.filter((row) => row.status === 'standing')
      expect(attempt.trace.paths.map((row) => row.pathKey).sort()).toEqual([
        ...ids.map(productionPath), ...mounts.map((row) => JSON.stringify(['setMount', own, row.id])),
      ].sort())
      const pictures = attempt.trace.paths.filter((row) => row.kind === 'jointTracePicture')
      expect(pictures).toHaveLength(2)
      for (const production of state.studio.activeProductions) {
        const picture = pictures.find((row) => row.pathKey === productionPath(production.id))!
        expect(picture.cast).toEqual(production.cast)
        expect(picture.greenlight).toEqual({ week, step: 0 })
        expect(picture.firstTake).toBeNull()
        expect(picture.personRelease).toBeNull()
        expect(picture.existingPath).toBe(true)
        expect(picture.ownerFactRefs.length).toBeGreaterThan(0)
        expect(picture.additionalHolds).toEqual([])
        expect(picture.holdReplacements).toEqual([])
      }
      const expected = [
        ...state.studio.activeProductions.flatMap((production, index) => [
          ...[...company([production])].map((personId) => ({ path: productionPath(production.id), subject: { kind: 'person', personId } })),
          { path: productionPath(production.id), subject: { kind: 'resource',
            resourceKey: JSON.stringify(['facility', own, slots[index]!.facilityId]), slot: slots[index]!.slot } },
        ]),
        ...mounts.map((row) => ({ path: JSON.stringify(['setMount', own, row.id]), subject: {
          kind: 'resource', resourceKey: JSON.stringify(['mount', own, row.mountedOn]), slot: 0,
        } })),
      ]
      expect(result.fixedHolds).toHaveLength(12 + mounts.length)
      expect(new Set(result.fixedHolds.map((row) => row.holdId)).size).toBe(result.fixedHolds.length)
      for (const entry of expected) {
        const matches = result.fixedHolds.filter((hold) => {
          if (hold.ownerPathKey !== entry.path) return false
          if ('personId' in entry.subject) return hold.subject.kind === 'person' && hold.subject.personId === entry.subject.personId
          return hold.subject.kind === 'resource' && hold.subject.resourceKey === entry.subject.resourceKey && hold.subject.slot === entry.subject.slot
        })
        expect(matches).toHaveLength(1)
        expect(matches[0]!.from).toEqual({ week, step: 0 })
        expect(matches[0]!.until).toEqual({ week: week + 2, step: 0 })
      }
      expect(result.fixedHolds.filter((row) => row.subject.kind === 'person')).toHaveLength(10)
      expect(result.fixedHolds.some((row) => row.subject.kind === 'person' && row.subject.personId === writerId)).toBe(false)
      expect(attempt.trace.fixedHoldReplacements).toEqual([])
      expect(attempt.trace.additionalHolds).toEqual([])
    } finally { spy.mockRestore() }
  })
})
