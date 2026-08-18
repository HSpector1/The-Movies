// ── The audio sink seam (PF1-M1) ─────────────────────────────────────────────
//
// This is the ONLY module in shipping `ui/src` allowed to name an AudioContext.
// Everything above it — the service, the screens, the components — speaks in asset
// ids and channels, so every audio behaviour is testable without real playback and
// no component can reach the browser's audio hardware directly.
//
// Channel model: master / music / ambience / effects. It is deliberately wider than
// PF1 needs, because a later speech/radio bus (the original's PA announcer and lot
// radio) must be able to join without re-plumbing anything.

/** The gain buses the product mixes through. `master` is the sum of the other three. */
export type AudioChannel = 'master' | 'music' | 'ambience' | 'effects'

/** A bus a sound can actually be routed to. Nothing plays "on master" — master is the sum. */
export type PlaybackChannel = Exclude<AudioChannel, 'master'>

/**
 * What the service is allowed to ask of the audio hardware.
 *
 * Every method is fire-and-forget and MUST NOT throw: audio before unlock, audio in a
 * hidden tab, and audio on a browser with no Web Audio at all are all SILENCE, never
 * errors. `unlocked` is the sink's own answer to "has a user gesture given me a
 * context yet" — the service drops cues while it is false.
 *
 * PF1-M4 fix: `unlocked` and `running` are DIFFERENT questions and the difference is the
 * whole autoplay bug. `unlocked` says a context OBJECT exists; `running` says the browser
 * actually granted playback. A first gesture the browser refuses leaves a suspended
 * context behind — unlocked, not running — and the sink must stay RETRYABLE so the next
 * genuine gesture asks again instead of the session being silent forever.
 */
export interface AudioSink {
  resume(): void
  readonly unlocked: boolean
  readonly running: boolean
  play(assetId: string, channel: PlaybackChannel, gain: number): void
  startLoop(assetId: string, channel: PlaybackChannel, gain: number): void
  stopLoop(assetId: string): void
  setChannelGain(channel: AudioChannel, gain: number): void
}

/** One recorded sink call, in the order it was made. */
export type RecordedAudioCall =
  | { call: 'resume' }
  | { call: 'play'; assetId: string; channel: PlaybackChannel; gain: number }
  | { call: 'startLoop'; assetId: string; channel: PlaybackChannel; gain: number }
  | { call: 'stopLoop'; assetId: string }
  | { call: 'setChannelGain'; channel: AudioChannel; gain: number }

/**
 * The test double: it records faithfully and plays nothing.
 *
 * `unlocked` is a plain writable field so a suite can hold the sink locked (the
 * autoplay-policy case) or force it open without a gesture. `resume()` opens it,
 * exactly as a real gesture-driven resume does.
 *
 * PF1-M4: `running` MIRRORS `unlocked` here, deliberately. The double models a browser
 * that always grants the first request, so "a context exists" and "playback was granted"
 * are the same fact — and a suite that forces `unlocked` still gets a fully open sink.
 * The refusal case has no double: it is exercised against the real `WebAudioSink` with a
 * refusing AudioContext. The log format is unchanged.
 */
export class RecordingSink implements AudioSink {
  readonly log: RecordedAudioCall[] = []
  unlocked = false

  get running(): boolean {
    return this.unlocked
  }

  resume(): void {
    this.log.push({ call: 'resume' })
    this.unlocked = true
  }

  play(assetId: string, channel: PlaybackChannel, gain: number): void {
    this.log.push({ call: 'play', assetId, channel, gain })
  }

  startLoop(assetId: string, channel: PlaybackChannel, gain: number): void {
    this.log.push({ call: 'startLoop', assetId, channel, gain })
  }

  stopLoop(assetId: string): void {
    this.log.push({ call: 'stopLoop', assetId })
  }

  setChannelGain(channel: AudioChannel, gain: number): void {
    this.log.push({ call: 'setChannelGain', channel, gain })
  }

  /** Forget every recorded call. The unlock state is deliberately left alone. */
  clear(): void {
    this.log.length = 0
  }
}

type AudioContextCtor = new () => AudioContext

