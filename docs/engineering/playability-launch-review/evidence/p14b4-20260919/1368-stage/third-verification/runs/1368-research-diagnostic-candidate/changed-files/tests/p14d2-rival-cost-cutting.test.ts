// 1363-A/F/A2 Part B independent RED staging. No Part C; Save46 is allocated by 1367-H but absent at the base.
// Proposed missing policy exports are checked on an EXISTING module, never stubbed.
// Integration controls must pass current makeSave after the separately adopted shape lands.
import { describe, expect, it, vi } from 'vitest'
import { genuineRenewal196 } from './helpers/1368-renewal-fixture.js'
import { adoptionBoundary416 } from './helpers/1368-adoption-boundary.js'
import * as policyModule from '../src/core/hollywoodPolicy.js'
import * as marketModule from '../src/core/talentMarket.js'
import * as researchModule from '../src/core/rivalResearch.js'
import { commitPlacement } from '../src/core/placement.js'
import { c2bLiveFixture } from './helpers/p14c2b-fixtures.js'
import { advanceHollywoodWeek } from '../src/core/hollywoodTick.js'
import { tick } from '../src/core/tick.js'
import { makeSave, validatedLiveProfessionContext } from '../src/core/save.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import { generateWorld } from '../src/core/worldgen.js'
import { TUNING } from '../src/core/tuning.js'
import { rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { liveWeek130, RIVAL_R01 } from './p14d1-rival-shelving-fixtures.js'
import type { GameState } from '../src/core/types.js'
import type { RivalBusiness } from '../src/core/hollywoodTypes.js'

// Proposed narrow pure-policy API: production must wire real evidence to these
// predicates. Unit inputs are law facts, not forged GameStates or campaign captures.
export type EntryFacts = {
  decisionRan: boolean; productionCount: number; runCount: number
  greenlit: boolean; commissioned: boolean; hasScriptWork: boolean
  cash: number; reserve: number
  commissionStop: 'none' | 'unaffordablePackage' | 'missingTeam' | 'missingWriter'
    | 'fullIndex' | 'hold' | 'busyWriter' | 'economicRejection'
  unfilledFilmSlotForCash: boolean; renewalRefusedForCash: boolean; unrelatedScientistSlotRefusedForCash: boolean
  indexedOutcomes: readonly ('cashBlocked' | 'economicRejection' | 'staffingBlocked')[]
}
export type ReleaseFacts = {
  week: number; endWeekExclusive: number; annualSalary: number
  cash: number; weeklyOperatingCost: number; reserveWeeks: number
  productionSeat: boolean; writingSeat: boolean; unreleasedResearchSeat: boolean; openPromise: boolean
}
type RecoveryApi = {
  rivalCostCuttingEntry(facts: EntryFacts): boolean
  rivalCostCuttingReleaseAllowed(facts: ReleaseFacts): boolean
}
function recovery(): RecoveryApi {
  const api = policyModule as unknown as RecoveryApi
  expect(typeof api.rivalCostCuttingEntry, 'missing declared Part B entry policy seam').toBe('function')
  expect(typeof api.rivalCostCuttingReleaseAllowed, 'missing declared Part B release policy seam').toBe('function')
  return api
}
type CuttingBusiness = RivalBusiness & { costCutting: { version: 1; since: number | null } }
export const business = (s: GameState, id: string): CuttingBusiness =>
  s.hollywood!.businesses.find(b => b.studioId === id)! as CuttingBusiness
export function cuttingInput(input: GameState, id: string, validate = true): GameState {
  makeSave(input)
  const state = structuredClone(input), b = business(state, id)
  expect(b.costCutting, 'requires the allocated Save46 cost-cutting shape, absent at the Save45 base').toEqual({ version: 1, since: null })
  expect(b.productions).toHaveLength(0)
  expect(b.runs).toHaveLength(0)
  b.costCutting = { version: 1, since: state.market.tick }
  // A labeled synthetic policy-state control, never evidence that entry occurred naturally.
  // Market entry-phase tests may carry proposals transiently before their required withdrawal.
  if (validate) makeSave(state)
  return state
}
const seed = () => p13aGeneratedStudio('p13a-core-causal-01')
const rowOne = (s: GameState) => s.hollywood!.identities.find(row => row.row === 1)!.studioId
const allMovements = (b: RivalBusiness): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const p of b.account.periods) for (const [kind, value] of Object.entries(p.movements)) out[kind] = (out[kind] ?? 0) + value
  return out
}
const entry = (patch: Partial<EntryFacts> = {}): EntryFacts => ({
  decisionRan: true, productionCount: 0, runCount: 0, greenlit: false, commissioned: false,
  hasScriptWork: false, cash: 1_000_000, reserve: 100_000, commissionStop: 'none',
  unfilledFilmSlotForCash: false, renewalRefusedForCash: false, unrelatedScientistSlotRefusedForCash: false, indexedOutcomes: [], ...patch,
})
const release = (patch: Partial<ReleaseFacts> = {}): ReleaseFacts => ({
  week: 0, endWeekExclusive: 208, annualSalary: 52_000, cash: 1_000_000,
  weeklyOperatingCost: 20_000, reserveWeeks: 12,
  productionSeat: false, writingSeat: false, unreleasedResearchSeat: false, openPromise: false, ...patch,
})

