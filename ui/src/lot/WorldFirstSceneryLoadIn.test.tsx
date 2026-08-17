import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActionOutcome, GameState } from '../engine/adapter.ts'
import {
  exportSaveJson,
  importSaveJson,
  productionBoard,
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
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import { ProductionBoard } from '../components/ProductionBoard.tsx'

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
  type ScenerySelection = {
    productionId: string
    locationBuildingId: 'stage-a'
    placeId: 'service-yard'
  }
  type Options = {
    snapshot: unknown
    onReady?: () => void
    onHollywoodPerson?: (person: Person | null) => void
    onHollywoodPlace?: (place: Place | null) => void
    onHollywoodProduction?: (production: {
      productionId: string
      locationBuildingId: string
    }) => void
    onHollywoodSceneryLoadIn?: (selection: ScenerySelection) => void
    onActivity?: (text: string) => void
  }

  const controls = {
    constructError: null as Error | null,
    scenerySelectable: true,
  }
  const instances: FakeView[] = []

  class FakeView {
    readonly opts: Options
    readonly snapshots: unknown[] = []
    readonly scenerySelections: string[] = []
    readonly productionSelections: string[] = []
    readonly personSelections: string[] = []
    hollywoodPlaceSelection: string | null = null
    hollywoodPlaceClears = 0
    hollywoodPersonClears = 0
    destroyed = false

    constructor(opts: Options) {
      if (controls.constructError !== null) throw controls.constructError
      this.opts = opts
      this.snapshots.push(opts.snapshot)
      instances.push(this)
      queueMicrotask(() => opts.onReady?.())
    }

    emitScenery(selection: ScenerySelection) {
      this.opts.onHollywoodSceneryLoadIn?.(selection)
    }
    emitPerson(person: Person | null) { this.opts.onHollywoodPerson?.(person) }
    emitPlace(place: Place | null) {
      // A real physical place click paints inside HollywoodScene before the host
      // receives the selection event. Model that ordering so host regressions can
      // prove the renderer outline survives the callback.
      this.hollywoodPlaceSelection = place?.id ?? null
      this.opts.onHollywoodPlace?.(place)
    }
    emitProduction(productionId: string, locationBuildingId = 'stage-a') {
      this.opts.onHollywoodProduction?.({ productionId, locationBuildingId })
    }
    emitActivity(text: string) { this.opts.onActivity?.(text) }
    setSnapshot(snapshot: unknown) { this.snapshots.push(snapshot) }
    select() {}
    clearSelection() {}
    clearHollywoodPersonSelection() { this.hollywoodPersonClears += 1 }
    clearHollywoodPlaceSelection() {
      this.hollywoodPlaceClears += 1
      this.hollywoodPlaceSelection = null
    }
    selectHollywoodPerson(id: string) { this.personSelections.push(id) }
    selectHollywoodProduction(id: string) { this.productionSelections.push(id) }
    selectHollywoodSceneryLoadIn(id: string) {
      this.scenerySelections.push(id)
      return controls.scenerySelectable
    }
    selectHollywoodAnnexPlace() { return true }
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
const READY_FIXTURE = resolve(
  process.cwd(),
  'ui/e2e/world-first-scenery-load-in-v1/week-30-nights-of-watchtower-stage-7-ready.save.json',
)

function loadFixture(path: string): GameState {
  const bytes = readFileSync(path, 'utf8')
  const imported = importSaveJson(bytes)
  if (!imported.ok) throw new Error(imported.error)
  if (imported.converted) throw new Error(`expected native SaveFileV11 fixture at ${path}`)
  if (exportSaveJson(imported.state) !== bytes) throw new Error(`fixture roundtrip changed ${path}`)
  return imported.state
}

function operationAt(
  state: GameState,
  buildingId: 'stage-a' | 'stage-b' = 'stage-a',
): ProductionOperationsState {
  const operation = studioLotSnapshot(state).productionOperations?.find(
    (candidate) => candidate.locationBuildingId === buildingId,
  )
  if (!operation) throw new Error(`expected ${buildingId} production operation`)
  return operation
}

function staticLot(
  state: GameState,
  onProductionCommand?: (command: LotProductionCommand) => ActionOutcome | void,
) {
  return render(
    <StudioLotScreen
      state={state}
      onNavigate={() => {}}
      onExit={() => {}}
      onAdvance={() => {}}
      {...(onProductionCommand === undefined ? {} : { onProductionCommand })}
    />,
  )
}

function liveLot(initialState: GameState) {
  let latestState = initialState
  const dispatches = vi.fn<(command: LotProductionCommand) => void>()

  function Harness() {
    const [state, setState] = useState(initialState)
    latestState = state
    return (
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        onProductionCommand={(command) => {
          dispatches(command)
          const outcome = runProductionCommand(state, command)
          if (outcome.ok) setState(outcome.next)
          return outcome
        }}
      />
    )
  }

  const rendered = render(<Harness />)
  return { ...rendered, dispatches, state: () => latestState }
}

function transformedOperations(
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

function stage12From(stage7: ProductionOperationsState): ProductionOperationsState {
  const currentCommand = stage7.currentCommand
  return {
    ...stage7,
    productionId: 'prod-hostile-stage-12',
    title: 'Hostile Stage Twelve Picture',
    locationBuildingId: 'stage-b',
    facilityLabel: 'Soundstage 12 + Scenery Shop',
    currentCommand: currentCommand === null
      ? null
      : { ...currentCommand, productionId: 'prod-hostile-stage-12' },
  }
}

async function latestView(): Promise<InstanceType<typeof renderer.FakeView>> {
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  return renderer.instances[0]!
}

async function enterServiceFromCompanion(): Promise<HTMLElement> {
  fireEvent.click(await screen.findByTestId('lot-nav-service-yard'))
  return screen.findByTestId('hollywood-scenery-load-in-context')
}

function expectExactSceneryContext(operation: ProductionOperationsState): HTMLElement {
  const context = screen.getByTestId('hollywood-scenery-load-in-context')
  const scoped = within(context)
  expect(scoped.getByText('SELECTED LOAD-IN · SOUNDSTAGE 7')).toBeInTheDocument()
  expect(scoped.getByRole('heading', { name: 'Scenery & Service' })).toBeInTheDocument()
  expect(scoped.getAllByText(operation.title).length).toBeGreaterThanOrEqual(1)
  expect(scoped.getAllByText(operation.facilityLabel).length).toBeGreaterThanOrEqual(1)
  expect(scoped.getByText(operation.directorName)).toBeInTheDocument()
  expect(scoped.getByText(String(operation.weeksRemaining))).toBeInTheDocument()
  expect(screen.getByTestId('hollywood-scenery-load-in-route')).toHaveTextContent(
    `${operation.title}Scenery & Service→${operation.facilityLabel}`,
  )
  expect(screen.getByTestId('hollywood-scenery-load-in-status')).toHaveTextContent(
    `PHASE${operation.phaseLabel}›TASK${operation.taskStatus}›STATUS${operation.statusLabel}`,
  )
  expect(
    screen.getByTestId(`hollywood-production-command-${operation.currentCommand?.kind ?? 'missing'}`),
  ).toHaveTextContent(operation.currentCommand?.label ?? '')
  expect(screen.getByTestId('lot-nav-service-yard')).toHaveAttribute('aria-current', 'true')
  return context
}

function fixturePerson(state: GameState): LotPersonState {
  const snapshot = studioLotSnapshot(state)
  const person = snapshot.people.find((candidate) => candidate.productionId !== null)
    ?? snapshot.people[0]
  if (!person) throw new Error('fixture has no projected person')
  return person
}

beforeEach(() => {
  localStorage.clear()
  resetLotStageAssignment()
  renderer.instances.length = 0
  renderer.controls.constructError = null
  renderer.controls.scenerySelectable = true
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
  renderer.controls.scenerySelectable = true
  adapterBoundary.transform = null
  setStudioLotOverviewOverride(false)
  setOperationHollywoodOverride(false)
  vi.restoreAllMocks()
})

describe('World-First Scenery Load-In V1 — StudioLotScreen contract', () => {
  it('preserves a generic physical service-yard outline when no exact scenery selector exists', async () => {
    const state = loadFixture(BLOCKED_FIXTURE)
    transformedOperations(() => [])
    staticLot(state, vi.fn<() => void>())
    const view = await latestView()
    const clearsBeforeClick = view.hollywoodPlaceClears

    expect(screen.queryByTestId('lot-nav-service-yard')).not.toBeInTheDocument()
    act(() => {
      view.emitPlace({
        id: 'service-yard',
        buildingId: 'post',
        label: 'Scenery & Service',
        affordances: ['delivery', 'supply-scenery', 'load-in'],
      })
    })

    expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent('SELECTED PLACE')
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent('Scenery & Service')
    expect(view.hollywoodPlaceSelection).toBe('service-yard')
    expect(view.hollywoodPlaceClears).toBe(clearsBeforeClick)
  })

  it('revalidates exact physical service identity against the latest Engine projection before entry', async () => {
    const state = loadFixture(BLOCKED_FIXTURE)
    const operation = operationAt(state)
    const owner = vi.fn<() => void>()
    staticLot(state, owner)
    const view = await latestView()

    act(() => {
      view.emitScenery({
        productionId: 'stale-production',
        locationBuildingId: 'stage-a',
        placeId: 'service-yard',
      })
    })
    expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()

    act(() => {
      view.emitScenery({
        productionId: operation.productionId,
        locationBuildingId: 'stage-a',
        placeId: 'service-yard',
      })
    })

    const context = await screen.findByTestId('hollywood-scenery-load-in-context')
    expect(context).toHaveTextContent('SELECTED LOAD-IN · SOUNDSTAGE 7')
    expect(context).toHaveTextContent('Nights of Watchtower')
    expect(context).toHaveTextContent('Scenery & Service')
    expect(context).toHaveTextContent('Soundstage 7 + Scenery Shop')
    await waitFor(() => expect(
      screen.getByTestId('hollywood-production-command-clearSceneryLoadIn'),
    ).toHaveFocus())
    expect(view.scenerySelections).toEqual([operation.productionId])
    expect(owner).not.toHaveBeenCalled()
  })

  it.each([
    ['wrong locationBuildingId', { locationBuildingId: 'stage-b', placeId: 'service-yard' }],
    ['wrong placeId', { locationBuildingId: 'stage-a', placeId: 'loading-bay' }],
  ] as const)('rejects a physical scenery selection with %s without disturbing prior context', async (
    _label,
    hostile,
  ) => {
    const state = loadFixture(BLOCKED_FIXTURE)
    const operation = operationAt(state)
    const person = fixturePerson(state)
    staticLot(state, vi.fn<() => void>())
    const view = await latestView()

    act(() => { view.emitPerson(person) })
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent(person.name)
    const personClearsBefore = view.hollywoodPersonClears
    const placeClearsBefore = view.hollywoodPlaceClears

    act(() => {
      view.emitScenery({
        productionId: operation.productionId,
        locationBuildingId: hostile.locationBuildingId,
        placeId: hostile.placeId,
      } as never)
    })

    expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent(person.name)
    expect(view.scenerySelections).toEqual([])
    expect(view.hollywoodPersonClears).toBe(personClearsBefore)
    expect(view.hollywoodPlaceClears).toBe(placeClearsBefore)
  })

  it('physical service entry exposes every exact field and clears person, place, and Annex contexts', async () => {
    const state = loadFixture(BLOCKED_FIXTURE)
    const operation = operationAt(state)
    const person = fixturePerson(state)
    staticLot(state, vi.fn<() => void>())
    const view = await latestView()
    const exactSelection = {
      productionId: operation.productionId,
      locationBuildingId: 'stage-a' as const,
      placeId: 'service-yard' as const,
    }

    act(() => { view.emitPerson(person) })
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent(person.name)
    act(() => { view.emitScenery(exactSelection) })
    expectExactSceneryContext(operation)
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()

    act(() => {
      view.emitPlace({
        id: 'studio-gate',
        buildingId: 'gate',
        label: 'Studio Gate',
        affordances: ['arrivals'],
      })
    })
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent('Studio Gate')
    act(() => { view.emitScenery(exactSelection) })
    expectExactSceneryContext(operation)
    expect(view.hollywoodPlaceSelection).toBeNull()

    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent(
      'Development & Casting Annex',
    )
    act(() => { view.emitScenery(exactSelection) })
    expectExactSceneryContext(operation)
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()

    expect(view.scenerySelections).toEqual([
      operation.productionId,
      operation.productionId,
      operation.productionId,
    ])
    expect(view.hollywoodPersonClears).toBeGreaterThanOrEqual(3)
    expect(view.hollywoodPlaceClears).toBeGreaterThanOrEqual(3)
  })

  it.each([
    ['pointer', 'person'],
    ['Enter', 'place'],
    ['Space', 'Annex'],
  ] as const)(
    'semantic service entry via %s is field-equivalent after clearing prior %s context',
    async (activation, prior) => {
      const state = loadFixture(BLOCKED_FIXTURE)
      const operation = operationAt(state)
      const person = fixturePerson(state)
      const owner = vi.fn<() => void>()
      staticLot(state, owner)
      const view = await latestView()

      if (prior === 'person') {
        act(() => { view.emitPerson(person) })
        expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent(person.name)
      } else if (prior === 'place') {
        act(() => {
          view.emitPlace({
            id: 'studio-gate',
            buildingId: 'gate',
            label: 'Studio Gate',
            affordances: ['arrivals'],
          })
        })
        expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent('Studio Gate')
      } else {
        fireEvent.click(screen.getByTestId('lot-nav-expansion'))
        expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent(
          'Development & Casting Annex',
        )
      }

      const service = screen.getByTestId('lot-nav-service-yard')
      const user = userEvent.setup()
      if (activation === 'pointer') {
        await user.click(service)
      } else {
        service.focus()
        await user.keyboard(activation === 'Enter' ? '{Enter}' : ' ')
      }

      expectExactSceneryContext(operation)
      expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()
      expect(screen.queryByTestId('hollywood-inspector')).not.toBeInTheDocument()
      expect(view.scenerySelections).toEqual([operation.productionId])
      expect(view.hollywoodPlaceSelection).toBeNull()
      expect(owner).not.toHaveBeenCalled()
    },
  )

  it('completes inspect → Clear → Schedule through semantic truth when renderer construction fails', async () => {
    renderer.controls.constructError = new Error('renderer unavailable')
    const blocked = loadFixture(BLOCKED_FIXTURE)
    const blockedOperation = operationAt(blocked)
    if (blockedOperation.currentCommand?.kind !== 'clearSceneryLoadIn') {
      throw new Error('blocked fixture lacks clearSceneryLoadIn')
    }
    const directReady = runProductionCommand(blocked, blockedOperation.currentCommand)
    if (!directReady.ok) throw new Error(directReady.error)
    const readyOperation = operationAt(directReady.next)
    if (readyOperation.currentCommand?.kind !== 'scheduleShootingTake') {
      throw new Error('ready successor lacks scheduleShootingTake')
    }
    const directScheduled = runProductionCommand(directReady.next, readyOperation.currentCommand)
    if (!directScheduled.ok) throw new Error(directScheduled.error)
    const lot = liveLot(blocked)

    expect(await screen.findByTestId('lot-canvas-fallback')).toHaveTextContent(
      'exact Stage 7 work remains available through the Studio Desk',
    )
    fireEvent.click(screen.getByTestId('hollywood-production-blocker'))

    expect(await screen.findByTestId('hollywood-scenery-load-in-context')).toHaveTextContent(
      'Scenery & Service',
    )
    const clear = screen.getByTestId('hollywood-production-command-clearSceneryLoadIn')
    await waitFor(() => expect(clear).toHaveFocus())
    fireEvent.click(clear)
    const schedule = await screen.findByTestId(
      'hollywood-production-command-scheduleShootingTake',
    )
    await waitFor(() => expect(schedule).toHaveFocus())
    expect(exportSaveJson(lot.state())).toBe(exportSaveJson(directReady.next))

    fireEvent.click(schedule)
    await waitFor(() => expect(
      screen.getByTestId(`hollywood-task-status-${blockedOperation.productionId}`),
    ).toHaveTextContent('scheduled'))
    expect(lot.dispatches).toHaveBeenNthCalledWith(1, blockedOperation.currentCommand)
    expect(lot.dispatches).toHaveBeenNthCalledWith(2, readyOperation.currentCommand)
    expect(exportSaveJson(lot.state())).toBe(exportSaveJson(directScheduled.next))
    expect(lot.state().rngState).toBe(directScheduled.next.rngState)
    expect(lot.state().ledger).toEqual(directScheduled.next.ledger)
    expect(renderer.instances).toHaveLength(0)
  })

  it(
    'completes semantic inspect → Clear → Schedule when canonical manifest selection fails',
    async () => {
      // Scene tests separately prove absent and malformed canonical records return
      // false. This is the shared StudioLotView false-result seam: React keeps exact
      // Engine context while declining to manufacture a physical outline.
      renderer.controls.scenerySelectable = false
      const blocked = loadFixture(BLOCKED_FIXTURE)
      const blockedOperation = operationAt(blocked)
      if (blockedOperation.currentCommand?.kind !== 'clearSceneryLoadIn') {
        throw new Error('blocked fixture lacks clearSceneryLoadIn')
      }
      const directReady = runProductionCommand(blocked, blockedOperation.currentCommand)
      if (!directReady.ok) throw new Error(directReady.error)
      const readyOperation = operationAt(directReady.next)
      if (readyOperation.currentCommand?.kind !== 'scheduleShootingTake') {
        throw new Error('ready successor lacks scheduleShootingTake')
      }
      const directScheduled = runProductionCommand(directReady.next, readyOperation.currentCommand)
      if (!directScheduled.ok) throw new Error(directScheduled.error)
      const lot = liveLot(blocked)
      const view = await latestView()

      await enterServiceFromCompanion()
      expect(screen.getByTestId('hollywood-scenery-load-in-context')).toHaveTextContent('Blocked')
      expect(view.hollywoodPlaceSelection).toBeNull()
      fireEvent.click(screen.getByTestId('hollywood-production-command-clearSceneryLoadIn'))
      const schedule = await screen.findByTestId(
        'hollywood-production-command-scheduleShootingTake',
      )
      await waitFor(() => expect(schedule).toHaveFocus())
      expect(view.hollywoodPlaceSelection).toBeNull()

      fireEvent.click(schedule)

      await waitFor(() => expect(
        screen.getByTestId(`hollywood-task-status-${blockedOperation.productionId}`),
      ).toHaveTextContent('scheduled'))
      expect(exportSaveJson(lot.state())).toBe(exportSaveJson(directScheduled.next))
      expect(view.hollywoodPlaceSelection).toBeNull()
    },
  )

  it.each(['Stage 12 first', 'Stage 7 first'] as const)(
    'selects exact Stage 7 with reversed multi-production order: %s',
    async (order) => {
      const state = loadFixture(BLOCKED_FIXTURE)
      const exact = operationAt(state)
      const hostile = stage12From(exact)
      transformedOperations(() => order === 'Stage 12 first' ? [hostile, exact] : [exact, hostile])
      staticLot(state, vi.fn<() => void>())
      const view = await latestView()

      fireEvent.click(screen.getByTestId(`hollywood-select-production-${hostile.productionId}`))
      expect(screen.getByTestId('hollywood-stage-12-fallback')).toHaveTextContent('Soundstage 12')
      await enterServiceFromCompanion()

      expect(screen.getByTestId('hollywood-scenery-load-in-route')).toHaveTextContent(exact.title)
      expect(screen.getByTestId('hollywood-scenery-load-in-route')).not.toHaveTextContent(hostile.title)
      expect(screen.queryByTestId('hollywood-stage-12-fallback')).not.toBeInTheDocument()
      expect(view.scenerySelections.at(-1)).toBe(exact.productionId)
    },
  )

  it('produces one byte-identical successor from service yard, Stage 7, Production Board, and direct adapter', async () => {
    const blocked = loadFixture(BLOCKED_FIXTURE)
    const frozenPrestate = readFileSync(BLOCKED_FIXTURE, 'utf8')
    const operation = operationAt(blocked)
    if (operation.currentCommand?.kind !== 'clearSceneryLoadIn') {
      throw new Error('blocked fixture lacks clearSceneryLoadIn')
    }
    const direct = runProductionCommand(blocked, operation.currentCommand)
    if (!direct.ok) throw new Error(direct.error)
    const directBytes = exportSaveJson(direct.next)

    const serviceLot = liveLot(blocked)
    await latestView()
    await enterServiceFromCompanion()
    fireEvent.click(screen.getByTestId('hollywood-production-command-clearSceneryLoadIn'))
    await waitFor(() => expect(exportSaveJson(serviceLot.state())).toBe(directBytes))
    const serviceSuccessor = serviceLot.state()
    serviceLot.unmount()
    renderer.instances.length = 0

    const stageLot = liveLot(blocked)
    const stageView = await latestView()
    act(() => { stageView.emitProduction(operation.productionId, 'stage-a') })
    expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent(operation.title)
    fireEvent.click(screen.getByTestId('hollywood-production-command-clearSceneryLoadIn'))
    await waitFor(() => expect(exportSaveJson(stageLot.state())).toBe(directBytes))
    const stageSuccessor = stageLot.state()
    stageLot.unmount()
    renderer.instances.length = 0

    let boardSuccessor = blocked
    function ProductionBoardHarness() {
      const [state, setState] = useState(blocked)
      return (
        <ProductionBoard
          board={productionBoard(state)}
          onCommand={(command) => {
            const outcome = runProductionCommand(state, command)
            if (!outcome.ok) throw new Error(outcome.error)
            boardSuccessor = outcome.next
            setState(outcome.next)
          }}
        />
      )
    }
    const board = render(<ProductionBoardHarness />)
    fireEvent.click(screen.getByTestId(
      `production-command-clearSceneryLoadIn-${operation.productionId}`,
    ))
    await waitFor(() => expect(exportSaveJson(boardSuccessor)).toBe(directBytes))
    expect(screen.getByTestId(
      `production-command-scheduleShootingTake-${operation.productionId}`,
    )).toBeEnabled()
    board.unmount()

    for (const [surface, successor] of [
      ['service-yard command', serviceSuccessor],
      ['Stage 7 inspector command', stageSuccessor],
      ['Production Board/application command', boardSuccessor],
    ] as const) {
      expect(exportSaveJson(successor), `${surface} SaveFileV11 bytes`).toBe(directBytes)
      expect(successor.rngState, `${surface} RNG state`).toBe(direct.next.rngState)
      expect(successor.ledger, `${surface} ledger`).toEqual(direct.next.ledger)
    }
    expect(exportSaveJson(blocked)).toBe(frozenPrestate)
  })

  it('continues blocked → ready → scheduled in one live context with direct SaveFile/RNG parity', async () => {
    const blocked = loadFixture(BLOCKED_FIXTURE)
    const blockedOperation = operationAt(blocked)
    if (blockedOperation.currentCommand?.kind !== 'clearSceneryLoadIn') {
      throw new Error('blocked fixture lacks clearSceneryLoadIn')
    }
    const directReady = runProductionCommand(blocked, blockedOperation.currentCommand)
    if (!directReady.ok) throw new Error(directReady.error)
    const directReadyOperation = operationAt(directReady.next)
    if (directReadyOperation.currentCommand?.kind !== 'scheduleShootingTake') {
      throw new Error('ready successor lacks scheduleShootingTake')
    }
    const directScheduled = runProductionCommand(directReady.next, directReadyOperation.currentCommand)
    if (!directScheduled.ok) throw new Error(directScheduled.error)

    const lot = liveLot(blocked)
    const view = await latestView()
    await enterServiceFromCompanion()
    fireEvent.click(screen.getByTestId('hollywood-production-command-clearSceneryLoadIn'))

    const schedule = await screen.findByTestId('hollywood-production-command-scheduleShootingTake')
    await waitFor(() => expect(schedule).toHaveFocus())
    expect(screen.getByTestId('hollywood-scenery-load-in-context')).toHaveTextContent('Delivered')
    expect(screen.getByTestId('hollywood-scenery-load-in-status')).toHaveTextContent('ready')
    expect(lot.dispatches).toHaveBeenNthCalledWith(1, blockedOperation.currentCommand)
    expect(exportSaveJson(lot.state())).toBe(exportSaveJson(directReady.next))
    expect(lot.state().market.tick).toBe(blocked.market.tick)
    expect(lot.state().studio.cash).toBe(blocked.studio.cash)
    expect(lot.state().rngState).toBe(blocked.rngState)
    expect(lot.state().ledger).toEqual(blocked.ledger)
    expect(lot.state().studio.activeProductions).toEqual(blocked.studio.activeProductions)

    const roundtrip = importSaveJson(exportSaveJson(lot.state()))
    expect(roundtrip.ok).toBe(true)
    if (!roundtrip.ok) throw new Error(roundtrip.error)
    expect(roundtrip.converted).toBe(false)
    expect(exportSaveJson(roundtrip.state)).toBe(exportSaveJson(directReady.next))

    fireEvent.click(schedule)
    await waitFor(() => {
      expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()
      expect(screen.getByTestId(`hollywood-task-status-${blockedOperation.productionId}`)).toHaveFocus()
    })
    expect(lot.dispatches).toHaveBeenNthCalledWith(2, directReadyOperation.currentCommand)
    expect(exportSaveJson(lot.state())).toBe(exportSaveJson(directScheduled.next))
    expect(lot.state().rngState).toBe(directScheduled.next.rngState)
    expect(lot.state().ledger).toEqual(directScheduled.next.ledger)
    expect(view.productionSelections.at(-1)).toBe(blockedOperation.productionId)
  })

  it('clears completed arrival feedback when the generic Stage 7 inspector schedules the take', async () => {
    const blocked = loadFixture(BLOCKED_FIXTURE)
    const operation = operationAt(blocked)
    const lot = liveLot(blocked)
    const view = await latestView()

    fireEvent.click(screen.getByTestId('hollywood-production-command-clearSceneryLoadIn'))
    const schedule = await screen.findByTestId(
      'hollywood-production-command-scheduleShootingTake',
    )
    const arrival = `${operation.title} scenery reached Soundstage 7. The shooting take is ready to schedule.`
    act(() => { view.emitActivity(arrival) })
    expect(screen.getByTestId('hollywood-activity-message')).toHaveTextContent(arrival)

    fireEvent.click(schedule)

    await waitFor(() => {
      expect(screen.queryByTestId('hollywood-activity-message')).not.toBeInTheDocument()
      expect(screen.getByTestId(`hollywood-task-status-${operation.productionId}`)).toHaveTextContent(
        'scheduled',
      )
    })
    expect(lot.dispatches).toHaveBeenCalledTimes(2)
  })

  it.each(['pointer', 'Enter', 'Space'] as const)(
    'dispatches one field-exact clear command for one %s activation',
    async (activation) => {
      const state = loadFixture(BLOCKED_FIXTURE)
      const expected = operationAt(state).currentCommand
      const owner = vi.fn<() => void>()
      staticLot(state, owner)
      await latestView()
      await enterServiceFromCompanion()
      const command = screen.getByTestId('hollywood-production-command-clearSceneryLoadIn')

      if (activation === 'pointer') {
        fireEvent.pointerDown(command)
        fireEvent.click(command)
      } else {
        command.focus()
        const user = userEvent.setup()
        await user.keyboard(activation === 'Enter' ? '{Enter}' : ' ')
      }

      expect(owner).toHaveBeenCalledOnce()
      expect(owner).toHaveBeenCalledWith(expected)
    },
  )

  it('guards rapid repeated activation synchronously until accepted state replacement arrives', async () => {
    const state = loadFixture(BLOCKED_FIXTURE)
    const command = operationAt(state).currentCommand
    if (command?.kind !== 'clearSceneryLoadIn') throw new Error('missing clear command')
    const accepted = runProductionCommand(state, command)
    if (!accepted.ok) throw new Error(accepted.error)
    const owner = vi.fn((): ActionOutcome => accepted)
    staticLot(state, owner)
    await latestView()
    await enterServiceFromCompanion()
    const button = screen.getByTestId('hollywood-production-command-clearSceneryLoadIn')

    fireEvent.click(button)
    fireEvent.click(button)

    expect(owner).toHaveBeenCalledOnce()
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Clearing scenery load-in…')
  })

  it('treats a real pointer double-click across blocked → ready as one Clear gesture', async () => {
    const blocked = loadFixture(BLOCKED_FIXTURE)
    const blockedOperation = operationAt(blocked)
    if (blockedOperation.currentCommand?.kind !== 'clearSceneryLoadIn') {
      throw new Error('missing clear command')
    }
    const directReady = runProductionCommand(blocked, blockedOperation.currentCommand)
    if (!directReady.ok) throw new Error(directReady.error)

    const lot = liveLot(blocked)
    await latestView()
    await enterServiceFromCompanion()
    const user = userEvent.setup()

    await user.dblClick(screen.getByTestId('hollywood-production-command-clearSceneryLoadIn'))

    expect(await screen.findByTestId(
      'hollywood-production-command-scheduleShootingTake',
    )).toBeEnabled()
    expect(lot.dispatches).toHaveBeenCalledOnce()
    expect(lot.dispatches).toHaveBeenCalledWith(blockedOperation.currentCommand)
    expect(exportSaveJson(lot.state())).toBe(exportSaveJson(directReady.next))
  })

  it('does not let one held Enter gesture dispatch the successor after blocked → ready repaint', async () => {
    const blocked = loadFixture(BLOCKED_FIXTURE)
    const blockedOperation = operationAt(blocked)
    if (blockedOperation.currentCommand?.kind !== 'clearSceneryLoadIn') {
      throw new Error('missing clear command')
    }
    const directReady = runProductionCommand(blocked, blockedOperation.currentCommand)
    if (!directReady.ok) throw new Error(directReady.error)

    const lot = liveLot(blocked)
    await latestView()
    await enterServiceFromCompanion()
    const clear = screen.getByTestId('hollywood-production-command-clearSceneryLoadIn')
    await waitFor(() => expect(clear).toHaveFocus())
    const user = userEvent.setup()

    await user.keyboard('{Enter>3/}')

    expect(await screen.findByTestId(
      'hollywood-production-command-scheduleShootingTake',
    )).toBeEnabled()
    expect(lot.dispatches).toHaveBeenCalledOnce()
    expect(lot.dispatches).toHaveBeenCalledWith(blockedOperation.currentCommand)
    expect(exportSaveJson(lot.state())).toBe(exportSaveJson(directReady.next))
  })

  it('re-announces identical stale-clear rejections with fresh DOM identity while retaining truth', async () => {
    const blocked = loadFixture(BLOCKED_FIXTURE)
    const ready = loadFixture(READY_FIXTURE)
    const command = operationAt(blocked).currentCommand
    if (command?.kind !== 'clearSceneryLoadIn') throw new Error('missing clear command')
    const rejection = runProductionCommand(ready, command)
    if (rejection.ok) throw new Error('expected stale clear rejection')
    const owner = vi.fn((): ActionOutcome => rejection)
    staticLot(blocked, owner)
    const view = await latestView()
    await enterServiceFromCompanion()
    const button = screen.getByTestId('hollywood-production-command-clearSceneryLoadIn')
    const announcement = screen.getByTestId('hollywood-activity-announcement')
    const originalBytes = exportSaveJson(blocked)

    fireEvent.click(button)

    expect(owner).toHaveBeenCalledOnce()
    expect(owner).toHaveBeenNthCalledWith(1, command)
    expect(screen.getByTestId('hollywood-scenery-load-in-context')).toHaveTextContent('Blocked')
    expect(screen.getByText(`Production command blocked: ${rejection.error}`)).toBeInTheDocument()
    await waitFor(() => expect(button).toHaveFocus())
    const firstMessage = screen.getByTestId('hollywood-activity-message')
    expect(exportSaveJson(blocked)).toBe(originalBytes)

    fireEvent.click(button)

    expect(owner).toHaveBeenCalledTimes(2)
    expect(owner).toHaveBeenNthCalledWith(2, command)
    expect(screen.getByTestId('hollywood-activity-announcement')).toBe(announcement)
    expect(screen.getByTestId('hollywood-activity-message')).not.toBe(firstMessage)
    expect(screen.getByTestId('hollywood-activity-message')).toHaveTextContent(
      `Production command blocked: ${rejection.error}`,
    )
    expect(screen.getByTestId('hollywood-scenery-load-in-context')).toHaveTextContent('Blocked')
    await waitFor(() => expect(button).toHaveFocus())
    expect(button).toBeEnabled()
    expect(view.productionSelections).toEqual([])
    expect(exportSaveJson(blocked)).toBe(originalBytes)
    expect(originalBytes).toBe(readFileSync(BLOCKED_FIXTURE, 'utf8'))
  })

  it('re-announces identical schedule rejections with fresh DOM identity and no false Stage 7 selection', async () => {
    const blocked = loadFixture(BLOCKED_FIXTURE)
    const ready = loadFixture(READY_FIXTURE)
    const command = operationAt(ready).currentCommand
    if (command?.kind !== 'scheduleShootingTake') throw new Error('missing schedule command')
    const rejection = runProductionCommand(blocked, command)
    if (rejection.ok) throw new Error('expected not-ready schedule rejection')
    const owner = vi.fn((): ActionOutcome => rejection)
    staticLot(ready, owner)
    const view = await latestView()
    await enterServiceFromCompanion()
    const button = screen.getByTestId('hollywood-production-command-scheduleShootingTake')
    const announcement = screen.getByTestId('hollywood-activity-announcement')
    const originalBytes = exportSaveJson(ready)

    fireEvent.click(button)

    expect(owner).toHaveBeenCalledOnce()
    expect(owner).toHaveBeenNthCalledWith(1, command)
    expect(screen.getByTestId('hollywood-scenery-load-in-context')).toHaveTextContent('Delivered')
    expect(screen.getByText(`Production command blocked: ${rejection.error}`)).toBeInTheDocument()
    await waitFor(() => expect(button).toHaveFocus())
    const firstMessage = screen.getByTestId('hollywood-activity-message')
    expect(exportSaveJson(ready)).toBe(originalBytes)

    fireEvent.click(button)

    expect(owner).toHaveBeenCalledTimes(2)
    expect(owner).toHaveBeenNthCalledWith(2, command)
    expect(screen.getByTestId('hollywood-activity-announcement')).toBe(announcement)
    expect(screen.getByTestId('hollywood-activity-message')).not.toBe(firstMessage)
    expect(screen.getByTestId('hollywood-activity-message')).toHaveTextContent(
      `Production command blocked: ${rejection.error}`,
    )
    expect(screen.getByTestId('hollywood-scenery-load-in-context')).toHaveTextContent('Delivered')
    await waitFor(() => expect(button).toHaveFocus())
    expect(button).toBeEnabled()
    expect(view.productionSelections).toEqual([])
    expect(exportSaveJson(ready)).toBe(originalBytes)
    expect(originalBytes).toBe(readFileSync(READY_FIXTURE, 'utf8'))
  })

  it('fails closed for malformed or duplicate Stage 7 truth and clears a stale selected identity', async () => {
    const state = loadFixture(BLOCKED_FIXTURE)
    const exact = operationAt(state)
    const malformed: ProductionOperationsState = {
      ...exact,
      currentCommand: exact.currentCommand === null
        ? null
        : { ...exact.currentCommand, productionId: 'mismatched-command-owner' },
    }
    transformedOperations(() => [malformed])
    const rendered = staticLot(state, vi.fn<() => void>())
    const view = await latestView()

    expect(screen.queryByTestId('lot-nav-service-yard')).not.toBeInTheDocument()
    act(() => {
      view.emitScenery({
        productionId: exact.productionId,
        locationBuildingId: 'stage-a',
        placeId: 'service-yard',
      })
    })
    expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()

    const duplicate: ProductionOperationsState = {
      ...exact,
      productionId: 'duplicate-stage-7',
      currentCommand: exact.currentCommand === null
        ? null
        : { ...exact.currentCommand, productionId: 'duplicate-stage-7' },
    }
    transformedOperations(() => [exact, duplicate])
    rendered.rerender(
      <StudioLotScreen
        state={{ ...state }}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        onProductionCommand={() => {}}
      />,
    )
    expect(screen.queryByTestId('lot-nav-service-yard')).not.toBeInTheDocument()

    adapterBoundary.transform = null
    rendered.rerender(
      <StudioLotScreen
        state={{ ...state }}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        onProductionCommand={() => {}}
      />,
    )
    await enterServiceFromCompanion()

    transformedOperations(() => [{
      ...exact,
      taskStatus: 'scheduled',
      blocker: null,
      currentCommand: null,
    }])
    rendered.rerender(
      <StudioLotScreen
        state={{ ...state }}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
        onProductionCommand={() => {}}
      />,
    )

    await waitFor(() => {
      expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()
      expect(screen.queryByTestId('lot-nav-service-yard')).not.toBeInTheDocument()
    })
    act(() => {
      view.emitScenery({
        productionId: exact.productionId,
        locationBuildingId: 'stage-a',
        placeId: 'service-yard',
      })
    })
    expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()
  })

  it.each(['scheduled', 'relocated', 'duplicate', 'absent'] as const)(
    'fails empty and clears the matching arrival activity after an external %s replacement',
    async (replacement) => {
      const ready = loadFixture(READY_FIXTURE)
      const exact = operationAt(ready)
      const rendered = staticLot(ready, vi.fn<() => void>())
      const view = await latestView()
      await enterServiceFromCompanion()

      const arrival = `${exact.title} scenery reached Soundstage 7. The shooting take is ready to schedule.`
      act(() => { view.emitActivity(arrival) })
      expect(screen.getByTestId('hollywood-activity-message')).toHaveTextContent(arrival)

      transformedOperations(() => {
        if (replacement === 'scheduled') {
          return [{ ...exact, taskStatus: 'scheduled', blocker: null, currentCommand: null }]
        }
        if (replacement === 'relocated') {
          return [{
            ...exact,
            locationBuildingId: 'stage-b',
            facilityLabel: 'Soundstage 12 + Scenery Shop',
          }]
        }
        if (replacement === 'duplicate') {
          return [exact, {
            ...exact,
            productionId: 'duplicate-stage-7',
            currentCommand: exact.currentCommand === null
              ? null
              : { ...exact.currentCommand, productionId: 'duplicate-stage-7' },
          }]
        }
        return []
      })
      rendered.rerender(
        <StudioLotScreen
          state={{ ...ready }}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => {}}
          onProductionCommand={() => {}}
        />,
      )

      await waitFor(() => {
        expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()
        expect(screen.queryByTestId('hollywood-activity-message')).not.toBeInTheDocument()
      })
      // No production card: the desk is in its no-operation branch, which First Movie
      // Journey Wave 1 gave to picture guidance.
      expect(screen.queryByTestId('hollywood-current-production')).not.toBeInTheDocument()
      expect(screen.getByTestId('hollywood-production-idle')).toContainElement(
        screen.getByTestId('lot-picture-guidance'),
      )
      expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent('Studio idle')
      expect(view.productionSelections).toEqual([])
    },
  )

  it('exits service context cleanly for physical person/place and semantic Annex selection', async () => {
    const state = loadFixture(BLOCKED_FIXTURE)
    const snapshot = studioLotSnapshot(state)
    const person = snapshot.people.find((candidate) => candidate.productionId !== null)
      ?? snapshot.people[0]
    if (!person) throw new Error('fixture has no projected person')
    staticLot(state, vi.fn<() => void>())
    const view = await latestView()

    await enterServiceFromCompanion()
    act(() => { view.emitPerson(person as LotPersonState) })
    await waitFor(() => expect(
      screen.queryByTestId('hollywood-scenery-load-in-context'),
    ).not.toBeInTheDocument())
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent(person.name)

    await enterServiceFromCompanion()
    act(() => {
      view.emitPlace({
        id: 'studio-gate',
        buildingId: 'gate',
        label: 'Studio Gate',
        affordances: ['arrivals'],
      })
    })
    await waitFor(() => expect(
      screen.queryByTestId('hollywood-scenery-load-in-context'),
    ).not.toBeInTheDocument())
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent('Studio Gate')

    await enterServiceFromCompanion()
    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent(
      'Development & Casting Annex',
    )
    expect(screen.queryByTestId('hollywood-scenery-load-in-context')).not.toBeInTheDocument()
  })

  it('loads direct ready truth without replaying clear and focuses the fresh schedule command', async () => {
    const ready = loadFixture(READY_FIXTURE)
    const operation = operationAt(ready)
    const owner = vi.fn<() => void>()
    staticLot(ready, owner)
    const view = await latestView()

    expect(screen.getByTestId('lot-nav-service-yard')).toHaveTextContent(
      'scenery delivered · take ready to schedule',
    )
    await enterServiceFromCompanion()
    const schedule = screen.getByTestId('hollywood-production-command-scheduleShootingTake')

    expect(screen.getByTestId('hollywood-scenery-load-in-context')).toHaveTextContent('Delivered')
    expect(screen.getByTestId('hollywood-scenery-load-in-status')).toHaveTextContent('ready')
    await waitFor(() => expect(schedule).toHaveFocus())
    expect(owner).not.toHaveBeenCalled()
    expect(view.scenerySelections).toEqual([operation.productionId])
    expect(view.productionSelections).toEqual([])
    expect(exportSaveJson(ready)).toBe(readFileSync(READY_FIXTURE, 'utf8'))
  })
})
