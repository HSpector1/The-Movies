import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { commitPlacement } from '../src/core/placement.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
import { s3ForgeAndReimport } from '../src/harness/p13b/s3-fixtures.js'
import { s4NextOrigin } from '../src/harness/p13b/s4-fixtures.js'
// RED-by-design: `src/core/technologyAdoption.ts` does not exist yet. See
// tests/p13b-s5-quotes.test.ts for the full RED-design rationale (shared across
// every P13B-S5 test-author file).
import { adoptionQuote } from '../src/core/technologyAdoption.js'

// P13B-S5 test 5 (task expansion, 2026-09-17). Requirement-derived from
// test-list item 5 of "S5 — Component inventor pricing and prototypes per
// technology (Ready row 7) — task expansion" in docs/engineering/playability-
// launch-review/plans/P13B-HEADLESS-PLAN.md, PLUS the coordinator's 2026-09-17
// correction that a lighting adoption's persisted `postFacilityId` becomes
// `string | null` (null for lighting) — an eighth case below covers that
// refinement directly (not one of the plan's original seven bullets, added
// because the correction explicitly asked this file to reflect it).
//
// FORGE-AND-REFUSE (the tests/p13b-s3-validation.test.ts idiom via
// `s3ForgeAndReimport`), applied to REAL, organically-reached baselines (one
// operational sound adoption, one operational lighting adoption) — never a
// hand-authored save from nothing, since S5's own action surface CAN reach
// both baselines lawfully once it exists. Each `it()` corrupts exactly ONE
// named fact and expects a refusal naming it, matching the established
// per-case regex convention.

const SOUND = technologyEntry('synchronized-sound')
const LIGHTING = technologyEntry('lighting-control-01')

function begin(state: GameState, technologyId: string, budgetPerWeek: number): GameState {
  const project = state.technology.projects.find(p => p.technologyId === technologyId && p.studioId === state.hollywood!.playerStudioId)!
  return applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek }])
}
function runToCompletion(state: GameState, technologyId: string, boundWeek: number): GameState {
  let next = state
  while (next.technology.projects.find(p => p.technologyId === technologyId && p.studioId === next.hollywood!.playerStudioId)!.status !== 'completed') {
    if (next.market.tick > boundWeek) throw new Error(`p13b-s5-validation fixture: ${technologyId} research did not complete before week ${boundWeek}`)
    next = advanceTo(next, next.market.tick + 1)
  }
  return next
}

type Adoption = Record<string, unknown>
type Equipment = Record<string, unknown>
function technologyOf(parsed: Record<string, unknown>): Record<string, unknown> {
  return (parsed.state as Record<string, unknown>).technology as Record<string, unknown>
}
function adoptionsOf(parsed: Record<string, unknown>): Adoption[] {
  return technologyOf(parsed).adoptions as Adoption[]
}
function equipmentOf(parsed: Record<string, unknown>): Equipment[] {
  return technologyOf(parsed).equipment as Equipment[]
}
function accessOf(parsed: Record<string, unknown>): Record<string, unknown>[] {
  return technologyOf(parsed).access as Record<string, unknown>[]
}
function rejected(state: GameState, mutate: (parsed: Record<string, unknown>) => void, message: RegExp) {
  expect(() => s3ForgeAndReimport(state, mutate)).toThrow(message)
}

