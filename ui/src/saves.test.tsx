// ── INDEPENDENT saves suite ──────────────────────────────────────────────────
// Governing rule (Phase-5 authorization / contract §17):
//   • export → import round-trips exact state (serialized form equals original) and
//     continues deterministically.
//   • Malformed / unsupported saves are rejected LOUDLY and understandably —
//     surfaced to the UI, never a crash.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { Saves } from './screens/Saves.tsx'
import { StartScreen } from './screens/StartScreen.tsx'
import {
  newGame,
  exportSaveJson,
  importSaveJson,
  greenlight,
  advanceWeek,
  requiredNegative,
  talentByRole,
} from './engine/adapter.ts'
import { stableStringify } from '../../src/core/index.ts'
import type { DraftPackage, GameState } from './engine/adapter.ts'

afterEach(cleanup)

function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const writer = talentByRole(state, 'writer').find((t) => t.available)!
  const director = talentByRole(state, 'director').find((t) => t.available)!
  const actors = talentByRole(state, 'actor').filter((t) => t.available)
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: writer.id,
    directorId: director.id,
    craftIds: [],
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

describe('saves: export → import round-trips the EXACT state', () => {
  it('importSaveJson(exportSaveJson(state)) has a serialized form equal to the original', () => {
    let state = newGame('save-roundtrip-1')
    // Exercise a non-trivial mid-game state (greenlit production + a few ticks).
    const g = greenlight(state, legalPackage(state))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next
    state = advanceWeek(state).next
    state = advanceWeek(state).next

    const json = exportSaveJson(state)
    const r = importSaveJson(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // Byte-equal serialized state (stable-stringify both, order-independent).
    expect(stableStringify(r.state)).toBe(stableStringify(state))
  })

  it('a restored state continues deterministically (same next tick as the original)', () => {
    let state = newGame('save-roundtrip-2')
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
