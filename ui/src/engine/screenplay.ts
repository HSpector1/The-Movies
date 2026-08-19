// ═════════════════════════════════════════════════════════════════════════════
// C2a-M3 — A WRITER GOES TO WORK AND HANDS ME A NEW MOVIE (charter §3.5)
// ═════════════════════════════════════════════════════════════════════════════
//
// The milestone's fantasy, stated by the Owner in one sentence, is the whole test
// of this module: *a writer goes to work and eventually hands me a new movie.*
// The engine already mints the concept, writes the beats, draws the working title
// and varies the clock. None of that is a game until a player can SEE it, so this
// module is the second half — the UI-side boundary that turns the engine's own
// answers into the four things a player meets:
//
//   1. TWO WAYS TO START A PICTURE. Adapt a premise the market is selling, or put
//      one of your own writers on an original. The second is the one that removes
//      C1's silent thirty-film lifetime ceiling.
//   2. THE TITLE MOMENT. The studio's writers name the picture; the player may
//      retitle it without ceremony, and the record of what it was first called
//      survives the rename.
//   3. PROVENANCE. "An Original Screenplay by Ava Hartwell" — or the market line.
//   4. WHAT THE SCRIPT ASKS FOR. The beats name the locations the picture needs.
//
// ── WHY THIS IS A SIBLING OF `adapter.ts`, NOT A SECTION INSIDE IT ───────────
//
// The same reason `sets.ts` gives, and the same layer: `ui/src/engine/` is the
// ONE boundary between React and the core, and no component may import
// `src/core` directly. `adapter.ts` is that layer's principal module and it is
// seven thousand lines under other lanes' ownership; a milestone-scoped surface
// lands beside it rather than inside it. Folding these back together after the
// campaign seals is a pure move with no semantic content.
//
// ── NOTHING HERE IS A RULE ───────────────────────────────────────────────────
//
// Every number and every sentence below is the ENGINE'S. `scriptDraftWeeks` says
// how long; `screenplayDraftConsequence` says it in words; `screenplayProvenance`
// writes the credit; `requiredSetDemand` names the locations;
// `renameScreenplayRefusal` says why a title is refused. This module gathers them
// for ONE screenplay at ONE moment and never decides anything. Where it does draw
// a conclusion — whether the ORIGINAL path is open — it says so out loud, in the
// one place below marked as such, and the engine still has the last word: every
// action here goes through `applyActions` and comes back refused or accepted.

import {
  GENRE_ORDER,
  TUNING,
  applyActions,
  beatsForGenre,
  blueprintForConcept,
  developmentOfficeRichnessTier,
  developmentOfficeTier,
  isOriginalScreenplay,
  renameScreenplayRefusal as coreRenameScreenplayRefusal,
  requiredSetDemand,
  screenplayDraftConsequence,
  screenplayProvenance,
  scriptDraftWeeks,
  setTypeLabel,
  writingPaceExperience,
} from '../../../src/core/index.ts'
import type {
  BlueprintBeat,
  CommissionOriginalScreenplayPayload,
  GameState,
  Genre,
  RequiredSetTypeView,
  ScreenplayProvenanceView,
  ScriptProjectsReadModel,
  Talent,
} from '../../../src/core/index.ts'
import type { ActionOutcome } from './adapter.ts'

export type {
  CommissionOriginalScreenplayPayload,
  RequiredSetTypeView,
  ScreenplayProvenanceView,
}

/** The two ways a studio comes by a screenplay. */
export type ScreenplayOrigin = 'original' | 'pool'

/**
 * The creative directions a studio may commission an original in — the engine's
 * own fixed genre order, so the form's list can never drift from the vocabulary
 * the beat templates and the action's own guard are written against.
 */
export const SCREENPLAY_GENRES: readonly Genre[] = GENRE_ORDER

// ── Provenance: who wrote it, and what it was first called ───────────────────

/**
 * WHERE A SCREENPLAY CAME FROM, as a surface prints it.
 *
 * `label` is the engine's own credit line — *"An Original Screenplay by Ava
 * Hartwell"* — and it is the sentence the §12-M3 legibility gate asks for. The
 * rest is the honest record beside it: what the studio's writers first called the
 * picture, and whether the player has since renamed it. A renamed picture keeps
 * BOTH facts, because the working title is history and history is not edited.
 */
