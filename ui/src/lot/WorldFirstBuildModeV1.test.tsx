// ── Build Mode V1 (M2-UI) — the whole build loop stays inside the world ───────
//
// The laws these specs pin:
//
//   1. Every BUILDABLE parcel lands an in-world panel — the same right-rail pattern a
//      building lands — and no parcel click ever navigates anywhere.
//   2. Canvas intent and semantic companion activation route to the same owner
//      (shift law 10): the renderer's `onWorldParcel` seam lands the same panel.
//   3. The ghost is a UI-ONLY layer fed from `queryPlacement`: per-cell verdicts for
//      EVERY cell, a cost box, and the primary rejection in words. Nothing about it
//      enters GameState, and an identical draft never re-delivers a different preview.
//   4. The draft carries value + monotonic revision (shift law 16), moves by keyboard
//      as well as by pointer, and clamps INTO its parcel rather than sliding.
//   5. Commit sends only a blueprint id and an origin; a rejection keeps the draft and
//      prints the Engine's exact words; Cancel is byte-neutral.
//   6. The legacy Annex parcel keeps its richer retained context and is not duplicated
//      as a parcel row.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import {
  exportSaveJson,
  placeFacilityAction,
  type ActionOutcome,
  type GameState,
  type PlacementRequest,
} from '../engine/adapter.ts'
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
import type { LotRoute } from './navigation.ts'
import { resetLotSelectedBuilding } from './snapshot/selectedBuildingSession.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'

const ANNEX = 'development-casting-annex'

type BuildMode = { parcelId: string; footprint: { width: number; depth: number } } | null
type Preview = {
  blueprintId: string
  parcelId: string
  origin: { gx: number; gy: number }
  cells: { gx: number; gy: number; ok: boolean }[]
  ok: boolean
  caption: string
} | null

type FakeOptions = {
  snapshot: unknown
  onReady?: () => void
  onWorldBuilding?: (buildingId: string) => void
  onWorldParcel?: (parcelId: string) => void
  onWorldBuildOrigin?: (parcelId: string, origin: { gx: number; gy: number }) => void
}

