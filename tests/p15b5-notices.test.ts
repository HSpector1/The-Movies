// ── P15B Wave 5 RED: notices, the loan intent and the public stage (1352-A §3 row 5, §7; 1357-A §7) ────
// The player's notices come at warning, at distress with the closure week shown as a countdown, and in
// the closure week; each names the recovery routes that remain (1352-A §4.3) or says that none does. A
// rival's stage alone is public; the week it began, its cash and its countdown stay private (1122-A; 1362-O 5.1,
// r3 review C4: a since-week with the public law is the private countdown). A rival's actual closure is announced. The
// Bridge carries the one loan intent (1357-A §7: no playable Wave 2 without it) and the attention rows;
// the Industry projection carries the public stage. Burn and runway include the next installment.
// Nothing is manufactured for a migrated predecessor: no notice exists before the first evaluation.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { runway, weeklyBurn } from '../src/core/economyView.js'
import { financeOverview } from '../src/core/financeReport.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { Action, GameState } from '../src/core/types.js'
import { base, BASE_WEEK, claimsOf, closureOf, drainPlayer, drainRival, loansOf, PLAYER, PLAYER_CLOSURE_DEFERRED, playerClosure, R04, R04_CLOSURE_WEEK, recordOf, rivalClosure, ticksTo } from './helpers/p15b-live.js'
type Mod = Record<string, unknown>
async function notices(): Promise<Mod> {
  try { return (await import('../src/core/corporateNotices.js')) as unknown as Mod }
  catch (error) { throw new Error(`RED: src/core/corporateNotices.ts does not exist (${(error as Error).message})`) }
}
function fn<T>(mod: Mod, name: string): T {
  const value = mod[name]
  if (typeof value !== 'function') throw new Error(`RED: src/core/corporateNotices.ts exports no function '${name}'`)
  return value as T
}
type Notice = { id: string; severity: string; week: number; message: string; remedies: string[]; closureWeek: number | null }
type Notices = (state: GameState) => Notice[]
type Label = (state: GameState, studioId: string) => string
const PLAYER_LOAN_MAX = 390_000
const PLAYER_INSTALLMENT = 8_400
const takeLoan = (principal: number): Action => ({ kind: 'takeLoan', principal } as Action)

let negativeRoute: Map<number, GameState> | null = null
function negativePlayer(toWeek: number): Map<number, GameState> {
  if (negativeRoute === null || Math.max(...negativeRoute.keys()) < toWeek) {
    const from = negativeRoute === null ? drainPlayer(base(), base().studio.cash + 1) : negativeRoute.get(Math.max(...negativeRoute.keys()))!
    const more = ticksTo(from, toWeek)
    negativeRoute = negativeRoute === null ? more : new Map([...negativeRoute, ...more])
  }
  return negativeRoute
}

