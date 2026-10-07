// Facilities & Construction research artifact runner.
//
// ANALYSIS ONLY. Writes deterministic, ignored evidence under
// out/facilities-construction-research/<run-name>/ and nowhere else.

import { execFileSync } from 'node:child_process'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  realpathSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_FACILITIES_HORIZON_WEEKS,
  FACILITIES_POLICY_IDS,
  runFacilitiesCorpus,
} from './facilities/index.js'
import type {
  FacilitiesArmResult,
  FacilitiesCapacityDelta,
  FacilitiesCorpusResult,
  FacilitiesIntentRow,
  FacilitiesPolicyId,
  FacilitiesShadowRow,
  FacilitiesSourceProvenance,
  FacilitiesStaffingRow,
  FacilitiesWeeklyRow,
} from './facilities/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const OUT_RELATIVE = join('out', 'facilities-construction-research')

/** Find the repository owning this source or compiled module, never an unrelated cwd. */
export function discoverFacilitiesRepoRoot(moduleDirectory = here): string {
  let candidate = resolve(moduleDirectory)
  while (true) {
    if (
      existsSync(join(candidate, '.git')) &&
      existsSync(join(candidate, 'package.json')) &&
      existsSync(join(candidate, 'src', 'core', 'index.ts'))
    ) {
      return candidate
    }
    const parent = dirname(candidate)
    if (parent === candidate) break
    candidate = parent
  }
  throw new Error(
    `run-facilities-observatory: could not discover the repository root from module directory ${resolve(moduleDirectory)}`,
  )
}

const defaultRepoRoot = discoverFacilitiesRepoRoot()

export type FacilitiesCliOptions = {
  runName: string
  seeds: string[]
  horizonWeeks: number
  policyIds: FacilitiesPolicyId[]
  capacityDelta: FacilitiesCapacityDelta
  availableWeek: number
}

type ArtifactRunSummary = Omit<
  FacilitiesArmResult,
  'rows' | 'intents' | 'shadows' | 'staffingRows'
> & {
  weeklyRowCount: number
  intentRowCount: number
  shadowRowCount: number
  staffingRowCount: number
}

export type FacilitiesArtifactSummary = Omit<FacilitiesCorpusResult, 'runs'> & {
  runs: ArtifactRunSummary[]
}

export type FacilitiesArtifactBundle = {
  rowsJsonl: string
  summaryJson: string
  summaryMarkdown: string
}

export type FacilitiesArtifactPaths = {
  directory: string
  rows: string
  summary: string
  markdown: string
}

type EvidenceRow =
  | FacilitiesWeeklyRow
  | FacilitiesIntentRow
  | FacilitiesShadowRow
  | FacilitiesStaffingRow

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value !== null && typeof value === 'object') {
    const source = value as Record<string, unknown>
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(source).sort(compareId)) sorted[key] = sortKeys(source[key])
    return sorted
  }
  return value
}

/** Stable recursive key ordering; arrays retain their governed order. */
export function facilitiesStableJson(value: unknown, indent = 0): string {
  return JSON.stringify(sortKeys(value), null, indent)
}

function requireFlagValue(argv: readonly string[], index: number, flag: string): string {
  const value = argv[index + 1]
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`run-facilities-observatory: ${flag} requires a value`)
  }
  return value
}

function parsePositiveInteger(raw: string, flag: string): number {
  if (!/^\d+$/.test(raw)) {
    throw new Error(`run-facilities-observatory: ${flag} must be a positive integer`)
  }
  const value = Number(raw)
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`run-facilities-observatory: ${flag} must be a positive safe integer`)
  }
  return value
}

function parseNonNegativeInteger(raw: string, flag: string): number {
  if (!/^\d+$/.test(raw)) {
    throw new Error(`run-facilities-observatory: ${flag} must be a non-negative integer`)
  }
  const value = Number(raw)
  if (!Number.isSafeInteger(value)) {
    throw new Error(`run-facilities-observatory: ${flag} must be a non-negative safe integer`)
  }
  return value
}

