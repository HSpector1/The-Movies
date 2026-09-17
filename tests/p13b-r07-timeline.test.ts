import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, GameState, ProductionWorkflow } from '../src/core/types.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'
import { operationsStudio, productionPayload, withCash } from './contracts/_contractFixtures.js'
// RED-by-design: `src/core/productionSetup.ts` does not exist yet — see
// tests/p13b-r07-recipes.test.ts's header for the full RED-design rationale
// (shared across every P13B-S5-R07 test-author file). `setupForecast` is the
// ONLY import from the new module.
import { setupForecast } from '../src/core/productionSetup.js'

// P13B-S5-R07 test 2 (task expansion, 2026-09-17, plan lines 672-733).
// Requirement-derived from test-list item 2 (line 724-725): "timeline through
// real ticks: 820 -> 824/822/821; admission week earns no unit; one unit per
// week; same-week retries and second sweep visits credit nothing;
// completed-task idempotence."
//
// INTERPRETATION NAMED. The plan's "Matched example: setup-ready 820 -> Shooting
// entry 824 (conventional) / 822 (lighting) / 821 (ordinary, both routes)" is
// read as a WORKED EXAMPLE of the arithmetic law — entry = admittedWeek +
// requiredUnits — not a pinned week tied to a specific harness fixture this
// test-author was handed. No existing lawful fixture assembly reaches week 820
// at the point rehearsal work finishes (measured below: this file's own three
// lawful fixtures land at weeks 12, 807 and 4 respectively — none is 820, and
// nothing in the plan or brief names the exact construction that reaches 820).
// Consequently this file tests the SAME LAW twice: (a) the literal plan numbers
// 820 -> 824/822/821 as a PURE unit check on `setupForecast(admittedWeek,
// requiredUnits)`, decoupled from any specific campaign history; and (b) the
// identical law walked through REAL engine ticks on three independently-sourced
// lawful fixtures (conventional ballroom, lighting ballroom, ordinary interior),
// at the weeks those fixtures actually land on. If `setupForecast`'s true
// signature differs once implemented, (a) is the part to correct; (b) is
// independent of that guess.
//
// MEASURED WEEKS (throwaway vite-node probes against this exact source tree,
// 2026-09-17, not guessed):
//   conventional ballroom (tests/contracts/_contractFixtures.ts `operationsStudio`,
//     no lighting anywhere in the fixture): commission week 0, ballroom standing
//     week 8 (TUNING.SET_BUILD_WEEKS_BAND_HIGH), greenlight week 8, rehearsal
//     (bound) week 11, remainingTicks 6; ONE more tick reaches TODAY's
//     (gate-less) Shooting entry at week 12 — the week R07's admission opens
//     ("the sweep visit at which rehearsal work is done and the gate opens").
//   lighting ballroom (src/harness/p13b/fixtures.ts `p13bTwoLabWorld`, a
//     generated two-Laboratory world at week 780; 4 seats on Lab 2, $40k/week):
//     lighting research completes week 791 (access acquiredWeek 791, matching
//     tests/fixtures/p13b/PROVENANCE.md's V24 lighting fixture's own committed-791
//     figure exactly); `adoptTechnology` on facility-soundstage-07 committed 791,
//     operationalWeek 795 (matches PROVENANCE.md's operational-795 figure
//     exactly); ballroom commissioned week 795, standing week 803; greenlight
//     week 803; rehearsal (bound, STAGE_7) week 806; TODAY's gate-less Shooting
//     entry week 807.
//   ordinary interior (endowed house Set, no commissioning): greenlight week 0,
//     rehearsal (bound) week 3; TODAY's gate-less Shooting entry week 4.
//
// Under R07's own stated law admittedWeek = TODAY's gate-less Shooting-entry
// week (the visit the gate intercepts), so: conventional admittedWeek 12,
// required 4 -> entry 16; lighting admittedWeek 807, required 2 -> entry 809;
// ordinary admittedWeek 4, required 1 -> entry 5.
//
// NOT EXERCISED (named, not invented): "a second sweep visit in the same week
// credits nothing" is an ENGINE-INTERNAL property of `advanceManagedProductions`'s
// fixed-point `while (progressed)` loop (operations.ts ~1516-1590), which black-box
// action/tick calls cannot independently trigger twice within one `tick()`
// boundary — this file exercises "one unit per REAL WEEK boundary" and "a repeat
// action call in the same week credits nothing" (the same-week "retry" case), but
// not a forced second internal sweep pass.

