import { describe, expect, it } from 'vitest'
import {
  acceptScriptProject,
  activeScriptWriterAssignments,
  allocateScriptReservation,
  assertScriptDevelopmentInvariants,
  assessFirstDraft,
  availableDevelopmentCastingSlots,
  canonicalScriptProjectId,
  commissionScriptProject,
  completeDueScriptWork,
  developmentCastingOccupancy,
  emptyScriptDevelopment,
  initialManagedScriptDevelopment,
  linkScriptProjectToProduction,
  markScriptProjectProduced,
  nextScriptProjectNeedingReview,
  requestScriptRewrite,
  returnScriptProjectToReady,
  rewriteAssessment,
  scriptOccupiedFacilitySlots,
  scriptRewriteDelta,
  scriptWriterAssignment,
} from '../src/core/scriptDevelopment.js'
import {
  emptyWorkflowBindings, initialManagedStudioOperations } from '../src/core/operations.js'
import { generateWorld } from '../src/core/worldgen.js'
import type {
  CommissionScriptPayload,
  Contract,
  FilmConcept,
  FilmResult,
  Production,
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

function payload(concept: FilmConcept, writer: Talent): CommissionScriptPayload {
  return {
    conceptId: concept.id,
    writerId: writer.id,
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
  }
}

function writers(seed: string): { concepts: FilmConcept[]; writers: Talent[] } {
  const world = generateWorld(seed)
  return {
    concepts: world.concepts,
    writers: world.talent.filter((talent) => talent.role === 'writer'),
  }
}

function contract(talentId: string, endWeekExclusive = 104): Contract {
  return {
    talentId,
    annualSalary: 1_000_000,
    signingBonus: 0,
    startWeek: 0,
    endWeekExclusive,
    termWeeks: endWeekExclusive,
  }
}

function participant(
  talentId: string,
  role: NonNullable<Production['participants']>['writer']['role'],
  discipline: NonNullable<Production['participants']>['writer']['discipline'],
): NonNullable<Production['participants']>['writer'] {
  return {
    talentId,
    name: talentId,
    role,
    discipline,
    greenlightOVR: 50,
    greenlightFit: 50,
    greenlightEP: { low: 40, high: 60, expected: 50 },
    freelancer: false,
  }
}

function productionFor(project: ScriptProject, id = 'production-script-test'): Production {
  return {
    id,
    conceptId: project.conceptId,
    shape: { ...project.shape },
    promise: {
      ...project.promise,
      intendedSegments: [...project.promise.intendedSegments],
      ranges: {
        intimacy: [...project.promise.ranges.intimacy],
        tonalWeight: [...project.promise.ranges.tonalWeight],
        kineticEnergy: [...project.promise.ranges.kineticEnergy],
      },
    },
    writerId: project.writerId,
    directorId: 'director-test',
    craftIds: ['craft-test'],
    cast: { lead: 'lead-test', antagonist: 'antagonist-test', support: 'support-test' },
    budget: { negative: 1_000_000, marketing: 500_000 },
    startTick: 2,
    remainingTicks: 8,
    forecastSnapshot: {
      segments: [],
      expectedOpening: 1,
      expectedTotal: 2,
      expectedCriticScore: 50,
    },
    participants: {
      writer: participant(project.writerId, 'writer', 'writing'),
      director: participant('director-test', 'director', 'directing'),
      cast: {
        lead: participant('lead-test', 'lead', 'acting'),
        antagonist: participant('antagonist-test', 'antagonist', 'acting'),
        support: participant('support-test', 'support', 'acting'),
      },
      craft: [participant('craft-test', 'craft', 'craft')],
    },
  }
}

function releasedFilmFor(production: Production): FilmResult {
  return {
    productionId: production.id,
    releaseTick: 10,
    delivered: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 },
    cohesion: 50,
    craft: 50,
    criticMean: 50,
    criticSigma: 5,
    criticScore: 50,
    reviewVariance: 0,
    segmentScores: { youngAdult: 50, family: 50, adult: 50, prestige: 50 },
    boxOffice: { opening: 1, total: 2 },
    conceptId: production.conceptId,
    directorId: production.directorId,
    participants: production.participants!,
  }
}

