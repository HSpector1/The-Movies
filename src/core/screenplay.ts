// ── C2a-M3 — Renewable Screenplay Generation V1 (charter §3.5) ───────────────
//
// THE FANTASY THIS MODULE DELIVERS: *a writer goes to work and eventually hands
// me a new movie.* Everything here serves that sentence and nothing here is
// plumbing for a later one.
//
// THE CLIFF IT REMOVES. C1 seeded exactly thirty premises per world, claimed them
// permanently at commission, and answered exhaustion with a TERMINAL blocker
// whose stated remedy — "Continue with an existing project" — was not a remedy at
// all. That was a hard thirty-film lifetime ceiling against a campaign the Owner
// ratified from 1920 to beyond 2040, and it was recorded in no document until
// lane 14 found it. `docs/c2-planning/17-m3-records.md` records it now.
//
// ── THE FOUR LAWS THIS MODULE IS BUILT AROUND ───────────────────────────────
//
// 1. MINT AT COMMISSION-COMMIT. The concept and its blueprint come into
//    existence at the instant the Development & Casting slot is actually
//    granted — not when the player opens a form, and not when the draft lands.
//    `ScriptProject.conceptId` is a required non-null string in the FROZEN V9
//    save shape, so a screenplay cannot be in development without an identity;
//    and because no abandon verb exists, a concept minted at commit can never be
//    orphaned. Identity is permanent, never recycled, never reformatted.
//
// 2. THE APPENDED CONCEPT CARRIES ONLY WORLD-SHAPED FACTS. `FilmConcept` is a
//    frozen leaf with an empty optional-key list at the save boundary; it is
//    never widened (guardrail `00B`.4). Every studio-relative fact — who wrote
//    it, which project commissioned it, what week, what it was originally
//    called, what its beats are — lives in the `MovieBlueprint` row instead.
//    That is the whole reason the blueprint root exists.
//
// 3. NO NEW STRENGTH LEVER (charter §3.5, r3.1). A minted concept draws its
//    `baselineStrength` from the SAME distribution the world's own premises came
//    from, and derives its `baseNegativeCost` from that strength rather than
//    drawing it independently. The office's shipped EST uplift remains the ONLY
//    quality lever in the game, so RSG introduces zero new economy levers.
//
// 4. NEVER RE-RUN `correlateConceptCost`. It is a whole-pool rank permutation of
//    every concept's `baseNegativeCost`, run exactly once at founding. Running it
//    again after an append would re-price films already greenlit against a locked
//    forecast. The prohibition is contractual, and `tests/c2a-m3-*` proves it.

import { clamp, smoothstep } from './math.js'
import { stream } from './rng.js'
import { setTypeLabel } from './sets.js'
import { BEAT_TEMPLATES, BEATS_PER_BLUEPRINT, TITLE_LEAD_BY_GENRE } from './data/screenplay.js'
import { TITLE_NOUN } from './data/wordlists.js'
import { CONCEPT_DISTRIBUTIONS, SET_TYPES, SLOT_ORDER, TUNING } from './tuning.js'
import type {
  BlueprintBeat,
  CastSlot,
  FilmConcept,
  Genre,
  MovieBlueprint,
  OriginalScreenplays,
  Persona,
  RoleRequirement,
  ScriptProject,
  SetTypeId,
  StudioSet,
  Talent,
} from './types.js'

/** The empty root a legacy or freshly-generated world carries. */
export function emptyOriginalScreenplays(): OriginalScreenplays {
  return { nextOrdinal: 0, blueprints: [] }
}

// ── Identity (charter §3.5, lane 14 §8.3) ────────────────────────────────────

/** The namespace every generated screenplay id lives in. Permanent; never reformatted. */
export const ORIGINAL_CONCEPT_ID_PREFIX = 'concept-orig-'

/**
 * `concept-orig-0000`, `concept-orig-0001`, …
 *
 * FOUR-WIDE AND ZERO-PADDED so ids sort lexicographically in mint order, which
 * is what lets the three shipped `compareId` helpers keep working untouched:
 * under ASCII `'c-29' < 'concept-orig-0000'`, so the world's thirty founding
 * premises sort first and generated screenplays follow in the order they were
 * written. No tie-breaking, no comparator changes, no re-sorting.
 */
export function originalConceptId(ordinal: number): string {
  if (!Number.isInteger(ordinal) || ordinal < 0) {
    throw new Error(
      `screenplay: mint ordinal must be a non-negative integer, got ${String(ordinal)}`,
    )
  }
  return `${ORIGINAL_CONCEPT_ID_PREFIX}${String(ordinal).padStart(4, '0')}`
}

