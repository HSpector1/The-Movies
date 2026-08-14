// ── StudioLotScreen — React host for the Studio Lot overview (Gate D1) ─────────
//
// The host owns the boundary between the authoritative engine and the Phaser lot:
//
//   GameState → studioLotSnapshot(state) → StudioLotView (Phaser) → navigation intents
//
// Phaser is loaded ONLY here, via a dynamic import() inside an effect, so it never
// reaches the eager bundle and is fetched only when the lot is actually opened.
//
// The canvas is the primary visual pointer surface. The React companion supplies the
// equivalent semantic controls and complete renderer-failure path because a Phaser
// canvas cannot expose a reliable accessibility tree. Neither surface owns GameState:
// they emit identity/intent and the host dispatches only engine-projected commands.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ActionOutcome, GameState } from '../engine/adapter.ts'
import { publicityDecision, runPublicity, studioLotSnapshot } from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'
import type {
  AttentionState,
  BuildingId,
  LotPersonState,
  LotProductionCommand,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'
import { ALL_BUILDING_IDS, BUILDING_ACTION, BUILDING_LABELS } from './snapshot/StudioLotSnapshot.ts'
import { lotStageAssignment } from './snapshot/stageAssignment.ts'
import { BUILDING_BLURBS, resolveAction, type LotRoute } from './navigation.ts'
import type { LotActionEvent, SelectionInfo, StudioLotView as StudioLotViewClass } from './StudioLotView.ts'
import type {
  HollywoodPerformance,
  HollywoodPlaceSelection,
  HollywoodProductionSelection,
} from './hollywood/HollywoodScene.ts'
import {
  studioLotIdentityEnabled,
  studioLotIdentityProofEnabled,
  studioLotSoundstagesEnabled,
  studioLotSoundstageProofEnabled,
  studioLotAuthoredStageEnabled,
  studioLotAuthoredStageAEnabled,
  operationHollywoodEnabled,
} from '../flags.ts'
import type { IdentityMode } from './identity/manifest.ts'

// Phaser listens for mouse and touch input at window level. Contain every down
// event family from React overlays so a desk command cannot also select the
// building geometrically underneath it and unmount before the later `click`.
const containWorldInput = (event: { stopPropagation(): void }) => {
  event.stopPropagation()
}
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
  /** The host replaces the authoritative state only after a successful real engine action. */
  onStateChange?: (state: GameState) => void
  /** Dispatch exactly the command projected by the authoritative operations read model. */
  onProductionCommand?: (command: LotProductionCommand) => ActionOutcome | void
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

export function StudioLotScreen({
  state,
  onNavigate,
  onExit,
  onStateChange,
  onProductionCommand,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<StudioLotViewClass | null>(null)
  const onNavigateRef = useRef(onNavigate)
  onNavigateRef.current = onNavigate

  const [selected, setSelected] = useState<BuildingId | null>(sessionSelectedBuilding)
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasFailed, setCanvasFailed] = useState(false)
  const [reducedMotion, setReducedMotionState] = useState(prefersReducedMotion)
  const hollywood = operationHollywoodEnabled()
  const [hollywoodPerson, setHollywoodPerson] = useState<LotPersonState | null>(null)
  const [hollywoodPlace, setHollywoodPlace] = useState<HollywoodPlaceSelection | null>(null)
  const [hollywoodProductionId, setHollywoodProductionId] = useState<string | null>(null)
  const [hollywoodActivity, setHollywoodActivity] = useState<string | null>(null)
  const [hollywoodPerf, setHollywoodPerf] = useState<HollywoodPerformance | null>(null)
  const hollywoodCommandRef = useRef<HTMLButtonElement | null>(null)
  const hollywoodTaskStatusRef = useRef<HTMLDivElement | null>(null)
  const pendingHollywoodFocusProductionId = useRef<string | null>(null)
  const whisperOffer = publicityDecision(state).find((offer) => offer.tier === 'whisper')

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
  const expansionFact = snapshot.buildings.find((building) => building.id === 'expansion')
  const [operationalAnnouncement, setOperationalAnnouncement] = useState('')
  const hollywoodOperations = snapshot.productionOperations ?? []
  const latestSnapshotRef = useRef(snapshot)
  latestSnapshotRef.current = snapshot
  const hasManagedEngineOperations =
    snapshot.operationsMode === 'managed' && snapshot.stageAssignmentAuthority === 'engine'
  const hollywoodStage7Operation =
    hasManagedEngineOperations
      ? hollywoodOperations.find((operation) => operation.locationBuildingId === 'stage-a') ?? null
      : null
  const explicitlySelectedHollywoodOperation = hollywoodProductionId === null
    ? null
    : hollywoodOperations.find((operation) => operation.productionId === hollywoodProductionId) ?? null
  const hollywoodOperation: ProductionOperationsState | null =
    hollywoodProductionId === null
      ? hasManagedEngineOperations
        ? hollywoodStage7Operation ?? (hollywoodOperations.length === 1 ? hollywoodOperations[0]! : null)
        : hollywoodOperations[0] ?? null
      : explicitlySelectedHollywoodOperation
  const renderedHollywoodProductionIdRef = useRef<string | null>(hollywoodOperation?.productionId ?? null)
  renderedHollywoodProductionIdRef.current = hollywoodOperation?.productionId ?? null

  const enterHollywoodProductionContext = useCallback((
    productionId: string,
    options: { stage7Only: boolean; focus: boolean },
  ): boolean => {
    const current = latestSnapshotRef.current
    if (
      options.stage7Only &&
      (current.operationsMode !== 'managed' || current.stageAssignmentAuthority !== 'engine')
    ) return false
    const exact = (current.productionOperations ?? []).find(
      (operation) => operation.productionId === productionId &&
        (!options.stage7Only || operation.locationBuildingId === 'stage-a'),
    )
    if (!exact) return false

    setHollywoodProductionId(exact.productionId)
    setHollywoodPerson(null)
    setHollywoodPlace(null)
    viewRef.current?.clearHollywoodPersonSelection()
    viewRef.current?.clearHollywoodPlaceSelection()
    if (exact.locationBuildingId === 'stage-a') {
      viewRef.current?.selectHollywoodProduction(exact.productionId)
    }
    if (options.focus) {
      pendingHollywoodFocusProductionId.current = exact.productionId
      queueMicrotask(() => {
        if (
          pendingHollywoodFocusProductionId.current !== exact.productionId ||
          renderedHollywoodProductionIdRef.current !== exact.productionId
        ) return
        const target = exact.currentCommand
          ? hollywoodCommandRef.current
          : hollywoodTaskStatusRef.current
        if (!target) return
        target.focus()
        pendingHollywoodFocusProductionId.current = null
      })
    }
    return true
  }, [])

  const recordHollywoodProduction = useCallback((
    production: HollywoodProductionSelection,
  ) => {
    if (production.locationBuildingId !== 'stage-a') return
    enterHollywoodProductionContext(production.productionId, { stage7Only: true, focus: true })
  }, [enterHollywoodProductionContext])

  useEffect(() => {
    const capacity = expansionFact?.attentionReason?.replace(/^Annex operational · /, '')
    setOperationalAnnouncement(
      expansionFact?.constructionStatus === 'operational'
        ? `Development & Casting Annex is Operational. Development & Casting capacity is now ${capacity ?? 'available with one additional shared slot'}.`
        : '',
    )
  }, [expansionFact?.attentionReason, expansionFact?.constructionStatus])

  const recordHollywoodPerson = useCallback((person: LotPersonState | null) => {
    setHollywoodPerson(person)
    if (person !== null) {
      setHollywoodPlace(null)
      viewRef.current?.clearHollywoodPlaceSelection()
    }
    if (
      person?.authority === 'active-production' &&
      person.productionId !== null
    ) {
      // A person and their task chain are one inspector context. Selecting the real
      // director/lead of Film B must never leave Film A's command underneath their name.
      setHollywoodProductionId(person.productionId)
    }
  }, [])

  const recordHollywoodPlace = useCallback((place: HollywoodPlaceSelection | null) => {
    setHollywoodPlace(place)
    if (place !== null) {
      setHollywoodPerson(null)
      viewRef.current?.clearHollywoodPersonSelection()
      if (place.buildingId === 'expansion') {
        onNavigateRef.current(resolveAction('view-expansion').route)
      }
    }
  }, [])

  // State replacement/save reload can remove a previously selected person. The current
  // snapshot, not the old scene event, decides whether that inspection remains valid.
  useEffect(() => {
    if (hollywoodPerson === null) return
    const current = snapshot.people.find((person) => person.id === hollywoodPerson.id)
    if (current === undefined) {
      setHollywoodPerson(null)
      return
    }
    if (
      current.name !== hollywoodPerson.name ||
      current.role !== hollywoodPerson.role ||
      current.authority !== hollywoodPerson.authority ||
      current.productionId !== hollywoodPerson.productionId ||
      current.productionTitle !== hollywoodPerson.productionTitle
    ) {
      recordHollywoodPerson(current)
    }
  }, [hollywoodPerson, recordHollywoodPerson, snapshot.people])

  // An explicit identity never falls through to another film. Snapshot replacement
  // may remove or relocate it; in that case the context stays empty until the player
  // makes a fresh selection and no pending focus can attach to a future command.
  useEffect(() => {
    if (hollywoodProductionId === null || explicitlySelectedHollywoodOperation !== null) return
    pendingHollywoodFocusProductionId.current = null
  }, [explicitlySelectedHollywoodOperation, hollywoodProductionId])

  useEffect(() => {
    const productionId = pendingHollywoodFocusProductionId.current
    if (
      productionId === null ||
      hollywoodPlace !== null ||
      hollywoodOperation?.productionId !== productionId
    ) {
      return
    }
    const target = hollywoodOperation.currentCommand
      ? hollywoodCommandRef.current
      : hollywoodTaskStatusRef.current
    if (target === null) return
    target.focus()
    pendingHollywoodFocusProductionId.current = null
  }, [hollywoodOperation, hollywoodPlace])

  const recordSelection = useCallback((id: BuildingId | null) => {
    sessionSelectedBuilding = id
    setSelected(id)
  }, [])

  const dispatchRoute = useCallback((action: LotActionEvent['action']) => {
    const res = resolveAction(action)
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
          hollywood,
          snapshot: { ...readSnapshot(state), selectedBuildingId: sessionSelectedBuilding },
          onSelect: (sel) => {
            setSelectionInfo(sel)
            recordSelection(sel?.buildingId ?? null)
          },
          onAction: (e) => dispatchRoute(e.action),
          onHollywoodPerson: recordHollywoodPerson,
          onHollywoodPlace: recordHollywoodPlace,
          onHollywoodProduction: recordHollywoodProduction,
          onActivity: (text) => { if (text) setHollywoodActivity(text) },
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

  useEffect(() => {
    // Renderer telemetry is evidence/debug chrome, not part of the player's studio.
    // Reuse the explicit dev-only identity proof gate that already owns performance UI.
    if (!hollywood || !identityProof || !canvasReady) return
    const h = window.setInterval(() => {
      const next = viewRef.current?.hollywoodPerformance()
      if (next) setHollywoodPerf(next)
    }, 500)
    return () => window.clearInterval(h)
  }, [hollywood, identityProof, canvasReady])

  const selectHollywoodPerson = useCallback((person: LotPersonState) => {
    recordHollywoodPerson(person)
    viewRef.current?.selectHollywoodPerson(person.id)
  }, [recordHollywoodPerson])

  const selectHollywoodProduction = useCallback((productionId: string) => {
    enterHollywoodProductionContext(productionId, { stage7Only: false, focus: false })
  }, [enterHollywoodProductionContext])

  const inspectHollywoodStage7 = useCallback((productionId: string) => {
    enterHollywoodProductionContext(productionId, { stage7Only: true, focus: true })
  }, [enterHollywoodProductionContext])

  const dispatchHollywoodProductionCommand = useCallback((
    productionId: string,
    command: LotProductionCommand,
  ) => {
    pendingHollywoodFocusProductionId.current = productionId
    const outcome = onProductionCommand?.(command)
    if (outcome && !outcome.ok) {
      pendingHollywoodFocusProductionId.current = null
      setHollywoodActivity(`Production command blocked: ${outcome.error}`)
    } else if (outcome?.ok) {
      setHollywoodActivity((current) =>
        current?.startsWith('Production command blocked: ') ? null : current,
      )
    }
  }, [onProductionCommand])

  const runHollywoodPublicity = useCallback(() => {
    if (!whisperOffer) return
    const result = runPublicity(state, whisperOffer.tier)
    if (!result.ok) {
      const clean = result.error.replace(/^applyActions: publicity rejected — /, '').replace(/ \(D-17B §2\)$/, '')
      setHollywoodActivity(`Publicity blocked: ${clean}`)
      viewRef.current?.showHollywoodPublicity(false, `Publicity blocked: ${clean}`)
      return
    }
    const cashDelta = state.studio.cash - result.next.studio.cash
    const awarenessDelta = result.next.studio.standing.audienceAwareness - state.studio.standing.audienceAwareness
    onStateChange?.(result.next)
    const detail = `Publicity call complete · −$${cashDelta.toLocaleString('en-US')} · awareness +${awarenessDelta.toFixed(1)}`
    setHollywoodActivity(detail)
    viewRef.current?.showHollywoodPublicity(true, detail)
  }, [onStateChange, state, whisperOffer])

  // Companion-nav activation: select the building AND route to its destination.
  const activate = useCallback(
    (id: BuildingId) => {
      if (hollywood && id === 'stage-a') {
        const current = latestSnapshotRef.current
        const operation =
          current.operationsMode === 'managed' && current.stageAssignmentAuthority === 'engine'
            ? current.productionOperations.find(
                (candidate) => candidate.locationBuildingId === 'stage-a',
              )
            : undefined
        if (
          operation &&
          enterHollywoodProductionContext(operation.productionId, {
            stage7Only: true,
            focus: true,
          })
        ) {
          recordSelection(id)
          return
        }
      }
      recordSelection(id)
      viewRef.current?.select(id)
      dispatchRoute(BUILDING_ACTION[id])
    },
    [dispatchRoute, enterHollywoodProductionContext, hollywood, recordSelection],
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
      className={`lot-screen${reducedMotion ? ' lot-reduced-motion' : ''}${hollywood ? ' lot-hollywood' : ''}`}
      data-testid="studio-lot-screen"
    >
      <div
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="lot-annex-operational-announcement"
      >
        {operationalAnnouncement}
      </div>
      <header className="lot-topbar">
        <div className="lot-brand">
          <span className="mark">{snapshot.studioName}</span>
          <span className="lot-sub">{hollywood ? 'Studio Chronicle · Hollywood, 1948' : 'Studio Lot'} · Week {snapshot.week}</span>
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
          {/* Primary visual world surface; the DOM companion is its semantic equivalent. */}
          <div ref={mountRef} className="lot-canvas" data-testid="studio-lot-canvas" aria-hidden="true" />

          {hollywood && (
            <>
              <section
                className={`hollywood-production${hollywoodOperation ? '' : ' is-idle'}`}
                aria-label="Current production"
                data-testid={hollywoodOperation ? 'hollywood-current-production' : 'hollywood-production-idle'}
                onPointerDown={containWorldInput}
                onMouseDown={containWorldInput}
                onTouchStart={containWorldInput}
              >
                {hollywoodOperation ? (
                  <>
                    <p className="hollywood-eyebrow">
                      <i /> {hollywoodOperation.phaseLabel} · {hollywoodOperation.facilityLabel}
                    </p>
                    <h2>{hollywoodOperation.title}</h2>
                    <div
                      className="hollywood-progress"
                      role="progressbar"
                      aria-label={`${hollywoodOperation.title} production progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(hollywoodOperation.progress01 * 100)}
                    >
                      <span style={{ width: `${Math.max(0, Math.min(1, hollywoodOperation.progress01)) * 100}%` }} />
                    </div>
                    <dl>
                      <div><dt>Phase</dt><dd>{hollywoodOperation.phaseLabel}</dd></div>
                      <div><dt>Weeks left</dt><dd>{hollywoodOperation.weeksRemaining}</dd></div>
                      <div><dt>Director</dt><dd>{hollywoodOperation.directorName}</dd></div>
                    </dl>
                    {hollywoodOperation.blocker && (
                      hollywoodStage7Operation?.productionId === hollywoodOperation.productionId ? (
                        <button
                          type="button"
                          className="hollywood-consequence"
                          data-testid="hollywood-production-blocker"
                          data-world-problem="stage-7"
                          aria-label={`Inspect ${hollywoodOperation.title} problem at Soundstage 7: ${hollywoodOperation.blocker.headline}`}
                          onClick={() => inspectHollywoodStage7(hollywoodOperation.productionId)}
                        >
                          <b>!</b>
                          <span>
                            <strong>{hollywoodOperation.blocker.headline}</strong>
                            {hollywoodOperation.blocker.detail}
                          </span>
                        </button>
                      ) : (
                        <p className="hollywood-consequence" data-testid="hollywood-production-blocker">
                          <b>!</b>
                          <span>
                            <strong>{hollywoodOperation.blocker.headline}</strong>
                            {hollywoodOperation.blocker.detail}
                          </span>
                        </p>
                      )
                    )}
                  </>
                ) : (
                  <>
                    <p className="hollywood-eyebrow"><i /> STUDIO OPERATIONS</p>
                    <h2>No active production</h2>
                    <p className="hollywood-idle-copy">
                      The studio lot is idle. Assemble a film to begin production.
                    </p>
                  </>
                )}
              </section>

              <section
                className="hollywood-inspector"
                aria-live="polite"
                onPointerDown={containWorldInput}
                onMouseDown={containWorldInput}
                onTouchStart={containWorldInput}
              >
                <p className="hollywood-eyebrow">{hollywoodPerson ? 'SELECTED PERSON' : hollywoodPlace ? 'SELECTED PLACE' : 'STUDIO DESK'}</p>
                <h3>{hollywoodPerson?.name ?? hollywoodPlace?.label ?? hollywoodOperation?.title ?? 'Studio idle'}</h3>
                <p>{hollywoodPerson
                  ? `${hollywoodPerson.role === 'director' ? 'Director' : 'Talent'} · ${hollywoodPerson.authority === 'active-production' ? `attached to ${hollywoodPerson.productionTitle}` : hollywoodPerson.authority === 'district-managed' ? 'district command roster' : 'studio roster'}`
                  : hollywoodPlace
                    ? `Affordances: ${hollywoodPlace.affordances.join(' · ')}`
                    : hollywoodOperation
                      ? `${hollywoodOperation.phaseLabel} · ${hollywoodOperation.facilityLabel}`
                      : 'No production requires a studio command.'}</p>
                {hollywoodOperation && hollywoodPlace === null && (
                  <div
                    className="hollywood-task-chain"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    tabIndex={-1}
                    ref={hollywoodTaskStatusRef}
                    data-testid={`hollywood-task-status-${hollywoodOperation.productionId}`}
                  >
                    <span className="done">PHASE<b>{hollywoodOperation.phaseLabel}</b></span><i>›</i>
                    <span className={hollywoodOperation.taskStatus ? 'done' : ''}>TASK<b>{hollywoodOperation.taskStatus ?? 'None'}</b></span><i>›</i>
                    <span className={hollywoodOperation.currentCommand ? '' : 'done'}>STATUS<b>{hollywoodOperation.statusLabel}</b></span>
                  </div>
                )}
                {hollywoodPlace === null && hollywoodOperation?.locationBuildingId === 'stage-b' && (
                  <p className="hollywood-stage-fallback" data-testid="hollywood-stage-12-fallback">
                    {hollywoodOperation.facilityLabel} is authoritative. This district view depicts Soundstage 7; manage this production from the inspector.
                  </p>
                )}
                {hollywoodPlace === null && hollywoodOperation?.currentCommand && (
                  <button
                    className="accent hollywood-command"
                    disabled={!onProductionCommand}
                    ref={hollywoodCommandRef}
                    onClick={() => dispatchHollywoodProductionCommand(
                      hollywoodOperation.productionId,
                      hollywoodOperation.currentCommand!,
                    )}
                    data-testid={`hollywood-production-command-${hollywoodOperation.currentCommand.kind}`}
                  >
                    {hollywoodOperation.currentCommand.label}
                  </button>
                )}
                {whisperOffer && (
                  <>
                    <button
                      className="hollywood-publicity"
                      data-testid="hollywood-publicity-whisper"
                      aria-describedby="hollywood-publicity-whisper-status"
                      disabled={!whisperOffer.available}
                      onClick={runHollywoodPublicity}
                    >
                      Run publicity · Whisper · {moneyExact(whisperOffer.cost)} · +{whisperOffer.expectedLift.toFixed(2)} awareness
                    </button>
                    <small
                      id="hollywood-publicity-whisper-status"
                      data-testid="hollywood-publicity-whisper-status"
                    >
                      {whisperOffer.available ? 'Available now.' : `Unavailable. ${whisperOffer.reason ?? 'No offer is available.'}`}
                      {' '}Global cooldown: {whisperOffer.globalCooldownWeeks} weeks · Whisper cooldown: {whisperOffer.cooldownWeeks} weeks
                    </small>
                  </>
                )}
              </section>

              {hollywoodOperations.length > 1 && (
                <div
                  className="hollywood-productions"
                  role="group"
                  aria-label="Active productions"
                  onPointerDown={containWorldInput}
                  onMouseDown={containWorldInput}
                  onTouchStart={containWorldInput}
                >
                  {hollywoodOperations.map((operation) => (
                    <button
                      key={operation.productionId}
                      type="button"
                      className={hollywoodOperation?.productionId === operation.productionId ? 'active' : ''}
                      aria-pressed={hollywoodOperation?.productionId === operation.productionId}
                      onClick={() => selectHollywoodProduction(operation.productionId)}
                      data-testid={`hollywood-select-production-${operation.productionId}`}
                    >
                      <span>{operation.title}</span>
                      <small>{operation.facilityLabel}</small>
                    </button>
                  ))}
                </div>
              )}
              {snapshot.people.length > 0 && (
                <div
                  className="hollywood-people"
                  role="group"
                  aria-label="Named studio people"
                  onPointerDown={containWorldInput}
                  onMouseDown={containWorldInput}
                  onTouchStart={containWorldInput}
                >
                  {snapshot.people.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      className={hollywoodPerson?.id === person.id ? 'active' : ''}
                      aria-pressed={hollywoodPerson?.id === person.id}
                      onClick={() => selectHollywoodPerson(person)}
                      data-testid={`hollywood-select-person-${person.id}`}
                    >
                      <span>{person.name}</span><small>{person.role}</small>
                    </button>
                  ))}
                </div>
              )}
              {hollywoodActivity && <div className="hollywood-activity" role="status">{hollywoodActivity}</div>}
              {identityProof && hollywoodPerf && (
                <div className="hollywood-perf" data-testid="hollywood-performance">
                  {hollywoodPerf.fps} fps · {hollywoodPerf.onePercentLowFps} fps 1% low · {hollywoodPerf.displayObjects} objects · {hollywoodPerf.dynamicActors} actors · {hollywoodPerf.textureMemoryMb} MB decoded · {hollywoodPerf.roleAtlasEncodedKb} KB atlas · {hollywoodPerf.p99FrameMs} ms p99 · {hollywoodPerf.worstFrameMs} ms worst · {hollywoodPerf.updateMs} ms update · {hollywoodPerf.drawCalls} draws
                </div>
              )}
            </>
          )}

          {identityProof && !reviewHidden && (
            <div
              className="lot-review-bar"
              data-testid="lot-review-mode"
              role="group"
              aria-label="Studio identity review mode (development only)"
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
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
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
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
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
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
              The visual lot could not load here. Every destination remains in the list, and exact
              Stage 7 work remains available through the Studio Desk.
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
