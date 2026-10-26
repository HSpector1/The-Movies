// ── P16C RED: healthy whole-studio absorption — the pure law, the quote and the retention preview ──
//
// Authority: P16 integration contract §5 (willing, stable target at quote and at closing; player
// NotForSale; explicit retention with a disclosed no-action default in target contract order;
// lawful capped exit once, charged to the target; consideration vs cash at par vs charges, each
// once; guarantees disclosed beside value, never netted; no `max(0, price - guarantees)` shortcut;
// a target with an outstanding v1 loan is refused; cancel in-flight research retaining verified
// progress; facilities do not move), §7 group H; 1362-O §5.4, §5.6, §5.8, §5.9.
//
// Executable CLOSING is deferred (contract §2: the P12 operating-state discriminator and the exact
// employment reason values must land first); `closeAbsorption` refuses loudly and names them.
//
// r2: every quote carries the buyer's own fresh, full-scope disclosure (review F7) and a consideration at or above the
// target's ask (F6/F8: library value at the premium plus the post-exit cash taken at par). `quoteAtAsk` discovers the
// ask through the quote's own named refusal. Capacity is cumulative and phase-complete (F2/F24): a stage that cannot
// seat the picture now is not usable capacity, so nothing is "queued".

import { describe, expect, it } from 'vitest'
import * as acq from '../src/core/acquisition.js'
import { guaranteedComp, terminationCost } from '../src/core/employment.js'
import { productionPhaseForRemainingTicks } from '../src/core/productionPhases.js'
import * as finance from '../src/core/rightsFinance.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { stableStringify, importSave, migrateToLive, makeSave, exportCurrentState } from '../src/core/save.js'
import { createHash } from 'node:crypto'
import { tick } from '../src/core/tick.js'
import { conditionRecord, outstandingLoan } from '../src/core/corporateConditionLive.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import * as dd from '../src/core/dueDiligence.js'
import { detached, genuineV45Raw, liveFromGenuine, readersWith, STABLE } from './helpers/p16-fixtures.js'

const FULL_SCOPE = ['rights', 'employment', 'liabilities'] as const
/** The buyer's own fresh, full-scope, paid disclosure about the target (review F7). */
function disclosed(state: GameState, buyerId: string, targetId: string): { state: GameState; disclosureId: string } {
  const { state: next, record } = dd.requestDiligence(state, { recipientId: buyerId, target: { kind: 'studio', studioId: targetId }, scope: [...FULL_SCOPE] }, state.market.tick, STABLE)
  return { state: next, disclosureId: record.id }
}
/** Quote at the target's own ask, discovered through the quote's named refusal (consideration 1 first). */
function quoteAtAsk(state: GameState, input: Omit<acq.AbsorptionInput, 'consideration'>, week: number): acq.AbsorptionQuote | acq.AbsorptionRefusal {
  const probe = acq.quoteAbsorption(state, { ...input, consideration: 1 }, week, STABLE)
  const named = probe.kind === 'refusal' ? /^targetNotWilling:considerationBelowAsk:(\d+)$/.exec(probe.refusal) : null
  return named === null ? probe : acq.quoteAbsorption(state, { ...input, consideration: Number(named[1]) }, week, STABLE)
}

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [player, r01, r02, r03, r04] = [h.playerStudioId, ...h.identities.slice(1, 5).map((i) => i.studioId)] as [string, string, string, string, string]
  const week = state.market.tick
  const contracts = (studioId: string) => h.activeEmploymentOrdinals.map((i) => h.employment[i]!)
    .filter((e) => e.studioId === studioId && e.endedWeek === null && e.terms.startWeek <= week && week < e.terms.endWeekExclusive)
  const cash = (studioId: string) => h.businesses.find((b) => b.studioId === studioId)!.account.cash
  return { state, h, player, r01, r02, r03, r04, week, contracts, cash }
}

