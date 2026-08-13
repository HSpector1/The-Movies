// D-17B Phase U — player-facing action and accounting truth.
// These tests render the real screens over a founded engine state. Publicity values come
// from the authoritative adapter read model; no lift, cooldown, or cost formula is copied here.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { periodSummary } from '../../../src/core/index.ts'
import {
  publicityDecision,
  runPublicity,
} from '../engine/adapter.ts'
import { newFoundedGame } from '../test/founding.ts'
import { money, moneyExact } from '../format.ts'
import { Dashboard } from './Dashboard.tsx'
import { WeeklySummary } from './WeeklySummary.tsx'
import { StudioRunRecap } from './StudioRunRecap.tsx'

afterEach(cleanup)

const noop = () => {}

function renderDashboard(onPublicize = vi.fn()) {
  const state = newFoundedGame('d17b-publicity-ui')
  render(
    <Dashboard
      state={state}
      onAssemble={noop}
      onAdvance={noop}
      onSimToEvent={noop}
      onCreateTalent={noop}
      onSaves={noop}
      onOpenAutopsy={noop}
      onPublicize={onPublicize}
    />,
  )
  return { state, onPublicize }
}

describe('D-17B publicity decision surface', () => {
  it('renders each exact offer and sends the selected tier through the action callback', () => {
    const { state, onPublicize } = renderDashboard()
    const offers = publicityDecision(state)
    expect(offers).toHaveLength(3)

    for (const offer of offers) {
      const card = screen.getByTestId(`publicity-${offer.tier}`)
      expect(card.textContent).toContain(money(offer.cost))
      expect(card.textContent).toContain(`+${offer.expectedLift.toFixed(2)}`)
      expect(card.textContent).toContain(
        offer.pricePerPoint === null ? '—' : money(offer.pricePerPoint),
      )
      expect(within(card).getByRole('button')).toBeEnabled()
    }

    fireEvent.click(screen.getByTestId('buy-publicity-push'))
    expect(onPublicize).toHaveBeenCalledTimes(1)
    expect(onPublicize).toHaveBeenCalledWith('push')
  })

  it('states the measured operating band and dominant source of awareness decline', () => {
    renderDashboard()
    const copy = screen.getByTestId('awareness-practical-band').textContent ?? ''
    expect(copy).toMatch(/roughly 0.?57/i)
    expect(copy).toMatch(/90%.*below-neutral releases/i)
    expect(copy).toMatch(/weekly pull-down.*above 35/i)
  })

  it('after a purchase, the screen exposes the exact cooldown and disables every tier', () => {
    const base = newFoundedGame('d17b-publicity-cooldown-ui')
    const result = runPublicity(base, 'whisper')
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const offers = publicityDecision(result.next)
    expect(offers.every((offer) => !offer.available)).toBe(true)
    render(
      <Dashboard
        state={result.next}
        onAssemble={noop}
        onAdvance={noop}
        onSimToEvent={noop}
        onCreateTalent={noop}
        onSaves={noop}
        onOpenAutopsy={noop}
        onPublicize={noop}
      />,
    )
    for (const offer of offers) {
      const card = screen.getByTestId(`publicity-${offer.tier}`)
      expect(within(card).getByRole('button')).toBeDisabled()
      expect(card.textContent).toContain(`Week ${offer.availableWeek}`)
    }
  })
})

describe('D-17B publicity ledger surfaces', () => {
  it('renders publicity as its own signed line in the weekly summary', () => {
    const base = newFoundedGame('d17b-publicity-weekly-ui')
    const bought = runPublicity(base, 'whisper')
    expect(bought.ok).toBe(true)
    if (!bought.ok) return
    const summary = periodSummary(bought.next, base.market.tick, base.market.tick)

    render(
      <WeeklySummary
        summary={summary}
        stopReason="limit"
        stopMessage="Test stop."
        weeks={1}
        cashNow={bought.next.studio.cash}
        onContinue={noop}
      />,
    )
    expect(screen.getByTestId('sum-publicity').textContent).toContain(money(summary.publicity))
    expect(summary.publicity).toBe(-publicityDecision(base)[0]!.cost)
  })

  it('keeps publicity in the recap capital story and out of film economics', () => {
    const base = newFoundedGame('d17b-publicity-recap-ui')
    const bought = runPublicity(base, 'push')
    expect(bought.ok).toBe(true)
    if (!bought.ok) return
    const cost = publicityDecision(base)[1]!.cost

    render(<StudioRunRecap state={bought.next} onBack={noop} />)
    const block = screen.getByTestId('recap-publicity')
    expect(screen.getByTestId('recap-total-publicity').textContent).toBe(moneyExact(cost))
    expect(block.textContent).toMatch(/studio-level awareness cost/i)
    expect(block.textContent).toMatch(/never.*film.*commitment/i)
  })
})
