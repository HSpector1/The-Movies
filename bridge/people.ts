// P10A W0 — the player-safe PEOPLE projection (projection 18).
//
// One TypeScript projection owns everything Unity may know about a person
// (execution order §26–§27; visibility table docs/engineering/P10-INFORMATION-
// VISIBILITY-TABLE.md). Every field below is produced by exactly the selector the
// table names; nothing hidden (actual skills, ceilings, devRate, actual genre
// experience, the seed) is read here except through the public selectors that
// already reduce them (the scouted estimate band is the only trace of a ceiling).
//
// Laws:
//   * population = stable authoritative Talent records only (Actor, Director,
//     Writer, Craft); decorative extras/stagehands/grips/site crew have no record
//     and therefore no profile, no roster row and no attention (REQ-003/031);
//   * joins are by talentId only; same-name people stay distinct (REQ-022);
//   * an ambiguous/stale/duplicate assignment join fails CLOSED (`work.kind ===
//     'ambiguous'`) — never a guess (REQ-008 / design §31.1);
//   * every estimate carries `isEstimate` + its wording; OVR carries its
//     discipline (REQ-011/012);
//   * career rows are frozen `TalentCareerEvent` facts; legacy gaps say so
//     (REQ-020/021); no honors, no classification prose;
//   * attention is one highest-priority reason per person from existing truth
//     (renewal window, contract horizon, ambiguous work, presence block) — no
//     morale/relationship/training invention (REQ-019/040);
//   * returned data is freshly built per call (no reference into GameState).

import {
  capableButUnprovenLabels,
  careerIdentityLabel,
  employmentInfo,
  findConcept,
  talentAssignmentContext,
  talentProfile,
} from '../ui/src/engine/adapter.ts'
import type { GameState, TalentProfile } from '../ui/src/engine/adapter.ts'
import { studioPresence } from '../src/core/presence.ts'
import { DISCIPLINE_ORDER, ROLE_TO_DISCIPLINE } from '../src/core/tuning.ts'
import { guaranteedComp, activeContract, renewalWindowOpen } from '../src/core/employment.ts'
import type {
  CreativeRole,
  Discipline,
  EmploymentStatus,
  Genre,
  Talent,
  TalentCareerEvent,
} from '../src/core/types.ts'

// ── wire types ───────────────────────────────────────────────────────────────

export type BridgePersonDisciplineSnapshot = {
  discipline: Discipline
  label: string
  isPrimary: boolean
  /** Perceived craft summary for THIS discipline (roleOVR on perceived skills). */
  ovr: number
  tier: string
  /** ≥ 1 credited production in this discipline at a usable OVR. */
  proven: boolean
  /** Usable OVR but no credit yet — never shown as an established identity. */
  capableButUnproven: boolean
  /** Scouted estimate band (never the true ceiling). */
  potentialLow: number
  potentialHigh: number
  potentialTier: string
  isEstimate: true
  workHistory: number
}

export type BridgePersonSpecialtySnapshot = {
  discipline: Discipline
  genre: Genre
  label: string
  /** Perceived experience 0..100 (never actual). */
  perceived: number
}

export type BridgePersonContractSnapshot = {
  annualSalary: number
  weeklySalary: number
  signingBonus: number
  startWeek: number
  endWeekExclusive: number
  termWeeks: number
  remainingWeeks: number
  /** Guaranteed obligation remaining under the current terms. */
  guaranteedRemaining: number
  /** Early-release cost under CURRENT tuning (not permanent law). */
  terminationCost: number
  renewalOpen: boolean
  /** `Not open` · `Opens in N weeks` · `Renewal open` */
  renewalLine: string
}

export type BridgePersonEmploymentSnapshot = {
  status: EmploymentStatus
  statusLabel: string
  /** Available · Working · Engaged · Free agent · Unavailable */
  availability: string
  contract: BridgePersonContractSnapshot | null
  /** `Talent.salary`: market compensation per production — NOT a contract salary. */
  marketRatePerProduction: number
  /** One-film fee, only when an available freelancer. */
  freelancerFee: number | null
  /** Proposed contract terms exist (founding pool / hiring market) — nothing is signed by viewing. */
  offersAvailable: boolean
}

