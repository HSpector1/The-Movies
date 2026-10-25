// ── P16A: `libraryValuationV1`, a pure as-of end-week read that never creates cash ──
//
// Authority: P16A r3 charter "Four rights and read model" (valuation paragraph), adopted by
// 1370-AD with its explicitly PROVISIONAL coefficients (TUNING.RIGHTS_R2_CATALOGUE_VALUE_AT_100,
// TUNING.RIGHTS_R1_OPTION_VALUE_AT_100): display/transaction input only — no periodic cash,
// Ranking/Standing award, Legacy or reissue effect. Book net worth, enterprise value, transaction
// price and auction price remain separate later models.
//
// Rules (r3):
//   * integer 0 <= asOfWeek <= market.tick; a future query is refused;
//   * persisted and virtual title records merge by exact subject (rights.ts); only genesis/events
//     dated through asOfWeek fold; only films actually released through that week count;
//   * every linked film score the fold would use must be finite in [0,100], else typed unavailable
//     naming the offending FilmId — no clamp, skip, zero price, partial total or mutation. The same
//     refusal applies when the film would enter an R1 maxQualityThroughDate for a property whose R2
//     holder differs;
//   * R2 held at the date: round(COEF_R2 * score / 100); R1 held at the date: round(COEF_R1 *
//     maxQualityThroughDate / 100), zero with no linked released film by then; R3/R4 are zero in v1;
//   * each item is rounded once in stable id order; only safe integers sum; overflow refuses.

import { asOfWeekRefusal, authenticTitles, holderAt, resolveTitles, subjectKey, subjectsHeldBy, type HolderReason, type RightSubject } from './rights.js'
import { TUNING } from './tuning.js'
import type { GameState } from './types.js'

export type ValuationItem = { subject: RightSubject; value: number }
export type ValuationResult =
  | { kind: 'available'; holderId: string; asOfWeek: number; total: number; items: ValuationItem[] }
  | { kind: 'unavailable'; reason: HolderReason | 'unknownHolder' | 'unsafeSum'; filmId?: string; subject?: RightSubject }
  | { kind: 'unavailable'; reason: 'criticScoreOutsideValuationRange'; filmId: string }

type ScoredFilm = { filmId: string; conceptId: string; score: number; releaseWeek: number | null }

/** Every released film's score and release date from the authoritative film records (not the title records). */
function scoredFilms(state: GameState): Map<string, ScoredFilm> {
  const out = new Map<string, ScoredFilm>()
  const h = state.hollywood!
  for (const f of h.films) {
    out.set(f.filmId, f.provenance === 'authored-start/v1'
      ? { filmId: f.filmId, conceptId: f.conceptId, score: f.criticScore, releaseWeek: null }
      : { filmId: f.filmId, conceptId: f.conceptId, score: f.result.criticScore, releaseWeek: f.result.releaseTick })
  }
  for (const f of state.studio.releasedFilms) out.set(f.productionId, { filmId: f.productionId, conceptId: f.conceptId, score: f.criticScore, releaseWeek: f.releaseTick })
  return out
}

const releasedThrough = (f: ScoredFilm, asOfWeek: number): boolean => f.releaseWeek === null || f.releaseWeek <= asOfWeek
const scoreInRange = (score: number): boolean => Number.isFinite(score) && score >= 0 && score <= 100

/** The provisional per-item prices, rounded once each. */
export function r2CatalogueValue(score: number): number { return Math.round((TUNING.RIGHTS_R2_CATALOGUE_VALUE_AT_100 * score) / 100) }
export function r1OptionValue(maxQuality: number): number { return Math.round((TUNING.RIGHTS_R1_OPTION_VALUE_AT_100 * maxQuality) / 100) }

/** The value of one subject at the end of `asOfWeek`, independent of who holds it; used by lots and disclosures. */
export function subjectValueV1(state: GameState, subject: RightSubject, asOfWeek: number): { kind: 'available'; value: number } | Exclude<ValuationResult, { kind: 'available' }> {
  const refusal = asOfWeekRefusal(state, asOfWeek)
  if (refusal !== null) return { kind: 'unavailable', reason: refusal }
  const resolved = resolveTitles(state)
  const films = scoredFilms(state)
  return itemValue(resolved, films, subject, asOfWeek)
}

