/** ASTRA Sprint 27 (projection 71): the Rights desk and the estates on the Bridge. Every row, refusal, valuation and
 * consequence is the core's own, read at the current week: the desk (src/core/rightsDesk.ts rightsDeskView), the sale law
 * (saleOfferRefusal), the decision B season consequence (titleSaleOutcome, whose digest binds the commit exactly as the
 * browser's confirmation does in ui/src/engine/rights.ts), the bid law (src/core/estate.ts estateBidRefusal) and the
 * rival's willingness (src/core/assetSale.ts rivalWillingness). The commit verbs are the core actions makeRightsOffer,
 * acceptRightsOffer, rejectRightsOffer, withdrawRightsOffer and submitEstateBid, which revalidate every subject, party,
 * permission, reservation and duplicate rule at commit. The Bridge computes no figure of its own: the cash a sealed bid
 * reserves and the expiry a made offer carries are read from the core's private successor, then discarded. */
import { applyActions } from '../src/core/actions.js'
import { rivalWillingness } from '../src/core/assetSale.js'
import { estateBidRefusal } from '../src/core/estate.js'
import { blockingEncumbrance } from '../src/core/licence.js'
import { subjectValueV1 } from '../src/core/propertyValuation.js'
import { playerHolds, rightsDeskView, saleOfferRefusal, titleSaleOutcome, titleSaleOutcomeDigest, type RightsDeskView, type TitleSaleOutcome, type TitleSalePlan } from '../src/core/rightsDesk.js'
import { postPurchaseReserve, spendableCash } from '../src/core/rightsFinance.js'
import { resolveTitles, sameSubject, type RightSubject, type RightsOffer } from '../src/core/rights.js'
import type { Action, GameState } from '../src/core/types.js'
import type { AvailableIntent } from './protocol.ts'
import type { BridgeEstateBidDraftPayload, BridgeEstateBidQuoteSnapshot, BridgeRightsOfferDraftPayload, BridgeRightsOfferQuoteSnapshot, BridgeTitleSaleOutcome } from './schema/bridge-schema.ts'
import type { BridgeRightSubject, BridgeRightsSubjectLicence, EstatesPage, RightsPage } from './schema/industry-schema.ts'

export type RightsIntentKind = 'acceptRightsOffer' | 'rejectRightsOffer' | 'withdrawRightsOffer'
export type RightsIntentSpec = { offerId: string; kind: RightsIntentKind; label: string; detail: string; action: Extract<Action, { kind: RightsIntentKind }> }
export type RightsIntent = { spec: RightsIntentSpec; option: AvailableIntent }

const money = (n: number): string => `$${Math.round(n).toLocaleString('en-US')}`
const subjectCopy = (s: RightSubject): BridgeRightSubject => (s.right === 'R1' ? { right: 'R1', propertyId: s.propertyId } : { right: 'R2', filmId: s.filmId })
const coreSubject = (s: BridgeRightSubject): RightSubject => (s.right === 'R1' ? { right: 'R1', propertyId: s.propertyId } : { right: 'R2', filmId: s.filmId })
const rightLabel = (s: RightSubject): string => (s.right === 'R1' ? 'story property' : 'film title')
const nameOf = (state: GameState, studioId: string): string => state.hollywood?.identities.find((i) => i.studioId === studioId)?.name ?? studioId
const strip = (message: string): string => message.replace(/^applyActions: \w+ rejected — /, '')

function titleOf(state: GameState, subject: RightSubject): string | null {
  const resolved = resolveTitles(state)
  return subject.right === 'R1'
    ? resolved.properties.find((p) => p.propertyId === subject.propertyId)?.title ?? null
    : resolved.filmTitles.find((t) => t.filmId === subject.filmId)?.title ?? null
}

/** Every licence in force over `subject` at the current week, whoever granted it (the record, verbatim). */
function licencesOver(state: GameState, subject: RightSubject): BridgeRightsSubjectLicence[] {
  const week = state.market.tick
  return state.rights.licences.filter((l) => sameSubject(l.subject, subject) && week < l.endWeekExclusive).map((l) => ({
    licenceId: l.id, right: l.right, grantorId: l.grantorId, grantorName: nameOf(state, l.grantorId), granteeId: l.granteeId, granteeName: nameOf(state, l.granteeId),
    use: l.scope.use, exclusive: l.exclusive, startWeek: l.startWeek, endWeekExclusive: l.endWeekExclusive,
  }))
}

