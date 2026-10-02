// Record 1358-C — independent-test-engineer RED for P14B relationship rulings SLICE B, ROMANCE
// (D-1312-2, 1340-O:69-79; 1347-A §2.3 as amended/adopted by 1347-F's non-blocking note; 1347-A §5
// `p14b10-romance`). Authored on a scratch tree (1327-C method) at BASE
// c614b7e9ed62dcb889118ba1eadb8a2bafa7934a with slice A applied (committed `slice-a`), branch
// wip/headless-program-20260916-ts.
//
// Revised as record 1358-C2 (RED r2) on a scratch tree at BASE
// 469a9547f1a3b53b7c9985ec53beaa55e2a65587 (after the Save43 pin sweep cec3902c), slice A applied
// the same way. The r2 changes follow 1358-F-parent-rulings-on-1358-C.md §1-§3, plus §4 F4 for one
// ending leaf's RED guard; each is named where it lands. Revised again as record 1358-C3 (RED r3) on
// the same base under the parent's rulings on 1358-C2 (1358-F2): the write order (item 1), the
// baseWorld budget (item 4) and titles that state the ruled seam and API (item 6). Revised again as
// record 1358-C4 (RED r4) at HEAD b08096020e4dccf8c22d036bbd9fb7ad742e5aea, where slice A has landed,
// under the parent's rulings on the dry run 1358-X (1358-F3): the final baseWorld budget (item 2)
// and the third-party leaf's guard (item 3). Revised again as record 1358-C5 (RED r5) under the
// parent's rulings on review 1358-D (1358-F4): the consequences, the non-triggers, a decayed third-party
// bond and the twin-edge ending check (item 2), and the adopted notes, each named where it lands.
//
// AUTHORITY (read in full before use):
//   docs/.../1340-O-owner-rulings-20260929.md D-1312-2 (:69-79): "Choose candidate A ... Partners
//     remain exempt from ordinary friendship drift, but sustained separation may decay the separate
//     romance track and end the bond. Use a grace period and an exit threshold below formation ...
//     Record the ending once. Do not erase friendship/history or add a conflict penalty to an
//     amicable breakup. Changing studios, retirement or a friendship-tier drop alone does not
//     automatically end the romance."
//   docs/.../1347-A-p14b-relationship-rulings-charter.md §2.3 (:43-60), §3 (:79-84 the named
//     constants and their rationale), §5 `p14b10-romance` (:123-130).
//   docs/.../1347-F-parent-relationship-charter-adoption.md non-blocking notes (:49-51): "The romance
//     track's eligibility. Growth and formation both require that the pair is at Friends or above
//     and that neither person has an open bond with anyone (companion §5.4a). The formation check
//     remains the one point that appends a bond."
//
// PARENT API DECISION UNDER TEST (brief PARENT API DECISIONS, bullet 1): src/core/relationships.ts:
// `RelationshipEdge` gains `romance: RomanceTrack | null` with `RomanceTrack = { value: number;
// anchorWeek: number; bonds: { formedWeek: number; endedWeek: number | null }[] }`. Exported
// constants `ROMANCE_FORMATION_THRESHOLD` 75, `ROMANCE_EXIT_THRESHOLD` 40, `ROMANCE_PROXIMITY_GAIN`
// 10, `ROMANCE_SUCCESS_GAIN` 5, `ROMANCE_GRACE_WEEKS` 104, `ROMANCE_DECAY_WEEKS` 260.
// `currentRomanceValue(romance, week): number` and `romanceStatus(edge, week): 'partners'|'ended'|null`.
//
// THE DISPUTED READING, RULED (1358-F §1, Reading B): "anyone" in 1347-F's eligibility note excludes
// the pair's own partner. An already-partnered pair keeps growing under the same drivers, up to the
// 0-100 bound; 1347-A §3 prices the life of a bond at 100, a value only continued growth reaches. A
// THIRD PARTY's open bond still blocks growth and formation ("growth is blocked by a THIRD PARTY's
// open bond" below). The leaf "romance-partnered-pair-keeps-growing" pins Reading B.
//
// GAP 1, THE WRITE SEAM, RULED (1358-F §2): growth, formation and the recorded ending run in the
// existing tick seam `advanceRelationshipsWeek(state, delta, week)` (src/core/relationships.ts:310
// with slice A applied), which already reads the week's takes and releases (1347-A §2.3 "at the
// tick seam, from the week's changes only"). Every growth, formation and ending leaf below calls it
// with that unchanged signature.
//
// GAP 2, THE DRIFT-EXEMPTION READ SITE, RULED (1358-F §3): `currentCloseness` takes the strict
// `Pick<RelationshipEdge, 'closeness' | 'lastEventWeek' | 'romance'>`, with `romance` required, the
// slice A precedent of a required `sharedCompetitions` (1348-F4 item 2). It holds the stored
// closeness while `romanceStatus(edge, week) === 'partners'`, and after the ending it counts
// dormancy from `max(lastEventWeek, endedWeek)`. `currentTier` widens its Pick the same way. A
// caller that omits `romance` fails to compile; callers that build partial edges gain
// `romance: null` in the production sweep, not in this RED. The drift leaves at the end of this
// file pin each part. The type-level parts are a `@ts-expect-error` on a call without `romance` and
// literals typed `Parameters<typeof currentCloseness>[0]` (or `currentTier`) that carry it.
//
// THE WRITE ORDER, RULED (1358-F2 item 1, from 1347-A §2.3 "the same shape as currentCloseness" and
// `writeEdge`, which materializes drift before the delta): a romance write first records any derived
// ending ("before any new driver applies"), then reads `currentRomanceValue(romance, writeWeek)`,
// then adds any gain, clamps to 0..100 and sets `anchorWeek` to the write week.
//
// RED MECHANISM: `src/core/relationships.ts` already exists (an EXISTING module) — every missing
// named export binds to `undefined` under vite, never a resolution error, so every leaf below is a
// value/behavioral assertion (the p14b10-conflict-evidence.test.ts convention), never existence
// alone. `RomanceTrack`/`RomanceBond` are locally redeclared (they do not exist on `types.ts` yet —
// the same convention every other 1358-C file uses) rather than type-imported.
//
// FIXTURE STRATEGY: every leaf is a PURE, STAGED (I3 "reader-admitted") edge, injected via
// `advanceRelationshipsWeek` (a pure function; no `makeSave`/`live()` round-trip, since the era-44
// validator does not exist in production yet and would reject the new fields as "not a field of this
// record" for a reason UNRELATED to what these leaves test) or read directly with
// `currentRomanceValue`/`romanceStatus`. Synthetic `Production`-shaped objects are cast
// `as unknown as Production` (this file's own minimal analogue of the `withEdges`/`withRoot`
// `as unknown as GameState` convention already established throughout this test suite) — only the
// fields `seatPairs` reads (`id`, `directorId`, `cast`) are populated; nothing else about them is
// asserted or needed.

