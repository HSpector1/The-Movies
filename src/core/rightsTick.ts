// ── P16: the one weekly rights step, called once from tick.ts on the finalized week ──
//
// Runs on the state the advance PRODUCES (market.tick already incremented), once the industry's week is
// final and before lifecycle intent, promises, the market, settlement and the Power Ranking record (which
// still reads the cash the closings moved). Deterministic and RNG-free:
//   P16A — mint the R1 property of every rival greenlight accepted this week (the player's
//   greenlight mints inside `applyGreenlight`, atomically with the action) and the R2 film title
//   of every actual release this week (player and rival), each exactly once.
// A world without an industry has no rights and is returned unchanged.

import { answerRivalOffers, expireOffers } from './assetSale.js'
import { mintFilmTitleAtRelease, mintStoryPropertyAtGreenlight, appendTitleEvent } from './rights.js'
import { corporateConditionReaders, type CorporateConditionReaders } from './rightsFinance.js'
import type { GameState } from './types.js'

/** `week` is the week that was advanced (releases and rival greenlights are dated to it). `readers` is the P15B
 * condition/loan binding every answer and ceremony revalidates bidders against (actual evaluated input record, not an early produced-week assessment). */
export function advanceRightsWeek(state: GameState, week: number, readers: CorporateConditionReaders = corporateConditionReaders): GameState {
  const h = state.hollywood
  if (!h) return state
  // r2 (review F44): a live industry without the Save46 rights root is a state from the predecessor era handed to the
  // live tick; it refuses by name instead of failing inside a mint.
  if (state.rights === undefined) throw new Error('advanceRightsWeek: the state has an industry but no rights root (a predecessor-era state must migrate through convertV48ToV49 first)')
  let next = state
  for (const b of h.businesses) {
    for (const production of b.productions) {
      if (production.startTick !== week) continue
      // Linked already: this production's own mint, or a continuation P17 linked to its parent at greenlight.
      if (next.rights.properties.some((p) => p.workLinks.includes(production.id))) continue
      next = mintStoryPropertyAtGreenlight(next, { studioId: b.studioId, production, week })
    }
  }
  for (const film of next.studio.releasedFilms) {
    if (film.releaseTick !== week || next.rights.filmTitles.some((t) => t.filmId === film.productionId)) continue
    const row = next.studioHistory.rows.find((r) => r.kind === 'filmReleased' && r.productionId === film.productionId)
    const concept = next.concepts.find((c) => c.id === film.conceptId)
    next = mintFilmTitleAtRelease(next, { studioId: h.playerStudioId, filmId: film.productionId, conceptId: film.conceptId,
      title: row !== undefined && row.kind === 'filmReleased' ? row.title : concept?.title ?? null, week })
  }
  for (const film of h.films) {
    if (film.provenance !== 'simulation/v1' || film.result.releaseTick !== week || next.rights.filmTitles.some((t) => t.filmId === film.filmId)) continue
    next = mintFilmTitleAtRelease(next, { studioId: film.studioId, filmId: film.filmId, conceptId: film.conceptId, title: film.title, week })
  }
  for(const a of next.rights.absorptions)for(const release of a.workReleases) {
    if(release.week!==week || release.titleEventId!==null)continue
    const appended=appendTitleEvent(next,{subject:{right:'R2',filmId:release.productionId},priorHolder:a.targetId,newHolder:a.buyerId,cause:'absorbedWorkRelease',date:{kind:'campaign',week},source:{kind:'absorbedWorkRelease',absorptionId:a.id,productionId:release.productionId}})
    next={...appended.state,rights:{...appended.state.rights,absorptions:appended.state.rights.absorptions.map(owner=>owner.id===a.id?{...owner,workReleases:owner.workReleases.map(row=>row.productionId===release.productionId?{...row,titleEventId:appended.event.id}:row)}:owner)}}
  }
  // P16B — rival counterparties answer open bilateral offers under the willingness policy on the
  // produced week, then offers at or past their expiry expire and release their reservations.
  // P16C sales preparation is private to tick; the closure owner finishes claims/archival there.
  const produced = next.market.tick
  next = answerRivalOffers(next, produced, readers)
  next = expireOffers(next, produced)
  return next
}
