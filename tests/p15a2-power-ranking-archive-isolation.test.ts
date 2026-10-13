// ── P15A.2 Wave 2 slice 2a — the tick step in isolation, RED tests (record 1356-C; r2 1356-C2) ──
//
// Authority: 1356-A §4 (the step wraps tick()'s last expression, `tick.ts:1160`, appends one
// record when `hollywood !== null` and `isPowerRankingWeek(W)`, writes nothing else) and §8 RED
// 9 (`rank-step-final-facts`) and RED 10 (`rank-step-only-writes-archive`); 1355-F2 item 2 (the
// record is allocated from `p15Sequence.next`, so the step also advances the allocator). The
// other slice 2a leaves live in tests/p15a2-power-ranking-archive.test.ts.
//
// METHOD. The real archive export is wrapped only to observe its exact phase input/return.
// RED10 advances one genuine admitted campaign through221; each published tick is admitted.
// At each ranking phase, compare the real producer return to its private phase input: RNG
// and every non-P15/sibling root unchanged, exactly one archive row/global allocation at quarters.
// The phase input at a quarter is private until its required archive append, not a public save.
// The original whole221 removed-step counterfactual was invalid once actual closure required
// full joined publication. That full-campaign counterfactual claim is explicitly not retained.
// RED9 retains final-facts/signing checks against the archive producer's own phase return,
// before later corporate condition/closure/Legacy phases. No closure deferral or validator bypass.
// Producer input bytes are captured before/after every call to prove no in-place mutation.
//
// RED MECHANISM. At BASE ff05430d the module does not exist and `tick()` calls no step; the
// wrapper never runs and both leaves fail on their own named premise. vitest resolves a mock of
// a missing module without throwing (VitestMocker.resolvePath catches ERR_MODULE_NOT_FOUND).

import { describe, expect, it, vi } from 'vitest'
import { financialStrengthBand, isPowerRankingWeek } from '../src/core/powerRanking.js'
import { stableStringify, makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { P15_ROOTS, p15Rows, stripP15 } from './helpers/p15-roots.js'

const harness = vi.hoisted(() => ({ step: true, received: null as unknown, returned: null as unknown, inputBefore: null as string | null, inputAfter: null as string | null }))

vi.mock('../src/core/powerRankingArchive.js', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  const real = actual.recordPowerRankingQuarter as ((state: unknown) => unknown) | undefined
  return {
    ...actual,
    recordPowerRankingQuarter: (state: unknown) => {
      harness.received = state
      harness.inputBefore = stableStringify(state)
      // P15B (1370-ar, the declared re-pin): the state the step RETURNS, before the condition step, the closure
      // phase and the Legacy freeze run after it (a rival's loan principal at W moves money outside P15 roots).
      harness.returned = harness.step && real !== undefined ? real(state) : state
      harness.inputAfter = stableStringify(state)
      return harness.returned
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
    // Private phase comparison replaces invalid removed-step whole campaigns. The genuine
    // input campaign and every published tick remain fully admitted; phase-internal input
    // at a quarter is not represented as a public save before its required archive write.
    harness.step = true
    let state = p13aGeneratedStudio()
    expect(() => makeSave(state)).not.toThrow()
    for (let week = 1; week <= THROUGH; week++) {
      harness.received = null; harness.returned = null
      harness.inputBefore = null; harness.inputAfter = null
      const next = tick(state)
      expect(() => makeSave(next)).not.toThrow()
      expect(harness.received, `week ${week}: real producer input`).not.toBeNull()
      expect(harness.returned, `week ${week}: real producer return`).not.toBeNull()
      const received = harness.received as GameState
      const returned = harness.returned as GameState
      expect(received.market.tick).toBe(week)
      expect(archiveOf(next).snapshots.length, `week ${week}: genuine cumulative cadence`).toBe(Math.floor(week / 13))
      expect(harness.inputBefore).not.toBeNull()
      expect(harness.inputAfter).toBe(harness.inputBefore)
      expect(stableStringify(received)).toBe(harness.inputBefore)
      if (isPowerRankingWeek(week)) {
        expect(archiveOf(returned).snapshots.length).toBe(archiveOf(received).snapshots.length + 1)
        expect(stableStringify(returned.rngState)).toBe(stableStringify(received.rngState))
        expect(stableStringify(stripP15(returned))).toBe(stableStringify(stripP15(received)))
        for (const key of SIBLING_ROOTS) expect(withoutSequences(returned,key)).toBe(withoutSequences(received,key))
        expect(siblingOrder(returned)).toEqual(siblingOrder(received))
        expect(sequenceOf(returned).next - sequenceOf(received).next).toBe(1)
        expect(stableStringify({ ...returned, powerRanking: archiveOf(received), p15Sequence: sequenceOf(received) })).toBe(stableStringify(received))
      } else expect(stableStringify(returned)).toBe(stableStringify(received))
      state = next
    }
    harness.step = true
  }, 600_000)

  it('rank-step-final-facts', async () => {
    harness.step = true
    let state = p13aGeneratedStudio()
    let fixedCost: ((state: GameState, studioId: string) => number) | null = null
    let signingQuarters = 0
    for (let week = 1; week <= THROUGH; week++) {
      harness.received = null; harness.returned = null
      const next = tick(state)
      const received = harness.received as GameState | null
      if (received === null) throw new Error(`RED: tick() producing week ${week} never called recordPowerRankingQuarter (1356-A §4)`)
      // P15B (1370-ar, the declared re-pin of 1356-A §4): the condition step, the closure phase and the Legacy
      // freeze run after the ranking step (a rival's loan principal at W moves money), so the step's own return is
      // the pinned state, not tick()'s final return; the step still reads the week's final facts of its own phase.
      const returned = harness.returned as GameState
      if (!isPowerRankingWeek(week)) {
        // Off-quarter the step returns the state unchanged.
        if (returned !== received) expect(stableStringify(returned), `week ${week}`).toBe(stableStringify(received))
        state = next
        continue
      }
      // The step received its phase's final state, which is its returned state minus the one appended record
      // and the allocator's single advance.
      const archive = archiveOf(returned)
      const record = archive.snapshots.at(-1)!
      expect(record.week).toBe(week)
      const sequence = sequenceOf(returned)
      const before = { ...returned, powerRanking: { ...archive, snapshots: archive.snapshots.slice(0, -1) }, p15Sequence: { ...sequence, next: sequence.next - 1 } }
      expect(stableStringify(before), `week ${week}: the step's input is the week's final state`).toBe(stableStringify(received))
      // Each band equals financialStrengthBand over the returned state: final cash and contracts.
      fixedCost ??= await studioWeeklyFixedCost()
      for (const row of record.rows) {
        expect(row.band, `week ${week} ${row.studioId}`).toBe(financialStrengthBand(cashOf(returned, row.studioId), fixedCost(returned, row.studioId)))
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
