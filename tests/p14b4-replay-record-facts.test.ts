// 368: independent public-API controls for adopted365. No private memo oracle.
import assert from 'node:assert/strict'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { productionCompanyTalentIds } from '../src/core/productionPeople.js'
import { replayStartedProductionPlans, type StartedOwnerReplayInput,
  type StartedPicture } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import { sceneryLoadInDecision } from '../src/core/sceneryLoadIn.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production } from '../src/core/types.js'
import { operationsStudio, productionPayload } from './contracts/_contractFixtures.js'

const clone = <T>(value: T): T => structuredClone(value)

function supported(state: GameState) {
  assert.ok(state.hollywood)
  const own = state.hollywood.playerStudioId
  expect(state.founding).toBeNull()
  expect(state.operations.mode).toBe('managed')
  expect(state.scriptDevelopment.mode).toBe('legacy')
  expect(state.productionQueue).toEqual([])
  expect(state.physicalPlans.plans.filter((row) => row.studioId === own &&
    ['queued', 'held', 'blocked'].includes(row.status))).toEqual([])
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
      const project = business.development.projects[ordinal], cost = business.projects[ordinal]
      assert.ok(project && cost)
      expect(cost.scriptProjectId).toBe(project.id)
      expect(cost.conceptId).toBe(project.conceptId)
      expect(state.hollywood.concepts[cost.conceptOrdinal]?.id).toBe(project.conceptId)
      if (project.status === 'drafting' || project.status === 'rewriting') {
        expect(scriptProjectWriterIds(project).filter((id) => relevant.has(id))).toEqual([])
      }
    }
  }
  expect(state.technology.projects.filter((row) => row.studioId !== own && row.status === 'active')
    .flatMap((row) => row.seats.filter((seat) => seat.releasedWeek === null && relevant.has(seat.talentId)))).toEqual([])
  makeSave(state)
}

function scheduled(offset: 0 | 1): GameState {
  // Genuine historical-control founding, not ordinary/natural founding. Each
  // branch is constructed afresh; only actual package selection differs.
  let state = initializeHollywood(operationsStudio('p13a-production-consumer'), 'fresh')
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, offset) }])
  expect(state.studio.activeProductions).toHaveLength(1)
  const id = state.studio.activeProductions[0]!.id
  for (let guard = 0; guard < 20 && state.studio.activeProductions[0]!.remainingTicks !== 5; guard++) {
    state = tick(state)
  }
  expect(state.studio.activeProductions[0]!.remainingTicks).toBe(5)
  state = applyActions(state, [{ kind: 'assignShootingDirector', productionId: id,
    directorId: state.studio.activeProductions[0]!.directorId }])
  for (let guard = 0; guard < 8 && state.operations.workflows[0]?.shootingTask?.status !== 'ready'; guard++) {
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(5)
    state = tick(state)
  }
  expect(state.operations.workflows[0]?.shootingTask?.status).toBe('ready')
  state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId: id }])
  expect(state.operations.workflows).toHaveLength(1)
  const workflow = state.operations.workflows[0]!
  expect(workflow.productionId).toBe(id)
  expect(workflow.phase).toBe('shooting')
  expect(workflow.shootingTask?.status).toBe('scheduled')
  expect(workflow.blocker).toBeNull()
  expect(workflow.bindings.stageFacilityId).not.toBeNull()
  expect(workflow.bindings.setId).not.toBeNull()
  expect(sceneryLoadInDecision(state, workflow, state.market.tick).kind).toBe('none')
  expect(state.firstTakes.filter((row) => row.productionId === id)).toEqual([])
  expect(productionCompanyTalentIds(state.studio.activeProductions).size).toBe(5)
  supported(state)
  return state
}

