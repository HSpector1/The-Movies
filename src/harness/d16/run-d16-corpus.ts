// ── D-16 · corpus entry point ────────────────────────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// RUN:
//   node_modules/.bin/vite-node src/harness/d16/run-d16-corpus.ts [seeds] [horizonWeeks] [policyFilter] [flags]
//
//   seeds          integer, default 25          → seeds are `d16-0001` … zero-padded
//   horizonWeeks   integer, default 208         → slices at 52 / 104 / 208 come from ONE run
//   policyFilter   'all' (the D-16 sixteen), 'publicity' (the D-17B eight), 'all+publicity',
//                  or a comma-separated list of names/prefixes ('P1,P3,Q1'). Default 'all'.
//   flags          --overrides '{"OVERHEAD_BASE":10000}'   typed counterfactual sweep
//                  --run-name NAME                          output subdirectory
//                  --exemplars N                            full weekly series for the first N seeds (default 25)
//                  --checkpoint-every N                     downsample stride for the JSONL (default 4)
//                  --regenerates-worlds                     permit worldgen-time overrides
//                  --slice-weeks '52,104,208,260,312'       slice columns (default '52,104,208')
//                  --counter-flow '{"family":"C",…}'        D-17B awareness counter-flow arm
//                  --publicity default | '{…}'              D-17B paid-publicity menu
//                  --marketing-grid '[2e5,7e5,2e6]'         fixed menu, OR
//                  --marketing-grid 'capacity:1.3,2,2.5'    capacity-anchored menu
//                  --awareness-stats                        emit the awareness block on neutral rows
//                  --emit-durable                           emit durableRecovery on the rows too
//                  --production-d17b                        execute frozen D-17B through production
//                                                          tick/action/package-menu code (NO shims)
//
// OUTPUT: out/d16-economy-lab/corpus/<runName>/{rows.jsonl, summary.json, summary.md}
//   Every row and the summary carry { mode, overrides, overrideKey } (experiment.ts) plus any
//   D-17B lever stamp that is ON — absent, never null, when it is off.
//   Stable sorted-key JSON, trailing newline. NO wall clock in any file — timing to stderr.
//
// THE NEUTRAL-ARM INVARIANT (the lab's acceptance gate, D-17B Phase-A gate ruling 4).
//   `run-d16-corpus.ts 300 208 all` must produce a rows.jsonl whose SHA-256 is
//   6692662642906b91ab00e83046be9b5462eb1f43db44fafc4f943235fc4bc45c (= d17a-final-300x208),
//   and a summary.json equal to d17a-final's on every PRE-EXISTING field. Consequences that
//   this file must honour: no new ROW field may be emitted without an explicit flag, and no
//   optional field may ever be written as `null`/`false` rather than omitted.

import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TUNING } from '../../core/index.js'
import { runOne } from './driver.js'
import type { RunRecord } from './driver.js'
import { ALL_POLICIES, PUBLICITY_POLICIES, policyByName } from './policies.js'
import type { Policy } from './policies.js'
import { makeTag, readTimingTable, tagArtifact, withTuningOverrides, assertTuningPristine } from './experiment.js'
import type { LabLevers, TuningOverrides } from './experiment.js'
import { comparableSeedCount, rateOf, summarize, winShares } from './stats.js'
import type { Summary } from './stats.js'
import { counterFlowKey, validateCounterFlow } from './counterflow.js'
import type { CounterFlowConfig } from './counterflow.js'
import { DEFAULT_PUBLICITY, PRODUCTION_PUBLICITY, publicityKey, validatePublicity } from './publicity.js'
import type { PublicityConfig } from './publicity.js'
import { assertMarketingGridPristine, marketingGridKey, validateMarketingGrid } from './packages.js'
import type { MarketingGrid } from './packages.js'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')
const OUT_ROOT = join(repoRoot, 'out', 'd16-economy-lab', 'corpus')

// ── argv ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const positional = argv.filter((a) => !a.startsWith('--'))
function flag(name: string): string | null {
  const i = argv.indexOf(`--${name}`)
  if (i === -1) return null
  return argv[i + 1] ?? ''
}
function has(name: string): boolean {
  return argv.includes(`--${name}`)
}

const SEEDS = Number(positional[0] ?? 25)
const HORIZON = Number(positional[1] ?? 208)
const POLICY_FILTER = positional[2] ?? 'all'
const EXEMPLARS = Number(flag('exemplars') ?? 25)
const CHECKPOINT_EVERY = Number(flag('checkpoint-every') ?? 4)
const REGENERATES_WORLDS = has('regenerates-worlds')
const PRODUCTION_D17B = has('production-d17b')

const overridesRaw = flag('overrides')
const OVERRIDES: TuningOverrides = overridesRaw === null || overridesRaw === '' ? {} : (JSON.parse(overridesRaw) as TuningOverrides)

// ── D-17B levers ─────────────────────────────────────────────────────────────
// F10 FIX: the slice columns are a FLAG now. They used to be the hard-coded triple, and they
// were never passed into `runOne` at all — so a 260/312-week corpus silently had no 260/312
// column. Both halves are threaded below.
const SLICE_WEEKS: number[] = (flag('slice-weeks') ?? '52,104,208')
  .split(',')
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n) && n > 0)

const counterFlowRaw = flag('counter-flow')
const COUNTER_FLOW: CounterFlowConfig | undefined =
  counterFlowRaw === null || counterFlowRaw === '' ? undefined : (JSON.parse(counterFlowRaw) as CounterFlowConfig)
if (COUNTER_FLOW !== undefined) validateCounterFlow(COUNTER_FLOW)

const publicityRaw = flag('publicity')
const PUBLICITY: PublicityConfig | undefined =
  publicityRaw === null || publicityRaw === ''
    ? undefined
    : publicityRaw === 'default'
      ? DEFAULT_PUBLICITY
      : (JSON.parse(publicityRaw) as PublicityConfig)
if (PUBLICITY !== undefined) validatePublicity(PUBLICITY)

