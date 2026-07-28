// ── D-12 Production Demand read model + Budget & Forecast display (§10) ────────
// The player must be told, truthfully and live, how much funding THIS film needs (Production Demand),
// whether the selected budget under/adequately/over-funds it, what drives the demand, and that money
// cannot buy audience demand or fix casting/Fit. The classification is engine-derived; React renders it.

import { describe, it, expect } from 'vitest'
import { productionDemandView, requiredNegative } from '../engine/adapter.ts'
import type { GameState, FilmShape } from '../engine/adapter.ts'
import { newFoundedGame } from '../test/founding.ts'

const CONTAINED: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'tragic' } // low demand
const DEMANDING: FilmShape = { opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' } // high demand

function demandAt(s: GameState, shape: FilmShape, negMult: number) {
  const concept = s.concepts[0]!
  return productionDemandView(s, concept, shape, requiredNegative(concept, shape, s) * negMult)
}

describe('D-12 Production Demand read model is truthful + ambition-driven', () => {
  it('classifies demand by the Shape ambition: contained < demanding', () => {
    const s = newFoundedGame('demand-ui')
    const contained = demandAt(s, CONTAINED, 1.0)
    const demanding = demandAt(s, DEMANDING, 1.0)
    expect(demanding.demandMultiplier).toBeGreaterThan(contained.demandMultiplier)
    expect(['Contained', 'Standard']).toContain(contained.demandCategory)
    expect(['Demanding', 'Highly Demanding']).toContain(demanding.demandCategory)
  })

  it('classifies funding status by the selected budget ÷ demand ratio', () => {
    const s = newFoundedGame('demand-ui-2')
    expect(demandAt(s, DEMANDING, 0.75).fundingStatus).toBe('Underfunded')
    expect(demandAt(s, DEMANDING, 1.0).fundingStatus).toBe('Adequately Funded')
    expect(demandAt(s, DEMANDING, 1.25).fundingStatus).toBe('Well Funded')
    // ratio reconciles with the raw numbers.
    const d = demandAt(s, DEMANDING, 1.0)
    expect(d.fundingRatio).toBeCloseTo(d.negative / d.demand, 6)
  })

  it('the consequence is truthful: overfunding cannot buy demand or fix casting/Fit', () => {
    const s = newFoundedGame('demand-ui-3')
    const over = demandAt(s, DEMANDING, 1.25)
    expect(over.consequence.toLowerCase()).toMatch(/does not create audience demand|cannot fix|diminishing/)
    const under = demandAt(s, DEMANDING, 0.75)
    expect(under.consequence.toLowerCase()).toMatch(/realize|execution/)
  })
})
