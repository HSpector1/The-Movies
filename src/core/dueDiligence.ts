import { QUOTE_AGE_POLICIES, QUOTE_AGE_POLICY_VERSION } from './quoteAge.js'
// ── P16B: costed, dated, recipient-bound due diligence ──
//
// Authority: 1362-O §5.5; P16 integration contract §6 ("Due diligence is a bounded, costed, dated
// transaction event available only to a permitted bidder for a specified target/lot. Charge its
// real fee once and record recipient, target, disclosure week/version, exact scope, receipt ID and
// stale/revalidation policy. Reveal only relevant assets, liabilities/claims, rights/encumbrances,
// contract terms and quoted work/exit costs needed to price that deal. General rival views remain
// private ... Rival policies receive the same lawful disclosure event ... public receipts do not
// expose the disclosed private body to all studios").
//
// Pure. The body is a bounded snapshot of the target's own facts at the disclosure week (subject
// references and integers), never a campaign snapshot. Only the recipient reads it back.

import { terminationCost } from './employment.js'
import { subjectValueV1 } from './propertyValuation.js'
import { conditionFactsFor, corporateConditionReaders, affordabilityRefusal, moveStudioCash, permittedBidderRefusal, studioCash, weeklyFixedCost, type CorporateConditionReaders } from './rightsFinance.js'
import { allocateRightsId, resolveTitles, subjectsHeldBy, type DiligenceRecord, type DiligenceScopeItem, type DiligenceTarget, type DisclosureBody,
  type RightSubject, type RightsTransaction } from './rights.js'
import { TUNING } from './tuning.js'
import type { GameState } from './types.js'

export type DiligenceInput = { recipientId: string; target: DiligenceTarget; scope: DiligenceScopeItem[] }
const SCOPE_ITEMS: readonly DiligenceScopeItem[] = ['rights', 'employment', 'liabilities']

export function diligenceRefusal(state: GameState, input: DiligenceInput, week: number, readers: CorporateConditionReaders = corporateConditionReaders): string | null {
  const h = state.hollywood
  if (!h) return 'noIndustry'
  if (!Array.isArray(input.scope) || input.scope.length === 0) return 'emptyScope'
  if (input.scope.some((s) => !SCOPE_ITEMS.includes(s)) || new Set(input.scope).size !== input.scope.length) return 'invalidScope'
  const permitted = permittedBidderRefusal(state, input.recipientId, week, readers)
  if (permitted !== null) return `recipientNotPermitted:${permitted}`
  if (input.target.kind === 'studio') {
    if (input.target.studioId === input.recipientId) return 'selfTarget'
    const identity = h.identities.find((i) => i.studioId === (input.target as { studioId: string }).studioId)
    if (identity === undefined || identity.enteredWeek === null) return 'unknownTarget'
    // Liabilities are disclosed from the target's P15B record; without one there is nothing lawful to disclose.
    if (input.scope.includes('liabilities') && conditionFactsFor(state, input.target.studioId, week, readers) === null) return 'targetConditionUnavailable'
  } else {
    const estate = state.rights.estates.find((e) => e.estateId === (input.target as { estateId: string }).estateId)
    if (estate === undefined || !estate.lots.some((l) => l.lotId === (input.target as { lotId: string }).lotId)) return 'unknownTarget'
  }
  return affordabilityRefusal(state, input.recipientId, TUNING.RIGHTS_DUE_DILIGENCE_FEE)
}

function encumbrancesOf(state: GameState, subject: RightSubject, week: number): string[] {
  const out: string[] = []
  for (const l of state.rights.licences) {
    if (l.startWeek <= week && week < l.endWeekExclusive && ((subject.right === 'R1' && l.subject.right === 'R1' && l.subject.propertyId === subject.propertyId)
      || (subject.right === 'R2' && l.subject.right === 'R2' && l.subject.filmId === subject.filmId))) out.push(`licence:${l.id}`)
  }
  if (subject.right === 'R2' && (state.theatricalRuns.some((r) => r.productionId === subject.filmId && r.status === 'active')
    || (state.hollywood?.businesses ?? []).some((b) => b.runs.some((r) => r.productionId === subject.filmId)))) out.push('activeRun')
  return out
}