import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { describe, expect, it } from 'vitest'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { fund } from './helpers/p14b2-fixtures.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState, Production, RelationshipTier } from '../src/core/types.js'
import {
  ROMANCE_DECAY_WEEKS, ROMANCE_EXIT_THRESHOLD, ROMANCE_FORMATION_THRESHOLD, ROMANCE_GRACE_WEEKS,
  ROMANCE_PROXIMITY_GAIN, ROMANCE_SUCCESS_GAIN, RELATIONSHIP_TIER_FLOOR, RELATIONSHIP_SUCCESS_CRITIC_SCORE,
  advanceRelationshipsWeek, currentCloseness, currentRomanceValue, currentTier, romanceStatus,
  RELATIONSHIP_BASELINE, RELATIONSHIP_DRIFT_GRACE_WEEKS, RELATIONSHIP_DRIFT_RETURN_WEEKS,
  RELATIONSHIP_FAILURE_CRITIC_SCORE, pairChemistry,
} from '../src/core/relationships.js'

type RomanceBond = { formedWeek: number; endedWeek: number | null }
type RomanceTrack = { value: number; anchorWeek: number; bonds: RomanceBond[] }
type Edge = {
  edgeId: string; a: string; b: string; closeness: number; firstSharedWeek: number; lastEventWeek: number
  sharedProductions: number; sharedSuccesses: number; sharedFailures: number; sharedCancellations: number
  sharedCompetitions: number; peakTier: RelationshipTier; peakTierWeek: number; recent: { kind: string; week: number; ref: string; delta: number }[]
  competitions: unknown[]; romance: RomanceTrack | null
}
const canon = (x: string, y: string): readonly [string, string] => (x < y ? [x, y] : [y, x])
const floor = (tier: RelationshipTier): number => (RELATIONSHIP_TIER_FLOOR as Record<RelationshipTier, number>)[tier]

/** A STAGED edge, the `stagedEdge` I3 convention every 1358-C/1348-C file shares. */
function stagedEdge(index: number, x: string, y: string, closeness: number, lastEventWeek: number, extra: Partial<Edge> = {}): Edge {
  const [a, b] = canon(x, y)
  return {
    edgeId: `relationship-edge-${String(index)}`, a, b, closeness, firstSharedWeek: lastEventWeek, lastEventWeek,
    sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, sharedCompetitions: 0,
    peakTier: 'Friends', peakTierWeek: lastEventWeek, recent: [{ kind: 'sharedProduction', week: lastEventWeek, ref: 'staged-production', delta: 2 }],
    competitions: [], romance: null, ...extra,
  }
}
const withEdges = (state: GameState, relationships: readonly Edge[]): GameState => ({ ...state, relationships } as unknown as GameState)
const edgeOf = (state: GameState, x: string, y: string): Edge | undefined =>
  (state.relationships as unknown as Edge[]).find((e) => (e.a === x && e.b === y) || (e.a === y && e.b === x))

/** A minimal high/low-proximity synthetic take — only the three fields `seatPairs` reads are
 * populated (see file header). `directorId`+`lead` is HIGH proximity; `antagonist`+`support` is LOW. */
function syntheticTake(id: string, directorId: string, lead: string, antagonist: string, support: string): Production {
  return { id, directorId, cast: { lead, antagonist, support } } as unknown as Production
}

/** 1358-F2 item 4 (1348-F4 item 3: never keep a limit that cannot fire). vitest 2.1.9 starts a test's
 * timer only after a synchronous body returns, so no `it` timeout can stop the build below; the build
 * times itself instead. 1358-F4 adopts 120,000 ms (1358-D note 1): 1358-X2 measured this build at
 * 22,617 ms on Node v20.20.2, about 84 s at the worst measured load factor of 3.7, which left 7%
 * headroom under F3's 90,000 ms. */
const BASEWORLD_BUDGET_MS = 120_000

let worldCache: { state: GameState; people: readonly string[] } | undefined
let worldOverBudget: Error | undefined // cached, so no later leaf pays an over-budget build again
/** A real, minimal founded world (for real talent ids only — every edge below is staged), built once per file. */
function baseWorld(): { state: GameState; people: readonly string[] } {
  if (worldOverBudget !== undefined) throw worldOverBudget
  if (worldCache === undefined) {
    const started = performance.now()
    let s = fund(p13aGeneratedStudio())
    s = advanceTo(s, 400) // headroom so every `week - N` calendar/decay arithmetic below stays non-negative
    const elapsedMs = performance.now() - started
    if (elapsedMs > BASEWORLD_BUDGET_MS) {
      worldOverBudget = Object.assign(new Error(`baseWorld() took ${Math.round(elapsedMs)} ms, over BASEWORLD_BUDGET_MS (${BASEWORLD_BUDGET_MS} ms)`),
        { name: 'BaseWorldBudgetExceeded' })
      throw worldOverBudget
    }
    const people = s.talent.slice(0, 8).map((t) => t.id)
    assert.ok(people.length >= 8, 'route premise: at least 8 talent ids exist')
    worldCache = { state: s, people }
  }
  return { state: worldCache.state, people: worldCache.people }
}

describe('P14B10 T1 — the new bindings exist (RED at behavior, never a vacuous undefined pass)', () => {
  it('every romance constant is the Owner/charter-named value (1347-A §3), and both functions exist', () => {
    expect(ROMANCE_FORMATION_THRESHOLD).toBe(75)
    expect(ROMANCE_EXIT_THRESHOLD).toBe(40)
    expect(ROMANCE_PROXIMITY_GAIN).toBe(10)
    expect(ROMANCE_SUCCESS_GAIN).toBe(5)
    expect(ROMANCE_GRACE_WEEKS).toBe(104)
    expect(ROMANCE_DECAY_WEEKS).toBe(260)
    expect(typeof currentRomanceValue, 'currentRomanceValue').toBe('function')
    expect(typeof romanceStatus, 'romanceStatus').toBe('function')
  })

  it('the named relation holds: EXIT_THRESHOLD is strictly below FORMATION_THRESHOLD (1347-A §3: "the wide gap stops bonds flickering")', () => {
    expect(ROMANCE_EXIT_THRESHOLD).toBeLessThan(ROMANCE_FORMATION_THRESHOLD)
  })
})

