from pathlib import Path
p=Path('/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/rival-continuation/source/postimages/src/core/hollywoodValidation.ts');s=p.read_text()
a="  const absorptionEnd = (studioId: string, contractId: string, week: number, reason: string) => {"
b="""  const continuedForBuyer=(studioId:string)=>{
    const rows=era.rights?[...(era.absorptions?.values()??[])].filter(a=>a.buyerId===studioId):[]
    for(const a of rows)requireFact([a.continuedProductions,a.buyerWorkflows,a.workReleases,a.workCancellations].every(Array.isArray)
      && [...a.continuedProductions,...a.buyerWorkflows,...a.workReleases,...a.workCancellations].every(row=>typeof row==='object' && row!==null),'continued operator dispositions must be arrays of records')
    return rows
  }
"""+a
assert s.count(a)==1;s=s.replace(a,b)
s=s.replace("const claimsLiveWork=(p:Production)=>closedWeekOf(b.studioId)===null&&(absorbed===undefined||\n      (absorbed.continuedProductions.some", "const claimsLiveWork=(p:Production)=>closedWeekOf(b.studioId)===null&&(absorbed===undefined||\n      (closedWeekOf(absorbed.buyerId)===null && absorbed.continuedProductions.some")
a="    assertStudioOperationsInvariants(b.operations,sourceOperatedProductions,{facilityPolicy:'configured'})"
if a not in s:
 print('CONTEXT',s[s.index('    const sourceOperatedProductions'):s.index('    const ownedConcepts')]);raise Exception('expected operations block')
b="""    const assignments=continuedForBuyer(b.studioId)
    const foreign=assignments.flatMap(a=>{
      const source=h.businesses.find(row=>row.studioId===a.targetId)
      requireFact(source,'continued operator source business missing')
      return source.productions.filter(p=>a.continuedProductions.some(row=>row.productionId===p.id) && !a.workCancellations.some(row=>row.productionId===p.id))
    })
    const operatingProductions=[...sourceOperatedProductions,...foreign]
    const operatingOperations={...b.operations,workflows:[...b.operations.workflows,...assignments.flatMap(a=>a.buyerWorkflows)]}
    if(foreign.length>0) {
      requireFact(operatingProductions.length===1,'rival continued work violates native one-production operation')
      requireFact(!rivalCostCutting || b.costCutting.since===null,'cost cutting has actual continued production')
    }
    assertStudioOperationsInvariants(operatingOperations,operatingProductions,{facilityPolicy:'configured'})"""
s=s.replace(a,b)
a="  const playerFilms=new Map("
idx=s.find(a)
if idx<0:raise Exception('playerFilms anchor missing')
# This location follows native receipt and chart structural validation. Only new
# current49 receiving histories acquire the additional continuity proof.
s=s[:idx]+'''  for(const b of h.businesses) {
    const assignments=continuedForBuyer(b.studioId)
    const releases=assignments.flatMap(a=>a.workReleases)
    if(releases.length===0)continue
    const end=Math.min(state.market.tick,closedWeekOf(b.studioId)??Infinity,absorptionOf(b.studioId)?.week??Infinity)
    const observations=[
      ...h.receipts.flatMap(r=>r.kind==='filmReleased' && r.studioId===b.studioId && r.week<end
        ?[{week:r.week,productionId:r.productionId,before:r.before,after:r.after}]:[]),
      ...releases.filter(r=>r.week<end).map(r=>({week:r.week,productionId:r.productionId,before:r.standingBefore,after:r.standingAfter})),
    ].sort((left,right)=>left.week-right.week || (left.productionId<right.productionId?-1:left.productionId>right.productionId?1:0))
    requireFact(observations.length>0,'continued rival Standing has no actual observation')
    for(const row of observations){integer(row.week);standing(row.before);standing(row.after)}
    // Native prehistory is observational, especially across migration. Anchor at
    // the earliest retained actual release observation, never invent fresh-entry
    // Standing. If the first observation is itself a workRelease, its initial
    // before snapshot is producer-attested, not independent pre-acquisition proof.
    let replay={...observations[0]!.before},index=0
    for(let week=observations[0]!.week;week<end;week++) {
      while(index<observations.length && observations[index]!.week===week) {
        const row=observations[index++]!
        requireFact(Object.keys(replay).every(key=>close(replay[key as keyof typeof replay],row.before[key as keyof typeof replay])),'continued rival Standing observation breaks native release order')
        replay={...row.after}
      }
      const excess=Math.max(0,replay.audienceAwareness-TUNING.AWARENESS_DRIFT_ANCHOR)
      if(excess>0)replay={...replay,audienceAwareness:Math.max(0,Math.min(100,replay.audienceAwareness-TUNING.AWARENESS_DRIFT_RATE*excess))}
    }
    requireFact(index===observations.length && Object.keys(replay).every(key=>close(replay[key as keyof typeof replay],b.standing[key as keyof typeof replay])),'continued rival Standing differs from actual observations and native drift')
  }
'''+s[idx:]
p.write_text(s)
print('Saved actual operator capacity and observation-anchored native Standing continuity (9 owners edited).')