describe('1363 B1: all three entry conditions, independently supplied evidence', () => {
  it.each([
    ['below reserve', { cash: 99_999 }, true],
    ['exact reserve alone', { cash: 100_000 }, false],
    ['commission package entirely unaffordable', { commissionStop: 'unaffordablePackage' }, true],
    ['writer vacancy refused at staff cash gate', { commissionStop: 'missingWriter', unfilledFilmSlotForCash: true }, true],
    ['team vacancy refused at staff cash gate', { commissionStop: 'missingTeam', unfilledFilmSlotForCash: true }, true],
    ['failed renewal is not a vacancy', { commissionStop: 'missingTeam', renewalRefusedForCash: true }, false],
    ['unrelated Scientist vacancy cash refusal', { commissionStop: 'missingTeam', unrelatedScientistSlotRefusedForCash: true }, false],
    ['noncash staffing block', { commissionStop: 'missingTeam' }, false],
    ['hold above reserve', { commissionStop: 'hold' }, false],
    ['busy writer above reserve', { commissionStop: 'busyWriter' }, false],
    ['economic refusal alone', { commissionStop: 'economicRejection' }, false],
    ['full-index reason without evaluated screenplay evidence', { commissionStop: 'fullIndex', indexedOutcomes: [] }, false],
    ['full index all genuinely cash-bound', { commissionStop: 'fullIndex', indexedOutcomes: ['cashBlocked', 'cashBlocked'] }, true],
    ['full index cash and cash-caused staffing', { commissionStop: 'fullIndex', unfilledFilmSlotForCash: true, indexedOutcomes: ['cashBlocked', 'staffingBlocked'] }, true],
    ['full index one economic rejection', { commissionStop: 'fullIndex', indexedOutcomes: ['cashBlocked', 'economicRejection'] }, false],
    ['full index noncash staffing', { commissionStop: 'fullIndex', indexedOutcomes: ['cashBlocked', 'staffingBlocked'] }, false],
    ['no decision opportunity', { cash: 0, decisionRan: false }, false],
    ['a production', { cash: 0, productionCount: 1 }, false],
    ['a run', { cash: 0, runCount: 1 }, false],
    ['drafting or rewriting work', { cash: 0, hasScriptWork: true }, false],
    ['greenlit this decision', { cash: 0, greenlit: true }, false],
    ['commissioned this decision', { cash: 0, commissioned: true }, false],
  ] as [string, Partial<EntryFacts>, boolean][])('%s', (_name, patch, expected) => {
    const input = entry(patch), before = structuredClone(input)
    expect(recovery().rivalCostCuttingEntry(input)).toBe(expected)
    expect(input).toEqual(before)
  })

  it('the separately retained legacy reserve-plus-one staffing setup enters cutting', () => {
    const source = liveWeek130(); makeSave(source)
    const h = source.hollywood!, b = business(source, RIVAL_R01), week = source.market.tick
    const actorOrdinal = h.activeEmploymentOrdinals.find(i => h.employment[i]!.studioId === RIVAL_R01
      && source.talent.find(t => t.id === h.employment[i]!.terms.talentId)?.role === 'actor')!
    expect(actorOrdinal).toBeDefined()
    const reserve = rivalWeeklyOperatingCost(b, h, week) * b.policy.reserveWeeks
    // Exact inherited unit arrangement from the old mixed-sequence leaf. Its cash
    // and unreceipted employment edit are NOT a valid save or a natural campaign.
    // Exercise the industry phase only; never admit/save this mutant as evidence.
    const state = structuredClone(source), target = business(state, RIVAL_R01)
    state.hollywood!.employment[actorOrdinal] = { ...state.hollywood!.employment[actorOrdinal]!, endedWeek: week }
    state.hollywood!.activeEmploymentOrdinals = state.hollywood!.activeEmploymentOrdinals.filter(i => i !== actorOrdinal)
    target.account.cash = reserve + 1
    const before = structuredClone(state)
    const result = advanceHollywoodWeek(state)
    expect((result.hollywood!.businesses.find(row => row.studioId === RIVAL_R01)! as CuttingBusiness).costCutting.since).toBe(week)
    expect(state).toEqual(before)
  })
})