describe('currentRomanceValue — pure decay arithmetic (the currentCloseness shape, target 0 instead of the baseline)', () => {
  it('holds the stored value inside the grace window (dormant = 0, and dormant = GRACE exactly)', () => {
    const romance: RomanceTrack = { value: 80, anchorWeek: 1000, bonds: [] }
    expect(currentRomanceValue(romance, 1000)).toBe(80)
    expect(currentRomanceValue(romance, 1000 + ROMANCE_GRACE_WEEKS)).toBe(80)
  })

  it('decays linearly toward 0 partway through the decay window (independent hand-derived oracle)', () => {
    const romance: RomanceTrack = { value: 80, anchorWeek: 1000, bonds: [] }
    const halfway = 1000 + ROMANCE_GRACE_WEEKS + Math.floor(ROMANCE_DECAY_WEEKS / 2)
    const span = Math.floor(ROMANCE_DECAY_WEEKS / 2)
    const expected = 80 - Math.trunc(80 * span / ROMANCE_DECAY_WEEKS) // hand-derived: value - trunc(value*span/DECAY)
    expect(currentRomanceValue(romance, halfway)).toBe(expected)
  })

  it('reaches exactly 0 at GRACE + DECAY weeks, and never goes negative or rises past that floor afterward', () => {
    const romance: RomanceTrack = { value: 80, anchorWeek: 1000, bonds: [] }
    expect(currentRomanceValue(romance, 1000 + ROMANCE_GRACE_WEEKS + ROMANCE_DECAY_WEEKS)).toBe(0)
    expect(currentRomanceValue(romance, 1000 + ROMANCE_GRACE_WEEKS + ROMANCE_DECAY_WEEKS + 500)).toBe(0)
  })

  it('a value of 0 stays 0 through the whole window (no negative drift)', () => {
    const romance: RomanceTrack = { value: 0, anchorWeek: 1000, bonds: [] }
    for (const week of [1000, 1000 + ROMANCE_GRACE_WEEKS, 1000 + ROMANCE_GRACE_WEEKS + ROMANCE_DECAY_WEEKS]) {
      expect(currentRomanceValue(romance, week)).toBe(0)
    }
  })

  it('a value of exactly ROMANCE_FORMATION_THRESHOLD decays below ROMANCE_EXIT_THRESHOLD before reaching 0 (the named 229-week note, 1347-A §3)', () => {
    // A loop bound of `undefined + undefined` is NaN, which makes `week <= NaN` false from the
    // very first iteration — the loop body (and so `currentRomanceValue`) would then never run at
    // all, turning a genuine RED (the constants are missing) into a confusing "-1" result instead
    // of a clear, attributable failure. Guarded explicitly so THIS leaf's own RED names the real
    // reason directly, matching the file's dedicated bindings-check leaf above.
    expect(typeof ROMANCE_GRACE_WEEKS, 'ROMANCE_GRACE_WEEKS').toBe('number')
    expect(typeof ROMANCE_DECAY_WEEKS, 'ROMANCE_DECAY_WEEKS').toBe('number')
    const romance: RomanceTrack = { value: ROMANCE_FORMATION_THRESHOLD, anchorWeek: 0, bonds: [] }
    // 1347-A §3: "A bond at 75 ends about 229 weeks after the last shared picture" — hand-derive the
    // exact crossing week from the law's own formula rather than trusting the prose "about 229".
    let crossing = -1
    for (let week = 0; week <= ROMANCE_GRACE_WEEKS + ROMANCE_DECAY_WEEKS; week++) {
      if (currentRomanceValue(romance, week) < ROMANCE_EXIT_THRESHOLD) { crossing = week; break }
    }
    expect(crossing).toBeGreaterThan(0)
    expect(crossing).toBeLessThan(ROMANCE_GRACE_WEEKS + ROMANCE_DECAY_WEEKS)
    expect(currentRomanceValue(romance, crossing)).toBeLessThan(ROMANCE_EXIT_THRESHOLD)
    expect(currentRomanceValue(romance, crossing - 1)).toBeGreaterThanOrEqual(ROMANCE_EXIT_THRESHOLD)
  })
})

describe('romanceStatus — pure reads (no route needed; independent of tier, closeness, studio or employment)', () => {
  it('null romance reads null', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', 65, 1000, { romance: null })
    expect(romanceStatus(edge, 1000)).toBeNull()
  })

  it('a track with no bond ever formed (still accumulating) reads null, not "partners"', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', 65, 1000, { romance: { value: 50, anchorWeek: 1000, bonds: [] } })
    expect(romanceStatus(edge, 1000)).toBeNull()
  })

  it('an OPEN bond whose derived value is still at/above EXIT_THRESHOLD reads "partners"', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', 65, 1000, { romance: { value: 90, anchorWeek: 1000, bonds: [{ formedWeek: 1000, endedWeek: null }] } })
    expect(romanceStatus(edge, 1000)).toBe('partners')
  })

  it('an OPEN bond whose derived value has now decayed below EXIT_THRESHOLD reads "ended" — COMPUTED ON READ, before any write has persisted endedWeek', () => {
    const romance: RomanceTrack = { value: 90, anchorWeek: 1000, bonds: [{ formedWeek: 1000, endedWeek: null }] }
    const farWeek = 1000 + ROMANCE_GRACE_WEEKS + ROMANCE_DECAY_WEEKS // fully decayed to 0, well below EXIT_THRESHOLD
    expect(currentRomanceValue(romance, farWeek)).toBeLessThan(ROMANCE_EXIT_THRESHOLD) // fixture premise
    const edge = stagedEdge(0, 'p-a', 'p-b', 65, 1000, { romance })
    expect(romanceStatus(edge, farWeek)).toBe('ended')
    // Storage itself is UNTOUCHED by this read (the write-on-touch rule only fires at the next WRITE).
    expect(edge.romance!.bonds[0]!.endedWeek).toBeNull()
  })

  it('an already-recorded closed bond reads "ended" at every later week too, unconditionally', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', 65, 1000, { romance: { value: 30, anchorWeek: 900, bonds: [{ formedWeek: 500, endedWeek: 900 }] } })
    expect(romanceStatus(edge, 1000)).toBe('ended')
    expect(romanceStatus(edge, 5000)).toBe('ended')
  })

  it('romanceStatus is independent of tier/closeness: a Partners pair at Strained closeness still reads "partners" (D-1312-2: a friendship-tier drop alone does not end the romance)', () => {
    const edge = stagedEdge(0, 'p-a', 'p-b', floor('Strained'), 1000, { romance: { value: 85, anchorWeek: 1000, bonds: [{ formedWeek: 1000, endedWeek: null }] } })
    expect(currentTier(edge, 1000)).toBe('Strained') // fixture premise
    expect(romanceStatus(edge, 1000)).toBe('partners')
  })

  it('romanceStatus takes no argument beyond (edge, week) — by construction it cannot consult studio, retirement or employment (D-1312-2 non-triggers)', () => {
    expect(romanceStatus.length).toBe(2)
  })
})

