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

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  ActionOutcome,
  ConstructionCompletionSummary,
  GameState,
  PlacementQuote,
  PlacementRequest,
  FacilityMoveRequest,
  FacilityDemolitionRequest,
  ScriptProjectsReadModel,
  StudioCalendarView,
  StudioConstructionView,
} from '../engine/adapter.ts'
import {
  careerIdentityLabel,
  placementQuote,
  facilityDemolitionRefusal,
  scriptProjectsBoard,
  studioCalendarBoard,
  studioDecision,
  studioDevelopment,
  studioLotSnapshot,
  talentAssignmentContext,
  talentProfile,
} from '../engine/adapter.ts'
import { ConstructionCompletionNotice } from '../components/ConstructionCompletionNotice.tsx'
// PF1-M2 presentation. The grammar is pure and lives above the Lot; the Lot only owns the
// refusal seam the engine hands it and the DOM the motion runs on.
import { punctuateRefusal } from '../presentation/punctuate.ts'
import type { CueMotion } from '../presentation/eventGrammar.ts'
import { useTransientNotice } from '../presentation/transientNotice.ts'
import { CashReadout } from '../presentation/CashReadout.tsx'
import { useResolvedMotion } from '../shell/useResolvedMotion.ts'
import {
  LotNextEventRail,
  type LotNextEventRailAction,
} from './LotNextEventRail.tsx'
import {
  LotScriptReviewPanel,
  type LotScriptReviewPanelFeedback,
} from './LotScriptReviewPanel.tsx'
import {
  LotCastingReviewPanel,
  type LotCastingReviewPanelFeedback,
} from './LotCastingReviewPanel.tsx'
import { moneyExact } from '../format.ts'
import type {
  AttentionState,
  BuildingId,
  LotPublicityOffer,
  LotPersonState,
  LotProductionCommand,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'
import {
  BUILDING_ACTION,
  BUILDING_LABELS,
  FOUNDING_BUILDING_IDS,
  buildingActionFor,
} from './snapshot/StudioLotSnapshot.ts'
import { sceneryLoadInContext } from './snapshot/sceneryLoadIn.ts'
import {
  sameStage7ProductionDetailContext,
  stage7ProductionDetailContext,
  type Stage7ProductionDetailContext,
  type Stage7ProductionOwnerIntent,
} from './snapshot/stage7Production.ts'
import {
  gateHiringCandidateContext,
  gateHiringMarketContext,
  sameGateHiringCandidateContext,
  type GateCandidateOwnerIntent,
  type GateHiringCandidateContext,
} from './snapshot/gateHiring.ts'
import {
  publicityCampaignContext,
  type LotPublicityResult,
  type LotPublicityTier,
} from './snapshot/publicityCampaign.ts'
import {
  operationalAnnexWorkContext,
  type LotAnnexWorkContext,
  type LotAnnexWorkOccupant,
  type LotAnnexWorkOwnerIntent,
} from './snapshot/annexWork.ts'
import { lotPersonWorkContext } from './snapshot/personWork.ts'
import { lotPersonPresenceLine } from './snapshot/presenceLines.ts'
import {
  activeProductionCompanyContexts,
  lotPeopleForCompanyPresentation,
  productionCompanyRoleLabel,
} from './snapshot/productionCompany.ts'
import {
  initialProductionFormationContext,
  productionFormationContext,
  type GreenlightFormationReceipt,
} from './snapshot/productionFormation.ts'
import {
  currentScreenplayCommissionReceipt,
  type ScreenplayCommissionReceipt,
} from './snapshot/scriptCommission.ts'
import {
  currentLotAuditionPlanningReceipt,
  LOT_AUDITION_OPENER_TESTID,
  type LotAuditionPlanningOpenerKind,
  type LotAuditionPlanningReceipt,
} from './snapshot/auditionPlanning.ts'
import {
  currentLotNextEventProductionCommand,
  sameLotNextEventProductionCommand,
  sameLotNextEventReceipt,
  type LotCadenceFeedback,
  type LotNextEventReceipt,
} from './snapshot/nextEvent.ts'
import {
  acceptedLotScriptReviewSuccess,
  currentLotScriptReviewContext,
  sameLotScriptReviewAction,
  sameLotScriptReviewContext,
  type LotScriptReviewAction,
  type LotScriptReviewContext,
  type LotScriptReviewSuccess,
  type LotScriptReviewTarget,
} from './snapshot/scriptReview.ts'
import {
  acceptedLotCastingReviewSuccess,
  currentLotCastingReviewContext,
  sameLotCastingReviewAction,
  sameLotCastingReviewContext,
  type LotCastingReviewAction,
  type LotCastingReviewContext,
  type LotCastingReviewSuccess,
  type LotCastingReviewTarget,
} from './snapshot/castingReview.ts'
import {
  firstFilmJourneyContext,
  guidanceMarkerBuildingId,
  journeyTargetBuildingId,
  type FirstFilmJourneyNext,
} from './snapshot/firstFilmJourney.ts'
import {
  LotPictureGuidanceCard,
  type LotPictureGuidanceState,
} from './LotPictureGuidanceCard.tsx'
import {
  getLotSelectedBuilding,
  setLotSelectedBuilding,
} from './snapshot/selectedBuildingSession.ts'
import { lotStageAssignment } from './snapshot/stageAssignment.ts'
import { BUILDING_BLURBS, resolveAction, type LotRoute } from './navigation.ts'
import {
  lotBuildingInspectorContext,
  type LotBuildingInspectorPrimaryAction,
} from './buildingInspector.ts'
import {
  blueprintById,
  buildQuoteKey,
  buildReceiptText,
  clampBuildOrigin,
  clampMoveOrigin,
  defaultBuildOrigin,
  lotParcelInspectorContext,
  parcelById,
  placementsOnParcel,
  quoteFacts,
  quoteRejectionText,
  type LotBuildDraft,
  type LotParcelInspectorContext,
} from './buildMode.ts'
import { lotBuildCatalog, lotCatalogEntryFor } from './buildCatalog.ts'
import type { LotCellPoint } from './snapshot/StudioLotSnapshot.ts'
import { placedFacilityIdOf } from './snapshot/StudioLotSnapshot.ts'
import {
  demolishConfirmText,
  demolishReceiptText,
  demolitionSubjectOf,
  facilityMutationBlockedReason,
  moveFlowHeading,
  moveReceiptText,
  placedFacilityById,
} from './facilityMutation.ts'
import { PLACE_BY_BUILDING } from './tycoon/world.ts'
import { getAudioService } from '../audio/audioService.ts'
import type { LotActionEvent, SelectionInfo, StudioLotView as StudioLotViewClass } from './StudioLotView.ts'
import type {
  HollywoodPerformance,
  HollywoodGateVisitorPresentation,
  HollywoodGateVisitorSelection,
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
  tycoonWorldEnabled,
} from '../flags.ts'
import type { IdentityMode } from './identity/manifest.ts'

export type { LotAuditionPlanningOpenerKind }

/**
 * Exact, non-serialized origin proof for the one retained first-session planner.
 * The cue is presentation-only; App must still prove the complete Casting board.
 */
export type LotAuditionPlanningOrigin = Readonly<{
  openerKind: LotAuditionPlanningOpenerKind
  opener: HTMLButtonElement
  cue: Readonly<{
    buildingId: 'casting'
    action: 'browse-talent'
    attention: AttentionState
    reason: string
  }>
}>

// The era this studio operates in, as the world states it in its own masthead. It is
// the ONE place the year is written: the topbar subtitle and the era-keyed music bed
// read the same constant, so the studio can never sound like one decade and read as
// another. (GameState's EraConfig carries no year — costScale, sound, censorship and
// television only — so the presented era is presentation truth, and this is where it
// lives until the engine owns a calendar year.)
const LOT_ERA_KEY = '1948'

// The retained plate's scene RE-EMITS `selected` when the host itself re-asserts a
// selection (`LotScene.selectFromHost` → `select`), while the shipped grid world paints
// without emitting (`TycoonScene.selectFromHost`). A restored, reconciled or route-driven
// selection is not a player gesture, so the select cue is suppressed across exactly those
// calls. The scene emits synchronously inside the call, which is what makes a counter
// around it sufficient — the same reasoning the existing orientation guard already uses.
let hostDrivenSelection = 0
function withoutSelectCue(paint: () => void): void {
  hostDrivenSelection += 1
  try {
    paint()
  } finally {
    hostDrivenSelection -= 1
  }
}

// Phaser listens for mouse and touch input at window level. Contain every down
// event family from React overlays so a desk command cannot also select the
// building geometrically underneath it and unmount before the later `click`.
const containWorldInput = (event: { stopPropagation(): void }) => {
  event.stopPropagation()
}

function focusVisibleLotOwner(target: HTMLElement | null) {
  if (target === null || !target.isConnected) return
  // Review owners scroll internally at compact/zoomed layouts. Bring the exact
  // owner into its nearest scrollport before transferring focus so focus never
  // lands truthfully but invisibly below the live viewport.
  target.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  target.focus({ preventScroll: true })
}

type SceneryLoadInPresentationState = 'blocked' | 'ready'
type PublicityPhysicalAvailability = 'pending' | 'available' | 'unavailable'
type GatePhysicalAvailability = 'pending' | 'available' | 'unavailable'
type GateCandidateAction = 'profile' | 'hiring'

const PUBLICITY_PLACE_ID = 'publicity'
/**
 * The place ids the world reports for the three re-assertable surfaces (C1-M5).
 *
 * Named here rather than imported from the grid world's own table because BOTH
 * renderers answer with them — the retained plate and the tycoon world share this
 * place vocabulary exactly, which is why `worldSelection()` can be compared against
 * them whichever scene is live.
 */
const SERVICE_YARD_PLACE_ID = 'service-yard'
const ANNEX_PLACE_ID = 'annex-parcel'
const STAGE_7_PLACE_ID = 'stage-7'
const PUBLICITY_BUILDING_ID = 'admin'
const PUBLICITY_LABEL = 'Administration & Publicity'
const PUBLICITY_AFFORDANCES = ['work', 'meeting', 'publicity'] as const
const GATE_PLACE_ID = 'studio-gate'
const GATE_BUILDING_ID = 'gate'
const GATE_LABEL = 'Studio Gate'
const GATE_AFFORDANCES = ['gate-security', 'arrival'] as const

function isExactPublicityPlace(place: HollywoodPlaceSelection): boolean {
  return place.id === PUBLICITY_PLACE_ID &&
    place.buildingId === PUBLICITY_BUILDING_ID &&
    place.label === PUBLICITY_LABEL &&
    place.affordances.length === PUBLICITY_AFFORDANCES.length &&
    place.affordances.every((value, index) => value === PUBLICITY_AFFORDANCES[index])
}

function isExactGatePlace(place: HollywoodPlaceSelection): boolean {
  return place.id === GATE_PLACE_ID &&
    place.buildingId === GATE_BUILDING_ID &&
    place.label === GATE_LABEL &&
    place.affordances.length === GATE_AFFORDANCES.length &&
    place.affordances.every((value, index) => value === GATE_AFFORDANCES[index])
}

function sameGateOwnerIntent(
  left: GateCandidateOwnerIntent,
  right: GateCandidateOwnerIntent,
): boolean {
  return left.talentId === right.talentId &&
    left.studioSeed === right.studioSeed &&
    left.name === right.name &&
    left.creativeRole === right.creativeRole
}

function gateRoleLabel(role: GateCandidateOwnerIntent['creativeRole']): string {
  switch (role) {
    case 'actor': return 'Actor'
    case 'director': return 'Director'
    case 'writer': return 'Writer'
    case 'craft': return 'Craft'
  }
}

function gateVisitorPresentation(
  context: GateHiringCandidateContext,
): HollywoodGateVisitorPresentation {
  return {
    talentId: context.candidate.talentId,
    name: context.candidate.name,
    marketRole: context.candidate.creativeRole,
    presentationRole: context.candidate.creativeRole === 'director' ? 'director' : 'talent',
    employmentStatus: 'freeAgent',
    studioSeed: context.ownerIntent.studioSeed,
    marketWeek: context.marketWeek,
    offerTermWeeks: [...context.candidate.offerTermWeeks],
    placeId: GATE_PLACE_ID,
  }
}

function isFieldExactPublicityOffer(
  rendered: LotPublicityOffer,
  latest: LotPublicityOffer,
): boolean {
  const renderedEntries = Object.entries(rendered)
  const latestRecord = latest as unknown as Record<string, unknown>
  return renderedEntries.length === Object.keys(latest).length &&
    renderedEntries.every(([key, value]) => (
      Object.prototype.hasOwnProperty.call(latest, key) && latestRecord[key] === value
    ))
}

function publicityTierLabel(tier: LotPublicityTier): string {
  switch (tier) {
    case 'whisper': return 'Whisper'
    case 'push': return 'Push'
    case 'blitz': return 'Blitz'
  }
}

function cleanPublicityError(error: string): string {
  return error
    .replace(/^applyActions: publicity rejected — /, '')
    .replace(/ \(D-17B §2\)$/, '')
}

function moneyWithCents(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

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
  /** Claim/release the exact App-owned authority lifetime of this mounted Lot presentation. */
  onPresentationMount?: () => () => void
  /** Host maps a lot route to the existing app navigation (setScreen). */
  onNavigate: (route: LotRoute) => void
  /** Open the supporting Dashboard surface. */
  onExit: () => void
  /** Emit one authoritative App-owned weekly-advance intent. */
  onAdvance: () => void
  /** One mutually exclusive App-owned weekly or next-event feedback arm. */
  cadenceFeedback?: LotCadenceFeedback | null
  /**
   * PF1-M2 transient-notice epoch. App advances it once per authoritative state
   * replacement; a notice that was announced under an older epoch has been overtaken by a
   * newer player action and expires. Presentation only — never `GameState`, never saved.
   * Defaults to a constant so a directly-rendered Lot behaves exactly as it did before.
   */
  noticeEpoch?: number
  /**
   * PF1-M2 punctuation hand-off: the motion strength the cue grammar chose for the moment
   * that just arrived. The Lot animates its EXISTING notice DOM with it and nothing else —
   * no new canvas object, no new tween, no manufactured event.
   */
  punctuation?: { key: number; motion: CueMotion } | null
  /** Legacy focused-test compatibility; App uses cadenceFeedback. */
  advanceFeedback?: {
    week: number
    constructionCompletion: ConstructionCompletionSummary | null
  } | null
  /** Exact focus instruction for canonical entry or a bounded deep-surface return. */
  entryFocus?:
    | 'studio-home'
    | 'selected-building'
    | 'advance-week'
    | 'publicity-campaign'
    | 'annex-work'
    | 'gate-arrivals'
    | 'stage-7-production'
    | 'gate-candidate'
    | 'production-formation'
    | 'script-review'
    | 'casting-review'
    | 'next-event-control'
    | 'next-event-reaction'
  /** Exact identity required by the transient Stage 7 deep-return arm. */
  entryStage7ProductionId?: string
  /** Exact transient candidate identity required by the Gate deep-return arm. */
  entryGateCandidate?: GateCandidateOwnerIntent
  /** Exact accepted-greenlight receipt required by the formation return arm. */
  entryProductionFormation?: GreenlightFormationReceipt
  /** One transient accepted formation delivered without replacing this mounted Lot. */
  liveFormationPresentation?: {
    identity: object
    acceptedState: GameState
    receipt: GreenlightFormationReceipt
  }
  /** Consume the transient identity whether strict formation succeeds or fails neutral. */
  onLiveFormationConsumed?: (identity: object) => void
  /** One transient accepted commission delivered without replacing this mounted Lot. */
  liveCommissionPresentation?: {
    identity: object
    acceptedState: GameState
    receipt: ScreenplayCommissionReceipt
  }
  /** Consume the transient commission identity whether strict current truth succeeds or fails. */
  onLiveCommissionConsumed?: (identity: object) => void
  /** One transient accepted Casting-session receipt for this already-mounted Lot. */
  liveAuditionPresentation?: {
    identity: object
    acceptedState: GameState
    receipt: LotAuditionPlanningReceipt
  }
  /** Consume the audition identity once whether strict current truth succeeds or fails. */
  onLiveAuditionConsumed?: (identity: object) => void
  /**
   * Offer one exact current Casting cue to App's independent retained-planner gate.
   * `true` keeps this Lot mounted; false/absence preserves the canonical deep route.
   */
  onOpenAuditionPlanning?: (
    renderedState: GameState,
    origin: LotAuditionPlanningOrigin,
  ) => boolean
  /** Exact pending screenplay identity required by the deep-return arm. */
  entryScriptReviewTarget?: LotScriptReviewTarget
  /** Exact pending Casting-review identity required by the deep-return arm. */
  entryCastingReviewTarget?: LotCastingReviewTarget
  /** Exact receipt restored only by App's accepted-state reaction-return arm. */
  entryNextEventReceipt?: LotNextEventReceipt
  /** Suppress a generic Annex announcement already owned by an exact completion surface. */
  suppressOperationalAnnouncement?: boolean
  /** Open the supporting Dashboard and return to this exact campaign context. */
  onOpenPublicityDashboard?: () => void
  /** App-owned publicity action. The Lot receives only a validated tier/week receipt. */
  onRunPublicity?: (tier: LotPublicityTier) => LotPublicityResult
  /** Dispatch exactly the command projected by the authoritative operations read model. */
  onProductionCommand?: (command: LotProductionCommand) => ActionOutcome | void
  /** Consume one exact event-session production command after independent App validation. */
  onRunNextEventProductionCommand?: (
    receipt: LotNextEventReceipt,
    command: LotProductionCommand,
  ) => ActionOutcome
  /** Dispatch one exact Core-emitted screenplay decision without unmounting the live Lot. */
  onRunScriptReviewAction?: (
    renderedState: GameState,
    context: LotScriptReviewContext,
    action: LotScriptReviewAction,
    receipt: LotNextEventReceipt | null,
  ) => ActionOutcome
  /** Open the exact current screenplay card in its supporting deep owner. */
  onOpenScriptReviewDetails?: (
    renderedState: GameState,
    context: LotScriptReviewContext,
  ) => boolean
  /** Dispatch the one exact Core-emitted Casting acknowledgement from the mounted Lot. */
  onRunCastingReviewAction?: (
    renderedState: GameState,
    context: LotCastingReviewContext,
    action: LotCastingReviewAction,
    receipt: LotNextEventReceipt | null,
  ) => ActionOutcome
  /** Open the exact current Casting review card in its supporting deep owner. */
  onOpenCastingReviewDetails?: (
    renderedState: GameState,
    context: LotCastingReviewContext,
  ) => boolean
  /** Dispatch the existing parameter-free Annex action through the authoritative App owner. */
  onStartDevelopmentCastingAnnex?: () => ActionOutcome
  /**
   * Build Mode V1: commit one exact placement through the authoritative App owner.
   * The Lot sends only a blueprint id and an origin; price, duration and legality are
   * re-derived by the Engine inside the commit and never taken from this surface.
   */
  onPlaceFacility?: (placement: PlacementRequest) => ActionOutcome
  /**
   * Move & Demolish V1 (C1-M3b): re-site or take down one placed facility through the
   * authoritative App owner. The Lot sends an identity and (for a move) an origin;
   * legality, price and refund are the Engine's, re-derived inside the action.
   */
  onMoveFacility?: (move: FacilityMoveRequest) => ActionOutcome
  onDemolishFacility?: (demolition: FacilityDemolitionRequest) => ActionOutcome
  /** Navigate to the exact current Annex occupant's existing deep owner after revalidation. */
  onOpenAnnexWorkDetails?: (intent: LotAnnexWorkOwnerIntent) => boolean
  /** Navigate from an explicitly inspected Stage 7 production to its existing Board card. */
  onOpenStage7ProductionDetails?: (intent: Stage7ProductionOwnerIntent) => boolean
  /** Open the canonical profile only after independent latest-state Gate validation. */
  onOpenGateCandidateProfile?: (intent: GateCandidateOwnerIntent) => boolean
  /** Navigate to the exact current Hiring card after independent latest-state validation. */
  onOpenGateCandidateHiring?: (intent: GateCandidateOwnerIntent) => boolean
  /** Open the one App-owned canonical Talent Profile over this mounted Lot. */
  onOpenTalentProfile?: (personId: string) => void
  /** Close that profile when its exact selected Lot handoff becomes invalid. */
  onCloseTalentProfile?: (personId: string) => void
  /** The exact App-owned profile currently open over this Lot, if any. */
  openTalentProfileId?: string | null
  /** Suspend every world/companion action while a modal remains above the living renderer. */
  worldInputSuspended?: boolean
  /** Run the existing App-owned adapter once from this exact rendered state. */
  onSimToNextEvent?: (renderedBefore: GameState) => boolean
  /** Open one exact supporting owner after App independently revalidates the receipt. */
  onOpenNextEventDetails?: (
    renderedState: GameState,
    receipt: LotNextEventReceipt,
  ) => boolean
  /** Demote an exact presentation whose current semantic projection no longer validates. */
  onInvalidateNextEvent?: (
    renderedState: GameState,
    receipt: LotNextEventReceipt,
  ) => boolean
  /** Dismiss only current next-event presentation. */
  onDismissNextEvent?: () => void
  /**
   * Open the shell's settings dialog over this MOUNTED world (PF1-M3). Optional because
   * settings is not a screen and this component is mounted directly by its own suites: with
   * no shell above it there is no dialog to host, so the control is not offered at all.
   */
  onOpenSettings?: (() => void) | undefined
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
/**
 * Build Mode V1 — the non-pointer path to every origin.
 *
 * The world's own grid convention (see `tycoon/world.ts`): +gx runs DOWN-RIGHT on
 * screen and +gy runs DOWN-LEFT. The four controls are named for what the player
 * actually sees the ghost do, and the arrow keys are bound to the same four steps, so
 * the canvas and the semantic surface reach every legal origin identically (law 10).
 */
const BUILD_ORIGIN_NUDGES: readonly {
  testId: string
  label: string
  gx: number
  gy: number
}[] = [
  { testId: 'up-left', label: '↖ Up-left', gx: -1, gy: 0 },
  { testId: 'up-right', label: '↗ Up-right', gx: 0, gy: -1 },
  { testId: 'down-left', label: '↙ Down-left', gx: 0, gy: 1 },
  { testId: 'down-right', label: '↘ Down-right', gx: 1, gy: 0 },
]

const BUILD_ORIGIN_KEY_STEPS: Readonly<Record<string, { gx: number; gy: number }>> = {
  ArrowLeft: { gx: -1, gy: 0 },
  ArrowRight: { gx: 1, gy: 0 },
  ArrowUp: { gx: 0, gy: -1 },
  ArrowDown: { gx: 0, gy: 1 },
}

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

/**
 * The Studio Calendar read model, or null when this accepted state cannot produce one.
 *
 * The calendar throws on a hostile/incoherent accepted save. That withholds the in-world
 * inspector's occupancy facts (shift laws 17/21) — it must never become a reason to eject
 * the player onto a deep screen, which is exactly the defect M1.5 exists to close.
 */
function inspectorCalendarView(state: GameState): StudioCalendarView | null {
  try {
    return studioCalendarBoard(state)
  } catch {
    return null
  }
}

/**
 * The Screenplay board, or null when this accepted state cannot produce one.
 *
 * Same discipline as the calendar above, for the same reason: the board is what publishes
 * `commission.canStart`, so a board that rejects a hostile save withholds Development's
 * Commission verb — it never fabricates one, and never closes the panel.
 */
function inspectorScriptBoardView(state: GameState): ScriptProjectsReadModel | null {
  try {
    return scriptProjectsBoard(state)
  } catch {
    return null
  }
}

// PF1-M3: the OS query is no longer read here. Motion is the RESOLVED value now — the OS
// signal strengthened, never weakened, by the player's own setting — and exactly one module
// owns that rule (`shell/motion.ts`). A second reader of the raw media query would be a
// second answer to the same question, and the one that ignored the player's setting.

function lotNextEventEligibility(state: GameState): {
  eligible: boolean
  reason: string | null
} {
  try {
    const pending = studioDecision(state)
    if (pending === null) return { eligible: true, reason: null }
    switch (pending.kind) {
      case 'scriptReview':
        return {
          eligible: false,
          reason: `Select Development and review ${pending.decision.title} in the live Studio Lot before simming to another event.`,
        }
      case 'castingReview':
        return {
          eligible: false,
          reason: `Select Casting and review ${pending.decision.title} in the live Studio Lot before simming to another event.`,
        }
      case 'productionDecision':
        return {
          eligible: false,
          reason: `${pending.decision.title} — ${
            pending.decision.blocker?.headline ?? pending.decision.command?.label ?? pending.decision.statusLabel
          } at ${pending.decision.currentFacility}. Resolve this production problem before simming to another event.`,
        }
    }
  } catch {
    return {
      eligible: false,
      reason: 'Current studio decision status is unavailable. Review the live lot before simming.',
    }
  }
}

function scriptReviewSuccessMessage(success: LotScriptReviewSuccess): string {
  if (success.kind === 'accepted') {
    return `${success.title} is ${success.statusLabel}. ${success.writerName} remains attached as writer.`
  }
  return `${success.title} is in final rewrite with ${success.writerName} through Week ${success.dueWeek} at ${success.facilityName}, slot ${success.slot + 1}.`
}

function castingReviewSuccessMessage(success: LotCastingReviewSuccess): string {
  if (success.kind === 'clear') {
    return `${success.title} casting review is complete. Opening the focused Package Assembly.`
  }
  const blockers = success.blockers.map((blocker) => blocker.headline).join(' · ')
  return `${success.title} casting review is complete. Persisted evidence remains available. The current package blockers still apply: ${blockers}`
}

function auditionPlanningRoleLabel(
  role: LotAuditionPlanningReceipt['reads'][number]['role'],
): 'Lead' | 'Antagonist' | 'Support' {
  switch (role) {
    case 'lead': return 'Lead'
    case 'antagonist': return 'Antagonist'
    case 'support': return 'Support'
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

function annexStatusDetail(
  view: StudioConstructionView,
  work: LotAnnexWorkContext | null,
): string {
  switch (view.status) {
    case 'legacy':
      return 'This legacy studio has no managed expansion parcel. No facility or project history is inferred.'
    case 'vacant':
      return 'The fixed expansion parcel is open. Starting the Annex commits the full capital cost now.'
    case 'building':
      return `${view.completedAdvances} of ${view.durationWeeks} weekly advances complete · committed for Week ${view.dueWeek}.`
    case 'operational':
      return work === null
        ? `Completed in Week ${view.completedWeek}. Current Annex slot use is unavailable.`
        : `Completed in Week ${view.completedWeek}. Current Annex slot use: ${work.annexWork.occupied} of 1.`
  }
}

function annexOwnerKindLabel(owner: LotAnnexWorkOccupant['owner']): string {
  switch (owner) {
    case 'production': return 'Production'
    case 'script': return 'Screenplay'
    case 'casting': return 'Casting session'
  }
}

function annexActivityLabel(activity: LotAnnexWorkOccupant['activity']): string {
  switch (activity) {
    case 'development': return 'Development'
    case 'preProduction': return 'Pre-production'
    case 'drafting': return 'Drafting'
    case 'rewriting': return 'Rewriting'
    case 'auditioning': return 'Auditioning'
  }
}

function annexOwnerDestination(owner: LotAnnexWorkOccupant['owner']): string {
  switch (owner) {
    case 'production': return 'Production Board'
    case 'script': return 'Writers Room'
    case 'casting': return 'Casting Room'
  }
}

function isExactAnnexWorkContext(
  rendered: LotAnnexWorkContext,
  latest: LotAnnexWorkContext,
): boolean {
  if (
    rendered.state !== latest.state ||
    rendered.annexWork.facilityId !== latest.annexWork.facilityId ||
    rendered.annexWork.facilityName !== latest.annexWork.facilityName ||
    rendered.annexWork.capability !== latest.annexWork.capability ||
    rendered.annexWork.capacity !== latest.annexWork.capacity ||
    rendered.annexWork.occupied !== latest.annexWork.occupied ||
    rendered.annexWork.available !== latest.annexWork.available ||
    rendered.annexWork.slot !== latest.annexWork.slot
  ) return false

  const renderedOccupant = rendered.occupant
  const latestOccupant = latest.occupant
  if (renderedOccupant === null || latestOccupant === null) {
    return renderedOccupant === latestOccupant
  }
  return (
    renderedOccupant.owner === latestOccupant.owner &&
    renderedOccupant.ownerId === latestOccupant.ownerId &&
    renderedOccupant.title === latestOccupant.title &&
    renderedOccupant.activity === latestOccupant.activity &&
    renderedOccupant.workState === latestOccupant.workState &&
    renderedOccupant.statusLabel === latestOccupant.statusLabel &&
    renderedOccupant.blocker?.kind === latestOccupant.blocker?.kind &&
    renderedOccupant.blocker?.headline === latestOccupant.blocker?.headline &&
    renderedOccupant.blocker?.detail === latestOccupant.blocker?.detail
  )
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
  onPresentationMount,
  onNavigate,
  onExit,
  onAdvance,
  cadenceFeedback = null,
  noticeEpoch = 0,
  punctuation = null,
  advanceFeedback: legacyAdvanceFeedback = null,
  entryFocus,
  entryStage7ProductionId,
  entryGateCandidate,
  entryProductionFormation,
  liveFormationPresentation,
  onLiveFormationConsumed,
  liveCommissionPresentation,
  onLiveCommissionConsumed,
  liveAuditionPresentation,
  onLiveAuditionConsumed,
  onOpenAuditionPlanning,
  entryScriptReviewTarget,
  entryCastingReviewTarget,
  entryNextEventReceipt,
  suppressOperationalAnnouncement = false,
  onOpenPublicityDashboard,
  onRunPublicity,
  onProductionCommand,
  onRunNextEventProductionCommand,
  onRunScriptReviewAction,
  onOpenScriptReviewDetails,
  onRunCastingReviewAction,
  onOpenCastingReviewDetails,
  onStartDevelopmentCastingAnnex,
  onPlaceFacility,
  onMoveFacility,
  onDemolishFacility,
  onOpenAnnexWorkDetails,
  onOpenStage7ProductionDetails,
  onOpenGateCandidateProfile,
  onOpenGateCandidateHiring,
  onOpenTalentProfile,
  onCloseTalentProfile,
  openTalentProfileId = null,
  worldInputSuspended = false,
  onSimToNextEvent,
  onOpenNextEventDetails,
  onInvalidateNextEvent,
  onDismissNextEvent,
  onOpenSettings,
}: Props) {
  useLayoutEffect(() => onPresentationMount?.(), [onPresentationMount])

  const advanceFeedback = cadenceFeedback?.kind === 'week'
    ? cadenceFeedback
    : cadenceFeedback === null
      ? legacyAdvanceFeedback
      : null
  const rawNextEventFeedback = cadenceFeedback?.kind === 'next-event-exact' ||
      cadenceFeedback?.kind === 'next-event-neutral'
    ? cadenceFeedback
    : null
  const rawExactNextEventReceipt =
    rawNextEventFeedback?.kind === 'next-event-exact'
      ? rawNextEventFeedback.receipt
      : null
  const exactNextEventReceiptIsClosed =
    rawExactNextEventReceipt !== null &&
    sameLotNextEventReceipt(rawExactNextEventReceipt, rawExactNextEventReceipt)
  const rawNextEventProductionReceipt =
    exactNextEventReceiptIsClosed &&
    rawExactNextEventReceipt?.target.kind === 'production'
      ? rawExactNextEventReceipt
      : null
  const rawNextEventScriptReceipt =
    exactNextEventReceiptIsClosed &&
    rawExactNextEventReceipt?.target.kind === 'script'
      ? rawExactNextEventReceipt
      : null
  const rawNextEventCastingReceipt =
    exactNextEventReceiptIsClosed &&
    rawExactNextEventReceipt?.target.kind === 'casting'
      ? rawExactNextEventReceipt
      : null
  const currentScriptReviewContext = currentLotScriptReviewContext(state)
  const nextEventScriptReviewContext =
    rawNextEventScriptReceipt === null ||
    rawNextEventScriptReceipt.target.kind !== 'script'
    ? null
    : currentLotScriptReviewContext(state, {
        projectId: rawNextEventScriptReceipt.target.projectId,
        title: rawNextEventScriptReceipt.target.title,
      })
  const currentCastingReviewContext = currentLotCastingReviewContext(state)
  const nextEventCastingReviewContext =
    rawNextEventCastingReceipt === null ||
    rawNextEventCastingReceipt.target.kind !== 'casting'
      ? null
      : currentLotCastingReviewContext(state, {
          sessionId: rawNextEventCastingReceipt.target.sessionId,
          projectId: rawNextEventCastingReceipt.target.projectId,
          title: rawNextEventCastingReceipt.target.title,
        })
  const nextEventProductionCommand = rawNextEventProductionReceipt === null
    ? null
    : currentLotNextEventProductionCommand(state, rawNextEventProductionReceipt)
  const invalidNextEventProductionReceipt =
    rawNextEventProductionReceipt !== null && nextEventProductionCommand === null
      ? rawNextEventProductionReceipt
      : null
  const invalidNextEventScriptReceipt =
    rawNextEventScriptReceipt !== null && nextEventScriptReviewContext === null
      ? rawNextEventScriptReceipt
      : null
  const invalidNextEventCastingReceipt =
    rawNextEventCastingReceipt !== null && nextEventCastingReviewContext === null
      ? rawNextEventCastingReceipt
      : null
  const malformedExactNextEventReceipt =
    rawExactNextEventReceipt !== null && !exactNextEventReceiptIsClosed
      ? rawExactNextEventReceipt
      : null
  const invalidNextEventReceipt =
    malformedExactNextEventReceipt ??
    invalidNextEventProductionReceipt ??
    invalidNextEventScriptReceipt ??
    invalidNextEventCastingReceipt
  const nextEventFeedback: Extract<
    LotCadenceFeedback,
    { kind: 'next-event-exact' | 'next-event-neutral' }
  > | null = invalidNextEventReceipt === null
    ? rawNextEventFeedback
    : {
        kind: 'next-event-neutral',
        toWeek: sameLotNextEventReceipt(invalidNextEventReceipt, invalidNextEventReceipt)
          ? invalidNextEventReceipt.toWeek
          : state.market.tick,
        cashNow: sameLotNextEventReceipt(invalidNextEventReceipt, invalidNextEventReceipt)
          ? invalidNextEventReceipt.cashNow
          : state.studio.cash,
        stopMessage: 'Studio event details changed. Review the current lot.',
        constructionCompletion: null,
      }
  const nextEventConstructionCompletion = nextEventFeedback?.kind === 'next-event-exact'
    ? nextEventFeedback.receipt.constructionCompletion
    : nextEventFeedback?.constructionCompletion ?? null
  const nextEventEligibility = lotNextEventEligibility(state)
  const mountRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<StudioLotViewClass | null>(null)
  /**
   * Latest world-verb router. The grid world activates a physical place by calling
   * exactly the handler the DOM companion list calls for that destination, so a canvas
   * click and a keyboard navigation can never resolve to different owners.
   */
  const activateRef = useRef<((id: BuildingId) => void) | null>(null)
  // Build Mode V1: the renderer is constructed once, so its two placement seams are
  // reached through refs, exactly as the building activation seam already is.
  const activateParcelRef = useRef<((parcelId: string) => void) | null>(null)
  const moveBuildOriginRef =
    useRef<((origin: LotCellPoint, fromParcelId?: string | null) => void) | null>(null)
  const rendererStateRef = useRef<GameState | null>(null)
  const studioHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const namedPeopleGroupRef = useRef<HTMLDivElement | null>(null)
  const advanceButtonRef = useRef<HTMLButtonElement | null>(null)
  const nextEventButtonRef = useRef<HTMLButtonElement | null>(null)
  const nextEventHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const nextEventFeedbackRef = useRef(nextEventFeedback)
  nextEventFeedbackRef.current = nextEventFeedback
  const nextEventOrientationRef = useRef<LotNextEventReceipt | null>(null)
  const nextEventOrientationOwnedRef = useRef(false)
  const applyingNextEventOrientationRef = useRef(false)
  const nextEventGestureRef = useRef<{
    renderedState: GameState
    origin: 'pointer' | 'keyboard'
  } | null>(null)
  const nextEventHeldKeyRef = useRef<'Enter' | ' ' | null>(null)
  const nextEventSuppressUntokenedVirtualRef = useRef(false)
  const nextEventVirtualReleaseEpochRef = useRef(0)
  const nextEventSuppressPhysicalStartRef = useRef(false)
  const nextEventPhysicalReleaseEpochRef = useRef(0)
  // A newly mounted host may be the successor of a full-studio replacement. Until this exact
  // control receives a fresh primary PointerEvent, reject mouse/touch compatibility starts that
  // could be the delayed tail of a gesture captured by the unmounted studio.
  const nextEventPhysicalPrimaryRequiredRef = useRef(true)
  const nextEventWasSuspendedRef = useRef(worldInputSuspended)
  const nextEventDocumentWasHiddenRef = useRef(false)
  const companionButtonRefs = useRef<Partial<Record<BuildingId, HTMLButtonElement | null>>>({})
  /**
   * The Casting inspector's own "Plan auditions" verb, so the retained planner can prove
   * the control the player ACTUALLY pressed instead of borrowing the companion rail's.
   */
  const auditionPlanningVerbRef = useRef<HTMLButtonElement | null>(null)
  const onNavigateRef = useRef(onNavigate)
  onNavigateRef.current = onNavigate
  const onCloseTalentProfileRef = useRef(onCloseTalentProfile)
  onCloseTalentProfileRef.current = onCloseTalentProfile
  const worldInputSuspendedRef = useRef(worldInputSuspended)
  worldInputSuspendedRef.current = worldInputSuspended

  const releaseNextEventVirtualTail = useCallback(() => {
    nextEventSuppressUntokenedVirtualRef.current = true
    const epoch = ++nextEventVirtualReleaseEpochRef.current
    queueMicrotask(() => {
      if (nextEventVirtualReleaseEpochRef.current === epoch) {
        nextEventSuppressUntokenedVirtualRef.current = false
      }
    })
  }, [])

  const releaseNextEventVirtualTailAfterTask = useCallback(() => {
    nextEventSuppressUntokenedVirtualRef.current = true
    const epoch = ++nextEventVirtualReleaseEpochRef.current
    window.setTimeout(() => {
      if (nextEventVirtualReleaseEpochRef.current === epoch) {
        nextEventSuppressUntokenedVirtualRef.current = false
      }
    }, 0)
  }, [])

  const suppressNextEventPhysicalStartsThroughTask = useCallback(() => {
    nextEventSuppressPhysicalStartRef.current = true
    const epoch = ++nextEventPhysicalReleaseEpochRef.current
    window.setTimeout(() => {
      if (nextEventPhysicalReleaseEpochRef.current === epoch) {
        nextEventSuppressPhysicalStartRef.current = false
      }
    }, 0)
  }, [])

  const clearNextEventGesture = useCallback((sealVirtualTail: boolean) => {
    nextEventGestureRef.current = null
    nextEventHeldKeyRef.current = null
    if (sealVirtualTail) {
      // Cancellation boundaries can precede the browser's keyup/click turn.
      // Hold only through the next task, never as an unbounded accessibility lock.
      releaseNextEventVirtualTailAfterTask()
      suppressNextEventPhysicalStartsThroughTask()
    } else {
      nextEventVirtualReleaseEpochRef.current += 1
      nextEventSuppressUntokenedVirtualRef.current = false
    }
  }, [releaseNextEventVirtualTailAfterTask, suppressNextEventPhysicalStartsThroughTask])

  const settleNextEventKeyUp = useCallback((key: string) => {
    if (nextEventHeldKeyRef.current !== key) return
    nextEventHeldKeyRef.current = null
    const gesture = nextEventGestureRef.current
    if (gesture?.origin !== 'keyboard') return
    window.setTimeout(() => {
      if (
        nextEventGestureRef.current === gesture &&
        nextEventHeldKeyRef.current === null
      ) {
        clearNextEventGesture(true)
      }
    }, 0)
  }, [clearNextEventGesture])

  const [selected, setSelected] = useState<BuildingId | null>(getLotSelectedBuilding)
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null)
  const commissionWitnessHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const [screenplayCommissionActivity, setScreenplayCommissionActivity] = useState<{
    acceptedState: GameState
    receipt: ScreenplayCommissionReceipt
  } | null>(null)
  const visibleScreenplayCommissionActivity =
    screenplayCommissionActivity?.acceptedState === state
      ? screenplayCommissionActivity
      : null
  useEffect(() => {
    if (
      screenplayCommissionActivity !== null &&
      screenplayCommissionActivity.acceptedState !== state
    ) {
      setScreenplayCommissionActivity(null)
    }
  }, [screenplayCommissionActivity, state])
  const auditionPlanningWitnessHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const [auditionPlanningActivity, setAuditionPlanningActivity] = useState<{
    acceptedState: GameState
    receipt: LotAuditionPlanningReceipt
  } | null>(null)
  const visibleAuditionPlanningActivity =
    auditionPlanningActivity?.acceptedState === state
      ? auditionPlanningActivity
      : null
  useEffect(() => {
    if (
      auditionPlanningActivity !== null &&
      auditionPlanningActivity.acceptedState !== state
    ) {
      setAuditionPlanningActivity(null)
    }
  }, [auditionPlanningActivity, state])
  const [scriptReviewIntent, setScriptReviewIntent] = useState<LotScriptReviewTarget | null>(
    entryFocus === 'script-review' ? entryScriptReviewTarget ?? null : null,
  )
  const scriptReviewHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const scriptReviewDispatchGuardRef = useRef<{
    renderedState: GameState
    context: LotScriptReviewContext
    action: LotScriptReviewAction
  } | null>(null)
  const [scriptReviewActivity, setScriptReviewActivity] = useState<{
    acceptedState: GameState
    context: LotScriptReviewContext
    success: LotScriptReviewSuccess | null
    feedback: LotScriptReviewPanelFeedback
  } | null>(null)
  const visibleScriptReviewActivity =
    scriptReviewActivity?.acceptedState === state ? scriptReviewActivity : null
  const selectedScriptReviewContext =
    scriptReviewIntent !== null &&
    currentScriptReviewContext !== null &&
    scriptReviewIntent.projectId === currentScriptReviewContext.projectId &&
    scriptReviewIntent.title === currentScriptReviewContext.title
      ? currentScriptReviewContext
      : null
  useEffect(() => {
    if (scriptReviewActivity !== null && scriptReviewActivity.acceptedState !== state) {
      setScriptReviewActivity(null)
      scriptReviewDispatchGuardRef.current = null
    }
  }, [scriptReviewActivity, state])
  useEffect(() => {
    if (
      scriptReviewIntent !== null &&
      selectedScriptReviewContext === null &&
      visibleScriptReviewActivity === null
    ) {
      setScriptReviewIntent(null)
      setLotSelectedBuilding(null)
      setSelected(null)
      scriptReviewDispatchGuardRef.current = null
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
    }
  }, [scriptReviewIntent, selectedScriptReviewContext, visibleScriptReviewActivity])
  const [castingReviewIntent, setCastingReviewIntent] = useState<LotCastingReviewTarget | null>(
    entryFocus === 'casting-review' ? entryCastingReviewTarget ?? null : null,
  )
  const castingReviewHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const castingReviewDispatchGuardRef = useRef<{
    renderedState: GameState
    context: LotCastingReviewContext
    action: LotCastingReviewAction
  } | null>(null)
  const [castingReviewActivity, setCastingReviewActivity] = useState<{
    acceptedState: GameState
    context: LotCastingReviewContext
    success: LotCastingReviewSuccess | null
    feedback: LotCastingReviewPanelFeedback
  } | null>(null)
  const visibleCastingReviewActivity =
    castingReviewActivity?.acceptedState === state ? castingReviewActivity : null
  const selectedCastingReviewContext =
    castingReviewIntent !== null &&
    currentCastingReviewContext !== null &&
    castingReviewIntent.sessionId === currentCastingReviewContext.sessionId &&
    castingReviewIntent.projectId === currentCastingReviewContext.projectId &&
    castingReviewIntent.title === currentCastingReviewContext.title
      ? currentCastingReviewContext
      : null
  useEffect(() => {
    if (castingReviewActivity !== null && castingReviewActivity.acceptedState !== state) {
      setCastingReviewActivity(null)
      castingReviewDispatchGuardRef.current = null
    }
  }, [castingReviewActivity, state])
  useEffect(() => {
    if (
      castingReviewIntent !== null &&
      selectedCastingReviewContext === null &&
      visibleCastingReviewActivity === null
    ) {
      setCastingReviewIntent(null)
      setLotSelectedBuilding(null)
      setSelected(null)
      castingReviewDispatchGuardRef.current = null
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
    }
  }, [castingReviewIntent, selectedCastingReviewContext, visibleCastingReviewActivity])
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasFailed, setCanvasFailed] = useState(false)
  const [nextEventRailInputResetEpoch, setNextEventRailInputResetEpoch] = useState(0)
  const resetNextEventRailInput = useCallback(() => {
    setNextEventRailInputResetEpoch((epoch) => epoch + 1)
  }, [])
  // The one resolved answer, shared with the shell. `.lot-reduced-motion`, the scene's own
  // `setReducedMotion`, and the notice motion gate all read THIS — so the player's setting
  // reaches the renderer, not only the stylesheets.
  const reducedMotion = useResolvedMotion().resolved === 'reduced'
  const hollywood = operationHollywoodEnabled()
  // Tycoon World Conversion M1: the grid property is the adopted default world. It rides
  // on the Hollywood semantic contract, so the plate rollback also rolls this back.
  const tycoon = hollywood && tycoonWorldEnabled()
  /**
   * The keyboard shortcut the whole-property control may honestly annotate.
   *
   * The grid world (`TycoonScene`) and the legacy overview lot (`LotScene`) both bind
   * `R` to the overview reset; the retained painted plate never has. Naming a key that
   * world does not answer would be a promise the product cannot keep, so the control
   * there offers the same command without claiming a shortcut for it (law 12).
   */
  const cameraHomeShortcut: string | null = tycoon || !hollywood ? 'R' : null
  const [hollywoodPerson, setHollywoodPerson] = useState<LotPersonState | null>(null)
  const hollywoodPersonRef = useRef<LotPersonState | null>(hollywoodPerson)
  const [hollywoodPlace, setHollywoodPlace] = useState<HollywoodPlaceSelection | null>(null)
  const [gateSelected, setGateSelected] = useState(false)
  const [gateCandidateIntent, setGateCandidateIntent] =
    useState<GateCandidateOwnerIntent | null>(null)
  const [gatePhysicalAvailability, setGatePhysicalAvailability] =
    useState<GatePhysicalAvailability>('pending')
  const [formationReceipt, setFormationReceipt] = useState<GreenlightFormationReceipt | null>(
    entryFocus === 'production-formation' ? entryProductionFormation ?? null : null,
  )
  const [formationWitnessVisible, setFormationWitnessVisible] = useState(false)
  const [formationAnnouncement, setFormationAnnouncement] = useState('')
  // undefined = default desk orientation, null = an explicit empty desk, string =
  // one exact selected production. The distinction lets stale world contexts fail
  // empty instead of silently falling back to whichever film is now first.
  const [hollywoodProductionId, setHollywoodProductionId] = useState<string | null | undefined>(
    entryFocus === 'stage-7-production' ||
      entryFocus === 'gate-candidate' ||
      entryFocus === 'production-formation' ||
      entryFocus === 'script-review' ||
      entryFocus === 'casting-review'
      ? null
      : undefined,
  )
  // Deep-detail provenance is deliberately separate from the production that the
  // Studio Desk happens to orient toward. Only an explicit world inspection or an
  // exact typed return may populate this transient identity.
  const [hollywoodStage7DetailProductionId, setHollywoodStage7DetailProductionId] =
    useState<string | null>(null)
  const [hollywoodSceneryLoadInProductionId, setHollywoodSceneryLoadInProductionId] = useState<string | null>(null)
  const [hollywoodSceneryCommandPending, setHollywoodSceneryCommandPending] = useState(false)
  const [hollywoodActivity, setHollywoodActivity] = useState<string | null>(null)
  const [hollywoodActivitySerial, setHollywoodActivitySerial] = useState(0)
  const [hollywoodPerf, setHollywoodPerf] = useState<HollywoodPerformance | null>(null)
  const [hollywoodPerfWindow, setHollywoodPerfWindow] = useState(0)
  const [annexSelected, setAnnexSelected] = useState(false)
  const [annexPending, setAnnexPending] = useState(false)
  const [annexAnnouncement, setAnnexAnnouncement] = useState('')
  const [annexAnnouncementSerial, setAnnexAnnouncementSerial] = useState(0)
  const [publicitySelected, setPublicitySelected] = useState(false)
  const [publicityPhysicalAvailability, setPublicityPhysicalAvailability] =
    useState<PublicityPhysicalAvailability>('pending')
  const [publicityPending, setPublicityPending] = useState(false)
  // World Inspector Default V1 (M1.5): the in-world panel a physical building click lands
  // when no richer world context applies. It replaces the old `dispatchRoute` fallthrough,
  // so no ordinary building click can eject the player out of the world any more.
  const [buildingInspectorId, setBuildingInspectorId] = useState<BuildingId | null>(null)
  /** Read by the verb dispatcher, which must act on the id the panel currently owns. */
  const buildingInspectorIdRef = useRef<BuildingId | null>(null)
  buildingInspectorIdRef.current = buildingInspectorId
  const buildingInspectorHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const buildingInspectorFocusNonceRef = useRef(0)
  // ── Build Mode V1 (M2-UI) ─────────────────────────────────────────────────
  // Three pieces of session state, none of them GameState: which parcel's panel is
  // open, the mutable placement draft, and the one-shot receipt a commit earns.
  // The draft carries VALUE and a MONOTONIC REVISION (shift law 16), so a late canvas
  // hover can never resurrect an origin the player has already moved off.
  const [parcelInspectorId, setParcelInspectorId] = useState<string | null>(null)
  const [buildDraft, setBuildDraft] = useState<LotBuildDraft | null>(null)
  const [buildPending, setBuildPending] = useState(false)
  const [buildError, setBuildError] = useState<string | null>(null)
  const [buildReceipt, setBuildReceipt] = useState<string | null>(null)
  const [buildFlowOpen, setBuildFlowOpen] = useState(false)
  const [buildAnnouncementSerial, setBuildAnnouncementSerial] = useState(0)
  // Move & Demolish V1 (C1-M3b). The demolish intent is the whole confirm surface: it
  // is world state, anchored to the inspector, and it commits nothing by existing.
  const [demolishIntent, setDemolishIntent] = useState<number | null>(null)
  const demolishIntentRef = useRef<number | null>(null)
  const demolishConfirmRef = useRef<HTMLButtonElement | null>(null)
  const [demolishPending, setDemolishPending] = useState(false)
  const demolishPendingRef = useRef(false)
  const [demolishError, setDemolishError] = useState<string | null>(null)
  const parcelInspectorHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const buildCommitRef = useRef<HTMLButtonElement | null>(null)
  const buildOriginPadRef = useRef<HTMLDivElement | null>(null)
  const parcelInspectorIdRef = useRef<string | null>(null)
  const buildDraftRef = useRef<LotBuildDraft | null>(null)
  const buildPendingRef = useRef(false)
  const buildRevisionRef = useRef(0)
  const parcelFocusNonceRef = useRef(0)
  const pendingBuildFocusRef =
    useRef<'parcel' | 'commit' | 'origin' | 'building' | 'demolish' | null>(null)
  const onPlaceFacilityRef = useRef(onPlaceFacility)
  onPlaceFacilityRef.current = onPlaceFacility
  const onMoveFacilityRef = useRef(onMoveFacility)
  onMoveFacilityRef.current = onMoveFacility
  const onDemolishFacilityRef = useRef(onDemolishFacility)
  onDemolishFacilityRef.current = onDemolishFacility
  const hollywoodCommandRef = useRef<HTMLButtonElement | null>(null)
  const hollywoodTaskStatusRef = useRef<HTMLDivElement | null>(null)
  const hollywoodStage7HeadingRef = useRef<HTMLHeadingElement | null>(null)
  const hollywoodPersonStatusRef = useRef<HTMLDivElement | null>(null)
  const formationReceiptRef = useRef<GreenlightFormationReceipt | null>(formationReceipt)
  const formationPendingFocusRef = useRef<string | null>(null)
  const formationEntryConsumedRef = useRef(false)
  const liveFormationConsumedRef = useRef<object | null>(null)
  const liveCommissionConsumedRef = useRef<object | null>(null)
  const liveAuditionConsumedRef = useRef<WeakSet<object>>(new WeakSet())
  const entryFocusConsumedRef = useRef(false)
  const gateHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const gateVisitorHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const gateProfileButtonRef = useRef<HTMLButtonElement | null>(null)
  const gateSelectedRef = useRef(false)
  const gateCandidateIntentRef = useRef<GateCandidateOwnerIntent | null>(null)
  const gatePendingFocusRef = useRef<'gate' | 'visitor' | null>(null)
  const gateFocusNonceRef = useRef(0)
  const gateNavigationPendingRef = useRef(false)
  const gateCandidateHeldKeyRef = useRef<'Enter' | ' ' | null>(null)
  const gateCandidateSuppressClickRef = useRef<string | null>(null)
  const gateHeldKeyRef = useRef<'Enter' | ' ' | null>(null)
  const gateActivationRef = useRef<{
    action: GateCandidateAction
    context: GateHiringCandidateContext
  } | null>(null)
  const gateSuppressNextClickRef = useRef(false)
  const gateSuppressKeyboardClickRef = useRef<{
    action: GateCandidateAction
    context: GateHiringCandidateContext
  } | null>(null)
  const gateProfileReturnFocusRef = useRef(false)
  const gateInvalidProfileClosedRef = useRef<string | null>(null)
  const pendingHollywoodFocusProductionId = useRef<string | null>(null)
  const pendingHollywoodHeadingFocusProductionId = useRef<string | null>(null)
  const hollywoodStage7DetailProductionIdRef = useRef<string | null>(null)
  const hollywoodStage7NavigationPendingRef = useRef(false)
  const hollywoodStage7HeldKeyRef = useRef<'Enter' | ' ' | null>(null)
  const hollywoodStage7ActivationRef = useRef<Stage7ProductionDetailContext | null>(null)
  const hollywoodStage7SuppressNextClickRef = useRef(false)
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
  const annexWorkHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const annexSelectedRef = useRef(false)
  const annexPendingRef = useRef(false)
  const annexWorkNavigationPendingRef = useRef(false)
  const annexWorkHeldKeyRef = useRef<'Enter' | ' ' | null>(null)
  const annexWorkActivationRef = useRef<LotAnnexWorkContext | null>(null)
  const annexFocusNonceRef = useRef(0)
  const annexPendingFocusRef = useRef<'default' | 'work' | null>(null)
  const annexAcceptedFocusRef = useRef(false)
  const onStartAnnexRef = useRef(onStartDevelopmentCastingAnnex)
  onStartAnnexRef.current = onStartDevelopmentCastingAnnex
  const onOpenAnnexWorkDetailsRef = useRef(onOpenAnnexWorkDetails)
  onOpenAnnexWorkDetailsRef.current = onOpenAnnexWorkDetails
  const onOpenStage7ProductionDetailsRef = useRef(onOpenStage7ProductionDetails)
  onOpenStage7ProductionDetailsRef.current = onOpenStage7ProductionDetails
  const onOpenGateCandidateProfileRef = useRef(onOpenGateCandidateProfile)
  onOpenGateCandidateProfileRef.current = onOpenGateCandidateProfile
  const onOpenGateCandidateHiringRef = useRef(onOpenGateCandidateHiring)
  onOpenGateCandidateHiringRef.current = onOpenGateCandidateHiring
  const publicityHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const publicityStatusRef = useRef<HTMLDivElement | null>(null)
  const publicityButtonRefs = useRef<Partial<Record<LotPublicityTier, HTMLButtonElement | null>>>({})
  const publicitySelectedRef = useRef(false)
  const publicityPendingRef = useRef(false)
  const publicityHeldKeyRef = useRef<'Enter' | ' ' | null>(null)
  const publicityFrameNonceRef = useRef(0)
  const acceptedPublicityRef = useRef<{
    receipt: Extract<LotPublicityResult, { ok: true }>
    renderedOffer: LotPublicityOffer
  } | null>(null)
  const onRunPublicityRef = useRef(onRunPublicity)
  onRunPublicityRef.current = onRunPublicity

  // Keep one live-region owner while replacing its child for every real event. An
  // identical second Engine rejection is still a distinct accessibility announcement.
  const announceHollywoodActivity = useCallback((activity: string) => {
    setHollywoodActivitySerial((serial) => serial + 1)
    setHollywoodActivity(activity)
  }, [])

  // PF1-M2 (Owner-approved): the receipt strip is news, not furniture. It survives the
  // action that produced it and expires on the next one, so "Screenplay commissioned: …"
  // can no longer sit under the world for the rest of the session. Nothing is written
  // down when it goes — dismissal is not a journal; history is the clippings.
  const expireHollywoodActivity = useCallback(() => {
    setHollywoodActivity(null)
  }, [])
  useTransientNotice(
    hollywoodActivitySerial,
    hollywoodActivity !== null,
    noticeEpoch,
    expireHollywoodActivity,
  )

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
  // PF1-M1 — the tab's own visibility, held as state so the lot's audio can follow the
  // renderer's existing pause/resume seam instead of inventing a second one.
  const [documentHidden, setDocumentHidden] = useState(
    () => typeof document !== 'undefined' && document.hidden,
  )
  // Is work physically underway on the property this week? Read from the SAME snapshot
  // the world is painted from — a placement still standing as a building site, or the
  // legacy annex mid-construction. The ambience derives nothing the world does not show.
  const lotConstructionActive =
    (Array.isArray(snapshot.placement?.placements) &&
      snapshot.placement.placements.some((placed) => placed.status === 'underConstruction')) ||
    (Array.isArray(snapshot.buildings) &&
      snapshot.buildings.some((building) => building.constructionStatus === 'building'))
  const latestGameStateRef = useRef(state)
  latestGameStateRef.current = state
  const currentPublicityCampaign = publicityCampaignContext(snapshot)
  const currentAnnexWork = operationalAnnexWorkContext(snapshot)
  const currentGateMarket = gateHiringMarketContext(snapshot)
  // The picture's own journey, exactly as the engine projected it. The host never
  // re-derives a stage, a headline, or a next step from GameState — it only decides
  // whether it has trustworthy truth to render, and where on the lot a semantic
  // destination physically is.
  const pictureJourney = firstFilmJourneyContext(snapshot)
  // A projection that is present but untrustworthy is NOT the same fact as no
  // projection: it may not quietly become "the studio lot is idle", a claim this host
  // cannot prove while a picture may be in development.
  const pictureGuidanceState: LotPictureGuidanceState =
    pictureJourney.kind === 'view'
      ? { kind: 'view', view: pictureJourney.view }
      : { kind: 'unavailable' }
  /**
   * M-D — the ONE building the world itself points at, or none.
   *
   * The card names the next step in words; this is the same step as a place on the
   * property. It is RENDERER PRESENTATION STATE: it is decided here from the projection
   * the snapshot already carries, delivered to the scene by an explicit command (like the
   * build ghost), and never routed through the engine adapter or the snapshot's own
   * building facts — the world's marker is not a fact about the studio.
   */
  const guidanceMarkerTarget =
    pictureJourney.kind === 'view'
      ? guidanceMarkerBuildingId(pictureJourney.view, snapshot)
      : null
  const currentFormationContext = formationReceipt === null
    ? null
    : productionFormationContext(snapshot, formationReceipt)
  const currentGateCandidate = gateCandidateIntent === null
    ? null
    : gateHiringCandidateContext(snapshot, gateCandidateIntent.talentId)
  const selectedGateCandidateContext =
    currentGateCandidate !== null &&
    gateCandidateIntent !== null &&
    sameGateOwnerIntent(currentGateCandidate.ownerIntent, gateCandidateIntent)
      ? currentGateCandidate
      : null
  gateSelectedRef.current = gateSelected
  gateCandidateIntentRef.current = gateCandidateIntent
  formationReceiptRef.current = formationReceipt
  hollywoodPersonRef.current = hollywoodPerson
  const annexView = studioDevelopment(state)
  // ── Build Mode V1 — the property, the open panel, and the live quote ───────
  const placementView = snapshot.placement ?? null
  const latestPlacementRef = useRef(placementView)
  latestPlacementRef.current = placementView
  parcelInspectorIdRef.current = parcelInspectorId
  buildDraftRef.current = buildDraft
  buildPendingRef.current = buildPending
  /**
   * The identical-input memo the ledger asks for (Entry 2's cursor loop, Entry 3's
   * byte-identical blueprint early-out). A pointer wandering forty pixels inside one
   * cell produces the same key and never re-queries; a new blueprint, origin, week,
   * cash position — or any new authoritative state at all — does.
   */
  const buildQuoteMemoKey =
    buildDraft === null
      ? null
      : buildQuoteKey(
          buildDraft.blueprintId,
          buildDraft.origin,
          snapshot.week,
          snapshot.cash,
          buildDraft.movingPlacementId,
        )
  const buildQuote: PlacementQuote | null = useMemo(() => {
    const draft = buildDraftRef.current
    if (draft === null || buildQuoteMemoKey === null) return null
    // A MOVE asks the same authority a different question: exclude the mover's own
    // cells, or the building collides with the ground it is standing on (C1-M3b).
    return placementQuote(
      state,
      { blueprintId: draft.blueprintId, origin: draft.origin },
      draft.movingPlacementId === null
        ? undefined
        : { movingPlacementId: draft.movingPlacementId },
    )
    // `buildQuoteMemoKey` carries the whole draft; `state` is the other input the pure
    // query reads. Both are listed, and nothing else can change the answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, buildQuoteMemoKey])
  const buildBlueprint =
    buildDraft === null ? null : blueprintById(placementView, buildDraft.blueprintId)
  const buildRejectionText = quoteRejectionText(buildQuote)
  // C1-M3b: the SAME draft machinery, asked whether it is carrying a building.
  const movingPlacementId = buildDraft?.movingPlacementId ?? null
  const movingFacility =
    movingPlacementId === null
      ? null
      : placedFacilityById(placementView?.placements, movingPlacementId)
  const demolishFacility =
    demolishIntent === null
      ? null
      : placedFacilityById(placementView?.placements, demolishIntent)
  const operationalAnnexCapacity = annexView.status === 'operational'
    ? annexView.currentDevelopmentCastingCapacity
    : null
  const [operationalAnnouncement, setOperationalAnnouncement] = useState('')
  const completionAnnouncementOwnedRef = useRef(suppressOperationalAnnouncement)
  const hollywoodOperations = snapshot.productionOperations ?? []
  const hollywoodProductionCompanies = activeProductionCompanyContexts(snapshot)
  const hollywoodPresentationPeople = lotPeopleForCompanyPresentation(snapshot)
  const hollywoodCompanyMembershipSignature = hollywoodProductionCompanies === null
    ? 'unavailable'
    : hollywoodProductionCompanies
        .map((company) => `${company.operation.productionId}:${company.members
          .map(({ member }) => `${member.productionRole}:${member.talentId}`)
          .join(',')}`)
        .join('|')
  const hollywoodCompanyMembers = hollywoodProductionCompanies?.flatMap((company) =>
    company.members.map(({ member, person }) => ({
      company,
      member,
      person,
    })),
  ) ?? null
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
  const latestAnnexWorkRef = useRef(currentAnnexWork)
  latestAnnexWorkRef.current = currentAnnexWork
  const latestAnnexViewRef = useRef(annexView)
  latestAnnexViewRef.current = annexView
  const selectedPersonWork = hollywoodPerson === null
    ? null
    : lotPersonWorkContext(snapshot, hollywoodPerson.id)
  // Presence on the Lot V1: what the engine says this person's WEEK is. Independent of
  // the employment facts above — a person the projection withheld simply has no line.
  const selectedPersonPresence = hollywoodPerson === null
    ? null
    : lotPersonPresenceLine(snapshot, hollywoodPerson.id)
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
  const currentStage7DetailContext = stage7ProductionDetailContext(snapshot)
  const hollywoodStage7Operation = currentStage7DetailContext?.operation ?? null
  const explicitlySelectedHollywoodMatches = typeof hollywoodProductionId !== 'string'
    ? []
    : hollywoodOperations.filter((operation) => operation.productionId === hollywoodProductionId)
  const explicitlySelectedHollywoodOperation = explicitlySelectedHollywoodMatches.length === 1
    ? explicitlySelectedHollywoodMatches[0]!
    : null
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
  const hollywoodCompanyPresentationOwned =
    hollywoodPlace === null &&
    !publicitySelected &&
    !gateSelected &&
    !annexSelected &&
    (selected === null || selected === 'stage-a')
  const hollywoodCompanyPresentationProductionId =
    !hollywoodCompanyPresentationOwned
      ? null
      : typeof hollywoodProductionId === 'string'
        ? hollywoodProductionId
        : hollywoodProductionId === undefined
          ? hollywoodOperation?.productionId ?? null
          : null
  const hollywoodCompanyPresentationExact =
    hollywoodCompanyPresentationProductionId !== null &&
    hollywoodProductionCompanies !== null &&
    hollywoodProductionCompanies.filter(
      (company) => company.operation.productionId === hollywoodCompanyPresentationProductionId,
    ).length === 1
  const hollywoodInspectorOperation =
    hollywoodPerson === null
      ? hollywoodOperation
      : selectedProductionWork !== null &&
          hollywoodOperation?.productionId === selectedProductionWork.productionId
        ? hollywoodOperation
        : null
  const hollywoodInspectorCommand =
    hollywoodInspectorOperation?.currentCommand?.kind === 'assignShootingDirector' &&
    selectedProductionWork !== null &&
    selectedProductionWork.productionRole !== 'director'
      ? null
      : hollywoodInspectorOperation?.currentCommand ?? null
  const showHollywoodInspectorTaskChain =
    hollywoodPerson === null || selectedProductionWork?.productionRole === 'director'
  const selectedStage7DetailContext =
    hollywoodStage7DetailProductionId !== null &&
    currentStage7DetailContext?.operation.productionId === hollywoodStage7DetailProductionId
      ? currentStage7DetailContext
      : null
  hollywoodStage7DetailProductionIdRef.current = hollywoodStage7DetailProductionId
  const renderedHollywoodProductionIdRef = useRef<string | null>(hollywoodOperation?.productionId ?? null)
  renderedHollywoodProductionIdRef.current = hollywoodOperation?.productionId ?? null

  const recordHollywoodRendererActivity = useCallback((activity: string) => {
    // Renderer animation may finish while an authoritative cadence event owns
    // the Lot. Keep the visual truth, but do not create a competing live event.
    if (nextEventFeedbackRef.current !== null) return
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
    // Every richer world context routes through here, so this is the one place the
    // generic World Inspector releases ownership. `enterBuildingInspectorContext` sets
    // its own id immediately AFTER calling this, exactly like the other contexts do.
    setBuildingInspectorId(null)
    // …and so is the Build Mode parcel panel: one in-world context owns the rail.
    setParcelInspectorId(null)
    // Only the dedicated strict review entry may create screenplay-review ownership.
    // Generic places that happen to share the semantic `writers` id cannot inherit it.
    setScriptReviewIntent(null)
    setScriptReviewActivity(null)
    scriptReviewDispatchGuardRef.current = null
    setCastingReviewIntent(null)
    setCastingReviewActivity(null)
    castingReviewDispatchGuardRef.current = null
    if (id !== 'writers') setScreenplayCommissionActivity(null)
    if (id !== 'casting') setAuditionPlanningActivity(null)
    setLotSelectedBuilding(id)
    setSelected(id)
  }, [])

  const paintNextEventOrientation = useCallback((paint: () => void) => {
    applyingNextEventOrientationRef.current = true
    try {
      paint()
    } finally {
      applyingNextEventOrientationRef.current = false
    }
  }, [])

  const applyNextEventPhysicalOrientation = useCallback((view: StudioLotViewClass): boolean => {
    if (!nextEventOrientationOwnedRef.current) return false
    const receipt = nextEventOrientationRef.current
    paintNextEventOrientation(() => {
      view.clearSelection()
      view.clearHollywoodPersonSelection?.()
      view.clearHollywoodPlaceSelection?.()
      if (receipt === null) return
      switch (receipt.target.kind) {
        case 'script':
          if (!hollywood) view.select('writers')
          return
        case 'casting':
          if (!hollywood) view.select('casting')
          return
        case 'run-completed':
          if (!hollywood) view.select('theater')
          return
        case 'cash':
          if (hollywood) view.selectHollywoodPublicityPlace?.()
          else view.select('admin')
          return
        case 'contracts':
          return
        case 'construction':
          if (hollywood) view.selectHollywoodAnnexPlace?.()
          else view.select('expansion')
          return
        case 'production':
          if (receipt.target.location === 'stage-7') {
            if (hollywood) view.selectHollywoodProduction?.(receipt.target.productionId)
            else view.select('stage-a')
          } else if (!hollywood) {
            view.select('stage-b')
          }
      }
    })
    return true
  }, [hollywood, paintNextEventOrientation])

  const yieldNextEventOrientation = useCallback(() => {
    nextEventOrientationRef.current = null
    nextEventOrientationOwnedRef.current = false
  }, [])

  const cancelHollywoodStage7Gesture = useCallback(() => {
    // Pointer/touch activation can emit its compatibility click after visibility,
    // renderer, or modal state has already changed. Remember that a gesture was
    // actually in flight so that one late click cannot fall back to a fresh render.
    if (hollywoodStage7ActivationRef.current !== null) {
      hollywoodStage7SuppressNextClickRef.current = true
    }
    hollywoodStage7NavigationPendingRef.current = false
    hollywoodStage7HeldKeyRef.current = null
    hollywoodStage7ActivationRef.current = null
  }, [])

  const clearHollywoodStage7DetailContext = useCallback(() => {
    hollywoodStage7DetailProductionIdRef.current = null
    cancelHollywoodStage7Gesture()
    pendingHollywoodHeadingFocusProductionId.current = null
    setHollywoodStage7DetailProductionId(null)
  }, [cancelHollywoodStage7Gesture])

  const ownHollywoodStage7DetailContext = useCallback((productionId: string) => {
    hollywoodStage7DetailProductionIdRef.current = productionId
    hollywoodStage7NavigationPendingRef.current = false
    hollywoodStage7HeldKeyRef.current = null
    hollywoodStage7ActivationRef.current = null
    hollywoodStage7SuppressNextClickRef.current = false
    setHollywoodStage7DetailProductionId(productionId)
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

  const clearFormationWitness = useCallback(() => {
    setFormationWitnessVisible(false)
    setFormationAnnouncement('')
  }, [])

  const clearFormationContext = useCallback(() => {
    formationReceiptRef.current = null
    formationPendingFocusRef.current = null
    setFormationReceipt(null)
    clearFormationWitness()
  }, [clearFormationWitness])

  const clearAnnexContext = useCallback(() => {
    annexSelectedRef.current = false
    annexAcceptedFocusRef.current = false
    annexWorkNavigationPendingRef.current = false
    annexWorkHeldKeyRef.current = null
    annexWorkActivationRef.current = null
    annexPendingFocusRef.current = null
    annexFocusNonceRef.current += 1
    setAnnexSelected(false)
    setAnnexAnnouncement('')
  }, [])

  const clearPublicityContext = useCallback(() => {
    publicityFrameNonceRef.current += 1
    publicitySelectedRef.current = false
    publicityPendingRef.current = false
    publicityHeldKeyRef.current = null
    acceptedPublicityRef.current = null
    setPublicitySelected(false)
    setPublicityPending(false)
  }, [])

  const cancelGateCandidateGesture = useCallback((preserveCandidateSelection = false) => {
    if (gateActivationRef.current !== null) gateSuppressNextClickRef.current = true
    gateNavigationPendingRef.current = false
    gateHeldKeyRef.current = null
    gateActivationRef.current = null
    gateSuppressKeyboardClickRef.current = null
    if (!preserveCandidateSelection) {
      gateCandidateHeldKeyRef.current = null
      gateCandidateSuppressClickRef.current = null
    }
  }, [])

  const clearGateCandidate = useCallback(() => {
    cancelGateCandidateGesture()
    gateCandidateIntentRef.current = null
    gatePendingFocusRef.current = null
    gateFocusNonceRef.current += 1
    setGateCandidateIntent(null)
    viewRef.current?.setHollywoodGateVisitor?.(null)
  }, [cancelGateCandidateGesture])

  const clearGateContext = useCallback(() => {
    clearGateCandidate()
    gateSelectedRef.current = false
    setGateSelected(false)
    setGatePhysicalAvailability('pending')
  }, [clearGateCandidate])

  const focusGateContext = useCallback((target: 'gate' | 'visitor') => {
    gatePendingFocusRef.current = target
    const nonce = ++gateFocusNonceRef.current
    queueMicrotask(() => {
      if (
        !gateSelectedRef.current ||
        worldInputSuspendedRef.current ||
        gateFocusNonceRef.current !== nonce ||
        gatePendingFocusRef.current !== target
      ) return
      const node = target === 'visitor'
        ? gateVisitorHeadingRef.current
        : gateHeadingRef.current
      if (node === null) return
      gatePendingFocusRef.current = null
      node.focus({ preventScroll: true })
    })
  }, [])

  // Entry restoration may create the Gate inspector one render after the entry
  // effect. Preserve the pending exact target until its ref is actually committed.
  useEffect(() => {
    const target = gatePendingFocusRef.current
    if (
      target === null ||
      !gateSelected ||
      worldInputSuspended ||
      (target === 'visitor' && gateCandidateIntent === null)
    ) return
    const node = target === 'visitor'
      ? gateVisitorHeadingRef.current
      : gateHeadingRef.current
    if (node === null) return
    gatePendingFocusRef.current = null
    node.focus({ preventScroll: true })
  }, [gateCandidateIntent, gateSelected, worldInputSuspended])

  const focusPublicityContext = useCallback((target: 'first-action' | 'heading' | 'status') => {
    queueMicrotask(() => {
      if (!publicitySelectedRef.current || worldInputSuspendedRef.current) return
      if (target === 'heading') {
        publicityHeadingRef.current?.focus({ preventScroll: true })
        return
      }
      if (target === 'first-action') {
        const current = publicityCampaignContext(latestSnapshotRef.current)
        const first = current?.offers.find((offer) => offer.available)
        if (first) {
          const button = publicityButtonRefs.current[first.tier]
          if (button && !button.disabled) {
            button.focus({ preventScroll: true })
            return
          }
        }
      }
      publicityStatusRef.current?.focus({ preventScroll: true })
    })
  }, [])

  const enterPublicityContext = useCallback((options: {
    place: HollywoodPlaceSelection | null
    paintHollywoodOutline: boolean
    focus: 'first-action' | 'heading' | false
  }): boolean => {
    if (worldInputSuspendedRef.current) return false
    if (publicityCampaignContext(latestSnapshotRef.current) === null) return false

    clearFormationContext()
    clearHollywoodStage7DetailContext()
    clearGateContext()
    if (options.place !== null && isExactPublicityPlace(options.place)) {
      clearHollywoodSceneryLoadInReactContext()
    } else {
      clearHollywoodSceneryLoadInContext()
    }
    clearAnnexContext()
    publicitySelectedRef.current = true
    publicityPendingRef.current = false
    publicityHeldKeyRef.current = null
    acceptedPublicityRef.current = null
    setPublicitySelected(true)
    setPublicityPending(false)
    setSelectionInfo(null)
    setHollywoodPerson(null)
    setHollywoodProductionId(undefined)
    setHollywoodPlace(options.place)
    pendingHollywoodFocusProductionId.current = null
    viewRef.current?.clearHollywoodPersonSelection?.()
    recordSelection('admin')

    let physicalAvailable = options.place !== null && isExactPublicityPlace(options.place)
    if (options.paintHollywoodOutline) {
      physicalAvailable = viewRef.current?.selectHollywoodPublicityPlace?.() === true
    }
    setPublicityPhysicalAvailability(
      physicalAvailable
        ? 'available'
        : canvasReady || canvasFailed
          ? 'unavailable'
        : 'pending',
    )
    if (options.focus) focusPublicityContext(options.focus)
    if (physicalAvailable && options.paintHollywoodOutline) {
      // Moving focus from the temporarily expanded semantic companion back into
      // the campaign panel collapses that companion and resizes the canvas. Let
      // both rendering turns settle, then issue the canonical office framing
      // exactly once so Phaser's resize fit cannot erase it.
      const frameNonce = ++publicityFrameNonceRef.current
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (
          publicityFrameNonceRef.current !== frameNonce ||
          !publicitySelectedRef.current ||
          worldInputSuspendedRef.current
        ) return
        viewRef.current?.focusHollywoodPlace?.(PUBLICITY_PLACE_ID)
      }))
    }
    return true
  }, [
    canvasFailed,
    canvasReady,
    clearAnnexContext,
    clearGateContext,
    clearFormationContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodSceneryLoadInReactContext,
    clearHollywoodStage7DetailContext,
    focusPublicityContext,
    recordSelection,
  ])

  const focusSelectedAnnex = useCallback((focus: 'default' | 'work' = 'default') => {
    annexPendingFocusRef.current = focus
    const nonce = ++annexFocusNonceRef.current
    queueMicrotask(() => {
      if (
        !annexSelectedRef.current ||
        worldInputSuspendedRef.current ||
        annexFocusNonceRef.current !== nonce ||
        annexPendingFocusRef.current !== focus
      ) return
      const current = latestAnnexViewRef.current
      const target =
        focus === 'work' && current.status === 'operational'
          ? annexWorkHeadingRef.current ?? annexStatusRef.current
          : current.status === 'operational' && latestAnnexWorkRef.current !== null
            ? annexWorkHeadingRef.current ?? annexStatusRef.current
            : current.status === 'vacant' && current.canStart && onStartAnnexRef.current
          ? annexBuildRef.current
          : annexStatusRef.current
      if (target === null) return
      annexPendingFocusRef.current = null
      target.focus({ preventScroll: true })
    })
  }, [])

  const enterAnnexContext = useCallback((options: {
    place: HollywoodPlaceSelection | null
    paintHollywoodOutline: boolean
    focus: 'default' | 'work' | false
  }): boolean => {
    if (worldInputSuspendedRef.current) return false
    if (!hasExactAnnexProjection(latestSnapshotRef.current, latestAnnexViewRef.current)) return false

    clearFormationContext()
    clearHollywoodStage7DetailContext()
    clearGateContext()
    clearPublicityContext()
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
    if (options.focus) focusSelectedAnnex(options.focus)
    return true
  }, [
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearFormationContext,
    clearGateContext,
    clearPublicityContext,
    focusSelectedAnnex,
    recordSelection,
  ])

  const enterHollywoodSceneryLoadInContext = useCallback((
    selection: HollywoodSceneryLoadInSelection,
    options: { paintHollywoodOutline: boolean; focus: boolean },
  ): boolean => {
    if (
      worldInputSuspendedRef.current ||
      !hollywood ||
      selection.placeId !== 'service-yard' ||
      selection.locationBuildingId !== 'stage-a'
    ) return false
    const exact = sceneryLoadInContext(latestSnapshotRef.current)
    if (
      exact === null ||
      exact.operation.productionId !== selection.productionId
    ) return false

    clearFormationContext()
    const preservesExactStage7Context =
      hollywoodStage7DetailProductionIdRef.current === selection.productionId &&
      stage7ProductionDetailContext(latestSnapshotRef.current)?.operation.productionId ===
        selection.productionId
    if (!preservesExactStage7Context) clearHollywoodStage7DetailContext()

    clearGateContext()
    clearPublicityContext()
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
  }, [
    clearAnnexContext,
    clearFormationContext,
    clearGateContext,
    clearHollywoodStage7DetailContext,
    clearPublicityContext,
    hollywood,
    recordSelection,
  ])

  const enterHollywoodProductionContext = useCallback((
    productionId: string,
    options: {
      stage7Only: boolean
      detailEligible: boolean
      focus: 'primary' | 'heading' | false
    },
  ): boolean => {
    if (worldInputSuspendedRef.current) return false
    const current = latestSnapshotRef.current
    const stage7 = options.stage7Only ? stage7ProductionDetailContext(current) : null
    const matches = options.stage7Only
      ? stage7?.operation.productionId === productionId
        ? [stage7.operation]
        : []
      : (current.productionOperations ?? []).filter(
          (operation) => operation.productionId === productionId,
        )
    const exact = matches.length === 1 ? matches[0]! : null
    if (!exact) return false

    const ownedFormation = formationReceiptRef.current === null
      ? null
      : productionFormationContext(current, formationReceiptRef.current)
    const preservesFormation =
      ownedFormation?.operation.productionId === exact.productionId
    if (!preservesFormation) clearFormationContext()
    if (options.detailEligible && exact.locationBuildingId === 'stage-a') {
      ownHollywoodStage7DetailContext(exact.productionId)
    } else {
      clearHollywoodStage7DetailContext()
    }
    clearGateContext()
    clearPublicityContext()
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
      pendingHollywoodHeadingFocusProductionId.current =
        options.focus === 'heading' ? exact.productionId : null
      queueMicrotask(() => {
        if (
          pendingHollywoodFocusProductionId.current !== exact.productionId ||
          renderedHollywoodProductionIdRef.current !== exact.productionId
        ) return
        const target = options.focus === 'heading'
          ? hollywoodStage7HeadingRef.current
          : exact.currentCommand
            ? hollywoodCommandRef.current
            : hollywoodTaskStatusRef.current
        if (!target) return
        target.focus({ preventScroll: true })
        pendingHollywoodFocusProductionId.current = null
        pendingHollywoodHeadingFocusProductionId.current = null
      })
    }
    return true
  }, [
    clearAnnexContext,
    clearFormationContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearGateContext,
    clearPublicityContext,
    ownHollywoodStage7DetailContext,
    recordSelection,
  ])

  const enterGateContext = useCallback((options: {
    place: HollywoodPlaceSelection | null
    paintHollywoodOutline: boolean
    candidate: GateCandidateOwnerIntent | null
    focus: 'gate' | 'visitor' | false
  }): boolean => {
    if (worldInputSuspendedRef.current) return false
    const market = gateHiringMarketContext(latestSnapshotRef.current)
    if (market === null) return false

    const requested = options.candidate === null
      ? null
      : gateHiringCandidateContext(
          latestSnapshotRef.current,
          options.candidate.talentId,
        )
    const candidate = requested !== null &&
      options.candidate !== null &&
      sameGateOwnerIntent(requested.ownerIntent, options.candidate)
        ? requested
        : null

    clearFormationContext()
    clearHollywoodStage7DetailContext()
    clearPublicityContext()
    if (options.place !== null && isExactGatePlace(options.place)) {
      // The scene has already painted the Gate before emitting its exact place event.
      // Drop only React's old service-yard ownership so we do not erase that outline.
      clearHollywoodSceneryLoadInReactContext()
    } else {
      clearHollywoodSceneryLoadInContext()
    }
    clearAnnexContext()
    clearGateCandidate()
    gateSelectedRef.current = true
    gateCandidateIntentRef.current = candidate?.ownerIntent ?? null
    setGateSelected(true)
    setGateCandidateIntent(candidate?.ownerIntent ?? null)
    setSelectionInfo(null)
    setHollywoodPerson(null)
    setHollywoodProductionId(null)
    setHollywoodPlace(options.place)
    pendingHollywoodFocusProductionId.current = null
    viewRef.current?.clearHollywoodPersonSelection?.()
    recordSelection('gate')

    let physicalAvailable = options.place !== null && isExactGatePlace(options.place)
    if (options.paintHollywoodOutline) {
      physicalAvailable = viewRef.current?.selectHollywoodGatePlace?.() === true
    }
    const visitorAccepted = viewRef.current?.setHollywoodGateVisitor?.(
      candidate === null ? null : gateVisitorPresentation(candidate),
    ) ?? false
    setGatePhysicalAvailability(
      physicalAvailable && (candidate === null || visitorAccepted)
        ? 'available'
        : canvasReady || canvasFailed
          ? 'unavailable'
          : 'pending',
    )
    if (physicalAvailable && options.paintHollywoodOutline) {
      viewRef.current?.focusHollywoodGate?.()
    }
    if (options.focus) {
      focusGateContext(candidate === null ? 'gate' : options.focus)
    }
    return true
  }, [
    canvasFailed,
    canvasReady,
    clearAnnexContext,
    clearGateCandidate,
    clearFormationContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodSceneryLoadInReactContext,
    clearHollywoodStage7DetailContext,
    clearPublicityContext,
    focusGateContext,
    recordSelection,
  ])

  const selectGateCandidate = useCallback((talentId: string): boolean => {
    if (worldInputSuspendedRef.current || !gateSelectedRef.current) return false
    const candidate = gateHiringCandidateContext(latestSnapshotRef.current, talentId)
    if (candidate === null) return false

    cancelGateCandidateGesture(true)
    gateCandidateIntentRef.current = candidate.ownerIntent
    setGateCandidateIntent(candidate.ownerIntent)
    setHollywoodPerson(null)
    setHollywoodProductionId(null)
    setSelectionInfo(null)
    viewRef.current?.clearHollywoodPersonSelection?.()
    const visitorAccepted = viewRef.current?.setHollywoodGateVisitor?.(
      gateVisitorPresentation(candidate),
    ) ?? false
    const physicalAvailable = !canvasFailed && canvasReady &&
      viewRef.current?.selectHollywoodGatePlace?.() === true
    setGatePhysicalAvailability(
      physicalAvailable && visitorAccepted
        ? 'available'
        : canvasReady || canvasFailed
          ? 'unavailable'
          : 'pending',
    )
    focusGateContext('visitor')
    return true
  }, [cancelGateCandidateGesture, canvasFailed, canvasReady, focusGateContext])

  const guardGateCandidateSelectionKeyDown = useCallback((
    event: {
      key: string
      repeat: boolean
      preventDefault(): void
      stopPropagation(): void
    },
    talentId: string,
  ) => {
    containWorldInput(event)
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    if (
      worldInputSuspendedRef.current ||
      event.repeat ||
      gateCandidateHeldKeyRef.current !== null
    ) return
    cancelGateCandidateGesture()
    gateCandidateHeldKeyRef.current = event.key
    gateCandidateSuppressClickRef.current = talentId
    selectGateCandidate(talentId)
  }, [cancelGateCandidateGesture, selectGateCandidate])

  const releaseGateCandidateSelectionKey = useCallback((event: {
    key: string
    stopPropagation(): void
  }) => {
    containWorldInput(event)
    if (gateCandidateHeldKeyRef.current === event.key) gateCandidateHeldKeyRef.current = null
  }, [])

  useEffect(() => {
    // Focus may move from a keyboard-activated chooser/action to the inspector
    // before keyup. Capture release at the document boundary so held-key tokens
    // cannot become stranded merely because the world correctly moved focus.
    const release = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      if (gateCandidateHeldKeyRef.current === event.key) gateCandidateHeldKeyRef.current = null
      if (gateHeldKeyRef.current === event.key) gateHeldKeyRef.current = null
      settleNextEventKeyUp(event.key)
    }
    document.addEventListener('keyup', release, true)
    return () => document.removeEventListener('keyup', release, true)
  }, [settleNextEventKeyUp])

  const clickGateCandidateSelection = useCallback((talentId: string, detail: number) => {
    const suppressed = gateCandidateSuppressClickRef.current
    if (detail === 0 && suppressed !== null) {
      gateCandidateSuppressClickRef.current = null
      if (suppressed === talentId) return
    }
    if (detail > 1) return
    cancelGateCandidateGesture()
    selectGateCandidate(talentId)
  }, [cancelGateCandidateGesture, selectGateCandidate])

  const recordHollywoodGateVisitor = useCallback((
    visitor: HollywoodGateVisitorSelection,
  ) => {
    if (applyingNextEventOrientationRef.current) return
    if (
      worldInputSuspendedRef.current ||
      !gateSelectedRef.current ||
      gateCandidateIntentRef.current?.talentId !== visitor.talentId
    ) return
    yieldNextEventOrientation()
    const current = gateHiringCandidateContext(latestSnapshotRef.current, visitor.talentId)
    if (
      current === null ||
      !sameGateOwnerIntent(current.ownerIntent, gateCandidateIntentRef.current)
    ) return
    setGateCandidateIntent(current.ownerIntent)
    focusGateContext('visitor')
  }, [focusGateContext, yieldNextEventOrientation])

  const recordHollywoodProduction = useCallback((
    production: HollywoodProductionSelection,
  ) => {
    if (applyingNextEventOrientationRef.current) return
    if (production.locationBuildingId !== 'stage-a') return
    yieldNextEventOrientation()
    enterHollywoodProductionContext(production.productionId, {
      stage7Only: true,
      detailEligible: true,
      focus: 'primary',
    })
  }, [enterHollywoodProductionContext, yieldNextEventOrientation])

  const recordHollywoodSceneryLoadIn = useCallback((
    selection: HollywoodSceneryLoadInSelection,
  ) => {
    if (applyingNextEventOrientationRef.current) return
    yieldNextEventOrientation()
    enterHollywoodSceneryLoadInContext(selection, {
      paintHollywoodOutline: true,
      focus: true,
    })
  }, [enterHollywoodSceneryLoadInContext, yieldNextEventOrientation])

  const enterProductionFormationContext = useCallback((
    receipt: GreenlightFormationReceipt,
  ): boolean => {
    if (worldInputSuspendedRef.current || !hollywood) return false
    const exact = initialProductionFormationContext(latestSnapshotRef.current, receipt)
    if (exact === null) return false

    // Formation is a fresh, exact world owner. Drop every mutually exclusive Lot
    // context directly; calling the ordinary production entry would erase the
    // receipt and could substitute the Stage 7 or array-order fallback.
    clearHollywoodStage7DetailContext()
    clearGateContext()
    clearPublicityContext()
    clearHollywoodSceneryLoadInContext()
    clearAnnexContext()
    setSelectionInfo(null)
    recordSelection(null)
    setHollywoodPlace(null)
    viewRef.current?.clearHollywoodPlaceSelection?.()

    formationReceiptRef.current = receipt
    formationPendingFocusRef.current = exact.director.id
    hollywoodPersonRef.current = exact.director
    setFormationReceipt(receipt)
    setHollywoodProductionId(exact.operation.productionId)
    setHollywoodPerson(exact.director)
    setFormationWitnessVisible(true)
    setFormationAnnouncement(
      `Picture formed: ${exact.operation.title}. Director ${exact.director.name}. Lead ${exact.lead.name}.`,
    )
    if (canvasReady) {
      viewRef.current?.selectHollywoodPerson(exact.director.id)
    }
    return true
  }, [
    canvasReady,
    clearAnnexContext,
    clearGateContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearPublicityContext,
    hollywood,
    recordSelection,
  ])

  // A retained Package workspace delivers formation to this existing component only after the
  // world becomes interactive again. Object identity is the one-shot presentation authority;
  // malformed, stale, duplicate, or state-mismatched receipts are consumed without substitution.
  useLayoutEffect(() => {
    const presentation = liveFormationPresentation
    if (
      presentation === undefined ||
      worldInputSuspended ||
      liveFormationConsumedRef.current === presentation.identity
    ) return
    liveFormationConsumedRef.current = presentation.identity
    const accepted =
      presentation.acceptedState === state &&
      latestGameStateRef.current === presentation.acceptedState &&
      enterProductionFormationContext(presentation.receipt)
    if (!accepted) {
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
    }
    onLiveFormationConsumed?.(presentation.identity)
  }, [
    enterProductionFormationContext,
    liveFormationPresentation,
    onLiveFormationConsumed,
    state,
    worldInputSuspended,
  ])

  // Retained commissioning publishes one exact, non-serialized receipt only after App has
  // committed and autosaved its successor. The semantic Development owner consumes it without
  // moving the Hollywood camera or claiming a new physical building/location.
  useLayoutEffect(() => {
    const presentation = liveCommissionPresentation
    if (
      presentation === undefined ||
      worldInputSuspended ||
      liveCommissionConsumedRef.current === presentation.identity
    ) return
    liveCommissionConsumedRef.current = presentation.identity
    const current =
      presentation.acceptedState === state &&
      latestGameStateRef.current === presentation.acceptedState
        ? currentScreenplayCommissionReceipt(state, presentation.receipt)
        : null
    if (current !== null) {
      recordSelection('writers')
      setSelectionInfo(null)
      setScreenplayCommissionActivity({
        acceptedState: presentation.acceptedState,
        receipt: current,
      })
      announceHollywoodActivity(
        `Screenplay commissioned: ${current.title}. Writer ${current.writerName}. ` +
          `Due Week ${String(current.dueWeek)} in ${current.facilityName}, ` +
          `slot ${String(current.slot + 1)}.`,
      )
      queueMicrotask(() => focusVisibleLotOwner(commissionWitnessHeadingRef.current))
    } else {
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
    }
    onLiveCommissionConsumed?.(presentation.identity)
  }, [
    announceHollywoodActivity,
    liveCommissionPresentation,
    onLiveCommissionConsumed,
    recordSelection,
    state,
    worldInputSuspended,
  ])

  // Starting camera tests changes only canonical Casting-session truth. App publishes this
  // optional receipt after the successor is committed and autosaved; the same mounted Lot then
  // consumes it once without manufacturing Actor travel, occupancy, work, or a winner.
  useLayoutEffect(() => {
    const presentation = liveAuditionPresentation
    if (presentation === undefined || worldInputSuspended) return
    if (liveAuditionConsumedRef.current.has(presentation.identity)) {
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
      return
    }
    liveAuditionConsumedRef.current.add(presentation.identity)
    const current =
      presentation.acceptedState === state &&
      latestGameStateRef.current === presentation.acceptedState
        ? currentLotAuditionPlanningReceipt(state, presentation.receipt)
        : null
    if (current !== null) {
      recordSelection('casting')
      setSelectionInfo(null)
      setAuditionPlanningActivity({
        acceptedState: presentation.acceptedState,
        receipt: current,
      })
      const reads = current.reads
        .map((read) => `${auditionPlanningRoleLabel(read.role)} ${read.name}`)
        .join('; ')
      announceHollywoodActivity(
        `Camera tests underway for ${current.title}. Started Week ${String(current.startedWeek)}, ` +
          `due Week ${String(current.dueWeek)} in ${current.facilityName}, ` +
          `slot ${String(current.slot + 1)}. Reads: ${reads}. No Actor was hired, signed, ` +
          'held, paid, reserved, made busy, assigned, moved, or chosen.',
      )
      queueMicrotask(() => focusVisibleLotOwner(auditionPlanningWitnessHeadingRef.current))
    } else {
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
    }
    onLiveAuditionConsumed?.(presentation.identity)
  }, [
    announceHollywoodActivity,
    liveAuditionPresentation,
    onLiveAuditionConsumed,
    recordSelection,
    state,
    worldInputSuspended,
  ])

  useEffect(() => {
    const clearPhysicalOrientation = () => {
      const view = viewRef.current
      if (view === null) return
      paintNextEventOrientation(() => {
        view.clearSelection()
        view.clearHollywoodPersonSelection?.()
        view.clearHollywoodPlaceSelection?.()
      })
    }

    if (nextEventFeedback === null) {
      const yieldedReceipt = nextEventOrientationRef.current
      nextEventOrientationRef.current = null
      if (!nextEventOrientationOwnedRef.current) return
      nextEventOrientationOwnedRef.current = false
      if (yieldedReceipt?.target.kind === 'production') {
        pendingHollywoodFocusProductionId.current = null
        clearHollywoodStage7DetailContext()
        clearHollywoodSceneryLoadInContext()
        setHollywoodProductionId(null)
      }
      const retained = getLotSelectedBuilding()
      setSelected(retained)
      clearPhysicalOrientation()
      if (retained !== null && viewRef.current !== null) {
        const view = viewRef.current
        paintNextEventOrientation(() => view.select(retained))
      }
      return
    }

    clearFormationContext()
    clearHollywoodStage7DetailContext()
    clearGateContext()
    clearPublicityContext()
    clearHollywoodSceneryLoadInContext()
    clearAnnexContext()
    pendingHollywoodFocusProductionId.current = null
    hollywoodPersonRef.current = null
    setHollywoodProductionId(null)
    setHollywoodPerson(null)
    setHollywoodPlace(null)
    setSelectionInfo(null)
    clearPhysicalOrientation()
    nextEventOrientationOwnedRef.current = true

    if (nextEventFeedback.kind === 'next-event-neutral') {
      nextEventOrientationRef.current = null
      setSelected(null)
      return
    }

    const receipt = nextEventFeedback.receipt
    nextEventOrientationRef.current = receipt
    switch (receipt.target.kind) {
      case 'script':
        setSelected('writers')
        break
      case 'casting':
        setSelected('casting')
        break
      case 'run-completed':
        setSelected('theater')
        break
      case 'cash':
        setSelected('admin')
        break
      case 'contracts':
        setSelected(null)
        break
      case 'construction':
        setSelected('expansion')
        break
      case 'production': {
        const target = receipt.target
        if (hollywood) {
          paintNextEventOrientation(() => {
            enterHollywoodProductionContext(target.productionId, {
              stage7Only: target.location === 'stage-7',
              detailEligible: target.location === 'stage-7',
              focus: false,
            })
          })
        } else {
          const building = target.location === 'stage-7' ? 'stage-a' : 'stage-b'
          setSelected(building)
        }
      }
    }
    if (viewRef.current !== null) applyNextEventPhysicalOrientation(viewRef.current)
  }, [
    applyNextEventPhysicalOrientation,
    clearAnnexContext,
    clearFormationContext,
    clearGateContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearPublicityContext,
    enterHollywoodProductionContext,
    hollywood,
    nextEventFeedback,
    paintNextEventOrientation,
  ])

  useEffect(() => {
    if (
      suppressOperationalAnnouncement ||
      advanceFeedback?.constructionCompletion ||
      nextEventConstructionCompletion ||
      (nextEventFeedback !== null && operationalAnnexCapacity !== null)
    ) {
      completionAnnouncementOwnedRef.current = true
    }
    setOperationalAnnouncement(
      nextEventFeedback === null &&
        operationalAnnexCapacity !== null &&
        !completionAnnouncementOwnedRef.current
        ? `Development & Casting Annex is Operational. Development & Casting capacity is now ${operationalAnnexCapacity} shared slots.`
        : '',
    )
  }, [
    advanceFeedback?.constructionCompletion,
    nextEventConstructionCompletion,
    nextEventFeedback,
    operationalAnnexCapacity,
    suppressOperationalAnnouncement,
  ])

  // PF1-M2: now that this announcement is VISIBLE (below), it needs the shelf life a
  // visible notice must have. Its own effect can never retract it — "operational" stays
  // true forever — so without this it would become permanent furniture the first time the
  // player returned to a lot with a finished Annex. Its identity is its text, because
  // that is exactly what changes when a genuinely new announcement is composed.
  const expireOperationalAnnouncement = useCallback(() => {
    setOperationalAnnouncement('')
  }, [])
  useTransientNotice(
    operationalAnnouncement,
    operationalAnnouncement !== '',
    noticeEpoch,
    expireOperationalAnnouncement,
  )

  useEffect(() => {
    if (!entryFocus || entryFocusConsumedRef.current) return
    entryFocusConsumedRef.current = true
    // The exact completion item owns first focus on its arrival surface.
    if (
      advanceFeedback?.constructionCompletion ||
      nextEventConstructionCompletion
    ) return

    if (entryFocus === 'advance-week') {
      advanceButtonRef.current?.focus()
      return
    }

    if (entryFocus === 'next-event-control') {
      nextEventButtonRef.current?.focus()
      return
    }

    if (entryFocus === 'next-event-reaction') {
      if (
        nextEventFeedback?.kind === 'next-event-exact' &&
        entryNextEventReceipt !== undefined &&
        sameLotNextEventReceipt(
          nextEventFeedback.receipt,
          entryNextEventReceipt,
        )
      ) {
        // The newly mounted rail owns this one exact focus transfer.
        return
      }
      studioHeadingRef.current?.focus({ preventScroll: true })
      return
    }

    if (entryFocus === 'script-review') {
      const review = entryScriptReviewTarget === undefined
        ? null
        : currentLotScriptReviewContext(state, entryScriptReviewTarget)
      if (review !== null) {
        clearFormationContext()
        clearHollywoodStage7DetailContext()
        clearGateContext()
        clearPublicityContext()
        clearHollywoodSceneryLoadInContext()
        clearAnnexContext()
        setHollywoodProductionId(null)
        setHollywoodPerson(null)
        setHollywoodPlace(null)
        setSelectionInfo(null)
        recordSelection('writers')
        setScriptReviewIntent({ projectId: review.projectId, title: review.title })
        if (!hollywood) withoutSelectCue(() => viewRef.current?.select('writers'))
        queueMicrotask(() => focusVisibleLotOwner(scriptReviewHeadingRef.current))
        return
      }
      recordSelection(null)
      setHollywoodProductionId(null)
      setHollywoodPerson(null)
      setHollywoodPlace(null)
      viewRef.current?.clearHollywoodPersonSelection?.()
      viewRef.current?.clearHollywoodPlaceSelection?.()
      studioHeadingRef.current?.focus({ preventScroll: true })
      return
    }

    if (entryFocus === 'casting-review') {
      const review = entryCastingReviewTarget === undefined
        ? null
        : currentLotCastingReviewContext(state, entryCastingReviewTarget)
      if (review !== null) {
        clearFormationContext()
        clearHollywoodStage7DetailContext()
        clearGateContext()
        clearPublicityContext()
        clearHollywoodSceneryLoadInContext()
        clearAnnexContext()
        setHollywoodProductionId(null)
        setHollywoodPerson(null)
        setHollywoodPlace(null)
        setSelectionInfo(null)
        recordSelection('casting')
        setCastingReviewIntent({
          sessionId: review.sessionId,
          projectId: review.projectId,
          title: review.title,
        })
        if (!hollywood) withoutSelectCue(() => viewRef.current?.select('casting'))
        queueMicrotask(() => focusVisibleLotOwner(castingReviewHeadingRef.current))
        return
      }
      recordSelection(null)
      setHollywoodProductionId(null)
      setHollywoodPerson(null)
      setHollywoodPlace(null)
      viewRef.current?.clearHollywoodPersonSelection?.()
      viewRef.current?.clearHollywoodPlaceSelection?.()
      studioHeadingRef.current?.focus({ preventScroll: true })
      return
    }

    if (entryFocus === 'production-formation') {
      if (formationEntryConsumedRef.current) return
      formationEntryConsumedRef.current = true
      if (
        entryProductionFormation !== undefined &&
        enterProductionFormationContext(entryProductionFormation)
      ) return

      // A formation receipt is never a license to guess. Initial state is
      // explicit-empty, and any invalid receipt returns to the neutral Lot heading.
      clearFormationContext()
      clearHollywoodStage7DetailContext()
      clearGateContext()
      clearPublicityContext()
      clearHollywoodSceneryLoadInContext()
      clearAnnexContext()
      setHollywoodProductionId(null)
      hollywoodPersonRef.current = null
      setHollywoodPerson(null)
      setHollywoodPlace(null)
      setSelectionInfo(null)
      recordSelection(null)
      viewRef.current?.clearHollywoodPersonSelection?.()
      viewRef.current?.clearHollywoodPlaceSelection?.()
      studioHeadingRef.current?.focus({ preventScroll: true })
      return
    }

    if (entryFocus === 'publicity-campaign') {
      if (enterPublicityContext({
        place: null,
        paintHollywoodOutline: hollywood,
        focus: 'heading',
      })) return
    }

    if (entryFocus === 'annex-work') {
      if (enterAnnexContext({
        place: null,
        paintHollywoodOutline: hollywood,
        focus: 'work',
      })) return
    }

    if (entryFocus === 'gate-arrivals') {
      if (enterGateContext({
        place: null,
        paintHollywoodOutline: hollywood,
        candidate: null,
        focus: 'gate',
      })) return
    }

    if (entryFocus === 'gate-candidate') {
      if (
        entryGateCandidate !== undefined &&
        enterGateContext({
          place: null,
          paintHollywoodOutline: hollywood,
          candidate: entryGateCandidate,
          focus: 'visitor',
        })
      ) return

      // Typed return is identity-bearing but never substitutive. If current Gate
      // truth is still valid, return to its neutral chooser; otherwise leave every
      // Gate context empty and orient to the stable Studio Lot heading.
      if (enterGateContext({
        place: null,
        paintHollywoodOutline: hollywood,
        candidate: null,
        focus: 'gate',
      })) return
      clearGateContext()
      setHollywoodProductionId(null)
      setHollywoodPerson(null)
      setHollywoodPlace(null)
      recordSelection(null)
      viewRef.current?.clearHollywoodPersonSelection?.()
      viewRef.current?.clearHollywoodPlaceSelection?.()
      studioHeadingRef.current?.focus({ preventScroll: true })
      return
    }

    if (entryFocus === 'stage-7-production') {
      if (
        typeof entryStage7ProductionId === 'string' &&
        entryStage7ProductionId.length > 0 &&
        enterHollywoodProductionContext(entryStage7ProductionId, {
          stage7Only: true,
          detailEligible: true,
          focus: 'heading',
        })
      ) return

      // A stale return is explicitly empty. Never let the ordinary Studio Desk
      // fallback orient toward a replacement occupant at Stage 7.
      clearHollywoodStage7DetailContext()
      clearHollywoodSceneryLoadInContext()
      setHollywoodProductionId(null)
      setHollywoodPerson(null)
      setHollywoodPlace(null)
      recordSelection(null)
      viewRef.current?.clearHollywoodPersonSelection?.()
      viewRef.current?.clearHollywoodPlaceSelection?.()
      studioHeadingRef.current?.focus({ preventScroll: true })
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
    // existing focused node alone, so this intentionally depends only on the typed entry arm.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entryFocus,
    entryGateCandidate,
    entryNextEventReceipt,
    entryProductionFormation,
    entryCastingReviewTarget,
    entryScriptReviewTarget,
    entryStage7ProductionId,
  ])

  useEffect(() => {
    const pendingDirectorId = formationPendingFocusRef.current
    if (
      pendingDirectorId === null ||
      currentFormationContext?.director.id !== pendingDirectorId ||
      hollywoodPerson?.id !== pendingDirectorId
    ) return
    const target = hollywoodPersonStatusRef.current
    if (target === null || !target.isConnected) return
    target.focus({ preventScroll: true })
    formationPendingFocusRef.current = null
  }, [currentFormationContext, hollywoodPerson])

  useEffect(() => {
    if (formationReceipt === null || currentFormationContext !== null) return

    // Mounted continuity is exact-or-neutral. Release, malformed replacement,
    // disappearing people, or any failed join clears both semantic and physical
    // ownership; another valid operation is never a substitute.
    clearFormationContext()
    hollywoodPersonRef.current = null
    setHollywoodProductionId(null)
    setHollywoodPerson(null)
    viewRef.current?.clearHollywoodPersonSelection?.()
    if (!worldInputSuspendedRef.current) {
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
    }
  }, [clearFormationContext, currentFormationContext, formationReceipt])

  const recordHollywoodPerson = useCallback((person: LotPersonState | null) => {
    if (worldInputSuspendedRef.current) return
    if (applyingNextEventOrientationRef.current) return
    if (person !== null) yieldNextEventOrientation()
    const formation = formationReceiptRef.current === null
      ? null
      : productionFormationContext(
          latestSnapshotRef.current,
          formationReceiptRef.current,
        )
    const currentFormationPerson = person === null || formation === null
      ? null
      : person.id === formation.director.id
        ? formation.director
        : person.id === formation.lead.id
          ? formation.lead
          : null
    const preservesFormation = currentFormationPerson !== null &&
      person !== null &&
      person.name === currentFormationPerson.name &&
      person.role === currentFormationPerson.role &&
      person.authority === currentFormationPerson.authority &&
      person.productionId === currentFormationPerson.productionId &&
      person.productionTitle === currentFormationPerson.productionTitle
    if (person !== null && !preservesFormation) clearFormationContext()
    setHollywoodPerson(person)
    if (person !== null) {
      clearHollywoodStage7DetailContext()
      clearGateContext()
      clearPublicityContext()
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
  }, [
    clearAnnexContext,
    clearGateContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearFormationContext,
    clearPublicityContext,
    recordSelection,
    yieldNextEventOrientation,
  ])

  const recordHollywoodPlace = useCallback((place: HollywoodPlaceSelection | null) => {
    if (worldInputSuspendedRef.current) return
    if (applyingNextEventOrientationRef.current) return
    if (place !== null) yieldNextEventOrientation()
    if (place !== null) clearFormationContext()
    // The scene has already painted a non-null physical place selection before
    // emitting this event. Leave that generic outline intact while dropping only
    // a previously owned React scenery context.
    if (place !== null) {
      clearHollywoodStage7DetailContext()
      clearHollywoodSceneryLoadInReactContext()
    }
    if (place !== null && isExactPublicityPlace(place)) {
      enterPublicityContext({ place, paintHollywoodOutline: false, focus: 'first-action' })
      return
    }
    if (place !== null && isExactGatePlace(place)) {
      enterGateContext({
        place,
        paintHollywoodOutline: false,
        candidate: null,
        focus: 'gate',
      })
      return
    }
    if (
      place !== null &&
      place.id === 'annex-parcel' &&
      place.buildingId === 'expansion'
    ) {
      enterAnnexContext({ place, paintHollywoodOutline: true, focus: 'default' })
      return
    }

    clearPublicityContext()
    clearAnnexContext()
    clearGateContext()
    setHollywoodPlace(place)
    if (place !== null) {
      setHollywoodPerson(null)
      setSelectionInfo(null)
      recordSelection(place.buildingId)
      viewRef.current?.clearHollywoodPersonSelection()
    }
  }, [
    clearAnnexContext,
    clearGateContext,
    clearHollywoodSceneryLoadInReactContext,
    clearHollywoodStage7DetailContext,
    clearFormationContext,
    clearPublicityContext,
    enterPublicityContext,
    enterAnnexContext,
    enterGateContext,
    recordSelection,
  ])

  // State replacement/save reload can remove a previously selected person. The current
  // snapshot, not the old scene event, decides whether that inspection remains valid.
  useEffect(() => {
    if (hollywoodPerson === null) return
    const currentMatches = hollywoodPresentationPeople.filter(
      (person) => person.id === hollywoodPerson.id,
    )
    const current = currentMatches.length === 1 ? currentMatches[0]! : undefined
    if (current === undefined) {
      setHollywoodPerson(null)
      setHollywoodProductionId(null)
      viewRef.current?.clearHollywoodPersonSelection?.()
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
  }, [hollywoodPerson, hollywoodPresentationPeople, recordHollywoodPerson])

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

  // Gate ownership survives only exact current market truth. A state replacement or
  // market rotation may retain the same person, but it may never substitute a different
  // candidate. Reconcile the distinct presentation sprite from fresh projection fields.
  useEffect(() => {
    if (!gateSelectedRef.current) return

    const market = gateHiringMarketContext(latestSnapshotRef.current)
    if (market === null) {
      const staleId = gateCandidateIntentRef.current?.talentId ?? null
      if (
        staleId !== null &&
        openTalentProfileId === staleId &&
        gateInvalidProfileClosedRef.current !== staleId
      ) {
        gateInvalidProfileClosedRef.current = staleId
        onCloseTalentProfileRef.current?.(staleId)
      }
      clearGateContext()
      setHollywoodPlace(null)
      recordSelection(null)
      viewRef.current?.clearHollywoodPlaceSelection?.()
      announceHollywoodActivity('Current Studio Gate details are unavailable.')
      if (!worldInputSuspendedRef.current) {
        queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
      }
      return
    }

    const intent = gateCandidateIntentRef.current
    if (intent === null) {
      viewRef.current?.setHollywoodGateVisitor?.(null)
      return
    }
    const current = gateHiringCandidateContext(latestSnapshotRef.current, intent.talentId)
    if (current === null || !sameGateOwnerIntent(current.ownerIntent, intent)) {
      if (
        openTalentProfileId === intent.talentId &&
        gateInvalidProfileClosedRef.current !== intent.talentId
      ) {
        gateInvalidProfileClosedRef.current = intent.talentId
        onCloseTalentProfileRef.current?.(intent.talentId)
      }
      clearGateCandidate()
      announceHollywoodActivity('Gate visitor details changed. Review the current Gate slate.')
      if (!worldInputSuspendedRef.current) focusGateContext('gate')
      return
    }

    gateInvalidProfileClosedRef.current = null
    viewRef.current?.setHollywoodGateVisitor?.(gateVisitorPresentation(current))
  }, [
    announceHollywoodActivity,
    clearGateCandidate,
    clearGateContext,
    focusGateContext,
    gateCandidateIntent,
    gateSelected,
    openTalentProfileId,
    recordSelection,
    state,
  ])

  useEffect(() => {
    if (openTalentProfileId === null) gateInvalidProfileClosedRef.current = null
  }, [openTalentProfileId])

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

  // A deep return remounts the Lot with no Annex inspector in the first render.
  // The entry effect selects it, then this post-commit pass fulfils the pending
  // focus after React has mounted the stable Current work/status target. The
  // microtask fast path still handles already-mounted pointer/keyboard selection.
  useEffect(() => {
    const pending = annexPendingFocusRef.current
    if (!annexSelected || pending === null) return
    focusSelectedAnnex(pending)
  }, [annexSelected, annexView.status, currentAnnexWork?.state, focusSelectedAnnex])

  useEffect(() => {
    if (!publicitySelected || currentPublicityCampaign !== null) return
    clearPublicityContext()
    setHollywoodPlace(null)
    viewRef.current?.clearHollywoodPlaceSelection?.()
    recordSelection(null)
  }, [
    clearPublicityContext,
    currentPublicityCampaign,
    publicitySelected,
    recordSelection,
  ])

  useEffect(() => {
    const accepted = acceptedPublicityRef.current
    if (accepted === null) return
    const current = currentPublicityCampaign
    const latest = current?.offers.find((offer) => offer.tier === accepted.receipt.tier)
    const reconciled =
      current !== null &&
      snapshot.week === accepted.receipt.acceptedWeek &&
      latest !== undefined &&
      !latest.available &&
      current.offers.every((offer) =>
        !offer.available &&
        offer.availableWeek !== null &&
        offer.availableWeek > accepted.receipt.acceptedWeek,
      ) &&
      !isFieldExactPublicityOffer(accepted.renderedOffer, latest)

    if (reconciled) {
      const offer = accepted.renderedOffer
      const detail = `${publicityTierLabel(offer.tier)} publicity accepted · ${moneyExact(offer.cost)} · immediate awareness +${offer.expectedLift.toFixed(2)}`
      acceptedPublicityRef.current = null
      publicityPendingRef.current = false
      publicityHeldKeyRef.current = null
      setPublicityPending(false)
      announceHollywoodActivity(detail)
      viewRef.current?.showHollywoodPublicity(true, detail)
      focusPublicityContext('status')
      return
    }

    // The immediate pre-replacement render still carries the exact rendered token.
    // Keep the synchronous latch until fresh App state arrives.
    if (
      current !== null &&
      snapshot.week === accepted.receipt.acceptedWeek &&
      latest !== undefined &&
      isFieldExactPublicityOffer(accepted.renderedOffer, latest)
    ) return

    clearPublicityContext()
    setHollywoodPlace(null)
    viewRef.current?.clearHollywoodPlaceSelection?.()
    recordSelection(null)
    announceHollywoodActivity('Publicity result could not be reconciled with current studio truth.')
  }, [
    announceHollywoodActivity,
    clearPublicityContext,
    currentPublicityCampaign,
    focusPublicityContext,
    recordSelection,
    snapshot.week,
  ])

  useEffect(() => {
    if (!publicitySelected || !canvasFailed) return
    setPublicityPhysicalAvailability('unavailable')
  }, [canvasFailed, publicitySelected])

  // Accepted construction keeps the action synchronously guarded until fresh App-owned
  // state repaints Vacant → Building. Focus then moves into the persistent status region.
  // Completion focus is never competed with here; this effect is specific to start acceptance.
  useEffect(() => {
    if (!annexPendingRef.current || annexView.status === 'vacant') return
    annexPendingRef.current = false
    setAnnexPending(false)
    if (!annexAcceptedFocusRef.current) return
    annexAcceptedFocusRef.current = false
    if (
      !annexSelectedRef.current ||
      advanceFeedback?.constructionCompletion ||
      nextEventConstructionCompletion
    ) return
    const nonce = ++annexFocusNonceRef.current
    queueMicrotask(() => {
      if (!annexSelectedRef.current || annexFocusNonceRef.current !== nonce) return
      annexStatusRef.current?.focus()
    })
  }, [
    advanceFeedback?.constructionCompletion,
    annexView.status,
    nextEventConstructionCompletion,
  ])

  // An explicit identity never falls through to another film. Snapshot replacement
  // may remove or relocate it; in that case the context stays empty until the player
  // makes a fresh selection and no pending focus can attach to a future command.
  useEffect(() => {
    if (typeof hollywoodProductionId !== 'string' || explicitlySelectedHollywoodOperation !== null) return
    pendingHollywoodFocusProductionId.current = null
  }, [explicitlySelectedHollywoodOperation, hollywoodProductionId])

  // Explicit Stage 7 provenance is never transferable. If the latest strict
  // selector no longer proves the same production, fail empty instead of
  // inheriting a replacement occupant or a relocated copy of the old film.
  useEffect(() => {
    const ownedProductionId = hollywoodStage7DetailProductionId
    if (
      ownedProductionId === null ||
      currentStage7DetailContext?.operation.productionId === ownedProductionId
    ) return

    const hadPendingHeading =
      pendingHollywoodHeadingFocusProductionId.current === ownedProductionId
    clearHollywoodStage7DetailContext()
    if (hollywoodProductionId === ownedProductionId) setHollywoodProductionId(null)
    viewRef.current?.clearHollywoodPlaceSelection?.()
    recordSelection(null)
    if (hadPendingHeading) {
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
    }
  }, [
    clearHollywoodStage7DetailContext,
    currentStage7DetailContext,
    hollywoodProductionId,
    hollywoodStage7DetailProductionId,
    recordSelection,
  ])

  useEffect(() => {
    const productionId = pendingHollywoodFocusProductionId.current
    if (
      productionId === null ||
      hollywoodPlace !== null ||
      hollywoodOperation?.productionId !== productionId
    ) {
      return
    }
    const target = pendingHollywoodHeadingFocusProductionId.current === productionId
      ? hollywoodStage7HeadingRef.current
      : hollywoodOperation.currentCommand
        ? hollywoodCommandRef.current
        : hollywoodTaskStatusRef.current ?? hollywoodPersonStatusRef.current
    if (target === null) {
      pendingHollywoodFocusProductionId.current = null
      return
    }
    target.focus({ preventScroll: true })
    pendingHollywoodFocusProductionId.current = null
    pendingHollywoodHeadingFocusProductionId.current = null
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
      enterHollywoodProductionContext(productionId, {
        stage7Only: true,
        detailEligible: hollywoodStage7DetailProductionIdRef.current === productionId,
        focus: 'primary',
      })
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

  const enterCurrentScriptReview = useCallback((
    target?: LotScriptReviewTarget,
  ): LotScriptReviewContext | null => {
    if (worldInputSuspendedRef.current) return null
    const latest = latestGameStateRef.current
    const context = currentLotScriptReviewContext(latest, target)
    if (context === null) return null

    clearFormationContext()
    clearHollywoodStage7DetailContext()
    clearGateContext()
    clearPublicityContext()
    clearHollywoodSceneryLoadInContext()
    clearAnnexContext()
    setHollywoodProductionId(null)
    setHollywoodPerson(null)
    setHollywoodPlace(null)
    setSelectionInfo(null)
    viewRef.current?.clearSelection()
    viewRef.current?.clearHollywoodPersonSelection?.()
    viewRef.current?.clearHollywoodPlaceSelection?.()
    recordSelection('writers')
    setScriptReviewIntent({
      projectId: context.projectId,
      title: context.title,
    })
    if (!hollywood) withoutSelectCue(() => viewRef.current?.select('writers'))
    queueMicrotask(() => focusVisibleLotOwner(scriptReviewHeadingRef.current))
    return context
  }, [
    clearAnnexContext,
    clearFormationContext,
    clearGateContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearPublicityContext,
    hollywood,
    recordSelection,
  ])

  const dispatchLotScriptReviewAction = useCallback((
    renderedState: GameState,
    renderedContext: LotScriptReviewContext,
    renderedAction: LotScriptReviewAction,
    receipt: LotNextEventReceipt | null,
  ) => {
    if (worldInputSuspendedRef.current || onRunScriptReviewAction === undefined) return
    if (scriptReviewDispatchGuardRef.current !== null) return

    let target: LotScriptReviewTarget | undefined
    if (receipt !== null) {
      if (
        !sameLotNextEventReceipt(receipt, receipt) ||
        receipt.target.kind !== 'script'
      ) return
      target = {
        projectId: receipt.target.projectId,
        title: receipt.target.title,
      }
    }
    const current = currentLotScriptReviewContext(renderedState, target)
    const action = current?.legalActions.find(
      (candidate) => candidate.kind === renderedAction.kind,
    ) ?? null
    if (
      current === null ||
      action === null ||
      !sameLotScriptReviewContext(renderedContext, current) ||
      !sameLotScriptReviewAction(renderedAction, action)
    ) return

    scriptReviewDispatchGuardRef.current = {
      renderedState,
      context: renderedContext,
      action: renderedAction,
    }
    const result = onRunScriptReviewAction(
      renderedState,
      current,
      action,
      receipt,
    )
    if (result.ok) {
      const success = acceptedLotScriptReviewSuccess(
        current,
        action,
        renderedState,
        result.next,
      )
      recordSelection('writers')
      setScriptReviewActivity({
        acceptedState: result.next,
        context: current,
        success,
        feedback: {
          kind: 'success',
          message: success === null
            ? 'Screenplay action completed. Review the current studio state.'
            : scriptReviewSuccessMessage(success),
        },
      })
      queueMicrotask(() => focusVisibleLotOwner(scriptReviewHeadingRef.current))
      return
    }

    setScriptReviewActivity({
      acceptedState: renderedState,
      context: current,
      success: null,
      feedback: { kind: 'error', message: result.error },
    })
    const rejectedGuard = scriptReviewDispatchGuardRef.current
    window.setTimeout(() => {
      if (scriptReviewDispatchGuardRef.current === rejectedGuard) {
        scriptReviewDispatchGuardRef.current = null
      }
    }, 0)
  }, [onRunScriptReviewAction, recordSelection])

  const openCurrentScriptReviewDetails = useCallback((
    renderedState: GameState,
    renderedContext: LotScriptReviewContext,
  ): boolean => {
    if (
      worldInputSuspendedRef.current ||
      onOpenScriptReviewDetails === undefined
    ) return false
    const latest = currentLotScriptReviewContext(renderedState)
    if (
      latest === null ||
      !sameLotScriptReviewContext(renderedContext, latest)
    ) return false
    return onOpenScriptReviewDetails(renderedState, latest)
  }, [onOpenScriptReviewDetails])

  const enterCurrentCastingReview = useCallback((
    target?: LotCastingReviewTarget,
  ): LotCastingReviewContext | null => {
    if (worldInputSuspendedRef.current) return null
    const latest = latestGameStateRef.current
    const context = currentLotCastingReviewContext(latest, target)
    if (context === null) return null

    clearFormationContext()
    clearHollywoodStage7DetailContext()
    clearGateContext()
    clearPublicityContext()
    clearHollywoodSceneryLoadInContext()
    clearAnnexContext()
    setHollywoodProductionId(null)
    setHollywoodPerson(null)
    setHollywoodPlace(null)
    setSelectionInfo(null)
    viewRef.current?.clearSelection()
    viewRef.current?.clearHollywoodPersonSelection?.()
    viewRef.current?.clearHollywoodPlaceSelection?.()
    recordSelection('casting')
    setCastingReviewIntent({
      sessionId: context.sessionId,
      projectId: context.projectId,
      title: context.title,
    })
    // Classic owns the established physical Casting building. Paint that host
    // selection without re-entering this exact review through the renderer's
    // synchronous onSelect callback; the React owner above already owns it.
    if (!hollywood) {
      applyingNextEventOrientationRef.current = true
      try {
        viewRef.current?.select('casting')
      } finally {
        applyingNextEventOrientationRef.current = false
      }
    }
    queueMicrotask(() => focusVisibleLotOwner(castingReviewHeadingRef.current))
    return context
  }, [
    clearAnnexContext,
    clearFormationContext,
    clearGateContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearPublicityContext,
    hollywood,
    recordSelection,
  ])

  const keepInvalidCurrentCastingReviewNeutral = useCallback((): boolean => {
    let currentCastingDecision = false
    try {
      currentCastingDecision = studioDecision(latestGameStateRef.current)?.kind === 'castingReview'
    } catch {
      // A thrown decision adapter is still an unavailable current-decision presentation,
      // never evidence that Casting is free to fall through into a supporting deep screen.
      currentCastingDecision = true
    }
    if (!currentCastingDecision) return false

    clearFormationContext()
    clearHollywoodStage7DetailContext()
    clearGateContext()
    clearPublicityContext()
    clearHollywoodSceneryLoadInContext()
    clearAnnexContext()
    setHollywoodProductionId(null)
    setHollywoodPerson(null)
    setHollywoodPlace(null)
    setSelectionInfo(null)
    recordSelection(null)
    viewRef.current?.clearSelection()
    viewRef.current?.clearHollywoodPersonSelection?.()
    viewRef.current?.clearHollywoodPlaceSelection?.()
    queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
    return true
  }, [
    clearAnnexContext,
    clearFormationContext,
    clearGateContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearPublicityContext,
    recordSelection,
  ])

  const dispatchLotCastingReviewAction = useCallback((
    renderedState: GameState,
    renderedContext: LotCastingReviewContext,
    renderedAction: LotCastingReviewAction,
    receipt: LotNextEventReceipt | null,
  ) => {
    if (worldInputSuspendedRef.current || onRunCastingReviewAction === undefined) return
    if (castingReviewDispatchGuardRef.current !== null) return

    let target: LotCastingReviewTarget | undefined
    if (receipt !== null) {
      if (
        !sameLotNextEventReceipt(receipt, receipt) ||
        receipt.target.kind !== 'casting'
      ) return
      target = {
        sessionId: receipt.target.sessionId,
        projectId: receipt.target.projectId,
        title: receipt.target.title,
      }
    }
    const current = currentLotCastingReviewContext(renderedState, target)
    if (
      current === null ||
      !sameLotCastingReviewContext(renderedContext, current) ||
      !sameLotCastingReviewAction(renderedAction, current.action)
    ) return

    castingReviewDispatchGuardRef.current = {
      renderedState,
      context: renderedContext,
      action: renderedAction,
    }
    const result = onRunCastingReviewAction(
      renderedState,
      current,
      current.action,
      receipt,
    )
    if (result.ok) {
      const success = acceptedLotCastingReviewSuccess(
        current,
        current.action,
        renderedState,
        result.next,
      )
      recordSelection('casting')
      setCastingReviewActivity({
        acceptedState: result.next,
        context: current,
        success,
        feedback: {
          kind: 'success',
          message: success === null
            ? 'Casting review completed. Review the current studio state.'
            : castingReviewSuccessMessage(success),
        },
      })
      if (success?.kind !== 'clear') {
        queueMicrotask(() => focusVisibleLotOwner(castingReviewHeadingRef.current))
      }
      return
    }

    setCastingReviewActivity({
      acceptedState: renderedState,
      context: current,
      success: null,
      feedback: { kind: 'error', message: result.error },
    })
    const rejectedGuard = castingReviewDispatchGuardRef.current
    window.setTimeout(() => {
      if (castingReviewDispatchGuardRef.current === rejectedGuard) {
        castingReviewDispatchGuardRef.current = null
      }
    }, 0)
  }, [onRunCastingReviewAction, recordSelection])

  const openCurrentCastingReviewDetails = useCallback((
    renderedState: GameState,
    renderedContext: LotCastingReviewContext,
  ): boolean => {
    if (
      worldInputSuspendedRef.current ||
      onOpenCastingReviewDetails === undefined
    ) return false
    const latest = currentLotCastingReviewContext(renderedState, {
      sessionId: renderedContext.sessionId,
      projectId: renderedContext.projectId,
      title: renderedContext.title,
    })
    if (
      latest === null ||
      !sameLotCastingReviewContext(renderedContext, latest)
    ) return false
    return onOpenCastingReviewDetails(renderedState, latest)
  }, [onOpenCastingReviewDetails])

  const dispatchRoute = useCallback((action: LotActionEvent['action']) => {
    if (worldInputSuspendedRef.current) return
    const res = resolveAction(action)
    onNavigateRef.current(res.route)
  }, [])

  /**
   * C2a-M4 / F4 (§10): the COMMISSION verb's own route.
   *
   * The verb used to share `assembly` with every generic Development activation,
   * so the host could not tell "the player asked to commission a screenplay"
   * from "the player opened Development". F4 widened the first and not the
   * second; a shared route cannot carry that distinction, and the verb landing
   * the full-screen surface is the exact defect the retained workspace exists to
   * prevent.
   */
  const dispatchCommissionRoute = useCallback(() => {
    if (worldInputSuspendedRef.current) return
    onNavigateRef.current({ kind: 'commissionScreenplay' })
  }, [])

  /**
   * Exact origin proof for the retained first-session planner, for ONE named opener.
   *
   * TWO controls can legitimately open the planner, and each must prove itself against
   * the SAME snapshot fact (the Casting building's own attention + reason). Neither arm
   * is weaker than the other — the inspector arm proves strictly more, because its
   * attention and its reason live on two different nodes that must BOTH be unique and
   * BOTH agree with the snapshot:
   *
   *   • 'companion' — the rail row (`lot-nav-casting`): connected, enabled, unique in the
   *     document, `data-attention` equal to the snapshot's attention, and a child cue node
   *     whose text ends with the snapshot's reason.
   *   • 'inspector' — the building panel's own verb
   *     (`lot-building-inspector-primary-plan-auditions`): connected, enabled, unique in
   *     the document, contained by the ONE `lot-building-inspector-casting` panel, that
   *     panel's `data-attention` equal to the snapshot's attention, and the panel's
   *     attention line ending with the snapshot's reason.
   *
   * WHY THE SECOND ARM EXISTS (Wave-2 defect, found in live playtest): the verb the player
   * actually pressed used to be proven through the COMPANION RAIL — a different control
   * the player never touched and which need not be in a provable state. Whenever that
   * proof failed the retained planner refused and the verb ejected the player onto the
   * full-screen Casting Room. An opener must prove ITSELF.
   */
  const currentAuditionPlanningOrigin = useCallback((
    openerKind: LotAuditionPlanningOpenerKind,
  ): LotAuditionPlanningOrigin | null => {
    if (!hollywood || worldInputSuspendedRef.current) return null
    const matches = latestSnapshotRef.current.buildings.filter(
      (building) => building.id === 'casting',
    )
    const fact = matches.length === 1 ? matches[0]! : null
    if (fact === null) return null
    const attention = fact.attention ?? 'normal'
    const reason = fact.attentionReason ?? ATTENTION_META[attention].word

    const testId = LOT_AUDITION_OPENER_TESTID[openerKind]
    const opener =
      openerKind === 'companion'
        ? companionButtonRefs.current.casting
        : auditionPlanningVerbRef.current
    if (
      opener === null ||
      opener === undefined ||
      !opener.isConnected ||
      opener.disabled ||
      opener.getAttribute('data-testid') !== testId ||
      opener !== document.querySelector(`[data-testid="${testId}"]`)
    ) return null

    // Where this opener's own attention + reason evidence lives. The companion carries
    // both on itself; the inspector verb carries them on the one panel that owns it.
    const evidenceRoot: Element | null =
      openerKind === 'companion'
        ? opener
        : (() => {
            const panel = opener.closest('[data-testid="lot-building-inspector-casting"]')
            return panel !== null &&
              panel === document.querySelector('[data-testid="lot-building-inspector-casting"]')
              ? panel
              : null
          })()
    if (evidenceRoot === null) return null
    const cueNode = evidenceRoot.querySelector(
      openerKind === 'companion'
        ? '[data-testid="lot-nav-casting-state"]'
        : '[data-testid="lot-building-inspector-attention"]',
    )
    const cueText = cueNode?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    if (
      evidenceRoot.getAttribute('data-attention') !== attention ||
      cueNode === null ||
      !cueText.endsWith(reason)
    ) return null

    return {
      openerKind,
      opener,
      cue: {
        buildingId: 'casting',
        action: 'browse-talent',
        attention,
        reason,
      },
    }
  }, [hollywood])

  const openCurrentAuditionPlanning = useCallback((
    openerKind: LotAuditionPlanningOpenerKind = 'companion',
  ): boolean => {
    if (onOpenAuditionPlanning === undefined) return false
    const origin = currentAuditionPlanningOrigin(openerKind)
    if (origin === null) return false
    const renderedState = latestGameStateRef.current
    if (!onOpenAuditionPlanning(renderedState, origin)) return false

    // Casting becomes the semantic Lot owner only after App accepts the exact retained
    // origin. Hollywood has no authorized physical Casting target, so preserve the view,
    // canvas, camera, and every renderer-local selection exactly as they are.
    clearFormationContext()
    clearHollywoodStage7DetailContext()
    clearGateContext()
    clearPublicityContext()
    clearHollywoodSceneryLoadInContext()
    clearAnnexContext()
    setSelectionInfo(null)
    recordSelection('casting')
    return true
  }, [
    clearAnnexContext,
    clearFormationContext,
    clearGateContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearPublicityContext,
    currentAuditionPlanningOrigin,
    onOpenAuditionPlanning,
    recordSelection,
  ])

  // ── Create the Phaser view exactly once, lazily. Destroy on unmount. ─────────
  useEffect(() => {
    let cancelled = false
    let view: StudioLotViewClass | null = null
    const parent = mountRef.current
    if (!parent) return

    import('./StudioLotView.ts')
      .then(({ StudioLotView }) => {
        if (cancelled || !mountRef.current) return
        rendererStateRef.current = latestGameStateRef.current
        view = new StudioLotView({
          parent: mountRef.current,
          distinctStages: soundstages,
          authoredStage,
          authoredStageA,
          hollywood,
          tycoon,
          onWorldBuilding: (buildingId) => { activateRef.current?.(buildingId) },
          // Build Mode V1: a parcel click lands the SAME panel its companion control
          // lands, and a build-mode hover only ever moves the host-owned draft.
          onWorldParcel: (parcelId) => { activateParcelRef.current?.(parcelId) },
          onWorldBuildOrigin: (parcelId, origin) => {
            moveBuildOriginRef.current?.(origin, parcelId)
          },
          // The import can resolve after an App-owned week advance. Construct from the latest
          // host snapshot rather than the mount-time state closure so that preparation never
          // paints a stale week before onReady enables ordinary snapshot delivery.
          snapshot: {
            ...latestSnapshotRef.current,
            selectedBuildingId: getLotSelectedBuilding(),
          },
          onSelect: (sel) => {
            if (applyingNextEventOrientationRef.current) return
            // The player addressed a building in the world. A deselection is not a
            // selection, and a host-driven re-assert is not a gesture (see
            // `withoutSelectCue`), so neither one sounds.
            if (sel !== null && hostDrivenSelection === 0) getAudioService().playCue('select')
            yieldNextEventOrientation()
            clearFormationContext()
            if (sel?.buildingId === 'writers' && enterCurrentScriptReview() !== null) {
              return
            }
            if (sel?.buildingId === 'casting' && enterCurrentCastingReview() !== null) {
              return
            }
            if (
              sel?.buildingId === 'casting' &&
              keepInvalidCurrentCastingReviewNeutral()
            ) return
            if (hollywood && sel?.buildingId === 'gate') {
              if (!enterGateContext({
                place: null,
                paintHollywoodOutline: true,
                candidate: null,
                focus: 'gate',
              })) {
                clearGateContext()
                setSelectionInfo(null)
                recordSelection(null)
              }
              return
            }
            if (sel?.buildingId === 'expansion') {
              if (!enterAnnexContext({
                place: null,
                paintHollywoodOutline: false,
                focus: 'default',
              })) {
                setSelectionInfo(null)
                recordSelection(null)
              }
              return
            }
            clearHollywoodStage7DetailContext()
            clearGateContext()
            clearPublicityContext()
            clearHollywoodSceneryLoadInContext()
            clearAnnexContext()
            setSelectionInfo(sel)
            recordSelection(sel?.buildingId ?? null)
          },
          onAction: (e) => {
            if (applyingNextEventOrientationRef.current) return
            yieldNextEventOrientation()
            clearFormationContext()
            if (e.buildingId === 'writers' && enterCurrentScriptReview() !== null) {
              return
            }
            if (e.buildingId === 'casting' && enterCurrentCastingReview() !== null) {
              return
            }
            if (
              e.buildingId === 'casting' &&
              keepInvalidCurrentCastingReviewNeutral()
            ) return
            if (e.buildingId === 'casting' && openCurrentAuditionPlanning()) return
            if (hollywood && e.buildingId === 'gate') {
              enterGateContext({
                place: null,
                paintHollywoodOutline: true,
                candidate: null,
                focus: 'gate',
              })
              return
            }
            if (e.buildingId === 'expansion') {
              enterAnnexContext({ place: null, paintHollywoodOutline: false, focus: 'default' })
              return
            }
            // Renderer actions are independently activatable: record their exact source before
            // routing instead of assuming an onSelect event happened first.
            recordSelection(e.buildingId)
            clearHollywoodStage7DetailContext()
            clearGateContext()
            clearPublicityContext()
            clearHollywoodSceneryLoadInContext()
            clearAnnexContext()
            dispatchRoute(e.action)
          },
          onHollywoodPerson: recordHollywoodPerson,
          onHollywoodPlace: recordHollywoodPlace,
          onHollywoodProduction: recordHollywoodProduction,
          onHollywoodSceneryLoadIn: recordHollywoodSceneryLoadIn,
          onHollywoodGateVisitor: recordHollywoodGateVisitor,
          onActivity: (text) => { if (text) recordHollywoodRendererActivity(text) },
          onHollywoodFailure: () => {
            if (cancelled) return
            nextEventPhysicalPrimaryRequiredRef.current = true
            clearNextEventGesture(true)
            resetNextEventRailInput()
            cancelHollywoodStage7Gesture()
            cancelGateCandidateGesture()
            setCanvasReady(false)
            setCanvasFailed(true)
            if (publicitySelectedRef.current) {
              setPublicityPhysicalAvailability('unavailable')
            }
            if (gateSelectedRef.current) setGatePhysicalAvailability('unavailable')
          },
          onReady: () => {
            if (cancelled) return
            const readyView = view
            if (readyView === null) return
            // StudioLotView suppresses ready from a failed renderer generation, so
            // any ready reaching React is a validated live or recreated renderer.
            nextEventPhysicalPrimaryRequiredRef.current = true
            clearNextEventGesture(true)
            resetNextEventRailInput()
            cancelHollywoodStage7Gesture()
            cancelGateCandidateGesture()
            setCanvasFailed(false)
            setCanvasReady(true)
            const sceneryProductionId = hollywoodSceneryLoadInProductionIdRef.current
            const receipt = formationReceiptRef.current
            const formation = receipt === null
              ? null
              : productionFormationContext(latestSnapshotRef.current, receipt)
            const formationDirectorId =
              formation !== null &&
              hollywoodPersonRef.current?.id === formation.director.id
                ? formation.director.id
                : null
            if (applyNextEventPhysicalOrientation(readyView)) {
              // The event receipt owns the current orientation, including deliberate semantic-only
              // and neutral cases where no Hollywood physical outline is authorized.
            } else if (formationDirectorId !== null) {
              view?.selectHollywoodPerson(formationDirectorId)
            } else if (gateSelectedRef.current) {
              const market = gateHiringMarketContext(latestSnapshotRef.current)
              const intent = gateCandidateIntentRef.current
              const current = intent === null
                ? null
                : gateHiringCandidateContext(latestSnapshotRef.current, intent.talentId)
              const exact = current !== null && intent !== null &&
                sameGateOwnerIntent(current.ownerIntent, intent)
                  ? current
                  : null
              const visitorAccepted = view?.setHollywoodGateVisitor?.(
                exact === null ? null : gateVisitorPresentation(exact),
              ) ?? false
              const physical = market !== null &&
                hollywood &&
                view?.selectHollywoodGatePlace?.() === true
              setGatePhysicalAvailability(
                physical && (exact === null || visitorAccepted) ? 'available' : 'unavailable',
              )
              if (physical) view?.focusHollywoodGate?.()
            } else if (publicitySelectedRef.current) {
              const physical = hollywood && view?.selectHollywoodPublicityPlace?.() === true
              setPublicityPhysicalAvailability(physical ? 'available' : 'unavailable')
              if (physical) view?.focusHollywoodPlace?.(PUBLICITY_PLACE_ID)
            } else if (sceneryProductionId !== null) {
              view?.selectHollywoodSceneryLoadIn?.(sceneryProductionId)
            } else if (annexSelectedRef.current) {
              if (hollywood) view?.selectHollywoodAnnexPlace?.()
              else withoutSelectCue(() => view?.select('expansion'))
            } else if (
              hollywoodStage7DetailProductionIdRef.current !== null &&
              stage7ProductionDetailContext(latestSnapshotRef.current)?.operation.productionId ===
                hollywoodStage7DetailProductionIdRef.current
            ) {
              view?.selectHollywoodProduction?.(hollywoodStage7DetailProductionIdRef.current)
            } else {
              const selectedBuilding = getLotSelectedBuilding()
              if (selectedBuilding && (!hollywood || selectedBuilding !== 'casting')) {
                withoutSelectCue(() => view?.select(selectedBuilding))
              }
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
        if (!cancelled) {
          nextEventPhysicalPrimaryRequiredRef.current = true
          clearNextEventGesture(true)
          resetNextEventRailInput()
          cancelHollywoodStage7Gesture()
          cancelGateCandidateGesture()
          setCanvasFailed(true)
          if (gateSelectedRef.current) setGatePhysicalAvailability('unavailable')
        }
      })

    return () => {
      cancelled = true
      nextEventVirtualReleaseEpochRef.current += 1
      nextEventGestureRef.current = null
      nextEventHeldKeyRef.current = null
      nextEventSuppressUntokenedVirtualRef.current = false
      nextEventPhysicalReleaseEpochRef.current += 1
      nextEventSuppressPhysicalStartRef.current = false
      gateNavigationPendingRef.current = false
      gateHeldKeyRef.current = null
      gateActivationRef.current = null
      gateSuppressNextClickRef.current = false
      gateSuppressKeyboardClickRef.current = null
      gateCandidateHeldKeyRef.current = null
      gateCandidateSuppressClickRef.current = null
      view?.setHollywoodGateVisitor?.(null)
      view?.destroy()
      viewRef.current = null
      rendererStateRef.current = null
    }
    // Intentionally run once: the view is created a single time and fed new snapshots
    // by the effect below. state/callbacks are read via refs / fresh selector calls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A cadence gesture belongs to the exact GameState rendered at its start. Any
  // external authoritative replacement invalidates that token before a delayed
  // native click can borrow the newly rendered control.
  useLayoutEffect(() => {
    const gesture = nextEventGestureRef.current
    if (gesture !== null && gesture.renderedState !== state) {
      nextEventPhysicalPrimaryRequiredRef.current = true
      clearNextEventGesture(true)
    }
  }, [clearNextEventGesture, state])

  // Modal overlays keep this exact view mounted and animated while making the
  // world inert. Native DOM controls are also placed in an inert subtree below;
  // clear held semantic keys here so an activation begun before modal entry
  // cannot complete after it closes. The latest ref above also covers a drawer
  // opened before the lazy renderer constructor resolves.
  useLayoutEffect(() => {
    if (worldInputSuspended || nextEventWasSuspendedRef.current) {
      nextEventPhysicalPrimaryRequiredRef.current = true
      clearNextEventGesture(true)
    }
    if (worldInputSuspended) {
      publicityHeldKeyRef.current = null
      hollywoodSceneryCommandHeldKeyRef.current = null
      annexWorkHeldKeyRef.current = null
      annexWorkNavigationPendingRef.current = false
      annexWorkActivationRef.current = null
      annexPendingFocusRef.current = null
      annexFocusNonceRef.current += 1
      cancelHollywoodStage7Gesture()
      cancelGateCandidateGesture()
    }
    nextEventWasSuspendedRef.current = worldInputSuspended
    viewRef.current?.setInputSuspended?.(worldInputSuspended)
  }, [
    cancelGateCandidateGesture,
    cancelHollywoodStage7Gesture,
    clearNextEventGesture,
    worldInputSuspended,
  ])

  // App restores a valid profile opener itself. If fresh state invalidated and
  // unmounted that opener while the drawer was open, own the only safe fallback:
  // the neutral Gate heading, or the Studio Lot heading when Gate truth also failed.
  useEffect(() => {
    if (worldInputSuspended || !gateProfileReturnFocusRef.current) return
    gateProfileReturnFocusRef.current = false
    const intent = gateCandidateIntentRef.current
    const current = intent === null
      ? null
      : gateHiringCandidateContext(latestSnapshotRef.current, intent.talentId)
    if (
      gateSelectedRef.current &&
      intent !== null &&
      current !== null &&
      sameGateOwnerIntent(current.ownerIntent, intent) &&
      gateProfileButtonRef.current?.isConnected
    ) {
      // The App-owned focus restoration targets the exact connected opener.
      return
    }
    if (gateSelectedRef.current && gateHiringMarketContext(latestSnapshotRef.current) !== null) {
      focusGateContext('gate')
    } else {
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
    }
  }, [focusGateContext, worldInputSuspended])

  // ── Feed the live view new authoritative facts whenever GameState changes. ───
  useEffect(() => {
    const v = viewRef.current
    if (v) {
      // StudioLotView owns a pending snapshot while Phaser is still preparing. Feed
      // every accepted host replacement immediately so onReady cannot reconcile a
      // fresh visitor against stale mount-time scene truth.
      const receipt = formationReceiptRef.current
      const formation = receipt === null
        ? null
        : productionFormationContext(latestSnapshotRef.current, receipt)
      const formationDirectorId =
        formation !== null && hollywoodPersonRef.current?.id === formation.director.id
          ? formation.director.id
          : null
      if (rendererStateRef.current !== state) {
        rendererStateRef.current = state
        v.setSnapshot({ ...readSnapshot(state), selectedBuildingId: getLotSelectedBuilding() })
      }
      if (!canvasReady) return
      // C1-M5 FLAKE FIX — this effect RESTORES a selection the renderer lost.
      //
      // It runs on every repaint (`state`, `canvasReady`), and its whole job is to put
      // the world back where the host says it should be after a snapshot delivery or a
      // canvas recreation. When the renderer is ALREADY holding that exact selection
      // there is nothing to restore, and re-asserting it is a second dispatch of a
      // command the world has already obeyed — which is what made three separate
      // React-boundary specs count two selections where one was intended.
      //
      // The comparison reads the RENDERER's own live fields through `worldSelection()`.
      // The host deliberately keeps no copy of what the world is showing: a cached
      // answer here would be the stale-identity trap this campaign keeps finding.
      //
      // The GATE arm below is deliberately NOT guarded: it does not merely re-assert a
      // selection, it re-derives `setGatePhysicalAvailability` from the current market
      // and visitor every repaint, and that recomputation is the point of running it.
      const held = v.worldSelection?.() ?? null
      if (applyNextEventPhysicalOrientation(v)) {
        // Current next-event orientation supersedes older world presentation contexts.
      } else if (formationDirectorId !== null) {
        if (held?.personId !== formationDirectorId) v.selectHollywoodPerson(formationDirectorId)
      }
      const sceneryProductionId = hollywoodSceneryLoadInProductionIdRef.current
      if (nextEventOrientationOwnedRef.current) {
        // Already applied above; do not let an older context repaint over it.
      } else if (formationDirectorId !== null) {
        // Exact person selection above is the sole current physical owner.
      } else if (gateSelectedRef.current) {
        const market = gateHiringMarketContext(latestSnapshotRef.current)
        const intent = gateCandidateIntentRef.current
        const current = intent === null
          ? null
          : gateHiringCandidateContext(latestSnapshotRef.current, intent.talentId)
        const exact = current !== null && intent !== null &&
          sameGateOwnerIntent(current.ownerIntent, intent)
            ? current
            : null
        const visitorAccepted = v.setHollywoodGateVisitor?.(
          exact === null ? null : gateVisitorPresentation(exact),
        ) ?? false
        const physical = market !== null && v.selectHollywoodGatePlace?.() === true
        setGatePhysicalAvailability(
          physical && (exact === null || visitorAccepted) ? 'available' : 'unavailable',
        )
      } else if (!publicitySelectedRef.current && sceneryProductionId !== null) {
        // The scenery surface is the yard place plus the exact production it resolves.
        if (
          held?.productionId !== sceneryProductionId ||
          held.placeId !== SERVICE_YARD_PLACE_ID
        ) v.selectHollywoodSceneryLoadIn?.(sceneryProductionId)
      } else if (!publicitySelectedRef.current && annexSelectedRef.current) {
        if (held?.placeId !== ANNEX_PLACE_ID) {
          if (hollywood) v.selectHollywoodAnnexPlace?.()
          else withoutSelectCue(() => v.select('expansion'))
        }
      } else if (
        !publicitySelectedRef.current &&
        hollywoodStage7DetailProductionIdRef.current !== null &&
        stage7ProductionDetailContext(latestSnapshotRef.current)?.operation.productionId ===
          hollywoodStage7DetailProductionIdRef.current
      ) {
        if (
          held?.productionId !== hollywoodStage7DetailProductionIdRef.current ||
          held.placeId !== STAGE_7_PLACE_ID
        ) v.selectHollywoodProduction?.(hollywoodStage7DetailProductionIdRef.current)
      }
    }
  }, [applyNextEventPhysicalOrientation, state, canvasReady, hollywood, readSnapshot])

  // ── Presence on the Lot V1 — play ONE advanced week, never a batch ───────────
  //
  // Law 3: a synchronous Engine batch is not witnessed time. `advanceToNextEvent` may
  // cross forty weeks in one call; none of those weeks was ever a moment the player
  // was present for, so none of them is animated and the world simply lands on current
  // truth. Only the single Advance-one-week arm — the one week the player asked for,
  // one at a time — plays its beat timeline, and only when the App's own feedback for
  // that advance names the exact week the renderer is now showing.
  //
  // This effect runs AFTER the snapshot-delivery effect above (source order is effect
  // order), so the scene is already holding the new week's projection when it fires.
  const playedAdvanceRef = useRef<object | null>(null)
  useEffect(() => {
    const feedback = cadenceFeedback
    if (feedback === null || feedback === undefined || feedback.kind !== 'week') {
      playedAdvanceRef.current = null
      return
    }
    // One playback per accepted advance: App mints a fresh feedback object each time.
    if (playedAdvanceRef.current === feedback) return
    playedAdvanceRef.current = feedback
    if (!hollywood || !canvasReady) return
    if (feedback.week !== state.market.tick) return
    viewRef.current?.playPresenceWeek?.(feedback.week)
  }, [cadenceFeedback, canvasReady, hollywood, state])

  // Company emphasis is presentation-only and deliberately separate from the
  // physical Stage 7 outline. It follows the exact current production context in
  // every phase, but only when the complete strict snapshot projection survives.
  useEffect(() => {
    if (!hollywood || !canvasReady) return
    const view = viewRef.current
    if (!view) return
    const productionId = hollywoodCompanyPresentationProductionId
    if (productionId !== null && hollywoodCompanyPresentationExact) {
      view.selectHollywoodProductionCompany?.(productionId)
    } else {
      view.clearHollywoodProductionCompanySelection?.()
    }
  }, [
    canvasReady,
    hollywood,
    hollywoodCompanyMembershipSignature,
    hollywoodCompanyPresentationExact,
    hollywoodCompanyPresentationProductionId,
  ])

  // ── Pause when the tab is hidden; resume when visible (no CPU while backgrounded). ─
  useEffect(() => {
    function onVisibility() {
      const hidden = typeof document !== 'undefined' && document.hidden
      if (hidden || nextEventDocumentWasHiddenRef.current) {
        nextEventPhysicalPrimaryRequiredRef.current = true
        clearNextEventGesture(true)
      }
      if (hidden) {
        cancelHollywoodStage7Gesture()
        cancelGateCandidateGesture()
      }
      nextEventDocumentWasHiddenRef.current = hidden
      // PF1-M1: the studio's sound sleeps and wakes on exactly this seam, so a
      // backgrounded tab is silent for the same reason it stops drawing.
      setDocumentHidden(hidden)
      const v = viewRef.current
      if (!v) return
      if (hidden) v.pause()
      else v.resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    onVisibility()
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [cancelGateCandidateGesture, cancelHollywoodStage7Gesture, clearNextEventGesture])

  // ── PF1-M1 audio: the lot is audible while it is mounted AND visible. ────────
  // Music and ambience begin with the screen and end with it (or with the hidden-tab
  // pause above). Nothing here reads engine internals: the construction texture keys
  // off the SAME snapshot the world is painted from.
  useEffect(() => {
    if (documentHidden) return
    const audio = getAudioService()
    audio.startMusic(LOT_ERA_KEY)
    return () => {
      audio.stopMusic()
      audio.stopAmbience()
    }
  }, [documentHidden])

  useEffect(() => {
    if (documentHidden) return
    getAudioService().setAmbienceScene({ constructionActive: lotConstructionActive })
  }, [documentHidden, lotConstructionActive])

  // A live change to the OS preference — or to the player's — arrives through
  // `useResolvedMotion` above. There is no second subscription here on purpose.

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

  useEffect(() => {
    // The publicity performance proof must measure the selected campaign subtree,
    // not inherit a rolling window gathered before that subtree was mounted. This
    // runs after React commits the panel and is inert outside explicit proof mode.
    if (!hollywood || !identityProof || !canvasReady || !publicitySelected) return
    const view = viewRef.current
    view?.resetHollywoodPerformance?.()
    const emptyWindow = view?.hollywoodPerformance()
    if (emptyWindow) setHollywoodPerf(emptyWindow)
    setHollywoodPerfWindow((current) => current + 1)
  }, [hollywood, identityProof, canvasReady, publicitySelected])

  useEffect(() => {
    // Gate evidence owns a fresh sustained window after the one visitor sprite is
    // committed. This is dev-only telemetry; ordinary play does not poll or reset it.
    if (!hollywood || !identityProof || !canvasReady || gateCandidateIntent === null) return
    const view = viewRef.current
    view?.resetHollywoodPerformance?.()
    const emptyWindow = view?.hollywoodPerformance()
    if (emptyWindow) setHollywoodPerf(emptyWindow)
    setHollywoodPerfWindow((current) => current + 1)
  }, [hollywood, identityProof, canvasReady, gateCandidateIntent])

  const selectHollywoodPerson = useCallback((person: LotPersonState) => {
    yieldNextEventOrientation()
    recordHollywoodPerson(person)
    viewRef.current?.selectHollywoodPerson(person.id)
  }, [recordHollywoodPerson, yieldNextEventOrientation])

  const selectHollywoodProduction = useCallback((productionId: string) => {
    yieldNextEventOrientation()
    enterHollywoodProductionContext(productionId, {
      stage7Only: false,
      detailEligible: false,
      focus: false,
    })
  }, [enterHollywoodProductionContext, yieldNextEventOrientation])

  const inspectHollywoodStage7 = useCallback((productionId: string) => {
    enterHollywoodProductionContext(productionId, {
      stage7Only: true,
      detailEligible: true,
      focus: 'primary',
    })
  }, [enterHollywoodProductionContext])

  const inspectHollywoodSceneryLoadIn = useCallback((
    productionId: string,
    grantsStage7Detail = false,
  ) => {
    const stage7 = stage7ProductionDetailContext(latestSnapshotRef.current)
    if (stage7?.operation.productionId !== productionId) return
    if (grantsStage7Detail) ownHollywoodStage7DetailContext(productionId)
    enterHollywoodSceneryLoadInContext({
      productionId,
      locationBuildingId: 'stage-a',
      placeId: 'service-yard',
    }, {
      paintHollywoodOutline: true,
      focus: true,
    })
  }, [enterHollywoodSceneryLoadInContext, ownHollywoodStage7DetailContext])

  const dispatchHollywoodProductionCommand = useCallback((
    productionId: string,
    command: LotProductionCommand,
  ) => {
    if (worldInputSuspendedRef.current) return
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
    if (worldInputSuspendedRef.current || clickDetail > 1) return
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
      worldInputSuspendedRef.current ||
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

  const openAnnexWorkDetails = useCallback((rendered: LotAnnexWorkContext) => {
    if (
      worldInputSuspendedRef.current ||
      !annexSelectedRef.current ||
      annexWorkNavigationPendingRef.current ||
      rendered.occupant === null ||
      rendered.ownerIntent === null
    ) return

    // Rebuild from the latest snapshot immediately before crossing the world/deep-panel
    // boundary. Every displayed occupant field must still agree; title alone is never identity.
    const latest = operationalAnnexWorkContext(latestSnapshotRef.current)
    const owner = onOpenAnnexWorkDetailsRef.current
    if (
      latest === null ||
      latest.occupant === null ||
      latest.ownerIntent === null ||
      !isExactAnnexWorkContext(rendered, latest) ||
      owner === undefined
    ) {
      setAnnexAnnouncementSerial((serial) => serial + 1)
      setAnnexAnnouncement('Annex work changed. Review the current Annex work before opening details.')
      focusSelectedAnnex('work')
      return
    }

    annexWorkNavigationPendingRef.current = true
    let accepted = false
    try {
      accepted = owner(latest.ownerIntent)
    } catch {
      accepted = false
    }
    if (accepted) return

    annexWorkNavigationPendingRef.current = false
    annexWorkHeldKeyRef.current = null
    setAnnexAnnouncementSerial((serial) => serial + 1)
    setAnnexAnnouncement('Annex work changed. Review the current Annex work before opening details.')
    focusSelectedAnnex('work')
  }, [focusSelectedAnnex])

  const guardAnnexWorkKeyDown = useCallback((event: {
    key: string
    repeat: boolean
    preventDefault(): void
    stopPropagation(): void
  }, rendered: LotAnnexWorkContext) => {
    containWorldInput(event)
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (
      worldInputSuspendedRef.current ||
      event.repeat ||
      annexWorkNavigationPendingRef.current ||
      annexWorkHeldKeyRef.current === event.key
    ) {
      event.preventDefault()
      return
    }
    annexWorkHeldKeyRef.current = event.key
    annexWorkActivationRef.current = rendered
  }, [])

  const releaseAnnexWorkKey = useCallback((event: {
    key: string
    stopPropagation(): void
  }) => {
    containWorldInput(event)
    if (annexWorkHeldKeyRef.current === event.key) {
      annexWorkHeldKeyRef.current = null
    }
  }, [])

  const rejectHollywoodStage7DetailHandoff = useCallback(() => {
    const renderedProductionId = hollywoodStage7DetailProductionIdRef.current
    const latest = stage7ProductionDetailContext(latestSnapshotRef.current)
    const canFocusFreshStage7 =
      renderedProductionId !== null &&
      latest?.operation.productionId === renderedProductionId &&
      renderedHollywoodProductionIdRef.current === renderedProductionId

    clearHollywoodStage7DetailContext()
    if (!canFocusFreshStage7) {
      setHollywoodProductionId(null)
      viewRef.current?.clearHollywoodPlaceSelection?.()
      recordSelection(null)
    }
    announceHollywoodActivity(
      'Stage 7 production changed. Review current Stage 7 work before opening details.',
    )
    queueMicrotask(() => {
      ;(canFocusFreshStage7
        ? hollywoodStage7HeadingRef.current
        : studioHeadingRef.current
      )?.focus({ preventScroll: true })
    })
  }, [
    announceHollywoodActivity,
    clearHollywoodStage7DetailContext,
    recordSelection,
  ])

  const openHollywoodStage7ProductionDetails = useCallback((
    rendered: Stage7ProductionDetailContext,
    clickDetail: number,
  ) => {
    if (
      worldInputSuspendedRef.current ||
      clickDetail > 1 ||
      hollywoodStage7NavigationPendingRef.current ||
      hollywoodStage7DetailProductionIdRef.current !== rendered.operation.productionId
    ) return

    const latest = stage7ProductionDetailContext(latestSnapshotRef.current)
    const owner = onOpenStage7ProductionDetailsRef.current
    if (
      latest === null ||
      owner === undefined ||
      !sameStage7ProductionDetailContext(rendered, latest)
    ) {
      rejectHollywoodStage7DetailHandoff()
      return
    }

    hollywoodStage7NavigationPendingRef.current = true
    let accepted = false
    try {
      accepted = owner(latest.ownerIntent)
    } catch {
      accepted = false
    }
    if (accepted) return

    hollywoodStage7NavigationPendingRef.current = false
    hollywoodStage7HeldKeyRef.current = null
    hollywoodStage7ActivationRef.current = null
    rejectHollywoodStage7DetailHandoff()
  }, [rejectHollywoodStage7DetailHandoff])

  const latchHollywoodStage7DetailActivation = useCallback((
    event: { stopPropagation(): void },
    rendered: Stage7ProductionDetailContext,
  ) => {
    containWorldInput(event)
    if (
      worldInputSuspendedRef.current ||
      hollywoodStage7NavigationPendingRef.current
    ) return
    if (hollywoodStage7ActivationRef.current === null) {
      hollywoodStage7SuppressNextClickRef.current = false
      hollywoodStage7ActivationRef.current = rendered
    }
  }, [])

  const guardHollywoodStage7DetailKeyDown = useCallback((
    event: {
      key: string
      repeat: boolean
      preventDefault(): void
      stopPropagation(): void
    },
    rendered: Stage7ProductionDetailContext,
  ) => {
    containWorldInput(event)
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (
      worldInputSuspendedRef.current ||
      event.repeat ||
      hollywoodStage7NavigationPendingRef.current ||
      hollywoodStage7HeldKeyRef.current === event.key
    ) {
      event.preventDefault()
      return
    }
    // Own keyboard activation at its accepted key boundary. Preventing the
    // browser's later synthetic click removes the only ambiguous cross-modal /
    // hidden-tab lifetime while preserving click(detail=0) for virtual AT.
    event.preventDefault()
    hollywoodStage7SuppressNextClickRef.current = false
    if (hollywoodStage7ActivationRef.current === null) {
      hollywoodStage7ActivationRef.current = rendered
    }
    hollywoodStage7HeldKeyRef.current = event.key
    const captured = hollywoodStage7ActivationRef.current
    hollywoodStage7ActivationRef.current = null
    openHollywoodStage7ProductionDetails(captured, 0)
  }, [openHollywoodStage7ProductionDetails])

  const releaseHollywoodStage7DetailKey = useCallback((event: {
    key: string
    stopPropagation(): void
  }) => {
    containWorldInput(event)
    if (hollywoodStage7HeldKeyRef.current === event.key) {
      hollywoodStage7HeldKeyRef.current = null
    }
  }, [])

  const runHollywoodPublicity = useCallback((renderedOffer: LotPublicityOffer) => {
    if (
      worldInputSuspendedRef.current ||
      !publicitySelectedRef.current ||
      publicityPendingRef.current
    ) return
    const current = publicityCampaignContext(latestSnapshotRef.current)
    const latest = current?.offers.find((offer) => offer.tier === renderedOffer.tier)
    if (
      current === null ||
      latest === undefined ||
      !latest.available ||
      !isFieldExactPublicityOffer(renderedOffer, latest)
    ) {
      announceHollywoodActivity('Publicity offer changed. Review the current campaign terms.')
      focusPublicityContext('status')
      return
    }
    const owner = onRunPublicityRef.current
    if (owner === undefined) return

    publicityPendingRef.current = true
    setPublicityPending(true)
    const result = owner(renderedOffer.tier)
    if (!result.ok) {
      publicityPendingRef.current = false
      setPublicityPending(false)
      announceHollywoodActivity(`Publicity blocked: ${cleanPublicityError(result.error)}`)
      queueMicrotask(() => {
        if (!publicitySelectedRef.current) return
        const button = publicityButtonRefs.current[renderedOffer.tier]
        if (button && !button.disabled) button.focus({ preventScroll: true })
        else publicityStatusRef.current?.focus({ preventScroll: true })
      })
      return
    }
    if (
      result.tier !== renderedOffer.tier ||
      result.acceptedWeek !== latestSnapshotRef.current.week
    ) {
      clearPublicityContext()
      setHollywoodPlace(null)
      viewRef.current?.clearHollywoodPlaceSelection?.()
      recordSelection(null)
      announceHollywoodActivity('Publicity acceptance receipt did not match the selected offer.')
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
      return
    }

    acceptedPublicityRef.current = { receipt: result, renderedOffer }
  }, [
    announceHollywoodActivity,
    clearPublicityContext,
    focusPublicityContext,
    recordSelection,
  ])

  const guardPublicityKeyDown = useCallback((event: {
    key: string
    repeat: boolean
    preventDefault(): void
    stopPropagation(): void
  }) => {
    containWorldInput(event)
    if (worldInputSuspendedRef.current) {
      event.preventDefault()
      return
    }
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (event.repeat || publicityHeldKeyRef.current === event.key) {
      event.preventDefault()
      return
    }
    publicityHeldKeyRef.current = event.key
  }, [])

  const releasePublicityKey = useCallback((event: { key: string; stopPropagation(): void }) => {
    containWorldInput(event)
    if (publicityHeldKeyRef.current === event.key) publicityHeldKeyRef.current = null
  }, [])

  const rejectGateCandidateHandoff = useCallback((message: string) => {
    cancelGateCandidateGesture()
    announceHollywoodActivity(message)
    if (!gateSelectedRef.current) return

    const market = gateHiringMarketContext(latestSnapshotRef.current)
    if (market === null) {
      clearGateContext()
      setHollywoodPlace(null)
      recordSelection(null)
      viewRef.current?.clearHollywoodPlaceSelection?.()
      queueMicrotask(() => studioHeadingRef.current?.focus({ preventScroll: true }))
      return
    }

    const owned = gateCandidateIntentRef.current
    const current = owned === null
      ? null
      : gateHiringCandidateContext(latestSnapshotRef.current, owned.talentId)
    if (
      owned !== null &&
      current !== null &&
      sameGateOwnerIntent(current.ownerIntent, owned)
    ) {
      gateCandidateIntentRef.current = current.ownerIntent
      setGateCandidateIntent(current.ownerIntent)
      viewRef.current?.setHollywoodGateVisitor?.(gateVisitorPresentation(current))
      focusGateContext('visitor')
      return
    }

    clearGateCandidate()
    focusGateContext('gate')
  }, [
    announceHollywoodActivity,
    cancelGateCandidateGesture,
    clearGateCandidate,
    clearGateContext,
    focusGateContext,
    recordSelection,
  ])

  const openGateCandidateDestination = useCallback((
    action: GateCandidateAction,
    rendered: GateHiringCandidateContext,
    clickDetail: number,
  ) => {
    if (
      worldInputSuspendedRef.current ||
      !gateSelectedRef.current ||
      gateNavigationPendingRef.current ||
      clickDetail > 1
    ) return

    const owned = gateCandidateIntentRef.current
    const latest = gateHiringCandidateContext(
      latestSnapshotRef.current,
      rendered.candidate.talentId,
    )
    if (
      owned === null ||
      !sameGateOwnerIntent(rendered.ownerIntent, owned) ||
      latest === null ||
      !sameGateHiringCandidateContext(rendered, latest)
    ) {
      rejectGateCandidateHandoff(
        'Gate visitor details changed. Review the current Gate slate before opening details.',
      )
      return
    }

    const owner = action === 'profile'
      ? onOpenGateCandidateProfileRef.current
      : onOpenGateCandidateHiringRef.current
    if (owner === undefined) return

    gateNavigationPendingRef.current = true
    let accepted = false
    try {
      accepted = owner(latest.ownerIntent)
    } catch {
      accepted = false
    }
    if (accepted) {
      if (action === 'profile') gateProfileReturnFocusRef.current = true
      return
    }

    gateNavigationPendingRef.current = false
    gateHeldKeyRef.current = null
    gateActivationRef.current = null
    rejectGateCandidateHandoff(
      `Current Gate details for ${rendered.candidate.name} could not be opened. Review the fresh visitor context.`,
    )
  }, [rejectGateCandidateHandoff])

  const latchGateCandidateAction = useCallback((
    event: { stopPropagation(): void },
    action: GateCandidateAction,
    rendered: GateHiringCandidateContext,
  ) => {
    containWorldInput(event)
    if (
      worldInputSuspendedRef.current ||
      gateNavigationPendingRef.current ||
      gateActivationRef.current !== null
    ) return
    gateSuppressNextClickRef.current = false
    gateSuppressKeyboardClickRef.current = null
    gateActivationRef.current = { action, context: rendered }
  }, [])

  const guardGateCandidateActionKeyDown = useCallback((
    event: {
      key: string
      repeat: boolean
      preventDefault(): void
      stopPropagation(): void
    },
    action: GateCandidateAction,
    rendered: GateHiringCandidateContext,
  ) => {
    containWorldInput(event)
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (
      worldInputSuspendedRef.current ||
      event.repeat ||
      gateNavigationPendingRef.current ||
      gateHeldKeyRef.current !== null
    ) {
      event.preventDefault()
      return
    }
    event.preventDefault()
    // A prior key whose compatibility click never arrived has already completed
    // once its keyup was observed. A later keydown is a fresh boundary.
    gateSuppressKeyboardClickRef.current = null
    gateHeldKeyRef.current = event.key
    gateActivationRef.current = { action, context: rendered }
    const captured = gateActivationRef.current
    gateActivationRef.current = null
    openGateCandidateDestination(captured.action, captured.context, 0)
    // Rejection reconciliation clears general gesture state; preserve the actual
    // physical held key until document-level keyup so a second held key cannot enter.
    gateHeldKeyRef.current = event.key
    // Native buttons may follow a keyboard activation with a detail-0 click. Keep
    // the exact rendered token so a rejected owner cannot be invoked a second time,
    // while a different candidate/action remains a fresh accessibility boundary.
    gateSuppressKeyboardClickRef.current = captured
  }, [openGateCandidateDestination])

  const releaseGateCandidateActionKey = useCallback((event: {
    key: string
    stopPropagation(): void
  }) => {
    containWorldInput(event)
    if (gateHeldKeyRef.current === event.key) gateHeldKeyRef.current = null
  }, [])

  const clickGateCandidateAction = useCallback((
    action: GateCandidateAction,
    rendered: GateHiringCandidateContext,
    clickDetail: number,
  ) => {
    const keyboardActivation = gateSuppressKeyboardClickRef.current
    if (clickDetail === 0 && keyboardActivation !== null) {
      gateSuppressKeyboardClickRef.current = null
      if (
        keyboardActivation.action === action &&
        sameGateHiringCandidateContext(keyboardActivation.context, rendered)
      ) return
    }
    if (gateSuppressNextClickRef.current && clickDetail > 0) {
      gateSuppressNextClickRef.current = false
      gateActivationRef.current = null
      return
    }
    const captured = gateActivationRef.current
    gateActivationRef.current = null
    if (clickDetail > 1) return
    if (captured !== null) {
      if (captured.action !== action) return
      openGateCandidateDestination(captured.action, captured.context, clickDetail)
      return
    }
    // `detail === 0` is the browser/AT activation path with no pointer-start token.
    if (clickDetail === 0) openGateCandidateDestination(action, rendered, clickDetail)
  }, [openGateCandidateDestination])

  // ── Build Mode V1 — the bounded in-world placement flow ────────────────────
  //
  // Retained-workspace discipline (shift laws 15–16) applied to a draft that lives in
  // the world instead of a modal: the draft carries value + monotonic revision; a
  // commit autosaves through the App owner and closes the flow; a cancel is BYTE-
  // NEUTRAL because it never dispatched anything; and an Engine rejection keeps the
  // draft exactly where it was and reports the Engine's own words.

  /** Leave the build flow without touching GameState. Byte-neutral by construction. */
  const cancelBuild = useCallback(() => {
    buildDraftRef.current = null
    setBuildDraft(null)
    setBuildError(null)
    setBuildFlowOpen(false)
    viewRef.current?.setWorldBuildMode?.(null)
    viewRef.current?.setWorldPlacementPreview?.(null)
  }, [])

  /** Release the parcel panel and any draft inside it. */
  const clearParcelContext = useCallback(() => {
    cancelBuild()
    setBuildReceipt(null)
    parcelInspectorIdRef.current = null
    setParcelInspectorId(null)
    viewRef.current?.clearWorldParcelSelection?.()
  }, [cancelBuild])

  /**
   * The in-world landing a parcel of the studio's own ground has. Same right-rail
   * pattern, same focus discipline and same canvas/companion parity the M1.5 building
   * inspector established — a parcel is simply the other kind of place on this lot.
   */
  const enterParcelInspectorContext = useCallback((parcelId: string): boolean => {
    if (!tycoon || worldInputSuspendedRef.current) return false
    if (lotParcelInspectorContext(latestPlacementRef.current, parcelId) === null) return false
    cancelBuild()
    setBuildReceipt(null)
    setBuildError(null)
    clearFormationContext()
    clearHollywoodStage7DetailContext()
    clearGateContext()
    clearPublicityContext()
    clearHollywoodSceneryLoadInContext()
    clearAnnexContext()
    setSelectionInfo(null)
    setHollywoodPerson(null)
    setHollywoodPlace(null)
    pendingHollywoodFocusProductionId.current = null
    viewRef.current?.clearHollywoodPersonSelection?.()
    // `recordSelection` releases every other in-world context, including this one, so
    // the parcel claims ownership immediately after it — the established order.
    recordSelection(null)
    parcelInspectorIdRef.current = parcelId
    setParcelInspectorId(parcelId)
    // Law 10: canvas intent and semantic navigation name the same owner. A companion
    // activation asks the renderer for the outline the canvas already paints.
    viewRef.current?.selectWorldParcel?.(parcelId)
    const nonce = ++parcelFocusNonceRef.current
    queueMicrotask(() => {
      if (parcelFocusNonceRef.current !== nonce || worldInputSuspendedRef.current) return
      parcelInspectorHeadingRef.current?.focus({ preventScroll: true })
    })
    return true
  }, [
    cancelBuild,
    clearAnnexContext,
    clearFormationContext,
    clearGateContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearPublicityContext,
    recordSelection,
    tycoon,
  ])

  /** Enter the catalog's chosen blueprint at a courteous first origin on this parcel. */
  const beginBuild = useCallback((blueprintId: string) => {
    if (worldInputSuspendedRef.current || buildPendingRef.current) return
    const parcelId = parcelInspectorIdRef.current
    const placement = latestPlacementRef.current
    if (parcelId === null || placement === null) return
    const parcel = parcelById(placement, parcelId)
    const blueprint = blueprintById(placement, blueprintId)
    if (parcel === null || blueprint === null || !placement.buildEnabled) return
    // C1-M5: a locked, spent or unaffordable entry never starts a draft. The button is
    // already disabled; this is the second line, because a way in that only the UI
    // guards is a way in (the engine would refuse the commit, but the player would have
    // been walked all the way to a ghost first).
    if (lotCatalogEntryFor(placement, blueprintId)?.selectable !== true) return

    const origin = defaultBuildOrigin(
      parcel,
      blueprint.footprint,
      placementsOnParcel(placement, parcelId),
    )
    const draft: LotBuildDraft = {
      parcelId,
      blueprintId,
      origin,
      revision: ++buildRevisionRef.current,
      movingPlacementId: null,
    }
    buildDraftRef.current = draft
    setBuildDraft(draft)
    setBuildError(null)
    setBuildReceipt(null)
    setBuildFlowOpen(true)
    viewRef.current?.setWorldBuildMode?.({ parcelId, footprint: blueprint.footprint })
    pendingBuildFocusRef.current = 'origin'
  }, [])

  /** Open the catalog over this parcel. No draft exists yet; nothing is previewed. */
  const openBuildCatalog = useCallback(() => {
    if (worldInputSuspendedRef.current || buildPendingRef.current) return
    const placement = latestPlacementRef.current
    const parcelId = parcelInspectorIdRef.current
    if (placement === null || parcelId === null || !placement.buildEnabled) return
    setBuildReceipt(null)
    setBuildError(null)
    setBuildFlowOpen(true)
  }, [])

  /** Replace the draft origin, clamped inside its parcel, bumping the revision. */
  const moveBuildOrigin = useCallback((next: LotCellPoint, fromParcelId?: string | null) => {
    if (worldInputSuspendedRef.current || buildPendingRef.current) return
    const draft = buildDraftRef.current
    const placement = latestPlacementRef.current
    if (draft === null || placement === null) return
    // A late canvas report for a parcel the draft has already left is a superseded
    // revision, not a new command (shift law 16). A ROAMING move draft owns no parcel,
    // so no report can be stale against one — it is clamped to the property instead.
    if (draft.parcelId !== null && fromParcelId !== undefined && fromParcelId !== draft.parcelId) {
      return
    }
    const parcel = draft.parcelId === null ? null : parcelById(placement, draft.parcelId)
    const blueprint = blueprintById(placement, draft.blueprintId)
    if (blueprint === null) return
    if (draft.parcelId !== null && parcel === null) return
    const origin =
      parcel === null
        ? clampMoveOrigin(
            next,
            { width: placement.lotWidth, depth: placement.lotDepth },
            blueprint.footprint,
          )
        : clampBuildOrigin(next, parcel.rect, blueprint.footprint)
    if (origin.gx === draft.origin.gx && origin.gy === draft.origin.gy) return
    const updated: LotBuildDraft = { ...draft, origin, revision: ++buildRevisionRef.current }
    buildDraftRef.current = updated
    setBuildDraft(updated)
    setBuildError(null)
  }, [])

  // ── Move & Demolish V1 (C1-M3b) ────────────────────────────────────────────
  //
  // A MOVE re-enters the machinery a build already uses — draft, revision, live quote,
  // per-cell ghost, explicit commit — with two differences and no third: the draft
  // carries the placement being carried, and it is bounded to the PROPERTY rather than
  // to one parcel, because where a building the player already owns may stand is the
  // quote's question and not a parcel's.
  //
  // A DEMOLISH has no draft at all. It is one identity and one confirm.

  /**
   * The PLAYER's words for a refusal the action layer threw (C1-M3b).
   *
   * `applyActions` rejects a refused mutation by throwing a message that names the
   * refusal CODE and the engine ids behind it — deliberately, so a caller error is
   * loud. That message is diagnostics, not copy: a player must never read
   * `facilityEngaged — "facility-development-casting-annex" is held by …`.
   *
   * So a failed dispatch is re-PROBED against the latest state and re-stated in the same
   * blocked-state grammar the disabled verb uses. A refusal the probe can no longer
   * reproduce (a genuine race) degrades to one neutral sentence rather than the raw
   * message, because the raw message would be the worst of both.
   */
  const facilityRefusalWords = useCallback((placementId: number, facilityName: string): string => {
    const refusal = facilityDemolitionRefusal(latestGameStateRef.current, { placementId })
    return (
      facilityMutationBlockedReason(facilityName, {
        code: refusal?.code === 'facilityEngaged' ? 'facilityEngaged' : 'unknownPlacement',
        holders:
          refusal?.code === 'facilityEngaged'
            ? refusal.holders.map((holder) => ({
                kind: holder.kind,
                holderId: holder.holderId,
                activity: holder.activity,
                title: null,
              }))
            : [],
      }) ?? 'The studio cannot take this building down right now.'
    )
  }, [])

  /** Pick this building up. The original stays standing until the move commits. */
  const beginFacilityMove = useCallback((placementId: number) => {
    if (worldInputSuspendedRef.current || buildPendingRef.current) return
    const placement = latestPlacementRef.current
    if (placement === null) return
    const placed = placedFacilityById(placement.placements, placementId)
    if (placed === null || placed.mutation?.canMove !== true) return
    const blueprint = blueprintById(placement, placed.blueprintId)
    if (blueprint === null) return
    setDemolishIntent(null)
    demolishIntentRef.current = null
    setDemolishError(null)
    const draft: LotBuildDraft = {
      // A move roams: no parcel bounds it, and the per-cell verdicts teach the rest.
      parcelId: null,
      blueprintId: placed.blueprintId,
      // It starts exactly where the building already stands, so "cancel" and "commit
      // without moving" are the same no-op the player expects.
      origin: { gx: placed.origin.gx, gy: placed.origin.gy },
      revision: ++buildRevisionRef.current,
      movingPlacementId: placementId,
    }
    buildDraftRef.current = draft
    setBuildDraft(draft)
    setBuildError(null)
    setBuildReceipt(null)
    setBuildFlowOpen(false)
    viewRef.current?.setWorldBuildMode?.({
      parcelId: null,
      footprint: blueprint.footprint,
      movingPlacementId: placementId,
    })
    pendingBuildFocusRef.current = 'origin'
  }, [])

  /** Open the in-world confirm. It commits nothing by existing (shift law 15). */
  const openDemolishConfirm = useCallback((placementId: number) => {
    if (worldInputSuspendedRef.current || demolishPendingRef.current) return
    const placement = latestPlacementRef.current
    if (placement === null) return
    const placed = placedFacilityById(placement.placements, placementId)
    if (placed === null || placed.mutation?.canDemolish !== true) return
    cancelBuild()
    setBuildReceipt(null)
    setDemolishError(null)
    demolishIntentRef.current = placementId
    setDemolishIntent(placementId)
    pendingBuildFocusRef.current = 'demolish'
  }, [cancelBuild])

  /** Byte-neutral: closing the confirm touches nothing but this surface. */
  const cancelDemolish = useCallback(() => {
    demolishIntentRef.current = null
    setDemolishIntent(null)
    setDemolishError(null)
    pendingBuildFocusRef.current = 'building'
  }, [])

  /**
   * Take it down. The Lot sends ONE identity; the refund, the ledger row and the
   * withdrawal of the facility are all the Engine's, re-derived inside the action.
   */
  const confirmDemolish = useCallback(() => {
    if (worldInputSuspendedRef.current || demolishPendingRef.current) return
    const placementId = demolishIntentRef.current
    const placement = latestPlacementRef.current
    const owner = onDemolishFacilityRef.current
    if (placementId === null || placement === null || owner === undefined) return
    const placed = placedFacilityById(placement.placements, placementId)
    if (placed === null) return
    const name = placed.name
    const parcelId = placed.parcelId
    const refund = placed.mutation?.demolitionRefund ?? 0
    demolishPendingRef.current = true
    setDemolishPending(true)
    const outcome = owner({ placementId })
    demolishPendingRef.current = false
    setDemolishPending(false)
    if (!outcome.ok) {
      // The confirm SURVIVES a rejection, and the player reads the studio's words for
      // what the engine refused — never the action layer's diagnostic message.
      setBuildAnnouncementSerial((serial) => serial + 1)
      setDemolishError(facilityRefusalWords(placementId, name))
      // PF1-M2: the studio declining, out loud — once, where the refusal is surfaced.
      punctuateRefusal(latestGameStateRef.current.market.tick)
      return
    }
    demolishIntentRef.current = null
    setDemolishIntent(null)
    setDemolishError(null)
    setBuildAnnouncementSerial((serial) => serial + 1)
    // The body is gone. A selection pointing at it would be a dangling identity, which
    // is exactly the defect family this campaign is hunting — so the selection is
    // released HERE, before any snapshot can arrive to be misread (C1-M3b).
    //
    // Where it LANDS is the ground the building stood on: that parcel is a real thing
    // that survived, it is what actually changed, and it is where the player would look
    // next. A demolition that dropped the player into nothing at all would be neutral
    // and useless. If the parcel cannot describe itself, selection falls all the way to
    // neutral rather than to a second guess.
    setBuildingInspectorId(null)
    recordSelection(null)
    viewRef.current?.clearHollywoodPlaceSelection?.()
    if (!enterParcelInspectorContext(parcelId)) clearParcelContext()
    setBuildReceipt(demolishReceiptText(name, refund))
  }, [
    clearParcelContext,
    enterParcelInspectorContext,
    facilityRefusalWords,
    recordSelection,
  ])

  /** Keyboard-driven nudging — the non-pointer path to every legal origin. */
  const nudgeBuildOrigin = useCallback((dgx: number, dgy: number) => {
    const draft = buildDraftRef.current
    if (draft === null) return
    moveBuildOrigin({ gx: draft.origin.gx + dgx, gy: draft.origin.gy + dgy })
  }, [moveBuildOrigin])

  /**
   * Commit. The Lot sends a blueprint id and an origin and nothing else: the Engine
   * re-runs its own query inside the commit and charges its own price (the runner
   * invariant). A rejection keeps the draft and reports the exact Engine message.
   */
  const commitBuild = useCallback(() => {
    if (worldInputSuspendedRef.current || buildPendingRef.current) return
    const draft = buildDraftRef.current
    const placement = latestPlacementRef.current
    if (draft === null || placement === null) return
    const moving = draft.movingPlacementId
    // ONE commit seam for both verbs. A move and a build differ in exactly two places —
    // which owner is asked, and which receipt the player reads — and share everything
    // else, including the re-query that keeps the runner invariant honest (C1-M3b).
    const owner = moving === null ? onPlaceFacilityRef.current : onMoveFacilityRef.current
    if (owner === undefined) return
    const blueprint = blueprintById(placement, draft.blueprintId)
    if (blueprint === null) return
    const movingFrom = moving === null ? null : placedFacilityById(placement.placements, moving)
    if (moving !== null && movingFrom === null) return
    // Re-query against the LATEST state immediately before crossing the boundary: a
    // week may have advanced under an open panel and moved the answer.
    const request: PlacementRequest = { blueprintId: draft.blueprintId, origin: draft.origin }
    const latest = placementQuote(
      latestGameStateRef.current,
      request,
      moving === null ? undefined : { movingPlacementId: moving },
    )
    if (!latest.ok) {
      setBuildAnnouncementSerial((serial) => serial + 1)
      setBuildError(quoteRejectionText(latest) ?? 'This placement is no longer legal.')
      punctuateRefusal(latestGameStateRef.current.market.tick)
      return
    }

    buildPendingRef.current = true
    setBuildPending(true)
    const outcome =
      moving === null
        ? (owner as (placement: PlacementRequest) => ActionOutcome)(request)
        : (owner as (move: FacilityMoveRequest) => ActionOutcome)({
            placementId: moving,
            origin: draft.origin,
          })
    buildPendingRef.current = false
    setBuildPending(false)
    if (!outcome.ok) {
      // The draft SURVIVES a rejection with its exact value and revision, and the
      // player reads the Engine's own words (shift law 15: receipts explain, never veto).
      setBuildAnnouncementSerial((serial) => serial + 1)
      setBuildError(outcome.error)
      punctuateRefusal(latestGameStateRef.current.market.tick)
      return
    }
    setBuildAnnouncementSerial((serial) => serial + 1)
    setBuildError(null)
    setBuildReceipt(
      moving === null
        ? buildReceiptText(latest, blueprint.name)
        : moveReceiptText(
            movingFrom?.name ?? blueprint.name,
            parcelById(placement, latest.parcelId ?? '')?.label ?? null,
          ),
    )
    cancelBuild()
    // A move keeps the player with the BUILDING they were carrying; a build hands them
    // back the ground they were building on.
    pendingBuildFocusRef.current = moving === null ? 'parcel' : 'building'
  }, [cancelBuild])

  // Deliver build mode + the ghost to the renderer whenever the draft's revision, the
  // quote, or renderer readiness changes. ONE delivery owner, latest truth only (law 4).
  useEffect(() => {
    const view = viewRef.current
    if (!view || !canvasReady) return
    if (buildDraft === null || buildBlueprint === null) {
      view.setWorldBuildMode?.(null)
      view.setWorldPlacementPreview?.(null)
      return
    }
    view.setWorldBuildMode?.({
      parcelId: buildDraft.parcelId,
      footprint: buildBlueprint.footprint,
      ...(buildDraft.movingPlacementId === null
        ? {}
        : { movingPlacementId: buildDraft.movingPlacementId }),
    })
    if (buildQuote === null) {
      view.setWorldPlacementPreview?.(null)
      return
    }
    view.setWorldPlacementPreview?.({
      blueprintId: buildQuote.blueprintId,
      parcelId: buildDraft.parcelId,
      origin: { gx: buildQuote.origin.gx, gy: buildQuote.origin.gy },
      cells: buildQuote.cellLegality.map((verdict) => ({
        gx: verdict.cell.gx,
        gy: verdict.cell.gy,
        ok: verdict.ok,
      })),
      ok: buildQuote.ok,
      caption: buildQuote.ok
        ? `${moneyExact(buildQuote.cost)} · ${String(buildQuote.buildWeeks)} weeks`
        : (quoteRejectionText(buildQuote) ?? 'This placement is not legal.'),
    })
  }, [buildBlueprint, buildDraft, buildQuote, canvasReady])

  // Deliver the guidance marker's target to the renderer whenever the journey moves or
  // the renderer becomes ready. ONE delivery owner, latest truth only (law 4) — the same
  // discipline the build ghost above is delivered with.
  useEffect(() => {
    const view = viewRef.current
    if (!view || !canvasReady) return
    view.setWorldGuidanceTarget?.(guidanceMarkerTarget)
  }, [canvasReady, guidanceMarkerTarget])

  // Focus the control the flow just handed the player, once, after React commits it.
  useEffect(() => {
    const pending = pendingBuildFocusRef.current
    if (pending === null || worldInputSuspended) return
    pendingBuildFocusRef.current = null
    if (pending === 'origin') buildOriginPadRef.current?.focus({ preventScroll: true })
    else if (pending === 'commit') buildCommitRef.current?.focus({ preventScroll: true })
    else if (pending === 'demolish') demolishConfirmRef.current?.focus({ preventScroll: true })
    else if (pending === 'building') {
      buildingInspectorHeadingRef.current?.focus({ preventScroll: true })
    } else parcelInspectorHeadingRef.current?.focus({ preventScroll: true })
  }, [buildDraft, buildReceipt, demolishIntent, worldInputSuspended])

  // A parcel panel whose parcel stopped being describable cannot stay open.
  useEffect(() => {
    if (parcelInspectorId === null) return
    if (lotParcelInspectorContext(placementView, parcelInspectorId) !== null) return
    clearParcelContext()
  }, [clearParcelContext, parcelInspectorId, placementView])

  /**
   * ORPHAN SAFETY (C1-M3b) — a building that is gone cannot stay selected.
   *
   * The twice-found defect family in one sentence: a surface holding an identity that
   * the latest truth no longer contains. A demolition removes a `placed-*` body, and a
   * snapshot arriving afterwards must find every surface pointing at it ALREADY neutral
   * — the panel, the canvas ring, the draft carrying it, and the confirm naming it.
   *
   * `confirmDemolish` clears the selection at the moment it dispatches; this is the
   * second line of defence, for every OTHER way a placement can leave (a load, a
   * session recovery, an undo of the whole studio) where nothing local was ever told.
   */
  useEffect(() => {
    const placements = placementView?.placements ?? null
    if (placements === null) return
    const stale = (id: number | null): boolean =>
      id !== null && placedFacilityById(placements, id) === null
    const selectedPlacementId =
      buildingInspectorId === null ? null : placedFacilityIdOf(buildingInspectorId)
    if (stale(selectedPlacementId)) {
      setBuildingInspectorId(null)
      recordSelection(null)
      viewRef.current?.clearHollywoodPlaceSelection?.()
    }
    if (stale(buildDraftRef.current?.movingPlacementId ?? null)) cancelBuild()
    if (stale(demolishIntentRef.current)) {
      demolishIntentRef.current = null
      setDemolishIntent(null)
      setDemolishError(null)
    }
  }, [buildingInspectorId, cancelBuild, placementView, recordSelection])

  /**
   * World Inspector Default V1 — the in-world landing every physical place now has.
   *
   * Every richer world context (review interventions, retained Commission/Audition
   * workspaces, Gate, Publicity, Annex, Scenery, Stage 7 production) is tried first and
   * takes precedence exactly as before. When none of them applies, this takes semantic
   * ownership of the place and opens its inspector panel in the established right-rail
   * pattern — instead of the old `dispatchRoute` that threw the player out of the world.
   * The deep screen remains reachable, but only from the panel's explicit secondary action.
   */
  const enterBuildingInspectorContext = useCallback((id: BuildingId): boolean => {
    // The tycoon grid world only. The retained painted plate is a rollback path that M1
    // deliberately left untouched (and the browser suite is pinned to it), and the legacy
    // pre-Hollywood lot has no in-world panel to land — both keep their old route.
    if (!tycoon || worldInputSuspendedRef.current) return false
    clearFormationContext()
    clearHollywoodStage7DetailContext()
    clearGateContext()
    clearPublicityContext()
    clearHollywoodSceneryLoadInContext()
    clearAnnexContext()
    // A building selection releases any open parcel panel and its ground outline, so
    // the world never paints two owners of the player's attention at once.
    clearParcelContext()
    setSelectionInfo(null)
    setHollywoodPerson(null)
    setHollywoodPlace(null)
    pendingHollywoodFocusProductionId.current = null
    viewRef.current?.clearHollywoodPersonSelection?.()
    // `recordSelection` releases any previous inspector ownership, so the new id is
    // claimed immediately after it — the same order every other context uses.
    recordSelection(id)
    setBuildingInspectorId(id)
    // Canvas intent and semantic navigation must name the same owner (shift law 10):
    // a companion activation asks the renderer for the ring the canvas already paints.
    viewRef.current?.select(id)
    const nonce = ++buildingInspectorFocusNonceRef.current
    queueMicrotask(() => {
      if (
        buildingInspectorFocusNonceRef.current !== nonce ||
        worldInputSuspendedRef.current
      ) return
      buildingInspectorHeadingRef.current?.focus({ preventScroll: true })
    })
    return true
  }, [
    clearAnnexContext,
    clearFormationContext,
    clearGateContext,
    clearHollywoodSceneryLoadInContext,
    clearHollywoodStage7DetailContext,
    clearParcelContext,
    clearPublicityContext,
    recordSelection,
    tycoon,
  ])

  // Companion-nav activation: select the building AND land its in-world context.
  const activate = useCallback(
    (id: BuildingId) => {
      if (worldInputSuspendedRef.current) return
      yieldNextEventOrientation()
      if (id === 'writers' && enterCurrentScriptReview() !== null) return
      if (id === 'casting' && enterCurrentCastingReview() !== null) return
      if (id === 'casting' && keepInvalidCurrentCastingReviewNeutral()) return
      if (id === 'casting' && openCurrentAuditionPlanning()) return
      if (hollywood && id === 'admin') {
        if (enterPublicityContext({
          place: null,
          paintHollywoodOutline: true,
          focus: 'first-action',
        })) return
        clearPublicityContext()
        // No campaign is offered this week: that is a fact about Administration, not a
        // reason to abandon the selection or leave the world.
        if (enterBuildingInspectorContext(id)) return
        recordSelection(null)
        return
      }
      if (hollywood && id === 'gate') {
        if (enterGateContext({
          place: null,
          paintHollywoodOutline: true,
          candidate: null,
          focus: 'gate',
        })) return
        clearGateContext()
        if (enterBuildingInspectorContext(id)) return
        recordSelection(null)
        studioHeadingRef.current?.focus({ preventScroll: true })
        return
      }
      if (id === 'expansion') {
        if (enterAnnexContext({
          place: null,
          paintHollywoodOutline: hollywood,
          focus: 'default',
        })) {
          return
        }
        clearAnnexContext()
        if (enterBuildingInspectorContext(id)) return
        recordSelection(null)
        return
      }
      if (hollywood && id === 'stage-a') {
        const operation = stage7ProductionDetailContext(
          latestSnapshotRef.current,
        )?.operation
        if (
          operation &&
          enterHollywoodProductionContext(operation.productionId, {
            stage7Only: true,
            detailEligible: true,
            focus: 'primary',
          })
        ) {
          recordSelection(id)
          return
        }
      }
      // WORLD-FIRST LAW: a physical place never navigates by itself. In the grid world
      // the click lands the in-world inspector; the retained plate and the pre-Hollywood
      // legacy lot keep the old compatibility route (see enterBuildingInspectorContext).
      if (enterBuildingInspectorContext(id)) return
      clearFormationContext()
      clearHollywoodStage7DetailContext()
      clearGateContext()
      clearPublicityContext()
      clearHollywoodSceneryLoadInContext()
      clearAnnexContext()
      recordSelection(id)
      viewRef.current?.select(id)
      dispatchRoute(buildingActionFor(id))
    },
    [
      clearAnnexContext,
      clearFormationContext,
      clearGateContext,
      clearHollywoodSceneryLoadInContext,
      clearHollywoodStage7DetailContext,
      clearPublicityContext,
      dispatchRoute,
      enterAnnexContext,
      enterBuildingInspectorContext,
      enterCurrentCastingReview,
      enterCurrentScriptReview,
      enterHollywoodProductionContext,
      enterGateContext,
      enterPublicityContext,
      hollywood,
      keepInvalidCurrentCastingReviewNeutral,
      openCurrentAuditionPlanning,
      recordSelection,
      yieldNextEventOrientation,
    ],
  )

  // The world renderer routes every physical activation through the same handler the
  // companion list uses. Kept in a ref because the renderer is constructed once.
  useEffect(() => {
    activateRef.current = activate
  }, [activate])

  /**
   * Take the picture's ONE imperative next step.
   *
   * Guidance is a SUGGESTION that points at the world, never a shortcut around it: the
   * step resolves to a physical building and then does exactly what clicking that
   * building does — `activate` selects it and lands its in-world context — plus a camera
   * PAN to frame it. Never a zoom (one camera grammar: a selection pans), never a jump
   * (`focusHollywoodPlace` glides and no-ops when the place is already comfortably in
   * frame), and never a full-screen management screen.
   */
  const takePictureGuidanceStep = useCallback((next: FirstFilmJourneyNext) => {
    if (worldInputSuspendedRef.current) return
    const target = journeyTargetBuildingId(next.site, latestSnapshotRef.current)
    // An unaddressable step is a real answer, not a fallback to some other building.
    if (target === null) return
    activate(target)
    viewRef.current?.focusHollywoodPlace?.(PLACE_BY_BUILDING[target].placeId)
  }, [activate])

  /**
   * Take one of a building inspector's engine-published verbs (M-B).
   *
   * NO NEW OPENING PATH EXISTS HERE. Each verb takes an entry this host already owned,
   * so the button can only ever be a shorter name for something the player could already
   * have reached — never a second way in with its own rules:
   *
   *   • commission     → the SAME `assemble-film` intent the deep ghost dispatches. The
   *     App's retained-commissioning interception owns what that becomes; the inspector
   *     only offers it when the board publishes the exact legality that interception
   *     requires, so the verb lands the in-world workspace rather than a full screen.
   *   • plan-auditions → the retained in-world planner, opened as ITSELF: this button is a
   *     first-class origin and proves its own connectedness, uniqueness, owning panel and
   *     live attention/reason. Only if that refuses does it try the companion rail's
   *     equally-strict proof, and only if BOTH refuse does it fall back to the
   *     ALREADY-EXISTING deep Casting path — so the retained path wins whenever the
   *     planner context accepts, and the button is never dead.
   *   • open-package   → the deep Casting path. The retained Package workspace is opened
   *     ONLY by the casting-review handoff today, so there is no in-world package entry to
   *     reuse; naming the verb here is honest, inventing a second opener would not be.
   */
  const takeBuildingInspectorPrimaryAction = useCallback(
    (action: LotBuildingInspectorPrimaryAction) => {
      if (worldInputSuspendedRef.current) return
      switch (action.kind) {
        case 'commission':
          // C2a-M4 / F4: the verb's own route (see `navigation.ts`).
          dispatchCommissionRoute()
          return
        case 'plan-auditions':
          if (openCurrentAuditionPlanning('inspector')) return
          if (openCurrentAuditionPlanning('companion')) return
          dispatchRoute(BUILDING_ACTION.casting)
          return
        case 'open-package':
          dispatchRoute(BUILDING_ACTION.casting)
          return
        // C1-M3b. Both verbs stay INSIDE the world: one picks the building up, the
        // other opens a confirm beside it. Neither navigates anywhere.
        case 'move': {
          const placementId = placedFacilityIdOf(buildingInspectorIdRef.current ?? '')
          if (placementId !== null) beginFacilityMove(placementId)
          return
        }
        case 'demolish': {
          const placementId = placedFacilityIdOf(buildingInspectorIdRef.current ?? '')
          if (placementId !== null) openDemolishConfirm(placementId)
          return
        }
      }
    },
    [
      beginFacilityMove,
      dispatchCommissionRoute,
      dispatchRoute,
      openCurrentAuditionPlanning,
      openDemolishConfirm,
    ],
  )

  /**
   * Companion/canvas parity for a parcel. The DOM list and the world hit area both call
   * exactly this, so the two surfaces can never route the same ground to different
   * owners (shift law 10) — the same contract `activate` holds for buildings.
   */
  const activateParcel = useCallback((parcelId: string) => {
    if (worldInputSuspendedRef.current) return
    yieldNextEventOrientation()
    if (enterParcelInspectorContext(parcelId)) return
    clearParcelContext()
  }, [clearParcelContext, enterParcelInspectorContext, yieldNextEventOrientation])

  useEffect(() => {
    activateParcelRef.current = activateParcel
  }, [activateParcel])

  useEffect(() => {
    moveBuildOriginRef.current = moveBuildOrigin
  }, [moveBuildOrigin])

  // With the review signage mask on, the companion list must not print the answer the
  // canvas is being masked to hide. Only the stage NAME is neutralised — attention state
  // and the production reason stay, so the list still shows the lot in its real context.
  const maskNames = soundstageProof && signageMasked
  /** Drop the letter from any string that names a stage, while the review mask is on. */
  const maskStageText = (text: string): string =>
    maskNames
      ? text.replace(/\b(Sound)?[Ss]tage [AB]\b/g, (m) => (m.startsWith('Sound') ? 'Soundstage' : 'Stage'))
      : text
  const rows = FOUNDING_BUILDING_IDS.map((id) => {
    const b = snapshot.buildings.find((x) => x.id === id)
    const attention: AttentionState = b?.attention ?? 'normal'
    const meta = ATTENTION_META[attention]
    const stateText = b?.attentionReason ?? meta.word
    const isStage = id === 'stage-a' || id === 'stage-b'
    const label = maskNames && isStage ? 'Soundstage' : BUILDING_LABELS[id]
    return { id, label, attention, meta, stateText }
  })

  // ── World Inspector Default V1 — the in-world panel for an ordinary place click ──
  const buildingInspector =
    tycoon && buildingInspectorId !== null
      ? lotBuildingInspectorContext(
          snapshot,
          buildingInspectorId,
          inspectorCalendarView(state),
          annexView,
          inspectorScriptBoardView(state),
        )
      : null
  const buildingInspectorCommand =
    buildingInspector?.commandOperation?.currentCommand ?? null
  const buildingInspectorCommandProductionId =
    buildingInspector?.commandOperation?.productionId ?? null
  /**
   * The draft controls BOTH placement verbs share (C1-M3b): the origin pad, the quote,
   * the verdict and the two actions.
   *
   * Extracted rather than duplicated, because a build and a move are the same
   * machinery pointed at different questions — and a second copy of a keyboard origin
   * pad is a second place for its accessibility to rot. Only ONE draft exists at a
   * time, so only one of the two panels below ever renders this.
   *
   * Every testid is the one the build flow has always used: it is the same control.
   */
  const placementDraftControls =
    buildDraft === null || buildQuote === null ? null : (
      <>
        <div
          ref={buildOriginPadRef}
          className="lot-build-origin"
          role="group"
          tabIndex={-1}
          aria-label={`Placement origin — cell ${buildDraft.origin.gx}, ${buildDraft.origin.gy}. Use the arrow keys to move the footprint.`}
          data-testid="lot-build-origin"
          data-origin-gx={buildDraft.origin.gx}
          data-origin-gy={buildDraft.origin.gy}
          data-revision={buildDraft.revision}
          data-moving={buildDraft.movingPlacementId ?? undefined}
          onPointerDown={containWorldInput}
          onMouseDown={containWorldInput}
          onTouchStart={containWorldInput}
          onKeyDown={(event) => {
            // Escape leaves the bounded flow from the control the player is actually
            // holding, and leaves it BYTE-NEUTRAL: a draft was never simulation state
            // (C1-M3b). Stopped here so the canvas' own Escape cannot also fire.
            if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              cancelBuild()
              pendingBuildFocusRef.current =
                buildDraft.movingPlacementId === null ? 'parcel' : 'building'
              return
            }
            const step = BUILD_ORIGIN_KEY_STEPS[event.key]
            if (step === undefined) return
            event.preventDefault()
            event.stopPropagation()
            nudgeBuildOrigin(step.gx, step.gy)
          }}
        >
          <p className="lot-build-origin-label">
            Origin cell{' '}
            <strong data-testid="lot-build-origin-cell">
              {buildDraft.origin.gx}, {buildDraft.origin.gy}
            </strong>
          </p>
          <div className="lot-build-origin-pad">
            {BUILD_ORIGIN_NUDGES.map((nudge) => (
              <button
                key={nudge.testId}
                type="button"
                className="ghost lot-build-nudge"
                disabled={worldInputSuspended || buildPending}
                onPointerDown={containWorldInput}
                onMouseDown={containWorldInput}
                onTouchStart={containWorldInput}
                onClick={() => nudgeBuildOrigin(nudge.gx, nudge.gy)}
                data-testid={`lot-build-nudge-${nudge.testId}`}
              >
                {nudge.label}
              </button>
            ))}
          </div>
          <p className="hint lot-build-origin-hint">
            {buildDraft.movingPlacementId === null
              ? 'Point anywhere on the parcel in the lot, or use the arrow keys.'
              : 'Point anywhere on the lot, or use the arrow keys.'}
          </p>
        </div>

        <dl className="hollywood-annex-facts" data-testid="lot-build-quote">
          {quoteFacts(buildQuote, buildDraft.movingPlacementId !== null).map((fact) => (
            <div key={fact.key} data-fact-key={fact.key}>
              <dt>{fact.term}</dt>
              <dd>{fact.detail}</dd>
            </div>
          ))}
        </dl>

        <p
          className={buildQuote.ok ? 'hollywood-annex-help' : 'hollywood-annex-help is-blocked'}
          id="lot-build-verdict"
          data-testid="lot-build-verdict"
          data-ok={buildQuote.ok ? 'true' : 'false'}
        >
          {buildError ??
            buildRejectionText ??
            (buildDraft.movingPlacementId === null
              ? 'This site is clear. The studio can build here.'
              : 'This ground is clear. The building can stand here.')}
        </p>

        <div className="lot-build-actions">
          <button
            ref={buildCommitRef}
            type="button"
            className="primary lot-build-commit"
            aria-describedby="lot-build-verdict"
            disabled={
              worldInputSuspended ||
              buildPending ||
              !buildQuote.ok ||
              (buildDraft.movingPlacementId === null ? !onPlaceFacility : !onMoveFacility)
            }
            onPointerDown={containWorldInput}
            onMouseDown={containWorldInput}
            onTouchStart={containWorldInput}
            onClick={commitBuild}
            data-testid="lot-build-commit"
          >
            {buildPending
              ? 'Committing…'
              : buildDraft.movingPlacementId === null
                ? `Build ${buildBlueprint?.name ?? ''} · ${moneyExact(buildQuote.cost)}`
                : 'Move it here'}
          </button>
          <button
            type="button"
            className="ghost lot-build-cancel"
            disabled={worldInputSuspended || buildPending}
            onPointerDown={containWorldInput}
            onMouseDown={containWorldInput}
            onTouchStart={containWorldInput}
            onClick={cancelBuild}
            data-testid="lot-build-cancel"
          >
            Cancel
          </button>
        </div>
      </>
    )

  const buildingInspectorContents = buildingInspector === null
    ? null
    : (
        <div
          className="hollywood-building-inspector"
          role="region"
          aria-label={`${maskStageText(buildingInspector.label)} — in the lot`}
          data-testid={`lot-building-inspector-${buildingInspector.buildingId}`}
          data-attention={buildingInspector.attention}
        >
          <p className="hollywood-eyebrow">
            IN THE LOT · {maskStageText(buildingInspector.label).toUpperCase()}
          </p>
          <h3
            ref={buildingInspectorHeadingRef}
            tabIndex={-1}
            data-testid="lot-building-inspector-heading"
          >
            {maskStageText(buildingInspector.label)}
          </h3>
          <p className="hollywood-building-inspector-role">{buildingInspector.role}</p>
          <p data-testid="lot-building-inspector-status">
            {maskStageText(buildingInspector.status)}
          </p>
          {buildingInspector.attentionNote !== null &&
            buildingInspector.attentionNote !==
              ATTENTION_META[buildingInspector.attention].word && (
            <p className="hollywood-consequence" data-testid="lot-building-inspector-attention">
              <b>{ATTENTION_META[buildingInspector.attention].icon}</b>
              <span>
                <strong>{ATTENTION_META[buildingInspector.attention].word}</strong>
                {maskStageText(buildingInspector.attentionNote)}
              </span>
            </p>
          )}
          {/* WHO IS HERE — people before paperwork. */}
          {buildingInspector.occupantFacts.length > 0 && (
            <dl
              className="hollywood-person-facts"
              data-testid="lot-building-inspector-occupants"
            >
              {buildingInspector.occupantFacts.map((fact) => (
                <div key={fact.key} data-fact-key={fact.key}>
                  <dt>{maskStageText(fact.term)}</dt>
                  <dd>{maskStageText(fact.detail)}</dd>
                </div>
              ))}
            </dl>
          )}
          {/* WHAT CAN I DO HERE RIGHT NOW — the engine's own verbs, before the detail. */}
          {buildingInspectorCommand !== null &&
            buildingInspectorCommandProductionId !== null &&
            onProductionCommand !== undefined && (
            <button
              type="button"
              className="accent hollywood-command"
              disabled={worldInputSuspended}
              data-testid={`lot-building-inspector-command-${buildingInspectorCommand.kind}`}
              onClick={() => dispatchHollywoodProductionCommand(
                buildingInspectorCommandProductionId,
                buildingInspectorCommand,
              )}
            >
              {buildingInspectorCommand.label}
            </button>
          )}
          {buildingInspector.primaryActions.map((action) => (
            <Fragment key={action.kind}>
              <button
                // The audition verb is a first-class retained-planner opener, so the host
                // holds the exact element it rendered and then proves it against the
                // document — the same discipline the companion rail row already uses.
                ref={action.kind === 'plan-auditions'
                  ? (node) => { auditionPlanningVerbRef.current = node }
                  : undefined}
                type="button"
                className="accent hollywood-command hollywood-building-inspector-primary"
                disabled={worldInputSuspended || action.disabled === true}
                // C1-M3b: a verb the engine currently refuses is SHOWN and disabled, and
                // its reason is bound to it — so a screen reader hears the refusal with
                // the control, not as a loose sentence somewhere below it.
                aria-describedby={
                  action.reason === undefined
                    ? undefined
                    : `lot-building-inspector-reason-${action.kind}`
                }
                onPointerDown={containWorldInput}
                onMouseDown={containWorldInput}
                onTouchStart={containWorldInput}
                data-testid={`lot-building-inspector-primary-${action.kind}`}
                aria-label={action.label}
                onClick={() => takeBuildingInspectorPrimaryAction(action)}
              >
                {action.label}
              </button>
              {action.reason !== undefined && (
                <p
                  className="hollywood-annex-help is-blocked"
                  id={`lot-building-inspector-reason-${action.kind}`}
                  data-testid={`lot-building-inspector-reason-${action.kind}`}
                >
                  {maskStageText(action.reason)}
                </p>
              )}
            </Fragment>
          ))}
          {/* THE IN-WORLD CONFIRM (C1-M3b). Anchored to the building it names, never a
              browser dialog: a destructive verb must be answered where the thing being
              destroyed is standing. It commits nothing by existing. */}
          {demolishIntent !== null && demolishFacility !== null && (
            <section
              className="lot-build-flow lot-demolish-confirm"
              aria-labelledby="lot-demolish-confirm-heading"
              data-testid="lot-demolish-confirm"
              data-placement-id={demolishIntent}
            >
              <h4 id="lot-demolish-confirm-heading" data-testid="lot-demolish-confirm-heading">
                {demolishConfirmText(
                  demolishFacility.name,
                  demolishFacility.mutation?.demolitionRefund ?? 0,
                  // C1-M8: an unfinished site is named for what it is, and the
                  // weeks the studio is abandoning are named with it.
                  demolitionSubjectOf(demolishFacility),
                )}
              </h4>
              <p
                className={demolishError === null ? 'hollywood-annex-help' : 'hollywood-annex-help is-blocked'}
                id="lot-demolish-verdict"
                data-testid="lot-demolish-verdict"
                data-ok={demolishError === null ? 'true' : 'false'}
              >
                {demolishError ??
                  'The ground returns to open, buildable land. This cannot be undone.'}
              </p>
              <div className="lot-build-actions">
                <button
                  ref={demolishConfirmRef}
                  type="button"
                  className="primary lot-demolish-accept"
                  aria-describedby="lot-demolish-verdict"
                  disabled={worldInputSuspended || demolishPending || !onDemolishFacility}
                  onPointerDown={containWorldInput}
                  onMouseDown={containWorldInput}
                  onTouchStart={containWorldInput}
                  onClick={confirmDemolish}
                  data-testid="lot-demolish-confirm-accept"
                >
                  {demolishPending ? 'Demolishing…' : 'Demolish it'}
                </button>
                <button
                  type="button"
                  className="ghost lot-build-cancel"
                  disabled={worldInputSuspended || demolishPending}
                  onPointerDown={containWorldInput}
                  onMouseDown={containWorldInput}
                  onTouchStart={containWorldInput}
                  onClick={cancelDemolish}
                  data-testid="lot-demolish-confirm-cancel"
                >
                  Keep it
                </button>
              </div>
            </section>
          )}
          {/* THE MOVE FLOW (C1-M3b) — the build ghost's own machinery, re-entered with
              this building carried. The body is still standing; nothing has moved yet. */}
          {movingFacility !== null && buildDraft !== null && buildQuote !== null && (
            <section
              className="lot-build-flow lot-move-flow"
              aria-labelledby="lot-move-flow-heading"
              data-testid="lot-move-flow"
              data-placement-id={movingFacility.id}
            >
              <h4 id="lot-move-flow-heading" data-testid="lot-move-flow-heading">
                {moveFlowHeading(movingFacility.name)}
              </h4>
              {placementDraftControls}
            </section>
          )}
          {buildReceipt !== null && buildDraft === null && demolishIntent === null && (
            <p className="lot-build-receipt" data-testid="lot-building-receipt">
              <b>✓</b>
              <span>{buildReceipt}</span>
            </p>
          )}
          {/* …and when a verb this place would offer is withheld, the panel says why,
              in the same slot the button would have occupied. A silently missing control
              is the seam this campaign exists to close. */}
          {buildingInspector.primaryActionNote !== null && (
            <p
              className="hint hollywood-building-inspector-note"
              data-testid="lot-building-inspector-primary-note"
            >
              {maskStageText(buildingInspector.primaryActionNote)}
            </p>
          )}
          {/* HOW MUCH ROOM IS LEFT — capacity, slots and commitments read as detail. */}
          {buildingInspector.facts.length > 0 && (
            <dl className="hollywood-person-facts" data-testid="lot-building-inspector-facts">
              {buildingInspector.facts.map((fact) => (
                <div key={fact.key} data-fact-key={fact.key}>
                  <dt>{maskStageText(fact.term)}</dt>
                  <dd>{maskStageText(fact.detail)}</dd>
                </div>
              ))}
            </dl>
          )}
          <button
            type="button"
            className="ghost hollywood-building-inspector-details"
            disabled={worldInputSuspended}
            data-testid={`lot-building-inspector-open-details-${buildingInspector.buildingId}`}
            onClick={() => {
              if (worldInputSuspendedRef.current) return
              // The ONLY way a building reaches a deep screen now: an explicit choice.
              dispatchRoute(buildingActionFor(buildingInspector.buildingId))
            }}
          >
            Open {buildingInspector.deepLabel} details
          </button>
        </div>
      )

  // ── Build Mode V1 — the parcel panel and the bounded placement flow ────────
  /**
   * The parcels the companion list names. Buildable ground only, and never the legacy
   * `expansion` parcel: that ground is the Annex place, which already has its own row
   * and its own richer context — one destination, one control (shift law 10).
   */
  const companionParcels =
    tycoon && placementView !== null
      ? placementView.parcels.filter(
          (parcel) => parcel.terrain === 'buildable' && parcel.id !== 'expansion',
        )
      : []
  const parcelInspector: LotParcelInspectorContext | null =
    tycoon && parcelInspectorId !== null
      ? lotParcelInspectorContext(placementView, parcelInspectorId)
      : null
  // C1-M5: the catalog is a LIST the player browses, so its states are projected once,
  // purely, in the engine's own binding order — never re-derived per row in the JSX.
  const buildCatalog = lotBuildCatalog(placementView)
  const parcelInspectorContents = parcelInspector === null
    ? null
    : (
        <div
          className="hollywood-building-inspector lot-parcel-inspector"
          role="region"
          aria-label={`${parcelInspector.label} — open ground on the lot`}
          data-testid={`lot-parcel-inspector-${parcelInspector.parcelId}`}
          data-parcel-status={parcelInspector.status}
        >
          <div
            className="visually-hidden"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-testid="lot-build-announcement"
          >
            {(buildReceipt ?? buildError) !== null && (
              <span key={buildAnnouncementSerial}>{buildReceipt ?? buildError}</span>
            )}
          </div>
          <p className="hollywood-eyebrow">
            OPEN GROUND · {parcelInspector.label.toUpperCase()} · WEEK{' '}
            {placementView?.currentWeek ?? snapshot.week}
          </p>
          <h3
            ref={parcelInspectorHeadingRef}
            tabIndex={-1}
            data-testid="lot-parcel-inspector-heading"
          >
            {parcelInspector.label}
          </h3>
          <p className="hollywood-building-inspector-role">{parcelInspector.role}</p>
          <p data-testid="lot-parcel-inspector-status">{parcelInspector.statusLine}</p>
          <dl className="hollywood-person-facts" data-testid="lot-parcel-inspector-facts">
            {parcelInspector.facts.map((fact) => (
              <div key={fact.key} data-fact-key={fact.key}>
                <dt>{fact.term}</dt>
                <dd>{fact.detail}</dd>
              </div>
            ))}
          </dl>

          {buildReceipt !== null && buildDraft === null && (
            <p className="lot-build-receipt" data-testid="lot-build-receipt">
              <b>✓</b>
              <span>{buildReceipt}</span>
            </p>
          )}

          {!buildFlowOpen && (
            parcelInspector.canBuild ? (
              <button
                type="button"
                className="primary lot-build-open"
                disabled={worldInputSuspended || !onPlaceFacility}
                onPointerDown={containWorldInput}
                onMouseDown={containWorldInput}
                onTouchStart={containWorldInput}
                onClick={openBuildCatalog}
                data-testid={`lot-parcel-build-${parcelInspector.parcelId}`}
              >
                Build here
              </button>
            ) : (
              <p
                className="hollywood-annex-help is-blocked"
                data-testid="lot-parcel-build-blocked"
              >
                {parcelInspector.buildBlockedReason ?? 'Nothing may be built on this parcel.'}
              </p>
            )
          )}

          {buildFlowOpen && (
            <section
              className="lot-build-flow"
              aria-labelledby="lot-build-catalog-heading"
              data-testid="lot-build-flow"
            >
              <h4 id="lot-build-catalog-heading" data-testid="lot-build-catalog-heading">
                Studio catalog
              </h4>
              <ul className="lot-build-catalog" data-testid="lot-build-catalog">
                {buildCatalog.map((entry) => {
                  const chosen = buildDraft?.blueprintId === entry.blueprintId
                  return (
                    <li key={entry.blueprintId}>
                      <button
                        type="button"
                        className={`lot-build-catalog-item${chosen ? ' is-selected' : ''}${
                          entry.selectable ? '' : ' is-blocked'
                        }`}
                        aria-pressed={chosen}
                        // A locked or spent entry is READABLE — browsing the whole
                        // catalog is the point — but it is never a way in (C1-M5).
                        disabled={worldInputSuspended || buildPending || !entry.selectable}
                        aria-describedby={
                          entry.selectable ? undefined : `lot-build-blocked-${entry.blueprintId}`
                        }
                        onPointerDown={containWorldInput}
                        onMouseDown={containWorldInput}
                        onTouchStart={containWorldInput}
                        onClick={() => beginBuild(entry.blueprintId)}
                        data-testid={`lot-build-blueprint-${entry.blueprintId}`}
                        data-state={entry.state}
                        data-owned={entry.owned.operational}
                        data-building={entry.owned.underConstruction}
                      >
                        <span className="lot-build-catalog-head">
                          <span className="lot-build-catalog-name">{entry.name}</span>
                          <span
                            className={`lot-build-catalog-state is-${entry.state}`}
                            data-testid={`lot-build-state-${entry.blueprintId}`}
                          >
                            {entry.stateLabel}
                          </span>
                        </span>
                        {/* WHAT IT DOES, in the engine's own words. The reason a
                            player can compare these at all. */}
                        <span
                          className="lot-build-catalog-effect"
                          data-testid={`lot-build-effect-${entry.blueprintId}`}
                        >
                          {entry.effectSummary}
                        </span>
                        {/* …and, when a higher tier is already standing, what that
                            sentence is actually worth this week (C1-M8). */}
                        {entry.supersededNote !== null && (
                          <span
                            className="lot-build-catalog-superseded"
                            data-testid={`lot-build-superseded-${entry.blueprintId}`}
                          >
                            {entry.supersededNote}
                          </span>
                        )}
                        {/* C2a-M2: the capacity is named by CAPABILITY, in the words
                            the entry's own effect sentence uses. "+1 shared slot" was
                            already loose and became untrue for a Soundstage, which
                            carries a picture rather than sharing a slot. */}
                        <span className="lot-build-catalog-facts">
                          {moneyExact(entry.cost)} · {entry.buildWeeks} weeks ·{' '}
                          {entry.footprint.width}×{entry.footprint.depth} cells
                          {entry.capacityLabel === null ? '' : ` · ${entry.capacityLabel}`}
                        </span>
                        <span className="lot-build-catalog-opex">
                          {moneyExact(entry.weeklyOperatingCost)} a week to run once open
                          {entry.ownedLabel === null ? '' : ` · ${entry.ownedLabel}`}
                        </span>
                      </button>
                      {/* WHY NOT — every sentence the engine wrote, verbatim, styled
                          by whether the studio can work toward it at all. */}
                      {!entry.selectable && (
                        <div
                          className="lot-build-catalog-blocked"
                          id={`lot-build-blocked-${entry.blueprintId}`}
                          data-testid={`lot-build-blocked-${entry.blueprintId}`}
                        >
                          {entry.lockReasons.map((lock, index) => (
                            <p
                              key={`${entry.blueprintId}:${String(index)}`}
                              className={
                                lock.notYetAttainable
                                  ? 'hint lot-build-lock is-distant'
                                  : 'hollywood-annex-help is-blocked lot-build-lock'
                              }
                              data-not-yet-attainable={lock.notYetAttainable ? 'true' : 'false'}
                            >
                              {lock.reason}
                            </p>
                          ))}
                          {entry.limitReason !== null && (
                            <p className="hint lot-build-lock is-built">{entry.limitReason}</p>
                          )}
                          {entry.affordabilityReason !== null && (
                            <p className="hollywood-annex-help is-blocked lot-build-lock">
                              {entry.affordabilityReason}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              {buildDraft !== null && buildQuote !== null && buildDraft.movingPlacementId === null && (
                <>{placementDraftControls}</>
              )}
            </section>
          )}
        </div>
      )

  const gateContextContents = !gateSelected
    ? null
    : currentGateMarket === null
      ? (
          <div
            role="region"
            aria-label="Studio Gate unavailable"
            data-testid="hollywood-gate-context-unavailable"
          >
            <p className="hollywood-eyebrow">STUDIO GATE</p>
            <h3 ref={gateHeadingRef} tabIndex={-1}>Studio Gate</h3>
            <p>Current Gate visitor details are unavailable. No candidate was selected.</p>
          </div>
        )
      : (
          <>
            <p className="hollywood-eyebrow">STUDIO GATE · WEEK {currentGateMarket.marketWeek}</p>
            <div className="hollywood-gate-heading">
              <h3
                ref={gateHeadingRef}
                tabIndex={-1}
                data-testid="hollywood-gate-heading"
              >
                Studio Gate
              </h3>
              <span className="hollywood-gate-tag">
                {currentGateMarket.candidates.length} CURRENT
              </span>
            </div>
            <p
              className="hollywood-gate-physical-status"
              data-testid="hollywood-gate-physical-status"
            >
              {gatePhysicalAvailability === 'available'
                ? 'Selected in the living lot at the Studio Gate.'
                : gatePhysicalAvailability === 'pending'
                  ? 'The physical Gate is still preparing. Complete visitor controls remain available here.'
                  : 'The physical Gate is unavailable in this renderer. Complete visitor controls remain available here.'}
            </p>
            {currentGateMarket.candidates.length === 0 ? (
              <p className="hollywood-gate-empty" data-testid="hollywood-gate-empty">
                No candidates with current contract terms
              </p>
            ) : (
              <div
                className="hollywood-gate-candidates"
                role="group"
                aria-label={`${currentGateMarket.candidates.length} candidates with current contract terms`}
                data-testid="hollywood-gate-candidates"
              >
                {currentGateMarket.candidates.map((candidate) => {
                  const selectedCandidate = selectedGateCandidateContext?.candidate.talentId ===
                    candidate.talentId
                  return (
                    <button
                      key={candidate.talentId}
                      type="button"
                      className={selectedCandidate ? 'is-selected' : ''}
                      aria-pressed={selectedCandidate}
                      aria-label={`${candidate.name} · ${gateRoleLabel(candidate.creativeRole)}`}
                      disabled={worldInputSuspended}
                      onPointerDown={(event) => {
                        containWorldInput(event)
                        gateCandidateSuppressClickRef.current = null
                      }}
                      onMouseDown={(event) => {
                        containWorldInput(event)
                        gateCandidateSuppressClickRef.current = null
                      }}
                      onTouchStart={(event) => {
                        containWorldInput(event)
                        gateCandidateSuppressClickRef.current = null
                      }}
                      onKeyDown={(event) => guardGateCandidateSelectionKeyDown(
                        event,
                        candidate.talentId,
                      )}
                      onKeyUp={releaseGateCandidateSelectionKey}
                      onClick={(event) => {
                        clickGateCandidateSelection(candidate.talentId, event.detail)
                      }}
                      data-testid={`hollywood-gate-select-${candidate.talentId}`}
                    >
                      <span>{candidate.name}</span>
                      <small>{gateRoleLabel(candidate.creativeRole)}</small>
                    </button>
                  )
                })}
              </div>
            )}
            {selectedGateCandidateContext !== null && (
              <section
                className="hollywood-gate-visitor"
                aria-labelledby="hollywood-gate-visitor-heading"
                data-testid="hollywood-gate-visitor"
              >
                <p className="hollywood-eyebrow">SELECTED GATE VISITOR</p>
                <h4
                  id="hollywood-gate-visitor-heading"
                  ref={gateVisitorHeadingRef}
                  tabIndex={-1}
                  data-testid="hollywood-gate-visitor-heading"
                >
                  {selectedGateCandidateContext.candidate.name}
                </h4>
                <dl className="hollywood-gate-visitor-facts">
                  <div>
                    <dt>Profession</dt>
                    <dd>{gateRoleLabel(selectedGateCandidateContext.candidate.creativeRole)}</dd>
                  </div>
                  <div><dt>Availability</dt><dd>Free agent</dd></div>
                  <div>
                    <dt>Current terms</dt>
                    <dd>
                      {selectedGateCandidateContext.candidate.offerTermWeeks.length}{' '}
                      {selectedGateCandidateContext.candidate.offerTermWeeks.length === 1 ? 'term' : 'terms'} ·{' '}
                      {selectedGateCandidateContext.candidate.offerTermWeeks
                        .map((term) => `${term} weeks`)
                        .join(' · ')}
                    </dd>
                  </div>
                </dl>
                <div className="hollywood-gate-actions">
                  <button
                    ref={gateProfileButtonRef}
                    type="button"
                    className="accent"
                    disabled={worldInputSuspended || !onOpenGateCandidateProfile}
                    onPointerDown={(event) => latchGateCandidateAction(
                      event,
                      'profile',
                      selectedGateCandidateContext,
                    )}
                    onMouseDown={(event) => latchGateCandidateAction(
                      event,
                      'profile',
                      selectedGateCandidateContext,
                    )}
                    onTouchStart={(event) => latchGateCandidateAction(
                      event,
                      'profile',
                      selectedGateCandidateContext,
                    )}
                    onPointerCancel={(event) => {
                      containWorldInput(event)
                      cancelGateCandidateGesture()
                    }}
                    onKeyDown={(event) => guardGateCandidateActionKeyDown(
                      event,
                      'profile',
                      selectedGateCandidateContext,
                    )}
                    onKeyUp={releaseGateCandidateActionKey}
                    onClick={(event) => clickGateCandidateAction(
                      'profile',
                      selectedGateCandidateContext,
                      event.detail,
                    )}
                    data-testid={`hollywood-gate-open-profile-${selectedGateCandidateContext.candidate.talentId}`}
                  >
                    Open talent profile
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    disabled={worldInputSuspended || !onOpenGateCandidateHiring}
                    onPointerDown={(event) => latchGateCandidateAction(
                      event,
                      'hiring',
                      selectedGateCandidateContext,
                    )}
                    onMouseDown={(event) => latchGateCandidateAction(
                      event,
                      'hiring',
                      selectedGateCandidateContext,
                    )}
                    onTouchStart={(event) => latchGateCandidateAction(
                      event,
                      'hiring',
                      selectedGateCandidateContext,
                    )}
                    onPointerCancel={(event) => {
                      containWorldInput(event)
                      cancelGateCandidateGesture()
                    }}
                    onKeyDown={(event) => guardGateCandidateActionKeyDown(
                      event,
                      'hiring',
                      selectedGateCandidateContext,
                    )}
                    onKeyUp={releaseGateCandidateActionKey}
                    onClick={(event) => clickGateCandidateAction(
                      'hiring',
                      selectedGateCandidateContext,
                      event.detail,
                    )}
                    data-testid={`hollywood-gate-open-hiring-${selectedGateCandidateContext.candidate.talentId}`}
                  >
                    Open Hiring terms · {selectedGateCandidateContext.candidate.name}
                  </button>
                </div>
              </section>
            )}
          </>
        )

  const publicityContextContents = !publicitySelected
    ? null
    : currentPublicityCampaign === null
      ? (
          <div
            ref={publicityStatusRef}
            tabIndex={-1}
            role="region"
            aria-label="Publicity campaign unavailable"
            data-testid="hollywood-publicity-context-unavailable"
          >
            <h3 ref={publicityHeadingRef} tabIndex={-1}>Administration &amp; Publicity</h3>
            <p>Current campaign offers are unavailable. No publicity action was sent.</p>
          </div>
        )
      : (
          <>
            <p className="hollywood-eyebrow">SELECTED OFFICE · WEEK {snapshot.week}</p>
            <div className="hollywood-publicity-heading">
              <h3
                id="hollywood-publicity-heading"
                ref={publicityHeadingRef}
                tabIndex={-1}
              >
                Administration &amp; Publicity
              </h3>
              <span className="hollywood-publicity-tag">
                {currentPublicityCampaign.availableCount} OF 3 AVAILABLE
              </span>
            </div>
            <div
              ref={publicityStatusRef}
              tabIndex={-1}
              className="hollywood-publicity-status"
              role="region"
              aria-labelledby="hollywood-publicity-heading"
              data-testid="hollywood-publicity-status"
            >
              <strong>
                Audience Awareness {snapshot.standingValues.awareness.toFixed(2)}
              </strong>
              <p data-testid="hollywood-publicity-physical-status">
                {publicityPhysicalAvailability === 'available'
                  ? 'Selected in the living lot at Administration & Publicity.'
                  : publicityPhysicalAvailability === 'pending'
                    ? 'The physical office is still preparing. Complete campaign controls remain available here.'
                    : 'The physical office is unavailable in this renderer. Complete campaign controls remain available here.'}
              </p>
            </div>
            <div
              className="hollywood-publicity-offers"
              aria-label="Current publicity campaign offers"
              data-testid="hollywood-publicity-offers"
            >
              {currentPublicityCampaign.offers.map((offer) => {
                const label = publicityTierLabel(offer.tier)
                const statusId = `hollywood-publicity-${offer.tier}-status`
                return (
                  <article
                    key={offer.tier}
                    className={`hollywood-publicity-offer${offer.available ? ' is-available' : ' is-unavailable'}`}
                    data-testid={`hollywood-publicity-${offer.tier}`}
                  >
                    <div className="hollywood-publicity-offer-title">
                      <strong>{label}</strong>
                      <span>{moneyExact(offer.cost)}</span>
                    </div>
                    <dl>
                      <div><dt>Immediate lift</dt><dd>+{offer.expectedLift.toFixed(2)}</dd></div>
                      <div><dt>Price / point</dt><dd>{offer.pricePerPoint === null ? '—' : moneyWithCents(offer.pricePerPoint)}</dd></div>
                      <div><dt>Tier cooldown</dt><dd>{offer.cooldownWeeks} weeks</dd></div>
                      <div><dt>Shared cooldown</dt><dd>{offer.globalCooldownWeeks} weeks</dd></div>
                      <div><dt>Available week</dt><dd>{offer.availableWeek === null ? '—' : offer.availableWeek}</dd></div>
                    </dl>
                    <p
                      id={statusId}
                      className="hollywood-publicity-offer-status"
                      data-testid={`hollywood-publicity-${offer.tier}-offer-status`}
                    >
                      {publicityPending
                        ? 'A publicity campaign is processing. Wait for current studio truth.'
                        : worldInputSuspended
                          ? 'Close the open talent profile before acting in the Studio Lot.'
                        : offer.available && !onRunPublicity
                          ? `Engine offer available now in Week ${offer.availableWeek}; this host has no publicity action owner.`
                          : offer.available
                            ? `Available now in Week ${offer.availableWeek}.`
                            : offer.reason}
                    </p>
                    <button
                      ref={(node) => {
                        publicityButtonRefs.current[offer.tier] = node
                      }}
                      type="button"
                      className="hollywood-publicity-action"
                      aria-describedby={statusId}
                      disabled={
                        worldInputSuspended ||
                        publicityPending ||
                        !offer.available ||
                        !onRunPublicity
                      }
                      onPointerDown={containWorldInput}
                      onMouseDown={containWorldInput}
                      onTouchStart={containWorldInput}
                      onKeyDown={guardPublicityKeyDown}
                      onKeyUp={releasePublicityKey}
                      onClick={(event) => {
                        if (event.detail > 1) return
                        runHollywoodPublicity(offer)
                      }}
                      data-testid={`hollywood-publicity-run-${offer.tier}`}
                    >
                      {publicityPending ? 'Campaign processing…' : `Run ${label}`}
                    </button>
                  </article>
                )
              })}
            </div>
            <p className="hollywood-publicity-boundary">
              Immediate visibility only. These offers do not promise revenue, recovery, or a
              profitable business outcome.
            </p>
            <button
              type="button"
              className="ghost hollywood-publicity-dashboard"
              disabled={
                worldInputSuspended ||
                publicityPending ||
                !onOpenPublicityDashboard
              }
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
              onClick={onOpenPublicityDashboard}
              data-testid="hollywood-publicity-open-dashboard"
            >
              Open Dashboard details
            </button>
          </>
        )

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
        <p>{annexStatusDetail(annexView, currentAnnexWork)}</p>
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
          <section
            className={`hollywood-annex-work${currentAnnexWork ? ` is-${currentAnnexWork.state}` : ' is-unavailable'}`}
            aria-labelledby="lot-annex-current-work-heading"
            data-testid="lot-annex-current-work"
          >
            <h4
              ref={annexWorkHeadingRef}
              id="lot-annex-current-work-heading"
              tabIndex={-1}
              data-testid="lot-annex-current-work-heading"
            >
              Current work
            </h4>
            {currentAnnexWork === null ? (
              <p className="hollywood-annex-work-unavailable" data-testid="lot-annex-work-unavailable">
                Current Annex work is unavailable from this Studio Lot snapshot.
              </p>
            ) : currentAnnexWork.state === 'available' ? (
              <>
                <dl className="hollywood-annex-facts" data-testid="lot-annex-work-available">
                  <div><dt>Slot use</dt><dd>0 / 1</dd></div>
                  <div><dt>Status</dt><dd>Available</dd></div>
                </dl>
                <p className="hollywood-annex-work-note">
                  No current screenplay, casting session, or production occupies the Annex.
                </p>
              </>
            ) : (
              <>
                <dl className="hollywood-annex-facts" data-testid="lot-annex-work-occupied">
                  <div><dt>Slot use</dt><dd>1 / 1</dd></div>
                  <div><dt>Occupancy</dt><dd>Occupied</dd></div>
                  <div>
                    <dt>Work status</dt>
                    <dd>{currentAnnexWork.state === 'held' ? 'Production held' : 'Working'}</dd>
                  </div>
                  <div><dt>Owner kind</dt><dd>{annexOwnerKindLabel(currentAnnexWork.occupant.owner)}</dd></div>
                  <div><dt>Title</dt><dd>{currentAnnexWork.occupant.title}</dd></div>
                  <div><dt>Activity</dt><dd>{annexActivityLabel(currentAnnexWork.occupant.activity)}</dd></div>
                  {currentAnnexWork.occupant.statusLabel !== null && (
                    <div><dt>Production status</dt><dd>{currentAnnexWork.occupant.statusLabel}</dd></div>
                  )}
                </dl>
                {currentAnnexWork.state === 'held' && (
                  <p className="hollywood-annex-work-blocker" data-testid="lot-annex-work-blocker">
                    <strong>{currentAnnexWork.occupant.blocker.headline}</strong>
                    <span>{currentAnnexWork.occupant.blocker.detail}</span>
                  </p>
                )}
                <button
                  type="button"
                  className="accent hollywood-annex-work-open"
                  disabled={worldInputSuspended || !onOpenAnnexWorkDetails}
                  onPointerDown={(event) => {
                    containWorldInput(event)
                    annexWorkActivationRef.current = currentAnnexWork
                  }}
                  onMouseDown={(event) => {
                    containWorldInput(event)
                    annexWorkActivationRef.current = currentAnnexWork
                  }}
                  onTouchStart={(event) => {
                    containWorldInput(event)
                    annexWorkActivationRef.current = currentAnnexWork
                  }}
                  onKeyDown={(event) => guardAnnexWorkKeyDown(event, currentAnnexWork)}
                  onKeyUp={releaseAnnexWorkKey}
                  onClick={(event) => {
                    const rendered = annexWorkActivationRef.current ?? currentAnnexWork
                    annexWorkActivationRef.current = null
                    if (event.detail > 1) return
                    openAnnexWorkDetails(rendered)
                  }}
                  data-testid="lot-annex-open-work-details"
                >
                  Open {annexOwnerDestination(currentAnnexWork.occupant.owner)} · {currentAnnexWork.occupant.title}
                </button>
              </>
            )}
          </section>
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

  const exactNextEventReceipt = nextEventFeedback?.kind === 'next-event-exact'
    ? nextEventFeedback.receipt
    : null

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

  const pendingScriptReviewSelected =
    scriptReviewIntent !== null &&
    selectedScriptReviewContext !== null &&
    exactNextEventReceipt?.target.kind !== 'script'
  const screenplaySuccessSelected =
    selected === 'writers' &&
    visibleScriptReviewActivity?.feedback.kind === 'success' &&
    exactNextEventReceipt?.target.kind !== 'script'
  const screenplayCommissionSelected =
    selected === 'writers' &&
    visibleScreenplayCommissionActivity !== null &&
    exactNextEventReceipt?.target.kind !== 'script'
  const scriptReviewSurfaceContents = pendingScriptReviewSelected
    ? (
        <LotScriptReviewPanel
          ref={scriptReviewHeadingRef}
          inputBoundary={state}
          context={selectedScriptReviewContext}
          disabled={worldInputSuspended || onRunScriptReviewAction === undefined}
          feedback={
            visibleScriptReviewActivity !== null &&
            sameLotScriptReviewContext(
              visibleScriptReviewActivity.context,
              selectedScriptReviewContext,
            )
              ? visibleScriptReviewActivity.feedback
              : null
          }
          onAction={(action) => dispatchLotScriptReviewAction(
            state,
            selectedScriptReviewContext,
            action,
            null,
          )}
          onOpenDetails={() => {
            if (!openCurrentScriptReviewDetails(state, selectedScriptReviewContext)) {
              setScriptReviewActivity({
                acceptedState: state,
                context: selectedScriptReviewContext,
                success: null,
                feedback: {
                  kind: 'error',
                  message: 'Screenplay review details changed. Review the current lot.',
                },
              })
            }
          }}
        />
      )
    : screenplayCommissionSelected && visibleScreenplayCommissionActivity !== null
      ? (
          <div
            className="lot-script-review-success"
            data-testid="lot-screenplay-commission-witness"
            data-project-id={visibleScreenplayCommissionActivity.receipt.projectId}
          >
            <p className="hollywood-eyebrow">DEVELOPMENT · SCREENPLAY COMMISSIONED</p>
            <h3 ref={commissionWitnessHeadingRef} tabIndex={-1}>
              {visibleScreenplayCommissionActivity.receipt.title}
            </h3>
            <p data-testid="lot-screenplay-commission-feedback">
              Drafting is underway with an exact studio reservation.
            </p>
            <dl
              className="hollywood-person-facts"
              data-testid="lot-screenplay-commission-facts"
            >
              <div>
                <dt>Writer</dt>
                <dd>{visibleScreenplayCommissionActivity.receipt.writerName}</dd>
              </div>
              <div>
                <dt>Commissioned</dt>
                <dd>Week {visibleScreenplayCommissionActivity.receipt.commissionedWeek}</dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>Week {visibleScreenplayCommissionActivity.receipt.dueWeek}</dd>
              </div>
              <div>
                <dt>Facility</dt>
                <dd>{visibleScreenplayCommissionActivity.receipt.facilityName}</dd>
              </div>
              <div>
                <dt>Slot</dt>
                <dd>{visibleScreenplayCommissionActivity.receipt.slot + 1}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="accent"
              disabled={worldInputSuspended}
              onClick={() => {
                if (!worldInputSuspendedRef.current) dispatchCommissionRoute()
              }}
              data-testid="lot-screenplay-commission-open-details"
            >
              Open full Writers' Room details
            </button>
          </div>
        )
      : screenplaySuccessSelected && visibleScriptReviewActivity !== null
      ? (
          <div
            className="lot-script-review-success"
            data-testid="lot-script-review-success"
            data-project-id={visibleScriptReviewActivity.context.projectId}
          >
            <p className="hollywood-eyebrow">DEVELOPMENT · SCREENPLAY UPDATED</p>
            <h3 ref={scriptReviewHeadingRef} tabIndex={-1}>
              {visibleScriptReviewActivity.context.title}
            </h3>
            <p
              data-testid="lot-script-review-feedback"
              data-feedback-kind="success"
            >
              {visibleScriptReviewActivity.feedback.message}
            </p>
            {visibleScriptReviewActivity.success?.kind === 'rewrite' && (
              <dl className="hollywood-person-facts" data-testid="lot-script-review-rewrite-success">
                <div><dt>Writer</dt><dd>{visibleScriptReviewActivity.success.writerName}</dd></div>
                <div><dt>Due</dt><dd>Week {visibleScriptReviewActivity.success.dueWeek}</dd></div>
                <div><dt>Facility</dt><dd>{visibleScriptReviewActivity.success.facilityName}</dd></div>
                <div><dt>Slot</dt><dd>{visibleScriptReviewActivity.success.slot + 1}</dd></div>
              </dl>
            )}
          </div>
        )
      : null

  const pendingCastingReviewSelected =
    castingReviewIntent !== null &&
    selectedCastingReviewContext !== null &&
    exactNextEventReceipt?.target.kind !== 'casting'
  const castingSuccessSelected =
    selected === 'casting' &&
    visibleCastingReviewActivity?.feedback.kind === 'success' &&
    exactNextEventReceipt?.target.kind !== 'casting'
  const auditionPlanningSelected =
    selected === 'casting' &&
    visibleAuditionPlanningActivity !== null &&
    exactNextEventReceipt?.target.kind !== 'casting'
  const castingReviewSurfaceContents = pendingCastingReviewSelected
    ? (
        <LotCastingReviewPanel
          ref={castingReviewHeadingRef}
          inputBoundary={state}
          context={selectedCastingReviewContext}
          disabled={worldInputSuspended || onRunCastingReviewAction === undefined}
          feedback={
            visibleCastingReviewActivity !== null &&
            sameLotCastingReviewContext(
              visibleCastingReviewActivity.context,
              selectedCastingReviewContext,
            )
              ? visibleCastingReviewActivity.feedback
              : null
          }
          onAction={(action) => dispatchLotCastingReviewAction(
            state,
            selectedCastingReviewContext,
            action,
            null,
          )}
          onOpenDetails={() => {
            if (!openCurrentCastingReviewDetails(state, selectedCastingReviewContext)) {
              setCastingReviewActivity({
                acceptedState: state,
                context: selectedCastingReviewContext,
                success: null,
                feedback: {
                  kind: 'error',
                  message: 'Casting review details changed. Review the current lot.',
                },
              })
            }
          }}
        />
      )
    : auditionPlanningSelected && visibleAuditionPlanningActivity !== null
      ? (
          <div
            className="lot-casting-review-success"
            data-testid="lot-audition-planning-witness"
            data-session-id={visibleAuditionPlanningActivity.receipt.sessionId}
            data-project-id={visibleAuditionPlanningActivity.receipt.projectId}
          >
            <p className="hollywood-eyebrow">CASTING · CAMERA TESTS UNDERWAY</p>
            <h3 ref={auditionPlanningWitnessHeadingRef} tabIndex={-1}>
              {visibleAuditionPlanningActivity.receipt.title}
            </h3>
            <p data-testid="lot-audition-planning-feedback">
              Six camera-test reads are scheduled. No result or winner exists yet.
            </p>
            <dl
              className="hollywood-person-facts"
              data-testid="lot-audition-planning-facts"
            >
              <div>
                <dt>Started</dt>
                <dd>Week {visibleAuditionPlanningActivity.receipt.startedWeek}</dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>Week {visibleAuditionPlanningActivity.receipt.dueWeek}</dd>
              </div>
              <div>
                <dt>Facility</dt>
                <dd>{visibleAuditionPlanningActivity.receipt.facilityName}</dd>
              </div>
              <div>
                <dt>Slot</dt>
                <dd>{visibleAuditionPlanningActivity.receipt.slot + 1}</dd>
              </div>
            </dl>
            <section aria-label="Scheduled camera-test reads">
              <h4>Six scheduled reads</h4>
              <ol data-testid="lot-audition-planning-reads">
                {visibleAuditionPlanningActivity.receipt.reads.map((read, index) => (
                  <li
                    key={`${index}:${read.role}:${read.talentId}`}
                    data-testid={`lot-audition-planning-read-${index}`}
                    data-role={read.role}
                    data-talent-id={read.talentId}
                  >
                    <strong>{auditionPlanningRoleLabel(read.role)}</strong>
                    {' · '}{read.name}
                  </li>
                ))}
              </ol>
            </section>
            <p data-testid="lot-audition-planning-boundary">
              Starting camera tests did not hire, sign, hold, pay, reserve, make busy, assign,
              move, or choose any Actor.
            </p>
            <button
              type="button"
              className="accent"
              disabled={worldInputSuspended}
              onClick={() => {
                if (!worldInputSuspendedRef.current) dispatchRoute(BUILDING_ACTION.casting)
              }}
              data-testid="lot-audition-planning-open-details"
            >
              Open full Casting Room details
            </button>
          </div>
        )
    : castingSuccessSelected && visibleCastingReviewActivity !== null
      ? (
          <div
            className="lot-casting-review-success"
            data-testid="lot-casting-review-success"
            data-session-id={visibleCastingReviewActivity.context.sessionId}
            data-project-id={visibleCastingReviewActivity.context.projectId}
          >
            <p className="hollywood-eyebrow">CASTING · REVIEW COMPLETE</p>
            <h3 ref={castingReviewHeadingRef} tabIndex={-1}>
              {visibleCastingReviewActivity.context.title}
            </h3>
            <p
              data-testid="lot-casting-review-feedback"
              data-feedback-kind="success"
            >
              {visibleCastingReviewActivity.feedback.message}
            </p>
            {visibleCastingReviewActivity.success?.kind === 'blocked' && (
              <>
                <dl className="hollywood-person-facts" data-testid="lot-casting-review-blocked-success">
                  <div><dt>Status</dt><dd>{visibleCastingReviewActivity.success.statusLabel}</dd></div>
                  <div><dt>Evidence</dt><dd>Six persisted camera-test observations remain available.</dd></div>
                </dl>
                <section className="lot-casting-review-success-blockers" aria-label="Current package blockers">
                  <h4>Current package blockers</h4>
                  <div className="stack">
                    {visibleCastingReviewActivity.success.blockers.map((blocker, index) => (
                      <div
                        className="warn"
                        key={`${index}:${blocker.kind}:${blocker.headline}`}
                        data-testid="lot-casting-review-success-blocker"
                      >
                        <strong>{blocker.headline}</strong>
                        <div>{blocker.detail}</div>
                        <div className="hint">Remedy: {blocker.remedy}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )
      : null

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
            {selectedPersonPresence !== null && (
              <p
                className="hollywood-person-presence"
                data-testid="hollywood-person-presence"
                data-presence-kind={selectedPersonPresence.kind}
              >
                {selectedPersonPresence.line}
                {selectedPersonPresence.creditLabel !== null && (
                  <span
                    className="hollywood-person-presence-credit"
                    data-testid="hollywood-person-presence-credit"
                  >
                    Credited this week as {selectedPersonPresence.creditLabel}
                  </span>
                )}
              </p>
            )}
            {productionWork !== null ? (
              <dl className="hollywood-person-facts" data-testid="hollywood-person-work-facts">
                <div>
                  <dt>Role on picture</dt>
                  <dd>{productionCompanyRoleLabel(productionWork.productionRole)}</dd>
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
                Not working on a picture this week.
              </p>
            ) : (
              <p className="hollywood-person-work-note is-unavailable" data-testid="hollywood-person-work-unavailable">
                This week’s work is not recorded for this person.
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

  const isCurrentStage7Inspector =
    !gateSelected &&
    hollywoodPerson === null &&
    hollywoodPlace === null &&
    selectedSceneryLoadInContext === null &&
    currentStage7DetailContext !== null &&
    hollywoodInspectorOperation?.productionId ===
      currentStage7DetailContext?.operation.productionId
  const stage7DetailActionContext =
    isCurrentStage7Inspector &&
    selectedStage7DetailContext !== null &&
    onOpenStage7ProductionDetails !== undefined
      ? selectedStage7DetailContext
      : null

  const restoredNextEventReaction =
    entryFocus === 'next-event-reaction' &&
    exactNextEventReceipt !== null &&
    entryNextEventReceipt !== undefined &&
    sameLotNextEventReceipt(exactNextEventReceipt, entryNextEventReceipt)
  useEffect(() => {
    if (invalidNextEventReceipt !== null) {
      onInvalidateNextEvent?.(state, invalidNextEventReceipt)
    }
  }, [invalidNextEventReceipt, onInvalidateNextEvent, state])
  const nextEventReasonDetail = (() => {
    const receipt = exactNextEventReceipt
    if (receipt === null) return null
    switch (receipt.target.kind) {
      case 'script':
        return nextEventScriptReviewContext === null ? null : (
          <LotScriptReviewPanel
            inputBoundary={state}
            context={nextEventScriptReviewContext}
            identityOwnedExternally
            disabled={worldInputSuspended || onRunScriptReviewAction === undefined}
            feedback={
              visibleScriptReviewActivity !== null &&
              sameLotScriptReviewContext(
                visibleScriptReviewActivity.context,
                nextEventScriptReviewContext,
              )
                ? visibleScriptReviewActivity.feedback
                : null
            }
            onAction={(action) => dispatchLotScriptReviewAction(
              state,
              nextEventScriptReviewContext,
              action,
              receipt,
            )}
          />
        )
      case 'casting':
        return nextEventCastingReviewContext === null ? null : (
          <LotCastingReviewPanel
            inputBoundary={state}
            context={nextEventCastingReviewContext}
            identityOwnedExternally
            disabled={worldInputSuspended || onRunCastingReviewAction === undefined}
            feedback={
              visibleCastingReviewActivity !== null &&
              sameLotCastingReviewContext(
                visibleCastingReviewActivity.context,
                nextEventCastingReviewContext,
              )
                ? visibleCastingReviewActivity.feedback
                : null
            }
            onAction={(action) => dispatchLotCastingReviewAction(
              state,
              nextEventCastingReviewContext,
              action,
              receipt,
            )}
          />
        )
      case 'production': {
        const target = receipt.target
        const operations = (snapshot.productionOperations ?? []).filter(
          (operation) => operation.productionId === target.productionId,
        )
        const operation = operations.length === 1 ? operations[0]! : null
        return (
          <p>
            Production decision · {target.title}
            {operation === null
              ? ''
              : ` · ${operation.phaseLabel} · ${operation.statusLabel}${
                  operation.blocker ? ` · ${operation.blocker.headline}` : ''
                }${operation.currentCommand ? ` · Command: ${operation.currentCommand.label}` : ''}`}
          </p>
        )
      }
      case 'run-completed':
        return <p>Theatrical run completed · {receipt.target.runs.map((run) => run.title).join(' · ')}</p>
      case 'cash':
        return <p>Administration · studio cash crossed below zero.</p>
      case 'contracts':
        return (
          <p>
            {receipt.target.change === 'expired'
              ? 'A studio contract ended. No person identity is inferred.'
              : 'A studio contract entered its renewal window. No person identity is inferred.'}
          </p>
        )
      case 'construction':
        return null
    }
  })()
  const nextEventWorldAction: LotNextEventRailAction | null =
    exactNextEventReceipt === null ||
    exactNextEventReceipt.target.kind !== 'production' ||
    nextEventProductionCommand === null ||
    onRunNextEventProductionCommand === undefined
      ? null
      : {
          label: nextEventProductionCommand.label,
          onActivate: () => {
            const latestCommand = currentLotNextEventProductionCommand(
              state,
              exactNextEventReceipt,
            )
            const commandIsCurrent = latestCommand !== null &&
              sameLotNextEventProductionCommand(nextEventProductionCommand, latestCommand)
            if (commandIsCurrent && hollywood) {
              pendingHollywoodFocusProductionId.current =
                exactNextEventReceipt.target.kind === 'production'
                  ? exactNextEventReceipt.target.productionId
                  : null
            }
            const outcome = onRunNextEventProductionCommand(
              exactNextEventReceipt,
              commandIsCurrent ? latestCommand : nextEventProductionCommand,
            )
            if (!outcome.ok) {
              pendingHollywoodFocusProductionId.current = null
              if (outcome.error !== 'Studio event details changed. Review the current lot.') {
                announceHollywoodActivity(`Production command blocked: ${outcome.error}`)
              }
            }
          },
          testId: `hollywood-production-command-${nextEventProductionCommand.kind}`,
        }
  const nextEventDeepAction: LotNextEventRailAction | null =
    exactNextEventReceipt === null || onOpenNextEventDetails === undefined
      ? null
      : {
          label: (() => {
            switch (exactNextEventReceipt.target.kind) {
              case 'script':
                return `Open Writers’ Room · ${exactNextEventReceipt.target.title}`
              case 'casting':
                return `Open Casting Room · ${exactNextEventReceipt.target.title}`
              case 'production':
                return `Open Production Board details · ${exactNextEventReceipt.target.title}`
              case 'run-completed':
                return 'Open Dashboard releases'
              case 'cash':
                return 'Open Dashboard finances'
              case 'contracts':
                return 'Open Studio Roster'
              case 'construction':
                return 'Open Studio Development'
            }
          })(),
          onActivate: () => onOpenNextEventDetails(state, exactNextEventReceipt),
          testId: 'lot-next-event-open-details',
        }

  const beginNextEventPointerGesture = (
    event: { stopPropagation(): void },
    family: 'pointer' | 'mouse' | 'touch',
  ) => {
    containWorldInput(event)
    if (
      worldInputSuspendedRef.current ||
      (typeof document !== 'undefined' && document.hidden) ||
      nextEventHeldKeyRef.current !== null ||
      nextEventSuppressPhysicalStartRef.current ||
      (nextEventPhysicalPrimaryRequiredRef.current && family !== 'pointer')
    ) return
    if (family === 'pointer') nextEventPhysicalPrimaryRequiredRef.current = false
    nextEventVirtualReleaseEpochRef.current += 1
    nextEventSuppressUntokenedVirtualRef.current = false
    if (nextEventGestureRef.current === null) {
      nextEventGestureRef.current = { renderedState: state, origin: 'pointer' }
    }
  }

  const cancelNextEventPointerGesture = (event: { stopPropagation(): void }) => {
    containWorldInput(event)
    // A physical late click has detail > 0 and cannot pass without this token.
    // Keep virtual/switch activation immediately available after pointer cancel.
    if (nextEventGestureRef.current?.origin === 'pointer') {
      nextEventPhysicalPrimaryRequiredRef.current = true
    }
    clearNextEventGesture(false)
    suppressNextEventPhysicalStartsThroughTask()
  }

  const guardNextEventKeyDown = (event: {
    key: string
    repeat: boolean
    preventDefault(): void
    stopPropagation(): void
  }) => {
    containWorldInput(event)
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (
      worldInputSuspendedRef.current ||
      event.repeat ||
      nextEventHeldKeyRef.current !== null ||
      nextEventGestureRef.current !== null
    ) {
      event.preventDefault()
      return
    }
    nextEventVirtualReleaseEpochRef.current += 1
    nextEventSuppressUntokenedVirtualRef.current = false
    nextEventHeldKeyRef.current = event.key
    nextEventGestureRef.current = { renderedState: state, origin: 'keyboard' }
  }

  const releaseNextEventKey = (event: { key: string; stopPropagation(): void }) => {
    containWorldInput(event)
    settleNextEventKeyUp(event.key)
  }

  const activateNextEvent = (detail: number) => {
    if (detail > 1) {
      clearNextEventGesture(true)
      return
    }
    if (
      worldInputSuspendedRef.current ||
      !nextEventEligibility.eligible ||
      onSimToNextEvent === undefined
    ) return

    const gesture = nextEventGestureRef.current
    if (detail > 0 && gesture?.origin !== 'pointer') return
    if (
      gesture === null &&
      (detail !== 0 ||
        nextEventHeldKeyRef.current !== null ||
        nextEventSuppressUntokenedVirtualRef.current)
    ) return

    nextEventGestureRef.current = null
    if (gesture !== null && gesture.renderedState !== state) {
      releaseNextEventVirtualTail()
      return
    }

    // Seal same-stack detail-0 compatibility/repeat tails, but release the seal
    // at a bounded microtask so a later genuine AT/switch click stays available.
    releaseNextEventVirtualTail()
    const renderedBefore = gesture?.renderedState ?? state
    if (onSimToNextEvent(renderedBefore)) {
      clearFormationWitness()
      // The next-event rail owns this cadence moment; prior one-shot world
      // acknowledgements must not remain as a competing live announcement.
      setHollywoodActivity(null)
    }
  }

  // PF1-M2 motion gate. Reduced motion is not a shorter animation, it is NO animation:
  // the attribute itself reads `none`, so the gate is visible in the DOM and provable in a
  // test rather than buried in a stylesheet. `.lot-reduced-motion` on the root is the
  // second belt (the established Lot pattern). Reduced motion + muted = today's game.
  const noticeMotion: CueMotion = reducedMotion ? 'none' : (punctuation?.motion ?? 'emphasis')

  return (
    <div
      className={`lot-screen${reducedMotion ? ' lot-reduced-motion' : ''}${hollywood ? ' lot-hollywood' : ''}`}
      data-testid="studio-lot-screen"
      data-entry-focus={entryFocus ?? 'none'}
      inert={worldInputSuspended || undefined}
    >
      <div
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="lot-casting-review-announcement"
      >
        {visibleCastingReviewActivity?.feedback.kind === 'success' &&
        visibleCastingReviewActivity.success?.kind === 'blocked'
          ? visibleCastingReviewActivity.feedback.message
          : ''}
      </div>
      <div
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="lot-production-formation-announcement"
      >
        {formationAnnouncement}
      </div>
      <div
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="lot-script-review-announcement"
      >
        {visibleScriptReviewActivity?.feedback.kind === 'success'
          ? visibleScriptReviewActivity.feedback.message
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
          <span className="lot-sub">{hollywood ? `Studio Chronicle · Hollywood, ${LOT_ERA_KEY}` : 'Studio Lot'} · Week {snapshot.week}</span>
        </div>
        <div className="lot-topbar-actions">
          <CashReadout cash={snapshot.cash} reducedMotion={reducedMotion} />
          <button
            ref={advanceButtonRef}
            type="button"
            className="primary lot-advance-week"
            onPointerDown={containWorldInput}
            onMouseDown={containWorldInput}
            onTouchStart={containWorldInput}
            disabled={worldInputSuspended}
            onClick={() => {
              if (!worldInputSuspendedRef.current) {
                clearFormationWitness()
                onAdvance()
              }
            }}
            data-testid="lot-advance-week"
          >
            Advance one week
          </button>
          <div className="lot-next-event-control">
            <button
              ref={nextEventButtonRef}
              type="button"
              className="accent lot-next-event-button"
              onPointerDown={(event) => beginNextEventPointerGesture(event, 'pointer')}
              onMouseDown={(event) => beginNextEventPointerGesture(event, 'mouse')}
              onTouchStart={(event) => beginNextEventPointerGesture(event, 'touch')}
              onPointerCancel={cancelNextEventPointerGesture}
              onTouchCancel={cancelNextEventPointerGesture}
              onKeyDown={guardNextEventKeyDown}
              onKeyUp={releaseNextEventKey}
              onBlur={() => {
                if (nextEventGestureRef.current !== null) {
                  if (nextEventGestureRef.current.origin === 'pointer') {
                    nextEventPhysicalPrimaryRequiredRef.current = true
                  }
                  clearNextEventGesture(true)
                }
              }}
              disabled={
                worldInputSuspended ||
                !nextEventEligibility.eligible ||
                onSimToNextEvent === undefined
              }
              aria-describedby={
                !nextEventEligibility.eligible
                  ? 'lot-next-event-disabled-reason'
                  : undefined
              }
              onClick={(event) => activateNextEvent(event.detail)}
              data-testid="lot-sim-to-next-event"
            >
              Sim to next event
            </button>
            {!nextEventEligibility.eligible && nextEventEligibility.reason !== null && (
              <span
                id="lot-next-event-disabled-reason"
                className="lot-next-event-disabled-reason"
                data-testid="lot-next-event-disabled-reason"
              >
                {nextEventEligibility.reason}
              </span>
            )}
          </div>
          <button
            className="ghost"
            disabled={worldInputSuspended}
            onClick={() => {
              if (!worldInputSuspendedRef.current) onExit()
            }}
            data-testid="lot-return-dashboard"
          >
            Open Dashboard
          </button>
          {/*
            THE WAY TO THE VAULT. The saves route has existed since D1 and nothing on the
            property emitted it, so the only way to a print of the studio was through the
            Dashboard. This is ordinary deep navigation through the SAME owner every other
            lot destination uses; it spends nothing and changes no state.
          */}
          {/*
            PF1-M4 addendum 2 — THE TOPBAR IS ONE ROW AT EVERY GOVERNED VIEWPORT.
            M3 added these last two entries to a flex row that was already full. Below
            1120px the row wrapped, and a wrapped topbar is 119.5px instead of 63px — it
            pushed the world and every panel anchored in it past the viewport, which is
            what `lot.spec.ts` read as a context panel at -80.5 @ 960x540 and
            `publicity-campaign-v1.spec.ts` as a bottom of 805.5 in a 768-tall viewport.

            So below the breakpoint these two compact to their glyph. Nothing is hidden
            and nothing is removed: the same buttons, the same testids, the same handlers,
            a >=44px hit target, the studio's own focus ring, and the full name still
            spoken — carried by `aria-label` (so the accessible name never depends on which
            span is painted) and shown on hover by `title`. The label span is not
            `display: none` either; it is clipped, so a UA that ignores the stylesheet
            still shows words rather than a bare mark.
          */}
          <button
            className="ghost lot-topbar-compactable"
            disabled={worldInputSuspended}
            onPointerDown={containWorldInput}
            onMouseDown={containWorldInput}
            onTouchStart={containWorldInput}
            onClick={() => {
              if (!worldInputSuspendedRef.current) onNavigateRef.current({ kind: 'saves' })
            }}
            aria-label="Saves"
            title="Export a print of this studio, or load one"
            data-testid="lot-open-saves"
          >
            <span className="lot-topbar-mark" aria-hidden="true">▤</span>
            <span className="lot-topbar-label">Saves</span>
          </button>
          {onOpenSettings && (
            <button
              className="ghost lot-topbar-compactable"
              disabled={worldInputSuspended}
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
              onClick={() => {
                if (!worldInputSuspendedRef.current) onOpenSettings()
              }}
              aria-label="Settings"
              title="Sound, motion, and the rest of the projection booth"
              data-testid="lot-open-settings"
            >
              {/* VARIATION SELECTOR-15: the gear is drawn as a glyph, never as a colour
                  emoji, so it matches the rest of the bar on every platform. */}
              <span className="lot-topbar-mark" aria-hidden="true">{'⚙︎'}</span>
              <span className="lot-topbar-label">Settings</span>
            </button>
          )}
        </div>
      </header>

      <div className="lot-body">
        {/*
          `data-guidance-target` is the DOM-readable fact of where the world is currently
          pointing: the building the picture's next step names, or 'none'. It is evidence,
          not a control — the marker itself is painted in the world.
        */}
        <div className="lot-stage-wrap" data-guidance-target={guidanceMarkerTarget ?? 'none'}>
          {/* Primary visual world surface; the DOM companion is its semantic equivalent. */}
          <div ref={mountRef} className="lot-canvas" data-testid="studio-lot-canvas" aria-hidden="true" />

          {/*
            PF1-M2 aria-only promotion. These two moments were invisible: a facility becoming
            operational, and a week actually landing. Everything a sighted player had was a
            counter quietly changing. The SAME region is now a modest visible notice —
            one element, one announcement, no second live region, no double-announce; the
            `role`/`aria-live`/`aria-atomic`/testid contract is untouched, and the composed copy
            is carried verbatim. The other three hidden regions stay hidden on purpose: their
            content is already fully visible beside them (see the M2 report).

            PF1-M4 — THE DOUBLE-ANNOUNCE FIX. The React key used to embed the punctuation
            serial, which bumps on ANY committed action. So a build receipt landing while an
            Operational notice was still on screen replaced the live region's child with a new
            node carrying the identical sentence — and an aria-atomic polite region re-reads
            that, word for word, to a player who has already heard it. The key is now THE
            SENTENCE ONLY: identical copy is the same node, so it is announced exactly once,
            and genuinely new copy is still a new node and still announced. The serial moves to
            `data-punctuation` on the region wrapper, where the stylesheet can restart the
            notice animation without touching the announced subtree (attribute changes on a
            live region are not announcements). DOM-only: no renderer call, no display object.

            PF1-M4 — AND THEY ARE LAYOUT-NEUTRAL. These strips used to sit in the
            `.lot-screen` COLUMN, above the topbar, where a visible notice added its own
            height to a column that is already `min-height: 100vh`. That pushed the world
            and every panel anchored inside it past the governed viewport, the document
            scrolled, and two reachability specs read a context panel at a negative top
            (`lot.spec.ts` @ 960x540) or past the bottom edge (`publicity-campaign-v1.spec.ts`
            @ 200% zoom). They now live INSIDE the stage as an absolutely positioned overlay
            pinned to its top edge (`lot.css`: `.lot-notice`), so they consume zero column
            height at every governed viewport and the world is exactly the size it was
            before a notice existed. Non-interactive, so they are `pointer-events: none` and
            can never take a click meant for the world beneath them.
          */}
          <div
            className="lot-notice"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-punctuation={String(punctuation?.key ?? 0)}
            data-testid="lot-annex-operational-announcement"
          >
            {operationalAnnouncement !== '' && (
              <span
                key={operationalAnnouncement}
                className="lot-notice-line"
                data-motion={noticeMotion}
              >
                {operationalAnnouncement}
              </span>
            )}
          </div>
          <div
            className="lot-notice"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-punctuation={String(punctuation?.key ?? 0)}
            data-testid="lot-week-update-announcement"
          >
            {advanceFeedback !== null && advanceFeedback.constructionCompletion === null && (
              <span
                key={`week:${String(advanceFeedback.week)}`}
                className="lot-notice-line"
                data-motion={noticeMotion}
              >
                {/* PF1-M3 VOICE PASS (charter §3, rule 3 — restraint is voice too). M2 promoted this
                    region from aria-only to visible, so "Week N. Studio Lot updated." stopped being
                    a screen-reader crumb and became copy the player reads every single week. It is a
                    routine week: it gets a quiet declarative line, not a bulletin. Still ONE element,
                    so the visible copy and the announcement remain verbatim-identical by
                    construction; role/aria-live/aria-atomic/testid are untouched. */}
                {`Week ${advanceFeedback.week} on the lot.`}
              </span>
            )}
          </div>

          {/*
            THE WAY BACK. Panning and zooming a property this size is a gesture a player
            can lose themselves with, and until now the only recovery was an undocumented
            `R` keypress on an aria-hidden canvas — no control, no name, nothing a pointer
            or a screen reader could find. One quiet control, always in the same place,
            naming its own shortcut. It commands the camera and nothing else: no selection
            moves, no simulation runs, not one byte of the session changes.
          */}
          {canvasReady && !canvasFailed && (
            <button
              type="button"
              className="lot-camera-home"
              data-testid="lot-camera-home"
              disabled={worldInputSuspended}
              aria-keyshortcuts={cameraHomeShortcut ?? undefined}
              title={
                cameraHomeShortcut === null
                  ? 'Show the whole property'
                  : `Show the whole property (shortcut: ${cameraHomeShortcut})`
              }
              aria-label={
                cameraHomeShortcut === null
                  ? 'Show the whole property'
                  : `Show the whole property. Keyboard shortcut ${cameraHomeShortcut}.`
              }
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
              onClick={() => {
                if (worldInputSuspendedRef.current) return
                viewRef.current?.resetCamera?.()
              }}
            >
              <span aria-hidden="true" className="lot-camera-home-glyph">⤢</span>
              <span className="lot-camera-home-label">Whole property</span>
              {cameraHomeShortcut !== null && (
                <kbd aria-hidden="true" className="lot-camera-home-key">{cameraHomeShortcut}</kbd>
              )}
            </button>
          )}

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
                className={`hollywood-production${hollywoodOperation ? '' : ' is-idle'}${
                  currentFormationContext?.operation.productionId ===
                  hollywoodOperation?.productionId
                    ? ' is-formation'
                    : ''
                }`}
                aria-label="Current production"
                data-testid={hollywoodOperation ? 'hollywood-current-production' : 'hollywood-production-idle'}
                onPointerDown={containWorldInput}
                onMouseDown={containWorldInput}
                onTouchStart={containWorldInput}
              >
                {hollywoodOperation ? (
                  <>
                    {formationWitnessVisible &&
                      currentFormationContext?.operation.productionId ===
                        hollywoodOperation.productionId && (
                        <p
                          className="hollywood-formation-witness"
                          data-testid="hollywood-production-formation-witness"
                        >
                          PICTURE FORMED
                        </p>
                      )}
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
                      <div><dt>Production facilities</dt><dd>{hollywoodOperation.facilityLabel}</dd></div>
                      {currentFormationContext?.operation.productionId ===
                        hollywoodOperation.productionId && (
                        <div><dt>Status</dt><dd>{hollywoodOperation.statusLabel}</dd></div>
                      )}
                      <div><dt>Weeks left</dt><dd>{hollywoodOperation.weeksRemaining}</dd></div>
                      <div><dt>Director</dt><dd>{hollywoodOperation.directorName}</dd></div>
                      {hollywoodOperation.leadName && (
                        <div><dt>Lead</dt><dd>{hollywoodOperation.leadName}</dd></div>
                      )}
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
                              inspectHollywoodSceneryLoadIn(
                                hollywoodOperation.productionId,
                                true,
                              )
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
                ) : pictureJourney.kind === 'absent' ? (
                  // No journey projection on this snapshot at all. Claim only what the
                  // studio's own production truth proves, exactly as before.
                  <>
                    <p className="hollywood-eyebrow"><i /> STUDIO OPERATIONS</p>
                    <h2>No active production</h2>
                    <p className="hollywood-idle-copy">
                      The studio lot is idle. Assemble a film to begin production.
                    </p>
                  </>
                ) : (
                  // Before a picture is greenlit this desk used to say the lot was idle
                  // while a screenplay was drafting and auditions were running. The
                  // picture owns the slot from before its first commission instead.
                  <LotPictureGuidanceCard
                    state={pictureGuidanceState}
                    onNextStep={takePictureGuidanceStep}
                    reducedMotion={reducedMotion}
                    disabled={worldInputSuspended}
                  />
                )}
              </section>

              <section
                className={`hollywood-inspector${scriptReviewSurfaceContents ? ' is-script-review' : ''}${castingReviewSurfaceContents ? ' is-casting-review' : ''}${gateSelected ? ' is-gate' : ''}${publicitySelected ? ' is-publicity' : ''}${annexSelected ? ' is-annex' : ''}${selectedSceneryLoadInContext ? ' is-scenery' : ''}${parcelInspectorContents ? ' is-parcel' : ''}${buildingInspectorContents ? ' is-building' : ''}${hollywoodPerson ? ' is-person' : ''}`}
                data-testid={
                  castingReviewSurfaceContents
                    ? 'lot-casting-review-context'
                    : scriptReviewSurfaceContents
                    ? 'lot-script-review-context'
                    : gateSelected
                    ? 'hollywood-gate-context'
                    : publicitySelected
                    ? 'hollywood-publicity-context'
                    : annexSelected
                    ? 'lot-annex-context'
                    : selectedSceneryLoadInContext
                      ? 'hollywood-scenery-load-in-context'
                      : parcelInspectorContents
                        ? 'lot-parcel-inspector-context'
                        : buildingInspectorContents
                          ? 'lot-building-inspector-context'
                          : 'hollywood-inspector'
                }
                onPointerDown={containWorldInput}
                onMouseDown={containWorldInput}
                onTouchStart={containWorldInput}
              >
                {castingReviewSurfaceContents
                  ? castingReviewSurfaceContents
                  : scriptReviewSurfaceContents
                  ? scriptReviewSurfaceContents
                  : gateSelected
                  ? gateContextContents
                  : publicitySelected
                  ? publicityContextContents
                  : annexSelected
                  ? annexContextContents
                  : selectedSceneryLoadInContext
                    ? sceneryLoadInContextContents
                    : parcelInspectorContents
                      ? parcelInspectorContents
                      : buildingInspectorContents
                      ? buildingInspectorContents
                      : (
                  <>
                    {personInspectorContents ?? (
                      <>
                        <p className="hollywood-eyebrow">{hollywoodPlace ? 'SELECTED PLACE' : 'STUDIO DESK'}</p>
                        <h3
                          ref={hollywoodStage7HeadingRef}
                          tabIndex={isCurrentStage7Inspector ? -1 : undefined}
                          data-testid={isCurrentStage7Inspector
                            ? 'hollywood-stage7-production-heading'
                            : undefined}
                        >
                          {hollywoodPlace?.label ?? hollywoodOperation?.title ?? 'Studio idle'}
                        </h3>
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
                    {hollywoodPlace === null &&
                      hollywoodInspectorOperation &&
                      hollywoodInspectorCommand &&
                      exactNextEventReceipt?.target.kind !== 'production' && (
                      <button
                        className="accent hollywood-command"
                        disabled={!onProductionCommand}
                        ref={hollywoodCommandRef}
                        onClick={() => dispatchHollywoodProductionCommand(
                          hollywoodInspectorOperation.productionId,
                          hollywoodInspectorCommand,
                        )}
                        data-testid={`hollywood-production-command-${hollywoodInspectorCommand.kind}`}
                      >
                        {hollywoodInspectorCommand.label}
                      </button>
                    )}
                    {stage7DetailActionContext !== null &&
                      exactNextEventReceipt?.target.kind !== 'production' && (
                      <button
                        type="button"
                        className="ghost hollywood-production-details"
                        onPointerDown={(event) => latchHollywoodStage7DetailActivation(
                          event,
                          stage7DetailActionContext,
                        )}
                        onMouseDown={(event) => latchHollywoodStage7DetailActivation(
                          event,
                          stage7DetailActionContext,
                        )}
                        onTouchStart={(event) => latchHollywoodStage7DetailActivation(
                          event,
                          stage7DetailActionContext,
                        )}
                        onPointerCancel={cancelHollywoodStage7Gesture}
                        onKeyDown={(event) => guardHollywoodStage7DetailKeyDown(
                          event,
                          stage7DetailActionContext,
                        )}
                        onKeyUp={releaseHollywoodStage7DetailKey}
                        onClick={(event) => {
                          if (
                            hollywoodStage7SuppressNextClickRef.current &&
                            event.detail > 0
                          ) {
                            hollywoodStage7SuppressNextClickRef.current = false
                            hollywoodStage7ActivationRef.current = null
                            return
                          }
                          hollywoodStage7SuppressNextClickRef.current = false
                          const rendered =
                            hollywoodStage7ActivationRef.current ?? stage7DetailActionContext
                          hollywoodStage7ActivationRef.current = null
                          openHollywoodStage7ProductionDetails(rendered, event.detail)
                        }}
                        data-testid={`hollywood-open-production-details-${stage7DetailActionContext.operation.productionId}`}
                      >
                        Open Production Board details · {stage7DetailActionContext.operation.title}
                      </button>
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
              {hollywoodPresentationPeople.length > 0 && (
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
                  {/*
                    One list over every named person the snapshot proves. A company member
                    keeps their exact picture credit; the studio's other contracted
                    employees (M1.5 staff presence) are listed as roster, claiming no
                    picture. Both paths select through the same owner.
                  */}
                  {hollywoodPresentationPeople.map((rendered) => {
                    const membership =
                      hollywoodCompanyMembers?.find((entry) => entry.person.id === rendered.id) ??
                      null
                    // The company context owns its own exact person object; person-work
                    // resolution compares identity, so never substitute a lookalike.
                    const person = membership?.person ?? rendered
                    const selectedPerson = hollywoodPerson?.id === person.id
                    if (membership !== null) {
                      const { company, member } = membership
                      const selectedCompany = hollywoodCompanyPresentationProductionId ===
                        company.operation.productionId
                      return (
                        <button
                          key={person.id}
                          type="button"
                          className={`${selectedPerson ? 'active' : ''}${
                            selectedCompany ? ' company-active' : ''
                          }`.trim()}
                          aria-pressed={selectedPerson}
                          aria-label={`${person.name} · ${productionCompanyRoleLabel(member.productionRole)} · ${company.operation.title}`}
                          onClick={() => selectHollywoodPerson(person)}
                          data-production-id={company.operation.productionId}
                          data-production-role={member.productionRole}
                          data-testid={`hollywood-select-person-${person.id}`}
                        >
                          <span>{person.name}</span>
                          <small>
                            {productionCompanyRoleLabel(member.productionRole)} · {company.operation.title}
                          </small>
                        </button>
                      )
                    }
                    const onRoster = person.authority === 'studio-roster'
                    return (
                      <button
                        key={person.id}
                        type="button"
                        className={selectedPerson ? 'active' : ''}
                        aria-pressed={selectedPerson}
                        aria-label={onRoster ? `${person.name} · Studio roster` : undefined}
                        onClick={() => selectHollywoodPerson(person)}
                        data-authority={person.authority}
                        data-testid={`hollywood-select-person-${person.id}`}
                      >
                        <span>{person.name}</span>
                        <small>{onRoster ? 'Studio roster' : person.role}</small>
                      </button>
                    )
                  })}
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
                <div
                  className="hollywood-perf"
                  data-testid="hollywood-performance"
                  data-frame-samples={hollywoodPerf.frameSampleCount}
                  data-telemetry-window={hollywoodPerfWindow}
                  data-decoded-bytes={hollywoodPerf.textureMemoryBytes}
                  data-fps={hollywoodPerf.fps}
                  data-one-percent-low-fps={hollywoodPerf.onePercentLowFps}
                  data-display-objects={hollywoodPerf.displayObjects}
                  data-dynamic-actors={hollywoodPerf.dynamicActors}
                  data-p99-frame-ms={hollywoodPerf.p99FrameMs}
                  data-worst-frame-ms={hollywoodPerf.worstFrameMs}
                  data-average-update-ms={hollywoodPerf.updateMs}
                  data-worst-update-ms={hollywoodPerf.worstUpdateMs}
                  data-draw-calls={hollywoodPerf.drawCalls}
                >
                  {hollywoodPerf.fps} fps · {hollywoodPerf.onePercentLowFps} fps 1% low · {hollywoodPerf.displayObjects} objects · {hollywoodPerf.dynamicActors} actors · {hollywoodPerf.textureMemoryMb} MB decoded · {hollywoodPerf.roleAtlasEncodedKb} KB atlas · {hollywoodPerf.p99FrameMs} ms p99 · {hollywoodPerf.worstFrameMs} ms worst · {hollywoodPerf.updateMs} ms update · {hollywoodPerf.drawCalls} draws
                </div>
              )}
            </>
          )}

          {nextEventFeedback !== null && (
            <div
              className="lot-next-event-wrap"
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
            >
              <LotNextEventRail
                ref={nextEventHeadingRef}
                feedback={nextEventFeedback}
                reasonDetail={nextEventReasonDetail}
                worldAction={nextEventWorldAction}
                deepAction={nextEventDeepAction}
                restored={restoredNextEventReaction}
                inputSuspended={worldInputSuspended}
                inputResetEpoch={nextEventRailInputResetEpoch}
                onDismiss={() => {
                  onDismissNextEvent?.()
                  queueMicrotask(() => {
                    const button = nextEventButtonRef.current
                    if (button !== null && button.isConnected && !button.disabled) {
                      button.focus({ preventScroll: true })
                    } else {
                      studioHeadingRef.current?.focus({ preventScroll: true })
                    }
                  })
                }}
                onRequestLotHeadingFocus={() => {
                  studioHeadingRef.current?.focus({ preventScroll: true })
                }}
              />
            </div>
          )}

          {!hollywood && scriptReviewSurfaceContents !== null && (
            <section
              className="lot-script-review-fallback"
              data-testid="lot-script-review-context"
              aria-label="Development screenplay review"
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
            >
              {scriptReviewSurfaceContents}
            </section>
          )}

          {!hollywood && castingReviewSurfaceContents !== null && (
            <section
              className="lot-casting-review-fallback"
              data-testid="lot-casting-review-context"
              aria-label="Casting review"
              onPointerDown={containWorldInput}
              onMouseDown={containWorldInput}
              onTouchStart={containWorldInput}
            >
              {castingReviewSurfaceContents}
            </section>
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
              Stage 7 work remains available through the Studio Desk. Exact Gate visitor controls
              also remain available in the Studio Lot.
            </div>
          )}

          {selectionInfo && !annexSelected && scriptReviewSurfaceContents === null && castingReviewSurfaceContents === null && (
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
                onClick={() => {
                  if (
                    selectionInfo.buildingId === 'writers' &&
                    enterCurrentScriptReview() !== null
                  ) return
                  if (
                    selectionInfo.buildingId === 'casting' &&
                    enterCurrentCastingReview() !== null
                  ) return
                  if (
                    selectionInfo.buildingId === 'casting' &&
                    keepInvalidCurrentCastingReviewNeutral()
                  ) return
                  dispatchRoute(selectionInfo.action)
                }}
              >
                {resolveAction(selectionInfo.action).navLabel}
              </button>
            </div>
          )}

        </div>

        <nav
          className="lot-companion"
          aria-label="Studio lot destinations"
          data-testid="lot-companion-nav"
          onPointerDown={containWorldInput}
          onMouseDown={containWorldInput}
          onTouchStart={containWorldInput}
        >
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
                  disabled={worldInputSuspended}
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
            {rows.map((row) => {
              const isSemanticStage7Selection =
                row.id === 'stage-a' &&
                isCurrentStage7Inspector &&
                selectedStage7DetailContext !== null
              const rowSelected = selected === row.id || isSemanticStage7Selection
              return (
                <li key={row.id}>
                  <button
                    ref={(node) => {
                      companionButtonRefs.current[row.id] = node
                    }}
                    type="button"
                    className={`lot-nav-item att-${row.attention}${rowSelected ? ' is-selected' : ''}`}
                    data-testid={`lot-nav-${row.id}`}
                    data-attention={row.attention}
                    disabled={worldInputSuspended}
                    aria-current={rowSelected ? 'true' : undefined}
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
              )
            })}
          </ul>
          {companionParcels.length > 0 && (
            <>
              <h3 className="lot-companion-subtitle" id="lot-companion-ground">
                Open ground
              </h3>
              <ul className="lot-nav-list lot-nav-parcels" aria-labelledby="lot-companion-ground">
                {companionParcels.map((parcel) => {
                  const context = lotParcelInspectorContext(placementView, parcel.id)
                  const chosen = parcelInspectorId === parcel.id
                  return (
                    <li key={parcel.id}>
                      <button
                        type="button"
                        className={`lot-nav-item att-future${chosen ? ' is-selected' : ''}`}
                        data-testid={`lot-nav-parcel-${parcel.id}`}
                        data-attention="future"
                        disabled={worldInputSuspended}
                        aria-current={chosen ? 'true' : undefined}
                        onClick={() => activateParcel(parcel.id)}
                        title={context?.role ?? parcel.label}
                      >
                        <span className="lot-nav-name">{parcel.label}</span>
                        <span
                          className="lot-nav-state"
                          data-testid={`lot-nav-parcel-${parcel.id}-state`}
                        >
                          <span className="lot-nav-icon" aria-hidden="true">◇</span>
                          <span className="lot-nav-att-word visually-hidden">Open ground: </span>
                          {context?.statusLine ?? parcel.label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}

export default StudioLotScreen
