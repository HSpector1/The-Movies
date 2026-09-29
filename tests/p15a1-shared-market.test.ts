// ── P15A.1 Wave 1 — the pure shared-market law, RED tests (record 1346-C) ────
//
// Authority: docs/engineering/playability-launch-review/evidence/p14b4-20260919/
// 1323-A-p15a1-wave0-and-wave1-charter.md §3 (the law `p15a1-market-v1`) and §4
// (the test list), 1323-F-parent-p15a1-charter-adoption.md (Amendment 3 and the
// "Note adopted" eligibility restatement), and 1340-O-owner-rulings-20260929.md
// D-1323-1 (the Owner's approval of the complete 1323-A formula as amended by
// 1323-F, closing the formula decision; constants remain provisional tuning).
//
// RED-BY-DESIGN: `src/core/sharedMarket.ts` does not exist yet. Every leaf below
// is expected to fail.
//
// PITFALL GUARD (brief 1346-p15a1-red, citing a past failure): a static
// `import * as market from '../src/core/sharedMarket.js'` at file scope makes
// Vite fail the WHOLE FILE at collection time ("Failed to load url ... Does the
// file exist?"), which is loud but attributes every leaf to one collection
// error rather than to its own assertion. Verified directly against this tree
// via a disposable probe. This file instead dynamically imports the module
// INSIDE each test body (`loadMarket()`), so a missing module still fails
// loudly and unambiguously, but each leaf gets its own attributed failure. Once
// the module exists, `requireFn` still guards against Vite binding a missing
// NAMED export to `undefined` (the exact failure mode the pitfall describes):
// it asserts `typeof mod[name] === 'function'` before any leaf calls it.
//
// PARENT API DECISIONS assumed (tests import exactly these; production will
// implement them to match; the parent records them in 1346-F): see the brief.
// Two decisions were NOT pinned by the brief and are chosen here; both are
// reported as findings in the handback, not silently adapted:
//   1. `exposureWeight` at a retired lane (`t >= R+26`) returns `weight: 0`.
//   2. `MarketReason = { code, sourceReleaseIds: string[], value: number }`.
//
// REVISION 1346-C2 (this file): independent review 1346-D returned REFINE with two
// blocking defects (the stock term was never independently verified through
// `assessBatch`; the large-batch check only bounded TOP-LEVEL array fields, missing a
// possible unbounded list nested inside one reason). The parent's response 1346-F fixed
// two shapes (reasons list at most five `sourceReleaseIds`, largest contributors first,
// ties by ascending releaseId, `value` stays the full sum; the bound is the exported law
// constant `MARKET_REASON_SOURCE_LIMIT = 5`) and asked for new/extended leaves; see
// 1346-C2-p15a1-red-revision.md for the full account. Leaves NOT named by that review or
// response keep their original expectations unchanged.
//
// REVISION 1346-C3 (this file): re-review 1346-D2 ACCEPTed 1346-C2 but flagged, as a
// disclosed non-blocking gap, that `market-reason-source-ids-ordering` asserted set
// membership only, while 1346-F's "After revision 1346-C2" section retroactively pinned
// an output ORDER (largest contribution first, ties by ascending releaseId) as binding on
// production with no leaf to catch a violation. This revision tightens that leaf to exact
// array equality and adds a second, independent ordering leaf on a different code
// (WINDOW_RELEASES) so the rule is pinned beyond one code. See
// 1346-C3-p15a1-red-order-pin.md. No other leaf changed.
//
// REVISION 1346-C4 (this file): implementation review 1346-J returned KEEP; the parent's
// response 1346-F3 took three of its notes before landing production. (1) "F1 reversed":
// the plain factor formula legitimately rounds to exactly 0.75 in float64 once P exceeds
// about 72 (an asymptote, not a defect); `market-factor-bounds-and-monotonicity` no
// longer asserts strict `> 0.75` at extreme P, asserts `>= 0.75` there instead, keeps
// strict `> 0.75` for every P the charter actually describes (up to 20), and adds a
// monotone non-increasing check over a 0..1000 grid. (2) a new leaf pins the exported
// contribution seam `releaseContribution(release) => 1` (1323-A §3's "one named function
// returning 1 in v1"). (3) a new leaf pins "one reason per code": two same-week peers
// from two different studios aggregate into exactly one SAME_WEEK_RELEASES reason, not
// two. See 1346-C4-p15a1-red-floor-seam-percode.md. No other leaf changed.

import { describe, expect, it } from 'vitest'
import type { Genre } from '../src/core/types.js'
import { TUNING } from '../src/core/tuning.js'

// ── shared test-only helpers (duplicated in the harness file; each file stays
//    self-contained rather than adding a shared fixture module for ~20 lines) ──

async function loadMarket(): Promise<Record<string, unknown>> {
  return (await import('../src/core/sharedMarket.js')) as unknown as Record<string, unknown>
}

function requireFn<T extends (...a: any[]) => any>(mod: Record<string, unknown>, name: string): T {
  const fn = mod[name]
  if (typeof fn !== 'function') {
    throw new Error(
      `RED: src/core/sharedMarket.ts does not export a function named '${name}' (got ${typeof fn}). ` +
        'This guard exists so a partially-implemented module fails loudly per-leaf instead of a vacuous pass.',
    )
  }
  return fn as T
}

function requireConst<T>(mod: Record<string, unknown>, name: string): T {
  if (!(name in mod) || mod[name] === undefined) {
    throw new Error(
      `RED: src/core/sharedMarket.ts does not export a value named '${name}'. ` +
        'This guard exists so a partially-implemented module fails loudly per-leaf instead of a vacuous pass.',
    )
  }
  return mod[name] as T
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(value as object).sort()) out[k] = canonicalize((value as Record<string, unknown>)[k])
    return out
  }
  return value
}

