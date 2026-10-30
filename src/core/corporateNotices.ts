// ── P15B Wave 5 (record 1370-ar): the player's notices and the public stage ─────────────────────
// Authority: 1352-A §3 row 5 and §7 (notices at warning, at distress with the closure week as a
// countdown, and in the closure week; the notice states when no route remains), §4.3 (the remedy
// families are the recovery routes), 1357-A §7 (the loan intent and the notices share one step),
// 1122-A D3 with 1352-A :111 and 1356-A §7 (a rival discloses its stage only, no number), 1362-O 5.1
// ("Keep public distress stages/bands, with no private closure countdown. Announce actual closure.").
// Pure read model over the state: no RNG, no Date, no manufactured history. A migrated predecessor has
// no record at its own week, so it has no notice until its first lawful evaluation.

import { claimsOfClosure, closureRecordOf } from './studioClosure.js'
import { conditionRecord, outstandingLoan, studioRemedies } from './corporateConditionLive.js'
import { loanInstallmentDue } from './studioLoan.js'
import { TUNING } from './tuning.js'
import type { RemedyFamily } from './corporateCondition.js'
import type { GameState } from './types.js'

export type CorporateNotice = {
  id: 'corporate-warning' | 'corporate-distress' | 'corporate-recovery' | 'corporate-closure-due' | 'corporate-closed' | 'studio-loan' | 'rival-closed'
  severity: 'info' | 'warning' | 'critical'
  week: number
  message: string
  /** The recovery routes that remain this week (1352-A §4.3), [] when none does. */
  remedies: RemedyFamily[]
  /** The week closure falls due if cash stays negative (distress), or the actual closure week (closed). */
  closureWeek: number | null
}

