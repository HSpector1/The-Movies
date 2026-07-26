// ── Saves ────────────────────────────────────────────────────────────────────
// Export the current SaveFileV1 as JSON (textarea + copy + download), import (with
// loud, understandable rejection of bad saves), exact restoration + deterministic
// continuation, and a new/restart game control.

import { useMemo, useState } from 'react'
import type { GameState } from '../engine/adapter.ts'
import { exportSaveJson, importSaveJson } from '../engine/adapter.ts'
import { ErrorBox } from '../components/common.tsx'

export function Saves({
  state,
  onLoad,
  onNewGame,
  onBack,
}: {
  state: GameState
  onLoad: (next: GameState) => void
  onNewGame: () => void
  onBack: () => void
}) {
  const exported = useMemo(() => exportSaveJson(state), [state])
  const [importText, setImportText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleDownload() {
    const blob = new Blob([exported], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-studio-${state.seed}-week${state.market.tick}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(exported)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard may be unavailable; the textarea is the fallback (select + copy).
      setCopied(false)
    }
  }

  function handleImport() {
    setError(null)
    const result = importSaveJson(importText)
    if (!result.ok) {
      setError(`This save was rejected: ${result.error}`)
      return
    }
    onLoad(result.state)
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">SAVES</span>
        </div>
        <button className="ghost" onClick={onBack} data-testid="saves-back">
          Back to studio
        </button>
      </div>

      <div className="grid grid-2">
        <div className="card stack">
          <h2>Export</h2>
          <p className="hint">
            This is the exact studio state (seed “{state.seed}”, week {state.market.tick}). Loading it
            restores the studio and continues deterministically.
          </p>
          <textarea
            readOnly
            value={exported}
            rows={10}
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              background: 'var(--bg-inset)',
              color: 'var(--text)',
              border: '1px solid var(--border-strong)',
              borderRadius: 6,
              padding: 10,
            }}
            data-testid="export-text"
          />
          <div className="btn-row">
            <button onClick={handleCopy} data-testid="copy-save">
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleDownload} data-testid="download-save">
              Download
            </button>
          </div>
        </div>

        <div className="card stack">
          <h2>Import</h2>
          <p className="hint">Paste a save to restore it. Malformed or unsupported saves are rejected clearly.</p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={10}
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              background: 'var(--bg-inset)',
              color: 'var(--text)',
              border: '1px solid var(--border-strong)',
              borderRadius: 6,
              padding: 10,
            }}
            data-testid="saves-import-text"
          />
          {error && <ErrorBox message={error} />}
          <div className="btn-row">
            <button
              className="primary"
              onClick={handleImport}
              disabled={importText.trim().length === 0}
              data-testid="saves-import"
            >
              Load save
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="spread">
          <div>
            <h3 style={{ margin: 0 }}>New / restart</h3>
            <p className="hint" style={{ margin: 0 }}>
              Start over from the seed screen. Export first if you want to keep this studio.
            </p>
          </div>
          <button className="danger" onClick={onNewGame} data-testid="restart-game">
            New game
          </button>
        </div>
      </div>
    </div>
  )
}
