// ── §15.7 replay + M9 RNG-stream isolation — INDEPENDENT contract-derived tests ──
//
// SOURCE OF TRUTH: build-contract.md rev. 4 §15 (test 7, Replay) + NORMATIVE
// docs/rev4-open-questions.md (§15.7 byte-identity compares the full serialized
// SaveFileV1 — M14; M9 sim-stream = reception-time sampling ONLY). Every expectation
// is derived from the contract. The bodies of tick.ts / actions.ts / candidates.ts /
// agents.ts are NEVER read; import ONLY the public surface (src/core/index.ts).
//
// Contract basis:
//   §15 test 7  — "Same seed + same actions → byte-identical state and Broadcast copy."
//   M14         — byte-identity compares the full serialized SaveFileV1 (state +
//                 broadcastCache ≡ state.broadcastItems). Broadcast presentation is a
//                 phase-6 no-op here, so broadcastItems stays [].
//   M9          — the sim stream (state.rngState) carries ONLY reception-time sampling
//                 (the §5.3 critic draw); it advances IFF a release is received this
//                 tick. Candidate/agent/forecast draws use separate derived streams.
//   B12/M1      — a film greenlit at t releases during tick t+PRODUCTION_TICKS.
//   B1/B2/B3    — two staggered slots, active-when-<2 ⇒ 10 releases across a full year.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  exportSave,
  generateCandidates,
  generateWorld,
  makeSave,
  OracleAgent,
  RandomAgent,
  tick,
  TUNING,
} from '../src/core/index.js'
import type { Agent, GameState } from '../src/core/index.js'

// One full simulated year from generateWorld(seed): every tick, the agent chooses,
// applyActions applies, tick advances. Ticks 0..TICKS_PER_YEAR-1 (52). Per the brief.
function runYear(seed: string, agent: Agent): GameState {
  let state = generateWorld(seed)
  for (let t = 0; t < TUNING.TICKS_PER_YEAR; t++) {
    state = applyActions(state, agent.chooseActions(state))
    state = tick(state)
  }
  return state
}

describe('§15.7 full-run replay — byte-identical SaveFileV1 (M14)', () => {
  for (const [name, agent] of [
    ['OracleAgent', OracleAgent],
    ['RandomAgent', RandomAgent],
  ] as const) {
    it(`${name}: two full-year runs with the same seed produce byte-identical exportSave`, () => {
      const seed = `replay-${name}`
      const a = runYear(seed, agent)
      const b = runYear(seed, agent)
      // §15.7: same seed + same actions ⇒ byte-identical state + broadcast cache.
      expect(exportSave(makeSave(a))).toBe(exportSave(makeSave(b)))
    })

    it(`${name}: broadcastItems stays [] (broadcast presentation is a phase-6 no-op)`, () => {
      const a = runYear(`replay-empty-${name}`, agent)
      expect(a.broadcastItems).toEqual([])
    })
  }
})

describe('§15.7/M9 — sim stream advances IFF a release is received that tick', () => {
  it('rngState changes exactly on releasing ticks, and the count equals the release count', () => {
    // Run a full year with the OracleAgent (a deterministic greenlight-when-<2 policy).
    let state = generateWorld('replay-stream-1')
    let releaseCount = 0
    let rngChangeCount = 0

    for (let t = 0; t < TUNING.TICKS_PER_YEAR; t++) {
      state = applyActions(state, OracleAgent.chooseActions(state))
      const before = state.rngState
      const releasedBefore = state.studio.releasedFilms.length
      state = tick(state)
      const releasedThisTick = state.studio.releasedFilms.length - releasedBefore
      const rngChanged = state.rngState !== before

      // M9: reception (the only sim-stream consumer) runs IFF a film releases this tick.
      // So rngState changes IFF releasedThisTick > 0.
      expect(rngChanged).toBe(releasedThisTick > 0)

      if (releasedThisTick > 0) rngChangeCount++
      releaseCount += releasedThisTick
    }

    // The number of ticks that changed rngState equals the number of releasing ticks.
    // With staggered slots (B1/B2/B3), two releases never fall on the same tick, so the
    // count of releasing ticks equals the total release count: 10 for a full run.
    expect(rngChangeCount).toBe(releaseCount)
    expect(releaseCount).toBe(10)
  })
})

describe('§15.7/M9 — candidate/agent draws never advance the sim stream', () => {
  it('generateCandidates and both agents leave state.rngState frozen across many calls', () => {
    const state = generateWorld('replay-noadvance-1')
    const before = state.rngState
    for (let t = 0; t < 10; t++) {
      generateCandidates(state, t)
      RandomAgent.chooseActions(state)
      OracleAgent.chooseActions(state)
    }
    expect(state.rngState).toBe(before)
  })
})

describe('§15.6/M9 — greenlight forecast snapshot draws from the forecast stream, not the sim stream', () => {
  it('applying a greenlight leaves state.rngState unchanged (forecast noise ≠ sim stream)', () => {
    // A greenlight computes forecastSnapshot inside applyActions, whose noise is drawn
    // from stream(seed,'forecast',productionId) (M9) — NOT the sim stream. So the sim
    // stream is unchanged from before the greenlight to after.
    const state = generateWorld('replay-forecast-iso-1')
    const before = state.rngState

    // Let the OracleAgent produce a valid greenlight from the shared grid.
    const actions = OracleAgent.chooseActions(state)
    expect(actions).toHaveLength(1)
    const after = applyActions(state, actions)

    expect(after.studio.activeProductions).toHaveLength(1)
    // The forecast snapshot exists (proving a forecast was computed at greenlight)...
    expect(after.studio.activeProductions[0].forecastSnapshot).toBeDefined()
    // ...yet the sim stream did not advance.
    expect(after.rngState).toBe(before)
  })
})
