// ── P15A.2 Wave 2 slice 2a — the tick step in isolation, RED tests (record 1356-C; r2 1356-C2) ──
//
// Authority: 1356-A §4 (the step wraps tick()'s last expression, `tick.ts:1160`, appends one
// record when `hollywood !== null` and `isPowerRankingWeek(W)`, writes nothing else) and §8 RED
// 9 (`rank-step-final-facts`) and RED 10 (`rank-step-only-writes-archive`); 1355-F2 item 2 (the
// record is allocated from `p15Sequence.next`, so the step also advances the allocator). The
// other slice 2a leaves live in tests/p15a2-power-ranking-archive.test.ts.
//
// METHOD. This file mocks `src/core/powerRankingArchive.ts` around its real export (vitest
// `vi.mock` + `importOriginal`): `recordPowerRankingQuarter` becomes a wrapper that records the
// state it receives and can be switched off. Its own file keeps the mock out of every other leaf.
// RED 10 runs one natural campaign twice in lockstep, with the step and with it removed. RED 9
// compares the state the step received with the state the tick returned.
//
// SIBLING ROOTS (1356-F2 item 3). RED 10 holds whatever sibling P15 roots exist. With the step
// removed, every root outside `P15_ROOTS` (tests/helpers/p15-roots.ts) stays byte-identical; each
// sibling P15 root stays byte-identical once its rows' `p15DomainSequence` values are removed, and
// those rows keep their relative order; `p15Sequence.next` falls by exactly the ranking records the
// removed step would have written. With no sibling root today it reduces to byte identity plus that
// `next` check. RED 9 is DECLARED, re-pinned at a sibling landing beside `ARCHIVE_STEP` (archive
// file header): it pins the ranking step as tick()'s last expression, and 1356-A §4 runs the P15B
// condition step and the P15C freeze after it. The patch that lands a later end-of-tick step
// re-pins RED 9 to the state the ranking step returns.
//
// RED MECHANISM. At BASE ff05430d the module does not exist and `tick()` calls no step; the
// wrapper never runs and both leaves fail on their own named premise. vitest resolves a mock of
// a missing module without throwing (VitestMocker.resolvePath catches ERR_MODULE_NOT_FOUND).

import { describe, expect, it, vi } from 'vitest'
import { financialStrengthBand, isPowerRankingWeek } from '../src/core/powerRanking.js'
import { stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { P15_ROOTS, p15Rows, stripP15 } from './helpers/p15-roots.js'

const harness = vi.hoisted(() => ({ step: true, received: null as unknown }))

vi.mock('../src/core/powerRankingArchive.js', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  const real = actual.recordPowerRankingQuarter as ((state: unknown) => unknown) | undefined
  return {
    ...actual,
    recordPowerRankingQuarter: (state: unknown) => {
      harness.received = state
      return harness.step && real !== undefined ? real(state) : state
    },
  }
})

type Archive = { snapshots: { week: number; rows: { studioId: string; band: string }[] }[] }
type Sequence = { version: number; next: number }
type P15Roots = { powerRanking?: Archive; p15Sequence?: Sequence }

function archiveOf(state: GameState): Archive {
  const archive = (state as unknown as P15Roots).powerRanking
  if (archive === undefined) throw new Error(`RED: the state at week ${state.market.tick} has no top-level powerRanking root (1356-A §5)`)
  return archive
}
function sequenceOf(state: GameState): Sequence {
  const sequence = (state as unknown as P15Roots).p15Sequence
  if (sequence === undefined) throw new Error(`RED: the state at week ${state.market.tick} has no top-level p15Sequence root (1355-F2 item 1)`)
  return sequence
}
async function studioWeeklyFixedCost(): Promise<(state: GameState, studioId: string) => number> {
  const mod = (await import('../src/core/powerRankingArchive.js')) as unknown as Record<string, unknown>
  const fn = mod.studioWeeklyFixedCost
  if (typeof fn !== 'function') throw new Error("RED: src/core/powerRankingArchive.ts does not export 'studioWeeklyFixedCost'")
  return fn as (state: GameState, studioId: string) => number
}
/** The P15 roots other than the ranking archive and the allocator: none at RED time. */
const SIBLING_ROOTS = P15_ROOTS.filter((key) => key !== 'powerRanking' && key !== 'p15Sequence')
/** One root's bytes with every `p15DomainSequence` removed. */
const withoutSequences = (state: GameState, key: string): string =>
  stableStringify(JSON.parse(JSON.stringify((state as unknown as Record<string, unknown>)[key] ?? null,
    (field, value: unknown) => (field === 'p15DomainSequence' ? undefined : value))))
