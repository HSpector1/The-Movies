import {migrateToV18,migrateToV20,type SaveFile,type SaveFileV20,type GameStateV18,type GameState} from '../src/core/index.js'
import {withResearchFoundation} from '../src/core/researchPeople.js'
import {initialTechnology} from '../src/core/technology.js'
/** Historical player-law control: preserve pre-P12 authority while lifting the
 * type to the current test engine. Native migration uses the real V20 chain. */
export function migrateToCurrentControl(save:SaveFile):SaveFileV20 {
  if(save.saveVersion>=19)return migrateToV20(save)
  const old=migrateToV18(save)
  return {...old,saveVersion:20,state:liftHistoricalState(old.state)}
}

export function liftHistoricalState(state:GameStateV18):GameState {
  if ('hollywood' in state && state.hollywood!==null && state.hollywood!==undefined)throw new Error('Cannot erase living industry from a historical fixture')
  return {...state,hollywood:null,talent:state.talent.map(withResearchFoundation),technology:initialTechnology(state.market.tick)}
}
