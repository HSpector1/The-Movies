import { m0WiringProbe as __m0WiringProbe } from "./m0WiringProbe.js";
function splitmix32(seed) {
  let z = seed + 2654435769 | 0;
  const next = z;
  z = Math.imul(z ^ z >>> 16, 569420461);
  z = Math.imul(z ^ z >>> 15, 1935289751);
  z = z ^ z >>> 15;
  return { value: z >>> 0, next };
}
function hashStringToSeed(s) {
  let h = 2166136261 | 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}
function seedToState(seed) {
  let acc = hashStringToSeed(seed);
  const words = [];
  for (let i = 0; i < 4; i++) {
    const { value, next } = splitmix32(acc);
    words.push(value);
    acc = next;
  }
  return [words[0], words[1], words[2], words[3]];
}
function sfc32Next(st) {
  let [a, b, c, d] = st;
  a >>>= 0;
  b >>>= 0;
  c >>>= 0;
  d >>>= 0;
  const t = a + b | 0;
  a = b ^ b >>> 9;
  b = c + (c << 3) | 0;
  c = c << 21 | c >>> 11;
  d = d + 1 | 0;
  const sum = t + d | 0;
  c = c + sum | 0;
  st[0] = a >>> 0;
  st[1] = b >>> 0;
  st[2] = c >>> 0;
  st[3] = d >>> 0;
  return (sum >>> 0) / 4294967296;
}
export class RngStream {
  // Box–Muller caches a second normal deviate. NOTE on draw counts: Box–Muller
  // consumes exactly TWO uniforms per PAIR of gaussians. To keep the draw count
  // per gaussian deterministic and independent of ordering, this implementation
  // does NOT cache the spare — every gaussian() call consumes two uniforms and
  // uses only the first deviate. That makes the sim stream's advance-per-draw
  // fixed at two uniforms, which matters for replay exactness (§15.7): a cached
  // spare would make the Nth gaussian depend on whether an odd earlier call left
  // one buffered.
  constructor(state) {
    this.st = state;
  }
  static fromSeed(seed) {
    return new RngStream(seedToState(seed));
  }
  static deserialize(s) {
    const parts = s.split(",");
    if (parts.length !== 4) {
      throw new Error(`RngStream.deserialize: expected 4 state words, got ${parts.length}`);
    }
    const words = parts.map((p) => {
      const n = Number(p);
      if (!Number.isInteger(n) || n < 0 || n > 4294967295) {
        throw new Error(`RngStream.deserialize: invalid state word "${p}"`);
      }
      return n >>> 0;
    });
    return new RngStream([words[0], words[1], words[2], words[3]]);
  }
  // Serialize state to a string suitable for GameState.rngState. Round-trips
  // exactly through deserialize().
  serialize() {
    return `${this.st[0]},${this.st[1]},${this.st[2]},${this.st[3]}`;
  }
  // Uniform [0,1).
  next() {
    __m0WiringProbe.call("RngStream.next");
    return sfc32Next(this.st);
  }
  // Uniform [lo, hi).
  uniform(lo, hi) {
    return lo + (hi - lo) * this.next();
  }
  // Gaussian via Box–Muller (see the class note on draw counts).
  gaussian(mean, sigma) {
    let u1 = this.next();
    if (u1 < Number.MIN_VALUE) u1 = Number.MIN_VALUE;
    const u2 = this.next();
    const mag = Math.sqrt(-2 * Math.log(u1));
    const z0 = mag * Math.cos(2 * Math.PI * u2);
    return mean + sigma * z0;
  }
  // Truncated normal by REJECTION — resample until the draw lands in [lo, hi].
  // rev. 4 explicitly rules out clamping (the contract's own clamp idiom on the
  // adjacent worldgen line is the contrast). A guard bounds the loop against a
  // pathological (lo, hi) that the sampler can never hit.
  truncatedNormal(mean, sd, lo, hi) {
    if (lo > hi) {
      throw new Error(`truncatedNormal: empty interval [${lo}, ${hi}]`);
    }
    const MAX_TRIES = 1e4;
    for (let i = 0; i < MAX_TRIES; i++) {
      const v = this.gaussian(mean, sd);
      if (v >= lo && v <= hi) return v;
    }
    throw new Error(
      `truncatedNormal: no sample in [${lo}, ${hi}] for N(${mean}, ${sd}) after ${MAX_TRIES} tries`
    );
  }
}
export function stream(seed, purpose, key) {
  __m0WiringProbe.call("stream", { seed, purpose, key });
  return RngStream.fromSeed(`${seed}::${purpose}::${key}`);
}
