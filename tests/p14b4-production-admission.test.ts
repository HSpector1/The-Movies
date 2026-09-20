// Parent-installed exact124 draft plus this provenance line; execution evidence is recorded separately.
// INERT independent draft for tests/p14b4-production-admission.test.ts.
// Authority: adopted118 +121; real-action bootstrap and remaining limits in124 brief.
// No execution claimed. Missing new module is a possible collection RED, not reached bodies.
import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  assertGreenlightCraftLead,
  assertGreenlightStaffingIdle,
  greenlightFreelancers,
  requireCommissionableWriter,
  requireGreenlightHeader,
  resolveGreenlightStaffing,
} from '../src/core/productionAdmission.js'
import type {
  CommissionWriterFacts,
  GreenlightHeaderFacts,
  GreenlightStaffingChoice,
} from '../src/core/productionAdmission.js'
import {
  activeContract,
  activeProductionCompanyTalentIds,
  activeWritingAssignmentIds,
  applyActions,
  beginFounding,
  busyTalentIds,
  freelancerFee,
  freelancerMarketIds,
  generateWorld,
  isContracted,
  tick,
} from '../src/core/index.js'
import type { GameState, ScriptProject, Talent } from '../src/core/index.js'
import {
  buildScenario,
  commissionPayload,
  contractedByRole,
  foundedStudio,
  greenlightA,
  projectById,
  remainingPackage,
  SEED,
  writingIds,
} from './_p04a2WriterCreditFixtures.js'
import { freeSlate } from './_m4Fixtures.js'

function present<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`fixture prerequisite missing: ${label}`)
  return value
}

function deepFreeze(value: unknown): void {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return
  for (const child of Object.values(value)) deepFreeze(child)
  Object.freeze(value)
}

function pure<T, R>(input: T, read: (input: T) => R): R {
  const before = structuredClone(input)
  deepFreeze(input)
  try {
    return read(input)
  } finally {
    // Set mutation is checked by equality too; Object.freeze alone cannot prevent it.
    expect(input).toEqual(before)
  }
}

function headerFacts(state: GameState): GreenlightHeaderFacts {
  return {
    foundingOpen: state.founding !== null,
    concepts: state.concepts,
    development: state.scriptDevelopment,
    casting: state.castingSessions,
  }
}

function screenplay(project: ScriptProject) {
  return {
    conceptId: project.conceptId,
    writerId: project.writerId,
    shape: project.shape,
    promise: project.promise,
  }
}

function choice(scenario: ReturnType<typeof buildScenario>): GreenlightStaffingChoice {
  return { writerId: scenario.writerId, ...scenario.packageA }
}

function expectedEngaged(p: GreenlightStaffingChoice): string[] {
  return [p.directorId, p.cast.lead, p.cast.antagonist, p.cast.support, ...p.craftIds]
}

function narrowBusy(state: GameState): Set<string> {
  return new Set([
    ...activeProductionCompanyTalentIds(state),
    ...activeWritingAssignmentIds(state),
  ])
}

function employmentFacts(state: GameState) {
  return {
    contractedIds: new Set(state.talent.filter(t => isContracted(state, t.id)).map(t => t.id)),
    freelancerIds: new Set(freelancerMarketIds(state)),
  }
}

