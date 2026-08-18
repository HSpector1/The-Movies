// ── App root ─────────────────────────────────────────────────────────────────
// One authoritative GameState in React state at the root. Draft (ungreenlit)
// selections live inside the Assembly screen; once greenlit the engine state is
// authoritative. GameState is only ever replaced by an engine action result — never
// mutated. Screen navigation is plain state (no router, no state-management lib).
//
// The ordinary playable loop is world-first: Start/Founding → Studio Lot → inspect or
// act in the world → a deep management surface only when needed → the same Studio Lot.
// Dashboard, Assembly, release history, Talent, and Saves remain supporting surfaces.
//
// Autopsy exactness: the full autopsy needs the PRE-release studio state (the
// releasing Production — removed from activeProductions at release — plus the
// pre-tick standing). We keep, in UI state, a snapshot per film released this
// session ({ preTick, postTickStanding }). This is UI-only bookkeeping (never part
// of GameState/the save) and lets the dashboard open an EXACT autopsy for any film
// released while playing. Films present only in an imported save (released before
// this session) have no snapshot; the dashboard explains that plainly.

import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ErrorInfo, ReactNode, SetStateAction } from 'react'
import type {
  ActionOutcome,
  GameState,
  PlacementRequest,
  FilmResult,
  AutopsyView,
  AutopsyCompareView,
  FilmRecordView,
  NewspaperView,
  Standing,
  ReleaseDevelopment,
  PeriodSummary,
  SimStopReason,
  PublicityTier,
  ProductionCommandView,
  ConstructionCompletionSummary,
  FacilityMoveRequest,
  FacilityDemolitionRequest,
  CommissionScriptPayload,
  ScriptProjectsReadModel,
  StartCastingSessionPayload,
} from './engine/adapter.ts'
import {
  advanceWeek,
  advanceToNextEvent,
  acknowledgeCastingSessionAction,
  explainRelease,
  buildReleaseDevelopment,
  autopsyCompare,
  filmRecordView,
  findConcept,
  releaseNewspaper,
  talentProfile,
  runPublicity,
  runProductionCommand,
  runScriptProjectAction,
  startDevelopmentCastingAnnexAction,
  placeFacilityAction,
  moveFacilityAction,
  demolishFacilityAction,
  studioDecision,
  developmentOfficeUplift,
  studioDevelopment,
  studioPlacement,
  studioLotSnapshot,
  commissionScriptAction,
  scriptProjectsBoard,
  startCastingSessionAction,
} from './engine/adapter.ts'
import { placedFacilityIdOf } from './lot/snapshot/StudioLotSnapshot.ts'
import { filmCareerImpact, talentCareerHistory, preV5CreditCount } from './engine/careerImpact.ts'
import { TalentProfileDrawer } from './components/TalentProfileDrawer.tsx'
import { StartScreen } from './screens/StartScreen.tsx'
import { Dashboard } from './screens/Dashboard.tsx'
import { Assembly } from './screens/Assembly.tsx'
import { ScreenplayCommissionForm, WritersRoom } from './screens/WritersRoom.tsx'
import { CastingRoom } from './screens/CastingRoom.tsx'
import type { CastingSlateDraft } from './screens/CastingSlatePlanner.tsx'
import { StudioCalendar } from './screens/StudioCalendar.tsx'
import type { StudioCalendarRoute } from './screens/StudioCalendar.tsx'
import { StudioDevelopment } from './screens/StudioDevelopment.tsx'
import { ReleaseResult } from './screens/ReleaseResult.tsx'
import { Autopsy } from './screens/Autopsy.tsx'
import { TalentCreator } from './screens/TalentCreator.tsx'
import { TalentHub } from './screens/TalentHub.tsx'
import { Saves } from './screens/Saves.tsx'
import { FoundingScreen } from './screens/FoundingScreen.tsx'
import { StudioRoster } from './screens/StudioRoster.tsx'
import { HiringMarket } from './screens/HiringMarket.tsx'
import { FilmRecord } from './screens/FilmRecord.tsx'
import { NewspaperReveal } from './screens/NewspaperReveal.tsx'
import { WeeklySummary } from './screens/WeeklySummary.tsx'
import { StudioRunRecap } from './screens/StudioRunRecap.tsx'
import { saveActiveSession, loadActiveSession, clearActiveSession } from './engine/session.ts'
import { operationHollywoodEnabled, studioLotOverviewEnabled } from './flags.ts'
import type { LotRoute } from './lot/navigation.ts'
// PF1-M3 shell. Settings is a modal component, never a Screen — a Screen switch would
// unmount the Lot and tear its renderer down to change a volume. The notices are what the
// browser's own dialogs used to say, said by the studio instead.
import { AppNotice, PersistenceNotice } from './shell/AppNotice.tsx'
import { ConfirmDialog } from './shell/ConfirmDialog.tsx'
import { SettingsOverlay } from './shell/SettingsOverlay.tsx'
import { ShellDialog } from './shell/ShellDialog.tsx'
import { LotRetainedWorkspace } from './lot/LotRetainedWorkspace.tsx'
import { browserStorageAvailable } from './shell/persistence.ts'
import { useMotionDocumentAttribute, useResolvedMotion } from './shell/useResolvedMotion.ts'
import { LotPackageWorkspace } from './lot/LotPackageWorkspace.tsx'
import { LotCommissionWorkspace } from './lot/LotCommissionWorkspace.tsx'
import { LotAuditionWorkspace } from './lot/LotAuditionWorkspace.tsx'
import type { LotAuditionPlanningOrigin } from './lot/StudioLotScreen.tsx'
// Presentation-only, and deliberately NOT part of the lazy lot chunk: this module imports
// nothing but types, so App can end the lot's presentation session without pulling Phaser
// or the lot screen into the eager bundle.
import { resetLotStageAssignment } from './lot/snapshot/stageAssignment.ts'
import { resetLotSelectedBuilding } from './lot/snapshot/selectedBuildingSession.ts'
// The audio service is created on first use, inside the gesture handler below — importing
// it costs nothing and touches no browser audio API.
import { getAudioService } from './audio/audioService.ts'
// PF1-M2 punctuation. The grammar is pure and lives elsewhere; App only holds the
// single-owner gates where an authoritative receipt actually arrives.
import {
  punctuateAdvanceWeek,
  punctuateCommit,
  punctuateFormation,
  punctuateRefusal,
  punctuateSimResult,
} from './presentation/punctuate.ts'
import type { CueMotion, PresentationCue } from './presentation/eventGrammar.ts'
import { useTransientNotice } from './presentation/transientNotice.ts'
import type { LotPublicityResult } from './lot/snapshot/publicityCampaign.ts'
import {
  operationalAnnexWorkContext,
  type LotAnnexWorkOwnerIntent,
} from './lot/snapshot/annexWork.ts'
import {
  stage7ProductionDetailContext,
  type Stage7ProductionOwnerIntent,
} from './lot/snapshot/stage7Production.ts'
import {
  gateHiringCandidateContext,
  type GateCandidateOwnerIntent,
} from './lot/snapshot/gateHiring.ts'
import {
  acceptedGreenlightFormationReceipt,
  sameGreenlightFormationReceipt,
  type GreenlightFormationReceipt,
} from './lot/snapshot/productionFormation.ts'
import {
  acceptedLotNextEventConstructionCompletion,
  acceptedLotNextEventGuardNeutral,
  acceptedLotNextEventReceipt,
  currentLotNextEventProductionCommand,
  lotNextEventNeutralFeedback,
  sameLotNextEventProductionCommand,
  sameLotNextEventReceipt,
  type LotCadenceFeedback,
  type LotNextEventReceipt,
} from './lot/snapshot/nextEvent.ts'
import {
  currentLotScriptReviewContext,
  sameLotScriptReviewAction,
  sameLotScriptReviewContext,
  type LotScriptReviewAction,
  type LotScriptReviewContext,
  type LotScriptReviewTarget,
} from './lot/snapshot/scriptReview.ts'
import {
  acceptedLotCastingReviewSuccess,
  currentLotCastingReviewContext,
  sameLotCastingReviewAction,
  sameLotCastingReviewContext,
  type LotCastingReviewAction,
  type LotCastingReviewContext,
  type LotCastingReviewTarget,
} from './lot/snapshot/castingReview.ts'
import {
  acceptedScreenplayCommissionReceipt,
  type ScreenplayCommissionReceipt,
} from './lot/snapshot/scriptCommission.ts'
import {
  acceptedLotAuditionPlanningReceipt,
  currentLotAuditionPlanningContext,
  LOT_AUDITION_OPENER_TESTID,
  sameLotAuditionPlanningContext,
  lotAuditionPlanningPayload,
  type LotAuditionPlanningContext,
  type LotAuditionPlanningReceipt,
} from './lot/snapshot/auditionPlanning.ts'
import type { CastingDecisionFocusToken } from './screens/CastingRoom.tsx'
import type { DashboardFocusSection } from './screens/Dashboard.tsx'

// Gate D1: the Studio Lot overview is lazily imported so Phaser and the whole lot
// module stay out of the eager bundle. The factory only runs when <StudioLotScreen/>
// first renders, which only happens when the feature flag is on and the lot is opened.
const StudioLotScreen = lazy(() => import('./lot/StudioLotScreen.tsx'))

type OrdinaryLotEntryFocus =
  | 'studio-home'
  | 'selected-building'
  | 'advance-week'
  | 'publicity-campaign'
  | 'annex-work'
  | 'gate-arrivals'
  | 'next-event-control'

type StudioReturnContext =
  | { kind: 'dashboard' }
  | {
      kind: 'lot'
      focus: OrdinaryLotEntryFocus
      suppressOperationalAnnouncement: boolean
    }
  | {
      kind: 'lot'
      focus: 'stage-7-production'
      productionId: string
      suppressOperationalAnnouncement: boolean
    }
  | {
      kind: 'lot'
      focus: 'gate-candidate'
      candidate: GateCandidateOwnerIntent
      suppressOperationalAnnouncement: boolean
    }
  | {
      kind: 'lot'
      focus: 'script-review'
      target: LotScriptReviewTarget
      suppressOperationalAnnouncement: boolean
    }
  | {
      kind: 'lot'
      focus: 'casting-review'
      target: LotCastingReviewTarget
      suppressOperationalAnnouncement: boolean
    }
  | {
      kind: 'lot'
      focus: 'next-event-reaction'
      receipt: LotNextEventReceipt
      suppressOperationalAnnouncement: boolean
    }

type StudioActionSource = 'mounted-lot' | 'supporting-dashboard'

const DASHBOARD_RETURN_CONTEXT: StudioReturnContext = { kind: 'dashboard' }

function withoutTransientWorldReturnIntent(context: StudioReturnContext): StudioReturnContext {
  if (context.kind !== 'lot') return context
  if (context.focus === 'stage-7-production') {
    return {
      kind: 'lot',
      focus: 'studio-home',
      suppressOperationalAnnouncement: context.suppressOperationalAnnouncement,
    }
  }
  if (context.focus === 'gate-candidate') {
    return {
      kind: 'lot',
      focus: 'gate-arrivals',
      suppressOperationalAnnouncement: context.suppressOperationalAnnouncement,
    }
  }
  if (context.focus === 'next-event-reaction') {
    return {
      kind: 'lot',
      focus: 'studio-home',
      suppressOperationalAnnouncement: context.suppressOperationalAnnouncement,
    }
  }
  return context.focus === 'publicity-campaign' || context.focus === 'annex-work'
    ? { ...context, focus: 'selected-building' }
    : context
}

function annexProjectChildReturnContext(
  context: StudioReturnContext,
  focusedProjectId: string | undefined,
  childProjectId: string,
): StudioReturnContext {
  return context.kind === 'lot' &&
    context.focus === 'annex-work' &&
    focusedProjectId !== childProjectId
    ? withoutTransientWorldReturnIntent(context)
    : context
}

type Screen =
  | { kind: 'start' }
  | { kind: 'founding' }
  | {
      kind: 'dashboard'
      returnContext: StudioReturnContext
      focusProductionId?: string
      focusRunId?: string
      focusSection?: DashboardFocusSection
      focusDashboard?: boolean
    }
  | {
      kind: 'roster'
      returnContext: StudioReturnContext
      focusTalentId?: string
      focusHeadingOnMount?: boolean
    }
  | { kind: 'hiring'; returnContext: StudioReturnContext; focusTalentId?: string }
  | { kind: 'writersRoom'; returnContext: StudioReturnContext; focusProjectId?: string }
  | {
      kind: 'castingRoom'
      returnContext: StudioReturnContext
      scriptProjectId?: string
      focusProjectId?: string
      focusCastingDecision?: CastingDecisionFocusToken
    }
  | { kind: 'calendar'; returnContext: StudioReturnContext }
  | { kind: 'studioDevelopment'; returnContext: StudioReturnContext }
  | { kind: 'assembly'; returnContext: StudioReturnContext; scriptProjectId?: string }
  | {
      kind: 'release'
      preTick: GameState
      postTickStanding: Standing
      released: FilmResult[]
      development: ReleaseDevelopment[]
      constructionCompletion: ConstructionCompletionSummary | null
      returnContext: StudioReturnContext
    }
  | {
      // D-11.C PART 2: the newspaper front page shown ONCE at release. `source` records
      // whether this is the live release reveal (Continue → the release/development
      // summary) or a re-opened historic clipping (Continue → dashboard). `films` are the
      // released FilmResults aligned index-for-index with `views`, so "open autopsy" on a
      // clipping routes to the exact per-film autopsy. `release` carries the post-tick
      // release payload so the live reveal can hand off to the existing ReleaseResult.
      kind: 'newspaper'
      source: 'release' | 'clipping'
      views: NewspaperView[]
      films: FilmResult[]
      constructionCompletion: ConstructionCompletionSummary | null
      returnContext: StudioReturnContext
      release?: {
        preTick: GameState
        postTickStanding: Standing
        released: FilmResult[]
        development: ReleaseDevelopment[]
        constructionCompletion: ConstructionCompletionSummary | null
        returnContext: StudioReturnContext
      }
    }
  | {
      kind: 'autopsy'
      view: AutopsyView
      compare: AutopsyCompareView | null
      returnContext: StudioReturnContext
    }
  | { kind: 'filmRecord'; view: FilmRecordView; returnContext: StudioReturnContext }
  | {
      // D-12.18: "Sim to next event" stopped on a non-release event. The aggregate cash
      // movement over the weeks advanced + why it stopped. (Releases route to newspaper.)
      kind: 'periodSummary'
      summary: PeriodSummary
      stopReason: SimStopReason
      stopMessage: string
      weeks: number
      cashNow: number
      constructionCompletion: ConstructionCompletionSummary | null
      returnContext: StudioReturnContext
    }
  | {
      kind: 'talent'
      returnTo: 'dashboard' | 'founding' | 'hiring'
      returnContext: StudioReturnContext
    }
  | { kind: 'hub'; returnContext: StudioReturnContext }
  | { kind: 'saves'; returnContext: StudioReturnContext }
  | { kind: 'recap'; returnContext: StudioReturnContext } // D-15: read-only Studio Run Recap
  | { kind: 'lot'; entryFocus: OrdinaryLotEntryFocus }
  | {
      kind: 'lot'
      entryFocus: 'stage-7-production'
      entryStage7ProductionId: string
    }
  | {
      kind: 'lot'
      entryFocus: 'gate-candidate'
      entryGateCandidate: GateCandidateOwnerIntent
    }
  | {
      kind: 'lot'
      entryFocus: 'production-formation'
      entryProductionFormation: GreenlightFormationReceipt
    } // Studio Home V1: primary world surface
  | {
      kind: 'lot'
      entryFocus: 'script-review'
      entryScriptReviewTarget: LotScriptReviewTarget
    }
  | {
      kind: 'lot'
      entryFocus: 'casting-review'
      entryCastingReviewTarget: LotCastingReviewTarget
    }
  | {
      kind: 'lot'
      entryFocus: 'next-event-reaction'
      entryNextEventReceipt: LotNextEventReceipt
    }

type LotScreen = Extract<Screen, { kind: 'lot' }>

type LotPackageWorkspaceBase = {
  identity: object
  key: number
  lotScreen: LotScreen
  lotPresentation: object
  scriptProjectId: string
  title: string
  opener: HTMLElement | null
}

type LotPackageWorkspaceSession =
  | (LotPackageWorkspaceBase & {
      phase: 'editing'
      acceptedState: GameState
    })
  | (LotPackageWorkspaceBase & {
      phase: 'committed'
      before: GameState
      next: GameState
      formationReceipt: GreenlightFormationReceipt | null
    })

type LiveFormationPresentation = {
  identity: object
  acceptedState: GameState
  lotScreen: LotScreen
  lotPresentation: object
  receipt: GreenlightFormationReceipt
}

type LotPackagePresentationState = {
  workspace: LotPackageWorkspaceSession | null
  liveFormation: LiveFormationPresentation | null
}

type LotCommissionWorkspaceBase = {
  identity: object
  key: number
  lotScreen: LotScreen
  lotPresentation: object
  opener: HTMLElement | null
}

type LotCommissionWorkspaceSession =
  | (LotCommissionWorkspaceBase & {
      phase: 'editing'
      acceptedState: GameState
    })
  | (LotCommissionWorkspaceBase & {
      phase: 'committed'
      before: GameState
      next: GameState
      title: string
      receipt: ScreenplayCommissionReceipt | null
    })

type LiveCommissionPresentation = {
  identity: object
  acceptedState: GameState
  lotScreen: LotScreen
  lotPresentation: object
  receipt: ScreenplayCommissionReceipt
}

type LotCommissionPresentationState = {
  workspace: LotCommissionWorkspaceSession | null
  liveReceipt: LiveCommissionPresentation | null
}

type LotAuditionWorkspaceBase = {
  identity: object
  key: number
  lotScreen: LotScreen
  lotPresentation: object
  context: LotAuditionPlanningContext
  opener: HTMLElement | null
}

type LotAuditionWorkspaceSession =
  | (LotAuditionWorkspaceBase & {
      phase: 'editing'
      acceptedState: GameState
      slateRevision: number
      slate: CastingSlateDraft
    })
  | (LotAuditionWorkspaceBase & {
      phase: 'committed'
      before: GameState
      next: GameState
      receipt: LotAuditionPlanningReceipt | null
    })

type EditingLotAuditionWorkspace = Extract<
  LotAuditionWorkspaceSession,
  { phase: 'editing' }
>

type LiveAuditionPresentation = {
  identity: object
  acceptedState: GameState
  lotScreen: LotScreen
  lotPresentation: object
  receipt: LotAuditionPlanningReceipt
}

type LotAuditionPresentationState = {
  workspace: LotAuditionWorkspaceSession | null
  liveReceipt: LiveAuditionPresentation | null
}

const LOT_AUDITION_ATTENTION = new Set([
  'normal',
  'active',
  'positive',
  'warning',
  'decision-required',
  'empty',
  'future',
  'recently-completed',
])

/**
 * Accept exactly one retained-planner origin, for exactly one declared opener kind.
 *
 * Two controls may open the planner and each proves ITSELF — the companion rail row, and
 * the Casting building inspector's own "Plan auditions" verb. The arms are mirrored
 * one-for-one: connected, enabled, unique-in-document opener; the live attention equal to
 * the cue's; and a cue node whose text ends with the cue's reason. The inspector arm
 * additionally proves the ONE panel that owns the verb, because that panel — not the
 * button — is where the building's attention and reason are painted.
 *
 * This is a second accepted opener, never a weaker one: nothing the companion arm proved
 * before is proven less now.
 */
const LOT_AUDITION_OPENER_KINDS = new Set(['companion', 'inspector'])

function exactLotAuditionPlanningOrigin(
  value: LotAuditionPlanningOrigin,
): value is LotAuditionPlanningOrigin {
  if (
    typeof value !== 'object' ||
    value === null ||
    Reflect.ownKeys(value).length !== 3 ||
    !Object.prototype.hasOwnProperty.call(value, 'openerKind') ||
    !Object.prototype.hasOwnProperty.call(value, 'opener') ||
    !Object.prototype.hasOwnProperty.call(value, 'cue') ||
    typeof value.openerKind !== 'string' ||
    !LOT_AUDITION_OPENER_KINDS.has(value.openerKind) ||
    !(value.opener instanceof HTMLButtonElement) ||
    !value.opener.isConnected ||
    value.opener.disabled
  ) return false
  const testId = LOT_AUDITION_OPENER_TESTID[value.openerKind]
  if (
    value.opener.getAttribute('data-testid') !== testId ||
    value.opener !== document.querySelector(`[data-testid="${testId}"]`)
  ) return false
  const cue = value.cue
  if (
    typeof cue !== 'object' ||
    cue === null ||
    Reflect.ownKeys(cue).length !== 4 ||
    cue.buildingId !== 'casting' ||
    cue.action !== 'browse-talent' ||
    typeof cue.attention !== 'string' ||
    !LOT_AUDITION_ATTENTION.has(cue.attention) ||
    typeof cue.reason !== 'string' ||
    cue.reason.trim().length === 0
  ) return false
  // The node that carries this opener's live attention + reason evidence.
  let evidenceRoot: Element | null = value.opener
  let cueSelector = '[data-testid="lot-nav-casting-state"]'
  if (value.openerKind === 'inspector') {
    const panel = value.opener.closest('[data-testid="lot-building-inspector-casting"]')
    evidenceRoot =
      panel !== null &&
      panel === document.querySelector('[data-testid="lot-building-inspector-casting"]')
        ? panel
        : null
    cueSelector = '[data-testid="lot-building-inspector-attention"]'
  }
  if (evidenceRoot === null || evidenceRoot.getAttribute('data-attention') !== cue.attention) {
    return false
  }
  const cueNode = evidenceRoot.querySelector(cueSelector)
  const cueText = cueNode?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  return cueNode !== null && cueText.endsWith(cue.reason)
}

