// ── Lot navigation contract ───────────────────────────────────────────────────
//
// The narrow set of deep-management NAVIGATION INTENTIONS the lot can express, and how each maps to
// an existing app route. World-native interactions may be owned directly by the React host:
// the Phaser layer emits a LotActionKind; the React host translates it here into a
// LotRoute and calls the existing screen navigation. Resolving one of these route values never
// spends money, advances time, greenlights, hires, or mutates GameState — these compatibility
// mappings are navigation only.
//
// Every route targets a screen that exists OUTSIDE the lot, so every lot destination
// stays reachable without the lot.

import type { BuildingId, LotActionKind } from './snapshot/StudioLotSnapshot'
import { BUILDING_ACTION } from './snapshot/StudioLotSnapshot'

/** Existing app destinations a lot intent can open. */
export type LotRoute =
  | { kind: 'dashboard' } // overview + finances section + in-production + recent releases
  | { kind: 'castingRoom' } // Casting Sessions workspace
  | { kind: 'roster' } // Studio Roster
  | { kind: 'hiring' } // Hiring Market
  | { kind: 'hub' } // Talent Hub (read-only browse)
  | { kind: 'assembly' } // Assemble a Film wizard
  | { kind: 'saves' } // Saves
  | { kind: 'studioDevelopment' } // complete deep surface; lot also owns a bounded world-native start

export type LotActionResolution = {
  route: LotRoute
  /** Canonical navigation label (addendum §9), naming the real destination. */
  navLabel: string
}

/**
 * LotActionKind → route + canonical nav label.
 *
 * Finances, "In production", and "Recent releases" are SECTIONS of the single
 * `dashboard` screen (there is no dedicated finances/productions/releases screen in
 * the D-12 UI), so `review-productions` and `view-released-films` resolve to the
 * dashboard. Documented D1 behaviour, not a placeholder.
 */
export const ACTION_RESOLUTION: Record<LotActionKind, LotActionResolution> = {
  'open-studio-overview': { route: { kind: 'dashboard' }, navLabel: 'Open Dashboard' },
  'assemble-film': { route: { kind: 'assembly' }, navLabel: 'Assemble a Film' },
  'browse-talent': { route: { kind: 'castingRoom' }, navLabel: 'Open Casting Room' },
  'review-productions': { route: { kind: 'dashboard' }, navLabel: 'View Production' },
  'view-released-films': { route: { kind: 'dashboard' }, navLabel: 'View Releases' },
  // Compatibility/deep-management route. Physical parcel and companion activation are intercepted
  // by StudioLotScreen and remain in the live world under the World-First Annex V1 contract.
  'view-expansion': { route: { kind: 'studioDevelopment' }, navLabel: 'Open Studio Development' },
}

export function resolveAction(action: LotActionKind): LotActionResolution {
  return ACTION_RESOLUTION[action]
}

export function routeForBuilding(id: BuildingId): LotRoute {
  return ACTION_RESOLUTION[BUILDING_ACTION[id]].route
}

/** Concise, non-mechanic building descriptions (addendum §5/§8 canonical language). */
export const BUILDING_BLURBS: Record<BuildingId, string> = {
  gate: 'The studio entrance and overview.',
  admin: 'Studio finances, standing, and the week.',
  casting: 'Plan camera tests, review audition evidence, and take a screenplay to package.',
  writers: 'Develop and assemble your next film.',
  'stage-a': 'Soundstage A.',
  'stage-b': 'Soundstage B.',
  post: 'Films currently in production.',
  theater: 'Your releases and what is in theaters.',
  expansion: 'The fixed parcel for the Development & Casting Annex.',
}