function canonicalJSON(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

const GENRES: Genre[] = ['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure']

// worked expectations, computed independently from the 1323-A §3 / 1323-F formula
// TEXT (not by calling production): f(P) = 1 - MAX_PENALTY * (1 - e^(-P/SCALE)).
const MAX_PENALTY = 0.25
const SCALE = 2
function expectedFactor(pressure: number): number {
  return 1 - MAX_PENALTY * (1 - Math.exp(-pressure / SCALE))
}

// independent stock-lane weight, computed from the 1323-A §3 / 1323-F closed form
// 0.20 * 2^(-age/13), NOT by calling production. `age` is weeks past the R+4 hand-off
// (i.e. age = (week - releaseWeek) - 4).
function stockWeight(age: number): number {
  return 0.2 * Math.pow(2, -age / 13)
}

describe('p15a1 shared market: TUNING (real, already-existing module)', () => {
  it('market-tuning-bounded-terms', () => {
    // This test does NOT touch the missing sharedMarket module; TUNING is real.
    // A bounded-term test asserts value AND range, per repo convention.
    const t = TUNING as unknown as Record<string, unknown>
    expect(t.SHARED_MARKET_WINDOW_WEIGHTS).toEqual([1, 0.55, 0.55, 0.2])
    expect(t.SHARED_MARKET_STOCK_START).toBe(0.2)
    expect(t.SHARED_MARKET_STOCK_HALF_LIFE_WEEKS).toBe(13)
    expect(t.SHARED_MARKET_RETIRE_AFTER_WEEKS).toBe(26)
    expect(t.SHARED_MARKET_FACTOR_MAX_PENALTY).toBe(0.25)
    expect(t.SHARED_MARKET_PRESSURE_SCALE).toBe(2)
    expect(t.SHARED_MARKET_STUDIO_WINDOW_CAP).toBe(1)

    // Range: every window weight is a fraction in (0,1], non-increasing across the
    // four weeks (1323-A §3's stated 1.00/0.55/0.55/0.20 shape).
    const weights = t.SHARED_MARKET_WINDOW_WEIGHTS as number[]
    expect(weights).toHaveLength(4)
    for (const w of weights) {
      expect(w).toBeGreaterThan(0)
      expect(w).toBeLessThanOrEqual(1)
    }
    for (let i = 1; i < weights.length; i++) expect(weights[i]).toBeLessThanOrEqual(weights[i - 1])

    expect(t.SHARED_MARKET_STOCK_START as number).toBeGreaterThan(0)
    expect(t.SHARED_MARKET_STOCK_START as number).toBeLessThanOrEqual(weights[weights.length - 1])
    expect(t.SHARED_MARKET_STOCK_HALF_LIFE_WEEKS as number).toBeGreaterThan(0)
    expect(t.SHARED_MARKET_RETIRE_AFTER_WEEKS as number).toBeGreaterThan(t.SHARED_MARKET_STOCK_HALF_LIFE_WEEKS as number)
    expect(t.SHARED_MARKET_FACTOR_MAX_PENALTY as number).toBeGreaterThan(0)
    expect(t.SHARED_MARKET_FACTOR_MAX_PENALTY as number).toBeLessThan(1) // factor stays positive at any pressure
    expect(t.SHARED_MARKET_PRESSURE_SCALE as number).toBeGreaterThan(0)
    expect(t.SHARED_MARKET_STUDIO_WINDOW_CAP as number).toBe(1) // "one release's worth", D-1323-1
  })
})

describe('p15a1 shared market: module surface', () => {
  it('market-definition-version-export', async () => {
    const market = await loadMarket()
    expect(market.SHARED_MARKET_DEFINITION).toBe('p15a1-market-v1')
  })

  it('market-reason-source-limit-export', async () => {
    // parent decision (1346-F, revision 1346-C2): each reason lists at most five
    // sourceReleaseIds; the bound is an exported law constant, not tuning (it bounds
    // a record's size, not a market outcome).
    const market = await loadMarket()
    const limit = requireConst<number>(market, 'MARKET_REASON_SOURCE_LIMIT')
    expect(limit).toBe(5)
  })

  it('market-release-contribution-seam', async () => {
    // 1346-F3 note 2 ("the contribution seam"): 1323-A §3 "Contribution. c = 1 per
    // eligible release in v1. Reach scaling waits for a lawful public pre-verdict reach
    // fact ...; the scaling seam is one named function returning 1 in v1." Production
    // exports `releaseContribution(release: MarketRelease): number`, and every weight is
    // multiplied through it. Pinned here at exactly 1 for a player release and several
    // rival releases across every genre in the six-genre catalogue -- the seam must not
    // special-case the player, and must not vary by genre in v1.
    const market = await loadMarket()
    const releaseContribution = requireFn<any>(market, 'releaseContribution')
    const week = 2000
    const releases = [
      { releaseId: 'PLAYER-REL', studioId: 'PLAYER', genre: 'comedy' as const, releaseWeek: week },
      { releaseId: 'RIVAL-REL-1', studioId: 'RIVAL-A', genre: 'drama' as const, releaseWeek: week },
      { releaseId: 'RIVAL-REL-2', studioId: 'RIVAL-B', genre: 'crime' as const, releaseWeek: week },
      { releaseId: 'RIVAL-REL-3', studioId: 'RIVAL-C', genre: 'romance' as const, releaseWeek: week },
      { releaseId: 'RIVAL-REL-4', studioId: 'RIVAL-D', genre: 'horror' as const, releaseWeek: week },
      { releaseId: 'RIVAL-REL-5', studioId: 'RIVAL-E', genre: 'adventure' as const, releaseWeek: week },
    ]
    for (const release of releases) {
      expect(releaseContribution(release)).toBe(1)
    }
  })
})

describe('p15a1 shared market: exposureWeight lanes and boundaries', () => {
  it('market-exposure-weight-window-lane-offsets', async () => {
    const market = await loadMarket()
    const exposureWeight = requireFn(market, 'exposureWeight')
    const R = 500
    const WEIGHTS = [1, 0.55, 0.55, 0.2] // 1323-A §3, independent of TUNING
    for (let offset = 0; offset < 4; offset++) {
      const result = exposureWeight(R, R + offset)
      expect(result.lane).toBe('window')
      expect(result.weight).toBeCloseTo(WEIGHTS[offset], 9)
    }
  })

  it('market-decay-boundaries-r3-r4', async () => {
    const market = await loadMarket()
    const exposureWeight = requireFn(market, 'exposureWeight')
    const R = 1000
    const atR3 = exposureWeight(R, R + 3)
    expect(atR3.lane).toBe('window')
    expect(atR3.weight).toBeCloseTo(0.2, 9)
    const atR4 = exposureWeight(R, R + 4)
    expect(atR4.lane).toBe('stock')
    // continuity: the stock curve starts at exactly 0.20 at R+4 (1323-A §3 / 1323-F Amendment 3)
    expect(atR4.weight).toBeCloseTo(0.2, 9)
    expect(atR3.weight).toBeCloseTo(atR4.weight, 9) // no gap or double count at the hand-off
  })

  it('market-decay-boundaries-r25-r26', async () => {
    const market = await loadMarket()
    const exposureWeight = requireFn(market, 'exposureWeight')
    const R = 2000
    const atR25 = exposureWeight(R, R + 25)
    expect(atR25.lane).toBe('stock')
    // independent formula computation, not production: 0.2 * 2^-((t-(R+4))/13)
    const expectedR25 = 0.2 * Math.pow(2, -(25 - 4) / 13)
    expect(expectedR25).toBeCloseTo(0.0653, 3) // sanity vs. the prose's "about 0.065"
    expect(atR25.weight).toBeCloseTo(expectedR25, 9)

    const atR26 = exposureWeight(R, R + 26)
    expect(atR26.lane).toBe('retired')
    // ASSUMPTION (flagged as a finding: not pinned by the brief's API decisions;
    // a retired release should contribute nothing to any weighted sum built from it).
    expect(atR26.weight).toBe(0)
  })

  it('market-decay-boundaries-precondition-t-lt-r', async () => {
    const market = await loadMarket()
    const exposureWeight = requireFn(market, 'exposureWeight')
    expect(() => exposureWeight(100, 99)).toThrow()
  })
})

describe('p15a1 shared market: pressureFactor', () => {
  it('market-factor-zero-exact', async () => {
    const market = await loadMarket()
    const pressureFactor = requireFn(market, 'pressureFactor')
    expect(pressureFactor(0)).toBe(1)
  })

  it('market-factor-bounds-and-monotonicity', async () => {
    // REVISED per 1346-F3 note 1 ("F1 reversed"): the plain formula
    // 1 - 0.25*(1 - e^(-P/2)) rounds to EXACTLY 0.75 in float64 once P exceeds about 72
    // (verified independently: f(72)===0.75 in plain float64 arithmetic, computed with
    // the same closed form used elsewhere in this file). That is correct rounding of an
    // asymptote, not a defect; a strict `> 0.75` at extreme P would only pass if
    // production manufactured a value the Owner's formula never produces (the removed
    // `nextDoubleAbove` behavior). Strict `> 0.75` is still required and meaningful for
    // every P the charter actually describes (up to 20, well short of the P=72 plateau;
    // P=4 gives about 0.78 per 1323-A §3).
    const market = await loadMarket()
    const pressureFactor = requireFn(market, 'pressureFactor')
    const f1 = pressureFactor(1)
    const f2 = pressureFactor(2)
    const f4 = pressureFactor(4)
    expect(f1).toBeLessThan(1)
    expect(f1).toBeGreaterThan(f2)
    expect(f2).toBeGreaterThan(f4)

    // strict > 0.75 for every P up to 20, beyond any pressure the charter describes.
    for (const P of [0.5, 1, 2, 4, 8, 16, 20]) {
      expect(pressureFactor(P)).toBeGreaterThan(0.75)
    }

    // extreme P (1000): >= 0.75, not > 0.75 -- the plain formula legitimately rounds to
    // exactly the floor here.
    const fExtreme = pressureFactor(1000)
    expect(fExtreme).toBeGreaterThanOrEqual(0.75)
    expect(fExtreme).toBeLessThanOrEqual(1)

    // f(0) === 1 exactly is also asserted by market-factor-zero-exact; kept here too as
    // the first point of the monotonicity grid below.
    expect(pressureFactor(0)).toBe(1)

    // monotone non-increasing over a P grid 0..1000, including points on both sides of
    // the ~72 plateau boundary -- f never increases, and may plateau exactly at 0.75.
    const grid = [0, 0.5, 1, 2, 4, 8, 16, 20, 32, 50, 72, 100, 150, 200, 300, 500, 750, 1000]
    const values = grid.map((P) => pressureFactor(P))
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeLessThanOrEqual(values[i - 1])
    }
  })

  it('market-factor-worked-examples', async () => {
    const market = await loadMarket()
    const pressureFactor = requireFn(market, 'pressureFactor')
    const cases: readonly (readonly [number, number])[] = [
      [1, 0.9],
      [2, 0.84],
      [4, 0.78],
    ]
    for (const [P, prose] of cases) {
      const expected = expectedFactor(P) // independent local formula, see header
      // tight tolerance: both values come from the same closed-form expression
      expect(pressureFactor(P)).toBeCloseTo(expected, 9)
      // 1323-A §3 states these to 2 decimals ("about 0.90/0.84/0.78"); toBeCloseTo(x,2)
      // allows +/-0.005, matching the prose's stated precision exactly.
      expect(pressureFactor(P)).toBeCloseTo(prose, 2)
    }
  })

  it('market-factor-preconditions', async () => {
    const market = await loadMarket()
    const pressureFactor = requireFn(market, 'pressureFactor')
    expect(() => pressureFactor(-1)).toThrow()
    expect(() => pressureFactor(NaN)).toThrow()
    expect(() => pressureFactor(Infinity)).toThrow()
  })
})

