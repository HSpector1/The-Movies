// ── P18: cancellation and the v1 settlement (contract §5, §7) ─────────────────────────────────────────
//
// One cancellation law for every cause: the producer's explicit action, the deadline at T = C + 20 and the tick's
// authority-loss cancellations 'rights' and 'participant' (tvSeason.ts, tick step 7.8), and the player's actual P15B
// closure (studioClosure.ts). Each retains completed work,
// credits, costs and earned fees; cancels the unearned future milestones; freezes the refund principal U0 = P − E and
// the cancellation charge K once; releases the people and every reservation by the status change (the readers read
// live seasons only). An operating studio pays U0 from available nonnegative cash first, then K from the remainder,
// and records what it could not pay as agreement obligations due now. A closing studio pays nothing here: the frozen
// obligations are published with the closure id, and P18 never jumps the estate creditor queue (§7).
//
// `settleTvObligations` is the contract's explicit repayment action: refund first, then charge, bounded by the
// outstanding balance and by available nonnegative cash, guarded by the caller's expected balance. Leaf module: it
// imports only the readers and types, so the closure transaction can call it without an import cycle.

import { appendTvReceipt } from './tvReaders.js'
import type { TelevisionRoot, TvAgreement, TvCancellationCause, TvSeason } from './tvTypes.js'
import type { GameState, LedgerEntry } from './types.js'

export type TvCancellationOutcome = { television: TelevisionRoot; cash: number; ledger: LedgerEntry[] }

/** Whole dollars a payment may draw: available nonnegative cash, floored (studio cash can carry cents). */
const payable = (cash: number): number => Math.floor(Math.max(0, cash))

/**
 * Cancel one live season at boundary `week`. `ledgerWeek` is the week the money rows are dated (the action's own week,
 * or the advance week for the deadline, as every tick row is). `cash` is what is available after the week's earlier
 * charges; a closure passes no cash (nothing is paid here).
 */
export function cancelTvSeasonIn(root: TelevisionRoot, seasonId: string,
  at: { week: number; cause: TvCancellationCause; ledgerWeek: number; cash: number; closureId: string | null }): TvCancellationOutcome {
  const season = root.seasons.find((row) => row.seasonId === seasonId)
  if (season === undefined) throw new Error(`tv settlement: unknown season ${seasonId}`)
  if (season.status !== 'live') throw new Error(`tv settlement: season ${seasonId} is ${season.status}, not live`)
  const agreement = root.agreements.find((row) => row.agreementId === season.agreementId)
  if (agreement === undefined) throw new Error(`tv settlement: season ${seasonId} names no agreement ${season.agreementId}`)
  // While live R = 0 and P = max(A, E), so U0 = P − E = max(0, A − E) (contract §5).
  const refundDue = agreement.received - agreement.earned
  if (!Number.isSafeInteger(refundDue) || refundDue < 0) throw new Error(`tv settlement: agreement ${agreement.agreementId} has P < E (${agreement.received} < ${agreement.earned})`)
  const chargeDue = agreement.terms.cancellationCharge
  const available = at.cause === 'closure' ? 0 : payable(at.cash)
  const refundPaid = Math.min(refundDue, available)
  const chargePaid = Math.min(chargeDue, available - refundPaid)
  const base = { week: at.week, seasonId, agreementId: agreement.agreementId }
  let next = appendTvReceipt(root, { ...base, kind: 'cancelled', cause: at.cause, refundDue, chargeDue }).root
  const ledger: LedgerEntry[] = []
  if (refundPaid > 0) {
    const paid = appendTvReceipt(next, { ...base, kind: 'advanceRefundPaid', amount: refundPaid, source: 'cancellation' })
    next = paid.root
    ledger.push({ week: at.ledgerWeek, kind: 'tvAdvanceRefund', amount: -refundPaid, note: paid.receiptId })
  }
  if (chargePaid > 0) {
    const paid = appendTvReceipt(next, { ...base, kind: 'cancellationChargePaid', amount: chargePaid, source: 'cancellation' })
    next = paid.root
    ledger.push({ week: at.ledgerWeek, kind: 'tvCancellationCharge', amount: -chargePaid, note: paid.receiptId })
  }
  const cancelled: TvSeason = { ...season, status: 'cancelled', cancellation: { week: at.week, cause: at.cause }, reservations: [], work: { ...season.work, stall: null } }
  const settled: TvAgreement = { ...agreement, settlement: { week: at.week, refundDue, refundPaid, chargeDue, chargePaid, closureId: at.closureId } }
  next = {
    ...next,
    seasons: next.seasons.map((row) => (row.seasonId === seasonId ? cancelled : row)),
    agreements: next.agreements.map((row) => (row.agreementId === agreement.agreementId ? settled : row)),
  }
  return { television: next, cash: at.cash - refundPaid - chargePaid, ledger }
}

