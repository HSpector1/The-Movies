import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  castingSessionsReadModel,
  FOUNDING_MINIMUMS,
  generateWorld,
  stableStringify,
  tick,
} from '../src/core/index.js'
import {
  nextScriptDecision,
  scriptCapacityView,
  scriptProjectsReadModel,
} from '../src/core/scriptReadModel.js'
import type {
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  SegmentId,
  Talent,
} from '../src/core/types.js'
import {
  commissionFor as contendedCommission,
  contendedStudio,
  freePackage,
} from './_m4Fixtures.js'

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map(
    (id) => state.talent.find((talent) => talent.id === id)!,
  )
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function foundedManagedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  const hires = [
    ...byRole(pool, 'actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole(pool, 'director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole(pool, 'writer').slice(0, FOUNDING_MINIMUMS.writer),
    ...byRole(pool, 'craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) {
    state = applyActions(state, [
      { kind: 'signContract', talentId: hire.id, termWeeks: 104 },
    ])
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
}

function contractedTalent(state: GameState): Talent[] {
  const ids = new Set(
    state.contracts
      .filter(
        (contract) =>
          contract.startWeek <= state.market.tick &&
          state.market.tick < contract.endWeekExclusive,
      )
      .map((contract) => contract.talentId),
  )
  return state.talent.filter((talent) => ids.has(talent.id))
}

function commissionPayload(
  state: GameState,
  conceptIndex: number,
  writer: Talent,
): CommissionScriptPayload {
  const concept = state.concepts[conceptIndex]!
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: conceptIndex % 2 === 0 ? 'slowSetup' : 'mysteryHook',
      midpoint: conceptIndex % 2 === 0 ? 'revelation' : 'escalation',
      ending: conceptIndex % 2 === 0 ? 'bittersweet' : 'ambiguous',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'] as SegmentId[],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [0, 0.8],
        kineticEnergy: [-0.7, 0.2],
      },
    },
  }
}

function allObjectKeys(value: unknown, keys: Set<string> = new Set()): Set<string> {
  if (value === null || typeof value !== 'object') return keys
  if (Array.isArray(value)) {
    for (const item of value) allObjectKeys(item, keys)
    return keys
  }
  for (const [key, child] of Object.entries(value)) {
    keys.add(key)
    allObjectKeys(child, keys)
  }
  return keys
}

