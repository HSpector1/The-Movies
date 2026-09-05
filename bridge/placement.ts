// ── P09 §18 — the placement quote family: preview → text + geometry validity → commit ──
//
// The ONE conversion from a player's Build selections (a blueprint at an origin
// cell) to the engine's legality authority, and the ONE quote snapshot Unity
// renders verbatim. Everything here is a direct read of `queryPlacement`: cells,
// per-cell verdicts, cost, operating cost, weeks, completion week, capability,
// capacity delta, the ordered rejections and their primary, unmet requirements,
// instance count/limit. Unity never infers legality from colliders; the caller
// never supplies a price or a duration; a preview mutates nothing.
//
// An ILLEGAL preview is an accepted answer with `ok:false` and NO REGISTERED
// intent (its id is minted for the wire's shared identity slot but the authority
// never accepts it) — the world shows shape + icon + reason text (P09-REQ-015),
// never colour alone. A legal preview registers the ONE digest-bound
// `placeFacility` intent; the commit path re-asks the same authority against
// the live state and charges the engine's own price exactly once (P09-REQ-017).
import {
  blueprintById,
  canAfford,
  parcelReservedBlueprintId,
  queryPlacement,
  type GameState,
  type PlacementQuote,
  type PlacementRejection,
} from '../src/core/index.ts'
import { applyActions } from '../src/core/index.ts'
import type { ActionOutcome } from '../ui/src/engine/adapter.ts'
import type {
  BridgePlacementDraftPayload,
  BridgePlacementQuoteSnapshot,
} from './schema/bridge-schema.ts'

export type PlacementDraftConversion =
  | {
      ok: true
      kind: 'placeFacility'
      apply: (state: GameState) => ActionOutcome
      commitLabel: string
      quote: PlacementQuote
    }
  | { ok: false; error: string }

/**
 * The player-facing headline for each rejection code — Package 09 §26.1 verbatim
 * (C1-M5 copy discipline: no engine terms). Three headlines carry a fact the quote
 * knows (the reserved purpose, the unmet requirement, the cost); those are filled
 * by `placementRejectionHeadline`, and this table holds their bare form.
 */
export const PLACEMENT_REJECTION_COPY: Readonly<Record<PlacementRejection, string>> = Object.freeze({
  unknownBlueprint: 'This facility is no longer available.',
  offLot: 'Outside the studio property.',
  notOwned: 'This ground is not owned.',
  terrainUnbuildable: 'This parcel cannot support construction.',
  groundReserved: 'Reserved ground.',
  occupied: 'Overlaps an existing structure or facility.',
  clearanceRing: 'Needs clearance from a neighboring facility.',
  noRoadAccess: 'Construction needs road access.',
  seversLot: 'This site would cut off lot circulation.',
  requirementsUnmet: 'Requirement not met.',
  instanceLimit: 'The studio already owns the allowed number.',
  insufficientFunds: 'The studio cannot cover this cost this week.',
})

