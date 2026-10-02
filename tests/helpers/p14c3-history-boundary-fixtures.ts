// 1040/1044's three-call controls plus 1050's separate 52-call cohort witness.
import assert from 'node:assert/strict'
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { beginFounding } from '../../src/core/employment.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV44 } from '../../src/core/save.js'
import { tick } from '../../src/core/tick.js'
import { generateWorld } from '../../src/core/worldgen.js'
import type { Action, GameState } from '../../src/core/types.js'
import { c4Fixture, envelopeV34 } from './p14c4-fixtures.js'
import { clone, expectFocusChosen, migrated } from './p14c3-fixtures.js'

type Cached<T> = { ok: true; value: T } | { ok: false; error: unknown }
const cache = new Map<string, Cached<unknown>>()
let calls = 0
const routeCalls = { actual: 0, dormant: 0, cohort: 0 }
const observations: Record<string, unknown> = {}
export function cachedBoundary<T>(key: string, build: () => T): T {
  const prior = cache.get(key) as Cached<T> | undefined
  if (prior) { if (!prior.ok) throw prior.error; return clone(prior.value) }
  try { const value = build(); cache.set(key, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(key, { ok: false, error }); throw error }
}
export function acceptBoundary(state: GameState): void {
  const before = stableStringify(state), saved = makeSave(state)
  expect(saved.saveVersion).toBe(44)
  expect(validateSaveV44(saved)).toBe(saved)
  expect(stableStringify(state)).toBe(before)
}
export function reopenBoundary(state: GameState): GameState {
  acceptBoundary(state)
  const raw = exportSave(makeSave(state)), loaded = migrateToLive(importSave(raw)).state
  expect(exportSave(makeSave(loaded))).toBe(raw)
  acceptBoundary(loaded)
  return loaded
}
function step(route: 'actual' | 'dormant', state: GameState): GameState {
  assert.ok(calls < 55, '1050 aggregate 55-tick limit')
  assert.ok(routeCalls.actual + routeCalls.dormant < 3, '1040 original three-tick limit')
  assert.ok(routeCalls[route] < (route === 'actual' ? 2 : 1), '1040 per-route tick limit')
  expect(state.market.tick).toBe(route === 'actual' ? 207 + routeCalls.actual : 208)
  calls++; routeCalls[route]++
  const after = tick(state, { develop: true })
  expect(after.market.tick).toBe(state.market.tick + 1)
  acceptBoundary(after)
  return after
}
export function boundaryAccounting() { return { calls, routeCalls: { ...routeCalls }, observations: clone(observations) } }
export function recordBoundary(name: string, value: unknown): void { observations[name] = clone(value) }
export function actual207(): GameState {
  return cachedBoundary('actual207', () => { const state = migrated(); expect(state.market.tick).toBe(207); acceptBoundary(state); return state })
}
export function actual208(): GameState {
  return cachedBoundary('actual208', () => { const state = step('actual', actual207()); expectFocusChosen(state, 208); return state })
}
export function actual209(): GameState {
  return cachedBoundary('actual209', () => step('actual', actual208()))
}
export const CREATOR_KINDS = ['createTalent', 'createCustomTalent', 'createBalancedTalent'] as const
export type CreatorKind = typeof CREATOR_KINDS[number]
export function creatorAction(kind: CreatorKind): Action {
  const ordinary = { name: `1044 ${kind}`, role: 'actor' as const, age: 30, actual: { warmth: 0, gravity: 0, physicality: 0.2 } }
  if (kind === 'createTalent') return { kind, talent: { ...ordinary, potentialTier: 'Steady', workEthic: 55 } }
  if (kind === 'createBalancedTalent') return { kind, talent: { ...ordinary, presetId: 'balancedActingProspect',
    potentialTier: 'Promising', workEthic: 60, allocation: {} } }
  const six = (n: number) => [n, n, n, n, n, n]
  return { kind, talent: { ...ordinary, workEthic: 55, fame: 25,
    skills: { acting: six(65), directing: six(20), writing: six(20), craft: six(20), research: six(1) } } }
}
export function creatorBoundary(kind: CreatorKind) {
  return cachedBoundary(`creator-${kind}`, () => {
    const before = actual209(), state = applyActions(before, [creatorAction(kind)])
    expect(state.talent).toHaveLength(before.talent.length + 1)
    const id = state.talent.at(-1)!.id
    expect(before.talent.some(row => row.id === id)).toBe(false)
    acceptBoundary(state)
    return { before, state, id, loaded: reopenBoundary(state) }
  })
}
export function freshBoundary(): GameState {
  return cachedBoundary('fresh', () => {
    const state = generateWorld('p14c3-history-boundary-current')
    expect(state.market.tick).toBe(0); expect(state.hollywood).toBeNull()
    expect(state.careerLifecycle.professionAnchors.every(row => row.kind === 'existing')).toBe(true)
    acceptBoundary(state)
    return state
  })
}
export function freshIndustryBoundary() {
  return cachedBoundary('fresh-industry', () => {
    const before = freshBoundary(), state = beginFounding(before)
    acceptBoundary(state)
    return { before, state }
  })
}
export function dormantBoundary() {
  return cachedBoundary('dormant208', () => {
    const old = envelopeV34(c4Fixture('genuine-v34-c4-null-hollywood'))
    expect(old.state.market.tick).toBe(208); expect(old.state.hollywood).toBeNull()
    expect(old.state.talent).toHaveLength(60); expect(old.state.careerLifecycle.records).toEqual([])
    const state = migrateToLive(old).state
    acceptBoundary(state)
    return { old, state }
  })
}
export function dormant209(): GameState { return cachedBoundary('dormant209', () => step('dormant', dormantBoundary().state)) }
export function lateIndustryBoundary() {
  return cachedBoundary('late-industry', () => {
    const before = dormant209(), state = beginFounding(before)
    acceptBoundary(state)
    return { before, state }
  })
}
export function deepDeficit2652() {
  return cachedBoundary('deep-deficit2652', () => {
    const old = envelopeV34(c4Fixture('genuine-v34-c4-deep-deficit')), oldBytes = stableStringify(old)
    expect(old.state.market.tick).toBe(2600)
    expect(old.state.talent).toHaveLength(93)
    expect(old.state.careerLifecycle.records).toHaveLength(87)
    expect(old.state.careerLifecycle.records.every(row => row.status === 'retired')).toBe(true)
    const before = migrateToLive(old).state
    expect(before.market.tick).toBe(2600)
    expect(before.careerLifecycle.transitionBoundaryWeek).toBe(2600)
    acceptBoundary(before)
    let state = before, reconciled: GameState | undefined, previous: GameState | undefined
    while (state.market.tick < 2652) {
      assert.ok(calls < 55, '1050 aggregate 55-tick limit')
      assert.ok(routeCalls.cohort < 52, '1050 deep-deficit 52-tick limit')
      expect(state.market.tick).toBe(2600 + routeCalls.cohort)
      if (state.market.tick === 2651) { previous = state; acceptBoundary(previous) }
      calls++; routeCalls.cohort++
      const after = tick(state, { develop: true })
      expect(after.market.tick).toBe(state.market.tick + 1)
      state = after
      if (state.market.tick === 2601) { reconciled = state; acceptBoundary(reconciled) }
    }
    expect(routeCalls.cohort).toBe(52)
    expect(state.market.tick).toBe(2652)
    assert.ok(reconciled && previous, 'both actual reconciliation and pre-cohort snapshots were reached')
    acceptBoundary(state)
    const loaded = reopenBoundary(state)
    expect(stableStringify(old)).toBe(oldBytes)
    return { before, reconciled, previous, state, loaded }
  })
}
export function mutableField(object: object, key: string, value: unknown): void {
  // Explicit malformed-input editing only; never manufactures positive authority.
  Object.defineProperty(object, key, { value, enumerable: true, configurable: true, writable: true })
}
