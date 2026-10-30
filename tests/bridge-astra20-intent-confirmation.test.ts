// ASTRA Sprint 20 (Owner decision E, projection 70): the contract names which published one-click intents need a second
// gesture, and the Bridge derives that from the intent kind and, for the plan cancel, from the engine verb beneath it.
import { describe, expect, it } from 'vitest'
import { AVAILABLE_INTENT_KINDS, INTENT_CONFIRMATION_KINDS } from '../bridge/schema/intent-schema.ts'
import { BRIDGE_SCHEMA } from '../bridge/protocol.ts'
import { BridgeSession, createBridgeInitialState, intentConfirmation } from '../bridge/session.ts'

const REQUIRED_KINDS = ['cancellationAction', 'cancelFeaturedBooking', 'cancelTvSeason', 'settleTvObligations'] as const

describe('intent confirmation (projection 70)', () => {
  it('the contract carries the field as a closed enumeration on every option', () => {
    const option = BRIDGE_SCHEMA.$defs.StudioBridgeIntentOption as { required: string[]; properties: Record<string, { enum?: string[] }> }
    expect(option.required).toContain('confirmation')
    expect(option.properties.confirmation!.enum).toEqual([...INTENT_CONFIRMATION_KINDS])
    expect(INTENT_CONFIRMATION_KINDS).toEqual(['none', 'required'])
  })

  it('derives required for the cancellations and the obligation settlement, none for every other kind', () => {
    for (const kind of AVAILABLE_INTENT_KINDS) {
      expect(intentConfirmation(kind), kind).toBe((REQUIRED_KINDS as readonly string[]).includes(kind) ? 'required' : 'none')
    }
  })

  it('the plan cancel is a cancellation under the broader plan kind; the other plan verbs and the research cancel are not marked', () => {
    expect(intentConfirmation('physicalPlanAction', { kind: 'cancelPhysicalPlan', planId: 'p' })).toBe('required')
    expect(intentConfirmation('physicalPlanAction', { kind: 'queuePhysicalPlan' })).toBe('none')
    expect(intentConfirmation('physicalPlanAction', { kind: 'reorderPhysicalPlans' })).toBe('none')
    // Sprints 22 to 26 decision A: cancelResearch keeps every verified result and stays one gesture.
    expect(intentConfirmation('researchAction', { kind: 'cancelResearch' })).toBe('none')
    expect(intentConfirmation('advanceWeek', null)).toBe('none')
  })

  it('ASTRA Sprint 22 (decision A): the one-click loan shortcut and the release commit are confirmed by their verb; the quoted loan commit is not confirmed twice', () => {
    // The published shortcut and the release option carry the engine verb beneath them.
    expect(intentConfirmation('takeLoan', { kind: 'takeLoan', principal: 390_000 })).toBe('required')
    expect(intentConfirmation('commitPictureToRelease', { kind: 'commitPictureToRelease', productionId: 'prod-1' })).toBe('required')
    // Sprint 27: the one-gesture purchase accept is required by its verb; the quote-minted acceptance (kind alone) stays none.
    expect(intentConfirmation('acceptRightsOffer', { kind: 'acceptRightsOffer', offerId: 'rights-offer-1' })).toBe('required')
    expect(intentConfirmation('acceptRightsOffer')).toBe('none')
    // The quoted commit (quoteLoan, then the digest-bound commit) is derived from the kind alone by quotedIntentFor: the
    // quote is the review, so no second confirmation stands behind it.
    expect(intentConfirmation('takeLoan')).toBe('none')
    expect(intentConfirmation('commitPictureToRelease')).toBe('none')
  })

  it('every published option on the founding world carries the derived value; a quote-minted commit is none', () => {
    const session = new BridgeSession(createBridgeInitialState('astra20-confirmation'), 'astra20')
    const intents = session.snapshot().availableIntents
    expect(intents.length).toBeGreaterThan(0)
    for (const intent of intents) {
      expect(INTENT_CONFIRMATION_KINDS).toContain(intent.confirmation)
      if ((REQUIRED_KINDS as readonly string[]).includes(intent.kind)) expect(intent.confirmation, intent.kind).toBe('required')
      if (intent.kind === 'physicalPlanAction' && intent.label.startsWith('Cancel plan:')) expect(intent.confirmation).toBe('required')
      // Sprint 22: the loan shortcut and the release commit are required by their verb (neither exists on the founding world).
      if (intent.kind === 'takeLoan' || intent.kind === 'commitPictureToRelease') expect(intent.confirmation, intent.kind).toBe('required')
      // Sprint 27: a listed acceptRightsOffer option is always the one-gesture purchase or grant (the quoted sale is never listed).
      if (intent.kind === 'acceptRightsOffer') expect(intent.confirmation, intent.kind).toBe('required')
      else if (intent.kind !== 'physicalPlanAction' && !(REQUIRED_KINDS as readonly string[]).includes(intent.kind)) expect(intent.confirmation, intent.kind).toBe('none')
    }
  })
})
