// Reproducible entrypoint for Economy Diagnosis 02.
// Raw per-run rows remain under ignored out/; only compact aggregates are reviewable.

import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { MacroRunCompact } from '../../src/harness/economy-truth-audit/macro.ts'
import {
  MACRO_POLICY_NAMES,
  MACRO_SCHEMA_VERSION,
  MACRO_SEED_COUNT,
  macroSeed,
} from '../../src/harness/economy-truth-audit/macro.ts'
import {
  SHADOW_INTERVENTIONS,
  aggregateShadowIntervention,
} from '../../src/harness/economy-diagnosis/shadow.ts'
import {
  aggregateSelectorFrontier,
  pairedRunawayAccounting,
  p5RunawayStrata,
} from '../../src/harness/economy-diagnosis/runaway.ts'
import {
  DIAGNOSIS_SELECTOR_SCHEMA_VERSION,
  runSelectorCell,
} from '../../src/harness/economy-diagnosis/selector.ts'
import {
  DIAGNOSIS_RENEWAL_OPERATING_POLICIES,
  DIAGNOSIS_RENEWAL_SCHEMA_VERSION,
  DIAGNOSIS_RENEWAL_SEEDS,
  aggregateRenewalDiagnosis,
  runRenewalDiagnosisCell,
} from '../../src/harness/economy-diagnosis/renewal.ts'
import type { RenewalDiagnosisCell } from '../../src/harness/economy-diagnosis/renewal.ts'
import { runFixedCostBlastRadiusWitness } from '../../src/harness/economy-diagnosis/fixed-cost.ts'
import {
  DIAGNOSIS_AUDIT_INSTRUMENT_COMMIT,
  DIAGNOSIS_CANONICAL_MAIN,
  DIAGNOSIS_EXPECTED_BRANCH,
  DIAGNOSIS_FROZEN_AUDIT_TIP,
  DIAGNOSIS_INSTRUMENT_PATHS,
  DIAGNOSIS_PRODUCTION_PATHS,
} from '../../src/harness/economy-diagnosis/provenance.ts'
import type { EconomyDiagnosisProvenance } from '../../src/harness/economy-diagnosis/provenance.ts'
import type { RosterWallSourceProvenance } from '../../src/harness/roster-wall/provenance.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../..')

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

function isAncestor(ancestor: string, descendant: string): boolean {
  return spawnSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], {
    cwd: repoRoot,
    stdio: 'ignore',
  }).status === 0
}

function provenance(allowDirty: boolean): EconomyDiagnosisProvenance {
  const branch = git(['branch', '--show-current'])
  if (branch !== DIAGNOSIS_EXPECTED_BRANCH) {
    throw new Error(`economy diagnosis must run on ${DIAGNOSIS_EXPECTED_BRANCH}; found ${branch}`)
  }
  const frozenAuditIsAncestor = isAncestor(DIAGNOSIS_FROZEN_AUDIT_TIP, 'HEAD')
  if (!frozenAuditIsAncestor) throw new Error('frozen Audit-01 tip is not an ancestor')
  const productionDiff = git([
    'diff',
    '--name-only',
    DIAGNOSIS_CANONICAL_MAIN,
    '--',
    ...DIAGNOSIS_PRODUCTION_PATHS,
  ])
  const productionDiffPaths = productionDiff === '' ? [] : productionDiff.split('\n')
  if (productionDiffPaths.length > 0) {
    throw new Error(`production paths changed: ${productionDiffPaths.join(', ')}`)
  }
  const instrumentStatus = git([
    'status',
    '--porcelain=v1',
    '--',
    ...DIAGNOSIS_INSTRUMENT_PATHS,
  ])
  const instrumentWorktreeDirty = instrumentStatus !== ''
  if (instrumentWorktreeDirty && !allowDirty) {
    throw new Error('diagnosis instrument is dirty; commit it or pass --allow-dirty for smoke only')
  }
  return {
    canonicalMain: DIAGNOSIS_CANONICAL_MAIN,
    canonicalMainTree: git(['rev-parse', `${DIAGNOSIS_CANONICAL_MAIN}^{tree}`]),
    frozenAuditTip: DIAGNOSIS_FROZEN_AUDIT_TIP,
    frozenAuditIsAncestor,
    instrumentCommit: git(['rev-parse', 'HEAD']),
    instrumentTree: git(['rev-parse', 'HEAD^{tree}']),
    branch,
    productionDiffPaths,
    instrumentWorktreeDirty,
    runtime: `${process.version}; vite-node`,
  }
}

function rosterSource(source: EconomyDiagnosisProvenance): RosterWallSourceProvenance {
  return {
    branch: source.branch,
    commit: source.instrumentCommit,
    tree: source.instrumentTree,
    worktreeDirty: false,
    runtime: source.runtime,
    saveVersion: 14,
    productionAuthorityCommit: source.canonicalMain,
    productionAuthorityTree: source.canonicalMainTree,
    authorityDiffPaths: [...source.productionDiffPaths],
  }
}

