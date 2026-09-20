// INERT / UNEXECUTED. Intended tests/p14b4-ready-replay-stale-target.test.ts.
//302: independent240 current-branch resolution after REAL Ready-picture release.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as operationsModule from '../src/core/operations.js'
import { replayReadyProductionPlans, type ReadyOwnerReplayInput } from '../src/core/promiseCapacityOwnerReplay.js'
import * as releaseModule from '../src/core/releaseAuthority.js'
import { makeSave } from '../src/core/save.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production, StudioOperations, StudioSet, StudioReleaseAuthority } from '../src/core/types.js'
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
  | { kind: 'commit'; productionId: string; week: number; authority: StudioReleaseAuthority }
  | { kind: 'prune'; productionId: string; authority: StudioReleaseAuthority }
  | { kind: 'sweep'; week: number; ids: string[]; before: number[]; after: number[];
      takes: string[]; admitted: readonly string[]; operations: StudioOperations; sets: readonly StudioSet[] }

function watchOwners<T>(productionId: string, run: () => T) {
  const calls: OwnerCall[] = []
  const assign = operationsModule.assignShootingDirector, schedule = operationsModule.scheduleShootingTake
  const advance = operationsModule.advanceManagedProductions
  const commit = releaseModule.withReleaseCommitment, prune = releaseModule.pruneReleasedCommitments
  const assignSpy = vi.spyOn(operationsModule, 'assignShootingDirector').mockImplementation((...args) => {
    if (args[1].id === productionId) calls.push({ kind: 'assign', productionId, directorId: args[2] })
    return assign(...args)
  })
  const scheduleSpy = vi.spyOn(operationsModule, 'scheduleShootingTake').mockImplementation((...args) => {
    if (args[1] === productionId) calls.push({ kind: 'schedule', productionId })
    return schedule(...args)
  })
  const commitSpy = vi.spyOn(releaseModule, 'withReleaseCommitment').mockImplementation((...args) => {
    const next = commit(...args)
    if (args[1] === productionId) calls.push({ kind: 'commit', productionId, week: args[2], authority: clone(next) })
    return next
  })
  const pruneSpy = vi.spyOn(releaseModule, 'pruneReleasedCommitments').mockImplementation((...args) => {
    const next = prune(...args)
    if (args[1].has(productionId)) calls.push({ kind: 'prune', productionId, authority: clone(next) })
    return next
  })
  const sweepSpy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
    const next = advance(...args)
    // Record the whole player slate containing the independently allocated ID.
    // Actual rival calls still run but are not this selected issuer's oracle.
    if (args[1].some((row) => row.id === productionId)) calls.push({
      kind: 'sweep', week: args[2], ids: args[1].map((row) => row.id),
      before: args[1].map((row) => row.remainingTicks), after: next.productions.map((row) => row.remainingTicks),
      takes: next.firstTakes.map((row) => row.id), admitted: [...next.admittedReleaseIds],
      operations: clone(next.operations), sets: clone(next.sets),
    })
    return next
  })
  try { return { value: run(), calls } }
  finally {
    assignSpy.mockRestore(); scheduleSpy.mockRestore(); sweepSpy.mockRestore()
    commitSpy.mockRestore(); pruneSpy.mockRestore()
  }
}

