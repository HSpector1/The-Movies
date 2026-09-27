// Evaluator7's bounded one-event paths. No allocation, mutation, RNG or second clock.
import { assignmentRefusal } from './careerLifecycle.js'
import { activeContract } from './employment.js'
import { occupiedResourceSlots, resourceClaimsOf } from './occupancy.js'
import { productionCompanyTalentIds } from './productionPeople.js'
import { scriptProjectWriterIds } from './scriptDevelopment.js'
import { takeSubjectOwner } from './firstTakeSubjects.js'
import { GENRE_ORDER } from './tuning.js'
import type { PromiseDraft, PromisePredicate } from './promises.js'
import type { CastSlot, FirstTakeSubject, GameState, OpportunityPredicate, Production, ProfessionalPromise, PromiseClassification, ScriptProject } from './types.js'

export const OPPORTUNITY_PROMISE_RULES_VERSION = 7
export const isOpportunityPredicate = (predicate: PromisePredicate): predicate is OpportunityPredicate =>
  'kind' in predicate && (predicate.kind === 'genreOpportunity' || predicate.kind === 'projectOpportunity')
export const opportunitySlots = (predicate: OpportunityPredicate): readonly CastSlot[] =>
  predicate.seatClass === 'allCast' ? ['lead', 'antagonist', 'support']
    : predicate.seatClass === 'lead' ? ['lead'] : ['lead', 'antagonist']

/** Shape is explicit. A numeric version never upgrades historical count-only work. */
export function opportunityPredicateRefusal(family: string, predicate: PromisePredicate): string | null {
  const genre = family === 'PREFERRED_GENRE_OPPORTUNITY', project = family === 'SPECIFIC_PROJECT'
  if (!genre && !project && !isOpportunityPredicate(predicate)) return null
  if (!isOpportunityPredicate(predicate) || (genre ? predicate.kind !== 'genreOpportunity'
    : !project || predicate.kind !== 'projectOpportunity')) return 'an opportunity requires its exact family-specific predicate and selected cast class'
  const keys = ['kind', 'count', 'seatClass', predicate.kind === 'genreOpportunity' ? 'genre' : 'scriptProjectId']
  if (Object.keys(predicate).length !== keys.length || keys.some(key => !Object.hasOwn(predicate, key))) {
    return 'an opportunity predicate must contain exactly its selected material fields'
  }
  if (predicate.count !== 1) return 'an opportunity promises exactly one picture'
  if (!['allCast', 'lead', 'leadOrAntagonist'].includes(predicate.seatClass)) return 'an opportunity needs a selected cast class'
  if (predicate.kind === 'genreOpportunity' && !(GENRE_ORDER as readonly string[]).includes(predicate.genre)) return 'an opportunity needs a catalogue genre'
  if (predicate.kind === 'projectOpportunity' && (typeof predicate.scriptProjectId !== 'string' || predicate.scriptProjectId.trim() === '')) return 'an opportunity needs an exact script project ID'
  return null
}

export function opportunitySubjectMatches(predicate: OpportunityPredicate, subject: FirstTakeSubject | undefined): boolean {
  return subject !== undefined && (predicate.kind === 'genreOpportunity'
    ? subject.genre === predicate.genre : subject.scriptProjectId === predicate.scriptProjectId)
}

export function opportunityProductionMatches(state: GameState, issuer: string, predicate: OpportunityPredicate, production: Production): boolean {
  const owner = takeSubjectOwner(state, issuer)
  return predicate.kind === 'genreOpportunity'
    ? owner?.concepts.find(row => row.id === production.conceptId)?.genre === predicate.genre
    : owner?.development.projects.some(row => row.id === predicate.scriptProjectId
      && row.productionId === production.id && row.conceptId === production.conceptId) === true
}

