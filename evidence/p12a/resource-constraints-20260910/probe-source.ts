import {generateWorld,tick,makeSave,exportSave} from './src/core/index.ts';
import {initializeHollywood,RIVAL_MONEY_KINDS} from './src/core/hollywood.ts';
import {finishHollywoodWeek} from './src/core/hollywoodTick.ts';
import {stableStringify} from './src/core/save.ts';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const sha=(x:any)=>createHash('sha256').update(typeof x==='string'?x:stableStringify(x)).digest('hex');
const seed='r05-prf007',horizon=26;
function assert(ok:any,message:string){if(!ok)throw Error(message)}
const close=(a:number,b:number)=>Math.abs(a-b)<=Math.max(1e-6,Math.abs(a)*1e-10);
function makeBase(week:number){let s=initializeHollywood(generateWorld(seed),'fresh');while(s.market.tick<week)s=tick(s,{develop:true});makeSave(s);return s}
function runArm(kind:string){
 let s=makeBase(kind==='capacity'?5:3),b=s.hollywood.businesses[0],id=b.studioId,filmId=id+':film:0';
 const preFixtureSha256=sha(s),preFixtureWeek=s.market.tick,rng=s.rngState,initialProject=structuredClone(b.projects[0]);
 const originalDirector=s.hollywood.activeEmploymentOrdinals.map(i=>s.hollywood.employment[i]).find(e=>e.studioId===id&&s.talent.find(t=>t.id===e.terms.talentId)?.role==='director');
 const originalPerson=s.talent.find(t=>t.id===originalDirector.terms.talentId),originalPersonIndex=s.talent.findIndex(t=>t.id===originalPerson.id);
 let heldCash=0,originalCapacity=0;const restoreWeek=kind==='capacity'?10:8;const fixtureEdits:any[]=[];
 if(kind==='cash'){
  heldCash=b.account.cash;b.account.cash=0;b.account.periods.at(-1).closing=0;
  fixtureEdits.push({atWeek:3,kind:'temporary-external-hold',amount:heldCash,fields:['account.cash','account.periods[last].closing'],note:'Synthetic counterfactual availability hold; original amount restored once at week 8, with no production money source or receipt invented.'});
 }else if(kind==='capacity'){
  const facility=b.operations.facilities.find(f=>f.capability==='soundstage');originalCapacity=facility.capacity;facility.capacity=0;
  fixtureEdits.push({atWeek:5,kind:'temporary-unavailable-slot',facilityId:facility.id,from:originalCapacity,to:0,note:'Synthetic slot withdrawal before rehearsal acquisition. Facility identity, paid acquisition and weekly operating charge remain in place.'});
 }else if(kind==='talent'){
  const ordinal=s.hollywood.employment.indexOf(originalDirector);
  originalDirector.terms.endWeekExclusive=3;originalDirector.terms.termWeeks=3;
  s=finishHollywoodWeek(s);s.talent=s.talent.filter(t=>t.id!==originalPerson.id);s.freeAgents=s.freeAgents.filter(t=>t!==originalPerson.id);
  fixtureEdits.push({atWeek:3,kind:'required-director-withdrawal',talentId:originalPerson.id,employmentOrdinal:ordinal,fields:['original contract endWeekExclusive/termWeeks shortened to 3 in fixture','normal finishHollywoodWeek expiry producer','talent availability list removal'],note:'Synthetic expiry/absence counterfactual only; not an ordinary campaign action, not a new supported contract term. Production staff must pay and credit an actually available replacement. Original person returns to free-agent pool at week 8, without a free rehiring or forced substitution.'});
 }
 const trace:any[]=[];let restored=kind==='control';let heldStateRejected:any=null;
 if(kind!=='control'){try{makeSave(s);heldStateRejected={rejected:false}}catch(e){heldStateRejected={rejected:true,error:String(e.message)}}}
 const snapshot=()=>{b=s.hollywood.businesses.find(x=>x.studioId===id);const p=b.productions.find(x=>x.id===filmId),w=b.operations.workflows.find(x=>x.productionId===filmId),f=s.hollywood.films.find(x=>x.filmId===filmId);return {week:s.market.tick,cash:b.account.cash,projectStatus:b.development.projects[0].status,announcedWeek:b.projects[0].announcedWeek,productionStart:p?.startTick??null,remaining:p?.remainingTicks??null,phase:w?.phase??null,blocker:w?.blocker??null,director:p?.directorId??null,releaseWeek:f?.result?.releaseTick??null,stateSha256:sha(s)}};
 while(s.market.tick<=horizon){
  if(kind!=='control'&&s.market.tick===restoreWeek){
   b=s.hollywood.businesses.find(x=>x.studioId===id);
   if(kind==='cash'){b.account.cash+=heldCash;b.account.periods.at(-1).closing+=heldCash;fixtureEdits.push({atWeek:restoreWeek,kind:'restore-exact-held-amount',amount:heldCash,netFixtureCashChange:0})}
   if(kind==='capacity'){b.operations.facilities.find(f=>f.capability==='soundstage').capacity=originalCapacity;fixtureEdits.push({atWeek:restoreWeek,kind:'restore-original-slot',capacity:originalCapacity})}
   if(kind==='talent'){s.talent=[...s.talent.slice(0,originalPersonIndex),originalPerson,...s.talent.slice(originalPersonIndex)];s.freeAgents=[...new Set([...s.freeAgents,originalPerson.id])];fixtureEdits.push({atWeek:restoreWeek,kind:'restore-person-to-free-agent-pool',talentId:originalPerson.id,forcedEmployment:false})}
   restored=true;
  }
  trace.push(snapshot());
  if(kind==='cash'&&s.market.tick<=restoreWeek){assert(b.projects[0].announcedWeek===null,'Cash hold allowed impossible funded announcement');assert(!s.hollywood.films.some(f=>f.filmId===filmId),'Cash hold allowed impossible release')}
  if(kind==='capacity'&&s.market.tick>5&&s.market.tick<=restoreWeek){const p=b.productions.find(x=>x.id===filmId),w=b.operations.workflows.find(x=>x.productionId===filmId);assert(p.remainingTicks===7,'Capacity hold advanced past pre-production');assert(w.blocker?.kind==='facility-capacity'&&w.blocker.capability==='soundstage'&&w.blocker.targetPhase==='rehearsal','Capacity hold lacks actual capacity blocker');assert(!s.hollywood.films.some(f=>f.filmId===filmId),'Capacity hold released film')}
  if(s.market.tick===horizon)break;
  s=tick(s,{develop:true});assert(s.rngState===rng,'Rival pure-core run changed player RNG');
 }
 b=s.hollywood.businesses.find(x=>x.studioId===id);const f=s.hollywood.films.find(x=>x.filmId===filmId);assert(f?.provenance==='simulation/v1','Missing ordinary-tick release after restoration');
 const cost=b.projects[0],announcements=s.hollywood.receipts.filter(r=>r.kind==='filmAnnounced'&&r.productionId===filmId),release=s.hollywood.receipts.filter(r=>r.kind==='filmReleased'&&r.productionId===filmId),careers=s.hollywood.careerEvents.filter(e=>e.filmId===filmId);
 assert(announcements.length===1&&announcements[0].week===cost.announcedWeek,'Announcement/cost date identity');assert(release.length===1&&release[0].week===f.result.releaseTick,'Release receipt identity');assert(close(f.directCommitment,cost.development+cost.production+cost.marketing),'Direct commitment does not join exact costed project');
 assert(f.credits.length===6&&new Set(f.credits.map(c=>c.talentId)).size===6&&careers.length===6,'Six unique credits/career events required');
 for(const credit of f.credits){const employedAt=credit.role==='writer'?b.development.projects[0].commissionedWeek:cost.announcedWeek;assert(s.hollywood.employment.some(e=>e.studioId===id&&e.terms.talentId===credit.talentId&&e.terms.startWeek<=employedAt&&employedAt<(e.endedWeek??e.terms.endWeekExclusive)),'Credit has no actual employer at required gate');assert(careers.some(e=>e.talentId===credit.talentId&&e.role===credit.role&&e.releaseWeek===f.result.releaseTick),'Career does not join credit/release')}
 for(const key of ['development','production','marketing'])assert(close(b.account.periods.reduce((n,p)=>n+p.movements[key],0),-b.projects.reduce((n,p)=>n+p[key],0)),'Cost ledger does not reconcile '+key);
 assert(close(b.account.periods.reduce((n,p)=>n+p.movements.signing,0),-s.hollywood.employment.filter(e=>e.studioId===id).reduce((n,e)=>n+e.terms.signingBonus,0)),'Signing must be paid exactly for actual employment');
 const replacements=s.hollywood.employment.filter(e=>e.studioId===id&&e.reason==='replacement'&&s.talent.find(t=>t.id===e.terms.talentId)?.role==='director');
 if(kind==='talent'){assert(f.credits.find(c=>c.role==='director').talentId!==originalPerson.id,'Withdrawn director was impossibly credited');assert(replacements.some(e=>e.terms.talentId===f.credits.find(c=>c.role==='director').talentId&&e.terms.startWeek===3),'Replacement director lacks actual new employment');}
 let finalStrictSave:any;try{const exported=exportSave(makeSave(s));finalStrictSave={passed:true,sha256:sha(exported)}}catch(e){finalStrictSave={passed:false,error:String(e.message)}}
 assert(restored,'Missing scheduled restoration');
 return {kind,preFixtureWeek,preFixtureSha256,restoreWeek:kind==='control'?null:restoreWeek,fixtureEdits,heldStateRejected,trace,finalStrictSave,playerRngUnchanged:true,release:{filmId:f.filmId,conceptId:f.conceptId,title:f.title,announcementWeek:cost.announcedWeek,releaseWeek:f.result.releaseTick,resultSha256:sha(f.result),filmSha256:sha(f),directCommitment:f.directCommitment,costs:cost,credits:f.credits,careerEventCount:careers.length,criticScore:f.result.criticScore,boxOffice:f.result.boxOffice},replacementDirectors:replacements.map(e=>({talentId:e.terms.talentId,startWeek:e.terms.startWeek,signingBonus:e.terms.signingBonus,contractId:e.contractId})),originalDirectorId:originalPerson.id,joins:{announcement:true,release:true,costs:true,credits:true,employers:true,careers:true,signing:true},finalStateSha256:sha(s)};
}
export function run(directory:string){const report:any={operation:'OPS-P12A-LIVING-HOLLYWOOD-20260910-05',requirement:'PRF-007',kind:'Independent pure-core controlled resource intervention',seed,driver:"initializeHollywood(generateWorld(seed),'fresh'); tick(state,{develop:true})",horizon,startedAt:new Date().toISOString(),syntheticFixtureInterventions:true,productionSourceEdits:false,nativeProof:false,arms:[],errors:[]};
 for(const kind of ['control','cash','talent','capacity']){try{const first=runArm(kind),second=runArm(kind);assert(stableStringify(first)===stableStringify(second),'Repeated same-seed intervention diverged');report.arms.push({...first,exactRepeat:true});console.log(JSON.stringify({kind,release:first.release.releaseWeek,announcement:first.release.announcementWeek,director:first.release.credits.find(c=>c.role==='director').talentId,finalStrictSave:first.finalStrictSave,exactRepeat:true}));}catch(e){report.errors.push({kind,message:String(e.message),stack:String(e.stack).split('\n').slice(0,6)});console.log(JSON.stringify({kind,error:String(e.message)}));}}
 const control=report.arms.find(x=>x.kind==='control');for(const arm of report.arms.filter(x=>x.kind!=='control')){arm.changedFromControl={releaseDate:arm.release.releaseWeek!==control.release.releaseWeek,result:arm.release.resultSha256!==control.release.resultSha256};assert(arm.changedFromControl.releaseDate||arm.changedFromControl.result,'Unchanged date and result despite required-resource intervention')}
 report.completed=report.errors.length===0;report.finishedAt=new Date().toISOString();writeFileSync(directory+'/report.json',JSON.stringify(report,null,2));return report;
}
