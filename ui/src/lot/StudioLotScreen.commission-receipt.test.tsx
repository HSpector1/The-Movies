import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import {
  commissionScriptAction,
  scriptProjectsBoard,
  type CommissionScriptPayload,
  type GameState,
} from '../engine/adapter.ts'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import { newFoundedGame } from '../test/founding.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import type { StudioLotSnapshot } from './snapshot/StudioLotSnapshot.ts'
import {
  acceptedScreenplayCommissionReceipt,
  type ScreenplayCommissionReceipt,
} from './snapshot/scriptCommission.ts'
import { resetLotSelectedBuilding } from './snapshot/selectedBuildingSession.ts'

type FakeViewOptions = {
  snapshot: StudioLotSnapshot
  onReady?: () => void
}

const renderer = vi.hoisted(() => {
  const instances: FakeStudioLotView[] = []

  class FakeStudioLotView {
    readonly snapshots: StudioLotSnapshot[] = []
    readonly selectedBuildings: string[] = []
    cameraCalls = 0
    destroyed = false

    constructor(options: FakeViewOptions) {
      this.snapshots.push(options.snapshot)
      instances.push(this)
      queueMicrotask(() => options.onReady?.())
    }

    setSnapshot(snapshot: StudioLotSnapshot) { this.snapshots.push(snapshot) }
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

function commissionPayload(state: GameState): CommissionScriptPayload {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]
  const writer = board.commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) {
    throw new Error('setup: expected one available screenplay commission')
  }
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: 'mysteryHook',
      midpoint: 'revelation',
      ending: 'bittersweet',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [0, 1],
        kineticEnergy: [-1, 0],
      },
    },
  }
}

