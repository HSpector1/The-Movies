// C.2c independent behavioral RED. Authority: 773 §10 and 823. Tests use existing
// public functions, so missing VOIDED behavior fails assertions, not imports.
// The natural fixtures and the separately labelled lawful predicate variants are
// distinct evidence. No stored historical fixture or production file is edited.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { assignmentRefusal, retirementRecordFor } from '../src/core/careerLifecycle.js'
import { advancePromisesWeek, promiseFeasibility, qualifyingTakes, trustDescriptor, trustDrivers, waivePromise } from '../src/core/promises.js'
import { submitProposal, withdrawProposal } from '../src/core/talentMarket.js'
import type { GameState, ProfessionalPromise } from '../src/core/types.js'
import { advanceTo, c2cFixture, greenlightAction, owner, ownOutcomeReceipt, promiseById, savedState,
  tick, toScheduledTake, withPromiseVariant } from './helpers/p14c2c-fixtures.js'

function draftFor(p: ProfessionalPromise) {
  return { family: p.family, issuerStudioId: p.issuerStudioId, beneficiaryPersonId: p.beneficiaryPersonId,
    predicate: p.predicate, windowStartWeek: p.windowStartWeek, dueWeekExclusive: p.dueWeekExclusive,
    startWeek: 52, termWeeks: 104, promiseId: p.promiseId }
}

/** Counterfactual ONLY: remove this person's retirement restriction. This is not
 * a historical fixture or save; all other facts are identical to the source. */
function withoutRetirement(state: GameState, actorId: string): GameState {
  return { ...state, careerLifecycle: { ...state.careerLifecycle,
    records: state.careerLifecycle.records.filter((r) => r.personId !== actorId) } }
}

