// ── D-12 active-session recovery ──────────────────────────────────────────────
// A browser refresh / HMR reload / dev-server restart used to discard the whole studio (the
// authoritative GameState lived only in React memory). These tests prove the active-session autosave
// round-trips the EXACT engine state through the SaveFileV4 path, survives mid-production and mid-run,
// fails safely on a corrupt payload, cannot collide with another app's storage key, and is cleared
// only by an explicit New Studio.

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import {
  greenlight,
  advanceToNextEvent,
  advanceWeek,
  exportSaveJson,
  selectActiveProductions,
  requiredNegative,
} from './engine/adapter.ts'
import type { DraftPackage, GameState, CreativeRole } from './engine/adapter.ts'
import {
  saveActiveSession,
  loadActiveSession,
  hasActiveSession,
  clearActiveSession,
  ACTIVE_SESSION_KEY,
  ACTIVE_SESSION_CORRUPT_KEY,
} from './engine/session.ts'
import {
  OracleAgent,
  applyActions,
  economyEngaged,
  exportSave,
  generateWorld,
  makeSaveV5,
  tick,
} from '../../src/core/index.ts'
import { newFoundedGame, foundedRosterIds } from './test/founding.ts'
import { App } from './App.tsx'

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  localStorage.clear()
})

function pkg(state: GameState, actors: [number, number, number] = [0, 1, 2], w = 0, d = 0, c = 0): DraftPackage {
  const concept = state.concepts[0]!
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  const id = (r: CreativeRole, i: number) => foundedRosterIds(state, r)[i]!
  return {
    conceptId: concept.id,
    shape,
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] } },
    writerId: id('writer', w),
    directorId: id('director', d),
    craftIds: [id('craft', c)],
    cast: { lead: id('actor', actors[0]), antagonist: id('actor', actors[1]), support: id('actor', actors[2]) },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}
const gl = (s: GameState, p: DraftPackage) => {
  const g = greenlight(s, p)
  if (!g.ok) throw new Error(g.error)
  return g.next
}
// Restore = re-serialize the LOADED state and compare to the original's serialization (byte-identical
// ⇒ exact restore, incl. runs/ledger/cash).
function assertExactRestore(original: GameState) {
  saveActiveSession(original)
  const loaded = loadActiveSession()
  expect(loaded.ok).toBe(true)
  if (!loaded.ok) return
  expect(exportSaveJson(loaded.state)).toBe(exportSaveJson(original))
  return loaded.state
}

describe('D-12 active-session recovery — exact round-trip', () => {
  it('refresh restores a founded studio exactly', () => {
    assertExactRestore(newFoundedGame('rec-found'))
  })

  it('restores an ACTIVE production mid-flight', () => {
    const s = gl(newFoundedGame('rec-active'), pkg(newFoundedGame('rec-active')))
    expect(selectActiveProductions(s).length).toBe(1)
    const restored = assertExactRestore(s)!
    expect(selectActiveProductions(restored).length).toBe(1)
  })

  it('restores TWO concurrent productions with distinct forecasts', () => {
    let s = newFoundedGame('rec-two')
    s = gl(s, pkg(s, [0, 1, 2], 0, 0, 0))
    s = gl(s, pkg(s, [3, 4, 5], 1, 1, 1))
    expect(selectActiveProductions(s).length).toBe(2)
    assertExactRestore(s)
  })

  it('restores a theatrical run mid-flight — week, payments received/remaining, no duplicate', () => {
    let s = gl(newFoundedGame('rec-run'), pkg(newFoundedGame('rec-run')))
    s = advanceToNextEvent(s).next // to the release (a run opens)
    s = advanceWeek(s).next // one weekly payment applied
    const run = s.theatricalRuns[0]!
    expect(run.status).toBe('active')
    const restored = assertExactRestore(s)!
    const rRun = restored.theatricalRuns.find((r) => r.productionId === run.productionId)!
    // Run week, payments-to-date, and status are preserved exactly.
    expect(rRun.weekIndex).toBe(run.weekIndex)
    expect(rRun.cumulativeStudioRevenuePaid).toBe(run.cumulativeStudioRevenuePaid)
    expect(rRun.status).toBe(run.status)
    // No duplicated or skipped payment on reload: the ledger's studioRevenue entries are identical.
    const paidEntries = (x: GameState) => x.ledger.filter((e) => e.kind === 'studioRevenue').length
    expect(paidEntries(restored)).toBe(paidEntries(s))
    // Continuing from the RESTORED state pays the same schedule as continuing the original (no dupes).
    const contOrig = advanceWeek(s).next.studio.cash
    const contRestored = advanceWeek(restored).next.studio.cash
    expect(contRestored).toBe(contOrig)
  })

  it('restores completed releases + their film records', () => {
    let s = gl(newFoundedGame('rec-done'), pkg(newFoundedGame('rec-done')))
    for (let k = 0; k < 40 && s.studio.releasedFilms.length === 0; k++) s = advanceWeek(s).next
    expect(s.studio.releasedFilms.length).toBeGreaterThan(0)
    const restored = assertExactRestore(s)!
    expect(restored.studio.releasedFilms.map((f) => f.productionId)).toEqual(
      s.studio.releasedFilms.map((f) => f.productionId),
    )
  })
})

