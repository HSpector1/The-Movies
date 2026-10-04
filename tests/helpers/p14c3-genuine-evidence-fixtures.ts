// 1018-A/1020-A: genuine public continuations only. No fixture bytes or existing
// helper are edited. Each group caches failures and enforces its aggregate cap.
import assert from 'node:assert/strict'
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../../src/core/employment.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV45 } from '../../src/core/save.js'
import { careerIdentity } from '../../src/core/talentSummary.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import type { Action, GameState, TransitionEvaluation } from '../../src/core/types.js'
import { clone, DEFERRED_ACTOR, deferredBoundary, FOCUS, migrated, person } from './p14c3-fixtures.js'

export function acceptedEvidence(state: GameState): void {
  const before = stableStringify(state), saved = makeSave(state)
  expect(saved.saveVersion).toBe(45)
  expect(validateSaveV45(saved)).toBe(saved)
  expect(stableStringify(state)).toBe(before)
}
export function reopenEvidence(state: GameState): GameState {
  acceptedEvidence(state)
  const raw = exportSave(makeSave(state)), loaded = migrateToLive(importSave(raw)).state
  acceptedEvidence(loaded)
  expect(exportSave(makeSave(loaded))).toBe(raw)
  return loaded
}
export const actEvidence = (state: GameState, action: Action): GameState => applyActions(state, [action])
export function addYoungEvidence(state: GameState, role: 'actor' | 'director' | 'writer' | 'craft', label: string) {
  const count = state.talent.length, week = state.market.tick
  let next = actEvidence(state, { kind: 'createTalent', talent: { name: `1020 ${label}`, role, age: 30,
    actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } })
  expect(next.talent).toHaveLength(count + 1)
  const id = next.talent.at(-1)!.id
  expect(person(next, id)).toMatchObject({ age: 30, role })
  next = actEvidence(next, { kind: 'signContract', talentId: id, termWeeks: 52 })
  expect(activeContract(next, id)).toMatchObject({ startWeek: week, endWeekExclusive: week + 52 })
  return { state: next, id }
}
export function greenlightEvidence(state: GameState, team: { writerId: string; directorId: string;
  cast: { lead: string; antagonist: string; support: string }; craftIds: string[] }) {
  const concept = state.concepts.find(row => !state.studio.activeProductions.some(film => film.conceptId === row.id)
    && !state.studio.releasedFilms.some(film => film.conceptId === row.id)
    && !state.scriptDevelopment.projects.some(project => project.conceptId === row.id))
  assert.ok(concept, 'bounded genuine route requires an actual unused concept')
  expect(state.sets.some(set => set.mountedOn === 'facility-soundstage-07' && set.status === 'standing')).toBe(true)
  const ids = new Set(state.studio.activeProductions.map(row => row.id))
  const next = actEvidence(state, { kind: 'greenlight', production: { ...team, conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    budget: { negative: concept.baseNegativeCost, marketing: 0 } } })
  const added = next.studio.activeProductions.filter(row => !ids.has(row.id))
  expect(added).toHaveLength(1)
  acceptedEvidence(next)
  return { state: next, productionId: added[0]!.id }
}
export function releaseEvidence(input: GameState, productionId: string, directorId: string,
  step: (state: GameState) => GameState): GameState {
  let state = input
  for (let count = 0; count < 40; count++) {
    const workflow = state.operations.workflows.find(row => row.productionId === productionId)
    if (workflow?.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
      state = actEvidence(state, { kind: 'assignShootingDirector', productionId, directorId })
    }
    if (state.operations.workflows.find(row => row.productionId === productionId)?.shootingTask?.status === 'ready') {
      state = actEvidence(state, { kind: 'scheduleShootingTake', productionId })
    }
    if (state.studio.activeProductions.find(row => row.id === productionId)?.remainingTicks === 1) {
      state = actEvidence(state, { kind: 'commitPictureToRelease', productionId })
    }
    state = step(state)
    if (state.studio.releasedFilms.some(row => row.productionId === productionId)) {
      acceptedEvidence(state)
      return state
    }
  }
  throw new Error('1020 genuine release premise absent after40 actual ticks; no extra search permitted')
}

