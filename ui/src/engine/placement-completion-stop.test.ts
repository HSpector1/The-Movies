// ── V12 regression: a committed build ANYWHERE stops the sim on the week it completes ──
//
// PM playtest 2026-08-17: place an Annex on a non-legacy parcel (`stage-south` at Week 1,
// completing Week 14), press "Sim to next event" — the sim ran clean through Week 14 and
// stopped only at a Week-40 contract-renewal window. Under accepted V11 behavior
// `constructionCompleted` was an interrupting stop reason.
//
// Cause: `constructionCompletionBetween` detected completion through the retained
// `studioConstructionView`, which projects ONLY the Annex-class placement standing on the
// legacy `expansion` parcel. Under Placement Core V12 a build on any of the other seven
// buildable parcels left that view at `vacant` on both sides of the tick, so the detector
// returned null forever: no `advanceWeek` receipt, and no `advanceToNextEvent` stop.
//
// These tests pin the repaired behavior on BOTH parcel classes, so the legacy path can never
// be the only one that works again.

import { describe, expect, it } from 'vitest'
import {
  advanceToNextEvent,
  advanceWeek,
  constructionCompletionsBetween,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  placeFacilityAction,
  placementQuote,
  signContractAction,
  startDevelopmentCastingAnnexAction,
  studioDevelopment,
  studioPlacement,
} from './adapter.ts'
import type { CreativeRole, GameState, PlacementRequest } from './adapter.ts'

const COUNTS: Record<CreativeRole, number> = { actor: 3, director: 1, writer: 2, craft: 1 }

const LEGACY_PARCEL_ID = 'expansion'

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

/**
 * The first LEGAL Annex placement on a parcel that is NOT the legacy expansion pad — chosen
 * from the engine's own parcel map and its own quote, never a hand-written coordinate.
 */
function firstNonLegacyAnnexRequest(state: GameState): PlacementRequest {
  const view = studioPlacement(state)
  const annex = view.catalog[0]
  if (annex === undefined) throw new Error('the V12 catalog is empty')
  for (const parcel of view.parcels) {
    if (parcel.id === LEGACY_PARCEL_ID) continue
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        const request = { blueprintId: annex.blueprintId, origin: { gx, gy } }
        if (placementQuote(state, request).ok) return request
      }
    }
  }
  throw new Error('no legal non-legacy Annex placement exists on the V12 lot')
}

function place(state: GameState, request: PlacementRequest): GameState {
  const committed = placeFacilityAction(state, request)
  if (!committed.ok) throw new Error(committed.error)
  return committed.next
}

