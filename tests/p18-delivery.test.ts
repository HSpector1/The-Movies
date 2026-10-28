// ── P18 Sprint 13 slice 1: delivery, the distribution window, cancellation and settlement (contract §5-§7) ─────
//
// The Sprint 12 season route, then the engine's own verbs and `tick`. Disclosed shortcuts, each one ledger row so the
// money still reconciles: `drain` (a publicity row, the P17 cameo route's drain) to make cash the stall cause, and
// P14B.2's `fund` bootstrap to restore it. The closure handoff runs both directly and on a natural route (FIX-S13A-1:
// a distressed studio funded to the quote commissions, and the condition closes it inside the season's 20 weeks), and
// the 52-week expiry runs both on the producer's own function and as a 52-tick walk.
//
// RED at 31fdb366 by assertion: the season stays live after its twelfth unit and at C + 20, the two new actions are
// unknown kinds (caught and compared), the settlement module is absent (a dynamic import returns null) and the expiry
// and window readers are absent (namespace members compared).
//
// FIX-S13A-1 (REVIEW-S13A): the natural walk is built once and shared (item 14); the window reader requires the P16
// permission (item 5); the live-past-final, slot-at-delivery, missing-delivered-week, forged-status, duplicate and
// excess payment rules (items 1, 7-10) are RED at the slice B commit by assertion; the natural closure route, the
// part-paid settlement across the refund/charge split, the forgeries, the expiry tick and the sequential-seasons
// round-trip (items 3, 6) are coverage of laws that already hold there.

import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds } from '../src/core/employment.js'
import { occupiedResourceSlots } from '../src/core/occupancy.js'
import * as saves from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import * as tvCommissionModule from '../src/core/tvCommission.js'
import { tvAdmissionQuote } from '../src/core/tvCommission.js'
import * as tvReaders from '../src/core/tvReaders.js'
import { validateP18Roots } from '../src/core/tvSave.js'
import { settleTvObligations } from '../src/core/tvSettlement.js'
import * as tvSeasonModule from '../src/core/tvSeason.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, GameState } from '../src/core/types.js'
import { detached } from './helpers/p16-fixtures.js'
import { fund } from './helpers/p14b2-fixtures.js'
import { closuresOf } from './helpers/p17-cameo-route.js'
import {
  FIGURES, agreement, attempt, commissioned, greenlightWith, request, rosterIds, season, seasonRoute, television, tvRows, withCash, type SeasonRoute, type TelevisionLocal,
} from './helpers/p18-route.js'

const LATE_PER_WEEK = 12_000
const LATE_MAX = 48_000
const CHARGE = 120_000

let route: SeasonRoute
beforeAll(() => { route = seasonRoute() }, 240_000)

// FIX-S13A-1 item 14: the natural commission-to-delivery walk, built once for every describe that reads it.
let naturalWeeks: GameState[] = []
beforeAll(() => {
  const result = attempt(route.state, request(route))
  if (result.error !== undefined) return
  naturalWeeks = walk(result.state, 22)
}, 300_000)

/** The P17 cameo route's disclosed drain: one publicity row of exactly the amount, so the money reconciles. */
function drain(state: GameState, amount: number): GameState {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('drain: amount must be a positive integer')
  return { ...state, studio: { ...state.studio, cash: state.studio.cash - amount },
    ledger: [...state.ledger, { week: state.market.tick, kind: 'publicity', amount: -amount, note: 'p18 delivery test drain' }] }
}
const drainTo = (state: GameState, cash: number): GameState => drain(state, Math.ceil(state.studio.cash) - cash)

/** One public action, or its refusal text; the input is never written. */
function act(state: GameState, action: Record<string, unknown>): { state: GameState; error?: undefined } | { state?: undefined; error: string } {
  try { return { state: applyActions(state, [action as unknown as Action]) } } catch (error) { return { error: (error as Error).message } }
}
const receipts = (state: GameState, kind: string) => television(state)!.receipts.filter((r) => r.kind === kind)
const status = (state: GameState): string => season(state).status
const lateReduction = (deliveredWeek: number, dueWeek: number): number => Math.min(LATE_MAX, LATE_PER_WEEK * Math.max(0, deliveredWeek - dueWeek))
const company = (state: GameState): string[] => rosterIds(season(state).roster).slice(1)

type SettlementModule = {
  cancelTvSeasonsAtClosure: (state: GameState, closureId: string, week: number) => GameState
}
async function settlementModule(): Promise<SettlementModule | null> {
  try { return (await import('../src/core/tvSettlement.js')) as unknown as SettlementModule } catch { return null }
}

/** Ticks until the season leaves `live` or `max` advances pass; the walk is returned week by week. */
function walk(state: GameState, max: number): GameState[] {
  const out = [state]
  for (let i = 0; i < max && status(state) === 'live'; i++) out.push(state = tick(state))
  return out
}

/** The validator refuses the edited save by name, through the live reader and makeSave. */
function refuses(state: GameState, edit: (f: { state: GameState & { television: TelevisionLocal } }) => void, pattern: RegExp): void {
  const forged = detached(saves.makeSave(state)) as unknown as { state: GameState & { television: TelevisionLocal } }
  edit(forged)
  expect(() => (saves as unknown as { validateSaveP18: (s: unknown) => unknown }).validateSaveP18(forged)).toThrow(pattern)
  expect(() => saves.makeSave(forged.state)).toThrow(pattern)
}

