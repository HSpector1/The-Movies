// 984 B2 / 995: requested acting stays closed after a real profession change.
// Reuse979's qualified work; all new setup uses public actions at the actual208.
import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { assignmentRefusal, retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { promiseFeasibility } from '../src/core/promises.js'
import type { PromiseDraft } from '../src/core/promises.js'
import { stableStringify } from '../src/core/save.js'
import type { Action, CastSlot, GameState } from '../src/core/types.js'
import { FOCUS, clone, envelope38, obligationControls, person, saveApi } from './helpers/p14c3-fixtures.js'

type Greenlight = Extract<Action, { kind: 'greenlight' }>['production']
type Ready = { state: GameState; production: Greenlight; youngActor: string }
let readyCache: Ready | undefined
function ready(): Ready {
  if (readyCache !== undefined) return clone(readyCache)
  const verified = obligationControls('production')
  assert.ok(verified.laterProduction && verified.laterProductionId)
  let state = verified.laterProduction
  const old = state.studio.activeProductions.find(row => row.id === verified.laterProductionId)
  assert.ok(old)
  expect(state.market.tick).toBe(208)
  expect(state.firstTakes.some(row => row.productionId === old.id)).toBe(false)
  state = applyActions(state, [{ kind: 'cancel', productionId: old.id }])
  expect(state.studio.activeProductions.some(row => row.id === old.id)).toBe(false)
  for (const id of [old.directorId, ...Object.values(old.cast), ...old.craftIds]) expect(busyTalentIds(state).has(id)).toBe(false)
  function add(role: 'director' | 'writer'): string {
    const count = state.talent.length
    state = applyActions(state, [{ kind: 'createTalent', talent: { name: `995 ordinary replacement ${role}`,
      role, age: 30, actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } }])
    expect(state.talent).toHaveLength(count + 1)
    const id = state.talent.at(-1)!.id
    state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 52 }])
    return id
  }
  const directorId = add('director'), writerId = add('writer')
  const concept = state.concepts.find(row => row.id !== old.conceptId
    && !state.studio.activeProductions.some(film => film.conceptId === row.id)
    && !state.studio.releasedFilms.some(film => film.conceptId === row.id)
    && !state.scriptDevelopment.projects.some(project => project.conceptId === row.id))
  assert.ok(concept, 'real unused concept independent of the publicly cancelled picture')
  const production: Greenlight = { conceptId: concept.id, directorId, writerId, cast: clone(old.cast), craftIds: [...old.craftIds],
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    budget: { negative: concept.baseNegativeCost, marketing: 0 } }
  for (const [role, id] of Object.entries(FOCUS)) {
    expect(person(state, id).role).toBe(role)
    expect(person(state, id).skills.acting).toBeDefined()
    expect(activeContract(state, id)).toMatchObject({ startWeek: 208, endWeekExclusive: 260 })
    expect(retirementRecordFor(state, id)).toBeUndefined()
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 208, effectiveWeek: 208 })
    expect(busyTalentIds(state).has(id)).toBe(false)
    expect([directorId, writerId, ...Object.values(production.cast), ...production.craftIds]).not.toContain(id)
  }
  const saved = envelope38(state)
  expect(saveApi('validateSaveV41')(saved)).toBe(saved)
  // The complete ordinary staffing/budget/concept control must succeed before
  // retired-actor attempts; no busy/duplicate seat or missing contract can mask it.
  const before = stableStringify(state), allowed = applyActions(state, [{ kind: 'greenlight', production: clone(production) }])
  expect(allowed.studio.activeProductions.at(-1)).toMatchObject({ conceptId: concept.id, directorId, writerId, cast: production.cast })
  const allowedSave = envelope38(allowed)
  expect(saveApi('validateSaveV41')(allowedSave)).toBe(allowedSave)
  expect(stableStringify(state)).toBe(before)
  readyCache = { state, production, youngActor: production.cast.lead }
  return clone(readyCache)
}
const seatCases = Object.entries(FOCUS).flatMap(([profession, id]) =>
  (['lead', 'antagonist', 'support'] as const).map(slot => ({ profession, id, slot })))
const promiseCases = Object.entries(FOCUS).flatMap(([profession, id]) =>
  (['P1', 'P2'] as const).map(family => ({ profession, id, family })))