export function opportunityReservations(state: GameState, draft: PromiseDraft, from: number): readonly ProfessionalPromise[] | undefined {
  const attached = new Set(state.talentMarket.proposals.flatMap(row => row.promises))
  const rows = state.promises.filter(row => row.outcome === null && row.progress < row.predicate.count
    && (row.contractId !== null || attached.has(row.promiseId)) && row.promiseId !== draft.promiseId
    && row.dueWeekExclusive > from && row.windowStartWeek < draft.dueWeekExclusive
    && (row.beneficiaryPersonId === draft.beneficiaryPersonId || row.issuerStudioId === draft.issuerStudioId))
  return isOpportunityPredicate(draft.predicate) || rows.some(row => isOpportunityPredicate(row.predicate)) ? rows : undefined
}

function owners(state: GameState) {
  return [{ studioId: state.hollywood?.playerStudioId ?? '', productions: state.studio.activeProductions, development: state.scriptDevelopment },
    ...(state.hollywood?.businesses.map(row => ({ studioId: row.studioId, productions: row.productions, development: row.development })) ?? [])]
}
const earliestTake = (p: Production, week: number): number => week + Math.max(1, p.remainingTicks - 4) + (p.startTick >= week ? 1 : 0)
const earliestRelease = (p: Production, week: number): number => week + Math.max(1, p.remainingTicks) + (p.startTick >= week ? 1 : 0)
const compareId = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0

/** Include the actual owners needed by the new policy, without changing old4/6 tuples. */
export function opportunityFeasibilityInputs(state: GameState, draft: PromiseDraft): readonly unknown[] {
  const player = draft.issuerStudioId === state.hollywood?.playerStudioId
  const business = state.hollywood?.businesses.find(row => row.studioId === draft.issuerStudioId)
  return ['opportunityScope', draft.predicate,
    owners(state).map(owner => [owner.studioId, owner.development, owner.productions]),
    state.concepts.map(row => [row.id, row.genre]), state.hollywood?.concepts.map(row => [row.id, row.genre]) ?? [],
    player ? state.castingSessions : null,
    player ? state.operations : business?.operations ?? null,
    resourceClaimsOf(occupiedResourceSlots(player ? state : { operations: business?.operations, scriptDevelopment: business?.development }))
      .map(row => [row.kind, row.facilityId, row.slot, row.capability, row.owner, row.ownerId]),
    // Rival staffing's actual busyTalentIds owner has no supported research release clock.
    player ? [] : state.technology.projects.filter(row => row.status === 'active')
      .map(row => [row.id, row.seats.filter(seat => seat.releasedWeek === null
        && activeContract(state, seat.talentId) !== undefined).map(seat => seat.talentId)]),
  ]
}

type Path = { id: string; production: Production | null; takeWeek: number; freshWeek: number; physical: string | null; uncertainty: string | null }
const impossiblePath = (id: string, reason: string): Path =>
  ({ id, production: null, takeWeek: Infinity, freshWeek: Infinity, physical: reason, uncertainty: null })

function releaseFloor(state: GameState, personId: string, week: number, exempt: Production | null): { week: number; uncertainty: string | null } {
  let floor = week, uncertainty: string | null = null
  for (const owner of owners(state)) {
    for (const production of owner.productions) {
      if (production !== exempt && productionCompanyTalentIds([production]).has(personId)) floor = Math.max(floor, earliestRelease(production, week))
    }
    for (const project of owner.development.projects) {
      if ((project.status === 'drafting' || project.status === 'rewriting') && scriptProjectWriterIds(project).includes(personId)) {
        if (project.dueWeek === null) uncertainty = 'an active writing assignment has no committed completion boundary'
        else floor = Math.max(floor, project.dueWeek)
      }
    }
  }
  return { week: floor, uncertainty }
}