// AMENDED (coordinator adjudication, 2026-09-17, test-author second pass): every
// `selectRecipe(...)` call below moved to BEFORE the gate-week `tick(...)` — the
// plan's law is that a recipe is selected as a reviewed action DURING rehearsal
// (on the rehearsal-week state, weeks 11/807/... below), and admission is
// stamped by the sweep visit that would have moved 6 -> 5 (admittedWeek = that
// visit's currentTick + 1), crediting nothing and not calling `enterPhase`. The
// prior ordering (select AFTER ticking to the gate week, with `setup` still
// null at that visit) would hold a recipe-less picture, which the engine does
// not do. No assertion value changed by this amendment — admittedWeek still
// reads 12/807/4 and Shooting entries stay 16/809/5 (sim-core-verified).

const STAGE_7 = 'facility-soundstage-07'

type ProductionSetupRecipeId = 'ballroom-reveal-lighting-01' | 'ordinary-interior-01'
type ProductionSetupRecord = {
  recipeId: ProductionSetupRecipeId
  planRevision: number
  admittedWeek: number
  route: 'conventional' | 'lighting'
  requiredUnits: number
  creditedUnits: number
  lastCreditedWeek: number | null
  completedWeek: number | null
}
type WorkflowWithSetup = ProductionWorkflow & { setup: ProductionSetupRecord | null }

function workflowOf(state: GameState, index = 0): WorkflowWithSetup {
  return state.operations.workflows[index]! as WorkflowWithSetup
}

function selectRecipe(state: GameState, productionId: string, recipeId: ProductionSetupRecipeId): GameState {
  return applyActions(state, [
    { kind: 'setProductionSetupRecipe', productionId, recipeId, expectedPlanRevision: 0 } as unknown as Action,
  ])
}

/** Measured: rehearsal (bound, STAGE_7) week 11; TODAY's gate-less Shooting entry week 12. */
function conventionalBallroomAtRehearsal(seed: string): GameState {
  let state = withCash(operationsStudio(seed), 30_000_000)
  state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-0' }])
  state = applyActions(state, [
    { kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_7 } },
  ])
  for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
  state = tick(state)
  state = tick(state)
  state = tick(state)
  return state
}

/** Measured: rehearsal (bound, STAGE_7) week 3; TODAY's gate-less Shooting entry week 4. */
function ordinaryAtRehearsal(seed: string): GameState {
  let state = withCash(operationsStudio(seed), 5_000_000)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
  state = tick(state)
  state = tick(state)
  state = tick(state)
  return state
}