describe('P14B4 shared admission — real credit versus engaged work', () => {
  it('keeps a genuinely busy credited writer out of engaged seats and labour', () => {
    const scenario = buildScenario(SEED)
    const state = scenario.deadlock
    const selected = choice(scenario)
    expect(projectById(state, scenario.projectAId).status).toBe('ready')
    expect(projectById(state, scenario.projectBId).status).toBe('drafting')
    expect(writingIds(state)).toContain(scenario.writerId)
    const resolved = pure({ people: state.talent, selected }, input =>
      resolveGreenlightStaffing(input.people, input.selected))
    expect(resolved.writer.id).toBe(scenario.writerId)
    expect(resolved.engagedIds).toEqual(expectedEngaged(selected))
    expect(resolved.engagedIds).not.toContain(scenario.writerId)
    pure({ ids: resolved.engagedIds, busy: narrowBusy(state) }, input =>
      assertGreenlightStaffingIdle(input.ids, input.busy))
    expect(greenlightFreelancers(resolved.engaged, employmentFacts(state))).toEqual([])
    const before = structuredClone(state)
    const next = applyActions(state, [greenlightA(scenario)])
    const production = present(next.studio.activeProductions.at(-1), 'actual greenlight')
    expect(next.studio.activeProductions.length).toBe(state.studio.activeProductions.length + 1)
    expect(production.writerId).toBe(scenario.writerId)
    expect(projectById(next, scenario.projectAId).productionId).toBe(production.id)
    expect(next.ledger.slice(state.ledger.length).filter(row => row.kind === 'freelancerFee')).toEqual([])
    expect(next.studio.cash).toBe(state.studio.cash - scenario.packageA.budget.negative - scenario.packageA.budget.marketing)
    expect(next.rngState).toEqual(state.rngState)
    expect(state).toEqual(before)
  })

  it('actually releases the idle credited writer; greenlight succeeds but new commission refuses', () => {
    const scenario = buildScenario(SEED)
    const beforeRelease = scenario.readyOnly
    expect(writingIds(beforeRelease)).not.toContain(scenario.writerId)
    expect(activeContract(beforeRelease, scenario.writerId)).toBeDefined()
    const released = applyActions(beforeRelease, [{ kind: 'releaseTalent', talentId: scenario.writerId }])
    expect(activeContract(released, scenario.writerId)).toBeUndefined()
    expect(released.ledger.slice(beforeRelease.ledger.length)).toEqual([
      expect.objectContaining({ kind: 'termination', talentId: scenario.writerId }),
    ])
    expect(projectById(released, scenario.projectAId)).toEqual(projectById(beforeRelease, scenario.projectAId))
    const resolved = resolveGreenlightStaffing(released.talent, choice(scenario))
    expect(greenlightFreelancers(resolved.engaged, employmentFacts(released))).toEqual([])
    const before = structuredClone(released)
    const next = applyActions(released, [greenlightA(scenario)])
    expect(next.studio.activeProductions.length).toBe(released.studio.activeProductions.length + 1)
    expect(next.studio.activeProductions.at(-1)?.writerId).toBe(scenario.writerId)
    expect(next.ledger.slice(released.ledger.length).filter(row => row.kind === 'freelancerFee')).toEqual([])
    expect(next.studio.cash).toBe(released.studio.cash - scenario.packageA.budget.negative - scenario.packageA.budget.marketing)
    expect(() => applyActions(released, [{
      kind: 'commissionScript', project: commissionPayload(scenario.conceptB, scenario.writerId),
    }])).toThrow(`writer "${scenario.writerId}" is not currently studio-contracted`)
    expect(released).toEqual(before)
  })

  it('still refuses a truly engaged director while writer credit remains excluded', () => {
    const scenario = buildScenario(SEED)
    const state = applyActions(scenario.readyOnly, [greenlightA(scenario)])
    const ids = expectedEngaged(choice(scenario))
    const busy = narrowBusy(state)
    expect(busy.has(scenario.writerId)).toBe(false)
    expect(ids.every(id => busy.has(id))).toBe(true)
    expect(() => pure({ ids, busy }, input => assertGreenlightStaffingIdle(input.ids, input.busy)))
      .toThrow(`greenlight talent "${scenario.packageA.directorId}" is already engaged`)
  })
})