type Result<T> = { ok: true; value: T } | { ok: false; error: unknown }
const cache = new Map<string, Result<unknown>>()
function memo<T>(key: string, build: () => T): T {
  const old = cache.get(key) as Result<T> | undefined
  if (old) { if (!old.ok) throw old.error; return clone(old.value) }
  try { const value = build(); cache.set(key, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(key, { ok: false, error }); throw error }
}
const consumed = { deferred: 0, held: 0 }
const limits = { deferred: { ticks: 562, week: 3162 }, held: { ticks: 304, week: 365 } }
function stepEvidence(group: keyof typeof consumed, state: GameState): GameState {
  const limit = limits[group]
  assert.ok(consumed[group] < limit.ticks, `${group} aggregate ${limit.ticks}-tick limit`)
  assert.ok(state.market.tick < limit.week, `${group} maximum world${limit.week}`)
  consumed[group]++
  const next = tick(state, { develop: true })
  expect(next.market.tick).toBe(state.market.tick + 1)
  return next
}
export function evidenceTickCount(group: keyof typeof consumed): number { return consumed[group] }
function heldTo(state: GameState, week: number): GameState {
  assert.ok(Number.isSafeInteger(week) && week >= state.market.tick && week <= 365)
  while (state.market.tick < week) state = stepEvidence('held', state)
  return state
}
export const subjectEvaluations = (state: GameState, id: string) => state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)
export function noSubjectDecision(state: GameState, id: string): void {
  expect(subjectEvaluations(state, id)).toEqual([])
  expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id)).toEqual([])
  expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
  expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
}
function occupiedOrEmployed(state: GameState, id: string) {
  return { busy: busyTalentIds(state).has(id), contracted: activeContract(state, id) !== undefined,
    employed: state.hollywood!.employment.some(row => row.terms.talentId === id
      && row.terms.startWeek <= state.market.tick && state.market.tick < (row.endedWeek ?? row.terms.endWeekExclusive)) }
}
export type DeferredObservation = { week: number; age: number; evaluations: number; lastWeek: number | null;
  due: number[]; finalities: number; changes: number; free: boolean; takes: number;
  busy: boolean; contracted: boolean; employed: boolean }
type DeferredRun = { origin: GameState; beforeAge: GameState; atAge: GameState; loaded: GameState; after: GameState;
  observations: DeferredObservation[] }
export function deferredEvidence(): DeferredRun {
  return memo('deferred-all', () => {
    let state = deferredBoundary()
    acceptedEvidence(state)
    expect(state.talent).toHaveLength(182)
    expect(state.talentProvenance.rows.find(row => row.personId === DEFERRED_ACTOR))
      .toMatchObject({ kind: 'authored_exact_week', ageAtEntry: 23.21459235740464, entryWeek: 468 })
    expect(state.careerLifecycle.transitionDue.filter(row => row.personId === DEFERRED_ACTOR))
      .toEqual([{ personId: DEFERRED_ACTOR, week: 2601 }])
    expect(occupiedOrEmployed(state, DEFERRED_ACTOR)).toEqual({ busy: false, contracted: false, employed: false })
    const origin = clone(state), oldRetirement = clone(retirementRecordFor(state, DEFERRED_ACTOR, 'actor'))
    const observations: DeferredObservation[] = []
    let prior: readonly TransitionEvaluation[] = []
    let beforeAge: GameState | undefined, atAge: GameState | undefined, loaded: GameState | undefined
    while (state.market.tick < 3162) {
      state = stepEvidence('deferred', state)
      const rows = subjectEvaluations(state, DEFERRED_ACTOR)
      expect(rows.slice(0, prior.length), `retained questions at${state.market.tick}`).toEqual(prior)
      expect(retirementRecordFor(state, DEFERRED_ACTOR, 'actor')).toEqual(oldRetirement)
      expect(state.talentProvenance.rows.find(row => row.personId === DEFERRED_ACTOR))
        .toEqual(origin.talentProvenance.rows.find(row => row.personId === DEFERRED_ACTOR))
      const work = occupiedOrEmployed(state, DEFERRED_ACTOR)
      observations.push({ week: state.market.tick, age: person(state, DEFERRED_ACTOR).age, evaluations: rows.length,
        lastWeek: rows.at(-1)?.week ?? null,
        due: state.careerLifecycle.transitionDue.filter(row => row.personId === DEFERRED_ACTOR).map(row => row.week),
        finalities: state.careerLifecycle.industryRetirements.filter(row => row.personId === DEFERRED_ACTOR).length,
        changes: state.careerLifecycle.professionChanges.filter(row => row.personId === DEFERRED_ACTOR).length,
        free: state.freeAgents.includes(DEFERRED_ACTOR),
        takes: state.firstTakes.filter(row => Object.values(row.cast).includes(DEFERRED_ACTOR)).length, ...work })
      if (rows.length !== prior.length) acceptedEvidence(state)
      prior = clone(rows)
      if (state.market.tick === 3160) { acceptedEvidence(state); beforeAge = clone(state) }
      if (state.market.tick === 3161) { atAge = clone(state); loaded = reopenEvidence(state); state = clone(loaded) }
    }
    assert.ok(beforeAge && atAge && loaded)
    acceptedEvidence(state)
    expect(consumed.deferred).toBe(562)
    return { origin, beforeAge, atAge, loaded, after: state, observations }
  })
}

