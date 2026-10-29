// ── ASTRA Sprint 18 (Owner decisions B and C, 2026-10-29): the player's rights desk ──
//
// A pure read model over the P16 roots (rights.ts, assetSale.ts, dueDiligence.ts, acquisition.ts, estate.ts,
// rightsFinance.ts) and the P18 season view. It names what the player holds, what is offered to and by the player,
// which studios the player may examine or acquire, which estates are open, and what a proposed title sale would do to a
// live season. It moves no money and invents no rule: every refusal is the core's own, read at the current week, so a
// stale screen can never approve different consequences (the actions revalidate against the same functions at commit).
import { absorptionRefusal } from './acquisition.js'
import { closingRefusal, instrumentSubject, offerRefusal, resaleHoldbackRefusal } from './assetSale.js'
import { diligenceRefusal } from './dueDiligence.js'
import { estateBidRefusal } from './estate.js'
import { blockingEncumbrance } from './licence.js'
import { subjectValueV1 } from './propertyValuation.js'
import { permittedBidderRefusal, postPurchaseReserve, spendableCash } from './rightsFinance.js'
import { currentHolder, resolveTitles, sameSubject, subjectsHeldBy, type DiligenceRecord, type DiligenceScopeItem, type EstateBid, type Licence, type RightSubject, type RightsOffer } from './rights.js'
import { TUNING } from './tuning.js'
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
      saleRefusal: encumbrance !== null ? `${encumbrance}Encumbrance` : holdback ? 'resaleHoldback' : null,
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
  const counterparties = h.businesses.map((b) => b.studioId).filter((id) => id !== me).sort().map((studioId): RightsDeskCounterparty => ({
    studioId, name: nameOf(studioId),
    diligence: diligenceRefusal(state, { recipientId: me, target: { kind: 'studio', studioId }, scope: DILIGENCE_FULL_SCOPE }, week),
    absorption: absorptionRefusal(state, me, studioId, week),
    disclosures: state.rights.diligence.filter((d): d is DiligenceRecord => d.recipientId === me && d.target.kind === 'studio' && d.target.studioId === studioId)
      .map((d) => ({ id: d.id, week: d.week, scope: [...d.scope], staleFromWeek: d.staleFromWeek, fresh: week < d.staleFromWeek })),
  }))
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

// ── Decision B: what a title sale would do to the player's live seasons ────────────────────────────────────────────

export type TitleSaleSeasonConsequence = {
  season: TvSeasonView
  /** The boundary the automatic cancellation is written at: the one after the week the sale closes (contract §7). */
  cancelsAtWeek: number
  /** `rights` before the final boundary; at the final boundary the season is cancelled for deadline failure. */
  cause: 'rights' | 'deadline'
}
export type TitleSaleConsequences = {
  subject: RightSubject
  /** The week the sale would close if it closed now (an accepted offer closes at acceptance). */
  closingWeek: number
  /** Live seasons the player produces on this property whose production authority is the title itself: they cancel. */
  cancels: TitleSaleSeasonConsequence[]
  /** Live seasons on this property produced under a licence P16 says survives the transfer: they continue. */
  continues: TvSeasonView[]
}

/**
 * The consequences of closing a sale of `subject` at `closingWeek` for the player's live seasons. A season produced
 * under the title's own authority loses its permission the week the title moves, and the contract (§7) cancels it at the
 * next boundary under the v1 settlement the season view already shows (`cancelPreview`): the unearned advance is
 * returned, the cancellation charge is assessed once, earned fees and completed work stay. A season produced under a
 * licence survives the encumbered transfer. No new fee, no waiver; a sale of a film title or of a property without a live
 * season has no season consequence.
 */
export function titleSaleConsequences(state: GameState, subject: RightSubject, closingWeek: number = state.market.tick): TitleSaleConsequences {
  const seasons = subject.right === 'R1' ? tvView(state).seasons.filter((s) => s.status === 'live' && s.propertyId === subject.propertyId) : []
  const root = state.television
  const cancels: TitleSaleSeasonConsequence[] = []
  const continues: TvSeasonView[] = []
  for (const season of seasons) {
    const record = root?.seasons.find((s) => s.seasonId === season.seasonId)
    if (record === undefined) throw new Error(`rights desk: season ${season.seasonId} has no record`)
    if (record.productionAuthority.via === 'licence') { continues.push(season); continue }
    const boundary = closingWeek + 1
    cancels.push({ season, cancelsAtWeek: Math.min(boundary, season.finalWeek), cause: boundary < season.finalWeek ? 'rights' : 'deadline' })
  }
  return { subject, closingWeek, cancels, continues }
}

/** A stable digest of the disclosed consequences; an action carrying it is refused when the current consequences differ. */
export function titleSaleConsequencesDigest(c: TitleSaleConsequences): string {
  return JSON.stringify({
    subject: c.subject,
    cancels: c.cancels.map((x) => ({ seasonId: x.season.seasonId, cancelsAtWeek: x.cancelsAtWeek, cause: x.cause,
      refundDue: x.season.cancelPreview?.refundDue ?? null, chargeDue: x.season.cancelPreview?.chargeDue ?? null, earned: x.season.agreement.earned })),
    continues: c.continues.map((s) => s.seasonId),
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
