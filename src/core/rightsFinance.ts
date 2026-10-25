// ── P16B: permitted bidders, reserve, commitment reservations and exact P16 cash moves ──
//
// Authority: P16 integration contract §6 ("stable-stage-only bidders for the first slice: an
// entered, operating studio, with founding completed, condition exactly stable, and no outstanding
// P15B distress loan ... Cash after all actual closing charges must cover the versioned
// post-purchase reserve ... a commitment reservation against spendable cash while a binding bid/
// offer is outstanding, released on rejection/expiry and consumed once on closing"); 1362-O §5.4
// (cash funded with reserve; rescue principal cannot fund purchases; outstanding distress loan bars
// bidding; no acquisition financing product).
//
// Pure. One law for player and rivals: the player's cash moves through `studio.cash` + a ledger
// row of a P16 kind; a rival's through `moveRivalMoney` on a copied account. Every move names its
// rights transaction in the note, and the rights root validator reconciles the two.

import type { ConditionStage } from './corporateCondition.js'
import { terminalWeekOf } from './operatingState.js'
import { conditionRecord, outstandingLoan } from './corporateConditionLive.js'
import { moveRivalMoney } from './hollywood.js'
import { studioWeeklyFixedCost } from './powerRankingArchive.js'
import { TUNING } from './tuning.js'
import type { GameState, P16LedgerKind } from './types.js'

/** The record P15B persists per evaluated studio (`StudioConditionRecord`), read structurally: only the stage matters here. */
export type ConditionStageRecord = { condition: { stage: ConditionStage } }

/**
 * THE permitted-bidder fact source: P15B's two live readers, by their exported names and signatures —
 * `corporateConditionLive.conditionRecord(state, studioId)` (the evaluated record, or undefined when the
 * studio has never been evaluated) and `corporateConditionLive.outstandingLoan(state, studioId, week)` (the
 * loan outstanding at `week`, or undefined). P16 reads nothing else about a studio's condition.
 */
export type CorporateConditionReaders = {
  conditionRecord: (state: GameState, studioId: string) => ConditionStageRecord | undefined
  outstandingLoan: (state: GameState, studioId: string, week: number) => object | undefined
}

/** Explicit negative unit-fixture readers; never the shipping default. */
export const UNBOUND_CORPORATE_CONDITION_READERS: CorporateConditionReaders = Object.freeze({
  conditionRecord: (): ConditionStageRecord | undefined => undefined,
  outstandingLoan: (_state: GameState, studioId: string): object | undefined => {
    throw new Error(`rights: the P15B loan reader is not bound; bind corporateConditionLive.outstandingLoan before reading ${studioId}`)
  },
})

/** P15B's evaluated condition and actual outstanding-loan readers are the default for every P16 entry. */
// Getters read the live bindings at access time: this module can evaluate inside the import cycle
// corporateConditionLive -> employment -> ... -> studioClosure -> estate -> rightsFinance -> corporateConditionLive,
// before corporateConditionLive has defined its exports, and a value captured then is undefined. The getters still
// return the same two functions (tests/p16b-live-condition-readers.test.ts pins that identity).
export const corporateConditionReaders: CorporateConditionReaders = Object.freeze({
  get conditionRecord() { return conditionRecord },
  get outstandingLoan() { return outstandingLoan },
})

export type ConditionFacts = { stage: ConditionStage; hasOutstandingLoan: boolean }

/** The two facts the first-slice matrix reads; null when the studio has no evaluated record (the loan reader is then never consulted). */
export function conditionFactsFor(state: GameState, studioId: string, week: number, readers: CorporateConditionReaders = corporateConditionReaders): ConditionFacts | null {
  const record = readers.conditionRecord(state, studioId)
  if (record === undefined) return null
  return { stage: record.condition.stage, hasOutstandingLoan: readers.outstandingLoan(state, studioId, week) !== undefined }
}

