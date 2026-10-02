// ── P15A.1 Wave 2 RED (record 1355-C): shared routes and helpers ─────────────
//
// Not a test file (vitest collects only tests/**/*.test.ts). Imported by
// tests/p15a1-market-integration.test.ts, tests/p15a1-market-integration-atomicity.test.ts
// and by the 1355-P producer, which mints the RED-commit pins from the SAME code.
//
// Every route here uses only APIs that exist before Wave 2 (generateWorld,
// initializeHollywood, applyActions, tick) and decides from state alone, never from
// the new root, so the identical route runs on unchanged production (the pins) and on
// the candidate. Seeded RNG only. No state surgery inside a route; the branch helpers
// below (empty root, synthetic exposures, id swap) are test fixtures, never captures.
import { createHash } from 'node:crypto'
import { applyActions } from '../../src/core/actions.js'
import { OracleAgent } from '../../src/core/agents.js'
import { assignmentRefusal } from '../../src/core/careerLifecycle.js'
import { MARKETING_BUDGET_LEVELS } from '../../src/core/grid.js'
import { initializeHollywood, studioEmployerId } from '../../src/core/hollywood.js'
import { resolveReception, type ReceptionInputs, type ReceptionResult } from '../../src/core/reception.js'
import { RngStream } from '../../src/core/rng.js'
import { stableStringify } from '../../src/core/save.js'
import { resolveShape } from '../../src/core/shape.js'
import { assessBatch, type MarketAssessment, type MarketExposure } from '../../src/core/sharedMarket.js'
import { tick } from '../../src/core/tick.js'
import { GENRE_ORDER, TUNING } from '../../src/core/tuning.js'
import { generateWorld } from '../../src/core/worldgen.js'
import type { Action, FilmConcept, FilmShape, GameState, Genre } from '../../src/core/types.js'
import { makeBudget, makeReceptionInputs, makeTalent } from '../_fixtures.js'
import { P15_ROOTS, p15Rows } from './p15-roots.js'

// ── the persisted shapes (1355-A §3.3; 1355-F2 items 1-3), read through accessors so this
//    file compiles before the roots exist ─────────────────────────────────────
export type PersistedAssessment = MarketAssessment & {
  p15DomainSequence: number
  phaseId: string
  phaseOrdinal: number
  phaseOrderVersion: number
}
export type MarketRoot = { version: number; recordedFromWeek: number; assessments: PersistedAssessment[] }
export type SequenceRoot = { version: number; next: number }
export const MARKET_PHASE_ID = 'p15a1.marketBatch'
/** sharedMarket.ts:62-74 verbatim plus the four 1355-F2 fields: the exact persisted row keys. */
export const PERSISTED_ROW_KEYS = [
  'definitionVersion', 'factor', 'genre', 'inputDigest', 'p15DomainSequence', 'phaseId', 'phaseOrderVersion',
  'phaseOrdinal', 'pressure', 'reasons', 'releaseId', 'stockTerm', 'studioId', 'week', 'windowTerm',
] as const

export function marketRoot(state: GameState): MarketRoot {
  const root = (state as unknown as Record<string, unknown>).sharedMarket
  if (root === undefined) {
    throw new Error('RED: GameState has no `sharedMarket` root (1355-A §3.3); the P15A.1 Wave 2 step has not landed')
  }
  return root as MarketRoot
}
export function sequenceRoot(state: GameState): SequenceRoot {
  const root = (state as unknown as Record<string, unknown>).p15Sequence
  if (root === undefined) {
    throw new Error('RED: GameState has no `p15Sequence` allocator (1355-F2 item 1); no P15 save step has landed')
  }
  return root as SequenceRoot
}
export const rowsAt = (state: GameState, week: number): PersistedAssessment[] =>
  marketRoot(state).assessments.filter((row) => row.week === week)

// ── serialization-level comparison (1344-X6: never toEqual on a live state) ─────────
export const canon = (value: unknown): string => stableStringify(JSON.parse(JSON.stringify(value)))
export const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
export const digest = (value: unknown): string => sha256(canon(value))
/** Keeps only the named top-level keys: a later state compared against an earlier one. */
export function keepKeys(state: GameState, keys: readonly string[]): Record<string, unknown> {
  const raw = state as unknown as Record<string, unknown>
  return Object.fromEntries(keys.filter((key) => Object.hasOwn(raw, key)).map((key) => [key, raw[key]]))
}
const byId = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/** The largest `p15DomainSequence` over every row of the P15 roots other than this one (1356-F2 R3:
 * the shared `P15_ROOTS` list; 0 when no sibling holds a row). */
