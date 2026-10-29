// ── ASTRA Sprint 18: the Rights desk (P16 transactions on the browser client; Owner decisions B and E) ──
// Presentation only. Every figure, permission and refusal is a core read through engine/rights.ts; every verb is a core
// action. A title sale shows its outcome (decision B: the engine run forward on a private copy) before the binding
// confirmation and sends the digest of what was shown; cancel or back never transacts. A refusal is voiced in the
// player's words with the core's own sentence one click away (the P17 pattern); the review and the confirm stay
// disabled while the core's submission law refuses.

import { useMemo, useState } from 'react'
import type { ActionOutcome, GameState } from '../engine/adapter.ts'
import {
  absorbStudioAction,
  absorptionQuote,
  acceptRightsOfferAction,
  makeRightsOfferAction,
  rejectRightsOfferAction,
  requestDueDiligenceAction,
  rightsDesk,
  rightsRefusalVoice,
  saleOfferRefusal,
  saleWillingness,
  submitEstateBidAction,
  titleSaleDisclosure,
  withdrawRightsOfferAction,
  type AbsorptionQuote,
  type AbsorptionRefusal,
  type RightSubject,
  type RightsDeskOffer,
  type RightsDeskTitle,
  type TitleSaleOutcome,
  type TitleSalePlan,
} from '../engine/rights.ts'
import { TV_CANCELLATION_LABEL } from '../engine/television.ts'
import { moneyExact } from '../format.ts'

type Voice = (raw: string) => string
type Act = (run: (current: GameState) => ActionOutcome) => ActionOutcome | undefined
/** App declines to run an action when the studio moved under the screen; that is a named refusal here, never silence. */
const MOVED_ON = 'rights: the studio moved on since this screen was read; review again'

/** The refusal voiced in the player's words, with the core's own sentence behind a disclosure. Only the desk's action refusal is an alert. */
function RightsRefusal({ voice, message, testid, alert = false }: { voice: Voice; message: string; testid: string; alert?: boolean }) {
  const voiced = voice(message)
  return (
    <div className="errbox stack" {...(alert ? { role: 'alert' } : {})} data-testid={testid} style={{ gap: 2 }}>
      <span data-testid={`${testid}-line`}>Not available: {voiced}</span>
      {voiced !== message && (
        <details data-testid={`${testid}-raw`}>
          <summary>Show the studio&rsquo;s note</summary>
          <span className="mono">{message}</span>
        </details>
      )}
    </div>
  )
}

const untitled = (t: string | null) => t ?? '— (no recorded title)'
const subjectId = (s: RightSubject): string => (s.right === 'R1' ? s.propertyId : s.filmId)
const subjectKey = (s: RightSubject): string => `${s.right}:${subjectId(s)}`
const rightLabel = (s: RightSubject): string => (s.right === 'R1' ? 'story property' : 'film title')

