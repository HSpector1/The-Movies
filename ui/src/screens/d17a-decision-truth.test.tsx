// ── D-17A decision-truth UI proofs ────────────────────────────────────────────
// One file per D-17A player-facing truth claim. Every assertion drives the REAL adapter
// read-models on a REAL engine state — nothing is fabricated, and no expected value is
// hardcoded that the engine could disagree with.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, cleanup, fireEvent } from '@testing-library/react'
import { Dashboard } from './Dashboard.tsx'
import { StudioRoster } from './StudioRoster.tsx'
import { Assembly } from './Assembly.tsx'
import {
  cycleInclusiveBreakEvenGross,
  financeCard,
  payrollSummary,
  TUNING,
} from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'
import { money } from '../format.ts'
import { newFoundedGame } from '../test/founding.ts'

afterEach(cleanup)

const noop = () => {}

// Pick the first ELIGIBLE candidate in a picker (its option toggle carries aria-pressed).
function pickFirstEligible(pickerTestId: string) {
  const picker = screen.getByTestId(pickerTestId)
  const btn = within(picker)
    .getAllByRole('button')
    .find((b) => b.hasAttribute('aria-pressed') && !(b as HTMLButtonElement).disabled)!
  fireEvent.click(btn)
}

// Drive the real wizard to a step (the same clicks a player makes), returning the state.
function openWizard(seed: string, to: 'budget' | 'review'): GameState {
  const state = newFoundedGame(seed)
  render(<Assembly state={state} onGreenlit={noop} onCancel={noop} />)
  const grid = screen.getByTestId('concept-grid')
  fireEvent.click(within(grid).getAllByRole('button')[0]!)
  fireEvent.click(screen.getByTestId('assembly-next')) // → shape
  fireEvent.click(screen.getByTestId('assembly-next')) // → promise
  fireEvent.click(screen.getByTestId('assembly-next')) // → talent
  for (const p of ['writer', 'director', 'lead', 'antagonist', 'support', 'craft']) {
    pickFirstEligible(`picker-${p}`)
  }
  fireEvent.click(screen.getByTestId('assembly-next')) // → budget
  if (to === 'review') fireEvent.click(screen.getByTestId('assembly-next')) // → review
  return state
}

// The EXACT immediate commitment the screen itself is pricing, read off the screen's own
// `committed-cost` / `release-commitment` figure (moneyExact). Re-deriving the package in the
// test would be a second implementation of the wizard's talent choice — and the first eligible
// candidate in a picker may be a freelancer, whose fee the test would have to guess.
function committedOnScreen(testid: 'committed-cost' | 'release-commitment'): number {
  const text = screen.getByTestId(testid).textContent ?? ''
  return Number(text.replace(/[^0-9.-]/g, ''))
}

function renderDashboard(state: GameState) {
  return render(
    <Dashboard
      state={state}
      onAssemble={noop}
      onAdvance={noop}
      onSimToEvent={noop}
      onCreateTalent={noop}
      onSaves={noop}
      onOpenAutopsy={noop}
    />,
  )
}

function renderRoster(state: GameState) {
  return render(<StudioRoster state={state} onChange={noop} onBack={noop} />)
}

