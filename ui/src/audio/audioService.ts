// ── AudioService (PF1-M1) ────────────────────────────────────────────────────
//
// One service for the whole product, not one per screen: punctuated events fire on
// the Dashboard, the newspaper and the founding flow as well as the Lot, the Lot's
// renderer is lazy-mounted and rollback-able, and its lifetime is shorter than the
// session's. So the context, the unlock and the gain graph are owned here, above
// every screen, and Phaser's own sound manager is switched off (StudioLotView).
//
// AUTOPLAY POLICY, once: no context is created until the first genuine user gesture
// resumes the service. A cue emitted before that is DROPPED — never queued, never
// thrown, and never nagged about. Silence is a correct state of this service, not a
// failure of it. Loops are different: an ambience the Lot asked for while still
// locked is remembered by the sink and begins at unlock, because the studio should
// be alive the moment the player touches it, not one interaction later.

import { loadPrefs, savePrefs, clampVolume } from '../prefs.ts'
import type { Prefs } from '../prefs.ts'
import { musicTracksForEra } from './registry.ts'
import { SOUND_ASSETS } from './tokens.ts'
import type { CueSoundToken } from './tokens.ts'
import { WebAudioSink } from './sink.ts'
import type { AudioChannel, AudioSink } from './sink.ts'

/** The committed loop ids. The ambience bed is era-named for the same reason music is. */
export const AMBIENCE_BASE_ASSET = 'ambience-lot-1948.m4a'
export const AMBIENCE_CONSTRUCTION_ASSET = 'ambience-construction.m4a'

/**
 * Per-source trim. Loudness is governed exactly once, by the channel gain node —
 * a per-voice gain above 1 would double-apply the slider (0.7 × 0.7), squaring the
 * volume curve for cues while loops stayed linear. PM ruling at the M1 review: the
 * voice carries a trim of 1 for loops AND one-shots alike.
 */
const LOOP_TRIM = 1
const CUE_TRIM = 1

/** What the world sounds like right now — authoritative facts only, never renderer motion. */
export type AmbienceScene = {
  /** Is anything actually being built on the property this week? */
  constructionActive: boolean
}

export type AudioServiceState = {
  unlocked: boolean
  /** PF1-M4: the browser actually granted playback, not merely "a context was made". */
  running: boolean
  muted: boolean
  volumes: Record<AudioChannel, number>
}

function qaForcedMute(): boolean {
  // Playwright runs the whole product hard-muted so e2e never depends on an autoplay
  // grant, a decoded buffer, or a headless audio device.
  //
  // TWO sources on purpose. In a browser the flag is Vite's build-time env, which is
  // what the Playwright webServers set. Under the test runner `vi.stubEnv` reaches
  // `process.env` ONLY — this toolchain's `import.meta.env` is a frozen snapshot of
  // BASE_URL/DEV/MODE/PROD/SSR — so a suite could not otherwise exercise forced mute
  // at all. `process` does not exist in the browser, hence the typeof guard.
  const env = (import.meta as unknown as { env?: { VITE_AUDIO_MUTED?: string } }).env
  if (env?.VITE_AUDIO_MUTED === '1') return true
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  return proc?.env?.VITE_AUDIO_MUTED === '1'
}

export class AudioService {
  private readonly sink: AudioSink
  private prefs: Prefs
  /** QA hard mute: not the player's setting, so it is never written to their prefs. */
  private readonly forcedMute: boolean
  private ambienceRunning = false
  private constructionRunning = false
  private musicTrack: string | null = null
  /**
   * What the world WOULD sound like if it were not muted. Presentation state, held here
   * on purpose: a muted session must issue no sink work at all (and therefore fetch
   * nothing), but unmuting mid-session has to bring the studio back without waiting for
   * the Lot to re-render its scene.
   */
  private desiredScene: AmbienceScene | null = null
  private desiredEra: string | null = null

  constructor(sink: AudioSink) {
    this.sink = sink
    this.prefs = loadPrefs()
    this.forcedMute = qaForcedMute()
  }

  /**
   * Give the sink its context.
   *
   * Idempotent ONCE THE GRANT LANDED — the second gesture of a running session is not a
   * second unlock. But a browser that REFUSED the first gesture leaves the sink not
   * running, and then every later gesture is a fresh, legitimate chance to ask. PF1-M4:
   * the old `unlockRequested` latch turned one refusal into permanent silence.
   */
  unlock(): void {
    if (this.sink.running) return
    this.sink.resume()
    this.pushAllGains()
  }

  /**
   * Play one cue on the effects bus. Dropped in silence before unlock or while muted —
   * a dropped cue is never queued, so a player who clicks five times before the first
   * gesture lands does not then hear five sounds.
   */
  playCue(token: CueSoundToken): void {
    if (!this.sink.unlocked || this.isMuted()) return
    this.sink.play(SOUND_ASSETS[token], 'effects', CUE_TRIM)
  }

