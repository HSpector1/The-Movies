import { computeForecast, forecastCenters } from './forecast.js'
import { marketingCapacityForInputs, marketingMenuFromCapacity } from './marketingMenu.js'
import { resolveShape } from './shape.js'
import { clamp } from './math.js'
import { TUNING } from './tuning.js'
import type { ReceptionInputs } from './reception.js'
import type { CastSlot, FilmShape, Talent } from './types.js'
import type { RivalBusiness } from './hollywoodTypes.js'

const SHAPES:readonly FilmShape[]=[
  {opening:'slowSetup',midpoint:'reversal',ending:'triumph'},
  {opening:'mysteryHook',midpoint:'reversal',ending:'triumph'},
  {opening:'mysteryHook',midpoint:'revelation',ending:'ambiguous'},
  {opening:'immediateAction',midpoint:'escalation',ending:'triumph'},
  {opening:'slowSetup',midpoint:'revelation',ending:'bittersweet'},
  {opening:'mysteryHook',midpoint:'escalation',ending:'tragic'},
]
const BILLINGS=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]] as const
const CAST_SLOTS=['lead','antagonist','support'] as const
/** A detached planning view. Hidden persona/strength/originality never become AI information.
 * Real reception continues to receive the actual canonical people and concept. */
export function perceivedPlanningInputs(input:ReceptionInputs):ReceptionInputs {
  const person=(t:Talent):Talent=>({...t,actual:t.perceived})
  const estimate=input.scriptStrengthOverride?.perceived??TUNING.HOLLYWOOD_UNASSESSED_ESTIMATE
  return {...input,concept:{...input.concept,baselineStrength:estimate,originalityRaw:TUNING.HOLLYWOOD_UNASSESSED_ESTIMATE},
    writer:person(input.writer),director:person(input.director),craftHires:input.craftHires.map(person),
    cast:{lead:person(input.cast.lead),antagonist:person(input.cast.antagonist),support:person(input.cast.support)},
    scriptStrengthOverride:{actual:estimate,perceived:estimate}}
}
export type IndustryPackageChoice={shape:FilmShape;promise:ReceptionInputs['promise'];budget:ReceptionInputs['budget'];
  cast:Record<'lead'|'antagonist'|'support',string>;expectedOperatingMargin:number;expectedIncrementalContribution:number;holdOperatingMargin:number}
type IndustryPackageOptions={
  seed:string;key:string;cashAvailable:number;weeklyCost:number;lockScreenplay:boolean
  /** P14B.4 seating preference (plan :215-236): bound-open member masks (promises.ts promisedCastMasks); absent = no preference. */
  promisedMasks?:ReadonlyMap<string,readonly CastSlot[]>
  /** 1363-F ruling 10: only a refused locked-screenplay re-search opts into extra forecasts. */
  diagnoseUnaffordableViability?:boolean
}
/** P14D.1 (1344-A §3.1): the same bounded search, reporting how many candidates the cash gate skipped
 * (unaffordable), how many it admitted (affordable) and how many of those passed the viability gate (viable).
 * The opt-in locked-screenplay diagnostic also counts skipped candidates that pass the same viability gate.
 * Those candidates never enter the affordable counts or compete for the choice. */
