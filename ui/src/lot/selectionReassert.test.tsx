// ── C1-M5 flake fix — the repaint re-assert only fires when it has work ──────
//
// THE DEFECT, stated once. The host runs a repaint-reconciliation effect on every
// `state` / `canvasReady` tick whose job is to RESTORE the world's selection after a
// snapshot delivery or a canvas recreation. It re-asserted unconditionally, so an extra
// tick landing inside a `waitFor` dispatched a second identical select — and three
// separate React-boundary specs, each counting exact renderer calls, saw two selections
// where the player made one. All three were green in isolation and flaky under load,
// which is exactly what a redundant-but-harmless second dispatch looks like.
//
// THE PROPERTY, proven here directly rather than inferred from a flake going quiet:
//
//   • a repaint arriving while the renderer ALREADY holds the selection produces ZERO
//     additional select calls, however many repaints arrive;
//   • a canvas RECREATION — where the selection is genuinely lost, which is the only
//     reason this effect exists — still produces exactly ONE re-assert.
//
// The guard reads the RENDERER's own live fields (`worldSelection()`). The host keeps
// no copy of what the world is showing: a cached answer here would be the
// stale-identity trap this campaign keeps finding.

import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GameState } from '../engine/adapter.ts'
import {
  advanceWeek,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  signContractAction,
  startDevelopmentCastingAnnexAction,
} from '../engine/adapter.ts'
import { setOperationHollywoodOverride, setStudioLotOverviewOverride } from '../flags.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'
import { StudioLotScreen } from './StudioLotScreen.tsx'

