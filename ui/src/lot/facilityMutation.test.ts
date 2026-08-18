// ── C1-M3b — moving and demolishing a building, and the identities that survive ─
//
// Every case here drives a REAL managed studio through the engine's own actions: the
// placements are committed and completed by the engine, the engagement that blocks a
// verb is a screenplay the studio actually commissioned into that facility, and the
// demolition is dispatched through the same action path the world uses. No refusal is
// hand-authored, because a hand-authored refusal proves only that the fixture matches
// the fixture.
//
// The headline obligation is the campaign's twice-found defect family: a surface
// holding an identity the latest truth no longer contains. A demolished facility must
// fail NEUTRAL everywhere — the composed world, the inspector, the label lookup, the
// presence sites — and it is proven here on a state where the facility was selected at
// the moment it came down.

import { describe, expect, it } from 'vitest'
import {
  advanceWeek,
  commissionScriptAction,
  demolishFacilityAction,
  facilityDemolitionRefusal,
  facilityMoveRefusal,
  foundManagedStudioAction,
  foundingApplicantCards,
  moveFacilityAction,
  newGame,
  placeFacilityAction,
  placementQuote,
  scriptProjectsBoard,
  signContractAction,
  startDevelopmentCastingAnnexAction,
  studioCalendarBoard,
  studioLotSnapshot,
  studioPlacement,
} from '../engine/adapter.ts'
import type { CommissionScriptPayload, GameState, PlacementRequest } from '../engine/adapter.ts'
import { placedBuildingId } from './snapshot/StudioLotSnapshot.ts'
import { lotBuildingInspectorContext } from './buildingInspector.ts'
import {
  canOfferFacilityVerbs,
  demolishConfirmText,
  demolishReceiptText,
  demolishVerbLabel,
  demolitionSubjectOf,
  facilityActivityLabel,
  facilityMutationBlockedReason,
  moveReceiptText,
  placedFacilityById,
} from './facilityMutation.ts'
import { composeWorldBuildings, worldBuildingById } from './tycoon/buildings.ts'
import { resolvePresenceSite } from './tycoon/presence.ts'

const COUNTS = { actor: 3, director: 1, writer: 3, craft: 1 } as const

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

/** The first LEGAL placement on a parcel that is not the legacy Annex pad. */
function firstLegalRequest(state: GameState, skip: readonly string[] = []): PlacementRequest {
  const view = studioPlacement(state)
  const blueprint = view.catalog[0]
  if (blueprint === undefined) throw new Error('the placement catalog is empty')
  for (const parcel of view.parcels) {
    if (parcel.id === 'expansion' || skip.includes(parcel.id)) continue
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        const request = { blueprintId: blueprint.blueprintId, origin: { gx, gy } }
        if (placementQuote(state, request).ok) return request
      }
    }
  }
  throw new Error('no legal placement remains')
}

function place(state: GameState, request: PlacementRequest): GameState {
  const committed = placeFacilityAction(state, request)
  if (!committed.ok) throw new Error(committed.error)
  return committed.next
}

function completeEveryPlacement(state: GameState): GameState {
  let current = state
  const last = Math.max(...studioPlacement(current).placements.map((p) => p.completesWeek))
  while (current.market.tick < last) current = advanceWeek(current).next
  return current
}

/** One managed studio with ONE operational facility the studio built. */
function studioWithOneFacility(seed: string): GameState {
  const state = managedStudio(seed)
  return completeEveryPlacement(place(state, firstLegalRequest(state)))
}

function commissionPayload(state: GameState): CommissionScriptPayload | null {
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]
  const writer = board.commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) return null
  return {
    conceptId: concept.id,
    writerId: writer.id,
    shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.65, 0.15],
        tonalWeight: [-0.65, 0.15],
        kineticEnergy: [-0.65, 0.15],
      },
    },
  } as CommissionScriptPayload
}

/**
 * Fill the founding Development & Casting slots, then commission ONE MORE so the work
 * lands in the facility the studio built. That reservation is a real engagement, and it
 * is the thing that must block both verbs.
 */