export type ScreenplayProvenanceLine = {
  origin: ScreenplayOrigin
  label: string
  writerId: string | null
  writerName: string | null
  /** What the studio's own writers called it. Immutable; null for a market premise. */
  generatedTitle: string | null
  renamedWeek: number | null
  renamed: boolean
}

/** One beat of the story skeleton, with the location it asks for named in words. */
export type ScreenplayBeatView = {
  name: string
  setType: string
  /** "Back Alley" — never the engine id (`00F` professional tycoon floor). */
  setTypeLabel: string
}

/**
 * ONE SCREENPLAY, as every provenance-bearing surface reads it: the board card,
 * the review panel, the package, the Chronicle.
 *
 * `renameRefusal` is the engine's own sentence and it is the ONLY gate a rename
 * control consults — `null` means the title may be written. A market premise is
 * refused here by the engine's rule (V1 scope: generated screenplays only), so a
 * surface that offers the control unconditionally still cannot break the rule.
 */
export type ScreenplayIdentityView = {
  projectId: string | null
  conceptId: string
  title: string
  genre: Genre
  provenance: ScreenplayProvenanceLine
  renameRefusal: string | null
  beats: ScreenplayBeatView[]
  requiredSets: RequiredSetTypeView[]
}

function talentName(state: GameState, personId: string | null): string | null {
  if (personId === null) return null
  return state.talent.find((person) => person.id === personId)?.name ?? null
}

function beatViews(beats: readonly BlueprintBeat[]): ScreenplayBeatView[] {
  return beats.map((beat) => ({
    name: beat.name,
    setType: beat.requiredSetType,
    setTypeLabel: setTypeLabel(beat.requiredSetType),
  }))
}

/**
 * The identity of the screenplay behind one concept id.
 *
 * The BEATS fall back to the genre template when no blueprint exists — a legacy
 * save's in-flight picture, or a concept nobody has commissioned yet. That is the
 * same fallback the engine's own package read model takes
 * (`scriptReadModel.readyPackage`), for the same reason: the beats are a pure
 * function of genre, so the demand is knowable even when the blueprint root is
 * not there to carry it. Provenance is NOT guessed the same way — no blueprint
 * means no original, which is exactly true.
 */
export function screenplayIdentityForConcept(
  state: GameState,
  conceptId: string,
): ScreenplayIdentityView | null {
  const concept = state.concepts.find((candidate) => candidate.id === conceptId)
  if (concept === undefined) return null
  const blueprint = blueprintForConcept(state.originalScreenplays, conceptId)
  const writerName = talentName(state, blueprint?.writerId ?? null)
  const provenance = screenplayProvenance(blueprint, writerName ?? undefined)
  const beats = blueprint?.beats ?? beatsForGenre(concept.genre)
  const project = state.scriptDevelopment.projects.find(
    (candidate) => candidate.conceptId === conceptId,
  )
  return {
    projectId: project?.id ?? blueprint?.projectId ?? null,
    conceptId,
    title: concept.title,
    genre: concept.genre,
    provenance: {
      origin: provenance.origin,
      label: provenance.label,
      writerId: provenance.writerId,
      writerName: provenance.origin === 'original' ? writerName : null,
      generatedTitle: provenance.generatedTitle,
      renamedWeek: provenance.renamedWeek,
      renamed: provenance.renamedWeek !== null,
    },
    renameRefusal:
      coreRenameScreenplayRefusal(state.originalScreenplays, conceptId, concept.title)?.reason ??
      null,
    beats: beatViews(beats),
    requiredSets: requiredSetDemand(beats, state.sets),
  }
}

/** The same identity, reached the way a board card reaches it: by project id. */
export function screenplayIdentityForProject(
  state: GameState,
  projectId: string,
): ScreenplayIdentityView | null {
  const project = state.scriptDevelopment.projects.find(
    (candidate) => candidate.id === projectId,
  )
  if (project === undefined) return null
  return screenplayIdentityForConcept(state, project.conceptId)
}

/**
 * Just the credit, for a surface that already knows the picture — the Chronicle of
 * a released film, which holds a concept id and no project.
 */
