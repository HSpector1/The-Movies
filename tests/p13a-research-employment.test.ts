import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { activeContract, busyTalentIds, terminationCost } from '../src/core/employment.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { commitPlacement } from '../src/core/placement.js'
import { exportSave, importSave, makeSave, migrateToV20 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { weeklyResearchPayroll, weeklyResearchSpend } from '../src/core/technology.js'
import { generateWorld } from '../src/core/worldgen.js'

describe('P13A research employment continuity', () => {
  it('releasing the actual Scientist pauses work immediately and survives save/reload without losing verified work', () => {
    const generated = generateWorld('p13a-scientist-release')
    let state = initializeHollywood(applyActions({ ...generated, economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }]), 'fresh')
    state = commitPlacement(state, { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    while (state.market.tick < 12) state = tick(state)
    const laboratoryFacilityId = state.placement.facilities[0]!.facilityId
    state = applyActions(state, [{ kind: 'installAcousticInstruments', laboratoryFacilityId }])
    while (state.market.tick < 260) state = tick(state)
    state = applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId }])
    const scientistId = state.talent.find(person => person.role === 'scientist')!.id
    state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId, scientistId }])
    const projectId = state.technology.projects[0]!.id
    state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek: 10_000 }])
    state = tick(state)
    const project = state.technology.projects[0]!
    expect(project).toMatchObject({ status: 'active', verifiedWork: 1.5, expenditure: 10_000 })
    expect(busyTalentIds(state).has(scientistId)).toBe(true)
    const cost = terminationCost(activeContract(state, scientistId)!, state.market.tick)
    const released = applyActions(state, [{ kind: 'releaseTalent', talentId: scientistId }])
    expect(released.studio.cash).toBe(state.studio.cash - cost)
    expect(released.technology.projects[0]).toEqual({ ...project, status: 'paused' })
    expect(activeContract(released, scientistId)).toBeUndefined()
    expect(busyTalentIds(released).has(scientistId)).toBe(false)
    expect(weeklyResearchPayroll(released)).toBe(0)
    expect(weeklyResearchSpend(released)).toBe(0)
    expect(() => applyActions(released, [{ kind: 'resumeResearch', projectId }])).toThrow('Employ and assign')
    const restored = migrateToV20(importSave(exportSave(makeSave(released)))).state
    expect(makeSave(restored)).toEqual(makeSave(released))
    expect(restored.technology.projects[0]).toEqual(released.technology.projects[0])
    const nextWeek = tick(restored)
    expect(nextWeek.technology.projects[0]).toEqual(released.technology.projects[0])
    expect(nextWeek.ledger.filter(row => row.week === released.market.tick && (row.kind === 'researchSpend' || row.kind === 'researchPayroll'))).toEqual([])
    const rehired = applyActions(nextWeek, [{ kind: 'recruitScientist', laboratoryFacilityId }, { kind: 'resumeResearch', projectId }])
    expect(rehired.talent.filter(person => person.role === 'scientist')).toHaveLength(1)
    expect(rehired.technology.projects[0]).toEqual({ ...project, status: 'active' })
    expect(makeSave(migrateToV20(importSave(exportSave(makeSave(rehired)))).state)).toEqual(makeSave(rehired))
  }, 30_000)
})