/** Decision B: the engine's own outcome of the plan, in the player's words; nothing is a new fee or a waiver. */
function SaleOutcome({ outcome, buyer, voice }: { outcome: TitleSaleOutcome; buyer: string; voice: Voice }) {
  if (outcome.kind === 'refused') return <RightsRefusal voice={voice} message={outcome.refusal} testid="rights-sale-outcome-refusal" />
  const a = outcome.answer
  return (
    <div className="inset stack" data-testid="rights-sale-disclosure" style={{ gap: 4 }}>
      <strong>Before you confirm: what happens if you advance the week without other changes</strong>
      <span data-testid="rights-sale-answer">
        {a.kind === 'closed' && a.week === outcome.week && `The sale to ${buyer} closes now, in week ${a.week}, for ${moneyExact(a.price)}.`}
        {a.kind === 'closed' && a.week !== outcome.week && `${buyer} accepts at the week boundary (week ${a.week}) and the title moves for ${moneyExact(a.price)}.`}
        {a.kind === 'rejected' && `${buyer} declines at the week boundary (week ${a.week}): ${voice(a.reason)}. Nothing changes hands.`}
        {a.kind === 'open' && `The offer is not answered by week ${outcome.reachesWeek}; it stays open until week ${a.expiresWeek}.`}
      </span>
      {outcome.seasons.length === 0 && (
        <span data-testid="rights-sale-no-season">No live season of yours is produced on this title; the sale has no television consequence.</span>
      )}
      {outcome.seasons.map((s) => {
        const worked = s.after.creditedUnits - s.before.creditedUnits
        const work = worked > 0 ? ` It works first: ${s.after.creditedUnits} of ${s.before.totalUnits} units credited${s.after.earned > s.before.earned ? `, earning ${moneyExact(s.after.earned - s.before.earned)}` : ''}.` : ''
        const st = s.after.settlement
        return (
          <span key={s.seasonId} data-testid={`rights-sale-season-${s.seasonId}`}>
            Your season <strong>{s.seriesTitle}</strong>:{work}{' '}
            {s.after.status === 'cancelled' && s.after.cancellation !== null && (
              <>It is cancelled at week {s.after.cancellation.week} ({TV_CANCELLATION_LABEL[s.after.cancellation.cause]}).
                {st === null ? ' Its settlement is not on record.' : (
                  <> The unearned advance {moneyExact(st.refundDue)} is returned ({moneyExact(st.refundPaid)} paid from cash then) and the cancellation charge {moneyExact(st.chargeDue)} is assessed once
                    ({moneyExact(st.chargePaid)} paid then){s.after.outstanding > 0 ? `; ${moneyExact(s.after.outstanding)} is left owed` : ''}. Earned fees {moneyExact(s.after.earned)} and the credited work stay. Your studio makes no further television use of the title.</>
                )}
              </>
            )}
            {s.after.status === 'delivered' && `It is delivered at week ${s.after.deliveredWeek}; the sale does not cancel it.`}
            {s.after.status === 'live' && `It is still live at week ${outcome.reachesWeek}; the sale has not reached it yet.`}
          </span>
        )
      })}
    </div>
  )
}

type BuyerOption = { studioId: string; name: string }

