// Stabilization 2026-10-22, audit findings L-14 (CORE-02 ≡ PROD-02) and L-15 (CORE-03 ≡ PROD-10 ≡ UI-03).
//
// L-14: `cancel` after `commitPictureToRelease` removed the production and left its release
// commitment behind; the next tick entry and every save then refused the world as an orphan
// commitment. The prepared P16 work states "no cancellation after release commit"; the refusal
// now exists in the core.
//
// L-15: the core trusted caller money. A greenlight with a NaN, negative or infinite budget was
// debited and stored, a contract term of NaN or a fraction was clamped into the state, a
// non-finite age passed the creator's range check, and the production aliased the caller's
// payload objects. Authoritative money is checked here, not in the adapter.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { FOUNDING_MINIMUMS, beginFounding, stableStringify } from '../src/core/index.js'
import { makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { generateWorld } from '../src/core/worldgen.js'
import type { CastSlot, GameState, SegmentId } from '../src/core/types.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { signRole } from './helpers/stabilization-staffing.js'

function assignment(state: GameState) {
  const roster = state.contracts.map((contract) => state.talent.find((t) => t.id === contract.talentId)!)
  const byRole = (role: string) => roster.filter((t) => t.role === role)
  const actors = byRole('actor')
  return {
    writerId: byRole('writer')[0]!.id, directorId: byRole('director')[0]!.id,
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } satisfies Record<CastSlot, string>,
    craftIds: [byRole('craft')[0]!.id],
  }
}
function payload(state: GameState) {
  const concept = state.concepts[0]!
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[],
      ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] } },
    ...assignment(state),
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}
/** A founded, economy-engaged operations studio (tests/construction-core.test.ts recipe): the
 * V8 save law refuses managed roots on an unfounded world, so the P06A route runs on this one. */
function foundedOperationsStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
  const byRole = (role: string) => applicants.filter((t) => t.role === role)
  const hires = [
    ...byRole('actor').slice(0, FOUNDING_MINIMUMS.actor), ...byRole('director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole('writer').slice(0, 1), ...byRole('craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [{ kind: 'activateStudioOperations' }])
}
/** The P06A release-authority route (tests/construction-core.test.ts, "release ready holds"): one picture driven to releaseReady. */
function toReleaseReady(seed: string): GameState {
  const studio = foundedOperationsStudio(seed)
  let state = applyActions(studio, [{ kind: 'greenlight', production: payload(studio) }])
  state = tick(state); state = tick(state); state = tick(state); state = tick(state)
  const production = state.studio.activeProductions[0]!
  state = applyActions(state, [
    { kind: 'assignShootingDirector', productionId: production.id, directorId: production.directorId },
    { kind: 'scheduleShootingTake', productionId: production.id },
  ])
  state = tick(state); state = tick(state); state = tick(state); state = tick(state)
  expect(state.studio.activeProductions[0]!.remainingTicks).toBe(1)
  expect(() => makeSave(state)).not.toThrow()
  return state
}

describe('L-14: a picture committed to release cannot be cancelled', () => {
  let ready: GameState, productionId: string
  beforeAll(() => {
    ready = toReleaseReady('stabilization-l14')
    productionId = ready.studio.activeProductions[0]!.id
  }, 120_000)

  it('refuses by name, leaves the state untouched, and the world still ticks and saves', () => {
    const committed = applyActions(ready, [{ kind: 'commitPictureToRelease', productionId }])
    expect(committed.releaseAuthority.commitments.map((row) => row.productionId)).toEqual([productionId])
    const before = stableStringify(committed)
    expect(() => applyActions(committed, [{ kind: 'cancel', productionId }]))
      .toThrow(`applyActions: cancel rejected — production "${productionId}" is committed to release (P06A); a committed picture cannot be cancelled`)
    expect(stableStringify(committed)).toBe(before)
    const released = tick(committed)
    expect(released.studio.activeProductions.find((p) => p.id === productionId)).toBeUndefined()
    expect(released.studio.releasedFilms.some((film) => film.productionId === productionId)).toBe(true)
    expect(() => makeSave(released)).not.toThrow()
  })

  it('an uncommitted picture at the same point still cancels', () => {
    const cancelled = applyActions(ready, [{ kind: 'cancel', productionId }])
    expect(cancelled.studio.activeProductions).toEqual([])
    expect(() => makeSave(tick(cancelled))).not.toThrow()
  })
})

describe('L-15: the core refuses money and terms it cannot account for', () => {
  const world = () => foundedOperationsStudio('stabilization-l15')

  it.each([
    ['negative', Number.NaN], ['negative', -1], ['negative', Number.POSITIVE_INFINITY],
    ['marketing', Number.NaN], ['marketing', -5], ['marketing', Number.NEGATIVE_INFINITY],
  ] as const)('greenlight refuses budget.%s = %s', (field, amount) => {
    const state = world()
    const production = { ...payload(state), budget: { ...payload(state).budget, [field]: amount } }
    const before = stableStringify(state)
    expect(() => applyActions(state, [{ kind: 'greenlight', production }]))
      .toThrow(`applyActions: greenlight rejected — budget.${field} must be a finite, non-negative amount (got ${String(amount)})`)
    expect(stableStringify(state)).toBe(before)
  })

  it('the stored production owns copies of the caller\'s cast, craft and budget objects', () => {
    const state = world()
    const production = payload(state)
    const after = applyActions(state, [{ kind: 'greenlight', production }])
    const stored = after.studio.activeProductions[0]!
    const before = stableStringify(after)
    production.cast.lead = 'forged'
    production.craftIds.push('forged')
    production.budget.negative = -1
    ;(production.shape as { ending: string }).ending = 'forged'
    production.promise.intendedSegments.push(production.promise.intendedSegments[0]!)
    production.promise.ranges.intimacy[0] = -1
    expect(stableStringify(after)).toBe(before)
    expect(stored.cast.lead).not.toBe('forged')
  })

  it.each([Number.NaN, 1.5, 0, -52, Number.POSITIVE_INFINITY])('signContract refuses termWeeks = %s', (termWeeks) => {
    const state = p13aGeneratedStudio('stabilization-l15-term')
    const talentId = hiringMarketIds(state)[0]!
    const before = stableStringify(state)
    expect(() => applyActions(state, [{ kind: 'signContract', talentId, termWeeks }]))
      .toThrow(`applyActions: signContract rejected — termWeeks must be a positive whole number of weeks (got ${String(termWeeks)})`)
    expect(stableStringify(state)).toBe(before)
  })

  it.each([Number.NaN, 1.5, 0])('renewContract refuses termWeeks = %s by name', (termWeeks) => {
    const signed = signRole(p13aGeneratedStudio('stabilization-l15-renew'), 'writer', 1, new Set())
    expect(() => applyActions(signed.state, [{ kind: 'renewContract', talentId: signed.ids[0]!, termWeeks }]))
      .toThrow(`applyActions: renewContract rejected — termWeeks must be a positive whole number of weeks (got ${String(termWeeks)})`)
  })

  it('createTalent refuses a non-finite age', () => {
    const state = p13aGeneratedStudio('stabilization-l15-age')
    expect(() => applyActions(state, [{ kind: 'createTalent', talent: {
      name: 'No Age', role: 'writer', age: Number.NaN, actual: { warmth: 0, gravity: 0, physicality: 0 }, potentialTier: 'Steady', workEthic: 50,
    } }])).toThrow(/createTalent age NaN out of range/)
  })
})
