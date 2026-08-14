import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import type StudioLotScreenType from './StudioLotScreen.tsx'
import { App } from '../App.tsx'
import {
  advanceWeek,
  exportSaveJson,
  foundingApplicantCards,
  greenlight,
  newGame,
  requiredNegative,
  signContractAction,
} from '../engine/adapter.ts'
import type { CreativeRole, DraftPackage, GameState } from '../engine/adapter.ts'
import {
  ACTIVE_SESSION_KEY,
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
} from '../engine/session.ts'
import { setStudioLotOverviewOverride } from '../flags.ts'
import { foundedRosterIds, newFoundedGame } from '../test/founding.ts'

const navigationProbe = vi.hoisted(() => ({
  dashboardRenders: 0,
  lotEntries: [] as Array<{
    focus:
      | 'studio-home'
      | 'selected-building'
      | 'advance-week'
      | 'publicity-campaign'
      | 'annex-work'
      | 'stage-7-production'
      | undefined
    week: number
  }>,
}))

type MockLotProps = ComponentProps<typeof StudioLotScreenType>

// Keep Phaser and the renderer outside this App-navigation contract. The buttons emit
// the same callbacks as the real lot shell, while data attributes make App's return
// focus instruction observable at the lazy boundary.
vi.mock('./StudioLotScreen.tsx', () => ({
  default: (props: MockLotProps) => {
    navigationProbe.lotEntries.push({
      focus: props.entryFocus,
      week: props.state.market.tick,
    })
    return (
      <main
        data-testid="studio-home-probe"
        data-entry-focus={props.entryFocus}
        data-week={props.state.market.tick}
        data-publicity-last-used={props.state.publicity.lastUsedWeek ?? 'none'}
      >
        <button type="button" onClick={props.onExit} data-testid="lot-open-dashboard-probe">
          Open Dashboard
        </button>
        <button
          type="button"
          onClick={props.onOpenPublicityDashboard}
          data-testid="lot-open-publicity-dashboard-probe"
        >
          Open Publicity Dashboard details
        </button>
        <button
          type="button"
          onClick={() => props.onRunPublicity?.('whisper')}
          data-testid="lot-run-publicity-probe"
        >
          Run Publicity
        </button>
        <button
          type="button"
          onClick={() => props.onNavigate({ kind: 'roster' })}
          data-testid="lot-open-roster-probe"
        >
          Open Roster
        </button>
        <button
          type="button"
          onClick={() => props.onNavigate({ kind: 'dashboard' })}
          data-testid="lot-open-building-dashboard-probe"
        >
          Open building Dashboard
        </button>
        <button type="button" onClick={() => props.onNavigate({ kind: 'assembly' })} data-testid="lot-open-assembly-probe">
          Open Assembly
        </button>
        <button type="button" onClick={() => props.onNavigate({ kind: 'castingRoom' })} data-testid="lot-open-casting-probe">
          Open Casting
        </button>
        <button type="button" onClick={() => props.onNavigate({ kind: 'hiring' })} data-testid="lot-open-hiring-probe">
          Open Hiring
        </button>
        <button type="button" onClick={() => props.onNavigate({ kind: 'hub' })} data-testid="lot-open-hub-probe">
          Open Hub
        </button>
        <button type="button" onClick={() => props.onNavigate({ kind: 'saves' })} data-testid="lot-open-saves-probe">
          Open Saves
        </button>
        <button
          type="button"
          onClick={() => props.onNavigate({ kind: 'studioDevelopment' })}
          data-testid="lot-open-development-probe"
        >
          Open Development
        </button>
      </main>
    )
  },
}))

// Render the production Dashboard so its exact affordances remain under test. The thin
// wrapper records whether React ever mounted it, which makes "no Dashboard flash" a
// stronger assertion than checking only the final DOM.
vi.mock('../screens/Dashboard.tsx', async () => {
  const actual = await vi.importActual<typeof import('../screens/Dashboard.tsx')>(
    '../screens/Dashboard.tsx',
  )
  return {
    ...actual,
    Dashboard: (props: Parameters<typeof actual.Dashboard>[0]) => {
      navigationProbe.dashboardRenders += 1
      return <actual.Dashboard {...props} />
    },
  }
})

function restoreFoundedStudio(seed: string) {
  const state = newFoundedGame(seed)
  saveActiveSession(state)
  render(<App />)
  return state
}