describe('growth in advanceRelationshipsWeek (1358-F §2): eligibility is Friends+ and no open bond with anyone but the pair\'s own partner (1347-F note; 1358-F §1)', () => {
  it('below Friends, a qualifying high-proximity 2nd+ shared production grants NO romance growth', () => {
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    const edge = stagedEdge(0, d!, l!, floor('Acquaintances'), week, { sharedProductions: 1, romance: null })
    const next = advanceRelationshipsWeek(withEdges(state, [edge]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('growth-take-below-friends', d!, l!, a2!, s2!) }], releases: [] }, week + 1)
    const written = edgeOf(next, d!, l!)!
    expect(written.sharedProductions).toBe(2) // fixture premise: the take DID count as their 2nd shared production
    expect(written.romance).toBeNull() // no growth: tier is below Friends
  })

  it('growth is blocked by a THIRD PARTY\'s open bond (1358-F §1: Reading B excludes only the pair\'s own partner)', () => {
    // Guard first (1358-F2 §7, 1358-F3 item 3): with the constants missing the staged value is NaN, and NaN read back equals NaN.
    for (const [name, value] of Object.entries({ ROMANCE_FORMATION_THRESHOLD, ROMANCE_PROXIMITY_GAIN })) expect(typeof value, name).toBe('number')
    const { state, people } = baseWorld()
    const [d, l, a2, s2, z] = people
    const week = state.market.tick
    // (d,l) sits ONE gain below the formation threshold; (l,z) already holds an OPEN bond.
    const dl = stagedEdge(0, d!, l!, floor('Friends'), week, { sharedProductions: 1, romance: { value: ROMANCE_FORMATION_THRESHOLD - ROMANCE_PROXIMITY_GAIN, anchorWeek: week, bonds: [] } })
    const lz = stagedEdge(1, l!, z!, floor('Friends'), week, { sharedProductions: 2, romance: { value: 80, anchorWeek: week, bonds: [{ formedWeek: week - 10, endedWeek: null }] } })
    const next = advanceRelationshipsWeek(withEdges(state, [dl, lz]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('growth-take-blocked', d!, l!, a2!, s2!) }], releases: [] }, week + 1)
    const written = edgeOf(next, d!, l!)!
    expect(written.sharedProductions).toBe(2) // fixture premise: this IS their qualifying 2nd+ shared production
    // Eligibility fails (l already holds an open bond with z, a THIRD party): growth does not apply,
    // and formation (which this take would otherwise have crossed) does not fire either.
    expect(written.romance!.value).toBe(ROMANCE_FORMATION_THRESHOLD - ROMANCE_PROXIMITY_GAIN)
    expect(written.romance!.bonds).toEqual([])
  })

  it('romance-partnered-pair-keeps-growing: after formation, a shared success raises the pair\'s own value, capped at 100 (1358-F §1, Reading B: "anyone" excludes the pair\'s own partner)', () => {
    // Guard first: with the gain missing the staged value is NaN, and NaN read back equals NaN.
    expect(typeof ROMANCE_SUCCESS_GAIN, 'ROMANCE_SUCCESS_GAIN').toBe('number')
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    const production = syntheticTake('partnered-success-prod', d!, l!, a2!, s2!)
    const firstTake = { eventId: 'first-take-event-partnered-1', week, productionId: production.id, studioId: 'irrelevant',
      directorId: d!, cast: { lead: l!, antagonist: a2!, support: s2! } }
    const stateWithTake: GameState = { ...state, firstTakes: [...state.firstTakes, firstTake as unknown as GameState['firstTakes'][number]] }
    // (d,l) are partners: one OPEN bond with each other and no bond with anyone else. One success
    // takes the value past 100, so the cap binds. Anchored this week, so no decay applies at the write.
    const staged = 100 - ROMANCE_SUCCESS_GAIN + 1
    const bond: RomanceBond = { formedWeek: week - 10, endedWeek: null }
    const edge = stagedEdge(0, d!, l!, floor('CloseFriends'), week, { sharedProductions: 3, romance: { value: staged, anchorWeek: week, bonds: [bond] } })
    const film = { productionId: production.id, releaseTick: week, criticScore: RELATIONSHIP_SUCCESS_CRITIC_SCORE } as unknown as GameState['studio']['releasedFilms'][number]
    const next = advanceRelationshipsWeek(withEdges(stateWithTake, [edge]), { takes: [], releases: [film] }, week + 1)
    const written = edgeOf(next, d!, l!)!
    expect(written.sharedSuccesses).toBe(1) // fixture premise: the existing success driver fired
    expect(written.romance!.value).toBe(Math.min(100, staged + ROMANCE_SUCCESS_GAIN)) // grew past `staged`, stopped at 100
    expect(written.romance!.bonds).toEqual([bond]) // the same open bond; growth appends no second one
    expect(written.romance!.anchorWeek).toBe(week + 1) // 1358-F8 ruling 3 (F2 §1): a gaining success anchors the track at the write week
  })
})

