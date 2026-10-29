// ── ASTRA Sprint 18 browser slice: the Rights desk and the decision B / decision C copy ──
//
// The world is the P18 season route (tests/helpers/p18-route.ts), built once at collection. The desk's disclosure is
// checked against what the engine then does (two real ticks: the rival answers the offer at the first boundary, the
// season cancels at the next), and a stale disclosure is refused by the adapter, never transacted.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { saleOfferRefusal, tick, tvView } from '../../../src/core/index.ts'
import type { GameState } from '../../../src/core/index.ts'
import { agreement, commissioned, player, season, seasonRoute, tickUntil, withCash } from '../../../tests/helpers/p18-route.ts'
import type { ActionOutcome } from '../engine/adapter.ts'
import { rightsDesk } from '../engine/rights.ts'
import { cancelTvSeasonAction, TV_CANCELLATION_LABEL } from '../engine/television.ts'
import { moneyExact } from '../format.ts'
import { SeasonCard } from '../components/P18Season.tsx'
import { Dashboard } from './Dashboard.tsx'
import { RightsDesk } from './RightsDesk.tsx'

afterEach(cleanup)

const route = seasonRoute()
const live = commissioned(route)
const C = live.market.tick
const seasonId = season(live).seasonId
const subject = { right: 'R1' as const, propertyId: route.propertyId }
const buyer = live.hollywood!.businesses.map((b) => b.studioId).filter((id) => id !== player(live)).sort()
  .find((id) => saleOfferRefusal(live, id, subject, 1_000) === null)
if (buyer === undefined) throw new Error(`premise: a rival may buy the title at week ${C}`)
const buyerName = live.hollywood!.identities.find((i) => i.studioId === buyer)!.name

/** App's `runSeasonAction` shape: the action runs on the given state and its outcome returns to the surface. */
function actOn(state: GameState) {
  const outcomes: ActionOutcome[] = []
  const act = vi.fn((run: (current: GameState) => ActionOutcome) => { const o = run(state); outcomes.push(o); return o })
  return { act, outcomes }
}

