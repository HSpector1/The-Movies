// ── Gate D1: StudioLotScreen host lifecycle + component tests ─────────────────
// jsdom has no WebGL, so the Phaser view is mocked with a spy. These prove the host
// contract: the renderer is created once and destroyed on unmount, fed new snapshots,
// paused/resumed with tab visibility, driven by reduced-motion, and that navigation
// emits routes only (never mutating GameState). The companion navigation is asserted
// as the accessible, keyboard-operable backbone.

import { useState, type ComponentProps } from 'react'
import { act, cleanup, fireEvent, render, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
} from '../../../src/core/index.ts'
import type { CreativeRole, GameState } from '../../../src/core/index.ts'
import {
  exportSaveJson,
  advanceWeek,
  productionDecision,
  publicityDecision,
  runProductionCommand,
  runPublicity,
  startDevelopmentCastingAnnexAction,
  studioLotSnapshot,
} from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'
import {
  setOperationHollywoodOverride,
  setStudioLotIdentityOverride,
  setStudioLotSoundstageProofOverride,
} from '../flags.ts'
import { StudioLotScreen as StudioLotScreenImpl } from './StudioLotScreen.tsx'
import type { LotRoute } from './navigation.ts'
import type {
  BuildingId,
  LotPersonState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'
import {
  getLotSelectedBuilding,
  resetLotSelectedBuilding,
  setLotSelectedBuilding,
} from './snapshot/selectedBuildingSession.ts'
import type { HollywoodProductionSelection } from './hollywood/HollywoodScene.ts'
import type { LotPublicityResult, LotPublicityTier } from './snapshot/publicityCampaign.ts'

type TestStudioLotScreenProps = Omit<
  ComponentProps<typeof StudioLotScreenImpl>,
  'onAdvance'
> & {
  onAdvance?: ComponentProps<typeof StudioLotScreenImpl>['onAdvance']
}

// Existing host tests predate the App-owned clock intent. Keep their setup terse while the focused
// week-advance cases below pass an explicit spy.
function StudioLotScreen({ onAdvance = () => {}, ...props }: TestStudioLotScreenProps) {
  return <StudioLotScreenImpl {...props} onAdvance={onAdvance} />
}

// A spy StudioLotView. Records construction, snapshots, lifecycle calls, and lets a
// test drive the onAction/onSelect callbacks the real view would emit.
const spy = vi.hoisted(() => {
  const instances: FakeInstance[] = []
  const controls = {
    constructError: null as Error | null,
    deferReady: false,
  }
  type Opts = {
    parent: HTMLElement
    snapshot: { selectedBuildingId: string | null; week: number }
    onAction?: (e: { buildingId: string; action: string }) => void
    onSelect?: (sel: unknown) => void
    onReady?: () => void
    onHollywoodFailure?: (reason: string) => void
    onActivity?: (text: string | null) => void
    onHollywoodPerson?: (person: unknown) => void
    onHollywoodProduction?: (production: HollywoodProductionSelection) => void
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
    cameraPresets: string[] = []
    identityModes: string[] = []
    selected: string[] = []
    publicity: Array<{ ok: boolean; detail: string }> = []
    hollywoodPeopleSelected: string[] = []
    hollywoodProductionsSelected: string[] = []
    hollywoodCompaniesSelected: string[] = []
    hollywoodCompanyClears = 0
    hollywoodPersonClears = 0
    hollywoodPlaceClears = 0
    constructor(opts: Opts) {
      if (controls.constructError !== null) throw controls.constructError
      this.opts = opts
      this.snapshots.push(opts.snapshot)
      instances.push(this)
      if (!controls.deferReady) queueMicrotask(() => opts.onReady?.())
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
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    camera(preset: string) { this.cameraPresets.push(preset) }
    showHollywoodPublicity(ok: boolean, detail: string) { this.publicity.push({ ok, detail }) }
    selectHollywoodPublicityPlace() { return true }
    focusHollywoodPlace() {}
    selectHollywoodPerson(id: string) {
      this.hollywoodPeopleSelected.push(id)
      this.heldPersonId = id
    }
    selectHollywoodProduction(id: string) {
      this.hollywoodProductionsSelected.push(id)
      this.heldProductionId = id
      this.heldPlaceId = 'stage-7'
    }
    selectHollywoodProductionCompany(id: string) {
      this.hollywoodCompaniesSelected.push(id)
      return true
    }
    clearHollywoodProductionCompanySelection() { this.hollywoodCompanyClears++ }
    selectHollywoodAnnexPlace() {
      this.heldPlaceId = 'annex-parcel'
      return true
    }
    clearHollywoodPersonSelection() {
      this.hollywoodPersonClears++
      this.heldPersonId = null
    }
    clearHollywoodPlaceSelection() {
      this.hollywoodPlaceClears++
      this.heldPlaceId = null
      this.heldProductionId = null
    }
    /**
     * C1-M5: what this double is HOLDING, modelled on the real scenes.
     *
     * The host's repaint reconciliation asks the renderer what it already has before
     * re-asserting a selection. A double that records every command but claims to hold
     * nothing is an unfaithful renderer, and it is what let a redundant second dispatch
     * look like normal traffic. The exact-call assertions below are UNCHANGED and now
     * genuinely catch a double-dispatch.
     */
    worldSelection() {
      return {
        placeId: this.heldPlaceId,
        productionId: this.heldProductionId,
        personId: this.heldPersonId,
      }
    }

    heldPlaceId: string | null = null
    heldProductionId: string | null = null
    heldPersonId: string | null = null
    destroy() { this.destroyed = true }
  }
  return { controls, instances, FakeInstance }
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

function stage7Operation(
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  return {
    productionId: 'production-stage-7',
    title: 'Stage Seven Picture',
    phase: 'shooting',
    phaseLabel: 'Shooting',
    weeksRemaining: 5,
    progress01: 3 / 8,
    locationBuildingId: 'stage-a',
    facilityLabel: 'Soundstage 7 + Scenery Shop',
    directorId: 'director-stage-7',
    directorName: 'Director Seven',
    taskStatus: 'unassigned',
    statusLabel: 'Decision required',
    blocker: {
      kind: 'director-dispatch',
      headline: 'Director call required',
      detail: 'Director Seven has not been dispatched.',
    },
    attention: 'decision-required',
    currentCommand: {
      kind: 'assignShootingDirector',
      productionId: 'production-stage-7',
      directorId: 'director-stage-7',
      label: 'Call Director Seven to Soundstage 7',
    },
    ...overrides,
  }
}

function stage12Operation(
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  return {
    productionId: 'production-stage-12',
    title: 'Stage Twelve Picture',
    phase: 'shooting',
    phaseLabel: 'Shooting',
    weeksRemaining: 5,
    progress01: 3 / 8,
    locationBuildingId: 'stage-b',
    facilityLabel: 'Soundstage 12 + Scenery Shop',
    directorId: 'director-stage-12',
    directorName: 'Director Twelve',
    taskStatus: 'ready',
    statusLabel: 'Decision required',
    blocker: {
      kind: 'take-scheduling',
      headline: 'Take ready to schedule',
      detail: 'Soundstage 12 is ready.',
    },
    attention: 'decision-required',
    currentCommand: {
      kind: 'scheduleShootingTake',
      productionId: 'production-stage-12',
      label: 'Schedule Stage Twelve Picture shooting take',
    },
    ...overrides,
  }
}

function managedOperationsSnapshot(
  base: StudioLotSnapshot,
  operations: ProductionOperationsState[],
): StudioLotSnapshot {
  return {
    ...base,
    operationsMode: 'managed',
    stageAssignmentAuthority: 'engine',
    productionOperations: operations,
    people: [],
  }
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

beforeEach(() => {
  setOperationHollywoodOverride(false)
  setStudioLotIdentityOverride(false)
  setStudioLotSoundstageProofOverride(false)
  resetLotSelectedBuilding()
})

afterEach(() => {
  // Unmount before resetting the deferred dynamic-import spy. Otherwise a view
  // resolved between hooks can be counted as the next test's renderer.
  cleanup()
  spy.controls.constructError = null
  spy.controls.deferReady = false
  spy.instances.length = 0
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  setOperationHollywoodOverride(false)
  setStudioLotIdentityOverride(false)
  setStudioLotSoundstageProofOverride(false)
  resetLotSelectedBuilding()
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

  it('pauses a lazily created renderer when the tab was already hidden before readiness', async () => {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    renderScreen()
    await waitFor(() => expect(spy.instances.length).toBe(1))
    await waitFor(() => expect(latest().paused).toBeGreaterThan(0))
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
    act(() => {
      latest().opts.onAction?.({ buildingId: 'admin', action: 'open-studio-overview' })
    })
    expect(routes).toContainEqual({ kind: 'dashboard' })
    expect(getLotSelectedBuilding()).toBe('admin')
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

  it('keeps the Hollywood Annex parcel in the live lot and opens its exact context', async () => {
    setOperationHollywoodOverride(true)
    const { routes } = renderScreen(foundManagedStudio('hollywood-annex-route'))
    await waitFor(() => expect(spy.instances.length).toBe(1))
    act(() => {
      latest().opts.onHollywoodPlace?.({
        id: 'annex-parcel',
        buildingId: 'expansion',
        label: 'Development & Casting Annex',
        affordances: ['develop-studio', 'construct-annex'],
      })
    })
    expect(routes).toEqual([])
    expect(document.querySelector('[data-testid="lot-annex-context"]')).toHaveTextContent(
      'Development & Casting Annex',
    )
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
    const dashboard = getByTestId('lot-return-dashboard')
    expect(dashboard).toHaveAccessibleName('Open Dashboard')
    fireEvent.click(dashboard)
    expect(exits()).toBe(1)
  })

  it('owns a semantic page heading and obeys canonical and selected-building entry focus', async () => {
    const canonical = render(
      <StudioLotScreen
        state={baseState}
        onNavigate={() => {}}
        onExit={() => {}}
        entryFocus="studio-home"
      />,
    )
    const heading = canonical.getByTestId('lot-studio-heading')
    expect(heading.tagName).toBe('H1')
    expect(heading).toHaveAttribute('tabindex', '-1')
    await waitFor(() => expect(heading).toHaveFocus())
    canonical.unmount()

    setLotSelectedBuilding('writers')
    const returned = render(
      <StudioLotScreen
        state={baseState}
        onNavigate={() => {}}
        onExit={() => {}}
        entryFocus="selected-building"
      />,
    )
    await waitFor(() => expect(returned.getByTestId('lot-nav-writers')).toHaveFocus())
  })

  it('fails selected-building entry focus closed to the studio heading', async () => {
    expect(getLotSelectedBuilding()).toBeNull()
    const { getByTestId } = render(
      <StudioLotScreen
        state={baseState}
        onNavigate={() => {}}
        onExit={() => {}}
        entryFocus="selected-building"
      />,
    )
    await waitFor(() => expect(getByTestId('lot-studio-heading')).toHaveFocus())
  })

  it('exposes the inner renderer preparation as one explicit polite status', () => {
    spy.controls.deferReady = true
    const { getByTestId } = renderScreen()
    const loading = getByTestId('lot-canvas-loading')
    expect(loading).toHaveAttribute('role', 'status')
    expect(loading).toHaveAttribute('aria-live', 'polite')
    expect(loading).toHaveAttribute('aria-atomic', 'true')
    expect(loading).toHaveTextContent('Preparing the lot…')
  })

  it('resets selected-building presentation memory without touching renderer or engine state', () => {
    setLotSelectedBuilding('theater')
    expect(getLotSelectedBuilding()).toBe('theater')
    resetLotSelectedBuilding()
    expect(getLotSelectedBuilding()).toBeNull()
  })
})

describe('StudioLotScreen — World-First Live Week Advance V1 host boundary', () => {
  it('exposes one native intent and contains every down-event family before Phaser', () => {
    const onAdvance = vi.fn()
    const documentPointerDown = vi.fn()
    const windowMouseDown = vi.fn()
    const windowTouchStart = vi.fn()
    document.addEventListener('pointerdown', documentPointerDown)
    window.addEventListener('mousedown', windowMouseDown)
    window.addEventListener('touchstart', windowTouchStart)
    try {
      const { getByTestId } = render(
        <StudioLotScreen
          state={baseState}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={onAdvance}
        />,
      )
      const button = getByTestId('lot-advance-week')
      expect(button.tagName).toBe('BUTTON')
      expect(button).toHaveAccessibleName('Advance one week')

      fireEvent.pointerDown(button)
      fireEvent.mouseDown(button)
      fireEvent.touchStart(button)
      expect(documentPointerDown).not.toHaveBeenCalled()
      expect(windowMouseDown).not.toHaveBeenCalled()
      expect(windowTouchStart).not.toHaveBeenCalled()

      fireEvent.click(button)
      expect(onAdvance).toHaveBeenCalledOnce()
    } finally {
      document.removeEventListener('pointerdown', documentPointerDown)
      window.removeEventListener('mousedown', windowMouseDown)
      window.removeEventListener('touchstart', windowTouchStart)
    }
  })

  it('keeps the same focused renderer host through sequential authoritative snapshots', async () => {
    function Harness() {
      const [current, setCurrent] = useState(baseState)
      const [feedback, setFeedback] = useState<{
        week: number
        constructionCompletion: null
      } | null>(null)
      return (
        <StudioLotScreen
          state={current}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => {
            const result = advanceWeek(current)
            setCurrent(result.next)
            setFeedback({ week: result.next.market.tick, constructionCompletion: null })
          }}
          advanceFeedback={feedback}
        />
      )
    }

    const { getByTestId } = render(<Harness />)
    await waitFor(() => expect(spy.instances).toHaveLength(1))
    const view = latest()
    await waitFor(() => expect(view.snapshots).toHaveLength(1))
    expect((view.snapshots[0] as { week: number }).week).toBe(0)
    const snapshotsBefore = view.snapshots.length
    const button = getByTestId('lot-advance-week')
    button.focus()

    // PF1-M3 VOICE PASS re-pin (charter §3), applied to every week-notice assertion in this
    // file: the copy is "Week N on the lot." since M2 promoted the region to visible. Same
    // element, same role/aria-live/aria-atomic/testid, same one-announcement-per-advance
    // contract — only the wording moved.
    fireEvent.click(button)
    await waitFor(() => expect(getByTestId('lot-week-update-announcement')).toHaveTextContent(
      'Week 1 on the lot.',
    ))
    expect(getByTestId('lot-advance-week')).toBe(button)
    expect(button).toHaveFocus()
    expect(spy.instances).toHaveLength(1)
    expect(view.destroyed).toBe(false)
    expect(view.cameraPresets).toEqual([])
    expect(view.snapshots).toHaveLength(snapshotsBefore + 1)
    expect((view.snapshots.at(-1) as { week: number }).week).toBe(1)

    fireEvent.click(button)
    await waitFor(() => expect(getByTestId('lot-week-update-announcement')).toHaveTextContent(
      'Week 2 on the lot.',
    ))
    expect((view.snapshots.at(-1) as { week: number }).week).toBe(2)
    expect(spy.instances).toHaveLength(1)
    expect(view.destroyed).toBe(false)
  })

  it('feeds the latest post-tick snapshot when renderer readiness arrives late', async () => {
    spy.controls.deferReady = true
    function Harness() {
      const [current, setCurrent] = useState(baseState)
      return (
        <StudioLotScreen
          state={current}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => setCurrent(advanceWeek(current).next)}
        />
      )
    }

    const { getByTestId } = render(<Harness />)
    await waitFor(() => expect(spy.instances).toHaveLength(1))
    const view = latest()
    expect(view.snapshots.map((snapshot) => (snapshot as { week: number }).week)).toEqual([0])
    fireEvent.click(getByTestId('lot-advance-week'))
    await waitFor(() =>
      expect(view.snapshots.map((snapshot) => (snapshot as { week: number }).week)).toEqual([0, 1]),
    )

    act(() => view.opts.onReady?.())
    await waitFor(() =>
      expect(view.snapshots.map((snapshot) => (snapshot as { week: number }).week)).toEqual([0, 1]),
    )
    expect(spy.instances).toHaveLength(1)
    expect(view.destroyed).toBe(false)
  })

  it('records a scheduled Stage 7 take only after the authoritative weekly result', async () => {
    setOperationHollywoodOverride(true)
    let scheduled = advance(greenlightFilm(foundManagedStudio('lot-week-stage-7-recording')), 4)
    const productionId = scheduled.studio.activeProductions[0]!.id
    // P05A W1: two commands — the Director call settles due-at-call load-in.
    for (let i = 0; i < 2; i++) {
      const command = studioLotSnapshot(scheduled).productionOperations?.find(
        (operation) => operation.productionId === productionId,
      )?.currentCommand
      if (!command) throw new Error(`expected Stage 7 command ${String(i + 1)}`)
      const result = runProductionCommand(scheduled, command)
      if (!result.ok) throw new Error(result.error)
      scheduled = result.next
    }
    expect(studioLotSnapshot(scheduled).productionOperations?.[0]?.taskStatus).toBe('scheduled')
    const expected = advanceWeek(scheduled).next

    function Harness() {
      const [current, setCurrent] = useState(scheduled)
      const [feedback, setFeedback] = useState<{
        week: number
        constructionCompletion: null
      } | null>(null)
      return (
        <StudioLotScreen
          state={current}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => {
            const result = advanceWeek(current)
            setCurrent(result.next)
            setFeedback({ week: result.next.market.tick, constructionCompletion: null })
          }}
          advanceFeedback={feedback}
        />
      )
    }

    const { getByTestId } = render(<Harness />)
    expect(getByTestId(`hollywood-task-status-${productionId}`)).toHaveTextContent('scheduled')
    fireEvent.click(getByTestId('lot-advance-week'))
    await waitFor(() => expect(getByTestId(`hollywood-task-status-${productionId}`)).toHaveTextContent(
      'Shooting beat completed',
    ))
    await waitFor(() => expect((latest().snapshots.at(-1) as { week: number }).week).toBe(
      expected.market.tick,
    ))
  })

  it('gives exact construction completion sole focus and suppresses duplicate Operational copy', async () => {
    let state = foundManagedStudio('lot-week-advance-completion')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 12; i++) state = advanceWeek(state).next
    const completed = advanceWeek(state)
    if (!completed.constructionCompletion) throw new Error('expected Annex completion')
    setLotSelectedBuilding('writers')

    const { getByTestId, queryByTestId, rerender } = render(
      <StudioLotScreen
        state={completed.next}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        advanceFeedback={{
          week: completed.next.market.tick,
          constructionCompletion: completed.constructionCompletion,
        }}
        entryFocus="selected-building"
      />,
    )
    const notice = getByTestId('annex-completion-summary')
    await waitFor(() => expect(notice).toHaveFocus())
    expect(getByTestId('lot-week-update-announcement')).toHaveTextContent('')
    expect(getByTestId('lot-annex-operational-announcement')).toHaveTextContent('')

    const following = advanceWeek(completed.next)
    rerender(
      <StudioLotScreen
        state={following.next}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        advanceFeedback={{
          week: following.next.market.tick,
          constructionCompletion: following.constructionCompletion,
        }}
        entryFocus="selected-building"
      />,
    )
    expect(queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
    expect(getByTestId('lot-week-update-announcement')).toHaveTextContent(
      `Week ${following.next.market.tick} on the lot.`,
    )
    expect(getByTestId('lot-annex-operational-announcement')).toHaveTextContent('')
  })

  // ── C2a-M4: the completion card can be put down, and only THIS one ──────────
  //
  // The card is absolutely positioned over the middle of the world at z-index 18 and
  // deliberately swallows world input, so with no close control the building that just
  // finished stood on top of the buildings the player wanted to click next. Two browser
  // journeys measured exactly that. The dismissal is keyed by the completion's own
  // identity, which is the half worth a unit test: putting down one building's card must
  // never silence the next building's.
  it('dismisses the construction card, and a LATER completion still announces itself', async () => {
    let state = foundManagedStudio('lot-completion-dismiss')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 12; i++) state = advanceWeek(state).next
    const completed = advanceWeek(state)
    if (!completed.constructionCompletion) throw new Error('expected Annex completion')

    const { getByTestId, queryByTestId, rerender } = render(
      <StudioLotScreen
        state={completed.next}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        advanceFeedback={{
          week: completed.next.market.tick,
          constructionCompletion: completed.constructionCompletion,
        }}
        entryFocus="selected-building"
      />,
    )
    expect(getByTestId('annex-completion-summary')).toBeInTheDocument()
    fireEvent.click(getByTestId('lot-event-notice-dismiss'))
    expect(queryByTestId('annex-completion-summary')).not.toBeInTheDocument()

    // A re-render carrying the SAME completion keeps it down — dismissing is a decision
    // about a building, not a one-frame flicker.
    rerender(
      <StudioLotScreen
        state={completed.next}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        advanceFeedback={{
          week: completed.next.market.tick,
          constructionCompletion: completed.constructionCompletion,
        }}
        entryFocus="selected-building"
      />,
    )
    expect(queryByTestId('annex-completion-summary')).not.toBeInTheDocument()

    // …and a DIFFERENT building finishing is a different announcement, which the
    // dismissal of the first may not swallow.
    const secondCompletion = {
      ...completed.constructionCompletion,
      projectId: `${completed.constructionCompletion.projectId}-second`,
      completedWeek: completed.constructionCompletion.completedWeek + 4,
    }
    rerender(
      <StudioLotScreen
        state={completed.next}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        advanceFeedback={{
          week: completed.next.market.tick,
          constructionCompletion: secondCompletion,
        }}
        entryFocus="selected-building"
      />,
    )
    expect(getByTestId('annex-completion-summary')).toBeInTheDocument()
  })

  it('suppresses Operational on the immediate deep return, then restores it on a fresh mount', async () => {
    let state = foundManagedStudio('lot-week-advance-return-suppression')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = started.next
    for (let i = 0; i < 13; i++) state = advanceWeek(state).next

    const immediate = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        entryFocus="advance-week"
        suppressOperationalAnnouncement
      />,
    )
    await waitFor(() => expect(immediate.getByTestId('lot-advance-week')).toHaveFocus())
    expect(immediate.getByTestId('lot-annex-operational-announcement')).toHaveTextContent('')
    immediate.unmount()

    const fresh = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
      />,
    )
    await waitFor(() => expect(fresh.getByTestId('lot-annex-operational-announcement')).toHaveTextContent(
      'Development & Casting Annex is Operational.',
    ))
  })

  it('keeps the semantic advance path when renderer construction fails', async () => {
    spy.controls.constructError = new Error('intentional renderer construction rejection')
    const onAdvance = vi.fn()
    const { findByTestId, getByTestId } = render(
      <StudioLotScreen
        state={baseState}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={onAdvance}
      />,
    )
    await findByTestId('lot-canvas-fallback')
    fireEvent.click(getByTestId('lot-advance-week'))
    expect(onAdvance).toHaveBeenCalledOnce()
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
    // P05A W1: the Director call settles the due-at-call load-in inside its own
    // transaction — the successor control is the take schedule, never a clear.
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

  it('shows an honestly idle managed studio — its OWN employees, no fabricated film, person, or task', () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-managed-idle')

    const { getByTestId, queryByText, getByRole } = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} />,
    )

    // First Movie Journey Wave 1: the desk no longer claims an idle lot with no verb. It
    // names the studio's first picture and the one step that starts it. What "honestly
    // idle" still means — no fabricated film, person or task — is asserted below.
    expect(getByTestId('hollywood-production-idle')).toHaveTextContent('PICTURE JOURNEY')
    expect(getByTestId('hollywood-production-idle')).toHaveTextContent('PICTURE 1')
    expect(getByTestId('lot-picture-guidance-title')).toHaveTextContent('No picture yet')
    expect(queryByText(/Violet Hour/i)).not.toBeInTheDocument()
    expect(queryByText(/Mara Voss/i)).not.toBeInTheDocument()
    expect(queryByText(/Take 12/i)).not.toBeInTheDocument()
    // Tycoon World M1.5: an idle studio still HAS staff, and they are on the lot. Every
    // name in the group is a real contracted employee — never an invented inhabitant.
    const people = getByRole('group', { name: 'Named studio people' })
    const contractedNames = new Set(
      state.contracts.map(
        (contract) => state.talent.find((person) => person.id === contract.talentId)!.name,
      ),
    )
    const shown = within(people)
      .getAllByRole('button')
      .map((button) => button.querySelector('span')?.textContent ?? '')
    expect(shown.length).toBeGreaterThan(0)
    expect(shown.every((name) => contractedNames.has(name))).toBe(true)
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

  it('selects and focuses the exact Stage 7 operation from a world event when Stage 12 is first', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-world-stage-7-exact')
    const stage7 = stage7Operation()
    const stage12 = stage12Operation()
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue(
      managedOperationsSnapshot(studioLotSnapshot(state), [stage12, stage7]),
    )
    const onProductionCommand = vi.fn()
    const routes: LotRoute[] = []

    const { getByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={(route) => routes.push(route)}
        onExit={() => {}}
        onProductionCommand={onProductionCommand}
      />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))

    // Establish a hostile prior context. Array order and prior UI selection both point
    // at Stage 12, but the physical Stage 7 identity must win.
    fireEvent.click(getByTestId(`hollywood-select-production-${stage12.productionId}`))
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage12.title)

    act(() => {
      latest().opts.onHollywoodProduction?.({
        productionId: stage7.productionId,
        locationBuildingId: 'stage-a',
      })
    })

    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage7.title)
    expect(getByTestId('hollywood-production-blocker')).toHaveTextContent(stage7.blocker!.headline)
    const command = getByTestId(`hollywood-production-command-${stage7.currentCommand!.kind}`)
    expect(command).toHaveTextContent(stage7.currentCommand!.label)
    await waitFor(() => expect(command).toHaveFocus())
    expect(latest().hollywoodProductionsSelected).toEqual([stage7.productionId])

    fireEvent.click(command)
    expect(onProductionCommand).toHaveBeenCalledOnce()
    expect(onProductionCommand).toHaveBeenCalledWith(stage7.currentCommand)
    expect(routes).toEqual([])
  })

  it('dispatches the field-exact Production Board command and yields a byte-identical outcome', async () => {
    setOperationHollywoodOverride(true)
    const state = advance(greenlightFilm(foundManagedStudio('hollywood-world-board-parity')), 4)
    const lotOperation = studioLotSnapshot(state).productionOperations!.find(
      (operation) => operation.locationBuildingId === 'stage-a',
    )!
    const boardCommand = productionDecision(state)!.command!
    expect(lotOperation.currentCommand).toEqual(boardCommand)
    const expected = runProductionCommand(state, boardCommand)
    let worldOutcome: ReturnType<typeof runProductionCommand> | undefined
    const onProductionCommand = vi.fn((command) => {
      worldOutcome = runProductionCommand(state, command)
      return worldOutcome
    })

    const { getByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onProductionCommand={onProductionCommand}
      />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))
    act(() => {
      latest().opts.onHollywoodProduction?.({
        productionId: lotOperation.productionId,
        locationBuildingId: 'stage-a',
      })
    })
    fireEvent.click(getByTestId(`hollywood-production-command-${boardCommand.kind}`))

    expect(onProductionCommand).toHaveBeenCalledOnce()
    expect(onProductionCommand).toHaveBeenCalledWith(boardCommand)
    expect(JSON.stringify(worldOutcome)).toBe(JSON.stringify(expected))
  })

  it('revalidates a production event against the latest full managed and engine predicate', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-world-latest-authority')
    const stage7 = stage7Operation()
    const stage12 = stage12Operation()
    const base = studioLotSnapshot(state)
    let current = managedOperationsSnapshot(base, [stage12, stage7])
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockImplementation(() => current)

    const renderProps = () => (
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} />
    )
    const { getByTestId, rerender } = render(renderProps())
    await waitFor(() => expect(spy.instances).toHaveLength(1))
    fireEvent.click(getByTestId(`hollywood-select-production-${stage12.productionId}`))
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage12.title)

    const emitStage7 = () => {
      act(() => {
        latest().opts.onHollywoodProduction?.({
          productionId: stage7.productionId,
          locationBuildingId: 'stage-a',
        })
      })
    }

    // Deliberately malformed combinations prove the host checks both provenance arms
    // at event time. The same valid production ID is not enough.
    current = {
      ...current,
      operationsMode: 'legacy',
      stageAssignmentAuthority: 'engine',
    } as unknown as StudioLotSnapshot
    rerender(renderProps())
    emitStage7()
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage12.title)

    current = {
      ...current,
      operationsMode: 'managed',
      stageAssignmentAuthority: 'presentation',
    } as unknown as StudioLotSnapshot
    rerender(renderProps())
    emitStage7()
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage12.title)

    current = managedOperationsSnapshot(base, [stage12, stage7])
    rerender(renderProps())
    emitStage7()
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage7.title)
  })

  it('fails closed when an explicitly selected production disappears from the latest snapshot', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-world-stale-explicit-selection')
    const stage7 = stage7Operation()
    const stage12 = stage12Operation()
    const base = studioLotSnapshot(state)
    let current = managedOperationsSnapshot(base, [stage12, stage7])
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockImplementation(() => current)
    const renderProps = () => (
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} />
    )
    const { getByTestId, queryByTestId, queryByText, rerender } = render(renderProps())
    await waitFor(() => expect(spy.instances).toHaveLength(1))

    act(() => {
      latest().opts.onHollywoodProduction?.({
        productionId: stage7.productionId,
        locationBuildingId: 'stage-a',
      })
    })
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage7.title)

    current = managedOperationsSnapshot(base, [stage12])
    rerender(renderProps())
    await waitFor(() => expect(getByTestId('hollywood-production-idle')).toBeInTheDocument())
    expect(queryByText(stage12.title)).not.toBeInTheDocument()
    expect(queryByTestId(`hollywood-production-command-${stage12.currentCommand!.kind}`)).not.toBeInTheDocument()

    // A late event for the removed identity cannot reopen it or fall through to Stage 12.
    act(() => {
      latest().opts.onHollywoodProduction?.({
        productionId: stage7.productionId,
        locationBuildingId: 'stage-a',
      })
    })
    expect(getByTestId('hollywood-production-idle')).toBeInTheDocument()
    expect(queryByText(stage12.title)).not.toBeInTheDocument()
  })

  it('preserves legacy two-production default and exact list selection outside the Stage 7 seam', async () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-world-legacy-list-compatibility')
    const first = stage12Operation({ productionId: 'legacy-first', title: 'Legacy First' })
    const second = stage7Operation({ productionId: 'legacy-second', title: 'Legacy Second' })
    const base = studioLotSnapshot(state)
    const legacy = {
      ...base,
      operationsMode: 'legacy',
      stageAssignmentAuthority: 'presentation',
      productionOperations: [first, second],
      people: [],
    } as StudioLotSnapshot
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue(legacy)

    const { getByTestId } = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))

    expect(getByTestId('hollywood-current-production')).toHaveTextContent(first.title)
    fireEvent.click(getByTestId(`hollywood-select-production-${second.productionId}`))
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(second.title)
  })

  // ── C2a-M4, THE PM RULING (M3 checkpoint) — D1-B RE-BASE ─────────────────
  //
  // "The Soundstage-7-sealed scenery/take affordances WIDEN to N stages in M4 —
  // the Movie #2 gate demands production blocking be legible on every stage the
  // player builds." The two tests below pinned the OLD narrowness: a picture on
  // Soundstage 12 got no command control and no selection, because the world's
  // detail context was Soundstage 7's alone.
  //
  // The successors assert the ruling. Soundstage 7 keeps PRECEDENCE — the world
  // never borrows Stage 12's picture while Stage 7 has one, and every Stage-7
  // assertion in these suites is untouched — but a stage that is one of this
  // studio's stages and is the only one speaking is now heard.
  it('C2a-M4: with no Stage 7 operation, the studio’s OTHER stage is heard', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-world-no-stage-7-default')
    const stage12 = stage12Operation()
    const post = stage7Operation({
      productionId: 'production-post',
      title: 'Post Picture',
      locationBuildingId: 'post',
      facilityLabel: 'Post Building',
    })
    const base = studioLotSnapshot(state)
    let current = managedOperationsSnapshot(base, [post, stage12])
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockImplementation(() => current)
    const renderProps = () => (
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} />
    )
    const { getByTestId, queryByTestId, rerender } = render(renderProps())
    await waitFor(() => expect(spy.instances).toHaveLength(1))

    // A picture in POST is not on a stage at all, so it still gets no stage
    // affordance — the widening is to STAGES, not to every room.
    expect(queryByTestId(`hollywood-production-command-${post.currentCommand!.kind}`)).not.toBeInTheDocument()
    // Stage 12 IS one of this studio's stages, and it is the only one speaking.
    expect(getByTestId(`hollywood-production-command-${stage12.currentCommand!.kind}`)).toBeInTheDocument()

    // Array order changes nothing: the resolution is by stage, not by position.
    current = managedOperationsSnapshot(base, [stage12, post])
    rerender(renderProps())
    expect(getByTestId(`hollywood-production-command-${stage12.currentCommand!.kind}`)).toBeInTheDocument()

    fireEvent.click(getByTestId(`hollywood-select-production-${stage12.productionId}`))
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage12.title)
  })

  it('gives the Stage 7 blocker and companion Stage A button equivalent in-lot selection', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-world-semantic-parity')
    const stage7 = stage7Operation()
    const stage12 = stage12Operation()
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue(
      managedOperationsSnapshot(studioLotSnapshot(state), [stage12, stage7]),
    )
    const routes: LotRoute[] = []
    const saveBefore = exportSaveJson(state)
    const rngBefore = state.rngState
    const { getByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={(route) => routes.push(route)}
        onExit={() => {}}
        onProductionCommand={() => undefined}
      />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))

    const blocker = getByTestId('hollywood-production-blocker')
    expect(blocker.tagName).toBe('BUTTON')
    expect(blocker).toHaveAttribute('data-world-problem', 'stage-7')
    fireEvent.click(blocker)
    const command = getByTestId(`hollywood-production-command-${stage7.currentCommand!.kind}`)
    await waitFor(() => expect(command).toHaveFocus())
    expect(latest().hollywoodProductionsSelected).toEqual([stage7.productionId])
    expect(routes).toEqual([])

    fireEvent.click(getByTestId(`hollywood-select-production-${stage12.productionId}`))
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage12.title)
    fireEvent.click(getByTestId('lot-nav-stage-a'))
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage7.title)
    await waitFor(() => expect(command).toHaveFocus())
    expect(latest().hollywoodProductionsSelected).toEqual([
      stage7.productionId,
      stage7.productionId,
    ])
    expect(getByTestId('lot-nav-stage-a')).toHaveAttribute('aria-current', 'true')
    expect(routes).toEqual([])
    expect(spy.instances).toHaveLength(1)
    expect(exportSaveJson(state)).toBe(saveBefore)
    expect(state.rngState).toBe(rngBefore)
  })

  it('keeps complete SaveFileV11 and RNG bytes through camera and reduced-motion controls', async () => {
    setOperationHollywoodOverride(true)
    setStudioLotIdentityOverride(true)
    setStudioLotSoundstageProofOverride(true)
    const state = foundManagedStudio('hollywood-world-presentation-neutrality')
    const saveBefore = exportSaveJson(state)
    const rngBefore = state.rngState

    const { getByTestId } = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))
    fireEvent.click(getByTestId('lot-review-reduced'))
    fireEvent.click(getByTestId('lot-review-closer'))

    await waitFor(() => expect(latest().reduced).toContain(true))
    await waitFor(() => expect(latest().cameraPresets).toContain('production'))
    expect(exportSaveJson(state)).toBe(saveBefore)
    expect(state.rngState).toBe(rngBefore)
  })

  it('contains overlay mouse, touch, and pointer downs so Phaser cannot steal a world command', async () => {
    setOperationHollywoodOverride(true)
    setStudioLotIdentityOverride(true)
    setStudioLotSoundstageProofOverride(true)
    const state = foundManagedStudio('hollywood-world-overlay-pointer-boundary')
    const stage7 = stage7Operation()
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue(
      managedOperationsSnapshot(studioLotSnapshot(state), [stage7]),
    )
    const onProductionCommand = vi.fn().mockReturnValue({ ok: true as const, next: state })
    const documentPointerDown = vi.fn()
    const windowMouseDown = vi.fn()
    const windowTouchStart = vi.fn()
    document.addEventListener('pointerdown', documentPointerDown)
    window.addEventListener('mousedown', windowMouseDown)
    window.addEventListener('touchstart', windowTouchStart)
    try {
      const { getByTestId } = render(
        <StudioLotScreen
          state={state}
          onNavigate={() => {}}
          onExit={() => {}}
          onProductionCommand={onProductionCommand}
        />,
      )
      await waitFor(() => expect(spy.instances).toHaveLength(1))

      const command = getByTestId(`hollywood-production-command-${stage7.currentCommand!.kind}`)
      fireEvent.pointerDown(command)
      fireEvent.mouseDown(command)
      fireEvent.touchStart(command)
      const closerReview = getByTestId('lot-review-closer')
      fireEvent.pointerDown(closerReview)
      fireEvent.mouseDown(closerReview)
      fireEvent.touchStart(closerReview)
      expect(documentPointerDown).not.toHaveBeenCalled()
      expect(windowMouseDown).not.toHaveBeenCalled()
      expect(windowTouchStart).not.toHaveBeenCalled()
      fireEvent.click(command)
      expect(onProductionCommand).toHaveBeenCalledOnce()
      expect(onProductionCommand).toHaveBeenCalledWith(stage7.currentCommand)
    } finally {
      document.removeEventListener('pointerdown', documentPointerDown)
      window.removeEventListener('mousedown', windowMouseDown)
      window.removeEventListener('touchstart', windowTouchStart)
    }
  })

  it('C2a-M4: a Stage 12 blocker becomes the same live control Stage 7’s always was', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-world-stage-12-non-selection')
    const stage12 = stage12Operation()
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue(
      managedOperationsSnapshot(studioLotSnapshot(state), [stage12]),
    )
    const { getByTestId } = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))

    // RE-BASED, and the reason is the ruling: this picture is on one of the
    // studio's own soundstages, and production blocking must be legible — and
    // actionable — on every stage the player has. The copy is still the engine's;
    // what changed is that it is now a control rather than a sentence.
    const blocker = getByTestId('hollywood-production-blocker')
    expect(blocker.tagName).toBe('BUTTON')
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage12.title)
    expect(getByTestId(`hollywood-production-command-${stage12.currentCommand!.kind}`)).toHaveTextContent(
      stage12.currentCommand!.label,
    )
  })

  it('handles a rejected command once, preserves exact live error and selection, and clears stale focus', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-world-command-rejection')
    const before = JSON.stringify(state)
    const stage7 = stage7Operation()
    const base = studioLotSnapshot(state)
    let current = managedOperationsSnapshot(base, [stage7])
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockImplementation(() => current)
    const exactError = 'applyActions: scenery load-in changed before command dispatch'
    const onProductionCommand = vi.fn(() => ({ ok: false as const, error: exactError }))
    const renderProps = () => (
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onProductionCommand={onProductionCommand}
      />
    )
    const { getByTestId, getByText, rerender } = render(renderProps())
    await waitFor(() => expect(spy.instances).toHaveLength(1))
    act(() => {
      latest().opts.onHollywoodProduction?.({
        productionId: stage7.productionId,
        locationBuildingId: 'stage-a',
      })
    })
    const command = getByTestId(`hollywood-production-command-${stage7.currentCommand!.kind}`)
    await waitFor(() => expect(command).toHaveFocus())

    fireEvent.click(command)
    expect(onProductionCommand).toHaveBeenCalledOnce()
    expect(onProductionCommand).toHaveBeenCalledWith(stage7.currentCommand)
    const liveError = getByText(`Production command blocked: ${exactError}`)
    const liveOwner = getByTestId('hollywood-activity-announcement')
    expect(liveOwner).toHaveAttribute('role', 'status')
    expect(liveOwner).toHaveAttribute('aria-live', 'polite')
    expect(liveError.parentElement).toBe(liveOwner)
    expect(liveError.textContent).toBe(`Production command blocked: ${exactError}`)
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage7.title)
    expect(latest().hollywoodProductionsSelected).toEqual([stage7.productionId])
    expect(JSON.stringify(state)).toBe(before)

    // If rejection left a pending production focus, a later unrelated repaint would
    // steal focus back to the command. Exact rejection must clear it immediately.
    const dashboard = getByTestId('lot-return-dashboard')
    dashboard.focus()
    current = managedOperationsSnapshot(base, [{ ...stage7 }])
    rerender(renderProps())
    await waitFor(() => expect(dashboard).toHaveFocus())
    expect(command).not.toHaveFocus()
    expect(onProductionCommand).toHaveBeenCalledOnce()
  })

  it('clears a prior command error after the next accepted engine outcome', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-world-reject-then-success')
    const stage7 = stage7Operation()
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue(
      managedOperationsSnapshot(studioLotSnapshot(state), [stage7]),
    )
    const exactError = 'stale shooting task'
    const onProductionCommand = vi.fn()
      .mockReturnValueOnce({ ok: false as const, error: exactError })
      .mockReturnValue({ ok: true as const, next: state })
    const { getByTestId, getByText, queryByText } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onProductionCommand={onProductionCommand}
      />,
    )

    const command = getByTestId(`hollywood-production-command-${stage7.currentCommand!.kind}`)
    fireEvent.click(command)
    expect(getByText(`Production command blocked: ${exactError}`)).toBeInTheDocument()

    fireEvent.click(command)
    expect(onProductionCommand).toHaveBeenCalledTimes(2)
    expect(queryByText(`Production command blocked: ${exactError}`)).not.toBeInTheDocument()
  })

  it('retains the semantic Stage 7 command path when renderer construction fails', async () => {
    setOperationHollywoodOverride(true)
    const state = foundManagedStudio('hollywood-world-renderer-failure')
    const stage7 = stage7Operation()
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockReturnValue(
      managedOperationsSnapshot(studioLotSnapshot(state), [stage7]),
    )
    spy.controls.constructError = new Error('forced renderer boot failure')
    const onProductionCommand = vi.fn()
    const routes: LotRoute[] = []
    const { getByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={(route) => routes.push(route)}
        onExit={() => {}}
        onProductionCommand={onProductionCommand}
      />,
    )

    await waitFor(() => expect(getByTestId('lot-canvas-fallback')).toBeInTheDocument())
    expect(spy.instances).toHaveLength(0)
    fireEvent.click(getByTestId('lot-nav-stage-a'))
    const command = getByTestId(`hollywood-production-command-${stage7.currentCommand!.kind}`)
    await waitFor(() => expect(command).toHaveFocus())
    fireEvent.click(command)
    expect(onProductionCommand).toHaveBeenCalledOnce()
    expect(onProductionCommand).toHaveBeenCalledWith(stage7.currentCommand)
    expect(getByTestId('hollywood-current-production')).toHaveTextContent(stage7.title)
    expect(routes).toEqual([])
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
      leadId: 'lead-a',
      leadName: 'Lead A',
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
      leadId: 'lead-b',
      leadName: 'Lead B',
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
    expect(latest().hollywoodPersonClears).toBeGreaterThan(0)

    fireEvent.click(getByTestId('hollywood-select-production-production-a'))
    expect(getByTestId('hollywood-current-production')).toHaveTextContent('Picture A')
    expect(getByTestId('hollywood-production-command-assignShootingDirector')).toHaveTextContent(
      'Call Director A to Soundstage 7',
    )
    expect(queryByText(/Director B · attached to Picture B/i)).not.toBeInTheDocument()
    expect(queryByText(/^Affordances: shooting$/i)).not.toBeInTheDocument()
    expect(latest().hollywoodPersonClears).toBeGreaterThan(0)
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

  it('keeps all six exact company members selectable while only the assigned Director owns the call', async () => {
    setOperationHollywoodOverride(true)
    let state = greenlightFilm(foundManagedStudio('hollywood-complete-company'))
    let snapshot = studioLotSnapshot(state)
    for (let week = 0; week < 8; week++) {
      const command = snapshot.productionOperations?.[0]?.currentCommand
      if (command?.kind === 'assignShootingDirector') break
      state = tick(state)
      snapshot = studioLotSnapshot(state)
    }
    const operation = snapshot.productionOperations![0]!
    expect(operation.currentCommand?.kind).toBe('assignShootingDirector')
    expect(operation.companyMembers).toHaveLength(6)

    const onOpenTalentProfile = vi.fn()
    const view = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onOpenTalentProfile={onOpenTalentProfile}
      />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))

    const labels = [
      'Writer',
      'Director',
      'Lead actor',
      'Antagonist',
      'Supporting actor',
      'Production/Craft Lead',
    ]
    expect(operation.companyMembers!.map((member) =>
      view.getByTestId(`hollywood-select-person-${member.talentId}`).getAttribute('aria-label'),
    )).toEqual(labels.map((label, index) =>
      `${operation.companyMembers![index]!.name} · ${label} · ${operation.title}`,
    ))

    const writer = operation.companyMembers!.find((member) => member.productionRole === 'writer')!
    fireEvent.click(view.getByTestId(`hollywood-select-person-${writer.talentId}`))
    expect(view.getByTestId('hollywood-person-work-facts')).toHaveTextContent(
      `Role on picture${labels[0]}`,
    )
    expect(view.getByTestId('hollywood-person-work-facts')).toHaveTextContent(operation.title)
    expect(view.queryByTestId('hollywood-production-command-assignShootingDirector')).not.toBeInTheDocument()
    fireEvent.click(view.getByTestId(`hollywood-open-talent-profile-${writer.talentId}`))
    expect(onOpenTalentProfile).toHaveBeenCalledWith(writer.talentId)

    const director = operation.companyMembers!.find(
      (member) => member.productionRole === 'director',
    )!
    fireEvent.click(view.getByTestId(`hollywood-select-person-${director.talentId}`))
    expect(view.getByTestId('hollywood-person-work-facts')).toHaveTextContent(
      'Role on pictureDirector',
    )
    expect(view.getByTestId('hollywood-production-command-assignShootingDirector')).toHaveTextContent(
      operation.currentCommand!.label,
    )
    await waitFor(() => expect(latest().hollywoodCompaniesSelected).toContain(operation.productionId))

    const clearsBeforePublicity = latest().hollywoodCompanyClears
    fireEvent.click(view.getByTestId('lot-nav-admin'))
    expect(view.getByTestId('hollywood-publicity-context')).toBeInTheDocument()
    await waitFor(() =>
      expect(latest().hollywoodCompanyClears).toBeGreaterThan(clearsBeforePublicity),
    )
    expect(view.container.querySelectorAll('.hollywood-people .company-active')).toHaveLength(0)

    fireEvent.click(view.getByTestId(`hollywood-select-person-${director.talentId}`))
    await waitFor(() =>
      expect(view.container.querySelectorAll('.hollywood-people .company-active')).toHaveLength(6),
    )
    const clearsBeforePlace = latest().hollywoodCompanyClears
    act(() => {
      latest().opts.onHollywoodPlace?.({
        id: 'backlot-workshop',
        buildingId: 'writers',
        label: 'Backlot workshop',
        affordances: ['work'],
      })
    })
    await waitFor(() =>
      expect(latest().hollywoodCompanyClears).toBeGreaterThan(clearsBeforePlace),
    )
    expect(view.container.querySelectorAll('.hollywood-people .company-active')).toHaveLength(0)
  })

  it('clears semantic and physical person ownership when a company identity becomes duplicated', async () => {
    setOperationHollywoodOverride(true)
    const state = greenlightFilm(foundManagedStudio('hollywood-company-duplicate-replacement'))
    let projected = studioLotSnapshot(state)
    const selected = projected.productionOperations?.[0]?.companyMembers?.[0]
    if (!selected) throw new Error('expected one projected company member')
    const adapter = await import('../engine/adapter.ts')
    vi.spyOn(adapter, 'studioLotSnapshot').mockImplementation(() => projected)

    const view = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))
    fireEvent.click(view.getByTestId(`hollywood-select-person-${selected.talentId}`))
    expect(view.getByTestId('hollywood-person-work-facts')).toBeInTheDocument()
    const clearsBefore = latest().hollywoodPersonClears

    const selectedPerson = projected.people.find((person) => person.id === selected.talentId)!
    projected = {
      ...projected,
      people: [
        ...projected.people,
        { ...selectedPerson, name: 'Hostile duplicate identity' },
      ],
    }
    view.rerender(
      <StudioLotScreen state={{ ...state }} onNavigate={() => {}} onExit={() => {}} />,
    )

    await waitFor(() =>
      expect(view.queryByTestId(`hollywood-select-person-${selected.talentId}`)).not.toBeInTheDocument(),
    )
    expect(view.queryByTestId('hollywood-person-work-facts')).not.toBeInTheDocument()
    expect(latest().hollywoodPersonClears).toBeGreaterThan(clearsBefore)
  })
})

