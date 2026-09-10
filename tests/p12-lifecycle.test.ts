import { describe,expect,it } from 'vitest'
import { generateWorld,tick,makeSave,exportSave,importSave,migrateToV19 } from '../src/core/index.js'
import { initializeHollywood } from '../src/core/hollywood.js'

describe('R05 shared-law rival lifecycle',()=>{
  it('rejects forged owners, erased archive announcements, invented employers and invalid chart history',()=>{
    let state=initializeHollywood(generateWorld('r05-identity-audit'),'fresh')
    for(let i=0;i<15;i++)state=tick(state)
    const poisons:Record<string,(s:typeof state)=>void>={
      world:s=>{s.hollywood!.worldId='world-forged'},
      cadence:s=>{s.hollywood!.businesses[0]!.nextDecisionWeek=Number.MAX_SAFE_INTEGER},
      cohort:s=>{s.hollywood!.chart!.rows=[]},
      chartDate:s=>{s.hollywood!.chart!.week=2},
      output:s=>{s.hollywood!.chart!.rows[0]!.output=9999},
      missingAnnouncement:s=>{const h=s.hollywood!,f=h.films.find(f=>f.provenance==='simulation/v1')!;
        const b=h.businesses.find(b=>b.studioId===f.studioId)!,cost=b.projects.find(p=>p.productionId===f.filmId)!
        cost.announcedWeek=null;h.receipts=h.receipts.filter(r=>r.kind!=='filmAnnounced'||r.productionId!==f.filmId);h.receipts.forEach((r,i)=>r.eventId=`industry-event-${i}`);h.nextReceipt=h.receipts.length},
      archivedEmployer:s=>{const h=s.hollywood!,f=h.films.find(f=>f.provenance==='simulation/v1')!;if(f.provenance!=='simulation/v1')throw Error('missing live fixture')
        const lead=f.credits.find(c=>c.role==='lead')!,old=lead.talentId,person=s.talent.find(t=>t.id==='t-act-00')!
        lead.talentId=person.id;lead.name=person.name;f.result.participants!.cast.lead.talentId=person.id;f.result.participants!.cast.lead.name=person.name
        const event=h.careerEvents.find(e=>e.filmId===f.filmId&&e.talentId===old)!;event.talentId=person.id;event.eventId=`${f.filmId}:${person.id}`},
    }
    for(const [name,poison] of Object.entries(poisons)){const bad=structuredClone(state);poison(bad);expect(()=>makeSave(bad),name).toThrow()}
    let early=initializeHollywood(generateWorld('r05-concept-owner'),'fresh');early=tick(tick(early))
    const a=early.hollywood!.businesses[1]!,b=early.hollywood!.businesses[3]!
    b.development.projects[0]!.conceptId=a.projects[0]!.conceptId;b.projects[0]!.conceptId=a.projects[0]!.conceptId;b.projects[0]!.conceptOrdinal=a.projects[0]!.conceptOrdinal
    expect(()=>makeSave(early)).toThrow(/owner|concept/)
  })
  it('rejects forged frozen credits, double roles, and another studio’s reserved performers',()=>{
    let state=initializeHollywood(generateWorld('r05-company-authority'),'fresh')
    for(let i=0;i<5;i++)state=tick(state)
    expect(state.hollywood!.businesses[0]!.productions).toHaveLength(1)
    for(const mutation of ['cast-only','double-role','credit-only','cast-and-credit']){
      const bad=structuredClone(state),a=bad.hollywood!.businesses[0]!.productions[0]!,b=bad.hollywood!.businesses[1]!.productions[0]!
      if(mutation==='cast-only'||mutation==='cast-and-credit')a.cast.lead=b.cast.lead
      if(mutation==='double-role')a.cast.antagonist=a.cast.lead
      if(mutation==='credit-only'||mutation==='cast-and-credit')a.participants!.cast.lead=structuredClone(b.participants!.cast.lead)
      expect(()=>makeSave(bad),mutation).toThrow(/role|participant|assignment|employer/)
    }
    expect(()=>makeSave(state)).not.toThrow()
  })
  it('commissions, staffs, funds, operates, releases and settles real films without player RNG draws',()=>{
    let state=initializeHollywood(generateWorld('r05-lifecycle'),'fresh')
    const original=exportSave(makeSave(state))
    const rng=state.rngState
    const phases=new Set<string>()
    for(let i=0;i<52;i++) {
      state=tick(state,{develop:true})
      for(const b of state.hollywood!.businesses)for(const w of b.operations.workflows)phases.add(w.phase)
      makeSave(state)
    }
    expect(phases).toEqual(new Set(['development','preProduction','rehearsal','shooting','postProduction','releaseReady']))
    const films=state.hollywood!.films.filter(f=>f.provenance==='simulation/v1')
    expect(films.length).toBeGreaterThanOrEqual(4)
    expect(films.every(f=>f.provenance==='simulation/v1'&&f.directCommitment>0)).toBe(true)
    expect(state.hollywood!.careerEvents.length).toBe(films.length*6)
    expect(state.rngState).toBe(rng)
    expect(exportSave(makeSave(initializeHollywood(generateWorld('r05-lifecycle'),'fresh')))).toBe(original)
    const reloaded=migrateToV19(importSave(exportSave(makeSave(state)))).state
    expect(exportSave(makeSave(tick(reloaded,{develop:true})))).toBe(exportSave(makeSave(tick(state,{develop:true}))))
  })
  it('expires ordinary contracts and crosses the first real arrival from elapsed play',()=>{
    let state=initializeHollywood(generateWorld('r05-continuation'),'fresh')
    for(let i=0;i<530;i++) {state=tick(state,{develop:true}); if(i%13===0 || i>=518)makeSave(state)}
    expect(state.hollywood!.businesses.length).toBe(5)
    expect(state.hollywood!.identities[5]!.enteredWeek).toBe(520)
    expect(state.hollywood!.receipts.some(r=>r.kind==='employment'&&r.reason==='expiry')).toBe(true)
  })
  it('does not pay authored films again and rejects erased causality and setup charges',()=>{
    const state=initializeHollywood(generateWorld('r05-forgery'),'fresh')
    const bad=makeSave(state)
    bad.state.hollywood!.receipts=[];bad.state.hollywood!.nextReceipt=0
    expect(()=>exportSave(bad)).toThrow(/receipt/)
    const finance=makeSave(state)
    const account=finance.state.hollywood!.businesses[0]!.account
    account.periods[0]!.movements.capacity=0
    account.cash+=5_900_000;account.periods[0]!.closing=account.cash
    expect(()=>exportSave(finance)).toThrow()
    const next=tick(state)
    expect(next.hollywood!.businesses.every(b=>b.account.periods.every(p=>p.movements.studioRevenue===0))).toBe(true)
  })
})