function engageThePlacedFacility(state: GameState): GameState {
  let current = state
  for (let attempt = 0; attempt < 4; attempt++) {
    const payload = commissionPayload(current)
    if (payload === null) break
    const outcome = commissionScriptAction(current, payload)
    if (!outcome.ok) break
    current = outcome.next
  }
  return current
}

describe('C1-M3b — the words never invent a name and never print an engine word', () => {
  it('names the work, the activity, and degrades honestly when it cannot', () => {
    const engaged = (holders: { title: string | null; activity: string }[]) =>
      facilityMutationBlockedReason('Annex 2', {
        code: 'facilityEngaged' as const,
        holders: holders.map((holder, index) => ({
          kind: 'screenplay' as const,
          holderId: `h${String(index)}`,
          activity: holder.activity,
          title: holder.title,
        })),
      })

    expect(engaged([{ title: 'Nights of the Watchtower', activity: 'shooting' }])).toBe(
      'Annex 2 is reserved by Nights of the Watchtower — shooting.',
    )
    // A phase id is an engine word. It is dropped, never printed.
    expect(facilityActivityLabel('preProduction')).toBe('in pre-production')
    expect(facilityActivityLabel('someKindNobodyTaughtIt')).toBeNull()
    expect(engaged([{ title: 'The Long Take', activity: 'someKindNobodyTaughtIt' }])).toBe(
      'Annex 2 is reserved by The Long Take.',
    )
    // An unresolvable title becomes neutral — never a guessed name.
    expect(engaged([{ title: null, activity: 'auditioning' }])).toBe(
      'Annex 2 is reserved by current studio work — auditioning.',
    )
    // More than one holder keeps the named sentence and tells the truth about the rest.
    expect(
      engaged([
        { title: 'First Light', activity: 'shooting' },
        { title: 'Second Wind', activity: 'auditioning' },
      ]),
    ).toBe('Annex 2 is reserved by First Light — shooting. 1 other commitment holds it too.')

    // Caller states are not player situations: no sentence, and no verb either.
    expect(facilityMutationBlockedReason('Annex 2', { code: 'regimeNotReady', holders: [] })).toBeNull()
    expect(canOfferFacilityVerbs({
      canMove: false,
      canDemolish: false,
      blocked: { code: 'regimeNotReady', holders: [] },
      demolitionRefund: 0,
    })).toBe(false)
    expect(canOfferFacilityVerbs(undefined)).toBe(false)
  })

  it('writes the confirm and both receipts in the studio’s own grammar', () => {
    expect(demolishVerbLabel(390_000)).toBe('Demolish this building — refund $390,000')
    expect(demolishConfirmText('Development & Casting Annex 2', 390_000)).toBe(
      'Demolish Development & Casting Annex 2? The studio recovers $390,000.',
    )
    expect(demolishReceiptText('Development & Casting Annex 2', 390_000)).toBe(
      'DEVELOPMENT & CASTING ANNEX 2 DEMOLISHED — $390,000 recovered',
    )
    expect(moveReceiptText('Development & Casting Annex', 'West Lawn')).toBe(
      'Development & Casting Annex moved to the West Lawn.',
    )
    expect(moveReceiptText('Development & Casting Annex', null)).toBe(
      'Development & Casting Annex moved to its new site.',
    )
  })

  it('calls a construction site a construction site, and names the write-off (C1-M8)', () => {
    // A half-built foundation is not "this building", and taking it down is not
    // cashing something in: the weeks already paid for are gone, and the confirm
    // said nothing about them. Driven through a real 20-week Hall, exactly as the
    // rest of this file drives its states.
    let state = managedStudio('c1-m8-demolish-site')
    const view = studioPlacement(state)
    let request: PlacementRequest | null = null
    for (const parcel of view.parcels) {
      if (parcel.id === 'expansion' || request !== null) continue
      for (let gy = parcel.rect.y0; gy <= parcel.rect.y1 && request === null; gy++) {
        for (let gx = parcel.rect.x0; gx <= parcel.rect.x1 && request === null; gx++) {
          const candidate = { blueprintId: 'development-casting-hall', origin: { gx, gy } }
          if (placementQuote(state, candidate).ok) request = candidate
        }
      }
    }
    if (request === null) throw new Error('no legal site for the Hall')
    state = place(state, request)

    const rowAt = (current: GameState) =>
      studioLotSnapshot(current).placement!.placements[0]!

    // Before any advance: nothing built yet, and the sentence says exactly that.
    const sameWeek = demolitionSubjectOf(rowAt(state))
    expect(sameWeek).toEqual({ status: 'underConstruction', weeksBuilt: 0 })
    expect(demolishConfirmText('Development & Casting Hall', 700_000, sameWeek)).toBe(
      'Demolish the Development & Casting Hall construction site? The studio recovers $700,000; no weeks of building are lost yet.',
    )

    // One weekly advance reads as one week.
    state = advanceWeek(state).next
    const firstWeek = demolitionSubjectOf(rowAt(state))
    expect(firstWeek).toEqual({ status: 'underConstruction', weeksBuilt: 1 })
    expect(demolishConfirmText('Development & Casting Hall', 700_000, firstWeek)).toBe(
      'Demolish the Development & Casting Hall construction site? The studio recovers $700,000; 1 week of building is written off.',
    )

    // Seven weeks in, and it is still a site — with seven weeks to lose.
    for (let week = 0; week < 6; week++) state = advanceWeek(state).next
    const halfBuilt = rowAt(state)
    expect(halfBuilt.status).toBe('underConstruction')
    const site = demolitionSubjectOf(halfBuilt)
    expect(site).toEqual({ status: 'underConstruction', weeksBuilt: 7 })
    expect(demolishVerbLabel(halfBuilt.mutation!.demolitionRefund, site)).toBe(
      'Demolish this construction site — refund $700,000',
    )
    expect(demolishConfirmText(halfBuilt.name, halfBuilt.mutation!.demolitionRefund, site)).toBe(
      'Demolish the Development & Casting Hall construction site? The studio recovers $700,000; 7 weeks of building are written off.',
    )
    // …and that is the verb the world actually offers, through the inspector.
    const siteContext = lotBuildingInspectorContext(
      studioLotSnapshot(state),
      placedBuildingId(halfBuilt.id),
      studioCalendarBoard(state),
      null,
    )
    expect(
      siteContext.primaryActions.find((action) => action.kind === 'demolish')?.label,
    ).toBe('Demolish this construction site — refund $700,000')

    // THE OPERATIONAL COPY IS UNCHANGED, byte for byte, with or without a subject.
    const standing = studioWithOneFacility('c1-m8-demolish-standing')
    const built = studioLotSnapshot(standing).placement!.placements[0]!
    const subject = demolitionSubjectOf(built)
    expect(subject?.status).toBe('operational')
    expect(demolishVerbLabel(390_000, subject)).toBe(demolishVerbLabel(390_000))
    expect(demolishConfirmText(built.name, 390_000, subject)).toBe(
      demolishConfirmText(built.name, 390_000),
    )
    expect(demolishConfirmText(built.name, 390_000, subject)).toBe(
      `Demolish ${built.name}? The studio recovers $390,000.`,
    )
    // A subject the world could not prove changes nothing either.
    expect(demolitionSubjectOf(null)).toBeNull()
    expect(demolishVerbLabel(390_000, null)).toBe('Demolish this building — refund $390,000')
  })
})

