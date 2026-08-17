// ── World Inspector Default V1 — what a building says when you click it ───────
//
// M1.5 removes the last world-first violation: a physical building click used to fall
// through to `dispatchRoute(BUILDING_ACTION[id])`, ejecting the player out of the world
// and onto a full-screen deep surface. Every click now lands an in-world context panel
// instead, and the deep screen is reachable only by an explicit secondary choice.
//
// This module is the projection behind that panel. It is PURE and owns no rule: it reads
// the already-accepted presentation snapshot plus the already-accepted Studio Calendar,
// Construction and Screenplay-board read models, and re-states them as short labelled
// facts. It computes no occupancy, no capacity, no schedule and no money of its own.
//
// M-B adds the missing middle of that panel: the VERBS. A cold player could reach neither
// Commission nor Plan-auditions from the buildings, because the only control here was a
// deep-details ghost. `primaryActions` fixes that WITHOUT owning legality — every verb is
// a legality some read model already published, restated as a button, and every button
// takes an entry the host already owned.
//
// Strict-selector discipline (shift laws 6 / 17 / 21): every FACT GROUP is atomic. A group
// whose source read model is absent, malformed, or ambiguous is omitted entirely rather
// than partially rendered or guessed at. The panel itself always opens — withholding a
// fact must never re-open the ejection the milestone exists to close.

