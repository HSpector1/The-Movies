// ── D-17B · CONTINUATION CORPUS (recovery + runaway) ─────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// THE QUESTION. A5 measured that durable recovery at +103 weeks is 0.0 % for 9 of 14 player
// policies (best player arm 13.0 %, oracle 13.8 % — all below G8's 25 %), that insolvency has a
// 99.79 % weekly self-transition, and that awareness is bimodal-absorbing. This runner asks the
// counterfactual: FROM A REAL DISTRESSED STATE, does a counter-flow + one publicity action turn
// the 0-absorbing awareness stock into a two-way one, and does that produce DURABLE recovery?
//
// THE INPUT. Stage 5's 180 harvested states (`{ meta, save }` JSON files, one per state, written
// by the A5 harvest). They are real `SaveFileV6` envelopes, so they load through the SHIPPED
// save path — nothing here reconstructs a state by hand:
//     readFileSync → JSON.parse → loadSave (validates) → migrateToV10 → .state
// A run resumed from one of them is accounted to ITSELF: `runOne` reads `startWeek`,
// `openingCash` and `filmsReleasedAtStart` from the resumed state, slices RELATIVELY, and
// measures runaway against `runawayCash(openingCash)` (B2-C10 / B2-M6). Nothing is written back
// to any save file.
//
// LESSON BK. Both tails ship together or neither number is quotable: `--tail recovery` continues
// distressed states, `--tail runaway` continues the runaway ones, `--tail both` (the default)
// does both into one artifact and reports them side by side.
//
// RUN:
//   node_modules/.bin/vite-node src/harness/d16/run-d17b-continuation.ts \
//     --states <dir> [--horizon 156] [--policies Q0,Q1,Q5] [--arms off,C,D,F] \
//     [--publicity default|'{…}'] [--tail recovery|runaway|both] [--run-name NAME]
//     [--classes bareMinOnly,noProduction,insolvent] [--limit N] [--marketing-grid …]
//     [--production-d17b]   frozen production path; cannot combine with lab lever flags
//
// OUTPUT: out/d16-economy-lab/d17b/continuation/<runName>/{rows.jsonl, summary.json, summary.md}
// Every row carries its entry state's id/class/week, and every row and the summary carry the
// artifact tag — a continuation arm is ALWAYS counterfactual when a lever is on.

import { mkdirSync, readdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSave, migrateToV13 } from '../../core/index.js'
import type { GameState } from '../../core/index.js'
import { runOne } from './driver.js'
import type { RunRecord } from './driver.js'
import { policyByName } from './policies.js'
import type { Policy } from './policies.js'
import { makeTag, tagArtifact, assertTuningPristine } from './experiment.js'
import type { LabLevers } from './experiment.js'
import { COUNTER_FLOW_OFF, counterFlowKey, validateCounterFlow } from './counterflow.js'
import type { CounterFlowConfig } from './counterflow.js'
import { DEFAULT_PUBLICITY, PRODUCTION_PUBLICITY, publicityKey, validatePublicity } from './publicity.js'
import type { PublicityConfig } from './publicity.js'
import { assertMarketingGridPristine } from './packages.js'
import { rateOf, summarize } from './stats.js'
import type { Summary } from './stats.js'
import type { FinancialState } from './states.js'
import { productionCandidateKey, productionCounterFlowIdentity } from './productionIdentity.js'
import { sourceProvenance } from './sourceProvenance.js'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')
const OUT_ROOT = join(repoRoot, 'out', 'd16-economy-lab', 'd17b', 'continuation')

// ── argv ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
function flag(name: string): string | null {
  const i = argv.indexOf(`--${name}`)
  if (i === -1) return null
  return argv[i + 1] ?? ''
}
function has(name: string): boolean {
  return argv.includes(`--${name}`)
}

const STATES_DIR = flag('states')
if (STATES_DIR === null || STATES_DIR === '') {
  throw new Error(
    'run-d17b-continuation: --states <dir> is required (the Stage-5 harvested-state directory).',
  )
}
const HORIZON = Number(flag('horizon') ?? 156)
const RUN_NAME = flag('run-name') ?? `continuation-h${HORIZON}`
const LIMIT = Number(flag('limit') ?? 0)
const TAIL = (flag('tail') ?? 'both') as 'recovery' | 'runaway' | 'both'
const CLASS_FILTER = (flag('classes') ?? '').split(',').map((s) => s.trim()).filter((s) => s !== '')
const PRODUCTION_D17B = has('production-d17b')

