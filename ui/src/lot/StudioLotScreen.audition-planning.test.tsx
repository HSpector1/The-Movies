import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  foundingApplicantCards,
  foundManagedStudioAction,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
  type CreativeRole,
  type GameState,
} from '../engine/adapter.ts'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import { StudioLotScreen, type LotAuditionPlanningOrigin } from './StudioLotScreen.tsx'
import type { StudioLotSnapshot } from './snapshot/StudioLotSnapshot.ts'
import {
  acceptedLotAuditionPlanningReceipt,
  type LotAuditionPlanningReceipt,
} from './snapshot/auditionPlanning.ts'
import { resetLotSelectedBuilding } from './snapshot/selectedBuildingSession.ts'

type FakeViewOptions = {
  snapshot: StudioLotSnapshot
  onAction?: (event: { buildingId: 'casting'; action: 'browse-talent' }) => void
  onReady?: () => void
}

const renderer = vi.hoisted(() => {
  const instances: FakeStudioLotView[] = []

  class FakeStudioLotView {
    readonly options: FakeViewOptions
    readonly selectedBuildings: string[] = []
    destroyed = false
    cameraCalls = 0

    constructor(options: FakeViewOptions) {
      this.options = options
      instances.push(this)
      queueMicrotask(() => options.onReady?.())
    }

    activateCasting() {
      this.options.onAction?.({ buildingId: 'casting', action: 'browse-talent' })
    }

    setSnapshot() {}
    setInputSuspended() {}
    select(id: string) { this.selectedBuildings.push(id) }
    clearSelection() {}
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {}
    selectHollywoodPerson() {}
    selectHollywoodProduction() { return true }
    selectHollywoodSceneryLoadIn() { return true }
    selectHollywoodAnnexPlace() { return true }
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() { this.cameraCalls += 1 }
    showHollywoodPublicity() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    destroy() { this.destroyed = true }
  }

  return { instances, FakeStudioLotView }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeStudioLotView }))

function readyCastingState(seed: string): GameState {
  const required: Readonly<Record<CreativeRole, number>> = {
    actor: 3,
    director: 1,
    writer: 1,
    craft: 1,
  }
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards.filter((card) => card.profile.role === role).slice(0, required[role])
    if (selected.length !== required[role]) throw new Error(`setup: missing ${role}`)
    for (const card of selected) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  state = founded.next

  const commission = scriptProjectsBoard(state).commission
  const concept = commission.concepts[0]
  const writer = commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) {
    throw new Error('setup: missing commission payload')
  }
  const started = commissionScriptAction(state, {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: 'mysteryHook',
      midpoint: 'revelation',
      ending: 'bittersweet',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.4, 0.4],
        tonalWeight: [-0.4, 0.4],
        kineticEnergy: [-0.4, 0.4],
      },
    },
  })
  if (!started.ok) throw new Error(started.error)
  state = advanceWeek(started.next).next
  const review = scriptProjectsBoard(state).sections.needsReview[0]
  const accept = review?.legalActions.find((action) => action.kind === 'acceptScript')
  if (review === undefined || accept === undefined) {
    throw new Error('setup: screenplay did not reach acceptance')
  }
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  return accepted.next
}

function acceptedAudition(seed: string): {
  before: GameState
  after: GameState
  receipt: LotAuditionPlanningReceipt
} {
  const before = readyCastingState(seed)
  const ready = castingSessionsBoard(before).sections.readyToPlan[0]
  const ids = ready?.candidates.lead.map((candidate) => candidate.id) ?? []
  if (ready === undefined || ids.length < 3) {
    throw new Error('setup: no complete Casting slate')
  }
  const payload = {
    projectId: ready.projectId,
    slate: {
      lead: [ids[0]!, ids[1]!] as [string, string],
      antagonist: [ids[0]!, ids[1]!] as [string, string],
      support: [ids[0]!, ids[2]!] as [string, string],
    },
  }
  const started = startCastingSessionAction(before, payload)
  if (!started.ok) throw new Error(started.error)
  const receipt = acceptedLotAuditionPlanningReceipt(before, started.next, payload)
  if (receipt === null) throw new Error('setup: no strict Casting-session receipt')
  return { before, after: started.next, receipt }
}

async function onlyView(): Promise<InstanceType<typeof renderer.FakeStudioLotView>> {
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  return renderer.instances[0]!
}

beforeEach(() => {
  localStorage.clear()
  renderer.instances.length = 0
  resetLotSelectedBuilding()
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  renderer.instances.length = 0
  resetLotSelectedBuilding()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  vi.restoreAllMocks()
})

