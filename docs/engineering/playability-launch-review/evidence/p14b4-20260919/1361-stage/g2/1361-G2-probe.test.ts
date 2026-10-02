// 1361-G2: the P15A.1 Wave 2 closed-loop measurement gate G2 (1355-A §4-§5, lines 161-208; 1361-F ruling 11).
// Written for review (1361-G2-review-checklist.md) and then a parent run, one heavy process at a time. Notes and run
// commands: 1361-G2-notes.md. Nobody has run this file.
//
// One source runs on three trees, copied to tests/1361-G2-probe.test.ts in each:
// - control: an archive of e4be3e5c, the 1355 RED commit (Save44, src unchanged; 1360-F2 ruling 6);
// - candidate: an archive of P15A.1's frozen commit (c) on slice 2a's production (Save45);
// - k4: a copy of the candidate with SHARED_MARKET_FACTOR_MAX_PENALTY = 0 (1355-A:168).
// PROBE_EXPECT names the tree, and the first state must agree: no `sharedMarket` root reads as the control, a root
// with the penalty at 0 as K4, any other root as the candidate.
//
// Each seed's route is G1's: `p13aGeneratedStudio(seed)`, then `tick` once a week (1355-X4:20-21). For each processed
// week W (the tick that moves market.tick from W to W + 1) the run records:
// - releases (player releasedFilms, rival simulation/v1 films) with gross = boxOffice.total; on a tree with the root,
//   the week's new assessments, which must match the week's releases one to one (1355-A §3.4 item 3);
// - per rival: stall weeks, weeks below reserve and below zero (as intervals), greenlights, shelvings, first takes,
//   and every decide() evaluation by outcome (hollywoodTick.ts:213-236), ready loop and retry apart;
// - tick milliseconds, and a digest of the state without its P15 roots, per top-level key (digests-<seed>.jsonl);
// - at each read-out: player cash and Standing, save bytes and sha256, root bytes.
// The control also writes its Save44 save at K3's week; the candidate runs K3 from that save after each route.
// No threshold is judged here: 1361-G2-report.test.ts compares the runs and bands every row.
//
// Determinism: the probe draws no random number. Its three decide() spies call the real functions with the same
// arguments and return their results (the 1344-s7 decide-diag technique). K3's factor-1 tick, the one spy that
// changes an argument, reruns a single week beside the route and feeds nothing back. Only elapsedMs, tickMs, k3Ms
// and readouts[].saveMs depend on the clock.
import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { it, vi } from 'vitest'
import { rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import * as policy from '../src/core/hollywoodPolicy.js'
import { shelvedScriptIds } from '../src/core/hollywoodTypes.js'
import * as promises from '../src/core/promises.js'
import * as reception from '../src/core/reception.js'
import { exportCurrentState, importSave, LIVE_SAVE_VERSION, migrateToLive, stableStringify } from '../src/core/save.js'
import { SHARED_MARKET_DEFINITION } from '../src/core/sharedMarket.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState, Genre, Standing } from '../src/core/types.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { P15_ROOTS, stripP15 } from './helpers/p15-roots.js'
import { diffPaths, k1AllowedPaths } from './helpers/p15a1-market-route.js'

// ── the shapes the report reads ──────────────────────────────────────────────────────────────────────────────
export type Mode = 'control' | 'candidate' | 'k4'
export type Interval = [from: number, toExclusive: number]
export type Kind = 'viable' | 'cashBlocked' | 'economicRejection' | 'staffingBlocked'
export type ReleaseRow = [week: number, releaseId: string, studioId: string, genre: Genre, gross: number]
export type AssessmentRow = [week: number, releaseId: string, studioId: string, genre: Genre, factor: number, pressure: number]
export type RivalTrack = {
  firstWeek: number // the first processed week the business existed
  stall: Interval[] // 1355-A:183: a ready screenplay in the index, no production, no greenlight
  belowReserve: Interval[] // end-of-week cash < rivalWeeklyOperatingCost × reserveWeeks (hollywoodTick.ts:60-62)
  belowZero: Interval[] // end-of-week cash < 0
  greenlights: number[] // weeks of filmAnnounced receipts (hollywoodTick.ts:257)
  shelvings: number[] // weeks of screenplayShelved receipts (hollywoodTick.ts:281)
  firstTakes: number[] // processed weeks of the rival's first takes; each receipt carries week + 1 (tick.ts:1134-1142)
  decide: Record<string, number>[] // per read-out window: `${ready|retry}:${Kind}` → evaluations
}
export type Readout = {
  week: number
  playerCash: number
  playerStanding: Standing
  saveBytes: number // exportCurrentState: makeSave (the live validator) then stableStringify (save.ts:6594)
  saveSha256: string
  rootBytes: number | null // stableStringify(state.sharedMarket); null on the control
  rootRows: number | null
  saveMs: number
}
export type K3Result = {
  migratedWeek: number
  savedVersion: number
  liveVersion: number
  rootAtMigration: { version: number; recordedFromWeek: number; assessments: number }
  pressuredWeek: number | null // the first week whose batch holds a factor below 1
  pressured: [releaseId: string, factor: number][]
  forcedDigests: Record<string, string> | null // the same week ticked with every factor held at 1
  forcedSeamCalls: number
  diffPaths: number // paths where the pressured post-tick state differs from the forced one
  outsideCount: number // of those, paths outside K1's pressured chain (k1AllowedPaths)
  outsidePaths: string[]
  error: string | null
}
export type SeedRun = {
  seed: string
  route: string
  startWeek: number
  finalWeek: number
  elapsedMs: number
  playerStudioId: string
  rootAtStart: { version: number; recordedFromWeek: number; assessments: number } | null
  studios: { studioId: string; role: string; enteredWeek: number | null }[]
  rivals: Record<string, RivalTrack>
  releases: ReleaseRow[]
  assessments: AssessmentRow[] | null
  readouts: Readout[]
  tickMs: number[]
  digests: string
  k3Save: string | null
  k3: K3Result | null
  k3Ms: number
}
export type ProbeRun = {
  probe: '1361-G2'
  probeSha256: string
  mode: Mode
  complete: boolean
  treeHead: string
  node: string
  weeks: number
  readouts: number[]
  k3Week: number
  liveSaveVersion: number
  law: string
  tuning: Record<string, unknown>
  p15Roots: readonly string[] // the top-level keys every digest leaves out (stripP15)
  seeds: SeedRun[]
}

const READOUT_WEEKS = [520, 1560, 3120, 4680, 6240] // 1355-A:174-175
const K3_FULL_WEEK = 520 // the control's Save44 state that K3 migrates (1361-G2-notes.md, "K3")
const DAY_MS = 24 * 60 * 60 * 1000
const PROBE_SHA256 = createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex')

type MarketRow = { week: number; releaseId: string; studioId: string; genre: Genre; factor: number; pressure: number }
type MarketRoot = { version: number; recordedFromWeek: number; assessments: readonly MarketRow[] }
const rootOf = (state: GameState): MarketRoot | null => (state as unknown as { sharedMarket?: MarketRoot }).sharedMarket ?? null
const sha256hex = (text: string): string => createHash('sha256').update(text).digest('hex')

function required(name: string): string {
  const value = process.env[name]?.trim() ?? ''
  if (value === '') throw new Error(`1361-G2: ${name} is required (1361-G2-notes.md, "Run")`)
  return value
}

function industry(state: GameState, seed: string): NonNullable<GameState['hollywood']> {
  if (state.hollywood === null) throw new Error(`1361-G2: ${seed} has no industry at week ${state.market.tick} (1355-A §3.1 item 1)`)
  return state.hollywood
}

function roleOf(state: GameState): Mode {
  if (!Object.hasOwn(state, 'sharedMarket')) return 'control'
  const penalty: number = TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY
  return penalty === 0 ? 'k4' : 'candidate'
}

// ── state digests ────────────────────────────────────────────────────────────────────────────────────────────
// stableStringify's text rules (save.ts:685-713) with each nested object or array replaced by the sha256 of its own
// text, memoized by identity. Two values get equal digests exactly when their stableStringify texts are equal, and a
// week rehashes only the objects its tick created. ponytail: the memo trusts that no tick edits an object it already
// returned; every read-out recomputes the state with a fresh memo and throws on any disagreement.
const MEMO = new WeakMap<object, string>()
function token(value: unknown, memo: WeakMap<object, string>): string {
  if (value === null || value === undefined || typeof value === 'function') return 'null'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value !== 'object') throw new Error(`1361-G2: a state value of type ${typeof value} has no save form`)
  const known = memo.get(value)
  if (known !== undefined) return known
  const record = value as Record<string, unknown>
  const text = Array.isArray(value)
    ? `[${value.map((item) => token(item, memo)).join(',')}]`
    : `{${Object.keys(record).sort().filter((key) => record[key] !== undefined && typeof record[key] !== 'function')
      .map((key) => `${JSON.stringify(key)}:${token(record[key], memo)}`).join(',')}}`
  const digest = `#${createHash('sha256').update(text).digest('base64url')}`
  memo.set(value, digest)
  return digest
}
/** One 72-bit digest per top-level key of the state without its P15 roots (`stripP15`, the RED's own list). */
function keyDigests(state: GameState, memo: WeakMap<object, string> = MEMO): Record<string, string> {
  const stripped = stripP15(state)
  return Object.fromEntries(Object.keys(stripped).sort().filter((key) => stripped[key] !== undefined)
    .map((key) => [key, createHash('sha256').update(token(stripped[key], memo)).digest('base64url').slice(0, 12)]))
}
function writeDigest(file: string, state: GameState): Record<string, string> {
  const digests = keyDigests(state)
  appendFileSync(file, `${JSON.stringify({ w: state.market.tick, k: digests })}\n`)
  return digests
}