export const siblingTop = (state: GameState): number =>
  Math.max(0, ...p15Rows(state, P15_ROOTS.filter((key) => key !== 'sharedMarket')).map((row) => row.p15DomainSequence))

// ── release facts read from films and productions, never from the new root ─────────
export type Member = { releaseId: string; studioId: string; genre: Genre }
export type Released = Member & { week: number }

/** Every rival picture at remainingTicks 1: the rival due set (1355-A §3.1 item 3). */
export function rivalDue(state: GameState): Member[] {
  const h = state.hollywood
  if (h === null) return []
  const out: Member[] = []
  for (const business of h.businesses) {
    for (const production of business.productions) {
      if (production.remainingTicks !== 1) continue
      const concept = h.concepts.find((candidate) => candidate.id === production.conceptId)
      if (concept === undefined) throw new Error(`route: rival production ${production.id} has no concept`)
      out.push({ releaseId: production.id, studioId: business.studioId, genre: concept.genre })
    }
  }
  return out.sort((a, b) => byId(a.releaseId, b.releaseId))
}

/** Every simulated release so far (rival `simulation/v1` films, player released films). */
export function releaseHistory(state: GameState): Released[] {
  const h = state.hollywood
  if (h === null) return []
  const out: Released[] = []
  for (const film of h.films) {
    if (film.provenance === 'simulation/v1') {
      out.push({ releaseId: film.filmId, studioId: film.studioId, genre: film.genre, week: film.result.releaseTick })
    }
  }
  for (const film of state.studio.releasedFilms) {
    const concept = state.concepts.find((candidate) => candidate.id === film.conceptId)
    if (concept !== undefined) out.push({ releaseId: film.productionId, studioId: h.playerStudioId, genre: concept.genre, week: film.releaseTick })
  }
  return out
}

/** RED 16's ramp premise (1355-F4: asserted in the leaf, moved from the producer): a rival release
 * in [M−25, M−1] and an in-flight rival picture of its genre releasing while that release is still
 * inside its 26 weeks, so the release would press the picture if a migration at M carried it. */
export type CapturePremise = { week: number; recentReleaseId: string; inFlightProductionId: string; genre: Genre }
export function capturePremise(state: GameState): CapturePremise | null {
  const h = state.hollywood
  if (h === null) return null
  const week = state.market.tick
  const retire = TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS
  const recent = releaseHistory(state).filter((film) => week - film.week >= 1 && week - film.week < retire)
  for (const business of h.businesses) {
    for (const production of business.productions) {
      const genre = h.concepts.find((concept) => concept.id === production.conceptId)?.genre
      const releaseWeek = week + production.remainingTicks - 1
      const film = recent.find((f) => f.genre === genre && releaseWeek - f.week < retire)
      if (film !== undefined) return { week, recentReleaseId: film.releaseId, inFlightProductionId: production.id, genre: film.genre }
    }
  }
  return null
}

/** P > 0 under the law by its inputs alone: a same-genre co-member, or a same-genre release
 * in the window or stock lanes (offsets 1 .. SHARED_MARKET_RETIRE_AFTER_WEEKS − 1). */
export function pressured(member: Member, members: readonly Member[], history: readonly Released[], week: number): boolean {
  if (members.some((other) => other.releaseId !== member.releaseId && other.genre === member.genre)) return true
  return history.some((film) => film.genre === member.genre && week - film.week >= 1 &&
    week - film.week < TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS)
}

// ── the held-slate route: a fresh industry and a player who holds pictures ─────────
// r4 (1355-F6): the next seed of the series after -01 (r3) and -02 (the rival route). Every
// held-route premise below holds on it, at the same weeks on the reference and on unchanged
// production (1355-C4 probe). On -01 the four rivals greenlit nothing through week 159, slate or
// no slate: every ready screenplay was economically rejected and shelved. On -02 the first
// release week holds a same-genre pair, so no K2 week precedes K1.
export const MARKET_ROUTE_SEED = 'p15a1-w2-market-03'
const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }
type GreenlightPayload = Extract<Action, { kind: 'greenlight' }>['production']
export type HeldPicture = { productionId: string; genre: Genre; readyWeek: number; pairTwin: boolean }

