// ── P17 greenlight/release composition — what actions.ts, tick.ts and hollywoodTick.ts call ─────────────
//
// Binds the pure continuation law to the live GameState: the world a quote reads, the greenlight preparation
// (quote, P16 link pre-check, forecast input), the atomic commit, the weekly rights holds, the release-time input and
// the hook mint. Deterministic and pure. Rights are read from the state through P16 (continuation.ts header).

import { filmAudienceScore } from './receptionVerdict.js'
import {
  commitContinuationGreenlight,
  continuationHolds,
  continuationInputsAtRelease,
  continuationQuote,
  franchisesOf,
  mintSubPropertyHook,
  type ContinuationQuote,
  type ContinuationRequest,
  type ContinuationWorld,
  type ProposedPrincipals,
  type ReleasedFilmView,
} from './continuation.js'
import { linkContinuationAtGreenlight, storyPropertyId } from './rights.js'
import type { Action, FilmResult, GameState } from './types.js'

/** Every public FilmResult in the world (player library and living-industry simulation films), plus `sameWeek`: films
 * this tick already released that the state it reads does not carry yet (review B1: the root marks them released). */
export function publicFilmById(state: GameState, sameWeek: readonly FilmResult[] = []): (id: string) => FilmResult | null {
  return (id) => {
    const own = state.studio.releasedFilms.find((f) => f.productionId === id) ?? sameWeek.find((f) => f.productionId === id)
    if (own) return own
    for (const film of state.hollywood?.films ?? []) {
      if (film.provenance === 'simulation/v1' && film.filmId === id) return film.result
    }
    return null
  }
}

/** The world a quote or a release read sees: this state, at its own week, with this tick's earlier releases. */
export function continuationWorldOf(state: GameState, sameWeek: readonly FilmResult[] = []): ContinuationWorld {
  const film = publicFilmById(state, sameWeek)
  return {
    state,
    week: state.market.tick,
    franchises: franchisesOf(state),
    releasedFilm: (id): ReleasedFilmView | null => {
      const result = film(id)
      return result ? { result, audience01: filmAudienceScore(state, result) / 100 } : null
    },
    isLocked: (id) => state.studio.activeProductions.some((p) => p.id === id) || (state.hollywood?.businesses ?? []).some((b) => b.productions.some((p) => p.id === id)),
  }
}

export type ContinuationPrep = {
  world: ContinuationWorld
  quote: Extract<ContinuationQuote, { ok: true }>
  /** True when the production's own concept differs from the parent's: the greenlight LINKS the production to the
   * parent property (P16 `linkContinuationAtGreenlight`) instead of minting its own title (review P17-01). False only
   * for a remake of the parent's own concept, which P16's same-concept remake hook links. */
  link: boolean
}

function reject(reason: string): never {
  throw new Error(`applyActions: greenlight rejected — continuation refused: ${reason}`)
}

/**
 * Everything a continuation greenlight needs before it mutates: the quote (legality, live rights, the locked read) and
 * the P16 link law, both read against the pre-greenlight state. Refuses atomically by throwing; returns the commit
 * inputs. The link law is P16's own writer run on the unchanged state, so a refusal here is exactly the one the write
 * would raise later, raised before any sink is touched.
 */
export function prepareContinuation(
  state: GameState,
  request: ContinuationRequest,
  ctx: { productionId: string; conceptId: string; proposed: ProposedPrincipals },
): ContinuationPrep {
  const studioId = state.hollywood?.playerStudioId
  if (studioId === undefined) reject('a continuation needs the living industry (P16 rights are read there)')
  const world = continuationWorldOf(state)
  const quote = continuationQuote(world, { studioId, productionId: ctx.productionId, request, proposed: ctx.proposed })
  if (!quote.ok) reject(quote.reason)
  const sameConcept = storyPropertyId(ctx.conceptId) === quote.storyPropertyId
  if (sameConcept && quote.type !== 'remake') {
    reject(`${ctx.conceptId} is ${quote.storyPropertyId}'s own concept: producing it again is a remake (P16 same-concept law), not a ${quote.type}`)
  }
  if (!sameConcept) {
    try {
      linkContinuationAtGreenlight(state, { studioId, production: { id: ctx.productionId, conceptId: ctx.conceptId }, parentPropertyId: quote.storyPropertyId, use: quote.use, week: state.market.tick })
    } catch (error) {
      reject(error instanceof Error ? error.message : String(error))
    }
  }
  return { world, quote, link: !sameConcept }
}

/** The atomic commit after the main production exists: the lineage edge (the P16 link is the greenlight tail's). */
export function commitContinuation(state: GameState, prep: ContinuationPrep, productionId: string): GameState {
  const studioId = state.hollywood!.playerStudioId
  return { ...state, franchises: commitContinuationGreenlight({ ...prep.world, franchises: franchisesOf(state) }, prep.quote, { studioId, productionId }) }
}

/** The player's in-flight continuations whose studio lacks the live grant this week, with the refusal: the pictures the
 * tick holds (no work, no release) until the grant returns or the studio cancels. */
export function p17RightsHolds(state: GameState, productionIds: readonly string[]): Map<string, string> {
  const studioId = state.hollywood?.playerStudioId
  return studioId === undefined ? new Map() : continuationHolds(state, productionIds, studioId)
}

/** The live continuation read for a releasing picture, through the SAME composing function the quote ran, over
 * `state` before this film's own result. `sameWeek` carries the films this tick released before it, which the root
 * already records as released (review B1). Undefined for a film with no continuation edge (the predecessor path). */
export function continuationReleaseInput(state: GameState, productionId: string, principals: ProposedPrincipals, sameWeek: readonly FilmResult[] = []): number | undefined {
  if (state.franchises === undefined) return undefined
  return continuationInputsAtRelease(continuationWorldOf(state, sameWeek), productionId, principals) ?? undefined
}

/** The `mintSubProperty` action: the player's hook on an exact released or locked film, under the parent's live
 * spin-off authority. The frozen participant record comes from the public result or the locked Production. */
export function applyMintSubProperty(state: GameState, action: Extract<Action, { kind: 'mintSubProperty' }>): GameState {
  const studioId = state.hollywood?.playerStudioId
  if (studioId === undefined) throw new Error('applyActions: mintSubProperty rejected — a hook needs the living industry (P16 rights are read there)')
  const film = publicFilmById(state)
  const franchises = mintSubPropertyHook(
    continuationWorldOf(state),
    { studioId, productionId: action.productionId, kind: action.hookKind, citedTalentIds: action.citedTalentIds },
    (id) => film(id) ?? state.studio.activeProductions.find((p) => p.id === id) ?? null,
  )
  return { ...state, franchises }
}