// ── decide() outcomes (hollywoodTick.ts:213-236) ───────────────────────────────────────────────────────────────
// evaluate() calls promisedCastMasks first (:220), returns staffingBlocked before any package search (:225), then
// calls chooseIndustryPackage (:233) and, only after a null choice, searchIndustryPackages (:236). All three are
// called through their module exports, so pass-through spies see each evaluation and its outcome. 1344-s7's
// decide-diag spied the chooser alone and could not see staffingBlocked (1344-stage/s7/NOTES.md item 1).
type Evaluation = { studioId: string; script: string; kind: Kind | 'pending' }
let evaluations: Evaluation[] = []
let spies: { mockClear(): unknown }[] = []

function installSpies(): { mockClear(): unknown }[] {
  const masks = promises.promisedCastMasks
  const choose = policy.chooseIndustryPackage
  const search = policy.searchIndustryPackages
  const follow = (key: string, from: Kind | 'pending', site: string): Evaluation => {
    const last = evaluations[evaluations.length - 1]
    if (last === undefined || `${last.studioId}:package:${last.script}` !== key || last.kind !== from) {
      throw new Error(`1361-G2: ${site}(${key}) follows no open evaluation; hollywoodTick.ts:213-236 changed, so decide() outcomes cannot be counted`)
    }
    return last
  }
  // Each spy forwards every argument, so a parameter a later tree adds still reaches the original (1361-G2-D item 5).
  return [
    vi.spyOn(promises, 'promisedCastMasks').mockImplementation((...args) => {
      const [, issuer, , subject] = args
      const script = subject?.scriptProjectId
      if (script !== undefined && script !== null) evaluations.push({ studioId: issuer, script, kind: 'staffingBlocked' })
      return masks(...args)
    }),
    vi.spyOn(policy, 'chooseIndustryPackage').mockImplementation((...args) => {
      const choice = choose(...args)
      const options = args[2]
      // The commission search (:324) does not lock the screenplay and is not an evaluation.
      if (options.lockScreenplay) follow(options.key, 'staffingBlocked', 'chooseIndustryPackage').kind = choice === null ? 'pending' : 'viable'
      return choice
    }),
    vi.spyOn(policy, 'searchIndustryPackages').mockImplementation((...args) => {
      const result = search(...args)
      follow(args[2].key, 'pending', 'searchIndustryPackages').kind = result.unaffordable > 0 ? 'cashBlocked' : 'economicRejection'
      return result
    }),
  ]
}

