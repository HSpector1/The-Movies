// Proposed NEW tests/p15b4-player-proposal-transaction.test.ts. Disclosed condition/finance UNIT input,
// real proposal producer + ordinary closure tick; not a natural campaign, original joint RED retained.
import { it, expect } from 'vitest'
import { assertProposalFamily } from './helpers/p15b-pending-family-assertions.js'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { makeSave, stableStringify, migrateToLive, validateSaveV28 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { caseForTalent, marketEligibility, proposalDraft, submitProposal } from '../src/core/talentMarket.js'
import { P15_PHASE_TABLES, P15_PHASE_ORDER_VERSION } from '../src/core/p15Phases.js'
import { drainPlayer } from './helpers/p15b-live.js'
it('real retained week45 player proposal withdraws before own-case invalidation and linked ended publication',()=>{
 const gz=readFileSync(new URL('./fixtures/p14/legacy-v28-open-case-45.json.gz',import.meta.url))
 expect(createHash('sha256').update(gz).digest('hex')).toBe('8ae5943ef5f647e5257632a501060a1cfa27a47b7f41b596190c67de2fefc78d')
 const raw=gunzipSync(gz)
 expect(createHash('sha256').update(raw).digest('hex')).toBe('c9ff26fe70b7216784bf5718ed26d2bef10df8ca836b05050f5e1d7bcaac8afd')
 const parsed=JSON.parse(raw.toString()),rawBytes=stableStringify(parsed)
 validateSaveV28(parsed);let state=migrateToLive(parsed).state;makeSave(state)
 expect(stableStringify(parsed)).toBe(rawBytes)
 const initial=state,initialBytes=stableStringify(initial),week=45,issuer='studio-aca408ec-player',talentId='t-act-09'
 expect(state.market.tick).toBe(week)
 expect(caseForTalent(state,talentId)).toMatchObject({status:'proposals_open',decisionWeek:52})
 expect(marketEligibility(state,talentId).proposers).toContain(issuer)
 const quote=proposalDraft(state,issuer,talentId,52,1.25)
 expect(quote.signingBonus).toBeGreaterThan(0)
 const before=stableStringify(state)
 state=submitProposal(state,{talentId,issuerStudioId:issuer,termWeeks:52,premiumTier:1.25});makeSave(state)
 expect(stableStringify(initial)).toBe(before)
 const proposal=state.talentMarket.proposals.find(p=>p.issuerStudioId===issuer&&p.talentId===talentId)!
 expect(proposal.digest).toBe(quote.digest)
 expect(state.talentMarket.receipts.some(r=>r.kind==='proposalSubmitted'&&r.studioId===issuer&&r.talentId===talentId&&r.week===week)).toBe(true)
 // Explicit synthetic history on genuine observed week45. Same rules as existing
 // forgedConditionRoot130; new premise dates derived here, NEVER retimed source rows.
 expect(state.p15Sequence.next).toBe(1)
 expect(state.corporateCondition.events).toHaveLength(0);expect(state.corporateCondition.loans).toHaveLength(0)
 const phase=P15_PHASE_TABLES[P15_PHASE_ORDER_VERSION]!.find(p=>p.phaseId==='p15b.condition')!
 const triple={phaseId:'p15b.condition',phaseOrdinal:phase.phaseOrdinal,phaseOrderVersion:P15_PHASE_ORDER_VERSION}
 const studios:typeof state.corporateCondition.studios=state.hollywood!.identities.filter(i=>i.enteredWeek!==null).map(i=>i.studioId).sort().map(studioId=>({studioId,
  firstEvaluatedWeek:week-31,definitionVersion:'corporate-condition/v1',condition:studioId===issuer
   ? {stage:'distress' as const,since:week-24,week,lowRun:32,negativeRun:32,clearRun:0,distressWeeks:25}
   : {stage:'stable' as const,since:week-31,week,lowRun:0,negativeRun:0,clearRun:32,distressWeeks:0}}))
 state={...state,corporateCondition:{version:1,recordedFromWeek:week-32,nextEvent:3,nextLoan:1,studios,loans:[],events:[
  {eventId:'corporate-event-1',studioId:issuer,week:week-28,from:'stable',to:'warning',causes:[{code:'LOW_COVER',weeks:4},{code:'NEGATIVE_CASH',weeks:4}],definitionVersion:'corporate-condition/v1',p15DomainSequence:1,...triple},
  {eventId:'corporate-event-2',studioId:issuer,week:week-24,from:'warning',to:'distress',causes:[{code:'NEGATIVE_CASH',weeks:8},{code:'LOW_COVER',weeks:8}],definitionVersion:'corporate-condition/v1',p15DomainSequence:2,...triple},
 ]},p15Sequence:{version:1,next:3}}
 const amount=Math.floor(state.studio.cash)+1
 // Existing conserved publicity-debit UNIT constructor, not fabricated income.
 const beforeDrain=state,drainInputBytes=stableStringify(beforeDrain),cashBefore=state.studio.cash
 state=drainPlayer(state,amount);makeSave(state)
 expect(stableStringify(beforeDrain)).toBe(drainInputBytes)
 expect(state.studio.cash).toBe(cashBefore-amount)
 expect(state.ledger.at(-1)).toMatchObject({kind:'publicity',amount:-amount,week})
 const input=state,inputBytes=stableStringify(input)
 const closed=tick(input);makeSave(closed)
 expect(stableStringify(input)).toBe(inputBytes)
 expect(stableStringify(initial)).toBe(initialBytes);expect(stableStringify(parsed)).toBe(rawBytes)
 const closure=closed.studioClosure.closures.find(c=>c.studioId===issuer)!
 expect(closure).toBeDefined();expect(closure.closureWeek).toBe(week+1)
 expect(closed.corporateCondition.events.find(e=>e.eventId===closure.causeEventId)).toMatchObject({studioId:issuer,week:week+1,to:'closed'})
 expect(closure.dispositions.filter(d=>d.subjectKind==='proposal'&&d.subjectId===issuer+':proposal:'+talentId)).toMatchObject([{status:'applied'}])
 expect(closed.talentMarket.proposals.some(p=>p.issuerStudioId===issuer)).toBe(false)
 expect(closed.talentMarket.receipts.filter(r=>r.kind==='proposalWithdrawn'&&r.studioId===issuer&&r.talentId===talentId&&r.week===week+1)).toHaveLength(1)
 expect(closed.talentMarket.cases.find(c=>c.talentId===talentId&&c.outcome==='invalidated')).toMatchObject({closedWeek:week+1,subjectStudioId:issuer})
 expect(closed.campaignLegacy.endOfRun).toMatchObject({closureId:closure.closureId,boundaryWeek:week+2})
 expect(closure.endOfRun).toBe(closed.campaignLegacy.endOfRun!.legacySnapshotId)
 assertProposalFamily(closed,issuer,talentId)
 // No budget override: original core5s remains separate from constructed-unit authority.
})
