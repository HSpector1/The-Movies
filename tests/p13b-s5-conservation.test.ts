import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { exportSave, makeSave } from '../src/core/save.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice, p13aResearchReady } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
// RED-by-design: `src/core/technologyAdoption.ts` does not exist yet. See
// tests/p13b-s5-quotes.test.ts for the full RED-design rationale (shared across
// every P13B-S5 test-author file).
import { equipmentAssets } from '../src/core/technologyAdoption.js'

// P13B-S5 test 6 (task expansion, 2026-09-17). Requirement-derived from
// test-list item 6 of "S5 — Component inventor pricing and prototypes per
// technology (Ready row 7) — task expansion" in docs/engineering/playability-
// launch-review/plans/P13B-HEADLESS-PLAN.md: "Conservation, determinism,
// campaign isolation (rival adoption rows untouched by player actions; the
// rival purchase reconciles per technology)."
//
// The campaign-isolation and rival-reconciliation cases below use the
// ALREADY-LIVE, ALREADY-ORGANIC rival mechanism (`considerRivalSoundPurchase`,
// driven by `tick()` through `advanceTo`) rather than a structural injection:
// measured 2026-09-17 against the CURRENT (pre-S5) engine, `advanceTo(
// p13aLaboratorySlice(), 540)` deterministically produces rival
// "studio-aca408ec-r05" committing a commercial sound adoption at week 520
// (operational 532, equipmentCost 300,000, installationCost 975,000, EMPTY
// physicalProjectIds) — independent of the player's own research/build path
// (the SAME committedWeek/operationalWeek/costs appear in the checked-in
// legacy-v21-two-labs-two-briefs-783 and legacy-v22-two-labs-cooperating-782
// fixtures, built via a DIFFERENT two-Laboratory player path). This is the
// most authoritative way available to prove "the rival purchase reconciles
// per technology" (S5 replaces the validator's hard-coded 300,000/975,000
// with `technologyEntry('synchronized-sound')`'s own catalogue values — "no
// behaviour change for sound" per the plan text) and campaign isolation,
// without inventing rival state this engine cannot organically produce.

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
    if (next.market.tick > boundWeek) throw new Error(`p13b-s5-conservation fixture: ${technologyId} research did not complete before week ${boundWeek}`)
    next = advanceTo(next, next.market.tick + 1)
  }
  return next
}

/** The genuine, RECONCILED cash move this repo's test files each carry their own
 * copy of (see tests/p13b-s3-admission.test.ts's `spendDownTo`, duplicated-not-
 * shared by design) — a bare `studio.cash` override is refused by `tick()`'s
 * construction cash-ledger invariant. Generalized to fund UP as well as down:
 * the SAME signed ledger delta (`target - current`) covers both directions. */
function fundTo(state: GameState, target: number): GameState {
  const delta = target - state.studio.cash
  return {
    ...state,
    studio: { ...state.studio, cash: target },
    ledger: [...state.ledger, { week: state.market.tick, kind: 'overhead', amount: delta, note: 'weekly studio overhead' }],
  }
}

