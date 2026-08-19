// ── Studio Week Theater V1 — the manufacturing loop, as beat tracks ─────────
//
// `studioWeekTheater(state)` is a PURE, SAVE-NEUTRAL projection built to the
// letter of the discipline `presence.ts` established, whose header law is quoted
// here because it governs this file too:
//
//   *"`studioPresence(state)` is a PURE, SAVE-NEUTRAL projection. It reads
//   existing authoritative truth … and decomposes the CURRENT week into
//   BEATS_PER_WEEK integer beats per named person. It: changes zero outcomes and
//   persists nothing, alters no tick step and is called by none, consumes ZERO
//   simulation RNG …, never throws on malformed input: an ambiguity WITHHOLDS the
//   affected person (or the whole projection, when the ambiguity is global) with a
//   stated reason. Withholding is recorded, never silent (operational laws
//   17 / 21)."*
//
// Presence answers "WHO is where, doing what, this week". This answers the other
// half of §4.2's simulation theater: **WHAT IS THE PLANT DOING** — scenery in
// transit, stages hot and dark, sets going up and coming down, a wrap clearing a
// stage, companies standing at the queue, and a building rising on the property.
// Together they are the lot: people, and the work the people are inside of.
//
// AUTHORITY. Every subject below derives from truth the week ACTUALLY HOLDS — a
// reservation the engine granted, a set's own status, a Tier-D row the engine
// appended, a placement's own clock, a blocker the engine wrote. Nothing here is
// invented to fill a gap: where truth could not support a subject, the subject is
// WITHHELD with its reason rather than guessed at (`00C`.6 — everything belongs to
// a system; a thing on screen answers "why is that there?"). This is PRESENTATION
// CANON, exactly as presence's attendance canon is: no beat here feeds a decision,
// a cost, a duration, or a tick.
//
// CONSUMES ZERO RNG — not even a derived stream. Presence needs a cosmetic
// departure stagger; a stage being hot is a fact, and facts do not need staggering.
//
// CLASS A (charter §4.2). Every subject is true of the SETTLED week, so the same
// week reads identically on load, after a batch, and mid-playback. The witnessed-
// time half (Class B) is the renderer's, and it plays these tracks; it does not
// author them.
//
// KNOWN TRUTH GAPS (recorded, not filled):
//  1. STRIKE HAS NO DURATION. `SET_STRIKE_WEEKS` is a named zero and §4.3 excludes
//     strike duration by name, so a struck set is a ONE-WEEK subject read off the
//     Tier-D `setRetired` row rather than a countdown. The flats come down inside
//     the week; the track says so and claims nothing more.
//  2. A DARK STAGE IS A REAL SUBJECT, and it is the only subject asserted from an
//     ABSENCE. It is safe because the absence is total: a soundstage with no
//     reservation from any owner and no set under work on it is idle, and saying
//     so is the honest reading of a fully-enumerated union.
//  3. A QUEUED INTENT NAMES NO PICTURE. `ProductionQueueEntry` carries no
//     production id — by construction, because a production does not exist until
//     greenlight (§5 pin 3) — so a queue subject names the ORDINAL and the kind of
//     work waiting, never a title.

import { BEATS_PER_WEEK, PRESENCE_LAST_WORK_BEAT } from './presence.js'
import { isSceneryLoadIn, sceneryLoadInFor } from './sceneryLoadIn.js'
import type { GameState, ProductionPhase } from './types.js'

export { BEATS_PER_WEEK }

/**
 * What one subject is doing on one beat. Closed on purpose: a pinned track is only
 * checkable if the vocabulary cannot quietly grow.
 *
 * - `idle`     — nothing is happening here on this beat.
 * - `travel`   — something is on the road between two places on the property.
 * - `working`  — the work this subject exists for is being done.
 * - `waiting`  — the subject is held up by something the engine named.
 * - `clearing` — a place is being handed back: a company leaving, flats coming down.
 */
