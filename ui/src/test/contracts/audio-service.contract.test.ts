// ── PF1-M1 CONTRACT SUITE — AudioService ─────────────────────────────────────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M1/§7/§2 and the frozen M1
// interface, NOT from the implementation. If the implementation disagrees with
// what is asserted here, the implementation is wrong.
//
// Governing charter law exercised by this file:
//   • "the service starts suspended and resumes on the first user gesture …
//      Cues emitted before unlock are dropped silently, never queued, never
//      thrown. Silence, not a crash — and no nag."          (§5-M1, autoplay)
//   • "the service consumes cue tokens through a sink interface … a
//      RecordingSink (ordered token log) is the test double."   (§5-M1, seam)
//   • "channel graph master / music / ambience / effects, each with a
//      prefs-backed volume."                                  (§5-M1, channels)
//   • "distant hammering only while construction is actually underway …
//      a quiet studio is allowed to sound quiet."      (§5-M1, calm-morning law)
//   • "an era-keyed registry … with a 1948 bed now."             (§5-M1, music)
//   • "Presentation state (volumes, motion preference, audio unlock) lives
//      outside GameState" and persists under project-studio.prefs.v1. (§2)
//
// DETERMINISM: no Math.random, no Date.now, no timers, no real playback.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RecordingSink } from '../../audio/sink.ts'
import { SOUND_ASSETS } from '../../audio/tokens.ts'
import { ERA_MUSIC } from '../../audio/registry.ts'
import { getAudioService, initAudioService } from '../../audio/audioService.ts'
import { loadPrefs, PREFS_KEY } from '../../prefs.ts'

// ── The frozen contract's shape, restated as test-side constants ─────────────
const CHANNELS = ['master', 'music', 'ambience', 'effects'] as const
const DEFAULT_GAINS: Record<(typeof CHANNELS)[number], number> = {
  master: 0.8,
  music: 0.5,
  ambience: 0.6,
  effects: 0.7,
}
const CHANNEL_NAMES = new Set<string>(CHANNELS)

// The eleven cue tokens the frozen interface names: 8 sound families + 3 stings.
const EXPECTED_CUE_TOKENS = [
  'cancel',
  'commit',
  'completion',
  'construction-started',
  'positive',
  'refusal',
  'select',
  'sting-completion',
  'sting-greenlight',
  'sting-release',
  'warning',
] as const

// ── RecordingSink log normalisation ──────────────────────────────────────────
// THE FROZEN CONTRACT FREEZES THE LOG'S *SEMANTICS* ("ordered `log` array of
// every call with args") BUT NOT ITS ENCODING. Rather than invent a field name
// the charter never froze — and rather than weaken the assertions — this reader
// accepts the plausible encodings (tagged object, tuple, tagged string) and then
// asserts the ordered call semantics EXACTLY. Every behavioural assertion below
// is on the semantics, never on the encoding.
type Entry = {
  kind: string
  assetId?: string | undefined
  channel?: string | undefined
  gain?: number | undefined
  raw: unknown
}

function canon(value: unknown): string {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '')
}

const KIND_KEYS = ['type', 'kind', 'call', 'method', 'name', 'op', 'event', 'fn']
const ASSET_KEYS = ['assetid', 'asset', 'id', 'track', 'src', 'url', 'file', 'sound']
const CHANNEL_KEYS = ['channel', 'bus', 'ch']
const GAIN_KEYS = ['gain', 'volume', 'value', 'level', 'vol']

/** Positional reading: numbers are gains, a known channel name is the channel, the other string is the asset. */
function fromArgs(args: readonly unknown[]): Pick<Entry, 'assetId' | 'channel' | 'gain'> {
  let assetId: string | undefined
  let channel: string | undefined
  let gain: number | undefined
  const flat: unknown[] = []
  for (const arg of args) {
    if (Array.isArray(arg)) flat.push(...arg)
    else flat.push(arg)
  }
  for (const arg of flat) {
    if (typeof arg === 'number' && Number.isFinite(arg)) {
      if (gain === undefined) gain = arg
      continue
    }
    if (typeof arg === 'string') {
      if (CHANNEL_NAMES.has(arg) && channel === undefined) {
        channel = arg
        continue
      }
      if (assetId === undefined && !CHANNEL_NAMES.has(arg)) assetId = arg
    }
  }
  return { assetId, channel, gain }
}

