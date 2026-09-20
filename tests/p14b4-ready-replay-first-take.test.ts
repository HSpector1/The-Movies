// Installed from independently frozen276 (277 qualified KEEP); original inert provenance below retained unchanged.
// INERT / UNEXECUTED. Intended tests/p14b4-ready-replay-first-take.test.ts.
//276: independent240 real Ready → scheduled first take → strictly later horizon.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import { searchPromiseCapacityTraces, type Boundary, type Hold, type JointTraceCapacityInput } from '../src/core/promiseCapacityKernel.js'
import { replayReadyProductionPlans, type ReadyOwnerReplayInput } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production, FacilityReservation } from '../src/core/types.js'
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


type Command = ReadyOwnerReplayInput['plans'][number]['commands'][number]
type OwnerCall =
  | { kind: 'assign'; productionId: string; directorId: string }
  | { kind: 'schedule'; productionId: string }
  | { kind: 'sweep'; week: number; ids: string[]; before: number[]; after: number[]; takes: string[] }

function watchOwners<T>(productionId: string, run: () => T) {
  const calls: OwnerCall[] = []
  const assign = operationsModule.assignShootingDirector, schedule = operationsModule.scheduleShootingTake
  const advance = operationsModule.advanceManagedProductions
  const assignSpy = vi.spyOn(operationsModule, 'assignShootingDirector').mockImplementation((...args) => {
    if (args[1].id === productionId) calls.push({ kind: 'assign', productionId, directorId: args[2] })
    return assign(...args)
  })
  const scheduleSpy = vi.spyOn(operationsModule, 'scheduleShootingTake').mockImplementation((...args) => {
    if (args[1] === productionId) calls.push({ kind: 'schedule', productionId })
    return schedule(...args)
  })
  const sweepSpy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
    const next = advance(...args)
    // Real tick also advances disjoint rivals. Compare only the actual player
    // slate containing this independently allocated ID, never a stubbed result.
    if (args[1].some((row) => row.id === productionId)) calls.push({ kind: 'sweep', week: args[2],
      ids: args[1].map((row) => row.id), before: args[1].map((row) => row.remainingTicks),
      after: next.productions.map((row) => row.remainingTicks), takes: next.firstTakes.map((row) => row.id) })
    return next
  })
  try { return { value: run(), calls } }
  finally { assignSpy.mockRestore(); scheduleSpy.mockRestore(); sweepSpy.mockRestore() }
}

const compareBoundary = (a: Boundary, b: Boundary) => a.week - b.week || a.step - b.step
const subjectKey = (subject: Hold['subject']) => subject.kind === 'person'
  ? JSON.stringify(['person', subject.personId]) : JSON.stringify(['resource', subject.resourceKey, subject.slot])