function resourceUncertainty(state: GameState, issuer: string, project: ScriptProject | null, freshWeek: number): string | null {
  const player = issuer === state.hollywood?.playerStudioId
  const business = state.hollywood?.businesses.find(row => row.studioId === issuer)
  const operations = player ? state.operations : business?.operations
  const claims = resourceClaimsOf(occupiedResourceSlots(player ? state : { operations, scriptDevelopment: business?.development }))
  const session = player && project !== null ? state.castingSessions.sessions.find(row => row.projectId === project.id) : undefined
  for (const capability of ['development-casting', 'soundstage', 'set-scenery', 'post'] as const) {
    const available = operations?.facilities.filter(row => row.capability === capability).some(facility =>
      Array.from({ length: facility.capacity }, (_, slot) => slot).some(slot => !claims.some(claim => {
        if (claim.kind !== 'facility' || claim.facilityId !== facility.id || (claim.slot !== null && claim.slot !== slot)) return false
        if (claim.owner === 'screenplay' && project !== null && claim.ownerId === project.id
          && project.dueWeek !== null && project.dueWeek <= freshWeek) return false
        if (claim.owner === 'castingSession' && session !== undefined && claim.ownerId === session.id
          && session.dueWeek !== null && session.dueWeek <= freshWeek) return false
        return true
      }))) === true
    if (!available) return `existing ${capability} capacity is not available for this opportunity`
  }
  return null
}

