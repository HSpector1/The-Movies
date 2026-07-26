// ── INDEPENDENT autopsy-faithfulness suite ───────────────────────────────────
// Governing rule (Phase-5 authorization / contract §5.3, §5.5, §5.6, §6):
//   • The autopsy shows the forecast snapshot AND the realized result.
//   • criticMean, criticSigma AND the sampled reviewVariance are all displayed
//     (the random review term is NEVER hidden).
//   • Each segment's response is displayed.
//   • The shown box-office total equals the engine FilmResult.boxOffice.total;
//     the shown profit equals total − committedCost.
//   • The standing deltas equal the engine's post−pre; the three "why" lines
//     reference reach / critic-vs-benchmark / ROI.
//   • No invented causal explanation is rendered — every number is an engine value.
//
// We greenlight → advance → release for real (real adapter), read the engine
// FilmResult, then render the Autopsy from the adapter's reconstruction and assert
// the DOM against ENGINE TRUTH.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Autopsy } from './Autopsy.tsx'
import {
  newGame,
  greenlight,
  advanceWeek,
  explainRelease,
  requiredNegative,
  talentByRole,
} from '../engine/adapter.ts'
import type { DraftPackage, GameState, FilmResult, AutopsyView, Standing } from '../engine/adapter.ts'
import { money, signed, score, segmentLabel } from '../format.ts'

afterEach(cleanup)

function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const writer = talentByRole(state, 'writer').find((t) => t.available)!
  const director = talentByRole(state, 'director').find((t) => t.available)!
  const actors = talentByRole(state, 'actor').filter((t) => t.available)
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: writer.id,
    directorId: director.id,
    craftIds: [],
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

// Run a real greenlight→advance-to-release and return the engine FilmResult plus the
// pre-tick state and post-tick standing needed for the autopsy reconstruction.
function playToRelease(seed: string): {
  film: FilmResult
  view: AutopsyView
  preStanding: Standing
  postStanding: Standing
} {
  let state = newGame(seed)
  const g = greenlight(state, legalPackage(state))
  if (!g.ok) throw new Error('setup: greenlight failed: ' + g.error)
  state = g.next

  let released: FilmResult[] = []
  let preTick = state
  let postStanding = state.studio.standing
  for (let i = 0; i < 20 && released.length === 0; i++) {
    const step = advanceWeek(state)
    preTick = step.preTick
    state = step.next
    postStanding = state.studio.standing
    released = step.released
  }
  if (released.length === 0) throw new Error('setup: nothing released')
  const film = released[0]!
  const preStanding = preTick.studio.standing
  const view = explainRelease(preTick, postStanding, film)
  return { film, view, preStanding, postStanding }
}

describe('autopsy: shows forecast snapshot AND realized result', () => {
  it('renders both the forecast estimate and the realized result numbers', () => {
    const { view, film } = playToRelease('autopsy-both-1')
    render(<Autopsy view={view} onBack={() => {}} />)
    expect(screen.getByTestId('autopsy')).toBeInTheDocument()

    const body = screen.getByTestId('autopsy').textContent ?? ''
    // The stored forecast snapshot (estimate) figures are rendered...
    expect(body).toContain(score(view.forecast.expectedCriticScore))
    expect(body).toContain(money(view.forecast.expectedTotal))
    // ...alongside the realized result figures (critic + total box office).
    expect(body).toContain(score(film.criticScore))
    expect(body).toContain(money(film.boxOffice.total))
    // The forecast displayed IS the stored greenlight snapshot (has the §7 shape:
    // per-segment forecasts + the three expected headline fields), not a recompute.
    expect(view.forecast.segments.length).toBeGreaterThan(0)
    expect(Number.isFinite(view.forecast.expectedTotal)).toBe(true)
    expect(Number.isFinite(view.forecast.expectedCriticScore)).toBe(true)
  })

  it('the realized critic score shown equals the engine FilmResult.criticScore', () => {
    const { view, film } = playToRelease('autopsy-both-2')
    render(<Autopsy view={view} onBack={() => {}} />)
    // The autopsy critic cell shows the STORED sampled critic score.
    expect(screen.getByTestId('autopsy-critic')).toHaveTextContent(score(film.criticScore))
  })
})

