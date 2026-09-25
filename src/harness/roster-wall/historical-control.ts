// Historical V18 observatory only. Exact accepted reproduction still uses its pinned ref.
// The original provenance guards deliberately reject accepted evidence on a P12 branch.
import { initialTechnology } from '../../core/technology.js'
import { initialPhysicalPlans } from '../../core/physicalPlans.js'
import { initialTalentMarket } from '../../core/talentMarket.js'
import { withResearchFoundation } from '../../core/researchPeople.js'
import { buildTalentProvenance } from '../../core/aging.js'
import { initialCareerLifecycle } from '../../core/careerLifecycle.js'
import { stableStringify, validateTalentProvenanceRoot } from '../../core/save.js'
import { SKILL_ORDER, GENRE_ORDER } from '../../core/tuning.js'
import type { GameState, GameStateV18 } from '../../core/types.js'
export { beginFoundingHistoricalControl as beginFounding } from '../../core/employment.js'
export { makeSaveV18 as makeSave } from '../../core/save.js'
/** Call only AFTER exact original import/hash checks. This is not gameplay migration. */
export function liftV18Control(state:GameStateV18):GameState { const cloned=structuredClone(state)
  // P14C.1 — THE ADAPTER OWES A VALID CURRENT STATE. The original V18 files and the
  // pinned reproducer are untouched; this function is the ADAPTER that hands one to
  // the CURRENT engine, and a state the engine refuses is not a lift.
  //
  // Record 762 §12 F4 claimed no test imports this and the observatory is a CLI, so a
  // control is never ticked and never validated. BOTH CLAUSES ARE FALSE and the
  // comment that repeated them is struck. MEASURED: `tests/bridge-p05a1-owner-
  // greenlight.test.ts:27` and `tests/bridge-p05a3-roster-liveness.test.ts:34` import
  // this function, the bridge reaches `validateSaveV33` through `stateDigest`, and
  // `player-policy.ts:1122` assigns a lifted control and immediately ticks it.
  //
  // So the stored ages FLOOR, exactly as `convertV32ToV33` floors, and the anchors
  // keep the ORIGINAL UNROUNDED ages. Nothing historical is lost: the pre-C.1 fact
  // survives verbatim in `ageAtMigration`, and it is the cache over it that the engine
  // requires to be an integer.
  const people=state.talent.map(withResearchFoundation)
  return {...cloned,hollywood:null,
  // P13B S5-R07: the live workflow carries `setup`/`planRevision`; a historical control never selected a recipe.
  operations:{...cloned.operations,workflows:cloned.operations.workflows.map(w=>({...w,setup:null,planRevision:0}))},
  // P13B-S6: the live placement record carries `cancellation`; a historical control cancelled nothing.
  placement:{...cloned.placement,facilities:cloned.placement.facilities.map(f=>({...f,cancellation:null}))},talent:people.map(person=>({...person,age:Math.floor(person.age)})),technology:initialTechnology(state.market.tick),physicalPlans:initialPhysicalPlans(),
  // P14A.1 (Save V28): a historical control has no industry, so it holds no market
  // case, proposal or receipt — the empty root, exactly what the real lift writes.
  talentMarket:initialTalentMarket(),
  // P14B.1 (Save V29): a historical control films no first take and makes no
  // promise — the two empty roots, exactly what the real lift writes.
  // P14B.5 (Save V31): it shares no work — the empty relationship root.
  firstTakes:[],promises:[],relationships:[],
  // P14C.1 (Save V33): one `legacy_age_anchor` per person, anchored on the control's
  // OWN EXISTING age UNROUNDED at `boundaryWeek = market.tick`. The anchor is where the
  // pre-C.1 fact is preserved; `talent` above stores each floor of it, so the lifted
  // state satisfies validator condition 2 the moment the bridge or a tick reaches it.
  talentProvenance:buildTalentProvenance(people,state.market.tick,'legacy_age_anchor'),
  // P14C.2a (Save V34): a historical control has no industry, so the lifecycle never
  // engages and nobody announces — the empty root, exactly what the real lift writes.
  careerLifecycle:initialCareerLifecycle(state.market.tick)} }
export function historicalHashState<T extends object>(state:T):object {
  if(!('technology' in state) && !('hollywood' in state) && !('physicalPlans' in state) && !('talentMarket' in state)
    && !('firstTakes' in state) && !('promises' in state) && !('relationships' in state) && !('talentProvenance' in state)
    && !('careerLifecycle' in state))return state
  if('hollywood' in state && state.hollywood!==null)throw new Error('Historical hash cannot discard a living industry')
  // P14B.1: the control records no qualifying event and no commitment; an empty
  // pair of roots is the only lawful shape to discard. P14B.5: nor any edge.
  for(const key of ['firstTakes','promises','relationships'] as const) {
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
  if ('talentProvenance' in state) {
    // P14C.1. The provenance root fits NEITHER existing guard pattern: it is not
    // "must be empty" like `firstTakes`/`promises`/`relationships`, and not "must
    // equal the initial value" like `technology`/`physicalPlans`/`talentMarket`,
    // because it is legitimately NON-EMPTY and legitimately EVOLVES — these call
    // sites hash TICKED worlds, with people appended after the boundary and a `due`
    // list that has advanced. A canonical-rebuild check can only ever hold for a
    // state that never ticked, so it is the wrong question here.
    //
    // The right question is INTERNAL CONSISTENCY with the state the root travels
    // with: one row per person, every stored age equal to `ageAt(row, market.tick)`,
    // and `due` the exact recomputation. That is precisely what the live validator
    // already asks, so it is reused rather than copied — one law, one implementation.
    try {
      validateTalentProvenanceRoot(state as unknown as Record<string, unknown>)
    } catch (error) {
      throw new Error(`Historical hash cannot discard talent provenance authority — ${(error as Error).message}`)
    }
  }
  if ('careerLifecycle' in state) {
    // P14C.2a. A control has no industry, so the lifecycle never engages (773 D6): the
    // root is lawful to discard only while it holds no record. Its boundary week is the
    // lift week and the hashed world may have ticked since, so only the records are asked.
    if ((state as Partial<GameState>).careerLifecycle?.records.length !== 0) throw new Error('Historical hash cannot discard career lifecycle authority')
  }
  const {hollywood: _control, technology: _research, physicalPlans: _plans, talentMarket: _market,
    firstTakes: _takes, promises: _promises, relationships: _relationships, talentProvenance: _provenance,
    careerLifecycle: _lifecycle, ...frozen}=state as Partial<GameState>
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
