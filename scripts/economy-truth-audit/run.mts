// Reproducible entrypoint for the Project: Studio economy truth audit.
// Raw shard files belong under ignored out/. Only `merge` emits compact aggregate evidence.

import { execFileSync, spawnSync } from 'node:child_process'
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SET_BLUEPRINTS, TUNING } from '../../src/core/index.ts'
import type { FacilitiesSourceProvenance } from '../../src/harness/facilities/index.ts'
import {
  MACRO_HORIZON_WEEKS,
  MACRO_POLICY_NAMES,
  MACRO_SCHEMA_VERSION,
  MACRO_SEED_COUNT,
  aggregateMacro,
  macroSeed,
  resolveMacroPolicies,
  runMacroCell,
} from '../../src/harness/economy-truth-audit/macro.ts'
import type { MacroRunCompact } from '../../src/harness/economy-truth-audit/macro.ts'
import {
  MANAGED_SCHEMA_VERSION,
  MANAGED_SEED_COUNT,
  aggregateManaged,
  managedSeed,
  runManagedCell,
} from '../../src/harness/economy-truth-audit/managed.ts'
import type { ManagedCellCompact } from '../../src/harness/economy-truth-audit/managed.ts'
import {
  OFFICE_SCHEMA_VERSION,
  OFFICE_SEED_COUNT,
  aggregateOffices,
  officeSeed,
  runOfficeCell,
} from './offices.ts'
import type { OfficeCellCompact } from './offices.ts'
import { runFixedCostGapWitness } from '../../src/harness/economy-truth-audit/fixed-cost-gap.ts'
import {
  ECONOMY_TRUTH_CANONICAL_COMMIT,
  ECONOMY_TRUTH_GOLDEN_M6_ANCESTOR,
  ECONOMY_TRUTH_INSTRUMENT_PATHS,
  ECONOMY_TRUTH_PRODUCTION_PATHS,
} from '../../src/harness/economy-truth-audit/provenance.ts'
import type { EconomyTruthProvenance } from '../../src/harness/economy-truth-audit/provenance.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../..')
const REQUIRED_BRANCH = 'codex/economy-truth-audit-01'

type Args = Record<string, string | boolean>

function parseArgs(argv: readonly string[]): { command: string; flags: Args } {
  const command = argv[0] ?? 'help'
  const flags: Args = {}
  for (let index = 1; index < argv.length; index++) {
    const token = argv[index]!
    if (!token.startsWith('--')) throw new Error(`unexpected argument ${token}`)
    const key = token.slice(2)
    const next = argv[index + 1]
    if (next === undefined || next.startsWith('--')) flags[key] = true
    else {
      flags[key] = next
      index++
    }
  }
  return { command, flags }
}

function flagString(flags: Args, key: string, fallback?: string): string {
  const value = flags[key]
  if (typeof value === 'string') return value
  if (fallback !== undefined) return fallback
  throw new Error(`missing --${key}`)
}

function flagInt(flags: Args, key: string, fallback?: number): number {
  const text = flagString(flags, key, fallback === undefined ? undefined : String(fallback))
  const value = Number(text)
  if (!Number.isInteger(value)) throw new Error(`--${key} must be an integer (got ${text})`)
  return value
}

function git(args: readonly string[]): string {
  return execFileSync('git', [...args], { cwd: repoRoot, encoding: 'utf8' }).trim()
}

function gitIsAncestor(ancestor: string, descendant: string): boolean {
  return spawnSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], {
    cwd: repoRoot,
    stdio: 'ignore',
  }).status === 0
}

function provenance(allowDirty: boolean): EconomyTruthProvenance {
  const branch = git(['branch', '--show-current'])
  if (branch !== REQUIRED_BRANCH) {
    throw new Error(`economy truth audit must run on ${REQUIRED_BRANCH}; current branch is ${branch}`)
  }
  const canonicalTree = git(['rev-parse', `${ECONOMY_TRUTH_CANONICAL_COMMIT}^{tree}`])
  const productionDiff = git([
    'diff',
    '--name-only',
    ECONOMY_TRUTH_CANONICAL_COMMIT,
    '--',
    ...ECONOMY_TRUTH_PRODUCTION_PATHS,
  ])
  const productionDiffPaths = productionDiff === '' ? [] : productionDiff.split('\n')
  if (productionDiffPaths.length > 0) {
    throw new Error(`production paths differ from canonical main: ${productionDiffPaths.join(', ')}`)
  }
  const instrumentStatus = git(['status', '--porcelain', '--', ...ECONOMY_TRUTH_INSTRUMENT_PATHS])
  const instrumentWorktreeDirty = instrumentStatus !== ''
  if (instrumentWorktreeDirty && !allowDirty) {
    throw new Error('audit instrument paths are dirty; commit the instrument or pass --allow-dirty for a smoke only')
  }
  const auditCommit = git(['rev-parse', 'HEAD'])
  return {
    canonicalCommit: ECONOMY_TRUTH_CANONICAL_COMMIT,
    canonicalTree,
    goldenM6Ancestor: ECONOMY_TRUTH_GOLDEN_M6_ANCESTOR,
    goldenIsAncestor: gitIsAncestor(ECONOMY_TRUTH_GOLDEN_M6_ANCESTOR, ECONOMY_TRUTH_CANONICAL_COMMIT),
    auditCommit,
    auditTree: git(['rev-parse', 'HEAD^{tree}']),
    branch,
    productionDiffPaths,
    instrumentWorktreeDirty,
    runtime: `${process.version}; vite-node`,
  }
}