/** One tick with its evaluations and its milliseconds. Each spy keeps every call's arguments, the week's states
 * among them, so the history is cleared after every tick. */
function step(state: GameState): { next: GameState; evaluations: Evaluation[]; ms: number } {
  evaluations = []
  const begun = performance.now()
  const next = tick(state)
  const ms = performance.now() - begun
  for (const spy of spies) spy.mockClear()
  const open = evaluations.find((evaluation) => evaluation.kind === 'pending')
  if (open !== undefined) throw new Error(`1361-G2: week ${state.market.tick}: ${open.studioId} ${open.script} had no viable package and no search followed (hollywoodTick.ts:233-236 changed)`)
  return { next, evaluations, ms }
}

// ── one route ────────────────────────────────────────────────────────────────────────────────────────────────
type Ctx = { mode: Mode; out: string; weeks: number; readouts: number[]; k3Week: number; k3From: string | null; begun: number }

function say(ctx: Ctx, line: string): void {
  const heap = Math.round(process.memoryUsage().heapUsed / 2 ** 20)
  appendFileSync(join(ctx.out, 'progress.txt'), `[1361-G2 ${ctx.mode}] ${line} (${Math.round((performance.now() - ctx.begun) / 1000)} s, heap ${heap} MB)\n`)
}

function extend(list: Interval[], week: number): void {
  const last = list[list.length - 1]
  if (last !== undefined && last[1] === week) last[1] = week + 1
  else list.push([week, week + 1])
}