describe('1363 B3/B4: independent release arithmetic and binding exclusions', () => {
  it('accepts equality but refuses a one-dollar payback shortfall even when reserve passes', () => {
    // Salary 5,000; saving 6,500; charge 130,000. Payback equality is cash 2,000,000.
    // The post-release 12-week reserve is 1,122,000: it cannot mask payback.
    const f = release({ annualSalary: 260_000, weeklyOperatingCost: 100_000, reserveWeeks: 12, cash: 2_000_000 })
    expect(recovery().rivalCostCuttingReleaseAllowed(f)).toBe(true)
    expect(recovery().rivalCostCuttingReleaseAllowed({ ...f, cash: 1_999_999 })).toBe(false)
  })
  it('retains the separate R3 reserve guard when payback itself passes', () => {
    const f = release({ cash: 330_000, reserveWeeks: 20 })
    const salary = Math.round(f.annualSalary / 52), charge = salary * 26, saving = salary + TUNING.OVERHEAD_PER_EMPLOYEE
    expect(charge * f.weeklyOperatingCost).toBeLessThanOrEqual(f.cash * saving)
    expect(f.cash - charge).toBeLessThan((f.weeklyOperatingCost - saving) * f.reserveWeeks)
    expect(recovery().rivalCostCuttingReleaseAllowed(f)).toBe(false)
  })
  it.each(['productionSeat', 'writingSeat', 'unreleasedResearchSeat', 'openPromise'] as const)('protects %s independently', key => {
    const control = release(); expect(recovery().rivalCostCuttingReleaseAllowed(control)).toBe(true)
    expect(recovery().rivalCostCuttingReleaseAllowed({ ...control, [key]: true })).toBe(false)
  })
  it.each([0, 1, 26])('protects a contract with %i weeks remaining', remaining => {
    expect(recovery().rivalCostCuttingReleaseAllowed(release({ week: 182, endWeekExclusive: 182 + remaining }))).toBe(false)
  })
  it('the pure release guard has no profession exclusion; a research seat protects the same facts', () => {
    // The release predicate is role-neutral; the caller must include unseated Scientists
    // in surplus while cutting. No fabricated scientist employment is introduced here.
    expect(recovery().rivalCostCuttingReleaseAllowed(release())).toBe(true)
    expect(recovery().rivalCostCuttingReleaseAllowed(release({ unreleasedResearchSeat: true }))).toBe(false)
  })

  it('retains a genuinely occupied writing seat while cutting', () => {
    const original = advanceTo(seed(), 2), id = rowOne(original)
    const projects = business(original, id).development.projects.filter(p => p.status === 'drafting' || p.status === 'rewriting')
    expect(projects.length, 'real drafting/rewrite control required').toBeGreaterThan(0)
    const writerIds = projects.map(p => p.writerId)
    const ordinals = original.hollywood!.activeEmploymentOrdinals.filter(i => original.hollywood!.employment[i]!.studioId === id
      && writerIds.includes(original.hollywood!.employment[i]!.terms.talentId))
    expect(ordinals.length).toBeGreaterThan(0)
    const state = cuttingInput(original, id), next = tick(state); makeSave(next)
    for (const ordinal of ordinals) {
      expect(next.hollywood!.employment[ordinal]!.endedWeek).toBeNull()
      expect(next.hollywood!.activeEmploymentOrdinals).toContain(ordinal)
    }
  })

  it('releases in employment order with recomputed cash/cost and exact receipts, payroll and free agency', () => {
    const original = advanceTo(seed(), 1), id = rowOne(original), state = cuttingInput(original, id), week = state.market.tick
    const h = state.hollywood!, b = business(state, id)
    expect(week, 'actual staffing decision cadence').toBeGreaterThanOrEqual(b.nextDecisionWeek)
    expect(state.promises.filter(p => p.issuerStudioId === id && p.outcome === null)).toHaveLength(0)
    expect(b.development.projects).toHaveLength(0)
    expect(state.technology.projects.filter(p => p.studioId === id)).toHaveLength(0)
    const rows = h.activeEmploymentOrdinals.filter(i => h.employment[i]!.studioId === id).sort((a, c) => a - c)
    const fixed = TUNING.OVERHEAD_BASE + TUNING.BASELINE_DEVELOPMENT_CASTING_WEEKLY_OPERATING_COST
      + TUNING.STAGE_STANDARD_WEEKLY_OPERATING_COST + TUNING.POST_BUILDING_WEEKLY_OPERATING_COST
      + TUNING.SCENERY_SHOP_WEEKLY_OPERATING_COST
    expect(b.operations.facilities.map(f => f.capability)).toEqual(['development-casting', 'soundstage', 'set-scenery', 'post'])
    const salaries = new Map(rows.map(i => [i, Math.round(h.employment[i]!.terms.annualSalary / 52)]))
    let cash = b.account.cash, cost = fixed + rows.reduce((sum, i) => sum + salaries.get(i)! + TUNING.OVERHEAD_PER_EMPLOYEE, 0)
    const released: number[] = [], charges: number[] = []
    for (const i of rows) {
      const row = h.employment[i]!, remaining = Math.max(0, row.terms.endWeekExclusive - week)
      const charge = salaries.get(i)! * Math.min(remaining, 26), saving = salaries.get(i)! + TUNING.OVERHEAD_PER_EMPLOYEE
      if (remaining <= 26 || cash - charge < (cost - saving) * b.policy.reserveWeeks || charge * cost > cash * saving) continue
      // Cross-multiply the runway comparison independently; no rounded date oracle.
      expect((cash - charge) * cost).toBeGreaterThanOrEqual(cash * (cost - saving))
      released.push(i); charges.push(charge); cash -= charge; cost -= saving
    }
    expect(released.length, 'valid positive release control is required').toBeGreaterThan(0)
    const before = structuredClone(state), next = tick(state), after = business(next, id)
    makeSave(next)
    const receipts = next.hollywood!.receipts.slice(h.receipts.length).filter(r => r.studioId === id && r.kind === 'employment' && r.reason === 'termination')
    expect(receipts.map(r => r.kind === 'employment' ? r.contractId : '')).toEqual(released.map(i => h.employment[i]!.contractId))
    const oldMoney = allMovements(b), newMoney = allMovements(after)
    expect((newMoney.termination ?? 0) - (oldMoney.termination ?? 0)).toBe(-charges.reduce((a, c) => a + c, 0))
    expect(after.account.cash).toBe(cash - cost)
    for (const i of released) {
      expect(next.hollywood!.employment[i]!.endedWeek).toBe(week)
      expect(next.hollywood!.activeEmploymentOrdinals).not.toContain(i)
      expect(next.freeAgents).toContain(h.employment[i]!.terms.talentId)
    }
    expect(state).toEqual(before)
  })
})

