// ── Build Catalog UX (C1-M5) — the studio's own list of what it can build ────
//
// M2-UI's build flow offered ONE card because the catalog held one blueprint. It holds
// five now, each with a real effect, and the surface has to become the thing the Owner
// asked for: a list a player BROWSES, COMPARES and REJECTS from — "these are buildings
// I chose", not a menu of sprites.
//
// This module is the whole of the list's thinking, and it is PURE. It owns no legality:
// every FACT below is the engine's own answer. What it owns is the order those facts are
// told in, which is a question about a player reading a list rather than about the rule
// engine — see `LotCatalogEntryState` for the one place that order deliberately differs
// from `PLACEMENT_REJECTION_ORDER`, and why. It writes no description either:
// `effectSummary` is authored TUNING and is shown verbatim, because the one place that
// knows what a building does is the place that gave it its effect.
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
 * Why an entry cannot be started.
 *
 * `at-limit` outranks `locked` outranks `unaffordable`.
 *
 * C1-M8 RULING — a ruled evolution of the M5 order, not a weakening of it. M5 put
 * `locked` first, mirroring `PLACEMENT_REJECTION_ORDER`'s `requirementsUnmet` →
 * `instanceLimit` → `insufficientFunds`, and that is still the right order for the
 * two cases it was written for. But an OWNED entry at its allowance can also be
 * locked, and then the catalog contradicted the studio's own lot: with a
 * Development Office III standing and the II demolished, the III row read LOCKED ·
 * "Requires an operational Development Office II." · 1 owned — the catalog telling
 * a player that the building they are operating needs a prerequisite they do not
 * have. Owning one is the larger and more useful fact: a requirement can only ever
 * gate the NEXT one, and the allowance says there will not be a next one.
 *
 * Money stays last, exactly as the engine binds it: a domain answer never hides
 * behind affordability.
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
  /** The engine capability this building supplies. Decides what its capacity is CALLED. */
  capability: string
  /**
   * C2a-M2 — what the capacity IS, in the words the building's own effect sentence
   * uses, or null when the building supplies no shared capacity at all.
   *
   * The row used to read "+1 shared slot" for every capability, which was already
   * loose for a cutting room and became untrue the moment the catalog gained a
   * Soundstage: a stage is not a shared slot, it is a stage, and it carries one
   * picture at a time. See `capacityPhrase`.
   */
  capacityLabel: string | null
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
  /**
   * C1-M8 — the sentence that qualifies an effect the studio would not actually
   * get, or null. Present whenever the engine names a superseding operational
   * building, whatever the entry's state: it is a correction to the PROMISE, not
   * another reason the entry is blocked.
   */
  supersededNote: string | null
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

/**
 * The sentence for an effect a higher tier is already delivering (C1-M8).
 *
 * The catalog does not decide the FACT — the engine's effects authority does, and
 * publishes the superseding building's name — it only says it in the studio's own
 * words, beside the effect sentence it qualifies. "Would add nothing" is exactly
 * what the tier rule means: highest tier wins, and nothing stacks.
 */
export function supersededNoteFor(supersededBy: string): string {
  return `Superseded while ${supersededBy} stands — building it would add nothing.`
}

/**
 * What a building's capacity is CALLED, per capability (C2a-M2).
 *
 * Every phrase here is taken from the engine's OWN effect sentence for buildings of
 * that capability — "cutting rooms", "scenery crews", "Development & Casting slots",
 * "one more picture can shoot at a time" — so the compact facts line and the effect
 * line beneath it can never describe the same capacity with two different words.
 *
 * A SOUNDSTAGE IS NOT A SHARED SLOT. Its capacity field is
 * `simultaneousProductions`, and a stage carries one picture at a time; calling that
 * a slot was engine language standing in for a filmmaking fact, which the 00F floor
 * forbids at exactly this kind of comparison surface.
 *
 * An unknown capability returns null rather than a guess: a catalog that invented a
 * word for a building it does not understand would be worse than a silent row.
 */
export function capacityPhrase(capability: string, capacity: number): string | null {
  if (!Number.isInteger(capacity) || capacity <= 0) return null
  const many = capacity !== 1
  switch (capability) {
    case 'soundstage':
      return capacity === 1
        ? 'carries 1 picture at a time'
        : `carries ${String(capacity)} pictures at a time`
    case 'post':
      return `+${String(capacity)} cutting ${many ? 'rooms' : 'room'}`
    case 'set-scenery':
      return `+${String(capacity)} scenery ${many ? 'crews' : 'crew'}`
    case 'development-casting':
      return `+${String(capacity)} Development & Casting ${many ? 'slots' : 'slot'}`
    default:
      return null
  }
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
 * ONE catalog entry, in the binding order above.
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
    entry.atInstanceLimit === true
      ? 'at-limit'
      : entry.available === false || unmet.length > 0
        ? 'locked'
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
    capability: isText(entry.capability) ? entry.capability : '',
    capacityLabel: isText(entry.capability)
      ? capacityPhrase(entry.capability, isCount(entry.capacity) ? entry.capacity : 0)
      : null,
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
    supersededNote: isText(entry.supersededBy) ? supersededNoteFor(entry.supersededBy) : null,
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