describe('p15a1 shared market: assessBatch symmetry and identity invariants', () => {
  it('market-one-player-one-rival', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 300
    const batch = {
      week,
      members: [
        { releaseId: 'PLAYER-1', studioId: 'PLAYER', genre: 'drama' as const },
        { releaseId: 'RIVAL-1', studioId: 'RIVAL-A', genre: 'drama' as const },
      ],
    }
    const assessments = assessBatch([], batch)
    expect(assessments).toHaveLength(2)
    const byId = Object.fromEntries(assessments.map((a: any) => [a.releaseId, a]))
    const expected = expectedFactor(1) // one same-window competitor, 1323-A §3
    for (const id of ['PLAYER-1', 'RIVAL-1']) {
      expect(byId[id].pressure).toBeCloseTo(1, 9)
      expect(byId[id].windowTerm).toBeCloseTo(1, 9)
      expect(byId[id].stockTerm).toBeCloseTo(0, 9)
      expect(byId[id].factor).toBeCloseTo(expected, 9)
      expect(byId[id].factor).toBeCloseTo(0.9, 2)
    }
    // self-exclusion baseline: a solo release with no rivals and no exposures gets
    // no pressure at all (the subject never counts itself).
    const solo = assessBatch([], { week, members: [{ releaseId: 'SOLO-1', studioId: 'S', genre: 'drama' as const }] })
    expect(solo[0].pressure).toBe(0)
    expect(solo[0].factor).toBe(1)
    expect(solo[0].reasons.some((r: any) => r.code === 'NO_PRESSURE')).toBe(true)
  })

  it('market-owner-swap', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 400
    const makeBatch = (studioOfX: string, studioOfY: string) => ({
      week,
      members: [
        { releaseId: 'X', studioId: studioOfX, genre: 'comedy' as const },
        { releaseId: 'Y', studioId: studioOfY, genre: 'comedy' as const },
      ],
    })
    const original = assessBatch([], makeBatch('STUDIO-1', 'STUDIO-2'))
    const swapped = assessBatch([], makeBatch('STUDIO-2', 'STUDIO-1'))
    const byIdOriginal = Object.fromEntries(original.map((a: any) => [a.releaseId, a]))
    const byIdSwapped = Object.fromEntries(swapped.map((a: any) => [a.releaseId, a]))
    // swapping which studio owns X and Y must not move the numbers: the law reads
    // structure (counts, genre, week), never a studio's specific identity/label.
    for (const id of ['X', 'Y']) {
      expect(byIdSwapped[id].pressure).toBeCloseTo(byIdOriginal[id].pressure, 9)
      expect(byIdSwapped[id].factor).toBeCloseTo(byIdOriginal[id].factor, 9)
    }
  })

  it('market-id-swap', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 410
    const before = assessBatch([], {
      week,
      members: [
        { releaseId: 'R1', studioId: 'S-A', genre: 'horror' as const },
        { releaseId: 'R2', studioId: 'S-B', genre: 'horror' as const },
      ],
    })
    const after = assessBatch([], {
      week,
      members: [
        { releaseId: 'R2', studioId: 'S-A', genre: 'horror' as const }, // releaseId labels swapped, studios fixed
        { releaseId: 'R1', studioId: 'S-B', genre: 'horror' as const },
      ],
    })
    const beforeByStudio = Object.fromEntries(before.map((a: any) => [a.studioId, a]))
    const afterByStudio = Object.fromEntries(after.map((a: any) => [a.studioId, a]))
    for (const studioId of ['S-A', 'S-B']) {
      expect(afterByStudio[studioId].pressure).toBeCloseTo(beforeByStudio[studioId].pressure, 9)
      expect(afterByStudio[studioId].factor).toBeCloseTo(beforeByStudio[studioId].factor, 9)
    }
  })

  it('market-order-reversal', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 420
    const members = [
      { releaseId: 'ZZZ', studioId: 'S-1', genre: 'crime' as const },
      { releaseId: 'AAA', studioId: 'S-2', genre: 'crime' as const },
      { releaseId: 'MMM', studioId: 'S-3', genre: 'crime' as const },
    ]
    const forward = assessBatch([], { week, members })
    const reversed = assessBatch([], { week, members: [...members].reverse() })
    // canonical order by (week, releaseId): both calls must return the SAME array, in
    // the same ascending-releaseId order, regardless of input array order.
    expect(forward.map((a: any) => a.releaseId)).toEqual(['AAA', 'MMM', 'ZZZ'])
    expect(reversed.map((a: any) => a.releaseId)).toEqual(['AAA', 'MMM', 'ZZZ'])
    expect(canonicalJSON(reversed)).toBe(canonicalJSON(forward))
  })

  it('market-same-week-batch', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 500
    // frozen pre-batch snapshot: one exposure, window offset 1, weight 0.55
    const preBatchExposure = { releaseId: 'PRE-1', studioId: 'S-C', genre: 'romance' as const, releaseWeek: week - 1 }
    const batch = {
      week,
      members: [
        { releaseId: 'X', studioId: 'S-A', genre: 'romance' as const },
        { releaseId: 'Y', studioId: 'S-B', genre: 'romance' as const },
      ],
    }
    const assessments = assessBatch([preBatchExposure], batch)
    const byId = Object.fromEntries(assessments.map((a: any) => [a.releaseId, a]))
    const expectedPressure = 1 + 0.55 // one same-week peer (1.00) + the frozen pre-batch exposure (0.55)
    const expectedF = expectedFactor(expectedPressure)
    for (const id of ['X', 'Y']) {
      // both X and Y see the SAME pre-batch snapshot plus each other; neither is
      // computed "early" with a partial/updated view of the other — results must match.
      expect(byId[id].pressure).toBeCloseTo(expectedPressure, 9)
      expect(byId[id].factor).toBeCloseTo(expectedF, 9)
    }
    expect(byId['X'].pressure).toBeCloseTo(byId['Y'].pressure, 9)
  })

  it('market-different-genre', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 600
    const offGenreExposure = { releaseId: 'H-1', studioId: 'S-Z', genre: 'horror' as const, releaseWeek: week - 1 }
    const batch = {
      week,
      members: [
        { releaseId: 'C-1', studioId: 'S-A', genre: 'comedy' as const },
        { releaseId: 'D-1', studioId: 'S-B', genre: 'drama' as const },
      ],
    }
    const assessments = assessBatch([offGenreExposure], batch)
    const byId = Object.fromEntries(assessments.map((a: any) => [a.releaseId, a]))
    for (const id of ['C-1', 'D-1']) {
      // a subject whose genre has no other exposure/batch member gets NO_PRESSURE and
      // factor exactly 1; the off-genre exposure and the off-genre peer both count for zero.
      expect(byId[id].pressure).toBe(0)
      expect(byId[id].windowTerm).toBe(0)
      expect(byId[id].stockTerm).toBe(0)
      expect(byId[id].factor).toBe(1)
      expect(byId[id].reasons).toHaveLength(1)
      expect(byId[id].reasons[0].code).toBe('NO_PRESSURE')
    }
  })
})

