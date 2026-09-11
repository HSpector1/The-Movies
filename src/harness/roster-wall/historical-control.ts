// Historical V18 observatory only. Exact accepted reproduction still uses its pinned ref.
// The original provenance guards deliberately reject accepted evidence on a P12 branch.
import { initialTechnology } from '../../core/technology.js'
import { withResearchFoundation } from '../../core/researchPeople.js'
import type { GameState, GameStateV18 } from '../../core/types.js'
export { beginFoundingHistoricalControl as beginFounding } from '../../core/employment.js'
export { makeSaveV18 as makeSave } from '../../core/save.js'
/** Call only AFTER exact original import/hash checks. This is not gameplay migration. */
export function liftV18Control(state:GameStateV18):GameState { return {...structuredClone(state),hollywood:null,talent:state.talent.map(withResearchFoundation),technology:initialTechnology(state.market.tick)} }
export function historicalHashState<T extends object>(state:T):object {
  if(!('hollywood' in state))return state
  if(state.hollywood!==null)throw new Error('Historical hash cannot discard a living industry')
  const {hollywood: _control,...frozen}=state
  return frozen
}
