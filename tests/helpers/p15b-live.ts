// ── P15B Waves 2–5 (record 1370-ar): shared routes and accessors for the live condition, loan and
// closure REDs. Not a test file (vitest collects only tests/**/*.test.ts).
//
// Base: the genuine Save42 capture of p13a-core-causal-01 at week 130 (tests/p14d1-rival-shelving-
// fixtures.ts), migrated to the live version. At that week the player is founded and engaged with
// no contracts (cash 18,050,000; fixed cost 15,000), rivals r01–r04 have entered, and r04 already
// holds NEGATIVE cash (−33,191, burning 126,026 a week), so the condition law reaches warning,
// distress and closure due on it naturally. r2 (stacked on R8's Save46 recovery): r04 disposes a facility
// at 131 under cost cutting (refund 450,000), so its natural route warns at 134, borrows in distress at
// 141 and recovers at 142 (r1 measured 134 / 138 / 139 before R8 landed); the heavily drained closure
// route below is unchanged (warning 134, distress 138, closure 163).
//
// Drains: two validator-accepted cash movements, used where a scenario needs a chosen balance.
// Both pass `makeSave` before and after ticking (probe of 2026-10-10 15:42). They are fixtures, not
// captures: a drained state is lawful in shape, never a claim about the natural route.
//
// r3 (review D13): no route funds the player any more (a positive `publicity` row is not a lawful income). A route
// whose premise is another law, never the player's cash, plays its world as the browser Studio Lot does
// (`PLAYER_CLOSURE_DEFERRED`, the tick option ui/src/engine/adapter.ts passes): the player's closure due is recorded
// and left due, every other law runs, and no money is injected.
import { expect } from 'vitest'
import { stableStringify } from '../../src/core/save.js'
import { applyActions } from '../../src/core/actions.js'
import { P15_PHASE_ORDER_VERSION, P15_PHASE_TABLES } from '../../src/core/p15Phases.js'
import { tick, type TickOptions } from '../../src/core/tick.js'
import type { Action, GameState } from '../../src/core/types.js'
import { liveWeek130 } from '../p14d1-rival-shelving-fixtures.js'

export const PLAYER = 'studio-aca408ec-player'
export const R01 = 'studio-aca408ec-r01'
export const R02 = 'studio-aca408ec-r02'
export const R03 = 'studio-aca408ec-r03'
export const R04 = 'studio-aca408ec-r04'
export const BASE_WEEK = 130

let baseState: GameState | null = null
/** The genuine week-130 capture, migrated to live, loaded once per file. Callers never mutate it. */
export function base(): GameState {
  if (baseState === null) baseState = liveWeek130()
  return baseState
}

export const canon = (value: unknown): string => stableStringify(JSON.parse(JSON.stringify(value)))
export const raw = (state: GameState): Record<string, unknown> => state as unknown as Record<string, unknown>

/** Lowers the player's cash by `amount` through one `publicity` ledger row at the current week. */
export function drainPlayer(state: GameState, amount: number): GameState {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('drainPlayer: amount must be a positive integer')
  return { ...state, studio: { ...state.studio, cash: state.studio.cash - amount },
    ledger: [...state.ledger, { week: state.market.tick, kind: 'publicity', amount: -amount, note: 'p15b test drain' }] }
}

/** The browser Studio Lot's closure gate (tick option `deferPlayerClosure`), for routes whose premise is another law. */
export const PLAYER_CLOSURE_DEFERRED: TickOptions = { deferPlayerClosure: true }
/** `advanceTo` (src/harness/p13a/fixtures.ts) under PLAYER_CLOSURE_DEFERRED: natural ticks, the player's closure left due. */
export function advanceDeferred(state: GameState, week: number): GameState {
  if (week < state.market.tick) throw new Error('Evidence cannot rewind a campaign')
  let next = state
  while (next.market.tick < week) next = tick(next, PLAYER_CLOSURE_DEFERRED)
  return next
}

/** Lowers a rival's cash by `amount` by raising one settled film's production commitment (the costed
 * project row, the film's directCommitment and the last finance period move together). */