describe('growth in advanceRelationshipsWeek (1358-F §2): the eligible case, written in the ruled order (1358-F2 item 1)', () => {
  it('a high-proximity (director-lead) 2nd+ shared production, Friends+, no open bond anywhere, adds ROMANCE_PROXIMITY_GAIN and resets anchorWeek', () => {
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    const edge = stagedEdge(0, d!, l!, floor('Friends'), week, { sharedProductions: 1, romance: null })
    const next = advanceRelationshipsWeek(withEdges(state, [edge]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('growth-take-eligible', d!, l!, a2!, s2!) }], releases: [] }, week + 1)
    const written = edgeOf(next, d!, l!)!
    expect(written.sharedProductions).toBe(2)
    expect(written.romance).not.toBeNull()
    expect(written.romance!.value).toBe(ROMANCE_PROXIMITY_GAIN) // the track starts at 0; first-ever qualifying gain sets it
    expect(written.romance!.anchorWeek).toBe(week + 1)
    expect(written.romance!.bonds).toEqual([]) // 10 < 75: no formation yet
  })

  it('lead-antagonist is ALSO high proximity (1347-A §2.3 names both seat pairs) and grants the same gain', () => {
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    const edge = stagedEdge(0, l!, a2!, floor('Friends'), week, { sharedProductions: 1, romance: null })
    const next = advanceRelationshipsWeek(withEdges(state, [edge]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('growth-take-lead-antag', d!, l!, a2!, s2!) }], releases: [] }, week + 1)
    const written = edgeOf(next, l!, a2!)!
    expect(written.romance!.value).toBe(ROMANCE_PROXIMITY_GAIN)
  })

  it('director-support is LOW proximity and grants NO romance gain (but still resets anchorWeek if a track already exists — "any shared take resets separation")', () => {
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    // 1358-F2 item 1(a): the anchor sits inside ROMANCE_GRACE_WEEKS, so no decay applies at the touch and
    // the leaf tests only its title. Decay at a touch is the next leaf's subject.
    const staged = 50, anchor = week - 100
    const edge = stagedEdge(0, d!, s2!, floor('Friends'), week, { sharedProductions: 1, romance: { value: staged, anchorWeek: anchor, bonds: [] } })
    const next = advanceRelationshipsWeek(withEdges(state, [edge]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('growth-take-low-prox', d!, l!, a2!, s2!) }], releases: [] }, week + 1)
    const written = edgeOf(next, d!, s2!)!
    expect(written.romance!.value).toBe(staged) // LOW proximity: no gain
    expect(written.romance!.anchorWeek).toBe(week + 1) // but the anchor still resets — "any shared take"
    // Fixture premise, after the behaviour so the RED names the anchor: the touch falls inside the grace window.
    expect(week + 1 - anchor).toBeLessThanOrEqual(ROMANCE_GRACE_WEEKS)
  })

  it('a write materializes first: a high-proximity touch outside the grace window reads currentRomanceValue at the write week, then adds ROMANCE_PROXIMITY_GAIN (1358-F2 item 1)', () => {
    // Guard first: with the constants missing every expected value below is NaN.
    for (const [name, value] of Object.entries({ ROMANCE_GRACE_WEEKS, ROMANCE_DECAY_WEEKS, ROMANCE_PROXIMITY_GAIN })) expect(typeof value, name).toBe('number')
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    const staged = 50, anchor = week - 200, writeWeek = week + 1 // 201 weeks apart: outside ROMANCE_GRACE_WEEKS
    const edge = stagedEdge(0, d!, l!, floor('Friends'), week, { sharedProductions: 1, romance: { value: staged, anchorWeek: anchor, bonds: [] } })
    const next = advanceRelationshipsWeek(withEdges(state, [edge]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('growth-take-materialize', d!, l!, a2!, s2!) }], releases: [] }, writeWeek)
    const written = edgeOf(next, d!, l!)!
    // The decay law at the write week (1347-A §2.3), and the three candidate orders it separates.
    const span = Math.min(writeWeek - anchor - ROMANCE_GRACE_WEEKS, ROMANCE_DECAY_WEEKS)
    const decayed = (value: number): number => value - Math.trunc(value * span / ROMANCE_DECAY_WEEKS)
    const restoreThenGain = staged + ROMANCE_PROXIMITY_GAIN // 60
    const materializeThenGain = decayed(staged) + ROMANCE_PROXIMITY_GAIN // 32 + 10 = 42, the ruled order
    const gainThenDecay = decayed(staged + ROMANCE_PROXIMITY_GAIN) // 38
    expect(new Set([restoreThenGain, materializeThenGain, gainThenDecay]).size).toBe(3) // fixture premise: the orders differ
    expect(written.sharedProductions).toBe(2) // fixture premise: this is their 2nd shared production
    expect(written.romance!.value).toBe(Math.min(100, materializeThenGain))
    expect(written.romance!.anchorWeek).toBe(writeWeek)
  })

  it('a shared SUCCESS (release) adds ROMANCE_SUCCESS_GAIN, Friends+ and no open bond', () => {
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    const production = syntheticTake('growth-success-prod', d!, l!, a2!, s2!)
    // The pair must already share a first take on record for the release leg to join it
    // (advanceRelationshipsWeek's own existing rule: `state.firstTakes.find(t => t.productionId === film.productionId)`).
    const firstTake = { eventId: 'first-take-event-growth-1', week, productionId: production.id, studioId: 'irrelevant',
      directorId: d!, cast: { lead: l!, antagonist: a2!, support: s2! } }
    const stateWithTake: GameState = { ...state, firstTakes: [...state.firstTakes, firstTake as unknown as GameState['firstTakes'][number]] }
    const edge = stagedEdge(0, d!, l!, floor('Friends'), week, { sharedProductions: 2, romance: null }) // already past their 1st production
    const film = { productionId: production.id, releaseTick: week, criticScore: RELATIONSHIP_SUCCESS_CRITIC_SCORE } as unknown as GameState['studio']['releasedFilms'][number]
    const next = advanceRelationshipsWeek(withEdges(stateWithTake, [edge]), { takes: [], releases: [film] }, week + 1)
    const written = edgeOf(next, d!, l!)!
    expect(written.sharedSuccesses).toBe(1) // fixture premise: the existing success driver fired
    expect(written.romance!.value).toBe(ROMANCE_SUCCESS_GAIN)
  })

  it('a rival pair (a rival studioId on the take) forms a bond under the SAME law (1347-A §5: "A rival pair forms under the same law")', () => {
    // 1358-F4 (titles): r4's title said "forms" but checked only the first gain, and its "[control: …]"
    // tag sat on a failing leaf. The pair now starts one gain below the threshold, so the take crosses it.
    for (const [name, value] of Object.entries({ ROMANCE_FORMATION_THRESHOLD, ROMANCE_PROXIMITY_GAIN })) expect(typeof value, name).toBe('number')
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    const crossingWeek = week + 1
    const edge = stagedEdge(0, d!, l!, floor('Friends'), week, { sharedProductions: 1, romance: { value: ROMANCE_FORMATION_THRESHOLD - ROMANCE_PROXIMITY_GAIN, anchorWeek: week, bonds: [] } })
    const next = advanceRelationshipsWeek(withEdges(state, [edge]),
      { takes: [{ studioId: 'studio-some-rival-r01', production: syntheticTake('growth-take-rival', d!, l!, a2!, s2!) }], releases: [] }, crossingWeek)
    const written = edgeOf(next, d!, l!)!
    expect(written.romance!.value).toBe(ROMANCE_FORMATION_THRESHOLD)
    expect(written.romance!.bonds).toEqual([{ formedWeek: crossingWeek, endedWeek: null }])
  })
})

