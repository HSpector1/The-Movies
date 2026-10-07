import { screenplayFactsMatch } from './scriptDevelopment.js'
import type {
  CastingSession,
  CastingSessions,
  CastSlot,
  CreativeRole,
  Discipline,
  FilmConcept,
  Production,
  ScriptDevelopment,
  ScriptProject,
  Talent,
} from './types.js'

// Pure admission stages. Callers supply current employment/occupancy facts and
// retain ownership of forecast, fees, identity, allocation and state commitment.
export type AssignmentPerson = Pick<Talent, 'id' | 'skills'>

export type GreenlightStaffingChoice = Readonly<{
  writerId: string
  directorId: string
  craftIds: readonly string[]
  cast: Readonly<Record<CastSlot, string>>
}>

export type GreenlightScreenplayChoice =
  Readonly<Pick<Production, 'conceptId' | 'writerId' | 'shape' | 'promise'>>

export type GreenlightHeaderFacts = Readonly<{
  foundingOpen: boolean
  concepts: readonly FilmConcept[]
  development: Readonly<{
    mode: ScriptDevelopment['mode']
    projects: readonly ScriptProject[]
  }>
  casting: Readonly<{
    mode: CastingSessions['mode']
    sessions: readonly CastingSession[]
  }>
}>

export type GreenlightHeader = Readonly<{
  concept: FilmConcept
  scriptProject: ScriptProject | undefined
}>

export type GreenlightStaffing<T extends AssignmentPerson> = Readonly<{
  writer: T
  director: T
  cast: Readonly<Record<CastSlot, T>>
  craftHires: readonly T[]
  engaged: readonly T[]
  engagedIds: readonly string[]
}>

export type GreenlightEmploymentFacts = Readonly<{
  contractedIds: ReadonlySet<string>
  freelancerIds: ReadonlySet<string>
}>

export type CommissionWriterFacts<T extends AssignmentPerson> = Readonly<{
  foundingOpen: boolean
  talent: readonly T[]
  isCurrentlyContracted: (personId: string) => boolean
  busyIds: () => ReadonlySet<string>
}>

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support']

// D-9 / OQ-1: assignment eligibility is profile presence, not primary role.
const ROLE_DISCIPLINE: Record<CreativeRole, Discipline> = {
  writer: 'writing',
  director: 'directing',
  actor: 'acting',
  craft: 'craft',
  scientist: 'research',
}

export function requireTalent<T extends AssignmentPerson>(
  talent: readonly T[], id: string, label: string,
): T {
  const found = talent.find((person) => person.id === id)
  if (found === undefined) {
    throw new Error(`applyActions: ${label} references unknown talent id "${id}"`)
  }
  return found
}

function requireRole(person: AssignmentPerson, role: CreativeRole, label: string): void {
  const discipline = ROLE_DISCIPLINE[role]
  if (person.skills[discipline] === undefined) {
    throw new Error(
      `applyActions: ${label} talent "${person.id}" lacks a "${discipline}" skill profile (has-discipline check)`,
    )
  }
}

export function requireGreenlightHeader(
  facts: GreenlightHeaderFacts,
  choice: GreenlightScreenplayChoice,
  scriptProjectId?: string,
): GreenlightHeader {
  const scriptProject = scriptProjectId === undefined
    ? undefined
    : facts.development.projects.find((project) => project.id === scriptProjectId)
  if (facts.development.mode === 'managed') {
    if (scriptProject === undefined || scriptProject.status !== 'ready' || scriptProject.assessment === null) {
      throw new Error(
        'applyActions: greenlight rejected — managed studios must greenlight an authoritative Ready script project',
      )
    }
    if (!screenplayFactsMatch(scriptProject, choice)) {
      throw new Error(
        `applyActions: greenlight rejected — package facts disagree with Ready script project "${scriptProject.id}"`,
      )
    }
    const castingSession = facts.casting.sessions.find(
      (session) => session.projectId === scriptProject.id,
    )
    if (
      facts.casting.mode === 'managed' &&
      castingSession !== undefined &&
      castingSession.status !== 'complete'
    ) {
      throw new Error(
        `applyActions: greenlightScriptProject rejected — casting session "${castingSession.id}" must be reviewed and acknowledged first`,
      )
    }
  } else if (scriptProjectId !== undefined) {
    throw new Error(
      'applyActions: greenlightScriptProject rejected — screenplay development is not managed',
    )
  }

  if (facts.foundingOpen) {
    throw new Error('applyActions: greenlight rejected — the studio is still in its founding draft (D-11)')
  }
  const concept = facts.concepts.find((candidate) => candidate.id === choice.conceptId)
  if (concept === undefined) {
    throw new Error(`applyActions: greenlight references unknown conceptId "${choice.conceptId}"`)
  }
  if (choice.promise.genre !== concept.genre) {
    throw new Error(
      `applyActions: greenlight promise.genre "${choice.promise.genre}" ≠ concept.genre "${concept.genre}"`,
    )
  }
  return { concept, scriptProject }
}