// ═══════════════════════════════════════════════════════════════════════════════
// T1 — ONE RUNWAY. The 186-wk-vs-72-wk contradiction's regression guard.
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T1 — the Roster and the Dashboard show ONE runway', () => {
  it('roster-runway is character-for-character the Dashboard runway on the same state', () => {
    const state = newFoundedGame('d17a-runway-1')

    renderDashboard(state)
    const dash = screen.getByTestId('fin-runway').textContent
    cleanup()

    renderRoster(state)
    const roster = screen.getByTestId('roster-runway').textContent

    expect(roster).toBe(dash)
  })

  it('the roster runway equals the authoritative runway read-model, and the retired payroll-only figure was strictly longer', () => {
    const state = newFoundedGame('d17a-runway-2')
    const fin = financeCard(state)
    const pay = payrollSummary(state)

    // Same object, same rule: payrollSummary now delegates to economyView.runway.
    expect(pay.runway).toEqual(fin.runway)
    expect(pay.runway.infinite).toBe(false)

    renderRoster(state)
    expect(screen.getByTestId('roster-runway').textContent).toContain(`${pay.runway.weeks!} wk`)

    // TEETH: the retired basis (cash ÷ weekly PAYROLL, ignoring overhead and run revenue)
    // reported a materially LONGER runway on this very state — that was the contradiction.
    const retiredPayrollOnly = Math.floor(state.studio.cash / pay.weeklyPayroll)
    expect(retiredPayrollOnly).toBeGreaterThan(pay.runway.weeks!)
  })

  it('uses the same unit string as the Dashboard ("wk", never "wks")', () => {
    const state = newFoundedGame('d17a-runway-3')
    renderRoster(state)
    const text = screen.getByTestId('roster-runway').textContent ?? ''
    expect(text).not.toMatch(/wks/)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// T2 / R7 — ONE break-even headline, and it is the STUDIO-ECONOMIC one.
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T2 — the break-even headline is cycle-inclusive', () => {
  it('Budget & Forecast headlines the cycle-inclusive figure and keeps the direct figure labelled', () => {
    const state = openWizard('d17a-be-1', 'budget')
    const be = cycleInclusiveBreakEvenGross(state, committedOnScreen('committed-cost'))

    // The headline IS the studio-economic figure, and it is strictly larger than direct.
    expect(screen.getByTestId('budget-breakeven').textContent).toContain(money(be.cycleInclusive))
    expect(be.cycleInclusive).toBeGreaterThan(be.direct)

    // The direct figure survives, explicitly labelled as direct-costs-only.
    const direct = screen.getByTestId('budget-breakeven-direct')
    expect(direct.textContent).toContain(money(be.direct))
    expect(direct.textContent).toMatch(/direct costs only/i)
  })

  it('shared occupancy is a NAMED second line at concurrency 2 — never blended, never a fraction', () => {
    const state = openWizard('d17a-be-2', 'budget')
    const committed = committedOnScreen('committed-cost')
    const shared = cycleInclusiveBreakEvenGross(state, committed, { concurrency: 2 })
    const sole = cycleInclusiveBreakEvenGross(state, committed)

    const line = screen.getByTestId('budget-breakeven-shared')
    expect(line.textContent).toContain(money(shared.cycleInclusive))
    expect(line.textContent).toMatch(/if a second film shares those 14 weeks/i)
    // Sharing the cycle LOWERS the bar, but never below the direct-cost figure.
    expect(shared.cycleInclusive).toBeLessThan(sole.cycleInclusive)
    expect(shared.cycleInclusive).toBeGreaterThan(sole.direct)
    // No blended-occupancy scalar anywhere in the block.
    const block = screen.getByTestId('budget-breakeven-block').textContent ?? ''
    expect(block).not.toMatch(/concurrency/i)
    expect(block).not.toMatch(/1\.\d+ films?/i)
  })

  it('names its assumption: 8 + 6 weeks at today’s weekly burn, with no decimal on the week count', () => {
    const state = openWizard('d17a-be-3', 'budget')
    const fc = cycleInclusiveBreakEvenGross(state, committedOnScreen('committed-cost')).fixedCost

    const note = screen.getByTestId('budget-breakeven-assumption').textContent ?? ''
    expect(fc.weeks).toBe(TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS)
    expect(fc.concurrency).toBe(1) // the conservative default the copy claims
    expect(note).toContain(`${TUNING.PRODUCTION_TICKS} weeks in production`)
    expect(note).toContain(`${TUNING.THEATRICAL_WEEKS} weeks in release`)
    expect(note).toContain(money(fc.weeklyBurn))
    expect(note).toContain(money(fc.amount))
    // The 14-week extrapolation is never rendered with a decimal.
    expect(note).not.toMatch(/\b14\.\d/)
    expect(note).toMatch(/all 14 weeks/)
  })

  it('the Review step headlines the same cycle-inclusive figure as Budget & Forecast', () => {
    const state = openWizard('d17a-be-4', 'review')
    const be = cycleInclusiveBreakEvenGross(state, committedOnScreen('release-commitment'))
    expect(screen.getByTestId('release-breakeven').textContent).toContain(money(be.cycleInclusive))
    expect(screen.getByTestId('release-breakeven-direct').textContent).toContain(money(be.direct))
    expect(screen.getByTestId('release-breakeven-shared')).toBeInTheDocument()
    expect(screen.getByTestId('release-breakeven-assumption')).toBeInTheDocument()
  })
})
