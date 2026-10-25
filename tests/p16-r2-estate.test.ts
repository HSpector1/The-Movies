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
    const { state, r03, week, running, producing, clean } = world()
    const runLot = estateHandoffFor(state, r03, week, [{ lotId: 'lot-run', subjects: [running], minimumBid: 1 }])
    expect(estate.estateHandoffRefusal(state, runLot, week)).toBe(`lotEncumbered:activeRun:${key(running)}`)
    const prodLot = estateHandoffFor(state, r03, week, [{ lotId: 'lot-prod', subjects: [producing], minimumBid: 1 }])
    expect(estate.estateHandoffRefusal(state, prodLot, week)).toBe(`lotEncumbered:activeProduction:${key(producing)}`)
    expect(() => estate.openEstate(state, runLot, week, STABLE)).toThrow(/lotEncumbered:activeRun/)
    // Pending with their reasons, they are admitted; at D they archive with every unsold right and nothing sells them.
    const ok = estateHandoffFor(state, r03, week, [{ lotId: 'lot-a', subjects: [clean[0]!], minimumBid: 1 }], ['closure-claim-1', 'closure-claim-2'])
    expect(ok.pending.map((p) => [key(p.subject), p.reason])).toContainEqual([key(running), 'activeRun'])
    expect(ok.pending.map((p) => [key(p.subject), p.reason])).toContainEqual([key(producing), 'activeProduction'])
    expect(estate.estateHandoffRefusal(state, ok, week)).toBeNull()
    const { state: opened, estate: record } = estate.openEstate(state, ok, week, STABLE)
    expect(record.claimsContext).toEqual({ priorityVersion: 'closure/v1', claimIds: ['closure-claim-1', 'closure-claim-2'] })
    expect(record.pending.map((p) => [key(p.subject), p.reason, p.status])).toContainEqual([key(running), 'activeRun', 'pending'])
    expect(rights.currentHolder(opened, running, week)).toEqual({ kind: 'holder', holderId: r03, tradeable: false, archived: false, estate: { estateId: ok.estateId, lotId: null } })
    expect(() => makeSave(opened)).not.toThrow()
    const D = ok.closesWeek
    const closed = estate.resolveEstate({ ...opened, market: { ...opened.market, tick: D } } as GameState, ok.estateId, D, STABLE)
    const after = closed.rights.estates[0]!
    expect(after.pending.every((p) => p.status === 'archived')).toBe(true)
    expect(rights.currentHolder(closed, running, D)).toMatchObject({ kind: 'holder', holderId: `estate:${r03}`, archived: true })
    expect(closed.rights.transactions.filter((t) => t.kind === 'estateSale')).toEqual([])
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
    const { state, r03, week, clean } = world()
    const base = estateHandoffFor(state, r03, week, [{ lotId: 'lot-a', subjects: [clean[0]!], minimumBid: 1 }])
    expect(estate.estateHandoffRefusal(state, { ...base, pending: base.pending.slice(1) }, week)).toBe(`dispositionMissing:${key(base.pending[0]!.subject)}`)
    expect(estate.estateHandoffRefusal(state, { ...base, pending: [...base.pending, base.pending[0]!] }, week)).toBe(`dispositionDuplicate:${key(base.pending[0]!.subject)}`)
    expect(estate.estateHandoffRefusal(state, { ...base, pending: [...base.pending, { subject: { right: 'R2', filmId: 'no-such-film' }, reason: 'notOffered' }] }, week)).toBe('pendingSubjectNotHeld:R2:no-such-film')
    expect(estate.estateHandoffRefusal(state, { ...base, pending: base.pending.map((p, i) => (i === 0 ? { ...p, reason: '' as never } : p)) }, week)).toBe('invalidPendingReason')
    expect(estate.estateHandoffRefusal(state, { ...base, claimsContext: { priorityVersion: 'closure/v1', claimIds: ['c', 'c'] } }, week)).toBe('invalidClaimsContext')
    // A lot's encumbrance references must be exactly the live licences on its subjects.
    expect(estate.estateHandoffRefusal(state, { ...base, lots: base.lots.map((l) => ({ ...l, encumbrances: ['licence:rights-licence-99'] })) }, week)).toBe('encumbranceMismatch:lot-a')
  })
})

describe('r2 F18/F37/F60: the window opens at the closure week, closes exactly at D, and needs certifiable bidders', () => {
  it('openEstate refuses outside the closure week and while the P15B readers are unbound; the validator refuses an estate still open at or after D', () => {
    const { state, r03, week, clean } = world()
    const handoff = estateHandoffFor(state, r03, week, [{ lotId: 'lot-a', subjects: [clean[0]!], minimumBid: 1 }])
    expect(estate.estateHandoffRefusal(state, handoff, week + 1)).toBe('notClosureWeek')
    expect(() => estate.openEstate(state, handoff, week)).toThrow(/conditionReadersUnbound/)
    expect(() => estate.openEstate(state, handoff, week, finance.UNBOUND_CORPORATE_CONDITION_READERS)).toThrow(/conditionReadersUnbound/)
    const opened = estate.openEstate(state, handoff, week, STABLE).state
    const save = detached(makeSave(opened))
    save.state.market.tick = handoff.closesWeek
    expect(() => rights.validateRightsRoot(save.state as unknown as Record<string, unknown>, 'r2')).toThrow(/still open at or after its close boundary/)
    expect(() => validateSaveV49(makeSave(opened))).not.toThrow()
  })
})

describe('r2 F38: an as-of read inside the window reports the lot as it stood that week', () => {
  it('a subject that archives at D reads unarchived at every earlier week of the window', () => {
    const { state, r03, week, clean } = world()
    const handoff = estateHandoffFor(state, r03, week, [{ lotId: 'lot-a', subjects: [clean[0]!], minimumBid: 1 }])
    const opened = estate.openEstate(state, handoff, week, STABLE).state
    const D = handoff.closesWeek
    const closed = estate.resolveEstate({ ...opened, market: { ...opened.market, tick: D } } as GameState, handoff.estateId, D, STABLE)
    expect(rights.currentHolder(closed, clean[0]!, D - 1)).toEqual({ kind: 'holder', holderId: r03, tradeable: false, archived: false, estate: { estateId: handoff.estateId, lotId: 'lot-a' } })
    expect(rights.currentHolder(closed, clean[0]!, D)).toMatchObject({ holderId: `estate:${r03}`, archived: true })
  })
})

describe('r2 F48: the deterministic tie-break is ascending reserved identity order, not submission order', () => {
  it('equal sealed bids resolve to the lower identity row even when the higher row bid first', () => {
    const { state, player, r01, r03, week, clean } = world()
    const film = clean.find((s) => s.right === 'R2')!
    const handoff = estateHandoffFor(state, r03, week, [{ lotId: 'lot-a', subjects: [film], minimumBid: 1 }])
    let s = estate.openEstate(state, handoff, week, STABLE).state
    s = estate.submitEstateBid(s, { estateId: handoff.estateId, lotId: 'lot-a', bidderId: r01, amount: 100_000 }, week, STABLE).state
    s = estate.submitEstateBid(s, { estateId: handoff.estateId, lotId: 'lot-a', bidderId: player, amount: 100_000 }, week, STABLE).state
    const D = handoff.closesWeek
    const closed = estate.resolveEstate({ ...s, market: { ...s.market, tick: D } } as GameState, handoff.estateId, D, STABLE)
    const bids = closed.rights.estates[0]!.bids
    expect(bids.find((b) => b.bidderId === player)!.status).toBe('won')
    expect(bids.find((b) => b.bidderId === r01)!.status).toBe('lost')
  })
})
