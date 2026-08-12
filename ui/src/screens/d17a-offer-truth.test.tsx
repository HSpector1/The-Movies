// ── D-17A/T5 — contract-obligation truth at signing and renewal ───────────────
// D-16 item 8: the offer screen priced the single largest recurring commitment in the game
// with two of its numbers (annual salary, signing bonus) and none of its consequences. These
// tests pin the whole obligation and its runway consequence onto both flows, and prove the
// figures are the ENGINE's — the same offer the action itself will build.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { HiringMarket } from './HiringMarket.tsx'
import { StudioRoster } from './StudioRoster.tsx'
import { FoundingScreen } from './FoundingScreen.tsx'
import {
  foundingApplicantCards,
  hiringMarketCards,
  newGame,
  offerObligation,
  renewOfferTruths,
  rosterCards,
  signContractAction,
  signOfferTruth,
  financeCard,
  TUNING,
} from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'
import { money, moneyExact } from '../format.ts'
import { postSigningRunway } from '../../../src/core/index.ts'
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

// ── D-17A fix-pass — T5 at the FOUNDING DRAFT ────────────────────────────────
// The founding draft is the one moment a studio signs five or six contracts at once, and it
// was the only offer surface with no obligation figure at all: the buttons read
// "{term}yr · {salary}/yr · {bonus} bonus" and nothing else, while the hiring market and the
// roster both got the T5 treatment. A player could commit ~$4M of guaranteed salary across
// five 4-year contracts having never been shown a total.
//
// Deliberately NO per-offer runway pair: `postSigningRunway` short-circuits while a founding
// draft is open (`economyView.ts:352-354` — the tick charges nothing until the studio is
// founded), so both edges would print the same number. The aggregate `founding-runway`
// projection remains the runway surface; the per-offer line states the PAYROLL delta instead.
describe('D-17A fix-pass — the founding draft states each offer’s obligation', () => {
  function foundingState(seed: string): GameState {
    const s = newGame(seed)
    expect(s.founding).not.toBeNull()
    return s
  }

  it('every founding offer shows term total = guaranteed comp + bonus, from the engine helper', () => {
    const state = foundingState('d17a-found-1')
    const cards = foundingApplicantCards(state)
    const card = cards.find((c) => c.employment.offerOptions.length > 0)!
    expect(card).toBeDefined()
    expect(card.employment.offerOptions.length).toBe(TUNING.CONTRACT_TERM_OPTIONS.length)

    render(<FoundingScreen state={state} onChange={noop} onCreate={noop} onFounded={noop} />)
    const id = card.profile.id

    for (const offer of card.employment.offerOptions) {
      const o = offerObligation(offer)
      expect(o.total).toBe(o.guaranteedComp + o.signingBonus)
      expect(o.guaranteedComp).toBe(o.weeklySalary * offer.termWeeks)

      const line = screen.getByTestId(`founding-obligation-${id}-${offer.termWeeks}`)
      expect(line.textContent).toContain(moneyExact(o.total))
      expect(line.textContent).toContain(moneyExact(o.guaranteedComp))
      expect(line.textContent).toContain(moneyExact(o.signingBonus))
      // the weekly-payroll delta this offer adds to the projected post-founding burn
      expect(line.textContent).toContain(money(o.weeklySalary))
      expect(line.textContent).toMatch(/projected payroll/)
      // …and the bonus is named as drawing the RECRUITMENT FUND, not operating cash.
      expect(line.textContent).toMatch(/recruitment fund/)
    }
  })

  it('renders NO per-offer runway pair — that selector is a no-op during a founding draft', () => {
    const state = foundingState('d17a-found-2')
    const card = foundingApplicantCards(state).find((c) => c.employment.offerOptions.length > 0)!
    const offer = card.employment.offerOptions[0]!
    // The reason, asserted rather than assumed: the selector short-circuits during a founding
    // draft, so a rendered before/after pair would be two copies of the same number.
    const r = postSigningRunway(state, offer)
    expect(r.after).toEqual(r.before)
    expect(r.burnAfter).toBe(0)
    expect(r.cashAfter).toBe(state.studio.cash)

    render(<FoundingScreen state={state} onChange={noop} onCreate={noop} onFounded={noop} />)
    expect(screen.queryByTestId(`offer-runway-${card.profile.id}-${offer.termWeeks}`)).toBeNull()
    // The aggregate projection is still the runway surface on this screen.
    expect(screen.getByTestId('founding-runway')).toBeInTheDocument()
  })

  it('the obligation line survives sorting and filtering (it hangs off the offer, not the row)', () => {
    const state = foundingState('d17a-found-3')
    render(<FoundingScreen state={state} onChange={noop} onCreate={noop} onFounded={noop} />)
    const lines = screen.getAllByTestId(/^founding-obligation-/)
    expect(lines.length).toBeGreaterThan(0)
    for (const l of lines) expect(l.textContent).toMatch(/Commits \$/)
  })
})
