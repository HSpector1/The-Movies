// End-to-end UI smoke test: drive the app through the full playable loop
// Start → new game → dashboard → assemble → greenlight → advance to release →
// autopsy, using only rendered controls (data-testids). Confirms the app renders
// and the loop is wired end to end.

import { describe, it, expect } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { App } from './App.tsx'

// D-11.2: a new game now opens the FOUNDING DRAFT — the player hires an initial
// roster before the studio can staff films. Sign the role minimums (D-11.A: 3 actors,
// 1 director, 2 writers, 1 craft), with extra actors so a full cast can be chosen,
// then found the studio to land on the dashboard. Signing draws the recruitment
// fund, not operating cash. We click the first available sign button in each role
// group N times (a signed applicant no longer shows a sign button, so re-querying
// advances to the next applicant).
function foundViaUi() {
  const signInGroup = (role: string, n: number) => {
    for (let i = 0; i < n; i++) {
      const group = screen.getByTestId(`founding-group-${role}`)
      const signBtn = within(group)
        .getAllByRole('button')
        .find((b) => (b.getAttribute('data-testid') ?? '').startsWith('founding-sign-'))!
      fireEvent.click(signBtn)
    }
  }
  signInGroup('actor', 6) // > min 3 (D-11.A); enough distinct actors for a full cast
  signInGroup('director', 2) // > min 1
  signInGroup('writer', 2) // = min 2
  signInGroup('craft', 2) // > min 1; a craft lead is required to cast a film (D-11.13)
  fireEvent.click(screen.getByTestId('found-studio'))
}

function startNewGame(seed = 'e2e-seed') {
  render(<App />)
  const seedInput = screen.getByTestId('seed-input') as HTMLInputElement
  fireEvent.change(seedInput, { target: { value: seed } })
  fireEvent.click(screen.getByTestId('new-game'))
  foundViaUi()
}

describe('App end-to-end loop', () => {
  it('renders the start screen', () => {
    render(<App />)
    expect(screen.getByTestId('new-game')).toBeInTheDocument()
    expect(screen.getByTestId('seed-input')).toBeInTheDocument()
  })

  it('starts a game and shows the dashboard', () => {
    startNewGame()
    expect(screen.getByTestId('dash-week')).toHaveTextContent('0')
    expect(screen.getByTestId('assemble-film')).toBeInTheDocument()
    expect(screen.getByTestId('standing-audienceAwareness')).toBeInTheDocument()
  })

  it('assembles, greenlights, advances to release, and opens the autopsy', () => {
    startNewGame('e2e-loop')

    // Open assembly.
    fireEvent.click(screen.getByTestId('assemble-film'))
    expect(screen.getByTestId('assembly-steps')).toBeInTheDocument()

    // Concept step: pick the first concept card.
    const grid = screen.getByTestId('concept-grid')
    const firstConcept = within(grid).getAllByRole('button')[0]!
    fireEvent.click(firstConcept)
    fireEvent.click(screen.getByTestId('assembly-next')) // → shape

    // Shape step: defaults are valid, advance.
    fireEvent.click(screen.getByTestId('assembly-next')) // → promise

    // Promise step: default segment (adult) is chosen, advance.
    fireEvent.click(screen.getByTestId('assembly-next')) // → talent

    // Talent step: pick first eligible writer, director, and three distinct actors.
    function pickFirstEligible(pickerTestId: string) {
      const picker = screen.getByTestId(pickerTestId)
      // The selectable candidate button carries aria-pressed (redesigned cards also add a
      // "Details" toggle per row, which we must skip). Pick the first ELIGIBLE candidate.
      const btn = within(picker)
        .getAllByRole('button')
        .find((b) => b.hasAttribute('aria-pressed') && !(b as HTMLButtonElement).disabled)!
      fireEvent.click(btn)
    }
    pickFirstEligible('picker-writer')
    pickFirstEligible('picker-director')
    // Cast: choose distinct actors per slot. Because choosing one disables it in the
    // others, re-query each time and pick the first still-enabled.
    pickFirstEligible('picker-lead')
    pickFirstEligible('picker-antagonist')
    pickFirstEligible('picker-support')
    // D-11.13: a Production/Craft Lead is now required to leave the talent step.
    pickFirstEligible('picker-craft')

    fireEvent.click(screen.getByTestId('assembly-next')) // → budget

    // Budget step: forecast preview should render.
    expect(screen.getByTestId('forecast-display')).toBeInTheDocument()
    expect(screen.getByTestId('required-negative')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('assembly-next')) // → review

    // Review + greenlight.
    fireEvent.click(screen.getByTestId('greenlight'))

    // Back on dashboard, one active production.
    expect(screen.getByTestId('active-list')).toBeInTheDocument()

    // Advance weeks until a release appears. The release screen shows either a
    // release card or the "nothing released" empty state each week.
    let releasedCard: HTMLElement | null = null
    for (let i = 0; i < 20 && !releasedCard; i++) {
      // We may be on dashboard or release screen; ensure we advance from dashboard.
      const advance = screen.queryByTestId('advance-week')
      if (advance) {
        fireEvent.click(advance)
      }
      // D-11.C: when a film actually releases, the newspaper front page shows FIRST.
      // Continue through it to reach the release/development summary with the cards.
      const newspaperContinue = screen.queryByTestId('newspaper-continue')
      if (newspaperContinue) {
        fireEvent.click(newspaperContinue)
      }
      // On the release screen, look for a release card.
      const list = screen.queryByTestId('release-list')
      if (list) {
        const cards = within(list).queryAllByTestId(/^release-card-/)
        if (cards.length > 0) {
          releasedCard = cards[0]!
        } else {
          // No release this week; continue back to dashboard.
          fireEvent.click(screen.getByTestId('release-continue'))
        }
      }
    }
    expect(releasedCard).not.toBeNull()

    // Open the full autopsy from the release card.
    const autopsyBtn = within(releasedCard!)
      .getAllByRole('button')
      .find((b) => (b.getAttribute('data-testid') ?? '').startsWith('open-autopsy-'))!
    fireEvent.click(autopsyBtn)

    // Autopsy renders with the sampled variance visible.
    expect(screen.getByTestId('autopsy')).toBeInTheDocument()
    expect(screen.getByTestId('autopsy-reviewvariance')).toBeInTheDocument()
    expect(screen.getByTestId('autopsy-criticmean')).toBeInTheDocument()
    expect(screen.getByTestId('autopsy-cohesion')).toBeInTheDocument()
  })
})
