// Historical V18 observatory only. Exact accepted reproduction still uses its pinned ref.
// The original provenance guards deliberately reject accepted evidence on a P12 branch.
import { initialTechnology } from '../../core/technology.js'
import { withResearchFoundation } from '../../core/researchPeople.js'
import { stableStringify } from '../../core/save.js'
import { SKILL_ORDER, GENRE_ORDER } from '../../core/tuning.js'
import type { GameState, GameStateV18 } from '../../core/types.js'
export { beginFoundingHistoricalControl as beginFounding } from '../../core/employment.js'
export { makeSaveV18 as makeSave } from '../../core/save.js'
/** Call only AFTER exact original import/hash checks. This is not gameplay migration. */
export function liftV18Control(state:GameStateV18):GameState { return {...structuredClone(state),hollywood:null,talent:state.talent.map(withResearchFoundation),technology:initialTechnology(state.market.tick)} }
export function historicalHashState<T extends object>(state:T):object {
  if(!('technology' in state) && !('hollywood' in state))return state
  if('hollywood' in state && state.hollywood!==null)throw new Error('Historical hash cannot discard a living industry')
  if ('technology' in state) {
    const technology = state.technology as GameState['technology']
    if (stableStringify(technology) !== stableStringify(initialTechnology(technology.recordingStartedWeek))) throw new Error('Historical hash cannot discard technology authority')
  }
  const {hollywood: _control, technology: _research,...frozen}=state as Partial<GameState>
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
