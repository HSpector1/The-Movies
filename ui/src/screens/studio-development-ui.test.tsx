import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import {
  advanceWeek,
  advanceToNextEvent,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  financeCard,
  greenlight,
  productionDecision,
  requiredNegative,
  runProductionCommand,
  signContractAction,
  startDevelopmentCastingAnnexAction,
  studioDevelopment,
} from '../engine/adapter.ts'
import type { CreativeRole, DraftPackage, GameState } from '../engine/adapter.ts'
import { StudioDevelopment, StudioDevelopmentPreview } from './StudioDevelopment.tsx'
import { StudioCalendar } from './StudioCalendar.tsx'
import { StudioLotScreen } from '../lot/StudioLotScreen.tsx'
import { loadActiveSession, saveActiveSession } from '../engine/session.ts'
import { setStudioLotOverviewOverride } from '../flags.ts'
import { App } from '../App.tsx'
import { Dashboard } from './Dashboard.tsx'
import { WeeklySummary } from './WeeklySummary.tsx'

vi.mock('../lot/StudioLotView.ts', () => ({
  StudioLotView: class {
    constructor(options: { onReady?: () => void }) { queueMicrotask(() => options.onReady?.()) }
    setSnapshot() {}
    select() {}
    clearSelection() {}
    clearHollywoodPlaceSelection() {}
    clearHollywoodPersonSelection() {}
    pause() {}
    resume() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() {}
    destroy() {}
  },
}))

const COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 2,
  craft: 1,
}

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const ids = (role: CreativeRole) => state.contracts
    .map((contract) => contract.talentId)
    .filter((id) => state.talent.find((talent) => talent.id === id)?.role === role)
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
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

function managedWithLegacyDevelopment(seed: string): GameState {
  const state = managedStudio(seed)
  return {
    ...state,
    scriptDevelopment: { mode: 'legacy', projects: [] },
    castingSessions: { mode: 'legacy', sessions: [] },
  }
}

function resolveShootingChain(state: GameState): GameState {
  let next = state
  for (let i = 0; i < 3; i++) {
    const decision = productionDecision(next)
    if (decision?.command === null || decision === null) {
      throw new Error(`expected shooting command ${String(i + 1)}`)
    }
    const result = runProductionCommand(next, decision.command)
    if (!result.ok) throw new Error(result.error)
    next = result.next
  }
  return next
}

function releaseConstructionCoevent(seed: string): GameState {
  let state = managedWithLegacyDevelopment(seed)
  const started = startDevelopmentCastingAnnexAction(state)
  if (!started.ok) throw new Error(started.error)
  state = started.next
  // Four construction weeks before greenlight align the ordinary managed
  // nine-advance production clock with the Annex's 13th advance.
  for (let i = 0; i < 4; i++) state = advanceWeek(state).next
  const greenlit = greenlight(state, legalPackage(state))
  if (!greenlit.ok) throw new Error(greenlit.error)
  state = greenlit.next
  for (let i = 0; i < 4; i++) state = advanceWeek(state).next
  expect(productionDecision(state)?.command?.kind).toBe('assignShootingDirector')
  state = resolveShootingChain(state)
  for (let i = 0; i < 4; i++) state = advanceWeek(state).next
  expect(studioDevelopment(state).completedAdvances).toBe(12)
  expect(state.studio.activeProductions[0]?.remainingTicks).toBe(1)
  return state
}

function DevelopmentHarness({ initial }: { initial: GameState }) {
  const [state, setState] = useState(initial)
  return (
    <>
      <StudioDevelopment state={state} onChange={setState} onBack={() => {}} />
      <button
        type="button"
        data-testid="test-advance"
        onClick={() => setState((current) => advanceWeek(current).next)}
      >
        Advance test week
      </button>
    </>
  )
}

