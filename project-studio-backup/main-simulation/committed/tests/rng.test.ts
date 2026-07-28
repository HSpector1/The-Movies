// Phase-1 test: seeded RNG (rev. 4 M9) and the §9 distributions.
//
// Contract sources:
//  - M9 (rev4-open-questions.md): the sim stream threaded through state.rngState,
//    plus stateless derived streams stream(seed,'candidates',k),
//    stream(seed,'agent',k), stream(seed,'forecast',k); derived streams are
//    deterministic, save-free, replay-exact, and isolated from the sim stream.
//  - §5.1 world-gen determinism: "Seeded and reproducible".
//  - §9 distributions and their parameterizations.
//
// No expected numeric value is copied from implementation — every assertion tests
// a *property* the contract states (determinism, isolation, bounds), not a
// hard-coded sequence value.

import { describe, it, expect } from 'vitest'
import { RngStream, stream } from '../src/core/index.js'

// Draw n values from a stream via next().
function draws(s: RngStream, n: number): number[] {
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(s.next())
  return out
}

describe('M9 — same seed string → identical next() sequence', () => {
  it('two independently-constructed sim streams from the same seed match over ≥100 draws', () => {
    // Source: M9 / §15.7 replay — determinism from the seed.
    const a = RngStream.fromSeed('seed-alpha')
    const b = RngStream.fromSeed('seed-alpha')
    expect(draws(a, 100)).toEqual(draws(b, 100))
  })

  it('different seeds → different sequences (not identical over 100 draws)', () => {
    // Source: M9 — the seed is the sole determinant; distinct seeds must diverge.
    const a = draws(RngStream.fromSeed('seed-alpha'), 100)
    const b = draws(RngStream.fromSeed('seed-beta'), 100)
    expect(a).not.toEqual(b)
  })
})

describe('M9 — serialize()/deserialize() round-trip resumes the exact sequence', () => {
  it('a stream deserialized from a mid-sequence snapshot resumes identically', () => {
    // Source: §2.5 rngState is a string; M9 replay-exact resumption.
    const live = RngStream.fromSeed('resume-seed')
    draws(live, 37) // advance to an arbitrary mid-point
    const snapshot = live.serialize()
    expect(typeof snapshot).toBe('string')

    const continuationFromLive = draws(live, 50)

    const resumed = RngStream.deserialize(snapshot)
    const continuationFromResumed = draws(resumed, 50)

    expect(continuationFromResumed).toEqual(continuationFromLive)
  })

  it('serialize is a pure snapshot — it does not advance the stream', () => {
    // Source: M9 — serialization captures state without consuming a draw.
    const s = RngStream.fromSeed('snapshot-seed')
    draws(s, 10)
    const beforeSnap = s.serialize()
    s.serialize() // extra snapshot calls must be side-effect-free
    const afterSnap = s.serialize()
    expect(afterSnap).toEqual(beforeSnap)
  })
})

describe("M9 — derived streams stream(seed, purpose, k)", () => {
  const SEED = 'derived-seed'

  it('are deterministic for a fixed (seed, purpose, k)', () => {
    // Source: M9 — derived streams are stateless/deterministic.
    for (const purpose of ['candidates', 'agent', 'forecast'] as const) {
      const a = draws(stream(SEED, purpose, 3), 100)
      const b = draws(stream(SEED, purpose, 3), 100)
      expect(a).toEqual(b)
    }
  })

  it('differ from one another for the same seed and k', () => {
    // Source: M9 — four *distinct* named streams; different purposes must diverge.
    const cand = draws(stream(SEED, 'candidates', 5), 100)
    const agent = draws(stream(SEED, 'agent', 5), 100)
    const forecast = draws(stream(SEED, 'forecast', 5), 100)
    expect(cand).not.toEqual(agent)
    expect(cand).not.toEqual(forecast)
    expect(agent).not.toEqual(forecast)
  })

  it('differ across distinct k for the same purpose', () => {
    // Source: M9 — stream(seed,'candidates',tick) is per-tick; k participates.
    const k3 = draws(stream(SEED, 'candidates', 3), 100)
    const k4 = draws(stream(SEED, 'candidates', 4), 100)
    expect(k3).not.toEqual(k4)
  })

  it('differ from the sim stream for the same seed', () => {
    // Source: M9 — the sim stream carries only reception-time sampling and is a
    // separate stream from the derived ones; they must not coincide.
    const sim = draws(RngStream.fromSeed(SEED), 100)
    for (const purpose of ['candidates', 'agent', 'forecast'] as const) {
      expect(draws(stream(SEED, purpose, 0), 100)).not.toEqual(sim)
    }
  })

  it('do not advance the sim stream (isolation — §15.6 forecast-independence)', () => {
    // Source: M9 — "isolating the forecast draw from the sim stream is what makes
    // §15.6's forecast-independence test hold." Constructing/drawing derived
    // streams must leave the sim stream's own sequence untouched.
    const sim = RngStream.fromSeed(SEED)
    const baseline = draws(sim, 50)

    const simB = RngStream.fromSeed(SEED)
    // interleave heavy derived-stream use between sim draws
    const observed: number[] = []
    for (let i = 0; i < 50; i++) {
      draws(stream(SEED, 'candidates', i), 5)
      draws(stream(SEED, 'agent', i), 5)
      draws(stream(SEED, 'forecast', i), 5)
      observed.push(simB.next())
    }
    expect(observed).toEqual(baseline)
  })
})