export type TheaterBeat = 'idle' | 'travel' | 'working' | 'waiting' | 'clearing'

/**
 * The manufacturing loop's subjects. Each one is a §4.2-named piece of theater and
 * each one has exactly one authority behind it.
 */
export type TheaterSubjectKind =
  /** Scenery on the road from a set-scenery body to a bound stage (§4.2 load-in). */
  | 'scenery-in-transit'
  /** A stage with a company on it: rehearsal or shooting. */
  | 'stage-hot'
  /** A stage nobody is using and nothing is being built on. */
  | 'stage-dark'
  /** A set going up (or being repaired) on a stage. */
  | 'set-mounting'
  /** A set that came down this week. */
  | 'set-struck'
  /** Principal photography wrapped this week: the company is clearing the stage. */
  | 'wrap-clearing'
  /** A company that finished its phase and is waiting for the next resource. */
  | 'company-waiting'
  /** An admitted intent waiting at a front door, holding nothing. */
  | 'queue-waiting'
  /** A committed build rising on the property. */
  | 'construction-progressing'

export type TheaterSubject = {
  kind: TheaterSubjectKind
  /** Stable and deterministic: `${kind}:${what it is about}`. Unique in a week. */
  id: string
  /** The facility this happens at, or null when the subject is not at one. */
  facilityId: string | null
  /** The engine's OWN name for that facility (§3.1), or null. Never invented. */
  facilityName: string | null
  /** The picture this is about, when the engine names one. */
  productionId: string | null
  /** The phase that picture is in, when there is one. */
  phase: ProductionPhase | null
  /** The set this is about, when there is one. */
  setId: string | null
  /**
   * Whole weeks of this work still ahead, when the engine knows the number.
   * `null` is "the engine does not know", never zero-dressed-as-unknown.
   */
  weeksRemaining: number | null
  /** Grid cells the scenery is travelling, for a transit subject only. */
  distance: number | null
  /** Why this subject is waiting, in the engine's own terms. Never a guess. */
  reason: string | null
  /** Exactly `BEATS_PER_WEEK` entries. */
  beats: TheaterBeat[]
}

/** A subject (or the whole week) omitted because truth was ambiguous or malformed. */
export type TheaterWithholding = { subjectId: string | null; reason: string }

export type StudioWeekTheater = {
  /** The projected week (`market.tick`), or null when the week is unknowable. */
  week: number | null
  /** Ascending by `id`. Each id appears at most once. */
  subjects: TheaterSubject[]
  /** Ascending by `subjectId`, global entries first. */
  withheld: TheaterWithholding[]
}

// ── beat timeline canon (presentation canon — see AUTHORITY above) ───────────
//
// The engine's own ten-beat week, read the way `presence.ts` reads it: beat 0 is
// the lot waking, beats 1…PRESENCE_LAST_WORK_BEAT are the working day, beat 9 is
// the lot emptying. A subject's track says what is true of it on each beat, and
// nothing else — no easing, no position, no duration in seconds. Those are the
// renderer's, and the renderer may play the same track at any speed (§4.1's
// 1×/2×/4× ladder) without the track changing, which is exactly why the track is
// beats and not milliseconds.

function track(fill: (beat: number) => TheaterBeat): TheaterBeat[] {
  const beats: TheaterBeat[] = []
  for (let beat = 0; beat < BEATS_PER_WEEK; beat++) beats.push(fill(beat))
  return beats
}

/** The lot's ordinary working day: quiet, work, quiet. */
function workingDay(): TheaterBeat[] {
  return track((beat) => (beat === 0 || beat > PRESENCE_LAST_WORK_BEAT ? 'idle' : 'working'))
}

/** Nothing, all week. */
function darkWeek(): TheaterBeat[] {
  return track(() => 'idle')
}

/** Held up, all week — waiting is not punctuated by a lunch break. */
function waitingWeek(): TheaterBeat[] {
  return track(() => 'waiting')
}

