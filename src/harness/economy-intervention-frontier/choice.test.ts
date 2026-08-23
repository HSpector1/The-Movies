import { describe, expect, it } from 'vitest'
import { runOne } from '../d16/driver.js'
import { forecastProfitMax } from '../d16/policies.js'
import { MACRO_HORIZON_WEEKS, MACRO_SLICE_WEEKS } from '../economy-truth-audit/macro.js'
import {
  chooseChoiceCandidate,
  choicePolicy,
  runChoiceCell,
  runChoiceRecord,
} from './choice.js'
import type { ChoiceCandidate } from './choice.js'

function candidate(over: Partial<ChoiceCandidate> & Pick<ChoiceCandidate, 'id'>): ChoiceCandidate {
  return {
    id: over.id,
    committedCost: over.committedCost ?? 100,
    forecastLow: over.forecastLow ?? 0,
    forecastCenter: over.forecastCenter ?? 100,
    postRunwayWeeks: over.postRunwayWeeks ?? 52,
    postRunwayInfinite: over.postRunwayInfinite ?? false,
  }
}

function establishedP5(seed: string) {
  return runOne({
    seed,
    policy: forecastProfitMax,
    horizonWeeks: MACRO_HORIZON_WEEKS,
    sliceWeeks: MACRO_SLICE_WEEKS,
    checkpointEvery: 26,
    productionD17b: true,
    awarenessStats: true,
    captureLedgerAtSlices: true,
  })
}

function normalizedP5(record: ReturnType<typeof runOne>): string {
  // Policy name is the only intentional endpoint identity difference. JSON gives
  // us a byte-level regression assertion on the complete authoritative record.
  return JSON.stringify({ ...record, policy: 'P5_forecastProfitMax' })
}

describe('economy intervention choice frontier', () => {
  it('keeps the exact P5 founding and roster law', () => {
    const policy = choicePolicy('D03_absoluteProfitBaseline')
    expect(policy.founding).toEqual(forecastProfitMax.founding)
    expect(policy.roster).toEqual(forecastProfitMax.roster)
  })

  it('baseline endpoint is byte-equivalent to Audit P5 after policy normalization', () => {
    const seed = 'economy-frontier-choice-baseline-endpoint'
    expect(normalizedP5(runChoiceRecord(seed, 'D03_absoluteProfitBaseline').record)).toBe(
      normalizedP5(establishedP5(seed)),
    )
  })

  it('has no hidden cross-run state and reconciles cash exactly', () => {
    const seed = 'economy-frontier-choice-isolation'
    const left = runChoiceCell(seed, 'D03_downsideBudget_0_5')
    const right = runChoiceCell(seed, 'D03_downsideBudget_0_5')
    expect(left).toEqual(right)
    expect(left.reconciliationOk).toBe(true)
  })

  it('uses stable package-id ties and keeps the least-capital frontier literal', () => {
    const ties = [candidate({ id: 'z', forecastCenter: 400 }), candidate({ id: 'a', forecastCenter: 400 })]
    expect(chooseChoiceCandidate('D03_absoluteProfitBaseline', ties).selected?.id).toBe('a')

    const shortlist = [
      candidate({ id: 'high', committedCost: 900, forecastCenter: 1_000 }),
      candidate({ id: 'cheap-z', committedCost: 300, forecastCenter: 800 }),
      candidate({ id: 'cheap-a', committedCost: 300, forecastCenter: 800 }),
      candidate({ id: 'too-low', committedCost: 1, forecastCenter: 799 }),
    ]
    expect(chooseChoiceCandidate('D03_nearBestProfit_80_leastCapital', shortlist).selected?.id).toBe('cheap-a')
  })

  it('applies downside and runway gates only from player-visible values', () => {
    const candidates = [
      candidate({ id: 'risky', committedCost: 100, forecastLow: -51, forecastCenter: 1_000, postRunwayWeeks: 51 }),
      candidate({ id: 'safe', committedCost: 100, forecastLow: -50, forecastCenter: 900, postRunwayWeeks: 52 }),
    ]
    expect(chooseChoiceCandidate('D03_downsideBudget_0_5', candidates).selected?.id).toBe('safe')
    expect(chooseChoiceCandidate('D03_downsideBudget_1', candidates).selected?.id).toBe('risky')
    expect(chooseChoiceCandidate('D03_runwayReserve_52', candidates).selected?.id).toBe('safe')
  })
})
