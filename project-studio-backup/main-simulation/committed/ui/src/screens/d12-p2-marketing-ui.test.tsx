// ── D-12 P2 — awareness-conditioned Marketing UI truthfulness ─────────────────
// The Budget & Forecast screen must explain, truthfully, whether the chosen Marketing spend is
// within the film's awareness-conditioned efficient capacity. The efficiency read model reads the
// ENGINE's own pre-marketing awareness + capacity (no UI-duplicated formula); the display state is a
// band over spend ÷ capacity. A maximum campaign on a brand-new (low-awareness) studio's film is
// flagged as over its efficient range; the same figure the engine used drives the label.

import { describe, it, expect } from 'vitest'
import { marketingEfficiency, requiredNegative } from '../engine/adapter.ts'
import type { DraftPackage, GameState, CreativeRole } from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

function pkg(state: GameState, marketing: number): DraftPackage {
  const concept = state.concepts[0]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const id = (r: CreativeRole, i: number) => foundedRosterIds(state, r)[i]!
  return {
    conceptId: concept.id,
    shape,
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] } },
    writerId: id('writer', 0),
    directorId: id('director', 0),
    craftIds: [id('craft', 0)],
    cast: { lead: id('actor', 0), antagonist: id('actor', 1), support: id('actor', 2) },
    budget: { negative: requiredNegative(concept, shape, state), marketing },
  }
}

describe('D-12 P2: marketing efficiency read model is engine-derived and awareness-conditioned', () => {
  it('the state is a truthful band over the engine spend÷capacity ratio', () => {
    const s = newFoundedGame('p2-mkt-ui')
    const eff = marketingEfficiency(s, pkg(s, 400_000))
    expect(eff.engaged).toBe(true)
    // capacity + awareness are real engine values, and the ratio reconciles.
    expect(eff.capacity).toBeGreaterThan(0)
    expect(eff.preMarketingAwareness).toBeGreaterThanOrEqual(0)
    expect(eff.preMarketingAwareness).toBeLessThanOrEqual(1)
    expect(eff.ratio).toBeCloseTo(eff.spend / eff.capacity, 6)
    const expected =
      eff.ratio < 0.5 ? 'Underexposed' : eff.ratio < 1.2 ? 'Efficient campaign' : eff.ratio < 2.5 ? 'Near saturation' : 'Overextended campaign'
    expect(eff.state).toBe(expected)
  })

  it('a maximum campaign is LESS efficiently absorbed than a standard one (higher spend÷capacity)', () => {
    const s = newFoundedGame('p2-mkt-ui-2')
    const standard = marketingEfficiency(s, pkg(s, 400_000))
    const maxed = marketingEfficiency(s, pkg(s, 1_000_000))
    // Same film + awareness ⇒ same capacity; a bigger campaign sits further past efficient capacity.
    expect(maxed.capacity).toBeCloseTo(standard.capacity, 6)
    expect(maxed.ratio).toBeGreaterThan(standard.ratio)
    // On a brand-new studio (low audience awareness), a $1M campaign is beyond efficient capacity.
    expect(maxed.ratio).toBeGreaterThan(1)
  })
})
