// Installed after parent full read and independent230 KEEP; actual verification follows.
// INERT / UNEXECUTED. Intended tests/p14b4-started-replay-scenery-commands.test.ts.
//222: genuine preserved incoming V13 -> governed grandfather migration; no modern provenance forgery.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import * as operationsModule from '../src/core/operations.js'
import { replayStartedProductionPlans, type StartedOwnerReplayInput,
  type StartedProductionCommand } from '../src/core/promiseCapacityOwnerReplay.js'
import { makeSave, migrateToV14, migrateToV31, validateSaveV13 } from '../src/core/save.js'
import { sceneryLoadInDecision } from '../src/core/sceneryLoadIn.js'
import { scriptProjectWriterIds } from '../src/core/scriptDevelopment.js'
import { tick } from '../src/core/tick.js'
import type { GameState, Production } from '../src/core/types.js'

const clone = <T>(value: T): T => structuredClone(value)
const company = (rows: readonly Production[]) => new Set(rows.flatMap((row) =>
  [row.directorId, ...Object.values(row.cast), ...row.craftIds]))
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const fixtureUrl = new URL('../ui/e2e/world-first-scenery-load-in-v1/week-30-nights-of-watchtower-stage-7-blocked.save.json', import.meta.url)
const manifestUrl = new URL('../ui/e2e/world-first-scenery-load-in-v1/manifest.json', import.meta.url)

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


function preservedGrandfather() {
  const bytes = readFileSync(fixtureUrl), manifestBytes = readFileSync(manifestUrl)
  expect(bytes.byteLength).toBe(230339)
  expect(hash(bytes)).toBe('34f062fdd44e3a7116731d214de5aaa2eb4d02af85b874764d5de1cf66229b22')
  expect(hash(manifestBytes)).toBe('e1bfbf86d329f75e96452185e79e36554a512cdb74b9e987eef93afcb807de5d')
  const manifest: unknown = JSON.parse(manifestBytes.toString('utf8'))
  expect(manifest).toMatchObject({
    schemaVersion: 'world-first-scenery-load-in-fixtures-v1',
    generatedBy: 'scripts/gen-world-first-scenery-load-in-fixtures.mts',
    authority: { stateConstruction: 'public Engine actions and UI adapter action boundaries only',
      generatedFilesAreHandEdited: false },
  })
  const incoming = validateSaveV13(JSON.parse(bytes.toString('utf8')))
  expect(incoming.saveVersion).toBe(13)
  expect(incoming.seed).toBe('marathon-annex-play')
  expect(incoming.state.market.tick).toBe(30)
  const id = 'prod-0026'
  expect(incoming.state.studio.activeProductions).toHaveLength(1)
  const oldPicture = incoming.state.studio.activeProductions.find((row) => row.id === id)
  const oldWorkflow = incoming.state.operations.workflows.find((row) => row.productionId === id)
  assert.ok(oldPicture && oldWorkflow)
  expect(oldPicture).toMatchObject({ startTick: 26, remainingTicks: 5, directorId: 't-dir-01' })
  expect(oldWorkflow.shootingTask?.status).toBe('blocked')
  expect(oldWorkflow.blocker).toEqual({ kind: 'scenery-load-in', taskId: 'shooting:prod-0026' })
  expect(oldWorkflow).not.toHaveProperty('bindings')
  const before = clone(incoming)
  // ONLY the actual governed migration creates the grandfather flag.
  const v14 = migrateToV14(incoming)
  const grandfather = v14.state.operations.workflows.find((row) => row.productionId === id)!
  expect(grandfather.bindings.requiresSetBinding).toBe(false)
  expect(grandfather.bindings.setId).toBeNull()
  expect(grandfather.shootingTask).toEqual(oldWorkflow.shootingTask)
  const state = migrateToV31(v14).state
  expect(incoming).toEqual(before)
  expect(state.market.tick).toBe(30)
  expect(state.hollywood).toMatchObject({ origin: 'migration', originWeek: 30 })
  expect(state.studio.activeProductions).toHaveLength(1)
  expect(state.operations.workflows).toHaveLength(1)
  const production = state.studio.activeProductions[0]!, workflow = state.operations.workflows[0]!
  expect(production).toMatchObject({ id, startTick: 26, remainingTicks: 5, directorId: 't-dir-01' })
  expect(workflow.productionId).toBe(id)
  expect(workflow.bindings).toEqual(grandfather.bindings)
  expect(workflow.reservations).toEqual(oldWorkflow.reservations)
  expect(workflow.shootingTask).toEqual(oldWorkflow.shootingTask)
  expect(sceneryLoadInDecision(state, workflow, state.market.tick)).toEqual({ kind: 'manual-clear' })
  expect(state.firstTakes.filter((row) => row.productionId === id)).toEqual([])
  supported(state)
  return { state, production, workflow, id, bytes }
}

