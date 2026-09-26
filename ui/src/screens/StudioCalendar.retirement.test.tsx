// 875 Calendar route and disclosure. Actual current37 snapshots, jsdom component
// and App navigation checks; not a browser or native playtest.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { GameState } from '../engine/adapter.ts'
import { exportSaveJson } from '../engine/adapter.ts'
import { StudioCalendar } from './StudioCalendar.tsx'
import { App } from '../App.tsx'
import { setStudioLotOverviewOverride } from '../flags.ts'
import { SCI, scientistSnapshot } from '../../../tests/helpers/p14c2rm-fixtures.ts'

const activeSession = vi.hoisted(() => ({ state: null as GameState | null, saves: 0 }))
vi.mock('../engine/session.ts', () => ({
  clearActiveSession: () => { activeSession.state = null },
  saveActiveSession: (state: GameState) => { activeSession.state = state; activeSession.saves++ },
  loadActiveSession: () => activeSession.state
    ? { ok: true, state: activeSession.state, converted: false } : { ok: false, reason: 'none' },
}))
beforeEach(() => setStudioLotOverviewOverride(false))
afterEach(() => { cleanup(); activeSession.state = null; activeSession.saves = 0 })

describe('C.2-RM real Calendar retirement route', () => {
  it('shows the public boundary immediately beyond the Finance horizon, with nonfinancial wording and exact profile identity', () => {
    const state = scientistSnapshot(618), original = exportSaveJson(state), navigate = vi.fn()
    const name = state.talent.find(row => row.id === SCI)!.name
    render(<StudioCalendar state={state} onNavigate={navigate} onBack={() => {}} />)
    const button = screen.getByTestId(`calendar-event-open-retirement-${SCI}-0`)
    expect(button).toHaveTextContent(/open profile/i)
    const row = button.closest('li')!
    expect(within(row).getByLabelText('Week 670')).toBeVisible()
    expect(row).toHaveTextContent(name)
    expect(row).toHaveTextContent(/retir/i)
    expect(row).toHaveTextContent(/no.*(charge|payment)|nonfinancial|not.*(charge|payment)/i)
    fireEvent.click(button)
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith({ kind: 'profile', talentId: SCI })
    expect(exportSaveJson(state)).toBe(original)
  })

  it('App opens the existing exact off-roster profile and restores Calendar focus without gameplay/autosave writes', async () => {
    const state = scientistSnapshot(618), before = exportSaveJson(state)
    expect(state.contracts.some(row => row.talentId === SCI)).toBe(false)
    activeSession.state = state
    render(<App />)
    await waitFor(() => expect(activeSession.saves).toBeGreaterThan(0))
    const writes = activeSession.saves
    fireEvent.click(screen.getByTestId('open-studio-calendar'))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1, name: /Studio Calendar & Capacity Board/i })))
    const open = screen.getByTestId(`calendar-event-open-retirement-${SCI}-0`)
    open.focus()
    fireEvent.click(open)
    const close = screen.getByTestId('talent-profile-close')
    await waitFor(() => expect(document.activeElement).toBe(close))
    expect(screen.getByTestId('talent-profile-name')).toHaveTextContent(state.talent.find(row => row.id === SCI)!.name)
    fireEvent.click(close)
    await waitFor(() => expect(document.activeElement).toBe(open))
    expect(screen.getByRole('heading', { level: 1, name: /Studio Calendar & Capacity Board/i })).toBeVisible()
    expect(activeSession.saves).toBe(writes)
    expect(exportSaveJson(activeSession.state!)).toBe(before)
  })
})