describe('p15a1 shared market: stock term through assessBatch, and reason codes (1346-D Blocking 1)', () => {
  it('market-stock-term-through-assess-batch', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 1500
    // three stock-lane exposures, three different studios, NO window-lane competitor
    // (the subject is the sole batch member): windowTerm must be exactly 0, and
    // pressure/factor must flow entirely from the stock aggregation.
    const stockExposures = [
      { releaseId: 'STK-1', studioId: 'S-A', genre: 'crime' as const, releaseWeek: week - 4 - 0 }, // age 0
      { releaseId: 'STK-2', studioId: 'S-B', genre: 'crime' as const, releaseWeek: week - 4 - 5 }, // age 5
      { releaseId: 'STK-3', studioId: 'S-C', genre: 'crime' as const, releaseWeek: week - 4 - 10 }, // age 10
    ]
    const subject = { releaseId: 'SUBJ', studioId: 'S-SUBJ', genre: 'crime' as const }
    const result = assessBatch(stockExposures, { week, members: [subject] })[0]

    const expectedStockTerm = stockWeight(0) + stockWeight(5) + stockWeight(10) // independent hand sum, not production
    expect(result.windowTerm).toBe(0)
    expect(result.stockTerm).toBeCloseTo(expectedStockTerm, 9) // tight: same closed form as exposureWeight's stock formula
    expect(result.pressure).toBeCloseTo(expectedStockTerm, 9)
    expect(result.factor).toBeCloseTo(expectedFactor(expectedStockTerm), 9)
    expect(result.reasons.some((r: any) => r.code === 'GENRE_SATURATION')).toBe(true)
    expect(result.reasons.some((r: any) => r.code === 'SAME_WEEK_RELEASES')).toBe(false)
    expect(result.reasons.some((r: any) => r.code === 'WINDOW_RELEASES')).toBe(false)
  })

  it('market-stock-term-unclamped-same-studio', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 1600
    // six stock-lane exposures, ALL from the SAME studio: the window term's per-studio
    // clamp (min(Wk,1.0)) does NOT apply to the stock term (1323-A §3: "unclamped:
    // saturation counts volume"). Six near-peak stock weights (ages 0..5) sum well past
    // 1.0, which a clamped implementation would cap at 1.0.
    const ages = [0, 1, 2, 3, 4, 5]
    const stockExposures = ages.map((age, i) => ({
      releaseId: `SAME-${i}`,
      studioId: 'S-ONE',
      genre: 'drama' as const,
      releaseWeek: week - 4 - age,
    }))
    const subject = { releaseId: 'SUBJ2', studioId: 'S-SUBJ2', genre: 'drama' as const }
    const result = assessBatch(stockExposures, { week, members: [subject] })[0]

    const expectedStockTerm = ages.reduce((sum, age) => sum + stockWeight(age), 0) // independent hand sum
    expect(expectedStockTerm).toBeGreaterThan(1.0) // sanity: the raw sum genuinely exceeds the window cap
    expect(result.windowTerm).toBe(0)
    expect(result.stockTerm).toBeCloseTo(expectedStockTerm, 9) // NOT clamped to 1.0, unlike the window term
    expect(result.pressure).toBeCloseTo(expectedStockTerm, 9)
    const saturation = result.reasons.find((r: any) => r.code === 'GENRE_SATURATION')
    expect(saturation).toBeTruthy()
    expect(saturation.value).toBeCloseTo(expectedStockTerm, 9) // parent decision: value is the full sum, uncapped
    // six contributors > MARKET_REASON_SOURCE_LIMIT (5): the nested id list must still cap.
    expect(saturation.sourceReleaseIds.length).toBeLessThanOrEqual(5)
  })

  it('market-window-releases-reason-code', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 1700
    // one prior exposure in the window lane (offset 1, weight 0.55), no same-week peer:
    // this must produce WINDOW_RELEASES, and must NOT produce SAME_WEEK_RELEASES (that
    // code is reserved for same-week batch peers, not stored pre-batch exposures).
    const windowExposure = { releaseId: 'WIN-1', studioId: 'S-RIVALW', genre: 'romance' as const, releaseWeek: week - 1 }
    const subject = { releaseId: 'SUBJ3', studioId: 'S-SUBJ3', genre: 'romance' as const }
    const result = assessBatch([windowExposure], { week, members: [subject] })[0]

    expect(result.windowTerm).toBeCloseTo(0.55, 9)
    expect(result.stockTerm).toBe(0)
    expect(result.reasons.some((r: any) => r.code === 'WINDOW_RELEASES')).toBe(true)
    expect(result.reasons.some((r: any) => r.code === 'SAME_WEEK_RELEASES')).toBe(false)
    expect(result.reasons.some((r: any) => r.code === 'GENRE_SATURATION')).toBe(false)
    expect(result.reasons.some((r: any) => r.code === 'STUDIO_CLAMPED')).toBe(false)
  })

  it('market-same-week-two-studios-one-reason', async () => {
    // 1346-F3 note 3 ("one reason per code"): two same-week peers from two DIFFERENT
    // studios, same genre, against one subject. Each contributes the flat same-week
    // weight 1.00 (1323-A §3: "Sum 1.00 for k's other genre-g batch members"). Since
    // these are two DIFFERENT studios and each is a single release, neither studio's own
    // Wk exceeds its 1.0 cap individually -- the per-studio clamp never engages for
    // either one, so the raw arithmetic IS the value: 1.00 + 1.00 = 2.00 (two same-week
    // peers at weight 1.0 each, before any clamp; no clamp is actually applied here since
    // neither studio's own contribution exceeds 1.0). Exactly one SAME_WEEK_RELEASES
    // reason results (one entry per applicable CODE, aggregating both sources), not two.
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 2100
    const subject = { releaseId: 'SUBJ6', studioId: 'S-SUBJ6', genre: 'comedy' as const }
    const peerZulu = { releaseId: 'PEER-ZULU', studioId: 'S-ZULU', genre: 'comedy' as const }
    const peerAlpha = { releaseId: 'PEER-ALPHA', studioId: 'S-ALPHA', genre: 'comedy' as const }
    // batch member order deliberately NOT sorted, so the assertion below actually proves
    // the reason's sourceReleaseIds order comes from the tie-break rule, not from
    // input/array order.
    const result = assessBatch([], { week, members: [subject, peerZulu, peerAlpha] }).find(
      (a: any) => a.releaseId === 'SUBJ6',
    )

    expect(result.reasons).toHaveLength(1) // exactly one reason
    const reason = result.reasons[0]
    expect(reason.code).toBe('SAME_WEEK_RELEASES')
    expect(reason.value).toBeCloseTo(2.0, 9) // 1.00 + 1.00, see arithmetic above
    // both tied at weight 1.00 -> pure ascending-releaseId tie-break (1346-F "After
    // revision 1346-C2" order rule, already pinned for GENRE_SATURATION/WINDOW_RELEASES
    // in market-reason-source-ids-ordering[-window-releases]; this exercises it a third
    // time, on SAME_WEEK_RELEASES).
    expect(reason.sourceReleaseIds).toEqual(['PEER-ALPHA', 'PEER-ZULU'])
  })

  it('market-reason-source-ids-ordering', async () => {
    // Parent decision (1346-F): each reason keeps at most MARKET_REASON_SOURCE_LIMIT (5)
    // sourceReleaseIds, chosen as the largest contributors to that reason's value, ties
    // broken by ascending releaseId; `value` stays the full sum over every contributor.
    // Six stock-lane exposures, one genre, distinct ages except a tie at the cutoff
    // (the two smallest are equal), to exercise both the size cutoff and the tie-break.
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 1800
    const entries: { releaseId: string; studioId: string; age: number }[] = [
      { releaseId: 'TOP1', studioId: 'S1', age: 0 },
      { releaseId: 'TOP2', studioId: 'S2', age: 2 },
      { releaseId: 'TOP3', studioId: 'S3', age: 4 },
      { releaseId: 'TOP4', studioId: 'S4', age: 6 },
      { releaseId: 'AAA-TIE', studioId: 'S5', age: 8 }, // tied value with ZZZ-TIE; ascending id wins the tie
      { releaseId: 'ZZZ-TIE', studioId: 'S6', age: 8 }, // tied value with AAA-TIE; dropped by the tie-break
    ]
    const exposures = entries.map((e) => ({
      releaseId: e.releaseId,
      studioId: e.studioId,
      genre: 'horror' as const,
      releaseWeek: week - 4 - e.age,
    }))
    const subject = { releaseId: 'SUBJ4', studioId: 'S-SUBJ4', genre: 'horror' as const }
    const result = assessBatch(exposures, { week, members: [subject] })[0]

    const saturation = result.reasons.find((r: any) => r.code === 'GENRE_SATURATION')
    expect(saturation).toBeTruthy()
    const expectedFullSum = entries.reduce((sum, e) => sum + stockWeight(e.age), 0)
    expect(saturation.value).toBeCloseTo(expectedFullSum, 9) // the full sum over all six, not just the kept five

    expect(saturation.sourceReleaseIds).toHaveLength(5)
    // AAA-TIE (ascending-id winner of the tie at age 8) is kept; ZZZ-TIE is dropped.
    // ORDER pinned by 1346-F "After revision 1346-C2": largest contribution first, ties
    // by ascending releaseId. stockWeight(age) is strictly decreasing in age, and the
    // six ages here (0,2,4,6,8,8) are non-decreasing, so descending-value order is
    // exactly the input order TOP1..TOP4, then the age-8 tie resolved to AAA-TIE
    // (verified independently: stockWeight(0..6) are four strictly distinct decreasing
    // values, and stockWeight(8)===stockWeight(8) for the tied pair; 'AAA-TIE' <
    // 'ZZZ-TIE' lexically). Exact array equality, not just set membership.
    expect(saturation.sourceReleaseIds).toEqual(['TOP1', 'TOP2', 'TOP3', 'TOP4', 'AAA-TIE'])
    expect(saturation.sourceReleaseIds).not.toContain('ZZZ-TIE')
  })

  it('market-reason-source-ids-ordering-window-releases', async () => {
    // Pins the same ordering rule (1346-F "After revision 1346-C2": largest contribution
    // first, ties by ascending releaseId) for a SECOND code, so the rule is not proven
    // by one code alone. Three window-lane exposures, three different studios, three
    // different offsets (1323-A §3 window weights 1.00/0.55/0.55/0.20 by offset): two of
    // the three tie at weight 0.55 (offsets 1 and 2), one is strictly lower (offset 3,
    // weight 0.20) — a non-trivial descending order with a genuine tie, on WINDOW_RELEASES
    // rather than GENRE_SATURATION.
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 1950
    const windowExposures = [
      { releaseId: 'W-OFFSET3', studioId: 'S-A', genre: 'adventure' as const, releaseWeek: week - 3 }, // weight 0.20 (lowest)
      { releaseId: 'W-OFFSET1', studioId: 'S-B', genre: 'adventure' as const, releaseWeek: week - 1 }, // weight 0.55
      { releaseId: 'W-OFFSET2', studioId: 'S-C', genre: 'adventure' as const, releaseWeek: week - 2 }, // weight 0.55
    ]
    // W-OFFSET1 and W-OFFSET2 tie at weight 0.55 (1323-A §3: offsets 1 and 2 both weigh
    // 0.55); ascending releaseId ('W-OFFSET1' < 'W-OFFSET2') decides their relative order.
    const subject = { releaseId: 'SUBJ5', studioId: 'S-SUBJ5', genre: 'adventure' as const }
    const result = assessBatch(windowExposures, { week, members: [subject] })[0]

    const windowReason = result.reasons.find((r: any) => r.code === 'WINDOW_RELEASES')
    expect(windowReason).toBeTruthy()
    // three sources, all <= MARKET_REASON_SOURCE_LIMIT (5): no truncation here, this leaf
    // isolates the ORDER rule from the SELECTION/cutoff rule already covered above.
    expect(windowReason.sourceReleaseIds).toEqual(['W-OFFSET1', 'W-OFFSET2', 'W-OFFSET3'])
  })
})