describe('StudioLotScreen — retained audition-planning origin', () => {
  it.each(['semantic', 'renderer'] as const)(
    'offers the exact connected current Casting cue from the %s surface and retains this world',
    async (source) => {
      const state = readyCastingState(`lot-audition-origin-${source}`)
      const ready = castingSessionsBoard(state)
      const title = ready.sections.readyToPlan[0]?.title
      if (title === undefined) throw new Error('setup: no Ready screenplay')
      const onOpen = vi.fn((_rendered: GameState, _origin: LotAuditionPlanningOrigin) => true)
      const onNavigate = vi.fn()
      render(
        <StudioLotScreen
          state={state}
          onNavigate={onNavigate}
          onExit={vi.fn()}
          onAdvance={vi.fn()}
          onOpenAuditionPlanning={onOpen}
        />,
      )
      const view = await onlyView()
      const lot = screen.getByTestId('studio-lot-screen')
      const canvas = screen.getByTestId('studio-lot-canvas')
      const opener = screen.getByTestId('lot-nav-casting') as HTMLButtonElement
      const selectedBuildings = [...view.selectedBuildings]
      const cameraCalls = view.cameraCalls

      if (source === 'semantic') fireEvent.click(opener)
      else act(() => view.activateCasting())

      expect(onOpen).toHaveBeenCalledOnce()
      const [renderedState, origin] = onOpen.mock.calls[0]!
      expect(renderedState).toBe(state)
      expect(origin.opener).toBe(opener)
      expect(origin.opener.isConnected).toBe(true)
      expect(origin.cue).toEqual({
        buildingId: 'casting',
        action: 'browse-talent',
        attention: 'positive',
        reason: `${title} — auditions optional`,
      })
      expect(screen.getByTestId('lot-nav-casting-state')).toHaveTextContent(origin.cue.reason)
      expect(onNavigate).not.toHaveBeenCalled()
      expect(opener).toHaveAttribute('aria-current', 'true')
      expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
      expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
      expect(renderer.instances).toEqual([view])
      expect(view.destroyed).toBe(false)
      expect(view.selectedBuildings).toEqual(selectedBuildings)
      expect(view.cameraCalls).toBe(cameraCalls)
    },
  )

  it.each(['missing', 'declined', 'cue-mismatch'] as const)(
    'keeps the canonical Casting Room route when retained origin is %s',
    async (kind) => {
      const state = readyCastingState(`lot-audition-origin-${kind}`)
      const onNavigate = vi.fn()
      const onOpen = kind === 'missing'
        ? undefined
        : vi.fn((_rendered: GameState, _origin: LotAuditionPlanningOrigin) => false)
      render(
        <StudioLotScreen
          state={state}
          onNavigate={onNavigate}
          onExit={vi.fn()}
          onAdvance={vi.fn()}
          {...(onOpen === undefined ? {} : { onOpenAuditionPlanning: onOpen })}
        />,
      )
      await onlyView()
      const opener = screen.getByTestId('lot-nav-casting')
      if (kind === 'cue-mismatch') opener.setAttribute('data-attention', 'warning')

      fireEvent.click(opener)

      if (kind === 'declined') expect(onOpen).toHaveBeenCalledOnce()
      else if (onOpen !== undefined) expect(onOpen).not.toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalledOnce()
      expect(onNavigate).toHaveBeenCalledWith({ kind: 'castingRoom' })
    },
  )
})