function acceptedCommission(seed: string): {
  before: GameState
  after: GameState
  receipt: ScreenplayCommissionReceipt
} {
  const before = applyActions(newFoundedGame(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
  const payload = commissionPayload(before)
  const outcome = commissionScriptAction(before, payload)
  if (!outcome.ok) throw new Error(outcome.error)
  const receipt = acceptedScreenplayCommissionReceipt(before, outcome.next, payload)
  if (receipt === null) throw new Error('setup: expected one exact commission receipt')
  return { before, after: outcome.next, receipt }
}

function baseProps(state: GameState, onConsumed: (identity: object) => void) {
  return {
    state,
    entryFocus: 'studio-home' as const,
    onNavigate: vi.fn(),
    onExit: vi.fn(),
    onAdvance: vi.fn(),
    onLiveCommissionConsumed: onConsumed,
  }
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

describe('StudioLotScreen — retained screenplay commission receipt', () => {
  it('consumes one exact current receipt into Development without remounting or claiming camera', async () => {
    const { after, receipt } = acceptedCommission('lot-live-commission-receipt')
    const identity = {}
    const consumed = vi.fn()
    const props = baseProps(after, consumed)
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
        liveCommissionPresentation={{ identity, acceptedState: after, receipt }}
      />,
    )
    expect(consumed).not.toHaveBeenCalled()
    expect(screen.queryByTestId('lot-screenplay-commission-witness')).not.toBeInTheDocument()

    rendered.rerender(
      <StudioLotScreen
        {...props}
        liveCommissionPresentation={{ identity, acceptedState: after, receipt }}
      />,
    )

    await waitFor(() => expect(consumed).toHaveBeenCalledOnce())
    expect(consumed).toHaveBeenCalledWith(identity)
    const witness = screen.getByTestId('lot-screenplay-commission-witness')
    expect(witness).toHaveAttribute('data-project-id', receipt.projectId)
    expect(witness).toHaveTextContent('DEVELOPMENT · SCREENPLAY COMMISSIONED')
    expect(within(witness).getByRole('heading', { name: receipt.title })).toHaveFocus()
    expect(screen.getByTestId('lot-nav-writers')).toHaveAttribute('aria-current', 'true')

    const facts = within(screen.getByTestId('lot-screenplay-commission-facts'))
    expect(facts.getByText('Writer').closest('div')).toHaveTextContent(receipt.writerName)
    expect(facts.getByText('Commissioned').closest('div')).toHaveTextContent(
      `Week ${String(receipt.commissionedWeek)}`,
    )
    expect(facts.getByText('Due').closest('div')).toHaveTextContent(
      `Week ${String(receipt.dueWeek)}`,
    )
    expect(facts.getByText('Facility').closest('div')).toHaveTextContent(receipt.facilityName)
    expect(facts.getByText('Slot').closest('div')).toHaveTextContent(String(receipt.slot + 1))
    expect(screen.getByTestId('hollywood-activity-message')).toHaveTextContent(
      `Screenplay commissioned: ${receipt.title}. Writer ${receipt.writerName}. ` +
        `Due Week ${String(receipt.dueWeek)} in ${receipt.facilityName}, ` +
        `slot ${String(receipt.slot + 1)}.`,
    )

    expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
    expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
    expect(renderer.instances).toEqual([view])
    expect(view.destroyed).toBe(false)
    expect(view.cameraCalls).toBe(cameraCalls)
    expect(view.selectedBuildings).toEqual(selectedBuildings)

    rendered.rerender(
      <StudioLotScreen
        {...props}
        liveCommissionPresentation={{ identity, acceptedState: after, receipt }}
      />,
    )
    expect(consumed).toHaveBeenCalledOnce()
    expect(renderer.instances).toEqual([view])

    fireEvent.click(screen.getByTestId('lot-nav-admin'))
    expect(screen.queryByTestId('lot-screenplay-commission-witness')).not.toBeInTheDocument()
    expect(screen.getByTestId('lot-nav-admin')).toHaveAttribute('aria-current', 'true')
    fireEvent.click(screen.getByTestId('lot-nav-writers'))
    expect(screen.queryByTestId('lot-screenplay-commission-witness')).not.toBeInTheDocument()
    expect(consumed).toHaveBeenCalledOnce()
  })

  it.each(['stale', 'malformed', 'state-mismatched'] as const)(
    'consumes a %s receipt once and fails neutral without substitution',
    async (kind) => {
      const { after, receipt } = acceptedCommission(`lot-live-commission-${kind}`)
      const identity = {}
      const consumed = vi.fn()
      const props = baseProps(after, consumed)
      const rendered = render(<StudioLotScreen {...props} />)
      const view = await onlyView()
      const lot = screen.getByTestId('studio-lot-screen')
      const canvas = screen.getByTestId('studio-lot-canvas')
      const cameraCalls = view.cameraCalls
      const selectedBuildings = [...view.selectedBuildings]

      let acceptedState = after
      let presentedReceipt: ScreenplayCommissionReceipt = receipt
      if (kind === 'stale') {
        presentedReceipt = { ...receipt, projectId: `${receipt.projectId}-missing` }
      } else if (kind === 'malformed') {
        const { writerName: _removed, ...malformed } = receipt
        presentedReceipt = malformed as unknown as ScreenplayCommissionReceipt
      } else {
        acceptedState = structuredClone(after)
      }
      const presentation = { identity, acceptedState, receipt: presentedReceipt }

      rendered.rerender(
        <StudioLotScreen
          {...props}
          liveCommissionPresentation={presentation}
        />,
      )

      await waitFor(() => expect(consumed).toHaveBeenCalledOnce())
      expect(consumed).toHaveBeenCalledWith(identity)
      expect(screen.queryByTestId('lot-screenplay-commission-witness')).not.toBeInTheDocument()
      expect(screen.queryByTestId('lot-screenplay-commission-facts')).not.toBeInTheDocument()
      expect(screen.queryByTestId('hollywood-activity-message')).not.toBeInTheDocument()
      expect(screen.getByTestId('lot-nav-writers')).not.toHaveAttribute('aria-current')
      await waitFor(() => expect(screen.getByTestId('lot-studio-heading')).toHaveFocus())
      expect(screen.getByTestId('studio-lot-screen')).toBe(lot)
      expect(screen.getByTestId('studio-lot-canvas')).toBe(canvas)
      expect(renderer.instances).toEqual([view])
      expect(view.cameraCalls).toBe(cameraCalls)
      expect(view.selectedBuildings).toEqual(selectedBuildings)

      rendered.rerender(
        <StudioLotScreen
          {...props}
          liveCommissionPresentation={presentation}
        />,
      )
      expect(consumed).toHaveBeenCalledOnce()
    },
  )
})