/** True for an id this module minted. Pool ids (`c-NN`) are never generated. */
export function isOriginalConceptId(conceptId: string): boolean {
  return conceptId.startsWith(ORIGINAL_CONCEPT_ID_PREFIX)
}

// ── The latents (charter §3.5: the SAME distribution, and no new lever) ──────

function screenplayStream(seed: string, conceptId: string, field: string) {
  return stream(seed, 'screenplay-v1', `${conceptId}:${field}`)
}

/**
 * THE COST↔POTENTIAL RULE, IN CLOSED FORM — and the one place a reader should
 * look before changing anything about a minted concept's price.
 *
 * At founding, `correlateConceptCost` rank-blends the whole pool so a stronger
 * premise TENDS to cost more (D-12's capital frontier). It is a whole-pool
 * permutation and it may never run again (law 4 above), so a minted concept has
 * to arrive with the correlation already correct — which means the price is
 * DERIVED FROM THE STRENGTH and is never an independent draw.
 *
 * The derivation is the population limit of the pool's own rule: map the
 * concept's position in the strength distribution, in standard deviations, onto
 * the same position in the cost distribution. A premise one sigma above the mean
 * in potential is one sigma above the mean in price. Because both marginals are
 * normal, this is exactly the rank correspondence `correlateConceptCost`
 * approximates — taken to w = 1 rather than 0.4.
 *
 * TWO HONEST CONSEQUENCES, recorded rather than discovered (see
 * `docs/c2-planning/17-m3-records.md`):
 *   * an original screenplay's price tracks its potential PERFECTLY, where a pool
 *     concept's only tends to. That is the unavoidable shape of "derived, never
 *     drawn": there is no second draw left to carry the noise;
 *   * the bottom of the strength range maps below the cost floor, so the weakest
 *     originals all price at exactly `baseNegativeCost.min`. The floor is the
 *     world's own floor, and a picture cannot be negatived for less than it.
 */
export function mintedNegativeCost(baselineStrength: number): number {
  const strengthD = CONCEPT_DISTRIBUTIONS.baselineStrength
  const costD = CONCEPT_DISTRIBUTIONS.baseNegativeCost
  const sigmas = (baselineStrength - strengthD.mean) / strengthD.sd
  return Math.round(clamp(costD.mean + sigmas * costD.sd, costD.min, costD.max))
}

/**
 * The working title, drawn from the shipped 48 leads × 60 nouns through a
 * GENRE-KEYED LEAD SUBSET — genre flavor with not one new authored word.
 *
 * Two draws in declared order, mirroring `generateConcepts` exactly, from a
 * derived stream that never touches the sim's own.
 */
export function generateScreenplayTitle(seed: string, conceptId: string, genre: Genre): string {
  const leads = TITLE_LEAD_BY_GENRE[genre]
  const s = screenplayStream(seed, conceptId, 'title')
  const lead = leads[Math.floor(s.next() * leads.length)]!
  const noun = TITLE_NOUN[Math.floor(s.next() * TITLE_NOUN.length)]!
  return `${lead} ${noun}`
}

/**
 * The minted `FilmConcept` — EIGHT FIELDS, the same eight a worldgen premise
 * carries, and not one more (law 2). Genre is the player's creative direction,
 * never a draw.
 */
export function mintOriginalConcept(seed: string, conceptId: string, genre: Genre): FilmConcept {
  const strengthD = CONCEPT_DISTRIBUTIONS.baselineStrength
  const originalityD = CONCEPT_DISTRIBUTIONS.originalityRaw
  const axisD = CONCEPT_DISTRIBUTIONS.roleTargetAxis
  const toleranceD = CONCEPT_DISTRIBUTIONS.roleTolerance

  const baselineStrength = screenplayStream(seed, conceptId, 'strength').truncatedNormal(
    strengthD.mean,
    strengthD.sd,
    strengthD.min,
    strengthD.max,
  )
  const originalityRaw = screenplayStream(seed, conceptId, 'originality').truncatedNormal(
    originalityD.mean,
    originalityD.sd,
    originalityD.min,
    originalityD.max,
  )
  const rolesS = screenplayStream(seed, conceptId, 'roles')
  const roleRequirements = {} as Record<CastSlot, RoleRequirement>
  for (const slot of SLOT_ORDER) {
    const target: Persona = {
      warmth: rolesS.uniform(axisD.min, axisD.max),
      gravity: rolesS.uniform(axisD.min, axisD.max),
      physicality: rolesS.uniform(axisD.min, axisD.max),
    }
    roleRequirements[slot] = {
      target,
      tolerance: rolesS.uniform(toleranceD.min, toleranceD.max),
    }
  }

  return {
    id: conceptId,
    title: generateScreenplayTitle(seed, conceptId, genre),
    genre,
    baselineStrength,
    originalityRaw,
    baseNegativeCost: mintedNegativeCost(baselineStrength),
    requiredSlots: [...SLOT_ORDER],
    roleRequirements,
  }
}