/**
 * `--marketing-grid '[200000,700000,2000000]'` — a fixed menu, or
 * `--marketing-grid 'capacity:1.3,2,2.5'` — a CAPACITY-ANCHORED menu whose three rungs are
 * `multiplier × the awareness-conditioned capacity of the state at decision time` (A3: the
 * optimal spend tracks 1.3–2.5× that capacity, and the capacity itself swings 8.3×, so no
 * fixed dollar triple can pass the ≤ 35 % max-optimal gate). Rungs are rounded to whole
 * dollars, then forced strictly ascending, so a package id stays readable.
 */
const gridRaw = flag('marketing-grid')
let MARKETING_GRID: MarketingGrid | ((capacityHint: number) => MarketingGrid) | undefined
let MARKETING_GRID_KEY: string | undefined
if (gridRaw !== null && gridRaw !== '') {
  if (gridRaw.startsWith('capacity:')) {
    const mults = gridRaw.slice('capacity:'.length).split(',').map((s) => Number(s.trim()))
    if (mults.length !== 3 || mults.some((m) => !Number.isFinite(m) || m <= 0)) {
      throw new Error(`--marketing-grid capacity spec needs 3 positive multipliers, got "${gridRaw}"`)
    }
    if (!(mults[0]! < mults[1]! && mults[1]! < mults[2]!)) {
      throw new Error(`--marketing-grid capacity multipliers must be strictly ascending, got "${gridRaw}"`)
    }
    MARKETING_GRID = (capacity: number): MarketingGrid => {
      const a = Math.max(1, Math.round(mults[0]! * capacity))
      const b = Math.max(a + 1, Math.round(mults[1]! * capacity))
      const c = Math.max(b + 1, Math.round(mults[2]! * capacity))
      return [a, b, c]
    }
    MARKETING_GRID_KEY = `capacity:${mults.join(',')}`
  } else {
    const parsed = JSON.parse(gridRaw) as number[]
    if (parsed.length !== 3) throw new Error(`--marketing-grid needs exactly 3 rungs, got "${gridRaw}"`)
    const triple: MarketingGrid = [parsed[0]!, parsed[1]!, parsed[2]!]
    validateMarketingGrid(triple)
    MARKETING_GRID = triple
    MARKETING_GRID_KEY = marketingGridKey(triple)
  }
}

if (
  PRODUCTION_D17B &&
  (COUNTER_FLOW !== undefined || PUBLICITY !== undefined || MARKETING_GRID !== undefined)
) {
  throw new Error(
    '--production-d17b cannot be combined with --counter-flow, --publicity, or --marketing-grid; production execution contains the frozen mechanics already',
  )
}

const AWARENESS_STATS = has('awareness-stats')
const EMIT_DURABLE = has('emit-durable')

const PRODUCTION_CANDIDATE_KEY =
  `D17B:drift=${String(TUNING.AWARENESS_DRIFT_RATE)}/${String(TUNING.AWARENESS_DRIFT_ANCHOR)}` +
  `;reach=${String(TUNING.AWARENESS_REACH_NEUTRAL_ENGAGED)}/${String(TUNING.AWARENESS_REACH_NEUTRAL)}` +
  `;disc=${String(TUNING.DISC_SUPPORT_THRESHOLD)}/${String(TUNING.DISC_SPREAD)}/${String(TUNING.DISC_SUPPORT_EXP)}/${String(TUNING.DISC_FLOOR)}/rng=discovery-v1` +
  `;marketing=capacity:${TUNING.MARKETING_MENU_MULTIPLIERS.join(',')}` +
  `;publicity=${publicityKey(PRODUCTION_PUBLICITY)!}`

const LEVERS: LabLevers = {}
if (PRODUCTION_D17B) {
  LEVERS.productionCandidateKey = PRODUCTION_CANDIDATE_KEY
} else {
  const cf = counterFlowKey(COUNTER_FLOW)
  if (cf !== undefined) LEVERS.counterFlowKey = cf
  const pk = publicityKey(PUBLICITY)
  if (pk !== undefined) LEVERS.publicityKey = pk
  if (MARKETING_GRID_KEY !== undefined) LEVERS.marketingGridKey = MARKETING_GRID_KEY
}
// A counter-flow / publicity / grid arm can never be stamped CURRENT, even with an empty
// override set (the §13.4 defect).
const TAG = makeTag(OVERRIDES, LEVERS)

const policies: Policy[] =
  POLICY_FILTER === 'all'
    ? [...ALL_POLICIES]
    : POLICY_FILTER === 'publicity'
      ? [...PUBLICITY_POLICIES]
      : POLICY_FILTER === 'all+publicity'
        ? [...ALL_POLICIES, ...PUBLICITY_POLICIES]
        : POLICY_FILTER.split(',').map((n) => policyByName(n.trim()))

const RUN_NAME =
  flag('run-name') ??
  `s${SEEDS}-h${HORIZON}-${POLICY_FILTER === 'all' ? 'all' : policies.map((p) => p.name.split('_')[0]).join('+')}-${TAG.mode.toLowerCase()}`
const OUT = join(OUT_ROOT, RUN_NAME)

// ── deterministic JSON ───────────────────────────────────────────────────────
function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys)
  if (v !== null && typeof v === 'object') {
    const src = v as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(src).sort()) out[k] = sortKeys(src[k])
    return out
  }
  return v
}
function stableJson(v: unknown, indent = 0): string {
  return JSON.stringify(sortKeys(v), null, indent)
}

// ── seeds ────────────────────────────────────────────────────────────────────
function seedFor(i: number): string {
  return `d16-${String(i + 1).padStart(4, '0')}`
}