describe('P14B4 shared admission — disciplines, orders and generic records', () => {
  it('preserves full and genuinely narrow caller fields without a primary-role gate', () => {
    const scenario = buildScenario(SEED)
    const selected = choice(scenario)
    // Swap the actual director and lead: each has the required secondary profile.
    const cross = { ...selected, directorId: selected.cast.lead, cast: { ...selected.cast, lead: selected.directorId } }
    const full = pure({ people: scenario.readyOnly.talent, cross }, input =>
      resolveGreenlightStaffing(input.people, input.cross))
    expectTypeOf(full.writer).toEqualTypeOf<Talent>()
    expectTypeOf(full.director.workHistory).toEqualTypeOf<Talent['workHistory']>()
    expectTypeOf(full.craftHires).toEqualTypeOf<readonly Talent[]>()
    expect(full.director.role).toBe('actor')
    expect(full.cast.lead.role).toBe('director')
    const people = scenario.readyOnly.talent.map(person => ({
      id: person.id, skills: person.skills, marker: { provenance: 'actual-person-view' as const, originalId: person.id },
    }))
    const narrow = pure({ people, cross }, input => resolveGreenlightStaffing(input.people, input.cross))
    expectTypeOf(narrow.writer.marker.provenance).toEqualTypeOf<'actual-person-view'>()
    expect(narrow.engagedIds).toEqual(expectedEngaged(cross))
    expect(narrow.engaged.map(person => person.marker.originalId)).toEqual(expectedEngaged(cross))
    expect(narrow.craftHires.map(person => person.marker.originalId)).toEqual([...cross.craftIds])
    expect(narrow.writer.marker.originalId).toBe(selected.writerId)
    expect(full.engaged.map(person => person.id)).toEqual(expectedEngaged(cross))
    // The real action boundary must accept the readonly helper result via its own copy.
    const state = scenario.readyOnly
    const next = applyActions(state, [{ kind: 'greenlightScriptProject', production: {
      projectId: scenario.projectAId, ...scenario.packageA, directorId: cross.directorId, cast: cross.cast,
    } }])
    expect(next.studio.activeProductions.at(-1)?.directorId).toBe(cross.directorId)
    expect(next.studio.activeProductions.at(-1)?.cast).toEqual(cross.cast)
  })

  it('also accepts genuine non-primary writing and craft profiles without changing their labels', () => {
    const scenario = buildScenario(SEED)
    const selected = choice(scenario)
    const cross = { ...selected, writerId: present(selected.craftIds[0], 'craft person'), craftIds: [selected.writerId] }
    const resolved = pure({ people: scenario.readyOnly.talent, cross }, input =>
      resolveGreenlightStaffing(input.people, input.cross))
    expect(resolved.writer.role).toBe('craft')
    expect(resolved.writer.skills.writing).toBeDefined()
    expect(present(resolved.craftHires[0], 'craft hire').role).toBe('writer')
    expect(present(resolved.craftHires[0], 'craft hire').skills.craft).toBeDefined()
    expect(resolved.engagedIds).toEqual(expectedEngaged(cross))
    // Staffing-only selection; it is NOT a command to rewrite the actual Ready credit.
  })

  it.each([
    ['writer', 'writing'], ['director', 'directing'], ['lead', 'acting'],
    ['antagonist', 'acting'], ['support', 'acting'], ['craft', 'craft'],
  ] as const)('defensively refuses missing %s profile in an explicitly INVALID pure input', (seat, discipline) => {
    const scenario = buildScenario(SEED)
    const selected = choice(scenario)
    const people = structuredClone(scenario.readyOnly.talent)
    const id = seat === 'writer' ? selected.writerId : seat === 'director' ? selected.directorId
      : seat === 'craft' ? present(selected.craftIds[0], 'craft') : selected.cast[seat]
    const person = present(people.find(person => person.id === id), 'selected person')
    expect(person.skills[discipline]).toBeDefined()
    expect(Reflect.deleteProperty(person.skills, discipline)).toBe(true)
    expect(() => pure({ people, selected }, input => resolveGreenlightStaffing(input.people, input.selected)))
      .toThrow(`talent "${id}" lacks a "${discipline}" skill profile`)
  })

  it('resolves writer, director, cast, THEN craft before checking collisions', () => {
    const scenario = buildScenario(SEED)
    const selected = choice(scenario)
    const people = scenario.readyOnly.talent
    const missing = { ...selected, writerId: 'missing-writer', directorId: 'missing-director',
      cast: { ...selected.cast, lead: 'missing-lead' }, craftIds: ['missing-craft'] }
    expect(() => resolveGreenlightStaffing(people, missing)).toThrow('greenlight writerId references unknown talent id "missing-writer"')
    expect(() => resolveGreenlightStaffing(people, { ...missing, writerId: selected.writerId }))
      .toThrow('greenlight directorId references unknown talent id "missing-director"')
    expect(() => resolveGreenlightStaffing(people, { ...missing, writerId: selected.writerId, directorId: selected.directorId }))
      .toThrow('greenlight cast.lead references unknown talent id "missing-lead"')
    expect(() => resolveGreenlightStaffing(people, { ...selected, craftIds: ['missing-craft'] }))
      .toThrow('greenlight craftIds[0] references unknown talent id "missing-craft"')
    // Explicit malformed pure people: profile checks use the same resolution order.
    const missingProfiles = structuredClone(people)
    const lead = present(missingProfiles.find(person => person.id === selected.cast.lead), 'lead')
    const craft = present(missingProfiles.find(person => person.id === selected.craftIds[0]), 'craft')
    expect(Reflect.deleteProperty(lead.skills, 'acting')).toBe(true)
    expect(Reflect.deleteProperty(craft.skills, 'craft')).toBe(true)
    expect(() => resolveGreenlightStaffing(missingProfiles, selected))
      .toThrow(`cast.lead talent "${lead.id}" lacks a "acting" skill profile`)
  })

  it('checks cast duplicates before whole-role collisions, whose order is writer/director/CRAFT/cast', () => {
    const scenario = buildScenario(SEED)
    const selected = choice(scenario)
    const double = { ...selected, craftIds: [selected.writerId],
      cast: { ...selected.cast, lead: selected.writerId, antagonist: selected.writerId } }
    expect(() => resolveGreenlightStaffing(scenario.readyOnly.talent, double)).toThrow('same actor to more than one cast slot')
    const twoCollisions = { ...double, cast: { ...selected.cast, lead: selected.writerId } }
    expect(() => pure({ people: scenario.readyOnly.talent, selected: twoCollisions }, input =>
      resolveGreenlightStaffing(input.people, input.selected))).toThrow('(writerId and craftIds[0])')
  })

  it.each(['director', 'lead', 'antagonist', 'support', 'craft'] as const)(
    'writer credit is NOT exempt from same-film %s uniqueness', seat => {
      const scenario = buildScenario(SEED)
      const selected = choice(scenario)
      const duplicate = seat === 'director' ? { ...selected, directorId: selected.writerId }
        : seat === 'craft' ? { ...selected, craftIds: [selected.writerId] }
        : { ...selected, cast: { ...selected.cast, [seat]: selected.writerId } }
      const second = seat === 'director' ? 'directorId' : seat === 'craft' ? 'craftIds[0]' : `cast.${seat}`
      expect(() => resolveGreenlightStaffing(scenario.readyOnly.talent, duplicate)).toThrow(`(writerId and ${second})`)
    },
  )

  it('enforces non-writer role collisions and repeated craft identities as well', () => {
    const scenario = buildScenario(SEED)
    const selected = choice(scenario)
    const people = scenario.readyOnly.talent
    expect(() => resolveGreenlightStaffing(people, { ...selected, craftIds: [selected.directorId] }))
      .toThrow('(directorId and craftIds[0])')
    expect(() => resolveGreenlightStaffing(people, { ...selected, cast: { ...selected.cast, lead: selected.directorId } }))
      .toThrow('(directorId and cast.lead)')
    const craftId = present(selected.craftIds[0], 'craft')
    expect(() => resolveGreenlightStaffing(people, { ...selected, cast: { ...selected.cast, support: craftId } }))
      .toThrow('(craftIds[0] and cast.support)')
    expect(() => resolveGreenlightStaffing(people, { ...selected, craftIds: [craftId, craftId] }))
      .toThrow('(craftIds[0] and craftIds[1])')
  })
})