const ROUTE_LABELS: Record<RemedyFamily, string> = {
  LOAN: 'a studio loan',
  REDUCE_OBLIGATIONS: 'releasing contracts',
  RELEASE: 'completing a release',
}
function routesSentence(remedies: readonly RemedyFamily[]): string {
  if (remedies.length === 0) return 'No route remains: no loan is available, no contract can be released and nothing is in release.'
  return `Routes that remain: ${remedies.map((r) => ROUTE_LABELS[r]).join(', ')}.`
}
const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`

/** The week closure falls due if cash stays negative: the 26th distress week (1352-A §4.2). */
export function closureDueWeek(since: number): number {
  return since + TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS - 1
}

/** The player's notices this week, most severe first: at most one condition notice, one loan notice and the
 * public announcement of any rival that actually closed this week. */
export function corporateNotices(state: GameState): CorporateNotice[] {
  const h = state.hollywood
  if (h === null) return []
  const studioId = h.playerStudioId
  const week = state.market.tick
  const out: CorporateNotice[] = []
  const closure = closureRecordOf(state, studioId)
  if (closure !== undefined) {
    // 1362-O 5.2: paid, partially paid, unpaid and pending, each with its amount; nothing claimed settled that is not.
    const allClaims = claimsOfClosure(state, closure.closureId)
    // closure/v2 (ASTRA Sprint 23): television refund and charge claims are counted apart from the employment claims.
    const claims = allClaims.filter((c) => c.kind === 'employment')
    const tv = allClaims.filter((c) => c.kind !== 'employment')
    const tvNote = tv.length === 0 ? '' : ` ${plural(tv.length, 'television obligation')} (advance refund and cancellation charge) ${tv.length === 1 ? 'ranks' : 'rank'} behind them: ${tv.reduce((sum, c) => sum + c.paid, 0)} paid and ${tv.reduce((sum, c) => sum + c.unpaid, 0)} unpaid.`
    const full = claims.filter((c) => c.paid === c.original)
    const partial = claims.filter((c) => c.paid > 0 && c.paid < c.original)
    const unpaid = claims.filter((c) => c.paid === 0 && c.original > 0)
    const paidAmount = claims.reduce((sum, c) => sum + c.paid, 0)
    const unpaidAmount = claims.reduce((sum, c) => sum + c.unpaid, 0)
    const pending = closure.dispositions.filter((d) => d.status === 'pending').length
    const loan = closure.loan === null ? '' : ` The studio loan stopped at Week ${closure.loan.stopWeek} with ${closure.loan.paidInstallments} installments paid; its remainder of ${closure.loan.remainder} stays unpaid.`
    out.push({ id: 'corporate-closed', severity: 'critical', week: closure.closureWeek, remedies: [], closureWeek: closure.closureWeek,
      message: `The studio closed in Week ${closure.closureWeek}. This world is read-only history. ${plural(claims.length, 'employment claim')}: ${full.length} paid in full, ${partial.length} partially paid, ${unpaid.length} unpaid; ${paidAmount} paid and ${unpaidAmount} unpaid.${tvNote} ${plural(pending, 'obligation')} ${pending === 1 ? 'remains' : 'remain'} pending in this saved world.${loan}`,
    })
    return out
  }
  const record = conditionRecord(state, studioId)
  // A closure-due record keeps the week of its closure event; it is shown until the closure itself runs (a surface
  // that defers the player's actual closure, tick's `deferPlayerClosure`, leaves it due).
  if (record !== undefined && (record.condition.week === week || record.condition.stage === 'closed')) {
    const { stage, since } = record.condition
    const remedies = stage === 'closed' ? [] : studioRemedies(state, studioId)
    if (stage === 'warning') {
      out.push({ id: 'corporate-warning', severity: 'warning', week, remedies, closureWeek: null,
        message: `Corporate condition: warning since Week ${since}. Cash covers fewer than ${TUNING.CORPORATE_WARN_COVER_WEEKS} weeks of obligations. ${routesSentence(remedies)}` })
    } else if (stage === 'distress') {
      const due = closureDueWeek(since)
      out.push({ id: 'corporate-distress', severity: 'critical', week, remedies, closureWeek: due,
        message: `Corporate condition: distress since Week ${since}. If cash stays negative the studio closes at Week ${due} (${due - week} weeks). ${routesSentence(remedies)}` })
    } else if (stage === 'recovery') {
      out.push({ id: 'corporate-recovery', severity: 'info', week, remedies, closureWeek: null,
        message: `Corporate condition: recovery since Week ${since}. The studio returns to stable after ${TUNING.CORPORATE_RECOVERY_STABLE_WEEKS} clear weeks; a fourth low week returns it to warning.` })
    } else if (stage === 'closed') {
      out.push({ id: 'corporate-closure-due', severity: 'critical', week, remedies: [], closureWeek: since,
        message: `Corporate condition: closure due since Week ${since}. The closure is recorded at the next closure boundary; no route remains.` })
    }
  }
  const loan = outstandingLoan(state, studioId, week)
  if (loan !== undefined) {
    const paidInstallments = Math.max(0, Math.min(loan.installments.length, week - loan.contractedWeek - 1))
    const next = loanInstallmentDue(loan, week)
    const remaining = loan.total - loan.installments.slice(0, paidInstallments).reduce((a, b) => a + b, 0)
    out.push({ id: 'studio-loan', severity: 'info', week, remedies: [], closureWeek: null,
      message: `Studio loan: ${paidInstallments} of ${loan.installments.length} installments paid; ${next > 0 ? `the next, due Week ${week}, is charged in this advance` : `the first falls due Week ${loan.contractedWeek + 1}`}; remaining ${remaining} of ${loan.total}.` })
  }
  // 1362-O 5.1 "Announce actual closure": a rival's actual closure is public in its closure week. Its figures stay private.
  const closedRivals = (state.studioClosure?.closures ?? []).filter((c) => c.closureWeek === week && c.studioId !== studioId)
  if (closedRivals.length > 0) {
    const names = closedRivals.map((c) => h.identities.find((s) => s.studioId === c.studioId)?.name ?? c.studioId)
    out.push({ id: 'rival-closed', severity: 'info', week, remedies: [], closureWeek: week,
      message: `${names.join(' and ')} closed this week. ${closedRivals.length === 1 ? 'Its' : 'Their'} staff are free agents now.` })
  }
  return out
}

/** The public projection of any studio's condition: its stage alone (1122-A D3; 1352-A :111; 1362-O 5.1). No
 * week, figure or countdown, so a rival's private closure clock stays private; the player's own detail is in its notices. */
export function publicConditionLabel(state: GameState, studioId: string): string {
  if (closureRecordOf(state, studioId) !== undefined) return 'Closed'
  const record = conditionRecord(state, studioId)
  if (record === undefined) return 'Not yet evaluated'
  switch (record.condition.stage) {
    case 'stable': return 'Stable'
    case 'warning': return 'Warning'
    case 'distress': return 'Distress'
    case 'recovery': return 'Recovery'
    case 'closed': return 'Closure due'
  }
}
