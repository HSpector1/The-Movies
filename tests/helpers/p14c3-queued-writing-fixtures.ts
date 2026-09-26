// Reviewed1008-A: genuine queued writing alongside a naturally deferred actor.
// No fixture mint, timing/history edits, private permission helper or extra loop.
import assert from 'node:assert/strict'
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../../src/core/employment.js'
import { availableDevelopmentCastingSlots } from '../../src/core/scriptDevelopment.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import type { GameState } from '../../src/core/types.js'
import { clone, person, type Target } from './p14c3-fixtures.js'
import { accepted, originalCommission, preserveActorHistory, projectFor, renewedEpisode } from './p14c3-second-episode-fixtures.js'

export type QueuedWritingFixture = { state: GameState; origin: GameState; focusId: string; unrelatedActorId: string;
  originalProjectId: string; due: number; queuedWriterId: string; fillerWriterId: string }
const cache = new Map<Target, QueuedWritingFixture>()
const failed = new Map<Target, unknown>()

function advance(state: GameState, end: number): GameState {
  expect(Number.isInteger(end) && state.market.tick <= end && end <= 468,
    '1008-A setup bound: stop at settled468; Q1 owns the single469 tick').toBe(true)
  const count = end - state.market.tick
  for (let i = 0; i < count; i++) state = tick(state, { develop: true })
  expect(state.market.tick).toBe(end)
  return state
}
export function addAndSign(state: GameState, role: 'actor' | 'writer', age: number, termWeeks: number, label: string) {
  const count = state.talent.length
  let next = applyActions(state, [{ kind: 'createTalent', talent: { name: label, role, age,
    actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } }])
  expect(next.talent).toHaveLength(count + 1)
  const id = next.talent.at(-1)!.id
  next = applyActions(next, [{ kind: 'signContract', talentId: id, termWeeks }])
  expect(activeContract(next, id)).toMatchObject({ startWeek: state.market.tick, endWeekExclusive: state.market.tick + termWeeks })
  expect(next.talentProvenance.rows.find(row => row.personId === id))
    .toMatchObject({ kind: 'authored_exact_week', ageAtEntry: age, entryWeek: state.market.tick })
  return { state: next, id }
}
export function assertDeferredActor(state: GameState, id: string, weeks: readonly number[], nextDue: number): void {
  expect(person(state, id).role).toBe('actor')
  expect(retirementRecordFor(state, id)).toMatchObject({ profession: 'actor', announcedWeek: 313,
    effectiveWeek: 365, retiredWeek: 365, status: 'retired', extensionUsed: false })
  expect(state.firstTakes.filter(row => Object.values(row.cast).includes(id))).toEqual([])
  expect(state.studio.releasedFilms.filter(row => row.participants
    && Object.values(row.participants.cast).some(credit => credit.talentId === id))).toEqual([])
  expect(state.hollywood!.films.filter(row => row.credits.some(credit => credit.talentId === id
    && ['lead', 'antagonist', 'support'].includes(credit.role)))).toEqual([])
  const evaluations = state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)
  expect(evaluations.map(row => row.week)).toEqual(weeks)
  for (const evaluation of evaluations) expect(evaluation).toMatchObject({ outcome: 'deferred', selected: null,
    reason: 'noEligibleTarget', source: { personId: id, profession: 'actor' }, inputs: { actingFirstTakes: 0 } })
  expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([{ personId: id, week: nextDue }])
  expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id)).toEqual([])
  expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
  expect(state.freeAgents).not.toContain(id)
}