async function expectLotFocus(
  focus: 'studio-home' | 'selected-building' | 'advance-week' | 'publicity-campaign',
) {
  const lot = await screen.findByTestId('studio-home-probe')
  expect(lot).toHaveAttribute('data-entry-focus', focus)
  return lot
}

function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const ids = (role: CreativeRole) => foundedRosterIds(state, role)
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.4, 0.4],
        tonalWeight: [-0.4, 0.4],
        kineticEnergy: [-0.4, 0.4],
      },
    },
    writerId: ids('writer')[0]!,
    directorId: ids('director')[0]!,
    craftIds: [ids('craft')[0]!],
    cast: {
      lead: ids('actor')[0]!,
      antagonist: ids('actor')[1]!,
      support: ids('actor')[2]!,
    },
    budget: {
      negative: requiredNegative(concept, shape, state),
      marketing: 400_000,
    },
  }
}

function releasedHistoryState(seed: string): GameState {
  const initial = newFoundedGame(seed)
  const greenlit = greenlight(initial, legalPackage(initial))
  if (!greenlit.ok) throw new Error(greenlit.error)
  let current = greenlit.next
  for (let guard = 0; guard < 40; guard++) {
    const step = advanceWeek(current)
    if (step.released.length > 0) return step.next
    current = step.next
  }
  throw new Error('expected a released film history fixture')
}

