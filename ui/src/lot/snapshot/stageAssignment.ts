// ── Stable Stage A/B assignment (presentation only) ───────────────────────────
//
// THE DEFECT. The engine has no `stage` field, so `studioLotSnapshot()` assigns stages by
// position in `state.studio.activeProductions` (adapter.ts: `stageId: STAGE_IDS[i]`, and the
// comment at adapter.ts:3618 that documents the arrangement). When the production in slot 0
// releases, core splices it out and the array compacts — so the surviving production, which
// the player has been watching on Stage B, silently becomes the Stage A production on the
// next snapshot. Its progress card, apron dressing, crew vignettes and "ACTIVE" badge all
// migrate to the other building. Identical stage art hides this today; distinct stage art
// would make it obvious.
//
// THE FIX, and its boundaries. This is a presentation-owned selector. It does not touch
// GameState, the SaveFile, the adapter, or the StudioLotSnapshot schema — it consumes a
// snapshot and returns a snapshot of the same type, correcting only which of the two stage
// slots each production is DISPLAYED on. It invents no simulation fact: a production's stage
// was never engine truth, so choosing a stable display slot cannot contradict the engine.
//
// It works because the snapshot already carries what is needed: `ProductionCard.id` is the
// authoritative, stable production id (adapter.ts: `id: p.id`). We hold a slot per id for as
// long as that production is on the lot.
//
// Determinism:
//   • Same sequence of snapshots ⇒ same assignment, always. No RNG, no clock.
//   • A production keeps its slot for its whole presentation lifetime; a slot is only freed
//     when its production leaves the snapshot.
//   • On a fresh resolver (first mount, reload) with no memory, assignment falls back to
//     snapshot order — i.e. exactly the adapter's arrangement — so a cold start is stable
//     and reproduces the documented "[0] → Stage A" behaviour.

import type { BuildingState, ProductionCard, StudioLotSnapshot } from './StudioLotSnapshot'

/** The two stage slots a production can be displayed on. */
export type StageSlotId = 'stage-a' | 'stage-b'

/** Slot order — index 0 is the slot a first production takes on a cold start. */
export const STAGE_SLOTS: readonly StageSlotId[] = ['stage-a', 'stage-b'] as const

function isStageSlot(id: string): id is StageSlotId {
  return id === 'stage-a' || id === 'stage-b'
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
  private plan(prods: readonly ProductionCard[]): Map<string, StageSlotId> {
    const present = new Set(prods.map((p) => p.id))
    for (const id of [...this.slotOf.keys()]) {
      if (!present.has(id)) this.slotOf.delete(id)
    }
    const taken = new Set(this.slotOf.values())
    for (const p of prods) {
      if (this.slotOf.has(p.id)) continue
      const free = STAGE_SLOTS.find((s) => !taken.has(s))
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
    const plan = this.plan(snap.activeProductions)
    const moved = snap.activeProductions.some((p) => plan.get(p.id) !== p.stageId)
    if (!moved) return snap
    return {
      ...snap,
      activeProductions: snap.activeProductions.map((p) => ({
        ...p,
        stageId: plan.get(p.id) ?? p.stageId,
      })),
      buildings: remapStageBuildings(snap.buildings, snap.activeProductions, plan),
    }
  }
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
): BuildingState[] {
  // target slot → the adapter slot whose presentation belongs there
  const source = new Map<StageSlotId, StageSlotId>()
  const usedSource = new Set<StageSlotId>()
  for (const p of prods) {
    const target = plan.get(p.id)
    if (!target) continue
    source.set(target, p.stageId)
    usedSource.add(p.stageId)
  }
  // Any slot left without a production takes an unused adapter slot — i.e. an empty stage.
  const spare = STAGE_SLOTS.filter((s) => !usedSource.has(s))
  let next = 0
  for (const s of STAGE_SLOTS) {
    if (!source.has(s)) source.set(s, spare[next++] ?? s)
  }

  const bySlot = new Map<StageSlotId, BuildingState>()
  for (const b of buildings) if (isStageSlot(b.id)) bySlot.set(b.id, b)

  return buildings.map((b) => {
    if (!isStageSlot(b.id)) return b
    const from = source.get(b.id)
    const src = from ? bySlot.get(from) : undefined
    // keep this entry's own id; take the other slot's presentation
    return src ? { ...src, id: b.id } : b
  })
}