function input<P extends StartedPicture>(state: GameState, productions: readonly P[]): StartedOwnerReplayInput<P> {
  assert.ok(state.hollywood)
  return { source: {
    technology: state.technology, market: { tick: state.market.tick },
    placement: state.placement, property: state.property, hollywood: state.hollywood,
    operations: state.operations, sets: state.sets, releaseAuthority: state.releaseAuthority,
    scriptDevelopment: state.scriptDevelopment, castingSessions: state.castingSessions,
    construction: state.construction, physicalPlans: state.physicalPlans,
    productionQueue: state.productionQueue, founding: state.founding, firstTakes: state.firstTakes,
    concepts: state.concepts, studio: { activeProductions: productions },
  }, issuerId: state.hollywood.playerStudioId,
  claimPersonIds: state.studio.activeProductions.map((row) => row.cast.lead),
  plans: [{ traceKey: 'record-facts-two-real-sweeps', commands: [] }],
  horizonEndWeek: state.market.tick + 2, preparationWork: 0,
  limits: { work: 200000, span: 220, alternatives: 1024 } }
}

function reference(state: GameState) {
  const once = tick(state), twice = tick(once)
  makeSave(once)
  makeSave(twice)
  expect(once.studio.activeProductions.map((row) => row.remainingTicks)).toEqual([4])
  expect(twice.studio.activeProductions.map((row) => row.remainingTicks)).toEqual([3])
  expect(twice.operations.workflows[0]?.phase).toBe('postProduction')
  const takes = once.firstTakes.filter((row) => row.productionId === state.studio.activeProductions[0]!.id)
  expect(takes).toHaveLength(1)
  expect(takes[0]!.week).toBe(state.market.tick + 1)
  return twice
}

function checked<P extends StartedPicture>(value: StartedOwnerReplayInput<P>, state: GameState,
  real: GameState, productions: readonly P[]) {
  const before = clone(value)
  const result = replayStartedProductionPlans(value)
  expect(value).toEqual(before)
  expect(result.attempts).toHaveLength(1)
  const attempt = result.attempts[0]!
  if (attempt.kind !== 'complete') throw new Error(`genuine record-facts replay cut: ${attempt.reason}: ${attempt.detail}`)
  expect(result.omissions).toEqual([])
  expect(result.preparationWork).toBeGreaterThan(0)
  expect(result.preparationWork).toBeLessThanOrEqual(200000)
  const own = value.issuerId
  expect(real.technology.productions.filter((row) => row.studioId === own).map((row) => row.productionId))
    .toEqual(state.technology.productions.filter((row) => row.studioId === own).map((row) => row.productionId))
  const technology = { ...state.technology, productions: state.technology.productions.map((row) => {
    if (row.studioId !== own) return row // foreign advancement is outside this replay
    const updated = real.technology.productions.find((candidate) =>
      candidate.studioId === own && candidate.productionId === row.productionId)
    assert.ok(updated)
    return updated
  }) }
  expect(attempt.projection).toEqual({ week: real.market.tick, productions,
    operations: real.operations, sets: real.sets, technology,
    releaseAuthority: real.releaseAuthority, completedBackgroundPathKeys: [] })
  expect(attempt.provenance.filter((row) => row.kind === 'sweepStarted').map((row) => row.at.week))
    .toEqual([state.market.tick, state.market.tick + 1])
  expect(attempt.provenance.filter((row) => row.kind === 'firstTake')).toEqual([{
    kind: 'firstTake', at: { week: state.market.tick + 1, step: 0 },
    productionId: state.studio.activeProductions[0]!.id,
  }])
  const events = real.studioEvents.rows.filter((row) => row.seq >= state.studioEvents.nextSeq)
  expect(attempt.provenance.filter((row) => row.kind === 'ownerEvent')
    .map((row) => ({ week: row.ownerWeek, draft: row.draft })))
    .toEqual(events.map(({ seq: _seq, week, ...draft }) => ({ week, draft })))
  expect(events.filter((row) => row.kind === 'wrapped')).toHaveLength(1)
  return { result, attempt }
}