export type BridgePersonWorkSnapshot = {
  kind: 'available' | 'assigned' | 'ambiguous'
  assignmentKind: 'production' | 'script' | null
  assignmentId: string | null
  label: string | null
  /** Exact absence/ambiguity reason when not assigned. */
  reason: string | null
}

export type BridgePersonPresenceSnapshot = {
  onLot: boolean
  engagement: 'production' | 'script' | 'casting' | 'roster' | null
  credit: string | null
  facilityId: string | null
  facilityName: string | null
  blockedReason: string | null
  canLocate: boolean
  /** Exact reason Locate is absent (null when it is offered). */
  locateReason: string | null
}

export type BridgePersonAttentionTier = 'info' | 'attention' | 'decision' | 'blocking'

export type BridgePersonAttentionSnapshot = {
  tier: BridgePersonAttentionTier | null
  reason: string | null
  /** Stable key of the cohort this reason belongs to (see BridgePeopleAttentionSnapshot). */
  cohort: string | null
}

export type BridgePersonCareerRowSnapshot = {
  eventId: string
  filmId: string
  filmTitle: string
  releaseWeek: number
  genre: Genre
  roleLabel: string
  discipline: Discipline
  ovrBefore: number
  ovrAfter: number
  starPowerBefore: number
  starPowerAfter: number
  starPowerDelta: number
  genreExpBefore: number
  genreExpAfter: number
  reasonCodes: string[]
  /** The P07 durable result for this film exists (exact deep link by filmId). */
  resultAvailable: boolean
}

export type BridgePersonCareerSnapshot = {
  rows: BridgePersonCareerRowSnapshot[]
  /** Credits captured on released films (P07 participants) but without a frozen career event. */
  creditsWithoutEvents: number
  /** Films released without captured participants at all (global honest gap). */
  uncapturedFilms: number
  provenance: 'recorded' | 'partial' | 'notRecorded' | 'none'
  provenanceNotice: string | null
}

export type BridgePersonProfileSnapshot = {
  talentId: string
  name: string
  /** Another authoritative person shares this name — presentation must show the id. */
  nameShared: boolean
  profession: CreativeRole
  professionLabel: string
  primaryDiscipline: Discipline
  age: number
  authored: boolean
  /** Credited career identity from proven disciplines ("Actor / Writer"), or "No credited identity yet". */
  careerIdentityLabel: string
  capableButUnproven: string[]
  disciplines: BridgePersonDisciplineSnapshot[]
  specialties: BridgePersonSpecialtySnapshot[]
  specialtyLine: string
  workEthic: number
  workEthicLabel: string
  workEthicEffect: string
  temperament: string
  starPower: number
  starPowerDefinition: string
  potentialNotice: string
  employment: BridgePersonEmploymentSnapshot
  work: BridgePersonWorkSnapshot
  presence: BridgePersonPresenceSnapshot
  attention: BridgePersonAttentionSnapshot
  career: BridgePersonCareerSnapshot
}

export type BridgeRosterRowSnapshot = {
  talentId: string
  name: string
  nameShared: boolean
  profession: CreativeRole
  professionLabel: string
  careerIdentityLabel: string
  /** OVR shown WITH its discipline — a row never shows one OVR while sorting by another. */
  ovr: number
  ovrDiscipline: Discipline
  ovrDisciplineLabel: string
  ovrTier: string
  /** Every discipline's OVR for a discipline-labelled sort. */
  ovrByDiscipline: BridgeRosterOvrSnapshot[]
  starPower: number
  specialtyLine: string
  currentWork: string
  availability: string
  status: EmploymentStatus
  contractLine: string
  contractEndWeek: number | null
  attentionTier: BridgePersonAttentionTier | null
  attentionReason: string | null
  canLocate: boolean
  /** employed (contracted) · freelancer (engaged or available) · known (free agent / unavailable) */
  population: 'employed' | 'freelancer' | 'known'
}

export type BridgeRosterOvrSnapshot = { discipline: Discipline; label: string; ovr: number }

