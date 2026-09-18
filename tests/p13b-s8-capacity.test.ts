// ── P13B-S8 test 1: rival Lab/instrument capacity — receipt-backed, bounded,
// reserveWeeks-gated ───────────────────────────────────────────────────────
//
// Requirement-derived from "S8 — Symmetric rival research and finance" scope
// record ("Rival Lab capacity: receipt-backed Laboratory construction and
// instrument installation on the rival's own operations (≤ 2 Labs × 4 seats)
// ... the reserveWeeks policy governs when a rival commits capital; no
// invented plant — every Lab and module has a placement or plan receipt"),
// the Refinement block's rival-Lab-capacity bullet ("physicalPlans admission
// generalised to any studio through a RIVAL ADMISSION step in
// `advanceHollywoodWeek`... only when `account.cash >= quote +
// rivalWeeklyOperatingCost * reserveWeeks`; <= 2 Labs x 4 seats; capital
// booked as `researchCapacity` at admission; the facility appended at the
// plan's completion week with `laboratoryCommitted`/`laboratoryOperational`
// receipts; no placement record"), and the Audit's S8 LAW items 6
// (rivalCapacityOpex gains laboratory/instrument opex), 7 (admitRivalPlans,
// sequenced after staff() and before decide()) and 9 (abstract Laboratory
// shape `{capability:'laboratory', capacity:4, name, id}`, instruments as
// `instrumentOperational` receipts). Coverage addition (Audit, "Coverage
// additions"): "test 1 pins that the tick and the validator do not throw once
// a rival Laboratory exists."
//
// RED-by-design: `src/core/rivalResearch.ts` does not exist yet.
// `admitRivalPlans` is the import from that new module and is CALLED below
// (not merely imported), so this file fails at module resolution before any
// test body runs, rather than on a coincidental assertion (see this
// repository's own documented gotcha: an unused named import from a
// not-yet-existing module risks a bundler eliding the specifier and masking
// the intended single RED cause — tests/p13b-s6-save-v26.test.ts's own
// header names the same measured risk).
//
// PREMISES NAMED (the plan does not fix these; stated so a reviewer can tell
// a faulty test from a real defect once S8-T2 lands):
//   1. `admitRivalPlans` is imported from `rivalResearch.ts` per this file's
//      task assignment, even though the Audit's own S8 LAW item 7 places its
//      IMPLEMENTATION in `physicalPlans.ts` ("a new `admitRivalPlans(state)`
//      in `physicalPlans.ts`"). Assumed: `rivalResearch.ts` re-exports it (or
//      is the one caller-facing surface), so this file's import path is a
//      premise about the MODULE BOUNDARY, not about the function's law.
//   2. `admitRivalPlans(state)` returns `{state, history}`, mirroring
//      `admitPhysicalPlans`'s own existing signature in `physicalPlans.ts`
//      (the "reusing planAdmissionView/commitPhysicalPlan internals" text) —
//      unconfirmed by the plan for the rival case specifically.
//   3. The five new `IndustryReceipt` kinds' field shapes are taken VERBATIM
//      from the Save V27 paragraph: `laboratoryCommitted {planId,
//      facilityId}`, `laboratoryOperational {facilityId}`,
//      `instrumentOperational {facilityId, technologyId}`.
//   4. "Capital booked as `researchCapacity` at admission" is read as: the
//      FULL capex (`TUNING.RESEARCH_LABORATORY_CAPEX` / the instrument's own
//      capex) is charged as one negative `researchCapacity` movement in the
//      week `admitRivalPlans` admits the plan — before the facility exists —
//      exactly as the player's own capex is charged once, at commit, by the
//      existing P09 law this text is generalising.
//   5. In the shipped engine, `admitRivalPlans` runs automatically every week
//      inside `advanceHollywoodWeek` (Audit item 7). This file also drives it
//      directly, once per boundary, to isolate its own effect from the rest
//      of the weekly cycle — this repository names no existing precedent for
//      calling `admitPhysicalPlans` directly in a test (only through real
//      ticks), so this is a deliberate choice for THIS file, not a copied
//      convention.

