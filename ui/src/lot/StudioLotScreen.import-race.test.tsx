import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GameState } from '../engine/adapter.ts'
import { advanceWeek } from '../engine/adapter.ts'
import { setOperationHollywoodOverride } from '../flags.ts'
import { newFoundedGame } from '../test/founding.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'

const delayedRenderer = vi.hoisted(() => {
  let releaseImport!: () => void
  const importReady = new Promise<void>((resolve) => { releaseImport = resolve })
  const instances: FakeView[] = []

  class FakeView {
    snapshots: Array<{ week: number }> = []
    destroyed = false

    constructor(options: {
      snapshot: { week: number }
      onReady?: () => void
    }) {
      this.snapshots.push(options.snapshot)
      instances.push(this)
      queueMicrotask(() => options.onReady?.())
    }

    setSnapshot(snapshot: { week: number }) { this.snapshots.push(snapshot) }
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
  it('constructs the first world frame from the latest App-owned week', async () => {
    const initial = newFoundedGame('live-week-import-race')
    const expectedWeek = advanceWeek(initial).next.market.tick
    render(<LotHarness initialState={initial} />)

    expect(delayedRenderer.instances).toHaveLength(0)
    fireEvent.click(screen.getByTestId('lot-advance-week'))
    expect(screen.getByText(`Studio Lot · Week ${expectedWeek}`)).toBeInTheDocument()

    await act(async () => {
      delayedRenderer.releaseImport()
      await delayedRenderer.importReady
    })

    await waitFor(() => expect(delayedRenderer.instances).toHaveLength(1))
    const view = delayedRenderer.instances[0]!
    expect(view.snapshots[0]?.week).toBe(expectedWeek)
    await waitFor(() => expect(view.snapshots.at(-1)?.week).toBe(expectedWeek))
    expect(view.destroyed).toBe(false)
  })
})