export type BridgeRosterSnapshot = {
  rows: BridgeRosterRowSnapshot[]
  counts: {
    employed: number
    freelancer: number
    known: number
    withAttention: number
  }
}

export type BridgePeopleAttentionCohortSnapshot = {
  key: string
  label: string
  tier: BridgePersonAttentionTier
  talentIds: string[]
}

export type BridgePeopleAttentionSnapshot = {
  /** Grouped by decision window / cause; a person appears in at most one cohort (highest tier). */
  cohorts: BridgePeopleAttentionCohortSnapshot[]
  currentWeek: number
}

export type BridgePeopleProjection = {
  profiles: BridgePersonProfileSnapshot[]
  roster: BridgeRosterSnapshot
  attention: BridgePeopleAttentionSnapshot
}

// ── copy (constant; the wire carries the definition with the number) ────────

export const WORK_ETHIC_EFFECT = 'Affects how readily credited work becomes lasting development.'
export const STAR_POWER_DEFINITION =
  'Public commercial recognition. Separate from craft (OVR) and from awards. Not a rank.'
export const POTENTIAL_NOTICE =
  'Scouted estimate; the true ceiling is not known and may sit outside this band.'
export const OVR_DEFINITION =
  'Perceived craft summary for one discipline — not Movie Quality, not role fit, not potential, not fame.'

const PROFESSION_LABEL: Record<CreativeRole, string> = {
  actor: 'Actor',
  director: 'Director',
  writer: 'Writer',
  craft: 'Craft',
}
const DISCIPLINE_LABEL: Record<Discipline, string> = {
  acting: 'Acting',
  writing: 'Writing',
  directing: 'Directing',
  craft: 'Craft',
}
const GENRE_LABEL: Record<Genre, string> = {
  comedy: 'Comedy',
  drama: 'Drama',
  crime: 'Crime',
  romance: 'Romance',
  horror: 'Horror',
  adventure: 'Adventure',
}
const STATUS_LABEL: Record<EmploymentStatus, string> = {
  contracted: 'Under contract',
  engagedFreelancer: 'Engaged freelancer',
  availableFreelancer: 'Available freelancer',
  freeAgent: 'Free agent',
  unavailable: 'Unavailable',
}
const ROLE_LABEL: Record<string, string> = {
  writer: 'Writer',
  director: 'Director',
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
  craft: 'Craft',
}
const ENGAGEMENTS = new Set(['production', 'script', 'casting', 'roster'])

/** Top specialty only when the lead over the next genre is meaningful (design §11). */
export const SPECIALTY_LEAD_MIN = 8
/** Contract-horizon warnings are ANALYSIS horizons, not legal windows (design §15). */
export const CONTRACT_HORIZONS_WEEKS = { decision: 12, attention: 26, info: 52 } as const

// ── projection ───────────────────────────────────────────────────────────────