describe('1363 B2/B5: Part B restrictions and no inflow, separate from disposal', () => {
  it('does not rehire next week, create positive money, remove plant or discard history', () => {
    const original = advanceTo(seed(), 1), id = rowOne(original), first = cuttingInput(original, id)
    expect(first.market.tick).toBeGreaterThanOrEqual(business(first, id).nextDecisionWeek)
    const once = tick(first), twice = tick(once); makeSave(twice)
    const b0 = business(first, id), b2 = business(twice, id)
    expect(b2.costCutting.since).toBe(first.market.tick)
    expect(twice.hollywood!.receipts.slice(first.hollywood!.receipts.length).filter(r => r.studioId === id && r.kind === 'employment' && r.toStudioId === id)).toHaveLength(0)
    const before = allMovements(b0), after = allMovements(b2)
    for (const kind of new Set([...Object.keys(before), ...Object.keys(after)])) {
      const delta = (after[kind] ?? 0) - (before[kind] ?? 0)
      if (kind === 'studioRevenue') expect(delta).toBe(0) // this valid control has no run
      else expect(delta).toBeLessThanOrEqual(0)
    }
    expect(b2.operations.facilities).toEqual(b0.operations.facilities)
    expect(twice.hollywood!.receipts.slice(0, first.hollywood!.receipts.length)).toEqual(first.hollywood!.receipts)
    expect((after.facilityOpex ?? 0) - (before.facilityOpex ?? 0)).toBe(-2 * (TUNING.BASELINE_DEVELOPMENT_CASTING_WEEKLY_OPERATING_COST
      + TUNING.STAGE_STANDARD_WEEKLY_OPERATING_COST + TUNING.POST_BUILDING_WEEKLY_OPERATING_COST + TUNING.SCENERY_SHOP_WEEKLY_OPERATING_COST))
  })
})

