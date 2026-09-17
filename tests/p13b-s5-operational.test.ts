import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hasOperationalFacilityInstallation } from '../src/core/facilityEffects.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
// RED-by-design: `src/core/technologyAdoption.ts` does not exist yet. See
// tests/p13b-s5-quotes.test.ts for the full RED-design rationale (shared across
// every P13B-S5 test-author file); not repeated in each file below.
import { adoptionQuote } from '../src/core/technologyAdoption.js'

// P13B-S5 test 2 (task expansion, 2026-09-17). Requirement-derived from
// test-list item 2 of "S5 — Component inventor pricing and prototypes per
// technology (Ready row 7) — task expansion" in docs/engineering/playability-
// launch-review/plans/P13B-HEADLESS-PLAN.md, plus the coordinator's 2026-09-17
// correction: a lighting adoption's persisted `postFacilityId` is `null` (not a
// marker string), while a sound row keeps its real facility id even when an
// existing operational Post is reused.
//
// LIMITATION RECORDED (do not silently narrow the requirement): "technologyProduction
// still locks sound only" is proven here ONLY at the discriminating mechanism
// `setProductionTechnology`/`retargetProductionTechnologyChoice` actually reads
// (`hasOperationalFacilityInstallation(state, adoption.stageFacilityId,
// 'synchronized-sound-stage')`, technologyProduction.ts's private
// `operationalAdoption`) — a full `setProductionTechnology` round-trip through a
// REAL greenlit production needs `tests/contracts/_contractFixtures.ts`
// (`operationsStudio`/`productionPayload`, the fixtures
// tests/p13a-production-technology.test.ts already uses for exactly this), which
// is NOT one of this brief's four enumerated lawful harness fixtures. A fresh
// generated P13A/P13B world carries ZERO active player productions (measured
// 2026-09-17: `state.studio.activeProductions.length === 0` on
// `p13aResearchReady()`), and hand-authoring a full `Production` object (shape,
// promise, budget, forecastSnapshot — none of it read by this file so far) risks
// a spurious pass/fail unrelated to this requirement. This is the honest limit;
// see the final report for the same note.

const SOUND = technologyEntry('synchronized-sound')
const LIGHTING = technologyEntry('lighting-control-01')