describe('P16C healthy absorption: eligibility matrix', () => {
  it('a stable buyer may quote a willing stable rival; the operating player is NotForSale; stage, loan and identity refusals are named', () => {
    const { state, player, r01, r03, week } = world()
    expect(acq.absorptionRefusal(state, player, r03, week, STABLE)).toBeNull()
    expect(acq.absorptionRefusal(state, r01, r03, week, STABLE)).toBeNull()
    expect(acq.absorptionRefusal(state, r01, player, week, STABLE)).toBe('playerNotForSale')
    expect(acq.absorptionRefusal(state, player, player, week, STABLE)).toBe('playerNotForSale')
    expect(acq.absorptionRefusal(state, r03, r03, week, STABLE)).toBe('selfDealing')
    expect(acq.absorptionRefusal(state, player, 'studio-nobody', week, STABLE)).toBe('unknownTarget')
    expect(acq.absorptionRefusal(state, player, state.hollywood!.identities[9]!.studioId, week, STABLE)).toBe('unknownTarget')
    expect(acq.absorptionRefusal(state, player, r03, week, readersWith({ [player]: 'warning' }))).toBe('buyerNotPermitted:stageNotStable:warning')
    expect(acq.absorptionRefusal(state, player, r03, week, readersWith({ [r03]: 'distress' }))).toBe('targetNotStable:distress')
    expect(acq.absorptionRefusal(state, player, r03, week, readersWith({}, [r03]))).toBe('targetOutstandingLoan')
    expect(acq.absorptionRefusal(state, player, r03, week, readersWith({}, [player]))).toBe('buyerNotPermitted:outstandingDistressLoan')
  })

  it('the rival\'s willingness is a disclosed policy over its rights value plus the cash it hands over at par; it may reject the offer', () => {
    const { state, r03, week, cash } = world()
    const value = libraryValuationV1(state, r03, week)
    expect(value.kind).toBe('available')
    const total = value.kind === 'available' ? value.total : 0
    const postExitCash = cash(r03)
    const ask = Math.max(0, Math.ceil((total * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100 + postExitCash))
    expect(acq.absorptionAsk(total, postExitCash)).toBe(ask)
    expect(acq.rivalAbsorptionWillingness(state, r03, ask, postExitCash, week)).toEqual({ willing: true, reason: 'willing', value: total, ask })
    expect(acq.rivalAbsorptionWillingness(state, r03, ask - 1, postExitCash, week)).toEqual({ willing: false, reason: `notWilling:considerationBelowAsk:${ask}`, value: total, ask })
    // A target with negative cash after exits asks no less than zero.
    expect(acq.absorptionAsk(total, -10 * total - 1)).toBe(0)
    // Whole-dollar consent rounds the complete sum, including positive and negative fractional cash.
    expect(acq.absorptionAsk(1, 0.25)).toBe(Math.max(0, Math.ceil(1 * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT) / 100 + 0.25)))
    expect(acq.absorptionAsk(10, -1.25)).toBe(Math.max(0, Math.ceil(10 * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT) / 100 - 1.25)))
    expect(acq.absorptionAsk(0, -0.25)).toBe(0)
  })
})