/** One title the player holds, with the sale form: buyer, price, the submission law, the core's willingness, review, confirm. */
function TitleRow({ state, row, buyers, act, onRefusal, voice }: {
  state: GameState; row: RightsDeskTitle; buyers: BuyerOption[]; act: Act; onRefusal: (message: string | null) => void; voice: Voice
}) {
  const [open, setOpen] = useState(false)
  const [buyer, setBuyer] = useState('')
  const [price, setPrice] = useState(String(row.value ?? 0))
  const [review, setReview] = useState<{ outcome: TitleSaleOutcome; digest: string } | null>(null)
  const id = subjectId(row.subject)
  const amount = Number(price)
  const validAmount = Number.isSafeInteger(amount) && amount >= 0
  // Permitted buyers first (the submission law at the current price), each named with its standing.
  const ranked = useMemo(() => (open
    ? buyers.map((b) => ({ ...b, refusal: validAmount ? saleOfferRefusal(state, b.studioId, row.subject, amount) : null })).sort((x, y) => Number(x.refusal !== null) - Number(y.refusal !== null))
    : []), [open, buyers, state, row.subject, amount, validAmount])
  const chosen = buyer === '' ? ranked[0] : ranked.find((b) => b.studioId === buyer)
  const submission = chosen === undefined ? 'unknownStudio' : chosen.refusal
  const willingness = open && chosen !== undefined && validAmount && submission === null ? saleWillingness(state, chosen.studioId, row.subject, amount) : null
  const plan: TitleSalePlan | null = chosen === undefined ? null : { kind: 'offer', offer: { counterpartyId: chosen.studioId, direction: 'sell', instrument: { kind: 'title', subject: row.subject }, price: amount } }
  const close = () => { setOpen(false); setReview(null) }
  return (
    <div className="inset stack" data-testid={`rights-title-row-${id}`} style={{ gap: 4 }}>
      <span>
        <strong>{untitled(row.title)}</strong> · {rightLabel(row.subject)} · {row.value === null ? 'no valuation yet' : `valued ${moneyExact(row.value)}`}
        {row.liveSeasonIds.length > 0 ? ` · ${row.liveSeasonIds.length} live season${row.liveSeasonIds.length === 1 ? '' : 's'} produced on it` : ''}
        {row.licencesOut.length > 0 ? ` · ${row.licencesOut.length} licence${row.licencesOut.length === 1 ? '' : 's'} granted` : ''}
      </span>
      {row.saleRefusal !== null && <RightsRefusal voice={voice} message={row.saleRefusal} testid={`rights-title-refusal-${id}`} />}
      {row.saleRefusal === null && !open && (
        <button type="button" className="ghost" onClick={() => setOpen(true)} disabled={buyers.length === 0} data-testid={`rights-sell-${id}`}>
          Offer for sale
        </button>
      )}
      {open && (
        <div className="stack" data-testid="rights-sale-form" style={{ gap: 4 }}>
          <label className="stack" style={{ gap: 2 }}>
            Buyer
            <select value={chosen?.studioId ?? ''} onChange={(e) => { setBuyer(e.target.value); setReview(null) }} disabled={review !== null} data-testid="rights-sale-counterparty">
              {ranked.map((b) => <option key={b.studioId} value={b.studioId}>{b.name}{b.refusal === null ? '' : ' (not available)'}</option>)}
            </select>
          </label>
          <label className="stack" style={{ gap: 2 }}>
            Price
            <input type="number" min={0} step={1} value={price} onChange={(e) => { setPrice(e.target.value); setReview(null) }} disabled={review !== null} data-testid="rights-sale-price" />
          </label>
          {submission !== null && <RightsRefusal voice={voice} message={submission} testid="rights-sale-submission-refusal" />}
          {willingness !== null && chosen !== undefined && (
            <span className="hint" data-testid="rights-sale-willingness">
              {willingness.willing ? `At today's valuation ${chosen.name} would accept this price; it answers at the week boundary.`
                : willingness.limit !== null ? `At today's valuation ${chosen.name} would not accept this price; the most it would pay now is ${moneyExact(willingness.limit)}.`
                  : `${chosen.name} would not accept this offer: ${voice(willingness.reason)}.`}
              {willingness.value !== null ? ` The title is valued at ${moneyExact(willingness.value)}.` : ''}
            </span>
          )}
          {review !== null && chosen !== undefined && <SaleOutcome outcome={review.outcome} buyer={chosen.name} voice={voice} />}
          <span className="btn-row">
            {review === null ? (
              <button type="button" className="ghost" disabled={plan === null || submission !== null || !validAmount} onClick={() => plan !== null && setReview(titleSaleDisclosure(state, plan))} data-testid="rights-sale-review">
                Review the sale
              </button>
            ) : (
              <button
                type="button"
                className="accent"
                disabled={review.outcome.kind === 'refused' || plan === null}
                onClick={() => {
                  if (plan === null) return
                  const outcome = act((current) => makeRightsOfferAction(current, plan.offer, review.digest))
                  onRefusal(outcome === undefined ? MOVED_ON : outcome.ok ? null : outcome.error)
                  if (outcome?.ok) close()
                }}
                data-testid="rights-sale-confirm"
              >
                Confirm the offer
              </button>
            )}
            <button type="button" className="ghost" onClick={close} data-testid="rights-sale-cancel">Back</button>
          </span>
        </div>
      )}
    </div>
  )
}

