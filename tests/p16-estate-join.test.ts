// Estate join initial REDs: current49 actual transaction and genuine48 migration.
// Existing drained R04 control is a disclosed transaction fixture, not natural campaign proof.
// Core default5s unchanged. Captured48 prerequisite is separate from semantic RED.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { convertV48ToV49, makeSave, migrateToV48, stableStringify, validateSaveP15B } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { permittedBidderRefusal, type CorporateConditionReaders } from '../src/core/rightsFinance.js'
import type { GameState } from '../src/core/types.js'
import type { EstateRecord } from '../src/core/rights.js'
import { closureOf, claimsOf, R04 } from './helpers/p15b-live.js'
import { genuineV45Envelope } from './helpers/p16-fixtures.js'

type Origin = {kind:'closure49';closureId:string} | {kind:'observed48';observedAtWeek:number;closureId:string;closureSequence:number;archivalEventId:string|null;classification:'observedCurrent'}
type JoinedEstate = EstateRecord & {origin:Origin}
let currentBoundary: {prior:GameState;closed:GameState} | undefined
function actualClosure() {
  if (currentBoundary===undefined) {
    const path=process.env.P16_JOIN_PREC48_PATH, sha=process.env.P16_JOIN_PREC48_SHA256
    expect(path,'producer prerequisite: bind original publicSave48 pre-C162 capture').toBeTruthy()
    expect(sha,'producer prerequisite: hash-pin original48 pre-C162 capture').toMatch(/^[a-f0-9]{64}$/)
    const bytes=readFileSync(path!), raw=JSON.parse(bytes.toString())
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(sha)
    expect(raw.saveVersion).toBe(48);expect(raw.state.market.tick).toBe(162)
    const rawBefore=stableStringify(raw), predecessor=validateSaveP15B(raw)
    expect(predecessor.state.studioClosure.closures.some(c=>c.studioId===R04)).toBe(false)
    const oldBefore=stableStringify(predecessor), migrated=convertV48ToV49(predecessor)
    expect(stableStringify(raw)).toBe(rawBefore);expect(stableStringify(predecessor)).toBe(oldBefore)
    const prior=migrated.state
    expect(prior.market.tick).toBe(162);makeSave(prior)
    const before=stableStringify(prior)
    let closed:GameState
    // Tested current49 public action: current transaction-reader refusal is semantic RED,
    // not a failed historical fixture or a substituted successful validator.
    try { closed=tick(prior) }
    finally { expect(stableStringify(prior)).toBe(before) }
    expect(closed.market.tick).toBe(163);makeSave(closed)
    currentBoundary={prior,closed}
  }
  const {prior,closed}=currentBoundary
  const closure=closureOf(closed,R04)
  expect(closure).toBeDefined();expect(closure!.closureWeek).toBe(163)
  return {prior,closed,closure:closure!}
}
function estateOf(state:GameState,closureId:string):JoinedEstate {
  const found=state.rights.estates.find(e=>e.closureId===closureId)
  expect(found,'semantic RED: actual closure must publish its joined typed estate').toBeDefined()
  return found as JoinedEstate
}
function expectCapturedFilms(estate:JoinedEstate,closure:ReturnType<typeof actualClosure>['closure']) {
  const expected=closure.estate.lots.map(l=>l.subjectId)
  expect(expected).toHaveLength(10);expect(new Set(expected).size).toBe(10)
  const observed=[...estate.lots.flatMap(l=>l.subjects),...estate.pending.map(p=>p.subject)]
    .filter(s=>s.right==='R2').map(s=>s.filmId)
  expect(observed).toHaveLength(10);expect(new Set(observed).size).toBe(10)
  expect([...observed].sort()).toEqual([...expected].sort())
}
function refusalPure(state:GameState,pattern:RegExp) {
  const before=stableStringify(state)
  try { expect(()=>makeSave(state)).toThrow(pattern) }
  finally { expect(stableStringify(state)).toBe(before) }
}
describe('P16 joined estate actual-source boundaries',()=>{
  it('actual49 closure atomically publishes matching handoff once without changing the caller',()=>{
    const {prior,closed,closure}=actualClosure(), before=stableStringify(prior)
    const replay=tick(prior)
    expect(stableStringify(prior)).toBe(before)
    expect(stableStringify(makeSave(replay))).toBe(stableStringify(makeSave(closed)))
    const estate=estateOf(closed,closure.closureId)
    expect(estate.origin).toEqual({kind:'closure49',closureId:closure.closureId})
    expect(estate).toMatchObject({studioId:R04,closureWeek:163,opensWeek:163,closesWeek:176,closedWeek:null})
    expect(estate.cashReconciliation).toEqual({terminalCash:closure.cash.closing,loanRemainder:closure.loan?.remainder??0})
    expect(closure.lawVersion).toBe('closure/v2') // ASTRA Sprint 23: new closures carry the live law; the estate figures are v1's
    const expectedClaims=[...claimsOf(closed,closure.closureId)].sort((a,b)=>
      a.sourceContractId<b.sourceContractId?-1:a.sourceContractId>b.sourceContractId?1:a.claimId<b.claimId?-1:a.claimId>b.claimId?1:0)
    expect(expectedClaims).toHaveLength(6)
    expectCapturedFilms(estate,closure)
    expect(estate.claimsContext.priorityVersion).toBe(closure.lawVersion)
    expect(estate.claimsContext.claimIds).toEqual(expectedClaims.map(c=>c.claimId))
    expect(closed.rights.estates.filter(e=>e.closureId===closure.closureId)).toHaveLength(1)
    expect(estate.proceeds).toEqual([]);expect(estate.bids).toEqual([])
  })
  it('genuine normal48 migration admits without manufacturing actual closure or estate history',()=>{
    const original=genuineV45Envelope('week53'), before=stableStringify(original)
    const predecessor=migrateToV48(original as Parameters<typeof migrateToV48>[0])
    validateSaveP15B(predecessor)
    const old=stableStringify(predecessor), next=convertV48ToV49(predecessor)
    expect(stableStringify(original)).toBe(before);expect(stableStringify(predecessor)).toBe(old)
    makeSave(next.state)
    expect(next.state.studioClosure).toEqual(predecessor.state.studioClosure)
    expect(next.state.rights.estates).toEqual([])
    expect(next.state.rights.titleEvents).toEqual([]);expect(next.state.rights.transactions).toEqual([])
  })
  it('genuine public48 liveclosure migration observes authentic provenance without retroactive49 events',()=>{
    const path=process.env.P16_JOIN_CLOSED48_PATH, sha=process.env.P16_JOIN_CLOSED48_SHA256
    expect(path,'producer prerequisite: bind exact originalSave48 closure163 public capture').toBeTruthy()
    expect(sha,'producer prerequisite: hash-pin exact original48 capture').toMatch(/^[a-f0-9]{64}$/)
    const bytes=readFileSync(path!),raw=JSON.parse(bytes.toString())
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(sha)
    expect(raw.saveVersion).toBe(48);expect(raw.state.market.tick).toBe(163)
    const before=stableStringify(raw), predecessor=validateSaveP15B(raw)
    const closure=predecessor.state.studioClosure.closures.find(c=>c.studioId===R04)
    expect(closure).toBeDefined();expect(closure!.closureWeek).toBe(163)
    expect(predecessor.state.studioClosure.estateEvents.some(e=>e.closureId===closure!.closureId&&e.kind==='archival')).toBe(false)
    const next=convertV48ToV49(predecessor)
    expect(stableStringify(raw)).toBe(before);makeSave(next.state)
    const estate=estateOf(next.state,closure!.closureId)
    expect(estate.origin).toEqual({kind:'observed48',observedAtWeek:163,closureId:closure!.closureId,closureSequence:closure!.p15DomainSequence,archivalEventId:null,classification:'observedCurrent'})
    expect(estate).toMatchObject({closureWeek:163,opensWeek:163,closesWeek:176,closedWeek:null})
    expectCapturedFilms(estate,closure!)
    const expectedClaims=predecessor.state.studioClosure.claims.filter(c=>c.closureId===closure!.closureId).sort((a,b)=>
      a.sourceContractId<b.sourceContractId?-1:a.sourceContractId>b.sourceContractId?1:a.claimId<b.claimId?-1:a.claimId>b.claimId?1:0)
    expect(expectedClaims).toHaveLength(6)
    expect(estate.claimsContext).toEqual({priorityVersion:closure!.lawVersion,claimIds:expectedClaims.map(c=>c.claimId)})
    expect(next.state.studioClosure).toEqual(predecessor.state.studioClosure)
    expect(next.state.campaignLegacy).toEqual(predecessor.state.campaignLegacy)
    expect(next.state.rights.titleEvents).toEqual([]);expect(next.state.rights.transactions).toEqual([])
    expect(estate.proceeds).toEqual([]);expect(estate.bids).toEqual([])
  })
  it('current49 handoff cannot masquerade as observed48 or borrow foreign claim authority',()=>{
    const {closed,closure}=actualClosure(), before=stableStringify(closed)
    try {
    const original=estateOf(closed,closure.closureId)
    const disguised=JSON.parse(stableStringify(closed)) as GameState
    const estate=estateOf(disguised,closure.closureId)
    estate.origin={kind:'observed48',observedAtWeek:closed.market.tick,closureId:closure.closureId,closureSequence:closure.p15DomainSequence,archivalEventId:null,classification:'observedCurrent'}
    refusalPure(disguised,/estate|provenance|observation/i)
    const foreign=JSON.parse(stableStringify(closed)) as GameState
    estateOf(foreign,closure.closureId).claimsContext.claimIds=[...original.claimsContext.claimIds,'claim-not-from-this-closure']
    refusalPure(foreign,/estate|claim/i)
    } finally { expect(stableStringify(closed)).toBe(before) }
  })
  it('actual terminal bidder refuses with retained business and even a labelled stale-stable reader',()=>{
    const {closed}=actualClosure(), before=stableStringify(closed)
    expect(closed.hollywood!.businesses.some(b=>b.studioId===R04)).toBe(true)
    expect(permittedBidderRefusal(closed,R04,closed.market.tick)).toBe('terminal')
    // Pure predicate hostile-reader control only: no saved root, cash or condition is altered.
    const stale:CorporateConditionReaders={conditionRecord:()=>({condition:{stage:'stable'}}),outstandingLoan:()=>undefined}
    expect(permittedBidderRefusal(closed,R04,closed.market.tick,stale)).toBe('terminal')
    // Independently constructed predicate input ONLY: remove the estate-presence shortcut.
    // Retain real closure/condition/business facts; no full-save, export or reachability claim.
    const withoutEstates=JSON.parse(stableStringify(closed)) as GameState
    withoutEstates.rights.estates=[]
    const predicateBefore=stableStringify(withoutEstates)
    expect(permittedBidderRefusal(withoutEstates,R04,withoutEstates.market.tick,stale)).toBe('terminal')
    expect(stableStringify(withoutEstates)).toBe(predicateBefore)
    expect(stableStringify(closed)).toBe(before)
  })
})