describe('V12 committed builds stop the sim on their completion week', () => {
  it('a NON-LEGACY parcel placement stops advanceToNextEvent with constructionCompleted', () => {
    const state = managedStudio('v12-completion-stop-non-legacy')
    const request = firstNonLegacyAnnexRequest(state)
    const quote = placementQuote(state, request)
    expect(quote.ok).toBe(true)
    expect(quote.parcelId).not.toBe(LEGACY_PARCEL_ID)
    const committed = place(state, request)

    // The retained legacy read model still reports `vacant` here — which is exactly why the
    // old detector went blind. The stop must NOT depend on it.
    expect(studioDevelopment(committed).status).toBe('vacant')
    const placed = studioPlacement(committed).placements
    expect(placed).toHaveLength(1)
    const completesWeek = placed[0]!.completesWeek
    expect(completesWeek).toBeGreaterThan(committed.market.tick)

    const result = advanceToNextEvent(committed)
    expect(result.stopReason).toBe('constructionCompleted')
    expect(result.toWeek).toBe(completesWeek)
    expect(result.constructionCompletion).not.toBeNull()
    expect(result.constructionCompletion?.completedWeek).toBe(completesWeek)
    expect(result.constructionCompletion?.facilityId).toBe(placed[0]!.facilityId)
    // `projectId` is the ledger correlation id, which lives on the placement record itself.
    expect(result.constructionCompletion?.projectId).toBe(
      result.next.placement.facilities[0]!.projectId,
    )
    expect(result.stopMessage).toBe(
      `Stopped at Week ${String(completesWeek)}: committed studio construction reached its completion boundary.`,
    )
    expect(studioPlacement(result.next).placements[0]!.status).toBe('operational')
  })

  it('a NON-LEGACY parcel placement returns a truthful advanceWeek completion receipt', () => {
    let state = managedStudio('v12-completion-receipt-non-legacy')
    state = place(state, firstNonLegacyAnnexRequest(state))
    const placed = studioPlacement(state).placements[0]!

    let sawCompletion = 0
    while (state.market.tick < placed.completesWeek) {
      const advanced = advanceWeek(state)
      if (advanced.constructionCompletion !== null) {
        sawCompletion++
        expect(advanced.next.market.tick).toBe(placed.completesWeek)
        expect(advanced.constructionCompletion.completedWeek).toBe(placed.completesWeek)
        expect(advanced.constructionCompletion.name).toBe('Development & Casting Annex')
        expect(advanced.constructionCompletion.message).toBe(
          `Development & Casting Annex is Operational in Week ${String(placed.completesWeek)}. One shared Development & Casting slot is now available.`,
        )
      }
      state = advanced.next
    }
    // Exactly once, on the arriving week — never before, never repeated.
    expect(sawCompletion).toBe(1)
    expect(constructionCompletionsBetween(state, state)).toEqual([])
  })

  it('the LEGACY expansion parcel keeps its exact accepted V11 receipt and stop', () => {
    const state = managedStudio('v12-completion-stop-legacy')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    const committed = started.next
    expect(studioDevelopment(committed).status).toBe('building')
    const legacy = studioPlacement(committed).placements[0]!
    expect(legacy.parcelId).toBe(LEGACY_PARCEL_ID)

    const result = advanceToNextEvent(committed)
    expect(result.stopReason).toBe('constructionCompleted')
    expect(result.toWeek).toBe(legacy.completesWeek)
    expect(result.constructionCompletion?.name).toBe('Development & Casting Annex')
    expect(result.constructionCompletion?.message).toBe(
      `Development & Casting Annex is Operational in Week ${String(legacy.completesWeek)}. One shared Development & Casting slot is now available.`,
    )
    // The V11 identities are preserved verbatim on the legacy parcel.
    expect(result.constructionCompletion?.facilityId).toBe('facility-development-casting-annex')
    expect(result.constructionCompletion?.projectId).toBe(
      'construction-development-casting-annex',
    )
  })

  it('two placements completing on one advance report the first and state the remainder', () => {
    let state = managedStudio('v12-completion-two-on-one-advance')
    const first = firstNonLegacyAnnexRequest(state)
    state = place(state, first)
    const second = firstNonLegacyAnnexRequest(state)
    expect(second.origin).not.toEqual(first.origin)
    state = place(state, second)

    const placements = studioPlacement(state).placements
    expect(placements).toHaveLength(2)
    // Both committed on the same week, so both complete on the same advance.
    expect(placements[0]!.completesWeek).toBe(placements[1]!.completesWeek)

    let receipt: string | null = null
    const completesWeek = placements[0]!.completesWeek
    while (state.market.tick < completesWeek) {
      const advanced = advanceWeek(state)
      if (advanced.constructionCompletion !== null) {
        receipt = advanced.constructionCompletion.message
        expect(advanced.constructionCompletion.facilityId).toBe(placements[0]!.facilityId)
        expect(constructionCompletionsBetween(state, advanced.next)).toHaveLength(2)
      }
      state = advanced.next
    }
    expect(receipt).toBe(
      `Development & Casting Annex is Operational in Week ${String(completesWeek)}. One shared Development & Casting slot is now available. One further committed build also completed on this advance.`,
    )
  })

  it('reports nothing on a tick with no completion, and nothing after one has completed', () => {
    let state = managedStudio('v12-completion-quiet-ticks')
    state = place(state, firstNonLegacyAnnexRequest(state))
    const completesWeek = studioPlacement(state).placements[0]!.completesWeek

    const firstAdvance = advanceWeek(state)
    expect(firstAdvance.constructionCompletion).toBeNull()

    while (state.market.tick < completesWeek) state = advanceWeek(state).next
    expect(studioPlacement(state).placements[0]!.status).toBe('operational')
    for (let i = 0; i < 3; i++) {
      const advanced = advanceWeek(state)
      expect(advanced.constructionCompletion).toBeNull()
      state = advanced.next
    }
  })
})
