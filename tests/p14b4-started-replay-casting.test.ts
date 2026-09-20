// Installed from independently frozen199; original inert provenance below retained unchanged.
// INERT / UNEXECUTED. Intended tests/p14b4-started-replay-casting.test.ts.
// Independent active-casting supplement;137/176 API, no replay implementation oracle.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds } from '../src/core/employment.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import { replayStartedProductionPlans, type StartedOwnerReplayInput } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave } from '../src/core/save.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production, StartCastingSessionPayload } from '../src/core/types.js'
import { commissionPayload, contractedByRole, foundedStudio, greenlightA, projectById,
  remainingPackage, SEED, writingIds, type Scenario } from './_p04a2WriterCreditFixtures.js'

const clone = <T>(value: T): T => structuredClone(value)
const company = (rows: readonly Production[]) => new Set(rows.flatMap((row) =>
  [row.directorId, ...Object.values(row.cast), ...row.craftIds]))

function supported(state: GameState) {
  assert.ok(state.hollywood)
  const own = state.hollywood.playerStudioId
  expect(state.founding).toBeNull()
  expect(state.operations.mode).toBe('managed')
  expect(state.productionQueue).toEqual([])
  expect(state.physicalPlans.plans.filter((row) => row.studioId === own &&
    (row.status === 'queued' || row.status === 'held' || row.status === 'blocked'))).toEqual([])
  expect(state.construction.projects.filter((row) => row.status === 'building')).toEqual([])
  expect(state.placement.facilities.filter((row) => row.status === 'underConstruction')).toEqual([])
  expect(state.sets.filter((row) => row.status === 'under-construction')).toEqual([])
  expect(state.technology.projects.filter((row) => row.studioId === own && row.status === 'active')).toEqual([])
  expect(state.technology.adoptions.filter((row) => row.studioId === own &&
    row.cancelledWeek === null && row.operationalWeek === null)).toEqual([])
  const relevant = company(state.studio.activeProductions)
  for (const project of state.scriptDevelopment.projects) if (project.status === 'drafting' || project.status === 'rewriting') {
    for (const id of scriptProjectWriterIds(project)) relevant.add(id)
  }
  for (const business of state.hollywood.businesses.filter((row) => row.studioId !== own)) {
    expect([...company(business.productions)].filter((id) => relevant.has(id))).toEqual([])
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

function freshScenario(): Scenario {
  // Preserve the historical-control founding/action recipe, but initialize the
  // FRESH industry at its actual week-zero boundary, before any script ticks.
  let state = foundedStudio(SEED)
  expect(state.market.tick).toBe(0)
  state = initializeHollywood(state, 'fresh')
  expect(state.hollywood).toMatchObject({ origin: 'fresh', originWeek: 0 })
  makeSave(state)
  state = applyActions(state, [{ kind: 'activateStudioOperations' }, { kind: 'activateScriptDevelopment' }])
  const writers = contractedByRole(state, 'writer')
  expect(writers).toHaveLength(1)
  const writerId = writers[0]!.id, conceptA = state.concepts[0]!, conceptB = state.concepts[1]!
  expect(conceptB.id).not.toBe(conceptA.id)
  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(conceptA, writerId) }])
  const projectAId = state.scriptDevelopment.projects[0]!.id
  expect(projectById(state, projectAId).status).toBe('drafting')
  expect(writingIds(state)).toContain(writerId)
  state = tick(state)
  expect(projectById(state, projectAId).status).toBe('review')
  state = applyActions(state, [{ kind: 'acceptScript', projectId: projectAId }])
  expect(projectById(state, projectAId)).toMatchObject({ status: 'ready', writerId, reservation: null, dueWeek: null })
  expect(writingIds(state)).not.toContain(writerId)
  const readyOnly = state
  const deadlock = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(conceptB, writerId) }])
  const projectB = deadlock.scriptDevelopment.projects.find((row) => row.conceptId === conceptB.id)
  assert.ok(projectB)
  expect(projectB.status).toBe('drafting')
  expect(writingIds(deadlock)).toContain(writerId)
  makeSave(readyOnly); makeSave(deadlock)
  return { readyOnly, deadlock, writerId, projectAId, projectBId: projectB.id,
    conceptA, conceptB, packageA: remainingPackage(deadlock, conceptA) }
}