// ── Beats (charter §3.5: genre supplies the skeleton) ────────────────────────

/**
 * The seven beats a screenplay of this genre is built on — fresh objects, so a
 * persisted blueprint can never alias the authored template.
 */
export function beatsForGenre(genre: Genre): BlueprintBeat[] {
  return BEAT_TEMPLATES[genre].beats.map((beat) => ({
    name: beat.name,
    requiredSetType: beat.requiredSetType,
  }))
}

/**
 * THE SET DEMAND — the distinct locations a screenplay asks for, in first-beat
 * order. A DERIVED read model and nothing else: it is never written onto the
 * `FilmConcept` (guardrail 8) and never persisted anywhere, because the beats
 * already say it and a second copy could disagree with them.
 */
export function requiredSetTypes(beats: readonly BlueprintBeat[]): SetTypeId[] {
  const seen = new Set<SetTypeId>()
  const ordered: SetTypeId[] = []
  for (const beat of beats) {
    if (seen.has(beat.requiredSetType)) continue
    seen.add(beat.requiredSetType)
    ordered.push(beat.requiredSetType)
  }
  return ordered
}

/** One line of the set demand, in the words a player reads. */
export type RequiredSetTypeView = {
  setType: SetTypeId
  /** "Back Alley" — never the engine id (`00F` professional tycoon floor). */
  label: string
  /** The beats that call for it, by name. */
  beats: string[]
  /** True when the studio already has one standing and usable. */
  standing: boolean
}

/**
 * What the package surface publishes: every location the screenplay calls for,
 * and whether the studio owns one. The engine equivalent of the original's own
 * info bubble, which "lists which sets the script requires" [CORPUS Bible §7.1,
 * OFFICIAL manual p.13].
 *
 * ADVISORY IN V1, exactly as the M2 binding is: one bound set per production
 * stands, so an unowned location costs fit and variety rather than refusing the
 * shoot. Making it a hard block is a reservation change, and reservations are
 * M4's.
 */
export function requiredSetDemand(
  beats: readonly BlueprintBeat[],
  sets: readonly StudioSet[],
): RequiredSetTypeView[] {
  const standingTypes = new Set<SetTypeId>(
    sets.filter((set) => set.status === 'standing').map((set) => set.setType),
  )
  return requiredSetTypes(beats).map((setType) => ({
    setType,
    label: setTypeLabel(setType),
    beats: beats.filter((beat) => beat.requiredSetType === setType).map((beat) => beat.name),
    standing: standingTypes.has(setType),
  }))
}

// ── The blueprint row ────────────────────────────────────────────────────────

/**
 * The blueprint a commission mints. ONE PRODUCTION PATH (charter §3.5, lane 14
 * §8.10 option b): a POOL concept gets one too, on its first commission, with a
 * null ordinal and a null `generatedTitle` — because the title it already has was
 * authored by the world, not generated by this studio's writers. Every managed
 * picture therefore has beats, and there is exactly one kind of production.
 */
export function movieBlueprint(input: {
  conceptId: string
  ordinal: number | null
  mintedWeek: number
  projectId: string
  writerId: string
  generatedTitle: string | null
  genre: Genre
  officeTierAtMint: string
}): MovieBlueprint {
  return {
    conceptId: input.conceptId,
    ordinal: input.ordinal,
    mintedWeek: input.mintedWeek,
    projectId: input.projectId,
    writerId: input.writerId,
    generatedTitle: input.generatedTitle,
    renamedWeek: null,
    beats: beatsForGenre(input.genre),
    officeTierAtMint: input.officeTierAtMint,
  }
}

export function blueprintForConcept(
  screenplays: OriginalScreenplays,
  conceptId: string,
): MovieBlueprint | undefined {
  return screenplays.blueprints.find((blueprint) => blueprint.conceptId === conceptId)
}

