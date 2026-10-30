// ── P18: the natural route to a lawful first-season commission, free of any test runner (not a test file) ──────────
//
// Sprint 13 slice B moved the route build here from tests/helpers/p18-route.ts, unchanged, so the browser journey
// (ui/e2e/p18-season.spec.ts) can build the same world in the Playwright process, which must not load vitest. The
// p18-route helper re-exports everything below; its narrative (two idle film crews, the minted P16 property, the
// adopted synchronized-sound chain, six more idle people for the season, P14B.2's disclosed cash bootstrap) holds.
// FIX-S13B-1: the journey builds this world IN THE PAGE (the engine that validates the import also produces it), so
// this module imports only src/ (no node: built-in reaches it): `freshConcept` is p17-route's own, inlined, because
// p17-route's p16-fixtures import reads node:fs.

import { applyActions } from '../../src/core/actions.js'
import { hiringMarketIds } from '../../src/core/employment.js'
import { adoptionChainOperational } from '../../src/core/technologyAdoption.js'
import { tick } from '../../src/core/tick.js'
import type { CreativeRole, FilmConcept, FilmShape, GameState } from '../../src/core/types.js'
import { adoptExistingSoundChain, advanceTo, p13aGeneratedStudio } from '../../src/harness/p13a/fixtures.js'
import { MARKETING_BUDGET_LEVELS } from '../../src/core/grid.js'
import { resolveShape } from '../../src/core/shape.js'
import { resolveTitles, storyPropertyId } from '../../src/core/rights.js'

export const SEED = 'p18-sprint12-season-01'

export type TvRosterLocal = { writerId: string; directorId: string; cast: { lead: string; antagonist: string; support: string }; craftId: string }
/** A film company: a writer, a director, three actors and the one Craft Lead an engaged greenlight requires. */
export type FilmCrew = { writerId: string; directorId: string; cast: { lead: string; antagonist: string; support: string }; craftId: string }

export type SeasonRoute = {
  /** Operational chain, eighteen contracted people (two idle film crews and the season roster), the player's P16 property. */
  state: GameState
  /** The same campaign while the chain is still installing (the property and both crews exist; the roster is unsigned). */
  installing: GameState
  roster: TvRosterLocal
  crews: FilmCrew[]
  adoptionId: string
  propertyId: string
}

const player = (state: GameState): string => state.hollywood!.playerStudioId

/** tests/helpers/p17-route.ts `freshConcept`, verbatim: the first concept no picture used and no title founded. */
function freshConcept(state: GameState, skip: ReadonlySet<string> = new Set()): FilmConcept {
  const founded = new Set(resolveTitles(state).properties.map((p) => p.propertyId))
  const produced = new Set([...state.studio.releasedFilms.map((f) => f.conceptId), ...state.studio.activeProductions.map((p) => p.conceptId)])
  const concept = state.concepts.find((c) => !skip.has(c.id) && !produced.has(c.id) && !founded.has(storyPropertyId(c.id)))
  if (concept === undefined) throw new Error('premise: no unfounded player concept left')
  return concept
}

/** P14B.2's disclosed cash bootstrap (tests/helpers/p14b2-fixtures.ts `fund`, byte for byte; that module loads vitest). */
function fund(state: GameState): GameState {
  const delta = 30_000_000 - state.studio.cash
  return { ...state, studio: { ...state.studio, cash: 30_000_000 }, ledger: [...state.ledger,
    { week: state.market.tick, kind: delta > 0 ? 'studioRevenue' : 'overhead', amount: delta, note: 'P14B.2 fixture disclosed cash bootstrap' }] }
}

function sign(state: GameState, role: CreativeRole, taken: ReadonlySet<string>): { state: GameState; id: string } {
  for (let i = 0; i < 80; i++) {
    const id = hiringMarketIds(state, state.market.tick).find((candidate) => !taken.has(candidate) && state.talent.find((p) => p.id === candidate)?.role === role)
    if (id !== undefined) return { state: applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 208 }]), id }
    state = tick(state)
  }
  throw new Error(`p18 route premise: no signable ${role} within 80 weeks`)
}

