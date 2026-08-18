// ── PF1-M1 CONTRACT SUITE — era music registry ───────────────────────────────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M1, NOT from the implementation.
//
// Governing charter law exercised by this file:
//   • "Music: an era-keyed registry (data: era → track list, keyed off the
//      existing EraConfig on GameState) with a 1948 bed now, so C4's decade
//      march swaps music by data. No commercial soundtrack."          (§5-M1)
//
// Frozen resolver law: exact match, else nearest-lower-decade, else first entry;
// never throws.
//
// Every expectation is computed FROM the registry rather than hardcoded to one
// track list, so the suite keeps its teeth when C4 adds decades — the resolver's
// LAW is what is pinned, not today's content.

import { describe, expect, it } from 'vitest'
import { ERA_MUSIC, musicTracksForEra } from '../../audio/registry.ts'

const KEYS = Object.keys(ERA_MUSIC)
const NUMERIC_KEYS = KEYS.filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b))
const FIRST_ENTRY = Object.values(ERA_MUSIC)[0]

/** The frozen fallback: the entry for the largest registry key at or below `year`. */
function nearestLowerEntry(year: number): readonly string[] | undefined {
  let best: string | undefined
  for (const key of NUMERIC_KEYS) if (Number(key) <= year) best = key
  return best === undefined ? undefined : ERA_MUSIC[best]
}

describe('PF1-M1 contract — the registry is data', () => {
  it("carries a non-empty '1948' entry (the bed PF1 ships)", () => {
    expect(ERA_MUSIC['1948']).toBeDefined()
    expect(Array.isArray(ERA_MUSIC['1948'])).toBe(true)
    expect(ERA_MUSIC['1948']!.length).toBeGreaterThan(0)
  })

  it('every entry is a non-empty list of non-empty track ids', () => {
    expect(KEYS.length).toBeGreaterThan(0)
    for (const key of KEYS) {
      const tracks = ERA_MUSIC[key]!
      expect(Array.isArray(tracks), `${key} must map to an array`).toBe(true)
      expect(tracks.length, `${key} must list at least one track`).toBeGreaterThan(0)
      for (const track of tracks) {
        expect(typeof track, `${key} track must be a string`).toBe('string')
        expect(track.trim().length, `${key} track must be non-empty`).toBeGreaterThan(0)
      }
    }
  })

  it('no track id is the hardcoded-slash form (§5-M1: BASE_URL-templated URLs only)', () => {
    const rooted = KEYS.flatMap((key) => ERA_MUSIC[key]!.filter((t) => t.startsWith('/')))
    expect(rooted).toEqual([])
  })
})

describe('PF1-M1 contract — musicTracksForEra resolution', () => {
  it("resolves '1948' by exact match", () => {
    expect(musicTracksForEra('1948')).toEqual(ERA_MUSIC['1948'])
  })

  it('resolves every registry key by exact match', () => {
    for (const key of KEYS) {
      expect(musicTracksForEra(key), `exact match for ${key}`).toEqual(ERA_MUSIC[key])
    }
  })

  it('falls back to the nearest LOWER era for a year above a known era', () => {
    for (const key of NUMERIC_KEYS) {
      const year = Number(key)
      for (const offset of [1, 2, 9]) {
        const probe = String(year + offset)
        if (KEYS.includes(probe)) continue
        expect(musicTracksForEra(probe), `${probe} should fall back below itself`).toEqual(
          nearestLowerEntry(year + offset),
        )
      }
    }
  })

  it('a far-future era still resolves to the latest era on file', () => {
    const latest = NUMERIC_KEYS[NUMERIC_KEYS.length - 1]
    expect(latest, 'the registry must carry at least one numeric era key').toBeDefined()
    expect(musicTracksForEra('2999')).toEqual(ERA_MUSIC[latest!])
  })

  it('a year below every known era falls back to the first entry', () => {
    expect(musicTracksForEra('0001')).toEqual(FIRST_ENTRY)
    expect(musicTracksForEra('1000')).toEqual(FIRST_ENTRY)
  })

  it('an unrecognisable era key falls back to the first entry', () => {
    for (const key of ['', 'not-an-era', 'silent-era', 'NaN', 'undefined']) {
      expect(musicTracksForEra(key), `${key} must fall back to the first entry`).toEqual(FIRST_ENTRY)
    }
  })
})

describe('PF1-M1 contract — the resolver is total', () => {
  const hostileKeys = [
    '',
    ' ',
    '  1948  ',
    '1948x',
    'x1948',
    '19.48',
    '1e10',
    '-1000',
    '+1948',
    '0',
    '00001948',
    'null',
    'undefined',
    'NaN',
    'Infinity',
    '[object Object]',
    '__proto__',
    'constructor',
    'toString',
    '1948\n',
    '１９４８',
    'é'.repeat(64),
    '9'.repeat(400),
  ]

  it('never throws for any key', () => {
    for (const key of hostileKeys) {
      expect(() => musicTracksForEra(key), `key ${JSON.stringify(key)} must not throw`).not.toThrow()
    }
  })

  it('never returns undefined or an empty list', () => {
    for (const key of [...hostileKeys, ...KEYS]) {
      const tracks = musicTracksForEra(key)
      expect(tracks, `key ${JSON.stringify(key)} must resolve to a list`).toBeDefined()
      expect(Array.isArray(tracks), `key ${JSON.stringify(key)} must resolve to an array`).toBe(true)
      expect(tracks.length, `key ${JSON.stringify(key)} must resolve to a playable list`).toBeGreaterThan(0)
    }
  })

  it('only ever returns tracks that exist in the registry', () => {
    const known = new Set(KEYS.flatMap((key) => [...ERA_MUSIC[key]!]))
    for (const key of [...hostileKeys, ...KEYS]) {
      for (const track of musicTracksForEra(key)) {
        expect(known.has(track), `${key} resolved to an unregistered track: ${track}`).toBe(true)
      }
    }
  })

  it('is deterministic — the same key resolves identically every time', () => {
    for (const key of ['1948', '1955', 'not-an-era', '']) {
      const first = musicTracksForEra(key)
      expect(musicTracksForEra(key)).toEqual(first)
      expect(musicTracksForEra(key)).toEqual(first)
    }
  })
})
