// ── Week playback — the state machine, proven without a renderer ──────────────
//
// Every claim the scene makes about a week playback is a claim about these functions:
// where a person is at a given instant, when the played window ends, and — the one that
// carries the law — that the settled frame is EXACTLY the static truth, so stopping the
// clock never leaves the world saying something the projection did not say.

import { describe, expect, it } from 'vitest'
import type { LotPresenceBeat } from '../snapshot/StudioLotSnapshot.ts'
import {
  PLAYBACK_BEAT_MS,
  PLAYBACK_DURATION_MS,
  PLAYBACK_LAST_BEAT,
  personPositionAt,
  playbackFinished,
  playbackPhaseAt,
  pointAlongPath,
} from './playback.ts'
import type { GridPoint } from './world.ts'

const HOME: GridPoint = { gx: 5.4, gy: 11.9 }
const MID: GridPoint = { gx: 6.4, gy: 8.4 }
const SITE: GridPoint = { gx: 4.5, gy: 4.5 }
const PATH: GridPoint[] = [HOME, MID, SITE]

function workWeek(departure: number, working: 'at-site' | 'waiting'): LotPresenceBeat[] {
  const beats: LotPresenceBeat[] = []
  for (let i = 0; i < 10; i++) {
    if (i < departure) beats.push('home')
    else if (i === departure) beats.push('travel')
    else if (i <= 8) beats.push(working)
    else beats.push('home')
  }
  return beats
}

describe('playback — the wall clock', () => {
  it('lands inside the target window the milestone asked for (8–12s)', () => {
    expect(PLAYBACK_DURATION_MS).toBe((PLAYBACK_LAST_BEAT + 1) * PLAYBACK_BEAT_MS)
    expect(PLAYBACK_DURATION_MS).toBeGreaterThanOrEqual(8_000)
    expect(PLAYBACK_DURATION_MS).toBeLessThanOrEqual(12_000)
  })

  it('plays the WORKING DAY and stops there — the beat-9 walk home is not the window', () => {
    // Beat 9 exists in the engine's array and is implemented below; the scene simply
    // does not run past the working day, because the settled frame must equal the
    // static truth (people at work), not an empty lot.
    expect(PLAYBACK_LAST_BEAT).toBe(8)
    expect(playbackFinished(PLAYBACK_DURATION_MS - 1)).toBe(false)
    expect(playbackFinished(PLAYBACK_DURATION_MS)).toBe(true)
  })

  it('maps wall time onto beats at the exact boundaries', () => {
    expect(playbackPhaseAt(0, 10)).toEqual({ beat: 0, within01: 0 })
    expect(playbackPhaseAt(PLAYBACK_BEAT_MS, 10)).toEqual({ beat: 1, within01: 0 })
    expect(playbackPhaseAt(PLAYBACK_BEAT_MS * 1.5, 10).beat).toBe(1)
    expect(playbackPhaseAt(PLAYBACK_BEAT_MS * 1.5, 10).within01).toBeCloseTo(0.5, 6)
    // Never off either end.
    expect(playbackPhaseAt(-500, 10)).toEqual({ beat: 0, within01: 0 })
    expect(playbackPhaseAt(PLAYBACK_BEAT_MS * 99, 10)).toEqual({ beat: 9, within01: 1 })
  })
})

describe('playback — walking a path', () => {
  it('interpolates by ARC LENGTH, so a long leg is not sprinted', () => {
    expect(pointAlongPath(PATH, 0)).toEqual(HOME)
    expect(pointAlongPath(PATH, 1)).toEqual(SITE)
    const half = pointAlongPath(PATH, 0.5)
    const legA = Math.hypot(MID.gx - HOME.gx, MID.gy - HOME.gy)
    const legB = Math.hypot(SITE.gx - MID.gx, SITE.gy - MID.gy)
    const travelled =
      Math.hypot(half.gx - HOME.gx, half.gy - HOME.gy) <= legA
        ? Math.hypot(half.gx - HOME.gx, half.gy - HOME.gy)
        : legA + Math.hypot(half.gx - MID.gx, half.gy - MID.gy)
    expect(travelled).toBeCloseTo((legA + legB) / 2, 5)
  })

  it('clamps a degenerate path instead of returning a NaN position', () => {
    expect(pointAlongPath([], 0.5)).toEqual({ gx: 0, gy: 0 })
    expect(pointAlongPath([HOME], 0.5)).toEqual(HOME)
    expect(pointAlongPath(PATH, Number.NaN)).toEqual(HOME)
  })
})

