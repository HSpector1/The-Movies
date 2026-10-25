/** Read only the paying player's real disclosure; general Industry pages remain public. */
import type {GameState} from '../src/core/types.js'
import type {DiligenceRecord} from '../src/core/rights.js'
import {disclosureFor,publicDiligenceReceipts} from '../src/core/dueDiligence.js'
import {quoteAgeRefusal} from '../src/core/quoteAge.js'
import type {PaidReportsPage} from './schema/industry-schema.ts'

type Receipt=PaidReportsPage['receipts'][number]
function receipt(state:GameState,record:DiligenceRecord):Receipt {
 const publicReceipt=publicDiligenceReceipts(state).find(r=>r.id===record.id)!
 const target=record.target
 const studioId=target.kind==='studio'?target.studioId:state.rights.estates.find(e=>e.estateId===target.estateId)?.studioId
 const name=state.hollywood!.identities.find(s=>s.studioId===studioId)?.name??'Studio'
 const fresh=state.market.tick<record.staleFromWeek && quoteAgeRefusal('disclosure',record.week,state.market.tick,record.quoteAgePolicyVersion)===null
 return {...publicReceipt,target:{...publicReceipt.target},scope:[...publicReceipt.scope],
  targetLabel:record.target.kind==='studio'?name:`${name} estate lot`,transactionId:record.transactionId,staleFromWeek:record.staleFromWeek,
  quoteAgePolicyVersion:record.quoteAgePolicyVersion??null,fresh,
  freshnessLine:fresh?`Report dated Week ${record.week}; usable through Week ${record.staleFromWeek-1}.`:`Report dated Week ${record.week}; a fresh paid report is required for a new deal.`}
}
export function paidReportsPage(state:GameState,targetId:string|null,page:number,pageSize:number):{diligence:PaidReportsPage;totalRows:number;pageCount:number} {
 if(!Number.isInteger(page)||page<0||!Number.isInteger(pageSize)||pageSize<1||pageSize>50)throw new Error('Paid reports require a valid bounded page.')
 const player=state.hollywood?.playerStudioId
 if(player===undefined)throw new Error('Paid reports require an established player studio.')
 const held=state.rights.diligence.filter(r=>r.recipientId===player).reverse()
 const pageCount=Math.ceil(held.length/pageSize)
 if(page>0&&page>=pageCount)throw new Error('That paid-report page is outside this record.')
 // No caller-supplied recipient, guessed foreign report body or whole rights-root export.
 const selected=targetId===null?null:disclosureFor(state,player,targetId)
 return {totalRows:held.length,pageCount,diligence:{title:'Paid due diligence',
  notice:'Only reports paid for by your studio appear here. A report is a dated snapshot of its purchased scope; stale reports remain history, not authority for a new deal.',
  receipts:held.slice(page*pageSize,(page+1)*pageSize).map(r=>receipt(state,r)),
  selectedReport:selected===null?null:{receipt:receipt(state,selected),body:structuredClone(selected.body)}}}
}
