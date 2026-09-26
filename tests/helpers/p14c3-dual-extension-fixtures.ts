// 1002-A B4b / 1013-A: genuine two-episode extensions, no authored history.
// Each target follows103→521 once (418 ticks); memoized failures do not rerun it.
import assert from 'node:assert/strict'
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { extensionIssuer, retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../../src/core/employment.js'
import { professionAtWeek } from '../../src/core/index.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify } from '../../src/core/save.js'
import { caseForTalent, openMarketCaseFor, playerOffer, submitProposal } from '../../src/core/talentMarket.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import type { GameState, TalentMarketCaseV36 } from '../../src/core/types.js'
import { clone, FOCUS, historical37, migrated, person, type Target } from './p14c3-fixtures.js'
import { accepted } from './p14c3-second-episode-fixtures.js'

export const DUAL_TARGETS = ['director', 'writer'] as const
const cache = new Map<string, unknown>(), failures = new Map<string, unknown>()
function memo<T>(target: Target, phase: string, build: () => T): T {
  const key = `${target}/${phase}`
  if (failures.has(key)) throw failures.get(key)
  if (!cache.has(key)) {
    try { cache.set(key, build()) } catch (error) { failures.set(key, error); throw error }
  }
  return clone(cache.get(key) as T)
}
function advance(state: GameState, end: number): GameState {
  expect(Number.isInteger(end) && state.market.tick <= end && end <= 521,
    'B4b hard route cap: no actual world beyond521').toBe(true)
  const count = end - state.market.tick
  for (let i = 0; i < count; i++) state = tick(state, { develop: true })
  expect(state.market.tick).toBe(end)
  return state
}
export function dualOrigin(target: Target): GameState {
  return memo(target, 'origin103', () => {
    const state = migrated('genuine-v37-c3-preannouncement-week103.json.gz'), id = FOCUS[target]
    expect(state.market.tick).toBe(103)
    expect(person(state, id)).toMatchObject({ role: 'actor', age: 69 })
    expect(activeContract(state, id)).toMatchObject({ startWeek: 0, endWeekExclusive: 208 })
    expect(state.careerLifecycle.records.filter(row => row.personId === id)).toEqual([])
    expect(state.talentMarket.cases.filter(row => row.talentId === id)).toEqual([])
    accepted(state)
    return state
  })
}
export function preserveOriginalEvidence(state: GameState, origin: GameState, id: string): void {
  const takes = origin.firstTakes.filter(row => Object.values(row.cast).includes(id))
  expect(takes).toHaveLength(3)
  for (const take of takes) expect(state.firstTakes.find(row => row.eventId === take.eventId)).toEqual(take)
  const films = origin.studio.releasedFilms.filter(row => row.participants
    && Object.values(row.participants.cast).some(credit => credit.talentId === id))
  expect(films).toHaveLength(3)
  for (const film of films) expect(state.studio.releasedFilms.find(row => row.productionId === film.productionId))
    .toMatchObject({ productionId: film.productionId, releaseTick: film.releaseTick, participants: film.participants })
  expect(state.talentProvenance.rows.find(row => row.personId === id)).toEqual(origin.talentProvenance.rows.find(row => row.personId === id))
  expect(state.careerLifecycle.professionAnchors.find(row => row.personId === id)).toEqual(origin.careerLifecycle.professionAnchors.find(row => row.personId === id))
  expect(state.talent.slice(0, origin.talent.length).map(row => row.id)).toEqual(origin.talent.map(row => row.id))
}
export function extensionCase(state: GameState, id: string, opened: number): TalentMarketCaseV36 {
  const rows = state.talentMarket.cases.filter(row => row.talentId === id && row.variant === 'retirementExtension' && row.openedWeek === opened)
  expect(rows).toHaveLength(1)
  return rows[0]!
}
export function observeWindow(state: GameState, id: string, opened: number, decision: number): { kase: TalentMarketCaseV36; term: number } {
  const kase = extensionCase(state, id, opened), record = retirementRecordFor(state, id)
  assert.ok(record)
  expect(state.market.tick).toBe(opened)
  expect(kase).toMatchObject({ outcome: null, closedWeek: null, subjectStudioId: state.hollywood!.playerStudioId })
  expect(openMarketCaseFor(state, id)).toEqual(kase)
  const view = caseForTalent(state, id)
  assert.ok(view)
  expect(view).toMatchObject({ openedWeek: opened, decisionWeek: decision })
  expect(record.effectiveWeek - TUNING.RETIREMENT_EXTENSION_WINDOW_WEEKS).toBe(opened)
  const interval = state.hollywood!.employment.find(row => row.contractId === kase.contractId)
  assert.ok(interval)
  expect(interval).toMatchObject({ endedWeek: null, studioId: state.hollywood!.playerStudioId,
    terms: { talentId: id, endWeekExclusive: decision } })
  expect(extensionIssuer(state, id, opened)).toBe(state.hollywood!.playerStudioId)
  const term = record.effectiveWeek + TUNING.RETIREMENT_NOTICE_WEEKS - view.decisionWeek
  expect(term, 'independently derived E+52−D, not a substituted ordinary renewal').toBe(52)
  return { kase, term }
}
export function offerExtension(state: GameState, id: string): GameState {
  const record = retirementRecordFor(state, id), view = caseForTalent(state, id)
  assert.ok(record && view)
  expect(Math.max(...TUNING.MARKET_PREMIUM_TIERS)).toBe(1.25)
  const term = record.effectiveWeek + TUNING.RETIREMENT_NOTICE_WEEKS - view.decisionWeek
  expect(term).toBe(52)
  const next = submitProposal(state, { talentId: id, issuerStudioId: state.hollywood!.playerStudioId, termWeeks: term, premiumTier: 1.25 })
  expect(next.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([expect.objectContaining({
    issuerStudioId: state.hollywood!.playerStudioId, submittedWeek: state.market.tick,
    startWeek: view.decisionWeek, termWeeks: term, premiumTier: 1.25, promises: [] })])
  expect(next.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'proposalSubmitted' && row.week === state.market.tick))
    .toEqual([expect.objectContaining({ studioId: state.hollywood!.playerStudioId })])
  accepted(next)
  return next
}

export function actorWindow(target: Target): GameState {
  return memo(target, 'actorWindow196', () => {
    const id = FOCUS[target], origin = dualOrigin(target)
    let state = advance(origin, 104)
    const historical = historical37('genuine-v37-c3-announced-week104.json.gz')
    expect(retirementRecordFor(state, id)).toEqual(historical.state.careerLifecycle.records.find(row => row.personId === id))
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: 'actor', announcedWeek: 104, effectiveWeek: 208,
      status: 'announced', ageAtAnnouncement: 70, extensionUsed: false })
    accepted(state)
    state = advance(state, 195)
    expect(openMarketCaseFor(state, id)).toBeUndefined()
    state = advance(state, 196)
    observeWindow(state, id, 196, 208)
    expect(state.talentMarket.cases.filter(row => row.talentId === id)).toHaveLength(1)
    preserveOriginalEvidence(state, origin, id)
    accepted(state)
    return state
  })
}
export function actorSettlement(target: Target): GameState {
  return memo(target, 'actorSettled208', () => {
    const id = FOCUS[target], state = advance(offerExtension(actorWindow(target), id), 208)
    expect(activeContract(state, id), 'actual first extension settlement, no forced winner').toMatchObject({ startWeek: 208, endWeekExclusive: 260, termWeeks: 52 })
    expect(extensionCase(state, id, 196)).toMatchObject({ outcome: 'settled', closedWeek: 208 })
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: 'actor', status: 'announced',
      extendedFromWeek: 208, effectiveWeek: 260, extensionUsed: true })
    expect(person(state, id).role).toBe('actor')
    expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)).toEqual([])
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id)).toEqual([])
    expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
    accepted(state)
    return state
  })
}
export function changedAndHired(target: Target): { beforeHire: GameState; state: GameState } {
  return memo(target, 'changedAndHired260', () => {
    const id = FOCUS[target], settled = actorSettlement(target), actorCase = clone(extensionCase(settled, id, 196))
    let state = advance(settled, 248)
    expect(openMarketCaseFor(state, id), 'moved Actor E−12 cannot create a second used-episode extension').toBeUndefined()
    expect(state.talentMarket.cases.filter(row => row.talentId === id)).toEqual([actorCase])
    state = advance(state, 260)
    expect(person(state, id), 'actual develop:true retirement must select the intended new profession').toMatchObject({ role: target, age: 73 })
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 260,
      extendedFromWeek: 208, effectiveWeek: 260, extensionUsed: true })
    expect(activeContract(state, id)).toBeUndefined()
    expect(busyTalentIds(state).has(id)).toBe(false)
    expect(state.hollywood!.employment.filter(row => row.terms.talentId === id && row.terms.startWeek <= 260
      && 260 < (row.endedWeek ?? row.terms.endWeekExclusive))).toEqual([])
    expect(state.freeAgents.filter(row => row === id)).toHaveLength(1)
    const evaluation = state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)
    expect(evaluation).toHaveLength(1)
    expect(evaluation[0]).toMatchObject({ week: 260, source: { personId: id, profession: 'actor' },
      outcome: 'chosen', selected: target, inputs: { age: 73, actingFirstTakes: 3 } })
    const selected = evaluation[0]!.inputs.targets.find(row => row.profession === target)
    assert.ok(selected)
    expect(selected.capability, 'actual current eligibility, never frozen authored80').toBeGreaterThanOrEqual(60)
    expect(selected.proven || selected.contextCount >= 2).toBe(true)
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id))
      .toEqual([expect.objectContaining({ week: 260, from: 'actor', to: target, evaluationId: evaluation[0]!.id })])
    expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
    accepted(state)
    const beforeHire = clone(state), offer = playerOffer(state, id, 208, 260)
    state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
    expect(activeContract(state, id)).toMatchObject({ startWeek: 260, endWeekExclusive: 468, termWeeks: 208,
      annualSalary: offer.annualSalary, signingBonus: offer.signingBonus })
    expect(state.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus' && row.week === 260))
      .toEqual([expect.objectContaining({ amount: -offer.signingBonus })])
    expect(extensionCase(state, id, 196)).toEqual(actorCase)
    preserveOriginalEvidence(state, dualOrigin(target), id)
    accepted(state)
    return { beforeHire, state }
  })
}
export function destinationWindow(target: Target): GameState {
  return memo(target, 'destinationWindow456', () => {
    const id = FOCUS[target], hired = changedAndHired(target).state
    let state = advance(hired, 364)
    const carrying = activeContract(state, id)
    assert.ok(carrying)
    const ends = state.hollywood!.employment.filter(row => row.terms.talentId === id
      && row.terms.startWeek <= 364 && 364 < (row.endedWeek ?? row.terms.endWeekExclusive)).map(row => row.terms.endWeekExclusive)
    const effective = Math.max(364 + TUNING.RETIREMENT_NOTICE_WEEKS, carrying.endWeekExclusive, ...ends)
    expect(effective).toBe(468)
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: target, announcedWeek: 364, ageAtAnnouncement: 75,
      cause: 'hardBoundary', status: 'announced', effectiveWeek: effective, extensionUsed: false })
    expect(retirementRecordFor(state, id, 'actor')).toEqual(retirementRecordFor(hired, id, 'actor'))
    accepted(state)
    state = advance(state, 455)
    expect(openMarketCaseFor(state, id)).toBeUndefined()
    state = advance(state, 456)
    observeWindow(state, id, 456, 468)
    expect(state.talentMarket.cases.filter(row => row.talentId === id && row.variant === 'retirementExtension')).toHaveLength(2)
    expect(extensionCase(state, id, 196)).toEqual(extensionCase(hired, id, 196))
    expect(professionAtWeek(state, id, 196)).toBe('actor')
    expect(professionAtWeek(state, id, 456)).toBe(target)
    accepted(state)
    return state
  })
}
export function destinationSettlement(target: Target): GameState {
  return memo(target, 'destinationSettled468', () => {
    const id = FOCUS[target], window = destinationWindow(target)
    const state = advance(offerExtension(window, id), 468)
    expect(activeContract(state, id), 'actual second extension settlement').toMatchObject({ startWeek: 468, endWeekExclusive: 520, termWeeks: 52 })
    expect(extensionCase(state, id, 456)).toMatchObject({ outcome: 'settled', closedWeek: 468 })
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: target, status: 'announced',
      extendedFromWeek: 468, effectiveWeek: 520, extensionUsed: true })
    expect(retirementRecordFor(state, id, 'actor')).toEqual(retirementRecordFor(window, id, 'actor'))
    expect(extensionCase(state, id, 196)).toEqual(extensionCase(window, id, 196))
    accepted(state)
    return state
  })
}
export function dualTerminal(target: Target): { at520: GameState; at521: GameState } {
  return memo(target, 'terminal521', () => {
    const id = FOCUS[target], settled = destinationSettlement(target)
    let state = advance(settled, 508)
    expect(openMarketCaseFor(state, id), 'moved destination E−12 cannot create a third extension').toBeUndefined()
    expect(state.talentMarket.cases.filter(row => row.talentId === id)).toEqual(settled.talentMarket.cases.filter(row => row.talentId === id))
    state = advance(state, 520)
    expect(activeContract(state, id)).toBeUndefined()
    expect(busyTalentIds(state).has(id)).toBe(false)
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: target, status: 'retired', retiredWeek: 520 })
    accepted(state)
    const before = stableStringify(state), raw = exportSave(makeSave(state))
    const reopened = migrateToLive(importSave(raw)).state
    expect(stableStringify(reopened)).toBe(before)
    const at521 = advance(reopened, 521)
    accepted(at521)
    return { at520: state, at521 }
  })
}
