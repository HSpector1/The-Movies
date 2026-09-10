import { describe,expect,it } from 'vitest'
import { generateWorld,tick,makeSave,exportSave,importSave,migrateToV19 } from '../src/core/index.js'
import { initializeHollywood } from '../src/core/hollywood.js'

describe('R05 shared-law rival lifecycle',()=>{
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
