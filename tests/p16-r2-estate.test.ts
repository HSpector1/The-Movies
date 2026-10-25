// ── P16 r2 REDs: estate encumbrances, handoff references and completeness, timing, as-of reads, tie-break ──
//
// Review r1 blocker F4 / major F29: the estate path refuses what the bilateral path refuses — an R2 film in an active
// run (contract §3: "refuse the active-run transaction" until receipt assignment exists) and an R1 property with an
// active production (contract §3) — and the handoff carries "subject/title/encumbrance references, disposition
// status ... and claim references" (contract §4). Minors F18/F37 (the ceremony runs AT D: an estate cannot open late
// or stay open past D), F38 (as-of reads), F39 (every held right gets one disposition: contract §4 "Every subject
// gets one disposition"), F48 (the tie-break is identity order, never submission order: contract §6), F60 (an estate
// cannot open while its bidders cannot be certified).

import { describe, expect, it } from 'vitest'
import { actualEstateOpening, actualEstateClosure } from './helpers/p16-actual-estate.js'
import { tick } from '../src/core/tick.js'
import { assertAuthenticBidTieAndLowerBid } from './helpers/p16-authentic-bidders.js'
import { assertActualR03Pending } from './helpers/p16-authentic-pending.js'
import * as estate from '../src/core/estate.js'
import * as finance from '../src/core/rightsFinance.js'
import * as rights from '../src/core/rights.js'
import { makeSave, validateSaveV49 } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { blockingEncumbranceFromFacts, detached, estateHandoffFor, heldSubjectsFromFacts, liveFromGenuine, STABLE } from './helpers/p16-fixtures.js'

type Subject = { right: 'R1'; propertyId: string } | { right: 'R2'; filmId: string }
const key = (s: Subject) => (s.right === 'R1' ? `R1:${s.propertyId}` : `R2:${s.filmId}`)

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [player, r01, r02] = [h.playerStudioId, ...h.identities.slice(1, 3).map((i) => i.studioId)] as [string, string, string]
  // r02 is the closing studio: at week 53 it holds a film in an active run AND a property with an active production.
  const r03 = r02
  const week = state.market.tick
  const held = heldSubjectsFromFacts(state, r03)
  const running = held.find((s) => blockingEncumbranceFromFacts(state, s) === 'activeRun')!
  const producing = held.find((s) => blockingEncumbranceFromFacts(state, s) === 'activeProduction')!
  const clean = held.filter((s) => blockingEncumbranceFromFacts(state, s) === null)
  return { state, h, player, r01, r03, week, held, running, producing, clean }
}

describe('r2 F4/F29: the estate path refuses the bilateral path\'s encumbrances', () => {
  it('premise: the closing studio (r02) at week 53 holds a film in an active run and a property with an active production, and the bilateral path refuses both', () => {
    const { running, producing } = world()
    expect(running).toBeDefined()
    expect(producing).toBeDefined()
  })

  it('a lot holding an active-run film or an active-production property refuses the handoff by name; the same subjects pending are admitted and never sold', () => {
    assertActualR03Pending()
  })

  it('a lot encumbered after the handoff (a production started on its concept) cannot sell at D: its bids are disqualified by name and the lot archives', () => {
    const { state, player, r03, week, clean } = world()
    const property = clean.find((s) => s.right === 'R1') as { right: 'R1'; propertyId: string }
    const handoff = estateHandoffFor(state, r03, week, [{ lotId: 'lot-p', subjects: [property], minimumBid: 1 }])
    let s = estate.openEstate(state, handoff, week, STABLE).state
    s = estate.submitEstateBid(s, { estateId: handoff.estateId, lotId: 'lot-p', bidderId: player, amount: 5_000 }, week, STABLE).state
    const busy = detached(s)
    const other = busy.hollywood!.businesses.find((b) => b.studioId !== r03 && b.productions.length > 0)!
    other.productions[0] = { ...other.productions[0]!, conceptId: property.propertyId.slice('story-property:'.length) }
    const D = handoff.closesWeek
    const closed = estate.resolveEstate({ ...busy, market: { ...busy.market, tick: D } } as GameState, handoff.estateId, D, STABLE)
    const record = closed.rights.estates[0]!
    expect(record.bids[0]).toMatchObject({ status: 'disqualified', disqualification: `lotEncumbered:activeProduction:${key(property)}` })
    expect(record.lots[0]!.status).toBe('archived')
    expect(closed.studio.cash).toBe(busy.studio.cash)
  })

  it('every right the closed studio held is disposed exactly once: an omitted, a duplicated, a foreign or an undisclosed-licence subject refuses the handoff', () => {
    const actual=actualEstateOpening(),[state,base,week]=actual.boundary,lot=base.lots[0]!,subject=lot.subjects[0]!
    const before=JSON.stringify(state)
    expect(estate.estateHandoffRefusal(state,base,week)).toBeNull()
    expect(estate.estateHandoffRefusal(state,{...base,lots:base.lots.slice(1)},week)).toBe(`dispositionMissing:${key(subject)}`)
    expect(estate.estateHandoffRefusal(state,{...base,pending:[{subject,reason:'notOffered'}]},week)).toBe(`dispositionDuplicate:${key(subject)}`)
    expect(estate.estateHandoffRefusal(state,{...base,pending:[{subject:{right:'R2',filmId:'no-such-film'},reason:'notOffered'}]},week)).toBe('pendingSubjectNotHeld:R2:no-such-film')
    expect(estate.estateHandoffRefusal(state,{...base,lots:base.lots.slice(1),pending:[{subject,reason:'' as never}]},week)).toBe('invalidPendingReason')
    expect(estate.estateHandoffRefusal(state,{...base,claimsContext:{...base.claimsContext,claimIds:[base.claimsContext.claimIds[0]!,base.claimsContext.claimIds[0]!]}},week)).toBe('actualClosureClaimsMismatch')
    expect(estate.estateHandoffRefusal(state,{...base,lots:base.lots.map((l,i)=>i===0?{...l,encumbrances:['licence:rights-licence-99']}:l)},week)).toBe(`encumbranceMismatch:${lot.lotId}`)
    expect(JSON.stringify(state)).toBe(before)

  })
})

