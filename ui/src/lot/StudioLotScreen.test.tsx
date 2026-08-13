// ── Gate D1: StudioLotScreen host lifecycle + component tests ─────────────────
// jsdom has no WebGL, so the Phaser view is mocked with a spy. These prove the host
// contract: the renderer is created once and destroyed on unmount, fed new snapshots,
// paused/resumed with tab visibility, driven by reduced-motion, and that navigation
// emits routes only (never mutating GameState). The companion navigation is asserted
// as the accessible, keyboard-operable backbone.

import { useState } from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
} from '../../../src/core/index.ts'
import type { CreativeRole, GameState } from '../../../src/core/index.ts'
import {
  publicityDecision,
  runProductionCommand,
  runPublicity,
  studioLotSnapshot,
} from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'
import { setOperationHollywoodOverride } from '../flags.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import type { LotRoute } from './navigation.ts'
import type {
  BuildingId,
  LotPersonState,
  ProductionOperationsState,
} from './snapshot/StudioLotSnapshot.ts'

// A spy StudioLotView. Records construction, snapshots, lifecycle calls, and lets a
// test drive the onAction/onSelect callbacks the real view would emit.
const spy = vi.hoisted(() => {
  const instances: FakeInstance[] = []
  type Opts = {
    parent: HTMLElement
    snapshot: { selectedBuildingId: string | null; week: number }
    onAction?: (e: { buildingId: string; action: string }) => void
    onSelect?: (sel: unknown) => void
    onReady?: () => void
    onActivity?: (text: string | null) => void
    onHollywoodPerson?: (person: unknown) => void
    onHollywoodPlace?: (place: {
      id: string
      buildingId: BuildingId
      label: string
      affordances: string[]
    }) => void
  }
  class FakeInstance {
    opts: Opts
    snapshots: unknown[] = []
    destroyed = false
    paused = 0
    resumed = 0
    reduced: boolean[] = []
    identityModes: string[] = []
    selected: string[] = []
    publicity: Array<{ ok: boolean; detail: string }> = []
    hollywoodPeopleSelected: string[] = []
    hollywoodPersonClears = 0
    hollywoodPlaceClears = 0
    constructor(opts: Opts) {
      this.opts = opts
      this.snapshots.push(opts.snapshot)
      instances.push(this)
      queueMicrotask(() => opts.onReady?.())
    }
    setSnapshot(s: unknown) { this.snapshots.push(s) }
    select(id: string) { this.selected.push(id) }
    clearSelection() {}
    triggerAction() {}
    pause() { this.paused++ }
    resume() { this.resumed++ }
    pauseVignettes() {}
    setReducedMotion(on: boolean) { this.reduced.push(on) }
    setIdentityMode(mode: string) { this.identityModes.push(mode) }
    setSignageMasked() {}
    camera() {}
    showHollywoodPublicity(ok: boolean, detail: string) { this.publicity.push({ ok, detail }) }
    selectHollywoodPerson(id: string) { this.hollywoodPeopleSelected.push(id) }
    clearHollywoodPersonSelection() { this.hollywoodPersonClears++ }
    clearHollywoodPlaceSelection() { this.hollywoodPlaceClears++ }
    destroy() { this.destroyed = true }
  }
  return { instances, FakeInstance }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: spy.FakeInstance }))

// ── engine state fixtures ─────────────────────────────────────────────────────
function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function foundManagedStudio(seed: string): GameState {
  return applyActions(foundStudio(seed), [{ kind: 'activateStudioOperations' }])
}

function rosterIds(state: GameState, role: CreativeRole): string[] {
  return state.contracts
    .map((contract) => state.talent.find((talent) => talent.id === contract.talentId)!)
    .filter((talent) => talent.role === role)
    .map((talent) => talent.id)
}

function greenlightFilm(state: GameState): GameState {
  const concept = state.concepts[0]!
  const actors = rosterIds(state, 'actor')
  return applyActions(state, [{
    kind: 'greenlight',
    production: {
      conceptId: concept.id,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
      },
      writerId: rosterIds(state, 'writer')[0]!,
      directorId: rosterIds(state, 'director')[0]!,
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
      craftIds: [rosterIds(state, 'craft')[0]!],
      budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
    },
  }])
}

