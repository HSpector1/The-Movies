// ── Picture guidance card — every stage of the frozen projection ──────────────
//
// The card renders ENGINE copy verbatim, so these tests drive it with mocked
// `FirstFilmJourneyView` values (the contract the core projection implements) and assert
// what the player is told and what the one control does. Nothing here derives journey
// state; if a test had to compute a headline, the card would be doing the engine's job.

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  LotPictureGuidanceCard,
  PICTURE_GUIDANCE_COLLAPSED_STORAGE_KEY,
} from './LotPictureGuidanceCard.tsx'
import type { FirstFilmJourneyView } from './snapshot/firstFilmJourney.ts'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function journey(overrides: Partial<FirstFilmJourneyView> = {}): FirstFilmJourneyView {
  return {
    stage: 'no-picture',
    pictureTitle: null,
    ordinal: 1,
    headline: 'No screenplay',
    detail: null,
    next: { kind: 'commission', label: 'Commission a screenplay at Development', site: 'development' },
    waiting: null,
    blocked: null,
    ...overrides,
  }
}

function renderCard(
  view: FirstFilmJourneyView,
  onNextStep: (next: FirstFilmJourneyView['next']) => void = () => {},
) {
  return render(
    <LotPictureGuidanceCard
      state={{ kind: 'view', view }}
      onNextStep={(next) => onNextStep(next)}
    />,
  )
}

