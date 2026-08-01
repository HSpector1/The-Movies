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
  convertV1ToV2,
  convertV2ToV3,
  convertV3ToV4,
  convertV4ToV5,
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
import { makeLegacySaveV1, toLegacyTalent } from './_legacyV1Fixtures.js'

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

// Same loop, but with the D-9.8 DEVELOPMENT step (tick option) ON.
function runYearDeveloping(seed: string, agent: Agent): GameState {
  let state = generateWorld(seed)
  for (let t = 0; t < TUNING.TICKS_PER_YEAR; t++) {
    state = applyActions(state, agent.chooseActions(state))
    state = tick(state, { develop: true })
  }
  return state
}

// Advance an arbitrary GameState `n` ticks with a chosen agent + develop flag.
function advance(start: GameState, n: number, agent: Agent, develop: boolean): GameState {
  let state = start
  for (let t = 0; t < n; t++) {
    state = applyActions(state, agent.chooseActions(state))
    state = tick(state, { develop })
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

// ── AGENT D: development-ON full-run replay is byte-identical (D-9.8 replay-exact) ─
// D-9.8: the DEVELOPMENT step draws ONLY from stream(seed,'develop',prod:talent) and
// never advances state.rngState, so a full run with develop:true replays byte-for-byte
// across two runs of the same seed + actions — exactly like the develop:false run.
describe('§15.7/D-9.8 — develop:true full-run replay is byte-identical', () => {
  for (const [name, agent] of [
    ['OracleAgent', OracleAgent],
    ['RandomAgent', RandomAgent],
  ] as const) {
    it(`${name}: two develop:true full-year runs with the same seed are byte-identical`, () => {
      const seed = `replay-dev-${name}`
      const a = runYearDeveloping(seed, agent)
      const b = runYearDeveloping(seed, agent)
      expect(exportSave(makeSave(a))).toBe(exportSave(makeSave(b)))
    })

    it(`${name}: development actually changed some talent (the flag is not a no-op here)`, () => {
      // Sanity anchor for the replay claim: with develop ON over a full year that has
      // releases, at least one talent's serialized skills differ from the develop-OFF
      // run. (If nothing developed, the byte-identity above would be vacuous.)
      const seed = `replay-dev-effect-${name}`
      const on = runYearDeveloping(seed, agent)
      const off = runYear(seed, agent)
      expect(exportSave(makeSave(on))).not.toBe(exportSave(makeSave(off)))
    })
  }
})

// ── AGENT D: a run RESUMED from a converted V2 replays identically ────────────────
// D-9.15 replay-exactness: convertV1ToV2 carries rngState through UNCHANGED, so the
// resumed sim stream is anchored exactly. Two independent conversions of the SAME
// legacy V1, each advanced by the SAME agent + actions, produce byte-identical
// serialized state. This is the migration analogue of the §15.7 replay guarantee.
describe('§15.7/D-9.15 — a run resumed from a converted V2 replays byte-identically', () => {
  // Build a legacy V1 by REDUCING a real generated world's roster to old-shape talent
  // (scalar `skill`, no `skills` record). This guarantees a fully castable roster so
  // generateCandidates can form valid productions on resume. The seed + a valid live
  // rngState anchor come from the same generated world, so tick can resume from it.
  function legacyResumable(seed: string): ReturnType<typeof makeLegacySaveV1> {
    const anchor = generateWorld(seed)
    return makeLegacySaveV1({
      seed,
      talent: anchor.talent.map(toLegacyTalent),
      rngState: anchor.rngState,
    })
  }

  for (const [name, agent, develop] of [
    ['OracleAgent/develop-off', OracleAgent, false],
    ['OracleAgent/develop-on', OracleAgent, true],
    ['RandomAgent/develop-on', RandomAgent, true],
  ] as const) {
    it(`${name}: two resumes of the same converted V2 are byte-identical`, () => {
      const seed = `resume-${name.replace(/\W+/g, '-')}`
      const v1 = legacyResumable(seed)

      // Two INDEPENDENT conversions of the same V1 → V2 → V3 (D-11 legacy resume path;
      // the live engine runs on the V3 shape). Both conversions are deterministic.
      // D-14: legacy saves migrate all the way to the live V5 shape before resuming.
      const s1 = convertV4ToV5(convertV3ToV4(convertV2ToV3(convertV1ToV2(v1)))).state
      const s2 = convertV4ToV5(convertV3ToV4(convertV2ToV3(convertV1ToV2(v1)))).state

      // The converted starting states are already byte-identical (idempotent migrate).
      expect(exportSave(makeSave(s1))).toBe(exportSave(makeSave(s2)))

      // Resume each for several ticks with the same agent + develop flag.
      const r1 = advance(s1, 8, agent, develop)
      const r2 = advance(s2, 8, agent, develop)
      expect(exportSave(makeSave(r1))).toBe(exportSave(makeSave(r2)))
    })
  }

  it('the resumed V2 starts from the SAME rngState the legacy V1 carried (no reset)', () => {
    const seed = 'resume-anchor-check'
    const v1 = legacyResumable(seed)
    const v2 = convertV1ToV2(v1)
    expect(v2.state.rngState).toBe(v1.state.rngState)
  })
})