const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }

/** `greenlightPayload`'s shape (tests/helpers/p16-fixtures.ts:89-107) seated with `crew`, its Craft Lead included. */
export function filmPayload(state: GameState, concept: FilmConcept, crew: FilmCrew) {
  return {
    conceptId: concept.id,
    shape: SHAPE,
    promise: { genre: concept.genre, intendedSegments: ['adult' as const],
      ranges: { intimacy: [-1, 1] as [number, number], tonalWeight: [-1, 1] as [number, number], kineticEnergy: [-1, 1] as [number, number] } },
    writerId: crew.writerId,
    directorId: crew.directorId,
    craftIds: [crew.craftId],
    cast: { ...crew.cast },
    budget: { negative: concept.baseNegativeCost * resolveShape(SHAPE).budgetDemandMultiplier * state.era.costScale, marketing: MARKETING_BUDGET_LEVELS[0] },
  }
}

/** The player's legacy greenlight of the next unfounded concept, seated with `crew`. */
export function greenlightWith(state: GameState, crew: FilmCrew): { state: GameState; productionId: string } {
  const next = applyActions(state, [{ kind: 'greenlight', production: filmPayload(state, freshConcept(state), crew) }])
  return { state: next, productionId: next.studio.activeProductions[next.studio.activeProductions.length - 1]!.id }
}

/** About 440 real ticks; callers cache and deep-copy. */
export function buildSeasonWorld(): SeasonRoute {
  let state = advanceTo(fund(p13aGeneratedStudio(SEED)), 416)
  const taken = new Set<string>()
  const pick = (role: CreativeRole): string => {
    const signed = sign(state, role, taken)
    state = signed.state
    taken.add(signed.id)
    return signed.id
  }
  const crew = (): FilmCrew => ({ writerId: pick('writer'), directorId: pick('director'), cast: { lead: pick('actor'), antagonist: pick('actor'), support: pick('actor') }, craftId: pick('craft') })
  const crews = [crew(), crew()]
  // The P16 property: the player's own greenlight mints its R1 story property; cancelling the picture the same week
  // keeps the genuine title history (p16a-mint-hooks) and frees every seat and slot it took.
  const before = new Set(state.rights.properties.map((p) => p.propertyId))
  const greenlit = greenlightWith(state, crews[0]!)
  const minted = greenlit.state.rights.properties.filter((p) => !before.has(p.propertyId))
  if (minted.length !== 1) throw new Error(`p18 route premise: the greenlight minted ${minted.length} properties`)
  state = applyActions(greenlit.state, [{ kind: 'cancel', productionId: greenlit.productionId }])
  state = adoptExistingSoundChain(applyActions(state, [{ kind: 'purchaseTechnology', technologyId: 'synchronized-sound' }]))
  const adoption = state.technology.adoptions.find((a) => a.studioId === player(state) && a.technologyId === 'synchronized-sound')
  if (adoption === undefined || adoption.postFacilityId === null) throw new Error('p18 route premise: no player sound adoption with a Post facility')
  const installing = structuredClone(state)
  for (let guard = 0; !adoptionChainOperational(state, state.technology.adoptions.find((a) => a.id === adoption.id)!); guard++) {
    if (guard > 40) throw new Error('p18 route premise: the sound chain did not become operational within 40 weeks')
    state = tick(state)
  }
  const roster = { writerId: pick('writer'), directorId: pick('director'), cast: { lead: pick('actor'), antagonist: pick('actor'), support: pick('actor') }, craftId: pick('craft') }
  // Eighteen contracts have run payroll since week 416; the disclosed bootstrap again, so cash is never the premise.
  state = fund(state)
  return { state, installing, roster, crews, adoptionId: adoption.id, propertyId: minted[0]!.propertyId }
}