export function queuedWritingFixture(target: Target): QueuedWritingFixture {
  const prior = cache.get(target)
  if (prior !== undefined) return clone(prior)
  // Failed deterministic setup is rethrown, not replayed by the other leaf.
  if (failed.has(target)) throw failed.get(target)
  try {
    const old = renewedEpisode(target)
    let state = advance(old.state, 261)
    const actor = addAndSign(state, 'actor', 70, 104, `1012 ${target} unrelated deferred actor`)
    state = actor.state
    expect(retirementRecordFor(state, actor.id)).toBeUndefined()
    accepted(state)
    state = advance(state, 313)
    expect(person(state, actor.id).age).toBe(71)
    expect(retirementRecordFor(state, actor.id)).toMatchObject({ announcedWeek: 313, effectiveWeek: 365,
      status: 'announced', cause: 'hardBoundary', ageAtAnnouncement: 71 })
    expect(activeContract(state, actor.id)).toMatchObject({ startWeek: 261, endWeekExclusive: 365 })
    accepted(state)
    state = advance(state, 364)
    const carrying = activeContract(state, old.id)
    assert.ok(carrying)
    const ends = state.hollywood!.employment.filter(row => row.terms.talentId === old.id
      && row.terms.startWeek <= 364 && 364 < (row.endedWeek ?? row.terms.endWeekExclusive))
      .map(row => row.terms.endWeekExclusive)
    const effective = Math.max(364 + TUNING.RETIREMENT_NOTICE_WEEKS, carrying.endWeekExclusive, ...ends)
    expect(effective).toBe(468)
    expect(person(state, old.id)).toMatchObject({ role: target, age: 75 })
    expect(retirementRecordFor(state, old.id)).toMatchObject({ announcedWeek: 364, effectiveWeek: effective,
      profession: target, status: 'announced', cause: 'hardBoundary' })
    state = advance(state, 365)
    expect(activeContract(state, actor.id)).toBeUndefined()
    expect(state.hollywood!.receipts.filter(row => row.kind === 'employment' && row.reason === 'expiry'
      && row.talentId === actor.id && row.week === 365)).toHaveLength(1)
    assertDeferredActor(state, actor.id, [365], 417)
    accepted(state)
    state = advance(state, 417)
    expect(person(state, actor.id).age).toBe(73)
    assertDeferredActor(state, actor.id, [365, 417], 469)
    accepted(state)
    state = advance(state, 467)
    expect(state.studio.activeProductions).toEqual([])
    if (state.scriptDevelopment.mode === 'legacy') state = applyActions(state, [{ kind: 'activateScriptDevelopment' }])
    expect(state.scriptDevelopment.projects).toEqual([])
    expect(state.castingSessions.sessions).toEqual([])
    expect(state.operations.facilities.filter(row => row.capability === 'development-casting').reduce((sum, row) => sum + row.capacity, 0)).toBe(2)
    const queued = addAndSign(state, 'writer', 30, 52, `1012 ${target} queued young writer`)
    const filler = addAndSign(queued.state, 'writer', 30, 52, `1012 ${target} one-week pool writer`)
    state = filler.state
    expect(person(state, old.id).skills.writing).toBeDefined()
    expect(busyTalentIds(state).has(old.id)).toBe(false)
    expect(activeContract(state, old.id)).toMatchObject({ endWeekExclusive: 468 })
    state = applyActions(state, [originalCommission(old.id)])
    const project = state.scriptDevelopment.projects.at(-1)!
    expect(project).toMatchObject({ writerId: old.id, writerIds: [old.id], commissionedWeek: 467, status: 'drafting' })
    assert.ok(project.dueWeek !== null)
    expect(project.dueWeek, 'real main draft must still need permission during469 queue admission').toBeGreaterThan(469)
    expect(project.dueWeek).toBeLessThanOrEqual(494)
    accepted(state)
    state = advance(state, 468)
    expect(projectFor(state, project.id)).toEqual(project)
    expect(activeContract(state, old.id)).toBeUndefined()
    expect(retirementRecordFor(state, old.id)).toMatchObject({ profession: target, effectiveWeek: 468,
      status: 'finishing_commitments', finishingFromWeek: 468, retiredWeek: null })
    expect(state.hollywood!.receipts.filter(row => row.kind === 'employment' && row.reason === 'expiry'
      && row.talentId === old.id && row.week === 468)).toHaveLength(1)
    for (const id of [queued.id, filler.id]) {
      expect(person(state, id)).toMatchObject({ role: 'writer', age: 30 })
      expect(activeContract(state, id)).toMatchObject({ startWeek: 467, endWeekExclusive: 519 })
      expect(busyTalentIds(state).has(id)).toBe(false)
    }
    expect(availableDevelopmentCastingSlots(state.operations, state.scriptDevelopment, new Set())).toBe(1)
    expect(state.productionQueue).toEqual([])
    assertDeferredActor(state, actor.id, [365, 417], 469)
    preserveActorHistory(state, old.origin, old.id)
    accepted(state)
    const result = { state, origin: old.origin, focusId: old.id, unrelatedActorId: actor.id,
      originalProjectId: project.id, due: project.dueWeek, queuedWriterId: queued.id, fillerWriterId: filler.id }
    cache.set(target, result)
    return clone(result)
  } catch (error) { failed.set(target, error); throw error }
}

export function fillAndQueue(f: QueuedWritingFixture): { state: GameState; poolId: string; ordinal: number } {
  const unused = f.state.concepts.find(row => !f.state.scriptDevelopment.projects.some(project => project.conceptId === row.id)
    && !f.state.studio.activeProductions.some(project => project.conceptId === row.id)
    && !f.state.studio.releasedFilms.some(film => film.conceptId === row.id))
  assert.ok(unused, 'actual unused pool concept, not an authored reservation')
  let state = applyActions(f.state, [{ kind: 'commissionScript', project: { conceptId: unused.id, writerId: f.fillerWriterId,
    shape: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
    promise: { genre: unused.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] } } } }])
  expect(state.scriptDevelopment.projects).toHaveLength(2)
  const pool = state.scriptDevelopment.projects.at(-1)!
  expect(pool).toMatchObject({ writerId: f.fillerWriterId, commissionedWeek: 468, dueWeek: 469, status: 'drafting' })
  expect(pool.reservation).not.toBeNull()
  expect(availableDevelopmentCastingSlots(state.operations, state.scriptDevelopment, new Set())).toBe(0)
  const before = state
  state = applyActions(state, [originalCommission(f.queuedWriterId)])
  expect(state.productionQueue).toHaveLength(1)
  const entry = state.productionQueue[0]!
  expect(entry).toMatchObject({ kind: 'commissionOriginalScreenplay', queuedWeek: 468, payload: { writerId: f.queuedWriterId } })
  expect(state.concepts).toEqual(before.concepts)
  expect(state.originalScreenplays).toEqual(before.originalScreenplays)
  expect(state.scriptDevelopment).toEqual(before.scriptDevelopment)
  expect(busyTalentIds(state).has(f.queuedWriterId)).toBe(false)
  accepted(state)
  return { state, poolId: pool.id, ordinal: entry.ordinal }
}
