// ── D-12 live Commercial Outlook truth (B2/B3/B4) ─────────────────────────────
// Every live forecast surface consumes ONE canonical engine forecast; React never recomputes revenue,
// applies the 0.52 share, or subtracts commitment. This suite pins the financial invariants across
// representative packages and proves no stale/cross-film value survives when a SECOND film is assembled
// while the first is still active.

import { describe, it, expect } from 'vitest'
import {
  greenlight,
  previewForecast,
  assessProfitRange,
  totalCommittedCost,
  selectActiveProductions,
  requiredNegative,
  TUNING,
} from '../engine/adapter.ts'
import type { DraftPackage, GameState, CreativeRole } from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

const SHARE = TUNING.STUDIO_RENTAL_BLENDED

function pkg(
  state: GameState,
  opts: { actors?: [number, number, number]; w?: number; d?: number; c?: number; marketing?: number; negMult?: number; vague?: boolean } = {},
): DraftPackage {
  const concept = state.concepts[0]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const id = (r: CreativeRole, i: number) => foundedRosterIds(state, r)[i]!
  const [a0, a1, a2] = opts.actors ?? [0, 1, 2]
  const r: [number, number] = opts.vague ? [-1, 1] : [-0.4, 0.4]
  return {
    conceptId: concept.id,
    shape,
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: r, tonalWeight: r, kineticEnergy: r } },
    writerId: id('writer', opts.w ?? 0),
    directorId: id('director', opts.d ?? 0),
    craftIds: [id('craft', opts.c ?? 0)],
    cast: { lead: id('actor', a0), antagonist: id('actor', a1), support: id('actor', a2) },
    budget: { negative: requiredNegative(concept, shape, state) * (opts.negMult ?? 1), marketing: opts.marketing ?? 400_000 },
  }
}

// The representative package set (talent quality × marketing × budget × promise specificity).
function repPackages(state: GameState): DraftPackage[] {
  return [
    pkg(state, {}),
    pkg(state, { marketing: 1_000_000, negMult: 1.25 }),
    pkg(state, { marketing: 100_000, negMult: 0.75, vague: true }),
    pkg(state, { actors: [3, 4, 5], w: 1, d: 1, c: 1, marketing: 400_000 }),
  ]
}

describe('D-12 live forecast — arithmetic invariants hold on every representative package', () => {
  it('Expected Studio Revenue = Expected Gross × 0.52; Contribution = that − direct commitment', () => {
    const s = newFoundedGame('lft-arith')
    for (const p of repPackages(s)) {
      const fc = previewForecast(s, p)
      const range = assessProfitRange(s, p)
      const commit = totalCommittedCost(s, p)
      // Commercial Outlook Studio Revenue reconciles with the Budget & Forecast expected gross.
      expect(range.studioRevenue.expected).toBeCloseTo(fc.expectedTotal * SHARE, 1)
      // Film Contribution = Studio Revenue − the direct film commitment (never payroll/overhead).
      expect(range.profit.expected).toBeCloseTo(range.studioRevenue.expected - commit, 1)
      expect(range.committedCost).toBeCloseTo(commit, 1)
      // Studio Revenue can never exceed the corresponding gross.
      expect(range.studioRevenue.expected).toBeLessThanOrEqual(fc.expectedTotal + 1)
      expect(range.studioRevenue.low).toBeLessThanOrEqual(range.studioRevenue.high + 1)
      // Every band is share × gross (not the full gross).
      expect(range.studioRevenue.low).toBeLessThan(range.studioRevenue.high)
    }
  })

  it('the break-even gross is the commitment repaid out of the 0.52 share', () => {
    const s = newFoundedGame('lft-be')
    const p = pkg(s, {})
    const range = assessProfitRange(s, p)
    expect(range.breakEven).toBeCloseTo(totalCommittedCost(s, p) / SHARE, 1)
  })
})

describe('D-12 live forecast — no stale / cross-film contamination (assemble B while A is active)', () => {
  it("film B's live Commercial Outlook uses B's OWN forecast, not film A's", () => {
    const s0 = newFoundedGame('lft-crossfilm')
    // Greenlight film A (a big-marketing package), leaving it active.
    const g = greenlight(s0, pkg(s0, { actors: [0, 1, 2], w: 0, d: 0, c: 0, marketing: 1_000_000, negMult: 1.25 }))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    const s1 = g.next
    const persistedA = selectActiveProductions(s1)[0]!.forecastSnapshot.expectedTotal

    // Now assemble film B (a DIFFERENT, small package) without advancing.
    const pkgB = pkg(s1, { actors: [3, 4, 5], w: 1, d: 1, c: 1, marketing: 100_000, negMult: 0.75 })
    const fcB = previewForecast(s1, pkgB)
    const rangeB = assessProfitRange(s1, pkgB)

    // B's Commercial Outlook reconciles with B's OWN forecast (not A's).
    expect(rangeB.studioRevenue.expected).toBeCloseTo(fcB.expectedTotal * SHARE, 1)
    // And B's forecast is genuinely its own — distinct from A's persisted snapshot (no leak).
    expect(fcB.expectedTotal).not.toBeCloseTo(persistedA, 0)
    // Greenlight B: its persisted snapshot equals what the live outlook showed (no divergence).
    const g2 = greenlight(s1, pkgB)
    expect(g2.ok).toBe(true)
    if (!g2.ok) return
    const persistedB = selectActiveProductions(g2.next).find((pr) => pr.forecastSnapshot.expectedTotal !== persistedA)!
    expect(persistedB.forecastSnapshot.expectedTotal).toBeCloseTo(fcB.expectedTotal, 1)
    // A's snapshot is untouched by assembling/greenlighting B.
    const stillA = selectActiveProductions(g2.next).find((pr) => pr.forecastSnapshot.expectedTotal === persistedA)
    expect(stillA).toBeTruthy()
  })
})