describe('D-12 active-session recovery — safety', () => {
  it('a corrupt autosave fails safely, is quarantined, and does not crash', () => {
    localStorage.setItem(ACTIVE_SESSION_KEY, '{ not valid json for a save')
    const loaded = loadActiveSession()
    expect(loaded.ok).toBe(false)
    if (loaded.ok) return
    expect(loaded.reason).toBe('corrupt')
    // The bad payload is preserved for diagnosis, not silently discarded.
    expect(localStorage.getItem(ACTIVE_SESSION_CORRUPT_KEY)).toContain('not valid json')
  })

  it('a generic third-party storage key cannot collide with the session', () => {
    localStorage.setItem('save', 'someone-elses-data')
    localStorage.setItem('game', '{}')
    expect(hasActiveSession()).toBe(false)
    expect(loadActiveSession().ok).toBe(false)
  })

  it('clearActiveSession (New Studio) removes the autosave', () => {
    saveActiveSession(newFoundedGame('rec-clear'))
    expect(hasActiveSession()).toBe(true)
    clearActiveSession()
    expect(hasActiveSession()).toBe(false)
  })
})

describe('D-12 active-session recovery — App startup', () => {
  it('a valid autosave is RESTORED on mount (no new studio) with a recovery notice', () => {
    // Seed an active session, then mount a FRESH App (a reload/HMR remount).
    saveActiveSession(newFoundedGame('rec-app'))
    render(<App />)
    // It did NOT drop to the Start screen; it recovered onto the studio dashboard with the notice.
    expect(screen.getByTestId('recovery-notice').textContent).toMatch(/Recovered your studio from Week/)
    expect(screen.getByTestId('dash-week')).toBeInTheDocument() // the founded studio's dashboard rendered
  })

  it('with NO autosave, mount shows the start screen and no recovery notice', () => {
    render(<App />)
    expect(screen.queryByTestId('recovery-notice')).toBeNull()
  })

  it('an invalid autosave surfaces a safe recovery-failed notice, not a crash', () => {
    localStorage.setItem(ACTIVE_SESSION_KEY, 'garbage')
    render(<App />)
    expect(screen.getByTestId('recovery-notice').textContent).toMatch(/Could not recover/i)
  })
})

