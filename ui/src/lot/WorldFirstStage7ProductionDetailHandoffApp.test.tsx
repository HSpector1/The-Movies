import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App.tsx'
import type { GameState } from '../engine/adapter.ts'
import {
  exportSaveJson,
  importSaveJson,
  studioLotSnapshot,
} from '../engine/adapter.ts'
import {
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
} from '../engine/session.ts'
import {
  clearOperationHollywoodOverride,
  clearStudioLotOverviewOverride,
  setOperationHollywoodOverride,
  setStudioLotOverviewOverride,
} from '../flags.ts'
import type { LotRoute } from './navigation.ts'
import type { Stage7ProductionOwnerIntent } from './snapshot/stage7Production.ts'
import * as stage7Selector from './snapshot/stage7Production.ts'

type LotProbeProps = {
  state: GameState
  entryFocus?:
    | 'studio-home'
    | 'selected-building'
    | 'advance-week'
    | 'publicity-campaign'
    | 'annex-work'
    | 'stage-7-production'
  entryStage7ProductionId?: string
  onNavigate: (route: LotRoute) => void
  onExit: () => void
  onOpenStage7ProductionDetails?: (
    intent: Stage7ProductionOwnerIntent,
  ) => boolean
}

const appProbe = vi.hoisted(() => ({
  acknowledgements: [] as boolean[],
  entries: [] as Array<{
    focus: LotProbeProps['entryFocus']
    productionId: string | undefined
    taskStatus: string | null
    week: number
  }>,
}))

// This suite owns the App navigation boundary. Keep Phaser and the much larger Lot host out of
// it while preserving the dedicated identity-only callback and the typed return props verbatim.
vi.mock('./StudioLotScreen.tsx', async () => {
  const adapter = await vi.importActual<typeof import('../engine/adapter.ts')>(
    '../engine/adapter.ts',
  )
  return {
    default: (props: LotProbeProps) => {
      const stage7 = adapter.studioLotSnapshot(props.state).productionOperations?.find(
        (operation) => operation.locationBuildingId === 'stage-a',
      ) ?? null
      appProbe.entries.push({
        focus: props.entryFocus,
        productionId: props.entryStage7ProductionId,
        taskStatus: stage7?.taskStatus ?? null,
        week: props.state.market.tick,
      })

      const request = (intent: Stage7ProductionOwnerIntent) => {
        appProbe.acknowledgements.push(
          props.onOpenStage7ProductionDetails?.(intent) ?? false,
        )
      }

      return (
        <main
          data-testid="stage7-app-lot-probe"
          data-entry-focus={props.entryFocus}
          data-entry-production-id={props.entryStage7ProductionId ?? 'none'}
          data-stage7-production-id={stage7?.productionId ?? 'none'}
          data-stage7-task-status={stage7?.taskStatus ?? 'none'}
        >
          <button
            type="button"
            data-testid="stage7-app-open-exact"
            disabled={stage7 === null}
            onClick={() => {
              if (stage7 === null) return
              request({
                productionId: stage7.productionId,
                locationBuildingId: 'stage-a',
              })
            }}
          >
            Open exact Stage 7 details
          </button>
          <button
            type="button"
            data-testid="stage7-app-open-stale"
            onClick={() => request({
              productionId: 'prod-stale-or-replaced',
              locationBuildingId: 'stage-a',
            })}
          >
            Open stale Stage 7 details
          </button>
        </main>
      )
    },
  }
})

const BLOCKED_FIXTURE = resolve(
  process.cwd(),
  'ui/e2e/world-first-scenery-load-in-v1/week-30-nights-of-watchtower-stage-7-blocked.save.json',
)

function nativeBlockedStudio(): GameState {
  const bytes = readFileSync(BLOCKED_FIXTURE, 'utf8')
  const imported = importSaveJson(bytes)
  if (!imported.ok) throw new Error(imported.error)
  if (imported.converted) throw new Error('expected a native SaveFileV11 Stage 7 fixture')
  if (exportSaveJson(imported.state) !== bytes) {
    throw new Error('native Stage 7 fixture did not replay byte-identically')
  }
  return imported.state
}

function exactStage7(state: GameState) {
  const exact = stage7Selector.stage7ProductionDetailContext(studioLotSnapshot(state))
  if (exact === null) throw new Error('expected one strict current Stage 7 detail context')
  return exact
}

async function restoreStage7Studio() {
  const state = nativeBlockedStudio()
  const exact = exactStage7(state)
  saveActiveSession(state)
  render(<App />)
  await screen.findByTestId('stage7-app-lot-probe')
  return { state, exact }
}

beforeEach(() => {
  localStorage.clear()
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
  appProbe.acknowledgements.length = 0
  appProbe.entries.length = 0
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  clearActiveSession()
  clearStudioLotOverviewOverride()
  clearOperationHollywoodOverride()
  localStorage.clear()
})

