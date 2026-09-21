// P14B.2-F1 inherited producer/validator conflict. Requirements: 03-setup-wrap-review.md.
// All positive wrap/setup history is written by actual actions/ticks; each negative
// changes one reference/date only. No historical fixture or validator is relaxed.
import { describe, expect, it } from 'vitest'
import { applyActions, tick } from '../src/core/index.js'
import { validateProductionSetup } from '../src/core/productionSetup.js'
import { makeSave, validateSaveV30 } from '../src/core/save.js'
import { isTierDStudioEventKind } from '../src/core/studioEvents.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, clone, retentionFixture } from './helpers/p14b2-fixtures.js'
import { contendedStudio } from './_m4Fixtures.js'

function wrapped() {
  const fixture = retentionFixture()
  const state = tick(fixture.outcomes)
  const workflow = state.operations.workflows.find((w) => w.productionId === fixture.productionId)!
  const wrap = state.studioEvents.rows.find((r) => r.kind === 'wrapped' && r.productionId === fixture.productionId)!
  expect(wrap.kind).toBe('wrapped')
  expect(workflow.phase).toBe('postProduction')
  expect(workflow.bindings.stageFacilityId).toBeNull()
  expect(workflow.setup).toEqual(fixture.outcomes.operations.workflows.find((w) => w.productionId === fixture.productionId)!.setup)
  return { state, productionId: fixture.productionId, workflow, wrap }
}
function roundTrip(state: GameState): void {
  const saved = makeSave(state)
  expect(validateSaveV30(JSON.parse(JSON.stringify(saved)))).toEqual(saved)
}
describe('P14B.2-F1 completed setup remains historical authority after real wrap', () => {
  it('round-trips actual first take → wrap → Post with unchanged setup and released stage', () => {
    const { state } = wrapped()
    expect(validateProductionSetup(state)).toEqual([])
    roundTrip(state)
  })
  it('does not require compacted windowed setup/phase events when the permanent exact wrap survives', () => {
    const before = wrapped()
    const state = advanceTo(before.state, before.state.market.tick + TUNING.STUDIO_EVENT_WINDOW_WEEKS + 1)
    expect(state.operations.workflows.some((w) => w.productionId === before.productionId && w.setup !== null)).toBe(true)
    expect(state.studioEvents.rows).toContainEqual(before.wrap)
    expect(state.studioEvents.rows.filter((r) => !isTierDStudioEventKind(r.kind) && 'productionId' in r && r.productionId === before.productionId)).toEqual([])
    expect(validateProductionSetup(state)).toEqual([])
    roundTrip(state)
  }, 60_000)
  it('accepts a real wrapped picture blocked before Post, with no stage or shooting task restored', () => {
    // Existing C2a-M4 contention construction. ONLY capacity is an explicit test
    // configuration (one Post slot); all setup, work, wrap and blockers are real.
    let { state } = contendedStudio('p14b2-f1-post-contention')
    state = { ...state, operations: { ...state.operations, facilities: state.operations.facilities.map((f) => f.capability === 'post' ? { ...f, capacity: 1 } : f) } }
    for (let guard = 0; guard < 30; guard++) {
      for (const workflow of state.operations.workflows) {
        if (workflow.phase === 'rehearsal' && workflow.setup === null) state = applyActions(state, [{ kind: 'setProductionSetupRecipe', productionId: workflow.productionId, recipeId: 'ordinary-interior-01', expectedPlanRevision: workflow.planRevision }])
        if (workflow.shootingTask?.status === 'unassigned') {
          const production = state.studio.activeProductions.find((p) => p.id === workflow.productionId)!
          state = applyActions(state, [{ kind: 'assignShootingDirector', productionId: production.id, directorId: production.directorId }, { kind: 'scheduleShootingTake', productionId: production.id }])
        }
      }
      state = tick(state)
      const blocked = state.operations.workflows.find((w) => w.phase === 'shooting' && w.blocker?.kind === 'facility-capacity' && w.blocker.capability === 'post')
      if (blocked !== undefined) {
        expect(blocked.bindings.stageFacilityId).toBeNull()
        expect(blocked.reservations).toEqual([])
        expect(blocked.shootingTask).toBeNull()
        expect(blocked.setup?.completedWeek).not.toBeNull()
        expect(state.studioEvents.rows.some((r) => r.kind === 'wrapped' && r.productionId === blocked.productionId && r.stageFacilityId === blocked.setup!.stageFacilityId && r.setId === blocked.setup!.setId)).toBe(true)
        expect(validateProductionSetup(state)).toEqual([])
        return
      }
    }
    throw new Error('F1 fixture: actual Post contention not reached')
  }, 60_000)
  it.each(['missing wrap', 'wrong wrap stage', 'wrong wrap Set', 'wrong wrap production', 'changed retained Set',
    'different current stage', 'unfinished setup', 'wrap before completion', 'future wrap'] as const)('refuses %s without borrowing unrelated history', (fault) => {
    const fixture = wrapped()
    const state = clone(fixture.state)
    const workflow = state.operations.workflows.find((w) => w.productionId === fixture.productionId)!
    const wrap = state.studioEvents.rows.find((r) => r.seq === fixture.wrap.seq)!
    if (wrap.kind !== 'wrapped') throw new Error('F1 fixture: expected wrap')
    switch (fault) {
      case 'missing wrap': state.studioEvents.rows = state.studioEvents.rows.filter((r) => r.seq !== wrap.seq); break
      case 'wrong wrap stage': wrap.stageFacilityId = 'facility-soundstage-12'; break
      case 'wrong wrap Set': wrap.setId = null; break
      case 'wrong wrap production': wrap.productionId = 'unrelated-production'; break
      case 'changed retained Set': workflow.bindings.setId = null; break
      case 'different current stage': workflow.bindings.stageFacilityId = 'facility-soundstage-12'; break
      case 'unfinished setup': workflow.setup!.completedWeek = null; break
      case 'wrap before completion': wrap.week = workflow.setup!.completedWeek! - 1; break
      case 'future wrap': wrap.week = state.market.tick + 1; break
    }
    expect(validateProductionSetup(state).some((message) => /setup/.test(message))).toBe(true)
    expect(() => makeSave(state)).toThrow()
  })
  it('still refuses a detached active shooting setup before any wrap exists', () => {
    const f = retentionFixture()
    const state = clone(f.scheduled)
    const workflow = state.operations.workflows.find((w) => w.productionId === f.productionId)!
    expect(state.studioEvents.rows.some((r) => r.kind === 'wrapped' && r.productionId === f.productionId)).toBe(false)
    workflow.bindings.stageFacilityId = null
    expect(validateProductionSetup(state).some((message) => /setup/.test(message))).toBe(true)
    expect(() => makeSave(state)).toThrow()
  })
})