describe('playback — one person over one week', () => {
  const beats = workWeek(1, 'at-site')

  it('holds at home through the staggered departure', () => {
    const at = personPositionAt(beats, PATH, 0)
    expect(at.at).toEqual(HOME)
    expect(at.moving).toBe(false)
  })

  it('walks the whole path across the single travel beat', () => {
    const start = personPositionAt(beats, PATH, PLAYBACK_BEAT_MS)
    expect(start.at).toEqual(HOME)
    expect(start.moving).toBe(true)
    const mid = personPositionAt(beats, PATH, PLAYBACK_BEAT_MS * 1.5)
    expect(mid.moving).toBe(true)
    expect(mid.at).not.toEqual(HOME)
    expect(mid.at).not.toEqual(SITE)
    expect(mid.heading.dgx === 0 && mid.heading.dgy === 0).toBe(false)
  })

  it('is AT THE SITE at every working beat, and at the played window’s end', () => {
    for (let beat = 2; beat <= PLAYBACK_LAST_BEAT; beat++) {
      const at = personPositionAt(beats, PATH, PLAYBACK_BEAT_MS * beat + 10)
      expect(at.at).toEqual(SITE)
      expect(at.moving).toBe(false)
    }
    // THE LAW: the settled frame equals the static truth, exactly.
    expect(personPositionAt(beats, PATH, PLAYBACK_DURATION_MS - 1).at).toEqual(SITE)
  })

  it('implements the beat-9 return home, for the beat the scene does not play', () => {
    const returning = personPositionAt(beats, PATH, PLAYBACK_BEAT_MS * 9.5)
    expect(returning.moving).toBe(true)
    expect(returning.at).not.toEqual(SITE)
    const arrived = personPositionAt(beats, PATH, PLAYBACK_BEAT_MS * 10)
    expect(arrived.at).toEqual(HOME)
  })

  it('treats a WAITING week exactly like a working one: they still travel and stand', () => {
    const queued = workWeek(0, 'waiting')
    expect(personPositionAt(queued, PATH, PLAYBACK_BEAT_MS * 0.5).moving).toBe(true)
    expect(personPositionAt(queued, PATH, PLAYBACK_BEAT_MS * 5).at).toEqual(SITE)
  })

  it('never moves a person whose whole week is home', () => {
    const stayed: LotPresenceBeat[] = Array.from({ length: 10 }, () => 'home')
    for (const t of [0, PLAYBACK_BEAT_MS * 3, PLAYBACK_DURATION_MS]) {
      expect(personPositionAt(stayed, [HOME], t)).toMatchObject({ at: HOME, moving: false })
    }
  })

  it('honours a different departure beat without changing where the week ends', () => {
    for (const departure of [0, 1, 2]) {
      const week = workWeek(departure, 'at-site')
      // Still at home right up to the instant the stagger sends them out…
      expect(personPositionAt(week, PATH, PLAYBACK_BEAT_MS * departure).at).toEqual(HOME)
      // …and moving one tick later, whichever beat that was.
      expect(personPositionAt(week, PATH, PLAYBACK_BEAT_MS * departure + 200).moving).toBe(true)
      // …and every stagger settles on the same site at the end of the played window.
      expect(personPositionAt(week, PATH, PLAYBACK_DURATION_MS - 1).at).toEqual(SITE)
    }
  })

  it('is a pure function of (beats, path, time) — replayable to the digit', () => {
    const first = personPositionAt(beats, PATH, PLAYBACK_BEAT_MS * 1.37)
    const second = personPositionAt(beats, PATH, PLAYBACK_BEAT_MS * 1.37)
    expect(second).toEqual(first)
  })

  it('refuses to move anyone on a malformed input rather than guessing', () => {
    expect(personPositionAt([], PATH, 500).at).toEqual(HOME)
    expect(personPositionAt(beats, [], 500).at).toEqual({ gx: 0, gy: 0 })
    expect(personPositionAt(beats, [HOME], 500).at).toEqual(HOME)
  })
})
