// ── OPUS-REDTEAM (PF1-M4) — autoplay, unlock, StrictMode, mute, hidden tabs ──
//
// Charter §8: "Autoplay edges: no-gesture-yet flows (keyboard-driven advance to a
// release), tab restore, mute/unmute races, context suspension on backgrounding."
// Charter §8: "The hidden-tab pause/resume seam (§0.7): … no PF1 audio plays while the
// renderer sleeps in a hidden tab."
// Charter §5-M1: "Cues emitted before unlock are dropped silently, never queued."
//
// `ui/src/main.tsx` mounts <App/> inside React.StrictMode, so every effect in the
// shipping product is mounted → cleaned up → mounted again on the player's machine in
// development builds. These tests drive the real components under StrictMode.
//
// Written findings-only. PF1-M4 FIX WAVE (OPUS-FIX): the two autoplay findings and the
// muted-network finding were ruled and fixed, and their tests are re-pinned below to the
// corrected behaviour — a refused grant is retried on the next gesture, and a muted
// session does no audio work at all. Every other assertion in this file is unchanged.

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../../../../src/core/index.ts'
import type { GameState } from '../../../../src/core/index.ts'
import { newFoundedGame } from '../founding.ts'
import { App } from '../../App.tsx'
import { StudioLotScreen } from '../../lot/StudioLotScreen.tsx'
import { initAudioService, AudioService } from '../../audio/audioService.ts'
import { RecordingSink, WebAudioSink } from '../../audio/sink.ts'
import type { RecordedAudioCall } from '../../audio/sink.ts'
import { PREFS_KEY } from '../../prefs.ts'