function paths(state: GameState, draft: PromiseDraft & { predicate: OpportunityPredicate }, week: number, capped: boolean, notBefore = week): Path[] {
  const owner = takeSubjectOwner(state, draft.issuerStudioId), predicate = draft.predicate
  if (owner === undefined) return [impossiblePath('', 'the issuing studio has no project authority')]
  const matching = predicate.kind === 'projectOpportunity'
    ? owner.development.projects.filter(row => row.id === predicate.scriptProjectId)
    : owner.development.projects.filter(row => owner.concepts.find(concept => concept.id === row.conceptId)?.genre === predicate.genre)
  if (predicate.kind === 'projectOpportunity' && matching.length === 0) return [impossiblePath(predicate.scriptProjectId, 'the named script project does not belong to this studio')]
  const rows: Path[] = []
  const person = draft.beneficiaryPersonId, slots = opportunitySlots(predicate)
  for (const project of matching) {
    if (project.status === 'produced') { rows.push(impossiblePath(project.id, 'the named script project has already been produced')); continue }
    if (project.productionId !== null || project.status === 'inProduction') {
      const production = owner.productions.find(row => row.id === project.productionId)
      if (production === undefined || production.remainingTicks < 5 || state.firstTakes.some(row => row.productionId === production.id)
        || !slots.some(slot => production.cast[slot] === person)) {
        rows.push(impossiblePath(project.id, 'the fixed project has no qualifying pre-take cast seat')); continue
      }
      const operations = draft.issuerStudioId === state.hollywood?.playerStudioId ? state.operations
        : state.hollywood?.businesses.find(row => row.studioId === draft.issuerStudioId)?.operations
      const workflow = operations?.workflows.find(row => row.productionId === production.id)
      rows.push({ id: project.id, production, takeWeek: Math.max(draft.windowStartWeek, earliestTake(production, week)), freshWeek: week,
        physical: null, uncertainty: workflow?.blocker === null || workflow === undefined ? null : 'the held project has an unresolved production blocker' })
      continue
    }
    if (project.writerId === person) { rows.push(impossiblePath(project.id, 'the credited writer cannot hold a cast seat in the same picture')); continue }
    const release = releaseFloor(state, person, week, null)
    let freshWeek = Math.max(week, draft.startWeek, release.week, notBefore), uncertainty = release.uncertainty
    if (project.status === 'drafting' || project.status === 'rewriting') {
      if (project.dueWeek === null || project.reservation === null) uncertainty = 'the screenplay has no committed completion reservation'
      else freshWeek = Math.max(freshWeek, project.dueWeek)
    } else if (project.assessment === null) uncertainty = 'the screenplay has no completed assessment'
    const session = draft.issuerStudioId === state.hollywood?.playerStudioId
      ? state.castingSessions.sessions.find(row => row.projectId === project.id) : undefined
    if (session?.status === 'auditioning') {
      if (session.dueWeek === null || session.reservation === null) uncertainty = 'the casting session has no committed completion reservation'
      else freshWeek = Math.max(freshWeek, session.dueWeek)
    }
    if (capped && assignmentRefusal(state, person, freshWeek, 'actor') !== null) {
      rows.push(impossiblePath(project.id, 'retirement closes fresh cast admission before this project is available')); continue
    }
    if (draft.issuerStudioId !== state.hollywood?.playerStudioId && state.technology.projects.some(row => row.status === 'active'
      && row.seats.some(seat => seat.talentId === person && seat.releasedWeek === null && activeContract(state, person) !== undefined))) {
      uncertainty = 'the rival staffing owner has an active research assignment with no supported release boundary'
    }
    rows.push({ id: project.id, production: null, freshWeek, takeWeek: Math.max(draft.windowStartWeek, freshWeek + 5), physical: null,
      uncertainty: uncertainty ?? resourceUncertainty(state, draft.issuerStudioId, project, freshWeek) })
  }
  if (predicate.kind === 'genreOpportunity') {
    // A player stock picture can remain held after development mode changes.
    // Its real fixed cast retains finishing rights without inventing a script.
    for (const production of owner.productions) {
      if (owner.development.projects.some(row => row.productionId === production.id)
        || production.remainingTicks < 5 || state.firstTakes.some(row => row.productionId === production.id)
        || !slots.some(slot => production.cast[slot] === person)
        || owner.concepts.find(row => row.id === production.conceptId)?.genre !== predicate.genre) continue
      const operations = draft.issuerStudioId === state.hollywood?.playerStudioId ? state.operations
        : state.hollywood?.businesses.find(row => row.studioId === draft.issuerStudioId)?.operations
      rows.push({ id: production.id, production, freshWeek: week,
        takeWeek: Math.max(draft.windowStartWeek, earliestTake(production, week)), physical: null,
        uncertainty: operations?.workflows.find(row => row.productionId === production.id)?.blocker == null
          ? null : 'the held project has an unresolved production blocker' })
    }
    if (draft.issuerStudioId === state.hollywood?.playerStudioId && owner.development.mode === 'legacy') {
      const used = new Set([...state.studio.activeProductions.map(row => row.conceptId), ...state.studio.releasedFilms.map(row => row.conceptId)])
      for (const concept of owner.concepts.filter(row => row.genre === predicate.genre && !used.has(row.id))) {
        const release = releaseFloor(state, person, week, null), freshWeek = Math.max(week, draft.startWeek, notBefore, release.week)
        rows.push(capped && assignmentRefusal(state, person, freshWeek, 'actor') !== null
          ? impossiblePath(concept.id, 'retirement closes fresh cast admission')
          : { id: concept.id, production: null, freshWeek, takeWeek: Math.max(draft.windowStartWeek, freshWeek + 5), physical: null,
            uncertainty: release.uncertainty ?? resourceUncertainty(state, draft.issuerStudioId, null, freshWeek) })
      }
    }
    // A future commission is only a physical lower bound, never an existing-path certificate.
    const release = releaseFloor(state, person, week, null), freshWeek = Math.max(week, draft.startWeek, notBefore, release.week)
    rows.push(capped && assignmentRefusal(state, person, freshWeek, 'actor') !== null
      ? impossiblePath('future', 'retirement closes fresh cast admission')
      : { id: 'future', production: null, freshWeek, takeWeek: Math.max(draft.windowStartWeek, freshWeek + 5), physical: null,
        uncertainty: 'needs a matching picture not yet commissioned' })
  }
  return rows.sort((a, b) => a.takeWeek - b.takeWeek || compareId(a.id, b.id))
}

