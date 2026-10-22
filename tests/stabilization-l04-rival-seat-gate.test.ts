// Stabilization 2026-10-22, audit finding L-04 (PEOPLE-03).
//
// The greenlight staffing gate read only the player's own production seats and writing tasks,
// deliberately narrower than `busyTalentIds` (the ONE availability set, which also holds
// research seats and INDUSTRY seats). A person whose rival employment ended while the rival
// picture keeps its seat (rivals seat employees without a term-outlasts-production check,
// hollywoodTick.ts) is offered by the hiring market, could be signed, and could be seated by
// the player; the save validator then refused the whole world as "simultaneous active
// assignments". The gate now reads `busyTalentIds`.
//
// No natural route reached that state in 600 weeks of the week-130 capture (lane logs
// explore-l04-r3/r4, 2026-10-22), so this is a CONSTRUCTED transaction witness: one rival
// employment interval of a seated participant is ended by hand and the person is placed in free
// agency. The witness proves the gate's refusal; it claims nothing about the forged state's own
// save admission (that is L-05's natural route).
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { assignmentRefusal } from '../src/core/careerLifecycle.js'
import { activeProductionCompanyTalentIds, busyTalentIds, hiringMarketIds } from '../src/core/employment.js'
import { MARKETING_BUDGET_LEVELS } from '../src/core/grid.js'
import { industryBusyTalentIds, rivalEmployment, studioEmployerId } from '../src/core/hollywood.js'
import { productionCompanyTalentIds } from '../src/core/productionPeople.js'
import { closedWeekOf } from '../src/core/operatingState.js'
import { resolveShape } from '../src/core/shape.js'
import type { Action, FilmShape, GameState } from '../src/core/types.js'
import { base, PLAYER, R03 } from './helpers/p15b-live.js'
import { signRole } from './helpers/stabilization-staffing.js'

const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }

/** The constructed witness: r03's seated actor's employment ended, the person in free agency, the seat kept. */
function releasedWhileSeated(): { state: GameState; actor: string } {
  const start = base()
  const h = start.hollywood!
  const business = h.businesses.find((b) => b.studioId === R03)!
  const frozen = business.productions[0]!
  const actor = [...productionCompanyTalentIds([frozen])].find((id) => start.talent.find((t) => t.id === id)?.role === 'actor'
    && assignmentRefusal(start, id, start.market.tick, 'actor') === null)!
  const ordinal = h.activeEmploymentOrdinals.find((i) => h.employment[i]!.studioId === R03 && h.employment[i]!.terms.talentId === actor)!
  const employment = h.employment.map((row, i) => (i === ordinal ? { ...row, endedWeek: start.market.tick } : row))
  const state: GameState = { ...start, freeAgents: [...start.freeAgents, actor],
    hollywood: { ...h, employment, activeEmploymentOrdinals: h.activeEmploymentOrdinals.filter((i) => i !== ordinal) } }
  return { state, actor }
}

describe('L-04: the greenlight gate reads the one availability set, industry seats included', () => {
  // The route (the week-130 capture, one rival employment interval ended by hand, five signings)
  // runs once; each test below is assertions only.
  let state: GameState, actor: string, staffed: GameState, greenlight: Extract<Action, { kind: 'greenlight' }>, cast: string[]
  beforeAll(() => {
    ;({ state, actor } = releasedWhileSeated())
    const signed = applyActions(state, [{ kind: 'signContract', talentId: actor, termWeeks: 52 }])
    const used = new Set<string>([actor])
    const concept = signed.concepts[0]!
    staffed = signed
    const writer = signRole(staffed, 'writer', 1, used); staffed = writer.state
    const director = signRole(staffed, 'director', 1, used); staffed = director.state
    const actors = signRole(staffed, 'actor', 3, used); staffed = actors.state; cast = actors.ids
    const craft = signRole(staffed, 'craft', 1, used); staffed = craft.state
    greenlight = { kind: 'greenlight', production: {
      conceptId: concept.id, shape: SHAPE,
      promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] } },
      writerId: writer.ids[0]!, directorId: director.ids[0]!, craftIds: [craft.ids[0]!],
      cast: { lead: actor, antagonist: cast[0]!, support: cast[1]! },
      budget: { negative: concept.baseNegativeCost * resolveShape(SHAPE).budgetDemandMultiplier * staffed.era.costScale, marketing: MARKETING_BUDGET_LEVELS[0]! },
    } }
  }, 120_000)

  it('premise: the released seat-holder is in the hiring market, signable, and in the one availability set', () => {
    expect(closedWeekOf(state).has(R03)).toBe(false)
    expect(rivalEmployment(state, actor, state.market.tick)).toBeNull()
    expect(hiringMarketIds(state)).toContain(actor)
    expect(industryBusyTalentIds(state.hollywood, closedWeekOf(state)).has(actor)).toBe(true)
    expect(studioEmployerId(staffed, actor)).toBe(PLAYER)
    // The narrower set the gate used to read never saw the rival seat; the one availability set does.
    expect(activeProductionCompanyTalentIds(staffed).has(actor)).toBe(false)
    expect(busyTalentIds(staffed).has(actor)).toBe(true)
  })

  it('a person seated in an operating rival picture cannot be seated by the player even after signing', () => {
    // The sentence is the one the UI voice maps (refusalVoice.ts); it now covers rival and research seats too.
    expect(() => applyActions(staffed, [greenlight]))
      .toThrow(`applyActions: greenlight talent "${actor}" is already engaged in an active production (exclusivity, M16)`)
  })

  it('control: the same package with a free contracted actor in the lead is admitted', () => {
    const control = applyActions(staffed, [{ ...greenlight, production: { ...greenlight.production, cast: { ...greenlight.production.cast, lead: cast[2]! } } }])
    expect(control.studio.activeProductions.at(-1)!.cast.lead).toBe(cast[2]!)
  })
})