describe('P13B-S5 validator refusals (test 5)', () => {
  let soundState: GameState
  let soundOwn: string
  let soundStage1: string
  let soundStage2: string
  let soundPost: string
  let nonOperationalPostFacilityId: string
  let lightingState: GameState
  let lightingOwn: string
  let lightingStage: string

  beforeAll(() => {
    // Sound baseline: one real operational first-prototype adoption, PLUS a
    // second, genuinely-placed Post Building whose OWN construction is
    // complete (so it is a real capability='post' facility in
    // operations.facilities) but which has NEVER had a synchronized-sound-post
    // installation done to it — the lawful way to reach "a Post facility that
    // exists but is not operational FOR SOUND" without inventing a fact.
    let state = runToCompletion(begin(p13aResearchReady(), 'synchronized-sound', 10_000), 'synchronized-sound', 400)
    soundOwn = state.hollywood!.playerStudioId
    soundStage1 = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    soundStage2 = state.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== soundStage1)!.id
    soundPost = state.operations.facilities.find(f => f.capability === 'post')!.id
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: soundStage1, postFacilityId: soundPost }])
    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks)
    const origin = s4NextOrigin(state, 'post-building')
    state = commitPlacement(state, { blueprintId: 'post-building', origin })
    const newPost = state.placement.facilities.find(f => f.blueprintId === 'post-building')!
    state = advanceTo(state, newPost.completesWeek)
    nonOperationalPostFacilityId = newPost.facilityId
    soundState = state

    // Lighting baseline: one real operational lighting adoption.
    const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
    let lstate = applyActions(world, candidateIds.slice(0, 4).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
    lstate = begin(lstate, 'lighting-control-01', 40_000)
    lstate = runToCompletion(lstate, 'lighting-control-01', 900)
    lightingOwn = lstate.hollywood!.playerStudioId
    lightingStage = lstate.operations.facilities.find(f => f.capability === 'soundstage')!.id
    lstate = applyActions(lstate, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId: lightingStage } as never])
    lightingState = advanceTo(lstate, lstate.market.tick + LIGHTING.deploymentWeeks)
  }, 120_000)

  it('sanity: the unmutated sound and lighting baselines both hold one real operational adoption each', () => {
    expect(soundState.technology.adoptions.filter(a => a.studioId === soundOwn)).toHaveLength(1)
    expect(lightingState.technology.adoptions.filter(a => a.studioId === lightingOwn)).toHaveLength(1)
    const quote = adoptionQuote(soundState, { technologyId: SOUND.id, stageFacilityId: soundStage2, postFacilityId: soundPost })
    expect(quote.total).toBeGreaterThan(0) // sanity: the module is reachable and returns a real quote
  })

  it('(a) rejects forged component sums (a physical row inflated without changing the retained installationCost)', () => {
    rejected(soundState, parsed => {
      const adoption = adoptionsOf(parsed).find(a => a.studioId === soundOwn)!
      const components = adoption.components as { source: string; cost: number }[]
      const physical = components.find(c => c.source === 'physical')!
      physical.cost += 1
    }, /sum|reconcile|component/i)
  })

  it('(b) rejects a second first-prototype asset for the SAME (studio, technology, research project)', () => {
    rejected(soundState, parsed => {
      const equipment = equipmentOf(parsed)
      const existing = equipment.find(e => e.source === 'first-prototype')!
      equipment.push({ ...existing, id: `${soundOwn}:equipment:${equipment.length}`, holderAdoptionId: null })
      technologyOf(parsed).nextEquipmentId = equipment.length
    }, /prototype/i)
  })

  it('(c) rejects a negative component', () => {
    rejected(soundState, parsed => {
      const adoption = adoptionsOf(parsed).find(a => a.studioId === soundOwn)!
      const components = adoption.components as { cost: number }[]
      components[0]!.cost = -1
    }, /negative/i)
  })

  it('(d) rejects an equipment asset held by two adoptions', () => {
    let state = soundState
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: SOUND.id, stageFacilityId: soundStage2, postFacilityId: soundPost } as never])
    rejected(state, parsed => {
      const [first, second] = adoptionsOf(parsed).filter(a => a.studioId === soundOwn) as { equipmentAssetId: string }[]
      const equipment = equipmentOf(parsed)
      const firstAsset = equipment.find(e => e.id === first!.equipmentAssetId)!
      second!.equipmentAssetId = firstAsset.id as string // both adoptions now name the SAME asset
    }, /held|asset/i)
  })

  it('(e) rejects an adoption without acquired access (its access row removed)', () => {
    rejected(soundState, parsed => {
      const access = accessOf(parsed)
      const index = access.findIndex(a => a.studioId === soundOwn && a.technologyId === SOUND.id)
      access.splice(index, 1)
    }, /access/i)
  })

  it('(f) rejects an `existing` Post row naming a Post facility that is not operational FOR SOUND (a real, completed Post Building with no synchronized-sound-post installation)', () => {
    rejected(soundState, parsed => {
      const adoption = adoptionsOf(parsed).find(a => a.studioId === soundOwn)!
      adoption.postFacilityId = nonOperationalPostFacilityId
    }, /post|operational/i)
  })

  it('(g) rejects a lighting adoption whose components include a Post row', () => {
    rejected(lightingState, parsed => {
      const adoption = adoptionsOf(parsed).find(a => a.studioId === lightingOwn)!
      const components = adoption.components as Record<string, unknown>[]
      components.push({ kind: 'post', label: 'forged Post reuse', cost: 0, weeks: null, source: 'existing', placementId: null, equipmentAssetId: null })
    }, /post/i)
  })

  it('(h) rejects a lighting adoption whose root postFacilityId is not null (2026-09-17 correction: lighting rows must persist postFacilityId: null)', () => {
    rejected(lightingState, parsed => {
      const adoption = adoptionsOf(parsed).find(a => a.studioId === lightingOwn)!
      adoption.postFacilityId = lightingState.operations.facilities.find(f => f.capability === 'post')!.id
    }, /post/i)
  })
})