  /**
   * Match the ambience to the world. Idempotent per state: calling it every render
   * with an unchanged scene issues no sink calls at all.
   *
   * PF1-M4: a MUTED session starts nothing. Mute used to be a master-gain fact only, so a
   * silent studio still asked the sink for its beds and the sink still downloaded them —
   * roughly three quarters of a megabyte a muted player never hears. The scene is
   * remembered instead, and honoured the moment the player unmutes.
   */
  setAmbienceScene(scene: AmbienceScene): void {
    this.desiredScene = scene
    if (this.isMuted()) return
    if (!this.ambienceRunning) {
      this.sink.startLoop(AMBIENCE_BASE_ASSET, 'ambience', LOOP_TRIM)
      this.ambienceRunning = true
    }
    if (scene.constructionActive && !this.constructionRunning) {
      this.sink.startLoop(AMBIENCE_CONSTRUCTION_ASSET, 'ambience', LOOP_TRIM)
      this.constructionRunning = true
      return
    }
    if (!scene.constructionActive && this.constructionRunning) {
      this.sink.stopLoop(AMBIENCE_CONSTRUCTION_ASSET)
      this.constructionRunning = false
    }
  }

  /** Silence the place. Safe to call when nothing is running. */
  stopAmbience(): void {
    this.desiredScene = null
    if (this.constructionRunning) {
      this.sink.stopLoop(AMBIENCE_CONSTRUCTION_ASSET)
      this.constructionRunning = false
    }
    if (this.ambienceRunning) {
      this.sink.stopLoop(AMBIENCE_BASE_ASSET)
      this.ambienceRunning = false
    }
  }

  /**
   * Start (or keep) the era's music bed. Re-asking for the same era changes nothing.
   * A muted session starts nothing and downloads nothing (see `setAmbienceScene`).
   */
  startMusic(eraKey: string): void {
    this.desiredEra = eraKey
    if (this.isMuted()) return
    const track = musicTracksForEra(eraKey)[0]
    if (track === undefined) return
    if (this.musicTrack === track) return
    if (this.musicTrack !== null) this.sink.stopLoop(this.musicTrack)
    this.sink.startLoop(track, 'music', LOOP_TRIM)
    this.musicTrack = track
  }

  stopMusic(): void {
    this.desiredEra = null
    if (this.musicTrack === null) return
    this.sink.stopLoop(this.musicTrack)
    this.musicTrack = null
  }

  /**
   * Set and persist one channel's volume. Out-of-range input is clamped, not refused.
   *
   * PF1-M4: the record is re-read from storage on every write. `prefs.v1` is ONE record
   * shared with the motion preference; writing the whole of it from a snapshot taken when
   * this service was constructed un-wrote any motion choice made since. The store is now
   * the guarantee, so no caller has to remember to repair it afterwards.
   */
  setVolume(channel: AudioChannel, volume: number): void {
    const value = clampVolume(volume)
    const current = loadPrefs()
    this.prefs = { ...current, volumes: { ...current.volumes, [channel]: value } }
    savePrefs(this.prefs)
    if (channel === 'master') this.pushMasterGain()
    else this.sink.setChannelGain(channel, value)
  }

  /**
   * Mute is a master-gain fact for what is already running, not a teardown: live loops
   * keep running silently so unmuting restores the studio instantly rather than
   * restarting it. What mute DOES prevent is new audio work — a session muted from the
   * start never asks for a bed at all, and unmuting starts what the world wanted.
   *
   * The same fresh-read discipline as `setVolume`.
   */
  setMuted(muted: boolean): void {
    if (this.forcedMute) return // QA mute is not the player's preference and is never persisted
    this.prefs = { ...loadPrefs(), muted }
    savePrefs(this.prefs)
    this.pushMasterGain()
    if (this.isMuted()) return
    // Unmuted: honour whatever the world last said it sounded like.
    if (this.desiredScene !== null) this.setAmbienceScene(this.desiredScene)
    if (this.desiredEra !== null) this.startMusic(this.desiredEra)
  }

  getState(): AudioServiceState {
    return {
      unlocked: this.sink.unlocked,
      running: this.sink.running,
      muted: this.isMuted(),
      volumes: { ...this.prefs.volumes },
    }
  }

  private isMuted(): boolean {
    return this.forcedMute || this.prefs.muted
  }

  private pushMasterGain(): void {
    this.sink.setChannelGain('master', this.isMuted() ? 0 : this.prefs.volumes.master)
  }

  private pushAllGains(): void {
    this.pushMasterGain()
    this.sink.setChannelGain('music', this.prefs.volumes.music)
    this.sink.setChannelGain('ambience', this.prefs.volumes.ambience)
    this.sink.setChannelGain('effects', this.prefs.volumes.effects)
  }
}

let currentService: AudioService | null = null

/** Install a service over an explicit sink (the test seam) and make it the singleton. */
export function initAudioService(sink: AudioSink): AudioService {
  currentService = new AudioService(sink)
  return currentService
}

/** The product's one service, created over the real Web Audio sink on first use. */
export function getAudioService(): AudioService {
  if (currentService === null) currentService = new AudioService(new WebAudioSink())
  return currentService
}
