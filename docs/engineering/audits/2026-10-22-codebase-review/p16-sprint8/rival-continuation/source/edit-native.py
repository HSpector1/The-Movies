from pathlib import Path
p=Path('/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/rival-continuation/source/postimages/src/core/hollywoodTick.ts');s=p.read_text()
s="import { buyerContinuedProductions, buyerOperationsForAllWork, buyerOperatedProductions, publishOperatedAdvance, recordContinuedWorkSteps, continuedCommittedReleaseIds } from './continuedWork.js'\n"+s
# Decision sees the existing single operating production inventory; own creator storage stays unchanged.
s=s.replace('  let greenlit=false,commissioned=false','  const operatedCount=()=>buyerOperatedProductions({...state,hollywood:h},b.studioId).length\n  let greenlit=false,commissioned=false')
s=s.replace('if(b.productions.length!==0)break','if(operatedCount()!==0)break').replace('const due=b.productions.length===0&&b.activeScriptOrdinals.length<2','const due=operatedCount()===0&&b.activeScriptOrdinals.length<2').replace('decisionRan:true,productionCount:b.productions.length,runCount:b.runs.length','decisionRan:true,productionCount:operatedCount(),runCount:b.runs.length')
s=s.replace('function frozenRivalMembers(source:HollywoodState|null,','function frozenRivalMembers(state:GameState,').replace('for(const b of source?.businesses??[]) {\n    if(closed.has(b.studioId))continue','for(const b of state.hollywood?.businesses??[]) {\n    if(closed.has(b.studioId))continue').replace('const ids=b.productions.filter(p=>p.remainingTicks===1).map(p=>p.id).sort()','const ids=buyerOperatedProductions(state,b.studioId).filter(p=>p.remainingTicks===1).map(p=>p.id).sort()')
s=s.replace('frozenRivalMembers(source,factorById,terminalWeekOf(state))','frozenRivalMembers(state,factorById,terminalWeekOf(state))')
a=s.index('  for(const b of h.businesses) {',s.index('export function advanceHollywoodWeek'))
b=s.index('    if(closed.has(b.studioId))',a)
s=s[:a]+'''  const working=():GameState=>({...state,hollywood:h,rights,technology,physicalPlans,talent})
  // Validate input bodies before any buyer can advance/release their source. Actual
  // run service waits until every native policy/release has completed below.
  for(const sourceBusiness of source.businesses)if(absorbed.has(sourceBusiness.studioId)) {
    const transaction=state.rights.absorptions.find(a=>a.targetId===sourceBusiness.studioId)!
    validateAbsorbedProductionStops(state,sourceBusiness,transaction)
    validateAbsorbedScripts(state,sourceBusiness,transaction)
  }
  for(const b of h.businesses) {
    if(absorbed.has(b.studioId))continue
'''+s[b:]
s=s.replace('technology=considerRivalSoundPurchase({...state,technology,hollywood:h},h,b)','technology=considerRivalSoundPurchase(working(),h,{...b,operations:buyerOperationsForAllWork(working(),b.studioId)})')
s=s.replace('talent=staff(state,h,b,talent,week,','talent=staff(working(),h,b,talent,week,').replace('    decide(state,h,b,talent,week,greenlights,cashFacts)','    decide(working(),h,b,talent,week,greenlights,cashFacts)')
a=s.index('    operateStage(b)',s.index('export function advanceHollywoodWeek'))
b=s.index('    const excess=Math.max',a)
s=s[:a]+'''    // Work is allocated once against this actual rival registry. Foreign paid
    // productions stay in their creator bodies; only their buyer workflows join.
    const beforeWork:GameState={...working(),hollywood:{...h,businesses:h.businesses.map(row=>({...row}))}}
    const operated=buyerOperatedProductions(beforeWork,b.studioId)
    const operations=buyerOperationsForAllWork(beforeWork,b.studioId)
    if(buyerContinuedProductions(beforeWork,b.studioId).length>0 && operated.length>1)throw new Error('continued work: rival one-production operation violated')
    const stageView={...b,productions:operated,operations}
    operateStage(stageView)
    for(const p of operated) {
      const transaction=rights.absorptions.find(a=>a.buyerId===b.studioId && a.continuedProductions.some(row=>row.productionId===p.id))
      const authority=transaction?h.businesses.find(row=>row.studioId===transaction.targetId)!:b
      if(releaseCommitmentRefusal({productions:operated,operations:stageView.operations,releaseAuthority:authority.releaseAuthority,concepts:[]},p.id)===null)
        authority.releaseAuthority=withReleaseCommitment(authority.releaseAuthority,p.id,week)
    }
    technology=selectRivalSoundProduction(technology,b)
    const productionTechnology=createProductionTechnologyPolicy({...working(),technology},b.studioId)
    const committed=new Set([...committedReleaseIds(b.releaseAuthority),...continuedCommittedReleaseIds(working(),b.studioId)])
    const advanced=advanceManagedProductions(stageView.operations,operated,week,committed,new Set([...scriptOccupiedFacilitySlots(hotDevelopment(b)),...rivalInstallationSlots(technology,b)]),undefined,undefined,productionTechnology.policy)
    technology=productionTechnology.technology()
    for(const production of advanced.firstTakes)firstTakes.push({studioId:b.studioId,production})
    const releasing=advanced.productions.filter(p=>p.remainingTicks===0).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)
    const ids=new Set(releasing.map(p=>p.id))
    if(ids.size!==advanced.admittedReleaseIds.length||advanced.admittedReleaseIds.some(id=>!ids.has(id)))throw new Error('Industry release admission mismatch')
    const members=frozen?.get(b.studioId)??[]
    if(frozen!==null&&(members.length!==releasing.length||releasing.some((p,i)=>p.id!==members[i])))throw new Error(`shared market: ${b.studioId} releases [${releasing.map(p=>p.id).join(', ')}] but its frozen batch members are [${members.join(', ')}]`)
    const published=publishOperatedAdvance(beforeWork,advanced.productions,advanced.operations,b.studioId)
    rights=recordContinuedWorkSteps(beforeWork,published,week,b.studioId).rights
    // Adopt only the split native/source work fields into the existing owned
    // business objects, preserving the loop's actual object identities.
    for(const update of published.hollywood!.businesses) {
      const actual=h.businesses.find(row=>row.studioId===update.studioId)!
      actual.operations=update.operations;actual.productions=update.productions
    }
    const startStanding=b.standing
    for(const p of releasing) {
      const transaction=rights.absorptions.find(a=>a.buyerId===b.studioId && a.continuedProductions.some(row=>row.productionId===p.id))
      const creator=transaction?h.businesses.find(row=>row.studioId===transaction.targetId)!:b
      const released=publishCreatorRelease(working(),h,creator,p,talent,week,startStanding,factorById)
      const before=b.standing
      b.standing=updateStanding(before,released.filmResult,p.forecastSnapshot,released.ctx)
      if(transaction) {
        const observation={productionId:p.id,week,titleEventId:null,standingBefore:cloneStanding(before),standingAfter:cloneStanding(b.standing),standingContext:structuredClone(released.ctx),
          benchmarks:{expectedOpening:p.forecastSnapshot.expectedOpening,expectedTotal:p.forecastSnapshot.expectedTotal,expectedCriticScore:p.forecastSnapshot.expectedCriticScore}}
        rights={...rights,absorptions:rights.absorptions.map(a=>a.id!==transaction.id?a:{...a,workReleases:[...a.workReleases,observation],
          runs:[...a.runs,{productionId:p.id,beneficiaryFromWeek:week,startingWeekIndex:0,grossPaidBeforeClose:0,revenuePaidBeforeClose:0}],buyerWorkflows:a.buyerWorkflows.filter(w=>w.productionId!==p.id)})}
        // One creator event; the buyer's actual Standing proof lives in the
        // joined workRelease, never a fabricated player history/second film row.
        appendReceipt(h,{week,studioId:creator.studioId,kind:'filmReleased',productionId:p.id,conceptId:p.conceptId,before:cloneStanding(creator.standing),after:cloneStanding(creator.standing)})
        creator.productions=creator.productions.filter(row=>row.id!==p.id)
        creator.releaseAuthority=pruneReleasedCommitments(creator.releaseAuthority,new Set([p.id]))
      } else appendReceipt(h,{week,studioId:b.studioId,kind:'filmReleased',productionId:p.id,conceptId:p.conceptId,before,after:b.standing})
      growth.push(released.growth)
    }
    b.productions=b.productions.filter(p=>p.remainingTicks>0)
    b.releaseAuthority=pruneReleasedCommitments(b.releaseAuthority,ids)
    payRuns(h,b,week)
'''+s[b:]
a='  // Assigned income, like native payRuns, is unavailable to this week\'s policy.'
assert s.count(a)==1
s=s.replace(a,'''  // Every source (including one that precedes its buyer in array order) now
  // sees the fresh actual workRelease and new week-zero run. Service exactly
  // once, after all policies; recipient cash is flushed only after this pass.
  for(const sourceBusiness of h.businesses)if(absorbed.has(sourceBusiness.studioId)) {
    const transaction=rights.absorptions.find(a=>a.targetId===sourceBusiness.studioId)!
    const runAdvance=advanceAbsorbedRuns(working(),h,sourceBusiness,transaction,week)
    rights=runAdvance.rights;absorbedRunRevenue.push(...runAdvance.ledger);rivalRunRevenue.push(...runAdvance.rivalRevenue)
  }
'''+a)
p.write_text(s)
print('Saved actual native pooled advance/reception and delayed exact-once source servicing in hollywoodTick.ts (7 owners edited).')