function roundTrips(state: GameState): void {
  const bytes = saves.exportSave(saves.makeSave(state))
  expect(saves.exportSave(saves.migrateToLive(saves.importSave(bytes)))).toBe(bytes)
}

// ── delivery on the natural route ────────────────────────────────────────────────────────────────────────
describe('P18 delivery — the twelfth unit\'s advance accepts the master', () => {
  let weeks: GameState[] = []
  beforeAll(() => { weeks = naturalWeeks })
  const delivered = (): GameState => weeks[weeks.length - 1]!

  it('delivers at T with the delivery milestone less the frozen late reduction, paid max(0, E − P) on its own row', () => {
    expect(weeks.length, 'the lawful commission must be accepted').toBeGreaterThan(1)
    const done = delivered()
    // RED at 31fdb366: the season stays live at twelve units (Sprint 12 waited for this boundary).
    expect(status(done)).toBe('delivered')
    const s = season(done)
    const units = receipts(done, 'unitCredited')
    expect(units).toHaveLength(12)
    expect(s.deliveredWeek).toBe(units.at(-1)!.week)
    expect(s.deliveredWeek!).toBeLessThanOrEqual(s.finalWeek)
    const reduction = lateReduction(s.deliveredWeek!, s.dueWeek)
    expect(receipts(done, 'delivered')).toEqual([expect.objectContaining({ week: s.deliveredWeek, lateWeeks: Math.max(0, s.deliveredWeek! - s.dueWeek) })])
    expect(receipts(done, 'deliveryReduction')).toHaveLength(reduction > 0 ? 1 : 0)
    expect(agreement(done)).toMatchObject({ earned: FIGURES.fee - reduction, received: FIGURES.fee - reduction })
    expect(agreement(done).milestones.at(-1)).toEqual({ kind: 'delivery', week: s.deliveredWeek, earned: FIGURES.delivery - reduction, paid: FIGURES.delivery - reduction })
    expect(tvRows(done, 'tvMilestonePayment').at(-1)).toMatchObject({ week: s.deliveredWeek! - 1, amount: FIGURES.delivery - reduction })
    const before = weeks[weeks.length - 2]!
    const added = done.ledger.slice(before.ledger.length)
    expect(done.studio.cash - before.studio.cash).toBe(added.reduce((sum, row) => sum + row.amount, 0))
  })

  it('delivery releases the five company members, every slot and the set; the series keeps its history', () => {
    expect(weeks.length).toBeGreaterThan(1)
    const done = delivered()
    const busy = busyTalentIds(done)
    // RED at 31fdb366: the five stay in the busy union after the twelfth unit.
    for (const id of company(done)) expect(busy.has(id), id).toBe(false)
    expect([...occupiedResourceSlots(done).values()].flat().filter((c) => c.owner === 'tvSeason')).toEqual([])
    expect(season(done).reservations).toEqual([])
    expect(season(done).setId === null ? null : tvReaders.tvSeasonHoldingSet(done.television, season(done).setId!)).toBeNull()
    expect(television(done)!.series[0]!.seasonIds).toEqual([season(done).seasonId])
    const released = act(done, { kind: 'releaseTalent', talentId: season(done).roster.directorId })
    expect(released.error ?? '').not.toMatch(/television/)
    expect(() => saves.makeSave(done)).not.toThrow()
    roundTrips(done)
  })

  it('the exclusive window is [delivered, delivered + 52): a noncash expiry receipt at its end, the P16 licence untouched', () => {
    expect(weeks.length).toBeGreaterThan(1)
    const done = delivered()
    const expire = (tvSeasonModule as Record<string, unknown>).expireTvDistribution as ((root: unknown, boundary: number) => TelevisionLocal) | undefined
    // FIX-S13A-1 item 5: the reader lives beside the P16 permission it now requires and takes the state.
    const available = (tvCommissionModule as Record<string, unknown>).tvDistributionAvailable as ((state: unknown, s: unknown, terms: unknown, week: number) => boolean) | undefined
    // RED at 31fdb366: neither producer nor reader exists. RED at the slice B commit: the reader is not in tvCommission.
    expect(typeof expire).toBe('function')
    expect(typeof available).toBe('function')
    const s = season(done)
    const end = s.deliveredWeek! + FIGURES.distributionWeeks
    expect(expire!(done.television, end - 1)).toBe(done.television)
    const after = expire!(done.television, end)
    expect(after.receipts.slice(television(done)!.receipts.length).map((r) => [r.kind, r.week])).toEqual([['distributionExpired', end]])
    expect(expire!(after, end)).toBe(after)
    const terms = agreement(done).terms
    // The window's first edge on the delivery state itself; its far edge (end − 1, end) is asked of the states at those
    // weeks in the 52-tick walk below. P16 answers no future week, so the reader refuses one by name (green-r6 A: asked
    // at end − 1 from the delivery week, P16 refused with `futureWeek` and the reader read it as "not available").
    expect([s.deliveredWeek! - 1, s.deliveredWeek!].map((w) => available!(done, s, terms, w))).toEqual([false, true])
    expect(() => available!(done, s, terms, end - 1)).toThrow(`tv distribution: availability at week ${end - 1} is asked of a state at week ${done.market.tick}; P16 answers no future week`)
    // Inside the window, availability still asks P16: without the season's own licence the commissioner may not distribute.
    const unlicensed = { ...done, rights: { ...done.rights, licences: done.rights.licences.filter((l) => l.id !== s.distributionLicenceId) } }
    expect(available!(unlicensed, s, terms, s.deliveredWeek!)).toBe(false)
    // A delivered season without its delivered week is a broken record: both readers throw by name (item 8).
    const broken = { ...s }
    delete broken.deliveredWeek
    expect(() => available!(done, broken, terms, s.deliveredWeek!)).toThrow(/delivered season tv-season-\d+ carries no deliveredWeek/)
    expect(() => expire!({ ...done.television!, seasons: [broken] }, end)).toThrow(/delivered season tv-season-\d+ carries no deliveredWeek/)
    const licence = done.rights.licences.find((l) => l.id === s.distributionLicenceId)!
    expect(licence.endWeekExclusive).toBe(s.commitWeek + FIGURES.finalWeeks + FIGURES.distributionWeeks)
    expect(licence.endWeekExclusive).toBeGreaterThanOrEqual(end)
    expect(tvRows(done).filter((row) => row.week >= s.deliveredWeek!)).toEqual([])
  })

  it('a delivered season cannot be cancelled; cancelling after picture lock pays K alone (U = 0) and earns nothing more', () => {
    expect(weeks.length).toBeGreaterThan(1)
    const refused = act(delivered(), { kind: 'cancelTvSeason', seasonId: season(delivered()).seasonId })
    // RED at 31fdb366: an unknown action kind, not this refusal.
    expect(refused.error).toMatch(/was delivered at week \d+; only a pre-delivery season can be cancelled/)
    const locked = weeks.find((state) => season(state).work.creditedUnits >= 9 && status(state) === 'live')!
    expect(agreement(locked)).toMatchObject({ earned: FIGURES.scripts + FIGURES.pictureLock, received: FIGURES.advance + FIGURES.pictureLock })
    const cancelled = act(locked, { kind: 'cancelTvSeason', seasonId: season(locked).seasonId })
    expect(cancelled.error).toBeUndefined()
    const c = cancelled.state!
    expect(status(c)).toBe('cancelled')
    expect(season(c).cancellation).toEqual({ week: locked.market.tick, cause: 'producer' })
    expect(agreement(c).settlement).toEqual({ week: locked.market.tick, refundDue: 0, refundPaid: 0, chargeDue: CHARGE, chargePaid: CHARGE, closureId: null })
    expect(tvRows(c).slice(tvRows(locked).length).map((row) => [row.kind, row.amount, row.week])).toEqual([['tvCancellationCharge', -CHARGE, locked.market.tick]])
    expect(c.studio.cash).toBe(locked.studio.cash - CHARGE)
    const next = tick(c)
    expect(agreement(next)).toMatchObject({ earned: agreement(c).earned, received: agreement(c).received })
    expect(receipts(next, 'unitCredited')).toHaveLength(receipts(c, 'unitCredited').length)
    expect(() => saves.makeSave(next)).not.toThrow()
  })

  it('the validator refuses forged delivery facts by name', () => {
    expect(weeks.length).toBeGreaterThan(1)
    const done = delivered()
    expect(status(done)).toBe('delivered')
    refuses(done, (f) => { f.state.television.agreements[0]!.milestones.at(-1)!.earned += 1 }, /milestone delivery does not replay/)
    refuses(done, (f) => { f.state.television.seasons[0]!.deliveredWeek = f.state.television.seasons[0]!.finalWeek + 1 }, /delivered week/)
    refuses(done, (f) => { f.state.television.receipts = f.state.television.receipts.filter((r) => r.kind !== 'delivered') }, /delivery receipt/)
  })
})

