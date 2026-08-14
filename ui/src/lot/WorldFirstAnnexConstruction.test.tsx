import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import { App } from '../App.tsx'
import type { ActionOutcome, GameState } from '../engine/adapter.ts'
import {
  advanceWeek,
  exportSaveJson,
  greenlight,
  importSaveJson,
  productionDecision,
  requiredNegative,
  runProductionCommand,
  startDevelopmentCastingAnnexAction,
  studioDevelopment,
  studioLotSnapshot,
} from '../engine/adapter.ts'
import type { CreativeRole, DraftPackage } from '../engine/adapter.ts'
import {
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
} from '../engine/session.ts'
import {
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import { moneyExact } from '../format.ts'
import { foundedRosterIds, newFoundedGame } from '../test/founding.ts'
import { StudioDevelopment } from '../screens/StudioDevelopment.tsx'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import * as annexWorkSelector from './snapshot/annexWork.ts'
import type {
  LotAnnexWork,
  LotAnnexWorkContext,
  LotAnnexWorkOwnerIntent,
} from './snapshot/annexWork.ts'
import { lotStageAssignment, resetLotStageAssignment } from './snapshot/stageAssignment.ts'

const renderer = vi.hoisted(() => {
  const instances: FakeView[] = []
  const controls = {
    annexSelectable: true,
    constructError: null as Error | null,
  }

  type Place = {
    id: string
    buildingId: string
    label: string
    affordances: string[]
  }

  type Options = {
    snapshot: {
      week: number
      buildings: Array<{
        id: string
        constructionStatus?: string
        constructionProgressText?: string
      }>
    }
    onReady?: () => void
    onHollywoodPerson?: (person: unknown) => void
    onHollywoodPlace?: (place: Place) => void
    onHollywoodProduction?: (production: unknown) => void
  }

  class FakeView {
    readonly opts: Options
    snapshots: Options['snapshot'][] = []
    destroyed = false
    annexHostSelections = 0
    cameraPresets: string[] = []
    reducedMotion: boolean[] = []
    hollywoodPeopleSelected: string[] = []
    hollywoodPersonClears = 0
    hollywoodPlaceClears = 0

    constructor(opts: Options) {
      if (controls.constructError !== null) throw controls.constructError
      this.opts = opts
      this.snapshots.push(opts.snapshot)
      instances.push(this)
      queueMicrotask(() => opts.onReady?.())
    }

    setSnapshot(snapshot: Options['snapshot']) { this.snapshots.push(snapshot) }
    select() {}
    clearSelection() {}
    selectHollywoodAnnexPlace() {
      this.annexHostSelections++
      return controls.annexSelectable
    }
    clearHollywoodPersonSelection() { this.hollywoodPersonClears++ }
    clearHollywoodPlaceSelection() { this.hollywoodPlaceClears++ }
    selectHollywoodPerson(id: string) { this.hollywoodPeopleSelected.push(id) }
    selectHollywoodProduction() {}
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion(on: boolean) { this.reducedMotion.push(on) }
    setIdentityMode() {}
    setSignageMasked() {}
    camera(preset: string) { this.cameraPresets.push(preset) }
    showHollywoodPublicity() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    destroy() { this.destroyed = true }
  }

  return { controls, FakeView, instances }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

function managedStudio(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
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

function commandedStage7Studio(seed: string): GameState {
  let state = managedStudio(seed)
  const greenlit = greenlight(state, legalPackage(state))
  if (!greenlit.ok) throw new Error(greenlit.error)
  state = greenlit.next
  for (let guard = 0; guard < 20; guard++) {
    if (productionDecision(state)?.command?.kind === 'assignShootingDirector') break
    state = advanceWeek(state).next
  }
  if (productionDecision(state)?.command?.kind !== 'assignShootingDirector') {
    throw new Error('expected the authoritative Stage 7 director command')
  }
  return state
}

function scheduledStage7Studio(seed: string): GameState {
  let state = commandedStage7Studio(seed)
  for (let step = 0; step < 3; step++) {
    const command = productionDecision(state)?.command
    if (!command) throw new Error(`expected Stage 7 command ${String(step + 1)}`)
    const result = runProductionCommand(state, command)
    if (!result.ok) throw new Error(result.error)
    state = result.next
  }
  const operation = studioLotSnapshot(state).productionOperations?.find(
    (candidate) => candidate.locationBuildingId === 'stage-a',
  )
  if (operation?.taskStatus !== 'scheduled') {
    throw new Error('expected a scheduled authoritative Stage 7 operation')
  }
  return state
}

function buildingStudio(seed: string, completedAdvances = 0): GameState {
  const started = startDevelopmentCastingAnnexAction(managedStudio(seed))
  if (!started.ok) throw new Error(started.error)
  let state = started.next
  for (let i = 0; i < completedAdvances; i++) state = advanceWeek(state).next
  return state
}

function operationalStudio(seed: string): GameState {
  return buildingStudio(seed, 13)
}

function nativeAnnexFixture(file: string): GameState {
  const bytes = readFileSync(
    join(
      process.cwd(),
      `ui/e2e/world-first-operational-annex-work-presence-v1/${file}`,
    ),
    'utf8',
  )
  const imported = importSaveJson(bytes)
  if (!imported.ok) throw new Error(imported.error)
  if (imported.converted) throw new Error('expected a native SaveFileV11 Annex fixture')
  return imported.state
}

function nativeAnnexWorkingStudio(): GameState {
  return nativeAnnexFixture('week-13-operational-annex-script-working.save.json')
}

function nativeAnnexProductionWorkingStudio(): GameState {
  return nativeAnnexFixture(
    'week-14-operational-annex-production-development-working.save.json',
  )
}

function nativeAnnexCastingStudio(): GameState {
  let state = advanceWeek(nativeAnnexWorkingStudio()).next
  state = applyActions(state, [
    { kind: 'acceptScript', projectId: 'script-0000' },
    { kind: 'requestScriptRewrite', projectId: 'script-0001' },
    { kind: 'requestScriptRewrite', projectId: 'script-0002' },
  ])
  const actors = foundedRosterIds(state, 'actor')
  state = applyActions(state, [{
    kind: 'startCastingSession',
    session: {
      projectId: 'script-0000',
      slate: {
        lead: [actors[0]!, actors[1]!],
        antagonist: [actors[0]!, actors[2]!],
        support: [actors[1]!, actors[2]!],
      },
    },
  }])
  const occupant = studioLotSnapshot(state).annexWork?.occupant
  if (occupant?.owner !== 'casting') {
    throw new Error('expected ordinary allocation to place casting work in the Annex')
  }
  return state
}

function projectAnnexOccupant(occupant: NonNullable<LotAnnexWork['occupant']>): void {
  vi.spyOn(lotStageAssignment, 'resolve').mockImplementation((snapshot) => {
    if (snapshot.annexWork === null) return snapshot
    const held = occupant.workState === 'held'
    return {
      ...snapshot,
      buildings: snapshot.buildings.map((building) =>
        building.id === 'expansion'
          ? {
              ...building,
              attention: held ? 'warning' as const : 'active' as const,
              attentionReason: `${held ? 'Production held' : 'Working'} · ${occupant.title}`,
            }
          : building,
      ),
      annexWork: {
        ...snapshot.annexWork,
        occupied: 1,
        available: 0,
        occupant,
      },
    }
  })
}

function projectNeutralOperationalAnnex(): void {
  vi.spyOn(lotStageAssignment, 'resolve').mockImplementation((snapshot) => ({
    ...snapshot,
    buildings: snapshot.buildings.map((building) =>
      building.id === 'expansion'
        ? { ...building, attention: 'normal' as const, attentionReason: 'Operational' }
        : building,
    ),
    annexWork: null,
  }))
}

function readyScriptsWithProjectedAnnexOwner(): {
  state: GameState
  context: LotAnnexWorkContext
  exactProjectId: string
  unrelatedProjectId: string
} {
  const working = nativeAnnexWorkingStudio()
  const exact = studioLotSnapshot(working).annexWork?.occupant
  if (exact?.owner !== 'script') throw new Error('expected Annex screenplay fixture')
  const advanced = advanceWeek(working).next
  const state = applyActions(advanced, advanced.scriptDevelopment.projects.map((project) => ({
    kind: 'acceptScript' as const,
    projectId: project.id,
  })))
  const unrelated = state.scriptDevelopment.projects.find(
    (project) => project.id !== exact.ownerId && project.status === 'ready',
  )
  if (!unrelated) throw new Error('expected an unrelated Ready screenplay')
  const annexWork = studioLotSnapshot(working).annexWork
  if (
    annexWork === null ||
    annexWork.occupant === null ||
    annexWork.occupant.owner !== 'script' ||
    annexWork.occupant.workState !== 'working'
  ) {
    throw new Error('expected projected Annex screenplay work')
  }
  const occupant = { ...annexWork.occupant, workState: 'working' as const }
  return {
    state,
    exactProjectId: exact.ownerId,
    unrelatedProjectId: unrelated.id,
    context: {
      state: 'working',
      annexWork,
      occupant,
      ownerIntent: { owner: 'script', ownerId: exact.ownerId },
    },
  }
}

function poorStudio(seed: string): GameState {
  const state = managedStudio(seed)
  const cash = 779_999
  return {
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
}

function latestView(): InstanceType<typeof renderer.FakeView> {
  const view = renderer.instances.at(-1)
  if (!view) throw new Error('expected StudioLotView instance')
  return view
}

function rejection(message = 'applyActions: startDevelopmentCastingAnnex rejected — stale test state'):
  ActionOutcome {
  return { ok: false, error: message }
}

function renderLot(
  state: GameState,
  options: {
    onNavigate?: ReturnType<typeof vi.fn>
    onStart?: () => ActionOutcome
    onOpenWork?: (intent: LotAnnexWorkOwnerIntent) => boolean
    entryFocus?: 'annex-work'
    worldInputSuspended?: boolean
  } = {},
) {
  const onNavigate = options.onNavigate ?? vi.fn()
  const onStart = options.onStart ?? (() => rejection())
  const result = render(
    <StudioLotScreen
      state={state}
      onNavigate={onNavigate}
      onExit={() => {}}
      onAdvance={() => {}}
      onStartDevelopmentCastingAnnex={onStart}
      {...(options.onOpenWork ? { onOpenAnnexWorkDetails: options.onOpenWork } : {})}
      {...(options.entryFocus ? { entryFocus: options.entryFocus } : {})}
      {...(options.worldInputSuspended !== undefined
        ? { worldInputSuspended: options.worldInputSuspended }
        : {})}
    />,
  )
  return { ...result, onNavigate, onStart }
}

async function selectAnnexSemantically(): Promise<HTMLElement> {
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  const companion = screen.getByTestId('lot-nav-expansion')
  fireEvent.click(companion)
  return screen.findByTestId('lot-annex-context')
}

beforeEach(() => {
  localStorage.clear()
  clearActiveSession()
  resetLotStageAssignment()
  renderer.instances.length = 0
  renderer.controls.annexSelectable = true
  renderer.controls.constructError = null
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  clearActiveSession()
  localStorage.clear()
  resetLotStageAssignment()
  renderer.instances.length = 0
  renderer.controls.annexSelectable = true
  renderer.controls.constructError = null
  setStudioLotOverviewOverride(false)
  setOperationHollywoodOverride(false)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('World-First Annex Construction Interaction V1 — React/App boundary', () => {
  it('accepts only exact physical Annex identity, projects every Vacant fact, and clears cleanly', async () => {
    const state = managedStudio('world-first-annex-physical')
    const before = exportSaveJson(state)
    const view = studioDevelopment(state)
    const owner = vi.fn(() => rejection())
    const { onNavigate } = renderLot(state, { onStart: owner })

    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    const phaser = latestView()

    act(() => phaser.opts.onHollywoodPlace?.({
      id: 'wrong-annex-place',
      buildingId: 'expansion',
      label: 'Development & Casting Annex',
      affordances: ['develop-studio', 'construct-annex'],
    }))
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()

    act(() => phaser.opts.onHollywoodPlace?.({
      id: 'annex-parcel',
      buildingId: 'admin',
      label: 'Development & Casting Annex',
      affordances: ['develop-studio', 'construct-annex'],
    }))
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()

    act(() => phaser.opts.onHollywoodPlace?.({
      id: 'annex-parcel',
      buildingId: 'expansion',
      label: 'Development & Casting Annex',
      affordances: ['develop-studio', 'construct-annex'],
    }))

    const context = await screen.findByTestId('lot-annex-context')
    const facts = screen.getByTestId('lot-annex-vacant-facts')
    expect(context).toHaveTextContent(view.name)
    expect(screen.getByTestId('lot-annex-status')).toHaveTextContent('Vacant')
    expect(facts).toHaveTextContent(moneyExact(view.capex))
    expect(facts).toHaveTextContent(`${view.durationWeeks} weekly advances`)
    expect(facts).toHaveTextContent(moneyExact(view.cash))
    expect(facts).toHaveTextContent(moneyExact(view.cashAfter))
    expect(context).toHaveTextContent(String(view.currentDevelopmentCastingCapacity))
    expect(context).toHaveTextContent(view.consequence)
    expect(screen.getByTestId('lot-annex-affordability')).toHaveTextContent('Affordable now')
    const build = screen.getByRole('button', {
      name: `Build ${view.name} · ${moneyExact(view.capex)}`,
    })
    await waitFor(() => expect(build).toHaveFocus())
    expect(phaser.hollywoodPersonClears).toBeGreaterThan(0)
    expect(onNavigate).not.toHaveBeenCalled()
    expect(owner).not.toHaveBeenCalled()
    expect(exportSaveJson(state)).toBe(before)

    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    expect(await screen.findByTestId('lot-annex-context')).toBeInTheDocument()
    act(() => phaser.opts.onHollywoodPlace?.({
      id: 'administration',
      buildingId: 'admin',
      label: 'Administration',
      affordances: ['manage-studio'],
    }))
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('fails closed when the visual Annex lifecycle is stale against the latest construction view', async () => {
    const state = managedStudio('world-first-annex-stale-visual-projection')
    const owner = vi.fn(() => rejection())
    vi.spyOn(lotStageAssignment, 'resolve').mockImplementation((snapshot) => ({
      ...snapshot,
      buildings: snapshot.buildings.map((building) =>
        building.id === 'expansion'
          ? { ...building, constructionStatus: 'building' as const }
          : building,
      ),
    }))
    renderLot(state, { onStart: owner })

    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    act(() => latestView().opts.onHollywoodPlace?.({
      id: 'annex-parcel',
      buildingId: 'expansion',
      label: 'Development & Casting Annex',
      affordances: ['develop-studio', 'construct-annex'],
    }))
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()
    expect(owner).not.toHaveBeenCalled()
  })

  for (const malformed of ['absent', 'duplicate'] as const) {
    it(`fails closed when the visual Annex projection is ${malformed}`, async () => {
      const state = managedStudio(`world-first-annex-visual-${malformed}`)
      const owner = vi.fn(() => rejection())
      vi.spyOn(lotStageAssignment, 'resolve').mockImplementation((snapshot) => {
        const withoutExpansion = snapshot.buildings.filter((building) => building.id !== 'expansion')
        const expansion = snapshot.buildings.find((building) => building.id === 'expansion')
        return {
          ...snapshot,
          buildings: malformed === 'absent' || expansion === undefined
            ? withoutExpansion
            : [...withoutExpansion, expansion, { ...expansion }],
        }
      })
      renderLot(state, { onStart: owner })

      await waitFor(() => expect(renderer.instances).toHaveLength(1))
      fireEvent.click(screen.getByTestId('lot-nav-expansion'))
      expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()
      expect(owner).not.toHaveBeenCalled()
    })
  }

  it('keeps the semantic Annex context when the live renderer cannot paint its outline', async () => {
    renderer.controls.annexSelectable = false
    const state = managedStudio('world-first-annex-no-host-outline')
    const owner = vi.fn(() => rejection())
    const { onNavigate } = renderLot(state, { onStart: owner })

    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    fireEvent.click(screen.getByTestId('lot-nav-expansion'))

    expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent('$780,000')
    expect(latestView().annexHostSelections).toBe(1)
    expect(owner).not.toHaveBeenCalled()
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('replaces person and production commands only inside the Annex inspector, then clears cleanly', async () => {
    const state = commandedStage7Studio('world-first-annex-context-ownership')
    const snapshot = studioLotSnapshot(state)
    const operation = snapshot.productionOperations?.find(
      (candidate) => candidate.locationBuildingId === 'stage-a',
    )
    const person = snapshot.people.find(
      (candidate) => candidate.productionId === operation?.productionId,
    )
    if (!operation?.currentCommand || !person) {
      throw new Error('expected exact Stage 7 command and named person')
    }
    const owner = vi.fn(() => rejection())
    renderLot(state, { onStart: owner })
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    const phaser = latestView()
    const commandId = `hollywood-production-command-${operation.currentCommand.kind}`
    expect(screen.getByTestId(commandId)).toBeInTheDocument()
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(operation.title)

    fireEvent.click(screen.getByTestId(`hollywood-select-person-${person.id}`))
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent(person.name)
    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    const context = await screen.findByTestId('lot-annex-context')
    expect(within(context).queryByText(person.name)).not.toBeInTheDocument()
    expect(screen.queryByTestId(commandId)).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(operation.title)

    fireEvent.click(screen.getByTestId(`hollywood-select-person-${person.id}`))
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()
    expect(screen.getByTestId(commandId)).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    act(() => phaser.opts.onHollywoodProduction?.({
      productionId: operation.productionId,
      locationBuildingId: 'stage-a',
    }))
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()
    expect(screen.getByTestId(commandId)).toBeInTheDocument()
    expect(owner).not.toHaveBeenCalled()
  })

  for (const activation of ['pointer', 'Enter', 'Space'] as const) {
    it(`opens the same Annex context from the semantic companion by ${activation} without routing`, async () => {
      const state = managedStudio(`world-first-annex-semantic-${activation}`)
      const owner = vi.fn(() => rejection())
      const { onNavigate } = renderLot(state, { onStart: owner })
      await waitFor(() => expect(renderer.instances).toHaveLength(1))
      const companion = screen.getByTestId('lot-nav-expansion')

      if (activation === 'pointer') {
        fireEvent.click(companion)
      } else {
        companion.focus()
        await userEvent.keyboard(activation === 'Enter' ? '{Enter}' : ' ')
      }

      expect(await screen.findByTestId('lot-annex-context')).toBeInTheDocument()
      expect(latestView().annexHostSelections).toBe(1)
      expect(onNavigate).not.toHaveBeenCalled()
      expect(owner).not.toHaveBeenCalled()
      await waitFor(() => expect(screen.getByTestId('lot-annex-build')).toHaveFocus())
    })
  }

  for (const key of ['Enter', 'Space'] as const) {
    it(`dispatches the native Build button exactly once by ${key} with no payload`, async () => {
      const state = managedStudio(`world-first-annex-build-${key}`)
      const accepted = startDevelopmentCastingAnnexAction(state)
      if (!accepted.ok) throw new Error(accepted.error)
      const owner = vi.fn((): ActionOutcome => accepted)
      renderLot(state, { onStart: owner })

      await selectAnnexSemantically()
      const build = screen.getByTestId('lot-annex-build')
      await waitFor(() => expect(build).toHaveFocus())
      await userEvent.keyboard(key === 'Enter' ? '{Enter}' : ' ')

      expect(owner).toHaveBeenCalledOnce()
      expect(owner.mock.calls[0]).toEqual([])
      expect(screen.getByTestId('lot-annex-action-announcement')).toHaveTextContent(
        '$780,000 committed to Development & Casting Annex. Completion is due in Week 13.',
      )
      expect(build).toBeDisabled()
    })
  }

  it('contains pointer, mouse, and touch down-events on the Annex overlay and Build action', async () => {
    const parentPointer = vi.fn()
    const parentMouse = vi.fn()
    const parentTouch = vi.fn()
    const owner = vi.fn(() => rejection())
    render(
      <div
        onPointerDown={parentPointer}
        onMouseDown={parentMouse}
        onTouchStart={parentTouch}
      >
        <StudioLotScreen
          state={managedStudio('world-first-annex-event-containment')}
          onNavigate={() => {}}
          onExit={() => {}}
          onAdvance={() => {}}
          onStartDevelopmentCastingAnnex={owner}
        />
      </div>,
    )
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    const context = await screen.findByTestId('lot-annex-context')
    const build = screen.getByTestId('lot-annex-build')

    for (const target of [context, build]) {
      fireEvent.pointerDown(target)
      fireEvent.mouseDown(target)
      fireEvent.touchStart(target)
    }

    expect(parentPointer).not.toHaveBeenCalled()
    expect(parentMouse).not.toHaveBeenCalled()
    expect(parentTouch).not.toHaveBeenCalled()
    expect(owner).not.toHaveBeenCalled()
  })

  it('lets App own the one accepted start and repaints exact Building truth in the same lot', async () => {
    const state = managedStudio('world-first-annex-app-accepted')
    const expected = startDevelopmentCastingAnnexAction(state)
    if (!expected.ok) throw new Error(expected.error)
    saveActiveSession(state)

    render(<App />)
    const lot = await screen.findByTestId('studio-lot-screen')
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    const phaser = latestView()
    await waitFor(() => expect(phaser.snapshots.length).toBeGreaterThan(0))
    const snapshotsBefore = phaser.snapshots.length

    await selectAnnexSemantically()
    const build = screen.getByTestId('lot-annex-build')
    fireEvent.click(build)

    expect(await screen.findByTestId('lot-annex-building-facts')).toHaveTextContent(
      '0 of 13 weekly advances complete',
    )
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('lot-annex-status')).toHaveTextContent('Building')
    expect(screen.getByTestId('lot-annex-building-facts')).toHaveTextContent(
      `Week ${studioDevelopment(expected.next).dueWeek}`,
    )
    expect(screen.queryByTestId('lot-annex-build')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-annex-action-announcement')).toHaveTextContent(
      '$780,000 committed to Development & Casting Annex. Completion is due in Week 13.',
    )
    await waitFor(() => expect(screen.getByTestId('lot-annex-status')).toHaveFocus())
    expect(phaser.destroyed).toBe(false)
    expect(renderer.instances).toHaveLength(1)
    await waitFor(() => expect(phaser.snapshots.length).toBe(snapshotsBefore + 1))
    expect(phaser.snapshots.at(-1)?.buildings.find((building) => building.id === 'expansion'))
      .toMatchObject({ constructionStatus: 'building' })
    expect(screen.getByTestId('lot-cash')).toHaveTextContent(moneyExact(expected.next.studio.cash))

    await waitFor(() => {
      const restored = loadActiveSession()
      expect(restored.ok).toBe(true)
      if (!restored.ok) return
      expect(exportSaveJson(restored.state)).toBe(exportSaveJson(expected.next))
      expect(restored.state.rngState).toBe(state.rngState)
      expect(restored.state.ledger.filter((entry) => entry.kind === 'constructionCapex')).toHaveLength(1)
    })
  })

  it('produces a byte-identical SaveFileV11 successor from lot and deep Studio Development', async () => {
    const state = managedStudio('world-first-annex-surface-parity')
    let deepNext: GameState | null = null
    const deep = render(
      <StudioDevelopment
        state={state}
        onChange={(next) => { deepNext = next }}
        onBack={() => {}}
      />,
    )
    fireEvent.click(screen.getByTestId('start-development-casting-annex'))
    expect(deepNext).not.toBeNull()
    deep.unmount()

    let lotNext: GameState | null = null
    const lotOwner = vi.fn((): ActionOutcome => {
      const outcome = startDevelopmentCastingAnnexAction(state)
      if (outcome.ok) lotNext = outcome.next
      return outcome
    })
    renderer.instances.length = 0
    renderLot(state, { onStart: lotOwner })
    await selectAnnexSemantically()
    fireEvent.click(screen.getByTestId('lot-annex-build'))

    expect(lotOwner).toHaveBeenCalledOnce()
    expect(lotOwner.mock.calls[0]).toEqual([])
    expect(lotNext).not.toBeNull()
    expect(exportSaveJson(lotNext!)).toBe(exportSaveJson(deepNext!))
    expect(lotNext!.rngState).toBe(deepNext!.rngState)
    expect(lotNext!.ledger).toEqual(deepNext!.ledger)
  })

  it('keeps Stage 7 operations and people alive while Annex context replaces only the inspector', async () => {
    const state = scheduledStage7Studio('world-first-annex-stage-7-invariance')
    const beforeSnapshot = studioLotSnapshot(state)
    const operation = beforeSnapshot.productionOperations?.find(
      (candidate) => candidate.locationBuildingId === 'stage-a',
    )
    const person = beforeSnapshot.people.find(
      (candidate) => candidate.authority === 'active-production' &&
        candidate.productionId === operation?.productionId,
    )
    if (!operation || !person) throw new Error('expected exact Stage 7 operation and named person')
    const expected = startDevelopmentCastingAnnexAction(state)
    if (!expected.ok) throw new Error(expected.error)
    saveActiveSession(state)

    render(<App />)
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    const phaser = latestView()
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(operation.title)
    expect(screen.getByTestId(`hollywood-task-status-${operation.productionId}`)).toHaveTextContent(
      operation.statusLabel,
    )

    fireEvent.click(screen.getByTestId(`hollywood-select-person-${person.id}`))
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent(person.name)
    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    const context = await screen.findByTestId('lot-annex-context')
    expect(within(context).queryByText(person.name)).not.toBeInTheDocument()
    expect(screen.queryByTestId('hollywood-publicity-whisper')).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(operation.title)

    act(() => phaser.opts.onHollywoodProduction?.({
      productionId: operation.productionId,
      locationBuildingId: 'stage-a',
    }))
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()
    expect(screen.getByTestId('hollywood-inspector')).toHaveTextContent(operation.title)

    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    fireEvent.click(await screen.findByTestId('lot-annex-build'))
    expect(await screen.findByTestId('lot-annex-building-facts')).toHaveTextContent(
      '0 of 13 weekly advances complete',
    )
    expect(screen.getByTestId('hollywood-current-production')).toHaveTextContent(operation.title)
    expect(screen.getByRole('group', { name: 'Named studio people' })).toHaveTextContent(person.name)
    expect(renderer.instances).toHaveLength(1)
    expect(phaser.destroyed).toBe(false)
    expect(phaser.cameraPresets).toEqual([])

    const restored = loadActiveSession()
    if (!restored.ok) throw new Error(`Expected a saved active session, got ${restored.reason}`)
    const afterSnapshot = studioLotSnapshot(restored.state)
    expect(restored.state.rngState).toBe(state.rngState)
    expect(restored.state.studio.activeProductions).toEqual(state.studio.activeProductions)
    expect(restored.state.operations).toEqual(state.operations)
    expect(afterSnapshot.activeProductions).toEqual(beforeSnapshot.activeProductions)
    expect(afterSnapshot.productionOperations).toEqual(beforeSnapshot.productionOperations)
    expect(afterSnapshot.people).toEqual(beforeSnapshot.people)
    expect(exportSaveJson(restored.state)).toBe(exportSaveJson(expected.next))
  })

  it('keeps selected Annex context through progress and gives completion sole focus', async () => {
    const state = buildingStudio('world-first-annex-selected-lifecycle', 11)
    saveActiveSession(state)

    render(<App />)
    await selectAnnexSemantically()
    const lot = screen.getByTestId('studio-lot-screen')
    const context = screen.getByTestId('lot-annex-context')
    expect(screen.getByTestId('lot-annex-progress-text')).toHaveTextContent(
      '11 of 13 weekly advances complete',
    )

    fireEvent.click(screen.getByTestId('lot-advance-week'))
    await waitFor(() => expect(screen.getByTestId('lot-annex-progress-text')).toHaveTextContent(
      '12 of 13 weekly advances complete',
    ))
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('lot-annex-context')).toBe(context)
    expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('lot-advance-week'))
    await waitFor(() => expect(screen.getByTestId('lot-annex-status')).toHaveTextContent('Operational'))
    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('lot-annex-context')).toBe(context)
    expect(screen.getByTestId('lot-annex-operational-facts')).toHaveTextContent('3 slots')
    expect(screen.getByTestId('annex-completion-summary')).toHaveFocus()
    expect(screen.getByTestId('lot-annex-action-announcement')).toHaveTextContent('')
    expect(screen.getByTestId('lot-week-update-announcement')).toHaveTextContent('')
    expect(screen.getByTestId('lot-annex-operational-announcement')).toHaveTextContent('')
  })

  for (const phase of ['vacant', 'building', 'operational'] as const) {
    it(`reconstructs exact ${phase} truth after SaveFileV11 reload without replaying ceremony`, async () => {
      const source = phase === 'vacant'
        ? managedStudio(`world-first-annex-reload-${phase}`)
        : phase === 'building'
          ? buildingStudio(`world-first-annex-reload-${phase}`, 6)
          : operationalStudio(`world-first-annex-reload-${phase}`)
      const bytes = exportSaveJson(source)
      const imported = importSaveJson(bytes)
      if (!imported.ok) throw new Error(imported.error)
      expect(imported.converted).toBe(false)
      expect(exportSaveJson(imported.state)).toBe(bytes)
      const owner = vi.fn(() => rejection())
      renderLot(imported.state, { onStart: owner })

      await selectAnnexSemantically()
      expect(screen.getByTestId('lot-annex-status')).toHaveTextContent(
        phase === 'vacant' ? 'Vacant' : phase === 'building' ? 'Building' : 'Operational',
      )
      if (phase === 'building') {
        expect(screen.getByTestId('lot-annex-progress-text')).toHaveTextContent(
          '6 of 13 weekly advances complete',
        )
      }
      if (phase === 'operational') {
        expect(screen.getByTestId('lot-annex-operational-facts')).toHaveTextContent('3 slots')
      }
      expect(screen.getByTestId('lot-annex-action-announcement')).toHaveTextContent('')
      expect(screen.queryByTestId('annex-completion-summary')).not.toBeInTheDocument()
      expect(owner).not.toHaveBeenCalled()
    })
  }

  it('retains the complete semantic Annex path when renderer construction fails', async () => {
    renderer.controls.constructError = new Error('test-only renderer rejection')
    const state = managedStudio('world-first-annex-renderer-rejection')
    const error = 'applyActions: startDevelopmentCastingAnnex rejected — exact fallback test'
    const owner = vi.fn((): ActionOutcome => ({ ok: false, error }))
    const { onNavigate } = renderLot(state, { onStart: owner })

    await screen.findByTestId('lot-canvas-fallback')
    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent('$780,000')
    fireEvent.click(screen.getByTestId('lot-annex-build'))
    expect(owner).toHaveBeenCalledOnce()
    expect(screen.getByTestId('lot-annex-action-announcement')).toHaveTextContent(error)
    expect(onNavigate).not.toHaveBeenCalled()
    expect(renderer.instances).toHaveLength(0)
  })

  for (const mode of ['renderer rejection', 'reduced motion', 'procedural rollback'] as const) {
    it(`accepts the exact construction transition under ${mode}`, async () => {
      if (mode === 'renderer rejection') {
        renderer.controls.constructError = new Error('test-only renderer rejection')
      } else if (mode === 'reduced motion') {
        vi.stubGlobal('matchMedia', vi.fn(() => ({
          matches: true,
          media: '(prefers-reduced-motion: reduce)',
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(() => true),
        })))
      } else {
        setOperationHollywoodOverride(false)
      }

      const state = managedStudio(`world-first-annex-accepted-${mode}`)
      const expected = startDevelopmentCastingAnnexAction(state)
      if (!expected.ok) throw new Error(expected.error)
      saveActiveSession(state)
      render(<App />)

      if (mode === 'renderer rejection') {
        await screen.findByTestId('lot-canvas-fallback')
      } else {
        await waitFor(() => expect(renderer.instances).toHaveLength(1))
      }
      fireEvent.click(screen.getByTestId('lot-nav-expansion'))
      const build = await screen.findByTestId('lot-annex-build')
      if (mode === 'reduced motion') {
        expect(build).toBeEnabled()
        await waitFor(() => expect(build).toHaveFocus())
      }
      fireEvent.click(build)
      expect(await screen.findByTestId('lot-annex-building-facts')).toHaveTextContent(
        '0 of 13 weekly advances complete',
      )

      await waitFor(() => {
        const restored = loadActiveSession()
        expect(restored.ok).toBe(true)
        if (restored.ok) expect(exportSaveJson(restored.state)).toBe(exportSaveJson(expected.next))
      })
      if (mode === 'reduced motion') {
        expect(latestView().reducedMotion).toContain(true)
        await waitFor(() => expect(screen.getByTestId('lot-annex-status')).toHaveFocus())
      }
      if (mode === 'procedural rollback') {
        expect(latestView().annexHostSelections).toBe(0)
      }
    })
  }

  it('keeps the procedural rollback path in-world without inventing a Hollywood outline', async () => {
    setOperationHollywoodOverride(false)
    const state = managedStudio('world-first-annex-procedural-fallback')
    const owner = vi.fn(() => rejection())
    const { onNavigate } = renderLot(state, { onStart: owner })

    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent(
      'Development & Casting Annex',
    )
    expect(screen.getByTestId('lot-annex-build')).toBeEnabled()
    expect(latestView().annexHostSelections).toBe(0)
    expect(onNavigate).not.toHaveBeenCalled()
    expect(owner).not.toHaveBeenCalled()
  })

  it('renders the exact unaffordable reason, focuses status, and dispatches no owner', async () => {
    const state = poorStudio('world-first-annex-unaffordable')
    const before = exportSaveJson(state)
    const view = studioDevelopment(state)
    if (view.affordability.ok) throw new Error('expected exact unaffordable boundary')
    const owner = vi.fn(() => rejection())
    renderLot(state, { onStart: owner })

    await selectAnnexSemantically()
    const build = screen.getByTestId('lot-annex-build')
    expect(build).toBeDisabled()
    expect(screen.getByTestId('lot-annex-affordability')).toHaveTextContent(view.affordability.reason)
    await waitFor(() => expect(screen.getByTestId('lot-annex-status')).toHaveFocus())
    fireEvent.click(build)
    expect(owner).not.toHaveBeenCalled()
    expect(exportSaveJson(state)).toBe(before)
  })

  it('explains a Vacant but otherwise ineligible project without inventing an affordability error', async () => {
    const state: GameState = {
      ...managedStudio('world-first-annex-ineligible'),
      economyEngagedEver: false,
    }
    const view = studioDevelopment(state)
    expect(view.status).toBe('vacant')
    expect(view.affordability.ok).toBe(true)
    expect(view.canStart).toBe(false)
    const owner = vi.fn(() => rejection())
    renderLot(state, { onStart: owner })

    await selectAnnexSemantically()
    expect(screen.getByTestId('lot-annex-build')).toBeDisabled()
    expect(screen.getByTestId('lot-annex-affordability')).toHaveTextContent(
      'The current studio state does not permit this project.',
    )
    expect(owner).not.toHaveBeenCalled()
  })

  it('announces the real stale-owner rejection, preserves latest bytes/RNG, restores focus, and clears pending', async () => {
    const staleRenderedState = managedStudio('world-first-annex-rejection')
    const alreadyStarted = startDevelopmentCastingAnnexAction(staleRenderedState)
    if (!alreadyStarted.ok) throw new Error(alreadyStarted.error)
    const latestAuthoritativeState = alreadyStarted.next
    const latestBytes = exportSaveJson(latestAuthoritativeState)
    const latestRng = latestAuthoritativeState.rngState
    saveActiveSession(latestAuthoritativeState)
    let adapterError = ''
    const owner = vi.fn((): ActionOutcome => {
      const outcome = startDevelopmentCastingAnnexAction(latestAuthoritativeState)
      if (!outcome.ok) adapterError = outcome.error
      return outcome
    })
    renderLot(staleRenderedState, { onStart: owner })

    await selectAnnexSemantically()
    const build = screen.getByTestId('lot-annex-build')
    fireEvent.click(build)
    expect(owner).toHaveBeenCalledOnce()
    expect(owner.mock.calls[0]).toEqual([])
    expect(adapterError).toContain('startDevelopmentCastingAnnex rejected')
    expect(screen.getByTestId('lot-annex-action-announcement')).toHaveTextContent(adapterError)
    await waitFor(() => expect(build).toHaveFocus())
    expect(exportSaveJson(latestAuthoritativeState)).toBe(latestBytes)
    expect(latestAuthoritativeState.rngState).toBe(latestRng)
    const restored = loadActiveSession()
    expect(restored.ok).toBe(true)
    if (restored.ok) {
      expect(exportSaveJson(restored.state)).toBe(latestBytes)
      expect(restored.state.rngState).toBe(latestRng)
    }
    const firstAnnouncementNode = screen.getByTestId('lot-annex-action-announcement').firstChild

    fireEvent.click(build)
    expect(owner).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('lot-annex-action-announcement')).toHaveTextContent(adapterError)
    expect(screen.getByTestId('lot-annex-action-announcement').firstChild)
      .not.toBe(firstAnnouncementNode)
  })

  it('guards a rapid successful double activation until fresh authoritative state arrives', async () => {
    const state = managedStudio('world-first-annex-double-activation')
    const accepted = startDevelopmentCastingAnnexAction(state)
    if (!accepted.ok) throw new Error(accepted.error)
    const owner = vi.fn((): ActionOutcome => accepted)
    renderLot(state, { onStart: owner })

    await selectAnnexSemantically()
    const build = screen.getByTestId('lot-annex-build')
    act(() => {
      fireEvent.click(build)
      fireEvent.click(build)
    })

    expect(owner).toHaveBeenCalledOnce()
    expect(owner.mock.calls[0]).toEqual([])
    expect(screen.getByTestId('lot-annex-action-announcement')).toHaveTextContent(
      '$780,000 committed to Development & Casting Annex. Completion is due in Week 13.',
    )
    expect(screen.getByTestId('lot-annex-build')).toBeDisabled()
    expect(studioDevelopment(state).status).toBe('vacant')
  })

  for (const status of ['building', 'operational', 'legacy'] as const) {
    it(`renders exact ${status} truth as inspect-only and clears no authoritative state`, async () => {
      const state = status === 'building'
        ? buildingStudio('world-first-annex-building-read', 6)
        : status === 'operational'
          ? operationalStudio('world-first-annex-operational-read')
          : newFoundedGame('world-first-annex-legacy-read')
      const before = exportSaveJson(state)
      const view = studioDevelopment(state)
      const owner = vi.fn(() => rejection())
      const { onNavigate } = renderLot(state, { onStart: owner })

      await selectAnnexSemantically()
      expect(screen.getByTestId('lot-annex-status')).toHaveTextContent(
        status === 'building' ? 'Building' : status === 'operational' ? 'Operational' : 'Unavailable',
      )
      expect(screen.queryByTestId('lot-annex-build')).not.toBeInTheDocument()
      await waitFor(() => expect(screen.getByTestId(
        status === 'operational' ? 'lot-annex-current-work-heading' : 'lot-annex-status',
      )).toHaveFocus())

      if (status === 'building') {
        expect(screen.getByTestId('lot-annex-progress')).toHaveAttribute(
          'aria-valuenow',
          String(view.completedAdvances),
        )
        expect(screen.getByTestId('lot-annex-progress-text')).toHaveTextContent(
          `${view.completedAdvances} of ${view.durationWeeks} weekly advances complete`,
        )
        expect(screen.getByTestId('lot-annex-building-facts')).toHaveTextContent(
          String(view.remainingAdvances),
        )
        expect(screen.getByTestId('lot-annex-building-facts')).toHaveTextContent(
          moneyExact(view.capex),
        )
      } else if (status === 'operational') {
        const facts = screen.getByTestId('lot-annex-operational-facts')
        expect(facts).toHaveTextContent(`Week ${view.completedWeek}`)
        expect(facts).toHaveTextContent(`+${view.completedCapacityGain} slot`)
        expect(facts).toHaveTextContent(`${view.currentDevelopmentCastingCapacity} slots`)
        expect(screen.getByTestId('lot-annex-status')).toHaveTextContent(
          `Completed in Week ${view.completedWeek}. Current Annex slot use: 0 of 1.`,
        )
        expect(screen.getByTestId('lot-annex-work-available')).toHaveTextContent('0 / 1')
        expect(screen.getByTestId('lot-annex-work-available')).toHaveTextContent('Available')
        expect(facts).toHaveTextContent(
          'No current screenplay, casting session, or production occupies the Annex.',
        )
        expect(facts).not.toHaveTextContent('available now')
        expect(screen.queryByTestId('lot-annex-open-work-details')).not.toBeInTheDocument()
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      } else {
        expect(screen.getByTestId('lot-annex-legacy-copy')).toHaveTextContent(view.consequence)
      }

      expect(owner).not.toHaveBeenCalled()
      expect(onNavigate).not.toHaveBeenCalled()
      expect(exportSaveJson(state)).toBe(before)
    })
  }
})

describe('World-First Operational Annex Work Presence V1 — living Lot inspector', () => {
  it.each([
    ['available', 'empty', 'Available · 0 of 1 slot occupied'],
    ['working', 'active', 'Working ·'],
    ['held', 'warning', 'Production held · The Exact Held Return'],
    ['neutral', 'normal', 'Operational'],
  ] as const)(
    'keeps %s Annex inspector truth and semantic companion state in parity',
    async (kind, attention, stateText) => {
      let state = nativeAnnexFixture('week-13-operational-annex-available.save.json')
      if (kind === 'working') state = nativeAnnexWorkingStudio()
      if (kind === 'held') {
        projectAnnexOccupant({
          owner: 'production',
          ownerId: 'production-held-return',
          title: 'The Exact Held Return',
          activity: 'preProduction',
          workState: 'held',
          statusLabel: 'Held for facility capacity',
          blocker: {
            kind: 'facility-capacity',
            headline: 'Rehearsal held for Soundstage',
            detail: 'No Soundstage slot is available for the next production phase.',
          },
        })
      }
      if (kind === 'neutral') projectNeutralOperationalAnnex()

      renderLot(state)
      await waitFor(() => expect(renderer.instances).toHaveLength(1))
      const companion = screen.getByTestId('lot-nav-expansion')
      expect(companion).toHaveAttribute('data-attention', attention)
      expect(screen.getByTestId('lot-nav-expansion-state')).toHaveTextContent(stateText)

      fireEvent.click(companion)
      await screen.findByTestId('lot-annex-context')
      if (kind === 'available') {
        expect(screen.getByTestId('lot-annex-work-available')).toHaveTextContent('Available')
      } else if (kind === 'neutral') {
        expect(screen.getByTestId('lot-annex-work-unavailable')).toBeInTheDocument()
      } else {
        expect(screen.getByTestId('lot-annex-work-occupied')).toHaveTextContent(
          kind === 'held' ? 'Production held' : 'Working',
        )
      }
    },
  )

  it('loads native Working SaveFileV11 truth, exposes exact work, and emits identity only', async () => {
    const state = nativeAnnexWorkingStudio()
    const before = exportSaveJson(state)
    const exact = studioLotSnapshot(state).annexWork?.occupant
    if (exact?.owner !== 'script') throw new Error('expected native Annex screenplay work')
    const owner = vi.fn(() => true)
    renderLot(state, { onOpenWork: owner })

    const context = await selectAnnexSemantically()
    expect(screen.getByTestId('lot-annex-status')).toHaveTextContent(
      'Completed in Week 13. Current Annex slot use: 1 of 1.',
    )
    const work = screen.getByTestId('lot-annex-work-occupied')
    expect(work).toHaveTextContent('1 / 1')
    expect(work).toHaveTextContent('Occupied')
    expect(work).toHaveTextContent('Working')
    expect(work).toHaveTextContent('Screenplay')
    expect(work).toHaveTextContent(exact.title)
    expect(work).toHaveTextContent('Drafting')
    expect(context).not.toHaveTextContent('available now')
    expect(context).not.toHaveTextContent(/queue|ETA|worker|traveling|facility blocked/i)
    await waitFor(() => expect(screen.getByTestId('lot-annex-current-work-heading')).toHaveFocus())

    fireEvent.click(screen.getByRole('button', {
      name: `Open Writers Room · ${exact.title}`,
    }))
    expect(owner).toHaveBeenCalledOnce()
    expect(owner).toHaveBeenCalledWith({ owner: 'script', ownerId: exact.ownerId })
    expect(exportSaveJson(state)).toBe(before)
  })

  const presentationCases: Array<{
    label: string
    occupant: NonNullable<LotAnnexWork['occupant']>
    ownerLabel: string
    activityLabel: string
    destination: string
  }> = [
    {
      label: 'rewriting screenplay',
      occupant: {
        owner: 'script',
        ownerId: 'script-rewrite-exact',
        title: 'The Exact Rewrite',
        activity: 'rewriting',
        workState: 'working',
        statusLabel: null,
        blocker: null,
      },
      ownerLabel: 'Screenplay',
      activityLabel: 'Rewriting',
      destination: 'Writers Room',
    },
    {
      label: 'auditioning casting session',
      occupant: {
        owner: 'casting',
        ownerId: 'casting-exact',
        title: 'The Exact Audition',
        activity: 'auditioning',
        workState: 'working',
        statusLabel: null,
        blocker: null,
      },
      ownerLabel: 'Casting session',
      activityLabel: 'Auditioning',
      destination: 'Casting Room',
    },
    {
      label: 'production development',
      occupant: {
        owner: 'production',
        ownerId: 'production-development-exact',
        title: 'The Exact Development',
        activity: 'development',
        workState: 'working',
        statusLabel: 'On schedule',
        blocker: null,
      },
      ownerLabel: 'Production',
      activityLabel: 'Development',
      destination: 'Production Board',
    },
    {
      label: 'production pre-production',
      occupant: {
        owner: 'production',
        ownerId: 'production-preproduction-exact',
        title: 'The Exact Preparation',
        activity: 'preProduction',
        workState: 'working',
        statusLabel: 'On schedule',
        blocker: null,
      },
      ownerLabel: 'Production',
      activityLabel: 'Pre-production',
      destination: 'Production Board',
    },
    {
      label: 'configured production hold',
      occupant: {
        owner: 'production',
        ownerId: 'production-held-exact',
        title: 'The Exact Hold',
        activity: 'preProduction',
        workState: 'held',
        statusLabel: 'Held for facility capacity',
        blocker: {
          kind: 'facility-capacity',
          headline: 'Rehearsal held for Soundstage',
          detail: 'No Soundstage slot is available for the next production phase.',
        },
      },
      ownerLabel: 'Production',
      activityLabel: 'Pre-production',
      destination: 'Production Board',
    },
  ]

  for (const specimen of presentationCases) {
    it(`renders exact ${specimen.label} semantics and destination without person fiction`, async () => {
      projectAnnexOccupant(specimen.occupant)
      const owner = vi.fn(() => true)
      renderLot(nativeAnnexWorkingStudio(), { onOpenWork: owner })

      const context = await selectAnnexSemantically()
      const work = screen.getByTestId('lot-annex-work-occupied')
      expect(work).toHaveTextContent(specimen.ownerLabel)
      expect(work).toHaveTextContent(specimen.occupant.title)
      expect(work).toHaveTextContent(specimen.activityLabel)
      expect(work).toHaveTextContent(
        specimen.occupant.workState === 'held' ? 'Production held' : 'Working',
      )
      if (specimen.occupant.statusLabel !== null) {
        expect(work).toHaveTextContent(specimen.occupant.statusLabel)
      }
      if (specimen.occupant.blocker !== null) {
        expect(screen.getByTestId('lot-annex-work-blocker')).toHaveTextContent(
          specimen.occupant.blocker.headline,
        )
        expect(screen.getByTestId('lot-annex-work-blocker')).toHaveTextContent(
          specimen.occupant.blocker.detail,
        )
      } else {
        expect(screen.queryByTestId('lot-annex-work-blocker')).not.toBeInTheDocument()
      }
      expect(context).not.toHaveTextContent(/named worker|queue position|ETA|traveling/i)

      fireEvent.click(screen.getByRole('button', {
        name: `Open ${specimen.destination} · ${specimen.occupant.title}`,
      }))
      expect(owner).toHaveBeenCalledOnce()
      expect(owner).toHaveBeenCalledWith({
        owner: specimen.occupant.owner,
        ownerId: specimen.occupant.ownerId,
      })
    })
  }

  for (const activation of ['pointer', 'Enter', 'Space'] as const) {
    it(`opens occupied Annex details at most once under repeated ${activation} activation`, async () => {
      const owner = vi.fn(() => true)
      renderLot(nativeAnnexWorkingStudio(), { onOpenWork: owner })
      await selectAnnexSemantically()
      const button = screen.getByTestId('lot-annex-open-work-details')

      if (activation === 'pointer') {
        fireEvent.click(button)
        fireEvent.click(button)
      } else {
        button.focus()
        await userEvent.keyboard(activation === 'Enter' ? '{Enter}{Enter}' : '  ')
      }

      expect(owner).toHaveBeenCalledOnce()
    })
  }

  it('does not let a pointer activation begun for one occupant open its replacement', async () => {
    const initial = nativeAnnexWorkingStudio()
    const replacement = nativeAnnexProductionWorkingStudio()
    const replacementOccupant = studioLotSnapshot(replacement).annexWork?.occupant
    if (replacementOccupant?.owner !== 'production') {
      throw new Error('expected replacement Annex production')
    }
    const replacementOwner: LotAnnexWorkOwnerIntent = {
      owner: 'production',
      ownerId: replacementOccupant.ownerId,
    }
    const owner = vi.fn(() => true)
    const props = {
      onNavigate: () => {},
      onExit: () => {},
      onAdvance: () => {},
      onOpenAnnexWorkDetails: owner,
    }
    const result = render(<StudioLotScreen state={initial} {...props} />)
    await selectAnnexSemantically()
    const initialButton = screen.getByTestId('lot-annex-open-work-details')

    fireEvent.pointerDown(initialButton)
    result.rerender(<StudioLotScreen state={replacement} {...props} />)
    const replacementButton = screen.getByTestId('lot-annex-open-work-details')
    expect(replacementButton).toHaveTextContent(replacementOccupant.title)
    fireEvent.pointerUp(replacementButton)
    fireEvent.click(replacementButton)

    expect(owner).not.toHaveBeenCalled()
    fireEvent.click(replacementButton)
    expect(owner).toHaveBeenCalledOnce()
    expect(owner).toHaveBeenCalledWith(replacementOwner)
  })

  it('keeps the current world context, announces a rejected handoff, and permits a fresh retry', async () => {
    const owner = vi.fn(() => false)
    renderLot(nativeAnnexWorkingStudio(), { onOpenWork: owner })
    await selectAnnexSemantically()
    const button = screen.getByTestId('lot-annex-open-work-details')

    fireEvent.click(button)
    expect(owner).toHaveBeenCalledOnce()
    expect(screen.getByTestId('lot-annex-context')).toBeInTheDocument()
    expect(screen.getByTestId('lot-annex-action-announcement')).toHaveTextContent(
      'Annex work changed. Review the current Annex work before opening details.',
    )
    await waitFor(() => expect(screen.getByTestId('lot-annex-current-work-heading')).toHaveFocus())

    fireEvent.click(button)
    expect(owner).toHaveBeenCalledTimes(2)
  })

  it('focuses fresh Current work for annex-work entry and retains the semantic path on renderer failure', async () => {
    renderer.controls.constructError = new Error('test-only operational Annex renderer rejection')
    const owner = vi.fn(() => true)
    renderLot(nativeAnnexWorkingStudio(), {
      onOpenWork: owner,
      entryFocus: 'annex-work',
    })

    await screen.findByTestId('lot-canvas-fallback')
    expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent('Current work')
    await waitFor(() => expect(screen.getByTestId('lot-annex-current-work-heading')).toHaveFocus())
    fireEvent.click(screen.getByTestId('lot-annex-open-work-details'))
    expect(owner).toHaveBeenCalledOnce()
  })

  it('returns to fresh replacement truth instead of the prior Annex occupant', async () => {
    const initial = nativeAnnexWorkingStudio()
    const previous = studioLotSnapshot(initial).annexWork?.occupant
    const replacement = nativeAnnexProductionWorkingStudio()
    const current = studioLotSnapshot(replacement).annexWork?.occupant
    if (previous?.owner !== 'script' || current?.owner !== 'production') {
      throw new Error('expected exact script-to-production replacement')
    }

    const first = renderLot(initial, { entryFocus: 'annex-work' })
    await screen.findByTestId('lot-annex-context')
    first.unmount()
    renderer.instances.length = 0
    renderLot(replacement, { entryFocus: 'annex-work' })

    const context = await screen.findByTestId('lot-annex-context')
    expect(context).toHaveTextContent(current.title)
    expect(context).not.toHaveTextContent(previous.title)
    await waitFor(() => expect(screen.getByTestId('lot-annex-current-work-heading')).toHaveFocus())
  })

  it('returns to fresh released-slot truth as Available with no stale owner action', async () => {
    renderLot(nativeAnnexFixture('week-13-operational-annex-available.save.json'), {
      entryFocus: 'annex-work',
    })

    expect(await screen.findByTestId('lot-annex-work-available')).toHaveTextContent('Available')
    expect(screen.queryByTestId('lot-annex-open-work-details')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('lot-annex-current-work-heading')).toHaveFocus())
  })

  it('returns to configured Held truth and preserves its exact blocker semantics', async () => {
    projectAnnexOccupant({
      owner: 'production',
      ownerId: 'production-configured-held-return',
      title: 'The Configured Held Return',
      activity: 'preProduction',
      workState: 'held',
      statusLabel: 'Held for facility capacity',
      blocker: {
        kind: 'facility-capacity',
        headline: 'Rehearsal held for Soundstage',
        detail: 'Configured capacity has no Soundstage slot for the next phase.',
      },
    })
    renderLot(nativeAnnexWorkingStudio(), { entryFocus: 'annex-work' })

    const work = await screen.findByTestId('lot-annex-work-occupied')
    expect(work).toHaveTextContent('Production held')
    expect(work).toHaveTextContent('The Configured Held Return')
    expect(screen.getByTestId('lot-annex-work-blocker')).toHaveTextContent(
      'Configured capacity has no Soundstage slot for the next phase.',
    )
    expect(screen.getByTestId('lot-nav-expansion')).toHaveAttribute(
      'data-attention',
      'warning',
    )
    await waitFor(() => expect(screen.getByTestId('lot-annex-current-work-heading')).toHaveFocus())
  })

  it('suspends Annex inspection actions for the full profile-modal boundary', async () => {
    const state = nativeAnnexWorkingStudio()
    const owner = vi.fn(() => true)
    const baseProps = {
      state,
      onNavigate: () => {},
      onExit: () => {},
      onAdvance: () => {},
      onOpenAnnexWorkDetails: owner,
    }
    const result = render(<StudioLotScreen {...baseProps} />)
    await selectAnnexSemantically()
    result.rerender(<StudioLotScreen {...baseProps} worldInputSuspended />)
    const button = screen.getByTestId('lot-annex-open-work-details')
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(owner).not.toHaveBeenCalled()

    result.rerender(<StudioLotScreen {...baseProps} worldInputSuspended={false} />)
    fireEvent.click(screen.getByTestId('lot-annex-open-work-details'))
    expect(owner).toHaveBeenCalledOnce()
  })

  it('routes native screenplay work through App and returns to fresh Annex work on the same Lot home', async () => {
    const state = nativeAnnexWorkingStudio()
    const exact = studioLotSnapshot(state).annexWork?.occupant
    if (exact?.owner !== 'script') throw new Error('expected native Annex screenplay work')
    saveActiveSession(state)
    render(<App />)

    await selectAnnexSemantically()
    fireEvent.click(screen.getByTestId('lot-annex-open-work-details'))
    expect(await screen.findByTestId('writers-room')).toBeInTheDocument()
    expect(screen.getByTestId(`script-card-${exact.ownerId}`)).toHaveTextContent(exact.title)
    await waitFor(() => expect(screen.getByTestId(`script-status-${exact.ownerId}`)).toHaveFocus())

    fireEvent.click(screen.getByTestId('writers-room-back'))
    expect(await screen.findByTestId('studio-lot-screen')).toBeInTheDocument()
    expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent(exact.title)
    await waitFor(() => expect(screen.getByTestId('lot-annex-current-work-heading')).toHaveFocus())

    fireEvent.click(screen.getByTestId('lot-advance-week'))
    await waitFor(() => expect(screen.getByTestId('lot-annex-work-available')).toHaveTextContent('0 / 1'))
    expect(screen.queryByTestId('lot-annex-open-work-details')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-annex-status')).not.toHaveTextContent('available now')
  })

  it('resolves native casting work through the exact current session ID, never its title', async () => {
    const state = nativeAnnexCastingStudio()
    const exact = studioLotSnapshot(state).annexWork?.occupant
    if (exact?.owner !== 'casting') throw new Error('expected native Annex casting work')
    const sessions = state.castingSessions.sessions.filter((session) => session.id === exact.ownerId)
    if (sessions.length !== 1) throw new Error('expected one exact active casting session')
    const projectId = sessions[0]!.projectId
    saveActiveSession(state)
    render(<App />)

    await selectAnnexSemantically()
    expect(screen.getByTestId('lot-annex-work-occupied')).toHaveTextContent('Casting session')
    fireEvent.click(screen.getByTestId('lot-annex-open-work-details'))
    expect(await screen.findByTestId('casting-room')).toBeInTheDocument()
    expect(screen.getByTestId(`casting-project-${projectId}`)).toHaveTextContent(exact.title)
    await waitFor(() => expect(screen.getByTestId(`casting-status-${projectId}`)).toHaveFocus())

    fireEvent.click(screen.getByTestId('casting-room-back'))
    expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent(exact.title)
    await waitFor(() => expect(screen.getByTestId('lot-annex-current-work-heading')).toHaveFocus())
  })

  it('routes native production work to the exact Production Board card and returns directly to fresh work', async () => {
    const state = nativeAnnexProductionWorkingStudio()
    const exact = studioLotSnapshot(state).annexWork?.occupant
    if (exact?.owner !== 'production') throw new Error('expected native Annex production work')
    saveActiveSession(state)
    render(<App />)

    await selectAnnexSemantically()
    expect(screen.getByTestId('lot-annex-work-occupied')).toHaveTextContent('Development')
    fireEvent.click(screen.getByTestId('lot-annex-open-work-details'))
    expect(await screen.findByTestId('production-board')).toBeInTheDocument()
    expect(screen.getByTestId(`active-${exact.ownerId}`)).toHaveTextContent(exact.title)
    await waitFor(() => expect(screen.getByTestId(`production-status-${exact.ownerId}`)).toHaveFocus())

    fireEvent.click(screen.getByTestId('back-to-studio-lot'))
    expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent(exact.title)
    await waitFor(() => expect(screen.getByTestId('lot-annex-current-work-heading')).toHaveFocus())
  })

  it('retains annex-work return only through the exact screenplay child route', async () => {
    const fixture = readyScriptsWithProjectedAnnexOwner()
    vi.spyOn(annexWorkSelector, 'operationalAnnexWorkContext').mockReturnValue(fixture.context)
    saveActiveSession(fixture.state)
    render(<App />)

    await selectAnnexSemantically()
    fireEvent.click(screen.getByTestId('lot-annex-open-work-details'))
    expect(await screen.findByTestId('writers-room')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId(
      `script-action-openPackage-${fixture.exactProjectId}`,
    ))
    expect(await screen.findByTestId('assembly-steps')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('assembly-back-dashboard'))

    expect(await screen.findByTestId('lot-annex-context')).toHaveTextContent(
      fixture.context.occupant?.title ?? '',
    )
    await waitFor(() => expect(screen.getByTestId('lot-annex-current-work-heading')).toHaveFocus())
  })

  it('demotes annex-work when Writers Room opens a different screenplay child', async () => {
    const fixture = readyScriptsWithProjectedAnnexOwner()
    vi.spyOn(annexWorkSelector, 'operationalAnnexWorkContext').mockReturnValue(fixture.context)
    saveActiveSession(fixture.state)
    render(<App />)

    await selectAnnexSemantically()
    fireEvent.click(screen.getByTestId('lot-annex-open-work-details'))
    expect(await screen.findByTestId('writers-room')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId(
      `script-action-openPackage-${fixture.unrelatedProjectId}`,
    ))
    expect(await screen.findByTestId('assembly-steps')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('assembly-back-dashboard'))

    expect(await screen.findByTestId('studio-lot-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('lot-nav-expansion')).toHaveFocus())
  })

  it('demotes annex-work when Casting Room opens the unrelated Roster child', async () => {
    const state = nativeAnnexCastingStudio()
    saveActiveSession(state)
    render(<App />)

    await selectAnnexSemantically()
    fireEvent.click(screen.getByTestId('lot-annex-open-work-details'))
    expect(await screen.findByTestId('casting-room')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('casting-open-roster'))
    expect(await screen.findByTestId('roster-back')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('roster-back'))

    expect(await screen.findByTestId('studio-lot-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('lot-nav-expansion')).toHaveFocus())
  })

  it('demotes production annex-work return after unrelated Dashboard navigation', async () => {
    const state = nativeAnnexProductionWorkingStudio()
    saveActiveSession(state)
    render(<App />)

    await selectAnnexSemantically()
    fireEvent.click(screen.getByTestId('lot-annex-open-work-details'))
    expect(await screen.findByTestId('production-board')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('open-roster'))
    expect(await screen.findByTestId('roster-back')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('roster-back'))

    expect(await screen.findByTestId('studio-lot-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('lot-annex-context')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('lot-nav-expansion')).toHaveFocus())
  })
})
