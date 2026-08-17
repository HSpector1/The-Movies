// ── Build Mode V1 — the in-world placement flow, as pure projection ───────────
//
// M2-UI puts the whole tycoon build loop inside the world: click a vacant parcel →
// read its facts → choose a blueprint → drag/nudge a ghost footprint → read the
// quote → commit. This module owns none of that interaction; it owns the PURE parts
// so they can be reasoned about and tested without a renderer or a React tree:
//
//   • what a parcel says when you click it (facts from the Engine's own projection);
//   • how a draft origin moves and stays inside its parcel (clamp, never slide);
//   • the identical-input memo key that stops a ghost re-querying on every mouse move;
//   • the player-facing words for each `PlacementRejection`, in the Engine's own
//     binding order — so a legality failure ALWAYS outranks "not enough cash".
//
// It computes no legality and no price. `queryPlacement` is the only authority for
// both, and `commitPlacement` re-runs it inside the Engine before charging anything
// (CODE-MINING-LEDGER Entry 2, the runner invariant). Nothing here ever writes a
// ghost into simulation state: a preview is a UI-only layer, per Entry 2's
// cautionary tale about donor ghosts living in the world.

import type {
  LotBlueprintState,
  LotCellPoint,
  LotGridRect,
  LotParcelState,
  LotPlacedFacilityState,
  LotPlacementProjection,
} from './snapshot/StudioLotSnapshot.ts'
import type { PlacementQuote, PlacementRejection } from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'

/**
 * A mutable placement draft. Shift law 16: a mutable draft needs VALUE and MONOTONIC
 * REVISION authority, so a late async result or a stale keystroke can never resurrect
 * a superseded origin. Every nudge, hover, blueprint change and reopen bumps `revision`.
 */
export type LotBuildDraft = {
  /**
   * The parcel the draft is bounded to, or NULL for a move (C1-M3b).
   *
   * A build is chosen from one parcel's own catalog, so its ghost is clamped inside
   * that parcel. A MOVE is a building the player already owns being carried somewhere
   * else, and where it may land is not a parcel question — it is the quote's question.
   * So a move roams the whole property and the per-cell verdicts do the teaching.
   */
  parcelId: string | null
  blueprintId: string
  origin: LotCellPoint
  revision: number
  /**
   * C1-M3b: the placement being RE-SITED, or null when this draft builds a new one.
   *
   * It is threaded straight through to `placementQuote`, which is what stops the
   * building colliding with the ground it is currently standing on.
   */
  movingPlacementId: number | null
}

/** One labelled line of parcel truth, matching the World Inspector fact shape. */
export type LotParcelFact = { key: string; term: string; detail: string }

export type LotParcelStatus = 'vacant' | 'building' | 'operational' | 'blocked'

export type LotParcelInspectorContext = {
  parcelId: string
  label: string
  /** What this ground IS, in the studio's own words. Never a mechanic. */
  role: string
  status: LotParcelStatus
  /** One live status line. */
  statusLine: string
  facts: LotParcelFact[]
  /** The facilities standing on this parcel, in placement order. */
  placements: LotPlacedFacilityState[]
  /** May the player start a build here right now? */
  canBuild: boolean
  /** Why not, when `canBuild` is false and the parcel is otherwise buildable. */
  buildBlockedReason: string | null
}

/**
 * Player words for every rejection code, in the Engine's binding order. The words
 * describe the SITE, not the rule name — a build-mode player is looking at ground,
 * not at a rule table.
 */
export const LOT_PLACEMENT_REJECTION_TEXT: Record<PlacementRejection, string> = {
  unknownBlueprint: 'That blueprint is not in the studio’s catalog.',
  offLot: 'Part of this footprint falls outside the studio property.',
  notOwned: 'Part of this footprint stands on ground the studio does not own.',
  terrainUnbuildable: 'This ground is protected — the studio does not build on it.',
  occupied: 'Something already stands on part of this footprint.',
  clearanceRing: 'This site is too close to another building — leave a cell of clearance.',
  noRoadAccess: 'This site has no road frontage; construction trucks cannot reach it.',
  seversLot: 'Building here would cut the lot in two.',
  // C1-M2. These two are the only codes that are NOT about the ground under the
  // cursor, so they are the only ones whose sentence cannot describe a site. They
  // are deliberately generic fallbacks: the specific, authored copy lives on the
  // quote as `unmetRequirements[].reason`, and the catalog surface (C1-M5) should
  // render that list rather than this one line whenever it has room for it.
  requirementsUnmet: 'The studio has not unlocked this building yet.',
  instanceLimit: 'The studio already has as many of these as it can build.',
  insufficientFunds: 'The studio cannot cover the capital cost this week.',
}