export function drainRival(state: GameState, studioId: string, amount: number): GameState {
  const h = state.hollywood
  if (h === null) throw new Error('drainRival: no industry')
  const index = h.businesses.findIndex((b) => b.studioId === studioId)
  const b = h.businesses[index]
  if (b === undefined) throw new Error(`drainRival: ${studioId} has no business`)
  const produced = b.projects.findIndex((p) => p.productionId !== null &&
    h.films.some((f) => f.filmId === p.productionId && f.provenance === 'simulation/v1' && f.settledWeek !== null))
  if (produced < 0) throw new Error(`drainRival: ${studioId} has no settled film to charge`)
  const cost = b.projects[produced]!
  const last = b.account.periods.length - 1
  const periods = b.account.periods.map((p, i) => i === last
    ? { ...p, movements: { ...p.movements, production: p.movements.production - amount }, closing: p.closing - amount } : p)
  const business = { ...b, account: { ...b.account, cash: b.account.cash - amount, periods },
    projects: b.projects.map((p, i) => (i === produced ? { ...p, production: p.production + amount } : p)) }
  const films = h.films.map((f) => (f.filmId === cost.productionId && f.provenance === 'simulation/v1'
    ? { ...f, directCommitment: f.directCommitment + amount } : f))
  return { ...state, hollywood: { ...h, films, businesses: h.businesses.map((x, i) => (i === index ? business : x)) } }
}

export function ticks(state: GameState, n: number): GameState {
  let next = state
  for (let i = 0; i < n; i++) next = tick(next)
  return next
}

/** Every state from `from` up to and including the one at `toWeek`, keyed by week. */
export function ticksTo(from: GameState, toWeek: number): Map<number, GameState> {
  const states = new Map<number, GameState>([[from.market.tick, from]])
  let next = from
  while (next.market.tick < toWeek) {
    next = tick(next)
    states.set(next.market.tick, next)
  }
  return states
}

// ── the roots, read through accessors that fail RED by name ──────────────────
export type Condition = { stage: string; since: number; week: number; lowRun: number; negativeRun: number; clearRun: number; distressWeeks: number }
export type ConditionRecord = { studioId: string; firstEvaluatedWeek: number; definitionVersion: string; condition: Condition }
export type ConditionEvent = { eventId: string; studioId: string; week: number; from: string; to: string; causes: { code: string; weeks: number }[]; definitionVersion: string; p15DomainSequence: number; phaseId: string; phaseOrdinal: number; phaseOrderVersion: number }
export type LoanRecord = { loanId: string; studioId: string; lawVersion: string; contractedWeek: number; weeklyFixedCostAtContract: number; principal: number; total: number; installments: number[]; p15DomainSequence: number; phaseId: string; phaseOrdinal: number; phaseOrderVersion: number }
export type ConditionRoot = { version: number; recordedFromWeek: number; nextEvent: number; nextLoan: number; studios: ConditionRecord[]; events: ConditionEvent[]; loans: LoanRecord[] }

export function conditionRoot(state: GameState): ConditionRoot {
  const root = raw(state).corporateCondition
  if (root === undefined) throw new Error('RED: GameState has no `corporateCondition` root (1357-A §4); the P15B Wave 2 step has not landed')
  return root as ConditionRoot
}
export const recordOf = (state: GameState, studioId: string): ConditionRecord | undefined =>
  conditionRoot(state).studios.find((r) => r.studioId === studioId)
export const eventsOf = (state: GameState, studioId: string): ConditionEvent[] =>
  conditionRoot(state).events.filter((e) => e.studioId === studioId)
export const loansOf = (state: GameState, studioId: string): LoanRecord[] =>
  conditionRoot(state).loans.filter((l) => l.studioId === studioId)

export type Claim = { claimId: string; closureId: string; studioId: string; kind: string; sourceContractId: string; claimantTalentId: string; lawVersion: string; original: number; paid: number; unpaid: number; status: string; payments: { week: number; amount: number; reference: string }[] }
export type Disposition = { subjectKind: string; subjectId: string; prior: string; result: string; status: string; claimId: string | null; lotId: string | null; lawVersion: string }
export type ClosureRecord = { closureId: string; studioId: string; closureWeek: number; causeEventId: string; lawVersion: string; p15DomainSequence: number; phaseId: string; phaseOrdinal: number; phaseOrderVersion: number;
  cash: { closing: number; distributable: number }; loan: { loanId: string; stopWeek: number; paidInstallments: number; paidAmount: number; remainder: number } | null;
  dispositions: Disposition[]; counts: Record<string, number>; digest: string;
  estate: { opensWeek: number; closesWeek: number; lots: { lotId: string; right: string; subjectId: string }[] };
  receipts: { week: number; kind: string; amount: number; reference: string }[]; endOfRun: unknown }
export type EstateEvent = { eventId: string; closureId: string; studioId: string; week: number; kind: string; amount: number; reference: string;
  p15DomainSequence: number; phaseId: string; phaseOrdinal: number; phaseOrderVersion: number }
