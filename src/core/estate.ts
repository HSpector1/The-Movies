import { QUOTE_AGE_POLICY_VERSION, quoteAgeRefusal } from './quoteAge.js'
// ── P16C: estates — the typed P15 handoff, clean lots, sealed bids and the close ceremony at D ──
//
// Authority: P16 integration contract §4 (the handoff admits lots; P16 cannot declare a studio
// terminal; half-open window [opensWeek, closesWeek) closes once; unsold lots archive; no free claim;
// estate staff are free agents and a purchase buys no people), §6 (sealed one-shot comparison at the
// recorded close, descending amount then ascending reserved identity order, no RNG; revalidate
// eligibility/reserved cash/lot authority before resolution and fall back to the next valid bid;
// consideration to the estate once; archival freezes unsold rights; repeat close is an explicit
// refusal or policy no-op), §7 group E; 1367-G timing amendment (bids only before D; pre-D sealed
// bids resolve exactly once at D; new bids at D refuse; ESTATE_WINDOW_WEEKS = 13); 1362-O §5.1/§5.3.
//
// ADAPTER POINT: `EstateHandoff` is what P16 needs from P15B Wave 4's actual closure result. The
// The current49 closure producer calls `openEstate(state, handoff, week, readers)` in the closure
// week, bound to the P15B condition readers: an estate neither opens nor closes
// under the unbound sentinel, whose fail-closed answers would disqualify every bid and archive every
// lot for good (r2, review F60). Direct structural fixtures do not replace actual closure authority.
// Proceeds are recorded on the estate record for P15's claims distribution and are never credited to
// any studio.
//
// r2 (review F4/F29/F39, contract §3/§4): handoff v2 disposes of EVERY right the closed studio holds —
// each one in exactly one lot or in `pending` with its reason — and carries each lot's licence
// encumbrance references and the closure's claim references. A lot may not hold a right the sale law
// refuses to transfer (an R2 film in an active run, an R1 property with an active production); the
// ceremony checks it again at D. Pending rights freeze at closure and archive at D.

import { blockingEncumbrance } from './licence.js'
import { corporateConditionReaders, moveStudioCash, permittedBidderRefusal, postPurchaseReserve, spendableCash, affordabilityRefusal,
  UNBOUND_CORPORATE_CONDITION_READERS, type CorporateConditionReaders } from './rightsFinance.js'
import { allocateRightsId, appendTitleEvent, currentHolder, ESTATE_PENDING_REASONS, estateHolderId, materializeLegacyTitles, resolveTitles, subjectKey,
  subjectsHeldBy, type EstateBid, type EstateLot, type EstatePendingReason, type EstateRecord, type RightSubject, type RightsTransaction } from './rights.js'
import { makeSave } from './save.js'
import { tick } from './tick.js'
import { receiveEstateSaleProceeds } from './studioClosure.js'
import { subjectValueV1 } from './propertyValuation.js'
import { TUNING } from './tuning.js'
import type { ClosureRecord, GameState } from './types.js'

/** What an estate needs from a closed studio (P15B Wave 4 produces it; P16 only consumes it). */
export type EstateHandoff = {
  version: 2
  /** P15's closure record identity. */
  closureId: string
  /** Stable estate identity, chosen by the producer (e.g. `estate-<studioId>-<closureWeek>`). */
  estateId: string
  /** The closed studio: a reserved identity (player or rival). */
  studioId: string
  /** The terminal week: the first nonoperating boundary. */
  closureWeek: number
  /** The disposal window [opensWeek, closesWeek): opensWeek is the closure week, closesWeek = opensWeek + ESTATE_WINDOW_WEEKS. */
  opensWeek: number
  closesWeek: number
  /** Clean, explicitly identified, non-overlapping lots of rights the studio held at closure, each naming the licences
   * (`licence:<id>`, live or future on its subjects) it is sold subject to. */
  lots: EstateLot[]
  /** Every other right the studio held at closure, with why it is not offered. */
  pending: { subject: RightSubject; reason: EstatePendingReason }[]
  /** References into P15's claims context: P15 owns class, priority and payment. */
  claimsContext: { priorityVersion: string; claimIds: string[] }
  /** P15's terminal cash reconciliation; unpaid loan remainder stays visible and unpaid. */
  cashReconciliation: { terminalCash: number; loanRemainder: number }
}

export type EstateBidInput = { estateId: string; lotId: string; bidderId: string; amount: number }

