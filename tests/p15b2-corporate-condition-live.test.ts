// ── P15B Wave 2 — the condition root, the weekly step, loans and "closure due", RED tests (record 1370-ar) ──
//
// Authority ($E = docs/engineering/playability-launch-review/evidence/p14b4-20260919): 1357-A §3 (the
// fact adapter), §4 (the root), §5 (the weekly step), §6 (loans), §7 (closure due settles nothing),
// §10 (this RED list), as adopted by 1357-F (Amendment 1: the P15 domain sequence and phase triple on
// events and loans; allocation order; `nextEvent`/`nextLoan` keep their own allocators); 1352-F3 decision 4
// (the four carried items); 1366-O O6; the Wave-4 closure contract §2 (closure due alone leaves every
// operation and installment intact).
//
// RED BY DESIGN at 6510c971: `src/core/corporateConditionLive.ts` and the `corporateCondition` root do not
// exist; `takeLoan` is not an Action; no ledger or rival money kind names a loan. Each leaf imports the new
// module dynamically so a missing export fails that leaf alone with its own message (the 1352-C precedent).
//
// ROUTES (tests/helpers/p15b-live.ts): the genuine week-130 capture, r04 at natural negative cash, and two
// validator-accepted drains. Expected values are derived by hand at each call site:
//   player fixed cost 15,000 → loan max = floor(26·15,000/1,000)·1,000 = 390,000; total = 390,000·1.12 =
//   436,800; 436,800 mod 52 = 0 → 52 installments of 8,400, installment i due at 134 + 1 + i.
//   A player drained to −1 at week 130 is negative from week 131: warning at 134 (lowRun 4), distress at 138
//   (negativeRun 8, distressWeeks 1), closure due at 163 (distressWeeks 26, negativeRun 33).
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { applyActions } from '../src/core/actions.js'
import { loanMaxPrincipal } from '../src/core/studioLoan.js'
import { studioWeeklyFixedCost } from '../src/core/powerRankingArchive.js'
import { FOUNDING_FUNDING_SAVE_VERSION, LIVE_SAVE_VERSION, makeSave, P15B_SAVE_VERSION, stableStringify } from '../src/core/save.js'
import { EXPECTED_LIVE_SAVE_VERSION } from './helpers/live-era.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { generateWorld } from '../src/core/worldgen.js'
import type { Action, GameState } from '../src/core/types.js'
import { base, BASE_WEEK, canon, closureOf, conditionRoot, drainPlayer, drainRival, eventsOf, ledgerRows, loansOf, PLAYER, R01, R04, raw, recordOf, refuses, rivalCash, rivalMovement, sequenceNext, ticks, ticksTo } from './helpers/p15b-live.js'

const PLAYER_FIXED = 15_000
const PLAYER_LOAN_MAX = 390_000
const PLAYER_LOAN_TOTAL = 436_800
const PLAYER_INSTALLMENT = 8_400
const ENTERED_AT_130 = [PLAYER, R01, 'studio-aca408ec-r02', 'studio-aca408ec-r03', R04].sort()

async function live(): Promise<Record<string, unknown>> {
  return (await import('../src/core/corporateConditionLive.js')) as unknown as Record<string, unknown>
}
function fn<T extends (...a: any[]) => any>(mod: Record<string, unknown>, name: string): T {
  const value = mod[name]
  if (typeof value !== 'function') throw new Error(`RED: src/core/corporateConditionLive.ts exports no function '${name}'`)
  return value as T
}
async function phaseEntry(phaseId: string): Promise<{ phaseOrdinal: number; phaseOrderVersion: number }> {
  const mod = (await import('../src/core/p15Phases.js')) as unknown as { P15_PHASE_ORDER_VERSION: number; P15_PHASE_TABLES: Record<number, { phaseId: string; phaseOrdinal: number }[]> }
  const entry = mod.P15_PHASE_TABLES[mod.P15_PHASE_ORDER_VERSION]!.find((e) => e.phaseId === phaseId)
  if (entry === undefined) throw new Error(`RED: the live phase table has no ${phaseId} entry`)
  return { phaseOrdinal: entry.phaseOrdinal, phaseOrderVersion: mod.P15_PHASE_ORDER_VERSION }
}
const takeLoan = (principal: number): Action => ({ kind: 'takeLoan', principal } as unknown as Action)

