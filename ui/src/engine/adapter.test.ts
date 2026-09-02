// Adapter tests — the boundary crossing + information-integrity + autopsy
// reconstruction. These run under the `ui` vitest project (jsdom) but exercise
// pure adapter logic (no DOM needed for most).

import { describe, it, expect } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
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
  studioDecision,
  AUTHORED_START,
  CAST_SLOTS,
  findTalent,
  talentAssignmentContext,
} from './adapter.ts'
import type { GameState, DraftPackage } from './adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'

const SEED = 'studio-ui-test'

// Build a legal draft package from the FOUNDED studio roster. Under D-11.12 film
// assembly draws ONLY from studio-contracted talent (the global pool is no longer
// staffable), and D-11.13 requires exactly ONE Production/Craft Lead — so we pick
// roster ids by role and fill the craft slot.
function makeLegalPackage(state: GameState): DraftPackage {
  const concepts = state.concepts
  const concept = concepts[0]!
  const writers = foundedRosterIds(state, 'writer')
  const directors = foundedRosterIds(state, 'director')
  const actors = foundedRosterIds(state, 'actor')
  const craft = foundedRosterIds(state, 'craft')
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
    writerId: writers[0]!,
    directorId: directors[0]!,
    craftIds: [craft[0]!],
    cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
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
    expect(dup).toEqual({
      eligible: false,
      reason: 'Already assigned elsewhere on this picture — one person can hold only one role per production.',
    })
  })

  it('marks talent engaged in an active production unavailable after greenlight', () => {
    const state = newFoundedGame(SEED)
    const pkg = makeLegalPackage(state)
    const result = greenlight(state, pkg)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const next = result.next
    // RE-POINTED for P04A.2 (Owner ruling A/B/C). This spec proves "a talent
    // ENGAGED in an active production is unavailable and ineligible". It used to
    // read that off the credited WRITER, which is no longer an engagement: a
    // Writer credit is permanent, is never an availability blocker, and the
    // core's `busyTalentIds` (= production SEATS ∪ active writing assignments)
    // does not contain it. The law itself is unchanged, so it is re-read off a
    // real production SEAT — the director, and every cast slot.
    const directorVisible = talentByRole(next, 'director').find((t) => t.id === pkg.directorId)!
    expect(directorVisible.available).toBe(false)
    expect(directorVisible.engagedIn).not.toBeNull()
    expect(talentEligibility(directorVisible, 'director', []).eligible).toBe(false)
    for (const slot of CAST_SLOTS) {
      const castVisible = talentByRole(next, 'actor').find((t) => t.id === pkg.cast[slot])!
      expect(castVisible.available).toBe(false)
      expect(talentEligibility(castVisible, 'actor', []).eligible).toBe(false)
    }
  })

  it('leaves the credited writer available — a Writer credit is not an engagement', () => {
    // P04A.2 (Owner ruling A/B/C): the author of a screenplay stays attached as the
    // credited Writer for the life of the picture, but that credit is NEVER an
    // availability claim. Once the screenplay is finished the writer is released,
    // so the adapter must offer them for the next picture instead of refusing with
    // "Already working on …". This is the exact deadlock P04A.2 closes.
    const state = newFoundedGame(SEED)
    const pkg = makeLegalPackage(state)
    const result = greenlight(state, pkg)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const next = result.next
    expect(next.studio.activeProductions[0]!.writerId).toBe(pkg.writerId)
    const writerVisible = talentByRole(next, 'writer').find((t) => t.id === pkg.writerId)!
    expect(writerVisible.available).toBe(true)
    expect(writerVisible.engagedIn).toBeNull()
    expect(writerVisible.assignmentKind).toBeNull()
    expect(talentEligibility(writerVisible, 'writer', []).eligible).toBe(true)
  })

  it('gates zero, one, and hostile multiple assignments without last-write-wins truth', () => {
    const state = newFoundedGame('assignment-context-unique')
    const pkg = makeLegalPackage(state)
    expect(talentAssignmentContext(state, pkg.directorId)).toEqual({ kind: 'available' })

    const result = greenlight(state, pkg)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const title = result.next.concepts.find((concept) => concept.id === pkg.conceptId)!.title
    expect(talentAssignmentContext(result.next, pkg.directorId)).toEqual({
      kind: 'assigned',
      assignment: {
        kind: 'production',
        assignmentId: result.next.studio.activeProductions[0]!.id,
        label: title,
      },
    })

    const production = result.next.studio.activeProductions[0]!
    const hostile: GameState = {
      ...result.next,
      studio: {
        ...result.next.studio,
        activeProductions: [
          production,
          { ...production, id: `${production.id}-hostile-duplicate` },
        ],
      },
    }
    expect(talentAssignmentContext(hostile, pkg.directorId)).toEqual({ kind: 'ambiguous' })
  })
})

describe('adapter: preview forecast equals stored snapshot at greenlight', () => {
  it('previewForecast === the greenlit production forecastSnapshot (determinism)', () => {
    const state = newFoundedGame(SEED)
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
    const state = newFoundedGame(SEED)
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
    let state = newFoundedGame(SEED)
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
      // P06A W1: a Release Ready picture HOLDS until explicitly committed — resolve the
      // decision the instant it appears so the loop still finds a real release.
      const decision = studioDecision(state)
      if (decision?.kind === 'releaseReview') {
        state = applyActions(state, [
          { kind: 'commitPictureToRelease', productionId: decision.decision.productionId },
        ])
      }
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

describe('adapter: authored talent (D-9.14)', () => {
  it('createTalent appears in the pool at the contracted fixed fame; the player never sets skill', () => {
    const state = newGame(SEED)
    const before = talentByRole(state, 'actor').length
    const r = createTalent(state, {
      name: 'Test Star',
      role: 'actor',
      age: 30,
      actual: { warmth: 0.2, gravity: -0.1, physicality: 0.5 },
      potentialTier: 'Promising',
      workEthic: 60,
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const pool = talentByRole(r.next, 'actor')
    expect(pool.length).toBe(before + 1)
    const created = pool.find((t) => t.authored)!
    // Fame is fixed by the contract; skill is a DERIVED proxy (primary perceived OVR),
    // not a player-set number — so we assert only that it is a finite, unset-by-player
    // value, never the false "35 known ability" the old scalar model claimed.
    expect(created.fame).toBe(AUTHORED_START.fame)
    expect(Number.isFinite(created.skill)).toBe(true)
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
      potentialTier: 'Steady',
      workEthic: 60,
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