function pickStaff(state: GameState, role: 'writer' | 'director' | 'actor', count: number, used: Set<string>): string[] {
  const out: string[] = []
  // From the END of each role list: a rival hiring a deficit takes the FIRST free person
  // (hollywoodTick.ts staff()), so the held slate never competes with it.
  // r4 (1355-F6): and never a person a studio employs. enterRival appends each rival's entry
  // team to the END of `state.talent` (hollywood.ts), and the headless greenlight checks only the
  // player's own seats (actions.ts), so r3's slate took every rival's director and three actors
  // (16 of its 28 seats) onto pictures that never release, and no rival could staff a greenlight.
  // On seed -02 that alone left 0 rival releases in weeks 7-159, against 47 with this rule (1355-C4).
  for (const person of [...state.talent].reverse()) {
    if (out.length === count) break
    if (person.role !== role || used.has(person.id) || studioEmployerId(state, person.id) !== null) continue
    if (role !== 'writer' && assignmentRefusal(state, person.id, state.market.tick, role) !== null) continue
    out.push(person.id)
    used.add(person.id)
  }
  if (out.length !== count) throw new Error(`route premise: seed ${state.seed} lacks ${count} free ${role}(s) for the held slate`)
  return out
}

function payload(state: GameState, concept: FilmConcept, used: Set<string>): GreenlightPayload {
  const [writerId] = pickStaff(state, 'writer', 1, used)
  const [directorId] = pickStaff(state, 'director', 1, used)
  const [lead, antagonist, support] = pickStaff(state, 'actor', 3, used)
  return {
    conceptId: concept.id,
    shape: SHAPE,
    promise: { genre: concept.genre, intendedSegments: ['adult'],
      ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] } },
    writerId: writerId!,
    directorId: directorId!,
    craftIds: [],
    cast: { lead: lead!, antagonist: antagonist!, support: support! },
    budget: {
      negative: concept.baseNegativeCost * resolveShape(SHAPE).budgetDemandMultiplier * state.era.costScale,
      marketing: MARKETING_BUDGET_LEVELS[0],
    },
  }
}

/** Seven held pictures: two of the first genre with two concepts (the RED 8 twins, greenlit
 * first), then one of every other catalogue genre that has a concept. One greenlight per
 * week (B3), each followed by one natural tick. Nothing is committed: every picture HOLDS at
 * remainingTicks 1 from its ready week (P06A), so the slate adds no release by itself. */
function greenlightSlate(start: GameState): { state: GameState; held: HeldPicture[] } {
  const byGenre = new Map<Genre, FilmConcept[]>()
  for (const concept of start.concepts) byGenre.set(concept.genre, [...(byGenre.get(concept.genre) ?? []), concept])
  const twinGenre = GENRE_ORDER.find((genre) => (byGenre.get(genre)?.length ?? 0) >= 2)
  if (twinGenre === undefined) throw new Error(`route premise: seed ${start.seed} has no genre with two concepts`)
  const plan: { concept: FilmConcept; pairTwin: boolean }[] = [
    { concept: byGenre.get(twinGenre)![0]!, pairTwin: true },
    { concept: byGenre.get(twinGenre)![1]!, pairTwin: true },
    ...GENRE_ORDER.filter((genre) => genre !== twinGenre && byGenre.has(genre))
      .map((genre) => ({ concept: byGenre.get(genre)![0]!, pairTwin: false })),
  ]
  const used = new Set<string>()
  const held: HeldPicture[] = []
  let state = start
  for (const { concept, pairTwin } of plan) {
    const week = state.market.tick
    state = applyActions(state, [{ kind: 'greenlight', production: payload(state, concept, used) }])
    const production = state.studio.activeProductions[state.studio.activeProductions.length - 1]!
    held.push({ productionId: production.id, genre: concept.genre, readyWeek: week + TUNING.PRODUCTION_TICKS, pairTwin })
    state = tick(state)
  }
  return { state, held }
}

export const ROUTE_CAP_WEEK = 160
type Route = { held: HeldPicture[]; states: Map<number, GameState>; cursor: GameState }
let route: Route | null = null

