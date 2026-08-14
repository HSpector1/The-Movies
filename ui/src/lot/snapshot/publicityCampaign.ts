import type {
  LotPublicityOffer,
  LotPublicityTier,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'

export type { LotPublicityOffer, LotPublicityTier } from './StudioLotSnapshot.ts'

/** The complete callback result the Lot may receive from the App action owner. */
export type LotPublicityResult =
  | { ok: true; tier: LotPublicityTier; acceptedWeek: number }
  | { ok: false; error: string }

type TierOffer<TTier extends LotPublicityTier> = LotPublicityOffer & {
  tier: TTier
}

/** Exact current offers in canonical identity order. */
export type PublicityCampaignContext = {
  offers: readonly [
    TierOffer<'whisper'>,
    TierOffer<'push'>,
    TierOffer<'blitz'>,
  ]
  availableCount: number
}

const PUBLICITY_CAMPAIGN_TIER_ORDER = ['whisper', 'push', 'blitz'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTier(value: unknown): value is LotPublicityTier {
  return (
    value === 'whisper' ||
    value === 'push' ||
    value === 'blitz'
  )
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isPositiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function structurallyValidOffer(
  value: unknown,
  snapshotWeek: number,
): value is LotPublicityOffer {
  if (!isRecord(value) || !isTier(value.tier)) return false
  if (!isPositiveFinite(value.cost) || !Number.isInteger(value.cost)) return false
  if (!isPositiveFinite(value.maxLift)) return false
  if (
    typeof value.expectedLift !== 'number' ||
    !Number.isFinite(value.expectedLift) ||
    value.expectedLift < 0 ||
    value.expectedLift > value.maxLift
  ) {
    return false
  }

  if (value.expectedLift === 0) {
    if (value.pricePerPoint !== null) return false
  } else if (!isPositiveFinite(value.pricePerPoint)) {
    return false
  }

  if (
    !isNonNegativeInteger(value.cooldownWeeks) ||
    !isNonNegativeInteger(value.globalCooldownWeeks) ||
    typeof value.available !== 'boolean'
  ) {
    return false
  }

  if (value.available) {
    return value.reason === null && value.availableWeek === snapshotWeek
  }

  return (
    typeof value.reason === 'string' &&
    value.reason.length > 0 &&
    (value.availableWeek === null ||
      (isNonNegativeInteger(value.availableWeek) && value.availableWeek >= snapshotWeek))
  )
}

/**
 * Select one truthful publicity campaign context from a Lot snapshot.
 *
 * This is deliberately fail-closed. It only validates and orders the exact
 * projected records; it never supplies a default, recomputes an offer, or calls
 * an Engine action.
 */
export function publicityCampaignContext(
  snapshot: StudioLotSnapshot,
): PublicityCampaignContext | null {
  if (!Number.isInteger(snapshot.week) || snapshot.week < 0) return null
  if (!Array.isArray(snapshot.buildings)) return null
  if (
    snapshot.buildings.filter(
      (building) => isRecord(building) && building.id === 'admin',
    ).length !== 1
  ) {
    return null
  }

  if (!Array.isArray(snapshot.publicityOffers) || snapshot.publicityOffers.length !== 3) {
    return null
  }

  const offersByTier = new Map<LotPublicityTier, LotPublicityOffer>()
  for (const offer of snapshot.publicityOffers as unknown[]) {
    if (!structurallyValidOffer(offer, snapshot.week) || offersByTier.has(offer.tier)) {
      return null
    }
    offersByTier.set(offer.tier, offer)
  }

  if (
    offersByTier.size !== PUBLICITY_CAMPAIGN_TIER_ORDER.length ||
    new Set([...offersByTier.values()].map((offer) => offer.globalCooldownWeeks)).size !== 1
  ) {
    return null
  }

  const whisper = offersByTier.get('whisper') as TierOffer<'whisper'> | undefined
  const push = offersByTier.get('push') as TierOffer<'push'> | undefined
  const blitz = offersByTier.get('blitz') as TierOffer<'blitz'> | undefined
  if (whisper === undefined || push === undefined || blitz === undefined) return null

  const offers = [whisper, push, blitz] as const
  return {
    offers,
    availableCount: offers.filter((offer) => offer.available).length,
  }
}