describe('C1-M3b — a facility the studio built offers both verbs', () => {
  it('offers them enabled, with the engine’s own refund, and never on other bodies', () => {
    const state = studioWithOneFacility('c1-m3b-verbs-enabled')
    const snapshot = studioLotSnapshot(state)
    const placed = snapshot.placement!.placements[0]!
    const id = placedBuildingId(placed.id)

    expect(placed.mutation).toBeDefined()
    expect(placed.mutation!.canMove).toBe(true)
    expect(placed.mutation!.canDemolish).toBe(true)
    expect(placed.mutation!.blocked).toBeNull()
    expect(placed.mutation!.demolitionRefund).toBe(390_000)
    // The snapshot's refund IS the engine's, not a fraction recomputed here.
    expect(facilityDemolitionRefusal(state, { placementId: placed.id })).toBeNull()

    const context = lotBuildingInspectorContext(snapshot, id, studioCalendarBoard(state), null)
    expect(context.primaryActions.map((action) => action.kind)).toEqual(['move', 'demolish'])
    for (const action of context.primaryActions) {
      expect(action.disabled).toBeUndefined()
      expect(action.reason).toBeUndefined()
    }
    expect(context.primaryActions[1]!.label).toBe('Demolish this building — refund $390,000')

    // No founding body and no legacy parcel offers either verb — absence, not disabled.
    for (const founding of ['writers', 'stage-a', 'gate', 'expansion', 'theater']) {
      const other = lotBuildingInspectorContext(
        snapshot,
        founding,
        studioCalendarBoard(state),
        null,
      )
      expect(other.primaryActions.some((a) => a.kind === 'move' || a.kind === 'demolish')).toBe(
        false,
      )
    }
  })

  it('disables both verbs, with the reason, while real work holds the facility', () => {
    const engaged = engageThePlacedFacility(studioWithOneFacility('c1-m3b-verbs-engaged'))
    const snapshot = studioLotSnapshot(engaged)
    const placed = snapshot.placement!.placements[0]!
    const id = placedBuildingId(placed.id)

    // The engagement is REAL: a screenplay the studio commissioned reserved this exact
    // facility because the founding slots were already full.
    const refusal = facilityDemolitionRefusal(engaged, { placementId: placed.id })
    expect(refusal?.code).toBe('facilityEngaged')
    expect(placed.mutation!.canMove).toBe(false)
    expect(placed.mutation!.canDemolish).toBe(false)
    expect(placed.mutation!.blocked?.code).toBe('facilityEngaged')
    const holders = placed.mutation!.blocked!.holders
    expect(holders.length).toBeGreaterThan(0)
    expect(holders[0]!.kind).toBe('screenplay')
    expect(holders[0]!.activity).toBe('drafting a screenplay')
    // The title was resolved at the boundary from the Studio Calendar.
    expect(holders[0]!.title).not.toBeNull()

    const context = lotBuildingInspectorContext(snapshot, id, studioCalendarBoard(engaged), null)
    expect(context.primaryActions.map((action) => action.kind)).toEqual(['move', 'demolish'])
    for (const action of context.primaryActions) {
      expect(action.disabled).toBe(true)
      expect(action.reason).toBe(
        `${placed.name} is reserved by ${holders[0]!.title!} — drafting a screenplay.`,
      )
    }
    // Not a code name anywhere in the sentence a player reads.
    expect(context.primaryActions[0]!.reason).not.toMatch(/facilityEngaged|facility-|script-/)
  })
})