describe('1363 B7/B8 and the direct live profession proof', () => {
  it('a real ordinary greenlight clears cutting; the release policy is isolated as a refusal control', () => {
    const original = advanceTo(seed(), 3), id = rowOne(original), state = cuttingInput(original, id)
    const api = recovery(), spy = vi.spyOn(api, 'rivalCostCuttingReleaseAllowed').mockReturnValue(false)
    try {
      const next = tick(state)
      expect(next.hollywood!.receipts.slice(state.hollywood!.receipts.length).some(r => r.studioId === id && r.kind === 'filmAnnounced'), 'real viable/affordable package premise').toBe(true)
      expect(business(next, id).costCutting.since).toBeNull()
      makeSave(next)
    } finally { spy.mockRestore() }
  })
  it('direct profession proof accepts a valid cutting state without relying on tick swallowing a refusal', () => {
    const original = seed(), state = cuttingInput(original, rowOne(original)), before = structuredClone(state)
    expect(() => validatedLiveProfessionContext(state)).not.toThrow()
    expect(state).toEqual(before)
  })
  it('has no player cost-cutting field or player termination effect', () => {
    const original = seed(), id = rowOne(original), control = tick(original), next = tick(cuttingInput(original, id))
    expect(Object.hasOwn(next.studio, 'costCutting')).toBe(false)
    expect(next.contracts).toEqual(control.contracts)
    expect(next.ledger.filter(row => row.kind === 'termination')).toEqual(control.ledger.filter(row => row.kind === 'termination'))
    expect(next.hollywood!.businesses.some(b => b.studioId === next.hollywood!.playerStudioId)).toBe(false)
  })
  it('never invokes recovery policy in a genuine hollywood-null world', () => {
    const state = generateWorld('1363-part-b-no-hollywood'), before = structuredClone(state)
    expect(state.hollywood).toBeNull(); makeSave(state)
    const expected = tick(state), api = recovery()
    const entrySpy = vi.spyOn(api, 'rivalCostCuttingEntry').mockImplementation(() => { throw new Error('unexpected rival policy') })
    const releaseSpy = vi.spyOn(api, 'rivalCostCuttingReleaseAllowed').mockImplementation(() => { throw new Error('unexpected rival release') })
    try { expect(tick(state)).toEqual(expected); expect(entrySpy).not.toHaveBeenCalled(); expect(releaseSpy).not.toHaveBeenCalled() }
    finally { entrySpy.mockRestore(); releaseSpy.mockRestore() }
    expect(state).toEqual(before)
  })
})