describe('P14B4 Ready replay — genuine first completed take', () => {
  it('executes real Ready-target director/schedule commands, retains the take inside a half-open horizon and matches actual wrap/holds within the shared cap', () => {
    const { state: source, payload, writerId } = baseReady(), beforeSource = clone(source)
    assert.ok(source.hollywood)
    const own = source.hollywood.playerStudioId, now = source.market.tick
    const choice: Choice = { projectId: payload.projectId, directorId: payload.directorId,
      cast: payload.cast, craftIds: payload.craftIds }
    const immediate = applyActions(source, [{ kind: 'greenlightScriptProject', production: payload }])
    expect(immediate.studio.activeProductions).toHaveLength(1)
    const productionId = immediate.studio.activeProductions[0]!.id, immediateBefore = clone(immediate)
    expect(immediate.studio.activeProductions[0]!).toMatchObject({ startTick: now, remainingTicks: 8 })
    const commands: Command[] = []
    const reservations = new Map<string, Pick<FacilityReservation, 'facilityId' | 'slot' | 'capability'>>()
    let selectedSetId: string | null = null
    const capture = (state: GameState) => {
      supported(state, choice) // strict save + unchanged real root/foreign relevance guards
      const workflow = state.operations.workflows.find((row) => row.productionId === productionId)
      assert.ok(workflow)
      for (const row of workflow.reservations) {
        const key = `${row.facilityId}:${row.slot}`
        const fact = { facilityId: row.facilityId, slot: row.slot, capability: row.capability }
        if (reservations.has(key)) expect(reservations.get(key)).toEqual(fact)
        reservations.set(key, fact)
      }
      if (workflow.bindings.stageFacilityId !== null) {
        assert.ok(workflow.bindings.setId)
        if (selectedSetId !== null) expect(workflow.bindings.setId).toBe(selectedSetId)
        selectedSetId = workflow.bindings.setId
      }
    }
    capture(immediate)
    const reference = watchOwners(productionId, () => {
      let state = immediate
      // Existing real-owner route, not a copied countdown or hand-cleared trip.
      for (let guard = 0; guard < 16 && !state.firstTakes.some((row) => row.productionId === productionId); guard++) {
        const production = state.studio.activeProductions.find((row) => row.id === productionId)
        const workflow = state.operations.workflows.find((row) => row.productionId === productionId)
        assert.ok(production && workflow)
        if (workflow.phase === 'shooting') {
          expect(production.remainingTicks).toBe(5)
          expect(state.firstTakes.filter((row) => row.productionId === productionId)).toEqual([])
          if (workflow.shootingTask?.status === 'unassigned') {
            const ordinal = commands.filter((row) => row.week === state.market.tick).length + (state.market.tick === now ? 1 : 0)
            commands.push({ kind: 'assignLockedDirector', readyProjectId: payload.projectId, week: state.market.tick, ordinal })
            state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId: production.directorId }])
            capture(state)
          }
          const afterDirector = state.operations.workflows.find((row) => row.productionId === productionId)!
          if (afterDirector.shootingTask?.status === 'ready') {
            const ordinal = commands.filter((row) => row.week === state.market.tick).length + (state.market.tick === now ? 1 : 0)
            commands.push({ kind: 'scheduleTake', readyProjectId: payload.projectId, week: state.market.tick, ordinal })
            state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
            expect(state.operations.workflows.find((row) => row.productionId === productionId)?.shootingTask?.status).toBe('scheduled')
            capture(state)
          }
        }
        state = tick(state)
        capture(state)
      }
      const takes = state.firstTakes.filter((row) => row.productionId === productionId)
      expect(takes).toHaveLength(1) // hard finite witness; no missing-scene skip
      const take = takes[0]!
      expect(take.week).toBe(state.market.tick)
      expect(take.studioId).toBe(own)
      expect(take.cast).toEqual(choice.cast)
      expect(state.studio.activeProductions.find((row) => row.id === productionId)?.remainingTicks).toBe(4)
      expect(state.operations.workflows.find((row) => row.productionId === productionId)?.shootingTask?.status).toBe('completed')
      expect(commands.map((row) => row.kind)).toEqual(['assignLockedDirector', 'scheduleTake'])
      expect(take.week).toBe(commands[1]!.week + 1)
      // H MUST exceed the actual event week; this extra real tick also performs wrap.
      const real = tick(state)
      capture(real)
      expect(real.market.tick).toBe(take.week + 1)
      expect(real.studio.activeProductions.find((row) => row.id === productionId)?.remainingTicks).toBe(3)
      expect(real.operations.workflows.find((row) => row.productionId === productionId)?.phase).toBe('postProduction')
      expect(real.firstTakes.filter((row) => row.productionId === productionId)).toEqual([take])
      return { real, take }
    })
    const { real, take } = reference.value, horizon = real.market.tick
    assert.ok(selectedSetId)
    const value: ReadyOwnerReplayInput = { source, issuerId: own, claimPersonIds: [choice.cast.lead],
      plans: [{ traceKey: '276-real-ready-first-take', readyChoice: choice, commands: [...commands].reverse() }],
      horizonEndWeek: horizon, preparationWork: 0, limits: { work: 200000, span: 220, alternatives: 1024 } }
    const beforeInput = clone(value), checked = watchOwners(productionId, () => replayReadyProductionPlans(value))
    expect(value).toEqual(beforeInput)
    expect(source).toEqual(beforeSource)
    expect(immediate).toEqual(immediateBefore)
    const result = checked.value
    expect(result.preparationWork).toBeLessThanOrEqual(200000)
    expect(result.attempts).toHaveLength(1)
    const attempt = result.attempts[0]!
    if (attempt.kind !== 'complete') throw new Error(`276 real first-take Ready replay cut: ${attempt.reason}: ${attempt.detail}`)
    expect(result.omissions).toEqual([])
    expect(checked.calls).toEqual(reference.calls)
    const sweeps = checked.calls.filter((row) => row.kind === 'sweep')
    expect(sweeps.map((row) => row.week)).toEqual(Array.from({ length: horizon - now }, (_, index) => now + index))
    for (const sweep of sweeps) expect(sweep.ids).toEqual([productionId])
    const takeSweeps = sweeps.filter((row) => row.takes.includes(productionId))
    expect(takeSweeps).toEqual([{ kind: 'sweep', week: take.week - 1, ids: [productionId], before: [5], after: [4], takes: [productionId] }])
    const actual = real.studio.activeProductions.find((row) => row.id === productionId)!
    expect(attempt.projection.productions).toEqual([])
    expect(attempt.projection.plannedProductions).toEqual([{
      id: productionId, projectId: payload.projectId, conceptId: actual.conceptId, writerId: actual.writerId,
      directorId: actual.directorId, cast: actual.cast, craftIds: actual.craftIds, startTick: now, remainingTicks: 3,
    }])
    expect(attempt.projection.week).toBe(horizon)
    expect(attempt.projection.operations).toEqual(real.operations)
    expect(attempt.projection.sets).toEqual(real.sets)
    expect(attempt.projection.releaseAuthority).toEqual(real.releaseAuthority)
    expect(attempt.projection.admissionScriptDevelopment).toEqual(immediate.scriptDevelopment)
    expect(attempt.projection.completedBackgroundPathKeys).toEqual([])
    expect(attempt.projection.technology.productions.filter((row) => row.studioId === own))
      .toEqual(real.technology.productions.filter((row) => row.studioId === own))
    expect(attempt.projection.technology.productions.filter((row) => row.studioId !== own))
      .toEqual(source.technology.productions.filter((row) => row.studioId !== own))
    expect(attempt.projection).not.toHaveProperty('firstTakes')
    expect(attempt.provenance.filter((row) => row.kind === 'firstTake')).toEqual([
      { kind: 'firstTake', at: { week: take.week, step: 0 }, productionId },
    ])
    const actualEvents = real.studioEvents.rows.filter((row) => row.seq >= source.studioEvents.nextSeq)
    const events = attempt.provenance.filter((row) => row.kind === 'ownerEvent')
    expect(events.map((row) => ({ week: row.ownerWeek, draft: row.draft })))
      .toEqual(actualEvents.map(({ seq: _seq, week, ...draft }) => ({ week, draft })))
    const picturePath = JSON.stringify(['screenplay', own, payload.projectId])
    const mounts = source.sets.filter((row) => row.status === 'standing')
    expect(attempt.trace.paths.map((row) => row.pathKey).sort()).toEqual([
      picturePath, ...mounts.map((row) => JSON.stringify(['setMount', own, row.id])),
    ].sort())
    const pictures = attempt.trace.paths.filter((row) => row.kind === 'jointTracePicture')
    expect(pictures).toHaveLength(1)
    expect(pictures[0]).toMatchObject({ pathKey: picturePath, existingPath: true, cast: choice.cast,
      greenlight: { week: now, step: 1 }, firstTake: { week: take.week, step: 0 }, personRelease: null,
      additionalHolds: [], holdReplacements: [] })
    expect(pictures[0]!.firstTake!.week).toBeGreaterThanOrEqual(now)
    expect(pictures[0]!.firstTake!.week).toBeLessThan(horizon)
    expect(result.fixedHolds).toHaveLength(mounts.length)
    for (const mount of mounts) {
      const holds = result.fixedHolds.filter((row) => row.ownerPathKey === JSON.stringify(['setMount', own, mount.id]))
      expect(holds).toHaveLength(1)
      expect(holds[0]!.subject).toEqual({ kind: 'resource', resourceKey: JSON.stringify(['mount', own, mount.mountedOn]), slot: 0 })
      expect(holds[0]!.from).toEqual({ week: now, step: 0 })
      expect(holds[0]!.until).toEqual({ week: horizon, step: 0 })
    }
    expect(attempt.trace.fixedHoldReplacements).toEqual([])
    const holds = attempt.trace.additionalHolds
    expect(holds).toHaveLength(10) // five company + four phase capabilities + composite Set
    expect(holds.every((row) => row.ownerPathKey === picturePath)).toBe(true)
    const people = holds.filter((row) => row.subject.kind === 'person')
    expect(people.map((row) => row.subject.kind === 'person' ? row.subject.personId : '').sort()).toEqual(company(choice).sort())
    expect(people.some((row) => row.subject.kind === 'person' && row.subject.personId === writerId)).toBe(false)
    for (const hold of people) {
      expect(hold.from).toEqual({ week: now, step: 1 })
      expect(hold.until).toEqual({ week: horizon, step: 0 })
    }
    const grants = events.filter((row) => row.draft.kind === 'reservationGranted' && row.draft.ownerId === productionId)
    expect(grants).toHaveLength(4)
    const phaseHolds: Hold[] = []
    for (const grant of grants) {
      assert.ok(grant.draft.kind === 'reservationGranted')
      const bare = grant.draft.resourceKey, fact = reservations.get(bare)
      assert.ok(fact, 'actual reference reservation supplies the exact bare-key join')
      const release = events.filter((row) => row.draft.kind === 'reservationReleased' &&
        row.draft.ownerId === productionId && row.draft.resourceKey === bare)
      expect(release).toHaveLength(fact.capability === 'post' ? 0 : 1)
      const matches = holds.filter((row) => row.subject.kind === 'resource' &&
        row.subject.resourceKey === JSON.stringify(['facility', own, fact.facilityId]) && row.subject.slot === fact.slot)
      expect(matches).toHaveLength(1)
      expect(matches[0]!.from).toEqual(grant.at)
      expect(matches[0]!.until).toEqual(release[0]?.at ?? { week: horizon, step: 0 })
      phaseHolds.push(matches[0]!)
    }
    expect([...reservations.values()].map((row) => row.capability).sort()).toEqual(['development-casting', 'post', 'set-scenery', 'soundstage'])
    const stage = [...reservations.values()].find((row) => row.capability === 'soundstage')!
    const stageHold = phaseHolds.find((row) => row.subject.kind === 'resource' &&
      row.subject.resourceKey === JSON.stringify(['facility', own, stage.facilityId]))!
    const setHolds = holds.filter((row) => row.subject.kind === 'resource' && row.subject.resourceKey === JSON.stringify(['set', own, selectedSetId]))
    expect(setHolds).toHaveLength(1)
    expect(setHolds[0]!.subject).toEqual({ kind: 'resource', resourceKey: JSON.stringify(['set', own, selectedSetId]), slot: 0 })
    expect(setHolds[0]!.from).toEqual(stageHold.from)
    expect(setHolds[0]!.until).toEqual(stageHold.until) //186 composite tenancy endpoint
    expect(events.filter((row) => row.draft.kind === 'wrapped').map((row) => row.draft)).toEqual([
      { kind: 'wrapped', productionId, stageFacilityId: stage.facilityId, setId: selectedSetId },
    ])
    const all = [...result.fixedHolds, ...holds]
    expect(new Set(all.map((row) => row.holdId)).size).toBe(all.length)
    for (let left = 0; left < all.length; left++) for (let right = left + 1; right < all.length; right++) {
      const a = all[left]!, b = all[right]!
      if (subjectKey(a.subject) === subjectKey(b.subject)) {
        expect(compareBoundary(a.from, b.until) < 0 && compareBoundary(b.from, a.until) < 0).toBe(false)
      }
    }
    expect(source.promises).toEqual([])
    const kernel: JointTraceCapacityInput = { mode: 'jointOwnerTraces', now: { week: now, step: 0 },
      horizonEndWeek: horizon, issuerId: own,
      target: { promiseId: null, personId: choice.cast.lead, mask: ['lead', 'antagonist', 'support'],
        window: { startWeek: now, dueWeekExclusive: horizon }, state: 'unbound', count: 1, actualQualifiedCount: 0 },
      priorClaims: [], foreignDebits: [], traces: [attempt.trace], fixedHolds: result.fixedHolds,
      coverage: { claimsAndHolds: 'complete', existingCalendars: 'incomplete', allOwnerTraces: 'incomplete',
        omissions: ['one supplied Ready choice and finite commands, not an exhaustive domain'] },
      preparationWork: result.preparationWork, limits: { claims: 32, units: 64, alternatives: 1024, work: 200000, span: 220 } }
    const beforeKernel = clone(kernel), capacity = searchPromiseCapacityTraces(kernel)
    expect(capacity.status).toBe('UNCERTIFIED')
    if (capacity.status !== 'UNCERTIFIED') throw new Error('one real take does not establish B2/slack or exhaustive choices')
    expect(capacity.reason).toBe('domainIncomplete')
    expect(capacity.workUsed).toBeGreaterThan(result.preparationWork)
    expect(capacity.workUsed).toBeLessThanOrEqual(200000)
    expect(kernel).toEqual(beforeKernel)
  })
})
