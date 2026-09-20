// Installed verbatim from frozen160 after parent review; original inert provenance follows.
// INERT / UNEXECUTED. Intended path: tests/p14b4-bounded-sort-owners.test.ts.
// NO new-helper import: this is independently runnable against the OLD owners.
// Frozen157 parity law. Detached clock/append probes are not persisted history.
import { describe, expect, expectTypeOf, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { commitPlacement } from '../src/core/placement.js'
import { occupiedResourceSlots } from '../src/core/occupancy.js'
import { advanceManagedProductions, assignShootingDirector, clearSceneryLoadIn,
  productionsInSweepOrder, scheduleShootingTake, type ProductionAllocationPolicy } from '../src/core/operations.js'
import { createProductionSetupRouteResolver } from '../src/core/productionSetup.js'
import { createProductionTechnologyPolicy } from '../src/core/technologyProduction.js'
import { initialReleaseAuthority, releaseCommitmentRefusal, withReleaseCommitment } from '../src/core/releaseAuthority.js'
import { scriptProjectsReadModel } from '../src/core/index.js'
import { StudioEventSink } from '../src/core/studioEvents.js'
import { tick } from '../src/core/tick.js'
import { DEVELOPMENT_CASTING_ANNEX_BLUEPRINT } from '../src/core/tuning.js'
import type { GameState, Production, StudioReleaseAuthority } from '../src/core/types.js'
import { advance, availableConceptId, commissionPayload, greenlightPayload,
  managedStudio, operationsStudio, productionPayload, withCash } from './contracts/_contractFixtures.js'

type Clock = Readonly<{ id: string; startTick: number; remainingTicks: number;
  marker: Readonly<{ source: 'detached-order-probe'; label: string }> }>
const clock = (id: string, startTick = 16): Clock => Object.freeze({ id, startTick,
  remainingTicks: 7, marker: Object.freeze({ source: 'detached-order-probe', label: id }) })

// Independently preserved OLD owner semantics. Literal cases below make this
// more than an unconstrained copy-oracle. No import of new sorting machinery.
function oldOrder(rows: readonly Clock[], now: number): Clock[] {
  const wait = (value: Clock) => Math.max(0, now - value.startTick - (8 - value.remainingTicks) - 1)
  const key = (id: string): [number, number, string] => {
    const match = /^prod-(\d+)(?:-(\d+))?$/.exec(id)
    return match === null ? [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, id]
      : [Number(match[1]), match[2] === undefined ? 0 : Number(match[2]), id]
  }
  return [...rows].sort((a, b) => {
    const waiting = wait(b) - wait(a)
    if (waiting !== 0) return waiting
    const left = key(a.id), right = key(b.id)
    return left[0] - right[0] || left[1] - right[1] ||
      (left[2] < right[2] ? -1 : left[2] > right[2] ? 1 : 0)
  })
}

function checkOrder(input: readonly Clock[], expectedIds: readonly string[]) {
  const before = structuredClone(input)
  const result = productionsInSweepOrder(input, 20)
  expectTypeOf(result).toEqualTypeOf<readonly Clock[]>()
  expect(result).toEqual(oldOrder(input, 20))
  expect(result.map((value) => value.id)).toEqual(expectedIds)
  result.forEach((value, index) => expect(value).toBe(oldOrder(input, 20)[index]))
  expect(input).toEqual(before)
  return result
}

function greenlit(): GameState {
  // Existing real historical-control founding fixture: managed OPERATIONS,
  // legacy DEVELOPMENT. Its real stock-script greenlight is lawful.
  const state = operationsStudio('p13a-production-consumer')
  expect(state.operations.mode).toBe('managed')
  expect(state.scriptDevelopment.mode).toBe('legacy')
  const result = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
  expect(result.studio.activeProductions).toHaveLength(1)
  return result
}

function rehearsalBranch(state: GameState, reversed: boolean) {
  const context = structuredClone(state)
  if (reversed) context.operations = { ...context.operations,
    facilities: [...context.operations.facilities].reverse() }
  const before = structuredClone(context)
  const tech = createProductionTechnologyPolicy(context)
  const calls: { productionId: string; facilityId: string; phase: string }[] = []
  const policy: ProductionAllocationPolicy<Production> = {
    allowsFacility(productionId, facility, phase) {
      calls.push({ productionId, facilityId: facility.id, phase })
      return tech.policy.allowsFacility(productionId, facility, phase)
    },
    beforePhaseEntered(production, phase, reservations, week) {
      tech.policy.beforePhaseEntered?.(production, phase, reservations, week)
    },
  }
  const events = new StudioEventSink(context.market.tick, true)
  const result = advanceManagedProductions(context.operations, context.studio.activeProductions,
    context.market.tick, new Set(context.releaseAuthority.commitments.map((value) => value.productionId)),
    new Set(occupiedResourceSlots(context, { owners: ['installation', 'research'] }).keys()), events,
    { sets: context.sets, genreOf: (id) => {
      const production = context.studio.activeProductions.find((value) => value.id === id)
      return context.concepts.find((value) => value.id === production?.conceptId)?.genre ?? null
    } }, policy, createProductionSetupRouteResolver(context))
  const id = context.studio.activeProductions[0]!.id
  // Exactly one successful fresh allocation; callback remains BEFORE sorting,
  // once per supplied facility in the original input order, with real policy.
  expect(calls).toEqual(context.operations.facilities.map((facility) => ({
    productionId: id, facilityId: facility.id, phase: 'rehearsal',
  })))
  expect(result.operations.facilities).toBe(context.operations.facilities)
  expect(result.productions[0]!.remainingTicks).toBe(6)
  const workflow = result.operations.workflows.find((value) => value.productionId === id)!
  expect(workflow.phase).toBe('rehearsal')
  expect(workflow.reservations).toEqual([{ productionId: id, facilityId: 'facility-soundstage-07',
    capability: 'soundstage', slot: 0, phase: 'rehearsal' }])
  expect(workflow.bindings.stageFacilityId).toBe('facility-soundstage-07')
  expect(workflow.bindings.setId).not.toBeNull()
  expect(result.firstTakes).toEqual([])
  expect(result.admittedReleaseIds).toEqual([])
  expect(context).toEqual(before)
  return { result, calls, events: events.drain(), technology: tech.technology() }
}

function commissionExcept(state: GameState, excluded: ReadonlySet<string>): GameState {
  const writer = scriptProjectsReadModel(state).commission.writers.find((value) => value.available && !excluded.has(value.id))
  if (writer === undefined) throw new Error('Annex fixture has no real free writer')
  return applyActions(state, [{ kind: 'commissionScript',
    project: commissionPayload(state, availableConceptId(state), writer.id) }])
}

describe('P14B4 real sort-owner parity, independently runnable before new helper', () => {
  it('keeps longest wait, numeric suffix, lexical fallback and original generic references', () => {
    const input = Object.freeze([clock('legacy-a'), clock('prod-0012-10'), clock('prod-2'),
      clock('legacy-z', 14), clock('prod-0012-2'), clock('prod-0002')])
    const expected = ['legacy-z', 'prod-0002', 'prod-2', 'prod-0012-2', 'prod-0012-10', 'legacy-a']
    checkOrder(input, expected)
    checkOrder(Object.freeze([...input].reverse()), expected)
  })

  it('preserves leading zeros, MAX_SAFE fallback and Infinity subtraction fallthrough', () => {
    const zeroIds = ['prod-2', 'prod-02-000', 'prod-0002-0', 'prod-0002']
    checkOrder(Object.freeze(zeroIds.map((id) => clock(id))),
      ['prod-0002', 'prod-0002-0', 'prod-02-000', 'prod-2'])
    checkOrder(Object.freeze(['prod-9007199254740992', 'legacy-a', 'prod-9007199254740991-2'].map((id) => clock(id))),
      ['prod-9007199254740991-2', 'legacy-a', 'prod-9007199254740992'])
    const major8 = '8'.repeat(310), major9 = '9'.repeat(310)
    const ids = [`prod-${major9}-10`, `prod-${major9}-2`, `prod-${major8}-2`]
    expect(Number(major8)).toBe(Infinity)
    expect(Number(major9)).toBe(Infinity)
    checkOrder(Object.freeze(ids.map((id) => clock(id))),
      [`prod-${major8}-2`, `prod-${major9}-2`, `prod-${major9}-10`])
  })

  it('retains stable exact-key ties and duplicate references in detached owner inputs', () => {
    // Not a claimed valid active slate: public pure order accepts narrow rows.
    const first = clock('prod-0012-2'), second = clock('prod-0012-2')
    const input = Object.freeze([second, first, second])
    const result = checkOrder(input, ['prod-0012-2', 'prod-0012-2', 'prod-0012-2'])
    expect(result[0]).toBe(second)
    expect(result[1]).toBe(first)
    expect(result[2]).toBe(second)
  })

  it('keeps lower-owner commitment append lexical/canonical and preserves existing rows', () => {
    const ids = ['prod-0012-2', 'legacy-z', 'prod-0012-10']
    const expected = ['legacy-z', 'prod-0012-10', 'prod-0012-2'].map((productionId) => ({
      productionId, commitmentId: `release-commitment-${productionId}`, committedAtWeek: 20,
    }))
    for (const order of [ids, [...ids].reverse(), [ids[1]!, ids[0]!, ids[2]!]]) {
      let authority: StudioReleaseAuthority = initialReleaseAuthority()
      for (const id of order) {
        const before = structuredClone(authority)
        const existing = [...authority.commitments]
        const next = withReleaseCommitment(authority, id, 20)
        expect(authority).toEqual(before)
        expect(next.commitments).not.toBe(authority.commitments)
        for (const previous of existing) expect(next.commitments.find((value) => value.productionId === previous.productionId)).toBe(previous)
        authority = next
      }
      expect(authority).toEqual({ commitments: expected })
    }
    // Detached lower-owner shape probe only, NOT a save/admission claim: this
    // append helper preserves equal-key rows; the separate save validator refuses duplicates.
    const first = withReleaseCommitment(initialReleaseAuthority(), 'prod-2', 20)
    const duplicate = withReleaseCommitment(first, 'prod-2', 21)
    expect(duplicate.commitments).toEqual([first.commitments[0], {
      productionId: 'prod-2', commitmentId: 'release-commitment-prod-2', committedAtWeek: 21,
    }])
    expect(duplicate.commitments[0]).toBe(first.commitments[0])
  })

  it('calls the actual allocator policy in input order but selects first-fit identically', () => {
    const state = tick(tick(greenlit()))
    const before = structuredClone(state)
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(7)
    expect(state.operations.facilities.filter((value) => value.capability === 'soundstage').map((value) => value.id))
      .toEqual(['facility-soundstage-07', 'facility-soundstage-12'])
    const original = rehearsalBranch(state, false), reversed = rehearsalBranch(state, true)
    expect(reversed.calls.map((value) => value.facilityId)).toEqual(original.calls.map((value) => value.facilityId).reverse())
    // Preserve each caller's facility-array order; normalize ONLY that input
    // representation after its exact reference/order assertions above.
    expect({ ...reversed.result, operations: { ...reversed.result.operations, facilities: state.operations.facilities } })
      .toEqual({ ...original.result, operations: { ...original.result.operations, facilities: state.operations.facilities } })
    expect(reversed.events).toEqual(original.events)
    expect(reversed.technology).toEqual(original.technology)
    expect(state).toEqual(before)
  })

  it('retains the real Annex slot after lower-ID base capacity becomes free', () => {
    // Exact existing sticky-retention route: historical-control founding and
    // explicitly ledger-balanced bootstrap funding, not natural-gameplay proof.
    let state = commitPlacement(withCash(managedStudio('c2a-m0-sticky-annex'), 80_000_000), {
      blueprintId: DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id, origin: { gx: 7, gy: 15 },
    })
    state = advance(state, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks)
    expect(state.operations.facilities.find((value) => value.id === 'facility-development-casting-annex')?.capacity)
      .toBe(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capacity)
    state = commissionExcept(state, new Set())
    const picture = state.scriptDevelopment.projects[0]!
    state = applyActions(tick(state), [{ kind: 'acceptScript', projectId: picture.id }])
    const excluded = new Set([picture.writerId])
    state = commissionExcept(state, excluded)
    excluded.add(state.scriptDevelopment.projects[1]!.writerId)
    state = commissionExcept(state, excluded)
    const drafts = state.scriptDevelopment.projects.filter((value) => value.reservation !== null)
    expect(drafts).toHaveLength(2)
    expect(drafts.map((value) => value.reservation!.facilityId))
      .toEqual(['facility-development-casting', 'facility-development-casting'])
    state = applyActions(state, [{ kind: 'greenlightScriptProject', production: greenlightPayload(state, picture.id) }])
    const held = state.operations.workflows[0]!.reservations[0]!
    expect(held.facilityId).toBe('facility-development-casting-annex')
    state = tick(state)
    expect(state.scriptDevelopment.projects.filter((value) => value.reservation !== null)).toEqual([])
    expect(state.operations.workflows[0]!.phase).toBe('development')
    const before = structuredClone(state)
    const after = tick(state)
    expect(after.operations.workflows[0]!.phase).toBe('preProduction')
    expect(after.operations.workflows[0]!.reservations).toEqual([{ ...held, phase: 'preProduction' }])
    expect(state).toEqual(before)
  })

  it('reaches actual Release Ready and commits without changing time, cash or RNG', () => {
    let state = greenlit()
    for (let attempt = 0; attempt < 20 && state.studio.activeProductions[0]!.remainingTicks !== 1; attempt++) {
      const production = state.studio.activeProductions[0]!
      if (production.remainingTicks === 5) {
        // Existing real lower-owner take controls, not fabricated work/history.
        let operations = assignShootingDirector(state.operations, production, production.directorId)
        operations = clearSceneryLoadIn(operations, production.id)
        operations = scheduleShootingTake(operations, production.id)
        state = { ...state, operations }
      }
      state = tick(state)
    }
    const production = state.studio.activeProductions[0]!
    expect(production.remainingTicks).toBe(1)
    expect(state.operations.workflows.find((value) => value.productionId === production.id)?.phase).toBe('releaseReady')
    expect(releaseCommitmentRefusal({ productions: state.studio.activeProductions,
      concepts: state.concepts, operations: state.operations, releaseAuthority: state.releaseAuthority }, production.id)).toBeNull()
    const before = structuredClone(state)
    const committed = applyActions(state, [{ kind: 'commitPictureToRelease', productionId: production.id }])
    expect(committed.releaseAuthority.commitments).toEqual([{ productionId: production.id,
      commitmentId: `release-commitment-${production.id}`, committedAtWeek: state.market.tick }])
    expect(committed.market.tick).toBe(state.market.tick)
    expect(committed.studio.cash).toBe(state.studio.cash)
    expect(committed.rngState).toBe(state.rngState)
    expect(committed.ledger).toEqual(state.ledger)
    expect(committed.studio.activeProductions).toEqual(state.studio.activeProductions)
    expect(committed.studio.releasedFilms).toEqual(state.studio.releasedFilms)
    expect(state).toEqual(before)
  })
})