// ── streaming aggregation ────────────────────────────────────────────────────
// ── the engagement-cliff SPLIT (B2-C3) ───────────────────────────────────────
// A run in which a policy that meant to stay engaged LOST the engaged economy is running a
// different economy from the one under study: no overhead, no solvency gate, and the legacy
// 100 %-of-gross lump — the harness's own P15 row values that at a median $196.15M against
// $2.71M for engaged P3. Pooling such a run into a headline distribution or a win-share
// column publishes the labelled exploit's payoff under a player policy's name.
//
// So every distribution below is built from CLEAN runs only, and cliff runs are reported
// SEPARATELY (count, rate, first-cliff week, and their own end-cash summary) rather than
// dropped silently. Nothing is hidden; nothing is mixed.
type PolicyAgg = {
  policy: string
  kind: Policy['kind']
  disengagementIntended: boolean
  endCash: number[]
  filmsReleased: number[]
  filmsGreenlit: number[]
  cashAt: Record<string, number[]>
  engagementCliffHits: number
  cliffWeeks: number[]
  cliffEndCash: number[]
  engagedWeekFractions: number[]
  rejectedActions: number
  rejectionReasons: Record<string, number>
  unstaffableWeeks: number[]
  distressEntries: number
  recoveries: number
  partialRecoveries: number
  terminalDeclines: number
  runaways: number
  weeksToRecovery: number[]
  filmContributions: number[]
  filmForecastErrors: number[]
  discoveryMultipliers: number[]
  perceivedVsActualOpening: number[]
  marketingChoices: Record<string, number>
  /** runs absorbed into the CLEAN distributions above. */
  runs: number
  /** every run seen, clean or cliff. */
  runsSeen: number

  // ── D-17B ────────────────────────────────────────────────────────────────
  /** the week-208 roster wall. NOT an exclusion — these runs stay in every distribution. */
  rosterWallHits: number
  rosterWallWeeks: number[]
  /** durable recovery, counted over runs that ENTERED distress (the honest denominator). */
  durableAt26: number
  durableAt52: number
  durableAt103: number
  durableAt103Strict: number
  awarenessFinal: number[]
  awarenessMin: number[]
  awarenessMax: number[]
  weeksAtFloor: number[]
  publicityCount: number[]
  publicitySpend: number[]
  publicityLift: number[]
}

function newAgg(p: Policy): PolicyAgg {
  return {
    policy: p.name,
    kind: p.kind,
    disengagementIntended: p.disengagementIntended,
    endCash: [],
    filmsReleased: [],
    filmsGreenlit: [],
    cashAt: {},
    engagementCliffHits: 0,
    cliffWeeks: [],
    cliffEndCash: [],
    engagedWeekFractions: [],
    rejectedActions: 0,
    rejectionReasons: {},
    unstaffableWeeks: [],
    distressEntries: 0,
    recoveries: 0,
    partialRecoveries: 0,
    terminalDeclines: 0,
    runaways: 0,
    weeksToRecovery: [],
    filmContributions: [],
    filmForecastErrors: [],
    discoveryMultipliers: [],
    perceivedVsActualOpening: [],
    marketingChoices: {},
    runs: 0,
    runsSeen: 0,
    rosterWallHits: 0,
    rosterWallWeeks: [],
    durableAt26: 0,
    durableAt52: 0,
    durableAt103: 0,
    durableAt103Strict: 0,
    awarenessFinal: [],
    awarenessMin: [],
    awarenessMax: [],
    weeksAtFloor: [],
    publicityCount: [],
    publicitySpend: [],
    publicityLift: [],
  }
}

/** First clause of the engine's rejection reason — bounded, so the key space stays small. */
function rejectionKey(kind: string, reason: string): string {
  const head = reason.split('—')[1] ?? reason
  return `${kind}: ${head.split('.')[0]!.trim().slice(0, 60)}`
}

function absorb(agg: PolicyAgg, r: RunRecord): void {
  agg.runsSeen += 1
  // `summarize` throws on a non-finite sample (deliberately — a NaN must never be averaged
  // into a distribution). A zero-week run reports NaN here, so it is dropped rather than
  // taking the whole aggregation down.
  if (Number.isFinite(r.engagedWeekFraction)) agg.engagedWeekFractions.push(r.engagedWeekFraction)
  agg.rejectedActions += r.rejectedActions
  for (const rej of r.rejections) {
    const k = rejectionKey(rej.kind, rej.reason)
    agg.rejectionReasons[k] = (agg.rejectionReasons[k] ?? 0) + 1
  }
  // D-17B (A5 Finding 0): the ROSTER WALL is counted for EVERY run and excludes NOTHING. It is
  // a real (terrible) outcome of the economy under study — a studio whose contracts all lapsed
  // because it could not pay the renewal bonus — not a run that left the economy under study.
  // The ONLY exclusion in this file remains `engagementCliffHit`, immediately below.
  if (r.rosterWallHit === true) {
    agg.rosterWallHits += 1
    if (r.rosterWallWeek !== undefined) agg.rosterWallWeeks.push(r.rosterWallWeek)
  }
  if (r.engagementCliffHit) {
    // CONTAMINATED — reported on its own, never pooled.
    agg.engagementCliffHits += 1
    if (r.engagementCliffWeek !== null) agg.cliffWeeks.push(r.engagementCliffWeek)
    agg.cliffEndCash.push(r.endCash)
    return
  }
  agg.runs += 1
  if (r.durableRecovery !== undefined) {
    if (r.durableRecovery.at26) agg.durableAt26 += 1
    if (r.durableRecovery.at52) agg.durableAt52 += 1
    if (r.durableRecovery.at103) agg.durableAt103 += 1
    if (r.durableRecovery.at103Strict) agg.durableAt103Strict += 1
  }
  if (r.awareness !== undefined) {
    agg.awarenessFinal.push(r.awareness.final)
    agg.awarenessMin.push(r.awareness.min)
    agg.awarenessMax.push(r.awareness.max)
    agg.weeksAtFloor.push(r.awareness.weeksAtFloor)
  }
  if (r.publicity !== undefined) {
    agg.publicityCount.push(r.publicity.count)
    agg.publicitySpend.push(r.publicity.spend)
    agg.publicityLift.push(r.publicity.liftDelivered)
  }
  agg.endCash.push(r.endCash)
  agg.filmsReleased.push(r.filmsReleased)
  agg.filmsGreenlit.push(r.filmsGreenlit)
  agg.unstaffableWeeks.push(r.unstaffableWeeks)
  for (const [k, s] of Object.entries(r.slices)) {
    ;(agg.cashAt[k] ??= []).push(s.cash)
  }
  if (r.episodes.distressEntryWeek !== null) agg.distressEntries += 1
  if (r.episodes.recovered) agg.recoveries += 1
  if (r.episodes.partiallyRecovered) agg.partialRecoveries += 1
  if (r.episodes.terminalDecline) agg.terminalDeclines += 1
  if (r.episodes.runawaySuccess) agg.runaways += 1
  if (r.episodes.weeksToRecovery !== null) agg.weeksToRecovery.push(r.episodes.weeksToRecovery)
  for (const f of r.films) {
    if (f.contribution !== null) agg.filmContributions.push(f.contribution)
    if (f.realizedGross !== null && Number.isFinite(f.forecastTotal) && f.forecastTotal > 0) {
      agg.filmForecastErrors.push(f.realizedGross / f.forecastTotal)
    }
    if (f.discoveryMultiplier !== null && Number.isFinite(f.discoveryMultiplier)) {
      agg.discoveryMultipliers.push(f.discoveryMultiplier)
    }
    if (f.perceivedVsActualOpeningRatio !== null && Number.isFinite(f.perceivedVsActualOpeningRatio)) {
      agg.perceivedVsActualOpening.push(f.perceivedVsActualOpeningRatio)
    }
    const key = String(f.marketingLevel)
    agg.marketingChoices[key] = (agg.marketingChoices[key] ?? 0) + 1
  }
}

