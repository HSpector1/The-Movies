import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { useState } from 'react'
import { act, cleanup, fireEvent, render, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GameState } from '../engine/adapter.ts'
import {
  advanceWeek,
  importSaveJson,
  runProductionCommand,
  startDevelopmentCastingAnnexAction,
  studioLotSnapshot,
} from '../engine/adapter.ts'
import { setOperationHollywoodOverride } from '../flags.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'

const delayedRenderer = vi.hoisted(() => {
  let releaseImport!: () => void
  const importReady = new Promise<void>((resolve) => { releaseImport = resolve })
  const instances: FakeView[] = []

  class FakeView {
    snapshots: Array<{
      week: number
      buildings: Array<{ id: string; constructionStatus?: string; constructionProgressText?: string }>
      productionOperations?: Array<{
        productionId: string
        taskStatus: string | null
        currentCommand: { kind: string } | null
      }>
    }> = []
    scenerySelections: string[] = []
    destroyed = false

    constructor(options: {
      snapshot: {
        week: number
        buildings: Array<{ id: string; constructionStatus?: string; constructionProgressText?: string }>
        productionOperations?: Array<{
          productionId: string
          taskStatus: string | null
          currentCommand: { kind: string } | null
        }>
      }
      onReady?: () => void
    }) {
      this.snapshots.push(options.snapshot)
      instances.push(this)
      queueMicrotask(() => options.onReady?.())
    }

    setSnapshot(snapshot: {
      week: number
      buildings: Array<{ id: string; constructionStatus?: string; constructionProgressText?: string }>
    }) { this.snapshots.push(snapshot) }
    select() {}
    clearSelection() {}
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {}
    selectHollywoodPerson() {}
    selectHollywoodProduction() {}
    selectHollywoodSceneryLoadIn(productionId: string) {
      this.scenerySelections.push(productionId)
      return true
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

  return { FakeView, importReady, instances, releaseImport }
})

vi.mock('./StudioLotView.ts', async () => {
  await delayedRenderer.importReady
  return { StudioLotView: delayedRenderer.FakeView }
})

function LotHarness({ initialState }: { initialState: GameState }) {
  const [state, setState] = useState(initialState)
  return (
    <StudioLotScreen
      state={state}
      onNavigate={() => {}}
      onExit={() => {}}
      onAdvance={() => setState((current) => advanceWeek(current).next)}
      onStartDevelopmentCastingAnnex={() => {
        const result = startDevelopmentCastingAnnexAction(state)
        if (result.ok) setState(result.next)
        return result
      }}
      onProductionCommand={(command) => {
        const result = runProductionCommand(state, command)
        if (result.ok) setState(result.next)
        return result
      }}
    />
  )
}

function blockedSceneryFixture(): GameState {
  const bytes = readFileSync(resolve(
    process.cwd(),
    'ui/e2e/world-first-scenery-load-in-v1/week-30-nights-of-watchtower-stage-7-blocked.save.json',
  ), 'utf8')
  const imported = importSaveJson(bytes)
  if (!imported.ok) throw new Error(imported.error)
  // C2a-M2 — THE FIXTURE IS PINNED, THE LIVE FORMAT MOVED. This artefact is a frozen,
  // manifest-pinned SaveFileV13 and the live format is V14, so loading it IS a
  // migration and `converted` is true where it used to be false. What the guard is for
  // has not changed, and its grip is TIGHTER: it names the exact envelope version the
  // fixture was frozen at instead of "whatever the live version happens to be".
  if ((JSON.parse(bytes) as { saveVersion?: unknown }).saveVersion !== 13) {
    throw new Error('expected the pinned SaveFileV13 scenery fixture')
  }
  return imported.state
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  resetLotStageAssignment()
  setOperationHollywoodOverride(false)
  delayedRenderer.instances.length = 0
})

describe('StudioLotScreen — delayed renderer import', () => {
  it('constructs first world frames from latest App-owned Building and accepted scenery truth', async () => {
    setOperationHollywoodOverride(true)
    const blocked = blockedSceneryFixture()
    const started = startDevelopmentCastingAnnexAction(blocked)
    if (!started.ok) throw new Error(started.error)
    const expected = advanceWeek(started.next).next
    const expectedBlockedOperation = studioLotSnapshot(expected).productionOperations?.find(
      (operation) => operation.locationBuildingId === 'stage-a',
    )
    if (expectedBlockedOperation?.currentCommand?.kind !== 'clearSceneryLoadIn') {
      throw new Error('advanced fixture lacks Stage 7 clear command')
    }
    const expectedReady = runProductionCommand(expected, expectedBlockedOperation.currentCommand)
    if (!expectedReady.ok) throw new Error(expectedReady.error)
    const sceneryOperation = studioLotSnapshot(expectedReady.next).productionOperations?.find(
      (operation) => operation.productionId === expectedBlockedOperation.productionId,
    )
    if (!sceneryOperation) throw new Error('fixture lacks Stage 7 ready successor')
    const lot = render(<LotHarness initialState={blocked} />)
    const surface = within(lot.container)

    expect(delayedRenderer.instances).toHaveLength(0)
    fireEvent.click(surface.getByTestId('lot-nav-expansion'))
    fireEvent.click(await surface.findByTestId('lot-annex-build'))
    expect(await surface.findByTestId('lot-annex-building-facts')).toHaveTextContent(
      '0 of 13 weekly advances complete',
    )
    fireEvent.click(surface.getByTestId('lot-advance-week'))
    expect(surface.getByText(`Studio Chronicle · Hollywood, 1948 · Week ${expected.market.tick}`))
      .toBeInTheDocument()
    expect(surface.getByTestId('lot-annex-progress-text')).toHaveTextContent(
      '1 of 13 weekly advances complete',
    )

    // The native semantic surface is live before Phaser arrives. Accept Clear now;
    // construction must never paint the mount-time blocked snapshot a moment later.
    fireEvent.click(surface.getByTestId('lot-nav-service-yard'))
    fireEvent.click(await surface.findByTestId(
      'hollywood-production-command-clearSceneryLoadIn',
    ))
    expect(await surface.findByTestId(
      'hollywood-production-command-scheduleShootingTake',
    )).toBeEnabled()
    expect(surface.getByTestId('hollywood-scenery-load-in-status')).toHaveTextContent('ready')
    expect(delayedRenderer.instances).toHaveLength(0)

    await act(async () => {
      delayedRenderer.releaseImport()
      await delayedRenderer.importReady
    })

    await waitFor(() => expect(delayedRenderer.instances).toHaveLength(1))
    const view = delayedRenderer.instances[0]!
    expect(view.snapshots[0]?.week).toBe(expected.market.tick)
    expect(view.snapshots[0]?.buildings.find((building) => building.id === 'expansion'))
      .toMatchObject({
        constructionStatus: 'building',
        constructionProgressText: '1 of 13 weekly advances complete',
      })
    const firstSceneryOperation = view.snapshots[0]?.productionOperations?.find(
      (operation) => operation.productionId === sceneryOperation.productionId,
    )
    expect(firstSceneryOperation).toMatchObject({
      taskStatus: 'ready',
      currentCommand: { kind: 'scheduleShootingTake' },
    })
    await waitFor(() => expect(view.scenerySelections.length).toBeGreaterThan(0))
    expect(view.scenerySelections[0]).toBe(sceneryOperation.productionId)
    expect(view.scenerySelections.every(
      (productionId) => productionId === sceneryOperation.productionId,
    )).toBe(true)
    expect(view.snapshots.every((snapshot) => snapshot.productionOperations?.some(
      (operation) =>
        operation.productionId === sceneryOperation.productionId &&
        operation.taskStatus === 'ready' &&
        operation.currentCommand?.kind === 'scheduleShootingTake',
    ))).toBe(true)
    expect(view.destroyed).toBe(false)
  })
})
