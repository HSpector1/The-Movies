// ── P13B-S8 test 6: S5-R07 symmetry — a real rival production takes the
// lighting route through deriveSetupProvenance, with rival provenance ─────
//
// Requirement-derived from "S8 — Symmetric rival research and finance" scope
// record ("S5-R07 symmetry: rival productions use the same setup recipe/unit
// law with their own provenance; no shortcut"), the plan's "Tests" item 6
// ("S5-R07 symmetry through a real rival production"), the Refinement's own
// words ("a rival production on a rival stage with an operational rival
// lighting adoption takes the lighting route through deriveSetupProvenance
// with rival provenance — through the SAME functions; no shortcut; measured
// units 4 -> 2"), and the Audit's S8 LAW item 5 (B5): "deriveSetupProvenance
// (state, recipe, stageFacilityId, week, studioId = playerStudioId(state))
// — parameter added, both existing call sites unchanged; test 6 is authored
// against the parameterised signature (a prerequisite source change, RED at
// the missing parameter's effect, not at resolution)."
//
// RED-by-design: `src/core/rivalResearch.ts` does not exist yet.
// `RIVAL_RESEARCH_POLICY` is the import from that new module and is READ
// below, so this file fails at module resolution before any test body runs
// — the blanket rule this whole P13B-S8-T1 assignment follows for all seven
// files. `deriveSetupProvenance` itself is real, existing code
// (productionSetup.ts) at its CURRENT 4-parameter signature; case "today"
// below calls it with the future 5th argument extra (a no-op at runtime
// under today's signature — TypeScript's own excess-argument checking is
// not enforced by vitest's esbuild transform, which does not type-check),
// documenting exactly the Audit's own phrase: "RED at the missing
// parameter's effect, not at resolution."
//
// RULING (coordinator, plan authority, 2026-09-18 — supersedes this file's
// own original "PREMISES NAMED" §1 below, which wrongly resolved the same
// gap it correctly named): rivals own NO placements. The chain-operational
// check (`lightingAdoption` -> `adoptionChainOperational` ->
// `hasOperationalFacilityInstallation`) resolves physical completion PER
// STUDIO — player: placements, exactly as today; rival: the adoption's own
// clock (`operationalWeek !== null`) with its held equipment asset, NEVER a
// placement lookup. This is adjudication (b), now an S8-T2 source change
// landing concurrently in sim-core. This file's fixture therefore injects NO
// `state.placement.facilities` row for the rival at all — a placement-less
// rival adoption, operational purely by its own `operationalWeek` clock, is
// the LAWFUL construction, not a workaround for one.
//
// PREMISES NAMED:
//   1. `RIVAL_RESEARCH_POLICY`'s shape/bounds premise is the same one
//      tests/p13b-s8-adoption.test.ts's header states (not repeated here).

import { describe, expect, it } from 'vitest'
import { deriveSetupProvenance, setupRecipeById } from '../src/core/productionSetup.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import type { HollywoodState, RivalBusiness } from '../src/core/hollywoodTypes.js'
import type { TechnologyAdoption, TechnologyEquipmentAsset } from '../src/core/technologyTypes.js'
// RED-by-design: src/core/rivalResearch.ts does not exist yet. This is the
// ONE import from that new module in this file.
import { RIVAL_RESEARCH_POLICY } from '../src/core/rivalResearch.js'

const SEED = 'p13b-s8-setup-symmetry-01'

function bellwether(state: GameState): { hollywood: HollywoodState; business: RivalBusiness } {
  const hollywood = state.hollywood!
  const identity = hollywood.identities.find(s => s.row === 1)!
  const business = hollywood.businesses.find(b => b.studioId === identity.studioId)!
  return { hollywood, business }
}