describe('P14B4 shared admission — actual current labour facts and craft gate', () => {
  it('returns only actual current freelancers in engaged order and preserves actual fee/ledger effects', () => {
    // Historical-control founding helper; real hires/found actions, no edited employment.
    const state = foundedStudio('assign-freelancer')
    const concept = present(state.concepts[0], 'concept')
    const writer = present(contractedByRole(state, 'writer')[0], 'writer')
    const market = freelancerMarketIds(state)
    const freelance = present(state.talent.find(person => person.role === 'actor'
      && market.includes(person.id) && !isContracted(state, person.id)), 'actual current freelance actor')
    const base = remainingPackage(state, concept)
    const production = { ...commissionPayload(concept, writer.id), ...base,
      cast: { ...base.cast, support: freelance.id } }
    const staffing = resolveGreenlightStaffing(state.talent, production)
    const facts = employmentFacts(state)
    expect(facts.contractedIds.has(freelance.id)).toBe(false)
    expect(facts.freelancerIds.has(freelance.id)).toBe(true)
    const selected = pure({ people: staffing.engaged, facts }, input => greenlightFreelancers(input.people, input.facts))
    expect(selected.map(person => person.id)).toEqual([freelance.id])
    expectTypeOf(present(selected[0], 'selected freelancer')).toEqualTypeOf<Talent>()
    const before = structuredClone(state)
    const next = applyActions(state, [{ kind: 'greenlight', production }])
    const picture = present(next.studio.activeProductions.at(-1), 'actual freelance picture')
    const fees = next.ledger.slice(state.ledger.length).filter(row => row.kind === 'freelancerFee')
    expect(fees).toEqual([{
      week: state.market.tick, kind: 'freelancerFee', amount: -freelancerFee(state, freelance),
      talentId: freelance.id, productionId: picture.id, note: 'freelancer one-film fee',
    }])
    expect(next.studio.cash).toBe(state.studio.cash - production.budget.negative
      - production.budget.marketing - freelancerFee(state, freelance))
    expect(next.rngState).toEqual(state.rngState)
    expect(state).toEqual(before)
  })

  it('refuses a genuinely uncontracted non-market actor, without committing the action', () => {
    const state = foundedStudio('assign-illegal')
    const concept = present(state.concepts[0], 'concept')
    const writer = present(contractedByRole(state, 'writer')[0], 'writer')
    const facts = employmentFacts(state)
    const outsider = present(state.talent.find(person => person.role === 'actor'
      && !facts.contractedIds.has(person.id) && !facts.freelancerIds.has(person.id)), 'non-market actor')
    const base = remainingPackage(state, concept)
    const production = { ...commissionPayload(concept, writer.id), ...base,
      cast: { ...base.cast, support: outsider.id } }
    const staffing = resolveGreenlightStaffing(state.talent, production)
    const message = `talent "${outsider.id}" is neither studio-contracted nor an available freelancer`
    expect(() => pure({ people: staffing.engaged, facts }, input => greenlightFreelancers(input.people, input.facts)))
      .toThrow(message)
    const before = structuredClone(state)
    expect(() => applyActions(state, [{ kind: 'greenlight', production }])).toThrow(message)
    expect(state).toEqual(before)
  })

  it('keeps ordered narrow freelancer records and does not sort or consult unrelated person fields', () => {
    const state = foundedStudio('assign-freelancer')
    const market = freelancerMarketIds(state)
    const actual = state.talent.filter(person => market.includes(person.id) && !isContracted(state, person.id))
    expect(actual.length).toBeGreaterThanOrEqual(2)
    const first = present(actual[0], 'first actual freelancer')
    const second = present(actual[1], 'second actual freelancer')
    // Detached labour list, not a claim these people already occupy a full legal picture.
    const people = [second, first].map(person => ({ id: person.id, skills: person.skills, token: person.id }))
    const facts = employmentFacts(state)
    const result = pure({ people, facts }, input => greenlightFreelancers(input.people, input.facts))
    expect(result.map(person => person.token)).toEqual([second.id, first.id])
    expectTypeOf(present(result[0], 'narrow freelancer')).toEqualTypeOf<{ id: string; skills: Talent['skills']; token: string }>()
  })

  it('requires exactly one craft in the engaged gate, while preserving the legacy no-craft action', () => {
    expect(() => assertGreenlightCraftLead(1)).not.toThrow()
    for (const count of [0, 2]) {
      expect(() => assertGreenlightCraftLead(count)).toThrow(`exactly one Production/Craft Lead (got ${count})`)
    }
    const scenario = buildScenario(SEED)
    expect(() => applyActions(scenario.readyOnly, [{ kind: 'greenlightScriptProject', production: {
      projectId: scenario.projectAId, ...scenario.packageA, craftIds: [],
    } }])).toThrow('exactly one Production/Craft Lead (got 0)')
    const legacy = generateWorld('gl-xdisc-cast')
    expect(legacy.economyEngagedEver).toBe(false)
    const concept = present(legacy.concepts[0], 'legacy concept')
    const writers = legacy.talent.filter(person => person.role === 'writer')
    const actors = legacy.talent.filter(person => person.role === 'actor')
    const director = present(legacy.talent.find(person => person.role === 'director'), 'legacy director')
    const writer = present(writers[0], 'legacy writer')
    const production = { ...commissionPayload(concept, writer.id), directorId: director.id, craftIds: [],
      cast: { lead: present(actors[0], 'lead').id, antagonist: present(actors[1], 'antagonist').id,
        support: present(writers[1], 'non-primary support').id },
      budget: { negative: concept.baseNegativeCost, marketing: 0 } }
    const next = applyActions(legacy, [{ kind: 'greenlight', production }])
    expect(next.studio.activeProductions).toHaveLength(1)
    expect(next.studio.activeProductions[0]?.craftIds).toEqual([])
    expect(next.studio.activeProductions[0]?.cast.support).toBe(writers[1]?.id)
  })
})