// Routes, memoized per file. `negativePlayer`: cash −1 at 130, so every evaluated week is negative.
let negativePlayerRoute: Map<number, GameState> | null = null
function negativePlayer(toWeek: number): Map<number, GameState> {
  if (negativePlayerRoute === null || !negativePlayerRoute.has(toWeek)) {
    const from = negativePlayerRoute === null ? drainPlayer(base(), base().studio.cash + 1) : [...negativePlayerRoute.values()].at(-1)!
    const more = ticksTo(from, toWeek)
    negativePlayerRoute = new Map([...(negativePlayerRoute ?? new Map()), ...more])
  }
  return negativePlayerRoute
}
let naturalRoute: Map<number, GameState> | null = null
function natural(toWeek: number): Map<number, GameState> {
  if (naturalRoute === null || !naturalRoute.has(toWeek)) {
    const from = naturalRoute === null ? base() : [...naturalRoute.values()].at(-1)!
    naturalRoute = new Map([...(naturalRoute ?? new Map()), ...ticksTo(from, toWeek)])
  }
  return naturalRoute
}

describe('p15b2 live condition: root, facts and the evaluated set (1357-A §3-§4)', () => {
  it('condition-root-fresh-and-live-version', () => {
    // P16 rebase round 6: the P15B save step is frozen at Save48, one step above founding's; the live version is P16's.
    expect(P15B_SAVE_VERSION, 'the P15B save step stacks on the founding step').toBe(FOUNDING_FUNDING_SAVE_VERSION + 1)
    expect(LIVE_SAVE_VERSION, 'the live version is the P16 step above it').toBe(EXPECTED_LIVE_SAVE_VERSION)
    const fresh = generateWorld('p15b2-fresh')
    expect(canon(conditionRoot(fresh))).toBe(canon({ version: 1, recordedFromWeek: 0, nextEvent: 1, nextLoan: 1, studios: [], events: [], loans: [] }))
    const migrated = conditionRoot(base())
    expect(canon(migrated)).toBe(canon({ version: 1, recordedFromWeek: BASE_WEEK, nextEvent: 1, nextLoan: 1, studios: [], events: [], loans: [] }))
  })

  it('condition-facts-mapping', async () => {
    const conditionFacts = fn<(state: GameState, studioId: string) => { week: number; cash: number; weeklyFixedCost: number; loanInstallment: number }>(await live(), 'conditionFacts')
    const s = base()
    expect(conditionFacts(s, PLAYER)).toEqual({ week: BASE_WEEK, cash: s.studio.cash, weeklyFixedCost: PLAYER_FIXED, loanInstallment: 0 })
    expect(studioWeeklyFixedCost(s, PLAYER), 'premise: the shared fixed cost (1356-A §3)').toBe(PLAYER_FIXED)
    expect(conditionFacts(s, R04)).toEqual({ week: BASE_WEEK, cash: rivalCash(s, R04), weeklyFixedCost: studioWeeklyFixedCost(s, R04), loanInstallment: 0 })
    expect(rivalCash(s, R04), 'premise: r04 holds negative cash at the capture').toBeLessThan(0)
    // Amendment 4: a zero fixed cost refuses, and the message carries no money value. The one lawful
    // zero is the player's during a founding draft (1356-A §3), which the step never evaluates; the fact
    // adapter is the boundary that refuses it. (A rival's cost holds OVERHEAD_BASE, so it is never zero.)
    const forged: GameState = { ...s, founding: { applicantIds: [], budget: 0, spentBonus: 0 } }
    let message = ''
    try { conditionFacts(forged, PLAYER) } catch (error) { message = (error as Error).message }
    expect(message).toMatch(/fixed cost/)
    expect(message).not.toMatch(/\d{4,}/)
  })

  it('condition-evaluated-set', () => {
    const s131 = tick(base())
    const root = conditionRoot(s131)
    expect(root.studios.map((r) => r.studioId)).toEqual(ENTERED_AT_130)
    for (const record of root.studios) {
      expect([record.firstEvaluatedWeek, record.condition.week, record.condition.stage, record.definitionVersion])
        .toEqual([BASE_WEEK + 1, BASE_WEEK + 1, 'stable', 'corporate-condition/v1'])
      expect(record.condition.since).toBe(BASE_WEEK + 1)
    }
    expect(root.events).toEqual([])
    expect(root.loans).toEqual([])
    // A world with no industry evaluates nothing: the root is byte-identical after a tick.
    const headless = generateWorld('p15b2-headless')
    expect(headless.hollywood).toBeNull()
    expect(canon(conditionRoot(tick(headless)))).toBe(canon(conditionRoot(headless)))
  })

  it('condition-step-final-cash', async () => {
    const conditionFacts = fn<(state: GameState, studioId: string) => { cash: number }>(await live(), 'conditionFacts')
    const s131 = tick(base())
    // The week's final cash: 18,050,000 − 15,000 overhead.
    expect(s131.studio.cash).toBe(base().studio.cash - PLAYER_FIXED)
    expect(conditionFacts(s131, PLAYER).cash).toBe(s131.studio.cash)
    const record = recordOf(s131, PLAYER)!
    expect([record.condition.lowRun, record.condition.negativeRun, record.condition.clearRun]).toEqual([0, 0, 1])
    // r2 (stacked on R8's Save46 recovery): at 131 r04's negative capture balance is lifted by its facility
    // disposal refund (450,000) under cost cutting since 130, so the week's final cash is positive but still
    // under four weeks of cover: low, not negative (r1 measured [1, 1, 0] before R8 landed).
    const r04 = recordOf(s131, R04)!
    expect(rivalCash(s131, R04)).toBeGreaterThan(0)
    expect(rivalMovement(s131, R04, 'facilityDemolitionRefund')).toBeGreaterThan(0)
    expect([r04.condition.lowRun, r04.condition.negativeRun, r04.condition.clearRun]).toEqual([1, 0, 0])
  })

  it('condition-step-rng-neutral', () => {
    const source = readFileSync(new URL('../src/core/corporateConditionLive.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/from '\.\/rng\.js'/)
    // The step draws nothing: a state whose only difference is cash advances the same stream.
    expect(tick(drainPlayer(base(), 1_000_000)).rngState).toBe(tick(base()).rngState)
  })
})

describe('p15b2 live condition: events, order, ids and the integer threshold (1357-A §4-§5)', () => {
  it('condition-step-order-ids-and-phase', async () => {
    const route = negativePlayer(134)
    const s134 = route.get(134)!
    const s133 = route.get(133)!
    const events = conditionRoot(s134).events
    // The player id sorts before every rival id; both warn at 134 with the law's causes.
    expect(events.map((e) => [e.eventId, e.studioId, e.week, e.from, e.to])).toEqual([
      ['corporate-event-1', PLAYER, 134, 'stable', 'warning'],
      ['corporate-event-2', R04, 134, 'stable', 'warning'],
    ])
    // r2 (stacked on R8's Save46 recovery): r04's refund at 131 keeps it positive through 133, so its warning at
    // 134 names four low weeks and one negative week (r1 measured four of each before R8 landed).
    expect(events.map((e) => e.causes)).toEqual([
      [{ code: 'LOW_COVER', weeks: 4 }, { code: 'NEGATIVE_CASH', weeks: 4 }],
      [{ code: 'LOW_COVER', weeks: 4 }, { code: 'NEGATIVE_CASH', weeks: 1 }],
    ])
    const entry = await phaseEntry('p15b.condition')
    for (const e of events) {
      expect([e.phaseId, e.phaseOrdinal, e.phaseOrderVersion, e.definitionVersion]).toEqual(['p15b.condition', entry.phaseOrdinal, entry.phaseOrderVersion, 'corporate-condition/v1'])
    }
    expect(events[1]!.p15DomainSequence).toBeGreaterThan(events[0]!.p15DomainSequence)
    expect(events[0]!.p15DomainSequence).toBe(sequenceNext(s133))
    expect(sequenceNext(s134)).toBe(sequenceNext(s133) + 2)
    expect(conditionRoot(s134).nextEvent).toBe(3)
    expect(recordOf(s134, PLAYER)!.condition).toMatchObject({ stage: 'warning', since: 134, week: 134 })
    // At most one event per studio per week; nothing fired before 134.
    expect(conditionRoot(s133).events).toEqual([])
  })

  it('condition-integer-cash-threshold', () => {
    // Cash at 131 is the capture's 18,050,000 less the drain and one 15,000 overhead; cover = cash / 15,000.
    const exact = ticks(drainPlayer(base(), base().studio.cash - 75_000), 1) // 60,000 at 131: cover 4, not low
    const below = ticks(drainPlayer(base(), base().studio.cash - 74_999), 1) // 59,999 at 131: low
    expect(exact.studio.cash).toBe(4 * PLAYER_FIXED)
    expect(recordOf(exact, PLAYER)!.condition.lowRun).toBe(0)
    expect(recordOf(below, PLAYER)!.condition.lowRun).toBe(1)
    // From 59,999 every later week is low: warning at 134. From 60,000 the first low week is 132: warning at 135.
    expect(eventsOf(ticks(below, 3), PLAYER).map((e) => [e.week, e.to])).toEqual([[134, 'warning']])
    expect(eventsOf(ticks(exact, 3), PLAYER)).toEqual([])
    expect(eventsOf(ticks(exact, 4), PLAYER).map((e) => [e.week, e.to])).toEqual([[135, 'warning']])
  })

  it('condition-lemma-b-live', () => {
    // Distress begins in the eighth negative week whatever the cover threshold (1352-F Lemma B).
    const original = TUNING.CORPORATE_WARN_COVER_WEEKS
    try {
      for (const cover of [2, 4, 8]) {
        ;(TUNING as { CORPORATE_WARN_COVER_WEEKS: number }).CORPORATE_WARN_COVER_WEEKS = cover
        const s138 = ticks(drainPlayer(base(), base().studio.cash + 1), 8)
        const distress = eventsOf(s138, PLAYER).find((e) => e.to === 'distress')
        expect(distress?.week, `cover threshold ${cover}`).toBe(138)
        expect(recordOf(s138, PLAYER)!.condition.distressWeeks).toBe(1)
      }
    } finally {
      ;(TUNING as { CORPORATE_WARN_COVER_WEEKS: number }).CORPORATE_WARN_COVER_WEEKS = original
    }
  })

  it('closure-due-event-and-absorbing-record', async () => {
    const closureDue = fn<(state: GameState, studioId: string) => boolean>(await live(), 'closureDue')
    // r04 drained far below what its distress-week loan can lift: closure due at 163.
    const route = ticksTo(drainRival(base(), R04, 10_000_000), 165)
    const s163 = route.get(163)!
    const closed = eventsOf(s163, R04).find((e) => e.to === 'closed')
    expect(closed).toMatchObject({ week: 163, from: 'distress', to: 'closed', causes: [{ code: 'DISTRESS_DURATION', weeks: 26 }, { code: 'NEGATIVE_CASH', weeks: 33 }] })
    expect(recordOf(s163, R04)!.condition).toMatchObject({ stage: 'closed', since: 163, week: 163, distressWeeks: 0 })
    expect(closureDue(s163, R04)).toBe(true)
    expect(closureDue(route.get(162)!, R04)).toBe(false)
    // 1352-F3 item 1: a closed record is never evaluated again; the player keeps being evaluated.
    expect(canon(recordOf(route.get(165)!, R04))).toBe(canon(recordOf(s163, R04)))
    expect(eventsOf(route.get(165)!, R04).length).toBe(eventsOf(s163, R04).length)
    expect(recordOf(route.get(165)!, PLAYER)!.condition.week).toBe(165)
  })
})

describe('p15b2 readers P16 consumes (1370-as REVIEW finding 2)', () => {
  it('p16-readers-condition-record-and-outstanding-loan', async () => {
    // Exact names: `conditionRecord(state, studioId)` and `outstandingLoan(state, studioId)`. With the root
    // present they answer (undefined when the studio has none) and never throw; without the root they
    // refuse by name rather than defaulting to stable / no loan.
    const mod = await live()
    const conditionRecord = fn<(state: GameState, studioId: string) => { studioId: string; condition: { stage: string } } | undefined>(mod, 'conditionRecord')
    const outstandingLoan = fn<(state: GameState, studioId: string, week?: number) => { loanId: string } | undefined>(mod, 'outstandingLoan')
    expect(conditionRecord(base(), PLAYER)).toBeUndefined()
    expect(outstandingLoan(base(), PLAYER)).toBeUndefined()
    const s134 = negativePlayer(134).get(134)!
    expect(conditionRecord(s134, PLAYER)).toMatchObject({ studioId: PLAYER, condition: { stage: 'warning' } })
    expect(conditionRecord(s134, R04)).toMatchObject({ studioId: R04 })
    expect(conditionRecord(s134, 'studio-aca408ec-r09')).toBeUndefined()
    const borrowed = applyActions(s134, [takeLoan(PLAYER_LOAN_MAX)])
    expect(outstandingLoan(borrowed, PLAYER)).toMatchObject({ loanId: 'corporate-loan-1' })
    expect(outstandingLoan(borrowed, R04)).toBeUndefined()
    expect(outstandingLoan(borrowed, PLAYER, 134 + 53)).toBeUndefined()
    const stripped = { ...base() } as Record<string, unknown>
    delete stripped.corporateCondition
    refuses(() => conditionRecord(stripped as unknown as GameState, PLAYER), 'corporateCondition')
    refuses(() => outstandingLoan(stripped as unknown as GameState, PLAYER), 'corporateCondition')
  })
})

describe('p15b2 loans: takeLoan, installments, the rival policy and cover (1357-A §6)', () => {
  it('take-loan-eligibility-first', () => {
    // r3 (review T15): every refused input is snapshotted before and compared after its own refusal.
    const refusesPurely = (state: GameState, text: string) => {
      const bytes = stableStringify(state)
      refuses(() => applyActions(state, [takeLoan(PLAYER_LOAN_MAX)]), text)
      expect(stableStringify(state), `nothing written by the refusal "${text}"`).toBe(bytes)
    }
    const s130 = base()
    refusesPurely(s130, 'This studio has no corporate condition this week.')
    const s131 = tick(s130)
    refusesPurely({ ...s131, founding: { applicantIds: [], budget: 0, spentBonus: 0 } }, 'A studio cannot borrow during its founding draft.')
    refusesPurely(s131, 'Loans are available only in warning or distress.')
    // Repaying: a second loan in warning refuses; recovery (after a distress-week loan lifts cover) refuses by stage.
    const s134 = negativePlayer(134).get(134)!
    const borrowed = applyActions(s134, [takeLoan(PLAYER_LOAN_MAX)])
    refusesPurely(borrowed, 'This studio is still repaying its loan; one loan at a time.')
    const s138 = negativePlayer(138).get(138)!
    expect(recordOf(s138, PLAYER)!.condition.stage).toBe('distress')
    const recovered = tick(applyActions(s138, [takeLoan(PLAYER_LOAN_MAX)]))
    expect(recordOf(recovered, PLAYER)!.condition.stage).toBe('recovery')
    refusesPurely(recovered, 'Loans are available only in warning or distress.')
    // A batch whose second action refuses writes nothing, its first loan included.
    const batch = stableStringify(s134)
    refuses(() => applyActions(s134, [takeLoan(PLAYER_LOAN_MAX), takeLoan(PLAYER_LOAN_MAX)]), 'one loan at a time')
    expect(stableStringify(s134)).toBe(batch)
  })

  it('take-loan-principal-and-writes', async () => {
    const entry = await phaseEntry('p15b.condition')
    const s134 = negativePlayer(134).get(134)!
    expect(recordOf(s134, PLAYER)!.condition.stage).toBe('warning')
    expect(loanMaxPrincipal(PLAYER_FIXED)).toBe(PLAYER_LOAN_MAX)
    for (const principal of [0, -1000, 1500, PLAYER_LOAN_MAX + 1000]) {
      let message = ''
      try { applyActions(s134, [takeLoan(principal)]) } catch (error) { message = (error as Error).message }
      expect(message, `principal ${principal}`).toMatch(/principal/)
    }
    const next = applyActions(s134, [takeLoan(PLAYER_LOAN_MAX)])
    const loans = loansOf(next, PLAYER)
    expect(loans.length).toBe(1)
    const loan = loans[0]!
    expect(loan).toMatchObject({ loanId: 'corporate-loan-1', studioId: PLAYER, lawVersion: 'studio-loan/v1', contractedWeek: 134,
      weeklyFixedCostAtContract: PLAYER_FIXED, principal: PLAYER_LOAN_MAX, total: PLAYER_LOAN_TOTAL,
      phaseId: 'p15b.condition', phaseOrdinal: entry.phaseOrdinal, phaseOrderVersion: entry.phaseOrderVersion, p15DomainSequence: sequenceNext(s134) })
    expect(loan.installments.length).toBe(52)
    expect(loan.installments.every((n) => n === PLAYER_INSTALLMENT)).toBe(true)
    expect(next.studio.cash).toBe(s134.studio.cash + PLAYER_LOAN_MAX)
    expect(ledgerRows(next, 'loanPrincipal')).toEqual([{ week: 134, kind: 'loanPrincipal', amount: PLAYER_LOAN_MAX, note: 'studio loan principal' }])
    expect(next.ledger.length).toBe(s134.ledger.length + 1)
    expect(conditionRoot(next).nextLoan).toBe(2)
    expect(sequenceNext(next)).toBe(sequenceNext(s134) + 1)
    for (const key of Object.keys(raw(s134))) {
      if (['studio', 'ledger', 'corporateCondition', 'p15Sequence'].includes(key)) continue
      expect(canon(raw(next)[key]), `root ${key} must not move`).toBe(canon(raw(s134)[key]))
    }
    expect(() => makeSave(next)).not.toThrow()
  })

  it('loan-installments-charged', () => {
    const s134 = negativePlayer(134).get(134)!
    const borrowed = applyActions(s134, [takeLoan(PLAYER_LOAN_MAX)])
    // The advance from 134 charges nothing (the first installment is due at 135); the advance from 135 charges 8,400.
    const s135 = tick(borrowed)
    expect(ledgerRows(s135, 'loanInstallment')).toEqual([])
    const s136 = tick(s135)
    expect(ledgerRows(s136, 'loanInstallment')).toEqual([{ week: 135, kind: 'loanInstallment', amount: -PLAYER_INSTALLMENT, note: 'studio loan installment' }])
    expect(s136.studio.cash).toBe(s135.studio.cash - PLAYER_FIXED - PLAYER_INSTALLMENT)
    // The schedule is the pure law's: 52 installments summing to the total. Wave 4 closes a studio that
    // stays negative, and a borrowed player with no income is closed at its closure week C before the term
    // ends; every installment due before C is charged whatever the cash, none at or after C, and the
    // closure record carries the stop (closure/v1 §2; the save validator reconciles every charged week).
    const loan = loansOf(s136, PLAYER)[0]!
    expect(loan.installments.length).toBe(52)
    expect(loan.installments.reduce((a, b) => a + b, 0)).toBe(PLAYER_LOAN_TOTAL)
    let closed = s136
    while (closureOf(closed, PLAYER) === undefined) closed = tick(closed)
    const C = closed.market.tick
    expect(C).toBeGreaterThan(136)
    const rows = ledgerRows(closed, 'loanInstallment')
    expect(rows.map((r) => r.week)).toEqual(Array.from({ length: C - 135 }, (_, i) => 135 + i))
    rows.forEach((r, i) => expect(r.amount).toBe(-loan.installments[i]!))
    const charged = rows.reduce((sum, r) => sum - r.amount, 0)
    expect(closed.studio.cash).toBe(borrowed.studio.cash - (C - 134) * PLAYER_FIXED - charged)
    expect(closed.studio.cash).toBeLessThan(0)
    expect(closureOf(closed, PLAYER)!.loan).toEqual({ loanId: loan.loanId, stopWeek: C, paidInstallments: C - 135, paidAmount: charged, remainder: PLAYER_LOAN_TOTAL - charged })
    refuses(() => tick(closed), 'read-only')
  })

  it('rival-loan-policy', async () => {
    const conditionFacts = fn<(state: GameState, studioId: string) => { loanInstallment: number }>(await live(), 'conditionFacts')
    // r2 (stacked on R8's Save46 recovery): r04's refund at 131 delays its natural distress from 138 (r1) to 141.
    const D = 141
    const route = natural(D + 2)
    const sBefore = route.get(D - 1)!
    const sD = route.get(D)!
    expect(eventsOf(sD, R04).map((e) => [e.week, e.to])).toEqual([[134, 'warning'], [D, 'distress']])
    expect(loansOf(sBefore, R04), 'no loan in warning').toEqual([])
    const loans = loansOf(sD, R04)
    expect(loans.length).toBe(1)
    const wfc = studioWeeklyFixedCost(sD, R04)
    const loan = loans[0]!
    expect(loan).toMatchObject({ studioId: R04, contractedWeek: D, weeklyFixedCostAtContract: wfc, principal: loanMaxPrincipal(wfc), lawVersion: 'studio-loan/v1' })
    expect(loan.loanId).toMatch(/^corporate-loan-\d+$/)
    expect(rivalMovement(sD, R04, 'loanPrincipal')).toBe(loan.principal)
    expect(rivalCash(sBefore, R04)).toBeLessThan(0)
    expect(rivalCash(sD, R04)).toBeGreaterThan(0)
    // The distress event precedes the loan in the one sequence; the player never receives an automatic loan.
    expect(loan.p15DomainSequence).toBeGreaterThan(eventsOf(sD, R04).find((e) => e.to === 'distress')!.p15DomainSequence)
    expect(loansOf(negativePlayer(138).get(138)!, PLAYER)).toEqual([])
    // §6.4/§3.2: the next boundary's facts carry the installment, cover is restored and the rival recovers.
    const sNext = route.get(D + 1)!
    expect(conditionFacts(sNext, R04).loanInstallment).toBe(loan.installments[0])
    expect(eventsOf(sNext, R04).at(-1)).toMatchObject({ week: D + 1, from: 'distress', to: 'recovery', causes: [{ code: 'COVER_RESTORED', weeks: 1 }] })
    // The installment due at D + 1 is charged in the advance from D + 1: the movement appears at D + 2, after facility opex.
    expect(rivalMovement(sNext, R04, 'loanInstallment')).toBe(0)
    expect(rivalMovement(route.get(D + 2)!, R04, 'loanInstallment')).toBe(-loan.installments[0]!)
  })

  // r3 (1366-O O6; 1363-A2 §5 "O6 integration contract", RED L1; review C1/D1/T3): the committed principal ends R8's
  // cost cutting in the same returned business, one atomic transition; installments and the refused second loan never
  // clear it; the next decision runs the ordinary staff()/decide() laws and may lawfully re-enter cutting.
  it('o6-loan-principal-ends-cost-cutting', () => {
    const D = 141
    const route = natural(186)
    const cutting = (s: GameState) => s.hollywood!.businesses.find((b) => b.studioId === R04)!.costCutting.since
    expect(cutting(route.get(D - 1)!), 'premise: r04 cuts costs from its decision at 130').toBe(130)
    const sD = route.get(D)!
    expect(loansOf(sD, R04).map((l) => l.contractedWeek)).toEqual([D])
    expect(rivalMovement(sD, R04, 'loanPrincipal')).toBe(loansOf(sD, R04)[0]!.principal)
    expect(cutting(sD), 'the principal and the clear land in one state').toBeNull()
    expect(() => makeSave(sD)).not.toThrow()
    // No exemption: the ordinary decision at input week D re-enters cutting under R8's own entry law.
    expect(cutting(route.get(D + 1)!)).toBe(D)
    // Installments (charged from D + 2) and the refused second loan never clear it again, through r04's closure.
    for (let week = D + 1; week < 186; week++) {
      expect(cutting(route.get(week)!), `week ${week}`).toBe(D)
      expect(loansOf(route.get(week)!, R04).length, `week ${week}`).toBe(1)
    }
  })

  it('o6-ordinary-staffing-resumes-after-the-principal', () => {
    // r01 drained by 14M at 130 cuts costs from its decision at 155 and borrows in distress at 188, the week its
    // writer's interval ends. Cutting skips renewals (R8); with the principal booked, staff() renews the writer.
    const L = 188
    const route = ticksTo(drainRival(base(), R01, 14_000_000), L + 1)
    const b = (s: GameState) => s.hollywood!.businesses.find((x) => x.studioId === R01)!
    expect(b(route.get(L - 1)!).costCutting.since).toBe(155)
    expect(loansOf(route.get(L)!, R01).map((l) => l.contractedWeek)).toEqual([L])
    expect(b(route.get(L)!).costCutting.since).toBeNull()
    const renewals = route.get(L + 1)!.hollywood!.receipts.filter((r) => r.kind === 'employment' && r.studioId === R01 && r.week === L && r.reason === 'renewal')
    expect(renewals.length).toBe(1)
    // The same decision re-enters cutting lawfully, and the renewed campaign saves.
    expect(b(route.get(L + 1)!).costCutting.since).toBe(L)
    expect(() => makeSave(route.get(L + 1)!)).not.toThrow()
  })
})
