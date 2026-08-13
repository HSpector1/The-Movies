// ── Seeded RNG (rev. 4 item M9 architecture) ─────────────────────────────────
// Deterministic PRNG with serializable state as a string (for GameState.rngState).
//
// Algorithm: sfc32 (a small, fast, well-distributed 128-bit counter-based PRNG),
// seeded by hashing the seed string through a splitmix32 finalizer to fill the
// four 32-bit words. splitmix advances the hash accumulator between words so a
// one-word seed still fills the whole state well.
//
// Streams:
//   RngStream — a stateful stream created from a seed string. next() yields
//     uniform [0,1); serialize()/deserialize() round-trip the state through a
//     string so it can live on GameState.rngState.
//   stream(seed, purpose, key) — a stateless DERIVED stream: purpose and key are
//     mixed into the hash so the same (seed, purpose, key) always produces the
//     same independent stream. Used by phases 2–3 for the 'candidates' | 'agent' |
//     'forecast' | 'worldgen' substreams (M9; 'worldgen' added in phase 3 for §9
//     world generation). "Stateless" means: derived on demand from the run seed,
//     never threaded through save — so replays are exact without storing these
//     streams.
//
// No unseeded randomness anywhere in this tree — including tests and config.

// D-9 adds two DERIVED-stream purposes (additive; existing streams unchanged):
//   'migrate' — legacy V1→V2 talent conversion (D-9.15 formulas), keyed by
//               old.id + '-' + field
//   'develop' — the tick DEVELOPMENT step (D-9.8), keyed by productionId + ':' + talentId
// Both are stateless derived streams, so they never advance state.rngState → §15.7
// replay-exactness is preserved.
//
// D-11 adds one more DERIVED-stream purpose (additive; existing streams unchanged):
//   'hiring' — the founding applicant draft, deterministic contract offers, and the
//              freelancer/hiring market rotation (D-11.2/.6/.14). Stateless, so it
//              never advances state.rngState → replay stays exact.
export type RngPurpose =
  | 'candidates'
  | 'agent'
  | 'forecast'
  | 'worldgen'
  | 'migrate'
  | 'develop'
  | 'hiring'
  // D-13 conditional discoverability: an ISOLATED, engaged-only, versioned derived stream keyed by
  // productionId. Like 'develop'/'forecast' it never advances state.rngState, so §15.7 deterministic
  // replay + M0A byte-identity hold. Versioned ('-v1') so a future recalibration can re-key cleanly.
  | 'discovery-v1'
  // Casting Sessions V1: isolated camera-test evidence, keyed by
  // sessionId:talentId:slot. Derived-only, so completion never advances rngState.
  | 'casting-v1'

// A 32-bit hash accumulator step (splitmix32 finalizer). Deterministic, avalanche-y.
function splitmix32(seed: number): { value: number; next: number } {
  let z = (seed + 0x9e3779b9) | 0
  const next = z
  z = Math.imul(z ^ (z >>> 16), 0x21f0aaad)
  z = Math.imul(z ^ (z >>> 15), 0x735a2d97)
  z = z ^ (z >>> 15)
  return { value: z >>> 0, next }
}

// Hash a string to a 32-bit accumulator (deterministic FNV-1a-style fold).
function hashStringToSeed(s: string): number {
  let h = 0x811c9dc5 | 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h | 0
}

// Fill sfc32's four 32-bit state words from a string seed via splitmix32 walking.
function seedToState(seed: string): [number, number, number, number] {
  let acc = hashStringToSeed(seed)
  const words: number[] = []
  for (let i = 0; i < 4; i++) {
    const { value, next } = splitmix32(acc)
    words.push(value)
    acc = next
  }
  return [words[0]!, words[1]!, words[2]!, words[3]!]
}