/** The first-slice permitted-bidder matrix (contract §6): identity law first, then the P15B facts; null when permitted. */
export function permittedBidderRefusal(state: GameState, studioId: string, week: number, readers: CorporateConditionReaders = corporateConditionReaders): string | null {
  const h = state.hollywood
  if (!h) return 'noIndustry'
  const identity = h.identities.find((i) => i.studioId === studioId)
  if (identity === undefined) return 'unknownStudio'
  if (identity.enteredWeek === null || identity.enteredWeek > week) return 'notOperating'
  if (studioId === h.playerStudioId) {
    if (state.founding !== null) return 'founding'
  } else if (!h.businesses.some((b) => b.studioId === studioId)) {
    return 'notOperating'
  }
  if (terminalWeekOf(state).has(studioId) || state.rights.estates.some((e) => e.studioId === studioId)) return 'terminal'
  const facts = conditionFactsFor(state, studioId, week, readers)
  if (facts === null) return 'conditionUnavailable'
  if (facts.stage !== 'stable') return `stageNotStable:${facts.stage}`
  if (facts.hasOutstandingLoan) return 'outstandingDistressLoan'
  return null
}

/** The studio's present weekly fixed cost (the P15 fact adapter the Power Ranking already uses). */
export function weeklyFixedCost(state: GameState, studioId: string): number {
  return studioWeeklyFixedCost(state, studioId)
}

export function studioCash(state: GameState, studioId: string): number {
  const h = state.hollywood
  if (!h) throw new Error('rights: no industry')
  if (studioId === h.playerStudioId) return state.studio.cash
  const business = h.businesses.find((b) => b.studioId === studioId)
  if (business === undefined) throw new Error(`rights: ${studioId} has no operating account`)
  return business.account.cash
}

/** Cash committed by this studio's open binding buy offers and sealed estate bids. */
export function reservedCash(state: GameState, studioId: string): number {
  let reserved = 0
  for (const o of state.rights.offers) if (o.status === 'open' && o.direction === 'buy' && o.offerorId === studioId) reserved += o.price
  for (const e of state.rights.estates) for (const b of e.bids) if (b.status === 'sealed' && b.bidderId === studioId) reserved += b.amount
  return reserved
}

export function spendableCash(state: GameState, studioId: string): number {
  return studioCash(state, studioId) - reservedCash(state, studioId)
}

/** The versioned post-purchase reserve: RIGHTS_RESERVE_WEEKS of the buyer's weekly fixed cost. */
export function postPurchaseReserve(state: GameState, studioId: string): number {
  return TUNING.RIGHTS_RESERVE_WEEKS * weeklyFixedCost(state, studioId)
}

/** Null when spendable cash after `outlay` still covers the reserve. */
export function affordabilityRefusal(state: GameState, studioId: string, outlay: number): string | null {
  return spendableCash(state, studioId) - outlay >= postPurchaseReserve(state, studioId) ? null : 'insufficientCashAfterReserve'
}

/** One signed P16 cash move on the studio's authoritative account, with its receipt. Zero moves nothing. */
export function moveStudioCash(state: GameState, studioId: string, kind: P16LedgerKind, amount: number, week: number, note: string): GameState {
  if (!Number.isFinite(amount) || kind !== 'acquisitionOutlay' && !Number.isSafeInteger(amount)) throw new Error(`rights: ${kind} amount must be a whole amount`)
  if (amount === 0) return state
  const h = state.hollywood
  if (!h) throw new Error('rights: no industry')
  if (studioId === h.playerStudioId) {
    return { ...state, studio: { ...state.studio, cash: state.studio.cash + amount }, ledger: [...state.ledger, { week, kind, amount, note }] }
  }
  const index = h.businesses.findIndex((b) => b.studioId === studioId)
  if (index < 0) throw new Error(`rights: ${studioId} has no operating account`)
  const business = h.businesses[index]!
  const account = { ...business.account, periods: business.account.periods.map((p) => ({ ...p, movements: { ...p.movements } })) }
  moveRivalMoney(account, kind, amount, week)
  const businesses = h.businesses.map((b, i) => (i === index ? { ...b, account } : b))
  return { ...state, hollywood: { ...h, businesses } }
}