// B2 controls are discovered only on the existing S8 generated route. A missing
// witness is a failed prerequisite, never a skip, fake state or permission to
// extend the search. The author has not executed this route under Part A + B.
type CommitmentKind = 'renewal' | 'replacement' | 'laboratoryPlan' | 'adoption' | 'project' | 'seat' | 'activeWork' | 'demand'
type Witness = { input: GameState; control: GameState; id: string }
let commitmentWitnesses: Map<CommitmentKind, Witness> | undefined
function ownCommitments(s: GameState, id: string) {
  return {
    employment: s.hollywood!.employment.filter(e => e.studioId === id),
    plans: s.physicalPlans.plans.filter(p => p.studioId === id),
    adoptions: s.technology.adoptions.filter(a => a.studioId === id),
    projects: s.technology.projects.filter(p => p.studioId === id),
    seats: s.technology.projects.filter(p => p.studioId === id).flatMap(p => p.seats.map(seat => ({ projectId: p.id, ...seat }))),
  }
}
function commitmentControls(): Map<CommitmentKind, Witness> {
  if (commitmentWitnesses) return commitmentWitnesses
  let state = commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-probe-01'), {
    blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 },
  })
  expect(business(state, rowOne(state)).costCutting, 'Save46 source prerequisite').toEqual({ version: 1, since: null })
  const found = new Map<CommitmentKind, Witness>()
  // The fixed current S8 route has market cases throughout every renewal window.
  // Preserve it for other controls; use an independently captured pre-market input
  // for renewal without deleting any case, history, commitment or money.
  const renewalInput = genuineRenewal196(), renewalNext = tick(renewalInput)
  makeSave(renewalInput); makeSave(renewalNext)
  for (const b of renewalInput.hollywood!.businesses) {
    if (b.costCutting.since !== null || b.productions.length || b.runs.length
      || renewalInput.talentMarket.proposals.some(p => p.issuerStudioId === b.studioId)) continue
    const prior = ownCommitments(renewalInput, b.studioId), after = ownCommitments(renewalNext, b.studioId)
    if (after.employment.slice(prior.employment.length).some(e => e.reason === 'renewal')) {
      found.set('renewal', { input: renewalInput, control: renewalNext, id: b.studioId }); break
    }
  }
  while (state.market.tick < 430 && found.size < 8) {
    const next = tick(state)
    for (const b of state.hollywood!.businesses) {
      if (business(state, b.studioId).costCutting.since !== null || b.productions.length || b.runs.length) continue
      if (state.talentMarket.proposals.some(p => p.issuerStudioId === b.studioId)) continue
      const old = ownCommitments(state, b.studioId), fresh = ownCommitments(next, b.studioId)
      const witness = { input: state, control: next, id: b.studioId }
      const record = (kind: CommitmentKind, present: boolean) => { if (present && !found.has(kind)) found.set(kind, witness) }
      const hired = fresh.employment.slice(old.employment.length)
      record('renewal', hired.some(e => e.reason === 'renewal'))
      record('replacement', hired.some(e => e.reason === 'replacement'))
      record('laboratoryPlan', fresh.plans.length > old.plans.length)
      record('adoption', fresh.adoptions.length > old.adoptions.length)
      record('demand', researchModule.rivalScientistDemand(state, state.hollywood!, b, state.talent, state.market.tick) > 0)
      record('project', fresh.projects.length > old.projects.length)
      record('seat', fresh.seats.length > old.seats.length)
      record('activeWork', old.projects.some(p => p.status === 'active'
        && fresh.projects.some(n => n.id === p.id && n.status === 'active' && n.verifiedWork > p.verifiedWork)))
    }
    state = next
  }
  commitmentWitnesses = found
  return found
}