/** On the road all week: the trip does not finish inside this one. */
function travellingWeek(): TheaterBeat[] {
  return track(() => 'travel')
}

/** The trip ends this week: on the road, then loading in, then quiet. */
const ARRIVAL_BEAT = 4
function arrivalWeek(): TheaterBeat[] {
  return track((beat) =>
    beat < ARRIVAL_BEAT ? 'travel' : beat > PRESENCE_LAST_WORK_BEAT ? 'idle' : 'working',
  )
}

/** The work finishes and the place is handed back. */
const CLEARING_BEAT = 5
function clearingWeek(): TheaterBeat[] {
  return track((beat) =>
    beat === 0 ? 'idle' : beat < CLEARING_BEAT ? 'working' : beat > PRESENCE_LAST_WORK_BEAT ? 'idle' : 'clearing',
  )
}

/** Flats come down inside the week; strike has no duration (gap 1). */
function struckWeek(): TheaterBeat[] {
  return track((beat) => (beat === 0 || beat >= CLEARING_BEAT ? 'idle' : 'clearing'))
}

// ── defensive reads (law 17: present-but-malformed ≠ absent) ─────────────────

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

type Draft = Omit<TheaterSubject, 'facilityName'> & { facilityName?: string | null }

/**
 * The one canonical reading of what the plant is doing this week. Pure,
 * save-neutral, RNG-neutral; never throws.
 */
