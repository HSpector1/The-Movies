// ── ASTRA Sprint 18 (Owner decisions B and C, 2026-10-29): the player's rights desk ──
//
// A pure read model over the P16 roots (rights.ts, assetSale.ts, dueDiligence.ts, acquisition.ts, estate.ts,
// rightsFinance.ts) and the P18 season view. It names what the player holds, what is offered to and by the player,
// which studios the player may examine or acquire, which estates are open, and what a proposed title sale would do to a
// live season. It moves no money and invents no rule: every refusal is the core's own, read at the current week, so a
// stale screen can never approve different consequences (the actions revalidate against the same functions at commit).
import { absorptionRefusal } from './acquisition.js'
import { applyActions } from './actions.js'
import { closingRefusal, instrumentRefusal, instrumentSubject, offerRefusal, resaleHoldbackRefusal, type PlayerOfferInput } from './assetSale.js'
import { diligenceRefusal } from './dueDiligence.js'
import { estateBidRefusal } from './estate.js'
import { blockingEncumbrance } from './licence.js'
import { isOperatingStudio } from './operatingState.js'
import { subjectValueV1 } from './propertyValuation.js'
import { permittedBidderRefusal, postPurchaseReserve, spendableCash } from './rightsFinance.js'
import { currentHolder, resolveTitles, sameSubject, subjectsHeldBy, type DiligenceRecord, type DiligenceScopeItem, type EstateBid, type Licence, type RightSubject, type RightsOffer } from './rights.js'
import { TUNING } from './tuning.js'
import { tick } from './tick.js'
import type { TvCancellationCause, TvSettlement } from './tvTypes.js'
import { tvView, type TvSeasonView } from './tvView.js'
import type { GameState } from './types.js'

export type RightsDeskTitle = {
  subject: RightSubject
  title: string | null
  /** Why a sale offer on it would be refused now (the instrument law: encumbrance, resale holdback), or null when it may be offered. */
  saleRefusal: string | null
  encumbrance: 'activeProduction' | 'activeRun' | null
  resaleHoldback: boolean
  value: number | null
  /** Licences the player granted over it that have not ended. */
  licencesOut: { licenceId: string; granteeId: string; use: string; exclusive: boolean; endWeekExclusive: number }[]
  /** Live seasons the player produces on this property (R1 only). */
  liveSeasonIds: string[]
}
export type RightsDeskOffer = {
  offer: RightsOffer
  role: 'offeror' | 'counterparty'
  subjectTitle: string | null
  /** For an open offer: why accepting it now would be refused (the close law), or null when it may close. */
  closing: string | null
}
export type RightsDeskCounterparty = {
  studioId: string
  name: string
  /** Null when the player may request full-scope diligence about this studio now. */
  diligence: string | null
  /** Null when the player may quote an absorption of this studio now. */
  absorption: string | null
  disclosures: { id: string; week: number; scope: DiligenceScopeItem[]; staleFromWeek: number; fresh: boolean }[]
}
export type RightsDeskLot = {
  lotId: string; subjects: RightSubject[]; titles: (string | null)[]; minimumBid: number; encumbrances: string[]
  status: 'open' | 'sold' | 'archived'
  myBid: EstateBid | null
  /** Why a bid at the minimum would be refused now, or null when the player may bid. */
  bidRefusal: string | null
}
export type RightsDeskEstate = { estateId: string; studioId: string; name: string; closureWeek: number; opensWeek: number; closesWeek: number; lots: RightsDeskLot[] }
export type RightsDeskView = {
  week: number
  studioId: string
  /** Why the player may not buy, bid or examine now (the permitted-bidder matrix), or null. */
  permitted: string | null
  spendable: number
  reserve: number
  diligenceFee: number
  titles: RightsDeskTitle[]
  offers: RightsDeskOffer[]
  licencesIn: Licence[]
  counterparties: RightsDeskCounterparty[]
  estates: RightsDeskEstate[]
}

const DILIGENCE_FULL_SCOPE: DiligenceScopeItem[] = ['rights', 'employment', 'liabilities']