describe('formation — dated once, at the crossing write', () => {
  it('crossing ROMANCE_FORMATION_THRESHOLD appends a bond with formedWeek = the crossing week and endedWeek null', () => {
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    // One gain below threshold; the next qualifying high-proximity take crosses it.
    const edge = stagedEdge(0, d!, l!, floor('Friends'), week, { sharedProductions: 1, romance: { value: ROMANCE_FORMATION_THRESHOLD - ROMANCE_PROXIMITY_GAIN, anchorWeek: week, bonds: [] } })
    const crossingWeek = week + 1
    const next = advanceRelationshipsWeek(withEdges(state, [edge]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('growth-take-formation', d!, l!, a2!, s2!) }], releases: [] }, crossingWeek)
    const written = edgeOf(next, d!, l!)!
    expect(written.romance!.value).toBe(ROMANCE_FORMATION_THRESHOLD)
    expect(written.romance!.bonds).toEqual([{ formedWeek: crossingWeek, endedWeek: null }])
  })

  it('a re-formation (after an ended bond) appends a SECOND bond row, never overwriting the first', () => {
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    // 1358-F4 (1358-D note 7): every staged week stays non-negative, as baseWorld()'s comment requires.
    const earlier: RomanceBond = { formedWeek: week - 300, endedWeek: week - 100 }
    const edge = stagedEdge(0, d!, l!, floor('Friends'), week, {
      sharedProductions: 3,
      romance: { value: ROMANCE_FORMATION_THRESHOLD - ROMANCE_PROXIMITY_GAIN, anchorWeek: week, bonds: [earlier] },
    })
    const crossingWeek = week + 1
    const next = advanceRelationshipsWeek(withEdges(state, [edge]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('growth-take-reformation', d!, l!, a2!, s2!) }], releases: [] }, crossingWeek)
    const written = edgeOf(next, d!, l!)!
    expect(written.romance!.bonds).toEqual([earlier, { formedWeek: crossingWeek, endedWeek: null }])
  })

  it('a THIRD PARTY\'s open bond that has already ended on read does not block formation, and that formation check records its ending (1347-A:56)', () => {
    // 1358-F4 item 2(c). Guard first: every week below is an expression over these bindings.
    for (const [name, value] of Object.entries({ ROMANCE_FORMATION_THRESHOLD, ROMANCE_PROXIMITY_GAIN, ROMANCE_EXIT_THRESHOLD, ROMANCE_GRACE_WEEKS, ROMANCE_DECAY_WEEKS })) {
      expect(typeof value, name).toBe('number')
    }
    expect(typeof currentRomanceValue, 'currentRomanceValue').toBe('function')
    const { state, people } = baseWorld()
    const [d, l, a2, s2, z] = people
    const week = state.market.tick
    const crossingWeek = week + 1
    // (l,z) still stores its bond as open, but its value decayed below the exit threshold weeks ago.
    const lzAnchor = week - 300
    const lzBond: RomanceBond = { formedWeek: lzAnchor, endedWeek: null }
    const lzTrack: RomanceTrack = { value: 80, anchorWeek: lzAnchor, bonds: [lzBond] }
    let lzEnd = lzAnchor
    while (currentRomanceValue(lzTrack, lzEnd) >= ROMANCE_EXIT_THRESHOLD) {
      lzEnd++
      assert.ok(lzEnd < crossingWeek, 'fixture premise: the (l,z) bond ends on read before the crossing week')
    }
    const dl = stagedEdge(0, d!, l!, floor('Friends'), week, { sharedProductions: 1, romance: { value: ROMANCE_FORMATION_THRESHOLD - ROMANCE_PROXIMITY_GAIN, anchorWeek: week, bonds: [] } })
    const lz = stagedEdge(1, l!, z!, floor('Friends'), lzAnchor, { sharedProductions: 2, romance: lzTrack })
    const next = advanceRelationshipsWeek(withEdges(state, [dl, lz]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('growth-take-decayed-third-party', d!, l!, a2!, s2!) }], releases: [] }, crossingWeek)
    const written = edgeOf(next, d!, l!)!
    expect(written.romance!.value).toBe(ROMANCE_FORMATION_THRESHOLD)
    expect(written.romance!.bonds).toEqual([{ formedWeek: crossingWeek, endedWeek: null }])
    expect(edgeOf(next, l!, z!)!.romance!.bonds).toEqual([{ ...lzBond, endedWeek: lzEnd }])
  })
})

describe('ending — computed on read, persisted once at the next touching write, never moved again', () => {
  it('the next write that touches the edge persists the READ-derived ending week into endedWeek', () => {
    // 1358-C2 (1358-F §4 F4, the r1 F3.3 pattern): without these guards the missing constants make
    // formedWeek NaN, the search below never runs, and the leaf throws its own "fixture premise
    // failed" message instead of naming the missing API.
    expect(typeof ROMANCE_GRACE_WEEKS, 'ROMANCE_GRACE_WEEKS').toBe('number')
    expect(typeof ROMANCE_DECAY_WEEKS, 'ROMANCE_DECAY_WEEKS').toBe('number')
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    const formedWeek = week - ROMANCE_GRACE_WEEKS - ROMANCE_DECAY_WEEKS - 10 // long enough ago that today's derived value is already 0
    const romance: RomanceTrack = { value: 80, anchorWeek: formedWeek, bonds: [{ formedWeek, endedWeek: null }] }
    const derivedEndWeek = (() => {
      for (let w = formedWeek; w <= week; w++) if (currentRomanceValue(romance, w) < ROMANCE_EXIT_THRESHOLD) return w
      throw new Error('fixture premise failed: the staged track never crosses the exit threshold by `week`')
    })()
    const edge = stagedEdge(0, d!, l!, floor('Friends'), week, { sharedProductions: 3, romance })
    // A further, unrelated shared take is the "next write that touches the edge" (write-on-touch).
    const touchWeek = week + 1
    const next = advanceRelationshipsWeek(withEdges(state, [edge]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('ending-touch-take', d!, l!, a2!, s2!) }], releases: [] }, touchWeek)
    const written = edgeOf(next, d!, l!)!
    expect(written.romance!.bonds[0]!.endedWeek).toBe(derivedEndWeek) // the WEEK THE DECAY CROSSED, never the touch week itself
    expect(written.romance!.bonds[0]!.endedWeek).not.toBe(touchWeek)
  })

  it('once persisted, endedWeek is never moved by a LATER write touching the same edge again', () => {
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    // 1358-F4 (1358-D note 7): every staged week stays non-negative, as baseWorld()'s comment requires.
    const endedWeek = week - 200
    const edge = stagedEdge(0, d!, l!, floor('Friends'), week, {
      sharedProductions: 3,
      romance: { value: 30, anchorWeek: endedWeek, bonds: [{ formedWeek: week - 300, endedWeek }] }, // already recorded
    })
    const next = advanceRelationshipsWeek(withEdges(state, [edge]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('ending-later-touch', d!, l!, a2!, s2!) }], releases: [] }, week + 300)
    const written = edgeOf(next, d!, l!)!
    expect(written.romance!.bonds[0]!.endedWeek).toBe(endedWeek) // unchanged
  })

  it('the ending write moves no closeness, counter, peak or recent: everything but romance equals a twin edge with romance null under the same touch (1347-A:57, :127) [control: passes at RED]', () => {
    // 1358-F4 item 2(d): r4 checked driver kinds and a peak expression that could not fail (peak only
    // rises). The twin edge is the same pair, staged the same way, with no romance at all.
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    const formedWeek = week - ROMANCE_GRACE_WEEKS - ROMANCE_DECAY_WEEKS - 10
    const ending = stagedEdge(0, d!, l!, floor('Friends'), week, { sharedProductions: 1, romance: { value: 80, anchorWeek: formedWeek, bonds: [{ formedWeek, endedWeek: null }] } })
    const twin = stagedEdge(0, d!, l!, floor('Friends'), week, { sharedProductions: 1, romance: null })
    const touch = (staged: Edge): Edge => edgeOf(advanceRelationshipsWeek(withEdges(state, [staged]),
      { takes: [{ studioId: 'irrelevant', production: syntheticTake('ending-driver-check', d!, l!, a2!, s2!) }], releases: [] }, week + 1), d!, l!)!
    const { romance: _ended, ...written } = touch(ending)
    const { romance: _never, ...control } = touch(twin)
    expect(written).toEqual(control)
  })
})

