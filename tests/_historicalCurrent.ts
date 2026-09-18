import {migrateToV18,migrateToV29,type SaveFile,type SaveFileV29,type GameStateV18,type GameState} from '../src/core/index.js'
import {withResearchFoundation} from '../src/core/researchPeople.js'
import {initialTechnology} from '../src/core/technology.js'
import {initialPhysicalPlans} from '../src/core/physicalPlans.js'
import {initialTalentMarket} from '../src/core/talentMarket.js'
/** Historical player-law control: preserve pre-P12 authority while lifting the
 * type to the current test engine. Native migration uses the real V20 chain. */
export function migrateToCurrentControl(save:SaveFile):SaveFileV29 {
  if(save.saveVersion>=19)return migrateToV29(save)
  const old=migrateToV18(save)
  return {...old,saveVersion:29,state:liftHistoricalState(old.state)}
}

export function liftHistoricalState(state:GameStateV18):GameState {
  if ('hollywood' in state && state.hollywood!==null && state.hollywood!==undefined)throw new Error('Cannot erase living industry from a historical fixture')
  return {...state,hollywood:null,talent:state.talent.map(withResearchFoundation),technology:initialTechnology(state.market.tick),physicalPlans:initialPhysicalPlans(),
    // P14A.1 (Save V28): the same lift the real V27->V28 migration writes — a
    // historical campaign fought no contested expiry, so the market root opens empty.
    talentMarket:initialTalentMarket(),
    // P14B.1 (Save V29): the same lift the real V28->V29 migration writes — a
    // historical campaign filmed no recorded first take and promised nothing.
    firstTakes:[],promises:[],
    // P13B-S5-R07 (Save V25): the same lift the real V24->V25 migration writes —
    // a historical picture reviewed no setup recipe and its plan is at revision 0.
    operations:{...state.operations,workflows:state.operations.workflows.map(workflow=>({...workflow,setup:null,planRevision:0}))},
    // P13B-S6 (Save V26): the same lift the real V25->V26 migration writes — a
    // historical campaign cancelled nothing, so every placement carries a null
    // cancellation receipt and no refund row is reconstructed from its history.
    placement:{...state.placement,facilities:state.placement.facilities.map(facility=>({...facility,cancellation:null}))}}
}
