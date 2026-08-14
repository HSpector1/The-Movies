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

import { Component, lazy, Suspense, useEffect, useState } from 'react'
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

// Gate D1: the Studio Lot overview is lazily imported so Phaser and the whole lot
// module stay out of the eager bundle. The factory only runs when <StudioLotScreen/>
// first renders, which only happens when the feature flag is on and the lot is opened.
const StudioLotScreen = lazy(() => import('./lot/StudioLotScreen.tsx'))

type Screen =
  | { kind: 'start' }
  | { kind: 'founding' }
  | { kind: 'dashboard'; focusProductionId?: string; focusRunId?: string }
  | { kind: 'roster'; focusTalentId?: string }
  | { kind: 'hiring' }
  | { kind: 'writersRoom'; focusProjectId?: string }
  | { kind: 'castingRoom'; scriptProjectId?: string; focusProjectId?: string }
  | { kind: 'calendar' }
  | { kind: 'studioDevelopment' }
  | { kind: 'assembly'; scriptProjectId?: string }
  | {
      kind: 'release'
      preTick: GameState
      postTickStanding: Standing
      released: FilmResult[]
      development: ReleaseDevelopment[]
      constructionCompletion: ConstructionCompletionSummary | null
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
      release?: {
        preTick: GameState
        postTickStanding: Standing
        released: FilmResult[]
        development: ReleaseDevelopment[]
        constructionCompletion: ConstructionCompletionSummary | null
      }
    }
  | { kind: 'autopsy'; view: AutopsyView; compare: AutopsyCompareView | null }
  | { kind: 'filmRecord'; view: FilmRecordView }
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
    }
  | { kind: 'talent'; returnTo: 'dashboard' | 'founding' | 'hiring' }
  | { kind: 'hub' }
  | { kind: 'saves' }
  | { kind: 'recap' } // D-15: read-only Studio Run Recap
  | { kind: 'lot' } // Gate D1: Studio Lot overview (feature-flagged, default off)

