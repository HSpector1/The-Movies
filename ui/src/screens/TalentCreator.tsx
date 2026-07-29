// ── Talent creator (§10 / D-11.C) — staged authored-talent flow ──────────────
// The wrapper owns the mode toggle and swaps editors:
//   • Balanced Career (default) — the SPECIALIZATION flow (D-11.C): archetype preset +
//     a fixed 40-point allocation, potential/work-ethic as a separate tradeoff, OVR
//     DERIVED by the engine. A Balanced person is a prospect, not an instant star.
//   • Full Custom — unrestricted direct-attribute authoring (UNCHANGED here).
//
// The engine is the sole validator (createBalancedTalent / createCustomTalent return
// rejections as DATA, surfaced loudly). OVR is never an input. Fit is never shown here
// (it depends on the specific film/assignment). No Math.random anywhere.

import { useState } from 'react'
import type { GameState } from '../engine/adapter.ts'
import { BalancedCareerCreator } from '../components/creator/BalancedCareerCreator.tsx'
import { FullCustomCreator } from '../components/creator/FullCustomCreator.tsx'

// ── Creator mode (D-11.A A3): Balanced Career (default) vs Full Custom ────────
type CreatorMode = 'balanced' | 'full'

// A shared segmented control at the top of the creator. Switching swaps which
// editor renders. Kept identical in both topbars so the toggle never moves.
function ModeToggle({ mode, onMode }: { mode: CreatorMode; onMode: (m: CreatorMode) => void }) {
  return (
    <div className="btn-row" data-testid="creator-mode-toggle" role="group" aria-label="Creator mode">
      <button
        type="button"
        className={mode === 'balanced' ? 'primary' : 'ghost'}
        aria-pressed={mode === 'balanced'}
        onClick={() => onMode('balanced')}
        data-testid="creator-mode-balanced"
      >
        Balanced Career
      </button>
      <button
        type="button"
        className={mode === 'full' ? 'primary' : 'ghost'}
        aria-pressed={mode === 'full'}
        onClick={() => onMode('full')}
        data-testid="creator-mode-full"
      >
        Full Custom
      </button>
    </div>
  )
}

// The exported screen: owns the mode toggle and swaps editors. Balanced is default.
// The topbar + toggle are identical in both modes so the toggle never moves.
export function TalentCreator({
  state,
  onCreated,
  onBack,
}: {
  state: GameState
  onCreated: (next: GameState) => void
  onBack: () => void
}) {
  const [mode, setMode] = useState<CreatorMode>('balanced')

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">CREATE TALENT</span>
        </div>
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          <ModeToggle mode={mode} onMode={setMode} />
          <button className="ghost" onClick={onBack} data-testid="talent-creator-back">
            Back to studio
          </button>
        </div>
      </div>
      {mode === 'full' ? (
        <FullCustomCreator state={state} onCreated={onCreated} />
      ) : (
        <BalancedCareerCreator state={state} onCreated={onCreated} />
      )}
    </div>
  )
}
