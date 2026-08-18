// ── Stable Stage A/B assignment (presentation only) ───────────────────────────
//
// THE LEGACY DEFECT. Legacy engine state has no `stage` field, so `studioLotSnapshot()`
// assigns stages by position in `state.studio.activeProductions`. When the production in slot 0
// releases, core splices it out and the array compacts — so the surviving production, which
// the player has been watching on Stage B, silently becomes the Stage A production on the
// next snapshot. Its progress card, apron dressing, crew vignettes and "ACTIVE" badge all
// migrate to the other building. Identical stage art hides this today; distinct stage art
// would make it obvious.
//
// THE FIX, and its boundaries. In legacy mode this is a presentation-owned selector. It
// does not touch GameState or the SaveFile — it consumes a
// snapshot and returns a snapshot of the same type, correcting only which of the two stage
// slots each production is DISPLAYED on. It invents no simulation fact: a production's stage
// was never engine truth, so choosing a stable display slot cannot contradict the engine.
//
// It works because the snapshot already carries what is needed: `ProductionCard.id` is the
// authoritative, stable production id. We hold a slot per id for as
// long as that production is on the lot.
//
// Managed Production Operations is different: its Soundstage 7/12 reservation is engine
// truth. `stageAssignmentAuthority: 'engine'` therefore bypasses this resolver and clears
// any presentation memory. An authoritative assignment is returned byte-for-byte and can
// never be remapped by an earlier legacy session.
//
// Determinism:
//   • Same sequence of snapshots ⇒ same assignment, always. No RNG, no clock.
//   • A production keeps its slot for its whole presentation lifetime; a slot is only freed
//     when its production leaves the snapshot.
//   • On a resolver with no memory — a cold start, or one that has just been reset at a game
//     boundary — assignment falls back to snapshot order, i.e. exactly the adapter's
//     arrangement, reproducing the documented "[0] → Stage A" behaviour.

import type { BuildingId, BuildingState, ProductionCard, StudioLotSnapshot } from './StudioLotSnapshot'
import { FOUNDING_STAGE_BUILDING_IDS, lotStageBuildingIds } from './stageIdentity'

/**
 * A stage slot a production can be displayed on.
 *
 * Was the closed pair `'stage-a' | 'stage-b'` until C2a-M2. It is the open `BuildingId`
 * now, for the same reason `ProductionCard.stageId` is: which bodies are stages is a
 * fact about the studio, derived per snapshot, not a constant of the presentation.
 */
export type StageSlotId = BuildingId

/**
 * The FOUNDING slot order — index 0 is the slot a first production takes on a cold start.
 *
 * Retained as the fallback, and it is the right one: this resolver only ever runs in
 * LEGACY mode (managed occupancy is engine truth and bypasses it entirely), legacy
 * operations hold no facilities and can build nothing, so a legacy studio's stages are
 * exactly these two authored founding bodies. `stageSlotsFor` reads the snapshot's own
 * derived list first so the resolver cannot be the thing that closes the world again.
 */
export const STAGE_SLOTS: readonly StageSlotId[] = FOUNDING_STAGE_BUILDING_IDS

/** The display slots THIS snapshot's studio has, in world order. */
function stageSlotsFor(snapshot: StudioLotSnapshot): readonly StageSlotId[] {
  const derived = lotStageBuildingIds(snapshot)
  return derived.length === 0 ? STAGE_SLOTS : derived
}

/**
 * Holds the display slot each production occupies, for as long as it is on the lot.
 * One instance lives with the lot screen, above BOTH the Phaser scene and the DOM
 * companion navigation, so the two can never disagree about which stage is busy.
 */
export class StageAssignment {
  private slotOf = new Map<string, StageSlotId>()

  /** Forget every held slot (a fresh presentation lifetime). */
  reset(): void {
    this.slotOf.clear()
  }

  /** The slot currently held for a production id, if any. Exposed for tests. */
  slotFor(productionId: string): StageSlotId | undefined {
    return this.slotOf.get(productionId)
  }

  /**
   * Update the held slots for this snapshot and return the id → slot plan.
   * Productions that have left release their slot; productions already on the lot keep
   * theirs; newcomers take the lowest-numbered free slot, in snapshot order.
   */
  private plan(
    prods: readonly ProductionCard[],
    slots: readonly StageSlotId[],
  ): Map<string, StageSlotId> {
    const present = new Set(prods.map((p) => p.id))
    for (const id of [...this.slotOf.keys()]) {
      if (!present.has(id)) this.slotOf.delete(id)
    }
    const taken = new Set(this.slotOf.values())
    for (const p of prods) {
      if (this.slotOf.has(p.id)) continue
      const free = slots.find((s) => !taken.has(s))
      // The snapshot never carries more productions than slots (the adapter slices to
      // STAGE_IDS.length). If that ever changes, fall back to the adapter's own choice
      // rather than dropping the card.
      const slot = free ?? p.stageId
      this.slotOf.set(p.id, slot)
      taken.add(slot)
    }
    return this.slotOf
  }

