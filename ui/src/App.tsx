// ── App root ─────────────────────────────────────────────────────────────────
// One authoritative GameState in React state at the root. Draft (ungreenlit)
// selections live inside the Assembly screen; once greenlit the engine state is
// authoritative. GameState is only ever replaced by an engine action result — never
// mutated. Screen navigation is plain state (no router, no state-management lib).
//
// The full playable loop: Start → Dashboard → Assembly → (greenlight) → Dashboard
//   → Advance week → Release result → Autopsy → Dashboard. Plus Talent creator and
//   Saves, reachable from the dashboard.
//
// Autopsy exactness: the full autopsy needs the PRE-release studio state (the
// releasing Production — removed from activeProductions at release — plus the
// pre-tick standing). We keep, in UI state, a snapshot per film released this
// session ({ preTick, postTickStanding }). This is UI-only bookkeeping (never part
// of GameState/the save) and lets the dashboard open an EXACT autopsy for any film
// released while playing. Films present only in an imported save (released before
// this session) have no snapshot; the dashboard explains that plainly.

import { Component, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import type {
  GameState,
  FilmResult,
  AutopsyView,
  Standing,
  ReleaseDevelopment,
} from './engine/adapter.ts'
import { advanceWeek, explainRelease, buildReleaseDevelopment } from './engine/adapter.ts'
import { StartScreen } from './screens/StartScreen.tsx'
import { Dashboard } from './screens/Dashboard.tsx'
import { Assembly } from './screens/Assembly.tsx'
import { ReleaseResult } from './screens/ReleaseResult.tsx'
import { Autopsy } from './screens/Autopsy.tsx'
import { TalentCreator } from './screens/TalentCreator.tsx'
import { TalentHub } from './screens/TalentHub.tsx'
import { Saves } from './screens/Saves.tsx'

type Screen =
  | { kind: 'start' }
  | { kind: 'dashboard' }
  | { kind: 'assembly' }
  | {
      kind: 'release'
      preTick: GameState
      postTickStanding: Standing
      released: FilmResult[]
      development: ReleaseDevelopment[]
    }
  | { kind: 'autopsy'; view: AutopsyView }
  | { kind: 'talent' }
  | { kind: 'hub' }
  | { kind: 'saves' }

// Per-film pre-release snapshot for exact autopsy reconstruction (UI-only).
type ReleaseSnapshot = { preTick: GameState; postTickStanding: Standing }

// ── Error boundary: unexpected errors → concise dev panel + console log ───────
class DevErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    // Never silently swallow — log for the developer.
    // eslint-disable-next-line no-console
    console.error('Project: Studio — unexpected UI error', error, info)
  }
  reset = () => this.setState({ error: null })
  render() {
    if (this.state.error) {
      return (
        <div className="app-shell">
          <div className="errbox" role="alert" data-testid="dev-error">
            <h3 style={{ marginTop: 0 }}>Something went wrong</h3>
            <p className="mono">{this.state.error.message}</p>
            <p className="hint">The full error is in the browser console.</p>
            <button onClick={this.reset}>Dismiss</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export function App() {
  const [state, setState] = useState<GameState | null>(null)
  const [screen, setScreen] = useState<Screen>({ kind: 'start' })
  // productionId → pre-release snapshot, for exact autopsy of session releases.
  const [snapshots, setSnapshots] = useState<Record<string, ReleaseSnapshot>>({})

  function startGame(next: GameState) {
    setState(next)
    setSnapshots({})
    setScreen({ kind: 'dashboard' })
  }

  function goDashboard() {
    setScreen({ kind: 'dashboard' })
  }

  function handleAdvance() {
    if (!state) return
    // RULING A: advanceWeek ticks with development ON. The engine applies development
    // EXACTLY ONCE inside this single tick; we then replace the authoritative GameState
    // with `next` and never re-tick on re-render — so development is never double-applied.
    const { preTick, next, released } = advanceWeek(state)
    // Build the per-release development summary by DIFFING the pre-tick vs post-tick
    // talent (pure read of two immutable snapshots — no re-run of development).
    const development = buildReleaseDevelopment(preTick, next, released)
    setState(next)
    // Record a per-film snapshot so each release keeps an exact autopsy path.
    if (released.length > 0) {
      setSnapshots((prev) => {
        const merged = { ...prev }
        for (const f of released) {
          merged[f.productionId] = { preTick, postTickStanding: next.studio.standing }
        }
        return merged
      })
    }
    setScreen({
      kind: 'release',
      preTick,
      postTickStanding: next.studio.standing,
      released,
      development,
    })
  }

  // Open the exact autopsy for a film with a retained snapshot (dashboard path).
  function openAutopsyForFilm(film: FilmResult) {
    const snap = snapshots[film.productionId]
    if (!snap) {
      alert(
        'The full autopsy needs the studio state from just before this film released. ' +
          'That snapshot is kept only for films that released while you were playing this session ' +
          '(not for films already released inside an imported save).',
      )
      return
    }
    const view = explainRelease(snap.preTick, snap.postTickStanding, film)
    setScreen({ kind: 'autopsy', view })
  }

  if (!state || screen.kind === 'start') {
    return (
      <DevErrorBoundary>
        <StartScreen onStart={startGame} />
      </DevErrorBoundary>
    )
  }

  return (
    <DevErrorBoundary>
      {screen.kind === 'dashboard' && (
        <Dashboard
          state={state}
          onAssemble={() => setScreen({ kind: 'assembly' })}
          onAdvance={handleAdvance}
          onCreateTalent={() => setScreen({ kind: 'talent' })}
          onOpenHub={() => setScreen({ kind: 'hub' })}
          onSaves={() => setScreen({ kind: 'saves' })}
          onOpenAutopsy={openAutopsyForFilm}
        />
      )}

      {screen.kind === 'assembly' && (
        <Assembly
          state={state}
          onGreenlit={(next) => {
            setState(next)
            goDashboard()
          }}
          onCancel={goDashboard}
        />
      )}

      {screen.kind === 'release' && (
        <ReleaseResult
          preTick={screen.preTick}
          postTickStanding={screen.postTickStanding}
          released={screen.released}
          development={screen.development}
          onOpenAutopsy={(view) => setScreen({ kind: 'autopsy', view })}
          onContinue={goDashboard}
        />
      )}

      {screen.kind === 'autopsy' && <Autopsy view={screen.view} onBack={goDashboard} />}

      {screen.kind === 'talent' && (
        <TalentCreator
          state={state}
          onCreated={(next) => {
            setState(next)
            goDashboard()
          }}
          onBack={goDashboard}
        />
      )}

      {screen.kind === 'hub' && <TalentHub state={state} onBack={goDashboard} />}

      {screen.kind === 'saves' && (
        <Saves
          state={state}
          onLoad={(next) => {
            setState(next)
            setSnapshots({})
            goDashboard()
          }}
          onNewGame={() => {
            setState(null)
            setSnapshots({})
            setScreen({ kind: 'start' })
          }}
          onBack={goDashboard}
        />
      )}
    </DevErrorBoundary>
  )
}
