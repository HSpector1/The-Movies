import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
// RED-by-design: `src/core/technologyAdoption.ts` does not exist yet (S5-T1/T2/T3
// engine increment is not landed). This import fails module resolution before
// anything else in this file runs.
import { adoptionQuote } from '../src/core/technologyAdoption.js'

// P13B-S5 test 1 (task expansion, 2026-09-17). Requirement-derived from test-list
// item 1 of "S5 — Component inventor pricing and prototypes per technology (Ready
// row 7) — task expansion" in docs/engineering/playability-launch-review/plans/
// P13B-HEADLESS-PLAN.md (that section paraphrases companion 02-P13B-DECISIONS-
// AND-ACCEPTANCE.md §6, §5 row 7 and acceptance A8 in-tree, WITH THE EXACT
// FIGURES — the companion documents themselves are not in this worktree per the
// coordinator's 2026-09-17 correction, so the in-tree plan section is treated as
// the authority and no further search for the companion was made).
//
// Written against the S5 contract as if `adoptionQuote(state, {technologyId,
// stageFacilityId, postFacilityId?})` already existed and returned
// `{components: TechnologyAdoptionComponent[], total: number}`. RED by design:
// the very first import above fails ("Cannot find module
// .../technologyAdoption.js") because that module does not exist yet — the
// SAME idiom every P13B-S3/S4 test-author file uses (importing a real, existing
// module together with the not-yet-existing one would risk vite binding a
// missing named export from an EXISTING module to `undefined` instead of
// failing module resolution; see tests/p13b-s3-validation.test.ts's own
// MEASURED FINDING comment). Here `adoptionQuote` is the ONLY import from the
// new module and nothing else in the file can run before it resolves, so the
// whole file fails for exactly one cause.
//
// Refusal design note: `adoptionQuote`'s own contract for an UNLAWFUL request
// (e.g. lighting + a Post) is not pinned by the plan text (only "returning the
// component list and total" for a lawful quote is specified) — this file does
// NOT assume a shape for that case. The "lighting refuses a postFacilityId"
// requirement is instead proven at the unambiguous point the plan DOES pin: the
// action-commit layer (`adoptTechnology` via `applyActions`), which by parity
// with `adoptSynchronizedSound`'s existing throw-on-refusal convention must
// refuse. See `it('lighting adoption with a postFacilityId is refused ...')`.

const SOUND = technologyEntry('synchronized-sound')
const LIGHTING = technologyEntry('lighting-control-01')

function begin(state: GameState, technologyId: string, budgetPerWeek: number): GameState {
  const project = state.technology.projects.find(p => p.technologyId === technologyId)!
  return applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek }])
}

function runToCompletion(state: GameState, technologyId: string, boundWeek: number): GameState {
  let next = state
  while (next.technology.projects.find(p => p.technologyId === technologyId)!.status !== 'completed') {
    if (next.market.tick > boundWeek) throw new Error(`p13b-s5-quotes fixture: ${technologyId} research did not complete before week ${boundWeek}`)
    next = advanceTo(next, next.market.tick + 1)
  }
  return next
}

/** Sound inventor access: p13aResearchReady() -> begin sound $10k -> run to completion. Reaches week 303, exactly as tests/fixtures/p13b/legacy-v23-sound-operational-315.json.gz (S5-T0 provenance) was minted. */
function soundInventorReady(): GameState {
  return runToCompletion(begin(p13aResearchReady(), 'synchronized-sound', 10_000), 'synchronized-sound', 400)
}