// ── lateness: the schedule shifted by a disclosed cash stall ─────────────────────────────────────────────
describe('P18 delivery — late delivery', () => {
  let natural: GameState | null = null
  let late: GameState[] = []
  beforeAll(() => {
    const result = attempt(route.state, request(route))
    if (result.error !== undefined) return
    const walked = naturalWeeks
    natural = walked[walked.length - 1]!
    const naturalWeek = season(natural).deliveredWeek
    const due = season(result.state).dueWeek
    // Target two weeks late (the contract's C + 18 example) unless the natural route is already late.
    const stall = naturalWeek === undefined ? 0 : Math.max(0, due + 2 - naturalWeek)
    if (stall === 0) { late = walked; return }
    let state = drainTo(result.state, 0)
    for (let i = 0; i < stall; i++) state = tick(state)
    late = walk(fund(state), 24)
  }, 600_000)

  it('pays the delivery milestone less 12,000 per week past C + 16 (cap 48,000), the reduction on its own receipt', () => {
    expect(natural, 'the lawful commission must be accepted').not.toBeNull()
    const done = late[late.length - 1]!
    // RED at 31fdb366: still live.
    expect(status(done), `premise: the shifted season delivers by C + 20 (stall ${JSON.stringify(season(done).work.stall)})`).toBe('delivered')
    const s = season(done)
    expect(s.deliveredWeek!, 'premise: the delivery is late').toBeGreaterThan(s.dueWeek)
    const reduction = lateReduction(s.deliveredWeek!, s.dueWeek)
    expect(receipts(done, 'deliveryReduction')).toEqual([expect.objectContaining({ week: s.deliveredWeek, amount: reduction })])
    expect(agreement(done)).toMatchObject({ earned: FIGURES.fee - reduction, received: FIGURES.fee - reduction })
    expect(agreement(done).milestones.map((m) => [m.kind, m.earned, m.paid])).toEqual([
      ['scripts', FIGURES.scripts, 0], ['pictureLock', FIGURES.pictureLock, FIGURES.pictureLock], ['delivery', FIGURES.delivery - reduction, FIGURES.delivery - reduction]])
    expect(() => saves.makeSave(done)).not.toThrow()
  })
})