/** True when this screenplay was written by the studio rather than acquired. */
export function isOriginalScreenplay(blueprint: MovieBlueprint): boolean {
  return blueprint.ordinal !== null
}

// ── Provenance — the fantasy has to be VISIBLE, not plumbing (charter §3.5) ──

export type ScreenplayProvenanceView = {
  origin: 'original' | 'pool'
  /** The line a board or a package card prints. Filmmaking words, always true. */
  label: string
  /** The writer credited with the original; null for an acquired premise. */
  writerId: string | null
  /** What the studio's own writers called it. Immutable; null for a pool premise. */
  generatedTitle: string | null
  /** The week the player renamed it, or null if it still carries its working title. */
  renamedWeek: number | null
}

export const ACQUIRED_SCREENPLAY_LABEL = 'Acquired from the open script market'

/** "An Original Screenplay by Ava Hartwell" — the sentence the fantasy lands as. */
export function originalScreenplayCredit(writerName: string): string {
  return `An Original Screenplay by ${writerName}`
}

export function screenplayProvenance(
  blueprint: MovieBlueprint | undefined,
  writerName: string | undefined,
): ScreenplayProvenanceView {
  if (blueprint === undefined || !isOriginalScreenplay(blueprint)) {
    return {
      origin: 'pool',
      label: ACQUIRED_SCREENPLAY_LABEL,
      writerId: null,
      generatedTitle: null,
      renamedWeek: blueprint?.renamedWeek ?? null,
    }
  }
  return {
    origin: 'original',
    label: originalScreenplayCredit(writerName ?? 'a studio writer'),
    writerId: blueprint.writerId,
    generatedTitle: blueprint.generatedTitle,
    renamedWeek: blueprint.renamedWeek,
  }
}

// ── THE WRITER-SPEED LAW (owner ruling `00E`.9) ──────────────────────────────

/**
 * How many weeks this screenplay takes to draft.
 *
 * THE RULING, restated because it REVERSES what C1 shipped: *writer experience
 * affects WRITING SPEED, not script quality; the Script Office tier owns the
 * achievable quality ceiling; additional writers may accelerate completion via
 * the bounded pooling system.* [CORPUS Prima, developer-reviewed; `00E`.9.] C1
 * shipped the exact inverse — a constant one-week clock and 40% of a script's
 * quality coming from its writer — and M3 turns it the right way round.
 *
 * THE BLAST RADIUS IS BOUNDED BY DESIGN. A pool concept's draft is one week
 * unconditionally, so every C1 path keeps the clock it was measured with and the
 * variable clock applies only to the thing M3 invented.
 *
 * EVERY TERM IS BOUNDED, and `tests/c2a-m3-writer-speed.test.ts` asserts each
 * range: base + richness ∈ [3, 5]; experience saves at most 2; pooling saves at
 * most 2; the result is clamped into [1, 6].
 */
export function scriptDraftWeeks(input: {
  origin: 'original' | 'pool'
  /** The office tier standing at mint — the richness lever, never a strength one. */
  officeTierAtMint: string
  /** 0..100 perceived genre experience of the most experienced writer on it. */
  writerExperience: number
  /** How many writers are on the script. 1..SCRIPT_DRAFT_MAX_WRITERS. */
  writerCount: number
}): number {
  if (input.origin === 'pool') return TUNING.SCRIPT_DRAFT_WEEKS_POOL
  const richness =
    TUNING.SCRIPT_DRAFT_RICHNESS_WEEKS_PER_OFFICE_TIER *
    developmentOfficeRichnessTier(input.officeTierAtMint)
  const experience =
    TUNING.SCRIPT_DRAFT_EXPERIENCE_WEEKS_MAX *
    smoothstep(0, 100, clamp(input.writerExperience, 0, 100))
  const extraWriters = clamp(input.writerCount, 1, TUNING.SCRIPT_DRAFT_MAX_WRITERS) - 1
  const pooling = TUNING.SCRIPT_DRAFT_WEEKS_PER_EXTRA_WRITER * extraWriters
  return clamp(
    Math.round(TUNING.SCRIPT_DRAFT_WEEKS_BASE + richness - experience - pooling),
    TUNING.SCRIPT_DRAFT_WEEKS_MIN,
    TUNING.SCRIPT_DRAFT_WEEKS_MAX,
  )
}