describe('P16C healthy absorption: the quote separates consideration, at-par cash, exits and disclosed guarantees', () => {
  it('default retention walks the target\'s contracts in order, retains what is lawful and affordable, charges each non-retained exit once to the target, and transfers post-exit cash at par', () => {
    const { player, r03, week, contracts, cash, ...w } = world()
    const { state, disclosureId } = disclosed(w.state, player, r03)
    const before = stableStringify(state)
    const quote = quoteAtAsk(state, { buyerId: player, targetId: r03, retention: { kind: 'default' }, disclosureId }, week)
    expect(quote.kind).toBe('quote')
    if (quote.kind !== 'quote') return
    const consideration = quote.consideration
    expect(consideration).toBe(quote.ask)
    expect(quote.contracts.map((c) => c.contractId)).toEqual(contracts(r03).map((e) => e.contractId)) // authoritative target order
    const exits = quote.contracts.filter((c) => !c.retained).reduce((s, c) => s + c.exitCost, 0)
    for (const c of quote.contracts) {
      const e = contracts(r03).find((x) => x.contractId === c.contractId)!
      expect(c.exitCost).toBe(terminationCost(e.terms, week))
      expect(c.guarantee).toBe(guaranteedComp(e.terms, week))
    }
    expect(quote.exitCharges).toBe(exits)
    expect(quote.targetCashBeforeExits).toBe(cash(r03))
    expect(quote.postExitCash).toBe(cash(r03) - exits)
    expect(quote.outlay).toBe(consideration - quote.postExitCash)
    expect(quote.consideration).toBe(consideration)
    // Guarantees are DISCLOSED beside the price and never subtracted from it.
    expect(quote.guarantees).toBe(quote.contracts.filter((c) => c.retained).reduce((s, c) => s + c.guarantee, 0))
    expect(quote.guarantees).toBeGreaterThan(0)
    expect(quote.outlay).not.toBe(Math.max(0, consideration - quote.guarantees))
    // The reserve is computed on the buyer's RESULTING obligations, retained contracts included.
    const retainedWeekly = quote.contracts.filter((c) => c.retained).reduce((s, c) => s + c.annualSalary / TUNING.TICKS_PER_YEAR, 0)
    expect(quote.resultingWeeklyFixedCost).toBe(Math.ceil(finance.weeklyFixedCost(state, player) + retainedWeekly + TUNING.OVERHEAD_PER_EMPLOYEE * quote.contracts.filter((c) => c.retained).length))
    expect(quote.reserveAfter).toBe(TUNING.RIGHTS_RESERVE_WEEKS * quote.resultingWeeklyFixedCost)
    expect(quote.affordable).toBe(finance.spendableCash(state, player) - quote.outlay >= quote.reserveAfter)
    expect(quote.affordable).toBe(true)
    // Nothing moves: a quote is a preview, not a reservation.
    expect(stableStringify(state)).toBe(before)
    // Research and facilities dispositions are explicit, typed and non-transferring. No studio researches at week 53
    // (review F47); the seeded in-flight case is p16-r2-acquisition.test.ts (F47/F21).
    expect(quote.research).toEqual([])
    for (const f of quote.facilities) expect(f.disposition).toBe('remainsWithTargetHistory')
    expect(quote.facilities.length).toBeGreaterThan(0)
  })

  it('negative post-exit cash transfers at par: the outlay exceeds the consideration by exactly the shortfall', () => {
    // Untouched genuine Save45 R04 already has fractional negative cash at247. One ordinary current
    // tick evaluates the first stable condition; no injected reader, balance or historical row.
    const raw = genuineV45Raw('week247')
    expect(createHash('sha256').update(raw).digest('hex')).toBe('54938083c4d088fad71ca1c5088dd67427c316d9fee81fdaba1ea66161ca954c')
    const prior = migrateToLive(importSave(raw)).state, priorBefore = stableStringify(prior)
    let state = tick(prior)
    expect(state.market.tick).toBe(248)
    const week = state.market.tick, player = state.hollywood!.playerStudioId, target = 'studio-aca408ec-r04'
    const business = state.hollywood!.businesses.find(b => b.studioId === target)!
    expect(conditionRecord(state, target)?.condition.stage).toBe('stable')
    expect(outstandingLoan(state, target, week)).toBeUndefined()
    expect(business.account.cash).toBeLessThan(0)
    expect(Number.isInteger(business.account.cash)).toBe(false)
    const rows = state.hollywood!.activeEmploymentOrdinals.map(i => state.hollywood!.employment[i]!)
      .filter(e => e.studioId === target && e.endedWeek === null && e.terms.startWeek <= week && week < e.terms.endWeekExclusive)
    // R04 has no live employment left; zero lawful exits must not erase its existing negative cash.
    expect(rows).toEqual([])
    const exits = rows.reduce((sum, e) => sum + terminationCost(e.terms, week), 0)
    const paid = dd.requestDiligence(state, { recipientId: player, target: { kind: 'studio', studioId: target }, scope: [...FULL_SCOPE] }, week)
    state = paid.state
    const value = libraryValuationV1(state, target, week)
    expect(value.kind).toBe('available')
    if (value.kind !== 'available') throw new Error(value.reason)
    const postExitCash = business.account.cash - exits
    const consideration = Math.max(0, Math.ceil(value.total * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT) / 100 + postExitCash))
    const input = { buyerId: player, targetId: target, consideration, retention: { kind: 'explicit' as const, contractIds: [] as string[] }, disclosureId: paid.record.id }
    const quote = acq.quoteAbsorption(state, input, week)
    expect(quote.kind).toBe('quote')
    if (quote.kind !== 'quote') throw new Error(quote.refusal)
    expect(quote.contracts.every(c => !c.retained)).toBe(true)
    expect(quote.exitCharges).toBe(exits)
    expect(quote.postExitCash).toBe(postExitCash)
    expect(quote.postExitCash).toBeLessThan(0)
    expect(Number.isInteger(quote.postExitCash)).toBe(false)
    expect(quote.outlay).toBe(consideration - postExitCash)
    expect(quote.outlay).toBeGreaterThan(consideration)
    expect(quote.guarantees).toBe(0)
    expect(acq.absorptionProducerRefusal(state, input)).toBeNull()
    const before = stableStringify(state)
    const closed = acq.closeAbsorption(state, { ...input, quotedAtWeek: quote.quotedAtWeek, quoteAgePolicyVersion: quote.quoteAgePolicyVersion }, week)
    expect(stableStringify(state)).toBe(before)
    const record = closed.rights.absorptions.find(a => a.targetId === target)!
    expect(record).toMatchObject({ consideration, cashBeforeExits: business.account.cash, exitCharges: exits, postExitCash, outlay: consideration - postExitCash })
    expect(closed.studio.cash).toBe(state.studio.cash - record.outlay)
    expect(closed.ledger.filter(e => e.kind === 'acquisitionOutlay' && e.note === record.id)).toEqual([
      expect.objectContaining({ week, amount: -record.outlay }),
    ])
    const finalBusiness = closed.hollywood!.businesses.find(b => b.studioId === target)!
    expect(finalBusiness.account.cash).toBe(0)
    expect(finalBusiness.account.periods.reduce((sum, p) => sum + p.movements.acquisitionOutlay, 0))
      .toBe(business.account.periods.reduce((sum, p) => sum + p.movements.acquisitionOutlay, 0) - postExitCash)
    makeSave(closed)
    const saved = exportCurrentState(closed)
    const reloaded = migrateToLive(importSave(saved)).state
    expect(exportCurrentState(reloaded)).toBe(saved)
    const closedBefore = stableStringify(closed), reloadBefore = stableStringify(reloaded)
    expect(exportCurrentState(tick(reloaded))).toBe(exportCurrentState(tick(closed)))
    expect(stableStringify(closed)).toBe(closedBefore)
    expect(stableStringify(reloaded)).toBe(reloadBefore)
    expect(stableStringify(prior)).toBe(priorBefore)
  })

  it('explicit retention retains exactly the chosen contracts; retained work cannot outlive its participants, so a production with a dropped participant is marked for explicit cancellation', () => {
    const { h, player, r03, week, contracts, ...w } = world()
    const { state, disclosureId } = disclosed(w.state, player, r03)
    const rows = contracts(r03)
    const production = h.businesses.find((b) => b.studioId === r03)!.productions[0]!
    const participantIds = new Set(Object.values(production.cast).concat(production.writerId, production.directorId, ...production.craftIds))
    const busy = rows.filter((e) => participantIds.has(e.terms.talentId))
    expect(busy.length).toBeGreaterThan(0)
    // An explicit choice does not depend on the price, so one consideration above every ask serves each case.
    const keepAll = acq.quoteAbsorption(state, { buyerId: player, targetId: r03, consideration: 50_000_000, retention: { kind: 'explicit', contractIds: rows.map((e) => e.contractId) }, disclosureId }, week, STABLE)
    expect(keepAll.kind === 'quote' && keepAll.contracts.every((c) => c.retained)).toBe(true)
    expect(keepAll.kind === 'quote' && keepAll.productions.find((p) => p.productionId === production.id)!.disposition).toBe('continues')
    const dropOne = acq.quoteAbsorption(state, { buyerId: player, targetId: r03, consideration: 50_000_000, retention: { kind: 'explicit', contractIds: rows.filter((e) => e.contractId !== busy[0]!.contractId).map((e) => e.contractId) }, disclosureId }, week, STABLE)
    expect(dropOne.kind).toBe('quote')
    if (dropOne.kind !== 'quote') return
    expect(dropOne.contracts.find((c) => c.contractId === busy[0]!.contractId)!.retained).toBe(false)
    expect(dropOne.productions.find((p) => p.productionId === production.id)).toMatchObject({ productionId: production.id, disposition: 'cancelRequired', reason: 'missingParticipants', blockedCapability: null, missingParticipants: [busy[0]!.terms.talentId] })
    expect(dropOne.exitCharges).toBe(terminationCost(busy[0]!.terms, week))
    expect(acq.quoteAbsorption(state, { buyerId: player, targetId: r03, consideration: 1, retention: { kind: 'explicit', contractIds: ['no-such-contract'] }, disclosureId }, week, STABLE)).toEqual({ kind: 'refusal', refusal: 'unknownContract:no-such-contract' })
    // The default never silently keeps a film while dropping its busy cast (review F46): when no participant can be
    // afforded, every one is dropped as unaffordable and the production is marked for cancellation naming each of them.
    const squeezed = acq.quoteAbsorption(state, { buyerId: player, targetId: r03, consideration: 90_000_000, retention: { kind: 'default' }, disclosureId }, week, STABLE)
    expect(squeezed.kind).toBe('quote')
    if (squeezed.kind !== 'quote') return
    expect(squeezed.affordable).toBe(false)
    for (const e of busy) expect(squeezed.contracts.find((c) => c.contractId === e.contractId)).toMatchObject({ retained: false, reason: 'unaffordable' })
    expect(squeezed.productions.find((p) => p.productionId === production.id)).toMatchObject({ disposition: 'cancelRequired', reason: 'missingParticipants' })
    expect([...squeezed.productions.find((p) => p.productionId === production.id)!.missingParticipants].sort()).toEqual([...new Set(busy.map((e) => e.terms.talentId))].sort())
  })

  it('an ineligible pair returns a refusal, and closing refuses an undated preview and any other week by name, changing nothing', () => {
    const { state, player, r03, week } = world()
    const before = stableStringify(state)
    expect(acq.quoteAbsorption(state, { buyerId: player, targetId: player, consideration: 1, retention: { kind: 'default' }, disclosureId: null }, week, STABLE)).toEqual({ kind: 'refusal', refusal: 'playerNotForSale' })
    expect(acq.quoteAbsorption(state, { buyerId: player, targetId: r03, consideration: -1, retention: { kind: 'default' }, disclosureId: null }, week, STABLE)).toEqual({ kind: 'refusal', refusal: 'invalidConsideration' })
    expect(acq.quoteAbsorption(state, { buyerId: player, targetId: r03, consideration: 1, retention: { kind: 'default' }, disclosureId: null }, week, STABLE)).toEqual({ kind: 'refusal', refusal: 'disclosureRequired' })
    // C-03 (P16 rebase): closing is no longer deferred. current200 implements closeAbsorption (acquisition.ts), which
    // takes only the actual input week and the dated preview a quote carries, refusing each by name before any work;
    // its remaining prerequisites are the disclosed list below (audit C-03: "replace :183 with the input-week guard").
    const close = { buyerId: player, targetId: r03, consideration: 1_000_000, retention: { kind: 'default' as const }, disclosureId: null }
    expect(() => acq.closeAbsorption(state, close, week + 1)).toThrow(/^absorption: closing must use the actual input week$/)
    expect(() => acq.closeAbsorption(state, close, week)).toThrow(/^absorption closing refused: absorptionQuoteRequired$/)
    expect(acq.ABSORPTION_CLOSING_PREREQUISITES).toEqual(['real retained-production/script/run and adoption cancellation or continuation producers',
      'real rival-buyer employment/financial producers',
      'real absorbed-employer market dispositions and public Action/Bridge/native transaction parity'])
    expect(stableStringify(state)).toBe(before)
  })
})