/**
 * The default arm menu (A4 §7): the never-publicize control plus the two publicity arms whose
 * rules are the interesting ones in distress, crossed with the counter-flow families that
 * MEASURED a recovery effect. Every family here is declared with its authorization, so C/D/F
 * cannot be mistaken for implementable candidates in the artifact.
 */
const ARM_MENU: Record<string, CounterFlowConfig> = {
  off: COUNTER_FLOW_OFF,
  // Historical Stage-5 exploratory arm. It is not the frozen REV.3 candidate.
  C: { family: 'C', authorization: 'reference', kappa: 0.02, baseline: 30, revertMode: 'pullDownOnly' },
  // LABELLED REFERENCE ARMS (gate ruling 2) — reported, never proposed
  C2: { family: 'C', authorization: 'reference', kappa: 0.02, baseline: 30 },
  D: { family: 'D', authorization: 'reference', gainKeep: 1, lossKeep: 0.5, idleDrain: 0.02 },
  F: { family: 'F', authorization: 'reference', pivotHalfLifeReleases: 3 },
}

const armsRaw = flag('arms')
const ARM_NAMES = PRODUCTION_D17B
  ? ['production']
  : (armsRaw ?? 'off,C,D,F').split(',').map((s) => s.trim()).filter((s) => s !== '')
const POLICY_NAMES = (flag('policies') ?? 'Q0,Q1,Q5').split(',').map((s) => s.trim()).filter((s) => s !== '')

const cfOverrideRaw = flag('counter-flow')
if (!PRODUCTION_D17B && cfOverrideRaw !== null && cfOverrideRaw !== '') {
  ARM_MENU['custom'] = JSON.parse(cfOverrideRaw) as CounterFlowConfig
  ARM_NAMES.push('custom')
}
for (const name of ARM_NAMES) {
  const cfg = name === 'production' ? COUNTER_FLOW_OFF : ARM_MENU[name]
  if (cfg === undefined) {
    throw new Error(`run-d17b-continuation: unknown arm "${name}". Known: ${Object.keys(ARM_MENU).join(', ')}`)
  }
  if (cfg.family !== 'off') validateCounterFlow(cfg)
}

const publicityRaw = flag('publicity')
const marketingGridRaw = flag('marketing-grid')
if (
  PRODUCTION_D17B &&
  (armsRaw !== null || publicityRaw !== null || cfOverrideRaw !== null || marketingGridRaw !== null)
) {
  throw new Error(
    '--production-d17b cannot be combined with --arms, --publicity, --counter-flow, or --marketing-grid',
  )
}
const PUBLICITY: PublicityConfig | undefined =
  PRODUCTION_D17B
    ? PRODUCTION_PUBLICITY
    : publicityRaw === null || publicityRaw === ''
    ? DEFAULT_PUBLICITY
    : publicityRaw === 'none'
      ? undefined
      : publicityRaw === 'default'
        ? DEFAULT_PUBLICITY
        : (JSON.parse(publicityRaw) as PublicityConfig)
if (PUBLICITY !== undefined) validatePublicity(PUBLICITY)

const policies: Policy[] = POLICY_NAMES.map((n) => policyByName(n))

// ── deterministic JSON (identical rule to run-d16-corpus.ts) ─────────────────
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

// ── the harvested states ─────────────────────────────────────────────────────
type EntryState = {
  id: string
  class: FinancialState | string
  seed: string
  policy: string
  week: number
  cash: number
  audienceAwareness: number
  state: GameState
}

/**
 * Load every `{ meta, save }` file in the directory through the SHIPPED save path. Files are
 * read in sorted filename order so the corpus is reproducible; `_manifest.json` (the harvest's
 * own index) is skipped.
 */
function loadStates(dir: string): EntryState[] {
  const out: EntryState[] = []
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.json') || f.startsWith('_')) continue
    const raw = JSON.parse(readFileSync(join(dir, f), 'utf8')) as {
      meta: Record<string, unknown>
      save: unknown
    }
    const save = migrateToV13(loadSave(raw.save))
    const state = save.state
    out.push({
      id: String(raw.meta['id'] ?? f.replace(/\.json$/, '')),
      class: String(raw.meta['class'] ?? 'unknown'),
      seed: String(raw.meta['seed'] ?? state.seed),
      policy: String(raw.meta['policy'] ?? 'unknown'),
      week: state.market.tick,
      cash: state.studio.cash,
      audienceAwareness: state.studio.standing.audienceAwareness,
      state,
    })
  }
  return out
}