function readout(state: GameState, digests: Record<string, string>, seed: string): Readout {
  const begun = performance.now()
  const save = exportCurrentState(state)
  const saveMs = Math.round(performance.now() - begun)
  if (JSON.stringify(keyDigests(state, new WeakMap())) !== JSON.stringify(digests)) {
    throw new Error(`1361-G2: ${seed} week ${state.market.tick}: the memoized digest disagrees with a fresh one; a tick edited an object it had already returned`)
  }
  const root = rootOf(state)
  return {
    week: state.market.tick, playerCash: state.studio.cash, playerStanding: { ...state.studio.standing },
    saveBytes: Buffer.byteLength(save), saveSha256: sha256hex(save),
    rootBytes: root === null ? null : Buffer.byteLength(stableStringify(root)), rootRows: root === null ? null : root.assessments.length, saveMs,
  }
}

function measureSeed(ctx: Ctx, seed: string): SeedRun {
  const begun = performance.now()
  let state = p13aGeneratedStudio(seed)
  const detected = roleOf(state)
  if (detected !== ctx.mode) {
    throw new Error(`1361-G2: PROBE_EXPECT is ${ctx.mode}, but ${seed}'s first state reads as ${detected} (sharedMarket ${Object.hasOwn(state, 'sharedMarket') ? 'present' : 'absent'}, SHARED_MARKET_FACTOR_MAX_PENALTY ${TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY})`)
  }
  const startWeek = state.market.tick
  const first = rootOf(state)
  const digestFile = join(ctx.out, `digests-${seed}.jsonl`)
  writeDigest(digestFile, state)
  const rivals: Record<string, RivalTrack> = {}
  const releases: ReleaseRow[] = []
  const assessments: AssessmentRow[] | null = ctx.mode === 'control' ? null : []
  const readouts: Readout[] = []
  const tickMs: number[] = []
  const start = industry(state, seed)
  const seen = { receipts: start.receipts.length, films: start.films.length, player: state.studio.releasedFilms.length, takes: state.firstTakes.length, rows: first?.assessments.length ?? 0 }
  let k3Save: string | null = null

  while (state.market.tick < ctx.weeks) {
    const pre = state
    const W = pre.market.tick
    const stepped = step(pre)
    state = stepped.next
    tickMs.push(Math.round(stepped.ms * 1000) / 1000)
    const before = industry(pre, seed)
    const after = industry(state, seed)
    const slot = ctx.readouts.findIndex((week) => W < week) // the read-out window W falls in
    for (const b of before.businesses) {
      rivals[b.studioId] ??= { firstWeek: W, stall: [], belowReserve: [], belowZero: [], greenlights: [], shelvings: [], firstTakes: [],
        decide: ctx.readouts.map(() => ({})) }
    }
    if (after.receipts.length < seen.receipts || after.films.length < seen.films || state.firstTakes.length < seen.takes ||
      state.studio.releasedFilms.length < seen.player) throw new Error(`1361-G2: ${seed} week ${W}: an append-only list shrank`)

    // Greenlights and shelvings: decide() writes both with the processed week.
    const greenlit = new Map<string, number>()
    for (const receipt of after.receipts.slice(seen.receipts)) {
      if (receipt.kind !== 'filmAnnounced' && receipt.kind !== 'screenplayShelved') continue
      const track = rivals[receipt.studioId]
      if (track === undefined || receipt.week !== W) throw new Error(`1361-G2: ${seed} week ${W}: ${receipt.kind} ${receipt.eventId} names ${receipt.studioId} at week ${receipt.week}`)
      if (receipt.kind === 'filmAnnounced') {
        track.greenlights.push(W)
        greenlit.set(receipt.studioId, (greenlit.get(receipt.studioId) ?? 0) + 1)
      } else track.shelvings.push(W)
    }
    seen.receipts = after.receipts.length

    // decide() outcomes: a retry evaluates a screenplay that sat outside the index when the week began (:286-299).
    const viable = new Map<string, number>()
    for (const evaluation of stepped.evaluations) {
      const track = rivals[evaluation.studioId]
      if (track === undefined) throw new Error(`1361-G2: ${seed} week ${W}: an evaluation names ${evaluation.studioId}, which had no business`)
      const phase = shelvedScriptIds(before, evaluation.studioId).has(evaluation.script) ? 'retry' : 'ready'
      const counts = track.decide[slot]!
      counts[`${phase}:${evaluation.kind}`] = (counts[`${phase}:${evaluation.kind}`] ?? 0) + 1
      if (evaluation.kind === 'viable') viable.set(evaluation.studioId, (viable.get(evaluation.studioId) ?? 0) + 1)
    }
    for (const id of new Set([...viable.keys(), ...greenlit.keys()])) {
      if (viable.get(id) !== greenlit.get(id)) {
        throw new Error(`1361-G2: ${seed} week ${W}: ${id} has ${viable.get(id) ?? 0} viable evaluations and ${greenlit.get(id) ?? 0} filmAnnounced receipts; the spies miss an evaluation`)
      }
    }

    // Stall, from the state the week starts with; cash, from the state it ends with (1357-P's reading).
    for (const b of before.businesses) {
      const track = rivals[b.studioId]!
      const ready = b.activeScriptOrdinals.some((ordinal) => b.development.projects[ordinal]?.status === 'ready')
      if (ready && b.productions.length === 0 && !greenlit.has(b.studioId)) extend(track.stall, W)
      const end = after.businesses.find((row) => row.studioId === b.studioId)
      if (end === undefined) throw new Error(`1361-G2: ${seed} week ${W}: ${b.studioId}'s business left the industry`)
      if (end.account.cash < 0) extend(track.belowZero, W)
      if (end.account.cash < rivalWeeklyOperatingCost(end, after, state.market.tick) * end.policy.reserveWeeks) extend(track.belowReserve, W)
    }

    for (const take of state.firstTakes.slice(seen.takes)) {
      const track = rivals[take.studioId]
      if (track !== undefined) track.firstTakes.push(W)
      else if (take.studioId !== after.playerStudioId) throw new Error(`1361-G2: ${seed} week ${W}: first take ${take.eventId} names ${take.studioId}`)
    }
    seen.takes = state.firstTakes.length

    // Releases, and on a tree with the root, the week's assessments one to one with them.
    const released = new Map<string, { studioId: string; genre: Genre }>()
    const add = (releaseId: string, studioId: string, genre: Genre, releaseTick: number, gross: number): void => {
      if (releaseTick !== W || released.has(releaseId)) throw new Error(`1361-G2: ${seed} week ${W}: release ${releaseId} carries releaseTick ${releaseTick}`)
      released.set(releaseId, { studioId, genre })
      releases.push([W, releaseId, studioId, genre, gross])
    }
    for (const film of state.studio.releasedFilms.slice(seen.player)) {
      const genre = state.concepts.find((concept) => concept.id === film.conceptId)?.genre
      if (genre === undefined) throw new Error(`1361-G2: ${seed} week ${W}: player release ${film.productionId} has no concept ${film.conceptId}`)
      add(film.productionId, after.playerStudioId, genre, film.releaseTick, film.boxOffice.total)
    }
    for (const film of after.films.slice(seen.films)) {
      if (film.provenance === 'simulation/v1') add(film.filmId, film.studioId, film.genre, film.result.releaseTick, film.result.boxOffice.total)
    }
    seen.player = state.studio.releasedFilms.length
    seen.films = after.films.length
    const root = rootOf(state)
    if (assessments === null) {
      if (root !== null) throw new Error(`1361-G2: ${seed} week ${W}: the control gained a sharedMarket root`)
    } else {
      if (root === null || root.assessments.length < seen.rows) throw new Error(`1361-G2: ${seed} week ${W}: the sharedMarket root is missing or shrank`)
      const matched = new Set<string>()
      for (const row of root.assessments.slice(seen.rows)) {
        const film = released.get(row.releaseId)
        if (row.week !== W || film === undefined || film.studioId !== row.studioId || film.genre !== row.genre || matched.has(row.releaseId)) {
          throw new Error(`1361-G2: ${seed} week ${W}: assessment ${row.releaseId} (week ${row.week}) matches no release of the week (1355-A §3.4 item 3)`)
        }
        matched.add(row.releaseId)
        assessments.push([W, row.releaseId, row.studioId, row.genre, row.factor, row.pressure])
      }
      if (matched.size !== released.size) throw new Error(`1361-G2: ${seed} week ${W}: ${released.size} releases and ${matched.size} new assessments (1355-A §3.4 item 3)`)
      seen.rows = root.assessments.length
    }

    const digests = writeDigest(digestFile, state)
    const now = state.market.tick
    if (ctx.readouts.includes(now)) {
      readouts.push(readout(state, digests, seed))
      say(ctx, `${seed}: read-out ${now}, save ${readouts[readouts.length - 1]!.saveBytes} bytes`)
    }
    if (ctx.mode === 'control' && now === ctx.k3Week) {
      k3Save = `k3-save-${seed}.json`
      writeFileSync(join(ctx.out, k3Save), exportCurrentState(state))
    }
    if (now % 520 === 0) say(ctx, `${seed}: week ${now}/${ctx.weeks}, ${releases.length} releases`)
  }

  let k3: K3Result | null = null
  const k3Begun = performance.now()
  if (ctx.mode === 'candidate') {
    k3 = runK3(ctx, seed)
    say(ctx, `${seed}: K3 from week ${k3.migratedWeek}: pressured week ${k3.pressuredWeek}, ${k3.outsideCount} paths outside the chain${k3.error === null ? '' : `, ERROR ${k3.error.split('\n')[0]}`}`)
  }
  const h = industry(state, seed)
  return {
    seed, route: `p13aGeneratedStudio('${seed}'), then tick once a week`, startWeek, finalWeek: state.market.tick,
    elapsedMs: Math.round(performance.now() - begun), playerStudioId: h.playerStudioId,
    rootAtStart: first === null ? null : { version: first.version, recordedFromWeek: first.recordedFromWeek, assessments: first.assessments.length },
    studios: h.identities.map((s) => ({ studioId: s.studioId, role: s.role, enteredWeek: s.enteredWeek })),
    rivals, releases, assessments, readouts, tickMs, digests: `digests-${seed}.jsonl`, k3Save, k3,
    k3Ms: Math.round(performance.now() - k3Begun),
  }
}

