// 1019-A/1024-A: genuine two-episode D<E extensions. Eight qualification leaves,
// no fabricated RED, term/date/receipt edits or trust/funding substitutions.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it } from 'vitest'
import { extensionIssuer, retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract, canAfford, contractOffer, hiringMarketIds } from '../src/core/employment.js'
import { professionAtWeek } from '../src/core/index.js'
import { trustDescriptor, trustDrivers } from '../src/core/promises.js'
import { tiersOnRoster } from '../src/core/relationships.js'
import { convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42ToV41, convertV43ToV42, convertV44ToV43, convertV45ToV44, exportSave, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { caseForTalent, marketEligibility, openMarketCaseFor, playerOffer, proposalDraft, releaseFloor, studioOffer, submitProposal } from '../src/core/talentMarket.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { extensionCase } from './helpers/p14c3-dual-extension-fixtures.js'
import { FOCUS, type Target } from './helpers/p14c3-fixtures.js'
import { carryingEmployment, OFFMENU_TARGETS, offmenuAccounting, offmenuRehire, offmenuSettlement,
  offmenuSubmitted, offmenuTerminal, offmenuWindow, ordinaryCase, preserveOffmenuOrigin } from './helpers/p14c3-offmenu-extension-fixtures.js'
import { accepted } from './helpers/p14c3-second-episode-fixtures.js'

const observed: Partial<Record<Target, { floorBinds?: boolean; term?: number; decision?: number; end?: number; finality?: number }>> = {}
afterAll(() => console.info(JSON.stringify({ phase: '1026-offmenu-route-observation', ...offmenuAccounting(), observed })))
function actualTermination(state: GameState, target: Target): void {
  const f = offmenuRehire(target), id = FOCUS[target], owner = state.hollywood!.playerStudioId
  const old = carryingEmployment(state, id, 260, 312)
  expect(old).toEqual({ ...f.oldEmployment, endedWeek: 306 })
  expect(state.hollywood!.receipts.filter(row => row.kind === 'employment' && row.reason === 'termination'
    && row.contractId === old.contractId && row.talentId === id))
    .toEqual([expect.objectContaining({ week: 306, studioId: owner, fromStudioId: owner, toStudioId: null })])
  const cost = Math.round(old.terms.annualSalary / 52) * 6
  expect(state.ledger.filter(row => row.kind === 'termination' && row.talentId === id))
    .toEqual([expect.objectContaining({ week: 306, amount: -cost })])
}
function preserveOrdinaryHistory(state: GameState, target: Target): void {
  const f = offmenuRehire(target), id = FOCUS[target]
  expect(ordinaryCase(state, id)).toEqual(ordinaryCase(f.closed307, id))
  expect(ordinaryCase(state, id)).toMatchObject({ contractId: f.oldEmployment.contractId, openedWeek: 300,
    outcome: 'invalidated', closedWeek: 307 })
  expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.week >= 300 && row.week <= 307))
    .toEqual(f.closed307.talentMarket.receipts.filter(row => row.talentId === id && row.week >= 300 && row.week <= 307))
  expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'settled' && row.week === 312)).toEqual([])
  expect(state.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus' && row.week === 312)).toEqual([])
  actualTermination(state, target)
  for (const promise of f.beforeRelease.promises.filter(row => row.beneficiaryPersonId === id && row.outcome !== null)) {
    expect(state.promises.find(row => row.promiseId === promise.promiseId)).toEqual(promise)
  }
}
function repeatRefused(state: GameState, id: string): void {
  const before = stableStringify(state)
  expect(retirementRecordFor(state, id)).toMatchObject({ status: 'announced', extensionUsed: true })
  expect(openMarketCaseFor(state, id)).toBeUndefined()
  expect(extensionIssuer(state, id, state.market.tick)).toBeNull()
  expect(() => submitProposal(state, { talentId: id, issuerStudioId: state.hollywood!.playerStudioId,
    termWeeks: 58, premiumTier: 1.25 })).toThrow(/retirementAnnounced/)
  expect(stableStringify(state)).toBe(before)
}

