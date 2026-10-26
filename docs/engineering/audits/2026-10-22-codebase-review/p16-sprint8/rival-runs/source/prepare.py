from pathlib import Path
import hashlib,json,difflib
X=Path('/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt')
D=Path('/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/rival-runs/source')
names=['absorbedRuns.ts','hollywoodTick.ts','hollywoodValidation.ts','acquisition.ts','studioClosure.ts']
original={n:(X/'src/core'/n).read_text() for n in names}
s=dict(original)
def replace(n,a,b):
 assert s[n].count(a)==1,(n,a[:100],s[n].count(a))
 s[n]=s[n].replace(a,b)
replace('absorbedRuns.ts','/** Real ordinary input-week servicing.', '''/** Canonical foreign films whose future stream this buyer actually acquired before `week`.
 * Derive the set from original source releases and the close boundary, never from a supplied
 * handoff/receipt list. The full acquisition validator still proves every close and handoff.
 * Historical readers call this only with their current49 original title-state context. */
export function acquiredActiveRunFilms(state:GameState,buyerId:string,week:number):LiveIndustryFilm[] {
  if(!state.hollywood || !Array.isArray(state.rights?.absorptions))fail('missing acquired run ownership context')
  const result:LiveIndustryFilm[]=[]
  for(const a of state.rights.absorptions) {
    if(!a || typeof a.buyerId!=='string' || typeof a.targetId!=='string' || !Number.isSafeInteger(a.week))fail('malformed acquired run ownership context')
    if(a.buyerId!==buyerId || a.week>week)continue
    for(const film of state.hollywood.films) {
      if(film.provenance!=='simulation/v1' || film.studioId!==a.targetId)continue
      const run=canonical(film),release=film.result.releaseTick
      if(release<=a.week && a.week<release+run.totalWeeks && week<release+run.totalWeeks)result.push(film)
    }
  }
  return result
}

type RivalRunRevenue={buyerId:string;week:number;amount:number;receiptId:string}

/** Real ordinary input-week servicing.''')
replace('absorbedRuns.ts',":{rights:GameState['rights'];ledger:LedgerEntry[]} {",":{rights:GameState['rights'];ledger:LedgerEntry[];rivalRevenue:RivalRunRevenue[]} {")
replace('absorbedRuns.ts',"  if(a.buyerId!==h.playerStudioId){\n    // A runless terminal target still visits the ordinary absorbed-business branch. Prove\n    // the absent run owner against authentic films; never credit a rival receipt to the player.\n    validateAbsorbedRuns({...state,hollywood:h},b,a)\n    return {rights:state.rights,ledger:[]}\n  }", "  if(a.buyerId!==h.playerStudioId && !h.businesses.some(buyer=>buyer.studioId===a.buyerId))fail('missing actual rival beneficiary')")
replace('absorbedRuns.ts','  const ledger:LedgerEntry[]=[];const runs:typeof b.runs=[];const ordinals:number[]=[]','  const ledger:LedgerEntry[]=[];const rivalRevenue:RivalRunRevenue[]=[];const runs:typeof b.runs=[];const ordinals:number[]=[]')
replace('absorbedRuns.ts',"    if(revenue>0)ledger.push({week,kind:'absorbedRunRevenue',amount:revenue,note:receipt.id})", "    if(revenue>0) {\n      if(a.buyerId===h.playerStudioId)ledger.push({week,kind:'absorbedRunRevenue',amount:revenue,note:receipt.id})\n      else rivalRevenue.push({buyerId:a.buyerId,week,amount:revenue,receiptId:receipt.id})\n    }")
replace('absorbedRuns.ts','  return {rights,ledger}','  return {rights,ledger,rivalRevenue}')
replace('absorbedRuns.ts',"  }\n}\n\n/** Independent canonical paid-prefix", '''  }
}

/** Called only after all absorption records and installments have their complete joined proof. */
export function validateRivalAbsorbedRunMoney(state:GameState):void {
  const h=state.hollywood
  if(!h)return
  // Real rival books aggregate theatrical income by their existing account periods. Prove
  // both overlapping native income and assigned installments; no fictional cash rows.
  for(const buyer of h.businesses) {
    const incoming=state.rights.absorptions.filter(a=>a.buyerId===buyer.studioId).flatMap(a=>a.runReceipts)
    if(incoming.length===0)continue
    const outgoing=state.rights.absorptions.filter(a=>a.targetId===buyer.studioId).flatMap(a=>a.runReceipts)
    const films=h.films.filter((f):f is LiveIndustryFilm=>f.provenance==='simulation/v1' && f.studioId===buyer.studioId)
    for(const period of buyer.account.periods) {
      const inPeriod=(week:number)=>period.fromWeek<=week && week<=period.throughWeek
      let expected=0
      for(const film of films) {
        const run=canonical(film),end=Math.min(run.totalWeeks,state.market.tick-run.releaseTick)
        for(let i=0;i<end;i++)if(inPeriod(run.releaseTick+i))expected+=run.weeklyGross[i]!*run.studioShare
      }
      expected-=outgoing.filter(r=>inPeriod(r.week)).reduce((sum,r)=>sum+r.revenue,0)
      expected+=incoming.filter(r=>inPeriod(r.week)).reduce((sum,r)=>sum+r.revenue,0)
      if(!Number.isFinite(expected) || !Number.isFinite(period.movements.studioRevenue) || Math.abs(period.movements.studioRevenue-expected)>1e-7*Math.max(1,Math.abs(expected),Math.abs(period.movements.studioRevenue)))fail('rival earned revenue period differs from actual installments')
    }
  }
}

/** Independent canonical paid-prefix''')
replace('absorbedRuns.ts',"  if(a.buyerId!==state.hollywood.playerStudioId && (!state.hollywood.businesses.some(b=>b.studioId===a.buyerId)\n    || owned.length!==0 || a.runs.length!==0 || a.runReceipts.length!==0 || b.runs.length!==0\n    || a.workReleases.length!==0 || films.some(f=>f.result.releaseTick>a.week)))fail('rival buyer run producer is not admitted')", "  if(a.buyerId!==state.hollywood.playerStudioId && (!state.hollywood.businesses.some(b=>b.studioId===a.buyerId)\n    || a.workReleases.length!==0 || films.some(f=>f.result.releaseTick>a.week)))fail('rival buyer continued release producer is not admitted')")
replace('absorbedRuns.ts',"    if(receipt.revenue===0 ? rows.length!==0 : rows.length!==1 || rows[0]!.amount!==receipt.revenue || rows[0]!.week!==receipt.week)fail('buyer receipt lacks exact earned cash row')", "    if(a.buyerId!==state.hollywood.playerStudioId || receipt.revenue===0) {\n      if(rows.length!==0)fail('rival/zero receipt credited to player')\n    } else if(rows.length!==1 || rows[0]!.amount!==receipt.revenue || rows[0]!.week!==receipt.week)fail('buyer receipt lacks exact earned cash row')")
replace('hollywoodTick.ts','  const absorbedRunRevenue:LedgerEntry[]=[]','  const absorbedRunRevenue:LedgerEntry[]=[]\n  const rivalRunRevenue:ReturnType<typeof advanceAbsorbedRuns>[\'rivalRevenue\']=[]')
replace('hollywoodTick.ts','      rights=runAdvance.rights;absorbedRunRevenue.push(...runAdvance.ledger)','      rights=runAdvance.rights;absorbedRunRevenue.push(...runAdvance.ledger)\n      rivalRunRevenue.push(...runAdvance.rivalRevenue)')
replace('hollywoodTick.ts','  return {hollywood:h,talent,growth,technology,physicalPlans,firstTakes,greenlights,suppliedTalent,rights,absorbedRunRevenue}', '''  // Assigned income, like native payRuns, is unavailable to this week's policy. Flush
  // after every business so source array order cannot advance a buyer's spending power.
  // A closed recipient retains its actual terminal account; the closure phase journals
  // and distributes this same due installment through its canonical estate run owner.
  for(const payment of rivalRunRevenue) {
    const buyer=h.businesses.find(b=>b.studioId===payment.buyerId)
    const owners=rights.absorptions.filter(a=>a.buyerId===payment.buyerId).flatMap(a=>a.runReceipts.filter(r=>r.id===payment.receiptId))
    if(!buyer || payment.week!==week || owners.length!==1 || owners[0]!.week!==week || owners[0]!.revenue!==payment.amount)throw new Error('absorption run: missing actual rival cash instruction owner')
    moveRivalMoney(buyer.account,'studioRevenue',payment.amount,week)
  }
  return {hollywood:h,talent,growth,technology,physicalPlans,firstTakes,greenlights,suppliedTalent,rights,absorbedRunRevenue}''')
