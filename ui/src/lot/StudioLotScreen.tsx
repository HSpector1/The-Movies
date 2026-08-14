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
import type {
  ActionOutcome,
  ConstructionCompletionSummary,
  GameState,
  StudioConstructionView,
} from '../engine/adapter.ts'
import {
  careerIdentityLabel,
  publicityDecision,
  runPublicity,
  studioDevelopment,
  studioLotSnapshot,
  talentAssignmentContext,
  talentProfile,
} from '../engine/adapter.ts'
import { ConstructionCompletionNotice } from '../components/ConstructionCompletionNotice.tsx'
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
import { sceneryLoadInContext } from './snapshot/sceneryLoadIn.ts'
import { lotPersonWorkContext } from './snapshot/personWork.ts'
import {
  getLotSelectedBuilding,
  setLotSelectedBuilding,
} from './snapshot/selectedBuildingSession.ts'
import { lotStageAssignment } from './snapshot/stageAssignment.ts'
import { BUILDING_BLURBS, resolveAction, type LotRoute } from './navigation.ts'
import type { LotActionEvent, SelectionInfo, StudioLotView as StudioLotViewClass } from './StudioLotView.ts'
import type {
  HollywoodPerformance,
  HollywoodPlaceSelection,
  HollywoodProductionSelection,
  HollywoodSceneryLoadInSelection,
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

type SceneryLoadInPresentationState = 'blocked' | 'ready'

// Commands in this slice are flat projection records. Compare their complete own-field
// sets so an activation rendered from an older projection can never borrow a legal
// successor command merely because the production identity stayed the same.
function isFieldExactSceneryCommand(
  rendered: LotProductionCommand,
  latest: LotProductionCommand,
): boolean {
  if (
    (rendered.kind !== 'clearSceneryLoadIn' && rendered.kind !== 'scheduleShootingTake') ||
    (latest.kind !== 'clearSceneryLoadIn' && latest.kind !== 'scheduleShootingTake')
  ) return false

  const renderedFields = Object.entries(rendered)
  const latestFields = latest as unknown as Record<string, unknown>
  return (
    renderedFields.length === Object.keys(latest).length &&
    renderedFields.every(([key, value]) => (
      Object.prototype.hasOwnProperty.call(latest, key) && latestFields[key] === value
    ))
  )
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
  /** Open the supporting Dashboard surface. */
  onExit: () => void
  /** Emit one authoritative App-owned weekly-advance intent. */
  onAdvance: () => void
  /** Exact transient feedback from a no-release lot-origin advance. */
  advanceFeedback?: {
    week: number
    constructionCompletion: ConstructionCompletionSummary | null
  } | null
  /** Exact focus instruction for canonical entry or a bounded deep-surface return. */
  entryFocus?: 'studio-home' | 'selected-building' | 'advance-week'
  /** Suppress a generic Annex announcement already owned by an exact completion surface. */
  suppressOperationalAnnouncement?: boolean
  /** The host replaces the authoritative state only after a successful real engine action. */
  onStateChange?: (state: GameState) => void
  /** Dispatch exactly the command projected by the authoritative operations read model. */
  onProductionCommand?: (command: LotProductionCommand) => ActionOutcome | void
  /** Dispatch the existing parameter-free Annex action through the authoritative App owner. */
  onStartDevelopmentCastingAnnex?: () => ActionOutcome
  /** Open the one App-owned canonical Talent Profile over this mounted Lot. */
  onOpenTalentProfile?: (personId: string) => void
  /** Close that profile when its exact selected Lot handoff becomes invalid. */
  onCloseTalentProfile?: (personId: string) => void
  /** The exact App-owned profile currently open over this Lot, if any. */
  openTalentProfileId?: string | null
  /** Suspend only world input while a modal remains mounted above the living renderer. */
  worldInputSuspended?: boolean
}

// Stage assignment memory. Like selected-building memory, it is UI session state — NOT
// GameState, NOT SaveFileV4 — and it MUST outlive this screen. A release or deliberate deep
// management route can still unmount the lot between ticks; per-mount memory would then forget
// every held stage and reintroduce the migration defect on return. It is owned by the module that
// defines it, so that its lifetime can END with the loaded game rather than with the page:
// App.tsx calls resetLotStageAssignment() at the new-studio and loaded-save boundaries. See
// snapshot/stageAssignment.ts.

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

function annexStatusLabel(view: StudioConstructionView): string {
  switch (view.status) {
    case 'legacy':
      return 'Unavailable'
    case 'vacant':
      return 'Vacant'
    case 'building':
      return 'Building'
    case 'operational':
      return 'Operational'
  }
}

function annexStatusDetail(view: StudioConstructionView): string {
  switch (view.status) {
    case 'legacy':
      return 'This legacy studio has no managed expansion parcel. No facility or project history is inferred.'
    case 'vacant':
      return 'The fixed expansion parcel is open. Starting the Annex commits the full capital cost now.'
    case 'building':
      return `${view.completedAdvances} of ${view.durationWeeks} weekly advances complete · committed for Week ${view.dueWeek}.`
    case 'operational':
      return `Completed in Week ${view.completedWeek}. The additional shared Development & Casting slot is available now.`
  }
}

function hasExactAnnexProjection(
  snapshot: StudioLotSnapshot,
  view: StudioConstructionView,
): boolean {
  const matches = snapshot.buildings.filter((building) => building.id === 'expansion')
  return matches.length === 1 && matches[0]?.constructionStatus === view.status
}

function hasExactScheduledStage7Operation(
  snapshot: StudioLotSnapshot,
  productionId: string,
): boolean {
  if (
    snapshot.operationsMode !== 'managed' ||
    snapshot.stageAssignmentAuthority !== 'engine'
  ) return false
  const stage7 = (snapshot.productionOperations ?? []).filter(
    (operation) => operation.locationBuildingId === 'stage-a',
  )
  return (
    stage7.length === 1 &&
    stage7[0]?.productionId === productionId &&
    stage7[0].phase === 'shooting' &&
    stage7[0].taskStatus === 'scheduled' &&
    stage7[0].blocker === null &&
    stage7[0].currentCommand === null
  )
}

function sceneryArrivalActivity(title: string): string {
  return `${title} scenery reached Soundstage 7. The shooting take is ready to schedule.`
}

export function StudioLotScreen({
  state,
  onNavigate,
  onExit,
  onAdvance,
  advanceFeedback = null,
  entryFocus,
  suppressOperationalAnnouncement = false,
  onStateChange,
  onProductionCommand,
  onStartDevelopmentCastingAnnex,
  onOpenTalentProfile,
  onCloseTalentProfile,
  openTalentProfileId = null,
  worldInputSuspended = false,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<StudioLotViewClass | null>(null)
  const studioHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const namedPeopleGroupRef = useRef<HTMLDivElement | null>(null)
  const advanceButtonRef = useRef<HTMLButtonElement | null>(null)
  const companionButtonRefs = useRef<Partial<Record<BuildingId, HTMLButtonElement | null>>>({})
  const onNavigateRef = useRef(onNavigate)
  onNavigateRef.current = onNavigate
  const onCloseTalentProfileRef = useRef(onCloseTalentProfile)
  onCloseTalentProfileRef.current = onCloseTalentProfile
  const worldInputSuspendedRef = useRef(worldInputSuspended)
  worldInputSuspendedRef.current = worldInputSuspended

  const [selected, setSelected] = useState<BuildingId | null>(getLotSelectedBuilding)
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasFailed, setCanvasFailed] = useState(false)
  const [reducedMotion, setReducedMotionState] = useState(prefersReducedMotion)
  const hollywood = operationHollywoodEnabled()
  const [hollywoodPerson, setHollywoodPerson] = useState<LotPersonState | null>(null)
  const [hollywoodPlace, setHollywoodPlace] = useState<HollywoodPlaceSelection | null>(null)
  // undefined = default desk orientation, null = an explicit empty desk, string =
  // one exact selected production. The distinction lets stale world contexts fail
  // empty instead of silently falling back to whichever film is now first.
  const [hollywoodProductionId, setHollywoodProductionId] = useState<string | null | undefined>(undefined)
  const [hollywoodSceneryLoadInProductionId, setHollywoodSceneryLoadInProductionId] = useState<string | null>(null)
  const [hollywoodSceneryCommandPending, setHollywoodSceneryCommandPending] = useState(false)
  const [hollywoodActivity, setHollywoodActivity] = useState<string | null>(null)
  const [hollywoodActivitySerial, setHollywoodActivitySerial] = useState(0)
  const [hollywoodPerf, setHollywoodPerf] = useState<HollywoodPerformance | null>(null)
  const [annexSelected, setAnnexSelected] = useState(false)
  const [annexPending, setAnnexPending] = useState(false)
  const [annexAnnouncement, setAnnexAnnouncement] = useState('')
  const [annexAnnouncementSerial, setAnnexAnnouncementSerial] = useState(0)
  const hollywoodCommandRef = useRef<HTMLButtonElement | null>(null)
  const hollywoodTaskStatusRef = useRef<HTMLDivElement | null>(null)
  const hollywoodPersonStatusRef = useRef<HTMLDivElement | null>(null)
  const pendingHollywoodFocusProductionId = useRef<string | null>(null)
  const hollywoodSceneryLoadInProductionIdRef = useRef<string | null>(null)
  const pendingHollywoodSceneryFocusProductionId = useRef<string | null>(null)
  const hollywoodSceneryCommandPendingRef = useRef(false)
  const hollywoodSceneryCommandHeldKeyRef = useRef<'Enter' | ' ' | null>(null)
  const hollywoodSceneryArrivalActivityRef = useRef<string | null>(null)
  const acceptedHollywoodSceneryCommandRef = useRef<{
    productionId: string
    kind: 'clearSceneryLoadIn' | 'scheduleShootingTake'
  } | null>(null)
  const annexBuildRef = useRef<HTMLButtonElement | null>(null)
  const annexStatusRef = useRef<HTMLDivElement | null>(null)
  const annexSelectedRef = useRef(false)
  const annexPendingRef = useRef(false)
  const annexFocusNonceRef = useRef(0)
  const annexAcceptedFocusRef = useRef(false)
  const onStartAnnexRef = useRef(onStartDevelopmentCastingAnnex)
  onStartAnnexRef.current = onStartDevelopmentCastingAnnex
  const whisperOffer = publicityDecision(state).find((offer) => offer.tier === 'whisper')

  // Keep one live-region owner while replacing its child for every real event. An
  // identical second Engine rejection is still a distinct accessibility announcement.
  const announceHollywoodActivity = useCallback((activity: string) => {
    setHollywoodActivitySerial((serial) => serial + 1)
    setHollywoodActivity(activity)
  }, [])

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
  const annexView = studioDevelopment(state)
  const [operationalAnnouncement, setOperationalAnnouncement] = useState('')
  const completionAnnouncementOwnedRef = useRef(suppressOperationalAnnouncement)
  const hollywoodOperations = snapshot.productionOperations ?? []
  const currentSceneryLoadInContext = sceneryLoadInContext(snapshot)
  const selectedSceneryLoadInContext =
    hollywoodSceneryLoadInProductionId !== null &&
    currentSceneryLoadInContext?.operation.productionId === hollywoodSceneryLoadInProductionId
      ? currentSceneryLoadInContext
      : null
  const exactReadySceneryArrival = currentSceneryLoadInContext?.state === 'ready'
    ? sceneryArrivalActivity(currentSceneryLoadInContext.operation.title)
    : null
  hollywoodSceneryLoadInProductionIdRef.current = hollywoodSceneryLoadInProductionId
  const latestSnapshotRef = useRef(snapshot)
  latestSnapshotRef.current = snapshot
  const latestAnnexViewRef = useRef(annexView)
  latestAnnexViewRef.current = annexView
  const selectedPersonWork = hollywoodPerson === null
    ? null
    : lotPersonWorkContext(snapshot, hollywoodPerson.id)
  const selectedPersonAssignment = hollywoodPerson === null
    ? null
    : talentAssignmentContext(state, hollywoodPerson.id)
  const selectedPersonProfile = hollywoodPerson === null
    ? undefined
    : talentProfile(state, hollywoodPerson.id)
  const selectedLotPersonIdentityCount = hollywoodPerson === null
    ? 0
    : snapshot.people.filter((person) => person.id === hollywoodPerson.id).length
  const selectedProfileIdentityCount = hollywoodPerson === null
    ? 0
    : state.talent.filter((person) => person.id === hollywoodPerson.id).length
  const selectedProfileMatches =
    hollywoodPerson !== null &&
    selectedLotPersonIdentityCount === 1 &&
    selectedProfileIdentityCount === 1 &&
    selectedPersonProfile !== undefined &&
    selectedPersonProfile.id === hollywoodPerson.id &&
    selectedPersonProfile.name === hollywoodPerson.name
  const selectedProductionWork =
    selectedPersonWork?.kind === 'managed-production' ||
    selectedPersonWork?.kind === 'legacy-production'
      ? selectedPersonWork
      : null
  const selectedAssignmentIsExact =
    selectedPersonAssignment !== null &&
    selectedPersonAssignment.kind !== 'ambiguous' &&
    (selectedPersonWork?.kind === 'roster' ||
      (selectedProductionWork !== null &&
        selectedPersonAssignment.kind === 'assigned' &&
        selectedPersonAssignment.assignment.kind === 'production' &&
        selectedPersonAssignment.assignment.assignmentId === selectedProductionWork.productionId &&
        selectedPersonAssignment.assignment.label === selectedProductionWork.productionTitle))
  const selectedCareerLabel =
    selectedProfileMatches && selectedAssignmentIsExact
      ? careerIdentityLabel(selectedPersonProfile.careerIdentity) ||
        `${selectedPersonProfile.disciplines.find((discipline) => discipline.isPrimary)?.label ?? 'Career'} · not yet proven`
      : null
  const selectedAssignmentLabel =
    !selectedAssignmentIsExact || selectedPersonAssignment === null
      ? 'Assignment details unavailable'
      : selectedPersonAssignment.kind === 'available'
        ? 'Available for assignment'
        : selectedPersonAssignment.assignment.kind === 'script'
          ? `Assigned to screenplay: ${selectedPersonAssignment.assignment.label}`
          : `Engaged on ${selectedPersonAssignment.assignment.label}`
  const canOpenSelectedTalentProfile =
    selectedProfileMatches &&
    selectedAssignmentIsExact &&
    onOpenTalentProfile !== undefined
  const hasManagedEngineOperations =
    snapshot.operationsMode === 'managed' && snapshot.stageAssignmentAuthority === 'engine'
  const hollywoodStage7Operation =
    hasManagedEngineOperations
      ? hollywoodOperations.find((operation) => operation.locationBuildingId === 'stage-a') ?? null
      : null
  const explicitlySelectedHollywoodOperation = typeof hollywoodProductionId !== 'string'
    ? null
    : hollywoodOperations.find((operation) => operation.productionId === hollywoodProductionId) ?? null
  const sceneryContextInvalidated =
    hollywoodSceneryLoadInProductionId !== null && selectedSceneryLoadInContext === null
  const locallyAcceptedScenerySchedule =
    sceneryContextInvalidated &&
    acceptedHollywoodSceneryCommandRef.current?.kind === 'scheduleShootingTake' &&
    acceptedHollywoodSceneryCommandRef.current.productionId === hollywoodSceneryLoadInProductionId &&
    hasExactScheduledStage7Operation(snapshot, hollywoodSceneryLoadInProductionId)
  const hollywoodOperation: ProductionOperationsState | null =
    sceneryContextInvalidated && !locallyAcceptedScenerySchedule
      ? null
      : hollywoodProductionId === undefined
      ? hasManagedEngineOperations
        ? hollywoodStage7Operation ?? (hollywoodOperations.length === 1 ? hollywoodOperations[0]! : null)
        : hollywoodOperations[0] ?? null
      : hollywoodProductionId === null
        ? null
      : explicitlySelectedHollywoodOperation
  const hollywoodInspectorOperation =
    hollywoodPerson === null
      ? hollywoodOperation
      : selectedProductionWork !== null &&
          hollywoodOperation?.productionId === selectedProductionWork.productionId
        ? hollywoodOperation
        : null
  const showHollywoodInspectorTaskChain =
    hollywoodPerson === null || selectedProductionWork?.productionRole === 'director'
  const renderedHollywoodProductionIdRef = useRef<string | null>(hollywoodOperation?.productionId ?? null)
  renderedHollywoodProductionIdRef.current = hollywoodOperation?.productionId ?? null

  const recordHollywoodRendererActivity = useCallback((activity: string) => {
    const current = latestSnapshotRef.current
    const stage7 = (current.productionOperations ?? []).filter(
      (operation) => operation.locationBuildingId === 'stage-a',
    )
    const operation = stage7.length === 1 ? stage7[0]! : null
    // Scheduled Stage 7 truth supersedes a cancelled delivery sweep. Do not show
    // a contradictory “ready to schedule” toast beside “take scheduled”.
    if (
      operation !== null &&
      hasExactScheduledStage7Operation(current, operation.productionId) &&
      activity === sceneryArrivalActivity(operation.title)
    ) return
    const exact = sceneryLoadInContext(current)
    if (
      exact?.state === 'ready' &&
      activity === sceneryArrivalActivity(exact.operation.title)
    ) {
      hollywoodSceneryArrivalActivityRef.current = activity
    }
    announceHollywoodActivity(activity)
  }, [announceHollywoodActivity])

  // Arrival feedback belongs only to exact ready-to-schedule truth. This also
  // covers the generic Stage 7 inspector path, where no dedicated service-yard
  // selection is owned when an external or locally dispatched schedule arrives.
  useEffect(() => {
    const arrival = hollywoodSceneryArrivalActivityRef.current
    if (arrival === null || exactReadySceneryArrival === arrival) return
    setHollywoodActivity((visible) => visible === arrival ? null : visible)
    hollywoodSceneryArrivalActivityRef.current = null
  }, [exactReadySceneryArrival])

  const recordSelection = useCallback((id: BuildingId | null) => {
    setLotSelectedBuilding(id)
    setSelected(id)
  }, [])

  const clearHollywoodSceneryLoadInReactContext = useCallback(() => {
    hollywoodSceneryLoadInProductionIdRef.current = null
    pendingHollywoodSceneryFocusProductionId.current = null
    hollywoodSceneryCommandPendingRef.current = false
    hollywoodSceneryCommandHeldKeyRef.current = null
    acceptedHollywoodSceneryCommandRef.current = null
    setHollywoodSceneryLoadInProductionId(null)
    setHollywoodSceneryCommandPending(false)
  }, [])

  const clearHollywoodSceneryLoadInContext = useCallback(() => {
    clearHollywoodSceneryLoadInReactContext()
    viewRef.current?.clearHollywoodPlaceSelection?.()
  }, [clearHollywoodSceneryLoadInReactContext])

  const clearAnnexContext = useCallback(() => {
    annexSelectedRef.current = false
    annexAcceptedFocusRef.current = false
    annexFocusNonceRef.current += 1
    setAnnexSelected(false)
    setAnnexAnnouncement('')
  }, [])

  const focusSelectedAnnex = useCallback(() => {
    const nonce = ++annexFocusNonceRef.current
    queueMicrotask(() => {
      if (!annexSelectedRef.current || annexFocusNonceRef.current !== nonce) return
      const current = latestAnnexViewRef.current
      const target =
        current.status === 'vacant' && current.canStart && onStartAnnexRef.current
          ? annexBuildRef.current
          : annexStatusRef.current
      target?.focus()
    })
  }, [])

  const enterAnnexContext = useCallback((options: {
    place: HollywoodPlaceSelection | null
    paintHollywoodOutline: boolean
    focus: boolean
  }): boolean => {
    if (!hasExactAnnexProjection(latestSnapshotRef.current, latestAnnexViewRef.current)) return false

    clearHollywoodSceneryLoadInContext()
    annexSelectedRef.current = true
    annexAcceptedFocusRef.current = false
    setAnnexSelected(true)
    setAnnexAnnouncement('')
    setSelectionInfo(null)
    setHollywoodPerson(null)
    setHollywoodPlace(options.place)
    pendingHollywoodFocusProductionId.current = null
    viewRef.current?.clearHollywoodPersonSelection()
    recordSelection('expansion')
    if (options.paintHollywoodOutline) {
      // False means no live Hollywood manifest/renderer. The semantic DOM context is
      // still complete and must remain selected without inventing a physical outline.
      viewRef.current?.selectHollywoodAnnexPlace?.()
    }
    if (options.focus) focusSelectedAnnex()
    return true
  }, [clearHollywoodSceneryLoadInContext, focusSelectedAnnex, recordSelection])

  const enterHollywoodSceneryLoadInContext = useCallback((
    selection: HollywoodSceneryLoadInSelection,
    options: { paintHollywoodOutline: boolean; focus: boolean },
  ): boolean => {
    if (
      !hollywood ||
      selection.placeId !== 'service-yard' ||
      selection.locationBuildingId !== 'stage-a'
    ) return false
    const exact = sceneryLoadInContext(latestSnapshotRef.current)
    if (
      exact === null ||
      exact.operation.productionId !== selection.productionId
    ) return false

    hollywoodSceneryLoadInProductionIdRef.current = selection.productionId
    setHollywoodSceneryLoadInProductionId(selection.productionId)
    setHollywoodProductionId(selection.productionId)
    setHollywoodPerson(null)
    setHollywoodPlace(null)
    setSelectionInfo(null)
    clearAnnexContext()
    recordSelection(null)
    pendingHollywoodFocusProductionId.current = null
    viewRef.current?.clearHollywoodPersonSelection?.()
    viewRef.current?.clearHollywoodPlaceSelection?.()
    if (options.paintHollywoodOutline) {
      // A false result means no canonical renderer/manifest is available. The
      // native context remains complete and does not invent a physical outline.
      viewRef.current?.selectHollywoodSceneryLoadIn?.(selection.productionId)
    }
    if (options.focus) {
      pendingHollywoodSceneryFocusProductionId.current = selection.productionId
      queueMicrotask(() => {
        if (
          hollywoodSceneryLoadInProductionIdRef.current !== selection.productionId ||
          pendingHollywoodSceneryFocusProductionId.current !== selection.productionId
        ) return
        const target = hollywoodCommandRef.current ?? hollywoodTaskStatusRef.current
        if (target === null) return
        target.focus({ preventScroll: true })
        pendingHollywoodSceneryFocusProductionId.current = null
      })
    }
    return true
  }, [clearAnnexContext, hollywood, recordSelection])

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

    clearHollywoodSceneryLoadInContext()
    setHollywoodProductionId(exact.productionId)
    setHollywoodPerson(null)
    setHollywoodPlace(null)
    clearAnnexContext()
    recordSelection(null)
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
  }, [clearAnnexContext, clearHollywoodSceneryLoadInContext, recordSelection])

  const recordHollywoodProduction = useCallback((
    production: HollywoodProductionSelection,
  ) => {
    if (production.locationBuildingId !== 'stage-a') return
    enterHollywoodProductionContext(production.productionId, { stage7Only: true, focus: true })
  }, [enterHollywoodProductionContext])

  const recordHollywoodSceneryLoadIn = useCallback((
    selection: HollywoodSceneryLoadInSelection,
  ) => {
    enterHollywoodSceneryLoadInContext(selection, {
      paintHollywoodOutline: true,
      focus: true,
    })
  }, [enterHollywoodSceneryLoadInContext])

  useEffect(() => {
    if (suppressOperationalAnnouncement || advanceFeedback?.constructionCompletion) {
      completionAnnouncementOwnedRef.current = true
    }
    const capacity = expansionFact?.attentionReason?.replace(/^Annex operational · /, '')
    setOperationalAnnouncement(
      expansionFact?.constructionStatus === 'operational' &&
        !completionAnnouncementOwnedRef.current
        ? `Development & Casting Annex is Operational. Development & Casting capacity is now ${capacity ?? 'available with one additional shared slot'}.`
        : '',
    )
  }, [
    advanceFeedback?.constructionCompletion,
    expansionFact?.attentionReason,
    expansionFact?.constructionStatus,
    suppressOperationalAnnouncement,
  ])

  useEffect(() => {
    // The exact completion item owns first focus on its arrival surface.
    if (!entryFocus || advanceFeedback?.constructionCompletion) return

    if (entryFocus === 'advance-week') {
      advanceButtonRef.current?.focus()
      return
    }

    if (entryFocus === 'selected-building') {
      const selectedBuilding = getLotSelectedBuilding()
      const exactFactCount = selectedBuilding === null
        ? 0
        : latestSnapshotRef.current.buildings.filter(
            (building) => building.id === selectedBuilding,
          ).length
      const target = selectedBuilding === null
        ? null
        : companionButtonRefs.current[selectedBuilding]
      if (exactFactCount === 1 && target && !target.disabled) {
        target.focus()
        return
      }
    }

    studioHeadingRef.current?.focus()
    // Entry focus is a remount instruction. Ordinary state/feedback changes must leave the
    // existing focused node alone, so this intentionally depends on entryFocus only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryFocus])

  const recordHollywoodPerson = useCallback((person: LotPersonState | null) => {
    setHollywoodPerson(person)
    if (person !== null) {
      clearHollywoodSceneryLoadInContext()
      clearAnnexContext()
      setSelectionInfo(null)
      recordSelection(null)
      setHollywoodPlace(null)
      viewRef.current?.clearHollywoodPlaceSelection()
    }
    if (person !== null) {
      const work = lotPersonWorkContext(latestSnapshotRef.current, person.id)
      // A person and their task chain are one inspector context. Selecting the real
      // director/lead of Film B must never leave Film A's command underneath their name.
      setHollywoodProductionId(
        work.kind === 'managed-production' || work.kind === 'legacy-production'
          ? work.productionId
          : null,
      )
    }
  }, [clearAnnexContext, clearHollywoodSceneryLoadInContext, recordSelection])

  const recordHollywoodPlace = useCallback((place: HollywoodPlaceSelection | null) => {
    // The scene has already painted a non-null physical place selection before
    // emitting this event. Leave that generic outline intact while dropping only
    // a previously owned React scenery context.
    if (place !== null) clearHollywoodSceneryLoadInReactContext()
    if (
      place !== null &&
      place.id === 'annex-parcel' &&
      place.buildingId === 'expansion'
    ) {
      enterAnnexContext({ place, paintHollywoodOutline: true, focus: true })
      return
    }

    clearAnnexContext()
    setHollywoodPlace(place)
    if (place !== null) {
      setHollywoodPerson(null)
      setSelectionInfo(null)
      recordSelection(place.buildingId)
      viewRef.current?.clearHollywoodPersonSelection()
    }
  }, [
    clearAnnexContext,
    clearHollywoodSceneryLoadInReactContext,
    enterAnnexContext,
    recordSelection,
  ])

  // State replacement/save reload can remove a previously selected person. The current
  // snapshot, not the old scene event, decides whether that inspection remains valid.
  useEffect(() => {
    if (hollywoodPerson === null) return
    const currentMatches = snapshot.people.filter((person) => person.id === hollywoodPerson.id)
    const current = currentMatches.length === 1 ? currentMatches[0]! : undefined
    if (current === undefined) {
      setHollywoodPerson(null)
      setHollywoodProductionId(null)
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

  // The canonical profile may remain resolvable by ID after the Lot-to-profile
  // handoff ceases to be exact (ambiguous assignment, lost operation membership,
  // duplicate profile, or changed identity). Close the App-owned raw ID on the
  // first invalid render and move focus to a stable world fallback. This also
  // prevents a temporarily missing profile from auto-reopening if it reappears.
  useEffect(() => {
    if (
      hollywoodPerson === null ||
      openTalentProfileId !== hollywoodPerson.id ||
      (selectedProfileMatches && selectedAssignmentIsExact)
    ) return
    onCloseTalentProfileRef.current?.(hollywoodPerson.id)
    queueMicrotask(() => {
      ;(namedPeopleGroupRef.current ?? studioHeadingRef.current)?.focus()
    })
  }, [
    hollywoodPerson,
    openTalentProfileId,
    selectedAssignmentIsExact,
    selectedProfileMatches,
  ])

  // A selected context is retained only while the latest authoritative lot projection
  // still contains one expansion lifecycle fact matching the latest construction view.
  // Legacy (`parcelId: null`) remains a valid inspect-only projection; an absent,
  // malformed, or lifecycle-stale visual fact fails closed.
  useEffect(() => {
    if (!annexSelected || hasExactAnnexProjection(snapshot, annexView)) return
    clearAnnexContext()
    setHollywoodPlace(null)
    recordSelection(null)
  }, [annexSelected, annexView.status, clearAnnexContext, recordSelection, snapshot])

  // Accepted construction keeps the action synchronously guarded until fresh App-owned
  // state repaints Vacant → Building. Focus then moves into the persistent status region.
  // Completion focus is never competed with here; this effect is specific to start acceptance.
  useEffect(() => {
    if (!annexPendingRef.current || annexView.status === 'vacant') return
    annexPendingRef.current = false
    setAnnexPending(false)
    if (!annexAcceptedFocusRef.current) return
    annexAcceptedFocusRef.current = false
    if (!annexSelectedRef.current || advanceFeedback?.constructionCompletion) return
    const nonce = ++annexFocusNonceRef.current
    queueMicrotask(() => {
      if (!annexSelectedRef.current || annexFocusNonceRef.current !== nonce) return
      annexStatusRef.current?.focus()
    })
  }, [advanceFeedback?.constructionCompletion, annexView.status])

  // An explicit identity never falls through to another film. Snapshot replacement
  // may remove or relocate it; in that case the context stays empty until the player
  // makes a fresh selection and no pending focus can attach to a future command.
  useEffect(() => {
    if (typeof hollywoodProductionId !== 'string' || explicitlySelectedHollywoodOperation !== null) return
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
      : hollywoodTaskStatusRef.current ?? hollywoodPersonStatusRef.current
    if (target === null) {
      pendingHollywoodFocusProductionId.current = null
      return
    }
    target.focus({ preventScroll: true })
    pendingHollywoodFocusProductionId.current = null
  }, [hollywoodOperation, hollywoodPlace])

  useEffect(() => {
    const productionId = pendingHollywoodSceneryFocusProductionId.current
    if (
      productionId === null ||
      selectedSceneryLoadInContext?.operation.productionId !== productionId
    ) return
    const target = selectedSceneryLoadInContext.operation.currentCommand
      ? hollywoodCommandRef.current
      : hollywoodTaskStatusRef.current
    if (target === null) return
    target.focus({ preventScroll: true })
    pendingHollywoodSceneryFocusProductionId.current = null
  }, [selectedSceneryLoadInContext])

  // Dedicated load-in context survives only exact blocked → ready continuity.
  // Accepted schedule alone transitions the selection back to exact Stage 7;
  // stale/external disappearance fails empty and never substitutes another film.
  useEffect(() => {
    const productionId = hollywoodSceneryLoadInProductionId
    if (productionId === null) return
    const accepted = acceptedHollywoodSceneryCommandRef.current
    if (selectedSceneryLoadInContext?.operation.productionId === productionId) {
      if (accepted?.kind === 'clearSceneryLoadIn' && selectedSceneryLoadInContext.state === 'ready') {
        acceptedHollywoodSceneryCommandRef.current = null
        hollywoodSceneryCommandPendingRef.current = false
        setHollywoodSceneryCommandPending(false)
        pendingHollywoodSceneryFocusProductionId.current = productionId
        setHollywoodActivity((current) =>
          current?.startsWith('Production command blocked: ') ? null : current,
        )
      }
      return
    }

    if (
      accepted?.kind === 'scheduleShootingTake' &&
      accepted.productionId === productionId &&
      hasExactScheduledStage7Operation(snapshot, productionId)
    ) {
      const arrival = hollywoodSceneryArrivalActivityRef.current
      setHollywoodActivity((visible) => visible === arrival ? null : visible)
      hollywoodSceneryArrivalActivityRef.current = null
      hollywoodSceneryCommandPendingRef.current = false
      setHollywoodSceneryCommandPending(false)
      enterHollywoodProductionContext(productionId, { stage7Only: true, focus: true })
      return
    }

    // A host-owned scheduled/completed/relocated/absent replacement supersedes a
    // completed delivery sweep just as decisively as a locally accepted command.
    // Remove only the matching arrival acknowledgement; unrelated activity stays.
    const arrival = hollywoodSceneryArrivalActivityRef.current
    setHollywoodActivity((visible) => visible === arrival ? null : visible)
    hollywoodSceneryArrivalActivityRef.current = null
    setHollywoodProductionId(null)
    clearHollywoodSceneryLoadInContext()
  }, [
    clearHollywoodSceneryLoadInContext,
    enterHollywoodProductionContext,
    hollywoodSceneryLoadInProductionId,
    selectedSceneryLoadInContext,
    snapshot,
  ])

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
          // The import can resolve after an App-owned week advance. Construct from the latest
          // host snapshot rather than the mount-time state closure so that preparation never
          // paints a stale week before onReady enables ordinary snapshot delivery.
          snapshot: {
            ...latestSnapshotRef.current,
            selectedBuildingId: getLotSelectedBuilding(),
          },
          onSelect: (sel) => {
            if (sel?.buildingId === 'expansion') {
              if (!enterAnnexContext({
                place: null,
                paintHollywoodOutline: false,
                focus: true,
              })) {
                setSelectionInfo(null)
                recordSelection(null)
              }
              return
            }
            clearHollywoodSceneryLoadInContext()
            clearAnnexContext()
            setSelectionInfo(sel)
            recordSelection(sel?.buildingId ?? null)
          },
          onAction: (e) => {
            if (e.buildingId === 'expansion') {
              enterAnnexContext({ place: null, paintHollywoodOutline: false, focus: true })
              return
            }
            // Renderer actions are independently activatable: record their exact source before
            // routing instead of assuming an onSelect event happened first.
            recordSelection(e.buildingId)
            clearHollywoodSceneryLoadInContext()
            clearAnnexContext()
            dispatchRoute(e.action)
          },
          onHollywoodPerson: recordHollywoodPerson,
          onHollywoodPlace: recordHollywoodPlace,
          onHollywoodProduction: recordHollywoodProduction,
          onHollywoodSceneryLoadIn: recordHollywoodSceneryLoadIn,
          onActivity: (text) => { if (text) recordHollywoodRendererActivity(text) },
          onReady: () => {
            if (cancelled) return
            setCanvasReady(true)
            const sceneryProductionId = hollywoodSceneryLoadInProductionIdRef.current
            if (sceneryProductionId !== null) {
              view?.selectHollywoodSceneryLoadIn?.(sceneryProductionId)
            } else if (annexSelectedRef.current) {
              if (hollywood) view?.selectHollywoodAnnexPlace?.()
              else view?.select('expansion')
            } else {
              const selectedBuilding = getLotSelectedBuilding()
              if (selectedBuilding) view?.select(selectedBuilding)
            }
            if (reducedMotion) view?.setReducedMotion(true)
            // The tab can become hidden before the dynamic import or Phaser scene
            // is ready, so no visibility event is guaranteed to reach this view.
            // Reconcile once at readiness before allowing it to run unattended.
            if (typeof document !== 'undefined' && document.hidden) view?.pause()
          },
        })
        viewRef.current = view
        view.setInputSuspended?.(worldInputSuspendedRef.current)
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

  // Modal overlays keep this exact view mounted and animated while making the
  // world inert. The latest ref above also covers a drawer opened before the
  // lazy renderer constructor resolves.
  useEffect(() => {
    viewRef.current?.setInputSuspended?.(worldInputSuspended)
  }, [worldInputSuspended])

  // ── Feed the live view new authoritative facts whenever GameState changes. ───
  useEffect(() => {
    const v = viewRef.current
    if (v && canvasReady) {
      v.setSnapshot({ ...readSnapshot(state), selectedBuildingId: getLotSelectedBuilding() })
      const sceneryProductionId = hollywoodSceneryLoadInProductionIdRef.current
      if (sceneryProductionId !== null) {
        v.selectHollywoodSceneryLoadIn?.(sceneryProductionId)
      } else if (annexSelectedRef.current) {
        if (hollywood) v.selectHollywoodAnnexPlace?.()
        else v.select('expansion')
      }
    }
  }, [state, canvasReady, hollywood, readSnapshot])

  // ── Pause when the tab is hidden; resume when visible (no CPU while backgrounded). ─
  useEffect(() => {
    function onVisibility() {
      const v = viewRef.current
      if (!v) return
      if (typeof document !== 'undefined' && document.hidden) v.pause()
      else v.resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    onVisibility()
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

  const inspectHollywoodSceneryLoadIn = useCallback((productionId: string) => {
    enterHollywoodSceneryLoadInContext({
      productionId,
      locationBuildingId: 'stage-a',
      placeId: 'service-yard',
    }, {
      paintHollywoodOutline: true,
      focus: true,
    })
  }, [enterHollywoodSceneryLoadInContext])

  const dispatchHollywoodProductionCommand = useCallback((
    productionId: string,
    command: LotProductionCommand,
  ) => {
    pendingHollywoodFocusProductionId.current = productionId
    const outcome = onProductionCommand?.(command)
    if (outcome && !outcome.ok) {
      pendingHollywoodFocusProductionId.current = null
      announceHollywoodActivity(`Production command blocked: ${outcome.error}`)
    } else if (outcome?.ok) {
      setHollywoodActivity((current) =>
        current?.startsWith('Production command blocked: ') ? null : current,
      )
    }
  }, [announceHollywoodActivity, onProductionCommand])

  const dispatchHollywoodSceneryCommand = useCallback((
    renderedState: SceneryLoadInPresentationState,
    renderedCommand: LotProductionCommand,
    clickDetail: number,
  ) => {
    // The second click in one native double-click gesture may land after React has
    // repainted blocked -> ready. It is still the original gesture, not consent to
    // dispatch the freshly presented Schedule command.
    if (clickDetail > 1) return
    if (hollywoodSceneryCommandPendingRef.current || onProductionCommand === undefined) return
    const current = sceneryLoadInContext(latestSnapshotRef.current)
    const productionId = renderedCommand.productionId
    if (
      current === null ||
      current.state !== renderedState ||
      current.operation.productionId !== productionId ||
      hollywoodSceneryLoadInProductionIdRef.current !== productionId
    ) return
    const command = current.operation.currentCommand
    const expectedKind = renderedState === 'blocked'
      ? 'clearSceneryLoadIn'
      : 'scheduleShootingTake'
    if (
      command === null ||
      renderedCommand.kind !== expectedKind ||
      command.kind !== expectedKind ||
      command.productionId !== productionId ||
      !isFieldExactSceneryCommand(renderedCommand, command)
    ) return

    hollywoodSceneryCommandPendingRef.current = true
    setHollywoodSceneryCommandPending(true)
    const outcome = onProductionCommand(command)
    if (outcome === undefined) {
      hollywoodSceneryCommandPendingRef.current = false
      setHollywoodSceneryCommandPending(false)
      return
    }
    if (!outcome.ok) {
      hollywoodSceneryCommandPendingRef.current = false
      acceptedHollywoodSceneryCommandRef.current = null
      setHollywoodSceneryCommandPending(false)
      announceHollywoodActivity(`Production command blocked: ${outcome.error}`)
      pendingHollywoodSceneryFocusProductionId.current = productionId
      queueMicrotask(() => {
        if (hollywoodSceneryLoadInProductionIdRef.current !== productionId) return
        hollywoodCommandRef.current?.focus({ preventScroll: true })
      })
      return
    }

    const nextSnapshot = readSnapshot(outcome.next)
    const accepted = command.kind === 'clearSceneryLoadIn'
      ? (() => {
          const next = sceneryLoadInContext(nextSnapshot)
          return next?.state === 'ready' && next.operation.productionId === productionId
        })()
      : hasExactScheduledStage7Operation(nextSnapshot, productionId)
    if (!accepted) {
      hollywoodSceneryCommandPendingRef.current = false
      acceptedHollywoodSceneryCommandRef.current = null
      setHollywoodSceneryCommandPending(false)
      announceHollywoodActivity('Production update could not be verified against the latest Studio Lot truth.')
      return
    }

    acceptedHollywoodSceneryCommandRef.current = {
      productionId,
      kind: command.kind,
    }
    setHollywoodActivity((activity) =>
      activity?.startsWith('Production command blocked: ') ? null : activity,
    )
  }, [announceHollywoodActivity, onProductionCommand, readSnapshot])

  const guardHollywoodSceneryCommandKeyDown = useCallback((event: {
    key: string
    repeat: boolean
    preventDefault(): void
    stopPropagation(): void
  }) => {
    containWorldInput(event)
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (
      event.repeat ||
      hollywoodSceneryCommandHeldKeyRef.current === event.key
    ) {
      event.preventDefault()
      return
    }
    hollywoodSceneryCommandHeldKeyRef.current = event.key
  }, [])

  const releaseHollywoodSceneryCommandKey = useCallback((event: {
    key: string
    stopPropagation(): void
  }) => {
    containWorldInput(event)
    if (hollywoodSceneryCommandHeldKeyRef.current === event.key) {
      hollywoodSceneryCommandHeldKeyRef.current = null
    }
  }, [])

  const startAnnexConstruction = useCallback(() => {
    if (
      annexPendingRef.current ||
      !annexSelectedRef.current ||
      !hasExactAnnexProjection(latestSnapshotRef.current, latestAnnexViewRef.current)
    ) return
    const current = latestAnnexViewRef.current
    const owner = onStartAnnexRef.current
    if (current.status !== 'vacant' || !current.canStart || owner === undefined) return

    annexPendingRef.current = true
    setAnnexPending(true)
    setAnnexAnnouncement('')
    const outcome = owner()
    if (!outcome.ok) {
      annexPendingRef.current = false
      setAnnexPending(false)
      setAnnexAnnouncementSerial((currentSerial) => currentSerial + 1)
      setAnnexAnnouncement(outcome.error)
      focusSelectedAnnex()
      return
    }

    const nextView = studioDevelopment(outcome.next)
    annexAcceptedFocusRef.current = true
    setAnnexAnnouncementSerial((currentSerial) => currentSerial + 1)
    setAnnexAnnouncement(
      `${moneyExact(nextView.capex)} committed to ${nextView.name}. Completion is due in Week ${nextView.dueWeek}.`,
    )
  }, [focusSelectedAnnex])

  const runHollywoodPublicity = useCallback(() => {
    if (!whisperOffer) return
    const result = runPublicity(state, whisperOffer.tier)
    if (!result.ok) {
      const clean = result.error.replace(/^applyActions: publicity rejected — /, '').replace(/ \(D-17B §2\)$/, '')
      announceHollywoodActivity(`Publicity blocked: ${clean}`)
      viewRef.current?.showHollywoodPublicity(false, `Publicity blocked: ${clean}`)
      return
    }
    const cashDelta = state.studio.cash - result.next.studio.cash
    const awarenessDelta = result.next.studio.standing.audienceAwareness - state.studio.standing.audienceAwareness
    onStateChange?.(result.next)
    const detail = `Publicity call complete · −$${cashDelta.toLocaleString('en-US')} · awareness +${awarenessDelta.toFixed(1)}`
    announceHollywoodActivity(detail)
    viewRef.current?.showHollywoodPublicity(true, detail)
  }, [announceHollywoodActivity, onStateChange, state, whisperOffer])

  // Companion-nav activation: select the building AND route to its destination.
  const activate = useCallback(
    (id: BuildingId) => {
      if (id === 'expansion') {
        if (enterAnnexContext({
          place: null,
          paintHollywoodOutline: hollywood,
          focus: true,
        })) {
          return
        }
        clearAnnexContext()
        recordSelection(null)
        return
      }
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
      clearHollywoodSceneryLoadInContext()
      clearAnnexContext()
      recordSelection(id)
      viewRef.current?.select(id)
      dispatchRoute(BUILDING_ACTION[id])
    },
    [
      clearAnnexContext,
      clearHollywoodSceneryLoadInContext,
      dispatchRoute,
      enterAnnexContext,
      enterHollywoodProductionContext,
      hollywood,
      recordSelection,
    ],
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

  const annexAffordability = !annexView.affordability.ok
    ? annexView.affordability.reason
    : !annexView.canStart
      ? 'The current studio state does not permit this project.'
      : `Affordable now. The full ${moneyExact(annexView.capex)} is debited when construction starts.`

  const annexContextContents = (
    <>
      <div
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="lot-annex-action-announcement"
      >
        {annexAnnouncement && (
          <span key={annexAnnouncementSerial}>{annexAnnouncement}</span>
        )}
      </div>
      <p className="hollywood-eyebrow">
        EXPANSION PARCEL · {annexView.parcelId ?? 'NOT OWNED'} · WEEK {annexView.currentWeek}
      </p>
      <div className="hollywood-annex-heading">
        <h3>{annexView.name}</h3>
        <span className={`hollywood-annex-tag is-${annexView.status}`}>
          {annexStatusLabel(annexView)}
        </span>
      </div>
      <div
        ref={annexStatusRef}
        tabIndex={-1}
        className={`hollywood-annex-status is-${annexView.status}`}
        role="region"
        aria-label={`${annexView.name} ${annexStatusLabel(annexView)}`}
        data-testid="lot-annex-status"
      >
        <strong>{annexStatusLabel(annexView)}</strong>
        <p>{annexStatusDetail(annexView)}</p>
      </div>

      {annexView.status === 'vacant' && (
        <div className="hollywood-annex-section" data-testid="lot-annex-vacant-facts">
          <dl className="hollywood-annex-facts">
            <div><dt>Capital cost</dt><dd>{moneyExact(annexView.capex)}</dd></div>
            <div><dt>Construction clock</dt><dd>{annexView.durationWeeks} weekly advances</dd></div>
            <div><dt>Cash now</dt><dd>{moneyExact(annexView.cash)}</dd></div>
            <div><dt>Cash after</dt><dd>{moneyExact(annexView.cashAfter)}</dd></div>
            <div><dt>Shared capacity now</dt><dd>{annexView.currentDevelopmentCastingCapacity} slots</dd></div>
          </dl>
          <p className="hollywood-annex-consequence">{annexView.consequence}</p>
          <button
            ref={annexBuildRef}
            type="button"
            className="primary hollywood-annex-build"
            disabled={!annexView.canStart || annexPending || !onStartDevelopmentCastingAnnex}
            aria-describedby="lot-annex-affordability"
            onPointerDown={containWorldInput}
            onMouseDown={containWorldInput}
            onTouchStart={containWorldInput}
            onClick={startAnnexConstruction}
            data-testid="lot-annex-build"
          >
            {annexPending ? 'Starting construction…' : `Build ${annexView.name} · ${moneyExact(annexView.capex)}`}
          </button>
          <p
            id="lot-annex-affordability"
            className={annexView.canStart ? 'hollywood-annex-help' : 'hollywood-annex-help is-blocked'}
            data-testid="lot-annex-affordability"
          >
            {annexAffordability}
          </p>
        </div>
      )}

      {annexView.status === 'building' && (
        <div className="hollywood-annex-section" data-testid="lot-annex-building-facts">
          <div
            className="hollywood-annex-progress"
            role="progressbar"
            aria-label={`${annexView.name} construction progress: ${annexView.completedAdvances} of ${annexView.durationWeeks} weekly advances complete`}
            aria-valuemin={0}
            aria-valuemax={annexView.durationWeeks}
            aria-valuenow={annexView.completedAdvances}
            data-testid="lot-annex-progress"
          >
            <span style={{ width: `${(annexView.completedAdvances / annexView.durationWeeks) * 100}%` }} />
          </div>
          <strong className="hollywood-annex-progress-text" data-testid="lot-annex-progress-text">
            {annexView.completedAdvances} of {annexView.durationWeeks} weekly advances complete
          </strong>
          <dl className="hollywood-annex-facts">
            <div><dt>Started</dt><dd>Week {annexView.startedWeek}</dd></div>
            <div><dt>Committed completion</dt><dd>Week {annexView.dueWeek}</dd></div>
            <div><dt>Advances remaining</dt><dd>{annexView.remainingAdvances}</dd></div>
            <div><dt>Capital committed</dt><dd>{moneyExact(annexView.capex)}</dd></div>
          </dl>
          <p className="hollywood-annex-consequence">{annexView.consequence}</p>
        </div>
      )}

      {annexView.status === 'operational' && (
        <div className="hollywood-annex-section" data-testid="lot-annex-operational-facts">
          <dl className="hollywood-annex-facts">
            <div><dt>Completed</dt><dd>Week {annexView.completedWeek}</dd></div>
            <div><dt>Capacity gained</dt><dd>+{annexView.completedCapacityGain} slot</dd></div>
            <div><dt>Current shared capacity</dt><dd>{annexView.currentDevelopmentCastingCapacity} slots</dd></div>
          </dl>
          <p className="hollywood-annex-consequence">{annexView.consequence}</p>
          <p className="hollywood-annex-help">This project is complete and permanent. There is no repeat, upgrade, relocation, or demolition action.</p>
        </div>
      )}

      {annexView.status === 'legacy' && (
        <p className="hollywood-annex-consequence" data-testid="lot-annex-legacy-copy">
          {annexView.consequence}
        </p>
      )}
    </>
  )

  const sceneryLoadInContextContents = selectedSceneryLoadInContext === null
    ? null
    : (() => {
        const operation = selectedSceneryLoadInContext.operation
        const command = operation.currentCommand
        if (operation.blocker === null || command === null) return null
        return (
          <>
            <p className="hollywood-eyebrow">
              SELECTED LOAD-IN · SOUNDSTAGE 7
            </p>
            <div className="hollywood-scenery-heading">
              <h3>Scenery &amp; Service</h3>
              <span className={`hollywood-scenery-tag is-${selectedSceneryLoadInContext.state}`}>
                {selectedSceneryLoadInContext.state === 'blocked' ? 'Blocked' : 'Delivered'}
              </span>
            </div>
            <p className="hollywood-scenery-route" data-testid="hollywood-scenery-load-in-route">
              <strong>{operation.title}</strong>
              <span>Scenery &amp; Service</span>
              <i aria-hidden="true">→</i>
              <span>{operation.facilityLabel}</span>
            </p>
            <dl className="hollywood-scenery-facts">
              <div><dt>Film</dt><dd>{operation.title}</dd></div>
              <div><dt>Destination</dt><dd>{operation.facilityLabel}</dd></div>
              <div><dt>Director</dt><dd>{operation.directorName}</dd></div>
              <div><dt>Weeks left</dt><dd>{operation.weeksRemaining}</dd></div>
            </dl>
            <p className="hollywood-consequence hollywood-scenery-problem">
              <b>{selectedSceneryLoadInContext.state === 'blocked' ? '!' : '✓'}</b>
              <span>
                <strong>{operation.blocker.headline}</strong>
                {operation.blocker.detail}
              </span>
            </p>
            <div
              className="hollywood-task-chain"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              tabIndex={-1}
              ref={hollywoodTaskStatusRef}
              data-testid="hollywood-scenery-load-in-status"
            >
              <span className="done">PHASE<b>{operation.phaseLabel}</b></span><i>›</i>
              <span className="done">TASK<b>{operation.taskStatus}</b></span><i>›</i>
              <span>STATUS<b>{operation.statusLabel}</b></span>
            </div>
            <button
              type="button"
              className="accent hollywood-command hollywood-scenery-command"
              disabled={hollywoodSceneryCommandPending || !onProductionCommand}
              ref={hollywoodCommandRef}
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
              onKeyDown={guardHollywoodSceneryCommandKeyDown}
              onKeyUp={releaseHollywoodSceneryCommandKey}
              onClick={(event) => dispatchHollywoodSceneryCommand(
                selectedSceneryLoadInContext.state,
                command,
                event.detail,
              )}
              data-testid={`hollywood-production-command-${command.kind}`}
            >
              {hollywoodSceneryCommandPending
                ? selectedSceneryLoadInContext.state === 'blocked'
                  ? 'Clearing scenery load-in…'
                  : 'Scheduling the shooting take…'
                : command.label}
            </button>
            <small className="hollywood-scenery-help">
              Shooting can resume as soon as load-in is confirmed. The next stage decision is
              available immediately.
            </small>
          </>
        )
      })()

  const personInspectorContents = hollywoodPerson === null
    ? null
    : (() => {
        const work = selectedPersonWork
        const productionWork =
          work?.kind === 'managed-production' || work?.kind === 'legacy-production'
            ? work
            : null
        return (
          <div
            className="hollywood-person-inspector-status"
            ref={hollywoodPersonStatusRef}
            tabIndex={-1}
            data-testid="hollywood-person-inspector-status"
          >
            <p className="hollywood-eyebrow">SELECTED PERSON</p>
            <h3>{hollywoodPerson.name}</h3>
            {productionWork !== null ? (
              <dl className="hollywood-person-facts" data-testid="hollywood-person-work-facts">
                <div>
                  <dt>Role on picture</dt>
                  <dd>{productionWork.productionRole === 'director' ? 'Director' : 'Lead actor'}</dd>
                </div>
                <div><dt>Picture</dt><dd>{productionWork.productionTitle}</dd></div>
                <div><dt>Production phase</dt><dd>{productionWork.phaseLabel}</dd></div>
                <div>
                  <dt>{productionWork.kind === 'managed-production' ? 'Production facilities' : 'Workplace'}</dt>
                  <dd>
                    {productionWork.kind === 'managed-production'
                      ? productionWork.productionFacilities.facilityLabel
                      : 'Not recorded · legacy schedule'}
                  </dd>
                </div>
                <div><dt>Production status</dt><dd>{productionWork.productionStatusLabel}</dd></div>
                <div>
                  <dt>Production countdown</dt>
                  <dd>{productionWork.productionWeeksRemaining} production weeks remaining</dd>
                </div>
                {productionWork.productionRole === 'director' &&
                  productionWork.directorTaskStatus !== null && (
                    <div><dt>Director task</dt><dd>{productionWork.directorTaskStatus}</dd></div>
                  )}
              </dl>
            ) : work?.kind === 'roster' ? (
              <p className="hollywood-person-work-note" data-testid="hollywood-person-roster-work">
                No production assignment is represented for this person in the current Lot snapshot.
              </p>
            ) : (
              <p className="hollywood-person-work-note is-unavailable" data-testid="hollywood-person-work-unavailable">
                Current work details are unavailable from this Lot snapshot.
              </p>
            )}
            <dl className="hollywood-person-career" data-testid="hollywood-person-career-summary">
              <div><dt>Assignment</dt><dd>{selectedAssignmentLabel}</dd></div>
              <div><dt>Career</dt><dd>{selectedCareerLabel ?? 'Career details unavailable'}</dd></div>
            </dl>
            {canOpenSelectedTalentProfile && (
              <button
                type="button"
                className="accent hollywood-profile-command"
                data-testid={`hollywood-open-talent-profile-${hollywoodPerson.id}`}
                onClick={() => onOpenTalentProfile?.(hollywoodPerson.id)}
              >
                Open talent profile
              </button>
            )}
          </div>
        )
      })()

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
      <div
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="lot-week-update-announcement"
      >
        {advanceFeedback !== null && advanceFeedback.constructionCompletion === null
          ? `Week ${advanceFeedback.week}. Studio Lot updated.`
          : ''}
      </div>
      <header className="lot-topbar">
        <div className="lot-brand">
          <h1
            ref={studioHeadingRef}
            className="mark lot-studio-heading"
            tabIndex={-1}
            data-testid="lot-studio-heading"
          >
            {snapshot.studioName}
          </h1>
          <span className="lot-sub">{hollywood ? 'Studio Chronicle · Hollywood, 1948' : 'Studio Lot'} · Week {snapshot.week}</span>
        </div>
        <div className="lot-topbar-actions">
          <span className="lot-cash" data-testid="lot-cash">
            {snapshot.cash < 0 ? '-' : ''}${Math.abs(Math.round(snapshot.cash)).toLocaleString('en-US')}
          </span>
          <button
            ref={advanceButtonRef}
            type="button"
            className="primary lot-advance-week"
            onPointerDown={containWorldInput}
            onMouseDown={containWorldInput}
            onTouchStart={containWorldInput}
            onClick={onAdvance}
            data-testid="lot-advance-week"
          >
            Advance one week
          </button>
          <button className="ghost" onClick={onExit} data-testid="lot-return-dashboard">
            Open Dashboard
          </button>
        </div>
      </header>

      <div className="lot-body">
        <div className="lot-stage-wrap">
          {/* Primary visual world surface; the DOM companion is its semantic equivalent. */}
          <div ref={mountRef} className="lot-canvas" data-testid="studio-lot-canvas" aria-hidden="true" />

          {advanceFeedback?.constructionCompletion && (
            <div
              className="lot-event-notice"
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
            >
              <ConstructionCompletionNotice
                completion={advanceFeedback.constructionCompletion}
              />
            </div>
          )}

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
                          data-world-problem={
                            currentSceneryLoadInContext?.state === 'blocked' &&
                            currentSceneryLoadInContext.operation.productionId === hollywoodOperation.productionId
                              ? 'service-yard'
                              : 'stage-7'
                          }
                          aria-label={
                            currentSceneryLoadInContext?.state === 'blocked' &&
                            currentSceneryLoadInContext.operation.productionId === hollywoodOperation.productionId
                              ? `Inspect ${hollywoodOperation.title} scenery problem at Scenery & Service: ${hollywoodOperation.blocker.headline}`
                              : `Inspect ${hollywoodOperation.title} problem at Soundstage 7: ${hollywoodOperation.blocker.headline}`
                          }
                          onClick={() => {
                            if (
                              currentSceneryLoadInContext?.state === 'blocked' &&
                              currentSceneryLoadInContext.operation.productionId === hollywoodOperation.productionId
                            ) {
                              inspectHollywoodSceneryLoadIn(hollywoodOperation.productionId)
                            } else {
                              inspectHollywoodStage7(hollywoodOperation.productionId)
                            }
                          }}
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
                className={`hollywood-inspector${annexSelected ? ' is-annex' : ''}${selectedSceneryLoadInContext ? ' is-scenery' : ''}${hollywoodPerson ? ' is-person' : ''}`}
                data-testid={
                  annexSelected
                    ? 'lot-annex-context'
                    : selectedSceneryLoadInContext
                      ? 'hollywood-scenery-load-in-context'
                      : 'hollywood-inspector'
                }
                onPointerDown={containWorldInput}
                onMouseDown={containWorldInput}
                onTouchStart={containWorldInput}
              >
                {annexSelected
                  ? annexContextContents
                  : selectedSceneryLoadInContext
                    ? sceneryLoadInContextContents
                    : (
                  <>
                    {personInspectorContents ?? (
                      <>
                        <p className="hollywood-eyebrow">{hollywoodPlace ? 'SELECTED PLACE' : 'STUDIO DESK'}</p>
                        <h3>{hollywoodPlace?.label ?? hollywoodOperation?.title ?? 'Studio idle'}</h3>
                        <p>{hollywoodPlace
                          ? `Affordances: ${hollywoodPlace.affordances.join(' · ')}`
                          : hollywoodOperation
                            ? `${hollywoodOperation.phaseLabel} · ${hollywoodOperation.facilityLabel}`
                            : 'No production requires a studio command.'}</p>
                      </>
                    )}
                    {hollywoodInspectorOperation && hollywoodPlace === null && showHollywoodInspectorTaskChain && (
                  <div
                    className="hollywood-task-chain"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    tabIndex={-1}
                    ref={hollywoodTaskStatusRef}
                    data-testid={`hollywood-task-status-${hollywoodInspectorOperation.productionId}`}
                  >
                    <span className="done">PHASE<b>{hollywoodInspectorOperation.phaseLabel}</b></span><i>›</i>
                    <span className={hollywoodInspectorOperation.taskStatus ? 'done' : ''}>TASK<b>{hollywoodInspectorOperation.taskStatus ?? 'None'}</b></span><i>›</i>
                    <span className={hollywoodInspectorOperation.currentCommand ? '' : 'done'}>STATUS<b>{hollywoodInspectorOperation.statusLabel}</b></span>
                  </div>
                    )}
                    {hollywoodPlace === null && hollywoodInspectorOperation?.locationBuildingId === 'stage-b' && (
                  <p className="hollywood-stage-fallback" data-testid="hollywood-stage-12-fallback">
                    {hollywoodInspectorOperation.facilityLabel} is authoritative. This district view depicts Soundstage 7; manage this production from the inspector.
                  </p>
                    )}
                    {hollywoodPlace === null && hollywoodInspectorOperation?.currentCommand && (
                  <button
                    className="accent hollywood-command"
                    disabled={!onProductionCommand}
                    ref={hollywoodCommandRef}
                    onClick={() => dispatchHollywoodProductionCommand(
                      hollywoodInspectorOperation.productionId,
                      hollywoodInspectorOperation.currentCommand!,
                    )}
                    data-testid={`hollywood-production-command-${hollywoodInspectorOperation.currentCommand.kind}`}
                  >
                    {hollywoodInspectorOperation.currentCommand.label}
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
                  ref={namedPeopleGroupRef}
                  className="hollywood-people"
                  role="group"
                  aria-label="Named studio people"
                  tabIndex={-1}
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
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                data-testid="hollywood-activity-announcement"
              >
                {hollywoodActivity && (
                  <span
                    key={hollywoodActivitySerial}
                    className="hollywood-activity"
                    data-testid="hollywood-activity-message"
                  >
                    {hollywoodActivity}
                  </span>
                )}
              </div>
              {identityProof && hollywoodPerf && (
                <div className="hollywood-perf" data-testid="hollywood-performance">
                  {hollywoodPerf.fps} fps · {hollywoodPerf.onePercentLowFps} fps 1% low · {hollywoodPerf.displayObjects} objects · {hollywoodPerf.dynamicActors} actors · {hollywoodPerf.textureMemoryMb} MB decoded · {hollywoodPerf.roleAtlasEncodedKb} KB atlas · {hollywoodPerf.p99FrameMs} ms p99 · {hollywoodPerf.worstFrameMs} ms worst · {hollywoodPerf.updateMs} ms update · {hollywoodPerf.drawCalls} draws
                </div>
              )}
            </>
          )}

          {!hollywood && annexSelected && (
            <section
              className="lot-annex-fallback-context"
              data-testid="lot-annex-context"
              aria-label="Development and Casting Annex construction"
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
            >
              {annexContextContents}
            </section>
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
            <div
              className="lot-canvas-note"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              data-testid="lot-canvas-loading"
            >
              Preparing the lot…
            </div>
          )}
          {canvasFailed && (
            <div className="lot-canvas-note" role="status" data-testid="lot-canvas-fallback">
              The visual lot could not load here. Every destination remains in the list, and exact
              Stage 7 work remains available through the Studio Desk.
            </div>
          )}

          {selectionInfo && !annexSelected && (
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
            {hollywood && currentSceneryLoadInContext && (
              <li>
                <button
                  type="button"
                  className={`lot-nav-item att-decision-required lot-nav-service-yard${
                    selectedSceneryLoadInContext ? ' is-selected' : ''
                  }`}
                  data-testid="lot-nav-service-yard"
                  data-attention="decision-required"
                  aria-current={selectedSceneryLoadInContext ? 'true' : undefined}
                  onPointerDown={containWorldInput}
                  onMouseDown={containWorldInput}
                  onTouchStart={containWorldInput}
                  onClick={() => inspectHollywoodSceneryLoadIn(
                    currentSceneryLoadInContext.operation.productionId,
                  )}
                  title={`Manage ${currentSceneryLoadInContext.operation.title} scenery load-in at Soundstage 7`}
                >
                  <span className="lot-nav-name">Scenery &amp; Service</span>
                  <span className="lot-nav-state">
                    <span className="lot-nav-icon" aria-hidden="true">
                      {currentSceneryLoadInContext.state === 'blocked' ? '!' : '✓'}
                    </span>
                    <span className="lot-nav-att-word visually-hidden">Decision required: </span>
                    {currentSceneryLoadInContext.state === 'blocked'
                      ? `${currentSceneryLoadInContext.operation.title} load-in is blocking Soundstage 7`
                      : `${currentSceneryLoadInContext.operation.title} scenery delivered · take ready to schedule`}
                  </span>
                </button>
              </li>
            )}
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  ref={(node) => {
                    companionButtonRefs.current[row.id] = node
                  }}
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