function titleOf(resolved: ReturnType<typeof resolveTitles>, subject: RightSubject): string | null {
  return subject.right === 'R1'
    ? resolved.properties.find((p) => p.propertyId === subject.propertyId)?.title ?? null
    : resolved.filmTitles.find((t) => t.filmId === subject.filmId)?.title ?? null
}

/** The player's rights desk at the current week. Throws by name when there is no industry (the screen has nothing to show). */
export function rightsDeskView(state: GameState): RightsDeskView {
  const h = state.hollywood
  if (!h) throw new Error('rights desk: no industry')
  const week = state.market.tick
  const me = h.playerStudioId
  const resolved = resolveTitles(state)
  const seasons = tvView(state).seasons
  const nameOf = (studioId: string): string => h.identities.find((i) => i.studioId === studioId)?.name ?? studioId
  const titles = subjectsHeldBy(resolved, state.rights.estates, me, week).map((subject): RightsDeskTitle => {
    const encumbrance = blockingEncumbrance(state, subject)
    const holdback = resaleHoldbackRefusal(state, subject, me, week) !== null
    const value = subjectValueV1(state, subject, week, resolved)
    return {
      subject, title: titleOf(resolved, subject),
      // The instrument law itself (tradeable, encumbrance, holdback); the buyer argument is unused for a title.
      saleRefusal: instrumentRefusal(state, me, me, 'sell', { kind: 'title', subject }, week),
      encumbrance, resaleHoldback: holdback,
      value: value.kind === 'available' ? value.value : null,
      licencesOut: state.rights.licences.filter((l) => l.grantorId === me && sameSubject(l.subject, subject) && week < l.endWeekExclusive)
        .map((l) => ({ licenceId: l.id, granteeId: l.granteeId, use: l.scope.use, exclusive: l.exclusive, endWeekExclusive: l.endWeekExclusive })),
      liveSeasonIds: subject.right === 'R1' ? seasons.filter((s) => s.status === 'live' && s.propertyId === subject.propertyId).map((s) => s.seasonId) : [],
    }
  })
  const offers = state.rights.offers.filter((o) => o.offerorId === me || o.counterpartyId === me)
    .map((offer): RightsDeskOffer => ({
      offer, role: offer.offerorId === me ? 'offeror' : 'counterparty', subjectTitle: titleOf(resolved, instrumentSubject(offer.instrument)),
      closing: offer.status === 'open' && week < offer.expiresWeek ? closingRefusal(state, offer, week) : null,
    }))
    .sort((a, b) => b.offer.week - a.offer.week || (a.offer.id < b.offer.id ? -1 : 1))
  // Operating rivals only (a closed studio deals through its estate below). A rival's condition is disclosed knowledge:
  // the acquisition law is consulted only once a fresh full-scope disclosure is held; before that the core's own
  // `disclosureRequired` stands, so no stage or loan fact leaks through a refusal (review finding 8).
  const counterparties = h.businesses.map((b) => b.studioId).filter((id) => id !== me && isOperatingStudio(state, id)).sort().map((studioId): RightsDeskCounterparty => {
    const disclosures = state.rights.diligence.filter((d): d is DiligenceRecord => d.recipientId === me && d.target.kind === 'studio' && d.target.studioId === studioId)
      .map((d) => ({ id: d.id, week: d.week, scope: [...d.scope], staleFromWeek: d.staleFromWeek, fresh: week < d.staleFromWeek }))
    const fullFresh = disclosures.some((d) => d.fresh && DILIGENCE_FULL_SCOPE.every((item) => d.scope.includes(item)))
    return {
      studioId, name: nameOf(studioId),
      diligence: diligenceRefusal(state, { recipientId: me, target: { kind: 'studio', studioId }, scope: DILIGENCE_FULL_SCOPE }, week),
      absorption: fullFresh ? absorptionRefusal(state, me, studioId, week) : 'disclosureRequired',
      disclosures,
    }
  })
  const estates = state.rights.estates.filter((e) => e.closedWeek === null && week < e.closesWeek).map((e): RightsDeskEstate => ({
    estateId: e.estateId, studioId: e.studioId, name: nameOf(e.studioId), closureWeek: e.closureWeek, opensWeek: e.opensWeek, closesWeek: e.closesWeek,
    lots: e.lots.map((lot): RightsDeskLot => ({
      lotId: lot.lotId, subjects: lot.subjects.map((s) => ({ ...s })), titles: lot.subjects.map((s) => titleOf(resolved, s)), minimumBid: lot.minimumBid,
      encumbrances: [...lot.encumbrances], status: lot.status,
      myBid: e.bids.find((b) => b.lotId === lot.lotId && b.bidderId === me && b.status === 'sealed') ?? null,
      bidRefusal: estateBidRefusal(state, { estateId: e.estateId, lotId: lot.lotId, bidderId: me, amount: lot.minimumBid }, week),
    })),
  }))
  return {
    week, studioId: me, permitted: permittedBidderRefusal(state, me, week),
    spendable: spendableCash(state, me), reserve: postPurchaseReserve(state, me), diligenceFee: TUNING.RIGHTS_DUE_DILIGENCE_FEE,
    titles, offers, licencesIn: state.rights.licences.filter((l) => l.granteeId === me && week < l.endWeekExclusive), counterparties, estates,
  }
}