type PolicySummary = {
  policy: string
  kind: Policy['kind']
  disengagementIntended: boolean
  /** runs pooled into every distribution below — CLEAN runs only. */
  runs: number
  /** every run executed for this policy, clean or cliff. */
  runsSeen: number
  endCash: Summary
  filmsReleased: Summary
  filmsGreenlit: Summary
  cashAt: Record<string, Summary>
  endPositiveRate: number
  /**
   * fraction of runs EXCLUDED from the distributions because the policy lost the engaged
   * economy. `NaN` ('n/a') when the policy declares `disengagementIntended` — for those the
   * flag is meaningless by construction and `engagedWeekFraction` is the real signal.
   */
  engagementCliffRate: number
  /** the excluded runs, reported on their own so nothing is silently dropped. */
  cliffRuns: number
  cliffFirstWeek: Summary
  cliffEndCash: Summary
  /** weeks with `employmentEngaged === true` ÷ horizon, over EVERY run (B2-C8). */
  engagedWeekFraction: Summary
  rejectedActions: number
  rejectionReasons: Record<string, number>
  unstaffableWeeks: Summary
  distressRate: number
  recoveryRateGivenDistress: number
  partialRecoveryRateGivenDistress: number
  terminalDeclineRate: number
  runawayRate: number
  weeksToRecovery: Summary
  filmContribution: Summary
  realizedOverForecastGross: Summary
  /** the TRUE D-13 draw effect (B2-C2): bounded by [DISC_FLOOR, DISC_CEIL], exactly 1 when supported. */
  discoveryMultiplier: Summary
  /** the INFORMATION gap, separated from luck: perceived ÷ actual deterministic opening. */
  perceivedVsActualOpening: Summary
  marketingChoices: Record<string, number>

  // ── D-17B ────────────────────────────────────────────────────────────────
  /** runs that hit the week-208 roster wall. INCLUDED in every distribution above. */
  rosterWallRuns: number
  rosterWallRate: number
  rosterWallFirstWeek: Summary
  /**
   * DURABLE recovery given distress entry — G8 form at +26/+52/+103 weeks and the strict form
   * at +103. THIS is the recovery number to quote: `recoveryRateGivenDistress` above is the
   * TRANSIENT one (a single healthy week), and A5 measured that 62–99 % of transiently
   * "recovered" runs still terminally decline. G8's bar is ≥ 25 % at +103.
   */
  durableRecoveryGivenDistress: { at26: number; at52: number; at103: number; at103Strict: number }
  awarenessFinal: Summary
  awarenessMin: Summary
  awarenessMax: Summary
  awarenessWeeksAtFloor: Summary
  /** runs ENDING at awareness 0 — one of the two tails Lesson BK requires to be gated jointly. */
  floorAbsorptionRate: number
  /** runs ENDING at awareness 100 — the other tail. */
  ceilingAbsorptionRate: number
  publicityCount: Summary
  publicitySpend: Summary
  publicityLiftDelivered: Summary
}

