import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { commitFacilityInstallation } from '../src/core/placement.js'
import { researchCandidates } from '../src/core/technology.js'
import { TECHNOLOGY_CATALOGUE, validateTechnologyCatalogue } from '../src/core/technologyCatalogue.js'
import { FACILITY_BLUEPRINTS } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'

// P13B-S2 plan test 1 (task expansion, 2026-09-16): the second catalogue entry
// (`lighting-control-01`), its per-technology parameters read from the entry
// (not the hard-coded SYNCHRONIZED_SOUND constant), its physical blueprints,
// catalogue-shape refusals and one project per (studio, technology). Every
// assertion is derived from plan §S2 and its companion §4/03 identifiers, not
// from the current single-entry engine. Generated worlds only.

describe('P13B-S2 catalogue: two technologies, stable order (test 1)', () => {
  it('has exactly two entries in stable ascending id order', () => {
    expect(TECHNOLOGY_CATALOGUE.map(e => e.id)).toEqual(['lighting-control-01', 'synchronized-sound'])
  })

  it('validateTechnologyCatalogue accepts the shipped two-entry catalogue without a forced override', () => {
    expect(() => validateTechnologyCatalogue()).not.toThrow()
  })

  it('lighting-control-01 carries its delivered per-technology parameters on the catalogue entry itself', () => {
    const lighting = TECHNOLOGY_CATALOGUE.find(e => e.id === 'lighting-control-01')
    expect(lighting).toMatchObject({
      researchableWeek: 780, commercialWeek: 936, work: 64, usableBudgetPerScientist: 10_000,
      accessCost: 100_000, commercialEquipmentCost: 200_000, laterInventorEquipmentCost: 150_000,
      instrumentBlueprintId: 'electrical-control-instruments', stageInstallationId: 'lighting-control-stage',
      postInstallationId: null, prerequisiteTechnologyIds: [],
    })
  })

  it('synchronized-sound keeps its delivered per-technology parameters on the catalogue entry itself (not only on SYNCHRONIZED_SOUND)', () => {
    const sound = TECHNOLOGY_CATALOGUE.find(e => e.id === 'synchronized-sound')
    expect(sound).toMatchObject({
      researchableWeek: 260, commercialWeek: 416, work: 64, usableBudgetPerScientist: 10_000,
      accessCost: 200_000, commercialEquipmentCost: 300_000, laterInventorEquipmentCost: 225_000,
      instrumentBlueprintId: 'acoustic-instruments', stageInstallationId: 'synchronized-sound-stage',
      postInstallationId: 'synchronized-sound-post', prerequisiteTechnologyIds: [],
    })
  })

  it('the electrical/control module is a real, reachable physical blueprint on a Laboratory', () => {
    const blueprint = FACILITY_BLUEPRINTS.find(b => b.id === 'electrical-control-instruments')
    expect(blueprint).toMatchObject({
      capability: 'laboratory', installationTargetCapability: 'laboratory',
      capex: 350_000, buildWeeks: 5, weeklyOperatingCost: 2_000, requires: [],
    })
  })

  it('lighting-control-stage is a real, reachable physical blueprint requiring the lighting research pack', () => {
    const blueprint = FACILITY_BLUEPRINTS.find(b => b.id === 'lighting-control-stage')
    expect(blueprint).toMatchObject({
      installationTargetCapability: 'soundstage', capex: 100_000, buildWeeks: 4, weeklyOperatingCost: 1_000,
    })
    expect(blueprint?.requires).toEqual([{ kind: 'research', packId: 'lighting-control-01' }])
  })

  it('refuses a forged third catalogue entry', () => {
    const forged = [...TECHNOLOGY_CATALOGUE, { ...TECHNOLOGY_CATALOGUE[0]!, id: 'holographic-projection' }]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => validateTechnologyCatalogue(forged as any)).toThrow()
  })

  it('refuses a cyclic prerequisite between the two real entries', () => {
    const cyclic = TECHNOLOGY_CATALOGUE.map(e => ({
      ...e,
      prerequisiteTechnologyIds: TECHNOLOGY_CATALOGUE.filter(o => o.id !== e.id).map(o => o.id),
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => validateTechnologyCatalogue(cyclic as any)).toThrow(/cyclic/)
  })

  it('refuses an entry naming an unknown physical instrument blueprint', () => {
    const broken = TECHNOLOGY_CATALOGUE.map(e => e.id === 'lighting-control-01' ? { ...e, instrumentBlueprintId: 'not-a-real-blueprint' } : e)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => validateTechnologyCatalogue(broken as any)).toThrow()
  })

  it('the ordinary action surface (knownTechnology) accepts both technology ids, not only synchronized-sound', () => {
    const state = p13aLaboratorySlice() // week 12, founded, player studio active
    expect(() => applyActions(state, [{ kind: 'waitForTechnology', technologyId: 'lighting-control-01' }])).not.toThrow()
    expect(() => applyActions(state, [{ kind: 'waitForTechnology', technologyId: 'synchronized-sound' }])).not.toThrow()
  })

  describe('one research project per (studio, technology)', () => {
    let state: GameState
    let laboratoryFacilityId: string

    beforeAll(() => {
      let s = p13aLaboratorySlice()
      laboratoryFacilityId = s.operations.facilities.find(f => f.capability === 'laboratory')!.id
      // Both discipline modules on the one Laboratory, so a module-presence
      // refusal (test 2) cannot be the reason this identity check fails.
      s = commitFacilityInstallation(s, { blueprintId: 'acoustic-instruments', targetFacilityId: laboratoryFacilityId })
      s = commitFacilityInstallation(s, { blueprintId: 'electrical-control-instruments', targetFacilityId: laboratoryFacilityId })
      s = advanceTo(s, 780)
      const [a, b] = researchCandidates(s).map(c => c.id)
      s = applyActions(s, [
        { kind: 'recruitScientist', laboratoryFacilityId, scientistId: a },
        { kind: 'recruitScientist', laboratoryFacilityId, scientistId: b },
      ])
      s = applyActions(s, [
        { kind: 'assignResearchScientist', laboratoryFacilityId, scientistId: a, technologyId: 'synchronized-sound' },
        { kind: 'assignResearchScientist', laboratoryFacilityId, scientistId: b, technologyId: 'lighting-control-01' },
      ])
      state = s
    }, 60_000)

    it('creates two distinct projects keyed by (studio, technology), not one shared synchronized-sound project', () => {
      expect(state.technology.projects).toHaveLength(2)
      const own = state.hollywood!.playerStudioId
      expect(state.technology.projects.map(p => p.id).sort()).toEqual([
        `${own}:research:lighting-control-01`,
        `${own}:research:synchronized-sound`,
      ])
      expect(state.technology.projects.map(p => p.technologyId).sort()).toEqual(['lighting-control-01', 'synchronized-sound'])
    })
  })
})