function fixture() {
  // Historical-control founder, actual commissions/hires/ticks, no fabricated Ready root.
  const scenario = freshScenario()
  let state = tick(scenario.deadlock)
  expect(projectById(state, scenario.projectBId).status).toBe('review')
  state = applyActions(state, [{ kind: 'acceptScript', projectId: scenario.projectBId },
    { kind: 'activateCastingSessions' }])
  expect(projectById(state, scenario.projectAId).status).toBe('ready')
  expect(projectById(state, scenario.projectBId).status).toBe('ready')
  const { lead, antagonist, support } = scenario.packageA.cast
  expect(new Set([lead, antagonist, support]).size).toBe(3)
  const session: StartCastingSessionPayload = { projectId: scenario.projectBId, slate: {
    lead: [lead, antagonist], antagonist: [lead, support], support: [antagonist, support],
  } }
  for (const id of [lead, antagonist, support, scenario.writerId]) expect(busyTalentIds(state).has(id)).toBe(false)
  const cash = state.studio.cash, rng = state.rngState, ledger = clone(state.ledger)
  state = applyActions(state, [{ kind: 'startCastingSession', session }])
  expect(state.studio.cash).toBe(cash)
  expect(state.rngState).toBe(rng)
  expect(state.ledger).toEqual(ledger)
  // Existing casting law engages NO candidate. This real subsequent action proves it.
  for (const id of [lead, antagonist, support, scenario.writerId]) expect(busyTalentIds(state).has(id)).toBe(false)
  state = applyActions(state, [greenlightA(scenario)])
  supported(state)
  assert.ok(state.hollywood)
  expect(state.studio.activeProductions).toHaveLength(1)
  expect(state.castingSessions.sessions).toHaveLength(1)
  const production = state.studio.activeProductions[0]!, casting = state.castingSessions.sessions[0]!
  const workflow = state.operations.workflows[0]!, week = state.market.tick
  expect(state.operations.workflows).toHaveLength(1)
  expect(projectById(state, scenario.projectAId)).toMatchObject({ status: 'inProduction', productionId: production.id })
  expect(projectById(state, scenario.projectBId).status).toBe('ready')
  expect(production.cast).toEqual(scenario.packageA.cast)
  expect(production.writerId).toBe(scenario.writerId)
  expect(production.startTick).toBe(week)
  expect(production.remainingTicks).toBe(8)
  expect(casting).toMatchObject({ projectId: scenario.projectBId, status: 'auditioning',
    startedWeek: week, dueWeek: week + 1, results: null, slate: session.slate })
  assert.ok(casting.reservation)
  expect(workflow.reservations).toHaveLength(1)
  const slot = workflow.reservations[0]!
  expect(slot.capability).toBe('development-casting')
  expect(slot.phase).toBe('development')
  expect(slot.facilityId).toBe(casting.reservation.facilityId)
  expect(slot.slot).not.toBe(casting.reservation.slot)
  expect(company([production]).size).toBe(5)
  expect(company([production]).has(scenario.writerId)).toBe(false)
  expect(busyTalentIds(state).has(scenario.writerId)).toBe(false)
  for (const id of [lead, antagonist, support]) expect(busyTalentIds(state).has(id)).toBe(true)
  return { state, production, casting, slot, week, own: state.hollywood.playerStudioId, writer: scenario.writerId }
}

