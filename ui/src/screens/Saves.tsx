// ── Saves ────────────────────────────────────────────────────────────────────
// Export the current save as JSON (textarea + copy + download), import (with
// loud, understandable rejection of bad saves), exact restoration + deterministic
// continuation, and a new/restart game control.
//
// PF1-M3 — SAVE PRESENTATION, THE CHEAP SET. The engine's save layer is untouched: the
// same `exportSaveJson`/`importSaveJson` path, the same envelope, no metadata added. What
// changed is what the player meets first. This screen used to open with a wall of
// serialized state; it now opens with the five facts a studio is recognised by, derived
// from live state (`shell/saveCard.ts`), and the envelope itself waits behind a disclosure.
//
// The raw textarea is COLLAPSED, never unmounted — several pinned suites read its value —
// so the collapsed state clips it out of sight and marks it inert rather than removing it.
//
// A file picker and a drop target join the paste box. All three feed the SAME import
// handler, because there is exactly one way a save is accepted and it is the engine's.

import { useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import type { GameState } from '../engine/adapter.ts'
import { exportSaveJson, importSaveJson, importLegacyV1SaveJson } from '../engine/adapter.ts'
import { ErrorBox } from '../components/common.tsx'
import { deriveSaveCard } from '../shell/saveCard.ts'
import { money } from '../format.ts'

export function Saves({
  state,
  onLoad,
  onNewGame,
  onBack,
}: {
  state: GameState
  onLoad: (next: GameState, details: { converted: boolean }) => void
  onNewGame: () => void
  onBack: () => void
}) {
  const exported = useMemo(() => exportSaveJson(state), [state])
  const card = useMemo(() => deriveSaveCard(state), [state])
  const [importText, setImportText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [rawOpen, setRawOpen] = useState(false)
  const [dropArmed, setDropArmed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // The ONE acceptance path. The picker and the drop target fill the same box and call
  // this same function: a save is accepted by the engine or it is not, and there is no
  // second, weaker route in for a file that arrived a different way.
  function acceptSaveText(text: string) {
    setError(null)
    const result = importSaveJson(text)
    if (!result.ok) {
      setError(`This save was rejected: ${result.error}`)
      return
    }
    // App owns the post-navigation notice. A local notice would unmount in this same
    // event when the accepted save routes away from this screen.
    onLoad(result.state, { converted: result.converted })
  }

  function handleImport() {
    acceptSaveText(importText)
  }

  function readFile(file: File | null | undefined) {
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      setImportText(text)
      acceptSaveText(text)
    }
    reader.onerror = () => {
      setError('That file could not be read. Open it and paste its contents instead.')
    }
    reader.readAsText(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDropArmed(false)
    readFile(event.dataTransfer?.files?.[0])
  }

  // Explicit "Import a legacy V1 save" affordance (D-9.15): converts a legacy save to
  // the current format and clearly tells the player it was converted. The original V1
  // file is never overwritten (this produces a fresh converted state to play).
  function handleImportLegacy() {
    setError(null)
    const result = importLegacyV1SaveJson(importText)
    if (!result.ok) {
      setError(`This is not a valid legacy V1 save: ${result.error}`)
      return
    }
    onLoad(result.state, { converted: result.converted })
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

      <div className="card stack" style={{ marginBottom: 16 }}>
        <h2>This studio</h2>
        <div className="save-card" data-testid="save-card">
          <div className="save-card-field">
            <span className="label">Studio</span>
            <span className="value" data-testid="save-card-studio">{card.studioName}</span>
          </div>
          <div className="save-card-field">
            <span className="label">World seed</span>
            <span className="value mono" data-testid="save-card-seed">{card.seed}</span>
          </div>
          <div className="save-card-field">
            <span className="label">Week</span>
            <span className="value mono" data-testid="save-card-week">{card.week}</span>
          </div>
          <div className="save-card-field">
            <span className="label">Cash</span>
            <span className="value mono" data-testid="save-card-cash">{money(card.cash)}</span>
          </div>
          <div className="save-card-field">
            <span className="label">Films released</span>
            <span className="value mono" data-testid="save-card-films">{card.filmsReleased}</span>
          </div>
        </div>
        <p className="hint">
          A print of this studio restores it exactly — the same world, the same week, the same
          money — and continues from here deterministically.
        </p>
        <div className="btn-row">
          <button onClick={handleCopy} data-testid="copy-save">
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="accent" onClick={handleDownload} data-testid="download-save">
            Export a print
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card stack">
          <h2>The envelope</h2>
          <button
            className="ghost"
            aria-expanded={rawOpen}
            aria-controls="saves-raw-body"
            onClick={() => setRawOpen((open) => !open)}
            data-testid="saves-raw-toggle"
          >
            {rawOpen ? 'Hide raw save data' : 'Show raw save data'}
          </button>
          <div
            id="saves-raw-body"
            className={`save-raw-body stack${rawOpen ? '' : ' is-collapsed'}`}
            data-testid="saves-raw-body"
            data-open={rawOpen ? 'true' : 'false'}
            inert={rawOpen ? undefined : true}
          >
            <p className="hint">
              This is the exact studio state (seed “{state.seed}”, week {state.market.tick}).
              Loading it restores the studio and continues deterministically.
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
          </div>
        </div>

        <div className="card stack">
          <h2>Import</h2>
          <p className="hint">
            Open a print, drop one here, or paste it below. Malformed or unsupported saves are
            rejected clearly.
          </p>
          <div
            className={`save-dropzone stack${dropArmed ? ' is-armed' : ''}`}
            data-testid="saves-dropzone"
            onDragOver={(event) => {
              event.preventDefault()
              setDropArmed(true)
            }}
            onDragLeave={() => setDropArmed(false)}
            onDrop={handleDrop}
          >
            <button
              className="ghost"
              onClick={() => fileInputRef.current?.click()}
              data-testid="saves-open-file"
            >
              Open a save file
            </button>
            <span className="hint">…or drop the file anywhere in this panel.</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="visually-hidden"
              onChange={(event) => {
                readFile(event.target.files?.[0])
                event.target.value = ''
              }}
              data-testid="saves-import-file"
            />
          </div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={8}
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
            <button
              className="ghost"
              onClick={handleImportLegacy}
              disabled={importText.trim().length === 0}
              data-testid="saves-import-legacy"
              title="Convert an older (V1) save to the current format"
            >
              Import legacy V1 save
            </button>
          </div>
          <p className="hint" style={{ fontSize: 11 }}>
            Older saves load automatically and are upgraded to the current format. Use “Import
            legacy V1 save” for the explicit V1-only path; your original file is never overwritten.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="spread">
          <div>
            {/* PF1-M3 VOICE PASS (charter §3). "New / restart" over "Start over from the seed
                screen" was the last of the sterile Export/Import/New/restart register the
                charter named, and "the seed screen" is a name only the codebase uses. The
                mechanic is unchanged: this control returns to the front door and starts over. */}
            <h3 style={{ margin: 0 }}>A new studio</h3>
            <p className="hint" style={{ margin: 0 }}>
              This closes the studio you are running and takes you back to the front door. Export a
              print first if you want to keep it.
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