describe.each(OFFMENU_TARGETS)('C.3 actor→%s genuine off-menu58-week extension', target => {
  it('O1 records a real six-week termination, floored same-week rehire and invalidation of the old ordinary case', () => {
    const f = offmenuRehire(target), id = FOCUS[target], owner = f.origin.hollywood!.playerStudioId
    for (const state of [f.origin, f.hired260, f.opened300, f.beforeRelease, f.released306, f.rehired306, f.closed307, f.at312]) accepted(state)
    const firstQuote = playerOffer(f.origin, id, 52, 260)
    expect(f.hired260.studio.cash).toBe(f.origin.studio.cash - firstQuote.signingBonus)
    expect(f.hired260.ledger.slice(f.origin.ledger.length))
      .toEqual([expect.objectContaining({ kind: 'signingBonus', week: 260, talentId: id, amount: -firstQuote.signingBonus })])
    expect(f.oldEmployment).toMatchObject({ studioId: owner, endedWeek: null,
      terms: { talentId: id, startWeek: 260, endWeekExclusive: 312, termWeeks: 52 } })
    const oldCase = ordinaryCase(f.opened300, id)
    expect(oldCase.contractId).toBe(f.oldEmployment.contractId)
    expect(f.opened300.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'discovered' && row.week === 300))
      .toEqual([expect.objectContaining({ studioId: owner })])
    expect(312 - f.beforeRelease.market.tick).toBe(6)
    expect(TUNING.TICKS_PER_YEAR).toBe(52)
    expect(TUNING.HIRING_TERMINATION_CAP_WEEKS).toBe(26)
    const cost = Math.round(f.oldEmployment.terms.annualSalary / 52) * 6
    expect(f.released306.studio.cash).toBe(f.beforeRelease.studio.cash - cost)
    expect(f.released306.ledger.slice(f.beforeRelease.ledger.length))
      .toEqual([expect.objectContaining({ kind: 'termination', week: 306, talentId: id, amount: -cost })])
    expect(f.released306.market.tick).toBe(f.rehired306.market.tick)
    expect(activeContract(f.released306, id)).toBeUndefined()
    expect(hiringMarketIds(f.released306)).toContain(id)
    expect(f.released306.freeAgents.filter(row => row === id)).toHaveLength(1)
    expect(f.released306.promises).toEqual(f.beforeRelease.promises)
    expect(f.rehired306.promises).toEqual(f.released306.promises)
    expect(f.released306.talentMarket.receipts.filter(row => row.kind === 'promiseOutcome' && row.talentId === id))
      .toEqual(f.beforeRelease.talentMarket.receipts.filter(row => row.kind === 'promiseOutcome' && row.talentId === id))
    actualTermination(f.released306, target)
    expect(caseForTalent(f.released306, id)).toMatchObject({ status: 'invalidated', decisionWeek: 312, openedWeek: 300 })
    expect(ordinaryCase(f.released306, id)).toEqual(oldCase)
    expect(oldCase).toMatchObject({ outcome: null, closedWeek: null })
    const floor = releaseFloor(f.released306, owner, id), plain = contractOffer(f.released306, id, 104, 306)
    assert.ok(floor)
    expect(floor).toEqual({ floorAnnual: f.oldEmployment.terms.annualSalary, validUntilWeek: 312 })
    const annual = Math.max(plain.annualSalary, floor.floorAnnual)
    const bonus = Math.round(annual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
    const quoted = studioOffer(f.released306, owner, id, 104, 306)
    expect(quoted).toMatchObject({ annualSalary: annual, signingBonus: bonus, startWeek: 306, endWeekExclusive: 410, termWeeks: 104 })
    expect(playerOffer(f.released306, id, 104, 306)).toEqual(quoted)
    observed[target] = { ...observed[target], floorBinds: floor.floorAnnual > plain.annualSalary }
    if (floor.floorAnnual > plain.annualSalary) expect(quoted.annualSalary).toBeGreaterThan(plain.annualSalary)
    else expect(quoted.annualSalary).toBe(plain.annualSalary)
    expect(f.rehired306.studio.cash).toBe(f.released306.studio.cash - bonus)
    expect(f.rehired306.ledger.slice(f.released306.ledger.length))
      .toEqual([expect.objectContaining({ kind: 'signingBonus', week: 306, talentId: id, amount: -bonus })])
    const replacement = carryingEmployment(f.rehired306, id, 306, 410)
    expect(replacement.contractId).not.toBe(f.oldEmployment.contractId)
    expect(replacement).toMatchObject({ endedWeek: null, reason: 'player-contract', terms: { annualSalary: annual, signingBonus: bonus } })
    expect(replacement.terms).toEqual(activeContract(f.rehired306, id))
    expect(f.rehired306.hollywood!.receipts.filter(row => row.kind === 'employment' && row.contractId === replacement.contractId))
      .toEqual([expect.objectContaining({ week: 306, talentId: id, studioId: owner,
        reason: 'player-contract', fromStudioId: null, toStudioId: owner })])
    expect(carryingEmployment(f.rehired306, id, 260, 312).endedWeek).toBe(replacement.terms.startWeek)
    expect(ordinaryCase(f.closed307, id)).toMatchObject({ outcome: 'invalidated', closedWeek: 307 })
    expect(f.closed307.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'invalidated' && row.week === 307))
      .toEqual([expect.objectContaining({ reasons: ['the person was released early and is a free agent now'] })])
    expect(f.closed307.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([])
    expect(releaseFloor(f.at312, owner, id)).toBeNull()
    expect(trustDrivers(f.rehired306, id, owner, 306).filter(row => row.kind === 'terminatedEarly' && row.week === 306))
      .toEqual([expect.objectContaining({ positive: false })])
    preserveOrdinaryHistory(f.at312, target)
    preserveOffmenuOrigin(f.at312, target)
  })

  it('O2 derives real D410<E416 and accepts only the entered incumbent58-week proposal ending468', () => {
    const f = offmenuWindow(target), state = f.window404, id = FOCUS[target], owner = state.hollywood!.playerStudioId
    accepted(f.announced364); accepted(f.before403); accepted(state)
    const record = retirementRecordFor(state, id)
    assert.ok(record)
    expect(record).toMatchObject({ profession: target, announcedWeek: 364, effectiveWeek: 416, extensionUsed: false })
    expect(openMarketCaseFor(f.before403, id)).toBeUndefined()
    const kase = extensionCase(state, id, 404), view = caseForTalent(state, id)
    assert.ok(view)
    expect(kase.contractId).toBe(carryingEmployment(state, id, 306, 410).contractId)
    expect(view).toMatchObject({ openedWeek: 404, decisionWeek: 410, status: 'discovered' })
    expect(view.decisionWeek).toBeLessThan(record.effectiveWeek)
    expect(record.effectiveWeek - TUNING.RETIREMENT_EXTENSION_WINDOW_WEEKS).toBe(404)
    const term = record.effectiveWeek + 52 - view.decisionWeek
    expect(term).toBe(58)
    expect(TUNING.CONTRACT_TERM_OPTIONS).toEqual([52, 104, 156, 208])
    expect(TUNING.CONTRACT_TERM_OPTIONS).not.toContain(term)
    expect(marketEligibility(state, id).proposers).toEqual([owner])
    expect(extensionIssuer(state, id, 404)).toBe(owner)
    const rival = state.hollywood!.identities.find(row => row.studioId !== owner && row.enteredWeek !== null
      && row.enteredWeek <= 404 && state.hollywood!.businesses.some(business => business.studioId === row.studioId))
    assert.ok(rival, 'wrong issuer must be an actual entered non-incumbent, not an invented id')
    const before = stableStringify(state)
    expect(() => submitProposal(state, { talentId: id, issuerStudioId: rival.studioId, termWeeks: term, premiumTier: 1.25 }))
      .toThrow(/retirementAnnounced/)
    for (const wrong of [57, 59, 52]) {
      expect(() => submitProposal(state, { talentId: id, issuerStudioId: owner, termWeeks: wrong, premiumTier: 1.25 }))
        .toThrow('must end at exactly week 468')
    }
    expect(stableStringify(state)).toBe(before)
    const offered = offmenuSubmitted(target), quote = playerOffer(state, id, 58, 404)
    const annual = Math.round(quote.annualSalary * 1.25), bonus = Math.round(annual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
    expect(contractOffer(state, id, 58, 404).annualSalary).toBe(contractOffer(state, id, 52, 404).annualSalary)
    expect(quote.termWeeks).toBe(58)
    expect(canAfford(state, bonus).ok).toBe(true)
    expect(offered.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([expect.objectContaining({
      termWeeks: 58, startWeek: 410, premiumTier: 1.25, issuerStudioId: owner, annualSalary: annual,
      signingBonus: bonus, promises: [], representation: null })])
    expect(offered.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'proposalSubmitted' && row.week === 404))
      .toEqual([expect.objectContaining({ studioId: owner })])
    expect(offered.contracts).toEqual(state.contracts)
    expect(offered.hollywood!.employment).toEqual(state.hollywood!.employment)
    expect(offered.ledger).toEqual(state.ledger)
    expect(offered.studio.cash).toBe(state.studio.cash)
    expect(offered.promises).toEqual(state.promises)
    expect(professionAtWeek(offered, id, 196)).toBe('actor')
    expect(professionAtWeek(offered, id, 404)).toBe(target)
    preserveOrdinaryHistory(offered, target)
    accepted(offered)
  })

  it('O3 actually settles and pays58 weeks at410 with real trust and both dated used episodes preserved', () => {
    const f = offmenuSettlement(target), state = f.settled410, id = FOCUS[target], owner = state.hollywood!.playerStudioId
    const submitted = offmenuSubmitted(target), proposal = submitted.talentMarket.proposals.find(row => row.talentId === id)!
    const kase = extensionCase(state, id, 404), oldEmployment = carryingEmployment(state, id, 306, 410)
    expect(kase).toMatchObject({ contractId: oldEmployment.contractId, subjectStudioId: owner, outcome: 'settled', closedWeek: 410 })
    expect(oldEmployment).toMatchObject({ endedWeek: 410 })
    expect(state.hollywood!.receipts.filter(row => row.kind === 'employment' && row.reason === 'expiry'
      && row.contractId === oldEmployment.contractId && row.talentId === id && row.week === 410))
      .toEqual([expect.objectContaining({ studioId: owner, fromStudioId: owner, toStudioId: null })])
    expect(oldEmployment.contractId).not.toBe(carryingEmployment(state, id, 260, 312).contractId)
    const employment = carryingEmployment(state, id, 410, 468), contract = activeContract(state, id)
    assert.ok(contract)
    expect(employment.contractId).not.toBe(oldEmployment.contractId)
    expect(employment.terms).toEqual(contract)
    expect(contract.termWeeks).toBe(58)
    expect(state.hollywood!.employment.filter(row => row.terms.talentId === id && row.terms.startWeek <= 410
      && 410 < (row.endedWeek ?? row.terms.endWeekExclusive))).toEqual([employment])
    expect(releaseFloor(state, owner, id)).toBeNull()
    const ask = playerOffer(state, id, 58, 410)
    const annual = Math.round(ask.annualSalary * 1.25), bonus = Math.round(annual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
    expect(contract).toMatchObject({ talentId: id, startWeek: 410, endWeekExclusive: 468, annualSalary: annual, signingBonus: bonus })
    expect(annual).toBeGreaterThanOrEqual(Math.round(ask.annualSalary * TUNING.RETIREMENT_EXTENSION_RESERVATION_FACTOR))
    expect(proposalDraft(state, owner, id, 58, 1.25, 410).digest).toBe(proposal.digest)
    expect(proposal.promises).toEqual([])
    expect(state.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus' && row.week >= 404 && row.week <= 410))
      .toEqual([expect.objectContaining({ week: 410, amount: -bonus })])
    expect(state.ledger.slice(0, f.before409.ledger.length)).toEqual(f.before409.ledger)
    expect(state.studio.cash - f.before409.studio.cash)
      .toBe(state.ledger.slice(f.before409.ledger.length).reduce((sum, row) => sum + row.amount, 0))
    expect(state.studio.cash, 'actual affordable settlement remains solvent after its one bonus').toBeGreaterThanOrEqual(0)
    expect(trustDescriptor(state, id, owner, 410).label).not.toBe('Distrusted')
    expect(trustDrivers(state, id, owner, 410).filter(row => row.kind === 'terminatedEarly' && row.week === 306))
      .toEqual([expect.objectContaining({ positive: false })])
    const roster = new Set(state.hollywood!.employment.filter(row => row.studioId === owner && row.terms.talentId !== id
      && row.terms.startWeek < 410 && (row.endedWeek === null || 410 < row.endedWeek)).map(row => row.terms.talentId))
    expect(tiersOnRoster(state, id, roster, 410)).not.toContain('Nemeses')
    expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'settled' && row.week >= 404 && row.week <= 410))
      .toEqual([expect.objectContaining({ week: 410, studioId: owner,
        reasons: ['they accepted the one final extension before retiring'], dropped: [] })])
    expect(state.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([])
    expect(retirementRecordFor(state, id)).toMatchObject({ extendedFromWeek: 416, effectiveWeek: 468,
      extensionUsed: true, status: 'announced', retiredWeek: null })
    expect(state.careerLifecycle.records.filter(row => row.personId === id && row.extensionUsed)).toHaveLength(2)
    expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
    expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
    repeatRefused(state, id)
    preserveOrdinaryHistory(state, target)
    preserveOffmenuOrigin(state, target)
    const saved = makeSave(state), raw = exportSave(saved), loaded = migrateToLive(importSave(raw)).state
    expect(exportSave(makeSave(loaded))).toBe(raw)
    expect(loaded.careerLifecycle).toEqual(state.careerLifecycle)
    expect(loaded.talentMarket.cases.filter(row => row.talentId === id)).toEqual(state.talentMarket.cases.filter(row => row.talentId === id))
    expect(carryingEmployment(loaded, id, 410, 468)).toEqual(employment)
    expect(professionAtWeek(loaded, id, extensionCase(loaded, id, 196).openedWeek)).toBe('actor')
    expect(professionAtWeek(loaded, id, extensionCase(loaded, id, 404).openedWeek)).toBe(target)
    // 1361-N S9 (MASKED), F7 ruling 2: the recorded Power Ranking quarter makes
    // convertV45ToV44 refuse first (src/core/save.ts:10989-10995; reason :10895).
    // x2 measured this first guard in the family; the follow-up must confirm every call.
    // The romance guard remains covered on its own V44 input in p14b10-save-v44.test.ts.
    // V39 stays covered by p13b-s3-save-v23.test.ts; the shelving receipt guard
    // stays covered by the own-era V43 input in p14d1-rival-shelving-save-v43.test.ts.
    expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42ToV41(convertV43ToV42(convertV44ToV43(convertV45ToV44(saved))))))))).toThrow(/^migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter$/)
    accepted(loaded)
    observed[target] = { ...observed[target], term: contract.termWeeks, decision: contract.startWeek, end: contract.endWeekExclusive }
  })

  it('O4 opens no repeat case and preserves actual468 finality and all termination history through loaded469', () => {
    const f = offmenuTerminal(target), before = offmenuSettlement(target).settled410, id = FOCUS[target]
    expect(f.at456.market.tick).toBe(456)
    repeatRefused(f.at456, id)
    expect(f.at468.market.tick).toBe(468)
    expect(f.loaded468.market.tick).toBe(468)
    expect(f.at469.market.tick).toBe(469)
    const finality = [{ personId: id, week: 468, profession: target,
      source: { personId: id, profession: target }, cause: 'noCatalogue', evaluationId: null }]
    for (const state of [f.at468, f.loaded468, f.at469]) {
      accepted(state)
      expect(retirementRecordFor(state, id)).toMatchObject({ profession: target, status: 'retired', retiredWeek: 468,
        effectiveWeek: 468, extendedFromWeek: 416, extensionUsed: true })
      expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual(finality)
      expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
      expect(activeContract(state, id)).toBeUndefined()
      expect(state.freeAgents).not.toContain(id)
      expect(state.talentMarket.cases.filter(row => row.talentId === id)).toEqual(before.talentMarket.cases.filter(row => row.talentId === id))
      expect(state.talentMarket.receipts.filter(row => row.talentId === id)).toEqual(before.talentMarket.receipts.filter(row => row.talentId === id))
      expect(state.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus'))
        .toEqual(before.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus'))
      preserveOrdinaryHistory(state, target)
      preserveOffmenuOrigin(state, target)
    }
    const extension = carryingEmployment(f.at468, id, 410, 468)
    expect(extension).toMatchObject({ endedWeek: 468 })
    expect(f.at468.hollywood!.receipts.filter(row => row.kind === 'employment' && row.reason === 'expiry'
      && row.contractId === extension.contractId && row.talentId === id && row.week === 468)).toHaveLength(1)
    expect(offmenuAccounting().directTickCalls[target]).toBe(209)
    observed[target] = { ...observed[target], finality: f.at468.careerLifecycle.industryRetirements.find(row => row.personId === id)!.week }
  })
})