function advance(state: GameState, weeks: number): GameState {
  let next = state
  for (let i = 0; i < weeks; i++) next = tick(next)
  return next
}

const baseState = foundStudio('host-1')
const nextState = tick(baseState) // week advances → different snapshot

function renderScreen(state: GameState = baseState) {
  const routes: LotRoute[] = []
  let exits = 0
  const utils = render(
    <StudioLotScreen state={state} onNavigate={(r) => routes.push(r)} onExit={() => { exits++ }} />,
  )
  return { ...utils, routes, exits: () => exits }
}
const latest = () => spy.instances[spy.instances.length - 1]!

afterEach(() => {
  spy.instances.length = 0
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  setOperationHollywoodOverride(false)
})

describe('StudioLotScreen — host lifecycle + accessible companion navigation', () => {
  it('3. creates the renderer exactly once', async () => {
    renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    // a second effect pass / rerender must not create a second view
    expect(spy.instances.length).toBe(1)
  })

  it('4. setSnapshot updates the view when GameState changes', async () => {
    const { rerender } = renderScreen(baseState)
    await waitFor(() => expect(spy.instances.length).toBe(1))
    const before = latest().snapshots.length
    rerender(<StudioLotScreen state={nextState} onNavigate={() => {}} onExit={() => {}} />)
    await waitFor(() => expect(latest().snapshots.length).toBeGreaterThan(before))
    const last = latest().snapshots.at(-1) as { week: number }
    expect(last.week).toBe(nextState.market.tick)
  })

  it('5. + 6. pauses when the tab is hidden and resumes when visible', async () => {
    renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    const view = latest()
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(view.paused).toBeGreaterThan(0)
    hidden.mockReturnValue(false)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(view.resumed).toBeGreaterThan(0)
  })

  it('7. destroys the renderer on unmount', async () => {
    const { unmount } = renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    const view = latest()
    unmount()
    expect(view.destroyed).toBe(true)
  })

  it('8. repeated mount/unmount creates no duplicate live renderer', async () => {
    for (let i = 0; i < 3; i++) {
      const { unmount } = renderScreen()
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => expect(spy.instances.at(-1)?.destroyed).toBe(false))
      const live = spy.instances.filter((v) => !v.destroyed)
      expect(live.length).toBe(1) // only ever one live view at a time
      unmount()
    }
  })

  it('9. + 10. navigation emits a route only and never mutates GameState', async () => {
    const state = foundStudio('host-nav')
    const before = JSON.stringify(state)
    const routes: LotRoute[] = []
    render(<StudioLotScreen state={state} onNavigate={(r) => routes.push(r)} onExit={() => {}} />)
    await waitFor(() => expect(spy.instances.length).toBe(1))
    // The view emits a building's navigation intent; the host translates it to a route.
    latest().opts.onAction?.({ buildingId: 'admin', action: 'open-studio-overview' })
    expect(routes).toContainEqual({ kind: 'dashboard' })
    expect(JSON.stringify(state)).toBe(before) // GameState untouched
  })

  it('12. the companion navigation exposes every one of the nine destinations', async () => {
    const { getByTestId } = renderScreen()
    for (const id of ['gate', 'admin', 'casting', 'writers', 'stage-a', 'stage-b', 'post', 'theater', 'expansion']) {
      expect(getByTestId(`lot-nav-${id}`)).toBeInTheDocument()
    }
  })

  it('13. companion items are semantic, keyboard-operable buttons that navigate', async () => {
    const { getByTestId, routes } = renderScreen()
    const btn = getByTestId('lot-nav-writers') // Development → Assemble a Film
    expect(btn.tagName).toBe('BUTTON') // native Enter/Space activation
    expect(btn).not.toHaveAttribute('tabindex', '-1')
    btn.focus()
    expect(btn).toHaveFocus()
    fireEvent.click(btn) // the activation a keyboard Enter/Space performs on a button
    expect(routes).toContainEqual({ kind: 'assembly' })
  })

  it('11. restores the selected building when returning to the lot', async () => {
    // Select a building via the companion nav, unmount, then remount: the new view is
    // handed the restored selection (session-level UI state, never GameState).
    const { getByTestId, unmount } = renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    fireEvent.click(getByTestId('lot-nav-theater')) // records selection + navigates
    unmount()
    spy.instances.length = 0
    renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    const opts = latest().opts.snapshot as { selectedBuildingId: string | null }
    expect(opts.selectedBuildingId).toBe('theater')
    await waitFor(() => expect(latest().selected).toContain('theater'))
  })

  it('14. reduced-motion preference drives the view + container into reduced-motion', async () => {
    // Stub the media query BEFORE mount so prefersReducedMotion() reports reduce.
    const mql = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql))
    const { getByTestId } = renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    await waitFor(() => expect(latest().reduced).toContain(true))
    expect(getByTestId('studio-lot-screen').className).toContain('lot-reduced-motion')
  })

  it('12b. the return-to-dashboard control is present and calls onExit', async () => {
    const { getByTestId, exits } = renderScreen()
    fireEvent.click(getByTestId('lot-return-dashboard'))
    expect(exits()).toBe(1)
  })
})