describe('§9 distributions — uniform stays in [lo, hi)', () => {
  it('uniform(lo, hi) never returns lo>x or x>=hi across many draws', () => {
    // Source: §9 uniform(-1,1) / uniform(0.8,1.8) style draws; half-open [lo,hi).
    const s = stream('uniform-seed', 'candidates', 0)
    const lo = -1
    const hi = 1
    for (let i = 0; i < 10_000; i++) {
      const x = s.uniform(lo, hi)
      expect(x).toBeGreaterThanOrEqual(lo)
      expect(x).toBeLessThan(hi)
    }
  })

  it('uniform over a positive interval respects the same half-open bound', () => {
    // Source: §9 tolerance ~ uniform(0.8, 1.8).
    const s = stream('uniform-seed-2', 'candidates', 1)
    for (let i = 0; i < 10_000; i++) {
      const x = s.uniform(0.8, 1.8)
      expect(x).toBeGreaterThanOrEqual(0.8)
      expect(x).toBeLessThan(1.8)
    }
  })
})

describe('§9 distributions — gaussian is deterministic per stream state', () => {
  it('two streams at the same state produce the same gaussian draw sequence', () => {
    // Source: §5.3/§7 gaussian(mean, sigma, rng) — determinism from stream state.
    const a = stream('gauss-seed', 'forecast', 2)
    const b = stream('gauss-seed', 'forecast', 2)
    const seqA: number[] = []
    const seqB: number[] = []
    for (let i = 0; i < 100; i++) {
      seqA.push(a.gaussian(50, 10))
      seqB.push(b.gaussian(50, 10))
    }
    expect(seqA).toEqual(seqB)
  })
})

describe('§9 distributions — truncatedNormal NEVER leaves [lo, hi]', () => {
  // Source: §3 recorded refutation — truncatedNormal is true truncated sampling
  // (resample until in range), so every draw is within [lo, hi] inclusive.
  // Parameterizations are the §9 world-gen ones. Bounded-term convention:
  // assert the stated range across a large sample.
  const cases: Array<{
    name: string
    mean: number
    sd: number
    lo: number
    hi: number
  }> = [
    { name: 'skill', mean: 60, sd: 15, lo: 20, hi: 95 },
    { name: 'fame', mean: 40, sd: 22, lo: 0, hi: 95 },
    { name: 'age', mean: 38, sd: 10, lo: 20, hi: 70 },
    { name: 'baselineStrength', mean: 60, sd: 15, lo: 20, hi: 95 },
    { name: 'originalityRaw', mean: 55, sd: 20, lo: 5, hi: 100 },
  ]

  for (const c of cases) {
    it(`${c.name} (${c.mean},${c.sd},${c.lo},${c.hi}) stays within [lo,hi] over 10_000 draws`, () => {
      const s = stream(`tn-${c.name}`, 'candidates', 0)
      for (let i = 0; i < 10_000; i++) {
        const x = s.truncatedNormal(c.mean, c.sd, c.lo, c.hi)
        expect(x).toBeGreaterThanOrEqual(c.lo)
        expect(x).toBeLessThanOrEqual(c.hi)
      }
    })
  }
})