/** The memoized held-slate route: `initializeHollywood(generateWorld(seed), 'fresh')`, the held
 * slate, then natural ticks with no player action. `routeAt(W)` is the PRE-tick state at
 * market.tick === W. */
export function heldRoute(): Route {
  if (route === null) {
    const slate = greenlightSlate(initializeHollywood(generateWorld(MARKET_ROUTE_SEED), 'fresh'))
    route = { held: slate.held, states: new Map([[slate.state.market.tick, slate.state]]), cursor: slate.state }
  }
  return route
}
export function routeAt(week: number): GameState {
  const r = heldRoute()
  const hit = r.states.get(week)
  if (hit !== undefined) return hit
  if (week < r.cursor.market.tick || week > ROUTE_CAP_WEEK) throw new Error(`route: week ${week} is outside [${r.cursor.market.tick}, ${ROUTE_CAP_WEEK}]`)
  while (r.cursor.market.tick < week) {
    r.cursor = tick(r.cursor)
    r.states.set(r.cursor.market.tick, r.cursor)
  }
  return r.cursor
}
export const firstRouteWeek = (): number => Math.min(...heldRoute().states.keys())
export const heldPicture = (state: GameState, picture: HeldPicture) =>
  state.studio.activeProductions.find((production) => production.id === picture.productionId)
const isReady = (state: GameState, picture: HeldPicture): boolean => heldPicture(state, picture)?.remainingTicks === 1

export const commitPictures = (state: GameState, ids: readonly string[]): GameState =>
  applyActions(state, ids.map((productionId) => ({ kind: 'commitPictureToRelease' as const, productionId })))
export const cancelPicture = (state: GameState, productionId: string): GameState =>
  applyActions(state, [{ kind: 'cancel', productionId }])

function scan<T>(from: number, found: (state: GameState, week: number) => T | null, premise: string): T {
  for (let week = Math.max(from, firstRouteWeek()); week <= ROUTE_CAP_WEEK; week++) {
    const hit = found(routeAt(week), week)
    if (hit !== null) return hit
  }
  throw new Error(`route premise failed by week ${ROUTE_CAP_WEEK} on seed ${MARKET_ROUTE_SEED}: ${premise}`)
}

/** RED 4/6/9 and the rival half of the two-subject leaf: the first week the whole held slate
 * is ready (so RED 4 has pictures to hold and to cancel) and exactly one rival picture of some
 * genre g is due, g being a held picture's genre. */
export type PairWeek = { week: number; pre: GameState; rival: Member; picture: HeldPicture }
export function pairWeek(): PairWeek {
  return scan(0, (state, week) => {
    if (!heldRoute().held.every((p) => isReady(state, p))) return null
    const due = rivalDue(state)
    for (const rival of due) {
      if (due.filter((other) => other.genre === rival.genre).length !== 1) continue
      const picture = heldRoute().held.find((p) => p.genre === rival.genre && isReady(state, p))
      if (picture !== undefined) return { week, pre: state, rival, picture }
    }
    return null
  }, 'no week, after the whole held slate is ready, with one due rival picture whose genre a held picture shares')
}

/** RED 8 and the player half of the two-subject leaf: both twins ready, no rival picture of
 * their genre due. */
export type TwinWeek = { week: number; pre: GameState; twins: [HeldPicture, HeldPicture] }
export function twinWeek(): TwinWeek {
  const twins = heldRoute().held.filter((p) => p.pairTwin) as [HeldPicture, HeldPicture]
  return scan(0, (state, week) => twins.every((p) => isReady(state, p)) &&
    !rivalDue(state).some((m) => m.genre === twins[0].genre) ? { week, pre: state, twins } : null,
  'no week with both twins ready and no rival picture of their genre due')
}

/** RED 7: a week at or after SHARED_MARKET_RETIRE_AFTER_WEEKS with no rival picture due and a
 * ready held picture (the subject). */
export type SoloWeek = { week: number; pre: GameState; picture: HeldPicture }
export function soloWeek(): SoloWeek {
  return scan(TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS, (state, week) => {
    if (rivalDue(state).length > 0) return null
    const picture = heldRoute().held.find((p) => !p.pairTwin && isReady(state, p))
    return picture === undefined ? null : { week, pre: state, picture }
  }, 'no week with no rival picture due and a ready held picture')
}