function normalize(raw: unknown): Entry {
  // Tuple encoding: ['play', assetId, channel, gain]
  if (Array.isArray(raw)) {
    const [head, ...rest] = raw
    return { kind: canon(head), ...fromArgs(rest), raw }
  }
  // Tagged-string encoding: 'play /audio/select.m4a effects 1'
  if (typeof raw === 'string') {
    const parts = raw.split(/[\s:|,;()]+/).filter((p) => p.length > 0)
    const [head, ...rest] = parts
    const coerced = rest.map((p) => (/^-?\d+(\.\d+)?$/.test(p) ? Number(p) : p))
    return { kind: canon(head), ...fromArgs(coerced), raw }
  }
  // Tagged-object encoding: { type: 'play', assetId, channel, gain }
  if (raw !== null && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    const byName = (names: readonly string[]): unknown => {
      for (const key of Object.keys(obj)) if (names.includes(canon(key))) return obj[key]
      return undefined
    }
    const kindValue = byName(KIND_KEYS)
    const kind = kindValue === undefined ? '' : canon(kindValue)
    const assetValue = byName(ASSET_KEYS)
    const channelValue = byName(CHANNEL_KEYS)
    const gainValue = byName(GAIN_KEYS)
    // Anything not explicitly named falls back to the positional reading, minus
    // the kind tag itself (so a bare { call: 'resume' } never reads as an asset).
    const leftovers = Object.entries(obj)
      .filter(([key]) => !KIND_KEYS.includes(canon(key)))
      .map(([, value]) => value)
    const positional = fromArgs(leftovers)
    return {
      kind,
      assetId: typeof assetValue === 'string' ? assetValue : positional.assetId,
      channel: typeof channelValue === 'string' ? channelValue : positional.channel,
      gain: typeof gainValue === 'number' ? gainValue : positional.gain,
      raw,
    }
  }
  return { kind: canon(raw), raw }
}

function rawLog(sink: RecordingSink): unknown[] {
  const log = (sink as unknown as { log?: unknown }).log
  expect(Array.isArray(log), 'RecordingSink must expose an ordered `log` array').toBe(true)
  return log as unknown[]
}

function entries(sink: RecordingSink): Entry[] {
  return rawLog(sink).map(normalize)
}

function callsOf(sink: RecordingSink, kind: string): Entry[] {
  return entries(sink).filter((e) => e.kind === canon(kind))
}

function since(sink: RecordingSink, index: number): Entry[] {
  return rawLog(sink).slice(index).map(normalize)
}

function mark(sink: RecordingSink): number {
  return rawLog(sink).length
}

/** The gain the sink was last told to apply to a channel (undefined = never told). */
function finalGain(sink: RecordingSink, channel: string): number | undefined {
  const pushes = callsOf(sink, 'setChannelGain').filter((e) => e.channel === channel)
  return pushes.length === 0 ? undefined : pushes[pushes.length - 1]!.gain
}

// ── Fixture ──────────────────────────────────────────────────────────────────
let sink: RecordingSink

function freshService(): ReturnType<typeof getAudioService> {
  sink = new RecordingSink()
  initAudioService(sink)
  return getAudioService()
}

