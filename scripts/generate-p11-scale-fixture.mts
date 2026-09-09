/** Public scale diagnostic: real owner actions and ticks; no crafted financial rows. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyActions, renewalWindowOpen, scriptProjectsReadModel, tick, validateSave } from '../src/core/index.ts'
import { repairSetRefusal } from '../src/core/sets.ts'
import type { Action } from '../src/core/types.ts'
import { financeHistory } from '../src/core/financeReport.ts'
import { financeProjection } from '../bridge/finance.ts'
import { peopleProjection } from '../bridge/people.ts'
import { castingDraftToEngine, castingProjection } from '../bridge/casting.ts'
import type { BridgeCastingDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { BridgeSession } from '../bridge/session.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { exportSaveJson, productionDecision, runProductionCommand } from '../ui/src/engine/adapter.ts'

const root=dirname(dirname(fileURLToPath(import.meta.url))),output=join(root,'ui/e2e/p11-core-v3')
const source='ui/e2e/p11-core-v3/s6-p11-positive-long-payroll.checkpoint.json'
const sha=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex')
const raw=readFileSync(join(root,source),'utf8'),sourceHash=sha(raw)
const manifestPath=join(output,'manifest.json'),manifest=JSON.parse(readFileSync(manifestPath,'utf8'))
assert.equal(sourceHash,manifest.fixtures.find((f:{id:string})=>f.id==='s6-p11-positive-long-payroll').files.checkpointSha256)
assert.equal(manifest.projectionVersion,PROJECTION_VERSION)
let state=BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(raw).hydrated).gameState
const started=performance.now(),limitMilliseconds=120_000,initialWeek=state.market.tick
const actions: unknown[]=[]
function bounded(){assert(performance.now()-started<limitMilliseconds,'Actual scale trajectory exceeded120seconds; no fixture exported')}
function act(action:Action){bounded();state=applyActions(state,[action]);actions.push({kind:'coreAction',week:state.market.tick,action})}
function advance(){bounded();state=tick(state);actions.push({kind:'tick',week:state.market.tick})}
function keepContracts(){
  for(const c of [...state.contracts])if(renewalWindowOpen(c,state.market.tick))act({kind:'renewContract',talentId:c.talentId,termWeeks:208})
}
function hireWriterIfNeeded(){
  if(scriptProjectsReadModel(state).commission.writers.some(w=>w.available))return
  const writer=castingProjection(state).board!.hiringCandidates.find(p=>p.role==='writer')
  assert(writer,'No public writer available for the next real screenplay')
  act({kind:'signContract',talentId:writer.talentId,termWeeks:208})
}
function greenlightDraft(projectId:string):BridgeCastingDraftPayload {
  const p=castingProjection(state).board!.projects.find(p=>p.projectId===projectId)!,used=new Set<string>()
  const choose=(pool:readonly {talentId:string;available:boolean}[])=>{
    const person=pool.find(p=>p.available&&!used.has(p.talentId));assert(person,'No distinct public role candidate');used.add(person.talentId);return person.talentId
  }
  const directorId=choose(p.directorCandidates),craftLeadId=choose(p.craftCandidates)
  return {kind:'greenlightPackage',projectId,slateLead:null,slateAntagonist:null,slateSupport:null,
    directorId,craftLeadId,castLead:choose(p.leadCandidates),castAntagonist:choose(p.antagonistCandidates),castSupport:choose(p.supportCandidates),
    budgetNegative:p.negativeOptions[0]!.amount,budgetMarketing:p.marketingOptions[0]!.amount,signTalentId:null,signTermWeeks:null}
}
while(state.studio.releasedFilms.length<21){
  keepContracts()
  for(const set of [...state.sets])if(repairSetRefusal(state,set.id)===null){act({kind:'repairSet',setId:set.id});advance();advance()}
  let project=state.scriptDevelopment.projects.find(p=>p.status==='ready')
  if(!project){
    hireWriterIfNeeded()
    const choices=scriptProjectsReadModel(state).commission,concept=choices.concepts[0],writer=choices.writers.find(w=>w.available)
    assert(concept&&writer,'No unclaimed public concept/current writer for real repeated journey')
    act({kind:'commissionScript',project:{conceptId:concept.id,writerId:writer.id,
      shape:{opening:'mysteryHook',midpoint:'revelation',ending:'bittersweet'},promise:{genre:concept.genre,intendedSegments:['adult'],
        ranges:{intimacy:[-0.5,0.5],tonalWeight:[-0.5,0.5],kineticEnergy:[-0.5,0.5]}}}})
    const id=state.scriptDevelopment.projects.at(-1)!.id
    advance();act({kind:'acceptScript',projectId:id});project=state.scriptDevelopment.projects.find(p=>p.id===id)!
  }
  const projectId=project.id
  let session=state.castingSessions.sessions.find(s=>s.projectId===projectId)
  if(!session){
    const p=castingProjection(state).board!.projects.find(p=>p.projectId===projectId)!
    const actors=p.leadCandidates.filter(p=>p.available).slice(0,3).map(p=>p.talentId);assert.equal(actors.length,3)
    act({kind:'startCastingSession',session:{projectId,slate:{lead:[actors[0]!,actors[1]!],antagonist:[actors[0]!,actors[2]!],support:[actors[1]!,actors[2]!]}}})
    advance();session=state.castingSessions.sessions.find(s=>s.projectId===projectId)!
  }
  if(session.status==='review')act({kind:'acknowledgeCastingSession',sessionId:session.id})
  const draft=greenlightDraft(projectId),conversion=castingDraftToEngine(state,draft);assert(conversion.ok)
  const next=conversion.apply(state);assert(next.ok);state=next.next;actions.push({kind:'bridgeDraft',week:state.market.tick,draft})
  const id=state.studio.activeProductions.at(-1)!.id;assert(id,'Greenlight queued unexpectedly in sequential fixture')
  for(let n=0;n<40&&state.studio.activeProductions.find(p=>p.id===id)!.remainingTicks>1;n++){
    keepContracts()
    const decision=productionDecision(state)
    if(decision?.command){
      const result=runProductionCommand(state,decision.command);assert(result.ok);state=result.next
      actions.push({kind:'productionCommand',week:state.market.tick,command:decision.command})
    }else advance()
  }
  assert.equal(state.studio.activeProductions.find(p=>p.id===id)!.remainingTicks,1,'Actual repeat picture stalled; no fabricated phase')
  act({kind:'commitPictureToRelease',productionId:id});advance()
  assert(state.studio.releasedFilms.some(f=>f.productionId===id))
  console.log(JSON.stringify({kind:'p11-actual-scale-progress',films:state.studio.releasedFilms.length,week:state.market.tick,elapsedMilliseconds:performance.now()-started}))
}
const trajectoryMilliseconds=performance.now()-started,portfolioWeek=state.market.tick
const periodStart=state
//6240 actual engine advances; calendar years/eras are not manufactured by this count.
for(let n=0;n<6240;n++){bounded();state=tick(state);if((n+1)%1040===0)console.log(JSON.stringify({kind:'p11-actual-scale-weeks',advances:n+1,elapsedMilliseconds:performance.now()-started}))}
actions.push({kind:'tickSequence',count:6240,fromWeek:portfolioWeek,toWeek:state.market.tick,cashBefore:periodStart.studio.cash,cashAfter:state.studio.cash})
const save=exportSaveJson(state);assert.equal(validateSave(JSON.parse(save)).saveVersion,18)
const before=sha(save),historyTimes:number[]=[],financeTimes:number[]=[]
for(let n=0;n<5;n++){const t=performance.now();financeHistory(state);historyTimes.push(performance.now()-t)}
for(let n=0;n<5;n++){const t=performance.now();financeProjection(state,peopleProjection(state));financeTimes.push(performance.now()-t)}
const nativeSession=new BridgeSession(state,'p11-core-s16-long-portfolio'),snapshotStart=performance.now(),snapshot=nativeSession.snapshot()
const snapshotMilliseconds=performance.now()-snapshotStart
parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse,snapshot)
const finance=snapshot.snapshot.finance,checkpoint=encodeBridgeRuntimeCheckpoint(nativeSession.exportRuntimeCheckpoint())
decodeBridgeRuntimeCheckpoint(checkpoint)
assert.equal(sha(exportSaveJson(state)),before)
assert(finance.finance.portfolio.rows.length>20)
assert.equal(new Set(finance.finance.portfolio.rows.map(r=>r.id)).size,finance.finance.portfolio.rows.length)
const id='s16-p11-long-portfolio',checkpointName=id+'.checkpoint.json',saveName=id+'.save.json'
writeFileSync(join(output,checkpointName),checkpoint);writeFileSync(join(output,saveName),save)
const financeName='p11-long-portfolio-finance-projection.json',financeJson=JSON.stringify(finance,null,2)+'\n'
writeFileSync(join(output,financeName),financeJson)
const measurement={kind:'p11-actual-long-portfolio-measurement',source:{path:source,sha256:sourceHash},
  classification:'Diagnostic from pinned public state plus actual owner actions/ticks; not native-input or private-profile evidence.6240 advances do not establish calendar-year or era boundaries.',
  initialWeek,portfolioWeek,finalWeek:state.market.tick,additionalLongHistoryAdvances:6240,realReleasedFilms:state.studio.releasedFilms.length,
  portfolioRows:finance.finance.portfolio.rows.length,ledgerEntries:state.ledger.length,saveBytes:Buffer.byteLength(save),
  checkpointBytes:Buffer.byteLength(checkpoint),fullSnapshotBytes:Buffer.byteLength(JSON.stringify(snapshot)),financeBytes:Buffer.byteLength(JSON.stringify(finance)),
  historyQueryMilliseconds:historyTimes,fullFinanceQueryMilliseconds:financeTimes,snapshotMilliseconds,trajectoryMilliseconds,totalMilliseconds:performance.now()-started,
  schemaId:SCHEMA_ID,projectionVersion:PROJECTION_VERSION,historyPointCounts:finance.finance.history.windows.map(w=>w.points.length),
  verification:{strictCurrentWire:true,validatedSaveV18:true,currentCheckpointDecoded:true,observationPreservesSaveAndRng:true,craftedMoneyOrFilmRows:false}}
const measurementName='p11-long-portfolio-measurement.json',measurementJson=JSON.stringify(measurement,null,2)+'\n';writeFileSync(join(output,measurementName),measurementJson)
const row={id,family:'ready-real-long-portfolio',purpose:'More than20 real film/project rows plus6240 actual engine advances; native pagination/render and recorded-history query/size diagnostic.',
  envelopeClassification:measurement.classification,origin:{kind:'accepted-public-checkpoint',path:source,sha256:sourceHash},actions,
  files:{checkpoint:checkpointName,checkpointSha256:sha(checkpoint),save:saveName,saveSha256:sha(save)},
  sessionId:nativeSession.sessionId,stateRevision:0,finance:{week:state.market.tick,cash:state.studio.cash,weeklyOperatingCost:finance.finance.weeklyOperatingCost,
    netWeeklyCashflow:finance.finance.netWeeklyCashflow,runwayState:finance.finance.runwayState,runwayLabel:finance.finance.runwayLabel,runwayWeeks:finance.finance.runwayWeeks,employees:finance.finance.employees.length,
    facilities:finance.finance.facilities.map(f=>({placementId:f.placementId,buildingId:f.buildingId,name:f.name,status:f.status,completesWeek:f.completesWeek})),
    films:finance.finance.films.map(f=>({productionId:f.productionId,title:f.title,status:f.status})),portfolioRows:finance.finance.portfolio.rows.length,
    firstCompleteWeek:finance.finance.firstCompleteWeek,coverageNotice:finance.finance.coverageNotice},verification:measurement.verification}
manifest.fixtures=manifest.fixtures.filter((f:{id:string})=>f.id!==id).concat(row);manifest.fixtureCount=manifest.fixtures.length
manifest.supplementalGenerators=[{path:'scripts/generate-p11-scale-fixture.mts',sha256:sha(readFileSync(fileURLToPath(import.meta.url))),
  measurement:measurementName,measurementSha256:sha(measurementJson),financeComponent:financeName,financeComponentSha256:sha(financeJson)}]
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n')
assert.equal(sha(readFileSync(join(root,source))),sourceHash)
console.log(JSON.stringify(measurement,null,2))