export function peopleProjection(state: GameState): BridgePeopleProjection {
  const week = state.market.tick
  const presence = studioPresence(state)
  const presenceById = new Map(presence.people.map((p) => [p.talentId, p] as const))
  const withheld = new Map<string, string>()
  let globalWithholding: string | null = null
  for (const w of presence.withheld) {
    if (w.talentId === null) globalWithholding = w.reason
    else withheld.set(w.talentId, w.reason)
  }
  const facilityNameById = new Map<string, string>()
  for (const facility of state.operations?.facilities ?? []) {
    facilityNameById.set(facility.id, facility.name)
  }
  const resultIds = new Set(state.studio.releasedFilms.map((f) => f.productionId))
  const titleOf = (productionId: string): string => {
    const film = state.studio.releasedFilms.find((f) => f.productionId === productionId)
    const concept = findConcept(state, film?.conceptId ?? '')
    return concept?.title ?? productionId
  }
  // Credits captured on released films, per person (never inferred).
  const creditsById = new Map<string, number>()
  let uncapturedFilms = 0
  for (const film of state.studio.releasedFilms) {
    const participants = film.participants
    if (participants === undefined) {
      uncapturedFilms += 1
      continue
    }
    const bump = (id: string): void => {
      creditsById.set(id, (creditsById.get(id) ?? 0) + 1)
    }
    bump(participants.writer.talentId)
    bump(participants.director.talentId)
    bump(participants.cast.lead.talentId)
    bump(participants.cast.antagonist.talentId)
    bump(participants.cast.support.talentId)
    for (const craft of participants.craft) bump(craft.talentId)
  }
  const eventsById = new Map<string, TalentCareerEvent[]>()
  for (const event of state.careerEvents) {
    const list = eventsById.get(event.talentId) ?? []
    list.push(event)
    eventsById.set(event.talentId, list)
  }
  const nameCounts = new Map<string, number>()
  for (const t of state.talent) nameCounts.set(t.name, (nameCounts.get(t.name) ?? 0) + 1)

  const profiles: BridgePersonProfileSnapshot[] = []
  for (const talent of [...state.talent].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    const profile = talentProfile(state, talent.id)
    if (profile === undefined) continue
    profiles.push(
      buildProfile(state, talent, profile, {
        week,
        nameShared: (nameCounts.get(talent.name) ?? 0) > 1,
        presence: presenceById.get(talent.id) ?? null,
        withheldReason: withheld.get(talent.id) ?? globalWithholding,
        facilityNameById,
        resultIds,
        titleOf,
        credits: creditsById.get(talent.id) ?? 0,
        uncapturedFilms,
        events: eventsById.get(talent.id) ?? [],
      }),
    )
  }
  const roster = buildRoster(profiles)
  const attention = buildAttention(profiles, week)
  return { profiles, roster, attention }
}

type ProfileInputs = {
  week: number
  nameShared: boolean
  presence: ReturnType<typeof studioPresence>['people'][number] | null
  withheldReason: string | null
  facilityNameById: Map<string, string>
  resultIds: Set<string>
  titleOf: (productionId: string) => string
  credits: number
  uncapturedFilms: number
  events: TalentCareerEvent[]
}

function buildProfile(
  state: GameState,
  talent: Talent,
  profile: TalentProfile,
  input: ProfileInputs,
): BridgePersonProfileSnapshot {
  const primary = ROLE_TO_DISCIPLINE[talent.role]
  const identity = profile.careerIdentity
  const disciplines: BridgePersonDisciplineSnapshot[] = DISCIPLINE_ORDER.map((d) => {
    const summary = profile.disciplines.find((row) => row.discipline === d)!
    const standing = identity.disciplines.find((row) => row.discipline === d)
    return {
      discipline: d,
      label: DISCIPLINE_LABEL[d],
      isPrimary: d === primary,
      ovr: summary.ovr,
      tier: summary.tier,
      proven: standing?.proven ?? false,
      capableButUnproven: standing?.capableButUnproven ?? false,
      potentialLow: summary.potentialLow,
      potentialHigh: summary.potentialHigh,
      potentialTier: summary.potentialTier,
      isEstimate: true,
      workHistory: summary.workHistory,
    }
  })
  const specialties = topSpecialties(profile, primary)
  const specialtyLine =
    specialties.length === 0
      ? 'No clear specialty'
      : `Top specialty: ${specialties.map((s) => s.label).join(' · ')}`
  const employment = buildEmployment(state, talent, input.week)
  const work = buildWork(state, talent.id)
  const presence = buildPresence(input)
  const career = buildCareer(input)
  const attention = decideAttention(employment, work, presence, input.week)
  const identityLabel = careerIdentityLabel(identity)
  return {
    talentId: talent.id,
    name: talent.name,
    nameShared: input.nameShared,
    profession: talent.role,
    professionLabel: PROFESSION_LABEL[talent.role],
    primaryDiscipline: primary,
    age: talent.age,
    authored: talent.authored,
    careerIdentityLabel: identityLabel.length > 0 ? identityLabel : 'No credited identity yet',
    capableButUnproven: capableButUnprovenLabels(identity),
    disciplines,
    specialties,
    specialtyLine,
    workEthic: talent.workEthic,
    workEthicLabel: profile.workEthicLabel,
    workEthicEffect: WORK_ETHIC_EFFECT,
    temperament: profile.temperament,
    starPower: talent.fame,
    starPowerDefinition: STAR_POWER_DEFINITION,
    potentialNotice: POTENTIAL_NOTICE,
    employment,
    work,
    presence,
    attention,
    career,
  }
}

