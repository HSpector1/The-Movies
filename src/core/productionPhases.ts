// ── Production phase machinery — THE single source ───────────────────────────
// Charter §12-M0: "the phase→capability duplicate tables single-sourced with an
// agreement test (a scaffold pinning the V13 table — M2 replaces it with the
// bindings-aware form)."
//
// WHY THIS MODULE EXISTS. Three facts about a managed production were written
// down twice, in two files that cannot see each other:
//
//   * `remainingTicks → phase`  — `operations.ts` (throwing) and `save.ts`
//     (null-returning, inside the V8 operations validator);
//   * `phase → required capabilities` — `operations.ts:requirementsForPhase` and
//     `save.ts:REQUIRED_CAPABILITIES`;
//   * `phase → next phase` — implicit in `operations.ts`, tabled in
//     `save.ts:NEXT_PHASE`.
//
// Two copies of the same table is two tables. C2 is about to change what a phase
// requires (a bound SET at shooting, §3.2), and a save validator that quietly
// disagrees with the allocator would accept states the engine can never produce
// — or refuse states it does. So the tables move HERE and both sides consume
// them. Nothing else about either caller changes: the throwing and the
// null-returning readings are both preserved, byte-for-byte, as two named
// functions over one table.
//
// This module is pure data + total functions. It imports no state, consumes no
// RNG, and depends on nothing but `types.js`.

import type { FacilityCapability, ProductionPhase } from './types.js'

/**
 * The eight-week managed production countdown, phase by phase. `remainingTicks`
 * counts DOWN from PRODUCTION_TICKS (8) to 1; 0 means "released this advance"
 * and owns no phase.
 *
 * This is the V13 table verbatim. M2 replaces it with the bindings-aware form.
 */
const PHASE_BY_REMAINING_TICKS: Readonly<Partial<Record<number, ProductionPhase>>> = Object.freeze({
  8: 'development',
  7: 'preProduction',
  6: 'rehearsal',
  5: 'shooting',
  4: 'shooting',
  3: 'postProduction',
  2: 'postProduction',
  1: 'releaseReady',
})

/**
 * What each phase must hold to be IN that phase. The exact-multiset law
 * (`operations.ts`) reads this as an equality, not a floor: a workflow holds
 * exactly these capabilities and no others.
 */
const REQUIRED_CAPABILITIES_BY_PHASE: Readonly<
  Record<ProductionPhase, readonly FacilityCapability[]>
> = Object.freeze({
  development: Object.freeze(['development-casting']) as readonly FacilityCapability[],
  preProduction: Object.freeze(['development-casting']) as readonly FacilityCapability[],
  rehearsal: Object.freeze(['soundstage']) as readonly FacilityCapability[],
  shooting: Object.freeze(['soundstage', 'set-scenery']) as readonly FacilityCapability[],
  postProduction: Object.freeze(['post']) as readonly FacilityCapability[],
  releaseReady: Object.freeze([]) as readonly FacilityCapability[],
})

/** The scheduled successor of each phase. `releaseReady` has none — it releases. */
const NEXT_PHASE_BY_PHASE: Readonly<Partial<Record<ProductionPhase, ProductionPhase>>> =
  Object.freeze({
    development: 'preProduction',
    preProduction: 'rehearsal',
    rehearsal: 'shooting',
    shooting: 'postProduction',
    postProduction: 'releaseReady',
  })

/**
 * The countdown reading a VALIDATOR wants: out-of-range is data to report, not a
 * crash, because the caller is holding untrusted JSON and owns the message.
 */
export function productionPhaseForRemainingTicksOrNull(
  remainingTicks: number,
): ProductionPhase | null {
  return PHASE_BY_REMAINING_TICKS[remainingTicks] ?? null
}

/**
 * The countdown reading the ENGINE wants: out-of-range is impossible, so it is a
 * loud programmer error rather than a silently absorbed null.
 */
export function productionPhaseForRemainingTicks(remainingTicks: number): ProductionPhase {
  const phase = productionPhaseForRemainingTicksOrNull(remainingTicks)
  if (phase === null) {
    throw new Error(
      `productionPhaseForRemainingTicks: remainingTicks ${String(remainingTicks)} is outside managed production range [1, 8]`,
    )
  }
  return phase
}

