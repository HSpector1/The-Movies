// Additive 1363 Part B caller controls. The reviewed main RED patch is unchanged.
// Missing Save46/API or missing natural quote witnesses are prerequisites, not REDs.
import { describe, expect, it, vi } from 'vitest'
import { genuineRenewal196 } from './helpers/1368-renewal-fixture.js'
import * as policy from '../src/core/hollywoodPolicy.js'
import * as market from '../src/core/talentMarket.js'
import * as employment from '../src/core/employment.js'
import * as research from '../src/core/rivalResearch.js'
import * as technologyRival from '../src/core/technologyRival.js'
import { contractEndRefusal } from '../src/core/careerLifecycle.js'
import { RIVAL_TEAM_ROLES } from '../src/core/hollywoodStartingData.js'
import { commitPlacement } from '../src/core/placement.js'
import { tick } from '../src/core/tick.js'
import { makeSave } from '../src/core/save.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import type { RivalBusiness } from '../src/core/hollywoodTypes.js'

type Kind = 'renewal' | 'scientist'
// Read-only observation of the separately proposed API. No facts of this type
// are supplied by a test: every captured object is authored by real decide().
type EntryObservation = {
  decisionRan: boolean; cash: number; reserve: number
  unfilledFilmSlotForCash: boolean; renewalRefusedForCash: boolean
  unrelatedScientistSlotRefusedForCash: boolean
}
type EntryApi = { rivalCostCuttingEntry(facts: EntryObservation): boolean }
type Cutting = RivalBusiness & { costCutting: { version: 1; since: number | null } }
const business = (s: GameState, id: string) => s.hollywood!.businesses.find(b => b.studioId === id)! as Cutting
const api = (): EntryApi => {
  const result = policy as unknown as EntryApi
  expect(typeof result.rivalCostCuttingEntry, 'missing Part B production predicate prerequisite').toBe('function')
  return result
}
type Quote = {
  kind: Kind; studioId: string; talentId: string; week: number
  oldContractId: string | null; cash: number; ordinaryBonus: number; returnedBonus: number
}
type Choice = {
  studioId: string; key: string; locked: boolean
  people: string[]; cashAvailable: number; weeklyCost: number; choice: unknown
}
type Observation = {
  next: GameState; quotes: Quote[]; choices: Choice[]
  entries: { studioId: string; facts: EntryObservation; result: boolean }[]
  demands: { studioId: string; amount: number }[]
}
type Target = { kind: Kind; studioId: string; talentId: string }