/** Accepting `offer` sells a title the player holds exactly when the rival buys a title the player holds (the browser's
 * rule, ui/src/engine/rights.ts acceptRightsOfferAction): that acceptance needs the decision B disclosure first, so it is
 * reached only through the quoteRightsOffer family and no one-gesture accept intent is published for it. */
export function saleReviewRequired(state: GameState, offer: RightsOffer): boolean {
  return offer.direction === 'buy' && offer.instrument.kind === 'title' && playerHolds(state, offer.instrument.subject)
}

/** One reject verb and, when the close law allows it and no disclosure is owed, one accept verb per open offer made to
 * the player; one withdraw verb per open offer the player made. The core actions decide again at commit. */
export function rightsIntentSpecs(state: GameState): RightsIntentSpec[] {
  if (state.hollywood === null) return []
  const view = rightsDeskView(state)
  const specs: RightsIntentSpec[] = []
  for (const row of view.offers) {
    const o = row.offer
    if (o.status !== 'open' || view.week >= o.expiresWeek) continue
    const what = `${o.instrument.kind === 'title' ? `the ${rightLabel(o.instrument.subject)}` : `the ${o.instrument.right} licence on`} ${row.subjectTitle ?? '(no recorded title)'}`
    if (row.role === 'offeror') {
      specs.push({ offerId: o.id, kind: 'withdrawRightsOffer', label: `Withdraw your offer to ${nameOf(state, o.counterpartyId)} on ${what}`,
        detail: `Withdraws offer ${o.id} (${money(o.price)}, open until week ${o.expiresWeek}). Nothing changes hands.`, action: { kind: 'withdrawRightsOffer', offerId: o.id } })
      continue
    }
    const other = nameOf(state, o.offerorId)
    specs.push({ offerId: o.id, kind: 'rejectRightsOffer', label: `Reject ${other}'s offer on ${what}`,
      detail: `Declines offer ${o.id} (${money(o.price)}). Nothing changes hands.`, action: { kind: 'rejectRightsOffer', offerId: o.id } })
    if (row.closing === null && !saleReviewRequired(state, o)) {
      // The rival sells to the player (a purchase), or buys a licence: the close is immediate and the core holds every
      // closing condition again. The option's verb marks it confirmation=required (money moves at once).
      specs.push({ offerId: o.id, kind: 'acceptRightsOffer', label: `Accept ${other}'s offer: ${o.direction === 'sell' ? 'buy' : 'grant'} ${what} for ${money(o.price)}`,
        detail: `Closes now: ${money(o.price)} ${o.direction === 'sell' ? `leaves your cash for ${other} and ${what} passes to you` : `arrives from ${other} and the licence is granted`}; the core holds every closing condition again.`,
        action: { kind: 'acceptRightsOffer', offerId: o.id } })
    }
  }
  return specs
}

function titleRows(state: GameState, view: RightsDeskView): RightsPage['titles'] {
  return view.titles.map((t) => ({
    subject: subjectCopy(t.subject), title: t.title, saleRefusal: t.saleRefusal, encumbrance: t.encumbrance, resaleHoldback: t.resaleHoldback, value: t.value,
    licencesOut: licencesOver(state, t.subject).filter((l) => l.grantorId === view.studioId), liveSeasonIds: [...t.liveSeasonIds],
  }))
}