function applyOutcome(state: GameState, outcome: TvCancellationOutcome): GameState {
  return { ...state, television: outcome.television, studio: { ...state.studio, cash: outcome.cash }, ledger: [...state.ledger, ...outcome.ledger] }
}

/** The producer's explicit pre-delivery cancellation (contract §7), at the current week. Refuses by name before any write. */
export function cancelTvSeason(state: GameState, seasonId: string): GameState {
  const refuse = (why: string): never => { throw new Error(`applyActions: cancelTvSeason rejected — ${why}`) }
  if (state.hollywood === null) refuse('the campaign has no player studio identity in the living industry')
  const season = state.television?.seasons.find((row) => row.seasonId === seasonId)
  if (season === undefined) return refuse(`unknown television season "${String(seasonId)}"`)
  if (season.producerStudioId !== state.hollywood!.playerStudioId) refuse(`season ${seasonId} is not this studio's`)
  if (season.status === 'delivered') refuse(`season ${seasonId} was delivered at week ${String(season.deliveredWeek)}; only a pre-delivery season can be cancelled`)
  if (season.status === 'cancelled') refuse(`season ${seasonId} is already cancelled (week ${String(season.cancellation?.week)}); a repeated cancellation does nothing`)
  const week = state.market.tick
  return applyOutcome(state, cancelTvSeasonIn(state.television!, seasonId, { week, cause: 'producer', ledgerWeek: week, cash: state.studio.cash, closureId: null }))
}

/**
 * P15B actual closure of the player (contract §7; P18-06): the live season is cancelled at the closure week under the
 * same terms, pays nothing, and publishes U0 and K with the closure id. Called inside the closure transaction before
 * its money step, beside the P17 cameo settlement; a world with no live season is returned unchanged.
 */
export function cancelTvSeasonsAtClosure(state: GameState, closureId: string, week: number): GameState {
  const live = state.television?.seasons.filter((row) => row.status === 'live') ?? []
  let next = state
  for (const season of live) {
    next = applyOutcome(next, cancelTvSeasonIn(next.television!, season.seasonId, { week, cause: 'closure', ledgerWeek: week, cash: next.studio.cash, closureId }))
  }
  return next
}

/**
 * closure/v2 (ASTRA Sprint 23, decision B): one estate payment on a closure-published agreement, written by the closure
 * transaction's claims distribution at the closure week. The receipt names the source `estate`, the ledger row carries
 * it, and the agreement's paid figure rises, so P18's readers show the paid state and `settleTvObligations` keeps
 * refusing (the estate owns the debt). Refund before charge: a charge payment needs the refund paid in full. Throws on
 * anything but a whole positive amount within the outstanding part; the caller passes only what the law distributed.
 */