function audioContextCtor(): AudioContextCtor | null {
  const scope = globalThis as unknown as {
    AudioContext?: AudioContextCtor
    webkitAudioContext?: AudioContextCtor
  }
  return scope.AudioContext ?? scope.webkitAudioContext ?? null
}

function assetBaseUrl(): string {
  const env = (import.meta as unknown as { env?: { BASE_URL?: string } }).env
  // The BASE_URL-templated form, never a hardcoded slash (TycoonScene.ts:483 precedent).
  return `${env?.BASE_URL ?? '/'}audio/`
}

const CLAMP_MIN = 0
const CLAMP_MAX = 1

function clampGain(gain: number): number {
  if (!Number.isFinite(gain)) return CLAMP_MIN
  return Math.min(CLAMP_MAX, Math.max(CLAMP_MIN, gain))
}

/**
 * The real sink. One AudioContext, created LAZILY inside the first `resume()` — i.e.
 * inside a user gesture, which is what the autoplay policy actually requires — and
 * never in a module initializer.
 *
 * Every browser call is wrapped: a missing Web Audio implementation, a refused
 * context, a failed fetch and a failed decode all leave the sink inert and silent.
 * A loop asked for before the context exists is REMEMBERED, not dropped, so the
 * studio's ambience begins the moment the player's first gesture unlocks it.
 */
export class WebAudioSink implements AudioSink {
  private ctx: AudioContext | null = null
  private masterNode: GainNode | null = null
  private readonly channelNodes = new Map<PlaybackChannel, GainNode>()
  private readonly gains: Record<AudioChannel, number> = {
    master: 1,
    music: 1,
    ambience: 1,
    effects: 1,
  }
  private readonly buffers = new Map<string, AudioBuffer>()
  private readonly loading = new Set<string>()
  /** Loops the caller currently WANTS, whether or not a context exists yet. */
  private readonly desiredLoops = new Map<string, { channel: PlaybackChannel; gain: number }>()
  private readonly liveLoops = new Map<string, { source: AudioBufferSourceNode; gain: GainNode }>()
  /**
   * PF1-M4: this latches on the resume promise RESOLVING, never on the attempt. The old
   * latch was set before the request was made, so a browser that refused the very first
   * gesture — the ordinary autoplay case — was never asked a second time and the session
   * stayed silent for its whole life.
   */
  private resumed = false

  /** True once a context exists. A suspended-but-present context is still silence, not an error. */
  get unlocked(): boolean {
    return this.ctx !== null
  }

  /** True only while the browser is actually running the context — the real grant. */
  get running(): boolean {
    return this.ctx !== null && this.ctx.state === 'running'
  }

  resume(): void {
    try {
      if (this.ctx === null) {
        const Ctor = audioContextCtor()
        if (Ctor === null) return // no Web Audio here: stay inert forever
        const ctx = new Ctor()
        this.ctx = ctx
        const master = ctx.createGain()
        master.gain.value = this.gains.master
        master.connect(ctx.destination)
        this.masterNode = master
        for (const channel of ['music', 'ambience', 'effects'] as const) {
          const node = ctx.createGain()
          node.gain.value = this.gains[channel]
          node.connect(master)
          this.channelNodes.set(channel, node)
        }
      }
      if (!this.resumed) {
        const pending = this.ctx.resume?.()
        if (pending !== undefined && typeof pending.then === 'function') {
          pending.then(
            () => {
              // The grant landed. Only now is the sink done asking, and only now can the
              // loops the studio wanted while it was locked actually be heard.
              this.resumed = true
              this.startDesiredLoops()
            },
            () => {
              // Refused. Nothing latches: the NEXT gesture asks the browser again.
            },
          )
        } else {
          // A context whose resume() answers nothing at all has already granted playback.
          this.resumed = true
        }
      }
      // Anything asked for before the context existed starts now.
      this.startDesiredLoops()
    } catch {
      /* audio is unavailable in this environment — the product runs silent */
    }
  }