// ── the deadline: incomplete at C + 20 ───────────────────────────────────────────────────────────────────
describe('P18 cancellation — deadline failure at C + 20', () => {
  let eve: GameState | null = null
  beforeAll(() => {
    const result = attempt(route.state, request(route))
    if (result.error !== undefined) return
    let state = drainTo(result.state, 0)
    while (state.market.tick < season(state).finalWeek - 1) state = tick(state)
    eve = state
  }, 600_000)

  it('without cash: cancelled once at the final boundary, U0 and K frozen and owed, people and slots released', () => {
    expect(eve, 'the lawful commission must be accepted').not.toBeNull()
    expect(season(eve!).work.creditedUnits, 'premise: the cash stall credited nothing').toBe(0)
    const at = tick(eve!)
    const s = season(at)
    // RED at 31fdb366: the season is still live at C + 20 with a final-boundary stall.
    expect(status(at)).toBe('cancelled')
    expect(s.cancellation).toEqual({ week: s.finalWeek, cause: 'deadline' })
    expect(agreement(at).settlement).toEqual({ week: s.finalWeek, refundDue: FIGURES.advance, refundPaid: 0, chargeDue: CHARGE, chargePaid: 0, closureId: null })
    expect(receipts(at, 'cancelled')).toEqual([expect.objectContaining({ week: s.finalWeek, cause: 'deadline', refundDue: FIGURES.advance, chargeDue: CHARGE })])
    expect(tvRows(at).filter((row) => row.kind === 'tvAdvanceRefund' || row.kind === 'tvCancellationCharge')).toEqual([])
    expect(s.reservations).toEqual([])
    for (const id of company(at)) expect(busyTalentIds(at).has(id), id).toBe(false)
    expect(() => saves.makeSave(at)).not.toThrow()
    // Arrears refuse a new season (contract §5).
    const again = attempt(at, request(route))
    expect(again.error).toMatch(/still owes 240000 \(advance refund, then cancellation charge\)/)
    // No work after the deadline.
    const later = tick(at)
    expect(receipts(later, 'unitCredited')).toHaveLength(0)
    expect(status(later)).toBe('cancelled')
  })

  it('a season still live at or past its final week is refused by the validator and stops the tick by name (FIX-S13A-1 item 1)', () => {
    expect(eve).not.toBeNull()
    const s = season(eve!)
    // The eve itself (live at C + 19) is lawful; the same record read at C + 20 (a Sprint 12 save run past it) is not.
    expect(() => validateP18Roots(eve as unknown as Record<string, unknown>, 'eve')).not.toThrow()
    const atFinal = { ...eve!, market: { ...eve!.market, tick: s.finalWeek } }
    expect(() => validateP18Roots(atFinal as unknown as Record<string, unknown>, 'forged'))
      .toThrow(`forged: television season ${s.seasonId} is live at week ${s.finalWeek}, at or past its final boundary ${s.finalWeek}`)
    // The step never writes a cancellation at a boundary past C + 20.
    expect(() => tvSeasonModule.advanceTelevisionWeek(atFinal, { cash: atFinal.studio.cash, sets: atFinal.sets }, s.finalWeek))
      .toThrow(`tv season: live season ${s.seasonId} reached boundary ${s.finalWeek + 1}, past its final boundary ${s.finalWeek}`)
  })

  it('with cash: the advance\'s unit credits, then the deadline pays U0 then K from what is left, rows dated T − 1', () => {
    expect(eve).not.toBeNull()
    const funded = fund(eve!)
    const at = tick(funded)
    const s = season(at)
    expect(status(at)).toBe('cancelled')
    expect(s.work.creditedUnits, 'premise: the funded advance credited one scripts unit').toBe(1)
    expect(agreement(at).settlement).toEqual({ week: s.finalWeek, refundDue: FIGURES.advance, refundPaid: FIGURES.advance, chargeDue: CHARGE, chargePaid: CHARGE, closureId: null })
    const rows = tvRows(at).filter((row) => row.kind === 'tvAdvanceRefund' || row.kind === 'tvCancellationCharge')
    expect(rows.map((row) => [row.kind, row.amount, row.week])).toEqual([['tvAdvanceRefund', -FIGURES.advance, s.finalWeek - 1], ['tvCancellationCharge', -CHARGE, s.finalWeek - 1]])
    expect(receipts(at, 'advanceRefundPaid')).toEqual([expect.objectContaining({ week: s.finalWeek, amount: FIGURES.advance, source: 'cancellation' })])
    const added = at.ledger.slice(funded.ledger.length)
    expect(at.studio.cash - funded.studio.cash).toBe(added.reduce((sum, row) => sum + row.amount, 0))
    expect(() => saves.makeSave(at)).not.toThrow()
    roundTrips(at)
  })
})

