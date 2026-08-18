import { describe, expect, it } from 'vitest'
import {
  acknowledgeCastingSession,
  allocateCastingReservation,
  assertCastingSessionsInvariants,
  assertCastingSlateLaw,
  auditionObservation,
  canonicalCastingSessionId,
  castingDevelopmentCastingOccupancy,
  castingOccupiedFacilitySlots,
  completeDueCastingSessions,
  emptyCastingSessions,
  initialManagedCastingSessions,
  nextCastingSessionNeedingReview,
  startCastingSession,
} from '../src/core/castingSessions.js'
import {
  emptyWorkflowBindings, initialManagedStudioOperations } from '../src/core/operations.js'
import { roleFit } from '../src/core/reception.js'
import { resolveShape } from '../src/core/shape.js'
import { castSlotExecution, effectiveSkill } from '../src/core/talentSummary.js'
import { generateWorld } from '../src/core/worldgen.js'
import type {
  CastingSlate,
  FilmConcept,
  ScriptDevelopment,
  ScriptProject,
  StudioOperations,
  Talent,
} from '../src/core/types.js'

const SHAPE = {
  opening: 'slowSetup',
  midpoint: 'revelation',
  ending: 'bittersweet',
} as const

function fixture(seed = 'casting-domain'): {
  seed: string
  concept: FilmConcept
  actors: Talent[]
  writer: Talent
  project: ScriptProject
  scripts: ScriptDevelopment
  operations: StudioOperations
  slate: CastingSlate
} {
  const world = generateWorld(seed)
  const concept = world.concepts[0]!
  const actors = world.talent.filter((person) => person.role === 'actor')
  const writer = world.talent.find((person) => person.role === 'writer')!
  const project: ScriptProject = {
    id: 'script-0000',
    conceptId: concept.id,
    writerId: writer.id,
    writerIds: [writer.id],
    shape: { ...SHAPE },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [0, 0.8],
        kineticEnergy: [-0.7, 0.2],
      },
    },
    status: 'ready',
    rewriteCount: 0,
    commissionedWeek: 0,
    dueWeek: null,
    assessment: { actualStrength: 60, perceivedStrength: 61 },
    reservation: null,
    productionId: null,
  }
  const slate: CastingSlate = {
    lead: [actors[0]!.id, actors[1]!.id],
    antagonist: [actors[0]!.id, actors[2]!.id],
    support: [actors[1]!.id, actors[2]!.id],
  }
  return {
    seed,
    concept,
    actors,
    writer,
    project,
    scripts: { mode: 'managed', projects: [project] },
    operations: initialManagedStudioOperations(),
    slate,
  }
}

function startFixture(seed = 'casting-domain', currentWeek = 7) {
  const f = fixture(seed)
  const assignableTalentIds = new Set(f.actors.map((person) => person.id))
  const casting = startCastingSession(
    initialManagedCastingSessions(),
    f.operations,
    f.scripts,
    { projectId: f.project.id, slate: f.slate },
    currentWeek,
    { talent: [...f.actors, f.writer], assignableTalentIds, busyTalentIds: new Set() },
  )
  return { ...f, casting, currentWeek }
}

