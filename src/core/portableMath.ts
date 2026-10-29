// ── ASTRA Sprint 19 (Owner decision D): engine-independent transcendentals for sealed market law ──
//
// IEEE 754 requires + − × ÷ and sqrt to be correctly rounded, so a formula built only from those operations, literal
// constants and exactly specified integer helpers (Math.round, Math.floor) yields the same bits on every conforming
// engine. Math.exp and Math.pow carry no such guarantee: V8 in Node 20 and V8 in Chrome 150 disagree by one ULP on
// exp(−0.18762187201345415) (the Owner's Chrome-written P18 save, assessment studio-373a3bcc-r04:film:4), and the
// save validator re-derives the shared-market factor with exact equality. The live era therefore prices through these
// functions; sealed eras keep the engine's own, with a bounded reconciliation (marketIntegration.ts).
//
// Accuracy: Cody-Waite range reduction (x = k·ln2 + r, |r| ≤ ln2/2) with a two-part ln2, a degree-13 Taylor polynomial
// in Horner form (truncation error below 2^-60 relative on |r| ≤ 0.35), then an exact scale by 2^k. The result is
// within about one ULP of the true value; it is deterministic, not correctly rounded, and that is the property wanted.

const LN2_HI = 0.6931471803691238 // 0x3FE62E42FEE00000: the leading bits of ln 2, exact in a double with trailing zeros
const LN2_LO = 1.9082149292705877e-10 // ln 2 − LN2_HI
const LN2 = 0.6931471805599453

/** 2^k for an integer k in [−1074, 1023], built by exact doublings and halvings. */
function scale2(k: number): number {
  let result = 1
  let factor = k < 0 ? 0.5 : 2
  for (let n = Math.abs(k); n > 0; n--) result *= factor
  return result
}

/** e^x from basic operations only; identical bits on every IEEE 754 engine. NaN in, NaN out; ±Infinity as Math.exp. */
export function portableExp(x: number): number {
  if (Number.isNaN(x)) return NaN
  if (x > 709.782712893384) return Infinity
  if (x < -745.1332191019412) return 0
  const k = Math.round(x / LN2)
  const r = (x - k * LN2_HI) - k * LN2_LO
  // Horner over 1 + r + r²/2! + … + r¹³/13!
  let p = 1 / 6227020800
  p = p * r + 1 / 479001600
  p = p * r + 1 / 39916800
  p = p * r + 1 / 3628800
  p = p * r + 1 / 362880
  p = p * r + 1 / 40320
  p = p * r + 1 / 5040
  p = p * r + 1 / 720
  p = p * r + 1 / 120
  p = p * r + 1 / 24
  p = p * r + 1 / 6
  p = p * r + 0.5
  p = p * r + 1
  p = p * r + 1
  // Scale in two steps when k is large so no intermediate underflows to a subnormal before the final product.
  if (k > 1000) return p * scale2(1000) * scale2(k - 1000)
  if (k < -1000) return p * scale2(-1000) * scale2(k + 1000)
  return p * scale2(k)
}

/** 2^y from basic operations only (y any finite double): 2^k · e^(f·ln2) with k = round(y), f = y − k ∈ [−0.5, 0.5]. */
export function portablePow2(y: number): number {
  if (Number.isNaN(y)) return NaN
  if (y > 1024) return Infinity
  if (y < -1075) return 0
  const k = Math.round(y)
  const f = y - k
  // e^(f·ln2) with |f·ln2| ≤ 0.35: the same polynomial, no further reduction needed.
  const r = f * LN2
  let p = 1 / 6227020800
  p = p * r + 1 / 479001600
  p = p * r + 1 / 39916800
  p = p * r + 1 / 3628800
  p = p * r + 1 / 362880
  p = p * r + 1 / 40320
  p = p * r + 1 / 5040
  p = p * r + 1 / 720
  p = p * r + 1 / 120
  p = p * r + 1 / 24
  p = p * r + 1 / 6
  p = p * r + 0.5
  p = p * r + 1
  p = p * r + 1
  if (k > 1000) return p * scale2(1000) * scale2(k - 1000)
  if (k < -1000) return p * scale2(-1000) * scale2(k + 1000)
  return p * scale2(k)
}