describe('C1-M3b — a move is one building changing address', () => {
  it('collides with itself without `movingPlacementId`, and is legal with it', () => {
    const state = studioWithOneFacility('c1-m3b-move-self-collision')
    const placed = studioPlacement(state).placements[0]!
    const request = { blueprintId: placed.blueprintId, origin: placed.origin }

    // THE defect the option exists to prevent: asked as a new build, the building's own
    // ground is occupied — by itself.
    const asNewBuild = placementQuote(state, request)
    expect(asNewBuild.ok).toBe(false)
    expect(asNewBuild.rejections).toContain('occupied')

    // Asked as a MOVE, standing still is trivially legal.
    const asMove = placementQuote(state, request, { movingPlacementId: placed.id })
    expect(asMove.ok).toBe(true)
    expect(facilityMoveRefusal(state, { placementId: placed.id, origin: placed.origin })).toBeNull()
  })

  it('re-sites it, keeps its identity, and names the destination in the receipt', () => {
    const state = studioWithOneFacility('c1-m3b-move-commits')
    const before = studioPlacement(state).placements[0]!
    const destination = firstLegalRequest(state, [before.parcelId])

    const moved = moveFacilityAction(state, {
      placementId: before.id,
      origin: destination.origin,
    })
    expect(moved.ok).toBe(true)
    if (!moved.ok) throw new Error(moved.error)
    expect(moved.next).not.toBe(state)

    const after = studioPlacement(moved.next).placements[0]!
    // IDENTITY PRESERVED — a move is a change of address, not a rebuild.
    expect(after.id).toBe(before.id)
    expect(after.facilityId).toBe(before.facilityId)
    expect(after.status).toBe(before.status)
    expect(after.completesWeek).toBe(before.completesWeek)
    expect(after.parcelId).not.toBe(before.parcelId)
    expect(after.origin).toEqual(destination.origin)
    // A move is not a re-purchase.
    expect(moved.next.studio.cash).toBe(state.studio.cash)

    const snapshot = studioLotSnapshot(moved.next)
    const parcelLabel = snapshot.placement!.parcels.find((p) => p.id === after.parcelId)!.label
    expect(moveReceiptText(after.name, parcelLabel)).toBe(`${after.name} moved to the ${parcelLabel}.`)

    // The WORLD moved with it: same id, new ground, anchors re-derived.
    const composed = composeWorldBuildings(snapshot)
    const body = worldBuildingById(composed, placedBuildingId(after.id))
    expect(body).not.toBeNull()
    expect({ gx: body!.gx, gy: body!.gy }).toEqual(after.origin)
    // …and presence follows the body rather than the ground it left.
    const site = resolvePresenceSite(after.facilityId, snapshot.placement!.placements, composed)
    expect(site?.kind).toBe('placed')
    expect(site!.work.gy).toBeGreaterThan(after.origin.gy)
  })

  it('refuses a destination the engine refuses, and changes nothing', () => {
    const state = studioWithOneFacility('c1-m3b-move-illegal')
    const placed = studioPlacement(state).placements[0]!
    // The central courtyard is protected ground: owned, and never buildable.
    const courtyard = studioPlacement(state).parcels.find((p) => p.id === 'courtyard')!
    const request = { placementId: placed.id, origin: { gx: courtyard.rect.x0, gy: courtyard.rect.y0 } }

    const refusal = facilityMoveRefusal(state, request)
    expect(refusal?.code).toBe('illegalDestination')
    expect(refusal?.code === 'illegalDestination' && refusal.quote.rejections).toContain(
      'terrainUnbuildable',
    )

    // The ACTION LAYER rejects a refused mutation by throwing (`rejectRefusedMutation`),
    // so the outcome is a refusal and no state is produced at all. Byte-neutrality is
    // therefore trivial here — there is no successor to compare — and the host never
    // replaces the authoritative state on a refusal.
    const refused = moveFacilityAction(state, request)
    expect(refused.ok).toBe(false)
    // The thrown message names the refusal CODE. It is diagnostics, and the world
    // deliberately never prints it: the probe above is what the panel renders.
    if (refused.ok) throw new Error('an illegal destination was accepted')
    expect(refused.error).toContain('illegalDestination')
    expect(studioPlacement(state).placements[0]!.origin).toEqual(placed.origin)
  })
})