/** A genuine (for this file's purposes) OPERATIONAL rival lighting-control-01 adoption on the rival's own stage: access, adoption (operational by its own clock), and its held equipment asset. Placement-less throughout — see the RULING above: rivals own no placements; the rival branch resolves physical completion through the adoption's own `operationalWeek`, never a placement lookup. */
function withOperationalRivalLighting(state: GameState) {
  const { business } = bellwether(state)
  const stage = business.operations.facilities.find(f => f.capability === 'soundstage')!
  const entry = technologyEntry('lighting-control-01')
  const week = entry.researchableWeek + 5
  const access = { studioId: business.studioId, technologyId: 'lighting-control-01' as const, route: 'research' as const,
    chosenWeek: week, acquiredWeek: week, accessCost: 0, researchProjectId: `${business.studioId}:research:lighting-control-01` }
  const equipmentAssetId = `${business.studioId}:equipment:0`
  const asset: TechnologyEquipmentAsset = { id: equipmentAssetId, studioId: business.studioId, technologyId: 'lighting-control-01',
    acquiredWeek: week, source: 'first-prototype', cost: 0, holderAdoptionId: `${business.studioId}:lighting-control-01:adoption:0` }
  const adoption: TechnologyAdoption = { id: asset.holderAdoptionId!, studioId: business.studioId, technologyId: 'lighting-control-01',
    stageFacilityId: stage.id, postFacilityId: null, route: 'research', committedWeek: week, operationalWeek: week, cancelledWeek: null,
    equipmentCost: 0, installationCost: 0, physicalProjectIds: [], prototypeProjectId: access.researchProjectId, components: [], equipmentAssetId }
  const withState: GameState = {
    ...state,
    technology: { ...state.technology, access: [...state.technology.access, access], adoptions: [...state.technology.adoptions, adoption],
      equipment: [...state.technology.equipment, asset] },
  }
  return { state: withState, business, stageFacilityId: stage.id, week, adoption, asset }
}

describe('P13B-S8 setup symmetry: a real rival production takes the lighting route through deriveSetupProvenance (test 6)', () => {
  it('core: deriveSetupProvenance(state, recipe, rivalStage, week, rivalStudioId) returns route "lighting" with the rival\'s own adoptionId/equipmentAssetId and units 4 -> 2', () => {
    const base = p13aGeneratedStudio(SEED)
    const { state, business, stageFacilityId, week, adoption, asset } = withOperationalRivalLighting(base)
    const recipe = setupRecipeById('ballroom-reveal-lighting-01')!
    expect(recipe.units).toEqual({ conventional: 4, lighting: 2 })

    const provenance = (deriveSetupProvenance as unknown as (
      state: GameState, recipe: typeof recipe, stageFacilityId: string, week: number, studioId: string,
    ) => ReturnType<typeof deriveSetupProvenance>)(state, recipe, stageFacilityId, week, business.studioId)

    expect(provenance.route).toBe('lighting')
    expect(provenance.adoptionId).toBe(adoption.id)
    expect(provenance.equipmentAssetId).toBe(asset.id)
    expect(provenance.requiredUnits).toBe(2) // "units 4 -> 2"
  })

  it('symmetry: the SAME call for the PLAYER studio (no lighting adoption of its own) on the identical state returns "conventional" — one studio\'s plant is never mistaken for another\'s', () => {
    const base = p13aGeneratedStudio(SEED)
    const { state, stageFacilityId, week } = withOperationalRivalLighting(base)
    const recipe = setupRecipeById('ballroom-reveal-lighting-01')!
    const playerStudioId = state.hollywood!.playerStudioId

    const playerProvenance = (deriveSetupProvenance as unknown as (
      state: GameState, recipe: typeof recipe, stageFacilityId: string, week: number, studioId: string,
    ) => ReturnType<typeof deriveSetupProvenance>)(state, recipe, stageFacilityId, week, playerStudioId)

    expect(playerProvenance.route).toBe('conventional')
    expect(playerProvenance.adoptionId).toBeNull()
    expect(playerProvenance.requiredUnits).toBe(4)
  })

  it('TODAY (pre-S8, the current 4-parameter signature): the same call with no studioId argument resolves to the PLAYER regardless of which stage is asked about, so it never sees the rival\'s own operational adoption — "RED at the missing parameter\'s effect, not at resolution"', () => {
    const base = p13aGeneratedStudio(SEED)
    const { state, stageFacilityId, week } = withOperationalRivalLighting(base)
    const recipe = setupRecipeById('ballroom-reveal-lighting-01')!
    const todayProvenance = deriveSetupProvenance(state, recipe, stageFacilityId, week) // no 5th argument
    expect(todayProvenance.route).toBe('conventional') // the rival's own adoption is invisible to the player-hardcoded resolver
    expect(todayProvenance.requiredUnits).toBe(4)
  })

  it('RIVAL_RESEARCH_POLICY names lighting-control-01 as a technology of rival interest (its interestFromWeek pinned to researchableWeek — the same premise tests/p13b-s8-adoption.test.ts states in full)', () => {
    const row = RIVAL_RESEARCH_POLICY.find((p: { technologyId: string }) => p.technologyId === 'lighting-control-01')
    expect(row).toBeDefined()
    expect(row.interestFromWeek).toBe(technologyEntry('lighting-control-01').researchableWeek)
  })
})