function begin(state: GameState, technologyId: string, budgetPerWeek: number): GameState {
  const project = state.technology.projects.find(p => p.technologyId === technologyId)!
  return applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek }])
}
function runToCompletion(state: GameState, technologyId: string, boundWeek: number): GameState {
  let next = state
  while (next.technology.projects.find(p => p.technologyId === technologyId)!.status !== 'completed') {
    if (next.market.tick > boundWeek) throw new Error(`p13b-s5-operational fixture: ${technologyId} research did not complete before week ${boundWeek}`)
    next = advanceTo(next, next.market.tick + 1)
  }
  return next
}
function soundInventorReady(): GameState {
  return runToCompletion(begin(p13aResearchReady(), 'synchronized-sound', 10_000), 'synchronized-sound', 400)
}
function lightingInventorReady(): GameState {
  const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
  let state = applyActions(world, candidateIds.slice(0, 4).map(scientistId =>
    ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
  state = begin(state, 'lighting-control-01', 40_000)
  return runToCompletion(state, 'lighting-control-01', 900)
}
function facilityOpexSince(state: GameState, fromWeek: number): number {
  return state.ledger.filter(e => e.kind === 'facilityOpex' && e.week >= fromWeek).reduce((sum, e) => sum - e.amount, 0)
}

describe('P13B-S5 operational law and charges (test 2)', () => {
  it('lighting is operational at exactly committedWeek + 4 (deploymentWeeks), postFacilityId is null, and its +$1,000/week joins the ledger with no lag from the operational week onward', () => {
    expect(LIGHTING.deploymentWeeks).toBe(4)
    expect(TUNING.LIGHTING_MODULE_WEEKLY_OPERATING_COST).toBe(1_000)
    const ready = lightingInventorReady()
    const committedWeek = ready.market.tick
    const stageFacilityId = ready.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const withLighting0 = applyActions(ready, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId } as never])

    const finalWeek = committedWeek + 10
    const withLighting = advanceTo(withLighting0, finalWeek)
    const withoutLighting = advanceTo(ready, finalWeek) // twin baseline: same world, no lighting adoption committed

    const adoption = withLighting.technology.adoptions.find(a => a.technologyId === LIGHTING.id)!
    expect(adoption.operationalWeek).toBe(committedWeek + LIGHTING.deploymentWeeks)
    expect(adoption.postFacilityId).toBeNull()

    // Empirically verified convention (measured 2026-09-17 against the ALREADY-LIVE
    // acoustic-instruments installation on p13aResearchEntry(): completesWeek 17,
    // and the facilityOpex ledger row for week 17 ITSELF already includes its
    // weekly cost — no one-week lag): the delta over [committedWeek, finalWeek) is
    // exactly (finalWeek - operationalWeek) charged weeks.
    const chargedWeeks = finalWeek - adoption.operationalWeek!
    const delta = facilityOpexSince(withLighting, committedWeek) - facilityOpexSince(withoutLighting, committedWeek)
    expect(delta).toBe(chargedWeeks * TUNING.LIGHTING_MODULE_WEEKLY_OPERATING_COST)
  })

  it('sound with no postFacilityId and no existing operational Post anywhere in the studio is refused', () => {
    const state = soundInventorReady()
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    expect(() => applyActions(state, [{ kind: 'adoptTechnology', technologyId: SOUND.id, stageFacilityId } as never])).toThrow()
  })

  it('a second sound adoption reuses the existing operational Post: no new Post placement, no re-bill, and only the second stage’s own weekly cost joins the ledger', () => {
    let state = soundInventorReady()
    const stage1 = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: stage1, postFacilityId }])
    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks) // first adoption fully operational; Post's own $2,000/week already in the baseline

    const postPlacementsBefore = state.placement.facilities.filter(f => f.blueprintId === 'synchronized-sound-post')
    expect(postPlacementsBefore).toHaveLength(1)
    const postCapexBefore = state.ledger.filter(e => e.kind === 'constructionCapex' && e.constructionProjectId === postPlacementsBefore[0]!.projectId).reduce((s, e) => s - e.amount, 0)
    expect(postCapexBefore).toBe(TUNING.SOUND_POST_CAPEX)

    const stage2 = state.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== stage1)!.id
    const committedWeek2 = state.market.tick
    const withSecond0 = applyActions(state, [{ kind: 'adoptTechnology', technologyId: SOUND.id, stageFacilityId: stage2, postFacilityId } as never])

    // No new Post placement was ever created by the second adoption.
    const postPlacementsAfter = withSecond0.placement.facilities.filter(f => f.blueprintId === 'synchronized-sound-post')
    expect(postPlacementsAfter).toHaveLength(1)
    expect(postPlacementsAfter[0]!.projectId).toBe(postPlacementsBefore[0]!.projectId)
    // No new capex for the Post: the SAME single capex row still reconciles to exactly one POST_CAPEX total.
    const postCapexAfter = withSecond0.ledger.filter(e => e.kind === 'constructionCapex' && e.constructionProjectId === postPlacementsBefore[0]!.projectId).reduce((s, e) => s - e.amount, 0)
    expect(postCapexAfter).toBe(TUNING.SOUND_POST_CAPEX)

    const finalWeek = committedWeek2 + 15
    const withSecond = advanceTo(withSecond0, finalWeek)
    const withoutSecond = advanceTo(state, finalWeek) // twin baseline: no second adoption
    const secondAdoption = withSecond.technology.adoptions.find(a => a.stageFacilityId === stage2)!
    expect(secondAdoption.operationalWeek).toBe(committedWeek2 + SOUND.deploymentWeeks)
    const chargedWeeks = finalWeek - secondAdoption.operationalWeek!
    const delta = facilityOpexSince(withSecond, committedWeek2) - facilityOpexSince(withoutSecond, committedWeek2)
    // ONLY the stage's own weekly cost — the reused Post's weekly cost was already
    // present in BOTH twins' baseline since the first adoption, so it cancels out
    // of the diff and must not be double-counted here.
    expect(delta).toBe(chargedWeeks * TUNING.SOUND_MODULE_WEEKLY_OPERATING_COST)
  })

  it('the sound-only production lock discriminator: a lighting adoption’s stage never carries the synchronized-sound-stage installation a sound adoption’s stage does', () => {
    // This is the exact fact `technologyProduction.ts`'s (unexported)
    // `operationalAdoption` reads to refuse a lighting adoption for
    // `setProductionTechnology({method:'synchronized-dialogue', ...})` — proven
    // here directly against the public `hasOperationalFacilityInstallation` read,
    // since a full production round-trip is out of reach of this brief's
    // enumerated fixtures (see the file-level LIMITATION note above).
    const soundReady = soundInventorReady()
    const soundStage = soundReady.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const soundPost = soundReady.operations.facilities.find(f => f.capability === 'post')!.id
    let sound = applyActions(soundReady, [{ kind: 'adoptSynchronizedSound', stageFacilityId: soundStage, postFacilityId: soundPost }])
    sound = advanceTo(sound, sound.market.tick + SOUND.deploymentWeeks)
    expect(hasOperationalFacilityInstallation(sound, soundStage, 'synchronized-sound-stage')).toBe(true)

    const lightingReady = lightingInventorReady()
    const lightingStage = lightingReady.operations.facilities.find(f => f.capability === 'soundstage')!.id
    let lighting = applyActions(lightingReady, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId: lightingStage } as never])
    lighting = advanceTo(lighting, lighting.market.tick + LIGHTING.deploymentWeeks)
    expect(hasOperationalFacilityInstallation(lighting, lightingStage, 'lighting-control-stage')).toBe(true)
    expect(hasOperationalFacilityInstallation(lighting, lightingStage, 'synchronized-sound-stage')).toBe(false)

    // Sanity: the quote/adoption law itself never mislabels a lighting adoption
    // as carrying a Post component of any kind (companion cross-check with test 1).
    const quote = adoptionQuote(lighting, { technologyId: LIGHTING.id, stageFacilityId: lightingStage })
    expect(quote.components.some(c => c.kind === 'post')).toBe(false)
  })
})