describe('Script Projects V1 player read model', () => {
  it('exposes a deterministic commission surface without hidden talent or concept state', () => {
    const state = foundedManagedStudio('script-read-commission')
    const view = scriptProjectsReadModel(state)

    expect(view.mode).toBe('managed')
    expect(view.capacity).toMatchObject({ capacity: 2, occupied: 0, available: 2 })
    expect(view.capacity.facilities).toHaveLength(1)
    expect(view.capacity.facilities[0]!.slots).toEqual([
      { slot: 0, occupant: null },
      { slot: 1, occupant: null },
    ])
    expect(view.commission.canStart).toBe(true)
    expect(view.commission.concepts.map((concept) => concept.id)).toEqual(
      [...state.concepts.map((concept) => concept.id)].sort(),
    )
    // Every contracted writing-capable person is offered, but the list now leads
    // with the best writing estimate so the form's default is the best writer.
    // Ties fall back to the canonical id.
    expect([...view.commission.writers.map((writer) => writer.id)].sort()).toEqual(
      [...state.contracts.map((contract) => contract.talentId)].sort(),
    )
    const estimates = view.commission.writers.map((writer) => writer.writingEstimate.score)
    expect(estimates).toEqual([...estimates].sort((a, b) => b - a))
    for (let index = 1; index < view.commission.writers.length; index++) {
      const previous = view.commission.writers[index - 1]!
      const current = view.commission.writers[index]!
      if (previous.writingEstimate.score === current.writingEstimate.score) {
        expect(previous.id < current.id).toBe(true)
      }
    }
    // Cross-discipline careers: every contracted person with a writing profile is
    // selectable; primary-role labels do not silently partition the commission list.
    expect(view.commission.writers.some((writer) => writer.primaryRole !== 'writer')).toBe(true)
    expect(view.commission.writers.every((writer) => writer.writingEstimate.label === 'Est.')).toBe(true)

    const keys = allObjectKeys(view)
    for (const forbidden of [
      'rngState',
      'actual',
      'actualStrength',
      'skills',
      'ceilings',
      'baselineStrength',
      'originalityRaw',
    ]) {
      expect(keys.has(forbidden), `read boundary leaked ${forbidden}`).toBe(false)
    }

    const hiddenChanged = structuredClone(state)
    for (const person of hiddenChanged.talent) {
      person.actual = { warmth: -1, gravity: 1, physicality: -1 }
      for (const profile of Object.values(person.skills)) {
        for (const pair of Object.values(profile)) pair.actual = pair.actual === 99 ? 1 : 99
      }
      for (const profile of Object.values(person.ceilings)) {
        for (const key of Object.keys(profile)) profile[key] = 99
      }
    }
    expect(scriptProjectsReadModel(hiddenChanged).commission.writers).toEqual(
      view.commission.writers,
    )
  })

  it('omits a concept already named by a queued pool commission but leaves other premises available', () => {
    const { state } = contendedStudio('script-read-queued-commission')
    const payload = contendedCommission(state, 4, 2)
    const before = scriptProjectsReadModel(state).commission
    const otherConceptId = before.concepts.find(
      (concept) => concept.id !== payload.conceptId,
    )!.id

    const queued = applyActions(state, [{ kind: 'commissionScript', project: payload }])
    const commission = scriptProjectsReadModel(queued).commission

    expect(commission.concepts.map((concept) => concept.id)).not.toContain(payload.conceptId)
    expect(commission.concepts.map((concept) => concept.id)).toContain(otherConceptId)
    expect(
      commission.blockers.flatMap((blocker) => [blocker.headline, blocker.detail, blocker.remedy]),
    ).not.toContainEqual(expect.stringMatching(/\bheld\b/i))
  })

  it('sorts reviews by project id and exposes only perceived Est. assessment decisions', () => {
    let state = foundedManagedStudio('script-read-review-order')
    const writers = contractedTalent(state)
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, writers[0]!) },
      { kind: 'commissionScript', project: commissionPayload(state, 1, writers[1]!) },
    ])
    state = tick(state)

    // Exercise ordering independently of the authoritative save invariant and make
    // the hidden-vs-estimated assertion numerically unambiguous.
    const projected = structuredClone(state)
    projected.scriptDevelopment.projects[0]!.assessment = {
      actualStrength: 99,
      perceivedStrength: 12,
    }
    projected.scriptDevelopment.projects.reverse()

    const view = scriptProjectsReadModel(projected)
    expect(view.sections.needsReview.map((card) => card.projectId)).toEqual([
      'script-0000',
      'script-0001',
    ])
    const first = view.sections.needsReview[0]!
    expect(first).toMatchObject({
      projectId: 'script-0000',
      title: state.concepts[0]!.title,
      genre: state.concepts[0]!.genre,
      lifecycleLabel: 'Needs review',
      section: 'needsReview',
    })
    expect(first.writer).toEqual({
      id: writers[0]!.id,
      name: writers[0]!.name,
      primaryRole: writers[0]!.role,
    })
    expect(first.assessment).toMatchObject({ label: 'Est.', score: 12, band: 'Fragile' })
    expect(first.assessment?.concerns.length).toBeGreaterThan(0)
    expect(JSON.stringify(first)).not.toContain('99')
    expect(first.legalActions.map((action) => action.kind)).toEqual([
      'acceptScript',
      'requestScriptRewrite',
    ])
    expect(first.consequence).toMatch(/one week/i)
    expect(first.consequence).toMatch(/payroll and studio overhead continue/i)
    expect(view.nextDecision).toMatchObject({
      kind: 'scriptReview',
      projectId: 'script-0000',
      title: state.concepts[0]!.title,
    })
    expect(nextScriptDecision(projected)).toEqual(view.nextDecision)
    expect(view.lotAttention).toMatchObject({ kind: 'review-required' })
  })

  it('projects exact shared occupancy and removes an illegal rewrite when capacity is full', () => {
    let state = foundedManagedStudio('script-read-capacity')
    const writers = contractedTalent(state)
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, writers[0]!) },
      { kind: 'commissionScript', project: commissionPayload(state, 1, writers[1]!) },
    ])
    state = tick(state)
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 2, writers[2]!) },
      { kind: 'commissionScript', project: commissionPayload(state, 3, writers[3]!) },
    ])

    const capacity = scriptCapacityView(state)
    expect(capacity).toMatchObject({ capacity: 2, occupied: 2, available: 0 })
    expect(capacity.facilities[0]!.slots.map((slot) => slot.occupant?.ownerId)).toEqual([
      'script-0002',
      'script-0003',
    ])
    expect(capacity.facilities[0]!.slots[0]!.occupant).toMatchObject({
      title: state.concepts[2]!.title,
      label: expect.stringContaining(writers[2]!.name),
      activity: 'drafting',
    })

    const view = scriptProjectsReadModel(state)
    expect(view.commission.canStart).toBe(false)
    expect(view.commission.blockers.map((blocker) => blocker.kind)).toContain(
      'facility-capacity',
    )
    expect(view.sections.inDevelopment.map((card) => card.projectId)).toEqual([
      'script-0002',
      'script-0003',
    ])
    expect(view.sections.needsReview[0]!.legalActions.map((action) => action.kind)).toEqual([
      'acceptScript',
    ])
    expect(view.sections.needsReview[0]!.blockers).toContainEqual(
      expect.objectContaining({ kind: 'facility-capacity' }),
    )
    // Review takes priority over capacity in the governed lot-attention order.
    expect(view.lotAttention.kind).toBe('review-required')

    const noReviews = structuredClone(state)
    noReviews.scriptDevelopment.projects = noReviews.scriptDevelopment.projects.filter(
      (project) => project.status !== 'review',
    )
    expect(scriptProjectsReadModel(noReviews).lotAttention.kind).toBe('capacity-constraint')
  })

  // ── P04A.2 SPLIT (Owner ruling: greenlight CREDITS a writer, it does not staff
  // one) ─────────────────────────────────────────────────────────────────────
  //
  // The predecessor proved two things in one body: (1) a READY package whose
  // credited writer is drafting another screenplay publishes a writer-assignment
  // blocker, and (2) the package facts it publishes are clones. The ruling
  // reverses (1) — availability gates WRITING WORK, and a greenlight engages no
  // writing time — so (1) is re-pointed here to the opposite, now-correct truth,
  // and the availability law it was written for is preserved unbroken in the two
  // named siblings below: the REWRITE purpose (real writing work) still emits the
  // blocker, and the writer-CONTRACT gate still refuses a package outright.
  // Half (2) is untouched.
  it('publishes a clear Ready package while its credited writer drafts another screenplay, and returns cloned locked package facts', () => {
    let state = foundedManagedStudio('script-read-package')
    const writer = contractedTalent(state)[0]!
    const firstPayload = commissionPayload(state, 0, writer)
    state = applyActions(state, [{ kind: 'commissionScript', project: firstPayload }])
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])

    const ready = scriptProjectsReadModel(state)
    expect(ready.packages).toHaveLength(1)
    expect(ready.packages[0]!.availability).toMatchObject({
      knownGatesClear: true,
      writerAvailable: true,
      productionSlotAvailable: true,
      developmentCastingSlotAvailable: true,
    })
    expect(ready.sections.readyToPackage[0]!.legalActions).toEqual([
      { kind: 'openPackage', projectId: 'script-0000', label: 'Open locked package' },
    ])

    const stateBeforeOutputMutation = stableStringify(state)
    ready.packages[0]!.lockedShape.opening = 'immediateAction'
    ready.packages[0]!.lockedPromise.intendedSegments.push('family')
    ready.packages[0]!.lockedPromise.ranges.intimacy[0] = -1
    ready.packages[0]!.assessment.strengths.push('consumer mutation')
    expect(stableStringify(state)).toBe(stateBeforeOutputMutation)
    expect(scriptProjectsReadModel(state).packages[0]!.lockedShape).toEqual(firstPayload.shape)
    expect(scriptProjectsReadModel(state).packages[0]!.lockedPromise).toEqual(firstPayload.promise)

    // A Ready screenplay releases its writer, so the same writer can begin another
    // script. Under P04A.2 that active drafting task must NOT block this package:
    // greenlighting script-0000 credits an author whose work on it is finished and
    // engages none of the writing time they are now spending on script-0001. The
    // read model has to agree with the engine, which no longer consults the
    // credited writer's availability at greenlight either.
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 1, writer) },
    ])
    const drafting = scriptProjectsReadModel(state)
    const draftingPackage = drafting.packages.find(
      (candidate) => candidate.projectId === 'script-0000',
    )!
    // The writer really IS busy — the second screenplay is genuinely drafting.
    expect(
      drafting.sections.inDevelopment.map((card) => card.projectId),
    ).toContain('script-0001')
    expect(state.scriptDevelopment.projects.find((p) => p.id === 'script-0001')!.status).toBe(
      'drafting',
    )
    expect(draftingPackage.availability).toMatchObject({
      knownGatesClear: true,
      writerAvailable: true,
      canSubmitGreenlightIntent: true,
    })
    expect(draftingPackage.availability.blockers).not.toContainEqual(
      expect.objectContaining({ kind: 'writer-assignment' }),
    )
    // Opening the locked package stays legal, as it always was.
    expect(draftingPackage.openAction?.kind).toBe('openPackage')
  })

  // The availability law the predecessor was written for, kept whole on the path
  // where it still binds: a REWRITE is real writing work, so a writer who is
  // genuinely busy cannot be handed one. Unchanged by P04A.2.
  it('still names a writer-assignment blocker on the REWRITE path when the writer is genuinely busy', () => {
    let state = foundedManagedStudio('script-read-rewrite-writer-busy')
    const writer = contractedTalent(state)[0]!
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, writer) },
    ])
    state = tick(state)
    // script-0000 is now a first draft awaiting review; the writer is released.
    const review = state.scriptDevelopment.projects.find((p) => p.id === 'script-0000')!
    expect(review.status).toBe('review')
    expect(review.rewriteCount).toBe(0)

    // The same writer starts a second screenplay — now they are genuinely busy.
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 1, writer) },
    ])
    expect(state.scriptDevelopment.projects.find((p) => p.id === 'script-0001')!.status).toBe(
      'drafting',
    )

    const view = scriptProjectsReadModel(state)
    const card = view.sections.needsReview.find((candidate) => candidate.projectId === 'script-0000')!
    expect(card.blockers).toContainEqual(
      expect.objectContaining({
        kind: 'writer-assignment',
        headline: `${writer.name} is already assigned`,
        detail: expect.stringContaining(`Drafting ${state.concepts[1]!.title}`),
        remedy: 'Wait for the named assignment to finish.',
      }),
    )
    // …and the rewrite it gates is therefore not offered.
    expect(card.legalActions.map((action) => action.kind)).not.toContain('requestScriptRewrite')
    expect(card.legalActions.map((action) => action.kind)).toContain('acceptScript')
  })

  // The OTHER half of `writerBlockers`, unchanged by P04A.2 and load-bearing for
  // the package path: the engine really does require `isContracted(writerId)` at
  // greenlight, so a Ready package whose credited writer is out of contract is
  // still refused — availability is not the only writer gate.
  it('still names a writer-contract blocker for a Ready package whose writer is out of contract', () => {
    let state = foundedManagedStudio('script-read-package-writer-uncontracted')
    const writer = contractedTalent(state)[0]!
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, writer) },
    ])
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])
    expect(
      scriptProjectsReadModel(state).packages[0]!.availability,
    ).toMatchObject({ knownGatesClear: true, writerAvailable: true })

    // Let the writer's contract lapse (projection-level fixture, as elsewhere in
    // this file): the credit survives, the greenlight gate does not.
    const lapsed: GameState = {
      ...state,
      contracts: state.contracts.filter((contract) => contract.talentId !== writer.id),
    }
    const availability = scriptProjectsReadModel(lapsed).packages[0]!.availability
    expect(availability.knownGatesClear).toBe(false)
    expect(availability.writerAvailable).toBe(false)
    expect(availability.canSubmitGreenlightIntent).toBe(false)
    expect(availability.blockers).toContainEqual(
      expect.objectContaining({
        kind: 'writer-contract',
        headline: `${writer.name} is out of contract`,
        detail: expect.stringContaining('greenlight this screenplay'),
        remedy: `Sign ${writer.name} to a new studio contract.`,
      }),
    )
  })

  it('suppresses only the exact queued greenlight across screenplay and casting package doors', () => {
    const { state, readyProjectIds } = contendedStudio('script-read-queued-greenlight')
    const targetProjectId = readyProjectIds[0]!
    const otherProjectId = readyProjectIds[1]!
    const queued = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: freePackage(state, targetProjectId),
      },
    ])

    const scripts = scriptProjectsReadModel(queued)
    const targetPackage = scripts.packages.find(
      (candidate) => candidate.projectId === targetProjectId,
    )!
    const otherPackage = scripts.packages.find(
      (candidate) => candidate.projectId === otherProjectId,
    )!
    const targetCard = scripts.sections.readyToPackage.find(
      (candidate) => candidate.projectId === targetProjectId,
    )!
    const otherCard = scripts.sections.readyToPackage.find(
      (candidate) => candidate.projectId === otherProjectId,
    )!

    expect(targetPackage.openAction).toBeNull()
    expect(targetPackage.availability.blockers).toContainEqual(
      expect.objectContaining({
        kind: 'greenlight-queued',
        headline: 'Greenlight already queued',
      }),
    )
    expect(targetPackage.availability.blockers).not.toContainEqual(
      expect.objectContaining({ kind: 'facility-capacity' }),
    )
    expect(targetCard.legalActions.map((action) => action.kind)).not.toContain('openPackage')

    expect(otherPackage.openAction?.kind).toBe('openPackage')
    expect(otherCard.legalActions.map((action) => action.kind)).toContain('openPackage')

    const casting = castingSessionsReadModel(queued).sections.readyToPlan
    const targetCasting = casting.find((candidate) => candidate.projectId === targetProjectId)!
    const otherCasting = casting.find((candidate) => candidate.projectId === otherProjectId)!
    expect(targetCasting.legalActions.map((action) => action.kind)).not.toContain('openPackage')
    expect(targetCasting.packageAvailability?.blockers).toContainEqual(
      expect.objectContaining({ kind: 'greenlight-queued' }),
    )
    expect(otherCasting.legalActions.map((action) => action.kind)).toContain('openPackage')
  })

  it('blocks a Ready package before Assembly when its locked writer consumes a required role pool', () => {
    let state = foundedManagedStudio('script-read-cross-discipline-staffing')
    const directorWriter = contractedTalent(state).find(
      (talent) => talent.role === 'director',
    )!
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, directorWriter) },
    ])
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])

    // Make the locked screenplay writer the only current primary-role Director.
    // Assembly excludes that person from every other credit on the film, so the
    // Writers Room must expose the shortage before offering package navigation.
    state = {
      ...state,
      talent: state.talent.map((talent) =>
        talent.id !== directorWriter.id && talent.role === 'director'
          ? { ...talent, role: 'actor' }
          : talent,
      ),
    }

    const view = scriptProjectsReadModel(state)
    const availability = view.packages[0]!.availability
    expect(availability).toMatchObject({
      knownGatesClear: false,
      writerAvailable: true,
      staffingAvailable: false,
      productionSlotAvailable: true,
      developmentCastingSlotAvailable: true,
    })
    expect(availability.blockers).toContainEqual(
      expect.objectContaining({
        kind: 'package-staffing',
        headline: 'The remaining package cannot be staffed',
        detail: expect.stringContaining(directorWriter.name),
        remedy: expect.stringContaining('freelancer market'),
      }),
    )
    expect(
      availability.blockers.find((blocker) => blocker.kind === 'package-staffing')!.detail,
    ).toContain('Director (0 of 1 available)')
    expect(view.packages[0]!.openAction).toBeNull()
    expect(view.sections.readyToPackage[0]!.legalActions).toEqual([])
  })

  it('offers audition planning with three Actors and keeps it queueable when capacity is full', () => {
    let state = foundedManagedStudio('script-read-casting-legality')
    state = applyActions(state, [{ kind: 'activateCastingSessions' }])
    const writers = contractedTalent(state)
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, writers[0]!) },
      { kind: 'commissionScript', project: commissionPayload(state, 1, writers[1]!) },
    ])
    state = tick(state)
    state = applyActions(state, [
      { kind: 'acceptScript', projectId: 'script-0000' },
      { kind: 'acceptScript', projectId: 'script-0001' },
    ])

    const legal = scriptProjectsReadModel(state).sections.readyToPackage[0]!
    expect(legal.legalActions.map((action) => action.kind)).toContain('planAuditions')

    const primaryActors = state.talent.filter((talent) => talent.role === 'actor')
    const onlyTwoPrimaryActors: GameState = {
      ...state,
      talent: state.talent.map((talent) =>
        talent.role === 'actor' && !primaryActors.slice(0, 2).some((actor) => actor.id === talent.id)
          ? { ...talent, role: 'director' }
          : talent,
      ),
    }
    const actorBlocked = scriptProjectsReadModel(onlyTwoPrimaryActors).sections.readyToPackage[0]!
    expect(actorBlocked.legalActions.map((action) => action.kind)).not.toContain('planAuditions')

    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 2, writers[2]!) },
      { kind: 'commissionScript', project: commissionPayload(state, 3, writers[3]!) },
    ])
    expect(scriptCapacityView(state)).toMatchObject({ occupied: 2, available: 0 })
    for (const card of scriptProjectsReadModel(state).sections.readyToPackage) {
      expect(card.legalActions.map((action) => action.kind)).toContain('planAuditions')
      expect(card.blockers).toContainEqual(expect.objectContaining({ kind: 'facility-capacity' }))
    }

    const target = scriptProjectsReadModel(state).sections.readyToPackage[0]!
    const actors = castingSessionsReadModel(state).sections.readyToPlan.find(
      (project) => project.projectId === target.projectId,
    )!.candidates.lead
    state = applyActions(state, [
      {
        kind: 'startCastingSession',
        session: {
          projectId: target.projectId,
          slate: {
            lead: [actors[0]!.id, actors[1]!.id],
            antagonist: [actors[0]!.id, actors[2]!.id],
            support: [actors[1]!.id, actors[2]!.id],
          },
        },
      },
    ])
    const queuedCards = scriptProjectsReadModel(state).sections.readyToPackage
    expect(
      queuedCards.find((card) => card.projectId === target.projectId)!.legalActions
        .map((action) => action.kind),
    ).not.toContain('planAuditions')
    expect(
      queuedCards.find((card) => card.projectId !== target.projectId)!.legalActions
        .map((action) => action.kind),
    ).toContain('planAuditions')
  })

  it('keeps active and produced projects in deterministic production history', () => {
    let state = foundedManagedStudio('script-read-history')
    const writers = contractedTalent(state)
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 0, writers[0]!) },
      { kind: 'commissionScript', project: commissionPayload(state, 1, writers[1]!) },
    ])
    state = tick(state)
    const projected = structuredClone(state)
    projected.scriptDevelopment.projects[0] = {
      ...projected.scriptDevelopment.projects[0]!,
      status: 'inProduction',
      productionId: 'prod-0001',
    }
    projected.scriptDevelopment.projects[1] = {
      ...projected.scriptDevelopment.projects[1]!,
      status: 'produced',
      productionId: 'prod-0000',
    }
    projected.scriptDevelopment.projects.reverse()

    const history = scriptProjectsReadModel(projected).sections.productionHistory
    expect(history.map((card) => card.projectId)).toEqual(['script-0000', 'script-0001'])
    expect(history.map((card) => card.lifecycleLabel)).toEqual(['In production', 'Produced'])
    expect(history.every((card) => card.legalActions.length === 0)).toBe(true)
  })
})
