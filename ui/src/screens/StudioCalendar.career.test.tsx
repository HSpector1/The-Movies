// 1065: jsdom/component navigation and the actual existing adapter stop ladder.
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { GameState } from '../engine/adapter.ts'
import { exportSaveJson, simStopDetailFor, simStopFor } from '../engine/adapter.ts'
import { StudioCalendar } from './StudioCalendar.tsx'
import { App } from '../App.tsx'
import { setStudioLotOverviewOverride } from '../flags.ts'
import { campaignDate } from '../../../src/core/calendar.ts'
import { FOCUS, SCIENTIST, surfaceFixtures } from '../../../tests/helpers/p14c3-surface-fixtures.ts'

const activeSession = vi.hoisted(() => ({ state: null as GameState | null, saves: 0 }))
vi.mock('../engine/session.ts', () => ({
  clearActiveSession: () => { activeSession.state = null },
  saveActiveSession: (state: GameState) => { activeSession.state = state; activeSession.saves++ },
  loadActiveSession: () => activeSession.state
    ? { ok: true, state: activeSession.state, converted: false } : { ok: false, reason: 'none' },
}))
const f = surfaceFixtures('1065-ui-career', 15)
beforeEach(() => setStudioLotOverviewOverride(false))
afterEach(() => { cleanup(); activeSession.state = null; activeSession.saves = 0 })
afterAll(f.report)
function profileButtons(name: string) {
  return screen.queryAllByRole('button', { name: /open profile/i }).filter(button =>
    button.closest('li')?.textContent?.includes(name))
}
describe('C.3 recent career facts use existing Calendar identity routes', () => {
  it('U1 renders genuine change/finality names and dates, retains age12, and removes age13 news', () => {
    const worlds = [f.changed(208), f.changed(220), f.changed(221), f.scientist(671)]
    for (const state of worlds) {
      const before = exportSaveJson(state), navigate = vi.fn()
      const view = render(<StudioCalendar state={state} onNavigate={navigate} onBack={() => {}} />)
      const ids = state.market.tick === 671 ? [SCIENTIST] : Object.values(FOCUS)
      for (const id of ids) {
        const talent = state.talent.find(row => row.id === id)!, buttons = profileButtons(talent.name)
        if (state.market.tick === 221) { expect(buttons).toHaveLength(0); continue }
        expect(buttons).toHaveLength(1)
        const row = buttons[0]!.closest('li')!
        expect(row).toHaveTextContent(talent.name)
        expect(row).toHaveTextContent(new RegExp(talent.role, 'i'))
        expect(row).toHaveTextContent(campaignDate(state.market.tick === 671 ? 671 : 208).label)
        expect(within(row).queryByText(/unread|\$|forecast/i)).toBeNull()
        fireEvent.click(buttons[0]!)
        expect(navigate).toHaveBeenLastCalledWith({ kind: 'profile', talentId: id })
      }
      expect(exportSaveJson(state)).toBe(before)
      view.unmount()
    }
  })
  it('U2 App opens the exact off-roster career profile and restores focus without post-hydration writes', async () => {
    const state = f.changed(), name = state.talent.find(row => row.id === FOCUS.director)!.name
    expect(state.contracts.some(row => row.talentId === FOCUS.director)).toBe(false)
    const before = exportSaveJson(state); activeSession.state = state
    render(<App />)
    await waitFor(() => expect(activeSession.saves).toBeGreaterThan(0))
    const writes = activeSession.saves
    fireEvent.click(screen.getByTestId('open-studio-calendar'))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1, name: /Studio Calendar & Capacity Board/i })))
    const buttons = profileButtons(name); expect(buttons).toHaveLength(1)
    const open = buttons[0]!; open.focus(); fireEvent.click(open)
    const close = screen.getByTestId('talent-profile-close')
    await waitFor(() => expect(document.activeElement).toBe(close))
    expect(screen.getByTestId('talent-profile-name')).toHaveTextContent(name)
    fireEvent.click(close)
    await waitFor(() => expect(document.activeElement).toBe(open))
    expect(activeSession.saves).toBe(writes)
    expect(exportSaveJson(activeSession.state!)).toBe(before)
  })
  it('U3 actual208 expiry explains its stop while Scientist finality alone adds no automatic stop', () => {
    const before = f.changed(207), after = f.changed(208), priorScientist = f.scientist(670), finalScientist = f.scientist(671)
    expect(after.contracts.length).toBeLessThan(before.contracts.length)
    expect(after.studio.releasedFilms).toEqual(before.studio.releasedFilms)
    expect(after.studio.activeProductions).toEqual([])
    expect(after.scriptDevelopment.projects.some(row => row.status === 'review')).toBe(false)
    const original = exportSaveJson(after)
    expect(simStopFor(before, after)).toBe('contractExpired')
    expect(simStopDetailFor(before, after)?.reason).toBe('contractExpired')
    expect(finalScientist.careerLifecycle.industryRetirements.find(row => row.personId === SCIENTIST)).toMatchObject({ week: 671 })
    expect(finalScientist.contracts.length).toBe(priorScientist.contracts.length)
    expect(finalScientist.studio.releasedFilms).toEqual(priorScientist.studio.releasedFilms)
    expect(finalScientist.studio.activeProductions).toEqual([])
    expect(finalScientist.scriptDevelopment.projects.some(row => row.status === 'review')).toBe(false)
    expect(simStopDetailFor(priorScientist, finalScientist), 'an unrelated real stop is a premise failure, never suppressed').toBeNull()
    expect(simStopFor(priorScientist, finalScientist)).toBeNull()
    expect(exportSaveJson(after)).toBe(original)
  })
})
