// INERT / UNEXECUTED. Intended tests/p14b4-ready-replay-background.test.ts.
//268: independent255 diagnostic and empty-person audition-background coverage.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds } from '../src/core/employment.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import * as admissionModule from '../src/core/productionAdmission.js'
import { replayReadyProductionPlans, type ReadyOwnerReplayInput } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import * as scriptsModule from '../src/core/scriptDevelopment.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production } from '../src/core/types.js'
import { commissionPayload, contractedByRole, foundedStudio, projectById,
  remainingPackage, SEED, writingIds } from './_p04a2WriterCreditFixtures.js'

type Choice = ReadyOwnerReplayInput['plans'][number]['readyChoice']
const clone = <T>(value: T): T => structuredClone(value)
const company = (row: Readonly<{ directorId: string; cast: Readonly<Production['cast']>; craftIds: readonly string[] }>) =>
  [row.directorId, ...Object.values(row.cast), ...row.craftIds]

function supported(state: GameState, choice: Choice) {
  assert.ok(state.hollywood)
  const own = state.hollywood.playerStudioId
  expect(state.founding).toBeNull()
  expect(state.operations.mode).toBe('managed')
  expect(state.scriptDevelopment.mode).toBe('managed')
  expect(state.productionQueue).toEqual([])
  expect(state.physicalPlans.plans.filter((row) => row.studioId === own &&
    (row.status === 'queued' || row.status === 'held' || row.status === 'blocked'))).toEqual([])
  expect(state.construction.projects.filter((row) => row.status === 'building')).toEqual([])
  expect(state.placement.facilities.filter((row) => row.status === 'underConstruction')).toEqual([])
  expect(state.sets.filter((row) => row.status === 'under-construction')).toEqual([])
  expect(state.technology.projects.filter((row) => row.studioId === own && row.status === 'active')).toEqual([])
  expect(state.technology.adoptions.filter((row) => row.studioId === own &&
    row.cancelledWeek === null && row.operationalWeek === null)).toEqual([])
  const relevant = new Set([...state.studio.activeProductions.flatMap(company), ...company(choice)])
  for (const project of state.scriptDevelopment.projects) if (project.status === 'drafting' || project.status === 'rewriting') {
    for (const id of scriptProjectWriterIds(project)) relevant.add(id)
  }
  for (const business of state.hollywood.businesses.filter((row) => row.studioId !== own)) {
    expect(business.productions.flatMap(company).filter((id) => relevant.has(id))).toEqual([])
    for (const ordinal of business.activeScriptOrdinals) {
      const project = business.development.projects[ordinal], costs = business.projects[ordinal]
      assert.ok(project && costs)
      expect(costs.scriptProjectId).toBe(project.id)
      expect(costs.conceptId).toBe(project.conceptId)
      expect(state.hollywood.concepts[costs.conceptOrdinal]?.id).toBe(project.conceptId)
      if (project.status === 'drafting' || project.status === 'rewriting') {
        expect(scriptProjectWriterIds(project).filter((id) => relevant.has(id))).toEqual([])
      }
    }
  }
  expect(state.technology.projects.filter((row) => row.studioId !== own && row.status === 'active')
    .flatMap((row) => row.seats.filter((seat) => seat.releasedWeek === null && relevant.has(seat.talentId)))).toEqual([])
  makeSave(state)
}

