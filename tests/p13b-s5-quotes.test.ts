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
  // P13B-S8 sweep: a rival researches the SAME catalogue technologies now, so a
  // project is identified by (studio, technology) — never by technology alone.
  const project = state.technology.projects.find(p => p.technologyId === technologyId && p.studioId === state.hollywood!.playerStudioId)!
  return applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek }])
}

function runToCompletion(state: GameState, technologyId: string, boundWeek: number): GameState {
  let next = state
  while (next.technology.projects.find(p => p.technologyId === technologyId && p.studioId === next.hollywood!.playerStudioId)!.status !== 'completed') {
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

/** The genuine, RECONCILED cash move this repo's test files each carry their own
 * copy of (see tests/p13b-s3-admission.test.ts's `spendDownTo`, duplicated-not-
 * shared by design) — a bare `studio.cash` override is refused by `tick()`'s
 * construction cash-ledger invariant. Generalized to fund UP as well as down:
 * the SAME signed ledger delta (`target - current`) covers both directions.
 * Needed here because `p13bTwoLabWorld()` carries no revenue business, so it is
 * insolvent (measured: -$6,431,760) by week 936 on overhead burn alone — the
 * commercial purchase this fixture drives is refused by the pre-existing
 * D-12.11 solvency gate (`canAfford`) unless the world is funded first. */
function fundTo(state: GameState, target: number): GameState {
  const delta = target - state.studio.cash
  return {
    ...state,
    studio: { ...state.studio, cash: target },
    ledger: [...state.ledger, { week: state.market.tick, kind: 'overhead', amount: delta, note: 'weekly studio overhead' }],
  }
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
    // p13bTwoLabWorld() carries no revenue business; measured cash here is
    // -$6,431,760 (overhead burn only from week 780 to 936). Fund the world
    // lawfully before the purchase so the $100,000 access charge is affordable
    // under the D-12.11 solvency gate — this is fixture staging, not tuning.
    state = fundTo(state, 1_000_000)
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
    // p13bTwoLabWorld() carries no revenue business, so 1 seat of sound ($10k/wk)
    // alongside 4 seats of lighting ($40k/wk) run the world into the D-12.11
    // solvency gate: measured, cash first goes negative at week 811 with sound
    // frozen at 46.5/64 verifiedWork (lighting has already completed, 64/64, at
    // week 791 — canAfford failing yields a zero-output research week, so sound
    // never resumes on its own). Fund the world lawfully up front so both
    // projects run to completion; measured, sound then completes at week 823
    // with lighting unchanged at 791.
    let state = fundTo(world, 5_000_000)
    state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab1, scientistId: candidateIds[0]!, technologyId: 'synchronized-sound' }])
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

    // AMENDED 2026-09-17 (coordinator solvency correction): the shared Post is
    // now `underConstruction` (6-week fit-out from this commit) — engaged for
    // ANY quote naming it, sound's own later quote included. Advance to
    // operational (fund lawfully first; measured, the world stays solvent
    // through the fit-out at this cash level — fixture staging, not tuning)
    // before taking either quote below, so neither reflects a stale engagement.
    state = fundTo(state, 2_000_000)
    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks)

    // Lighting's OWN entitlement on stage 2 is untouched by sound's consumption.
    const lightingQuote = adoptionQuote(state, { technologyId: LIGHTING.id, stageFacilityId: stage2 })
    const lightingEquipment = lightingQuote.components.find(c => c.kind === 'equipment')!
    expect(lightingEquipment.cost).toBe(0)
    expect(lightingEquipment.source).toBe('first-prototype')

    // A further sound quote on stage 2 (the shared, now-operational Post
    // reused) reflects the ALREADY-CONSUMED entitlement.
    const secondSoundQuote = adoptionQuote(state, { technologyId: SOUND.id, stageFacilityId: stage2, postFacilityId })
    const secondSoundEquipment = secondSoundQuote.components.find(c => c.kind === 'equipment')!
    expect(secondSoundEquipment.source).toBe('later-inventor')
    expect(secondSoundEquipment.cost).toBe(SOUND.laterInventorEquipmentCost)
  })
})

