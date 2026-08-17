// ── First Film Journey V1 ───────────────────────────────────────────────────
// The engine-owned canonical answer to "where is my picture, and what do I do
// next about it, right now".
//
// `firstFilmJourney(state)` is a PURE, SAVE-NEUTRAL PROJECTION, built in the
// documented `presence.ts` discipline. It:
//
//   • changes zero outcomes and persists nothing,
//   • alters no tick step and is called by none,
//   • consumes ZERO RNG — derived or otherwise. `state.rngState` is never read,
//     never advanced, and no stream is opened here,
//   • is deterministic: the same GameState always yields a deep-equal view,
//   • never mutates its input, and never hands a caller a reference into state
//     (every returned string/number is freshly built),
//   • never throws on malformed input. Read models that legitimately reject a
//     malformed world (they throw by design, operational law 21) are consulted
//     through `attempt`, and a failure WITHHOLDS only the legality colour it
//     would have provided — the journey itself still degrades to the raw
//     authoritative truth (projects, sessions, productions) rather than
//     disappearing.
//
// AUTHORITY. This is NOT a second workflow state machine. Every stage below is
// read off state the engine already owns:
//
//   • screenplay lifecycle — `state.scriptDevelopment.projects[].status`
//     (types.ts:576-583) and `dueWeek` (types.ts:610), surfaced through
//     `scriptProjectsReadModel` (scriptReadModel.ts:896),
//   • audition lifecycle — `state.castingSessions.sessions[].status`
//     (types.ts:689-703) through `castingSessionsReadModel`
//     (castingReadModel.ts:399),
//   • what the studio is currently STOPPED on — `nextStudioDecision`
//     (scriptReadModel.ts:1011), including its production-operations arm
//     (scriptReadModel.ts:946),
//   • production progress — `state.studio.activeProductions` plus
//     `state.operations.workflows[].phase`, with
//     `productionPhaseForRemainingTicks` (operations.ts:56) as the legacy
//     fallback when no managed workflow exists.
//
// No legality is decided here. Where this projection recommends an action it is
// because an existing read model already published that action as legal; where
// it cannot, it says so in `blocked` and still names the place to go.
//
// COPY. All player-facing strings are engine-owned, plain 1948-Hollywood
// language: no internal identifiers, no system jargon. `next.label` is always
// imperative and names the place and the verb. Renderer building names are NEVER
// invented here (operational law 12) — `next.site` is a semantic site and the
// renderer maps it to whatever building it actually has.

import { castingSessionForProject } from './castingSessions.js'
import { castingSessionsReadModel, type CastingProjectView } from './castingReadModel.js'
import { productionPhaseForRemainingTicks } from './operations.js'
import {
  nextStudioDecision,
  scriptProjectsReadModel,
  type ProductionOperationsCommand,
  type ScriptPlayerBlocker,
  type ScriptProjectsReadModel,
} from './scriptReadModel.js'
import type {
  CastingSessionsReadModel,
} from './castingReadModel.js'
import type {
  CastingSession,
  GameState,
  Production,
  ProductionPhase,
  ScriptProject,
  ScriptProjectStatus,
} from './types.js'

// ── frozen public shape ─────────────────────────────────────────────────────

export type FirstFilmJourneyStage =
  | 'no-picture'
  // ONE stage for "the screenplay is being written": both the `drafting` and `rewriting`
  // project statuses land here, and the stage's HEADLINE is where the two are told apart
  // ("Screenplay — drafting" / "Screenplay — rewriting"). Surfaces that print the stage id
  // therefore say `drafting` beside a rewriting headline, by contract.
  | 'drafting'
  | 'script-review'
  | 'ready-to-package'
  | 'auditioning'
  | 'audition-review'
  | 'in-production'
  | 'released'

export type JourneyTargetKind =
  | 'commission'
  | 'script-review'
  | 'plan-auditions'
  | 'audition-review'
  | 'open-package'
  | 'resolve-production'
  | 'advance-week'

export type JourneySite = 'development' | 'casting' | 'stage' | 'post' | 'admin'