// ── 1370-as REVIEW finding 3: usable capacity is the shared operations allocator's verdict, never a headcount cap ──
describe('P16C healthy absorption: work continues only where the buyer\'s operations admit it (the real allocator)', () => {
  it('the target\'s in-flight production is admitted into the buyer\'s managed operations by the shared allocator; without the capability, or with a stage that can seat nobody, it is marked for cancellation and the default drops the people whose work cannot continue', () => {
    const { h, player, r03, week, contracts, ...w } = world()
    const { state, disclosureId } = disclosed(w.state, player, r03)
    const production = h.businesses.find((b) => b.studioId === r03)!.productions[0]!
    const participantIds = new Set([...Object.values(production.cast), production.writerId, production.directorId, ...production.craftIds])
    const busy = contracts(r03).filter((e) => participantIds.has(e.terms.talentId)).map((e) => e.contractId)
    expect(busy.length).toBeGreaterThan(0)
    const input = { buyerId: player, targetId: r03, retention: { kind: 'default' as const }, disclosureId }
    const quote = quoteAtAsk(state, input, week)
    expect(quote.kind).toBe('quote')
    if (quote.kind !== 'quote') return
    expect(quote.productions.find((x) => x.productionId === production.id)).toEqual({ productionId: production.id, remainingTicks: production.remainingTicks,
      phase: productionPhaseForRemainingTicks(production.remainingTicks), disposition: 'continues', reason: null, blockedCapability: null, missingParticipants: [] })
    for (const c of quote.contracts) expect(c.busyOn).toBe(busy.includes(c.contractId) ? production.id : null)
    // No soundstage anywhere in the buyer's operations: the allocator can never admit a shooting picture.
    const noStage = { ...state, operations: { ...state.operations, facilities: state.operations.facilities.filter((f) => f.capability !== 'soundstage') } } as GameState
    const blocked = quoteAtAsk(noStage, input, week)
    expect(blocked.kind).toBe('quote')
    if (blocked.kind !== 'quote') return
    expect(blocked.productions.find((x) => x.productionId === production.id)).toMatchObject({ disposition: 'cancelRequired', reason: 'noFacility:soundstage', blockedCapability: 'soundstage', missingParticipants: [] })
    for (const id of busy) expect(blocked.contracts.find((c) => c.contractId === id)).toMatchObject({ retained: false, reason: 'workCannotContinue', busyOn: production.id })
    expect(blocked.contracts.filter((c) => !busy.includes(c.contractId)).map((c) => c.retained)).toEqual(quote.contracts.filter((c) => !busy.includes(c.contractId)).map((c) => c.retained))
    expect(blocked.exitCharges).toBeGreaterThan(quote.exitCharges)
    // r2 (review F2): a stage that exists but can seat nobody (capacity 0) is not usable capacity: the picture cannot
    // continue and its people are not kept by default.
    const full = { ...state, operations: { ...state.operations, facilities: state.operations.facilities.map((f) => (f.capability === 'soundstage' ? { ...f, capacity: 0 } : f)) } } as GameState
    const unseated = quoteAtAsk(full, input, week)
    expect(unseated.kind).toBe('quote')
    if (unseated.kind !== 'quote') return
    expect(unseated.productions.find((x) => x.productionId === production.id)).toMatchObject({ disposition: 'cancelRequired', reason: 'noCapacity:soundstage', blockedCapability: 'soundstage', missingParticipants: [] })
    for (const id of busy) expect(unseated.contracts.find((c) => c.contractId === id)).toMatchObject({ retained: false, reason: 'workCannotContinue' })
    // Explicit retention of everyone cannot make unhostable work continue: the coupling is disclosed, not hidden.
    const explicit = acq.quoteAbsorption(noStage, { ...input, consideration: 50_000_000, retention: { kind: 'explicit', contractIds: contracts(r03).map((e) => e.contractId) } }, week, STABLE)
    expect(explicit.kind).toBe('quote')
    if (explicit.kind !== 'quote') return
    expect(explicit.productions.find((x) => x.productionId === production.id)!.disposition).toBe('cancelRequired')
    expect(explicit.contracts.every((c) => c.retained)).toBe(true)
  })

  it('a buyer whose operations are not managed cannot host managed work, and a production id already present in the buyer\'s operations is a named collision, not a merge', () => {
    const { h, player, r03, week, ...w } = world()
    const { state, disclosureId } = disclosed(w.state, player, r03)
    const input = { buyerId: player, targetId: r03, retention: { kind: 'default' as const }, disclosureId }
    const legacy = { ...state, operations: { ...state.operations, mode: 'legacy' as const } } as GameState
    const unhosted = quoteAtAsk(legacy, input, week)
    expect(unhosted.kind).toBe('quote')
    if (unhosted.kind !== 'quote') return
    expect(unhosted.productions.length).toBeGreaterThan(0)
    for (const p of unhosted.productions) expect(p).toMatchObject({ disposition: 'cancelRequired', reason: 'buyerOperationsNotManaged', blockedCapability: null })
    const target = h.businesses.find((b) => b.studioId === r03)!
    const collide = { ...state, operations: { ...state.operations, workflows: [...state.operations.workflows, ...target.operations.workflows] } } as GameState
    const collided = quoteAtAsk(collide, input, week)
    expect(collided.kind).toBe('quote')
    if (collided.kind !== 'quote') return
    for (const p of collided.productions) expect(p).toMatchObject({ disposition: 'cancelRequired', reason: 'productionIdCollision', blockedCapability: null })
  })
})

