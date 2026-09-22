// 681 — the B.5 closeness-floor WITNESS: 45, measured, not argued. AUTHORING ONLY.
//
// STAGING DISCLOSURE, read this before any number below is quoted.
// This is a CONSTRUCTED WORST CASE. It is not natural play, it is not a campaign,
// there is no seed and no `tick`. Every input is hand-named here:
//   * four people: person-d (director), person-l (lead), person-n (antagonist),
//     person-s (support). One production shape, re-issued under new ids.
//   * the measured pair is the LOW-proximity pair director-support, which
//     `seatPairs` weights RELATIONSHIP_PROXIMITY_LOW. One take mints all SIX pairs,
//     so the root carries six edges; the table prints the low edge and the minimum
//     across all six.
//   * the schedule: mint, then a dormancy of GRACE + RETURN + 1 weeks and a flop,
//     then take/flop cycles with no dormancy. A six-year gap between two shared
//     pictures by the same quartet is staged; nothing here shows a campaign
//     reaching it. 676-P argues separately that it is unreachable in play.
// A minimal LAWFUL full GameState is not constructible without staging half the
// world, so the state below is a partial object cast to GameState. It carries
// exactly the fields the real seam reads: `relationships`, `hollywood` (non-null),
// `firstTakes`, plus `talent` / `market.tick` / `studioHistory.recordingStartedWeek`
// so the REAL `validateRelationshipsRoot` can certify the root after every step.
// No step of steps 1-6 is hand-applied: every closeness is produced by the real
// `advanceRelationshipsWeek` write path. Step 7 is explicitly hypothetical and
// labelled as such. No `vitest`, no file written, nothing under src/ touched.
//
// Run from the repository root:
//   node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/681-b5-closeness-floor-witness.ts
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  RELATIONSHIP_BASELINE, RELATIONSHIP_DRIFT_GRACE_WEEKS, RELATIONSHIP_DRIFT_RETURN_WEEKS,
  RELATIONSHIP_FAILURE_CRITIC_SCORE, RELATIONSHIP_FAILURE_DELTA, RELATIONSHIP_PROXIMITY_LOW,
  RELATIONSHIP_REPEAT_CAP, RELATIONSHIP_TIER_FLOOR,
  advanceRelationshipsWeek, currentCloseness, currentTier, validateRelationshipsRoot,
} from '../../../../../src/core/relationships.js'
import type { FilmResult, GameState, Production, RelationshipEdge } from '../../../../../src/core/types.js'

const STRAINED_CEILING = RELATIONSHIP_TIER_FLOOR.Acquaintances - 1
const DORMANCY = RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS + 1
const PRODUCTIONS = 8 // P1, the dormant flop, then P2 and a further six
const STUDIO = 'studio-witness'
const shot = (id: string) => ({ id, directorId: 'person-d', cast: { lead: 'person-l', antagonist: 'person-n', support: 'person-s' } })

let state = {
  relationships: [], firstTakes: [], talent: ['person-d', 'person-l', 'person-n', 'person-s'].map((id) => ({ id })),
  market: { tick: 0 }, studioHistory: { recordingStartedWeek: 0 }, hollywood: { playerStudioId: STUDIO },
} as unknown as GameState

/** The director-support edge: seat-order index 2 of the six `seatPairs` mints. */
const low = (): RelationshipEdge => {
  const edge = state.relationships[2]!
  assert.deepEqual([edge.a, edge.b], ['person-d', 'person-s'], 'index 2 must be the low-proximity director-support pair')
  return edge
}
const at = (week: number) => { state = { ...state, market: { ...state.market, tick: week } } as GameState }
function take(week: number, id: string): void {
  at(week)
  state = { ...state, firstTakes: [...state.firstTakes, { eventId: `e-${id}`, week, productionId: id, studioId: STUDIO, ...shot(id) }] } as unknown as GameState
  state = advanceRelationshipsWeek(state, { takes: [{ studioId: STUDIO, production: shot(id) as unknown as Production }], releases: [] }, week)
  validateRelationshipsRoot(state)
}
function flop(week: number, id: string): void {
  at(week)
  const film = { productionId: id, criticScore: RELATIONSHIP_FAILURE_CRITIC_SCORE - 1 } as unknown as FilmResult
  state = advanceRelationshipsWeek(state, { takes: [], releases: [film] }, week)
  validateRelationshipsRoot(state)
}

const rows: { step: string; week: number; closeness: number; tier: string; P: number; F: number; minAllSix: number }[] = []
const record = (step: string, week: number) => {
  const e = low()
  const row = { step, week, closeness: currentCloseness(e, week), tier: currentTier(e, week), P: e.sharedProductions, F: e.sharedFailures,
    minAllSix: Math.min(...state.relationships.map((x) => currentCloseness(x, week))) }
  rows.push(row)
  return row
}

