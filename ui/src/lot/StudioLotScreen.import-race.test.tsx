import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import type { GameState } from '../engine/adapter.ts'
import { advanceWeek, startDevelopmentCastingAnnexAction } from '../engine/adapter.ts'
import { setOperationHollywoodOverride } from '../flags.ts'
import { newFoundedGame } from '../test/founding.ts'
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
    }> = []
    destroyed = false

    constructor(options: {
      snapshot: {
        week: number
        buildings: Array<{ id: string; constructionStatus?: string; constructionProgressText?: string }>
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
    />
  )
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  resetLotStageAssignment()
  setOperationHollywoodOverride(false)
})

describe('StudioLotScreen — delayed renderer import', () => {
  it('constructs the first world frame from the latest App-owned week and Building truth', async () => {
    setOperationHollywoodOverride(true)
    const initial = applyActions(
      newFoundedGame('live-week-import-race'),
      [{ kind: 'activateStudioOperations' }],
    )
    const started = startDevelopmentCastingAnnexAction(initial)
    if (!started.ok) throw new Error(started.error)
    const expected = advanceWeek(started.next).next
    render(<LotHarness initialState={initial} />)

    expect(delayedRenderer.instances).toHaveLength(0)
    fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    fireEvent.click(await screen.findByTestId('lot-annex-build'))
    expect(await screen.findByTestId('lot-annex-building-facts')).toHaveTextContent(
      '0 of 13 weekly advances complete',
    )
    fireEvent.click(screen.getByTestId('lot-advance-week'))
    expect(screen.getByText(`Studio Chronicle · Hollywood, 1948 · Week ${expected.market.tick}`))
      .toBeInTheDocument()
    expect(screen.getByTestId('lot-annex-progress-text')).toHaveTextContent(
      '1 of 13 weekly advances complete',
    )

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
    await waitFor(() => expect(view.snapshots.at(-1)?.week).toBe(expected.market.tick))
    expect(view.destroyed).toBe(false)
  })
})