describe('P14B4 Ready replay — stale Ready target after genuine release', () => {
  it('resolves the same source-now Ready target against the released branch, refuses without resurrection, and retains the real first-take/release prefix', () => {
    const { state: source, payload } = baseReady(), beforeSource = clone(source)
    assert.ok(source.hollywood)
    const own = source.hollywood.playerStudioId, now = source.market.tick
    const choice: Choice = { projectId: payload.projectId, directorId: payload.directorId,
      cast: payload.cast, craftIds: payload.craftIds }
    const immediate = applyActions(source, [{ kind: 'greenlightScriptProject', production: payload }])
    supported(immediate, choice)
    expect(immediate.studio.activeProductions).toHaveLength(1)
    const productionId = immediate.studio.activeProductions[0]!.id, beforeImmediate = clone(immediate)
    expect(immediate.studio.activeProductions[0]).toMatchObject({ startTick: now, remainingTicks: 8 })
    const commands: Command[] = []
    const nextOrdinal = (week: number) => commands.filter((row) => row.week === week).length + (week === now ? 1 : 0)
    const reference = watchOwners(productionId, () => {
      let state = immediate
      let sawPost = false
      // Finite genuine construction: no clock/Ready/scenery/history edits.
      for (let guard = 0; guard < 20; guard++) {
        supported(state, choice)
        const production = state.studio.activeProductions.find((row) => row.id === productionId)
        const workflow = state.operations.workflows.find((row) => row.productionId === productionId)
        assert.ok(production && workflow)
        if (workflow.phase === 'postProduction') sawPost = true
        if (production.remainingTicks === 1) break
        if (workflow.phase === 'shooting' && !state.firstTakes.some((row) => row.productionId === productionId)) {
          expect(production.remainingTicks).toBe(5)
          if (workflow.shootingTask?.status === 'unassigned') {
            commands.push({ kind: 'assignLockedDirector', readyProjectId: payload.projectId,
              week: state.market.tick, ordinal: nextOrdinal(state.market.tick) })
            state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId: production.directorId }])
            supported(state, choice)
          }
          if (state.operations.workflows.find((row) => row.productionId === productionId)?.shootingTask?.status === 'ready') {
            commands.push({ kind: 'scheduleTake', readyProjectId: payload.projectId,
              week: state.market.tick, ordinal: nextOrdinal(state.market.tick) })
            state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
            expect(state.operations.workflows.find((row) => row.productionId === productionId)?.shootingTask?.status).toBe('scheduled')
            supported(state, choice)
          }
        }
        state = tick(state)
        supported(state, choice)
      }
      expect(sawPost).toBe(true)
      const ready = state.studio.activeProductions.find((row) => row.id === productionId)
      expect(ready?.remainingTicks).toBe(1) // hard finite release-ready witness
      expect(state.operations.workflows.find((row) => row.productionId === productionId)?.phase).toBe('releaseReady')
      expect(commands.map((row) => row.kind)).toEqual(['assignLockedDirector', 'scheduleTake'])
      const takes = state.firstTakes.filter((row) => row.productionId === productionId)
      expect(takes).toHaveLength(1)
      const take = takes[0]!
      expect(take).toMatchObject({ studioId: own, cast: choice.cast, week: commands[1]!.week + 1 })
      expect(state.studioEvents.rows.filter((row) => row.kind === 'wrapped' && row.productionId === productionId)).toHaveLength(1)
      const commitWeek = state.market.tick
      expect(commitWeek).toBeGreaterThan(take.week)
      expect(releaseModule.commitPictureToReleaseRefusal(state, productionId)).toBeNull()
      commands.push({ kind: 'commitRelease', readyProjectId: payload.projectId,
        week: commitWeek, ordinal: nextOrdinal(commitWeek) })
      const committed = applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])
      supported(committed, choice)
      expect(committed.market.tick).toBe(commitWeek)
      expect(committed.releaseAuthority.commitments).toHaveLength(1)
      expect(committed.releaseAuthority.commitments[0]).toMatchObject({ productionId, committedAtWeek: commitWeek })
      const released = tick(committed)
      supported(released, choice)
      expect(released.market.tick).toBe(commitWeek + 1)
      expect(released.studio.activeProductions).toEqual([])
      expect(released.operations.workflows).toEqual([])
      expect(released.releaseAuthority.commitments).toEqual([])
      expect(released.studio.releasedFilms.map((row) => row.productionId)).toEqual([productionId])
      expect(projectById(released, payload.projectId)).toMatchObject({ status: 'produced', productionId })
      expect(released.firstTakes.filter((row) => row.productionId === productionId)).toEqual([take])
      // Exact standalone authority/action refusal on the REAL post-release state.
      const refusal = `no active production "${productionId}" exists`, beforeRefusal = clone(released)
      expect(releaseModule.commitPictureToReleaseRefusal(released, productionId)).toBe(refusal)
      expect(() => applyActions(released, [{ kind: 'commitPictureToRelease', productionId }]))
        .toThrow(`applyActions: commitPictureToRelease rejected — ${refusal}`)
      expect(released).toEqual(beforeRefusal)
      return { released, take, commitWeek }
    })
    const { released, take, commitWeek } = reference.value
    const stale: Command = { kind: 'commitRelease', readyProjectId: payload.projectId,
      week: released.market.tick, ordinal: nextOrdinal(released.market.tick) }
    const value: ReadyOwnerReplayInput = { source, issuerId: own, claimPersonIds: [choice.cast.lead],
      plans: [{ traceKey: '302-ready-stale-after-release', readyChoice: choice, commands: [...commands, stale].reverse() }],
      horizonEndWeek: released.market.tick + 1, preparationWork: 0,
      limits: { work: 200000, span: 220, alternatives: 1024 } }
    const beforeInput = clone(value)
    const checked = watchOwners(productionId, () => replayReadyProductionPlans(value))
    expect(value).toEqual(beforeInput)
    expect(source).toEqual(beforeSource)
    expect(immediate).toEqual(beforeImmediate)
    const result = checked.value
    expect(result.preparationWork).toBeLessThanOrEqual(200000)
    expect(result.attempts).toHaveLength(1)
    const attempt = result.attempts[0]!
    if (attempt.kind !== 'cut') throw new Error('released Ready target was resurrected or stale command silently ignored')
    expect(attempt.reason).toBe('commandRefused') // workLimit is not a substitute for reaching this branch
    expect(attempt.through.week).toBe(released.market.tick)
    expect(attempt.detail.length).toBeGreaterThan(0)
    expect(attempt.detail).toBe('production already released in this branch')
    expect(result.omissions.length).toBeGreaterThan(0)
    expect(attempt).not.toHaveProperty('projection')
    expect(attempt).not.toHaveProperty('trace')
    expect(checked.calls).toEqual(reference.calls) // no second commit or extra sweep reusing the original clock
    const sweeps = checked.calls.filter((row) => row.kind === 'sweep')
    expect(sweeps.map((row) => row.week)).toEqual(Array.from({ length: released.market.tick - now }, (_, index) => now + index))
    for (const sweep of sweeps) expect(sweep.ids).toEqual([productionId])
    expect(sweeps.filter((row) => row.takes.includes(productionId)).map((row) => ({
      week: row.week, before: row.before, after: row.after, takes: row.takes,
    }))).toEqual([{ week: take.week - 1, before: [5], after: [4], takes: [productionId] }])
    expect(sweeps.some((row) => row.before[0] === 4 && row.after[0] === 3 &&
      row.operations.workflows[0]?.phase === 'postProduction')).toBe(true)
    expect(sweeps.filter((row) => row.admitted.includes(productionId)).map((row) => ({
      week: row.week, before: row.before, after: row.after, admitted: row.admitted, operations: row.operations,
    }))).toEqual([{ week: commitWeek, before: [1], after: [0], admitted: [productionId], operations: released.operations }])
    expect(checked.calls.filter((row) => row.kind === 'commit')).toHaveLength(1)
    expect(checked.calls.filter((row) => row.kind === 'prune')).toEqual([
      { kind: 'prune', productionId, authority: released.releaseAuthority },
    ])
    expect(attempt.provenance.filter((row) => row.kind === 'readyAdmitted')).toEqual([
      { kind: 'readyAdmitted', at: { week: now, step: 1 }, projectId: payload.projectId, productionId },
    ])
    expect(attempt.provenance.filter((row) => row.kind === 'firstTake')).toEqual([
      { kind: 'firstTake', at: { week: take.week, step: 0 }, productionId },
    ])
    const releases = attempt.provenance.filter((row) => row.kind === 'releaseAdmitted')
    expect(releases).toHaveLength(1)
    expect(releases[0]!.productionId).toBe(productionId)
    expect(releases[0]!.at.week).toBe(commitWeek) // collection boundary precedes visible increment
    const prefixSweeps = attempt.provenance.filter((row) => row.kind === 'sweepStarted')
    expect(prefixSweeps.map((row) => row.at.week)).toEqual(sweeps.map((row) => row.week))
    expect(prefixSweeps[prefixSweeps.length - 1]!.at.step).toBeLessThan(releases[0]!.at.step)
    const successfulCommands = attempt.provenance.filter((row) => row.kind === 'command').filter((row) => row.at.week < stale.week)
    expect(successfulCommands.map((row) => row.command)).toEqual(commands.map(({ kind, week, ordinal }) =>
      ({ kind, week, ordinal, productionId })))
    const wrapped = attempt.provenance.filter((row) => row.kind === 'ownerEvent' && row.draft.kind === 'wrapped')
    expect(wrapped).toHaveLength(1)
    expect(wrapped[0]!.at.week).toBeLessThan(commitWeek)
    expect(source.studio.activeProductions).toEqual([])
    expect(source.releaseAuthority.commitments).toEqual([])
    expect(projectById(source, payload.projectId)).toMatchObject({ status: 'ready', productionId: null })
  })
})
