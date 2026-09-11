import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import { commitPlacement, demolishFacility, facilityDemolitionRefusal, moveFacility, queryFacilityInstallation } from '../src/core/placement.js'
import { exportSave, importSave, makeSave, migrateToV20 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { generateWorld } from '../src/core/worldgen.js'

describe('P13A retained research Laboratory identity', () => {
  it('keeps paused and cancelled Laboratory references intact without blocking lawful instrument installation', () => {
    const generated = generateWorld('p13a-research-identity')
    let state = initializeHollywood(applyActions({ ...generated, economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }]), 'fresh')
    state = commitPlacement(state, { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    while (state.market.tick < 12) state = tick(state)
    const lab = state.placement.facilities[0]!
    state = applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId: lab.facilityId }])
    const scientistId = state.talent.find(person => person.role === 'scientist')!.id
    state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab.facilityId, scientistId }])
    const projectId = state.technology.projects[0]!.id
    for (const status of ['paused', 'cancelled'] as const) {
      if (status === 'cancelled') state = applyActions(state, [{ kind: 'cancelResearch', projectId }])
      const claims = resourceClaimsOf(occupiedResourceSlots(state)).filter(claim => claim.owner === 'research')
      expect(claims).toHaveLength(1)
      expect(claims[0]).toMatchObject({ ownerId: projectId, facilityId: lab.facilityId, slot: null, facilitySlotKey: null })
      expect(facilityDemolitionRefusal(state, { placementId: lab.id })).toMatchObject({ code: 'facilityEngaged', holders: [{ kind: 'research', holderId: projectId }] })
      expect(demolishFacility(state, { placementId: lab.id })).toBe(state)
      expect(moveFacility(state, { placementId: lab.id, origin: { gx: 5, gy: 9 } })).toBe(state)
      expect(queryFacilityInstallation(state, { blueprintId: 'acoustic-instruments', targetFacilityId: lab.facilityId }).ok).toBe(true)
      const json = exportSave(makeSave(state))
      expect(exportSave(makeSave(migrateToV20(importSave(json)).state))).toBe(json)
    }
    const installed = applyActions(state, [{ kind: 'installAcousticInstruments', laboratoryFacilityId: lab.facilityId }])
    expect(installed.placement.facilities).toHaveLength(2)
    expect(resourceClaimsOf(occupiedResourceSlots(installed)).filter(claim => claim.owner === 'installation' && claim.slot !== null)).toHaveLength(4)
    const installedJson = exportSave(makeSave(installed))
    expect(exportSave(makeSave(migrateToV20(importSave(installedJson)).state))).toBe(installedJson)
  }, 30_000)
})