/**
 * How many tiers above the studio's baseline development office this one is.
 * 0 for the founding annex, 1 for Development Office II, 2 for III — the same
 * ladder `developmentOfficeEstUplift` reads, expressed in rungs instead of EST
 * points, because richness and quality are different consequences of one tier.
 */
export function developmentOfficeRichnessTier(officeTierAtMint: string): number {
  if (officeTierAtMint === 'development-office-3') return 2
  if (officeTierAtMint === 'development-office-2') return 1
  return 0
}

/**
 * The most experienced hand on the script sets its pace.
 *
 * PERCEIVED, not actual, and that is a deliberate choice: a schedule is what the
 * studio COMMITS TO on the strength of what it knows about its writers, and a
 * duration computed from hidden truth would leak that truth through the due
 * date. What the player is told is what happens.
 */
export function writingPaceExperience(
  writers: readonly Talent[],
  genre: Genre,
): number {
  let best = 0
  for (const writer of writers) {
    const entry = writer.genreExperience.writing[genre]
    if (entry !== undefined && entry.perceived > best) best = entry.perceived
  }
  return best
}

/** "Three weeks pass while the writer and one Development & Casting slot are occupied; …" */
const WEEK_WORDS: readonly string[] = ['zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six']

export function screenplayDraftConsequence(weeks: number): string {
  const count = WEEK_WORDS[weeks] ?? String(weeks)
  const clause =
    weeks === 1
      ? `${count} week passes`
      : `${count} weeks pass`
  return `${clause} while the writer and one Development & Casting slot are occupied; payroll and studio overhead continue.`
}

// ── Rename (charter §3.5) ────────────────────────────────────────────────────
//
// THE TWO FROZEN-HISTORY SURFACES, STATED IN THE CONTRACT SO NOBODY FILES THEM AS
// A BUG. `FilmConcept.title` is the single stored display authority and
// twenty-one live surfaces resolve it, so a rename reaches all of them by writing
// one field. EXACTLY TWO records copy the title forward and therefore keep the
// old one FOREVER, BY DESIGN:
//
//   * `TalentCareerEvent.filmTitle` — a career record names the film as it was
//     called when the person made it;
//   * `BroadcastItem.template` — a press clipping is a clipping; a newspaper
//     printed in 1931 does not change its headline in 1934.
//
// That is what a real career record and a real press archive do, and
// `tests/c2a-m3-rename.test.ts` asserts BOTH stay frozen rather than treating the
// behaviour as an accident nobody checked.

export type ScreenplayRenameRefusal = { reason: string }

/**
 * Whether this title may be written, and why not if it may not. Returns null when
 * the rename is legal, so callers read as `refusal === null`.
 */
export function renameScreenplayRefusal(
  screenplays: OriginalScreenplays,
  conceptId: string,
  title: string,
): ScreenplayRenameRefusal | null {
  const blueprint = blueprintForConcept(screenplays, conceptId)
  if (blueprint === undefined || !isOriginalScreenplay(blueprint)) {
    return {
      reason:
        'Only a screenplay this studio wrote can be retitled. Premises acquired from the market keep the name they came with.',
    }
  }
  const trimmed = title.trim()
  if (trimmed.length === 0) {
    return { reason: 'A screenplay needs a title.' }
  }
  if (trimmed.length > TUNING.SCREENPLAY_TITLE_MAX_LENGTH) {
    return {
      reason: `A title runs to at most ${String(TUNING.SCREENPLAY_TITLE_MAX_LENGTH)} characters.`,
    }
  }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) {
    return { reason: 'A title cannot contain control characters.' }
  }
  return null
}

/** The canonical stored form of a player-chosen title. */
export function normalizeScreenplayTitle(title: string): string {
  return title.trim()
}

// ── Invariants (lane 14 §8.9) ────────────────────────────────────────────────

function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`movie blueprint invariant: ${message}`)
  }
}

export type MovieBlueprintInvariantContext = {
  currentWeek: number
  concepts: readonly FilmConcept[]
  projects: readonly ScriptProject[]
}

/**
 * Everything a blueprint row must be true about, in one place — the same
 * fail-loud posture the script and set invariants take. Called at the action
 * boundary and at the save boundary, so a forged file and a buggy action meet the
 * same wall.
 */