describe('P14B4 shared admission — truthful managed header and existing order', () => {
  it('accepts the actual assessed Ready with no casting session and returns its actual records', () => {
    const scenario = buildScenario(SEED)
    const state = scenario.readyOnly
    const project = projectById(state, scenario.projectAId)
    expect(project.status).toBe('ready')
    expect(project.assessment).not.toBeNull()
    expect(state.castingSessions.sessions).toEqual([])
    const facts = headerFacts(state)
    const result = pure({ facts, selected: screenplay(project) }, input =>
      requireGreenlightHeader(input.facts, input.selected, project.id))
    expect(result.concept).toEqual(scenario.conceptA)
    expect(result.scriptProject).toEqual(project)
  })

  it('refuses actual Draft and Review, unknown project, and disagreeing Ready command facts', () => {
    const scenario = buildScenario(SEED)
    const draft = projectById(scenario.deadlock, scenario.projectBId)
    expect(draft.status).toBe('drafting')
    expect(() => requireGreenlightHeader(headerFacts(scenario.deadlock), screenplay(draft), draft.id))
      .toThrow('authoritative Ready script project')
    const reviewState = tick(scenario.deadlock)
    const review = projectById(reviewState, scenario.projectBId)
    expect(review.status).toBe('review')
    expect(() => requireGreenlightHeader(headerFacts(reviewState), screenplay(review), review.id))
      .toThrow('authoritative Ready script project')
    const ready = projectById(scenario.readyOnly, scenario.projectAId)
    const facts = headerFacts(scenario.readyOnly)
    expect(() => requireGreenlightHeader(facts, screenplay(ready), 'missing-project'))
      .toThrow('authoritative Ready script project')
    const original = screenplay(ready)
    const mismatches = [
      { ...original, writerId: scenario.packageA.directorId },
      { ...original, conceptId: scenario.conceptB.id },
      { ...original, shape: { ...original.shape, midpoint: 'reversal' as const } },
      { ...original, promise: { ...original.promise, ranges: { ...original.promise.ranges, intimacy: [-0.1, 0.1] as [number, number] } } },
    ]
    for (const selected of mismatches) {
      expect(() => pure({ facts, selected }, input => requireGreenlightHeader(input.facts, input.selected, ready.id)))
        .toThrow(`package facts disagree with Ready script project "${ready.id}"`)
    }
    // INVALID detached header probe, never saved or claimed an actual Ready history.
    const unassessed = { ...facts, development: { ...facts.development,
      projects: facts.development.projects.map(project => project.id === ready.id ? { ...project, assessment: null } : project),
    } }
    expect(() => requireGreenlightHeader(unassessed, original, ready.id)).toThrow('authoritative Ready script project')
  })

  it('requires actual audition review acknowledgement; no hand-stamped session history', () => {
    const scenario = buildScenario(SEED)
    let state = applyActions(scenario.readyOnly, [{ kind: 'activateCastingSessions' }])
    state = applyActions(state, [{ kind: 'startCastingSession', session: freeSlate(state, scenario.projectAId) }])
    state = tick(state)
    const session = present(state.castingSessions.sessions.find(row => row.projectId === scenario.projectAId), 'real audition')
    expect(session.status).toBe('review')
    const selected = screenplay(projectById(state, scenario.projectAId))
    expect(() => requireGreenlightHeader(headerFacts(state), selected, scenario.projectAId))
      .toThrow(`casting session "${session.id}" must be reviewed and acknowledged first`)
    expect(() => applyActions(state, [greenlightA(scenario)])).toThrow('must be reviewed and acknowledged first')
    const complete = applyActions(state, [{ kind: 'acknowledgeCastingSession', sessionId: session.id }])
    expect(complete.castingSessions.sessions.find(row => row.id === session.id)?.status).toBe('complete')
    expect(requireGreenlightHeader(headerFacts(complete), selected, scenario.projectAId).scriptProject?.id).toBe(scenario.projectAId)
    const next = applyActions(complete, [greenlightA(scenario)])
    expect(next.studio.activeProductions.length).toBe(complete.studio.activeProductions.length + 1)
  })

  it('preserves legacy development plus managed operations, and header-before-people refusal', () => {
    const founded = foundedStudio('assign-contracted')
    const state = applyActions(founded, [{ kind: 'activateStudioOperations' }])
    expect(state.operations.mode).toBe('managed')
    expect(state.scriptDevelopment.mode).toBe('legacy')
    const concept = present(state.concepts[0], 'legacy-development concept')
    const writer = present(contractedByRole(state, 'writer')[0], 'writer')
    const production = { ...commissionPayload(concept, writer.id), ...remainingPackage(state, concept) }
    const facts = headerFacts(state)
    expect(requireGreenlightHeader(facts, production)).toEqual({ concept, scriptProject: undefined })
    expect(() => requireGreenlightHeader(facts, production, 'not-a-managed-project')).toThrow('screenplay development is not managed')
    expect(() => requireGreenlightHeader(facts, { ...production, conceptId: 'missing-concept' }))
      .toThrow('greenlight references unknown conceptId "missing-concept"')
    expect(() => requireGreenlightHeader(facts, { ...production, promise: {
      ...production.promise, genre: concept.genre === 'comedy' ? 'horror' : 'comedy',
    } })).toThrow('greenlight promise.genre')
    const founding = beginFounding(generateWorld('p14b4-header-founding'))
    expect(founding.founding).not.toBeNull()
    expect(() => requireGreenlightHeader(headerFacts(founding), { ...production, conceptId: 'missing-concept' }))
      .toThrow('greenlight rejected — the studio is still in its founding draft')
    expect(applyActions(state, [{ kind: 'greenlight', production }]).studio.activeProductions).toHaveLength(1)
    const scenario = buildScenario(SEED)
    // Invalid command against a real managed state; no project ID plus unknown person.
    expect(() => applyActions(scenario.readyOnly, [{ kind: 'greenlight', production: {
      ...production, writerId: 'missing-writer',
    } }])).toThrow('authoritative Ready script project')
  })
})