import type {
  AttentionState,
  BuildingId,
  FoundingBuildingId,
  LotParcelState,
  LotPlacedFacilityState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'
import {
  buildingLabelFor,
  isFoundingBuildingId,
  placedFacilityIdOf,
} from './snapshot/StudioLotSnapshot.ts'
import { lotFacilityPresenceOccupants } from './snapshot/presenceLines.ts'
import type {
  ScriptProjectsReadModel,
  StudioCalendarView,
  StudioConstructionView,
} from '../engine/adapter.ts'
import { firstFilmJourneyContext } from './snapshot/firstFilmJourney.ts'
import { moneyExact } from '../format.ts'

/** One labelled line of live truth. `key` is a stable React/test identity. */
export type LotBuildingInspectorFact = {
  key: string
  term: string
  detail: string
}

/**
 * Which existing entry a primary action takes. The kind is the action's identity —
 * its stable testid suffix and its React key — never a rule of its own.
 */
export type LotBuildingInspectorPrimaryActionKind =
  | 'commission'
  | 'plan-auditions'
  | 'open-package'

/**
 * "What can I do here RIGHT NOW" — one imperative verb this place currently offers.
 *
 * Every action here is a LEGALITY ALREADY PUBLISHED BY THE ENGINE, restated as a button.
 * This module decides nothing: it reads the screenplay board's own `commission.canStart`
 * and the engine's own first-film journey, and offers the verb only where one of them
 * already says the step is the picture's next one. No action is ever invented, and no
 * action opens a path the host did not already own.
 */
export type LotBuildingInspectorPrimaryAction = {
  kind: LotBuildingInspectorPrimaryActionKind
  /** The button's visible words AND its accessible name. Imperative, plain language. */
  label: string
}

export type LotBuildingInspectorContext = {
  buildingId: BuildingId
  /** The sign on the building — the same label the canvas and the companion print. */
  label: string
  /** What this place IS, in the studio's own words. Never a mechanic. */
  role: string
  /** One live status line. */
  status: string
  /** Canonical attention state, mirrored from the snapshot's own building record. */
  attention: AttentionState
  /** The snapshot's own attention reason, when it warrants one. */
  attentionNote: string | null
  /**
   * "Who's here this week" — the people group, printed BEFORE the actions.
   *
   * Split out of `facts` by M-B: a player reads a building as what is this → what is
   * happening → who is here → what can I do → how much room is left. Capacity is
   * management detail and belongs after the verb, not in front of it.
   */
  occupantFacts: LotBuildingInspectorFact[]
  /** Capacity, slots, commitments and place facts — printed AFTER the actions. */
  facts: LotBuildingInspectorFact[]
  /** Engine-published verbs this place offers right now, in reading order. */
  primaryActions: LotBuildingInspectorPrimaryAction[]
  /**
   * One plain sentence for a verb this place would otherwise offer and currently does not.
   *
   * A missing button is only honest if the panel says why it is missing. Null whenever
   * nothing is being withheld, or whenever the reason cannot be stated truthfully — the
   * panel never guesses at an explanation any more than it guesses at a verb.
   */
  primaryActionNote: string | null
  /**
   * Exactly one production located at this place whose EXISTING in-world command may be
   * offered here. Null when there is no located production, more than one, or no command.
   */
  commandOperation: ProductionOperationsState | null
  /** Name of the deep screen the explicit secondary action opens. */
  deepLabel: string
}

/**
 * The deep screen each building's retained navigation actually opens. These name real
 * destinations (see ./navigation.ts) — the Dashboard's production and release sections
 * are the Production Board and Released Films the player already knows by those names.
 */
export const LOT_DEEP_SCREEN_LABEL: Record<FoundingBuildingId, string> = {
  admin: 'Dashboard',
  // M-B copy law: the ghost names the PLACE the player clicked, in the words the lot
  // already uses for it. 'Assembly' and 'Casting Room' were internal screen names — a
  // cold player reading "Open Assembly details" on Development learned nothing.
  writers: 'Development',
  casting: 'Casting',
  'stage-a': 'Production Board',
  'stage-b': 'Production Board',
  post: 'Production Board',
  theater: 'Released Films',
  gate: 'Dashboard',
  expansion: 'Studio Development',
}

/**
 * The deep screen ANY world id opens (C1-M1b).
 *
 * A facility the studio built lives on Studio Development — the screen that owns
 * building on this lot — which is the same deep destination the Annex parcel opens and
 * the one `buildingActionFor` already routes it to. One id, one owner (shift law 10).
 */
export function lotDeepScreenLabel(id: BuildingId): string {
  return isFoundingBuildingId(id) ? LOT_DEEP_SCREEN_LABEL[id] : 'Studio Development'
}

const BUILDING_ROLE: Record<FoundingBuildingId, string> = {
  admin: 'Studio administration, finances, and publicity',
  writers: 'Development — screenplays commissioned, drafted, and reviewed',
  casting: 'Casting — camera tests, audition evidence, and packaging',
  'stage-a': 'Soundstage — where a picture shoots',
  'stage-b': 'Soundstage — where a picture shoots',
  post: 'Post-production and the scenery shop',
  theater: 'The studio theater — releases and what is playing',
  gate: 'The studio gate — this week’s arrivals',
  expansion: 'The Development & Casting Annex parcel',
}

/**
 * Which engine facility each place IS. Mirrors the accepted adapter mapping
 * (`LOT_STAGE_BY_SOUNDSTAGE_ID`) and the founding facility set in src/core/operations.ts.
 * Development and Casting share one physical Development & Casting facility, so both
 * places truthfully report that one facility's occupancy.
 */
const BUILDING_FACILITY_IDS: Partial<Record<BuildingId, readonly string[]>> = {
  writers: ['facility-development-casting', 'facility-development-casting-annex'],
  casting: ['facility-development-casting', 'facility-development-casting-annex'],
  'stage-a': ['facility-soundstage-07'],
  'stage-b': ['facility-soundstage-12'],
  post: ['facility-post-building', 'facility-scenery-shop'],
}

/**
 * Which facilities each place reports PRESENCE for — "who's here this week".
 *
 * The occupancy list above and this one are deliberately separate maps. Occupancy is
 * the Calendar's slot record and the Annex parcel has never printed one; presence is
 * the engine's per-person projection, and the parcel is exactly where the annex's
 * occupants stand. Extending one map to serve both would have silently added slot
 * facts to a panel that was accepted without them.
 */
const BUILDING_PRESENCE_FACILITY_IDS: Partial<Record<BuildingId, readonly string[]>> = {
  writers: ['facility-development-casting', 'facility-development-casting-annex'],
  casting: ['facility-development-casting', 'facility-development-casting-annex'],
  'stage-a': ['facility-soundstage-07'],
  'stage-b': ['facility-soundstage-12'],
  post: ['facility-post-building', 'facility-scenery-shop'],
  expansion: ['facility-development-casting-annex'],
}

/** Which slot occupants each place reports first. Absent ⇒ every occupant is reported. */
const BUILDING_OCCUPANT_OWNER: Partial<Record<BuildingId, 'script' | 'casting' | 'production'>> = {
  writers: 'script',
  casting: 'casting',
}

const OCCUPANT_ACTIVITY_LABEL: Record<string, string> = {
  drafting: 'Drafting',
  rewriting: 'Rewriting',
  auditioning: 'Auditioning',
  development: 'Development',
  preProduction: 'Pre-production',
  rehearsal: 'Rehearsal',
  shooting: 'Shooting',
  postProduction: 'Post-production',
  releaseReady: 'Release ready',
}

const RECEPTION_LABEL: Record<string, string> = {
  flop: 'Flop',
  mixed: 'Mixed',
  hit: 'Hit',
  smash: 'Smash',
}

const CREATIVE_ROLE_LABEL: Record<string, string> = {
  actor: 'Actor',
  director: 'Director',
  writer: 'Writer',
  craft: 'Craft',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many
}

/** A calendar facility view, validated field by field before anything is printed. */
type ExactFacility = {
  facilityId: string
  facilityName: string
  capacity: number
  occupied: number
  slots: { slot: number; owner: string; title: string; activity: string }[]
}

function exactFacility(value: unknown): ExactFacility | null {
  if (!isRecord(value)) return null
  const { facilityId, facilityName, capacity, occupied, slots } = value
  if (!isText(facilityId) || !isText(facilityName)) return null
  if (!isCount(capacity) || !isCount(occupied)) return null
  if (occupied > capacity) return null
  if (!Array.isArray(slots)) return null
  const occupants: ExactFacility['slots'] = []
  for (const slot of slots) {
    if (!isRecord(slot)) return null
    if (!isCount(slot.slot)) return null
    const occupant = slot.occupant
    if (occupant === null || occupant === undefined) continue
    if (!isRecord(occupant)) return null
    if (!isText(occupant.owner) || !isText(occupant.title) || !isText(occupant.activity)) return null
    occupants.push({
      slot: slot.slot,
      owner: occupant.owner,
      title: occupant.title,
      activity: occupant.activity,
    })
  }
  // Schema validity is not domain legality: a facility whose printed occupancy count
  // disagrees with its own slot record is ambiguous and is withheld entirely.
  if (occupants.length !== occupied) return null
  return { facilityId, facilityName, capacity, occupied, slots: occupants }
}

/** Committed calendar events, validated as one atomic set per kind. */
type ExactCommitment = { kind: string; week: number; title: string; extra: string | null }

function exactCommitments(
  calendar: StudioCalendarView | null,
  kinds: readonly string[],
): ExactCommitment[] | null {
  if (calendar === null) return null
  const raw: unknown = (calendar as unknown as Record<string, unknown>).commitments
  if (!Array.isArray(raw)) return null
  const wanted: ExactCommitment[] = []
  for (const entry of raw) {
    if (!isRecord(entry)) return null
    if (!isText(entry.kind) || !isCount(entry.week)) return null
    if (!kinds.includes(entry.kind)) continue
    if (!isText(entry.title)) return null
    let extra: string | null = null
    if (entry.kind === 'scriptDue') {
      if (!isText(entry.activity)) return null
      extra = OCCUPANT_ACTIVITY_LABEL[entry.activity] ?? null
      if (extra === null) return null
    }
    if (entry.kind === 'theatricalReceipt') {
      if (!isCount(entry.paymentOrdinal) || !isCount(entry.totalPayments)) return null
      if (entry.paymentOrdinal < 1 || entry.paymentOrdinal > entry.totalPayments) return null
      extra = `Payment ${String(entry.paymentOrdinal)} of ${String(entry.totalPayments)}`
    }
    wanted.push({ kind: entry.kind, week: entry.week, title: entry.title, extra })
  }
  return wanted
}

function facilityFacts(
  buildingId: BuildingId,
  calendar: StudioCalendarView | null,
): LotBuildingInspectorFact[] | null {
  const facilityIds = BUILDING_FACILITY_IDS[buildingId]
  if (facilityIds === undefined) return null
  return calendarFacilityFacts(facilityIds, calendar, BUILDING_OCCUPANT_OWNER[buildingId])
}

/**
 * The Calendar's own occupancy record for a set of facility ids, as printed facts.
 *
 * Split out of `facilityFacts` by C1-M1b so a facility the studio BUILT can report the
 * same slot truth through the same strictness: one malformed member still invalidates
 * the whole claim, and a facility the Calendar does not carry still prints nothing.
 */
function calendarFacilityFacts(
  facilityIds: readonly string[],
  calendar: StudioCalendarView | null,
  preferredOwner: 'script' | 'casting' | 'production' | undefined,
): LotBuildingInspectorFact[] | null {
  if (calendar === null) return null
  const raw: unknown = (calendar as unknown as Record<string, unknown>).facilities
  if (!Array.isArray(raw)) return null

  const matched: ExactFacility[] = []
  for (const entry of raw) {
    if (!isRecord(entry)) return null
    const id: unknown = entry.facilityId
    if (!isText(id)) return null
    if (!facilityIds.includes(id)) continue
    const facility = exactFacility(entry)
    // One malformed member invalidates the whole occupancy claim for this place.
    if (facility === null) return null
    matched.push(facility)
  }
  if (matched.length === 0) return null

  const facts: LotBuildingInspectorFact[] = []
  for (const facility of matched) {
    facts.push({
      key: `facility:${facility.facilityId}`,
      term: facility.facilityName,
      detail: `${String(facility.occupied)}/${String(facility.capacity)} ${plural(
        facility.capacity,
        'slot',
        'slots',
      )} in use`,
    })
    const ordered = [...facility.slots].sort((a, b) => {
      if (preferredOwner !== undefined) {
        const left = a.owner === preferredOwner ? 0 : 1
        const right = b.owner === preferredOwner ? 0 : 1
        if (left !== right) return left - right
      }
      return a.slot - b.slot
    })
    for (const occupant of ordered) {
      const activity = OCCUPANT_ACTIVITY_LABEL[occupant.activity] ?? null
      if (activity === null) continue
      facts.push({
        key: `slot:${facility.facilityId}:${String(occupant.slot)}`,
        term: `Slot ${String(occupant.slot + 1)}`,
        detail: `${activity}: ${occupant.title}`,
      })
    }
  }
  return facts
}

/**
 * "Who's here this week" — the engine's own presence for this place, by name and
 * credit. Absent presence means no lines at all: the panel never invents an occupant,
 * and a person the engine withheld is silently not claimed (fail-neutral).
 */
function presenceFacts(
  snapshot: StudioLotSnapshot,
  buildingId: BuildingId,
  override?: readonly string[],
): LotBuildingInspectorFact[] {
  const facilityIds = override ?? BUILDING_PRESENCE_FACILITY_IDS[buildingId]
  if (facilityIds === undefined) return []
  const occupants = lotFacilityPresenceOccupants(snapshot, facilityIds)
  if (occupants.length === 0) return []
  const facts: LotBuildingInspectorFact[] = [
    {
      key: 'presence:heading',
      term: 'Who’s here this week',
      detail: `${String(occupants.length)} ${plural(occupants.length, 'person', 'people')}`,
    },
  ]
  for (const occupant of occupants) {
    const credit = occupant.creditLabel ?? 'On the roster'
    facts.push({
      key: `presence:${occupant.talentId}`,
      term: occupant.name,
      detail: occupant.waiting
        ? `${credit} · waiting outside`
        : occupant.workTitle === null
          ? credit
          : `${credit} · ${occupant.workTitle}`,
    })
  }
  return facts
}

function locatedOperations(
  snapshot: StudioLotSnapshot,
  buildingId: BuildingId,
): ProductionOperationsState[] {
  const operations = snapshot.productionOperations
  if (!Array.isArray(operations)) return []
  return operations.filter(
    (operation) =>
      isRecord(operation) &&
      operation.locationBuildingId === buildingId &&
      isText(operation.productionId) &&
      isText(operation.title),
  )
}

function operationFacts(operations: readonly ProductionOperationsState[]): LotBuildingInspectorFact[] {
  const facts: LotBuildingInspectorFact[] = []
  for (const operation of operations) {
    facts.push({
      key: `production:${operation.productionId}`,
      term: operation.title,
      detail: `${operation.phaseLabel} · ${operation.statusLabel} · ${String(
        operation.weeksRemaining,
      )} ${plural(operation.weeksRemaining, 'week', 'weeks')} left`,
    })
    if (operation.blocker !== null) {
      facts.push({
        key: `blocker:${operation.productionId}`,
        term: 'Needs attention',
        detail: `${operation.blocker.headline} — ${operation.blocker.detail}`,
      })
    }
  }
  return facts
}

function constructionFacts(
  construction: StudioConstructionView | null,
): LotBuildingInspectorFact[] | null {
  if (construction === null || !isRecord(construction)) return null
  const { status, name, capex, durationWeeks, dueWeek, completedAdvances, remainingAdvances } =
    construction as unknown as Record<string, unknown>
  if (!isText(status) || !isText(name)) return null
  if (!isFiniteNumber(capex) || !isCount(durationWeeks)) return null
  const facts: LotBuildingInspectorFact[] = [{ key: 'annex:name', term: 'Facility', detail: name }]
  if (status === 'vacant' || status === 'legacy') {
    facts.push({
      key: 'annex:quote',
      term: 'Quote',
      detail: `${moneyExact(capex)} · ${String(durationWeeks)} ${plural(
        durationWeeks,
        'week',
        'weeks',
      )} to build`,
    })
    return facts
  }
  if (status === 'building') {
    if (!isCount(completedAdvances) || !isCount(remainingAdvances) || !isCount(dueWeek)) return null
    facts.push({
      key: 'annex:progress',
      term: 'Under construction',
      detail: `${String(completedAdvances)}/${String(durationWeeks)} ${plural(
        durationWeeks,
        'week',
        'weeks',
      )} done · due Week ${String(dueWeek)}`,
    })
    return facts
  }
  if (status === 'operational') {
    facts.push({ key: 'annex:progress', term: 'Status', detail: 'Operational' })
    return facts
  }
  return null
}

// ── Placed facilities (C1-M1b) — a facility the studio BUILT, inspected ───────
//
// Until this milestone a placed facility had no `BuildingId`, so clicking one landed
// its PARCEL and the facility itself said nothing at all: no name, no countdown, no
// occupants, no running cost. It is a first-class world citizen now, and it answers the
// SAME five questions in the SAME order every other place answers — what is this, what
// is happening, who is here, what can I do, how much room is left.
//
// The legacy Annex is deliberately not one of these. A placement standing on the
// `expansion` parcel keeps being addressed as `expansion` and keeps the accepted Annex
// panel exactly as it is; nothing below can reach it.

/** The placement one world id names, or null. Two claiming one id is contradictory. */
function placedFacilityFor(
  snapshot: StudioLotSnapshot,
  buildingId: BuildingId,
): LotPlacedFacilityState | null {
  const placedId = placedFacilityIdOf(buildingId)
  if (placedId === null) return null
  const placements = snapshot.placement?.placements
  if (!Array.isArray(placements)) return null
  const matches = placements.filter((placed) => isRecord(placed) && placed.id === placedId)
  if (matches.length !== 1) return null
  const only = matches[0]!
  if (!isText(only.name) || !isText(only.facilityId) || !isText(only.parcelId)) return null
  if (only.status !== 'operational' && only.status !== 'underConstruction') return null
  if (!isCount(only.placedWeek) || !isCount(only.completesWeek)) return null
  if (!isCount(only.weeksRemaining) || !isFiniteNumber(only.weeklyOperatingCost)) return null
  return only
}

/** The parcel a placed facility stands on, when the projection proves exactly one. */
function parcelFor(snapshot: StudioLotSnapshot, parcelId: string): LotParcelState | null {
  const parcels = snapshot.placement?.parcels
  if (!Array.isArray(parcels)) return null
  const matches = parcels.filter((parcel) => isRecord(parcel) && parcel.id === parcelId)
  return matches.length === 1 && isText(matches[0]!.label) ? matches[0]! : null
}

/**
 * WHAT IS HAPPENING here — the construction countdown, or the operational facts.
 *
 * Every number is the Engine's own: `completesWeek` and `weeksRemaining` come off the
 * placement projection, and the weeks-done figure is their difference, never a clock
 * this module runs.
 */
function placedFacts(
  snapshot: StudioLotSnapshot,
  placed: LotPlacedFacilityState,
  calendar: StudioCalendarView | null,
): LotBuildingInspectorFact[] {
  const facts: LotBuildingInspectorFact[] = [
    { key: 'placed:name', term: 'Facility', detail: placed.name },
  ]
  const parcel = parcelFor(snapshot, placed.parcelId)
  if (parcel !== null) {
    facts.push({ key: 'placed:parcel', term: 'Ground', detail: parcel.label })
  }
  const buildWeeks = Math.max(1, placed.completesWeek - placed.placedWeek)
  if (placed.status === 'underConstruction') {
    const done = Math.max(0, Math.min(buildWeeks, buildWeeks - placed.weeksRemaining))
    facts.push({
      key: 'placed:progress',
      term: 'Under construction',
      detail: `${String(done)}/${String(buildWeeks)} ${plural(
        buildWeeks,
        'week',
        'weeks',
      )} done · due Week ${String(placed.completesWeek)}`,
    })
  } else {
    facts.push({
      key: 'placed:progress',
      term: 'Status',
      detail: `Operational since Week ${String(placed.completesWeek)}`,
    })
    facts.push({
      key: 'placed:opex',
      term: 'Weekly running cost',
      detail: moneyExact(placed.weeklyOperatingCost),
    })
    // HOW MUCH ROOM IS LEFT — the Calendar's own slot record for this exact facility.
    const capacity = calendarFacilityFacts([placed.facilityId], calendar, undefined)
    if (capacity !== null) facts.push(...capacity)
  }
  return facts
}

/** One live status line for a facility the studio built. */
function placedStatusLine(
  placed: LotPlacedFacilityState,
  calendar: StudioCalendarView | null,
): string {
  if (placed.status === 'underConstruction') {
    return placed.weeksRemaining === 0
      ? `${placed.name} completes this week.`
      : `${placed.name} is under construction — ${String(placed.weeksRemaining)} ${plural(
          placed.weeksRemaining,
          'week',
          'weeks',
        )} to go.`
  }
  const capacity = calendarFacilityFacts([placed.facilityId], calendar, undefined)
  if (capacity === null) return `${placed.name} is operational.`
  return capacity.some((fact) => fact.key.startsWith('slot:'))
    ? `Work is under way in ${placed.name}.`
    : `${placed.name} is operational — nothing is booked in here this week.`
}

function theaterFacts(snapshot: StudioLotSnapshot): LotBuildingInspectorFact[] {
  const facts: LotBuildingInspectorFact[] = []
  const released = Array.isArray(snapshot.releasedFilms) ? snapshot.releasedFilms : []
  for (const film of released.slice(0, 3)) {
    if (!isRecord(film) || !isText(film.id) || !isText(film.title)) continue
    if (!isText(film.reception) || !isCount(film.weeksAgo)) continue
    const reception = RECEPTION_LABEL[film.reception]
    if (reception === undefined) continue
    facts.push({
      key: `release:${film.id}`,
      term: film.title,
      detail:
        film.weeksAgo === 0
          ? `${reception} · released this week`
          : `${reception} · released ${String(film.weeksAgo)} ${plural(
              film.weeksAgo,
              'week',
              'weeks',
            )} ago`,
    })
  }
  return facts
}

function gateFacts(snapshot: StudioLotSnapshot): LotBuildingInspectorFact[] | null {
  const market = snapshot.gateHiringMarket
  if (!isRecord(market) || !Array.isArray(market.candidates)) return null
  const facts: LotBuildingInspectorFact[] = []
  for (const candidate of market.candidates.slice(0, 4)) {
    if (!isRecord(candidate) || !isText(candidate.talentId) || !isText(candidate.name)) return null
    if (!isText(candidate.creativeRole)) return null
    const role = CREATIVE_ROLE_LABEL[candidate.creativeRole]
    if (role === undefined) return null
    facts.push({ key: `visitor:${candidate.talentId}`, term: candidate.name, detail: role })
  }
  return facts
}

function adminFacts(snapshot: StudioLotSnapshot): LotBuildingInspectorFact[] {
  const facts: LotBuildingInspectorFact[] = []
  if (isFiniteNumber(snapshot.cash)) {
    facts.push({ key: 'admin:cash', term: 'Cash', detail: moneyExact(snapshot.cash) })
  }
  const standing = snapshot.standingValues
  if (
    isRecord(standing) &&
    isFiniteNumber(standing.awareness) &&
    isFiniteNumber(standing.prestige) &&
    isFiniteNumber(standing.confidence)
  ) {
    facts.push({
      key: 'admin:standing',
      term: 'Standing',
      detail: `Awareness ${String(Math.round(standing.awareness))} · Prestige ${String(
        Math.round(standing.prestige),
      )} · Confidence ${String(Math.round(standing.confidence))}`,
    })
  }
  const offers = snapshot.publicityOffers
  if (Array.isArray(offers)) {
    facts.push({
      key: 'admin:publicity',
      term: 'Publicity',
      detail:
        offers.length === 0
          ? 'No campaign is offered this week'
          : `${String(offers.length)} ${plural(offers.length, 'campaign', 'campaigns')} offered this week`,
    })
  }
  return facts
}

function commitmentFacts(
  commitments: ExactCommitment[] | null,
  keyPrefix: string,
): LotBuildingInspectorFact[] {
  if (commitments === null) return []
  return commitments.slice(0, 4).map((commitment, index) => ({
    key: `${keyPrefix}:${String(index)}:${commitment.title}`,
    term: commitment.extra ?? 'Due',
    detail: `${commitment.title} · Week ${String(commitment.week)}`,
  }))
}

/**
 * The verbs this place offers right now.
 *
 * TWO published legalities feed this, and nothing else:
 *
 *   • Development's "Commission a screenplay" mirrors the EXACT condition the host's own
 *     retained-commissioning interception already requires (managed board · Writers Room
 *     idle capacity · `commission.canStart`). Offering the button on any weaker test
 *     would produce a verb that lands the full-screen screen instead of the in-world
 *     workspace, which is the defect this milestone exists to close.
 *   • Casting's two verbs are the engine's OWN first-film journey, read verbatim off the
 *     snapshot: at `ready-to-package` the projection has already decided (from the
 *     Casting Room's own `legalActions`) whether the next step is auditions or the
 *     package. This module never re-answers that question.
 *
 * Any absent or malformed source yields NO action — a withheld verb is a missing button,
 * never a guessed one.
 */
function primaryActions(
  snapshot: StudioLotSnapshot,
  buildingId: BuildingId,
  scriptBoard: ScriptProjectsReadModel | null,
): LotBuildingInspectorPrimaryAction[] {
  if (buildingId === 'writers') {
    if (
      scriptBoard === null ||
      scriptBoard.mode !== 'managed' ||
      scriptBoard.lotAttention.kind !== 'idle' ||
      scriptBoard.commission.canStart !== true
    ) return []
    return [{ kind: 'commission', label: 'Commission a screenplay' }]
  }
  if (buildingId !== 'casting') return []
  const journey = firstFilmJourneyContext(snapshot)
  if (journey.kind !== 'view') return []
  const { stage, next, pictureTitle } = journey.view
  if (stage !== 'ready-to-package' || next === null || next.site !== 'casting') return []
  if (next.kind === 'plan-auditions') {
    return [
      {
        kind: 'plan-auditions',
        label:
          pictureTitle === null ? 'Plan auditions' : `Plan auditions for ${pictureTitle}`,
      },
    ]
  }
  if (next.kind === 'open-package') {
    return [{ kind: 'open-package', label: 'Open the picture’s package' }]
  }
  return []
}

/** The first printable title in one screenplay-board section, or null. */
function sectionTitle(board: ScriptProjectsReadModel, section: string): string | null {
  const sections: unknown = (board as unknown as Record<string, unknown>).sections
  if (!isRecord(sections)) return null
  const rows: unknown = sections[section]
  if (!Array.isArray(rows)) return null
  const first: unknown = rows[0]
  if (!isRecord(first) || !isText(first.title)) return null
  return first.title
}

/**
 * Why Development is not offering "Commission a screenplay" right now.
 *
 * The legality gate is unchanged and stays exactly where it is: the host's retained
 * commissioning interception requires an IDLE screenplay board, so the verb is correctly
 * absent whenever the Writers' Room is holding something. What was missing is the
 * SENTENCE — the panel read "No screenplay is in development · 0/2 slots" with the verb
 * silently gone, which is the "the world goes quiet and you must guess" seam this campaign
 * exists to close (red-team finding).
 *
 * Only called when the engine says commissioning itself is legal (`commission.canStart`),
 * so the sentence never contradicts a real blocker: the board's own blockers already speak
 * for those. Every reason names the studio's ACTUAL current occupation and what ends it,
 * and none of them claims anything about surfaces other than this one.
 */
function commissionWithheldNote(board: ScriptProjectsReadModel | null): string | null {
  if (board === null || board.mode !== 'managed' || board.commission?.canStart !== true) return null
  const attention: unknown = (board as unknown as Record<string, unknown>).lotAttention
  if (!isRecord(attention) || !isText(attention.kind) || attention.kind === 'idle') return null
  const reopens = 'Commissioning opens here again once it moves on.'
  switch (attention.kind) {
    case 'review-required': {
      const title = sectionTitle(board, 'needsReview')
      return title === null
        ? `Development is holding a screenplay decision. ${reopens}`
        : `${title} is waiting on an Accept or Rewrite decision. ${reopens}`
    }
    case 'active-work': {
      const title = sectionTitle(board, 'inDevelopment')
      return title === null
        ? `The writers are working on a screenplay. ${reopens}`
        : `The writers are working on ${title}. ${reopens}`
    }
    case 'ready-script': {
      const title = sectionTitle(board, 'readyToPackage')
      return title === null
        ? `An accepted screenplay is waiting on casting. ${reopens}`
        : `${title} is accepted and waiting on casting. ${reopens}`
    }
    case 'capacity-constraint':
      return `Every Development & Casting slot is occupied. ${reopens}`
    default:
      // An attention kind this panel has never been taught to explain says nothing at all.
      return null
  }
}

/**
 * Project everything the in-world panel for one building shows.
 *
 * `calendar` / `construction` / `scriptBoard` are the ALREADY-ACCEPTED adapter read
 * models. Pass `null` when the host could not obtain one (a read model that throws on a
 * hostile accepted save is a withheld fact group, never a reason to eject the player to a
 * deep screen).
 */
export function lotBuildingInspectorContext(
  snapshot: StudioLotSnapshot,
  buildingId: BuildingId,
  calendar: StudioCalendarView | null,
  construction: StudioConstructionView | null,
  scriptBoard: ScriptProjectsReadModel | null = null,
): LotBuildingInspectorContext {
  const building = Array.isArray(snapshot.buildings)
    ? (snapshot.buildings.find(
        (candidate) => isRecord(candidate) && candidate.id === buildingId,
      ) ?? null)
    : null
  const attention: AttentionState = building?.attention ?? 'normal'
  const rawAttentionNote: unknown = building?.attentionReason
  const attentionNote = isText(rawAttentionNote) ? rawAttentionNote : null

  const facts: LotBuildingInspectorFact[] = []
  const occupantFacts: LotBuildingInspectorFact[] = []
  const operations = locatedOperations(snapshot, buildingId)
  const commandCandidates = operations.filter((operation) => operation.currentCommand !== null)
  let status = ''
  let role = isFoundingBuildingId(buildingId) ? BUILDING_ROLE[buildingId] : ''
  let label = buildingLabelFor(buildingId, snapshot.property)

  // A facility the studio BUILT answers the same five questions as every founding place
  // (C1-M1b). It is checked FIRST because it is the one branch the founding switch below
  // was never written for — and a closed switch is exactly how this milestone's defect
  // family gets in.
  const placed = placedFacilityFor(snapshot, buildingId)
  if (placed !== null) {
    label = label ?? placed.name
    role =
      placed.status === 'operational'
        ? `A studio facility the lot built — ${placed.name}`
        : `A facility under construction on the studio's own ground — ${placed.name}`
    facts.push(...placedFacts(snapshot, placed, calendar))
    occupantFacts.push(...presenceFacts(snapshot, buildingId, [placed.facilityId]))
    facts.push(...operationFacts(operations))
    status = placedStatusLine(placed, calendar)
  }

  switch (placed !== null ? '' : buildingId) {
    case 'admin': {
      facts.push(...adminFacts(snapshot))
      status = 'The front office is open — finances, standing, and this week’s publicity.'
      break
    }
    case 'writers': {
      const occupancy = facilityFacts('writers', calendar)
      if (occupancy !== null) facts.push(...occupancy)
      occupantFacts.push(...presenceFacts(snapshot, 'writers'))
      facts.push(...commitmentFacts(exactCommitments(calendar, ['scriptDue']), 'scriptDue'))
      status =
        occupancy === null
          ? 'Development is open.'
          : occupancy.some((fact) => fact.key.startsWith('slot:'))
            ? 'Screenplay work is under way in the studio’s development slots.'
            : 'No screenplay is in development.'
      break
    }
    case 'casting': {
      const occupancy = facilityFacts('casting', calendar)
      if (occupancy !== null) facts.push(...occupancy)
      occupantFacts.push(...presenceFacts(snapshot, 'casting'))
      facts.push(...commitmentFacts(exactCommitments(calendar, ['castingDue']), 'castingDue'))
      status =
        occupancy === null
          ? 'Casting is open.'
          : occupancy.some((fact) => fact.key.startsWith('slot:'))
            ? 'Casting work is under way in the studio’s development slots.'
            : 'No camera test is running.'
      break
    }
    case 'stage-a':
    case 'stage-b': {
      const occupancy = facilityFacts(buildingId, calendar)
      if (occupancy !== null) facts.push(...occupancy)
      occupantFacts.push(...presenceFacts(snapshot, buildingId))
      facts.push(...operationFacts(operations))
      status =
        operations.length === 1
          ? `${operations[0]!.title} · ${operations[0]!.statusLabel}`
          : operations.length > 1
            ? `${String(operations.length)} productions are recorded at this stage.`
            : 'The stage is dark — no picture is shooting here.'
      break
    }
    case 'post': {
      const occupancy = facilityFacts('post', calendar)
      if (occupancy !== null) facts.push(...occupancy)
      occupantFacts.push(...presenceFacts(snapshot, 'post'))
      facts.push(...operationFacts(operations))
      status =
        operations.length === 1
          ? `${operations[0]!.title} · ${operations[0]!.statusLabel}`
          : operations.length > 1
            ? `${String(operations.length)} productions are recorded here.`
            : 'The shop and the cutting rooms are quiet.'
      break
    }
    case 'theater': {
      const presence = snapshot.releasePresence
      facts.push(...theaterFacts(snapshot))
      facts.push(
        ...commitmentFacts(exactCommitments(calendar, ['theatricalReceipt']), 'theatricalReceipt'),
      )
      status =
        (presence === 'now-showing'
          ? isText(snapshot.latestReleaseTitle)
            ? `Now showing: ${snapshot.latestReleaseTitle}`
            : 'A picture is playing.'
          : presence === 'released'
            ? 'The studio has released pictures; none is playing this week.'
            : 'The marquee is empty — the studio has released nothing yet.')
      break
    }
    case 'gate': {
      const visitors = gateFacts(snapshot)
      if (visitors !== null) facts.push(...visitors)
      status =
        (visitors === null
          ? 'Current visitor details are unavailable at the Gate.'
          : visitors.length === 0
            ? 'No one is waiting at the gate this week.'
            : `${String(visitors.length)} ${plural(
                visitors.length,
                'visitor is',
                'visitors are',
              )} waiting at the gate.`)
      break
    }
    case 'expansion': {
      const built = constructionFacts(construction)
      if (built !== null) facts.push(...built)
      occupantFacts.push(...presenceFacts(snapshot, 'expansion'))
      const rawProgressText: unknown = building?.constructionProgressText
      const progressText = isText(rawProgressText) ? rawProgressText : null
      status =
        progressText ??
        (built === null ? 'Parcel details are unavailable.' : 'The parcel is marked and graded.')
      break
    }
    default:
      // Every founding place is handled above and every placed facility before the
      // switch. Anything else is a world id this panel has never been taught — it opens
      // and says so, rather than pretending to describe a place it cannot see.
      if (placed === null && status === '') {
        status = 'This place is not part of the studio property this week.'
      }
      break
  }

  const actions = primaryActions(snapshot, buildingId, scriptBoard)
  return {
    buildingId,
    label: label ?? buildingId,
    role,
    status,
    attention,
    attentionNote,
    occupantFacts,
    facts,
    primaryActions: actions,
    // Only Development withholds a verb the engine calls legal, so only Development has
    // something to explain. The note appears exactly where the button would have been.
    primaryActionNote:
      buildingId === 'writers' && actions.length === 0
        ? commissionWithheldNote(scriptBoard)
        : null,
    commandOperation: commandCandidates.length === 1 ? commandCandidates[0]! : null,
    deepLabel: lotDeepScreenLabel(buildingId),
  }
}
