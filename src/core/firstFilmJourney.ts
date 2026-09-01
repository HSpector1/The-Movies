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
import { queueInPriorityOrder } from './productionQueue.js'
import { releaseCommitmentFor } from './releaseAuthority.js'
import { sceneryLoadInDecision } from './sceneryLoadIn.js'
import {
  nextStudioDecision,
  scriptProjectsReadModel,
  type ProductionOperationsCommand,
  type ScriptPlayerBlocker,
  type ScriptProjectsReadModel,
} from './scriptReadModel.js'
import { studioQueueView, type StudioQueueView } from './studioQueueView.js'
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

/**
 * The precise filmmaking beat inside the broader compatibility stage above.
 *
 * `stage` remains the stable routing vocabulary. `beat` is the player-facing
 * answer to "where is this picture in the movie-making journey?" and is still a
 * pure projection of screenplay, casting-session, workflow-phase, and release
 * truth already owned by the engine.
 */
export type PictureJourneyBeat =
  | 'no-picture'
  | 'screenplay-writing'
  | 'screenplay-review'
  | 'screenplay-ready'
  | 'auditions-running'
  | 'auditions-ready'
  | 'auditions-reviewed'
  | 'greenlit'
  | 'pre-production'
  | 'rehearsal'
  | 'load-in'
  | 'shooting'
  | 'post-production'
  | 'release-ready'
  | 'released'

export type JourneyTargetKind =
  | 'commission'
  | 'script-review'
  | 'plan-auditions'
  | 'audition-review'
  | 'open-package'
  | 'review-casting-blocker'
  | 'resolve-production'
  | 'release-review' // P06A (charter W1): the explicit release decision
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
  /** Exact filmmaking beat; presentation may highlight it but never advance it. */
  beat: PictureJourneyBeat
  /** Exact production identity while this journey names a production or release. */
  productionId: string | null
  /** Exact screenplay identity; null only when no managed project owns this picture. */
  scriptProjectId: string | null
  pictureTitle: string | null
  /** 1 = the studio's first commissioned picture; stable for that managed project. */
  ordinal: number
  headline: string
  /** The latest milestone or material change the player should understand. */
  whatHappened: string
  /** Why that milestone changes the player's choices or expectations. */
  whyItMatters: string
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

// P05A W1/W2: Rehearsal is company/stage PREPARATION — `LOAD-IN` is reserved
// for the exact Shooting scenery transit, which cannot begin before the
// Director call creates it (Package 05 §8). W2's governed projection bump
// (v12) added the exact `rehearsal` wire member, so the beat now says what the
// phase is.
const PHASE_HEADLINE: Record<ProductionPhase, string> = {
  development: 'PICTURE GREENLIT',
  preProduction: 'PRE-PRODUCTION',
  rehearsal: 'REHEARSAL',
  shooting: 'SHOOTING',
  postProduction: 'POST-PRODUCTION',
  releaseReady: 'RELEASE READY',
}

const PHASE_BEAT: Record<ProductionPhase, PictureJourneyBeat> = {
  development: 'greenlit',
  preProduction: 'pre-production',
  rehearsal: 'rehearsal',
  shooting: 'shooting',
  postProduction: 'post-production',
  releaseReady: 'release-ready',
}

const PHASE_MILESTONE: Record<ProductionPhase, string> = {
  development: 'The picture was greenlit.',
  preProduction: 'The cast and crew package is locked.',
  rehearsal: 'The picture took its stage and the company is rehearsing.',
  shooting: 'Principal photography started.',
  postProduction: 'Principal photography wrapped.',
  releaseReady: 'The final cut is complete.',
}

const PHASE_SIGNIFICANCE: Record<ProductionPhase, string> = {
  development: 'The committed cast and crew are preparing the picture for production.',
  preProduction: 'Departments are preparing the stage, scenery, and shooting company.',
  rehearsal: 'The company is preparing on its own stage before the camera can turn.',
  shooting: 'The director, cast, and crew are working on set. No production action is required unless the card names one.',
  postProduction: 'Editorial and finishing are turning the photographed material into the release cut.',
  releaseReady: 'No production work remains. Releasing is now your explicit call — nothing happens until you commit.',
}