// The renderer double from ui/src/audio/wiring.test.tsx — the smallest thing the Lot can
// drive without dragging Phaser into jsdom.
const renderer = vi.hoisted(() => {
  type Opts = { onReady?: () => void; onSelect?: (sel: unknown) => void }
  const instances: FakeView[] = []
  class FakeView {
    readonly opts: Opts
    paused = 0
    resumed = 0
    constructor(opts: Opts) {
      this.opts = opts
      instances.push(this)
      queueMicrotask(() => opts.onReady?.())
    }
    setSnapshot() {}
    select() {}
    clearSelection() {}
    triggerAction() {}
    pause() { this.paused += 1 }
    resume() { this.resumed += 1 }
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

vi.mock('../../lot/StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

let sink: RecordingSink

beforeEach(() => {
  renderer.instances.length = 0
  sink = new RecordingSink()
  initAudioService(sink)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function calls(kind: RecordedAudioCall['call']): RecordedAudioCall[] {
  return sink.log.filter((call) => call.call === kind)
}

function loopBalance(assetId: string): number {
  let net = 0
  for (const call of sink.log) {
    if (call.call === 'startLoop' && call.assetId === assetId) net += 1
    if (call.call === 'stopLoop' && call.assetId === assetId) net -= 1
  }
  return net
}

function managed(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

function renderLot(state: GameState, strict = false) {
  const tree = (
    <StudioLotScreen state={state} onNavigate={() => {}} onExit={() => {}} onAdvance={() => {}} />
  )
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree)
}

describe('REDTEAM — the unlock gate under React.StrictMode (main.tsx mounts in it)', () => {
  it('survives the double-invoked mount: a first gesture still unlocks, exactly once', async () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    expect(sink.log, 'no gesture yet, no audio call at all').toEqual([])

    fireEvent.keyDown(document.body, { key: 'Tab' })

    await waitFor(() => expect(calls('resume')).toHaveLength(1))
    fireEvent.pointerDown(document.body)
    fireEvent.keyDown(document.body, { key: 'a' })
    expect(calls('resume'), 'the double mount did not leave a second live listener').toHaveLength(1)
  })

  it('a KEYBOARD-ONLY session unlocks before any pointer has ever been used', async () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    fireEvent.keyDown(document.body, { key: 'Enter' })
    await waitFor(() => expect(calls('resume')).toHaveLength(1))
    expect(
      sink.log.some((call) => call.call === 'setChannelGain' && call.channel === 'master'),
      'unlock pushes the whole gain graph, so the first cue is at the right level',
    ).toBe(true)
  })

  it('a gesture AFTER an unmount/remount cycle still unlocks the service', async () => {
    const first = render(<App />)
    first.unmount()
    render(<App />)
    fireEvent.pointerDown(document.body)
    await waitFor(() => expect(calls('resume')).toHaveLength(1))
  })

  it('a browser that REFUSES the gesture keeps the gate listening for the next one', async () => {
    // FIXED (PF1-M4). The gate used to retire both listeners on the ATTEMPT, so one
    // refusal by the autoplay policy silenced the whole session. It now retires them only
    // once the service reports audio actually running.
    class RefusingSink extends RecordingSink {
      override get running(): boolean {
        return false // the browser never grants this one
      }
    }
    const refusing = new RefusingSink()
    initAudioService(refusing)
    render(<App />)

    fireEvent.keyDown(document.body, { key: 'Tab' })
    await waitFor(() =>
      expect(refusing.log.filter((call) => call.call === 'resume')).toHaveLength(1),
    )
    fireEvent.pointerDown(document.body)
    fireEvent.keyDown(document.body, { key: 'Enter' })
    expect(
      refusing.log.filter((call) => call.call === 'resume'),
      'three gestures, three requests — the studio keeps asking until it is heard',
    ).toHaveLength(3)
  })
})

describe('REDTEAM — the Lot audio effects under StrictMode double-invocation', () => {
  it('leaves exactly ONE live music loop and ONE live ambience loop, not two', async () => {
    renderLot(managed('rt-strict-lot'), true)
    await waitFor(() => expect(loopBalance('ambience-lot-1948.m4a')).toBe(1))
    expect(loopBalance('music-1948.m4a')).toBe(1)
    expect(loopBalance('ambience-construction.m4a')).toBe(0)
  })

  it('unmounting a StrictMode-mounted Lot leaves nothing running', async () => {
    const view = renderLot(managed('rt-strict-unmount'), true)
    await waitFor(() => expect(loopBalance('ambience-lot-1948.m4a')).toBe(1))
    view.unmount()
    expect(loopBalance('ambience-lot-1948.m4a')).toBe(0)
    expect(loopBalance('music-1948.m4a')).toBe(0)
  })
})

describe('REDTEAM — the hidden-tab seam', () => {
  it('a Lot that MOUNTS into an already-hidden tab makes no sound at all', async () => {
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    renderLot(managed('rt-hidden-at-mount'))
    await act(async () => {
      await Promise.resolve()
    })
    expect(sink.log.filter((c) => c.call === 'startLoop'), 'the renderer is asleep').toEqual([])
    hidden.mockRestore()
  })

  it('hide then SHOW restores the bed — the tab-restore case, not only the hide case', async () => {
    renderLot(managed('rt-hidden-restore'))
    await waitFor(() => expect(loopBalance('ambience-lot-1948.m4a')).toBe(1))

    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await waitFor(() => expect(loopBalance('ambience-lot-1948.m4a')).toBe(0))
    expect(loopBalance('music-1948.m4a')).toBe(0)

    hidden.mockReturnValue(false)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await waitFor(() => expect(loopBalance('ambience-lot-1948.m4a')).toBe(1))
    expect(loopBalance('music-1948.m4a')).toBe(1)
  })

  it('unlocking WHILE hidden starts nothing on its own', async () => {
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    render(<App />)
    fireEvent.pointerDown(document.body)
    await waitFor(() => expect(calls('resume')).toHaveLength(1))
    expect(calls('startLoop'), 'unlock is a permission, not a play command').toEqual([])
    hidden.mockRestore()
  })
})

describe('REDTEAM — dropped, not queued (charter §5-M1), proved adversarially', () => {
  it('five cues before the gesture produce five silences and then no burst', () => {
    const service = initAudioService(sink)
    for (let i = 0; i < 5; i++) service.playCue('commit')
    expect(sink.log).toEqual([])

    service.unlock()
    expect(
      sink.log.filter((call) => call.call === 'play'),
      'the dropped cues did not arrive late',
    ).toEqual([])
  })

  it('a MUTED player before unlock also queues nothing, and unmuting replays nothing', () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        version: 1,
        volumes: { master: 1, music: 1, ambience: 1, effects: 1 },
        muted: true,
        motion: 'system',
      }),
    )
    const service = initAudioService(sink)
    service.playCue('sting-release')
    service.playCue('warning')
    service.unlock()
    service.playCue('commit')
    expect(sink.log.filter((call) => call.call === 'play')).toEqual([])

    service.setMuted(false)
    expect(
      sink.log.filter((call) => call.call === 'play'),
      'unmuting is not a replay button',
    ).toEqual([])
  })

  it('a mute/unmute RACE never leaves the master bus above zero while muted', () => {
    const service = initAudioService(sink)
    service.unlock()
    service.setMuted(true)
    service.setVolume('master', 1)
    service.setMuted(true)
    service.setVolume('master', 0.25)
    const masterGains = sink.log.filter(
      (call): call is Extract<RecordedAudioCall, { call: 'setChannelGain' }> =>
        call.call === 'setChannelGain' && call.channel === 'master',
    )
    const last = masterGains[masterGains.length - 1]!
    expect(last.gain, 'the last word on the master bus while muted is silence').toBe(0)
    expect(service.getState().muted).toBe(true)
  })
})

