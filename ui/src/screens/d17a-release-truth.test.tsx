// ── D-17A/T2 — projected-profit labelling + basis alignment ───────────────────
// Two related defects on the RETROSPECTIVE side of the same "one profit convention" ruling:
//   1. full-run figures presented as banked results while the run was still paying out;
//   2. `releaseScorecard` applying STUDIO_RENTAL_BLENDED to every film, including migrated
//      V3 films whose run locks studioShare 1.0 — halving their reported economics.
// Both are asserted here against the real engine, not against a fixture of the answer.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { FilmRecord } from './FilmRecord.tsx'
import { Dashboard } from './Dashboard.tsx'
import {
  advanceWeek,
  filmCommittedCost,
  filmRecordView,
  greenlight,
  releaseScorecard,
  requiredNegative,
  selectReleasedFilms,
  studioRevenueForFilm,
  TUNING,
} from '../engine/adapter.ts'
import type { DraftPackage, GameState } from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

afterEach(cleanup)
const noop = () => {}

function pkgOf(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const a = foundedRosterIds(state, 'actor')
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: foundedRosterIds(state, 'writer')[0]!,
    directorId: foundedRosterIds(state, 'director')[0]!,
    craftIds: [foundedRosterIds(state, 'craft')[0]!],
    cast: { lead: a[0]!, antagonist: a[1]!, support: a[2]! },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

/** Greenlight one film and advance until it has released. Returns the state at release week. */
function atRelease(seed: string): GameState {
  const g = greenlight(newFoundedGame(seed), pkgOf(newFoundedGame(seed)))
  if (!g.ok) throw new Error(g.error)
  let s = g.next
  for (let k = 0; k < 40 && selectReleasedFilms(s).length === 0; k++) s = advanceWeek(s).next
  expect(selectReleasedFilms(s).length).toBe(1)
  return s
}

/** Advance until the film's run has stopped paying. */
function afterRun(state: GameState, productionId: string): GameState {
  let s = state
  for (let k = 0; k < 20 && s.theatricalRuns.some((r) => r.productionId === productionId && r.status === 'active'); k++) {
    s = advanceWeek(s).next
  }
  return s
}

describe('D-17A/T2 — a live run’s full-run figure is labelled Projected', () => {
  it('the Dashboard release row says "Projected …" while the run pays, and drops it when it ends', () => {
    const live = atRelease('d17a-proj-1')
    const film = selectReleasedFilms(live)[0]!

    const whileLive = releaseScorecard(live, film)
    expect(whileLive.projected).toBe(true)
    expect(whileLive.resultLabel).toMatch(/^Projected /)
    render(
      <Dashboard
        state={live}
        onAssemble={noop}
        onAdvance={noop}
        onSimToEvent={noop}
        onCreateTalent={noop}
        onSaves={noop}
        onOpenAutopsy={noop}
      />,
    )
    expect(screen.getByTestId(`release-${film.productionId}-result`).textContent).toMatch(/^Projected /)
    cleanup()

    const done = afterRun(live, film.productionId)
    const settled = releaseScorecard(done, film)
    expect(settled.projected).toBe(false)
    expect(settled.resultLabel).not.toMatch(/^Projected /)
    // Same money either way — the qualifier is about CASH TIMING, not a different figure.
    expect(settled.contribution).toBeCloseTo(whileLive.contribution, 2)
  })

  it('the archived Film Record labels a live run’s profit as projected', () => {
    const live = atRelease('d17a-proj-2')
    const film = selectReleasedFilms(live)[0]!
    const view = filmRecordView(live, film)!
    expect(view.projected).toBe(true)

    render(<FilmRecord view={view} onBack={noop} />)
    const cell = screen.getByTestId('record-profit')
    expect(cell.textContent).toMatch(/Projected (Profit|Loss)/)
    expect(cell.textContent).toContain(moneyExact(view.profit))
    cleanup()

    const done = afterRun(live, film.productionId)
    const settledView = filmRecordView(done, film)!
    expect(settledView.projected).toBe(false)
    render(<FilmRecord view={settledView} onBack={noop} />)
    expect(screen.getByTestId('record-profit').textContent).not.toMatch(/Projected/)
  })
})

describe('D-17A/T2 — releaseScorecard reads the run’s OWN locked share', () => {
  it('uses studioRevenueForFilm, so a legacy 1.0-share run is not halved', () => {
    const s = atRelease('d17a-basis-1')
    const film = selectReleasedFilms(s)[0]!

    // Engaged D-12 run: the share is the blended one, so nothing moved for a normal film.
    const card = releaseScorecard(s, film)
    expect(card.studioRevenue).toBeCloseTo(studioRevenueForFilm(s, film.productionId)!, 6)
    expect(card.studioRevenue).toBeCloseTo(card.gross * TUNING.STUDIO_RENTAL_BLENDED, 2)

    // A MIGRATED V3 film's run locks studioShare 1.0 (it already received the full gross).
    // The retired hardcoded 0.52 halved exactly this case.
    const legacy: GameState = {
      ...s,
      theatricalRuns: s.theatricalRuns.map((r) =>
        r.productionId === film.productionId
          ? { ...r, studioShare: 1.0, status: 'legacyCompleted' as const, economyModelVersion: 0 }
          : r,
      ),
    }
    const legacyCard = releaseScorecard(legacy, film)
    expect(legacyCard.studioRevenue).toBeCloseTo(legacyCard.gross, 6)
    expect(legacyCard.projected).toBe(false) // a legacyCompleted run is not still paying
    expect(legacyCard.contribution).toBeCloseTo(
      legacyCard.gross - filmCommittedCost(legacy, film.productionId),
      2,
    )
    // TEETH: the retired basis reported roughly half of the truth on this very state.
    const retired = legacyCard.gross * TUNING.STUDIO_RENTAL_BLENDED
    expect(retired).toBeLessThan(legacyCard.studioRevenue * 0.6)
  })

  it('a film with no run record at all falls back to the pre-D-12 full-gross truth', () => {
    const s = atRelease('d17a-basis-2')
    const film = selectReleasedFilms(s)[0]!
    const noRun: GameState = { ...s, theatricalRuns: [] }
    const card = releaseScorecard(noRun, film)
    expect(studioRevenueForFilm(noRun, film.productionId)).toBeNull()
    expect(card.studioRevenue).toBe(card.gross)
    expect(card.projected).toBe(false)
  })
})
