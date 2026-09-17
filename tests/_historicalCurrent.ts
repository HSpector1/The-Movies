import {migrateToV18,migrateToV25,type SaveFile,type SaveFileV25,type GameStateV18,type GameState} from '../src/core/index.js'
import {withResearchFoundation} from '../src/core/researchPeople.js'
import {initialTechnology} from '../src/core/technology.js'
import {initialPhysicalPlans} from '../src/core/physicalPlans.js'
/** Historical player-law control: preserve pre-P12 authority while lifting the
 * type to the current test engine. Native migration uses the real V20 chain. */
export function migrateToCurrentControl(save:SaveFile):SaveFileV25 {
  if(save.saveVersion>=19)return migrateToV25(save)
  const old=migrateToV18(save)
  return {...old,saveVersion:25,state:liftHistoricalState(old.state)}
}

export function liftHistoricalState(state:GameStateV18):GameState {
  if ('hollywood' in state && state.hollywood!==null && state.hollywood!==undefined)throw new Error('Cannot erase living industry from a historical fixture')
  return {...state,hollywood:null,talent:state.talent.map(withResearchFoundation),technology:initialTechnology(state.market.tick),physicalPlans:initialPhysicalPlans(),
    // P13B-S5-R07 (Save V25): the same lift the real V24->V25 migration writes —
    // a historical picture reviewed no setup recipe and its plan is at revision 0.
    operations:{...state.operations,workflows:state.operations.workflows.map(workflow=>({...workflow,setup:null,planRevision:0}))}}
}