beforeEach(() => localStorage.clear())

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('Development & Casting Annex player experience', () => {
  it('owns the one start action and moves accessibly from Vacant to Building to Operational', async () => {
    const initial = managedStudio('annex-ui-lifecycle')
    const initialView = studioDevelopment(initial)
    expect(initialView.status).toBe('vacant')

    render(<DevelopmentHarness initial={initial} />)

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByTestId('development-state-vacant')).toHaveTextContent('Vacant')
    expect(screen.getByTestId('development-vacant-facts')).toHaveTextContent('$780,000')
    expect(screen.getByTestId('development-vacant-facts')).toHaveTextContent('$19,220,000')
    expect(screen.getByTestId('development-affordability')).toHaveTextContent('Affordable now')

    const start = screen.getByRole('button', {
      name: 'Build Development & Casting Annex · $780,000',
    })
    fireEvent.click(start)

    const building = await screen.findByTestId('development-state-building')
    expect(building).toHaveTextContent('0 of 13 weekly advances complete')
    expect(building).toHaveTextContent('Week 13')
    expect(screen.queryByTestId('start-development-casting-annex')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('development-site-status')).toHaveFocus())
    expect(screen.getByRole('status')).toHaveTextContent(
      '$780,000 committed to Development & Casting Annex. Completion is due in Week 13.',
    )

    for (let i = 0; i < 12; i++) fireEvent.click(screen.getByTestId('test-advance'))
    expect(screen.getByTestId('development-state-building')).toHaveTextContent(
      '12 of 13 weekly advances complete',
    )
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '12')

    fireEvent.click(screen.getByTestId('test-advance'))
    const operational = await screen.findByTestId('development-state-operational')
    expect(operational).toHaveTextContent('Completed in Week 13')
    expect(operational).toHaveTextContent('Capacity gained+1 slot')
    expect(operational).toHaveTextContent('Current shared capacity3 slots')
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('start-development-casting-annex')).not.toBeInTheDocument()
  })

  it('reloads exact Building progress without replaying the debit or start ceremony', () => {
    let state = managedStudio('annex-ui-reload')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 6; i++) state = advanceWeek(state).next
    const cashAtSave = state.studio.cash

    const imported = importSaveJson(exportSaveJson(state))
    if (!imported.ok) throw new Error(imported.error)
    expect(imported.converted).toBe(false)
    expect(imported.state.studio.cash).toBe(cashAtSave)

    render(<StudioDevelopment state={imported.state} onChange={() => {}} onBack={() => {}} />)
    expect(screen.getByTestId('development-progress-text')).toHaveTextContent(
      '6 of 13 weekly advances complete',
    )
    expect(screen.getByTestId('development-building-facts')).toHaveTextContent('7')
    expect(screen.queryByTestId('start-development-casting-annex')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('shows ordinary Advance completion once when no film releases, then clears it', () => {
    let state = managedStudio('annex-ui-ordinary-advance-completion')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 12; i++) state = advanceWeek(state).next
    expect(studioDevelopment(state).status).toBe('building')
    saveActiveSession(state)

    render(<App />)
    fireEvent.click(screen.getByTestId('advance-week'))

    expect(screen.getByTestId('no-week-releases')).toBeInTheDocument()
    const completion = screen.getByTestId('annex-completion-summary')
    expect(completion).toHaveTextContent(
      'Development & Casting Annex is Operational in Week 13. One shared Development & Casting slot is now available.',
    )
    expect(completion).toHaveAttribute('role', 'status')
    expect(completion).toHaveAttribute('aria-live', 'polite')
    expect(completion).toHaveAttribute('aria-atomic', 'true')
    expect(completion).toHaveFocus()

    fireEvent.click(screen.getByTestId('release-continue'))
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('advance-week'))
    expect(screen.getByTestId('no-week-releases')).toBeInTheDocument()
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
  })

  it('keeps a no-release Annex completion on the same mounted lot with one focus owner', async () => {
    let state = managedStudio('annex-ui-lot-advance-completion')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 12; i++) state = advanceWeek(state).next
    saveActiveSession(state)
    setStudioLotOverviewOverride(true)

    render(<App />)
    fireEvent.click(screen.getByTestId('open-studio-lot'))
    const lot = await screen.findByTestId('studio-lot-screen')
    const advance = screen.getByTestId('lot-advance-week')
    fireEvent.click(advance)

    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByText(/Week 13$/)).toBeInTheDocument()
    expect(screen.getByTestId('annex-completion-summary')).toHaveFocus()
    expect(screen.getByTestId('lot-week-update-announcement')).toHaveTextContent('')
    expect(screen.getByTestId('lot-annex-operational-announcement')).toHaveTextContent('')
    expect(screen.queryByTestId('no-week-releases')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-advance-week'))
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-week-update-announcement')).toHaveTextContent(
      'Week 14. Studio Lot updated.',
    )
    expect(screen.getByTestId('lot-annex-operational-announcement')).toHaveTextContent('')
  })

  it('repaints exact intermediate Annex progress in the same mounted lot', async () => {
    let state = managedStudio('annex-ui-lot-progress')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 5; i++) state = advanceWeek(state).next
    expect(studioDevelopment(state).status).toBe('building')
    const expected = advanceWeek(state)
    expect(expected.released).toHaveLength(0)
    expect(expected.constructionCompletion).toBeNull()
    saveActiveSession(state)
    setStudioLotOverviewOverride(true)

    render(<App />)
    fireEvent.click(screen.getByTestId('open-studio-lot'))
    const lot = await screen.findByTestId('studio-lot-screen')
    expect(screen.getByTestId('lot-nav-expansion-state')).toHaveTextContent(
      '5 of 13 weekly advances complete',
    )
    fireEvent.click(screen.getByTestId('lot-advance-week'))

    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('lot-nav-expansion-state')).toHaveTextContent(
      '6 of 13 weekly advances complete',
    )
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
    await waitFor(() => {
      const restored = loadActiveSession()
      expect(restored.ok).toBe(true)
      if (restored.ok) expect(exportSaveJson(restored.state)).toBe(exportSaveJson(expected.next))
    })
  })

  it('keeps release priority, reports completion first on Newspaper, and never repeats after Continue', () => {
    const state = releaseConstructionCoevent('annex-ui-release-coevent')
    expect(studioDevelopment(state).status).toBe('building')

    const coevent = advanceToNextEvent(state)
    expect(coevent.stopReason).toBe('release')
    expect(coevent.released).toHaveLength(1)
    expect(coevent.constructionCompletion?.completedWeek).toBe(coevent.toWeek)
    saveActiveSession(state)

    render(<App />)
    fireEvent.click(screen.getByTestId('sim-to-event'))
    expect(screen.getByTestId('newspaper-reveal')).toBeInTheDocument()
    expect(screen.getAllByTestId('annex-completion-summary')).toHaveLength(1)
    expect(screen.getByTestId('annex-completion-summary')).toHaveFocus()

    fireEvent.click(screen.getByTestId('newspaper-continue'))
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
  })

  it('returns a lot-origin release plus Annex completion without repeating Operational', async () => {
    const state = releaseConstructionCoevent('annex-ui-lot-release-coevent')
    saveActiveSession(state)
    setStudioLotOverviewOverride(true)

    render(<App />)
    fireEvent.click(screen.getByTestId('open-studio-lot'))
    await screen.findByTestId('studio-lot-screen')
    fireEvent.click(screen.getByTestId('lot-advance-week'))

    expect(screen.getByTestId('newspaper-reveal')).toBeInTheDocument()
    expect(screen.getAllByTestId('annex-completion-summary')).toHaveLength(1)
    expect(screen.getByTestId('annex-completion-summary')).toHaveFocus()
    fireEvent.click(screen.getByTestId('newspaper-continue'))

    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
    const releaseHeading = screen.getAllByRole('heading', { level: 2 })[0]!
    expect(releaseHeading).toHaveFocus()
    fireEvent.click(screen.getByTestId('release-continue'))

    await screen.findByTestId('studio-lot-screen')
    expect(screen.getByTestId('lot-advance-week')).toHaveFocus()
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-annex-operational-announcement')).toHaveTextContent('')

    fireEvent.click(screen.getByTestId('lot-return-dashboard'))
    fireEvent.click(screen.getByTestId('open-studio-lot'))
    await waitFor(() => expect(screen.getByTestId('lot-annex-operational-announcement')).toHaveTextContent(
      'Development & Casting Annex is Operational.',
    ))
  })

  it('carries a lot-origin completion context through Newspaper Autopsy back to the lot', async () => {
    const state = releaseConstructionCoevent('annex-ui-lot-autopsy-coevent')
    saveActiveSession(state)
    setStudioLotOverviewOverride(true)

    render(<App />)
    fireEvent.click(screen.getByTestId('open-studio-lot'))
    await screen.findByTestId('studio-lot-screen')
    fireEvent.click(screen.getByTestId('lot-advance-week'))
    fireEvent.click(screen.getByTestId('newspaper-open-autopsy'))
    expect(screen.getByTestId('autopsy')).toBeInTheDocument()
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('autopsy-back'))
    await screen.findByTestId('studio-lot-screen')
    expect(screen.getByTestId('lot-advance-week')).toHaveFocus()
    expect(screen.getByTestId('lot-annex-operational-announcement')).toHaveTextContent('')
  })

  it('newspaper-to-autopsy bypass still consumes the same-tick completion exactly once', () => {
    const state = releaseConstructionCoevent('annex-ui-newspaper-autopsy')
    saveActiveSession(state)

    render(<App />)
    fireEvent.click(screen.getByTestId('advance-week'))
    expect(screen.getAllByTestId('annex-completion-summary')).toHaveLength(1)
    fireEvent.click(screen.getByTestId('newspaper-open-autopsy'))
    expect(screen.getByTestId('autopsy')).toBeInTheDocument()
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
  })

  it('keeps a same-tick production decision primary and shows Annex completion once in Weekly Summary', () => {
    let state = managedWithLegacyDevelopment('annex-ui-decision-coevent')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 9; i++) state = advanceWeek(state).next
    const greenlit = greenlight(state, legalPackage(state))
    if (!greenlit.ok) throw new Error(greenlit.error)
    state = greenlit.next
    // Greenlighting after the ninth construction advance aligns the first
    // Shooting command with the 13th completion advance.
    const coevent = advanceToNextEvent(state)
    expect(coevent.stopReason).toBe('productionDecision')
    expect(coevent.constructionCompletion).not.toBeNull()

    render(
      <WeeklySummary
        summary={coevent.summary}
        stopReason={coevent.stopReason}
        stopMessage={coevent.stopMessage}
        weeks={coevent.weeks}
        cashNow={coevent.next.studio.cash}
        constructionCompletion={coevent.constructionCompletion}
        onContinue={() => {}}
      />,
    )
    expect(screen.getByTestId('stop-reason')).toHaveTextContent(/needs you/i)
    expect(screen.getAllByTestId('annex-completion-summary')).toHaveLength(1)
    expect(screen.getByTestId('annex-completion-summary')).toHaveFocus()
  })

  it('renders Dashboard construction as positive capital spend while period accounting remains signed', () => {
    let state = managedStudio('annex-ui-finance-sign')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    expect(financeCard(state).totals.construction).toBe(-780_000)

    const dashboard = render(
      <Dashboard
        state={state}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )
    expect(screen.getByTestId('fin-construction')).toHaveTextContent('$780K')
    expect(screen.getByTestId('fin-construction')).not.toHaveTextContent('-$780K')

    const period = advanceToNextEvent(state)
    expect(period.summary.construction).toBe(-780_000)
    dashboard.unmount()
    render(
      <WeeklySummary
        summary={period.summary}
        stopReason={period.stopReason}
        stopMessage={period.stopMessage}
        weeks={period.weeks}
        cashNow={period.next.studio.cash}
        constructionCompletion={period.constructionCompletion}
        onContinue={() => {}}
      />,
    )
    expect(screen.getByTestId('sum-construction')).toHaveTextContent('-$780K')
  })

  it('shows the exact core affordability reason and disables the native action', () => {
    const state = managedStudio('annex-ui-affordability')
    const cash = 779_999
    const poor: GameState = {
      ...state,
      studio: { ...state.studio, cash },
      ledger: [
        ...state.ledger,
        {
          week: state.market.tick,
          kind: 'termination',
          amount: cash - state.studio.cash,
          note: 'test-only cash reconciliation',
        },
      ],
    }
    const view = studioDevelopment(poor)
    expect(view.affordability.ok).toBe(false)

    render(<StudioDevelopment state={poor} onChange={() => {}} onBack={() => {}} />)
    expect(screen.getByTestId('start-development-casting-annex')).toBeDisabled()
    expect(screen.getByTestId('development-affordability')).toHaveTextContent(
      view.affordability.ok ? '' : view.affordability.reason,
    )
  })

  it('keeps Calendar read-only while routing its development section and completion event', () => {
    let state = managedStudio('annex-ui-calendar')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    const navigate = vi.fn()

    render(<StudioCalendar state={state} onNavigate={navigate} onBack={() => {}} />)
    const development = screen.getByTestId('studio-development-preview')
    expect(development).toHaveTextContent('Building')
    fireEvent.click(within(development).getByTestId('open-studio-development'))
    expect(navigate).toHaveBeenCalledWith({ kind: 'studioDevelopment' })

    const event = screen.getByTestId(
      'calendar-event-open-constructionCompletion-construction-development-casting-annex-0',
    )
    expect(event).toHaveAccessibleName(
      'Open Development & Casting Annex in Studio Development',
    )
    fireEvent.click(event)
    expect(navigate).toHaveBeenLastCalledWith({ kind: 'studioDevelopment' })
  })

  it('announces Operational and the new capacity when returning to Calendar and lot', () => {
    let state = managedStudio('annex-ui-return-announcements')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 13; i++) state = advanceWeek(state).next

    const calendar = render(
      <StudioCalendar state={state} onNavigate={() => {}} onBack={() => {}} />,
    )
    expect(screen.getByTestId('calendar-annex-operational-announcement')).toHaveTextContent(
      'Development & Casting Annex is Operational. Development & Casting capacity is now 3 shared slots.',
    )
    calendar.unmount()

    render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
      />,
    )
    const lotAnnouncement = screen.getByTestId('lot-annex-operational-announcement')
    expect(lotAnnouncement).toHaveAttribute('role', 'status')
    expect(lotAnnouncement).toHaveAttribute('aria-live', 'polite')
    expect(lotAnnouncement).toHaveTextContent(
      'Development & Casting Annex is Operational. Development & Casting capacity is now 3 shared slots.',
    )
  })

  it('routes the lot expansion companion directly to Studio Development with persisted state text', () => {
    let state = managedStudio('annex-ui-lot')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = advanceWeek(started.next).next
    const navigate = vi.fn()

    render(
      <StudioLotScreen
        state={state}
        onNavigate={navigate}
        onExit={() => {}}
        onAdvance={() => {}}
      />,
    )
    const expansion = screen.getByTestId('lot-nav-expansion')
    expect(expansion).toHaveTextContent('1 of 13 weekly advances complete')
    fireEvent.click(expansion)
    expect(navigate).toHaveBeenCalledWith({ kind: 'studioDevelopment' })
    expect(screen.queryByTestId('lot-expansion-info')).not.toBeInTheDocument()
  })

  it('renders the Dashboard preview route without owning the action', () => {
    const open = vi.fn()
    render(<StudioDevelopmentPreview state={managedStudio('annex-ui-preview')} onOpen={open} />)
    const preview = screen.getByTestId('studio-development-preview')
    expect(preview).toHaveTextContent('Vacant')
    expect(preview).toHaveTextContent('$780,000 · 13 weeks')
    expect(within(preview).queryByTestId('start-development-casting-annex')).not.toBeInTheDocument()
    fireEvent.click(within(preview).getByTestId('open-studio-development'))
    expect(open).toHaveBeenCalledOnce()
  })
})