// ── the producer's cancellation, partial repayment and the settlement action ─────────────────────────────
describe('P18 cancellation — producer action, partial repayment, settleTvObligations', () => {
  it('pays U0 first, then K from the rest; the remainder is owed; settlement is exact, guarded and refund-first', () => {
    const c0 = commissioned(route)
    const seasonId = season(c0).seasonId
    const agreementId = agreement(c0).agreementId
    const short = drainTo(c0, 150_000)
    const cancelled = act(short, { kind: 'cancelTvSeason', seasonId })
    // RED at 31fdb366: an unknown action kind.
    expect(cancelled.error).toBeUndefined()
    const c = cancelled.state!
    const week = c0.market.tick
    expect(season(c).cancellation).toEqual({ week, cause: 'producer' })
    expect(agreement(c).settlement).toEqual({ week, refundDue: FIGURES.advance, refundPaid: FIGURES.advance, chargeDue: CHARGE, chargePaid: 30_000, closureId: null })
    expect(c.studio.cash).toBe(0)
    expect(tvRows(c).slice(tvRows(short).length).map((row) => [row.kind, row.amount, row.week])).toEqual([['tvAdvanceRefund', -FIGURES.advance, week], ['tvCancellationCharge', -30_000, week]])
    // P − R = E + refund unpaid (contract §7).
    const st = agreement(c).settlement!
    expect(agreement(c).received - st.refundPaid).toBe(agreement(c).earned + (st.refundDue - st.refundPaid))
    expect(() => saves.makeSave(c)).not.toThrow()
    expect(act(c, { kind: 'cancelTvSeason', seasonId }).error).toMatch(/is already cancelled \(week \d+\); a repeated cancellation does nothing/)
    expect(attempt(c, request(route)).error).toMatch(/still owes 90000/)

    const rich = fund(c)
    const paid = act(rich, { kind: 'settleTvObligations', agreementId, expectedRemaining: 90_000, amount: 40_000 })
    expect(paid.error).toBeUndefined()
    expect(agreement(paid.state!).settlement).toMatchObject({ refundPaid: FIGURES.advance, chargePaid: 70_000 })
    expect(tvRows(paid.state!).at(-1)).toMatchObject({ kind: 'tvCancellationCharge', amount: -40_000, week })
    expect(paid.state!.studio.cash).toBe(rich.studio.cash - 40_000)
    expect(act(paid.state!, { kind: 'settleTvObligations', agreementId, expectedRemaining: 90_000, amount: 10_000 }).error).toMatch(/stale or repeated request/)
    expect(act(paid.state!, { kind: 'settleTvObligations', agreementId, expectedRemaining: 50_000, amount: 60_000 }).error).toMatch(/exceeds the outstanding balance 50000/)
    expect(act(drainTo(paid.state!, 10), { kind: 'settleTvObligations', agreementId, expectedRemaining: 50_000, amount: 20 }).error).toMatch(/exceeds available nonnegative cash 10/)
    expect(act(paid.state!, { kind: 'settleTvObligations', agreementId, expectedRemaining: 50_000, amount: 0 }).error).toMatch(/must be a positive whole number/)
    const clear = act(paid.state!, { kind: 'settleTvObligations', agreementId, expectedRemaining: 50_000, amount: 50_000 })
    expect(clear.error).toBeUndefined()
    expect(agreement(clear.state!).settlement).toMatchObject({ refundPaid: FIGURES.advance, chargePaid: CHARGE })
    expect(act(clear.state!, { kind: 'settleTvObligations', agreementId, expectedRemaining: 0, amount: 1 }).error).toMatch(/owes nothing/)
    // The arrears refusal is gone and the one-live-season slot is free. A fresh season on the SAME property is refused by
    // P16: the commissioner's exclusive licence from the cancelled season lives to C + 72 (OWNER ITEM, NOTES-S13A-FIX1).
    const after = attempt(clear.state!, request(route))
    expect(after.error).toBe(`applyActions: commissionTvSeason rejected — P16 refuses the commissioner's exclusive television distribution licence over ${route.propertyId} for [${week}, ${week + FIGURES.finalWeeks + FIGURES.distributionWeeks}): exclusiveOverlap`)
    expect(() => saves.makeSave(clear.state!)).not.toThrow()
    roundTrips(clear.state!)
    // FIX-S13B-1 item 8: a charge above K is refused at the receipt that crosses it.
    refuses(clear.state!, (f) => {
      const charged = f.state.television.receipts.filter((r) => r.kind === 'cancellationChargePaid').at(-1)!
      charged.amount = (charged.amount as number) + 1
      f.state.television.agreements[0]!.settlement!.chargePaid += 1
    }, /pays more than the frozen cancellation charge K \(120000\)/)
    // Sequential seasons: a second property minted by the second crew's greenlight (cancelled the same week, the route's
    // own device) takes a second season; the root then holds one terminal and one live season and round-trips.
    const before = new Set(clear.state!.rights.properties.map((p) => p.propertyId))
    const minted = greenlightWith(clear.state!, route.crews[1]!)
    const second = minted.state.rights.properties.find((p) => !before.has(p.propertyId))
    expect(second, 'premise: the second greenlight mints a property').toBeDefined()
    const withSecond = applyActions(minted.state, [{ kind: 'cancel', productionId: minted.productionId }])
    const sequential = attempt(withSecond, request(route, { seriesTitle: 'The Second Night', propertyId: second!.propertyId }))
    expect(sequential.error).toBeUndefined()
    const both = television(sequential.state!)!
    expect(both.seasons.map((x) => x.status)).toEqual(['cancelled', 'live'])
    expect(both.series.map((x) => x.propertyId)).toEqual([route.propertyId, second!.propertyId])
    expect(() => saves.makeSave(sequential.state!)).not.toThrow()
    roundTrips(sequential.state!)

    refuses(c, (f) => { f.state.television.agreements[0]!.settlement!.chargePaid += 1 }, /does not replay its receipts/)
    refuses(c, (f) => { f.state.television.agreements[0]!.settlement!.refundDue += 1 }, /does not freeze U0/)
    refuses(c, (f) => { f.state.television.seasons[0]!.cancellation!.cause = 'closure' }, /closure id disagrees/)
    refuses(c, (f) => { f.state.television.seasons[0]!.status = 'live' }, /season must carry exactly/)
    // FIX-S13B-1 item 8: the cancellation's 30,000 charge split into two cancellation-time payments.
    refuses(c, (f) => {
      const charged = f.state.television.receipts.find((r) => r.kind === 'cancellationChargePaid')!
      charged.amount = 20_000
      addReceipt(f.state.television, { kind: 'cancellationChargePaid', week: charged.week, seasonId: charged.seasonId, agreementId: charged.agreementId, amount: 10_000, source: 'cancellation' })
    }, /records a second cancellation-time cancellationChargePaid payment/)
  })
})