describe('Selected Stage 7 detail handoff — App owner boundary', () => {
  it('independently reselects latest Engine truth, focuses the exact Board card, and returns the typed exact identity byte-neutrally', async () => {
    const { state, exact } = await restoreStage7Studio()
    const bytesBefore = exportSaveJson(state)
    const selector = vi.spyOn(stage7Selector, 'stage7ProductionDetailContext')

    fireEvent.click(screen.getByTestId('stage7-app-open-exact'))

    expect(appProbe.acknowledgements).toEqual([true])
    expect(await screen.findByTestId(`active-${exact.ownerIntent.productionId}`)).toHaveTextContent(
      exact.operation.title,
    )
    await waitFor(() => expect(
      screen.getByTestId(
        `production-command-${exact.operation.currentCommand?.kind}-${exact.ownerIntent.productionId}`,
      ),
    ).toHaveFocus())
    expect(selector).toHaveBeenCalledTimes(1)
    expect(selector.mock.calls[0]?.[0]).toMatchObject({
      week: state.market.tick,
      operationsMode: 'managed',
      stageAssignmentAuthority: 'engine',
    })

    fireEvent.click(screen.getByTestId('back-to-studio-lot'))

    const returned = await screen.findByTestId('stage7-app-lot-probe')
    expect(returned).toHaveAttribute('data-entry-focus', 'stage-7-production')
    expect(returned).toHaveAttribute(
      'data-entry-production-id',
      exact.ownerIntent.productionId,
    )
    // App validates before entering the Board. Direct Back deliberately preserves the typed
    // stale-sensitive identity so the real Lot can reject it without auto-selecting a replacement.
    expect(selector).toHaveBeenCalledTimes(1)
    const restored = loadActiveSession()
    expect(restored.ok).toBe(true)
    if (!restored.ok) throw new Error('expected the active session to remain valid')
    expect(exportSaveJson(restored.state)).toBe(bytesBefore)
  })

  it('rejects an unproven identity without unmounting the Lot or changing any save byte', async () => {
    const { state } = await restoreStage7Studio()
    const bytesBefore = exportSaveJson(state)

    fireEvent.click(screen.getByTestId('stage7-app-open-stale'))

    expect(appProbe.acknowledgements).toEqual([false])
    expect(screen.getByTestId('stage7-app-lot-probe')).toBeInTheDocument()
    expect(screen.queryByTestId('production-board')).not.toBeInTheDocument()
    const restored = loadActiveSession()
    expect(restored.ok).toBe(true)
    if (!restored.ok) throw new Error('expected the active session to remain valid')
    expect(exportSaveJson(restored.state)).toBe(bytesBefore)
  })

  it('returns to fresh exact Stage 7 truth after one existing Board command', async () => {
    const { exact } = await restoreStage7Studio()
    expect(exact.operation.taskStatus).toBe('blocked')

    fireEvent.click(screen.getByTestId('stage7-app-open-exact'))
    const command = await screen.findByTestId(
      `production-command-clearSceneryLoadIn-${exact.ownerIntent.productionId}`,
    )
    fireEvent.click(command)
    await waitFor(() => expect(
      screen.getByTestId(
        `production-command-scheduleShootingTake-${exact.ownerIntent.productionId}`,
      ),
    ).toHaveFocus())

    fireEvent.click(screen.getByTestId('back-to-studio-lot'))

    const returned = await screen.findByTestId('stage7-app-lot-probe')
    expect(returned).toHaveAttribute('data-entry-focus', 'stage-7-production')
    expect(returned).toHaveAttribute(
      'data-entry-production-id',
      exact.ownerIntent.productionId,
    )
    expect(returned).toHaveAttribute('data-stage7-task-status', 'ready')
  })

  it('preserves the old typed identity for the remounted Lot to reject without replacement auto-selection', async () => {
    const { state, exact } = await restoreStage7Studio()
    const currentContext = exactStage7(state)
    const selector = vi.spyOn(stage7Selector, 'stage7ProductionDetailContext')
      .mockReturnValueOnce(currentContext)

    fireEvent.click(screen.getByTestId('stage7-app-open-exact'))
    expect(await screen.findByTestId(`active-${exact.ownerIntent.productionId}`)).toBeInTheDocument()
    selector.mockReturnValue(null)
    fireEvent.click(screen.getByTestId('back-to-studio-lot'))

    const returned = await screen.findByTestId('stage7-app-lot-probe')
    expect(returned).toHaveAttribute('data-entry-focus', 'stage-7-production')
    expect(returned).toHaveAttribute(
      'data-entry-production-id',
      exact.ownerIntent.productionId,
    )
    expect(selector).toHaveBeenCalledOnce()
  })

  it('demotes Stage 7 identity to studio-home across unrelated Dashboard child navigation', async () => {
    const { exact } = await restoreStage7Studio()

    fireEvent.click(screen.getByTestId('stage7-app-open-exact'))
    expect(await screen.findByTestId(`active-${exact.ownerIntent.productionId}`)).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('open-roster'))
    fireEvent.click(await screen.findByTestId('roster-back'))

    const returned = await screen.findByTestId('stage7-app-lot-probe')
    expect(returned).toHaveAttribute('data-entry-focus', 'studio-home')
    expect(returned).toHaveAttribute('data-entry-production-id', 'none')
  })
})