function baseReady() {
  // Same disclosed historical-control founding/action route as242/244; fresh at real0.
  let state = foundedStudio(SEED, { actor: 3, director: 1, craft: 1 })
  expect(state.market.tick).toBe(0)
  state = initializeHollywood(state, 'fresh')
  expect(state.hollywood).toMatchObject({ origin: 'fresh', originWeek: 0 })
  makeSave(state)
  state = applyActions(state, [{ kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }])
  expect(contractedByRole(state, 'writer')).toHaveLength(1)
  const writerId = contractedByRole(state, 'writer')[0]!.id, concept = state.concepts[0]!
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(concept, writerId) }])
  const projectId = state.scriptDevelopment.projects[0]!.id
  expect(projectById(state, projectId)).toMatchObject({ status: 'drafting', dueWeek: 1 })
  state = tick(state)
  expect(projectById(state, projectId).status).toBe('review')
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  expect(projectById(state, projectId)).toMatchObject({ status: 'ready', productionId: null, dueWeek: null, reservation: null })
  expect(projectById(state, projectId).assessment).not.toBeNull()
  expect(state.studio.activeProductions).toEqual([])
  expect(writingIds(state)).toEqual([])
  expect(state.promises).toEqual([])
  const payload = { projectId, ...remainingPackage(state, concept) }
  supported(state, payload)
  return { state, payload, writerId }
}


function input(state: GameState, choice: Choice): ReadyOwnerReplayInput {
  assert.ok(state.hollywood)
  return { source: state, issuerId: state.hollywood.playerStudioId, claimPersonIds: [choice.cast.lead],
    plans: [{ traceKey: '268-ready-background', readyChoice: choice, commands: [] }],
    horizonEndWeek: state.market.tick + 1, preparationWork: 0,
    limits: { work: 200000, span: 220, alternatives: 1024 } }
}

function observed(value: ReadyOwnerReplayInput) {
  const before = clone(value), original = operationsModule.advanceManagedProductions
  const calls: { week: number; ids: string[]; before: number[]; after: number[] }[] = []
  const sweep = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
    const next = original(...args)
    calls.push({ week: args[2], ids: args[1].map((row) => row.id), before: args[1].map((row) => row.remainingTicks),
      after: next.productions.map((row) => row.remainingTicks) })
    return next
  })
  const header = vi.spyOn(admissionModule, 'requireGreenlightHeader')
  const staffing = vi.spyOn(admissionModule, 'resolveGreenlightStaffing')
  const add = vi.spyOn(operationsModule, 'addManagedProductionWorkflow')
  const link = vi.spyOn(scriptsModule, 'linkScriptProjectToProduction')
  try {
    const result = replayReadyProductionPlans(value)
    expect(result.preparationWork).toBeLessThanOrEqual(200000)
    return { result, calls, counts: { header: header.mock.calls.length, staffing: staffing.mock.calls.length,
      add: add.mock.calls.length, link: link.mock.calls.length } }
  } finally {
    sweep.mockRestore(); header.mockRestore(); staffing.mockRestore(); add.mockRestore(); link.mockRestore()
    expect(value).toEqual(before)
  }
}

