import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { exportSave, importSave, makeSave } from '../src/core/save.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
import { s3ForgeAndReimport } from '../src/harness/p13b/s3-fixtures.js'
// RED-by-design: `src/core/technologyAdoption.ts` does not exist yet. See
// tests/p13b-s5-quotes.test.ts for the full RED-design rationale (shared across
// every P13B-S5 test-author file).
import { adoptionQuote, equipmentAssets } from '../src/core/technologyAdoption.js'

// P13B-S5 test 3 (task expansion, 2026-09-17). Requirement-derived from
// test-list item 3 of "S5 — Component inventor pricing and prototypes per
// technology (Ready row 7) — task expansion" in docs/engineering/playability-
// launch-review/plans/P13B-HEADLESS-PLAN.md, and the delegated decision that
// Technology root v4 gains `equipment: TechnologyEquipmentAsset[]` (never
// deleted; S6 detaches a holder on cancellation).
//
// The brief's own instruction for reaching an UNHELD asset without S6:
// "forge-and-reimport a V24 save whose asset row has holderAdoptionId null and
// no adoption references it (that is a lawful V24 state)" — using
// `s3ForgeAndReimport` (src/harness/p13b/s3-fixtures.ts), the SAME round-trip
// technique tests/p13b-s3-validation.test.ts already uses for facts this
// engine's public action surface cannot organically produce.
//
// RE-EXPRESSED (test-author, P14A.1 T4, evidence 24/25): the two forged-unheld
// cases below used to hard-set a FORGED equipment id and `nextEquipmentId`
// value that assumed the world held exactly one (or zero) prior equipment
// rows. Under the market/seat-budget law, `p13aLaboratorySlice()` and
// `p13bTwoLabWorld()` (built on it) can legitimately already hold a rival's
// own equipment row before this test's own forge runs (a rival now
// independently reaches sound by the research route), so the world's
// `nextEquipmentId` may already be past the hard-set value — the engine's own
// root stays self-consistent (index N against nextEquipmentId N+1); the
// refusal was produced by the forge asserting a counter it does not own, not
// by any engine predicate. Both cases now read the LIVE `nextEquipmentId` at
// forge time and inject at that free index, which is forge-order independent
// and survives any future rival asset. No assertion below is weakened.

const SOUND = technologyEntry('synchronized-sound')
const LIGHTING = technologyEntry('lighting-control-01')

function begin(state: GameState, technologyId: string, budgetPerWeek: number): GameState {
  const project = state.technology.projects.find(p => p.technologyId === technologyId && p.studioId === state.hollywood!.playerStudioId)!
  return applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek }])
}
function runToCompletion(state: GameState, technologyId: string, boundWeek: number): GameState {
  let next = state
  while (next.technology.projects.find(p => p.technologyId === technologyId && p.studioId === next.hollywood!.playerStudioId)!.status !== 'completed') {
    if (next.market.tick > boundWeek) throw new Error(`p13b-s5-equipment fixture: ${technologyId} research did not complete before week ${boundWeek}`)
    next = advanceTo(next, next.market.tick + 1)
  }
  return next
}
function soundInventorReady(): GameState {
  return runToCompletion(begin(p13aResearchReady(), 'synchronized-sound', 10_000), 'synchronized-sound', 400)
}

type EquipmentRow = { id: string; studioId: string; technologyId: string; acquiredWeek: number; source: string; cost: number; holderAdoptionId: string | null }
function technologyOf(parsed: Record<string, unknown>): Record<string, unknown> {
  return (parsed.state as Record<string, unknown>).technology as Record<string, unknown>
}
function equipmentOf(parsed: Record<string, unknown>): EquipmentRow[] {
  return technologyOf(parsed).equipment as EquipmentRow[]
}

