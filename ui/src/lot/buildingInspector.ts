// ── World Inspector Default V1 — what a building says when you click it ───────
//
// M1.5 removes the last world-first violation: a physical building click used to fall
// through to `dispatchRoute(BUILDING_ACTION[id])`, ejecting the player out of the world
// and onto a full-screen deep surface. Every click now lands an in-world context panel
// instead, and the deep screen is reachable only by an explicit secondary choice.
//
// This module is the projection behind that panel. It is PURE and owns no rule: it reads
// the already-accepted presentation snapshot plus the already-accepted Studio Calendar and
// Construction read models, and re-states them as short labelled facts. It computes no
// occupancy, no capacity, no schedule and no money of its own.
//
// Strict-selector discipline (shift laws 6 / 17 / 21): every FACT GROUP is atomic. A group
// whose source read model is absent, malformed, or ambiguous is omitted entirely rather
// than partially rendered or guessed at. The panel itself always opens — withholding a
// fact must never re-open the ejection the milestone exists to close.

import type {
  AttentionState,
  BuildingId,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'
import { BUILDING_LABELS } from './snapshot/StudioLotSnapshot.ts'
import { lotFacilityPresenceOccupants } from './snapshot/presenceLines.ts'
import type { StudioCalendarView, StudioConstructionView } from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'

/** One labelled line of live truth. `key` is a stable React/test identity. */
export type LotBuildingInspectorFact = {
  key: string
  term: string
  detail: string
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
  facts: LotBuildingInspectorFact[]
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
export const LOT_DEEP_SCREEN_LABEL: Record<BuildingId, string> = {
  admin: 'Dashboard',
  writers: 'Assembly',
  casting: 'Casting Room',
  'stage-a': 'Production Board',
  'stage-b': 'Production Board',
  post: 'Production Board',
  theater: 'Released Films',
  gate: 'Dashboard',
  expansion: 'Studio Development',
}

const BUILDING_ROLE: Record<BuildingId, string> = {
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

  const preferredOwner = BUILDING_OCCUPANT_OWNER[buildingId]
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
): LotBuildingInspectorFact[] {
  const facilityIds = BUILDING_PRESENCE_FACILITY_IDS[buildingId]
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
 * Project everything the in-world panel for one building shows.
 *
 * `calendar` / `construction` are the ALREADY-ACCEPTED adapter read models. Pass `null`
 * when the host could not obtain one (a read model that throws on a hostile accepted save
 * is a withheld fact group, never a reason to eject the player to a deep screen).
 */
export function lotBuildingInspectorContext(
  snapshot: StudioLotSnapshot,
  buildingId: BuildingId,
  calendar: StudioCalendarView | null,
  construction: StudioConstructionView | null,
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
  const operations = locatedOperations(snapshot, buildingId)
  const commandCandidates = operations.filter((operation) => operation.currentCommand !== null)
  let status: string

  switch (buildingId) {
    case 'admin': {
      facts.push(...adminFacts(snapshot))
      status = 'The front office is open — finances, standing, and this week’s publicity.'
      break
    }
    case 'writers': {
      const occupancy = facilityFacts('writers', calendar)
      if (occupancy !== null) facts.push(...occupancy)
      facts.push(...presenceFacts(snapshot, 'writers'))
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
      facts.push(...presenceFacts(snapshot, 'casting'))
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
      facts.push(...presenceFacts(snapshot, buildingId))
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
      facts.push(...presenceFacts(snapshot, 'post'))
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
      facts.push(...presenceFacts(snapshot, 'expansion'))
      const rawProgressText: unknown = building?.constructionProgressText
      const progressText = isText(rawProgressText) ? rawProgressText : null
      status =
        progressText ??
        (built === null ? 'Parcel details are unavailable.' : 'The parcel is marked and graded.')
      break
    }
  }

  return {
    buildingId,
    label: BUILDING_LABELS[buildingId],
    role: BUILDING_ROLE[buildingId],
    status,
    attention,
    attentionNote,
    facts,
    commandOperation: commandCandidates.length === 1 ? commandCandidates[0]! : null,
    deepLabel: LOT_DEEP_SCREEN_LABEL[buildingId],
  }
}
