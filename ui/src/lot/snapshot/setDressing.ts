// ── What is standing on my stages — the WORLD's reading of the set root ───────
//
// C2a-M2 §3.1 / §4.2. The engine grew sets; this is the module that lets the property
// SHOW them. A picture does not merely occupy a soundstage any more — it stands on a
// named set with a quality, a condition and a freshness — and a stage with no set on it
// is a stage nothing can be filmed on. Neither fact was visible anywhere on the lot.
//
// CLASS A, all of it (§4.2). Every line below is a pure function of the settled week:
// the sets root, the stage identities, and the permanent (Tier D) rows the engine's own
// ledger stamped with this week. So the same week reads identically on load, after a
// batch skip and mid-playback, which is exactly what Class A means. No animation, no
// new channel — the world paints these words through the badge and caption chrome it
// has had since C1.
//
// THIS MODULE OWNS NO RULE. Whether a set may be shot on is `usable`, and `usable` is
// the ENGINE's answer, copied at the boundary (`setIsUsable`). Whether the work under
// way is a repair or a first build is the engine's `repairing`. What the location is
// called is the engine's `setTypeLabel`. The only decisions here are PRESENTATION ones:
// which of those facts is worth one line of the player's attention, and in what words.
//
// EVERY SENTENCE IS LITERALLY TRUE AT ITS STATE (G12), and every one of them is
// filmmaking language rather than engine vocabulary (`00F`): a stage is dark, a set
// stands, a crew builds, a picture wraps. No id, no capability term, no status enum
// ever reaches these strings.

