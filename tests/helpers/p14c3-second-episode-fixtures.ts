// 1002-A / 1006-A: genuine, bounded second-profession writing. Public actions and
// develop:true ticks only; neither lifecycle nor employment/history is authored.
import assert from 'node:assert/strict'
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../../src/core/employment.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV46 } from '../../src/core/save.js'
import { availableDevelopmentCastingSlots } from '../../src/core/scriptDevelopment.js'
import { openMarketCaseFor, submitProposal } from '../../src/core/talentMarket.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import type { Action, GameState, ScriptProject } from '../../src/core/types.js'
import { clone, FOCUS, obligationControls, person, type Target } from './p14c3-fixtures.js'

export const B4_TARGETS = ['director', 'writer'] as const
export type Episode = { target: Target; id: string; state: GameState; origin: GameState }
export type WritingEpisode = Episode & { projectId: string; due: number; effective: number; youngWriterId: string;
  commissioned: GameState }
const renewalCache = new Map<Target, Episode>()
const announcementCache = new Map<Target, Episode>()
const writingCache = new Map<Target, WritingEpisode>()
const completionCache = new Map<Target, { direct: GameState; reopened: GameState }>()

export function accepted(state: GameState): void {
  const before = stableStringify(state), save = makeSave(state)
  expect(save.saveVersion).toBe(46)
  expect(validateSaveV46(save)).toBe(save)
  expect(stableStringify(state)).toBe(before)
}
export function advanceExactly(state: GameState, end: number): GameState {
  expect(Number.isSafeInteger(end) && end >= state.market.tick && end <= 495,
    '1002-A finite route: no state may advance beyond208+287').toBe(true)
  const steps = end - state.market.tick
  for (let i = 0; i < steps; i++) state = tick(state, { develop: true })
  expect(state.market.tick).toBe(end)
  return state
}
export function originalCommission(writerId: string): Action {
  return { kind: 'commissionOriginalScreenplay', screenplay: { writerId, genre: 'crime',
    shape: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
    promise: { genre: 'crime', intendedSegments: ['adult'], ranges: {
      intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] } } } }
}
export function projectFor(state: GameState, projectId: string): ScriptProject {
  const project = state.scriptDevelopment.projects.find(row => row.id === projectId)
  assert.ok(project, 'the actual original screenplay remains identifiable')
  return project
}
export function preserveActorHistory(state: GameState, origin: GameState, id: string): void {
  expect(retirementRecordFor(state, id, 'actor')).toEqual(retirementRecordFor(origin, id, 'actor'))
  expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 208 })
  expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
    .toEqual(origin.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
  expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id))
    .toEqual(origin.careerLifecycle.professionChanges.filter(row => row.personId === id))
  expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
  expect(state.talentProvenance.rows.find(row => row.personId === id))
    .toEqual(origin.talentProvenance.rows.find(row => row.personId === id))
  expect(state.careerLifecycle.professionAnchors.find(row => row.personId === id))
    .toEqual(origin.careerLifecycle.professionAnchors.find(row => row.personId === id))
  expect(state.talent.slice(0, origin.talent.length).map(row => row.id)).toEqual(origin.talent.map(row => row.id))
  const originalTakes = origin.firstTakes.filter(row => Object.values(row.cast).includes(id))
  expect(originalTakes).toHaveLength(3)
  for (const take of originalTakes) expect(state.firstTakes.find(row => row.eventId === take.eventId)).toEqual(take)
  const originalFilms = origin.studio.releasedFilms.filter(row => row.participants
    && Object.values(row.participants.cast).some(credit => credit.talentId === id))
  expect(originalFilms).toHaveLength(3)
  for (const film of originalFilms) {
    expect(state.studio.releasedFilms.find(row => row.productionId === film.productionId))
      .toMatchObject({ productionId: film.productionId, releaseTick: film.releaseTick, participants: film.participants })
  }
}