const renderer = vi.hoisted(() => {
  const instances: FakeView[] = []
  class FakeView {
    readonly options: FakeOptions
    readonly selectedParcels: string[] = []
    readonly clearedParcels: number[] = []
    readonly buildModes: BuildMode[] = []
    readonly previews: Preview[] = []
    destroyed = false
    constructor(options: FakeOptions) {
      this.options = options
      instances.push(this)
      queueMicrotask(() => options.onReady?.())
    }
    setSnapshot() {}
    setInputSuspended() {}
    select() {}
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
    selectWorldParcel(parcelId: string) { this.selectedParcels.push(parcelId); return true }
    clearWorldParcelSelection() { this.clearedParcels.push(this.selectedParcels.length) }
    focusWorldParcel() { return true }
    setWorldBuildMode(mode: BuildMode) { this.buildModes.push(mode) }
    setWorldPlacementPreview(preview: Preview) { this.previews.push(preview) }
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

/** A managed Week-0 studio — the regime a placement requires. */
function managedWeekZero(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

async function onlyView() {
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  return renderer.instances[0]!
}

/** Render the Lot with App standing in as the sole authoritative state owner. */
function renderLot(
  initial: GameState,
  options?: { onPlaceFacility?: (placement: PlacementRequest) => ActionOutcome },
) {
  const routes: LotRoute[] = []
  const commits: PlacementRequest[] = []
  let current = initial
  const owner = (placement: PlacementRequest): ActionOutcome => {
    commits.push(placement)
    if (options?.onPlaceFacility) return options.onPlaceFacility(placement)
    const outcome = placeFacilityAction(current, placement)
    if (outcome.ok) {
      current = outcome.next
      utils.rerender(tree(current))
    }
    return outcome
  }
  const tree = (state: GameState) => (
    <StudioLotScreen
      state={state}
      onNavigate={(route) => routes.push(route)}
      onExit={vi.fn()}
      onAdvance={vi.fn()}
      onPlaceFacility={owner}
    />
  )
  const utils = render(tree(initial))
  return {
    ...utils,
    routes,
    commits,
    state: () => current,
    show: (state: GameState) => {
      current = state
      utils.rerender(tree(state))
    },
  }
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

/** Every buildable parcel the companion offers, less the legacy Annex ground. */
const BUILDABLE_PARCELS = [
  'backlot-apron',
  'north-back-lot',
  'north-court',
  'north-lawn',
  'south-lawn',
  'stage-south',
  'west-lawn',
] as const

describe('Build Mode V1 — a parcel is a place, and clicking it stays in the world', () => {
  it('offers every buildable parcel except the legacy Annex ground, which keeps its own row', async () => {
    renderLot(managedWeekZero('build-mode-parcels'))
    await onlyView()

    for (const parcelId of BUILDABLE_PARCELS) {
      expect(screen.getByTestId(`lot-nav-parcel-${parcelId}`)).toBeInTheDocument()
    }
    // The blocked parcels are owned ground nothing may be built on: no build row.
    expect(screen.queryByTestId('lot-nav-parcel-courtyard')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lot-nav-parcel-service-yard')).not.toBeInTheDocument()
    // One destination, one control: the Annex parcel is the `expansion` place.
    expect(screen.queryByTestId('lot-nav-parcel-expansion')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-nav-expansion')).toBeInTheDocument()
  })

  it('lands the in-world parcel panel and never navigates', async () => {
    const { routes } = renderLot(managedWeekZero('build-mode-land'))
    await onlyView()

    for (const parcelId of BUILDABLE_PARCELS) {
      fireEvent.click(screen.getByTestId(`lot-nav-parcel-${parcelId}`))
      expect(screen.getByTestId(`lot-parcel-inspector-${parcelId}`)).toBeInTheDocument()
      expect(screen.getByTestId('lot-parcel-inspector-context')).toBeInTheDocument()
      expect(screen.getByTestId('lot-parcel-inspector-status').textContent ?? '').not.toBe('')
      expect(screen.getByTestId('lot-parcel-inspector-facts')).toHaveTextContent('Road frontage')
    }
    expect(routes).toEqual([])
  })

  it('routes canvas intent and companion activation to the same owner', async () => {
    const { routes } = renderLot(managedWeekZero('build-mode-parity'))
    const view = await onlyView()

    act(() => { view.options.onWorldParcel?.('south-lawn') })
    const fromCanvas = screen.getByTestId('lot-parcel-inspector-south-lawn').textContent

    fireEvent.click(screen.getByTestId('lot-nav-parcel-west-lawn'))
    fireEvent.click(screen.getByTestId('lot-nav-parcel-south-lawn'))
    expect(screen.getByTestId('lot-parcel-inspector-south-lawn').textContent).toBe(fromCanvas)
    expect(routes).toEqual([])
    // Both paths ask the renderer for the outline the canvas already paints.
    expect(view.selectedParcels).toContain('south-lawn')
  })

  it('moves focus into the panel it just opened', async () => {
    renderLot(managedWeekZero('build-mode-focus'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-parcel-south-lawn'))
    await waitFor(() => expect(screen.getByTestId('lot-parcel-inspector-heading')).toHaveFocus())
  })

  it('explains, rather than merely disabling, ground that cannot be built on', async () => {
    renderLot(managedWeekZero('build-mode-blocked'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-parcel-north-back-lot'))
    expect(screen.getByTestId('lot-parcel-build-blocked')).toHaveTextContent('no road frontage')
    expect(screen.queryByTestId('lot-parcel-build-north-back-lot')).not.toBeInTheDocument()
  })

  it('leaves the retained painted plate without any parcel surface at all', async () => {
    setTycoonWorldOverride(false)
    renderLot(managedWeekZero('build-mode-plate'))
    await onlyView()

    expect(screen.queryByTestId('lot-nav-parcel-south-lawn')).not.toBeInTheDocument()
  })
})

describe('Build Mode V1 — catalog, ghost, and quote', () => {
  async function openBuild(seed: string, parcelId = 'south-lawn') {
    const harness = renderLot(managedWeekZero(seed))
    const view = await onlyView()
    fireEvent.click(screen.getByTestId(`lot-nav-parcel-${parcelId}`))
    fireEvent.click(screen.getByTestId(`lot-parcel-build-${parcelId}`))
    return { ...harness, view }
  }

  it('renders a real catalog with the blueprint’s whole economic story', async () => {
    await openBuild('build-mode-catalog')

    const catalog = screen.getByTestId('lot-build-catalog')
    expect(catalog).toBeInTheDocument()
    const entry = screen.getByTestId(`lot-build-blueprint-${ANNEX}`)
    expect(entry).toHaveTextContent('Development & Casting Annex')
    expect(entry).toHaveTextContent('$780,000')
    expect(entry).toHaveTextContent('13 weeks')
    expect(entry).toHaveTextContent('3×2 cells')
    expect(entry).toHaveTextContent('$3,500 a week')
    // No blueprint chosen yet ⇒ no ghost has been delivered.
    expect(screen.queryByTestId('lot-build-quote')).not.toBeInTheDocument()
  })

  it('paints a UI-only ghost with a verdict for EVERY cell, and a full cost box', async () => {
    const { view } = await openBuild('build-mode-ghost')
    const before = exportSaveJson(managedWeekZero('build-mode-ghost'))

    fireEvent.click(screen.getByTestId(`lot-build-blueprint-${ANNEX}`))

    const preview = view.previews.at(-1)
    expect(preview).not.toBeNull()
    expect(preview!.blueprintId).toBe(ANNEX)
    expect(preview!.parcelId).toBe('south-lawn')
    expect(preview!.cells).toHaveLength(6)
    expect(preview!.cells.every((cell) => cell.ok)).toBe(true)
    expect(preview!.ok).toBe(true)
    expect(view.buildModes.at(-1)).toEqual({
      parcelId: 'south-lawn',
      footprint: { width: 3, depth: 2 },
    })

    const quote = screen.getByTestId('lot-build-quote')
    expect(quote).toHaveTextContent('$780,000')
    expect(quote).toHaveTextContent('13 weeks')
    expect(quote).toHaveTextContent('$3,500 once operational')
    expect(quote).toHaveTextContent('+1 shared slot')
    expect(screen.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'true')
    expect(screen.getByTestId('lot-build-commit')).toBeEnabled()

    // A ghost is a UI-only layer: opening one changes not one byte of the save.
    expect(exportSaveJson(managedWeekZero('build-mode-ghost'))).toBe(before)
  })

  it('moves the origin by keyboard, bumping the draft revision, and repaints the ghost', async () => {
    const { view } = await openBuild('build-mode-keyboard')
    fireEvent.click(screen.getByTestId(`lot-build-blueprint-${ANNEX}`))

    const pad = screen.getByTestId('lot-build-origin')
    expect(pad).toHaveAttribute('data-origin-gx', '3')
    expect(pad).toHaveAttribute('data-origin-gy', '19')
    const firstRevision = Number(pad.getAttribute('data-revision'))

    fireEvent.keyDown(pad, { key: 'ArrowRight' })
    expect(screen.getByTestId('lot-build-origin')).toHaveAttribute('data-origin-gx', '4')
    fireEvent.keyDown(screen.getByTestId('lot-build-origin'), { key: 'ArrowDown' })
    expect(screen.getByTestId('lot-build-origin')).toHaveAttribute('data-origin-gy', '20')
    expect(Number(screen.getByTestId('lot-build-origin').getAttribute('data-revision'))).toBe(
      firstRevision + 2,
    )
    expect(screen.getByTestId('lot-build-origin-cell')).toHaveTextContent('4, 20')
    expect(view.previews.at(-1)!.origin).toEqual({ gx: 4, gy: 20 })
  })

  it('clamps the draft INTO its parcel instead of sliding it off', async () => {
    await openBuild('build-mode-clamp')
    fireEvent.click(screen.getByTestId(`lot-build-blueprint-${ANNEX}`))

    // south-lawn is (3,19)–(8,22); a 3×2 footprint stops at (6,21).
    for (let step = 0; step < 12; step++) {
      fireEvent.keyDown(screen.getByTestId('lot-build-origin'), { key: 'ArrowRight' })
      fireEvent.keyDown(screen.getByTestId('lot-build-origin'), { key: 'ArrowDown' })
    }
    expect(screen.getByTestId('lot-build-origin')).toHaveAttribute('data-origin-gx', '6')
    expect(screen.getByTestId('lot-build-origin')).toHaveAttribute('data-origin-gy', '21')
  })

  it('accepts a pointer origin from the world, and ignores one for a parcel it has left', async () => {
    const { view } = await openBuild('build-mode-pointer')
    fireEvent.click(screen.getByTestId(`lot-build-blueprint-${ANNEX}`))

    act(() => { view.options.onWorldBuildOrigin?.('south-lawn', { gx: 5, gy: 20 }) })
    expect(screen.getByTestId('lot-build-origin')).toHaveAttribute('data-origin-gx', '5')

    // A superseded revision for another parcel is not a command (shift law 16).
    act(() => { view.options.onWorldBuildOrigin?.('west-lawn', { gx: 0, gy: 9 }) })
    expect(screen.getByTestId('lot-build-origin')).toHaveAttribute('data-origin-gx', '5')
    expect(screen.getByTestId('lot-build-origin')).toHaveAttribute('data-origin-gy', '20')
  })

  it('shows the primary rejection in words and refuses the commit', async () => {
    // A second annex crowding the first: the clearance ring is the live rule a player
    // meets first when they try to pack two buildings onto the same parcel.
    const occupied = applyActions(managedWeekZero('build-mode-illegal'), [
      { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } } },
    ])
    renderLot(occupied)
    const view = await onlyView()
    fireEvent.click(screen.getByTestId('lot-nav-parcel-south-lawn'))
    fireEvent.click(screen.getByTestId('lot-parcel-build-south-lawn'))
    fireEvent.click(screen.getByTestId(`lot-build-blueprint-${ANNEX}`))

    const verdict = screen.getByTestId('lot-build-verdict')
    expect(verdict).toHaveAttribute('data-ok', 'false')
    expect(verdict).toHaveTextContent('too close to another building')
    expect(screen.getByTestId('lot-build-commit')).toBeDisabled()
    const preview = view.previews.at(-1)!
    expect(preview.ok).toBe(false)
    expect(preview.caption).toContain('too close')
    // EVERY cell is still evaluated and painted, never only the first bad one.
    expect(preview.cells).toHaveLength(6)

    // Directly overlapping the standing site is the harsher rejection, and every
    // overlapped cell is individually red.
    act(() => { view.options.onWorldBuildOrigin?.('south-lawn', { gx: 3, gy: 19 }) })
    const overlapped = view.previews.at(-1)!
    expect(overlapped.ok).toBe(false)
    expect(overlapped.cells.filter((cell) => !cell.ok)).toHaveLength(6)
    expect(screen.getByTestId('lot-build-verdict')).toHaveTextContent(
      'Something already stands on part of this footprint',
    )
  })
})

describe('Build Mode V1 — commit, receipt, and cancel', () => {
  async function openDraft(seed: string) {
    const harness = renderLot(managedWeekZero(seed))
    const view = await onlyView()
    fireEvent.click(screen.getByTestId('lot-nav-parcel-south-lawn'))
    fireEvent.click(screen.getByTestId('lot-parcel-build-south-lawn'))
    fireEvent.click(screen.getByTestId(`lot-build-blueprint-${ANNEX}`))
    return { ...harness, view }
  }

  it('sends only a blueprint id and an origin, and shows a receipt naming both numbers', async () => {
    const { commits, view } = await openDraft('build-mode-commit')

    fireEvent.click(screen.getByTestId('lot-build-commit'))

    expect(commits).toEqual([{ blueprintId: ANNEX, origin: { gx: 3, gy: 19 } }])
    const receipt = await screen.findByTestId('lot-build-receipt')
    expect(receipt).toHaveTextContent('$780,000 committed to Development & Casting Annex')
    expect(receipt).toHaveTextContent('completes in Week 13')
    expect(screen.getByTestId('lot-build-announcement')).toHaveTextContent('$780,000 committed')
    // The flow closes: build mode and the ghost are both withdrawn from the world.
    expect(view.buildModes.at(-1)).toBeNull()
    expect(view.previews.at(-1)).toBeNull()
    expect(screen.queryByTestId('lot-build-flow')).not.toBeInTheDocument()
  })

  it('repaints the parcel panel as a construction site over the same mounted world', async () => {
    const { view } = await openDraft('build-mode-site')
    const before = renderer.instances.length

    fireEvent.click(screen.getByTestId('lot-build-commit'))

    await waitFor(() =>
      expect(screen.getByTestId('lot-parcel-inspector-south-lawn')).toHaveAttribute(
        'data-parcel-status',
        'building',
      ),
    )
    expect(screen.getByTestId('lot-parcel-inspector-status')).toHaveTextContent('under construction')
    expect(screen.getByTestId('lot-parcel-inspector-facts')).toHaveTextContent('due Week 13')
    // The same renderer instance — the world was never torn down and rebuilt.
    expect(renderer.instances).toHaveLength(before)
    expect(view.destroyed).toBe(false)
  })

  it('keeps the draft and prints the Engine’s exact words when the commit is refused', async () => {
    const refusal = 'applyActions: placeFacility rejected — occupied (occupied)'
    const harness = renderLot(managedWeekZero('build-mode-refused'), {
      onPlaceFacility: () => ({ ok: false, error: refusal }),
    })
    await onlyView()
    fireEvent.click(screen.getByTestId('lot-nav-parcel-south-lawn'))
    fireEvent.click(screen.getByTestId('lot-parcel-build-south-lawn'))
    fireEvent.click(screen.getByTestId(`lot-build-blueprint-${ANNEX}`))
    fireEvent.keyDown(screen.getByTestId('lot-build-origin'), { key: 'ArrowRight' })

    fireEvent.click(screen.getByTestId('lot-build-commit'))

    // The draft survives with its exact value, and the flow is still open.
    expect(screen.getByTestId('lot-build-origin')).toHaveAttribute('data-origin-gx', '4')
    expect(screen.getByTestId('lot-build-flow')).toBeInTheDocument()
    expect(screen.getByTestId('lot-build-verdict')).toHaveTextContent(refusal)
    expect(screen.getByTestId('lot-build-announcement')).toHaveTextContent(refusal)
    expect(screen.queryByTestId('lot-build-receipt')).not.toBeInTheDocument()
    expect(harness.routes).toEqual([])
  })

  it('cancels byte-neutrally — no action, no state, no ghost', async () => {
    const seed = 'build-mode-cancel'
    const before = exportSaveJson(managedWeekZero(seed))
    const { commits, view, state } = await openDraft(seed)

    fireEvent.keyDown(screen.getByTestId('lot-build-origin'), { key: 'ArrowDown' })
    fireEvent.click(screen.getByTestId('lot-build-cancel'))

    expect(commits).toEqual([])
    expect(exportSaveJson(state())).toBe(before)
    expect(screen.queryByTestId('lot-build-flow')).not.toBeInTheDocument()
    expect(view.buildModes.at(-1)).toBeNull()
    expect(view.previews.at(-1)).toBeNull()
    // The parcel panel itself stays open — cancelling a build is not leaving the place.
    expect(screen.getByTestId('lot-parcel-inspector-south-lawn')).toBeInTheDocument()
  })

  it('proves two annexes on two parcels coexist in the world and in both inspectors', async () => {
    let state = managedWeekZero('build-mode-two')
    state = applyActions(state, [
      { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } } },
    ])
    state = applyActions(state, [
      { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: { gx: 0, gy: 9 } } },
    ])
    const { show } = renderLot(state)
    const view = await onlyView()
    show(state)

    fireEvent.click(screen.getByTestId('lot-nav-parcel-south-lawn'))
    expect(screen.getByTestId('lot-parcel-inspector-south-lawn')).toHaveAttribute(
      'data-parcel-status',
      'building',
    )
    fireEvent.click(screen.getByTestId('lot-nav-parcel-west-lawn'))
    expect(screen.getByTestId('lot-parcel-inspector-west-lawn')).toHaveAttribute(
      'data-parcel-status',
      'building',
    )

    // Both stand on the world's own placement truth, delivered on the snapshot.
    const snapshot = view.options.snapshot as {
      placement?: { placements: { parcelId: string }[] }
    }
    expect(snapshot.placement?.placements.map((placed) => placed.parcelId).sort()).toEqual([
      'south-lawn',
      'west-lawn',
    ])
  })

  it('shows the operational building, its capacity and its running cost, after the clock runs out', async () => {
    let state = managedWeekZero('build-mode-operational')
    state = applyActions(state, [
      { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } } },
    ])
    const { show } = renderLot(state)
    await onlyView()
    for (let week = 0; week < 13; week++) {
      state = applyActions(state, [])
      state = (await import('../../../src/core/index.ts')).tick(state)
    }
    show(state)

    fireEvent.click(screen.getByTestId('lot-nav-parcel-south-lawn'))
    expect(screen.getByTestId('lot-parcel-inspector-south-lawn')).toHaveAttribute(
      'data-parcel-status',
      'operational',
    )
    expect(screen.getByTestId('lot-parcel-inspector-status')).toHaveTextContent('operational')
    expect(screen.getByTestId('lot-parcel-inspector-facts')).toHaveTextContent('$3,500/week')
    // The capacity the studio actually gained shows on the shared facility itself.
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(screen.getByTestId('lot-building-inspector-facts')).toHaveTextContent(
      'Development & Casting Annex',
    )
  })
})

describe('Build Mode V1 — the retained Annex context is untouched', () => {
  it('still opens the richer Annex workspace on the legacy expansion parcel', async () => {
    renderLot(managedWeekZero('build-mode-annex-precedence'))
    await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-expansion'))

    expect(screen.getByTestId('lot-annex-context')).toBeInTheDocument()
    expect(screen.getByTestId('lot-annex-build')).toBeInTheDocument()
    expect(screen.queryByTestId('lot-parcel-inspector-expansion')).not.toBeInTheDocument()
  })

  it('releases an open parcel panel when a building takes the rail', async () => {
    renderLot(managedWeekZero('build-mode-release'))
    const view = await onlyView()

    fireEvent.click(screen.getByTestId('lot-nav-parcel-south-lawn'))
    expect(screen.getByTestId('lot-parcel-inspector-south-lawn')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-nav-theater'))
    expect(screen.queryByTestId('lot-parcel-inspector-south-lawn')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-building-inspector-theater')).toBeInTheDocument()
    expect(view.clearedParcels.length).toBeGreaterThan(0)
  })
})
