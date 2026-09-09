import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { loadBridgeRuntimeCheckpoint, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import type { BridgeCastingDraftPayload, BridgeContractDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { castingProjection } from '../bridge/casting.ts'
import { financeUpcoming } from '../bridge/finance-upcoming.ts'
import { financePortfolio } from '../bridge/finance-portfolio.ts'
import { financeProjection } from '../bridge/finance.ts'
import { peopleProjection } from '../bridge/people.ts'
import { applyActions, generateWorld, tick, weeklyBurn, weeklyPayroll, stableStringify } from '../src/core/index.ts'
import { financeHistory } from '../src/core/financeReport.ts'
import { expectedWeeklyRunRevenue, pipelineRunRevenue } from '../src/core/economyView.ts'
import { TUNING } from '../src/core/tuning.ts'
import { withCash } from './contracts/_contractFixtures.ts'
import { contendedGreenlightStudio } from './_m4Fixtures.ts'
import type { GameState } from '../src/core/types.ts'

function fixture(id: string, corpus = 'p11-core-v2') {
  const raw = readFileSync(new URL(`../ui/e2e/${corpus}/${id}.checkpoint.json`, import.meta.url), 'utf8')
  return BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(raw, undefined, () => `p11-ready-${id}`).hydrated).gameState
}
function envelope(session: BridgeSession, commandId: string) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
    expectedStateRevision: session.stateRevision, commandId }
}
function submit(session: BridgeSession, id: string) {
  return session.command({ ...envelope(session, 'commit'), type: 'submitIntent', payload: { intentId: id } })
}
function contractQuote(session: BridgeSession, draft: BridgeContractDraftPayload) {
  const q = session.quote({ ...envelope(session, 'quote'), type: 'quoteContract', draft })
  if (!q.accepted) throw Error(q.message)
  return q.quote
}
const emptyCasting = { slateLead: null, slateAntagonist: null, slateSupport: null, directorId: null,
  castLead: null, castAntagonist: null, castSupport: null, craftLeadId: null, budgetNegative: null,
  budgetMarketing: null, signTalentId: null, signTermWeeks: null }
function packageDraft(state: GameState, projectId: string): BridgeCastingDraftPayload {
  const p = castingProjection(state).board!.projects.find(p => p.projectId === projectId)!
  const actors = p.leadCandidates.filter(p => p.available)
  return { ...emptyCasting, kind: 'greenlightPackage', projectId,
    directorId: p.directorCandidates.find(p => p.available)!.talentId,
    craftLeadId: p.craftCandidates.find(p => p.available)!.talentId,
    castLead: actors[0]!.talentId, castAntagonist: actors[1]!.talentId, castSupport: actors[2]!.talentId,
    budgetNegative: p.negativeOptions[0]!.amount, budgetMarketing: p.marketingOptions[0]!.amount }
}

