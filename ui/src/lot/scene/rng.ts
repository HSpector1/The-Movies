// ── Deterministic seeded RNG ──────────────────────────────────────────────────
// NO Math.random anywhere in this spike. Every cosmetic variation (worker start
// offsets, prop jitter, light phases, crowd sizes) draws from here, seeded by the
// snapshot's sceneSeed. Same seed → same lot, every time.
//
// mulberry32 over a cyrb53 string hash: tiny, fast, well-distributed, and fully
// deterministic across runs and machines.

function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

export class Rng {
  private state: number

  constructor(seed: string) {
    // Fold the 53-bit hash into a 32-bit state for mulberry32.
    this.state = cyrb53(seed) >>> 0
  }

  /** Next float in [0, 1). */
  next(): number {
    let t = (this.state += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Float in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1))
  }

  /** True with probability p (0..1). */
  chance(p: number): boolean {
    return this.next() < p
  }

  /** Pick one element deterministically. */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)]
  }

  /** A stable sub-stream, so unrelated systems don't consume each other's draws. */
  fork(label: string): Rng {
    return new Rng(`${this.state.toString(36)}:${label}`)
  }
}