function dollars(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

/**
 * The §26.1 headline for ONE rejection against ONE quote, with the fact the
 * authority published filled in where the design names one:
 *   • `groundReserved`  → `Reserved ground: <authoritative purpose>.` when the origin
 *                         parcel's reservation is known;
 *   • `requirementsUnmet` → `Requirement not met: <exact requirement>.`;
 *   • `insufficientFunds` → `The studio cannot cover <cost> this week.`
 * Everything else is the bare table sentence. Never invents a name the quote lacks.
 */
export function placementRejectionHeadline(
  rejection: PlacementRejection,
  quote: Pick<PlacementQuote, 'parcelId' | 'unmetRequirements' | 'cost'>,
): string {
  switch (rejection) {
    case 'groundReserved': {
      const reservedId = quote.parcelId === null ? null : parcelReservedBlueprintId(quote.parcelId)
      const reserved = reservedId === null ? null : blueprintById(reservedId)
      return reserved === null ? PLACEMENT_REJECTION_COPY.groundReserved : `Reserved ground: ${reserved.name}.`
    }
    case 'requirementsUnmet': {
      const first = quote.unmetRequirements[0]
      return first === undefined
        ? PLACEMENT_REJECTION_COPY.requirementsUnmet
        : `Requirement not met: ${first.reason.replace(/\.$/, '')}.`
    }
    case 'insufficientFunds':
      return `The studio cannot cover ${dollars(quote.cost)} this week.`
    default:
      return PLACEMENT_REJECTION_COPY[rejection]
  }
}

/**
 * The ONLY conversion from a placement draft to the engine. A refusal here is a
 * player-facing sentence about the DRAFT (an unknown verb, an unknown
 * blueprint); every legality question is the engine's own and rides in the
 * quote, which is why an illegal spot still converts `ok:true` — the quote
 * carries the verdict and no `apply` will ever be handed a commit intent for it.
 */
export function placementDraftToEngine(
  state: GameState,
  draft: BridgePlacementDraftPayload,
): PlacementDraftConversion {
  if (draft.verb !== 'build') {
    return { ok: false, error: 'Only new construction can be quoted in this version.' }
  }
  const blueprint = blueprintById(draft.blueprintId)
  if (blueprint === null) {
    return { ok: false, error: PLACEMENT_REJECTION_COPY.unknownBlueprint }
  }
  const request = { blueprintId: draft.blueprintId, origin: { gx: draft.origin.gx, gy: draft.origin.gy } }
  const quote = queryPlacement(state, request)
  return {
    ok: true,
    kind: 'placeFacility',
    commitLabel: `BUILD ${blueprint.name.toUpperCase()} — ${dollars(blueprint.capex)}`,
    quote,
    apply: (current: GameState): ActionOutcome => {
      try {
        return { ok: true, next: applyActions(current, [{ kind: 'placeFacility', placement: request }]) }
      } catch (e) {
        return { ok: false, error: (e as Error).message }
      }
    },
  }
}

/**
 * The quote Unity renders verbatim. The intent id is minted for every preview
 * (the union's shared identity slot) but REGISTERED for commit only when the
 * placement is legal — `ok` is the commit truth, and an illegal id submitted
 * anyway is refused as not available.
 */
export function placementQuoteSnapshot(
  state: GameState,
  draft: BridgePlacementDraftPayload,
  conversion: Extract<PlacementDraftConversion, { ok: true }>,
  intentId: string,
): BridgePlacementQuoteSnapshot {
  const { quote } = conversion
  const blueprint = blueprintById(draft.blueprintId)
  const cashBefore = Math.round(state.studio.cash)
  const affordable = canAfford(state, quote.cost).ok
  const primary = quote.primary
  const consequence = quote.ok
    ? `Costs ${dollars(quote.cost)} now and ${dollars(quote.weeklyOperatingCost)} a week once open; ` +
      `opens in week ${String(quote.completesOnWeek)} (${String(quote.buildWeeks)} weeks). ` +
      (quote.capability === null
        ? 'It has an effect but adds no shared capacity.'
        : `Adds ${String(quote.capacityDelta)} ${quote.capability} capacity.`)
    : (primary === null ? 'This placement is not legal here.' : placementRejectionHeadline(primary, quote)) +
      (quote.unmetRequirements.length > 1
        ? ' ' + quote.unmetRequirements.slice(1).map((entry) => entry.reason).join(' ')
        : '')
  return {
    intentId,
    kind: 'placeFacility',
    commitLabel: conversion.commitLabel,
    startsNow: quote.ok,
    queues: false,
    queueNote: null,
    ok: quote.ok,
    blueprintId: quote.blueprintId,
    name: blueprint?.name ?? quote.blueprintId,
    effectSummary: blueprint?.effectSummary ?? 'This building is not in the catalogue.',
    origin: { gx: quote.origin.gx, gy: quote.origin.gy },
    footprint: blueprint === null
      ? { width: 1, depth: 1 }
      : { width: blueprint.footprint.width, depth: blueprint.footprint.depth },
    parcelId: quote.parcelId,
    cells: quote.cells.map((cell) => ({ gx: cell.gx, gy: cell.gy })),
    cellLegality: quote.cellLegality.map((verdict) => ({
      cell: { gx: verdict.cell.gx, gy: verdict.cell.gy },
      ok: verdict.ok,
      rejection: verdict.rejection,
    })),
    cost: quote.cost,
    weeklyOperatingCost: quote.weeklyOperatingCost,
    buildWeeks: quote.buildWeeks,
    completesOnWeek: quote.completesOnWeek,
    capability: quote.capability,
    capacityDelta: quote.capacityDelta,
    rejections: [...quote.rejections],
    primary,
    primaryReason: primary === null ? null : placementRejectionHeadline(primary, quote),
    unmetRequirements: quote.unmetRequirements.map((entry) => ({
      kind: entry.requirement.kind,
      reason: entry.reason,
      notYetAttainable: entry.notYetAttainable,
    })),
    instanceCount: quote.instanceCount,
    maxInstances: quote.maxInstances,
    cashBefore,
    cashAfter: cashBefore - quote.cost,
    affordable,
    consequence,
  }
}
