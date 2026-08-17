// ── World Inspector Default V1 (M1.5) — no building click ever ejects ─────────
//
// Playtest 1's loudest world-first violation: an ordinary building activation fell
// through to `dispatchRoute(BUILDING_ACTION[id])`, so an idle Stage 7 threw the player
// onto the Dashboard and Casting-without-an-eligible-session threw them into the full
// Casting Room. These specs pin the replacement law:
//
//   1. In the adopted grid world NO building activation navigates. Every place lands an
//      in-world context — a richer one where one exists, the generic World Inspector
//      otherwise. The retained painted plate and the legacy lot keep their old route.
//   2. The deep screens stay reachable, but ONLY from the inspector's explicit
//      "Open <deep screen> details" secondary action.
//   3. Canvas intent and semantic companion activation route to the same owner
//      (shift law 10): the renderer's `onWorldBuilding` seam lands the same panel.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import type { GameState } from '../engine/adapter.ts'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
  clearTycoonWorldOverride,
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
  setTycoonWorldOverride,
} from '../flags.ts'
import { newFoundedGame } from '../test/founding.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import { ALL_BUILDING_IDS, type BuildingId } from './snapshot/StudioLotSnapshot.ts'
import type { LotRoute } from './navigation.ts'
import { resetLotSelectedBuilding } from './snapshot/selectedBuildingSession.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'

type FakeOptions = {
  snapshot: unknown
  onReady?: () => void
  onWorldBuilding?: (buildingId: BuildingId) => void
}