describe('StudioLotScreen — authoritative Hollywood operations host', () => {
  it('moves Hollywood keyboard focus to each successor and announces the final take', async () => {
    setOperationHollywoodOverride(true)
    const initial = advance(greenlightFilm(foundManagedStudio('hollywood-command-focus')), 4)
    const productionId = initial.studio.activeProductions[0]!.id

    function Harness() {
      const [state, setState] = useState(initial)
      return (
        <StudioLotScreen
          state={state}
          onNavigate={() => {}}
          onExit={() => {}}
          onProductionCommand={(command) => {
            const result = runProductionCommand(state, command)
            if (!result.ok) throw new Error(result.error)
            setState(result.next)
          }}
        />
      )
    }

    const { getByTestId, findByTestId } = render(<Harness />)
    const assign = getByTestId('hollywood-production-command-assignShootingDirector')
    assign.focus()
    fireEvent.click(assign)
    const clear = await findByTestId('hollywood-production-command-clearSceneryLoadIn')
    await waitFor(() => expect(clear).toHaveFocus())

    fireEvent.click(clear)
    const schedule = await findByTestId('hollywood-production-command-scheduleShootingTake')
    await waitFor(() => expect(schedule).toHaveFocus())

    fireEvent.click(schedule)
    const status = await findByTestId(`hollywood-task-status-${productionId}`)
    await waitFor(() => expect(status).toHaveTextContent('scheduled'))
    expect(status).toHaveAttribute('role', 'status')
    expect(status).toHaveFocus()
  })

  it('keeps renderer telemetry out of the ordinary-player Hollywood surface', async () => {
    setOperationHollywoodOverride(true)
    const intervalSpy = vi.spyOn(window, 'setInterval')
    const { queryByTestId } = render(
      <StudioLotScreen
        state={foundManagedStudio('hollywood-no-player-telemetry')}
        onNavigate={() => {}}
        onExit={() => {}}
      />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))
    await waitFor(() => expect(latest().snapshots.length).toBeGreaterThan(0))
    expect(intervalSpy.mock.calls.some(([, delay]) => delay === 500)).toBe(false)
    expect(queryByTestId('hollywood-performance')).not.toBeInTheDocument()
  })

  it('shows an honestly idle managed studio without a fabricated film, person, or task', () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-managed-idle')

    const { getByTestId, queryByText, queryByRole } = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} />,
    )

    expect(getByTestId('hollywood-production-idle')).toHaveTextContent('No active production')
    expect(getByTestId('hollywood-production-idle')).toHaveTextContent('studio lot is idle')
    expect(queryByText(/Violet Hour/i)).not.toBeInTheDocument()
    expect(queryByText(/Mara Voss/i)).not.toBeInTheDocument()
    expect(queryByText(/Take 12/i)).not.toBeInTheDocument()
    expect(queryByRole('group', { name: 'Named studio people' })).not.toBeInTheDocument()
  })

  it('renders exact operations facts and dispatches the exact snapshot command', () => {
    setOperationHollywoodOverride(true)
    const state = advance(greenlightFilm(foundManagedStudio('hollywood-managed-command')), 4)
    const snapshot = studioLotSnapshot(state)
    const operation = snapshot.productionOperations![0]!
    const onProductionCommand = vi.fn()

    const { getByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onProductionCommand={onProductionCommand}
      />,
    )

    const current = getByTestId('hollywood-current-production')
    expect(current).toHaveTextContent(operation.title)
    expect(current).toHaveTextContent(operation.phaseLabel)
    expect(current.textContent).toMatch(new RegExp(operation.facilityLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
    expect(current).toHaveTextContent(operation.directorName)
    expect(current).toHaveTextContent(String(operation.weeksRemaining))
    expect(getByTestId('hollywood-production-blocker')).toHaveTextContent(operation.blocker!.headline)
    expect(getByTestId('hollywood-production-blocker')).toHaveTextContent(operation.blocker!.detail)

    const command = getByTestId(`hollywood-production-command-${operation.currentCommand!.kind}`)
    expect(command).toHaveTextContent(operation.currentCommand!.label)
    fireEvent.click(command)
    expect(onProductionCommand).toHaveBeenCalledOnce()
    expect(onProductionCommand).toHaveBeenCalledWith(operation.currentCommand)
  })

  it('keeps a Soundstage 12 operation truthful in the inspector and dispatches no Stage 7 fiction', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-stage-12')
    const base = studioLotSnapshot(state)
    const fakeOperation = {
      productionId: 'production-stage-12',
      title: 'Second Unit Picture',
      phase: 'shooting' as const,
      phaseLabel: 'Shooting',
      weeksRemaining: 5,
      progress01: 3 / 8,
      locationBuildingId: 'stage-b' as const,
      facilityLabel: 'Soundstage 12 + Scenery Shop',
      directorId: 'director-stage-12',
      directorName: 'Avery Cole',
      taskStatus: 'ready' as const,
      statusLabel: 'Decision required',
      blocker: {
        kind: 'take-scheduling' as const,
        headline: 'Take ready to schedule',
        detail: 'Soundstage 12 is ready.',
      },
      attention: 'decision-required' as const,
      currentCommand: {
        kind: 'scheduleShootingTake' as const,
        productionId: 'production-stage-12',
        label: 'Schedule the shooting take',
      },
    }
    const adapter = await import('../engine/adapter.ts')
    const snapshotSpy = vi.spyOn(adapter, 'studioLotSnapshot')
    snapshotSpy.mockReturnValue({
      ...base,
      productionOperations: [fakeOperation],
      people: [],
    })
    const onProductionCommand = vi.fn()

    const { getByTestId, queryByText } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onProductionCommand={onProductionCommand}
      />,
    )

    expect(getByTestId('hollywood-current-production')).toHaveTextContent('Soundstage 12')
    expect(getByTestId('hollywood-stage-12-fallback')).toHaveTextContent('Soundstage 12 + Scenery Shop is authoritative')
    expect(queryByText(/Assign to Stage 7/i)).not.toBeInTheDocument()
    fireEvent.click(getByTestId('hollywood-production-command-scheduleShootingTake'))
    expect(onProductionCommand).toHaveBeenCalledWith(fakeOperation.currentCommand)
  })

  it('keeps a selected person and the production command in one two-film inspector context', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-two-film-selection')
    const base = studioLotSnapshot(state)
    const operationA: ProductionOperationsState = {
      productionId: 'production-a',
      title: 'Picture A',
      phase: 'shooting',
      phaseLabel: 'Shooting',
      weeksRemaining: 5,
      progress01: 3 / 8,
      locationBuildingId: 'stage-a',
      facilityLabel: 'Soundstage 7 + Scenery Shop',
      directorId: 'director-a',
      directorName: 'Director A',
      taskStatus: 'unassigned',
      statusLabel: 'Decision required',
      blocker: {
        kind: 'director-dispatch',
        headline: 'Director call required',
        detail: 'Director A has not been dispatched.',
      },
      attention: 'decision-required',
      currentCommand: {
        kind: 'assignShootingDirector',
        productionId: 'production-a',
        directorId: 'director-a',
        label: 'Call Director A to Soundstage 7',
      },
    }
    const operationB: ProductionOperationsState = {
      ...operationA,
      productionId: 'production-b',
      title: 'Picture B',
      locationBuildingId: 'stage-b',
      facilityLabel: 'Soundstage 12 + Scenery Shop',
      directorId: 'director-b',
      directorName: 'Director B',
      taskStatus: 'ready',
      blocker: {
        kind: 'take-scheduling',
        headline: 'Take ready to schedule',
        detail: 'Soundstage 12 is ready.',
      },
      currentCommand: {
        kind: 'scheduleShootingTake',
        productionId: 'production-b',
        label: 'Schedule Picture B shooting take',
      },
    }
    const people: LotPersonState[] = [
      {
        id: 'director-a',
        name: 'Director A',
        role: 'director',
        authority: 'active-production',
        productionId: 'production-a',
        productionTitle: 'Picture A',
      },
      {
        id: 'director-b',
        name: 'Director B',
        role: 'director',
        authority: 'active-production',
        productionId: 'production-b',
        productionTitle: 'Picture B',
      },
    ]
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue({
      ...base,
      people,
      productionOperations: [operationA, operationB],
    })
    const onProductionCommand = vi.fn()
    const { getByTestId, queryByText } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onProductionCommand={onProductionCommand}
      />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))

    expect(getByTestId('hollywood-current-production')).toHaveTextContent('Picture A')
    expect(getByTestId('hollywood-select-production-production-a')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(getByTestId('hollywood-select-production-production-b')).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    fireEvent.click(getByTestId('hollywood-select-person-director-b'))
    expect(getByTestId('hollywood-current-production')).toHaveTextContent('Picture B')
    expect(getByTestId('hollywood-production-command-scheduleShootingTake')).toHaveTextContent(
      'Schedule Picture B shooting take',
    )
    expect(latest().hollywoodPeopleSelected).toContain('director-b')
    expect(getByTestId('hollywood-select-production-production-b')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(getByTestId('hollywood-select-person-director-b')).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    act(() => {
      latest().opts.onHollywoodPlace?.({
        id: 'stage-7',
        buildingId: 'stage-a',
        label: 'Soundstage 7',
        affordances: ['shooting'],
      })
    })
    expect(queryByText('Soundstage 7')).toBeInTheDocument()
    expect(queryByText(/Director B · attached to Picture B/i)).not.toBeInTheDocument()
    expect(queryByText('Schedule Picture B shooting take')).not.toBeInTheDocument()
    expect(queryByText(/Soundstage 12 .* authoritative/i)).not.toBeInTheDocument()
    expect(queryByText(/^TASK$/)).not.toBeInTheDocument()
    expect(getByTestId('hollywood-select-person-director-b')).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(latest().hollywoodPersonClears).toBe(1)

    fireEvent.click(getByTestId('hollywood-select-production-production-a'))
    expect(getByTestId('hollywood-current-production')).toHaveTextContent('Picture A')
    expect(getByTestId('hollywood-production-command-assignShootingDirector')).toHaveTextContent(
      'Call Director A to Soundstage 7',
    )
    expect(queryByText(/Director B · attached to Picture B/i)).not.toBeInTheDocument()
    expect(queryByText(/^Affordances: shooting$/i)).not.toBeInTheDocument()
    expect(latest().hollywoodPersonClears).toBe(1)
    expect(latest().hollywoodPlaceClears).toBeGreaterThan(0)
    expect(getByTestId('hollywood-select-production-production-a')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(getByTestId('hollywood-select-person-director-b')).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})

describe('StudioLotScreen — authoritative D-17B publicity offer', () => {
  it('renders the exact current Whisper offer, availability, and both cooldowns', () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-offer')
    const offer = publicityDecision(state).find((candidate) => candidate.tier === 'whisper')!

    const { getByTestId } = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} onStateChange={() => {}} />,
    )

    const button = getByTestId('hollywood-publicity-whisper')
    const status = getByTestId('hollywood-publicity-whisper-status')
    expect(button).toHaveTextContent(moneyExact(offer.cost))
    expect(button).toHaveTextContent(`+${offer.expectedLift.toFixed(2)} awareness`)
    expect(button).toBeEnabled()
    expect(status).toHaveTextContent('Available now.')
    expect(status).toHaveTextContent(`Global cooldown: ${offer.globalCooldownWeeks} weeks`)
    expect(status).toHaveTextContent(`Whisper cooldown: ${offer.cooldownWeeks} weeks`)
  })

  it('replaces state only after success and preserves exact cash, awareness, ledger, and cooldown accounting', async () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-success')
    const before = JSON.stringify(state)
    const offer = publicityDecision(state).find((candidate) => candidate.tier === 'whisper')!
    let replacement: GameState | undefined

    const { getByTestId, rerender } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onStateChange={(next) => { replacement = next }}
      />,
    )
    fireEvent.click(getByTestId('hollywood-publicity-whisper'))

    expect(replacement).toBeDefined()
    const next = replacement!
    expect(next).not.toBe(state)
    expect(next.studio.cash).toBe(state.studio.cash - offer.cost)
    expect(next.studio.standing.audienceAwareness).toBeCloseTo(
      state.studio.standing.audienceAwareness + offer.expectedLift,
      12,
    )
    expect(next.ledger.at(-1)).toEqual({
      week: state.market.tick,
      kind: 'publicity',
      amount: -offer.cost,
      note: 'publicity: whisper',
    })
    expect(next.publicity.lastUsedWeek).toBe(state.market.tick)
    expect(next.publicity.byTier.whisper).toBe(state.market.tick)
    expect(JSON.stringify(state)).toBe(before)

    const cooldownOffer = publicityDecision(next).find((candidate) => candidate.tier === 'whisper')!
    expect(cooldownOffer.available).toBe(false)
    expect(cooldownOffer.availableWeek).toBe(state.market.tick + offer.cooldownWeeks)

    rerender(
      <StudioLotScreen
        state={next}
        onNavigate={() => {}}
        onExit={() => {}}
        onStateChange={(updated) => { replacement = updated }}
      />,
    )
    await waitFor(() => expect(getByTestId('hollywood-publicity-whisper')).toBeDisabled())
    expect(getByTestId('hollywood-publicity-whisper-status')).toHaveTextContent(cooldownOffer.reason!)
  })

  it('shows an authoritative rejection and cannot replace or mutate state', () => {
    setOperationHollywoodOverride(true)
    const founded = foundStudio('hollywood-publicity-rejected')
    const state: GameState = {
      ...founded,
      studio: { ...founded.studio, cash: 0 },
    }
    const before = JSON.stringify(state)
    const offer = publicityDecision(state).find((candidate) => candidate.tier === 'whisper')!
    const rejected = runPublicity(state, 'whisper')
    const onStateChange = vi.fn()

    expect(offer.available).toBe(false)
    expect(offer.reason).toBeTruthy()
    expect(rejected.ok).toBe(false)

    const { getByTestId } = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} onStateChange={onStateChange} />,
    )
    const button = getByTestId('hollywood-publicity-whisper')
    expect(button).toBeDisabled()
    expect(getByTestId('hollywood-publicity-whisper-status')).toHaveTextContent(offer.reason!)
    fireEvent.click(button)

    expect(onStateChange).not.toHaveBeenCalled()
    expect(JSON.stringify(state)).toBe(before)
  })
})
