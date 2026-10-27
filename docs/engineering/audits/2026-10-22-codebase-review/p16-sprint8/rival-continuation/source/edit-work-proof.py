from pathlib import Path
p=Path('/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/rival-continuation/source/postimages/src/core/continuedWorkValidation.ts');s=p.read_text()
a=s.index('  if(a.buyerId!==h.playerStudioId){');b=s.index('\n  const links =',a)
s=s[:a]+'''  const player=a.buyerId===h.playerStudioId
  const buyer=player?undefined:h.businesses.find(b=>b.studioId===a.buyerId)
  if(!player && !buyer)fail('actual rival operator missing')
  if(!player && (a.continuedProductions.some(row=>row.originalProduction.remainingTicks>4) || a.workCancellations.length!==0))fail('rival earlier/manual work producer is not admitted')
  const buyerOperations=player?state.operations:buyer!.operations
'''+s[b:]
s=s.replace("    || state.operations.workflows.some(w => ids.has(w.productionId))", "    || h.businesses.some(b=>b!==business && b.operations.workflows.some(w=>ids.has(w.productionId)))\n    || state.operations.workflows.some(w => ids.has(w.productionId))")
s=s.replace("!state.operations.facilities.some(f => f.id === row.buyerPostFacilityId && f.capability === 'post')", "!buyerOperations.facilities.some(f => f.id === row.buyerPostFacilityId && f.capability === 'post')")
a='''    const steps = a.workSteps.filter(s => s.productionId === original.id)
    if (steps.length !== end - a.week)'''
b='''    const steps = a.workSteps.filter(s => s.productionId === original.id)
    if(!player)for(const own of buyer!.projects) {
      if(own.productionId===null || own.announcedWeek===null)continue
      const released=h.films.find(f=>f.provenance==='simulation/v1' && f.studioId===a.buyerId && f.filmId===own.productionId)
      const body=buyer!.productions.find(p=>p.id===own.productionId)
      const until=released?.provenance==='simulation/v1'?released.result.releaseTick+1:body?(closure?.closureWeek??state.market.tick+1):Infinity
      if(own.announcedWeek<Math.max(a.week+1,end) && until>a.week)fail('rival native production overlaps actual continued operation')
    }
    if (steps.length !== end - a.week)'''
assert s.count(a)==1;s=s.replace(a,b)
a="      if (wrapStep ? wraps.length !== 1 || wraps[0]!.week !== wrapStep.week\n        : wraps.length !== 0) fail('buyer native wrap differs from actual shooting completion')"
b="      if(player ? (wrapStep ? wraps.length!==1 || wraps[0]!.week!==wrapStep.week : wraps.length!==0) : wraps.length!==0)fail('buyer native wrap differs from actual shooting completion')"
assert s.count(a)==1;s=s.replace(a,b)
a='''    } else {
      if (commitEvents.length > 1) fail('buyer release commitment duplicated')'''
b='''    } else if(!player) {
      // The native rival commits and publishes in the same input pass. Its
      // canonical 1→0 step, actual creator film and releaseCommitmentId retain
      // that decision without minting a player-only action/history row.
      if(commitEvents.length!==0)fail('rival commitment polluted player events')
      const committed=steps.find(step=>step.beforeRemaining===1 && step.afterRemaining===0)
      if(committed) {
        if(!release || release.week!==committed.week || film?.provenance!=='simulation/v1' || film.releaseCommitmentId!==`release-commitment-${original.id}`)fail('rival automatic commitment lacks actual release')
        committedAt=committed.week
      }
    } else {
      if (commitEvents.length > 1) fail('buyer release commitment duplicated')'''
assert s.count(a)==1;s=s.replace(a,b)
a="    if (history.length !== (changed ? 1 : 0)) fail('buyer Standing receipt missing, duplicated or invented')\n    if (changed) {"
b="    if (history.length !== (player && changed ? 1 : 0)) fail('buyer Standing receipt missing, duplicated or invented')\n    if (player && changed) {"
assert s.count(a)==1;s=s.replace(a,b)
p.write_text(s)
print('Saved actual rival work/counter/native commitment/Standing source proof (8 owners edited).')