export type HeldEvidence = { origin: GameState; held: GameState; productionId: string; directorId: string }
export function assertHeldEvidence(state: GameState, productionId: string): void {
  expect(state.studio.activeProductions.find(row => row.id === productionId)).toMatchObject({ remainingTicks: 5 })
  const workflow = state.operations.workflows.find(row => row.productionId === productionId)
  expect(workflow?.phase).toBe('shooting')
  expect(workflow?.shootingTask?.status).not.toBe('scheduled')
  expect(state.firstTakes.filter(row => row.productionId === productionId)).toEqual([])
  expect(state.studio.releasedFilms.filter(row => row.productionId === productionId)).toEqual([])
  for (const id of Object.values(FOCUS)) {
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ effectiveWeek: 208, status: 'finishing_commitments', finishingFromWeek: 208 })
    expect(busyTalentIds(state).has(id)).toBe(true)
    noSubjectDecision(state, id)
  }
}
export function heldEvidence(): HeldEvidence {
  return memo('held208', () => {
    let state = migrated('genuine-v37-c3-announced-week104.json.gz')
    expect(state.market.tick).toBe(104)
    acceptedEvidence(state)
    const origin = clone(state)
    state = heldTo(state, 199)
    expect(TUNING.PRODUCTION_TICKS).toBe(8)
    for (const id of Object.values(FOCUS)) {
      expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ effectiveWeek: 208, status: 'announced' })
      expect(busyTalentIds(state).has(id)).toBe(false)
      expect(state.firstTakes.filter(row => Object.values(row.cast).includes(id))).toHaveLength(3)
      noSubjectDecision(state, id)
    }
    const director = addYoungEvidence(state, 'director', 'held director'); state = director.state
    const craft = addYoungEvidence(state, 'craft', 'held craft'); state = craft.state
    const support = addYoungEvidence(state, 'actor', 'held support'); state = support.state
    expect(activeContract(state, 'authored-0003')).toMatchObject({ endWeekExclusive: 208 })
    const made = greenlightEvidence(state, { writerId: 'authored-0003', directorId: director.id,
      cast: { lead: FOCUS.director, antagonist: FOCUS.writer, support: support.id }, craftIds: [craft.id] })
    state = heldTo(made.state, 208)
    assertHeldEvidence(state, made.productionId)
    acceptedEvidence(state)
    return { origin, held: state, productionId: made.productionId, directorId: director.id }
  })
}
export function cancelledBeforeEvidence(): GameState {
  return memo('cancel-before209', () => {
    const f = heldEvidence()
    const result = stepEvidence('held', actEvidence(f.held, { kind: 'cancel', productionId: f.productionId }))
    expect(result.market.tick).toBe(209)
    acceptedEvidence(result)
    return result
  })
}
export function takenEvidence(): GameState {
  return memo('taken209', () => {
    const f = heldEvidence()
    expect(activeContract(f.held, f.directorId)).toMatchObject({ endWeekExclusive: 251 })
    let state = actEvidence(f.held, { kind: 'assignShootingDirector', productionId: f.productionId, directorId: f.directorId })
    state = actEvidence(state, { kind: 'scheduleShootingTake', productionId: f.productionId })
    state = stepEvidence('held', state)
    expect(state.market.tick).toBe(209)
    expect(state.firstTakes.filter(row => row.productionId === f.productionId)).toHaveLength(1)
    acceptedEvidence(state)
    return state
  })
}
export function cancelledAfterEvidence(): GameState {
  return memo('cancel-after210', () => {
    const f = heldEvidence(), state = takenEvidence()
    const after = stepEvidence('held', actEvidence(state, { kind: 'cancel', productionId: f.productionId }))
    expect(after.market.tick).toBe(210)
    acceptedEvidence(after)
    return after
  })
}
export function releasedHeldEvidence(): GameState {
  return memo('held-release', () => {
    const f = heldEvidence()
    return releaseEvidence(takenEvidence(), f.productionId, f.directorId, state => stepEvidence('held', state))
  })
}
export function agedHeldEvidence(): { before: GameState; retired: GameState; loaded: GameState; after: GameState } {
  return memo('held-age364', () => {
    const f = heldEvidence()
    let state = f.held
    while (state.market.tick < 363) {
      state = stepEvidence('held', state)
      assertHeldEvidence(state, f.productionId)
    }
    acceptedEvidence(state)
    for (const [target, id] of Object.entries(FOCUS)) {
      const discipline = target === 'director' ? 'directing' : 'writing'
      const standing = careerIdentity(person(state, id)).disciplines.find(row => row.discipline === discipline)
      assert.ok(standing)
      expect(standing.capable).toBe(true)
      expect(standing.ovr).toBeGreaterThanOrEqual(60)
      expect(person(state, id).age).toBe(74)
    }
    const before = clone(state)
    state = stepEvidence('held', actEvidence(state, { kind: 'cancel', productionId: f.productionId }))
    expect(state.market.tick).toBe(364)
    acceptedEvidence(state)
    const retired = clone(state), loaded = reopenEvidence(state)
    const after = stepEvidence('held', loaded)
    expect(after.market.tick).toBe(365)
    acceptedEvidence(after)
    return { before, retired, loaded, after }
  })
}