describe('non-triggers at the write seam: retirement, a studio change and a drop to Strained end nothing (1347-A:59, :129)', () => {
  it('a write at a staged retirement week, with a studio change and a drop to Strained, leaves the bond open and the pair partners (1358-F4 item 2(b))', () => {
    expect(typeof romanceStatus, 'romanceStatus').toBe('function')
    const { state, people } = baseWorld()
    const [d, l, a2, s2] = people
    const week = state.market.tick
    const takeWeek = week - 5, writeWeek = week + 1
    const studios = (state.hollywood?.businesses ?? []).map((b) => b.studioId)
    assert.ok(studios.length >= 2, 'route premise: two rival businesses exist for the studio change')
    const [from, to] = studios as [string, string]
    // d retires at the write week, as d's only retirement record (the root a GREEN would have to read to trigger on it).
    const retirement = { personId: d!, profession: state.talent.find((t) => t.id === d)!.role, intentRulesVersion: 1, cause: 'hardBoundary',
      announcedWeek: writeWeek - 52, ageAtAnnouncement: 70, effectiveWeek: writeWeek, status: 'retired', finishingFromWeek: null,
      retiredWeek: writeWeek, extensionUsed: false, extendedFromWeek: null }
    // l changes studio at the write week: one employment row ends there and the next starts there.
    const terms = (startWeek: number, termWeeks: number) => ({ talentId: l!, annualSalary: 50_000, signingBonus: 0, startWeek, endWeekExclusive: startWeek + termWeeks, termWeeks })
    const leaving = { contractId: `${from}:contract:${l!}:${String(writeWeek - 52)}`, studioId: from, terms: terms(writeWeek - 52, 104), endedWeek: writeWeek, reason: 'entry' }
    const joining = { contractId: `${to}:contract:${l!}:${String(writeWeek)}`, studioId: to, terms: terms(writeWeek, 104), endedWeek: null, reason: 'replacement' }
    // A released flop of a picture the pair shot together is the write: Acquaintances minus the failure delta reads Strained.
    const take = { eventId: 'first-take-event-non-trigger', week: takeWeek, productionId: 'non-trigger-flop', studioId: from,
      directorId: d!, cast: { lead: l!, antagonist: a2!, support: s2! } }
    const flop = { productionId: take.productionId, releaseTick: writeWeek, criticScore: RELATIONSHIP_FAILURE_CRITIC_SCORE - 1 } as unknown as GameState['studio']['releasedFilms'][number]
    const bond: RomanceBond = { formedWeek: takeWeek, endedWeek: null }
    const edge = stagedEdge(0, d!, l!, floor('Acquaintances'), takeWeek, { sharedProductions: 3, romance: { value: 90, anchorWeek: takeWeek, bonds: [bond] } })
    const staged = {
      ...state,
      firstTakes: [...state.firstTakes, take],
      careerLifecycle: { ...state.careerLifecycle, records: [...state.careerLifecycle.records.filter((r) => r.personId !== d), retirement] },
      hollywood: { ...state.hollywood!, employment: [...state.hollywood!.employment, leaving, joining] },
    } as unknown as GameState
    const next = advanceRelationshipsWeek(withEdges(staged, [edge]), { takes: [], releases: [flop] }, writeWeek)
    const written = edgeOf(next, d!, l!)!
    expect(currentTier(written, writeWeek)).toBe('Strained') // fixture premise: the write dropped the pair to Strained
    expect(written.romance!.bonds).toEqual([bond])
    expect(romanceStatus(written, writeWeek)).toBe('partners')
  })
})

describe('consequences already selected (1347-A:60, §6 item 3): Partners in pairChemistry', () => {
  it('pairChemistry reads sign +1 with one added Partners reason at Strained, and -1 at Enemies (1358-F4 item 2(a))', () => {
    const { state, people } = baseWorld()
    const [x, y, u, v, p, q] = people
    const week = state.market.tick
    const partners = (): RomanceTrack => ({ value: 90, anchorWeek: week, bonds: [{ formedWeek: week, endedWeek: null }] })
    const staged = withEdges(state, [
      stagedEdge(0, x!, y!, floor('Strained'), week, { romance: partners() }),
      stagedEdge(1, u!, v!, floor('Strained'), week, { romance: null }), // the twin: the same edge without romance
      stagedEdge(2, p!, q!, floor('Enemies'), week, { sharedCompetitions: 3, romance: partners() }),
    ])
    const strained = pairChemistry(staged, x!, y!, week)
    expect(strained.tier).toBe('Strained') // fixture premise: romance moves no friendship tier
    expect(strained.sign).toBe(1)
    const twin = pairChemistry(staged, u!, v!, week)
    expect(twin.sign).toBe(-1)
    const added = strained.reasons.filter((reason) => !twin.reasons.includes(reason))
    expect(added).toHaveLength(1) // one Partners reason, beside the reasons the twin carries
    expect(added[0]).not.toMatch(/\d/) // the house rule for chemistry reasons: no number
    const hostile = pairChemistry(staged, p!, q!, week)
    expect(hostile.tier).toBe('Enemies') // fixture premise: three competitions unlock the band
    expect(hostile.sign).toBe(-1) // Partners stays below hostility
  })
})