export function studioWeekTheater(state: GameState): StudioWeekTheater {
  const globalWithholdings: string[] = []
  const raw = state as unknown
  if (!isObject(raw)) {
    return { week: null, subjects: [], withheld: [{ subjectId: null, reason: 'state is not an object' }] }
  }
  const market = raw['market']
  const week = isObject(market) && isNonNegativeInteger(market['tick']) ? (market['tick'] as number) : null
  if (week === null) globalWithholdings.push('market.tick is not a non-negative integer week')
  const operations = raw['operations']
  if (
    !isObject(operations) ||
    !Array.isArray(operations['facilities']) ||
    !Array.isArray(operations['workflows'])
  ) {
    globalWithholdings.push('state.operations is not a well-formed operations root')
  }
  if (week === null || globalWithholdings.length > 0) {
    const reasons =
      globalWithholdings.length > 0
        ? globalWithholdings
        : ['market.tick is not a non-negative integer week']
    return {
      week: null,
      subjects: [],
      withheld: reasons.map((reason) => ({ subjectId: null, reason })),
    }
  }

  const currentWeek: number = week
  const withheld: TheaterWithholding[] = []
  const withhold = (subjectId: string | null, reason: string): void => {
    withheld.push({ subjectId, reason })
  }

  // A LEGACY STUDIO HAS NO PLANT TO WATCH, and that is a fact rather than a
  // failure: `operations.mode !== 'managed'` means there are no workflows, no
  // reservations and no ledger, so there is nothing to be theater ABOUT. The
  // projection is empty and says why. This is also what keeps the M0A acceptance
  // corpus untouched by this file's existence.
  if (state.operations.mode !== 'managed') {
    return {
      week: currentWeek,
      subjects: [],
      withheld: [{ subjectId: null, reason: 'studio operations are not managed' }],
    }
  }

  const facilityById = new Map<string, { id: string; name: string; capability: string }>()
  for (const facility of state.operations.facilities) {
    if (!isObject(facility) || !isNonEmptyString(facility.id) || !isNonEmptyString(facility.name)) {
      continue
    }
    if (facilityById.has(facility.id)) {
      // Two facilities with one id is contradictory truth: name neither.
      withhold(`facility:${facility.id}`, 'duplicate facility record for this id')
      facilityById.delete(facility.id)
      continue
    }
    facilityById.set(facility.id, facility as { id: string; name: string; capability: string })
  }

  const drafts: Draft[] = []

  // ── 1. THE STAGES: hot, or dark ───────────────────────────────────────────
  // A stage is HOT when a workflow holds a soundstage reservation at it — the
  // engine's own grant, not an inference from a phase name. It is DARK when
  // nothing holds it and nothing is being built on it (gap 2).
  const stageHolders = new Map<string, { productionId: string; phase: ProductionPhase }>()
  const contendedStages = new Set<string>()
  for (const workflow of state.operations.workflows) {
    if (!isObject(workflow) || !Array.isArray(workflow.reservations)) continue
    for (const reservation of workflow.reservations) {
      if (!isObject(reservation) || reservation.capability !== 'soundstage') continue
      if (!isNonEmptyString(reservation.facilityId)) continue
      if (stageHolders.has(reservation.facilityId)) {
        // Two companies on one stage is contradictory truth (law 22). Neither is
        // shown standing there, and the stage is not called dark either.
        contendedStages.add(reservation.facilityId)
        stageHolders.delete(reservation.facilityId)
        continue
      }
      if (contendedStages.has(reservation.facilityId)) continue
      stageHolders.set(reservation.facilityId, {
        productionId: workflow.productionId as string,
        phase: workflow.phase as ProductionPhase,
      })
    }
  }
  for (const stageId of contendedStages) {
    withhold(`stage-hot:${stageId}`, 'more than one company holds this stage')
  }

  // Sets under work occupy their stage even though no production is standing on it.
  const setsUnderWorkByStage = new Map<string, string>()
  const sets = Array.isArray(state.sets) ? state.sets : []
  for (const set of sets) {
    if (!isObject(set) || !isNonEmptyString(set.id) || !isNonEmptyString(set.mountedOn)) continue
    if (set.status !== 'under-construction') continue
    setsUnderWorkByStage.set(set.mountedOn, set.id)
    const completesWeek = isNonNegativeInteger(set.completesWeek) ? (set.completesWeek as number) : null
    drafts.push({
      kind: 'set-mounting',
      id: `set-mounting:${set.id}`,
      facilityId: set.mountedOn,
      productionId: null,
      phase: null,
      setId: set.id,
      weeksRemaining: completesWeek === null ? null : Math.max(0, completesWeek - currentWeek),
      distance: null,
      reason: null,
      beats: workingDay(),
    })
  }

  for (const [facilityId, facility] of facilityById) {
    if (facility.capability !== 'soundstage') continue
    const holder = stageHolders.get(facilityId)
    if (holder !== undefined) {
      drafts.push({
        kind: 'stage-hot',
        id: `stage-hot:${facilityId}`,
        facilityId,
        productionId: holder.productionId,
        phase: holder.phase,
        setId: null,
        weeksRemaining: null,
        distance: null,
        reason: null,
        beats: workingDay(),
      })
      continue
    }
    if (contendedStages.has(facilityId) || setsUnderWorkByStage.has(facilityId)) continue
    drafts.push({
      kind: 'stage-dark',
      id: `stage-dark:${facilityId}`,
      facilityId,
      productionId: null,
      phase: null,
      setId: null,
      weeksRemaining: null,
      distance: null,
      reason: null,
      beats: darkWeek(),
    })
  }

  // ── 2. SCENERY IN TRANSIT (§4.2's load-in, made visible) ──────────────────
  for (const workflow of state.operations.workflows) {
    if (!isObject(workflow) || !isNonEmptyString(workflow.productionId)) continue
    if (workflow.blocker === null || !isObject(workflow.blocker)) continue
    if (workflow.blocker.kind !== 'scenery-load-in') continue
    const loadIn = sceneryLoadInFor(state, workflow, currentWeek)
    if (!isSceneryLoadIn(loadIn)) {
      // The one place a WITHHOLDING is the right answer and not a defect: a
      // grandfathered picture's load-in genuinely has no duration to show.
      withhold(`scenery-in-transit:${workflow.productionId}`, `load-in has no duration: ${loadIn}`)
      continue
    }
    drafts.push({
      kind: 'scenery-in-transit',
      id: `scenery-in-transit:${workflow.productionId}`,
      facilityId: loadIn.toFacilityId,
      productionId: workflow.productionId,
      phase: 'shooting',
      setId: workflow.bindings?.setId ?? null,
      weeksRemaining: loadIn.weeksRemaining,
      distance: loadIn.distance,
      reason: null,
      beats: loadIn.arrived ? arrivalWeek() : travellingWeek(),
    })
  }

  // ── 3. WRAP CLEARING THE STAGE, and a set coming down ─────────────────────
  //
  // Read off the engine's OWN Tier-D rows. Witness, never input: nothing this
  // projection does with a row re-enters the simulation.
  //
  // THE WINDOW IS PER KIND, AND IT IS NOT DECORATION. `studioEvents` stamps a row
  // with the week its producer called authoritative, and the two producers
  // disagree by exactly one week BY CONSTRUCTION:
  //
  //   * `tick` builds its sink with `currentTick` and then increments the clock,
  //     so a row the ENGINE wrote carries `market.tick - 1` once the week settles.
  //     `wrapped` is one of those — wrap is automatic, never a command (§4.3) — so
  //     the wrap the settled week is ABOUT is the one stamped `currentWeek - 1`.
  //   * `applyActions` stamps `state.market.tick` and leaves the clock alone, so a
  //     row a COMMAND wrote carries the settled week itself. `setRetired` is one of
  //     those: striking a set is a player command.
  //
  // Reading both with one rule would either show a wrap a week late or show a
  // strike twice. Two rules, each with the producer named, is the honest form.
  const rows = isObject(state.studioEvents) && Array.isArray(state.studioEvents.rows)
    ? state.studioEvents.rows
    : []
  const ENGINE_WRITTEN_WEEK = currentWeek - 1
  const COMMAND_WRITTEN_WEEK = currentWeek
  for (const row of rows) {
    if (!isObject(row)) continue
    if (
      row.kind === 'wrapped' &&
      row.week === ENGINE_WRITTEN_WEEK &&
      isNonEmptyString(row.productionId)
    ) {
      drafts.push({
        kind: 'wrap-clearing',
        id: `wrap-clearing:${row.productionId}`,
        facilityId: isNonEmptyString(row.stageFacilityId) ? row.stageFacilityId : null,
        productionId: row.productionId,
        phase: 'shooting',
        setId: isNonEmptyString(row.setId) ? row.setId : null,
        weeksRemaining: 0,
        distance: null,
        reason: null,
        beats: clearingWeek(),
      })
      continue
    }
    if (
      row.kind === 'setRetired' &&
      row.week === COMMAND_WRITTEN_WEEK &&
      isNonEmptyString(row.setId)
    ) {
      const struck = sets.filter((candidate) => candidate.id === row.setId)
      drafts.push({
        kind: 'set-struck',
        id: `set-struck:${row.setId}`,
        facilityId: struck.length === 1 ? struck[0]!.mountedOn : null,
        productionId: null,
        phase: null,
        setId: row.setId,
        weeksRemaining: 0,
        distance: null,
        reason: null,
        beats: struckWeek(),
      })
    }
  }

  // ── 4. COMPANIES WAITING AT THE QUEUE (law 2, §3.3) ──────────────────────
  // The blocker the ENGINE wrote is the reason, restated in its own terms. A
  // `scenery-load-in` blocker is deliberately NOT a waiter — those people are on
  // site and the scenery is on the road, which is subject 2's story, not this one
  // (the same distinction `presence.ts` draws).
  for (const workflow of state.operations.workflows) {
    if (!isObject(workflow) || !isNonEmptyString(workflow.productionId)) continue
    const blocker = workflow.blocker
    if (!isObject(blocker)) continue
    let reason: string | null = null
    if (blocker.kind === 'facility-capacity') {
      reason = `awaiting ${String(blocker.capability)} capacity to enter ${String(blocker.targetPhase)}`
    } else if (blocker.kind === 'set-unavailable') {
      reason = `awaiting a standing set to enter ${String(blocker.targetPhase)}`
    }
    if (reason === null) continue
    const stage = workflow.reservations?.find?.(
      (reservation: unknown) => isObject(reservation) && reservation.capability === 'soundstage',
    )
    drafts.push({
      kind: 'company-waiting',
      id: `company-waiting:${workflow.productionId}`,
      facilityId: isObject(stage) && isNonEmptyString(stage.facilityId) ? stage.facilityId : null,
      productionId: workflow.productionId,
      phase: (workflow.phase as ProductionPhase | undefined) ?? null,
      setId: workflow.bindings?.setId ?? null,
      weeksRemaining: null,
      distance: null,
      reason,
      beats: waitingWeek(),
    })
  }

  // Admitted intents holding nothing at all (gap 3: they name no picture).
  const queue = Array.isArray(state.productionQueue) ? state.productionQueue : []
  for (const entry of queue) {
    if (!isObject(entry) || !isNonEmptyString(entry.kind) || !isNonNegativeInteger(entry.ordinal)) {
      continue
    }
    const queuedWeek = isNonNegativeInteger(entry.queuedWeek) ? (entry.queuedWeek as number) : null
    drafts.push({
      kind: 'queue-waiting',
      id: `queue-waiting:${String(entry.ordinal)}`,
      facilityId: null,
      productionId: null,
      phase: null,
      setId: null,
      weeksRemaining: null,
      distance: null,
      reason:
        queuedWeek === null
          ? `${entry.kind} admitted and waiting`
          : `${entry.kind} waiting since week ${String(queuedWeek)}`,
      beats: waitingWeek(),
    })
  }

  // ── 5. A BUILDING RISING ON THE PROPERTY ─────────────────────────────────
  const placements = isObject(state.placement) && Array.isArray(state.placement.facilities)
    ? state.placement.facilities
    : []
  for (const placed of placements) {
    if (!isObject(placed) || placed.status !== 'underConstruction') continue
    if (!isNonNegativeInteger(placed.id)) continue
    const completesWeek = isNonNegativeInteger(placed.completesWeek)
      ? (placed.completesWeek as number)
      : null
    drafts.push({
      kind: 'construction-progressing',
      id: `construction-progressing:${String(placed.id)}`,
      facilityId: isNonEmptyString(placed.facilityId) ? placed.facilityId : null,
      productionId: null,
      phase: null,
      setId: null,
      weeksRemaining: completesWeek === null ? null : Math.max(0, completesWeek - currentWeek),
      distance: null,
      reason: null,
      beats: workingDay(),
    })
  }

  // ── the settled projection ────────────────────────────────────────────────
  // Names are attached HERE, once, from the facility table — so a subject can
  // never carry a name the engine does not own (§3.1's display-name ruling), and
  // a facility that vanished between the grant and the read carries null rather
  // than an id dressed up as a name.
  const byId = new Map<string, TheaterSubject>()
  for (const draft of drafts) {
    if (byId.has(draft.id)) {
      withhold(draft.id, 'two subjects claim this id')
      byId.delete(draft.id)
      continue
    }
    const facility = draft.facilityId === null ? undefined : facilityById.get(draft.facilityId)
    byId.set(draft.id, {
      kind: draft.kind,
      id: draft.id,
      facilityId: draft.facilityId,
      facilityName: facility?.name ?? null,
      productionId: draft.productionId,
      phase: draft.phase,
      setId: draft.setId,
      weeksRemaining: draft.weeksRemaining,
      distance: draft.distance,
      reason: draft.reason,
      beats: draft.beats,
    })
  }
  const subjects = [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  withheld.sort((a, b) => {
    const left = a.subjectId ?? ''
    const right = b.subjectId ?? ''
    return left < right ? -1 : left > right ? 1 : 0
  })
  return { week: currentWeek, subjects, withheld }
}
