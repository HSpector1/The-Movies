import type { GameState, Genre } from './types.js'
import type { ForecastContext } from './forecast.js'

/** A person's released credits follow them; company segment history stays with its owner. */
export function forecastHistoryForOwner(state: GameState, ownerStudioId = state.hollywood?.playerStudioId): Pick<ForecastContext,'releasedFilms'|'concepts'|'directorCredits'> {
  const h=state.hollywood
  const directorCredits: {directorId:string;genre:Genre}[]=[]
  const concepts=new Map(state.concepts.map(c=>[c.id,c]))
  for(const film of state.studio.releasedFilms) {
    const concept=concepts.get(film.conceptId)
    if(concept)directorCredits.push({directorId:film.directorId,genre:concept.genre})
  }
  for(const film of h?.films??[]) {
    const director=film.credits.find(c=>c.role==='director')
    if(director)directorCredits.push({directorId:director.talentId,genre:film.genre})
  }
  if(!h||ownerStudioId===h.playerStudioId)return {releasedFilms:state.studio.releasedFilms,concepts:state.concepts,directorCredits}
  const owner=h.businesses.find(b=>b.studioId===ownerStudioId)
  if(!owner)throw new Error('Forecast history requires an entered company')
  const ownedConceptIds=new Set(owner.projects.map(p=>p.conceptId))
  return {releasedFilms:h.films.flatMap(f=>f.studioId===ownerStudioId&&f.provenance==='simulation/v1'?[f.result]:[]),
    concepts:h.concepts.filter(c=>ownedConceptIds.has(c.id)),directorCredits}
}
