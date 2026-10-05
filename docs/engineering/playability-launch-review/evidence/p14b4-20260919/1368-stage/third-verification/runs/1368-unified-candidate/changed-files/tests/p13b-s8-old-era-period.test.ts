// Explicit historical admission regression. No root stripping, clock edit or cash repair.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import { admitRivalPlans } from '../src/core/rivalResearch.js'
import type { GameState } from '../src/core/types.js'
import { acceptedPeriod52 } from './helpers/1368-recovery-witnesses.js'

const INPUT_RAW_SHA = '11ef05be4131d3d3c4a19484f31e79cb50fa1936868f96ace7d0d18ea86e2d72'
const INPUT = './fixtures/p13b/legacy-v26-sound-mid-deployment-309.json.gz'
const V27_KINDS = ['capacity', 'signing', 'payroll', 'overhead', 'facilityOpex', 'development',
  'production', 'marketing', 'studioRevenue', 'technologyAdoption', 'researchSpend',
  'researchCapacity', 'technologyRestoration', 'technologyRefund'].sort()
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const bytes = save.stableStringify
const historicalAdmission = admitRivalPlans as unknown as (state: GameState, era: 'pre-recovery') => {
  state: GameState; history: readonly unknown[]
}
function initial309() {
  const raw = gunzipSync(readFileSync(new URL(INPUT, import.meta.url))).toString('utf8')
  expect(sha(raw)).toBe(INPUT_RAW_SHA)
  const parsed: unknown = JSON.parse(raw), before = bytes(parsed)
  const value = save.validateSaveV26(parsed)
  expect(bytes(parsed)).toBe(before)
  expect(value.state.market.tick).toBe(309)
  return value
}
function admittedLift(value: ReturnType<typeof initial309>) {
  expect(save.validateSaveV26(value)).toBe(value)
  const before = bytes(value)
  const lifted = save.migrateToV27(value)
  expect(save.validateSaveV27(lifted)).toBe(lifted)
  expect(bytes(value)).toBe(before)
  expect(lifted.state.hollywood).not.toBeNull()
  for (const b of lifted.state.hollywood!.businesses) {
    expect(Object.hasOwn(b, 'costCutting')).toBe(false)
    for (const p of b.account.periods) expect(Object.keys(p.movements).sort()).toEqual(V27_KINDS)
  }
  return lifted
}
function stage(lifted: ReturnType<typeof admittedLift>, rollover: boolean) {
  const before = bytes(lifted)
  const result = historicalAdmission(lifted.state as unknown as GameState, 'pre-recovery')
  expect(result.history).toEqual([])
  expect(bytes(lifted)).toBe(before)
  const oldIds = new Set(lifted.state.physicalPlans.plans.map(p => p.id))
  const newPlans = result.state.physicalPlans.plans.filter(p => !oldIds.has(p.id))
  expect(newPlans.length, 'UNMET VALID PREMISE: actual admitted V27 rival must afford at least one new Laboratory').toBeGreaterThan(0)
  expect(result.state.market.tick).toBe(lifted.state.market.tick)
  expect(result.state.hollywood!.receipts.slice(0, lifted.state.hollywood!.receipts.length)).toEqual(lifted.state.hollywood!.receipts)
  let changed = 0
  for (const owner of result.state.hollywood!.businesses) {
    const original = lifted.state.hollywood!.businesses.find(b => b.studioId === owner.studioId)!
    const ownNew = newPlans.filter(p => p.studioId === owner.studioId)
    if (!ownNew.length) { expect(owner).toEqual(original); continue }
    changed++
    // The real V26 predecessor has no rival research plant; actual V27 admission
    // therefore commits paid body plans, not a forged finance-only movement.
    for (const plan of ownNew) {
      expect(plan.work).toMatchObject({ kind: 'placement', blueprintId: 'research-laboratory' })
      expect(plan.status).toBe('started')
      expect(plan.commitReceipt).not.toBeNull()
      expect(plan.commitReceipt!.week).toBe(lifted.state.market.tick)
      expect(plan.commitReceipt!.cost).toBe(plan.approvedQuote.cost)
      expect(plan.commitReceipt!.cost).toBeGreaterThan(0)
      expect(result.state.hollywood!.receipts.filter(r => r.kind === 'laboratoryCommitted' && r.planId === plan.id)).toHaveLength(1)
    }
    const debit = ownNew.reduce((sum, p) => sum + p.commitReceipt!.cost, 0)
    expect(owner.account.cash).toBe(original.account.cash - debit)
    const previous = original.account.periods.at(-1)!
    const last = owner.account.periods.at(-1)!
    expect(Math.floor(previous.fromWeek / 52) === Math.floor(lifted.state.market.tick / 52)).toBe(!rollover)
    expect(owner.account.periods.length).toBe(original.account.periods.length + Number(rollover))
    if (rollover) {
      expect(previous.throughWeek).toBeLessThan(lifted.state.market.tick)
      expect(owner.account.periods.slice(0, -1)).toEqual(original.account.periods)
      expect(last.fromWeek).toBe(lifted.state.market.tick)
      expect(last.throughWeek).toBe(lifted.state.market.tick)
      expect(last.opening).toBe(original.account.cash)
      expect(last.closing).toBe(owner.account.cash)
      expect(last.movements.researchCapacity).toBe(-debit)
      for (const [kind, amount] of Object.entries(last.movements)) if (kind !== 'researchCapacity') expect(amount).toBe(0)
    }
    // Target regression: a new period must keep the admitted V27 money roster.
    // Explicitly protects against BOTH inherited Save41 and new Save46 leakage.
    expect(Object.keys(last.movements).sort()).toEqual(V27_KINDS)
    expect(Object.hasOwn(last.movements, 'termination')).toBe(false)
    expect(Object.hasOwn(last.movements, 'facilityDemolitionRefund')).toBe(false)
    expect(Object.hasOwn(owner, 'costCutting')).toBe(false)
  }
  expect(changed).toBeGreaterThan(0)
  const out = { ...lifted, state: result.state }
  expect(save.validateSaveV27(out)).toBe(out)
  const serialized = save.exportSave(out as unknown as Parameters<typeof save.exportSave>[0])
  expect(bytes(save.importSave(serialized))).toBe(bytes(out))
  expect(bytes(lifted)).toBe(before)
}

describe('1363 explicit V27 staging keeps its finance era across a calendar boundary', () => {
  it('control: actual week309 admission retains the current old period and public V27 validity', () => {
    stage(admittedLift(initial309()), false)
  })
  it('real original26 week52 first charge opens exactly one old-era period without termination or disposal fields', () => {
    // The original312 missing-affordability run and input remain retained evidence.
    const original = acceptedPeriod52()
    expect(original.state.market.tick).toBe(52)
    stage(admittedLift(original), true)
  })
})
