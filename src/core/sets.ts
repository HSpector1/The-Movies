// ── Sets — the V14 root, and the founding endowment (charter §3.1) ───────────
//
// A Soundstage is a buildable FACILITY; a Set is a first-class ENTITY; shooting
// requires both. This module owns the Set root's empty/initial values and the
// minimal `SET_TYPES` vocabulary the endowment needs.
//
// SCOPE AT M1, stated plainly so the next milestone does not have to guess: this
// milestone lands the SCHEMA and the ENDOWMENT. It does not land set
// construction, repair, striking, binding, uplift, novelty depletion, or
// condition wear — those are M2, and every one of them is a TUNING family with
// bounded-term tests attached. What is here is exactly what the V14 migrator and
// `activateStudioOperations` must be able to produce.
//
// THE ENDOWMENT IS A COMPATIBILITY DEVICE, not permanent founding law (owner
// ruling `00E`.12). It exists so migrated saves, the sealed First-Movie-Journey
// fixtures, pre-Flip C2a, and the bounded harnesses keep working across the V14
// bump — founding capacity stays EXACTLY today's (2 stages, 2 sets, scenery 2,
// dev/casting 2, post 2), so every sealed spec runs unmodified and contention
// still begins with the third picture. Once the bare-start experience lands
// (C2b), fresh games start bare and build their own sets, and the fixtures adapt
// rather than the product law weakening.
//
// This module is pure data + total functions: no RNG, no clock, no I/O.

import { GENRE_ORDER, TUNING } from './tuning.js'
import type { Genre, StudioSet } from './types.js'

/**
 * The CLOSED authored location vocabulary (charter §9). A `BlueprintBeat`'s
 * `requiredSetType` resolves against it, which is why it has to be closed: a beat
 * demanding a location that no blueprint can ever satisfy is an unrelievable
 * queue reason, and owner law 2 forbids those.
 *
 * M1 authors the ONE starter entry the endowed house sets are built from. M2
 * authors the full list, because M3's beats consume it — that ordering is the
 * lane-14 interface dependency, joined at M2 on purpose.
 */
export const SET_TYPES = Object.freeze(['generic-interior'] as const)

export type KnownSetTypeId = (typeof SET_TYPES)[number]

/** The starter entry: the undressed stage interior every house set is. */
export const STARTER_SET_TYPE: KnownSetTypeId = SET_TYPES[0]

/**
 * The blueprint id the two endowed house sets carry. The catalog itself (costs,
 * durations, attractiveness, per-genre weights as DATA) is M2's; the id is fixed
 * now so a migrated save and a newly activated studio name the same thing and no
 * later catalog correction can rewrite what has already been endowed.
 */
export const HOUSE_SET_BLUEPRINT_ID = 'set-house-generic'

/** The stages the endowment mounts on, in the order the sets are minted. */
export const ENDOWED_HOUSE_SET_STAGES: readonly { facilityId: string; name: string }[] =
  Object.freeze([
    Object.freeze({ facilityId: 'facility-soundstage-07', name: 'Stage 7 House Set' }),
    Object.freeze({ facilityId: 'facility-soundstage-12', name: 'Stage 12 House Set' }),
  ])

/** The set-id format. Monotonic, never recycled, never rolled back (§8.1). */
export function setId(ordinal: number): string {
  return `set-${String(ordinal)}`
}

/** NEUTRAL genre weights: the same weight on every genre, so the house set favours nothing. */
export function neutralGenreWeights(): Record<Genre, number> {
  const weights = {} as Record<Genre, number>
  for (const genre of GENRE_ORDER) weights[genre] = TUNING.HOUSE_SET_GENRE_WEIGHT
  return weights
}

/**
 * The TWO generic house sets a managed studio is founded with, in mint order.
 * `nextSetId` is therefore 2 afterwards — ordinals 0 and 1 are consumed and can
 * never be handed out again.
 *
 * `completesWeek` is null and `status` is `'standing'`: these sets were not
 * built, they were endowed, and claiming a completion week the studio never
 * lived would be a fact nobody could check.
 */
export function endowedHouseSets(): StudioSet[] {
  return ENDOWED_HOUSE_SET_STAGES.map((stage, ordinal) => ({
    id: setId(ordinal),
    name: stage.name,
    blueprintId: HOUSE_SET_BLUEPRINT_ID,
    mountedOn: stage.facilityId,
    setType: STARTER_SET_TYPE,
    status: 'standing' as const,
    completesWeek: null,
    quality: TUNING.HOUSE_SET_QUALITY,
    novelty: TUNING.SET_NOVELTY_INITIAL,
    condition: TUNING.SET_CONDITION_INITIAL,
    genreWeights: neutralGenreWeights(),
    priorityGenre: TUNING.HOUSE_SET_PRIORITY_GENRE,
  }))
}

/** The next set ordinal a managed studio hands out after the endowment. */
export const ENDOWED_NEXT_SET_ID = ENDOWED_HOUSE_SET_STAGES.length