// C-08 bounded diagnostic only: constructed quote boundary, NOT an admitted save or natural gameplay route.
// The genuine input is copied; its production histories are deliberately not forged to admit the clone.
// No closeAbsorption/full-save claim. Original tests, fixtures and default deadline stay unchanged.
describe('C-08 shared credited writer quote-boundary diagnostic', () => {
  it('a first unhostable production must not drop a writer required by a later hostable production', () => {
    const w = world(), source = detached(w.state)
    const target = source.hollywood!.businesses.find(b => b.studioId === w.r03)!
    const original = target.productions[0]!
    expect(original).toBeDefined()
    const writer = w.contracts(w.r03).find(e => e.terms.talentId === original.writerId)!
    expect(writer, 'premise: credited writer has an actual target employment contract').toBeDefined()
    const first = { ...original, id: 'c08-first-unhostable', remainingTicks: 8 }
    const second = { ...original, id: 'c08-second-hostable', remainingTicks: 1 }
    target.productions = [first, second]
    // Isolate hostability from financing only at this constructed quote boundary.
    // This cash is not represented as an admitted ledger or a new fixture.
    source.studio.cash = 1_000_000_000
    source.operations = { ...source.operations,
      facilities: source.operations.facilities.filter(f => f.capability !== 'soundstage') }
    const { state, disclosureId } = disclosed(source, w.player, w.r03)
    const input = { buyerId: w.player, targetId: w.r03, retention: { kind: 'default' as const }, disclosureId }
    const before = stableStringify(state)
    let quote = quoteAtAsk(state, input, w.week)
    // The existing helper deliberately only parses whole asks. If the unrelated fractional-ask
    // blocker answers, submit the smallest whole consideration ABOVE that quoted ask. This chooses
    // an offer price; it does not round/change the producer's ask or resolve its Owner decision.
    if (quote.kind === 'refusal') {
      const match = /^targetNotWilling:considerationBelowAsk:(\d+\.\d+)$/.exec(quote.refusal)
      expect(match, 'only the recorded fractional ask may precede this hostability diagnostic').not.toBeNull()
      if (!match) throw new Error(quote.refusal)
      quote = acq.quoteAbsorption(state, { ...input, consideration: Math.ceil(Number(match[1])) }, w.week, STABLE)
    }
    expect(quote.kind).toBe('quote')
    if (quote.kind !== 'quote') throw new Error(quote.refusal)
    expect(quote.productions.find(p => p.productionId === first.id)).toMatchObject({
      disposition: 'cancelRequired', reason: 'noFacility:soundstage' })
    expect(quote.productions.find(p => p.productionId === second.id)).toMatchObject({
      disposition: 'continues', reason: null, missingParticipants: [] })
    expect(stableStringify(state)).toBe(before)
    const disposition = quote.contracts.find(c => c.contractId === writer.contractId)!
    expect(disposition).toBeDefined()
    // Diagnostic detail remains visible even when this final regression assertion is RED.
    console.info('C08_CONSTRUCTED_QUOTE', JSON.stringify({ first: first.id, second: second.id,
      writerId: original.writerId, disposition, affordable: quote.affordable,
      scope: 'quote-boundary only; not admitted save, close, Bridge or natural reachability proof' }))
    expect(disposition, 'hostable later work requires retaining its shared credited writer')
      .toMatchObject({ retained: true, reason: null })
  })
})