function replay(state: GameState, weeks: 0 | 1) {
  assert.ok(state.hollywood)
  const value: StartedOwnerReplayInput<Production> = { source: {
    technology: state.technology, market: { tick: state.market.tick }, placement: state.placement,
    property: state.property, hollywood: state.hollywood, operations: state.operations, sets: state.sets,
    releaseAuthority: state.releaseAuthority, scriptDevelopment: state.scriptDevelopment,
    castingSessions: state.castingSessions, construction: state.construction, physicalPlans: state.physicalPlans,
    productionQueue: state.productionQueue, founding: state.founding, firstTakes: state.firstTakes,
    concepts: state.concepts, studio: { activeProductions: state.studio.activeProductions },
  }, issuerId: state.hollywood.playerStudioId, claimPersonIds: [state.studio.activeProductions[0]!.cast.lead],
  plans: [{ traceKey: '199-actual-auditions', commands: [] }], horizonEndWeek: state.market.tick + weeks,
  preparationWork: 0, limits: { work: 200000, span: 220, alternatives: 1024 } }
  const before = clone(state), beforeInput = clone(value), original = operationsModule.advanceManagedProductions
  const calls: { week: number; ids: string[]; before: number[]; after: number[] }[] = []
  const spy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
    const result = original(...args)
    calls.push({ week: args[2], ids: args[1].map((row) => row.id),
      before: args[1].map((row) => row.remainingTicks), after: result.productions.map((row) => row.remainingTicks) })
    return result
  })
  try {
    const result = replayStartedProductionPlans(value)
    expect(state).toEqual(before)
    expect(value).toEqual(beforeInput)
    expect(result.preparationWork).toBeLessThanOrEqual(200000)
    expect(result.attempts).toHaveLength(1)
    const attempt = result.attempts[0]!
    if (attempt.kind !== 'complete') throw new Error(`199 genuine casting replay cut: ${attempt.reason}: ${attempt.detail}`)
    expect(result.omissions).toEqual([])
    return { result, attempt, calls }
  } finally { spy.mockRestore() }
}

function ledger(f: ReturnType<typeof fixture>, checked: ReturnType<typeof replay>, weeks: 0 | 1) {
  const { state, own, production, casting, writer, week } = f
  assert.ok(casting.reservation)
  const picturePath = JSON.stringify(['production', own, production.id])
  const castingPath = JSON.stringify(['castingSession', own, casting.id])
  expect(checked.attempt.trace.paths.map((row) => row.pathKey).sort()).toEqual([picturePath, castingPath,
    ...state.sets.filter((row) => row.status === 'standing').map((row) => JSON.stringify(['setMount', own, row.id]))].sort())
  const background = checked.attempt.trace.paths.find((row) => row.pathKey === castingPath)
  assert.ok(background && background.kind === 'jointTraceBackground')
  expect(background.ownerFactRefs.length).toBeGreaterThan(0)
  const holds = checked.result.fixedHolds.filter((row) => row.ownerPathKey === castingPath)
  expect(holds).toHaveLength(1)
  expect(holds[0]!.subject).toEqual({ kind: 'resource',
    resourceKey: JSON.stringify(['facility', own, casting.reservation.facilityId]), slot: casting.reservation.slot })
  const people = checked.result.fixedHolds.filter((row) => row.subject.kind === 'person')
  expect(people.flatMap((row) => row.subject.kind === 'person' ? [row.subject.personId] : []).sort())
    .toEqual([...company([production])].sort())
  expect(people.every((row) => row.ownerPathKey === picturePath)).toBe(true)
  expect(people.some((row) => row.subject.kind === 'person' && row.subject.personId === writer)).toBe(false)
  for (const hold of checked.result.fixedHolds) {
    expect(hold.from).toEqual({ week, step: 0 })
    expect(hold.until).toEqual({ week: week + weeks, step: 0 })
  }
  expect(checked.attempt.trace.additionalHolds).toEqual([])
  return { castingPath, castingHold: holds[0]! }
}