describe('P14B4 shared admission — lazy commission facts and caller-specific busy sets', () => {
  function observedFacts(state: GameState, calls: string[]): CommissionWriterFacts<Talent> {
    return {
      foundingOpen: state.founding !== null,
      talent: state.talent,
      isCurrentlyContracted: id => { calls.push(`contract:${id}`); return isContracted(state, id) },
      busyIds: () => { calls.push('busy'); return busyTalentIds(state) },
    }
  }

  it('returns the actual full writer only after contract then broad busy, with no state changes', () => {
    const scenario = buildScenario(SEED)
    const state = scenario.readyOnly
    const before = structuredClone(state)
    deepFreeze(state)
    const calls: string[] = []
    const writer = requireCommissionableWriter(observedFacts(state, calls), scenario.writerId, 'commissionScript')
    expectTypeOf(writer).toEqualTypeOf<Talent>()
    expect(writer).toEqual(present(state.talent.find(row => row.id === scenario.writerId), 'writer'))
    expect(calls).toEqual([`contract:${scenario.writerId}`, 'busy'])
    expect(state).toEqual(before)
  })

  it('refuses real current writing for commission but excludes that credit from greenlight busy checks', () => {
    const scenario = buildScenario(SEED)
    const state = scenario.deadlock
    const calls: string[] = []
    expect(() => requireCommissionableWriter(observedFacts(state, calls), scenario.writerId, 'commissionScript'))
      .toThrow(`writer "${scenario.writerId}" already has an active assignment`)
    expect(calls).toEqual([`contract:${scenario.writerId}`, 'busy'])
    const ids = expectedEngaged(choice(scenario))
    expect(busyTalentIds(state).has(scenario.writerId)).toBe(true)
    expect(() => assertGreenlightStaffingIdle(ids, narrowBusy(state))).not.toThrow()
  })

  it('does not read broad busy before a real released writer contract refusal', () => {
    const scenario = buildScenario(SEED)
    const state = applyActions(scenario.readyOnly, [{ kind: 'releaseTalent', talentId: scenario.writerId }])
    const calls: string[] = []
    expect(() => requireCommissionableWriter(observedFacts(state, calls), scenario.writerId, 'commissionOriginalScreenplay'))
      .toThrow(`commissionOriginalScreenplay rejected — writer "${scenario.writerId}" is not currently studio-contracted`)
    expect(calls).toEqual([`contract:${scenario.writerId}`])
  })

  it('refuses founding, unknown person and missing writing profile before either lazy read', () => {
    const scenario = buildScenario(SEED)
    const state = scenario.readyOnly
    const calls: string[] = []
    const facts = observedFacts(state, calls)
    // Explicit detached guard probes, NOT claimed admitted historical GameStates.
    expect(() => requireCommissionableWriter({ ...facts, foundingOpen: true }, 'missing-writer', 'commissionScript'))
      .toThrow('commissionScript rejected — the studio is still in its founding draft')
    expect(calls).toEqual([])
    expect(() => requireCommissionableWriter(facts, 'missing-writer', 'commissionScript'))
      .toThrow('commissionScript writerId references unknown talent id "missing-writer"')
    expect(calls).toEqual([])
    const talent = structuredClone(state.talent)
    const writer = present(talent.find(row => row.id === scenario.writerId), 'writer')
    expect(Reflect.deleteProperty(writer.skills, 'writing')).toBe(true)
    expect(() => requireCommissionableWriter({ ...facts, talent }, writer.id, 'assignScreenplayWriter'))
      .toThrow(`assignScreenplayWriter writerId talent "${writer.id}" lacks a "writing" skill profile`)
    expect(calls).toEqual([])
  })

  it('preserves a narrow writer marker and accepts distinct supplied narrow versus broad fact sets', () => {
    const scenario = buildScenario(SEED)
    const actual = present(scenario.readyOnly.talent.find(row => row.id === scenario.writerId), 'writer')
    const talent = [{ id: actual.id, skills: actual.skills, marker: 'retained-writer-view' as const }]
    const calls: string[] = []
    // Detached caller-fact test only: this does not manufacture a research assignment.
    const facts = {
      foundingOpen: false, talent,
      isCurrentlyContracted: (id: string) => { calls.push(`contract:${id}`); return isContracted(scenario.readyOnly, id) },
      busyIds: () => { calls.push('busy'); return new Set<string>() },
    }
    const result = requireCommissionableWriter(facts, actual.id, 'commissionScript')
    expectTypeOf(result.marker).toEqualTypeOf<'retained-writer-view'>()
    expect(result.marker).toBe('retained-writer-view')
    expect(calls).toEqual([`contract:${actual.id}`, 'busy'])
    const narrow = new Set<string>()
    const broader = new Set([actual.id])
    expect(() => pure({ ids: [actual.id], busy: narrow }, input => assertGreenlightStaffingIdle(input.ids, input.busy))).not.toThrow()
    expect(() => requireCommissionableWriter({ ...facts, busyIds: () => broader }, actual.id, 'commissionScript'))
      .toThrow(`writer "${actual.id}" already has an active assignment`)
    expect([...narrow]).toEqual([])
    expect([...broader]).toEqual([actual.id])
  })
})