export function rightsPage(state: GameState, targetId: string | null, page: number, pageSize: number, intents: readonly RightsIntent[]): { rights: RightsPage; totalRows: number; pageCount: number } {
  if (targetId !== null) throw new Error('The rights view requires a null targetId.')
  if (state.hollywood === null) throw new Error('The rights view requires an established player studio.')
  const view = rightsDeskView(state)
  const titles = titleRows(state, view)
  const pageCount = Math.ceil(titles.length / pageSize)
  if (page > 0 && page >= pageCount) throw new Error('That rights page is outside this record.')
  const option = (offerId: string, kind: RightsIntentKind): AvailableIntent | null => intents.find((i) => i.spec.offerId === offerId && i.spec.kind === kind)?.option ?? null
  const offers: RightsPage['offers'] = view.offers.map((row) => {
    const o = row.offer
    return {
      offerId: o.id, week: o.week, offerorId: o.offerorId, offerorName: nameOf(state, o.offerorId), counterpartyId: o.counterpartyId, counterpartyName: nameOf(state, o.counterpartyId),
      role: row.role, direction: o.direction,
      instrument: o.instrument.kind === 'title' ? { kind: 'title', subject: subjectCopy(o.instrument.subject) }
        : { kind: 'licence', right: o.instrument.right, subject: subjectCopy(o.instrument.subject), use: o.instrument.scope.use, exclusive: o.instrument.exclusive, startWeek: o.instrument.startWeek, endWeekExclusive: o.instrument.endWeekExclusive },
      subjectTitle: row.subjectTitle, price: o.price, expiresWeek: o.expiresWeek, status: o.status, resolvedWeek: o.resolvedWeek, transactionId: o.transactionId, refusal: o.refusal,
      closing: row.closing, saleReviewRequired: o.status === 'open' && row.role === 'counterparty' && saleReviewRequired(state, o),
      acceptIntent: option(o.id, 'acceptRightsOffer'), rejectIntent: option(o.id, 'rejectRightsOffer'), withdrawIntent: option(o.id, 'withdrawRightsOffer'),
    }
  })
  return { totalRows: titles.length, pageCount, rights: {
    title: 'Rights desk',
    notice: 'What the studio holds, what is offered to and by it, the licences it holds and the studios it may deal with: each figure and refusal is the engine\'s '
      + 'own at this week. A sale offer is quoted before it is made; selling a title with a live season discloses the season\'s consequence first.',
    week: view.week, studioId: view.studioId, permitted: view.permitted, spendable: view.spendable, reserve: view.reserve,
    titles: titles.slice(page * pageSize, (page + 1) * pageSize), offers,
    licencesIn: view.licencesIn.map((l) => ({ licenceId: l.id, right: l.right, grantorId: l.grantorId, grantorName: nameOf(state, l.grantorId), granteeId: l.granteeId, granteeName: nameOf(state, l.granteeId),
      use: l.scope.use, exclusive: l.exclusive, startWeek: l.startWeek, endWeekExclusive: l.endWeekExclusive })),
    counterparties: view.counterparties.map((c) => ({ studioId: c.studioId, name: c.name })),
  } }
}