describe('Rights desk — reachable, honest about what a title sale does to the live season (decision B)', () => {
  it('the Dashboard offers the desk', () => {
    const onOpenRightsDesk = vi.fn()
    render(<Dashboard state={live} onAdvance={() => {}} onAssemble={() => {}} onSimToEvent={() => {}} onCreateTalent={() => {}} onSaves={() => {}} onOpenAutopsy={() => {}} onOpenRightsDesk={onOpenRightsDesk} />)
    fireEvent.click(screen.getByTestId('open-rights-desk'))
    expect(onOpenRightsDesk).toHaveBeenCalledTimes(1)
  })

  it('lists the held property with its live season, discloses the cancellation before the confirm, and the engine then does exactly that', () => {
    const { act, outcomes } = actOn(live)
    render(<RightsDesk state={live} onBack={() => {}} act={act} />)
    expect(screen.getByTestId('rights-standing')).toHaveTextContent(`Week ${C}.`)
    const row = screen.getByTestId(`rights-title-row-${route.propertyId}`)
    expect(row).toHaveTextContent('1 live season produced on it')
    expect(screen.queryByTestId('rights-sale-confirm'), 'no binding control before the review').toBeNull()
    fireEvent.click(screen.getByTestId(`rights-sell-${route.propertyId}`))
    fireEvent.change(screen.getByTestId('rights-sale-counterparty'), { target: { value: buyer } })
    // The core's willingness answers the price before anything is offered: a price above the rival's limit is named with
    // the limit; the property on this world is valued at ${value}, so the rival pays at most that.
    const value = rightsDesk(live).titles.find((t) => t.subject.propertyId === route.propertyId)!.value!
    fireEvent.change(screen.getByTestId('rights-sale-price'), { target: { value: String(value + 1_000) } })
    expect(screen.getByTestId('rights-sale-willingness')).toHaveTextContent(`${buyerName} would not accept this price; the most it would pay now is`)
    fireEvent.change(screen.getByTestId('rights-sale-price'), { target: { value: String(value) } })
    expect(screen.getByTestId('rights-sale-willingness')).toHaveTextContent(`${buyerName} would accept this price at the week boundary.`)
    expect(screen.queryByTestId('rights-sale-confirm')).toBeNull()
    fireEvent.click(screen.getByTestId('rights-sale-review'))
    // The disclosure: the season, the boundary after the closing week (the rival answers at C + 1, so C + 2), the cause, the money.
    const view = tvView(live).seasons.find((s) => s.seasonId === seasonId)!
    const disclosed = screen.getByTestId(`rights-sale-cancels-${seasonId}`)
    expect(disclosed).toHaveTextContent(`If the sale to ${buyerName} is answered at the coming week boundary (week ${C + 1})`)
    expect(disclosed).toHaveTextContent(`is cancelled at week ${C + 2} (${TV_CANCELLATION_LABEL.rights})`)
    expect(disclosed).toHaveTextContent(`the unearned advance ${moneyExact(view.cancelPreview!.refundDue)} is returned and the cancellation charge ${moneyExact(view.cancelPreview!.chargeDue)} is assessed once`)
    expect(disclosed).toHaveTextContent(`earned fees ${moneyExact(view.agreement.earned)} and 0 of 12 credited units stay`)
    expect(act).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('rights-sale-confirm'))
    expect(act).toHaveBeenCalledTimes(1)
    expect(outcomes[0]!.ok, 'the offer is accepted by the core').toBe(true)
    const offered = (outcomes[0] as { ok: true; next: GameState }).next
    const offer = offered.rights.offers.find((o) => o.offerorId === player(live) && o.counterpartyId === buyer)!
    expect(offer).toMatchObject({ direction: 'sell', price: value, status: 'open', instrument: { kind: 'title', subject } })
    // The desk on the next state shows the open offer with its withdraw; the sale form has closed.
    cleanup()
    render(<RightsDesk state={offered} onBack={() => {}} act={actOn(offered).act} />)
    expect(screen.getByTestId(`rights-offer-row-${offer.id}`)).toHaveTextContent(`you offered to sell the story property`)
    expect(screen.getByTestId(`rights-offer-withdraw-${offer.id}`)).toBeEnabled()
    expect(screen.queryByTestId('rights-sale-form')).toBeNull()
    // The engine: the rival answers at the boundary C + 1 (title moves), the season cancels at C + 2 under the disclosed settlement.
    const answered = tick(offered)
    expect(answered.rights.offers.find((o) => o.id === offer.id)!.status).toBe('accepted')
    expect(season(answered).status, 'still live in the produced week').toBe('live')
    const end = tick(answered)
    expect(season(end).status).toBe('cancelled')
    expect(season(end).cancellation).toEqual({ week: C + 2, cause: 'rights' })
    expect(agreement(end).settlement).toMatchObject({ week: C + 2, refundDue: view.cancelPreview!.refundDue, chargeDue: view.cancelPreview!.chargeDue })
    expect(agreement(end).earned).toBe(view.agreement.earned)
    // The title is no longer the player's; the desk lists it no more.
    cleanup()
    render(<RightsDesk state={end} onBack={() => {}} act={actOn(end).act} />)
    expect(screen.queryByTestId(`rights-title-row-${route.propertyId}`)).toBeNull()
  })

  it('a disclosure that no longer matches the state is refused by the adapter, and nothing transacts', () => {
    // The surface was read on `live`; by the time the confirm runs, the season has been cancelled by the producer.
    const changed = cancelTvSeasonAction(live, seasonId)
    if (!changed.ok) throw new Error(`premise: ${changed.error}`)
    const { act } = actOn(changed.next)
    render(<RightsDesk state={live} onBack={() => {}} act={act} />)
    fireEvent.click(screen.getByTestId(`rights-sell-${route.propertyId}`))
    fireEvent.change(screen.getByTestId('rights-sale-counterparty'), { target: { value: buyer } })
    fireEvent.change(screen.getByTestId('rights-sale-price'), { target: { value: '0' } })
    fireEvent.click(screen.getByTestId('rights-sale-review'))
    fireEvent.click(screen.getByTestId('rights-sale-confirm'))
    expect(screen.getByTestId('rights-action-refusal-line')).toHaveTextContent('the season consequences of this sale changed since they were shown')
    expect(act.mock.results[0]!.value).toMatchObject({ ok: false })
    expect(changed.next.rights.offers.filter((o) => o.offerorId === player(live))).toEqual([])
  })

  it('a disclosure request and an acquisition quote run through the core, and a refused quote is named', () => {
    const { act, outcomes } = actOn(live)
    render(<RightsDesk state={live} onBack={() => {}} act={act} />)
    const card = screen.getByTestId(`rights-counterparty-${buyer}`)
    expect(card).not.toHaveTextContent('disclosure held')
    fireEvent.click(screen.getByTestId(`rights-diligence-${buyer}`))
    expect(outcomes[0]!.ok, 'the disclosure request is accepted').toBe(true)
    const disclosed = (outcomes[0] as { ok: true; next: GameState }).next
    expect(disclosed.studio.cash).toBe(live.studio.cash - 50_000)
    cleanup()
    render(<RightsDesk state={disclosed} onBack={() => {}} act={actOn(disclosed).act} />)
    expect(screen.getByTestId(`rights-counterparty-${buyer}`)).toHaveTextContent('1 disclosure held (fresh through week')
    // A quote on a studio the core will not sell, or will: either the quote text or the core's refusal, never silence.
    const quoteButton = screen.queryByTestId(`rights-quote-${buyer}`)
    if (quoteButton !== null) {
      fireEvent.click(quoteButton)
      expect(screen.queryByTestId(`rights-quote-summary-${buyer}`) ?? screen.queryByTestId(`rights-quote-refusal-${buyer}`)).not.toBeNull()
    } else {
      expect(screen.getByTestId(`rights-absorption-refusal-${buyer}`)).toHaveTextContent('Not available:')
    }
  })
})

describe('Season card — decision C: a deadline cancellation explains the inability the record supports', () => {
  it('names the credited units at the final week and the licence that stays in force with nothing deliverable', () => {
    const starved = withCash(live, 0)
    const at = tickUntil(starved, (s) => season(s).status === 'cancelled', 22, 'the deadline cancellation')
    const s = season(at)
    expect(s.cancellation).toEqual({ week: s.finalWeek, cause: 'deadline' })
    render(<SeasonCard state={at} />)
    const text = screen.getByTestId(`season-state-${seasonId}`)
    expect(text).toHaveTextContent(`Cancelled at week ${s.finalWeek} (cancelled at the final delivery boundary): the season could not be delivered: ${s.work.creditedUnits} of 12 units were credited by the final week ${s.finalWeek}`)
    const licence = at.rights.licences.find((l) => l.id === tvView(at).seasons[0]!.distribution.licenceId)!
    expect(text).toHaveTextContent(at.market.tick < licence.endWeekExclusive
      ? `its distribution licence stays in force through week ${licence.endWeekExclusive - 1}, with nothing deliverable under it`
      : `its distribution licence ended at week ${licence.endWeekExclusive}`)
  })
})