export type ClosureRoot = { version: number; recordedFromWeek: number; nextClosure: number; nextClaim: number; nextEstateEvent: number; closures: ClosureRecord[]; claims: Claim[]; estateEvents: EstateEvent[] }

export function closureRoot(state: GameState): ClosureRoot {
  const root = raw(state).studioClosure
  if (root === undefined) throw new Error('RED: GameState has no `studioClosure` root (closure/v1); the P15B Wave 4 step has not landed')
  return root as ClosureRoot
}
export const closureOf = (state: GameState, studioId: string): ClosureRecord | undefined =>
  closureRoot(state).closures.find((c) => c.studioId === studioId)
export const claimsOf = (state: GameState, closureId: string): Claim[] =>
  closureRoot(state).claims.filter((c) => c.closureId === closureId)
export const estateEventsOf = (state: GameState, closureId: string): EstateEvent[] => {
  const events = closureRoot(state).estateEvents
  if (events === undefined) throw new Error('RED: studioClosure has no `estateEvents` (r3: estate transactions are their own sequenced records, review C8)')
  return events.filter((e) => e.closureId === closureId)
}

/** Pins that only the named top-level keys differ between two states (serialization-level). */
export function expectOnlyKeysMoved(before: GameState, after: GameState, moved: readonly string[]): void {
  const a = raw(before)
  const b = raw(after)
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (moved.includes(key)) continue
    expect(canon(b[key]), `root ${key} must not move`).toBe(canon(a[key]))
  }
}

/** The one P15 allocator. */
export const sequenceNext = (state: GameState): number => (raw(state).p15Sequence as { next: number }).next

export function rivalCash(state: GameState, studioId: string): number {
  const b = state.hollywood?.businesses.find((x) => x.studioId === studioId)
  if (b === undefined) throw new Error(`no business ${studioId}`)
  return b.account.cash
}
export function rivalMovement(state: GameState, studioId: string, kind: string): number {
  const b = state.hollywood?.businesses.find((x) => x.studioId === studioId)
  if (b === undefined) throw new Error(`no business ${studioId}`)
  return b.account.periods.reduce((sum, p) => sum + ((p.movements as Record<string, number>)[kind] ?? 0), 0)
}
export const ledgerRows = (state: GameState, kind: string) => state.ledger.filter((row) => (row.kind as string) === kind)

/** Expects `fn` to throw with a message containing `text`. */
export function refuses(fn: () => unknown, text: string): void {
  let message: string | null = null
  try { fn() } catch (error) { message = (error as Error).message }
  expect(message, `expected a refusal naming "${text}"`).not.toBeNull()
  expect(message).toContain(text)
}

// ── Wave 4 routes ────────────────────────────────────────────────────────────
/** r04 drained far below what its distress-week loan lifts: warning 134, distress 138, closure due and actual closure at 163. */
export const R04_CLOSURE_WEEK = 163
let rivalRoute: Map<number, GameState> | null = null
export function rivalClosure(toWeek: number): Map<number, GameState> {
  if (rivalRoute === null || (rivalRoute.size > 0 && Math.max(...rivalRoute.keys()) < toWeek)) {
    const from = rivalRoute === null ? drainRival(base(), R04, 10_000_000) : rivalRoute.get(Math.max(...rivalRoute.keys()))!
    const more = ticksTo(from, toWeek)
    rivalRoute = rivalRoute === null ? more : new Map([...rivalRoute, ...more])
  }
  return rivalRoute
}
/** The player signs the capture's free agent at 130 (one contract, one claim) and is drained to −1: closure at 163.
 * The route stops at the first week holding a player closure record, or at `limit`, since a closed player never ticks. */
let playerRoute: Map<number, GameState> | null = null
export function playerClosure(limit = 170): Map<number, GameState> {
  if (playerRoute === null) {
    const s = base()
    const talentId = s.freeAgents[0]
    if (talentId === undefined) throw new Error('premise: the capture holds a free agent to sign')
    const hired = applyActions(s, [{ kind: 'signContract', talentId, termWeeks: 52 } as Action])
    let next = drainPlayer(hired, hired.studio.cash + 1)
    playerRoute = new Map([[next.market.tick, next]])
    while (next.market.tick < limit && closureOf(next, PLAYER) === undefined) {
      next = tick(next)
      playerRoute.set(next.market.tick, next)
    }
  }
  return playerRoute
}

// ── r3 routes ────────────────────────────────────────────────────────────────
/** The shifted player route of review C6/D3: the player signs the capture's free agent at 130 for 52 weeks (its
 * interval ends at 182, so the market opens its expiry case at 170), is drained to −1 at 137, and becomes closure due
 * at 170 with that case open. Stops at the first week holding a player closure record, or at `limit`. */
