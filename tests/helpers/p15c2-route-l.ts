// ── P15C Wave 2: route L, a natural late founding that reaches 2040 (records 1359-C, 1359-C2; r4 1359-C4) ──
//
// One module for the RED leaves (tests/p15c2-campaign-legacy*.test.ts) and the capture producer
// (1359-P), so a capture and the leaves that read it run the same code (1359-F2 item 5). It imports
// no vitest: the producer runs under tsx. A failed route premise throws with its own message.
//
// The route: generateWorld(ROUTE_SEED); one headless year in which the M0A OracleAgent releases
// films with no economy (no run, no career event); idle headless ticks to FOUNDING_WEEK; the studio
// founded there through the migration origin (`foundThroughMigration`: every studio entered at 6188,
// the draft closed); ordinary ticks after. The headless branch keeps ticking from 6188 with no
// industry (B8's corpus).
//
// r4 (1359-F3): the founding is lawful. r3 called `beginFounding` at 6188, which opens the draft and
// creates the industry, origin 'migration', in one call (employment.ts:568-570), and then ticked with
// the draft open. The new industry's rival method locks entered the technology corpus, which
// `technology.ts:897` refuses while a draft is open (1359-X F-1). Signing the roster in that draft and
// closing it with `foundStudio` is no exit: each contract becomes a `player-contract` row with no ledger
// signing payment (hollywoodValidation.ts:568-569; 1356-F5). r4 uses 1356-C3's `foundMidGame`, which
// 1356-F4 accepted on the basis 1356-F5 states: the roster is signed and the draft closed before any
// industry exists, then the industry starts by migration, the end state the frozen V18-to-V19
// migration builds (save.ts:8048-8053). The industry still originates at 6188 with every studio
// entered there. r3 had no industry before 6188 either: the premise below refuses one.

import { performance } from 'node:perf_hooks'
import { applyActions } from '../../src/core/actions.js'
import { OracleAgent } from '../../src/core/agents.js'
import { LEGACY_BOUNDARY_WEEK } from '../../src/core/campaignLegacy.js'
import { beginFoundingHistoricalControl, FOUNDING_MINIMUMS } from '../../src/core/employment.js'
import { initializeHollywood } from '../../src/core/hollywood.js'
import { tick } from '../../src/core/tick.js'
import { TUNING } from '../../src/core/tuning.js'
import type { GameState } from '../../src/core/types.js'
import { generateWorld } from '../../src/core/worldgen.js'

export const ROUTE_SEED = '1359-legacy-late-founding-01'
/** 119 × 52 and 476 × 13: one campaign year (four quarters) before B. */
export const FOUNDING_WEEK = 6188
const B = LEGACY_BOUNDARY_WEEK

/** The genuine route L captures below the Legacy's save step, minted by 1359-P (repository-relative). */
export const CAPTURE_DIRECTORY = 'tests/fixtures/p15/p15c2-route-l-captures/'
/** 6239: migrated there, the next tick freezes (C3). 6240: migrated there, it never freezes (C4). */
export const CAPTURE_WEEKS: readonly number[] = [B - 1, B]
export const captureName = (week: number): string => `route-l-week-${week}`

/** Commits every production one tick from release, as the acceptance corpus does. */
export function commitReady(state: GameState): GameState {
  const committed = new Set(state.releaseAuthority.commitments.map((row) => row.productionId))
  const ready = state.studio.activeProductions.filter((p) => p.remainingTicks === 1 && !committed.has(p.id))
  if (ready.length === 0) return state
  return applyActions(state, ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })))
}

/** Founds the studio on a headless world at its own week, then lets the industry in at that week
 * (1359-F3; 1356-C3's `foundMidGame`). `beginFoundingHistoricalControl` opens the draft with no
 * industry (employment.ts:572-576); `signContract` hires the first FOUNDING_MINIMUMS[role] applicants
 * of each required role, the recruitment fund paying the bonuses off the ledger (actions.ts:2560-2580);
 * `foundStudio` closes the draft (actions.ts:1201-1224); `initializeHollywood` opens the industry,
 * origin 'migration' at this week, and observes those contracts as existing player contracts
 * (hollywood.ts:185; industryEmployment.ts:29), which the payment rule exempts. Any refused signing
 * throws: no applicant is skipped. */
function foundThroughMigration(headless: GameState): GameState {
  const draft = beginFoundingHistoricalControl(headless)
  const applicants = draft.founding!.applicantIds.map((id) => draft.talent.find((t) => t.id === id)!)
  let state = draft
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const person of applicants.filter((t) => t.role === role).slice(0, FOUNDING_MINIMUMS[role])) {
      state = applyActions(state, [{ kind: 'signContract', talentId: person.id, termWeeks: TUNING.CONTRACT_MAX_WEEKS }])
    }
  }
  return initializeHollywood(applyActions(state, [{ kind: 'foundStudio' }]), 'migration')
}

export type RouteL = {
  headlessAtFounding: GameState
  foundedAtFounding: GameState
  /** The headless branch (no industry) at B − 1, B and B + 1. */
  headless: ReadonlyMap<number, GameState>
  /** The founded branch at B − 2 through B + 1. */
  founded: ReadonlyMap<number, GameState>
  ms: { headlessTo6188: number; industry6188To6241: number }
}

function buildRouteL(): RouteL {
  const started = performance.now()
  let state = generateWorld(ROUTE_SEED)
  for (let week = 0; week < TUNING.TICKS_PER_YEAR; week++) state = tick(commitReady(applyActions(state, OracleAgent.chooseActions(state))))
  while (state.studio.activeProductions.length > 0) state = tick(commitReady(state))
  while (state.market.tick < FOUNDING_WEEK) state = tick(state)
  if (state.market.tick !== FOUNDING_WEEK || state.hollywood !== null) {
    throw new Error(`route L premise: the headless world must reach week ${FOUNDING_WEEK} with no industry`)
  }
  const headlessDone = performance.now()
  const headless = new Map<number, GameState>()
  let h = state
  while (h.market.tick < B + 1) {
    h = tick(h)
    if (h.market.tick >= B - 1) headless.set(h.market.tick, h)
  }
  const closed = (s: GameState): GameState => {
    if (s.founding !== null) throw new Error(`route L premise: the founding draft is open at week ${s.market.tick} (1359-F3)`)
    return s
  }
  const foundedAtFounding = closed(foundThroughMigration(state))
  const founded = new Map<number, GameState>()
  let f = foundedAtFounding
  while (f.market.tick < B + 1) {
    f = closed(tick(f))
    if (f.market.tick >= B - 2) founded.set(f.market.tick, f)
  }
  return {
    headlessAtFounding: state, foundedAtFounding, headless, founded,
    ms: { headlessTo6188: headlessDone - started, industry6188To6241: performance.now() - headlessDone },
  }
}

let built: { value: RouteL } | { error: unknown } | null = null
/** Route L, built once per process; a failed build fails every caller the same way. */
export function routeL(): RouteL {
  if (built === null) {
    try {
      built = { value: buildRouteL() }
    } catch (error) {
      built = { error }
    }
  }
  if ('error' in built) throw built.error
  return built.value
}

/** The founded branch at `week`, B − 2 through B + 1. */
export function routeAt(week: number): GameState {
  const state = routeL().founded.get(week)
  if (state === undefined) throw new Error(`route L premise: no founded state at week ${week}`)
  return state
}
