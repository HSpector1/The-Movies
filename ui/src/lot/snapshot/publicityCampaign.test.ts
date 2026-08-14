import { describe, expect, it } from 'vitest'
import { generateWorld } from '../../../../src/core/index.ts'
import {
  publicityDecision,
  studioLotSnapshot,
} from '../../engine/adapter.ts'
import type {
  BuildingState,
  LotPublicityOffer,
  LotPublicityTier,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import {
  publicityCampaignContext,
  type LotPublicityResult,
} from './publicityCampaign.ts'

const OFFER_FIELDS = [
  'tier',
  'cost',
  'maxLift',
  'expectedLift',
  'pricePerPoint',
  'cooldownWeeks',
  'globalCooldownWeeks',
  'available',
  'availableWeek',
  'reason',
] as const

const TIER_FACTS: Record<
  LotPublicityTier,
  Pick<LotPublicityOffer, 'cost' | 'maxLift' | 'cooldownWeeks'>
> = {
  whisper: { cost: 1_200_000, maxLift: 18, cooldownWeeks: 8 },
  push: { cost: 3_600_000, maxLift: 30, cooldownWeeks: 12 },
  blitz: { cost: 8_000_000, maxLift: 42, cooldownWeeks: 20 },
}

function offer(
  tier: LotPublicityTier,
  overrides: Partial<LotPublicityOffer> = {},
): LotPublicityOffer {
  const facts = TIER_FACTS[tier]
  return {
    tier,
    cost: facts.cost,
    maxLift: facts.maxLift,
    expectedLift: facts.maxLift / 2,
    pricePerPoint: facts.cost / (facts.maxLift / 2),
    cooldownWeeks: facts.cooldownWeeks,
    globalCooldownWeeks: 6,
    available: true,
    availableWeek: 30,
    reason: null,
    ...overrides,
  }
}

function snapshot(
  publicityOffers: LotPublicityOffer[] = [
    offer('whisper'),
    offer('push'),
    offer('blitz'),
  ],
  buildings: BuildingState[] = [{ id: 'admin', available: true }],
): StudioLotSnapshot {
  return {
    studioName: 'PROJECT: STUDIO',
    week: 30,
    cash: 20_000_000,
    cashBand: 'flush',
    standing: 'established',
    standingValues: { awareness: 50, prestige: 50, confidence: 50 },
    publicityOffers,
    annexWork: null,
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings,
    selectedBuildingId: null,
    sceneSeed: 'publicity-campaign-selector',
    operationsMode: 'legacy',
    stageAssignmentAuthority: 'presentation',
    productionOperations: [],
  }
}

function withWhisper(overrides: Partial<LotPublicityOffer>): StudioLotSnapshot {
  return snapshot([
    offer('whisper', overrides),
    offer('push'),
    offer('blitz'),
  ])
}

describe('studioLotSnapshot publicity leaf projection', () => {
  it('copies every exact public offer field from the core authority without mutating state', () => {
    const state = generateWorld('world-first-publicity-projection')
    const before = JSON.stringify(state)
    const authoritative = publicityDecision(state)

    const projected = studioLotSnapshot(state).publicityOffers

    expect(projected).toEqual(authoritative)
    expect(projected.map((candidate) => Object.keys(candidate))).toEqual(
      authoritative.map(() => [...OFFER_FIELDS]),
    )
    expect(JSON.stringify(state)).toBe(before)
  })

  it('preserves the legal zero-lift/null-price record exactly', () => {
    const generated = generateWorld('world-first-publicity-zero-lift')
    const state = {
      ...generated,
      studio: {
        ...generated.studio,
        standing: {
          ...generated.studio.standing,
          audienceAwareness: 100,
        },
      },
    }

    const authoritative = publicityDecision(state)
    const projected = studioLotSnapshot(state).publicityOffers

    expect(authoritative.every((candidate) => candidate.expectedLift === 0)).toBe(true)
    expect(authoritative.every((candidate) => candidate.pricePerPoint === null)).toBe(true)
    expect(projected).toEqual(authoritative)
  })
})

describe('publicityCampaignContext exact selector', () => {
  it('canonicalizes by tier identity, returns the exact records, and counts availability', () => {
    const whisper = offer('whisper')
    const push = offer('push', {
      available: false,
      availableWeek: 36,
      reason: 'Cooldown: available again in Week 36.',
    })
    const blitz = offer('blitz')

    const selected = publicityCampaignContext(snapshot([blitz, whisper, push]))

    expect(selected?.offers.map((candidate) => candidate.tier)).toEqual([
      'whisper',
      'push',
      'blitz',
    ])
    expect(selected?.offers[0]).toBe(whisper)
    expect(selected?.offers[1]).toBe(push)
    expect(selected?.offers[2]).toBe(blitz)
    expect(selected?.availableCount).toBe(2)
  })

  it('does not recompute a valid finite price or reject the legal zero-lift/null-price offer', () => {
    const arbitraryPrice = offer('whisper', {
      expectedLift: 9,
      pricePerPoint: 7.25,
    })
    const zeroLift = offer('push', {
      expectedLift: 0,
      pricePerPoint: null,
    })

    const selected = publicityCampaignContext(
      snapshot([zeroLift, offer('blitz'), arbitraryPrice]),
    )

    expect(selected?.offers[0]).toBe(arbitraryPrice)
    expect(selected?.offers[1]).toBe(zeroLift)
  })

  it('accepts both null and current/future weeks for truthful unavailable offers', () => {
    const selected = publicityCampaignContext(
      snapshot([
        offer('whisper', {
          available: false,
          availableWeek: null,
          reason: 'Available after the studio economy is founded.',
        }),
        offer('push', {
          available: false,
          availableWeek: 30,
          reason: 'Insufficient cash.',
        }),
        offer('blitz', {
          available: false,
          availableWeek: 36,
          reason: 'Cooldown: available again in Week 36.',
        }),
      ]),
    )

    expect(selected?.availableCount).toBe(0)
  })

  it('requires exactly one Administration building fact', () => {
    const offers = [offer('whisper'), offer('push'), offer('blitz')]

    expect(publicityCampaignContext(snapshot(offers, []))).toBeNull()
    expect(
      publicityCampaignContext(
        snapshot(offers, [
          { id: 'admin', available: true },
          { id: 'admin', available: false },
        ]),
      ),
    ).toBeNull()
    expect(
      publicityCampaignContext(
        snapshot(offers, [
          { id: 'gate', available: true },
          { id: 'admin', available: true },
        ]),
      ),
    ).not.toBeNull()
  })

  it('rejects missing, duplicate, unknown, or excess tiers without using array position', () => {
    const whisper = offer('whisper')
    const push = offer('push')
    const blitz = offer('blitz')
    const unknown = {
      ...offer('blitz'),
      tier: 'premiere',
    } as unknown as LotPublicityOffer

    expect(publicityCampaignContext(snapshot([whisper, push]))).toBeNull()
    expect(publicityCampaignContext(snapshot([whisper, push, offer('push')]))).toBeNull()
    expect(publicityCampaignContext(snapshot([whisper, push, unknown]))).toBeNull()
    expect(publicityCampaignContext(snapshot([whisper, push, blitz, offer('blitz')]))).toBeNull()
  })

  it.each([
    ['zero cost', { cost: 0 }],
    ['fractional cost', { cost: 1_200_000.5 }],
    ['non-finite cost', { cost: Number.POSITIVE_INFINITY }],
    ['zero maximum lift', { maxLift: 0 }],
    ['non-finite maximum lift', { maxLift: Number.NaN }],
    ['negative expected lift', { expectedLift: -1 }],
    ['lift above maximum', { expectedLift: 19 }],
    ['non-finite expected lift', { expectedLift: Number.NaN }],
    ['null price for positive lift', { pricePerPoint: null }],
    ['zero price for positive lift', { pricePerPoint: 0 }],
    ['positive price for zero lift', { expectedLift: 0, pricePerPoint: 1 }],
    ['negative tier cooldown', { cooldownWeeks: -1 }],
    ['fractional tier cooldown', { cooldownWeeks: 8.5 }],
    ['negative global cooldown', { globalCooldownWeeks: -1 }],
    ['fractional global cooldown', { globalCooldownWeeks: 6.5 }],
  ] satisfies Array<[string, Partial<LotPublicityOffer>]>) (
    'fails closed for %s',
    (_name, overrides) => {
      expect(publicityCampaignContext(withWhisper(overrides))).toBeNull()
    },
  )

  it('requires one identical shared global cooldown across all offers', () => {
    expect(
      publicityCampaignContext(withWhisper({ globalCooldownWeeks: 7 })),
    ).toBeNull()
  })

  it.each([
    ['available with a reason', { reason: 'Not really available.' }],
    ['available with a null week', { availableWeek: null }],
    ['available with a future week', { availableWeek: 31 }],
    [
      'unavailable without a reason',
      { available: false, availableWeek: 31, reason: null },
    ],
    [
      'unavailable with an empty reason',
      { available: false, availableWeek: 31, reason: '' },
    ],
    [
      'unavailable with a past week',
      { available: false, availableWeek: 29, reason: 'Cooldown.' },
    ],
    [
      'unavailable with a fractional week',
      { available: false, availableWeek: 30.5, reason: 'Cooldown.' },
    ],
  ] satisfies Array<[string, Partial<LotPublicityOffer>]>) (
    'fails closed for %s',
    (_name, overrides) => {
      expect(publicityCampaignContext(withWhisper(overrides))).toBeNull()
    },
  )

  it('exports the bounded App-to-Lot callback result without runtime authority', () => {
    const accepted = {
      ok: true,
      tier: 'push',
      acceptedWeek: 30,
    } satisfies LotPublicityResult
    const rejected = {
      ok: false,
      error: 'Cooldown.',
    } satisfies LotPublicityResult

    expect(accepted).toEqual({ ok: true, tier: 'push', acceptedWeek: 30 })
    expect(rejected).toEqual({ ok: false, error: 'Cooldown.' })
  })
})