export interface FirstFilmJourneyNext {
  kind: JourneyTargetKind
  /** Imperative, plain 1948-Hollywood copy naming the place and the verb. */
  label: string
  /** Semantic site only; `null` for advance-week, which has no destination. */
  site: JourneySite | null
}

export interface FirstFilmJourneyView {
  stage: FirstFilmJourneyStage
  pictureTitle: string | null
  /** 1 = the studio's first picture ever; increments per released picture. */
  ordinal: number
  headline: string
  detail: string | null
  next: FirstFilmJourneyNext | null
  waiting: { untilWeek: number | null; reason: string } | null
  blocked: { reason: string } | null
}

// ── engine-owned copy vocabulary ────────────────────────────────────────────
// Named once so every label, reason, and headline in this module speaks with a
// single voice. `SITE_PLACE` is the ONLY place a site becomes a spoken place
// name, and it stays deliberately generic: it names the studio function, not a
// renderer building instance.

const SITE_PLACE: Record<JourneySite, string> = {
  development: 'Development',
  casting: 'Casting',
  stage: 'the soundstage',
  post: 'the Post Building',
  admin: 'Administration',
}

const PHASE_HEADLINE: Record<ProductionPhase, string> = {
  development: 'In development',
  preProduction: 'In pre-production',
  rehearsal: 'In rehearsal',
  shooting: 'Shooting',
  postProduction: 'In post-production',
  releaseReady: 'Ready to release',
}

const PHASE_CONTINUES: Record<ProductionPhase, string> = {
  development: 'Development continues',
  preProduction: 'Pre-production continues',
  rehearsal: 'Rehearsals continue',
  shooting: 'Shooting continues',
  postProduction: 'Post-production continues',
  releaseReady: 'The picture is ready to release',
}

/** Ranks the "most advanced screenplay still in the player's hands" tie-break. */
const SCRIPT_ADVANCEMENT: Record<ScriptProjectStatus, number> = {
  ready: 3,
  review: 2,
  rewriting: 1,
  drafting: 1,
  // Neither status is a picture the player is still developing: `inProduction`
  // is owned by its production, `produced` is history.
  inProduction: 0,
  produced: 0,
}

// ── total, non-throwing helpers ─────────────────────────────────────────────

/**
 * Consult a read model that is entitled to reject a malformed world. A rejection
 * withholds that model's contribution (operational law 21) instead of
 * propagating out of a presentation projection.
 */
function attempt<T>(compute: () => T): T | null {
  try {
    return compute()
  } catch {
    return null
  }
}

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function conceptTitle(state: GameState, conceptId: string): string | null {
  const concept = state.concepts.find((candidate) => candidate.id === conceptId)
  return concept === undefined ? null : concept.title
}

function talentName(state: GameState, talentId: string): string | null {
  const talent = state.talent.find((candidate) => candidate.id === talentId)
  return talent === undefined ? null : talent.name
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many
}

/**
 * ONE quiet waiting line.
 *
 * `waiting.reason` is the complete sentence a surface speaks while the studio simply has
 * to let the week run, so it names BOTH what is being waited on and the one thing the
 * player can do about it. It used to name only the former, which left every host to
 * append its own "advance the week" — and the guidance card duly stacked two near-identical
 * lines ("Waiting until Week 2 — The camera tests finish in Week 2." above "Waiting —
 * advance the week"). The instruction belongs in the engine's own sentence, said once.
 *
 * `next.label` keeps its own imperative phrasing: the frozen contract says a label always
 * names the verb, and a surface that shows the step as a control still needs one.
 */
function waitOut(reason: string): string {
  return `${reason} — advance the week.`
}

function joinDetail(parts: ReadonlyArray<string | null>): string | null {
  const kept = parts.filter((part): part is string => part !== null && part !== '')
  return kept.length === 0 ? null : kept.join(' · ')
}

/**
 * One blocker rendered as plain guidance. Only `headline` and `remedy` are ever
 * spoken: a blocker's `detail` is the diagnostic field and legitimately carries
 * internal identifiers, which must never reach this surface.
 */
