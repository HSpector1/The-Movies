// ── Film Chronicle V1 UI integration proof ────────────────────────────────────────────────
// Focused presentation/routing coverage. These fixtures contain only frozen view
// data: the components must render it without consulting or mutating live state.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type {
  FilmChronicleView,
  FilmParticipant,
  FilmParticipants,
  FilmRecordView,
  NewspaperView,
} from '../engine/adapter.ts'
import { FilmRecord } from './FilmRecord.tsx'
import { NewspaperReveal } from './NewspaperReveal.tsx'

afterEach(cleanup)

function participant(
  prefix: string,
  role: FilmParticipant['role'],
  name: string,
  fit: number,
): FilmParticipant {
  const discipline: FilmParticipant['discipline'] =
    role === 'writer'
      ? 'writing'
      : role === 'director'
        ? 'directing'
        : role === 'craft'
          ? 'craft'
          : 'acting'
  return {
    talentId: `${prefix}-${role}`,
    name,
    role,
    discipline,
    greenlightOVR: 72,
    greenlightFit: fit,
    greenlightEP: { low: 61, high: 79, expected: 70 },
    freelancer: role === 'support',
  }
}

function credits(prefix: string): FilmParticipants {
  return {
    writer: participant(prefix, 'writer', `${prefix} Writer`, 68),
    director: participant(prefix, 'director', `${prefix} Director`, 76),
    cast: {
      lead: participant(prefix, 'lead', `${prefix} Lead`, 82),
      antagonist: participant(prefix, 'antagonist', `${prefix} Antagonist`, 63),
      support: participant(prefix, 'support', `${prefix} Support`, 43),
    },
    craft: [participant(prefix, 'craft', `${prefix} Craft`, 71)],
  }
}

function chronicle(prefix: string, title = `${prefix} Picture`): FilmChronicleView {
  const participants = credits(prefix)
  return {
    productionId: `production-${prefix}`,
    title,
    genre: 'crime',
    reception: {
      critic: { stars: 4, score: 82 },
      audience: { tier: 'loved', label: 'Audiences loved it', score: 79 },
    },
    creativeRecord: {
      available: true,
      shape: { opening: 'mysteryHook', midpoint: 'revelation', ending: 'ambiguous' },
      promise: {
        genre: 'crime',
        intendedSegments: ['adult', 'prestige'],
        ranges: {
          intimacy: [-0.4, 0.5],
          tonalWeight: [0.2, 0.9],
          kineticEnergy: [-0.2, 0.6],
        },
      },
      commissionedWeek: 10,
      rewriteCount: 1,
    },
    credits: { available: true, participants },
    productionRecord: {
      available: true,
      commissionedWeek: 10,
      rewriteCount: 1,
      greenlightWeek: 13,
      releaseWeek: 19,
      elapsedWeeks: 6,
    },
    packageRecord: {
      available: true,
      strongest: {
        participant: participants.cast.lead,
        label: 'Standout fit',
        fit: participants.cast.lead.greenlightFit,
      },
      weakest: {
        participant: participants.cast.support,
        label: 'Stretch fit',
        fit: participants.cast.support.greenlightFit,
      },
    },
  }
}

function newspaper(prefix: string, title = `${prefix} Picture`): NewspaperView {
  const history = chronicle(prefix, title)
  if (!history.credits.available) throw new Error('fixture requires frozen credits')
  return {
    masthead: 'The Silver Screen Gazette',
    week: 19,
    filmTitle: title,
    headline: `${title.toUpperCase()} CAPTURES THE CITY`,
    subheadline: 'A shadowed mystery becomes the season\'s most talked-about premiere.',
    critic: { ...history.reception.critic },
    audience: { ...history.reception.audience },
    financial: {
      openingGross: 8_250_000,
      studioRevenueThisWeek: 4_125_000,
      projectedTotalGross: 21_500_000,
      projectedTotalStudioRevenue: 10_750_000,
      studioRevenueStillToCome: 6_625_000,
      totalCommitment: 7_250_000,
      projectedContribution: 3_500_000,
      projectedContributionLabel: 'Projected profit',
      disclosure: 'Only the opening week is banked so far. Full-run figures are projections.',
    },
    forecast: {
      expectedCritic: 76,
      expectedTotal: 18_000_000,
      criticDelta: 'better',
      boxDelta: 'better',
    },
    callouts: ['The final reel rewards patient audiences.'],
    participants: history.credits.participants,
    chronicle: history,
  }
}