describe('p15b5 notices: the player (1352-A §7; 1357-A §7)', () => {
  it('notices-none-manufactured', async () => {
    const corporateNotices = fn<Notices>(await notices(), 'corporateNotices')
    // The migrated capture has no record at its own week, and a stable record raises nothing.
    expect(corporateNotices(base())).toEqual([])
    const s131 = tick(base())
    expect(recordOf(s131, PLAYER)!.condition.stage).toBe('stable')
    expect(corporateNotices(s131)).toEqual([])
    // Predecessor compatibility: the first possible notice is the warning at recordedFromWeek + 4, never earlier.
    const route = negativePlayer(134)
    for (const week of [131, 132, 133]) expect(corporateNotices(route.get(week)!), `week ${week}`).toEqual([])
    expect(corporateNotices(route.get(134)!).map((n) => n.id)).toEqual(['corporate-warning'])
    expect(134).toBe(BASE_WEEK + TUNING.CORPORATE_WARN_SUSTAIN_WEEKS)
  })

  it('notices-warning-distress-countdown-closure', async () => {
    const corporateNotices = fn<Notices>(await notices(), 'corporateNotices')
    const route = negativePlayer(R04_CLOSURE_WEEK - 1)
    // r3 (review T15): exact sentences, not words the template always holds.
    const warning = corporateNotices(route.get(134)!)[0]!
    expect(warning).toEqual({ id: 'corporate-warning', severity: 'warning', week: 134, remedies: ['LOAN'], closureWeek: null,
      message: 'Corporate condition: warning since Week 134. Cash covers fewer than 4 weeks of obligations. Routes that remain: a studio loan.' })
    // Distress: the countdown names the week closure falls due if cash stays negative (since + 26 − 1).
    const distress = corporateNotices(route.get(138)!)[0]!
    expect(distress).toEqual({ id: 'corporate-distress', severity: 'critical', week: 138, remedies: ['LOAN'], closureWeek: 138 + TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS - 1,
      message: 'Corporate condition: distress since Week 138. If cash stays negative the studio closes at Week 163 (25 weeks). Routes that remain: a studio loan.' })
    // The countdown shortens week by week and never shows a cash figure.
    const later = corporateNotices(route.get(150)!)[0]!
    expect(later).toMatchObject({ id: 'corporate-distress', closureWeek: 163 })
    expect(later.message).toMatch(/13 weeks/)
    for (const n of corporateNotices(route.get(150)!)) expect(n.message).not.toMatch(/\$|\d{4,}/)
    // No route remains: after borrowing in warning with no staff and no release, the notice says so.
    const borrowed = applyActions(route.get(134)!, [takeLoan(PLAYER_LOAN_MAX)])
    const s135 = tick(borrowed)
    const ids = corporateNotices(s135).map((n) => n.id)
    expect(ids).toEqual(['corporate-warning', 'studio-loan'])
    expect(corporateNotices(s135)[0]!.remedies).toEqual([])
    expect(corporateNotices(s135)[0]!.message).toBe('Corporate condition: warning since Week 134. Cash covers fewer than 4 weeks of obligations. No route remains: no loan is available, no contract can be released and nothing is in release.')
    // Recovery after a distress-week loan: an informational notice naming the stable threshold.
    const recovered = tick(applyActions(route.get(138)!, [takeLoan(PLAYER_LOAN_MAX)]))
    expect(recordOf(recovered, PLAYER)!.condition.stage).toBe('recovery')
    expect(corporateNotices(recovered).map((n) => n.id)).toEqual(['corporate-recovery', 'studio-loan'])
    // The closure week: the run has ended; the record names what was paid, unpaid and pending.
    const closed = playerClosure().get(R04_CLOSURE_WEEK)!
    const [claim] = claimsOf(closed, closureOf(closed, PLAYER)!.closureId)
    expect(corporateNotices(closed)).toEqual([{ id: 'corporate-closed', severity: 'critical', week: R04_CLOSURE_WEEK, remedies: [], closureWeek: R04_CLOSURE_WEEK,
      message: `The studio closed in Week ${R04_CLOSURE_WEEK}. This world is read-only history. 1 employment claim: 0 paid in full, 0 partially paid, 1 unpaid; 0 paid and ${claim!.original} unpaid. 0 obligations remain pending in this saved world.` }])
  })

  // r3 (review C14): paid, partially paid, unpaid and pending each counted with their amounts, from the record alone.
  it('notices-closed-player-counts-every-status', async () => {
    const corporateNotices = fn<Notices>(await notices(), 'corporateNotices')
    const closed = playerClosure().get(R04_CLOSURE_WEEK)!
    const forged = JSON.parse(JSON.stringify(closed)) as GameState & { studioClosure: { claims: { closureId: string; original: number; paid: number; unpaid: number; status: string }[]; closures: { dispositions: { status: string }[] }[] } }
    const first = forged.studioClosure.claims[0]!
    forged.studioClosure.claims = [{ ...first, paid: first.original, unpaid: 0, status: 'paid' }, { ...first, original: 900, paid: 400, unpaid: 500, status: 'partiallyPaid' }, { ...first, original: 50, paid: 0, unpaid: 50, status: 'unpaid' }]
    forged.studioClosure.closures[0]!.dispositions[0]!.status = 'pending'
    expect(corporateNotices(forged)[0]!.message).toBe(`The studio closed in Week ${R04_CLOSURE_WEEK}. This world is read-only history. 3 employment claims: 1 paid in full, 1 partially paid, 1 unpaid; ${first.original + 400} paid and 550 unpaid. 1 obligation remains pending in this saved world.`)
  })

  // r3 (review C3/D8): the browser Lot leaves the player's closure due; the notice says so every week until it runs.
  it('notices-closure-due-before-the-closure-runs', async () => {
    const corporateNotices = fn<Notices>(await notices(), 'corporateNotices')
    const due = tick(playerClosure().get(R04_CLOSURE_WEEK - 1)!, PLAYER_CLOSURE_DEFERRED)
    const later = tick(due, PLAYER_CLOSURE_DEFERRED)
    for (const s of [due, later]) {
      expect(corporateNotices(s)).toEqual([{ id: 'corporate-closure-due', severity: 'critical', week: s.market.tick, remedies: [], closureWeek: R04_CLOSURE_WEEK,
        message: `Corporate condition: closure due since Week ${R04_CLOSURE_WEEK}. The closure is recorded at the next closure boundary; no route remains.` }])
    }
  })

  // r3 (review C19; 1362-O 5.1 "Announce actual closure"): a rival's actual closure is announced in its closure week, figures private.
  it('notices-rival-closure-announced', async () => {
    const corporateNotices = fn<Notices>(await notices(), 'corporateNotices')
    const route = rivalClosure(R04_CLOSURE_WEEK + 1)
    const name = route.get(R04_CLOSURE_WEEK)!.hollywood!.identities.find((s) => s.studioId === R04)!.name
    const at = corporateNotices(route.get(R04_CLOSURE_WEEK)!).filter((n) => n.id === 'rival-closed')
    expect(at).toEqual([{ id: 'rival-closed', severity: 'info', week: R04_CLOSURE_WEEK, remedies: [], closureWeek: R04_CLOSURE_WEEK, message: `${name} closed this week. Its staff are free agents now.` }])
    expect(at[0]!.message).not.toMatch(/\d{4,}|\$/)
    expect(corporateNotices(route.get(R04_CLOSURE_WEEK - 1)!).some((n) => n.id === 'rival-closed')).toBe(false)
    expect(corporateNotices(route.get(R04_CLOSURE_WEEK + 1)!).some((n) => n.id === 'rival-closed')).toBe(false)
  })

  it('notices-loan-status', async () => {
    const corporateNotices = fn<Notices>(await notices(), 'corporateNotices')
    const borrowed = applyActions(negativePlayer(134).get(134)!, [takeLoan(PLAYER_LOAN_MAX)])
    const at = corporateNotices(borrowed).find((n) => n.id === 'studio-loan')!
    expect(at).toMatchObject({ severity: 'info', week: 134 })
    expect(at.message).toMatch(/0 of 52/)
    expect(at.message).toMatch(/Week 135/)
    const s137 = tick(tick(tick(borrowed)))
    const later = corporateNotices(s137).find((n) => n.id === 'studio-loan')!
    expect(later.message).toMatch(/2 of 52/)
    expect(later.message).toMatch(/Week 137/)
  })
})