describe('p15a1 shared market: per-studio clamp and reasons cap', () => {
  it('market-studio-window-clamp', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 700
    const subject = { releaseId: 'SUBJ', studioId: 'S-SUBJ', genre: 'adventure' as const }

    // scenario 1: one rival studio, TWO prior exposures in-window (weights 0.55+0.55
    // = 1.10 raw), clamped to 1.0 per (studio, genre) — 1323-A §3.
    const overflowExposures = [
      { releaseId: 'RIV-1', studioId: 'S-RIVAL', genre: 'adventure' as const, releaseWeek: week - 1 }, // 0.55
      { releaseId: 'RIV-2', studioId: 'S-RIVAL', genre: 'adventure' as const, releaseWeek: week - 2 }, // 0.55
    ]
    const overflowResult = assessBatch(overflowExposures, { week, members: [subject] })[0]

    // scenario 2 (control): the same rival studio, ONE same-week batch peer (flat 1.00
    // weight by the batch-member term), landing exactly at the 1.0 cap with no overflow.
    const exactBatch = {
      week,
      members: [subject, { releaseId: 'RIV-3', studioId: 'S-RIVAL', genre: 'adventure' as const }],
    }
    const exactResult = assessBatch([], exactBatch).find((a: any) => a.releaseId === 'SUBJ')

    const expectedClampedPressure = 1.0 // min(1.10, 1.0)
    expect(overflowResult.pressure).toBeCloseTo(expectedClampedPressure, 9)
    expect(overflowResult.factor).toBeCloseTo(expectedFactor(1), 9)
    expect(overflowResult.factor).toBeCloseTo(exactResult.factor, 9)
    expect(overflowResult.reasons.some((r: any) => r.code === 'STUDIO_CLAMPED')).toBe(true)
    expect(exactResult.reasons.some((r: any) => r.code === 'STUDIO_CLAMPED')).toBe(false)
  })

  it('market-reasons-capped-at-five', async () => {
    // REVISED per 1346-D Blocking 1 / 1346-F: reasons aggregate ONE ENTRY PER APPLICABLE
    // CODE (not one entry per contributing source release); there are exactly five
    // possible codes, and NO_PRESSURE is mutually exclusive with the other four, so "at
    // most five" is the natural ceiling of the code catalogue, not a trim of excess
    // per-source candidates. This leaf now asserts WHICH codes are retained, by
    // engineering a scenario that triggers all four non-NO_PRESSURE codes at once for a
    // single subject, plus the "at most five" invariant on the resulting array.
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 1900
    const subject = { releaseId: 'SUBJ4X', studioId: 'S-SUBJ4X', genre: 'comedy' as const }
    const peer = { releaseId: 'PEER-SW', studioId: 'S-P', genre: 'comedy' as const } // -> SAME_WEEK_RELEASES
    const windowExposure = {
      releaseId: 'WIN-Q',
      studioId: 'S-Q',
      genre: 'comedy' as const,
      releaseWeek: week - 1,
    } // -> WINDOW_RELEASES, offset 1, weight 0.55
    const overflowExposures = [
      { releaseId: 'WIN-R1', studioId: 'S-R', genre: 'comedy' as const, releaseWeek: week - 1 }, // 0.55
      { releaseId: 'WIN-R2', studioId: 'S-R', genre: 'comedy' as const, releaseWeek: week - 2 }, // 0.55, sum 1.10 -> STUDIO_CLAMPED
    ]
    const stockExposure = {
      releaseId: 'STK-T',
      studioId: 'S-T',
      genre: 'comedy' as const,
      releaseWeek: week - 4 - 0,
    } // -> GENRE_SATURATION

    const result = assessBatch(
      [windowExposure, ...overflowExposures, stockExposure],
      { week, members: [subject, peer] },
    ).find((a: any) => a.releaseId === 'SUBJ4X')

    expect(result.reasons.length).toBeLessThanOrEqual(5) // 1323-A §4 "reasons capped at five"
    expect(result.reasons.length).toBe(4) // exactly the four codes engineered below
    const codes = new Set(result.reasons.map((r: any) => r.code))
    expect(codes).toEqual(
      new Set(['SAME_WEEK_RELEASES', 'WINDOW_RELEASES', 'GENRE_SATURATION', 'STUDIO_CLAMPED']),
    )
    expect(codes.has('NO_PRESSURE')).toBe(false) // mutually exclusive with the other four; pressure > 0 here
  })
})