beforeEach(() => {
  // localStorage is cleared by ui/src/test/setup.ts before every test; tests that
  // need seeded prefs write PREFS_KEY explicitly and then re-init the service.
  freshService()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

// ── Cue tokens (SOUND_ASSETS is the routing table the service reads) ─────────
describe('PF1-M1 contract — cue token table', () => {
  it('SOUND_ASSETS covers exactly the eight sound families and three stings', () => {
    expect(Object.keys(SOUND_ASSETS).sort()).toEqual([...EXPECTED_CUE_TOKENS])
  })

  it('every cue token maps to a non-empty asset id', () => {
    for (const [token, asset] of Object.entries(SOUND_ASSETS)) {
      expect(typeof asset, `${token} must map to a string`).toBe('string')
      expect(asset.trim().length, `${token} must map to a non-empty asset id`).toBeGreaterThan(0)
    }
  })

  it('no asset id is the hardcoded-slash form (§5-M1 asset policy: BASE_URL-templated URLs only)', () => {
    const rooted = Object.entries(SOUND_ASSETS).filter(([, asset]) => asset.startsWith('/'))
    expect(
      rooted.map(([token, asset]) => `${token} → ${asset}`),
      'asset ids must be BASE_URL-templated at load, never root-absolute paths',
    ).toEqual([])
  })
})

// ── Autoplay policy ──────────────────────────────────────────────────────────
describe('PF1-M1 contract — unlock policy (autoplay handled once)', () => {
  it('drops every cue emitted before unlock — the sink log stays empty', () => {
    const service = getAudioService()
    service.playCue('select')
    service.playCue('commit')
    service.playCue('sting-release')
    expect(rawLog(sink)).toEqual([])
  })

  it('drops cues before unlock without throwing (silence, not a crash — and no nag)', () => {
    const service = getAudioService()
    expect(() => {
      for (const token of Object.keys(SOUND_ASSETS)) service.playCue(token as never)
    }).not.toThrow()
    expect(callsOf(sink, 'play')).toEqual([])
  })

  it('never queues: a cue dropped before unlock does not replay once unlocked', () => {
    const service = getAudioService()
    service.playCue('commit')
    service.unlock()
    expect(callsOf(sink, 'play')).toEqual([])
  })

  it('unlock resumes the sink', () => {
    getAudioService().unlock()
    expect(callsOf(sink, 'resume').length).toBeGreaterThanOrEqual(1)
  })

  it('unlock replays all four channel gains into the sink', () => {
    getAudioService().unlock()
    const channelsTouched = new Set(callsOf(sink, 'setChannelGain').map((e) => e.channel))
    expect([...channelsTouched].sort()).toEqual([...CHANNELS].sort())
    for (const channel of CHANNELS) {
      expect(finalGain(sink, channel), `${channel} gain replayed on unlock`).toBe(
        DEFAULT_GAINS[channel],
      )
    }
  })

  it('unlock is idempotent — a second unlock resumes only once', () => {
    const service = getAudioService()
    service.unlock()
    service.unlock()
    service.unlock()
    expect(callsOf(sink, 'resume').length).toBe(1)
  })

  it('unlock is idempotent — a second unlock replays nothing further', () => {
    const service = getAudioService()
    service.unlock()
    const afterFirst = mark(sink)
    service.unlock()
    expect(since(sink, afterFirst)).toEqual([])
  })

  it('unlock replays the PERSISTED volumes, not just the defaults', () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        version: 1,
        volumes: { master: 0.25, music: 0.1, ambience: 0.9, effects: 0.35 },
        muted: false,
        motion: 'system',
      }),
    )
    freshService()
    getAudioService().unlock()
    expect(finalGain(sink, 'master')).toBe(0.25)
    expect(finalGain(sink, 'music')).toBe(0.1)
    expect(finalGain(sink, 'ambience')).toBe(0.9)
    expect(finalGain(sink, 'effects')).toBe(0.35)
  })

  it('unlock replays a persisted mute as a zero master gain', () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        version: 1,
        volumes: { master: 0.8, music: 0.5, ambience: 0.6, effects: 0.7 },
        muted: true,
        motion: 'system',
      }),
    )
    freshService()
    getAudioService().unlock()
    expect(finalGain(sink, 'master')).toBe(0)
  })

  it('a service restored from muted prefs drops cues after unlock', () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        version: 1,
        volumes: { master: 0.8, music: 0.5, ambience: 0.6, effects: 0.7 },
        muted: true,
        motion: 'system',
      }),
    )
    freshService()
    const service = getAudioService()
    service.unlock()
    service.playCue('commit')
    expect(callsOf(sink, 'play')).toEqual([])
  })
})

