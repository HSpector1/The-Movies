// ── INDEPENDENT saves suite ──────────────────────────────────────────────────
// Governing rule (Phase-5 authorization / contract §17):
//   • export → import round-trips exact state (serialized form equals original) and
//     continues deterministically.
//   • Malformed / unsupported saves are rejected LOUDLY and understandably —
//     surfaced to the UI, never a crash.

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { Saves } from './screens/Saves.tsx'
import { StartScreen } from './screens/StartScreen.tsx'
import { App } from './App.tsx'
import { ACTIVE_SESSION_KEY } from './engine/session.ts'
import {
  newGame,
  exportSaveJson,
  importSaveJson,
  greenlight,
  advanceWeek,
  requiredNegative,
} from './engine/adapter.ts'
import {
  stableStringify,
  generateWorld,
  exportSave,
  makeSaveV1,
  makeSaveV8,
} from '../../src/core/index.ts'
import { newFoundedGame, foundedRosterIds } from './test/founding.ts'
import type { DraftPackage, GameState } from './engine/adapter.ts'
import type { GameStateV1, TalentV1 } from '../../src/core/index.ts'
import { setStudioLotOverviewOverride } from './flags.ts'

beforeEach(() => setStudioLotOverviewOverride(false))
afterEach(cleanup)

// Build a valid legacy V1 save JSON by projecting a fresh world's talent down to the
// old scalar TalentV1 shape (V1 validation is envelope-only, so this is accepted and
// then deterministically converted by the D-9.15 migration).
function legacyV1SaveJson(seed: string): string {
  const world = generateWorld(seed)
  const talentV1: TalentV1[] = world.talent.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    age: t.age,
    actual: t.actual,
    perceived: t.perceived,
    skill: t.skill, // the legacy scalar (the V2 talent keeps this proxy field)
    fame: t.fame,
    salary: t.salary,
    authored: t.authored,
  }))
  const stateV1: GameStateV1 = {
    seed: world.seed,
    rngState: world.rngState,
    market: world.market,
    era: world.era,
    studio: world.studio,
    talent: talentV1,
    concepts: world.concepts,
    broadcastItems: world.broadcastItems,
    coverageContexts: world.coverageContexts,
  }
  return exportSave(makeSaveV1(stateV1))
}

// V8 is the newest legacy envelope and catches version-specific disclosure drift:
// an automatic import must say only that an older save was upgraded, never call it V1.
function legacyV8SaveJson(seed: string): string {
  const live = newFoundedGame(seed)
  const { scriptDevelopment: _scriptDevelopment, ...stateV8 } = live
  return exportSave(makeSaveV8(stateV8))
}

function openCurrentStudioThroughStart(seed: string): void {
  render(<App />)
  fireEvent.change(screen.getByTestId('import-text'), {
    target: { value: exportSaveJson(newFoundedGame(seed)) },
  })
  fireEvent.click(screen.getByTestId('import-save'))
  expect(screen.getByTestId('dash-week')).toBeInTheDocument()
  expect(screen.queryByTestId('save-migration-notice')).not.toBeInTheDocument()
}

// Build a legal package from the FOUNDED studio roster. Under D-11.12 film assembly
// draws ONLY from studio-contracted talent (the global pool is no longer staffable),
// and D-11.13 requires exactly ONE Production/Craft Lead — so we pick roster ids by
// role and fill the craft slot.
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

describe('saves: export → import round-trips the EXACT state', () => {
  it('importSaveJson(exportSaveJson(state)) has a serialized form equal to the original', () => {
    let state = newFoundedGame('save-roundtrip-1')
    // Exercise a non-trivial mid-game state (greenlit production + a few ticks).
    const g = greenlight(state, legalPackage(state))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next
    state = advanceWeek(state).next
    state = advanceWeek(state).next

    const json = exportSaveJson(state)
    expect(JSON.parse(json).saveVersion).toBe(12)
    const r = importSaveJson(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // Byte-equal serialized state (stable-stringify both, order-independent).
    expect(stableStringify(r.state)).toBe(stableStringify(state))
  })

  it('a restored state continues deterministically (same next tick as the original)', () => {
    let state = newFoundedGame('save-roundtrip-2')
    const g = greenlight(state, legalPackage(state))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next

    const json = exportSaveJson(state)
    const restored = importSaveJson(json)
    expect(restored.ok).toBe(true)
    if (!restored.ok) return

    // Advancing the original and the restored copy yields identical states.
    const origNext = advanceWeek(state).next
    const restoredNext = advanceWeek(restored.state).next
    expect(stableStringify(restoredNext)).toBe(stableStringify(origNext))
  })

  it('the Saves screen exports the exact state and re-imports it, restoring it (UI path)', () => {
    const state = newGame('save-roundtrip-ui')
    const exported = exportSaveJson(state)
    let loaded: GameState | null = null

    render(
      <Saves
        state={state}
        onLoad={(s) => {
          loaded = s
        }}
        onNewGame={() => {}}
        onBack={() => {}}
      />,
    )
    // The export textarea holds the exact save JSON.
    const exportText = (screen.getByTestId('export-text') as HTMLTextAreaElement).value
    expect(exportText).toBe(exported)

    // Paste it into the import box and load.
    fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: exportText } })
    fireEvent.click(screen.getByTestId('saves-import'))
    expect(loaded).not.toBeNull()
    expect(stableStringify(loaded!)).toBe(stableStringify(state))
  })
})

