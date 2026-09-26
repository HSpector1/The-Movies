// 1018-A G1/G5: one actual settlement seam and one real later film, <=41 ticks.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as owner from '../src/core/professionTransitions.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract } from '../src/core/employment.js'
import { careerIdentity, expectedPotentialTier, roleOVR, roleTier } from '../src/core/talentSummary.js'
import { tick } from '../src/core/tick.js'
import type { GameState, RetirementKey } from '../src/core/types.js'
import { clone, expectFocusChosen, FOCUS, migrated, person } from './helpers/p14c3-fixtures.js'
import { acceptedEvidence, actEvidence, addYoungEvidence, greenlightEvidence, releaseEvidence,
  reopenEvidence, subjectEvaluations } from './helpers/p14c3-genuine-evidence-fixtures.js'

type Cached<T> = { ok: true; value: T } | { ok: false; error: unknown }
const cache = new Map<string, Cached<unknown>>()
function memo<T>(key: string, build: () => T): T {
  const found = cache.get(key) as Cached<T> | undefined
  if (found) { if (!found.ok) throw found.error; return clone(found.value) }
  try { const value = build(); cache.set(key, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(key, { ok: false, error }); throw error }
}
let ticks = 0
let releaseWeek: number | null = null
let releasedStateWeek: number | null = null
afterAll(() => console.info(JSON.stringify({ phase: '1020-genuine-route-observation', group: 'G1/G5',
  tickCalls: ticks, releaseWeek, releasedStateWeek })))
function step(state: GameState): GameState {
  assert.ok(ticks < 41 && state.market.tick < 248, 'G1/G5 shared41-tick/max248 cap')
  ticks++
  const after = tick(state, { develop: true })
  expect(after.market.tick).toBe(state.market.tick + 1)
  return after
}
type ObservedOwner = { before: GameState; after: GameState; keys: readonly RetirementKey[]; settled: GameState }
function actualOwner(): ObservedOwner {
  return memo('owner208', () => {
    const input = migrated()
    expect(input.market.tick).toBe(207)
    acceptedEvidence(input)
    expect(input.careerLifecycle.records.map(row => row.personId).sort()).toEqual(Object.values(FOCUS).sort())
    expect(input.careerLifecycle.records.every(row => row.profession === 'actor' && row.status === 'announced' && row.effectiveWeek === 208)).toBe(true)
    expect(input.careerLifecycle.transitionEvaluations).toEqual([])
    expect(input.careerLifecycle.professionChanges).toEqual([])
    expect(input.careerLifecycle.industryRetirements).toEqual([])
    expect(input.careerLifecycle.transitionDue).toEqual([])
    const original = owner.advanceProfessionTransitions
    const observations: Omit<ObservedOwner, 'settled'>[] = []
    const spy = vi.spyOn(owner, 'advanceProfessionTransitions').mockImplementation((state, keys) => {
      const before = clone(state), suppliedKeys = clone(keys)
      const result = original(state, keys)
      expect(keys).toEqual(suppliedKeys)
      expect(state).toEqual(before)
      observations.push({ before, after: clone(result), keys: suppliedKeys })
      return result
    })
    let settled: GameState
    try {
      settled = step(input)
      expect(spy.mock.calls, 'actual tick settlement must reach the real owner exactly once').toHaveLength(1)
      expect(observations).toHaveLength(1)
    } finally { spy.mockRestore() }
    const captured = observations[0]!
    expect(captured.before.market.tick).toBe(208)
    for (const id of Object.values(FOCUS)) {
      expect(captured.keys).toContainEqual({ personId: id, profession: 'actor' })
      expect(retirementRecordFor(captured.before, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 208 })
      expect(person(captured.before, id).role).toBe('actor')
    }
    expectFocusChosen(captured.after, 208)
    expectFocusChosen(settled, 208)
    acceptedEvidence(settled)
    return { ...captured, settled }
  })
}
function masked(state: GameState, chosen: ReadonlySet<string>) {
  return { ...state, freeAgents: [], careerLifecycle: { ...state.careerLifecycle,
    transitionEvaluations: [], professionChanges: [], industryRetirements: [], transitionDue: [] },
  talent: state.talent.map(row => chosen.has(row.id)
    ? { ...row, role: undefined, skill: undefined, salary: undefined } : row) }
}
function actualLaterFilm() {
  return memo('later-release', () => {
    const origin = actualOwner().settled
    let state = clone(origin)
    for (const id of Object.values(FOCUS)) {
      state = actEvidence(state, { kind: 'signContract', talentId: id, termWeeks: 52 })
      expect(activeContract(state, id)).toMatchObject({ startWeek: 208, endWeekExclusive: 260 })
    }
    const cast: string[] = []
    for (const slot of ['lead', 'antagonist', 'support']) {
      const added = addYoungEvidence(state, 'actor', `snapshot ${slot}`); state = added.state; cast.push(added.id)
    }
    const craft = addYoungEvidence(state, 'craft', 'snapshot craft'); state = craft.state
    const made = greenlightEvidence(state, { directorId: FOCUS.director, writerId: FOCUS.writer,
      cast: { lead: cast[0]!, antagonist: cast[1]!, support: cast[2]! }, craftIds: [craft.id] })
    const beforeWork = clone(made.state)
    const released = releaseEvidence(made.state, made.productionId, FOCUS.director, step)
    const film = released.studio.releasedFilms.find(row => row.productionId === made.productionId)
    assert.ok(film)
    releaseWeek = film.releaseTick
    releasedStateWeek = released.market.tick
    expect(film.participants?.director.talentId).toBe(FOCUS.director)
    expect(film.participants?.writer.talentId).toBe(FOCUS.writer)
    expect(released.firstTakes.filter(row => row.productionId === made.productionId)).toHaveLength(1)
    expect(released.market.tick).toBeGreaterThan(208)
    expect(released.market.tick).toBeLessThanOrEqual(248)
    return { origin, beforeWork, released, loaded: reopenEvidence(released), productionId: made.productionId }
  })
}

describe('C.3 genuine transition owner and later public snapshots', () => {
  it('O1 observes the actual retirement-owner call and preserves all state outside its exact write set', () => {
    const { before, after } = actualOwner()
    const old = before.careerLifecycle, current = after.careerLifecycle
    expect(current.transitionEvaluations.slice(0, old.transitionEvaluations.length)).toEqual(old.transitionEvaluations)
    expect(current.professionChanges.slice(0, old.professionChanges.length)).toEqual(old.professionChanges)
    expect(current.industryRetirements.slice(0, old.industryRetirements.length)).toEqual(old.industryRetirements)
    const changes = current.professionChanges.slice(old.professionChanges.length)
    const finalities = current.industryRetirements.slice(old.industryRetirements.length)
    const evaluations = current.transitionEvaluations.slice(old.transitionEvaluations.length)
    expect(changes).toHaveLength(2)
    expect(evaluations).toHaveLength(2)
    expect(finalities).toEqual([])
    expect(old.transitionDue).toEqual([])
    expect(current.transitionDue).toEqual([])
    const ids = new Set(changes.map(row => row.personId))
    expect(ids.has(FOCUS.director) && ids.has(FOCUS.writer)).toBe(true)
    expect(masked(after, ids)).toEqual(masked(before, ids))
    for (const change of changes) {
      const destination = person(after, change.personId)
      expect(change).toMatchObject({ from: 'actor', week: 208 })
      expect(destination.role).toBe(change.to)
      expect(destination.skill).toBe(roleOVR(destination, change.to === 'director' ? 'directing' : 'writing'))
      expect(destination.salary).toBe(core.salaryCurve(destination))
      expect(evaluations.find(row => row.id === change.evaluationId))
        .toMatchObject({ personId: change.personId, week: 208, outcome: 'chosen', selected: change.to })
      expect(current.transitionDue.filter(row => row.personId === change.personId)).toEqual([])
    }
    const expectedFree = [...before.freeAgents]
    for (const change of changes) if (!expectedFree.includes(change.personId)) expectedFree.push(change.personId)
    expect(after.freeAgents).toEqual(expectedFree)
  })

  for (const target of ['director', 'writer'] as const) {
    it(`${target === 'director' ? 'S1' : 'S2'} real later ${target} credit changes public proof but preserves the old stored question`, () => {
      const f = actualLaterFilm(), id = FOCUS[target], discipline = target === 'director' ? 'directing' : 'writing'
      const oldRows = subjectEvaluations(f.origin, id)
      expect(oldRows).toHaveLength(1)
      const oldTarget = oldRows[0]!.inputs.targets.find(row => row.profession === target)!
      expect(oldTarget).toMatchObject({ workHistory: 0, proven: false })
      const beforeStanding = careerIdentity(person(f.beforeWork, id)).disciplines.find(row => row.discipline === discipline)!
      expect(beforeStanding).toMatchObject({ workHistory: 0, capable: true, proven: false })
      for (const state of [f.released, f.loaded]) {
        acceptedEvidence(state)
        const talent = person(state, id), standing = careerIdentity(talent).disciplines.find(row => row.discipline === discipline)!
        expect(standing).toMatchObject({ workHistory: 1, capable: true, proven: true })
        expect(standing.ovr).toBeGreaterThanOrEqual(60)
        expect(state.careerEvents.filter(row => row.talentId === id && row.filmId === f.productionId))
          .toEqual([expect.objectContaining({ role: target, discipline, workHistoryBefore: 0, workHistoryAfter: 1 })])
        const inputs = core.transitionInputsFor(state, id, state.market.tick)
        const current = inputs.targets.find(row => row.profession === target)!
        expect(current).toMatchObject({ capability: standing.ovr, roleTier: roleTier(standing.ovr),
          workHistory: 1, proven: true, potentialTier: expectedPotentialTier(talent, discipline, state.seed) })
        expect(current.workHistory).not.toBe(oldTarget.workHistory)
        expect(current.proven).not.toBe(oldTarget.proven)
        expect(subjectEvaluations(state, id)).toEqual(oldRows)
        expect(state.firstTakes.filter(row => Object.values(row.cast).includes(id)))
          .toEqual(f.origin.firstTakes.filter(row => Object.values(row.cast).includes(id)))
        const oldCredits = f.origin.studio.releasedFilms.filter(row => row.participants
          && Object.values(row.participants.cast).some(credit => credit.talentId === id))
        expect(oldCredits).toHaveLength(3)
        for (const film of oldCredits) expect(state.studio.releasedFilms.find(row => row.productionId === film.productionId)?.participants)
          .toEqual(film.participants)
        expect(() => core.transitionInputsFor(state, id, 208)).toThrow(/public inputs are available only for the current week/)
      }
      expect(ticks).toBeLessThanOrEqual(41)
    })
  }
})