export function renewedEpisode(target: Target): Episode {
  const cached = renewalCache.get(target)
  if (cached !== undefined) return clone(cached)
  const control = obligationControls('production')
  assert.ok(control.laterProduction && control.laterProductionId)
  let state = applyActions(control.laterProduction, [{ kind: 'cancel', productionId: control.laterProductionId }])
  const id = FOCUS[target], origin = clone(state)
  expect(state.market.tick).toBe(208)
  expect(person(state, id)).toMatchObject({ role: target, age: 72 })
  expect(activeContract(state, id)).toMatchObject({ startWeek: 208, endWeekExclusive: 260 })
  expect(busyTalentIds(state).has(id)).toBe(false)
  accepted(state)
  state = advanceExactly(state, 253)
  expect(retirementRecordFor(state, id)).toBeUndefined()
  const marketCase = openMarketCaseFor(state, id)
  assert.ok(marketCase, 'real ordinary market case before260')
  expect(marketCase.variant).toBe('expiry')
  expect(marketCase.subjectStudioId).toBe(state.hollywood!.playerStudioId)
  expect(marketCase.outcome).toBeNull()
  expect(Math.max(...TUNING.MARKET_PREMIUM_TIERS)).toBe(1.25)
  state = submitProposal(state, { talentId: id, issuerStudioId: state.hollywood!.playerStudioId,
    termWeeks: 208, premiumTier: 1.25 })
  expect(state.talentMarket.proposals.find(row => row.talentId === id && row.issuerStudioId === state.hollywood!.playerStudioId))
    .toMatchObject({ startWeek: 260, termWeeks: 208, premiumTier: 1.25 })
  state = advanceExactly(state, 260)
  expect(activeContract(state, id), 'bounded public premise: real own market win, never a forced employer')
    .toMatchObject({ startWeek: 260, endWeekExclusive: 468, termWeeks: 208 })
  expect(state.talentMarket.cases.find(row => row.contractId === marketCase.contractId))
    .toMatchObject({ outcome: 'settled', closedWeek: 260 })
  expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'settled' && row.week === 260))
    .toEqual([expect.objectContaining({ studioId: state.hollywood!.playerStudioId })])
  preserveActorHistory(state, origin, id)
  accepted(state)
  const result = { target, id, origin, state }
  renewalCache.set(target, result)
  return clone(result)
}

export function announcedEpisode(target: Target): Episode {
  const cached = announcementCache.get(target)
  if (cached !== undefined) return clone(cached)
  const prior = renewedEpisode(target), state = advanceExactly(prior.state, 364)
  expect(person(state, prior.id)).toMatchObject({ role: target, age: 75 })
  expect(activeContract(state, prior.id)).toMatchObject({ startWeek: 260, endWeekExclusive: 468 })
  const ends = state.hollywood!.employment.filter(row => row.terms.talentId === prior.id
    && row.terms.startWeek <= 364 && 364 < (row.endedWeek ?? row.terms.endWeekExclusive))
    .map(row => row.terms.endWeekExclusive)
  const effective = Math.max(364 + TUNING.RETIREMENT_NOTICE_WEEKS, activeContract(state, prior.id)!.endWeekExclusive, ...ends)
  expect(effective, 'the required actual carrying interval fixes the bounded route').toBe(468)
  expect(retirementRecordFor(state, prior.id)).toMatchObject({ profession: target, status: 'announced',
    cause: 'hardBoundary', announcedWeek: 364, ageAtAnnouncement: 75, effectiveWeek: effective })
  preserveActorHistory(state, prior.origin, prior.id)
  accepted(state)
  const result = { ...prior, state }
  announcementCache.set(target, result)
  return clone(result)
}