describe('P14C.2c retirement causation and normal tick ownership', () => {
  it('C1: a real birthday announcement leaves a bound, still-fulfillable promise open', () => {
    const f = c2cFixture()
    expect(retirementRecordFor(f.beforeAnnouncement, f.actorId)).toBeUndefined()
    const after = tick(f.beforeAnnouncement)
    expect(retirementRecordFor(after, f.actorId)).toMatchObject({ announcedWeek: 104, effectiveWeek: 156 })
    expect(promiseById(after, f.promiseId)).toMatchObject({ outcome: null, outcomeWeek: null, progress: 0 })
    expect(after.talentMarket.receipts.filter((r) => r.kind === 'promiseOutcome' && r.talentId === f.actorId)).toEqual([])
  })

  it('C2: the first lost fresh-admission week VOIDs once, before the legal promise deadline', () => {
    const f = c2cFixture()
    expect(promiseById(f.lastAdmission, f.promiseId).outcome).toBeNull()
    expect(assignmentRefusal(f.lastAdmission, f.actorId, 147)).toBeNull()
    const after = tick(f.lastAdmission)
    expect(after.market.tick).toBe(148)
    expect(assignmentRefusal(after, f.actorId, 148)).toMatch(/retirementAnnounced/)
    expect(promiseById(after, f.promiseId)).toMatchObject({ outcome: 'VOIDED', outcomeWeek: 148, progress: 0,
      dueWeekExclusive: 156, contractId: promiseById(f.lastAdmission, f.promiseId).contractId })
    expect(promiseById(after, f.promiseId).outcomeCause).toMatch(/retir/i)
    ownOutcomeReceipt(after, f.promiseId)
    expect(advancePromisesWeek(after)).toEqual(after)
    const again = tick(after)
    expect(promiseById(again, f.promiseId)).toEqual(promiseById(after, f.promiseId))
    expect(again.talentMarket.receipts.filter((r) => r.kind === 'promiseOutcome' && r.talentId === f.actorId)).toHaveLength(1)
  })

  it('C2 control: remove only retirement and real greenlight/schedule/tick still fulfills before due', () => {
    const f = c2cFixture()
    const uncapped = withoutRetirement(f.lastAdmission, f.actorId)
    const after = tick(uncapped)
    expect(promiseById(after, f.promiseId).outcome).toBeNull()
    const scheduled = toScheduledTake(f, after)
    const kept = tick(scheduled.state)
    const takes = kept.firstTakes.filter((t) => t.productionId === scheduled.productionId)
    expect(takes).toHaveLength(1)
    expect(takes[0]!.week).toBe(153)
    expect(promiseById(kept, f.promiseId)).toMatchObject({ outcome: 'SATISFIED', outcomeWeek: 153,
      progress: 1, evidenceRefs: [takes[0]!.eventId] })
  })

  it('C3: a real committed lead seat at admission equality survives the cutoff and satisfies', () => {
    const f = c2cFixture()
    const scheduled = toScheduledTake(f, f.lastAdmission)
    expect(promiseById(scheduled.state, f.promiseId).outcome).toBeNull()
    expect(scheduled.state.market.tick).toBe(151)
    const kept = tick(scheduled.state)
    const take = kept.firstTakes.find((t) => t.productionId === scheduled.productionId)!
    expect(take).toMatchObject({ week: 152, studioId: owner(kept), cast: { lead: f.actorId } })
    expect(promiseById(kept, f.promiseId)).toMatchObject({ outcome: 'SATISFIED', outcomeWeek: 152,
      progress: 1, evidenceRefs: [take.eventId] })
    ownOutcomeReceipt(kept, f.promiseId)
    const retiredOrFinishing = advanceTo(kept, 157)
    expect(promiseById(retiredOrFinishing, f.promiseId)).toEqual(promiseById(kept, f.promiseId))
    expect(retiredOrFinishing.firstTakes).toContainEqual(take)
  })

  it('C3 boundary: the actual greenlight command refuses the next week without changing any state', () => {
    const f = c2cFixture()
    const state = tick(f.lastAdmission)
    const before = structuredClone(state)
    expect(() => applyActions(state, [greenlightAction(f, state)])).toThrow(/retirementAnnounced/)
    expect(state).toEqual(before)
  })

  it('C3 held work: an unscheduled real first take survives the cutoff and counts when its future window opens', () => {
    const f = c2cFixture()
    // Labelled window variant, within the unchanged real carrying contract.
    const futureWindow = withPromiseVariant(f.lastAdmission, f.promiseId,
      { windowStartWeek: 154, dueWeekExclusive: 156 })
    let state = applyActions(futureWindow, [greenlightAction(f, futureWindow)])
    const productionId = state.studio.activeProductions.at(-1)!.id
    state = advanceTo(state, 151)
    expect(state.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks).toBe(5)
    expect(state.operations.workflows.find((w) => w.productionId === productionId)!.shootingTask?.status).not.toBe('scheduled')
    state = advanceTo(state, 153) // real unscheduled hold; no countdown mutation
    expect(state.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks).toBe(5)
    expect(state.firstTakes.some((take) => take.productionId === productionId)).toBe(false)
    expect(promiseById(state, f.promiseId)).toMatchObject({ outcome: null, progress: 0 })
    savedState(state)
    state = applyActions(state, [
      { kind: 'assignShootingDirector', productionId, directorId: f.directorId },
      { kind: 'scheduleShootingTake', productionId },
    ])
    const kept = tick(state)
    const take = kept.firstTakes.find((row) => row.productionId === productionId)!
    expect(take.week).toBe(154)
    expect(promiseById(kept, f.promiseId)).toMatchObject({ outcome: 'SATISFIED', outcomeWeek: 154,
      progress: 1, evidenceRefs: [take.eventId] })
    savedState(kept)
  })

  it('C6 grandfathered work: a post-first-take countdown with no historical receipt is never a future take', () => {
    const f = c2cFixture()
    const lateWindow = withPromiseVariant(advanceTo(f.announced, 143), f.promiseId,
      { windowStartWeek: 148, dueWeekExclusive: 150 })
    const scheduled = toScheduledTake(f, lateWindow)
    expect(scheduled.state.market.tick).toBe(147)
    expect(scheduled.state.firstTakes.some((take) => take.productionId === scheduled.productionId)).toBe(false)
    // SYNTHETIC GRANDFATHERED IMPORT SHAPE, not an observed historical campaign:
    // V28 -> V29 intentionally opens an EMPTY firstTakes root, including pictures
    // whose shooting countdown already passed 5. Create that legal state shape
    // before ANY real take was emitted; no receipt or completed history is erased.
    // Both countdown and task change together, and the WHOLE save must validate.
    const grandfathered = savedState({ ...scheduled.state,
      studio: { ...scheduled.state.studio, activeProductions: scheduled.state.studio.activeProductions.map((p) =>
        p.id === scheduled.productionId ? { ...p, remainingTicks: 4 } : p) },
      operations: { ...scheduled.state.operations, workflows: scheduled.state.operations.workflows.map((w) =>
        w.productionId === scheduled.productionId ? { ...w, shootingTask: { ...w.shootingTask!, status: 'completed' } } : w) },
    })
    const after = tick(grandfathered)
    expect(after.market.tick).toBe(148)
    expect(after.studio.activeProductions.find((p) => p.id === scheduled.productionId)!.remainingTicks).toBeLessThan(5)
    expect(after.firstTakes.some((take) => take.productionId === scheduled.productionId)).toBe(false)
    // Fresh filming cannot occur before 153, beyond due150 even without retirement.
    expect(promiseById(after, f.promiseId)).toMatchObject({ outcome: null, progress: 0 })
    const due = advanceTo(after, 150)
    expect(promiseById(due, f.promiseId)).toMatchObject({ outcome: 'BROKEN', outcomeWeek: 150, progress: 0 })
    expect(due.firstTakes.some((take) => take.productionId === scheduled.productionId)).toBe(false)
    savedState(due)
  })

  it('C5: a committed support seat cannot protect a lead-only promise from retirement', () => {
    const f = c2cFixture()
    const seated = applyActions(f.lastAdmission, [greenlightAction(f, f.lastAdmission, 'support')])
    const after = tick(seated)
    expect(after.studio.activeProductions.at(-1)!.cast.support).toBe(f.actorId)
    expect(promiseById(after, f.promiseId)).toMatchObject({ outcome: 'VOIDED', outcomeWeek: 148 })
  })

  it('C5 generic P1 control: the same real support seat does protect an appearance promise', () => {
    const f = c2cFixture()
    const generic = withPromiseVariant(f.lastAdmission, f.promiseId,
      { family: 'APPEARANCE_COUNT', predicate: { count: 1 } }) // labelled lawful predicate variant
    const scheduled = toScheduledTake(f, generic, 'support')
    expect(promiseById(scheduled.state, f.promiseId).outcome).toBeNull()
    const kept = tick(scheduled.state)
    expect(promiseById(kept, f.promiseId)).toMatchObject({ outcome: 'SATISFIED', progress: 1 })
  })

  it('C6: a promise already beyond the uncapped physical count remains ordinary law, not VOIDED', () => {
    const f = c2cFixture()
    const impossibleAlready = withPromiseVariant(f.lastAdmission, f.promiseId,
      { predicate: { kind: 'castRoleCount', count: 2, seatClass: 'lead' } })
    // At 148 even the optimistic uncapped take weeks 153,158 cannot fit before 156.
    const after = tick(impossibleAlready)
    expect(promiseById(after, f.promiseId).outcome).toBeNull()
    const due = advanceTo(after, 156)
    expect(promiseById(due, f.promiseId)).toMatchObject({ outcome: 'BROKEN', outcomeWeek: 156 })
  })

  it('C1: reduced future capacity does not VOID a promise while new admission remains open', () => {
    const f = c2cFixture()
    const three = withPromiseVariant(f.announced, f.promiseId,
      { predicate: { kind: 'castRoleCount', count: 3, seatClass: 'lead' } })
    const state = advanceTo(three, 140)
    expect(assignmentRefusal(state, f.actorId, 140)).toBeNull()
    expect(promiseById(state, f.promiseId).outcome).toBeNull()
  })

  it('C6: actual early termination keeps its BROKEN cause and never gains a retirement outcome', () => {
    const f = c2cFixture()
    const terminated = applyActions(f.lastAdmission, [{ kind: 'releaseTalent', talentId: f.actorId }])
    const original = promiseById(terminated, f.promiseId)
    expect(original.outcome).toBe('BROKEN')
    expect(original.outcomeCause).toMatch(/terminated/)
    const after = tick(terminated)
    expect(promiseById(after, f.promiseId)).toEqual(original)
    expect(after.talentMarket.receipts.filter((r) => r.kind === 'promiseOutcome' && r.talentId === f.actorId)).toHaveLength(1)
  })

  it('C7: a genuinely withdrawn proposal never receives an automatic retirement outcome', () => {
    const f = c2cFixture()
    const withdrawn = withdrawProposal(f.submitted, f.actorId, owner(f.submitted))
    expect(promiseById(withdrawn, f.promiseId).contractId).toBeNull()
    const after = advanceTo(withdrawn, 157)
    expect(retirementRecordFor(after, f.actorId)).toBeDefined()
    expect(promiseById(after, f.promiseId)).toMatchObject({ contractId: null, outcome: null,
      outcomeWeek: null, outcomeEventId: null })
  })

  it('C7: a real accepted waiver is terminal while its still-open substitute follows retirement law', () => {
    const f = c2cFixture()
    const waived = waivePromise(f.announced, { promiseId: f.promiseId, substitute: {
      family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: 1, seatClass: 'lead' },
      windowStartWeek: 105, dueWeekExclusive: 156,
    } })
    const original = promiseById(waived, f.promiseId)
    expect(original.outcome).toBe('WAIVED')
    expect(original.supersededByPromiseId).not.toBeNull()
    const after = advanceTo(waived, 148)
    expect(promiseById(after, f.promiseId)).toEqual(original)
    expect(promiseById(after, original.supersededByPromiseId!)).toMatchObject({ outcome: 'VOIDED', outcomeWeek: 148 })
  })
})

