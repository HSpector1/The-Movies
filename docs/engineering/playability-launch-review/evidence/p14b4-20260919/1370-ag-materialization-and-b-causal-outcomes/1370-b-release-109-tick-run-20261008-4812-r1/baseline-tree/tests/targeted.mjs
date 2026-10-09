// Pure historical-context comparison. No game imports, no assumed restoration.
import assert from 'node:assert/strict'
import { boundedJson, optional, fullDifferences, classifyCount } from './streaming.mjs'
export const caseKey=row=>[row.contractId,row.variant]
export const receiptKey=row=>[row.week,row.kind,row.talentId,optional(row,'studioId')]
export function identified(rows,keyOf,outputBoundary) {
  const counts=new Map()
  return rows.map((row,ordinal)=>{const base=keyOf(row),key=boundedJson(base).toString(),occurrence=counts.get(key)??0;counts.set(key,occurrence+1)
    return {identity:[...base,occurrence],ordinal,row,eventId:row.eventId??null,reportedWeek:row.week??null,observedAtOutputBoundary:outputBoundary}
  })
}
const same=(a,b)=>boundedJson(a).equals(boundedJson(b))
function against(actual,expected) {
  return actual.map(record=>({...record,expectedIdentityMatch:same(record.identity,expected.identity),
    recordedE0GSourceOrdinal:expected.sourceOrdinal,recordedE0GEventId:expected.eventId,
    recordedE0GTerminalBoundary:expected.recordedAtTerminalBoundary,
    recordedE0GRow:expected.row,recordedE0GContentDifferences:fullDifferences(expected.row,record.row)}))
}
export function targeted(state,selected,context) {
  const boundary=state.market.tick,target='studio-5a47d054-r04'
  const cases=identified(state.talentMarket.cases,caseKey,boundary),receipts=identified(state.talentMarket.receipts,receiptKey,boundary)
  const rows=selected.map(entry=>{
    const contractId=entry.row.contractId,talentId=entry.row.terms.talentId
    const expectedCases=context.cases.filter(x=>x.row.contractId===contractId&&x.row.variant==='expiry')
    const expectedDiscovery=context.market.filter(x=>x.row.talentId===talentId&&x.row.week===404&&x.row.kind==='discovered')
    const expectedDecline=context.market.filter(x=>x.row.talentId===talentId&&x.row.week===416&&x.row.kind==='declined')
    assert.equal(expectedCases.length,1);assert.equal(expectedDiscovery.length,1);assert.equal(expectedDecline.length,1)
    const actualCases=against(cases.filter(x=>x.row.contractId===contractId&&x.row.subjectStudioId===target),expectedCases[0])
    const discoveries=against(receipts.filter(x=>x.row.talentId===talentId&&x.row.week===404&&x.row.kind==='discovered'),expectedDiscovery[0])
    const declines=against(receipts.filter(x=>x.row.talentId===talentId&&x.row.week===416&&x.row.kind==='declined'),expectedDecline[0])
    const eligible=actualCases.filter(x=>x.expectedIdentityMatch&&x.row.talentId===talentId&&x.row.openedWeek===404)
    const discoveryPresent=eligible.length>0&&discoveries.some(x=>x.expectedIdentityMatch)
    const declinePresent=eligible.some(x=>x.row.closedWeek===416&&x.row.outcome==='declined')&&declines.some(x=>x.expectedIdentityMatch)
    return {identity:entry.identity,talentId,expectedRecordedE0G:{case:expectedCases[0],discovery:expectedDiscovery[0],decline:expectedDecline[0]},
      cases:actualCases,discoveries,declines,mismatchedCases:actualCases.filter(x=>!x.expectedIdentityMatch),
      mismatchedDiscoveryIdentities:discoveries.filter(x=>!x.expectedIdentityMatch),mismatchedDeclineIdentities:declines.filter(x=>!x.expectedIdentityMatch),
      discoveryPresent,declinePresent,contentComparisonRole:'Recorded E0G terminal416 contents; lifecycle fields may differ at observed404. Content changes are descriptive, not required restoration.'}
  })
  const discoveries=rows.filter(x=>x.discoveryPresent).length,declines=rows.filter(x=>x.declinePresent).length
  return {rows,discoveries,declines,discoveryReturn:classifyCount(discoveries,selected.length),declineReturn:classifyCount(declines,selected.length),
    classification:'DIAGNOSTIC_NONE_PARTIAL_ALL_VALID',internalPredicates:'UNOBSERVED',
    historicalContextRole:context.contextRole,observedAtOutputBoundary:boundary}
}