function finalize(agg: PolicyAgg): PolicySummary {
  const cashAt: Record<string, Summary> = {}
  for (const k of Object.keys(agg.cashAt).sort()) cashAt[k] = summarize(agg.cashAt[k]!)
  const sortedReasons: Record<string, number> = {}
  for (const k of Object.keys(agg.rejectionReasons).sort()) sortedReasons[k] = agg.rejectionReasons[k]!
  return {
    policy: agg.policy,
    kind: agg.kind,
    disengagementIntended: agg.disengagementIntended,
    runs: agg.runs,
    runsSeen: agg.runsSeen,
    endCash: summarize(agg.endCash),
    filmsReleased: summarize(agg.filmsReleased),
    filmsGreenlit: summarize(agg.filmsGreenlit),
    cashAt,
    endPositiveRate: rateOf(agg.endCash, (c) => c > 0),
    engagementCliffRate:
      agg.disengagementIntended || agg.runsSeen === 0 ? NaN : agg.engagementCliffHits / agg.runsSeen,
    cliffRuns: agg.engagementCliffHits,
    cliffFirstWeek: summarize(agg.cliffWeeks),
    cliffEndCash: summarize(agg.cliffEndCash),
    engagedWeekFraction: summarize(agg.engagedWeekFractions),
    rejectedActions: agg.rejectedActions,
    rejectionReasons: sortedReasons,
    unstaffableWeeks: summarize(agg.unstaffableWeeks),
    distressRate: agg.runs === 0 ? NaN : agg.distressEntries / agg.runs,
    recoveryRateGivenDistress: agg.distressEntries === 0 ? NaN : agg.recoveries / agg.distressEntries,
    partialRecoveryRateGivenDistress:
      agg.distressEntries === 0 ? NaN : agg.partialRecoveries / agg.distressEntries,
    terminalDeclineRate: agg.runs === 0 ? NaN : agg.terminalDeclines / agg.runs,
    runawayRate: agg.runs === 0 ? NaN : agg.runaways / agg.runs,
    weeksToRecovery: summarize(agg.weeksToRecovery),
    filmContribution: summarize(agg.filmContributions),
    realizedOverForecastGross: summarize(agg.filmForecastErrors),
    discoveryMultiplier: summarize(agg.discoveryMultipliers),
    perceivedVsActualOpening: summarize(agg.perceivedVsActualOpening),
    marketingChoices: agg.marketingChoices,
    rosterWallRuns: agg.rosterWallHits,
    rosterWallRate: agg.runsSeen === 0 ? NaN : agg.rosterWallHits / agg.runsSeen,
    rosterWallFirstWeek: summarize(agg.rosterWallWeeks),
    durableRecoveryGivenDistress: {
      at26: agg.distressEntries === 0 ? NaN : agg.durableAt26 / agg.distressEntries,
      at52: agg.distressEntries === 0 ? NaN : agg.durableAt52 / agg.distressEntries,
      at103: agg.distressEntries === 0 ? NaN : agg.durableAt103 / agg.distressEntries,
      at103Strict: agg.distressEntries === 0 ? NaN : agg.durableAt103Strict / agg.distressEntries,
    },
    awarenessFinal: summarize(agg.awarenessFinal),
    awarenessMin: summarize(agg.awarenessMin),
    awarenessMax: summarize(agg.awarenessMax),
    awarenessWeeksAtFloor: summarize(agg.weeksAtFloor),
    floorAbsorptionRate: rateOf(agg.awarenessFinal, (a) => a <= 0),
    ceilingAbsorptionRate: rateOf(agg.awarenessFinal, (a) => a >= 100),
    publicityCount: summarize(agg.publicityCount),
    publicitySpend: summarize(agg.publicitySpend),
    publicityLiftDelivered: summarize(agg.publicityLift),
  }
}

/**
 * THE ROW PROJECTION — and the one place the frozen row schema is enforced.
 *
 * `durableRecovery` is computed for EVERY run and is ALWAYS aggregated into `summary.json`
 * (`durableRecoveryGivenDistress`), but it is written onto the ROWS only under `--emit-durable`:
 * a new row field present on ~66 % of runs changes every byte of `rows.jsonl` and would break
 * the neutral-arm SHA gate, which outranks the convenience of having it inline. Nothing is
 * hidden — the number is in the summary either way, and this comment is the disclosure.
 *
 * `captures` is never serialized at all: it holds whole `GameState`s for the Stage-5 harvest
 * and belongs in the continuation runner's side-files, not in a corpus row.
 */
function rowForEmission(rec: RunRecord): Record<string, unknown> {
  const out = { ...(rec as unknown as Record<string, unknown>) }
  if (!EMIT_DURABLE) delete out['durableRecovery']
  delete out['captures']
  return out
}