describe('saves: malformed / unsupported saves are rejected loudly and understandably', () => {
  it('importSaveJson rejects malformed JSON with a non-empty error (as data)', () => {
    const r = importSaveJson('{ this is not valid json')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.length).toBeGreaterThan(0)
  })

  it('importSaveJson rejects an unknown save version', () => {
    const r = importSaveJson(JSON.stringify({ saveVersion: 99, seed: 'x', state: {} }))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.length).toBeGreaterThan(0)
  })

  it('the Saves screen surfaces a rejection message and does NOT crash on a bad save', () => {
    const state = newGame('save-reject-ui')
    let loaded = false
    render(
      <Saves
        state={state}
        onLoad={() => {
          loaded = true
        }}
        onNewGame={() => {}}
        onBack={() => {}}
      />,
    )
    fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: '{ broken' } })
    fireEvent.click(screen.getByTestId('saves-import'))
    // No load happened, and a visible error is rendered (understandable to the user).
    expect(loaded).toBe(false)
    const alert = screen.getByRole('alert')
    expect(alert.textContent ?? '').toMatch(/rejected/i)
    // The screen itself is still present (did not crash / unmount).
    expect(screen.getByTestId('saves-import')).toBeInTheDocument()
  })

  it('the StartScreen import surfaces a rejection message for a wrong-version save', () => {
    let started = false
    render(<StartScreen onStart={() => (started = true)} />)
    fireEvent.change(screen.getByTestId('import-text'), {
      target: { value: JSON.stringify({ saveVersion: 7, seed: 'z' }) },
    })
    fireEvent.click(screen.getByTestId('import-save'))
    expect(started).toBe(false)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

describe('saves: legacy V1 import (D-9.15) converts and reports the conversion', () => {
  it('a legacy V1 save auto-loads, is flagged converted, and yields a playable current state', () => {
    const json = legacyV1SaveJson('legacy-v1-auto')
    const r = importSaveJson(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // Converted, and the loaded state is the NEW multi-discipline shape (talent has
    // the D-9 `skills` record — the migration marker).
    expect(r.converted).toBe(true)
    expect((r.state.talent[0] as Record<string, unknown>).skills).toBeDefined()
    expect(r.state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] })
  })

  it('the explicit "Import legacy V1 save" affordance converts and shows a conversion notice', () => {
    const state = newGame('legacy-v1-ui')
    const json = legacyV1SaveJson('legacy-v1-ui-src')
    let loaded: GameState | null = null
    let converted = false
    render(
      <Saves
        state={state}
        onLoad={(s, details) => {
          loaded = s
          converted = details.converted
        }}
        onNewGame={() => {}}
        onBack={() => {}}
      />,
    )
    fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: json } })
    fireEvent.click(screen.getByTestId('saves-import-legacy'))
    expect(loaded).not.toBeNull()
    // Saves reports conversion to its owner, which can keep the acknowledgement alive
    // after this screen unmounts during navigation.
    expect(converted).toBe(true)
  })

  it('the legacy affordance rejects a NON-V1 save as data (no crash)', () => {
    const state = newGame('legacy-reject')
    // A current V11 save is not a V1 save → the legacy path rejects it clearly.
    const currentJson = exportSaveJson(state)
    let loaded = false
    render(
      <Saves
        state={state}
        onLoad={() => {
          loaded = true
        }}
        onNewGame={() => {}}
        onBack={() => {}}
      />,
    )
    fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: currentJson } })
    fireEvent.click(screen.getByTestId('saves-import-legacy'))
    expect(loaded).toBe(false)
    expect(screen.getByRole('alert').textContent ?? '').toMatch(/legacy V1/i)
  })
})

