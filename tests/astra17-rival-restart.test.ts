// ASTRA Sprint 17 (Owner decision A, 2026-10-29: the 4a direction). A rival in 1363-F cost cutting re-examines a
// restart at a bounded cadence; it leaves cutting only when the ordinary staffing and decision laws, run once on
// private copies with the restrictions lifted, would commission a screenplay or greenlight a film that week.
// Nothing is forced: the real pass then repeats the same deterministic laws on the real records. The entry law,
// the R3 release law, the greenlight exit and the 1366-O O6 loan exit are unchanged.
import { describe, expect, it, vi } from 'vitest'
import * as policyModule from '../src/core/hollywoodPolicy.js'
import { tick } from '../src/core/tick.js'
import { exportSave, importSave, makeSave, migrateToLive } from '../src/core/save.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import { TUNING } from '../src/core/tuning.js'
import { liveWeek100, liveWeek130, RIVAL_R01 } from './p14d1-rival-shelving-fixtures.js'
import type { GameState } from '../src/core/types.js'
import type { IndustryReceipt, RivalBusiness } from '../src/core/hollywoodTypes.js'

// The two 1363-suite helpers, inlined so importing them does not re-run that suite's 53 tests here.
const business = (s: GameState, id: string): RivalBusiness => s.hollywood!.businesses.find(b => b.studioId === id)!
/** A labelled synthetic policy-state control (the 1363 suite's cuttingInput): never evidence that entry occurred naturally. */
function cuttingInput(input: GameState, id: string): GameState {
  makeSave(input)
  const state = structuredClone(input), b = business(state, id)
  expect(b.costCutting).toEqual({ version: 1, since: null })
  expect(b.productions).toHaveLength(0)
  expect(b.runs).toHaveLength(0)
  b.costCutting = { version: 1, since: state.market.tick }
  makeSave(state)
  return state
}

const RETRY = TUNING.HOLLYWOOD_SHELVED_RETRY_WEEKS
const rowOne = (s: GameState) => s.hollywood!.identities.find(row => row.row === 1)!.studioId
const receiptsOf = (s: GameState, id: string, from: number): IndustryReceipt[] =>
  s.hollywood!.receipts.filter(r => r.studioId === id && r.week >= from)
const hires = (rows: IndustryReceipt[], id: string) =>
  rows.filter(r => r.kind === 'employment' && r.toStudioId === id && r.fromStudioId !== id)
const terminations = (rows: IndustryReceipt[]) => rows.filter(r => r.kind === 'employment' && r.reason === 'termination')
const movements = (s: GameState, id: string): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const p of business(s, id).account.periods) for (const [kind, value] of Object.entries(p.movements)) out[kind] = (out[kind] ?? 0) + value
  return out
}
function roundTrip(state: GameState): GameState {
  const exported = exportSave(makeSave(state))
  const reloaded = migrateToLive(importSave(exported)).state as GameState
  // Stable serialization on both sides: key order is not state.
  expect(exportSave(makeSave(reloaded))).toBe(exported)
  return reloaded
}

describe('restart examination cadence (pure policy, provisional hysteresis)', () => {
  it('is due one shelved-retry interval after entry and at every later multiple, never before', () => {
    const api = policyModule as unknown as { rivalCostCuttingRestartDue?: (since: number, week: number) => boolean }
    expect(typeof api.rivalCostCuttingRestartDue, 'missing the Sprint 17 restart cadence seam').toBe('function')
    const due = api.rivalCostCuttingRestartDue!
    expect(due(100, 100)).toBe(false)
    expect(due(100, 101)).toBe(false)
    expect(due(100, 100 + RETRY - 1)).toBe(false)
    expect(due(100, 100 + RETRY)).toBe(true)
    expect(due(100, 100 + RETRY + 1)).toBe(false)
    expect(due(100, 100 + 2 * RETRY)).toBe(true)
  })
})

describe('a released team restarts when the ordinary laws would commission (p13a-core-causal-01, row one)', () => {
  // The world is the one the 1363 suite uses for its "real ordinary greenlight" premise. Entry at week 3 is the
  // labelled synthetic control cuttingInput() writes (never evidence of natural entry); everything after it is
  // natural ticks under the real laws.
  const TIMEOUT = 60_000
  it('stays restricted through the interval, then exits, re-staffs at its own cost, greenlights and commissions in one week; the save round-trips', () => {
    const original = advanceTo(p13aGeneratedStudio(), 3), id = rowOne(original)
    let state = cuttingInput(original, id)
    const since = state.market.tick
    expect(business(state, id).costCutting.since).toBe(since)
    const cashAtEntry = business(state, id).account.cash
    // Weeks since .. since + RETRY - 1: cutting holds. The R3 release law may shed people (real charges); nothing is hired.
    for (let w = 0; w < RETRY; w++) {
      state = tick(state)
      expect(business(state, id).costCutting.since, `week ${state.market.tick}`).toBe(since)
    }
    const beforeRestart = state
    const shed = terminations(receiptsOf(beforeRestart, id, since))
    expect(shed.length, 'premise: the release law actually shed people while cutting').toBeGreaterThan(0)
    expect(hires(receiptsOf(beforeRestart, id, since), id)).toHaveLength(0)
    expect(business(beforeRestart, id).account.cash).toBeLessThan(cashAtEntry)
    // The restart week: since + RETRY.
    expect(beforeRestart.market.tick).toBe(since + RETRY)
    const restarted = tick(beforeRestart)
    const week = beforeRestart.market.tick
    const b = business(restarted, id)
    expect(b.costCutting.since, 'the examination passed: cutting ended').toBeNull()
    const rows = receiptsOf(restarted, id, week)
    const hired = hires(rows, id)
    expect(hired.length, 'the ordinary staffing law filled the shed roles').toBeGreaterThan(0)
    const commissioned = b.development.projects.length > business(beforeRestart, id).development.projects.length
    const announced = rows.some(r => r.kind === 'filmAnnounced')
    expect(announced, 'the ready screenplay was greenlit with the restored team').toBe(true)
    expect(commissioned, 'and the freed index slot took a new commission in the same decision').toBe(true)
    // Costs are real: signing bonuses for the hires were paid from the rival's own account this week.
    const before = movements(beforeRestart, id), after = movements(restarted, id)
    expect(after['signing']!).toBeLessThan(before['signing']!)
    expect(after['loanPrincipal'] ?? 0).toBe(before['loanPrincipal'] ?? 0)
    expect(restarted.corporateCondition?.loans.filter(l => l.studioId === id) ?? []).toEqual(beforeRestart.corporateCondition?.loans.filter(l => l.studioId === id) ?? [])
    // Save, reload, continue: the restarted rival keeps its work and does not re-enter while that work is in hand.
    const reloaded = roundTrip(restarted)
    let next = reloaded
    for (let w = 0; w < 3; w++) {
      next = tick(next)
      expect(business(next, id).costCutting.since, `week ${next.market.tick}`).toBeNull()
    }
    makeSave(next)
  }, TIMEOUT)
})

