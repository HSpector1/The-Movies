// ── D-17A decision-truth UI proofs ────────────────────────────────────────────
// One file per D-17A player-facing truth claim. Every assertion drives the REAL adapter
// read-models on a REAL engine state — nothing is fabricated, and no expected value is
// hardcoded that the engine could disagree with.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Dashboard } from './Dashboard.tsx'
import { StudioRoster } from './StudioRoster.tsx'
import { financeCard, payrollSummary } from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'
import { newFoundedGame } from '../test/founding.ts'

afterEach(cleanup)

const noop = () => {}

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