function record(prefix: string, title = `${prefix} Picture`): FilmRecordView {
  const history = chronicle(prefix, title)
  if (!history.credits.available) throw new Error('fixture requires frozen credits')
  return {
    productionId: history.productionId,
    conceptTitle: title,
    chronicle: history,
    participants: history.credits.participants,
    criticScore: history.reception.critic.score,
    boxOffice: { opening: 8_250_000, total: 21_500_000 },
    committedCost: 7_250_000,
    studioRevenue: 10_750_000,
    profit: 3_500_000,
    projected: false,
    // C2a-M3 — the Chronicle now carries WHO WROTE IT. This fixture is a picture
    // the studio bought from the market, which is what every C1 film was.
    screenplay: {
      origin: 'pool',
      label: 'Acquired from the open script market',
      writerId: null,
      writerName: null,
      generatedTitle: null,
      renamedWeek: null,
      renamed: false,
    },
  }
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value
}

describe('Film Chronicle V1 — release reveal', () => {
  it('pairs the deterministic one-sheet with the truthful period newspaper story', () => {
    const view = newspaper('Harbor', 'Harbor Without Stars')
    document.documentElement.scrollTop = 500
    document.body.scrollTop = 500
    render(
      <NewspaperReveal
        views={[view]}
        onOpenAutopsy={vi.fn()}
        onOpenChronicle={vi.fn()}
        onContinue={vi.fn()}
      />,
    )

    const poster = screen.getByTestId('film-poster')
    expect(within(poster).getByTestId('film-poster-title')).toHaveTextContent('Harbor Without Stars')
    expect(within(poster).getByTestId('film-poster-genre')).toHaveTextContent('Crime')
    expect(within(poster).getByTestId('film-poster-shape-line')).toHaveTextContent(/opening/i)
    expect(within(poster).getByTestId('film-poster-billing')).toHaveTextContent('Harbor Director')
    expect(within(poster).getByTestId('film-poster-billing')).toHaveTextContent('Harbor Lead')

    const story = screen.getByTestId('newspaper-reveal')
    expect(within(story).getByTestId('newspaper-masthead')).toHaveTextContent('The Silver Screen Gazette')
    expect(story).toHaveTextContent('Week 19 · Evening Edition')
    expect(within(story).getByTestId('newspaper-headline')).toHaveTextContent(view.headline)
    expect(story).toHaveTextContent(view.subheadline)
    expect(within(story).getByTestId('newspaper-participants')).toHaveTextContent('Written by Harbor Writer')
    expect(within(story).getByTestId('newspaper-financial')).toHaveTextContent('Only the opening week is banked')
    expect(within(story).getByTestId('newspaper-financial')).toHaveTextContent('Projected film contribution')
    expect(screen.getAllByRole('heading')[0]).toBe(screen.getByTestId('film-poster-title'))
    expect(screen.getByTestId('film-poster-title')).toHaveFocus()
    expect(document.documentElement.scrollTop).toBe(0)
    expect(document.body.scrollTop).toBe(0)
  })

  it('routes each same-week film according to whether its session autopsy still exists', () => {
    const first = newspaper('First')
    const second = newspaper('Second')
    const openAutopsy = vi.fn()
    const openChronicle = vi.fn()

    const firstPass = render(
      <NewspaperReveal
        views={[first, second]}
        canOpenAutopsy={(index) => index === 0}
        onOpenAutopsy={openAutopsy}
        onOpenChronicle={openChronicle}
        onContinue={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('newspaper-open-autopsy'))
    fireEvent.click(screen.getByTestId('newspaper-secondary-chronicle-1'))
    expect(openAutopsy).toHaveBeenCalledWith(0)
    expect(openChronicle).toHaveBeenCalledWith(1)
    expect(screen.getByTestId('newspaper-secondary-commitment-1')).toHaveTextContent('$7.25M')
    expect(screen.getByTestId('newspaper-secondary-still-to-come-1')).toHaveTextContent('$6.63M')
    expect(screen.getByTestId('newspaper-secondary-audience-1')).toHaveTextContent('79/100')
    expect(screen.getByTestId('newspaper-secondary-1')).toHaveTextContent(
      'Only the opening week is banked',
    )
    expect(screen.queryByTestId('newspaper-open-chronicle')).not.toBeInTheDocument()
    expect(screen.queryByTestId('newspaper-secondary-autopsy-1')).not.toBeInTheDocument()

    firstPass.unmount()
    openAutopsy.mockClear()
    openChronicle.mockClear()
    render(
      <NewspaperReveal
        views={[first, second]}
        canOpenAutopsy={(index) => index === 1}
        onOpenAutopsy={openAutopsy}
        onOpenChronicle={openChronicle}
        onContinue={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('newspaper-open-chronicle'))
    fireEvent.click(screen.getByTestId('newspaper-secondary-autopsy-1'))
    expect(openChronicle).toHaveBeenCalledWith(0)
    expect(openAutopsy).toHaveBeenCalledWith(1)
    expect(screen.queryByTestId('newspaper-open-autopsy')).not.toBeInTheDocument()
    expect(screen.queryByTestId('newspaper-secondary-chronicle-1')).not.toBeInTheDocument()
  })

  it('never bills raw rejected participants when Chronicle credit correlation failed', () => {
    const view = newspaper('Rejected')
    view.chronicle = {
      ...view.chronicle,
      credits: { available: false, message: 'Frozen film credits unavailable' },
      packageRecord: { available: false, message: 'Frozen package fit record unavailable' },
    }
    render(
      <NewspaperReveal views={[view]} onOpenAutopsy={vi.fn()} onContinue={vi.fn()} />,
    )
    expect(screen.getByTestId('newspaper-participants')).toHaveTextContent(
      'Frozen film credits unavailable',
    )
    expect(screen.queryByText('Rejected Writer')).not.toBeInTheDocument()
    expect(screen.queryByText('Rejected Director')).not.toBeInTheDocument()
    expect(screen.queryByText('Rejected Lead')).not.toBeInTheDocument()
  })
})

describe('Film Chronicle V1 — durable record', () => {
  it('renders frozen credits and the recorded result, restores focus, and does not mutate its view', () => {
    const view = deepFreeze(record('Archive', 'The Last Marquee'))
    const before = structuredClone(view)
    const openProfile = vi.fn()
    const onBack = vi.fn()
    render(<FilmRecord view={view} onOpenProfile={openProfile} onBack={onBack} />)

    const recordScreen = screen.getByTestId('film-record')
    expect(within(recordScreen).getByRole('heading', { name: 'FILM CHRONICLE' })).toHaveFocus()
    expect(within(recordScreen).getByTestId('film-poster-title')).toHaveTextContent('The Last Marquee')
    expect(within(recordScreen).getByTestId('record-participants')).toHaveTextContent('Archive Writer')
    expect(within(recordScreen).getByTestId('record-participants')).toHaveTextContent('Archive Lead')
    expect(within(recordScreen).getByTestId('record-critic')).toHaveTextContent('82')
    expect(within(recordScreen).getByTestId('record-profit')).toHaveTextContent(/Profit/)
    expect(recordScreen).toHaveTextContent('Audiences loved it')
    expect(recordScreen).toHaveTextContent('ARCHIVE · RELEASE WEEK 19')

    fireEvent.click(screen.getByTestId('autopsy-open-profile-Archive-lead'))
    fireEvent.click(screen.getByTestId('film-record-back'))
    expect(openProfile).toHaveBeenCalledWith('Archive-lead')
    expect(onBack).toHaveBeenCalledOnce()
    expect(view).toEqual(before)
  })

  it('fails closed visibly when frozen Chronicle sections are unavailable without hiding the result', () => {
    const view = record('Legacy', 'A Forgotten Negative')
    view.chronicle = {
      ...view.chronicle,
      creativeRecord: { available: false, message: 'Creative brief unavailable' },
      credits: { available: false, message: 'Frozen film credits unavailable' },
      productionRecord: { available: false, message: 'Detailed production chronology unavailable' },
      packageRecord: { available: false, message: 'Frozen package fit record unavailable' },
    }
    render(<FilmRecord view={view} onBack={vi.fn()} />)

    expect(screen.getByTestId('film-poster-creative-unavailable')).toHaveTextContent('Creative brief unavailable')
    expect(screen.getByTestId('film-poster-credits-unavailable')).toHaveTextContent('Frozen film credits unavailable')
    expect(screen.getByTestId('film-poster-production-unavailable')).toHaveTextContent('Detailed production chronology unavailable')
    expect(screen.getByTestId('film-poster-package-unavailable')).toHaveTextContent('Frozen package fit record unavailable')
    expect(screen.getByTestId('record-participants-unavailable')).toHaveTextContent('Frozen film credits unavailable')
    expect(screen.getByTestId('record-critic')).toHaveTextContent('82')
    expect(screen.getByTestId('record-profit')).toHaveTextContent(/Profit/)
    expect(screen.getByTestId('film-record')).toHaveTextContent('ARCHIVE · RELEASE WEEK —')
    expect(screen.queryByText('Legacy Writer')).not.toBeInTheDocument()
  })
})
