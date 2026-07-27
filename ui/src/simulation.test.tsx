// ── INDEPENDENT simulation suite ─────────────────────────────────────────────
// Governing rule (Phase-5 authorization / contract §3 tick, §5.5 PRODUCTION_TICKS):
//   • Advancing a week calls the engine `tick` EXACTLY once (drive the real adapter,
//     observe market.tick +1 — not a mocked tick).
//   • Production countdown follows the engine; a film greenlit at week t is NOT
//     released before t+PRODUCTION_TICKS and IS released at t+PRODUCTION_TICKS.
//   • Cash and standing update from the engine result and are reflected on the
//     dashboard.
//   • NO Broadcast presentation / feed appears anywhere in the UI.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import { App } from './App.tsx'
import { Dashboard } from './screens/Dashboard.tsx'
import {
  advanceWeek,
  greenlight,
  requiredNegative,
  selectWeek,
  selectCash,
  TUNING,
} from './engine/adapter.ts'
import { tick as coreTick } from '../../src/core/index.ts'
import { newFoundedGame, foundedRosterIds } from './test/founding.ts'
import type { DraftPackage, GameState, FilmResult } from './engine/adapter.ts'
import { money } from './format.ts'

afterEach(cleanup)

// Build a legal package from the FOUNDED studio roster. Under D-11.12 film assembly
// draws ONLY from studio-contracted talent (or available freelancers) — the global
// talent pool is no longer staffable — so we pick roster ids by role. D-11.13 also
// requires exactly ONE Production/Craft Lead, so the craft slot is now filled.
function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const writers = foundedRosterIds(state, 'writer')
  const directors = foundedRosterIds(state, 'director')
  const actors = foundedRosterIds(state, 'actor')
  const craft = foundedRosterIds(state, 'craft')
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: writers[0]!,
    directorId: directors[0]!,
    craftIds: [craft[0]!],
    cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

// D-11.2: a new game opens the FOUNDING DRAFT. For full-<App/> tests, sign the role
// minimums (extra actors so a full cast can be chosen) then found the studio, landing
// on the dashboard. Founding draws the recruitment fund, not operating cash.
function foundViaUi() {
  const signInGroup = (role: string, n: number) => {
    fireEvent.click(screen.getByTestId(`founding-tab-${role}`)) // D-11.D: select the profession tab
    for (let i = 0; i < n; i++) {
      const group = screen.getByTestId(`founding-group-${role}`)
      const signBtn = within(group)
        .getAllByRole('button')
        .find((b) => (b.getAttribute('data-testid') ?? '').startsWith('founding-sign-'))!
      fireEvent.click(signBtn)
    }
  }
  signInGroup('actor', 6)
  signInGroup('director', 2)
  signInGroup('writer', 2)
  signInGroup('craft', 2) // a craft lead is required to cast a film (D-11.13)
  fireEvent.click(screen.getByTestId('found-studio'))
}

describe('simulation: advancing a week ticks the engine exactly once', () => {
  it('advanceWeek advances market.tick by exactly 1 and equals one core tick()', () => {
    const state = newFoundedGame('sim-tick-1')
    const before = selectWeek(state)
    const { next } = advanceWeek(state)
    expect(selectWeek(next)).toBe(before + 1)
    // RULING A: advanceWeek now ticks with { develop: true }. Development is a single
    // in-tick step (never a second tick), so market.tick/cash/releasedFilms are still a
    // single core tick's worth — assert against a bare core tick for those develop-invariant
    // fields (development can only change talent, not tick number, cash, or release count).
    const direct = coreTick(state)
    expect(next.market.tick).toBe(direct.market.tick)
    expect(next.studio.cash).toBe(direct.studio.cash)
    expect(next.studio.releasedFilms.length).toBe(direct.studio.releasedFilms.length)
    // And the full state equals ONE develop-ON core tick (no duplication of the tick).
    const directDev = coreTick(state, { develop: true })
    expect(next.market.tick).toBe(directDev.market.tick)
    expect(next.rngState).toBe(directDev.rngState) // dev never advances the sim stream
  })

  it('two advanceWeek calls advance tick by exactly 2 (no double-tick per press)', () => {
    let state = newFoundedGame('sim-tick-2')
    const start = selectWeek(state)
    state = advanceWeek(state).next
    state = advanceWeek(state).next
    expect(selectWeek(state)).toBe(start + 2)
  })

  it('the dashboard Advance button moves the shown week by exactly 1 per click', () => {
    render(<App />)
    const seedInput = screen.getByTestId('seed-input') as HTMLInputElement
    fireEvent.change(seedInput, { target: { value: 'sim-tick-ui' } })
    fireEvent.click(screen.getByTestId('new-game'))
    foundViaUi() // D-11.2: found the studio to reach the dashboard
    expect(screen.getByTestId('dash-week')).toHaveTextContent('0')
    fireEvent.click(screen.getByTestId('advance-week'))
    // A week with no releases shows the release screen; return to dashboard.
    if (screen.queryByTestId('release-continue')) {
      fireEvent.click(screen.getByTestId('release-continue'))
    }
    expect(screen.getByTestId('dash-week')).toHaveTextContent('1')
  })
})