const renderer = vi.hoisted(() => {
  const instances: FakeView[] = []
  class FakeView {
    readonly options: FakeOptions
    readonly selectedBuildings: string[] = []
    /** Every bring-into-view the host asked the world for, in order. */
    readonly framed: string[] = []
    cameraResets = 0
    destroyed = false
    constructor(options: FakeOptions) {
      this.options = options
      instances.push(this)
      queueMicrotask(() => options.onReady?.())
    }
    setSnapshot() {}
    setInputSuspended() {}
    select(id: string) { this.selectedBuildings.push(id) }
    clearSelection() {}
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {}
    selectHollywoodPerson() {}
    selectHollywoodProduction() { return true }
    selectHollywoodProductionCompany() { return true }
    clearHollywoodProductionCompanySelection() {}
    selectHollywoodSceneryLoadIn() { return true }
    selectHollywoodAnnexPlace() { return true }
    selectHollywoodPublicityPlace() { return true }
    selectHollywoodGatePlace() { return true }
    focusHollywoodGate() { this.framed.push('studio-gate'); return true }
    focusHollywoodPlace(id: string) { this.framed.push(id) }
    setHollywoodGateVisitor() { return true }
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() {}
    resetCamera() { this.cameraResets++ }
    showHollywoodPublicity() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    destroy() { this.destroyed = true }
  }
  return { instances, FakeView }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

/** A managed Week-0 studio: the exact shape the Owner's playtest started from. */
function managedWeekZero(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
}

async function onlyView() {
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  return renderer.instances[0]!
}

function renderLot(state: GameState) {
  const routes: LotRoute[] = []
  const utils = render(
    <StudioLotScreen
      state={state}
      onNavigate={(route) => routes.push(route)}
      onExit={vi.fn()}
      onAdvance={vi.fn()}
    />,
  )
  return { ...utils, routes }
}

/**
 * Every place lands SOME in-world context. Richer contexts keep precedence, so this
 * accepts either the generic inspector or the exact context that outranks it.
 */
const IN_WORLD_CONTEXT_TESTIDS = [
  'lot-building-inspector-context',
  'hollywood-gate-context',
  'hollywood-publicity-context',
  'lot-annex-context',
  'hollywood-scenery-load-in-context',
  'lot-script-review-context',
  'lot-casting-review-context',
  'hollywood-inspector',
] as const

/** The exact deep route each building's explicit secondary action still reaches. */
const DEEP_ROUTE: Record<BuildingId, LotRoute> = {
  admin: { kind: 'dashboard' },
  writers: { kind: 'assembly' },
  casting: { kind: 'castingRoom' },
  'stage-a': { kind: 'dashboard' },
  'stage-b': { kind: 'dashboard' },
  post: { kind: 'dashboard' },
  theater: { kind: 'dashboard' },
  gate: { kind: 'dashboard' },
  expansion: { kind: 'studioDevelopment' },
}

beforeEach(() => {
  localStorage.clear()
  resetLotSelectedBuilding()
  resetLotStageAssignment()
  renderer.instances.length = 0
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  renderer.instances.length = 0
  clearOperationHollywoodOverride()
  clearStudioLotOverviewOverride()
  clearTycoonWorldOverride()
  resetLotSelectedBuilding()
  resetLotStageAssignment()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('World Inspector Default V1 — no building click ever ejects', () => {
  it('never navigates from any of the nine places, and always lands an in-world context', async () => {
    for (const id of ALL_BUILDING_IDS) {
      const { routes, unmount } = renderLot(managedWeekZero('world-inspector-no-eject'))
      await onlyView()

      fireEvent.click(screen.getByTestId(`lot-nav-${id}`))

      expect(routes).toEqual([])
      const landed = IN_WORLD_CONTEXT_TESTIDS.some(
        (testId) => screen.queryByTestId(testId) !== null,
      )
      expect(landed, `${id} landed no in-world context`).toBe(true)
      unmount()
      renderer.instances.length = 0
      resetLotSelectedBuilding()
    }
  })

  it('lands the generic inspector — with name, role and live status — where no richer context applies', async () => {
    const inspected: BuildingId[] = ['writers', 'casting', 'stage-a', 'stage-b', 'post', 'theater']
    for (const id of inspected) {
      const { routes, unmount } = renderLot(managedWeekZero('world-inspector-generic'))
      await onlyView()

      fireEvent.click(screen.getByTestId(`lot-nav-${id}`))

      const panel = screen.getByTestId(`lot-building-inspector-${id}`)
      expect(panel).toBeInTheDocument()
      expect(screen.getByTestId('lot-building-inspector-heading')).toBeInTheDocument()
      expect(screen.getByTestId('lot-building-inspector-status').textContent ?? '').not.toBe('')
      expect(routes).toEqual([])
      unmount()
      renderer.instances.length = 0
      resetLotSelectedBuilding()
    }
  })

  it('reaches the canonical deep screen ONLY through the explicit details action', async () => {
    for (const id of ALL_BUILDING_IDS) {
      const { routes, unmount } = renderLot(managedWeekZero('world-inspector-deep'))
      await onlyView()

      fireEvent.click(screen.getByTestId(`lot-nav-${id}`))
      expect(routes).toEqual([])
      const details = screen.queryByTestId(`lot-building-inspector-open-details-${id}`)
      if (details !== null) {
        fireEvent.click(details)
        expect(routes).toEqual([DEEP_ROUTE[id]])
      }
      unmount()
      renderer.instances.length = 0
      resetLotSelectedBuilding()
    }
  })

  it('routes canvas intent and semantic companion activation to the same owner', async () => {
    const { routes } = renderLot(managedWeekZero('world-inspector-canvas-parity'))
    const view = await onlyView()

    act(() => { view.options.onWorldBuilding?.('stage-b') })
    expect(screen.getByTestId('lot-building-inspector-stage-b')).toBeInTheDocument()
    const fromCanvas = screen.getByTestId('lot-building-inspector-stage-b').textContent

    fireEvent.click(screen.getByTestId('lot-nav-theater'))
    fireEvent.click(screen.getByTestId('lot-nav-stage-b'))
    expect(screen.getByTestId('lot-building-inspector-stage-b').textContent).toBe(fromCanvas)
    expect(routes).toEqual([])
  })

  it('prints the shared Development & Casting occupancy and the stage’s own idle truth', async () => {
    renderLot(managedWeekZero('world-inspector-facts'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(screen.getByTestId('lot-building-inspector-facts')).toHaveTextContent(
      'Development & Casting',
    )
    expect(screen.getByTestId('lot-building-inspector-facts')).toHaveTextContent('slots in use')

    fireEvent.click(screen.getByTestId('lot-nav-stage-a'))
    expect(screen.getByTestId('lot-building-inspector-stage-a')).toHaveTextContent('Soundstage 7')
    expect(screen.getByTestId('lot-building-inspector-status')).toHaveTextContent(
      'no picture is shooting here',
    )
  })

  it('moves focus into the in-world panel it just opened', async () => {
    renderLot(managedWeekZero('world-inspector-focus'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-theater'))

    await waitFor(() =>
      expect(screen.getByTestId('lot-building-inspector-heading')).toHaveFocus(),
    )
  })

  it('keeps the legacy pre-Hollywood lot on its compatibility route', async () => {
    setOperationHollywoodOverride(false)
    const { routes } = renderLot(newFoundedGame('world-inspector-legacy'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-theater'))

    expect(routes).toEqual([{ kind: 'dashboard' }])
    expect(screen.queryByTestId('lot-building-inspector-theater')).not.toBeInTheDocument()
  })

  it('leaves the retained painted plate exactly as M1 left it', async () => {
    // The plate is the adopted world's rollback path, kept untouched by the M1 KEEP
    // ruling and pinned by the browser suite. The inspector belongs to the grid world.
    setTycoonWorldOverride(false)
    const { routes } = renderLot(managedWeekZero('world-inspector-plate'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-theater'))

    expect(routes).toEqual([{ kind: 'dashboard' }])
    expect(screen.queryByTestId('lot-building-inspector-theater')).not.toBeInTheDocument()
  })
})

// ── ONE CAMERA GRAMMAR + the way back ────────────────────────────────────────
//
// The red-team finding these pin: M1.5's generic building inspectors changed the camera
// not at all, while three plate-era retained contexts (Administration/publicity, the
// Gate, the Annex) answered the same gesture by jumping to twice the whole-property fit
// — silently discarding the player's framing and stranding about a third of the studio
// off-screen, with no player-facing way back (only an undocumented `R` on an
// aria-hidden canvas). The zoom half is now impossible by construction and proven in
// `tycoon/world.test.ts`; what belongs here is the host half: the retained contexts
// still ask the world to bring their place into view, an ordinary inspector still asks
// for nothing, and the world always carries one visible control that reframes it.

describe('the camera grammar — selection frames, and the whole property is always one control away', () => {
  it('carries one always-available whole-property control that names its shortcut', async () => {
    renderLot(managedWeekZero('camera-home-present'))
    await onlyView()

    const control = await screen.findByTestId('lot-camera-home')
    expect(control).toBeInTheDocument()
    expect(control).toHaveAccessibleName('Show the whole property. Keyboard shortcut R.')
    expect(control).toHaveAttribute('aria-keyshortcuts', 'R')
    expect(control).toHaveAttribute('title', 'Show the whole property (shortcut: R)')
    // It reads as a control, not as decoration: the visible words say what it does.
    expect(control).toHaveTextContent('Whole property')
    expect(control).toBeEnabled()
  })

  it('commands the camera and NOTHING else — no navigation, no selection, no simulation', async () => {
    const { routes } = renderLot(managedWeekZero('camera-home-command'))
    const view = await onlyView()
    const control = await screen.findByTestId('lot-camera-home')
    const selectedBefore = view.selectedBuildings.length

    fireEvent.click(control)

    expect(view.cameraResets).toBe(1)
    expect(routes).toEqual([])
    expect(view.selectedBuildings).toHaveLength(selectedBefore)
    expect(view.framed).toEqual([])
  })

  it('stays available while an in-world inspector is open — that is when a player is lost', async () => {
    renderLot(managedWeekZero('camera-home-with-inspector'))
    const view = await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-stage-b'))
    expect(screen.getByTestId('lot-building-inspector-stage-b')).toBeInTheDocument()

    const control = screen.getByTestId('lot-camera-home')
    expect(control).toBeEnabled()
    fireEvent.click(control)
    expect(view.cameraResets).toBe(1)
    // …and reframing the world does not close the panel the player was reading.
    expect(screen.getByTestId('lot-building-inspector-stage-b')).toBeInTheDocument()
  })

  it('contains pointer, mouse and touch down-events on the control (law 7)', async () => {
    // Over-canvas chrome owns its own presses. The exact containment shape every other
    // world control uses, applied to the newest one.
    const parentPointer = vi.fn()
    const parentMouse = vi.fn()
    const parentTouch = vi.fn()
    render(
      <div onPointerDown={parentPointer} onMouseDown={parentMouse} onTouchStart={parentTouch}>
        <StudioLotScreen
          state={managedWeekZero('camera-home-containment')}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => {}}
        />
      </div>,
    )
    await onlyView()
    const control = await screen.findByTestId('lot-camera-home')

    fireEvent.pointerDown(control)
    fireEvent.mouseDown(control)
    fireEvent.touchStart(control)

    expect(parentPointer).not.toHaveBeenCalled()
    expect(parentMouse).not.toHaveBeenCalled()
    expect(parentTouch).not.toHaveBeenCalled()
  })

  it('keeps the retained contexts asking the world to bring their place into view', async () => {
    // The seam itself is preserved — the repair is what the SCENE does with it (a
    // glide-pan at the current zoom), never the removal of the request.
    renderLot(managedWeekZero('camera-grammar-retained'))
    const view = await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-gate'))
    await waitFor(() => expect(view.framed).toEqual(['studio-gate']))
  })

  it('never asks the world to reframe for an ORDINARY inspector — the quiet half of the grammar', async () => {
    renderLot(managedWeekZero('camera-grammar-generic'))
    const view = await onlyView()

    for (const id of ['writers', 'casting', 'stage-a', 'stage-b', 'post', 'theater'] as const) {
      fireEvent.click(screen.getByTestId(`lot-nav-${id}`))
      expect(screen.getByTestId(`lot-building-inspector-${id}`)).toBeInTheDocument()
    }

    expect(view.framed).toEqual([])
  })

  it('does not claim a shortcut the retained plate never bound', async () => {
    // `TycoonScene` and the legacy `LotScene` both bind R to the overview reset; the
    // painted plate never has. The command is offered there; the promise is not.
    setTycoonWorldOverride(false)
    renderLot(managedWeekZero('camera-home-plate'))
    const view = await onlyView()

    const control = await screen.findByTestId('lot-camera-home')
    expect(control).toHaveAccessibleName('Show the whole property')
    expect(control).not.toHaveAttribute('aria-keyshortcuts')
    fireEvent.click(control)
    expect(view.cameraResets).toBe(1)
  })
})