function shardSpec(flags: Args, total: number): { index: number; count: number; indices: number[] } {
  const index = flagInt(flags, 'shard-index', 0)
  const count = flagInt(flags, 'shard-count', 1)
  if (count < 1 || index < 0 || index >= count) {
    throw new Error(`invalid shard ${String(index)}/${String(count)}`)
  }
  const indices: number[] = []
  for (let item = 0; item < total; item++) if (item % count === index) indices.push(item)
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
  if (done === total || done % 5 === 0) process.stderr.write(`${kind}: ${String(done)}/${String(total)}\n`)
}

type SelectorShard = {
  kind: 'economy-diagnosis-selector-shard'
  schemaVersion: typeof DIAGNOSIS_SELECTOR_SCHEMA_VERSION
  provenance: EconomyDiagnosisProvenance
  shard: { index: number; count: number; seedIndices: number[] }
  rows: MacroRunCompact[]
}

function runSelectorShard(flags: Args): void {
  const source = provenance(flags['allow-dirty'] === true)
  const shard = shardSpec(flags, MACRO_SEED_COUNT)
  const rows: MacroRunCompact[] = []
  shard.indices.forEach((zeroBased, position) => {
    rows.push(runSelectorCell(macroSeed(zeroBased + 1), 0.5))
    progress('selector', position + 1, shard.indices.length)
  })
  const envelope: SelectorShard = {
    kind: 'economy-diagnosis-selector-shard',
    schemaVersion: DIAGNOSIS_SELECTOR_SCHEMA_VERSION,
    provenance: source,
    shard: { index: shard.index, count: shard.count, seedIndices: shard.indices.map((index) => index + 1) },
    rows,
  }
  writeJson(flagString(flags, 'out'), envelope)
}

type RenewalShard = {
  kind: 'economy-diagnosis-renewal-shard'
  schemaVersion: typeof DIAGNOSIS_RENEWAL_SCHEMA_VERSION
  provenance: EconomyDiagnosisProvenance
  shard: { index: number; count: number; seedIndices: number[] }
  cells: RenewalDiagnosisCell[]
}

function runRenewalShard(flags: Args): void {
  const source = provenance(flags['allow-dirty'] === true)
  const shard = shardSpec(flags, DIAGNOSIS_RENEWAL_SEEDS.length)
  const acceptedSource = rosterSource(source)
  const cells: RenewalDiagnosisCell[] = []
  shard.indices.forEach((zeroBased, position) => {
    const seed = DIAGNOSIS_RENEWAL_SEEDS[zeroBased]!
    for (const policy of DIAGNOSIS_RENEWAL_OPERATING_POLICIES) {
      cells.push(runRenewalDiagnosisCell(seed, policy, acceptedSource))
    }
    progress('renewal', position + 1, shard.indices.length)
  })
  const envelope: RenewalShard = {
    kind: 'economy-diagnosis-renewal-shard',
    schemaVersion: DIAGNOSIS_RENEWAL_SCHEMA_VERSION,
    provenance: source,
    shard: { index: shard.index, count: shard.count, seedIndices: shard.indices.map((index) => index + 1) },
    cells,
  }
  writeJson(flagString(flags, 'out'), envelope)
}

function jsonFiles(directory: string): string[] {
  const absolute = resolve(repoRoot, directory)
  return readdirSync(absolute)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => resolve(absolute, name))
}

function uniqueBy<T>(rows: readonly T[], key: (row: T) => string): T[] {
  const values = new Map<string, T>()
  for (const row of rows) {
    const id = key(row)
    if (values.has(id)) throw new Error(`duplicate diagnosis cell ${id}`)
    values.set(id, row)
  }
  return [...values.values()]
}

type BaselineShard = {
  kind: 'economy-truth-macro-shard'
  schemaVersion: typeof MACRO_SCHEMA_VERSION
  provenance: {
    canonicalCommit: string
    auditCommit: string
    productionDiffPaths: string[]
  }
  rows: MacroRunCompact[]
}

function fileIdentity(path: string): { file: string; bytes: number; sha256: string } {
  const bytes = readFileSync(path)
  return {
    file: basename(path),
    bytes: statSync(path).size,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  }
}

function readBaseline(directory: string): { rows: MacroRunCompact[]; files: ReturnType<typeof fileIdentity>[] } {
  const files = jsonFiles(directory)
  const shards = files.map((path) => JSON.parse(readFileSync(path, 'utf8')) as BaselineShard)
  for (const shard of shards) {
    if (shard.kind !== 'economy-truth-macro-shard' || shard.schemaVersion !== MACRO_SCHEMA_VERSION) {
      throw new Error('baseline input is not a frozen Audit-01 macro shard')
    }
    if (
      shard.provenance.canonicalCommit !== DIAGNOSIS_CANONICAL_MAIN ||
      shard.provenance.auditCommit !== DIAGNOSIS_AUDIT_INSTRUMENT_COMMIT ||
      shard.provenance.productionDiffPaths.length !== 0
    ) {
      throw new Error('baseline Audit-01 provenance mismatch')
    }
  }
  const rows = uniqueBy(shards.flatMap((shard) => shard.rows), (row) => `${row.seed}\u0000${row.policy}`)
  const expected = MACRO_SEED_COUNT * MACRO_POLICY_NAMES.length
  if (rows.length !== expected) throw new Error(`baseline macro incomplete: ${String(rows.length)}/${String(expected)}`)
  return { rows, files: files.map(fileIdentity) }
}

