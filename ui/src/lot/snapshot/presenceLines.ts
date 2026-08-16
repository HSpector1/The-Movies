// ── Presence on the Lot V1 — what the inspectors SAY about this week ──────────
//
// One pure projection over the snapshot's presence field, shared by the person panel
// and the building panel so the two can never disagree about the same week.
//
// Strict, and fail-neutral by construction. A person the ENGINE withheld is absent from
// `presence.people`, so this returns null and the panel simply prints no presence line —
// while every already-accepted M1.5 employment fact keeps rendering from its own source.
// A person the engine claims but whose Calendar join did not agree keeps their placement
// facts (site, slot, credit) and loses only the three unproven strings; the sentence
// degrades to what is proven rather than inventing a title (laws 12 / 21).

import type {
  LotPresenceCredit,
  LotPresencePerson,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'

/** The verb the studio uses for each Calendar activity. */
const ACTIVITY_VERB: Readonly<Record<string, string>> = {
  drafting: 'Drafting',
  rewriting: 'Rewriting',
  auditioning: 'Auditioning for',
  development: 'Developing',
  preProduction: 'Preparing',
  rehearsal: 'Rehearsing',
  shooting: 'Shooting',
  postProduction: 'Cutting',
  releaseReady: 'Finishing',
}

/** What the person is credited as at the site, in the studio's own words. */
export const PRESENCE_CREDIT_LABEL: Readonly<Record<string, string>> = {
  writer: 'Writer',
  director: 'Director',
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
  craft: 'Craft',
  auditionee: 'Auditioning',
}

export function presenceCreditLabel(credit: LotPresenceCredit): string | null {
  return credit === null ? null : (PRESENCE_CREDIT_LABEL[credit] ?? null)
}

export type LotPresenceLine = {
  kind: 'at-site' | 'waiting' | 'roster'
  /** The one sentence the panel prints. */
  line: string
  creditLabel: string | null
  activityLabel: string | null
  workTitle: string | null
  facilityName: string | null
  /** The reserved slot, printed as a HUMAN number (slot 0 is "slot 1"). */
  slotNumber: number | null
  blockedReason: string | null
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/** Every presence record for one id — more than one is contradictory and withheld. */
function presenceRecords(
  snapshot: StudioLotSnapshot,
  talentId: string,
): LotPresencePerson[] {
  const presence = snapshot.presence
  if (presence === undefined || presence === null) return []
  if (!Array.isArray(presence.people)) return []
  return presence.people.filter(
    (person) => typeof person === 'object' && person !== null && person.talentId === talentId,
  )
}

/** Which beat the inspectors read. Falls back to the first beat, never to a guess. */
function staticBeatOf(snapshot: StudioLotSnapshot): number {
  const beat = snapshot.presence?.staticBeat
  return typeof beat === 'number' && Number.isInteger(beat) && beat >= 0 ? beat : 0
}

/**
 * What one named person's week says, as the person inspector prints it.
 *
 * Null means "this snapshot claims nothing about this person's week" — which is a
 * deliberate silence, not a failure, and never suppresses the rest of the panel.
 */
export function lotPersonPresenceLine(
  snapshot: StudioLotSnapshot,
  talentId: string,
): LotPresenceLine | null {
  const matches = presenceRecords(snapshot, talentId)
  if (matches.length !== 1) return null
  const person = matches[0]!
  const beats = Array.isArray(person.beats) ? person.beats : []
  const beat = beats[staticBeatOf(snapshot)]
  const creditLabel = presenceCreditLabel(person.credit)

  if (person.facilityId === null || person.engagement === 'roster') {
    return {
      kind: 'roster',
      line: 'On the studio roster this week — no workplace is claimed for them.',
      creditLabel,
      activityLabel: null,
      workTitle: null,
      facilityName: null,
      slotNumber: null,
      blockedReason: null,
    }
  }

  const slotNumber = typeof person.slot === 'number' && person.slot >= 0 ? person.slot + 1 : null

  if (beat === 'waiting') {
    // The engine's own queue reason, verbatim. The lot never rewords a blocker.
    const reason = isText(person.blockedReason) ? person.blockedReason : null
    return {
      kind: 'waiting',
      line: reason === null ? 'Waiting outside — the way in is blocked.' : `Waiting — ${reason}`,
      creditLabel,
      activityLabel: null,
      workTitle: isText(person.workTitle) ? person.workTitle : null,
      facilityName: isText(person.facilityName) ? person.facilityName : null,
      slotNumber,
      blockedReason: reason,
    }
  }

  // A claimed site whose OWN BEAT does not put the person there is contradictory truth.
  // The canvas parks such a person at home (`stanceForBeat` reads the same beat), so a
  // sentence saying they are at work would make the two surfaces disagree about one
  // week. Claim neither (laws 6 / 21). Unreachable from a well-formed projection: the
  // engine's working window covers the static beat for every legal departure stagger.
  if (beat !== 'at-site') return null

  const activityLabel = isText(person.activity) ? (ACTIVITY_VERB[person.activity] ?? null) : null
  const workTitle = isText(person.workTitle) ? person.workTitle : null
  const facilityName = isText(person.facilityName) ? person.facilityName : null
  const slotClause = slotNumber === null ? '' : `, slot ${String(slotNumber)}`

  const line =
    activityLabel !== null && workTitle !== null && facilityName !== null
      ? `${activityLabel} ${workTitle} at ${facilityName}${slotClause}`
      : facilityName !== null
        ? `At work at ${facilityName}${slotClause}`
        : creditLabel !== null
          ? `At work this week as ${creditLabel}${slotClause}`
          : `At work this week${slotClause}`

  return {
    kind: 'at-site',
    line,
    creditLabel,
    activityLabel,
    workTitle,
    facilityName,
    slotNumber,
    blockedReason: null,
  }
}

export type LotPresenceOccupant = {
  talentId: string
  name: string
  creditLabel: string | null
  waiting: boolean
  /** What they are working on, when the Calendar join proved it. */
  workTitle: string | null
}

/**
 * Who the engine says is at (or queued outside) a set of facilities this week — the
 * "Who's here this week" list the facility panel prints, in the engine's own order.
 */
export function lotFacilityPresenceOccupants(
  snapshot: StudioLotSnapshot,
  facilityIds: readonly string[],
): LotPresenceOccupant[] {
  const presence = snapshot.presence
  if (presence === undefined || presence === null || !Array.isArray(presence.people)) return []
  const wanted = new Set(facilityIds)
  const beat = staticBeatOf(snapshot)
  const occupants: LotPresenceOccupant[] = []
  const seen = new Set<string>()
  for (const person of presence.people) {
    if (typeof person !== 'object' || person === null) continue
    if (person.facilityId === null || !wanted.has(person.facilityId)) continue
    if (!isText(person.talentId) || !isText(person.name)) continue
    // A duplicated id in the projection is contradictory truth; claim neither copy.
    if (seen.has(person.talentId)) continue
    seen.add(person.talentId)
    const stance = Array.isArray(person.beats) ? person.beats[beat] : undefined
    if (stance !== 'at-site' && stance !== 'waiting') continue
    occupants.push({
      talentId: person.talentId,
      name: person.name,
      creditLabel: presenceCreditLabel(person.credit),
      waiting: stance === 'waiting',
      workTitle: isText(person.workTitle) ? person.workTitle : null,
    })
  }
  return occupants
}
