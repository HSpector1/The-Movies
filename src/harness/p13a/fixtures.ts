import { applyActions } from '../../core/actions.js'
import { initializeHollywood } from '../../core/hollywood.js'
import { commitPlacement } from '../../core/placement.js'
import { tick } from '../../core/tick.js'
import { generateWorld } from '../../core/worldgen.js'
import type { GameState } from '../../core/types.js'

/** Generated evidence worlds only; every dated fact is produced by the live engine. */
export function p13aGeneratedStudio(seed = 'p13a-core-causal-01'): GameState {
  const world = generateWorld(seed)
  return initializeHollywood(applyActions({...world,economyEngagedEver:true},[{kind:'activateStudioOperations'}]),'fresh')
}
export function advanceTo(state: GameState, week: number): GameState {
  if (week < state.market.tick) throw new Error('Evidence cannot rewind a campaign')
  while (state.market.tick < week) state = tick(state)
  return state
}
export function p13aLaboratorySlice(): GameState {
  return advanceTo(commitPlacement(p13aGeneratedStudio(),{blueprintId:'research-laboratory',origin:{gx:0,gy:9}}),12)
}
export function p13aResearchReady(): GameState {
  let state = p13aLaboratorySlice()
  const laboratoryFacilityId = state.operations.facilities.find(f=>f.capability==='laboratory')!.id
  state = applyActions(state,[{kind:'installAcousticInstruments',laboratoryFacilityId}])
  state = advanceTo(state,260)
  state = applyActions(state,[{kind:'recruitScientist',laboratoryFacilityId}])
  const scientistId = state.talent.find(t=>t.role==='scientist')!.id
  return applyActions(state,[{kind:'assignResearchScientist',laboratoryFacilityId,scientistId}])
}
export function adoptExistingSoundChain(state: GameState): GameState {
  const stageFacilityId=state.operations.facilities.find(f=>f.capability==='soundstage')!.id
  const postFacilityId=state.operations.facilities.find(f=>f.capability==='post')!.id
  return applyActions(state,[{kind:'adoptSynchronizedSound',stageFacilityId,postFacilityId}])
}