describe('REDTEAM — what "unlocked" actually means in the real sink', () => {
  /** A context that is CREATED but never granted: the classic refused-autoplay shape. */
  function refusingAudioContext() {
    const resumeCalls: number[] = []
    class RefusingContext {
      state = 'suspended'
      currentTime = 0
      destination = { connect: () => {}, disconnect: () => {} }
      createGain() {
        return { gain: { value: 1 }, connect: () => {}, disconnect: () => {} }
      }
      createBufferSource() {
        return {
          buffer: null,
          loop: false,
          onended: null,
          connect: () => {},
          disconnect: () => {},
          start: () => {},
          stop: () => {},
        }
      }
      decodeAudioData() {
        return Promise.reject(new Error('no decoder'))
      }
      resume() {
        resumeCalls.push(1)
        return Promise.reject(new Error('not allowed'))
      }
    }
    return { RefusingContext, resumeCalls }
  }

  it('a refused first resume IS retried on the next gesture — no permanent silence', async () => {
    // FIXED (PF1-M4). This pinned the defect: `resumed` latched on the ATTEMPT, so the
    // very first refusal — the ordinary autoplay case — meant the browser was never asked
    // again and the whole session played silently. The latch now closes only on the
    // resume promise RESOLVING.
    const { RefusingContext, resumeCalls } = refusingAudioContext()
    vi.stubGlobal('AudioContext', RefusingContext)
    const real = new WebAudioSink()

    real.resume() // the player's first gesture; the browser refuses the grant
    expect(resumeCalls).toHaveLength(1)
    expect(real.unlocked, '"unlocked" means a context OBJECT exists, not that it runs').toBe(true)
    expect(real.running, 'and "running" is the honest answer: the grant did not land').toBe(false)

    real.resume() // a later, unambiguous gesture
    real.resume()
    expect(
      resumeCalls,
      'every genuine gesture is a fresh chance: three gestures, three requests',
    ).toHaveLength(3)
    await Promise.resolve()
    expect(real.running, 'the context this browser refused is still not running').toBe(false)
  })

  it('and the service retries with it — unlock() after a refusal is not a no-op', () => {
    // FIXED (PF1-M4). The service's own `unlockRequested` latch compounded the sink's:
    // it returned early forever after the first gesture, whatever the browser answered.
    // It is now gated on `running`, so it retries while silent and is idempotent once live.
    const { RefusingContext, resumeCalls } = refusingAudioContext()
    vi.stubGlobal('AudioContext', RefusingContext)
    const real = new WebAudioSink()
    const service = new AudioService(real)

    service.unlock()
    service.unlock()
    service.unlock()
    expect(resumeCalls, 'the service asks again on every gesture while audio is not running')
      .toHaveLength(3)
    expect(service.getState().running, 'and reports the truth about it').toBe(false)
  })

  it('once the grant lands, the retry stops: a running context is asked exactly once', () => {
    const granted: number[] = []
    class GrantingContext {
      state = 'running'
      currentTime = 0
      destination = { connect: () => {}, disconnect: () => {} }
      createGain() {
        return { gain: { value: 1 }, connect: () => {}, disconnect: () => {} }
      }
      decodeAudioData() {
        return Promise.reject(new Error('no decoder'))
      }
      resume() {
        granted.push(1)
        return Promise.resolve()
      }
    }
    vi.stubGlobal('AudioContext', GrantingContext)
    const service = new AudioService(new WebAudioSink())

    service.unlock()
    service.unlock()
    service.unlock()
    expect(granted, 'a running session does not re-ask on every click').toHaveLength(1)
    expect(service.getState().running).toBe(true)
  })
})