describe('StudioLotScreen — world-first D-17B publicity campaign', () => {
  it('gives the exact physical polygon and semantic Administration companion one context, while hostile identity fails closed', async () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-entry-parity')
    const { getByTestId, queryByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onRunPublicity={() => ({ ok: false, error: 'not dispatched in entry test' })}
      />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))

    act(() => {
      latest().opts.onHollywoodPlace?.({
        id: 'publicity',
        buildingId: 'admin',
        label: 'Administration & Publicity',
        affordances: ['work', 'meeting', 'publicity'],
      })
    })
    expect(getByTestId('hollywood-publicity-context')).toBeInTheDocument()
    expect(getByTestId('hollywood-publicity-offers')).toBeInTheDocument()

    act(() => {
      latest().opts.onHollywoodPlace?.({
        id: 'publicity',
        buildingId: 'admin',
        label: 'Wrong office',
        affordances: ['work', 'meeting', 'publicity'],
      })
    })
    expect(queryByTestId('hollywood-publicity-offers')).not.toBeInTheDocument()

    fireEvent.click(getByTestId('lot-nav-admin'))
    expect(getByTestId('hollywood-publicity-offers')).toBeInTheDocument()
  })

  it('retains the complete semantic campaign when the renderer is unavailable and makes no physical claim', async () => {
    setOperationHollywoodOverride(true)
    spy.controls.constructError = new Error('forced publicity renderer failure')
    const state = foundStudio('hollywood-publicity-renderer-failure')
    const { getByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onRunPublicity={() => ({ ok: false, error: 'not dispatched in fallback test' })}
      />,
    )
    await waitFor(() => expect(getByTestId('lot-canvas-fallback')).toBeInTheDocument())

    fireEvent.click(getByTestId('lot-nav-admin'))
    expect(getByTestId('hollywood-publicity-offers')).toBeInTheDocument()
    expect(getByTestId('hollywood-publicity-physical-status')).toHaveTextContent(
      'physical office is unavailable',
    )
    expect(getByTestId('hollywood-publicity-run-whisper')).toBeEnabled()
    expect(getByTestId('hollywood-publicity-run-push')).toBeEnabled()
    expect(getByTestId('hollywood-publicity-run-blitz')).toBeEnabled()
  })

  it('converts an asynchronous Hollywood boot/runtime failure into the explicit semantic fallback', async () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-async-renderer-failure')
    const { getByTestId, queryByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onRunPublicity={() => ({ ok: false, error: 'not exercised' })}
      />,
    )
    await waitFor(() => expect(spy.instances).toHaveLength(1))
    fireEvent.click(getByTestId('lot-nav-admin'))
    await waitFor(() => expect(getByTestId('hollywood-publicity-physical-status')).toHaveTextContent(
      'Selected in the living lot',
    ))

    act(() => spy.instances[0]!.opts.onHollywoodFailure?.('manifest-invalid'))

    await waitFor(() => expect(getByTestId('lot-canvas-fallback')).toBeInTheDocument())
    expect(getByTestId('hollywood-publicity-context')).toBeInTheDocument()
    expect(getByTestId('hollywood-publicity-physical-status')).toHaveTextContent(
      'physical office is unavailable',
    )
    expect(getByTestId('hollywood-publicity-run-whisper')).toBeEnabled()

    act(() => spy.instances[0]!.opts.onReady?.())

    await waitFor(() => expect(queryByTestId('lot-canvas-fallback')).not.toBeInTheDocument())
    expect(getByTestId('hollywood-publicity-physical-status')).toHaveTextContent(
      'Selected in the living lot',
    )
  })

  it('rejects the second click of one native double-click gesture even when the first owner rejection clears pending synchronously', () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-double-click')
    const onRunPublicity = vi.fn<(
      tier: LotPublicityTier,
    ) => LotPublicityResult>(() => ({
      ok: false,
      error: 'applyActions: publicity rejected — exact owner rejection (D-17B §2)',
    }))
    const { getByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onRunPublicity={onRunPublicity}
      />,
    )
    fireEvent.click(getByTestId('lot-nav-admin'))
    const button = getByTestId('hollywood-publicity-run-whisper')
    fireEvent.click(button, { detail: 1 })
    fireEvent.click(button, { detail: 2 })

    expect(onRunPublicity).toHaveBeenCalledTimes(1)
    expect(getByTestId('hollywood-activity-message')).toHaveTextContent(
      'Publicity blocked: exact owner rejection',
    )
    expect(spy.instances.flatMap((instance) => instance.publicity)).toHaveLength(0)
  })

  it('keeps every tier synchronously guarded while an accepted receipt waits for fresh parent truth', () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-pending-parent')
    const onRunPublicity = vi.fn<(
      tier: LotPublicityTier,
    ) => LotPublicityResult>((tier) => ({ ok: true, tier, acceptedWeek: state.market.tick }))
    const { getByTestId, queryByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onRunPublicity={onRunPublicity}
      />,
    )
    fireEvent.click(getByTestId('lot-nav-admin'))
    fireEvent.click(getByTestId('hollywood-publicity-run-whisper'))
    fireEvent.click(getByTestId('hollywood-publicity-run-push'))

    expect(onRunPublicity).toHaveBeenCalledTimes(1)
    expect(getByTestId('hollywood-publicity-run-whisper')).toBeDisabled()
    expect(getByTestId('hollywood-publicity-run-push')).toBeDisabled()
    expect(getByTestId('hollywood-publicity-run-blitz')).toBeDisabled()
    expect(getByTestId('hollywood-publicity-open-dashboard')).toBeDisabled()
    expect(queryByTestId('hollywood-activity-message')).not.toBeInTheDocument()
    expect(spy.instances.flatMap((instance) => instance.publicity)).toHaveLength(0)
  })

  it.each(['tier', 'week'] as const)(
    'clears semantic and physical campaign selection when an accepted receipt names the wrong %s',
    async (mismatch) => {
      setOperationHollywoodOverride(true)
      const state = foundStudio(`hollywood-publicity-hostile-${mismatch}-receipt`)
      const before = JSON.stringify(state)
      const onRunPublicity = vi.fn<(
        tier: LotPublicityTier,
      ) => LotPublicityResult>(() => ({
        ok: true,
        tier: mismatch === 'tier' ? 'push' : 'whisper',
        acceptedWeek: mismatch === 'week' ? state.market.tick + 1 : state.market.tick,
      }))
      const { getAllByTestId, getByTestId, queryByTestId } = render(
        <StudioLotScreen
          state={state}
          onNavigate={() => {}}
          onExit={() => {}}
          onRunPublicity={onRunPublicity}
        />,
      )
      await waitFor(() => expect(spy.instances).toHaveLength(1))
      fireEvent.click(getByTestId('lot-nav-admin'))
      const physicalClearsBeforeReceipt = latest().hollywoodPlaceClears

      fireEvent.click(getByTestId('hollywood-publicity-run-whisper'))

      expect(onRunPublicity).toHaveBeenCalledOnce()
      expect(queryByTestId('hollywood-publicity-context')).not.toBeInTheDocument()
      expect(queryByTestId('hollywood-publicity-offers')).not.toBeInTheDocument()
      expect(getByTestId('lot-nav-admin')).not.toHaveAttribute('aria-current')
      expect(latest().hollywoodPlaceClears).toBe(physicalClearsBeforeReceipt + 1)
      expect(latest().publicity).toHaveLength(0)
      expect(getAllByTestId('hollywood-activity-message')).toHaveLength(1)
      expect(getByTestId('hollywood-activity-message')).toHaveTextContent(
        'Publicity acceptance receipt did not match the selected offer.',
      )
      await waitFor(() => expect(getByTestId('lot-studio-heading')).toHaveFocus())
      expect(JSON.stringify(state)).toBe(before)
    },
  )

  it('keeps campaign controls out of unrelated contexts, then renders all three exact offers from Administration', async () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-offers')
    const offers = publicityDecision(state)
    const onRunPublicity = vi.fn<(
      tier: LotPublicityTier,
    ) => LotPublicityResult>()

    const { getByTestId, queryByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onRunPublicity={onRunPublicity}
      />,
    )

    expect(queryByTestId('hollywood-publicity-offers')).not.toBeInTheDocument()
    fireEvent.click(getByTestId('lot-nav-admin'))

    expect(getByTestId('hollywood-publicity-offers')).toBeInTheDocument()
    for (const offer of offers) {
      const card = getByTestId(`hollywood-publicity-${offer.tier}`)
      expect(card).toHaveTextContent(moneyExact(offer.cost))
      expect(card).toHaveTextContent(`+${offer.expectedLift.toFixed(2)}`)
      expect(card).toHaveTextContent(`${offer.cooldownWeeks} weeks`)
      expect(card).toHaveTextContent(`${offer.globalCooldownWeeks} weeks`)
      expect(getByTestId(`hollywood-publicity-run-${offer.tier}`)).toBeEnabled()
    }
    await waitFor(() => expect(getByTestId('hollywood-publicity-physical-status')).toHaveTextContent(
      'Selected in the living lot',
    ))
  })

  it('names the presentation-owner boundary when an Engine-available offer has no host action', () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-owner-absent')
    const { getByTestId } = render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} />,
    )
    fireEvent.click(getByTestId('lot-nav-admin'))

    expect(getByTestId('hollywood-publicity-run-whisper')).toBeDisabled()
    expect(getByTestId('hollywood-publicity-whisper-offer-status')).toHaveTextContent(
      'this host has no publicity action owner',
    )
  })

  it('accepts once through the Lot-safe owner, then repaints exact successor accounting and all-tier cooldown truth', async () => {
    setOperationHollywoodOverride(true)
    const initial = foundStudio('hollywood-publicity-success')
    const before = JSON.stringify(initial)
    const offer = publicityDecision(initial).find((candidate) => candidate.tier === 'whisper')!
    const ownerCalls: LotPublicityTier[] = []
    let replacement: GameState | undefined

    function Harness() {
      const [current, setCurrent] = useState(initial)
      const onRunPublicity = (tier: LotPublicityTier): LotPublicityResult => {
        ownerCalls.push(tier)
        const result = runPublicity(current, tier)
        if (!result.ok) return result
        replacement = result.next
        setCurrent(result.next)
        return { ok: true, tier, acceptedWeek: current.market.tick }
      }
      return (
        <StudioLotScreen
          state={current}
          onNavigate={() => {}}
          onExit={() => {}}
          onRunPublicity={onRunPublicity}
        />
      )
    }

    const { getByTestId } = render(<Harness />)
    fireEvent.click(getByTestId('lot-nav-admin'))
    await waitFor(() => expect(getByTestId('hollywood-publicity-physical-status')).toHaveTextContent(
      'Selected in the living lot',
    ))
    fireEvent.click(getByTestId('hollywood-publicity-run-whisper'))
    fireEvent.click(getByTestId('hollywood-publicity-run-push'), { detail: 2 })

    await waitFor(() => expect(replacement).toBeDefined())
    const next = replacement!
    expect(ownerCalls).toEqual(['whisper'])
    expect(next.studio.cash).toBe(initial.studio.cash - offer.cost)
    expect(next.studio.standing.audienceAwareness).toBeCloseTo(
      initial.studio.standing.audienceAwareness + offer.expectedLift,
      12,
    )
    expect(next.ledger.at(-1)).toEqual({
      week: initial.market.tick,
      kind: 'publicity',
      amount: -offer.cost,
      note: 'publicity: whisper',
    })
    expect(next.ledger.at(-1)).not.toHaveProperty('productionId')
    expect(next.publicity.lastUsedWeek).toBe(initial.market.tick)
    expect(next.publicity.byTier.whisper).toBe(initial.market.tick)
    expect(JSON.stringify(initial)).toBe(before)

    await waitFor(() => {
      expect(getByTestId('hollywood-publicity-run-whisper')).toBeDisabled()
      expect(getByTestId('hollywood-publicity-run-push')).toBeDisabled()
      expect(getByTestId('hollywood-publicity-run-blitz')).toBeDisabled()
    })
    await waitFor(() => expect(getByTestId('hollywood-activity-message')).toHaveTextContent(
      'Whisper publicity accepted',
    ))
    expect(latest().publicity).toHaveLength(1)
  })

  it.each(['whisper', 'push', 'blitz'] as const)(
    'produces the byte-exact existing Engine successor for an independent %s Lot purchase',
    async (tier) => {
      setOperationHollywoodOverride(true)
      const initial = foundStudio(`hollywood-publicity-tier-${tier}`)
      const direct = runPublicity(initial, tier)
      if (!direct.ok) throw new Error(direct.error)
      let replacement: GameState | undefined

      function Harness() {
        const [current, setCurrent] = useState(initial)
        const onRunPublicity = (selectedTier: LotPublicityTier): LotPublicityResult => {
          const result = runPublicity(current, selectedTier)
          if (!result.ok) return result
          replacement = result.next
          setCurrent(result.next)
          return { ok: true, tier: selectedTier, acceptedWeek: current.market.tick }
        }
        return (
          <StudioLotScreen
            state={current}
            onNavigate={() => {}}
            onExit={() => {}}
            onRunPublicity={onRunPublicity}
          />
        )
      }

      const { getByTestId } = render(<Harness />)
      fireEvent.click(getByTestId('lot-nav-admin'))
      fireEvent.click(getByTestId(`hollywood-publicity-run-${tier}`))

      await waitFor(() => expect(replacement).toBeDefined())
      expect(exportSaveJson(replacement!)).toBe(exportSaveJson(direct.next))
    },
  )

  it('shows authoritative unavailability without calling an action owner or mutating state', () => {
    setOperationHollywoodOverride(true)
    const founded = foundStudio('hollywood-publicity-rejected')
    const state: GameState = {
      ...founded,
      studio: { ...founded.studio, cash: 0 },
      ledger: [
        ...founded.ledger,
        {
          week: founded.market.tick,
          kind: 'termination',
          amount: -founded.studio.cash,
          note: 'test-only cash reconciliation',
        },
      ],
    }
    const before = JSON.stringify(state)
    const offer = publicityDecision(state).find((candidate) => candidate.tier === 'whisper')!
    const onRunPublicity = vi.fn<(
      tier: LotPublicityTier,
    ) => LotPublicityResult>()

    const { getByTestId } = render(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onRunPublicity={onRunPublicity}
      />,
    )
    fireEvent.click(getByTestId('lot-nav-admin'))
    const button = getByTestId('hollywood-publicity-run-whisper')
    expect(button).toBeDisabled()
    expect(getByTestId('hollywood-publicity-whisper-offer-status')).toHaveTextContent(offer.reason!)
    fireEvent.click(button)

    expect(onRunPublicity).not.toHaveBeenCalled()
    expect(JSON.stringify(state)).toBe(before)
  })

  it('makes the complete Lot inert and blocks held/programmatic campaign actions while a profile modal is open', async () => {
    setOperationHollywoodOverride(true)
    const state = foundStudio('hollywood-publicity-modal-boundary')
    const onRunPublicity = vi.fn<(
      tier: LotPublicityTier,
    ) => LotPublicityResult>(() => ({ ok: false, error: 'test owner rejection' }))
    const onOpenPublicityDashboard = vi.fn()
    const onAdvance = vi.fn()
    const onExit = vi.fn()
    const stableNavigate = () => {}
    const screen = render(
      <StudioLotScreen
        state={state}
        onNavigate={stableNavigate}
        onExit={onExit}
        onAdvance={onAdvance}
        onOpenPublicityDashboard={onOpenPublicityDashboard}
        onRunPublicity={onRunPublicity}
      />,
    )

    fireEvent.click(screen.getByTestId('lot-nav-admin'))
    const whisper = screen.getByTestId('hollywood-publicity-run-whisper')
    fireEvent.keyDown(whisper, { key: 'Enter' })

    screen.rerender(
      <StudioLotScreen
        state={state}
        onNavigate={stableNavigate}
        onExit={onExit}
        onAdvance={onAdvance}
        onOpenPublicityDashboard={onOpenPublicityDashboard}
        onRunPublicity={onRunPublicity}
        worldInputSuspended
      />,
    )

    await waitFor(() => expect(screen.getByTestId('studio-lot-screen')).toHaveAttribute('inert'))
    expect(screen.getByTestId('lot-nav-admin')).toBeDisabled()
    expect(screen.getByTestId('lot-advance-week')).toBeDisabled()
    expect(screen.getByTestId('lot-return-dashboard')).toBeDisabled()
    expect(whisper).toBeDisabled()
    expect(screen.getByTestId('hollywood-publicity-open-dashboard')).toBeDisabled()
    expect(screen.getByTestId('hollywood-publicity-whisper-offer-status')).toHaveTextContent(
      'Close the open talent profile',
    )

    fireEvent.click(whisper)
    fireEvent.click(screen.getByTestId('hollywood-publicity-open-dashboard'))
    fireEvent.click(screen.getByTestId('lot-nav-admin'))
    fireEvent.click(screen.getByTestId('lot-advance-week'))
    fireEvent.click(screen.getByTestId('lot-return-dashboard'))
    expect(onRunPublicity).not.toHaveBeenCalled()
    expect(onOpenPublicityDashboard).not.toHaveBeenCalled()
    expect(onAdvance).not.toHaveBeenCalled()
    expect(onExit).not.toHaveBeenCalled()

    screen.rerender(
      <StudioLotScreen
        state={state}
        onNavigate={stableNavigate}
        onExit={onExit}
        onAdvance={onAdvance}
        onOpenPublicityDashboard={onOpenPublicityDashboard}
        onRunPublicity={onRunPublicity}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('studio-lot-screen')).not.toHaveAttribute('inert'))
    expect(screen.getByTestId('hollywood-publicity-run-whisper')).toBeEnabled()
    fireEvent.keyDown(screen.getByTestId('hollywood-publicity-run-whisper'), { key: 'Enter' })
    fireEvent.keyUp(screen.getByTestId('hollywood-publicity-run-whisper'), { key: 'Enter' })
    fireEvent.click(screen.getByTestId('hollywood-publicity-run-whisper'))
    expect(onRunPublicity).toHaveBeenCalledTimes(1)
  })
})