// 1. The mint: baseline + the low proximity weight.
let week = 10
take(week, 'prod-1')
let row = record('1 mint P1', week)
assert.equal(row.closeness, RELATIONSHIP_BASELINE + RELATIONSHIP_PROXIMITY_LOW)
assert.equal(row.P, 1)
// 2. A completed drift return, then one flop: 52 -> 50 by drift, then -FAILURE_DELTA.
week += DORMANCY
const drifted = currentCloseness(low(), week)
flop(week, 'prod-1')
row = record('2 flop P1 after full drift', week)
assert.equal(drifted, RELATIONSHIP_BASELINE, 'a completed return lands exactly on the baseline')
assert.equal(row.closeness, RELATIONSHIP_BASELINE - RELATIONSHIP_FAILURE_DELTA)
// 3. A second take inside the grace window: no drift, +LOW, then the accelerator.
week += 1
take(week, 'prod-2')
row = record('3 take P2 (+LOW +accel)', week)
assert.equal(row.closeness, RELATIONSHIP_BASELINE - RELATIONSHIP_FAILURE_DELTA + RELATIONSHIP_PROXIMITY_LOW + Math.min(1, RELATIONSHIP_REPEAT_CAP))
// 4. and 5. The second flop reaches the floor, which sits exactly ON the band edge.
week += 1
flop(week, 'prod-2')
row = record('4 flop P2 = FLOOR', week)
const floor45 = row.closeness
assert.equal(currentTier(low(), week), 'Acquaintances')
assert.equal(floor45, RELATIONSHIP_TIER_FLOOR.Acquaintances, 'the floor is the Acquaintances floor itself')
assert.equal(floor45, STRAINED_CEILING + 1, 'exactly one point above the Strained ceiling')
// 6. Six more take/flop cycles: 45 is a fixed point, never re-reached downward.
let runningMin = floor45
for (let p = 3; p <= PRODUCTIONS; p++) {
  week += 1; take(week, `prod-${String(p)}`)
  week += 1; flop(week, `prod-${String(p)}`)
  row = record(`6 cycle P${String(p)}`, week)
  runningMin = Math.min(runningMin, row.closeness)
}
assert.equal(runningMin, floor45, 'no later cycle goes below the floor')
assert.ok(rows.every((r) => r.minAllSix >= floor45), 'no other proximity class goes below the low pair')

// 7. HYPOTHETICAL ARITHMETIC — NOT A MEASUREMENT OF THE SHIPPED CONSTANT.
// Nothing in src/ was changed: `failure` is a LOCAL number standing in for
// RELATIONSHIP_FAILURE_DELTA (shipped value 4, unaltered and still imported above).
// Drift comes from the REAL `currentCloseness` and the band from the REAL
// `currentTier`; only the one delta is substituted. Values are asserted in range
// rather than clamped, so the probe never re-implements the owner's clamp.
function replay(failure: number) {
  let closeness = RELATIONSHIP_BASELINE + RELATIONSHIP_PROXIMITY_LOW
  let anchor = 10
  let productions = 1
  const drift = (w: number) => currentCloseness({ closeness, lastEventWeek: anchor }, w)
  const step = (value: number, w: number) => {
    assert.ok(value >= 0 && value <= 100, `hypothetical failure=${String(failure)} left the 0..100 range at week ${String(w)}`)
    closeness = value; anchor = w
  }
  let w = 10 + DORMANCY
  step(drift(w) - failure, w)
  let min = closeness
  for (let p = 2; p <= PRODUCTIONS; p++) {
    w += 1; productions += 1
    step(drift(w) + RELATIONSHIP_PROXIMITY_LOW + Math.min(productions - 1, RELATIONSHIP_REPEAT_CAP), w)
    w += 1
    step(drift(w) - failure, w)
    min = Math.min(min, closeness)
  }
  return { failureDelta: failure, minimumReached: min, tierAtMinimum: currentTier({ closeness: min, lastEventWeek: w }, w), entersStrained: min <= STRAINED_CEILING }
}
const shipped = replay(RELATIONSHIP_FAILURE_DELTA)
assert.equal(shipped.minimumReached, floor45, 'the hypothetical model must reproduce the MEASURED floor at the shipped delta')
const sensitivity = [RELATIONSHIP_FAILURE_DELTA, 5, 6, 7].map(replay)

const sha = createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex')
console.log('WITNESS681_SELF', JSON.stringify({ selfScriptSha256: sha, constructedWorstCase: true, seed: null, campaign: null,
  baseline: RELATIONSHIP_BASELINE, low: RELATIONSHIP_PROXIMITY_LOW, failureDelta: RELATIONSHIP_FAILURE_DELTA, repeatCap: RELATIONSHIP_REPEAT_CAP,
  dormantWeeksStaged: DORMANCY, strainedCeiling: STRAINED_CEILING, nodeVersion: process.version, platform: process.platform, arch: process.arch }))
console.log('\n  step                          week  closeness  tier            P  F  min(all six)')
for (const r of rows) {
  console.log(`  ${r.step.padEnd(28)}  ${String(r.week).padStart(4)}  ${String(r.closeness).padStart(9)}  ${r.tier.padEnd(14)}  ${String(r.P)}  ${String(r.F)}  ${String(r.minAllSix).padStart(12)}`)
}
console.log(`\n  MEASURED FLOOR ${String(floor45)} = RELATIONSHIP_TIER_FLOOR.Acquaintances, one point above the Strained ceiling ${String(STRAINED_CEILING)}`)
console.log('\n  HYPOTHETICAL ARITHMETIC (no src/ constant changed; shipped delta is the first row)')
for (const s of sensitivity) {
  console.log(`  failureDelta=${String(s.failureDelta)}${s.failureDelta === RELATIONSHIP_FAILURE_DELTA ? ' (SHIPPED)' : ' (hypothetical)'} min ${String(s.minimumReached)} tier ${s.tierAtMinimum} entersStrained ${String(s.entersStrained)}`)
}
console.log('JSON ' + JSON.stringify({ probe: '681-b5-closeness-floor-witness.ts', selfScriptSha256: sha,
  constructedWorstCase: true, measuredFloor: floor45, acquaintancesFloor: RELATIONSHIP_TIER_FLOOR.Acquaintances, strainedCeiling: STRAINED_CEILING,
  marginToStrained: floor45 - STRAINED_CEILING, productions: PRODUCTIONS, dormantWeeksStaged: DORMANCY, steps: rows,
  hypotheticalArithmetic: sensitivity, environment: { nodeVersion: process.version, platform: process.platform, arch: process.arch } }))