/** The licence references a lot of these subjects is sold subject to: every licence not yet ended at `week`, sorted. */
export function lotEncumbranceRefs(state: GameState, subjects: readonly RightSubject[], week: number): string[] {
  const keys = new Set(subjects.map(subjectKey))
  return state.rights.licences.filter((l) => keys.has(subjectKey(l.subject)) && week < l.endWeekExclusive).map((l) => `licence:${l.id}`).sort()
}

const sameList = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((x, i) => x === b[i])

/** The immutable actual-closure owner supplies claims, terminal cash and stopped loan. */
function closureAuthorityRefusal(state: GameState, handoff: Pick<EstateHandoff, 'closureId' | 'studioId' | 'closureWeek' | 'opensWeek' | 'closesWeek' | 'claimsContext' | 'cashReconciliation'>): string | null {
  const closure = state.studioClosure.closures.find(c => c.closureId === handoff.closureId)
  if (closure === undefined || closure.studioId !== handoff.studioId) return 'actualClosureMissing'
  if (closure.closureWeek !== handoff.closureWeek || closure.estate.opensWeek !== handoff.opensWeek || closure.estate.closesWeek !== handoff.closesWeek) return 'actualClosureWindowMismatch'
  const claims = state.studioClosure.claims.filter(c => c.closureId === closure.closureId).sort((a, b) =>
    a.sourceContractId < b.sourceContractId ? -1 : a.sourceContractId > b.sourceContractId ? 1 : a.claimId < b.claimId ? -1 : a.claimId > b.claimId ? 1 : 0)
  if (handoff.claimsContext?.priorityVersion !== closure.lawVersion || !Array.isArray(handoff.claimsContext.claimIds)
    || !sameList(handoff.claimsContext.claimIds, claims.map(c => c.claimId))) return 'actualClosureClaimsMismatch'
  if (handoff.cashReconciliation?.terminalCash !== closure.cash.closing
    || handoff.cashReconciliation.loanRemainder !== (closure.loan?.remainder ?? 0)) return 'actualClosureCashMismatch'
  return null
}

/** Exact held inventory from title history at C; classifications/valuation are observed at the stated week.
 * Each right has one clean lot or explicit pending entry, never an unsupported active-work transfer. */
export function buildEstateHandoff(state: GameState, closure: ClosureRecord, classificationWeek = closure.closureWeek): EstateHandoff {
  if (!state.hollywood || classificationWeek < closure.closureWeek || classificationWeek > state.market.tick) throw new Error('estate handoff: invalid observation week')
  const otherEstates = state.rights.estates.filter(e => e.closureId !== closure.closureId)
  const subjects = subjectsHeldBy(resolveTitles(state), otherEstates, closure.studioId, closure.closureWeek)
  const lots: EstateLot[] = [], pending: EstateHandoff['pending'] = []
  for (const subject of subjects) {
    const blocked = blockingEncumbrance(state, subject)
    const value = subjectValueV1(state, subject, classificationWeek)
    if (blocked !== null || value.kind !== 'available') {
      pending.push({ subject: { ...subject }, reason: blocked ?? 'notOffered' })
    } else {
      lots.push({ lotId: `${closure.closureId}:rights-lot:${lots.length + 1}`, subjects: [{ ...subject }],
        minimumBid: value.value, encumbrances: lotEncumbranceRefs(state, [subject], classificationWeek) })
    }
  }
  const claims = state.studioClosure.claims.filter(c => c.closureId === closure.closureId).sort((a, b) =>
    a.sourceContractId < b.sourceContractId ? -1 : a.sourceContractId > b.sourceContractId ? 1 : a.claimId < b.claimId ? -1 : a.claimId > b.claimId ? 1 : 0)
  return { version: 2, estateId: `estate:${closure.closureId}`, closureId: closure.closureId, studioId: closure.studioId,
    closureWeek: closure.closureWeek, opensWeek: closure.estate.opensWeek, closesWeek: closure.estate.closesWeek, lots, pending,
    claimsContext: { priorityVersion: closure.lawVersion, claimIds: claims.map(c => c.claimId) },
    cashReconciliation: { terminalCash: closure.cash.closing, loanRemainder: closure.loan?.remainder ?? 0 } }
}

/** Predecessor observation only: no materialization, past title event, transaction, bid or new P15 row.
 * The original admitted48 archival decides expired status; a player's estate never advances to D. */