replace('hollywoodValidation.ts'," - (absorptionOf(b.studioId)?.runReceipts.reduce((sum,r)=>sum+r.revenue,0) ?? 0)), 'studio revenue does not reconcile')", " - (absorptionOf(b.studioId)?.runReceipts.reduce((sum,r)=>sum+r.revenue,0) ?? 0)\n      + (era.rights ? [...(era.absorptions?.values() ?? [])].filter(a=>a.buyerId===b.studioId).reduce((sum,a)=>sum+a.runReceipts.reduce((paid,r)=>paid+r.revenue,0),0) : 0)), 'studio revenue does not reconcile')")
replace('acquisition.ts','import { validateAbsorbedRuns, validateAbsorbedRunMoney }','import { acquiredActiveRunFilms, validateAbsorbedRuns, validateAbsorbedRunMoney, validateRivalAbsorbedRunMoney }')
replace('acquisition.ts',"  if (input.buyerId !== h.playerStudioId && h.businesses.find(b => b.studioId === input.targetId)?.runs.length) return 'rivalBuyerRunProducerRequired'", "  if (acquiredActiveRunFilms(state,input.targetId,state.market.tick).length!==0) return 'acquiredRunReassignmentProducerRequired'")
replace('acquisition.ts',"  // This real rival-owner slice has no new employer contracts, buyer workflows or future\n  // run service.","  // This real rival-owner slice has no new employer contracts or buyer workflows.")
replace('acquisition.ts',"    if(q.runs.length!==0)throw new Error('absorption: rivalBuyerRunProducerRequired')\n",'')
replace('acquisition.ts',"      || a.workReleases.length!==0 || a.workCancellations.length!==0 || a.runs.length!==0 || a.runReceipts.length!==0)) {\n      fail('rival buyer retained employment/work/run producer is not admitted')", "      || a.workReleases.length!==0 || a.workCancellations.length!==0)) {\n      fail('rival buyer retained employment/work producer is not admitted')")
replace('acquisition.ts',"    const originals = h!.employment.filter(e => e.studioId === a.targetId", "    if(acquiredActiveRunFilms(state,a.targetId,a.week).length!==0)fail('acquired run reassignment producer is not admitted')\n    const originals = h!.employment.filter(e => e.studioId === a.targetId")
replace('acquisition.ts','  validateContinuedScripts(state, retirementWriting)\n}', '  validateContinuedScripts(state, retirementWriting)\n  validateRivalAbsorbedRunMoney(state)\n}')
replace('studioClosure.ts',"import { absorbedPromiseAuthority", "import { acquiredActiveRunFilms } from './absorbedRuns.js'\nimport { absorbedPromiseAuthority")
replace('studioClosure.ts',"    for (const run of business!.runs) row('theatricalRun', run.productionId, `weekIndex ${run.weekIndex} of ${run.totalWeeks}`, 'the estate collects the genuinely scheduled remaining receipts', 'applied')", "    for (const run of business!.runs) row('theatricalRun', run.productionId, `weekIndex ${run.weekIndex} of ${run.totalWeeks}`, 'the estate collects the genuinely scheduled remaining receipts', 'applied')\n    if(Object.hasOwn(state,'rights'))for(const film of acquiredActiveRunFilms(state,studioId,week))row('theatricalRun',film.filmId,`assigned run from ${film.studioId}`, 'the estate collects the genuinely assigned remaining receipts', 'applied')")
replace('studioClosure.ts',"    const expectedReceipts = new Map<string, { week: number; amount: number }>()\n    if (!player)", "    const expectedReceipts = new Map<string, { week: number; amount: number }>()\n    const acquiredRuns=policy.rightsEstate && !player ? acquiredActiveRunFilms(titleState!,c.studioId,C) : []\n    if (!player)")
replace('studioClosure.ts',"if (film === undefined || film.studioId !== c.studioId) return fail(`closure ${c.closureId} run ${String(d.subjectId)} has no live film of its studio`)", "if (film === undefined || (film.studioId !== c.studioId && !acquiredRuns.some(f=>f.filmId===film.filmId))) return fail(`closure ${c.closureId} run ${String(d.subjectId)} has no live film of its studio/assigned stream`)")
replace('studioClosure.ts',"      for (const run of business!.runs) expect('theatricalRun', run.productionId, 'applied')", "      for (const run of business!.runs) expect('theatricalRun', run.productionId, 'applied')\n      for(const film of acquiredRuns)expect('theatricalRun',film.filmId,'applied')")
manifest={'status':'STATIC-UNRUN','baseHead':'b5c11b5a570820b4c8e8ded6830294b84d57d5a2','files':[]}
patch=[]
for n in names:
 path='src/core/'+n
 before=original[n].encode();after=s[n].encode()
 (D/'postimages'/path).write_bytes(after)
 manifest['files'].append({'path':path,'baseSha256':hashlib.sha256(before).hexdigest(),'postimageSha256':hashlib.sha256(after).hexdigest(),'baseBytes':len(before),'postimageBytes':len(after)})
 patch.extend(difflib.unified_diff(original[n].splitlines(True),s[n].splitlines(True),fromfile='a/'+path,tofile='b/'+path))
p=''.join(patch).encode();(D/'RIVAL-RUNS.patch').write_bytes(p)
manifest['patch']={'path':'RIVAL-RUNS.patch','sha256':hashlib.sha256(p).hexdigest(),'bytes':len(p)}
(D/'SOURCE-MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
