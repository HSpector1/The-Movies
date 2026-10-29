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
import { rightsDesk, rightsRefusalVoice } from '../engine/rights.ts'
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

  it('lists the held property with its live season, discloses the engine\'s outcome before the confirm, and the engine then does exactly that', () => {
    const { act, outcomes } = actOn(live)
    render(<RightsDesk state={live} onBack={() => {}} act={act} />)
    expect(screen.getByTestId('rights-standing')).toHaveTextContent(`Week ${C}.`)
    const row = screen.getByTestId(`rights-title-row-${route.propertyId}`)
    expect(row).toHaveTextContent('1 live season produced on it')
    expect(screen.queryByTestId('rights-sale-confirm'), 'no binding control before the review').toBeNull()
    fireEvent.click(screen.getByTestId(`rights-sell-${route.propertyId}`))
    fireEvent.change(screen.getByTestId('rights-sale-counterparty'), { target: { value: buyer } })
    // The core's willingness answers the price before anything is offered, at today's valuation (the property on this
    // world is valued at ${value}); a price above the rival's limit names the limit.
    const value = rightsDesk(live).titles.find((t) => t.subject.right === 'R1' && t.subject.propertyId === route.propertyId)!.value!
    fireEvent.change(screen.getByTestId('rights-sale-price'), { target: { value: String(value + 1_000) } })
    expect(screen.getByTestId('rights-sale-willingness')).toHaveTextContent(`At today's valuation ${buyerName} would not accept this price; the most it would pay now is`)
    fireEvent.change(screen.getByTestId('rights-sale-price'), { target: { value: String(value) } })
    expect(screen.getByTestId('rights-sale-willingness')).toHaveTextContent(`At today's valuation ${buyerName} would accept this price; it answers at the week boundary.`)
    expect(screen.queryByTestId('rights-sale-submission-refusal')).toBeNull()
    expect(screen.queryByTestId('rights-sale-confirm')).toBeNull()
    fireEvent.click(screen.getByTestId('rights-sale-review'))
    // The disclosure is the engine's own outcome: the answer at C + 1, the week of work first, the cancellation at C + 2.
    const before = tvView(live).seasons.find((s) => s.seasonId === seasonId)!
    expect(screen.getByTestId('rights-sale-answer')).toHaveTextContent(`${buyerName} accepts at the week boundary (week ${C + 1}) and the title moves for ${moneyExact(value)}.`)
    const disclosed = screen.getByTestId(`rights-sale-season-${seasonId}`)
    expect(disclosed).toHaveTextContent(`It works first: ${before.creditedUnits + 1} of 12 units credited`)
    expect(disclosed).toHaveTextContent(`It is cancelled at week ${C + 2} (${TV_CANCELLATION_LABEL.rights})`)
    expect(disclosed).toHaveTextContent(`The unearned advance ${moneyExact(before.agreement.received - before.agreement.earned)} is returned`)
    expect(disclosed).toHaveTextContent(`the cancellation charge ${moneyExact(before.cancelPreview!.chargeDue)} is assessed once`)
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
    // The engine: the rival answers at C + 1 (title moves, the week's unit credited), the season cancels at C + 2 as disclosed.
    const answered = tick(offered)
    expect(answered.rights.offers.find((o) => o.id === offer.id)!.status).toBe('accepted')
    expect(season(answered).status, 'still live in the produced week').toBe('live')
    expect(season(answered).work.creditedUnits).toBe(before.creditedUnits + 1)
    const end = tick(answered)
    expect(season(end).status).toBe('cancelled')
    expect(season(end).cancellation).toEqual({ week: C + 2, cause: 'rights' })
    expect(season(end).work.creditedUnits).toBe(before.creditedUnits + 1)
    expect(agreement(end).settlement).toMatchObject({ week: C + 2, refundDue: before.agreement.received - agreement(end).earned, chargeDue: before.cancelPreview!.chargeDue })
    // The title is no longer the player's; the desk lists it no more and the offer reads accepted.
    cleanup()
    render(<RightsDesk state={end} onBack={() => {}} act={actOn(end).act} />)
    expect(screen.queryByTestId(`rights-title-row-${route.propertyId}`)).toBeNull()
    expect(screen.getByTestId(`rights-offer-row-${offer.id}`)).toHaveTextContent('accepted')
  })

  it('voices the core\'s refusal tokens, nested details included, and never prints a developer prefix', () => {
    const voice = rightsRefusalVoice(live)
    expect(voice('applyActions: makeRightsOffer rejected — rights offer refused: buyerNotPermitted:founding')).toBe('the buyer may not deal now: a founding studio cannot deal yet')
    expect(voice('rights offer refused: buyerNotPermitted:stageNotStable:distressed')).toBe('the buyer may not deal now: the studio\'s condition is distressed')
    expect(voice('due diligence refused: targetTerminal')).toBe('the target has closed')
    expect(voice('rights offer refused at acceptance: insufficientCashAfterReserve')).toBe('cash after the purchase would fall below the reserve')
    expect(voice('notWilling:priceAboveBid:1200')).toBe('the other studio is not willing: the most it would pay is $1,200')
    expect(voice('absorption closing refused: quoteTooOld')).toBe('the quote is too old; quote again')
    expect(voice('rights: a title sale needs its season consequences acknowledged first')).toBe('a title sale needs its season consequences acknowledged first')
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
    expect(screen.getByTestId(`rights-absorption-refusal-${buyer}-line`), 'the acquisition law is gated behind a disclosure').toHaveTextContent('a fresh full disclosure of that studio is needed first')
    expect(screen.queryByTestId(`rights-quote-${buyer}`)).toBeNull()
    fireEvent.click(screen.getByTestId(`rights-diligence-${buyer}`))
    expect(outcomes[0]!.ok, 'the disclosure request is accepted').toBe(true)
    const disclosed = (outcomes[0] as { ok: true; next: GameState }).next
    expect(disclosed.studio.cash).toBe(live.studio.cash - 50_000)
    cleanup()
    render(<RightsDesk state={disclosed} onBack={() => {}} act={actOn(disclosed).act} />)
    expect(screen.getByTestId(`rights-counterparty-${buyer}`)).toHaveTextContent('1 disclosure held (latest fresh through week')
    // With the disclosure held the acquisition law answers: the quote text with the core's figures, or the core's refusal by name.
    const quoteButton = screen.queryByTestId(`rights-quote-${buyer}`)
    const absorptionRefusal = screen.queryByTestId(`rights-absorption-refusal-${buyer}-line`)
    expect(quoteButton !== null || absorptionRefusal !== null).toBe(true)
    if (quoteButton !== null) {
      fireEvent.click(quoteButton)
      const summary = screen.queryByTestId(`rights-quote-summary-${buyer}`)
      const refused = screen.queryByTestId(`rights-quote-refusal-${buyer}-line`)
      expect(summary !== null || refused !== null).toBe(true)
      if (summary !== null) expect(summary).toHaveTextContent(/Consideration \$0 against the target's ask \$[\d,]+; total outlay/)
      else expect(refused).toHaveTextContent('Not available:')
    } else {
      expect(absorptionRefusal).toHaveTextContent('Not available:')
      expect(absorptionRefusal).not.toHaveTextContent('disclosureRequired')
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
    expect(text).toHaveTextContent(`Cancelled at week ${s.finalWeek} (cancelled at the final delivery boundary): the season could not be delivered, ${s.work.creditedUnits} of 12 units credited by the final week ${s.finalWeek}`)
    const licence = at.rights.licences.find((l) => l.id === tvView(at).seasons[0]!.distribution.licenceId)!
    expect(text).toHaveTextContent(at.market.tick < licence.endWeekExclusive
      ? `its distribution licence stays in force through week ${licence.endWeekExclusive - 1}, with nothing deliverable under it`
      : `its distribution licence ended at week ${licence.endWeekExclusive}`)
  })
})