/** K1/K2 (1355-A §4): K2 is the first week with a due release and none pressured; K1 is the
 * first pressured week after it — a natural rival pair, or, if none comes first, the first
 * later week a ready held picture shares a due rival picture's genre, committed. Up to K1
 * every release had P = 0, so the K1 and K2 pre-tick states are the same on unchanged
 * production and on the candidate (minus the new roots). */
export type KRoute = {
  k2: { week: number; pre: GameState }
  k1: { week: number; pre: GameState; committed: string | null }
}
let kMemo: KRoute | null = null
export function kRoute(): KRoute {
  if (kMemo !== null) return kMemo
  const found: { k2: KRoute['k2'] | null } = { k2: null }
  // Stops at the FIRST pressured week: past it the two productions' states differ.
  const k1 = scan(0, (state, week): KRoute['k1'] | null => {
    const due = rivalDue(state)
    if (due.length === 0) return null
    const history = releaseHistory(state)
    if (due.some((m) => pressured(m, due, history, week))) return { week, pre: state, committed: null }
    if (found.k2 === null) {
      found.k2 = { week, pre: state }
      return null
    }
    for (const rival of due) {
      const picture = heldRoute().held.find((p) => p.genre === rival.genre && isReady(state, p))
      if (picture !== undefined) return { week, pre: commitPictures(state, [picture.productionId]), committed: picture.productionId }
    }
    return null
  }, 'no pressured week (a natural pair, or a held picture sharing a due rival genre)')
  if (found.k2 === null) {
    throw new Error(`route premise failed on seed ${MARKET_ROUTE_SEED}: the first due week ${k1.week} is already pressured, so no K2 week precedes K1`)
  }
  kMemo = { k2: found.k2, k1 }
  return kMemo
}

// ── the rival-only route (no player action): save-level leaves and the capture ─────
export const RIVAL_ROUTE_SEED = 'p15a1-w2-market-02'
let rivalMemo: { states: Map<number, GameState>; cursor: GameState } | null = null
export function rivalRouteAt(week: number): GameState {
  if (rivalMemo === null) {
    const start = initializeHollywood(generateWorld(RIVAL_ROUTE_SEED), 'fresh')
    rivalMemo = { states: new Map([[start.market.tick, start]]), cursor: start }
  }
  const hit = rivalMemo.states.get(week)
  if (hit !== undefined) return hit
  if (week < rivalMemo.cursor.market.tick || week > ROUTE_CAP_WEEK) throw new Error(`rival route: week ${week} out of range`)
  while (rivalMemo.cursor.market.tick < week) {
    rivalMemo.cursor = tick(rivalMemo.cursor)
    rivalMemo.states.set(rivalMemo.cursor.market.tick, rivalMemo.cursor)
  }
  return rivalMemo.cursor
}

// ── the disengaged route (hollywood null): RED 17 and its M0A pin ───────────────
export const M0A_ROUTE_SEED = 'p15a1-w2-m0a-01'
export const M0A_ROUTE_WEEKS = 40
/** generateWorld (no industry), OracleAgent each week, every ready picture committed (the
 * corpus drive of tests/broadcast.test.ts), natural ticks. Returns every post-tick state. */
export function m0aRoute(): GameState[] {
  let state = generateWorld(M0A_ROUTE_SEED)
  const out: GameState[] = []
  while (state.market.tick < M0A_ROUTE_WEEKS) {
    state = applyActions(state, OracleAgent.chooseActions(state))
    const committed = new Set(state.releaseAuthority.commitments.map((row) => row.productionId))
    const ready = state.studio.activeProductions.filter((p) => p.remainingTicks === 1 && !committed.has(p.id))
    if (ready.length > 0) state = commitPictures(state, ready.map((p) => p.id))
    state = tick(state)
    out.push(state)
  }
  return out
}

// ── branch fixtures (tests only) ───────────────────────────────────────────────
/** The root a migration at `recordedFromWeek` writes: no assessment, no exposure. The allocator
 * keeps one above every other P15 sequence in the state, so the state stays validator-legal. */
export function withEmptyMarketRoot(state: GameState, recordedFromWeek: number): GameState {
  const root = marketRoot(state)
  return { ...state, sharedMarket: { version: root.version, recordedFromWeek, assessments: [] },
    p15Sequence: { ...sequenceRoot(state), next: siblingTop(state) + 1 } } as unknown as GameState
}

