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
    <div className="studio-start">
      <div className="start-backdrop" />
      <header className="start-header">
        <div className="studio-wordmark static">
          <span className="studio-monogram">S</span>
          <span>
            <strong>SILVERLINE</strong>
            <small>MOTION PICTURE STUDIOS</small>
          </span>
        </div>
        <span className="start-build">INTERACTIVE 3D PROTOTYPE · 01</span>
      </header>

      <main className="start-content">
        <div className="start-copy">
          <span className="eyebrow">BUILD THE LOT · FIND THE STARS · MAKE THE PICTURE</span>
          <h1>Make movies.<br /><em>Make history.</em></h1>
          <p>
            Run an original golden-age studio from the first greenlight to opening night—now with
            a living 3D lot, grounded scene intelligence and autonomous production units.
          </p>
          <div className="feature-ribbon">
            <span><b>01</b> Generative sets</span>
            <span><b>02</b> Spatial reasoning</span>
            <span><b>03</b> Embodied crews</span>
          </div>
        </div>

        <div className="start-panel">
          <span className="eyebrow">OPEN THE GATES</span>
          <h2>Name your studio world</h2>
          <p>The seed creates its talent, concepts and market. Use it again to replay the same world.</p>
          <label htmlFor="seed-input">World seed</label>
          <input
            id="seed-input"
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            data-testid="seed-input"
          />
          <button className="button-brass start-button" onClick={handleNew} data-testid="new-game">
            Enter Silverline Studios <span>→</span>
          </button>

          <details className="continue-details">
            <summary>Continue from a save</summary>
            <label htmlFor="import-text">Save JSON</label>
            <textarea
              id="import-text"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={5}
              data-testid="import-text"
            />
            <button className="button-dark" onClick={handleImport} data-testid="import-save" disabled={importText.trim().length === 0}>
              Load studio save
            </button>
          </details>

          {error && <ErrorBox message={error} />}
        </div>
      </main>

      <footer className="start-footer">
        <span>AN ORIGINAL STUDIO MANAGEMENT PROTOTYPE</span>
        <span>ART ASSET STORED WITH GIT LFS</span>
      </footer>
    </div>
  )
}
