// Adapter tests — the boundary crossing + information-integrity + autopsy
// reconstruction. These run under the `ui` vitest project (jsdom) but exercise
// pure adapter logic (no DOM needed for most).

import { describe, it, expect } from 'vitest'
import {
  newGame,
  standingChannels,
  talentByRole,
  toPlayerVisible,
  talentEligibility,
  requiredNegative,
  previewForecast,
  greenlight,
  createTalent,
  advanceWeek,
  explainRelease,
  exportSaveJson,
  importSaveJson,
  predictedProductionId,
  AUTHORED_START,
  CAST_SLOTS,
  findTalent,
} from './adapter.ts'
import type { GameState, DraftPackage } from './adapter.ts'

const SEED = 'studio-ui-test'

// Build a legal draft package by picking the first eligible talent of each role.
function makeLegalPackage(state: GameState): DraftPackage {
  const concepts = state.concepts
  const concept = concepts[0]!
  const writer = talentByRole(state, 'writer').find((t) => t.available)!
  const director = talentByRole(state, 'director').find((t) => t.available)!
  const actors = talentByRole(state, 'actor').filter((t) => t.available)
  const req = requiredNegative(concept, { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }, state)
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [-0.5, 0.5],
        kineticEnergy: [-0.5, 0.5],
      },
    },
    writerId: writer.id,
    directorId: director.id,
    craftIds: [],
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
    budget: { negative: req, marketing: 400_000 },
  }
}

describe('adapter: world + selectors', () => {
  it('newGame is deterministic for a seed', () => {
    const a = newGame(SEED)
    const b = newGame(SEED)
    expect(a.market.baseMarketValue).toBe(b.market.baseMarketValue)
    expect(a.talent[0]!.id).toBe(b.talent[0]!.id)
  })

  it('exposes the three labeled standing channels', () => {
    const state = newGame(SEED)
    const ch = standingChannels(state)
    expect(ch.map((c) => c.key)).toEqual([
      'audienceAwareness',
      'industryPrestige',
      'commercialConfidence',
    ])
    expect(ch[0]!.label).toBe('Audience Awareness')
  })
})

describe('adapter: information integrity', () => {
  it('player-visible talent exposes perceived persona, never actual', () => {
    const state = newGame(SEED)
    const raw = state.talent[0]!
    const visible = toPlayerVisible(raw, new Map())
    expect(visible.perceived).toEqual(raw.perceived)
    // The projected object has no `actual` field at all.
    expect((visible as Record<string, unknown>).actual).toBeUndefined()
  })

  it('talentByRole never leaks actual persona', () => {
    const state = newGame(SEED)
    for (const t of talentByRole(state, 'actor')) {
      expect((t as Record<string, unknown>).actual).toBeUndefined()
      expect(t.perceived).toBeDefined()
    }
  })
})

describe('adapter: eligibility mirrors engine legality', () => {
  it('flags wrong role, engagement, and duplicate cast', () => {
    const state = newGame(SEED)
    const writer = talentByRole(state, 'writer')[0]!
    // wrong role
    expect(talentEligibility(writer, 'director', []).eligible).toBe(false)
    // duplicate on this film
    const actor = talentByRole(state, 'actor')[0]!
    const dup = talentEligibility(actor, 'actor', [actor.id])
    expect(dup.eligible).toBe(false)
  })

  it('marks talent engaged in an active production unavailable after greenlight', () => {
    const state = newGame(SEED)
    const pkg = makeLegalPackage(state)
    const result = greenlight(state, pkg)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const next = result.next
    const writerVisible = talentByRole(next, 'writer').find((t) => t.id === pkg.writerId)!
    expect(writerVisible.available).toBe(false)
    expect(talentEligibility(writerVisible, 'writer', []).eligible).toBe(false)
  })
})

describe('adapter: preview forecast equals stored snapshot at greenlight', () => {
  it('previewForecast === the greenlit production forecastSnapshot (determinism)', () => {
    const state = newGame(SEED)
    const pkg = makeLegalPackage(state)
    const predictedId = predictedProductionId(state)
    const preview = previewForecast(state, pkg)
    const result = greenlight(state, pkg)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const prod = result.next.studio.activeProductions.find((p) => p.id === predictedId)!
    expect(prod).toBeDefined()
    // Deterministic: same inputs, same predicted id → byte-equal forecast.
    expect(preview).toEqual(prod.forecastSnapshot)
  })
})