/** The bounded body: only what prices this deal, only about the target. */
export function disclosureBody(state: GameState, target: DiligenceTarget, scope: readonly DiligenceScopeItem[], week: number, readers: CorporateConditionReaders): DisclosureBody {
  const h = state.hollywood!
  const resolved = resolveTitles(state)
  const subjects = target.kind === 'studio'
    ? subjectsHeldBy(resolved, state.rights.estates, target.studioId, week)
    : state.rights.estates.find((e) => e.estateId === target.estateId)!.lots.find((l) => l.lotId === target.lotId)!.subjects
  const rights = scope.includes('rights')
    ? subjects.map((subject) => { const v = subjectValueV1(state, subject, week); return { subject, value: v.kind === 'available' ? v.value : null, encumbrances: encumbrancesOf(state, subject, week) } })
    : []
  let employment: DisclosureBody['employment'] = null
  let liabilities: DisclosureBody['liabilities'] = null
  if (target.kind === 'studio') {
    if (scope.includes('employment')) {
      employment = h.activeEmploymentOrdinals.map((i) => h.employment[i]!)
        .filter((e) => e.studioId === target.studioId && e.endedWeek === null && e.terms.startWeek <= week && week < e.terms.endWeekExclusive)
        .map((e) => ({ contractId: e.contractId, talentId: e.terms.talentId, annualSalary: e.terms.annualSalary, startWeek: e.terms.startWeek,
          endWeekExclusive: e.terms.endWeekExclusive, exitCost: terminationCost(e.terms, week) }))
        .sort((a, b) => (a.contractId < b.contractId ? -1 : 1))
    }
    if (scope.includes('liabilities')) {
      const f = conditionFactsFor(state, target.studioId, week, readers)
      if (f === null) throw new Error(`due diligence: ${target.studioId} has no condition record to disclose`)
      // r2 (F7): the whole-dollar cash an absorption quote transfers at par is disclosed here, to the paying recipient only.
      liabilities = { stage: f.stage, hasOutstandingLoan: f.hasOutstandingLoan, weeklyFixedCost: weeklyFixedCost(state, target.studioId), cash: Math.floor(studioCash(state, target.studioId)) }
    }
  }
  return { rights, employment, liabilities }
}

/** One disclosure event: the fee charged once with its receipt, the record bound to its recipient. */
export function requestDiligence(state: GameState, input: DiligenceInput, week: number, readers: CorporateConditionReaders = corporateConditionReaders): { state: GameState; record: DiligenceRecord } {
  const refusal = diligenceRefusal(state, input, week, readers)
  if (refusal !== null) throw new Error(`due diligence refused: ${refusal}`)
  const body = disclosureBody(state, input.target, input.scope, week, readers)
  const fee = TUNING.RIGHTS_DUE_DILIGENCE_FEE
  const txAllocated = allocateRightsId(state.rights, 'rights-tx')
  const recordAllocated = allocateRightsId(txAllocated.root, 'rights-dd')
  const transaction: RightsTransaction = { id: txAllocated.id, week, kind: 'dueDiligence', payerId: input.recipientId, payeeId: null, estateId: null, amount: fee,
    subject: null, licenceId: null, offerId: null, lotId: null, bidId: null, titleEventIds: [] }
  const record: DiligenceRecord = { quoteAgePolicyVersion: QUOTE_AGE_POLICY_VERSION, id: recordAllocated.id, week, recipientId: input.recipientId, target: input.target, scope: [...input.scope], fee,
    transactionId: transaction.id, staleFromWeek: week + QUOTE_AGE_POLICIES[QUOTE_AGE_POLICY_VERSION].disclosure.max + 1, body }
  let next: GameState = { ...state, rights: { ...recordAllocated.root, transactions: [...recordAllocated.root.transactions, transaction], diligence: [...recordAllocated.root.diligence, record] } }
  next = moveStudioCash(next, input.recipientId, 'dueDiligenceFee', -fee, week, transaction.id)
  return { state: next, record }
}

/** The private body, readable by its recipient alone. */
export function disclosureFor(state: GameState, readerId: string, diligenceId: string): DiligenceRecord | null {
  const record = state.rights.diligence.find((d) => d.id === diligenceId)
  return record !== undefined && record.recipientId === readerId ? record : null
}

/** The public receipt: who received what scope about whom, when, for what fee — never the body. */
export function publicDiligenceReceipts(state: GameState): { id: string; week: number; recipientId: string; target: DiligenceTarget; scope: DiligenceScopeItem[]; fee: number }[] {
  return state.rights.diligence.map((d) => ({ id: d.id, week: d.week, recipientId: d.recipientId, target: d.target, scope: d.scope, fee: d.fee }))
}
