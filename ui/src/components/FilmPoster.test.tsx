import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import type { FilmChronicleView, FilmParticipant, Genre } from '../engine/adapter.ts'
import { FilmPoster } from './FilmPoster.tsx'

afterEach(cleanup)

function participant(
  talentId: string,
  name: string,
  role: FilmParticipant['role'],
  fit: number,
): FilmParticipant {
  return {
    talentId,
    name,
    role,
    discipline: role === 'writer' ? 'writing' : role === 'director' ? 'directing' : role === 'craft' ? 'craft' : 'acting',
    greenlightOVR: 64,
    greenlightFit: fit,
    greenlightEP: { low: 50, high: 72, expected: 61 },
    freelancer: false,
  }
}

const writer = participant('talent-writer', 'June Mercer', 'writer', 74)
const director = participant('talent-director', 'Leona Vale', 'director', 81)
const lead = participant('talent-lead', 'Mara Flint', 'lead', 68)
const antagonist = participant('talent-antagonist', 'Iris Thorne', 'antagonist', 42)
const support = participant('talent-support', 'Ned Bell', 'support', 65)
const craft = participant('talent-craft', 'Otis Rowe', 'craft', 72)

function chronicle(genre: Genre = 'crime'): FilmChronicleView {
  return {
    productionId: 'prod-0042',
    title: 'The Long Goodbye to Harvest',
    genre,
    reception: {
      critic: { stars: 3.5, score: 71.4 },
      audience: { tier: 'liked', label: 'Audiences liked it', score: 68.2 },
    },
    creativeRecord: {
      available: true,
      shape: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
      promise: {
        genre,
        intendedSegments: ['adult', 'prestige'],
        ranges: {
          intimacy: [-0.4, 0.4],
          tonalWeight: [0.2, 0.8],
          kineticEnergy: [-0.8, -0.2],
        },
      },
      commissionedWeek: 7,
      rewriteCount: 1,
    },
    credits: {
      available: true,
      participants: {
        writer,
        director,
        cast: { lead, antagonist, support },
        craft: [craft],
      },
    },
    productionRecord: {
      available: true,
      commissionedWeek: 7,
      rewriteCount: 1,
      greenlightWeek: 12,
      releaseWeek: 23,
      elapsedWeeks: 11,
    },
    packageRecord: {
      available: true,
      strongest: { participant: director, label: 'Standout fit', fit: 81 },
      weakest: { participant: antagonist, label: 'Stretch fit', fit: 42 },
    },
  }
}

describe('FilmPoster', () => {
  it('renders the exact frozen creative, people, chronology, package, and reception facts as text', () => {
    const view = chronicle()
    const { container } = render(<FilmPoster view={view} />)

    const poster = screen.getByRole('figure', { name: view.title })
    expect(poster).toHaveClass('film-poster--crime', 'film-poster--opening-mysteryHook')
    expect(screen.getByTestId('film-poster-genre')).toHaveTextContent('Crime')
    expect(screen.getByTestId('film-poster-shape-line')).toHaveTextContent(
      'Mystery Hook opening. Reversal midpoint. Bittersweet final reel.',
    )
    expect(screen.getByTestId('film-poster-audience')).toHaveTextContent('Adult · Prestige')
    expect(screen.getByTestId('film-poster-promise')).toHaveTextContent('Intimacy: -0.40 to 0.40')

    const credits = screen.getByTestId('film-poster-credits')
    for (const person of [writer, director, lead, antagonist, support, craft]) {
      expect(credits).toHaveTextContent(person.name)
    }

    expect(screen.getByTestId('film-poster-production-record')).toHaveTextContent(
      'Commissioned Week 7 · One final rewrite · Greenlit Week 12 · Released Week 23 · 11 weeks elapsed',
    )
    expect(screen.getByTestId('film-poster-package-record')).toHaveTextContent(
      'Standout fit: Leona Vale (81) · Stretch fit: Iris Thorne (42)',
    )
    expect(screen.getByTestId('film-poster-reception')).toHaveTextContent('Critics 71/100')
    expect(screen.getByTestId('film-poster-reception')).toHaveTextContent('Audiences liked it · 68/100')

    expect(container.querySelector('img, picture, svg, canvas')).toBeNull()
    for (const motif of container.querySelectorAll('.film-poster__motif')) {
      expect(motif).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('names unavailable history plainly and does not render inferred creative or credit facts', () => {
    const unavailable: FilmChronicleView = {
      ...chronicle(),
      genre: null,
      creativeRecord: { available: false, message: 'Creative brief not recorded for this older film' },
      credits: { available: false, message: 'Frozen film credits unavailable' },
      productionRecord: { available: false, message: 'Detailed production chronology unavailable' },
      packageRecord: { available: false, message: 'Frozen package fit record unavailable' },
    }
    render(<FilmPoster view={unavailable} />)

    const poster = screen.getByTestId('film-poster')
    expect(poster).toHaveClass('film-poster--unrecorded')
    expect(screen.getByTestId('film-poster-genre')).toHaveTextContent('Genre unavailable')
    expect(screen.getByTestId('film-poster-creative-unavailable')).toHaveTextContent(
      'Creative brief not recorded for this older film',
    )
    expect(screen.getByTestId('film-poster-credits-unavailable')).toHaveTextContent(
      'Frozen film credits unavailable',
    )
    expect(screen.getByTestId('film-poster-production-unavailable')).toHaveTextContent(
      'Detailed production chronology unavailable',
    )
    expect(screen.getByTestId('film-poster-package-unavailable')).toHaveTextContent(
      'Frozen package fit record unavailable',
    )
    expect(screen.queryByTestId('film-poster-beats')).not.toBeInTheDocument()
    expect(screen.queryByTestId('film-poster-promise')).not.toBeInTheDocument()
    expect(screen.queryByTestId('film-poster-billing')).not.toBeInTheDocument()
    expect(within(poster).queryByText('Leona Vale')).not.toBeInTheDocument()
  })

  it('does not round a persisted Fit across the visible 45 / 70 label boundaries', () => {
    const view = chronicle()
    const people = view.credits.available ? view.credits.participants : null
    if (!people) throw new Error('fixture requires credits')
    view.packageRecord = {
      available: true,
      strongest: {
        participant: people.director,
        label: 'Strongest fit',
        fit: 69.6,
      },
      weakest: {
        participant: people.cast.antagonist,
        label: 'Stretch fit',
        fit: 44.6,
      },
    }
    render(<FilmPoster view={view} />)
    expect(screen.getByTestId('film-poster-package-record')).toHaveTextContent(
      'Strongest fit: Leona Vale (69.6) · Stretch fit: Iris Thorne (44.6)',
    )
  })

  it.each<Genre>(['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure'])(
    'selects the frozen %s palette without changing the facts',
    (genre) => {
      render(<FilmPoster view={chronicle(genre)} />)
      expect(screen.getByTestId('film-poster')).toHaveClass(`film-poster--${genre}`)
      expect(screen.getByTestId('film-poster-title')).toHaveTextContent('The Long Goodbye to Harvest')
    },
  )
})
