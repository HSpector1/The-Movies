// ── Numeric primitives the contract references by name ───────────────────────
// The contract's formulas call clamp/mean/lerp/etc. by name. Phase 1 needs only
// clamp and mean (for §4 specificity). The rest of the primitive set is a phase-2
// concern and is deliberately NOT pre-built here — see the §11 non-goals rule and
// the phase gate in build-contract.md §12.

// clamp a value into [lo, hi].
export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

// arithmetic mean; empty input is undefined behaviour in the contract's usages
// (every caller passes a fixed non-empty list), so it is not guarded here.
export function mean(xs: number[]): number {
  let s = 0
  for (const x of xs) s += x
  return s / xs.length
}