export function estatesPage(state: GameState, targetId: string | null, page: number, pageSize: number): { estates: EstatesPage; totalRows: number; pageCount: number } {
  if (targetId !== null) throw new Error('The estates view requires a null targetId.')
  if (state.hollywood === null) throw new Error('The estates view requires an established player studio.')
  const view = rightsDeskView(state)
  const me = view.studioId
  const record = (estateId: string) => {
    const found = state.rights.estates.find((e) => e.estateId === estateId)
    if (found === undefined) throw new Error(`estates view: the desk names estate ${estateId} that is not on record`)
    return found
  }
  const open: EstatesPage['estates'] = view.estates.map((e) => ({
    estateId: e.estateId, studioId: e.studioId, name: e.name, closureWeek: e.closureWeek, opensWeek: e.opensWeek, closesWeek: e.closesWeek, closedWeek: null,
    lots: e.lots.map((lot) => ({
      lotId: lot.lotId, subjects: lot.subjects.map((s, index) => ({ subject: subjectCopy(s), title: lot.titles[index] ?? null })), minimumBid: lot.minimumBid, encumbrances: [...lot.encumbrances], status: lot.status,
      myBid: lot.myBid === null ? null : { bidId: lot.myBid.id, amount: lot.myBid.amount, week: lot.myBid.week, status: lot.myBid.status, disqualification: lot.myBid.disqualification },
      bidRefusal: lot.bidRefusal, sale: null,
    })),
    claims: [],
  }))
  const closed: EstatesPage['estates'] = view.closedEstates.map((e) => {
    const rec = record(e.estateId)
    return {
      estateId: e.estateId, studioId: e.studioId, name: e.name, closureWeek: e.closureWeek, opensWeek: rec.opensWeek, closesWeek: rec.closesWeek, closedWeek: e.closedWeek,
      lots: e.lots.map((lot) => {
        const lotRecord = rec.lots.find((l) => l.lotId === lot.lotId)
        if (lotRecord === undefined) throw new Error(`estates view: the desk names lot ${lot.lotId} of ${e.estateId} that is not on record`)
        const mine = rec.bids.find((b) => b.lotId === lot.lotId && b.bidderId === me)
        const transaction = lotRecord.transactionId === null ? null : state.rights.transactions.find((t) => t.id === lotRecord.transactionId) ?? null
        if ((lot.sale === null) !== (transaction === null)) throw new Error(`estates view: lot ${lot.lotId} of ${e.estateId} disagrees with its sale record`)
        return {
          lotId: lot.lotId, subjects: lotRecord.subjects.map((s, index) => ({ subject: subjectCopy(s), title: lot.titles[index] ?? null })), minimumBid: lotRecord.minimumBid, encumbrances: [...lotRecord.encumbrances], status: lotRecord.status,
          myBid: lot.myBid === null || mine === undefined ? null : { bidId: mine.id, amount: lot.myBid.amount, week: lot.myBid.week, status: lot.myBid.status, disqualification: lot.myBid.disqualification },
          bidRefusal: null,
          sale: lot.sale === null || transaction === null ? null : { amount: lot.sale.amount, buyerId: transaction.payerId, buyerName: lot.sale.buyerName },
        }
      }),
      claims: e.claims.map((c) => ({ kind: c.kind, count: c.count, paid: c.paid, unpaid: c.unpaid })),
    }
  })
  const rows = [...open, ...closed]
  const pageCount = Math.ceil(rows.length / pageSize)
  if (page > 0 && page >= pageCount) throw new Error('That estates page is outside this record.')
  return { totalRows: rows.length, pageCount, estates: {
    title: 'Estates',
    notice: 'The estates of closed studios: open ones take sealed bids until the week before they close and resolve once at that boundary; closed ones show each lot\'s '
      + 'disposition, your bid\'s outcome with the engine\'s reason, and the closure\'s claims. A rival\'s sealed bid is never shown. A bid is quoted before it is sealed.',
    week: view.week, permitted: view.permitted, spendable: view.spendable, reserve: view.reserve, estates: rows.slice(page * pageSize, (page + 1) * pageSize),
  } }
}

// ── the estate bid quote family ──────────────────────────────────────────────────────────────────────────────────

export function estateBidDraftCopy(draft: BridgeEstateBidDraftPayload): BridgeEstateBidDraftPayload {
  return { estateId: draft.estateId, lotId: draft.lotId, amount: draft.amount }
}
export function estateBidDraftApply(current: GameState, draft: BridgeEstateBidDraftPayload) {
  try { return { ok: true as const, next: applyActions(current, [{ kind: 'submitEstateBid', ...estateBidDraftCopy(draft) }]) } }
  catch (error) { return { ok: false as const, error: strip((error as Error).message) } }
}
export function estateBidQuoteSnapshot(state: GameState, draft: BridgeEstateBidDraftPayload, intentId: string): BridgeEstateBidQuoteSnapshot {
  const week = state.market.tick
  const me = state.hollywood?.playerStudioId
  const estate = state.rights.estates.find((e) => e.estateId === draft.estateId)
  const lot = estate?.lots.find((l) => l.lotId === draft.lotId)
  // The core's bid law first (its own token), then the action itself on a private copy, whose spendable cash is the
  // reservation the sealed bid takes until the ceremony.
  const refusal = me === undefined ? 'noIndustry' : estateBidRefusal(state, { estateId: draft.estateId, lotId: draft.lotId, bidderId: me, amount: draft.amount }, week)
  const applied = refusal === null ? estateBidDraftApply(state, draft) : null
  const ok = applied?.ok === true
  return {
    intentId, kind: 'submitEstateBid', commitLabel: 'Seal the bid as quoted', startsNow: ok, queues: false, queueNote: null, ok,
    refusalReason: refusal ?? (applied !== null && !applied.ok ? applied.error : null),
    estateId: draft.estateId, lotId: draft.lotId, amount: draft.amount, quotedAtWeek: week,
    minimumBid: lot?.minimumBid ?? null, closesWeek: estate?.closesWeek ?? null, encumbrances: lot === undefined ? [] : [...lot.encumbrances],
    spendableBefore: me === undefined ? 0 : spendableCash(state, me), reserve: me === undefined ? 0 : postPurchaseReserve(state, me),
    spendableAfter: ok && me !== undefined ? spendableCash(applied!.next, me) : null,
  }
}