describe('P14B4 actual grandfather scenery command', () => {
  it('strictly migrates preserved incoming evidence, clears manually then schedules and executes the real next sweep', () => {
    const { state, production, workflow, id, bytes } = preservedGrandfather(), before = clone(state)
    assert.ok(state.hollywood)
    const week = state.market.tick, own = state.hollywood.playerStudioId
    expect(() => applyActions(state, [{ kind: 'scheduleShootingTake', productionId: id }])).toThrow(/not ready/)
    const cleared = applyActions(state, [{ kind: 'clearSceneryLoadIn', productionId: id }])
    expect(cleared.operations.workflows[0]?.shootingTask?.status).toBe('ready')
    expect(cleared.operations.workflows[0]?.blocker).toBeNull()
    const scheduled = applyActions(cleared, [{ kind: 'scheduleShootingTake', productionId: id }]), real = tick(scheduled)
    expect(scheduled.operations.workflows[0]?.shootingTask?.status).toBe('scheduled')
    expect(real.studio.activeProductions[0]?.remainingTicks).toBe(4)
    makeSave(cleared); makeSave(scheduled); makeSave(real)
    const command: StartedProductionCommand = { week, ordinal: 0, productionId: id, kind: 'clearGrandfatheredScenery' }
    const schedule: StartedProductionCommand = { week, ordinal: 1, productionId: id, kind: 'scheduleTake' }
    const value: StartedOwnerReplayInput<Production> = { source: {
      technology: state.technology, market: { tick: week }, placement: state.placement, property: state.property,
      hollywood: state.hollywood, operations: state.operations, sets: state.sets, releaseAuthority: state.releaseAuthority,
      scriptDevelopment: state.scriptDevelopment, castingSessions: state.castingSessions, construction: state.construction,
      physicalPlans: state.physicalPlans, productionQueue: state.productionQueue, founding: state.founding,
      firstTakes: state.firstTakes, concepts: state.concepts, studio: { activeProductions: state.studio.activeProductions },
    }, issuerId: own, claimPersonIds: [production.cast.lead],
    plans: [{ traceKey: '222-genuine-v13-grandfather', commands: [command, schedule] }],
    horizonEndWeek: week + 1, preparationWork: 0, limits: { work: 200000, span: 220, alternatives: 1024 } }
    const originalClear = operationsModule.clearSceneryLoadIn, originalSchedule = operationsModule.scheduleShootingTake
    const originalAdvance = operationsModule.advanceManagedProductions
    const order: string[] = [], clears: string[] = [], schedules: string[] = []
    const sweeps: { week: number; ids: string[]; before: number[]; after: number[] }[] = []
    const clearSpy = vi.spyOn(operationsModule, 'clearSceneryLoadIn').mockImplementation((...args) => {
      order.push('clear'); clears.push(args[1]); return originalClear(...args)
    })
    const scheduleSpy = vi.spyOn(operationsModule, 'scheduleShootingTake').mockImplementation((...args) => {
      order.push('schedule'); schedules.push(args[1]); return originalSchedule(...args)
    })
    const advanceSpy = vi.spyOn(operationsModule, 'advanceManagedProductions').mockImplementation((...args) => {
      order.push('sweep')
      const next = originalAdvance(...args)
      sweeps.push({ week: args[2], ids: args[1].map((row) => row.id),
        before: args[1].map((row) => row.remainingTicks), after: next.productions.map((row) => row.remainingTicks) })
      return next
    })
    const beforeInput = clone(value)
    try {
      const result = replayStartedProductionPlans(value)
      expect(value).toEqual(beforeInput)
      expect(state).toEqual(before)
      expect(result.preparationWork).toBeLessThanOrEqual(200000)
      expect(result.attempts).toHaveLength(1)
      const attempt = result.attempts[0]!
      if (attempt.kind !== 'complete') throw new Error('222 genuine grandfather replay cut: ' + attempt.reason + ': ' + attempt.detail)
      expect(result.omissions).toEqual([])
      expect(order).toEqual(['clear', 'schedule', 'sweep'])
      expect(clears).toEqual([id])
      expect(schedules).toEqual([id])
      expect(sweeps).toEqual([{ week, ids: [id], before: [5], after: [4] }])
      const projected = attempt.projection
      expect(projected.week).toBe(real.market.tick)
      expect(projected.productions).toEqual(real.studio.activeProductions)
      expect(projected.operations).toEqual(real.operations)
      expect(projected.sets).toEqual(real.sets)
      expect(projected.releaseAuthority).toEqual(real.releaseAuthority)
      expect(projected.completedBackgroundPathKeys).toEqual([])
      expect(projected.technology.productions.filter((row) => row.studioId === own))
        .toEqual(real.technology.productions.filter((row) => row.studioId === own))
      expect(projected.technology.productions.filter((row) => row.studioId !== own))
        .toEqual(state.technology.productions.filter((row) => row.studioId !== own))
      expect(attempt.provenance.filter((row) => row.kind === 'command').map((row) => row.command)).toEqual([command, schedule])
      const actualEvents = scheduled.studioEvents.rows.filter((row) => row.seq >= state.studioEvents.nextSeq)
      expect(actualEvents).toHaveLength(1)
      expect(actualEvents[0]).toMatchObject({ kind: 'sceneryArrived', productionId: id, week })
      const events = attempt.provenance.filter((row) => row.kind === 'ownerEvent')
      expect(events.map((row) => ({ week: row.ownerWeek, draft: row.draft })))
        .toEqual(actualEvents.map(({ seq: _seq, week: ownerWeek, ...draft }) => ({ week: ownerWeek, draft })))
      expect(attempt.provenance.filter((row) => row.kind === 'firstTake'))
        .toEqual([{ kind: 'firstTake', at: { week: week + 1, step: 0 }, productionId: id }])
      expect(real.firstTakes.filter((row) => row.productionId === id)).toHaveLength(1)
      const pictures = attempt.trace.paths.filter((row) => row.kind === 'jointTracePicture')
      expect(pictures).toHaveLength(1)
      expect(pictures[0]!.greenlight).toEqual({ week: 26, step: 0 })
      expect(pictures[0]!.firstTake).toEqual({ week: 31, step: 0 })
      expect(pictures[0]!.personRelease).toBeNull()
      expect(pictures[0]!.cast).toEqual(production.cast)
      expect(attempt.trace.fixedHoldReplacements).toEqual([])
      expect(attempt.trace.additionalHolds).toEqual([])
      const path = JSON.stringify(['production', own, id])
      const heldResources = result.fixedHolds.filter((hold) => hold.ownerPathKey === path && hold.subject.kind === 'resource')
      expect(heldResources).toHaveLength(workflow.reservations.length)
      for (const reservation of workflow.reservations) expect(heldResources).toContainEqual(expect.objectContaining({
        subject: { kind: 'resource', resourceKey: JSON.stringify(['facility', own, reservation.facilityId]), slot: reservation.slot },
      }))
      // Migrated null Set binding is not retroactively turned into exclusive Set occupancy.
      for (const hold of result.fixedHolds) {
        expect(hold.from).toEqual({ week: 30, step: 0 })
        expect(hold.until).toEqual({ week: 31, step: 0 })
      }
      expect(readFileSync(fixtureUrl)).toEqual(bytes)
      expect(state).toEqual(before)
      // Event equals H; successful command parity is NOT a capacity-certification claim.
    } finally { clearSpy.mockRestore(); scheduleSpy.mockRestore(); advanceSpy.mockRestore() }
  })
})
