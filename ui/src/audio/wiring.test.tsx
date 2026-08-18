// ── PF1-M1 wiring: the call sites, proven where they actually live ───────────
//
// The contract suite proves the SERVICE. This file proves the three places M1 calls
// it from — the autoplay gate in App, the Lot's ambience/music lifetime, and the one
// cancel cue — because a service that works and is never called is silence, and a
// service called on the wrong seam is noise in a hidden tab.

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import type { GameState } from '../../../src/core/index.ts'
import { newFoundedGame } from '../test/founding.ts'
import {
  resetLotSelectedBuilding,
  setLotSelectedBuilding,
} from '../lot/snapshot/selectedBuildingSession.ts'
import { App } from '../App.tsx'
import { StudioLotScreen } from '../lot/StudioLotScreen.tsx'
import { LotRetainedWorkspace } from '../lot/LotRetainedWorkspace.tsx'
import { initAudioService } from './audioService.ts'
import { RecordingSink } from './sink.ts'
import type { RecordedAudioCall } from './sink.ts'

// The renderer is irrelevant to audio and must not drag Phaser into jsdom. This double
// is the smallest thing StudioLotScreen can drive without a canvas.
const renderer = vi.hoisted(() => {
  type Opts = { onReady?: () => void; onSelect?: (sel: unknown) => void }
  // The exact shape the real scenes emit for a building: a resolvable navigation action,
  // not a fabricated null the host would then have to render around.
  const worldSelectionOf = (id: string) => ({
    buildingId: id,
    label: 'Development',
    blurb: 'Develop and assemble your next film.',
    available: true,
    action: 'assemble-film',
    production: null,
  })
  const instances: FakeView[] = []
  class FakeView {
    readonly opts: Opts
    constructor(opts: Opts) {
      this.opts = opts
      instances.push(this)
      queueMicrotask(() => opts.onReady?.())
    }
    setSnapshot() {}
    /**
     * FAITHFUL TO THE RETAINED PLATE, which is the hostile case: `LotScene.selectFromHost`
     * re-emits `selected`, so a host-driven re-assert reaches `onSelect` exactly as a
     * player's click would. (The shipped grid scene paints without emitting.)
     */
    select(id: string) {
      this.opts.onSelect?.(worldSelectionOf(id))
    }
    clearSelection() {}
    triggerAction() {}
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    setInputSuspended() {}
    camera() {}
    resetCamera() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    worldSelection() { return { placeId: null, productionId: null, personId: null } }
    destroy() {}
  }
  return { FakeView, instances }
})

