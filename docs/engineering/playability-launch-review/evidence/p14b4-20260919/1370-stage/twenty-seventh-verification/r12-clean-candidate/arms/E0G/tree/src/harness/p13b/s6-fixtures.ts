import { applyActions } from '../../core/actions.js'
import { adoptExistingSoundChain, advanceTo, p13aResearchReady } from '../p13a/fixtures.js'
import { p13bTwoLabWorld } from './fixtures.js'
import type { GameState } from '../../core/types.js'

// P13B-S6 shared evidence (test-author, additive; never edits `../p13a/fixtures.ts`,
// `./fixtures.ts`, `./s3-fixtures.ts` or `./s4-fixtures.ts`). Builders reused by more
// than one S6 test file live here, mirroring how `s4NextOrigin`/`s4BareOfficeStudio`
// live in `./s4-fixtures.ts` for S4 and `nextLaboratoryOrigin`/`p13bStaffedProject`
// live in `./fixtures.ts` for S1-S3. Single-file helpers (`begin`, `runToCompletion`,
// `fundTo`) stay local to each test file, matching this repository's own documented
// convention (`tests/p13b-s5-quotes.test.ts`'s "duplicated-not-shared by design").
//
// Requirement-derived from "S6 — Option-B installation cancellation with component
// receipts and restoration" in docs/engineering/playability-launch-review/plans/
// P13B-HEADLESS-PLAN.md. Both builders below reuse the EXACT recipe
// `src/harness/p13b/legacy-v25-fixtures.ts` used to mint the genuine V25 fixtures
// (`tests/fixtures/p13b/legacy-v25-{sound,lighting}-mid-deployment-*.json.gz`,
// provenance in `tests/fixtures/p13b/PROVENANCE.md`), so a fresh in-test build and
// the committed fixture bytes are the same lawful construction at the same weeks.

function begin(state: GameState, technologyId: string, budgetPerWeek: number): GameState {
  const project = state.technology.projects.find(p => p.technologyId === technologyId)!
  return applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek }])
}
function runToCompletion(state: GameState, technologyId: string, boundWeek: number): GameState {
  let next = state
  while (next.technology.projects.find(p => p.technologyId === technologyId)!.status !== 'completed') {
    if (next.market.tick > boundWeek) throw new Error(`p13b-s6 fixture: ${technologyId} research did not complete before week ${boundWeek}`)
    next = advanceTo(next, next.market.tick + 1)
  }
  return next
}

/**
 * First-inventor sound adoption committed at week 303 (matches
 * `legacy-v25-sound-mid-deployment-309.json.gz`'s own build exactly): stage
 * conversion (site 9w + installation 3w + capture 0w, `synchronized-sound-stage`)
 * and Post fit-out (6w, `synchronized-sound-post`) both committed together by
 * `adoptSynchronizedSound` in the same action. Neither is advanced past commit;
 * callers advance from here.
 */
export function s6SoundReady(): {
  state: GameState
  stageFacilityId: string
  postFacilityId: string
  stageProjectId: string
  postProjectId: string
  adoptionId: string
} {
  const state = adoptExistingSoundChain(advanceTo(begin(p13aResearchReady(), 'synchronized-sound', 10_000), 303))
  const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
  const postFacilityId = state.operations.facilities.find(f => f.capability === 'post')!.id
  const stageProjectId = state.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-stage')!.projectId
  const postProjectId = state.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-post')!.projectId
  const adoptionId = state.technology.adoptions.find(a => a.technologyId === 'synchronized-sound')!.id
  return { state, stageFacilityId, postFacilityId, stageProjectId, postProjectId, adoptionId }
}

/**
 * First-inventor lighting adoption committed at week 791 (matches
 * `legacy-v25-lighting-mid-deployment-793.json.gz`'s own build exactly, minus its
 * two extra advanced weeks): stage fit-out (site 2w + installation 2w,
 * `lighting-control-stage`), no Post component. Not advanced past commit; callers
 * advance from here.
 */
export function s6LightingReady(): {
  state: GameState
  stageFacilityId: string
  stageProjectId: string
  adoptionId: string
} {
  const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
  let state = applyActions(world, candidateIds.slice(0, 4).map(scientistId =>
    ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
  state = runToCompletion(begin(state, 'lighting-control-01', 40_000), 'lighting-control-01', 900)
  const stageFacilityId = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
  state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: 'lighting-control-01', stageFacilityId } as never])
  const stageProjectId = state.placement.facilities.find(f => f.blueprintId === 'lighting-control-stage')!.projectId
  const adoptionId = state.technology.adoptions.find(a => a.technologyId === 'lighting-control-01')!.id
  return { state, stageFacilityId, stageProjectId, adoptionId }
}
