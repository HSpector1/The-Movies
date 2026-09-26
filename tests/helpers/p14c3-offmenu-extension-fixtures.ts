// 1019-A/1024-A: real early termination creates D410<E416, with no edited dates,
// receipts, employment, promises or trust. Two103→469 routes, <=732 total ticks.
import assert from 'node:assert/strict'
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds, hiringMarketIds } from '../../src/core/employment.js'
import { trustDescriptor, trustDrivers } from '../../src/core/promises.js'
import { exportSave, importSave, makeSave, migrateToLive } from '../../src/core/save.js'
import { caseForTalent, openMarketCaseFor, playerOffer, releaseFloor, submitProposal } from '../../src/core/talentMarket.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import type { GameState, TalentMarketCaseV36 } from '../../src/core/types.js'
import { changedAndHired, extensionCase, preserveOriginalEvidence } from './p14c3-dual-extension-fixtures.js'
import { clone, FOCUS, person, type Target } from './p14c3-fixtures.js'
import { accepted } from './p14c3-second-episode-fixtures.js'

export const OFFMENU_TARGETS = ['director', 'writer'] as const
type Cached<T> = { ok: true; value: T } | { ok: false; error: unknown }
const cache = new Map<string, Cached<unknown>>()
const directCalls: Record<Target, number> = { director: 0, writer: 0 }
const prefixes = new Set<Target>()
function memo<T>(target: Target, phase: string, build: () => T): T {
  const key = `${target}/${phase}`, prior = cache.get(key) as Cached<T> | undefined
  if (prior) { if (!prior.ok) throw prior.error; return clone(prior.value) }
  try { const value = build(); cache.set(key, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(key, { ok: false, error }); throw error }
}
function advance(target: Target, state: GameState, end: number): GameState {
  assert.ok(Number.isSafeInteger(end) && end >= state.market.tick && end <= 469, 'off-menu maximum world469')
  while (state.market.tick < end) {
    assert.ok(directCalls[target] < 209, `off-menu ${target}209 direct-tick cap`)
    directCalls[target]++
    const before = state.market.tick
    state = tick(state, { develop: true })
    expect(state.market.tick).toBe(before + 1)
  }
  return state
}
export function offmenuAccounting() {
  return { prefixRouteWeeks: 157, completedPrefixes: [...prefixes], directTickCalls: { ...directCalls },
    completedPrefixWeeksPlusDirectCalls: prefixes.size * 157 + directCalls.director + directCalls.writer }
}
export function carryingEmployment(state: GameState, id: string, start: number, end: number) {
  const rows = state.hollywood!.employment.filter(row => row.studioId === state.hollywood!.playerStudioId
    && row.terms.talentId === id && row.terms.startWeek === start && row.terms.endWeekExclusive === end)
  expect(rows).toHaveLength(1)
  return rows[0]!
}
export function ordinaryCase(state: GameState, id: string): TalentMarketCaseV36 {
  const rows = state.talentMarket.cases.filter(row => row.talentId === id && row.variant === 'expiry' && row.openedWeek === 300)
  expect(rows).toHaveLength(1)
  return rows[0]!
}
export function offmenuOrigin(target: Target): GameState {
  return memo(target, 'origin260', () => {
    // The qualified read-only prefix executes103→260 once; its discarded later
    // 208-week hire is a separate immutable action, never this52-week contract.
    const state = changedAndHired(target).beforeHire, id = FOCUS[target]
    expect(state.market.tick).toBe(260)
    expect(person(state, id)).toMatchObject({ role: target, age: 73 })
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 260,
      extensionUsed: true, extendedFromWeek: 208, effectiveWeek: 260 })
    expect(retirementRecordFor(state, id)).toBeUndefined()
    expect(activeContract(state, id)).toBeUndefined()
    expect(busyTalentIds(state).has(id)).toBe(false)
    expect(state.hollywood!.employment.filter(row => row.terms.talentId === id && row.terms.startWeek <= 260
      && 260 < (row.endedWeek ?? row.terms.endWeekExclusive))).toEqual([])
    expect(state.freeAgents.filter(row => row === id)).toHaveLength(1)
    expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
      .toEqual([expect.objectContaining({ week: 260, outcome: 'chosen', selected: target })])
    accepted(state)
    prefixes.add(target)
    return state
  })
}
export function preserveOffmenuOrigin(state: GameState, target: Target): void {
  const id = FOCUS[target], origin = offmenuOrigin(target)
  preserveOriginalEvidence(state, origin, id)
  expect(retirementRecordFor(state, id, 'actor')).toEqual(retirementRecordFor(origin, id, 'actor'))
  expect(extensionCase(state, id, 196)).toEqual(extensionCase(origin, id, 196))
  expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.week <= 260))
    .toEqual(origin.talentMarket.receipts.filter(row => row.talentId === id))
  expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
    .toEqual(origin.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
  expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id))
    .toEqual(origin.careerLifecycle.professionChanges.filter(row => row.personId === id))
}
export function offmenuRehire(target: Target) {
  return memo(target, 'release-rehire312', () => {
    const id = FOCUS[target], origin = offmenuOrigin(target), owner = origin.hollywood!.playerStudioId
    const quote = playerOffer(origin, id, 52, 260)
    let state = applyActions(origin, [{ kind: 'signContract', talentId: id, termWeeks: 52 }])
    expect(activeContract(state, id)).toMatchObject({ startWeek: 260, endWeekExclusive: 312, termWeeks: 52,
      annualSalary: quote.annualSalary, signingBonus: quote.signingBonus })
    accepted(state)
    const hired260 = clone(state), oldEmployment = clone(carryingEmployment(state, id, 260, 312))
    state = advance(target, state, 300)
    const opened300 = clone(state), kase = ordinaryCase(state, id)
    expect(kase).toMatchObject({ subjectStudioId: owner, contractId: oldEmployment.contractId,
      openedWeek: 300, outcome: null, closedWeek: null })
    expect(openMarketCaseFor(state, id)).toEqual(kase)
    accepted(state)
    state = advance(target, state, 306)
    expect(activeContract(state, id)).toEqual(oldEmployment.terms)
    expect(retirementRecordFor(state, id)).toBeUndefined()
    expect(busyTalentIds(state).has(id)).toBe(false)
    const beforeRelease = clone(state)
    expect(state.promises.filter(row => row.issuerStudioId === owner && row.beneficiaryPersonId === id
      && row.contractId !== null && row.outcome === null), 'actual release premise: no bound open promise is silently erased').toEqual([])
    state = applyActions(state, [{ kind: 'releaseTalent', talentId: id }])
    expect(state.market.tick).toBe(306)
    expect(activeContract(state, id)).toBeUndefined()
    expect(hiringMarketIds(state)).toContain(id)
    expect(state.freeAgents.filter(row => row === id)).toHaveLength(1)
    expect(carryingEmployment(state, id, 260, 312)).toMatchObject({ endedWeek: 306 })
    expect(caseForTalent(state, id)).toMatchObject({ contractId: oldEmployment.contractId, status: 'invalidated', decisionWeek: 312 })
    expect(ordinaryCase(state, id)).toEqual(kase)
    expect(releaseFloor(state, owner, id)).toEqual({ floorAnnual: oldEmployment.terms.annualSalary, validUntilWeek: 312 })
    accepted(state)
    const released306 = clone(state), rehireQuote = playerOffer(state, id, 104, 306)
    state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 104 }])
    expect(state.market.tick).toBe(306)
    expect(activeContract(state, id)).toMatchObject({ startWeek: 306, endWeekExclusive: 410, termWeeks: 104,
      annualSalary: rehireQuote.annualSalary, signingBonus: rehireQuote.signingBonus })
    const newEmployment = carryingEmployment(state, id, 306, 410)
    expect(newEmployment.contractId).not.toBe(oldEmployment.contractId)
    expect(carryingEmployment(state, id, 260, 312)).toMatchObject({ endedWeek: 306 })
    accepted(state)
    const rehired306 = clone(state)
    state = advance(target, state, 307)
    expect(ordinaryCase(state, id)).toMatchObject({ contractId: oldEmployment.contractId, outcome: 'invalidated', closedWeek: 307 })
    expect(state.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([])
    accepted(state)
    const closed307 = clone(state)
    state = advance(target, state, 312)
    expect(activeContract(state, id)).toMatchObject({ startWeek: 306, endWeekExclusive: 410 })
    expect(releaseFloor(state, owner, id)).toBeNull()
    expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'settled' && row.week === 312)).toEqual([])
    expect(state.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus' && row.week === 312)).toEqual([])
    accepted(state)
    return { origin, hired260, oldEmployment, opened300, beforeRelease, released306, rehired306, closed307, at312: state }
  })
}
export function offmenuWindow(target: Target) {
  return memo(target, 'window404', () => {
    const f = offmenuRehire(target), id = FOCUS[target]
    let state = advance(target, f.at312, 364)
    expect(person(state, id)).toMatchObject({ role: target, age: 75 })
    expect(busyTalentIds(state).has(id)).toBe(false)
    const ends = state.hollywood!.employment.filter(row => row.terms.talentId === id && row.terms.startWeek <= 364
      && 364 < (row.endedWeek ?? row.terms.endWeekExclusive)).map(row => row.terms.endWeekExclusive)
    expect(ends).toEqual([410])
    const effective = Math.max(364 + TUNING.RETIREMENT_NOTICE_WEEKS, ...ends)
    expect(effective).toBe(416)
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: target, status: 'announced', cause: 'hardBoundary',
      announcedWeek: 364, ageAtAnnouncement: 75, effectiveWeek: effective, extensionUsed: false })
    accepted(state)
    const announced364 = clone(state)
    state = advance(target, state, 403)
    expect(openMarketCaseFor(state, id)).toBeUndefined()
    expect(state.talentMarket.cases.filter(row => row.talentId === id && row.variant === 'retirementExtension')).toHaveLength(1)
    const before403 = clone(state)
    state = advance(target, state, 404)
    const kase = extensionCase(state, id, 404), employment = carryingEmployment(state, id, 306, 410)
    expect(kase).toMatchObject({ subjectStudioId: state.hollywood!.playerStudioId, contractId: employment.contractId,
      openedWeek: 404, outcome: null, closedWeek: null })
    expect(caseForTalent(state, id)).toMatchObject({ decisionWeek: 410, openedWeek: 404, status: 'discovered' })
    expect(openMarketCaseFor(state, id)).toEqual(kase)
    expect(ordinaryCase(state, id)).toEqual(ordinaryCase(f.closed307, id))
    preserveOffmenuOrigin(state, target)
    accepted(state)
    return { announced364, before403, window404: state }
  })
}
export function offmenuSubmitted(target: Target): GameState {
  return memo(target, 'submitted404', () => {
    const state = offmenuWindow(target).window404, id = FOCUS[target]
    const record = retirementRecordFor(state, id), view = caseForTalent(state, id)
    assert.ok(record && view)
    const term = record.effectiveWeek + 52 - view.decisionWeek
    expect(term).toBe(58)
    const next = submitProposal(state, { talentId: id, issuerStudioId: state.hollywood!.playerStudioId, termWeeks: term, premiumTier: 1.25 })
    expect(next.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([expect.objectContaining({
      issuerStudioId: state.hollywood!.playerStudioId, submittedWeek: 404, startWeek: 410, termWeeks: 58,
      premiumTier: 1.25, promises: [], representation: null })])
    expect(next.contracts).toEqual(state.contracts)
    expect(next.ledger).toEqual(state.ledger)
    expect(next.hollywood!.employment).toEqual(state.hollywood!.employment)
    accepted(next)
    return next
  })
}
export function offmenuSettlement(target: Target) {
  return memo(target, 'settled410', () => {
    const submitted = offmenuSubmitted(target), id = FOCUS[target], owner = submitted.hollywood!.playerStudioId
    let state = advance(target, submitted, 409)
    expect(state.talentMarket.proposals.filter(row => row.talentId === id))
      .toEqual(submitted.talentMarket.proposals.filter(row => row.talentId === id))
    expect(trustDescriptor(state, id, owner, 409).label, 'actual trust is a premise, not guaranteed by premium').not.toBe('Distrusted')
    expect(trustDrivers(state, id, owner, 409).filter(row => row.kind === 'terminatedEarly' && row.week === 306)).toHaveLength(1)
    const before409 = clone(state)
    state = advance(target, state, 410)
    expect(extensionCase(state, id, 404)).toMatchObject({ outcome: 'settled', closedWeek: 410 })
    expect(activeContract(state, id), 'actual acceptance required; no forced winner or funding fallback')
      .toMatchObject({ startWeek: 410, endWeekExclusive: 468, termWeeks: 58 })
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: target, extendedFromWeek: 416,
      effectiveWeek: 468, extensionUsed: true, status: 'announced', retiredWeek: null })
    preserveOffmenuOrigin(state, target)
    accepted(state)
    return { before409, settled410: state }
  })
}
export function offmenuTerminal(target: Target) {
  return memo(target, 'terminal469', () => {
    const before = offmenuSettlement(target).settled410, id = FOCUS[target]
    let state = advance(target, before, 456)
    expect(openMarketCaseFor(state, id)).toBeUndefined()
    expect(state.talentMarket.cases.filter(row => row.talentId === id)).toEqual(before.talentMarket.cases.filter(row => row.talentId === id))
    const at456 = clone(state)
    state = advance(target, state, 468)
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: target, status: 'retired', retiredWeek: 468 })
    expect(activeContract(state, id)).toBeUndefined()
    expect(busyTalentIds(state).has(id)).toBe(false)
    accepted(state)
    const at468 = clone(state), raw = exportSave(makeSave(state)), loaded468 = migrateToLive(importSave(raw)).state
    expect(exportSave(makeSave(loaded468))).toBe(raw)
    accepted(loaded468)
    state = advance(target, loaded468, 469)
    preserveOffmenuOrigin(state, target)
    accepted(state)
    expect(directCalls[target]).toBe(209)
    return { at456, at468, loaded468, at469: state }
  })
}