export function assertMovieBlueprintInvariants(
  screenplays: OriginalScreenplays,
  context: MovieBlueprintInvariantContext,
): void {
  invariant(
    Number.isInteger(screenplays.nextOrdinal) && screenplays.nextOrdinal >= 0,
    'nextOrdinal must be a non-negative integer',
  )
  const conceptById = new Map(context.concepts.map((concept) => [concept.id, concept]))
  const projectById = new Map(context.projects.map((project) => [project.id, project]))
  const seenConceptIds = new Set<string>()
  const seenOrdinals = new Set<number>()
  const setTypes = new Set<string>(SET_TYPES)

  for (const blueprint of screenplays.blueprints) {
    const label = `blueprint "${blueprint.conceptId}"`
    invariant(!seenConceptIds.has(blueprint.conceptId), `${label} is duplicated`)
    seenConceptIds.add(blueprint.conceptId)

    const concept = conceptById.get(blueprint.conceptId)
    invariant(concept !== undefined, `${label} references a concept that does not exist`)

    if (blueprint.ordinal === null) {
      // A pool concept's blueprint: derived on first commission, never minted.
      invariant(
        !isOriginalConceptId(blueprint.conceptId),
        `${label} has a generated id but no mint ordinal`,
      )
      invariant(
        blueprint.generatedTitle === null,
        `${label} is a pool premise and cannot carry a generated title`,
      )
      invariant(
        blueprint.renamedWeek === null,
        `${label} is a pool premise and cannot have been renamed`,
      )
    } else {
      invariant(
        Number.isInteger(blueprint.ordinal) && blueprint.ordinal >= 0,
        `${label} has a non-integer ordinal`,
      )
      invariant(
        blueprint.ordinal < screenplays.nextOrdinal,
        `${label} carries an ordinal that was never minted`,
      )
      invariant(!seenOrdinals.has(blueprint.ordinal), `${label} reuses mint ordinal ${String(blueprint.ordinal)}`)
      seenOrdinals.add(blueprint.ordinal)
      invariant(
        blueprint.conceptId === originalConceptId(blueprint.ordinal),
        `${label} does not match the id its ordinal mints`,
      )
      invariant(
        blueprint.generatedTitle !== null,
        `${label} was generated and must record its working title`,
      )
      // THE RENAME LAW: an untouched screenplay still carries exactly what the
      // studio's writers called it.
      if (blueprint.renamedWeek === null) {
        invariant(
          concept.title === blueprint.generatedTitle,
          `${label} was never renamed but no longer carries its generated title`,
        )
      } else {
        invariant(
          Number.isInteger(blueprint.renamedWeek) &&
            blueprint.renamedWeek >= 0 &&
            blueprint.renamedWeek <= context.currentWeek,
          `${label} has an invalid or future rename week`,
        )
      }
    }

    invariant(
      Number.isInteger(blueprint.mintedWeek) &&
        blueprint.mintedWeek >= 0 &&
        blueprint.mintedWeek <= context.currentWeek,
      `${label} has an invalid or future mint week`,
    )

    const project = projectById.get(blueprint.projectId)
    invariant(project !== undefined, `${label} references an unknown script project`)
    invariant(
      project.conceptId === blueprint.conceptId,
      `${label} names a project that commissioned a different concept`,
    )
    invariant(
      project.writerIds.includes(blueprint.writerId),
      `${label} credits a writer who never worked on its project`,
    )

    invariant(
      blueprint.beats.length === BEATS_PER_BLUEPRINT,
      `${label} must carry exactly ${String(BEATS_PER_BLUEPRINT)} beats`,
    )
    const template = BEAT_TEMPLATES[concept.genre].beats
    for (let i = 0; i < blueprint.beats.length; i++) {
      const beat = blueprint.beats[i]!
      invariant(
        beat.name === template[i]?.name,
        `${label} beat ${String(i)} is not its genre's beat`,
      )
      invariant(
        setTypes.has(beat.requiredSetType),
        `${label} beat "${beat.name}" asks for a location outside the authored vocabulary`,
      )
    }
  }

  // Ordinals are dense from zero: every id the counter promised was minted.
  invariant(
    seenOrdinals.size === screenplays.nextOrdinal,
    `nextOrdinal is ${String(screenplays.nextOrdinal)} but ${String(seenOrdinals.size)} generated screenplays exist`,
  )
}

/**
 * EVERY PLACE A CONCEPT IDENTITY IS PERSISTED — the concept analogue of
 * `persistedProductionIds`, and the reservation a mint checks against so an id is
 * never re-minted (guardrail `00B`.2's concept form; G17).
 *
 * Re-exported from `productionIdentity.ts`, which owns identity reservation for
 * this engine, so there is one address for "what ids are taken".
 */
export { persistedConceptIds } from './productionIdentity.js'