function readyToFoundState(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  const required: Array<[CreativeRole, number]> = [
    ['actor', 5],
    ['director', 1],
    ['writer', 2],
    ['craft', 1],
  ]
  for (const [role, count] of required) {
    for (const card of cards.filter((candidate) => candidate.profile.role === role).slice(0, count)) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  return state
}

beforeEach(() => {
  localStorage.clear()
  navigationProbe.dashboardRenders = 0
  navigationProbe.lotEntries.length = 0
})

afterEach(() => {
  cleanup()
  clearActiveSession()
  localStorage.clear()
})

describe('Studio Home V1 — App world-root navigation', () => {
  it('keeps no-session and corrupt-session entry on Start without mounting the Lot', () => {
    const fresh = render(<App />)
    expect(screen.getByTestId('new-game')).toBeInTheDocument()
    expect(navigationProbe.lotEntries).toHaveLength(0)
    fresh.unmount()

    localStorage.setItem(ACTIVE_SESSION_KEY, '{"corrupt":true}')
    render(<App />)
    expect(screen.getByTestId('new-game')).toBeInTheDocument()
    expect(screen.getByTestId('recovery-notice')).toHaveTextContent(
      'Could not recover your last studio',
    )
    expect(navigationProbe.lotEntries).toHaveLength(0)
  })

  it('routes accepted Start imports through the canonical founded/founding home matrix', async () => {
    const founded = newFoundedGame('studio-home-start-import-founded')
    const first = render(<App />)
    fireEvent.change(screen.getByTestId('import-text'), {
      target: { value: exportSaveJson(founded) },
    })
    fireEvent.click(screen.getByTestId('import-save'))
    const loading = screen.getByTestId('studio-lot-lazy-loading')
    expect(loading).toHaveAttribute('role', 'status')
    expect(loading).toHaveAttribute('aria-live', 'polite')
    expect(loading).toHaveAttribute('aria-atomic', 'true')
    await expectLotFocus('studio-home')
    first.unmount()
    clearActiveSession()
    navigationProbe.lotEntries.length = 0

    const founding = newGame('studio-home-start-import-founding')
    render(<App />)
    fireEvent.change(screen.getByTestId('import-text'), {
      target: { value: exportSaveJson(founding) },
    })
    fireEvent.click(screen.getByTestId('import-save'))
    expect(screen.getByTestId('founding-intro')).toBeInTheDocument()
    expect(navigationProbe.lotEntries).toHaveLength(0)
  })

  it('routes successful Founding directly to the default Studio Home without Dashboard paint', async () => {
    const founding = readyToFoundState('studio-home-successful-founding')
    render(<App />)
    fireEvent.change(screen.getByTestId('import-text'), {
      target: { value: exportSaveJson(founding) },
    })
    fireEvent.click(screen.getByTestId('import-save'))
    expect(screen.getByTestId('found-studio')).toBeEnabled()
    fireEvent.click(screen.getByTestId('found-studio'))

    await expectLotFocus('studio-home')
    expect(navigationProbe.dashboardRenders).toBe(0)
  })

  it('restores a founded studio directly into the default-on Lot without a Dashboard render', async () => {
    restoreFoundedStudio('studio-home-default')

    await expectLotFocus('studio-home')
    expect(navigationProbe.dashboardRenders).toBe(0)
    expect(screen.queryByTestId('dash-week')).not.toBeInTheDocument()
    expect(navigationProbe.lotEntries.at(-1)?.focus).toBe('studio-home')
  })

  it('keeps the legacy Dashboard root under the explicit overview rollback', async () => {
    setStudioLotOverviewOverride(false)
    restoreFoundedStudio('studio-home-rollback')

    await screen.findByTestId('dash-week')
    expect(navigationProbe.dashboardRenders).toBeGreaterThan(0)
    expect(screen.queryByTestId('studio-home-probe')).not.toBeInTheDocument()
    expect(screen.queryByTestId('open-studio-lot')).not.toBeInTheDocument()
    expect(screen.queryByTestId('back-to-studio-lot')).not.toBeInTheDocument()
  })

  it('opens Dashboard as a supporting surface and returns to the canonical Studio Home focus', async () => {
    restoreFoundedStudio('studio-home-dashboard-return')
    await expectLotFocus('studio-home')

    fireEvent.click(screen.getByTestId('lot-open-dashboard-probe'))

    const back = await screen.findByTestId('back-to-studio-lot')
    expect(back).toHaveTextContent(/^Back to Studio Lot$/)
    expect(screen.queryByTestId('open-studio-lot')).not.toBeInTheDocument()
    fireEvent.click(back)

    await expectLotFocus('studio-home')
  })

  it('owns one exact Lot publicity successor and exposes only the accepted tier/week receipt boundary', async () => {
    const initial = restoreFoundedStudio('studio-home-publicity-owner')
    const cashBefore = initial.studio.cash
    await expectLotFocus('studio-home')

    fireEvent.click(screen.getByTestId('lot-run-publicity-probe'))

    const lot = await screen.findByTestId('studio-home-probe')
    await waitFor(() => expect(lot).toHaveAttribute(
      'data-publicity-last-used',
      String(initial.market.tick),
    ))
    const restored = loadActiveSession()
    expect(restored.ok).toBe(true)
    if (!restored.ok) throw new Error('expected accepted publicity autosave')
    expect(restored.state.studio.cash).toBeLessThan(cashBefore)
    expect(restored.state.publicity.lastUsedWeek).toBe(initial.market.tick)
    expect(restored.state.publicity.byTier.whisper).toBe(initial.market.tick)
    expect(restored.state.ledger.at(-1)).toMatchObject({
      week: initial.market.tick,
      kind: 'publicity',
      note: 'publicity: whisper',
    })
    expect(restored.state.ledger.at(-1)).not.toHaveProperty('productionId')
  })

  it('returns explicit Publicity Dashboard details to fresh campaign context and demotes unrelated deep navigation', async () => {
    const initial = restoreFoundedStudio('studio-home-publicity-dashboard-return')
    await expectLotFocus('studio-home')

    fireEvent.click(screen.getByTestId('lot-open-publicity-dashboard-probe'))
    const push = await screen.findByTestId('buy-publicity-push')
    expect(push).toBeEnabled()
    fireEvent.click(push)
    await waitFor(() => expect(push).toBeDisabled())
    fireEvent.click(screen.getByTestId('back-to-studio-lot'))

    const returned = await expectLotFocus('publicity-campaign')
    expect(returned).toHaveAttribute('data-publicity-last-used', String(initial.market.tick))

    fireEvent.click(screen.getByTestId('lot-open-publicity-dashboard-probe'))
    fireEvent.click(await screen.findByTestId('open-roster'))
    fireEvent.click(await screen.findByTestId('roster-back'))
    await expectLotFocus('selected-building')
  })

  it('keeps exact save/RNG/ledger bytes and adds no autosave write across pure root navigation', async () => {
    const initial = newFoundedGame('studio-home-navigation-neutrality')
    const exactBefore = exportSaveJson(initial)
    saveActiveSession(initial)
    const storageWrites = vi.spyOn(localStorage, 'setItem')

    render(<App />)
    await expectLotFocus('studio-home')
    const writesAfterMount = storageWrites.mock.calls.filter(
      ([key]) => key === ACTIVE_SESSION_KEY,
    ).length
    expect(writesAfterMount).toBe(1)

    fireEvent.click(screen.getByTestId('lot-open-dashboard-probe'))
    fireEvent.click(await screen.findByTestId('open-roster'))
    fireEvent.click(await screen.findByTestId('roster-back'))
    await expectLotFocus('studio-home')

    const restored = loadActiveSession()
    expect(restored.ok).toBe(true)
    if (!restored.ok) throw new Error('expected active session to remain valid')
    expect(exportSaveJson(restored.state)).toBe(exactBefore)
    expect(storageWrites.mock.calls.filter(([key]) => key === ACTIVE_SESSION_KEY)).toHaveLength(
      writesAfterMount,
    )
  })

  it('carries Lot root through archived Clipping → Film Chronicle and direct Chronicle', async () => {
    const released = releasedHistoryState('studio-home-chronicle-origin')
    const film = released.studio.releasedFilms[0]
    if (!film) throw new Error('expected released film')
    saveActiveSession(released)
    render(<App />)
    await expectLotFocus('studio-home')

    fireEvent.click(screen.getByTestId('lot-open-dashboard-probe'))
    fireEvent.click(await screen.findByTestId(`clipping-${film.productionId}`))
    fireEvent.click(await screen.findByTestId('newspaper-open-chronicle'))
    fireEvent.click(await screen.findByTestId('film-record-back'))
    await expectLotFocus('studio-home')

    fireEvent.click(screen.getByTestId('lot-open-dashboard-probe'))
    fireEvent.click(await screen.findByTestId(`chronicle-${film.productionId}`))
    fireEvent.click(await screen.findByTestId('film-record-back'))
    await expectLotFocus('studio-home')
  })

  it('discards old Lot origin and recovery notice on an accepted founded Saves import', async () => {
    const replacement = newFoundedGame('studio-home-saves-replacement')
    restoreFoundedStudio('studio-home-saves-original')
    await expectLotFocus('studio-home')
    expect(screen.getByTestId('recovery-notice')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('lot-open-saves-probe'))
    fireEvent.change(await screen.findByTestId('saves-import-text'), {
      target: { value: exportSaveJson(replacement) },
    })
    fireEvent.click(screen.getByTestId('saves-import'))

    await expectLotFocus('studio-home')
    expect(screen.queryByTestId('recovery-notice')).not.toBeInTheDocument()
  })

  it('routes an accepted founding-draft Saves import to Founding, not either operating root', async () => {
    const founding = newGame('studio-home-saves-founding-replacement')
    restoreFoundedStudio('studio-home-saves-founding-original')
    await expectLotFocus('studio-home')
    fireEvent.click(screen.getByTestId('lot-open-saves-probe'))
    fireEvent.change(await screen.findByTestId('saves-import-text'), {
      target: { value: exportSaveJson(founding) },
    })
    fireEvent.click(screen.getByTestId('saves-import'))

    expect(screen.getByTestId('founding-intro')).toBeInTheDocument()
    expect(screen.queryByTestId('studio-home-probe')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dash-week')).not.toBeInTheDocument()
  })

  it('keeps Saves and its Lot origin after a rejected import', async () => {
    restoreFoundedStudio('studio-home-saves-reject')
    await expectLotFocus('studio-home')
    fireEvent.click(screen.getByTestId('lot-open-saves-probe'))
    fireEvent.change(await screen.findByTestId('saves-import-text'), {
      target: { value: '{"not":"a save"}' },
    })
    fireEvent.click(screen.getByTestId('saves-import'))
    expect(screen.getByTestId('saves-import')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('saves-back'))
    await expectLotFocus('selected-building')
  })

  for (const child of [
    ['Talent Creator', 'open-talent-creator', 'talent-creator-back'],
    ['Saves', 'open-saves', 'saves-back'],
    ['Calendar', 'open-studio-calendar', 'calendar-back'],
    ['Recap', 'open-recap', 'recap-back'],
    ['Roster', 'open-roster', 'roster-back'],
    ['Casting', 'open-casting-room', 'casting-room-back'],
    ['Hiring', 'open-hiring', 'hiring-back'],
    ['Talent Hub', 'open-talent-hub', 'hub-back'],
    ['Studio Development', 'open-studio-development', 'development-back'],
  ] as const) {
    it(`carries Lot root through supporting Dashboard → ${child[0]}`, async () => {
      restoreFoundedStudio(`studio-home-dashboard-${child[0].toLowerCase().replaceAll(' ', '-')}`)
      await expectLotFocus('studio-home')
      fireEvent.click(screen.getByTestId('lot-open-dashboard-probe'))
      fireEvent.click(await screen.findByTestId(child[1]))
      fireEvent.click(await screen.findByTestId(child[2]))
      await expectLotFocus('studio-home')
    })
  }

  it('returns from a building-origin deep screen with selected-building focus', async () => {
    restoreFoundedStudio('studio-home-building-return')
    await expectLotFocus('studio-home')

    fireEvent.click(screen.getByTestId('lot-open-roster-probe'))
    const back = await screen.findByTestId('roster-back')
    expect(screen.queryByTestId('studio-home-probe')).not.toBeInTheDocument()
    fireEvent.click(back)

    await expectLotFocus('selected-building')
    expect(navigationProbe.lotEntries.at(-1)?.focus).toBe('selected-building')
  })

  for (const route of [
    ['assembly', 'lot-open-assembly-probe', 'assembly-back-dashboard'],
    ['casting', 'lot-open-casting-probe', 'casting-room-back'],
    ['hiring', 'lot-open-hiring-probe', 'hiring-back'],
    ['hub', 'lot-open-hub-probe', 'hub-back'],
    ['saves', 'lot-open-saves-probe', 'saves-back'],
    ['studio development', 'lot-open-development-probe', 'development-back'],
  ] as const) {
    it(`retains Lot root through the latent/visible ${route[0]} route`, async () => {
      restoreFoundedStudio(`studio-home-${route[0].replace(' ', '-')}-return`)
      await expectLotFocus('studio-home')
      fireEvent.click(screen.getByTestId(route[1]))
      fireEvent.click(await screen.findByTestId(route[2]))
      await expectLotFocus('selected-building')
    })
  }

  it('keeps Hiring nested while Talent Creator retains the Lot root', async () => {
    restoreFoundedStudio('studio-home-hiring-talent-return')
    await expectLotFocus('studio-home')
    fireEvent.click(screen.getByTestId('lot-open-hiring-probe'))
    fireEvent.click(await screen.findByTestId('hiring-create-talent'))
    fireEvent.click(await screen.findByTestId('talent-creator-back'))
    fireEvent.click(await screen.findByTestId('hiring-back'))
    await expectLotFocus('selected-building')
  })

  it('returns a no-release supporting-Dashboard advance to the Lot with advance-week focus', async () => {
    const initial = restoreFoundedStudio('studio-home-dashboard-advance')
    await expectLotFocus('studio-home')
    fireEvent.click(screen.getByTestId('lot-open-dashboard-probe'))

    fireEvent.click(await screen.findByTestId('advance-week'))

    const lot = await expectLotFocus('advance-week')
    await waitFor(() =>
      expect(Number(lot.getAttribute('data-week'))).toBe(initial.market.tick + 1),
    )
    expect(navigationProbe.lotEntries.at(-1)).toEqual({
      focus: 'advance-week',
      week: initial.market.tick + 1,
    })
  })

  for (const origin of [
    {
      label: 'topbar',
      openTestId: 'lot-open-dashboard-probe',
      expectedFocus: 'studio-home',
    },
    {
      label: 'building',
      openTestId: 'lot-open-building-dashboard-probe',
      expectedFocus: 'selected-building',
    },
  ] as const) {
    it(`preserves ${origin.label} focus through a supporting-Dashboard Sim result`, async () => {
      restoreFoundedStudio(`studio-home-${origin.label}-sim`)
      await expectLotFocus('studio-home')
      fireEvent.click(screen.getByTestId(origin.openTestId))

      fireEvent.click(await screen.findByTestId('sim-to-event'))
      fireEvent.click(await screen.findByTestId('period-continue'))

      await expectLotFocus(origin.expectedFocus)
      expect(navigationProbe.lotEntries.at(-1)?.focus).toBe(origin.expectedFocus)
    })
  }
})