describe('p15b5 notices: the public stage, burn and runway (1122-A; 1352-A §3 row 5)', () => {
  it('public-condition-label', async () => {
    const publicConditionLabel = fn<Label>(await notices(), 'publicConditionLabel')
    expect(publicConditionLabel(base(), R04)).toBe('Not yet evaluated')
    expect(publicConditionLabel(tick(base()), R04)).toBe('Stable')
    // r3 (review C4; 1362-O 5.1 "no private closure countdown"): the stage alone. With the public law, a distress
    // since-week would publish the rival's closure week, so no week, figure or countdown appears at any stage.
    const route = rivalClosure(R04_CLOSURE_WEEK + 1)
    expect(publicConditionLabel(route.get(134)!, R04)).toBe('Warning')
    expect(publicConditionLabel(route.get(138)!, R04)).toBe('Distress')
    expect(publicConditionLabel(route.get(R04_CLOSURE_WEEK)!, R04)).toBe('Closed')
    for (const [week, s] of route) for (const id of [R04, PLAYER]) expect(publicConditionLabel(s, id), `${id} at ${week}`).not.toMatch(/\d/)
    // r2 (stacked on R8's Save46 recovery): r04's refund at 131 moves its natural distress to 141 and its recovery to 142.
    const natural = ticksTo(drainRival(base(), R04, 1), 142)
    expect(publicConditionLabel(natural.get(141)!, R04)).toBe('Distress')
    expect(publicConditionLabel(natural.get(142)!, R04)).toBe('Recovery')
    // A closure due that has not run yet (the browser Lot's deferral) reads as the due stage, still with no week.
    expect(publicConditionLabel(tick(playerClosure().get(R04_CLOSURE_WEEK - 1)!, PLAYER_CLOSURE_DEFERRED), PLAYER)).toBe('Closure due')
  })

  it('burn-and-runway-include-installment', () => {
    const s134 = negativePlayer(134).get(134)!
    expect(weeklyBurn(s134)).toBe(15_000)
    const borrowed = applyActions(s134, [takeLoan(PLAYER_LOAN_MAX)])
    // At 134 nothing is due in the next advance (the first installment falls at 135); from 135 the burn carries it.
    expect(weeklyBurn(borrowed)).toBe(15_000)
    const s135 = tick(borrowed)
    expect(weeklyBurn(s135)).toBe(15_000 + PLAYER_INSTALLMENT)
    expect(runway(s135)).toEqual({ netWeeklyCash: -(15_000 + PLAYER_INSTALLMENT), weeks: Math.floor(s135.studio.cash / (15_000 + PLAYER_INSTALLMENT)), infinite: false })
    expect(financeOverview(s135).weeklyOperatingCost).toBe(15_000 + PLAYER_INSTALLMENT)
    expect(loansOf(s135, PLAYER).length).toBe(1)
  })
})