describe('1363 B2: positive controls for staffing, research and technology restrictions', () => {
  it('sets new Scientist staffing demand to zero with a real positive demand control', () => {
    const witness = commitmentControls().get('demand')
    expect(witness, 'bounded S8 route requires positive Scientist demand at an idle studio').toBeDefined()
    const { input, id } = witness!
    makeSave(input)
    expect(researchModule.rivalScientistDemand(input, input.hollywood!, business(input, id), input.talent, input.market.tick)).toBeGreaterThan(0)
    const state = cuttingInput(input, id)
    expect(researchModule.rivalScientistDemand(state, state.hollywood!, business(state, id), state.talent, state.market.tick)).toBe(0)
  }, 120_000)
  it.each(['renewal', 'replacement', 'laboratoryPlan', 'adoption', 'project', 'seat'] as const)(
    'blocks a new %s with an observed ordinary positive control', kind => {
      // Only adoption uses the separately accepted public-migration fixture.
      // The original S8 discovery route and its missing-input evidence are preserved.
      const witness = kind === 'adoption' ? adoptionBoundary416() : commitmentControls().get(kind)
      expect(witness, `named control lacks a valid idle ${kind} positive; report prerequisite failure`).toBeDefined()
      const { input, control, id } = witness!
      makeSave(input); makeSave(control)
      const state = cuttingInput(input, id), before = structuredClone(state), next = tick(state)
      makeSave(next)
      const old = ownCommitments(input, id), after = ownCommitments(next, id)
      expect(after.employment.map(e => e.contractId)).toEqual(old.employment.map(e => e.contractId))
      expect(after.plans.map(p => p.id)).toEqual(old.plans.map(p => p.id))
      expect(after.adoptions.map(a => [a.id, a.committedWeek])).toEqual(old.adoptions.map(a => [a.id, a.committedWeek]))
      expect(after.projects.map(p => [p.id, p.startedWeek])).toEqual(old.projects.map(p => [p.id, p.startedWeek]))
      expect(after.seats.map(s => [s.projectId, s.talentId, s.assignedWeek])).toEqual(old.seats.map(s => [s.projectId, s.talentId, s.assignedWeek]))
      // Existing construction/adoption may complete; operationalWeek is deliberately
      // not compared with committedWeek (1363-F ruling 2).
      expect(state).toEqual(before)
    }, 120_000,
  )
  it('continues an already active, already seated research project and pays its work', () => {
    const witness = commitmentControls().get('activeWork')
    expect(witness, 'bounded S8 route requires an observed active-work positive control').toBeDefined()
    const { input, control, id } = witness!
    makeSave(input); makeSave(control)
    const prior = ownCommitments(input, id)
    const working = prior.projects.filter(p => p.status === 'active'
      && control.technology.projects.some(n => n.id === p.id && n.status === 'active' && n.verifiedWork > p.verifiedWork))
    expect(working.length).toBeGreaterThan(0)
    const next = tick(cuttingInput(input, id)); makeSave(next)
    for (const project of working) {
      const after = next.technology.projects.find(p => p.id === project.id)!
      expect(after.verifiedWork).toBeGreaterThan(project.verifiedWork)
      expect(after.expenditure).toBeGreaterThan(project.expenditure)
      expect(after.seats.filter(s => s.releasedWeek === null).map(s => s.talentId)).toEqual(project.seats.filter(s => s.releasedWeek === null).map(s => s.talentId))
      for (const seat of project.seats.filter(s => s.releasedWeek === null)) {
        const ordinal = input.hollywood!.activeEmploymentOrdinals.find(i => input.hollywood!.employment[i]!.studioId === id
          && input.hollywood!.employment[i]!.terms.talentId === seat.talentId)!
        expect(ordinal).toBeDefined()
        expect(next.hollywood!.employment[ordinal]!.endedWeek).toBeNull()
        expect(next.hollywood!.activeEmploymentOrdinals).toContain(ordinal)
      }
    }
    const oldMoney = allMovements(business(input, id)), newMoney = allMovements(business(next, id))
    expect((newMoney.researchSpend ?? 0) - (oldMoney.researchSpend ?? 0)).toBeLessThan(0)
  }, 120_000)
})