function parseCapacityDelta(raw: string): FacilitiesCapacityDelta {
  const value = parsePositiveInteger(raw, '--capacity-delta')
  if (value !== 1 && value !== 2) {
    throw new Error('run-facilities-observatory: --capacity-delta must be exactly 1 or 2')
  }
  return value
}

export function validateFacilitiesRunName(runName: string): string {
  if (
    runName === '.' ||
    runName === '..' ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(runName)
  ) {
    throw new Error(
      'run-facilities-observatory: --run-name must be 1–80 safe filename characters and begin with a letter or digit',
    )
  }
  return runName
}

function parseSeeds(raw: string): string[] {
  if (/^\d+$/.test(raw)) {
    const count = parsePositiveInteger(raw, '--seeds')
    return Array.from(
      { length: count },
      (_, index) => `facilities-${String(index + 1).padStart(4, '0')}`,
    )
  }
  const seeds = raw.split(',').map((seed) => seed.trim())
  if (seeds.length === 0 || seeds.some((seed) => seed.length === 0)) {
    throw new Error(
      'run-facilities-observatory: --seeds must be a positive count or comma-separated non-empty seed IDs',
    )
  }
  if (new Set(seeds).size !== seeds.length) {
    throw new Error('run-facilities-observatory: --seeds contains a duplicate seed ID')
  }
  return seeds
}

function parsePolicies(raw: string): FacilitiesPolicyId[] {
  const values = raw.split(',').map((policy) => policy.trim())
  if (values.length === 0 || values.some((policy) => policy.length === 0)) {
    throw new Error('run-facilities-observatory: --policies must not be empty')
  }
  if (new Set(values).size !== values.length) {
    throw new Error('run-facilities-observatory: --policies contains a duplicate policy ID')
  }
  const known = new Set<string>(FACILITIES_POLICY_IDS)
  for (const value of values) {
    if (!known.has(value)) {
      throw new Error(
        `run-facilities-observatory: unknown policy "${value}"; expected ${FACILITIES_POLICY_IDS.join(', ')}`,
      )
    }
  }
  return values as FacilitiesPolicyId[]
}

/** Strict flag parser. Unknown, positional, repeated, or valueless arguments fail loudly. */
export function parseFacilitiesArgs(argv: readonly string[]): FacilitiesCliOptions {
  const values = new Map<string, string>()
  const allowed = new Set([
    '--run-name',
    '--seeds',
    '--horizon',
    '--policies',
    '--capacity-delta',
    '--available-week',
  ])
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index]!
    if (!flag.startsWith('--')) {
      throw new Error(`run-facilities-observatory: unexpected positional argument "${flag}"`)
    }
    if (!allowed.has(flag)) {
      throw new Error(`run-facilities-observatory: unknown flag "${flag}"`)
    }
    if (values.has(flag)) {
      throw new Error(`run-facilities-observatory: duplicate flag "${flag}"`)
    }
    values.set(flag, requireFlagValue(argv, index, flag))
    index++
  }
  const runName = values.get('--run-name')
  if (runName === undefined) {
    throw new Error('run-facilities-observatory: --run-name is required')
  }
  const seedsRaw = values.get('--seeds')
  if (seedsRaw === undefined) {
    throw new Error('run-facilities-observatory: --seeds is required')
  }
  const horizonWeeks = parsePositiveInteger(
    values.get('--horizon') ?? String(DEFAULT_FACILITIES_HORIZON_WEEKS),
    '--horizon',
  )
  const availableWeek = parseNonNegativeInteger(
    values.get('--available-week') ?? '0',
    '--available-week',
  )
  if (availableWeek > horizonWeeks) {
    throw new Error(
      'run-facilities-observatory: --available-week must be no greater than --horizon',
    )
  }
  return {
    runName: validateFacilitiesRunName(runName),
    seeds: parseSeeds(seedsRaw),
    horizonWeeks,
    policyIds:
      values.get('--policies') === undefined
        ? [...FACILITIES_POLICY_IDS]
        : parsePolicies(values.get('--policies')!),
    capacityDelta: parseCapacityDelta(values.get('--capacity-delta') ?? '1'),
    availableWeek,
  }
}