// ── the title offer quote family ─────────────────────────────────────────────────────────────────────────────────

export function rightsOfferDraftCopy(draft: BridgeRightsOfferDraftPayload): BridgeRightsOfferDraftPayload {
  return draft.plan === 'offer'
    ? { plan: 'offer', counterpartyId: draft.counterpartyId, subject: subjectCopy(coreSubject(draft.subject)), price: draft.price }
    : { plan: 'accept', offerId: draft.offerId }
}
/** The core plan the draft names: the player's sell offer on a held title, or the acceptance of a rival's open offer. */
export function rightsOfferPlan(draft: BridgeRightsOfferDraftPayload): TitleSalePlan {
  return draft.plan === 'offer'
    ? { kind: 'offer', offer: { counterpartyId: draft.counterpartyId, direction: 'sell', instrument: { kind: 'title', subject: coreSubject(draft.subject) }, price: draft.price } }
    : { kind: 'accept', offerId: draft.offerId }
}
function rightsOfferAction(draft: BridgeRightsOfferDraftPayload): Action {
  const plan = rightsOfferPlan(draft)
  return plan.kind === 'offer' ? { kind: 'makeRightsOffer', offer: plan.offer } : { kind: 'acceptRightsOffer', offerId: plan.offerId }
}
/** The decision B disclosure the plan owes: always for a sell offer; for an acceptance only when it sells a held title. */
export function rightsOfferDisclosure(state: GameState, draft: BridgeRightsOfferDraftPayload): { outcome: TitleSaleOutcome; digest: string } | null {
  if (draft.plan === 'accept') {
    const offer = state.rights.offers.find((o) => o.id === draft.offerId)
    if (offer === undefined || !saleReviewRequired(state, offer)) return null
  }
  const outcome = titleSaleOutcome(state, rightsOfferPlan(draft))
  return { outcome, digest: titleSaleOutcomeDigest(outcome) }
}
/** The commit: the outcome shown must still be the outcome now (the browser's rule), then the core action decides. */
export function rightsOfferDraftApply(current: GameState, draft: BridgeRightsOfferDraftPayload, acknowledgedDigest: string | null) {
  const disclosure = rightsOfferDisclosure(current, draft)
  if (disclosure !== null && disclosure.digest !== acknowledgedDigest) {
    return { ok: false as const, error: 'rights: the season consequences of this sale changed since they were shown; quote it again before committing' }
  }
  try { return { ok: true as const, next: applyActions(current, [rightsOfferAction(draft)]) } }
  catch (error) { return { ok: false as const, error: strip((error as Error).message) } }
}

function outcomeWire(outcome: TitleSaleOutcome, digest: string): BridgeTitleSaleOutcome {
  if (outcome.kind === 'refused') return { kind: 'refused', week: outcome.week, refusal: outcome.refusal, answer: null, reachesWeek: null, seasons: [], digest }
  const a = outcome.answer
  return {
    kind: 'outcome', week: outcome.week, refusal: null,
    answer: a.kind === 'closed' ? { kind: 'closed', week: a.week, price: a.price, reason: null, expiresWeek: null }
      : a.kind === 'rejected' ? { kind: 'rejected', week: a.week, price: null, reason: a.reason, expiresWeek: null }
        : { kind: 'open', week: null, price: null, reason: null, expiresWeek: a.expiresWeek },
    reachesWeek: outcome.reachesWeek,
    seasons: outcome.seasons.map((s) => ({
      seasonId: s.seasonId, seriesTitle: s.seriesTitle, before: { ...s.before },
      after: { status: s.after.status, cancellation: s.after.cancellation === null ? null : { ...s.after.cancellation }, deliveredWeek: s.after.deliveredWeek, creditedUnits: s.after.creditedUnits,
        earned: s.after.earned, settlement: s.after.settlement === null ? null : { ...s.after.settlement }, outstanding: s.after.outstanding },
    })),
    digest,
  }
}