describe('adapter: greenlight surfaces validation as data', () => {
  it('returns { ok:false } with a message on illegal package (not a throw)', () => {
    const state = newGame(SEED)
    const pkg = makeLegalPackage(state)
    // duplicate cast → engine rejects
    const bad = { ...pkg, cast: { ...pkg.cast, antagonist: pkg.cast.lead } }
    const result = greenlight(state, bad)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toMatch(/cast slot|actor/i)
  })
})

describe('adapter: full loop + autopsy reconstruction', () => {
  it('greenlight → advance to release → autopsy matches stored FilmResult', () => {
    let state = newGame(SEED)
    const pkg = makeLegalPackage(state)
    const g = greenlight(state, pkg)
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next

    // Advance until the film releases.
    let released: ReturnType<typeof advanceWeek>['released'] = []
    let preTick = state
    let postStanding = state.studio.standing
    for (let i = 0; i < 20 && released.length === 0; i++) {
      const step = advanceWeek(state)
      preTick = step.preTick
      state = step.next
      postStanding = state.studio.standing
      released = step.released
    }
    expect(released.length).toBeGreaterThan(0)
    const film = released[0]!

    const view = explainRelease(preTick, postStanding, film)
    // Deterministic fields: box office equals stored; sampled fields use stored.
    expect(view.boxOffice.total).toBeCloseTo(film.boxOffice.total, 6)
    expect(view.boxOffice.opening).toBeCloseTo(film.boxOffice.opening, 6)
    expect(view.criticScore).toBe(film.criticScore)
    expect(view.reviewVariance).toBe(film.reviewVariance)
    // Standing deltas = post - pre.
    expect(view.standingDeltas.industryPrestige).toBeCloseTo(
      postStanding.industryPrestige - preTick.studio.standing.industryPrestige,
      6,
    )
    // Every headline number is finite (nothing invented / NaN).
    expect(Number.isFinite(view.craft)).toBe(true)
    expect(Number.isFinite(view.cohesion)).toBe(true)
    expect(Number.isFinite(view.profit)).toBe(true)
  })
})

describe('adapter: authored talent', () => {
  it('createTalent appears in the pool at contracted starting skill/fame', () => {
    const state = newGame(SEED)
    const before = talentByRole(state, 'actor').length
    const r = createTalent(state, {
      name: 'Test Star',
      role: 'actor',
      age: 30,
      actual: { warmth: 0.2, gravity: -0.1, physicality: 0.5 },
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const pool = talentByRole(r.next, 'actor')
    expect(pool.length).toBe(before + 1)
    const created = pool.find((t) => t.authored)!
    expect(created.skill).toBe(AUTHORED_START.skill)
    expect(created.fame).toBe(AUTHORED_START.fame)
    // perceived = actual on creation, and we only ever expose perceived.
    const raw = findTalent(r.next, created.id)!
    expect(raw.perceived).toEqual(raw.actual)
  })

  it('rejects out-of-range age as data', () => {
    const state = newGame(SEED)
    const r = createTalent(state, {
      name: 'Too Young',
      role: 'actor',
      age: 5,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
    })
    expect(r.ok).toBe(false)
  })
})

describe('adapter: saves round-trip + loud rejection', () => {
  it('export → import restores state exactly', () => {
    const state = newGame(SEED)
    const json = exportSaveJson(state)
    const r = importSaveJson(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.seed).toBe(state.seed)
    expect(r.state.market.baseMarketValue).toBe(state.market.baseMarketValue)
  })

  it('rejects malformed JSON loudly (as data, not a crash)', () => {
    const r = importSaveJson('{ not json')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.length).toBeGreaterThan(0)
  })

  it('rejects an unknown save version', () => {
    const r = importSaveJson(JSON.stringify({ saveVersion: 99, seed: 'x' }))
    expect(r.ok).toBe(false)
  })
})

describe('adapter: cast-slot constants', () => {
  it('exposes the three cast slots in fixed order', () => {
    expect(CAST_SLOTS).toEqual(['lead', 'antagonist', 'support'])
  })
})