describe('drift exemption and resumption: currentCloseness and currentTier read romance through their strict Picks (1358-F §3)', () => {
  // 1358-F §3 replaced r1's first leaf here, which asserted the hold at week 100000. By then the
  // bond has decayed below ROMANCE_EXIT_THRESHOLD and romanceStatus reads 'ended', so the ruled
  // law drifts that pair fully to the baseline.
  it('while romanceStatus reads "partners", currentCloseness holds the stored closeness past the drift grace (1358-F §3)', () => {
    const lastEventWeek = 1000
    const romance: RomanceTrack = { value: 100, anchorWeek: lastEventWeek, bonds: [{ formedWeek: lastEventWeek, endedWeek: null }] }
    // The strict three-key Pick: slice A's two-key Pick refuses this literal at the type gate.
    const edge: Parameters<typeof currentCloseness>[0] = { closeness: 90, lastEventWeek, romance }
    const week = lastEventWeek + RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS / 2
    // Not held, the pair would be halfway home: 90 + trunc((RELATIONSHIP_BASELINE - 90) / 2) = 70.
    expect(currentCloseness(edge, week)).toBe(edge.closeness)
    // Fixture premise, after the behaviour so the RED names the drift: the bond is still open at `week`.
    expect(romanceStatus(stagedEdge(0, 'p-a', 'p-b', edge.closeness, lastEventWeek, { romance }), week)).toBe('partners')
  })

  it('after the bond ends, drift resumes from max(lastEventWeek, endedWeek) — not from the stale lastEventWeek', () => {
    const endedWeek = 900, lastEventWeek = 500 // the ending happened AFTER the last ordinary driver
    const edge = stagedEdge(0, 'p-a', 'p-b', 70, lastEventWeek, { romance: { value: 20, anchorWeek: endedWeek, bonds: [{ formedWeek: 100, endedWeek }] } })
    const week = endedWeek + 10 // only 10 weeks past the ENDING, well inside grace from endedWeek
    expect(currentCloseness(edge as unknown as Parameters<typeof currentCloseness>[0], week)).toBe(70) // still held: grace counted from endedWeek, not lastEventWeek
  })

  it('after a recorded ending, a LATER ordinary driver anchors the dormancy: max(lastEventWeek, endedWeek) picks lastEventWeek (1358-F §3) [control: passes at RED]', () => {
    const endedWeek = 900, lastEventWeek = 950 // an ordinary driver, a release say, came 50 weeks after the ending
    const romance: RomanceTrack = { value: 20, anchorWeek: endedWeek, bonds: [{ formedWeek: 100, endedWeek }] }
    const edge: Parameters<typeof currentCloseness>[0] = { closeness: 70, lastEventWeek, romance }
    const week = lastEventWeek + RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS / 2
    // Counted from lastEventWeek the pair is halfway home, 60. Counted from endedWeek it would be 57.
    expect(currentCloseness(edge, week)).toBe(70 + Math.trunc((RELATIONSHIP_BASELINE - 70) * (RELATIONSHIP_DRIFT_RETURN_WEEKS / 2) / RELATIONSHIP_DRIFT_RETURN_WEEKS))
  })

  it('an ending computed on read (endedWeek still null) ends the hold at that week and anchors the dormancy there, so recording it later changes no closeness (1358-F §3; 1347-A §2.3)', () => {
    expect(typeof currentRomanceValue, 'currentRomanceValue').toBe('function') // RED names the missing read the derived ending needs
    const lastEventWeek = 1000
    const open: RomanceTrack = { value: 90, anchorWeek: lastEventWeek, bonds: [{ formedWeek: lastEventWeek, endedWeek: null }] }
    // 1347-A §2.3: the bond ends at the first week the derived value drops below the exit threshold.
    let endWeek = lastEventWeek
    while (currentRomanceValue(open, endWeek) >= ROMANCE_EXIT_THRESHOLD) {
      endWeek++
      assert.ok(endWeek <= lastEventWeek + ROMANCE_GRACE_WEEKS + ROMANCE_DECAY_WEEKS, 'fixture premise: a value of 90 ends inside GRACE + DECAY')
    }
    // Fixture premise: counted from lastEventWeek, the pair would already be drifting at the ending.
    expect(endWeek - lastEventWeek).toBeGreaterThan(RELATIONSHIP_DRIFT_GRACE_WEEKS)
    const recorded: RomanceTrack = { ...open, bonds: [{ formedWeek: lastEventWeek, endedWeek: endWeek }] }
    const before: Parameters<typeof currentCloseness>[0] = { closeness: 90, lastEventWeek, romance: open }
    const after: Parameters<typeof currentCloseness>[0] = { closeness: 90, lastEventWeek, romance: recorded }
    expect(currentCloseness(before, endWeek - 1)).toBe(before.closeness) // still partners the week before: held
    expect(currentCloseness(before, endWeek + RELATIONSHIP_DRIFT_GRACE_WEEKS)).toBe(before.closeness) // the grace runs from the ending
    for (const week of [endWeek, endWeek + RELATIONSHIP_DRIFT_GRACE_WEEKS, endWeek + RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS / 2]) {
      expect(currentCloseness(before, week)).toBe(currentCloseness(after, week))
    }
  })

  it('currentTier widens its Pick the same way: a Partners pair past the drift grace keeps its held tier (1358-F §3)', () => {
    const lastEventWeek = 1000
    const romance: RomanceTrack = { value: 100, anchorWeek: lastEventWeek, bonds: [{ formedWeek: lastEventWeek, endedWeek: null }] }
    const edge: Parameters<typeof currentTier>[0] = { closeness: floor('Inseparable'), lastEventWeek, sharedCompetitions: 0, romance }
    const week = lastEventWeek + RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS / 2
    // Not held: 81 + trunc((RELATIONSHIP_BASELINE - 81) / 2) = 66, which reads Friends.
    expect(currentTier(edge, week)).toBe('Inseparable')
  })

  it('the Picks are strict (1358-F §3): a partial edge without romance does not compile for currentCloseness or currentTier [RED at the type gate only]', () => {
    // Never called: production may read edge.romance unguarded, because the type requires it.
    const omitsRomance = (): void => {
      // @ts-expect-error 1358-F §3: romance is a required key of currentCloseness's Pick
      currentCloseness({ closeness: 70, lastEventWeek: 1000 }, 1000)
      // @ts-expect-error 1358-F §3: currentTier widens its Pick the same way
      currentTier({ closeness: 70, lastEventWeek: 1000, sharedCompetitions: 0 }, 1000)
    }
    expect(typeof omitsRomance).toBe('function')
  })
})