function blockerReason(blocker: ScriptPlayerBlocker): string {
  return `${blocker.headline}. ${blocker.remedy}`
}

/**
 * Founding is the outermost gate on everything else, so when the studio is still
 * a founding draft that blocker is the useful one to speak even though the mode
 * blockers are listed first. Otherwise the read model's own order stands.
 */
function primaryBlocker(
  blockers: readonly ScriptPlayerBlocker[],
): ScriptPlayerBlocker | null {
  const founding = blockers.find((blocker) => blocker.kind === 'studio-founding')
  return founding ?? blockers[0] ?? null
}

// ── which picture the journey is about ──────────────────────────────────────

type CurrentPicture =
  | { kind: 'production'; production: Production }
  | { kind: 'script'; project: ScriptProject }

function findProject(state: GameState, projectId: string): ScriptProject | undefined {
  return state.scriptDevelopment.projects.find((candidate) => candidate.id === projectId)
}

function findProduction(state: GameState, productionId: string): Production | undefined {
  return state.studio.activeProductions.find((candidate) => candidate.id === productionId)
}

/**
 * Frozen precedence:
 *  1. whatever the studio is actually STOPPED on (`nextStudioDecision`),
 *  2. else the active production with the lowest canonical id,
 *  3. else the most advanced screenplay still in the player's hands
 *     (ready > review > drafting/rewriting), lowest canonical id first,
 *  4. else nothing.
 */
function currentPicture(
  state: GameState,
  decision: ReturnType<typeof nextStudioDecision> | null,
): CurrentPicture | null {
  if (decision !== null) {
    if (decision.kind === 'scriptReview' || decision.kind === 'castingReview') {
      const project = findProject(state, decision.projectId)
      if (project !== undefined) return { kind: 'script', project }
    } else {
      const production = findProduction(state, decision.productionId)
      if (production !== undefined) return { kind: 'production', production }
    }
  }

  const productions = [...state.studio.activeProductions].sort((a, b) => compareId(a.id, b.id))
  const production = productions[0]
  if (production !== undefined) return { kind: 'production', production }

  const candidates = state.scriptDevelopment.projects
    .filter((project) => SCRIPT_ADVANCEMENT[project.status] > 0)
    .slice()
    .sort(
      (a, b) =>
        SCRIPT_ADVANCEMENT[b.status] - SCRIPT_ADVANCEMENT[a.status] || compareId(a.id, b.id),
    )
  const project = candidates[0]
  if (project !== undefined) return { kind: 'script', project }

  return null
}

// ── read-model lookups ──────────────────────────────────────────────────────

function castingProjectView(
  casting: CastingSessionsReadModel | null,
  projectId: string,
): CastingProjectView | null {
  if (casting === null) return null
  for (const section of [
    casting.sections.readyToPlan,
    casting.sections.auditioning,
    casting.sections.needsReview,
    casting.sections.history,
  ]) {
    const found = section.find((view) => view.projectId === projectId)
    if (found !== undefined) return found
  }
  return null
}

function scriptCardFor(board: ScriptProjectsReadModel | null, projectId: string) {
  if (board === null) return null
  for (const section of [
    board.sections.needsReview,
    board.sections.inDevelopment,
    board.sections.readyToPackage,
    board.sections.productionHistory,
  ]) {
    const found = section.find((card) => card.projectId === projectId)
    if (found !== undefined) return found
  }
  return null
}

// ── the studio's picture count ──────────────────────────────────────────────

/**
 * `state.studio.releasedFilms` is the authoritative append-only record of every
 * picture the studio has ever released (types.ts:295); `tick.ts:342` appends the
 * FilmResult and `tick.ts:441` flips the screenplay to `produced` in the SAME
 * release step, so the two agree by construction. `releasedFilms` is chosen as
 * the counter because it is the only one that also covers legacy direct
 * greenlights, which never own a managed screenplay project at all.
 */
function releasedCount(state: GameState): number {
  return state.studio.releasedFilms.length
}