export function observePredecessorEstates(state: GameState): GameState {
  if (state.rights.estates.length !== 0) throw new Error('estate observation: requires an unobserved cutover root')
  const estates: EstateRecord[] = []
  for (const closure of [...state.studioClosure.closures].sort((a, b) => a.studioId < b.studioId ? -1 : a.studioId > b.studioId ? 1 : 0)) {
    const handoff = buildEstateHandoff(state, closure, state.market.tick)
    const archival = state.studioClosure.estateEvents.find(e => e.closureId === closure.closureId && e.kind === 'archival')
    const closedWeek = archival?.week ?? null
    estates.push({ origin: { kind: 'observed48', observedAtWeek: state.market.tick, closureId: closure.closureId,
      closureSequence: closure.p15DomainSequence, archivalEventId: archival?.eventId ?? null, classification: 'observedCurrent' },
      estateId: handoff.estateId, closureId: closure.closureId, studioId: closure.studioId, closureWeek: closure.closureWeek,
      opensWeek: handoff.opensWeek, closesWeek: handoff.closesWeek, closedWeek,
      lots: handoff.lots.map(l => ({ ...l, status: closedWeek === null ? 'open' : 'archived', winningBidId: null, transactionId: null })),
      pending: handoff.pending.map(p => ({ ...p, status: closedWeek === null ? 'pending' : 'archived' })), bids: [], proceeds: [],
      claimsContext: handoff.claimsContext, cashReconciliation: handoff.cashReconciliation })
  }
  return { ...state, rights: { ...state.rights, estates } }
}

