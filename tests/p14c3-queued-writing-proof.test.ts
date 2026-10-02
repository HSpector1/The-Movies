// Independent1008-A qualification on the implemented current proof/phase context.
// No historical RED claim: parent records the first actual six-case result.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { studioConstructionView } from '../src/core/placement.js'
import * as professionHistory from '../src/core/professionHistory.js'
import * as queueAdmission from '../src/core/queueAdmission.js'
import { stableStringify, validateSaveV44 } from '../src/core/save.js'
import { availableDevelopmentCastingSlots } from '../src/core/scriptDevelopment.js'
import { studioCalendar } from '../src/core/studioCalendar.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { clone, person } from './helpers/p14c3-fixtures.js'
import { addAndSign, assertDeferredActor, fillAndQueue, queuedWritingFixture } from './helpers/p14c3-queued-writing-fixtures.js'
import { accepted, B4_TARGETS, originalCommission, preserveActorHistory, projectFor, renewedEpisode } from './helpers/p14c3-second-episode-fixtures.js'

// 1309-X3 ruling 1: state here is genuinely live (from tick()/queuedWritingFixture),
// so this envelope must carry the live version, not the historical 38 literal.
// 1344-N S2+S1 (x2 at a318722, Q1 :56 and Q3 :154 measured validateSaveV42 -> proveProfessionSave ->
// "validateSaveV37: state is invalid — ... — Hollywood save: exact keys required: ..."): the live Save43
// state's rival businesses carry `screenplayShelving`, which only validateSaveV43 admits, so the stamp and
// all three readers move to 43. Q2 (:129) passed at x2 (its V34 refusal, src/core/save.ts:9728, precedes
// the Hollywood check) and moves with the stamp, which validateSaveV42 would refuse by version.
// 1358-N S2+S1: Save44 is live, so the stamp moves to 44 and the three readers to validateSaveV44.
const envelope = (state: GameState) => ({ saveVersion: 44, seed: state.seed, state, broadcastCache: state.broadcastItems })

/** Independent premise check across both actual task owners, not the new private
 * permission/candidate helper. An idle-cost assertion must not hide a candidate. */
function noExpiredWriting(state: GameState): void {
  const week = state.market.tick
  for (const project of state.scriptDevelopment.projects) {
    if (project.status !== 'drafting' || project.dueWeek === null || project.dueWeek <= week) continue
    for (const id of project.writerIds) expect(activeContract(state, id), 'player task writer is actually employed').toBeDefined()
  }
  for (const studio of state.hollywood!.businesses) {
    for (const project of studio.development.projects) {
      if (project.status !== 'drafting' || project.dueWeek === null || project.dueWeek <= week) continue
      for (const id of project.writerIds) expect(state.hollywood!.employment.some(row => row.studioId === studio.studioId
        && row.terms.talentId === id && row.terms.startWeek <= week && week < (row.endedWeek ?? row.terms.endWeekExclusive)),
      'rival task writer is actually employed by that task owner').toBe(true)
    }
  }
}