// ── K3: the control's Save44 state, migrated, ticked to its first pressured week (1355-A:167; 1361-F ruling 11) ──
function runK3(ctx: Ctx, seed: string): K3Result {
  const result: K3Result = {
    migratedWeek: -1, savedVersion: -1, liveVersion: LIVE_SAVE_VERSION, rootAtMigration: { version: -1, recordedFromWeek: -1, assessments: -1 },
    pressuredWeek: null, pressured: [], forcedDigests: null, forcedSeamCalls: 0, diffPaths: 0, outsideCount: 0, outsidePaths: [], error: null,
  }
  try {
    const save = importSave(readFileSync(join(ctx.k3From!, `k3-save-${seed}.json`), 'utf8'))
    let state = migrateToLive(save).state as GameState
    const root = rootOf(state)
    if (root === null) throw new Error('the migrated state has no sharedMarket root')
    result.migratedWeek = state.market.tick
    result.savedVersion = save.saveVersion
    result.rootAtMigration = { version: root.version, recordedFromWeek: root.recordedFromWeek, assessments: root.assessments.length }
    const file = join(ctx.out, `k3-digests-${seed}.jsonl`)
    writeDigest(file, state)
    let rows = root.assessments.length
    while (state.market.tick < ctx.weeks) {
      const W = state.market.tick
      const { next } = step(state)
      writeDigest(file, next)
      const fresh = rootOf(next)!.assessments.slice(rows)
      rows += fresh.length
      const pressured = fresh.filter((row) => row.factor < 1)
      if (pressured.length > 0) {
        const forced = tickAtFactorOne(state)
        const paths = diffPaths(stripP15(forced.next), stripP15(next))
        const allowed = k1AllowedPaths(next, new Set(pressured.map((row) => row.releaseId)), W)
        const outside = paths.filter((path) => !allowed.some((pattern) => pattern.test(path)))
        return { ...result, pressuredWeek: W, pressured: pressured.map((row): [string, number] => [row.releaseId, row.factor]), forcedDigests: keyDigests(forced.next),
          forcedSeamCalls: forced.calls, diffPaths: paths.length, outsideCount: outside.length, outsidePaths: outside.slice(0, 50) }
      }
      state = next
    }
    return result
  } catch (error) {
    // Kept with the route's data; the report reads it as a K3 failure.
    return { ...result, error: error instanceof Error ? (error.stack ?? error.message) : String(error) }
  }
}