/** Joined current reader. The old48 closure reader remains unchanged and proves its own facts first. */
export function validateEstateJoins(state: GameState, label: string): void {
  const fail: (rule: string) => never = rule => { throw new Error(`${label}: estate join ${rule}`) }
  const root = state.studioClosure, rights = state.rights
  const sameKeys = (value: object, keys: readonly string[]): boolean => Object.keys(value).sort().join(',') === [...keys].sort().join(',')
  const closureIds = new Set<string>()
  const resolved = resolveTitles(state)
  for (const estate of rights.estates) {
    if (closureIds.has(estate.closureId)) fail('duplicate closure handoff')
    closureIds.add(estate.closureId)
    const authority = closureAuthorityRefusal(state, estate)
    if (authority !== null) fail(authority)
    const closure = root.closures.find(c => c.closureId === estate.closureId)!
    const origin = estate.origin
    if (origin.kind === 'closure49') {
      if (!sameKeys(origin, ['kind', 'closureId']) || origin.closureId !== closure.closureId || closure.closureWeek < rights.recordedFromWeek) fail('invalid current closure provenance')
    } else if (origin.kind === 'observed48') {
      if (!sameKeys(origin, ['kind', 'observedAtWeek', 'closureId', 'closureSequence', 'archivalEventId', 'classification'])
        || origin.closureId !== closure.closureId || origin.closureSequence !== closure.p15DomainSequence
        || origin.observedAtWeek !== rights.recordedFromWeek || closure.closureWeek > origin.observedAtWeek
        || origin.classification !== 'observedCurrent') fail('invalid predecessor observation provenance')
      const archival = root.estateEvents.find(e => e.closureId === closure.closureId && e.kind === 'archival')
      const observedArchive = archival !== undefined && archival.week <= origin.observedAtWeek ? archival : undefined
      if (origin.archivalEventId !== (observedArchive?.eventId ?? null)) fail('predecessor observation archival differs from authentic boundary')
      if (observedArchive && (estate.closedWeek !== closure.estate.closesWeek || estate.bids.length !== 0 || estate.proceeds.length !== 0
        || rights.transactions.some(t => t.estateId === estate.estateId))) fail('archived predecessor estate was reopened or sold')
    } else fail('unknown estate origin')
    const archival = root.estateEvents.find(e => e.closureId === closure.closureId && e.kind === 'archival')
    if (estate.closedWeek !== (archival?.week ?? null)) fail('rights archival and actual closure archival differ')
    const held = subjectsHeldBy(resolved, rights.estates.filter(e => e.closureId !== closure.closureId), closure.studioId, closure.closureWeek)
    const expected = held.map(subjectKey).sort()
    const actual = [...estate.lots.flatMap(l => l.subjects), ...estate.pending.map(p => p.subject)].map(subjectKey).sort()
    if (!sameList(actual, expected)) fail('held rights must be disposed exactly once at closure')
    const classificationWeek = origin.kind === 'observed48' ? origin.observedAtWeek : closure.closureWeek
    const lotIds = new Set<string>()
    for (const lot of estate.lots) {
      if (typeof lot.lotId !== 'string' || lot.lotId.length === 0 || lotIds.has(lot.lotId)
        || !Number.isSafeInteger(lot.minimumBid) || lot.minimumBid < 0 || lot.subjects.length === 0) fail('invalid or duplicate typed lot')
      lotIds.add(lot.lotId)
      const values = lot.subjects.map(subject => subjectValueV1(state, subject, classificationWeek))
      if (values.some(value => value.kind !== 'available')
        || values.reduce((sum, value) => sum + (value.kind === 'available' ? value.value : 0), 0) !== lot.minimumBid) fail('lot minimum differs from observed source valuation')
      // Licence history survives; terms minted after the original snapshot are not its encumbrances.
      const original = { ...state, rights: { ...rights, licences: rights.licences.filter(l =>
        rights.transactions.some(t => t.id === l.transactionId && t.week <= classificationWeek)) } }
      if (!sameList(lot.encumbrances, lotEncumbranceRefs(original, lot.subjects, classificationWeek))) fail('lot encumbrances differ from original licence terms')
    }
    for (const pending of estate.pending) {
      if (!held.some(s => subjectKey(s) === subjectKey(pending.subject))) fail('foreign pending subject')
    }
    // At the actual production/observation boundary all classification facts are present.
    // Later snapshots retain this observation, never pretend current work was the past C state.
    if (state.market.tick === classificationWeek) {
      const built = buildEstateHandoff(state, closure, classificationWeek)
      const keys = (subjects: readonly RightSubject[]): string[] => subjects.map(subjectKey).sort()
      if (!sameList(keys(built.lots.flatMap(l => l.subjects)), keys(estate.lots.flatMap(l => l.subjects)))
        || !sameList(built.pending.map(p => `${subjectKey(p.subject)}:${p.reason}`).sort(), estate.pending.map(p => `${subjectKey(p.subject)}:${p.reason}`).sort())) fail('disposition classification contradicts observation boundary')
    }
  }
  // Exact current sale/estate intake bijection. No amount-sum-only proof can hide
  // duplicate, missing, foreign, wrong-week or split proceeds rows.
  const transactions = rights.transactions.filter(t => t.kind === 'estateSale')
  const receipts = root.estateEvents.filter(e => e.kind === 'saleReceipt')
  if (transactions.length !== receipts.length) fail('sale transactions and intake receipts must biject')
  const refs = new Set<string>()
  for (const receipt of receipts) {
    if (refs.has(receipt.reference)) fail('duplicate sale intake reference')
    refs.add(receipt.reference)
    const transaction = transactions.find(t => t.id === receipt.reference)
    const estate = rights.estates.find(e => e.closureId === receipt.closureId)
    if (!transaction || !estate || transaction.estateId !== estate.estateId || transaction.week !== estate.closesWeek
      || receipt.studioId !== estate.studioId || receipt.week !== transaction.week || receipt.amount !== transaction.amount
      || transaction.payeeId !== null || !Number.isSafeInteger(transaction.amount) || transaction.amount <= 0) fail('sale intake differs from actual estate transaction')
    const proceeds = estate.proceeds.filter(p => p.transactionId === transaction.id)
    if (proceeds.length !== 1 || proceeds[0]!.amount !== receipt.amount || proceeds[0]!.lotId !== transaction.lotId) fail('sale intake has no unique matching proceeds row')
    const distribution = root.estateEvents.find(e => e.closureId === receipt.closureId && e.week === receipt.week && e.kind === 'distribution')
    const archival = root.estateEvents.find(e => e.closureId === receipt.closureId && e.week === receipt.week && e.kind === 'archival')
    if (!archival || receipt.p15DomainSequence >= archival.p15DomainSequence
      || distribution && receipt.p15DomainSequence >= distribution.p15DomainSequence) fail('sale intake must precede claims and archival')
  }
  for (const estate of rights.estates) {
    const own = transactions.filter(t => t.estateId === estate.estateId)
    if (estate.proceeds.length !== own.length || estate.proceeds.some(p => !own.some(t => t.id === p.transactionId && t.amount === p.amount && t.lotId === p.lotId))) fail('proceeds must name exactly the actual winning transactions')
  }
  for (const closure of root.closures) if (!closureIds.has(closure.closureId)) fail('actual closure is missing its estate handoff')
}

/** Observations alone may drop only at the same boundary where authentic48 facts reconstruct them exactly.
 * A later unique classification, bid/transaction/materialization or current closure is recorded authority. */
export function observedEstateDowngradeRefusal(state: GameState): string | null {
  if (state.rights.estates.length === 0) return null
  if (state.rights.estates.some(e => e.origin.kind !== 'observed48' || e.origin.observedAtWeek !== state.market.tick)) return 'cannot discard unique estate observation or current closure provenance'
  const rebuilt = observePredecessorEstates({ ...state, rights: { ...state.rights, estates: [] } })
  const canonical = (value: unknown): string => JSON.stringify(value, (_key, v: unknown) =>
    v !== null && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) : v)
  return canonical(rebuilt.rights.estates) === canonical(state.rights.estates) ? null : 'cannot discard changed estate observation or bid authority'
}