describe('p15a1 shared market: large-batch linear storage', () => {
  function buildDenseBatch(week: number, size: number, studioCount: number, tag: string) {
    const members = Array.from({ length: size }, (_, i) => ({
      releaseId: `${tag}-${pad(i, 4)}`,
      studioId: `S-${pad(i % studioCount, 2)}`,
      genre: GENRES[i % GENRES.length],
    }))
    return { week, members }
  }

  it('market-large-batch-linear-storage', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 900
    const small = buildDenseBatch(week, 32, 32, 'SMLL')
    const large = buildDenseBatch(week, 512, 64, 'LRGE')
    const smallResult = assessBatch([], small)[0]
    const largeResult = assessBatch([], large)[0]
    // structural invariant: the assessment record's shape (key set, and every
    // array-valued field's length) does not grow with batch size — no co-batch
    // list embedded per assessment (1323-A §4 / 1323-F Amendment 3, annex L.5).
    expect(Object.keys(largeResult).sort()).toEqual(Object.keys(smallResult).sort())
    for (const key of Object.keys(largeResult)) {
      if (Array.isArray((largeResult as Record<string, unknown>)[key])) {
        expect(((largeResult as Record<string, unknown>)[key] as unknown[]).length).toBeLessThanOrEqual(5)
      }
    }
    // 1346-D Blocking 2: the top-level array-length check above does NOT see a co-batch
    // list NESTED inside a reason (e.g. GENRE_SATURATION listing every same-genre batch
    // peer). Check every reason's sourceReleaseIds at BOTH sizes explicitly, against the
    // exported law constant, not a hardcoded literal.
    const sourceLimit = requireConst<number>(market, 'MARKET_REASON_SOURCE_LIMIT')
    for (const record of [smallResult, largeResult]) {
      for (const reason of record.reasons as any[]) {
        expect(Array.isArray(reason.sourceReleaseIds)).toBe(true)
        expect(reason.sourceReleaseIds.length).toBeLessThanOrEqual(sourceLimit)
      }
    }
    // ceiling check: a fixed byte bound that does NOT grow with batch size. Chosen
    // generously (5 reasons * ~150 chars/reason + base scalar fields headroom);
    // see the handback for the exact reasoning.
    const CEILING = 3000
    expect(JSON.stringify(smallResult).length).toBeLessThan(CEILING)
    expect(JSON.stringify(largeResult).length).toBeLessThan(CEILING)
  })
})