describe('P11 ready Upcoming and discarded financial successors', () => {
  it('migrates authentic core25 without relabeling its bytes; strict26 includes a nullable Week0 history', () => {
    expect(PROJECTION_VERSION).toBe(26)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get('sha256:fe9bf4558dc12abc5f258ba8b8f581242e06361cfbae8ae31d8c676f6c7a6460')).toBe('projection-v25')
    const state = fixture('s5-p11-steady')
    const snapshot = new BridgeSession(state, 'ready-week0').snapshot()
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)).not.toThrow()
    expect(snapshot.snapshot.finance.finance.history.windows.every(w => w.period === null && w.points.length === 0)).toBe(true)
  })
  it('keeps completion and first Opex distinct, including the just-completed operational office', () => {
    const state = fixture('s2-p11-capital-heavy')
    const before = stableStringify(state)
    const upcoming = financeUpcoming(state)
    const rows = upcoming.windows[1].rows
    const first = state.placement.facilities.find(f => f.status === 'operational')!
    expect(first.completesWeek).toBe(state.market.tick)
    expect(rows.find(r => r.id === `facility-opex:${first.projectId}`)).toMatchObject({ week: state.market.tick + 1,
      weeklyOperatingCostChange: 5500, route: { targetId: `placed-${first.id}` } })
    for (const placed of state.placement.facilities.filter(f => f.status === 'underConstruction')) {
      expect(rows.find(r => r.id === `facility-completion:${placed.projectId}`)?.week).toBe(placed.completesWeek)
      expect(rows.find(r => r.id === `facility-opex:${placed.projectId}`)?.week).toBe(placed.completesWeek + 1)
    }
    const after = tick(state)
    expect(after.ledger.slice(state.ledger.length).filter(e => e.kind === 'facilityOpex').reduce((n,e)=>n-e.amount,0)).toBe(5500)
    expect(stableStringify(state)).toBe(before)
  })
  it('retains already-open renewal dates; expiry pays its final preceding advance only', () => {
    let state = fixture('s3-p11-ongoing-deficit')
    const end = Math.min(...state.contracts.map(c => c.endWeekExclusive))
    while (state.market.tick < end - TUNING.HIRING_RENEWAL_WINDOW_WEEKS + 1) state = tick(state)
    const c = state.contracts.find(c => c.endWeekExclusive === end)!
    const rows = financeUpcoming(state).windows[0].rows
    expect(rows.find(r => r.id === `renewal:${c.talentId}:${end}`)).toMatchObject({ week: end - 12, label: expect.stringContaining('is open'), weeklyOperatingCostChange: null })
    expect(rows.find(r => r.id === `expiry:${c.talentId}:${end}`)?.week).toBe(end)
    while (state.market.tick < end - 1) state = tick(state)
    const paid = tick(state)
    expect(paid.ledger.slice(state.ledger.length).some(e => e.kind === 'payroll' && e.week === end - 1)).toBe(true)
    expect(paid.contracts.some(contract => contract.talentId === c.talentId)).toBe(false)
  })
  it('publishes only the existing public revenue aggregates and does not serialize locked weekly receipts', () => {
    const state = fixture('s6-p11-positive-long-payroll')
    const view = financeUpcoming(state)
    expect(view.timeClass).toBe('knownCommitment')
    expect(view.nextAdvanceStudioRevenue).toBe(expectedWeeklyRunRevenue(state))
    expect(view.remainingStudioRevenue).toBe(pipelineRunRevenue(state))
    expect(view.windows.every(w => w.rows.every(r => !r.kind.toLowerCase().includes('receipt')))).toBe(true)
    expect(JSON.stringify(view)).not.toMatch(/weeklyGross|paymentOrdinal|totalPayments|theatricalReceipt|rngState/)
  })
  it('dates only an actually committed Set repair and adds no completion debit or new recurring cost', () => {
    const ready=fixture('s13-p11-release-ready','p11-core-v3')
    const state=tick(applyActions(ready,[{kind:'commitPictureToRelease',productionId:'prod-0044'}]))
    const set=state.sets.find(s=>s.status==='standing'&&s.condition<TUNING.SET_CONDITION_INITIAL)!
    expect(set).toBeDefined()
    expect(financeUpcoming(state).windows[0].rows.some(r=>r.id.startsWith(`set-completion:${set.id}:`))).toBe(false)
    const repaired=applyActions(state,[{kind:'repairSet',setId:set.id}])
    expect(repaired.studio.cash).toBe(state.studio.cash-TUNING.SET_REPAIR_COST)
    expect(financeUpcoming(repaired).windows[0].rows.find(r=>r.kind==='setCompletion')).toMatchObject({
      week:state.market.tick+TUNING.SET_REPAIR_WEEKS,label:expect.stringContaining('repair completes'),weeklyOperatingCostChange:null })
    let complete=repaired
    for(let n=0;n<TUNING.SET_REPAIR_WEEKS;n++)complete=tick(complete)
    expect(complete.sets.find(s=>s.id===set.id)?.status).toBe('standing')
    expect(complete.ledger.slice(repaired.ledger.length).some(e=>e.kind==='setMaintenance')).toBe(false)
    expect(weeklyBurn(complete)).toBe(weeklyBurn(state))
  })
  for (const verb of ['renew', 'release'] as const) it(`${verb}: exact pennies/guarantees and recurring costs agree with the real committed successor`, () => {
    let state = fixture('s6-p11-positive-long-payroll')
    if (verb === 'renew') {
      const opens = Math.min(...state.contracts.map(c => c.endWeekExclusive)) - 12
      while (state.market.tick < opens) state = tick(state)
    }
    const c = [...state.contracts].sort((a,b)=>a.endWeekExclusive-b.endWeekExclusive)[0]!
    const session = new BridgeSession(state, `ready-${verb}`)
    const before = stableStringify(session.exportRuntimeCheckpoint())
    const quote = contractQuote(session, { verb, talentId: c.talentId, termWeeks: verb === 'renew' ? 104 : null })
    expect(quote.ok).toBe(true)
    expect(stableStringify(session.exportRuntimeCheckpoint())).toBe(before)
    const financial = quote.financial!
    expect(financial.cashBefore).toBe(state.studio.cash)
    expect(financial.cashAfter).toBe(state.studio.cash - quote.cost)
    expect(submit(session, quote.intentId).accepted).toBe(true)
    expect(session.gameState.studio.cash).toBe(financial.cashAfter)
    expect(weeklyBurn(session.gameState)).toBe(financial.weeklyOperatingCostAfter)
    expect(weeklyPayroll(session.gameState)-weeklyPayroll(state)).toBe(financial.weeklyPayrollChange)
    expect(financial.guaranteesAfter).toBeGreaterThanOrEqual(0)
    expect(session.gameState.ledger.slice(state.ledger.length)).toHaveLength(1)
  })
  it('a refused renewal has no financial successor and cannot become a commit', () => {
    const state = fixture('s6-p11-positive-long-payroll'),session = new BridgeSession(state, 'ready-refusal')
    const q = contractQuote(session, { verb: 'renew', talentId: state.contracts[0]!.talentId, termWeeks: 104 })
    expect(q.ok).toBe(false);expect(q.financial).toBeNull()
    expect(submit(session,q.intentId).accepted).toBe(false)
    expect(session.gameState).toBe(state)
  })
  it('release remains legal when the actual termination payment takes already-negative Cash further down', () => {
    // Accepted test-only cash/ledger boundary helper; not a public/native fixture.
    const state=withCash(fixture('s14-p11-renewal-window','p11-core-v3'),-1),session=new BridgeSession(state,'ready-negative-release')
    expect(state.studio.cash).toBeLessThan(0)
    const q=contractQuote(session,{verb:'release',talentId:state.contracts[0]!.talentId,termWeeks:null})
    expect(q.ok).toBe(true);expect(q.affordable).toBe(false)
    expect(q.financial!.cashAfter).toBeLessThan(state.studio.cash)
    expect(submit(session,q.intentId).accepted).toBe(true)
    expect(session.gameState.studio.cash).toBe(q.financial!.cashAfter)
  })
  it('immediate Greenlight pays the exact quoted financial amount once and replaces the project row by its real production', () => {
    const state=fixture('s10-p11-ready-package','p11-core-v3'),session=new BridgeSession(state,'ready-immediate')
    const draft=packageDraft(state,'script-0001'),before=stableStringify(session.exportRuntimeCheckpoint())
    const response=session.quote({...envelope(session,'immediate-greenlight'),type:'quoteCasting',draft})
    if(!response.accepted)throw Error(response.message)
    expect(response.quote.startsNow).toBe(true);expect(response.quote.queues).toBe(false)
    expect(response.quote.financial!.immediateCashChange).toBeLessThan(0)
    expect(stableStringify(session.exportRuntimeCheckpoint())).toBe(before)
    expect(submit(session,response.quote.intentId).accepted).toBe(true)
    expect(session.gameState.studio.cash).toBe(response.quote.financial!.cashAfter)
    expect(weeklyBurn(session.gameState)).toBe(response.quote.financial!.weeklyOperatingCostAfter)
    const rows=financeProjection(session.gameState,peopleProjection(session.gameState)).portfolio.rows.filter(r=>r.projectId==='script-0001')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({identityKind:'production',productionId:session.gameState.studio.activeProductions.at(-1)!.id,commitmentState:'recorded'})
  })
  it('hire reads the real successor, including a new seat; preview remains observation/RNG neutral', () => {
    const state = fixture('s3-p11-ongoing-deficit'),session = new BridgeSession(state, 'ready-hire')
    const person = castingProjection(state).board!.hiringCandidates[0]!
    const draft: BridgeCastingDraftPayload = { ...emptyCasting, kind: 'signActor', projectId: null,
      signTalentId: person.talentId, signTermWeeks: person.offers[0]!.termWeeks }
    const before = stableStringify(session.exportRuntimeCheckpoint())
    const response = session.quote({ ...envelope(session,'hire-quote'),type:'quoteCasting',draft })
    if (!response.accepted) throw Error(response.message)
    const f=response.quote.financial!
    expect(stableStringify(session.exportRuntimeCheckpoint())).toBe(before)
    expect(submit(session,response.quote.intentId).accepted).toBe(true)
    expect(f.cashAfter).toBe(session.gameState.studio.cash)
    expect(f.weeklyOperatingCostAfter).toBe(weeklyBurn(session.gameState))
    expect(f.weeklyOperatingCostAfter-f.weeklyOperatingCostBefore).toBeGreaterThan(f.weeklyPayrollChange)
  })
  it('queued Greenlight pays nothing now and remains one uncommitted canonical screenplay row', () => {
    const { state, targetProjectId } = contendedGreenlightStudio('p11-ready-queued')
    const session = new BridgeSession(state, 'ready-queued')
    const draft = packageDraft(state,targetProjectId)
    const before = stableStringify(session.exportRuntimeCheckpoint())
    const response = session.quote({ ...envelope(session,'greenlight-quote'),type:'quoteCasting',draft })
    if (!response.accepted) throw Error(response.message)
    expect(response.quote.queues).toBe(true)
    expect(response.quote.totalImmediate).toBeGreaterThan(0) // old eventual package estimate
    expect(response.quote.financial).toMatchObject({ immediateCashChange:0,cashAfter:state.studio.cash,
      weeklyOperatingCostAfter:weeklyBurn(state),weeklyPayrollChange:0 })
    expect(stableStringify(session.exportRuntimeCheckpoint())).toBe(before)
    expect(submit(session,response.quote.intentId).accepted).toBe(true)
    expect(session.gameState.studio.cash).toBe(state.studio.cash)
    const rows=financeProjection(session.gameState,peopleProjection(session.gameState)).portfolio.rows
    expect(rows.filter(r=>r.projectId===targetProjectId)).toHaveLength(1)
    expect(rows.find(r=>r.projectId===targetProjectId)).toMatchObject({productionId:null,identityKind:'scriptProject',
      phase:'developmentPackage',commitmentState:'uncommitted',directCommitment:null,studioRevenueTotal:null,
      phaseLabel:expect.stringContaining('queued')})
    expect(new Set(rows.map(r=>r.id)).size).toBe(rows.length)
  })
})

