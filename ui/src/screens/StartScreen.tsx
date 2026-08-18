// ── Start screen ─────────────────────────────────────────────────────────────
// New game (seed input, sensible default), or import a save. One line noting the
// same seed → same world. No tutorial.
//
// PF1-M3 — THE FRONT DOOR. A STATIC title card, and static on purpose: no timed
// sequence, no camera move, no skippable intro. The only thing that happens on arrival is
// the page being there. (The unlock stinger M1 already provides on the first click is the
// whole of the product's welcome, and it is a consequence of the player acting, not a
// performance played at them.)
//
// The copy is unchanged — it was already in voice. What changed is the composition: the
// title reads as a title, the seed is presented as the world's fingerprint rather than a
// bare form field, and restoring a save is secondary to opening a studio.

import { useState } from 'react'
import type { GameState } from '../engine/adapter.ts'
import { newGame, importSaveJson } from '../engine/adapter.ts'
import { ErrorBox } from '../components/common.tsx'

const DEFAULT_SEED = 'studio-001'

export function StartScreen({
  onStart,
}: {
  onStart: (state: GameState, details: { converted: boolean }) => void
}) {
  const [seed, setSeed] = useState(DEFAULT_SEED)
  const [importText, setImportText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleNew() {
    setError(null)
    const trimmed = seed.trim()
    if (trimmed.length === 0) {
      setError('Enter a seed to start a new studio.')
      return
    }
    onStart(newGame(trimmed), { converted: false })
  }

  function handleImport() {
    setError(null)
    const result = importSaveJson(importText)
    if (!result.ok) {
      setError(`Could not load that save: ${result.error}`)
      return
    }
    onStart(result.state, { converted: result.converted })
  }

  return (
    <div className="app-shell">
      <header className="title-card" data-testid="title-card">
        <span className="title-card-year">Hollywood · 1948</span>
        <h1 className="title-card-mark mark">PROJECT: STUDIO</h1>
        <div className="title-card-rule" aria-hidden="true" />
        <span className="title-card-sub sub">a studio you run one film at a time</span>
      </header>

      <div className="front-door">
        <div className="card stack">
          <h2>New studio</h2>
          <p className="hint">
            The seed sets the whole world — talent, concepts, market. The same seed always
            produces the same world.
          </p>
          <div className="seed-plate">
            <label htmlFor="seed-input">The world</label>
            <input
              id="seed-input"
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              data-testid="seed-input"
            />
          </div>
          <div>
            <button className="accent" onClick={handleNew} data-testid="new-game">
              Open the studio
            </button>
          </div>
        </div>

        <div className="card stack front-door-secondary">
          <h2>Continue from a save</h2>
          <p className="hint">Paste an exported save file to restore a studio exactly.</p>
          <label htmlFor="import-text">Save JSON</label>
          <textarea
            id="import-text"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={6}
            style={{
              fontFamily: 'monospace',
              background: 'var(--bg-inset)',
              color: 'var(--text)',
              border: '1px solid var(--border-strong)',
              borderRadius: 6,
              padding: 10,
            }}
            data-testid="import-text"
          />
          <div>
            <button onClick={handleImport} data-testid="import-save" disabled={importText.trim().length === 0}>
              Load save
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16 }}>
          <ErrorBox message={error} />
        </div>
      )}
    </div>
  )
}