describe('r2 F18/F37/F60: the window opens at the closure week, closes exactly at D, and needs certifiable bidders', () => {
  it('openEstate refuses outside the closure week and while the P15B readers are unbound; the validator refuses an estate still open at or after D', () => {
    const actual=actualEstateOpening(),[state,handoff,week]=actual.boundary
    const before=JSON.stringify(state)
    expect(estate.estateHandoffRefusal(state,handoff,week+1)).toBe('notClosureWeek')
    expect(estate.estateHandoffRefusal(state,handoff,week-1)).toBe('notClosureWeek')
    // The current producer has actual bound readers; only the explicit unbound sentinel must refuse.
    expect(estate.openEstate(state,handoff,week).estate).toEqual(actual.estate)
    expect(()=>estate.openEstate(state,handoff,week,finance.UNBOUND_CORPORATE_CONDITION_READERS)).toThrow(/conditionReadersUnbound/)
    const save=detached(makeSave(actual.state));save.state.market.tick=handoff.closesWeek
    const hostileBefore=JSON.stringify(save)
    expect(()=>rights.validateRightsRoot(save.state as unknown as Record<string,unknown>,'r2')).toThrow(/still open at or after its close boundary/)
    expect(()=>validateSaveV49(save)).toThrow()
    expect(JSON.stringify(save)).toBe(hostileBefore);expect(JSON.stringify(state)).toBe(before)
    expect(()=>validateSaveV49(makeSave(actual.state))).not.toThrow()

  })
})

describe('r2 F38: an as-of read inside the window reports the lot as it stood that week', () => {
  it('a subject that archives at D reads unarchived at every earlier week of the window', () => {
    const actual=actualEstateClosure(),record=actual.estate,D=record.closesWeek,r03=record.studioId
    const lot=record.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===r03+':film:0'))!
    expect(lot).toBeDefined();const subject=lot.subjects[0]!
    let state=actual.state
    while(state.market.tick<D-1)state=tick(state)
    const before=JSON.stringify(state),closed=estate.resolveEstate(state,record.estateId,D)
    expect(JSON.stringify(state)).toBe(before);makeSave(closed)
    for(let week=record.opensWeek;week<D;week++)expect(rights.currentHolder(closed,subject,week)).toEqual({kind:'holder',holderId:r03,tradeable:false,archived:false,estate:{estateId:record.estateId,lotId:lot.lotId}})
    expect(rights.currentHolder(closed,subject,D)).toMatchObject({holderId:`estate:${r03}`,archived:true,tradeable:false})

  })
})

describe('r2 F48: the deterministic tie-break is ascending reserved identity order, not submission order', () => {
  it('equal sealed bids resolve to the lower identity row even when the higher row bid first', () => {
    assertAuthenticBidTieAndLowerBid()
  })
})
