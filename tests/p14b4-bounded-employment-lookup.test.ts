// Independent289 employment lookup regressions; installed after291 qualified KEEP.
//289: adopted288 shared-owner law; no replay implementation or private bill oracle.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import * as sortModule from '../src/core/boundedStableSort.js'
import { employmentStatus, freelancerMarketIds } from '../src/core/employment.js'
import { initializeHollywood, rivalEmployment, studioEmployerId } from '../src/core/hollywood.js'
import type { HollywoodState, IndustryEmployment } from '../src/core/hollywoodTypes.js'
import { makeSave } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { foundedStudio, SEED } from './_p04a2WriterCreditFixtures.js'

type OwnerInput = Pick<GameState, 'hollywood'>
const clone = <T>(value: T): T => structuredClone(value)

function genuine() {
  // Disclosed historical-control founding with REAL hire/found actions, then
  // genuine fresh industry at week0. No employment/history field is stamped.
  const state = initializeHollywood(foundedStudio(SEED), 'fresh')
  expect(state.market.tick).toBe(0)
  assert.ok(state.hollywood)
  expect(state.hollywood.employment.length).toBeGreaterThan(0)
  makeSave(state)
  return { state, hollywood: state.hollywood }
}

// Independent original-array-order oracle, not an index or a solver copy.
function firstEligible(input: OwnerInput, personId: string, week: number): IndustryEmployment | null {
  const h = input.hollywood
  if (h === null) return null
  return h.employment.find((row) => row.terms.talentId === personId && row.studioId !== h.playerStudioId &&
    row.terms.startWeek <= week && week < row.terms.endWeekExclusive &&
    (row.endedWeek === null || week < row.endedWeek)) ?? null
}

function check(input: OwnerInput, personId: string, week: number, expected: IndustryEmployment | null) {
  const before = clone(input), refs = input.hollywood?.employment.slice() ?? []
  expect(firstEligible(input, personId, week)).toBe(expected)
  expect(rivalEmployment(input, personId, week)).toBe(expected)
  expect(input).toEqual(before)
  input.hollywood?.employment.forEach((row, index) => expect(row).toBe(refs[index]))
}

function detached(hollywood: HollywoodState, rows: IndustryEmployment[], playerStudioId = hollywood.playerStudioId): OwnerInput {
  // Explicit SYNTHETIC lower-owner probe. This is NOT a valid campaign/history
  // and is never cast to GameState, saved, ticked or passed to a gameplay action.
  return { hollywood: { ...hollywood, employment: rows, playerStudioId } }
}

function probe() {
  const { hollywood } = genuine(), template = hollywood.employment[0]!
  const own = hollywood.playerStudioId, rivalIds = hollywood.identities
    .filter((row) => row.role === 'rival' && row.enteredWeek !== null).map((row) => row.studioId)
  expect(rivalIds.length).toBeGreaterThanOrEqual(2)
  const a = rivalIds[0]!, b = rivalIds[1]!
  const row = (name: string, person: string, studioId: string, startWeek: number,
    endWeekExclusive: number, endedWeek: number | null = null): IndustryEmployment => ({
    ...template, contractId: `probe-${name}`, studioId, endedWeek,
    terms: { ...template.terms, talentId: person, startWeek, endWeekExclusive, termWeeks: endWeekExclusive - startWeek },
  })
  const z = row('z', 'probe-z', a, 0, 104)
  const player = row('player-m', 'probe-m', own, 0, 104)
  const upper = row('upper', 'probe-A', a, 0, 104)
  const future = row('future-m', 'probe-m', a, 20, 124)
  const middle = row('middle', 'probe-h', b, 0, 104)
  const ended = row('ended-m', 'probe-m', a, 10, 114, 30)
  const later = row('later-m', 'probe-m', b, 10, 114)
  const old = row('old-m', 'probe-m', a, 0, 52, 10)
  const prefix = row('prefix', 'probe-m0', a, 0, 104)
  const competitor = row('competitor-m', 'probe-m', a, 10, 114)
  const expiry = row('expiry', 'probe-boundary', a, 10, 62)
  const earlyEnd = row('early-end', 'probe-ended', a, 10, 114, 30)
  const rows = [z, player, upper, future, middle, ended, later, old, prefix, competitor, expiry, earlyEnd]
  return { hollywood, own, a, b, rows, player, future, ended, later, old, competitor, expiry, earlyEnd }
}

