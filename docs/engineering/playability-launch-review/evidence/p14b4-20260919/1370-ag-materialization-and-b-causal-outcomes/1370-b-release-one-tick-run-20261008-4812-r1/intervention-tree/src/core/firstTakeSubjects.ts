import { GENRE_ORDER } from './tuning.js'
import type { FilmConcept, FirstTakeReceipt, FirstTakeSubject, GameState, Production, ScriptDevelopment } from './types.js'

type SubjectState = Pick<GameState, 'hollywood' | 'studio' | 'concepts' | 'scriptDevelopment' | 'firstTakes' | 'firstTakeSubjects'>

/** Project IDs are local to their issuer. Never resolve one across businesses. */
export function takeSubjectOwner(state: Pick<SubjectState, 'hollywood' | 'studio' | 'concepts' | 'scriptDevelopment'>,
  studioId: string): { concepts: readonly FilmConcept[]; development: ScriptDevelopment; productions: readonly Production[] } | undefined {
  if (state.hollywood?.playerStudioId === studioId) {
    return { concepts: state.concepts, development: state.scriptDevelopment, productions: state.studio.activeProductions }
  }
  const business = state.hollywood?.businesses.find(row => row.studioId === studioId)
  return business === undefined ? undefined
    : { concepts: state.hollywood!.concepts, development: business.development, productions: business.productions }
}

/** Called in the same transaction that appends the unchanged six-field receipt. */
export function subjectForNewTake(state: SubjectState, studioId: string, production: Production, eventId: string): FirstTakeSubject {
  const owner = takeSubjectOwner(state, studioId)
  const concept = owner?.concepts.find(row => row.id === production.conceptId)
  if (owner === undefined || concept === undefined) throw new Error('first take subject: missing issuing owner or concept')
  const projects = owner.development.projects.filter(row => row.productionId === production.id)
  if (projects.length > 1 || (owner.development.mode === 'managed' && projects.length !== 1)) {
    throw new Error('first take subject: managed production needs its exact issuer-owned screenplay link')
  }
  const project = projects[0]
  if (project !== undefined && project.conceptId !== concept.id) throw new Error('first take subject: screenplay and production concepts disagree')
  return { eventId, conceptId: concept.id, genre: concept.genre, scriptProjectId: project?.id ?? null }
}

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/** Validate retained owner joins, including canceled projects whose live link was cleared.
 * No inferred pre-cutover facts, cutover movement, or historical receipt rewriting. */
export function validateFirstTakeSubjects(raw: Record<string, unknown>): void {
  const fail = (reason: string): never => { throw new Error(`validateSaveV40: firstTakeSubjects ${reason}`) }
  const exact = (value: unknown, keys: readonly string[], at: string): Record<string, unknown> => {
    if (!record(value)) return fail(`${at} must be an object`)
    if (Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) {
      return fail(`${at} must contain exactly ${keys.join(', ')}`)
    }
    return value
  }
  const root = exact(raw.firstTakeSubjects, ['version', 'cutoverOrdinal', 'facts'], 'root')
  if (root.version !== 1) fail('version must be 1')
  if (!Array.isArray(raw.firstTakes)) fail('requires the firstTakes root')
  const takes = raw.firstTakes as FirstTakeReceipt[]
  const cutover = root.cutoverOrdinal
  if (typeof cutover !== 'number' || !Number.isSafeInteger(cutover) || cutover < 0 || cutover > takes.length) {
    return fail('cutoverOrdinal must be an integer inside the receipt root')
  }
  if (!Array.isArray(root.facts) || root.facts.length !== takes.length - cutover) return fail('facts must be the complete ordered receipt suffix')
  const state = raw as unknown as SubjectState
  for (let i = 0; i < root.facts.length; i++) {
    const fact = exact(root.facts[i], ['eventId', 'conceptId', 'genre', 'scriptProjectId'], `facts[${i}]`)
    const take = takes[cutover + i]!
    if (fact.eventId !== take.eventId) fail(`facts[${i}] must name its ordered first take`)
    if (typeof fact.conceptId !== 'string' || fact.conceptId.trim() === '') fail(`facts[${i}] needs a concept`)
    if (!(GENRE_ORDER as readonly unknown[]).includes(fact.genre)) fail(`facts[${i}] needs a catalogue genre`)
    const owner = takeSubjectOwner(state, take.studioId)
    const concept = owner?.concepts.find(row => row.id === fact.conceptId)
    if (owner === undefined || concept === undefined || concept.genre !== fact.genre) return fail(`facts[${i}] disagrees with its owner's concept`)
    if (fact.scriptProjectId !== null) {
      if (typeof fact.scriptProjectId !== 'string' || fact.scriptProjectId.trim() === '') fail(`facts[${i}] needs a project ID or null`)
      const project = owner.development.projects.find(row => row.id === fact.scriptProjectId)
      if (project === undefined || project.conceptId !== fact.conceptId) fail(`facts[${i}] does not name its owner's screenplay and concept`)
    } else if (take.studioId !== state.hollywood?.playerStudioId) {
      fail(`facts[${i}] cannot name a stock picture for a rival managed production`)
    }
    const production = owner.productions.find(row => row.id === take.productionId)
    const linkedProject = owner.development.projects.find(row => row.productionId === take.productionId)
    if (production !== undefined && production.conceptId !== fact.conceptId) fail(`facts[${i}] disagrees with the surviving production`)
    if (linkedProject !== undefined && (linkedProject.id !== fact.scriptProjectId || linkedProject.conceptId !== fact.conceptId)) {
      fail(`facts[${i}] disagrees with the surviving screenplay link`)
    }
    if (take.studioId === state.hollywood?.playerStudioId) {
      const film = state.studio.releasedFilms.find(row => row.productionId === take.productionId)
      if (film !== undefined && film.conceptId !== fact.conceptId) fail(`facts[${i}] disagrees with the released film`)
    } else {
      const film = state.hollywood?.films.find(row => row.provenance === 'simulation/v1'
        && row.studioId === take.studioId && row.result.productionId === take.productionId)
      if (film !== undefined && film.provenance === 'simulation/v1'
        && (film.conceptId !== fact.conceptId || film.genre !== fact.genre || film.scriptProjectId !== fact.scriptProjectId)) {
        fail(`facts[${i}] disagrees with the released industry film`)
      }
    }
  }
}