describe('Casting Sessions V1 domain', () => {
  it('seeds explicit modes and canonical append-only IDs', () => {
    expect(emptyCastingSessions()).toEqual({ mode: 'legacy', sessions: [] })
    expect(initialManagedCastingSessions()).toEqual({ mode: 'managed', sessions: [] })
    expect(canonicalCastingSessionId(0)).toBe('casting-0000')
    expect(canonicalCastingSessionId(27)).toBe('casting-0027')
    expect(() => canonicalCastingSessionId(-1)).toThrow(/non-negative integer/)
  })

  it('enforces exact pairs and the three-person Hall matching guard', () => {
    const { slate, actors } = fixture()
    expect(() => assertCastingSlateLaw(slate)).not.toThrow()
    expect(() =>
      assertCastingSlateLaw({
        ...slate,
        lead: [actors[0]!.id, actors[0]!.id],
      }),
    ).toThrow(/lead candidates must be distinct/)
    expect(() =>
      assertCastingSlateLaw({
        lead: [actors[0]!.id, actors[1]!.id],
        antagonist: [actors[0]!.id, actors[1]!.id],
        support: [actors[0]!.id, actors[1]!.id],
      }),
    ).toThrow(/at least 3 distinct people/)
  })

  it('starts one immutable one-week/no-hold session in the first shared free slot', () => {
    const f = fixture()
    const scripts: ScriptDevelopment = {
      ...f.scripts,
      projects: [
        f.project,
        {
          ...f.project,
          id: 'script-0001',
          conceptId: f.concept.id + '-capacity-only',
          status: 'drafting',
          assessment: null,
          dueWeek: 8,
          reservation: {
            projectId: 'script-0001',
            facilityId: 'facility-development-casting',
            capability: 'development-casting',
            slot: 0,
          },
        },
      ],
    }
    const before = JSON.stringify({ scripts, slate: f.slate })
    const casting = startCastingSession(
      initialManagedCastingSessions(),
      f.operations,
      scripts,
      { projectId: f.project.id, slate: f.slate },
      7,
      {
        talent: [...f.actors, f.writer],
        assignableTalentIds: new Set(f.actors.map((person) => person.id)),
        busyTalentIds: new Set(),
      },
    )
    expect(JSON.stringify({ scripts, slate: f.slate })).toBe(before)
    expect(casting.sessions[0]).toMatchObject({
      id: 'casting-0000',
      projectId: 'script-0000',
      status: 'auditioning',
      startedWeek: 7,
      dueWeek: 8,
      results: null,
      reservation: {
        sessionId: 'casting-0000',
        facilityId: 'facility-development-casting',
        slot: 1,
      },
    })
    expect(casting.sessions[0]!.slate).not.toBe(f.slate)
    expect(castingOccupiedFacilitySlots(casting)).toEqual(
      new Set(['facility-development-casting:1']),
    )
    expect(castingDevelopmentCastingOccupancy(f.operations, casting)).toEqual([
      {
        facilityId: 'facility-development-casting',
        facilityName: 'Development & Casting',
        slot: 1,
        owner: 'casting',
        ownerId: 'casting-0000',
        activity: 'auditioning',
      },
    ])
  })

  it('checks primary-role, market/contract, ordinary busy, and writer eligibility atomically', () => {
    const f = fixture()
    const sources = {
      talent: [...f.actors, f.writer],
      assignableTalentIds: new Set(f.actors.map((person) => person.id)),
      busyTalentIds: new Set<string>(),
    }
    expect(() =>
      startCastingSession(
        initialManagedCastingSessions(),
        f.operations,
        f.scripts,
        { projectId: f.project.id, slate: { ...f.slate, lead: [f.writer.id, f.actors[1]!.id] } },
        7,
        { ...sources, assignableTalentIds: new Set([...sources.assignableTalentIds, f.writer.id]) },
      ),
    ).toThrow(/not a primary Actor/)

    expect(() =>
      startCastingSession(
        initialManagedCastingSessions(),
        f.operations,
        f.scripts,
        { projectId: f.project.id, slate: f.slate },
        7,
        { ...sources, busyTalentIds: new Set([f.actors[0]!.id]) },
      ),
    ).toThrow(/currently busy/)

    const missingMarket = new Set(sources.assignableTalentIds)
    missingMarket.delete(f.actors[0]!.id)
    expect(() =>
      startCastingSession(
        initialManagedCastingSessions(),
        f.operations,
        f.scripts,
        { projectId: f.project.id, slate: f.slate },
        7,
        { ...sources, assignableTalentIds: missingMarket },
      ),
    ).toThrow(/neither studio-contracted nor in the current freelancer market/)

    const actorWriter: ScriptDevelopment = {
      ...f.scripts,
      projects: [{ ...f.project, writerId: f.actors[0]!.id }],
    }
    expect(() =>
      startCastingSession(
        initialManagedCastingSessions(),
        f.operations,
        actorWriter,
        { projectId: f.project.id, slate: f.slate },
        7,
        sources,
      ),
    ).toThrow(/locked writer/)
  })

  it('uses the exact shared cast-slot formula without moving legacy forecast/reception math', () => {
    const { actors, concept, project } = fixture()
    const actor = actors[0]!
    const shapeEffects = resolveShape(project.shape)
    const eff = effectiveSkill(
      actor,
      'acting',
      concept,
      'lead',
      shapeEffects,
      project.promise,
      'actual',
      project.shape,
    )
    const expected = 0.6 * eff + 0.4 * 100 * roleFit(actor, concept.roleRequirements.lead)
    expect(
      castSlotExecution(
        actor,
        concept,
        'lead',
        shapeEffects,
        project.promise,
        'actual',
        project.shape,
      ),
    ).toBe(expected)
  })

  it('completes from isolated keyed streams, persists exact bands, and acknowledges without RNG', () => {
    const f = startFixture('casting-observation')
    const before = JSON.stringify(f.casting)
    expect(
      completeDueCastingSessions(f.casting, f.currentWeek, {
        seed: f.seed,
        concepts: [f.concept],
        talent: [...f.actors, f.writer],
        scriptDevelopment: f.scripts,
      }),
    ).toBe(f.casting)
    expect(JSON.stringify(f.casting)).toBe(before)

    const completed = completeDueCastingSessions(f.casting, f.currentWeek + 1, {
      seed: f.seed,
      concepts: [f.concept],
      talent: [...f.actors, f.writer],
      scriptDevelopment: f.scripts,
    })
    const session = completed.sessions[0]!
    expect(session).toMatchObject({ status: 'review', dueWeek: null, reservation: null })
    expect(session.results!.lead[0]).toEqual(
      auditionObservation(f.seed, session.id, f.actors[0]!, 'lead', f.concept, f.project),
    )
    for (const pair of Object.values(session.results!)) {
      for (const result of pair) {
        expect(Number.isInteger(result.estimate)).toBe(true)
        expect(result.low).toBe(Math.max(0, result.estimate - 6))
        expect(result.high).toBe(Math.min(100, result.estimate + 6))
      }
    }
    expect(nextCastingSessionNeedingReview(completed)?.id).toBe(session.id)

    const acknowledged = acknowledgeCastingSession(completed, session.id)
    expect(acknowledged.sessions[0]).toMatchObject({
      status: 'complete',
      results: session.results,
    })
    expect(nextCastingSessionNeedingReview(acknowledged)).toBeUndefined()
  })

  it('rejects exhausted capacity, repeat sessions, and three-owner collisions', () => {
    const f = fixture()
    const operations: StudioOperations = {
      ...f.operations,
      workflows: [
        {
          productionId: 'production-capacity',
          phase: 'development',
          reservations: [
            {
              productionId: 'production-capacity',
              facilityId: 'facility-development-casting',
              capability: 'development-casting',
              slot: 0,
              phase: 'development',
            },
          ],
          shootingTask: null,
          blocker: null,
          bindings: emptyWorkflowBindings(),
        },
      ],
    }
    const scripts: ScriptDevelopment = {
      ...f.scripts,
      projects: [
        {
          ...f.project,
          reservation: {
            projectId: f.project.id,
            facilityId: 'facility-development-casting',
            capability: 'development-casting',
            slot: 1,
          },
        },
      ],
    }
    expect(
      allocateCastingReservation(
        initialManagedCastingSessions(),
        operations,
        scripts,
        'casting-0000',
      ),
    ).toBeNull()

    const started = startFixture()
    expect(() =>
      startCastingSession(
        started.casting,
        started.operations,
        started.scripts,
        { projectId: started.project.id, slate: started.slate },
        started.currentWeek,
        {
          talent: [...started.actors, started.writer],
          assignableTalentIds: new Set(started.actors.map((person) => person.id)),
          busyTalentIds: new Set(),
        },
      ),
    ).toThrow(/already owns a casting session/)

    const collidedScripts: ScriptDevelopment = {
      ...started.scripts,
      projects: [
        started.project,
        {
          ...started.project,
          id: 'script-0001',
          status: 'drafting',
          assessment: null,
          dueWeek: started.currentWeek + 1,
          reservation: {
            projectId: started.project.id,
            facilityId: started.casting.sessions[0]!.reservation!.facilityId,
            capability: 'development-casting',
            slot: started.casting.sessions[0]!.reservation!.slot,
          },
        },
      ],
    }
    expect(() =>
      assertCastingSessionsInvariants(started.casting, {
        currentWeek: started.currentWeek,
        operations: started.operations,
        scriptDevelopment: collidedScripts,
        talent: [...started.actors, started.writer],
      }),
    ).toThrow(/overbooked across productions\/scripts\/casting/)
  })

  it('accepts complete historical evidence after the screenplay leaves Ready', () => {
    const f = startFixture('casting-history')
    const reviewed = completeDueCastingSessions(f.casting, f.currentWeek + 1, {
      seed: f.seed,
      concepts: [f.concept],
      talent: [...f.actors, f.writer],
      scriptDevelopment: f.scripts,
    })
    const complete = acknowledgeCastingSession(reviewed, reviewed.sessions[0]!.id)
    const producedScripts: ScriptDevelopment = {
      ...f.scripts,
      projects: [
        {
          ...f.project,
          status: 'produced',
          productionId: 'production-history',
        },
      ],
    }
    expect(() =>
      assertCastingSessionsInvariants(complete, {
        currentWeek: f.currentWeek + 1,
        operations: f.operations,
        scriptDevelopment: producedScripts,
        talent: [...f.actors, f.writer],
      }),
    ).not.toThrow()
  })
})
