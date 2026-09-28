// Independent1002-A B4b / 1013-A: two actually paid extensions for one identity,
// with dated profession cases. First execution is qualification, not invented RED.
import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { extensionIssuer, retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract } from '../src/core/employment.js'
import { professionAtWeek } from '../src/core/index.js'
import { convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, exportSave, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { marketEligibility, openMarketCaseFor, playerOffer, submitProposal } from '../src/core/talentMarket.js'
import { careerIdentity } from '../src/core/talentSummary.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { FOCUS, person } from './helpers/p14c3-fixtures.js'
import { actorSettlement, actorWindow, changedAndHired, destinationSettlement, destinationWindow, DUAL_TARGETS,
  dualOrigin, dualTerminal, extensionCase, observeWindow, offerExtension, preserveOriginalEvidence } from './helpers/p14c3-dual-extension-fixtures.js'
import { accepted } from './helpers/p14c3-second-episode-fixtures.js'

function windowRefusals(state: GameState, id: string, opened: number, decision: number): void {
  const { term } = observeWindow(state, id, opened, decision), owner = state.hollywood!.playerStudioId
  const rival = state.hollywood!.identities.find(row => row.studioId !== owner && row.enteredWeek !== null
    && row.enteredWeek <= state.market.tick && state.hollywood!.businesses.some(business => business.studioId === row.studioId))
  assert.ok(rival, 'wrong-issuer control names an actual entered non-incumbent with a real business')
  const before = stableStringify(state)
  expect(marketEligibility(state, id).proposers).toEqual([owner])
  expect(() => submitProposal(state, { talentId: id, issuerStudioId: rival.studioId, termWeeks: term, premiumTier: 1.25 }))
    .toThrow(/retirementAnnounced/)
  const nextEnd = retirementRecordFor(state, id)!.effectiveWeek + TUNING.RETIREMENT_NOTICE_WEEKS
  for (const wrongTerm of [term - 1, term + 1]) {
    expect(() => submitProposal(state, { talentId: id, issuerStudioId: owner, termWeeks: wrongTerm, premiumTier: 1.25 }))
      .toThrow(`must end at exactly week ${nextEnd}`)
  }
  expect(stableStringify(state)).toBe(before)
}
function assertRepeatRefused(state: GameState, id: string): void {
  const before = stableStringify(state)
  expect(retirementRecordFor(state, id)).toMatchObject({ status: 'announced', extensionUsed: true })
  expect(openMarketCaseFor(state, id)).toBeUndefined()
  expect(extensionIssuer(state, id, state.market.tick)).toBeNull()
  expect(() => submitProposal(state, { talentId: id, issuerStudioId: state.hollywood!.playerStudioId,
    termWeeks: 52, premiumTier: 1.25 })).toThrow(/retirementAnnounced/)
  expect(stableStringify(state)).toBe(before)
}
function assertPaidExtension(state: GameState, id: string, opened: number, decision: number, start: number): void {
  const owner = state.hollywood!.playerStudioId, kase = extensionCase(state, id, opened)
  expect(kase).toMatchObject({ outcome: 'settled', closedWeek: decision, subjectStudioId: owner })
  const oldEmployment = state.hollywood!.employment.find(row => row.contractId === kase.contractId)
  assert.ok(oldEmployment)
  expect(oldEmployment).toMatchObject({ studioId: owner, endedWeek: decision,
    terms: { talentId: id, startWeek: start, endWeekExclusive: decision } })
  expect(state.hollywood!.receipts.filter(row => row.kind === 'employment' && row.reason === 'expiry'
    && row.contractId === kase.contractId && row.talentId === id && row.week === decision))
    .toEqual([expect.objectContaining({ studioId: owner, fromStudioId: owner, toStudioId: null })])
  const newEmployment = state.hollywood!.employment.filter(row => row.studioId === owner && row.terms.talentId === id
    && row.terms.startWeek === decision && row.terms.endWeekExclusive === decision + 52)
  expect(newEmployment).toHaveLength(1)
  expect(newEmployment[0]!.contractId).not.toBe(kase.contractId)
  const contract = activeContract(state, id)
  assert.ok(contract)
  const expectedAnnual = Math.round(playerOffer(state, id, 52, decision).annualSalary * 1.25)
  const expectedBonus = Math.round(expectedAnnual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
  expect(contract).toMatchObject({ startWeek: decision, endWeekExclusive: decision + 52,
    annualSalary: expectedAnnual, signingBonus: expectedBonus })
  expect(newEmployment[0]!.terms).toEqual(contract)
  expect(state.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus' && row.week >= opened && row.week <= decision))
    .toEqual([expect.objectContaining({ week: decision, amount: -expectedBonus })])
  // Receipts carry no contractId. The exact case above supplies the employment
  // join; subject+issuer+kind+actual opening/decision span supplies receipt identity.
  expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'proposalSubmitted'
    && row.week >= opened && row.week <= decision)).toEqual([expect.objectContaining({ studioId: owner, week: opened })])
  expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'settled'
    && row.week >= opened && row.week <= decision)).toEqual([expect.objectContaining({ studioId: owner, week: decision,
      reasons: ['they accepted the one final extension before retiring'], dropped: [] })])
  expect(state.talentMarket.proposals.filter(row => row.talentId === id), 'terminal cases retain receipts, not current proposals').toEqual([])
}