describe('saves: migration disclosure through real App navigation', () => {
  it('shows a one-shot, version-neutral notice after an accepted V8 load leaves Saves', () => {
    openCurrentStudioThroughStart('migration-notice-current')

    fireEvent.click(screen.getByTestId('open-saves'))
    fireEvent.change(screen.getByTestId('saves-import-text'), {
      target: { value: legacyV8SaveJson('migration-notice-v8') },
    })
    fireEvent.click(screen.getByTestId('saves-import'))

    // The accepted load navigated to the imported founded studio's dashboard. The
    // acknowledgement belongs to App, so it remains visible after Saves unmounts.
    expect(screen.getByTestId('dash-week')).toBeInTheDocument()
    expect(screen.queryByTestId('saves-import')).not.toBeInTheDocument()
    const notice = screen.getByTestId('save-migration-notice')
    expect(notice).toHaveTextContent(/older save was upgraded to the current format/i)
    expect(notice).toHaveTextContent(/export now/i)
    expect(notice.textContent ?? '').not.toMatch(/\bV[1-8]\b/i)

    fireEvent.click(screen.getByTestId('save-migration-dismiss'))
    expect(screen.queryByTestId('save-migration-notice')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('open-saves'))
    fireEvent.click(screen.getByTestId('saves-back'))
    expect(screen.queryByTestId('save-migration-notice')).not.toBeInTheDocument()
  })

  it('keeps the live studio and emits no success notice when App rejects an import', () => {
    openCurrentStudioThroughStart('migration-reject-current')
    const weekBefore = screen.getByTestId('dash-week').textContent

    fireEvent.click(screen.getByTestId('open-saves'))
    const exportBefore = (screen.getByTestId('export-text') as HTMLTextAreaElement).value
    fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: '{ broken' } })
    fireEvent.click(screen.getByTestId('saves-import'))

    expect(screen.getByRole('alert')).toHaveTextContent(/rejected/i)
    expect(screen.queryByTestId('save-migration-notice')).not.toBeInTheDocument()
    expect((screen.getByTestId('export-text') as HTMLTextAreaElement).value).toBe(exportBefore)

    fireEvent.click(screen.getByTestId('saves-back'))
    expect(screen.getByTestId('dash-week')).toHaveTextContent(weekBefore ?? '')
    expect(screen.queryByTestId('save-migration-notice')).not.toBeInTheDocument()
  })

  it('carries the same version-neutral notice through a Start-screen V8 import', () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('import-text'), {
      target: { value: legacyV8SaveJson('migration-notice-start-v8') },
    })
    fireEvent.click(screen.getByTestId('import-save'))

    expect(screen.getByTestId('dash-week')).toBeInTheDocument()
    const notice = screen.getByTestId('save-migration-notice')
    expect(notice).toHaveTextContent(/older save was upgraded to the current format/i)
    expect(notice.textContent ?? '').not.toMatch(/\bV[1-8]\b/i)

    const originalConfirm = window.confirm
    window.confirm = () => true
    try {
      fireEvent.click(screen.getByTestId('open-saves'))
      fireEvent.click(screen.getByTestId('restart-game'))
    } finally {
      window.confirm = originalConfirm
    }
    expect(screen.getByTestId('new-game')).toBeInTheDocument()
    expect(screen.queryByTestId('save-migration-notice')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('new-game'))
    expect(screen.getByTestId('founding-intro')).toBeInTheDocument()
    expect(screen.queryByTestId('save-migration-notice')).not.toBeInTheDocument()
  })

  it('discloses migration when App restores an older active-session envelope', () => {
    localStorage.setItem(ACTIVE_SESSION_KEY, legacyV8SaveJson('migration-notice-restore-v8'))
    render(<App />)

    expect(screen.getByTestId('dash-week')).toBeInTheDocument()
    expect(screen.getByTestId('recovery-notice')).toHaveTextContent(/Recovered your studio/i)
    const notice = screen.getByTestId('save-migration-notice')
    expect(notice).toHaveTextContent(/older save was upgraded to the current format/i)
    expect(notice.textContent ?? '').not.toMatch(/\bV[1-8]\b/i)
    fireEvent.click(screen.getByTestId('save-migration-dismiss'))
    expect(screen.queryByTestId('save-migration-notice')).not.toBeInTheDocument()
  })

  it('keeps Start on a rejected import and emits no success notice', () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('import-text'), { target: { value: '{ broken' } })
    fireEvent.click(screen.getByTestId('import-save'))

    expect(screen.getByRole('alert')).toHaveTextContent(/Could not load that save/i)
    expect(screen.getByTestId('new-game')).toBeInTheDocument()
    expect(screen.queryByTestId('save-migration-notice')).not.toBeInTheDocument()
  })
})