describe('P14B4 rivalEmployment — ordinary owner semantics', () => {
  it('returns genuine original rival rows and preserves ordinary employment/freelancer callers', () => {
    const { state, hollywood } = genuine(), before = clone(state)
    const rivals = hollywood.employment.filter((row) => row.studioId !== hollywood.playerStudioId &&
      row.terms.startWeek <= state.market.tick && state.market.tick < row.terms.endWeekExclusive && row.endedWeek === null)
    expect(rivals.length).toBeGreaterThan(0)
    expect(hollywood.employment.some((row) => row.studioId === hollywood.playerStudioId)).toBe(true)
    const people = [...new Set(hollywood.employment.map((row) => row.terms.talentId))]
    for (const id of people) check(state, id, state.market.tick, firstEligible(state, id, state.market.tick))
    const sample = rivals[0]!, selected = firstEligible(state, sample.terms.talentId, state.market.tick)
    assert.ok(selected)
    expect(rivalEmployment(state, sample.terms.talentId, state.market.tick)).toBe(selected)
    expect(studioEmployerId(state, sample.terms.talentId)).toBe(selected.studioId)
    expect(employmentStatus(state, sample.terms.talentId)).toBe('unavailable')
    const freelance = freelancerMarketIds(state)
    for (const row of rivals) expect(freelance).not.toContain(row.terms.talentId)
    expect(state).toEqual(before)
  })

  it('returns null for null/empty roots and IDs before, within and after a nonempty lexical domain', () => {
    check({ hollywood: null }, 'missing', 10, null)
    const f = probe()
    check(detached(f.hollywood, []), 'probe-m', 10, null)
    const input = detached(f.hollywood, f.rows)
    for (const missing of ['', 'probe-0', 'probe-g', 'probe-missing', 'zz-last']) check(input, missing, 10, null)
  })

  it('preserves original equal-ID order with interleaved rows, competing eligible rows and query-time player changes', () => {
    const f = probe(), input = detached(f.hollywood, f.rows)
    for (const [week, expected] of [
      [9, f.old], [10, f.ended], [19, f.ended], [20, f.future], [29, f.future],
      [30, f.future], [113, f.future], [114, f.future], [123, f.future], [124, null],
    ] satisfies Array<[number, IndustryEmployment | null]>) check(input, 'probe-m', week, expected)
    // SAME employment array, different Hollywood wrapper/player. The original
    // player's row now qualifies; it must not have been filtered from the cache.
    const changedPlayer = detached(f.hollywood, f.rows, f.a)
    check(changedPlayer, 'probe-m', 20, f.player)
    check(input, 'probe-m', 20, f.future)
    expect(changedPlayer.hollywood!.employment).toBe(input.hollywood!.employment)
    const reversed = detached(f.hollywood, [...f.rows].reverse())
    check(reversed, 'probe-m', 20, f.competitor)
    check(input, 'probe-m', 20, f.future)
  })

  it('keeps inclusive starts, exclusive contractual ends, exclusive endedWeek and null-ended contracts', () => {
    const f = probe(), input = detached(f.hollywood, f.rows)
    for (const [week, expected] of [[9, null], [10, f.expiry], [61, f.expiry], [62, null]] satisfies Array<[number, IndustryEmployment | null]>) check(input, 'probe-boundary', week, expected)
    for (const [week, expected] of [[9, null], [10, f.earlyEnd], [29, f.earlyEnd], [30, null], [114, null]] satisfies Array<[number, IndustryEmployment | null]>) check(input, 'probe-ended', week, expected)
  })
})

describe('P14B4 rivalEmployment — adopted288 cold bounded index contract', () => {
  it('uses the real bounded stable sort once per employment-array identity, preserves all original row refs, and caches no eligibility result', () => {
    const f = probe(), input = detached(f.hollywood, f.rows), before = clone(input)
    const original = sortModule.boundedStableSort
    const calls: { source: readonly unknown[]; result: readonly unknown[]; comparisons: number }[] = []
    // Frozen input detects in-place sorting; row/term freezes remain correctly
    // typed detached probe facts, not a forged or validated campaign.
    Object.freeze(f.rows)
    for (const row of f.rows) { Object.freeze(row.terms); Object.freeze(row) }
    const spy = vi.spyOn(sortModule, 'boundedStableSort').mockImplementation(
      <T>(values: readonly T[], compare: (left: T, right: T) => number): T[] => {
        let comparisons = 0
        const result = original(values, (left, right) => { comparisons++; return compare(left, right) })
        calls.push({ source: values, result, comparisons })
        return result // preserve the actual shared helper's result, never stub it
      })
    try {
      check(input, 'probe-m', 10, f.ended)
      expect(calls).toHaveLength(1) // old Map owner should RED here, not on fake policy
      const cold = calls[0]!, expected = [...f.rows].sort((left, right) =>
        left.terms.talentId < right.terms.talentId ? -1 : left.terms.talentId > right.terms.talentId ? 1 : 0)
      expect(cold.source).toHaveLength(f.rows.length)
      cold.source.forEach((row, index) => expect(row).toBe(f.rows[index]))
      expect(cold.result).not.toBe(f.rows)
      expect(cold.result).toEqual(expected)
      cold.result.forEach((row, index) => expect(row).toBe(expected[index]))
      expect(cold.comparisons).toBeGreaterThan(0)
      expect(cold.comparisons).toBeLessThanOrEqual(f.rows.length * Math.ceil(Math.log2(f.rows.length)))
      check(input, 'probe-m', 9, f.old)
      check(input, 'probe-m', 20, f.future)
      check(input, 'absent', 20, null)
      check(detached(f.hollywood, f.rows, f.a), 'probe-m', 20, f.player)
      check(input, 'probe-ended', 30, null)
      expect(calls).toHaveLength(1)
      const replacement = [...f.rows].reverse()
      check(detached(f.hollywood, replacement), 'probe-m', 20, f.competitor)
      expect(calls).toHaveLength(2)
      expect(calls[1]!.source).toEqual(replacement)
      calls[1]!.source.forEach((row, index) => expect(row).toBe(replacement[index]))
      check(input, 'probe-m', 10, f.ended)
      expect(calls).toHaveLength(2)
      expect(input).toEqual(before)
    } finally { spy.mockRestore() }
  })
})