describe('simulation: release timing follows PRODUCTION_TICKS exactly', () => {
  it('a film greenlit at week t is NOT released before t+PRODUCTION_TICKS and IS at t+PRODUCTION_TICKS', () => {
    let state = newFoundedGame('sim-release-1')
    const greenlitAt = selectWeek(state)
    const g = greenlight(state, legalPackage(state))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next
    const prodId = state.studio.activeProductions[0]!.id
    const releaseWeek = greenlitAt + TUNING.PRODUCTION_TICKS

    // Advance week by week. The engine stamps FilmResult.releaseTick with the tick's
    // pre-increment currentTick, so a film greenlit at t releases DURING the tick
    // whose currentTick === t + PRODUCTION_TICKS. Every earlier tick must produce no
    // release; that exact tick releases this film and nothing before it.
    let releaseSeen: FilmResult | null = null
    for (let guard = 0; guard < TUNING.PRODUCTION_TICKS + 5 && releaseSeen === null; guard++) {
      const currentTick = selectWeek(state) // tick() resolves releases at this value
      const step = advanceWeek(state)
      state = step.next
      if (currentTick < releaseWeek) {
        // Contract: NOT released before greenlitAt + PRODUCTION_TICKS.
        expect(step.released.length).toBe(0)
        expect(state.studio.releasedFilms.length).toBe(0)
      } else if (currentTick === releaseWeek) {
        // Contract: IS released exactly at greenlitAt + PRODUCTION_TICKS.
        expect(step.released.length).toBe(1)
        releaseSeen = step.released[0]!
      }
    }
    expect(releaseSeen).not.toBeNull()
    expect(releaseSeen!.productionId).toBe(prodId)
    expect(releaseSeen!.releaseTick).toBe(releaseWeek)
  })

  it('the active production countdown (remainingTicks) follows the engine toward release', () => {
    let state = newFoundedGame('sim-release-2')
    const g = greenlight(state, legalPackage(state))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next
    // The countdown starts at PRODUCTION_TICKS at greenlight.
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(TUNING.PRODUCTION_TICKS)

    // The engine's §3 M1 skip-first-tick rule: a film does not advance during its
    // greenlight tick, so the FIRST advance leaves the countdown unchanged; every
    // subsequent advance decrements it by exactly 1, monotonically, never below 0,
    // until the film releases.
    let prev: number = TUNING.PRODUCTION_TICKS
    let firstAdvance = true
    for (let i = 0; i < TUNING.PRODUCTION_TICKS + 2; i++) {
      state = advanceWeek(state).next
      const active = state.studio.activeProductions[0]
      if (!active) break // released — countdown reached 0 and it left the active list
      if (firstAdvance) {
        // Skip-first-tick: unchanged on the greenlight tick's advance.
        expect(active.remainingTicks).toBe(prev)
        firstAdvance = false
      } else {
        // Thereafter, strictly one less per week.
        expect(active.remainingTicks).toBe(prev - 1)
      }
      expect(active.remainingTicks).toBeGreaterThanOrEqual(0)
      prev = active.remainingTicks
    }
  })
})