// ── Cue routing ──────────────────────────────────────────────────────────────
describe('PF1-M1 contract — playCue routing', () => {
  it('routes every cue token to its exact SOUND_ASSETS asset on the effects channel', () => {
    for (const [token, asset] of Object.entries(SOUND_ASSETS)) {
      freshService()
      const service = getAudioService()
      service.unlock()
      const before = mark(sink)
      service.playCue(token as never)
      const plays = since(sink, before).filter((e) => e.kind === canon('play'))
      expect(plays.length, `${token} must produce exactly one play`).toBe(1)
      expect(plays[0]!.assetId, `${token} asset id`).toBe(asset)
      expect(plays[0]!.channel, `${token} channel`).toBe('effects')
    }
  })

  it('every cue is played with a finite, audible gain in [0,1]', () => {
    const service = getAudioService()
    service.unlock()
    service.playCue('select')
    const play = callsOf(sink, 'play')[0]
    expect(play, 'a cue must reach the sink after unlock').toBeDefined()
    expect(typeof play!.gain).toBe('number')
    expect(Number.isFinite(play!.gain!)).toBe(true)
    expect(play!.gain!).toBeGreaterThan(0)
    expect(play!.gain!).toBeLessThanOrEqual(1)
  })

  it('emits exactly one play per playCue call — no double-fire', () => {
    const service = getAudioService()
    service.unlock()
    service.playCue('commit')
    service.playCue('commit')
    service.playCue('cancel')
    expect(callsOf(sink, 'play').length).toBe(3)
  })

  it('a cue never starts a loop (cues are one-shots on effects)', () => {
    const service = getAudioService()
    service.unlock()
    service.playCue('sting-release')
    expect(callsOf(sink, 'startLoop')).toEqual([])
  })
})

// ── Mute ─────────────────────────────────────────────────────────────────────
describe('PF1-M1 contract — mute', () => {
  it('mute silences cues and zeroes the master gain; unmute restores it', () => {
    const service = getAudioService()
    service.unlock()

    service.setMuted(true)
    expect(finalGain(sink, 'master')).toBe(0)
    const mutedMark = mark(sink)
    service.playCue('commit')
    expect(since(sink, mutedMark).filter((e) => e.kind === canon('play'))).toEqual([])

    service.setMuted(false)
    expect(finalGain(sink, 'master')).toBe(DEFAULT_GAINS.master)
    const liveMark = mark(sink)
    service.playCue('commit')
    expect(since(sink, liveMark).filter((e) => e.kind === canon('play')).length).toBe(1)
  })

  it('unmute restores the CURRENT master volume, not the default', () => {
    const service = getAudioService()
    service.unlock()
    service.setVolume('master', 0.42)
    service.setMuted(true)
    expect(finalGain(sink, 'master')).toBe(0)
    service.setMuted(false)
    expect(finalGain(sink, 'master')).toBe(0.42)
  })

  it('mute state persists under project-studio.prefs.v1', () => {
    const service = getAudioService()
    service.unlock()
    service.setMuted(true)
    expect(loadPrefs().muted).toBe(true)
    service.setMuted(false)
    expect(loadPrefs().muted).toBe(false)
  })

  // INFERENCE FLAGGED IN THE REPORT: the frozen text says setMuted zeroes master and
  // setVolume pushes; it does not say which wins. Muting must silence — a volume
  // change while muted that un-zeroes master would make the mute audibly leak.
  it('a master volume change while muted does not un-zero the master gain', () => {
    const service = getAudioService()
    service.unlock()
    service.setMuted(true)
    service.setVolume('master', 0.9)
    expect(finalGain(sink, 'master')).toBe(0)
  })

  it('a volume change while muted is still persisted and restored on unmute', () => {
    const service = getAudioService()
    service.unlock()
    service.setMuted(true)
    service.setVolume('master', 0.33)
    expect(loadPrefs().volumes.master).toBe(0.33)
    service.setMuted(false)
    expect(finalGain(sink, 'master')).toBe(0.33)
  })
})

