// ── P17 routes on real P16 rights (no rights stand-in) ─────────────────────────────────────────────
//
// Not a test file. Every right here is a P16 record written by P16's own producers: the greenlight and release mint
// hooks (`mintRoute`), the bilateral sale and licence path (`makeOffer` + the counterparty's `acceptOffer`, under the
// STABLE condition readers and the nominal prices P16's own authority tests use, p16-r2-authority.test.ts `licensed`). Imports only modules that exist at the
// predecessor a5a66c27, so the laws pinned on these routes run RED there by assertion, not by a missing import.

import { applyActions } from '../../src/core/actions.js'
import * as sale from '../../src/core/assetSale.js'
import { resolveTitles, storyPropertyId } from '../../src/core/rights.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import type { Action, FilmConcept, GameState } from '../../src/core/types.js'
import { greenlightPayload, STABLE } from './p16-fixtures.js'

/** The request shape `greenlight` carries (src/core/continuation.ts ContinuationRequest), spelled here so this helper
 * imports nothing the predecessor lacks. */
export type ContinuationAsk = { type: 'directSequel' | 'prequel' | 'remake' | 'reboot' | 'spinOff'; predecessorProductionId: string; subPropertyId?: string; branchId?: string }

/** The first player concept never produced and founding no P16 property (a new screenplay for a continuation). */
export function freshConcept(state: GameState, skip: ReadonlySet<string> = new Set()): FilmConcept {
  const founded = new Set(resolveTitles(state).properties.map((p) => p.propertyId))
  const produced = new Set([...state.studio.releasedFilms.map((f) => f.conceptId), ...state.studio.activeProductions.map((p) => p.conceptId)])
  const concept = state.concepts.find((c) => !skip.has(c.id) && !produced.has(c.id) && !founded.has(storyPropertyId(c.id)))
  if (concept === undefined) throw new Error('premise: no unfounded player concept left')
  return concept
}

/** The player's legacy greenlight of `concept`, carrying `continuation` when given. Talent engaged on a live production
 * is never picked (M16 exclusivity), so a second concurrent greenlight seats idle people. */
export function greenlightAs(state: GameState, concept: FilmConcept, continuation?: ContinuationAsk, used: Set<string> = new Set()): { state: GameState; productionId: string } {
  for (const p of state.studio.activeProductions) for (const id of [p.writerId, p.directorId, ...p.craftIds, ...Object.values(p.cast)]) used.add(id)
  const action = { kind: 'greenlight', production: greenlightPayload(state, concept, used), ...(continuation === undefined ? {} : { continuation }) } as Action
  const next = applyActions(state, [action])
  return { state: next, productionId: next.studio.activeProductions[next.studio.activeProductions.length - 1]!.id }
}

/** `mintRoute`'s schedule for a picture greenlit this week: PRODUCTION_TICKS ticks to Release Ready, commit, release. */
export function releaseNow(state: GameState, productionId: string): GameState {
  let s = state
  for (let i = 0; i < TUNING.PRODUCTION_TICKS; i++) s = tick(s)
  if (s.studio.activeProductions.find((p) => p.id === productionId)?.remainingTicks !== 1) throw new Error(`premise: ${productionId} is not Release Ready`)
  s = applyActions(s, [{ kind: 'commitPictureToRelease', productionId }])
  s = tick(s)
  if (!s.studio.releasedFilms.some((f) => f.productionId === productionId)) throw new Error(`premise: ${productionId} did not release`)
  return s
}

function answered(state: GameState, input: sale.OfferInput): GameState {
  const week = state.market.tick
  const offered = sale.makeOffer(state, input, week, STABLE)
  return sale.acceptOffer(offered.state, offered.offer.id, input.counterpartyId, week, STABLE)
}

/** The player sells the R1 title of `propertyId` to the rival `buyer`, who accepts. */
export function sellTitle(state: GameState, propertyId: string, buyer: string): GameState {
  return answered(state, { offerorId: state.hollywood!.playerStudioId, counterpartyId: buyer, direction: 'sell', instrument: { kind: 'title', subject: { right: 'R1', propertyId } }, price: 1_000 })
}

/** The player buys an exclusive R3 licence for `use` on `propertyId` from the rival holder `grantor`, for [week, week + weeks). */
export function buyLicence(state: GameState, grantor: string, propertyId: string, use: 'sequel' | 'remake' | 'spinoff', weeks: number): GameState {
  const week = state.market.tick
  return answered(state, { offerorId: state.hollywood!.playerStudioId, counterpartyId: grantor, direction: 'buy', price: 1_000,
    instrument: { kind: 'licence', right: 'R3', subject: { right: 'R1', propertyId }, scope: { use }, exclusive: true, startWeek: week, endWeekExclusive: week + weeks } })
}

/** The player, as title holder, licenses `use` on `propertyId` exclusively to the rival `grantee` for [week, week + weeks). */
export function grantLicence(state: GameState, grantee: string, propertyId: string, use: 'sequel' | 'remake' | 'spinoff', weeks: number): GameState {
  const week = state.market.tick
  return answered(state, { offerorId: state.hollywood!.playerStudioId, counterpartyId: grantee, direction: 'sell', price: 1_000,
    instrument: { kind: 'licence', right: 'R3', subject: { right: 'R1', propertyId }, scope: { use }, exclusive: true, startWeek: week, endWeekExclusive: week + weeks } })
}