describe('LotPictureGuidanceCard — the picture is followable from before it exists', () => {
  it('is a labelled region whose eyebrow names the studio\'s FIRST picture', () => {
    renderCard(journey())
    expect(screen.getByRole('region', { name: 'Picture guidance' })).toBeInTheDocument()
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toHaveTextContent('YOUR FIRST PICTURE')
    expect(screen.getByTestId('lot-picture-guidance-title')).toHaveTextContent('No picture yet')
  })

  it('switches the eyebrow to the NEXT picture once one has been made', () => {
    renderCard(journey({ ordinal: 2, pictureTitle: 'The Second Feature', stage: 'drafting' }))
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toHaveTextContent('YOUR NEXT PICTURE')
    expect(screen.getByTestId('lot-picture-guidance-title')).toHaveTextContent('The Second Feature')
  })

  // Every stage of the frozen projection, with the copy a player would actually read.
  const stages: Array<{
    name: string
    view: FirstFilmJourneyView
    title: string
    headline: string
    button: string | null
  }> = [
    {
      name: 'no-picture',
      view: journey(),
      title: 'No picture yet',
      headline: 'No screenplay',
      button: 'Commission a screenplay at Development',
    },
    {
      name: 'drafting',
      view: journey({
        stage: 'drafting',
        pictureTitle: 'A Season of Archipelago',
        headline: 'Screenplay — drafting',
        detail: 'Writer: Lauren Ravel · Due Week 1',
        next: { kind: 'advance-week', label: 'Wait for the draft', site: null },
        waiting: { untilWeek: 1, reason: 'the draft is due' },
      }),
      title: 'A Season of Archipelago',
      headline: 'Screenplay — drafting',
      button: null,
    },
    {
      name: 'script-review',
      view: journey({
        stage: 'script-review',
        pictureTitle: 'A Season of Archipelago',
        headline: 'Script review ready',
        next: { kind: 'script-review', label: 'Review the screenplay at Development', site: 'development' },
      }),
      title: 'A Season of Archipelago',
      headline: 'Script review ready',
      button: 'Review the screenplay at Development',
    },
    {
      name: 'ready-to-package',
      view: journey({
        stage: 'ready-to-package',
        pictureTitle: 'A Season of Archipelago',
        headline: 'Screenplay accepted',
        next: { kind: 'plan-auditions', label: 'Plan auditions at Casting', site: 'casting' },
      }),
      title: 'A Season of Archipelago',
      headline: 'Screenplay accepted',
      button: 'Plan auditions at Casting',
    },
    {
      name: 'auditioning',
      view: journey({
        stage: 'auditioning',
        pictureTitle: 'A Season of Archipelago',
        headline: 'Auditions running',
        next: { kind: 'advance-week', label: 'Wait for the audition results', site: null },
        waiting: { untilWeek: 2, reason: 'auditions finish' },
      }),
      title: 'A Season of Archipelago',
      headline: 'Auditions running',
      button: null,
    },
    {
      name: 'audition-review',
      view: journey({
        stage: 'audition-review',
        pictureTitle: 'A Season of Archipelago',
        headline: 'Audition results ready',
        next: { kind: 'audition-review', label: 'Review auditions at Casting', site: 'casting' },
      }),
      title: 'A Season of Archipelago',
      headline: 'Audition results ready',
      button: 'Review auditions at Casting',
    },
    {
      name: 'in-production',
      view: journey({
        stage: 'in-production',
        pictureTitle: 'A Season of Archipelago',
        headline: 'Shooting',
        next: { kind: 'resolve-production', label: 'Go to Soundstage 7', site: 'stage' },
      }),
      title: 'A Season of Archipelago',
      headline: 'Shooting',
      button: 'Go to Soundstage 7',
    },
    {
      name: 'released',
      view: journey({
        stage: 'released',
        pictureTitle: 'A Season of Archipelago',
        headline: 'In theaters',
        next: { kind: 'commission', label: 'Commission your next screenplay at Development', site: 'development' },
      }),
      title: 'A Season of Archipelago',
      headline: 'In theaters',
      button: 'Commission your next screenplay at Development',
    },
  ]

  for (const stage of stages) {
    it(`states the picture and the one next step at stage "${stage.name}"`, () => {
      renderCard(stage.view)
      expect(screen.getByTestId('lot-picture-guidance')).toHaveAttribute(
        'data-guidance-stage',
        stage.name,
      )
      expect(screen.getByTestId('lot-picture-guidance-title')).toHaveTextContent(stage.title)
      expect(screen.getByTestId('lot-picture-guidance-headline')).toHaveTextContent(stage.headline)
      if (stage.button === null) {
        // A waiting stage owns no verb: the week already has exactly one advance control.
        expect(screen.queryByTestId('lot-picture-guidance-next')).not.toBeInTheDocument()
        expect(screen.getByTestId('lot-picture-guidance-status')).toHaveTextContent(
          'Waiting — advance the week',
        )
      } else {
        const button = screen.getByTestId('lot-picture-guidance-next')
        expect(button.tagName).toBe('BUTTON')
        // The projection's imperative label IS the accessible name.
        expect(screen.getByRole('button', { name: stage.button })).toBe(button)
      }
    })
  }

  it('renders the engine detail line verbatim', () => {
    renderCard(
      journey({
        stage: 'drafting',
        pictureTitle: 'A Season of Archipelago',
        headline: 'Screenplay — drafting',
        detail: 'Writer: Lauren Ravel · Due Week 1',
        next: { kind: 'advance-week', label: 'Wait for the draft', site: null },
      }),
    )
    expect(screen.getByTestId('lot-picture-guidance-detail')).toHaveTextContent(
      'Writer: Lauren Ravel · Due Week 1',
    )
  })

  it('names the week a wait ends, and states an open wait without inventing one', () => {
    const { unmount } = renderCard(
      journey({ waiting: { untilWeek: 3, reason: 'the draft is due' } }),
    )
    expect(screen.getByTestId('lot-picture-guidance-waiting')).toHaveTextContent(
      'Waiting until Week 3 — the draft is due',
    )
    unmount()
    renderCard(journey({ waiting: { untilWeek: null, reason: 'the writer is on another picture' } }))
    expect(screen.getByTestId('lot-picture-guidance-waiting')).toHaveTextContent(
      'Waiting — the writer is on another picture',
    )
  })

  it('names the blocking dependency when the journey is blocked', () => {
    renderCard(journey({ blocked: { reason: 'No writer is under contract.' } }))
    expect(screen.getByTestId('lot-picture-guidance-blocked')).toHaveTextContent(
      'No writer is under contract.',
    )
  })

  it('hands the exact projected step back to the host', () => {
    const onNextStep = vi.fn()
    const view = journey()
    renderCard(view, onNextStep)
    fireEvent.click(screen.getByTestId('lot-picture-guidance-next'))
    expect(onNextStep).toHaveBeenCalledTimes(1)
    expect(onNextStep).toHaveBeenCalledWith(view.next)
  })

  it('does not offer a step the projection did not offer', () => {
    renderCard(journey({ next: null }))
    expect(screen.queryByTestId('lot-picture-guidance-next')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-picture-guidance-status')).not.toBeInTheDocument()
  })

  it('claims nothing about the picture when the projection cannot be trusted', () => {
    render(<LotPictureGuidanceCard state={{ kind: 'unavailable' }} onNextStep={() => {}} />)
    expect(screen.getByTestId('lot-picture-guidance')).toHaveAttribute(
      'data-guidance-stage',
      'unavailable',
    )
    expect(screen.getByTestId('lot-picture-guidance-headline')).toHaveTextContent(
      'Picture guidance is unavailable this week.',
    )
    expect(screen.queryByTestId('lot-picture-guidance-next')).not.toBeInTheDocument()
    // The lie this card exists to kill must never come back through the degraded path.
    expect(screen.getByTestId('lot-picture-guidance')).not.toHaveTextContent('studio lot is idle')
  })

  it('is natively inert while the host suspends world input', () => {
    render(
      <LotPictureGuidanceCard
        state={{ kind: 'view', view: journey() }}
        onNextStep={() => {}}
        disabled
      />,
    )
    expect(screen.getByTestId('lot-picture-guidance-next')).toBeDisabled()
  })
})

describe('LotPictureGuidanceCard — collapsing is a UI preference, never save data', () => {
  it('collapses to a header, and the chevron carries its expanded state', () => {
    renderCard(journey())
    const toggle = screen.getByRole('button', { name: 'Picture guidance details' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('lot-picture-guidance-headline')).toBeVisible()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    // Header only: identity survives, the body and its step fold away.
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toBeVisible()
    expect(screen.getByTestId('lot-picture-guidance-title')).toBeVisible()
    expect(screen.getByTestId('lot-picture-guidance-headline')).not.toBeVisible()
    expect(screen.getByTestId('lot-picture-guidance-next')).not.toBeVisible()
  })

  it('persists the preference in localStorage and restores it on the next mount', () => {
    const first = renderCard(journey())
    fireEvent.click(screen.getByTestId('lot-picture-guidance-toggle'))
    expect(localStorage.getItem(PICTURE_GUIDANCE_COLLAPSED_STORAGE_KEY)).toBe('1')
    first.unmount()

    renderCard(journey())
    expect(screen.getByTestId('lot-picture-guidance-toggle')).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    fireEvent.click(screen.getByTestId('lot-picture-guidance-toggle'))
    // Expanded is the default, so the preference is removed rather than stored as '0'.
    expect(localStorage.getItem(PICTURE_GUIDANCE_COLLAPSED_STORAGE_KEY)).toBeNull()
  })

  it('marks reduced motion so the fold is never animated', () => {
    render(
      <LotPictureGuidanceCard
        state={{ kind: 'view', view: journey() }}
        onNextStep={() => {}}
        reducedMotion
      />,
    )
    expect(screen.getByTestId('lot-picture-guidance').className).toContain('is-reduced-motion')
  })
})
