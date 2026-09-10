import { computeForecast, forecastCenters } from './forecast.js'
import { marketingCapacityForInputs, marketingMenuFromCapacity } from './marketingMenu.js'
import { resolveShape } from './shape.js'
import { clamp } from './math.js'
import { TUNING } from './tuning.js'
import type { ReceptionInputs } from './reception.js'
import type { FilmShape, Talent } from './types.js'
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
/** A detached planning view. Hidden persona/strength/originality never become AI information.
 * Real reception continues to receive the actual canonical people and concept. */
export function perceivedPlanningInputs(input:ReceptionInputs):ReceptionInputs {
  const person=(t:Talent):Talent=>({...t,actual:t.perceived})
  return {...input,concept:{...input.concept,baselineStrength:TUNING.HOLLYWOOD_UNASSESSED_ESTIMATE,originalityRaw:TUNING.HOLLYWOOD_UNASSESSED_ESTIMATE},
    writer:person(input.writer),director:person(input.director),craftHires:input.craftHires.map(person),
    cast:{lead:person(input.cast.lead),antagonist:person(input.cast.antagonist),support:person(input.cast.support)},
    scriptStrengthOverride:{actual:input.scriptStrengthOverride?.perceived??TUNING.HOLLYWOOD_UNASSESSED_ESTIMATE,
      perceived:input.scriptStrengthOverride?.perceived??TUNING.HOLLYWOOD_UNASSESSED_ESTIMATE}}
}
export type IndustryPackageChoice={shape:FilmShape;promise:ReceptionInputs['promise'];budget:ReceptionInputs['budget'];
  cast:Record<'lead'|'antagonist'|'support',string>;expectedOperatingMargin:number}
/** Bounded legal menu, never a winning-film oracle. The candidate set has a fixed ceiling. */
export function chooseIndustryPackage(input:ReceptionInputs,policy:RivalBusiness['policy'],options:{
  seed:string;key:string;cashAvailable:number;weeklyCost:number;lockScreenplay:boolean
}):IndustryPackageChoice|null {
  const planning=perceivedPlanningInputs(input)
  const actors=[planning.cast.lead,planning.cast.antagonist,planning.cast.support]
  let best:IndustryPackageChoice|null=null;let bestScore=-Infinity
  for(const shape of options.lockScreenplay?[planning.shape]:SHAPES)for(const billing of BILLINGS) {
    let inp:ReceptionInputs={...planning,shape,shapeEffects:resolveShape(shape),cast:{lead:actors[billing[0]]!,antagonist:actors[billing[1]]!,support:actors[billing[2]]!}}
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
        if(negative+marketing>options.cashAvailable)continue
        const candidate={...base,budget:{negative,marketing}}
        const forecast=computeForecast(candidate,{seed:options.seed,productionId:options.key,directorId:inp.director.id,releasedFilms:[],concepts:[inp.concept]},true,true)
        const expectedOperatingMargin=forecast.expectedTotal*TUNING.STUDIO_RENTAL_BLENDED-negative-marketing-options.weeklyCost*TUNING.PRODUCTION_TICKS
        // Preference is a small cost of departing from the authored spend posture; outcomes remain uncertain.
        const score=expectedOperatingMargin-Math.abs(marketing/Math.max(negative,1)-policy.marketingRatio)*TUNING.HOLLYWOOD_POLICY_PREFERENCE_COST
        if(score>bestScore){bestScore=score;best={shape,promise:inp.promise,budget:{negative,marketing},cast:{lead:inp.cast.lead.id,antagonist:inp.cast.antagonist.id,support:inp.cast.support.id},expectedOperatingMargin}}
      }
    }
  }
  return best
}