describe('p15a1 shared market: step counter (Amendment 3 work bound, small scale)', () => {
  it('market-step-counter-basic', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 950
    const exposures = [
      { releaseId: 'E-1', studioId: 'S-1', genre: 'comedy' as const, releaseWeek: week - 1 },
      { releaseId: 'E-2', studioId: 'S-2', genre: 'comedy' as const, releaseWeek: week - 2 },
    ]
    const batch = {
      week,
      members: [
        { releaseId: 'M-1', studioId: 'S-3', genre: 'comedy' as const },
        { releaseId: 'M-2', studioId: 'S-4', genre: 'comedy' as const },
      ],
    }
    const steps = { count: 0 }
    assessBatch(exposures, batch, { steps })
    expect(steps.count).toBeGreaterThan(0)
    expect(steps.count).toBeLessThanOrEqual(exposures.length + 2 * batch.members.length)
  })
})

describe('p15a1 shared market: reduceExposures', () => {
  it('market-reduce-exposures-append', async () => {
    const market = await loadMarket()
    const reduceExposures = requireFn<any>(market, 'reduceExposures')
    const week = 100
    const batch = { week, members: [{ releaseId: 'R1', studioId: 'S1', genre: 'comedy' as const }] }
    const result = reduceExposures([], batch)
    expect(result.exposures).toEqual([{ releaseId: 'R1', studioId: 'S1', genre: 'comedy', releaseWeek: week }])
    expect(result.retired).toEqual([])
    expect(result.transitions).toEqual([])
  })

  it('market-reduce-exposures-retire-boundary', async () => {
    const market = await loadMarket()
    const reduceExposures = requireFn<any>(market, 'reduceExposures')
    const week = 100
    const retiring = { releaseId: 'X', studioId: 'SX', genre: 'drama' as const, releaseWeek: week - 26 } // offset 26: retired
    const surviving = { releaseId: 'Y', studioId: 'SY', genre: 'drama' as const, releaseWeek: week - 25 } // offset 25: still stock
    const result = reduceExposures([retiring, surviving], { week, members: [] })
    expect(result.exposures.map((e: any) => e.releaseId)).toEqual(['Y'])
    expect(result.retired).toEqual(['X'])
  })

  it('market-reduce-exposures-lane-transition', async () => {
    const market = await loadMarket()
    const reduceExposures = requireFn<any>(market, 'reduceExposures')
    // ASSUMPTION (flagged as a finding: 1323-F says the reducer "reports lane
    // transitions" without pinning the reference point): `from` is the lane at
    // (batch.week - 1), `to` is the lane at batch.week. This is well-defined from
    // releaseWeek and the two week numbers alone, with no dependency on prior calls.
    const releaseWeek = 200
    // window -> stock at the R+4 boundary
    const crossingToStock = { releaseId: 'Z', studioId: 'SZ', genre: 'romance' as const, releaseWeek }
    const r1 = reduceExposures([crossingToStock], { week: releaseWeek + 4, members: [] })
    expect(r1.transitions).toContainEqual({ releaseId: 'Z', from: 'window', to: 'stock' })
    // stock -> retired at the R+26 boundary
    const crossingToRetired = { releaseId: 'W', studioId: 'SW', genre: 'romance' as const, releaseWeek }
    const r2 = reduceExposures([crossingToRetired], { week: releaseWeek + 26, members: [] })
    expect(r2.transitions).toContainEqual({ releaseId: 'W', from: 'stock', to: 'retired' })
    expect(r2.retired).toEqual(['W'])
  })
})

