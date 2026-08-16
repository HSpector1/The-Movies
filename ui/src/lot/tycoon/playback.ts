// ── Week playback — presentation time over the engine's own beat timeline ─────
//
// LAW 1/2/3, restated as code. Everything here is a function of (a) the engine's beat
// array for one person, (b) an authored presentation path, and (c) a wall clock. It
// advances nothing, decides nothing, and consumes no RNG. Stop the clock at any instant
// and the world still says exactly what `studioPresence` said; that is the whole point.
//
// THE PLAYED WINDOW, and a recorded contradiction.
//
// The engine decomposes a week into ten beats: a staggered departure (0…2), a one-beat
// commute, the working day through beat 8, and the return home at beat 9. The milestone
// brief asks BOTH that the lot's resting rendering show every person AT THEIR SITE for
// the week's mid-point, AND that playback "return at beat 9". Those cannot both be true
// of the same settled frame: a playback that ends at beat 9 leaves the property empty
// while the projection for that same week says the studio is at work.
//
// The resolution, which keeps law 2 (an animation may acknowledge, never restate the
// world): the PLAYED window is beats 0 … PLAYBACK_LAST_BEAT — the arrival and the
// working day — and it settles exactly onto the static truth. Beat 9's walk home is
// implemented and tested below (`personPositionAt` covers the whole ten-beat week), it
// is simply not the window the scene runs. The contradiction is reported, not papered
// over.

import type { LotPresenceBeat } from '../snapshot/StudioLotSnapshot.ts'
import type { GridPoint } from './world.ts'

/** Wall time one engine beat is given on screen. */
export const PLAYBACK_BEAT_MS = 1_150

/** The last beat the scene plays: the end of the engine's working day. */
export const PLAYBACK_LAST_BEAT = 8

/** Total wall time of one week playback — 9 beats, 10.35s, inside the 8–12s target. */
export const PLAYBACK_DURATION_MS = (PLAYBACK_LAST_BEAT + 1) * PLAYBACK_BEAT_MS

export type PlaybackPhase = {
  /** The beat index the clock is inside. */
  beat: number
  /** How far through that beat, 0…1. */
  within01: number
}

/** Where a wall clock lands on the beat timeline. Never runs off either end. */
export function playbackPhaseAt(elapsedMs: number, beatCount: number): PlaybackPhase {
  const beats = Number.isInteger(beatCount) && beatCount > 0 ? beatCount : 1
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return { beat: 0, within01: 0 }
  const raw = elapsedMs / PLAYBACK_BEAT_MS
  if (raw >= beats) return { beat: beats - 1, within01: 1 }
  const beat = Math.floor(raw)
  return { beat, within01: raw - beat }
}

/** Has the played window finished? */
export function playbackFinished(elapsedMs: number): boolean {
  return !Number.isFinite(elapsedMs) || elapsedMs >= PLAYBACK_DURATION_MS
}

/** Straight-line length of a polyline, in tiles. */
function pathLength(path: readonly GridPoint[]): number {
  let total = 0
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!
    const b = path[i]!
    total += Math.hypot(b.gx - a.gx, b.gy - a.gy)
  }
  return total
}

/**
 * The point a fraction `t01` of the way along a polyline, by ARC LENGTH — so a person
 * crosses a long avenue leg at the same speed as a short forecourt leg instead of
 * sprinting through whichever segment happens to be longest.
 */
export function pointAlongPath(path: readonly GridPoint[], t01: number): GridPoint {
  if (path.length === 0) return { gx: 0, gy: 0 }
  const first = path[0]!
  const last = path[path.length - 1]!
  if (path.length === 1) return { gx: first.gx, gy: first.gy }
  if (!Number.isFinite(t01) || t01 <= 0) return { gx: first.gx, gy: first.gy }
  if (t01 >= 1) return { gx: last.gx, gy: last.gy }
  const total = pathLength(path)
  if (total <= 0) return { gx: first.gx, gy: first.gy }
  let travelled = t01 * total
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!
    const b = path[i]!
    const segment = Math.hypot(b.gx - a.gx, b.gy - a.gy)
    if (segment <= 0) continue
    if (travelled <= segment) {
      const f = travelled / segment
      return { gx: a.gx + (b.gx - a.gx) * f, gy: a.gy + (b.gy - a.gy) * f }
    }
    travelled -= segment
  }
  return { gx: last.gx, gy: last.gy }
}

export type PlaybackPosition = {
  at: GridPoint
  /** True while the person is between two points and should walk. */
  moving: boolean
  /** Grid-space heading, for the role atlas' direction frames. Zero when still. */
  heading: { dgx: number; dgy: number }
}

/** The index of the first beat that is not 'home' — the departure. */
function firstWorkBeat(beats: readonly LotPresenceBeat[]): number {
  for (let i = 0; i < beats.length; i++) if (beats[i] !== 'home') return i
  return beats.length
}

/** The index after the last beat that is not 'home' — the return. */
function afterLastWorkBeat(beats: readonly LotPresenceBeat[]): number {
  for (let i = beats.length - 1; i >= 0; i--) if (beats[i] !== 'home') return i + 1
  return beats.length
}

/**
 * Where one person is at one instant of the week.
 *
 * `path` is home → site, inclusive of both ends (see `presencePath`). The rules are the
 * engine's beat array, read literally:
 *
 *   home before departure  → standing at home
 *   travel                 → walking the path, home → site, across that one beat
 *   at-site / waiting      → standing at the site
 *   home after the day     → walking the path back, site → home, across that beat
 *
 * A person whose whole week is 'home' never leaves the first point, and a path with a
 * single point (no site) is a person standing still — both without a special case.
 */
export function personPositionAt(
  beats: readonly LotPresenceBeat[],
  path: readonly GridPoint[],
  elapsedMs: number,
): PlaybackPosition {
  const home = path[0] ?? { gx: 0, gy: 0 }
  const site = path[path.length - 1] ?? home
  const still = (at: GridPoint): PlaybackPosition => ({
    at: { gx: at.gx, gy: at.gy },
    moving: false,
    heading: { dgx: 0, dgy: 0 },
  })
  if (!Array.isArray(beats) || beats.length === 0 || path.length < 2) return still(home)

  const phase = playbackPhaseAt(elapsedMs, beats.length)
  const beat = beats[phase.beat]
  if (beat === 'at-site' || beat === 'waiting') return still(site)

  if (beat === 'travel') {
    const at = pointAlongPath(path, phase.within01)
    const ahead = pointAlongPath(path, Math.min(1, phase.within01 + 0.02))
    return {
      at,
      moving: true,
      heading: { dgx: ahead.gx - at.gx, dgy: ahead.gy - at.gy },
    }
  }

  // 'home'. Before the departure the person has not left; after the working day they
  // are walking back, which is the beat-9 return the scene deliberately does not play.
  if (phase.beat < firstWorkBeat(beats)) return still(home)
  if (phase.beat < afterLastWorkBeat(beats)) return still(site)
  const at = pointAlongPath(path, 1 - phase.within01)
  const ahead = pointAlongPath(path, Math.max(0, 1 - phase.within01 - 0.02))
  return { at, moving: true, heading: { dgx: ahead.gx - at.gx, dgy: ahead.gy - at.gy } }
}