function readSelector(directory: string): MacroRunCompact[] {
  const shards = jsonFiles(directory).map((path) => JSON.parse(readFileSync(path, 'utf8')) as SelectorShard)
  const rows = uniqueBy(shards.flatMap((shard) => shard.rows), (row) => `${row.seed}\u0000${row.policy}`)
  if (rows.length !== MACRO_SEED_COUNT) throw new Error(`selector corpus incomplete: ${String(rows.length)}/${String(MACRO_SEED_COUNT)}`)
  return rows
}

function readRenewal(directory: string): RenewalDiagnosisCell[] {
  const shards = jsonFiles(directory).map((path) => JSON.parse(readFileSync(path, 'utf8')) as RenewalShard)
  const cells = uniqueBy(
    shards.flatMap((shard) => shard.cells),
    (cell) => `${cell.seed}\u0000${cell.operatingPolicyId}`,
  )
  const expected = DIAGNOSIS_RENEWAL_SEEDS.length * DIAGNOSIS_RENEWAL_OPERATING_POLICIES.length
  if (cells.length !== expected) throw new Error(`renewal corpus incomplete: ${String(cells.length)}/${String(expected)}`)
  return cells
}

function aggregate(flags: Args): void {
  const source = provenance(flags['allow-dirty'] === true)
  const baseline = readBaseline(flagString(flags, 'baseline-dir'))
  const selectorRows = readSelector(flagString(flags, 'selector-dir'))
  const renewalCells = readRenewal(flagString(flags, 'renewal-dir'))
  const artifact = {
    schemaVersion: 'economy-diagnosis-aggregate-v1',
    provenance: source,
    productionBehaviorChanged: false,
    frozenEvidence: {
      auditTip: DIAGNOSIS_FROZEN_AUDIT_TIP,
      auditInstrumentCommit: DIAGNOSIS_AUDIT_INSTRUMENT_COMMIT,
      rawMacroFiles: baseline.files,
    },
    commands: {
      selector: 'npm run diagnose:economy -- selector-shard --shard-index <i> --shard-count <n> --out out/economy-diagnosis/selector-<i>.json',
      renewal: 'npm run diagnose:economy -- renewal-shard --shard-index <i> --shard-count <n> --out out/economy-diagnosis/renewal-<i>.json',
      aggregate: 'npm run diagnose:economy -- aggregate --baseline-dir <Audit-01 raw macro shard dir> --selector-dir out/economy-diagnosis/selector --renewal-dir out/economy-diagnosis/renewal --out docs/economy/CODEX-ECONOMY-DIAGNOSIS-02.aggregate.json',
    },
    runaway: {
      pairedAccounting: pairedRunawayAccounting(baseline.rows),
      p5Strata: p5RunawayStrata(baseline.rows),
      selectorFrontier: aggregateSelectorFrontier(baseline.rows, selectorRows),
      shadowInterventions: SHADOW_INTERVENTIONS.map((intervention) =>
        aggregateShadowIntervention(baseline.rows, intervention),
      ),
    },
    renewal: aggregateRenewalDiagnosis(renewalCells),
    fixedCost: runFixedCostBlastRadiusWitness(),
  }
  writeJson(flagString(flags, 'out'), artifact)
}

function smoke(flags: Args): void {
  const source = provenance(true)
  const roster = rosterSource(source)
  const artifact = {
    source,
    selector: runSelectorCell('eta-macro-0001', 0.5),
    renewal: runRenewalDiagnosisCell('facilities-0001', 'direct-package', roster),
    fixedCost: runFixedCostBlastRadiusWitness(),
  }
  writeJson(flagString(flags, 'out', 'out/economy-diagnosis/smoke.json'), artifact)
}

function help(): void {
  process.stdout.write([
    'Economy Diagnosis 02 commands:',
    '  selector-shard --shard-index I --shard-count N --out PATH',
    '  renewal-shard  --shard-index I --shard-count N --out PATH',
    '  aggregate --baseline-dir DIR --selector-dir DIR --renewal-dir DIR --out PATH',
    '  smoke [--out PATH]',
    '',
    `Selector: ${String(MACRO_SEED_COUNT)} seeds x exponent 0.5 x 260 weeks.`,
    `Renewal: ${String(DIAGNOSIS_RENEWAL_SEEDS.length)} seeds x ${String(DIAGNOSIS_RENEWAL_OPERATING_POLICIES.length)} policies x paired Week-196 treatments.`,
  ].join('\n'))
}

const { command, flags } = parseArgs(process.argv.slice(2))
switch (command) {
  case 'selector-shard': runSelectorShard(flags); break
  case 'renewal-shard': runRenewalShard(flags); break
  case 'aggregate': aggregate(flags); break
  case 'smoke': smoke(flags); break
  case 'help': help(); break
  default: throw new Error(`unknown economy diagnosis command ${command}`)
}
