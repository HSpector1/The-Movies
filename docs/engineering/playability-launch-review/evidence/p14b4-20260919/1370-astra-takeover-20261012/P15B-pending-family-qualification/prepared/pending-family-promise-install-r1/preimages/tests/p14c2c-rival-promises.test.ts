// C.2c rival symmetry from genuine V35 corpus bytes, migrated before live use.
// The current OPEN promise is promise-148 on contract [2496,2704). Earlier
// promise-132 is SATISFIED and promise-142 BROKEN; neither is ever reopened.
// The count-two case alone is an explicitly labelled, whole-save-validated
// predicate variant. No production, receipt or historical fixture is invented.
import { describe, expect, it } from 'vitest'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { advancePromisesWeek, trustDrivers } from '../src/core/promises.js'
import type { GameState } from '../src/core/types.js'
import { c2bLiveFixture } from './helpers/p14c2b-fixtures.js'
import { advanceTo, ownOutcomeReceipt, promiseById, savedState, tick, withPromiseVariant } from './helpers/p14c2c-fixtures.js'

const PERSON = 'person-cohort-208-actor-1'
const ISSUER = 'studio-25969b11-r01'
const PROMISE = 'promise-148'
let cached: GameState | undefined
function beforeRivalCutoff(): GameState {
  if (cached === undefined) {
    const migrated = c2bLiveFixture('genuine-v35-c2b-rival-incumbent-cohorts')
    expect(promiseById(migrated, PROMISE)).toMatchObject({ outcome: null, progress: 0,
      beneficiaryPersonId: PERSON, issuerStudioId: ISSUER, windowStartWeek: 2496, dueWeekExclusive: 2704,
      contractId: 'studio-25969b11-r01:contract:person-cohort-208-actor-1:2496' })
    const at2695 = advanceTo(migrated, 2695)
    expect(retirementRecordFor(at2695, PERSON)).toMatchObject({ announcedWeek: 2566, effectiveWeek: 2704, status: 'announced' })
    expect(promiseById(at2695, PROMISE)).toMatchObject({ outcome: null, progress: 0 })
    const business = at2695.hollywood!.businesses.find((b) => b.studioId === ISSUER)!
    expect(business.productions, 'fixture premise: this genuine late-notice rival has no committed picture').toEqual([])
    cached = savedState(at2695)
  }
  return structuredClone(cached)
}

describe('P14C.2c rival retirement promises', () => {
  it('R1: a genuine bound rival promise follows the same exact cutoff, with no new trust penalty', () => {
    const before = beforeRivalCutoff()
    const terminals = before.promises.filter((p) => p.beneficiaryPersonId === PERSON && p.outcome !== null)
    expect(terminals.map((p) => p.outcome)).toEqual(['SATISFIED', 'BROKEN'])
    const trust = trustDrivers(before, PERSON, ISSUER, 2696)
    const after = tick(before)
    expect(promiseById(after, PROMISE)).toMatchObject({ outcome: 'VOIDED', outcomeWeek: 2696,
      dueWeekExclusive: 2704, progress: 0 })
    ownOutcomeReceipt(after, PROMISE)
    for (const terminal of terminals) expect(promiseById(after, terminal.promiseId)).toEqual(terminal)
    expect(trustDrivers(after, PERSON, ISSUER, 2696)).toEqual(trust)
    expect(advancePromisesWeek(after)).toEqual(after)
    savedState(after)
  })

  it('R2: a rival count already impossible without retirement remains OPEN until ordinary due settlement', () => {
    const variant = withPromiseVariant(beforeRivalCutoff(), PROMISE, { predicate: { count: 2 } })
    // No committed picture: even optimistic first takes 2701 and 2706 cannot
    // both fit in [2496,2704). This is not retirement-caused failure.
    const after = tick(variant)
    expect(promiseById(after, PROMISE).outcome).toBeNull()
    const due = advanceTo(after, 2704)
    expect(promiseById(due, PROMISE)).toMatchObject({ outcome: 'BROKEN', outcomeWeek: 2704 })
    ownOutcomeReceipt(due, PROMISE)
  })

  it('R3: real rival VOIDED replay across save/load preserves the source campaign and its outcome identity', () => {
    const before = beforeRivalCutoff()
    const source = structuredClone(before)
    const continuous = tick(before)
    const reloaded = tick(savedState(before))
    expect(promiseById(reloaded, PROMISE).outcome).toBe('VOIDED')
    expect(JSON.stringify(reloaded)).toBe(JSON.stringify(continuous))
    expect(before).toEqual(source)
    expect(promiseById(tick(reloaded), PROMISE)).toEqual(promiseById(reloaded, PROMISE))
  })
})
