#!/usr/bin/env python3
"""Emit a reviewable observer-only patch; never modify the supplied arm.
Each invocation requires the parent's exact hollywoodTick / rivalResearch hashes.
No fallback matching, runtime, fixtures, or gameplay changes.
"""
import argparse, difflib, hashlib, json
from pathlib import Path
p=argparse.ArgumentParser(); p.add_argument('--tree',required=True); p.add_argument('--tick-sha256',required=True); p.add_argument('--research-sha256',required=True); p.add_argument('--output',required=True); a=p.parse_args()
root=Path(a.tree); out=Path(a.output)
if out.exists() or out.is_symlink(): raise SystemExit('exclusive output required')
files={}
for rel,expected in [('src/core/hollywoodTick.ts',a.tick_sha256),('src/core/rivalResearch.ts',a.research_sha256)]:
 f=root/rel
 if any(x.is_symlink() for x in [f,*f.parents]): raise SystemExit('symlink source refused')
 raw=f.read_bytes()
 if hashlib.sha256(raw).hexdigest()!=expected: raise SystemExit('source pin mismatch: '+rel)
 files[rel]=raw.decode()
def once(text,old,new,count=1):
 if text.count(old)!=count: raise SystemExit(f'anchor mismatch: expected {count}: {old}')
 return text.replace(old,new)
rel='src/core/hollywoodTick.ts'; t=files[rel]
t="import { observe1368 } from '../../tests/1368-measurement-observer.js'\n"+t
t=once(t,'  for(const b of h.businesses) {',"  for(const b of h.businesses) {\n    observe1368('business-pass',()=>({week,studioId:b.studioId,cash:b.account.cash,weeklyCost:rivalWeeklyOperatingCost(b,h,week)}))")
t=once(t,'  if(week<b.nextDecisionWeek)return',"  if(week<b.nextDecisionWeek){observe1368('decision-not-due',()=>({week,studioId:b.studioId,nextDecisionWeek:b.nextDecisionWeek}));return}")
t=once(t,'  b.nextDecisionWeek=week+TUNING.HOLLYWOOD_DECISION_WEEKS',"  observe1368('decision-start',()=>({week,studioId:b.studioId,cash:b.account.cash,reserve:operatingReserve(b,h,week),productionCount:b.productions.length,runCount:b.runs.length,activeOrdinals:b.activeScriptOrdinals,scriptWork:hotDevelopment(b).projects.filter(p=>p.status==='drafting'||p.status==='rewriting').map(p=>p.id)}))\n  b.nextDecisionWeek=week+TUNING.HOLLYWOOD_DECISION_WEEKS")
t=once(t,'    const result=evaluate(ready)',"    const result=evaluate(ready)\n    observe1368('evaluation',()=>({week,studioId:b.studioId,scriptProjectId:ready.id,retry:b.screenplayShelving.shelved.some(s=>b.development.projects[s.ordinal]?.id===ready.id),outcome:result.outcome}))",2)
# The observer records actual executed refusals; it does not infer a slot from absence.
old='    if(b.account.cash-terms.signingBonus<reserveAfterOffer(terms,ordinal))continue'
if old in t:
 t=once(t,old,"    if(b.account.cash-terms.signingBonus<reserveAfterOffer(terms,ordinal)){observe1368('staff-cash-refusal',()=>({week,studioId:b.studioId,kind:'renewal',talentId:person.id,role:person.role,cash:b.account.cash,bonus:terms.signingBonus,reserve:reserveAfterOffer(terms,ordinal)}));continue}")
else:
 t=once(t,'      cashFacts.renewalRefusedForCash=true;continue',"      observe1368('staff-cash-refusal',()=>({week,studioId:b.studioId,kind:'renewal',talentId:person.id,role:person.role,cash:b.account.cash,bonus:terms.signingBonus,reserve:reserveAfterOffer(terms,ordinal)}))\n      cashFacts.renewalRefusedForCash=true;continue")