export function resolveGreenlightStaffing<T extends AssignmentPerson>(
  talent: readonly T[], choice: GreenlightStaffingChoice,
): GreenlightStaffing<T> {
  // Person/profile diagnostics run writer, director, cast, then craft.
  const writer = requireTalent(talent, choice.writerId, 'greenlight writerId')
  requireRole(writer, 'writer', 'greenlight writerId')
  const director = requireTalent(talent, choice.directorId, 'greenlight directorId')
  requireRole(director, 'director', 'greenlight directorId')
  const resolveCast = (slot: CastSlot): T => {
    const person = requireTalent(talent, choice.cast[slot], `greenlight cast.${slot}`)
    requireRole(person, 'actor', `greenlight cast.${slot}`)
    return person
  }
  const cast = {
    lead: resolveCast('lead'),
    antagonist: resolveCast('antagonist'),
    support: resolveCast('support'),
  }
  const craftHires = choice.craftIds.map((id, index) => {
    const person = requireTalent(talent, id, `greenlight craftIds[${index}]`)
    requireRole(person, 'craft', `greenlight craftIds[${index}]`)
    return person
  })

  const castIds = CAST_SLOTS.map((slot) => choice.cast[slot])
  if (new Set(castIds).size !== castIds.length) {
    throw new Error(
      `applyActions: greenlight assigns the same actor to more than one cast slot (${castIds.join(', ')})`,
    )
  }
  // Collision diagnostics deliberately use writer, director, CRAFT, then cast.
  // Credit does not reserve the writer, but still cannot double as another role
  // on this same picture (M16.7).
  const roleAssignments: { id: string; role: string }[] = [
    { id: choice.writerId, role: 'writerId' },
    { id: choice.directorId, role: 'directorId' },
    ...choice.craftIds.map((id, index) => ({ id, role: `craftIds[${index}]` })),
    ...CAST_SLOTS.map((slot) => ({ id: choice.cast[slot], role: `cast.${slot}` })),
  ]
  const seenRoleById = new Map<string, string>()
  for (const { id, role } of roleAssignments) {
    const priorRole = seenRoleById.get(id)
    if (priorRole !== undefined) {
      throw new Error(
        `applyActions: greenlight assigns talent "${id}" to more than one role in the same production ` +
          `(${priorRole} and ${role}) — a talent fills exactly one role in one production (M16)`,
      )
    }
    seenRoleById.set(id, role)
  }

  // P04A.2/P04A.3: permanent writer credit is not engaged occupancy or labour.
  // Both gates walk the third fixed order: director, cast, then craft.
  const engaged = [director, cast.lead, cast.antagonist, cast.support, ...craftHires]
  return {
    writer, director, cast, craftHires, engaged,
    engagedIds: [choice.directorId, ...castIds, ...choice.craftIds],
  }
}

export function assertGreenlightStaffingIdle(
  engagedIds: readonly string[], busyIds: ReadonlySet<string>,
): void {
  for (const id of engagedIds) {
    if (busyIds.has(id)) {
      throw new Error(
        `applyActions: greenlight talent "${id}" is already engaged in an active production (exclusivity, M16)`,
      )
    }
  }
}

export function assertGreenlightCraftLead(craftCount: number): void {
  if (craftCount !== 1) {
    throw new Error(
      `applyActions: greenlight rejected — a film requires exactly one Production/Craft Lead (got ${craftCount}) (D-11.13)`,
    )
  }
}

export function greenlightFreelancers<T extends AssignmentPerson>(
  engaged: readonly T[], facts: GreenlightEmploymentFacts,
): readonly T[] {
  const freelancers: T[] = []
  for (const person of engaged) {
    if (facts.contractedIds.has(person.id)) continue
    if (!facts.freelancerIds.has(person.id)) {
      throw new Error(
        `applyActions: greenlight rejected — talent "${person.id}" is neither studio-contracted nor an available freelancer (D-11.12)`,
      )
    }
    freelancers.push(person)
  }
  return freelancers
}

export function requireCommissionableWriter<T extends AssignmentPerson>(
  facts: CommissionWriterFacts<T>, writerId: string, verb: string,
): T {
  if (facts.foundingOpen) {
    throw new Error(`applyActions: ${verb} rejected — the studio is still in its founding draft`)
  }
  const writer = requireTalent(facts.talent, writerId, `${verb} writerId`)
  requireRole(writer, 'writer', `${verb} writerId`)
  if (!facts.isCurrentlyContracted(writer.id)) {
    throw new Error(
      `applyActions: ${verb} rejected — writer "${writer.id}" is not currently studio-contracted`,
    )
  }
  if (facts.busyIds().has(writer.id)) {
    throw new Error(
      `applyActions: ${verb} rejected — writer "${writer.id}" already has an active assignment`,
    )
  }
  return writer
}
