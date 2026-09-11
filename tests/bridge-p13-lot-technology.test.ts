import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { campaignDate } from '../src/core/calendar.js'
import { facilityInstallationPhase } from '../src/core/placement.js'
import { studioLotSnapshot } from '../ui/src/engine/adapter.ts'
import { advanceTo, adoptExistingSoundChain, p13aGeneratedStudio, p13aLaboratorySlice, p13aResearchReady } from '../src/harness/p13a/fixtures.js'

describe('P13A exact lot technology status', () => {
  it('shows acoustic installation on the existing Laboratory, then its real named paused/active task', () => {
    let state = p13aLaboratorySlice()
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    state = applyActions(state, [{ kind: 'installAcousticInstruments', laboratoryFacilityId }])
    const before = JSON.stringify(state)
    const module = state.placement.facilities.find(p => p.installation?.targetFacilityId === laboratoryFacilityId)!
    const snapshot = studioLotSnapshot(state)
    expect(snapshot.buildings.find(b => b.id === 'placed-1')).toMatchObject({ available: false, attention: 'active' })
    expect(snapshot.buildings.find(b => b.id === 'placed-1')!.attentionReason).toContain(facilityInstallationPhase(module, state.market.tick))
    expect(snapshot.buildings.find(b => b.id === 'placed-1')!.attentionReason).toContain(campaignDate(module.completesWeek).label)
    expect(snapshot.property!.buildings.some(b => b.id === `placed-${module.id}`)).toBe(false)
    expect(JSON.stringify(state)).toBe(before)
    state = p13aResearchReady()
    const scientist = state.talent.find(t => t.role === 'scientist')!
    expect(studioLotSnapshot(state).buildings.find(b => b.id === 'placed-1')!.attentionReason).toContain(`Research paused · ${scientist.name}`)
    state = applyActions(state, [{ kind: 'beginResearch', projectId: state.technology.projects[0]!.id, budgetPerWeek: 10_000 }])
    expect(studioLotSnapshot(state).buildings.find(b => b.id === 'placed-1')).toMatchObject({ attention: 'active', attentionReason: expect.stringContaining(`Research active · ${scientist.name}`) })
  })

  it('joins actual sound work to the exact founding stage/Post and leaves the other stage unchanged', () => {
    let state = advanceTo(p13aGeneratedStudio('p13a-lot-installation'), 416)
    const before = studioLotSnapshot(state)
    state = adoptExistingSoundChain(applyActions(state, [{ kind: 'purchaseTechnology', technologyId: 'synchronized-sound' }]))
    const during = studioLotSnapshot(state)
    expect(during.buildings.find(b => b.id === 'stage-a')).toMatchObject({ available: false, attentionReason: expect.stringContaining('Installing') })
    expect(during.buildings.find(b => b.id === 'post')).toMatchObject({ available: false, attentionReason: expect.stringContaining('Installing') })
    expect(during.buildings.find(b => b.id === 'stage-b')).toEqual(before.buildings.find(b => b.id === 'stage-b'))
    expect(during.property!.buildings).toEqual(before.property!.buildings)
    state = advanceTo(state, Math.max(...state.placement.facilities.map(p => p.completesWeek)))
    const after = studioLotSnapshot(state)
    expect(after.buildings.find(b => b.id === 'stage-a')).toMatchObject({ available: true, attentionReason: expect.stringContaining('operational') })
    expect(after.buildings.find(b => b.id === 'post')).toMatchObject({ available: true, attentionReason: expect.stringContaining('operational') })
    expect(after.buildings.find(b => b.id === 'stage-a')!.attentionReason).not.toContain('Installing')
  })
})