// P13B-S5 test 2 (coordinator adjudication, 2026-09-17). `adoptionRejections`
// (src/core/technologyAdoption.ts:87-106) lists every reason a request is
// refused, but carries no clause for a target body that P09 itself considers
// `targetEngaged` (physical work already `underConstruction` on the exact
// facility, checked by `queryFacilityInstallation` in src/core/placement.ts).
// The commit path (`technology.ts`'s `adoptSynchronizedSound`/`adoptTechnology`
// branch, ~line 378) queries `queryFacilityInstallation` DIRECTLY and throws
// its own sentence when the target is engaged — so a pre-commit `adoptionQuote`
// can say `ok: true` for a request the SAME engine's own commit refuses one
// call later. MEASURED (this file, 2026-09-17): with a combined sound+lighting
// world, committing sound's own stage installation on stage1 leaves
// `adoptionQuote(state, { technologyId: LIGHTING.id, stageFacilityId: stage1 })`
// reporting `ok: true` even while `applyActions` with the matching
// `adoptTechnology` throws "The selected stage or Post cannot begin
// installation. Finish its current work first." — the exact engagement
// sentence `queryFacilityInstallation` names. This is the RED: the quote and
// the commit must agree, and today they do not.
describe('P13B-S5 quotes and components per route (test 2): the quote refuses an engaged stage with the commit’s own sentence', () => {
  it('a stage engaged by one technology’s own underConstruction physical work refuses a DIFFERENT technology’s quote for that same stage with the commit’s exact sentence, and agrees again once the work completes', () => {
    // A combined world: sound researched on Lab 1 (1 seat), lighting researched
    // on Lab 2 (4 seats), both to inventor completion — mirrors this file's own
    // "first-prototype entitlement" combined fixture (duplicated-not-shared by
    // this file's own convention) so ONE stage can carry sound's committed
    // physical work while lighting is quoted against that SAME stage.
    const { state: world, laboratoryFacilityIds: [lab1, lab2], candidateIds } = p13bTwoLabWorld()
    let state = fundTo(world, 5_000_000)
    state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab1, scientistId: candidateIds[0]!, technologyId: 'synchronized-sound' }])
    state = applyActions(state, candidateIds.slice(1, 5).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
    state = begin(state, 'synchronized-sound', 10_000)
    state = begin(state, 'lighting-control-01', 40_000)
    state = runToCompletion(state, 'synchronized-sound', 900)
    state = runToCompletion(state, 'lighting-control-01', 900)

    const stage1 = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: stage1, postFacilityId }])
    // stage1 now carries sound's own stage installation, `underConstruction`
    // (buildWeeks 12, matching SOUND.deploymentWeeks) — engaged, by P09's own
    // per-facility rule, for ANY installation targeting it, not only sound's.

    const engagedRefusal = 'The selected stage or Post cannot begin installation. Finish its current work first.'
    const quote = adoptionQuote(state, { technologyId: LIGHTING.id, stageFacilityId: stage1 })
    // MEASURED RED (2026-09-17): today this is `ok: true` — `adoptionRejections`
    // has no engagement clause, so the quote does not yet know the stage is
    // busy. It must go green only once that clause lands in the engine, never
    // by loosening this assertion.
    expect(quote.ok).toBe(false)
    expect(quote.refusal).toBe(engagedRefusal)
    expect(quote.rejections).toContain(engagedRefusal)

    expect(() => applyActions(state, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId: stage1 } as never]))
      .toThrow(engagedRefusal)

    // AMENDED 2026-09-17 (coordinator solvency correction): fund lawfully
    // immediately before the post-completion quote. Measured: by the time the
    // fit-out completes the world has burned its own cash on overhead and the
    // physical commitment above, which would otherwise refuse this quote on
    // cash alone and mask the engagement clause this case actually tests.
    const completed = fundTo(advanceTo(state, state.market.tick + SOUND.deploymentWeeks), 1_000_000)
    const completedQuote = adoptionQuote(completed, { technologyId: LIGHTING.id, stageFacilityId: stage1 })
    expect(completedQuote.ok).toBe(true)
  })

  // P13B-S5 NEW RED (coordinator adjudication, 2026-09-17). `adoptionRejections`'s
  // engagement clause (src/core/technologyAdoption.ts ~107-114) pushes
  // `INSTALLATION_ENGAGED_REFUSAL` for ANY `!ok` `queryFacilityInstallation`
  // result, including a pure `insufficientFunds` rejection that has nothing to
  // do with engagement. The commit path (src/core/technology.ts ~378) throws
  // the SAME wrong sentence one line before its own `canAfford` check, for the
  // identical reason. A cash-only obstacle must be reported with the commit's
  // OWN cash sentence ('There is not enough cash for the complete stage,
  // capture and Post installation commitment.', technology.ts ~379), by quote
  // and by commit alike. This is the RED: today both misreport it as the
  // engagement sentence.
  it('a cash-only obstacle is reported as the commit\'s cash sentence, by quote and commit alike', () => {
    // Same combined-world construction as the case above (duplicated-not-shared
    // by this file's own convention): sound on Lab 1, lighting on Lab 2, both to
    // inventor completion; sound then committed on stage1 and advanced to
    // operational so NO engagement holder remains there — the only obstacle
    // left for a lighting quote on that same stage is cash.
    const { state: world, laboratoryFacilityIds: [lab1, lab2], candidateIds } = p13bTwoLabWorld()
    let state = fundTo(world, 5_000_000)
    state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab1, scientistId: candidateIds[0]!, technologyId: 'synchronized-sound' }])
    state = applyActions(state, candidateIds.slice(1, 5).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
    state = begin(state, 'synchronized-sound', 10_000)
    state = begin(state, 'lighting-control-01', 40_000)
    state = runToCompletion(state, 'synchronized-sound', 900)
    state = runToCompletion(state, 'lighting-control-01', 900)

    const stage1 = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId: stage1, postFacilityId }])
    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks) // operational; no holder remains

    // Drain the studio lawfully to below the $100,000 lighting commitment — the
    // only obstacle left for a lighting quote on stage1 is cash.
    state = fundTo(state, 50_000)

    const cashRefusal = 'There is not enough cash for the complete stage, capture and Post installation commitment.'
    const quote = adoptionQuote(state, { technologyId: LIGHTING.id, stageFacilityId: stage1 })
    // MEASURED RED (2026-09-17): must go green only by giving the engine its
    // own cash-specific clause, never by loosening this assertion.
    expect(quote.ok).toBe(false)
    expect(quote.refusal).toBe(cashRefusal)
    expect(quote.rejections).toContain(cashRefusal)

    expect(() => applyActions(state, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId: stage1 } as never]))
      .toThrow(cashRefusal)
  })

  // P13B-S5 NEW RED (independent-test-engineer, 2026-09-17). `adoptionRejections`'s
  // engagement/cash check (src/core/technologyAdoption.ts ~107-114) only prices
  // whether the P09 body itself — the physical installation alone — can begin,
  // via `queryFacilityInstallation`'s own cash check on the INSTALLATION cost.
  // The commit's own gate (src/core/technology.ts ~382, `canAfford(state,
  // quote.total)`) covers the WHOLE bill: equipment + installation together. So
  // when cash covers the physical work alone but not the complete total, the
  // pre-check query is satisfied (`installationRefusalSentence` sees no
  // refusal), `adoptionRejections` stays empty, and `adoptionQuote` reports
  // `ok: true` — while the commit, one call later, throws the cash sentence on
  // its own separate total-level check. MEASURED (this file, 2026-09-17): with
  // a later-inventor lighting adoption (equipment $150,000, physical $100,000,
  // total $250,000) and cash funded to exactly $120,000 — enough for the
  // $100,000 physical work alone, not for the $250,000 total —
  // `adoptionQuote(...).ok` is `true` today. This is the RED: the quote must
  // refuse a total-level shortfall with the commit's own cash sentence, and
  // must still publish the real components/total on that refusal (the bill is
  // real even when unaffordable), never by loosening these assertions.
  it('a total-level cash shortfall is refused by quote and commit alike', () => {
    const { state: ready } = lightingInventorReady()
    const stage1 = ready.operations.facilities.find(f => f.capability === 'soundstage')!.id
    let state = applyActions(ready, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId: stage1 } as never])
    state = advanceTo(state, state.market.tick + LIGHTING.deploymentWeeks) // stage1's own adoption now operational; its equipment is held, not reusable
    const stage2 = state.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== stage1)!.id

    // Physical work alone ($100,000) is affordable; the complete total
    // (equipment $150,000 later-inventor + physical $100,000 = $250,000) is not.
    state = fundTo(state, 120_000)

    const cashRefusal = 'There is not enough cash for the complete stage, capture and Post installation commitment.'
    const quote = adoptionQuote(state, { technologyId: LIGHTING.id, stageFacilityId: stage2 })
    expect(quote.ok).toBe(false)
    expect(quote.refusal).toBe(cashRefusal)
    expect(quote.rejections).toContain(cashRefusal)
    // The bill is real even when unaffordable: components/total still published.
    expect(quote.total).toBe(250_000)
    const equipment = quote.components.find(c => c.kind === 'equipment')!
    expect(equipment.cost).toBe(150_000)
    expect(equipment.source).toBe('later-inventor')

    expect(() => applyActions(state, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId: stage2 } as never]))
      .toThrow(cashRefusal)

    const funded = fundTo(state, 300_000)
    const fundedQuote = adoptionQuote(funded, { technologyId: LIGHTING.id, stageFacilityId: stage2 })
    expect(fundedQuote.ok).toBe(true)
    expect(fundedQuote.total).toBe(250_000)
  })
})