/** Observe a real whole tick. Only `refuse` changes a result, at the named quote. */
function observe(input: GameState, refuse?: Target): Observation {
  const entryApi = api(), originalEntry = entryApi.rivalCostCuttingEntry
  const originalFloor = market.floorOffer, originalOffer = employment.offerForTalent
  const originalPurchase = technologyRival.considerRivalSoundPurchase
  const originalDemand = research.rivalScientistDemand, originalChoose = policy.chooseIndustryPackage
  const quotes: Quote[] = [], choices: Choice[] = [], entries: Observation['entries'] = [], demands: Observation['demands'] = []
  const offeredRoles = new Map<string, string>()
  let currentStudioId: string | null = null
  // The actual outer industry loop calls this imported seam before staff and
  // decide for each business. It identifies the caller without inventing an
  // EntryFacts studio field or relying on coincidentally equal cash balances.
  const purchaseSpy = vi.spyOn(technologyRival, 'considerRivalSoundPurchase').mockImplementation((state, h, b) => {
    if (state.market.tick === input.market.tick) currentStudioId = b.studioId
    return originalPurchase(state, h, b)
  })
  const offerSpy = vi.spyOn(employment, 'offerForTalent').mockImplementation((seed, person, term, week) => {
    offeredRoles.set(person.id, person.role)
    return originalOffer(seed, person, term, week)
  })
  const demandSpy = vi.spyOn(research, 'rivalScientistDemand').mockImplementation((state, h, b, talent, week) => {
    const amount = originalDemand(state, h, b, talent, week)
    if (week === input.market.tick) demands.push({ studioId: b.studioId, amount })
    return amount
  })
  const floorSpy = vi.spyOn(market, 'floorOffer').mockImplementation((state, id, offer, atWeek) => {
    const ordinary = originalFloor(state, id, offer, atWeek)
    const week = atWeek ?? state.market.tick
    if (week !== input.market.tick || currentStudioId !== id) return ordinary
    const b = business(state, id)
    if (!b || b.costCutting.since !== null || week < b.nextDecisionWeek) return ordinary
    const own = state.hollywood!.activeEmploymentOrdinals.map(i => state.hollywood!.employment[i]!)
      .filter(e => e.studioId === id && e.endedWeek === null)
    const old = own.find(e => e.terms.talentId === offer.talentId)
    const role = offeredRoles.get(offer.talentId)
    // A genuine occupied film roster excludes an unrelated film vacancy. This
    // counts actual employed people; no contract/body is fabricated or removed.
    const filmRosterComplete = RIVAL_TEAM_ROLES.every(r => own.filter(e => state.talent.find(t => t.id === e.terms.talentId)?.role === r).length
      >= RIVAL_TEAM_ROLES.filter(required => required === r).length)
    let kind: Kind | null = null
    if (old && employment.renewalWindowOpen(old.terms, week)
      && !market.caseOpenForTalent(state, offer.talentId, week)
      && contractEndRefusal(state, offer.talentId, week + TUNING.HOLLYWOOD_CONTRACT_WEEKS) === null) kind = 'renewal'
    else if (!old && role === 'scientist' && demands.some(d => d.studioId === id && d.amount > 0)) kind = 'scientist'
    if (kind === null || !filmRosterComplete) return ordinary
    const selected = refuse?.kind === kind && refuse.studioId === id && refuse.talentId === offer.talentId
    // A disclosed counterfactual QUOTE, not a cash edit or an accepted contract.
    // With cash - bonus < 0, the actual reserve guard must refuse it. Every other
    // offer field and every other person's quote remains the real producer's.
    const returned = selected ? { ...ordinary, signingBonus: Math.max(ordinary.signingBonus, b.account.cash + 1) } : ordinary
    quotes.push({ kind, studioId: id, talentId: offer.talentId, week, oldContractId: old?.contractId ?? null,
      cash: b.account.cash, ordinaryBonus: ordinary.signingBonus, returnedBonus: returned.signingBonus })
    return returned
  })
  const entrySpy = vi.spyOn(entryApi, 'rivalCostCuttingEntry').mockImplementation(facts => {
    expect(currentStudioId, 'observe the actual industry caller before entry classification').not.toBeNull()
    const result = originalEntry(facts)
    entries.push({ studioId: currentStudioId!, facts: structuredClone(facts), result })
    return result
  })
  const chooseSpy = vi.spyOn(policy, 'chooseIndustryPackage').mockImplementation((inputForChoice, policyForChoice, options) => {
    const choice = originalChoose(inputForChoice, policyForChoice, options)
    if (currentStudioId !== null && options.key.startsWith(`${currentStudioId}:`)) choices.push({
      studioId: currentStudioId, key: options.key, locked: options.lockScreenplay,
      people: [inputForChoice.writer.id, inputForChoice.director.id, inputForChoice.cast.lead.id,
        inputForChoice.cast.antagonist.id, inputForChoice.cast.support.id, ...inputForChoice.craftHires.map(t => t.id)],
      cashAvailable: options.cashAvailable, weeklyCost: options.weeklyCost, choice: structuredClone(choice),
    })
    return choice
  })
  try { return { next: tick(input), quotes, entries, demands, choices } }
  finally { chooseSpy.mockRestore(); entrySpy.mockRestore(); floorSpy.mockRestore(); demandSpy.mockRestore(); offerSpy.mockRestore(); purchaseSpy.mockRestore() }
}

type Witness = { input: GameState; quote: Quote; control: Observation }
let cached: Map<Kind, Witness> | undefined
let inspected = 0
const discovery = { renewalWindowRows: 0, windowRowsWithOpenCase: 0, renewalQuotes: 0, scientistQuotes: 0 }
function controls(): Map<Kind, Witness> {
  if (cached) return cached
  // Fixed existing route only: native generated state plus the already used S8
  // player Laboratory placement. No historical payload, fund edit or extra seed.
  let state = commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-probe-01'), {
    blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 },
  })
  makeSave(state)
  for (const b of state.hollywood!.businesses) expect(business(state, b.studioId).costCutting, 'Save46 prerequisite').toEqual({ version: 1, since: null })
  const found = new Map<Kind, Witness>()
  function record(input: GameState, control: Observation, allowedKind?: Kind): void {
    for (const quote of control.quotes) {
      if (allowedKind !== undefined && quote.kind !== allowedKind) continue
      if (found.has(quote.kind)) continue
      const entry = control.entries.find(e => e.studioId === quote.studioId)
      if (!entry || !entry.facts.decisionRan || entry.facts.unfilledFilmSlotForCash || entry.result) continue
      const additions = control.next.hollywood!.employment.slice(input.hollywood!.employment.length)
        .filter(e => e.studioId === quote.studioId && e.terms.talentId === quote.talentId)
      if (additions.length !== 1) continue // positive real paid employment is required
      if (quote.kind === 'renewal' && !control.next.hollywood!.employment.some(e => e.contractId === quote.oldContractId && e.endedWeek === input.market.tick)) continue
      found.set(quote.kind, { input, quote, control })
    }
  }
  // Genuine pre-market historical input; normal migration alone creates its empty market.
  const renewalInput = genuineRenewal196()
  record(renewalInput, observe(renewalInput), 'renewal')
  while (state.market.tick < 430 && found.size < 2) {
    for (const ordinal of state.hollywood!.activeEmploymentOrdinals) {
      const row = state.hollywood!.employment[ordinal]!
      if (!employment.renewalWindowOpen(row.terms, state.market.tick)) continue
      discovery.renewalWindowRows++
      if (market.caseOpenForTalent(state, row.terms.talentId, state.market.tick)) discovery.windowRowsWithOpenCase++
    }
    const control = observe(state); inspected++
    discovery.renewalQuotes += control.quotes.filter(q => q.kind === 'renewal').length
    discovery.scientistQuotes += control.quotes.filter(q => q.kind === 'scientist').length
    record(state, control)
    state = control.next
  }
  cached = found
  return found
}