describe('REDTEAM — what a muted session asks of the network', () => {
  it('a MUTED session fetches NOTHING — not the beds, not the music', async () => {
    // FIXED (PF1-M4). This pinned the defect: `playCue` consulted mute but
    // `setAmbienceScene` and `startMusic` did not, so a muted studio still downloaded
    // roughly three quarters of a megabyte of audio it would never play. The service now
    // remembers what the world wants and starts nothing while muted.
    const fetched: string[] = []
    vi.stubGlobal('fetch', (url: string) => {
      fetched.push(String(url))
      return Promise.reject(new Error('redteam: no network in jsdom'))
    })
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        version: 1,
        volumes: { master: 0.8, music: 0.5, ambience: 0.6, effects: 0.7 },
        muted: true,
        motion: 'reduced',
      }),
    )
    const real = new WebAudioSink()
    const service = new AudioService(real)
    service.unlock()
    service.setAmbienceScene({ constructionActive: true })
    service.startMusic('1948')

    await Promise.resolve()
    expect(fetched, 'a muted studio does no audio work at all').toEqual([])
  })

  it('and unmuting starts what the world wanted all along, without a re-render', async () => {
    const fetched: string[] = []
    vi.stubGlobal('fetch', (url: string) => {
      fetched.push(String(url))
      return Promise.reject(new Error('redteam: no network in jsdom'))
    })
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        version: 1,
        volumes: { master: 0.8, music: 0.5, ambience: 0.6, effects: 0.7 },
        muted: true,
        motion: 'reduced',
      }),
    )
    const service = new AudioService(new WebAudioSink())
    service.unlock()
    service.setAmbienceScene({ constructionActive: false })
    service.startMusic('1948')
    expect(fetched).toEqual([])

    service.setMuted(false)
    await Promise.resolve()
    expect(fetched.some((url) => url.endsWith('audio/ambience-lot-1948.m4a'))).toBe(true)
    expect(fetched.some((url) => url.endsWith('audio/music-1948.m4a'))).toBe(true)
  })

  it('a cue, by contrast, is genuinely never fetched while muted', async () => {
    const fetched: string[] = []
    vi.stubGlobal('fetch', (url: string) => {
      fetched.push(String(url))
      return Promise.reject(new Error('redteam: no network in jsdom'))
    })
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        version: 1,
        volumes: { master: 0.8, music: 0.5, ambience: 0.6, effects: 0.7 },
        muted: true,
        motion: 'reduced',
      }),
    )
    const real = new WebAudioSink()
    const service = new AudioService(real)
    service.unlock()
    service.playCue('sting-release')
    await Promise.resolve()
    expect(fetched).toEqual([])
  })
})