const PARCEL_ROLE: Record<string, string> = {
  'backlot-apron': 'Back-lot hardstanding beyond the staff parking',
  courtyard: 'The studio’s civic plaza — protected ground',
  expansion: 'The graded expansion pad on the studio boulevard',
  'north-back-lot': 'Deep graded ground behind the stages, still unserved by road',
  'north-court': 'The north court, between Development and Administration',
  'north-lawn': 'The north lawn, at the top of the property',
  'service-yard': 'Scenery & Service working ground — already in use',
  'south-lawn': 'The south lawn, off the boulevard',
  'stage-south': 'The pad south of the stages, off the service spur',
  'west-lawn': 'The west lawn, along the property wall',
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many
}

/** Inclusive rectangle width/depth in cells. */
export function rectSize(rect: LotGridRect): { width: number; depth: number } {
  return { width: rect.x1 - rect.x0 + 1, depth: rect.y1 - rect.y0 + 1 }
}

export function rectContainsCell(rect: LotGridRect, cell: LotCellPoint): boolean {
  return cell.gx >= rect.x0 && cell.gx <= rect.x1 && cell.gy >= rect.y0 && cell.gy <= rect.y1
}

export function parcelById(
  placement: LotPlacementProjection | null,
  parcelId: string,
): LotParcelState | null {
  if (placement === null) return null
  return placement.parcels.find((parcel) => parcel.id === parcelId) ?? null
}

/** The parcel whose rectangle owns a cell, or null for unclaimed ground. */
export function parcelAtCell(
  placement: LotPlacementProjection | null,
  cell: LotCellPoint,
): LotParcelState | null {
  if (placement === null) return null
  return placement.parcels.find((parcel) => rectContainsCell(parcel.rect, cell)) ?? null
}

export function blueprintById(
  placement: LotPlacementProjection | null,
  blueprintId: string,
): LotBlueprintState | null {
  if (placement === null) return null
  return placement.catalog.find((entry) => entry.blueprintId === blueprintId) ?? null
}

export function placementsOnParcel(
  placement: LotPlacementProjection | null,
  parcelId: string,
): LotPlacedFacilityState[] {
  if (placement === null) return []
  return placement.placements.filter((placed) => placed.parcelId === parcelId)
}

/**
 * Clamp a draft origin so the whole footprint stays inside its parcel.
 *
 * CorsixTH's blueprint rule, clean-room (Entry 3): SHRINK INTO BOUNDS, never slide the
 * rectangle somewhere the player did not point at. A footprint larger than the parcel
 * clamps to the parcel's own origin, which is exactly the origin whose quote will then
 * explain, cell by cell, why it does not fit.
 */
export function clampBuildOrigin(
  origin: LotCellPoint,
  rect: LotGridRect,
  footprint: { width: number; depth: number },
): LotCellPoint {
  const maxGx = Math.max(rect.x0, rect.x1 - footprint.width + 1)
  const maxGy = Math.max(rect.y0, rect.y1 - footprint.depth + 1)
  const gx = Number.isFinite(origin.gx) ? Math.round(origin.gx) : rect.x0
  const gy = Number.isFinite(origin.gy) ? Math.round(origin.gy) : rect.y0
  return {
    gx: Math.min(maxGx, Math.max(rect.x0, gx)),
    gy: Math.min(maxGy, Math.max(rect.y0, gy)),
  }
}

/** The footprint cells of a blueprint at an origin, in fixed reading order. */
export function footprintCellsAt(
  origin: LotCellPoint,
  footprint: { width: number; depth: number },
): LotCellPoint[] {
  const cells: LotCellPoint[] = []
  for (let dy = 0; dy < footprint.depth; dy++) {
    for (let dx = 0; dx < footprint.width; dx++) {
      cells.push({ gx: origin.gx + dx, gy: origin.gy + dy })
    }
  }
  return cells
}

/**
 * Where a fresh draft starts on a parcel: the first origin, in reading order, whose
 * footprint fits inside the parcel and touches nothing already placed. This is a
 * COURTESY, not a legality claim — the clearance ring, road frontage and severance
 * rules still belong to `queryPlacement`, which the caller runs on the result.
 */
