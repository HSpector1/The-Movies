// Restricted-mode component capability: ConceptCard + ForecastDisplay must each
// accept mode='normal'|'restricted' and, in restricted mode, hide precise values
// and show qualitative/wider-band info instead.

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ConceptCard } from './ConceptCard.tsx'
import { ForecastDisplay } from './ForecastDisplay.tsx'
import { newGame, previewForecast, requiredNegative, talentByRole } from '../engine/adapter.ts'
import type { DraftPackage, GameState } from '../engine/adapter.ts'

function firstConcept(state: GameState) {
  return state.concepts[0]!
}

function legalPackage(state: GameState): DraftPackage {
  const concept = firstConcept(state)
  const writer = talentByRole(state, 'writer')[0]!
  const director = talentByRole(state, 'director')[0]!
  const actors = talentByRole(state, 'actor')
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

describe('ConceptCard restricted mode', () => {
  it('normal mode shows the exact base cost; restricted shows a qualitative band', () => {
    const state = newGame('restr-1')
    const concept = firstConcept(state)

    const { unmount } = render(<ConceptCard concept={concept} mode="normal" />)
    expect(screen.getByTestId('concept-cost-exact')).toBeInTheDocument()
    expect(screen.queryByTestId('concept-cost-band')).toBeNull()
    unmount()

    render(<ConceptCard concept={concept} mode="restricted" />)
    expect(screen.getByTestId('concept-cost-band')).toBeInTheDocument()
    expect(screen.queryByTestId('concept-cost-exact')).toBeNull()
  })
})

describe('ForecastDisplay restricted mode', () => {
  it('normal shows exact numbers; restricted hides them and widens the band', () => {
    const state = newGame('restr-2')
    const forecast = previewForecast(state, legalPackage(state))

    const { unmount } = render(<ForecastDisplay forecast={forecast} mode="normal" />)
    const normalOpening = screen.getByTestId('fc-opening').textContent ?? ''
    // Normal opening is a money figure ($...).
    expect(normalOpening).toMatch(/\$/)
    // Per-segment estimate column (a numeric estimate cell) present in normal mode.
    const firstSeg = screen.getByTestId('fc-seg-youngAdult')
    expect(within(firstSeg).getAllByRole('cell').length).toBe(4) // Segment, Band, Estimate, Range
    unmount()

    render(<ForecastDisplay forecast={forecast} mode="restricted" />)
    const restrictedOpening = screen.getByTestId('fc-opening').textContent ?? ''
    // Restricted opening is a qualitative bucket, NOT a dollar figure.
    expect(restrictedOpening).not.toMatch(/\$/)
    expect(['Small', 'Moderate', 'Large']).toContain(restrictedOpening.trim())
    // Restricted mode drops the precise per-segment estimate column (3 cells, not 4).
    const seg = screen.getByTestId('fc-seg-youngAdult')
    expect(within(seg).getAllByRole('cell').length).toBe(3)
  })

  it('always labels the forecast as an estimate (never a result)', () => {
    const state = newGame('restr-3')
    const forecast = previewForecast(state, legalPackage(state))
    render(<ForecastDisplay forecast={forecast} mode="normal" />)
    const display = screen.getByTestId('forecast-display')
    expect(display.querySelector('.tag.estimate')).not.toBeNull()
  })
})