// ── Volumes ──────────────────────────────────────────────────────────────────
describe('PF1-M1 contract — setVolume (clamp, persist, push)', () => {
  it('pushes an in-range volume to the sink for every channel', () => {
    const service = getAudioService()
    service.unlock()
    const wanted: Record<string, number> = {
      master: 0.11,
      music: 0.22,
      ambience: 0.33,
      effects: 0.44,
    }
    for (const channel of CHANNELS) service.setVolume(channel, wanted[channel]!)
    for (const channel of CHANNELS) expect(finalGain(sink, channel)).toBe(wanted[channel])
  })

  it('persists an in-range volume for every channel', () => {
    const service = getAudioService()
    service.unlock()
    service.setVolume('music', 0.15)
    service.setVolume('ambience', 0.65)
    const stored = loadPrefs()
    expect(stored.volumes.music).toBe(0.15)
    expect(stored.volumes.ambience).toBe(0.65)
  })

  it('clamps below range: -1 becomes 0 (pushed and persisted)', () => {
    const service = getAudioService()
    service.unlock()
    service.setVolume('music', -1)
    expect(finalGain(sink, 'music')).toBe(0)
    expect(loadPrefs().volumes.music).toBe(0)
  })

  it('clamps above range: 2 becomes 1 (pushed and persisted)', () => {
    const service = getAudioService()
    service.unlock()
    service.setVolume('effects', 2)
    expect(finalGain(sink, 'effects')).toBe(1)
    expect(loadPrefs().volumes.effects).toBe(1)
  })

  it('clamps every channel independently and leaves the others untouched', () => {
    const service = getAudioService()
    service.unlock()
    service.setVolume('ambience', 99)
    const stored = loadPrefs()
    expect(stored.volumes.ambience).toBe(1)
    expect(stored.volumes.music).toBe(DEFAULT_GAINS.music)
    expect(stored.volumes.effects).toBe(DEFAULT_GAINS.effects)
  })

  it('never persists a non-finite volume (a clamped volume is a number in [0,1])', () => {
    const service = getAudioService()
    service.unlock()
    service.setVolume('music', Number.NaN)
    const value = loadPrefs().volumes.music
    expect(Number.isFinite(value)).toBe(true)
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThanOrEqual(1)
  })

  it('volumes survive a service restart (prefs-backed, not in-memory)', () => {
    const service = getAudioService()
    service.unlock()
    service.setVolume('music', 0.12)
    freshService()
    getAudioService().unlock()
    expect(finalGain(sink, 'music')).toBe(0.12)
  })
})

