// INERT / UNEXECUTED. Intended tests/p14b4-ready-owner-replay.test.ts.
// Independent240/241 tranche. No replay implementation was used as an oracle.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds, freelancerMarketIds, isContracted } from '../src/core/employment.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import * as admissionModule from '../src/core/productionAdmission.js'
import { searchPromiseCapacityTraces, type JointTraceCapacityInput } from '../src/core/promiseCapacityKernel.js'
import { replayReadyProductionPlans, type ReadyOwnerReplayInput } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import * as scriptsModule from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, GreenlightScriptProjectPayload, Production } from '../src/core/types.js'
import { commissionPayload, contractedByRole, foundedStudio, projectById,
  remainingPackage, SEED, writingIds } from './_p04a2WriterCreditFixtures.js'
import { freeSlate } from './_m4Fixtures.js'

type Choice = ReadyOwnerReplayInput['plans'][number]['readyChoice']
type Complete = Extract<ReturnType<typeof replayReadyProductionPlans>['attempts'][number], { kind: 'complete' }>
const clone = <T>(value: T): T => structuredClone(value)
const ids = (row: Readonly<{ directorId: string; cast: Readonly<Production['cast']>; craftIds: readonly string[] }>) =>
  [row.directorId, ...Object.values(row.cast), ...row.craftIds]
const path = (kind: string, issuer: string, id: string) => JSON.stringify([kind, issuer, id])

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
  // Proposed company is part of the real relevance join, not caller-certified availability.
  const relevant = new Set([...state.studio.activeProductions.flatMap(ids), ...ids(choice)])
  for (const project of state.scriptDevelopment.projects) if (project.status === 'drafting' || project.status === 'rewriting') {
    for (const id of scriptsModule.scriptProjectWriterIds(project)) relevant.add(id)
  }
  for (const business of state.hollywood.businesses.filter((row) => row.studioId !== own)) {
    expect(business.productions.flatMap(ids).filter((id) => relevant.has(id))).toEqual([])
    for (const ordinal of business.activeScriptOrdinals) {
      const project = business.development.projects[ordinal], costs = business.projects[ordinal]
      assert.ok(project && costs)
      expect(costs.scriptProjectId).toBe(project.id)
      expect(costs.conceptId).toBe(project.conceptId)
      expect(state.hollywood.concepts[costs.conceptOrdinal]?.id).toBe(project.conceptId)
      if (project.status === 'drafting' || project.status === 'rewriting') {
        expect(scriptsModule.scriptProjectWriterIds(project).filter((id) => relevant.has(id))).toEqual([])
      }
    }
  }
  expect(state.technology.projects.filter((row) => row.studioId !== own && row.status === 'active')
    .flatMap((row) => row.seats.filter((seat) => seat.releasedWeek === null && relevant.has(seat.talentId)))).toEqual([])
  makeSave(state)
}

function choiceOf(payload: GreenlightScriptProjectPayload): Choice {
  return { projectId: payload.projectId, directorId: payload.directorId,
    cast: payload.cast, craftIds: payload.craftIds }
}

function baseReady() {
  //200/220's disclosed historical-control founding, real extra hires and actions.
  // Fresh industry is initialized at ACTUAL week0, never restamped after a tick.
  let state = foundedStudio(SEED, { actor: 3, director: 1, craft: 1 })
  expect(state.market.tick).toBe(0)
  state = initializeHollywood(state, 'fresh')
  expect(state.hollywood).toMatchObject({ origin: 'fresh', originWeek: 0 })
  makeSave(state)
  state = applyActions(state, [{ kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }])
  expect(contractedByRole(state, 'writer')).toHaveLength(1)
  expect(contractedByRole(state, 'actor')).toHaveLength(6)
  const writerId = contractedByRole(state, 'writer')[0]!.id, concept = state.concepts[0]!
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(concept, writerId) }])
  const projectId = state.scriptDevelopment.projects[0]!.id
  expect(projectById(state, projectId)).toMatchObject({ status: 'drafting', dueWeek: 1 })
  state = tick(state)
  expect(projectById(state, projectId).status).toBe('review')
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  expect(projectById(state, projectId)).toMatchObject({ status: 'ready', writerId, reservation: null, dueWeek: null })
  expect(projectById(state, projectId).assessment).not.toBeNull()
  expect(state.studio.activeProductions).toEqual([])
  expect(writingIds(state)).toEqual([])
  const payload = { projectId, ...remainingPackage(state, concept) }
  supported(state, choiceOf(payload))
  return { state, payload, writerId }
}