export function defaultBuildOrigin(
  parcel: LotParcelState,
  footprint: { width: number; depth: number },
  placements: readonly LotPlacedFacilityState[],
): LotCellPoint {
  const occupied = new Set<string>()
  for (const placed of placements) {
    for (const cell of placed.cells) occupied.add(`${String(cell.gx)},${String(cell.gy)}`)
  }
  const maxGx = parcel.rect.x1 - footprint.width + 1
  const maxGy = parcel.rect.y1 - footprint.depth + 1
  for (let gy = parcel.rect.y0; gy <= maxGy; gy++) {
    for (let gx = parcel.rect.x0; gx <= maxGx; gx++) {
      const clear = footprintCellsAt({ gx, gy }, footprint).every(
        (cell) => !occupied.has(`${String(cell.gx)},${String(cell.gy)}`),
      )
      if (clear) return { gx, gy }
    }
  }
  return clampBuildOrigin({ gx: parcel.rect.x0, gy: parcel.rect.y0 }, parcel.rect, footprint)
}

/**
 * The identical-input early-out (Entry 2's cursor loop, Entry 3's byte-identical
 * blueprint check). A ghost re-queries ONLY when the tuple that determines its answer
 * actually changed; a mouse crossing forty pixels inside one cell changes nothing.
 *
 * `week` and `cash` are in the key because the same origin can flip between affordable
 * and not without the cursor moving at all.
 */
export function buildQuoteKey(
  blueprintId: string,
  origin: LotCellPoint,
  week: number,
  cash: number,
  movingPlacementId: number | null = null,
): string {
  return [
    blueprintId,
    String(origin.gx),
    String(origin.gy),
    String(week),
    String(cash),
    // A move and a build of the same blueprint at the same origin are DIFFERENT
    // questions — the mover's own cells are excluded from one and not the other — so
    // they must never share a memo key.
    movingPlacementId === null ? 'new' : `move:${String(movingPlacementId)}`,
  ].join('|')
}

/**
 * Clamp a MOVE's origin so the whole footprint stays on the addressable property.
 *
 * Deliberately NOT clamped into a parcel: a move may be pointed at any ground at all,
 * including ground the studio does not own or may not build on, because the quote's own
 * per-cell verdicts are how a player learns where a building may stand. The only thing
 * clamped is the grid itself, so the ghost can never be pointed off the world.
 */
export function clampMoveOrigin(
  origin: LotCellPoint,
  bounds: { width: number; depth: number },
  footprint: { width: number; depth: number },
): LotCellPoint {
  return clampBuildOrigin(
    origin,
    { x0: 0, y0: 0, x1: Math.max(0, bounds.width - 1), y1: Math.max(0, bounds.depth - 1) },
    footprint,
  )
}

/** The primary rejection in words, or null when the quote is legal. */
export function quoteRejectionText(quote: PlacementQuote | null): string | null {
  if (quote === null || quote.ok || quote.primary === null) return null
  return LOT_PLACEMENT_REJECTION_TEXT[quote.primary]
}

/**
 * The whole cost box for one quote: capital, construction clock, weekly running cost,
 * and the capacity it would add. This is the quote a Build button's enabled-state
 * belongs to (Entry 3: "confirm button enabled-ness IS the current phase's verdict").
 */
export function quoteFacts(quote: PlacementQuote | null): LotParcelFact[] {
  if (quote === null) return []
  return [
    { key: 'quote:cost', term: 'Capital cost', detail: moneyExact(quote.cost) },
    {
      key: 'quote:weeks',
      term: 'Construction clock',
      detail: `${String(quote.buildWeeks)} ${plural(quote.buildWeeks, 'week', 'weeks')} · completes Week ${String(quote.completesOnWeek)}`,
    },
    {
      key: 'quote:opex',
      term: 'Weekly running cost',
      detail: `${moneyExact(quote.weeklyOperatingCost)} once operational`,
    },
    {
      key: 'quote:capacity',
      term: 'Capacity added',
      detail: `+${String(quote.capacityDelta)} shared ${plural(quote.capacityDelta, 'slot', 'slots')}`,
    },
  ]
}

/** The one-shot receipt a committed placement earns. */
export function buildReceiptText(quote: PlacementQuote, blueprintName: string): string {
  return `${moneyExact(quote.cost)} committed to ${blueprintName}. Construction completes in Week ${String(quote.completesOnWeek)}.`
}

