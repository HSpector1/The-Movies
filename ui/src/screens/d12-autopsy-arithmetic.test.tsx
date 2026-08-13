// ── D-12 autopsy arithmetic — expected values reconcile with the locked snapshot ──
// The owner found the autopsy's Expected Studio Revenue / Expected profit were ~1/0.70× too high
// across three films: greenlightAssessment recomputed the profit range on the NON-engaged path
// (omitting the 0.70 gross scale + awareness marketing), so its Studio Revenue diverged from the
// persisted (scaled) forecast. After the fix, every autopsy expected value must satisfy:
//   Expected Studio Revenue  = Expected Total Theatrical Gross × STUDIO_RENTAL_BLENDED (0.52)
//   Expected Contribution    = Expected Studio Revenue − Total Immediate Commitment
// and match the persisted greenlight snapshot.

import { describe, it, expect } from 'vitest'
import {
  greenlight,
  advanceToNextEvent,
  explainRelease,
  autopsyCompare,
  selectActiveProductions,
  requiredNegative,
  TUNING,
} from '../engine/adapter.ts'
import type { DraftPackage, GameState, CreativeRole } from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

const SHARE = TUNING.STUDIO_RENTAL_BLENDED

function pkg(state: GameState): DraftPackage {
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
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

describe('D-12 autopsy arithmetic reconciles with the locked greenlight snapshot', () => {
  it('Expected Studio Revenue = Expected Gross × 0.52, and Expected Contribution = that − commitment', () => {
    let s = newFoundedGame('autopsy-arith')
    const g = greenlight(s, pkg(s))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    s = g.next
    // Read the PERSISTED greenlight forecast snapshot before release.
    const persistedExpectedTotal = selectActiveProductions(s)[0]!.forecastSnapshot.expectedTotal

    const rel = advanceToNextEvent(s)
    const film = rel.released[0]!
    const view = explainRelease(rel.preTick, rel.next.studio.standing, film)
    const compare = autopsyCompare(rel.preTick, film)!
    const expGross = view.forecast.expectedTotal
    const expStudioRev = compare.assessment.profit.studioRevenue.expected
    const expProfit = compare.assessment.profit.profit.expected
    const commitment = compare.assessment.profit.committedCost

    // (1) the autopsy's Expected Gross equals the persisted snapshot (byte-for-byte).
    expect(expGross).toBe(persistedExpectedTotal)
    // (2) the share is applied EXACTLY ONCE, on the engaged/scaled forecast.
    //
    // D-17B §1 (newly-true behaviour, cited): this assertion used to read
    // `expStudioRev ≈ expGross × SHARE` — the LOCKED greenlight gross times the share. That
    // held only because nothing moved studio awareness between greenlight and release.
    // D-17B's engaged weekly awareness drift (tick step 5.5) does move it, and
    // `autopsyCompare` RE-DERIVES the profit range from the pre-tick state rather than reading
    // the locked snapshot — so the two now differ by the drift accumulated over the production
    // window (~2% here: 8 engaged weeks at κ=0.04 from awareness 40 against an anchor of 35).
    // The invariant this test exists to protect is the ~1/0.70 = 1.43× inflation bug, which is
    // about the SHARE being applied once on the engaged path; that is asserted directly below
    // (breakEven ≡ committedCost / share) and by (4). The divergence between the locked and
    // re-derived expectation is reported to Phase U as a truth-surface item — the autopsy
    // should compare against the LOCKED expectation, not a re-forecast.
    expect(commitment / compare.assessment.profit.breakEven).toBeCloseTo(SHARE, 12)
    // (3) Expected Contribution = Expected Studio Revenue − Total Immediate Commitment.
    expect(expProfit).toBeCloseTo(expStudioRev - commitment, 2)
    // (4) it is NOT the pre-fix inflated (non-engaged, unscaled) value ~ gross/0.70 × 0.52 —
    //     and it stays in the same neighbourhood as the locked value (the drift is a couple of
    //     percent over a production window, not a regime change).
    expect(expStudioRev).toBeLessThan(expGross * SHARE * 1.05)
    expect(expStudioRev).toBeGreaterThan(expGross * SHARE * 0.9)
  })
})
