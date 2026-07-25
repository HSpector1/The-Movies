// ── §13 Agents and the decision grid — declarations only (phase 1) ───────────
// The finite action-space constants and rangeFrom (given verbatim in §13).
// The agents themselves are phase 3 and are NOT built here (see §12).

import { clamp } from './math.js'
import type { Range } from './types.js'

export const NEGATIVE_BUDGET_MULTIPLIERS = [0.75, 1.0, 1.25] as const
export const MARKETING_BUDGET_LEVELS = [100_000, 400_000, 1_000_000] as const
export const PROMISE_WIDTHS = [0.4, 0.8, 1.4, 2.0] as const
export const PROMISE_CENTERS = [-0.75, -0.25, 0.25, 0.75] as const

// §13 verbatim.
export function rangeFrom(center: number, width: number): Range {
  return [clamp(center - width / 2, -1, 1), clamp(center + width / 2, -1, 1)]
}

export const CANDIDATE_CONFIG = {
  maxWritersPerConcept: 5,
  maxDirectorsPerConcept: 5,
  maxActorsPerSlot: 8,
  maxPackagesPerDecision: 500,
} as const
