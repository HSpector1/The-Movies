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

import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import type {
  GameState,
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
} from './engine/adapter.ts'
import {
  advanceWeek,
  advanceToNextEvent,
  explainRelease,
  buildReleaseDevelopment,
  autopsyCompare,
  filmRecordView,
  findConcept,
  releaseNewspaper,
  talentProfile,
  runPublicity,
  runProductionCommand,
  startDevelopmentCastingAnnexAction,
  studioLotSnapshot,
} from './engine/adapter.ts'
import { filmCareerImpact, talentCareerHistory, preV5CreditCount } from './engine/careerImpact.ts'
import { TalentProfileDrawer } from './components/TalentProfileDrawer.tsx'
import { StartScreen } from './screens/StartScreen.tsx'
import { Dashboard } from './screens/Dashboard.tsx'
import { Assembly } from './screens/Assembly.tsx'
import { WritersRoom } from './screens/WritersRoom.tsx'
import { CastingRoom } from './screens/CastingRoom.tsx'
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
import { studioLotOverviewEnabled } from './flags.ts'
import type { LotRoute } from './lot/navigation.ts'
// Presentation-only, and deliberately NOT part of the lazy lot chunk: this module imports
// nothing but types, so App can end the lot's presentation session without pulling Phaser
// or the lot screen into the eager bundle.
import { resetLotStageAssignment } from './lot/snapshot/stageAssignment.ts'
import { resetLotSelectedBuilding } from './lot/snapshot/selectedBuildingSession.ts'
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

type StudioActionSource = 'mounted-lot' | 'supporting-dashboard'

