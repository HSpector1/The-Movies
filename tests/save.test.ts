// Phase-1 test: §17 save format + rev. 4 M14.
//
// Contract sources:
//  - §17: type SaveFileV1 = { saveVersion: 1; seed; state; broadcastCache };
//    version validation, loud rejection of unknown versions, JSON export/import.
//  - M14: broadcastCache ≡ state.broadcastItems; envelope seed must equal
//    state.seed; load validation rejects any divergence loudly (same failure mode
//    as an unknown saveVersion); §15.7 byte-identity compares the full serialized
//    SaveFileV1.
//  - §15.7: same seed + same actions → byte-identical state and Broadcast copy.
//
// Fixture GameState values are INPUTS chosen here (per §2.5's type) — they are not
// expectations and are not derived from implementation. Seeded RNG only; no
// unseeded randomness is used to build any fixture.

import { describe, it, expect } from 'vitest'
import {
  makeSave,
  loadSave,
  exportSave,
  importSave,
  generateWorld,
} from '../src/core/index.js'
import type {
  GameState,
  BroadcastItem,
  Talent,
  FilmConcept,
  Segment,
} from '../src/core/index.js'
import type { SaveFileV4 } from '../src/core/save.js'

// ── Minimal valid fixtures (all values are chosen inputs) ────────────────────

const SEED = 'save-fixture-seed'

// A real D-9 (multi-discipline) Talent. New games save as V2, whose GameState carries
// the full Talent shape (24 skills, ceilings, dev rates, work ethic, genre experience,
// work history). Rather than hand-transcribe those 24-skill records (fragile, and a
// silent drift risk), source a genuine talent from a generated world and stamp the
// fixture's chosen id/persona/fame/salary onto it. The values remain chosen INPUTS.
const genWriter: Talent = generateWorld('save-fixture-world').talent.find((t) => t.role === 'writer')!
const talent: Talent = {
  ...genWriter,
  id: 't1',
  name: 'Fixture Writer',
  age: 40,
  actual: { warmth: 0.1, gravity: -0.2, physicality: 0.3 },
  perceived: { warmth: 0.1, gravity: -0.2, physicality: 0.3 },
  fame: 30,
  salary: 100_000,
  authored: false,
}

const concept: FilmConcept = {
  id: 'c1',
  title: 'Fixture Film',
  genre: 'drama',
  baselineStrength: 60,
  originalityRaw: 55,
  baseNegativeCost: 4_500_000,
  requiredSlots: ['lead', 'antagonist', 'support'],
  roleRequirements: {
    lead: { target: { warmth: 0.2, gravity: 0.1, physicality: 0 }, tolerance: 1.2 },
    antagonist: { target: { warmth: -0.3, gravity: 0.4, physicality: 0.1 }, tolerance: 1.2 },
    support: { target: { warmth: 0.1, gravity: 0, physicality: 0.2 }, tolerance: 1.2 },
  },
}

const segments: Segment[] = [
  { id: 'youngAdult', share: 0.3, taste: { intimacy: -0.45, tonalWeight: -0.3, kineticEnergy: 0.75 } },
  { id: 'family', share: 0.25, taste: { intimacy: 0.55, tonalWeight: -0.55, kineticEnergy: 0.2 } },
  { id: 'adult', share: 0.3, taste: { intimacy: -0.2, tonalWeight: 0.45, kineticEnergy: -0.15 } },
  { id: 'prestige', share: 0.15, taste: { intimacy: 0.4, tonalWeight: 0.7, kineticEnergy: -0.4 } },
]

const broadcastItem: BroadcastItem = {
  subjectId: 'p1',
  topic: 'release',
  facts: {
    subjectId: 'p1',
    filmId: 'p1',
    forecastBand: 'mixed',
    realizedBand: 'strong',
    primaryCause: 'craft',
    direction: 'better',
  },
  template: 'release-better',
  tick: 8,
}