describe('P13B-S5 equipment assets (test 3)', () => {
  it('an adoption’s equipment asset is minted exactly once, held by it, and never duplicated by a second adoption', () => {
    let state = soundInventorReady()
    const stage1 = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const stage2 = state.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== stage1)!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    const own = state.hollywood!.playerStudioId

    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: stage1, postFacilityId }])
    const firstAdoption = state.technology.adoptions.find(a => a.stageFacilityId === stage1)!
    const afterFirst = equipmentAssets(state, own)
    expect(afterFirst).toHaveLength(1)
    expect(afterFirst[0]!.holderAdoptionId).toBe(firstAdoption.id)
    expect(afterFirst[0]!.cost).toBe(0)
    expect(afterFirst[0]!.source).toBe('first-prototype')
    expect((firstAdoption as unknown as { equipmentAssetId: string }).equipmentAssetId).toBe(afterFirst[0]!.id)
    const firstAssetBytes = JSON.stringify(afterFirst[0])

    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks)
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: SOUND.id, stageFacilityId: stage2, postFacilityId } as never])
    const secondAdoption = state.technology.adoptions.find(a => a.stageFacilityId === stage2)!
    const afterSecond = equipmentAssets(state, own)
    expect(afterSecond).toHaveLength(2) // minted once per adoption, never duplicated
    const secondAsset = afterSecond.find(a => a.holderAdoptionId === secondAdoption.id)!
    expect(secondAsset.cost).toBe(SOUND.laterInventorEquipmentCost)
    expect(secondAsset.source).toBe('later-inventor')
    // The first asset's row is byte-identical: minting the second never rewrites it.
    const firstAssetAfter = afterSecond.find(a => a.holderAdoptionId === firstAdoption.id)!
    expect(JSON.stringify(firstAssetAfter)).toBe(firstAssetBytes)
  })

  it('an unheld retained asset (holderAdoptionId null, referenced by no adoption) is reused at $0 by a NEW adoption of the SAME technology', () => {
    let state = soundInventorReady()
    const stage1 = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const stage2 = state.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== stage1)!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    const own = state.hollywood!.playerStudioId
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: stage1, postFacilityId }]) // mints "...:equipment:0", held
    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks)

    let injectedId = ''
    state = s3ForgeAndReimport(state, parsed => {
      const equipment = equipmentOf(parsed)
      const n = technologyOf(parsed).nextEquipmentId as number
      injectedId = `${own}:equipment:${n}`
      equipment.push({ id: injectedId, studioId: own, technologyId: SOUND.id, acquiredWeek: state.market.tick, source: 'later-inventor', cost: SOUND.laterInventorEquipmentCost, holderAdoptionId: null })
      technologyOf(parsed).nextEquipmentId = n + 1
    })

    const beforeAdopt = equipmentAssets(state, own)
    const unheld = beforeAdopt.find(a => a.id === injectedId)!
    expect(unheld.holderAdoptionId).toBeNull()

    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: SOUND.id, stageFacilityId: stage2, postFacilityId } as never])
    const secondAdoption = state.technology.adoptions.find(a => a.stageFacilityId === stage2)!
    expect((secondAdoption as unknown as { equipmentAssetId: string }).equipmentAssetId).toBe(injectedId) // reused, not re-minted
    const afterAdopt = equipmentAssets(state, own)
    expect(afterAdopt.find(a => a.id === injectedId)!.holderAdoptionId).toBe(secondAdoption.id)
    expect(afterAdopt).toHaveLength(2) // still exactly two assets total: reuse never mints a third
    const quote = adoptionQuote(state, { technologyId: SOUND.id, stageFacilityId: stage2, postFacilityId })
    const equipmentComponent = quote.components.find(c => c.kind === 'equipment')
    if (equipmentComponent) { expect(equipmentComponent.cost).toBe(0); expect(equipmentComponent.source).toBe('existing') }
  })

  it('an unheld retained asset of one technology is NEVER reused by a different technology’s adoption', () => {
    const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
    let state = applyActions(world, candidateIds.slice(0, 4).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
    state = begin(state, 'lighting-control-01', 40_000)
    state = runToCompletion(state, 'lighting-control-01', 900)
    const own = state.hollywood!.playerStudioId
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id

    // Inject an UNHELD SOUND equipment asset (structurally, since this world never
    // researched sound) into the lighting-ready world, then confirm a lighting
    // quote never reuses it (cross-technology reuse must be refused by construction).
    let injectedId = ''
    state = s3ForgeAndReimport(state, parsed => {
      const equipment = equipmentOf(parsed)
      const n = technologyOf(parsed).nextEquipmentId as number
      injectedId = `${own}:equipment:${n}`
      equipment.push({ id: injectedId, studioId: own, technologyId: SOUND.id, acquiredWeek: state.market.tick, source: 'commercial', cost: SOUND.commercialEquipmentCost, holderAdoptionId: null })
      technologyOf(parsed).nextEquipmentId = n + 1
    })

    const quote = adoptionQuote(state, { technologyId: LIGHTING.id, stageFacilityId })
    const equipment = quote.components.find(c => c.kind === 'equipment')!
    expect(equipment.source).toBe('first-prototype') // lighting's OWN unconsumed entitlement, never the sound asset
    expect(equipment.cost).toBe(0)
    expect(equipmentAssets(state, own).find(a => a.id === injectedId)!.holderAdoptionId).toBeNull() // still unheld: untouched
  })

  it('a held asset cannot be reused: two adoptions naming the same equipmentAssetId is refused on reimport', () => {
    let state = soundInventorReady()
    const stage1 = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const stage2 = state.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== stage1)!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: stage1, postFacilityId }])
    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks)
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: SOUND.id, stageFacilityId: stage2, postFacilityId } as never])
    const [firstId, secondId] = state.technology.adoptions.map(a => (a as unknown as { equipmentAssetId: string }).equipmentAssetId)

    expect(() => s3ForgeAndReimport(state, parsed => {
      const equipment = equipmentOf(parsed)
      const held = equipment.find(a => a.id === firstId)!
      held.holderAdoptionId = state.technology.adoptions.find(a => (a as unknown as { equipmentAssetId: string }).equipmentAssetId === secondId)!.id // both adoptions now claim the SAME asset
    })).toThrow()
  })

  it('exported-save round trip never fabricates an equipment row: makeSave/exportSave/importSave over an unmutated adoption reproduces the same equipment array byte for byte', () => {
    let state = soundInventorReady()
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId, postFacilityId }])
    const json = exportSave(makeSave(state))
    const reimported = (importSave(json) as unknown as { state: GameState }).state
    const own = state.hollywood!.playerStudioId
    expect(JSON.stringify(equipmentAssets(reimported, own))).toBe(JSON.stringify(equipmentAssets(state, own)))
  })
})
