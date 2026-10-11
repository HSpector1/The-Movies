// Authored public migration/paid-plant fixture. No claim of a natural fresh-industry campaign.
import { expect } from 'vitest'
import { generateWorld } from '../../src/core/worldgen.js'
import { initializeHollywood, rivalWeeklyOperatingCost } from '../../src/core/hollywood.js'
import { HOLLYWOOD_STARTING_MANIFEST } from '../../src/core/hollywoodStartingData.js'
import { admitRivalPlans, rivalScientistDemand } from '../../src/core/rivalResearch.js'
import { blueprintById } from '../../src/core/placement.js'
import { technologyEntry } from '../../src/core/technologyCatalogue.js'
import { ageAt } from '../../src/core/aging.js'
import { tick } from '../../src/core/tick.js'
import { makeSave, validateSaveV46, stableStringify } from '../../src/core/save.js'
import type { GameState } from '../../src/core/types.js'
const bytes = stableStringify
export function admitPublicResearchFixture(state: GameState): void {
  const before = bytes(state), value = makeSave(state)
  expect(validateSaveV46(value)).toBe(value); expect(bytes(state)).toBe(before)
}
function ordinary(state: GameState): GameState {
  const before = bytes(state), next = tick(state)
  expect(bytes(state)).toBe(before); expect(next.market.tick).toBe(state.market.tick + 1)
  admitPublicResearchFixture(next); return next
}
export function researchCommitments(state: GameState, id: string) {
  return {
    employment: state.hollywood!.employment.filter(e => e.studioId === id),
    plans: state.physicalPlans.plans.filter(p => p.studioId === id),
    adoptions: state.technology.adoptions.filter(a => a.studioId === id),
    projects: state.technology.projects.filter(p => p.studioId === id),
    seats: state.technology.projects.filter(p => p.studioId === id).flatMap(p => p.seats.map(seat => ({ projectId: p.id, ...seat }))),
  }
}
function paidAdmission(input: GameState, blueprintId: string) {
  admitPublicResearchFixture(input); const before = bytes(input), result = admitRivalPlans(input)
  expect(result.history).toEqual([]); expect(bytes(input)).toBe(before); admitPublicResearchFixture(result.state)
  const fresh = result.state.physicalPlans.plans.filter(p => !input.physicalPlans.plans.some(old => old.id === p.id))
  expect(fresh.length, `UNMET REAL${input.market.tick} ADMISSION: actual cash/reserve must fund ${blueprintId}`).toBeGreaterThan(0)
  const blueprint = blueprintById(blueprintId)!
  for (const plan of fresh) {
    expect(plan.work.blueprintId).toBe(blueprintId); expect(plan.status).toBe('started')
    expect(plan.commitReceipt).toMatchObject({ week: input.market.tick, cost: blueprint.capex })
    expect(plan.approvedQuote.cost).toBe(blueprint.capex); expect(plan.approvedQuote.buildWeeks).toBe(blueprint.buildWeeks)
  }
  for (const b of input.hollywood!.businesses) {
    const after = result.state.hollywood!.businesses.find(row => row.studioId === b.studioId)!
    const debit = fresh.filter(p => p.studioId === b.studioId).reduce((n, p) => n + p.commitReceipt!.cost, 0)
    expect(after.account.cash).toBe(b.account.cash - debit)
    const amount = (s: typeof b) => s.account.periods.reduce((n, p) => n + p.movements.researchCapacity, 0)
    expect(amount(after) - amount(b)).toBe(-debit)
  }
  return { state: result.state, fresh }
}
let cache: { input: GameState; control: GameState } | undefined
export function lowMarketResearch277() {
  if (cache) return structuredClone(cache)
  const genesis = generateWorld('p15a1-w2-market-01'), genesisBytes = bytes(genesis)
  const genesisMarket = structuredClone(genesis.market), genesisEra = structuredClone(genesis.era)
  expect(Math.round(genesisMarket.baseMarketValue)).toBe(23_554_590) // 1355-C4 recorded rounded value
  function comparable(state: GameState): void {
    expect(state.market).toEqual({ ...genesisMarket, tick: state.market.tick })
    expect(state.era).toEqual(genesisEra)
    expect(bytes(genesis)).toBe(genesisBytes)
  }
  let state = genesis
  admitPublicResearchFixture(state)
  for (let week = 0; week < 260; week++) {
    expect(state.hollywood).toBeNull(); expect(state.founding).toBeNull()
    state = ordinary(state)
  }
  expect(state.market.tick).toBe(260); expect(state.hollywood).toBeNull(); expect(state.founding).toBeNull()
  comparable(state) // actual null-industry week260, no clock or market rewrite
  const predecessor = state, predecessorBytes = bytes(predecessor)
  state = initializeHollywood(predecessor, 'migration')
  expect(bytes(predecessor)).toBe(predecessorBytes); admitPublicResearchFixture(state)
  comparable(state)
  expect(state.hollywood).toMatchObject({ origin: 'migration', originWeek: 260 })
  expect(state.ledger).toEqual(predecessor.ledger); expect(state.studio).toEqual(predecessor.studio)
  expect(state.hollywood!.films).toHaveLength(0)
  for (const person of state.talent) {
    const rows = state.talentProvenance.rows.filter(r => r.personId === person.id)
    expect(rows).toHaveLength(1); expect(person.age).toBe(ageAt(rows[0]!, 260))
    const previous = predecessor.talent.find(t => t.id === person.id)
    if (previous) expect(person).toEqual(previous)
    else expect(rows[0]).toMatchObject({ kind: 'authored_exact_week', entryWeek: 260 })
  }
  for (const b of state.hollywood!.businesses) {
    const identity = state.hollywood!.identities.find(r => r.studioId === b.studioId)!
    expect(identity.enteredWeek).toBe(260); expect(identity.recordedFromWeek).toBe(260)
    const capital = HOLLYWOOD_STARTING_MANIFEST.studios[identity.row - 1]!.capital
    expect(b.account.openingBalance).toBe(capital); expect(b.account.periods).toHaveLength(1)
    const period = b.account.periods[0]!
    expect(period.fromWeek).toBe(260); expect(period.opening).toBe(capital)
    expect(b.account.cash).toBe(capital + Object.values(period.movements).reduce((n, value) => n + value, 0))
    expect(period.movements.capacity).toBeLessThan(0); expect(period.movements.signing).toBeLessThan(0)
    for (const [kind, value] of Object.entries(period.movements)) if (kind !== 'capacity' && kind !== 'signing') expect(value).toBe(0)
    expect(b.costCutting).toEqual({ version: 1, since: null })
    expect(b.productions).toHaveLength(0); expect(b.runs).toHaveLength(0)
    for (const e of state.hollywood!.employment.filter(e => e.studioId === b.studioId)) {
      expect(e.reason).toBe('entry'); expect(e.terms.startWeek).toBe(260)
      expect(state.hollywood!.receipts.some(r => r.kind === 'employment' && r.contractId === e.contractId && r.week === 260)).toBe(true)
    }
  }
  const lab = blueprintById('research-laboratory')!, sound = technologyEntry('synchronized-sound')
  const instrument = blueprintById(sound.instrumentBlueprintId)!
  expect(sound.researchableWeek).toBe(260); expect(lab.buildWeeks).toBe(12); expect(instrument.buildWeeks).toBe(5)
  const labs = paidAdmission(state, lab.id); state = labs.state
  for (let n = 0; n < 12; n++) state = ordinary(state)
  expect(state.market.tick).toBe(272); comparable(state)
  for (const plan of labs.fresh) {
    const commitment = state.hollywood!.receipts.find(r => r.kind === 'laboratoryCommitted' && r.planId === plan.id)
    expect(commitment?.kind).toBe('laboratoryCommitted')
    if (commitment?.kind !== 'laboratoryCommitted') throw new Error('missing genuine lab receipt')
    expect(state.hollywood!.receipts.some(r => r.kind === 'laboratoryOperational'
      && r.studioId === plan.studioId && r.facilityId === commitment.facilityId && r.week === 272)).toBe(true)
  }
  // Public standalone research admission, with the exact same quote/reserve law as its tick caller.
  const instruments = paidAdmission(state, instrument.id); state = instruments.state
  for (let n = 0; n < 5; n++) state = ordinary(state)
  expect(state.market.tick).toBe(277); comparable(state)
  for (const plan of instruments.fresh) {
    expect(plan.work.kind).toBe('installation')
    if (plan.work.kind !== 'installation' || !('facilityId' in plan.work.target)) throw new Error('actual module target required')
    const facilityId = plan.work.target.facilityId
    expect(state.hollywood!.receipts.some(r => r.kind === 'instrumentOperational'
      && r.studioId === plan.studioId && r.facilityId === facilityId && r.week === 277)).toBe(true)
  }
  expect(state.technology.projects).toHaveLength(0) // before the first instrument-ready research input
  const input = state, control = ordinary(input)
  const facts = input.hollywood!.businesses.map(b => {
    const before = researchCommitments(input, b.studioId), after = researchCommitments(control, b.studioId)
    return { studioId: b.studioId, since: b.costCutting.since, nextDecisionWeek: b.nextDecisionWeek,
      productions: b.productions.length, runs: b.runs.length, proposals: input.talentMarket.proposals.filter(p => p.issuerStudioId === b.studioId).length,
      cash: b.account.cash, reserve: rivalWeeklyOperatingCost(b, input.hollywood!, 277) * b.policy.reserveWeeks,
      wholeInputDemand: rivalScientistDemand(input, input.hollywood!, b, input.talent, 277),
      replacementContracts: after.employment.slice(before.employment.length).filter(e => e.reason === 'replacement').map(e => e.contractId),
      newProjects: after.projects.length - before.projects.length, newSeats: after.seats.length - before.seats.length }
  })
  console.log('1368_LOWMARKET_RESEARCH277', JSON.stringify({ seed: 'p15a1-w2-market-01', origin: 'public-migration260',
    nullIndustryTicks: 260, paidLabWeek: 260, paidInstrumentWeek: 272, ordinaryIndustryTicks: 17,
    inputWeek: 277, controlWeek: 278, noQuoteOverride: true,
    baseMarketValue: input.market.baseMarketValue, genesisMarketAndEraPreserved: true, facts }))
  expect(bytes(predecessor)).toBe(predecessorBytes)
  comparable(control)
  cache = { input, control }
  return structuredClone(cache)
}