function existingAndReady() {
  let { state, payload: originalPayload, writerId } = baseReady()
  const concept = state.concepts[1]!
  expect(concept.id).not.toBe(projectById(state, originalPayload.projectId).conceptId)
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(concept, writerId) }])
  const nextProject = state.scriptDevelopment.projects.find((row) => row.conceptId === concept.id)
  assert.ok(nextProject)
  expect(writingIds(state)).toEqual([writerId])
  // Actual admission succeeds WHILE the credited writer is writing the second script.
  state = applyActions(state, [{ kind: 'greenlightScriptProject', production: originalPayload }])
  expect(state.studio.activeProductions).toHaveLength(1)
  expect(state.studio.activeProductions[0]!.writerId).toBe(writerId)
  expect(ids(state.studio.activeProductions[0]!)).not.toContain(writerId)
  state = tick(state)
  expect(state.market.tick).toBe(2)
  expect(state.studio.activeProductions[0]!.remainingTicks).toBe(8)
  expect(projectById(state, nextProject.id).status).toBe('review')
  state = applyActions(state, [{ kind: 'acceptScript', projectId: nextProject.id }])
  const payload = { projectId: nextProject.id, ...remainingPackage(state, concept, { actor: 3, director: 1, craft: 1 }) }
  expect(projectById(state, payload.projectId).assessment).not.toBeNull()
  expect(new Set([...ids(state.studio.activeProductions[0]!), ...ids(payload)]).size).toBe(10)
  expect(writingIds(state)).toEqual([])
  expect(busyTalentIds(state).has(writerId)).toBe(false)
  supported(state, choiceOf(payload))
  return { state, payload, writerId, originalPayload }
}