// The market runs after industry, promises and lifecycle intent. Capture that real
// phase's input without changing its result. It need not be a complete save yet;
// origin is its genuine, makeSave-admitted whole-week input. No clock is rewritten.
type MarketWitness = { origin: GameState; phase: GameState; control: GameState; id: string; talentId: string }
type MarketKind = 'expiryNew' | 'extensionNew' | 'expiryWithdraw' | 'extensionWithdraw'
let marketWitnesses: Map<MarketKind, MarketWitness> | undefined
function marketControls(): Map<MarketKind, MarketWitness> {
  if (marketWitnesses) return marketWitnesses
  const found = new Map<MarketKind, MarketWitness>()
  const producer = marketModule.advanceTalentMarketWeek
  const routes = [
    { input: seed(), through: 220 },
    { input: c2bLiveFixture('genuine-v35-c2b-rival-incumbent-cohorts'), through: 2705 },
  ]
  for (const route of routes) {
    let state = route.input
    expect(business(state, rowOne(state)).costCutting, 'Save46 market-control prerequisite').toEqual({ version: 1, since: null })
    while (state.market.tick < route.through) {
      const origin = state
      const observer = vi.spyOn(marketModule, 'advanceTalentMarketWeek').mockImplementation(phase => {
        const control = producer(phase)
        for (const b of phase.hollywood!.businesses) {
          if (business(phase, b.studioId).costCutting.since !== null || b.productions.length || b.runs.length) continue
          const fresh = control.talentMarket.receipts.slice(phase.talentMarket.receipts.length)
          for (const kase of control.talentMarket.cases) {
            const extension = kase.variant === 'retirementExtension'
            const prior = phase.talentMarket.proposals.some(p => p.issuerStudioId === b.studioId && p.talentId === kase.talentId)
            const submitted = fresh.some(r => r.kind === 'proposalSubmitted' && r.studioId === b.studioId && r.talentId === kase.talentId)
            // Settlement control is real new employment at this exact phase; a
            // pending bid alone does not prove before-settlement withdrawal.
            const settled = control.hollywood!.employment.slice(phase.hollywood!.employment.length)
              .some(e => e.studioId === b.studioId && e.terms.talentId === kase.talentId)
            for (const [suffix, present] of [['New', !prior && submitted], ['Withdraw', prior && settled]] as const) {
              const kind = `${extension ? 'extension' : 'expiry'}${suffix}` as MarketKind
              if (present && !found.has(kind)) found.set(kind, { origin, phase, control, id: b.studioId, talentId: kase.talentId })
            }
          }
        }
        return control
      })
      try { state = tick(state) } finally { observer.mockRestore() }
    }
  }
  marketWitnesses = found
  return found
}

describe('1363 B2: every market case, including the extension bypass', () => {
  it.each(['expiryNew', 'extensionNew', 'expiryWithdraw', 'extensionWithdraw'] as const)(
    '%s refuses new proposals and withdraws existing proposals before settlement', kind => {
      const witness = marketControls().get(kind)
      expect(witness, `bounded natural phase route lacks ${kind}; do not waive or fabricate it`).toBeDefined()
      const { origin, phase, id, talentId } = witness!
      makeSave(origin)
      const candidate = structuredClone(phase), b = business(candidate, id)
      expect(b.productions).toHaveLength(0); expect(b.runs).toHaveLength(0)
      // Explicit synthetic entry-phase flag, exactly where an actual industry
      // entry would already be visible. Its pending bids must be removed next.
      expect(candidate.market.tick, 'market phase follows the input decision week').toBe(origin.market.tick + 1)
      expect(origin.market.tick, 'modeled entry requires an actual industry decision').toBeGreaterThanOrEqual(business(origin, id).nextDecisionWeek)
      b.costCutting = { version: 1, since: origin.market.tick }
      const before = structuredClone(candidate), result = marketModule.advanceTalentMarketWeek(candidate)
      expect(result.talentMarket.proposals.filter(p => p.issuerStudioId === id)).toHaveLength(0)
      expect(result.talentMarket.receipts.slice(phase.talentMarket.receipts.length)
        .filter(r => r.kind === 'proposalSubmitted' && r.studioId === id)).toHaveLength(0)
      expect(result.hollywood!.employment.slice(phase.hollywood!.employment.length).filter(e => e.studioId === id)).toHaveLength(0)
      expect(business(result, id).account).toEqual(business(candidate, id).account)
      // No withdrawal receipt is invented; submitted historical authority stays.
      expect(result.talentMarket.receipts.slice(0, phase.talentMarket.receipts.length)).toEqual(phase.talentMarket.receipts)
      expect(result.promises.filter(p => p.issuerStudioId === id)).toEqual(phase.promises.filter(p => p.issuerStudioId === id))
      if (kind.endsWith('Withdraw')) expect(phase.talentMarket.proposals.some(p => p.issuerStudioId === id && p.talentId === talentId)).toBe(true)
      expect(candidate).toEqual(before)
    }, 120_000,
  )
})