export function screenplayProvenanceForConcept(
  state: GameState,
  conceptId: string,
): ScreenplayProvenanceLine | null {
  return screenplayIdentityForConcept(state, conceptId)?.provenance ?? null
}

/** Every managed screenplay's identity, keyed by project id, for a whole board. */
export function screenplayIdentitiesByProject(
  state: GameState,
): ReadonlyMap<string, ScreenplayIdentityView> {
  const rows = new Map<string, ScreenplayIdentityView>()
  for (const project of state.scriptDevelopment.projects) {
    const identity = screenplayIdentityForConcept(state, project.conceptId)
    if (identity !== null) rows.set(project.id, identity)
  }
  return rows
}

// ── Commissioning an original ────────────────────────────────────────────────

/**
 * WHAT COMMISSIONING AN ORIGINAL WOULD COST IN TIME, and why.
 *
 * `weeks` is `scriptDraftWeeks` — the engine's own answer for THIS studio's
 * office tier and THIS writer's genre experience. `consequence` is the engine's
 * own sentence. `pace` is the sentence the form owes the player under `00F`: it
 * says what shortens the clock, and it is true because it names the two levers the
 * ruled law actually has (`00E`.9 — experience and extra hands) and no others.
 */
export type OriginalDraftEstimateView = {
  weeks: number
  consequence: string
  pace: string
  /** How many weeks the office tier ADDS by making the script richer (0, 1 or 2). */
  richnessWeeks: number
  /** The fastest this screenplay could be written with a full room of five. */
  fastestWeeks: number
}

function writerById(state: GameState, writerId: string): Talent | undefined {
  return state.talent.find((person) => person.id === writerId)
}

/**
 * The clock a commission form states before the player commits.
 *
 * Every term is read back out of the engine rather than restated here: the weeks
 * from `scriptDraftWeeks`, the office rung from `developmentOfficeRichnessTier`,
 * the writer's pace from `writingPaceExperience`. The "fastest" figure is the
 * same function asked a second question — a full room of `SCRIPT_DRAFT_MAX_WRITERS`
 * — so the sentence about a second pen is a measurement, not a promise.
 */
export function originalDraftEstimate(
  state: GameState,
  input: { writerId: string; genre: Genre },
): OriginalDraftEstimateView {
  const officeTierAtMint = developmentOfficeTier(state)
  const writer = writerById(state, input.writerId)
  const writerExperience =
    writer === undefined ? 0 : writingPaceExperience([writer], input.genre)
  const weeks = scriptDraftWeeks({
    origin: 'original',
    officeTierAtMint,
    writerExperience,
    writerCount: 1,
  })
  const fastestWeeks = scriptDraftWeeks({
    origin: 'original',
    officeTierAtMint,
    writerExperience: 100,
    writerCount: TUNING.SCRIPT_DRAFT_MAX_WRITERS,
  })
  const richnessWeeks =
    TUNING.SCRIPT_DRAFT_RICHNESS_WEEKS_PER_OFFICE_TIER *
    developmentOfficeRichnessTier(officeTierAtMint)
  return {
    weeks,
    consequence: screenplayDraftConsequence(weeks),
    pace:
      weeks <= fastestWeeks
        ? 'This is as fast as an original is written here: the writer knows the genre and the room is full.'
        : 'A writer who knows the genre works faster, and a second pen on the script shortens it further.',
    richnessWeeks,
    fastestWeeks,
  }
}

/**
 * WHETHER THE ORIGINAL PATH IS OPEN — the one conclusion this module draws, and
 * it is drawn out loud because a silent inference is the thing the campaign laws
 * forbid.
 *
 * The engine publishes ONE `canStart` for commissioning, and it goes false when
 * the market runs out of unclaimed premises. That is correct for the market path
 * and WRONG for this one: commissioning an original needs no premise, because it
 * makes one. So the original path reads the same blocker list with the
 * market-exhaustion arm scoped out of it — and nothing else relaxed. Every other
 * blocker (unfounded studio, legacy mode, a full Development & Casting floor, no
 * available writer) still closes this path exactly as it closes the other.
 *
 * This is the inversion §3.5 exists for: C1's `no-concepts` blocker was TERMINAL,
 * with a remedy — "continue with an existing project" — that was not a remedy at
 * all. Its successor names an action that exists, and this predicate is what makes
 * the surface honour it instead of greying the button the remedy points at.
 */