describe('P14B4 paid record facts — public invocation isolation and opaque P fields', () => {
  it('keeps exact A/B/A/B results and work across genuine same-ID, different-package sources', () => {
    const a = scheduled(0), b = scheduled(1)
    const aBefore = clone(a), bBefore = clone(b)
    const aProduction = a.studio.activeProductions[0]!, bProduction = b.studio.activeProductions[0]!
    expect(aProduction.id).toBe(bProduction.id)
    expect(aProduction.conceptId).not.toBe(bProduction.conceptId)
    expect([...productionCompanyTalentIds([aProduction])]
      .filter((id) => productionCompanyTalentIds([bProduction]).has(id))).toEqual([])
    expect(a.operations).not.toBe(b.operations)
    expect(a.technology).not.toBe(b.technology)
    const aReal = reference(a), bReal = reference(b)
    const aInput = input(a, a.studio.activeProductions), bInput = input(b, b.studio.activeProductions)
    const firstA = checked(aInput, a, aReal, aReal.studio.activeProductions).result
    const aSnapshot = clone(firstA)
    const firstB = checked(bInput, b, bReal, bReal.studio.activeProductions).result
    const bSnapshot = clone(firstB)
    // EXACT original argument references recur, not fresh clones that would hide
    // an improperly global exact-reference memo. Distinct facts share the ID.
    const againA = checked(aInput, a, aReal, aReal.studio.activeProductions).result
    const againB = checked(bInput, b, bReal, bReal.studio.activeProductions).result
    expect(againA).toEqual(aSnapshot)
    expect(againB).toEqual(bSnapshot)
    expect(againA.preparationWork).toBe(aSnapshot.preparationWork)
    expect(againB.preparationWork).toBe(bSnapshot.preparationWork)
    expect(firstA).toEqual(aSnapshot)
    expect(firstB).toEqual(bSnapshot)
    expect(a).toEqual(aBefore)
    expect(b).toEqual(bBefore)
    // No claim that these package branches differ in static facility counts.
  })

  it('copies opaque P values untouched while charging changed own-string-key shape', () => {
    const state = scheduled(0), before = clone(state), real = reference(state)
    const marker = Object.freeze({ label: 'lower-view-only', nested: Object.freeze(['opaque']) })
    type Marked = Production & Readonly<{ recordFactsMarker: typeof marker; recordFactsText: string }>
    const short: readonly Marked[] = state.studio.activeProductions.map((row) => ({ ...row,
      recordFactsMarker: marker, recordFactsText: 'x' }))
    const huge: readonly Marked[] = short.map((row) => ({ ...row, recordFactsText: 'x'.repeat(200001) }))
    const expectedShort: readonly Marked[] = real.studio.activeProductions.map((row) => ({ ...row,
      recordFactsMarker: marker, recordFactsText: 'x' }))
    const expectedHuge: readonly Marked[] = expectedShort.map((row) => ({ ...row, recordFactsText: huge[0]!.recordFactsText }))
    const small = checked(input(state, short), state, real, expectedShort)
    const large = checked(input(state, huge), state, real, expectedHuge)
    expectTypeOf(large.attempt.projection.productions).toEqualTypeOf<readonly Marked[]>()
    expect(large.result.preparationWork).toBe(small.result.preparationWork)
    expect(large.attempt.projection.productions[0]!.recordFactsMarker).toBe(marker)
    expect(small.attempt.projection.productions[0]!.recordFactsMarker).toBe(marker)
    expect(large.attempt.projection.productions[0]!.recordFactsText).toBe(huge[0]!.recordFactsText)
    const longerKey = short.map(({ recordFactsMarker, ...row }) => ({ ...row,
      recordFactsMarkerWithALongerOwnStringKeyForCopyAccounting: recordFactsMarker }))
    const expectedLongerKey = expectedShort.map(({ recordFactsMarker, ...row }) => ({ ...row,
      recordFactsMarkerWithALongerOwnStringKeyForCopyAccounting: recordFactsMarker }))
    expect(Object.keys(longerKey[0]!).length).toBe(Object.keys(short[0]!).length)
    const longer = checked(input(state, longerKey), state, real, expectedLongerKey)
    expect(longer.result.preparationWork).toBeGreaterThan(small.result.preparationWork)
    expect(longer.attempt.projection.productions[0]!
      .recordFactsMarkerWithALongerOwnStringKeyForCopyAccounting).toBe(marker)
    expect(state).toEqual(before)
    // Generic full-P extensions are legitimate lower-owner inputs, NOT campaign
    // fields or save fixtures. Unknown values must not become string dimensions.
  })
})
