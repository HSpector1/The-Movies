// ── P16 r2 REDs: healthy absorption — usable capacity, consent, disclosure, money without a windfall, person choice ──
//
// Review r1 blockers F2/F24 (usable capacity is proven against the buyer's REAL capacity, across every remaining
// phase of each target production, with the target's productions competing for the same slots: contract §5
// "continue the required participants and capacity through its obligations"; 1362-O 5.8 "continues lawful contracts
// that fit usable capacity"), majors F6 (willing at quote: contract §5), F7 (no quote without the buyer's costed,
// dated, recipient-recorded disclosure: 1362-O 5.5, contract §6), F8/F33 (the consent policy prices the cash that
// moves at par, so no consideration buys a windfall: 1362-O 5.8; whole-dollar rounding: contract §6), F13
// (person-choice/relationship refusals: contract §5, 1362-O 5.8), F46/F47 (non-vacuous coupled-outcome and research
// assertions).

import { describe, expect, it } from 'vitest'
import * as acq from '../src/core/acquisition.js'
import * as dd from '../src/core/dueDiligence.js'
import * as finance from '../src/core/rightsFinance.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { stableStringify } from '../src/core/save.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState, RelationshipEdge } from '../src/core/types.js'
import { detached, liveFromGenuine, STABLE } from './helpers/p16-fixtures.js'

const FULL = ['rights', 'employment', 'liabilities'] as const