export function originalCommissionOpen(board: ScriptProjectsReadModel): boolean {
  if (board.mode !== 'managed') return false
  if (board.commission.canStart) return true
  // A board that refuses commissioning WITHOUT SAYING WHY is not a board this
  // predicate may reason from: the engine's own `canStart` is exactly
  // "no blockers", so a refusal with an empty blocker list is malformed or
  // hostile. Absence of a stated reason falls CLOSED — it never becomes a
  // permission this surface invented.
  return board.commission.blockers.length > 0 &&
    board.commission.blockers.every((blocker) => blocker.kind === 'no-concepts')
}

/**
 * Whether ANY commission may begin — either path.
 *
 * The Lot's Development verb and the App's retained-workspace interception share
 * this one predicate so a player can never be handed a verb that opens the wrong
 * surface (the exact defect the retained workspace exists to close).
 */
export function screenplayCommissioningOpen(board: ScriptProjectsReadModel): boolean {
  return board.commission.canStart || originalCommissionOpen(board)
}

/** True when the market has nothing left and the studio's own writers are the way through. */
export function marketPremisesExhausted(board: ScriptProjectsReadModel): boolean {
  return board.commission.concepts.length === 0
}

// ── The three verbs ──────────────────────────────────────────────────────────

export function commissionOriginalScreenplayAction(
  state: GameState,
  screenplay: CommissionOriginalScreenplayPayload,
): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'commissionOriginalScreenplay', screenplay }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function renameScreenplayAction(
  state: GameState,
  conceptId: string,
  title: string,
): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'renameScreenplay', conceptId, title }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function assignScreenplayWriterAction(
  state: GameState,
  projectId: string,
  writerId: string,
): ActionOutcome {
  try {
    return {
      ok: true,
      next: applyActions(state, [{ kind: 'assignScreenplayWriter', projectId, writerId }]),
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** The engine's own refusal for a proposed title, or null when it may be written. */
export function renameRefusal(
  state: GameState,
  conceptId: string,
  title: string,
): string | null {
  return coreRenameScreenplayRefusal(state.originalScreenplays, conceptId, title)?.reason ?? null
}

export const SCREENPLAY_TITLE_MAX_LENGTH = TUNING.SCREENPLAY_TITLE_MAX_LENGTH

// ── The title moment ─────────────────────────────────────────────────────────

/** "Ava Hartwell delivers 'The Quiet Harbour'." — the sentence the fantasy lands as. */
export function deliveredScreenplaySentence(writerName: string, title: string): string {
  return `${writerName} delivers ‘${title}’.`
}

/** "Ava Hartwell is writing 'The Quiet Harbour'." — the same fact, mid-draft. */
export function writingScreenplaySentence(writerName: string, title: string): string {
  return `${writerName} is writing ‘${title}’.`
}

/**
 * THE TITLE THE STUDIO'S WRITERS JUST GAVE THE PICTURE — proved, not assumed.
 *
 * A witness in the shape the Lot's own commission receipt takes: it accepts the
 * successor only when EXACTLY ONE concept was appended, EXACTLY ONE blueprint was
 * appended, the two agree on identity, the blueprint carries a mint ordinal (so it
 * is genuinely an original and not a pool commission), and its immutable
 * `generatedTitle` is the title the appended concept carries. Anything else
 * returns null and the caller falls back to neutral copy — a surface that cannot
 * prove what was written never names a picture (laws 6 / 21).
 */
export function mintedScreenplayTitle(before: GameState, after: GameState): string | null {
  if (
    after.concepts.length !== before.concepts.length + 1 ||
    after.originalScreenplays.blueprints.length !==
      before.originalScreenplays.blueprints.length + 1
  ) return null
  const concept = after.concepts.at(-1)
  const blueprint = after.originalScreenplays.blueprints.at(-1)
  if (concept === undefined || blueprint === undefined) return null
  if (
    blueprint.conceptId !== concept.id ||
    !isOriginalScreenplay(blueprint) ||
    blueprint.generatedTitle !== concept.title ||
    typeof concept.title !== 'string' ||
    concept.title.length === 0
  ) return null
  return concept.title
}