  play(assetId: string, channel: PlaybackChannel, gain: number): void {
    const buffer = this.buffers.get(assetId)
    if (buffer === undefined) {
      // First use of this cue: fetch it, then play it. A cue that loses its own race
      // with the download simply arrives late; it never queues up a second copy.
      this.load(assetId, () => this.startOneShot(assetId, channel, gain))
      return
    }
    this.startOneShot(assetId, channel, gain)
  }

  startLoop(assetId: string, channel: PlaybackChannel, gain: number): void {
    this.desiredLoops.set(assetId, { channel, gain })
    this.ensureLoop(assetId, channel, gain)
  }

  stopLoop(assetId: string): void {
    this.desiredLoops.delete(assetId)
    const live = this.liveLoops.get(assetId)
    if (live === undefined) return
    this.liveLoops.delete(assetId)
    try {
      live.source.stop()
    } catch {
      /* already stopped */
    }
    try {
      live.source.disconnect()
      live.gain.disconnect()
    } catch {
      /* already detached */
    }
  }

  setChannelGain(channel: AudioChannel, gain: number): void {
    const value = clampGain(gain)
    this.gains[channel] = value
    try {
      if (channel === 'master') {
        if (this.masterNode !== null) this.masterNode.gain.value = value
        return
      }
      const node = this.channelNodes.get(channel)
      if (node !== undefined) node.gain.value = value
    } catch {
      /* a node the context has already torn down — nothing to set */
    }
  }

  private busFor(channel: PlaybackChannel): AudioNode | null {
    return this.channelNodes.get(channel) ?? null
  }

  /** Start every loop the caller still wants and that is not already live. */
  private startDesiredLoops(): void {
    for (const [assetId, want] of this.desiredLoops) {
      if (!this.liveLoops.has(assetId)) this.ensureLoop(assetId, want.channel, want.gain)
    }
  }

  private startOneShot(assetId: string, channel: PlaybackChannel, gain: number): void {
    const ctx = this.ctx
    const buffer = this.buffers.get(assetId)
    const bus = this.busFor(channel)
    if (ctx === null || buffer === undefined || bus === null) return
    try {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const level = ctx.createGain()
      level.gain.value = clampGain(gain)
      source.connect(level)
      level.connect(bus)
      source.onended = () => {
        try {
          source.disconnect()
          level.disconnect()
        } catch {
          /* already detached */
        }
      }
      source.start()
    } catch {
      /* the context refused this voice — silence, never a throw */
    }
  }

  private ensureLoop(assetId: string, channel: PlaybackChannel, gain: number): void {
    if (this.liveLoops.has(assetId)) return
    const ctx = this.ctx
    const bus = this.busFor(channel)
    if (ctx === null || bus === null) return // no context yet: the desire is remembered
    const buffer = this.buffers.get(assetId)
    if (buffer === undefined) {
      this.load(assetId, () => {
        // The scene can have changed while the file was in flight; only start what is
        // still wanted, and never a second copy of it.
        const want = this.desiredLoops.get(assetId)
        if (want !== undefined) this.ensureLoop(assetId, want.channel, want.gain)
      })
      return
    }
    try {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      const level = ctx.createGain()
      level.gain.value = clampGain(gain)
      source.connect(level)
      level.connect(bus)
      source.start()
      this.liveLoops.set(assetId, { source, gain: level })
    } catch {
      /* the context refused this voice — silence, never a throw */
    }
  }

  private load(assetId: string, then: () => void): void {
    if (this.loading.has(assetId)) return
    const ctx = this.ctx
    if (ctx === null) return
    const fetcher = (globalThis as { fetch?: typeof fetch }).fetch
    if (typeof fetcher !== 'function') return
    this.loading.add(assetId)
    try {
      fetcher(`${assetBaseUrl()}${assetId}`)
        .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error('audio'))))
        .then((bytes) => ctx.decodeAudioData(bytes))
        .then((buffer) => {
          this.loading.delete(assetId)
          this.buffers.set(assetId, buffer)
          then()
        })
        .catch(() => {
          // A missing or undecodable asset is a silent asset. The rest of the product
          // is unaffected, and the id stays marked so it is not re-fetched in a loop.
          this.loading.delete(assetId)
        })
    } catch {
      this.loading.delete(assetId)
    }
  }
}
