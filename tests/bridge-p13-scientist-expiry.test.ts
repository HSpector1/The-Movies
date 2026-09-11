import { describe, expect, it } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { laboratoryPage } from '../bridge/laboratory.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { activeContract } from '../src/core/employment.js'
import { applyActions } from '../src/core/actions.js'
import { makeSave } from '../src/core/save.js'
import { advanceTo, adoptExistingSoundChain, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import { gateHiringEligibleCards, studioLotSnapshot } from '../ui/src/engine/adapter.ts'
import { gateHiringMarketContext } from '../ui/src/lot/snapshot/gateHiring.ts'

describe('P13A Scientist expiration at the shared Gate Hiring boundary', () => {
  it('projects an expired Scientist with exact hire terms and commits the same person through the Laboratory', () => {
    const employed = p13aResearchReady()
    const scientist = employed.talent.find(person => person.role === 'scientist')!
    const expired = advanceTo(employed, activeContract(employed, scientist.id)!.endWeekExclusive)
    expect(activeContract(expired, scientist.id)).toBeUndefined()
    const original = makeSave(expired)
    const candidate = gateHiringEligibleCards(expired)!.find(card => card.profile.id === scientist.id)!
    expect(candidate.profile.role).toBe('scientist')
    expect(candidate.employment.status).toBe('freeAgent')
    expect(candidate.employment.offerOptions.every(offer => offer.annualSalary === 104_000)).toBe(true)
    const lot = studioLotSnapshot(expired)
    expect(gateHiringMarketContext(lot)!.candidates.filter(row => row.talentId === scientist.id)).toEqual([
      { talentId: scientist.id, name: scientist.name, creativeRole: 'scientist', employmentStatus: 'freeAgent',
        offerTermWeeks: candidate.employment.offerOptions.map(offer => offer.termWeeks) },
    ])
    const session = new BridgeSession(expired, 'expired-scientist-hire')
    const snapshot = session.snapshot()
    expect(snapshot.gameWeek).toBe(468)
    const page = session.industry({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery',
      requestId: 'expired-scientist-lab', sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
      view: 'laboratory', targetId: 'placed-1', page: 0, pageSize: 50, lane: 'audienceAwareness', period: 'all' })
    if (!('laboratory' in page) || !page.laboratory) throw new Error('Laboratory is absent after Scientist expiry')
    expect(page.laboratory.seatLabel).toContain('Seats assigned: 1 of 4')
    expect(page.laboratory.scientistLabel).toContain('contract no longer active')
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, page)).toEqual(page)
    const hire = page.laboratory.actions.find(action => action.id === 'recruit-1')!
    expect(hire.enabled).toBe(true)
    expect(hire.detail).toContain('$2,000/week')
    expect(makeSave(expired)).toEqual(original)
    expect(session.command({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'submitIntent',
      commandId: 'rehire-expired-scientist', sessionId: session.sessionId, expectedStateRevision: session.stateRevision,
      payload: { intentId: hire.intent!.intentId } }).accepted).toBe(true)
    expect(session.gameState.talent.filter(person => person.role === 'scientist')).toHaveLength(1)
    expect(activeContract(session.gameState, scientist.id)?.annualSalary).toBe(104_000)
    expect(session.gameState.technology.projects).toEqual(expired.technology.projects)
    expect(() => session.snapshot()).not.toThrow()
  }, 30_000)

  it('distinguishes completed research, pending physical work and the exact operational sound chain', () => {
    const ready = p13aResearchReady()
    let state = advanceTo(applyActions(ready, [{ kind: 'beginResearch', projectId: ready.technology.projects[0]!.id, budgetPerWeek: 10_000 }]), 303)
    const read = () => laboratoryPage(state, 'placed-1', [], 0, 50).laboratory
    expect(read().bottleneckLabel).toContain('Physical installation is the remaining capability gate')
    state = adoptExistingSoundChain(state)
    expect(read().bottleneckLabel).toContain('committed physical installation must finish')
    state = advanceTo(state,315)
    const adoption = state.technology.adoptions.find(row => row.studioId === state.hollywood!.playerStudioId)!
    expect(read().bottleneckLabel).toContain('Synchronized dialogue is ready on')
    expect(read().bottleneckLabel).toContain(state.operations.facilities.find(facility => facility.id === adoption.stageFacilityId)!.name)
    expect(read().bottleneckLabel).toContain(state.operations.facilities.find(facility => facility.id === adoption.postFacilityId)!.name)
    expect(read().bottleneckLabel).not.toContain('remaining capability gate')
  }, 30_000)
})