function hasEverProduced(state: GameState): boolean {
  return (
    state.studio.releasedFilms.length > 0 ||
    state.scriptDevelopment.projects.some((project) => project.status === 'produced')
  )
}

/** The most recently released picture, by release week then canonical id. */
function latestReleasedTitle(state: GameState): string | null {
  const released = [...state.studio.releasedFilms].sort(
    (a, b) => a.releaseTick - b.releaseTick || compareId(a.productionId, b.productionId),
  )
  const latest = released[released.length - 1]
  if (latest !== undefined) return conceptTitle(state, latest.conceptId)

  const produced = state.scriptDevelopment.projects
    .filter((project) => project.status === 'produced')
    .slice()
    .sort((a, b) => compareId(a.id, b.id))
  const lastProduced = produced[produced.length - 1]
  return lastProduced === undefined ? null : conceptTitle(state, lastProduced.conceptId)
}

// ── stage builders ──────────────────────────────────────────────────────────

function commissionNext(): FirstFilmJourneyNext {
  return {
    kind: 'commission',
    label: `Commission a screenplay at ${SITE_PLACE.development}`,
    site: 'development',
  }
}

function commissionBlocked(
  board: ScriptProjectsReadModel | null,
): { reason: string } | null {
  if (board === null) return null
  if (board.commission.canStart) return null
  const blocker = primaryBlocker(board.commission.blockers)
  return blocker === null ? null : { reason: blockerReason(blocker) }
}

function noPictureView(
  state: GameState,
  board: ScriptProjectsReadModel | null,
): FirstFilmJourneyView {
  const ordinal = releasedCount(state) + 1
  if (hasEverProduced(state)) {
    const title = latestReleasedTitle(state)
    return {
      stage: 'released',
      pictureTitle: title,
      ordinal,
      headline: 'In release',
      detail:
        title === null
          ? 'The last picture is playing. The next one starts with a screenplay.'
          : `${title} is playing. The next picture starts with a screenplay.`,
      next: commissionNext(),
      waiting: null,
      blocked: commissionBlocked(board),
    }
  }
  return {
    stage: 'no-picture',
    pictureTitle: null,
    ordinal,
    headline: 'No screenplay',
    detail: 'The studio has no picture in the works. Every picture starts with a screenplay.',
    next: commissionNext(),
    waiting: null,
    blocked: commissionBlocked(board),
  }
}

function draftingView(
  state: GameState,
  project: ScriptProject,
  ordinal: number,
  title: string | null,
): FirstFilmJourneyView {
  const writer = talentName(state, project.writerId)
  const due = project.dueWeek
  const dueText = due === null ? null : `Due Week ${String(due)}`
  return {
    stage: 'drafting',
    pictureTitle: title,
    ordinal,
    headline: project.status === 'rewriting' ? 'Screenplay — rewriting' : 'Screenplay — drafting',
    detail: joinDetail([writer === null ? null : `Writer: ${writer}`, dueText]),
    next: {
      kind: 'advance-week',
      label:
        due === null
          ? 'The draft is still being written — advance the week'
          : `The draft is due Week ${String(due)} — advance the week`,
      site: null,
    },
    waiting: {
      untilWeek: due,
      reason: waitOut(
        due === null
          ? 'The draft is still being written'
          : `The draft is due Week ${String(due)}`,
      ),
    },
    blocked: null,
  }
}

function scriptReviewView(
  state: GameState,
  project: ScriptProject,
  ordinal: number,
  title: string | null,
): FirstFilmJourneyView {
  const writer = talentName(state, project.writerId)
  return {
    stage: 'script-review',
    pictureTitle: title,
    ordinal,
    headline: 'Script review ready',
    detail: joinDetail([
      writer === null ? null : `Writer: ${writer}`,
      project.rewriteCount === 0 ? 'The first draft is in' : 'The final draft is in',
    ]),
    next: {
      kind: 'script-review',
      label: `Review the screenplay at ${SITE_PLACE.development}`,
      site: 'development',
    },
    waiting: null,
    blocked: null,
  }
}