function git(repoRoot: string, args: readonly string[]): string {
  return execFileSync('git', [...args], { cwd: repoRoot, encoding: 'utf8' }).trim()
}

/** Source identity contains no output timestamp and invalidates a dirty evidence run. */
export function facilitiesSourceProvenance(repoRoot: string): FacilitiesSourceProvenance {
  return {
    sourceCommit: git(repoRoot, ['rev-parse', 'HEAD']),
    sourceTree: git(repoRoot, ['rev-parse', 'HEAD^{tree}']),
    worktreeDirty: git(repoRoot, ['status', '--porcelain']) !== '',
    runtime: `node ${process.version}`,
  }
}

const RECORD_ORDER: Record<EvidenceRow['recordType'], number> = {
  weekly: 0,
  staffing: 1,
  intent: 2,
  shadow: 3,
}

function rowStableId(row: EvidenceRow): string {
  if (row.recordType === 'intent') return row.intentId
  if (row.recordType === 'shadow') return row.shadowId
  if (row.recordType === 'staffing') return `${row.cohortId}:${row.boundary}`
  return `${row.seed}:${row.policyId}:${row.mode}:${String(row.week).padStart(5, '0')}:weekly`
}

function orderedRows(run: FacilitiesArmResult): EvidenceRow[] {
  return [...run.rows, ...run.staffingRows, ...run.intents, ...run.shadows].sort(
    (a, b) =>
      a.week - b.week ||
      RECORD_ORDER[a.recordType] - RECORD_ORDER[b.recordType] ||
      compareId(rowStableId(a), rowStableId(b)),
  )
}

function artifactSummary(result: FacilitiesCorpusResult): FacilitiesArtifactSummary {
  return {
    ...result,
    runs: result.runs.map(({ rows, intents, shadows, staffingRows, ...run }) => ({
      ...run,
      weeklyRowCount: rows.length,
      intentRowCount: intents.length,
      shadowRowCount: shadows.length,
      staffingRowCount: staffingRows.length,
    })),
  }
}

