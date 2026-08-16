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
    focusHollywoodGate() { return true }
    focusHollywoodPlace() {}
    setHollywoodGateVisitor() { return true }
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() {}
    resetCamera() {}
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