function topSpecialties(profile: TalentProfile, primary: Discipline): BridgePersonSpecialtySnapshot[] {
  const cells = [...profile.genreExperience[primary]].sort(
    (a, b) => b.perceived - a.perceived || (a.genre < b.genre ? -1 : 1),
  )
  if (cells.length === 0) return []
  const first = cells[0]!
  const third = cells[2]
  // A meaningful lead: the top genre clears the third-best by the minimum, and it is non-zero.
  if (first.perceived <= 0) return []
  if (third !== undefined && first.perceived - third.perceived < SPECIALTY_LEAD_MIN) return []
  const picked = cells.slice(0, 2).filter((c) => c.perceived > 0 && first.perceived - c.perceived < SPECIALTY_LEAD_MIN)
  return picked.map((c) => ({ discipline: primary, genre: c.genre, label: GENRE_LABEL[c.genre], perceived: c.perceived }))
}

function buildEmployment(state: GameState, talent: Talent, week: number): BridgePersonEmploymentSnapshot {
  const info = employmentInfo(state, talent.id)
  const contract = activeContract(state, talent.id)
  const wire: BridgePersonContractSnapshot | null =
    info.contract && contract
      ? {
          annualSalary: info.contract.annualSalary,
          weeklySalary: info.contract.weeklySalary,
          signingBonus: info.contract.signingBonus,
          startWeek: info.contract.startWeek,
          endWeekExclusive: info.contract.endWeekExclusive,
          termWeeks: info.contract.termWeeks,
          remainingWeeks: info.contract.remainingWeeks,
          guaranteedRemaining: Math.round(guaranteedComp(contract, week)),
          terminationCost: info.contract.terminationCost,
          renewalOpen: info.contract.renewalOpen,
          renewalLine: renewalLine(contract.endWeekExclusive, week, renewalWindowOpen(contract, week)),
        }
      : null
  return {
    status: info.status,
    statusLabel: STATUS_LABEL[info.status],
    availability: availabilityOf(info.status),
    contract: wire,
    marketRatePerProduction: talent.salary,
    freelancerFee: info.freelancerFee,
    offersAvailable: info.offerOptions.length > 0,
  }
}

function renewalLine(endWeekExclusive: number, week: number, open: boolean): string {
  if (open) return 'Renewal open'
  const opensIn = endWeekExclusive - CONTRACT_HORIZONS_WEEKS.decision - week
  return opensIn > 0 ? `Opens in ${String(opensIn)} weeks` : 'Not open'
}

function availabilityOf(status: EmploymentStatus): string {
  switch (status) {
    case 'contracted':
      return 'Available' // refined by current work below (Working)
    case 'engagedFreelancer':
      return 'Engaged'
    case 'availableFreelancer':
      return 'Available'
    case 'freeAgent':
      return 'Free agent'
    case 'unavailable':
      return 'Unavailable'
  }
}

function buildWork(state: GameState, talentId: string): BridgePersonWorkSnapshot {
  const context = talentAssignmentContext(state, talentId)
  if (context.kind === 'assigned') {
    return {
      kind: 'assigned',
      assignmentKind: context.assignment.kind,
      assignmentId: context.assignment.assignmentId,
      label: context.assignment.label,
      reason: null,
    }
  }
  if (context.kind === 'ambiguous') {
    return {
      kind: 'ambiguous',
      assignmentKind: null,
      assignmentId: null,
      label: null,
      reason: 'Current work could not be determined from the studio records.',
    }
  }
  return { kind: 'available', assignmentKind: null, assignmentId: null, label: null, reason: 'No current assignment.' }
}

