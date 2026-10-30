// F40 actual estate-buyer reporting and explicitly NONCAMPAIGN signed read-model unit.
import { expect,it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { convertV48ToV49,validateSaveP15B,makeSave,stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { applyActions } from '../src/core/actions.js'
import { financeTotals,periodSummary } from '../src/core/economyView.js'
import { recordedFinancePeriod,financeHistory,ownedEstateFinance } from '../src/core/financeReport.js'
const R04='studio-aca408ec-r04',filmId=R04+':film:0',BID=13_000_000
function base() {
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 const bytes=readFileSync(root+'/r04-pre162.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe('cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19')
 const raw=JSON.parse(bytes.toString()),before=stableStringify(raw),old=validateSaveP15B(raw),state=convertV48ToV49(old).state
 makeSave(state);expect(stableStringify(raw)).toBe(before);return state
}
it('actual13M estate buyer debit has one signed finance category and unchanged ledger-order net without exposing rival estate accounting',()=>{
 let state=base()
 while(state.market.tick<175)state=tick(state)
 const estate=state.rights.estates.find(e=>e.studioId===R04)!
 expect(estate).toBeDefined()
 const lot=estate.lots.find(l=>l.subjects.length===1&&l.subjects[0]!.right==='R2'&&l.subjects[0]!.filmId===filmId)!
 expect(lot).toBeDefined()
 const input=stableStringify(state)
 const offered=applyActions(state,[{kind:'submitEstateBid',estateId:estate.estateId,lotId:lot.lotId,amount:BID}]);makeSave(offered)
 expect(stableStringify(state)).toBe(input)
 const before=stableStringify(offered),final=tick(offered);makeSave(final)
 expect(stableStringify(offered)).toBe(before)
 const tx=final.rights.transactions.filter(t=>t.kind==='estateSale'&&t.estateId===estate.estateId)
 expect(tx).toHaveLength(1);expect(tx[0]!.amount).toBe(BID)
 const finalBefore=stableStringify(final),totals=financeTotals(final),summary=periodSummary(final,176,176)
 expect(totals.estatePurchases).toBe(-BID);expect(totals.rights).toBe(0)
 expect(summary.estatePurchases).toBe(-BID);expect(summary.rights).toBe(0)
 expect(totals.net).toBe(final.ledger.reduce((sum,e)=>sum+e.amount,0))
 const period=recordedFinancePeriod(final,176,176,'D','Closing day')
 expect(period.categories.filter(c=>c.kind==='estatePurchase')).toEqual([{kind:'estatePurchase',label:'Estate asset purchases (proceeds paid to the estate)',amount:-BID,entryCount:1}])
 expect(period.categories.some(c=>c.kind==='rightsConsideration')).toBe(false)
 expect(period.netCash).toBe(final.ledger.filter(e=>e.week===176).reduce((n,e)=>n+e.amount,0))
 expect(period.categories.reduce((n,c)=>n+c.amount,0)).toBe(period.netCash)
 expect(ownedEstateFinance(final)).toBeNull() // R04 is closed; actual player is not.
 const history=financeHistory(final)
 expect(history.windows.every(w=>w.costSeries.some(s=>s.kind==='estatePurchase'))).toBe(true)
 // D176 is still current at final176; history becomes recorded on ordinary177.
 const successor=tick(final);makeSave(successor)
 const completed=financeHistory(successor)
 for(const window of completed.windows) {
  const week=window.points.find(p=>p.fromWeek===176)!;expect(week).toBeDefined()
  expect(week.categories.find(c=>c.kind==='estatePurchase')?.amount).toBe(-BID)
  expect(week.categories.reduce((n,c)=>n+c.amount,0)).toBe(week.netCash)
  const series=window.costSeries.find(s=>s.kind==='estatePurchase')!
  expect(series.points.find(p=>p.week===176)?.amount).toBe(-BID)
 }
 expect(stableStringify(final)).toBe(finalBefore)
})
it('NONCAMPAIGN isolated signed reporting keeps ordinary rights fractional acquisition and diligence separate without inventing cash authority',()=>{
 const admitted=base(),before=stableStringify(admitted)
 // Projection-only rows: never tick/save/validate/serialize this constructed campaign input.
 // The actual admitted context is mandatory; these are arithmetic unit inputs, not real transactions.
 const unit={...admitted,ledger:[
  {week:162,kind:'rightsConsideration' as const,amount:120,note:'unit-title-sale'},
  {week:162,kind:'rightsConsideration' as const,amount:-35,note:'unit-licence'},
  {week:162,kind:'acquisitionOutlay' as const,amount:10.25,note:'unit-target-cash-at-par'},
  {week:162,kind:'dueDiligenceFee' as const,amount:-7,note:'unit-diligence'},
 ]}
 const totals=financeTotals(unit),period=periodSummary(unit,162,162)
 expect(totals.rights).toBe(85);expect(totals.estatePurchases).toBe(0)
 expect(totals.acquisition).toBe(10.25);expect(totals.diligence).toBe(-7)
 expect(totals.construction).toBe(0);expect(totals.overhead).toBe(0)
 expect(totals.net).toBe(88.25)
 expect(period).toMatchObject({rights:85,estatePurchases:0,acquisition:10.25,diligence:-7,construction:0,overhead:0,netCash:88.25})
 expect(stableStringify(admitted)).toBe(before)
})