function placedStatusLine(placed: LotPlacedFacilityState, currentWeek: number): string {
  if (placed.status === 'operational') {
    return `${placed.name} is operational — ${moneyExact(placed.weeklyOperatingCost)} a week to run.`
  }
  const done = Math.round(placed.progress01 * (placed.completesWeek - placed.placedWeek))
  const total = placed.completesWeek - placed.placedWeek
  const remaining = Math.max(0, placed.completesWeek - currentWeek)
  return `${placed.name} is under construction — ${String(done)} of ${String(total)} ${plural(total, 'week', 'weeks')} done, ${String(remaining)} to go.`
}

/**
 * Everything the in-world panel for one parcel shows.
 *
 * Strict-selector discipline, exactly as `buildingInspector.ts` states it: a parcel the
 * projection does not describe yields `null` and the caller keeps whatever context it
 * already had. Every fact printed here comes from the Engine's own placement view.
 */
export function lotParcelInspectorContext(
  placement: LotPlacementProjection | null,
  parcelId: string,
): LotParcelInspectorContext | null {
  const parcel = parcelById(placement, parcelId)
  if (placement === null || parcel === null) return null

  const placements = placementsOnParcel(placement, parcelId)
  const building = placements.filter((placed) => placed.status === 'underConstruction')
  const operational = placements.filter((placed) => placed.status === 'operational')
  const size = rectSize(parcel.rect)

  const status: LotParcelStatus =
    parcel.terrain !== 'buildable'
      ? 'blocked'
      : building.length > 0
        ? 'building'
        : operational.length > 0
          ? 'operational'
          : 'vacant'

  const facts: LotParcelFact[] = [
    {
      key: 'parcel:size',
      term: 'Ground',
      detail: `${String(size.width)} × ${String(size.depth)} cells · ${String(size.width * size.depth - parcel.occupiedCells)} free`,
    },
    {
      key: 'parcel:frontage',
      term: 'Road frontage',
      detail: parcel.roadFrontage ? 'Yes — trucks can reach this site' : 'None — no construction access',
    },
  ]
  for (const placed of placements) {
    facts.push({
      key: `parcel:placed:${String(placed.id)}`,
      term: placed.name,
      detail:
        placed.status === 'operational'
          ? `Operational since Week ${String(placed.completesWeek)} · ${moneyExact(placed.weeklyOperatingCost)}/week`
          : `Under construction · due Week ${String(placed.completesWeek)} · ${String(placed.weeksRemaining)} ${plural(placed.weeksRemaining, 'week', 'weeks')} left`,
    })
  }

  const affordableBlueprints = placement.catalog.filter((entry) => entry.affordable)
  const fits = placement.catalog.some(
    (entry) => entry.footprint.width <= size.width && entry.footprint.depth <= size.depth,
  )

  let canBuild = false
  let buildBlockedReason: string | null = null
  if (parcel.terrain !== 'buildable') {
    buildBlockedReason = 'This ground is protected — the studio does not build on it.'
  } else if (!placement.buildEnabled) {
    buildBlockedReason = 'Construction is unavailable until managed studio operations are active.'
  } else if (!fits) {
    buildBlockedReason = 'No blueprint in the catalog fits on this parcel.'
  } else if (!parcel.roadFrontage) {
    buildBlockedReason = 'This site has no road frontage; construction trucks cannot reach it.'
  } else if (affordableBlueprints.length === 0) {
    // Money never blocks the FLOW — the player may still open the catalog, see the
    // quote, and read the exact reason. It only blocks the commit.
    canBuild = true
  } else {
    canBuild = true
  }

  const statusLine =
    status === 'blocked'
      ? 'Protected ground. Nothing is built here.'
      : building.length > 0
        ? placedStatusLine(building[0]!, placement.currentWeek)
        : operational.length > 0
          ? placedStatusLine(operational[0]!, placement.currentWeek)
          : parcel.roadFrontage
            ? 'Open, graded ground on the studio’s own property.'
            : 'Open ground the studio owns, with no road frontage yet.'

  return {
    parcelId: parcel.id,
    label: parcel.label,
    role: PARCEL_ROLE[parcel.id] ?? 'Studio ground',
    status,
    statusLine,
    facts,
    placements,
    canBuild,
    buildBlockedReason,
  }
}