const LOT_AUDITION_DRAFT_ROLES = ['lead', 'antagonist', 'support'] as const

function closedLotAuditionDraft(
  context: LotAuditionPlanningContext,
  value: unknown,
): CastingSlateDraft | null {
  try {
    if (
      typeof value !== 'object' ||
      value === null ||
      Array.isArray(value) ||
      (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    ) return null
    const record = value as Record<PropertyKey, unknown>
    const keys = Reflect.ownKeys(record)
    if (
      keys.length !== LOT_AUDITION_DRAFT_ROLES.length ||
      !LOT_AUDITION_DRAFT_ROLES.every((role) =>
        Object.prototype.hasOwnProperty.call(record, role),
      )
    ) return null

    const draft = {} as CastingSlateDraft
    for (const role of LOT_AUDITION_DRAFT_ROLES) {
      const roleDescriptor = Object.getOwnPropertyDescriptor(record, role)
      if (
        roleDescriptor === undefined ||
        !('value' in roleDescriptor) ||
        !roleDescriptor.enumerable
      ) return null
      const pair = roleDescriptor.value
      if (!Array.isArray(pair) || pair.length > 2) return null
      const pairKeys = Reflect.ownKeys(pair)
      if (
        pairKeys.length !== pair.length + 1 ||
        !pairKeys.includes('length') ||
        !pair.every((id, index) => {
          const descriptor = Object.getOwnPropertyDescriptor(pair, String(index))
          return descriptor !== undefined &&
            'value' in descriptor &&
            descriptor.enumerable &&
            typeof id === 'string' &&
            id.trim().length > 0 &&
            context.project.candidates[role].some(
              (candidate) => candidate.available && candidate.id === id,
            )
        }) ||
        new Set(pair).size !== pair.length
      ) return null
      draft[role] = [...pair]
    }
    return draft
  } catch {
    return null
  }
}

function sameLotAuditionDraft(
  context: LotAuditionPlanningContext,
  left: unknown,
  right: unknown,
): boolean {
  const closedLeft = closedLotAuditionDraft(context, left)
  const closedRight = closedLotAuditionDraft(context, right)
  return closedLeft !== null && closedRight !== null &&
    LOT_AUDITION_DRAFT_ROLES.every((role) =>
      closedLeft[role].length === closedRight[role].length &&
      closedLeft[role].every((id, index) => id === closedRight[role][index]),
    )
}

function oneLotAuditionToggle(before: readonly string[], after: readonly string[]): boolean {
  if (Math.abs(before.length - after.length) !== 1) return false
  const longer = before.length > after.length ? before : after
  const shorter = before.length > after.length ? after : before
  return longer.some((_, removedIndex) =>
    shorter.every((id, index) => id === longer[index < removedIndex ? index : index + 1]),
  )
}

function genuineLotAuditionDraftChange(
  context: LotAuditionPlanningContext,
  before: unknown,
  after: unknown,
): CastingSlateDraft | null {
  const closedBefore = closedLotAuditionDraft(context, before)
  const closedAfter = closedLotAuditionDraft(context, after)
  if (closedBefore === null || closedAfter === null) return null
  const changedRoles = LOT_AUDITION_DRAFT_ROLES.filter((role) =>
    closedBefore[role].length !== closedAfter[role].length ||
    closedBefore[role].some((id, index) => id !== closedAfter[role][index]),
  )
  if (
    changedRoles.length !== 1 ||
    !oneLotAuditionToggle(closedBefore[changedRoles[0]!], closedAfter[changedRoles[0]!])
  ) return null
  return closedAfter
}

function RetainedScreenplayCommissionForm({
  board,
  officeUplift,
  onSubmit,
  onClose,
}: {
  board: ScriptProjectsReadModel
  /** C1-M5: the standing development office's uplift, from the accepted state. */
  officeUplift: { name: string; points: number } | null
  onSubmit: (payload: CommissionScriptPayload) => ActionOutcome
  onClose: () => void
}) {
  const [error, setError] = useState('')
  return (
    <>
      <ScreenplayCommissionForm
        board={board}
        officeUplift={officeUplift}
        onSubmit={onSubmit}
        onClose={onClose}
        onError={setError}
      />
      {error && (
        <div className="errbox" role="alert" data-testid="lot-commission-workspace-error">
          {error}
        </div>
      )}
    </>
  )
}

function clearNextEventReturnIntent(
  context: StudioReturnContext,
): StudioReturnContext {
  return context.kind === 'lot' && context.focus === 'next-event-reaction'
    ? {
        kind: 'lot',
        focus: 'studio-home',
        suppressOperationalAnnouncement: context.suppressOperationalAnnouncement,
      }
    : context
}

function operationalAnnexAnnouncementAlreadyOwned(state: GameState): boolean {
  try {
    return studioDevelopment(state).status === 'operational'
  } catch {
    // Presentation suppression must never turn an adapter failure into a new state claim.
    return false
  }
}

function clearNextEventScreenIntent(current: Screen): Screen {
  if (current.kind === 'lot') {
    return current.entryFocus === 'next-event-reaction'
      ? { kind: 'lot', entryFocus: 'studio-home' }
      : current
  }
  if (!('returnContext' in current)) return current

  const returnContext = clearNextEventReturnIntent(current.returnContext)
  if (current.kind === 'newspaper' && current.release !== undefined) {
    const releaseReturnContext = clearNextEventReturnIntent(
      current.release.returnContext,
    )
    if (
      returnContext === current.returnContext &&
      releaseReturnContext === current.release.returnContext
    ) return current
    return {
      ...current,
      returnContext,
      release: { ...current.release, returnContext: releaseReturnContext },
    }
  }
  return returnContext === current.returnContext
    ? current
    : { ...current, returnContext } as Screen
}

function operatingStudioHome(lotEnabled: boolean): Screen {
  return lotEnabled
    ? { kind: 'lot', entryFocus: 'studio-home' }
    : { kind: 'dashboard', returnContext: DASHBOARD_RETURN_CONTEXT }
}

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
  // D-12 session recovery: on FIRST mount, restore the active-session autosave (through the same
  // validate/migrate path as a manual load) BEFORE offering a new game — so a browser refresh, HMR
  // reload, or dev-server restart never discards a valid studio. Runs exactly once (lazy initializer).
  const [restore] = useState(loadActiveSession)
  // Studio Home V1: freeze the environment/session gate once. A founded ordinary-player
  // session starts in the living world; an explicit rollback keeps the legacy Dashboard root.
  const [lotEnabled] = useState(studioLotOverviewEnabled)
  // Production Formation is a Hollywood person-selected presentation, not a classic-Lot
  // capability. Freeze its independent rollback gate at the same session boundary.
  const [hollywoodEnabled] = useState(operationHollywoodEnabled)
  const [state, setState] = useState<GameState | null>(restore.ok ? restore.state : null)
  const latestStateRef = useRef<GameState | null>(state)
  latestStateRef.current = state
  // Logical screen identity alone cannot prove that its Lot child is still alive. The mounted
  // child claims one opaque token below and clears it synchronously on root/error-boundary teardown.
  const activeLotPresentationRef = useRef<object | null>(null)
  // D-14 Phase 2: the ONE Talent Profile drawer, openable over any screen from the roster,
  // Assemble a Film, or Autopsy. Null = closed. Focus returns to the opener on close.
  const [openProfileId, setOpenProfileId] = useState<string | null>(null)
  // The Studio Lot becomes inert while the App-owned drawer is open. Capture its opener
  // synchronously, before that inert transition can blur the world control, then restore only
  // after the closing render has made the world interactive again. The drawer retains its own
  // standalone fallback for non-App consumers.
  const profileOpenerRef = useRef<HTMLElement | null>(null)
  const profileWasOpenRef = useRef(false)
  const profileRestoreEpochRef = useRef(0)
  const latestOpenProfileIdRef = useRef<string | null>(openProfileId)
  latestOpenProfileIdRef.current = openProfileId
  const openTalentProfile = useCallback((personId: string) => {
    profileRestoreEpochRef.current += 1
    const active = typeof document === 'undefined' ? null : document.activeElement
    profileOpenerRef.current = active instanceof HTMLElement ? active : null
    latestOpenProfileIdRef.current = personId
    setOpenProfileId(personId)
  }, [])
  const closeTalentProfile = useCallback(() => {
    setOpenProfileId(null)
  }, [])
  const closeTalentProfileIfOpen = useCallback((personId: string) => {
    setOpenProfileId((current) => current === personId ? null : current)
  }, [])
  const clearTalentProfileWithoutFocusRestore = useCallback(() => {
    profileRestoreEpochRef.current += 1
    profileOpenerRef.current = null
    setOpenProfileId(null)
  }, [])
  const [screen, setScreenState] = useState<Screen>(
    restore.ok
      ? restore.state.founding !== null
        ? { kind: 'founding' }
        : operatingStudioHome(lotEnabled)
      : { kind: 'start' },
  )
  // World-first retained Package is independent of Screen navigation. Keeping its session and
  // one-shot live formation input in one state object makes workspace-close/world-resume atomic.
  const [lotPackagePresentation, setLotPackagePresentationState] =
    useState<LotPackagePresentationState>({ workspace: null, liveFormation: null })
  const latestLotPackagePresentationRef = useRef(lotPackagePresentation)
  latestLotPackagePresentationRef.current = lotPackagePresentation
  const lotPackageKeyRef = useRef(0)
  const commitLotPackagePresentation = useCallback((
    next: SetStateAction<LotPackagePresentationState>,
  ) => {
    const previous = latestLotPackagePresentationRef.current
    const resolved = typeof next === 'function'
      ? (next as (current: LotPackagePresentationState) => LotPackagePresentationState)(previous)
      : next
    latestLotPackagePresentationRef.current = resolved
    setLotPackagePresentationState(resolved)
  }, [])
  const clearLotPackagePresentation = useCallback(() => {
    const current = latestLotPackagePresentationRef.current
    if (current.workspace === null && current.liveFormation === null) return
    commitLotPackagePresentation({ workspace: null, liveFormation: null })
  }, [commitLotPackagePresentation])
  // Commissioning is a separate, narrower retained authority. Package tokens can never
  // authorize it, and clearing either presentation cannot leave a stale submit claim alive.
  const [lotCommissionPresentation, setLotCommissionPresentationState] =
    useState<LotCommissionPresentationState>({ workspace: null, liveReceipt: null })
  const latestLotCommissionPresentationRef = useRef(lotCommissionPresentation)
  latestLotCommissionPresentationRef.current = lotCommissionPresentation
  const lotCommissionKeyRef = useRef(0)
  const lotCommissionActivationRef = useRef<{
    workspace: LotCommissionWorkspaceSession
    payload: CommissionScriptPayload
  } | null>(null)
  const lotCommissionRejectedAttemptRef = useRef<{
    workspace: LotCommissionWorkspaceSession
    state: GameState
    payloadSignature: string
    error: string
  } | null>(null)
  const commitLotCommissionPresentation = useCallback((
    next: SetStateAction<LotCommissionPresentationState>,
  ) => {
    const previous = latestLotCommissionPresentationRef.current
    const resolved = typeof next === 'function'
      ? (next as (
          current: LotCommissionPresentationState,
        ) => LotCommissionPresentationState)(previous)
      : next
    latestLotCommissionPresentationRef.current = resolved
    setLotCommissionPresentationState(resolved)
  }, [])
  const clearLotCommissionPresentation = useCallback(() => {
    lotCommissionActivationRef.current = null
    lotCommissionRejectedAttemptRef.current = null
    const current = latestLotCommissionPresentationRef.current
    if (current.workspace === null && current.liveReceipt === null) return
    commitLotCommissionPresentation({ workspace: null, liveReceipt: null })
  }, [commitLotCommissionPresentation])
  // Audition planning is a third, independent retained authority. Its monotonic slate revision
  // makes a genuine candidate edit the only retry boundary after one exact Engine rejection.
  const [lotAuditionPresentation, setLotAuditionPresentationState] =
    useState<LotAuditionPresentationState>({ workspace: null, liveReceipt: null })
  const latestLotAuditionPresentationRef = useRef(lotAuditionPresentation)
  latestLotAuditionPresentationRef.current = lotAuditionPresentation
  const lotAuditionKeyRef = useRef(0)
  const lotAuditionActivationRef = useRef<{
    workspace: EditingLotAuditionWorkspace
    state: GameState
    revision: number
    payload: StartCastingSessionPayload
  } | null>(null)
  const lotAuditionRejectedAttemptRef = useRef<{
    workspace: EditingLotAuditionWorkspace
    state: GameState
    revision: number
    payloadSignature: string
    error: string
  } | null>(null)
  const commitLotAuditionPresentation = useCallback((
    next: SetStateAction<LotAuditionPresentationState>,
  ) => {
    const previous = latestLotAuditionPresentationRef.current
    const resolved = typeof next === 'function'
      ? (next as (
          current: LotAuditionPresentationState,
        ) => LotAuditionPresentationState)(previous)
      : next
    latestLotAuditionPresentationRef.current = resolved
    setLotAuditionPresentationState(resolved)
  }, [])
  const clearLotAuditionPresentation = useCallback(() => {
    lotAuditionActivationRef.current = null
    lotAuditionRejectedAttemptRef.current = null
    const current = latestLotAuditionPresentationRef.current
    if (current.workspace === null && current.liveReceipt === null) return
    commitLotAuditionPresentation({ workspace: null, liveReceipt: null })
  }, [commitLotAuditionPresentation])
  // Screen ownership is part of Lot command authority. Keep the latest scheduled screen
  // synchronously visible to retained world callbacks: React may not have rendered a route
  // change yet when a delayed pointer/touch tail invokes an old Lot closure.
  const latestScreenRef = useRef<Screen>(screen)
  latestScreenRef.current = screen
  const setScreen = useCallback((next: SetStateAction<Screen>) => {
    const previous = latestScreenRef.current
    const resolved = typeof next === 'function'
      ? (next as (current: Screen) => Screen)(previous)
      : next
    if (resolved !== previous) {
      activeLotPresentationRef.current = null
      clearLotPackagePresentation()
      clearLotCommissionPresentation()
      clearLotAuditionPresentation()
    }
    latestScreenRef.current = resolved
    setScreenState(resolved)
  }, [
    clearLotAuditionPresentation,
    clearLotCommissionPresentation,
    clearLotPackagePresentation,
  ])
  const lotPresentationToken = useMemo<object | null>(
    () => screen.kind === 'lot' ? {} : null,
    [screen],
  )
  const mountLotPresentation = useCallback(() => {
    const token = lotPresentationToken
    if (token === null) return () => {}
    activeLotPresentationRef.current = token
    return () => {
      if (activeLotPresentationRef.current === token) {
        activeLotPresentationRef.current = null
      }
      const presentation = latestLotPackagePresentationRef.current
      const commission = latestLotCommissionPresentationRef.current
      const audition = latestLotAuditionPresentationRef.current
      if (
        presentation.workspace?.lotPresentation === token ||
        presentation.liveFormation?.lotPresentation === token
      ) {
        commitLotPackagePresentation({ workspace: null, liveFormation: null })
      }
      if (
        commission.workspace?.lotPresentation === token ||
        commission.liveReceipt?.lotPresentation === token
      ) {
        lotCommissionActivationRef.current = null
        lotCommissionRejectedAttemptRef.current = null
        commitLotCommissionPresentation({ workspace: null, liveReceipt: null })
      }
      if (
        audition.workspace?.lotPresentation === token ||
        audition.liveReceipt?.lotPresentation === token
      ) {
        lotAuditionActivationRef.current = null
        lotAuditionRejectedAttemptRef.current = null
        commitLotAuditionPresentation({ workspace: null, liveReceipt: null })
      }
    }
  }, [
    commitLotAuditionPresentation,
    commitLotCommissionPresentation,
    commitLotPackagePresentation,
    lotPresentationToken,
  ])
  // What the shell says about how this session opened.
  //
  // PF1-M3 — HONESTY (Owner-approved): a routine reload of a same-format session is not a
  // rescue and must not be announced as one. It gets a quiet continuation line. The word
  // "recover" belongs to the ONE case that earned it — a payload that failed validation and
  // was quarantined. (The separate "older save upgraded" card keeps its own message: a
  // migration genuinely happened and the player may want a copy in the current format.)
  const [recovery, setRecovery] = useState<{ kind: 'continuing'; week: number } | { kind: 'corrupt' } | null>(
    restore.ok
      ? { kind: 'continuing', week: restore.state.market.tick }
      : restore.reason === 'corrupt'
        ? { kind: 'corrupt' }
        : null,
  )
  // One-session acknowledgement for an accepted older save. Saves reports only whether
  // migration occurred; App owns this notice because the successful load immediately
  // navigates away from (and unmounts) the Saves screen.
  const [saveMigrationNotice, setSaveMigrationNotice] = useState(restore.ok && restore.converted)
  // productionId → pre-release snapshot, for exact autopsy of session releases. Session-only
  // (never in the save). Durable Film Chronicle navigation is a separate persisted-data path.
  const [snapshots, setSnapshots] = useState<Record<string, ReleaseSnapshot>>({})
  // One mutually-exclusive Lot cadence channel. Week and next-event feedback are UI-session only;
  // the separately retained exact successor object is the non-serialized provenance boundary for
  // receipt-bearing deep returns.
  const [lotCadenceFeedback, setLotCadenceFeedback] = useState<LotCadenceFeedback | null>(null)
  const lotNextEventSessionRef = useRef<{
    acceptedState: GameState
    receipt: LotNextEventReceipt
  } | null>(null)
  const lotNextEventActivationRef = useRef<GameState | null>(null)
  const lotScriptReviewActivationRef = useRef<{
    renderedState: GameState
    context: LotScriptReviewContext
    action: LotScriptReviewAction
    source:
      | { kind: 'pending' }
      | {
          kind: 'event'
          session: { acceptedState: GameState; receipt: LotNextEventReceipt }
          receipt: LotNextEventReceipt
        }
  } | null>(null)
  const lotCastingReviewActivationRef = useRef<{
    renderedState: GameState
    context: LotCastingReviewContext
    action: LotCastingReviewAction
    source:
      | { kind: 'pending' }
      | {
          kind: 'event'
          session: { acceptedState: GameState; receipt: LotNextEventReceipt }
          receipt: LotNextEventReceipt
        }
  } | null>(null)
  const lotCastingPackageHandoffRef = useRef<{
    before: GameState
    next: GameState
    lotScreen: Extract<Screen, { kind: 'lot' }>
    lotPresentation: object
    context: LotCastingReviewContext
    action: LotCastingReviewAction
    returnContext: StudioReturnContext
    opener: HTMLElement | null
  } | null>(null)
  const [lotOperationalAnnouncementSuppressed, setLotOperationalAnnouncementSuppressed] =
    useState(false)

  // ── PF1-M2: the transient-notice epoch and the punctuation hand-off ──────────
  //
  // Both are PRESENTATION STATE and nothing else: they are not in `GameState`, they never
  // reach a save file, and no engine code can read them. `noticeEpoch` advances once per
  // authoritative state replacement — that is the definition of "the player did something
  // else", and it is what expires a receipt strip that would otherwise sit under the world
  // for the rest of the session. `lotPunctuation` carries the motion strength the cue
  // grammar chose, so the Lot animates its EXISTING notice DOM without inventing an event
  // of its own.
  const [noticeEpoch, setNoticeEpoch] = useState(0)
  const bumpNoticeEpoch = useCallback(() => {
    setNoticeEpoch((epoch) => epoch + 1)
  }, [])
  const [lotPunctuation, setLotPunctuation] = useState<
    { key: number; motion: CueMotion } | null
  >(null)
  const punctuationKeyRef = useRef(0)
  // Strongest motion wins: a co-tick completion beside a release must not downgrade the
  // release's held beat. `none` is silence for the eyes and never disturbs a live one.
  const applyPunctuation = useCallback((cues: PresentationCue[]) => {
    const motion: CueMotion = cues.some((c) => c.motion === 'held-beat')
      ? 'held-beat'
      : cues.some((c) => c.motion === 'emphasis')
        ? 'emphasis'
        : cues.some((c) => c.motion === 'count-up')
          ? 'count-up'
          : 'none'
    if (motion === 'none') return
    punctuationKeyRef.current += 1
    setLotPunctuation({ key: punctuationKeyRef.current, motion })
  }, [])

  // ── PF1-M3: the shell. Presentation state, all of it. ────────────────────────
  //
  // `appNotice` is what `alert()` used to be — one refusal at a time, in the studio's voice,
  // carrying its own serial so a repeat of the SAME sentence still reads as a new notice.
  // `settingsOpen` and `confirmNewGame` are modal hosts, not routes: neither may unmount the
  // Lot, and neither is ever restored from anything.
  const [appNotice, setAppNotice] = useState<{ key: number; message: string } | null>(null)
  const noticeKeyRef = useRef(0)
  const showNotice = useCallback((message: string) => {
    noticeKeyRef.current += 1
    setAppNotice({ key: noticeKeyRef.current, message })
  }, [])
  const dismissNotice = useCallback(() => setAppNotice(null), [])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmNewGame, setConfirmNewGame] = useState(false)

  // The resolved motion signal, published once on the document element. Every promoted
  // `:root[data-motion="reduced"]` rule reads it; the mounted Lot resolves the same two
  // inputs itself rather than trusting a prop it can also be mounted without.
  const motion = useResolvedMotion()
  useMotionDocumentAttribute(motion.resolved)

  // AUTOSAVE FAILURE IS NEVER SILENT (PF1-M3 Owner addendum). One status, one notice.
  // Seeded from the storage probe so private mode is known before the first write, then
  // driven by the return value of every autosave. Cleared automatically the moment a later
  // autosave succeeds — the notice is a live condition, not a logged event.
  const [persistenceOk, setPersistenceOk] = useState(browserStorageAvailable)

  const replaceAuthoritativeState = useCallback((next: GameState | null) => {
    bumpNoticeEpoch()
    lotNextEventSessionRef.current = null
    lotNextEventActivationRef.current = null
    lotScriptReviewActivationRef.current = null
    lotCastingReviewActivationRef.current = null
    lotCastingPackageHandoffRef.current = null
    clearLotPackagePresentation()
    clearLotCommissionPresentation()
    clearLotAuditionPresentation()
    latestStateRef.current = next
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen(clearNextEventScreenIntent)
    setState(next)
  }, [
    bumpNoticeEpoch,
    clearLotAuditionPresentation,
    clearLotCommissionPresentation,
    clearLotPackagePresentation,
    setScreen,
  ])

  // A non-release Lot-native cadence successor must stay inside the exact mounted Lot host.
  // Keep this boundary separate from ordinary whole-state replacement: even an identity-returning
  // setScreen updater would still violate the frozen no-screen-mutation contract for this path.
  const replaceMountedLotAuthoritativeState = useCallback((next: GameState) => {
    bumpNoticeEpoch()
    lotNextEventSessionRef.current = null
    lotNextEventActivationRef.current = null
    lotScriptReviewActivationRef.current = null
    lotCastingReviewActivationRef.current = null
    lotCastingPackageHandoffRef.current = null
    clearLotPackagePresentation()
    clearLotCommissionPresentation()
    clearLotAuditionPresentation()
    latestStateRef.current = next
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setState(next)
  }, [
    bumpNoticeEpoch,
    clearLotAuditionPresentation,
    clearLotCommissionPresentation,
    clearLotPackagePresentation,
  ])

  const restoreRetainedPackageFocus = useCallback((
    workspace: LotPackageWorkspaceBase,
    allowExactOpener: boolean,
  ) => {
    const restore = () => {
      const presentation = latestLotPackagePresentationRef.current
      if (
        presentation.workspace !== null ||
        latestOpenProfileIdRef.current !== null ||
        latestScreenRef.current !== workspace.lotScreen ||
        activeLotPresentationRef.current !== workspace.lotPresentation
      ) return
      const exactSuccess = Array.from(
        document.querySelectorAll<HTMLElement>('[data-testid="lot-casting-review-success"]'),
      ).find((candidate) => candidate.dataset.projectId === workspace.scriptProjectId)
      const candidates = [
        allowExactOpener ? workspace.opener : null,
        exactSuccess?.querySelector<HTMLElement>('h3') ?? null,
        document.querySelector<HTMLElement>('[data-testid="lot-studio-heading"]'),
      ]
      const target = candidates.find(
        (candidate): candidate is HTMLElement =>
          candidate !== null &&
          candidate.isConnected &&
          candidate.closest('[inert]') === null,
      )
      target?.focus({ preventScroll: true })
    }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(restore)
    else queueMicrotask(restore)
  }, [])

  const restoreRetainedCommissionFocus = useCallback((
    workspace: LotCommissionWorkspaceBase,
    allowExactOpener: boolean,
  ) => {
    const restore = () => {
      const presentation = latestLotCommissionPresentationRef.current
      if (
        presentation.workspace !== null ||
        presentation.liveReceipt !== null ||
        latestLotPackagePresentationRef.current.workspace !== null ||
        latestOpenProfileIdRef.current !== null ||
        latestScreenRef.current !== workspace.lotScreen ||
        activeLotPresentationRef.current !== workspace.lotPresentation
      ) return
      const candidates = [
        allowExactOpener ? workspace.opener : null,
        document.querySelector<HTMLElement>('[data-testid="lot-studio-heading"]'),
      ]
      const target = candidates.find(
        (candidate): candidate is HTMLElement =>
          candidate !== null &&
          candidate.isConnected &&
          candidate.closest('[inert]') === null,
      )
      target?.focus({ preventScroll: true })
    }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(restore)
    else queueMicrotask(restore)
  }, [])

  const restoreRetainedAuditionFocus = useCallback((
    workspace: LotAuditionWorkspaceBase,
    allowExactOpener: boolean,
  ) => {
    const restore = () => {
      const presentation = latestLotAuditionPresentationRef.current
      if (
        presentation.workspace !== null ||
        presentation.liveReceipt !== null ||
        latestLotPackagePresentationRef.current.workspace !== null ||
        latestLotPackagePresentationRef.current.liveFormation !== null ||
        latestLotCommissionPresentationRef.current.workspace !== null ||
        latestLotCommissionPresentationRef.current.liveReceipt !== null ||
        latestOpenProfileIdRef.current !== null ||
        latestScreenRef.current !== workspace.lotScreen ||
        activeLotPresentationRef.current !== workspace.lotPresentation
      ) return
      const candidates = [
        allowExactOpener ? workspace.opener : null,
        document.querySelector<HTMLElement>('[data-testid="lot-studio-heading"]'),
      ]
      const target = candidates.find(
        (candidate): candidate is HTMLElement =>
          candidate !== null &&
          candidate.isConnected &&
          candidate.closest('[inert]') === null,
      )
      target?.focus({ preventScroll: true })
    }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(restore)
    else queueMicrotask(restore)
  }, [])

  // PF1-M1 — the autoplay gate, handled once for the whole product. The browser only
  // grants an AudioContext inside a user gesture, so the FIRST pointer or key event
  // anywhere in the document unlocks the service and both listeners retire together.
  // There is no unlock button and no nag: a player who never interacts simply hears
  // nothing, which is a correct state.
  useEffect(() => {
    if (typeof document === 'undefined') return
    let unlocked = false
    const unlock = () => {
      if (unlocked) return
      unlocked = true
      document.removeEventListener('pointerdown', unlock, true)
      document.removeEventListener('keydown', unlock, true)
      getAudioService().unlock()
    }
    document.addEventListener('pointerdown', unlock, true)
    document.addEventListener('keydown', unlock, true)
    return () => {
      document.removeEventListener('pointerdown', unlock, true)
      document.removeEventListener('keydown', unlock, true)
    }
  }, [])

  useEffect(() => {
    const clearHeldAuditionClaim = () => {
      lotAuditionActivationRef.current = null
    }
    const clearHiddenAuditionClaim = () => {
      if (document.visibilityState === 'hidden') clearHeldAuditionClaim()
    }
    window.addEventListener('blur', clearHeldAuditionClaim)
    document.addEventListener('visibilitychange', clearHiddenAuditionClaim)
    return () => {
      window.removeEventListener('blur', clearHeldAuditionClaim)
      document.removeEventListener('visibilitychange', clearHiddenAuditionClaim)
      lotAuditionActivationRef.current = null
    }
  }, [])

  // Autosave after EVERY authoritative state transition — every GameState change flows through
  // setState, so this single effect covers founding, hiring, greenlight, advance, sim, release,
  // theatrical payments, roster changes, etc. Whole engine states only (no half-applied writes).
  useEffect(() => {
    if (!state) return
    // The write either happened or it did not, and the player is told which. Nothing here
    // retries: a retry the shell cannot prove would be the same silent lie in a new costume.
    //
    // Only an explicit `false` is evidence of failure. Several suites replace the whole
    // persistence boundary with a stub that returns nothing; "no signal" is not "the studio
    // was lost", and the product must not accuse itself on a test double's silence.
    setPersistenceOk(saveActiveSession(state) !== false)
  }, [state])

  // A refusal survives the action that produced it and expires on the next one — the same
  // epoch law the Lot's receipt strip follows (M2). The refusal itself replaces no state,
  // so its epoch does not move until the player does something else.
  useTransientNotice(appNotice?.key ?? null, appNotice !== null, noticeEpoch, dismissNotice)

  // A clear Casting review may hand off only after the exact successor has committed and the
  // established autosave effect above has been invoked for it. Re-prove the complete transition
  // here; any replacement, unmount, or presentation drift consumes the pending route neutrally.
  useEffect(() => {
    const pending = lotCastingPackageHandoffRef.current
    if (pending === null) return
    if (
      state !== pending.next ||
      latestStateRef.current !== pending.next ||
      screen !== pending.lotScreen ||
      latestScreenRef.current !== pending.lotScreen ||
      activeLotPresentationRef.current !== pending.lotPresentation ||
      latestOpenProfileIdRef.current !== null
    ) {
      lotCastingPackageHandoffRef.current = null
      return
    }
    let active = true
    // Make the Package route observably later than both the committed Lot successor and its
    // autosave invocation. A presentation replacement or unmount in that boundary keeps the
    // valid Engine successor but consumes this optional route neutrally.
    window.queueMicrotask(() => {
      if (
        !active ||
        lotCastingPackageHandoffRef.current !== pending ||
        latestStateRef.current !== pending.next ||
        latestScreenRef.current !== pending.lotScreen ||
        activeLotPresentationRef.current !== pending.lotPresentation ||
        latestOpenProfileIdRef.current !== null
      ) return
      const success = acceptedLotCastingReviewSuccess(
        pending.context,
        pending.action,
        pending.before,
        pending.next,
      )
      lotCastingPackageHandoffRef.current = null
      if (success === null || success.kind !== 'clear') return
      // The retained host is an Operation Hollywood world-first surface. Preserve the
      // pre-contract full-screen Package route for the Classic/rollback presentation.
      if (!hollywoodEnabled) {
        setScreen({
          kind: 'assembly',
          returnContext: pending.returnContext,
          scriptProjectId: success.projectId,
        })
        return
      }
      const presentation = latestLotPackagePresentationRef.current
      const commission = latestLotCommissionPresentationRef.current
      if (
        presentation.workspace !== null ||
        presentation.liveFormation !== null ||
        commission.workspace !== null ||
        commission.liveReceipt !== null
      ) return
      const workspace: LotPackageWorkspaceSession = {
        phase: 'editing',
        identity: {},
        key: ++lotPackageKeyRef.current,
        lotScreen: pending.lotScreen,
        lotPresentation: pending.lotPresentation,
        scriptProjectId: success.projectId,
        title: success.title,
        opener: pending.opener,
        acceptedState: pending.next,
      }
      commitLotPackagePresentation({
        workspace,
        liveFormation: null,
      })
    })
    return () => {
      active = false
      if (lotCastingPackageHandoffRef.current === pending) {
        lotCastingPackageHandoffRef.current = null
      }
    }
  }, [commitLotPackagePresentation, screen, state])

  // Accepted greenlight closes only after the successor has reached the established autosave
  // effect above. Workspace close and live-formation publication are one atomic presentation
  // update, so the Lot cannot observe a receipt while it is still suspended by the Package.
  useEffect(() => {
    const workspace = lotPackagePresentation.workspace
    if (workspace?.phase !== 'committed') return
    if (
      state !== workspace.next ||
      latestStateRef.current !== workspace.next ||
      screen !== workspace.lotScreen ||
      latestScreenRef.current !== workspace.lotScreen ||
      activeLotPresentationRef.current !== workspace.lotPresentation
    ) {
      if (latestLotPackagePresentationRef.current.workspace === workspace) {
        commitLotPackagePresentation({ workspace: null, liveFormation: null })
      }
      return
    }
    let active = true
    window.queueMicrotask(() => {
      if (
        !active ||
        latestLotPackagePresentationRef.current.workspace !== workspace ||
        latestStateRef.current !== workspace.next ||
        latestScreenRef.current !== workspace.lotScreen ||
        activeLotPresentationRef.current !== workspace.lotPresentation
      ) return
      const liveFormation = workspace.formationReceipt === null
        ? null
        : {
            identity: {},
            acceptedState: workspace.next,
            lotScreen: workspace.lotScreen,
            lotPresentation: workspace.lotPresentation,
            receipt: workspace.formationReceipt,
          }
      commitLotPackagePresentation({ workspace: null, liveFormation })
      // PF1-M2: PICTURE FORMED. The formation-witness publish gate is the one place a
      // formation receipt becomes visible to the player, it has already refused every
      // stale/mismatched/duplicate claim above, and it cannot be reached by a remount —
      // so the greenlight sting is exact-once here and nowhere else.
      if (liveFormation !== null) {
        applyPunctuation(punctuateFormation(workspace.next.market.tick))
      }
      if (liveFormation === null) {
        restoreRetainedPackageFocus(workspace, false)
      }
    })
    return () => {
      active = false
    }
  }, [
    applyPunctuation,
    commitLotPackagePresentation,
    lotPackagePresentation.workspace,
    restoreRetainedPackageFocus,
    screen,
    state,
  ])

  // An accepted commission remains visibly committed until the established autosave effect above
  // has observed its exact successor. Only then may the workspace close and publish one transient
  // receipt to this already-mounted Lot.
  useEffect(() => {
    const workspace = lotCommissionPresentation.workspace
    if (workspace?.phase !== 'committed') return
    if (
      state !== workspace.next ||
      latestStateRef.current !== workspace.next ||
      screen !== workspace.lotScreen ||
      latestScreenRef.current !== workspace.lotScreen ||
      activeLotPresentationRef.current !== workspace.lotPresentation
    ) {
      if (latestLotCommissionPresentationRef.current.workspace === workspace) {
        lotCommissionActivationRef.current = null
        lotCommissionRejectedAttemptRef.current = null
        commitLotCommissionPresentation({ workspace: null, liveReceipt: null })
      }
      return
    }
    let active = true
    window.queueMicrotask(() => {
      if (
        !active ||
        latestLotCommissionPresentationRef.current.workspace !== workspace ||
        latestStateRef.current !== workspace.next ||
        latestScreenRef.current !== workspace.lotScreen ||
        activeLotPresentationRef.current !== workspace.lotPresentation ||
        latestLotPackagePresentationRef.current.workspace !== null ||
        latestOpenProfileIdRef.current !== null
      ) return
      const liveReceipt: LiveCommissionPresentation | null = workspace.receipt === null
        ? null
        : {
            identity: {},
            acceptedState: workspace.next,
            lotScreen: workspace.lotScreen,
            lotPresentation: workspace.lotPresentation,
            receipt: workspace.receipt,
          }
      lotCommissionActivationRef.current = null
      lotCommissionRejectedAttemptRef.current = null
      commitLotCommissionPresentation({ workspace: null, liveReceipt })
      if (liveReceipt === null) restoreRetainedCommissionFocus(workspace, false)
    })
    return () => {
      active = false
    }
  }, [
    commitLotCommissionPresentation,
    lotCommissionPresentation.workspace,
    restoreRetainedCommissionFocus,
    screen,
    state,
  ])

  // A valid Casting successor remains in the bounded committed sheet until the established
  // autosave effect has observed it. Receipt failure demotes only the optional Lot witness.
  useEffect(() => {
    const workspace = lotAuditionPresentation.workspace
    if (workspace?.phase !== 'committed') return
    if (
      state !== workspace.next ||
      latestStateRef.current !== workspace.next ||
      screen !== workspace.lotScreen ||
      latestScreenRef.current !== workspace.lotScreen ||
      activeLotPresentationRef.current !== workspace.lotPresentation
    ) {
      if (latestLotAuditionPresentationRef.current.workspace === workspace) {
        lotAuditionActivationRef.current = null
        lotAuditionRejectedAttemptRef.current = null
        commitLotAuditionPresentation({ workspace: null, liveReceipt: null })
      }
      return
    }
    let active = true
    window.queueMicrotask(() => {
      if (
        !active ||
        latestLotAuditionPresentationRef.current.workspace !== workspace ||
        latestStateRef.current !== workspace.next ||
        latestScreenRef.current !== workspace.lotScreen ||
        activeLotPresentationRef.current !== workspace.lotPresentation ||
        latestLotPackagePresentationRef.current.workspace !== null ||
        latestLotPackagePresentationRef.current.liveFormation !== null ||
        latestLotCommissionPresentationRef.current.workspace !== null ||
        latestLotCommissionPresentationRef.current.liveReceipt !== null ||
        latestOpenProfileIdRef.current !== null
      ) return
      const liveReceipt: LiveAuditionPresentation | null = workspace.receipt === null
        ? null
        : {
            identity: {},
            acceptedState: workspace.next,
            lotScreen: workspace.lotScreen,
            lotPresentation: workspace.lotPresentation,
            receipt: workspace.receipt,
          }
      lotAuditionActivationRef.current = null
      lotAuditionRejectedAttemptRef.current = null
      commitLotAuditionPresentation({ workspace: null, liveReceipt })
      if (liveReceipt === null) restoreRetainedAuditionFocus(workspace, false)
    })
    return () => {
      active = false
    }
  }, [
    commitLotAuditionPresentation,
    lotAuditionPresentation.workspace,
    restoreRetainedAuditionFocus,
    screen,
    state,
  ])

  useEffect(() => {
    const profileIsOpen = openProfileId !== null
    if (profileWasOpenRef.current && !profileIsOpen) {
      const opener = profileOpenerRef.current
      profileOpenerRef.current = null
      const restoreEpoch = ++profileRestoreEpochRef.current
      const restoreFocus = () => {
        if (
          profileRestoreEpochRef.current !== restoreEpoch ||
          latestOpenProfileIdRef.current !== null ||
          opener === null ||
          !opener.isConnected ||
          opener.closest('[inert]') !== null
        ) return
        opener.focus({ preventScroll: true })
      }
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(restoreFocus)
      } else {
        queueMicrotask(restoreFocus)
      }
    }
    profileWasOpenRef.current = profileIsOpen
  }, [openProfileId])

  function startGame(next: GameState, details: { converted: boolean }) {
    replaceAuthoritativeState(next)
    clearTalentProfileWithoutFocusRestore()
    setSnapshots({})
    setLotOperationalAnnouncementSuppressed(false)
    setRecovery(null)
    setSaveMigrationNotice(details.converted)
    // AUTHORITATIVE STATE REPLACEMENT: a brand-new studio, or a save imported at the start
    // screen. Presentation memory keyed by production id must not cross this line — ids are
    // `prod-<tick>` and repeat across games, so a slot held by the previous studio would be
    // inherited by an unrelated film. Only reached with a valid `next`.
    resetLotStageAssignment()
    resetLotSelectedBuilding()
    // A new PLAYER game opens in the founding draft (D-11.2); a founded game (or a
    // loaded save past founding) goes to the ordinary Studio Home. The new game's first
    // autosave (via the effect above) replaces any prior/quarantined active session.
    setScreen(next.founding !== null ? { kind: 'founding' } : operatingStudioHome(lotEnabled))
  }

  // A destructive "new studio" — confirmed whenever a live studio exists, then the autosave is
  // cleared so a subsequent refresh does not resurrect the abandoned studio. The gate is the
  // in-memory studio (`state`), NOT whether persistence succeeded: in private/incognito mode
  // hasActiveSession() is false, but there is still a live studio to lose, so it must still ask.
  //
  // PF1-M3: it asks in a focus-trapped dialog of the product's own, with two named verbs, in
  // place of `window.confirm`. The decision boundary is unchanged — nothing below this line
  // runs until the player has said the destructive word.
  function requestNewGame() {
    if (state !== null) {
      setConfirmNewGame(true)
      return
    }
    performNewGame()
  }

  function performNewGame() {
    setConfirmNewGame(false)
    clearActiveSession()
    replaceAuthoritativeState(null)
    clearTalentProfileWithoutFocusRestore()
    setSnapshots({})
    setLotOperationalAnnouncementSuppressed(false)
    setRecovery(null)
    setSaveMigrationNotice(false)
    // The old studio ends HERE, past the confirm — so its presentation memory ends here too.
    resetLotStageAssignment()
    resetLotSelectedBuilding()
    setScreen({ kind: 'start' })
  }

  function goDashboard() {
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen({ kind: 'dashboard', returnContext: DASHBOARD_RETURN_CONTEXT })
  }

  function goStudioHome() {
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen(operatingStudioHome(lotEnabled))
  }

  function openDashboardFromLot(focus: OrdinaryLotEntryFocus) {
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen({
      kind: 'dashboard',
      returnContext: {
        kind: 'lot',
        focus,
        suppressOperationalAnnouncement: false,
      },
    })
  }

  function returnToStudioContext(context: StudioReturnContext) {
    if (context.kind === 'dashboard' || !lotEnabled) {
      goDashboard()
      return
    }
    if (context.focus === 'next-event-reaction') {
      const session = lotNextEventSessionRef.current
      const current = latestStateRef.current
      if (
        session !== null &&
        current === session.acceptedState &&
        sameLotNextEventReceipt(session.receipt, context.receipt) &&
        (
          session.receipt.target.kind === 'script'
            ? currentLotScriptReviewContext(current, {
                projectId: session.receipt.target.projectId,
                title: session.receipt.target.title,
              }) !== null
            : session.receipt.target.kind === 'casting'
              ? currentLotCastingReviewContext(current, {
                  sessionId: session.receipt.target.sessionId,
                  projectId: session.receipt.target.projectId,
                  title: session.receipt.target.title,
                }) !== null
              : true
        )
      ) {
        setLotCadenceFeedback({ kind: 'next-event-exact', receipt: session.receipt })
        setLotOperationalAnnouncementSuppressed(context.suppressOperationalAnnouncement)
        setScreen({
          kind: 'lot',
          entryFocus: 'next-event-reaction',
          entryNextEventReceipt: session.receipt,
        })
        return
      }
      setLotCadenceFeedback(null)
      setLotOperationalAnnouncementSuppressed(context.suppressOperationalAnnouncement)
      setScreen({ kind: 'lot', entryFocus: 'studio-home' })
      return
    }
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(context.suppressOperationalAnnouncement)
    if (context.focus === 'script-review') {
      const current = latestStateRef.current
      const review = current === null
        ? null
        : currentLotScriptReviewContext(current, context.target)
      if (review === null) {
        setScreen({ kind: 'lot', entryFocus: 'studio-home' })
        return
      }
      setScreen({
        kind: 'lot',
        entryFocus: 'script-review',
        entryScriptReviewTarget: {
          projectId: review.projectId,
          title: review.title,
        },
      })
      return
    }
    if (context.focus === 'casting-review') {
      const current = latestStateRef.current
      const review = current === null
        ? null
        : currentLotCastingReviewContext(current, context.target)
      if (review === null) {
        setScreen({ kind: 'lot', entryFocus: 'studio-home' })
        return
      }
      setScreen({
        kind: 'lot',
        entryFocus: 'casting-review',
        entryCastingReviewTarget: {
          sessionId: review.sessionId,
          projectId: review.projectId,
          title: review.title,
        },
      })
      return
    }
    if (context.focus === 'gate-candidate') {
      // Preserve only the exact transient owner identity. The remounted Lot independently
      // rebuilds current market truth and restores no visitor when that identity drifted.
      setScreen({
        kind: 'lot',
        entryFocus: 'gate-candidate',
        entryGateCandidate: context.candidate,
      })
      return
    }
    if (context.focus === 'stage-7-production') {
      // Preserve the stale-sensitive identity even when current truth may have changed. The
      // remounted Lot starts explicit-empty and performs the fresh strict selector check; a
      // generic studio-home fallback could briefly orient toward a replacement occupant.
      setScreen({
        kind: 'lot',
        entryFocus: 'stage-7-production',
        entryStage7ProductionId: context.productionId,
      })
      return
    }
    setScreen({ kind: 'lot', entryFocus: context.focus })
  }

  function currentLotWorldInputOwner(): boolean {
    return latestLotPackagePresentationRef.current.workspace === null &&
      latestLotPackagePresentationRef.current.liveFormation === null &&
      latestLotCommissionPresentationRef.current.workspace === null &&
      latestLotCommissionPresentationRef.current.liveReceipt === null &&
      latestLotAuditionPresentationRef.current.workspace === null &&
      latestLotAuditionPresentationRef.current.liveReceipt === null &&
      latestOpenProfileIdRef.current === null &&
      latestScreenRef.current.kind === 'lot'
  }

  function currentLotAuditionTransitionOwnerFree(): boolean {
    return lotNextEventSessionRef.current === null &&
      lotNextEventActivationRef.current === null &&
      lotScriptReviewActivationRef.current === null &&
      lotCastingReviewActivationRef.current === null &&
      lotCastingPackageHandoffRef.current === null
  }

  function handleOpenLotAuditionPlanning(
    renderedState: GameState,
    renderedScreen: LotScreen,
    renderedPresentation: object,
    origin: LotAuditionPlanningOrigin,
  ): boolean {
    const currentState = latestStateRef.current
    const currentScreen = latestScreenRef.current
    const currentPresentation = activeLotPresentationRef.current
    if (
      !currentLotWorldInputOwner() ||
      !currentLotAuditionTransitionOwnerFree() ||
      currentState !== renderedState ||
      currentScreen !== renderedScreen ||
      currentPresentation !== renderedPresentation ||
      !exactLotAuditionPlanningOrigin(origin)
    ) return false

    let context: LotAuditionPlanningContext | null = null
    try {
      context = currentLotAuditionPlanningContext({
        hollywoodEnabled,
        origin: 'lot-browse-talent',
        worldInputOwner: true,
        originState: renderedState,
        currentState,
        originScreen: renderedScreen,
        currentScreen,
        originPresentation: renderedPresentation,
        currentPresentation,
      })
    } catch {
      context = null
    }
    if (context === null) return false

    const workspace: LotAuditionWorkspaceSession = {
      phase: 'editing',
      identity: {},
      key: ++lotAuditionKeyRef.current,
      lotScreen: renderedScreen,
      lotPresentation: renderedPresentation,
      context,
      opener: origin.opener,
      acceptedState: renderedState,
      slateRevision: 0,
      slate: { lead: [], antagonist: [], support: [] },
    }
    lotAuditionActivationRef.current = null
    lotAuditionRejectedAttemptRef.current = null
    commitLotAuditionPresentation({ workspace, liveReceipt: null })
    return true
  }

  function currentLotAuditionWorkspaceOwner(
    workspace: LotAuditionWorkspaceSession,
  ): workspace is EditingLotAuditionWorkspace {
    const currentWorkspace = latestLotAuditionPresentationRef.current.workspace
    const currentState = latestStateRef.current
    const currentScreen = latestScreenRef.current
    const currentPresentation = activeLotPresentationRef.current
    return !(
      currentWorkspace !== workspace ||
      workspace.phase !== 'editing' ||
      !currentLotAuditionTransitionOwnerFree() ||
      currentState !== workspace.acceptedState ||
      currentScreen !== workspace.lotScreen ||
      currentPresentation !== workspace.lotPresentation ||
      latestLotPackagePresentationRef.current.workspace !== null ||
      latestLotPackagePresentationRef.current.liveFormation !== null ||
      latestLotCommissionPresentationRef.current.workspace !== null ||
      latestLotCommissionPresentationRef.current.liveReceipt !== null ||
      latestLotAuditionPresentationRef.current.liveReceipt !== null ||
      latestOpenProfileIdRef.current !== null
    )
  }

  function currentLotAuditionWorkspaceContext(
    workspace: LotAuditionWorkspaceSession,
  ): LotAuditionPlanningContext | null {
    if (!currentLotAuditionWorkspaceOwner(workspace)) return null
    const currentState = latestStateRef.current
    const currentScreen = latestScreenRef.current
    const currentPresentation = activeLotPresentationRef.current
    try {
      const context = currentLotAuditionPlanningContext({
        hollywoodEnabled,
        origin: 'lot-browse-talent',
        worldInputOwner: true,
        originState: workspace.acceptedState,
        currentState,
        originScreen: workspace.lotScreen,
        currentScreen,
        originPresentation: workspace.lotPresentation,
        currentPresentation,
      })
      return context !== null && sameLotAuditionPlanningContext(workspace.context, context)
        ? context
        : null
    } catch {
      return null
    }
  }

  function handleLotAuditionSlateChange(
    workspace: LotAuditionWorkspaceSession,
    draft: CastingSlateDraft,
  ) {
    const current = latestLotAuditionPresentationRef.current.workspace
    if (
      current === null ||
      current.phase !== 'editing' ||
      current !== workspace ||
      lotAuditionActivationRef.current !== null ||
      !currentLotAuditionWorkspaceOwner(current)
    ) return
    const nextDraft = genuineLotAuditionDraftChange(current.context, current.slate, draft)
    if (nextDraft === null) return
    lotAuditionRejectedAttemptRef.current = null
    const updated: LotAuditionWorkspaceSession = {
      ...current,
      slateRevision: current.slateRevision + 1,
      slate: nextDraft,
    }
    commitLotAuditionPresentation({ workspace: updated, liveReceipt: null })
  }

  function handleLotAuditionCancel(workspace: LotAuditionWorkspaceSession) {
    const current = latestLotAuditionPresentationRef.current.workspace
    if (
      current === null ||
      current.phase !== 'editing' ||
      current !== workspace ||
      lotAuditionActivationRef.current !== null ||
      !currentLotAuditionWorkspaceOwner(current)
    ) return
    lotAuditionRejectedAttemptRef.current = null
    commitLotAuditionPresentation({ workspace: null, liveReceipt: null })
    restoreRetainedAuditionFocus(current, true)
  }

  function handleLotAuditionOpenDetails(workspace: LotAuditionWorkspaceSession) {
    const current = latestLotAuditionPresentationRef.current.workspace
    if (
      current === null ||
      current.phase !== 'editing' ||
      current !== workspace ||
      lotAuditionActivationRef.current !== null ||
      currentLotAuditionWorkspaceContext(current) === null
    ) return
    lotAuditionActivationRef.current = null
    lotAuditionRejectedAttemptRef.current = null
    commitLotAuditionPresentation({ workspace: null, liveReceipt: null })
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen({
      kind: 'castingRoom',
      returnContext: {
        kind: 'lot',
        focus: 'selected-building',
        suppressOperationalAnnouncement: false,
      },
      scriptProjectId: current.context.project.projectId,
    })
  }

  function handleLotAuditionSubmit(
    workspace: LotAuditionWorkspaceSession,
    renderedBefore: GameState,
    slate: StartCastingSessionPayload['slate'],
  ): ActionOutcome {
    const current = latestLotAuditionPresentationRef.current.workspace
    if (
      current === null ||
      current.phase !== 'editing' ||
      current !== workspace ||
      current.acceptedState !== renderedBefore ||
      lotAuditionActivationRef.current !== null
    ) {
      return {
        ok: false,
        error: 'Audition planning is no longer owned by the live Studio Lot.',
      }
    }
    const latestContext = currentLotAuditionWorkspaceContext(current)
    const payload = latestContext === null
      ? null
      : lotAuditionPlanningPayload(latestContext, {
          projectId: current.context.project.projectId,
          slate,
        })
    if (latestContext === null || payload === null) {
      return {
        ok: false,
        error: 'Audition planning is no longer legal for this live Studio Lot.',
      }
    }
    if (!sameLotAuditionDraft(latestContext, current.slate, payload.slate)) {
      return {
        ok: false,
        error: 'The camera-test slate no longer matches the live Studio Lot workspace.',
      }
    }

    let payloadSignature: string
    try {
      payloadSignature = JSON.stringify(payload)
    } catch {
      return {
        ok: false,
        error: 'The camera-test slate is malformed. Review all six reads.',
      }
    }
    const rejectedAttempt = lotAuditionRejectedAttemptRef.current
    if (
      rejectedAttempt !== null &&
      rejectedAttempt.workspace === current &&
      rejectedAttempt.state === renderedBefore &&
      rejectedAttempt.revision === current.slateRevision &&
      rejectedAttempt.payloadSignature === payloadSignature
    ) {
      return { ok: false, error: rejectedAttempt.error }
    }
    lotAuditionRejectedAttemptRef.current = null
    const activation = {
      workspace: current,
      state: renderedBefore,
      revision: current.slateRevision,
      payload,
    }
    lotAuditionActivationRef.current = activation
    const result = startCastingSessionAction(renderedBefore, payload)
    if (!result.ok) {
      if (lotAuditionActivationRef.current === activation) {
        lotAuditionActivationRef.current = null
      }
      lotAuditionRejectedAttemptRef.current = {
        workspace: current,
        state: renderedBefore,
        revision: current.slateRevision,
        payloadSignature,
        error: result.error,
      }
      return result
    }

    let receipt: LotAuditionPlanningReceipt | null = null
    try {
      receipt = acceptedLotAuditionPlanningReceipt(renderedBefore, result.next, payload)
    } catch {
      receipt = null
    }
    const committed: LotAuditionWorkspaceSession = {
      phase: 'committed',
      identity: current.identity,
      key: current.key,
      lotScreen: current.lotScreen,
      lotPresentation: current.lotPresentation,
      context: current.context,
      opener: current.opener,
      before: renderedBefore,
      next: result.next,
      receipt,
    }
    lotAuditionRejectedAttemptRef.current = null
    commitLotAuditionPresentation({ workspace: committed, liveReceipt: null })
    lotNextEventSessionRef.current = null
    lotNextEventActivationRef.current = null
    lotScriptReviewActivationRef.current = null
    lotCastingReviewActivationRef.current = null
    lotCastingPackageHandoffRef.current = null
    latestStateRef.current = result.next
    // This path inlines the replacement instead of calling replaceAuthoritativeState (the
    // mounted Lot host must survive), so it inlines the epoch bump with it.
    bumpNoticeEpoch()
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setState(result.next)
    applyPunctuation(punctuateCommit('auditions-planned', result.next.market.tick))
    return result
  }

  function handleLiveAuditionConsumed(identity: object) {
    const presentation = latestLotAuditionPresentationRef.current
    if (presentation.liveReceipt?.identity !== identity) return
    commitLotAuditionPresentation({ ...presentation, liveReceipt: null })
  }

  function handleLotCommissionCancel(workspace: LotCommissionWorkspaceSession) {
    const current = latestLotCommissionPresentationRef.current.workspace
    if (
      current !== workspace ||
      current.phase !== 'editing' ||
      lotCommissionActivationRef.current !== null ||
      latestStateRef.current !== current.acceptedState ||
      latestScreenRef.current !== current.lotScreen ||
      activeLotPresentationRef.current !== current.lotPresentation ||
      latestLotPackagePresentationRef.current.workspace !== null ||
      latestOpenProfileIdRef.current !== null
    ) return
    lotCommissionRejectedAttemptRef.current = null
    commitLotCommissionPresentation({ workspace: null, liveReceipt: null })
    restoreRetainedCommissionFocus(current, true)
  }

  function handleLotCommissionOpenDetails(workspace: LotCommissionWorkspaceSession) {
    const current = latestLotCommissionPresentationRef.current.workspace
    if (
      current !== workspace ||
      current.phase !== 'editing' ||
      lotCommissionActivationRef.current !== null ||
      latestStateRef.current !== current.acceptedState ||
      latestScreenRef.current !== current.lotScreen ||
      activeLotPresentationRef.current !== current.lotPresentation ||
      latestLotPackagePresentationRef.current.workspace !== null ||
      latestOpenProfileIdRef.current !== null
    ) return
    lotCommissionActivationRef.current = null
    lotCommissionRejectedAttemptRef.current = null
    commitLotCommissionPresentation({ workspace: null, liveReceipt: null })
    setScreen({
      kind: 'writersRoom',
      returnContext: {
        kind: 'lot',
        focus: 'selected-building',
        suppressOperationalAnnouncement: false,
      },
    })
  }

  function handleLotCommissionSubmit(
    workspace: LotCommissionWorkspaceSession,
    renderedBefore: GameState,
    payload: CommissionScriptPayload,
  ): ActionOutcome {
    const current = latestLotCommissionPresentationRef.current.workspace
    if (
      current !== workspace ||
      current.phase !== 'editing' ||
      current.acceptedState !== renderedBefore ||
      latestStateRef.current !== renderedBefore ||
      latestScreenRef.current !== current.lotScreen ||
      activeLotPresentationRef.current !== current.lotPresentation ||
      latestLotPackagePresentationRef.current.workspace !== null ||
      latestOpenProfileIdRef.current !== null ||
      lotCommissionActivationRef.current !== null
    ) {
      return {
        ok: false,
        error: 'Screenplay commission is no longer owned by the live Studio Lot.',
      }
    }

    let payloadSignature: string
    try {
      payloadSignature = JSON.stringify(payload)
    } catch {
      return {
        ok: false,
        error: 'Screenplay commission details are malformed. Review the current form.',
      }
    }
    const rejectedAttempt = lotCommissionRejectedAttemptRef.current
    if (
      rejectedAttempt !== null &&
      rejectedAttempt.workspace === current &&
      rejectedAttempt.state === renderedBefore &&
      rejectedAttempt.payloadSignature === payloadSignature
    ) {
      return { ok: false, error: rejectedAttempt.error }
    }
    lotCommissionRejectedAttemptRef.current = null
    const activation = { workspace: current, payload }
    lotCommissionActivationRef.current = activation
    const result = commissionScriptAction(renderedBefore, payload)
    if (!result.ok) {
      if (lotCommissionActivationRef.current === activation) {
        lotCommissionActivationRef.current = null
      }
      lotCommissionRejectedAttemptRef.current = {
        workspace: current,
        state: renderedBefore,
        payloadSignature,
        error: result.error,
      }
      return result
    }

    let receipt: ScreenplayCommissionReceipt | null = null
    try {
      receipt = acceptedScreenplayCommissionReceipt(renderedBefore, result.next, payload)
    } catch {
      receipt = null
    }
    const committed: LotCommissionWorkspaceSession = {
      phase: 'committed',
      identity: current.identity,
      key: current.key,
      lotScreen: current.lotScreen,
      lotPresentation: current.lotPresentation,
      opener: current.opener,
      before: renderedBefore,
      next: result.next,
      title: receipt?.title ?? 'screenplay',
      receipt,
    }
    // Publish the committed owner synchronously before React can deliver another activation from
    // the still-rendered form. The valid Engine successor is accepted even if optional receipt
    // presentation fails strict proof.
    lotCommissionRejectedAttemptRef.current = null
    commitLotCommissionPresentation({ workspace: committed, liveReceipt: null })
    lotNextEventSessionRef.current = null
    lotNextEventActivationRef.current = null
    lotScriptReviewActivationRef.current = null
    lotCastingReviewActivationRef.current = null
    lotCastingPackageHandoffRef.current = null
    latestStateRef.current = result.next
    // Inlined replacement (see the audition path): the epoch bump is inlined with it.
    bumpNoticeEpoch()
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setState(result.next)
    applyPunctuation(punctuateCommit('commission', result.next.market.tick))
    return result
  }

  function handleLiveCommissionConsumed(identity: object) {
    const presentation = latestLotCommissionPresentationRef.current
    if (presentation.liveReceipt?.identity !== identity) return
    commitLotCommissionPresentation({ ...presentation, liveReceipt: null })
  }

  function handleLotPackageCancel(workspace: LotPackageWorkspaceSession) {
    const current = latestLotPackagePresentationRef.current.workspace
    if (
      current !== workspace ||
      current.phase !== 'editing' ||
      latestStateRef.current !== current.acceptedState ||
      latestScreenRef.current !== current.lotScreen ||
      activeLotPresentationRef.current !== current.lotPresentation ||
      latestOpenProfileIdRef.current !== null
    ) return
    commitLotPackagePresentation({ workspace: null, liveFormation: null })
    restoreRetainedPackageFocus(current, true)
  }

  function handleLotPackageStateChange(
    workspace: LotPackageWorkspaceSession,
    renderedBefore: GameState,
    next: GameState,
  ) {
    const current = latestLotPackagePresentationRef.current.workspace
    if (
      current !== workspace ||
      current.phase !== 'editing' ||
      current.acceptedState !== renderedBefore ||
      latestStateRef.current !== renderedBefore ||
      latestScreenRef.current !== current.lotScreen ||
      activeLotPresentationRef.current !== current.lotPresentation ||
      latestOpenProfileIdRef.current !== null
    ) return
    const updated: LotPackageWorkspaceSession = {
      ...current,
      acceptedState: next,
    }
    commitLotPackagePresentation({ workspace: updated, liveFormation: null })
    latestStateRef.current = next
    // Inlined replacement (the Package workspace must stay mounted): epoch bump inlined too.
    bumpNoticeEpoch()
    setState(next)
    applyPunctuation(punctuateCommit('package-step', next.market.tick))
  }

  function handleLotPackageOpenProfile(
    workspace: LotPackageWorkspaceSession,
    personId: string,
  ) {
    const current = latestLotPackagePresentationRef.current.workspace
    if (
      current !== workspace ||
      current.phase !== 'editing' ||
      latestStateRef.current !== current.acceptedState ||
      latestScreenRef.current !== current.lotScreen ||
      activeLotPresentationRef.current !== current.lotPresentation ||
      latestOpenProfileIdRef.current !== null ||
      talentProfile(current.acceptedState, personId) === undefined
    ) return
    openTalentProfile(personId)
  }

  function handleLotPackageGreenlit(
    workspace: LotPackageWorkspaceSession,
    renderedBefore: GameState,
    next: GameState,
    assemblyReceipt: GreenlightFormationReceipt | null,
  ) {
    const currentWorkspace = latestLotPackagePresentationRef.current.workspace
    const current = latestStateRef.current
    if (
      currentWorkspace !== workspace ||
      currentWorkspace.phase !== 'editing' ||
      current === null ||
      current !== renderedBefore ||
      currentWorkspace.acceptedState !== renderedBefore ||
      latestScreenRef.current !== currentWorkspace.lotScreen ||
      activeLotPresentationRef.current !== currentWorkspace.lotPresentation ||
      latestOpenProfileIdRef.current !== null
    ) return

    let appReceipt: GreenlightFormationReceipt | null = null
    try {
      appReceipt = acceptedGreenlightFormationReceipt(current, next)
    } catch {
      appReceipt = null
    }
    let formationReceipt: GreenlightFormationReceipt | null = null
    try {
      if (
        lotEnabled &&
        hollywoodEnabled &&
        appReceipt !== null &&
        assemblyReceipt !== null &&
        sameGreenlightFormationReceipt(appReceipt, assemblyReceipt)
      ) {
        formationReceipt = appReceipt
      }
    } catch {
      formationReceipt = null
    }

    const committed: LotPackageWorkspaceSession = {
      phase: 'committed',
      identity: currentWorkspace.identity,
      key: currentWorkspace.key,
      lotScreen: currentWorkspace.lotScreen,
      lotPresentation: currentWorkspace.lotPresentation,
      scriptProjectId: currentWorkspace.scriptProjectId,
      title: currentWorkspace.title,
      opener: currentWorkspace.opener,
      before: current,
      next,
      formationReceipt,
    }
    // Close the editing owner synchronously before the Engine successor can make the screenplay
    // disappear from Assembly's Ready-package projection.
    commitLotPackagePresentation({ workspace: committed, liveFormation: null })
    lotNextEventSessionRef.current = null
    lotNextEventActivationRef.current = null
    lotScriptReviewActivationRef.current = null
    lotCastingReviewActivationRef.current = null
    lotCastingPackageHandoffRef.current = null
    latestStateRef.current = next
    // Inlined replacement: epoch bump inlined. No commit cue here on purpose — the
    // greenlight's sting belongs to the formation-witness publish gate above, and firing
    // one here as well would punctuate the same moment twice.
    bumpNoticeEpoch()
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setState(next)
  }

  function handleLiveFormationConsumed(identity: object) {
    const presentation = latestLotPackagePresentationRef.current
    if (presentation.liveFormation?.identity !== identity) return
    commitLotPackagePresentation({ ...presentation, liveFormation: null })
  }

  // World-First Greenlight Production Formation V1: Assembly reports the successor plus a
  // narrow receipt, but App remains the independent state/navigation owner. The callback is
  // legal only while the exact object rendered into that Assembly is still the latest state.
  // A receipt problem demotes presentation only; the already Engine-accepted successor keeps
  // the existing generic return. Synchronizing the ref before React's render also makes a
  // duplicate same-stack callback stale rather than applying the successor twice.
  function handleAssemblyGreenlit(
    renderedBefore: GameState,
    next: GameState,
    assemblyReceipt: GreenlightFormationReceipt | null,
    returnContext: StudioReturnContext,
  ) {
    const current = latestStateRef.current
    if (current === null || current !== renderedBefore) return

    let appReceipt: GreenlightFormationReceipt | null = null
    try {
      appReceipt = acceptedGreenlightFormationReceipt(current, next)
    } catch {
      // The Engine successor remains accepted. A hostile or malformed presentation receipt
      // can only remove the special world ceremony; it can never make App guess an identity.
      appReceipt = null
    }

    replaceAuthoritativeState(next)

    if (
      lotEnabled &&
      hollywoodEnabled &&
      returnContext.kind === 'lot' &&
      appReceipt !== null &&
      assemblyReceipt !== null &&
      sameGreenlightFormationReceipt(appReceipt, assemblyReceipt)
    ) {
      setLotCadenceFeedback(null)
      setLotOperationalAnnouncementSuppressed(
        returnContext.suppressOperationalAnnouncement,
      )
      setScreen({
        kind: 'lot',
        entryFocus: 'production-formation',
        entryProductionFormation: appReceipt,
      })
      // PF1-M2: the full-screen Assembly's route to the same PICTURE FORMED ceremony. The
      // receipt has been independently re-derived and cross-proved against Assembly's own
      // above, so this is the second (and last) formation-witness publish gate.
      applyPunctuation(punctuateFormation(next.market.tick))
      return
    }

    returnToStudioContext(returnContext)
  }

  // Talent Creator has two true nested owners (Founding and Hiring). A creator opened
  // from Dashboard returns through the same typed root owner as every other deep surface.
  function returnFromTalent(
    returnTo: 'dashboard' | 'founding' | 'hiring',
    returnContext: StudioReturnContext,
  ) {
    if (returnTo === 'founding') {
      setScreen({ kind: 'founding' })
      return
    }
    if (returnTo === 'hiring') {
      setScreen({ kind: 'hiring', returnContext })
      return
    }
    returnToStudioContext(returnContext)
  }

  // Studio Calendar routes are presentation-only. Every intent lands on the existing
  // owner surface; that destination's live read model still owns legality and actions.
  function handleCalendarNavigate(
    route: StudioCalendarRoute,
    returnContext: StudioReturnContext,
  ) {
    switch (route.kind) {
      case 'script':
        setScreen({ kind: 'writersRoom', returnContext, focusProjectId: route.projectId })
        break
      case 'casting':
        setScreen({ kind: 'castingRoom', returnContext, focusProjectId: route.projectId })
        break
      case 'production':
        setScreen({ kind: 'dashboard', returnContext, focusProductionId: route.productionId })
        break
      case 'theatricalRun':
        setScreen({ kind: 'dashboard', returnContext, focusRunId: route.productionId })
        break
      case 'contract':
        setScreen({ kind: 'roster', returnContext, focusTalentId: route.talentId })
        break
      case 'studioDevelopment':
        setScreen({ kind: 'studioDevelopment', returnContext })
        break
    }
  }

  // Translate a lot navigation intent into the existing screen navigation. Every route
  // targets a screen that already exists outside the lot.
  function handleLotNavigate(
    route: LotRoute,
    originState: GameState,
    originScreen: LotScreen,
    originPresentation: object,
  ) {
    if (
      !currentLotWorldInputOwner() ||
      latestStateRef.current !== originState ||
      latestScreenRef.current !== originScreen ||
      activeLotPresentationRef.current !== originPresentation
    ) return
    // Saves is the one deep surface whose attempted action may leave GameState unchanged.
    // Preserve the exact receipt only while it still proves the currently accepted successor,
    // so a rejected import or declined restart can return to the same live-world reaction.
    // An accepted load/restart crosses replaceAuthoritativeState() and clears this session.
    if (route.kind === 'saves' && lotCadenceFeedback?.kind === 'next-event-exact') {
      const session = lotNextEventSessionRef.current
      const current = latestStateRef.current
      if (
        session !== null &&
        current === session.acceptedState &&
        sameLotNextEventReceipt(session.receipt, lotCadenceFeedback.receipt)
      ) {
        setLotCadenceFeedback(null)
        setScreen({
          kind: 'saves',
          returnContext: {
            kind: 'lot',
            focus: 'next-event-reaction',
            receipt: session.receipt,
            suppressOperationalAnnouncement: lotOperationalAnnouncementSuppressed,
          },
        })
        return
      }
    }
    // Existing lot destinations are ordinary deep navigation, not part of the tick-generated
    // release chain. A later lot entry is fresh and may announce an already-operational Annex.
    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    const returnContext: StudioReturnContext = {
      kind: 'lot',
      focus: 'selected-building',
      suppressOperationalAnnouncement: false,
    }
    switch (route.kind) {
      case 'dashboard':
        setScreen({ kind: 'dashboard', returnContext })
        break
      case 'roster':
        setScreen({ kind: 'roster', returnContext })
        break
      case 'castingRoom':
        setScreen({ kind: 'castingRoom', returnContext })
        break
      case 'hiring':
        setScreen({ kind: 'hiring', returnContext })
        break
      case 'hub':
        setScreen({ kind: 'hub', returnContext })
        break
      case 'assembly':
        if (hollywoodEnabled) {
          const currentState = latestStateRef.current
          const currentScreen = latestScreenRef.current
          const currentPresentation = activeLotPresentationRef.current
          let board: ScriptProjectsReadModel | null = null
          try {
            board = currentState === null ? null : scriptProjectsBoard(currentState)
          } catch {
            board = null
          }
          if (
            currentState !== null &&
            currentState.scriptDevelopment.mode === 'managed' &&
            currentScreen.kind === 'lot' &&
            currentPresentation !== null &&
            board?.mode === 'managed' &&
            board.lotAttention.kind === 'idle' &&
            board.commission.canStart === true &&
            latestLotPackagePresentationRef.current.workspace === null &&
            latestLotPackagePresentationRef.current.liveFormation === null &&
            latestLotCommissionPresentationRef.current.workspace === null &&
            latestLotCommissionPresentationRef.current.liveReceipt === null &&
            latestOpenProfileIdRef.current === null
          ) {
            const active = typeof document === 'undefined' ? null : document.activeElement
            const workspace: LotCommissionWorkspaceSession = {
              phase: 'editing',
              identity: {},
              key: ++lotCommissionKeyRef.current,
              lotScreen: currentScreen,
              lotPresentation: currentPresentation,
              opener: active instanceof HTMLElement ? active : null,
              acceptedState: currentState,
            }
            lotCommissionActivationRef.current = null
            lotCommissionRejectedAttemptRef.current = null
            commitLotCommissionPresentation({ workspace, liveReceipt: null })
            return
          }
        }
        setScreen(
          state?.scriptDevelopment.mode === 'managed'
            ? { kind: 'writersRoom', returnContext }
            : { kind: 'assembly', returnContext },
        )
        break
      case 'saves':
        setScreen({ kind: 'saves', returnContext })
        break
      case 'studioDevelopment':
        setScreen({ kind: 'studioDevelopment', returnContext })
        break
    }
  }

  function handleAdvance(
    returnContext: StudioReturnContext,
    source: StudioActionSource,
  ) {
    if (source === 'mounted-lot' && !currentLotWorldInputOwner()) return
    if (!state) return
    // RULING A: advanceWeek ticks with development ON. The engine applies development
    // EXACTLY ONCE inside this single tick; we then replace the authoritative GameState
    // with `next` and never re-tick on re-render — so development is never double-applied.
    const { preTick, next, released, constructionCompletion } = advanceWeek(state)
    // Build the per-release development summary by DIFFING the pre-tick vs post-tick
    // talent (pure read of two immutable snapshots — no re-run of development).
    const development = buildReleaseDevelopment(preTick, next, released)
    replaceAuthoritativeState(next)
    // PF1-M2: one advance, one punctuation. `advanceWeek` carries no `SimStopReason` — it
    // never asked the engine to stop for anything — but it is still the tick a picture can
    // reach audiences on and the tick a building can be finished on, and the grammar owns
    // that priority so this call site does not have to.
    applyPunctuation(
      punctuateAdvanceWeek({
        toWeek: next.market.tick,
        released,
        constructionCompletion,
      }),
    )
    const resolvedReturnContext: StudioReturnContext =
      returnContext.kind === 'lot'
        ? {
            kind: 'lot',
            focus: 'advance-week',
            suppressOperationalAnnouncement:
              lotOperationalAnnouncementSuppressed || constructionCompletion !== null,
          }
        : returnContext
    if (resolvedReturnContext.kind === 'lot') {
      setLotCadenceFeedback(null)
      setLotOperationalAnnouncementSuppressed(
        resolvedReturnContext.suppressOperationalAnnouncement,
      )
    }
    const release = {
      preTick,
      postTickStanding: next.studio.standing,
      released,
      development,
      constructionCompletion,
      returnContext: resolvedReturnContext,
    }
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
    // World-First Live Week Advance V1: a no-release lot tick never changes screens. React
    // retains the mounted host/view and repaints it from the fresh authoritative state.
    if (released.length === 0 && resolvedReturnContext.kind === 'lot') {
      setLotCadenceFeedback({
        kind: 'week',
        week: next.market.tick,
        constructionCompletion,
      })
      if (source === 'supporting-dashboard') {
        setScreen({ kind: 'lot', entryFocus: 'advance-week' })
      }
      return
    }
    // D-11.C PART 2: when a film actually reaches audiences this week, the reveal is the
    // newspaper front page — shown ONCE, here, at release. Gazette eligibility decides only
    // whether Newspaper precedes ReleaseResult; released.length above owns release truth.
    const newspaperReleases = released
      .map((film) => ({ film, view: releaseNewspaper(next, film) }))
      .filter((entry): entry is { film: FilmResult; view: NewspaperView } => entry.view !== null)
    if (newspaperReleases.length > 0) {
      setScreen({
        kind: 'newspaper',
        source: 'release',
        views: newspaperReleases.map((entry) => entry.view),
        films: newspaperReleases.map((entry) => entry.film),
        constructionCompletion,
        returnContext: resolvedReturnContext,
        // The first post-tick surface owns the one-time item. Continuing from
        // the newspaper must not repeat it on ReleaseResult.
        release: { ...release, constructionCompletion: null },
      })
      return
    }
    setScreen({ kind: 'release', ...release })
  }

  function executePublicity(tier: PublicityTier): LotPublicityResult {
    const current = latestStateRef.current
    if (!current) return { ok: false, error: 'No operating studio is available.' }
    const acceptedWeek = current.market.tick
    const result = runPublicity(current, tier)
    if (!result.ok) return result
    if (
      result.next.publicity.lastUsedWeek !== acceptedWeek ||
      result.next.publicity.byTier[tier] !== acceptedWeek
    ) {
      // PF1-M3 VOICE PASS (charter §3), the named worst offender. This refusal became
      // player-visible when M3 routed it through the notice idiom, and it was raw engine
      // jargon: "Publicity successor failed exact acceptance receipt validation." The CHECK
      // is unchanged — the successor state must record this exact tier on this exact week or
      // nothing is applied — and the refusal now states fact, reason, way forward in that
      // order. Nothing was spent because `replaceAuthoritativeState` is never reached.
      return {
        ok: false,
        error:
          'The campaign was not booked — the studio could not find it on this week’s books. Nothing was spent; run it again.',
      }
    }
    replaceAuthoritativeState(result.next)
    applyPunctuation(punctuateCommit('publicity', acceptedWeek))
    return { ok: true, tier, acceptedWeek }
  }

  function handleDashboardPublicity(tier: PublicityTier) {
    const result = executePublicity(tier)
    if (!result.ok) {
      // PF1-M2: the refusal is heard where it is SURFACED, once — and since M3 it is also
      // SAID here, by the studio, in the same commit as the cue.
      punctuateRefusal(latestStateRef.current?.market.tick ?? 0)
      showNotice(result.error)
    }
  }

  function handleLotPublicity(tier: PublicityTier): LotPublicityResult {
    if (!currentLotWorldInputOwner()) {
      return { ok: false, error: 'The live Lot is suspended while Package decisions are open.' }
    }
    return executePublicity(tier)
  }

  function handleProductionCommand(
    command: ProductionCommandView,
    source: StudioActionSource = 'supporting-dashboard',
  ) {
    if (source === 'mounted-lot' && !currentLotWorldInputOwner()) return
    if (!state) return
    const result = runProductionCommand(state, command)
    if (result.ok) {
      replaceAuthoritativeState(result.next)
    } else {
      punctuateRefusal(state.market.tick)
      showNotice(result.error)
    }
    return result
  }

  // D-12.18: Sim to next event — advance many weeks through the engine, stopping before the
  // next blocking event. A release routes to the same newspaper/release flow as Advance (the
  // stop tick is exactly one tick after `preTick`); any other stop shows the weekly summary.
  function handleSimToEvent(returnContext: StudioReturnContext) {
    if (!state) return
    const result = advanceToNextEvent(state)
    replaceAuthoritativeState(result.next)
    // PF1-M2: the governed stop is the receipt. One stop, one punctuation, whatever the
    // week count — a forty-week batch is not forty beats (operational law 3).
    applyPunctuation(punctuateSimResult(result))
    const demotedReturnContext = withoutTransientWorldReturnIntent(returnContext)
    const resolvedReturnContext: StudioReturnContext =
      demotedReturnContext.kind === 'lot'
        ? {
            ...demotedReturnContext,
            suppressOperationalAnnouncement:
              lotOperationalAnnouncementSuppressed || result.constructionCompletion !== null,
          }
        : demotedReturnContext
    if (resolvedReturnContext.kind === 'lot') {
      setLotCadenceFeedback(null)
      setLotOperationalAnnouncementSuppressed(
        resolvedReturnContext.suppressOperationalAnnouncement,
      )
    }
    if (result.released.length > 0) {
      const development = buildReleaseDevelopment(result.preTick, result.next, result.released)
      const release = {
        preTick: result.preTick,
        postTickStanding: result.next.studio.standing,
        released: result.released,
        development,
        constructionCompletion: result.constructionCompletion,
        returnContext: resolvedReturnContext,
      }
      setSnapshots((prev) => {
        const merged = { ...prev }
        for (const f of result.released) {
          merged[f.productionId] = { preTick: result.preTick, postTickStanding: result.next.studio.standing }
        }
        return merged
      })
      const newspaperReleases = result.released
        .map((film) => ({ film, view: releaseNewspaper(result.next, film) }))
        .filter((entry): entry is { film: FilmResult; view: NewspaperView } => entry.view !== null)
      if (newspaperReleases.length > 0) {
        setScreen({
          kind: 'newspaper',
          source: 'release',
          views: newspaperReleases.map((entry) => entry.view),
          films: newspaperReleases.map((entry) => entry.film),
          constructionCompletion: result.constructionCompletion,
          returnContext: resolvedReturnContext,
          release: { ...release, constructionCompletion: null },
        })
        return
      }
      setScreen({ kind: 'release', ...release })
      return
    }
    setScreen({
      kind: 'periodSummary',
      summary: result.summary,
      stopReason: result.stopReason,
      stopMessage: result.stopMessage, // D-12 P1.3: engine-derived; the UI never infers the reason
      weeks: result.weeks,
      cashNow: result.next.studio.cash,
      constructionCompletion: result.constructionCompletion,
      returnContext: resolvedReturnContext,
    })
  }

  // World-First Lot-Native Next-Event Cadence V1. This is intentionally separate from the
  // Dashboard compatibility handler above: non-release results stay on the same mounted Lot.
  // The exact rendered object, latest-state ref, and one synchronous claim together prevent a
  // stale callback or compatibility tail from running the adapter twice.
  function handleLotSimToEvent(renderedBefore: GameState): boolean {
    const current = latestStateRef.current
    if (
      current === null ||
      current !== renderedBefore ||
      !currentLotWorldInputOwner() ||
      lotNextEventActivationRef.current !== null ||
      latestOpenProfileIdRef.current !== null
    ) return false

    try {
      if (studioDecision(current) !== null) return false
    } catch {
      // The alert this replaces was BLOCKING, and the early return below was reached only
      // after the player dismissed it. Nothing is dispatched on this path either way: the
      // activation claim was never taken, so the notice cannot race a state replacement.
      punctuateRefusal(current.market.tick)
      showNotice('The studio could not verify whether a decision is already waiting.')
      return false
    }

    lotNextEventActivationRef.current = current
    let result
    try {
      result = advanceToNextEvent(current)
    } catch {
      // The activation claim is released BEFORE the notice, exactly as it was released
      // before the blocking alert: the lot must be operable again the moment the studio
      // refuses, not only once the player has acknowledged the refusal.
      lotNextEventActivationRef.current = null
      punctuateRefusal(current.market.tick)
      showNotice('The studio could not advance to the next event. The current lot is unchanged.')
      return false
    }

    // `advanceToNextEvent` is synchronous. A hostile nested owner that replaced App state in the
    // same stack cannot let this older result overwrite its successor.
    if (
      lotNextEventActivationRef.current !== current ||
      latestStateRef.current !== current
    ) {
      lotNextEventActivationRef.current = null
      return false
    }

    const acceptedCompletion = acceptedLotNextEventConstructionCompletion(current, result)
    const suppressOperationalAnnouncement =
      acceptedCompletion !== null || operationalAnnexAnnouncementAlreadyOwned(result.next)
    const hasRelease = Array.isArray(result.released) && result.released.length > 0
    let acceptedReceipt: LotNextEventReceipt | null = null
    let acceptedNeutral: Extract<LotCadenceFeedback, { kind: 'next-event-neutral' }> | null = null
    if (!hasRelease) {
      try {
        acceptedReceipt = acceptedLotNextEventReceipt(current, result)
      } catch {
        acceptedReceipt = null
      }
      if (acceptedReceipt === null) {
        acceptedNeutral = result.stopReason === 'limit'
          ? acceptedLotNextEventGuardNeutral(current, result)
          : lotNextEventNeutralFeedback(current, result)
      }
    }

    if (hasRelease) {
      replaceAuthoritativeState(result.next)
    } else {
      replaceMountedLotAuthoritativeState(result.next)
    }
    setLotOperationalAnnouncementSuppressed(suppressOperationalAnnouncement)
    // PF1-M2: punctuate only AFTER the claim has survived every staleness guard above and
    // the successor has actually been committed. A rejected or superseded result makes no
    // sound at all — that is what "reacts to truth" means at a contested gate.
    applyPunctuation(punctuateSimResult(result))

    if (hasRelease) {
      const returnContext: StudioReturnContext = {
        kind: 'lot',
        focus: 'next-event-control',
        suppressOperationalAnnouncement,
      }
      const development = buildReleaseDevelopment(
        result.preTick,
        result.next,
        result.released,
      )
      const release = {
        preTick: result.preTick,
        postTickStanding: result.next.studio.standing,
        released: result.released,
        development,
        constructionCompletion: acceptedCompletion,
        returnContext,
      }
      setSnapshots((previous) => {
        const merged = { ...previous }
        for (const film of result.released) {
          merged[film.productionId] = {
            preTick: result.preTick,
            postTickStanding: result.next.studio.standing,
          }
        }
        return merged
      })
      const newspaperReleases = result.released
        .map((film) => ({ film, view: releaseNewspaper(result.next, film) }))
        .filter(
          (entry): entry is { film: FilmResult; view: NewspaperView } =>
            entry.view !== null,
        )
      if (newspaperReleases.length > 0) {
        setScreen({
          kind: 'newspaper',
          source: 'release',
          views: newspaperReleases.map((entry) => entry.view),
          films: newspaperReleases.map((entry) => entry.film),
          constructionCompletion: acceptedCompletion,
          returnContext,
          release: { ...release, constructionCompletion: null },
        })
      } else {
        setScreen({ kind: 'release', ...release })
      }
      return true
    }

    if (acceptedReceipt !== null) {
      lotNextEventSessionRef.current = {
        acceptedState: result.next,
        receipt: acceptedReceipt,
      }
      setLotCadenceFeedback({ kind: 'next-event-exact', receipt: acceptedReceipt })
      return true
    }

    lotNextEventSessionRef.current = null
    if (acceptedNeutral !== null) {
      setLotCadenceFeedback(acceptedNeutral)
      return true
    }

    // The real adapter always supplies finite final primitives. This branch is defensive against
    // a hostile boundary replacement: accept no presentation claim that was not independently safe.
    // The successor was ALREADY committed above (and autosaved) before this branch is
    // reached — the alert this replaces blocked after the dispatch, never before it. The
    // notice therefore lands in the same commit as the state replacement that bumped the
    // epoch, which is precisely the ordering the transient-notice hook is written for.
    setLotCadenceFeedback(null)
    punctuateRefusal(result.next.market.tick)
    showNotice('The studio advanced, but exact event details were unavailable. Review the current lot.')
    return true
  }

  function demoteLotNextEventReceipt(expected?: {
    acceptedState: GameState
    receipt: LotNextEventReceipt
  }): false {
    const session = lotNextEventSessionRef.current
    const current = latestStateRef.current
    if (
      expected !== undefined &&
      (
        session === null ||
        session.acceptedState !== expected.acceptedState ||
        !sameLotNextEventReceipt(session.receipt, expected.receipt)
      )
    ) return false
    lotNextEventSessionRef.current = null
    if (session === null || current !== session.acceptedState) {
      setLotCadenceFeedback(null)
      return false
    }
    setLotCadenceFeedback({
      kind: 'next-event-neutral',
      toWeek: session.receipt.toWeek,
      cashNow: session.receipt.cashNow,
      stopMessage: 'Studio event details changed. Review the current lot.',
      // An exact rail already presented any independently valid co-event. A later stale deep
      // action must not remount and announce the same completion a second time.
      constructionCompletion: null,
    })
    return false
  }

  function handleOpenLotNextEventDetails(
    renderedState: GameState,
    receipt: LotNextEventReceipt,
  ): boolean {
    const current = latestStateRef.current
    const session = lotNextEventSessionRef.current
    const expected = { acceptedState: renderedState, receipt }
    const demoteRendered = () => demoteLotNextEventReceipt(expected)
    if (
      !currentLotWorldInputOwner() ||
      current === null ||
      session === null ||
      current !== renderedState ||
      current !== session.acceptedState ||
      !sameLotNextEventReceipt(receipt, session.receipt)
    ) return demoteRendered()

    const returnContext: StudioReturnContext = {
      kind: 'lot',
      focus: 'next-event-reaction',
      receipt: session.receipt,
      suppressOperationalAnnouncement:
        session.receipt.constructionCompletion !== null ||
        operationalAnnexAnnouncementAlreadyOwned(current),
    }

    try {
      switch (receipt.target.kind) {
        case 'script': {
          const review = currentLotScriptReviewContext(current, {
            projectId: receipt.target.projectId,
            title: receipt.target.title,
          })
          if (review === null) return demoteRendered()
          setScreen({
            kind: 'writersRoom',
            returnContext,
            focusProjectId: review.projectId,
          })
          return true
        }
        case 'casting': {
          const review = currentLotCastingReviewContext(current, {
            sessionId: receipt.target.sessionId,
            projectId: receipt.target.projectId,
            title: receipt.target.title,
          })
          if (review === null) return demoteRendered()
          setScreen({
            kind: 'castingRoom',
            returnContext,
            focusCastingDecision: {
              sessionId: review.sessionId,
              projectId: review.projectId,
            },
          })
          return true
        }
        case 'production': {
          const target = receipt.target
          const decision = studioDecision(current)
          const location = target.location === 'stage-7' ? 'stage-a' : 'stage-b'
          const operations = (studioLotSnapshot(current).productionOperations ?? []).filter(
            (operation) => operation.productionId === target.productionId,
          )
          if (
            decision?.kind !== 'productionDecision' ||
            decision.decision.productionId !== target.productionId ||
            decision.decision.title !== target.title ||
            currentLotNextEventProductionCommand(current, receipt) === null ||
            operations.length !== 1 ||
            operations[0]?.locationBuildingId !== location
          ) return demoteRendered()
          setScreen({
            kind: 'dashboard',
            returnContext,
            focusProductionId: target.productionId,
          })
          return true
        }
        case 'run-completed':
          setScreen({ kind: 'dashboard', returnContext, focusSection: 'releases' })
          return true
        case 'cash':
          setScreen({ kind: 'dashboard', returnContext, focusSection: 'finances' })
          return true
        case 'contracts':
          setScreen({ kind: 'roster', returnContext, focusHeadingOnMount: true })
          return true
        case 'construction': {
          // C1-M1b: a completion that was NOT the legacy Annex used to fall through this
          // legacy-only check and demote to neutral feedback — the facility genuinely
          // finished, and the one surface that would have said so declined to. It is
          // verified against the placement root now, which is the authority that owns
          // every facility standing on the property, and named by its own world id.
          const placedId = placedFacilityIdOf(receipt.target.buildingId)
          if (placedId !== null) {
            const placements = studioPlacement(current).placements.filter(
              (placed) => placed.id === placedId,
            )
            const placed = placements.length === 1 ? placements[0]! : null
            if (
              placed === null ||
              placed.status !== 'operational' ||
              placed.facilityId !== receipt.target.facilityId ||
              placed.name !== receipt.target.name ||
              placed.completesWeek !== receipt.constructionCompletion?.completedWeek
            ) return demoteRendered()
            setScreen({ kind: 'studioDevelopment', returnContext })
            return true
          }
          const development = studioDevelopment(current)
          if (
            development.status !== 'operational' ||
            development.projectId !== receipt.target.projectId ||
            development.facilityId !== receipt.target.facilityId ||
            development.name !== receipt.target.name ||
            development.completedWeek !== receipt.constructionCompletion?.completedWeek
          ) return demoteRendered()
          setScreen({ kind: 'studioDevelopment', returnContext })
          return true
        }
      }
    } catch {
      return demoteRendered()
    }
  }

  function handleOpenLotScriptReviewDetails(
    renderedState: GameState,
    renderedContext: LotScriptReviewContext,
  ): boolean {
    const current = latestStateRef.current
    if (
      !currentLotWorldInputOwner() ||
      current === null ||
      current !== renderedState ||
      lotNextEventSessionRef.current !== null
    ) return false

    const latest = currentLotScriptReviewContext(current)
    if (latest === null || !sameLotScriptReviewContext(renderedContext, latest)) return false

    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen({
      kind: 'writersRoom',
      returnContext: {
        kind: 'lot',
        focus: 'script-review',
        target: {
          projectId: latest.projectId,
          title: latest.title,
        },
        suppressOperationalAnnouncement: false,
      },
      focusProjectId: latest.projectId,
    })
    return true
  }

  function handleLotScriptReviewAction(
    renderedState: GameState,
    renderedContext: LotScriptReviewContext,
    renderedAction: LotScriptReviewAction,
    receipt: LotNextEventReceipt | null,
  ): ActionOutcome {
    if (!currentLotWorldInputOwner()) {
      return { ok: false, error: 'The live Lot is suspended while Package decisions are open.' }
    }
    if (lotScriptReviewActivationRef.current !== null) {
      return {
        ok: false,
        error: 'Screenplay review action is already being resolved.',
      }
    }
    const current = latestStateRef.current
    const session = lotNextEventSessionRef.current
    const stale = (): ActionOutcome => {
      if (receipt !== null) {
        demoteLotNextEventReceipt({ acceptedState: renderedState, receipt })
      }
      return {
        ok: false,
        error: 'Screenplay review details changed. Review the current lot.',
      }
    }
    if (current === null || current !== renderedState) return stale()

    let target: { projectId: string; title: string } | undefined
    if (receipt !== null) {
      try {
        if (
          session === null ||
          current !== session.acceptedState ||
          !sameLotNextEventReceipt(receipt, session.receipt) ||
          receipt.target.kind !== 'script'
        ) return stale()
        target = {
          projectId: receipt.target.projectId,
          title: receipt.target.title,
        }
      } catch {
        return stale()
      }
    } else if (session !== null) {
      // A receipt-owned ceremony may not silently downgrade into the pending path.
      return stale()
    }

    const latest = currentLotScriptReviewContext(current, target)
    if (
      latest === null ||
      !sameLotScriptReviewContext(renderedContext, latest)
    ) return stale()
    const currentActions = latest.legalActions.filter(
      (candidate) => candidate.kind === renderedAction.kind,
    )
    if (
      currentActions.length !== 1 ||
      !sameLotScriptReviewAction(renderedAction, currentActions[0]!)
    ) return stale()

    const activation = {
      renderedState: current,
      context: latest,
      action: currentActions[0]!,
      source: receipt === null
        ? { kind: 'pending' as const }
        : {
            kind: 'event' as const,
            session: session!,
            receipt: session!.receipt,
          },
    }
    lotScriptReviewActivationRef.current = activation

    if (receipt !== null) {
      // Consume event ownership before dispatch. A nested or delayed activation tail is stale.
      lotNextEventSessionRef.current = null
      setLotCadenceFeedback(null)
    }
    const result = runScriptProjectAction(current, currentActions[0]!)
    if (latestStateRef.current !== current) {
      lotScriptReviewActivationRef.current = null
      return {
        ok: false,
        error: 'The studio changed while the screenplay action was resolving.',
      }
    }
    if (result.ok) {
      replaceMountedLotAuthoritativeState(result.next)
      return result
    }

    const rejectedActivation = lotScriptReviewActivationRef.current
    window.setTimeout(() => {
      if (lotScriptReviewActivationRef.current === rejectedActivation) {
        lotScriptReviewActivationRef.current = null
      }
    }, 0)
    if (
      receipt === null ||
      session === null ||
      activation.source.kind !== 'event'
    ) return result

    // A rejected Engine action has no successor. Restore the ceremony only while every exact
    // receipt, review, and action fact still agrees with the unchanged accepted state.
    const restored = latestStateRef.current === current
      ? currentLotScriptReviewContext(current, target)
      : null
    const restoredActions = restored?.legalActions.filter(
      (candidate) => candidate.kind === currentActions[0]!.kind,
    ) ?? []
    if (
      lotScriptReviewActivationRef.current === activation &&
      lotNextEventSessionRef.current === null &&
      activation.source.session === session &&
      activation.source.session.acceptedState === current &&
      sameLotNextEventReceipt(activation.source.receipt, session.receipt) &&
      sameLotNextEventReceipt(receipt, activation.source.receipt) &&
      restored !== null &&
      sameLotScriptReviewContext(latest, restored) &&
      restoredActions.length === 1 &&
      sameLotScriptReviewAction(currentActions[0]!, restoredActions[0]!)
    ) {
      lotNextEventSessionRef.current = session
      setLotCadenceFeedback({ kind: 'next-event-exact', receipt: session.receipt })
    } else if (lotNextEventSessionRef.current === null) {
      lotNextEventSessionRef.current = session
      demoteLotNextEventReceipt({ acceptedState: current, receipt: session.receipt })
    }
    return result
  }

  function handleOpenLotCastingReviewDetails(
    renderedState: GameState,
    renderedContext: LotCastingReviewContext,
  ): boolean {
    const current = latestStateRef.current
    if (
      !currentLotWorldInputOwner() ||
      current === null ||
      current !== renderedState ||
      lotNextEventSessionRef.current !== null
    ) return false

    const target: LotCastingReviewTarget = {
      sessionId: renderedContext.sessionId,
      projectId: renderedContext.projectId,
      title: renderedContext.title,
    }
    const latest = currentLotCastingReviewContext(current, target)
    if (latest === null || !sameLotCastingReviewContext(renderedContext, latest)) return false

    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen({
      kind: 'castingRoom',
      returnContext: {
        kind: 'lot',
        focus: 'casting-review',
        target,
        suppressOperationalAnnouncement: false,
      },
      focusCastingDecision: {
        sessionId: latest.sessionId,
        projectId: latest.projectId,
      },
    })
    return true
  }

  function handleLotCastingReviewAction(
    renderedState: GameState,
    renderedContext: LotCastingReviewContext,
    renderedAction: LotCastingReviewAction,
    receipt: LotNextEventReceipt | null,
  ): ActionOutcome {
    if (!currentLotWorldInputOwner()) {
      return { ok: false, error: 'The live Lot is suspended while Package decisions are open.' }
    }
    if (lotCastingReviewActivationRef.current !== null) {
      return {
        ok: false,
        error: 'Casting review action is already being resolved.',
      }
    }
    const current = latestStateRef.current
    const lotScreen = latestScreenRef.current
    const lotPresentation = activeLotPresentationRef.current
    const session = lotNextEventSessionRef.current
    const stale = (): ActionOutcome => {
      if (receipt !== null) {
        demoteLotNextEventReceipt({ acceptedState: renderedState, receipt })
      }
      return {
        ok: false,
        error: 'Casting review details changed. Review the current lot.',
      }
    }
    if (
      current === null ||
      current !== renderedState ||
      lotScreen.kind !== 'lot' ||
      lotPresentation === null ||
      latestOpenProfileIdRef.current !== null
    ) return stale()

    let target: LotCastingReviewTarget | undefined
    if (receipt !== null) {
      try {
        if (
          session === null ||
          current !== session.acceptedState ||
          !sameLotNextEventReceipt(receipt, session.receipt) ||
          receipt.target.kind !== 'casting'
        ) return stale()
        target = {
          sessionId: receipt.target.sessionId,
          projectId: receipt.target.projectId,
          title: receipt.target.title,
        }
      } catch {
        return stale()
      }
    } else if (session !== null) {
      // An exact cadence ceremony may never be silently downgraded to the pending path.
      return stale()
    }

    const latest = currentLotCastingReviewContext(current, target)
    if (
      latest === null ||
      !sameLotCastingReviewContext(renderedContext, latest) ||
      !sameLotCastingReviewAction(renderedAction, latest.action)
    ) return stale()

    const activation = {
      renderedState: current,
      context: latest,
      action: latest.action,
      source: receipt === null
        ? { kind: 'pending' as const }
        : {
            kind: 'event' as const,
            session: session!,
            receipt: session!.receipt,
          },
    }
    lotCastingReviewActivationRef.current = activation
    const returnContext: StudioReturnContext = receipt === null
      ? {
          kind: 'lot',
          focus: 'casting-review',
          target: {
            sessionId: latest.sessionId,
            projectId: latest.projectId,
            title: latest.title,
          },
          suppressOperationalAnnouncement: false,
        }
      : {
          kind: 'lot',
          focus: 'next-event-reaction',
          receipt: session!.receipt,
          suppressOperationalAnnouncement:
            session!.receipt.constructionCompletion !== null ||
            operationalAnnexAnnouncementAlreadyOwned(current),
        }

    if (receipt !== null) {
      // Event ownership ends before the one Engine dispatch, closing nested and delayed tails.
      lotNextEventSessionRef.current = null
      setLotCadenceFeedback(null)
    }
    const result = acknowledgeCastingSessionAction(current, latest.action.sessionId)
    if (latestStateRef.current !== current) {
      lotCastingReviewActivationRef.current = null
      return {
        ok: false,
        error: 'The studio changed while the casting action was resolving.',
      }
    }
    if (result.ok) {
      const success = acceptedLotCastingReviewSuccess(
        latest,
        latest.action,
        current,
        result.next,
      )
      replaceMountedLotAuthoritativeState(result.next)
      if (success?.kind === 'clear') {
        const active = typeof document === 'undefined' ? null : document.activeElement
        lotCastingPackageHandoffRef.current = {
          before: current,
          next: result.next,
          lotScreen,
          lotPresentation,
          context: latest,
          action: latest.action,
          returnContext,
          opener: active instanceof HTMLElement ? active : null,
        }
      }
      return result
    }

    const rejectedActivation = lotCastingReviewActivationRef.current
    window.setTimeout(() => {
      if (lotCastingReviewActivationRef.current === rejectedActivation) {
        lotCastingReviewActivationRef.current = null
      }
    }, 0)
    if (
      receipt === null ||
      session === null ||
      activation.source.kind !== 'event'
    ) return result

    // A rejected action has no successor. Restore the ceremony only while its entire closed
    // receipt, review, and sole action remain exact in the unchanged accepted state.
    const restored = latestStateRef.current === current
      ? currentLotCastingReviewContext(current, target)
      : null
    if (
      lotCastingReviewActivationRef.current === activation &&
      lotNextEventSessionRef.current === null &&
      activation.source.session === session &&
      activation.source.session.acceptedState === current &&
      sameLotNextEventReceipt(activation.source.receipt, session.receipt) &&
      sameLotNextEventReceipt(receipt, activation.source.receipt) &&
      restored !== null &&
      sameLotCastingReviewContext(latest, restored) &&
      sameLotCastingReviewAction(latest.action, restored.action)
    ) {
      lotNextEventSessionRef.current = session
      setLotCadenceFeedback({ kind: 'next-event-exact', receipt: session.receipt })
    } else if (lotNextEventSessionRef.current === null) {
      lotNextEventSessionRef.current = session
      demoteLotNextEventReceipt({ acceptedState: current, receipt: session.receipt })
    }
    return result
  }

  function handleLotNextEventProductionCommand(
    receipt: LotNextEventReceipt,
    command: ProductionCommandView,
  ) {
    if (!currentLotWorldInputOwner()) {
      return {
        ok: false as const,
        error: 'The live Lot is suspended while Package decisions are open.',
      }
    }
    const current = latestStateRef.current
    const session = lotNextEventSessionRef.current
    const currentCommand = current === null
      ? null
      : currentLotNextEventProductionCommand(current, receipt)
    if (
      current === null ||
      session === null ||
      current !== session.acceptedState ||
      !sameLotNextEventReceipt(receipt, session.receipt) ||
      currentCommand === null ||
      !sameLotNextEventProductionCommand(command, currentCommand)
    ) {
      demoteLotNextEventReceipt()
      return {
        ok: false as const,
        error: 'Studio event details changed. Review the current lot.',
      }
    }

    // The exact event owns this command only until dispatch. Consume that ownership
    // synchronously so a nested/delayed tail cannot issue a successor command.
    lotNextEventSessionRef.current = null
    setLotCadenceFeedback(null)
    const result = runProductionCommand(current, currentCommand)
    if (result.ok) {
      replaceAuthoritativeState(result.next)
      return result
    }

    // Engine rejection produced no successor. Restore only if the exact accepted
    // state, complete receipt, and projected command all remain unchanged.
    const restoredCommand = latestStateRef.current === current
      ? currentLotNextEventProductionCommand(current, session.receipt)
      : null
    if (
      restoredCommand !== null &&
      sameLotNextEventProductionCommand(currentCommand, restoredCommand)
    ) {
      lotNextEventSessionRef.current = session
      setLotCadenceFeedback({ kind: 'next-event-exact', receipt: session.receipt })
    } else {
      lotNextEventSessionRef.current = session
      demoteLotNextEventReceipt()
    }
    return result
  }

  function handleInvalidLotNextEventPresentation(
    renderedState: GameState,
    receipt: LotNextEventReceipt,
  ): false {
    if (!currentLotWorldInputOwner()) return false
    const session = lotNextEventSessionRef.current
    const current = latestStateRef.current
    if (
      session === null ||
      current !== renderedState ||
      current !== session.acceptedState
    ) return false
    const receiptIsClosed = sameLotNextEventReceipt(receipt, receipt)
    if (receiptIsClosed && !sameLotNextEventReceipt(receipt, session.receipt)) return false
    // A malformed presentation cannot be compared field-for-field. Rendered-state identity
    // still binds it to this one accepted session, whose canonical receipt is the only token
    // authorized for consumption. A stale state can never clear a newer session.
    return demoteLotNextEventReceipt({
      acceptedState: current,
      receipt: session.receipt,
    })
  }

  function handleDismissLotNextEvent() {
    if (!currentLotWorldInputOwner()) return
    lotNextEventSessionRef.current = null
    setLotCadenceFeedback(null)
  }

  // D-11.C PART 2: re-open a film's newspaper clipping after the fact (dashboard / record).
  // Reconstructed purely from persisted state (participants + forecast + ledger), so it
  // survives save/reload. Continue returns to the root that opened the clipping; the
  // clipping is not "news" any more, so there is no release summary to hand back to.
  function openClippingForFilm(
    film: FilmResult,
    returnContext: StudioReturnContext = DASHBOARD_RETURN_CONTEXT,
  ) {
    if (!state) return
    const view = releaseNewspaper(state, film)
    if (!view) {
      punctuateRefusal(state.market.tick)
      // PF1-M3 VOICE PASS (charter §3): the internal decision citation "(D-11.A)" was a
      // developer reference the player cannot look up. The honest explanation is unchanged.
      showNotice(
        'This film has no archived front page. A newspaper clipping is kept only for films ' +
          'released with a full participant record; older films predate that record.',
      )
      return
    }
    setScreen({
      kind: 'newspaper',
      source: 'clipping',
      views: [view],
      films: [film],
      constructionCompletion: null,
      returnContext,
    })
  }

  // Film Chronicle V1: durable, persisted-data record. This is deliberately a
  // separate action from the exact session-only mathematical autopsy.
  function openChronicleForFilm(
    film: FilmResult,
    returnContext: StudioReturnContext = DASHBOARD_RETURN_CONTEXT,
  ) {
    if (!state) return
    const record = filmRecordView(state, film)
    if (record) {
      setScreen({ kind: 'filmRecord', view: record, returnContext })
      return
    }
    punctuateRefusal(state.market.tick)
    showNotice(
      'This older film predates the frozen participant record required for a Film Chronicle.',
    )
  }

  // Open the exact autopsy for a film with a retained snapshot (dashboard path).
  function openAutopsyForFilm(
    film: FilmResult,
    returnContext: StudioReturnContext = DASHBOARD_RETURN_CONTEXT,
  ) {
    const snap = snapshots[film.productionId]
    if (!snap) {
      punctuateRefusal(latestStateRef.current?.market.tick ?? 0)
      showNotice(
        'The full autopsy needs the studio state from just before this film released. ' +
          'That snapshot is kept only for films that released while you were playing this session. ' +
          'Open the film’s Chronicle for its durable production record.',
      )
      return
    }
    // D-12 P5: films that released the SAME week (studio standing moves once per week, shared across them).
    const sameWeekReleases = state
      ? state.studio.releasedFilms
          .filter((rf) => rf.releaseTick === film.releaseTick && rf.productionId !== film.productionId)
          .map((rf) => ({ productionId: rf.productionId, title: findConcept(state, rf.conceptId)?.title ?? rf.conceptId }))
      : []
    const view = explainRelease(snap.preTick, snap.postTickStanding, film, sameWeekReleases)
    // Locked greenlight expectation vs actual (the compare panel). Uses the same retained
    // pre-tick snapshot; null only if the production is not in the pre-tick active list.
    const compare = autopsyCompare(snap.preTick, film)
    setScreen({ kind: 'autopsy', view, compare, returnContext })
  }

  // Recovery/migration notices sit outside the routed screen tree. Include them in the same
  // background inert boundary as the mounted Lot so a retained workspace or Profile is the only
  // virtual-AT/programmatic owner, not merely the only pointer-visible owner.
  const backgroundModalOpen =
    openProfileId !== null ||
    lotPackagePresentation.workspace !== null ||
    lotCommissionPresentation.workspace !== null ||
    lotAuditionPresentation.workspace !== null ||
    settingsOpen ||
    confirmNewGame

  // A concise, dismissible line about how this session opened. Two registers, one element:
  // a continuation is a quiet fact and reads like one; a quarantined payload is an alarm and
  // is the only case allowed to sound like one (`data-recovery` names which, for the gates).
  const recoveryBanner = recovery && (
    <div
      className="card"
      data-testid="recovery-notice"
      data-recovery={recovery.kind}
      role="status"
      style={{ marginBottom: 12 }}
      inert={backgroundModalOpen || undefined}
      aria-hidden={backgroundModalOpen || undefined}
    >
      <div className="spread">
        <span>
          {recovery.kind === 'continuing'
            ? `Continuing your studio — Week ${recovery.week}.`
            : 'Could not recover your last studio (the saved session was unreadable). Your manual saves are unaffected — start a new studio or load a save.'}
        </span>
        <button className="ghost" onClick={() => setRecovery(null)} data-testid="recovery-dismiss">
          Dismiss
        </button>
      </div>
    </div>
  )

  // One condition, one notice, always in the same place: the studio is not being written down.
  const persistenceBanner = !persistenceOk && state !== null && (
    <PersistenceNotice background={backgroundModalOpen} />
  )

  // The studio's answer where the browser used to speak.
  const appNoticeBanner = appNotice !== null && (
    <AppNotice
      key={appNotice.key}
      message={appNotice.message}
      background={backgroundModalOpen}
      onDismiss={dismissNotice}
    />
  )

  // Settings is hosted by whichever surface opened it. On the Lot that MUST be the retained
  // workspace host, because the authoritative renderer stays mounted underneath and the world
  // is suspended, not torn down (laws 7/8/9/26). Everywhere else there is no renderer to
  // protect, so the shell's own dialog does the same containment with less ceremony.
  const settingsDialog = settingsOpen && (
    screen.kind === 'lot' ? (
      <LotRetainedWorkspace
        layerClassName="lot-settings-layer"
        layerTestId="lot-settings-layer"
        dialogClassName="lot-settings-workspace"
        dialogTestId="settings-dialog"
        titleId="lot-settings-title"
        descriptionId="lot-settings-description"
        title="Studio settings"
        description="Sound and motion for this studio. Nothing here changes the picture you are making."
        nestedModalOpen={openProfileId !== null}
        onEscape={() => setSettingsOpen(false)}
      >
        <SettingsOverlay onClose={() => setSettingsOpen(false)} />
      </LotRetainedWorkspace>
    ) : (
      <ShellDialog
        titleId="shell-settings-title"
        descriptionId="shell-settings-description"
        title="Studio settings"
        description="Sound and motion for this studio. Nothing here changes the picture you are making."
        dialogTestId="settings-dialog"
        layerTestId="settings-dialog-layer"
        onDismiss={() => setSettingsOpen(false)}
      >
        <SettingsOverlay onClose={() => setSettingsOpen(false)} />
      </ShellDialog>
    )
  )

  const newGameConfirmDialog = confirmNewGame && (
    <ConfirmDialog
      title="Start a new studio?"
      body="This replaces the studio you are running now. Export a print first if you want to keep it."
      confirmLabel="Start a new studio"
      cancelLabel="Keep this studio"
      onConfirm={performNewGame}
      onCancel={() => setConfirmNewGame(false)}
    />
  )

  const saveMigrationBanner = saveMigrationNotice && (
    <div
      className="card"
      data-testid="save-migration-notice"
      role="status"
      style={{ marginBottom: 12 }}
      inert={backgroundModalOpen || undefined}
      aria-hidden={backgroundModalOpen || undefined}
    >
      <div className="spread">
        <span>
          An older save was upgraded to the current format. Export now if you want a separate copy
          in the current format.
        </span>
        <button
          className="ghost"
          onClick={() => setSaveMigrationNotice(false)}
          data-testid="save-migration-dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  )

  if (!state || screen.kind === 'start') {
    return (
      <DevErrorBoundary>
        {recoveryBanner}
        {saveMigrationBanner}
        {persistenceBanner}
        {appNoticeBanner}
        <StartScreen onStart={startGame} />
        {newGameConfirmDialog}
      </DevErrorBoundary>
    )
  }

  const loadedState = state
  const dashboardDeepReturnContext = screen.kind === 'dashboard'
    ? withoutTransientWorldReturnIntent(screen.returnContext)
    : DASHBOARD_RETURN_CONTEXT

  // World-First Annex Construction Interaction V1: App remains the sole state owner.
  // The lot sends no caller-controlled construction data; this exact current state is
  // passed to the existing parameter-free adapter action once, and the exact outcome is
  // returned so the mounted world can own focus and announcement presentation.
  function handleStartDevelopmentCastingAnnex() {
    if (!currentLotWorldInputOwner()) {
      return { ok: false as const, error: 'The live Lot is suspended while Package decisions are open.' }
    }
    const result = startDevelopmentCastingAnnexAction(loadedState)
    if (result.ok) {
      replaceAuthoritativeState(result.next)
      // Breaking ground is its own family — the studio starting a building does not
      // sound like signing a form.
      applyPunctuation(punctuateCommit('build-commit', result.next.market.tick))
    }
    return result
  }

  // Build Mode V1: the same owner, the same discipline. The Lot supplies only a
  // blueprint id and an origin; the Engine's own commit re-runs its query and charges
  // its own price, and the accepted state is replaced (and autosaved) exactly once.
  function handlePlaceFacility(placement: PlacementRequest) {
    if (!currentLotWorldInputOwner()) {
      return { ok: false as const, error: 'The live Lot is suspended while Package decisions are open.' }
    }
    const result = placeFacilityAction(loadedState, placement)
    if (result.ok) {
      replaceAuthoritativeState(result.next)
      applyPunctuation(punctuateCommit('build-commit', result.next.market.tick))
    }
    return result
  }

  // Move & Demolish V1 (C1-M3b). The same owner shape, for the same reason: the Lot
  // sends an identity (and, for a move, an origin) and nothing else. Legality, price
  // and refund are re-derived by the Engine inside the action, which returns the SAME
  // state by reference when it refuses — so an unchanged identity IS "nothing happened",
  // and `replaceAuthoritativeState` is never called on a refusal.
  function handleMoveFacility(move: FacilityMoveRequest) {
    if (!currentLotWorldInputOwner()) {
      return { ok: false as const, error: 'The live Lot is suspended while Package decisions are open.' }
    }
    const result = moveFacilityAction(loadedState, move)
    if (result.ok && result.next !== loadedState) {
      replaceAuthoritativeState(result.next)
      applyPunctuation(punctuateCommit('move-commit', result.next.market.tick))
    }
    return result
  }

  function handleDemolishFacility(demolition: FacilityDemolitionRequest) {
    if (!currentLotWorldInputOwner()) {
      return { ok: false as const, error: 'The live Lot is suspended while Package decisions are open.' }
    }
    const result = demolishFacilityAction(loadedState, demolition)
    if (result.ok && result.next !== loadedState) {
      replaceAuthoritativeState(result.next)
      applyPunctuation(punctuateCommit('demolish-commit', result.next.market.tick))
    }
    return result
  }

  // World-First Operational Annex Work Presence V1: the Lot may offer a deep owner only
  // after world inspection. Re-read the one canonical Calendar slot at activation time so a
  // completed/replaced occupant can never route by stale presentation text or array position.
  // This is navigation only; Calendar remains the read authority and GameState is untouched.
  function handleOpenAnnexWorkDetails(intent: LotAnnexWorkOwnerIntent): boolean {
    if (!currentLotWorldInputOwner()) return false
    const current = latestStateRef.current
    if (current === null) return false

    try {
      const latest = operationalAnnexWorkContext(studioLotSnapshot(current))
      if (
        latest === null ||
        latest.occupant === null ||
        latest.ownerIntent === null ||
        latest.ownerIntent.owner !== intent.owner ||
        latest.ownerIntent.ownerId !== intent.ownerId
      ) return false

      const returnContext: StudioReturnContext = {
        kind: 'lot',
        focus: 'annex-work',
        suppressOperationalAnnouncement: false,
      }
      const prepareDeepOwner = () => {
        setLotCadenceFeedback(null)
        setLotOperationalAnnouncementSuppressed(false)
      }

      switch (intent.owner) {
        case 'production':
          prepareDeepOwner()
          setScreen({
            kind: 'dashboard',
            returnContext,
            focusProductionId: intent.ownerId,
          })
          return true
        case 'script':
          prepareDeepOwner()
          setScreen({
            kind: 'writersRoom',
            returnContext,
            focusProjectId: intent.ownerId,
          })
          return true
        case 'casting': {
          const sessions = current.castingSessions.sessions.filter(
            (session) => session.id === intent.ownerId,
          )
          if (sessions.length !== 1) return false
          const session = sessions[0]!
          if (
            session.status !== 'auditioning' ||
            session.reservation?.facilityId !== latest.annexWork.facilityId ||
            session.reservation.capability !== latest.annexWork.capability ||
            session.reservation.slot !== latest.annexWork.slot
          ) return false
          prepareDeepOwner()
          setScreen({
            kind: 'castingRoom',
            returnContext,
            focusProjectId: session.projectId,
          })
          return true
        }
      }
    } catch {
      // A hostile or mid-transition Calendar projection is an unavailable handoff, never a
      // reason to guess an owner. The mounted Lot keeps the player in the Annex context.
      return false
    }
  }

  // World-First Selected Stage 7 Production Detail Handoff V1: identity arrives from an
  // explicitly inspected Lot context, but App independently proves that identity against the
  // latest authoritative state before it owns any navigation. The Board receives no cached Lot
  // operation, and direct Back carries only the exact production identity for a fresh Lot read.
  function hasCurrentStage7Production(intent: Stage7ProductionOwnerIntent): boolean {
    const current = latestStateRef.current
    if (current === null) return false

    try {
      const latest = stage7ProductionDetailContext(studioLotSnapshot(current))
      return latest !== null &&
        latest.ownerIntent.productionId === intent.productionId &&
        latest.ownerIntent.locationBuildingId === intent.locationBuildingId
    } catch {
      return false
    }
  }

  function handleOpenStage7ProductionDetails(
    intent: Stage7ProductionOwnerIntent,
  ): boolean {
    if (!currentLotWorldInputOwner()) return false
    if (!hasCurrentStage7Production(intent)) return false

    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen({
      kind: 'dashboard',
      returnContext: {
        kind: 'lot',
        focus: 'stage-7-production',
        productionId: intent.productionId,
        suppressOperationalAnnouncement: false,
      },
      focusProductionId: intent.productionId,
    })
    return true
  }

  // World-First Studio Gate Talent Arrival V1: the Lot emits one explicit candidate
  // identity, but App independently rebuilds the latest eligible market projection before
  // opening either supporting owner. The content seed is supplementary provenance; accepted
  // whole-studio replacements already discard this screen/return context in start/load paths.
  function currentGateCandidate(intent: GateCandidateOwnerIntent) {
    const current = latestStateRef.current
    if (current === null) return null

    try {
      const underlying = current.talent.filter((person) => person.id === intent.talentId)
      if (
        underlying.length !== 1 ||
        underlying[0]!.name !== intent.name ||
        underlying[0]!.role !== intent.creativeRole
      ) return null

      const latest = gateHiringCandidateContext(
        studioLotSnapshot(current),
        intent.talentId,
      )
      if (
        latest === null ||
        latest.ownerIntent.talentId !== intent.talentId ||
        latest.ownerIntent.studioSeed !== intent.studioSeed ||
        latest.ownerIntent.name !== intent.name ||
        latest.ownerIntent.creativeRole !== intent.creativeRole
      ) return null
      return latest
    } catch {
      return null
    }
  }

  function handleOpenGateCandidateProfile(intent: GateCandidateOwnerIntent): boolean {
    if (!currentLotWorldInputOwner() || currentGateCandidate(intent) === null) {
      return false
    }
    openTalentProfile(intent.talentId)
    return true
  }

  function handleOpenGateCandidateHiring(intent: GateCandidateOwnerIntent): boolean {
    if (!currentLotWorldInputOwner() || currentGateCandidate(intent) === null) {
      return false
    }

    setLotCadenceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen({
      kind: 'hiring',
      returnContext: {
        kind: 'lot',
        focus: 'gate-candidate',
        candidate: intent,
        suppressOperationalAnnouncement: false,
      },
      focusTalentId: intent.talentId,
    })
    return true
  }

  const openProfile = openProfileId ? talentProfile(state, openProfileId) : undefined
  // Keep the world inert for the full lifetime of the App-owned drawer identity,
  // including the single reconciliation render where a hostile/replaced state no
  // longer resolves that identity. The Lot clears stale raw IDs fail-closed.
  const profileDrawerOpen = openProfileId !== null
  const retainedPackageWorkspace = lotPackagePresentation.workspace
  const retainedLiveFormation = lotPackagePresentation.liveFormation
  const retainedCommissionWorkspace = lotCommissionPresentation.workspace
  const retainedLiveCommission = lotCommissionPresentation.liveReceipt
  const retainedAuditionWorkspace = lotAuditionPresentation.workspace
  const retainedLiveAudition = lotAuditionPresentation.liveReceipt
  const retainedCommissionBoard = (() => {
    if (retainedCommissionWorkspace?.phase !== 'editing') return null
    try {
      return scriptProjectsBoard(retainedCommissionWorkspace.acceptedState)
    } catch {
      return null
    }
  })()

  return (
    <DevErrorBoundary>
      {recoveryBanner}
      {saveMigrationBanner}
      {persistenceBanner}
      {appNoticeBanner}
      {openProfile && (
        <TalentProfileDrawer
          profile={openProfile}
          history={talentCareerHistory(state, openProfile.id)}
          preV5Credits={preV5CreditCount(state, openProfile.id)}
          onClose={closeTalentProfile}
        />
      )}
      {screen.kind === 'founding' && (
        <FoundingScreen
          state={state}
          // FoundingScreen calls onChange from exactly one place — an accepted signature
          // (`FoundingScreen.tsx:107`) — so this seam can name the receipt honestly.
          onChange={(next) => {
            replaceAuthoritativeState(next)
            applyPunctuation(punctuateCommit('draft-accepted', next.market.tick))
          }}
          onCreate={() =>
            setScreen({
              kind: 'talent',
              returnTo: 'founding',
              returnContext: DASHBOARD_RETURN_CONTEXT,
            })
          }
          onFounded={(next) => {
            replaceAuthoritativeState(next)
            setLotOperationalAnnouncementSuppressed(false)
            setScreen(operatingStudioHome(lotEnabled))
          }}
        />
      )}

      {screen.kind === 'dashboard' && (
        <Dashboard
          state={state}
          onOpenSettings={() => setSettingsOpen(true)}
          onAssemble={() =>
            setScreen(
              state.scriptDevelopment.mode === 'managed'
                ? { kind: 'writersRoom', returnContext: dashboardDeepReturnContext }
                : { kind: 'assembly', returnContext: dashboardDeepReturnContext },
            )
          }
          onAdvance={() => handleAdvance(dashboardDeepReturnContext, 'supporting-dashboard')}
          onSimToEvent={() => handleSimToEvent(dashboardDeepReturnContext)}
          onCreateTalent={() =>
            setScreen({
              kind: 'talent',
              returnTo: 'dashboard',
              returnContext: dashboardDeepReturnContext,
            })
          }
          onOpenHub={() => setScreen({ kind: 'hub', returnContext: dashboardDeepReturnContext })}
          onOpenRoster={() =>
            setScreen({ kind: 'roster', returnContext: dashboardDeepReturnContext })
          }
          onOpenCasting={() =>
            setScreen({ kind: 'castingRoom', returnContext: dashboardDeepReturnContext })
          }
          onOpenHiring={() =>
            setScreen({ kind: 'hiring', returnContext: dashboardDeepReturnContext })
          }
          // Unlike ordinary deep panels, Saves can reject an import or decline a restart without
          // changing authoritative state. Keep the current exact return receipt until and unless
          // Saves accepts a whole-studio replacement (which clears it at that boundary).
          onSaves={() => setScreen({ kind: 'saves', returnContext: screen.returnContext })}
          onOpenRecap={() =>
            setScreen({ kind: 'recap', returnContext: dashboardDeepReturnContext })
          }
          onOpenCalendar={() =>
            setScreen({ kind: 'calendar', returnContext: dashboardDeepReturnContext })
          }
          onOpenDevelopment={() =>
            setScreen({ kind: 'studioDevelopment', returnContext: dashboardDeepReturnContext })
          }
          onOpenLot={
            lotEnabled && screen.returnContext.kind === 'dashboard'
              ? goStudioHome
              : undefined
          }
          onReturnToLot={
            screen.returnContext.kind === 'lot'
              ? () => returnToStudioContext(screen.returnContext)
              : undefined
          }
          onOpenAutopsy={(film) => openAutopsyForFilm(film, dashboardDeepReturnContext)}
          canOpenAutopsy={(film) => snapshots[film.productionId] !== undefined}
          onOpenChronicle={(film) => openChronicleForFilm(film, dashboardDeepReturnContext)}
          onOpenClipping={(film) => openClippingForFilm(film, dashboardDeepReturnContext)}
          onPublicize={handleDashboardPublicity}
          onProductionCommand={handleProductionCommand}
          {...(screen.focusProductionId ? { focusProductionId: screen.focusProductionId } : {})}
          {...(screen.focusRunId ? { focusRunId: screen.focusRunId } : {})}
          {...(screen.focusSection ? { focusSection: screen.focusSection } : {})}
          {...(screen.focusDashboard ? { focusDashboard: true } : {})}
        />
      )}

      {screen.kind === 'roster' && (
        <StudioRoster
          state={state}
          onChange={replaceAuthoritativeState}
          onBack={() => returnToStudioContext(screen.returnContext)}
          onOpenProfile={openTalentProfile}
          {...(screen.focusTalentId ? { focusTalentId: screen.focusTalentId } : {})}
          {...(screen.focusHeadingOnMount ? { focusHeadingOnMount: true } : {})}
        />
      )}

      {screen.kind === 'hiring' && (
        <HiringMarket
          state={state}
          onChange={replaceAuthoritativeState}
          onCreate={() =>
            setScreen({
              kind: 'talent',
              returnTo: 'hiring',
              returnContext: withoutTransientWorldReturnIntent(screen.returnContext),
            })
          }
          onBack={() => returnToStudioContext(screen.returnContext)}
          {...(screen.focusTalentId ? { focusTalentId: screen.focusTalentId } : {})}
        />
      )}

      {screen.kind === 'writersRoom' && (
        <WritersRoom
          state={state}
          onChange={replaceAuthoritativeState}
          onOpenPackage={(scriptProjectId) => {
            const returnContext = annexProjectChildReturnContext(
              screen.returnContext,
              screen.focusProjectId,
              scriptProjectId,
            )
            setScreen({ kind: 'assembly', returnContext, scriptProjectId })
          }}
          onPlanAuditions={(scriptProjectId) => {
            const returnContext = annexProjectChildReturnContext(
              screen.returnContext,
              screen.focusProjectId,
              scriptProjectId,
            )
            setScreen({ kind: 'castingRoom', returnContext, scriptProjectId })
          }}
          onBack={() => returnToStudioContext(screen.returnContext)}
          {...(screen.focusProjectId ? { focusProjectId: screen.focusProjectId } : {})}
        />
      )}

      {screen.kind === 'calendar' && (
        <StudioCalendar
          state={state}
          onNavigate={(route) => handleCalendarNavigate(route, screen.returnContext)}
          onBack={() => returnToStudioContext(screen.returnContext)}
        />
      )}

      {screen.kind === 'studioDevelopment' && (
        <StudioDevelopment
          state={state}
          // One call site (`StudioDevelopment.tsx:131`): the Annex breaking ground.
          onChange={(next) => {
            replaceAuthoritativeState(next)
            applyPunctuation(punctuateCommit('build-commit', next.market.tick))
          }}
          onBack={() => returnToStudioContext(screen.returnContext)}
        />
      )}

      {screen.kind === 'castingRoom' && (
        <CastingRoom
          state={state}
          onChange={replaceAuthoritativeState}
          {...(screen.scriptProjectId ? { initialProjectId: screen.scriptProjectId } : {})}
          onOpenPackage={(scriptProjectId) => {
            const returnContext = annexProjectChildReturnContext(
              screen.returnContext,
              screen.focusProjectId ?? screen.scriptProjectId,
              scriptProjectId,
            )
            setScreen({ kind: 'assembly', returnContext, scriptProjectId })
          }}
          onOpenRoster={() =>
            setScreen({
              kind: 'roster',
              returnContext: withoutTransientWorldReturnIntent(screen.returnContext),
            })
          }
          onBack={() => returnToStudioContext(screen.returnContext)}
          {...(screen.focusProjectId ? { focusProjectId: screen.focusProjectId } : {})}
          {...(screen.focusCastingDecision
            ? { focusCastingDecision: screen.focusCastingDecision }
            : {})}
        />
      )}

      {screen.kind === 'assembly' && (
        <Assembly
          state={state}
          {...(screen.scriptProjectId ? { scriptProjectId: screen.scriptProjectId } : {})}
          onGreenlit={(next, receipt) =>
            handleAssemblyGreenlit(state, next, receipt, screen.returnContext)}
          onCancel={() => returnToStudioContext(screen.returnContext)}
          // A1: a Custom Talent created mid-assembly updates the authoritative GameState here,
          // while Assembly stays mounted so the in-progress film-package draft is preserved.
          onStateChange={(next) => {
            replaceAuthoritativeState(next)
          }}
          onOpenProfile={openTalentProfile}
        />
      )}

      {screen.kind === 'release' && (
        <ReleaseResult
          preTick={screen.preTick}
          postTickStanding={screen.postTickStanding}
          released={screen.released}
          constructionCompletion={screen.constructionCompletion}
          focusOnMount={screen.returnContext.kind === 'lot'}
          careerImpactFor={(pid) => filmCareerImpact(state, pid)}
          onOpenAutopsy={(view, film) =>
            setScreen({
              kind: 'autopsy',
              view,
              compare: autopsyCompare(screen.preTick, film),
              returnContext: screen.returnContext,
            })
          }
          onContinue={() => returnToStudioContext(screen.returnContext)}
        />
      )}

      {screen.kind === 'newspaper' && (
        <NewspaperReveal
          views={screen.views}
          constructionCompletion={screen.constructionCompletion}
          canOpenAutopsy={(index) => {
            const film = screen.films[index]
            return film !== undefined && snapshots[film.productionId] !== undefined
          }}
          onOpenAutopsy={(index) => {
            const film = screen.films[index]
            if (film) openAutopsyForFilm(film, screen.returnContext)
          }}
          {...(screen.source === 'clipping'
            ? {
                onOpenChronicle: (index: number) => {
                  const film = screen.films[index]
                  if (film) openChronicleForFilm(film, screen.returnContext)
                },
              }
            : {})}
          onContinue={() =>
            screen.source === 'release' && screen.release
              ? setScreen({ kind: 'release', ...screen.release })
              : returnToStudioContext(screen.returnContext)
          }
        />
      )}

      {screen.kind === 'autopsy' && (
        <Autopsy
          view={screen.view}
          compare={screen.compare}
          careerImpact={filmCareerImpact(state, screen.view.productionId)}
          onOpenProfile={openTalentProfile}
          onBack={() => returnToStudioContext(screen.returnContext)}
        />
      )}

      {screen.kind === 'filmRecord' && (
        <FilmRecord
          view={screen.view}
          careerImpact={filmCareerImpact(state, screen.view.productionId)}
          onOpenProfile={openTalentProfile}
          onBack={() => returnToStudioContext(screen.returnContext)}
        />
      )}

      {screen.kind === 'periodSummary' && (
        <WeeklySummary
          summary={screen.summary}
          stopReason={screen.stopReason}
          stopMessage={screen.stopMessage}
          weeks={screen.weeks}
          cashNow={screen.cashNow}
          constructionCompletion={screen.constructionCompletion}
          onContinue={() =>
            screen.stopReason === 'scriptReview'
              ? setScreen({ kind: 'writersRoom', returnContext: screen.returnContext })
              : screen.stopReason === 'castingReview'
                ? setScreen({ kind: 'castingRoom', returnContext: screen.returnContext })
                : returnToStudioContext(screen.returnContext)
          }
        />
      )}

      {screen.kind === 'talent' && (
        <TalentCreator
          state={state}
          onCreated={(next) => {
            replaceAuthoritativeState(next)
            returnFromTalent(screen.returnTo, screen.returnContext)
          }}
          onBack={() => returnFromTalent(screen.returnTo, screen.returnContext)}
        />
      )}

      {screen.kind === 'hub' && (
        <TalentHub
          state={state}
          onBack={() => returnToStudioContext(screen.returnContext)}
        />
      )}

      {screen.kind === 'recap' && (
        <StudioRunRecap
          state={state}
          onBack={() => returnToStudioContext(screen.returnContext)}
          onOpenProfile={openTalentProfile}
        />
      )}

      {screen.kind === 'saves' && (
        <Saves
          state={state}
          onLoad={(next, details) => {
            replaceAuthoritativeState(next)
            clearTalentProfileWithoutFocusRestore()
            setSnapshots({})
            setLotOperationalAnnouncementSuppressed(false)
            setRecovery(null)
            setSaveMigrationNotice(details.converted)
            // AUTHORITATIVE STATE REPLACEMENT: Saves only calls this once a save has been
            // accepted, so a REJECTED import never reaches here and the live studio keeps
            // its stages. See startGame() for why the reset is required.
            resetLotStageAssignment()
            resetLotSelectedBuilding()
            setScreen(
              next.founding !== null ? { kind: 'founding' } : operatingStudioHome(lotEnabled),
            )
          }}
          onNewGame={requestNewGame}
          onBack={() => returnToStudioContext(screen.returnContext)}
        />
      )}

      {screen.kind === 'lot' && (
        <Suspense
          fallback={
            <div className="app-shell">
              <p
                className="hint"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                data-testid="studio-lot-lazy-loading"
              >
                Opening the Studio Lot…
              </p>
            </div>
          }
        >
          <StudioLotScreen
            state={state}
            // PF1-M2 presentation-only channels. `noticeEpoch` expires transient notices on
            // the next player action; `punctuation` carries the motion strength the cue
            // grammar chose. Neither is game truth and neither is ever persisted.
            noticeEpoch={noticeEpoch}
            punctuation={lotPunctuation}
            onPresentationMount={mountLotPresentation}
            onNavigate={(route) => handleLotNavigate(route, state, screen, lotPresentationToken!)}
            onOpenAuditionPlanning={(renderedState, origin) =>
              lotPresentationToken !== null &&
              handleOpenLotAuditionPlanning(
                renderedState,
                screen,
                lotPresentationToken,
                origin,
              )}
            onExit={() => {
              if (currentLotWorldInputOwner()) openDashboardFromLot('studio-home')
            }}
            onOpenPublicityDashboard={() => {
              if (currentLotWorldInputOwner()) openDashboardFromLot('publicity-campaign')
            }}
            onRunPublicity={handleLotPublicity}
            onAdvance={() =>
              handleAdvance(
                {
                  kind: 'lot',
                  focus: 'advance-week',
                  suppressOperationalAnnouncement: lotOperationalAnnouncementSuppressed,
                },
                'mounted-lot',
              )
            }
            cadenceFeedback={lotCadenceFeedback}
            onSimToNextEvent={handleLotSimToEvent}
            onOpenNextEventDetails={(...args) =>
              lotPresentationToken !== null &&
              activeLotPresentationRef.current === lotPresentationToken &&
              latestScreenRef.current === screen &&
              latestOpenProfileIdRef.current === null
                ? handleOpenLotNextEventDetails(...args)
                : false}
            onOpenScriptReviewDetails={handleOpenLotScriptReviewDetails}
            onOpenCastingReviewDetails={(...args) =>
              lotPresentationToken !== null &&
              activeLotPresentationRef.current === lotPresentationToken &&
              latestScreenRef.current === screen &&
              latestOpenProfileIdRef.current === null
                ? handleOpenLotCastingReviewDetails(...args)
                : false}
            onInvalidateNextEvent={handleInvalidLotNextEventPresentation}
            onDismissNextEvent={handleDismissLotNextEvent}
            suppressOperationalAnnouncement={lotOperationalAnnouncementSuppressed}
            entryFocus={screen.entryFocus}
            {...(screen.entryFocus === 'stage-7-production'
              ? { entryStage7ProductionId: screen.entryStage7ProductionId }
              : {})}
            {...(screen.entryFocus === 'gate-candidate'
              ? { entryGateCandidate: screen.entryGateCandidate }
              : {})}
            {...(screen.entryFocus === 'production-formation'
              ? { entryProductionFormation: screen.entryProductionFormation }
              : {})}
            {...(screen.entryFocus === 'script-review'
              ? { entryScriptReviewTarget: screen.entryScriptReviewTarget }
              : {})}
            {...(screen.entryFocus === 'casting-review'
              ? { entryCastingReviewTarget: screen.entryCastingReviewTarget }
              : {})}
            {...(screen.entryFocus === 'next-event-reaction'
              ? { entryNextEventReceipt: screen.entryNextEventReceipt }
              : {})}
            {...(retainedLiveFormation !== null &&
              retainedLiveFormation.lotScreen === screen &&
              retainedLiveFormation.lotPresentation === lotPresentationToken
              ? {
                  liveFormationPresentation: retainedLiveFormation,
                  onLiveFormationConsumed: handleLiveFormationConsumed,
                }
              : {})}
            {...(retainedLiveCommission !== null &&
              retainedLiveCommission.lotScreen === screen &&
              retainedLiveCommission.lotPresentation === lotPresentationToken
              ? {
                  liveCommissionPresentation: retainedLiveCommission,
                  onLiveCommissionConsumed: handleLiveCommissionConsumed,
                }
              : {})}
            {...(retainedLiveAudition !== null &&
              retainedLiveAudition.lotScreen === screen &&
              retainedLiveAudition.lotPresentation === lotPresentationToken
              ? {
                  liveAuditionPresentation: retainedLiveAudition,
                  onLiveAuditionConsumed: handleLiveAuditionConsumed,
                }
              : {})}
            onProductionCommand={(command) =>
              handleProductionCommand(command, 'mounted-lot')}
            onRunNextEventProductionCommand={handleLotNextEventProductionCommand}
            onRunScriptReviewAction={handleLotScriptReviewAction}
            onRunCastingReviewAction={(...args) =>
              lotPresentationToken !== null &&
              activeLotPresentationRef.current === lotPresentationToken &&
              latestScreenRef.current === screen &&
              latestOpenProfileIdRef.current === null
                ? handleLotCastingReviewAction(...args)
                : {
                    ok: false,
                    error: 'Casting review is no longer owned by the mounted Studio Lot.',
                  }}
            onStartDevelopmentCastingAnnex={handleStartDevelopmentCastingAnnex}
            onPlaceFacility={handlePlaceFacility}
                  onMoveFacility={handleMoveFacility}
                  onDemolishFacility={handleDemolishFacility}
            onOpenAnnexWorkDetails={handleOpenAnnexWorkDetails}
            onOpenStage7ProductionDetails={handleOpenStage7ProductionDetails}
            onOpenGateCandidateProfile={handleOpenGateCandidateProfile}
            onOpenGateCandidateHiring={handleOpenGateCandidateHiring}
            onOpenTalentProfile={(personId) => {
              if (
                lotPresentationToken === null ||
                latestStateRef.current !== state ||
                latestScreenRef.current !== screen ||
                activeLotPresentationRef.current !== lotPresentationToken ||
                !currentLotWorldInputOwner() ||
                talentProfile(state, personId) === undefined
              ) return
              openTalentProfile(personId)
            }}
            onCloseTalentProfile={(personId) => {
              if (
                lotPresentationToken === null ||
                latestStateRef.current !== state ||
                latestScreenRef.current !== screen ||
                activeLotPresentationRef.current !== lotPresentationToken ||
                latestLotPackagePresentationRef.current.workspace !== null ||
                latestLotCommissionPresentationRef.current.workspace !== null ||
                latestLotAuditionPresentationRef.current.workspace !== null ||
                latestOpenProfileIdRef.current !== personId
              ) return
              closeTalentProfileIfOpen(personId)
            }}
            openTalentProfileId={openProfileId}
            worldInputSuspended={
              profileDrawerOpen ||
              retainedPackageWorkspace !== null ||
              retainedCommissionWorkspace !== null ||
              retainedAuditionWorkspace !== null ||
              // Settings is a modal over a LIVING renderer: the world keeps running and
              // keeps its camera, and takes no input at all while the dialog is up.
              settingsOpen
            }
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </Suspense>
      )}

      {screen.kind === 'lot' &&
        retainedPackageWorkspace !== null &&
        retainedPackageWorkspace.lotScreen === screen &&
        retainedPackageWorkspace.lotPresentation === lotPresentationToken && (
          <LotPackageWorkspace
            key={retainedPackageWorkspace.key}
            phase={retainedPackageWorkspace.phase}
            title={retainedPackageWorkspace.title}
            nestedModalOpen={profileDrawerOpen}
            onCancel={() => handleLotPackageCancel(retainedPackageWorkspace)}
          >
            {retainedPackageWorkspace.phase === 'editing' && (
              <Assembly
                key={retainedPackageWorkspace.key}
                surface="lot-workspace"
                state={retainedPackageWorkspace.acceptedState}
                scriptProjectId={retainedPackageWorkspace.scriptProjectId}
                onGreenlit={(next, receipt) =>
                  handleLotPackageGreenlit(
                    retainedPackageWorkspace,
                    retainedPackageWorkspace.acceptedState,
                    next,
                    receipt,
                  )}
                onCancel={() => handleLotPackageCancel(retainedPackageWorkspace)}
                onStateChange={(next) =>
                  handleLotPackageStateChange(
                    retainedPackageWorkspace,
                    retainedPackageWorkspace.acceptedState,
                    next,
                  )}
                onOpenProfile={(personId) =>
                  handleLotPackageOpenProfile(retainedPackageWorkspace, personId)}
              />
            )}
          </LotPackageWorkspace>
        )}

      {screen.kind === 'lot' &&
        retainedCommissionWorkspace !== null &&
        retainedCommissionWorkspace.lotScreen === screen &&
        retainedCommissionWorkspace.lotPresentation === lotPresentationToken && (
          <LotCommissionWorkspace
            key={retainedCommissionWorkspace.key}
            phase={retainedCommissionWorkspace.phase}
            title={
              retainedCommissionWorkspace.phase === 'committed'
                ? retainedCommissionWorkspace.title
                : 'New screenplay'
            }
            nestedModalOpen={profileDrawerOpen}
            onCancel={() => handleLotCommissionCancel(retainedCommissionWorkspace)}
            onOpenDetails={() => handleLotCommissionOpenDetails(retainedCommissionWorkspace)}
          >
            {retainedCommissionWorkspace.phase === 'editing' &&
              retainedCommissionBoard !== null && (
                <RetainedScreenplayCommissionForm
                  key={retainedCommissionWorkspace.key}
                  board={retainedCommissionBoard}
                  officeUplift={developmentOfficeUplift(retainedCommissionWorkspace.acceptedState)}
                  onSubmit={(payload) => handleLotCommissionSubmit(
                    retainedCommissionWorkspace,
                    retainedCommissionWorkspace.acceptedState,
                    payload,
                  )}
                  onClose={() => handleLotCommissionCancel(retainedCommissionWorkspace)}
                />
              )}
          </LotCommissionWorkspace>
        )}

      {screen.kind === 'lot' &&
        retainedAuditionWorkspace !== null &&
        retainedAuditionWorkspace.lotScreen === screen &&
        retainedAuditionWorkspace.lotPresentation === lotPresentationToken && (
          <LotAuditionWorkspace
            key={retainedAuditionWorkspace.key}
            phase={retainedAuditionWorkspace.phase}
            project={retainedAuditionWorkspace.context.project}
            disabled={retainedAuditionWorkspace.phase === 'committed'}
            nestedModalOpen={profileDrawerOpen}
            onCancel={() => handleLotAuditionCancel(retainedAuditionWorkspace)}
            onOpenDetails={() => handleLotAuditionOpenDetails(retainedAuditionWorkspace)}
            onSlateChange={(draft) =>
              handleLotAuditionSlateChange(retainedAuditionWorkspace, draft)}
            onSubmit={(slate) => retainedAuditionWorkspace.phase === 'editing'
              ? handleLotAuditionSubmit(
                  retainedAuditionWorkspace,
                  retainedAuditionWorkspace.acceptedState,
                  slate,
                )
              : {
                  ok: false,
                  error: 'Audition planning is already recording with the live Studio Lot.',
                }}
          />
        )}

      {/*
        The shell's modals are the LAST children on purpose: the retained workspaces above
        establish the precedent that a layer over the world is painted after the world it
        covers. Settings never unmounts what is underneath it; the confirmation is the one
        thing standing between the player and a studio they cannot get back.
      */}
      {settingsDialog}
      {newGameConfirmDialog}
    </DevErrorBoundary>
  )
}
