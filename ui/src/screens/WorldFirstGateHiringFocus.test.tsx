import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  gateHiringEligibleCards,
  hiringMarketCards,
  signOfferTruth,
  type EmploymentCard,
  type GameState,
} from '../engine/adapter.ts'
import { newFoundedGame } from '../test/founding.ts'
import { HiringMarket } from './HiringMarket.tsx'

afterEach(cleanup)

const noop = () => {}

function firstEligibleCard(state: GameState): EmploymentCard {
  const eligible = gateHiringEligibleCards(state)
  if (eligible === null || eligible.length === 0) {
    throw new Error('Expected at least one exact Gate-eligible Hiring card')
  }
  return eligible[0]!
}

function HiringHarness({
  initialState,
  focusTalentId,
}: {
  initialState: GameState
  focusTalentId?: string
}) {
  const [state, setState] = useState(initialState)
  return (
    <HiringMarket
      state={state}
      onChange={setState}
      onCreate={noop}
      onBack={noop}
      {...(focusTalentId === undefined ? {} : { focusTalentId })}
    />
  )
}

describe('World-First Gate → focused Hiring', () => {
  it('focuses one exact current eligible card heading once and sorting does not steal focus', () => {
    const state = newFoundedGame('gate-hiring-focus-exact')
    const candidate = firstEligibleCard(state)

    render(<HiringHarness initialState={state} focusTalentId={candidate.profile.id} />)

    const cardHeading = screen.getByTestId(`hiring-card-heading-${candidate.profile.id}`)
    const marketHeading = screen.getByTestId('hiring-contract-heading')
    expect(cardHeading.tagName).toBe('H3')
    expect(cardHeading).toHaveAttribute('tabindex', '-1')
    expect(marketHeading.tagName).toBe('H2')
    expect(marketHeading).toHaveAttribute('tabindex', '-1')
    expect(document.activeElement).toBe(cardHeading)

    const sort = screen.getByTestId('hiring-sort') as HTMLSelectElement
    sort.focus()
    fireEvent.change(sort, { target: { value: 'salary' } })
    expect(document.activeElement).toBe(sort)
  })

  it('falls back to the stable market heading for a missing identity', () => {
    render(
      <HiringHarness
        initialState={newFoundedGame('gate-hiring-focus-missing')}
        focusTalentId="missing-gate-candidate"
      />,
    )

    expect(document.activeElement).toBe(screen.getByTestId('hiring-contract-heading'))
  })

  it('falls back for the known Hiring/freelancer overlap row with no contract offers', () => {
    const state = newFoundedGame('gate-hiring-overlap-0')
    const overlap = hiringMarketCards(state).find(
      (card) =>
        card.employment.status === 'availableFreelancer' &&
        card.employment.offerOptions.length === 0,
    )
    if (overlap === undefined) throw new Error('Frozen overlap fixture no longer exposes its row')

    render(<HiringHarness initialState={state} focusTalentId={overlap.profile.id} />)

    expect(screen.getByTestId(`hiring-card-${overlap.profile.id}`)).toBeInTheDocument()
    expect(document.activeElement).toBe(screen.getByTestId('hiring-contract-heading'))
  })

  it('does not focus a card when its underlying state.talent identity is duplicated', () => {
    const state = newFoundedGame('gate-hiring-focus-duplicate-identity')
    const candidate = firstEligibleCard(state)
    const identity = state.talent.find((talent) => talent.id === candidate.profile.id)
    if (identity === undefined) throw new Error('Gate candidate is missing its source identity')
    const duplicateState: GameState = {
      ...state,
      talent: [...state.talent, { ...identity }],
      freeAgents: [
        candidate.profile.id,
        ...state.freeAgents.filter((talentId) => talentId !== candidate.profile.id),
      ],
    }
    expect(gateHiringEligibleCards(duplicateState)).toBeNull()

    render(<HiringHarness initialState={duplicateState} focusTalentId={candidate.profile.id} />)

    expect(screen.getByTestId(`hiring-card-${candidate.profile.id}`)).toBeInTheDocument()
    expect(document.activeElement).toBe(screen.getByTestId('hiring-contract-heading'))
  })

  it('moves focus to the market heading only after accepted signing removes the focused card', () => {
    const base = newFoundedGame('gate-hiring-focus-accepted-sign')
    const state: GameState = {
      ...base,
      studio: { ...base.studio, cash: 1_000_000_000 },
    }
    const candidate = firstEligibleCard(state)
    const offer = candidate.employment.offerOptions[0]!
    expect(signOfferTruth(state, offer).bonusAffordable).toBe(true)

    render(<HiringHarness initialState={state} focusTalentId={candidate.profile.id} />)
    expect(document.activeElement).toBe(
      screen.getByTestId(`hiring-card-heading-${candidate.profile.id}`),
    )

    fireEvent.click(screen.getByTestId(`hiring-sign-${candidate.profile.id}-${offer.termWeeks}`))

    expect(screen.queryByTestId(`hiring-card-${candidate.profile.id}`)).not.toBeInTheDocument()
    expect(document.activeElement).toBe(screen.getByTestId('hiring-contract-heading'))
  })

  it('keeps a rejected signing loud, byte-identical and focused on its initiating control', () => {
    const base = newFoundedGame('gate-hiring-focus-rejected-sign')
    const state: GameState = {
      ...base,
      studio: { ...base.studio, cash: 0 },
    }
    const candidate = firstEligibleCard(state)
    const offer = candidate.employment.offerOptions.find(
      (option) => !signOfferTruth(state, option).bonusAffordable,
    )
    if (offer === undefined) throw new Error('Expected a cash-gated contract offer')
    const before = JSON.stringify(state)
    const onChange = vi.fn()

    render(
      <HiringMarket
        state={state}
        onChange={onChange}
        onCreate={noop}
        onBack={noop}
        focusTalentId={candidate.profile.id}
      />,
    )
    const sign = screen.getByTestId(`hiring-sign-${candidate.profile.id}-${offer.termWeeks}`)
    sign.focus()
    fireEvent.click(sign)

    expect(screen.getByRole('alert')).not.toHaveTextContent(/^\s*$/)
    expect(onChange).not.toHaveBeenCalled()
    expect(JSON.stringify(state)).toBe(before)
    expect(document.activeElement).toBe(sign)
  })
})