function itemValue(resolved: ReturnType<typeof resolveTitles>, films: Map<string, ScoredFilm>, subject: RightSubject, asOfWeek: number)
  : { kind: 'available'; value: number } | Exclude<ValuationResult, { kind: 'available' }> {
  if (subject.right === 'R2') {
    const film = films.get(subject.filmId)
    if (film === undefined || !releasedThrough(film, asOfWeek)) return { kind: 'unavailable', reason: 'noTitleAtDate' }
    if (!scoreInRange(film.score)) return { kind: 'unavailable', reason: 'criticScoreOutsideValuationRange', filmId: film.filmId }
    return { kind: 'available', value: r2CatalogueValue(film.score) }
  }
  const property = resolved.properties.find((p) => p.propertyId === subject.propertyId)
  if (property === undefined) return { kind: 'unavailable', reason: 'unknownSubject' }
  let max: number | null = null
  for (const link of [...property.workLinks].sort()) {
    const film = films.get(link)
    if (film === undefined || !releasedThrough(film, asOfWeek)) continue
    if (!scoreInRange(film.score)) return { kind: 'unavailable', reason: 'criticScoreOutsideValuationRange', filmId: film.filmId }
    max = max === null ? film.score : Math.max(max, film.score)
  }
  return { kind: 'available', value: max === null ? 0 : r1OptionValue(max) }
}

export function libraryValuationV1(state: GameState, holderId: string, asOfWeek: number): ValuationResult {
  const refusal = asOfWeekRefusal(state, asOfWeek)
  if (refusal !== null) return { kind: 'unavailable', reason: refusal }
  const h = state.hollywood!
  if (!h.identities.some((i) => i.studioId === holderId)) return { kind: 'unavailable', reason: 'unknownHolder' }
  // A closed studio is not a going holder: only the typed P15 handoff and the P16 estate disposition resolve its title.
  if (state.rights.estates.some((e) => e.studioId === holderId && e.closureWeek <= asOfWeek)) return { kind: 'unavailable', reason: 'unresolvedTerminalAuthority' }
  const resolved = resolveTitles(state)
  // r2 (F12): never a partial total. A subject this holder created, or last held on the record, that does not resolve
  // makes the whole read unavailable, naming it (P16A r3: explicit unavailable on ambiguous provenance).
  if (resolved.unavailable.length > 0) {
    const authentic = authenticTitles(state)
    for (const u of resolved.unavailable) {
      const key = subjectKey(u.subject)
      const creators = u.subject.right === 'R1'
        ? [state.rights.properties.find((p) => p.propertyId === (u.subject as { propertyId: string }).propertyId)?.creatorStudioId, authentic.properties.get(u.subject.propertyId)?.creatorStudioId]
        : [state.rights.filmTitles.find((t) => t.filmId === (u.subject as { filmId: string }).filmId)?.creatorStudioId, authentic.filmTitles.get(u.subject.filmId)?.creatorStudioId]
      const chain = state.rights.titleEvents.filter((e) => subjectKey(e.subject) === key).sort((a, b) => a.ordinal - b.ordinal)
      if (creators.includes(holderId) || chain[chain.length - 1]?.newHolder === holderId) return { kind: 'unavailable', reason: u.reason, subject: u.subject }
    }
  }
  const films = scoredFilms(state)
  const subjects = subjectsHeldBy(resolved, state.rights.estates, holderId, asOfWeek)
  // Every subject held at the date must resolve (a terminal holder with unresolved authority refuses the whole read).
  for (const subject of subjects) {
    const holder = holderAt(resolved, state.rights.estates, subject, asOfWeek)
    if (holder.kind === 'unavailable') return { kind: 'unavailable', reason: holder.reason }
  }
  const items: ValuationItem[] = []
  let total = 0
  for (const subject of subjects.sort((a, b) => (subjectKey(a) < subjectKey(b) ? -1 : 1))) {
    const item = itemValue(resolved, films, subject, asOfWeek)
    if (item.kind === 'unavailable') return item.reason === 'noTitleAtDate' ? { kind: 'unavailable', reason: 'noTitleAtDate' } : item
    items.push({ subject, value: item.value })
    total += item.value
    if (!Number.isSafeInteger(total)) return { kind: 'unavailable', reason: 'unsafeSum' }
  }
  return { kind: 'available', holderId, asOfWeek, total, items }
}