describe('P14C.2c feasibility, persistence, partial work and extension', () => {
  it('C11: new feasibility includes the actual cap, changes the digest, and consumes no RNG', () => {
    const f = c2cFixture()
    const state = tick(f.lastAdmission)
    const before = structuredClone(state)
    const draft = draftFor(promiseById(state, f.promiseId))
    const capped = promiseFeasibility(state, draft, 148)
    const uncapped = promiseFeasibility(withoutRetirement(state, f.actorId), draft, 148)
    expect(capped.classification).toBe('IMPOSSIBLE')
    expect(capped.bottleneck).toMatch(/retir/i)
    expect(uncapped.classification).toBe('FRAGILE')
    expect(capped.inputsDigest).not.toBe(uncapped.inputsDigest)
    expect(promiseFeasibility(state, draft, 148)).toEqual(capped)
    expect(state).toEqual(before)
  })

  it('C11: a committed qualifying seat remains possible despite refusing every new greenlight', () => {
    const f = c2cFixture()
    const seated = applyActions(f.lastAdmission, [greenlightAction(f, f.lastAdmission)])
    const state = tick(seated)
    expect(assignmentRefusal(state, f.actorId, state.market.tick)).not.toBeNull()
    const quote = promiseFeasibility(state, draftFor(promiseById(state, f.promiseId)), state.market.tick)
    expect(quote.classification).not.toBe('IMPOSSIBLE')
    expect(promiseById(state, f.promiseId).outcome).toBeNull()
  })

  it('C4: real partial first-take progress and its receipt survive VOIDED without extra trust damage', () => {
    const f = c2cFixture()
    const two = withPromiseVariant(f.announced, f.promiseId,
      { predicate: { kind: 'castRoleCount', count: 2, seatClass: 'lead' } })
    const scheduled = toScheduledTake(f, two)
    const delivered = tick(scheduled.state)
    const take = delivered.firstTakes.find((t) => t.productionId === scheduled.productionId)!
    expect(promiseById(delivered, f.promiseId)).toMatchObject({ progress: 1, outcome: null })
    // Cancel AFTER its real first take. That existing trust consequence is kept;
    // retirement must add no new negative consequence for the remaining picture.
    const cancelled = applyActions(delivered, [{ kind: 'cancel', productionId: scheduled.productionId }])
    expect(promiseById(cancelled, f.promiseId).outcome).toBeNull()
    const before = advanceTo(cancelled, 147)
    const trust = trustDescriptor(before, f.actorId, owner(before), 148)
    const evidenceBefore = promiseById(before, f.promiseId).evidenceRefs
    const after = tick(before)
    expect(promiseById(after, f.promiseId)).toMatchObject({ progress: 1, outcome: 'VOIDED', outcomeWeek: 148 })
    expect(promiseById(after, f.promiseId).evidenceRefs).toEqual(expect.arrayContaining([...evidenceBefore]))
    expect(qualifyingTakes(after, promiseById(after, f.promiseId))).toEqual([take])
    expect(after.firstTakes).toContainEqual(take)
    expect(trustDescriptor(after, f.actorId, owner(after), 148)).toEqual(trust)
    expect(trustDrivers(after, f.actorId, owner(after), 148).some((d) => d.kind === 'promiseBroken')).toBe(false)
    savedState(after)
  })

  it('C9: live save/reload across the exact trigger matches continuous tick bytes and preserves identity', () => {
    const f = c2cFixture()
    const before = structuredClone(f.lastAdmission)
    const continuous = tick(f.lastAdmission)
    const replayed = tick(savedState(f.lastAdmission))
    expect(promiseById(replayed, f.promiseId).outcome).toBe('VOIDED')
    expect(JSON.stringify(replayed)).toBe(JSON.stringify(continuous))
    // 830's fixed-source pre-C.2c probe attributed the only raw-object changes
    // to two inherited perceived -0 values becoming 0 in JSON. Persistence is
    // byte-preserving in its canonical JSON representation; keep comparing the
    // complete save state, including every promise, identity and history field.
    expect(JSON.stringify(savedState(continuous))).toBe(JSON.stringify(continuous))
    expect(f.lastAdmission).toEqual(before)
    expect(continuous.talent.map((p) => p.id)).toEqual(before.talent.map((p) => p.id))
    expect(continuous.talentProvenance.rows).toEqual(before.talentProvenance.rows)
    expect(continuous.careerEvents.slice(0, before.careerEvents.length)).toEqual(before.careerEvents)
    expect(continuous.firstTakes.slice(0, before.firstTakes.length)).toEqual(before.firstTakes)
  })

  it('C8: a genuine final extension uses the moved E for future feasibility and cannot revive VOIDED', () => {
    const f = c2cFixture()
    const offered = submitProposal(f.lastAdmission, { talentId: f.actorId, issuerStudioId: owner(f.lastAdmission),
      termWeeks: 52, premiumTier: 1.1 })
    const voided = tick(offered)
    expect(promiseById(voided, f.promiseId).outcome).toBe('VOIDED')
    const extended = advanceTo(voided, 156)
    expect(retirementRecordFor(extended, f.actorId)).toMatchObject({
      extensionUsed: true, extendedFromWeek: 156, effectiveWeek: 208, status: 'announced',
    })
    expect(promiseById(extended, f.promiseId)).toEqual(promiseById(voided, f.promiseId))
    const old = promiseById(extended, f.promiseId)
    const draft = { family: old.family, predicate: old.predicate, issuerStudioId: old.issuerStudioId,
      beneficiaryPersonId: old.beneficiaryPersonId, windowStartWeek: 156, dueWeekExclusive: 208,
      startWeek: 156, termWeeks: 52 }
    const at180 = advanceTo(extended, 180)
    expect(promiseFeasibility(at180, draft, 180).classification).not.toBe('IMPOSSIBLE')
    const at200 = advanceTo(at180, 200)
    expect(promiseFeasibility(at200, draft, 200).classification).toBe('IMPOSSIBLE')
    expect(promiseById(at200, f.promiseId)).toEqual(promiseById(voided, f.promiseId))
    savedState(at200)
  })
})
