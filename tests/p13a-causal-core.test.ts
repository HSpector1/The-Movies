import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import { exportCurrentState, importSave, migrateToV20, validateSaveV20, makeSave } from '../src/core/save.js'
import { researchWeekQuote, technologyAccess } from '../src/core/technology.js'
import { facilityInstallationPhase } from '../src/core/placement.js'
import { hasOperationalFacilityInstallation } from '../src/core/facilityEffects.js'
import { advanceTo, p13aResearchReady, p13aGeneratedStudio, adoptExistingSoundChain } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'

describe('P13A causal Core through the real weekly engine',()=>{
  let ready: GameState
  beforeAll(()=>{ready=p13aResearchReady()},30_000)
  const begin = (budgetPerWeek=10_000) => applyActions(ready,[{kind:'beginResearch',projectId:ready.technology.projects[0]!.id,budgetPerWeek}])

  it('one Scientist completes 64 units in 43 funded weeks, then P09 completes the exact chain at315',()=>{
    let state=begin()
    const startCash=state.studio.cash
    const startLedger=state.ledger.length
    expect(researchWeekQuote(state,state.technology.projects[0]!)).toMatchObject({spend:10_000,output:1.5,remainingWeeks:43})
    state=advanceTo(state,302)
    expect(state.technology.projects[0]).toMatchObject({verifiedWork:63,completedWeek:null,expenditure:420_000})
    expect(technologyAccess(state,state.hollywood!.playerStudioId,'synchronized-sound')).toBe(false)
    state=tick(state)
    expect(state.technology.projects[0]).toMatchObject({status:'completed',verifiedWork:64,completedWeek:303,expenditure:430_000})
    expect(state.ledger.filter(e=>e.kind==='researchPayroll').reduce((sum,e)=>sum-e.amount,0)).toBe(86_000)
    expect(state.ledger.slice(startLedger).reduce((sum,e)=>sum+e.amount,0)).toBeCloseTo(state.studio.cash-startCash,6)
    const cash=state.studio.cash
    state=adoptExistingSoundChain(state)
    const adoption=state.technology.adoptions.find(a=>a.studioId===state.hollywood!.playerStudioId)!
    expect(adoption).toMatchObject({committedWeek:303,operationalWeek:null,equipmentCost:0,installationCost:975_000,prototypeProjectId:state.technology.projects[0]!.id})
    expect(state.studio.cash).toBe(cash-975_000)
    const stage=state.placement.facilities.find(p=>p.projectId===adoption.physicalProjectIds[0])!
    expect(facilityInstallationPhase(stage,311)).toBeDefined()
    state=advanceTo(state,309)
    expect(hasOperationalFacilityInstallation(state,adoption.postFacilityId,'synchronized-sound-post')).toBe(true)
    expect(state.technology.adoptions.find(a=>a.id===adoption.id)!.operationalWeek).toBeNull()
    state=advanceTo(state,315)
    expect(state.technology.adoptions.find(a=>a.id===adoption.id)!.operationalWeek).toBe(315)
    expect(hasOperationalFacilityInstallation(state,adoption.stageFacilityId,'synchronized-sound-stage')).toBe(true)
    expect(()=>validateSaveV20(makeSave(state))).not.toThrow()
    const restored=migrateToV20(importSave(exportCurrentState(state))).state
    expect(restored.technology).toEqual(state.technology)
    expect(exportCurrentState(restored)===exportCurrentState(state)).toBe(true)
  },30_000)

  it('saturation caps both output and actual spend, while pause/cancel/resume retain work',()=>{
    const normal=tick(begin()), excess=tick(begin(40_000))
    expect(excess.technology.projects[0]).toMatchObject({verifiedWork:1.5,expenditure:10_000,budgetPerWeek:40_000})
    expect(excess.studio.cash).toBe(normal.studio.cash)
    let state=advanceTo(begin(),270)
    const projectId=state.technology.projects[0]!.id
    state=applyActions(state,[{kind:'pauseResearch',projectId}])
    const work=state.technology.projects[0]!.verifiedWork, spend=state.technology.projects[0]!.expenditure
    state=advanceTo(state,272)
    expect(state.technology.projects[0]).toMatchObject({verifiedWork:work,expenditure:spend})
    expect(state.ledger.some(e=>e.kind==='researchSpend'&&e.week>=270)).toBe(false)
    expect(state.ledger.filter(e=>e.kind==='researchPayroll'&&e.week>=270)).toHaveLength(2)
    state=applyActions(state,[{kind:'cancelResearch',projectId}])
    const roundtrip=migrateToV20(importSave(exportCurrentState(state))).state
    state=tick(applyActions(roundtrip,[{kind:'resumeResearch',projectId}]))
    expect(state.technology.projects[0]).toMatchObject({verifiedWork:work+1.5,expenditure:spend+10_000,status:'active'})
    expect(roundtrip.technology.projects[0]).toMatchObject({verifiedWork:work,expenditure:spend,status:'cancelled'})
  })

  it('waiting buys no capability; purchase opens416, takes12weeks, and forfeits113weeks of lead',()=>{
    let state=advanceTo(p13aGeneratedStudio('p13a-wait-control-01'),260)
    state=applyActions(state,[{kind:'waitForTechnology',technologyId:'synchronized-sound'}])
    expect(()=>applyActions(state,[{kind:'purchaseTechnology',technologyId:'synchronized-sound'}])).toThrow('1928')
    state=advanceTo(state,416)
    expect(technologyAccess(state,state.hollywood!.playerStudioId,'synchronized-sound')).toBe(false)
    expect(state.technology.projects).toHaveLength(0)
    const cash=state.studio.cash
    state=applyActions(state,[{kind:'purchaseTechnology',technologyId:'synchronized-sound'}])
    state=adoptExistingSoundChain(state)
    expect(state.studio.cash).toBe(cash-1_475_000)
    expect(state.technology.adoptions.find(a=>a.studioId===state.hollywood!.playerStudioId)).toMatchObject({equipmentCost:300_000,prototypeProjectId:null,committedWeek:416})
    state=advanceTo(state,428)
    expect(state.technology.adoptions.find(a=>a.studioId===state.hollywood!.playerStudioId)!.operationalWeek).toBe(428)
    expect(428-315).toBe(113)
    expect(state.era.soundRequired).toBe(false)
    expect(state.ledger.some(e=>e.kind==='researchSpend'||e.kind==='researchPayroll')).toBe(false)
    expect(()=>validateSaveV20(makeSave(state))).not.toThrow()
  },30_000)
})