export function searchIndustryPackages(input:ReceptionInputs,policy:RivalBusiness['policy'],options:IndustryPackageOptions):{
  choice:IndustryPackageChoice|null;affordable:number;unaffordable:number;viable:number;unaffordableViable?:number} {
  const planning=perceivedPlanningInputs(input)
  const actors=[planning.cast.lead,planning.cast.antagonist,planning.cast.support]
  let best:IndustryPackageChoice|null=null;let bestScore=-Infinity;let bestBenefit=0
  let affordable=0,unaffordable=0,viable=0,unaffordableViable=0
  const diagnoseUnaffordableViability=options.lockScreenplay&&options.diagnoseUnaffordableViability===true
  const masks=options.promisedMasks
  // Benefit = DISTINCT beneficiaries whose assigned slot satisfies their mask (the cast is distinct by construction).
  const benefitOf=(cast:ReceptionInputs['cast']):number=>masks===undefined?0:CAST_SLOTS.filter(slot=>masks.get(cast[slot].id)?.includes(slot)===true).length
  for(const shape of options.lockScreenplay?[planning.shape]:SHAPES)for(const billing of BILLINGS) {
    let inp:ReceptionInputs={...planning,shape,shapeEffects:resolveShape(shape),cast:{lead:actors[billing[0]]!,antagonist:actors[billing[1]]!,support:actors[billing[2]]!}}
    const benefit=benefitOf(inp.cast)
    if(!options.lockScreenplay) {
      const center=forecastCenters(inp,true,true).core.delivered
      const range=(n:number):[number,number]=>[clamp(n-TUNING.HOLLYWOOD_PROMISE_HALF_WIDTH,-1,1),clamp(n+TUNING.HOLLYWOOD_PROMISE_HALF_WIDTH,-1,1)]
      inp={...inp,promise:{...inp.promise,ranges:{intimacy:range(center.intimacy),tonalWeight:range(center.tonalWeight),kineticEnergy:range(center.kineticEnergy)}}}
    }
    const required=inp.concept.baseNegativeCost*inp.shapeEffects.budgetDemandMultiplier*inp.era.costScale
    for(const scale of TUNING.HOLLYWOOD_NEGATIVE_CHOICES) {
      const negative=Math.round(required*scale*policy.negativeScale)
      const base={...inp,budget:{negative,marketing:0}}
      for(const marketing of marketingMenuFromCapacity(marketingCapacityForInputs(base,true))) {
        const exceedsCash=negative+marketing>options.cashAvailable
        if(exceedsCash) {
          unaffordable++
          if(!diagnoseUnaffordableViability)continue
        } else affordable++
        const candidate={...base,budget:{negative,marketing}}
        const forecast=computeForecast(candidate,{seed:options.seed,productionId:options.key,directorId:inp.director.id,releasedFilms:[],concepts:[inp.concept]},true,true)
        const expectedIncrementalContribution=forecast.expectedTotal*TUNING.STUDIO_RENTAL_BLENDED-negative-marketing
        // First payment follows eight production advances; the full six-week
        // run receives its last payment after fourteen operating charges.
        const holdOperatingMargin=-options.weeklyCost*(TUNING.PRODUCTION_TICKS+TUNING.THEATRICAL_WEEKS)
        const expectedOperatingMargin=expectedIncrementalContribution+holdOperatingMargin
        // Preference is a small cost of departing from the authored spend posture; outcomes remain uncertain.
        const score=expectedOperatingMargin-Math.abs(marketing/Math.max(negative,1)-policy.marketingRatio)*TUNING.HOLLYWOOD_POLICY_PREFERENCE_COST
        if(options.lockScreenplay&&score<=holdOperatingMargin)continue
        // Score the skipped package only for diagnosis; it cannot become a greenlight choice.
        if(exceedsCash){unaffordableViable++;continue}
        viable++
        // Maximize benefit among candidates that passed the cash and viability gates, then the ordinary score, then the inherited strict-greater BILLINGS order.
        if(benefit>bestBenefit||(benefit===bestBenefit&&score>bestScore)){bestBenefit=benefit;bestScore=score;best={shape,promise:inp.promise,budget:{negative,marketing},cast:{lead:inp.cast.lead.id,antagonist:inp.cast.antagonist.id,support:inp.cast.support.id},expectedOperatingMargin,expectedIncrementalContribution,holdOperatingMargin}}
      }
    }
  }
  if(diagnoseUnaffordableViability)return {choice:best,affordable,unaffordable,viable,unaffordableViable}
  return {choice:best,affordable,unaffordable,viable}
}
/** Bounded legal menu, never a winning-film oracle. The candidate set has a fixed ceiling. */
export function chooseIndustryPackage(input:ReceptionInputs,policy:RivalBusiness['policy'],options:IndustryPackageOptions):IndustryPackageChoice|null {
  return searchIndustryPackages(input,policy,options).choice
}
