// Bounded predecessor instrumentation control, not a natural cutting/disposal witness.
// Install the observer delta and this companion in a separate S+O test tree.
import { createHash } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import * as industry from '../src/core/hollywoodTick.js'
import * as policy from '../src/core/hollywoodPolicy.js'
import * as forecasts from '../src/core/forecast.js'
import { advanceHollywoodWeek as uninstrumentedIndustry } from './helpers/recovery-schema-policy-control.js'
import { tick } from '../src/core/tick.js'
import { makeSave, validateSaveV46 } from '../src/core/save.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import type { RivalPolicyObservation } from '../src/core/hollywoodTick.js'

const json = (value: unknown) => JSON.stringify(value)
const digest = (value: unknown) => createHash('sha256').update(json(value)).digest('hex')
const clone = (state: GameState): GameState => JSON.parse(json(state)) as GameState
const observedIndustry = industry.advanceHollywoodWeek

type Mode = 'original' | 'observerAbsent' | 'observerPresent'
type Step = {
  state: GameState; events: RivalPolicyObservation[]; choices: string[]; searches: string[]
  forecastCalls: number; phaseCadence: { studioId: string; week: number; nextDecisionWeek: number }[]
}
function step(input: GameState, mode: Mode): Step {
  validateSaveV46(makeSave(input))
  const before = json(input), events: RivalPolicyObservation[] = []
  const choices: string[] = [], searches: string[] = []
  const phaseCadence: Step['phaseCadence'] = []
  let forecastCalls = 0
  const choose = policy.chooseIndustryPackage, search = policy.searchIndustryPackages
  const forecast = forecasts.computeForecast
  const chooseSpy = vi.spyOn(policy, 'chooseIndustryPackage').mockImplementation((...args) => {
    const result = choose(...args)
    choices.push(digest({ args, result }))
    return result
  })
  const searchSpy = vi.spyOn(policy, 'searchIndustryPackages').mockImplementation((...args) => {
    const result = search(...args)
    searches.push(digest({ args, result }))
    return result
  })
  const forecastSpy = vi.spyOn(forecasts, 'computeForecast').mockImplementation((...args) => {
    forecastCalls++
    return forecast(...args)
  })
  const industrySpy = vi.spyOn(industry, 'advanceHollywoodWeek').mockImplementation((state, factors) => {
    phaseCadence.push(...(state.hollywood?.businesses ?? []).map(b => ({
      studioId: b.studioId, week: state.market.tick, nextDecisionWeek: b.nextDecisionWeek,
    })))
    if (mode === 'original') return uninstrumentedIndustry(state, factors)
    if (mode === 'observerAbsent') return observedIndustry(state, factors)
    return observedIndustry(state, factors, event => {
      // Copy data before retaining it. The observer receives no GameState owner.
      events.push(JSON.parse(json(event)) as RivalPolicyObservation)
    })
  })
  try {
    const state = tick(input)
    expect(json(input), 'whole-tick input neutrality').toBe(before)
    validateSaveV46(makeSave(state))
    return { state, events, choices, searches, forecastCalls, phaseCadence }
  } finally {
    industrySpy.mockRestore(); forecastSpy.mockRestore(); searchSpy.mockRestore(); chooseSpy.mockRestore()
  }
}