old='    if(b.account.cash-terms.signingBonus < reserveAfterOffer(terms))continue'
obs="observe1368('staff-cash-refusal',()=>({week,studioId:b.studioId,kind:'unfilled-slot',talentId:person.id,role,cash:b.account.cash,bonus:terms.signingBonus,reserve:reserveAfterOffer(terms)}))"
if old in t: t=once(t,old,'    if(b.account.cash-terms.signingBonus < reserveAfterOffer(terms)){'+obs+';continue}')
else: t=once(t,'    if(b.account.cash-terms.signingBonus < reserveAfterOffer(terms)) {','    if(b.account.cash-terms.signingBonus < reserveAfterOffer(terms)) {\n      '+obs)
t=once(t,"    moveRivalMoney(b.account,'termination',-charge,week)","    observe1368('termination-charge',()=>({week,studioId:b.studioId,contractId:e.contractId,talentId:id,cash:b.account.cash,charge,saving:weeklySalary(e.terms.annualSalary)+TUNING.OVERHEAD_PER_EMPLOYEE,weeklyCostBefore:rivalWeeklyOperatingCost(b,h,week)+weeklySalary(e.terms.annualSalary)+TUNING.OVERHEAD_PER_EMPLOYEE,reserveAfter:operatingReserve(b,h,week),endWeekExclusive:e.terms.endWeekExclusive,cutting:'costCutting' in b?(b as unknown as {costCutting:{since:number|null}}).costCutting.since:null}))\n    moveRivalMoney(b.account,'termination',-charge,week)")
t=once(t,"    moveRivalMoney(b.account,'facilityOpex',-rivalCapacityOpex(b,h.receipts),week)","    observe1368('operating-charge',()=>({week,studioId:b.studioId,payroll:employees.reduce((sum,e)=>sum+weeklySalary(e.terms.annualSalary),0),overhead:TUNING.OVERHEAD_BASE+TUNING.OVERHEAD_PER_EMPLOYEE*employees.length,facilityOpex:rivalCapacityOpex(b,h.receipts),laboratoryBodyOpex:b.operations.facilities.filter(f=>f.capability==='laboratory').length*TUNING.RESEARCH_LABORATORY_WEEKLY_OPERATING_COST,facilities:b.operations.facilities,employment:employees.map(e=>({contractId:e.contractId,talentId:e.terms.talentId,annualSalary:e.terms.annualSalary}))}))\n    moveRivalMoney(b.account,'facilityOpex',-rivalCapacityOpex(b,h.receipts),week)")
# Preserve each existing early-return expression and branch order; attach a fact only inside its actual branch.
gates=[
 ("  if(b.activeScriptOrdinals.length>=2||b.account.cash<operatingReserve(b,h,week))return", "  if(b.activeScriptOrdinals.length>=2||b.account.cash<operatingReserve(b,h,week)){observe1368('commission-gate',()=>({week,studioId:b.studioId,reason:b.activeScriptOrdinals.length>=2?'fullIndex':'belowReserve',cash:b.account.cash,reserve:operatingReserve(b,h,week)}));return}"),
 ("  if(week<b.screenplayShelving.commissionHoldUntilWeek)return", "  if(week<b.screenplayShelving.commissionHoldUntilWeek){observe1368('commission-gate',()=>({week,studioId:b.studioId,reason:'hold'}));return}"),
 ("  if(!writer)return", "  if(!writer){observe1368('commission-gate',()=>({week,studioId:b.studioId,reason:employees.some(t=>t.role==='writer')?'busyWriter':'missingWriter'}));return}"),
 ("  if(!director||cast.length<3||!craft)return", "  if(!director||cast.length<3||!craft){observe1368('commission-gate',()=>({week,studioId:b.studioId,reason:'missingTeam'}));return}"),
 ("  if(!candidate)return", "  if(!candidate){observe1368('commission-gate',()=>({week,studioId:b.studioId,reason:'unaffordablePackage'}));return}")]
for old,new in gates:
 if old in t:t=once(t,old,new)
if 'let commissionStop:' in t:
 t=once(t,'  runDecision()',"  runDecision()\n  observe1368('commission-gate',()=>({week,studioId:b.studioId,reason:commissionStop,cash:b.account.cash,reserve:operatingReserve(b,h,week),greenlit,commissioned}))")
# One real decision call in the actual weekly business pass, after staff/research.
lines=t.splitlines(); hits=[i for i,line in enumerate(lines) if line.startswith('    decide(state,h,b,talent,week,greenlights')]
if len(hits)!=1: raise SystemExit('weekly decide call anchor mismatch')
i=hits[0]; lines.insert(i+1,"    observe1368('decision-end',()=>({week,studioId:b.studioId,cash:b.account.cash,reserve:operatingReserve(b,h,week),productionCount:b.productions.length,runCount:b.runs.length,activeOrdinals:b.activeScriptOrdinals,scriptWork:hotDevelopment(b).projects.filter(p=>p.status==='drafting'||p.status==='rewriting').map(p=>p.id),cutting:'costCutting' in b?(b as unknown as {costCutting:{since:number|null}}).costCutting.since:null}))")
t='\n'.join(lines)+'\n'; changed={rel:t}
rel='src/core/rivalResearch.ts'; r=files[rel]
anchor='    if (rivalFacilityDisposalEligibility(next, studioId, receipt.facilityId).eligible) {'
if 'export function disposeEligibleRivalFacilities(' in r:
 r="import { observe1368 } from '../../tests/1368-measurement-observer.js'\n"+r
 r=once(r,anchor,"    const observedEligibility = rivalFacilityDisposalEligibility(next, studioId, receipt.facilityId)\n    observe1368('disposal-candidate',()=>({week:next.market.tick,studioId,facilityId:receipt.facilityId,planId:receipt.planId,eligibility:observedEligibility,plan:next.physicalPlans.plans.find(p=>p.id===receipt.planId)}))\n    if (observedEligibility.eligible) {")
 changed[rel]=r
patch=''.join(''.join(difflib.unified_diff(files[k].splitlines(True),v.splitlines(True),fromfile='a/'+k,tofile='b/'+k)) for k,v in changed.items())
out.parent.mkdir(parents=True,exist_ok=True); out.write_text(patch)
Path(str(out)+'.json').write_text(json.dumps({'patchSha256':hashlib.sha256(patch.encode()).hexdigest(),'files':[{'path':k,'beforeSha256':hashlib.sha256(files[k].encode()).hexdigest(),'afterSha256':hashlib.sha256(v.encode()).hexdigest()} for k,v in changed.items()]},indent=2)+'\n')
