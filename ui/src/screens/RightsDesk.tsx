// ── ASTRA Sprint 18: the Rights desk (P16 transactions on the browser client; Owner decisions B and E) ──
// Presentation only. Every figure, permission and refusal is a core read through engine/rights.ts; every verb is a core
// action. A title sale shows its season consequences (decision B) before the binding confirmation and sends the digest
// of what was shown; cancel or back never transacts. A refusal is voiced in the player's words with the core's own
// sentence one click away (the P17 pattern), and the commit stays disabled while the core refuses.

import { useState } from 'react'
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
  saleWillingness,
  submitEstateBidAction,
  titleSaleDisclosure,
  withdrawRightsOfferAction,
  type AbsorptionQuote,
  type AbsorptionRefusal,
  type RightSubject,
  type RightsDeskOffer,
  type RightsDeskTitle,
  type TitleSaleConsequences,
} from '../engine/rights.ts'
import { TV_CANCELLATION_LABEL } from '../engine/television.ts'
import { moneyExact } from '../format.ts'

/** The refusal voiced in the player's words, with the core's own sentence behind a disclosure. */
function RightsRefusal({ state, message, testid }: { state: GameState; message: string; testid: string }) {
  const voiced = rightsRefusalVoice(state)(message)
  return (
    <div className="errbox stack" role="alert" data-testid={testid} style={{ gap: 2 }}>
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

/** Decision B: the season consequences of a title sale, in the player's words; nothing is a new fee or a waiver. */
function SaleConsequences({ consequences, buyer, closing }: { consequences: TitleSaleConsequences; buyer: string; closing: 'now' | 'boundary' }) {
  const when = closing === 'now' ? `closes now, in week ${consequences.closingWeek}` : `is answered at the coming week boundary (week ${consequences.closingWeek})`
  return (
    <div className="inset stack" data-testid="rights-sale-disclosure" style={{ gap: 4 }}>
      <strong>Before you confirm</strong>
      {consequences.cancels.length === 0 && consequences.continues.length === 0 && (
        <span data-testid="rights-sale-no-season">No live season of yours is produced on this title; the sale has no television consequence.</span>
      )}
      {consequences.cancels.map((c) => (
        <span key={c.season.seasonId} data-testid={`rights-sale-cancels-${c.season.seasonId}`}>
          If the sale to {buyer} {when}, your season <strong>{c.season.seriesTitle}</strong> loses its production right and is cancelled at week {c.cancelsAtWeek}
          {' '}({TV_CANCELLATION_LABEL[c.cause]}). {c.season.cancelPreview === null ? 'Its settlement cannot be previewed.' : (
            <>Under the agreement as it stands: the unearned advance {moneyExact(c.season.cancelPreview.refundDue)} is returned and the cancellation charge
              {' '}{moneyExact(c.season.cancelPreview.chargeDue)} is assessed once, from the cash available then; earned fees {moneyExact(c.season.agreement.earned)} and
              {' '}{c.season.creditedUnits} of {c.season.totalUnits} credited units stay. No further television use of the title.</>
          )}
        </span>
      ))}
      {consequences.continues.map((s) => (
        <span key={s.seasonId} data-testid={`rights-sale-continues-${s.seasonId}`}>
          Your season <strong>{s.seriesTitle}</strong> is produced under a licence that survives the transfer; it continues.
        </span>
      ))}
    </div>
  )
}

type Act = (run: (current: GameState) => ActionOutcome) => ActionOutcome | undefined

/** One title the player holds, with the sale form: counterparty, price, the core's willingness, review, confirm. */
function TitleRow({ state, row, counterparties, act, onRefusal }: {
  state: GameState; row: RightsDeskTitle; counterparties: { studioId: string; name: string }[]; act: Act; onRefusal: (message: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [buyer, setBuyer] = useState(counterparties[0]?.studioId ?? '')
  const [price, setPrice] = useState(String(row.value ?? 0))
  const [reviewing, setReviewing] = useState(false)
  const id = subjectId(row.subject)
  const amount = Number(price)
  const willingness = buyer === '' ? null : saleWillingness(state, buyer, row.subject, amount)
  const disclosure = titleSaleDisclosure(state, row.subject, 'boundary')
  const buyerName = counterparties.find((c) => c.studioId === buyer)?.name ?? buyer
  const close = () => { setOpen(false); setReviewing(false) }
  return (
    <div className="inset stack" data-testid={`rights-title-row-${id}`} style={{ gap: 4 }}>
      <span>
        <strong>{untitled(row.title)}</strong> · {rightLabel(row.subject)} · {row.value === null ? 'no valuation yet' : `valued ${moneyExact(row.value)}`}
        {row.liveSeasonIds.length > 0 ? ` · ${row.liveSeasonIds.length} live season${row.liveSeasonIds.length === 1 ? '' : 's'} produced on it` : ''}
        {row.licencesOut.length > 0 ? ` · ${row.licencesOut.length} licence${row.licencesOut.length === 1 ? '' : 's'} granted` : ''}
      </span>
      {row.saleRefusal !== null && <RightsRefusal state={state} message={row.saleRefusal} testid={`rights-title-refusal-${id}`} />}
      {row.saleRefusal === null && !open && (
        <button type="button" className="ghost" onClick={() => setOpen(true)} disabled={counterparties.length === 0} data-testid={`rights-sell-${id}`}>
          Offer for sale
        </button>
      )}
      {open && (
        <div className="stack" data-testid="rights-sale-form" style={{ gap: 4 }}>
          <label className="stack" style={{ gap: 2 }}>
            Buyer
            <select value={buyer} onChange={(e) => { setBuyer(e.target.value); setReviewing(false) }} disabled={reviewing} data-testid="rights-sale-counterparty">
              {counterparties.map((c) => <option key={c.studioId} value={c.studioId}>{c.name}</option>)}
            </select>
          </label>
          <label className="stack" style={{ gap: 2 }}>
            Price
            <input type="number" min={0} step={1} value={price} onChange={(e) => { setPrice(e.target.value); setReviewing(false) }} disabled={reviewing} data-testid="rights-sale-price" />
          </label>
          {willingness !== null && (
            <span className="hint" data-testid="rights-sale-willingness">
              {willingness.willing ? `${buyerName} would accept this price at the week boundary.`
                : willingness.limit !== null ? `${buyerName} would not accept this price; the most it would pay now is ${moneyExact(willingness.limit)}.`
                  : `${buyerName} would not accept this offer (${willingness.reason}).`}
              {willingness.value !== null ? ` The title is valued at ${moneyExact(willingness.value)}.` : ''}
            </span>
          )}
          {reviewing && <SaleConsequences consequences={disclosure.consequences} buyer={buyerName} closing="boundary" />}
          <span className="btn-row">
            {!reviewing ? (
              <button type="button" className="ghost" disabled={buyer === '' || !Number.isSafeInteger(amount) || amount < 0} onClick={() => setReviewing(true)} data-testid="rights-sale-review">
                Review the sale
              </button>
            ) : (
              <button
                type="button"
                className="accent"
                onClick={() => {
                  const outcome = act((current) => makeRightsOfferAction(current, { counterpartyId: buyer, direction: 'sell', instrument: { kind: 'title', subject: row.subject }, price: amount }, disclosure.digest))
                  if (outcome === undefined) return
                  onRefusal(outcome.ok ? null : outcome.error)
                  if (outcome.ok) close()
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

function OfferRow({ state, row, act, onRefusal, nameOf }: { state: GameState; row: RightsDeskOffer; act: Act; onRefusal: (m: string | null) => void; nameOf: (id: string) => string }) {
  const [reviewing, setReviewing] = useState(false)
  const o = row.offer
  const other = nameOf(row.role === 'offeror' ? o.counterpartyId : o.offerorId)
  const verb = (o.direction === 'buy') === (row.role === 'offeror') ? 'buy' : 'sell'
  const mine = row.role === 'counterparty' && o.direction === 'buy' && o.instrument.kind === 'title'
  const disclosure = mine ? titleSaleDisclosure(state, o.instrument.subject, 'now') : null
  const handle = (outcome: ActionOutcome | undefined) => { if (outcome !== undefined) onRefusal(outcome.ok ? null : outcome.error); setReviewing(false) }
  return (
    <div className="inset stack" data-testid={`rights-offer-row-${o.id}`} style={{ gap: 4 }}>
      <span>
        Week {o.week}: {row.role === 'offeror' ? `you offered to ${verb}` : `${other} offers to ${verb === 'buy' ? 'sell you' : 'buy'}`} the {o.instrument.kind === 'title' ? rightLabel(o.instrument.subject) : `${o.instrument.right} licence on`}
        {' '}<strong>{untitled(row.subjectTitle)}</strong>{row.role === 'offeror' ? ` to ${other}` : ''} for {moneyExact(o.price)} · {o.status}{o.status === 'open' ? `, open until week ${o.expiresWeek}` : ''}
        {o.refusal !== null ? ` (${o.refusal})` : ''}
      </span>
      {row.closing !== null && <RightsRefusal state={state} message={row.closing} testid={`rights-offer-closing-${o.id}`} />}
      {o.status === 'open' && row.role === 'offeror' && (
        <button type="button" className="ghost" onClick={() => handle(act((c) => withdrawRightsOfferAction(c, o.id)))} data-testid={`rights-offer-withdraw-${o.id}`}>Withdraw</button>
      )}
      {o.status === 'open' && row.role === 'counterparty' && (
        <div className="stack" style={{ gap: 4 }}>
          {reviewing && disclosure !== null && <SaleConsequences consequences={disclosure.consequences} buyer={other} closing="now" />}
          <span className="btn-row">
            {mine && !reviewing ? (
              <button type="button" className="ghost" disabled={row.closing !== null} onClick={() => setReviewing(true)} data-testid={`rights-offer-review-${o.id}`}>Review the sale</button>
            ) : (
              <button type="button" className="accent" disabled={row.closing !== null} onClick={() => handle(act((c) => acceptRightsOfferAction(c, o.id, disclosure?.digest ?? null)))} data-testid={`rights-offer-accept-${o.id}`}>
                {mine ? 'Confirm the sale' : 'Accept'}
              </button>
            )}
            <button type="button" className="ghost" onClick={() => handle(act((c) => rejectRightsOfferAction(c, o.id)))} data-testid={`rights-offer-reject-${o.id}`}>Reject</button>
            {reviewing && <button type="button" className="ghost" onClick={() => setReviewing(false)} data-testid={`rights-offer-back-${o.id}`}>Back</button>}
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

function CounterpartyRow({ state, row, act, onRefusal }: {
  state: GameState; row: ReturnType<typeof rightsDesk>['counterparties'][number]; act: Act; onRefusal: (m: string | null) => void
}) {
  const [consideration, setConsideration] = useState('0')
  const [quote, setQuote] = useState<AbsorptionQuote | AbsorptionRefusal | null>(null)
  const fresh = row.disclosures.find((d) => d.fresh && d.scope.length === 3)
  const amount = Number(consideration)
  return (
    <div className="inset stack" data-testid={`rights-counterparty-${row.studioId}`} style={{ gap: 4 }}>
      <span><strong>{row.name}</strong>{row.disclosures.length > 0 ? ` · ${row.disclosures.length} disclosure${row.disclosures.length === 1 ? '' : 's'} held${fresh ? ` (fresh through week ${fresh.staleFromWeek - 1})` : ' (stale)'}` : ''}</span>
      <span className="btn-row">
        <button type="button" className="ghost" disabled={row.diligence !== null}
          onClick={() => { const r = act((c) => requestDueDiligenceAction(c, { kind: 'studio', studioId: row.studioId }, ['rights', 'employment', 'liabilities'])); if (r !== undefined) onRefusal(r.ok ? null : r.error) }}
          data-testid={`rights-diligence-${row.studioId}`}>
          Request a full disclosure
        </button>
      </span>
      {row.diligence !== null && <RightsRefusal state={state} message={row.diligence} testid={`rights-diligence-refusal-${row.studioId}`} />}
      {row.absorption !== null ? <RightsRefusal state={state} message={row.absorption} testid={`rights-absorption-refusal-${row.studioId}`} /> : (
        <div className="stack" style={{ gap: 4 }}>
          <label className="stack" style={{ gap: 2 }}>
            Consideration for acquiring the studio
            <input type="number" min={0} step={1} value={consideration} onChange={(e) => { setConsideration(e.target.value); setQuote(null) }} data-testid={`rights-quote-consideration-${row.studioId}`} />
          </label>
          <span className="btn-row">
            <button type="button" className="ghost" disabled={!Number.isSafeInteger(amount) || amount < 0}
              onClick={() => setQuote(absorptionQuote(state, row.studioId, amount, { kind: 'default' }, fresh?.id ?? null))} data-testid={`rights-quote-${row.studioId}`}>
              Quote the acquisition
            </button>
            {quote !== null && quote.kind === 'quote' && (
              <button type="button" className="accent"
                onClick={() => { const r = act((c) => absorbStudioAction(c, quote, { kind: 'default' })); if (r !== undefined) { onRefusal(r.ok ? null : r.error); setQuote(null) } }}
                data-testid={`rights-absorb-${row.studioId}`}>
                Close the acquisition as quoted
              </button>
            )}
          </span>
          {quote !== null && quote.kind === 'quote' && <span className="hint" data-testid={`rights-quote-summary-${row.studioId}`}>{quoteText(quote)}</span>}
          {quote !== null && quote.kind === 'refusal' && <RightsRefusal state={state} message={quote.refusal} testid={`rights-quote-refusal-${row.studioId}`} />}
        </div>
      )}
    </div>
  )
}

function LotRow({ state, estateId, lot, act, onRefusal }: {
  state: GameState; estateId: string; lot: ReturnType<typeof rightsDesk>['estates'][number]['lots'][number]; act: Act; onRefusal: (m: string | null) => void
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
      {lot.status === 'open' && lot.myBid === null && (lot.bidRefusal !== null ? <RightsRefusal state={state} message={lot.bidRefusal} testid={`rights-bid-refusal-${lot.lotId}`} /> : (
        <span className="btn-row">
          <input type="number" min={lot.minimumBid} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} data-testid={`rights-bid-amount-${lot.lotId}`} />
          <button type="button" className="accent" disabled={!Number.isSafeInteger(bid) || bid < lot.minimumBid}
            onClick={() => { const r = act((c) => submitEstateBidAction(c, estateId, lot.lotId, bid)); if (r !== undefined) onRefusal(r.ok ? null : r.error) }}
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
  const desk = rightsDesk(state)
  const nameOf = (id: string): string => desk.counterparties.find((c) => c.studioId === id)?.name ?? id
  const openCounterparties = desk.counterparties.map((c) => ({ studioId: c.studioId, name: c.name }))
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
      {desk.permitted !== null && <RightsRefusal state={state} message={desk.permitted} testid="rights-permitted-refusal" />}
      {refusal !== null && <RightsRefusal state={state} message={refusal} testid="rights-action-refusal" />}

      <div className="card stack">
        <h2 style={{ margin: 0 }}>Titles you hold</h2>
        {desk.titles.length === 0 && <span className="hint" data-testid="rights-no-titles">Your studio holds no story property or film title.</span>}
        {desk.titles.map((row) => <TitleRow key={subjectKey(row.subject)} state={state} row={row} counterparties={openCounterparties} act={act} onRefusal={setRefusal} />)}
      </div>

      <div className="card stack">
        <h2 style={{ margin: 0 }}>Offers</h2>
        {desk.offers.length === 0 && <span className="hint" data-testid="rights-no-offers">No offers to or from your studio.</span>}
        {desk.offers.map((row) => <OfferRow key={row.offer.id} state={state} row={row} act={act} onRefusal={setRefusal} nameOf={nameOf} />)}
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
        {desk.counterparties.map((row) => <CounterpartyRow key={row.studioId} state={state} row={row} act={act} onRefusal={setRefusal} />)}
      </div>

      <div className="card stack">
        <h2 style={{ margin: 0 }}>Estates</h2>
        {desk.estates.length === 0 && <span className="hint" data-testid="rights-no-estates">No estate is open for bids.</span>}
        {desk.estates.map((e) => (
          <div key={e.estateId} className="stack" data-testid={`rights-estate-${e.estateId}`} style={{ gap: 4 }}>
            <span><strong>{e.name}</strong>: closed at week {e.closureWeek}; bids open weeks {e.opensWeek} to {e.closesWeek - 1}</span>
            {e.lots.map((lot) => <LotRow key={lot.lotId} state={state} estateId={e.estateId} lot={lot} act={act} onRefusal={setRefusal} />)}
          </div>
        ))}
      </div>
    </div>
  )
}
