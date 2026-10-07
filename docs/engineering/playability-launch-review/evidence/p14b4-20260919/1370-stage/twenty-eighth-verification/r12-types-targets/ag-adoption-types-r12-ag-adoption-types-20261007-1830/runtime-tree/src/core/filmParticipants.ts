import { expectedPerformance, projectFit, roleOVR } from './talentSummary.js'
import type { Talent, FilmParticipant, FilmParticipants, Discipline, CastSlot, ShapeEffects, Promise as FilmPromise, Production } from './types.js'

// D-11.A — capture the film's immutable participant record at the LOCKED greenlight
// (perceived values). `freelancer` = engaged as a freelancer (not studio-contracted).
function buildParticipant(
  contracted: (talentId: string) => boolean,
  talent: Talent,
  role: FilmParticipant['role'],
  discipline: Discipline,
  slot: CastSlot | undefined,
  concept: FilmConceptLike,
  shapeEffects: ShapeEffects,
  promise: FilmPromise,
  shape: Production['shape'],
): FilmParticipant {
  const ep = expectedPerformance(talent, discipline, concept, slot, shapeEffects, promise, shape)
  return {
    talentId: talent.id,
    name: talent.name,
    role,
    discipline,
    greenlightOVR: Math.round(roleOVR(talent, discipline)),
    greenlightFit: Math.round(projectFit(talent, discipline, concept, slot, shapeEffects, promise, shape)),
    greenlightEP: { low: ep.low, high: ep.high, expected: ep.expected },
    freelancer: !contracted(talent.id),
  }
}

// The FilmConcept shape the talentSummary helpers need (kept local to avoid a wide import).
type FilmConceptLike = Parameters<typeof projectFit>[2]

export function buildFilmParticipants(
  contracted: (talentId: string) => boolean,
  parts: {
    writer: Talent
    director: Talent
    cast: Record<CastSlot, Talent>
    craftHires: Talent[]
  },
  concept: FilmConceptLike,
  shapeEffects: ShapeEffects,
  promise: FilmPromise,
  shape: Production['shape'],
): FilmParticipants {
  const P = (t: Talent, role: FilmParticipant['role'], d: Discipline, slot: CastSlot | undefined) =>
    buildParticipant(contracted, t, role, d, slot, concept, shapeEffects, promise, shape)
  return {
    writer: P(parts.writer, 'writer', 'writing', undefined),
    director: P(parts.director, 'director', 'directing', undefined),
    cast: {
      lead: P(parts.cast.lead, 'lead', 'acting', 'lead'),
      antagonist: P(parts.cast.antagonist, 'antagonist', 'acting', 'antagonist'),
      support: P(parts.cast.support, 'support', 'acting', 'support'),
    },
    craft: parts.craftHires.map((c) => P(c, 'craft', 'craft', undefined)),
  }
}