export function estateHandoffRefusal(state: GameState, handoff: EstateHandoff, week: number): string | null {
  const h = state.hollywood
  if (!h) return 'noIndustry'
  if (handoff.version !== 2) return 'unknownVersion'
  const authority = closureAuthorityRefusal(state, handoff)
  if (authority !== null) return authority
  if (!h.identities.some((i) => i.studioId === handoff.studioId)) return 'unknownStudio'
  if (state.rights.estates.some((e) => e.studioId === handoff.studioId || e.estateId === handoff.estateId)) return 'duplicateEstate'
  if (typeof handoff.estateId !== 'string' || handoff.estateId.length === 0 || typeof handoff.closureId !== 'string' || handoff.closureId.length === 0) return 'invalidIdentity'
  const { closureWeek, opensWeek, closesWeek } = handoff
  if (![closureWeek, opensWeek, closesWeek].every(Number.isSafeInteger) || opensWeek !== closureWeek || closesWeek !== opensWeek + TUNING.ESTATE_WINDOW_WEEKS) return 'invalidWindow'
  // r2 (F18): the estate opens in the closure week itself, on the state of that week.
  if (week !== closureWeek || week !== state.market.tick) return 'notClosureWeek'
  if (!Array.isArray(handoff.lots) || !Array.isArray(handoff.pending)) return 'invalidDispositions'
  const disposed = new Set<string>()
  const lotIds = new Set<string>()
  for (const lot of handoff.lots) {
    if (typeof lot.lotId !== 'string' || lot.lotId.length === 0 || lotIds.has(lot.lotId)) return 'duplicateLotId'
    lotIds.add(lot.lotId)
    if (!Number.isSafeInteger(lot.minimumBid) || lot.minimumBid < 0) return 'invalidMinimumBid'
    if (!Array.isArray(lot.subjects) || lot.subjects.length === 0) return 'emptyLot'
    for (const subject of lot.subjects) {
      const key = subjectKey(subject)
      if (disposed.has(key)) return 'lotOverlap'
      disposed.add(key)
      const holder = currentHolder(state, subject, closureWeek)
      if (holder.kind !== 'holder' || holder.holderId !== handoff.studioId || holder.archived || holder.estate !== undefined) return 'lotSubjectNotHeld'
      const blocked = blockingEncumbrance(state, subject)
      if (blocked !== null) return `lotEncumbered:${blocked}:${key}`
    }
    if (!Array.isArray(lot.encumbrances) || !sameList(lot.encumbrances, lotEncumbranceRefs(state, lot.subjects, week))) return `encumbranceMismatch:${lot.lotId}`
  }
  for (const pending of handoff.pending) {
    if (!(ESTATE_PENDING_REASONS as readonly string[]).includes(pending.reason)) return 'invalidPendingReason'
    const key = subjectKey(pending.subject)
    if (disposed.has(key)) return `dispositionDuplicate:${key}`
    disposed.add(key)
    const holder = currentHolder(state, pending.subject, closureWeek)
    if (holder.kind !== 'holder' || holder.holderId !== handoff.studioId || holder.archived || holder.estate !== undefined) return `pendingSubjectNotHeld:${key}`
  }
  // r2 (F39): every right the studio holds at closure gets exactly one disposition.
  for (const subject of subjectsHeldBy(resolveTitles(state), state.rights.estates, handoff.studioId, closureWeek)) {
    if (!disposed.has(subjectKey(subject))) return `dispositionMissing:${subjectKey(subject)}`
  }
  const claims = handoff.claimsContext
  if (typeof claims?.priorityVersion !== 'string' || claims.priorityVersion.length === 0 || !Array.isArray(claims.claimIds)
    || claims.claimIds.some((c) => typeof c !== 'string' || c.length === 0) || new Set(claims.claimIds).size !== claims.claimIds.length) return 'invalidClaimsContext'
  if (!Number.isFinite(handoff.cashReconciliation?.terminalCash) || !Number.isFinite(handoff.cashReconciliation?.loanRemainder)) return 'invalidCashReconciliation'
  return null
}

/** r2 (F60): the unbound P15B sentinel can certify no bidder, so it may neither open an estate nor run its ceremony. */
function requireBoundReaders(readers: CorporateConditionReaders, what: string): void {
  if (readers === UNBOUND_CORPORATE_CONDITION_READERS) {
    throw new Error(`estate: ${what} refused: conditionReadersUnbound (bind the P15B readers in rightsFinance.ts in the same change that wires the closure producer)`)
  }
}

