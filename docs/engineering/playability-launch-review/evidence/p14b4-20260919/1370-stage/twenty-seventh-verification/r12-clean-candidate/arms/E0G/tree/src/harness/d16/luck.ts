// ── D-16 · luck resampling ───────────────────────────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// THE QUESTION IT ANSWERS: "from this exact position, how much of the outcome was
// luck?" — e.g. the Week-86 save's `how unlucky was this run?`, and the probability
// that a distressed studio recovers if the dice fall differently.
//
// HOW THE ENGINE'S RANDOMNESS IS STRUCTURED (A17 §1):
//   • ONE persisted sim stream, `state.rngState`, consumed ONLY by the critic gaussian
//     (2 uniforms per released film).
//   • EVERY other draw comes from a STATELESS derived stream
//     `stream(state.seed, purpose, key)` — `forecast` keyed by productionId,
//     `discovery-v1` keyed by productionId, `develop` keyed by `${prodId}:${talentId}`,
//     `hiring` keyed by offer/epoch, `candidates`/`agent` keyed by tick.
//
// SO: re-keying `state.seed` re-draws EVERY derived stream from an otherwise identical
// position, and advancing `rngState` re-draws the critic gaussian. Together they give an
// independent continuation from the same state.
//
// ── CAVEATS (read before using a number this produces) ───────────────────────
//  C1. Re-keying the seed ALSO re-keys the `hiring` streams, so the freelancer and
//      hiring market rotations and every contract-offer jitter change. Already-signed
//      contracts keep their locked terms (they live in `state.contracts`), but the
//      market a continuation can hire FROM is different. Luck resampling therefore
//      measures "different world-luck from here", not "same market, different dice".
//  C2. It also re-keys `develop`, so talent growth differs. Intentional for a
//      multi-year continuation; a confound if the question is purely about one film.
//  C3. `worldgen` draws are NOT re-run — the world (talent, concepts, baseMarketValue)
//      is already materialised in `state` and is carried through unchanged. Good: the
//      counterfactual is "same world, different luck", not "different world".
//  C4. `state.seed` appears inside every saved artifact; a resampled state's seed is
//      deliberately marked `::luck-K` so a resampled run can never be mistaken for a
//      real one.
//  C5. The rngState advance is a documented OFFSET, not a re-seed: re-seeding would
//      break the "2 uniforms per release" audit trail that proves replay discipline.
//      Advancing keeps the stream on its own trajectory, just at a different point.

import { RngStream } from '../../core/index.js'
import type { GameState } from '../../core/index.js'

/**
 * How many uniforms the sim stream is advanced per luck index. 2 = exactly one
 * `gaussian()` worth (rng.ts:102-109), so `resampleLuck(s, k)` starts the critic
 * sequence k films further along a stream it would otherwise have reached anyway.
 */
export const LUCK_RNG_OFFSET_PER_INDEX = 2

/** The seed suffix. Deliberately loud so a resampled state is never mistaken for real. */
export function luckSeed(seed: string, k: number): string {
  return `${seed}::luck-${k}`
}

/**
 * Clone `state` into an independent luck continuation.
 * - `seed` becomes `${seed}::luck-${k}` ⇒ every DERIVED stream (forecast, discovery-v1,
 *   develop, hiring, candidates) re-draws from the same position.
 * - `rngState` is advanced by `k * LUCK_RNG_OFFSET_PER_INDEX` uniforms ⇒ the critic
 *   gaussian sequence differs too.
 * `k = 0` returns a state whose rngState is unchanged but whose seed is still re-keyed,
 * so arm 0 is NOT the original run — pass the original state itself for that.
 *
 * Pure: the input state is never mutated.
 */
export function resampleLuck(state: GameState, k: number): GameState {
  if (!Number.isInteger(k) || k < 0) {
    throw new Error(`d16/luck: luck index must be a non-negative integer, got ${String(k)}`)
  }
  const rng = RngStream.deserialize(state.rngState)
  for (let i = 0; i < k * LUCK_RNG_OFFSET_PER_INDEX; i++) rng.next()
  return { ...state, seed: luckSeed(state.seed, k), rngState: rng.serialize() }
}

/** `count` independent continuations from the same position: k = 1 … count. */
export function luckFan(state: GameState, count: number): GameState[] {
  const out: GameState[] = []
  for (let k = 1; k <= count; k++) out.push(resampleLuck(state, k))
  return out
}

/** Machine-readable caveat list, emitted alongside any luck-resampled artifact. */
export const LUCK_CAVEATS: readonly string[] = [
  'C1: re-keying the seed also re-keys the hiring streams — the freelancer/hiring market rotation and every contract-offer jitter differ across luck arms. Existing contracts keep their locked terms.',
  'C2: the develop stream is re-keyed, so talent growth differs across arms.',
  'C3: worldgen draws are NOT re-run; the world (talent, concepts, baseMarketValue) is carried through unchanged.',
  'C4: the resampled seed is suffixed "::luck-K" so a resampled run can never be mistaken for a real one.',
  'C5: rngState is ADVANCED by 2 uniforms per luck index (one gaussian), never re-seeded — the 2-uniforms-per-release replay audit trail is preserved.',
]