/** Law-exact rows for synthetic past releases (week order), each assessed by the Wave 1 law
 * against the earlier ones exactly as the live batch would have. Sequences are allocated above
 * every P15 sequence in `state`; the triple is copied from `triple`. */
export function withSyntheticMarketRows(state: GameState, releases: readonly Released[],
  triple: { phaseId: string; phaseOrdinal: number; phaseOrderVersion: number }): GameState {
  const ordered = [...releases].sort((a, b) => a.week - b.week || byId(a.releaseId, b.releaseId))
  marketRoot(state) // RED until the root exists (1355-A §3.3)
  let next = siblingTop(state) + 1
  const rows: PersistedAssessment[] = []
  for (const weekRows of groupByWeek(ordered)) {
    const week = weekRows[0]!.week
    const exposures: MarketExposure[] = ordered
      .filter((r) => r.week < week && week - r.week < TUNING.SHARED_MARKET_RETIRE_AFTER_WEEKS)
      .map((r) => ({ releaseId: r.releaseId, studioId: r.studioId, genre: r.genre, releaseWeek: r.week }))
    const assessed = assessBatch(exposures, { week, members: weekRows.map(({ releaseId, studioId, genre }) => ({ releaseId, studioId, genre })) })
    for (const row of assessed) rows.push({ ...row, p15DomainSequence: next++, ...triple })
  }
  return { ...state, sharedMarket: { version: 1, recordedFromWeek: ordered[0]!.week, assessments: rows },
    p15Sequence: { ...sequenceRoot(state), next } } as unknown as GameState
}
function groupByWeek(rows: readonly Released[]): Released[][] {
  const out: Released[][] = []
  for (const row of rows) {
    const last = out[out.length - 1]
    if (last !== undefined && last[0]!.week === row.week) last.push(row)
    else out.push([row])
  }
  return out
}

/** The mirror fixture (RED 9): every occurrence of two studio ids exchanged, so the player's
 * identity and one rival's trade names; nothing else moves. */
export function swapStudioIds(state: GameState, a: string, b: string): GameState {
  const token = '\u0000p15a1-swap\u0000'
  const text = JSON.stringify(state).split(a).join(token).split(b).join(a).split(token).join(b)
  return JSON.parse(text) as GameState
}
export const detached = (state: GameState): GameState => JSON.parse(JSON.stringify(state)) as GameState

// ── K1: path-level diff of two JSON values ───────────────────────────────────────
export function diffPaths(a: unknown, b: unknown, path = '', out: string[] = []): string[] {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) out.push(`${path}.length`)
    for (let i = 0; i < Math.min(a.length, b.length); i++) diffPaths(a[i], b[i], `${path}[${i}]`, out)
  } else if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of [...keys].sort()) {
      const left = (a as Record<string, unknown>)[key]
      const right = (b as Record<string, unknown>)[key]
      diffPaths(left, right, path === '' ? key : `${path}.${key}`, out)
    }
  } else if (!Object.is(a, b)) out.push(path)
  return out
}

/** 1355-A §4 "what moves in week W": only a pressured release's chain. Its opening and total,
 * run schedule, revenue, cash and ledger, Standing (and the copies of Standing: the chart row,
 * the filmReleased receipt and the player's standingChanged history row), and the career events
 * built from its result with the credited talent's fame. Every other path must be identical. */