/** Opens the estate: every disposed title is materialized so every later event has a persisted chain. Moves no money, touches no person. */
export function openEstate(state: GameState, handoff: EstateHandoff, week: number, readers: CorporateConditionReaders = corporateConditionReaders): { state: GameState; estate: EstateRecord } {
  requireBoundReaders(readers, 'opening an estate')
  const refusal = estateHandoffRefusal(state, handoff, week)
  if (refusal !== null) throw new Error(`estate handoff refused: ${refusal}`)
  let next = state
  for (const subject of [...handoff.lots.flatMap((lot) => lot.subjects), ...handoff.pending.map((p) => p.subject)]) next = materializeLegacyTitles(next, subject)
  const estate: EstateRecord = {
    origin: { kind: 'closure49', closureId: handoff.closureId },
    estateId: handoff.estateId, closureId: handoff.closureId, studioId: handoff.studioId, closureWeek: handoff.closureWeek,
    opensWeek: handoff.opensWeek, closesWeek: handoff.closesWeek,
    lots: handoff.lots.map((lot) => ({ lotId: lot.lotId, subjects: lot.subjects.map((s) => ({ ...s })), minimumBid: lot.minimumBid, encumbrances: [...lot.encumbrances],
      status: 'open', winningBidId: null, transactionId: null })),
    bids: [], proceeds: [], closedWeek: null,
    pending: handoff.pending.map((p) => ({ subject: { ...p.subject }, reason: p.reason, status: 'pending' })),
    claimsContext: { priorityVersion: handoff.claimsContext.priorityVersion, claimIds: [...handoff.claimsContext.claimIds] },
    cashReconciliation: { ...handoff.cashReconciliation },
  }
  return { state: { ...next, rights: { ...next.rights, estates: [...next.rights.estates, estate] } }, estate }
}

export function estateBidRefusal(state: GameState, input: EstateBidInput, week: number, readers: CorporateConditionReaders = corporateConditionReaders): string | null {
  const estate = state.rights.estates.find((e) => e.estateId === input.estateId)
  if (estate === undefined) return 'unknownEstate'
  if (estate.closedWeek !== null || week >= estate.closesWeek) return 'estateClosed'
  if (week < estate.opensWeek) return 'estateNotOpen'
  const lot = estate.lots.find((l) => l.lotId === input.lotId)
  if (lot === undefined || lot.status !== 'open') return 'unknownLot'
  if (input.bidderId === estate.studioId) return 'selfDealing'
  if (!Number.isSafeInteger(input.amount) || input.amount < 1) return 'invalidBid'
  if (input.amount < lot.minimumBid) return 'belowMinimumBid'
  const permitted = permittedBidderRefusal(state, input.bidderId, week, readers)
  if (permitted !== null) return `bidderNotPermitted:${permitted}`
  if (estate.bids.some((b) => b.status === 'sealed' && b.lotId === input.lotId && b.bidderId === input.bidderId)) return 'duplicateBid'
  return affordabilityRefusal(state, input.bidderId, input.amount)
}

/** A sealed bid: admitted only before D, reserving its amount until the ceremony. */
export function submitEstateBid(state: GameState, input: EstateBidInput, week: number, readers: CorporateConditionReaders = corporateConditionReaders): { state: GameState; bid: EstateBid } {
  const refusal = estateBidRefusal(state, input, week, readers)
  if (refusal !== null) throw new Error(`estate bid refused: ${refusal}`)
  const allocated = allocateRightsId(state.rights, 'estate-bid')
  const bid: EstateBid = { quoteAgePolicyVersion: QUOTE_AGE_POLICY_VERSION, id: allocated.id, estateId: input.estateId, lotId: input.lotId, bidderId: input.bidderId, amount: input.amount, week, status: 'sealed', disqualification: null }
  const estates = allocated.root.estates.map((e) => (e.estateId === input.estateId ? { ...e, bids: [...e.bids, bid] } : e))
  return { state: { ...state, rights: { ...allocated.root, estates } }, bid }
}

function withEstate(state: GameState, estate: EstateRecord): GameState {
  return { ...state, rights: { ...state.rights, estates: state.rights.estates.map((e) => (e.estateId === estate.estateId ? estate : e)) } }
}

/**
 * The close ceremony, exactly once at D: per lot, sealed bids compare by descending amount then
 * ascending reserved identity row; each candidate is revalidated (the lot's encumbrances, permitted
 * bidder, lot authority, reserved cash after its earlier wins) and the first valid one wins; the rest
 * lose. Unsold lots and pending rights archive. No RNG is drawn.
 */