type LotAdvanceFeedback = {
  week: number
  constructionCompletion: ConstructionCompletionSummary | null
}

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
    }
  | { kind: 'roster'; returnContext: StudioReturnContext; focusTalentId?: string }
  | { kind: 'hiring'; returnContext: StudioReturnContext; focusTalentId?: string }
  | { kind: 'writersRoom'; returnContext: StudioReturnContext; focusProjectId?: string }
  | {
      kind: 'castingRoom'
      returnContext: StudioReturnContext
      scriptProjectId?: string
      focusProjectId?: string
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
    } // Studio Home V1: primary world surface

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
  const [state, setState] = useState<GameState | null>(restore.ok ? restore.state : null)
  const latestStateRef = useRef<GameState | null>(state)
  latestStateRef.current = state
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
  const [screen, setScreen] = useState<Screen>(
    restore.ok
      ? restore.state.founding !== null
        ? { kind: 'founding' }
        : operatingStudioHome(lotEnabled)
      : { kind: 'start' },
  )
  // A dismissible recovery notice: the recovered week, or a safe "recovery failed" message.
  const [recovery, setRecovery] = useState<{ kind: 'recovered'; week: number } | { kind: 'corrupt' } | null>(
    restore.ok
      ? { kind: 'recovered', week: restore.state.market.tick }
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
  // World-First Live Week Advance V1: transient presentation feedback for a no-release tick
  // initiated on the mounted lot. Neither value is GameState or SaveFileV11 data. The separate
  // suppression bit survives only a tick-generated deep release chain, preventing the exact Annex
  // completion from being repeated as the generic "already operational" lot announcement.
  const [lotAdvanceFeedback, setLotAdvanceFeedback] = useState<LotAdvanceFeedback | null>(null)
  const [lotOperationalAnnouncementSuppressed, setLotOperationalAnnouncementSuppressed] =
    useState(false)

  // Autosave after EVERY authoritative state transition — every GameState change flows through
  // setState, so this single effect covers founding, hiring, greenlight, advance, sim, release,
  // theatrical payments, roster changes, etc. Whole engine states only (no half-applied writes).
  useEffect(() => {
    if (state) saveActiveSession(state)
  }, [state])

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
    setState(next)
    clearTalentProfileWithoutFocusRestore()
    setSnapshots({})
    setLotAdvanceFeedback(null)
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
  // cleared so a subsequent refresh does not resurrect the abandoned studio. The prompt is gated on
  // the in-memory studio (`state`), NOT on whether persistence succeeded: in private/incognito mode
  // hasActiveSession() is false, but there is still a live studio to lose, so it must still confirm.
  function requestNewGame() {
    if (
      state !== null &&
      typeof window !== 'undefined' &&
      typeof window.confirm === 'function' &&
      !window.confirm('Start a new studio? This will replace your current studio.')
    ) {
      return
    }
    clearActiveSession()
    setState(null)
    clearTalentProfileWithoutFocusRestore()
    setSnapshots({})
    setLotAdvanceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setRecovery(null)
    setSaveMigrationNotice(false)
    // The old studio ends HERE, past the confirm — so its presentation memory ends here too.
    resetLotStageAssignment()
    resetLotSelectedBuilding()
    setScreen({ kind: 'start' })
  }

  function goDashboard() {
    setLotAdvanceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen({ kind: 'dashboard', returnContext: DASHBOARD_RETURN_CONTEXT })
  }

  function goStudioHome() {
    setLotAdvanceFeedback(null)
    setLotOperationalAnnouncementSuppressed(false)
    setScreen(operatingStudioHome(lotEnabled))
  }

  function openDashboardFromLot(focus: OrdinaryLotEntryFocus) {
    setLotAdvanceFeedback(null)
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
    setLotAdvanceFeedback(null)
    setLotOperationalAnnouncementSuppressed(context.suppressOperationalAnnouncement)
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
  function handleLotNavigate(route: LotRoute) {
    // Existing lot destinations are ordinary deep navigation, not part of the tick-generated
    // release chain. A later lot entry is fresh and may announce an already-operational Annex.
    setLotAdvanceFeedback(null)
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
    if (!state) return
    // RULING A: advanceWeek ticks with development ON. The engine applies development
    // EXACTLY ONCE inside this single tick; we then replace the authoritative GameState
    // with `next` and never re-tick on re-render — so development is never double-applied.
    const { preTick, next, released, constructionCompletion } = advanceWeek(state)
    // Build the per-release development summary by DIFFING the pre-tick vs post-tick
    // talent (pure read of two immutable snapshots — no re-run of development).
    const development = buildReleaseDevelopment(preTick, next, released)
    setState(next)
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
      setLotAdvanceFeedback(null)
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
      setLotAdvanceFeedback({ week: next.market.tick, constructionCompletion })
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
      return {
        ok: false,
        error: 'Publicity successor failed exact acceptance receipt validation.',
      }
    }
    latestStateRef.current = result.next
    setState(result.next)
    return { ok: true, tier, acceptedWeek }
  }

  function handleDashboardPublicity(tier: PublicityTier) {
    const result = executePublicity(tier)
    if (!result.ok) alert(result.error)
  }

  function handleLotPublicity(tier: PublicityTier): LotPublicityResult {
    return executePublicity(tier)
  }

  function handleProductionCommand(command: ProductionCommandView) {
    if (!state) return
    const result = runProductionCommand(state, command)
    if (result.ok) {
      setState(result.next)
    } else {
      alert(result.error)
    }
    return result
  }

  // D-12.18: Sim to next event — advance many weeks through the engine, stopping before the
  // next blocking event. A release routes to the same newspaper/release flow as Advance (the
  // stop tick is exactly one tick after `preTick`); any other stop shows the weekly summary.
  function handleSimToEvent(returnContext: StudioReturnContext) {
    if (!state) return
    const result = advanceToNextEvent(state)
    setState(result.next)
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
      setLotAdvanceFeedback(null)
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
      alert(
        'This film has no archived front page. A newspaper clipping is kept only for films ' +
          'released with a full participant record (D-11.A); older films predate that record.',
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
    alert(
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
      alert(
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

  // A concise, dismissible recovery notice shown once after a restore (or a safe failure message).
  const recoveryBanner = recovery && (
    <div className="card" data-testid="recovery-notice" role="status" style={{ marginBottom: 12 }}>
      <div className="spread">
        <span>
          {recovery.kind === 'recovered'
            ? `Recovered your studio from Week ${recovery.week}.`
            : 'Could not recover your last studio (the saved session was unreadable). Your manual saves are unaffected — start a new studio or load a save.'}
        </span>
        <button className="ghost" onClick={() => setRecovery(null)} data-testid="recovery-dismiss">
          Dismiss
        </button>
      </div>
    </div>
  )

  const saveMigrationBanner = saveMigrationNotice && (
    <div className="card" data-testid="save-migration-notice" role="status" style={{ marginBottom: 12 }}>
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
        <StartScreen onStart={startGame} />
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
    const result = startDevelopmentCastingAnnexAction(loadedState)
    if (result.ok) {
      setLotAdvanceFeedback(null)
      setState(result.next)
    }
    return result
  }

  // World-First Operational Annex Work Presence V1: the Lot may offer a deep owner only
  // after world inspection. Re-read the one canonical Calendar slot at activation time so a
  // completed/replaced occupant can never route by stale presentation text or array position.
  // This is navigation only; Calendar remains the read authority and GameState is untouched.
  function handleOpenAnnexWorkDetails(intent: LotAnnexWorkOwnerIntent): boolean {
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
        setLotAdvanceFeedback(null)
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
    if (!hasCurrentStage7Production(intent)) return false

    setLotAdvanceFeedback(null)
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
    if (latestOpenProfileIdRef.current !== null || currentGateCandidate(intent) === null) {
      return false
    }
    openTalentProfile(intent.talentId)
    return true
  }

  function handleOpenGateCandidateHiring(intent: GateCandidateOwnerIntent): boolean {
    if (latestOpenProfileIdRef.current !== null || currentGateCandidate(intent) === null) {
      return false
    }

    setLotAdvanceFeedback(null)
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

  return (
    <DevErrorBoundary>
      {recoveryBanner}
      {saveMigrationBanner}
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
          onChange={setState}
          onCreate={() =>
            setScreen({
              kind: 'talent',
              returnTo: 'founding',
              returnContext: DASHBOARD_RETURN_CONTEXT,
            })
          }
          onFounded={(next) => {
            setState(next)
            setLotAdvanceFeedback(null)
            setLotOperationalAnnouncementSuppressed(false)
            setScreen(operatingStudioHome(lotEnabled))
          }}
        />
      )}

      {screen.kind === 'dashboard' && (
        <Dashboard
          state={state}
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
          onSaves={() => setScreen({ kind: 'saves', returnContext: dashboardDeepReturnContext })}
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
        />
      )}

      {screen.kind === 'roster' && (
        <StudioRoster
          state={state}
          onChange={setState}
          onBack={() => returnToStudioContext(screen.returnContext)}
          onOpenProfile={openTalentProfile}
          {...(screen.focusTalentId ? { focusTalentId: screen.focusTalentId } : {})}
        />
      )}

      {screen.kind === 'hiring' && (
        <HiringMarket
          state={state}
          onChange={setState}
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
          onChange={setState}
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
          onChange={setState}
          onBack={() => returnToStudioContext(screen.returnContext)}
        />
      )}

      {screen.kind === 'castingRoom' && (
        <CastingRoom
          state={state}
          onChange={setState}
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
        />
      )}

      {screen.kind === 'assembly' && (
        <Assembly
          state={state}
          {...(screen.scriptProjectId ? { scriptProjectId: screen.scriptProjectId } : {})}
          onGreenlit={(next) => {
            setState(next)
            returnToStudioContext(screen.returnContext)
          }}
          onCancel={() => returnToStudioContext(screen.returnContext)}
          // A1: a Custom Talent created mid-assembly updates the authoritative GameState here,
          // while Assembly stays mounted so the in-progress film-package draft is preserved.
          onStateChange={setState}
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
            setState(next)
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
            setState(next)
            clearTalentProfileWithoutFocusRestore()
            setSnapshots({})
            setLotAdvanceFeedback(null)
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
            onNavigate={handleLotNavigate}
            onExit={() => openDashboardFromLot('studio-home')}
            onOpenPublicityDashboard={() => openDashboardFromLot('publicity-campaign')}
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
            advanceFeedback={lotAdvanceFeedback}
            suppressOperationalAnnouncement={lotOperationalAnnouncementSuppressed}
            entryFocus={screen.entryFocus}
            {...(screen.entryFocus === 'stage-7-production'
              ? { entryStage7ProductionId: screen.entryStage7ProductionId }
              : {})}
            {...(screen.entryFocus === 'gate-candidate'
              ? { entryGateCandidate: screen.entryGateCandidate }
              : {})}
            onProductionCommand={handleProductionCommand}
            onStartDevelopmentCastingAnnex={handleStartDevelopmentCastingAnnex}
            onOpenAnnexWorkDetails={handleOpenAnnexWorkDetails}
            onOpenStage7ProductionDetails={handleOpenStage7ProductionDetails}
            onOpenGateCandidateProfile={handleOpenGateCandidateProfile}
            onOpenGateCandidateHiring={handleOpenGateCandidateHiring}
            onOpenTalentProfile={openTalentProfile}
            onCloseTalentProfile={closeTalentProfileIfOpen}
            openTalentProfileId={openProfileId}
            worldInputSuspended={profileDrawerOpen}
          />
        </Suspense>
      )}
    </DevErrorBoundary>
  )
}