function buildPresence(input: ProfileInputs): BridgePersonPresenceSnapshot {
  if (input.withheldReason !== null && input.presence === null) {
    return {
      onLot: false,
      engagement: null,
      credit: null,
      facilityId: null,
      facilityName: null,
      blockedReason: null,
      canLocate: false,
      locateReason: `Presence withheld: ${input.withheldReason}`,
    }
  }
  const p = input.presence
  if (p === null) {
    return {
      onLot: false,
      engagement: null,
      credit: null,
      facilityId: null,
      facilityName: null,
      blockedReason: null,
      canLocate: false,
      locateReason: 'Not on the lot this week.',
    }
  }
  const engagement = ENGAGEMENTS.has(p.engagement) ? (p.engagement as BridgePersonPresenceSnapshot['engagement']) : null
  return {
    onLot: true,
    engagement,
    credit: p.credit,
    facilityId: p.site,
    facilityName: p.site === null ? null : (input.facilityNameById.get(p.site) ?? null),
    blockedReason: p.blockedReason,
    canLocate: true,
    locateReason: null,
  }
}

function buildCareer(input: ProfileInputs): BridgePersonCareerSnapshot {
  const rows: BridgePersonCareerRowSnapshot[] = [...input.events]
    .sort((a, b) => a.releaseWeek - b.releaseWeek || (a.eventId < b.eventId ? -1 : 1))
    .map((e) => ({
      eventId: e.eventId,
      filmId: e.filmId,
      filmTitle: e.filmTitle,
      releaseWeek: e.releaseWeek,
      genre: e.genre,
      roleLabel: ROLE_LABEL[e.role] ?? e.role,
      discipline: e.discipline,
      ovrBefore: e.ovrBefore,
      ovrAfter: e.ovrAfter,
      starPowerBefore: e.starPowerBefore,
      starPowerAfter: e.starPowerAfter,
      starPowerDelta: e.starPowerDelta,
      genreExpBefore: e.genreExpBefore,
      genreExpAfter: e.genreExpAfter,
      reasonCodes: [...e.reasonCodes],
      resultAvailable: input.resultIds.has(e.filmId),
    }))
  const creditsWithoutEvents = Math.max(0, input.credits - rows.length)
  let provenance: BridgePersonCareerSnapshot['provenance']
  let notice: string | null
  if (rows.length === 0 && input.credits === 0) {
    if (input.uncapturedFilms > 0) {
      provenance = 'notRecorded'
      notice = `Not recorded: ${String(input.uncapturedFilms)} earlier ${input.uncapturedFilms === 1 ? 'film has' : 'films have'} no captured participants, so this person's part in them is unknown.`
    } else {
      provenance = 'none'
      notice = null
    }
  } else if (creditsWithoutEvents > 0) {
    provenance = 'partial'
    notice = `Partial attribution: ${String(creditsWithoutEvents)} credited ${creditsWithoutEvents === 1 ? 'film has' : 'films have'} no recorded career change (pre-history save).`
  } else {
    provenance = 'recorded'
    notice = null
  }
  return { rows, creditsWithoutEvents, uncapturedFilms: input.uncapturedFilms, provenance, provenanceNotice: notice }
}

function decideAttention(
  employment: BridgePersonEmploymentSnapshot,
  work: BridgePersonWorkSnapshot,
  presence: BridgePersonPresenceSnapshot,
  week: number,
): BridgePersonAttentionSnapshot {
  // Highest tier first; one reason per person.
  if (work.kind === 'ambiguous') {
    return { tier: 'blocking', reason: work.reason, cohort: 'work-ambiguous' }
  }
  if (presence.onLot && presence.blockedReason !== null) {
    return { tier: 'attention', reason: presence.blockedReason, cohort: 'presence-blocked' }
  }
  const c = employment.contract
  if (c !== null) {
    if (c.renewalOpen) {
      return {
        tier: 'decision',
        reason: `Renewal window open — contract ends Week ${String(c.endWeekExclusive)}.`,
        cohort: 'renewal-open',
      }
    }
    if (c.remainingWeeks <= CONTRACT_HORIZONS_WEEKS.attention) {
      return {
        tier: 'attention',
        reason: `Contract ends in ${String(c.remainingWeeks)} weeks (Week ${String(c.endWeekExclusive)}).`,
        cohort: 'contract-ends-26',
      }
    }
    if (c.remainingWeeks <= CONTRACT_HORIZONS_WEEKS.info) {
      return {
        tier: 'info',
        reason: `Contract ends within a year (Week ${String(c.endWeekExclusive)}).`,
        cohort: 'contract-ends-52',
      }
    }
  }
  void week
  return { tier: null, reason: null, cohort: null }
}