/** The exact capability multiset a workflow holds while in `phase`. */
export function requirementsForPhase(phase: ProductionPhase): readonly FacilityCapability[] {
  return REQUIRED_CAPABILITIES_BY_PHASE[phase]
}

/** The scheduled successor of `phase`, or null at the end of the countdown. */
export function nextProductionPhase(phase: ProductionPhase): ProductionPhase | null {
  return NEXT_PHASE_BY_PHASE[phase] ?? null
}

/**
 * THE ACQUISITION RANK (charter §3.2) — the declared total resource order.
 *
 *   `development-casting`(1) < stage+set composite(2) < `set-scenery`(3) < `post`(4)
 *
 * with ONE invariant: a workflow may only wait for a resource ranked STRICTLY
 * ABOVE everything it currently holds. That converts the pipeline's accidental
 * DAG (lane 2 §5.1 — "there is no cycle today, and only by accident") into a
 * stated, tested law, and it is what makes lane 2's X1 cycle impossible rather
 * than merely unlikely.
 *
 * The composite is ONE rank-2 node: stage and set are acquired atomically, so
 * there is no moment at which a picture holds one and waits for the other. A
 * SET therefore has no rank of its own — it is never waited for separately.
 * `mount` is unranked for the same reason (§3.1: acquired instantly, never
 * waited on).
 *
 * The resource-release law (`00E`.5) shrinks the graph this polices rather than
 * complicating it: a completed phase's resources release, so the only surviving
 * hold-and-wait edge is rehearsal→shooting, which retains the stage+set the next
 * phase genuinely requires and waits for `set-scenery` above it.
 */
const ACQUISITION_RANK_BY_CAPABILITY: Readonly<Record<FacilityCapability, number>> =
  Object.freeze({
    'development-casting': 1,
    soundstage: 2,
    'set-scenery': 3,
    post: 4,
  })

/** The declared acquisition rank of a capability (§3.2). Higher waits on lower. */
export function acquisitionRank(capability: FacilityCapability): number {
  return ACQUISITION_RANK_BY_CAPABILITY[capability]
}

/**
 * The capabilities a workflow KEEPS across a transition — the intersection of
 * what this phase holds and what the next phase requires.
 *
 * THE RESOURCE-RELEASE LAW (`00E`.5) is this one line and its complement: what
 * the next phase genuinely requires is retained, and EVERYTHING ELSE RELEASES
 * when the phase's work completes, whether or not the next resource is
 * available. Shooting → Post retains nothing, so a wrapped picture waits for Post
 * holding nothing at all; Rehearsal → Shooting retains the stage (and with it the
 * set standing on it), because the next phase is where the picture actually
 * shoots.
 */
export function retainedCapabilitiesFor(
  phase: ProductionPhase,
  targetPhase: ProductionPhase,
): readonly FacilityCapability[] {
  const required = requirementsForPhase(targetPhase)
  return requirementsForPhase(phase).filter((capability) => required.includes(capability))
}

/**
 * The ONLY `facility-capacity` blocker a legal state can carry at a given
 * countdown position — derived, not tabled a second time.
 *
 * A blocker exists only on a phase TRANSITION, and only for a capability the
 * next phase requires that the current phase does not already hold. Retention is
 * sticky for every capability (§3.2, the R-1 contract-conformance repair), so a
 * capability the current phase already holds is carried across the transition
 * and can never be the thing that refuses it. What is left is the first
 * genuinely NEW capability in the next phase's requirement order — which is
 * exactly the one the allocator reports, because it allocates in that order and
 * returns on the first failure.
 *
 * At the frozen V13 table this yields precisely the hand-written truth it
 * replaces: 7 → soundstage/rehearsal, 6 → set-scenery/shooting,
 * 4 → post/postProduction, and nothing anywhere else.
 */
export function reachableCapacityBlockerForRemainingTicks(
  remainingTicks: number,
): { capability: FacilityCapability; targetPhase: ProductionPhase } | null {
  const phase = productionPhaseForRemainingTicksOrNull(remainingTicks)
  if (phase === null) return null
  const targetPhase = productionPhaseForRemainingTicksOrNull(remainingTicks - 1)
  // Same phase next week (or release): no allocation runs, so nothing can refuse.
  if (targetPhase === null || targetPhase === phase) return null
  const held = new Set(requirementsForPhase(phase))
  for (const capability of requirementsForPhase(targetPhase)) {
    if (!held.has(capability)) return { capability, targetPhase }
  }
  return null
}