describe.each(DUAL_TARGETS)('C.3 actor→%s two genuine profession extensions', target => {
  it('X1 observes the real actor notice/window and admits only the exact incumbent extension proposal', () => {
    const state = actorWindow(target), id = FOCUS[target], before = stableStringify(state)
    windowRefusals(state, id, 196, 208)
    const offered = offerExtension(state, id)
    expect(retirementRecordFor(offered, id)).toMatchObject({ profession: 'actor', announcedWeek: 104,
      effectiveWeek: 208, extensionUsed: false, status: 'announced' })
    expect(professionAtWeek(offered, id, 196)).toBe('actor')
    expect(offered.contracts).toEqual(state.contracts)
    expect(offered.ledger).toEqual(state.ledger)
    preserveOriginalEvidence(offered, dualOrigin(target), id)
    expect(stableStringify(state)).toBe(before)
  })

  it('X2 settles and pays the actual actor208→260 extension once and refuses another in that episode', () => {
    const state = actorSettlement(target), id = FOCUS[target]
    assertPaidExtension(state, id, 196, 208, 0)
    expect(person(state, id)).toMatchObject({ role: 'actor', age: 72 })
    expect(retirementRecordFor(state, id)).toMatchObject({ extendedFromWeek: 208, effectiveWeek: 260,
      extensionUsed: true, status: 'announced', retiredWeek: null })
    expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)).toEqual([])
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id)).toEqual([])
    expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
    assertRepeatRefused(state, id)
    accepted(state)
  })

  it('X3 truly retires acting at260, satisfies current eligibility and hires the same identity in its new profession', () => {
    const f = changedAndHired(target), state = f.beforeHire, id = FOCUS[target]
    expect(state.market.tick).toBe(260)
    expect(person(state, id)).toMatchObject({ role: target, age: 73 })
    expect(state.freeAgents).toContain(id)
    const takes = state.firstTakes.filter(row => Object.values(row.cast).includes(id))
    expect(takes).toHaveLength(3)
    expect(new Set(takes.map(row => JSON.stringify([row.studioId, row.productionId]))).size).toBe(3)
    const leadTakes = takes.filter(row => row.cast.lead === id)
    const films = state.studio.releasedFilms.filter(row => row.participants
      && Object.values(row.participants.cast).some(credit => credit.talentId === id))
    expect(films).toHaveLength(3)
    expect(state.hollywood!.films.filter(row => row.credits.some(credit => credit.talentId === id))).toEqual([])
    const contextCount = target === 'director' ? leadTakes.length : films.length
    expect(contextCount).toBe(3)
    if (target === 'director') expect(new Set(leadTakes.map(row => row.directorId))).toEqual(new Set(['authored-0002']))
    else expect(new Set(films.map(row => row.participants!.writer.talentId))).toEqual(new Set(['authored-0003']))
    const evaluation = state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)
    expect(evaluation).toHaveLength(1)
    expect(evaluation[0]).toMatchObject({ week: 260, outcome: 'chosen', selected: target,
      inputs: { age: 73, actingFirstTakes: takes.length, leadFirstTakes: leadTakes.length } })
    const selected = evaluation[0]!.inputs.targets.find(row => row.profession === target)!
    const publicDiscipline = careerIdentity(person(state, id)).disciplines.find(row => row.discipline === (target === 'director' ? 'directing' : 'writing'))!
    expect(selected.capability).toBe(publicDiscipline.ovr)
    expect(selected.capability).toBeGreaterThanOrEqual(60)
    expect(selected.contextCount).toBe(contextCount)
    expect(selected.proven || contextCount >= 2).toBe(true)
    expect(professionAtWeek(state, id, 259)).toBe('actor')
    expect(professionAtWeek(state, id, 260)).toBe(target)
    expect(activeContract(f.state, id)).toMatchObject({ startWeek: 260, endWeekExclusive: 468, termWeeks: 208 })
    expect(f.state.careerLifecycle).toEqual(state.careerLifecycle)
    preserveOriginalEvidence(f.state, dualOrigin(target), id)
    accepted(f.state)
  })

  it('X4 opens a new-profession extension despite the genuinely used old actor extension', () => {
    const state = destinationWindow(target), id = FOCUS[target]
    const old = actorSettlement(target)
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 260,
      extendedFromWeek: 208, effectiveWeek: 260, extensionUsed: true })
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: target, announcedWeek: 364, ageAtAnnouncement: 75,
      effectiveWeek: 468, extensionUsed: false, status: 'announced' })
    expect(extensionCase(state, id, 196)).toEqual(extensionCase(old, id, 196))
    expect(extensionCase(state, id, 456).contractId).not.toBe(extensionCase(state, id, 196).contractId)
    windowRefusals(state, id, 456, 468)
    const offered = offerExtension(state, id)
    expect(professionAtWeek(offered, id, extensionCase(offered, id, 196).openedWeek)).toBe('actor')
    expect(professionAtWeek(offered, id, extensionCase(offered, id, 456).openedWeek)).toBe(target)
    expect(offered.talentMarket.receipts.filter(row => row.talentId === id && row.week <= 208))
      .toEqual(old.talentMarket.receipts.filter(row => row.talentId === id))
    accepted(offered)
  })

  it('X5 settles and pays the destination468→520 extension while preserving both dated cases through current persistence', () => {
    const state = destinationSettlement(target), id = FOCUS[target], old = actorSettlement(target)
    assertPaidExtension(state, id, 456, 468, 260)
    expect(retirementRecordFor(state, id, 'actor')).toEqual(retirementRecordFor(changedAndHired(target).state, id, 'actor'))
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: target, extendedFromWeek: 468,
      effectiveWeek: 520, extensionUsed: true, status: 'announced' })
    expect(state.careerLifecycle.records.filter(row => row.personId === id && row.extensionUsed)).toHaveLength(2)
    expect(state.talentMarket.cases.filter(row => row.talentId === id && row.variant === 'retirementExtension' && row.outcome === 'settled')).toHaveLength(2)
    expect(extensionCase(state, id, 196)).toEqual(extensionCase(old, id, 196))
    expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.week <= 208))
      .toEqual(old.talentMarket.receipts.filter(row => row.talentId === id))
    assertRepeatRefused(state, id)
    const saved = makeSave(state), raw = exportSave(saved), loaded = migrateToLive(importSave(raw)).state
    expect(exportSave(makeSave(loaded))).toBe(raw)
    expect(loaded.talentMarket.cases.filter(row => row.talentId === id)).toEqual(state.talentMarket.cases.filter(row => row.talentId === id))
    expect(loaded.careerLifecycle).toEqual(state.careerLifecycle)
    expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(saved))))).toThrow(/cannot downgrade or discard an opportunity predicate or recorded first-take subject/)
    accepted(loaded)
  })

  it('X6 opens no third case and records real destination520 finality once through loaded521', () => {
    const f = dualTerminal(target), id = FOCUS[target], before = destinationSettlement(target)
    const finality = [{ personId: id, week: 520, profession: target,
      source: { personId: id, profession: target }, cause: 'noCatalogue', evaluationId: null }]
    for (const state of [f.at520, f.at521]) {
      expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual(finality)
      expect(retirementRecordFor(state, id)).toMatchObject({ status: 'retired', retiredWeek: 520,
        effectiveWeek: 520, extendedFromWeek: 468, extensionUsed: true })
      expect(retirementRecordFor(state, id, 'actor')).toEqual(retirementRecordFor(before, id, 'actor'))
      expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
        .toEqual(before.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
      expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id))
        .toEqual(before.careerLifecycle.professionChanges.filter(row => row.personId === id))
      expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
      expect(state.talentMarket.cases.filter(row => row.talentId === id)).toEqual(before.talentMarket.cases.filter(row => row.talentId === id))
      expect(state.talentMarket.receipts.filter(row => row.talentId === id)).toEqual(before.talentMarket.receipts.filter(row => row.talentId === id))
      expect(state.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus'))
        .toEqual(before.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus'))
      expect(state.freeAgents).not.toContain(id)
      expect(activeContract(state, id)).toBeUndefined()
      preserveOriginalEvidence(state, dualOrigin(target), id)
      accepted(state)
    }
    expect(f.at520.hollywood!.receipts.filter(row => row.kind === 'employment' && row.reason === 'expiry'
      && row.talentId === id && row.week === 520)).toHaveLength(1)
    expect(f.at520.market.tick).toBe(520)
    expect(f.at521.market.tick).toBe(521)
  })
})