const DISTRESS_CLASSES = new Set(['bareMinOnly', 'noProduction', 'insolvent', 'constrained'])

function wantedTail(cls: string): boolean {
  if (TAIL === 'both') return true
  const distressed = DISTRESS_CLASSES.has(cls)
  return TAIL === 'recovery' ? distressed : !distressed
}

// ── aggregation ──────────────────────────────────────────────────────────────
type ArmKey = string
type ArmAgg = {
  arm: ArmKey
  policy: string
  counterFlow: string
  authorization: string
  runs: number
  endCash: number[]
  deltaCash: number[]
  filmsReleased: number[]
  durable26: number
  durable52: number
  durable103: number
  durable103Strict: number
  durableJudged: number
  exitsFromFloor: number[]
  awarenessFinal: number[]
  publicitySpend: number[]
  publicityCount: number[]
  rosterWallHits: number
  endedInsolvent: number
}

function newArm(arm: string, policy: string, cfName: string, auth: string): ArmAgg {
  return {
    arm,
    policy,
    counterFlow: cfName,
    authorization: auth,
    runs: 0,
    endCash: [],
    deltaCash: [],
    filmsReleased: [],
    durable26: 0,
    durable52: 0,
    durable103: 0,
    durable103Strict: 0,
    durableJudged: 0,
    exitsFromFloor: [],
    awarenessFinal: [],
    publicitySpend: [],
    publicityCount: [],
    rosterWallHits: 0,
    endedInsolvent: 0,
  }
}

function absorb(a: ArmAgg, rec: RunRecord): void {
  a.runs += 1
  a.endCash.push(rec.endCash)
  a.deltaCash.push(rec.endCash - rec.openingCash)
  a.filmsReleased.push(rec.filmsReleased)
  if (rec.durableRecovery !== undefined) {
    a.durableJudged += 1
    if (rec.durableRecovery.at26) a.durable26 += 1
    if (rec.durableRecovery.at52) a.durable52 += 1
    if (rec.durableRecovery.at103) a.durable103 += 1
    if (rec.durableRecovery.at103Strict) a.durable103Strict += 1
  }
  if (rec.awareness !== undefined) {
    a.exitsFromFloor.push(rec.awareness.exitsFromFloor)
    a.awarenessFinal.push(rec.awareness.final)
  }
  if (rec.publicity !== undefined) {
    a.publicitySpend.push(rec.publicity.spend)
    a.publicityCount.push(rec.publicity.count)
  }
  if (rec.rosterWallHit === true) a.rosterWallHits += 1
  if (rec.episodes.endState === 'insolvent') a.endedInsolvent += 1
}

type ArmSummary = {
  arm: string
  policy: string
  counterFlow: string
  /** 'candidate' = implementation-eligible; 'reference' = labelled reference arm ONLY. */
  authorization: string
  runs: number
  endCash: Summary
  deltaCash: Summary
  filmsReleased: Summary
  /**
   * DURABLE recovery over the runs the horizon could JUDGE (a run that never entered distress
   * in its own continuation is not counted either way — the denominator is stated).
   */
  durableJudged: number
  durableAt26: number
  durableAt52: number
  durableAt103: number
  durableAt103Strict: number
  /** does the awareness stock become TWO-WAY at all? (A4 F5: 0 is absorbing today) */
  exitsFromFloor: Summary
  awarenessFinal: Summary
  floorAbsorptionRate: number
  publicityCount: Summary
  publicitySpend: Summary
  rosterWallRuns: number
  endedInsolventRate: number
}

function finalize(a: ArmAgg): ArmSummary {
  const d = (n: number): number => (a.durableJudged === 0 ? NaN : n / a.durableJudged)
  return {
    arm: a.arm,
    policy: a.policy,
    counterFlow: a.counterFlow,
    authorization: a.authorization,
    runs: a.runs,
    endCash: summarize(a.endCash),
    deltaCash: summarize(a.deltaCash),
    filmsReleased: summarize(a.filmsReleased),
    durableJudged: a.durableJudged,
    durableAt26: d(a.durable26),
    durableAt52: d(a.durable52),
    durableAt103: d(a.durable103),
    durableAt103Strict: d(a.durable103Strict),
    exitsFromFloor: summarize(a.exitsFromFloor),
    awarenessFinal: summarize(a.awarenessFinal),
    floorAbsorptionRate: rateOf(a.awarenessFinal, (x) => x <= 0),
    publicityCount: summarize(a.publicityCount),
    publicitySpend: summarize(a.publicitySpend),
    rosterWallRuns: a.rosterWallHits,
    endedInsolventRate: a.runs === 0 ? NaN : a.endedInsolvent / a.runs,
  }
}

