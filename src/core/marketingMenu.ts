// ── D-17B §4 — the capacity-anchored marketing menu (Owner ruling R6, escalation E2) ──
//
// WHAT CHANGED. The shipped menu was a FIXED dollar triple (`grid.ts`'s
// `MARKETING_BUDGET_LEVELS = [100k, 400k, 1M]`). D-16 measured that grid as 60.5% dominated
// with a dead rung, and D-17B measured why no fixed triple can fix it: the film's efficient
// marketing capacity — the spend at which reach half-saturates — swings about 8.3× across
// states, so any fixed triple is either far past capacity for a small unknown film or far
// short of it for an event film. The selected menu is therefore three MULTIPLES of that
// capacity: {1.3×, 2.4×, 3.7×} (max-optimal share 38.7%, zero dead rungs, distressed access
// 9.4%; CAP beats the best FIX on 11 of 14 player arms, +$0.230M pooled median).
//
// THE ROUNDING IS LAB-EXACT AND LOAD-BEARING. `Math.round(multiplier × capacity)` with
// strictly-ascending +$1 guards, and a floor of $1 on the bottom rung — the rule at
// `src/harness/d16/run-d16-corpus.ts:124-129` that produced every measured number. Display
// rounding is PRESENTATIONAL and must never change the charged amount: a $25k display quantum
// collides the rungs at `MARKETING_CAPACITY_MIN` and would invalidate the measurements
// (reviewer B6). The +$1 guards are what keep the three rungs distinct at the very bottom of
// the capacity range.
//
// REGIME SPLIT. ENGAGED play gets the anchored menu; the DISENGAGED / M0A path returns the
// legacy `MARKETING_BUDGET_LEVELS` array byte-identically, which is what keeps the acceptance
// corpus unchanged. `grid.ts` KEEPS that array — it is still the menu of record for the
// legacy regime, and `Assembly.tsx` still reads it today.
//
// ESCALATION E2 (contract §0): this is a change of menu KIND (state-dependent rungs) and R6's
// text names dollar triples, so the Owner must rule that R6 extends to it. The recorded
// FALLBACK if declined is the best gate-passing fixed triple {350k, 775k, 1.525M} (39.8%
// max-optimal) — in-grant but inferior on distress access and stability. That fallback is a
// RULING OUTCOME, not code: it is deliberately not implemented here.
//
// PHASE BOUNDARY. Assembly / pre-greenlight / campaign-status consumption of this menu is
// PHASE U, and it is not optional: contract §4's blocking presentation rules require the
// capacity rendered as a dollar figure on the package AND pre-greenlight surfaces, each rung
// shown as dollars AND a multiple, and the campaign-status band + overexposure copy
// RE-DERIVED against the anchored menu (under this menu `OVEREXPOSURE_THRESHOLD` 1.3 equals
// the bottom rung's multiple, so the 'Underexposed' / 'Efficient campaign' labels are
// unreachable and the top rung sits at full overexposure by construction).

import { economyEngaged } from './employment.js'
import { forecastCenters } from './forecast.js'
import { MARKETING_BUDGET_LEVELS } from './grid.js'
import {
  appealReachSum,
  efficientMarketingCapacity,
  preMarketingAwarenessOf,
  type ReceptionInputs,
} from './reception.js'
import { TUNING } from './tuning.js'
import type { GameState } from './types.js'

/** The three rungs, ascending. Always exactly three, always strictly ascending. */
export type MarketingMenu = [number, number, number]

/**
 * The film-side inputs the menu anchors on, or `null` when no film package exists yet.
 *
 * `null` is the STUDIO-LEVEL anchor, used by the recap's affordability builders: they price a
 * hypothetical film of the cheapest concept with no cast chosen, so the film's own
 * opening-appeal term is genuinely unknown. Treating it as 0 leaves the studio's own audience
 * awareness as the sole driver — and because `preMarketingAwarenessOf` is monotone increasing
 * in the appeal term and `efficientMarketingCapacity` is monotone in awareness, that anchor is
 * the LOWEST menu any real package at this state could face. An affordability figure built on
 * it is a floor, which is the honest direction for "can I still make a film?".
 */
export type MarketingMenuInputs = ReceptionInputs | null

/**
 * THE efficient marketing capacity the menu anchors on — the same value the shipped
 * `marketingEfficiency` read-model reports as `capacity` (`ui/src/engine/adapter.ts`: it runs
 * `forecastCenters(inp, engaged, engaged)` then `computeBoxOffice(...)` and reads
 * `box.marketingCapacity`). Reproduced here through the extracted reception helpers rather
 * than a duplicated formula, so the two can never drift.
 *
 * It does NOT depend on `budget.marketing` — capacity is a function of pre-marketing awareness
 * alone — which is what makes a capacity-anchored menu resolvable without a chicken-and-egg on
 * the grid it is choosing.
 */
export function marketingCapacityFor(state: GameState, pkgInputs: MarketingMenuInputs): number {
  const engaged = economyEngaged(state)
  if (pkgInputs === null) {
    return efficientMarketingCapacity(
      preMarketingAwarenessOf(state.studio.standing.audienceAwareness, 0),
      engaged,
    )
  }
  const centers = forecastCenters(pkgInputs, engaged, engaged)
  return efficientMarketingCapacity(
    preMarketingAwarenessOf(
      pkgInputs.standing.audienceAwareness,
      appealReachSum(pkgInputs.market.segments, centers.centersOpening),
    ),
    engaged,
  )
}

/**
 * The lab-exact rung rule (`run-d16-corpus.ts:124-129`), factored out so the rounding can be
 * tested directly against a supplied capacity.
 *
 *   a = max(1,     round(m0 · capacity))
 *   b = max(a + 1, round(m1 · capacity))
 *   c = max(b + 1, round(m2 · capacity))
 *
 * The `max` guards are the MIN-capacity collision guard: at `MARKETING_CAPACITY_MIN` the three
 * products round close enough together to collide, and a collapsed menu would silently become
 * a one- or two-rung grid.
 */
export function marketingMenuFromCapacity(capacity: number): MarketingMenu {
  const [m0, m1, m2] = TUNING.MARKETING_MENU_MULTIPLIERS
  const a = Math.max(1, Math.round(m0 * capacity))
  const b = Math.max(a + 1, Math.round(m1 * capacity))
  const c = Math.max(b + 1, Math.round(m2 * capacity))
  return [a, b, c]
}

/**
 * The three marketing rungs offered at this state for this package.
 *
 * ENGAGED  → the capacity-anchored menu.
 * DISENGAGED / M0A → the legacy `MARKETING_BUDGET_LEVELS`, byte-identically.
 */
export function marketingLevelsFor(state: GameState, pkgInputs: MarketingMenuInputs): MarketingMenu {
  if (!economyEngaged(state)) {
    return [MARKETING_BUDGET_LEVELS[0], MARKETING_BUDGET_LEVELS[1], MARKETING_BUDGET_LEVELS[2]]
  }
  return marketingMenuFromCapacity(marketingCapacityFor(state, pkgInputs))
}