/** The sibling rows' walk positions sorted by `p15DomainSequence`: their relative allocation order. */
const siblingOrder = (state: GameState): number[] =>
  p15Rows(state, SIBLING_ROOTS).map((row, i) => ({ sequence: row.p15DomainSequence, i }))
    .sort((a, b) => a.sequence - b.sequence).map((entry) => entry.i)
const cashOf = (state: GameState, studioId: string): number =>
  state.hollywood!.businesses.find((b) => b.studioId === studioId)?.account.cash ?? state.studio.cash

// The default p13a seed: every rival's entry roster signs 208-week contracts at week 0, so the
// talent market settles their contested expiries at week 208, a quarter (tests/p14a1-rival-trigger.test.ts).
const THROUGH = 221

describe('p15a2 archive: the step in isolation (1356-A §4; RED 9, 10)', () => {
  it('rank-step-only-writes-archive', () => {
    let withStep = p13aGeneratedStudio()
    let without = p13aGeneratedStudio()
    for (let week = 1; week <= THROUGH; week++) {
      harness.step = true
      withStep = tick(withStep)
      harness.step = false
      without = tick(without)
      if (!isPowerRankingWeek(week) && week !== THROUGH) continue
      const recorded = archiveOf(withStep).snapshots.length
      expect(recorded, `week ${week}: the step records every quarter`).toBe(Math.floor(week / 13))
      expect(archiveOf(without).snapshots, `week ${week}: the stub records nothing`).toHaveLength(0)
      // Every root outside P15_ROOTS, the RNG position included, is byte-identical with the step removed.
      expect(stableStringify(withStep.rngState), `week ${week}: RNG position`).toBe(stableStringify(without.rngState))
      expect(stableStringify(stripP15(withStep)), `week ${week}: roots outside P15_ROOTS`)
        .toBe(stableStringify(stripP15(without)))
      // Each sibling P15 root is byte-identical without its p15DomainSequence values, and its rows
      // keep their relative order (1356-F2 item 3; no sibling root exists at RED time).
      for (const key of SIBLING_ROOTS) {
        expect(withoutSequences(withStep, key), `week ${week}: ${key}`).toBe(withoutSequences(without, key))
      }
      expect(siblingOrder(withStep), `week ${week}: sibling rows' order`).toEqual(siblingOrder(without))
      // The allocator falls by exactly the records the removed step would have written (1355-F2 item 2).
      expect(sequenceOf(withStep).next - sequenceOf(without).next, `week ${week}: allocator`).toBe(recorded)
    }
    harness.step = true
  }, 600_000)

  it('rank-step-final-facts', async () => {
    harness.step = true
    let state = p13aGeneratedStudio()
    let fixedCost: ((state: GameState, studioId: string) => number) | null = null
    let signingQuarters = 0
    for (let week = 1; week <= THROUGH; week++) {
      harness.received = null
      const next = tick(state)
      const received = harness.received as GameState | null
      if (received === null) throw new Error(`RED: tick() producing week ${week} never called recordPowerRankingQuarter (1356-A §4)`)
      if (!isPowerRankingWeek(week)) {
        // Off-quarter the step returns the state unchanged.
        if (next !== received) expect(stableStringify(next), `week ${week}`).toBe(stableStringify(received))
        state = next
        continue
      }
      // The step is the last expression: it received the tick's final state, which is the returned
      // state minus the one appended record and the allocator's single advance.
      const archive = archiveOf(next)
      const record = archive.snapshots.at(-1)!
      expect(record.week).toBe(week)
      const sequence = sequenceOf(next)
      const before = { ...next, powerRanking: { ...archive, snapshots: archive.snapshots.slice(0, -1) }, p15Sequence: { ...sequence, next: sequence.next - 1 } }
      expect(stableStringify(before), `week ${week}: the step's input is the week's final state`).toBe(stableStringify(received))
      // Each band equals financialStrengthBand over the returned state: final cash and contracts.
      fixedCost ??= await studioWeeklyFixedCost()
      for (const row of record.rows) {
        expect(row.band, `week ${week} ${row.studioId}`).toBe(financialStrengthBand(cashOf(next, row.studioId), fixedCost(next, row.studioId)))
      }
      // A signing the talent market settled in this tick (after the chart: talentMarket.ts:1034-1041,
      // :1073) is part of that final state: its receipt is stamped W, its contract starts at W.
      if (next.hollywood!.receipts.some((r) => r.week === week && r.kind === 'employment' && r.reason === 'replacement') ||
        next.ledger.some((entry) => entry.week === week && entry.kind === 'signingBonus')) signingQuarters++
      state = next
    }
    expect(signingQuarters, 'premise: the talent market settles a signing in a quarter tick (the week-208 expiry wave)').toBeGreaterThan(0)
  }, 600_000)
})