// New Studio is a confirmed destructive action (D-12 A5). The prompt must fire on the LIVE studio,
// not on whether persistence happened to succeed — otherwise private-mode/storage-disabled sessions
// would be wiped silently. These tests drive the real Saves → New Studio button.
describe('D-12 New Studio — confirmed destructive action', () => {
  function openNewStudio(): number {
    fireEvent.click(screen.getByTestId('open-saves'))
    fireEvent.click(screen.getByTestId('restart-game'))
    return 0
  }

  it('asks for confirmation and PRESERVES the studio when the player declines', () => {
    saveActiveSession(newFoundedGame('confirm-decline'))
    render(<App />)
    expect(screen.getByTestId('dash-week')).toBeInTheDocument()
    let asked = 0
    const orig = window.confirm
    window.confirm = () => {
      asked++
      return false // the player cancels
    }
    try {
      openNewStudio()
    } finally {
      window.confirm = orig
    }
    expect(asked).toBeGreaterThan(0) // the guard fired on the in-memory studio
    expect(screen.queryByTestId('new-game')).toBeNull() // did NOT drop to the Start screen
    expect(hasActiveSession()).toBe(true) // studio preserved — the autosave is intact
  })

  it('wipes to the Start screen and clears the autosave when the player confirms', () => {
    saveActiveSession(newFoundedGame('confirm-accept'))
    render(<App />)
    const orig = window.confirm
    window.confirm = () => true
    try {
      openNewStudio()
    } finally {
      window.confirm = orig
    }
    expect(screen.getByTestId('new-game')).toBeInTheDocument() // dropped to the Start screen
    expect(hasActiveSession()).toBe(false) // autosave cleared so a refresh won't resurrect it
  })
})

// ── D-17A fix-pass — a LITERAL V5 envelope through loadActiveSession ───────────
// Contract §4.E names `loadActiveSession` as the migration path a stored legacy autosave takes,
// and nothing drove one: this file only ever round-tripped V6 payloads written by
// `saveActiveSession`, and the V5→V6 coverage stopped at `importSaveJson`. The behaviour was
// already correct — the gap was the regression guard.
describe('D-17A fix-pass — a stored V5 autosave migrates on load', () => {
  it('an ENGAGED V5 session restores with the flag true and the converted banner', () => {
    const engaged = newFoundedGame('sess-v5-engaged')
    // A LITERAL V5 envelope: the frozen V5 state shape (no `economyEngagedEver`) + saveVersion 5.
    const { economyEngagedEver: _dropped, ...v5State } = engaged
    const v5 = exportSave(makeSaveV5(v5State as never))
    expect(JSON.parse(v5).saveVersion).toBe(5)
    expect('economyEngagedEver' in JSON.parse(v5).state).toBe(false)

    localStorage.setItem(ACTIVE_SESSION_KEY, v5)
    const loaded = loadActiveSession()
    expect(loaded.ok).toBe(true)
    if (!loaded.ok) return
    expect(loaded.converted).toBe(true) // ⇒ the UI shows the "converted" banner
    expect(loaded.state.economyEngagedEver).toBe(true)
    expect(economyEngaged(loaded.state)).toBe(true)

    // …and re-saving it writes a V8 envelope that loads back UNCONVERTED.
    saveActiveSession(loaded.state)
    expect(JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY)!).saveVersion).toBe(8) // Production Operations V1: new games save as SaveFileV8.
    const again = loadActiveSession()
    expect(again.ok).toBe(true)
    if (!again.ok) return
    expect(again.converted).toBe(false)
    expect(again.state.economyEngagedEver).toBe(true)
  })

  it('a NEVER-ENGAGED headless V5 session restores with the flag false', () => {
    // 30 weeks of headless play: films release, but no contract, no run, no overhead — the
    // save class the 4-disjunct predicate has to answer `false` for.
    let s = generateWorld('sess-v5-headless')
    for (let i = 0; i < 30; i++) {
      s = applyActions(s, OracleAgent.chooseActions(s))
      s = tick(s)
    }
    expect(economyEngaged(s)).toBe(false)
    const { economyEngagedEver: _dropped, ...v5State } = s
    localStorage.setItem(ACTIVE_SESSION_KEY, exportSave(makeSaveV5(v5State as never)))

    const loaded = loadActiveSession()
    expect(loaded.ok).toBe(true)
    if (!loaded.ok) return
    expect(loaded.converted).toBe(true)
    expect(loaded.state.economyEngagedEver).toBe(false)
    expect(economyEngaged(loaded.state)).toBe(false)

    // Round-trip: saved as V8, reloaded unconverted, still not engaged.
    saveActiveSession(loaded.state)
    expect(JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY)!).saveVersion).toBe(8) // Production Operations V1: new games save as SaveFileV8.
    const again = loadActiveSession()
    expect(again.ok).toBe(true)
    if (!again.ok) return
    expect(again.converted).toBe(false)
    expect(again.state.economyEngagedEver).toBe(false)
  })
})