describe('P11 recorded trends and full portfolio', () => {
  it('serves the actual21-film/6240-advance public diagnostic as exact unique rows and52 completed history points', () => {
    const state=fixture('s16-p11-long-portfolio','p11-core-v3'),session=new BridgeSession(state,'p11-real-scale-test')
    const before=stableStringify(session.exportRuntimeCheckpoint()),snapshot=session.snapshot()
    expect(()=>parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse,snapshot)).not.toThrow()
    const report=snapshot.snapshot.finance.finance
    expect(state.studio.releasedFilms).toHaveLength(21)
    expect(report.portfolio.rows).toHaveLength(21)
    expect(new Set(report.portfolio.rows.map(row=>row.id)).size).toBe(21)
    expect(report.portfolio.rows.filter(row=>row.commitmentState==='recorded').length).toBeGreaterThanOrEqual(19)
    expect(report.portfolio.rows.every(row=>state.studio.releasedFilms.some(film=>film.productionId===row.productionId))).toBe(true)
    expect(report.history.windows.map(window=>window.points.length)).toEqual([13,52])
    expect(report.history.windows[1]!.points.every(point=>point.complete)).toBe(true)
    expect(report.history.windows[1]!.points.at(-1)!.closingCash).toBe(state.studio.cash)
    expect(stableStringify(session.exportRuntimeCheckpoint())).toBe(before)
  })
  it('covers Development/review, Ready Casting, Production, Post and Release Ready through actual fixture action chains', () => {
    for(const [id,phase,identity,decision] of [
      ['s9-p11-development-review','developmentPackage','scriptProject',true],
      ['s10-p11-ready-package','developmentPackage','scriptProject',false],
      ['s11-p11-in-production','production','production',false],
      ['s12-p11-post-production','postReleaseReady','production',false],
      ['s13-p11-release-ready','postReleaseReady','production',true],
    ] as const){
      const state=fixture(id,'p11-core-v3'),rows=financeProjection(state,peopleProjection(state)).portfolio.rows
      const row=rows.find(r=>r.projectId==='script-0001')!
      expect(row).toMatchObject({phase,identityKind:identity,hasDecisionOrBlocker:decision})
      if(identity==='scriptProject')expect(row.routes).toContainEqual({kind:'development',targetId:'script-0001',label:'Open Development'})
      if(decision)expect(rows[0]!.id).toBe(row.id)
      expect(new Set(rows.map(r=>r.id)).size).toBe(rows.length)
      expect(row.studioRevenueReceived).toBeNull();expect(row.studioRevenueTotal).toBeNull()
      if(identity==='production')expect(row.timingWeek).toBeNull()
    }
  })
  it('keeps exact film identities, public phases and the accepted per-film economics', () => {
    const state=fixture('s7-p11-same-title-active-settled'),f=financeProjection(state,peopleProjection(state))
    expect(f.portfolio.rows.filter(r=>r.identityKind==='production')).toHaveLength(f.films.length)
    expect(f.portfolio.rows.filter(r=>r.identityKind==='scriptProject').every(r=>r.commitmentState==='uncommitted'&&r.directCommitment===null)).toBe(true)
    for (const film of f.films) {
      const row=f.portfolio.rows.find(r=>r.productionId===film.productionId)!
      expect(row.directCommitment).toBe(film.directCommitment)
      expect(row.contribution).toBe(film.contribution)
      expect(row.routes.every(r=>r.targetId===film.productionId)).toBe(true)
    }
    expect(f.portfolio.rows.filter(r=>r.title==='The Midnight Reel')).toHaveLength(2)
    expect(f.portfolio.rows.some(r=>r.phase==='inTheaters')).toBe(true)
    expect(f.portfolio.rows.some(r=>r.phase==='completed')).toBe(true)
    const legacyFilm={...f.films.find(film=>film.resultAvailable)!,releaseWeek:null}
    const legacyRow=financePortfolio(state,[legacyFilm]).rows.find(row=>row.productionId===legacyFilm.productionId)!
    expect(legacyRow.timingWeek).toBeNull()
    expect(legacyRow.timingLabel).toMatch(/^Release week not recorded; /)
    expect(legacyRow.phase).toBe(legacyFilm.status==='releasing'?'inTheaters':'completed')
  })
  it('each cost point and period comes from the exact ledger category; missing partial values stay null', () => {
    const state=fixture('s8-p11-incomplete-history')
    const history=financeHistory(state)
    for (const window of history.windows) for (const series of window.costSeries) {
      for (const point of series.points) {
        const original=window.points.find(p=>p.fromWeek===point.week)!
        const entry=original.categories.find(c=>c.kind===series.kind)
        expect(point.amount).toBe(entry?.amount??(original.complete?0:null))
      }
      expect(series.periodAmount).toBe(window.period?.categories.find(c=>c.kind===series.kind)?.amount??(window.period?.complete?0:null))
    }
    expect(history.windows[1].costSeries.some(s=>s.points.some(p=>p.amount===null))).toBe(true)
    expect(history.windows[0].points.at(-1)?.closingCash).not.toBeNull()
  })
  it('bounds a120-year recorded query to13/52 points with exact totals and no calendar-year invention', () => {
    // Synthetic query-scale fixture, not a played campaign or native/migration proof.
    const initial=generateWorld('p11-long-query')
    const ledger=Array.from({length:6240},(_,week)=>({week,kind:'publicity' as const,amount:-1,note:'Synthetic query-scale entry'}))
    const state={...initial,market:{...initial.market,tick:6240},studio:{...initial.studio,cash:initial.studio.cash-6240},ledger}
    const before=stableStringify(state),started=performance.now(),history=financeHistory(state)
    const elapsed=performance.now()-started
    expect(history.windows.map(w=>w.points.length)).toEqual([13,52])
    expect(history.windows.map(w=>w.period!.netCash)).toEqual([-13,-52])
    expect(history.windows[1].points.at(-1)!.closingCash).toBe(state.studio.cash)
    expect(history.calendarNotice).toContain('not available')
    expect(JSON.stringify(history).length).toBeLessThan(200_000)
    expect(elapsed).toBeLessThan(1000)
    expect(stableStringify(state)).toBe(before)
    console.info(JSON.stringify({kind:'p11-long-history-query-measurement',classification:'synthetic query-scale fixture; not played campaign evidence',
      weeks:6240,ledgerEntries:ledger.length,elapsedMilliseconds:elapsed,historyJsonBytes:Buffer.byteLength(JSON.stringify(history)),
      syntheticStateJsonBytes:Buffer.byteLength(before),pointCounts:history.windows.map(w=>w.points.length)}))
  })
})
