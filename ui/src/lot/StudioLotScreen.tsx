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

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type {
  ActionOutcome,
  ConstructionCompletionSummary,
  GameState,
  StudioConstructionView,
} from '../engine/adapter.ts'
import {
  careerIdentityLabel,
  studioDecision,
  studioDevelopment,
  studioLotSnapshot,
  talentAssignmentContext,
  talentProfile,
} from '../engine/adapter.ts'
import { ConstructionCompletionNotice } from '../components/ConstructionCompletionNotice.tsx'
import {
  LotNextEventRail,
  type LotNextEventRailAction,
} from './LotNextEventRail.tsx'
import {
  LotScriptReviewPanel,
  type LotScriptReviewPanelFeedback,
} from './LotScriptReviewPanel.tsx'
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
import { ALL_BUILDING_IDS, BUILDING_ACTION, BUILDING_LABELS } from './snapshot/StudioLotSnapshot.ts'
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
  getLotSelectedBuilding,
  setLotSelectedBuilding,
} from './snapshot/selectedBuildingSession.ts'
import { lotStageAssignment } from './snapshot/stageAssignment.ts'
import { BUILDING_BLURBS, resolveAction, type LotRoute } from './navigation.ts'
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
} from '../flags.ts'
import type { IdentityMode } from './identity/manifest.ts'

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
  /** Host maps a lot route to the existing app navigation (setScreen). */
  onNavigate: (route: LotRoute) => void
  /** Open the supporting Dashboard surface. */
  onExit: () => void
  /** Emit one authoritative App-owned weekly-advance intent. */
  onAdvance: () => void
  /** One mutually exclusive App-owned weekly or next-event feedback arm. */
  cadenceFeedback?: LotCadenceFeedback | null
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
    | 'next-event-control'
    | 'next-event-reaction'
  /** Exact identity required by the transient Stage 7 deep-return arm. */
  entryStage7ProductionId?: string
  /** Exact transient candidate identity required by the Gate deep-return arm. */
  entryGateCandidate?: GateCandidateOwnerIntent
  /** Exact accepted-greenlight receipt required by the formation return arm. */
  entryProductionFormation?: GreenlightFormationReceipt
  /** Exact pending screenplay identity required by the deep-return arm. */
  entryScriptReviewTarget?: LotScriptReviewTarget
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
  /** Dispatch the existing parameter-free Annex action through the authoritative App owner. */
  onStartDevelopmentCastingAnnex?: () => ActionOutcome
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
          reason: `Review casting for ${pending.decision.title} in the Casting Room before simming to another event.`,
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
  onNavigate,
  onExit,
  onAdvance,
  cadenceFeedback = null,
  advanceFeedback: legacyAdvanceFeedback = null,
  entryFocus,
  entryStage7ProductionId,
  entryGateCandidate,
  entryProductionFormation,
  entryScriptReviewTarget,
  entryNextEventReceipt,
  suppressOperationalAnnouncement = false,
  onOpenPublicityDashboard,
  onRunPublicity,
  onProductionCommand,
  onRunNextEventProductionCommand,
  onRunScriptReviewAction,
  onOpenScriptReviewDetails,
  onStartDevelopmentCastingAnnex,
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
}: Props) {
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
  const currentScriptReviewContext = currentLotScriptReviewContext(state)
  const nextEventScriptReviewContext =
    rawNextEventScriptReceipt === null ||
    rawNextEventScriptReceipt.target.kind !== 'script'
    ? null
    : currentLotScriptReviewContext(state, {
        projectId: rawNextEventScriptReceipt.target.projectId,
        title: rawNextEventScriptReceipt.target.title,
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
  const malformedExactNextEventReceipt =
    rawExactNextEventReceipt !== null && !exactNextEventReceiptIsClosed
      ? rawExactNextEventReceipt
      : null
  const invalidNextEventReceipt =
    malformedExactNextEventReceipt ??
    invalidNextEventProductionReceipt ??
    invalidNextEventScriptReceipt
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
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasFailed, setCanvasFailed] = useState(false)
  const [nextEventRailInputResetEpoch, setNextEventRailInputResetEpoch] = useState(0)
  const resetNextEventRailInput = useCallback(() => {
    setNextEventRailInputResetEpoch((epoch) => epoch + 1)
  }, [])
  const [reducedMotion, setReducedMotionState] = useState(prefersReducedMotion)
  const hollywood = operationHollywoodEnabled()
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
      entryFocus === 'script-review'
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
  const hollywoodCommandRef = useRef<HTMLButtonElement | null>(null)
  const hollywoodTaskStatusRef = useRef<HTMLDivElement | null>(null)
  const hollywoodStage7HeadingRef = useRef<HTMLHeadingElement | null>(null)
  const hollywoodPersonStatusRef = useRef<HTMLDivElement | null>(null)
  const formationReceiptRef = useRef<GreenlightFormationReceipt | null>(formationReceipt)
  const formationPendingFocusRef = useRef<string | null>(null)
  const formationEntryConsumedRef = useRef(false)
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
  const latestGameStateRef = useRef(state)
  latestGameStateRef.current = state
  const currentPublicityCampaign = publicityCampaignContext(snapshot)
  const currentAnnexWork = operationalAnnexWorkContext(snapshot)
  const currentGateMarket = gateHiringMarketContext(snapshot)
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
    // Only the dedicated strict review entry may create screenplay-review ownership.
    // Generic places that happen to share the semantic `writers` id cannot inherit it.
    setScriptReviewIntent(null)
    setScriptReviewActivity(null)
    scriptReviewDispatchGuardRef.current = null
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
        if (!hollywood) viewRef.current?.select('writers')
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
    if (!hollywood) viewRef.current?.select('writers')
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

  const dispatchRoute = useCallback((action: LotActionEvent['action']) => {
    if (worldInputSuspendedRef.current) return
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
        rendererStateRef.current = latestGameStateRef.current
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
            if (applyingNextEventOrientationRef.current) return
            yieldNextEventOrientation()
            clearFormationContext()
            if (sel?.buildingId === 'writers' && enterCurrentScriptReview() !== null) {
              return
            }
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
              else view?.select('expansion')
            } else if (
              hollywoodStage7DetailProductionIdRef.current !== null &&
              stage7ProductionDetailContext(latestSnapshotRef.current)?.operation.productionId ===
                hollywoodStage7DetailProductionIdRef.current
            ) {
              view?.selectHollywoodProduction?.(hollywoodStage7DetailProductionIdRef.current)
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
      if (applyNextEventPhysicalOrientation(v)) {
        // Current next-event orientation supersedes older world presentation contexts.
      } else if (formationDirectorId !== null) {
        v.selectHollywoodPerson(formationDirectorId)
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
        v.selectHollywoodSceneryLoadIn?.(sceneryProductionId)
      } else if (!publicitySelectedRef.current && annexSelectedRef.current) {
        if (hollywood) v.selectHollywoodAnnexPlace?.()
        else v.select('expansion')
      } else if (
        !publicitySelectedRef.current &&
        hollywoodStage7DetailProductionIdRef.current !== null &&
        stage7ProductionDetailContext(latestSnapshotRef.current)?.operation.productionId ===
          hollywoodStage7DetailProductionIdRef.current
      ) {
        v.selectHollywoodProduction?.(hollywoodStage7DetailProductionIdRef.current)
      }
    }
  }, [applyNextEventPhysicalOrientation, state, canvasReady, hollywood, readSnapshot])

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
      const v = viewRef.current
      if (!v) return
      if (hidden) v.pause()
      else v.resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    onVisibility()
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [cancelGateCandidateGesture, cancelHollywoodStage7Gesture, clearNextEventGesture])

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

  // Companion-nav activation: select the building AND route to its destination.
  const activate = useCallback(
    (id: BuildingId) => {
      if (worldInputSuspendedRef.current) return
      yieldNextEventOrientation()
      if (id === 'writers' && enterCurrentScriptReview() !== null) return
      if (hollywood && id === 'admin') {
        if (enterPublicityContext({
          place: null,
          paintHollywoodOutline: true,
          focus: 'first-action',
        })) return
        clearPublicityContext()
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
      clearFormationContext()
      clearHollywoodStage7DetailContext()
      clearGateContext()
      clearPublicityContext()
      clearHollywoodSceneryLoadInContext()
      clearAnnexContext()
      recordSelection(id)
      viewRef.current?.select(id)
      dispatchRoute(BUILDING_ACTION[id])
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
      enterCurrentScriptReview,
      enterHollywoodProductionContext,
      enterGateContext,
      enterPublicityContext,
      hollywood,
      recordSelection,
      yieldNextEventOrientation,
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
        return <p>Casting review · {receipt.target.title}</p>
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
                className={`hollywood-inspector${scriptReviewSurfaceContents ? ' is-script-review' : ''}${gateSelected ? ' is-gate' : ''}${publicitySelected ? ' is-publicity' : ''}${annexSelected ? ' is-annex' : ''}${selectedSceneryLoadInContext ? ' is-scenery' : ''}${hollywoodPerson ? ' is-person' : ''}`}
                data-testid={
                  scriptReviewSurfaceContents
                    ? 'lot-script-review-context'
                    : gateSelected
                    ? 'hollywood-gate-context'
                    : publicitySelected
                    ? 'hollywood-publicity-context'
                    : annexSelected
                    ? 'lot-annex-context'
                    : selectedSceneryLoadInContext
                      ? 'hollywood-scenery-load-in-context'
                      : 'hollywood-inspector'
                }
                onPointerDown={containWorldInput}
                onMouseDown={containWorldInput}
                onTouchStart={containWorldInput}
              >
                {scriptReviewSurfaceContents
                  ? scriptReviewSurfaceContents
                  : gateSelected
                  ? gateContextContents
                  : publicitySelected
                  ? publicityContextContents
                  : annexSelected
                  ? annexContextContents
                  : selectedSceneryLoadInContext
                    ? sceneryLoadInContextContents
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
                  {hollywoodCompanyMembers !== null
                    ? hollywoodCompanyMembers.map(({ company, member, person }) => {
                        const selectedPerson = hollywoodPerson?.id === person.id
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
                      })
                    : hollywoodPresentationPeople.map((person) => (
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

          {selectionInfo && !annexSelected && scriptReviewSurfaceContents === null && (
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
        </nav>
      </div>
    </div>
  )
}

export default StudioLotScreen