let marketCaseRoute: Map<number, GameState> | null = null
export const MARKET_CASE_CLOSURE_WEEK = 170
export function marketCaseClosure(limit = MARKET_CASE_CLOSURE_WEEK + 1): Map<number, GameState> {
  if (marketCaseRoute === null) {
    const s = base()
    const hired = applyActions(s, [{ kind: 'signContract', talentId: s.freeAgents[0]!, termWeeks: 52 } as Action])
    let next = ticks(hired, 7)
    next = drainPlayer(next, Math.ceil(next.studio.cash) + 1)
    marketCaseRoute = new Map([[next.market.tick, next]])
    while (next.market.tick < limit && closureOf(next, PLAYER) === undefined) {
      next = tick(next)
      marketCaseRoute.set(next.market.tick, next)
    }
  }
  return marketCaseRoute
}

/**
 * r3 premise device for the estate's end-to-end leaves (review T7, C8, D5; contract RED 3 and RED 5). No natural route
 * closes a studio while one of its runs is still active: production (8 weeks) and run (6 weeks) together are shorter
 * than the 33 negative weeks a closure needs, and a studio in distress cannot afford a package. So this route forges
 * the migration boundary instead of any money or run: the capture's condition root as if recorded from week 98, every
 * entered studio evaluated from 99, r03 warned at 102 and in distress since 106 (25 distress weeks at 130), the rest
 * stable. r03 holds an active run (film 13, three installments left after the one due at 130) and a production (film
 * 14). It is drained so that its week-131 cash is `ESTATE_CLOSING_DEFICIT` below zero: it closes at 131 with both live,
 * and every later week is natural ticks. The forged root passes `makeSave` at 130.
 */
export const ESTATE_CLOSURE_WEEK = 131
export const ESTATE_CLOSING_DEFICIT = 300_000
export function forgedConditionRoot(state: GameState): GameState {
  const entry = P15_PHASE_TABLES[P15_PHASE_ORDER_VERSION]!.find((e) => e.phaseId === 'p15b.condition')!
  const triple = { phaseId: 'p15b.condition', phaseOrdinal: entry.phaseOrdinal, phaseOrderVersion: P15_PHASE_ORDER_VERSION }
  const entered = state.hollywood!.identities.filter((i) => i.enteredWeek !== null).map((i) => i.studioId).sort()
  const studios = entered.map((studioId) => ({ studioId, firstEvaluatedWeek: 99, definitionVersion: 'corporate-condition/v1',
    condition: studioId === R03 ? { stage: 'distress', since: 106, week: 130, lowRun: 32, negativeRun: 32, clearRun: 0, distressWeeks: 25 }
      : { stage: 'stable', since: 99, week: 130, lowRun: 0, negativeRun: 0, clearRun: 32, distressWeeks: 0 } }))
  const events = [
    { eventId: 'corporate-event-1', studioId: R03, week: 102, from: 'stable', to: 'warning', causes: [{ code: 'LOW_COVER', weeks: 4 }, { code: 'NEGATIVE_CASH', weeks: 4 }], definitionVersion: 'corporate-condition/v1', p15DomainSequence: 1, ...triple },
    { eventId: 'corporate-event-2', studioId: R03, week: 106, from: 'warning', to: 'distress', causes: [{ code: 'NEGATIVE_CASH', weeks: 8 }, { code: 'LOW_COVER', weeks: 8 }], definitionVersion: 'corporate-condition/v1', p15DomainSequence: 2, ...triple },
  ]
  if ((raw(state).p15Sequence as { next: number }).next !== 1) throw new Error('forgedConditionRoot: the capture is expected to hold no P15 row yet')
  return { ...state, corporateCondition: { version: 1, recordedFromWeek: 98, nextEvent: 3, nextLoan: 1, studios, events, loans: [] }, p15Sequence: { version: 1, next: 3 } } as unknown as GameState
}
let estateRoute: Map<number, GameState> | null = null
export function forgedEstateRoute(toWeek: number): Map<number, GameState> {
  if (estateRoute === null) {
    const forged = forgedConditionRoot(base())
    const undrained = rivalCash(tick(forged), R03)
    estateRoute = new Map([[BASE_WEEK, drainRival(forged, R03, Math.ceil(undrained + ESTATE_CLOSING_DEFICIT))]])
  }
  const last = Math.max(...estateRoute.keys())
  if (last < toWeek) for (const [week, state] of ticksTo(estateRoute.get(last)!, toWeek)) estateRoute.set(week, state)
  return estateRoute
}
