// Installed from frozen250 after parent full read and independent251 KEEP; original inert provenance retained.
// INERT / UNEXECUTED. Intended tests/p14b4-ready-replay-identity.test.ts.
//250: independent240 identity supplement; original244 remains unchanged.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions, predictProductionId } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import { persistedProductionIds } from '../src/core/productionIdentity.js'
import { replayReadyProductionPlans, type ReadyOwnerReplayInput } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production } from '../src/core/types.js'
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

describe('P14B4 Ready replay — cancelled identity remains reserved', () => {
  it('uses retained sunk-cost identity after same-week real cancel, without resurrecting a calendar or rewriting history', () => {
    const { state: ready, payload, writerId } = baseReady(), readyBefore = clone(ready)
    const firstPrediction = predictProductionId(ready)
    const first = applyActions(ready, [{ kind: 'greenlightScriptProject', production: payload }])
    makeSave(first)
    expect(first.studio.activeProductions).toHaveLength(1)
    const old = first.studio.activeProductions[0]!, now = first.market.tick
    expect(now).toBe(1)
    expect(old.id).toBe(firstPrediction)
    expect(old.startTick).toBe(now)
    expect(old.remainingTicks).toBe(8)
    const sunk = first.ledger.filter((row) => row.productionId === old.id)
    expect(sunk).toEqual([{ week: now, kind: 'production', amount: -(payload.budget.negative + payload.budget.marketing),
      productionId: old.id, note: 'negative + marketing' }])
    const formationHistory = first.studioEvents.rows.filter((row) => row.seq >= ready.studioEvents.nextSeq)
    expect(formationHistory.map((row) => row.kind)).toEqual(['reservationGranted', 'phaseEntered'])
    const firstBefore = clone(first)
    const source = applyActions(first, [{ kind: 'cancel', productionId: old.id }])
    const choice: Choice = { projectId: payload.projectId, directorId: payload.directorId,
      cast: payload.cast, craftIds: payload.craftIds }
    supported(source, choice)
    expect(source.market.tick).toBe(now)
    expect(source.studio.cash).toBe(first.studio.cash)
    expect(source.studio.activeProductions).toEqual([])
    expect(source.studio.releasedFilms).toEqual([])
    expect(source.operations.workflows).toEqual([])
    expect(source.technology.productions.filter((row) => row.productionId === old.id)).toEqual([])
    expect(source.firstTakes.filter((row) => row.productionId === old.id)).toEqual([])
    expect(source.releaseAuthority.commitments.filter((row) => row.productionId === old.id)).toEqual([])
    expect(projectById(source, payload.projectId)).toMatchObject({ status: 'ready', productionId: null })
    expect(projectById(source, payload.projectId).assessment).toEqual(projectById(ready, payload.projectId).assessment)
    expect(source.ledger).toEqual(first.ledger)
    expect(source.ledger.filter((row) => row.productionId === old.id)).toEqual(sunk)
    expect(source.studioEvents).toEqual(first.studioEvents)
    // The sunk ledger is the permanent collision witness. The retained Tier-W
    // formation rows above are NOT passed off as wrapped/premiere Tier-D authority.
    expect(persistedProductionIds(source).has(old.id)).toBe(true)
    const predicted = predictProductionId(source)
    expect(predicted).toBe(`${old.id}-1`)
    expect(predicted).not.toBe(old.id)
    const immediate = applyActions(source, [{ kind: 'greenlightScriptProject', production: payload }])
    expect(immediate.studio.activeProductions).toHaveLength(1)
    expect(immediate.studio.activeProductions[0]!.id).toBe(predicted)
    expect(immediate.market.tick).toBe(now)
    expect(immediate.ledger.filter((row) => row.productionId === old.id)).toEqual(sunk)
    expect(immediate.ledger.filter((row) => row.productionId === predicted)).toEqual([
      { week: now, kind: 'production', amount: -(payload.budget.negative + payload.budget.marketing),
        productionId: predicted, note: 'negative + marketing' },
    ])
    const real = tick(immediate)
    makeSave(immediate); makeSave(real)
    expect(real.market.tick).toBe(now + 1)
    expect(real.studio.activeProductions[0]!.remainingTicks).toBe(8)
    const input: ReadyOwnerReplayInput = { source, issuerId: source.hollywood!.playerStudioId,
      claimPersonIds: [choice.cast.lead], plans: [{ traceKey: '250-cancelled-identity', readyChoice: choice, commands: [] }],
      horizonEndWeek: now + 1, preparationWork: 0, limits: { work: 200000, span: 220, alternatives: 1024 } }
    const beforeInput = clone(input), original = operationsModule.advanceManagedProductions
    const calls: { week: number; ids: string[]; before: number[]; after: number[] }[] = []
    const spy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
      const next = original(...args)
      calls.push({ week: args[2], ids: args[1].map((row) => row.id), before: args[1].map((row) => row.remainingTicks),
        after: next.productions.map((row) => row.remainingTicks) })
      return next
    })
    try {
      const result = replayReadyProductionPlans(input)
      expect(result.preparationWork).toBeLessThanOrEqual(200000)
      expect(result.omissions).toEqual([])
      expect(result.attempts).toHaveLength(1)
      const attempt = result.attempts[0]!
      if (attempt.kind !== 'complete') throw new Error(`250 genuine collision replay cut: ${attempt.reason}: ${attempt.detail}`)
      expect(calls).toEqual([{ week: now, ids: [predicted], before: [8], after: [8] }])
      expect(attempt.projection.productions).toEqual([])
      const actual = real.studio.activeProductions[0]!
      expect(attempt.projection.plannedProductions).toEqual([{
        id: predicted, projectId: payload.projectId, conceptId: actual.conceptId, writerId,
        directorId: actual.directorId, cast: actual.cast, craftIds: actual.craftIds, startTick: now, remainingTicks: 8,
      }])
      expect(attempt.projection.week).toBe(real.market.tick)
      expect(attempt.projection.operations).toEqual(real.operations)
      expect(attempt.projection.sets).toEqual(real.sets)
      expect(attempt.projection.releaseAuthority).toEqual(real.releaseAuthority)
      expect(attempt.projection.completedBackgroundPathKeys).toEqual([])
      expect(attempt.projection.admissionScriptDevelopment).toEqual(immediate.scriptDevelopment)
      expect(attempt.projection.technology.productions.filter((row) => row.studioId === input.issuerId))
        .toEqual(real.technology.productions.filter((row) => row.studioId === input.issuerId))
      expect(attempt.projection.technology.productions.filter((row) => row.studioId !== input.issuerId))
        .toEqual(source.technology.productions.filter((row) => row.studioId !== input.issuerId))
      expect(attempt.provenance.filter((row) => row.kind === 'readyAdmitted')).toEqual([
        { kind: 'readyAdmitted', at: { week: now, step: 1 }, projectId: payload.projectId, productionId: predicted },
      ])
      const path = JSON.stringify(['screenplay', input.issuerId, payload.projectId])
      const pictures = attempt.trace.paths.filter((row) => row.kind === 'jointTracePicture')
      expect(pictures).toHaveLength(1)
      expect(pictures[0]).toMatchObject({ pathKey: path, existingPath: true, cast: choice.cast,
        greenlight: { week: now, step: 1 }, firstTake: null, personRelease: null })
      expect(attempt.trace.paths.some((row) => row.pathKey === JSON.stringify(['production', input.issuerId, old.id]))).toBe(false)
      expect(result.fixedHolds.every((row) => row.subject.kind === 'resource')).toBe(true)
      expect(attempt.trace.additionalHolds).toHaveLength(6)
      expect(attempt.trace.additionalHolds.every((row) => row.ownerPathKey === path)).toBe(true)
      expect(attempt.trace.additionalHolds.filter((row) => row.subject.kind === 'person')
        .map((row) => row.subject.kind === 'person' ? row.subject.personId : '').sort()).toEqual(company(choice).sort())
      for (const forbidden of ['state', 'cash', 'ledger', 'firstTakes', 'films']) expect(attempt.projection).not.toHaveProperty(forbidden)
    } finally {
      spy.mockRestore()
      expect(input).toEqual(beforeInput)
      expect(first).toEqual(firstBefore)
      expect(ready).toEqual(readyBefore)
    }
  })
})