function OfferRow({ state, row, act, onRefusal, nameOf, voice }: { state: GameState; row: RightsDeskOffer; act: Act; onRefusal: (m: string | null) => void; nameOf: (id: string) => string; voice: Voice }) {
  const [review, setReview] = useState<{ outcome: TitleSaleOutcome; digest: string } | null>(null)
  const o = row.offer
  const other = nameOf(row.role === 'offeror' ? o.counterpartyId : o.offerorId)
  const verb = (o.direction === 'buy') === (row.role === 'offeror') ? 'buy' : 'sell'
  const mine = row.role === 'counterparty' && o.direction === 'buy' && o.instrument.kind === 'title'
  const handle = (outcome: ActionOutcome | undefined) => { onRefusal(outcome === undefined ? MOVED_ON : outcome.ok ? null : outcome.error); setReview(null) }
  return (
    <div className="inset stack" data-testid={`rights-offer-row-${o.id}`} style={{ gap: 4 }}>
      <span>
        Week {o.week}: {row.role === 'offeror' ? `you offered to ${verb}` : `${other} offers to ${verb === 'buy' ? 'sell you' : 'buy'}`} the {o.instrument.kind === 'title' ? rightLabel(o.instrument.subject) : `${o.instrument.right} licence on`}
        {' '}<strong>{untitled(row.subjectTitle)}</strong>{row.role === 'offeror' ? ` to ${other}` : ''} for {moneyExact(o.price)} · {o.status}{o.status === 'open' ? `, open until week ${o.expiresWeek}` : ''}
        {o.refusal !== null ? ` (${voice(o.refusal)})` : ''}
      </span>
      {row.closing !== null && <RightsRefusal voice={voice} message={row.closing} testid={`rights-offer-closing-${o.id}`} />}
      {o.status === 'open' && row.role === 'offeror' && (
        <button type="button" className="ghost" onClick={() => handle(act((c) => withdrawRightsOfferAction(c, o.id)))} data-testid={`rights-offer-withdraw-${o.id}`}>Withdraw</button>
      )}
      {o.status === 'open' && row.role === 'counterparty' && (
        <div className="stack" style={{ gap: 4 }}>
          {review !== null && <SaleOutcome outcome={review.outcome} buyer={other} voice={voice} />}
          <span className="btn-row">
            {mine && review === null ? (
              <button type="button" className="ghost" disabled={row.closing !== null} onClick={() => setReview(titleSaleDisclosure(state, { kind: 'accept', offerId: o.id }))} data-testid={`rights-offer-review-${o.id}`}>Review the sale</button>
            ) : (
              <button type="button" className="accent" disabled={row.closing !== null || (review !== null && review.outcome.kind === 'refused')} onClick={() => handle(act((c) => acceptRightsOfferAction(c, o.id, review?.digest ?? null)))} data-testid={`rights-offer-accept-${o.id}`}>
                {mine ? 'Confirm the sale' : 'Accept'}
              </button>
            )}
            <button type="button" className="ghost" onClick={() => handle(act((c) => rejectRightsOfferAction(c, o.id)))} data-testid={`rights-offer-reject-${o.id}`}>Reject</button>
            {review !== null && <button type="button" className="ghost" onClick={() => setReview(null)} data-testid={`rights-offer-back-${o.id}`}>Back</button>}
          </span>
        </div>
      )}
    </div>
  )
}

function quoteText(q: AbsorptionQuote): string {
  const retained = q.contracts.filter((c) => c.retained).length
  const cancelled = q.productions.filter((p) => p.disposition === 'cancelRequired').length
  return `Consideration ${moneyExact(q.consideration)} against the target's ask ${moneyExact(q.ask)}; total outlay ${moneyExact(q.outlay)} (exit charges ${moneyExact(q.exitCharges)}, guarantees disclosed ${moneyExact(q.guarantees)}); `
    + `${q.rights.length} right${q.rights.length === 1 ? '' : 's'}${q.rightsValue === null ? '' : ` valued ${moneyExact(q.rightsValue)}`}; ${retained} of ${q.contracts.length} contracts retained; `
    + `${q.productions.length} production${q.productions.length === 1 ? '' : 's'}${cancelled > 0 ? `, ${cancelled} would be cancelled` : ''}; reserve after ${moneyExact(q.reserveAfter)}; `
    + (q.affordable ? 'affordable now.' : 'NOT affordable now.') + ` Quoted at week ${q.quotedAtWeek}.`
}

