// ── P18 Sprint 13 slice 1: delivery, the distribution window, cancellation and settlement (contract §5-§7) ─────
//
// The Sprint 12 season route, then the engine's own verbs and `tick`. Disclosed shortcuts, each one ledger row so the
// money still reconciles: `drain` (a publicity row, the P17 cameo route's drain) to make cash the stall cause, and
// P14B.2's `fund` bootstrap to restore it. The closure handoff is called directly (natural closure needs 8 negative +
// 26 distress weeks, longer than a season's 20; NOTES-S13A), and the 52-week expiry is asserted on the producer's own
// function rather than a 52-tick walk.
//
// RED at 31fdb366 by assertion: the season stays live after its twelfth unit and at C + 20, the two new actions are
// unknown kinds (caught and compared), the settlement module is absent (a dynamic import returns null) and the expiry
// and window readers are absent (namespace members compared).

import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds } from '../src/core/employment.js'
import { occupiedResourceSlots } from '../src/core/occupancy.js'
import * as saves from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import * as tvReaders from '../src/core/tvReaders.js'
import * as tvSeasonModule from '../src/core/tvSeason.js'
import type { Action, GameState } from '../src/core/types.js'
import { detached } from './helpers/p16-fixtures.js'
import { fund } from './helpers/p14b2-fixtures.js'
import {
  FIGURES, agreement, attempt, commissioned, request, rosterIds, season, seasonRoute, television, tvRows, type SeasonRoute, type TelevisionLocal,
} from './helpers/p18-route.js'

const LATE_PER_WEEK = 12_000
const LATE_MAX = 48_000
const CHARGE = 120_000

let route: SeasonRoute
beforeAll(() => { route = seasonRoute() }, 240_000)

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
  beforeAll(() => {
    const result = attempt(route.state, request(route))
    if (result.error !== undefined) return
    weeks = walk(result.state, 22)
  }, 300_000)
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
    const available = (tvReaders as Record<string, unknown>).tvDistributionAvailable as ((s: unknown, terms: unknown, week: number) => boolean) | undefined
    // RED at 31fdb366: neither producer nor reader exists.
    expect(typeof expire).toBe('function')
    expect(typeof available).toBe('function')
    const s = season(done)
    const end = s.deliveredWeek! + FIGURES.distributionWeeks
    expect(expire!(done.television, end - 1)).toBe(done.television)
    const after = expire!(done.television, end)
    expect(after.receipts.slice(television(done)!.receipts.length).map((r) => [r.kind, r.week])).toEqual([['distributionExpired', end]])
    expect(expire!(after, end)).toBe(after)
    const terms = agreement(done).terms
    expect([s.deliveredWeek! - 1, s.deliveredWeek!, end - 1, end].map((w) => available!(s, terms, w))).toEqual([false, true, true, false])
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
    const walked = walk(result.state, 22)
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
    // The arrears refusal is gone and the one-live-season slot is free (any later refusal names another rule).
    const after = attempt(clear.state!, request(route))
    expect(after.error ?? '').not.toMatch(/still owes|one active season/)
    expect(() => saves.makeSave(clear.state!)).not.toThrow()
    roundTrips(clear.state!)

    refuses(c, (f) => { f.state.television.agreements[0]!.settlement!.chargePaid += 1 }, /does not replay its receipts/)
    refuses(c, (f) => { f.state.television.agreements[0]!.settlement!.refundDue += 1 }, /does not freeze U0/)
    refuses(c, (f) => { f.state.television.seasons[0]!.cancellation!.cause = 'closure' }, /closure id disagrees/)
    refuses(c, (f) => { f.state.television.seasons[0]!.status = 'live' }, /season must carry exactly/)
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