function withProductionReservation(slot: number): StudioOperations {
  const operations = initialManagedStudioOperations()
  return {
    ...operations,
    workflows: [{
      productionId: 'production-existing',
      phase: 'development',
      reservations: [{
        productionId: 'production-existing',
        facilityId: 'facility-development-casting',
        capability: 'development-casting',
        slot,
        phase: 'development',
      }],
      shootingTask: null,
      blocker: null,
      bindings: emptyWorkflowBindings(),
    }],
  }
}

describe('Script Projects V1 foundational core', () => {
  it('seeds explicit legacy/managed states and allocates canonical append-only ids', () => {
    expect(emptyScriptDevelopment()).toEqual({ mode: 'legacy', projects: [] })
    const firstManaged = initialManagedScriptDevelopment()
    const secondManaged = initialManagedScriptDevelopment()
    expect(firstManaged).toEqual({ mode: 'managed', projects: [] })
    expect(firstManaged).not.toBe(secondManaged)
    expect(firstManaged.projects).not.toBe(secondManaged.projects)
    expect(canonicalScriptProjectId(0)).toBe('script-0000')
    expect(canonicalScriptProjectId(12)).toBe('script-0012')
    expect(() => canonicalScriptProjectId(-1)).toThrow(/non-negative integer/)

    const { concepts, writers: roster } = writers('scripts-ids')
    const operations = initialManagedStudioOperations()
    const firstPayload = payload(concepts[0]!, roster[0]!)
    let development = commissionScriptProject(firstManaged, operations, firstPayload, 7)
    development = commissionScriptProject(development, operations, payload(concepts[1]!, roster[1]!), 7)
    expect(development.projects.map((project) => project.id)).toEqual(['script-0000', 'script-0001'])
    expect(development.projects.map((project) => project.reservation?.slot)).toEqual([0, 1])
    expect(development.projects.map((project) => project.dueWeek)).toEqual([8, 8])

    // Locked screenplay facts are cloned, not aliases back into a mutable UI draft.
    firstPayload.shape.opening = 'immediateAction'
    firstPayload.promise.intendedSegments.push('family')
    firstPayload.promise.ranges.intimacy[0] = -1
    expect(development.projects[0]!.shape.opening).toBe('slowSetup')
    expect(development.projects[0]!.promise.intendedSegments).toEqual(['adult', 'prestige'])
    expect(development.projects[0]!.promise.ranges.intimacy).toEqual([-0.4, 0.6])

    const beforeRejected = JSON.stringify(development)
    expect(() =>
      commissionScriptProject(development, operations, payload(concepts[2]!, roster[2]!), 7),
    ).toThrow(/no Development & Casting slot/)
    expect(JSON.stringify(development)).toBe(beforeRejected)
    expect(() =>
      commissionScriptProject(development, operations, payload(concepts[0]!, roster[2]!), 7),
    ).toThrow(/already owns a screenplay project/)
  })

  // RE-BASED at C2a-M3 by owner ruling `00E`.9. THE PREDECESSOR asserted the
  // shipped blend `0.6·baselineStrength + 0.4·writerSkill`, and that the two
  // halves of a writer's perceived/actual split pulled the two strengths apart.
  // THE SUCCESSOR is this test: the writer term is gone with no compensating
  // bonus, the premise is the script, the office is the only lever — and a first
  // draft's estimate therefore equals its truth, which is the ruling's own
  // arithmetic and is recorded as such in docs/c2-planning/17-m3-records.md.
  it('assesses a first draft from the premise and the office alone — never the writer (00E.9)', () => {
    const { concepts, writers: roster } = writers('scripts-assessment')
    const concept = concepts[0]!
    const gifted = structuredClone(roster[0]!)
    for (const pair of Object.values(gifted.skills.writing)) {
      pair.actual = 92
      pair.perceived = 12
    }
    gifted.genreExperience.writing[concept.genre] = { actual: 100, perceived: 0 }
    const journeyman = structuredClone(roster[0]!)
    for (const pair of Object.values(journeyman.skills.writing)) {
      pair.actual = 8
      pair.perceived = 8
    }
    journeyman.genreExperience.writing[concept.genre] = { actual: 0, perceived: 0 }
    const giftedBefore = JSON.stringify(gifted)

    const assessment = assessFirstDraft(concept)
    expect(assessment.actualStrength).toBeCloseTo(concept.baselineStrength)
    expect(assessment.perceivedStrength).toBeCloseTo(concept.baselineStrength)
    // The EST equals the truth at first draft: the writer was the only source of
    // divergence and the ruling removed it. A rewrite still diverges them.
    expect(assessment.actualStrength).toBe(assessment.perceivedStrength)
    // WHO wrote it cannot be read off the result, because it is not in it.
    expect(assessFirstDraft(concept)).toEqual(assessment)
    // The office is the one lever left, and it moves both numbers together.
    const lifted = assessFirstDraft(concept, 9)
    expect(lifted.actualStrength).toBeCloseTo(Math.min(100, concept.baselineStrength + 9))
    expect(lifted.perceivedStrength).toBe(lifted.actualStrength)
    // Two writers who could not be more different produce the same screenplay,
    // which is the whole ruling in one assertion.
    expect(assessFirstDraft(concept)).toEqual(assessment)
    expect(JSON.stringify(gifted)).toBe(giftedBefore)
    expect(journeyman.skills.writing).not.toEqual(gifted.skills.writing)
  })

  it('resolves exactly one week later, releases capacity, and exposes review first', () => {
    const { concepts, writers: roster } = writers('scripts-draft-week')
    const operations = initialManagedStudioOperations()
    const initial = commissionScriptProject(
      initialManagedScriptDevelopment(),
      operations,
      payload(concepts[0]!, roster[0]!),
      3,
    )
    expect(completeDueScriptWork(initial, 3, { concepts, talent: roster })).toBe(initial)
    const reviewed = completeDueScriptWork(initial, 4, { concepts, talent: roster })
    const project = reviewed.projects[0]!
    expect(project.status).toBe('review')
    expect(project.assessment).toEqual(assessFirstDraft(concepts[0]!))
    expect(project.dueWeek).toBeNull()
    expect(project.reservation).toBeNull()
    expect(nextScriptProjectNeedingReview(reviewed)?.id).toBe(project.id)
    expect(availableDevelopmentCastingSlots(operations, reviewed, new Set())).toBe(2)
    expect(initial.projects[0]!.status).toBe('drafting')
  })

  it('prevents one writer from holding concurrent screenplay tasks', () => {
    const { concepts, writers: roster } = writers('scripts-writer-exclusivity')
    const operations = initialManagedStudioOperations()
    let development = commissionScriptProject(
      initialManagedScriptDevelopment(),
      operations,
      payload(concepts[0]!, roster[0]!),
      0,
    )
    expect(() =>
      commissionScriptProject(development, operations, payload(concepts[1]!, roster[0]!), 0),
    ).toThrow(/already has an active screenplay task/)

    development = completeDueScriptWork(development, 1, { concepts, talent: roster })
    development = commissionScriptProject(
      development,
      operations,
      payload(concepts[1]!, roster[0]!),
      1,
    )
    const beforeRejected = JSON.stringify(development)
    expect(() => requestScriptRewrite(development, operations, 'script-0000', 1)).toThrow(
      /already has an active screenplay task/,
    )
    expect(JSON.stringify(development)).toBe(beforeRejected)
  })

  it('allows one bounded rewrite that may worsen actual strength, then Accept only', () => {
    const { concepts, writers: roster } = writers('scripts-rewrite')
    const writer = structuredClone(roster[0]!)
    writer.skills.writing.rewriting = { actual: 1, perceived: 99 }
    const operations = initialManagedStudioOperations()
    let development = commissionScriptProject(
      initialManagedScriptDevelopment(),
      operations,
      payload(concepts[0]!, writer),
      0,
    )
    development = completeDueScriptWork(development, 1, { concepts, talent: [writer] })
    const beforeRewrite = development.projects[0]!.assessment!

    development = requestScriptRewrite(development, operations, 'script-0000', 1)
    expect(development.projects[0]).toMatchObject({
      status: 'rewriting',
      rewriteCount: 1,
      dueWeek: 2,
    })
    const assignment = scriptWriterAssignment(development, concepts, writer.id)
    expect(assignment?.label).toBe(`Rewriting ${concepts[0]!.title}`)

    development = completeDueScriptWork(development, 2, { concepts, talent: [writer] })
    const rewritten = development.projects[0]!.assessment!
    expect(rewritten).toEqual(rewriteAssessment(beforeRewrite, writer))
    expect(rewritten.actualStrength).toBeLessThan(beforeRewrite.actualStrength)
    expect(rewritten.perceivedStrength).toBeGreaterThan(beforeRewrite.perceivedStrength)
    expect(rewritten.actualStrength - beforeRewrite.actualStrength).toBeGreaterThanOrEqual(-3)
    expect(rewritten.perceivedStrength - beforeRewrite.perceivedStrength).toBeLessThanOrEqual(8)
    expect(scriptRewriteDelta(0, 1)).toBe(-3)
    expect(scriptRewriteDelta(0, 99)).toBe(8)
    expect(scriptRewriteDelta(100, 1)).toBe(0)
    expect(() => requestScriptRewrite(development, operations, 'script-0000', 2)).toThrow(
      /not at its first review/,
    )

    const ready = acceptScriptProject(development, 'script-0000')
    expect(ready.projects[0]).toMatchObject({ status: 'ready', rewriteCount: 1 })
    expect(ready.projects).toHaveLength(1)
    expect(() => acceptScriptProject(ready, 'script-0000')).toThrow(/does not need review/)
  })

  it('shares Development & Casting slots with production workflows in both read and allocation paths', () => {
    const { concepts, writers: roster } = writers('scripts-shared-capacity')
    const operations = withProductionReservation(0)
    let development = commissionScriptProject(
      initialManagedScriptDevelopment(),
      operations,
      payload(concepts[0]!, roster[0]!),
      0,
    )
    expect(development.projects[0]!.reservation?.slot).toBe(1)
    expect(allocateScriptReservation(operations, development, 'script-0001')).toBeNull()
    expect([...scriptOccupiedFacilitySlots(development)]).toEqual([
      'facility-development-casting:1',
    ])
    expect(developmentCastingOccupancy(operations, development)).toEqual([
      {
        facilityId: 'facility-development-casting',
        facilityName: 'Development & Casting',
        slot: 0,
        owner: 'production',
        ownerId: 'production-existing',
        activity: 'production-development',
      },
      {
        facilityId: 'facility-development-casting',
        facilityName: 'Development & Casting',
        slot: 1,
        owner: 'script',
        ownerId: 'script-0000',
        activity: 'drafting',
      },
    ])
    expect(availableDevelopmentCastingSlots(operations, development, new Set())).toBe(0)

    development = completeDueScriptWork(development, 1, { concepts, talent: roster })
    expect(allocateScriptReservation(operations, development, 'script-0001')?.slot).toBe(1)
  })

  it('keeps production linkage as screenplay history across cancel and release', () => {
    const { concepts, writers: roster } = writers('scripts-production-link')
    const operations = initialManagedStudioOperations()
    let development = commissionScriptProject(
      initialManagedScriptDevelopment(),
      operations,
      payload(concepts[0]!, roster[0]!),
      0,
    )
    development = completeDueScriptWork(development, 1, { concepts, talent: roster })
    development = acceptScriptProject(development, 'script-0000')
    development = linkScriptProjectToProduction(development, 'script-0000', 'production-a')
    expect(development.projects[0]).toMatchObject({
      status: 'inProduction',
      productionId: 'production-a',
    })
    development = returnScriptProjectToReady(development, 'production-a')
    expect(development.projects[0]).toMatchObject({ status: 'ready', productionId: null })
    development = linkScriptProjectToProduction(development, 'script-0000', 'production-b')
    development = markScriptProjectProduced(development, 'production-b')
    expect(development.projects[0]).toMatchObject({
      status: 'produced',
      productionId: 'production-b',
    })
    expect(development.projects).toHaveLength(1)
    expect(() => returnScriptProjectToReady(development, 'production-b')).toThrow(
      /without an In Production screenplay/,
    )
  })

  it('returns readable active-writer reasons and never calls review/ready writers busy', () => {
    const { concepts, writers: roster } = writers('scripts-assignments')
    const operations = initialManagedStudioOperations()
    let development = commissionScriptProject(
      initialManagedScriptDevelopment(),
      operations,
      payload(concepts[0]!, roster[0]!),
      0,
    )
    expect(activeScriptWriterAssignments(development, concepts)).toEqual([{
      talentId: roster[0]!.id,
      projectId: 'script-0000',
      status: 'drafting',
      title: concepts[0]!.title,
      label: `Drafting ${concepts[0]!.title}`,
    }])
    development = completeDueScriptWork(development, 1, { concepts, talent: roster })
    expect(activeScriptWriterAssignments(development, concepts)).toEqual([])
    development = acceptScriptProject(development, 'script-0000')
    expect(scriptWriterAssignment(development, concepts, roster[0]!.id)).toBeUndefined()
  })

  it('enforces canonical lifecycle, contract, collision, and exact production correlations', () => {
    const { concepts, writers: roster } = writers('scripts-invariants')
    const operations = initialManagedStudioOperations()
    let development = commissionScriptProject(
      initialManagedScriptDevelopment(),
      operations,
      payload(concepts[0]!, roster[0]!),
      0,
    )
    const baseContext = {
      currentWeek: 0,
      concepts,
      talent: roster,
      contracts: [contract(roster[0]!.id)],
      operations,
      activeProductions: [] as Production[],
      releasedFilms: [] as FilmResult[],
    }
    expect(() => assertScriptDevelopmentInvariants(development, baseContext)).not.toThrow()
    expect(() =>
      assertScriptDevelopmentInvariants(development, { ...baseContext, contracts: [] }),
    ).toThrow(/writer is not contracted/)

    const badId = structuredClone(development)
    badId.projects[0]!.id = 'script-0001'
    expect(() => assertScriptDevelopmentInvariants(badId, baseContext)).toThrow(
      /must be script-0000/,
    )
    expect(() =>
      assertScriptDevelopmentInvariants(development, {
        ...baseContext,
        operations: withProductionReservation(0),
      }),
    ).toThrow(/overbooked across scripts\/productions/)

    development = completeDueScriptWork(development, 1, { concepts, talent: roster })
    development = acceptScriptProject(development, 'script-0000')
    const production = productionFor(development.projects[0]!)
    development = linkScriptProjectToProduction(development, 'script-0000', production.id)
    const linkedContext = {
      ...baseContext,
      currentWeek: 2,
      activeProductions: [production],
    }
    expect(() => assertScriptDevelopmentInvariants(development, linkedContext)).not.toThrow()
    expect(() =>
      assertScriptDevelopmentInvariants(development, {
        ...linkedContext,
        activeProductions: [{ ...production, writerId: 'somebody-else' }],
      }),
    ).toThrow(/writer differs from production/)

    development = markScriptProjectProduced(development, production.id)
    expect(() =>
      assertScriptDevelopmentInvariants(development, {
        ...linkedContext,
        activeProductions: [],
        releasedFilms: [releasedFilmFor(production)],
      }),
    ).not.toThrow()
  })

  it('keeps legacy mode empty and rejects every managed lifecycle command there', () => {
    const legacy = emptyScriptDevelopment()
    const { concepts, writers: roster } = writers('scripts-legacy')
    expect(() =>
      commissionScriptProject(legacy, initialManagedStudioOperations(), payload(concepts[0]!, roster[0]!), 0),
    ).toThrow(/not managed/)
    expect(() => acceptScriptProject(legacy, 'script-0000')).toThrow(/not managed/)
    const malformed: ScriptDevelopment = { mode: 'legacy', projects: [{} as ScriptProject] }
    expect(() =>
      assertScriptDevelopmentInvariants(malformed, {
        currentWeek: 0,
        concepts,
        talent: roster,
        contracts: [],
        operations: initialManagedStudioOperations(),
        activeProductions: [],
        releasedFilms: [],
      }),
    ).toThrow(/legacy mode must have no projects/)
  })
})
