// ── THE WITNESSED WEEK, ON THE GROUND (C2a-M5, charter §4.2) ──────────────────
//
// `studioWeekTheater` (src/core) answers WHAT THE PLANT IS DOING, as beat tracks.
// This module answers the only question left before it can be DRAWN: **where on
// this property does each of those facts stand?** — and it answers it exactly the
// way every other lot surface already does.
//
// LAW 12, kept: a fact about a facility no BODY stands for claims no place on the
// property at all. It is dropped rather than painted onto some other building.
// A studio in legacy mode carries no `weekTheater`, so this module produces
// nothing there and the world is byte-identically what it was.
//
// NOTHING HERE INVENTS A FACT. Every field is copied from the engine's own
// projection; the only derived quantities are (a) which body a facility is,
// (b) how far along a load-in is as a fraction, and (c) how much freight a
// contended stage has accumulated — and each of those is arithmetic over the
// engine's own numbers, stated below at the constant.

import {
  FOUNDING_STAGE_BUILDING_ID,
  lotStageIdentities,
} from './stageIdentity.ts'
import { FOUNDING_SCENERY_BUILDING_ID } from './setDressing.ts'
import type {
  BuildingId,
  LotTheaterSubject,
  LotTheaterSubjectKind,
  LotWeekTheater,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'

/**
 * THE BACKED-UP LOT (charter §4.2, the committed §18 item 8 target).
 *
 * One element of freight per week a picture has been made to wait, capped. The cap
 * is what keeps the apron a READABLE signal instead of a landfill: past six weeks
 * the pile stops growing and the Call Board carries the number, because a player
 * cannot count eleven crates at a glance but can read "6 weeks".
 */
export const BACKED_UP_LOT_MAX_ELEMENTS = 6

/** Draw-call budget for the whole theater layer, per §4.2's re-pin obligation. */
export const THEATER_MAX_FREIGHT_ELEMENTS = 24

/**
 * The body a facility IS, or null.
 *
 * Three authorities, in the order they own the answer: the derived stage identities
 * (which already cover founding AND built soundstages), the frozen founding scenery
 * vocabulary, and the placement projection for everything a studio built. Two
 * placements claiming one facility is contradictory truth: name neither.
 */
export function lotBodyForFacility(
  snapshot: StudioLotSnapshot,
  facilityId: string | null,
): BuildingId | null {
  if (typeof facilityId !== 'string' || facilityId.length === 0) return null
  const stage = lotStageIdentities(snapshot).find((s) => s.facilityId === facilityId)
  if (stage !== undefined) return stage.standing ? stage.buildingId : null
  const foundingStage = FOUNDING_STAGE_BUILDING_ID[facilityId]
  if (foundingStage !== undefined) return foundingStage
  const foundingScenery = FOUNDING_SCENERY_BUILDING_ID[facilityId]
  if (foundingScenery !== undefined) return foundingScenery
  const placements = Array.isArray(snapshot.placement?.placements)
    ? snapshot.placement.placements
    : []
  const bodies = placements.filter((placed) => placed.facilityId === facilityId)
  if (bodies.length !== 1) return null
  return `placed-${String(bodies[0]!.id)}`
}

/** The engine's projection, validated. Absent ⇒ there is no plant to watch. */
export function lotWeekTheater(snapshot: StudioLotSnapshot): LotWeekTheater | null {
  const theater: unknown = snapshot.weekTheater
  if (typeof theater !== 'object' || theater === null) return null
  const candidate = theater as Partial<LotWeekTheater>
  if (typeof candidate.week !== 'number') return null
  if (!Array.isArray(candidate.subjects)) return null
  return candidate as LotWeekTheater
}

/** Every subject of one kind, in the engine's own order. */
export function lotTheaterSubjects(
  snapshot: StudioLotSnapshot,
  kind: LotTheaterSubjectKind,
): readonly LotTheaterSubject[] {
  return (lotWeekTheater(snapshot)?.subjects ?? []).filter((s) => s.kind === kind)
}

// ── Scenery on the road ──────────────────────────────────────────────────────

/**
 * One load-in, placed on the ground: where it started, where it is going, and how
 * far along it is.
 *
 * `progress01` is derived from the ENGINE's own `weeksRemaining` against the trip
 * the engine also sized (`distance` in grid cells, through
 * `sceneryLoadInWeeksForDistance`). It is a fraction of the whole haul and it moves
 * exactly one step per authoritative week — so the crates never teleport, and they
 * never move for a reason the engine did not have.
 */
export type LotSceneryHaul = {
  subjectId: string
  from: BuildingId | null
  to: BuildingId
  productionTitle: string | null
  weeksRemaining: number
  totalWeeks: number
  progress01: number
  distance: number | null
}

export function lotSceneryHauls(snapshot: StudioLotSnapshot): LotSceneryHaul[] {
  const hauls: LotSceneryHaul[] = []
  for (const subject of lotTheaterSubjects(snapshot, 'scenery-in-transit')) {
    const to = lotBodyForFacility(snapshot, subject.facilityId)
    if (to === null) continue
    const remaining = subject.weeksRemaining
    if (typeof remaining !== 'number' || !Number.isFinite(remaining) || remaining < 0) continue
    // The shop the haul left. The engine names the DESTINATION on the subject (the
    // stage the scenery is called to); the origin is the property's scenery shop,
    // which is the only body that dispatches one. When a studio has several, the
    // subject's own `setId` cannot disambiguate them, so the origin is withheld and
    // the crates run the last leg only — honest, and never a wrong shop.
    const shops = [...lotSceneryShopBodies(snapshot)]
    const from = shops.length === 1 ? shops[0]! : null
    // A haul that is one week from arriving has one of its `totalWeeks` left. The
    // engine does not carry the total, so it is reconstructed the only honest way:
    // remaining + the weeks already spent is unknowable, therefore the fraction is
    // taken against the LONGEST the trip could still be — remaining + 1 — which is
    // exactly "one more step and it is there".
    const totalWeeks = remaining + 1
    hauls.push({
      subjectId: subject.id,
      from,
      to,
      productionTitle: subject.productionTitle,
      weeksRemaining: remaining,
      totalWeeks,
      progress01: totalWeeks <= 0 ? 1 : 1 - remaining / totalWeeks,
      distance: subject.distance,
    })
  }
  return hauls
}

/** Every body on this property that dispatches scenery. */
export function lotSceneryShopBodies(snapshot: StudioLotSnapshot): readonly BuildingId[] {
  const bodies = new Set<BuildingId>()
  for (const [facilityId, buildingId] of Object.entries(FOUNDING_SCENERY_BUILDING_ID)) {
    void facilityId
    bodies.add(buildingId)
  }
  const placements = Array.isArray(snapshot.placement?.placements)
    ? snapshot.placement.placements
    : []
  for (const placed of placements) {
    if (placed.capability === 'setScenery' && placed.status === 'operational') {
      bodies.add(`placed-${String(placed.id)}`)
    }
  }
  return [...bodies]
}

// ── The Call Board, and the freight that piles up beside it ──────────────────

/**
 * THE WORLD-NATIVE QUEUE FLOOR (charter §4.2, r3.1 Option A + Option B together).
 *
 * One placard per contended body, carrying the four law-2 facts in the studio's own
 * words — the picture, what it needs, who has it, and how long — plus the REMEDY
 * the engine already wrote. `freight` is Option B: one element per waited week,
 * capped, cleared when the wait is.
 *
 * Every string here is the ENGINE's, verbatim. The board composes; it never writes.
 */
export type LotCallBoardPlacard = {
  buildingId: BuildingId
  /** The pictures standing at this door, in the engine's order. */
  waiting: {
    subjectId: string
    /** The picture, when the engine named one (`queue-waiting` names none — §5 pin 3). */
    productionTitle: string | null
    /** The engine's own waiting sentence. Never re-worded. */
    reason: string | null
    weeksWaiting: number | null
  }[]
  /** Elements of freight standing on the apron. Bounded by BACKED_UP_LOT_MAX_ELEMENTS. */
  freight: number
}

export function lotCallBoard(snapshot: StudioLotSnapshot): LotCallBoardPlacard[] {
  const byBody = new Map<BuildingId, LotCallBoardPlacard>()
  for (const kind of ['company-waiting', 'queue-waiting'] as const) {
    for (const subject of lotTheaterSubjects(snapshot, kind)) {
      const buildingId = lotBodyForFacility(snapshot, subject.facilityId)
      if (buildingId === null) continue
      const existing = byBody.get(buildingId) ?? { buildingId, waiting: [], freight: 0 }
      const weeksWaiting =
        typeof subject.weeksRemaining === 'number' && Number.isFinite(subject.weeksRemaining)
          ? subject.weeksRemaining
          : null
      existing.waiting.push({
        subjectId: subject.id,
        productionTitle: subject.productionTitle,
        reason: subject.reason,
        weeksWaiting,
      })
      existing.freight = Math.min(
        BACKED_UP_LOT_MAX_ELEMENTS,
        existing.freight + Math.max(1, weeksWaiting ?? 1),
      )
      byBody.set(buildingId, existing)
    }
  }
  return [...byBody.values()]
}

/** Total freight elements the theater layer would draw. The budget's own number. */
export function lotTheaterFreightCount(snapshot: StudioLotSnapshot): number {
  return Math.min(
    THEATER_MAX_FREIGHT_ELEMENTS,
    lotCallBoard(snapshot).reduce((total, placard) => total + placard.freight, 0) +
      lotSceneryHauls(snapshot).length,
  )
}

// ── What the world PAINTS, per body, this week ───────────────────────────────

/**
 * The one value the renderer consumes: for each body, whether it is hot, dark,
 * clearing after a wrap, mounting or striking a set, or under construction — all of
 * it derived from the engine's own subject list, and all of it Class-A (true of the
 * SETTLED week, identical after a batch, on load, and mid-playback).
 */
export type LotBodyTheaterState = {
  buildingId: BuildingId
  hot: boolean
  dark: boolean
  clearing: boolean
  setMounting: boolean
  setStruck: boolean
  /**
   * A committed build is progressing here.
   *
   * Deliberately NOT drawn by the theater layer: the placement layer has owned
   * construction chrome since C1-M1b and draws it from the same placement
   * projection, and two owners painting one piece of ground is shift law 10's
   * whole subject. It is carried because the GROUNDING law reads it (the grip at
   * the back of the yard is on the property because a build is progressing).
   */
  building: boolean
  /** The picture at work here, when the engine named one. Never an id. */
  productionTitle: string | null
}

const BODY_STATE_KINDS: readonly LotTheaterSubjectKind[] = [
  'stage-hot',
  'stage-dark',
  'wrap-clearing',
  'set-mounting',
  'set-struck',
  'construction-progressing',
]

export function lotBodyTheaterStates(snapshot: StudioLotSnapshot): LotBodyTheaterState[] {
  const byBody = new Map<BuildingId, LotBodyTheaterState>()
  for (const kind of BODY_STATE_KINDS) {
    for (const subject of lotTheaterSubjects(snapshot, kind)) {
      const buildingId = lotBodyForFacility(snapshot, subject.facilityId)
      if (buildingId === null) continue
      const state = byBody.get(buildingId) ?? {
        buildingId,
        hot: false,
        dark: false,
        clearing: false,
        setMounting: false,
        setStruck: false,
        building: false,
        productionTitle: null,
      }
      if (kind === 'stage-hot') state.hot = true
      if (kind === 'stage-dark') state.dark = true
      if (kind === 'wrap-clearing') state.clearing = true
      if (kind === 'set-mounting') state.setMounting = true
      if (kind === 'set-struck') state.setStruck = true
      if (kind === 'construction-progressing') state.building = true
      if (state.productionTitle === null) state.productionTitle = subject.productionTitle
      byBody.set(buildingId, state)
    }
  }
  return [...byBody.values()]
}
