// ── Facility Effects (C1-M4) — what a building actually DOES ─────────────────
//
// LAW: every mechanical effect a facility has is read from THIS module, and this
// module reads it from OPERATIONAL PLACEMENTS at evaluation time. Nothing caches
// an effect, nothing persists one, and no other module counts facilities for
// itself.
//
// WHY IT IS ONE MODULE: the catalog is about to hold seven entries whose effects
// land in six different subsystems — screenplay quality, shared capacity, scenery
// friction, freelancer fees, publicity, and construction itself. If each
// subsystem counted its own facilities, "is this building working yet?" would
// have six answers that drift apart the first time completion or demolition
// semantics change. Here it has one.
//
// THREE RULES EVERY EFFECT OBEYS:
//   1. OPERATIONAL ONLY. A site under construction changes nothing — it occupies
//      land and contributes nothing, exactly as capacity has behaved since V11.
//      This is the same `status === 'operational'` gate the facility requirement
//      kind uses, deliberately, so "unlocks the next tier" and "actually works"
//      can never disagree.
//   2. PURE AND DETERMINISTIC. No RNG, no wall clock, no mutation, and ZERO bytes
//      of `state.rngState`. An effect is a function of state, so a reload or a
//      replay reproduces it exactly.
//   3. NEUTRAL WHEN ABSENT. Every accessor returns the value that reproduces
//      today's behaviour byte-for-byte when the studio owns none of the relevant
//      building. That is what lets the whole slate ship without moving a single
//      existing number.

import type { GameState } from './types.js'

/**
 * How many OPERATIONAL placements of a blueprint the studio has.
 *
 * Deliberately different from `blueprintInstanceCount`, which counts every status
 * because it answers "may the studio build another?". This answers "how many are
 * WORKING?", and a construction site is not working.
 */
export function operationalBlueprintCount(state: GameState, blueprintId: string): number {
  let count = 0
  for (const placed of state.placement.facilities) {
    if (placed.blueprintId === blueprintId && placed.status === 'operational') count++
  }
  return count
}

/** Whether at least one operational placement of a blueprint stands. */
export function hasOperationalBlueprint(state: GameState, blueprintId: string): boolean {
  return operationalBlueprintCount(state, blueprintId) > 0
}

/**
 * The multiplier a percentage discount becomes, given how many of the discounting
 * building the studio has. Owning two does NOT double a discount: every effect in
 * this campaign that reduces a cost is capped at one building's worth.
 *
 * That is a deliberate product decision rather than an oversight. A stacking
 * discount turns a building into an arbitrage — build N of them until the cost is
 * zero — and the catalog would then need instance limits for economic safety
 * rather than for design reasons. Non-stacking keeps the second copy honestly
 * useless, which the catalog says out loud in its effect summary.
 */
export function nonStackingDiscountMultiplier(has: boolean, fraction: number): number {
  return has ? 1 - fraction : 1
}
