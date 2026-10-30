// ── P17 pure-law fixtures: hand-built public FilmResults over a REAL P16 rights state ─────────────────
//
// Not a test file. The legality matrix reads public film facts, the franchise root and the live P16 rights read. Here
// the rights read is always P16's own (`continuationWorldOf(state)` on a real route state; there is no rights stand-in),
// while later installments are hand-built public results so a lineage of any shape is cheap. `week` may sit after the
// state's week: the matrix and the R/M/F read take the world's week, the rights read takes the state's own week (P16
// answers no future week), which is the only coupling these cases need.
// Paper convention (rev02 §5.4): expectedTotal $150M; a film "(c/a, k×)" has critic c, audience a, total k × $150M.

import { emptyFranchiseRoot, type ContinuationWorld } from '../../src/core/continuation.js'
import { continuationWorldOf } from '../../src/core/continuationGreenlight.js'
import type { FilmParticipants, FilmResult, FranchiseRoot, GameState } from '../../src/core/types.js'

export const EXPECTED = 150_000_000

export type Cast = { writer: string; director: string; lead: string; antagonist: string; support: string }

export function participantsOf(p: Cast): FilmParticipants {
  const one = (talentId: string, role: FilmParticipants['writer']['role'], discipline: FilmParticipants['writer']['discipline']) => ({
    talentId, name: talentId, role, discipline, greenlightOVR: 50, greenlightFit: 50, greenlightEP: { low: 40, high: 60, expected: 50 }, freelancer: false,
  })
  return {
    writer: one(p.writer, 'writer', 'writing'),
    director: one(p.director, 'director', 'directing'),
    cast: { lead: one(p.lead, 'lead', 'acting'), antagonist: one(p.antagonist, 'antagonist', 'acting'), support: one(p.support, 'support', 'acting') },
    craft: [one('craft-1', 'craft', 'craft')],
  }
}

export function film(productionId: string, releaseTick: number, critic: number, audience: number, mult: number, cast?: Cast): FilmResult {
  const participants = cast ? participantsOf(cast) : undefined
  return {
    productionId,
    releaseTick,
    delivered: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 },
    cohesion: 0.5,
    craft: 60,
    criticMean: critic,
    criticSigma: 4,
    criticScore: critic,
    reviewVariance: 0,
    segmentScores: { youngAdult: audience, family: audience, adult: audience, prestige: audience },
    boxOffice: { opening: (mult * EXPECTED) / 3, total: mult * EXPECTED },
    conceptId: `concept-${productionId}`,
    directorId: participants?.director.talentId ?? 'dir-1',
    ...(participants ? { participants } : {}),
    forecast: { expectedCriticScore: 60, expectedTotal: EXPECTED, expectedOpening: EXPECTED / 3 },
  }
}

export type LawSpec = { week?: number; root?: FranchiseRoot; released?: readonly FilmResult[]; locked?: readonly string[] }

/** The real world of `state` (its P16 rights, its own released films) plus hand-built later films, at `week`. */
export function lawWorld(state: GameState, spec: LawSpec = {}): ContinuationWorld {
  const base = continuationWorldOf(state)
  const released = new Map((spec.released ?? []).map((r) => [r.productionId, r]))
  return {
    ...base,
    week: spec.week ?? base.week,
    franchises: spec.root ?? emptyFranchiseRoot(),
    releasedFilm: (id) => {
      const r = released.get(id)
      return r ? { result: r, audience01: r.segmentScores.adult / 100 } : base.releasedFilm(id)
    },
    isLocked: (id) => (spec.locked ?? []).includes(id) || base.isLocked(id),
  }
}
