// ── §13 Agents: RandomAgent + OracleAgent (phase 3, step 4) ──────────────────
// Two agents over the SAME finite candidate grid (§13; rev. 4). Each exposes
// chooseActions(state): Action[] and returns EITHER a single greenlight action OR
// [] — never more (B3: at most one greenlight per tick).
//
// Both agents:
//   - Greenlight only while activeProductions.length < AGENT_MAX_SLATE
//     (ruling #4); otherwise return []. C2a-M4: the constant is now the AGENTS'
//     policy bound and nothing else — the engine's cap is deleted (owner law 1),
//     and the M0A corpus stays byte-identical because the POLICY did not change.
//   - Build the candidate set via generateCandidates(state, tick), which is
//     deterministic and agent-INDEPENDENT — so both agents at the SAME state see
//     the IDENTICAL 500 packages.
//
// Stream isolation (M9): generateCandidates draws only from the 'candidates'
// stream; RandomAgent draws only from the 'agent' stream; OracleAgent draws from NO
// stream at all (it is fully deterministic — ruling #3, variance excluded). Neither
// agent reads or writes state.rngState (the sim stream), so chooseActions never
// advances the sim stream (isolation).
//
// Rev. 4 references folded in:
//   ruling #3 / D-1 — Oracle scores by expected PROFIT via the deterministic
//     omniscient noise-free pipeline (forecastCenters → computeBoxOffice with
//     criticScore := criticMean implicitly, i.e. no sampled term); ties broken by
//     ascending candidate index (keep the first-seen maximum).
//   ruling #4 — both agents greenlight whenever activeProductions.length is under
//     their policy slate bound.

import { generateCandidates, packageReceptionInputs, type CandidatePackage } from './candidates.js'
import { computeBoxOffice } from './reception.js'
import { forecastCenters } from './forecast.js'
import { stream } from './rng.js'
import { TUNING } from './tuning.js'
import type { Action, CastSlot, GameState } from './types.js'

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

// An agent chooses actions for the current state (§3). In M0A this is either one
// greenlight or nothing.
export type Agent = {
  chooseActions(state: GameState): Action[]
}

// Build the single greenlight Action from a chosen package. The production omits
// the fields applyActions/tick stamp (id, startTick, remainingTicks,
// forecastSnapshot — §2.6 Action shape).
function greenlightAction(pkg: CandidatePackage): Action {
  return {
    kind: 'greenlight',
    production: {
      conceptId: pkg.conceptId,
      shape: pkg.shape,
      promise: pkg.promise,
      writerId: pkg.writerId,
      directorId: pkg.directorId,
      craftIds: pkg.craftIds,
      cast: pkg.cast,
      budget: pkg.budget,
    },
  }
}

// True while THIS AGENT'S POLICY takes on another production (ruling #4 / B3).
//
// C2a-M4: a policy bound, not a game law. The engine no longer refuses a third
// picture — it queues what capacity cannot yet carry (§3.3) — but the corpus
// agents keep the exact slate they were measured with, which is what holds every
// sealed M0A/D-6/D-12/D-16 figure byte-identical across the deletion.
function canGreenlight(state: GameState): boolean {
  return state.studio.activeProductions.length < TUNING.AGENT_MAX_SLATE
}

// ── RandomAgent ──────────────────────────────────────────────────────────────
// Uniform over the 500 candidates. Coverage / reachability / boundedness (§13).
export const RandomAgent: Agent = {
  chooseActions(state: GameState): Action[] {
    if (!canGreenlight(state)) return []
    const tick = state.market.tick
    const packages = generateCandidates(state, tick)
    // Uniform index from the DERIVED 'agent' stream (M9). Math.floor of next() * n
    // is a uniform index selection — NOT unseeded randomness.
    const i = Math.floor(stream(state.seed, 'agent', tick).next() * packages.length)
    return [greenlightAction(packages[i]!)]
  },
}

// ── OracleAgent ──────────────────────────────────────────────────────────────
// Scores each candidate by EXPECTED PROFIT via the deterministic omniscient
// noise-free pipeline (ruling #3, D-1), picks the argmax, ties broken by ascending
// candidate index. Uses NO stream (fully deterministic). Explicitly omniscient;
// variance excluded (no critic sampling, no forecast gaussian, no realized outcomes).
export const OracleAgent: Agent = {
  chooseActions(state: GameState): Action[] {
    if (!canGreenlight(state)) return []
    const tick = state.market.tick
    const packages = generateCandidates(state, tick)

    let bestIdx = -1
    let bestProfit = 0 // initialized on first package
    for (let idx = 0; idx < packages.length; idx++) {
      const pkg = packages[idx]!
      const profit = expectedProfit(state, pkg)
      // Ascending-candidate-index tie-break: keep the first-seen maximum; only a
      // STRICTLY-GREATER profit replaces it.
      if (bestIdx === -1 || profit > bestProfit) {
        bestIdx = idx
        bestProfit = profit
      }
    }

    return [greenlightAction(packages[bestIdx]!)]
  },
}

// Expected profit (currency) via the deterministic omniscient pipeline (D-1,
// ruling #3):
//   centers        = forecastCenters(inp).centers  (noise-free per-segment appeal)
//   expectedTotal  = computeBoxOffice(centers, …).total
//   salaries       = writer + director + lead + antagonist + support salaries
//                    (craft = 0; craftHires is always [] in M0A)
//   profit         = expectedTotal − budget.negative − budget.marketing − salaries
// NO sampled term (no critic draw, no forecast gaussian) enters — variance excluded.
function expectedProfit(state: GameState, pkg: CandidatePackage): number {
  const inp = packageReceptionInputs(state, pkg)
  const { centers } = forecastCenters(inp)
  const box = computeBoxOffice(
    centers,
    state.market.segments,
    state.market.baseMarketValue,
    state.studio.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects, // = resolveShape(pkg.shape) (packageReceptionInputs resolved it)
  )

  // Salary sum in the fixed order writer, director, lead, antagonist, support.
  let salaries = inp.writer.salary + inp.director.salary
  for (const slot of CAST_SLOTS) salaries += inp.cast[slot].salary

  return box.total - pkg.budget.negative - pkg.budget.marketing - salaries
}
