// ── D-17A/T5 — contract-obligation truth at signing and renewal ───────────────
// D-16 item 8: the offer screen priced the single largest recurring commitment in the game
// with two of its numbers (annual salary, signing bonus) and none of its consequences. These
// tests pin the whole obligation and its runway consequence onto both flows, and prove the
// figures are the ENGINE's — the same offer the action itself will build.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { HiringMarket } from './HiringMarket.tsx'
import { StudioRoster } from './StudioRoster.tsx'
import {
  hiringMarketCards,
  renewOfferTruths,
  rosterCards,
  signContractAction,
  signOfferTruth,
  financeCard,
  TUNING,
} from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'
import { money, moneyExact } from '../format.ts'
import { newFoundedGame } from '../test/founding.ts'

afterEach(cleanup)
const noop = () => {}

// The first hiring-market card that actually carries offers. Not every listed talent is
// signable (some are available freelancers), so picking index 0 blindly would silently skip.
function offerableCard(state: GameState) {
  const card = hiringMarketCards(state).find((c) => c.employment.offerOptions.length > 0)
  expect(card, 'the hiring market should list at least one signable free agent').toBeDefined()
  return card!
}

function renderHiring(state: GameState) {
  return render(<HiringMarket state={state} onChange={noop} onCreate={noop} onBack={noop} />)
}

// Move the studio to a week at which the first contract's renewal window is open, without
// running the sim (which would also age talent and pay payroll): the renewal window is a pure
// function of the contract's end week, so shifting the CLOCK is the minimal, honest setup.
function atRenewalWindow(state: GameState): GameState {
  const c = state.contracts[0]!
  return { ...state, market: { ...state.market, tick: c.endWeekExclusive - 1 } }
}

describe('D-17A/T5 — signing states the whole obligation and its runway consequence', () => {
  it('every offer shows term total = guaranteed comp + bonus, from the engine helper', () => {
    const state = newFoundedGame('d17a-offer-1')
    // Assert the fixture instead of skipping on it — a silently-passing test proves nothing.
    const card = offerableCard(state)
    expect(card.employment.offerOptions.length).toBe(TUNING.CONTRACT_TERM_OPTIONS.length)
    renderHiring(state)

    for (const offer of card.employment.offerOptions) {
      const truth = signOfferTruth(state, offer)
      const o = truth.obligation
      // The identity the D-16 finding asked for, asserted on the read-model itself…
      expect(o.total).toBe(o.guaranteedComp + o.signingBonus)
      expect(o.guaranteedComp).toBe(o.weeklySalary * offer.termWeeks)
      expect(o.weeklySalary).toBe(Math.round(offer.annualSalary / TUNING.TICKS_PER_YEAR))
      // …and on the screen.
      const line = screen.getByTestId(`offer-obligation-${card.profile.id}-${offer.termWeeks}`)
      expect(line.textContent).toContain(moneyExact(o.total))
      expect(line.textContent).toContain(moneyExact(o.guaranteedComp))
      expect(line.textContent).toContain(moneyExact(o.signingBonus))
      expect(line.textContent).toContain(`${money(o.weeklySalary)}/wk`)
    }
  })

  it('shows runway before → after, and the after figure prices a NEW seat (salary + overhead)', () => {
    const state = newFoundedGame('d17a-offer-2')
    const card = offerableCard(state)
    const offer = card.employment.offerOptions[card.employment.offerOptions.length - 1]!
    const truth = signOfferTruth(state, offer)
    renderHiring(state)

    const line = screen.getByTestId(`offer-runway-${card.profile.id}-${offer.termWeeks}`)
    expect(truth.runway.before.infinite).toBe(false)
    expect(truth.runway.after.infinite).toBe(false)
    expect(line.textContent).toContain(`${truth.runway.before.weeks!} wk`)
    expect(line.textContent).toContain(`${truth.runway.after.weeks!} wk`)

    // A new hire adds BOTH the weekly salary and one seat of overhead to the burn…
    expect(truth.runway.burnAfter).toBe(
      financeCard(state).weeklyBurn + truth.obligation.weeklySalary + TUNING.OVERHEAD_PER_EMPLOYEE,
    )
    // …so the runway strictly shortens.
    expect(truth.runway.after.weeks!).toBeLessThan(truth.runway.before.weeks!)
  })

  it('the runway shown is the SAME runway the studio reports before signing', () => {
    const state = newFoundedGame('d17a-offer-3')
    const card = offerableCard(state)
    const offer = card.employment.offerOptions[0]!
    expect(signOfferTruth(state, offer).runway.before).toEqual(financeCard(state).runway)
  })

  it('the offer priced on screen is the offer the sign ACTION actually commits', () => {
    const state = newFoundedGame('d17a-offer-4')
    const card = offerableCard(state)
    const offer = card.employment.offerOptions[0]!
    const truth = signOfferTruth(state, offer)

    const out = signContractAction(state, card.profile.id, offer.termWeeks)
    expect(out.ok).toBe(true)
    if (!out.ok) throw new Error(out.error)
    const signed = out.next.contracts.find((c) => c.talentId === card.profile.id)!
    expect(signed.annualSalary).toBe(offer.annualSalary)
    expect(signed.signingBonus).toBe(truth.obligation.signingBonus)
    expect(signed.termWeeks).toBe(offer.termWeeks)
    // The bonus really is the immediate cash cost the screen said it was.
    expect(out.next.studio.cash).toBe(state.studio.cash - truth.obligation.signingBonus)
  })
})

