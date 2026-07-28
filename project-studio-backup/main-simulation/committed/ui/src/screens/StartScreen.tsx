// ── Start screen ─────────────────────────────────────────────────────────────
// New game (seed input, sensible default), or import a save. One line noting the
// same seed → same world. No tutorial.

import { useState } from 'react'
import type { GameState } from '../engine/adapter.ts'
import { newGame, importSaveJson } from '../engine/adapter.ts'
import { ErrorBox } from '../components/common.tsx'

const DEFAULT_SEED = 'studio-001'

export function StartScreen({ onStart }: { onStart: (state: GameState) => void }) {
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
    onStart(newGame(trimmed))
  }

  function handleImport() {
    setError(null)
    const result = importSaveJson(importText)
    if (!result.ok) {
      setError(`Could not load that save: ${result.error}`)
      return
    }
    onStart(result.state)
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">PROJECT: STUDIO</span>
          <span className="sub">a studio you run one film at a time</span>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card stack">
          <h2>New studio</h2>
          <p className="hint">
            The seed sets the whole world — talent, concepts, market. The same seed always
            produces the same world.
          </p>
          <label htmlFor="seed-input">Seed</label>
          <input
            id="seed-input"
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            data-testid="seed-input"
          />
          <div>
            <button className="accent" onClick={handleNew} data-testid="new-game">
              Open the studio
            </button>
          </div>
        </div>

        <div className="card stack">
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