export function k1AllowedPaths(post: GameState, pressuredIds: ReadonlySet<string>, week: number): RegExp[] {
  const index = <T>(rows: readonly T[], hit: (row: T) => boolean): string =>
    rows.map((row, i) => (hit(row) ? String(i) : null)).filter((i) => i !== null).join('|') || 'none'
  const h = post.hollywood
  const films = h?.films ?? []
  const owners = new Set(films.filter((f) => pressuredIds.has(f.filmId)).map((f) => f.studioId))
  const events = [...post.careerEvents, ...(h?.careerEvents ?? [])].filter((e) => pressuredIds.has(e.filmId))
  const credited = new Set([...events.map((e) => e.talentId),
    ...films.filter((f) => pressuredIds.has(f.filmId)).flatMap((f) => f.credits.map((c) => c.talentId))])
  const b = index(h?.businesses ?? [], (row) => owners.has(row.studioId))
  const historyRow = (row: unknown): { kind?: unknown; week?: unknown } => row as { kind?: unknown; week?: unknown }
  return [
    /^studio\.cash$/, /^studio\.standing\./,
    new RegExp(`^studio\\.releasedFilms\\[(${index(post.studio.releasedFilms, (f) => pressuredIds.has(f.productionId))})\\]\\.boxOffice\\.`),
    new RegExp(`^theatricalRuns\\[(${index(post.theatricalRuns, (r) => pressuredIds.has(r.productionId))})\\]\\.`),
    new RegExp(`^ledger\\[(${index(post.ledger, (row) => row.productionId !== undefined && pressuredIds.has(row.productionId))})\\]\\.amount$`),
    new RegExp(`^studioHistory\\.rows\\[(${index(post.studioHistory.rows, (row) => historyRow(row).kind === 'standingChanged' &&
      historyRow(row).week === week)})\\]\\.(before|after|deltas|facts)\\.`),
    new RegExp(`^careerEvents\\[(${index(post.careerEvents, (e) => pressuredIds.has(e.filmId))})\\]\\.`),
    new RegExp(`^talent\\[(${index(post.talent, (t) => credited.has(t.id))})\\]\\.fame$`),
    new RegExp(`^hollywood\\.films\\[(${index(films, (f) => pressuredIds.has(f.filmId))})\\]\\.(result\\.boxOffice\\.|studioRevenueReceived$)`),
    new RegExp(`^hollywood\\.businesses\\[(${b})\\]\\.account\\.(cash|periods\\[\\d+\\]\\.(opening|closing|movements\\.studioRevenue))$`),
    new RegExp(`^hollywood\\.businesses\\[(${b})\\]\\.runs\\[\\d+\\]\\.`),
    new RegExp(`^hollywood\\.businesses\\[(${b})\\]\\.standing\\.`),
    new RegExp(`^hollywood\\.receipts\\[(${index(h?.receipts ?? [], (r) => r.kind === 'filmReleased' && r.week === week && owners.has(r.studioId))})\\]\\.(before|after)\\.`),
    /^hollywood\.chart\.rows\[\d+\]\.standing\./,
    new RegExp(`^hollywood\\.careerEvents\\[(${index(h?.careerEvents ?? [], (e) => pressuredIds.has(e.filmId))})\\]\\.`),
  ]
}

// ── RED 1 pins: fixed seeded reception inputs (no factor) ─────────────────────────
export type ReceptionPinCase = {
  name: string; inputs: ReceptionInputs; seed: string; saturateFame: boolean; engaged: boolean; z: number
}
export function receptionPinCases(): ReceptionPinCase[] {
  const star = (id: string, fame: number) => makeTalent({ id, name: id, role: 'actor', skill: 62, fame })
  return [
    { name: 'default-headless', inputs: makeReceptionInputs(), seed: 'p15a1-seam-0', saturateFame: false, engaged: false, z: 0 },
    { name: 'default-engaged', inputs: makeReceptionInputs(), seed: 'p15a1-seam-1', saturateFame: true, engaged: true, z: 0.4 },
    {
      name: 'stars-heavy-marketing',
      inputs: makeReceptionInputs({
        budget: makeBudget(9_000_000, 3_000_000),
        cast: { lead: star('pin-lead', 80), antagonist: star('pin-antagonist', 55), support: star('pin-support', 30) },
      }),
      seed: 'p15a1-seam-2', saturateFame: true, engaged: true, z: -0.7,
    },
  ]
}
export const runPinCase = (c: ReceptionPinCase, extra: { competitionFactor?: number } = {}): ReceptionResult =>
  resolveReception({ ...c.inputs, ...extra } as ReceptionInputs, RngStream.fromSeed(c.seed), c.saturateFame, c.engaged, c.z)

export const PIN_DIRECTORY = 'tests/fixtures/p15/p15a1-market-pins/'
export const CAPTURE_DIRECTORY = 'tests/fixtures/p15/genuine-below-p15-save-step/'
/** The pin manifest the 1355-P producer writes at the last writer below the step. */
export type PinManifest = {
  record: '1355-P'
  saveVersion: number
  reception: { name: string; digest: string }[]
  k2: { week: number; keys: string[]; digest: string }
  k1: { week: number; committed: string | null; keys: string[]; capture: { name: string; gzip: { bytes: number; sha256: string }; decoded: { bytes: number; sha256: string } } }
  m0a: { weeks: number; keys: string[]; digest: string }
}