function qualifyingCommitted(state: GameState, promise: ProfessionalPromise, week: number): Production[] {
  const predicate = promise.predicate, owner = takeSubjectOwner(state, promise.issuerStudioId)
  const operations = promise.issuerStudioId === state.hollywood?.playerStudioId ? state.operations
    : state.hollywood?.businesses.find(row => row.studioId === promise.issuerStudioId)?.operations
  const slots: readonly CastSlot[] = isOpportunityPredicate(predicate) ? opportunitySlots(predicate)
    : 'kind' in predicate && predicate.kind === 'castRoleCount'
      ? predicate.seatClass === 'lead' ? ['lead'] : ['lead', 'antagonist'] : ['lead', 'antagonist', 'support']
  return [...(owner?.productions ?? [])].filter(production => production.remainingTicks >= 5
    && operations?.workflows.find(row => row.productionId === production.id)?.blocker == null
    && !state.firstTakes.some(take => take.productionId === production.id)
    && ('kind' in predicate && predicate.kind === 'directorCount'
      ? production.directorId === promise.beneficiaryPersonId : slots.some(slot => production.cast[slot] === promise.beneficiaryPersonId))
    && (!isOpportunityPredicate(predicate) || opportunityProductionMatches(state, promise.issuerStudioId, predicate, production))
    && Math.max(earliestTake(production, week), promise.windowStartWeek) < promise.dueWeekExclusive)
    .sort((a, b) => earliestTake(a, week) - earliestTake(b, week) || compareId(a.id, b.id))
}

/** A sufficient committed-seat witness, not a general allocation solver. */
function reservationWitness(state: GameState, draft: PromiseDraft, rows: readonly ProfessionalPromise[], candidate: Path, week: number): number | null {
  const groups = new Map<Production, ProfessionalPromise[]>()
  for (const promise of rows) {
    const remaining = promise.predicate.count - promise.progress
    const held = qualifyingCommitted(state, promise, week).filter(row => row !== candidate.production)
    if (held.length < remaining) return null
    for (const production of held.slice(0, remaining)) groups.set(production, [...(groups.get(production) ?? []), promise])
  }
  let floor = week
  for (const [production, promises] of groups) {
    const take = Math.max(earliestTake(production, week), ...promises.map(row => row.windowStartWeek))
    if (promises.some(row => take >= row.dueWeekExclusive)) return null
    if (productionCompanyTalentIds([production]).has(draft.beneficiaryPersonId)) floor = Math.max(floor, earliestRelease(production, week), take + 4)
  }
  return floor
}

export function opportunityAssessment(state: GameState, draft: PromiseDraft & { predicate: OpportunityPredicate }, week: number,
  reservations: readonly ProfessionalPromise[]): { classification: PromiseClassification; bottleneck: string | null } {
  const candidates = paths(state, draft, week, true)
  let fragile: string | null = null
  for (const candidate of candidates) {
    if (candidate.physical !== null || candidate.takeWeek >= draft.dueWeekExclusive) continue
    const witness = reservationWitness(state, draft, reservations, candidate, week)
    if (witness === null) { fragile ??= 'other promises lack compatible committed-seat reservation witnesses'; continue }
    const delayed = candidate.production === null && witness > candidate.freshWeek
      ? paths(state, draft, week, true, witness).find(row => row.id === candidate.id) ?? candidate : candidate
    if (delayed.physical !== null || delayed.takeWeek >= draft.dueWeekExclusive) {
      fragile ??= 'committed reservation timing leaves this opportunity uncertain'; continue
    }
    if (delayed.uncertainty !== null) { fragile ??= delayed.uncertainty; continue }
    if (draft.dueWeekExclusive - delayed.takeWeek < 8) { fragile ??= 'the due week leaves too little slack before filming would start'; continue }
    return { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null }
  }
  return fragile !== null ? { classification: 'FRAGILE', bottleneck: fragile }
    : { classification: 'IMPOSSIBLE', bottleneck: candidates.find(row => row.physical !== null)?.physical ?? 'no filming week inside the window can reach this opportunity' }
}

/** Deliberately ignores resources, reservations and slack: those cannot settle an outcome. */
export function opportunityPhysicalImpossibility(state: GameState, promise: ProfessionalPromise & { predicate: OpportunityPredicate }, week: number,
  capped = false): string | null {
  const draft = { ...promise, startWeek: week, termWeeks: Math.max(0, promise.dueWeekExclusive - week) }
  const candidates = paths(state, draft, week, capped)
  return candidates.some(row => row.physical === null && row.takeWeek < promise.dueWeekExclusive) ? null
    : candidates.find(row => row.physical !== null)?.physical ?? 'no filming week inside the window can reach this opportunity'
}