describe('no restart without an opportunity (genuine v42 week-130 stall fixture, rival r01)', () => {
  // r01 holds 18 M in cash and a full team but a full index of ready screenplays the market keeps rejecting
  // (the 1344 shelving fixture). Cash is not an opportunity: the examination runs at the interval and fails,
  // cutting continues, and no hire, loan or film is created by the policy.
  const TIMEOUT = 120_000
  it('examines at the interval, finds no commission or greenlight, keeps every restriction, and the failed examination leaves no trace', () => {
    const original = liveWeek130()
    let state = cuttingInput(original, RIVAL_R01)
    const since = state.market.tick
    const projectsBefore = business(state, RIVAL_R01).development.projects.length
    for (let w = 0; w < RETRY; w++) {
      state = tick(state)
      expect(business(state, RIVAL_R01).costCutting.since, `week ${state.market.tick}`).toBe(since)
    }
    expect(state.market.tick).toBe(since + RETRY)
    // The examination week, observed through the cadence seam: it ran for r01 and failed.
    const api = policyModule as unknown as { rivalCostCuttingRestartDue: (since: number, week: number) => boolean }
    const spy = vi.spyOn(api, 'rivalCostCuttingRestartDue')
    let live: GameState
    try {
      live = tick(state)
      expect(spy.mock.calls.some(([s, w]) => s === since && w === since + RETRY), 'the examination was due and consulted').toBe(true)
      expect(business(live, RIVAL_R01).costCutting.since).toBe(since)
      // With the cadence forced off, the same week produces the same save byte for byte: a failed examination keeps nothing.
      spy.mockReturnValue(false)
      const skipped = tick(state)
      expect(exportSave(makeSave(skipped))).toBe(exportSave(makeSave(live)))
    } finally { spy.mockRestore() }
    state = live
    expect(state.market.tick).toBe(since + RETRY + 1)
    const rows = receiptsOf(state, RIVAL_R01, since)
    expect(hires(rows, RIVAL_R01)).toHaveLength(0)
    expect(rows.some(r => r.kind === 'filmAnnounced')).toBe(false)
    expect(business(state, RIVAL_R01).development.projects.length).toBe(projectsBefore)
    expect(movements(state, RIVAL_R01)['loanPrincipal'] ?? 0).toBe(movements(original, RIVAL_R01)['loanPrincipal'] ?? 0)
    makeSave(state)
  }, TIMEOUT)
})

describe('an opportunity without the money stays in cutting (genuine v42 week-100 fixture, rival r04)', () => {
  // r04 at week 100 holds one ready screenplay, a six-person team and 3.75 M in cash: the cash level the natural
  // entries show (ENTRY.md, 4c correction). After the release law's charges the examination finds the restart
  // unaffordable under the ordinary reserve and package laws, so the rival stays in cutting with nothing created.
  const TIMEOUT = 120_000
  it('is examined at the interval and refused for cash, not for want of a screenplay', () => {
    const original = liveWeek100()
    const id = original.hollywood!.businesses.find(b => b.studioId.endsWith('-r04'))!.studioId
    expect(business(original, id).development.projects.filter(p => p.status === 'ready'), 'premise: one ready screenplay').toHaveLength(1)
    let state = cuttingInput(original, id)
    const since = state.market.tick
    for (let w = 0; w < RETRY; w++) state = tick(state)
    const shed = terminations(receiptsOf(state, id, since))
    expect(shed.length, 'premise: the release law shed people').toBeGreaterThan(0)
    const api = policyModule as unknown as { rivalCostCuttingRestartDue: (since: number, week: number) => boolean }
    const spy = vi.spyOn(api, 'rivalCostCuttingRestartDue')
    let next: GameState
    try {
      next = tick(state)
      expect(spy.mock.calls.some(([s, w]) => s === since && w === since + RETRY), 'the examination was due and consulted').toBe(true)
    } finally { spy.mockRestore() }
    expect(business(next, id).costCutting.since).toBe(since)
    const rows = receiptsOf(next, id, since + RETRY)
    expect(hires(rows, id)).toHaveLength(0)
    expect(rows.some(r => r.kind === 'filmAnnounced')).toBe(false)
    expect(business(next, id).development.projects.filter(p => p.status === 'ready')).toHaveLength(1)
    expect(movements(next, id)['loanPrincipal'] ?? 0).toBe(movements(original, id)['loanPrincipal'] ?? 0)
    makeSave(next)
  }, TIMEOUT)
})
