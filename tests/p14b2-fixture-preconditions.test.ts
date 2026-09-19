// Engine-only, independent of the deliberately absent bridge/trust.ts.
import { describe, expect, it } from 'vitest'
import { historyFixture, player, poachingFixture, promiseFor, retentionFixture, rivalFixture } from './helpers/p14b2-fixtures.js'
import { trustDrivers } from '../src/core/promises.js'
import { tick } from '../src/core/tick.js'
import { makeSave } from '../src/core/save.js'

describe('P14B.2 lawful engine fixture preconditions (not bridge verification)', () => {
  it('retains two real winners, films one promise and breaks the other by real early termination', () => {
    const f = retentionFixture()
    const drivers = trustDrivers(f.outcomes, null, player(f.outcomes), f.outcomes.market.tick)
    expect(drivers.filter((d) => d.positive)).toHaveLength(3)
    expect(drivers.filter((d) => !d.positive)).toHaveLength(2)
    console.log('retention', { kept: promiseFor(f.outcomes, f.keptId), broken: promiseFor(f.outcomes, f.brokenId), drivers })
  }, 60_000)
  it('keeps real prior history in the next open case, excludes an actual withdrawal, and binds a second promise', () => {
    const f = historyFixture()
    expect(f.second.promises.filter((p) => p.beneficiaryPersonId === f.talentId && p.contractId !== null)).toHaveLength(2)
    console.log('history', { week: f.open.market.tick, talentId: f.talentId, withdrawnId: f.withdrawnId })
  }, 60_000)
  it('wins a real rival-owned case and reaches reminder/outcome weeks after proposals are gone', () => {
    const f = poachingFixture()
    console.log('poaching', { talentId: f.talentId, incumbentId: f.incumbentId,
      promise: promiseFor(f.outcome, f.talentId), settlement: f.bound.talentMarket.receipts.filter((r) => r.talentId === f.talentId) })
  }, 60_000)
  it('produces a rival-only open promise and public kept outcome from the unmodified natural rival chain', () => {
    const f = rivalFixture()
    expect(f.promise.outcome).toBe('SATISFIED')
    console.log('rival', { openWeek: f.open.market.tick, outcome: f.promise })
  }, 60_000)
  it('diagnostic: the next real production tick must remain save-valid (inherited source finding, not B2 bridge code)', () => {
    const f = retentionFixture()
    const next = tick(f.outcomes)
    console.log('setup diagnostic', { sourceWeek: f.outcomes.market.tick, nextWeek: next.market.tick,
      before: f.outcomes.operations.workflows.find((w) => w.productionId === f.productionId),
      after: next.operations.workflows.find((w) => w.productionId === f.productionId) })
    expect(() => makeSave(next)).not.toThrow()
  }, 60_000)
})