// Where the Talent Creator returns after create/back (D-11.A: reachable during founding,
// from the Hiring Market, and from the Dashboard).
function returnScreen(returnTo: 'dashboard' | 'founding' | 'hiring'): Screen {
  if (returnTo === 'founding') return { kind: 'founding' }
  if (returnTo === 'hiring') return { kind: 'hiring' }
  return { kind: 'dashboard' }
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
  const [state, setState] = useState<GameState | null>(restore.ok ? restore.state : null)
  // D-14 Phase 2: the ONE Talent Profile drawer, openable over any screen from the roster,
  // Assemble a Film, or Autopsy. Null = closed. Focus returns to the opener on close.
  const [openProfileId, setOpenProfileId] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>(
    restore.ok
      ? restore.state.founding !== null
        ? { kind: 'founding' }
        : { kind: 'dashboard' }
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

  // Autosave after EVERY authoritative state transition — every GameState change flows through
  // setState, so this single effect covers founding, hiring, greenlight, advance, sim, release,
  // theatrical payments, roster changes, etc. Whole engine states only (no half-applied writes).
  useEffect(() => {
    if (state) saveActiveSession(state)
  }, [state])

  function startGame(next: GameState, details: { converted: boolean }) {
    setState(next)
    setSnapshots({})
    setRecovery(null)
    setSaveMigrationNotice(details.converted)
    // AUTHORITATIVE STATE REPLACEMENT: a brand-new studio, or a save imported at the start
    // screen. Presentation memory keyed by production id must not cross this line — ids are
    // `prod-<tick>` and repeat across games, so a slot held by the previous studio would be
    // inherited by an unrelated film. Only reached with a valid `next`.
    resetLotStageAssignment()
    // A new PLAYER game opens in the founding draft (D-11.2); a founded game (or a
    // loaded save past founding) goes straight to the dashboard. The new game's first
    // autosave (via the effect above) replaces any prior/quarantined active session.
    setScreen(next.founding !== null ? { kind: 'founding' } : { kind: 'dashboard' })
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
    setSnapshots({})
    setRecovery(null)
    setSaveMigrationNotice(false)
    // The old studio ends HERE, past the confirm — so its presentation memory ends here too.
    resetLotStageAssignment()
    setScreen({ kind: 'start' })
  }

  function goDashboard() {
    setScreen({ kind: 'dashboard' })
  }

  // Studio Calendar routes are presentation-only. Every intent lands on the existing
  // owner surface; that destination's live read model still owns legality and actions.
  function handleCalendarNavigate(route: StudioCalendarRoute) {
    switch (route.kind) {
      case 'script':
        setScreen({ kind: 'writersRoom', focusProjectId: route.projectId })
        break
      case 'casting':
        setScreen({ kind: 'castingRoom', focusProjectId: route.projectId })
        break
      case 'production':
        setScreen({ kind: 'dashboard', focusProductionId: route.productionId })
        break
      case 'theatricalRun':
        setScreen({ kind: 'dashboard', focusRunId: route.productionId })
        break
      case 'contract':
        setScreen({ kind: 'roster', focusTalentId: route.talentId })
        break
      case 'studioDevelopment':
        setScreen({ kind: 'studioDevelopment' })
        break
    }
  }

  // Gate D1: is the Studio Lot overview enabled this session? (default off)
  const lotEnabled = studioLotOverviewEnabled()

  // Translate a lot navigation intent into the existing screen navigation. Every route
  // targets a screen that already exists outside the lot.
  function handleLotNavigate(route: LotRoute) {
    switch (route.kind) {
      case 'dashboard':
        setScreen({ kind: 'dashboard' })
        break
      case 'roster':
        setScreen({ kind: 'roster' })
        break
      case 'castingRoom':
        setScreen({ kind: 'castingRoom' })
        break
      case 'hiring':
        setScreen({ kind: 'hiring' })
        break
      case 'hub':
        setScreen({ kind: 'hub' })
        break
      case 'assembly':
        setScreen(
          state?.scriptDevelopment.mode === 'managed'
            ? { kind: 'writersRoom' }
            : { kind: 'assembly' },
        )
        break
      case 'saves':
        setScreen({ kind: 'saves' })
        break
      case 'studioDevelopment':
        setScreen({ kind: 'studioDevelopment' })
        break
    }
  }

  function handleAdvance() {
    if (!state) return
    // RULING A: advanceWeek ticks with development ON. The engine applies development
    // EXACTLY ONCE inside this single tick; we then replace the authoritative GameState
    // with `next` and never re-tick on re-render — so development is never double-applied.
    const { preTick, next, released, constructionCompletion } = advanceWeek(state)
    // Build the per-release development summary by DIFFING the pre-tick vs post-tick
    // talent (pure read of two immutable snapshots — no re-run of development).
    const development = buildReleaseDevelopment(preTick, next, released)
    setState(next)
    const release = {
      preTick,
      postTickStanding: next.studio.standing,
      released,
      development,
      constructionCompletion,
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
    // D-11.C PART 2: when a film actually reaches audiences this week, the reveal is the
    // newspaper front page — shown ONCE, here, at release. Continue hands off to the
    // existing release/development summary (unchanged). A week with no release skips
    // straight to that summary (nothing to put on a front page).
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
        // The first post-tick surface owns the one-time item. Continuing from
        // the newspaper must not repeat it on ReleaseResult.
        release: { ...release, constructionCompletion: null },
      })
      return
    }
    setScreen({ kind: 'release', ...release })
  }

  function handlePublicity(tier: PublicityTier) {
    if (!state) return
    const result = runPublicity(state, tier)
    if (result.ok) {
      setState(result.next)
    } else {
      alert(result.error)
    }
  }

  function handleProductionCommand(command: ProductionCommandView) {
    if (!state) return
    const result = runProductionCommand(state, command)
    if (result.ok) {
      setState(result.next)
    } else {
      alert(result.error)
    }
  }

  // D-12.18: Sim to next event — advance many weeks through the engine, stopping before the
  // next blocking event. A release routes to the same newspaper/release flow as Advance (the
  // stop tick is exactly one tick after `preTick`); any other stop shows the weekly summary.
  function handleSimToEvent() {
    if (!state) return
    const result = advanceToNextEvent(state)
    setState(result.next)
    if (result.released.length > 0) {
      const development = buildReleaseDevelopment(result.preTick, result.next, result.released)
      const release = {
        preTick: result.preTick,
        postTickStanding: result.next.studio.standing,
        released: result.released,
        development,
        constructionCompletion: result.constructionCompletion,
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
    })
  }

  // D-11.C PART 2: re-open a film's newspaper clipping after the fact (dashboard / record).
  // Reconstructed purely from persisted state (participants + forecast + ledger), so it
  // survives save/reload. Continue returns to the dashboard; the clipping is not "news"
  // any more, so there is no release summary to hand back to.
  function openClippingForFilm(film: FilmResult) {
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
    })
  }

  // Film Chronicle V1: durable, persisted-data record. This is deliberately a
  // separate action from the exact session-only mathematical autopsy.
  function openChronicleForFilm(film: FilmResult) {
    if (!state) return
    const record = filmRecordView(state, film)
    if (record) {
      setScreen({ kind: 'filmRecord', view: record })
      return
    }
    alert(
      'This older film predates the frozen participant record required for a Film Chronicle.',
    )
  }

  // Open the exact autopsy for a film with a retained snapshot (dashboard path).
  function openAutopsyForFilm(film: FilmResult) {
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
    setScreen({ kind: 'autopsy', view, compare })
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

  const openProfile = openProfileId ? talentProfile(state, openProfileId) : undefined

  return (
    <DevErrorBoundary>
      {recoveryBanner}
      {saveMigrationBanner}
      {openProfile && (
        <TalentProfileDrawer
          profile={openProfile}
          history={talentCareerHistory(state, openProfile.id)}
          preV5Credits={preV5CreditCount(state, openProfile.id)}
          onClose={() => setOpenProfileId(null)}
        />
      )}
      {screen.kind === 'founding' && (
        <FoundingScreen
          state={state}
          onChange={setState}
          onCreate={() => setScreen({ kind: 'talent', returnTo: 'founding' })}
          onFounded={(next) => {
            setState(next)
            goDashboard()
          }}
        />
      )}

      {screen.kind === 'dashboard' && (
        <Dashboard
          state={state}
          onAssemble={() =>
            setScreen(
              state.scriptDevelopment.mode === 'managed'
                ? { kind: 'writersRoom' }
                : { kind: 'assembly' },
            )
          }
          onAdvance={handleAdvance}
          onSimToEvent={handleSimToEvent}
          onCreateTalent={() => setScreen({ kind: 'talent', returnTo: 'dashboard' })}
          onOpenHub={() => setScreen({ kind: 'hub' })}
          onOpenRoster={() => setScreen({ kind: 'roster' })}
          onOpenCasting={() => setScreen({ kind: 'castingRoom' })}
          onOpenHiring={() => setScreen({ kind: 'hiring' })}
          onSaves={() => setScreen({ kind: 'saves' })}
          onOpenRecap={() => setScreen({ kind: 'recap' })}
          onOpenCalendar={() => setScreen({ kind: 'calendar' })}
          onOpenDevelopment={() => setScreen({ kind: 'studioDevelopment' })}
          onOpenLot={lotEnabled ? () => setScreen({ kind: 'lot' }) : undefined}
          onOpenAutopsy={openAutopsyForFilm}
          canOpenAutopsy={(film) => snapshots[film.productionId] !== undefined}
          onOpenChronicle={openChronicleForFilm}
          onOpenClipping={openClippingForFilm}
          onPublicize={handlePublicity}
          onProductionCommand={handleProductionCommand}
          {...(screen.focusProductionId ? { focusProductionId: screen.focusProductionId } : {})}
          {...(screen.focusRunId ? { focusRunId: screen.focusRunId } : {})}
        />
      )}

      {screen.kind === 'roster' && (
        <StudioRoster
          state={state}
          onChange={setState}
          onBack={goDashboard}
          onOpenProfile={setOpenProfileId}
          {...(screen.focusTalentId ? { focusTalentId: screen.focusTalentId } : {})}
        />
      )}

      {screen.kind === 'hiring' && (
        <HiringMarket
          state={state}
          onChange={setState}
          onCreate={() => setScreen({ kind: 'talent', returnTo: 'hiring' })}
          onBack={goDashboard}
        />
      )}

      {screen.kind === 'writersRoom' && (
        <WritersRoom
          state={state}
          onChange={setState}
          onOpenPackage={(scriptProjectId) =>
            setScreen({ kind: 'assembly', scriptProjectId })
          }
          onPlanAuditions={(scriptProjectId) =>
            setScreen({ kind: 'castingRoom', scriptProjectId })
          }
          onBack={goDashboard}
          {...(screen.focusProjectId ? { focusProjectId: screen.focusProjectId } : {})}
        />
      )}

      {screen.kind === 'calendar' && (
        <StudioCalendar
          state={state}
          onNavigate={handleCalendarNavigate}
          onBack={goDashboard}
        />
      )}

      {screen.kind === 'studioDevelopment' && (
        <StudioDevelopment state={state} onChange={setState} onBack={goDashboard} />
      )}

      {screen.kind === 'castingRoom' && (
        <CastingRoom
          state={state}
          onChange={setState}
          {...(screen.scriptProjectId ? { initialProjectId: screen.scriptProjectId } : {})}
          onOpenPackage={(scriptProjectId) =>
            setScreen({ kind: 'assembly', scriptProjectId })
          }
          onOpenRoster={() => setScreen({ kind: 'roster' })}
          onBack={goDashboard}
          {...(screen.focusProjectId ? { focusProjectId: screen.focusProjectId } : {})}
        />
      )}

      {screen.kind === 'assembly' && (
        <Assembly
          state={state}
          {...(screen.scriptProjectId ? { scriptProjectId: screen.scriptProjectId } : {})}
          onGreenlit={(next) => {
            setState(next)
            goDashboard()
          }}
          onCancel={goDashboard}
          // A1: a Custom Talent created mid-assembly updates the authoritative GameState here,
          // while Assembly stays mounted so the in-progress film-package draft is preserved.
          onStateChange={setState}
          onOpenProfile={setOpenProfileId}
        />
      )}

      {screen.kind === 'release' && (
        <ReleaseResult
          preTick={screen.preTick}
          postTickStanding={screen.postTickStanding}
          released={screen.released}
          constructionCompletion={screen.constructionCompletion}
          careerImpactFor={(pid) => filmCareerImpact(state, pid)}
          onOpenAutopsy={(view, film) =>
            setScreen({
              kind: 'autopsy',
              view,
              compare: autopsyCompare(screen.preTick, film),
            })
          }
          onContinue={goDashboard}
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
            if (film) openAutopsyForFilm(film)
          }}
          onOpenChronicle={(index) => {
            const film = screen.films[index]
            if (film) openChronicleForFilm(film)
          }}
          onContinue={() =>
            screen.source === 'release' && screen.release
              ? setScreen({ kind: 'release', ...screen.release })
              : goDashboard()
          }
        />
      )}

      {screen.kind === 'autopsy' && (
        <Autopsy
          view={screen.view}
          compare={screen.compare}
          careerImpact={filmCareerImpact(state, screen.view.productionId)}
          onOpenProfile={setOpenProfileId}
          onBack={goDashboard}
        />
      )}

      {screen.kind === 'filmRecord' && (
        <FilmRecord
          view={screen.view}
          careerImpact={filmCareerImpact(state, screen.view.productionId)}
          onOpenProfile={setOpenProfileId}
          onBack={goDashboard}
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
              ? setScreen({ kind: 'writersRoom' })
              : screen.stopReason === 'castingReview'
                ? setScreen({ kind: 'castingRoom' })
              : goDashboard()
          }
        />
      )}

      {screen.kind === 'talent' && (
        <TalentCreator
          state={state}
          onCreated={(next) => {
            setState(next)
            setScreen(returnScreen(screen.returnTo))
          }}
          onBack={() => setScreen(returnScreen(screen.returnTo))}
        />
      )}

      {screen.kind === 'hub' && <TalentHub state={state} onBack={goDashboard} />}

      {screen.kind === 'recap' && (
        <StudioRunRecap state={state} onBack={goDashboard} onOpenProfile={setOpenProfileId} />
      )}

      {screen.kind === 'saves' && (
        <Saves
          state={state}
          onLoad={(next, details) => {
            setState(next)
            setSnapshots({})
            setSaveMigrationNotice(details.converted)
            // AUTHORITATIVE STATE REPLACEMENT: Saves only calls this once a save has been
            // accepted, so a REJECTED import never reaches here and the live studio keeps
            // its stages. See startGame() for why the reset is required.
            resetLotStageAssignment()
            setScreen(next.founding !== null ? { kind: 'founding' } : { kind: 'dashboard' })
          }}
          onNewGame={requestNewGame}
          onBack={goDashboard}
        />
      )}

      {screen.kind === 'lot' && (
        <Suspense
          fallback={
            <div className="app-shell">
              <p className="hint">Opening the Studio Lot…</p>
            </div>
          }
        >
          <StudioLotScreen
            state={state}
            onNavigate={handleLotNavigate}
            onExit={goDashboard}
            onStateChange={setState}
            onProductionCommand={handleProductionCommand}
          />
        </Suspense>
      )}
    </DevErrorBoundary>
  )
}
