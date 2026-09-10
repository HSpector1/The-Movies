import {migrateToV18,migrateToV19,type SaveFile,type SaveFileV19,type GameStateV18,type GameState} from '../src/core/index.js'
/** Historical player-law control: preserve all pre-P12 authority while lifting
 * the type to the current test engine. Never erase a persisted living industry.
 * Native migration is tested through migrateToV19 and the real bridge separately. */
export function migrateToCurrentControl(save:SaveFile):SaveFileV19 {
  if(save.saveVersion===19)return migrateToV19(save)
  const old=migrateToV18(save)
  return {...old,saveVersion:19,state:{...old.state,hollywood:null}}
}

export function liftHistoricalState(state:GameStateV18):GameState {
  if ('hollywood' in state && state.hollywood!==null && state.hollywood!==undefined)throw new Error('Cannot erase living industry from a historical fixture')
  return {...state,hollywood:null}
}
