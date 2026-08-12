// ── D-16 · corpus entry point ────────────────────────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// RUN:
//   node_modules/.bin/vite-node src/harness/d16/run-d16-corpus.ts [seeds] [horizonWeeks] [policyFilter] [flags]
//
//   seeds          integer, default 25          → seeds are `d16-0001` … zero-padded
//   horizonWeeks   integer, default 208         → slices at 52 / 104 / 208 come from ONE run
//   policyFilter   comma-separated policy names or prefixes ('P1,P3,P14'), default 'all'
//   flags          --overrides '{"OVERHEAD_BASE":10000}'   typed counterfactual sweep
//                  --run-name NAME                          output subdirectory
//                  --exemplars N                            full weekly series for the first N seeds (default 25)
//                  --checkpoint-every N                     downsample stride for the JSONL (default 4)
//                  --regenerates-worlds                     permit worldgen-time overrides
//
// OUTPUT: out/d16-economy-lab/corpus/<runName>/{rows.jsonl, summary.json, summary.md}
//   Every row and the summary carry { mode, overrides, overrideKey } (experiment.ts).
//   Stable sorted-key JSON, trailing newline. NO wall clock in any file — timing to stderr.

import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TUNING } from '../../core/index.js'
import { runOne } from './driver.js'
import type { RunRecord } from './driver.js'
import { ALL_POLICIES, policyByName } from './policies.js'
import type { Policy } from './policies.js'
import { makeTag, readTimingTable, tagArtifact, withTuningOverrides, assertTuningPristine } from './experiment.js'
import type { TuningOverrides } from './experiment.js'
import { comparableSeedCount, rateOf, summarize, winShares } from './stats.js'
import type { Summary } from './stats.js'

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

const overridesRaw = flag('overrides')
const OVERRIDES: TuningOverrides = overridesRaw === null || overridesRaw === '' ? {} : (JSON.parse(overridesRaw) as TuningOverrides)
const TAG = makeTag(OVERRIDES)

const policies: Policy[] =
  POLICY_FILTER === 'all'
    ? [...ALL_POLICIES]
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
  if (r.engagementCliffHit) {
    // CONTAMINATED — reported on its own, never pooled.
    agg.engagementCliffHits += 1
    if (r.engagementCliffWeek !== null) agg.cliffWeeks.push(r.engagementCliffWeek)
    agg.cliffEndCash.push(r.endCash)
    return
  }
  agg.runs += 1
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
  }
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
      })
      absorb(aggs.get(policy.name)!, rec)
      // B2-C3: a cliff run never enters a win-share column. `winShares` compares only seeds
      // present in EVERY column, so omitting one drops that seed from the comparison rather
      // than handing the arm a free loss.
      if (!rec.engagementCliffHit) cashColumns.get(policy.name)!.set(seed, rec.endCash)
      buffer += `${stableJson(tagArtifact(rec as unknown as Record<string, unknown>, TAG))}\n`
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
      sliceWeeks: [52, 104, 208].filter((w) => w <= HORIZON),
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
  lines.push('| policy | kind | runs | median end cash | p10 | p90 | films | end+ | distress | recov\\|distress | cliff | engaged wk | winShare |')
  lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const s of summaries) {
    const share = s.kind === 'player' ? pct(winsPlayer[s.policy] ?? NaN) : 'n/a'
    lines.push(
      `| ${s.policy} | ${s.kind} | ${s.runs}/${s.runsSeen} | ${money(s.endCash.median)} | ${money(s.endCash.p10)} | ${money(s.endCash.p90)} | ` +
        `${Number.isFinite(s.filmsReleased.median) ? s.filmsReleased.median.toFixed(0) : 'n/a'} | ${pct(s.endPositiveRate)} | ` +
        `${pct(s.distressRate)} | ${pct(s.recoveryRateGivenDistress)} | ${pct(s.engagementCliffRate)} | ` +
        `${pct(s.engagedWeekFraction.median)} | ${share} |`,
    )
  }
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
// The canary runs AFTER the override scope closes — inside it, TUNING is legitimately
// mutated, so checking there would always (and wrongly) fire.
assertTuningPristine('post-run')
