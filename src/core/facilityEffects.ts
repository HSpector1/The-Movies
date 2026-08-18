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

import {
  FREELANCER_FEE_CRAFT_ANNEX_DISCOUNT,
  SCRIPT_DEVELOPMENT_OFFICE_TIER_2_EST_UPLIFT,
  SCRIPT_DEVELOPMENT_OFFICE_TIER_3_EST_UPLIFT,
} from './tuning.js'
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

// ── the Development Office tiers (C1-M4) ─────────────────────────────────────

/** The catalog ids of the tiered Development Offices, lowest tier first. */
export const DEVELOPMENT_OFFICE_TIER_BLUEPRINT_IDS = [
  'development-office-2',
  'development-office-3',
] as const

/**
 * The EST points an operational Development Office adds to a screenplay's first
 * draft, or 0 when the studio has none.
 *
 * HIGHEST TIER WINS, AND NOTHING STACKS. Two Development Office IIs are one
 * Development Office II as far as a script is concerned, and a studio holding
 * both tiers gets tier III's uplift rather than the sum. A tier is a standard of
 * development the studio works to, not a pile of desks — doubling the building
 * does not double the standard, and a stacking version would make the right play
 * "build as many as the lot holds", which is not a decision.
 *
 * Both tiers therefore carry `maxInstances: 1`: a second copy is provably worth
 * nothing, and refusing it up front is kinder than letting a player spend
 * $1.2M and a construction slot discovering that.
 */
export function developmentOfficeEstUplift(state: GameState): number {
  if (hasOperationalBlueprint(state, 'development-office-3')) {
    return SCRIPT_DEVELOPMENT_OFFICE_TIER_3_EST_UPLIFT
  }
  if (hasOperationalBlueprint(state, 'development-office-2')) {
    return SCRIPT_DEVELOPMENT_OFFICE_TIER_2_EST_UPLIFT
  }
  return 0
}

/**
 * The studio's baseline script office — the founding Development & Casting
 * department every managed studio has before it builds anything.
 */
export const BASELINE_DEVELOPMENT_OFFICE_TIER = 'development-casting-annex'

/**
 * WHICH office tier is standing right now, by blueprint id (C2a-M3).
 *
 * The same "highest tier wins, nothing stacks" ladder `developmentOfficeEstUplift`
 * reads, returning the TIER rather than its EST points, because one tier has two
 * consequences and they are not the same number: it raises what a screenplay can
 * become (the uplift, unchanged since C1-M4) and it makes an original screenplay
 * RICHER and therefore slower to write (`00E`.9, charter §3.5). Recorded on the
 * blueprint as `officeTierAtMint`, which is an AUDIT TRAIL of what the studio
 * worked to that week — never a strength term.
 */
export function developmentOfficeTier(state: GameState): string {
  if (hasOperationalBlueprint(state, 'development-office-3')) return 'development-office-3'
  if (hasOperationalBlueprint(state, 'development-office-2')) return 'development-office-2'
  return BASELINE_DEVELOPMENT_OFFICE_TIER
}

/**
 * The OPERATIONAL blueprint that makes building this one add nothing — the
 * highest standing tier strictly above it in its own effect family — or null.
 *
 * C1-M8. This is the honest half of "highest tier wins, and nothing stacks",
 * published so a catalog can say it. With a Development Office III standing, the
 * Office II row still promised "+4 points of estimated strength", and building it
 * would have added exactly 0: true sentence, false promise, $600,000.
 *
 * It is derived from THE EFFECTS AUTHORITY — the tier list this module already
 * uses to decide the uplift, read in the same order — rather than from any
 * pattern in a name or an id. A family whose tiers change here changes here only.
 * A blueprint in no tiered family, or one with nothing above it standing, is
 * never superseded; the top tier never is.
 */
export function supersedingOperationalBlueprintId(
  state: GameState,
  blueprintId: string,
): string | null {
  const tiers: readonly string[] = DEVELOPMENT_OFFICE_TIER_BLUEPRINT_IDS
  const tier = tiers.indexOf(blueprintId)
  if (tier < 0) return null
  // Highest first: if two tiers above it stand, the one that actually wins is the
  // one the uplift accessor would read.
  for (let higher = tiers.length - 1; higher > tier; higher--) {
    const candidate = tiers[higher]!
    if (hasOperationalBlueprint(state, candidate)) return candidate
  }
  return null
}

// ── the Craft Services Annex (C1-M4) ─────────────────────────────────────────

/**
 * The multiplier applied to a one-film freelancer fee: 1 with no Craft Services
 * Annex, and exactly `1 - FREELANCER_FEE_CRAFT_ANNEX_DISCOUNT` with one.
 *
 * Multiplying by exactly 1.0 is a bit-exact IEEE no-op, which is what makes the
 * unbuilt path byte-identical rather than merely equal.
 */
export function freelancerFeeMultiplier(state: GameState): number {
  return nonStackingDiscountMultiplier(
    hasOperationalBlueprint(state, 'craft-annex'),
    FREELANCER_FEE_CRAFT_ANNEX_DISCOUNT,
  )
}