function dollars(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

/** Render only measured totals and the governing limits; it makes no implementation choice. */
export function renderFacilitiesSummaryMarkdown(summary: FacilitiesArtifactSummary): string {
  const { capacityDelta, availableWeek } = summary.provenance.counterfactualDelta
  const lines = [
    '# Facilities & Construction Observatory',
    '',
    `Source commit: \`${summary.provenance.sourceCommit}\``,
    '',
    `Source tree: \`${summary.provenance.sourceTree}\``,
    '',
    `Dirty source: \`${String(summary.provenance.worktreeDirty)}\``,
    '',
    `Seeds: ${String(summary.provenance.seeds.length)}; horizon: Week ${String(summary.provenance.horizonWeeks)}; paired runs: ${String(summary.aggregate.pairCount)}.`,
    '',
    `Counterfactual: +${String(capacityDelta)} Development & Casting capacity, operational at the start of Week ${String(availableWeek)}.`,
    '',
    '## Development & Casting rejection exposure',
    '',
    `| Policy | Pairs | Current D&C rejections (full horizon) | Counterfactual-arm D&C rejections (full horizon) | Current before Week ${String(availableWeek)} | Counterfactual arm before Week ${String(availableWeek)} | Current from Week ${String(availableWeek)} (inclusive) | +${String(capacityDelta)} capacity from Week ${String(availableWeek)} (inclusive) |`,
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]
  for (const policy of summary.aggregate.policies) {
    const exposure = policy.developmentCastingRejectionsByAvailability
    lines.push(
      `| ${policy.policyId} | ${String(policy.pairCount)} | ${String(exposure.current.fullHorizon)} | ${String(exposure.counterfactual.fullHorizon)} | ${String(exposure.current.beforeAvailability)} | ${String(exposure.counterfactual.beforeAvailability)} | ${String(exposure.current.fromAvailabilityInclusive)} | ${String(exposure.counterfactual.fromAvailabilityInclusive)} |`,
    )
  }
  lines.push(
    '',
    `The configured capacity is absent before Week ${String(availableWeek)}. A rejection recorded in Week ${String(availableWeek)} belongs to the inclusive post-availability exposure. Full-horizon counterfactual-arm totals include both periods.`,
    '',
    `## Current → requested (+${String(capacityDelta)}) boundary shadows and descriptive outcomes`,
    '',
    `The deltas in this section compare current capacity → the requested +${String(capacityDelta)} arm. They are descriptive after policy feedback, not causal estimates.`,
    '',
    '| Policy | Pairs | Admitted one-slot D&C boundary shadows | Descriptive current → requested release Δ median [min, max] | Descriptive current → requested final-cash Δ median [min, max] |',
    '| --- | ---: | ---: | ---: | ---: |',
  )
  for (const policy of summary.aggregate.policies) {
    lines.push(
      `| ${policy.policyId} | ${String(policy.pairCount)} | ${String(policy.admittedDevelopmentCastingBoundaryShadows)} | ${String(policy.descriptivePairDeltas.releases.median)} [${String(policy.descriptivePairDeltas.releases.min)}, ${String(policy.descriptivePairDeltas.releases.max)}] | ${dollars(policy.descriptivePairDeltas.finalCash.median)} [${dollars(policy.descriptivePairDeltas.finalCash.min)}, ${dollars(policy.descriptivePairDeltas.finalCash.max)}] |`,
    )
  }
  const fourthSlotMarginal = summary.aggregate.fourthSlotMarginal
  if (fourthSlotMarginal === null) {
    lines.push(
      '',
      'Fourth-slot marginal: not measured; this corpus requested +1 capacity only.',
    )
  } else {
    lines.push(
      '',
      '## +1 → +2 fourth-slot marginal',
      '',
      'This comparison is descriptive and noncausal after policy feedback. It is not a clean marginal-capacity estimate.',
      '',
      '| Policy | Pairs | +1 D&C rejections (full horizon) | +2 D&C rejections (full horizon) | Descriptive +1 → +2 release Δ median [min, max] | Release Δ signs (negative / zero / positive) | Descriptive +1 → +2 final-cash Δ median [min, max] | Final-cash Δ signs (negative / zero / positive) |',
      '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    )
    for (const policy of fourthSlotMarginal.policies) {
      const releases = policy.descriptiveFourthSlotDeltas.releases
      const finalCash = policy.descriptiveFourthSlotDeltas.finalCash
      lines.push(
        `| ${policy.policyId} | ${String(policy.pairCount)} | ${String(policy.plusOneDevelopmentCastingRejectedIntents)} | ${String(policy.plusTwoDevelopmentCastingRejectedIntents)} | ${String(releases.median)} [${String(releases.min)}, ${String(releases.max)}] | ${String(releases.negativePairs)} / ${String(releases.zeroPairs)} / ${String(releases.positivePairs)} | ${dollars(finalCash.median)} [${dollars(finalCash.min)}, ${dollars(finalCash.max)}] | ${String(finalCash.negativePairs)} / ${String(finalCash.zeroPairs)} / ${String(finalCash.positivePairs)} |`,
      )
    }
  }
  lines.push(
    '',
    '## Governing interpretation boundary',
    '',
    `- The +${String(capacityDelta)} Development & Casting facility is research-only configured capacity, operational at the start of Week ${String(availableWeek)}; it is not a shipped building.`,
    '- Utilization alone is not bottleneck evidence; rejected intents, held transitions, and admitted one-boundary shadows carry the capacity claim.',
    '- These artifacts authorize no construction price, build duration, save change, action, UI, production behavior, or broad economy certification.',
    '- Paired long-run cash and RNG deltas are outcomes, not clean marginal-capacity estimates; the one-boundary shadows isolate the exact admission question.',
    '- D-17B macroeconomy residuals remain open: cash runaway; top-studio economic immortality; week-208 synchronized roster wall; P5 dominance; world-led variance; cheap-film purpose; premium-film purpose; remaining menu breadth; and formal G12 timing.',
    '',
    summary.aggregate.boundaryStatement,
    '',
  )
  return lines.join('\n')
}

export function buildFacilitiesArtifacts(
  result: FacilitiesCorpusResult,
): FacilitiesArtifactBundle {
  const rows = result.runs.flatMap(orderedRows)
  const summary = artifactSummary(result)
  return {
    rowsJsonl: `${rows.map((row) => facilitiesStableJson(row)).join('\n')}\n`,
    summaryJson: `${facilitiesStableJson(summary, 2)}\n`,
    summaryMarkdown: renderFacilitiesSummaryMarkdown(summary),
  }
}

/** Refuse an existing non-empty run directory so stale or extra files cannot survive. */
export function writeFacilitiesArtifacts(
  repoRoot: string,
  runName: string,
  bundle: FacilitiesArtifactBundle,
): FacilitiesArtifactPaths {
  const safeName = validateFacilitiesRunName(runName)
  const canonicalRepoRoot = realpathSync(repoRoot)
  const outputRoot = resolve(canonicalRepoRoot, OUT_RELATIVE)
  const directory = resolve(outputRoot, safeName)
  if (dirname(directory) !== outputRoot) {
    throw new Error('run-facilities-observatory: resolved output escaped the governed root')
  }
  const relativeOutput = relative(canonicalRepoRoot, outputRoot)
  if (relativeOutput.startsWith('..') || relativeOutput === '' || relativeOutput.startsWith(sep)) {
    throw new Error('run-facilities-observatory: governed output root escaped the repository')
  }
  let cursor = canonicalRepoRoot
  for (const component of [...relativeOutput.split(sep), safeName]) {
    cursor = join(cursor, component)
    if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink()) {
      throw new Error(
        `run-facilities-observatory: output path contains a symbolic link: ${cursor}`,
      )
    }
  }
  if (existsSync(directory) && readdirSync(directory).length > 0) {
    throw new Error(
      `run-facilities-observatory: output directory already exists and is not empty: ${directory}`,
    )
  }
  mkdirSync(directory, { recursive: true })
  const canonicalDirectory = realpathSync(directory)
  if (!canonicalDirectory.startsWith(`${outputRoot}${sep}`)) {
    throw new Error('run-facilities-observatory: canonical output escaped the governed root')
  }
  const paths = {
    directory,
    rows: join(directory, 'rows.jsonl'),
    summary: join(directory, 'summary.json'),
    markdown: join(directory, 'summary.md'),
  }
  writeFileSync(paths.rows, bundle.rowsJsonl, 'utf8')
  writeFileSync(paths.summary, bundle.summaryJson, 'utf8')
  writeFileSync(paths.markdown, bundle.summaryMarkdown, 'utf8')
  return paths
}

export function runFacilitiesCli(
  argv: readonly string[],
  repoRoot = defaultRepoRoot,
): FacilitiesArtifactPaths {
  const options = parseFacilitiesArgs(argv)
  const source = facilitiesSourceProvenance(repoRoot)
  const result = runFacilitiesCorpus({
    seeds: options.seeds,
    policyIds: options.policyIds,
    horizonWeeks: options.horizonWeeks,
    capacityDelta: options.capacityDelta,
    availableWeek: options.availableWeek,
    source,
  })
  return writeFacilitiesArtifacts(
    repoRoot,
    options.runName,
    buildFacilitiesArtifacts(result),
  )
}

const invokedPath = process.argv[1] === undefined ? null : resolve(process.argv[1])
if (invokedPath === fileURLToPath(import.meta.url)) {
  const paths = runFacilitiesCli(process.argv.slice(2))
  process.stderr.write(`Facilities observatory wrote ${paths.directory}\n`)
}