/** Lighting inventor access on a two-Lab world: 4 seats on Lab 2, $40k/week, run to completion (mirrors legacy-v23-lighting-complete-plan-queued.json.gz's own build). */
function lightingInventorReady(): { state: GameState; lab1: string; lab2: string } {
  const { state: world, laboratoryFacilityIds: [lab1, lab2], candidateIds } = p13bTwoLabWorld()
  let state = applyActions(world, candidateIds.slice(0, 4).map(scientistId =>
    ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
  state = begin(state, 'lighting-control-01', 40_000)
  return { state: runToCompletion(state, 'lighting-control-01', 900), lab1, lab2 }
}

function sumCost(components: readonly { cost: number }[]): number {
  return components.reduce((total, c) => total + c.cost, 0)
}
function assertNoNegativeLine(components: readonly { cost: number }[]): void {
  for (const c of components) expect(c.cost).toBeGreaterThanOrEqual(0)
}

describe('P13B-S5 quotes and components per route (test 1)', () => {
  it('first inventor sound: access $0, equipment $0 first-prototype, physical $975k = stage + Post components', () => {
    const state = soundInventorReady()
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    const quote = adoptionQuote(state, { technologyId: SOUND.id, stageFacilityId, postFacilityId })
    const access = quote.components.find(c => c.kind === 'access')!
    const equipment = quote.components.find(c => c.kind === 'equipment')!
    expect(access.cost).toBe(0)
    expect(equipment.cost).toBe(0)
    expect(equipment.source).toBe('first-prototype')
    const physical = quote.components.filter(c => c.source === 'physical')
    expect(sumCost(physical)).toBe(975_000)
    expect(quote.total).toBe(975_000)
    assertNoNegativeLine(quote.components)
  })

  it('second inventor sound installation on another stage while the first holds its asset: equipment $225k later-inventor, existing operational Post reused at $0, stage physical only', () => {
    let state = soundInventorReady()
    const stage1 = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: stage1, postFacilityId }])
    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks) // both stage and Post operational
    const stage2 = state.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== stage1)!.id
    const quote = adoptionQuote(state, { technologyId: SOUND.id, stageFacilityId: stage2, postFacilityId })
    const equipment = quote.components.find(c => c.kind === 'equipment')!
    expect(equipment.cost).toBe(SOUND.laterInventorEquipmentCost)
    expect(equipment.source).toBe('later-inventor')
    const post = quote.components.find(c => c.kind === 'post')!
    expect(post.cost).toBe(0)
    expect(post.source).toBe('existing')
    expect(quote.components.some(c => c.source === 'physical' && c.kind === 'post')).toBe(false) // no NEW Post installation
    expect(quote.components.some(c => c.source === 'physical' && c.kind !== 'post')).toBe(true) // stage physical still quoted
    assertNoNegativeLine(quote.components)
  })

  it('commercial sound: access $200k charged once at purchase, equipment $300k, physical $975k', () => {
    let state = advanceTo(p13aResearchReady(), SOUND.commercialWeek)
    state = applyActions(state, [{ kind: 'purchaseTechnology', technologyId: SOUND.id }])
    const purchases = state.ledger.filter(e => e.kind === 'technologyAdoption' && e.note === `technology-access:${state.hollywood!.playerStudioId}:${SOUND.id}`)
    expect(purchases).toHaveLength(1)
    expect(purchases[0]!.amount).toBe(-SOUND.accessCost)
    expect(SOUND.accessCost).toBe(200_000)
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    const quote = adoptionQuote(state, { technologyId: SOUND.id, stageFacilityId, postFacilityId })
    const access = quote.components.find(c => c.kind === 'access')!
    expect(access.cost).toBe(0) // already paid at purchase, never charged twice
    expect(access.source).toBe('existing')
    const equipment = quote.components.find(c => c.kind === 'equipment')!
    expect(equipment.cost).toBe(SOUND.commercialEquipmentCost)
    expect(equipment.source).toBe('commercial')
    const physical = quote.components.filter(c => c.source === 'physical')
    expect(sumCost(physical)).toBe(975_000)
    assertNoNegativeLine(quote.components)
  })

  it('lighting inventor first: access $0, equipment $0, site $50k/2w + install $50k/2w, no Post component of any kind', () => {
    const { state } = lightingInventorReady()
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const quote = adoptionQuote(state, { technologyId: LIGHTING.id, stageFacilityId })
    const access = quote.components.find(c => c.kind === 'access')!
    const equipment = quote.components.find(c => c.kind === 'equipment')!
    expect(access.cost).toBe(0)
    expect(equipment.cost).toBe(0)
    expect(equipment.source).toBe('first-prototype')
    const physical = quote.components.filter(c => c.source === 'physical')
    expect(physical).toHaveLength(2)
    expect(physical.map(c => c.cost).sort((a, b) => a - b)).toEqual([50_000, 50_000])
    expect(physical.map(c => c.weeks).sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual([2, 2])
    expect(quote.components.some(c => c.kind === 'post')).toBe(false)
    assertNoNegativeLine(quote.components)
  })

  it('lighting later inventor: equipment $150k + site/install physical $100k, still no Post', () => {
    const { state: ready } = lightingInventorReady()
    const stage1 = ready.operations.facilities.find(f => f.capability === 'soundstage')!.id
    let state = applyActions(ready, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId: stage1 } as never])
    state = advanceTo(state, state.market.tick + LIGHTING.deploymentWeeks)
    const stage2 = state.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== stage1)!.id
    const quote = adoptionQuote(state, { technologyId: LIGHTING.id, stageFacilityId: stage2 })
    const equipment = quote.components.find(c => c.kind === 'equipment')!
    expect(equipment.cost).toBe(LIGHTING.laterInventorEquipmentCost)
    expect(equipment.source).toBe('later-inventor')
    expect(LIGHTING.laterInventorEquipmentCost).toBe(150_000)
    const physical = quote.components.filter(c => c.source === 'physical')
    expect(sumCost(physical)).toBe(100_000)
    expect(quote.components.some(c => c.kind === 'post')).toBe(false)
    assertNoNegativeLine(quote.components)
  })

  it('lighting commercial at 936: access $100k charged once at purchase, equipment $200k commercial, physical $100k', () => {
    let state = advanceTo(p13bTwoLabWorld().state, LIGHTING.commercialWeek)
    state = applyActions(state, [{ kind: 'purchaseTechnology', technologyId: LIGHTING.id }])
    const purchases = state.ledger.filter(e => e.kind === 'technologyAdoption' && e.note === `technology-access:${state.hollywood!.playerStudioId}:${LIGHTING.id}`)
    expect(purchases).toHaveLength(1)
    expect(purchases[0]!.amount).toBe(-LIGHTING.accessCost)
    expect(LIGHTING.accessCost).toBe(100_000)
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const quote = adoptionQuote(state, { technologyId: LIGHTING.id, stageFacilityId })
    const access = quote.components.find(c => c.kind === 'access')!
    expect(access.cost).toBe(0)
    expect(access.source).toBe('existing')
    const equipment = quote.components.find(c => c.kind === 'equipment')!
    expect(equipment.cost).toBe(LIGHTING.commercialEquipmentCost)
    expect(equipment.source).toBe('commercial')
    expect(LIGHTING.commercialEquipmentCost).toBe(200_000)
    const physical = quote.components.filter(c => c.source === 'physical')
    expect(sumCost(physical)).toBe(100_000)
    expect(quote.components.some(c => c.kind === 'post')).toBe(false)
    assertNoNegativeLine(quote.components)
  })

  it('a lighting adoption with a postFacilityId is refused at commit (the requirement pinned unambiguously at the action layer)', () => {
    const { state } = lightingInventorReady()
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    expect(() => applyActions(state, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId, postFacilityId } as never])).toThrow()
  })

  it('the first-prototype entitlement fires exactly once per (studio, technology, project) and never blocks a different technology’s project', () => {
    // A single combined world: sound researched on Lab 1 (1 seat), lighting
    // researched on Lab 2 (4 seats), both to completion. Consuming sound's
    // entitlement on stage 1 must not touch lighting's own, still-unconsumed
    // entitlement on stage 2 — the two are scoped by (studio, technology,
    // project), never shared.
    const { state: world, laboratoryFacilityIds: [lab1, lab2], candidateIds } = p13bTwoLabWorld()
    let state = applyActions(world, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab1, scientistId: candidateIds[0]!, technologyId: 'synchronized-sound' }])
    state = applyActions(state, candidateIds.slice(1, 5).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
    state = begin(state, 'synchronized-sound', 10_000)
    state = begin(state, 'lighting-control-01', 40_000)
    state = runToCompletion(state, 'synchronized-sound', 900)
    state = runToCompletion(state, 'lighting-control-01', 900)

    const stage1 = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const stage2 = state.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== stage1)!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id

    // Consume sound's entitlement on stage 1.
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: stage1, postFacilityId }])

    // Lighting's OWN entitlement on stage 2 is untouched by sound's consumption.
    const lightingQuote = adoptionQuote(state, { technologyId: LIGHTING.id, stageFacilityId: stage2 })
    const lightingEquipment = lightingQuote.components.find(c => c.kind === 'equipment')!
    expect(lightingEquipment.cost).toBe(0)
    expect(lightingEquipment.source).toBe('first-prototype')

    // A further sound quote (hypothetically on the same stage 1, ignoring the
    // duplicate-stage refusal for the purpose of reading only the equipment
    // component's source/cost) reflects the ALREADY-CONSUMED entitlement.
    const secondSoundQuote = adoptionQuote(state, { technologyId: SOUND.id, stageFacilityId: stage2, postFacilityId })
    const secondSoundEquipment = secondSoundQuote.components.find(c => c.kind === 'equipment')!
    expect(secondSoundEquipment.source).toBe('later-inventor')
    expect(secondSoundEquipment.cost).toBe(SOUND.laterInventorEquipmentCost)
  })
})