// ── Ambience (the calm-morning law) ──────────────────────────────────────────
describe('PF1-M1 contract — ambience scene', () => {
  beforeEach(() => {
    getAudioService().unlock()
  })

  function ambienceLoops(): Entry[] {
    return callsOf(sink, 'startLoop').filter((e) => e.channel === 'ambience')
  }

  it('a calm studio starts exactly one ambience loop (the base bed)', () => {
    const service = getAudioService()
    const before = mark(sink)
    service.setAmbienceScene({ constructionActive: false })
    const started = since(sink, before).filter((e) => e.kind === canon('startLoop'))
    expect(started.length).toBe(1)
    expect(started[0]!.channel).toBe('ambience')
    expect(since(sink, before).filter((e) => e.kind === canon('stopLoop'))).toEqual([])
  })

  it('a calm studio stays calm — repeating the same scene starts nothing further', () => {
    const service = getAudioService()
    service.setAmbienceScene({ constructionActive: false })
    const settled = mark(sink)
    service.setAmbienceScene({ constructionActive: false })
    service.setAmbienceScene({ constructionActive: false })
    expect(since(sink, settled)).toEqual([])
  })

  it('construction starting adds exactly one further ambience loop, distinct from the base', () => {
    const service = getAudioService()
    service.setAmbienceScene({ constructionActive: false })
    const baseAsset = ambienceLoops()[0]!.assetId
    const settled = mark(sink)

    service.setAmbienceScene({ constructionActive: true })
    const added = since(sink, settled)
    const started = added.filter((e) => e.kind === canon('startLoop'))
    expect(started.length).toBe(1)
    expect(started[0]!.channel).toBe('ambience')
    expect(started[0]!.assetId).not.toBe(baseAsset)
    expect(added.filter((e) => e.kind === canon('stopLoop'))).toEqual([])
  })

  it('an unchanged construction state is idempotent — no duplicate hammering', () => {
    const service = getAudioService()
    service.setAmbienceScene({ constructionActive: true })
    const settled = mark(sink)
    service.setAmbienceScene({ constructionActive: true })
    service.setAmbienceScene({ constructionActive: true })
    expect(since(sink, settled)).toEqual([])
  })

  it('construction ending stops exactly the construction loop and leaves the bed running', () => {
    const service = getAudioService()
    service.setAmbienceScene({ constructionActive: false })
    const baseAsset = ambienceLoops()[0]!.assetId
    service.setAmbienceScene({ constructionActive: true })
    const constructionAsset = ambienceLoops()[1]!.assetId
    const settled = mark(sink)

    service.setAmbienceScene({ constructionActive: false })
    const added = since(sink, settled)
    const stopped = added.filter((e) => e.kind === canon('stopLoop'))
    expect(stopped.length).toBe(1)
    expect(stopped[0]!.assetId).toBe(constructionAsset)
    expect(stopped[0]!.assetId).not.toBe(baseAsset)
    expect(added.filter((e) => e.kind === canon('startLoop'))).toEqual([])
  })

  it('the base bed starts once across a whole construction cycle', () => {
    const service = getAudioService()
    service.setAmbienceScene({ constructionActive: false })
    const baseAsset = ambienceLoops()[0]!.assetId
    service.setAmbienceScene({ constructionActive: true })
    service.setAmbienceScene({ constructionActive: false })
    service.setAmbienceScene({ constructionActive: true })
    service.setAmbienceScene({ constructionActive: false })
    const baseStarts = ambienceLoops().filter((e) => e.assetId === baseAsset)
    expect(baseStarts.length).toBe(1)
  })

  it('the construction texture restarts when construction resumes', () => {
    const service = getAudioService()
    service.setAmbienceScene({ constructionActive: true })
    const constructionAsset = ambienceLoops().find((e) => e.assetId !== ambienceLoops()[0]!.assetId)
    service.setAmbienceScene({ constructionActive: false })
    const settled = mark(sink)
    service.setAmbienceScene({ constructionActive: true })
    const started = since(sink, settled).filter((e) => e.kind === canon('startLoop'))
    expect(started.length).toBe(1)
    if (constructionAsset) expect(started[0]!.assetId).toBe(constructionAsset.assetId)
  })

  it('stopAmbience stops every ambience loop it started', () => {
    const service = getAudioService()
    service.setAmbienceScene({ constructionActive: true })
    const running = new Set(ambienceLoops().map((e) => e.assetId))
    const settled = mark(sink)
    service.stopAmbience()
    const stopped = new Set(
      since(sink, settled)
        .filter((e) => e.kind === canon('stopLoop'))
        .map((e) => e.assetId),
    )
    expect([...running].sort()).toEqual([...stopped].sort())
  })

  it('stopAmbience leaves nothing ambient running (a second stop is silent)', () => {
    const service = getAudioService()
    service.setAmbienceScene({ constructionActive: true })
    service.stopAmbience()
    const settled = mark(sink)
    service.stopAmbience()
    expect(since(sink, settled)).toEqual([])
  })

  // INFERENCE FLAGGED IN THE REPORT: the frozen text does not say the scene state
  // resets on stopAmbience, but a bed that can never restart would leave the studio
  // permanently silent after any teardown.
  it('the bed can be restarted after stopAmbience', () => {
    const service = getAudioService()
    service.setAmbienceScene({ constructionActive: false })
    service.stopAmbience()
    const settled = mark(sink)
    service.setAmbienceScene({ constructionActive: false })
    const started = since(sink, settled).filter((e) => e.kind === canon('startLoop'))
    expect(started.length).toBe(1)
    expect(started[0]!.channel).toBe('ambience')
  })

  it('ambience never leaks onto the effects or music channels', () => {
    const service = getAudioService()
    service.setAmbienceScene({ constructionActive: true })
    const strayChannels = callsOf(sink, 'startLoop')
      .map((e) => e.channel)
      .filter((c) => c !== 'ambience')
    expect(strayChannels).toEqual([])
  })
})

