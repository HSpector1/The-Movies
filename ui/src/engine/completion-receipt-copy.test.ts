// ── C1-M6 — what a completion receipt says when the building adds no slot ────
//
// PM playtest at the M5 ruling, logged as a blemish rather than a defect: the completion
// toast appended the slot-delta sentence to EVERY facility, so Development Office II —
// which adds four points of estimated strength and exactly zero shared slots — announced
// "0 shared Development & Casting slots are now available." True, and noise.
//
// M4 is what made this reachable: three of the five catalog blueprints (both Development
// Office tiers and the Craft Services Annex) are effect-only, capacity 0. A zero delta is
// a permanent, ordinary kind of building now, not an impossible case, so the receipt says
// nothing about slots rather than saying nothing happened to them.
//
// The capacity-1 and capacity-2 sentences are accepted copy pinned in three other suites
// (placement-completion-stop, studio-development-ui, LotNextEventRail). They are pinned
// again HERE against the same code path, so a future edit to the zero branch cannot
// quietly reshape the branches those suites own.

import { describe, expect, it } from 'vitest'
import {
  advanceWeek,
  constructionCompletionsBetween,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  placeFacilityAction,
  placementQuote,
  signContractAction,
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

/** The first LEGAL origin for one blueprint, taken from the engine's own quote. */
function legalRequest(state: GameState, blueprintId: string): PlacementRequest {
  const view = studioPlacement(state)
  for (const parcel of view.parcels) {
    if (parcel.id === LEGACY_PARCEL_ID) continue
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        const request = { blueprintId, origin: { gx, gy } }
        if (placementQuote(state, request).ok) return request
      }
    }
  }
  throw new Error(`no legal site for ${blueprintId}`)
}

function place(state: GameState, request: PlacementRequest): GameState {
  const committed = placeFacilityAction(state, request)
  if (!committed.ok) throw new Error(committed.error)
  return committed.next
}

/** Advance until the placements standing now have all completed; collect every receipt. */
function receiptsThroughCompletion(start: GameState): { state: GameState; receipts: string[] } {
  let state = start
  const last = Math.max(...studioPlacement(state).placements.map((p) => p.completesWeek))
  const receipts: string[] = []
  while (state.market.tick < last) {
    const advanced = advanceWeek(state)
    if (advanced.constructionCompletion !== null) {
      receipts.push(advanced.constructionCompletion.message)
    }
    state = advanced.next
  }
  return { state, receipts }
}

describe('C1-M6 completion receipts: a facility that adds no slot says nothing about slots', () => {
  it('a CAPACITY-0 facility ends the message at the Operational sentence', () => {
    let state = managedStudio('c1-m6-receipt-zero-capacity')
    state = place(state, legalRequest(state, 'development-office-2'))
    const placed = studioPlacement(state).placements[0]!
    expect(placed.blueprintId).toBe('development-office-2')

    const { receipts } = receiptsThroughCompletion(state)
    expect(receipts).toEqual([
      `Development Office II is Operational in Week ${String(placed.completesWeek)}.`,
    ])
    const message = receipts[0]!
    // No slot clause at all — not the zero one, not any other.
    expect(message).not.toContain('slot')
    expect(message).not.toContain('0 shared')
    // And no trailing space where the removed sentence used to be joined on.
    expect(message).toBe(message.trimEnd())
    expect(message.endsWith('.')).toBe(true)
  })

  it('a CAPACITY-1 facility keeps its accepted sentence, unchanged', () => {
    let state = managedStudio('c1-m6-receipt-one-capacity')
    state = place(state, legalRequest(state, 'development-casting-annex'))
    const placed = studioPlacement(state).placements[0]!
    expect(placed.blueprintId).toBe('development-casting-annex')

    const { receipts } = receiptsThroughCompletion(state)
    expect(receipts).toEqual([
      `Development & Casting Annex is Operational in Week ${String(placed.completesWeek)}. One shared Development & Casting slot is now available.`,
    ])
  })

  it('the branch is chosen by the blueprint, not by the facility that happens to be first', () => {
    // Two buildings, one of each kind, completing on their own weeks: the zero-capacity one
    // is silent about slots and the capacity-1 one is not, in the same run.
    let state = managedStudio('c1-m6-receipt-both-kinds')
    state = place(state, legalRequest(state, 'development-office-2'))
    state = place(state, legalRequest(state, 'development-casting-annex'))
    const placements = studioPlacement(state).placements
    expect(placements).toHaveLength(2)
    expect(placements.map((p) => p.blueprintId)).toEqual([
      'development-office-2',
      'development-casting-annex',
    ])

    const { receipts } = receiptsThroughCompletion(state)
    const office = receipts.find((line) => line.startsWith('Development Office II'))
    const annex = receipts.find((line) => line.startsWith('Development & Casting Annex'))
    expect(office).toBe(
      `Development Office II is Operational in Week ${String(placements[0]!.completesWeek)}.`,
    )
    expect(annex).toBe(
      `Development & Casting Annex is Operational in Week ${String(placements[1]!.completesWeek)}. One shared Development & Casting slot is now available.`,
    )
  })

  it('the full ordered list carries the same copy the singular receipt does', () => {
    let state = managedStudio('c1-m6-receipt-ordered-list')
    state = place(state, legalRequest(state, 'development-office-2'))
    const placed = studioPlacement(state).placements[0]!

    let before = state
    while (before.market.tick < placed.completesWeek - 1) before = advanceWeek(before).next
    const advanced = advanceWeek(before)
    const all = constructionCompletionsBetween(before, advanced.next)
    expect(all).toHaveLength(1)
    expect(all[0]!.message).toBe(
      `Development Office II is Operational in Week ${String(placed.completesWeek)}.`,
    )
    expect(advanced.constructionCompletion?.message).toBe(all[0]!.message)
  })
})
