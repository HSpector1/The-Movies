// ── Which bodies on this property are SOUNDSTAGES — derived, never enumerated ──
//
// Until C2a-M2 the lot answered that question from a two-entry table written by hand
// (`LOT_STAGE_BY_SOUNDSTAGE_ID` in the adapter, mirrored into four more closed
// vocabularies). A studio with a third soundstage did not render it: the adapter threw.
//
// The answer is now DERIVED from the two authorities that actually own it:
//
//   • `state.operations.facilities` — which facilities carry the `soundstage`
//     capability, and what the engine CALLS each of them ("Soundstage 7"). Per §3.1's
//     display-name ruling the engine name is the single spoken authority; nothing here
//     invents a stage name.
//   • the placement projection — which BODY stands for a facility the studio built.
//
// Two founding soundstages have no placement to derive from: they are authored PROPERTY,
// not builds (the C1-M1a structure/placement distinction), so their bodies are named by
// the frozen founding vocabulary below and by nothing else.
//
// Law 12 governs the gap: a soundstage facility with no body standing for it claims no
// place on the property at all. It is omitted from the derived list rather than being
// pointed at some other building — the same honesty `resolvePresenceSite` already keeps.
//
// This file imports nothing but types from its own leaf module, so the adapter (engine
// boundary), the snapshot selectors and the Phaser scenes can all read one answer.

import type {
  BuildingId,
  FoundingBuildingId,
  LotStageIdentity,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'

export type { LotStageIdentity }

/**
 * The two FOUNDING soundstage facilities and the authored bodies that are them.
 *
 * Frozen vocabulary, and deliberately closed: these two ids name authored property that
 * every pre-Flip studio starts with, and `stage-a`/`stage-b` are `FoundingBuildingId`s
 * that the world, the companion navigation, the first-movie journey and every accepted
 * receipt are written against. A THIRD stage is never added here — it is a placement, and
 * it derives its body from the placement projection like every other thing a studio built.
 */
export const FOUNDING_STAGE_BUILDING_ID: Readonly<Record<string, FoundingBuildingId>> = {
  'facility-soundstage-07': 'stage-a',
  'facility-soundstage-12': 'stage-b',
}

/** The founding soundstage bodies, in the order the world lays them out. */
export const FOUNDING_STAGE_BUILDING_IDS: readonly FoundingBuildingId[] = ['stage-a', 'stage-b']

/**
 * The founding Soundstage 7 body.
 *
 * Named rather than spelled `'stage-a'` at each use so that a selector which genuinely
 * means "Soundstage 7 and only Soundstage 7" reads as a decision instead of a literal
 * somebody forgot to generalise (see `sceneryLoadIn.ts` / `stage7Production.ts`, whose
 * accepted specs assert that exact narrowness).
 */
export const FOUNDING_STAGE_SEVEN_BUILDING_ID = 'stage-a' as const satisfies FoundingBuildingId

/** The capability that makes a facility a soundstage. The engine's own term. */
export const SOUNDSTAGE_CAPABILITY = 'soundstage'

/** The narrow facility facts the derivation reads. Structurally satisfied by the engine's. */
export type StageIdentityFacility = {
  id: string
  name: string
  capability: string
}

/** The narrow placement facts the derivation reads. Structurally satisfied by the projection. */
export type StageIdentityPlacement = {
  id: number
  facilityId: string
  parcelId: string
  status: 'underConstruction' | 'operational'
}

/** The id prefix a placed body is addressed by (mirrors `placedBuildingId`). */
const PLACED_BUILDING_ID_PREFIX = 'placed-'

/**
 * Every soundstage this studio has, in the engine's own facility order.
 *
 * `legacyAnnexParcelId` is the one piece of ground whose placement is NOT a first-class
 * body — the legacy Annex parcel paints its own lifecycle as `expansion` — so a placement
 * standing there is excluded exactly as the property projection excludes it.
 *
 * Contradictory truth is withheld, never resolved: two placements claiming one facility
 * id means the world cannot say which body that facility is, so it says nothing.
 */
export function deriveLotStageIdentities(
  facilities: readonly StageIdentityFacility[],
  placements: readonly StageIdentityPlacement[],
  legacyAnnexParcelId: string,
): LotStageIdentity[] {
  const identities: LotStageIdentity[] = []
  for (const facility of facilities) {
    if (facility.capability !== SOUNDSTAGE_CAPABILITY) continue
    if (typeof facility.id !== 'string' || facility.id.length === 0) continue
    const bodies = placements.filter(
      (placed) => placed.facilityId === facility.id && placed.parcelId !== legacyAnnexParcelId,
    )
    if (bodies.length > 1) continue
    const built = bodies[0]
    if (built !== undefined) {
      identities.push({
        facilityId: facility.id,
        facilityName: facility.name,
        buildingId: `${PLACED_BUILDING_ID_PREFIX}${String(built.id)}`,
        origin: 'placed',
        standing: built.status === 'operational',
      })
      continue
    }
    const founding = FOUNDING_STAGE_BUILDING_ID[facility.id]
    // Law 12: a soundstage with no body on this property claims no place on it.
    if (founding === undefined) continue
    identities.push({
      facilityId: facility.id,
      facilityName: facility.name,
      buildingId: founding,
      origin: 'founding',
      standing: true,
    })
  }
  return identities
}

/** The founding two, as full identities, for a snapshot that carries no `stages`. */
const FOUNDING_STAGE_FALLBACK: readonly LotStageIdentity[] = [
  {
    facilityId: 'facility-soundstage-07',
    facilityName: 'Soundstage 7',
    buildingId: 'stage-a',
    origin: 'founding',
    standing: true,
  },
  {
    facilityId: 'facility-soundstage-12',
    facilityName: 'Soundstage 12',
    buildingId: 'stage-b',
    origin: 'founding',
    standing: true,
  },
]

/**
 * The stage identities a snapshot carries, or the founding two when it carries none.
 *
 * The fallback is not a guess. `stages` is emitted only by managed operations; a legacy
 * snapshot (and every older hand-authored presentation fixture) describes a studio whose
 * stages are exactly the two authored founding bodies, which is what this returns.
 */
export function lotStageIdentities(snapshot: StudioLotSnapshot): readonly LotStageIdentity[] {
  const stages: unknown = snapshot.stages
  if (!Array.isArray(stages)) return FOUNDING_STAGE_FALLBACK
  const exact: LotStageIdentity[] = []
  for (const stage of stages) {
    if (typeof stage !== 'object' || stage === null) continue
    const candidate = stage as Partial<LotStageIdentity>
    if (typeof candidate.buildingId !== 'string' || candidate.buildingId.length === 0) continue
    exact.push(candidate as LotStageIdentity)
  }
  return exact
}

/** Every body on this property that is a soundstage, in world order. */
export function lotStageBuildingIds(snapshot: StudioLotSnapshot): readonly BuildingId[] {
  return lotStageIdentities(snapshot).map((stage) => stage.buildingId)
}

/** Whether one world id is a soundstage of THIS studio. */
export function isLotStageBuildingId(snapshot: StudioLotSnapshot, id: unknown): id is BuildingId {
  return typeof id === 'string' && lotStageBuildingIds(snapshot).includes(id)
}

/** The identity of one stage body, or null when this studio has no such stage. */
export function lotStageIdentityFor(
  snapshot: StudioLotSnapshot,
  id: BuildingId,
): LotStageIdentity | null {
  const matches = lotStageIdentities(snapshot).filter((stage) => stage.buildingId === id)
  // Two identities on one body is contradictory truth: name neither.
  return matches.length === 1 ? matches[0]! : null
}