// ── execute ──────────────────────────────────────────────────────────────────
function main(): void {
  const all = loadStates(STATES_DIR!)
  const entries = all
    .filter((e) => wantedTail(String(e.class)))
    .filter((e) => CLASS_FILTER.length === 0 || CLASS_FILTER.includes(String(e.class)))
  const chosen = LIMIT > 0 ? entries.slice(0, LIMIT) : entries
  if (chosen.length === 0) {
    throw new Error(`run-d17b-continuation: no entry states matched (dir ${STATES_DIR!}, tail ${TAIL}).`)
  }

  const out = join(OUT_ROOT, RUN_NAME)
  mkdirSync(out, { recursive: true })
  const rowsPath = join(out, 'rows.jsonl')
  writeFileSync(rowsPath, '')

  const aggs = new Map<string, ArmAgg>()
  let buffer = ''
  let done = 0

  // entry-major, then arm, then policy — a fixed iteration order (A17 §4.2 rule 7).
  for (const entry of chosen) {
    for (const armName of ARM_NAMES) {
      const cf = armName === 'production' ? COUNTER_FLOW_OFF : ARM_MENU[armName]!
      for (const policy of policies) {
        const key = `${armName}|${policy.name}`
        let agg = aggs.get(key)
        if (agg === undefined) {
          agg = newArm(
            armName,
            policy.name,
            cf.family,
            PRODUCTION_D17B ? 'production' : cf.family === 'off' ? 'n/a' : cf.authorization,
          )
          aggs.set(key, agg)
        }
        const rec = runOne({
          seed: entry.seed,
          policy,
          horizonWeeks: HORIZON,
          initialState: entry.state,
          awarenessStats: true,
          ...(PRODUCTION_D17B ? { productionD17b: true } : {}),
          ...(!PRODUCTION_D17B && cf.family !== 'off' ? { counterFlow: cf } : {}),
          ...(!PRODUCTION_D17B && PUBLICITY !== undefined ? { publicity: PUBLICITY } : {}),
        })
        absorb(agg, rec)
        const levers: LabLevers = {}
        if (PRODUCTION_D17B) levers.productionCandidateKey = productionCandidateKey()
        else {
          const cfk = counterFlowKey(cf)
          if (cfk !== undefined) levers.counterFlowKey = cfk
          const pk = publicityKey(PUBLICITY)
          if (pk !== undefined) levers.publicityKey = pk
        }
        const row: Record<string, unknown> = {
          ...(rec as unknown as Record<string, unknown>),
          entryId: entry.id,
          entryClass: entry.class,
          entryWeek: entry.week,
          entryCash: entry.cash,
          entryAwareness: entry.audienceAwareness,
          entryPolicy: entry.policy,
          arm: armName,
          armAuthorization: PRODUCTION_D17B ? 'production' : cf.family === 'off' ? 'n/a' : cf.authorization,
        }
        delete row['captures']
        buffer += `${stableJson(tagArtifact(row, makeTag({}, levers)))}\n`
        if (buffer.length > 2_000_000) {
          appendFileSync(rowsPath, buffer)
          buffer = ''
        }
      }
    }
    done += 1
    if (done % 10 === 0) process.stderr.write(`  … ${done}/${chosen.length} entry states\n`)
  }
  if (buffer.length > 0) appendFileSync(rowsPath, buffer)

  const summaries = [...aggs.values()].map(finalize)
  const levers: LabLevers = {}
  if (PRODUCTION_D17B) levers.productionCandidateKey = productionCandidateKey()
  else {
    const pk = publicityKey(PUBLICITY)
    if (pk !== undefined) levers.publicityKey = pk
  }
  const summary = tagArtifact(
    {
      runName: RUN_NAME,
      source: sourceProvenance(),
      statesDir: STATES_DIR,
      entryStates: chosen.length,
      entryClasses: countBy(chosen.map((e) => String(e.class))),
      horizonWeeks: HORIZON,
      tail: TAIL,
      arms: ARM_NAMES.map((n) => ({
        arm: n,
        config: n === 'production' ? productionCounterFlowIdentity() : ARM_MENU[n]!,
        counterFlowKey: n === 'production' ? null : counterFlowKey(ARM_MENU[n]!) ?? null,
      })),
      policies: POLICY_NAMES,
      publicity: PUBLICITY ?? null,
      results: summaries,
      authorizationNote:
        'authorization "production" executes the frozen REV.3 mechanics through production code. "reference" = a LABELLED historical or unauthorized arm, run for honest reporting only under D-17B Phase-A gate ruling 2 — never quotable as a proposal.',
      denominatorNote:
        'durableAt* denominators are `durableJudged` — the continuations that ENTERED distress within their own horizon, so the rate is not diluted by runs that were never in trouble. A continuation is accounted to ITSELF (B2-C10): slices, runaway threshold and film counts are all relative to the resumed state.',
      pairingNote:
        'Arms share the entry state AND the seed, so every comparison here is PAIRED. n=1 per (entry, arm, policy) — the population is the entry-state set, never one save.',
    },
    makeTag({}, levers),
  )
  writeFileSync(join(out, 'summary.json'), `${stableJson(summary, 2)}\n`)
  writeFileSync(join(out, 'summary.md'), renderMarkdown(summaries, chosen.length))
  process.stderr.write(
    `\nD-17B continuation "${RUN_NAME}" — ${chosen.length} entry states × ${ARM_NAMES.length} arms × ${policies.length} policies × ${HORIZON} wk\n  wrote ${out}\n`,
  )
}

