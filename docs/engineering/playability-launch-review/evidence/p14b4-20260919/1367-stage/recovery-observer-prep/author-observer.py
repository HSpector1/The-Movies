from pathlib import Path
import hashlib,difflib,json
root=Path('/Users/zacheryspector/studio-scratch/1367-recovery-schema-candidate');out=root/'observer-prep';src=root/'candidate/src/core/hollywoodTick.ts';base=src.read_text();text=base
assert hashlib.sha256(base.encode()).hexdigest()=='21b00c62f0057786f81d1b821eb5984677f7e4251211ecaf7d5288840d5f719e'
def edit(old,new,n=1):
 global text
 assert text.count(old)==n,(old,text.count(old));text=text.replace(old,new)
interface='''/** Optional read-only observation of actual predecessor policy branches.
 * Payloads contain copied scalars/arrays only; no GameState owner is exposed.
 * This observer neither evaluates the new recovery predicate nor changes policy. */
export type RivalPolicyObservation =
  | { kind: 'staffCashRefusal'; studioId: string; week: number;
      branch: 'renewal' | 'filmVacancy' | 'scientistVacancy'; talentId: string;
      role: Talent['role']; slot: number | null; contractId: string | null;
      cash: number; signingBonus: number; reserveAfterOffer: number }
  | { kind: 'legacyRelease'; studioId: string; week: number; employmentOrdinal: number;
      talentId: string; annualSalary: number; remainingWeeks: number; cash: number;
      outcome: 'occupiedOrShortTerm' | 'openPromise' | 'reserveRefused' | 'released';
      occupied: boolean; charge: number | null; reserveAfterRelease: number | null }
  | { kind: 'decision'; studioId: string; week: number; nextDecisionWeekBefore: number;
      decisionRan: true; greenlit: boolean; commissioned: boolean;
      productionCount: number; runCount: number; hasScriptWork: boolean;
      cash: number; reserve: number; sinceAtDecisionEnd: number | null;
      commissionStop: 'none' | 'fullIndex' | 'cashBelowReserve' | 'hold' | 'busyWriter'
        | 'missingWriter' | 'missingTeam' | 'unaffordablePackage';
      staffing: StaffingCashObservation;
      retainedActiveOrdinals: readonly number[];
      evaluated: readonly { ordinal: number; source: 'active' | 'retry';
        outcome: 'viable' | 'staffingBlocked' | 'cashBlocked' | 'economicRejection' }[] }
export type RivalPolicyObserver = (observation: RivalPolicyObservation) => void
export type StaffingCashObservation = {
  unfilledFilmSlotForCash: boolean; renewalRefusedForCash: boolean;
  unrelatedScientistSlotRefusedForCash: boolean
}
type DecisionObservation = Extract<RivalPolicyObservation, { kind: 'decision' }>

'''
edit('/** Fill only actual role deficits.',interface+'/** Fill only actual role deficits.')
edit("suppliedPeople:{id:string;age:number}[]):Talent[] {","suppliedPeople:{id:string;age:number}[],observer?:RivalPolicyObserver,cashFacts?:StaffingCashObservation):Talent[] {")
edit("    if(b.account.cash-terms.signingBonus<reserveAfterOffer(terms,ordinal))continue",'''    const renewalReserve=reserveAfterOffer(terms,ordinal)
    if(b.account.cash-terms.signingBonus<renewalReserve) {
      if(cashFacts)cashFacts.renewalRefusedForCash=true
      observer?.({kind:'staffCashRefusal',studioId:b.studioId,week,branch:'renewal',
        talentId:person.id,role:person.role,slot:null,contractId:old.contractId,
        cash:b.account.cash,signingBonus:terms.signingBonus,reserveAfterOffer:renewalReserve})
      continue
    }''')
edit("    if(b.account.cash-terms.signingBonus < reserveAfterOffer(terms))continue",'''    const offerReserve=reserveAfterOffer(terms)
    if(b.account.cash-terms.signingBonus < offerReserve) {
      if(cashFacts) {
        if(role==='scientist')cashFacts.unrelatedScientistSlotRefusedForCash=true
        else cashFacts.unfilledFilmSlotForCash=true
      }
      observer?.({kind:'staffCashRefusal',studioId:b.studioId,week,
        branch:role==='scientist'?'scientistVacancy':'filmVacancy',talentId:person.id,role,slot,
        contractId:null,cash:b.account.cash,signingBonus:terms.signingBonus,reserveAfterOffer:offerReserve})
      continue
    }''')
edit("    if(seated.has(id)||e.terms.endWeekExclusive-week<=TUNING.HIRING_TERMINATION_CAP_WEEKS)continue\n    if(state.promises.some(p=>p.issuerStudioId===b.studioId&&p.beneficiaryPersonId===id&&p.outcome===null))continue",'''    // Observe the real R3 branches; surplus selection and branch order are unchanged.
    const observeRelease=(outcome:Extract<RivalPolicyObservation,{kind:'legacyRelease'}>['outcome'],
      charge:number|null=null,reserveAfterRelease:number|null=null)=>observer?.({
      kind:'legacyRelease',studioId:b.studioId,week,employmentOrdinal:ordinal,talentId:id,
      annualSalary:e.terms.annualSalary,remainingWeeks:e.terms.endWeekExclusive-week,
      cash:b.account.cash,outcome,occupied:seated.has(id),charge,reserveAfterRelease})
    if(seated.has(id)||e.terms.endWeekExclusive-week<=TUNING.HIRING_TERMINATION_CAP_WEEKS) {
      observeRelease('occupiedOrShortTerm');continue
    }
    if(state.promises.some(p=>p.issuerStudioId===b.studioId&&p.beneficiaryPersonId===id&&p.outcome===null)) {
      observeRelease('openPromise');continue
    }''')