function buildRoster(profiles: BridgePersonProfileSnapshot[]): BridgeRosterSnapshot {
  const rows: BridgeRosterRowSnapshot[] = profiles.map((p) => {
    const primary = p.disciplines.find((d) => d.isPrimary)!
    const population: BridgeRosterRowSnapshot['population'] =
      p.employment.status === 'contracted'
        ? 'employed'
        : p.employment.status === 'engagedFreelancer' || p.employment.status === 'availableFreelancer'
          ? 'freelancer'
          : 'known'
    const availability =
      p.employment.status === 'contracted' && p.work.kind === 'assigned'
        ? 'Working'
        : p.work.kind === 'ambiguous'
          ? 'Unknown'
          : p.employment.availability
    return {
      talentId: p.talentId,
      name: p.name,
      nameShared: p.nameShared,
      profession: p.profession,
      professionLabel: p.professionLabel,
      careerIdentityLabel: p.careerIdentityLabel,
      ovr: primary.ovr,
      ovrDiscipline: primary.discipline,
      ovrDisciplineLabel: primary.label,
      ovrTier: primary.tier,
      ovrByDiscipline: p.disciplines.map((d) => ({ discipline: d.discipline, label: d.label, ovr: d.ovr })),
      starPower: p.starPower,
      specialtyLine: p.specialtyLine,
      currentWork: p.work.kind === 'assigned' ? (p.work.label ?? '') : p.work.kind === 'ambiguous' ? 'Unknown' : 'Available',
      availability,
      status: p.employment.status,
      contractLine: contractLine(p.employment),
      contractEndWeek: p.employment.contract?.endWeekExclusive ?? null,
      attentionTier: p.attention.tier,
      attentionReason: p.attention.reason,
      canLocate: p.presence.canLocate,
      population,
    }
  })
  return {
    rows,
    counts: {
      employed: rows.filter((r) => r.population === 'employed').length,
      freelancer: rows.filter((r) => r.population === 'freelancer').length,
      known: rows.filter((r) => r.population === 'known').length,
      withAttention: rows.filter((r) => r.attentionTier !== null).length,
    },
  }
}

function contractLine(employment: BridgePersonEmploymentSnapshot): string {
  const c = employment.contract
  if (c !== null) return `Under contract through Week ${String(c.endWeekExclusive)} · ${c.renewalLine}`
  switch (employment.status) {
    case 'engagedFreelancer':
      return 'Freelancer · engaged on one film'
    case 'availableFreelancer':
      return 'Freelancer · available'
    case 'freeAgent':
      return 'Free agent · no contract'
    default:
      return 'No contract'
  }
}

const COHORT_LABEL: Record<string, { label: string; tier: BridgePersonAttentionTier; order: number }> = {
  'work-ambiguous': { label: 'Current work could not be determined', tier: 'blocking', order: 0 },
  'presence-blocked': { label: 'Blocked on the lot this week', tier: 'attention', order: 1 },
  'renewal-open': { label: 'Renewal window open', tier: 'decision', order: 2 },
  'contract-ends-26': { label: 'Contracts ending within 26 weeks', tier: 'attention', order: 3 },
  'contract-ends-52': { label: 'Contracts ending within a year', tier: 'info', order: 4 },
}

function buildAttention(profiles: BridgePersonProfileSnapshot[], week: number): BridgePeopleAttentionSnapshot {
  const byCohort = new Map<string, string[]>()
  for (const p of profiles) {
    if (p.attention.cohort === null) continue
    const list = byCohort.get(p.attention.cohort) ?? []
    list.push(p.talentId)
    byCohort.set(p.attention.cohort, list)
  }
  const cohorts = [...byCohort.entries()]
    .map(([key, talentIds]) => ({ key, label: COHORT_LABEL[key]!.label, tier: COHORT_LABEL[key]!.tier, talentIds }))
    .sort((a, b) => COHORT_LABEL[a.key]!.order - COHORT_LABEL[b.key]!.order)
  return { cohorts, currentWeek: week }
}
