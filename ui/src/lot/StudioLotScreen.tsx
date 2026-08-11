// ── StudioLotScreen — React host for the Studio Lot overview (Gate D1) ─────────
//
// The host owns the boundary between the authoritative engine and the Phaser lot:
//
//   GameState → studioLotSnapshot(state) → StudioLotView (Phaser) → navigation intents
//
// Phaser is loaded ONLY here, via a dynamic import() inside an effect, so it never
// reaches the eager bundle and is fetched only when the lot is actually opened.
//
// The accessible backbone is the React COMPANION NAVIGATION — a semantic list of every
// destination with its name, current state, and attention, keyboard-operable and
// screen-reader friendly. The canvas is progressive enhancement: if it cannot load
// (e.g. no WebGL), every destination is still reachable from the list. The lot never
// mutates GameState — it only emits navigation intents the host maps to real routes.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameState } from '../engine/adapter.ts'
import { studioLotSnapshot } from '../engine/adapter.ts'
import type { AttentionState, BuildingId, StudioLotSnapshot } from './snapshot/StudioLotSnapshot.ts'
import { ALL_BUILDING_IDS, BUILDING_ACTION, BUILDING_LABELS } from './snapshot/StudioLotSnapshot.ts'
import { lotStageAssignment } from './snapshot/stageAssignment.ts'
import { BUILDING_BLURBS, resolveAction, type LotRoute } from './navigation.ts'
import type { LotActionEvent, SelectionInfo, StudioLotView as StudioLotViewClass } from './StudioLotView.ts'
import {
  studioLotIdentityEnabled,
  studioLotIdentityProofEnabled,
  studioLotSoundstagesEnabled,
  studioLotSoundstageProofEnabled,
  studioLotAuthoredStageEnabled,
  studioLotAuthoredStageAEnabled,
} from '../flags.ts'
import type { IdentityMode } from './identity/manifest.ts'
import './lot.css'

// ── D1-A studio-identity review modes ────────────────────────────────────────────
// A dev-only selector, shown ONLY when the identity-proof flag is on. It drives the
// renderer's identity mode + reduced-motion for owner review. It changes nothing in the
// simulation and persists nothing — pure presentation. The set is fixed by the directive:
// { Current D1 baseline, Concept A, Fallback mode, Reduced-motion mode }.
type ReviewKey = 'baseline' | 'concept-a' | 'fallback' | 'reduced'
const REVIEW_MODES: ReadonlyArray<{
  key: ReviewKey
  label: string
  identity: IdentityMode
  reduced: boolean
}> = [
  { key: 'baseline', label: 'Current D1 baseline', identity: 'baseline', reduced: false },
  { key: 'concept-a', label: 'Concept A — Golden Age Deco', identity: 'concept-a', reduced: false },
  { key: 'fallback', label: 'Fallback mode', identity: 'fallback', reduced: false },
  { key: 'reduced', label: 'Reduced-motion mode', identity: 'concept-a', reduced: true },
]

type Props = {
  state: GameState
  /** Host maps a lot route to the existing app navigation (setScreen). */
  onNavigate: (route: LotRoute) => void
  /** Return to the normal Dashboard. */
  onExit: () => void
}

// Session-level selection memory. This is UI session state — NOT GameState, NOT
// SaveFileV4 (directive Phase 13). It survives lot↔React navigation within one page
// session and resets on a full reload.
let sessionSelectedBuilding: BuildingId | null = null

// Stage assignment memory. Same kind of UI session state as the selection above — NOT
// GameState, NOT SaveFileV4 — and it MUST outlive this screen, because the way a player
// advances a week is to leave the lot, tick, and come back; a per-mount instance would
// forget every held stage on the way out and the migration defect would reappear on
// re-entry. It is owned by the module that defines it, so that its lifetime can END with
// the loaded game rather than with the page: App.tsx calls resetLotStageAssignment() at the
// new-studio and loaded-save boundaries. See snapshot/stageAssignment.ts.