function resolveEstateSales(state: GameState, estateId: string, week: number): GameState {
  const h = state.hollywood
  if (!h) throw new Error('estate: no industry')
  const found = state.rights.estates.find((e) => e.estateId === estateId)
  if (found === undefined) throw new Error(`estate: unknown estate ${estateId}`)
  if (found.closedWeek !== null) throw new Error(`estate: ${estateId} is already closed (week ${found.closedWeek})`)
  if (week !== found.closesWeek || state.market.tick !== week) throw new Error(`estate: ${estateId} must resolve at its exact current close boundary ${found.closesWeek}`)
  const readers = corporateConditionReaders
  requireBoundReaders(readers, `the close ceremony of ${estateId}`)
  const row = (studioId: string): number => h.identities.find((i) => i.studioId === studioId)?.row ?? Number.MAX_SAFE_INTEGER
  let next = state
  let estate: EstateRecord = { ...found, lots: found.lots.map((l) => ({ ...l })), bids: found.bids.map((b) => ({ ...b })), proceeds: [...found.proceeds],
    pending: found.pending.map((p) => ({ ...p })) }
  for (const lot of estate.lots) {
    const candidates = estate.bids.filter((b) => b.lotId === lot.lotId && b.status === 'sealed')
      .sort((a, b) => b.amount - a.amount || row(a.bidderId) - row(b.bidderId) || (a.id < b.id ? -1 : 1))
    // r2 (F4/F29): the sale law's encumbrances hold again at D; an encumbered lot cannot sell and archives.
    const encumbered = lot.subjects.map((s) => { const b = blockingEncumbrance(next, s); return b === null ? null : `lotEncumbered:${b}:${subjectKey(s)}` }).find((r) => r !== null) ?? null
    let winner: EstateBid | null = null
    for (const bid of candidates) {
      const quoteAge = quoteAgeRefusal('estateBid', bid.week, week, bid.quoteAgePolicyVersion)
      const permitted = permittedBidderRefusal(next, bid.bidderId, week, readers)
      const authority = lot.subjects.every((s) => { const hd = currentHolder(next, s, week); return hd.kind === 'holder' && hd.holderId === estate.studioId })
      // Lots resolve in order and debit as they go: this estate's own sealed bids are not reservations here,
      // while open bilateral offers and sealed bids on OTHER estates still are.
      const ownSealedHere = estate.bids.filter((b) => b.bidderId === bid.bidderId && b.status === 'sealed').reduce((s, b) => s + b.amount, 0)
      const available = spendableCash(next, bid.bidderId) + ownSealedHere
      const refusal = quoteAge !== null ? quoteAge : encumbered !== null ? encumbered : permitted !== null ? `bidderNotPermitted:${permitted}` : !authority ? 'lotAuthorityLost'
        : available - bid.amount < postPurchaseReserve(next, bid.bidderId) ? 'insufficientCashAfterReserve' : null
      if (refusal !== null) {
        bid.status = 'disqualified'
        bid.disqualification = refusal
        next = withEstate(next, estate)
        continue
      }
      winner = bid
      break
    }
    // Unsold/pending title archival belongs after P15 claims, not this sales phase.
    if (winner === null) continue
    const txAllocated = allocateRightsId(next.rights, 'rights-tx')
    next = { ...next, rights: txAllocated.root }
    const titleEventIds: string[] = []
    for (const s of lot.subjects) {
      const appended = appendTitleEvent(next, { subject: s, priorHolder: estate.studioId, newHolder: winner.bidderId, cause: 'estateSale',
        date: { kind: 'campaign', week }, source: { kind: 'transaction', transactionId: txAllocated.id } })
      next = appended.state
      titleEventIds.push(appended.event.id)
    }
    winner.status = 'won'
    for (const bid of estate.bids) if (bid.lotId === lot.lotId && bid.status === 'sealed') bid.status = 'lost'
    lot.status = 'sold'
    lot.winningBidId = winner.id
    lot.transactionId = txAllocated.id
    estate.proceeds.push({ transactionId: txAllocated.id, lotId: lot.lotId, amount: winner.amount })
    next = withEstate(next, estate)
    next = moveStudioCash(next, winner.bidderId, 'rightsConsideration', -winner.amount, week, txAllocated.id)
    const transaction: RightsTransaction = { id: txAllocated.id, week, kind: 'estateSale', payerId: winner.bidderId, payeeId: null, estateId, amount: winner.amount,
      subject: null, licenceId: null, offerId: null, lotId: lot.lotId, bidId: winner.id, titleEventIds }
    next = { ...next, rights: { ...next.rights, transactions: [...next.rights.transactions, transaction] } }
  }
  return withEstate(next, estate)
}

