from pathlib import Path
D=Path('/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/rival-continuation/source/postimages/src/core')
p=D/'marketIntegration.ts';s=p.read_text();s="import { buyerOperatedProductions } from './continuedWork.js'\n"+s
s=s.replace("flatMap((business) => business.productions\n    .filter((production) => production.remainingTicks === 1)","flatMap((business) => buyerOperatedProductions(state,business.studioId)\n    .filter((production) => production.remainingTicks === 1)")
p.write_text(s)
p=D/'save.ts';s=p.read_text();s=s.replace('import { assertNoDoubleBookedResourceSlots } from "./occupancy.js";','import { assertNoDoubleBookedResourceSlots } from "./occupancy.js";\nimport { rivalInstallationSlots } from "./technologyRival.js";')
a=s.index('  const operations = buyerOperationsForAllWork(state);',s.index('function validateContinuedWorkShapes'))
b=s.index('\n}\n',a)
s=s[:a]+'''  const buyers=new Set(rows.filter(a=>a.continuedProductions.length>0 || a.buyerWorkflows.length>0).map(a=>a.buyerId));
  for(const buyer of buyers) {
    const player=buyer===state.hollywood?.playerStudioId;
    const business=player?undefined:state.hollywood?.businesses.find(b=>b.studioId===buyer);
    if(!player && !business)throw new Error('validateSaveV49: continued work actual buyer is missing');
    const operations=buyerOperationsForAllWork(state,buyer),productions=buyerOperatedProductions(state,buyer);
    checkOperationsContext({operations:{...operations,workflows:v25StrippedWorkflows({...operations},'continuedWork.buyerOperations',true)},
      activeProductions:productions,engaged:player?state.economyEngagedEver:true,founding:player?state.founding:null},
      'validateSaveV49.combinedBuyerWork','rights-p16');
    if(player) {
      assertStudioOperationsInvariants(operations,productions,{facilityPolicy:'configured',
        offlineFacilityIds:new Set(operations.facilities.filter(f=>facilityOffline(state,f.id)).map(f=>f.id)),
        sharedOccupancy:{placement:state.placement,technology:state.technology,
          scriptDevelopment:buyerScriptDevelopment(state),castingSessions:state.castingSessions,construction:state.construction,sets:state.sets}});
    } else {
      assertStudioOperationsInvariants(operations,productions,{facilityPolicy:'configured',sharedOccupancy:{scriptDevelopment:business!.development}});
      const installing=new Set(rivalInstallationSlots(state.technology,business!));
      for(const workflow of operations.workflows)for(const held of workflow.reservations)
        if(installing.has(`${held.facilityId}:${held.slot}`))throw new Error('validateSaveV49: rival continued work collides with actual installation');
      if(productions.length>1)throw new Error('validateSaveV49: rival continued work violates native one-production operation');
    }
  }'''+s[b:]
p.write_text(s)
print('Actual external edits now include save.ts and marketIntegration.ts (6 owners total).')
