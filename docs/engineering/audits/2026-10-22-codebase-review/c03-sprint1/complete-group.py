from pathlib import Path
w=Path('/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt')
p=w/'tests/p16c-estate.test.ts'
s=p.read_text().replace("import { describe, expect, it }", "import { describe, expect, it, vi }").replace('actualEstateOpening, actualEstateClosure','actualEstateOpening, actualEstateClosure, actualEstatePrior')
a=s.index('function world()');b=s.index("describe('P16C estate handoff",a);s=s[:a]+s[b:]
a=s.index('  function bidsPlaced()');b=s.index("  it('the ordinary route",a)
s=s[:a]+'''  it('resolves exactly once at D with exact debits, proceeds to the estate once, title to the winners, archival of the unsold lot, and no person moved', () => {
    // Constructed adapter partition permitted by contract §4, not an untouched producer capture.
    // Only two clean singleton lots are grouped; real closure, inventory and valuation remain intact.
    const prior=actualEstatePrior(), originalOpen=estate.openEstate
    const priorBytes=stableStringify(prior)
    let grouped: estate.EstateHandoff | undefined
    const spy=vi.spyOn(estate,'openEstate').mockImplementation((state,handoff,week,readers)=>{
      if(handoff.studioId!=='studio-aca408ec-r04')return originalOpen(state,handoff,week,readers)
      const a=handoff.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===handoff.studioId+':film:0'))!
      const b=handoff.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===handoff.studioId+':film:1'))!
      expect(a.subjects).toHaveLength(1);expect(b.subjects).toHaveLength(1)
      expect(a.encumbrances).toEqual([]);expect(b.encumbrances).toEqual([])
      expect(a.minimumBid+b.minimumBid).toBe(83_841)
      grouped={...handoff,lots:handoff.lots.filter(l=>l!==b).map(l=>l===a?{...a,subjects:[...a.subjects,...b.subjects],minimumBid:a.minimumBid+b.minimumBid}:l)}
      expect(grouped.lots.flatMap(l=>l.subjects).map(rights.subjectKey).sort()).toEqual(handoff.lots.flatMap(l=>l.subjects).map(rights.subjectKey).sort())
      expect(estate.estateHandoffRefusal(state,grouped,week)).toBeNull()
      return originalOpen(state,grouped,week,readers)
    })
    let state: GameState
    try {state=tick(prior)} finally {spy.mockRestore()}
    expect(stableStringify(prior)).toBe(priorBytes)
    expect(grouped).toBeDefined();makeSave(state)
    const handoff=grouped!,r03=handoff.studioId,D=handoff.closesWeek,player=state.hollywood!.playerStudioId
    const r01='studio-aca408ec-r01',r02='studio-aca408ec-r02'
    const lotA=handoff.lots.find(l=>l.subjects.length===2)!
    const lotB=handoff.lots.find(l=>l.subjects.some(s=>s.right==='R1'&&s.propertyId==='story-property:'+r03+':concept:0'))!
    const lotC=handoff.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===r03+':film:2'))!
    while(state.market.tick<D-1)state=tick(state)
    const control=tick(state)
    for(const [lotId,bidderId,amount] of [[lotA.lotId,r01,100_000],[lotA.lotId,player,100_000],[lotA.lotId,r02,90_000],[lotB.lotId,r01,60_000],[lotB.lotId,r02,50_000]] as const){
      state=estate.submitEstateBid(state,{estateId:handoff.estateId,lotId,bidderId,amount},D-1).state
    }
    const before=stableStringify(state)
    expect(()=>estate.resolveEstate(state,handoff.estateId,D-1)).toThrow(/before its close boundary/)
    const closed=estate.resolveEstate(state,handoff.estateId,D)
    expect(stableStringify(state)).toBe(before)
    const record=closed.rights.estates.find(e=>e.estateId===handoff.estateId)!
    expect(record.closedWeek).toBe(D)
    expect(record.bids.map(b=>b.status)).toEqual(['lost','won','lost','won','lost'])
    expect(record.lots.filter(l=>l.status==='sold').map(l=>l.lotId)).toEqual([lotB.lotId,lotA.lotId])
    expect(closed.studio.cash).toBe(control.studio.cash-100_000)
    expect(closed.ledger.filter(e=>e.kind==='rightsConsideration')).toHaveLength(1)
    expect(rivalCash(closed,r01)).toBe(rivalCash(control,r01)-60_000)
    expect(rivalCash(closed,r02)).toBe(rivalCash(control,r02))
    // Actual P15 terminal estate account receives consideration; immutable closure cash does not change.
    expect(rivalCash(closed,r03)).toBe(rivalCash(control,r03)+160_000)
    expect(closed.studioClosure.closures).toEqual(control.studioClosure.closures)
    const txs=closed.rights.transactions.filter(t=>t.kind==='estateSale'&&t.estateId===record.estateId)
    expect(txs).toHaveLength(2)
    const groupSale=txs.find(t=>t.lotId===lotA.lotId)!
    expect(groupSale).toMatchObject({payerId:player,payeeId:null,amount:100_000,subject:null})
    expect(groupSale.titleEventIds).toHaveLength(2)
    expect(new Set(groupSale.titleEventIds).size).toBe(2)
    expect(record.proceeds).toEqual(txs.map(t=>({transactionId:t.id,lotId:t.lotId,amount:t.amount})))
    for(const subject of lotA.subjects)expect(rights.currentHolder(closed,subject,D)).toEqual({kind:'holder',holderId:player,tradeable:true,archived:false})
    expect(rights.currentHolder(closed,lotB.subjects[0]!,D)).toMatchObject({holderId:r01,tradeable:true})
    expect(rights.currentHolder(closed,lotC.subjects[0]!,D)).toEqual({kind:'holder',holderId:'estate:'+r03,tradeable:false,archived:true})
    for(const subject of lotA.subjects){
      expect(subject.right).toBe('R2')
      if(subject.right==='R2')expect(closed.rights.filmTitles.find(t=>t.filmId===subject.filmId)!.creatorStudioId).toBe(r03)
    }
    expect(sale.offerRefusal(closed,{offerorId:player,counterpartyId:r03,direction:'buy',instrument:{kind:'title',subject:lotC.subjects[0]!},price:1},D)).toBe('notTradeable')
    const value=libraryValuationV1(closed,player,D)
    expect(value.kind==='available'&&value.items.map(i=>i.subject)).toEqual(lotA.subjects)
    for(const id of [player,r01,r02])expect(finance.reservedCash(closed,id)).toBe(0)
    expect(closed.hollywood!.employment).toEqual(control.hollywood!.employment)
    expect(closed.hollywood!.activeEmploymentOrdinals).toEqual(control.hollywood!.activeEmploymentOrdinals)
    expect(closed.contracts).toEqual(control.contracts)
    expect(()=>rights.validateRightsRoot(closed as unknown as Record<string,unknown>,'ceremony')).not.toThrow()
    const saved=makeSave(closed)
    expect(stableStringify(migrateToLive(importSave(stableStringify(saved))))).toBe(stableStringify(saved))
    expect(()=>estate.resolveEstate(closed,handoff.estateId,D)).toThrow(/already closed/)
    expect(estate.closeDueEstates(closed,D+1)).toBe(closed)
  })

'''+s[b:]
s=s.replace("import { TUNING } from '../src/core/tuning.js'\n",'').replace("import { detached, estateHandoffFor, liveFromGenuine, readersWith, STABLE } from './helpers/p16-fixtures.js'\n",'')
s=s.replace("const R1 = (propertyId: string): RightSubject => ({ right: 'R1', propertyId })\n",'')
a=s.index('// The P15B Wave 4 producer');b=s.index("import { describe",a)
s=s[:a]+'''// Sprint 1: actual captured closure and bound readers replace the obsolete fabricated handoffs.
// The grouped-lot witness explicitly exercises a lawful adapter partition of real clean inventory.

'''+s[b:]
p.write_text(s)
sdir=Path('/Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025')
(sdir/'focused-d.sh').write_text((sdir/'focused-c.sh').read_text().replace('focused-c','focused-d'))
