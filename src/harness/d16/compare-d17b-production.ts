// ── D-17B · PRODUCTION ↔ FROZEN-LAB AGREEMENT ───────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// RUN:
//   node_modules/.bin/vite-node src/harness/d16/compare-d17b-production.ts \
//     [reference-dir] [production-dir] [--run-name NAME]
//
// This is an acceptance tool, not a tuning tool. It compares the 300 paired seeds policy by
// policy, records every mismatch, and gives known frozen-reference defects their own explicit
// status rather than deleting, repairing, or silently pooling them.

import { createReadStream, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { median, pairedDeltas, pairedWinRate, quantile, winShares } from './stats.js'
import { productionCandidateKey } from './productionIdentity.js'
import { sourceProvenance } from './sourceProvenance.js'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')
const corpusRoot = join(repoRoot, 'out', 'd16-economy-lab', 'corpus')
const outRoot = join(repoRoot, 'out', 'd16-economy-lab', 'd17b', 'agreement')

const argv = process.argv.slice(2)
const positional = argv.filter((arg) => !arg.startsWith('--'))
function flag(name: string): string | null {
  const index = argv.indexOf(`--${name}`)
  return index === -1 ? null : (argv[index + 1] ?? '')
}

const referenceDir = positional[0] ?? join(corpusRoot, 'd17b-final-reference-sat100')
const productionDir = positional[1] ?? join(corpusRoot, 'd17b-final-production-reviewed')
const runName = flag('run-name') ?? 'd17b-final-production-agreement'

type NumericSummary = { n: number; median: number }
type PolicySummary = {
  policy: string
  kind?: string
  runs: number
  endCash: NumericSummary
  distressRate: number | null
  runawayRate: number | null
  floorAbsorptionRate: number | null
  durableRecoveryGivenDistress: { at103: number | null }
  marketingChoices: Record<string, number>
}
type CorpusSummary = {
  runName: string
  seeds: number
  horizonWeeks: number
  mode: string
  publicityKey?: string
  d17b?: {
    execution?: string
    publicity?: { tiers?: { whisper?: { saturation?: number } } }
    productionCandidateKey?: string | null
  }
  source?: { sourceCommit?: string; sourceTree?: string; worktreeDirty?: boolean } | null
  policies: PolicySummary[]
}
type ThinRow = {
  seed: string
  policy: string
  endCash: number
  engagementCliffHit?: boolean
  publicity?: { byTier?: Partial<Record<'whisper' | 'push' | 'blitz', number>> }
  films?: Array<{ marketingLevel?: number }>
}

function readSummary(dir: string): CorpusSummary {
  return JSON.parse(readFileSync(join(dir, 'summary.json'), 'utf8')) as CorpusSummary
}

type RowEvidence = {
  cash: Map<string, Map<string, number>>
  publicityTiers: Record<'whisper' | 'push' | 'blitz', number>
  marketingRungs: Record<string, number>
}

async function readEvidence(dir: string): Promise<RowEvidence> {
  const columns = new Map<string, Map<string, number>>()
  const publicityTiers = { whisper: 0, push: 0, blitz: 0 }
  const marketingRungs: Record<string, number> = {}
  const lines = createInterface({ input: createReadStream(join(dir, 'rows.jsonl')), crlfDelay: Infinity })
  for await (const line of lines) {
    if (line === '') continue
    const row = JSON.parse(line) as ThinRow
    if (row.engagementCliffHit === true) continue
    let policy = columns.get(row.policy)
    if (policy === undefined) {
      policy = new Map()
      columns.set(row.policy, policy)
    }
    policy.set(row.seed, row.endCash)
    for (const tier of ['whisper', 'push', 'blitz'] as const) {
      publicityTiers[tier] += row.publicity?.byTier?.[tier] ?? 0
    }
    for (const film of row.films ?? []) {
      const key = String(film.marketingLevel ?? 'missing')
      marketingRungs[key] = (marketingRungs[key] ?? 0) + 1
    }
  }
  return { cash: columns, publicityTiers, marketingRungs }
}

function hash32(text: string): number {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function xorshift32(seed: number): () => number {
  let state = seed === 0 ? 0x9e3779b9 : seed
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 0x1_0000_0000
  }
}

function bootstrapMedian95(values: readonly number[], key: string, reps = 5000): [number, number] {
  if (values.length === 0) return [NaN, NaN]
  const random = xorshift32(hash32(`d17b-bootstrap:${key}`))
  const sample = new Array<number>(values.length)
  const medians = new Array<number>(reps)
  for (let rep = 0; rep < reps; rep++) {
    for (let i = 0; i < values.length; i++) sample[i] = values[Math.floor(random() * values.length)]!
    medians[rep] = median(sample)
  }
  return [quantile(medians, 0.025), quantile(medians, 0.975)]
}

function wilson95(rate: number, n: number): [number, number] {
  if (!Number.isFinite(rate) || n <= 0) return [NaN, NaN]
  const z = 1.959963984540054
  const z2 = z * z
  const center = (rate + z2 / (2 * n)) / (1 + z2 / n)
  const half =
    (z / (1 + z2 / n)) * Math.sqrt((rate * (1 - rate)) / n + z2 / (4 * n * n))
  return [Math.max(0, center - half), Math.min(1, center + half)]
}

function intervalsOverlap(a: readonly number[], b: readonly number[]): boolean {
  return a[0]! <= b[1]! && b[0]! <= a[1]!
}

type RateName = 'floorAbsorptionRate' | 'distressRate' | 'runawayRate' | 'durableAt103'
function rateValue(policy: PolicySummary, metric: RateName): { rate: number; n: number } {
  if (metric === 'durableAt103') {
    const distress = policy.distressRate ?? NaN
    return {
      rate: policy.durableRecoveryGivenDistress.at103 ?? NaN,
      n: Number.isFinite(distress) ? Math.round(distress * policy.runs) : 0,
    }
  }
  return { rate: policy[metric] ?? NaN, n: policy.runs }
}

function stable(value: unknown): string {
  function sort(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(sort)
    if (v !== null && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const key of Object.keys(v).sort()) out[key] = sort((v as Record<string, unknown>)[key])
      return out
    }
    return v
  }
  return `${JSON.stringify(sort(value), null, 2)}\n`
}