  /**
   * Return this snapshot with each production shown on its held stage slot.
   * Returns the SAME object when nothing needs correcting, so an unchanged snapshot stays
   * referentially stable for React and for the scene's change handling.
   */
  resolve(snap: StudioLotSnapshot): StudioLotSnapshot {
    if (snap.stageAssignmentAuthority === 'engine') {
      // Managed occupancy belongs to the engine. Relinquish every remembered display slot
      // so neither prior legacy state nor a later mode transition can override it.
      this.slotOf.clear()
      return snap
    }
    const slots = stageSlotsFor(snap)
    const isStageSlot = (id: string): boolean => slots.includes(id)
    const plan = this.plan(snap.activeProductions, slots)
    const moved = snap.activeProductions.some((p) => plan.get(p.id) !== p.stageId)
    if (!moved) return snap
    return {
      ...snap,
      activeProductions: snap.activeProductions.map((p) => ({
        ...p,
        stageId: plan.get(p.id) ?? p.stageId,
      })),
      ...(snap.productionOperations
        ? {
            productionOperations: snap.productionOperations.map((operation) => {
              const slot = plan.get(operation.productionId)
              return slot !== undefined && isStageSlot(operation.locationBuildingId)
                ? { ...operation, locationBuildingId: slot }
                : operation
            }),
          }
        : {}),
      buildings: remapStageBuildings(snap.buildings, snap.activeProductions, plan, slots),
    }
  }
}

// ── The lot's assignment memory, and where its lifetime ends ──────────────────
//
// ONE instance, shared by every mount of the lot screen. It has to outlive the screen,
// because the way a player advances a week is to leave the lot, tick, and come back — a
// per-mount instance would forget every held stage on the way out and the migration defect
// would reappear on re-entry.
//
// But "outlives the component" is not the same as "lives forever", and getting that wrong
// was a real defect. The memory is keyed by production id, and core allocates production ids
// as `prod-<tick>` (actions.ts), which are unique WITHIN a game and collide freely ACROSS
// games. The app replaces GameState in place — "Start a new studio" and loading a save never
// reload the page — so without an explicit end to the session, a slot held by a departed
// studio's film could be inherited by an unrelated new studio's film that happened to be
// greenlit in the same week, and the new studio's first picture would open on Stage B with
// Stage A dark.
//
// So the lifetime is the LOADED GAME, not the JS realm: `resetLotStageAssignment()` is
// called at the authoritative GameState-replacement boundaries in App.tsx (new studio,
// loaded save) — and nowhere else. Never on unmount, never on a tick, never on a failed
// load. This stays presentation-only: no GameState field, no save data, no engine identity.
export const lotStageAssignment = new StageAssignment()

/**
 * End the current presentation session and start a fresh one.
 *
 * Call ONLY where the authoritative GameState is genuinely replaced — a new studio, or a
 * successfully loaded save. Do NOT call it when the lot unmounts (the player is mid-game and
 * must keep their stages), nor during ordinary week progression, nor on a rejected load
 * where the previous studio is still live.
 */
export function resetLotStageAssignment(): void {
  lotStageAssignment.reset()
}

/**
 * Move each stage building's presentation (attention + reason) to the slot its production
 * now occupies. The adapter derives `stage-a`/`stage-b` attention from the same array-order
 * assignment, so correcting `activeProductions` without this would leave the companion
 * navigation and the in-canvas badges pointing at the wrong stage.
 *
 * This is a permutation of the two stage entries — it copies the adapter's own strings
 * rather than re-deriving them, so no presentation rule is duplicated and the BuildingState
 * key set is preserved exactly (studio-lot-snapshot.test.ts asserts that key set).
 */
function remapStageBuildings(
  buildings: readonly BuildingState[],
  prods: readonly ProductionCard[],
  plan: ReadonlyMap<string, StageSlotId>,
  slots: readonly StageSlotId[],
): BuildingState[] {
  const isStageSlot = (id: string): boolean => slots.includes(id)
  // target slot → the adapter slot whose presentation belongs there
  const source = new Map<StageSlotId, StageSlotId>()
  const usedSource = new Set<StageSlotId>()
  for (const p of prods) {
    const target = plan.get(p.id)
    if (target === undefined) continue
    source.set(target, p.stageId)
    usedSource.add(p.stageId)
  }
  // Any slot left without a production takes an unused adapter slot — i.e. an empty stage.
  const spare = slots.filter((s) => !usedSource.has(s))
  let next = 0
  for (const s of slots) {
    if (!source.has(s)) source.set(s, spare[next++] ?? s)
  }

  const bySlot = new Map<StageSlotId, BuildingState>()
  for (const b of buildings) if (isStageSlot(b.id)) bySlot.set(b.id, b)

  return buildings.map((b) => {
    if (!isStageSlot(b.id)) return b
    const from = source.get(b.id)
    const src = from === undefined ? undefined : bySlot.get(from)
    // keep this entry's own id; take the other slot's presentation
    return src ? { ...src, id: b.id } : b
  })
}