function CounterpartyRow({ state, row, act, onRefusal, voice }: {
  state: GameState; row: ReturnType<typeof rightsDesk>['counterparties'][number]; act: Act; onRefusal: (m: string | null) => void; voice: Voice
}) {
  const [consideration, setConsideration] = useState('0')
  const [quote, setQuote] = useState<AbsorptionQuote | AbsorptionRefusal | null>(null)
  // The latest disclosure held; the core judges its freshness and scope when a quote is asked.
  const latest = row.disclosures.length === 0 ? undefined : row.disclosures[row.disclosures.length - 1]
  const amount = Number(consideration)
  const handle = (outcome: ActionOutcome | undefined) => onRefusal(outcome === undefined ? MOVED_ON : outcome.ok ? null : outcome.error)
  return (
    <div className="inset stack" data-testid={`rights-counterparty-${row.studioId}`} style={{ gap: 4 }}>
      <span><strong>{row.name}</strong>{latest !== undefined ? ` · ${row.disclosures.length} disclosure${row.disclosures.length === 1 ? '' : 's'} held (latest ${latest.fresh ? `fresh through week ${latest.staleFromWeek - 1}` : 'stale'})` : ''}</span>
      <span className="btn-row">
        <button type="button" className="ghost" disabled={row.diligence !== null}
          onClick={() => handle(act((c) => requestDueDiligenceAction(c, { kind: 'studio', studioId: row.studioId }, ['rights', 'employment', 'liabilities'])))}
          data-testid={`rights-diligence-${row.studioId}`}>
          Request a full disclosure
        </button>
      </span>
      {row.diligence !== null && <RightsRefusal voice={voice} message={row.diligence} testid={`rights-diligence-refusal-${row.studioId}`} />}
      {row.absorption !== null ? <RightsRefusal voice={voice} message={row.absorption} testid={`rights-absorption-refusal-${row.studioId}`} /> : (
        <div className="stack" style={{ gap: 4 }}>
          <label className="stack" style={{ gap: 2 }}>
            Consideration for acquiring the studio
            <input type="number" min={0} step={1} value={consideration} onChange={(e) => { setConsideration(e.target.value); setQuote(null) }} data-testid={`rights-quote-consideration-${row.studioId}`} />
          </label>
          <span className="btn-row">
            <button type="button" className="ghost" disabled={!Number.isSafeInteger(amount) || amount < 0}
              onClick={() => setQuote(absorptionQuote(state, row.studioId, amount, { kind: 'default' }, latest?.id ?? null))} data-testid={`rights-quote-${row.studioId}`}>
              Quote the acquisition
            </button>
            {quote !== null && quote.kind === 'quote' && (
              <button type="button" className="accent" disabled={!quote.affordable}
                onClick={() => { handle(act((c) => absorbStudioAction(c, quote, { kind: 'default' }))); setQuote(null) }}
                data-testid={`rights-absorb-${row.studioId}`}>
                Close the acquisition as quoted
              </button>
            )}
          </span>
          {quote !== null && quote.kind === 'quote' && <span className="hint" data-testid={`rights-quote-summary-${row.studioId}`}>{quoteText(quote)}</span>}
          {quote !== null && quote.kind === 'refusal' && <RightsRefusal voice={voice} message={quote.refusal} testid={`rights-quote-refusal-${row.studioId}`} />}
        </div>
      )}
    </div>
  )
}

function LotRow({ estateId, lot, act, onRefusal, voice }: {
  estateId: string; lot: ReturnType<typeof rightsDesk>['estates'][number]['lots'][number]; act: Act; onRefusal: (m: string | null) => void; voice: Voice
}) {
  const [amount, setAmount] = useState(String(lot.minimumBid))
  const bid = Number(amount)
  return (
    <div className="inset stack" data-testid={`rights-lot-${lot.lotId}`} style={{ gap: 4 }}>
      <span>
        Lot {lot.lotId}: {lot.titles.map(untitled).join(', ')} · minimum bid {moneyExact(lot.minimumBid)} · {lot.status}
        {lot.encumbrances.length > 0 ? ` · sold subject to ${lot.encumbrances.length} licence${lot.encumbrances.length === 1 ? '' : 's'}` : ''}
        {lot.myBid !== null ? ` · your sealed bid ${moneyExact(lot.myBid.amount)} (week ${lot.myBid.week})` : ''}
      </span>
      {lot.status === 'open' && lot.myBid === null && (lot.bidRefusal !== null ? <RightsRefusal voice={voice} message={lot.bidRefusal} testid={`rights-bid-refusal-${lot.lotId}`} /> : (
        <span className="btn-row">
          <input type="number" min={lot.minimumBid} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} data-testid={`rights-bid-amount-${lot.lotId}`} />
          <button type="button" className="accent" disabled={!Number.isSafeInteger(bid) || bid < lot.minimumBid}
            onClick={() => { const r = act((c) => submitEstateBidAction(c, estateId, lot.lotId, bid)); onRefusal(r === undefined ? MOVED_ON : r.ok ? null : r.error) }}
            data-testid={`rights-bid-${lot.lotId}`}>
            Submit a sealed bid
          </button>
        </span>
      ))}
    </div>
  )
}