const renderer = vi.hoisted(() => {
  type Options = {
    snapshot: unknown
    onReady?: () => void
  }
  const instances: FakeView[] = []

  /**
   * A faithful renderer double: it OBEYS a select and then REPORTS holding it, exactly
   * as `HollywoodScene`/`TycoonScene` do through their own `currentSelection()`. A
   * double that recorded commands but claimed to hold nothing would make this whole
   * property untestable — and was what let the redundant dispatch hide.
   */
  class FakeView {
    readonly opts: Options
    readonly snapshots: unknown[] = []
    readonly annexSelections: number[] = []
    heldPlaceId: string | null = null
    heldProductionId: string | null = null
    heldPersonId: string | null = null
    destroyed = false

    constructor(opts: Options) {
      this.opts = opts
      this.snapshots.push(opts.snapshot)
      instances.push(this)
      queueMicrotask(() => opts.onReady?.())
    }

    worldSelection() {
      return {
        placeId: this.heldPlaceId,
        productionId: this.heldProductionId,
        personId: this.heldPersonId,
      }
    }

    setSnapshot(snapshot: unknown) { this.snapshots.push(snapshot) }
    select() {}
    clearSelection() {}
    selectHollywoodAnnexPlace() {
      this.annexSelections.push(this.snapshots.length)
      this.heldPlaceId = 'annex-parcel'
      return true
    }
    selectHollywoodPerson(id: string) { this.heldPersonId = id }
    selectHollywoodProduction(id: string) {
      this.heldProductionId = id
      this.heldPlaceId = 'stage-7'
      return true
    }
    selectHollywoodSceneryLoadIn(id: string) {
      this.heldProductionId = id
      this.heldPlaceId = 'service-yard'
      return true
    }
    selectHollywoodProductionCompany() { return true }
    clearHollywoodProductionCompanySelection() {}
    clearHollywoodPersonSelection() { this.heldPersonId = null }
    clearHollywoodPlaceSelection() {
      this.heldPlaceId = null
      this.heldProductionId = null
    }
    selectHollywoodPublicityPlace() { return true }
    selectHollywoodGatePlace() { return true }
    setHollywoodGateVisitor() { return true }
    focusHollywoodGate() { return true }
    focusHollywoodPlace() {}
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
    hollywoodDebugState() { return null }
    hollywoodPerformance() { return null }
    destroy() { this.destroyed = true }
  }

  return { FakeView, instances }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

const COUNTS = { actor: 3, director: 1, writer: 1, craft: 1 } as const

/** A managed studio with an OPERATIONAL Annex — the surface this effect re-asserts. */
function studioWithAnnex(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  const started = startDevelopmentCastingAnnexAction(founded.next)
  if (!started.ok) throw new Error(started.error)
  state = started.next
  for (let week = 0; week < 13; week++) state = advanceWeek(state).next
  return state
}

function Harness({ initial }: { initial: GameState }) {
  const [state, setState] = useState(initial)
  return (
    <>
      <button type="button" data-testid="tick" onClick={() => setState((current) => ({ ...current }))}>
        tick
      </button>
      <StudioLotScreen
        state={state}
        onNavigate={() => {}}
        onExit={() => {}}
        onAdvance={() => {}}
      />
    </>
  )
}

beforeEach(() => {
  renderer.instances.length = 0
  resetLotStageAssignment()
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  setStudioLotOverviewOverride(false)
  setOperationHollywoodOverride(false)
})

describe('C1-M5 — the repaint re-assert fires only when the renderer lost the selection', () => {
  it('adds ZERO renderer selects when repaints arrive over a selection it already holds', async () => {
    const state = studioWithAnnex('c1-m5-reassert-idle')
    render(<Harness initial={state} />)
    // The renderer is lazily imported, so it appears a tick after the first paint.
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    const view = renderer.instances[0]!

    // Land the Annex context through the companion control the player uses.
    await act(async () => {
      fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    })
    await waitFor(() => expect(view.annexSelections.length).toBeGreaterThan(0))
    const afterActivation = view.annexSelections.length
    expect(view.heldPlaceId).toBe('annex-parcel')

    // …then drive TEN repaints. Each one is a fresh `state` identity — exactly the tick
    // that used to slip inside a `waitFor` and double the count.
    for (let tick = 0; tick < 10; tick++) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('tick'))
      })
    }
    await waitFor(() => expect(view.snapshots.length).toBeGreaterThan(1))

    // The renderer already holds it, so there is nothing to restore: ZERO more calls.
    expect(view.annexSelections).toHaveLength(afterActivation)
    expect(view.heldPlaceId).toBe('annex-parcel')
  })

  it('re-asserts exactly ONCE when the renderer genuinely lost the selection', async () => {
    const state = studioWithAnnex('c1-m5-reassert-lost')
    render(<Harness initial={state} />)
    // The renderer is lazily imported, so it appears a tick after the first paint.
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    const view = renderer.instances[0]!

    await act(async () => {
      fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    })
    await waitFor(() => expect(view.annexSelections.length).toBeGreaterThan(0))
    const afterActivation = view.annexSelections.length

    // A canvas recreation loses the world's selection — the ONE situation this effect
    // exists for. Model it exactly: the renderer no longer holds anything.
    act(() => {
      view.heldPlaceId = null
      view.heldProductionId = null
    })
    await act(async () => {
      fireEvent.click(screen.getByTestId('tick'))
    })

    // Restored, once — not twice, and not never.
    await waitFor(() => expect(view.heldPlaceId).toBe('annex-parcel'))
    expect(view.annexSelections).toHaveLength(afterActivation + 1)

    // …and further repaints over the restored selection add nothing again.
    for (let tick = 0; tick < 5; tick++) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('tick'))
      })
    }
    expect(view.annexSelections).toHaveLength(afterActivation + 1)
  })

  it('reads the RENDERER, so a world that silently drops a selection is restored', async () => {
    const state = studioWithAnnex('c1-m5-reassert-truth')
    render(<Harness initial={state} />)
    // The renderer is lazily imported, so it appears a tick after the first paint.
    await waitFor(() => expect(renderer.instances).toHaveLength(1))
    const view = renderer.instances[0]!
    await act(async () => {
      fireEvent.click(screen.getByTestId('lot-nav-expansion'))
    })
    await waitFor(() => expect(view.annexSelections.length).toBeGreaterThan(0))

    // Drop it three times; each loss is noticed and repaired on the next repaint. A host
    // that had cached "I already told it" would have repaired none of them — which is
    // precisely why the guard reads the renderer instead of remembering.
    let expected = view.annexSelections.length
    for (let drop = 0; drop < 3; drop++) {
      act(() => { view.heldPlaceId = null })
      await act(async () => {
        fireEvent.click(screen.getByTestId('tick'))
      })
      expected += 1
      await waitFor(() => expect(view.heldPlaceId).toBe('annex-parcel'))
      expect(view.annexSelections).toHaveLength(expected)
    }
  })
})