describe('p15a1 shared market: assessment shape invariants', () => {
  it('market-input-digest-deterministic-and-sensitive', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 1000
    const batch = { week, members: [{ releaseId: 'A', studioId: 'S-A', genre: 'horror' as const }] }
    const run1 = assessBatch([], batch)[0]
    const run2 = assessBatch([], batch)[0]
    expect(typeof run1.inputDigest).toBe('string')
    expect(run1.inputDigest.length).toBeGreaterThan(0)
    expect(run2.inputDigest).toBe(run1.inputDigest) // same inputs -> same digest

    const differentBatch = { week, members: [{ releaseId: 'B', studioId: 'S-A', genre: 'horror' as const }] }
    const run3 = assessBatch([], differentBatch)[0]
    expect(run3.inputDigest).not.toBe(run1.inputDigest) // different inputs -> different digest
  })

  it('market-pressure-decomposition-invariant', async () => {
    const market = await loadMarket()
    const assessBatch = requireFn<any>(market, 'assessBatch')
    const week = 1100
    const preBatchExposure = { releaseId: 'PRE', studioId: 'S-C', genre: 'adventure' as const, releaseWeek: week - 5 } // stock lane
    const batch = {
      week,
      members: [
        { releaseId: 'A', studioId: 'S-A', genre: 'adventure' as const },
        { releaseId: 'B', studioId: 'S-B', genre: 'adventure' as const },
      ],
    }
    const assessments = assessBatch([preBatchExposure], batch)
    for (const a of assessments as any[]) {
      expect(a.pressure).toBeCloseTo(a.windowTerm + a.stockTerm, 9)
      expect(a.definitionVersion).toBe(market.SHARED_MARKET_DEFINITION)
    }
  })
})
