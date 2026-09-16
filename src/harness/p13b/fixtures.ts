import { applyActions } from '../../core/actions.js'
import { researchCandidates } from '../../core/technology.js'
import type { GameState } from '../../core/types.js'
import { advanceTo } from '../p13a/fixtures.js'

/**
 * P13B-S1 shared evidence: N named seats staffed on the one Laboratory an
 * `entry`-shaped state already carries (`p13aResearchEntry()`), research
 * begun at the given weekly ceiling and advanced a few funded weeks so the
 * caller has real receipts to inspect or mutate. Generated worlds only; the
 * caller supplies `entry` so a shared world build is never repeated.
 */
export function p13bStaffedProject(entry: GameState, weeks = 3, budgetPerWeek = 40_000, seatCount = 4): {
  state: GameState
  laboratoryFacilityId: string
  projectId: string
  scientistIds: string[]
} {
  const laboratoryFacilityId = entry.operations.facilities.find(f => f.capability === 'laboratory')!.id
  const scientistIds = researchCandidates(entry).slice(0, seatCount).map(c => c.id)
  let state = applyActions(entry, scientistIds.map(scientistId => ({ kind: 'recruitScientist' as const, laboratoryFacilityId, scientistId })))
  state = applyActions(state, scientistIds.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId, scientistId })))
  const projectId = state.technology.projects[0]!.id
  state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek }])
  state = advanceTo(state, state.market.tick + weeks)
  return { state, laboratoryFacilityId, projectId, scientistIds }
}