edit("    if(b.account.cash-charge<operatingReserve(b,{...h,activeEmploymentOrdinals},week))continue",'''    const releaseReserve=operatingReserve(b,{...h,activeEmploymentOrdinals},week)
    if(b.account.cash-charge<releaseReserve) {observeRelease('reserveRefused',charge,releaseReserve);continue}
    observeRelease('released',charge,releaseReserve)''')
edit("  greenlights:{studioId:string;production:Production}[]) {\n  if(week<b.nextDecisionWeek)return\n  b.nextDecisionWeek=week+TUNING.HOLLYWOOD_DECISION_WEEKS",'''  greenlights:{studioId:string;production:Production}[],observer?:RivalPolicyObserver,cashFacts?:StaffingCashObservation) {
  if(week<b.nextDecisionWeek)return
  const nextDecisionWeekBefore=b.nextDecisionWeek
  b.nextDecisionWeek=week+TUNING.HOLLYWOOD_DECISION_WEEKS
  let greenlit=false,commissioned=false
  let commissionStop:DecisionObservation['commissionStop']='none'
  const evaluated:DecisionObservation['evaluated'][number][]=[]
  const runDecision=()=>{''')
edit("    greenlights.push({studioId:b.studioId,production})","    greenlights.push({studioId:b.studioId,production})\n    if(observer)greenlit=true")
edit("    const result=evaluate(ready)\n    const shelving=b.screenplayShelving", "    const result=evaluate(ready)\n    if(observer)evaluated.push({ordinal:Number(ready.id.slice(7)),source:'SOURCE',outcome:result.outcome})\n    const shelving=b.screenplayShelving",2)
text=text.replace("source:'SOURCE'","source:'active'",1).replace("source:'SOURCE'","source:'retry'",1)
edit("  if(b.activeScriptOrdinals.length>=2||b.account.cash<operatingReserve(b,h,week))return\n  if(week<b.screenplayShelving.commissionHoldUntilWeek)return",'''  if(b.activeScriptOrdinals.length>=2){commissionStop='fullIndex';return}
  if(b.account.cash<operatingReserve(b,h,week)){commissionStop='cashBelowReserve';return}
  if(week<b.screenplayShelving.commissionHoldUntilWeek){commissionStop='hold';return}''')
edit("  if(!writer)return","  if(!writer){commissionStop=employees.some(t=>t.role==='writer')?'busyWriter':'missingWriter';return}")
edit("  if(!director||cast.length<3||!craft)return","  if(!director||cast.length<3||!craft){commissionStop='missingTeam';return}")
edit("  if(!candidate)return","  if(!candidate){commissionStop='unaffordablePackage';return}")
edit("  h.concepts=[...h.concepts,concept]\n}",'''  h.concepts=[...h.concepts,concept]
  if(observer)commissioned=true
  }
  runDecision()
  // Normal returns converge here; exceptions propagate without a fabricated observation.
  if(observer)observer({kind:'decision',studioId:b.studioId,week,nextDecisionWeekBefore,decisionRan:true,
    greenlit,commissioned,productionCount:b.productions.length,runCount:b.runs.length,
    hasScriptWork:hotDevelopment(b).projects.some(p=>p.status==='drafting'||p.status==='rewriting'),
    cash:b.account.cash,reserve:operatingReserve(b,h,week),sinceAtDecisionEnd:b.costCutting.since,
    commissionStop,staffing:{...cashFacts!},retainedActiveOrdinals:[...b.activeScriptOrdinals],
    evaluated:evaluated.map(row=>({...row}))})
}''')
edit("export function advanceHollywoodWeek(state:GameState,factorById?:ReadonlyMap<string,number>):", "export function advanceHollywoodWeek(state:GameState,factorById?:ReadonlyMap<string,number>,observer?:RivalPolicyObserver):")
edit("  for(const b of h.businesses) {\n    technology=considerRivalSoundPurchase",'''  for(const b of h.businesses) {
    const cashFacts=observer?{unfilledFilmSlotForCash:false,renewalRefusedForCash:false,
      unrelatedScientistSlotRefusedForCash:false}:undefined
    technology=considerRivalSoundPurchase''')
edit("},()=>'scientist' as const),suppliedTalent)","},()=>'scientist' as const),suppliedTalent,observer,cashFacts)")
edit("    decide(state,h,b,talent,week,greenlights)","    decide(state,h,b,talent,week,greenlights,observer,cashFacts)")
assert 'rivalCostCuttingEntry' not in text and 'disposeEligibleRivalFacilities' not in text
assert text.count('costCutting')==1
p=out/'candidate/src/core/hollywoodTick.ts';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
(out/'observer-production.patch').write_text(''.join(difflib.unified_diff(base.splitlines(keepends=True),text.splitlines(keepends=True),fromfile='a/src/core/hollywoodTick.ts',tofile='b/src/core/hollywoodTick.ts')))
# A test-only control with identical executable body and relocated relative imports.
control=base.replace("from './","from '../../src/core/").replace("import('./","import('../../src/core/")
p=out/'tests/helpers/recovery-schema-policy-control.ts';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(control)
assert control.replace("from '../../src/core/","from './").replace("import('../../src/core/","import('./")==base
(out/'CONTROL-PROVENANCE.json').write_text(json.dumps({'source':str(src),'sourceSha256':hashlib.sha256(base.encode()).hexdigest(),'controlPath':'tests/helpers/recovery-schema-policy-control.ts','controlSha256':hashlib.sha256(control.encode()).hexdigest(),'transformation':"Only from './ and import('./ prefixes relocated to ../../src/core/; reverse transform exactly equals S source."},indent=2)+'\n')
print('observer patch',hashlib.sha256((out/'observer-production.patch').read_bytes()).hexdigest())