// ── execute ──────────────────────────────────────────────────────────────────
function main(): void {
  mkdirSync(OUT, { recursive: true })
  const rowsPath = join(OUT, 'rows.jsonl')
  writeFileSync(rowsPath, '')

  const aggs = new Map<string, PolicyAgg>()
  for (const p of policies) aggs.set(p.name, newAgg(p))
  const cashColumns = new Map<string, Map<string, number>>()
  for (const p of policies) cashColumns.set(p.name, new Map())

  const started = Date.now()
  let buffer = ''
  // seed-major, policy-minor (fixed iteration order — A17 §4.2 rule 7).
  for (let i = 0; i < SEEDS; i++) {
    const seed = seedFor(i)
    for (const policy of policies) {
      const rec = runOne({
        seed,
        policy,
        horizonWeeks: HORIZON,
        checkpointEvery: CHECKPOINT_EVERY,
        keepFullSeries: i < EXEMPLARS,
        sliceWeeks: SLICE_WEEKS,
        ...(COUNTER_FLOW === undefined ? {} : { counterFlow: COUNTER_FLOW }),
        ...(PUBLICITY === undefined ? {} : { publicity: PUBLICITY }),
        ...(MARKETING_GRID === undefined ? {} : { marketingGrid: MARKETING_GRID }),
        ...(PRODUCTION_D17B ? { productionD17b: true } : {}),
        ...(AWARENESS_STATS ? { awarenessStats: true } : {}),
      })
      absorb(aggs.get(policy.name)!, rec)
      // B2-C3: a cliff run never enters a win-share column. `winShares` compares only seeds
      // present in EVERY column, so omitting one drops that seed from the comparison rather
      // than handing the arm a free loss. A ROSTER-WALL run is NOT excluded (A5 Finding 0).
      if (!rec.engagementCliffHit) cashColumns.get(policy.name)!.set(seed, rec.endCash)
      buffer += `${stableJson(tagArtifact(rowForEmission(rec), TAG))}\n`
      if (buffer.length > 2_000_000) {
        appendFileSync(rowsPath, buffer)
        buffer = ''
      }
    }
    if ((i + 1) % 5 === 0) {
      process.stderr.write(`  … ${i + 1}/${SEEDS} seeds (${((Date.now() - started) / 1000).toFixed(1)}s)\n`)
    }
  }
  if (buffer.length > 0) appendFileSync(rowsPath, buffer)

  const summaries = policies.map((p) => finalize(aggs.get(p.name)!))

  // B2-C7: D9 says the exploit must NEVER be pooled with the player policies, but the only
  // emitted matrix pooled all 16 arms — P15 took 0.56 and P14 0.36, leaving the 14 player
  // policies 0.08 between them, and `summary.md` printed exactly that as the `winShare`
  // column. The PLAYER-ONLY matrix is now the headline; the all-arms matrix is still emitted
  // (it is the honest way to state "the exploit beats every player policy") but under a name
  // that says what it is.
  const playerColumns = new Map(
    [...cashColumns].filter(([name]) => policies.find((p) => p.name === name)?.kind === 'player'),
  )
  const winsPlayer = winShares(playerColumns)
  const winsAllArms = winShares(cashColumns)
  const playerSeedCoverage = comparableSeedCount(playerColumns)
  const allArmSeedCoverage = comparableSeedCount(cashColumns)

  const summary = tagArtifact(
    {
      runName: RUN_NAME,
      seeds: SEEDS,
      horizonWeeks: HORIZON,
      // F10 FIX: the slice list is the FLAG's, clipped to the horizon — and the identical list
      // is passed into `runOne`, so the column and the run can no longer disagree.
      sliceWeeks: SLICE_WEEKS.filter((w) => w <= HORIZON),
      checkpointEvery: CHECKPOINT_EVERY,
      exemplarSeeds: Math.min(EXEMPLARS, SEEDS),
      engineConstants: {
        INITIAL_CASH: TUNING.INITIAL_CASH,
        MAX_CONCURRENT_PRODUCTIONS: TUNING.MAX_CONCURRENT_PRODUCTIONS,
        PRODUCTION_TICKS: TUNING.PRODUCTION_TICKS,
        STUDIO_RENTAL_BLENDED: TUNING.STUDIO_RENTAL_BLENDED,
        OVERHEAD_BASE: TUNING.OVERHEAD_BASE,
        OVERHEAD_PER_EMPLOYEE: TUNING.OVERHEAD_PER_EMPLOYEE,
      },
      quantileDefinition: 'linear interpolation between order statistics (type 7): h=(n-1)q, s[floor h] + frac*(s[floor h + 1] - s[floor h])',
      readTimingTable: readTimingTable(),
      policies: summaries,
      /** THE HEADLINE MATRIX: kind === 'player' only. Never contains the exploit or the oracle. */
      endCashWinSharesPlayer: winsPlayer,
      /** every arm pooled, INCLUDING the labelled exploit and the oracle. Cite only as such. */
      endCashWinSharesAllArms: winsAllArms,
      /** seeds on which EVERY column in the respective matrix has a clean run. NaN shares ⇒ 0. */
      winShareComparableSeeds: { player: playerSeedCoverage, allArms: allArmSeedCoverage },
      winShareNote:
        'endCashWinSharesPlayer is the headline (kind === "player" only, per B1 D9: never pool the exploit with the player policies). endCashWinSharesAllArms includes P14_oracleEV and P15_exploitDisengage and is meaningful only when the sentence says so. Engagement-cliff runs are excluded from BOTH matrices and reported per policy as cliffRuns.',
      // ── D-17B additive fields ──
      d17b: {
        execution: PRODUCTION_D17B ? 'production' : 'lab',
        counterFlow: PRODUCTION_D17B
          ? {
              authorization: 'production',
              baseline: TUNING.AWARENESS_DRIFT_ANCHOR,
              family: 'C',
              kappa: TUNING.AWARENESS_DRIFT_RATE,
              revertMode: 'pullDownOnly',
            }
          : (COUNTER_FLOW ?? null),
        publicity: PRODUCTION_D17B ? PRODUCTION_PUBLICITY : (PUBLICITY ?? null),
        marketingGrid: PRODUCTION_D17B
          ? `production:capacity:${TUNING.MARKETING_MENU_MULTIPLIERS.join(',')}`
          : (MARKETING_GRID_KEY ?? null),
        productionCandidateKey: PRODUCTION_D17B ? PRODUCTION_CANDIDATE_KEY : null,
        awarenessStatsEmitted:
          PRODUCTION_D17B ||
          AWARENESS_STATS ||
          LEVERS.counterFlowKey !== undefined ||
          LEVERS.publicityKey !== undefined ||
          MARKETING_GRID_KEY !== undefined,
        durableOnRows: EMIT_DURABLE,
        recoveryNote:
          'recoveryRateGivenDistress is TRANSIENT (one healthy week after entry) and must not be quoted as a recovery rate: A5 measured 62–99% of transiently-recovered runs still terminally decline. durableRecoveryGivenDistress.at103 is the G8-form number (bar: >= 25%); at103Strict never dips inside the window. Both are computed on the WEEKLY state series.',
        rosterWallNote:
          'rosterWallRuns counts runs whose LAST contract lapsed while cash was negative (A5 Finding 0, the week-208 wall). These runs are INCLUDED in every distribution and win-share matrix — the only exclusion in this corpus is engagementCliffHit, which post-R2 is structurally impossible for a founded studio.',
      },
    },
    TAG,
  )

  writeFileSync(join(OUT, 'summary.json'), `${stableJson(summary, 2)}\n`)
  writeFileSync(
    join(OUT, 'summary.md'),
    renderMarkdown(summaries, winsPlayer, winsAllArms, playerSeedCoverage, allArmSeedCoverage),
  )

  const elapsed = (Date.now() - started) / 1000
  process.stderr.write(`\nD-16 corpus "${RUN_NAME}" — ${SEEDS} seeds × ${policies.length} policies × ${HORIZON} wk\n`)
  process.stderr.write(`  wall ${elapsed.toFixed(2)}s  (${(elapsed / Math.max(1, SEEDS * policies.length)).toFixed(3)}s per run)\n`)
  process.stderr.write(`  wrote ${OUT}\n`)
}

function money(n: number): string {
  if (!Number.isFinite(n)) return 'n/a'
  return `$${(n / 1_000_000).toFixed(2)}M`
}
function pct(n: number): string {
  return Number.isFinite(n) ? `${(n * 100).toFixed(0)}%` : 'n/a'
}