export function payTvObligationFromEstate(root: TelevisionRoot, agreementId: string, part: 'tvRefund' | 'tvCharge', amount: number, week: number, closureId: string): { television: TelevisionRoot; ledger: LedgerEntry[] } {
  const fail = (why: string): never => { throw new Error(`closure/v2: television estate payment rejected — ${why}`) }
  const agreement = root.agreements.find((row) => row.agreementId === agreementId) ?? fail(`unknown agreement ${agreementId}`)
  const season = root.seasons.find((row) => row.seasonId === agreement.seasonId) ?? fail(`agreement ${agreementId} names no season`)
  const s = agreement.settlement ?? fail(`agreement ${agreementId} carries no settlement`)
  // Published to this closure, or cancelled earlier while the studio still operated and left outstanding: both are the
  // closing producer's genuine debts (decision B); the validator ties either to the producer's closure at this week.
  if (s.closureId !== null && s.closureId !== closureId) fail(`agreement ${agreementId} was published to another closure (${s.closureId})`)
  if (!Number.isSafeInteger(amount) || amount <= 0) fail(`amount ${String(amount)} is not a whole positive number`)
  const outstanding = part === 'tvRefund' ? s.refundDue - s.refundPaid : s.chargeDue - s.chargePaid
  if (amount > outstanding) fail(`amount ${amount} exceeds the outstanding ${part} (${outstanding}) of ${agreementId}`)
  if (part === 'tvCharge' && s.refundPaid !== s.refundDue) fail(`the charge of ${agreementId} cannot be paid before its refund`)
  const base = { week, seasonId: season.seasonId, agreementId }
  const paid = appendTvReceipt(root, part === 'tvRefund'
    ? { ...base, kind: 'advanceRefundPaid', amount, source: 'estate' }
    : { ...base, kind: 'cancellationChargePaid', amount, source: 'estate' })
  const ledger: LedgerEntry[] = [{ week, kind: part === 'tvRefund' ? 'tvAdvanceRefund' : 'tvCancellationCharge', amount: -amount, note: paid.receiptId } as LedgerEntry]
  const settlement = part === 'tvRefund' ? { ...s, refundPaid: s.refundPaid + amount } : { ...s, chargePaid: s.chargePaid + amount }
  return { television: { ...paid.root, agreements: paid.root.agreements.map((row) => (row.agreementId === agreementId ? { ...agreement, settlement } : row)) }, ledger }
}

export type SettleTvObligationsInput = { agreementId: string; expectedRemaining: number; amount: number }

/** The public `settleTvObligations` action (contract §7): refund first, then charge, exact receipts and rows. */
export function settleTvObligations(state: GameState, input: SettleTvObligationsInput): GameState {
  const refuse = (why: string): never => { throw new Error(`applyActions: settleTvObligations rejected — ${why}`) }
  const root = state.television
  const agreement = root?.agreements.find((row) => row.agreementId === input.agreementId)
  if (root === undefined || agreement === undefined) return refuse(`unknown television agreement "${String(input.agreementId)}"`)
  const s = agreement.settlement
  if (s === undefined) return refuse(`agreement ${agreement.agreementId} has no cancellation settlement`)
  if (s.closureId !== null) refuse(`agreement ${agreement.agreementId}'s obligations were published to closure ${s.closureId}; the estate owns them`)
  const outstanding = (s.refundDue - s.refundPaid) + (s.chargeDue - s.chargePaid)
  if (outstanding === 0) refuse(`agreement ${agreement.agreementId} owes nothing`)
  if (input.expectedRemaining !== outstanding) refuse(`expectedRemaining ${String(input.expectedRemaining)} is not the outstanding balance ${outstanding} (a stale or repeated request)`)
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) refuse(`amount ${String(input.amount)} must be a positive whole number`)
  if (input.amount > outstanding) refuse(`amount ${input.amount} exceeds the outstanding balance ${outstanding}`)
  const available = payable(state.studio.cash)
  if (input.amount > available) refuse(`amount ${input.amount} exceeds available nonnegative cash ${available}`)
  const week = state.market.tick
  const refund = Math.min(input.amount, s.refundDue - s.refundPaid)
  const charge = input.amount - refund
  const base = { week, seasonId: agreement.seasonId, agreementId: agreement.agreementId }
  let next = root
  const ledger: LedgerEntry[] = []
  if (refund > 0) {
    const paid = appendTvReceipt(next, { ...base, kind: 'advanceRefundPaid', amount: refund, source: 'settlement' })
    next = paid.root
    ledger.push({ week, kind: 'tvAdvanceRefund', amount: -refund, note: paid.receiptId })
  }
  if (charge > 0) {
    const paid = appendTvReceipt(next, { ...base, kind: 'cancellationChargePaid', amount: charge, source: 'settlement' })
    next = paid.root
    ledger.push({ week, kind: 'tvCancellationCharge', amount: -charge, note: paid.receiptId })
  }
  next = { ...next, agreements: next.agreements.map((row) => (row.agreementId === agreement.agreementId
    ? { ...agreement, settlement: { ...s, refundPaid: s.refundPaid + refund, chargePaid: s.chargePaid + charge } } : row)) }
  return applyOutcome(state, { television: next, cash: state.studio.cash - input.amount, ledger })
}