/** The same week with the factor held at 1 at the reception seam, which then returns the no-factor result bit for
 * bit (1355-A:83-85; RED 1). The batch and the root run unchanged, so a validator that reads the root sees law-exact
 * rows. Both release sites call resolveReception through its export (tick.ts:625, hollywoodTick.ts:388; the
 * atomicity RED's pass-through mock needs the same, 1355-F4); `calls` counts the factored calls the spy saw. */
function tickAtFactorOne(state: GameState): { next: GameState; calls: number } {
  const resolve = reception.resolveReception
  let calls = 0
  const spy = vi.spyOn(reception, 'resolveReception').mockImplementation((inputs, ...rest) => {
    if ((inputs as { competitionFactor?: number }).competitionFactor === undefined) return resolve(inputs, ...rest)
    calls++
    return resolve({ ...inputs, competitionFactor: 1 } as typeof inputs, ...rest)
  })
  try {
    const { next } = step(state)
    return { next, calls }
  } finally {
    spy.mockRestore()
  }
}

// ── the run ──────────────────────────────────────────────────────────────────────────────────────────────────
it('1361-G2 probe: one tree, every route', () => {
  const mode = required('PROBE_EXPECT')
  if (mode !== 'control' && mode !== 'candidate' && mode !== 'k4') throw new Error(`1361-G2: PROBE_EXPECT must be control, candidate or k4 (got ${mode}); the report is 1361-G2-report.test.ts`)
  const treeHead = required('PROBE_TREE_HEAD')
  if (!/^[0-9a-f]{40}$/.test(treeHead)) throw new Error(`1361-G2: PROBE_TREE_HEAD must be a full commit sha (got ${treeHead})`)
  const weeks = Number(required('PROBE_WEEKS'))
  if (!Number.isSafeInteger(weeks) || weeks < 2) throw new Error(`1361-G2: PROBE_WEEKS must be an integer of at least 2 (got ${process.env.PROBE_WEEKS})`)
  const seeds = required('PROBE_SEEDS').split(',').map((seed) => seed.trim()).filter((seed) => seed !== '')
  if (seeds.length === 0 || seeds.some((seed) => !/^[A-Za-z0-9-]+$/.test(seed))) throw new Error(`1361-G2: PROBE_SEEDS must name seeds of letters, digits and dashes (got ${process.env.PROBE_SEEDS})`)
  const out = required('PROBE_OUT')
  if (existsSync(out)) throw new Error(`1361-G2: PROBE_OUT ${out} exists; every run writes a new directory`)
  const readouts = [...new Set([...READOUT_WEEKS, weeks])].filter((week) => week <= weeks).sort((a, b) => a - b)
  const k3Week = weeks >= 2 * K3_FULL_WEEK ? K3_FULL_WEEK : Math.floor(weeks / 2)
  const k3From = mode === 'candidate' ? required('PROBE_K3_FROM') : null
  if (k3From !== null) {
    // Fail before the long routes when the control run is unfinished or ran another horizon.
    const control = JSON.parse(readFileSync(join(k3From, 'g2-run.json'), 'utf8')) as ProbeRun
    if (control.mode !== 'control' || !control.complete || control.weeks !== weeks || control.k3Week !== k3Week ||
      seeds.some((seed) => control.seeds.find((s) => s.seed === seed)?.k3Save == null)) {
      throw new Error(`1361-G2: PROBE_K3_FROM ${k3From} holds no complete control run with weeks ${weeks}, K3 week ${k3Week} and a K3 save for ${seeds.join(', ')}`)
    }
  }
  mkdirSync(out, { recursive: true })
  const ctx: Ctx = { mode, out, weeks, readouts, k3Week, k3From, begun: performance.now() }
  const run: ProbeRun = {
    probe: '1361-G2', probeSha256: PROBE_SHA256, mode, complete: false, treeHead, node: process.version, weeks, readouts, k3Week,
    liveSaveVersion: LIVE_SAVE_VERSION, law: SHARED_MARKET_DEFINITION,
    tuning: Object.fromEntries(Object.entries(TUNING).filter(([key]) => key.startsWith('SHARED_MARKET_'))), p15Roots: P15_ROOTS, seeds: [],
  }
  say(ctx, `tree ${treeHead}, Save${LIVE_SAVE_VERSION}, ${weeks} weeks, seeds ${seeds.join(', ')}, read-outs ${readouts.join(', ')}, K3 week ${k3Week}, probe ${PROBE_SHA256}`)
  spies = installSpies()
  try {
    for (const seed of seeds) {
      run.seeds.push(measureSeed(ctx, seed))
      run.complete = run.seeds.length === seeds.length
      // Rewritten after each seed, so a later failure keeps the finished seeds (complete stays false).
      writeFileSync(join(out, 'g2-run.json'), `${JSON.stringify(run)}\n`)
      say(ctx, `${seed}: done`)
    }
  } catch (error) {
    // Kept beside the run for the report; vitest prints it as well.
    writeFileSync(join(out, 'error.txt'), `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`)
    throw error
  } finally {
    vi.restoreAllMocks()
    spies = []
  }
}, DAY_MS)