vi.mock('../lot/StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

let sink: RecordingSink

beforeEach(() => {
  sink = new RecordingSink()
  initAudioService(sink)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function loops(kind: 'startLoop' | 'stopLoop'): string[] {
  return sink.log
    .filter((call): call is Extract<RecordedAudioCall, { call: typeof kind }> => call.call === kind)
    .map((call) => call.assetId)
}

describe('PF1-M1 wiring — the autoplay gate lives in App, once', () => {
  it('unlocks on the first pointer gesture anywhere in the document', async () => {
    render(<App />)
    expect(sink.log).toEqual([]) // no gesture yet: the product has made no audio call at all

    fireEvent.pointerDown(document.body)

    await waitFor(() => expect(sink.log[0]).toEqual({ call: 'resume' }))
  })

  it('unlocks on a keyboard-only session too', async () => {
    render(<App />)
    fireEvent.keyDown(document.body, { key: 'Tab' })
    await waitFor(() => expect(sink.log[0]).toEqual({ call: 'resume' }))
  })

  it('retires both listeners together — a second gesture is not a second unlock', async () => {
    render(<App />)
    fireEvent.pointerDown(document.body)
    await waitFor(() => expect(sink.log[0]).toEqual({ call: 'resume' }))

    fireEvent.keyDown(document.body, { key: 'a' })
    fireEvent.pointerDown(document.body)

    expect(sink.log.filter((call) => call.call === 'resume')).toHaveLength(1)
  })
})

describe('PF1-M1 wiring — the Lot sounds like a place while it is visible', () => {
  function managed(seed: string): GameState {
    return applyActions(newFoundedGame(seed), [
      { kind: 'activateStudioOperations' },
      { kind: 'activateScriptDevelopment' },
      { kind: 'activateCastingSessions' },
    ])
  }

  function renderLot(state: GameState) {
    return render(
      <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} onAdvance={() => {}} />,
    )
  }

  it('starts the era music and the ambience bed, and no work texture on a quiet lot', async () => {
    renderLot(managed('pf1-audio-quiet'))

    await waitFor(() => expect(loops('startLoop')).toContain('music-1948.m4a'))
    expect(loops('startLoop')).toContain('ambience-lot-1948.m4a')
    expect(loops('startLoop')).not.toContain('ambience-construction.m4a')
  })

  it('adds the hammering only while something is actually being built', async () => {
    const idle = managed('pf1-audio-construction')
    const building = applyActions(idle, [
      {
        kind: 'placeFacility',
        placement: { blueprintId: 'development-casting-annex', origin: { gx: 3, gy: 19 } },
      },
    ])
    const { rerender } = renderLot(idle)
    await waitFor(() => expect(loops('startLoop')).toContain('ambience-lot-1948.m4a'))
    expect(loops('startLoop')).not.toContain('ambience-construction.m4a')

    rerender(
      <StudioLotScreen state={building} onNavigate={() => {}} onExit={() => {}} onAdvance={() => {}} />,
    )

    await waitFor(() => expect(loops('startLoop')).toContain('ambience-construction.m4a'))
  })

  it('goes quiet when the tab hides — the same seam that pauses the renderer', async () => {
    renderLot(managed('pf1-audio-hidden'))
    await waitFor(() => expect(loops('startLoop')).toContain('ambience-lot-1948.m4a'))

    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await waitFor(() => expect(loops('stopLoop')).toContain('ambience-lot-1948.m4a'))
    expect(loops('stopLoop')).toContain('music-1948.m4a')
    hidden.mockRestore()
  })

  it('sounds the select cue for a building the player addresses in the world', async () => {
    initAudioService(sink).unlock()
    renderLot(managed('pf1-audio-select'))
    await waitFor(() => expect(renderer.instances.length).toBeGreaterThan(0))
    const view = renderer.instances[renderer.instances.length - 1]!
    sink.clear()

    act(() => {
      view.opts.onSelect?.({
        buildingId: 'writers',
        label: 'Development',
        blurb: 'Develop and assemble your next film.',
        available: true,
        action: 'assemble-film',
        production: null,
      })
    })

    expect(sink.log).toContainEqual({
      call: 'play',
      assetId: 'cue-select.m4a',
      channel: 'effects',
      // Per-voice gain is a trim of 1 — loudness lives once, in the channel gain
      // node (PM ruling, M1 review: no squared volume curve for cues).
      gain: 1,
    })
  })

  it('stays silent when the HOST re-asserts a restored selection (the plate re-emits)', async () => {
    initAudioService(sink).unlock()
    setLotSelectedBuilding('writers')
    const { findByLabelText } = renderLot(managed('pf1-audio-reassert'))

    await waitFor(() => expect(loops('startLoop')).toContain('ambience-lot-1948.m4a'))
    await waitFor(() => expect(renderer.instances.length).toBeGreaterThan(0))
    // Let the ready-reconcile pass run; it re-asserts the restored building.
    await act(async () => {
      await Promise.resolve()
    })

    // Proof the re-assert really reached the host: the details panel it opens is on screen.
    expect(await findByLabelText('Close details')).toBeInTheDocument()
    expect(sink.log.filter((call) => call.call === 'play')).toEqual([])
    resetLotSelectedBuilding()
  })

  it('ends with the screen: nothing keeps playing after unmount', async () => {
    const { unmount } = renderLot(managed('pf1-audio-unmount'))
    await waitFor(() => expect(loops('startLoop')).toContain('ambience-lot-1948.m4a'))

    unmount()

    expect(loops('stopLoop')).toContain('ambience-lot-1948.m4a')
    expect(loops('stopLoop')).toContain('music-1948.m4a')
  })
})

describe('PF1-M1 wiring — the one cancel cue', () => {
  function renderWorkspace(onEscape: () => void) {
    return render(
      <LotRetainedWorkspace
        layerClassName="layer"
        layerTestId="layer"
        dialogClassName="dialog"
        dialogTestId="dialog"
        titleId="title"
        descriptionId="description"
        title="A retained workspace"
        description="Closing it commits nothing."
        onEscape={onEscape}
      />,
    )
  }

  it('sounds when a retained workspace is closed with nothing committed', () => {
    const onEscape = vi.fn()
    const { getByTestId } = renderWorkspace(onEscape)
    initAudioService(sink).unlock()
    sink.clear()

    fireEvent.keyDown(getByTestId('dialog'), { key: 'Escape' })

    expect(onEscape).toHaveBeenCalledTimes(1)
    expect(sink.log).toEqual([
      { call: 'play', assetId: 'cue-cancel.m4a', channel: 'effects', gain: 1 },
    ])
  })

  it('is silent before the first gesture, and closes the workspace anyway', () => {
    const onEscape = vi.fn()
    const { getByTestId } = renderWorkspace(onEscape)

    fireEvent.keyDown(getByTestId('dialog'), { key: 'Escape' })

    expect(onEscape).toHaveBeenCalledTimes(1)
    expect(sink.log).toEqual([])
  })
})