function input(state: GameState, choice: Choice, traceKey = '242-ready'): ReadyOwnerReplayInput {
  assert.ok(state.hollywood)
  return { source: state, issuerId: state.hollywood.playerStudioId,
    claimPersonIds: [choice.cast.lead], plans: [{ traceKey, readyChoice: choice, commands: [] }],
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
  // These are transparent call-through spies, never synthetic results.
  const header = vi.spyOn(admissionModule, 'requireGreenlightHeader')
  const staffing = vi.spyOn(admissionModule, 'resolveGreenlightStaffing')
  const add = vi.spyOn(operationsModule, 'addManagedProductionWorkflow')
  const link = vi.spyOn(scriptsModule, 'linkScriptProjectToProduction')
  try {
    const result = replayReadyProductionPlans(value)
    expect(result.preparationWork).toBeLessThanOrEqual(value.limits.work)
    return { result, calls, headerCalls: header.mock.calls.length, staffingCalls: staffing.mock.calls.length,
      addCalls: add.mock.calls.length, linkCalls: link.mock.calls.length }
  } finally {
    sweep.mockRestore(); header.mockRestore(); staffing.mockRestore(); add.mockRestore(); link.mockRestore()
    expect(value).toEqual(before)
  }
}

function completed(value: ReadyOwnerReplayInput) {
  const seen = observed(value)
  expect(seen.result.attempts).toHaveLength(1)
  const attempt = seen.result.attempts[0]!
  if (attempt.kind !== 'complete') throw new Error(`242 genuine Ready replay cut: ${attempt.reason}: ${attempt.detail}`)
  expect(seen.result.omissions).toEqual([])
  expect(seen.addCalls).toBe(1)
  expect(seen.linkCalls).toBe(1)
  return { ...seen, attempt }
}

function parity(attempt: Complete, source: GameState, immediate: GameState, real: GameState, projectId: string) {
  assert.ok(source.hollywood)
  const own = source.hollywood.playerStudioId, originalIds = new Set(source.studio.activeProductions.map((row) => row.id))
  const added = immediate.studio.activeProductions.filter((row) => !originalIds.has(row.id))
  expect(added).toHaveLength(1)
  const newId = added[0]!.id, now = source.market.tick
  const planned = real.studio.activeProductions.find((row) => row.id === newId)
  assert.ok(planned)
  expect(attempt.projection.week).toBe(real.market.tick)
  expect(attempt.projection.productions).toEqual(real.studio.activeProductions.filter((row) => originalIds.has(row.id)))
  for (const original of source.studio.activeProductions) {
    const projected = attempt.projection.productions.find((row) => row.id === original.id)
    assert.ok(projected)
    for (const key of ['forecastSnapshot', 'participants', 'budget', 'shape', 'promise'] as const) {
      expect(projected[key]).toBe(original[key])
    }
  }
  expect(attempt.projection.plannedProductions).toEqual([{
    id: newId, projectId, conceptId: planned.conceptId, writerId: planned.writerId,
    directorId: planned.directorId, cast: planned.cast, craftIds: planned.craftIds,
    startTick: now, remainingTicks: planned.remainingTicks,
  }])
  expect(attempt.projection.admissionScriptDevelopment).toEqual(immediate.scriptDevelopment)
  expect(attempt.projection.admissionScriptDevelopment).not.toBe(source.scriptDevelopment)
  expect(attempt.projection.admissionScriptDevelopment.projects.find((row) => row.id === projectId))
    .toMatchObject({ status: 'inProduction', productionId: newId })
  expect(attempt.projection.operations).toEqual(real.operations)
  expect(attempt.projection.sets).toEqual(real.sets)
  expect(attempt.projection.releaseAuthority).toEqual(real.releaseAuthority)
  expect(attempt.projection.completedBackgroundPathKeys).toEqual([])
  expect(attempt.projection.technology.productions.filter((row) => row.studioId === own))
    .toEqual(real.technology.productions.filter((row) => row.studioId === own))
  expect(attempt.projection.technology.productions.filter((row) => row.studioId !== own))
    .toEqual(source.technology.productions.filter((row) => row.studioId !== own))
  for (const forbidden of ['state', 'cash', 'ledger', 'films', 'firstTakes', 'scriptDevelopment']) {
    expect(attempt.projection).not.toHaveProperty(forbidden)
  }
  expect(attempt.provenance.filter((row) => row.kind === 'readyAdmitted')).toEqual([
    { kind: 'readyAdmitted', at: { week: now, step: 1 }, projectId, productionId: newId },
  ])
  return planned
}

function refusal(value: ReadyOwnerReplayInput, detail: string, expectedAddCalls = 0) {
  const seen = observed(value)
  expect(seen.result.attempts).toHaveLength(1)
  const attempt = seen.result.attempts[0]!
  if (attempt.kind !== 'cut') throw new Error('242 refused Ready choice unexpectedly completed')
  expect(attempt.reason).toBe('commandRefused')
  expect(attempt.detail).toContain(detail)
  expect(attempt.provenance.some((row) => row.kind === 'readyAdmitted')).toBe(false)
  expect(seen.calls).toEqual([])
  expect(seen.addCalls).toBe(expectedAddCalls)
  expect(seen.linkCalls).toBe(0)
  return seen
}

describe('P14B4 source-now Ready operational admission', () => {
  it('admits a genuine Ready beside the whole original slate, preserves opaque original fields, and feeds the same capped kernel', () => {
    const { state, payload, writerId } = existingAndReady(), choice = choiceOf(payload)
    const immediate = applyActions(state, [{ kind: 'greenlightScriptProject', production: payload }]), real = tick(immediate)
    makeSave(immediate); makeSave(real)
    expect(immediate.studio.activeProductions.map((row) => row.remainingTicks)).toEqual([8, 8])
    expect(real.studio.activeProductions.map((row) => row.remainingTicks)).toEqual([7, 8])
    const value = input(state, choice), { result, attempt, calls } = completed(value)
    const planned = parity(attempt, state, immediate, real, payload.projectId)
    expect(calls).toEqual([{ week: state.market.tick, ids: immediate.studio.activeProductions.map((row) => row.id),
      before: [8, 8], after: [7, 8] }])
    const actualEvents = real.studioEvents.rows.filter((row) => row.seq >= state.studioEvents.nextSeq)
    expect(actualEvents.map((row) => row.kind)).toEqual(['reservationGranted', 'phaseEntered', 'phaseEntered'])
    expect(attempt.provenance.filter((row) => row.kind === 'ownerEvent')
      .map((row) => ({ week: row.ownerWeek, draft: row.draft })))
      .toEqual(actualEvents.map(({ seq: _seq, week, ...draft }) => ({ week, draft })))
    const own = value.issuerId, now = state.market.tick, horizon = value.horizonEndWeek
    const newPath = path('screenplay', own, payload.projectId), old = state.studio.activeProductions[0]!
    const oldPath = path('production', own, old.id), mounts = state.sets.filter((row) => row.status === 'standing')
    expect(now).toBe(2)
    expect(old.startTick).toBe(1)
    expect(attempt.trace.paths.map((row) => row.pathKey).sort()).toEqual([
      oldPath, newPath, ...mounts.map((row) => path('setMount', own, row.id)),
    ].sort())
    const pictures = attempt.trace.paths.filter((row) => row.kind === 'jointTracePicture')
    expect(pictures).toHaveLength(2)
    for (const picture of pictures) {
      expect(picture.existingPath).toBe(true)
      expect(picture.firstTake).toBeNull()
      expect(picture.personRelease).toBeNull()
      expect(picture.additionalHolds).toEqual([])
      expect(picture.holdReplacements).toEqual([])
      expect(picture.ownerFactRefs.length).toBeGreaterThan(0)
    }
    expect(pictures.find((row) => row.pathKey === newPath)).toMatchObject({ cast: choice.cast, greenlight: { week: now, step: 1 } })
    expect(pictures.find((row) => row.pathKey === oldPath)).toMatchObject({ cast: old.cast, greenlight: { week: old.startTick, step: 0 } })
    expect(result.fixedHolds).toHaveLength(6 + mounts.length)
    expect(result.fixedHolds.some((row) => row.ownerPathKey === newPath)).toBe(false)
    const oldHolds = result.fixedHolds.filter((row) => row.ownerPathKey === oldPath)
    expect(oldHolds.filter((row) => row.subject.kind === 'person').map((row) => row.subject.kind === 'person' ? row.subject.personId : '').sort())
      .toEqual(ids(old).sort())
    const oldSlot = state.operations.workflows.find((row) => row.productionId === old.id)!.reservations[0]!
    expect(oldHolds.filter((row) => row.subject.kind === 'resource').map((row) => row.subject)).toEqual([
      { kind: 'resource', resourceKey: path('facility', own, oldSlot.facilityId), slot: oldSlot.slot },
    ])
    for (const mount of mounts) {
      const holds = result.fixedHolds.filter((row) => row.ownerPathKey === path('setMount', own, mount.id))
      expect(holds).toHaveLength(1)
      expect(holds[0]!.subject).toEqual({ kind: 'resource', resourceKey: path('mount', own, mount.mountedOn!), slot: 0 })
    }
    for (const hold of result.fixedHolds) {
      expect(hold.from).toEqual({ week: now, step: 0 })
      expect(hold.until).toEqual({ week: horizon, step: 0 })
    }
    expect(attempt.trace.fixedHoldReplacements).toEqual([])
    expect(attempt.trace.additionalHolds).toHaveLength(6)
    expect(attempt.trace.additionalHolds.every((row) => row.ownerPathKey === newPath)).toBe(true)
    const personHolds = attempt.trace.additionalHolds.filter((row) => row.subject.kind === 'person')
    expect(personHolds.map((row) => row.subject.kind === 'person' ? row.subject.personId : '').sort()).toEqual(ids(choice).sort())
    for (const hold of personHolds) expect(hold.from).toEqual({ week: now, step: 1 })
    const newSlot = immediate.operations.workflows.find((row) => row.productionId === planned.id)!.reservations[0]!
    expect(newSlot.facilityId).toBe(oldSlot.facilityId)
    expect(newSlot.slot).not.toBe(oldSlot.slot)
    const grant = attempt.provenance.find((row) => row.kind === 'ownerEvent' &&
      row.draft.kind === 'reservationGranted' && row.draft.ownerId === planned.id)
    assert.ok(grant && grant.kind === 'ownerEvent')
    const resourceHolds = attempt.trace.additionalHolds.filter((row) => row.subject.kind === 'resource')
    expect(resourceHolds.map((row) => row.subject)).toEqual([
      { kind: 'resource', resourceKey: path('facility', own, newSlot.facilityId), slot: newSlot.slot },
    ])
    expect(resourceHolds[0]!.from).toEqual(grant.at)
    for (const hold of attempt.trace.additionalHolds) expect(hold.until).toEqual({ week: horizon, step: 0 })
    const allHolds = [...result.fixedHolds, ...attempt.trace.additionalHolds]
    expect(new Set(allHolds.map((row) => row.holdId)).size).toBe(allHolds.length)
    expect(allHolds.some((row) => row.subject.kind === 'person' && row.subject.personId === writerId)).toBe(false)
    const sweep = attempt.provenance.find((row) => row.kind === 'sweepStarted')
    assert.ok(sweep && sweep.kind === 'sweepStarted')
    expect(grant.at.week).toBe(now)
    expect(grant.at.step).toBeLessThan(sweep.at.step)
    // This early genuine world must have no prior claims/debits, not merely no target root.
    expect(state.promises).toEqual([])
    const kernel: JointTraceCapacityInput = {
      mode: 'jointOwnerTraces', now: { week: now, step: 0 }, horizonEndWeek: horizon, issuerId: own,
      target: { promiseId: null, personId: choice.cast.lead, mask: ['lead', 'antagonist', 'support'],
        window: { startWeek: now, dueWeekExclusive: horizon }, state: 'unbound', count: 1, actualQualifiedCount: 0 },
      priorClaims: [], foreignDebits: [], traces: [attempt.trace], fixedHolds: result.fixedHolds,
      coverage: { claimsAndHolds: 'complete', existingCalendars: 'incomplete', allOwnerTraces: 'incomplete',
        omissions: ['one explicit Ready staffing plan; no future command enumeration'] },
      preparationWork: result.preparationWork,
      limits: { claims: 32, units: 64, alternatives: 1024, work: 200000, span: 220 },
    }
    const beforeKernel = clone(kernel), capacity = searchPromiseCapacityTraces(kernel)
    expect(kernel).toEqual(beforeKernel)
    expect(capacity).toMatchObject({ status: 'UNCERTIFIED', reason: 'domainIncomplete' })
    expect(capacity.workUsed).toBeGreaterThan(result.preparationWork)
    expect(capacity.workUsed).toBeLessThanOrEqual(200000)
  })

  it('allows independent sibling staffings of the SAME Ready project and SAME would-be identity without cross-branch consumption', () => {
    const { state, payload } = baseReady(), first = choiceOf(payload)
    const second: Choice = { ...first, cast: { ...first.cast, lead: first.cast.antagonist, antagonist: first.cast.lead } }
    supported(state, second)
    const value: ReadyOwnerReplayInput = { ...input(state, first), preparationWork: 17, plans: [
      { traceKey: '242-sibling-b', readyChoice: second, commands: [] },
      { traceKey: '242-sibling-a', readyChoice: first, commands: [] },
    ] }
    const seen = observed(value)
    expect(seen.result.omissions).toEqual([])
    expect(seen.result.attempts).toHaveLength(2)
    expect(seen.addCalls).toBe(2)
    expect(seen.linkCalls).toBe(2)
    const complete: Complete[] = []
    for (const attempt of seen.result.attempts) {
      if (attempt.kind !== 'complete') throw new Error(`242 sibling cut: ${attempt.reason}: ${attempt.detail}`)
      const selected = attempt.trace.traceKey === '242-sibling-a' ? first : second
      const immediate = applyActions(state, [{ kind: 'greenlightScriptProject', production: {
        ...payload, ...selected, cast: { ...selected.cast }, craftIds: [...selected.craftIds],
      } }])
      const real = tick(immediate)
      makeSave(immediate); makeSave(real)
      parity(attempt, state, immediate, real, payload.projectId)
      expect(attempt.projection.productions).toEqual([])
      expect(attempt.projection.plannedProductions[0]!.cast).toEqual(selected.cast)
      expect(attempt.trace.additionalHolds).toHaveLength(6)
      complete.push(attempt)
    }
    expect(complete.map((row) => row.trace.traceKey)).toEqual(['242-sibling-a', '242-sibling-b'])
    expect(complete[0]!.projection.plannedProductions[0]!.id).toBe(complete[1]!.projection.plannedProductions[0]!.id)
    expect(complete[0]!.projection.plannedProductions[0]).not.toBe(complete[1]!.projection.plannedProductions[0])
    expect(complete[0]!.projection.operations).not.toBe(complete[1]!.projection.operations)
    expect(complete[0]!.projection.admissionScriptDevelopment).not.toBe(complete[1]!.projection.admissionScriptDevelopment)
    expect(seen.result.fixedHolds.every((row) => row.subject.kind === 'resource')).toBe(true)
    expect(observed({ ...value, plans: [...value.plans].reverse() }).result).toEqual(seen.result)
    const zeroOffset = observed({ ...value, preparationWork: 0 }).result
    expect(seen.result.preparationWork).toBe(zeroOffset.preparationWork + 17)
    expect(seen.result.attempts).toEqual(zeroOffset.attempts)
    expect(seen.result.fixedHolds).toEqual(zeroOffset.fixedHolds)
  })

  it('refuses occupied source-now Development rather than inventing a queued or later admission; credited writer work is not company occupancy', () => {
    const setup = existingAndReady(), concept = setup.state.concepts[2]!
    const state = applyActions(setup.state, [{ kind: 'commissionScript', project: commissionPayload(concept, setup.writerId) }])
    const writing = state.scriptDevelopment.projects.find((row) => row.conceptId === concept.id)
    assert.ok(writing && writing.reservation)
    expect(writing.status).toBe('drafting')
    expect(writingIds(state)).toEqual([setup.writerId])
    expect(ids(setup.payload)).not.toContain(setup.writerId)
    const originalSlot = state.operations.workflows[0]!.reservations[0]!
    expect(writing.reservation.facilityId).toBe(originalSlot.facilityId)
    expect(writing.reservation.slot).not.toBe(originalSlot.slot)
    supported(state, choiceOf(setup.payload))
    const queued = applyActions(state, [{ kind: 'greenlightScriptProject', production: setup.payload }])
    makeSave(queued)
    expect(queued.productionQueue).toHaveLength(1)
    expect(queued.studio.activeProductions).toEqual(state.studio.activeProductions)
    expect(projectById(queued, setup.payload.projectId).status).toBe('ready')
    const seen = refusal(input(state, choiceOf(setup.payload)), 'no development-casting capacity', 1)
    expect(seen.headerCalls).toBeGreaterThan(0)
    expect(seen.staffingCalls).toBeGreaterThan(0)
    expect(state.productionQueue).toEqual([])
  })

  it('refuses a genuine unfinished audition before allocation and preserves its actual reserved slot', () => {
    const setup = existingAndReady()
    let state = applyActions(setup.state, [{ kind: 'activateCastingSessions' }])
    state = applyActions(state, [{ kind: 'startCastingSession', session: freeSlate(state, setup.payload.projectId) }])
    const session = state.castingSessions.sessions.find((row) => row.projectId === setup.payload.projectId)
    assert.ok(session && session.reservation)
    expect(session.status).toBe('auditioning')
    supported(state, choiceOf(setup.payload))
    const message = `casting session "${session.id}" must be reviewed and acknowledged first`
    expect(() => applyActions(state, [{ kind: 'greenlightScriptProject', production: setup.payload }])).toThrow(message)
    refusal(input(state, choiceOf(setup.payload)), message)
  })

  it('uses actual source-now employment and freelancer-market facts instead of treating every idle uncontracted actor as available', () => {
    const { state, payload } = baseReady(), market = freelancerMarketIds(state), busy = busyTalentIds(state)
    const outsider = state.talent.find((row) => row.role === 'actor' && !isContracted(state, row.id) &&
      !market.includes(row.id) && !busy.has(row.id) && !ids(payload).includes(row.id))
    assert.ok(outsider, '242 UNEXECUTED guard: actual non-market idle actor must exist')
    const illegal = { ...payload, cast: { ...payload.cast, support: outsider.id } }
    supported(state, choiceOf(illegal))
    expect(outsider.skills.acting).toBeDefined()
    const message = `talent "${outsider.id}" is neither studio-contracted nor an available freelancer`
    expect(() => applyActions(state, [{ kind: 'greenlightScriptProject', production: illegal }])).toThrow(message)
    refusal(input(state, choiceOf(illegal)), message)
  })

  it('refuses a genuinely already-linked project, not legal reuse across independent sibling plans', () => {
    const { state, originalPayload } = existingAndReady()
    expect(projectById(state, originalPayload.projectId)).toMatchObject({ status: 'inProduction', productionId: state.studio.activeProductions[0]!.id })
    supported(state, choiceOf(originalPayload))
    expect(() => applyActions(state, [{ kind: 'greenlightScriptProject', production: originalPayload }]))
      .toThrow('authoritative Ready script project')
    refusal(input(state, choiceOf(originalPayload)), 'authoritative Ready script project')
  })

  it('cuts zero and tiny shared budgets before invoking admission, linking or sweep owners', () => {
    const { state, payload } = baseReady(), base = input(state, choiceOf(payload))
    for (const work of [0, 1]) {
      const seen = observed({ ...base, limits: { ...base.limits, work } })
      expect(seen.result.preparationWork).toBe(work)
      expect(seen.result.attempts.some((row) => row.kind === 'complete')).toBe(false)
      if (work === 0) {
        expect(seen.result.fixedHolds).toEqual([])
        expect(seen.result.attempts).toEqual([])
      }
      expect(seen.result.omissions.length).toBeGreaterThan(0)
      expect(seen.headerCalls).toBe(0)
      expect(seen.staffingCalls).toBe(0)
      expect(seen.addCalls).toBe(0)
      expect(seen.linkCalls).toBe(0)
      expect(seen.calls).toEqual([])
    }
  })
})
