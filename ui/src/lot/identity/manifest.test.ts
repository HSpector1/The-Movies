// ── D1-A: the studio-identity manifest is PRESENTATION-ONLY ──────────────────────
// The manifest describes how the lot LOOKS. It must never carry simulation state — no
// cash, week, productions, standing, talent, rng/seed, actions, or money. These tests
// assert that invariant structurally (so a future field that smuggles sim state fails
// here), that its palette is well-formed colour data, and that D1-A exposes exactly one
// concept (A). The identity feature flag is proven DEFAULT-OFF, mirroring the overview flag.

import { describe, expect, it } from 'vitest'
import {
  CONCEPT_A_GOLDEN_AGE,
  IDENTITY_CONCEPTS,
  manifestFor,
  hex,
  type IdentityMode,
} from './manifest.ts'
import {
  setStudioLotIdentityOverride,
  studioLotIdentityProofEnabled,
  STUDIO_LOT_IDENTITY_LS_KEY,
} from '../../flags.ts'

// Vocabulary that would indicate simulation state leaking into presentation data.
const FORBIDDEN_KEYS = [
  'cash',
  'week',
  'tick',
  'state',
  'gamestate',
  'production',
  'productions',
  'standing',
  'talent',
  'rng',
  'seed',
  'action',
  'actions',
  'force',
  'forces',
  'forecast',
  'money',
  'revenue',
  'boxoffice',
  'score',
  'criticscore',
  'awareness',
  'prestige',
  'confidence',
]

function collectKeys(v: unknown, out: string[] = []): string[] {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    for (const k of Object.keys(v as Record<string, unknown>)) {
      out.push(k)
      collectKeys((v as Record<string, unknown>)[k], out)
    }
  } else if (Array.isArray(v)) {
    for (const item of v) collectKeys(item, out)
  }
  return out
}

describe('D1-A studio-identity manifest — presentation-only', () => {
  it('Concept A exposes exactly the identity shape (no extra top-level fields)', () => {
    expect(Object.keys(CONCEPT_A_GOLDEN_AGE).sort()).toEqual(
      ['displayName', 'emblem', 'id', 'marquee', 'monogram', 'palette', 'shortName', 'signage'].sort(),
    )
  })

  it('carries NO key drawn from the simulation vocabulary at any depth', () => {
    const keys = collectKeys(CONCEPT_A_GOLDEN_AGE).map((k) => k.toLowerCase())
    const leaked = keys.filter((k) => FORBIDDEN_KEYS.includes(k))
    expect(leaked, `simulation-state keys leaked into the manifest: ${leaked.join(', ')}`).toEqual([])
  })

  it('every palette entry is a valid 24-bit colour number', () => {
    for (const [name, value] of Object.entries(CONCEPT_A_GOLDEN_AGE.palette)) {
      expect(Number.isInteger(value), `${name} must be an integer colour`).toBe(true)
      expect(value, `${name} in range`).toBeGreaterThanOrEqual(0)
      expect(value, `${name} in range`).toBeLessThanOrEqual(0xffffff)
    }
  })

  it('hex() renders a #rrggbb string from a colour number', () => {
    expect(hex(0xc9a24a)).toBe('#c9a24a')
    expect(hex(0x000000)).toBe('#000000')
    expect(hex(0xffffff)).toBe('#ffffff')
  })

  it('D1-A ships exactly one concept (A); B/C are reserved', () => {
    expect(Object.keys(IDENTITY_CONCEPTS)).toEqual(['concept-a'])
  })

  it('every review mode resolves to Concept A (only one concept shipped in D1-A)', () => {
    const modes: IdentityMode[] = ['baseline', 'concept-a', 'fallback']
    for (const m of modes) expect(manifestFor(m).id).toBe('concept-a-golden-age-deco')
  })

  it('the marquee declares a static reduced-motion equivalent', () => {
    expect(CONCEPT_A_GOLDEN_AGE.marquee.reducedMotionMode).toBe('static')
  })
})

describe('D1-A studio-identity feature flag', () => {
  it('is OFF by default (fresh session, no override)', () => {
    expect(studioLotIdentityProofEnabled()).toBe(false)
  })

  it('turns ON with the localStorage override and OFF again when cleared', () => {
    setStudioLotIdentityOverride(true)
    expect(localStorage.getItem(STUDIO_LOT_IDENTITY_LS_KEY)).toBe('1')
    expect(studioLotIdentityProofEnabled()).toBe(true)
    setStudioLotIdentityOverride(false)
    expect(localStorage.getItem(STUDIO_LOT_IDENTITY_LS_KEY)).toBeNull()
    expect(studioLotIdentityProofEnabled()).toBe(false)
  })
})