describe.each(B4_TARGETS)('C.3 queued current-%s writing and complete-proof boundary', target => {
  it('Q1 grants the real queued original at469 while unrelated transitionDue469 remains pending in the queue phase', () => {
    const f = queuedWritingFixture(target), queued = fillAndQueue(f), state = queued.state
    const before = stableStringify(state), oldDraft = clone(projectFor(state, f.originalProjectId))
    const oldEvaluations = clone(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === f.unrelatedActorId))
    accepted(state)
    expect(oldDraft.dueWeek).toBeGreaterThan(469)
    expect(state.market.tick).toBe(468)
    assertDeferredActor(state, f.unrelatedActorId, [365, 417], 469)
    const historySpy = vi.spyOn(professionHistory, 'validateProfessionHistory')
    const queueSpy = vi.spyOn(queueAdmission, 'admitQueuedIntents')
    let after: GameState
    try {
      const control = envelope(state)
      expect(validateSaveV44(control)).toBe(control)
      expect(historySpy.mock.calls, 'mandatory real full-reader instrumentation control').toHaveLength(1)
      expect(historySpy.mock.calls[0]![0].market).toMatchObject({ tick: 468 })
      historySpy.mockClear()
      after = tick(state, { develop: true })
      expect(historySpy.mock.calls, 'one complete settled proof per tick invocation, with no transient re-proof').toHaveLength(1)
      expect(historySpy.mock.calls[0]![0].market).toMatchObject({ tick: 468 })
      expect(queueSpy.mock.calls, 'mandatory actual queue-dispatch instrumentation seam').toHaveLength(1)
      const [arriving, week] = queueSpy.mock.calls[0]!
      expect(week).toBe(469)
      expect(arriving.market.tick).toBe(469)
      expect(arriving.careerLifecycle.transitionDue.filter(row => row.personId === f.unrelatedActorId))
        .toEqual([{ personId: f.unrelatedActorId, week: 469 }])
      expect(arriving.careerLifecycle.transitionEvaluations.filter(row => row.personId === f.unrelatedActorId)).toEqual(oldEvaluations)
      expect(projectFor(arriving, f.originalProjectId)).toEqual(oldDraft)
      expect(projectFor(arriving, queued.poolId)).toMatchObject({ status: 'review', dueWeek: null, reservation: null })
      expect(availableDevelopmentCastingSlots(arriving.operations, arriving.scriptDevelopment, new Set())).toBe(1)
      const result = queueSpy.mock.results[0]!
      expect(result.type).toBe('return')
      if (result.type === 'return') {
        expect(result.value.granted).toEqual([queued.ordinal])
        expect(result.value.expired).toEqual([])
      }
    } finally { queueSpy.mockRestore(); historySpy.mockRestore() }
    expect(after!.market.tick).toBe(469)
    expect(after!.productionQueue).toEqual([])
    expect(projectFor(after!, f.originalProjectId)).toEqual(oldDraft)
    const newProjects = after!.scriptDevelopment.projects.filter(row => row.writerId === f.queuedWriterId)
    expect(newProjects).toHaveLength(1)
    const admittedProject = newProjects[0]!
    expect(admittedProject).toMatchObject({ commissionedWeek: 469, status: 'drafting', writerIds: [f.queuedWriterId] })
    expect(admittedProject.dueWeek).toBeGreaterThan(469)
    expect(admittedProject.reservation).not.toBeNull()
    expect(after!.scriptDevelopment.projects).toHaveLength(state.scriptDevelopment.projects.length + 1)
    expect(after!.concepts).toHaveLength(state.concepts.length + 1)
    expect(after!.originalScreenplays.nextOrdinal).toBe(state.originalScreenplays.nextOrdinal + 1)
    expect(after!.originalScreenplays.blueprints).toHaveLength(state.originalScreenplays.blueprints.length + 1)
    expect(after!.originalScreenplays.blueprints.filter(row => row.projectId === admittedProject.id))
      .toEqual([expect.objectContaining({ mintedWeek: 469, writerId: f.queuedWriterId, conceptId: admittedProject.conceptId })])
    expect(after!.studioEvents.rows.filter(row => row.kind === 'queueIntentExpired' && row.ordinal === queued.ordinal)).toEqual([])
    expect(person(after!, f.unrelatedActorId).age).toBe(74)
    assertDeferredActor(after!, f.unrelatedActorId, [365, 417, 469], 521)
    expect(after!.careerLifecycle.transitionEvaluations.filter(row => row.personId === f.unrelatedActorId).slice(0, 2)).toEqual(oldEvaluations)
    expect(retirementRecordFor(after!, f.focusId)).toMatchObject({ profession: target, status: 'finishing_commitments', effectiveWeek: 468 })
    preserveActorHistory(after!, f.origin, f.focusId)
    accepted(after!)
    expect(stableStringify(state)).toBe(before)
  })

  it('Q2 refuses permission when unrelated intent version passes new history alone but fails complete Save38', () => {
    const f = queuedWritingFixture(target), before = stableStringify(f.state)
    accepted(f.state)
    expect(availableDevelopmentCastingSlots(f.state.operations, f.state.scriptDevelopment, new Set())).toBe(1)
    expect(activeContract(f.state, f.queuedWriterId)).toBeDefined()
    expect(busyTalentIds(f.state).has(f.queuedWriterId)).toBe(false)
    expect(() => studioConstructionView(f.state)).not.toThrow()
    expect(() => studioCalendar(f.state)).not.toThrow()
    const allowed = applyActions(f.state, [originalCommission(f.queuedWriterId)])
    expect(allowed.scriptDevelopment.projects.at(-1)).toMatchObject({ writerId: f.queuedWriterId, commissionedWeek: 468, status: 'drafting' })
    expect(projectFor(allowed, f.originalProjectId)).toEqual(projectFor(f.state, f.originalProjectId))
    expect(allowed.productionQueue).toEqual([])
    accepted(allowed)
    const malformed = clone(f.state)
    const row = retirementRecordFor(malformed, f.unrelatedActorId)
    assert.ok(row)
    expect(row).toMatchObject({ intentRulesVersion: 1, retiredWeek: 365, status: 'retired' })
    // Explicit invalid-unknown boundary: alter only this frozen leaf. No claim
    // that the copied object remains a valid GameState after the mutation.
    Object.assign(row, { intentRulesVersion: 0 })
    expect(malformed.careerLifecycle.records.filter(item => item.personId === f.focusId))
      .toEqual(f.state.careerLifecycle.records.filter(item => item.personId === f.focusId))
    const malformedBefore = stableStringify(malformed)
    expect(() => professionHistory.validateProfessionHistory({ ...malformed }), 'narrow history-only discriminator is not whole-save admission').not.toThrow()
    expect(() => validateSaveV44(envelope(malformed))).toThrow(/intentRulesVersion must be 1/)
    const refusal = /intentRulesVersion must be 1|active project .*writer is not contracted/
    expect(() => studioConstructionView(malformed)).toThrow(refusal)
    expect(() => studioCalendar(malformed)).toThrow(refusal)
    expect(() => applyActions(malformed, [originalCommission(f.queuedWriterId)])).toThrow(refusal)
    expect(stableStringify(malformed)).toBe(malformedBefore)
    expect(stableStringify(f.state)).toBe(before)
  })

  it('Q3 makes no recurring profession proof on idle/currently contracted work, with a positive spy control', () => {
    const f = renewedEpisode(target)
    let state = f.state
    expect(state.market.tick).toBe(260)
    expect(person(state, f.id).role).toBe(target)
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === f.id)).toHaveLength(1)
    expect(retirementRecordFor(state, f.id, 'actor')).toMatchObject({ retiredWeek: 208 })
    if (state.scriptDevelopment.mode === 'legacy') state = applyActions(state, [{ kind: 'activateScriptDevelopment' }])
    const young = addAndSign(state, 'writer', 30, 52, `1012 ${target} idle proof control`)
    state = young.state
    accepted(state)
    noExpiredWriting(state)
    const before = stableStringify(state), spy = vi.spyOn(professionHistory, 'validateProfessionHistory')
    let after: GameState
    try {
      const control = envelope(state)
      expect(validateSaveV44(control)).toBe(control)
      expect(spy.mock.calls, 'positive full-reader control proves this spy observes the actual call graph').toHaveLength(1)
      expect(spy.mock.calls[0]![0].market).toMatchObject({ tick: 260 })
      spy.mockClear()
      expect(() => studioConstructionView(state)).not.toThrow()
      expect(() => studioCalendar(state)).not.toThrow()
      const commissioned = applyActions(state, [originalCommission(young.id)])
      expect(commissioned.scriptDevelopment.projects.at(-1)).toMatchObject({ writerId: young.id, commissionedWeek: 260, status: 'drafting' })
      expect(commissioned.productionQueue).toEqual([])
      noExpiredWriting(commissioned)
      after = tick(commissioned, { develop: true })
      expect(after.market.tick).toBe(261)
      expect(after.scriptDevelopment.projects.filter(row => row.writerId === young.id)).toHaveLength(1)
      expect(spy.mock.calls, 'candidate-free live actions, views and week must not prove accumulated profession history').toHaveLength(0)
    } finally { spy.mockRestore() }
    noExpiredWriting(after!)
    preserveActorHistory(after!, f.origin, f.id)
    accepted(after!)
    expect(stableStringify(state)).toBe(before)
  })
})