describe('P13B-S5-R07 setup timeline arithmetic (test 2)', () => {
  it('setupForecast pins the plan\'s own worked example: setup-ready 820 -> Shooting entry 824 conventional / 822 lighting / 821 ordinary', () => {
    expect(setupForecast(820, 4)).toBe(824)
    expect(setupForecast(820, 2)).toBe(822)
    expect(setupForecast(820, 1)).toBe(821)
  })

  it('walks the conventional ballroom route through real ticks: admission 12, one unit per week, entry 16', () => {
    const rehearsing = conventionalBallroomAtRehearsal('r07-timeline-conventional')
    const productionId = rehearsing.studio.activeProductions[0]!.id
    expect(rehearsing.market.tick).toBe(11)
    let state = selectRecipe(rehearsing, productionId, 'ballroom-reveal-lighting-01')
    // The gate opens at the visit today's engine would move 6 -> 5, one tick
    // after rehearsal entry — the sweep visit that stamps admission.
    state = tick(state)
    expect(state.market.tick).toBe(12)
    expect(workflowOf(state).phase).toBe('rehearsal') // held, not shooting
    expect(workflowOf(state).shootingTask).toBeNull() // created only when enterPhase targets shooting
    const admitted = workflowOf(state).setup!
    expect(admitted.admittedWeek).toBe(12)
    expect(admitted.requiredUnits).toBe(4)
    expect(admitted.creditedUnits).toBe(0) // admission week earns no unit

    state = tick(state) // week 13
    expect(workflowOf(state).setup!.creditedUnits).toBe(1)
    state = tick(state) // week 14
    expect(workflowOf(state).setup!.creditedUnits).toBe(2)
    state = tick(state) // week 15
    expect(workflowOf(state).setup!.creditedUnits).toBe(3)
    expect(workflowOf(state).phase).toBe('rehearsal')
    state = tick(state) // week 16: credited reaches required -> Shooting entry
    expect(state.market.tick).toBe(16)
    expect(setupForecast(admitted.admittedWeek, admitted.requiredUnits)).toBe(16)
    const record = workflowOf(state).setup!
    expect(record.creditedUnits).toBe(4)
    expect(record.completedWeek).toBe(16)
    expect(workflowOf(state).phase).toBe('shooting')
  })

  it('walks the lighting ballroom route through real ticks: admission 807, entry 809', () => {
    // Built by the SAME idiom as tests/p13b-r07-gate.test.ts's own lighting-ready
    // fixture (duplicated here per this repo's "each test file carries its own
    // copy" convention — see tests/p13b-s5-quotes.test.ts's `fundTo`).
    function fundTo(state: GameState, target: number): GameState {
      const delta = target - state.studio.cash
      if (delta === 0) return state
      return {
        ...state,
        studio: { ...state.studio, cash: target },
        ledger: [
          ...state.ledger,
          { week: state.market.tick, kind: (delta > 0 ? 'studioRevenue' : 'overhead') as 'studioRevenue' | 'overhead', amount: delta, note: 'r07-timeline fixture fund' },
        ],
      }
    }
    const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
    let state = applyActions(
      world,
      candidateIds
        .slice(0, 4)
        .map((scientistId: string) => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })),
    )
    const project = state.technology.projects.find((p) => p.technologyId === 'lighting-control-01')!
    state = applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek: 40_000 }])
    while (state.technology.projects.find((p) => p.id === project.id)!.status !== 'completed') {
      if (state.market.tick > 900) throw new Error('r07-timeline fixture: lighting research did not complete before week 900')
      state = advanceTo(state, state.market.tick + 1)
    }
    state = fundTo(state, 5_000_000)
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: 'lighting-control-01', stageFacilityId: STAGE_7 } as unknown as Action])
    const adoption = state.technology.adoptions.find((a) => a.technologyId === 'lighting-control-01' && a.stageFacilityId === STAGE_7)!
    while (state.technology.adoptions.find((a) => a.id === adoption.id)!.operationalWeek === null) state = tick(state)
    expect(state.market.tick).toBe(795)

    state = fundTo(state, 30_000_000)
    state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-0' }])
    state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_7 } }])
    for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)
    expect(state.market.tick).toBe(803)

    // Sign a minimal creative roster (p13bTwoLabWorld only signed scientists).
    const byRole = (role: string) => state.talent.filter((t) => t.role === role)
    const roster = [...byRole('writer').slice(0, 1), ...byRole('director').slice(0, 1), ...byRole('actor').slice(0, 3), ...byRole('craft').slice(0, 1)]
    state = applyActions(state, roster.map((t) => ({ kind: 'signContract' as const, talentId: t.id, termWeeks: 208 })))
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
    state = tick(state)
    state = tick(state)
    state = tick(state)
    expect(state.market.tick).toBe(806)
    const productionId = state.studio.activeProductions[0]!.id
    expect(workflowOf(state).bindings.stageFacilityId).toBe(STAGE_7)
    state = selectRecipe(state, productionId, 'ballroom-reveal-lighting-01')

    state = tick(state) // gate opens at week 807
    expect(state.market.tick).toBe(807)
    expect(workflowOf(state).phase).toBe('rehearsal')
    const admitted = workflowOf(state).setup!
    expect(admitted.admittedWeek).toBe(807)
    expect(admitted.route).toBe('lighting')
    expect(admitted.requiredUnits).toBe(2)
    expect(admitted.creditedUnits).toBe(0)

    state = tick(state) // 808
    expect(workflowOf(state).setup!.creditedUnits).toBe(1)
    state = tick(state) // 809
    expect(state.market.tick).toBe(809)
    expect(setupForecast(807, 2)).toBe(809)
    const record = workflowOf(state).setup!
    expect(record.creditedUnits).toBe(2)
    expect(record.completedWeek).toBe(809)
    expect(workflowOf(state).phase).toBe('shooting')
  })

  it('walks the ordinary-interior route through real ticks: admission 4, entry 5, both routes agree at 1 unit', () => {
    const rehearsing = ordinaryAtRehearsal('r07-timeline-ordinary')
    const productionId = rehearsing.studio.activeProductions[0]!.id
    expect(rehearsing.market.tick).toBe(3)
    let state = selectRecipe(rehearsing, productionId, 'ordinary-interior-01')
    state = tick(state)
    expect(state.market.tick).toBe(4)
    expect(workflowOf(state).setup!.admittedWeek).toBe(4)
    expect(workflowOf(state).setup!.creditedUnits).toBe(0)
    state = tick(state)
    expect(state.market.tick).toBe(5)
    expect(setupForecast(4, 1)).toBe(5)
    expect(workflowOf(state).setup!.creditedUnits).toBe(1)
    expect(workflowOf(state).setup!.completedWeek).toBe(5)
    expect(workflowOf(state).phase).toBe('shooting')
  })

  it('a same-week repeat selection call ("retry") credits no extra unit', () => {
    const rehearsing = conventionalBallroomAtRehearsal('r07-timeline-retry')
    const productionId = rehearsing.studio.activeProductions[0]!.id
    let state = selectRecipe(rehearsing, productionId, 'ballroom-reveal-lighting-01')
    state = tick(state) // week 12, gate opens
    state = tick(state) // week 13: 1 credited
    expect(workflowOf(state).setup!.creditedUnits).toBe(1)
    // A resent/duplicate command at the SAME week, same revision, same recipe.
    const revision = workflowOf(state).setup!.planRevision
    state = applyActions(state, [
      { kind: 'setProductionSetupRecipe', productionId, recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: revision } as unknown as Action,
    ])
    expect(workflowOf(state).setup!.creditedUnits).toBe(1) // unchanged — no extra unit for the retry
  })

  it('completed-task idempotence: further ticks past completion never re-credit or move completedWeek', () => {
    const rehearsing = ordinaryAtRehearsal('r07-timeline-idempotent')
    const productionId = rehearsing.studio.activeProductions[0]!.id
    let state = selectRecipe(rehearsing, productionId, 'ordinary-interior-01')
    state = tick(state) // week 4, gate opens
    state = tick(state) // week 5: completed, enters Shooting
    const completed = workflowOf(state).setup!
    expect(completed.creditedUnits).toBe(1)
    expect(completed.completedWeek).toBe(5)
    for (let i = 0; i < 3; i++) state = tick(state)
    const stillCompleted = workflowOf(state).setup!
    expect(stillCompleted.creditedUnits).toBe(1)
    expect(stillCompleted.completedWeek).toBe(5)
  })
})
