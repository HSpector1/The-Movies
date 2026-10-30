// Proposed small tests/helpers/p15b-pending-family-assertions.ts; consumes REAL qualified
// witness outputs. Does not build inputs, force closure or replace full positive admission.
import { expect } from 'vitest'
import { makeSave, exportSave, importSave, migrateToLive, stableStringify } from '../../src/core/save.js'
import { closureDigest, validateStudioClosureRoot } from '../../src/core/studioClosure.js'
import type { GameState } from '../../src/core/types.js'
const copy=(s:GameState):GameState=>JSON.parse(stableStringify(s))
function roundTrip(s:GameState) {
 const before=stableStringify(s),saved=exportSave(makeSave(s))
 expect(exportSave(makeSave(migrateToLive(importSave(saved)).state))).toBe(saved)
 expect(stableStringify(s)).toBe(before)
}
function refusePure(s:GameState,message:string) {
 const before=stableStringify(s)
 // P16 rebase round 6: the root validator takes the world's era, as the live reader does (save.ts validateSaveP15B era
 // call). With the default predecessor policy a Save49 closure's phase table 3 refused first ("closure … uses current
 // estate phase table below its era", studioClosure.ts), before the disposition law this helper pins.
 expect(()=>validateStudioClosureRoot(s,'unit',{rightsEstate:Object.hasOwn(s,'rights')})).toThrow(message)
 expect(stableStringify(s)).toBe(before)
 expect(()=>makeSave(s)).toThrow()
 expect(stableStringify(s)).toBe(before)
}
function removeAndRedigest(s:GameState,closureId:string,kind:string,subjectId:string):GameState {
 const m=copy(s),c=m.studioClosure.closures.find(c=>c.closureId===closureId)!
 c.dispositions=c.dispositions.filter(d=>!(d.subjectKind===kind&&d.subjectId===subjectId))
 c.counts={};for(const d of c.dispositions)c.counts[d.subjectKind]=(c.counts[d.subjectKind]??0)+1
 c.digest=closureDigest(c.closureId,c.dispositions);return m
}
export function assertPendingPlayerAdoptionFamily(s:GameState,adoptionId:string) {
 roundTrip(s)
 const own=s.hollywood!.playerStudioId,c=s.studioClosure.closures.find(c=>c.studioId===own)!
 const a=s.technology.adoptions.find(a=>a.id===adoptionId)!
 expect(a.studioId).toBe(own);expect(a.operationalWeek).toBeNull();expect(a.cancelledWeek).toBeNull()
 expect(c.dispositions.filter(d=>d.subjectKind==='adoption'&&d.subjectId===a.id)).toMatchObject([{status:'pending'}])
 const deleted=removeAndRedigest(s,c.closureId,'adoption',a.id)
 refusePure(deleted,`no disposition for live subject adoption:${a.id}`)
}
export function assertProposalFamily(s:GameState,issuer:string,talentId:string) {
 roundTrip(s)
 const c=s.studioClosure.closures.find(c=>c.studioId===issuer)!,key=issuer+':proposal:'+talentId
 const row=c.dispositions.find(d=>d.subjectKind==='proposal'&&d.subjectId===key)!
 expect(row).toBeDefined();expect(row.status).toBe('applied');expect(c.dispositions.filter(d=>d.subjectKind==='proposal'&&d.subjectId===key)).toHaveLength(1)
 const withdrawals=s.talentMarket.receipts.filter(r=>r.kind==='proposalWithdrawn'&&r.studioId===issuer&&r.talentId===talentId&&r.week===c.closureWeek)
 expect(withdrawals).toHaveLength(1)
 expect(withdrawals[0]!.reasons[0]).toBe('the issuing studio closed')
 const deleted=removeAndRedigest(s,c.closureId,'proposal',key)
 refusePure(deleted,`no disposition for live subject proposal:${key}`)
 const invented=copy(s),target=invented.studioClosure.closures.find(x=>x.closureId===c.closureId)!
 target.dispositions.push({...row,subjectId:issuer+':proposal:person-ghost'})
 target.dispositions.sort((a,b)=>(a.subjectKind+':'+a.subjectId)<(b.subjectKind+':'+b.subjectId)?-1:1)
 target.counts.proposal=(target.counts.proposal??0)+1;target.digest=closureDigest(target.closureId,target.dispositions)
 refusePure(invented,'not a subject the retained history knows')
 const lost=copy(s)
 lost.talentMarket.receipts=lost.talentMarket.receipts.filter(r=>!(r.kind==='proposalWithdrawn'&&r.studioId===issuer&&r.talentId===talentId&&r.week===c.closureWeek))
 refusePure(lost,'not a subject the retained history knows')
 const forged=copy(s),receipt=forged.talentMarket.receipts.find(r=>r.kind==='proposalWithdrawn'&&r.studioId===issuer&&r.talentId===talentId&&r.week===c.closureWeek)!
 expect(receipt).toBeDefined()
 const other=s.hollywood!.identities.find(i=>i.enteredWeek!==null&&!s.studioClosure.closures.some(c=>c.studioId===i.studioId))
 expect(other).toBeDefined()
 forged.talentMarket={...forged.talentMarket,receipts:[...forged.talentMarket.receipts,{...receipt,studioId:other!.studioId}]} // Hostile mutant only; never admitted positive input.
 refusePure(forged,'closure that did not happen')
}