// Attention → icon + word. Every state is communicated with text + shape + colour
// (addendum §7) — never colour alone. The class drives the colour in lot.css.
const ATTENTION_META: Record<AttentionState, { icon: string; word: string }> = {
  normal: { icon: '•', word: 'Open' },
  active: { icon: '▶', word: 'Active' },
  positive: { icon: '✓', word: 'Positive' },
  warning: { icon: '⚠', word: 'Warning' },
  'decision-required': { icon: '!', word: 'Decision required' },
  empty: { icon: '○', word: 'Available' },
  future: { icon: '◇', word: 'Future' },
  'recently-completed': { icon: '✓', word: 'Recently completed' },
}

function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function StudioLotScreen({ state, onNavigate, onExit }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<StudioLotViewClass | null>(null)
  const onNavigateRef = useRef(onNavigate)
  onNavigateRef.current = onNavigate

  const [selected, setSelected] = useState<BuildingId | null>(sessionSelectedBuilding)
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null)
  const [expansionOpen, setExpansionOpen] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasFailed, setCanvasFailed] = useState(false)
  const [reducedMotion, setReducedMotionState] = useState(prefersReducedMotion)

  // ── Identity gating: two INDEPENDENT capabilities (owner ruling: player enablement) ──────
  // `playerIdentity` is the ORDINARY-PLAYER content gate (default ON): it shows the approved
  // Concept A identity to normal players and renders NO development chrome. `identityProof` is the
  // separate DEV-ONLY review gate (default OFF): it alone renders the review controls (mode
  // selector, performance panel, Hide/restore) and lets a reviewer temporarily select
  // baseline / fallback / reduced modes. They come from different flags and switch independently;
  // the scene supports both through the same setIdentityMode(). See ../flags.ts.
  const identityProof = studioLotIdentityProofEnabled()
  const playerIdentity = studioLotIdentityEnabled()
  const [reviewKey, setReviewKey] = useState<ReviewKey>('concept-a')
  const [reviewHidden, setReviewHidden] = useState(false)
  const [perf, setPerf] = useState<{
    fps: number
    displayObjects: number
    identityObjects: number
    /** Authored-proof diagnostics — dev panel only, never player-facing. */
    stageBTexture: string
    authoredStageActive: boolean
    /** Authored Stage A diagnostics — dev panel only, never player-facing. */
    stageATexture: string
    authoredStageAActive: boolean
    authoredStageALoadFailed: boolean
  } | null>(null)
  const activeReview = REVIEW_MODES.find((m) => m.key === reviewKey) ?? REVIEW_MODES[1]

  // The identity actually rendered, and whether motion is reduced:
  //  • dev review ON  → the reviewer's selected mode drives it;
  //  • dev review OFF → ordinary player: Concept A by default, or the untouched baseline when the
  //                     explicit player-identity rollback is set. No review chrome either way.
  const effectiveIdentity: IdentityMode = identityProof
    ? activeReview.identity
    : playerIdentity
      ? 'concept-a'
      : 'baseline'
  const effectiveReduced = identityProof ? reducedMotion || activeReview.reduced : reducedMotion

  // ── D1-B soundstages: visual content, and stage-assignment correctness ──────────────
  // TWO INDEPENDENT THINGS, deliberately not tied together:
  //
  //  • `soundstages` is the VISUAL CONTENT gate (default ON, explicit rollback available).
  //  • the stable stage assignment below is a CORRECTNESS fix and is NOT gated at all.
  //    Which building a production appears on must not depend on which stage art is
  //    enabled, so the resolver runs on every path — including the rollback path.
  //
  // The correction lives HERE, above both the Phaser scene and the DOM companion
  // navigation, so the two can never disagree about which stage is busy.
  const soundstages = studioLotSoundstagesEnabled()
  // D1-B review tooling, default OFF and independent of the content gate. It adds only
  // capture affordances for the evidence harness — no game content, never a player default.
  const soundstageProof = studioLotSoundstageProofEnabled()
  // Authored Soundstage Pipeline Proof, default OFF. With it off the scene fetches no
  // image and Stage B is the procedural build exactly as in production.
  const authoredStage = studioLotAuthoredStageEnabled()
  // Authored Stage A H2 proof, default OFF. With it off the scene fetches no H2 image and
  // Stage A is the procedural build exactly as in production.
  const authoredStageA = studioLotAuthoredStageAEnabled()
  const [signageMasked, setSignageMasked] = useState(false)
  const [closerCamera, setCloserCamera] = useState(false)
  const readSnapshot = useCallback((s: GameState): StudioLotSnapshot => {
    // Ungated on purpose — see above.
    return lotStageAssignment.resolve(studioLotSnapshot(s))
  }, [])

  const snapshot = readSnapshot(state)

  const recordSelection = useCallback((id: BuildingId | null) => {
    sessionSelectedBuilding = id
    setSelected(id)
  }, [])

  const dispatchRoute = useCallback((action: LotActionEvent['action']) => {
    const res = resolveAction(action)
    if (res.route.kind === 'expansion-info') {
      setExpansionOpen(true)
      return
    }
    onNavigateRef.current(res.route)
  }, [])

  // ── Create the Phaser view exactly once, lazily. Destroy on unmount. ─────────
  useEffect(() => {
    let cancelled = false
    let view: StudioLotViewClass | null = null
    const parent = mountRef.current
    if (!parent) return

    import('./StudioLotView.ts')
      .then(({ StudioLotView }) => {
        if (cancelled || !mountRef.current) return
        view = new StudioLotView({
          parent: mountRef.current,
          distinctStages: soundstages,
          authoredStage,
          authoredStageA,
          snapshot: { ...readSnapshot(state), selectedBuildingId: sessionSelectedBuilding },
          onSelect: (sel) => {
            setSelectionInfo(sel)
            recordSelection(sel?.buildingId ?? null)
          },
          onAction: (e) => dispatchRoute(e.action),
          onReady: () => {
            if (cancelled) return
            setCanvasReady(true)
            if (sessionSelectedBuilding) view?.select(sessionSelectedBuilding)
            if (reducedMotion) view?.setReducedMotion(true)
          },
        })
        viewRef.current = view
      })
      .catch(() => {
        // Canvas unavailable (no WebGL / jsdom). The companion navigation remains
        // fully functional — the lot degrades to the accessible list.
        if (!cancelled) setCanvasFailed(true)
      })

    return () => {
      cancelled = true
      view?.destroy()
      viewRef.current = null
    }
    // Intentionally run once: the view is created a single time and fed new snapshots
    // by the effect below. state/callbacks are read via refs / fresh selector calls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Feed the live view new authoritative facts whenever GameState changes. ───
  useEffect(() => {
    const v = viewRef.current
    if (v && canvasReady) {
      v.setSnapshot({ ...readSnapshot(state), selectedBuildingId: sessionSelectedBuilding })
    }
  }, [state, canvasReady, readSnapshot])

  // ── Pause when the tab is hidden; resume when visible (no CPU while backgrounded). ─
  useEffect(() => {
    function onVisibility() {
      const v = viewRef.current
      if (!v) return
      if (typeof document !== 'undefined' && document.hidden) v.pause()
      else v.resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Honour a live change to the OS reduced-motion preference.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const onChange = () => setReducedMotionState(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  // ── Drive the scene's identity + reduced-motion from the effective values above. ─────────
  // One path for BOTH capabilities: the ordinary player gets Concept A (or the rollback baseline)
  // with no chrome, and when the dev review flag is on the selector drives the mode instead.
  useEffect(() => {
    if (!canvasReady) return
    const v = viewRef.current
    v?.setIdentityMode(effectiveIdentity)
    v?.setReducedMotion(effectiveReduced)
  }, [canvasReady, effectiveIdentity, effectiveReduced])

  // ── D1-B review tooling: signage mask + closer framing. Both no-ops unless the
  // soundstage proof gate is on, so nothing here can reach an ordinary player. The camera
  // call reuses the existing 'production' preset — no new camera system.
  useEffect(() => {
    // With the proof gate off this must not touch the view at all — review tooling is
    // inert, not merely passing `false`.
    if (!canvasReady || !soundstageProof) return
    viewRef.current?.setSignageMasked(signageMasked)
  }, [canvasReady, soundstageProof, signageMasked])

  useEffect(() => {
    if (!canvasReady || !soundstageProof) return
    viewRef.current?.camera(closerCamera ? 'production' : 'overview')
  }, [canvasReady, soundstageProof, closerCamera])

  // ── D1-A: poll coarse runtime stats for the dev performance panel. ───────────
  useEffect(() => {
    if (!identityProof || !canvasReady) return
    const tick = () => {
      const d = viewRef.current?.identityDebug()
      // optional-call: test doubles for the view do not implement the debug accessor
      const dbg = viewRef.current?.getDebugState?.()
      if (d)
        setPerf({
          fps: d.fps,
          displayObjects: d.displayObjects,
          identityObjects: d.identityObjects,
          stageBTexture: dbg?.stageBTexture ?? '',
          authoredStageActive: dbg?.authoredStageActive === true,
          stageATexture: dbg?.stageATexture ?? '',
          authoredStageAActive: dbg?.authoredStageAActive === true,
          authoredStageALoadFailed: dbg?.authoredStageALoadFailed === true,
        })
    }
    const h = window.setInterval(tick, 500)
    tick()
    return () => window.clearInterval(h)
  }, [identityProof, canvasReady])

  // Companion-nav activation: select the building AND route to its destination.
  const activate = useCallback(
    (id: BuildingId) => {
      recordSelection(id)
      viewRef.current?.select(id)
      dispatchRoute(BUILDING_ACTION[id])
    },
    [dispatchRoute, recordSelection],
  )

  // With the review signage mask on, the companion list must not print the answer the
  // canvas is being masked to hide. Only the stage NAME is neutralised — attention state
  // and the production reason stay, so the list still shows the lot in its real context.
  const maskNames = soundstageProof && signageMasked
  /** Drop the letter from any string that names a stage, while the review mask is on. */
  const maskStageText = (text: string): string =>
    maskNames
      ? text.replace(/\b(Sound)?[Ss]tage [AB]\b/g, (m) => (m.startsWith('Sound') ? 'Soundstage' : 'Stage'))
      : text
  const rows = ALL_BUILDING_IDS.map((id) => {
    const b = snapshot.buildings.find((x) => x.id === id)
    const attention: AttentionState = b?.attention ?? 'normal'
    const meta = ATTENTION_META[attention]
    const stateText = b?.attentionReason ?? meta.word
    const isStage = id === 'stage-a' || id === 'stage-b'
    const label = maskNames && isStage ? 'Soundstage' : BUILDING_LABELS[id]
    return { id, label, attention, meta, stateText }
  })

  return (
    <div
      className={`lot-screen${reducedMotion ? ' lot-reduced-motion' : ''}`}
      data-testid="studio-lot-screen"
    >
      <header className="lot-topbar">
        <div className="lot-brand">
          <span className="mark">{snapshot.studioName}</span>
          <span className="lot-sub">Studio Lot · Week {snapshot.week}</span>
        </div>
        <div className="lot-topbar-actions">
          <span className="lot-cash" data-testid="lot-cash">
            {snapshot.cash < 0 ? '-' : ''}${Math.abs(Math.round(snapshot.cash)).toLocaleString('en-US')}
          </span>
          <button className="primary" onClick={onExit} data-testid="lot-return-dashboard">
            Return to Dashboard
          </button>
        </div>
      </header>

      <div className="lot-body">
        <div className="lot-stage-wrap">
          {/* The canvas is decorative; the companion navigation is the accessible truth. */}
          <div ref={mountRef} className="lot-canvas" data-testid="studio-lot-canvas" aria-hidden="true" />

          {identityProof && !reviewHidden && (
            <div
              className="lot-review-bar"
              data-testid="lot-review-mode"
              role="group"
              aria-label="Studio identity review mode (development only)"
            >
              <span className="lot-review-title">Identity review</span>
              <div className="lot-review-opts">
                {REVIEW_MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    className={`lot-review-opt${reviewKey === m.key ? ' is-active' : ''}`}
                    data-testid={`lot-review-${m.key}`}
                    aria-pressed={reviewKey === m.key}
                    onClick={() => setReviewKey(m.key)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {perf && (
                <span
                  className="lot-review-perf"
                  data-testid="lot-perf-panel"
                  role="status"
                  data-stage-b-texture={perf.stageBTexture}
                  data-authored-stage={perf.authoredStageActive ? "1" : "0"}
                  data-stage-a-texture={perf.stageATexture}
                  data-authored-stage-a={perf.authoredStageAActive ? "1" : "0"}
                  data-authored-stage-a-failed={perf.authoredStageALoadFailed ? "1" : "0"}
                >
                  {perf.fps} fps · {perf.displayObjects} objects · {perf.identityObjects} identity
                </span>
              )}
              <button
                type="button"
                className="lot-review-hide"
                data-testid="lot-review-hide"
                onClick={() => setReviewHidden(true)}
                aria-label="Hide the identity review overlay for a clean view"
              >
                Hide
              </button>
            </div>
          )}
          {soundstageProof && !reviewHidden && (
            <div
              className="lot-review-bar lot-review-bar-d1b"
              data-testid="lot-soundstage-review"
              role="group"
              aria-label="Soundstage proof review tools (development only)"
            >
              <span className="lot-review-title">Soundstage proof</span>
              <div className="lot-review-opts">
                <button
                  type="button"
                  className={`lot-review-opt${signageMasked ? ' is-active' : ''}`}
                  data-testid="lot-review-mask-signage"
                  aria-pressed={signageMasked}
                  onClick={() => setSignageMasked((v) => !v)}
                >
                  Mask stage signage
                </button>
                <button
                  type="button"
                  className={`lot-review-opt${closerCamera ? ' is-active' : ''}`}
                  data-testid="lot-review-closer"
                  aria-pressed={closerCamera}
                  onClick={() => setCloserCamera((v) => !v)}
                >
                  Closer framing
                </button>
              </div>
            </div>
          )}
          {identityProof && reviewHidden && (
            <button
              type="button"
              className="lot-review-show"
              data-testid="lot-review-show"
              onClick={() => setReviewHidden(false)}
            >
              Identity review ▸
            </button>
          )}
          {!canvasReady && !canvasFailed && (
            <div className="lot-canvas-note" role="status">
              Preparing the lot…
            </div>
          )}
          {canvasFailed && (
            <div className="lot-canvas-note" role="status" data-testid="lot-canvas-fallback">
              The visual lot could not load here. Every destination is available in the list.
            </div>
          )}

          {selectionInfo && (
            <div className="lot-selection card" role="dialog" aria-label={`${selectionInfo.label} details`} data-testid="lot-selection-panel">
              <div className="spread">
                <h3 style={{ margin: 0 }}>{maskStageText(selectionInfo.label)}</h3>
                <button className="ghost" onClick={() => { setSelectionInfo(null); viewRef.current?.clearSelection(); recordSelection(null) }} aria-label="Close details">
                  ✕
                </button>
              </div>
              <p className="hint" style={{ marginTop: 8 }}>{maskStageText(selectionInfo.blurb)}</p>
              <button
                className="accent"
                data-testid="lot-selection-open"
                onClick={() => dispatchRoute(selectionInfo.action)}
              >
                {resolveAction(selectionInfo.action).navLabel}
              </button>
            </div>
          )}

          {expansionOpen && (
            <div className="lot-selection card" role="dialog" aria-label="Future studio expansion" data-testid="lot-expansion-info">
              <div className="spread">
                <h3 style={{ margin: 0 }}>Future studio expansion</h3>
                <button className="ghost" onClick={() => setExpansionOpen(false)} aria-label="Close">
                  ✕
                </button>
              </div>
              <p className="hint" style={{ marginTop: 8 }}>
                Reserved for future studio growth. Not available in D1.
              </p>
            </div>
          )}
        </div>

        <nav className="lot-companion" aria-label="Studio lot destinations" data-testid="lot-companion-nav">
          <h2 className="lot-companion-title">Studio Lot</h2>
          <p className="hint lot-companion-hint">
            Every destination is reachable here or by clicking the lot.
          </p>
          <ul className="lot-nav-list">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className={`lot-nav-item att-${row.attention}${selected === row.id ? ' is-selected' : ''}`}
                  data-testid={`lot-nav-${row.id}`}
                  data-attention={row.attention}
                  aria-current={selected === row.id ? 'true' : undefined}
                  onClick={() => activate(row.id)}
                  title={BUILDING_BLURBS[row.id]}
                >
                  <span className="lot-nav-name">{row.label}</span>
                  <span className="lot-nav-state" data-testid={`lot-nav-${row.id}-state`}>
                    <span className="lot-nav-icon" aria-hidden="true">{row.meta.icon}</span>
                    <span className="lot-nav-att-word visually-hidden">{row.meta.word}: </span>
                    {row.stateText}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default StudioLotScreen
