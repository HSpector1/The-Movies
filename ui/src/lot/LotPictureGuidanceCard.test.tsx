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
    beat: 'no-picture',
    pictureTitle: null,
    ordinal: 1,
    headline: 'No screenplay',
    whatHappened: 'No screenplay is currently in development.',
    whyItMatters: 'Every picture begins with a screenplay.',
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
  it('is a labelled, persistent journey for Picture 1', () => {
    renderCard(journey())
    expect(screen.getByRole('region', { name: 'Picture guidance' })).toBeInTheDocument()
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toHaveTextContent('PICTURE JOURNEY')
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toHaveTextContent('PICTURE 1')
    expect(screen.getByTestId('lot-picture-guidance-title')).toHaveTextContent('No picture yet')
  })

  it('keeps the next picture numbered without changing the card grammar', () => {
    renderCard(journey({ ordinal: 2, pictureTitle: 'The Second Feature', stage: 'drafting' }))
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toHaveTextContent('PICTURE JOURNEY')
    expect(screen.getByTestId('lot-picture-guidance-eyebrow')).toHaveTextContent('PICTURE 2')
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
        waiting: { untilWeek: 1, reason: 'The draft is due Week 1 — advance the week.' },
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
        waiting: {
          untilWeek: 2,
          reason: 'The camera tests finish in Week 2 — advance the week.',
        },
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
        // …and it owns exactly ONE line about the wait. The card used to print the
        // engine's reason and a second "Waiting — advance the week" status line beneath
        // it, which said the same thing twice and the week three times.
        expect(screen.getByTestId('lot-picture-guidance-waiting')).toHaveTextContent(
          stage.view.waiting!.reason,
        )
        expect(screen.queryByTestId('lot-picture-guidance-status')).not.toBeInTheDocument()
      } else {
        const button = screen.getByTestId('lot-picture-guidance-next')
        expect(button.tagName).toBe('BUTTON')
        // The projection's imperative label IS the accessible name.
        expect(screen.getByRole('button', { name: stage.button })).toBe(button)
      }
    })
  }

  it('prints the ENGINE stage id, even where the headline is finer than the stage', () => {
    // A rewrite reads "Screenplay — rewriting" over `data-guidance-stage="drafting"`, and
    // that is the contract rather than a mismatch: `drafting` is the engine's one stage for
    // "the screenplay is being written", refined by the headline. A distinct `rewriting`
    // attribute value would be this card inventing a word the frozen projection does not
    // have. Pinned so the attribute can never quietly become a UI-derived value.
    renderCard(
      journey({
        stage: 'drafting',
        pictureTitle: 'A Season of Archipelago',
        headline: 'Screenplay — rewriting',
        detail: 'Writer: Lauren Ravel · Due Week 3',
        next: { kind: 'advance-week', label: 'Wait for the rewrite', site: null },
      }),
    )
    expect(screen.getByTestId('lot-picture-guidance-headline')).toHaveTextContent(
      'Screenplay — rewriting',
    )
    expect(screen.getByTestId('lot-picture-guidance')).toHaveAttribute(
      'data-guidance-stage',
      'drafting',
    )
  })

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

  it('speaks the engine waiting line verbatim, and composes no second one around it', () => {
    const { unmount } = renderCard(
      journey({
        next: { kind: 'advance-week', label: 'Wait for the draft', site: null },
        waiting: { untilWeek: 3, reason: 'The draft is due Week 3 — advance the week.' },
      }),
    )
    const waiting = screen.getByTestId('lot-picture-guidance-waiting')
    // Verbatim: no "Waiting until Week 3 — " prefix of this card's own invention, which
    // named the same week a second time inside a sentence that already carried it.
    expect(waiting.textContent).toBe('The draft is due Week 3 — advance the week.')
    expect(screen.queryByTestId('lot-picture-guidance-status')).not.toBeInTheDocument()
    unmount()

    renderCard(
      journey({
        next: { kind: 'advance-week', label: 'Wait for the writer', site: null },
        waiting: {
          untilWeek: null,
          reason: 'The writer is on another picture — advance the week.',
        },
      }),
    )
    expect(screen.getByTestId('lot-picture-guidance-waiting').textContent).toBe(
      'The writer is on another picture — advance the week.',
    )
  })

  it('still states the wait when a step names no wait at all', () => {
    // The engine always pairs an advance-week step with a `waiting`; a projection that
    // did not would otherwise leave the card silent about why nothing can be pressed.
    renderCard(
      journey({
        next: { kind: 'advance-week', label: 'Wait', site: null },
        waiting: null,
      }),
    )
    expect(screen.queryByTestId('lot-picture-guidance-waiting')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-picture-guidance-status')).toHaveTextContent(
      'Waiting — advance the week',
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
    expect(screen.getByTestId('lot-picture-guidance-status')).toHaveTextContent(
      'No action required.',
    )
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

describe('LotPictureGuidanceCard — persistent P0 guidance', () => {
  it('ignores the former collapse preference and keeps the answer visible', () => {
    localStorage.setItem(PICTURE_GUIDANCE_COLLAPSED_STORAGE_KEY, '1')
    renderCard(journey())
    expect(screen.queryByTestId('lot-picture-guidance-toggle')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-picture-guidance-headline')).toBeVisible()
    expect(screen.getByTestId('lot-picture-guidance-what')).toBeVisible()
    expect(screen.getByTestId('lot-picture-guidance-why')).toBeVisible()
    expect(screen.getByTestId('lot-picture-guidance-next')).toBeVisible()
  })

  it('follows live Package choices through cast, budget, and greenlight', () => {
    const view = journey({
      stage: 'ready-to-package',
      beat: 'auditions-reviewed',
      pictureTitle: 'A Season of Archipelago',
      headline: 'AUDITIONS REVIEWED',
    })
    const { rerender } = render(
      <LotPictureGuidanceCard
        state={{ kind: 'view', view }}
        packageProgress={{
          projectId: 'script-0000',
          pictureTitle: 'A Season of Archipelago',
          step: 'casting',
          selectedRoleCount: 2,
          requiredRoleCount: 5,
          missingRoles: ['Lead', 'Antagonist', 'Support'],
          castComplete: false,
          chosenSummary: 'Director: Ida Vale · Crew: Carlo Reed',
        }}
        onNextStep={() => {}}
      />,
    )
    expect(screen.getByTestId('lot-picture-guidance-headline')).toHaveTextContent('CAST YOUR PICTURE')
    expect(screen.getByTestId('lot-picture-guidance-detail')).toHaveTextContent(
      'Still required: Lead, Antagonist, Support.',
    )
    expect(screen.getByTestId('lot-picture-guidance-status')).toHaveTextContent(
      'Choose the missing roles',
    )

    rerender(
      <LotPictureGuidanceCard
        state={{ kind: 'view', view }}
        packageProgress={{
          projectId: 'script-0000',
          pictureTitle: 'A Season of Archipelago',
          step: 'budget',
          selectedRoleCount: 5,
          requiredRoleCount: 5,
          missingRoles: [],
          castComplete: true,
          chosenSummary: 'Director: Ida Vale · Lead: Marta Vane',
        }}
        onNextStep={() => {}}
      />,
    )
    expect(screen.getByTestId('lot-picture-guidance-headline')).toHaveTextContent('CAST LOCKED')
    expect(screen.getByTestId('lot-picture-guidance-status')).toHaveTextContent(
      'Set the production and marketing budget',
    )

    rerender(
      <LotPictureGuidanceCard
        state={{ kind: 'view', view }}
        packageProgress={{
          projectId: 'script-0000',
          pictureTitle: 'A Season of Archipelago',
          step: 'greenlight',
          selectedRoleCount: 5,
          requiredRoleCount: 5,
          missingRoles: [],
          castComplete: true,
          chosenSummary: 'Director: Ida Vale · Lead: Marta Vane',
        }}
        onNextStep={() => {}}
      />,
    )
    expect(screen.getByTestId('lot-picture-guidance-headline')).toHaveTextContent('READY FOR GREENLIGHT')
    expect(screen.getByTestId('lot-picture-guidance-status')).toHaveTextContent(
      'Greenlight this picture to begin production.',
    )
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
