// Stabilization 2026-10-22, audit finding L-05 (PEOPLE-04 ≡ RIVAL-01; the landed twin of P16's C-01).
//
// closure/v1 §3: a closed business keeps its productions and drafts in place as terminal history
// and releases its people at the closure week; `industryBusyTalentIds` therefore skips a closed
// business, and the hiring market offers its released people. The save validator did not follow
// that law: it claimed every business's production participants and drafting writers as live
// assignments, closed or not. Signing a released person and seating them (the player here; a
// rival's own `staff()` hire just as well) then made EVERY later save fail with "simultaneous
// active assignments". The validator now claims nothing for an actually closed business, and
// the promise, opportunity and profession-history readers treat its retained work the same way.
//
// Route: the P15B estate premise device (tests/helpers/p15b-live.ts `forgedEstateRoute`): r03 closes
// at week 131 holding film 14 in production. Every state after the forged boundary is natural ticks.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { assignmentRefusal } from '../src/core/careerLifecycle.js'
import { busyTalentIds, hiringMarketIds } from '../src/core/employment.js'
import { MARKETING_BUDGET_LEVELS } from '../src/core/grid.js'
import { industryBusyTalentIds, studioEmployerId } from '../src/core/hollywood.js'
import { productionCompanyTalentIds } from '../src/core/productionPeople.js'
import { closedWeekOf } from '../src/core/operatingState.js'
import { makeSave } from '../src/core/save.js'
import { resolveShape } from '../src/core/shape.js'
import { tick } from '../src/core/tick.js'
import type { Action, FilmShape, GameState } from '../src/core/types.js'
import { ESTATE_CLOSURE_WEEK, forgedEstateRoute, PLAYER, R03 } from './helpers/p15b-live.js'

const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }

/** Free people of one role, never a studio's employee (the p15a1 held-slate rule). */
/** Signs `count` people of one role from the hiring market (D-11.12: an engaged picture seats
 * contracted people or available freelancers; the week-130 capture's free people are neither).
 * When the market holds too few of a role, a real creator (`createTalent`, the 1368 route) adds one. */
function sign(state: GameState, role: 'writer' | 'director' | 'actor' | 'craft', count: number, used: Set<string>): { state: GameState; ids: string[] } {
  const ids: string[] = []
  const take = (id: string) => {
    state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 52 }])
    ids.push(id)
    used.add(id)
  }
  for (const id of hiringMarketIds(state)) {
    if (ids.length === count) break
    const person = state.talent.find((t) => t.id === id)!
    if (person.role !== role || used.has(id) || studioEmployerId(state, id) !== null) continue
    if (role !== 'writer' && assignmentRefusal(state, id, state.market.tick, role) !== null) continue
    take(id)
  }
  while (ids.length < count) {
    state = applyActions(state, [{ kind: 'createTalent', talent: {
      name: `Stabilization ${role} ${String(ids.length)}`, role, age: 40,
      actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55,
    } }])
    take(state.talent.at(-1)!.id)
  }
  return { state, ids }
}

describe('L-05: a closed business\'s retained work claims nobody at validation', () => {
  it('the player signs and seats a released participant of the closed studio\'s frozen picture; every later save admits', () => {
    const closed = forgedEstateRoute(ESTATE_CLOSURE_WEEK).get(ESTATE_CLOSURE_WEEK)!
    expect(closed.market.tick).toBe(ESTATE_CLOSURE_WEEK)
    expect(closedWeekOf(closed).get(R03)).toBe(ESTATE_CLOSURE_WEEK)
    expect(closed.scriptDevelopment.mode, 'route premise: the week-130 capture greenlights through the open pool').toBe('legacy')
    const business = closed.hollywood!.businesses.find((b) => b.studioId === R03)!
    const frozen = business.productions[0]
    expect(frozen, 'premise: r03 retains film 14 in production at its closure').toBeDefined()
    const company = [...productionCompanyTalentIds([frozen!])]
    const released = company.find((id) => closed.talent.find((t) => t.id === id)?.role === 'actor'
      && hiringMarketIds(closed).includes(id) && assignmentRefusal(closed, id, closed.market.tick, 'actor') === null)
    expect(released, 'premise: a released actor of the frozen picture is in the hiring market').toBeDefined()
    // closure/v1 §3: the busy set already skips the closed business.
    expect(industryBusyTalentIds(closed.hollywood, closedWeekOf(closed)).has(released!)).toBe(false)
    expect(busyTalentIds(closed).has(released!)).toBe(false)
    expect(() => makeSave(closed)).not.toThrow()

    const signed = applyActions(closed, [{ kind: 'signContract', talentId: released!, termWeeks: 52 }])
    expect(studioEmployerId(signed, released!)).toBe(PLAYER)
    const used = new Set<string>([released!])
    const concept = signed.concepts[0]!
    let staffed = signed
    const writer = sign(staffed, 'writer', 1, used); staffed = writer.state
    const director = sign(staffed, 'director', 1, used); staffed = director.state
    const cast = sign(staffed, 'actor', 2, used); staffed = cast.state
    const craft = sign(staffed, 'craft', 1, used); staffed = craft.state // D-11.13: exactly one Craft Lead
    expect(() => makeSave(staffed)).not.toThrow()
    const greenlight: Action = { kind: 'greenlight', production: {
      conceptId: concept.id, shape: SHAPE,
      promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] } },
      writerId: writer.ids[0]!, directorId: director.ids[0]!, craftIds: [craft.ids[0]!],
      cast: { lead: released!, antagonist: cast.ids[0]!, support: cast.ids[1]! },
      budget: { negative: concept.baseNegativeCost * resolveShape(SHAPE).budgetDemandMultiplier * staffed.era.costScale, marketing: MARKETING_BUDGET_LEVELS[0]! },
    } }
    const seated = applyActions(staffed, [greenlight])
    const production = seated.studio.activeProductions.at(-1)!
    expect(production.cast.lead).toBe(released!)
    expect(busyTalentIds(seated).has(released!)).toBe(true)
    // The frozen picture still names the same person: history is untouched.
    expect(productionCompanyTalentIds([seated.hollywood!.businesses.find((b) => b.studioId === R03)!.productions[0]!]).has(released!)).toBe(true)
    // Before the fix this threw `person … has simultaneous active assignments`.
    expect(() => makeSave(seated)).not.toThrow()

    // A bounded natural soak: ticks through the picture's whole production, saving every week.
    let state = seated
    for (let week = 0; week < 10; week++) {
      state = tick(state)
      expect(() => makeSave(state), `week ${state.market.tick}`).not.toThrow()
    }
    expect(state.market.tick).toBe(ESTATE_CLOSURE_WEEK + 10)
  }, 60_000)
})