function renderMarkdown(
  summaries: PolicySummary[],
  winsPlayer: Record<string, number>,
  winsAllArms: Record<string, number>,
  playerSeeds: number,
  allArmSeeds: number,
): string {
  const lines: string[] = []
  lines.push(`# D-16 corpus — ${RUN_NAME}`)
  lines.push('')
  lines.push(`**Mode:** ${TAG.mode}${TAG.overrideKey ? ` (\`${TAG.overrideKey}\`)` : ''}`)
  lines.push(`**Seeds:** ${SEEDS} · **Horizon:** ${HORIZON} wk · **Policies:** ${summaries.length}`)
  lines.push('')
  lines.push('Quantiles: linear interpolation between order statistics (type 7). Non-final.')
  lines.push('')
  lines.push(
    '**`winShare` is the PLAYER-ONLY matrix** (`kind === "player"`): the labelled exploit and the ' +
      'oracle are excluded by construction (B1 D9). Their all-arms shares are listed separately below. ' +
      '**Every distribution excludes engagement-cliff runs**; those are reported in their own column ' +
      `and section, never pooled. Win shares are computed over the **${playerSeeds} seed(s)** on which ` +
      'EVERY player column has a clean run (all-arms: ' + String(allArmSeeds) + '); `n/a` means no seed ' +
      'was comparable, which is a coverage statement, not a tie.',
  )
  lines.push('')
  lines.push('| policy | kind | runs | median end cash | p10 | p90 | films | end+ | distress | transient recov\\|distress | **durable@103** | rosterWall | cliff | engaged wk | winShare |')
  lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const s of summaries) {
    const share = s.kind === 'player' ? pct(winsPlayer[s.policy] ?? NaN) : 'n/a'
    lines.push(
      `| ${s.policy} | ${s.kind} | ${s.runs}/${s.runsSeen} | ${money(s.endCash.median)} | ${money(s.endCash.p10)} | ${money(s.endCash.p90)} | ` +
        `${Number.isFinite(s.filmsReleased.median) ? s.filmsReleased.median.toFixed(0) : 'n/a'} | ${pct(s.endPositiveRate)} | ` +
        `${pct(s.distressRate)} | ${pct(s.recoveryRateGivenDistress)} | ${pct(s.durableRecoveryGivenDistress.at103)} | ` +
        `${s.rosterWallRuns} | ${pct(s.engagementCliffRate)} | ` +
        `${pct(s.engagedWeekFraction.median)} | ${share} |`,
    )
  }
  lines.push('')
  lines.push(
    '**`transient recov|distress` vs `durable@103`.** The transient column is ONE healthy week ' +
      'after distress entry — A5 measured that 62–99 % of runs it counts still terminally decline, ' +
      'so it must never be quoted as "the recovery rate". `durable@103` is the G8 form (a healthy ' +
      'week that is still healthy 103 weeks later; G8’s bar is 25 %), computed on the weekly state ' +
      'series. The strict variant (no dip anywhere in the window) is in `summary.json`. ' +
      '**`rosterWall`** counts runs whose last contract lapsed while cash was negative (the ' +
      'week-208 wall, A5 Finding 0); those runs are INCLUDED in every distribution here — the only ' +
      'exclusion is `cliff`, which post-R2 is structurally impossible for a founded studio.',
  )
  lines.push('')
  lines.push('## Excluded: engagement-cliff runs')
  lines.push('')
  lines.push('| policy | intended | cliff runs | first cliff week (median) | their end cash (median) |')
  lines.push('|---|---|---|---|---|')
  for (const s of summaries) {
    lines.push(
      `| ${s.policy} | ${s.disengagementIntended ? 'yes' : 'no'} | ${s.cliffRuns} | ` +
        `${Number.isFinite(s.cliffFirstWeek.median) ? s.cliffFirstWeek.median.toFixed(0) : 'n/a'} | ` +
        `${money(s.cliffEndCash.median)} |`,
    )
  }
  lines.push('')
  lines.push('## Durable recovery (G8 form) and the week-208 roster wall')
  lines.push('')
  lines.push(
    'Denominator for every durable column is the run’s own **distress entries**, not all runs. ' +
      '`n/a` means no run in that arm ever entered distress.',
  )
  lines.push('')
  lines.push('| policy | distress entries | durable@26 | durable@52 | durable@103 | durable@103 strict | rosterWall runs | first wall week (median) |')
  lines.push('|---|---|---|---|---|---|---|---|')
  for (const s of summaries) {
    const d = s.durableRecoveryGivenDistress
    const entries = Number.isFinite(s.distressRate) ? Math.round(s.distressRate * s.runs) : 0
    lines.push(
      `| ${s.policy} | ${entries} | ${pct(d.at26)} | ${pct(d.at52)} | ${pct(d.at103)} | ${pct(d.at103Strict)} | ` +
        `${s.rosterWallRuns} | ${Number.isFinite(s.rosterWallFirstWeek.median) ? s.rosterWallFirstWeek.median.toFixed(0) : 'n/a'} |`,
    )
  }
  if (summaries.some((s) => s.awarenessFinal.n > 0)) {
    lines.push('')
    lines.push('## Audience awareness (the stock under repair) — BOTH tails, gated jointly (Lesson BK)')
    lines.push('')
    lines.push('| policy | final median | final p10 | final p90 | min median | max median | weeks at floor (median) | floor absorption | ceiling absorption |')
    lines.push('|---|---|---|---|---|---|---|---|---|')
    const n1 = (x: number): string => (Number.isFinite(x) ? x.toFixed(2) : 'n/a')
    for (const s of summaries) {
      lines.push(
        `| ${s.policy} | ${n1(s.awarenessFinal.median)} | ${n1(s.awarenessFinal.p10)} | ${n1(s.awarenessFinal.p90)} | ` +
          `${n1(s.awarenessMin.median)} | ${n1(s.awarenessMax.median)} | ${n1(s.awarenessWeeksAtFloor.median)} | ` +
          `${pct(s.floorAbsorptionRate)} | ${pct(s.ceilingAbsorptionRate)} |`,
      )
    }
  }
  if (summaries.some((s) => s.publicityCount.n > 0)) {
    lines.push('')
    lines.push('## Paid publicity')
    lines.push('')
    lines.push('| policy | kind | purchases (median) | spend (median) | spend p90 | awareness pts delivered (median) | $ per point |')
    lines.push('|---|---|---|---|---|---|---|')
    for (const s of summaries) {
      const lift = s.publicityLiftDelivered.median
      const spend = s.publicitySpend.median
      const perPoint = Number.isFinite(lift) && lift > 0 ? `$${Math.round(spend / lift).toLocaleString('en-US')}` : 'n/a'
      lines.push(
        `| ${s.policy} | ${s.kind} | ${Number.isFinite(s.publicityCount.median) ? s.publicityCount.median.toFixed(0) : 'n/a'} | ` +
          `${money(spend)} | ${money(s.publicitySpend.p90)} | ${Number.isFinite(lift) ? lift.toFixed(2) : 'n/a'} | ${perPoint} |`,
      )
    }
    lines.push('')
    lines.push(
      '**The falsification gate (R9).** If `Q7_publicitySpamAdversary` beats `Q0_neverPublicize` on ' +
        'the paired-seed player matrix, or if Q4/Q7’s end-cash win share exceeds Q1/Q3’s, the mechanic ' +
        'IS upkeep spam and the candidate constants are rejected. Q7 is `kind: "adversary"`, so it is ' +
        'excluded from the player headline matrix by construction — read its share in the all-arms table.',
    )
  }
  lines.push('')
  lines.push('## All-arms win share (INCLUDES the exploit and the oracle — cite only as such)')
  lines.push('')
  lines.push(
    Object.keys(winsAllArms)
      .sort()
      .map((k) => `\`${k}\` ${pct(winsAllArms[k]!)}`)
      .join(' · '),
  )
  lines.push('')
  lines.push('## Cash by horizon slice (one run, sliced)')
  lines.push('')
  const sliceKeys = [...new Set(summaries.flatMap((s) => Object.keys(s.cashAt)))].sort((a, b) => Number(a) - Number(b))
  lines.push(`| policy | ${sliceKeys.map((k) => `wk ${k} median`).join(' | ')} |`)
  lines.push(`|---|${sliceKeys.map(() => '---').join('|')}|`)
  for (const s of summaries) {
    lines.push(`| ${s.policy} | ${sliceKeys.map((k) => money(s.cashAt[k]?.median ?? NaN)).join(' | ')} |`)
  }
  lines.push('')
  lines.push('## Per-film economics')
  lines.push('')
  lines.push('| policy | median contribution | p10 | p90 | realized/forecast gross (median) |')
  lines.push('|---|---|---|---|---|')
  for (const s of summaries) {
    lines.push(
      `| ${s.policy} | ${money(s.filmContribution.median)} | ${money(s.filmContribution.p10)} | ${money(s.filmContribution.p90)} | ` +
        `${Number.isFinite(s.realizedOverForecastGross.median) ? s.realizedOverForecastGross.median.toFixed(3) : 'n/a'} |`,
    )
  }
  lines.push('')
  lines.push('## Luck vs information (separated — B2-C2)')
  lines.push('')
  lines.push('`discoveryMultiplier` is the TRUE D-13 draw effect (bounded [0.2, 1.8], exactly 1.000 when reach support clears the threshold). `perceivedVsActualOpening` is the information gap: the perceived-skill deterministic opening ÷ the actual-skill one. They are different questions and must not be conflated.')
  lines.push('')
  lines.push('| policy | discovery p10 | discovery median | discovery p90 | perceived÷actual median | perceived÷actual p90 |')
  lines.push('|---|---|---|---|---|---|')
  const f4 = (n: number): string => (Number.isFinite(n) ? n.toFixed(4) : 'n/a')
  for (const s of summaries) {
    lines.push(
      `| ${s.policy} | ${f4(s.discoveryMultiplier.p10)} | ${f4(s.discoveryMultiplier.median)} | ${f4(s.discoveryMultiplier.p90)} | ` +
        `${f4(s.perceivedVsActualOpening.median)} | ${f4(s.perceivedVsActualOpening.p90)} |`,
    )
  }
  lines.push('')
  lines.push('## Unfieldable weeks and refused actions')
  lines.push('')
  lines.push('`unstaffable weeks` = weeks in which a production slot WAS free but the un-busy roster plus the visible freelancer market could not staff a legal film for a generation the policy actually asked for. Weeks with every slot already in production are excluded (there was no decision to block), as are the classifier’s `ignoreBusy` cost probes. This is a roster/market capacity signal, not a money signal — the money ladder is `distress`.')
  lines.push('')
  lines.push('| policy | unstaffable weeks (median) | max | rejected actions | top rejection reason |')
  lines.push('|---|---|---|---|---|')
  for (const s of summaries) {
    const top = Object.entries(s.rejectionReasons).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]
    lines.push(
      `| ${s.policy} | ${Number.isFinite(s.unstaffableWeeks.median) ? s.unstaffableWeeks.median.toFixed(0) : 'n/a'} | ` +
        `${Number.isFinite(s.unstaffableWeeks.max) ? s.unstaffableWeeks.max.toFixed(0) : 'n/a'} | ${s.rejectedActions} | ` +
        `${top === undefined ? '—' : `\`${top[0]}\` ×${top[1]}`} |`,
    )
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

if (Object.keys(OVERRIDES).length === 0) {
  main()
} else {
  withTuningOverrides(OVERRIDES, main, { regeneratesWorlds: REGENERATES_WORLDS })
}
// The canaries run AFTER the override scope closes — inside it, TUNING is legitimately
// mutated, so checking there would always (and wrongly) fire. The marketing grid gets the same
// treatment: every `withMarketingGrid` scope is opened and closed inside `runOne`.
assertTuningPristine('post-run')
assertMarketingGridPristine('post-run')
