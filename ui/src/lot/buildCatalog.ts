// ── Build Catalog UX (C1-M5) — the studio's own list of what it can build ────
//
// M2-UI's build flow offered ONE card because the catalog held one blueprint. It holds
// five now, each with a real effect, and the surface has to become the thing the Owner
// asked for: a list a player BROWSES, COMPARES and REJECTS from — "these are buildings
// I chose", not a menu of sprites.
//
// This module is the whole of the list's thinking, and it is PURE. It owns no legality:
// every state below is the engine's own answer, re-stated in the order the engine binds
// them. It writes no description either — `effectSummary` is authored TUNING and is
// shown verbatim, because the one place that knows what a building does is the place
// that gave it its effect.
//
// The 2005 Facilities panel is the FEEL this matches, not the skin: every entry visible
// at once with its price, how many you own, and what it is for — so the decision is made
// by comparing, not by clicking through.

import type {
  LotBlueprintState,
  LotBlueprintUnmet,
  LotPlacementProjection,
} from './snapshot/StudioLotSnapshot.ts'
import { LOT_PLACEMENT_REJECTION_TEXT } from './buildMode.ts'
import { moneyExact } from '../format.ts'

/**
 * Why an entry cannot be started, in the ENGINE's own binding order.
 *
 * `locked` outranks `at-limit` outranks `unaffordable`, which is exactly the order
 * `PLACEMENT_REJECTION_ORDER` binds `requirementsUnmet` → `instanceLimit` →
 * `insufficientFunds`. A studio that is both locked out and broke is told the domain
 * reason, because that is the one it has to solve first.
 */
export type LotCatalogEntryState = 'buildable' | 'locked' | 'at-limit' | 'unaffordable'

export type LotCatalogEntry = {
  blueprintId: string
  name: string
  /** The engine's authored sentence. Shown verbatim; never re-worded here. */
  effectSummary: string
  cost: number
  buildWeeks: number
  weeklyOperatingCost: number
  capacity: number
  footprint: { width: number; depth: number }
  state: LotCatalogEntryState
  /** One short word for the state, for the badge. */
  stateLabel: string
  /** "2 owned · 1 building", or null when the studio has none. */
  ownedLabel: string | null
  owned: { operational: number; underConstruction: number }
  /** Every unmet requirement's sentence, in authored order. Empty unless locked. */
  lockReasons: LotBlueprintUnmet[]
  /** The allowance sentence, or null. Present only when `at-limit`. */
  limitReason: string | null
  /** The money sentence, or null. Present only when `unaffordable`. */
  affordabilityReason: string | null
  /** May the player start a draft from this entry right now? */
  selectable: boolean
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

/** "1 owned", "2 owned · 1 building", "1 building" — or null for none at all. */
export function ownedLabelFor(owned: { operational: number; underConstruction: number }): string | null {
  const parts: string[] = []
  if (owned.operational > 0) parts.push(`${String(owned.operational)} owned`)
  if (owned.underConstruction > 0) parts.push(`${String(owned.underConstruction)} building`)
  return parts.length === 0 ? null : parts.join(' · ')
}

/** The allowance sentence for an entry whose allowance is used up. */
export function instanceLimitReason(entry: LotBlueprintState): string {
  const allowance = entry.maxInstances
  if (allowance === null) return LOT_PLACEMENT_REJECTION_TEXT.instanceLimit
  return allowance === 1
    ? 'The studio builds only one of these, and it already has it.'
    : `The studio builds at most ${String(allowance)} of these, and it already has them.`
}

/**
 * ONE catalog entry, in the order the engine binds its refusals.
 *
 * A malformed entry is not rendered as a broken row: it is refused entirely, exactly
 * as every other strict projection in the lot refuses a fact group it cannot prove.
 */
export function lotCatalogEntry(entry: LotBlueprintState): LotCatalogEntry | null {
  if (!isText(entry.blueprintId) || !isText(entry.name)) return null
  if (!isText(entry.effectSummary)) return null
  if (!isCount(entry.buildWeeks) || entry.buildWeeks <= 0) return null
  if (typeof entry.cost !== 'number' || !Number.isFinite(entry.cost)) return null
  if (typeof entry.weeklyOperatingCost !== 'number') return null

  const unmet = Array.isArray(entry.unmet) ? entry.unmet : []
  const owned = {
    operational: isCount(entry.owned?.operational) ? entry.owned.operational : 0,
    underConstruction: isCount(entry.owned?.underConstruction) ? entry.owned.underConstruction : 0,
  }

  const state: LotCatalogEntryState =
    entry.available === false || unmet.length > 0
      ? 'locked'
      : entry.atInstanceLimit === true
        ? 'at-limit'
        : entry.affordable === false
          ? 'unaffordable'
          : 'buildable'

  return {
    blueprintId: entry.blueprintId,
    name: entry.name,
    effectSummary: entry.effectSummary,
    cost: entry.cost,
    buildWeeks: entry.buildWeeks,
    weeklyOperatingCost: entry.weeklyOperatingCost,
    capacity: isCount(entry.capacity) ? entry.capacity : 0,
    footprint: {
      width: entry.footprint?.width ?? 0,
      depth: entry.footprint?.depth ?? 0,
    },
    state,
    stateLabel:
      state === 'buildable'
        ? 'Available'
        : state === 'locked'
          ? 'Locked'
          : state === 'at-limit'
            ? 'Built'
            : 'Too expensive',
    ownedLabel: ownedLabelFor(owned),
    owned,
    // The engine's sentences, verbatim and in authored order, so the list never churns.
    lockReasons: state === 'locked' ? unmet.map((row) => ({ ...row })) : [],
    limitReason: state === 'at-limit' ? instanceLimitReason(entry) : null,
    affordabilityReason:
      state === 'unaffordable'
        ? `${moneyExact(entry.cost)} is more than the studio can commit this week.`
        : null,
    // ONLY a buildable entry starts a draft. A locked or spent entry is readable —
    // that is the whole point of a catalog — but it is never a way in.
    selectable: state === 'buildable',
  }
}

/**
 * The whole catalog, in the engine's own order.
 *
 * Order is the ENGINE's authored order, not alphabetical and not sorted by price: it is
 * the order the studio's own catalog is written in, and a list that re-sorted itself as
 * a studio's cash moved would make a player re-find the entry they were reading.
 */
export function lotBuildCatalog(
  placement: LotPlacementProjection | null | undefined,
): LotCatalogEntry[] {
  const catalog = placement?.catalog
  if (!Array.isArray(catalog)) return []
  const entries: LotCatalogEntry[] = []
  const seen = new Set<string>()
  for (const raw of catalog) {
    const entry = lotCatalogEntry(raw)
    if (entry === null) continue
    // Two rows claiming one blueprint is contradictory truth: keep neither.
    if (seen.has(entry.blueprintId)) continue
    seen.add(entry.blueprintId)
    entries.push(entry)
  }
  return entries
}

/** The catalog row for one blueprint, or null. Never guesses. */
export function lotCatalogEntryFor(
  placement: LotPlacementProjection | null | undefined,
  blueprintId: string,
): LotCatalogEntry | null {
  const matches = lotBuildCatalog(placement).filter((entry) => entry.blueprintId === blueprintId)
  return matches.length === 1 ? matches[0]! : null
}