function promiseDraft(state: GameState, id: string, family: 'P1' | 'P2'): PromiseDraft {
  const contract = activeContract(state, id)
  assert.ok(contract)
  expect(contract).toMatchObject({ startWeek: 208, endWeekExclusive: 260 })
  return { family: family === 'P1' ? 'APPEARANCE_COUNT' : 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
    issuerStudioId: state.hollywood!.playerStudioId, beneficiaryPersonId: id,
    predicate: family === 'P1' ? { count: 1 } : { kind: 'castRoleCount', count: 1, seatClass: 'lead' },
    windowStartWeek: 208, dueWeekExclusive: 260, startWeek: contract.startWeek,
    termWeeks: contract.endWeekExclusive - contract.startWeek }
}

describe('C.3 B2 requested-profession admission after genuine acting retirement', () => {
  it('B2-01 keeps current new-role admission open while the explicit acting episode stays closed', () => {
    const { state } = ready(), before = stableStringify(state)
    for (const id of Object.values(FOCUS)) {
      expect(assignmentRefusal(state, id, 208)).toBeNull()
      expect(assignmentRefusal(state, id, 208, person(state, id).role)).toBeNull()
      expect(assignmentRefusal(state, id, 208, 'actor')).toMatch(/retiredFromProfession/)
      expect(retirementRecordFor(state, id)).toBeUndefined()
      expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 208 })
    }
    expect(stableStringify(state)).toBe(before)
  })

  it.each(seatCases)('B2-seat refuses current $profession in new cast.$slot through actual greenlight', ({ id, slot }) => {
    const { state, production } = ready(), before = stableStringify(state)
    const cast: Record<CastSlot, string> = { ...production.cast, [slot]: id }
    expect(new Set([production.directorId, production.writerId, ...Object.values(cast), ...production.craftIds]).size)
      .toBe(2 + Object.keys(cast).length + production.craftIds.length)
    const request: Action = { kind: 'greenlight', production: { ...production, cast } }
    const requestBefore = stableStringify(request)
    expect(() => applyActions(state, [request])).toThrow(/retiredFromProfession/)
    expect(stableStringify(state)).toBe(before)
    expect(stableStringify(request)).toBe(requestBefore)
  })

  it.each(promiseCases)('B2-promise refuses current $profession new $family acting feasibility', ({ id, family }) => {
    const { state, youngActor } = ready(), before = stableStringify(state)
    const youngDraft = promiseDraft(state, youngActor, family)
    const young = promiseFeasibility(state, youngDraft, 208)
    expect(young.rulesVersion).toBe(4)
    expect(young.classification, 'same actual contract/window is feasible for an unretired actor').not.toBe('IMPOSSIBLE')
    const draft = promiseDraft(state, id, family), draftBefore = stableStringify(draft)
    const result = promiseFeasibility(state, draft, 208)
    expect(result).toMatchObject({ rulesVersion: 4, week: 208, classification: 'IMPOSSIBLE' })
    expect(result.bottleneck).toMatch(/retire/i)
    expect(stableStringify(state)).toBe(before)
    expect(stableStringify(draft)).toBe(draftBefore)
  })

  it('B2-12 permits the transitioned director to write through existing has-discipline law', () => {
    const { state: idle } = ready(), before = stableStringify(idle), id = FOCUS.director
    expect(person(idle, id).role).toBe('director')
    expect(person(idle, id).skills.writing).toBeDefined()
    expect(assignmentRefusal(idle, id, 208, 'writer')).toBeNull()
    let state = applyActions(idle, [{ kind: 'activateScriptDevelopment' }])
    state = applyActions(state, [{ kind: 'commissionOriginalScreenplay', screenplay: { writerId: id,
      genre: 'crime', shape: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
      promise: { genre: 'crime', intendedSegments: ['adult'], ranges: {
        intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] } } } }])
    const project = state.scriptDevelopment.projects.at(-1)
    assert.ok(project)
    expect(project).toMatchObject({ writerId: id, commissionedWeek: 208, status: 'drafting' })
    expect(project.dueWeek).toBeGreaterThan(208)
    expect(person(state, id).role).toBe('director')
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ retiredWeek: 208 })
    expect(state.careerLifecycle).toEqual(idle.careerLifecycle)
    expect(state.promises).toEqual(idle.promises)
    const saved = envelope38(state)
    expect(saveApi('validateSaveV41')(saved)).toBe(saved)
    expect(stableStringify(idle)).toBe(before)
  })
})
