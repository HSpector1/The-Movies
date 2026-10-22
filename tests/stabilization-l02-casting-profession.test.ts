// Stabilization 2026-10-22, audit finding L-02 (PEOPLE-01).
//
// `assertCastingSessionsInvariants` required every candidate of EVERY session, whatever its
// status, to be a primary Actor today. 880-B profession transitions rewrite `role` in place
// (director or writer), so one auditioned actor who later changed profession made every later
// tick, action and `makeSave` throw `candidate … is not a primary Actor` with no verb to undo it.
// The slate of a session that has run (review, complete) is history; only a session still
// auditioning requires the current role. The greenlight package law still refuses to seat a
// non-actor, so nothing here lets a director take a cast seat.
//
// World: the measured casting route of tests/bridge-p14b9-casting-readers.test.ts (seed
// r1314-casting-01), stopped before any greenlight.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { assertCastingSessionsInvariants } from '../src/core/castingSessions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import type { CastingSlate, GameState } from '../src/core/types.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { fund } from './helpers/p14b2-fixtures.js'

const SEED = 'r1314-casting-01'
const SHAPE = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const
const RANGES = { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] }

function invariants(state: GameState, talent = state.talent, changed: readonly string[] = []): void {
  assertCastingSessionsInvariants(state.castingSessions, {
    currentWeek: state.market.tick, operations: state.operations, scriptDevelopment: state.scriptDevelopment, talent,
    // The live callers (actions.ts, construction.ts) answer this from `careerLifecycle.professionChanges`.
    professionChangedFromActor: (personId) => changed.includes(personId),
  })
}
/** The 880-B outcome on the person: `role` rewritten in place (professionTransitions.ts), nothing else. */
function becameDirector(state: GameState, personId: string): GameState['talent'] {
  return state.talent.map((person) => (person.id === personId ? { ...person, role: 'director' as const } : person))
}

describe('L-02: a candidate who changed profession after auditioning does not invalidate the session', () => {
  let auditioning: GameState, review: GameState, complete: GameState, candidate: string
  beforeAll(() => {
    let s = fund(p13aGeneratedStudio(SEED))
    const market = hiringMarketIds(s, 0)
    const byRole = (role: string) => market.filter((id) => s.talent.find((t) => t.id === id)?.role === role)
    const writer = byRole('writer')[0]!, actors = byRole('actor')
    expect(actors.length, 'route premise: four week-0 actors').toBeGreaterThanOrEqual(4)
    for (const id of [writer, ...actors.slice(0, 4)]) s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
    s = applyActions(s, [{ kind: 'activateScriptDevelopment' }, { kind: 'activateCastingSessions' }])
    const concept = s.concepts[0]!
    s = applyActions(s, [{ kind: 'commissionScript', project: {
      conceptId: concept.id, writerId: writer, shape: SHAPE, promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: RANGES },
    } }])
    const projectId = s.scriptDevelopment.projects.at(-1)!.id
    for (let n = 0; s.scriptDevelopment.projects.find((p) => p.id === projectId)!.status !== 'review'; n++) {
      if (n >= 30) throw new Error('route premise: the draft did not reach review within 30 ticks')
      s = tick(s)
    }
    s = applyActions(s, [{ kind: 'acceptScript', projectId }])
    const [a, b, c, d] = actors as [string, string, string, string]
    const slate: CastingSlate = { lead: [a, d], antagonist: [b, c], support: [c, a] }
    auditioning = applyActions(s, [{ kind: 'startCastingSession', session: { projectId, slate } }])
    candidate = d // seated nowhere; the slate names them twice-removed from any production seat
    const sessionId = auditioning.castingSessions.sessions.find((x) => x.projectId === projectId)!.id
    let r = auditioning
    for (let n = 0; r.castingSessions.sessions.find((x) => x.id === sessionId)!.status !== 'review'; n++) {
      if (n >= 30) throw new Error('route premise: the session did not reach review within 30 ticks')
      r = tick(r)
    }
    review = r
    complete = applyActions(review, [{ kind: 'acknowledgeCastingSession', sessionId }])
  }, 120_000)

  it('premise: the three session states admit as built, and the candidate is a primary Actor in each', () => {
    for (const state of [auditioning, review, complete]) {
      expect(() => invariants(state)).not.toThrow()
      expect(state.talent.find((t) => t.id === candidate)?.role).toBe('actor')
    }
    expect(auditioning.castingSessions.sessions[0]!.status).toBe('auditioning')
    expect(review.castingSessions.sessions[0]!.status).toBe('review')
    expect(complete.castingSessions.sessions[0]!.status).toBe('complete')
  })

  it('a session still auditioning requires the current role, even after a recorded change', () => {
    expect(() => invariants(auditioning, becameDirector(auditioning, candidate), [candidate]))
      .toThrow(/candidate "[^"]+" is not a primary Actor/)
  })

  it('a non-actor with NO recorded profession change is still refused in every status (a forged slate)', () => {
    for (const state of [auditioning, review, complete]) {
      expect(() => invariants(state, becameDirector(state, candidate))).toThrow(/candidate "[^"]+" is not a primary Actor/)
    }
  })

  it('a session in review or complete keeps its historical slate after a recorded profession change', () => {
    expect(() => invariants(review, becameDirector(review, candidate), [candidate])).not.toThrow()
    expect(() => invariants(complete, becameDirector(complete, candidate), [candidate])).not.toThrow()
  })
})