/** @internal Tick's pre-ranking phase. All sale receipts precede every closure-phase distribution.
 * The returned preparation is private to the tick aggregate and never a public saved-state result. */
export function prepareEstateSalesForTick(state: GameState): GameState {
  let next = state
  const week = state.market.tick
  const due = state.rights.estates.filter(e => e.closedWeek === null && e.closesWeek <= week)
    .sort((a, b) => a.studioId < b.studioId ? -1 : a.studioId > b.studioId ? 1 : a.estateId < b.estateId ? -1 : a.estateId > b.estateId ? 1 : 0)
  for (const estate of due) {
    if (estate.closesWeek !== week) throw new Error('estate: an unresolved close boundary was skipped')
    next = resolveEstateSales(next, estate.estateId, week)
    const sold = next.rights.transactions.filter(t => t.kind === 'estateSale' && t.estateId === estate.estateId && t.week === week)
    for (const transaction of sold) next = receiveEstateSaleProceeds(next, estate.closureId, transaction.id)
  }
  return next
}

/** @internal P15 closure service has distributed actual cash and appended its single archival first. */
export function finishEstateArchival(state: GameState, closureId: string, week: number): GameState {
  const found = state.rights.estates.find(e => e.closureId === closureId)
  if (found === undefined) throw new Error('estate: actual closure has no handoff to archive')
  if (found.closedWeek !== null || found.closesWeek !== week || state.market.tick !== week) throw new Error('estate: duplicate or mistimed archival')
  const archival = state.studioClosure.estateEvents.filter(e => e.closureId === closureId && e.kind === 'archival')
  if (archival.length !== 1 || archival[0]!.week !== week) throw new Error('estate: claims owner has not published its exact archival')
  let next = state
  const estate: EstateRecord = { ...found, lots: found.lots.map(l => ({ ...l })), pending: found.pending.map(p => ({ ...p })),
    bids: found.bids.map(b => ({ ...b })), proceeds: [...found.proceeds] }
  for (const lot of estate.lots) {
    if (lot.status === 'sold') continue
    for (const subject of lot.subjects) next = appendTitleEvent(next, { subject, priorHolder: estate.studioId,
      newHolder: estateHolderId(estate.studioId), cause: 'archive', date: { kind: 'campaign', week }, source: { kind: 'estate', estateId: estate.estateId } }).state
    lot.status = 'archived'
  }
  for (const pending of estate.pending) {
    next = appendTitleEvent(next, { subject: pending.subject, priorHolder: estate.studioId, newHolder: estateHolderId(estate.studioId), cause: 'archive',
      date: { kind: 'campaign', week }, source: { kind: 'estate', estateId: estate.estateId } }).state
    pending.status = 'archived'
  }
  return withEstate(next, { ...estate, closedWeek: week })
}

/** Public resolution is one ordinary validated D−1→D advance of the complete aggregate.
 * It cannot expose sales-only state or bypass condition/ranking/claim/archival phases. */
export function resolveEstate(state: GameState, estateId: string, week: number, readers: CorporateConditionReaders = corporateConditionReaders): GameState {
  const estate = state.rights.estates.find(e => e.estateId === estateId)
  if (estate === undefined) throw new Error(`estate: unknown estate ${estateId}`)
  if (estate.closedWeek !== null) throw new Error(`estate: ${estateId} is already closed (week ${estate.closedWeek})`)
  if (readers !== corporateConditionReaders) throw new Error('estate: public resolution requires actual evaluated condition readers')
  if (week !== estate.closesWeek || state.market.tick !== week - 1) throw new Error('estate: public resolution requires the admitted current D−1 input and exact D')
  makeSave(state)
  const next = tick(state)
  if (next.rights.estates.find(e => e.estateId === estateId)?.closedWeek !== week) throw new Error('estate: joined resolution did not publish archival')
  return next
}

/** Public aggregate shares that same single ordinary advance, including all due estates. */
export function closeDueEstates(state: GameState, week: number, readers: CorporateConditionReaders = corporateConditionReaders): GameState {
  const due = state.rights.estates.filter(e => e.closedWeek === null && e.closesWeek <= week)
    .sort((a, b) => a.studioId < b.studioId ? -1 : a.studioId > b.studioId ? 1 : a.estateId < b.estateId ? -1 : a.estateId > b.estateId ? 1 : 0)
  if (due.length === 0) return state
  return resolveEstate(state, due[0]!.estateId, week, readers)
}

export function estateWindow(closureWeek: number): { opensWeek: number; closesWeek: number } {
  return { opensWeek: closureWeek, closesWeek: closureWeek + TUNING.ESTATE_WINDOW_WEEKS }
}
