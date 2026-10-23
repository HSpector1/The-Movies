// Stabilization 2026-10-23, Owner decision 9A on audit finding L-32 (FAC-06).
//
// A cancelled technology adoption held its stage forever: the adoption quote, the save validator
// and the Laboratory page keyed stage uniqueness on EVERY adoption row, so the only restart left
// was a raw P09 installation that no adoption owned, and productions never got its effect. The
// ruling: only a live (uncancelled) adoption holds its stage; a restart is a new placement and a
// new adoption that owns it.
//
// Route: the first-inventor sound adoption committed at week 303 (`s6SoundReady`), cancelled in its
// commit week (no site work begun, so no restoration holds the stage), then adopted again on the
// same stage and Post through the public action.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { exportSave, importSave, makeSave, migrateToLive } from '../src/core/save.js'
import { validateTechnology } from '../src/core/technology.js'
import { adoptionChainOperational, adoptionQuote } from '../src/core/technologyAdoption.js'
import type { TechnologyAdoption } from '../src/core/technologyTypes.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { s6SoundReady } from '../src/harness/p13b/s6-fixtures.js'

const REFUSAL = 'This stage already has a synchronized-sound adoption commitment.'

describe('L-32: a restart after a cancelled adoption is a new adoption that owns its installation', () => {
  // The route (generated world, sound research, adoption, cancellation, restart) runs once; each
  // test below reads it and never mutates it.
  let cancelled: GameState, restarted: GameState, old: TechnologyAdoption, restart: TechnologyAdoption
  let stageFacilityId: string, postFacilityId: string
  beforeAll(() => {
    const ready = s6SoundReady()
    ;({ stageFacilityId, postFacilityId } = ready)
    cancelled = applyActions(ready.state, [{ kind: 'cancelAdoption', adoptionId: ready.adoptionId }])
    old = cancelled.technology.adoptions.find((a) => a.id === ready.adoptionId)!
    restarted = applyActions(cancelled, [{ kind: 'adoptSynchronizedSound', stageFacilityId, postFacilityId }])
    restart = restarted.technology.adoptions.find((a) => a.stageFacilityId === stageFacilityId && a.cancelledWeek === null)!
  }, 120_000)

  it('premise: the first adoption is cancelled in its commit week, holds no equipment and owes no restoration', () => {
    expect(old).toMatchObject({ stageFacilityId, postFacilityId, cancelledWeek: cancelled.market.tick, operationalWeek: null })
    expect(cancelled.placement.facilities.filter((f) => f.installation?.targetFacilityId === stageFacilityId).map((f) => f.status))
      .toEqual(['cancelled'])
    expect(cancelled.technology.equipment.find((e) => e.id === old.equipmentAssetId)!.holderAdoptionId).toBeNull()
  })

  it('the restart on the same stage is quoted and committed as a new adoption; the cancelled row stays as history', () => {
    const quote = adoptionQuote(cancelled, { technologyId: 'synchronized-sound', stageFacilityId, postFacilityId })
    expect(quote.rejections).toEqual([])
    expect(quote.ok).toBe(true)
    expect(quote.reusedEquipmentAssetId).toBe(old.equipmentAssetId)
    expect(restart).toBeDefined()
    expect(restart.id).not.toBe(old.id)
    expect(restarted.technology.adoptions.find((a) => a.id === old.id)).toEqual(old)
  })

  it('the new adoption owns the restarted stage and Post work and holds the reused equipment', () => {
    const jobs = restarted.placement.facilities.filter((f) => restart.physicalProjectIds.includes(f.projectId))
    expect(jobs.map((f) => [f.blueprintId, f.installation?.targetFacilityId, f.status, f.placedWeek])).toEqual([
      ['synchronized-sound-stage', stageFacilityId, 'underConstruction', restarted.market.tick],
      ['synchronized-sound-post', postFacilityId, 'underConstruction', restarted.market.tick],
    ])
    expect(old.physicalProjectIds.some((id) => restart.physicalProjectIds.includes(id))).toBe(false)
    expect(restart.equipmentAssetId).toBe(old.equipmentAssetId)
    expect(restart.equipmentCost).toBe(0)
    expect(restarted.technology.equipment.find((e) => e.id === restart.equipmentAssetId)!.holderAdoptionId).toBe(restart.id)
  })

  it('a second adoption while the restart is live on that stage is still refused, by the quote, the action and the save law', () => {
    expect(adoptionQuote(restarted, { technologyId: 'synchronized-sound', stageFacilityId, postFacilityId }))
      .toMatchObject({ ok: false, refusal: REFUSAL })
    expect(() => applyActions(restarted, [{ kind: 'adoptSynchronizedSound', stageFacilityId, postFacilityId }])).toThrow(REFUSAL)
    // A cancelled row never holds the stage; a second LIVE row on it is a duplicate.
    expect(() => validateTechnology(restarted, true)).not.toThrow()
    const twin = structuredClone(restarted)
    twin.technology.adoptions.push({ ...structuredClone(restart), id: `${restart.id}-twin` })
    expect(() => validateTechnology(twin, true)).toThrow('duplicate adoption')
  })

  it('the save round-trip stays lawful after the restart, and the restart becomes operational on its own work', () => {
    const bytes = exportSave(makeSave(restarted))
    expect(exportSave(makeSave(migrateToLive(importSave(bytes)).state))).toBe(bytes)
    const completes = Math.max(...restarted.placement.facilities
      .filter((f) => restart.physicalProjectIds.includes(f.projectId)).map((f) => f.completesWeek))
    const finished = advanceTo(restarted, completes + 1)
    const live = finished.technology.adoptions.find((a) => a.id === restart.id)!
    expect(live.operationalWeek).toBe(completes)
    expect(adoptionChainOperational(finished, live)).toBe(true)
    expect(finished.technology.adoptions.find((a) => a.id === old.id)).toEqual(old)
    expect(() => makeSave(finished)).not.toThrow()
  }, 60_000)
})
