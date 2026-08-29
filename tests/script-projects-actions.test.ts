import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  makeSave,
  predictProductionId,
  stableStringify,
  tick,
} from '../src/core/index.js'
import type {
  CastSlot,
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  GreenlightScriptProjectPayload,
  SegmentId,
  Talent,
} from '../src/core/index.js'

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map(
    (id) => state.talent.find((talent) => talent.id === id)!,
  )
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function foundedStudio(seed: string): GameState {
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
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function contractedByRole(state: GameState, role: CreativeRole): Talent[] {
  const contractedIds = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter(
    (talent) => talent.role === role && contractedIds.has(talent.id),
  )
}

function commissionPayload(state: GameState): CommissionScriptPayload {
  const concept = state.concepts[0]!
  return {
    conceptId: concept.id,
    writerId: contractedByRole(state, 'writer')[0]!.id,
    shape: {
      opening: 'slowSetup',
      midpoint: 'revelation',
      ending: 'bittersweet',
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

function remainingPackage(state: GameState): Omit<GreenlightScriptProjectPayload, 'projectId'> {
  const actors = contractedByRole(state, 'actor')
  const concept = state.concepts[0]!
  return {
    directorId: contractedByRole(state, 'director')[0]!.id,
    craftIds: [contractedByRole(state, 'craft')[0]!.id],
    cast: {
      lead: actors[0]!.id,
      antagonist: actors[1]!.id,
      support: actors[2]!.id,
    } satisfies Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function advanceManagedProductionToRelease(state: GameState): GameState {
  let next = state
  for (let step = 0; step < 16 && next.studio.activeProductions.length > 0; step++) {
    const production = next.studio.activeProductions[0]!
    const workflow = next.operations.workflows.find(
      (candidate) => candidate.productionId === production.id,
    )!
    if (workflow.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
      next = applyActions(next, [
        {
          kind: 'assignShootingDirector',
          productionId: production.id,
          directorId: production.directorId,
        },
        { kind: 'clearSceneryLoadIn', productionId: production.id },
        { kind: 'scheduleShootingTake', productionId: production.id },
      ])
    }
    next = tick(next)
  }
  if (next.studio.activeProductions.length !== 0) {
    throw new Error('test fixture failed to advance the managed production to release')
  }
  return next
}

describe('Script Projects V1 action and tick integration', () => {
  it('activates Operations and Script Development together without consuming RNG', () => {
    const founded = foundedStudio('script-actions-activation')
    const rngBefore = founded.rngState

    const activated = applyActions(founded, [
      { kind: 'activateStudioOperations' },
      { kind: 'activateScriptDevelopment' },
    ])

    expect(activated.operations.mode).toBe('managed')
    expect(activated.scriptDevelopment).toEqual({ mode: 'managed', projects: [] })
    expect(activated.rngState).toBe(rngBefore)
  })

  it('runs Draft, one Rewrite, Ready, linked production, cancellation, and Produced history', () => {
    let state = foundedStudio('script-actions-lifecycle')
    state = applyActions(state, [
      { kind: 'activateStudioOperations' },
      { kind: 'activateScriptDevelopment' },
    ])
    const rngBeforeScriptWork = state.rngState
    const projectInput = commissionPayload(state)

    state = applyActions(state, [{ kind: 'commissionScript', project: projectInput }])
    let project = state.scriptDevelopment.projects[0]!
    expect(project).toMatchObject({
      id: 'script-0000',
      status: 'drafting',
      rewriteCount: 0,
      commissionedWeek: 0,
      dueWeek: 1,
      assessment: null,
      productionId: null,
    })
    expect(project.reservation).not.toBeNull()

    state = tick(state)
    project = state.scriptDevelopment.projects[0]!
    expect(state.market.tick).toBe(1)
    expect(project.status).toBe('review')
    expect(project.dueWeek).toBeNull()
    expect(project.reservation).toBeNull()
    expect(project.assessment).not.toBeNull()
    const firstAssessment = { ...project.assessment! }

    state = applyActions(state, [
      { kind: 'requestScriptRewrite', projectId: project.id },
    ])
    project = state.scriptDevelopment.projects[0]!
    expect(project).toMatchObject({ status: 'rewriting', rewriteCount: 1, dueWeek: 2 })
    expect(project.reservation).not.toBeNull()

    state = tick(state)
    project = state.scriptDevelopment.projects[0]!
    expect(state.market.tick).toBe(2)
    expect(project.status).toBe('review')
    expect(project.rewriteCount).toBe(1)
    expect(project.assessment).not.toEqual(firstAssessment)
    expect(project.reservation).toBeNull()
    expect(() =>
      applyActions(state, [{ kind: 'requestScriptRewrite', projectId: project.id }]),
    ).toThrow(/not at its first review/)

    state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
    project = state.scriptDevelopment.projects[0]!
    expect(project.status).toBe('ready')
    const acceptedAssessment = { ...project.assessment! }
    const packageInput = remainingPackage(state)

    const rawBypass = {
      kind: 'greenlight' as const,
      production: {
        conceptId: project.conceptId,
        writerId: project.writerId,
        shape: project.shape,
        promise: project.promise,
        ...packageInput,
      },
    }
    const readyBeforeRejectedBypass = stableStringify(state)
    expect(() => applyActions(state, [rawBypass])).toThrow(/authoritative Ready script project/)
    expect(stableStringify(state)).toBe(readyBeforeRejectedBypass)

    // P04A.3 (Owner ruling) — a completed screenplay's credited Writer holds a
    // permanent CREDIT, not an active assignment: greenlighting it engages no
    // writing time, so the writer's contract state cannot gate it. This used to
    // throw "must be currently studio-contracted"; it now succeeds, and
    // `applyActions` is still pure — the input state is untouched either way.
    const withoutWriterContract: GameState = {
      ...state,
      contracts: state.contracts.filter((contract) => contract.talentId !== project.writerId),
    }
    const noContractBefore = stableStringify(withoutWriterContract)
    const greenlitWithoutWriterContract = applyActions(withoutWriterContract, [
      {
        kind: 'greenlightScriptProject',
        production: { projectId: project.id, ...packageInput },
      },
    ])
    expect(stableStringify(withoutWriterContract)).toBe(noContractBefore)
    expect(greenlitWithoutWriterContract.studio.activeProductions).toHaveLength(1)
    expect(greenlitWithoutWriterContract.studio.activeProductions[0]!.writerId).toBe(
      project.writerId,
    )

    const greenlit = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: { projectId: project.id, ...packageInput },
      },
    ])
    const production = greenlit.studio.activeProductions[0]!
    const linked = greenlit.scriptDevelopment.projects[0]!
    expect(linked).toMatchObject({
      status: 'inProduction',
      productionId: production.id,
      assessment: acceptedAssessment,
    })
    expect(production).toMatchObject({
      conceptId: project.conceptId,
      writerId: project.writerId,
      shape: project.shape,
      promise: project.promise,
    })
    expect(production.shape).not.toBe(linked.shape)
    expect(production.promise).not.toBe(linked.promise)
    expect(production.promise.ranges).not.toBe(linked.promise.ranges)
    expect(greenlit.rngState).toBe(rngBeforeScriptWork)

    const cancelled = applyActions(greenlit, [
      { kind: 'cancel', productionId: production.id },
    ])
    expect(cancelled.studio.activeProductions).toEqual([])
    expect(cancelled.operations.workflows).toEqual([])
    expect(cancelled.scriptDevelopment.projects[0]).toMatchObject({
      status: 'ready',
      productionId: null,
      assessment: acceptedAssessment,
    })

    const released = advanceManagedProductionToRelease(greenlit)
    const produced = released.scriptDevelopment.projects[0]!
    const film = released.studio.releasedFilms.find(
      (candidate) => candidate.productionId === production.id,
    )
    expect(film).toBeDefined()
    expect(film?.participants?.writer.talentId).toBe(project.writerId)
    expect(produced).toMatchObject({
      status: 'produced',
      productionId: production.id,
      assessment: acceptedAssessment,
    })
    expect(produced.assessment).toEqual(acceptedAssessment)
    expect(released.operations.workflows).toEqual([])
  })

  it('reserves a cancelled production id and keeps re-greenlight ledger attribution exact', () => {
    let state = foundedStudio('script-actions-cancel-id-history')
    state = applyActions(state, [
      { kind: 'activateStudioOperations' },
      { kind: 'activateScriptDevelopment' },
    ])

    // Prepare one Ready screenplay, then cancel and immediately re-greenlight that
    // same authoritative project at the same market tick.
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state) },
    ])
    state = tick(state)
    const projectId = state.scriptDevelopment.projects[0]!.id
    state = applyActions(state, [{ kind: 'acceptScript', projectId }])

    const firstBudget = { negative: 1_000_001, marketing: 100_001 }
    const secondBudget = { negative: 2_000_002, marketing: 200_002 }
    const firstPackage = {
      ...remainingPackage(state),
      budget: firstBudget,
    }
    const secondPackage = {
      ...remainingPackage(state),
      budget: secondBudget,
    }

    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: { projectId, ...firstPackage },
      },
    ])
    const firstId = state.studio.activeProductions[0]!.id
    const firstEntries = state.ledger.filter((entry) => entry.productionId === firstId)
    expect(firstEntries).toEqual([
      {
        week: 1,
        kind: 'production',
        amount: -(firstBudget.negative + firstBudget.marketing),
        productionId: firstId,
        note: 'negative + marketing',
      },
    ])

    state = applyActions(state, [{ kind: 'cancel', productionId: firstId }])
    expect(state.studio.activeProductions).toEqual([])
    expect(state.studio.releasedFilms).toEqual([])
    expect(state.scriptDevelopment.projects[0]).toMatchObject({
      id: projectId,
      status: 'ready',
      productionId: null,
    })
    expect(predictProductionId(state)).toBe(`${firstId}-1`)

    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: { projectId, ...secondPackage },
      },
    ])
    const secondId = state.studio.activeProductions[0]!.id
    expect(secondId).toBe(`${firstId}-1`)
    expect(secondId).not.toBe(firstId)

    // The first film's sunk-cost entries are untouched, and the replacement film
    // owns a disjoint exact-dollar accounting group under its new identity.
    expect(state.ledger.filter((entry) => entry.productionId === firstId)).toEqual(firstEntries)
    expect(state.ledger.filter((entry) => entry.productionId === secondId)).toEqual([
      {
        week: 1,
        kind: 'production',
        amount: -(secondBudget.negative + secondBudget.marketing),
        productionId: secondId,
        note: 'negative + marketing',
      },
    ])
  })

  it('blocks early writer release during script work and resolves work before natural expiry', () => {
    let state = foundedStudio('script-actions-contract-boundary')
    state = applyActions(state, [
      { kind: 'activateStudioOperations' },
      { kind: 'activateScriptDevelopment' },
    ])
    const input = commissionPayload(state)
    const writerId = input.writerId

    // Put the writer on a one-week remaining term. The commission is legal in
    // Week 0; the screenplay is due exactly when that contract naturally ends.
    state = {
      ...state,
      contracts: state.contracts.map((contract) =>
        contract.talentId === writerId
          ? { ...contract, endWeekExclusive: 1, termWeeks: 1 }
          : contract,
      ),
    }
    state = applyActions(state, [{ kind: 'commissionScript', project: input }])

    const beforeReleaseAttempt = stableStringify(state)
    expect(() =>
      applyActions(state, [{ kind: 'releaseTalent', talentId: writerId }]),
    ).toThrow(/Drafting .*finish that screenplay task first/)
    expect(stableStringify(state)).toBe(beforeReleaseAttempt)

    const next = tick(state)
    expect(next.market.tick).toBe(1)
    expect(next.scriptDevelopment.projects[0]).toMatchObject({
      status: 'review',
      dueWeek: null,
      reservation: null,
    })
    expect(next.contracts.some((contract) => contract.talentId === writerId)).toBe(false)
    expect(next.freeAgents).toContain(writerId)
    // Ready/review writers may be out of contract; only active work requires the
    // contract. The strict current save validator proves the final tick is valid.
    expect(() => makeSave(next)).not.toThrow()
  })
})