function auditioningView(
  session: CastingSession,
  ordinal: number,
  title: string | null,
): FirstFilmJourneyView {
  const due = session.dueWeek
  return {
    stage: 'auditioning',
    pictureTitle: title,
    ordinal,
    headline: 'Auditions underway',
    detail: joinDetail([
      `Camera tests are running at ${SITE_PLACE.casting}`,
      due === null ? null : `Results due Week ${String(due)}`,
    ]),
    next: {
      kind: 'advance-week',
      label:
        due === null
          ? 'The camera tests are still running — advance the week'
          : `Audition results are due Week ${String(due)} — advance the week`,
      site: null,
    },
    waiting: {
      untilWeek: due,
      reason: waitOut(
        due === null
          ? 'The camera tests are still running'
          : `The camera tests finish in Week ${String(due)}`,
      ),
    },
    blocked: null,
  }
}

/**
 * How many camera-test reads are sitting on the desk. A session in `review` always
 * carries its complete results (castingSessions.ts:386 builds every slot before it flips
 * the status), so this is a cheap count of what is already there — never a re-derivation
 * and never an estimate. Malformed results withhold the number instead of guessing one.
 */
function auditionReadCount(session: CastingSession | undefined): number | null {
  const results = session?.results ?? null
  if (results === null || typeof results !== 'object') return null
  let reads = 0
  for (const pair of Object.values(results)) {
    if (Array.isArray(pair)) reads += pair.length
  }
  return reads > 0 ? reads : null
}

function auditionReviewView(
  session: CastingSession | undefined,
  ordinal: number,
  title: string | null,
): FirstFilmJourneyView {
  // The picture's WRITER is stale context on this state — the decision in front of the
  // player is who can carry the picture, and the detail leads with the results
  // themselves (live-playtest finding).
  const reads = auditionReadCount(session)
  return {
    stage: 'audition-review',
    pictureTitle: title,
    ordinal,
    headline: 'Audition results ready',
    detail: joinDetail([
      reads === null
        ? `The camera tests are in — the reads are waiting at ${SITE_PLACE.casting}`
        : `The camera tests are in — ${String(reads)} ${plural(reads, 'read is', 'reads are')} waiting at ${SITE_PLACE.casting}`,
    ]),
    next: {
      kind: 'audition-review',
      label: `Review audition results at ${SITE_PLACE.casting}`,
      site: 'casting',
    },
    waiting: null,
    blocked: null,
  }
}

function readyToPackageView(
  state: GameState,
  project: ScriptProject,
  ordinal: number,
  title: string | null,
  board: ScriptProjectsReadModel | null,
  casting: CastingSessionsReadModel | null,
  session: CastingSession | undefined,
): FirstFilmJourneyView {
  const writer = talentName(state, project.writerId)

  // Legality is never decided here. Auditions are legal iff the Casting Room's
  // own board publishes the action (castingReadModel.ts:319); the screenplay
  // board's identical `planAuditions` action is the fallback when the Casting
  // Room projection withheld itself.
  const castingView = castingProjectView(casting, project.id)
  const scriptCard = scriptCardFor(board, project.id)
  const canPlanAuditions =
    castingView !== null
      ? castingView.legalActions.some((action) => action.kind === 'planAuditions')
      : (scriptCard?.legalActions.some((action) => action.kind === 'planAuditions') ?? false)

  const packageView = board?.packages.find((entry) => entry.projectId === project.id) ?? null
  const canOpenPackage = packageView?.openAction != null

  const next: FirstFilmJourneyNext = canPlanAuditions
    ? { kind: 'plan-auditions', label: `Plan auditions at ${SITE_PLACE.casting}`, site: 'casting' }
    : {
        kind: 'open-package',
        label: `Assemble the picture's package at ${SITE_PLACE.casting}`,
        site: 'casting',
      }

  // First-run guidance leads with the action, and names ONLY what this state actually
  // offers. It used to add "…or go straight to the picture's package", which advertised a
  // step the world does not have here: at `ready-to-package` the only package route is the
  // deep Assembly path, and Casting's own verb opens the audition planner. A card that
  // names a control the player cannot find is the confusion this campaign exists to end
  // (red-team finding, first-movie journey).
  const detailTail = canPlanAuditions
    ? 'Auditions show you who can carry the picture'
    : session !== undefined && session.status === 'complete'
      ? "The camera tests are done. The picture's package is next"
      : "The picture's package is next"

  const blocked =
    canPlanAuditions || canOpenPackage
      ? null
      : (() => {
          const blocker = primaryBlocker(packageView?.availability.blockers ?? [])
          return blocker === null ? null : { reason: blockerReason(blocker) }
        })()

  return {
    stage: 'ready-to-package',
    pictureTitle: title,
    ordinal,
    headline: 'Screenplay accepted',
    detail: joinDetail([writer === null ? null : `Writer: ${writer}`, detailTail]),
    next,
    waiting: null,
    blocked,
  }
}