import { describe, expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import { rivalCapacityOpex, rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { TUNING } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import type { HollywoodState, IndustryReceipt, RivalBusiness } from '../src/core/hollywoodTypes.js'
// RED-by-design: src/core/rivalResearch.ts does not exist yet. This is the
// ONE import from that new module in this file.
import { admitRivalPlans } from '../src/core/rivalResearch.js'

const SEED = 'p13b-s8-capacity-01'

function bellwether(state: GameState): { hollywood: HollywoodState; business: RivalBusiness } {
  const hollywood = state.hollywood!
  const identity = hollywood.identities.find(s => s.row === 1)! // Bellwether Pictures, $32,000,000, reserveWeeks 13, entered week 0
  const business = hollywood.businesses.find(b => b.studioId === identity.studioId)!
  return { hollywood, business }
}

/** Genuinely reduces one rival's cash (and its current period's closing/movements), the same forging technique tests/p13b-s7-independence.test.ts already relies on for a rival-only fact. */
function withRivalCash(state: GameState, studioId: string, cash: number): GameState {
  const hollywood = structuredClone(state.hollywood)!
  hollywood.businesses = hollywood.businesses.map(b => {
    if (b.studioId !== studioId) return b
    const periods = [...b.account.periods]
    const last = { ...periods[periods.length - 1]! }
    const delta = cash - b.account.cash
    last.movements = { ...last.movements, capacity: last.movements.capacity + delta }
    last.closing = cash
    periods[periods.length - 1] = last
    return { ...b, account: { ...b.account, cash, periods } }
  })
  return { ...state, hollywood }
}

describe('P13B-S8 rival Laboratory/instrument capacity: receipts, <=2x4, reserveWeeks (test 1)', () => {
  it('PRECONDITION (today, pre-S8): a rival business holding a Laboratory facility makes rivalCapacityOpex throw, and the validator therefore refuses it too — the exact gap S8-T2 closes', () => {
    const base = p13aGeneratedStudio(SEED)
    const { hollywood, business } = bellwether(base)
    const forgedHollywood: HollywoodState = {
      ...hollywood,
      businesses: hollywood.businesses.map(b => b.studioId === business.studioId
        ? { ...b, operations: { ...b.operations, facilities: [...b.operations.facilities,
            { id: `${b.studioId}:lab-forged`, name: 'Research Laboratory', capability: 'laboratory' as const, capacity: 4 }] } }
        : b),
    }
    const forged: GameState = { ...base, hollywood: forgedHollywood }
    expect(() => rivalCapacityOpex(forgedHollywood.businesses.find(b => b.studioId === business.studioId)!))
      .toThrow('P13A rival capacity cannot contain a Laboratory')
    expect(() => save.exportCurrentState(forged)).toThrow()
  })

  it('admission: admitRivalPlans commits a Laboratory only when cash covers the quote PLUS reserveWeeks of runway, booking the full capex as one negative researchCapacity movement with a laboratoryCommitted receipt {planId, facilityId} — no facility yet', () => {
    const base = p13aGeneratedStudio(SEED)
    const { business } = bellwether(base)
    const week = base.market.tick
    const requiredReserve = rivalWeeklyOperatingCost(business, base.hollywood!, week) * business.policy.reserveWeeks
    const quote = TUNING.RESEARCH_LABORATORY_CAPEX

    // Below the reserveWeeks threshold by $1: refused, nothing moves.
    const tooPoor = withRivalCash(base, business.studioId, quote + requiredReserve - 1)
    const afterRefusal = admitRivalPlans(tooPoor)
    const refusedBusiness = afterRefusal.state.hollywood!.businesses.find(b => b.studioId === business.studioId)!
    expect(refusedBusiness.operations.facilities.some(f => f.capability === 'laboratory')).toBe(false)
    expect(refusedBusiness.account.cash).toBe(quote + requiredReserve - 1)
    expect(afterRefusal.state.hollywood!.receipts.some(r => r.kind === 'laboratoryCommitted' && r.studioId === business.studioId)).toBe(false)

    // Exactly at the threshold: admitted. Full capex charged as researchCapacity; no facility yet.
    const exactlyFunded = withRivalCash(base, business.studioId, quote + requiredReserve)
    const admitted = admitRivalPlans(exactlyFunded)
    const admittedBusiness = admitted.state.hollywood!.businesses.find(b => b.studioId === business.studioId)!
    expect(admittedBusiness.account.cash).toBe(requiredReserve)
    expect(admittedBusiness.operations.facilities.some(f => f.capability === 'laboratory')).toBe(false)
    const period = admittedBusiness.account.periods[admittedBusiness.account.periods.length - 1]!
    expect(period.movements.researchCapacity).toBe(-quote)
    const receipt = admitted.state.hollywood!.receipts.find(r => r.kind === 'laboratoryCommitted' && r.studioId === business.studioId) as
      Extract<IndustryReceipt, { kind: 'laboratoryCommitted' }> | undefined
    expect(receipt).toBeDefined()
    expect(receipt!.week).toBe(week)
  }, 30_000)

  it('completion: a committed Laboratory becomes an abstract {capability: "laboratory", capacity: 4} facility on the rival operations at the plan\'s completion week, with a laboratoryOperational {facilityId} receipt, and no placement record is ever written for it', () => {
    const base = p13aGeneratedStudio(SEED)
    const { business } = bellwether(base)
    const week = base.market.tick
    const quote = TUNING.RESEARCH_LABORATORY_CAPEX
    const requiredReserve = rivalWeeklyOperatingCost(business, base.hollywood!, week) * business.policy.reserveWeeks
    const funded = withRivalCash(base, business.studioId, quote + requiredReserve + 1_000_000)
    const committed = admitRivalPlans(funded).state

    // Real ticks to the Laboratory blueprint's own build duration — no invented clock jump.
    const completed = advanceTo(committed, week + TUNING.RESEARCH_LABORATORY_BUILD_WEEKS)
    const completedBusiness = completed.hollywood!.businesses.find(b => b.studioId === business.studioId)!
    const labs = completedBusiness.operations.facilities.filter(f => f.capability === 'laboratory')
    expect(labs.length).toBe(1)
    expect(labs[0]!.capacity).toBe(4)
    const operationalReceipt = completed.hollywood!.receipts.find(r => r.kind === 'laboratoryOperational' && r.studioId === business.studioId) as
      Extract<IndustryReceipt, { kind: 'laboratoryOperational' }> | undefined
    expect(operationalReceipt).toBeDefined()
    expect(operationalReceipt!.facilityId).toBe(labs[0]!.id)
    expect(operationalReceipt!.week).toBe(week + TUNING.RESEARCH_LABORATORY_BUILD_WEEKS)
    // "no placement record": this abstract plant never appears on the shared P09 root.
    expect(completed.placement.facilities.some(f => f.id === labs[0]!.id)).toBe(false)
  }, 30_000)

  it('bound: a rival never holds more than 2 Laboratories, each never exceeding 4 seats of capacity — repeated admission past the bound is a no-op, not a refusal that leaves partial state', () => {
    const base = p13aGeneratedStudio(SEED)
    const { business } = bellwether(base)
    const week = base.market.tick
    const ample = withRivalCash(base, business.studioId, 100_000_000)
    let state = ample
    // Drive admission + completion cycles well past what two Laboratories need.
    for (let i = 0; i < 6; i++) {
      state = admitRivalPlans(state).state
      state = advanceTo(state, state.market.tick + TUNING.RESEARCH_LABORATORY_BUILD_WEEKS)
    }
    const finalBusiness = state.hollywood!.businesses.find(b => b.studioId === business.studioId)!
    const labs = finalBusiness.operations.facilities.filter(f => f.capability === 'laboratory')
    expect(labs.length).toBeLessThanOrEqual(2)
    for (const lab of labs) expect(lab.capacity).toBeLessThanOrEqual(4)
    void week
  }, 30_000)

  it('coverage: once a rival Laboratory exists, the tick (advanceHollywoodWeek, via a real advanceTo) and the validator (save.exportCurrentState) do not throw', () => {
    const base = p13aGeneratedStudio(SEED)
    const { business } = bellwether(base)
    const week = base.market.tick
    const quote = TUNING.RESEARCH_LABORATORY_CAPEX
    const requiredReserve = rivalWeeklyOperatingCost(business, base.hollywood!, week) * business.policy.reserveWeeks
    const funded = withRivalCash(base, business.studioId, quote + requiredReserve + 1_000_000)
    const committed = admitRivalPlans(funded).state
    const completed = advanceTo(committed, week + TUNING.RESEARCH_LABORATORY_BUILD_WEEKS)
    expect(completed.hollywood!.businesses.find(b => b.studioId === business.studioId)!
      .operations.facilities.some(f => f.capability === 'laboratory')).toBe(true)
    expect(() => advanceTo(completed, completed.market.tick + 4)).not.toThrow()
    expect(() => save.exportCurrentState(advanceTo(completed, completed.market.tick + 4))).not.toThrow()
  }, 30_000)
})
