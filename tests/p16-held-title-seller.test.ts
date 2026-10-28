// One fixed public title sale before actual C; no seed/price fallback or authored historical state.
import { expect,it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { convertV48ToV49,validateSaveP15B,validateSaveV51,makeSave,stableStringify } from '../src/core/save.js'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import { offerRefusal,rivalWillingness } from '../src/core/assetSale.js'
import { subjectValueV1 } from '../src/core/propertyValuation.js'
import { TUNING } from '../src/core/tuning.js'
import { currentHolder,resolveTitles } from '../src/core/rights.js'
import { closureDigest,validateStudioClosureRoot } from '../src/core/studioClosure.js'
const R04='studio-aca408ec-r04',filmId=R04+':film:0'
it('real public film0 sale before R04 C excludes the sold title from current closure and handoff while retaining creator history',()=>{
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 function load(name:string,pin:string) {
  const bytes=readFileSync(root+'/'+name);expect(createHash('sha256').update(bytes).digest('hex')).toBe(pin)
  const raw=JSON.parse(bytes.toString()),before=stableStringify(raw),save=validateSaveP15B(raw)
  expect(save.saveVersion).toBe(48);expect(stableStringify(raw)).toBe(before);return save
 }
 const old=load('r04-pre162.save48.json','cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19'),oldBefore=stableStringify(old)
 const state=convertV48ToV49(old).state;makeSave(state)
 expect(state.market.tick).toBe(162)
 const player=state.hollywood!.playerStudioId,subject={right:'R2' as const,filmId}
 expect(currentHolder(state,subject,162)).toMatchObject({kind:'holder',holderId:R04,tradeable:true})
 const value=subjectValueV1(state,subject,162)
 expect(value.kind,'fixed subject valuation prerequisite').toBe('available')
 if(value.kind!=='available')throw new Error('fixed film0 valuation unavailable')
 const price=Math.max(1,Math.ceil(value.value*(100+TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)/100))
 const request={offerorId:player,counterpartyId:R04,direction:'buy' as const,instrument:{kind:'title' as const,subject},price}
 expect(rivalWillingness(state,request,162).willing).toBe(true)
 expect(offerRefusal(state,request,162),'actual bidder/reserve/clean title prerequisites; no fallback').toBeNull()
 const before=stableStringify(state),offered=applyActions(state,[{kind:'makeRightsOffer',offer:{counterpartyId:R04,direction:'buy',instrument:request.instrument,price}}])
 expect(stableStringify(state)).toBe(before);makeSave(offered)
 const input=stableStringify(offered),closed=tick(offered)
 expect(stableStringify(offered)).toBe(input)
 const txs=closed.rights.transactions.filter(t=>t.kind==='titleSale'&&t.subject?.right==='R2'&&t.subject.filmId===filmId)
 expect(txs).toHaveLength(1);expect(txs[0]).toMatchObject({week:163,payerId:player,payeeId:R04,amount:price})
 expect(currentHolder(closed,subject,163)).toMatchObject({kind:'holder',holderId:player})
 const closure=closed.studioClosure.closures.find(c=>c.studioId===R04)!
 expect(closure,'fixed public price must not avert actual C; fail rather than tune').toBeDefined();expect(closure.closureWeek).toBe(163)
 expect(closure.estate.lots).toHaveLength(9)
 expect(closure.estate.lots.some(l=>l.subjectId===filmId)).toBe(false)
 expect(closure.dispositions.filter(x=>x.subjectKind==='title')).toHaveLength(9)
 expect(closure.dispositions.some(x=>x.subjectKind==='title'&&x.subjectId===filmId)).toBe(false)
 const estate=closed.rights.estates.find(e=>e.closureId===closure.closureId)!
 expect(estate).toBeDefined()
 const held=estate.lots.flatMap(l=>l.subjects).concat(estate.pending.map(p=>p.subject))
 expect(held.filter(s=>s.right==='R2')).toHaveLength(9)
 expect(held.some(s=>s.right==='R2'&&s.filmId===filmId)).toBe(false)
 const title=resolveTitles(closed).filmTitles.find(f=>f.filmId===filmId)!
 expect(title).toBeDefined();expect(title.creatorStudioId).toBe(R04)
 expect(closed.hollywood!.films.find(f=>f.filmId===filmId)).toEqual(state.hollywood!.films.find(f=>f.filmId===filmId))
 makeSave(closed);expect(stableStringify(old)).toBe(oldBefore)
 // Hostile old creator-only inventory: copy only authentic original title rows/lots,
 // retain current cash/claims/transfer history, and recompute the row digest/count honestly.
 const originalCSave=load('r04-actual163.save48.json','c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad')
 const originalC=originalCSave.state.studioClosure.closures.find(c=>c.studioId===R04)!
 expect(originalC.estate.lots).toHaveLength(10)
 // Exact current private-era context: strip ONLY rights, retain all other original references.
 const {rights:_rights,...stripped}=closed
 const closedBefore=stableStringify(closed),strippedBefore=stableStringify(stripped)
 expect(()=>validateStudioClosureRoot(stripped,'held-title boundary',{rightsEstate:true,titleState:closed})).not.toThrow()
 const contextRefusal=/current held-title context must match every non-rights key\/value of the original state/
 for(const context of [
  {...closed,studio:{...closed.studio}},
  {...closed,ledger:[...closed.ledger]},
  {...closed,concepts:[...closed.concepts]},
 ]) {
  const contextBefore=stableStringify(context)
  expect(()=>validateStudioClosureRoot(stripped,'held-title foreign context',{rightsEstate:true,titleState:context})).toThrow(contextRefusal)
  expect(stableStringify(context)).toBe(contextBefore)
 }
 const {ledger:_ledger,...missingKey}=stripped
 const extraKey={...stripped,foreignHeldTitleContext:true}
 for(const rawContext of [missingKey,extraKey]) {
  const contextBefore=stableStringify(rawContext)
  expect(()=>validateStudioClosureRoot(rawContext,'held-title key boundary',{rightsEstate:true,titleState:closed})).toThrow(contextRefusal)
  expect(stableStringify(rawContext)).toBe(contextBefore)
 }
 expect(stableStringify(closed)).toBe(closedBefore);expect(stableStringify(stripped)).toBe(strippedBefore)
 // Default frozen root law remains creator-based even if an irrelevant rights key is supplied.
 // This is a direct closure proof only: actual frozen envelope admission still refuses that key.
 const oldBeforeContext=stableStringify(originalCSave)
 const frozenWithRights={...originalCSave.state,rights:closed.rights},frozenBefore=stableStringify(frozenWithRights)
 expect(()=>validateStudioClosureRoot(frozenWithRights,'frozen creator boundary')).not.toThrow()
 const frozenEnvelope={...originalCSave,state:frozenWithRights}
 expect(()=>validateSaveP15B(frozenEnvelope)).toThrow(/rights|unknown field|exact keys/i)
 expect(stableStringify(frozenWithRights)).toBe(frozenBefore);expect(stableStringify(originalCSave)).toBe(oldBeforeContext)

 const mutant=structuredClone(closed),record=mutant.studioClosure.closures.find(c=>c.closureId===closure.closureId)!
 record.estate.lots=structuredClone(originalC.estate.lots)
 record.dispositions=record.dispositions.filter(x=>x.subjectKind!=='title').concat(structuredClone(originalC.dispositions.filter(x=>x.subjectKind==='title'))).sort((a,b)=>a.subjectKind<b.subjectKind?-1:a.subjectKind>b.subjectKind?1:a.subjectId<b.subjectId?-1:a.subjectId>b.subjectId?1:0)
 record.counts.title=10;record.digest=closureDigest(record.closureId,record.dispositions)
 const mutantBefore=stableStringify(mutant),envelope={saveVersion:50 as const,seed:mutant.seed,state:mutant,broadcastCache:mutant.broadcastItems}
 expect(()=>validateSaveV51(envelope)).toThrow(/estate lots|title handoff|titles|dispositions/)
 expect(()=>makeSave(mutant)).toThrow(/estate lots|title handoff|titles|dispositions/)
 expect(stableStringify(mutant)).toBe(mutantBefore);expect(stableStringify(offered)).toBe(input);expect(stableStringify(state)).toBe(before)
})