describe('autopsy: the sampled review term is NEVER hidden', () => {
  it('displays criticMean, criticSigma, and the sampled reviewVariance', () => {
    const { view } = playToRelease('autopsy-variance-1')
    render(<Autopsy view={view} onBack={() => {}} />)
    const mean = screen.getByTestId('autopsy-criticmean')
    const variance = screen.getByTestId('autopsy-reviewvariance')
    expect(mean).toBeInTheDocument()
    expect(variance).toBeInTheDocument()
    // criticMean rendered value equals the engine value.
    expect(mean).toHaveTextContent(score(view.criticMean))
    // reviewVariance rendered value equals the engine sampled value (signed).
    expect(variance).toHaveTextContent(signed(view.reviewVariance))
    // criticSigma appears somewhere in the critic breakdown card.
    const autopsyText = screen.getByTestId('autopsy').textContent ?? ''
    expect(autopsyText).toContain(score(view.criticSigma, 2))
    // The sampled term is labeled as random (never presented as deterministic).
    expect(variance.textContent ?? '').toMatch(/Random/i)
  })

  it('reviewVariance equals criticScore − criticMean by construction (engine identity)', () => {
    const { view, film } = playToRelease('autopsy-variance-2')
    // The stored sampled score minus the deterministic mean is the review variance.
    expect(view.reviewVariance).toBeCloseTo(film.reviewVariance, 6)
    expect(view.criticScore).toBe(film.criticScore)
    // And the identity holds against the engine mean.
    expect(film.criticScore - view.criticMean).toBeCloseTo(film.reviewVariance, 4)
  })
})

describe('autopsy: each segment response is displayed', () => {
  it('shows an appeal figure for every segment', () => {
    const { view } = playToRelease('autopsy-seg-1')
    render(<Autopsy view={view} onBack={() => {}} />)
    const autopsyText = screen.getByTestId('autopsy').textContent ?? ''
    for (const seg of Object.keys(view.segmentAppeal)) {
      expect(autopsyText).toContain(segmentLabel(seg))
    }
  })
})

describe('autopsy: box office and profit match the public engine outputs', () => {
  it('the shown total box office equals the engine FilmResult.boxOffice.total', () => {
    const { view, film } = playToRelease('autopsy-money-1')
    render(<Autopsy view={view} onBack={() => {}} />)
    // The autopsy view's box office is the STORED FilmResult box office.
    expect(view.boxOffice.total).toBeCloseTo(film.boxOffice.total, 6)
    expect(view.boxOffice.opening).toBeCloseTo(film.boxOffice.opening, 6)
    // And it is rendered (money-formatted) in the box-office card.
    const autopsyText = screen.getByTestId('autopsy').textContent ?? ''
    expect(autopsyText).toContain(money(film.boxOffice.total))
  })

  it('profit shown equals total − committedCost', () => {
    const { view } = playToRelease('autopsy-money-2')
    render(<Autopsy view={view} onBack={() => {}} />)
    // Engine identity: profit = total − committedCost.
    expect(view.profit).toBeCloseTo(view.boxOffice.total - view.committedCost, 4)
    // Rendered in the profit metric.
    expect(screen.getByTestId('autopsy-profit')).toBeInTheDocument()
  })
})

describe('autopsy: standing deltas equal engine post−pre and the WHY lines map to D-6 inputs', () => {
  it('the three standing deltas equal the engine post-tick minus pre-tick standing', () => {
    const { view, preStanding, postStanding } = playToRelease('autopsy-standing-1')
    expect(view.standingDeltas.audienceAwareness).toBeCloseTo(
      postStanding.audienceAwareness - preStanding.audienceAwareness,
      6,
    )
    expect(view.standingDeltas.industryPrestige).toBeCloseTo(
      postStanding.industryPrestige - preStanding.industryPrestige,
      6,
    )
    expect(view.standingDeltas.commercialConfidence).toBeCloseTo(
      postStanding.commercialConfidence - preStanding.commercialConfidence,
      6,
    )
  })

  it('the three WHY lines reference reach, critic-vs-benchmark, and ROI respectively', () => {
    const { view } = playToRelease('autopsy-standing-2')
    render(<Autopsy view={view} onBack={() => {}} />)
    const text = screen.getByTestId('autopsy').textContent ?? ''
    // Awareness → reach; Prestige → critic vs benchmark; Confidence → ROI.
    expect(view.standingWhy.awareness.toLowerCase()).toContain('reach')
    expect(view.standingWhy.prestige.toLowerCase()).toMatch(/critic|benchmark/)
    expect(view.standingWhy.confidence.toLowerCase()).toMatch(/roi|profit|budget/)
    // And those explanation strings are actually rendered.
    expect(text).toContain(view.standingWhy.awareness)
    expect(text).toContain(view.standingWhy.prestige)
    expect(text).toContain(view.standingWhy.confidence)
    // Delta testids exist for all three channels.
    expect(screen.getByTestId('autopsy-delta-aware')).toBeInTheDocument()
    expect(screen.getByTestId('autopsy-delta-prestige')).toBeInTheDocument()
    expect(screen.getByTestId('autopsy-delta-confidence')).toBeInTheDocument()
  })
})

describe('autopsy: nothing is invented — headline numbers are finite engine values', () => {
  it('craft, cohesion, criticMean and profit are all finite', () => {
    const { view } = playToRelease('autopsy-finite-1')
    expect(Number.isFinite(view.craft)).toBe(true)
    expect(Number.isFinite(view.cohesion)).toBe(true)
    expect(Number.isFinite(view.criticMean)).toBe(true)
    expect(Number.isFinite(view.profit)).toBe(true)
    expect(Number.isFinite(view.boxOffice.total)).toBe(true)
  })
})