// ── production ──────────────────────────────────────────────────────────────

/**
 * The picture's current phase. The managed workflow is authoritative; a legacy
 * greenlight owns no workflow, so the frozen schedule mapping
 * (operations.ts:56) answers instead. A `remainingTicks` outside that mapping's
 * declared range is malformed input: it withholds the phase rather than throwing.
 */
function productionPhase(state: GameState, production: Production): ProductionPhase | null {
  const workflow = state.operations.workflows.find(
    (candidate) => candidate.productionId === production.id,
  )
  if (workflow !== undefined) return workflow.phase
  return attempt(() => productionPhaseForRemainingTicks(production.remainingTicks))
}

/**
 * The picture's own reserved facilities, named the way the engine already names them.
 *
 * `state.operations.facilities[].name` is engine-owned vocabulary ("Soundstage 7",
 * "Scenery Shop", operations.ts:29) — NOT renderer building names — so speaking it here
 * invents no physical world (law 12). The join order and separator are the ones the
 * Production Board already publishes as `currentFacility`, so the guidance and the
 * blocked-week reason name the same place in the same words.
 *
 * Null whenever the reservation set cannot be named exactly: the caller then falls back to
 * the generic site place rather than half-naming somewhere.
 */
function reservedFacilityLabel(state: GameState, productionId: string): string | null {
  const workflow = state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )
  if (workflow === undefined) return null
  const names: string[] = []
  for (const reservation of workflow.reservations) {
    const facility = state.operations.facilities.find(
      (candidate) => candidate.id === reservation.facilityId,
    )
    if (facility === undefined || facility.name === '') return null
    names.push(facility.name)
  }
  return names.length === 0 ? null : names.join(' + ')
}

function commandGuidance(
  state: GameState,
  command: ProductionOperationsCommand,
  site: JourneySite,
): { reason: string; label: string } {
  const place = SITE_PLACE[site]
  switch (command.kind) {
    case 'assignShootingDirector': {
      const director = talentName(state, command.directorId)
      const who = director ?? 'the director'
      return {
        reason: `${who} has not been called to ${place}.`,
        label: `Call ${who} to ${place}`,
      }
    }
    case 'clearSceneryLoadIn': {
      // The scenery beat does NOT happen at the soundstage alone: the world flags the
      // Scenery & Service ground beside the stage, and the studio's own blocked-week
      // reason already names "Soundstage 7 + Scenery Shop". Saying "the soundstage" sent
      // the player to one half of the place the lot was pointing at (red-team finding), so
      // this step speaks the picture's own reserved facilities instead. Where they cannot
      // be named exactly, the generic site place still answers.
      const where = reservedFacilityLabel(state, command.productionId) ?? place
      return {
        reason: 'A scenery load-in is blocking the camera.',
        label: `Clear the scenery load-in at ${where}`,
      }
    }
    case 'scheduleShootingTake':
      return {
        reason: 'The next take is ready to schedule.',
        label: `Schedule the take at ${place}`,
      }
  }
}