describe('C1-M3b — a demolition leaves nothing dangling', () => {
  it('credits the refund, removes the body, and reverts the ground to buildable', () => {
    const state = studioWithOneFacility('c1-m3b-demolish-commits')
    const placed = studioPlacement(state).placements[0]!
    const cashBefore = state.studio.cash
    const refund = studioLotSnapshot(state).placement!.placements[0]!.mutation!.demolitionRefund

    const down = demolishFacilityAction(state, { placementId: placed.id })
    expect(down.ok).toBe(true)
    if (!down.ok) throw new Error(down.error)
    expect(down.next).not.toBe(state)
    expect(down.next.studio.cash).toBe(cashBefore + refund)
    expect(studioPlacement(down.next).placements).toHaveLength(0)

    const snapshot = studioLotSnapshot(down.next)
    // No debris, no cleanup theater: the parcel is simply open ground again.
    const parcel = snapshot.placement!.parcels.find((p) => p.id === placed.parcelId)!
    expect(parcel.occupiedCells).toBe(0)
    expect(parcel.placedFacilityIds).toEqual([])
  })

  it('fails NEUTRAL on every surface still holding the demolished identity', () => {
    const state = studioWithOneFacility('c1-m3b-demolish-orphan')
    const placed = studioPlacement(state).placements[0]!
    const selected = placedBuildingId(placed.id)

    // The world before: a real body, selectable and inspectable under that id.
    const before = studioLotSnapshot(state)
    expect(worldBuildingById(composeWorldBuildings(before), selected)).not.toBeNull()
    expect(
      lotBuildingInspectorContext(before, selected, studioCalendarBoard(state), null).label,
    ).toBe(placed.name)

    // …demolished WHILE it is the selected building.
    const down = demolishFacilityAction(state, { placementId: placed.id })
    if (!down.ok) throw new Error(down.error)
    const after = studioLotSnapshot(down.next)

    // The snapshot no longer carries it, in any of the three places it lived.
    expect(after.placement!.placements).toHaveLength(0)
    expect(after.property!.buildings.some((b) => b.id === selected)).toBe(false)
    expect(after.buildings.some((b) => b.id === selected)).toBe(false)
    expect(placedFacilityById(after.placement!.placements, placed.id)).toBeNull()

    // The composed world drops the body rather than painting a ghost of it.
    const composed = composeWorldBuildings(after)
    expect(worldBuildingById(composed, selected)).toBeNull()

    // The inspector still OPENS — withholding a fact must never eject the player — and
    // says the true thing rather than describing a place that is not there.
    const context = lotBuildingInspectorContext(after, selected, studioCalendarBoard(down.next), null)
    expect(context.buildingId).toBe(selected)
    expect(context.status).toBe('This place is not part of the studio property this week.')
    expect(context.primaryActions).toEqual([])
    expect(context.facts).toEqual([])
    expect(context.occupantFacts).toEqual([])

    // Presence no longer claims the PLACED site: the dead placement id appears nowhere,
    // which is the dangling-identity risk. (The retained M1.5 facility→place map still
    // answers `facility-development-casting-annex` with the legacy Annex PARCEL, a body
    // that really does stand on the property. Unreachable in play — the engine reports
    // presence only for facilities that exist — but noted for M4/M5: that map predates
    // a world where this facility id can belong to a facility built anywhere.)
    const site = resolvePresenceSite(placed.facilityId, after.placement!.placements, composed)
    expect(site?.kind).not.toBe('placed')

    // And the verbs are gone with it: nothing can be moved or demolished twice.
    expect(facilityDemolitionRefusal(down.next, { placementId: placed.id })?.code).toBe(
      'unknownPlacement',
    )
  })

  it('never offers either verb on the legacy Annex, however many others stand', () => {
    let state = managedStudio('c1-m3b-legacy-annex-exempt')
    const started = startDevelopmentCastingAnnexAction(state)
    if (!started.ok) throw new Error(started.error)
    state = completeEveryPlacement(place(started.next, firstLegalRequest(started.next)))

    const placements = studioPlacement(state).placements
    const legacy = placements.find((p) => p.parcelId === 'expansion')!
    const built = placements.find((p) => p.parcelId !== 'expansion')!

    // The ENGINE refuses both verbs on the legacy placement…
    expect(facilityDemolitionRefusal(state, { placementId: legacy.id })?.code).toBe(
      'foundingPlacement',
    )
    // …and the world never offers them: `expansion` has no placed identity at all.
    const snapshot = studioLotSnapshot(state)
    expect(snapshot.property!.buildings.some((b) => b.placedFacilityId === legacy.id)).toBe(false)
    const annexPanel = lotBuildingInspectorContext(
      snapshot,
      'expansion',
      studioCalendarBoard(state),
      null,
    )
    expect(annexPanel.primaryActions).toEqual([])

    // The one the studio BUILT still offers both, so the exemption is targeted.
    const builtPanel = lotBuildingInspectorContext(
      snapshot,
      placedBuildingId(built.id),
      studioCalendarBoard(state),
      null,
    )
    expect(builtPanel.primaryActions.map((a) => a.kind)).toEqual(['move', 'demolish'])
  })
})