export function finishingEpisode(target: Target): WritingEpisode {
  const cached = writingCache.get(target)
  if (cached !== undefined) return clone(cached)
  const prior = announcedEpisode(target)
  const effective = retirementRecordFor(prior.state, prior.id)!.effectiveWeek
  let state = advanceExactly(prior.state, effective - 1)
  expect(state.studio.activeProductions).toEqual([])
  if (state.scriptDevelopment.mode === 'legacy') state = applyActions(state, [{ kind: 'activateScriptDevelopment' }])
  expect(state.scriptDevelopment.mode).toBe('managed')
  expect(state.scriptDevelopment.projects).toEqual([])
  expect(state.castingSessions.sessions).toEqual([])
  // Prepare the unrelated command before E so later tests reach the screenplay
  // caller itself, not a creator/signing path on the retained-work snapshot.
  const count = state.talent.length
  state = applyActions(state, [{ kind: 'createTalent', talent: { name: `1006 ${target} branch young writer`,
    role: 'writer', age: 30, actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } }])
  expect(state.talent).toHaveLength(count + 1)
  const youngWriterId = state.talent.at(-1)!.id
  state = applyActions(state, [{ kind: 'signContract', talentId: youngWriterId, termWeeks: 52 }])
  expect(person(state, prior.id).skills.writing).toBeDefined()
  expect(busyTalentIds(state).has(prior.id)).toBe(false)
  expect(activeContract(state, prior.id)).toMatchObject({ endWeekExclusive: effective })
  const countBefore = state.scriptDevelopment.projects.length
  state = applyActions(state, [originalCommission(prior.id)])
  expect(state.scriptDevelopment.projects).toHaveLength(countBefore + 1)
  const project = state.scriptDevelopment.projects.at(-1)!
  expect(project).toMatchObject({ writerId: prior.id, writerIds: [prior.id], commissionedWeek: effective - 1, status: 'drafting' })
  assert.ok(project.dueWeek !== null)
  expect(project.dueWeek, 'real draft must survive both E and E+1; no timing edits').toBeGreaterThan(effective + 1)
  expect(project.dueWeek).toBeLessThanOrEqual(effective + 26)
  accepted(state)
  const commissioned = clone(state)
  state = advanceExactly(state, effective)
  expect(projectFor(state, project.id)).toEqual(project)
  expect(activeContract(state, prior.id)).toBeUndefined()
  expect(retirementRecordFor(state, prior.id)).toMatchObject({ profession: target, status: 'finishing_commitments',
    effectiveWeek: effective, finishingFromWeek: effective, retiredWeek: null })
  expect(state.hollywood!.employment.find(row => row.terms.talentId === prior.id && row.terms.startWeek === 260))
    .toMatchObject({ studioId: state.hollywood!.playerStudioId, endedWeek: effective, terms: { endWeekExclusive: effective } })
  expect(state.hollywood!.receipts.filter(row => row.kind === 'employment' && row.reason === 'expiry'
    && row.talentId === prior.id && row.week === effective)).toHaveLength(1)
  expect(activeContract(state, youngWriterId)).toMatchObject({ startWeek: effective - 1, endWeekExclusive: effective + 51 })
  expect(busyTalentIds(state).has(youngWriterId)).toBe(false)
  expect(availableDevelopmentCastingSlots(state.operations, state.scriptDevelopment, new Set()),
    'real unrelated commission must have spare capacity, not enter the queue').toBeGreaterThan(0)
  preserveActorHistory(state, prior.origin, prior.id)
  accepted(state)
  const result = { ...prior, state, projectId: project.id, due: project.dueWeek, effective, youngWriterId, commissioned }
  writingCache.set(target, result)
  return clone(result)
}

export function completedEpisode(target: Target): { direct: GameState; reopened: GameState } {
  const cached = completionCache.get(target)
  if (cached !== undefined) return clone(cached)
  const f = finishingEpisode(target), raw = exportSave(makeSave(f.state))
  const reopened = migrateToLive(importSave(raw)).state
  expect(stableStringify(reopened)).toBe(stableStringify(f.state))
  const result = { direct: advanceExactly(f.state, f.due), reopened: advanceExactly(reopened, f.due) }
  completionCache.set(target, result)
  return clone(result)
}