describe('P14B4 Ready replay — exact diagnostics and independent audition work', () => {
  it('preserves the actual unknown-project diagnostic including the supplied identity before admission owners', () => {
    const { state, payload } = baseReady(), before = clone(state)
    const projectId = 'script-9999'
    expect(state.scriptDevelopment.projects.some((row) => row.id === projectId)).toBe(false)
    const message = `applyActions: greenlightScriptProject references unknown project "${projectId}"`
    expect(() => applyActions(state, [{ kind: 'greenlightScriptProject', production: { ...payload, projectId } }]))
      .toThrow(message)
    const choice: Choice = { projectId, directorId: payload.directorId, cast: payload.cast, craftIds: payload.craftIds }
    const seen = observed(input(state, choice))
    expect(seen.result.attempts).toHaveLength(1)
    const attempt = seen.result.attempts[0]!
    if (attempt.kind !== 'cut') throw new Error('268 unknown Ready identity completed')
    expect(attempt.reason).toBe('commandRefused')
    expect(attempt.detail).toBe(message)
    expect(attempt.provenance.filter((row) => row.kind === 'readyAdmitted' || row.kind === 'sweepStarted')).toEqual([])
    expect(seen.calls).toEqual([])
    expect(seen.counts).toEqual({ header: 0, staffing: 0, add: 0, link: 0 })
    expect(state).toEqual(before)
  })

  it('admits Ready A beside B’s genuine active audition, closes its resource-only background before sweep, and never engages audition candidates twice', () => {
    const setup = baseReady(), conceptB = setup.state.concepts[1]!
    expect(conceptB.id).not.toBe(projectById(setup.state, setup.payload.projectId).conceptId)
    let state = applyActions(setup.state, [{ kind: 'commissionScript', project: commissionPayload(conceptB, setup.writerId) }])
    const projectB = state.scriptDevelopment.projects.find((row) => row.conceptId === conceptB.id)
    assert.ok(projectB)
    expect(projectB.status).toBe('drafting')
    state = tick(state)
    expect(projectById(state, projectB.id).status).toBe('review')
    state = applyActions(state, [{ kind: 'acceptScript', projectId: projectB.id }, { kind: 'activateCastingSessions' }])
    const { lead, antagonist, support } = setup.payload.cast
    const slate = { lead: [lead, antagonist], antagonist: [lead, support], support: [antagonist, support] }
    const beforeCasting = clone(state)
    state = applyActions(state, [{ kind: 'startCastingSession', session: { projectId: projectB.id, slate } }])
    expect(state.studio.cash).toBe(beforeCasting.studio.cash)
    expect(state.ledger).toEqual(beforeCasting.ledger)
    expect(state.rngState).toBe(beforeCasting.rngState)
    expect(state.castingSessions.sessions).toHaveLength(1)
    const casting = state.castingSessions.sessions[0]!, now = state.market.tick
    assert.ok(casting.reservation)
    expect(now).toBe(2)
    expect(casting).toMatchObject({ projectId: projectB.id, status: 'auditioning',
      startedWeek: now, dueWeek: now + 1, results: null, slate })
    expect(projectById(state, setup.payload.projectId)).toMatchObject({ status: 'ready', productionId: null })
    expect(projectById(state, projectB.id)).toMatchObject({ status: 'ready', productionId: null })
    expect(state.studio.activeProductions).toEqual([])
    for (const id of [...company(setup.payload), setup.writerId]) expect(busyTalentIds(state).has(id)).toBe(false)
    const choice: Choice = { projectId: setup.payload.projectId, directorId: setup.payload.directorId,
      cast: setup.payload.cast, craftIds: setup.payload.craftIds }
    supported(state, choice)
    const before = clone(state), immediate = applyActions(state, [{ kind: 'greenlightScriptProject', production: setup.payload }])
    const actual = immediate.studio.activeProductions[0]!
    expect(immediate.studio.activeProductions).toHaveLength(1)
    expect(actual.cast).toEqual(choice.cast)
    const slot = immediate.operations.workflows[0]!.reservations[0]!
    expect(slot.facilityId).toBe(casting.reservation.facilityId)
    expect(slot.slot).not.toBe(casting.reservation.slot)
    const real = tick(immediate)
    makeSave(immediate); makeSave(real)
    expect(real.castingSessions.sessions.find((row) => row.id === casting.id))
      .toMatchObject({ status: 'review', dueWeek: null, reservation: null })
    expect(real.castingSessions.sessions.find((row) => row.id === casting.id)!.results).not.toBeNull()
    expect(real.studio.activeProductions[0]!.remainingTicks).toBe(8)
    const value = input(state, choice), seen = observed(value)
    expect(seen.result.attempts).toHaveLength(1)
    const attempt = seen.result.attempts[0]!
    if (attempt.kind !== 'complete') throw new Error(`268 genuine active-audition Ready replay cut: ${attempt.reason}: ${attempt.detail}`)
    expect(seen.result.omissions).toEqual([])
    expect(seen.counts.add).toBe(1)
    expect(seen.counts.link).toBe(1)
    expect(seen.calls).toEqual([{ week: now, ids: [actual.id], before: [8], after: [8] }])
    const own = value.issuerId, castingPath = JSON.stringify(['castingSession', own, casting.id])
    const picturePath = JSON.stringify(['screenplay', own, choice.projectId])
    expect(attempt.trace.paths.map((row) => row.pathKey).sort()).toEqual([
      castingPath, picturePath,
      ...state.sets.filter((row) => row.status === 'standing').map((row) => JSON.stringify(['setMount', own, row.id])),
    ].sort())
    const background = attempt.trace.paths.find((row) => row.pathKey === castingPath)
    assert.ok(background && background.kind === 'jointTraceBackground')
    expect(background.ownerFactRefs.length).toBeGreaterThan(0)
    const castingHolds = seen.result.fixedHolds.filter((row) => row.ownerPathKey === castingPath)
    expect(castingHolds).toHaveLength(1)
    expect(castingHolds[0]!.subject).toEqual({ kind: 'resource',
      resourceKey: JSON.stringify(['facility', own, casting.reservation.facilityId]), slot: casting.reservation.slot })
    expect(castingHolds[0]!.from).toEqual({ week: now, step: 0 })
    expect(castingHolds[0]!.until).toEqual({ week: now + 1, step: 0 })
    expect(seen.result.fixedHolds.filter((row) => row.subject.kind === 'person')).toEqual([])
    const completions = attempt.provenance.filter((row) => row.kind === 'backgroundCompleted')
    expect(completions).toHaveLength(1)
    const completion = completions[0]!
    expect(completion).toMatchObject({ owner: 'castingSession', pathKey: castingPath, dueWeek: now + 1 })
    const sweeps = attempt.provenance.filter((row) => row.kind === 'sweepStarted')
    expect(sweeps).toHaveLength(1)
    expect(completion.at.week).toBe(now)
    expect(completion.at.step).toBeLessThan(sweeps[0]!.at.step)
    expect(sweeps[0]!.externalSlotKeys).not.toContain(`${casting.reservation.facilityId}:${casting.reservation.slot}`)
    expect(attempt.trace.fixedHoldReplacements).toEqual([{ holdId: castingHolds[0]!.holdId, newUntil: completion.at }])
    expect(attempt.trace.additionalHolds).toHaveLength(6)
    expect(attempt.trace.additionalHolds.every((row) => row.ownerPathKey === picturePath)).toBe(true)
    const newPeople = attempt.trace.additionalHolds.filter((row) => row.subject.kind === 'person')
    expect(newPeople.map((row) => row.subject.kind === 'person' ? row.subject.personId : '').sort()).toEqual(company(choice).sort())
    for (const hold of newPeople) {
      expect(hold.from).toEqual({ week: now, step: 1 })
      expect(hold.until).toEqual({ week: now + 1, step: 0 })
    }
    expect(attempt.projection.productions).toEqual([])
    expect(attempt.projection.plannedProductions).toEqual([{
      id: actual.id, projectId: choice.projectId, conceptId: actual.conceptId, writerId: actual.writerId,
      directorId: actual.directorId, cast: actual.cast, craftIds: actual.craftIds, startTick: now, remainingTicks: 8,
    }])
    expect(attempt.projection.week).toBe(real.market.tick)
    expect(attempt.projection.operations).toEqual(real.operations)
    expect(attempt.projection.sets).toEqual(real.sets)
    expect(attempt.projection.releaseAuthority).toEqual(real.releaseAuthority)
    expect(attempt.projection.admissionScriptDevelopment).toEqual(immediate.scriptDevelopment)
    expect(attempt.projection.completedBackgroundPathKeys).toEqual([castingPath])
    expect(attempt.projection.technology.productions.filter((row) => row.studioId === own))
      .toEqual(real.technology.productions.filter((row) => row.studioId === own))
    expect(attempt.projection.technology.productions.filter((row) => row.studioId !== own))
      .toEqual(state.technology.productions.filter((row) => row.studioId !== own))
    expect(attempt.projection).not.toHaveProperty('castingSessions')
    expect(attempt.provenance.filter((row) => row.kind === 'firstTake')).toEqual([])
    expect(state).toEqual(before)
    expect(state.castingSessions.sessions[0]!.status).toBe('auditioning')
    expect(state.castingSessions.sessions[0]!.results).toBeNull()
  })
})