// sfc32 core step. Mutates the four-word state array in place and returns [0,1).
function sfc32Next(st: [number, number, number, number]): number {
  let [a, b, c, d] = st
  a >>>= 0
  b >>>= 0
  c >>>= 0
  d >>>= 0
  const t = (a + b) | 0
  a = b ^ (b >>> 9)
  b = (c + (c << 3)) | 0
  c = (c << 21) | (c >>> 11)
  d = (d + 1) | 0
  const sum = (t + d) | 0
  c = (c + sum) | 0
  st[0] = a >>> 0
  st[1] = b >>> 0
  st[2] = c >>> 0
  st[3] = d >>> 0
  return (sum >>> 0) / 4294967296 // 2^32 → [0,1)
}

export class RngStream {
  private st: [number, number, number, number]
  // Box–Muller caches a second normal deviate. NOTE on draw counts: Box–Muller
  // consumes exactly TWO uniforms per PAIR of gaussians. To keep the draw count
  // per gaussian deterministic and independent of ordering, this implementation
  // does NOT cache the spare — every gaussian() call consumes two uniforms and
  // uses only the first deviate. That makes the sim stream's advance-per-draw
  // fixed at two uniforms, which matters for replay exactness (§15.7): a cached
  // spare would make the Nth gaussian depend on whether an odd earlier call left
  // one buffered.

  private constructor(state: [number, number, number, number]) {
    this.st = state
  }

  static fromSeed(seed: string): RngStream {
    return new RngStream(seedToState(seed))
  }

  static deserialize(s: string): RngStream {
    const parts = s.split(',')
    if (parts.length !== 4) {
      throw new Error(`RngStream.deserialize: expected 4 state words, got ${parts.length}`)
    }
    const words = parts.map((p) => {
      const n = Number(p)
      if (!Number.isInteger(n) || n < 0 || n > 0xffffffff) {
        throw new Error(`RngStream.deserialize: invalid state word "${p}"`)
      }
      return n >>> 0
    })
    return new RngStream([words[0]!, words[1]!, words[2]!, words[3]!])
  }

  // Serialize state to a string suitable for GameState.rngState. Round-trips
  // exactly through deserialize().
  serialize(): string {
    return `${this.st[0]},${this.st[1]},${this.st[2]},${this.st[3]}`
  }

  // Uniform [0,1).
  next(): number {
    return sfc32Next(this.st)
  }

  // Uniform [lo, hi).
  uniform(lo: number, hi: number): number {
    return lo + (hi - lo) * this.next()
  }

  // Gaussian via Box–Muller (see the class note on draw counts).
  gaussian(mean: number, sigma: number): number {
    let u1 = this.next()
    // guard the log against u1 === 0 (next() can return exactly 0)
    if (u1 < Number.MIN_VALUE) u1 = Number.MIN_VALUE
    const u2 = this.next()
    const mag = Math.sqrt(-2.0 * Math.log(u1))
    const z0 = mag * Math.cos(2.0 * Math.PI * u2)
    return mean + sigma * z0
  }

  // Truncated normal by REJECTION — resample until the draw lands in [lo, hi].
  // rev. 4 explicitly rules out clamping (the contract's own clamp idiom on the
  // adjacent worldgen line is the contrast). A guard bounds the loop against a
  // pathological (lo, hi) that the sampler can never hit.
  truncatedNormal(mean: number, sd: number, lo: number, hi: number): number {
    if (lo > hi) {
      throw new Error(`truncatedNormal: empty interval [${lo}, ${hi}]`)
    }
    const MAX_TRIES = 10000
    for (let i = 0; i < MAX_TRIES; i++) {
      const v = this.gaussian(mean, sd)
      if (v >= lo && v <= hi) return v
    }
    throw new Error(
      `truncatedNormal: no sample in [${lo}, ${hi}] for N(${mean}, ${sd}) after ${MAX_TRIES} tries`,
    )
  }
}

// Derived stateless stream. purpose and key are mixed into the hash so each
// (seed, purpose, key) yields an independent, reproducible stream.
export function stream(seed: string, purpose: RngPurpose, key: string | number): RngStream {
  return RngStream.fromSeed(`${seed}::${purpose}::${key}`)
}