function fmtMoney(value: number): string {
  return Number.isFinite(value) ? `$${(value / 1_000_000).toFixed(2)}M` : 'n/a'
}
function fmtPct(value: number): string {
  return Number.isFinite(value) ? `${(value * 100).toFixed(2)}%` : 'n/a'
}

async function main(): Promise<void> {
  const reference = readSummary(referenceDir)
  const production = readSummary(productionDir)
  const [referenceRows, productionRows] = await Promise.all([
    readEvidence(referenceDir),
    readEvidence(productionDir),
  ])
  const referenceCash = referenceRows.cash
  const productionCash = productionRows.cash
  const referencePolicies = new Map(reference.policies.map((policy) => [policy.policy, policy]))
  const productionPolicies = new Map(production.policies.map((policy) => [policy.policy, policy]))
  const policyNames = [...new Set([...referencePolicies.keys(), ...productionPolicies.keys()])].sort()
  const metricNames: RateName[] = [
    'floorAbsorptionRate',
    'distressRate',
    'runawayRate',
    'durableAt103',
  ]

  const comparisons = policyNames.map((policy) => {
    const refSummary = referencePolicies.get(policy)
    const prodSummary = productionPolicies.get(policy)
    const refCash = referenceCash.get(policy) ?? new Map<string, number>()
    const prodCash = productionCash.get(policy) ?? new Map<string, number>()
    const sharedSeeds = [...refCash.keys()].filter((seed) => prodCash.has(seed)).sort()
    const refValues = sharedSeeds.map((seed) => refCash.get(seed)!)
    const prodValues = sharedSeeds.map((seed) => prodCash.get(seed)!)
    const medianBand = bootstrapMedian95(refValues, policy)
    const productionMedian = median(prodValues)
    const knownReferenceDefect = policy === 'P15_exploitDisengage'
    const rates = metricNames.map((metric) => {
      if (refSummary === undefined || prodSummary === undefined) {
        return { metric, status: 'MISSING', reference: NaN, production: NaN, deltaPp: NaN }
      }
      const ref = rateValue(refSummary, metric)
      const prod = rateValue(prodSummary, metric)
      const refCi = wilson95(ref.rate, ref.n)
      const prodCi = wilson95(prod.rate, prod.n)
      const deltaPp = (prod.rate - ref.rate) * 100
      const pass = Math.abs(deltaPp) <= 2 || intervalsOverlap(refCi, prodCi)
      return {
        metric,
        status: knownReferenceDefect ? 'NOT_COMPARABLE' : pass ? 'PASS' : 'FAIL',
        reference: ref.rate,
        production: prod.rate,
        deltaPp,
        reference95: refCi,
        production95: prodCi,
      }
    })
    return {
      policy,
      sharedSeeds: sharedSeeds.length,
      status:
        refSummary === undefined || prodSummary === undefined
          ? 'MISSING'
          : knownReferenceDefect
            ? 'NOT_COMPARABLE'
            : productionMedian >= medianBand[0] &&
                productionMedian <= medianBand[1] &&
                rates.every((rate) => rate.status === 'PASS')
              ? 'PASS'
              : 'FAIL',
      referenceMedian: median(refValues),
      referenceMedianBootstrap95: medianBand,
      productionMedian,
      medianDelta: productionMedian - median(refValues),
      rates,
      note: knownReferenceDefect
        ? 'Frozen reference ran P15 through employmentEngaged and therefore the abolished pre-D-17A economy; production correctly uses persisted economyEngaged. This arm is evidence of a reference defect, not an implementation mismatch.'
        : null,
    }
  })

  function gatePair(
    columns: ReadonlyMap<string, ReadonlyMap<string, number>>,
    left: string,
    right: string,
    predicate: (winRate: number, medianDelta: number) => boolean,
  ): { sharedSeeds: number; strictWinRate: number; medianDelta: number; pass: boolean } {
    const a = columns.get(left) ?? new Map<string, number>()
    const b = columns.get(right) ?? new Map<string, number>()
    const deltas = pairedDeltas(a, b)
    const win = pairedWinRate(a, b)
    const medianDelta = median(deltas.deltas)
    return {
      sharedSeeds: deltas.seeds.length,
      strictWinRate: win,
      medianDelta,
      pass: predicate(win, medianDelta),
    }
  }

  const refQ6 = pairedWinRate(referenceCash.get('Q6_awarenessMaintenance')!, referenceCash.get('P3_standardCadence')!)
  const prodQ6 = pairedWinRate(productionCash.get('Q6_awarenessMaintenance')!, productionCash.get('P3_standardCadence')!)
  const maintenance = {
    referenceStrictWinRate: refQ6,
    productionStrictWinRate: prodQ6,
    referenceVerdict: refQ6 >= 0.5 ? 'PASS' : 'FAIL',
    productionVerdict: prodQ6 >= 0.5 ? 'PASS' : 'FAIL',
    identicalVerdict: (refQ6 >= 0.5) === (prodQ6 >= 0.5),
    boundaryNote:
      'Q6 is the governed below-A20 focused arm, not the separate break-even-tuned below-A30 verification cited in REV.3. A two-seed swing across 50% is reported, never tuned away.',
  }
  const antiSpamRef = gatePair(
    referenceCash,
    'Q7_publicitySpamAdversary',
    'Q0_neverPublicize',
    (wins, medianDelta) => wins <= 0.4 && medianDelta < 0,
  )
  const antiSpamProdA = productionCash.get('Q7_publicitySpamAdversary')!
  const antiSpamProdB = productionCash.get('Q0_neverPublicize')!
  const antiSpamProdDeltas = pairedDeltas(antiSpamProdA, antiSpamProdB)
  const antiSpamProdWin = pairedWinRate(antiSpamProdA, antiSpamProdB)
  const antiSpam = {
    reference: antiSpamRef,
    production: {
      sharedSeeds: antiSpamProdDeltas.seeds.length,
      strictWinRate: antiSpamProdWin,
      medianDelta: median(antiSpamProdDeltas.deltas),
      pass: antiSpamProdWin <= 0.4 && median(antiSpamProdDeltas.deltas) < 0,
    },
    identicalVerdict: antiSpamRef.pass === (antiSpamProdWin <= 0.4 && median(antiSpamProdDeltas.deltas) < 0),
  }

  const productionMix = Object.fromEntries(
    production.policies.map((policy) => [
      policy.policy,
      {
        low: policy.marketingChoices['0'] ?? 0,
        middle: policy.marketingChoices['1'] ?? 0,
        high: policy.marketingChoices['2'] ?? 0,
      },
    ]),
  )
  const playerNames = new Set(
    production.policies.filter((policy) => policy.kind === 'player').map((policy) => policy.policy),
  )
  const tournament = {
    referencePlayer: winShares(
      new Map([...referenceCash].filter(([policy]) => playerNames.has(policy))),
    ),
    productionPlayer: winShares(
      new Map([...productionCash].filter(([policy]) => playerNames.has(policy))),
    ),
    referenceAllArms: winShares(referenceCash),
    productionAllArms: winShares(productionCash),
    storedReferenceSummaryStatus:
      'CORRUPT_CHUNK_MERGE — frozen summary matrices contain P1/P2/P3 only; values above are recomputed from all raw rows.',
  }
  const referenceDefects = [
    'P15 used employmentEngaged in the frozen lab package/forecast path; D-17A production persists economyEngaged. P15 is not comparable.',
    'The frozen sat100 artifact publicityKey omits saturation and aliases the earlier sat1 defect, although d17b.publicity records saturation=100.',
    'The frozen artifact predates source provenance fields.',
    'The frozen artifact stored marketing dollars in FilmRecord.marketingLevel; its low/middle/high mix cannot be reconstructed exactly from the artifact.',
  ]
  const identity = {
    referenceShape:
      reference.runName === 'd17b-final-reference-sat100' &&
      reference.seeds === 300 &&
      reference.horizonWeeks === 208 &&
      reference.policies.length === 24 &&
      reference.d17b?.publicity?.tiers?.whisper?.saturation === 100,
    productionShape:
      production.seeds === 300 && production.horizonWeeks === 208 && production.policies.length === 24,
    productionExecution: production.d17b?.execution === 'production',
    productionCandidateKey:
      production.d17b?.productionCandidateKey === productionCandidateKey(),
    productionSourceClean: production.source?.worktreeDirty === false,
  }
  const comparable = comparisons.filter((row) => row.status !== 'NOT_COMPARABLE')
  const result = {
    runName,
    source: sourceProvenance(),
    reference: { dir: referenceDir, summary: reference.runName, source: reference.source ?? null },
    production: { dir: productionDir, summary: production.runName, source: production.source ?? null },
    identity,
    referenceDefects,
    policyAgreement: {
      comparablePolicies: comparable.length,
      passed: comparable.filter((row) => row.status === 'PASS').length,
      failed: comparable.filter((row) => row.status === 'FAIL').length,
      notComparable: comparisons.filter((row) => row.status === 'NOT_COMPARABLE').length,
      rows: comparisons,
    },
    gateVerdicts: { maintenance, antiSpam },
    tournament,
    publicityTierUse: {
      reference: referenceRows.publicityTiers,
      production: productionRows.publicityTiers,
    },
    marketingMix: {
      production: productionMix,
      reference: null,
      status: 'REFERENCE_INSTRUMENTATION_DEFECT',
      rawReferenceDistinctDollarKeys: Object.keys(referenceRows.marketingRungs).length,
      rawReferenceFilmCount: Object.values(referenceRows.marketingRungs).reduce((sum, n) => sum + n, 0),
    },
    overallStatus:
      Object.values(identity).every(Boolean) &&
      comparable.every((row) => row.status === 'PASS') &&
      maintenance.identicalVerdict &&
      antiSpam.identicalVerdict
        ? 'PASS'
        : 'REVIEW_REQUIRED',
  }

  const out = join(outRoot, runName)
  mkdirSync(out, { recursive: true })
  writeFileSync(join(out, 'summary.json'), stable(result))
  const lines = [
    `# D-17B production agreement — ${runName}`,
    '',
    `**Overall:** ${result.overallStatus}`,
    '',
    `Comparable policies: ${result.policyAgreement.passed}/${result.policyAgreement.comparablePolicies} pass; ${result.policyAgreement.notComparable} reference-defect exclusion.`,
    '',
    '| policy | status | ref median | ref bootstrap 95% | production median | delta |',
    '|---|---|---|---|---|---|',
    ...comparisons.map(
      (row) =>
        `| ${row.policy} | ${row.status} | ${fmtMoney(row.referenceMedian)} | ` +
        `${fmtMoney(row.referenceMedianBootstrap95[0])}…${fmtMoney(row.referenceMedianBootstrap95[1])} | ` +
        `${fmtMoney(row.productionMedian)} | ${fmtMoney(row.medianDelta)} |`,
    ),
    '',
    `Maintenance Q6 vs P3: reference ${fmtPct(maintenance.referenceStrictWinRate)} (${maintenance.referenceVerdict}), production ${fmtPct(maintenance.productionStrictWinRate)} (${maintenance.productionVerdict}); identical=${String(maintenance.identicalVerdict)}.`,
    '',
    `Anti-spam Q7 vs Q0: reference ${fmtPct(antiSpam.reference.strictWinRate)}, production ${fmtPct(antiSpam.production.strictWinRate)}; identical=${String(antiSpam.identicalVerdict)}.`,
    '',
    'Known frozen-reference defects are preserved verbatim in summary.json. No row was rewritten and no mismatch was tuned against.',
    '',
  ]
  writeFileSync(join(out, 'summary.md'), `${lines.join('\n')}\n`)
  process.stderr.write(`D-17B agreement ${result.overallStatus}: wrote ${out}\n`)
}

await main()