import type {
  BuildingId,
  LotSetState,
  LotStageIdentity,
  LotWeekEvent,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import { lotStageIdentities } from './stageIdentity.ts'

/**
 * Above this condition a standing set reads as being in good repair.
 *
 * PRESENTATION ONLY, and named rather than inlined so an art note can be answered with
 * one number. It is not a gate and it must never be read as one — the engine's gate is
 * `usable`, and it lives at 35. This boundary is 100 − 2 × the engine's own wear step
 * (`SET_CONDITION_INITIAL` − 2 × `SET_CONDITION_WEAR_PER_PRODUCTION`), so a new set
 * reads as being in good repair for its first two pictures and starts showing wear on
 * the third. Tying it to the wear step is what stops the words drifting away from the
 * thing they describe when the step is retuned.
 */
export const LOT_SET_CONDITION_GOOD_AT_LEAST = 82

/** What the world is saying about one stage's dressing. Words carry it, never colour. */
export type LotSetDressingState =
  /** An operational stage with nothing mounted on it. Nothing can be filmed here. */
  | 'no-set'
  /** A set is going up on this stage for the first time. */
  | 'building'
  /** A set that has already stood is being put back into repair. */
  | 'repairing'
  /** The set finished this week. */
  | 'new'
  /** Standing, in good repair. */
  | 'standing'
  /** Standing and usable, but wearing. */
  | 'worn'
  /** Standing and BELOW the engine's own threshold: no picture may be bound to it. */
  | 'needs-repair'

/** Everything the world paints about ONE stage's dressing, this week. */
export type LotSetDressing = {
  /** The body on the property this is about. */
  buildingId: BuildingId
  /** The stage facility, in the engine's own id. */
  facilityId: string
  /** The engine's own name for the stage. The single spoken authority (§3.1). */
  facilityName: string
  /** The set mounted here, or null when nothing is. */
  set: LotSetState | null
  state: LotSetDressingState
  /**
   * The line the world paints, in the badge/caption register (UPPER CASE, no full stop)
   * — plus, when a permanent thing happened HERE this week, one more line under it.
   *
   * Never empty. A stage with nothing on it says so, because "this stage has no set"
   * is the single most actionable fact about a studio that cannot start a picture.
   */
  lines: string[]
}

function upper(text: string): string {
  return text.toUpperCase()
}

function weeks(count: number): string {
  return count === 1 ? '1 WEEK' : `${String(count)} WEEKS`
}

/** The sets a snapshot carries, validated one by one. Absent ⇒ this studio has none. */
export function lotSets(snapshot: StudioLotSnapshot): readonly LotSetState[] {
  const sets: unknown = snapshot.sets
  if (!Array.isArray(sets)) return []
  const exact: LotSetState[] = []
  for (const set of sets) {
    if (typeof set !== 'object' || set === null) continue
    const candidate = set as Partial<LotSetState>
    if (typeof candidate.id !== 'string' || candidate.id.length === 0) continue
    if (typeof candidate.name !== 'string' || candidate.name.length === 0) continue
    if (typeof candidate.mountedOnFacilityId !== 'string') continue
    exact.push(candidate as LotSetState)
  }
  return exact
}

/**
 * The set mounted on one stage facility, or null.
 *
 * A RETIRED set is not mounted on anything — it was struck, and the timber is gone —
 * which is the same reading the engine's own `setMountedOn` takes. Two live sets on one
 * stage is contradictory truth (V1 mounts at most one), so neither is named.
 */
export function lotSetMountedOn(
  snapshot: StudioLotSnapshot,
  stageFacilityId: string,
): LotSetState | null {
  const mounted = lotSets(snapshot).filter(
    (set) => set.status !== 'retired' && set.mountedOnFacilityId === stageFacilityId,
  )
  return mounted.length === 1 ? mounted[0]! : null
}

/** Which condition band a standing set reads in. `usable` is the ENGINE's word. */
function standingState(set: LotSetState, builtThisWeek: boolean): LotSetDressingState {
  if (set.usable !== true) return 'needs-repair'
  if (builtThisWeek) return 'new'
  return typeof set.condition === 'number' && set.condition >= LOT_SET_CONDITION_GOOD_AT_LEAST
    ? 'standing'
    : 'worn'
}

/** The one line a set's own state is worth. */
function setLine(set: LotSetState, state: LotSetDressingState): string {
  const name = upper(set.name)
  switch (state) {
    case 'building':
      return `${name} · GOING UP · ${weeks(set.weeksRemaining)}`
    case 'repairing':
      return `${name} · IN REPAIR · ${weeks(set.weeksRemaining)}`
    case 'new':
      return `${name} · STANDING · BUILT THIS WEEK`
    case 'standing':
      return `${name} · STANDING · GOOD REPAIR`
    case 'worn':
      return `${name} · STANDING · SHOWING WEAR`
    case 'needs-repair':
      return `${name} · TOO WORN TO SHOOT ON · REPAIR IT`
    default:
      return name
  }
}

/**
 * One stage's dressing, this week.
 *
 * A stage that is still a BUILDING SITE gets no dressing at all: there is no floor to
 * mount a set on, its own caption already counts the weeks, and a "no set mounted" line
 * over a half-built stage would be true of nothing a player can act on (law 12's
 * discipline applied to words instead of bodies).
 */
export function lotSetDressingForStage(
  snapshot: StudioLotSnapshot,
  stage: LotStageIdentity,
): LotSetDressing | null {
  if (stage.standing !== true) return null
  const set = lotSetMountedOn(snapshot, stage.facilityId)
  const events = lotWeekEvents(snapshot)
  const lines: string[] = []

  let state: LotSetDressingState
  if (set === null) {
    state = 'no-set'
    lines.push('NO SET MOUNTED')
    // WHY the stage is suddenly bare, when it is this week's doing. Visible causality:
    // a stage that empties itself between two weeks with no explanation is exactly the
    // "the world goes quiet and you must guess" seam the campaign exists to close.
    const struck = events.some(
      (event) =>
        event.kind === 'setRetired' &&
        lotSets(snapshot).some(
          (candidate) => candidate.id === event.setId && candidate.mountedOnFacilityId === stage.facilityId,
        ),
    )
    if (struck) lines.push('SET STRUCK THIS WEEK')
  } else if (set.status === 'under-construction') {
    state = set.repairing === true ? 'repairing' : 'building'
    lines.push(setLine(set, state))
  } else {
    const builtThisWeek = events.some(
      (event) => event.kind === 'setBuilt' && event.setId === set.id,
    )
    state = standingState(set, builtThisWeek)
    lines.push(setLine(set, state))
  }

  // A WRAP is the one moment the stage itself is the news. It is Tier D and persisted,
  // so it survives a reload inside its own week and vanishes when the week turns.
  for (const event of events) {
    if (event.kind !== 'wrapped' || event.stageFacilityId !== stage.facilityId) continue
    lines.push(`${upper(event.title)} WRAPPED HERE THIS WEEK`)
  }

  return {
    buildingId: stage.buildingId,
    facilityId: stage.facilityId,
    facilityName: stage.facilityName,
    set,
    state,
    lines,
  }
}

/** Every stage's dressing, in the snapshot's own stage order. */
export function lotSetDressings(snapshot: StudioLotSnapshot): LotSetDressing[] {
  const dressings: LotSetDressing[] = []
  for (const stage of lotStageIdentities(snapshot)) {
    const dressing = lotSetDressingForStage(snapshot, stage)
    if (dressing !== null) dressings.push(dressing)
  }
  return dressings
}

/** The dressing on one world BODY, or null when that body is not a standing stage. */
export function lotSetDressingFor(
  snapshot: StudioLotSnapshot,
  buildingId: BuildingId,
): LotSetDressing | null {
  const matches = lotSetDressings(snapshot).filter(
    (dressing) => dressing.buildingId === buildingId,
  )
  return matches.length === 1 ? matches[0]! : null
}

// ── The scenery shops — where the work on a set physically happens ────────────

/** The set work one scenery-shop facility is holding this week. */
export type LotSetWorkAtShop = {
  /** The scenery facility whose crew holds the work. The ENGINE assigned this. */
  facilityId: string
  /** The sets under way there, in snapshot order. Never empty. */
  sets: readonly LotSetState[]
  /** One line for the shop's own badge, in the badge register. */
  line: string
}

/**
 * Which scenery shop is building or repairing what, keyed by facility id.
 *
 * ATTRIBUTED, never broadcast. The engine derives which slot each set under work holds
 * and the boundary copies the facility id onto the set, so a studio with two shops sees
 * the work at the shop actually doing it rather than the same claim painted on both.
 * A set whose shop the engine could not name contributes NOTHING — the world would
 * rather say less than point at the wrong building.
 */
export function lotSetWorkByShop(snapshot: StudioLotSnapshot): Map<string, LotSetWorkAtShop> {
  const byFacility = new Map<string, LotSetState[]>()
  for (const set of lotSets(snapshot)) {
    if (set.status !== 'under-construction') continue
    const facilityId = set.sceneryFacilityId
    if (typeof facilityId !== 'string' || facilityId.length === 0) continue
    const held = byFacility.get(facilityId)
    if (held === undefined) byFacility.set(facilityId, [set])
    else held.push(set)
  }
  const work = new Map<string, LotSetWorkAtShop>()
  for (const [facilityId, sets] of byFacility) {
    const first = sets[0]!
    const verb = first.repairing === true ? 'REPAIRING' : 'BUILDING'
    const line =
      sets.length === 1
        ? `${verb} ${upper(first.name)} · ${weeks(first.weeksRemaining)}`
        : `${String(sets.length)} SETS UNDER WAY`
    work.set(facilityId, { facilityId, sets, line })
  }
  return work
}

// ── This week's permanent history, as the lot reads it ───────────────────────

/** The week events a snapshot carries, validated. Absent ⇒ nothing happened worth saying. */
export function lotWeekEvents(snapshot: StudioLotSnapshot): readonly LotWeekEvent[] {
  const events: unknown = snapshot.weekEvents
  if (!Array.isArray(events)) return []
  const exact: LotWeekEvent[] = []
  for (const event of events) {
    if (typeof event !== 'object' || event === null) continue
    const candidate = event as Partial<LotWeekEvent>
    if (candidate.kind === 'wrapped') {
      if (typeof candidate.title !== 'string' || candidate.title.length === 0) continue
      if (typeof candidate.stageFacilityId !== 'string') continue
      exact.push(candidate as LotWeekEvent)
      continue
    }
    if (candidate.kind === 'setBuilt' || candidate.kind === 'setRetired') {
      if (typeof candidate.setId !== 'string' || candidate.setId.length === 0) continue
      exact.push(candidate as LotWeekEvent)
    }
  }
  return exact
}