describe('PF1-M1 contract — ambience before unlock', () => {
  // The frozen contract states the drop-before-unlock law for CUES only. The one
  // thing it unambiguously requires everywhere is "never thrown".
  it('setting an ambience scene before unlock does not throw', () => {
    const service = getAudioService()
    expect(() => service.setAmbienceScene({ constructionActive: true })).not.toThrow()
    expect(() => service.setAmbienceScene({ constructionActive: false })).not.toThrow()
    expect(() => service.stopAmbience()).not.toThrow()
  })
})

// ── Music ────────────────────────────────────────────────────────────────────
describe('PF1-M1 contract — era music', () => {
  beforeEach(() => {
    getAudioService().unlock()
  })

  it("startMusic('1948') loops the first ERA_MUSIC['1948'] track on the music channel", () => {
    const service = getAudioService()
    const expected = ERA_MUSIC['1948']?.[0]
    expect(expected, "ERA_MUSIC must carry a non-empty '1948' entry").toBeTruthy()
    const before = mark(sink)
    service.startMusic('1948')
    const started = since(sink, before).filter((e) => e.kind === canon('startLoop'))
    expect(started.length).toBe(1)
    expect(started[0]!.channel).toBe('music')
    expect(started[0]!.assetId).toBe(expected)
  })

  it('stopMusic stops exactly the track it started', () => {
    const service = getAudioService()
    service.startMusic('1948')
    const track = callsOf(sink, 'startLoop').filter((e) => e.channel === 'music')[0]!.assetId
    const settled = mark(sink)
    service.stopMusic()
    const stopped = since(sink, settled).filter((e) => e.kind === canon('stopLoop'))
    expect(stopped.length).toBe(1)
    expect(stopped[0]!.assetId).toBe(track)
  })

  it('music can be restarted after stopMusic', () => {
    const service = getAudioService()
    service.startMusic('1948')
    service.stopMusic()
    const settled = mark(sink)
    service.startMusic('1948')
    const started = since(sink, settled).filter((e) => e.kind === canon('startLoop'))
    expect(started.length).toBe(1)
    expect(started[0]!.channel).toBe('music')
  })

  it('an unknown era still starts a registry track and never throws', () => {
    const service = getAudioService()
    expect(() => service.startMusic('not-an-era')).not.toThrow()
    const started = callsOf(sink, 'startLoop').filter((e) => e.channel === 'music')
    expect(started.length).toBe(1)
    const known = new Set(Object.values(ERA_MUSIC).flatMap((tracks) => [...tracks]))
    expect(known.has(started[0]!.assetId as string)).toBe(true)
  })

  it('stopMusic before any startMusic is silent, not a crash', () => {
    const service = getAudioService()
    const settled = mark(sink)
    expect(() => service.stopMusic()).not.toThrow()
    expect(since(sink, settled)).toEqual([])
  })
})

// ── Observable state ─────────────────────────────────────────────────────────
describe('PF1-M1 contract — getState', () => {
  it('returns a plain, serialisable object before and after unlock', () => {
    const service = getAudioService()
    const before = service.getState()
    expect(before).toBeTypeOf('object')
    expect(before).not.toBeNull()
    expect(() => JSON.stringify(before)).not.toThrow()
    service.unlock()
    const after = service.getState()
    expect(after).toBeTypeOf('object')
    expect(after).not.toBeNull()
    expect(() => JSON.stringify(after)).not.toThrow()
  })

  it('is coherent — the reported state changes when the service changes', () => {
    const service = getAudioService()
    const initial = JSON.stringify(service.getState())
    service.unlock()
    service.setMuted(true)
    service.setVolume('music', 0.05)
    expect(JSON.stringify(service.getState())).not.toBe(initial)
  })

  it('reports unlock and mute truthfully wherever it names them', () => {
    const service = getAudioService()
    const readBool = (state: unknown, needle: RegExp): boolean | undefined => {
      if (state === null || typeof state !== 'object') return undefined
      for (const [key, value] of Object.entries(state as Record<string, unknown>)) {
        if (needle.test(key) && typeof value === 'boolean') return value
      }
      return undefined
    }
    const beforeUnlock = readBool(service.getState(), /unlock/i)
    if (beforeUnlock !== undefined) expect(beforeUnlock).toBe(false)
    service.unlock()
    const afterUnlock = readBool(service.getState(), /unlock/i)
    if (afterUnlock !== undefined) expect(afterUnlock).toBe(true)

    const beforeMute = readBool(service.getState(), /mute/i)
    if (beforeMute !== undefined) expect(beforeMute).toBe(false)
    service.setMuted(true)
    const afterMute = readBool(service.getState(), /mute/i)
    if (afterMute !== undefined) expect(afterMute).toBe(true)
  })
})