// ── Decision B: what a title sale would do to the player's live seasons — the engine's own answer ────────────────
//
// Review FIX-1 (finding 1): a projection from the current week was wrong whenever the season still worked that week
// (the unit credited before the title moved, a milestone earned, a delivery at eleven units, the final boundary). The
// disclosure is therefore the engine itself run forward on a private copy: the plan is applied and the week advanced
// until the offer is answered and the season has met the consequence, exactly as the real advance will if the player
// changes nothing else before it. Nothing from the copy is kept; the digest of the outcome rides with the confirmation.

export type TitleSalePlan =
  /** The player's own sell offer: a rival answers it at the coming week boundary (rightsTick.ts). */
  | { kind: 'offer'; offer: PlayerOfferInput }
  /** Accepting a rival's open buy offer: the sale closes in the action itself. */
  | { kind: 'accept'; offerId: string }
export type TitleSaleSeasonOutcome = {
  seasonId: string
  seriesTitle: string
  /** The season as it stands now. */
  before: { creditedUnits: number; totalUnits: number; earned: number; received: number }
  /** The season once the sale has been answered and its consequence met (or the week has passed without a sale). */
  after: {
    status: TvSeasonView['status']
    cancellation: { week: number; cause: TvCancellationCause } | null
    deliveredWeek: number | null
    creditedUnits: number
    earned: number
    settlement: TvSettlement | null
    outstanding: number
  }
}
export type TitleSaleOutcome =
  | { kind: 'refused'; subject: RightSubject; week: number; refusal: string }
  | {
      kind: 'outcome'
      subject: RightSubject
      /** The week the plan is made. */
      week: number
      /** How the offer stands after the answering boundary: closed (the title moved), rejected by the counterparty, or still open. */
      answer: { kind: 'closed'; week: number; price: number } | { kind: 'rejected'; week: number; reason: string } | { kind: 'open'; expiresWeek: number }
      /** The week the copy reaches; the real advance reaches the same state if nothing else changes before it. */
      reachesWeek: number
      /** Live seasons the player produces on this property, before and after. */
      seasons: TitleSaleSeasonOutcome[]
    }

const strip = (message: string): string => message.replace(/^applyActions: \w+ rejected — /, '')

function seasonsOn(state: GameState, subject: RightSubject): TvSeasonView[] {
  return subject.right === 'R1' ? tvView(state).seasons.filter((s) => s.propertyId === subject.propertyId) : []
}

/**
 * The outcome of `plan` for the player's live seasons on the title, computed by the engine on a private copy:
 * the action, then one advance (a sell offer is answered at the boundary; an accepted buy offer has already moved
 * the title) and, when the title has moved, one more advance so the season meets its boundary rule. Throws by name
 * only when the engine itself throws; a refused action is reported, never thrown.
 */