/** Both technologies researched to completion, seeded once and reused identically by both determinism runs. */
function bothTechnologiesReady(): { state: GameState; lab1: string; lab2: string } {
  const { state: world, laboratoryFacilityIds: [lab1, lab2], candidateIds } = p13bTwoLabWorld()
  // p13bTwoLabWorld() carries no revenue business, so 1 seat of sound ($10k/wk)
  // alongside 4 seats of lighting ($40k/wk) run the world into the D-12.11
  // solvency gate: measured, cash first goes negative at week 811 with sound
  // frozen at 46.5/64 verifiedWork (lighting has already completed, 64/64, at
  // week 791 — canAfford failing yields a zero-output research week, so sound
  // never resumes on its own). Fund the world lawfully up front so both
  // projects run to completion; measured, sound then completes at week 823
  // with lighting unchanged at 791.
  let state = applyActions(fundTo(world, 5_000_000), [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab1, scientistId: candidateIds[0]!, technologyId: 'synchronized-sound' }])
  state = applyActions(state, candidateIds.slice(1, 5).map(scientistId =>
    ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
  state = begin(state, 'synchronized-sound', 10_000)
  state = begin(state, 'lighting-control-01', 40_000)
  state = runToCompletion(state, 'synchronized-sound', 900)
  state = runToCompletion(state, 'lighting-control-01', 900)
  return { state, lab1, lab2 }
}

describe('P13B-S5 conservation, determinism, campaign isolation (test 6)', () => {
  it('cash conservation across a sound and a lighting adoption: every dollar the ledger charges for the two adoptions is exactly equipmentCost + installationCost, no more, no less, and no negative or duplicate row', () => {
    const { state: ready } = bothTechnologiesReady()
    const cashAtReady = ready.studio.cash
    const soundStage = ready.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const soundPost = ready.operations.facilities.find(f => f.capability === 'post')!.id
    const lightingStage = ready.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== soundStage)!.id

    let state = applyActions(ready, [{ kind: 'adoptSynchronizedSound', stageFacilityId: soundStage, postFacilityId: soundPost }])
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId: lightingStage } as never])
    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks) // both fully operational

    // Pre-existing defect found while unblocking S5-T4/T5's fixture-solvency
    // adjudication (not itself a solvency issue): `p13bTwoLabWorld()` is built
    // on `p13aLaboratorySlice()`, which already carries the rival's OWN
    // organic commercial sound adoption (this file's own "campaign isolation"
    // case documents it, committed week 520) as `technology.adoptions[0]`
    // BEFORE the player's two rows are appended — so a positional
    // `const [soundAdoption, lightingAdoption] = state.technology.adoptions`
    // silently reads [rival's sound, player's sound] instead of [player's
    // sound, player's lighting]. This was never reached before (the fixture
    // always errored out on insolvency first), so it was never proven.
    // Identifying the player's own rows by (studioId, technologyId) — the
    // exact scoping the entitlement test in tests/p13b-s5-quotes.test.ts
    // already proves is authoritative — is a test-side data-extraction fix,
    // not a changed assertion: every expectation below is unchanged.
    const own = ready.hollywood!.playerStudioId
    const soundAdoption = state.technology.adoptions.find(a => a.studioId === own && a.technologyId === SOUND.id)
    const lightingAdoption = state.technology.adoptions.find(a => a.studioId === own && a.technologyId === LIGHTING.id)
    expect(soundAdoption).toBeDefined()
    expect(lightingAdoption).toBeDefined()
    const retainedTotal = soundAdoption!.equipmentCost + soundAdoption!.installationCost + lightingAdoption!.equipmentCost + lightingAdoption!.installationCost

    const technologyAdoptionCharges = state.ledger.filter(e => e.kind === 'technologyAdoption' && e.week >= ready.market.tick).reduce((sum, e) => sum - e.amount, 0)
    const physicalCapexCharges = state.ledger.filter(e => e.kind === 'constructionCapex' &&
      [...soundAdoption!.physicalProjectIds, ...lightingAdoption!.physicalProjectIds].includes(e.constructionProjectId)).reduce((sum, e) => sum - e.amount, 0)

    expect(technologyAdoptionCharges + physicalCapexCharges).toBe(retainedTotal)
    for (const e of state.ledger) if (e.kind === 'technologyAdoption' || e.kind === 'constructionCapex') expect(e.amount).toBeLessThanOrEqual(0) // no inflow line
    expect(cashAtReady - state.studio.cash).toBeGreaterThanOrEqual(retainedTotal) // cash never goes UP from these charges (other weekly costs may also apply)
  })

  it('determinism: the SAME action sequence from the SAME starting state produces byte-identical saves', () => {
    const build = (): GameState => {
      const { state: ready } = bothTechnologiesReady()
      const soundStage = ready.operations.facilities.find(f => f.capability === 'soundstage')!.id
      const soundPost = ready.operations.facilities.find(f => f.capability === 'post')!.id
      const lightingStage = ready.operations.facilities.find(f => f.capability === 'soundstage' && f.id !== soundStage)!.id
      let state = applyActions(ready, [{ kind: 'adoptSynchronizedSound', stageFacilityId: soundStage, postFacilityId: soundPost }])
      state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: LIGHTING.id, stageFacilityId: lightingStage } as never])
      return advanceTo(state, state.market.tick + SOUND.deploymentWeeks)
    }
    const first = build()
    const second = build()
    expect(exportSave(makeSave(second))).toBe(exportSave(makeSave(first)))
  })

  it('campaign isolation: a rival’s organically-purchased sound adoption is byte-unchanged by the player’s own adoption actions, and reconciles to the catalogue’s per-technology values (no hard-coded 300,000/975,000)', () => {
    const atWeek540 = advanceTo(p13aLaboratorySlice(), 540)
    const own = atWeek540.hollywood!.playerStudioId
    const rivalBefore = atWeek540.technology.adoptions.find(a => a.studioId !== own)!
    expect(rivalBefore.technologyId).toBe(SOUND.id)
    expect(rivalBefore.equipmentCost).toBe(SOUND.commercialEquipmentCost) // the catalogue's own value, not a bare literal
    expect(rivalBefore.installationCost).toBe(975_000)
    const rivalBytesBefore = JSON.stringify(rivalBefore)
    const rivalEquipmentBefore = JSON.stringify(equipmentAssets(atWeek540, rivalBefore.studioId))

    // The player independently researches and adopts sound, entirely on their
    // OWN studio's facilities — this must never touch the rival's row.
    let state = runToCompletion(begin(p13aResearchReady(), 'synchronized-sound', 10_000), 'synchronized-sound', 400)
    state = advanceTo(state, atWeek540.market.tick) // catch back up to the same campaign week as the rival snapshot
    const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
    state = applyActions(state, [{ kind: 'adoptSynchronizedSound', stageFacilityId, postFacilityId }])
    state = advanceTo(state, state.market.tick + SOUND.deploymentWeeks)

    const rivalAfter = state.technology.adoptions.find(a => a.studioId === rivalBefore.studioId)!
    expect(JSON.stringify(rivalAfter)).toBe(rivalBytesBefore)
    expect(JSON.stringify(equipmentAssets(state, rivalBefore.studioId))).toBe(rivalEquipmentBefore)
    // The player's own row is real and independent of the rival's.
    const playerAdoption = state.technology.adoptions.find(a => a.studioId === state.hollywood!.playerStudioId)!
    expect(playerAdoption.id).not.toBe(rivalAfter.id)
  })
})
