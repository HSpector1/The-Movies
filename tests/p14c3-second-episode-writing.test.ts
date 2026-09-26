// Independent1002-A B4a: six requirements for each genuinely transitioned person.
// Real historical and live positive controls precede detached negative mutations.
import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { studioConstructionView } from '../src/core/placement.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV38 } from '../src/core/save.js'
import { availableDevelopmentCastingSlots } from '../src/core/scriptDevelopment.js'
import { studioCalendar } from '../src/core/studioCalendar.js'
import { playerOffer } from '../src/core/talentMarket.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { clone, person } from './helpers/p14c3-fixtures.js'
import { accepted, advanceExactly, announcedEpisode, B4_TARGETS, completedEpisode, finishingEpisode,
  originalCommission, preserveActorHistory, projectFor, renewedEpisode } from './helpers/p14c3-second-episode-fixtures.js'

function encoded(state: GameState): string { return exportSave(makeSave(state)) }
function noReplacementEmployment(state: GameState, id: string, effective: number): void {
  expect(activeContract(state, id)).toBeUndefined()
  expect(state.contracts.filter(row => row.talentId === id)).toEqual([])
  expect(state.hollywood!.employment.filter(row => row.terms.talentId === id && row.terms.startWeek >= effective)).toEqual([])
  expect(state.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus' && row.week >= effective)).toEqual([])
  // Other genuine employees remain; aggregate payroll is not a per-person row.
}

describe.each(B4_TARGETS)('C.3 B4a actual actor→%s second retirement and retained writing', target => {
  it('W1 permits and pays the genuine ordinary208-week new-profession renewal', () => {
    const { state, origin, id } = renewedEpisode(target), before = stableStringify(state)
    const contract = activeContract(state, id)
    assert.ok(contract)
    expect(contract).toMatchObject({ startWeek: 260, endWeekExclusive: 468, termWeeks: 208 })
    const ask = playerOffer(state, id, 208, 260).annualSalary
    const annualSalary = Math.round(ask * 1.25)
    const signingBonus = Math.round(annualSalary * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
    expect(contract).toMatchObject({ annualSalary, signingBonus })
    expect(state.ledger.filter(row => row.talentId === id && row.kind === 'signingBonus' && row.week >= 253 && row.week <= 260))
      .toEqual([expect.objectContaining({ week: 260, amount: -signingBonus })])
    expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'settled' && row.week === 260))
      .toEqual([expect.objectContaining({ studioId: state.hollywood!.playerStudioId })])
    expect(retirementRecordFor(state, id)).toBeUndefined()
    preserveActorHistory(state, origin, id)
    accepted(state)
    expect(stableStringify(state)).toBe(before)
  })

  it('W2 records the real hard75 destination notice beside the unchanged completed actor episode', () => {
    const { state, origin, id } = announcedEpisode(target)
    expect(state.market.tick).toBe(364)
    expect(person(state, id)).toMatchObject({ role: target, age: 75 })
    expect(state.careerLifecycle.records.filter(row => row.personId === id)).toHaveLength(2)
    expect(retirementRecordFor(state, id)).toMatchObject({ profession: target, status: 'announced',
      cause: 'hardBoundary', announcedWeek: 364, effectiveWeek: 468, extensionUsed: false })
    expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
    preserveActorHistory(state, origin, id)
    accepted(state)
  })

  it('W3 accepts genuine retained writing at E through Save38, Calendar, construction and an unrelated screenplay command', () => {
    const f = finishingEpisode(target), before = stableStringify(f.state), old = projectFor(f.state, f.projectId)
    accepted(f.state)
    expect(old).toMatchObject({ writerId: f.id, commissionedWeek: f.effective - 1, status: 'drafting', dueWeek: f.due })
    expect(f.due).toBeGreaterThan(f.effective + 1)
    expect(retirementRecordFor(f.state, f.id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 208 })
    expect(retirementRecordFor(f.state, f.id)).toMatchObject({ profession: target, status: 'finishing_commitments' })
    expect.soft(() => studioConstructionView(f.state), 'live construction must use current profession authority').not.toThrow()
    expect.soft(() => {
      const calendar = studioCalendar(f.state)
      expect(calendar.commitments.some(row => row.kind === 'retirement' && row.ownerId === f.id && row.week === f.effective)).toBe(true)
    }, 'actual Calendar must inspect the valid retained-work snapshot').not.toThrow()
    expect(person(f.state, f.youngWriterId)).toMatchObject({ role: 'writer', age: 30 })
    expect(activeContract(f.state, f.youngWriterId)).toBeDefined()
    expect(busyTalentIds(f.state).has(f.youngWriterId)).toBe(false)
    expect(f.state.castingSessions.sessions).toEqual([])
    expect(availableDevelopmentCastingSlots(f.state.operations, f.state.scriptDevelopment, new Set())).toBeGreaterThan(0)
    expect.soft(() => {
      const next = applyActions(f.state, [originalCommission(f.youngWriterId)])
      expect(next.scriptDevelopment.projects).toHaveLength(f.state.scriptDevelopment.projects.length + 1)
      expect(next.scriptDevelopment.projects.at(-1)).toMatchObject({ writerId: f.youngWriterId,
        commissionedWeek: f.effective, status: 'drafting' })
      expect(projectFor(next, f.projectId)).toEqual(old)
      expect(next.productionQueue).toEqual(f.state.productionQueue)
      accepted(next)
    }, 'actual unrelated commission reaches assertCurrentScriptState with a free young writer and real spare slot').not.toThrow()
    noReplacementEmployment(f.state, f.id, f.effective)
    expect(stableStringify(f.state)).toBe(before)
  })

  it('W4 loaded and continuous E states finish the same original screenplay on its real clock', () => {
    const f = finishingEpisode(target), { direct, reopened } = completedEpisode(target)
    expect(direct.market.tick).toBe(f.due)
    expect(reopened.market.tick).toBe(f.due)
    expect(encoded(reopened)).toBe(encoded(direct))
    expect(projectFor(direct, f.projectId)).toMatchObject({ writerId: f.id, writerIds: [f.id],
      commissionedWeek: f.effective - 1, status: 'review', dueWeek: null, reservation: null })
    expect(reopened.scriptDevelopment).toEqual(direct.scriptDevelopment)
    expect(reopened.hollywood!.receipts).toEqual(direct.hollywood!.receipts)
    preserveActorHistory(direct, f.origin, f.id)
    noReplacementEmployment(direct, f.id, f.effective)
    accepted(direct)
  })

  it('W5 retires the destination after actual clearance and records exactly one noCatalogue finality', () => {
    const f = finishingEpisode(target), { direct } = completedEpisode(target)
    const record = retirementRecordFor(direct, f.id)
    expect(record).toMatchObject({ profession: target, status: 'retired', effectiveWeek: f.effective, retiredWeek: f.due })
    const finality = direct.careerLifecycle.industryRetirements.filter(row => row.personId === f.id)
    expect(finality).toEqual([{ personId: f.id, week: f.due, profession: target,
      source: { personId: f.id, profession: target }, cause: 'noCatalogue', evaluationId: null }])
    expect(direct.freeAgents).not.toContain(f.id)
    preserveActorHistory(direct, f.origin, f.id)
    const loaded = migrateToLive(importSave(encoded(direct))).state
    expect(encoded(loaded)).toBe(encoded(direct))
    const later = advanceExactly(loaded, f.due + 1)
    expect(retirementRecordFor(later, f.id)).toEqual(record)
    expect(later.careerLifecycle.industryRetirements.filter(row => row.personId === f.id)).toEqual(finality)
    preserveActorHistory(later, f.origin, f.id)
    noReplacementEmployment(later, f.id, f.effective)
    accepted(later)
  })

  it('W6 refuses both missing-current and missing-old-actor authority without borrowing or legacy fallback', () => {
    const f = finishingEpisode(target), before = stableStringify(f.state)
    accepted(f.state) // mandatory genuine whole38 control before either mutation
    expect(f.state.careerLifecycle.records.filter(row => row.personId === f.id)).toHaveLength(2)
    for (const removed of [target, 'actor'] as const) {
      const malformed = clone(f.state)
      malformed.careerLifecycle.records = malformed.careerLifecycle.records.filter(row => row.personId !== f.id || row.profession !== removed)
      expect(malformed.careerLifecycle.records.filter(row => row.personId === f.id)).toHaveLength(1)
      expect(malformed.careerLifecycle.professionChanges).toEqual(f.state.careerLifecycle.professionChanges)
      expect(malformed.careerLifecycle.transitionEvaluations).toEqual(f.state.careerLifecycle.transitionEvaluations)
      expect(malformed.scriptDevelopment).toEqual(f.state.scriptDevelopment)
      expect(malformed.hollywood!.employment).toEqual(f.state.hollywood!.employment)
      const malformedBefore = stableStringify(malformed)
      const fullSaveCause = removed === 'actor'
        ? /evaluation lacks completed acting retirement predecessor/
        // The genuine current extension case remains. Its missing dated episode
        // is rejected by the full reader before the script-employment delegate.
        : `is a retirementExtension case for ${f.id}, who holds no retirement record`
      const liveCause = removed === 'actor'
        ? /evaluation lacks completed acting retirement predecessor|active project .*writer is not contracted/
        : /active project .*writer is not contracted/
      expect.soft(() => validateSaveV38({ saveVersion: 38, seed: malformed.seed, state: malformed,
        broadcastCache: malformed.broadcastItems }), `whole38 refuses removed ${removed} authority`).toThrow(fullSaveCause)
      // Both are deliberately invalid snapshots. Removing old actor history must
      // not regain the single-row legacy allowance while C3 changes still exist.
      expect.soft(() => studioConstructionView(malformed), `construction refuses removed ${removed}`).toThrow(liveCause)
      expect.soft(() => studioCalendar(malformed), `Calendar refuses removed ${removed}`).toThrow(liveCause)
      expect.soft(() => applyActions(malformed, [originalCommission(f.youngWriterId)]),
        `unrelated screenplay refuses removed ${removed}`).toThrow(liveCause)
      expect(stableStringify(malformed)).toBe(malformedBefore)
    }
    expect(stableStringify(f.state)).toBe(before)
  })
})