describe('simulation: cash and standing on the dashboard reflect the engine post-tick state', () => {
  it('greenlight debits cash by the committed cost (engine), shown on the dashboard', () => {
    let state = newFoundedGame('sim-cash-1')
    const cashBefore = selectCash(state)
    const g = greenlight(state, legalPackage(state))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next
    const cashAfter = selectCash(state)
    // The engine debited money at greenlight (cash strictly decreased).
    expect(cashAfter).toBeLessThan(cashBefore)

    // The dashboard shows the engine's post-greenlight cash (engine value, formatted).
    render(
      <Dashboard
        state={state}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )
    expect(screen.getByTestId('dash-cash')).toHaveTextContent(money(cashAfter))
  })

  it('after a release, at least one standing channel on the dashboard reflects the engine post-tick standing', () => {
    let state = newFoundedGame('sim-standing-1')
    const g = greenlight(state, legalPackage(state))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next
    let released: ReturnType<typeof advanceWeek>['released'] = []
    for (let i = 0; i < 20 && released.length === 0; i++) {
      const step = advanceWeek(state)
      state = step.next
      released = step.released
    }
    expect(released.length).toBeGreaterThan(0)
    const engineStanding = state.studio.standing

    render(
      <Dashboard
        state={state}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onSimToEvent={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )
    // The rendered standing bar for prestige carries the engine's post-tick value.
    const bar = screen.getByTestId('standing-industryPrestige')
    expect(bar.textContent ?? '').toContain(engineStanding.industryPrestige.toFixed(0))
  })
})

describe('simulation: NO Broadcast presentation or feed appears anywhere in the UI', () => {
  it('driving the whole loop through the UI produces no broadcast/headline/feed elements', () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('seed-input'), { target: { value: 'sim-nobroadcast' } })
    fireEvent.click(screen.getByTestId('new-game'))
    foundViaUi() // D-11.2: found the studio to reach the dashboard

    // Assemble + greenlight a film via the wizard.
    fireEvent.click(screen.getByTestId('assemble-film'))
    const grid = screen.getByTestId('concept-grid')
    fireEvent.click(within(grid).getAllByRole('button')[0]!)
    fireEvent.click(screen.getByTestId('assembly-next')) // shape
    fireEvent.click(screen.getByTestId('assembly-next')) // promise
    fireEvent.click(screen.getByTestId('assembly-next')) // talent
    // D-11.13: a Production/Craft Lead is now required to leave the talent step.
    for (const p of ['picker-writer', 'picker-director', 'picker-lead', 'picker-antagonist', 'picker-support', 'picker-craft']) {
      const picker = screen.getByTestId(p)
      // The selectable candidate button carries aria-pressed (redesigned cards also add a
      // "Details" toggle per row, which we must skip). Pick the first ELIGIBLE candidate.
      const btn = within(picker)
        .getAllByRole('button')
        .find((b) => b.hasAttribute('aria-pressed') && !(b as HTMLButtonElement).disabled)!
      fireEvent.click(btn)
    }
    fireEvent.click(screen.getByTestId('assembly-next')) // budget
    fireEvent.click(screen.getByTestId('assembly-next')) // review
    fireEvent.click(screen.getByTestId('greenlight'))

    // Advance until a release, walking the release screen each week.
    //
    // D-11.C PART 2 authorizes an in-world NEWSPAPER release reveal (a fictional front page
    // with a headline). That is a DIFFERENT feature from the forbidden phase-6 "Broadcast
    // presentation / rival feed" this test guards against. The reveal is transient and
    // opt-through; even on it, the anti-broadcast guard must hold (no broadcast/feed/role).
    for (let i = 0; i < 20; i++) {
      const advance = screen.queryByTestId('advance-week')
      if (advance) fireEvent.click(advance)
      if (screen.queryByTestId('newspaper-reveal')) {
        const news = document.body.textContent?.toLowerCase() ?? ''
        expect(news).not.toContain('broadcast')
        expect(news).not.toContain('news feed')
        expect(document.querySelector('[data-testid*="broadcast" i]')).toBeNull()
        expect(document.querySelector('[data-testid*="feed" i]')).toBeNull()
        expect(document.querySelector('[role="feed"]')).toBeNull()
        fireEvent.click(screen.getByTestId('newspaper-continue'))
      }
      const list = screen.queryByTestId('release-list')
      if (list) {
        const cards = within(list).queryAllByTestId(/^release-card-/)
        if (cards.length > 0) break
        fireEvent.click(screen.getByTestId('release-continue'))
      }
    }

    // On the NORMAL loop screens (release summary / dashboard — the newspaper reveal has
    // been dismissed) the full guard holds: no broadcast, no feed, and no broadcast-style
    // HEADLINE surface leaks into the persistent UI.
    const body = document.body.textContent ?? ''
    expect(body.toLowerCase()).not.toContain('broadcast')
    expect(body.toLowerCase()).not.toContain('headline')
    expect(body.toLowerCase()).not.toContain('news feed')
    // No element carries a broadcast/feed/headline testid or role.
    expect(document.querySelector('[data-testid*="broadcast" i]')).toBeNull()
    expect(document.querySelector('[data-testid*="feed" i]')).toBeNull()
    expect(document.querySelector('[data-testid*="headline" i]')).toBeNull()
    expect(document.querySelector('[role="feed"]')).toBeNull()
  })
})
