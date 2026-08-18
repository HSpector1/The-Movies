// ── WebAudioSink: the one module that touches the browser's audio ────────────
//
// The contract suite (ui/src/test/contracts/) proves the SERVICE against RecordingSink
// and deliberately cannot reach this class, because a real sink needs a real Web Audio
// implementation. These tests cover exactly that gap with a faithful fake context:
// the lazy construction, the gain graph, the BASE_URL-templated load, the
// remembered-loop path, and the promise that a browser without Web Audio is silent
// rather than broken.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { WebAudioSink } from './sink.ts'

type FakeNode = {
  gain: { value: number }
  connected: unknown[]
  connect: (target: unknown) => void
  disconnect: () => void
}

type FakeSource = {
  buffer: unknown
  loop: boolean
  started: number
  stopped: number
  onended: (() => void) | null
  connect: (target: unknown) => void
  disconnect: () => void
  start: () => void
  stop: () => void
}

function installFakeContext() {
  const gains: FakeNode[] = []
  const sources: FakeSource[] = []
  const destination = { id: 'destination' }
  let decodes = 0

  class FakeAudioContext {
    readonly destination = destination
    resumes = 0
    createGain(): FakeNode {
      const node: FakeNode = {
        gain: { value: 1 },
        connected: [],
        connect(target: unknown) {
          this.connected.push(target)
        },
        disconnect() {},
      }
      gains.push(node)
      return node
    }
    createBufferSource(): FakeSource {
      const source: FakeSource = {
        buffer: null,
        loop: false,
        started: 0,
        stopped: 0,
        onended: null,
        connect(target: unknown) {
          void target
        },
        disconnect() {},
        start() {
          this.started += 1
        },
        stop() {
          this.stopped += 1
        },
      }
      sources.push(source)
      return source
    }
    decodeAudioData(): Promise<unknown> {
      decodes += 1
      return Promise.resolve({ decoded: true })
    }
    resume(): Promise<void> {
      this.resumes += 1
      return Promise.resolve()
    }
  }

  vi.stubGlobal('AudioContext', FakeAudioContext)
  return { gains, sources, destination, decodeCount: () => decodes }
}

function installFetch(ok = true) {
  const urls: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      urls.push(String(url))
      return ok
        ? Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) })
        : Promise.resolve({ ok: false, arrayBuffer: () => Promise.reject(new Error('no body')) })
    }),
  )
  return urls
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('WebAudioSink — a browser with no Web Audio', () => {
  it('stays inert and never throws', () => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', undefined)
    const sink = new WebAudioSink()

    expect(sink.unlocked).toBe(false)
    expect(() => {
      sink.resume()
      sink.play('cue-select.m4a', 'effects', 0.7)
      sink.startLoop('ambience-lot-1948.m4a', 'ambience', 0.6)
      sink.stopLoop('ambience-lot-1948.m4a')
      sink.setChannelGain('master', 0.8)
    }).not.toThrow()
    // No context was ever created, so the sink still reports itself locked.
    expect(sink.unlocked).toBe(false)
  })
})

describe('WebAudioSink — the gain graph', () => {
  it('is built lazily on the first resume, master → destination and channels → master', () => {
    const fake = installFakeContext()
    const sink = new WebAudioSink()
    expect(fake.gains).toHaveLength(0) // construction touches no browser audio at all

    sink.resume()

    expect(sink.unlocked).toBe(true)
    expect(fake.gains).toHaveLength(4) // master + music + ambience + effects
    const [master, ...channels] = fake.gains
    expect(master!.connected).toEqual([fake.destination])
    for (const channel of channels) expect(channel!.connected).toEqual([master])
  })

  it('applies channel gains before and after the context exists, clamped to [0,1]', () => {
    const fake = installFakeContext()
    const sink = new WebAudioSink()

    sink.setChannelGain('master', 0.25)
    sink.setChannelGain('music', 4) // out of range: clamped, not refused
    sink.resume()

    const master = fake.gains[0]!
    expect(master.gain.value).toBe(0.25)
    expect(fake.gains[1]!.gain.value).toBe(1)

    sink.setChannelGain('master', -3)
    expect(master.gain.value).toBe(0)
  })
})

describe('WebAudioSink — loading and playing', () => {
  it('loads a cue from the BASE_URL-templated audio directory and plays it once', async () => {
    const fake = installFakeContext()
    const urls = installFetch()
    const sink = new WebAudioSink()
    sink.resume()

    sink.play('cue-select.m4a', 'effects', 0.7)

    await vi.waitFor(() => expect(fake.sources).toHaveLength(1))
    expect(urls).toEqual([`${(import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'}audio/cue-select.m4a`])
    expect(urls[0]!.endsWith('audio/cue-select.m4a')).toBe(true)
    const source = fake.sources[0]!
    expect(source.started).toBe(1)
    expect(source.loop).toBe(false)
  })

  it('remembers a loop asked for before unlock and starts it when the context arrives', async () => {
    const fake = installFakeContext()
    installFetch()
    const sink = new WebAudioSink()

    sink.startLoop('ambience-lot-1948.m4a', 'ambience', 0.6)
    expect(fake.sources).toHaveLength(0) // nothing to start it on yet

    sink.resume()

    await vi.waitFor(() => expect(fake.sources).toHaveLength(1))
    expect(fake.sources[0]!.loop).toBe(true)
    expect(fake.sources[0]!.started).toBe(1)
  })

  it('never runs two copies of the same loop, and stops the one it started', async () => {
    const fake = installFakeContext()
    installFetch()
    const sink = new WebAudioSink()
    sink.resume()

    sink.startLoop('ambience-lot-1948.m4a', 'ambience', 0.6)
    await vi.waitFor(() => expect(fake.sources).toHaveLength(1))
    sink.startLoop('ambience-lot-1948.m4a', 'ambience', 0.6)
    sink.startLoop('ambience-lot-1948.m4a', 'ambience', 0.6)
    expect(fake.sources).toHaveLength(1)

    sink.stopLoop('ambience-lot-1948.m4a')
    expect(fake.sources[0]!.stopped).toBe(1)

    // Stopping something that is not running is not an error.
    expect(() => sink.stopLoop('ambience-construction.m4a')).not.toThrow()
  })

  it('does not start a loop that was cancelled while its file was still in flight', async () => {
    const fake = installFakeContext()
    installFetch()
    const sink = new WebAudioSink()
    sink.resume()

    sink.startLoop('ambience-construction.m4a', 'ambience', 0.6)
    sink.stopLoop('ambience-construction.m4a')

    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(fake.sources).toHaveLength(0)
  })

  it('treats a missing asset as a silent asset', async () => {
    const fake = installFakeContext()
    installFetch(false)
    const sink = new WebAudioSink()
    sink.resume()

    expect(() => sink.play('cue-select.m4a', 'effects', 0.7)).not.toThrow()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(fake.sources).toHaveLength(0)
  })
})