describe('P14B4 real active auditions in started-owner replay', () => {
  it('keeps the exact original audition slot at zero horizon, without candidate or credited-writer person holds', () => {
    const f = fixture(), checked = replay(f.state, 0)
    ledger(f, checked, 0)
    expect(checked.calls).toEqual([])
    expect(checked.attempt.provenance).toEqual([])
    expect(checked.attempt.trace.fixedHoldReplacements).toEqual([])
    expect(checked.attempt.projection.week).toBe(f.week)
    expect(checked.attempt.projection.productions).toEqual(f.state.studio.activeProductions)
    expect(checked.attempt.projection.operations).toEqual(f.state.operations)
    expect(checked.attempt.projection.sets).toEqual(f.state.sets)
    expect(checked.attempt.projection.technology).toEqual(f.state.technology)
    expect(checked.attempt.projection.releaseAuthority).toEqual(f.state.releaseAuthority)
    expect(checked.attempt.projection.completedBackgroundPathKeys).toEqual([])
  })

  it('closes only the due audition slot before the real sweep; the overlapping candidates remain A company', () => {
    const f = fixture(), before = clone(f.state), real = tick(f.state)
    const reviewed = real.castingSessions.sessions.find((row) => row.id === f.casting.id)!
    expect(reviewed).toMatchObject({ status: 'review', dueWeek: null, reservation: null })
    expect(reviewed.results).not.toBeNull()
    expect(projectById(real, f.casting.projectId).status).toBe('ready')
    expect(real.studio.activeProductions[0]?.remainingTicks).toBe(8)
    expect(real.operations.workflows[0]?.reservations).toEqual([f.slot])
    makeSave(real)
    const checked = replay(f.state, 1), { castingPath, castingHold } = ledger(f, checked, 1)
    expect(checked.calls).toEqual([{ week: f.week, ids: [f.production.id], before: [8], after: [8] }])
    const completed = checked.attempt.provenance.filter((row) => row.kind === 'backgroundCompleted')
    expect(completed).toHaveLength(1)
    const completion = completed[0]!
    expect(completion).toMatchObject({ owner: 'castingSession', pathKey: castingPath, dueWeek: f.week + 1 })
    expect(completion.at.week).toBe(f.week)
    const sweeps = checked.attempt.provenance.filter((row) => row.kind === 'sweepStarted')
    expect(sweeps).toHaveLength(1)
    expect(sweeps[0]!.at.week).toBe(f.week)
    expect(completion.at.step).toBeLessThan(sweeps[0]!.at.step)
    assert.ok(f.casting.reservation)
    expect(sweeps[0]!.externalSlotKeys).not.toContain(`${f.casting.reservation.facilityId}:${f.casting.reservation.slot}`)
    expect(checked.attempt.trace.fixedHoldReplacements).toEqual([{ holdId: castingHold.holdId, newUntil: completion.at }])
    const projected = checked.attempt.projection
    expect(projected.week).toBe(real.market.tick)
    expect(projected.productions).toEqual(real.studio.activeProductions)
    expect(projected.operations).toEqual(real.operations)
    expect(projected.sets).toEqual(real.sets)
    expect(projected.releaseAuthority).toEqual(real.releaseAuthority)
    expect(projected.technology.productions.filter((row) => row.studioId === f.own))
      .toEqual(real.technology.productions.filter((row) => row.studioId === f.own))
    expect(projected.technology.productions.filter((row) => row.studioId !== f.own))
      .toEqual(f.state.technology.productions.filter((row) => row.studioId !== f.own))
    expect(projected.completedBackgroundPathKeys).toEqual([castingPath])
    expect(projected).not.toHaveProperty('castingSessions') // no fabricated Review/results root
    expect(checked.attempt.provenance.filter((row) => row.kind === 'firstTake')).toEqual([])
    expect(f.state).toEqual(before)
    expect(f.state.castingSessions.sessions[0]?.results).toBeNull()
    expect(f.state.castingSessions.sessions[0]?.status).toBe('auditioning')
  })
})