function assertFacts(result: Step): void {
  const decisions = result.events.filter(e => e.kind === 'decision')
  for (const phase of result.phaseCadence) {
    const matching = decisions.filter(e => e.studioId === phase.studioId && e.week === phase.week)
    expect(matching.length, 'one observer event only for an actual scheduled decision')
      .toBe(phase.week >= phase.nextDecisionWeek ? 1 : 0)
    for (const event of matching) {
      expect(event.nextDecisionWeekBefore).toBe(phase.nextDecisionWeek)
      const refusals = result.events.filter(e => e.kind === 'staffCashRefusal'
        && e.studioId === event.studioId && e.week === event.week)
      expect(event.staffing).toEqual({
        unfilledFilmSlotForCash: refusals.some(e => e.kind === 'staffCashRefusal' && e.branch === 'filmVacancy'),
        renewalRefusedForCash: refusals.some(e => e.kind === 'staffCashRefusal' && e.branch === 'renewal'),
        unrelatedScientistSlotRefusedForCash: refusals.some(e => e.kind === 'staffCashRefusal' && e.branch === 'scientistVacancy'),
      })
      expect(event.sinceAtDecisionEnd, 'S/O observes old policy; it never writes entry').toBeNull()
      if (event.commissionStop === 'fullIndex') expect(event.retainedActiveOrdinals.length).toBeGreaterThanOrEqual(2)
      if (event.commissionStop === 'cashBelowReserve') expect(event.cash).toBeLessThan(event.reserve)
      // No missing evaluated ordinal is filled with a fabricated cash outcome.
      expect(new Set(event.evaluated.map(e => `${e.source}:${e.ordinal}`)).size).toBe(event.evaluated.length)
    }
  }
  for (const event of result.events) {
    if (event.kind === 'staffCashRefusal') {
      expect(event.cash - event.signingBonus).toBeLessThan(event.reserveAfterOffer)
      if (event.branch === 'renewal') {
        expect(event.slot).toBeNull(); expect(typeof event.contractId).toBe('string')
      } else {
        expect(event.contractId).toBeNull(); expect(Number.isInteger(event.slot)).toBe(true)
        if (event.branch === 'scientistVacancy') expect(event.role).toBe('scientist')
        else expect(event.role).not.toBe('scientist')
      }
    } else if (event.kind === 'legacyRelease') {
      if (event.outcome === 'occupiedOrShortTerm') {
        expect(event.occupied || event.remainingWeeks <= TUNING.HIRING_TERMINATION_CAP_WEEKS).toBe(true)
        expect(event.charge).toBeNull(); expect(event.reserveAfterRelease).toBeNull()
      } else if (event.outcome === 'openPromise') {
        expect(event.charge).toBeNull(); expect(event.reserveAfterRelease).toBeNull()
      } else {
        expect(event.occupied).toBe(false)
        expect(event.remainingWeeks).toBeGreaterThan(TUNING.HIRING_TERMINATION_CAP_WEEKS)
        // Independent capped weekly termination arithmetic; no new payback law is applied.
        const charge = Math.round(event.annualSalary / 52)
          * Math.min(event.remainingWeeks, TUNING.HIRING_TERMINATION_CAP_WEEKS)
        expect(event.charge).toBe(charge)
        expect(event.reserveAfterRelease).not.toBeNull()
        if (event.outcome === 'released') expect(event.cash - charge).toBeGreaterThanOrEqual(event.reserveAfterRelease!)
        else expect(event.cash - charge).toBeLessThan(event.reserveAfterRelease!)
      }
    }
  }
}

describe('1363 schema-only policy observations', () => {
  it('matches exact uninstrumented policy, with and without observer, for 53 genuine ticks', () => {
    let control = p13aGeneratedStudio('p13a-core-causal-01')
    let absent = clone(control), present = clone(control)
    let decisions = 0, commissions = 0
    for (let week = 0; week < 53; week++) {
      const a = step(control, 'original'), b = step(absent, 'observerAbsent'), c = step(present, 'observerPresent')
      expect(json(b.state), `absent observer state at ${week + 1}`).toBe(json(a.state))
      expect(json(c.state), `present observer state at ${week + 1}`).toBe(json(a.state))
      expect(c.state.rngState).toBe(a.state.rngState)
      for (const result of [b, c]) {
        expect(result.choices).toEqual(a.choices)
        expect(result.searches).toEqual(a.searches)
        expect(result.forecastCalls).toBe(a.forecastCalls)
        expect(result.phaseCadence).toEqual(a.phaseCadence)
      }
      expect(a.events).toEqual([]); expect(b.events).toEqual([])
      assertFacts(c)
      decisions += c.events.filter(e => e.kind === 'decision').length
      commissions += c.events.filter(e => e.kind === 'decision' && e.commissioned).length
      control = a.state; absent = b.state; present = c.state
    }
    expect(control.market.tick).toBe(53)
    expect(decisions, 'actual scheduled observation premise').toBeGreaterThan(0)
    expect(commissions, 'real ordinary commission premise').toBeGreaterThan(0)
    // Renewal/Scientist refusal and surplus-release reachability are deliberately
    // not asserted here. Their separate bounded real-path producers remain required.
  }, 120_000)
})
