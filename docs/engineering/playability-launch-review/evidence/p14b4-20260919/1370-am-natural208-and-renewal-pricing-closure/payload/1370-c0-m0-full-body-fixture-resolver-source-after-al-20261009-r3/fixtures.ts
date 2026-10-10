// Source-only pure fixture producer; imported implementations are complete modules.
import assert from 'node:assert/strict'
import {p13aGeneratedStudio} from 'm0:src/harness/p13a/fixtures.ts'
import {tick} from 'm0:src/core/tick.ts'
import {m0WiringProbe} from 'm0:src/core/m0WiringProbe.ts'
import {attachPromise} from 'm0:src/core/promises.ts'
import {advanceTalentMarketWeek,caseForTalent,marketEligibility,publicPreferredTerm,
  rivalPromiseProjectCandidates,submitProposal,withdrawProposal,m0WiringTestApi} from 'm0:src/core/talentMarket.ts'
import {TUNING} from 'm0:src/core/tuning.ts'
import type {GameState} from 'm0:src/core/types.ts'
import type {WiringFixtures} from './controls/full-body-controls.js'
const SUBJECT='person-studio-aca408ec-r01-0'
const ISSUERS=['studio-aca408ec-r01','studio-aca408ec-r02','studio-aca408ec-r03']
export type Boundary={sourcePhase:'tick.before.advanceTalentMarketWeek';state:GameState}
export function generateNaturalBoundaries():{author196:Boundary;freeze208:Boundary;offWeek:Boundary}{
  const requested=[196,197,208],seen=new Map<number,Boundary>()
  // The accepted neutral contract covers weeks0..416. This prefix ends at its
  // target208;197 supplies the requested non-target without another tick.
  m0WiringProbe.end();m0WiringTestApi.reset()
  m0WiringProbe.setBoundaryConsumer(state=>{
    if(!requested.includes(state.market.tick))return
    assert.ok(!seen.has(state.market.tick),'one actual boundary per requested week')
    seen.set(state.market.tick,{sourcePhase:'tick.before.advanceTalentMarketWeek',state:structuredClone(state)})
  })
  try{
    let state=p13aGeneratedStudio('p13a-core-causal-01')
    assert.equal(state.market.tick,0)
    for(let step=1;step<=208;step++){
      state=tick(state);assert.equal(state.market.tick,step)
      m0WiringTestApi.reset() // default capture remains enabled; no accumulated prefix sink
    }
    assert.deepEqual([...seen.keys()],requested)
    return {author196:seen.get(196)!,freeze208:seen.get(208)!,offWeek:seen.get(197)!}
  }finally{m0WiringProbe.setBoundaryConsumer(null);m0WiringTestApi.reset()}
}
function reviseEmpty(state:GameState,issuer:string):GameState{
  const old=state.talentMarket.proposals.find(p=>p.talentId===SUBJECT&&p.issuerStudioId===issuer)
  // Re-submit through the real law; preserve existing terms when a proposal exists.
  return submitProposal(state,{talentId:SUBJECT,issuerStudioId:issuer,
    termWeeks:old?.termWeeks??publicPreferredTerm(state,SUBJECT),
    premiumTier:old?.premiumTier??TUNING.MARKET_PREMIUM_TIERS[0]!})
}
export function buildVariants(natural:ReturnType<typeof generateNaturalBoundaries>):WiringFixtures{
  m0WiringProbe.end();m0WiringTestApi.reset()
  try{
    // Explicit synthetic reservation variant, not a naturally reached fact.
    // The actual count evaluator stops nMax once >1000, so1001 reservations
    // make each later count-one candidate fail; real opportunity policy is intact.
    // Discovery runs inside the market body, so first obtain its legal open cases
    // with one real advance. This is labelled synthetic same-week replay, not a
    // claimed second natural196 boundary. Withdraw later issuers via real law.
    const discovered196=advanceTalentMarketWeek(structuredClone(natural.author196.state))
    let opportunity196=discovered196
    for(const issuer of ISSUERS.slice(1)){
      assert.ok(opportunity196.talentMarket.proposals.some(p=>p.talentId===SUBJECT&&p.issuerStudioId===issuer),
        'natural authoring supplied each later issuer; do not silently invent its proposal')
      opportunity196=withdrawProposal(opportunity196,SUBJECT,issuer)
    }
    opportunity196=reviseEmpty(opportunity196,ISSUERS[0]!)
    const reservation=opportunity196.talentMarket.proposals.find(p=>p.talentId===SUBJECT&&p.issuerStudioId===ISSUERS[0])!
    assert.ok(marketEligibility(opportunity196,SUBJECT,196).proposers.includes(ISSUERS[1]!))
    assert.ok(rivalPromiseProjectCandidates(opportunity196,ISSUERS[1]!).length>0,'real fallback project premise')
    assert.ok(opportunity196.talent.find(t=>t.id===SUBJECT)?.skills.acting!==undefined)
    opportunity196=attachPromise(opportunity196,SUBJECT,ISSUERS[0]!,{
      family:'APPEARANCE_COUNT',predicate:{count:1001},windowStartWeek:reservation.startWeek,
      dueWeekExclusive:reservation.startWeek+reservation.termWeeks})
    // Actual attachPromise accepts lawful-shaped IMPOSSIBLE drafts and computes
    // their receipts/digests itself. No receipt, digest or promise is fabricated.
    let opportunity208=reviseEmpty(structuredClone(natural.freeze208.state),ISSUERS[0]!)
    const proposal=opportunity208.talentMarket.proposals.find(p=>p.talentId===SUBJECT&&p.issuerStudioId===ISSUERS[0])!
    const project=rivalPromiseProjectCandidates(opportunity208,ISSUERS[0]!)[0]
    assert.ok(project,'real named script project premise')
    opportunity208=attachPromise(opportunity208,SUBJECT,ISSUERS[0]!,{
      family:'SPECIFIC_PROJECT',predicate:{kind:'projectOpportunity',count:1,seatClass:'allCast',scriptProjectId:project.id},
      windowStartWeek:proposal.startWeek,dueWeekExclusive:proposal.startWeek+proposal.termWeeks})
    const state=structuredClone(discovered196),h=state.hollywood!
    assert.ok(h)
    const target=caseForTalent(state,SUBJECT,196);assert.ok(target)
    const business=h.businesses.find(b=>b.studioId===ISSUERS[0]);assert.ok(business)
    const other=state.talentMarket.cases.find(c=>c.talentId!==SUBJECT&&c.outcome===null)
    assert.ok(other&&state.talent.some(t=>t.id===other.talentId),'real open off-subject case/person premise')
    const otherView=caseForTalent(state,other.talentId,196);assert.ok(otherView)
    // If no fourth rival exists, use an explicitly synthetic business parameter:
    // clone real business fields and substitute the actual entered player ID.
    // The trigger reads studioId only from this parameter; no world row is added.
    const fourth=h.businesses.find(b=>!ISSUERS.includes(b.studioId))??{
      ...structuredClone(business),studioId:h.playerStudioId,entryKey:`${h.playerStudioId}:entry`}
    assert.ok(h.identities.some(i=>i.studioId===fourth.studioId&&i.enteredWeek!==null),
      'actual entered fourth identity; no invented studio identity')
    return {...natural,
      opportunity196:{sourcePhase:'synthetic.valid-market-state',state:opportunity196},
      opportunity208:{sourcePhase:'synthetic.valid-market-state',state:opportunity208},
      offSubject:{state,business:structuredClone(business),descriptor:{talentId:other.talentId,
        subjectStudioId:other.subjectStudioId,decisionWeek:otherView.decisionWeek}},
      offIssuer196:{state:structuredClone(state),business:structuredClone(fourth),
        descriptor:{talentId:SUBJECT,subjectStudioId:target.subjectStudioId,decisionWeek:target.decisionWeek}}}
  }finally{m0WiringTestApi.reset()}
}