function world() {
  const base = liveFromGenuine('week53')
  const h = base.hollywood!
  const [player, r01, r02, r03, r04] = [h.playerStudioId, ...h.identities.slice(1, 5).map((i) => i.studioId)] as [string, string, string, string, string]
  const week = base.market.tick
  /** The buyer's fresh full-scope disclosure about the target, paid for and recorded. */
  const disclosed = (state: GameState, buyer: string, target: string, scope: readonly ('rights' | 'employment' | 'liabilities')[] = FULL) =>
    dd.requestDiligence(state, { recipientId: buyer, target: { kind: 'studio', studioId: target }, scope: [...scope] }, week, STABLE)
  const contracts = (state: GameState, studioId: string) => state.hollywood!.activeEmploymentOrdinals.map((i) => state.hollywood!.employment[i]!)
    .filter((e) => e.studioId === studioId && e.endedWeek === null && e.terms.startWeek <= week && week < e.terms.endWeekExclusive)
  const ask = (state: GameState, target: string, postExitCash: number) => {
    const v = libraryValuationV1(state, target, week)
    if (v.kind !== 'available') throw new Error(v.reason)
    return Math.max(0, Math.ceil((v.total * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100 + postExitCash))
  }
  return { base, h, player, r01, r02, r03, r04, week, disclosed, contracts, ask }
}

describe('r2 F7: no quote without the buyer\'s own fresh, full-scope, paid disclosure about this target', () => {
  it('refuses a missing, foreign, narrow, other-target or stale disclosure by name, and reveals nothing', () => {
    const { base, player, r01, r03, week, disclosed } = world()
    const input = (disclosureId: string | null) => ({ buyerId: player, targetId: r03, consideration: 50_000_000, retention: { kind: 'default' as const }, disclosureId })
    expect(acq.quoteAbsorption(base, input(null), week, STABLE)).toEqual({ kind: 'refusal', refusal: 'disclosureRequired' })
    const foreign = disclosed(base, r01, r03)
    expect(acq.quoteAbsorption(foreign.state, input(foreign.record.id), week, STABLE)).toEqual({ kind: 'refusal', refusal: 'disclosureNotHeld' })
    const narrow = disclosed(base, player, r03, ['rights'])
    expect(acq.quoteAbsorption(narrow.state, input(narrow.record.id), week, STABLE)).toEqual({ kind: 'refusal', refusal: 'disclosureScope' })
    const other = disclosed(base, player, r01)
    expect(acq.quoteAbsorption(other.state, input(other.record.id), week, STABLE)).toEqual({ kind: 'refusal', refusal: 'disclosureNotHeld' })
    const fresh = disclosed(base, player, r03)
    const stale = detached(fresh.state)
    stale.rights.diligence[0]!.staleFromWeek = week
    expect(acq.quoteAbsorption(stale, input(fresh.record.id), week, STABLE)).toEqual({ kind: 'refusal', refusal: 'staleDisclosure' })
    expect(acq.quoteAbsorption(fresh.state, input(fresh.record.id), week, STABLE).kind).toBe('quote')
    // The disclosure itself carries what the quote reveals about the target's account: its whole-dollar cash.
    expect(fresh.record.body.liabilities!.cash).toBe(Math.trunc(base.hollywood!.businesses.find((b) => b.studioId === r03)!.account.cash))
  })
})

describe('r2 F6/F8/F33: the target consents at quote; its ask is whole dollars and actual cash moves at par', () => {
  it('a consideration below the ask refuses by name; at the ask the buyer\'s outlay covers the premium-adjusted library value with less than one dollar of rounding', () => {
    const { base, player, r03, week, disclosed, ask } = world()
    const { state, record } = disclosed(base, player, r03)
    const input = (consideration: number) => ({ buyerId: player, targetId: r03, consideration, retention: { kind: 'explicit' as const, contractIds: [] }, disclosureId: record.id })
    // Price discovery: the quote at any consideration names the ask (the explicit no-retention exits fix post-exit cash).
    const probe = acq.quoteAbsorption(state, input(1), week, STABLE)
    expect(probe.kind).toBe('refusal')
    const named = /^targetNotWilling:considerationBelowAsk:(\d+)$/.exec(probe.kind === 'refusal' ? probe.refusal : '')
    expect(named).not.toBeNull()
    const theAsk = Number(named![1])
    const q = acq.quoteAbsorption(state, input(theAsk), week, STABLE)
    expect(q.kind).toBe('quote')
    if (q.kind !== 'quote') return
    expect(theAsk).toBe(ask(state, r03, q.postExitCash))
    expect(q.postExitCash).toBeGreaterThan(1_000_000) // a cash-rich target: the r1 ask (library only) was a windfall
    const v = libraryValuationV1(state, r03, week)
    const premiumValue = ((v.kind === 'available' ? v.total : 0) * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100
    expect(q.targetCashBeforeExits).toBe(state.hollywood!.businesses.find(b => b.studioId === r03)!.account.cash)
    expect(Number.isInteger(q.targetCashBeforeExits)).toBe(false)
    expect(q.postExitCash).toBe(q.targetCashBeforeExits - q.exitCharges)
    expect(q.outlay).toBe(theAsk - q.postExitCash)
    expect(q.outlay - premiumValue).toBeGreaterThanOrEqual(0)
    expect(q.outlay - premiumValue).toBeLessThan(1)
    expect(q.outlay).toBeGreaterThanOrEqual(0)
    expect(acq.quoteAbsorption(state, input(theAsk - 1), week, STABLE)).toEqual({ kind: 'refusal', refusal: `targetNotWilling:considerationBelowAsk:${theAsk}` })
    for (const n of [q.targetCashBeforeExits, q.postExitCash, q.outlay]) expect(Number.isFinite(n), String(n)).toBe(true)
    for (const n of [q.consideration, q.ask, q.exitCharges, q.guarantees, q.resultingWeeklyFixedCost, q.reserveAfter]) expect(Number.isSafeInteger(n), String(n)).toBe(true)
    expect(acq.rivalAbsorptionWillingness(state, r03, theAsk, q.postExitCash, week)).toMatchObject({ willing: true })
    expect(acq.rivalAbsorptionWillingness(state, r03, theAsk - 1, q.postExitCash, week)).toMatchObject({ willing: false })
  })
})

describe('r2 F2/F24/F59: capacity is the buyer\'s real usable capacity, cumulative over the target\'s productions and every remaining phase', () => {
  const quote = (state: GameState, buyer: string, target: string, record: string) =>
    acq.quoteAbsorption(state, { buyerId: buyer, targetId: target, consideration: 90_000_000, retention: { kind: 'default' }, disclosureId: record }, 53, STABLE)

  it('two target productions competing for the buyer\'s one free stage: the first continues, the second cannot be seated and its people are not kept by default', () => {
    const { base, player, r03, disclosed } = world()
    const twin = detached(base)
    const b = twin.hollywood!.businesses.find((x) => x.studioId === r03)!
    b.productions.push({ ...b.productions[0]!, id: 'studio-r03:film:twin' })
    twin.operations = { ...twin.operations, facilities: twin.operations.facilities.filter((f, i, all) => f.capability !== 'soundstage' || all.findIndex((x) => x.capability === 'soundstage') === i) }
    const { state, record } = disclosed(twin as GameState, player, r03)
    // Everyone kept by an explicit choice, so only capacity decides each production's disposition.
    const everyone = state.hollywood!.employment.filter((e) => e.studioId === r03 && e.endedWeek === null && e.terms.startWeek <= 53 && 53 < e.terms.endWeekExclusive).map((e) => e.contractId)
    const q = acq.quoteAbsorption(state, { buyerId: player, targetId: r03, consideration: 90_000_000, retention: { kind: 'explicit', contractIds: everyone }, disclosureId: record.id }, 53, STABLE)
    expect(q.kind).toBe('quote')
    if (q.kind !== 'quote') return
    expect(q.productions.map((p) => [p.productionId, p.disposition, p.reason])).toEqual([
      [b.productions[0]!.id, 'continues', null],
      ['studio-r03:film:twin', 'cancelRequired', 'noCapacity:soundstage'],
    ])
  })

  it('a development-phase production needs a stage later: a buyer with no stage at all cannot continue it, and the default keeps none of its people', () => {
    const { base, player, r04, disclosed, contracts } = world()
    const production = base.hollywood!.businesses.find((x) => x.studioId === r04)!.productions[0]!
    expect(production.remainingTicks).toBe(8)
    const noStage = { ...base, operations: { ...base.operations, facilities: base.operations.facilities.filter((f) => f.capability !== 'soundstage') } } as GameState
    const { state, record } = disclosed(noStage, player, r04)
    const q = quote(state, player, r04, record.id)
    expect(q.kind).toBe('quote')
    if (q.kind !== 'quote') return
    expect(q.productions[0]).toMatchObject({ productionId: production.id, phase: 'development', disposition: 'cancelRequired', reason: 'noFacility:soundstage', blockedCapability: 'soundstage' })
    const busy = new Set([production.writerId, production.directorId, ...production.craftIds, ...Object.values(production.cast)])
    for (const c of q.contracts) if (busy.has(c.talentId)) expect(c).toMatchObject({ retained: false, reason: 'workCannotContinue' })
    expect(contracts(state, r04).some((e) => busy.has(e.terms.talentId))).toBe(true)
  })

  it('a stage that exists but can seat nobody is not usable capacity: the shooting picture cannot be seated and its people are not kept by default', () => {
    const { base, player, r03, disclosed } = world()
    const full = { ...base, operations: { ...base.operations, facilities: base.operations.facilities.map((f) => (f.capability === 'soundstage' ? { ...f, capacity: 0 } : f)) } } as GameState
    const { state, record } = disclosed(full, player, r03)
    const q = quote(state, player, r03, record.id)
    expect(q.kind).toBe('quote')
    if (q.kind !== 'quote') return
    expect(q.productions[0]).toMatchObject({ disposition: 'cancelRequired', reason: 'noCapacity:soundstage' })
    for (const c of q.contracts) if (c.busyOn !== null) expect(c).toMatchObject({ retained: false, reason: 'workCannotContinue' })
  })
})

describe('r2 F46: the default never keeps a film while dropping its busy cast', () => {
  it('when nobody can be afforded, every contract is dropped as unaffordable and the production is marked for explicit cancellation naming each missing participant', () => {
    const { base, player, r03, disclosed } = world()
    const { state, record } = disclosed(base, player, r03)
    const q = acq.quoteAbsorption(state, { buyerId: player, targetId: r03, consideration: 90_000_000, retention: { kind: 'default' }, disclosureId: record.id }, 53, STABLE)
    expect(q.kind).toBe('quote')
    if (q.kind !== 'quote') return
    expect(q.affordable).toBe(false)
    expect(q.contracts.length).toBeGreaterThan(0)
    for (const c of q.contracts) expect(c).toMatchObject({ retained: false, reason: 'unaffordable' })
    const production = state.hollywood!.businesses.find((b) => b.studioId === r03)!.productions[0]!
    const busy = q.contracts.filter((c) => c.busyOn === production.id).map((c) => c.talentId)
    expect(busy.length).toBeGreaterThan(0)
    expect(q.productions[0]).toMatchObject({ productionId: production.id, disposition: 'cancelRequired', reason: 'missingParticipants' })
    expect([...q.productions[0]!.missingParticipants].sort()).toEqual([...new Set(busy)].sort())
  })
})

describe('r2 F13: person-choice and relationship refusals bind the retention preview', () => {
  /** Quote at the target's own ask (price discovery through the named refusal), so affordability never decides. */
  const quoteAtAsk = (state: GameState, buyerId: string, targetId: string, retention: acq.RetentionChoice, disclosureId: string, week: number) => {
    const input = { buyerId, targetId, consideration: 1, retention, disclosureId }
    const probe = acq.quoteAbsorption(state, input, week, STABLE)
    const named = probe.kind === 'refusal' ? /^targetNotWilling:considerationBelowAsk:(\d+)$/.exec(probe.refusal) : null
    return named === null ? probe : acq.quoteAbsorption(state, { ...input, consideration: Number(named[1]) }, week, STABLE)
  }

  it('a target employee with a Nemesis on the buyer\'s roster refuses to join it, by name, under the default and an explicit choice alike', () => {
    const { base, r01, r03, week, disclosed, contracts } = world()
    const victim = contracts(base, r03)[0]!
    const rosterMate = base.hollywood!.employment.find((e) => e.studioId === r01 && e.endedWeek === null && e.terms.startWeek < week)!
    const edge: RelationshipEdge = { edgeId: 'r2-nemesis', a: victim.terms.talentId, b: rosterMate.terms.talentId, closeness: -100, firstSharedWeek: 0, lastEventWeek: week,
      sharedProductions: 0, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, sharedCompetitions: 99, peakTier: 'Nemeses', peakTierWeek: week,
      recent: [], competitions: [], romance: null }
    const feuding = { ...base, relationships: [...base.relationships, edge] } as GameState
    const { state, record } = disclosed(feuding, r01, r03)
    const byDefault = quoteAtAsk(state, r01, r03, { kind: 'default' }, record.id, week)
    expect(byDefault.kind).toBe('quote')
    expect(byDefault.kind === 'quote' && byDefault.contracts.find((c) => c.contractId === victim.contractId)).toMatchObject({ retained: false, reason: 'nemesisOnRoster' })
    const chosen = quoteAtAsk(state, r01, r03, { kind: 'explicit', contractIds: [victim.contractId] }, record.id, week)
    expect(chosen.kind).toBe('quote')
    expect(chosen.kind === 'quote' && chosen.contracts.find((c) => c.contractId === victim.contractId)).toMatchObject({ retained: false, reason: 'nemesisOnRoster' })
    // The same pair with no feud: the person is kept by an explicit choice.
    const calm = disclosed(base, r01, r03)
    const kept = quoteAtAsk(calm.state, r01, r03, { kind: 'explicit', contractIds: [victim.contractId] }, calm.record.id, week)
    expect(kept.kind).toBe('quote')
    expect(kept.kind === 'quote' && kept.contracts.find((c) => c.contractId === victim.contractId)).toMatchObject({ retained: true, reason: null })
  })
})

describe('r2 F47/F21: in-flight research is quoted as cancelled with its verified progress kept at its source, and nothing moves', () => {
  it('the target\'s active project is listed with its verified work and expenditure; a quote changes no state', () => {
    const { base, player, r03, disclosed } = world()
    const seeded = detached(base)
    seeded.technology.projects = [...(seeded.technology.projects ?? []), { id: 'r2-research-1', studioId: r03, technologyId: 'r2-technology', laboratoryFacilityId: 'r2-lab', status: 'active',
      budgetPerWeek: 0, verifiedWork: 1234, expenditure: 5678, startedWeek: 40, completedWeek: null, seats: [], weeks: [], legacy: null } as never]
    const { state, record } = disclosed(seeded as GameState, player, r03)
    const before = stableStringify(state)
    const q = acq.quoteAbsorption(state, { buyerId: player, targetId: r03, consideration: 90_000_000, retention: { kind: 'default' }, disclosureId: record.id }, 53, STABLE)
    expect(q.kind).toBe('quote')
    if (q.kind !== 'quote') return
    expect(q.research).toEqual([{ projectId: 'r2-research-1', disposition: 'cancelRetainingVerifiedProgress', verifiedWork: 1234, expenditure: 5678 }])
    expect(stableStringify(state)).toBe(before)
    expect(finance.spendableCash(state, player)).toBe(state.studio.cash)
  })
})