/** The Rights desk screen: what you hold, what is offered, whom you may examine or acquire, which estates are open. */
export function RightsDesk({ state, onBack, act }: { state: GameState; onBack: () => void; act: Act }) {
  const [refusal, setRefusal] = useState<string | null>(null)
  const desk = useMemo(() => rightsDesk(state), [state])
  const voice = useMemo(() => rightsRefusalVoice(state), [state])
  const nameOf = (id: string): string => desk.counterparties.find((c) => c.studioId === id)?.name ?? state.hollywood?.identities.find((i) => i.studioId === id)?.name ?? id
  const buyers: BuyerOption[] = desk.counterparties.map((c) => ({ studioId: c.studioId, name: c.name }))
  return (
    <div className="screen stack" data-testid="rights-desk">
      <div className="btn-row">
        <button type="button" className="ghost" onClick={onBack} data-testid="rights-back">Back</button>
        <h1 style={{ margin: 0 }}>Rights desk</h1>
      </div>
      <p className="hint" data-testid="rights-standing">
        Week {desk.week}. Spendable {moneyExact(desk.spendable)} above the reserve of {moneyExact(desk.reserve)}; a full disclosure costs {moneyExact(desk.diligenceFee)}.
        {desk.permitted === null ? ' Your studio may buy, bid and examine.' : ''}
      </p>
      {desk.permitted !== null && <RightsRefusal voice={voice} message={desk.permitted} testid="rights-permitted-refusal" />}
      {refusal !== null && <RightsRefusal voice={voice} message={refusal} testid="rights-action-refusal" alert />}

      <div className="card stack">
        <h2 style={{ margin: 0 }}>Titles you hold</h2>
        {desk.titles.length === 0 && <span className="hint" data-testid="rights-no-titles">Your studio holds no story property or film title.</span>}
        {desk.titles.map((row) => <TitleRow key={subjectKey(row.subject)} state={state} row={row} buyers={buyers} act={act} onRefusal={setRefusal} voice={voice} />)}
      </div>

      <div className="card stack">
        <h2 style={{ margin: 0 }}>Offers</h2>
        {desk.offers.length === 0 && <span className="hint" data-testid="rights-no-offers">No offers to or from your studio.</span>}
        {desk.offers.map((row) => <OfferRow key={row.offer.id} state={state} row={row} act={act} onRefusal={setRefusal} nameOf={nameOf} voice={voice} />)}
      </div>

      {desk.licencesIn.length > 0 && (
        <div className="card stack">
          <h2 style={{ margin: 0 }}>Licences you hold</h2>
          {desk.licencesIn.map((l) => (
            <span key={l.id} className="inset" data-testid={`rights-licence-in-${l.id}`}>
              {l.right} {l.scope.use}{l.exclusive ? ', exclusive' : ''} on the {rightLabel(l.subject)} from {nameOf(l.grantorId)}, weeks {l.startWeek} to {l.endWeekExclusive - 1}
            </span>
          ))}
        </div>
      )}

      <div className="card stack">
        <h2 style={{ margin: 0 }}>Other studios</h2>
        {desk.counterparties.length === 0 && <span className="hint" data-testid="rights-no-counterparties">No other studio is operating.</span>}
        {desk.counterparties.map((row) => <CounterpartyRow key={row.studioId} state={state} row={row} act={act} onRefusal={setRefusal} voice={voice} />)}
      </div>

      <div className="card stack">
        <h2 style={{ margin: 0 }}>Estates</h2>
        {desk.estates.length === 0 && <span className="hint" data-testid="rights-no-estates">No estate is open for bids.</span>}
        {desk.estates.map((e) => (
          <div key={e.estateId} className="stack" data-testid={`rights-estate-${e.estateId}`} style={{ gap: 4 }}>
            <span><strong>{e.name}</strong>: closed at week {e.closureWeek}; bids open weeks {e.opensWeek} to {e.closesWeek - 1}</span>
            {e.lots.map((lot) => <LotRow key={lot.lotId} estateId={e.estateId} lot={lot} act={act} onRefusal={setRefusal} voice={voice} />)}
          </div>
        ))}
      </div>
    </div>
  )
}