export function rightsOfferQuoteSnapshot(state: GameState, draft: BridgeRightsOfferDraftPayload, intentId: string): BridgeRightsOfferQuoteSnapshot {
  const week = state.market.tick
  const h = state.hollywood
  const base = {
    intentId, kind: draft.plan === 'offer' ? ('makeRightsOffer' as const) : ('acceptRightsOffer' as const),
    commitLabel: draft.plan === 'offer' ? 'Make the sale offer as quoted' : 'Accept the offer as quoted', queues: false, queueNote: null,
    plan: draft.plan, offerId: draft.plan === 'accept' ? draft.offerId : null, quotedAtWeek: week,
  }
  const empty = (refusalReason: string): BridgeRightsOfferQuoteSnapshot => ({
    ...base, startsNow: false, ok: false, refusalReason, subject: null, subjectTitle: null, counterpartyId: null, counterpartyName: null, direction: null,
    playerSells: draft.plan === 'offer', price: draft.plan === 'offer' ? draft.price : 0, value: null, encumbrance: null, resaleHoldback: false, licences: [], willingness: null, expiresWeek: null, consequence: null,
  })
  if (h === null) return empty('noIndustry')
  const me = h.playerStudioId
  let subject: RightSubject, counterpartyId: string, direction: 'buy' | 'sell', price: number, playerSells: boolean
  let lawRefusal: string | null
  let willingness: BridgeRightsOfferQuoteSnapshot['willingness'] = null
  if (draft.plan === 'offer') {
    subject = coreSubject(draft.subject); counterpartyId = draft.counterpartyId; direction = 'sell'; price = draft.price; playerSells = true
    lawRefusal = saleOfferRefusal(state, counterpartyId, subject, price)
    if (lawRefusal === null) {
      const answer = rivalWillingness(state, { direction: 'sell', instrument: { kind: 'title', subject }, price, offerorId: me, counterpartyId }, week)
      const limit = /^notWilling:priceAboveBid:(\d+)$/.exec(answer.reason)
      willingness = { willing: answer.willing, reason: answer.reason, value: answer.value, limit: limit === null ? null : Number(limit[1]) }
    }
  } else {
    const offer = state.rights.offers.find((o) => o.id === draft.offerId)
    if (offer === undefined) return empty(`unknownOffer:${draft.offerId}`)
    subject = offer.instrument.subject; counterpartyId = offer.offerorId; direction = offer.direction; price = offer.price; playerSells = offer.direction === 'buy'
    // The desk's close law for an open offer made to the player; any other case is refused by the action's own sentence below.
    const row = rightsDeskView(state).offers.find((r) => r.offer.id === offer.id)
    lawRefusal = row !== undefined && row.role === 'counterparty' ? row.closing : null
  }
  const disclosure = lawRefusal === null ? rightsOfferDisclosure(state, draft) : null
  const applied = lawRefusal === null ? rightsOfferDraftApply(state, draft, disclosure?.digest ?? null) : null
  const ok = applied?.ok === true && (disclosure === null || disclosure.outcome.kind === 'outcome')
  const refusalReason = lawRefusal ?? (applied !== null && !applied.ok ? applied.error : disclosure !== null && disclosure.outcome.kind === 'refused' ? disclosure.outcome.refusal : null)
  const held = rightsDeskView(state).titles.find((t) => sameSubject(t.subject, subject))
  const valued = held === undefined ? subjectValueV1(state, subject, week) : null
  // A made sell offer carries the expiry the core stamped on it, read from the private successor.
  const before = new Set(state.rights.offers.map((o) => o.id))
  const made = ok && draft.plan === 'offer' ? applied!.next.rights.offers.find((o) => !before.has(o.id)) ?? null : null
  return {
    ...base, startsNow: ok, ok, refusalReason,
    subject: subjectCopy(subject), subjectTitle: titleOf(state, subject), counterpartyId, counterpartyName: nameOf(state, counterpartyId), direction, playerSells, price,
    value: held !== undefined ? held.value : valued !== null && valued.kind === 'available' ? valued.value : null,
    encumbrance: held !== undefined ? held.encumbrance : blockingEncumbrance(state, subject), resaleHoldback: held?.resaleHoldback ?? false,
    licences: licencesOver(state, subject), willingness, expiresWeek: made?.expiresWeek ?? null,
    consequence: disclosure === null ? null : outcomeWire(disclosure.outcome, disclosure.digest),
  }
}