describe('D-17A/T5 — renewal states the same truth, priced as a replacement', () => {
  it('renders a real price per term (it previously offered term lengths with no price)', () => {
    const state = atRenewalWindow(newFoundedGame('d17a-renew-1'))
    const id = state.contracts[0]!.talentId
    const truths = renewOfferTruths(state, id)
    expect(truths.length).toBe(TUNING.CONTRACT_TERM_OPTIONS.length)

    render(<StudioRoster state={state} onChange={noop} onBack={noop} />)
    expect(rosterCards(state).find((c) => c.profile.id === id)!.employment.contract!.renewalOpen).toBe(true)

    for (const t of truths) {
      const btn = screen.getByTestId(`roster-renew-${id}-${t.termWeeks}`)
      expect(btn.textContent).toContain(money(t.annualSalary))
      expect(btn.textContent).toContain(money(t.obligation.signingBonus))
      const ob = screen.getByTestId(`offer-obligation-${id}-${t.termWeeks}`)
      expect(ob.textContent).toContain(moneyExact(t.obligation.total))
      expect(screen.getByTestId(`offer-runway-${id}-${t.termWeeks}`)).toBeInTheDocument()
    }
  })

  it('a renewal adds no seat, so its burn moves only by the SALARY delta', () => {
    const state = atRenewalWindow(newFoundedGame('d17a-renew-2'))
    const contract = state.contracts[0]!
    const t = renewOfferTruths(state, contract.talentId)[0]!
    const currentWeekly = Math.round(contract.annualSalary / TUNING.TICKS_PER_YEAR)
    expect(t.runway.burnAfter).toBe(
      financeCard(state).weeklyBurn + (t.obligation.weeklySalary - currentWeekly),
    )
  })
})

describe('D-17A/T5 — the release confirm still shows the termination cost', () => {
  it('keeps the exact termination cost on the confirm button', () => {
    const state = newFoundedGame('d17a-release-1')
    const card = rosterCards(state)[0]!
    render(<StudioRoster state={state} onChange={noop} onBack={noop} />)
    fireEvent.click(screen.getByTestId(`roster-release-${card.profile.id}`))
    const confirm = screen.getByTestId(`roster-confirm-release-${card.profile.id}`)
    expect(confirm.textContent).toContain(money(card.employment.contract!.terminationCost))
  })
})
