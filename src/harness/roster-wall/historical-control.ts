// Historical V18 observatory only. Exact accepted reproduction still uses its pinned ref.
// The original provenance guards deliberately reject accepted evidence on a P12 branch.
import { initialTechnology } from '../../core/technology.js'
import { initialPhysicalPlans } from '../../core/physicalPlans.js'
import { initialTalentMarket } from '../../core/talentMarket.js'
import { withResearchFoundation } from '../../core/researchPeople.js'
import { stableStringify } from '../../core/save.js'
import { SKILL_ORDER, GENRE_ORDER } from '../../core/tuning.js'
import type { GameState, GameStateV18 } from '../../core/types.js'
export { beginFoundingHistoricalControl as beginFounding } from '../../core/employment.js'
export { makeSaveV18 as makeSave } from '../../core/save.js'
/** Call only AFTER exact original import/hash checks. This is not gameplay migration. */
export function liftV18Control(state:GameStateV18):GameState { const cloned=structuredClone(state); return {...cloned,hollywood:null,
  // P13B S5-R07: the live workflow carries `setup`/`planRevision`; a historical control never selected a recipe.
  operations:{...cloned.operations,workflows:cloned.operations.workflows.map(w=>({...w,setup:null,planRevision:0}))},
  // P13B-S6: the live placement record carries `cancellation`; a historical control cancelled nothing.
  placement:{...cloned.placement,facilities:cloned.placement.facilities.map(f=>({...f,cancellation:null}))},talent:state.talent.map(withResearchFoundation),technology:initialTechnology(state.market.tick),physicalPlans:initialPhysicalPlans(),
  // P14A.1 (Save V28): a historical control has no industry, so it holds no market
  // case, proposal or receipt — the empty root, exactly what the real lift writes.
  talentMarket:initialTalentMarket(),
  // P14B.1 (Save V29): a historical control films no first take and makes no
  // promise — the two empty roots, exactly what the real lift writes.
  firstTakes:[],promises:[]} }
export function historicalHashState<T extends object>(state:T):object {
  if(!('technology' in state) && !('hollywood' in state) && !('physicalPlans' in state) && !('talentMarket' in state)
    && !('firstTakes' in state) && !('promises' in state))return state
  if('hollywood' in state && state.hollywood!==null)throw new Error('Historical hash cannot discard a living industry')
  // P14B.1: the control records no qualifying event and no commitment; an empty
  // pair of roots is the only lawful shape to discard.
  for(const key of ['firstTakes','promises'] as const) {
    if(key in state && (state as Partial<GameState>)[key]?.length!==0)throw new Error(`Historical hash cannot discard ${key} authority`)
  }
  if ('technology' in state) {
    const technology = state.technology as GameState['technology']
    if (stableStringify(technology) !== stableStringify(initialTechnology(technology.recordingStartedWeek))) throw new Error('Historical hash cannot discard technology authority')
  }
  if ('physicalPlans' in state) {
    // P13B-S3: the historical control never queues physical work; an empty plan root is the only lawful shape to discard.
    if (stableStringify(state.physicalPlans) !== stableStringify(initialPhysicalPlans())) throw new Error('Historical hash cannot discard physical-plan authority')
  }
  if ('talentMarket' in state) {
    // P14A.1: the historical control fights no contested expiry; an empty market root is the only lawful shape to discard.
    if (stableStringify(state.talentMarket) !== stableStringify(initialTalentMarket())) throw new Error('Historical hash cannot discard talent-market authority')
  }
  const {hollywood: _control, technology: _research, physicalPlans: _plans, talentMarket: _market,
    firstTakes: _takes, promises: _promises,...frozen}=state as Partial<GameState>
  if (frozen.operations) {
    // P13B S5-R07: the live workflow carries `setup`/`planRevision`; a historical control never selected a recipe, so the only lawful
    // shape to discard is the null record at revision 0.
    frozen.operations = {...frozen.operations, workflows: frozen.operations.workflows.map(workflow => {
      const {setup, planRevision, ...rest} = workflow as typeof workflow & {setup?: unknown; planRevision?: unknown}
      if ((setup !== undefined && setup !== null) || (planRevision !== undefined && planRevision !== 0)) throw new Error('Historical hash cannot discard production setup authority')
      return rest as typeof workflow
    })}
  }
  if (frozen.placement) {
    // P13B-S6: the live placement record carries `cancellation`; a historical control cancelled nothing, so the only
    // lawful shape to discard is the null receipt on a record that was never cancelled.
    frozen.placement = {...frozen.placement, facilities: frozen.placement.facilities.map(placed => {
      const {cancellation, ...rest} = placed as typeof placed & {cancellation?: unknown}
      if ((cancellation !== undefined && cancellation !== null) || placed.status === 'cancelled') throw new Error('Historical hash cannot discard installation cancellation authority')
      return rest as typeof placed
    })}
  }
  if (frozen.talent) frozen.talent = frozen.talent.map(person => {
    if (person.role === 'scientist') throw new Error('Historical hash cannot discard a Scientist')
    const copy = { ...person }
    for (const key of ['skills','ceilings','devRate','genreExperience','workHistory'] as const) {
      if (!Object.hasOwn(person[key], 'research')) continue
      const neutral = key === 'skills' ? Object.fromEntries(SKILL_ORDER.research.map(skill => [skill,{actual:1,perceived:1}]))
        : key === 'ceilings' ? Object.fromEntries(SKILL_ORDER.research.map(skill => [skill,1]))
        : key === 'genreExperience' ? Object.fromEntries(GENRE_ORDER.map(genre => [genre,{actual:0,perceived:0}]))
        : key === 'devRate' ? 1 : 0
      if (stableStringify(person[key].research) !== stableStringify(neutral)) throw new Error('Historical hash cannot discard research person history')
      const { research: _neutral, ...old } = person[key]
      Object.assign(copy, { [key]: old })
    }
    return copy
  })
  return frozen
}
