import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActionOutcome, GameState } from '../engine/adapter.ts'
import {
  exportSaveJson,
  importSaveJson,
  runProductionCommand,
  studioLotSnapshot,
} from '../engine/adapter.ts'
import {
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import type {
  LotPersonState,
  LotProductionCommand,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'
import type { Stage7ProductionOwnerIntent } from './snapshot/stage7Production.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'

const adapterBoundary = vi.hoisted(() => ({
  transform: null as null | ((snapshot: unknown) => unknown),
}))

vi.mock('../engine/adapter.ts', async () => {
  const actual = await vi.importActual<typeof import('../engine/adapter.ts')>('../engine/adapter.ts')
  return {
    ...actual,
    studioLotSnapshot(state: Parameters<typeof actual.studioLotSnapshot>[0]) {
      const snapshot = actual.studioLotSnapshot(state)
      return (adapterBoundary.transform?.(snapshot) ?? snapshot) as ReturnType<
        typeof actual.studioLotSnapshot
      >
    },
  }
})

const renderer = vi.hoisted(() => {
  type Person = {
    id: string
    name: string
    role: 'director' | 'talent'
    authority: 'active-production' | 'studio-roster' | 'district-managed'
    productionId: string | null
    productionTitle: string | null
  }
  type Place = {
    id: string
    buildingId: string
    label: string
    affordances: string[]
  }
  type Options = {
    snapshot: unknown
    onReady?: () => void
    onHollywoodFailure?: () => void
    onHollywoodPerson?: (person: Person | null) => void
    onHollywoodPlace?: (place: Place | null) => void
    onHollywoodProduction?: (production: {
      productionId: string
      locationBuildingId: 'stage-a'
    }) => void
  }

  const controls = {
    constructError: null as Error | null,
    autoReady: true,
    productionSelectable: true,
  }
  const instances: FakeView[] = []

  class FakeView {
    readonly opts: Options
    readonly snapshots: unknown[] = []
    readonly productionSelections: string[] = []
    readonly buildingSelections: string[] = []
    destroyed = false

    constructor(opts: Options) {
      if (controls.constructError !== null) throw controls.constructError
      this.opts = opts
      this.snapshots.push(opts.snapshot)
      instances.push(this)
      if (controls.autoReady) queueMicrotask(() => opts.onReady?.())
    }

    ready() { this.opts.onReady?.() }
    fail() { this.opts.onHollywoodFailure?.() }
    emitProduction(productionId: string) {
      this.opts.onHollywoodProduction?.({ productionId, locationBuildingId: 'stage-a' })
    }
    emitPerson(person: Person | null) { this.opts.onHollywoodPerson?.(person) }
    emitPlace(place: Place | null) { this.opts.onHollywoodPlace?.(place) }
    setSnapshot(snapshot: unknown) { this.snapshots.push(snapshot) }
    select(id: string) { this.buildingSelections.push(id) }
    clearSelection() {}
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {}
    selectHollywoodPerson() {}
    selectHollywoodProduction(id: string) {
      this.productionSelections.push(id)
      return controls.productionSelectable
    }
    selectHollywoodSceneryLoadIn() { return true }
    selectHollywoodAnnexPlace() { return true }
    setInputSuspended() {}
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() {}
    showHollywoodPublicity() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    destroy() { this.destroyed = true }
  }

  return { controls, FakeView, instances }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

const BLOCKED_FIXTURE = resolve(
  process.cwd(),
  'ui/e2e/world-first-scenery-load-in-v1/week-30-nights-of-watchtower-stage-7-blocked.save.json',
)

function loadFixture(): GameState {
  const bytes = readFileSync(BLOCKED_FIXTURE, 'utf8')
  const imported = importSaveJson(bytes)
  if (!imported.ok) throw new Error(imported.error)
  if (imported.converted) throw new Error('expected native SaveFileV11 fixture')
  if (exportSaveJson(imported.state) !== bytes) throw new Error('fixture roundtrip changed')
  return imported.state
}

function stage7Operation(state: GameState): ProductionOperationsState {
  const matches = (studioLotSnapshot(state).productionOperations ?? []).filter(
    (operation) => operation.locationBuildingId === 'stage-a',
  )
  if (matches.length !== 1) throw new Error('fixture requires one Stage 7 operation')
  return matches[0]!
}

function stage12From(stage7: ProductionOperationsState): ProductionOperationsState {
  return {
    ...stage7,
    productionId: 'prod-stage-12-detail-proof',
    title: 'Stage Twelve Detail Proof',
    locationBuildingId: 'stage-b',
    facilityLabel: 'Soundstage 12 + Scenery Shop',
    currentCommand: stage7.currentCommand === null
      ? null
      : { ...stage7.currentCommand, productionId: 'prod-stage-12-detail-proof' },
  }
}

function transformOperations(
  transform: (operations: ProductionOperationsState[]) => ProductionOperationsState[],
): void {
  adapterBoundary.transform = (value) => {
    const snapshot = value as StudioLotSnapshot
    return {
      ...snapshot,
      productionOperations: transform(snapshot.productionOperations ?? []),
    }
  }
}

function renderLot(
  state: GameState,
  options: {
    onOpen?: (intent: Stage7ProductionOwnerIntent) => boolean
    worldInputSuspended?: boolean
    entryFocus?: 'stage-7-production'
    entryStage7ProductionId?: string
    onProductionCommand?: (command: LotProductionCommand) => ActionOutcome | void
  } = {},
) {
  return render(
    <StudioLotScreen
      state={state}
      onNavigate={() => {}}
      onExit={() => {}}
      onAdvance={() => {}}
      {...(options.onOpen ? { onOpenStage7ProductionDetails: options.onOpen } : {})}
      {...(options.worldInputSuspended === undefined
        ? {}
        : { worldInputSuspended: options.worldInputSuspended })}
      {...(options.entryFocus ? { entryFocus: options.entryFocus } : {})}
      {...(options.entryStage7ProductionId
        ? { entryStage7ProductionId: options.entryStage7ProductionId }
        : {})}
      {...(options.onProductionCommand
        ? { onProductionCommand: options.onProductionCommand }
        : {})}
    />,
  )
}

async function latestView(): Promise<InstanceType<typeof renderer.FakeView>> {
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  return renderer.instances[0]!
}

function detailButton(productionId: string): HTMLButtonElement {
  return screen.getByTestId(
    `hollywood-open-production-details-${productionId}`,
  ) as HTMLButtonElement
}

beforeEach(() => {
  localStorage.clear()
  resetLotStageAssignment()
  renderer.instances.length = 0
  renderer.controls.constructError = null
  renderer.controls.autoReady = true
  renderer.controls.productionSelectable = true
  adapterBoundary.transform = null
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  resetLotStageAssignment()
  renderer.instances.length = 0
  renderer.controls.constructError = null
  renderer.controls.autoReady = true
  renderer.controls.productionSelectable = true
  adapterBoundary.transform = null
  setStudioLotOverviewOverride(false)
  setOperationHollywoodOverride(false)
  vi.restoreAllMocks()
})

describe('World-First Selected Stage 7 Production Detail Handoff — Lot boundary', () => {
  it('keeps the default desk non-eligible, then exposes the exact secondary action after physical Stage 7 selection', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => true)
    renderLot(state, { onOpen: owner })
    const view = await latestView()

    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(operation.title)
    expect(screen.queryByTestId(
      `hollywood-open-production-details-${operation.productionId}`,
    )).not.toBeInTheDocument()

    act(() => view.emitProduction(operation.productionId))

    const button = detailButton(operation.productionId)
    expect(screen.getByTestId('lot-nav-stage-a')).toHaveAttribute('aria-current', 'true')
    expect(button).toHaveAccessibleName(`Open Production Board details · ${operation.title}`)
    expect(button.classList.contains('hollywood-production-details')).toBe(true)
    const inspector = screen.getByTestId('hollywood-inspector')
    const command = within(inspector).getByTestId(
      `hollywood-production-command-${operation.currentCommand?.kind ?? 'missing'}`,
    )
    expect(command.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    fireEvent.pointerDown(button)
    fireEvent.click(button, { detail: 1 })
    expect(owner).toHaveBeenCalledTimes(1)
    expect(owner).toHaveBeenCalledWith({
      productionId: operation.productionId,
      locationBuildingId: 'stage-a',
    })
  })

  it('grants the same exact context from native Stage A while renderer creation fails', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => true)
    renderer.controls.constructError = new Error('renderer rejected')
    renderLot(state, { onOpen: owner })

    expect(await screen.findByTestId('lot-canvas-fallback')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('lot-nav-stage-a'))
    const button = detailButton(operation.productionId)
    expect(screen.getByTestId('lot-nav-stage-a')).toHaveAttribute('aria-current', 'true')
    fireEvent.click(button)

    expect(owner).toHaveBeenCalledOnce()
    expect(renderer.instances).toHaveLength(0)
  })

  it('never grants detail provenance from the generic production rail or a named person', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => true)
    renderLot(state, { onOpen: owner })
    let view = await latestView()

    // A member of the exact live company remains selectable in the ordinary
    // snapshot and must clear physical Stage 7 provenance.
    act(() => view.emitProduction(operation.productionId))
    const person = studioLotSnapshot(state).people[0] as LotPersonState | undefined
    if (!person) throw new Error('fixture requires one named person')
    fireEvent.click(screen.getByTestId(`hollywood-select-person-${person.id}`))
    expect(screen.queryByText(`Open Production Board details · ${operation.title}`))
      .not.toBeInTheDocument()

    // The two-row generic production-rail hostility intentionally cannot claim
    // a complete second company. Prove that rail ownership separately rather
    // than depending on malformed company presentation to expose a person.
    cleanup()
    renderer.instances.length = 0
    transformOperations((operations) => [stage12From(operation), ...operations])
    renderLot(state, { onOpen: owner })
    view = await latestView()

    act(() => view.emitProduction(operation.productionId))
    expect(detailButton(operation.productionId)).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('hollywood-select-production-prod-stage-12-detail-proof'))
    fireEvent.click(screen.getByTestId(`hollywood-select-production-${operation.productionId}`))
    expect(screen.queryByTestId(
      `hollywood-open-production-details-${operation.productionId}`,
    )).not.toBeInTheDocument()
    expect(owner).not.toHaveBeenCalled()
  })

  it('retains world provenance through the exact blocker → load-in → schedule continuation', async () => {
    const initial = loadFixture()
    const operation = stage7Operation(initial)
    const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => true)

    function Harness() {
      const [state, setState] = useState(initial)
      return (
        <StudioLotScreen
          state={state}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => {}}
          onOpenStage7ProductionDetails={owner}
          onProductionCommand={(command) => {
            const outcome = runProductionCommand(state, command)
            if (outcome.ok) setState(outcome.next)
            return outcome
          }}
        />
      )
    }

    render(<Harness />)
    await latestView()
    fireEvent.click(await screen.findByTestId('hollywood-production-blocker'))
    fireEvent.click(screen.getByTestId('hollywood-production-command-clearSceneryLoadIn'))
    fireEvent.click(await screen.findByTestId('hollywood-production-command-scheduleShootingTake'))

    const button = await screen.findByTestId(
      `hollywood-open-production-details-${operation.productionId}`,
    )
    expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-stage7-production-heading')).toHaveTextContent(
      operation.title,
    )
    fireEvent.click(button)
    expect(owner).toHaveBeenCalledOnce()
  })

  it('rejects a gesture whose rendered title changed before click and focuses fresh Stage 7 truth', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => true)
    const rendered = renderLot(state, { onOpen: owner })
    const view = await latestView()
    act(() => view.emitProduction(operation.productionId))

    const originalButton = detailButton(operation.productionId)
    fireEvent.pointerDown(originalButton)
    transformOperations((operations) => operations.map((candidate) =>
      candidate.productionId === operation.productionId
        ? { ...candidate, title: `${candidate.title} — revised` }
        : candidate,
    ))
    rendered.rerender(
      <StudioLotScreen
        state={{ ...state }}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        onOpenStage7ProductionDetails={owner}
      />,
    )

    // Compatibility mousedown belongs to the same physical gesture and must not
    // overwrite the pointerdown token with the freshly rendered title.
    fireEvent.mouseDown(detailButton(operation.productionId))
    fireEvent.click(detailButton(operation.productionId))
    expect(owner).not.toHaveBeenCalled()
    expect(screen.getByTestId('hollywood-activity-message')).toHaveTextContent(
      'Stage 7 production changed',
    )
    await waitFor(() => expect(
      screen.getByTestId('hollywood-stage7-production-heading'),
    ).toHaveFocus())
    expect(screen.queryByTestId(
      `hollywood-open-production-details-${operation.productionId}`,
    )).not.toBeInTheDocument()
  })

  it('keeps the Lot mounted and returns focus to current truth when App rejects the handoff', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => false)
    renderLot(state, { onOpen: owner })
    const view = await latestView()
    act(() => view.emitProduction(operation.productionId))

    fireEvent.click(detailButton(operation.productionId))

    expect(owner).toHaveBeenCalledOnce()
    expect(screen.getByTestId('studio-lot-screen')).toBeInTheDocument()
    expect(screen.getByTestId('hollywood-activity-message')).toHaveTextContent(
      'Stage 7 production changed',
    )
    await waitFor(() => expect(
      screen.getByTestId('hollywood-stage7-production-heading'),
    ).toHaveFocus())
  })

  it('allows at most one owner call across double click and held-key repetition', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => true)
    renderLot(state, { onOpen: owner })
    const view = await latestView()
    act(() => view.emitProduction(operation.productionId))
    const button = detailButton(operation.productionId)

    fireEvent.keyDown(button, { key: 'Enter', repeat: false })
    fireEvent.keyDown(button, { key: 'Enter', repeat: true })
    fireEvent.click(button, { detail: 0 })
    fireEvent.click(button, { detail: 2 })

    expect(owner).toHaveBeenCalledOnce()
  })

  it('suspends a begun gesture at the modal boundary and accepts only a fresh later activation', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => true)
    const rendered = renderLot(state, { onOpen: owner })
    const view = await latestView()
    act(() => view.emitProduction(operation.productionId))
    const button = detailButton(operation.productionId)
    fireEvent.pointerDown(button)

    rendered.rerender(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        onOpenStage7ProductionDetails={owner}
        worldInputSuspended
      />,
    )
    rendered.rerender(
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        onOpenStage7ProductionDetails={owner}
      />,
    )
    // The late native click completing the pre-modal pointer gesture is consumed.
    fireEvent.click(detailButton(operation.productionId), { detail: 1 })
    expect(owner).not.toHaveBeenCalled()

    // A genuinely fresh pointer boundary remains available immediately.
    fireEvent.pointerDown(detailButton(operation.productionId))
    fireEvent.click(detailButton(operation.productionId))
    expect(owner).toHaveBeenCalledOnce()
  })

  it.each(['renderer-failure', 'delayed-ready', 'hidden-resume'] as const)(
    'cancels a begun pointer gesture across %s and requires one fresh boundary',
    async (boundary) => {
      const state = loadFixture()
      const operation = stage7Operation(state)
      const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => true)
      if (boundary === 'delayed-ready') renderer.controls.autoReady = false
      renderLot(state, { onOpen: owner })
      const view = await latestView()
      fireEvent.click(screen.getByTestId('lot-nav-stage-a'))
      const button = detailButton(operation.productionId)
      fireEvent.pointerDown(button)

      if (boundary === 'renderer-failure') {
        act(() => view.fail())
      } else if (boundary === 'delayed-ready') {
        act(() => view.ready())
      } else {
        let hidden = true
        vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
        document.dispatchEvent(new Event('visibilitychange'))
        hidden = false
        document.dispatchEvent(new Event('visibilitychange'))
      }

      fireEvent.click(detailButton(operation.productionId), { detail: 1 })
      expect(owner).not.toHaveBeenCalled()
      fireEvent.pointerDown(detailButton(operation.productionId))
      fireEvent.click(detailButton(operation.productionId))
      expect(owner).toHaveBeenCalledOnce()
    },
  )

  it('keeps a fresh virtual-AT click available after a cancelled pointer gesture', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => true)
    renderLot(state, { onOpen: owner })
    const view = await latestView()
    act(() => view.emitProduction(operation.productionId))
    const button = detailButton(operation.productionId)

    fireEvent.pointerDown(button)
    fireEvent.pointerCancel(button)
    fireEvent.click(button, { detail: 0 })

    expect(owner).toHaveBeenCalledOnce()
  })

  it('restores fresh semantic context immediately and the physical outline after delayed renderer ready', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    const owner = vi.fn((_intent: Stage7ProductionOwnerIntent) => true)
    renderer.controls.autoReady = false
    renderLot(state, {
      onOpen: owner,
      entryFocus: 'stage-7-production',
      entryStage7ProductionId: operation.productionId,
    })
    const view = await latestView()

    const heading = await screen.findByTestId('hollywood-stage7-production-heading')
    expect(heading).toHaveTextContent(operation.title)
    await waitFor(() => expect(heading).toHaveFocus())
    expect(detailButton(operation.productionId)).toBeInTheDocument()
    expect(view.productionSelections).toEqual([])

    act(() => view.ready())
    expect(view.productionSelections.length).toBeGreaterThanOrEqual(1)
    expect(new Set(view.productionSelections)).toEqual(new Set([operation.productionId]))
  })

  it('returns an invalid duplicate Stage 7 identity to neutral Lot truth without selecting a replacement', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    transformOperations((operations) => [
      ...operations,
      {
        ...operation,
        productionId: 'replacement-stage-7',
        title: 'Replacement Stage 7',
        currentCommand: operation.currentCommand === null
          ? null
          : { ...operation.currentCommand, productionId: 'replacement-stage-7' },
      },
    ])
    renderLot(state, {
      onOpen: () => true,
      entryFocus: 'stage-7-production',
      entryStage7ProductionId: operation.productionId,
    })
    const view = await latestView()

    await waitFor(() => expect(screen.getByTestId('lot-studio-heading')).toHaveFocus())
    // No production card: the desk is in its no-operation branch, which First Movie
    // Journey Wave 1 gave to picture guidance.
    expect(screen.queryByTestId('hollywood-current-production')).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-production-idle')).toContainElement(
      screen.getByTestId('lot-picture-guidance'),
    )
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent('Studio idle')
    expect(screen.getByTestId('hollywood-select-production-replacement-stage-7'))
      .toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByTestId('hollywood-open-production-details-replacement-stage-7'))
      .not.toBeInTheDocument()
    expect(view.productionSelections).toEqual([])
  })

  it('returns a relocated original plus one valid replacement to neutral truth without substitution', async () => {
    const state = loadFixture()
    const operation = stage7Operation(state)
    const replacementId = 'valid-replacement-stage-7'
    transformOperations(() => [
      {
        ...operation,
        locationBuildingId: 'stage-b',
        facilityLabel: 'Soundstage 12 + Scenery Shop',
      },
      {
        ...operation,
        productionId: replacementId,
        title: 'Valid Replacement Stage 7',
        currentCommand: operation.currentCommand === null
          ? null
          : { ...operation.currentCommand, productionId: replacementId },
      },
    ])
    renderLot(state, {
      onOpen: () => true,
      entryFocus: 'stage-7-production',
      entryStage7ProductionId: operation.productionId,
    })
    const view = await latestView()

    await waitFor(() => expect(screen.getByTestId('lot-studio-heading')).toHaveFocus())
    // No production card: the desk is in its no-operation branch, which First Movie
    // Journey Wave 1 gave to picture guidance.
    expect(screen.queryByTestId('hollywood-current-production')).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-production-idle')).toContainElement(
      screen.getByTestId('lot-picture-guidance'),
    )
    expect(screen.getByTestId(`hollywood-select-production-${replacementId}`))
      .toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByTestId(`hollywood-open-production-details-${replacementId}`))
      .not.toBeInTheDocument()
    expect(view.productionSelections).toEqual([])
  })
})
