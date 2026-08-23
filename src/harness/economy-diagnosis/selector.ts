// Economy Diagnosis 02 — analysis-only selector frontier.
//
// This module never enters production code. It holds the candidate package set,
// player-visible information, founding roster, renewal behavior and action law
// constant while varying only the exponent placed on committed cost:
//
//   score = forecast centre profit / committedCost^exponent
//
// exponent 0 is exactly P5 (absolute profit), exponent 1 is exactly P6 (ROI),
// and exponent 1/2 is a principled midpoint rather than an independently tuned
// package formula.

// The endpoint-equivalence tests are load-bearing: if either endpoint stops
// reproducing its established policy, the midpoint ceases to be a controlled
// intervention.

import type { Action } from '../../core/index.js'
import { runOne } from '../d16/driver.js'
import type { RunRecord } from '../d16/driver.js'
import type { D16Package } from '../d16/packages.js'
import {
  forecastProfitMax,
  maintenanceActions,
} from '../d16/policies.js'
import type { PlayerCtx, PlayerPolicy } from '../d16/policies.js'
import type { PlayerView } from '../d16/view.js'
import {
  MACRO_HORIZON_WEEKS,
  MACRO_SLICE_WEEKS,
  compactMacroRun,
} from '../economy-truth-audit/macro.js'
import type { MacroRunCompact } from '../economy-truth-audit/macro.js'

export const DIAGNOSIS_SELECTOR_SCHEMA_VERSION =
  'economy-diagnosis-selector-v1' as const

export const SELECTOR_EXPONENTS = [0, 0.5, 1] as const
export type SelectorExponent = (typeof SELECTOR_EXPONENTS)[number]

function exponentLabel(exponent: SelectorExponent): string {
  return exponent === 0 ? '0' : exponent === 0.5 ? '0_5' : '1'
}

function greenlightAction(pkg: D16Package): Action {
  return {
    kind: 'greenlight',
    production: {
      conceptId: pkg.conceptId,
      shape: pkg.shape,
      promise: pkg.promise,
      writerId: pkg.writerId,
      directorId: pkg.directorId,
      craftIds: [...pkg.craftIds],
      cast: { ...pkg.cast },
      budget: { ...pkg.budget },
    },
  }
}

function bestAffordable(
  ctx: PlayerCtx,
  packages: readonly D16Package[],
  exponent: SelectorExponent,
): D16Package | null {
  let best: D16Package | null = null
  let bestScore = -Infinity
  for (const pkg of packages) {
    if (!ctx.affordable(pkg)) continue
    const evaluation = ctx.evaluate(pkg)
    const denominator = exponent === 0 ? 1 : pkg.committedCost ** exponent
    const score = evaluation.centerProfit / denominator
    if (
      score > bestScore ||
      (score === bestScore && best !== null && pkg.id < best.id)
    ) {
      best = pkg
      bestScore = score
    }
  }
  return best
}

function selectorDecision(
  policy: PlayerPolicy,
  exponent: SelectorExponent,
  view: PlayerView,
  ctx: PlayerCtx,
): Action[] {
  const maintenance = maintenanceActions(view, policy.roster)
  if (maintenance.length > 0) return maintenance
  if (view.activeProductions.length >= ctx.maxConcurrent) return []
  const pkg = bestAffordable(ctx, ctx.packages().packages, exponent)
  return pkg === null ? [] : [greenlightAction(pkg)]
}

/** A harness-only policy with the exact P5/P6 common action surface. */
export function profitCostExponentPolicy(
  exponent: SelectorExponent,
): PlayerPolicy {
  const policy: PlayerPolicy = {
    name: `D02_profitCostExponent_${exponentLabel(exponent)}`,
    kind: 'player',
    disengagementIntended: false,
    description:
      `Diagnosis-only P5/P6 frontier: maximize forecast profit divided by committed cost^${String(exponent)} over the unchanged full package scan.`,
    founding: structuredClone(forecastProfitMax.founding),
    roster: structuredClone(forecastProfitMax.roster),
    decide(view, ctx) {
      return selectorDecision(policy, exponent, view, ctx)
    },
  }
  return policy
}

export function runSelectorRecord(
  seed: string,
  exponent: SelectorExponent,
): RunRecord {
  return runOne({
    seed,
    policy: profitCostExponentPolicy(exponent),
    horizonWeeks: MACRO_HORIZON_WEEKS,
    sliceWeeks: MACRO_SLICE_WEEKS,
    checkpointEvery: 26,
    productionD17b: true,
    awarenessStats: true,
    captureLedgerAtSlices: true,
  })
}

export function runSelectorCell(
  seed: string,
  exponent: SelectorExponent,
): MacroRunCompact {
  return compactMacroRun(runSelectorRecord(seed, exponent))
}