function shardSpec(flags: Args, totalSeeds: number): { index: number; count: number; indices: number[] } {
  const index = flagInt(flags, 'shard-index', 0)
  const count = flagInt(flags, 'shard-count', 1)
  if (count < 1 || index < 0 || index >= count) {
    throw new Error(`invalid shard ${String(index)}/${String(count)}`)
  }
  const indices: number[] = []
  for (let seed = 1; seed <= totalSeeds; seed++) if ((seed - 1) % count === index) indices.push(seed)
  return { index, count, indices }
}

function writeJson(path: string, value: unknown): void {
  const absolute = resolve(repoRoot, path)
  mkdirSync(dirname(absolute), { recursive: true })
  const temporary = `${absolute}.tmp`
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`)
  renameSync(temporary, absolute)
}

function progress(kind: string, done: number, total: number): void {
  if (done === total || done % 5 === 0) process.stderr.write(`${kind}: ${String(done)}/${String(total)} seeds\n`)
}

type MacroShard = {
  kind: 'economy-truth-macro-shard'
  schemaVersion: typeof MACRO_SCHEMA_VERSION
  provenance: EconomyTruthProvenance
  shard: { index: number; count: number; seedIndices: number[] }
  rows: MacroRunCompact[]
}

function runMacroShard(flags: Args): void {
  const source = provenance(flags['allow-dirty'] === true)
  const shard = shardSpec(flags, MACRO_SEED_COUNT)
  const policies = resolveMacroPolicies(MACRO_POLICY_NAMES)
  const rows: MacroRunCompact[] = []
  shard.indices.forEach((seedIndex, position) => {
    const seed = macroSeed(seedIndex)
    for (const policy of policies) rows.push(runMacroCell(seed, policy))
    progress('macro', position + 1, shard.indices.length)
  })
  const envelope: MacroShard = {
    kind: 'economy-truth-macro-shard',
    schemaVersion: MACRO_SCHEMA_VERSION,
    provenance: source,
    shard: { index: shard.index, count: shard.count, seedIndices: shard.indices },
    rows,
  }
  writeJson(flagString(flags, 'out'), envelope)
}

type ManagedShard = {
  kind: 'economy-truth-managed-shard'
  schemaVersion: typeof MANAGED_SCHEMA_VERSION
  provenance: EconomyTruthProvenance
  shard: { index: number; count: number; seedIndices: number[] }
  cells: ManagedCellCompact[]
}

function runManagedShard(flags: Args): void {
  const source = provenance(flags['allow-dirty'] === true)
  const shard = shardSpec(flags, MANAGED_SEED_COUNT)
  const facilitiesSource: FacilitiesSourceProvenance = {
    sourceCommit: source.auditCommit,
    sourceTree: source.auditTree,
    worktreeDirty: source.instrumentWorktreeDirty,
    runtime: 'economy-truth-audit-managed-v1',
  }
  const cells: ManagedCellCompact[] = []
  shard.indices.forEach((seedIndex, position) => {
    const seed = managedSeed(seedIndex)
    for (const policyId of ['direct-package', 'development-casting', 'scaled-two-team', 'scaled-four-team'] as const) {
      cells.push(runManagedCell(seed, policyId, facilitiesSource))
    }
    progress('managed', position + 1, shard.indices.length)
  })
  const envelope: ManagedShard = {
    kind: 'economy-truth-managed-shard',
    schemaVersion: MANAGED_SCHEMA_VERSION,
    provenance: source,
    shard: { index: shard.index, count: shard.count, seedIndices: shard.indices },
    cells,
  }
  writeJson(flagString(flags, 'out'), envelope)
}

type OfficeShard = {
  kind: 'economy-truth-office-shard'
  schemaVersion: typeof OFFICE_SCHEMA_VERSION
  provenance: EconomyTruthProvenance
  shard: { index: number; count: number; seedIndices: number[] }
  cells: OfficeCellCompact[]
}

function runOfficeShard(flags: Args): void {
  const source = provenance(flags['allow-dirty'] === true)
  const shard = shardSpec(flags, OFFICE_SEED_COUNT)
  const cells: OfficeCellCompact[] = []
  shard.indices.forEach((seedIndex, position) => {
    cells.push(runOfficeCell(officeSeed(seedIndex)))
    progress('offices', position + 1, shard.indices.length)
  })
  const envelope: OfficeShard = {
    kind: 'economy-truth-office-shard',
    schemaVersion: OFFICE_SCHEMA_VERSION,
    provenance: source,
    shard: { index: shard.index, count: shard.count, seedIndices: shard.indices },
    cells,
  }
  writeJson(flagString(flags, 'out'), envelope)
}

type ShardEnvelope = MacroShard | ManagedShard | OfficeShard

function readShards(directory: string): ShardEnvelope[] {
  const absolute = resolve(repoRoot, directory)
  return readdirSync(absolute)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(resolve(absolute, name), 'utf8')) as ShardEnvelope)
}

function uniqueBy<T>(values: readonly T[], key: (value: T) => string): T[] {
  const out = new Map<string, T>()
  for (const value of values) {
    const id = key(value)
    if (out.has(id)) throw new Error(`duplicate shard cell ${id}`)
    out.set(id, value)
  }
  return [...out.values()]
}

function selectedTuningSnapshot(): Record<string, unknown> {
  return {
    initialCash: TUNING.INITIAL_CASH,
    directPackagePolicySlate: TUNING.AGENT_MAX_SLATE,
    productionTicks: TUNING.PRODUCTION_TICKS,
    studioShare: TUNING.STUDIO_RENTAL_BLENDED,
    theatricalWeeks: TUNING.THEATRICAL_WEEKS,
    fameReachHalfSat: TUNING.FAME_REACH_HALF_SAT,
    overheadBase: TUNING.OVERHEAD_BASE,
    overheadPerEmployee: TUNING.OVERHEAD_PER_EMPLOYEE,
    contractTermWeeks: {
      min: TUNING.CONTRACT_MIN_WEEKS,
      max: TUNING.CONTRACT_MAX_WEEKS,
      renewalWindow: TUNING.HIRING_RENEWAL_WINDOW_WEEKS,
    },
    publicity: TUNING.PUBLICITY_TIERS,
    marketingCapacity: { min: TUNING.MARKETING_CAPACITY_MIN, max: TUNING.MARKETING_CAPACITY_MAX },
    discoverability: {
      supportThreshold: TUNING.DISC_SUPPORT_THRESHOLD,
      spread: TUNING.DISC_SPREAD,
      supportExponent: TUNING.DISC_SUPPORT_EXP,
      floor: TUNING.DISC_FLOOR,
      ceiling: TUNING.DISC_CEIL,
    },
    sets: {
      weeklyMaintenance: TUNING.SET_WEEKLY_MAINTENANCE_COST,
      demolitionRefundFraction: TUNING.SET_DEMOLITION_REFUND_FRACTION,
      noveltyDepletionPerRelease: TUNING.SET_NOVELTY_DEPLETION_PER_RELEASE,
      noveltyReceptionFloor: TUNING.SET_NOVELTY_RECEPTION_FACTOR_MIN,
      maxCraftUplift: TUNING.SET_QUALITY_UPLIFT_MAX + TUNING.SET_GENRE_FIT_UPLIFT_MAX,
      catalog: SET_BLUEPRINTS.map((set) => ({ id: set.id, quality: set.quality, capex: set.capex, buildWeeks: set.buildWeeks })),
    },
  }
}

function merge(flags: Args): void {
  const source = provenance(flags['allow-dirty'] === true)
  const envelopes = readShards(flagString(flags, 'in'))
  if (envelopes.length === 0) throw new Error('no shard JSON files found')
  for (const envelope of envelopes) {
    if (envelope.provenance.auditCommit !== source.auditCommit) {
      throw new Error(`mixed audit commits: ${envelope.provenance.auditCommit} vs ${source.auditCommit}`)
    }
    if (envelope.provenance.canonicalCommit !== ECONOMY_TRUTH_CANONICAL_COMMIT) {
      throw new Error('shard canonical commit mismatch')
    }
    if (envelope.provenance.productionDiffPaths.length > 0) {
      throw new Error('shard measured modified production paths')
    }
  }
  const macroRows = uniqueBy(
    envelopes.flatMap((envelope) => envelope.kind === 'economy-truth-macro-shard' ? envelope.rows : []),
    (row) => `${row.seed}\u0000${row.policy}`,
  )
  const managedCells = uniqueBy(
    envelopes.flatMap((envelope) => envelope.kind === 'economy-truth-managed-shard' ? envelope.cells : []),
    (cell) => `${cell.seed}\u0000${cell.policyId}`,
  )
  const officeCells = uniqueBy(
    envelopes.flatMap((envelope) => envelope.kind === 'economy-truth-office-shard' ? envelope.cells : []),
    (cell) => cell.seed,
  )
  const expectedMacro = MACRO_SEED_COUNT * MACRO_POLICY_NAMES.length
  const expectedManaged = MANAGED_SEED_COUNT * 4
  if (macroRows.length !== expectedMacro) throw new Error(`macro corpus incomplete: ${String(macroRows.length)}/${String(expectedMacro)}`)
  if (managedCells.length !== expectedManaged) throw new Error(`managed corpus incomplete: ${String(managedCells.length)}/${String(expectedManaged)}`)
  if (officeCells.length !== OFFICE_SEED_COUNT) throw new Error(`office corpus incomplete: ${String(officeCells.length)}/${String(OFFICE_SEED_COUNT)}`)
  const artifact = {
    schemaVersion: 'economy-truth-audit-aggregate-v1',
    provenance: source,
    productionBehaviorChanged: false,
    commands: {
      macroShard: 'npm run audit:economy-truth -- macro-shard --shard-index <i> --shard-count <n> --out out/economy-truth-audit/macro-<i>.json',
      managedShard: 'npm run audit:economy-truth -- managed-shard --shard-index <i> --shard-count <n> --out out/economy-truth-audit/managed-<i>.json',
      officeShard: 'npm run audit:economy-truth -- office-shard --shard-index <i> --shard-count <n> --out out/economy-truth-audit/office-<i>.json',
      merge: 'npm run audit:economy-truth -- merge --in out/economy-truth-audit --out docs/economy/CODEX-ECONOMY-TRUTH-AUDIT.aggregate.json',
    },
    tuningSnapshot: selectedTuningSnapshot(),
    macro: aggregateMacro(macroRows),
    managed: aggregateManaged(managedCells),
    offices: aggregateOffices(officeCells),
    fixedCostAttributionWitness: runFixedCostGapWitness(),
  }
  writeJson(flagString(flags, 'out'), artifact)
}

function smoke(flags: Args): void {
  const source = provenance(true)
  const facilitiesSource: FacilitiesSourceProvenance = {
    sourceCommit: source.auditCommit,
    sourceTree: source.auditTree,
    worktreeDirty: source.instrumentWorktreeDirty,
    runtime: 'economy-truth-audit-smoke',
  }
  const artifact = {
    source,
    macro: runMacroCell('eta-smoke', resolveMacroPolicies(['P3'])[0]!),
    managed: runManagedCell('eta-smoke', 'scaled-four-team', facilitiesSource),
    office: runOfficeCell('eta-smoke'),
    fixedCost: runFixedCostGapWitness('eta-smoke-fixed-cost'),
  }
  writeJson(flagString(flags, 'out', 'out/economy-truth-audit/smoke.json'), artifact)
}

function help(): void {
  process.stdout.write([
    'Economy truth audit commands:',
    '  macro-shard   --shard-index I --shard-count N --out PATH',
    '  managed-shard --shard-index I --shard-count N --out PATH',
    '  office-shard  --shard-index I --shard-count N --out PATH',
    '  merge         --in DIR --out PATH',
    '  smoke         [--out PATH]',
    '',
    `Governed macro: ${String(MACRO_SEED_COUNT)} seeds x ${String(MACRO_POLICY_NAMES.length)} policies x ${String(MACRO_HORIZON_WEEKS)} weeks.`,
  ].join('\n'))
}

const { command, flags } = parseArgs(process.argv.slice(2))
switch (command) {
  case 'macro-shard': runMacroShard(flags); break
  case 'managed-shard': runManagedShard(flags); break
  case 'office-shard': runOfficeShard(flags); break
  case 'merge': merge(flags); break
  case 'smoke': smoke(flags); break
  case 'help': help(); break
  default: throw new Error(`unknown economy truth audit command ${command}`)
}