function inProductionView(
  state: GameState,
  production: Production,
  ordinal: number,
  title: string | null,
  command: ProductionOperationsCommand | null,
): FirstFilmJourneyView {
  const phase = productionPhase(state, production)
  const director = talentName(state, production.directorId)
  const remaining = production.remainingTicks
  const remainingKnown = Number.isInteger(remaining) && remaining > 0
  // `remainingTicks` counts the weeks still to run: tick decrements it and
  // releases at zero, so the picture arrives in `market.tick + remaining`. The one
  // correction is the M1 skip-first rule (tick.ts:37) — a picture does NOT advance
  // during its own greenlight tick — which costs it exactly one extra week.
  // The result is the week the finished picture is IN HAND, which is the same
  // convention the screenplay and audition `dueWeek` fields already use: the
  // player sees the outcome when `market.tick` reaches that number.
  const releaseWeek = remainingKnown
    ? state.market.tick + remaining + (state.market.tick === production.startTick ? 1 : 0)
    : null

  const detail = joinDetail([
    director === null ? null : `Director: ${director}`,
    remainingKnown
      ? `${String(remaining)} ${plural(remaining, 'week', 'weeks')} of work ${plural(remaining, 'remains', 'remain')}`
      : null,
  ])
  const headline = phase === null ? 'In production' : PHASE_HEADLINE[phase]

  if (command !== null) {
    const site: JourneySite = phase === 'postProduction' ? 'post' : 'stage'
    const guidance = commandGuidance(state, command, site)
    return {
      stage: 'in-production',
      pictureTitle: title,
      ordinal,
      headline,
      detail,
      next: { kind: 'resolve-production', label: guidance.label, site },
      waiting: null,
      blocked: { reason: guidance.reason },
    }
  }

  const continues = phase === null ? 'Production continues' : PHASE_CONTINUES[phase]
  return {
    stage: 'in-production',
    pictureTitle: title,
    ordinal,
    headline,
    detail,
    next: {
      kind: 'advance-week',
      label:
        releaseWeek === null
          ? `${continues} — advance the week`
          : `The picture is due in Week ${String(releaseWeek)} — advance the week`,
      site: null,
    },
    waiting: {
      untilWeek: releaseWeek,
      reason: waitOut(
        releaseWeek === null
          ? continues
          : `${continues}. The picture is due in Week ${String(releaseWeek)}`,
      ),
    },
    blocked: null,
  }
}

// ── the projection ──────────────────────────────────────────────────────────

/**
 * The complete, engine-owned answer to "what is my picture doing and what do I
 * do next". Pure, deterministic, save-neutral, RNG-free.
 */
export function firstFilmJourney(state: GameState): FirstFilmJourneyView {
  const board = attempt(() => scriptProjectsReadModel(state))
  const casting = attempt(() => castingSessionsReadModel(state))
  const decision = attempt(() => nextStudioDecision(state))

  const picture = currentPicture(state, decision)
  if (picture === null) return noPictureView(state, board)

  const ordinal = releasedCount(state) + 1

  if (picture.kind === 'production') {
    const title = conceptTitle(state, picture.production.conceptId)
    const command =
      decision !== null &&
      decision.kind === 'productionOperation' &&
      decision.productionId === picture.production.id
        ? decision.command
        : null
    return inProductionView(state, picture.production, ordinal, title, command)
  }

  const project = picture.project
  const title = conceptTitle(state, project.conceptId)

  switch (project.status) {
    case 'drafting':
    case 'rewriting':
      return draftingView(state, project, ordinal, title)
    case 'review':
      return scriptReviewView(state, project, ordinal, title)
    case 'ready': {
      const session = castingSessionForProject(state.castingSessions, project.id)
      if (session !== undefined && session.status === 'auditioning') {
        return auditioningView(session, ordinal, title)
      }
      if (session !== undefined && session.status === 'review') {
        return auditionReviewView(session, ordinal, title)
      }
      return readyToPackageView(state, project, ordinal, title, board, casting, session)
    }
    default:
      // `inProduction` / `produced` never reach here: `currentPicture` ranks them
      // at zero and never selects them. Reaching this arm means the world is
      // malformed, so the journey degrades to the honest "nothing in flight" view
      // rather than inventing a stage.
      return noPictureView(state, board)
  }
}
