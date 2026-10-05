// Existing genuine312 only: zero ticks, one actual historical admission, no repaired state.
import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { recoveryOldPeriod26 } from './helpers/1367-recovery-predecessors.js'
import { validateSaveV26, validateSaveV27, migrateToV27, stableStringify } from '../src/core/save.js'
import { admitRivalPlans } from '../src/core/rivalResearch.js'
import { rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { blueprintById, physicalQuoteFingerprint } from '../src/core/placement.js'
import type { GameState } from '../src/core/types.js'

it('observes exact existing312 admission prerequisites without inventing a booking', () => {
  const old = recoveryOldPeriod26(), oldBefore = stableStringify(old), oldJson = JSON.stringify(old)
  expect(validateSaveV26(old)).toBe(old)
  const lifted = migrateToV27(old), before = stableStringify(lifted), json = JSON.stringify(lifted)
  expect(validateSaveV27(lifted)).toBe(lifted)
  expect(lifted.state.market.tick).toBe(312)
  expect(lifted.state.hollywood).not.toBeNull()
  const state = lifted.state as unknown as GameState, h = state.hollywood!
  const blueprint = blueprintById('research-laboratory')!
  expect(blueprint).not.toBeNull()
  const quote = { cost: blueprint.capex, buildWeeks: blueprint.buildWeeks,
    weeklyOperatingCost: blueprint.weeklyOperatingCost,
    components: (blueprint.installationComponents ?? []).map(c => ({ label: c.label, cost: c.cost, weeks: c.weeks })) }
  const fingerprint = physicalQuoteFingerprint({ kind: 'placement', blueprintId: blueprint.id,
    target: '0,0', ...quote })
  const owners = h.businesses.map(owner => {
    const laboratories = owner.operations.facilities.filter(f => f.capability === 'laboratory')
    const plans = state.physicalPlans.plans.filter(p => p.studioId === owner.studioId)
    const bodyPlans = plans.filter(p => p.work.blueprintId === 'research-laboratory')
    const seats = state.technology.projects.filter(p => p.studioId === owner.studioId)
      .flatMap(p => p.seats.filter(s => s.releasedWeek === null).map(s => ({ projectId: p.id, talentId: s.talentId,
        laboratoryFacilityId: s.laboratoryFacilityId })))
    const capacity = laboratories.reduce((sum, f) => sum + f.capacity, 0)
    const wantsFirst = bodyPlans.length === 0
    const wantsSecond = bodyPlans.length < 2 && laboratories.length > 0 && seats.length >= capacity
    const weeklyCost = rivalWeeklyOperatingCost(owner, h, 312), reserve = weeklyCost * owner.policy.reserveWeeks
    const last = owner.account.periods.at(-1)!
    return { studioId: owner.studioId, cash: owner.account.cash, weeklyCost,
      reserveWeeks: owner.policy.reserveWeeks, reserve, quote: { ...quote, fingerprint },
      slack: owner.account.cash - quote.cost - reserve, affordable: owner.account.cash >= quote.cost + reserve,
      laboratories, bodyPlanCount: bodyPlans.length, unreleasedSeats: seats, capacity,
      wantsFirst, wantsSecond, wantsLaboratory: wantsFirst || wantsSecond,
      plans: plans.map(p => ({ id: p.id, status: p.status, statusWeek: p.statusWeek, work: p.work,
        dependsOn: p.dependsOn, approvedQuote: p.approvedQuote, commitReceipt: p.commitReceipt })),
      lastPeriod: { fromWeek: last.fromWeek, throughWeek: last.throughWeek, opening: last.opening,
        closing: last.closing, movementKeys: Object.keys(last.movements) },
      first312ChargeWouldOpenPeriod: Math.floor(last.fromWeek / 52) !== Math.floor(312 / 52),
    }
  })
  const oldIds = new Set(state.physicalPlans.plans.map(p => p.id))
  const result = admitRivalPlans(state, 'pre-recovery') // Exactly one real policy call.
  const newPlans = result.state.physicalPlans.plans.filter(p => !oldIds.has(p.id))
  const output = { ...lifted, state: result.state }
  const outputBefore = stableStringify(output)
  let outputAdmission: { admitted: true } | { admitted: false; message: string }
  try { validateSaveV27(output); outputAdmission = { admitted: true } }
  catch (error) { outputAdmission = { admitted: false, message: error instanceof Error ? error.message : String(error) } }
  const neutral = stableStringify(lifted) === before && JSON.stringify(lifted) === json
    && stableStringify(old) === oldBefore && JSON.stringify(old) === oldJson
  console.log('1367_PERIOD312_DIAGNOSTIC ' + JSON.stringify({ format: '1367-period312-diagnostic/v1',
    week: 312, inputSha256: createHash('sha256').update(before).digest('hex'), baselineAdmitted: true,
    owners, newPlans: newPlans.map(p => ({ id: p.id, studioId: p.studioId, work: p.work, commitReceipt: p.commitReceipt })),
    history: result.history, outputAdmission, inputNeutral: neutral,
    outputReaderNeutral: stableStringify(output) === outputBefore,
  }))
  expect(neutral).toBe(true)
  expect(stableStringify(output)).toBe(outputBefore)
  expect(outputAdmission.admitted).toBe(true)
  expect(result.history).toEqual([])
  // No newPlans>0 assertion here: this observes the missing premise and does not
  // replace or relax the original failing positive first-charge test.
})