// ── Forced mute (Playwright runs green under VITE_AUDIO_MUTED=1) ─────────────
// HARNESS NOTE — why this block is ambient rather than stubbed: Vite replaces the
// member expression `import.meta.env.X` at TRANSFORM time, so a service that reads
// `import.meta.env.VITE_AUDIO_MUTED` sees a snapshot frozen before any test runs.
// `vi.stubEnv` mutates the live env object and is therefore invisible to it
// (verified in this worktree: a stubbed key appears on a live `import.meta.env`
// read and never on a member-expression read). The flag is consequently a
// PROCESS-LEVEL condition. This block asserts the branch matching the ambient
// flag, and the hard-mute branch is exercised by a dedicated run:
//     VITE_AUDIO_MUTED=1 npx vitest run --project ui \
//       ui/src/test/contracts/audio-service.contract.test.ts -t "under VITE_AUDIO_MUTED=1"
// (the whole file must NOT be run forced-muted: every other test in it asserts
// live audio, which the flag is designed to suppress).
const FORCED_MUTE =
  (process.env.VITE_AUDIO_MUTED ??
    (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_AUDIO_MUTED) === '1'

describe('PF1-M1 contract — VITE_AUDIO_MUTED forced mute', () => {
  it('the QA flag decides whether audio can sound at all', () => {
    const service = getAudioService()
    service.unlock()
    service.playCue('commit')
    if (FORCED_MUTE) {
      expect(callsOf(sink, 'play')).toEqual([])
      expect(finalGain(sink, 'master')).toBe(0)
    } else {
      expect(callsOf(sink, 'play').length).toBe(1)
      expect(finalGain(sink, 'master')).toBe(DEFAULT_GAINS.master)
    }
  })
})

describe.runIf(FORCED_MUTE)('PF1-M1 contract — under VITE_AUDIO_MUTED=1', () => {
  it('starts hard-muted: the master gain is zero on unlock', () => {
    getAudioService().unlock()
    expect(finalGain(sink, 'master')).toBe(0)
  })

  it('starts hard-muted: cues are dropped even after unlock', () => {
    const service = getAudioService()
    service.unlock()
    service.playCue('commit')
    expect(callsOf(sink, 'play')).toEqual([])
  })

  it('setMuted(false) is a no-op under forced mute — cues stay dropped', () => {
    const service = getAudioService()
    service.unlock()
    service.setMuted(false)
    service.playCue('sting-release')
    expect(callsOf(sink, 'play')).toEqual([])
    expect(finalGain(sink, 'master')).toBe(0)
  })

  it('ambience and music stay silent too', () => {
    const service = getAudioService()
    service.unlock()
    service.setAmbienceScene({ constructionActive: true })
    service.startMusic('1948')
    expect(finalGain(sink, 'master')).toBe(0)
  })

  it('forced mute is not written back over the player’s stored preference', () => {
    const service = getAudioService()
    service.unlock()
    service.setMuted(false)
    const stored = localStorage.getItem(PREFS_KEY)
    if (stored !== null) expect(JSON.parse(stored).muted).not.toBe(true)
  })
})

describe.skipIf(FORCED_MUTE)('PF1-M1 contract — without the QA flag', () => {
  it('audio is live: the master gain follows prefs and cues reach the sink', () => {
    const service = getAudioService()
    service.unlock()
    expect(finalGain(sink, 'master')).toBe(DEFAULT_GAINS.master)
    service.playCue('commit')
    expect(callsOf(sink, 'play').length).toBe(1)
  })
})