// ── the player's closure (P18-06): the handoff, called directly ─────────────────────────────────────────
describe('P18 cancellation — closure handoff', () => {
  it('cancels the live season at the closure week, pays nothing, publishes U0 and K with the closure id', async () => {
    const mod = await settlementModule()
    // RED at 31fdb366: the settlement module does not exist.
    expect(mod).not.toBeNull()
    const live = commissioned(route)
    const week = live.market.tick
    const closed = mod!.cancelTvSeasonsAtClosure(live, 'studio-closure-99', week)
    expect(status(closed)).toBe('cancelled')
    expect(season(closed).cancellation).toEqual({ week, cause: 'closure' })
    expect(agreement(closed).settlement).toEqual({ week, refundDue: FIGURES.advance, refundPaid: 0, chargeDue: CHARGE, chargePaid: 0, closureId: 'studio-closure-99' })
    expect(closed.studio.cash).toBe(live.studio.cash)
    expect(closed.ledger).toEqual(live.ledger)
    for (const id of company(closed)) expect(busyTalentIds(closed).has(id), id).toBe(false)
    // The validator ties the published obligations to an actual closure of the producer at that week.
    expect(() => saves.makeSave(closed)).toThrow(/names closure studio-closure-99, which is not .*'s closure at week \d+/)
    // A world with no live season is returned unchanged.
    expect(mod!.cancelTvSeasonsAtClosure(route.state, 'studio-closure-99', week)).toBe(route.state)
  })
})

// ── FIX-S13A-1: broken records refuse by name, and the settlement replay is exact ───────────────────────────
/** A forged extra receipt with the next free id (the allocator's own law), so only the rule under test can refuse it. */
function addReceipt(tv: TelevisionLocal, receipt: Record<string, unknown>): void {
  tv.receipts.push({ ...receipt, receiptId: `tv-receipt-${tv.nextId}` } as TelevisionLocal['receipts'][number])
  tv.nextId += 1
}

describe('P18 FIX-S13A-1 — delivery, status and payment records', () => {
  let delivered: GameState | null = null
  let beforeDelivery: GameState | null = null
  beforeAll(() => {
    if (naturalWeeks.length < 2) return
    delivered = naturalWeeks[naturalWeeks.length - 1]!
    beforeDelivery = naturalWeeks[naturalWeeks.length - 2]!
  })

  it('delivery with a slot still held throws by name instead of overwriting the reservations (item 7)', () => {
    expect(beforeDelivery, 'the lawful commission must be accepted').not.toBeNull()
    const s = season(beforeDelivery!)
    expect(s.status).toBe('live')
    expect(s.reservations.length, 'premise: the eleventh unit\'s week still holds its Post slot').toBeGreaterThan(0)
    // The same record with its twelve units credited but the slot never released.
    const forged = { ...beforeDelivery!, television: { ...television(beforeDelivery!)!, seasons: [{ ...s, work: { ...s.work, creditedUnits: 12, blockCredited: 3 } }] } } as unknown as GameState
    expect(() => tvSeasonModule.advanceTelevisionWeek(forged, { cash: forged.studio.cash, sets: forged.sets }, forged.market.tick))
      .toThrow(`tv season: season ${s.seasonId} reached delivery still holding ${s.reservations.length} slot(s)`)
    expect(status(delivered!)).toBe('delivered')
  })

  it('a forged status refuses by name, an Object prototype key included, never a TypeError (item 9)', () => {
    const live = commissioned(route)
    refuses(live, (f) => { (f.state.television.seasons[0] as { status: string }).status = 'constructor' }, /season tv-season-\d+ status constructor is not live, delivered or cancelled/)
    refuses(live, (f) => { (f.state.television.seasons[0] as { status: string }).status = 'paused' }, /season tv-season-\d+ status paused is not live, delivered or cancelled/)
  })

  it('the forged delivery facts the review named are refused by name (item 6)', () => {
    expect(delivered).not.toBeNull()
    // An expiry receipt before the window's end.
    refuses(delivered!, (f) => {
      const s = f.state.television.seasons[0]!
      addReceipt(f.state.television, { kind: 'distributionExpired', week: s.deliveredWeek!, seasonId: s.seasonId, agreementId: s.agreementId })
    }, /distribution expiry receipt \(window ends at week \d+\)/)
    // Delivered with fewer than twelve units (the slots and stall cleared so only the delivery rule can refuse it).
    const shooting = naturalWeeks.find((state) => status(state) === 'live' && season(state).work.creditedUnits === 9)
    expect(shooting, 'premise: the walk passes picture lock').toBeDefined()
    refuses(shooting!, (f) => {
      const s = f.state.television.seasons[0]!
      Object.assign(s, { status: 'delivered', deliveredWeek: f.state.market.tick, reservations: [] })
      s.work.stall = null
    }, /delivered week \d+ is not a boundary in \[its twelfth unit, C \+ 20\]/)
    // A cancelled receipt on a live season.
    const live = commissioned(route)
    refuses(live, (f) => {
      const s = f.state.television.seasons[0]!
      addReceipt(f.state.television, { kind: 'cancelled', week: f.state.market.tick, seasonId: s.seasonId, agreementId: s.agreementId, cause: 'producer', refundDue: FIGURES.advance, chargeDue: CHARGE })
    }, /carries a settlement for a live season/)
  })

  it('a part-paid cancellation settles across the refund/charge split, round-trips, and the replay refuses a reordered, doubled or excess payment', () => {
    const c0 = commissioned(route)
    const seasonId = season(c0).seasonId
    const agreementId = agreement(c0).agreementId
    const week = c0.market.tick
    // Cancelled at 50,000 cash: U0 = 120,000 part-paid, K = 120,000 unpaid.
    const part = act(drainTo(c0, 50_000), { kind: 'cancelTvSeason', seasonId })
    expect(part.error).toBeUndefined()
    const owed = part.state!
    expect(agreement(owed).settlement).toEqual({ week, refundDue: FIGURES.advance, refundPaid: 50_000, chargeDue: CHARGE, chargePaid: 0, closureId: null })
    expect(() => saves.makeSave(owed)).not.toThrow()
    roundTrips(owed)
    // One settlement of 100,000: the remaining 70,000 refund, then 30,000 of the charge, two receipts and two rows.
    const rich = fund(owed)
    const split = act(rich, { kind: 'settleTvObligations', agreementId, expectedRemaining: 190_000, amount: 100_000 })
    expect(split.error).toBeUndefined()
    const settled = split.state!
    expect(agreement(settled).settlement).toMatchObject({ refundPaid: FIGURES.advance, chargePaid: 30_000 })
    expect(television(settled)!.receipts.slice(television(rich)!.receipts.length).map((r) => [r.kind, r.amount, r.source])).toEqual([
      ['advanceRefundPaid', 70_000, 'settlement'], ['cancellationChargePaid', 30_000, 'settlement']])
    expect(tvRows(settled).slice(tvRows(rich).length).map((row) => [row.kind, row.amount, row.week])).toEqual([
      ['tvAdvanceRefund', -70_000, week], ['tvCancellationCharge', -30_000, week]])
    expect(settled.studio.cash).toBe(rich.studio.cash - 100_000)
    expect(() => saves.makeSave(settled)).not.toThrow()
    roundTrips(settled)
    // The charge recorded before the refund completes (the last two receipts swapped).
    refuses(settled, (f) => {
      const r = f.state.television.receipts
      const [refund, charge] = [r[r.length - 2]!, r[r.length - 1]!]
      r[r.length - 2] = charge
      r[r.length - 1] = refund
    }, /paid the cancellation charge before the advance refund/)
    // A second cancellation-time refund payment (the 50,000 split in two; the ledger is left for the later rule). Item 10.
    refuses(owed, (f) => {
      const paid = f.state.television.receipts.find((r) => r.kind === 'advanceRefundPaid')!
      paid.amount = 30_000
      addReceipt(f.state.television, { kind: 'advanceRefundPaid', week: paid.week, seasonId: paid.seasonId, agreementId: paid.agreementId, amount: 20_000, source: 'cancellation' })
    }, /records a second cancellation-time advanceRefundPaid payment/)
    // A refund larger than U0, its settlement figure moved with it.
    refuses(settled, (f) => {
      const paid = f.state.television.receipts.filter((r) => r.kind === 'advanceRefundPaid').at(-1)!
      paid.amount = (paid.amount as number) + 1
      f.state.television.agreements[0]!.settlement!.refundPaid += 1
    }, /pays more than the frozen advance refund U0 \(120000\)/)
  })
})

// ── the distribution expiry through the real tick (item 6) ──────────────────────────────────────────────
describe('P18 FIX-S13A-1 — the window\'s end through the tick and the validator', () => {
  let open: GameState | null = null
  let ended: GameState | null = null
  beforeAll(() => {
    if (naturalWeeks.length < 2) return
    let state = naturalWeeks[naturalWeeks.length - 1]!
    if (status(state) !== 'delivered') return
    const end = season(state).deliveredWeek! + FIGURES.distributionWeeks
    while (state.market.tick < end - 1) state = tick(state)
    open = state
    ended = tick(state)
  }, 600_000)

  it('the advance that reaches delivered + 52 writes the one expiry receipt; the validator requires it and refuses one too many', () => {
    expect(ended, 'premise: the natural season delivers').not.toBeNull()
    const s = season(ended!)
    const end = s.deliveredWeek! + FIGURES.distributionWeeks
    expect(ended!.market.tick).toBe(end)
    expect(receipts(open!, 'distributionExpired')).toEqual([])
    expect(receipts(ended!, 'distributionExpired')).toEqual([expect.objectContaining({ week: end, seasonId: s.seasonId })])
    const available = (tvCommissionModule as Record<string, unknown>).tvDistributionAvailable as ((state: unknown, s: unknown, terms: unknown, week: number) => boolean) | undefined
    expect(typeof available).toBe('function')
    // The window's far edge on the states at those weeks: available at end − 1, not at end; asked from the end state, the
    // past week end − 1 still reads available (the commissioner's licence covers [C, C + 72)).
    expect(open!.market.tick).toBe(end - 1)
    expect(available!(open!, season(open!), agreement(open!).terms, open!.market.tick)).toBe(true)
    expect(available!(ended!, s, agreement(ended!).terms, ended!.market.tick)).toBe(false)
    expect(available!(ended!, s, agreement(ended!).terms, end - 1)).toBe(true)
    expect(() => saves.makeSave(open!)).not.toThrow()
    expect(() => saves.makeSave(ended!)).not.toThrow()
    roundTrips(ended!)
    refuses(ended!, (f) => { f.state.television.receipts = f.state.television.receipts.filter((r) => r.kind !== 'distributionExpired') }, /distribution expiry receipt \(window ends at week \d+\)/)
    refuses(ended!, (f) => {
      const x = f.state.television.seasons[0]!
      addReceipt(f.state.television, { kind: 'distributionExpired', week: f.state.market.tick, seasonId: x.seasonId, agreementId: x.agreementId })
    }, /distribution expiry receipt \(window ends at week \d+\)/)
  })
})

// ── the player's actual closure with a live season (item 3): no state surgery beyond the disclosed devices ──
type ConditionView = { stage: string; distressWeeks: number }
const conditionOf = (s: GameState): ConditionView | undefined =>
  (s as unknown as { corporateCondition: { studios: { studioId: string; condition: ConditionView }[] } }).corporateCondition.studios.find((r) => r.studioId === s.hollywood!.playerStudioId)?.condition
/** Twelve distress weeks before the closing one: inside the season's twenty weeks, so the closure meets it live. */
const COMMISSION_DISTRESS_WEEK = TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS - 12

describe('P18 FIX-S13A-1 — the natural closure route', () => {
  let committed: GameState | null = null
  let closed: GameState | null = null
  let lastOpen: GameState | null = null
  beforeAll(() => {
    // Drain to −1 (the delivery suite's device) and walk the condition law to distress week 14. Admission has no
    // condition-stage gate, so the distressed studio funded to exactly the admission quote (P14B.2's disclosed device,
    // one row) commissions the season the same week; the drain then takes cash below zero before the week ends, so the
    // condition stays in distress and ordinary ticks close the studio at distress week 26.
    let s = drainTo(route.state, -1)
    for (let guard = 0; guard < 80; guard++) {
      const c = conditionOf(s)
      if (c?.stage === 'distress' && c.distressWeeks === COMMISSION_DISTRESS_WEEK) break
      s = tick(s)
    }
    const c = conditionOf(s)
    if (!(c?.stage === 'distress' && c.distressWeeks === COMMISSION_DISTRESS_WEEK)) throw new Error(`premise: the drained studio never reached distress week ${COMMISSION_DISTRESS_WEEK} (${JSON.stringify(c)})`)
    s = withCash(s, tvAdmissionQuote(s, s.market.tick).required)
    const result = attempt(s, request(route))
    if (result.error !== undefined) throw new Error(`premise: the distressed studio funded to the quote commissions: ${result.error}`)
    committed = result.state
    let next = drainTo(committed, -1)
    for (let guard = 0; guard < 20 && !closuresOf(next).some((x) => x.studioId === next.hollywood!.playerStudioId); guard++) {
      lastOpen = next
      next = tick(next)
    }
    closed = next
  }, 600_000)

  it('the closure transaction cancels the live season at its closure week with the real closure id, and the save validates', () => {
    expect(committed, 'premise: the route commissions').not.toBeNull()
    const player = closed!.hollywood!.playerStudioId
    const closure = (closed as unknown as { studioClosure: { closures: { closureId: string; studioId: string; closureWeek: number }[] } }).studioClosure.closures.find((x) => x.studioId === player)
    expect(closure, 'premise: the condition closes the studio within the season\'s twenty weeks').toBeDefined()
    expect(status(lastOpen!)).toBe('live')
    expect(closure!.closureWeek).toBeLessThan(season(committed!).finalWeek)
    expect(status(closed!)).toBe('cancelled')
    expect(season(closed!).cancellation).toEqual({ week: closure!.closureWeek, cause: 'closure' })
    expect(agreement(closed!).settlement).toEqual({ week: closure!.closureWeek, refundDue: FIGURES.advance, refundPaid: 0, chargeDue: CHARGE, chargePaid: 0, closureId: closure!.closureId })
    expect(tvRows(closed!).filter((row) => row.kind === 'tvAdvanceRefund' || row.kind === 'tvCancellationCharge')).toEqual([])
    expect(() => saves.makeSave(closed!)).not.toThrow()
    roundTrips(closed!)
    // A closed player takes no action at all; the settlement law itself names the estate as the owner of the obligations.
    expect(() => settleTvObligations(closed!, { agreementId: agreement(closed!).agreementId, expectedRemaining: FIGURES.advance + CHARGE, amount: 1 }))
      .toThrow(`obligations were published to closure ${closure!.closureId}; the estate owns them`)
  })
})
