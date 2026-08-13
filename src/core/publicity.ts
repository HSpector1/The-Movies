// D-17B §2 — authoritative read model for the paid publicity action.
// Pure, deterministic, no RNG. React renders these values; it never reimplements lift,
// cooldown, affordability, or price-per-point arithmetic.

import { canAfford, economyEngaged } from './employment.js'
import { clamp } from './math.js'
import { TUNING } from './tuning.js'
import type { GameState, PublicityTier } from './types.js'

export const PUBLICITY_TIER_ORDER: readonly PublicityTier[] = ['whisper', 'push', 'blitz'] as const

export type PublicityOffer = {
  tier: PublicityTier
  cost: number
  maxLift: number
  expectedLift: number
  pricePerPoint: number | null
  cooldownWeeks: number
  available: boolean
  availableWeek: number | null
  reason: string | null
}

/** Exact production lift at the current stock. */
export function publicityLiftAt(tier: PublicityTier, awareness: number): number {
  const spec = TUNING.PUBLICITY_TIERS[tier]
  return (
    spec.maxLift *
    Math.pow(1 - clamp(awareness / 100, 0, 1), TUNING.PUBLICITY_SHAPE_EXP)
  )
}

/** Exact current offer/availability for one tier. */
export function publicityOffer(state: GameState, tier: PublicityTier): PublicityOffer {
  const spec = TUNING.PUBLICITY_TIERS[tier]
  const week = state.market.tick
  const expectedLift = publicityLiftAt(tier, state.studio.standing.audienceAwareness)
  const base = {
    tier,
    cost: spec.cost,
    maxLift: spec.maxLift,
    expectedLift,
    pricePerPoint: expectedLift > 0 ? spec.cost / expectedLift : null,
    cooldownWeeks: spec.cooldownWeeks,
  }

  if (!economyEngaged(state)) {
    return {
      ...base,
      available: false,
      availableWeek: null,
      reason: 'Available after the studio economy is founded.',
    }
  }
  if (state.founding !== null) {
    return {
      ...base,
      available: false,
      availableWeek: null,
      reason: 'Finish founding the studio before running publicity.',
    }
  }

  const globalReady =
    state.publicity.lastUsedWeek === null
      ? week
      : state.publicity.lastUsedWeek + TUNING.PUBLICITY_GLOBAL_COOLDOWN_WEEKS
  const tierLast = state.publicity.byTier[tier]
  const tierReady = tierLast === null ? week : tierLast + spec.cooldownWeeks
  const availableWeek = Math.max(week, globalReady, tierReady)
  if (availableWeek > week) {
    return {
      ...base,
      available: false,
      availableWeek,
      reason: `Cooldown: available again in Week ${String(availableWeek)}.`,
    }
  }

  const affordability = canAfford(state, spec.cost)
  if (!affordability.ok) {
    return {
      ...base,
      available: false,
      availableWeek: week,
      reason: affordability.reason,
    }
  }
  return { ...base, available: true, availableWeek: week, reason: null }
}

export function publicityOffers(state: GameState): PublicityOffer[] {
  return PUBLICITY_TIER_ORDER.map((tier) => publicityOffer(state, tier))
}