describe('StudioLotScreen — retained audition-planning receipt', () => {
  it('consumes one exact current receipt into Casting without remounting or claiming camera', async () => {
    const { after, receipt } = acceptedAudition('lot-live-audition-receipt')
    const identity = {}
    const consumed = vi.fn()
    const onNavigate = vi.fn()
    const props = {
      state: after,
      entryFocus: 'studio-home' as const,
      onNavigate,
      onExit: vi.fn(),
      onAdvance: vi.fn(),
      onLiveAuditionConsumed: consumed,
    }
    const rendered = render(<StudioLotScreen {...props} />)
    const view = await onlyView()
    const lot = screen.getByTestId('studio-lot-screen')
    const canvas = screen.getByTestId('studio-lot-canvas')
    const cameraCalls = view.cameraCalls
    const selectedBuildings = [...view.selectedBuildings]

    rendered.rerender(
      <StudioLotScreen
        {...props}
        worldInputSuspended
        liveAuditionPresentation={{ identity, acceptedState: after, receipt }}
      />,
    )
    expect(consumed).not.toHaveBeenCalled()
    expect(screen.queryByTestId('lot-audition-planning-witness')).not.toBeInTheDocument()

    rendered.rerender(
      <StudioLotScreen
        {...props}
        liveAuditionPresentation={{ identity, acceptedState: after, receipt }}
      />,
    )

    await waitFor(() => expect(consumed).toHaveBeenCalledOnce())
    expect(consumed).toHaveBeenCalledWith(identity)
    const witness = screen.getByTestId('lot-audition-planning-witness')
    expect(witness).toHaveAttribute('data-session-id', receipt.sessionId)
    expect(witness).toHaveAttribute('data-project-id', receipt.projectId)
    expect(witness).toHaveTextContent('CASTING · CAMERA TESTS UNDERWAY')
    expect(within(witness).getByRole('heading', { name: receipt.title })).toHaveFocus()
    expect(screen.getByTestId('lot-nav-casting')).toHaveAttribute('aria-current', 'true')

    const facts = within(screen.getByTestId('lot-audition-planning-facts'))
    expect(facts.getByText('Started').closest('div')).toHaveTextContent(
      `Week ${String(receipt.startedWeek)}`,
    )
    expect(facts.getByText('Due').closest('div')).toHaveTextContent(
      `Week ${String(receipt.dueWeek)}`,
    )
    expect(facts.getByText('Facility').closest('div')).toHaveTextContent(receipt.facilityName)
    expect(facts.getByText('Slot').closest('div')).toHaveTextContent(String(receipt.slot + 1))

    const reads = within(screen.getByTestId('lot-audition-planning-reads'))
      .getAllByRole('listitem')
    expect(reads).toHaveLength(6)
    for (const [index, read] of receipt.reads.entries()) {
      expect(reads[index]).toHaveAttribute('data-role', read.role)
      expect(reads[index]).toHaveAttribute('data-talent-id', read.talentId)
      expect(reads[index]).toHaveTextContent(read.name)
    }
    expect(screen.getByTestId('lot-audition-planning-boundary')).toHaveTextContent(
      'did not hire, sign, hold, pay, reserve, make busy, assign, move, or choose any Actor',
    )
    const activity = screen.getByTestId('hollywood-activity-message')
    expect(activity).toHaveTextContent(`Camera tests underway for ${receipt.title}`)
    expect(activity).toHaveTextContent(`Started Week ${String(receipt.startedWeek)}`)
    for (const read of receipt.reads) expect(activity).toHaveTextContent(read.name)

    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(view.destroyed).toBe(false)
    expect(view.cameraCalls).toBe(cameraCalls)
    expect(view.selectedBuildings).toEqual(selectedBuildings)

    rendered.rerender(
      <StudioLotScreen
        {...props}
        liveAuditionPresentation={{ identity, acceptedState: after, receipt }}
      />,
    )
    expect(consumed).toHaveBeenCalledOnce()
    expect(renderer.instances).toEqual([view])

    fireEvent.click(screen.getByTestId('lot-audition-planning-open-details'))
    expect(onNavigate).toHaveBeenCalledWith({ kind: 'castingRoom' })
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(screen.queryByTestId('lot-audition-planning-witness')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('lot-nav-casting'))
    expect(screen.queryByTestId('lot-audition-planning-witness')).not.toBeInTheDocument()
    expect(consumed).toHaveBeenCalledOnce()
  })

  it.each(['stale', 'malformed', 'state-mismatched'] as const)(
    'consumes a %s receipt once and fails neutral without substitution',
    async (kind) => {
      const { after, receipt } = acceptedAudition(`lot-live-audition-${kind}`)
      const identity = {}
      const consumed = vi.fn()
      const props = {
        state: after,
        entryFocus: 'studio-home' as const,
        onNavigate: vi.fn(),
        onExit: vi.fn(),
        onAdvance: vi.fn(),
        onLiveAuditionConsumed: consumed,
      }
      const rendered = render(<StudioLotScreen {...props} />)
      const view = await onlyView()
      const lot = screen.getByTestId('studio-lot-screen')
      const canvas = screen.getByTestId('studio-lot-canvas')
      const cameraCalls = view.cameraCalls
      const selectedBuildings = [...view.selectedBuildings]

      let acceptedState = after
      let presentedReceipt: LotAuditionPlanningReceipt = receipt
      if (kind === 'stale') {
        presentedReceipt = { ...receipt, sessionId: `${receipt.sessionId}-missing` }
      } else if (kind === 'malformed') {
        const { reads: _removed, ...malformed } = receipt
        presentedReceipt = malformed as unknown as LotAuditionPlanningReceipt
      } else {
        acceptedState = structuredClone(after)
      }
      const presentation = { identity, acceptedState, receipt: presentedReceipt }

      rendered.rerender(
        <StudioLotScreen {...props} liveAuditionPresentation={presentation} />,
      )

      await waitFor(() => expect(consumed).toHaveBeenCalledOnce())
      expect(consumed).toHaveBeenCalledWith(identity)
      expect(screen.queryByTestId('lot-audition-planning-witness')).not.toBeInTheDocument()
      expect(screen.queryByTestId('lot-audition-planning-facts')).not.toBeInTheDocument()
      expect(screen.queryByTestId('lot-audition-planning-reads')).not.toBeInTheDocument()
      expect(screen.queryByTestId('hollywood-activity-message')).not.toBeInTheDocument()
      expect(screen.getByTestId('lot-nav-casting')).not.toHaveAttribute('aria-current')
      await waitFor(() => expect(screen.getByTestId('lot-studio-heading')).toHaveFocus())
      expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
      expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
      expect(renderer.instances).toEqual([view])
      expect(view.cameraCalls).toBe(cameraCalls)
      expect(view.selectedBuildings).toEqual(selectedBuildings)

      rendered.rerender(
        <StudioLotScreen {...props} liveAuditionPresentation={presentation} />,
      )
      expect(consumed).toHaveBeenCalledOnce()
    },
  )
})