describe('1363 B1 actual staff adapter: refusal causes remain distinct', () => {
  it.each(['renewal', 'scientist'] as const)('%s quote refusal does not become a film-team cash vacancy', kind => {
    const witness = controls().get(kind)
    expect(witness, `PREREQUISITE: no real ${kind} staff quote/paid-control witness in genuine196 plus ${inspected} S8 ticks through 430 (${JSON.stringify(discovery)}); report, do not fabricate`).toBeDefined()
    const { input, quote, control } = witness!, id = quote.studioId
    makeSave(input); makeSave(control.next)
    const before = structuredClone(input)
    // Uninstrumented replay proves that observing the ordinary staffing and
    // chooser paths did not change their result or mutate the source world.
    expect(tick(input)).toEqual(control.next)
    expect(input).toEqual(before)
    const candidate = observe(input, { kind, studioId: id, talentId: quote.talentId })
    makeSave(candidate.next)
    expect(input).toEqual(before)
    const forced = candidate.quotes.filter(q => q.kind === kind && q.studioId === id && q.talentId === quote.talentId)
    expect(forced.length, 'the actual staff path must consume the refusal quote').toBeGreaterThan(0)
    for (const q of forced) expect(q.cash - q.returnedBonus).toBeLessThan(0)
    const facts = candidate.entries.filter(e => e.studioId === id)
    expect(facts, 'observe one real scheduled decision end').toHaveLength(1)
    expect(facts[0]!.facts.decisionRan).toBe(true)
    expect(facts[0]!.facts.unfilledFilmSlotForCash, 'actual adapter must not relabel this refusal').toBe(false)
    expect(facts[0]!.facts[kind === 'renewal' ? 'renewalRefusedForCash' : 'unrelatedScientistSlotRefusedForCash']).toBe(true)
    expect(facts[0]!.facts.cash).toBeGreaterThanOrEqual(facts[0]!.facts.reserve)
    expect(facts[0]!.result).toBe(false)
    expect(business(candidate.next, id).costCutting.since).toBeNull()
    const newOwn = candidate.next.hollywood!.employment.slice(input.hollywood!.employment.length).filter(e => e.studioId === id)
    expect(newOwn.some(e => e.terms.talentId === quote.talentId), 'refused quote must never become paid employment').toBe(false)
    expect(candidate.next.hollywood!.receipts.slice(input.hollywood!.receipts.length)
      .some(r => r.kind === 'employment' && r.studioId === id && r.talentId === quote.talentId && r.toStudioId === id)).toBe(false)
    if (kind === 'renewal') {
      const ordinal = input.hollywood!.employment.findIndex(e => e.contractId === quote.oldContractId)
      expect(ordinal).toBeGreaterThanOrEqual(0)
      expect(candidate.next.hollywood!.employment[ordinal]).toEqual(input.hollywood!.employment[ordinal])
      expect(candidate.next.hollywood!.activeEmploymentOrdinals).toContain(ordinal)
    }
    // Neither arm replaces the chooser. Compare observed film inputs, and keep
    // money-dependent outputs explicit: retaining old terms / omitting a hire
    // can change reserve and available cash lawfully, so choice equality is not
    // asserted across economically different arms.
    const controlChoices = control.choices.filter(c => c.studioId === id)
    const candidateChoices = candidate.choices.filter(c => c.studioId === id)
    for (const c of candidateChoices) {
      const same = controlChoices.find(old => old.key === c.key)
      if (same) { expect(c.people).toEqual(same.people); expect(c.locked).toBe(same.locked) }
      expect(Number.isFinite(c.cashAvailable)).toBe(true)
      expect(Number.isFinite(c.weeklyCost)).toBe(true)
    }
    // Historical money and employment are retained. Complete save validation
    // above reconciles every actual current charge with its lawful authority.
    expect(candidate.next.hollywood!.employment.slice(0, input.hollywood!.employment.length).map(e => e.contractId))
      .toEqual(input.hollywood!.employment.map(e => e.contractId))
    expect(candidate.next.hollywood!.receipts.slice(0, input.hollywood!.receipts.length)).toEqual(input.hollywood!.receipts)
  }, 120_000)
})
