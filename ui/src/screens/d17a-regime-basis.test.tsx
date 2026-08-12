// ── D-17A fix-pass — ONE revenue basis, in BOTH regimes ──────────────────────
// T2 said "one revenue basis". It was delivered for the engaged economy and missed on the
// never-engaged one: `explainRelease` hardcoded `× STUDIO_RENTAL_BLENDED` on the justification
// that the path "is reachable ONLY on the engaged economy". It is not — reachability is gated
// on `preTick.studio.activeProductions`, not on the regime. A never-engaged studio (a legacy /
// headless save imported through "Load save") is credited the FULL gross in one lump at release
// (`tick.ts:238-247`), so the Dashboard scorecard read 100% while the Release/Autopsy screens
// read 52% — two answers 1.92× apart, minutes apart. The Assembly break-even had the same split.
//
// This test drives a REAL never-engaged save through import → greenlight → release and asserts
// every money surface agrees on the 1.0 basis, and that the engaged path is unchanged.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Dashboard } from './Dashboard.tsx'
import {
  advanceWeek,
  cycleInclusiveBreakEvenGross,
  explainRelease,
  greenlight,
  importSaveJson,
  prospectiveCycleFixedCost,
  regimeStudioShare,
  releaseScorecard,
  requiredNegative,
  selectReleasedFilms,
  TUNING,
} from '../engine/adapter.ts'
import type { DraftPackage, GameState } from '../engine/adapter.ts'
import {
  applyActions,
  economyEngaged,
  exportSave,
  generateWorld,
  makeSaveV5,
} from '../../../src/core/index.ts'
import type { CastSlot, CreativeRole } from '../../../src/core/index.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

afterEach(cleanup)
const noop = () => {}

/** A never-engaged studio, persisted as V5 and reloaded exactly as "Load save" does. */
function importedNeverEngaged(seed: string): GameState {
  const world = generateWorld(seed)
  expect(economyEngaged(world)).toBe(false)
  const outcome = importSaveJson(exportSave(makeSaveV5(world as never)))
  expect(outcome.ok).toBe(true)
  if (!outcome.ok) throw new Error(outcome.error)
  expect(economyEngaged(outcome.state)).toBe(false)
  expect(outcome.state.founding).toBeNull() // ⇒ the App opens straight onto the Dashboard
  return outcome.state
}

/** The D-1 open-pool package this regime can actually staff. */
function openPoolPackage(state: GameState): DraftPackage {
  const concept = [...state.concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost)[0]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const byRole = (r: CreativeRole) => state.talent.filter((t) => t.role === r)
  const actors = byRole('actor')
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: byRole('writer')[0]!.id,
    directorId: byRole('director')[0]!.id,
    craftIds: [],
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<CastSlot, string>,
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

describe('D-17A fix-pass — a never-engaged studio is priced at 100% of gross, everywhere', () => {
  it('the engine credits the full gross, and the scorecard, release narrative and break-even all agree', () => {
    const loaded = importedNeverEngaged('regime-basis-1')
    const g = greenlight(loaded, openPoolPackage(loaded))
    expect(g.ok, g.ok ? '' : g.error).toBe(true)
    if (!g.ok) return

    let s = g.next
    let preTick = s
    for (let k = 0; k < 40 && selectReleasedFilms(s).length === 0; k++) {
      preTick = s
      s = advanceWeek(s).next
    }
    const film = selectReleasedFilms(s)[0]!

    // GROUND TRUTH: no theatrical run is opened; the ledger credits the whole gross at once.
    expect(s.theatricalRuns).toHaveLength(0)
    const banked = s.ledger.filter((e) => e.kind === 'boxOffice').reduce((a, e) => a + e.amount, 0)
    expect(banked).toBeCloseTo(film.boxOffice.total, 2)

    // 1 · Dashboard scorecard (reads the run, or its absence).
    const card = releaseScorecard(s, film)
    expect(card.studioRevenue).toBeCloseTo(film.boxOffice.total, 2)

    // 2 · ReleaseResult / Autopsy narrative (explainRelease).
    const av = explainRelease(preTick, s.studio.standing, film)
    expect(av.studioRevenue).toBeCloseTo(film.boxOffice.total, 2)
    // …and therefore the same contribution, not one 1.92× smaller.
    expect(av.studioRevenue).toBeCloseTo(card.studioRevenue, 2)
    expect(av.profit).toBeCloseTo(card.contribution, 2)
    // TEETH: the retired basis reported barely half of the truth on this very state.
    expect(film.boxOffice.total * TUNING.STUDIO_RENTAL_BLENDED).toBeLessThan(av.studioRevenue * 0.6)

    // 3 · The prospective Assembly headline on the same regime: the studio keeps everything,
    // so break-even gross IS the direct cost, and no contract can exist so burn is genuinely 0.
    expect(regimeStudioShare(loaded)).toBe(1)
    const fc = prospectiveCycleFixedCost(loaded)
    expect(fc.weeklyBurn).toBe(0)
    expect(fc.amount).toBe(0)
    const be = cycleInclusiveBreakEvenGross(loaded, 1_000_000)
    expect(be.direct).toBeCloseTo(1_000_000, 6)
    expect(be.cycleInclusive).toBeCloseTo(1_000_000, 6)

    // The Dashboard renders the agreeing figure.
    render(
      <Dashboard
        state={s}
        onAssemble={noop}
        onAdvance={noop}
        onSimToEvent={noop}
        onCreateTalent={noop}
        onSaves={noop}
        onOpenAutopsy={noop}
      />,
    )
    expect(screen.getByTestId(`release-${film.productionId}-result`)).toBeTruthy()
  })

  it('the ENGAGED regime is untouched: share 0.52, break-even 1/0.52 of cost', () => {
    const s = newFoundedGame('regime-basis-2')
    expect(economyEngaged(s)).toBe(true)
    expect(regimeStudioShare(s)).toBe(TUNING.STUDIO_RENTAL_BLENDED)
    const be = cycleInclusiveBreakEvenGross(s, 1_000_000)
    const fc = prospectiveCycleFixedCost(s)
    expect(be.direct).toBeCloseTo(1_000_000 / TUNING.STUDIO_RENTAL_BLENDED, 4)
    expect(be.cycleInclusive).toBeCloseTo((1_000_000 + fc.amount) / TUNING.STUDIO_RENTAL_BLENDED, 4)
    expect(foundedRosterIds(s, 'writer').length).toBeGreaterThan(0)
  })

  it('an engaged studio that fired everyone keeps the 0.52 basis (the cliff stays closed)', () => {
    let s = newFoundedGame('regime-basis-3')
    for (const c of [...s.contracts]) {
      s = applyActions(s, [{ kind: 'releaseTalent', talentId: c.talentId }])
    }
    expect(s.contracts).toHaveLength(0)
    expect(regimeStudioShare(s)).toBe(TUNING.STUDIO_RENTAL_BLENDED)
  })
})