export function titleSaleOutcome(state: GameState, plan: TitleSalePlan): TitleSaleOutcome {
  const week = state.market.tick
  const subject: RightSubject | null = plan.kind === 'offer'
    ? (plan.offer.instrument.kind === 'title' ? plan.offer.instrument.subject : null)
    : (state.rights.offers.find((o) => o.id === plan.offerId)?.instrument.subject ?? null)
  if (subject === null) throw new Error('rights desk: a title sale outcome needs a title instrument')
  const liveBefore = seasonsOn(state, subject).filter((s) => s.status === 'live')
  let acted: GameState
  try {
    acted = applyActions(state, [plan.kind === 'offer' ? { kind: 'makeRightsOffer', offer: plan.offer } : { kind: 'acceptRightsOffer', offerId: plan.offerId }])
  } catch (e) {
    return { kind: 'refused', subject, week, refusal: strip((e as Error).message) }
  }
  let answer: Extract<TitleSaleOutcome, { kind: 'outcome' }>['answer']
  let reached: GameState
  if (plan.kind === 'offer') {
    const before = new Set(state.rights.offers.map((o) => o.id))
    const made = acted.rights.offers.find((o) => !before.has(o.id))
    if (made === undefined) throw new Error('rights desk: the sell offer was accepted by the core but is not on record')
    const answered = tick(acted)
    const row = answered.rights.offers.find((o) => o.id === made.id)
    if (row === undefined) throw new Error(`rights desk: offer ${made.id} vanished during the advance`)
    if (row.status === 'accepted') { answer = { kind: 'closed', week: answered.market.tick, price: row.price }; reached = tick(answered) }
    else if (row.status === 'open') { answer = { kind: 'open', expiresWeek: row.expiresWeek }; reached = answered }
    else { answer = { kind: 'rejected', week: answered.market.tick, reason: row.refusal ?? row.status }; reached = answered }
  } else {
    const row = acted.rights.offers.find((o) => o.id === plan.offerId)
    if (row === undefined || row.status !== 'accepted') throw new Error(`rights desk: offer ${plan.offerId} did not close in the action`)
    answer = { kind: 'closed', week, price: row.price }
    reached = tick(acted)
  }
  const after = seasonsOn(reached, subject)
  const seasons = liveBefore.map((s): TitleSaleSeasonOutcome => {
    const r = after.find((x) => x.seasonId === s.seasonId)
    if (r === undefined) throw new Error(`rights desk: season ${s.seasonId} vanished during the advance`)
    return {
      seasonId: s.seasonId, seriesTitle: s.seriesTitle,
      before: { creditedUnits: s.creditedUnits, totalUnits: s.totalUnits, earned: s.agreement.earned, received: s.agreement.received },
      after: { status: r.status, cancellation: r.cancellation, deliveredWeek: r.deliveredWeek, creditedUnits: r.creditedUnits, earned: r.agreement.earned,
        settlement: r.agreement.settlement, outstanding: r.agreement.outstanding },
    }
  })
  return { kind: 'outcome', subject, week, answer, reachesWeek: reached.market.tick, seasons }
}

/** A stable digest of the disclosed outcome; an action carrying it is refused when the outcome recomputed now differs. */
export function titleSaleOutcomeDigest(o: TitleSaleOutcome): string {
  return JSON.stringify(o.kind === 'refused' ? { refused: o.refusal, subject: o.subject, week: o.week } : {
    subject: o.subject, week: o.week, answer: o.answer, reachesWeek: o.reachesWeek,
    seasons: o.seasons.map((s) => ({ seasonId: s.seasonId, before: s.before, after: s.after })),
  })
}

/** The player's sale offer, checked by the submission law without being made: null when it may be made now. */
export function saleOfferRefusal(state: GameState, counterpartyId: string, subject: RightSubject, price: number): string | null {
  const h = state.hollywood
  if (!h) return 'noIndustry'
  return offerRefusal(state, { offerorId: h.playerStudioId, counterpartyId, direction: 'sell', instrument: { kind: 'title', subject }, price }, state.market.tick)
}

/** Whether `subject` is held by the player now (a sale of someone else's title is never the player's to disclose). */
export function playerHolds(state: GameState, subject: RightSubject): boolean {
  const h = state.hollywood
  if (!h) return false
  const holder = currentHolder(state, subject, state.market.tick)
  return holder.kind === 'holder' && holder.holderId === h.playerStudioId && holder.tradeable
}