function countBy(xs: readonly string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const x of xs) out[x] = (out[x] ?? 0) + 1
  for (const k of Object.keys(out).sort()) {
    const v = out[k]!
    delete out[k]
    out[k] = v
  }
  return out
}

function money(n: number): string {
  return Number.isFinite(n) ? `$${(n / 1_000_000).toFixed(2)}M` : 'n/a'
}
function pct(n: number): string {
  return Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : 'n/a'
}

function renderMarkdown(rows: ArmSummary[], entryCount: number): string {
  const lines: string[] = []
  lines.push(`# D-17B continuation corpus — ${RUN_NAME}`)
  lines.push('')
  lines.push(`**Entry states:** ${entryCount} · **Horizon:** ${HORIZON} wk · **Tail:** ${TAIL}`)
  lines.push('')
  lines.push(
    'Every arm continues the SAME entry states, so all comparisons are paired. **`authorization`** ' +
      'is load-bearing: `candidate` arms are inside the R9 lever family and may be proposed; ' +
      '`reference` arms (two-sided mean reversion with a free pull-up, loss-leg damping, the ' +
      'endogenous EMA pivot) are run for honest reporting ONLY and must never be quoted as a ' +
      'proposal (D-17B Phase-A gate ruling 2).',
  )
  lines.push('')
  lines.push('| arm | auth | policy | runs | median Δcash | median end cash | durable@52 | durable@103 | @103 strict | judged | exits from floor (median) | final awareness (median) | floor absorbed | publicity spend (median) | ended insolvent |')
  lines.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const r of rows) {
    lines.push(
      `| ${r.arm} | ${r.authorization} | ${r.policy} | ${r.runs} | ${money(r.deltaCash.median)} | ${money(r.endCash.median)} | ` +
        `${pct(r.durableAt52)} | **${pct(r.durableAt103)}** | ${pct(r.durableAt103Strict)} | ${r.durableJudged} | ` +
        `${Number.isFinite(r.exitsFromFloor.median) ? r.exitsFromFloor.median.toFixed(1) : 'n/a'} | ` +
        `${Number.isFinite(r.awarenessFinal.median) ? r.awarenessFinal.median.toFixed(2) : 'n/a'} | ` +
        `${pct(r.floorAbsorptionRate)} | ${money(r.publicitySpend.median)} | ${pct(r.endedInsolventRate)} |`,
    )
  }
  lines.push('')
  lines.push(
    '`exits from floor` is THE structural question A4 F5 poses: today the awareness stock is ' +
      'absorbing at 0 (68 % of P3 runs reach it and never leave). An arm that does not raise this ' +
      'number above 0 has not made the stock two-way, whatever it did to the cash column.',
  )
  lines.push('')
  return `${lines.join('\n')}\n`
}

main()
assertTuningPristine('post-continuation')
assertMarketingGridPristine('post-continuation')