// Build a fresh, well-formed GameState. `broadcastItems` and `broadcastCache`
// must be equal (M14), so both draw from the same source array.
function makeState(broadcastItems: BroadcastItem[]): GameState {
  return {
    seed: SEED,
    rngState: 'rng-state-fixture',
    market: {
      tick: 8,
      forces: {
        escapism: 50,
        patriotism: 50,
        realism: 50,
        darkness: 50,
        optimism: 50,
        spectacle: 50,
      },
      segments,
      baseMarketValue: 40_000_000,
      competingSlate: [],
    },
    era: {
      soundRequired: true,
      televisionCompetition: false,
      censorship: 'none',
      costScale: 1.0,
    },
    studio: {
      cash: 20_000_000,
      standing: { audienceAwareness: 40, industryPrestige: 40, commercialConfidence: 50 },
      activeProductions: [],
      releasedFilms: [],
    },
    talent: [talent],
    concepts: [concept],
    broadcastItems,
    coverageContexts: [],
    // D-11 employment surface (empty fixture — no studio yet).
    founding: null,
    contracts: [],
    ledger: [],
    freeAgents: [],
    // D-12 economy surface (empty fixture — no theatrical runs yet).
    theatricalRuns: [],
  }
}

// A well-formed save: envelope seed === state.seed, broadcastCache === broadcastItems.
// makeSave is the D-12 default (V4), so a new-game save is a SaveFileV4.
function wellFormedSave(): SaveFileV4 {
  const items = [broadcastItem]
  const state = makeState(items)
  return makeSave(state)
}

describe('§17 / §15.7 — export→import→export round-trips byte-identically', () => {
  it('string equality across a full export/import/export cycle', () => {
    const save = wellFormedSave()
    const firstExport = exportSave(save)
    expect(typeof firstExport).toBe('string')

    const reimported = importSave(firstExport)
    const secondExport = exportSave(reimported)

    expect(secondExport).toBe(firstExport)
  })

  it('loadSave accepts a well-formed save without throwing', () => {
    // Source: §17 — a valid SaveFileV1 loads cleanly.
    const save = wellFormedSave()
    expect(() => loadSave(save)).not.toThrow()
  })
})

describe('§17 — loud rejection of an unknown saveVersion', () => {
  it('throws on an unknown saveVersion (e.g. 5)', () => {
    // Source: §17 "loud rejection of unknown versions". Versions 1–4 are all valid now
    // (D-9 V2 + D-11 V3 + D-12 V4); any other version is rejected loudly. V4 acceptance
    // is covered by the round-trip tests above.
    const save = wellFormedSave()
    const bad = { ...save, saveVersion: 5 } as unknown as SaveFileV4
    expect(() => loadSave(bad)).toThrow()
  })
})

describe('M14 — loud rejection when envelope seed ≠ state.seed', () => {
  it('throws when the envelope seed diverges from state.seed', () => {
    // Source: M14 "the envelope seed must equal state.seed; load validation
    // rejects any divergence loudly (same failure mode as an unknown saveVersion)."
    const save = wellFormedSave()
    const bad: SaveFileV4 = { ...save, seed: 'a-different-seed' }
    expect(() => loadSave(bad)).toThrow()
  })
})

describe('M14 — loud rejection when broadcastCache ≠ state.broadcastItems', () => {
  it('throws when broadcastCache diverges from state.broadcastItems', () => {
    // Source: M14 "broadcastCache ≡ state.broadcastItems ... rejects any
    // divergence loudly." Divergent content in the cache must be caught.
    const save = wellFormedSave()
    const divergentItem: BroadcastItem = { ...broadcastItem, template: 'release-worse' }
    const bad: SaveFileV4 = { ...save, broadcastCache: [divergentItem] }
    expect(() => loadSave(bad)).toThrow()
  })

  it('throws when broadcastCache differs from state.broadcastItems by length', () => {
    // Source: M14 — any divergence (including cardinality) is rejected.
    const save = wellFormedSave()
    const bad: SaveFileV4 = { ...save, broadcastCache: [] }
    expect(() => loadSave(bad)).toThrow()
  })
})