const PHASE_CONTINUES: Record<ProductionPhase, string> = {
  development: 'Development continues',
  preProduction: 'Pre-production continues',
  rehearsal: 'Rehearsal continues',
  shooting: 'Shooting continues',
  postProduction: 'Post-production continues',
  releaseReady: 'The picture holds at Release Ready until you commit it',
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

/** One exact managed screenplay owner, never a title or first-match substitute. */
function scriptProjectIdForProduction(state: GameState, productionId: string): string | null {
  const owners = state.scriptDevelopment.projects.filter(
    (candidate) => candidate.productionId === productionId,
  )
  return owners.length === 1 ? owners[0]!.id : null
}

/** Stable 1-based commissioning order for one authoritative managed screenplay. */
function scriptProjectOrdinal(state: GameState, projectId: string | null): number | null {
  if (projectId === null) return null
  const commissioned = [...state.scriptDevelopment.projects].sort(
    (a, b) => a.commissionedWeek - b.commissionedWeek || compareId(a.id, b.id),
  )
  const index = commissioned.findIndex((candidate) => candidate.id === projectId)
  return index === -1 ? null : index + 1
}

/**
 * Frozen precedence:
 *  1. whatever the studio is actually STOPPED on (`nextStudioDecision`),
 *  2. else the most advanced screenplay still in the player's hands
 *     (ready > review > drafting/rewriting), lowest canonical id first,
 *  3. else the newest active production (latest start week, newest canonical
 *     id as the deterministic tie-break),
 *  4. else nothing.
 *
 * A calm older production must not hide a newer picture that still needs the
 * player's screenplay/casting work. A production decision remains first because
 * that is the authoritative blocker stopping the studio week.
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

  const candidates = state.scriptDevelopment.projects
    .filter((project) => SCRIPT_ADVANCEMENT[project.status] > 0)
    .slice()
    .sort(
      (a, b) =>
        SCRIPT_ADVANCEMENT[b.status] - SCRIPT_ADVANCEMENT[a.status] || compareId(a.id, b.id),
    )
  const project = candidates[0]
  if (project !== undefined) return { kind: 'script', project }

  const productions = [...state.studio.activeProductions].sort(
    (a, b) => b.startTick - a.startTick || compareId(b.id, a.id),
  )
  const production = productions[0]
  if (production !== undefined) return { kind: 'production', production }

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
function latestReleasedPicture(
  state: GameState,
): { productionId: string | null; scriptProjectId: string | null; title: string | null } {
  const released = [...state.studio.releasedFilms].sort(
    (a, b) => a.releaseTick - b.releaseTick || compareId(a.productionId, b.productionId),
  )
  const latest = released[released.length - 1]
  if (latest !== undefined) {
    return {
      productionId: latest.productionId,
      scriptProjectId: scriptProjectIdForProduction(state, latest.productionId),
      title: conceptTitle(state, latest.conceptId),
    }
  }

  const produced = state.scriptDevelopment.projects
    .filter((project) => project.status === 'produced')
    .slice()
    .sort((a, b) => compareId(a.id, b.id))
  const lastProduced = produced[produced.length - 1]
  return lastProduced === undefined
    ? { productionId: null, scriptProjectId: null, title: null }
    : {
        productionId: lastProduced.productionId,
        scriptProjectId: lastProduced.id,
        title: conceptTitle(state, lastProduced.conceptId),
      }
}

// ── stage builders ──────────────────────────────────────────────────────────

function commissionNext(blocked: { reason: string } | null): FirstFilmJourneyNext {
  return {
    kind: 'commission',
    label:
      blocked === null
        ? `Commission a screenplay at ${SITE_PLACE.development}`
        : `Review the screenplay blocker at ${SITE_PLACE.development}`,
    site: 'development',
  }
}

function commissionBlocked(
  board: ScriptProjectsReadModel | null,
): { reason: string } | null {
  if (board === null) return null
  if (
    board.commission.canStart ||
    (
      board.commission.blockers.length > 0 &&
      board.commission.blockers.every((blocker) => blocker.kind === 'facility-capacity')
    )
  ) return null
  const blocker = primaryBlocker(board.commission.blockers)
  return blocker === null ? null : { reason: blockerReason(blocker) }
}

function noPictureView(
  state: GameState,
  board: ScriptProjectsReadModel | null,
): FirstFilmJourneyView {
  const nextOrdinal = releasedCount(state) + 1
  const blocked = commissionBlocked(board)
  if (hasEverProduced(state)) {
    const released = latestReleasedPicture(state)
    const title = released.title
    const ordinal =
      scriptProjectOrdinal(state, released.scriptProjectId) ?? Math.max(1, releasedCount(state))
    return {
      stage: 'released',
      beat: 'released',
      productionId: released.productionId,
      scriptProjectId: released.scriptProjectId,
      pictureTitle: title,
      ordinal,
      headline: 'PICTURE RELEASED',
      whatHappened:
        title === null ? 'The studio released a picture.' : `${title} reached audiences.`,
      whyItMatters:
        blocked === null
          ? 'The picture is now earning its theatrical run. Development is free to start the next screenplay.'
          : 'The picture is now earning its theatrical run. The next screenplay cannot start until the Development blocker below is cleared.',
      detail:
        title === null
          ? 'The last picture is playing. The next one starts with a screenplay.'
          : `${title} is playing. The next picture starts with a screenplay.`,
      next: commissionNext(blocked),
      waiting: null,
      blocked,
    }
  }
  return {
    stage: 'no-picture',
    beat: 'no-picture',
    productionId: null,
    scriptProjectId: null,
    pictureTitle: null,
    ordinal: nextOrdinal,
    headline: 'START A PICTURE',
    whatHappened: 'No screenplay is currently in development.',
    whyItMatters: 'Every picture begins with a screenplay commissioned at Development.',
    detail: 'The studio has no picture in the works. Every picture starts with a screenplay.',
    next: commissionNext(blocked),
    waiting: null,
    blocked,
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
    beat: 'screenplay-writing',
    productionId: null,
    scriptProjectId: project.id,
    pictureTitle: title,
    ordinal,
    headline: project.status === 'rewriting' ? 'SCREENPLAY REWRITE' : 'SCREENPLAY IN PROGRESS',
    whatHappened:
      project.status === 'rewriting'
        ? 'The screenplay went back for its final rewrite.'
        : 'The screenplay was commissioned.',
    whyItMatters:
      'The writer is turning the accepted premise into the script that casting and production will use.',
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
    beat: 'screenplay-review',
    productionId: null,
    scriptProjectId: project.id,
    pictureTitle: title,
    ordinal,
    headline: 'SCREENPLAY READY',
    whatHappened:
      project.rewriteCount === 0 ? 'The first draft is finished.' : 'The final draft is finished.',
    whyItMatters:
      'Review the pages now. Accepting the screenplay sends the picture forward to camera tests and casting.',
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
  scriptProjectId: string,
  ordinal: number,
  title: string | null,
): FirstFilmJourneyView {
  const due = session.dueWeek
  return {
    stage: 'auditioning',
    beat: 'auditions-running',
    productionId: null,
    scriptProjectId,
    pictureTitle: title,
    ordinal,
    headline: 'CAMERA TESTS UNDERWAY',
    whatHappened: 'The audition slate was sent to Casting.',
    whyItMatters:
      'The casting sheet keeps the observed estimate and range for each read. The tests assign no role and change no one — the evidence informs your choice alongside Fit, Star Power, availability, and cost.',
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
  scriptProjectId: string,
  ordinal: number,
  title: string | null,
): FirstFilmJourneyView {
  // The picture's WRITER is stale context on this state — the decision in front of the
  // player is who can carry the picture, and the detail leads with the results
  // themselves (live-playtest finding).
  const reads = auditionReadCount(session)
  return {
    stage: 'audition-review',
    beat: 'auditions-ready',
    productionId: null,
    scriptProjectId,
    pictureTitle: title,
    ordinal,
    headline: 'AUDITION RESULTS READY',
    whatHappened:
      reads === null
        ? 'The camera tests finished.'
        : `${String(reads)} camera-test ${plural(reads, 'read is', 'reads are')} complete.`,
    whyItMatters:
      'The stored observations show what each performer revealed for each role. Review them before choosing the cast.',
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
  queue: StudioQueueView | null,
): FirstFilmJourneyView {
  const writer = talentName(state, project.writerId)

  const queued = queueInPriorityOrder(state.productionQueue).find(
    (entry) =>
      (entry.kind === 'startCastingSession' && entry.payload.projectId === project.id) ||
      (entry.kind === 'greenlightScriptProject' && entry.scriptProjectId === project.id),
  )
  if (queued !== undefined) {
    const waiter = queue?.waiters.find(
      (candidate) => candidate.kind === 'intent' && candidate.ordinal === queued.ordinal,
    )
    const auditionsQueued = queued.kind === 'startCastingSession'
    const auditionsReviewed = session?.status === 'complete'
    const queueDetail = waiter?.detail ?? 'Development & Casting is still occupied.'
    return {
      stage: 'ready-to-package',
      beat: auditionsQueued || !auditionsReviewed ? 'screenplay-ready' : 'auditions-reviewed',
      productionId: null,
      scriptProjectId: project.id,
      pictureTitle: title,
      ordinal,
      headline: auditionsQueued ? 'AUDITIONS QUEUED' : 'GREENLIGHT QUEUED',
      whatHappened: auditionsQueued
        ? 'The camera-test request joined the Development & Casting queue.'
        : 'The finished package joined the Development & Casting queue.',
      whyItMatters: auditionsQueued
        ? 'The screenplay is still Ready. No camera test has started and no actor is reserved until a shared slot opens.'
        : 'The picture is not greenlit yet. No production identity, budget, or talent commitment exists until the package reaches a shared slot and is revalidated.',
      detail: joinDetail([
        `Waiting since Week ${String(queued.queuedWeek)}`,
        queueDetail,
      ]),
      next: {
        kind: 'advance-week',
        label: auditionsQueued
          ? 'Wait for the camera-test queue — advance the week'
          : 'Wait for the greenlight queue — advance the week',
        site: null,
      },
      waiting: {
        untilWeek: null,
        reason: waitOut(
          auditionsQueued
            ? 'The camera-test request will be revalidated when Development & Casting capacity reaches it'
            : 'The package will be revalidated for greenlight when Development & Casting capacity reaches it',
        ),
      },
      blocked: null,
    }
  }

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

  const blocked =
    canPlanAuditions || canOpenPackage
      ? null
      : (() => {
          const blocker = primaryBlocker(packageView?.availability.blockers ?? [])
          return blocker === null ? null : { reason: blockerReason(blocker) }
        })()

  const next: FirstFilmJourneyNext | null = canPlanAuditions
    ? { kind: 'plan-auditions', label: `Plan auditions at ${SITE_PLACE.casting}`, site: 'casting' }
    : canOpenPackage
      ? {
          kind: 'open-package',
          label: `Assemble the picture's package at ${SITE_PLACE.casting}`,
          site: 'casting',
        }
      : blocked === null
        ? null
        : {
            kind: 'review-casting-blocker',
            label: `Review the package blocker at ${SITE_PLACE.casting}`,
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
    : canOpenPackage
      ? session !== undefined && session.status === 'complete'
        ? "The camera tests are done. The picture's package is next"
        : "The picture's package is next"
      : blocked !== null
        ? 'The picture cannot be packaged until the Casting blocker below is cleared'
        : 'No package step is available at Casting right now'

  const auditionsReviewed = session !== undefined && session.status === 'complete'

  return {
    stage: 'ready-to-package',
    beat: auditionsReviewed ? 'auditions-reviewed' : 'screenplay-ready',
    productionId: null,
    scriptProjectId: project.id,
    pictureTitle: title,
    ordinal,
    headline: auditionsReviewed ? 'AUDITIONS REVIEWED' : 'SCREENPLAY ACCEPTED',
    whatHappened: auditionsReviewed
      ? 'The camera-test evidence was reviewed.'
      : 'The screenplay was accepted.',
    whyItMatters: auditionsReviewed
      ? 'Those observations now follow each performer into casting. They inform the choice; they do not assign anyone.'
      : 'The picture now has a locked story. Camera tests are the next chance to replace casting guesses with evidence.',
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

/** The exact soundstage held by this picture, when the workflow proves one. */
function stageFacilityLabel(state: GameState, productionId: string): string | null {
  const workflow = state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )
  if (workflow === undefined) return null
  const stageId = workflow.bindings.stageFacilityId ?? workflow.reservations.find(
    (reservation) => reservation.capability === 'soundstage',
  )?.facilityId
  if (stageId === undefined || stageId === null) return null
  const stage = state.operations.facilities.find((candidate) => candidate.id === stageId)
  return stage?.name === '' ? null : stage?.name ?? null
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
  scriptProjectId: string | null,
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
    stageFacilityLabel(state, production.id),
    remainingKnown
      ? `${String(remaining)} ${plural(remaining, 'week', 'weeks')} remaining`
      : null,
    director === null ? null : `Director: ${director}`,
  ])
  const headline = phase === null ? 'IN PRODUCTION' : PHASE_HEADLINE[phase]
  const defaultBeat: PictureJourneyBeat = phase === null ? 'greenlit' : PHASE_BEAT[phase]
  const defaultMilestone =
    phase === null ? 'The picture entered production.' : PHASE_MILESTONE[phase]
  const defaultSignificance =
    phase === null
      ? 'The package is committed and the studio is carrying the picture toward release.'
      : PHASE_SIGNIFICANCE[phase]

  if (command !== null) {
    const site: JourneySite =
      command.kind === 'clearSceneryLoadIn' || phase === 'postProduction' ? 'post' : 'stage'
    const guidance = commandGuidance(state, command, site)
    const beat: PictureJourneyBeat =
      command.kind === 'clearSceneryLoadIn' ? 'load-in' : defaultBeat
    // Hostile-review F6: while a decision stands, the card must not claim
    // the phase's happy milestone. 'SHOOTING · Principal photography
    // started.' over a Director hold was the exact management-distance
    // over-claim the closed vocabulary exists to prevent — the same defect
    // class as the workspace header, fixed at the same authority (the
    // journey owns this copy; the beat vocabulary stays frozen).
    const commandHeadline =
      command.kind === 'clearSceneryLoadIn'
        ? 'LOAD-IN BLOCKED'
        : command.kind === 'assignShootingDirector'
          ? 'DIRECTOR CALL REQUIRED'
          : command.kind === 'scheduleShootingTake'
            ? 'READY TO SCHEDULE'
            : headline
    const commandMilestone =
      command.kind === 'assignShootingDirector'
        ? 'The company holds its stage; principal photography has not started.'
        : command.kind === 'scheduleShootingTake'
          ? 'The company and scenery are ready for the camera.'
          : defaultMilestone
    return {
      stage: 'in-production',
      beat,
      productionId: production.id,
      scriptProjectId,
      pictureTitle: title,
      ordinal,
      headline: commandHeadline,
      whatHappened: commandMilestone,
      whyItMatters: 'The picture cannot advance until the named production problem is cleared.',
      detail,
      next: { kind: 'resolve-production', label: guidance.label, site },
      waiting: null,
      blocked: { reason: guidance.reason },
    }
  }

  // P05A W1 — HONEST TRANSIT GUIDANCE. A current derived load-in publishes no
  // command (the one classifier owns that), so the journey must say what the
  // waiting IS instead of a generic "shooting continues": where the scenery is
  // going, how many authoritative weeks remain, and that arrival is the
  // engine's own settlement. `arrived-pending` (old save / reconnect window)
  // reads as arrival, settling at the next boundary. Withheld provenance keeps
  // the plain phase guidance — W2's closed operational states own that truth.
  if (phase === 'shooting') {
    const workflow = state.operations.workflows.find(
      (candidate) => candidate.productionId === production.id,
    )
    const decision = workflow === undefined
      ? null
      : sceneryLoadInDecision(state, workflow, state.market.tick)
    if (decision !== null && (decision.kind === 'in-transit' || decision.kind === 'arrived-pending')) {
      const where = stageFacilityLabel(state, production.id) ?? 'its stage'
      const inTransit = decision.kind === 'in-transit'
      const remaining = inTransit ? decision.loadIn.weeksRemaining : 0
      return {
        stage: 'in-production',
        beat: 'load-in',
        productionId: production.id,
        scriptProjectId,
        pictureTitle: title,
        ordinal,
        headline: 'LOAD-IN',
        whatHappened: defaultMilestone,
        whyItMatters:
          'Scenery arrival is not a player decision — the engine settles the load-in itself.',
        detail,
        next: {
          kind: 'advance-week',
          label: inTransit
            ? 'Scenery is on the road — advance the week'
            : 'Scenery has arrived — advance the week',
          site: null,
        },
        waiting: {
          untilWeek: state.market.tick + (inTransit ? remaining : 1),
          reason: waitOut(
            inTransit
              ? `Scenery is en route to ${where} · ` +
                `${String(remaining)} ${plural(remaining, 'week', 'weeks')} remaining`
              : `Scenery has arrived at ${where} · the camera is being prepared`,
          ),
        },
        blocked: null,
      }
    }
  }

  // ── P06A (charter W1): Release Ready is the ONE release decision ─────────
  // An uncommitted picture HOLDS — the journey names the review, the place
  // (Production & Post) and the choice, and promises no week. A committed
  // picture releases on the next authoritative week, and says exactly that.
  if (phase === 'releaseReady') {
    const committed = releaseCommitmentFor(state.releaseAuthority, production.id) !== null
    if (committed) {
      return {
        stage: 'in-production',
        beat: defaultBeat,
        productionId: production.id,
        scriptProjectId,
        pictureTitle: title,
        ordinal,
        headline: 'COMMITTED TO RELEASE',
        whatHappened: `${title ?? 'The picture'} is committed to release.`,
        whyItMatters:
          'The commitment is irreversible. The next studio week releases the picture and its results follow.',
        detail,
        next: {
          kind: 'advance-week',
          label: 'The picture releases on the next studio week — advance the week',
          site: null,
        },
        waiting: {
          untilWeek: state.market.tick + 1,
          reason: waitOut('Committed to release · resolves on the next studio week'),
        },
        blocked: null,
      }
    }
    return {
      stage: 'in-production',
      beat: defaultBeat,
      productionId: production.id,
      scriptProjectId,
      pictureTitle: title,
      ordinal,
      headline,
      whatHappened: defaultMilestone,
      whyItMatters: defaultSignificance,
      detail,
      next: {
        kind: 'release-review',
        label: 'Review the release at Production & Post — commit, or hold',
        site: 'post',
      },
      // No promised week: an uncommitted picture holds for as long as you hold it.
      waiting: null,
      blocked: null,
    }
  }

  const continues = phase === null ? 'Production continues' : PHASE_CONTINUES[phase]
  return {
    stage: 'in-production',
    beat: defaultBeat,
    productionId: production.id,
    scriptProjectId,
    pictureTitle: title,
    ordinal,
    headline,
    whatHappened: defaultMilestone,
    whyItMatters: defaultSignificance,
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
  const queue = attempt(() => studioQueueView(state))
  const decision = attempt(() => nextStudioDecision(state))

  const picture = currentPicture(state, decision)
  if (picture === null) return noPictureView(state, board)

  const legacyOrdinal = releasedCount(state) + 1

  if (picture.kind === 'production') {
    const title = conceptTitle(state, picture.production.conceptId)
    const scriptProjectId = scriptProjectIdForProduction(state, picture.production.id)
    const ordinal = scriptProjectOrdinal(state, scriptProjectId) ?? legacyOrdinal
    const command =
      decision !== null &&
      decision.kind === 'productionOperation' &&
      decision.productionId === picture.production.id
        ? decision.command
        : null
    return inProductionView(
      state,
      picture.production,
      scriptProjectId,
      ordinal,
      title,
      command,
    )
  }

  const project = picture.project
  const title = conceptTitle(state, project.conceptId)
  const ordinal = scriptProjectOrdinal(state, project.id) ?? legacyOrdinal

  switch (project.status) {
    case 'drafting':
    case 'rewriting':
      return draftingView(state, project, ordinal, title)
    case 'review':
      return scriptReviewView(state, project, ordinal, title)
    case 'ready': {
      const session = castingSessionForProject(state.castingSessions, project.id)
      if (session !== undefined && session.status === 'auditioning') {
        return auditioningView(session, project.id, ordinal, title)
      }
      if (session !== undefined && session.status === 'review') {
        return auditionReviewView(session, project.id, ordinal, title)
      }
      return readyToPackageView(state, project, ordinal, title, board, casting, session, queue)
    }
    default:
      // `inProduction` / `produced` never reach here: `currentPicture` ranks them
      // at zero and never selects them. Reaching this arm means the world is
      // malformed, so the journey degrades to the honest "nothing in flight" view
      // rather than inventing a stage.
      return noPictureView(state, board)
  }
}
