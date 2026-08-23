// Reproducible entrypoint for Economy Intervention Frontier 03.
//
// Every `*-shard` command writes raw, deliberately detailed evidence to the
// caller-selected path (normally ignored `out/`).  Only `aggregate` produces a
// compact review artifact; it never copies selection, payment, milestone, or
// per-cell arrays into that artifact.

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

import type { Policy } from '../../src/harness/d16/policies.ts'
import {
  MACRO_POLICY_NAMES,
  MACRO_SCHEMA_VERSION,
  MACRO_SEED_COUNT,
  NORMAL_PLAYER_POLICY_NAMES,
  macroSeed,
  resolveMacroPolicies,
} from '../../src/harness/economy-truth-audit/macro.ts'
import type { MacroRunCompact } from '../../src/harness/economy-truth-audit/macro.ts'
import { pairedEffect, distribution, rate } from '../../src/harness/economy-truth-audit/statistics.ts'
import type { Distribution, PairedEffect, RateEstimate } from '../../src/harness/economy-truth-audit/statistics.ts'
import {
  CAPITAL_ARM_IDS,
  aggregateCapitalRuns,
  pairedCapitalEffects,
  runCapitalCell,
} from '../../src/harness/economy-intervention-frontier/capital.ts'
import type { CapitalArmId, CapitalCell } from '../../src/harness/economy-intervention-frontier/capital.ts'
import { runCombinationCell } from '../../src/harness/economy-intervention-frontier/combination.ts'
import type { CombinationCell } from '../../src/harness/economy-intervention-frontier/combination.ts'
import {
  CHOICE_ARMS,
  CHOICE_FRONTIER_SCHEMA_VERSION,
  aggregateChoiceRuns,
  runChoiceCell,
} from '../../src/harness/economy-intervention-frontier/choice.ts'
import type { ChoiceArm, ChoiceRunCompact } from '../../src/harness/economy-intervention-frontier/choice.ts'
import {
  CHOICE_PUBLICITY_GATE_IDS,
  runChoicePublicityGateCell,
} from '../../src/harness/economy-intervention-frontier/gates.ts'
import type { ChoicePublicityGateCell, ChoicePublicityGateId } from '../../src/harness/economy-intervention-frontier/gates.ts'
import {
  RENEWAL_FRONTIER_OPERATING_POLICIES,
  RENEWAL_FRONTIER_SCHEMA_VERSION,
  RENEWAL_FRONTIER_SEEDS,
  RENEWAL_FRONTIER_TREATMENTS,
  aggregateRenewalFrontier,
  runRenewalFrontierCell,
} from '../../src/harness/economy-intervention-frontier/renewal.ts'
import type { RenewalFrontierArm, RenewalFrontierCell } from '../../src/harness/economy-intervention-frontier/renewal.ts'
import {
  FRONTIER_CANONICAL_MAIN,
  FRONTIER_EXPECTED_BRANCH,
  FRONTIER_FROZEN_AUDIT_TIP,
  FRONTIER_FROZEN_DIAGNOSIS_TIP,
  FRONTIER_FROZEN_MACRO_FILES,
  FRONTIER_INSTRUMENT_PATHS,
  FRONTIER_PRODUCTION_PATHS,
} from '../../src/harness/economy-intervention-frontier/provenance.ts'
import type { FrontierProvenance } from '../../src/harness/economy-intervention-frontier/provenance.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../..')
const RUNNER_SCHEMA_VERSION = 'economy-intervention-frontier-runner-v1' as const

type Args = Record<string, string | boolean>
type FileIdentity = { file: string; bytes: number; sha256: string }

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

function optionalString(flags: Args, key: string): string | undefined {
  const value = flags[key]
  if (value === undefined) return undefined
  if (typeof value !== 'string') throw new Error(`--${key} needs a value`)
  return value
}

function flagInt(flags: Args, key: string, fallback?: number): number {
  const text = flagString(flags, key, fallback === undefined ? undefined : String(fallback))
  const value = Number(text)
  if (!Number.isInteger(value)) throw new Error(`--${key} must be an integer (got ${text})`)
  return value
}

function csv(flags: Args, key: string, fallback: readonly string[]): string[] {
  const text = optionalString(flags, key)
  const values = (text === undefined ? [...fallback] : text.split(','))
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
  if (values.length === 0 || new Set(values).size !== values.length) {
    throw new Error(`--${key} must name one or more unique comma-separated values`)
  }
  return values
}

function known<T extends string>(values: readonly T[], requested: readonly string[], label: string): T[] {
  const available = new Set<string>(values)
  for (const value of requested) {
    if (!available.has(value)) throw new Error(`unknown ${label} ${value}`)
  }
  return requested as T[]
}

function macroSeedCount(flags: Args): number {
  const value = flagInt(flags, 'seed-count', MACRO_SEED_COUNT)
  if (value < 1 || value > MACRO_SEED_COUNT) {
    throw new Error(`--seed-count must be in 1..${String(MACRO_SEED_COUNT)}`)
  }
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

/** Refuse evidence generation unless its source boundary is committed and clean. */
function provenance(): FrontierProvenance {
  const branch = git(['branch', '--show-current'])
  if (branch !== FRONTIER_EXPECTED_BRANCH) {
    throw new Error(`economy frontier must run on ${FRONTIER_EXPECTED_BRANCH}; found ${branch}`)
  }
  const frozenAuditIsAncestor = isAncestor(FRONTIER_FROZEN_AUDIT_TIP, 'HEAD')
  const frozenDiagnosisIsAncestor = isAncestor(FRONTIER_FROZEN_DIAGNOSIS_TIP, 'HEAD')
  if (!frozenAuditIsAncestor || !frozenDiagnosisIsAncestor) {
    throw new Error('frozen Audit-01 and Diagnosis-02 tips must both be ancestors of the instrument')
  }
  const productionDiff = git([
    'diff', '--name-only', FRONTIER_CANONICAL_MAIN, '--', ...FRONTIER_PRODUCTION_PATHS,
  ])
  const productionDiffPaths = productionDiff === '' ? [] : productionDiff.split('\n')
  if (productionDiffPaths.length > 0) {
    throw new Error(`production paths changed: ${productionDiffPaths.join(', ')}`)
  }
  const instrumentStatus = git(['status', '--porcelain=v1', '--', ...FRONTIER_INSTRUMENT_PATHS])
  const instrumentWorktreeDirty = instrumentStatus !== ''
  if (instrumentWorktreeDirty) {
    throw new Error('frontier instrument is dirty; commit it before generating evidence')
  }
  return {
    canonicalMain: FRONTIER_CANONICAL_MAIN,
    canonicalMainTree: git(['rev-parse', `${FRONTIER_CANONICAL_MAIN}^{tree}`]),
    frozenAuditTip: FRONTIER_FROZEN_AUDIT_TIP,
    frozenDiagnosisTip: FRONTIER_FROZEN_DIAGNOSIS_TIP,
    frozenAuditIsAncestor,
    frozenDiagnosisIsAncestor,
    instrumentCommit: git(['rev-parse', 'HEAD']),
    instrumentTree: git(['rev-parse', 'HEAD^{tree}']),
    branch,
    productionDiffPaths,
    instrumentWorktreeDirty,
    runtime: `${process.version}; vite-node`,
  }
}

function shardSpec(flags: Args, total: number): { index: number; count: number; seedIndices: number[] } {
  const index = flagInt(flags, 'shard-index', 0)
  const count = flagInt(flags, 'shard-count', 1)
  if (count < 1 || index < 0 || index >= count) {
    throw new Error(`invalid shard ${String(index)}/${String(count)}`)
  }
  const seedIndices: number[] = []
  for (let zeroBased = 0; zeroBased < total; zeroBased++) {
    if (zeroBased % count === index) seedIndices.push(zeroBased + 1)
  }
  return { index, count, seedIndices }
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

type ChoiceShard = {
  kind: 'economy-intervention-frontier-choice-shard'
  schemaVersion: typeof RUNNER_SCHEMA_VERSION
  choiceSchemaVersion: typeof CHOICE_FRONTIER_SCHEMA_VERSION
  provenance: FrontierProvenance
  design: { seedCount: number; arms: ChoiceArm[] }
  shard: { index: number; count: number; seedIndices: number[] }
  rows: ChoiceRunCompact[]
}

function runChoiceShard(flags: Args): void {
  const source = provenance()
  const seedCount = macroSeedCount(flags)
  const arms = known(CHOICE_ARMS, csv(flags, 'arms', CHOICE_ARMS), 'choice arm')
  const shard = shardSpec(flags, seedCount)
  const rows: ChoiceRunCompact[] = []
  shard.seedIndices.forEach((index, position) => {
    for (const arm of arms) rows.push(runChoiceCell(macroSeed(index), arm))
    progress('choice', position + 1, shard.seedIndices.length)
  })
  const envelope: ChoiceShard = {
    kind: 'economy-intervention-frontier-choice-shard',
    schemaVersion: RUNNER_SCHEMA_VERSION,
    choiceSchemaVersion: CHOICE_FRONTIER_SCHEMA_VERSION,
    provenance: source,
    design: { seedCount, arms },
    shard,
    rows,
  }
  writeJson(flagString(flags, 'out'), envelope)
}

type CapitalShard = {
  kind: 'economy-intervention-frontier-capital-shard'
  schemaVersion: typeof RUNNER_SCHEMA_VERSION
  provenance: FrontierProvenance
  design: { seedCount: number; arms: CapitalArmId[]; policies: string[] }
  shard: { index: number; count: number; seedIndices: number[] }
  cells: CapitalCell[]
}

function selectedPolicies(flags: Args, fallback: readonly string[]): Policy[] {
  return resolveMacroPolicies(csv(flags, 'policies', fallback))
}

function runCapitalShard(flags: Args): void {
  const source = provenance()
  const seedCount = macroSeedCount(flags)
  const arms = known(CAPITAL_ARM_IDS, csv(flags, 'arms', CAPITAL_ARM_IDS), 'capital arm')
  const policies = selectedPolicies(flags, ['P5_forecastProfitMax'])
  const shard = shardSpec(flags, seedCount)
  const cells: CapitalCell[] = []
  shard.seedIndices.forEach((index, position) => {
    for (const policy of policies) for (const arm of arms) cells.push(runCapitalCell(macroSeed(index), policy, arm))
    progress('capital', position + 1, shard.seedIndices.length)
  })
  const envelope: CapitalShard = {
    kind: 'economy-intervention-frontier-capital-shard',
    schemaVersion: RUNNER_SCHEMA_VERSION,
    provenance: source,
    design: { seedCount, arms, policies: policies.map((policy) => policy.name) },
    shard,
    cells,
  }
  writeJson(flagString(flags, 'out'), envelope)
}

type CombinationShard = {
  kind: 'economy-intervention-frontier-combination-shard'
  schemaVersion: typeof RUNNER_SCHEMA_VERSION
  provenance: FrontierProvenance
  design: { seedCount: number; choiceArms: ChoiceArm[]; capitalArms: Exclude<CapitalArmId, 'none'>[] }
  shard: { index: number; count: number; seedIndices: number[] }
  cells: CombinationCell[]
}

function runCombinationShard(flags: Args): void {
  const source = provenance()
  const seedCount = macroSeedCount(flags)
  const choiceArms = known(CHOICE_ARMS, csv(flags, 'choice-arms', CHOICE_ARMS), 'choice arm')
  const capitalArms = known(
    CAPITAL_ARM_IDS.filter((arm): arm is Exclude<CapitalArmId, 'none'> => arm !== 'none'),
    csv(flags, 'capital-arms', ['four-rung-5-estates']),
    'non-neutral capital arm',
  )
  const shard = shardSpec(flags, seedCount)
  const cells: CombinationCell[] = []
  shard.seedIndices.forEach((index, position) => {
    for (const choiceArm of choiceArms) {
      for (const capitalArmId of capitalArms) {
        cells.push(runCombinationCell(macroSeed(index), choiceArm, capitalArmId))
      }
    }
    progress('combination', position + 1, shard.seedIndices.length)
  })
  const envelope: CombinationShard = {
    kind: 'economy-intervention-frontier-combination-shard',
    schemaVersion: RUNNER_SCHEMA_VERSION,
    provenance: source,
    design: { seedCount, choiceArms, capitalArms },
    shard,
    cells,
  }
  writeJson(flagString(flags, 'out'), envelope)
}

type GatesShard = {
  kind: 'economy-intervention-frontier-publicity-gates-shard'
  schemaVersion: typeof RUNNER_SCHEMA_VERSION
  provenance: FrontierProvenance
  design: { seedCount: number; choiceArms: ChoiceArm[]; gates: ChoicePublicityGateId[] }
  shard: { index: number; count: number; seedIndices: number[] }
  cells: ChoicePublicityGateCell[]
}

function runGatesShard(flags: Args): void {
  const source = provenance()
  const seedCount = macroSeedCount(flags)
  const choiceArms = known(CHOICE_ARMS, csv(flags, 'choice-arms', ['D03_absoluteProfitBaseline']), 'choice arm')
  const gates = known(CHOICE_PUBLICITY_GATE_IDS, csv(flags, 'gates', CHOICE_PUBLICITY_GATE_IDS), 'publicity gate')
  const shard = shardSpec(flags, seedCount)
  const cells: ChoicePublicityGateCell[] = []
  shard.seedIndices.forEach((index, position) => {
    for (const choiceArm of choiceArms) {
      for (const gate of gates) cells.push(runChoicePublicityGateCell(macroSeed(index), choiceArm, gate))
    }
    progress('publicity gates', position + 1, shard.seedIndices.length)
  })
  const envelope: GatesShard = {
    kind: 'economy-intervention-frontier-publicity-gates-shard',
    schemaVersion: RUNNER_SCHEMA_VERSION,
    provenance: source,
    design: { seedCount, choiceArms, gates },
    shard,
    cells,
  }
  writeJson(flagString(flags, 'out'), envelope)
}

type RenewalShard = {
  kind: 'economy-intervention-frontier-renewal-shard'
  schemaVersion: typeof RUNNER_SCHEMA_VERSION
  renewalSchemaVersion: typeof RENEWAL_FRONTIER_SCHEMA_VERSION
  provenance: FrontierProvenance
  design: {
    seedCount: number
    operatingPolicies: string[]
    treatmentIds: string[]
    checkpointWeek: number
    horizonWeek: number
  }
  shard: { index: number; count: number; seedIndices: number[] }
  cells: RenewalFrontierCell[]
}

function runRenewalShard(flags: Args): void {
  const source = provenance()
  // The renewal factorial is deliberately fixed to the established 25-seed
  // roster-wall corpus: changing its seed count would silently weaken recurrence evidence.
  const shard = shardSpec(flags, RENEWAL_FRONTIER_SEEDS.length)
  const cells: RenewalFrontierCell[] = []
  shard.seedIndices.forEach((oneBased, position) => {
    const seed = RENEWAL_FRONTIER_SEEDS[oneBased - 1]!
    for (const policy of RENEWAL_FRONTIER_OPERATING_POLICIES) {
      cells.push(runRenewalFrontierCell(seed, policy))
    }
    progress('renewal', position + 1, shard.seedIndices.length)
  })
  const sampleArm = cells[0]?.arms[0]
  if (sampleArm === undefined) throw new Error('renewal shard unexpectedly had no cells')
  const envelope: RenewalShard = {
    kind: 'economy-intervention-frontier-renewal-shard',
    schemaVersion: RUNNER_SCHEMA_VERSION,
    renewalSchemaVersion: RENEWAL_FRONTIER_SCHEMA_VERSION,
    provenance: source,
    design: {
      seedCount: RENEWAL_FRONTIER_SEEDS.length,
      operatingPolicies: [...RENEWAL_FRONTIER_OPERATING_POLICIES],
      treatmentIds: RENEWAL_FRONTIER_TREATMENTS.map((treatment) => treatment.id),
      checkpointWeek: sampleArm.checkpoint.week,
      horizonWeek: 442,
    },
    shard,
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

function fileIdentity(path: string): FileIdentity {
  const bytes = readFileSync(path)
  return { file: basename(path), bytes: statSync(path).size, sha256: createHash('sha256').update(bytes).digest('hex') }
}

function uniqueBy<T>(values: readonly T[], key: (value: T) => string, label: string): T[] {
  const result = new Map<string, T>()
  for (const value of values) {
    const id = key(value)
    if (result.has(id)) throw new Error(`duplicate ${label} ${id}`)
    result.set(id, value)
  }
  return [...result.values()]
}

function assertExactKeys(actualValues: readonly string[], expectedValues: readonly string[], label: string): void {
  const actual = new Set(actualValues)
  const expected = new Set(expectedValues)
  const missing = [...expected].filter((key) => !actual.has(key))
  const extra = [...actual].filter((key) => !expected.has(key))
  if (actualValues.length !== expectedValues.length || actual.size !== actualValues.length || missing.length > 0 || extra.length > 0) {
    throw new Error(`${label} key mismatch: rows=${String(actualValues.length)}, expected=${String(expectedValues.length)}, missing=${missing[0] ?? 'none'}, extra=${extra[0] ?? 'none'}`)
  }
}

function validateProvenance(source: FrontierProvenance, label: string): void {
  if (
    source.canonicalMain !== FRONTIER_CANONICAL_MAIN ||
    source.canonicalMainTree !== git(['rev-parse', `${FRONTIER_CANONICAL_MAIN}^{tree}`]) ||
    source.frozenAuditTip !== FRONTIER_FROZEN_AUDIT_TIP ||
    source.frozenDiagnosisTip !== FRONTIER_FROZEN_DIAGNOSIS_TIP ||
    source.frozenAuditIsAncestor !== true ||
    source.frozenDiagnosisIsAncestor !== true ||
    source.branch !== FRONTIER_EXPECTED_BRANCH ||
    source.productionDiffPaths.length !== 0 ||
    source.instrumentWorktreeDirty !== false ||
    !isAncestor(FRONTIER_FROZEN_DIAGNOSIS_TIP, source.instrumentCommit) ||
    !isAncestor(source.instrumentCommit, 'HEAD') ||
    git(['rev-parse', `${source.instrumentCommit}^{tree}`]) !== source.instrumentTree
  ) {
    throw new Error(`${label} provenance mismatch`)
  }
}

type ShardHeader = {
  provenance: FrontierProvenance
  shard: { index: number; count: number; seedIndices: number[] }
  design: { seedCount: number }
}

function validateShardLayout(shards: readonly ShardHeader[], label: string): void {
  const first = shards[0]
  if (first === undefined) throw new Error(`${label} requires at least one shard`)
  const { count } = first.shard
  if (count < 1 || shards.length !== count) throw new Error(`${label} shard-count mismatch`)
  const { seedCount } = first.design
  const commit = first.provenance.instrumentCommit
  const tree = first.provenance.instrumentTree
  const seen = new Set<number>()
  for (const shard of shards) {
    validateProvenance(shard.provenance, label)
    if (shard.shard.count !== count || shard.design.seedCount !== seedCount || shard.provenance.instrumentCommit !== commit || shard.provenance.instrumentTree !== tree || seen.has(shard.shard.index)) {
      throw new Error(`${label} shards do not share one clean instrument and layout`)
    }
    seen.add(shard.shard.index)
    const expected: number[] = []
    for (let zeroBased = 0; zeroBased < seedCount; zeroBased++) {
      if (zeroBased % count === shard.shard.index) expected.push(zeroBased + 1)
    }
    if (JSON.stringify(shard.shard.seedIndices) !== JSON.stringify(expected)) {
      throw new Error(`${label} shard ${String(shard.shard.index)} seed-index mismatch`)
    }
  }
}

type BaselineShard = {
  kind: 'economy-truth-macro-shard'
  schemaVersion: typeof MACRO_SCHEMA_VERSION
  provenance: { canonicalCommit: string; auditCommit: string; productionDiffPaths: string[] }
  rows: MacroRunCompact[]
}

function readBaseline(directory: string): { rows: MacroRunCompact[]; files: FileIdentity[] } {
  const files = jsonFiles(directory).filter((path) => basename(path).startsWith('macro-'))
  const identities = files.map(fileIdentity)
  assertExactKeys(identities.map((identity) => identity.file), FRONTIER_FROZEN_MACRO_FILES.map((identity) => identity.file), 'frozen Audit-01 macro files')
  for (const expected of FRONTIER_FROZEN_MACRO_FILES) {
    const actual = identities.find((identity) => identity.file === expected.file)
    if (actual?.sha256 !== expected.sha256) throw new Error(`frozen Audit-01 macro hash mismatch: ${expected.file}`)
  }
  const shards = files.map((path) => JSON.parse(readFileSync(path, 'utf8')) as BaselineShard)
  for (const shard of shards) {
    if (shard.kind !== 'economy-truth-macro-shard' || shard.schemaVersion !== MACRO_SCHEMA_VERSION || shard.provenance.canonicalCommit !== FRONTIER_CANONICAL_MAIN || shard.provenance.productionDiffPaths.length !== 0) {
      throw new Error('baseline input is not clean frozen Audit-01 macro evidence')
    }
  }
  const rows = uniqueBy(shards.flatMap((shard) => shard.rows), (row) => `${row.seed}\u0000${row.policy}`, 'baseline macro row')
  const expectedKeys = Array.from({ length: MACRO_SEED_COUNT }, (_, index) => macroSeed(index + 1))
    .flatMap((seed) => MACRO_POLICY_NAMES.map((policy) => `${seed}\u0000${policy}`))
  assertExactKeys(rows.map((row) => `${row.seed}\u0000${row.policy}`), expectedKeys, 'baseline macro rows')
  if (rows.some((row) => row.schemaVersion !== MACRO_SCHEMA_VERSION)) throw new Error('baseline macro row schema mismatch')
  return { rows, files: identities }
}

function assertSameStrings(left: readonly string[], right: readonly string[], label: string): void {
  if (JSON.stringify(left) !== JSON.stringify(right)) throw new Error(`${label} design mismatch across shards`)
}

function readChoice(directory: string): { rows: ChoiceRunCompact[]; files: FileIdentity[]; design: ChoiceShard['design']; commit: string } {
  const files = jsonFiles(directory)
  const shards = files.map((path) => JSON.parse(readFileSync(path, 'utf8')) as ChoiceShard)
  for (const shard of shards) {
    if (shard.kind !== 'economy-intervention-frontier-choice-shard' || shard.schemaVersion !== RUNNER_SCHEMA_VERSION || shard.choiceSchemaVersion !== CHOICE_FRONTIER_SCHEMA_VERSION) throw new Error('choice input is not a frontier choice shard')
  }
  validateShardLayout(shards, 'choice')
  for (const shard of shards.slice(1)) assertSameStrings(shard.design.arms, shards[0]!.design.arms, 'choice')
  const rows = uniqueBy(shards.flatMap((shard) => shard.rows), (row) => `${row.seed}\u0000${row.choiceDiagnostics.arm}`, 'choice row')
  const design = shards[0]!.design
  const expected = Array.from({ length: design.seedCount }, (_, index) => macroSeed(index + 1))
    .flatMap((seed) => design.arms.map((arm) => `${seed}\u0000${arm}`))
  assertExactKeys(rows.map((row) => `${row.seed}\u0000${row.choiceDiagnostics.arm}`), expected, 'choice rows')
  return { rows, files: files.map(fileIdentity), design, commit: shards[0]!.provenance.instrumentCommit }
}

function readCapital(directory: string): { cells: CapitalCell[]; files: FileIdentity[]; design: CapitalShard['design']; commit: string } {
  const files = jsonFiles(directory)
  const shards = files.map((path) => JSON.parse(readFileSync(path, 'utf8')) as CapitalShard)
  for (const shard of shards) if (shard.kind !== 'economy-intervention-frontier-capital-shard' || shard.schemaVersion !== RUNNER_SCHEMA_VERSION) throw new Error('capital input is not a frontier capital shard')
  validateShardLayout(shards, 'capital')
  for (const shard of shards.slice(1)) {
    assertSameStrings(shard.design.arms, shards[0]!.design.arms, 'capital arms')
    assertSameStrings(shard.design.policies, shards[0]!.design.policies, 'capital policies')
  }
  const cells = uniqueBy(shards.flatMap((shard) => shard.cells), (cell) => `${cell.seed}\u0000${cell.policy}\u0000${cell.armId}`, 'capital cell')
  const design = shards[0]!.design
  const expected = Array.from({ length: design.seedCount }, (_, index) => macroSeed(index + 1)).flatMap((seed) =>
    design.policies.flatMap((policy) => design.arms.map((arm) => `${seed}\u0000${policy}\u0000${arm}`)),
  )
  assertExactKeys(cells.map((cell) => `${cell.seed}\u0000${cell.policy}\u0000${cell.armId}`), expected, 'capital cells')
  return { cells, files: files.map(fileIdentity), design, commit: shards[0]!.provenance.instrumentCommit }
}

function readCombination(directory: string): { cells: CombinationCell[]; files: FileIdentity[]; design: CombinationShard['design']; commit: string } {
  const files = jsonFiles(directory)
  const shards = files.map((path) => JSON.parse(readFileSync(path, 'utf8')) as CombinationShard)
  for (const shard of shards) if (shard.kind !== 'economy-intervention-frontier-combination-shard' || shard.schemaVersion !== RUNNER_SCHEMA_VERSION) throw new Error('combination input is not a frontier combination shard')
  validateShardLayout(shards, 'combination')
  for (const shard of shards.slice(1)) {
    assertSameStrings(shard.design.choiceArms, shards[0]!.design.choiceArms, 'combination choices')
    assertSameStrings(shard.design.capitalArms, shards[0]!.design.capitalArms, 'combination capital')
  }
  const cells = uniqueBy(shards.flatMap((shard) => shard.cells), (cell) => `${cell.seed}\u0000${cell.choiceArm}\u0000${cell.armId}`, 'combination cell')
  const design = shards[0]!.design
  const expected = Array.from({ length: design.seedCount }, (_, index) => macroSeed(index + 1)).flatMap((seed) =>
    design.choiceArms.flatMap((choice) => design.capitalArms.map((capital) => `${seed}\u0000${choice}\u0000${capital}`)),
  )
  assertExactKeys(cells.map((cell) => `${cell.seed}\u0000${cell.choiceArm}\u0000${cell.armId}`), expected, 'combination cells')
  return { cells, files: files.map(fileIdentity), design, commit: shards[0]!.provenance.instrumentCommit }
}

function readGates(directory: string): { cells: ChoicePublicityGateCell[]; files: FileIdentity[]; design: GatesShard['design']; commit: string } {
  const files = jsonFiles(directory)
  const shards = files.map((path) => JSON.parse(readFileSync(path, 'utf8')) as GatesShard)
  for (const shard of shards) if (shard.kind !== 'economy-intervention-frontier-publicity-gates-shard' || shard.schemaVersion !== RUNNER_SCHEMA_VERSION) throw new Error('gates input is not a frontier publicity-gate shard')
  validateShardLayout(shards, 'publicity gates')
  for (const shard of shards.slice(1)) {
    assertSameStrings(shard.design.choiceArms, shards[0]!.design.choiceArms, 'gates choices')
    assertSameStrings(shard.design.gates, shards[0]!.design.gates, 'gates')
  }
  const cells = uniqueBy(shards.flatMap((shard) => shard.cells), (cell) => `${cell.seed}\u0000${cell.choiceArm}\u0000${cell.publicityGateId}`, 'gate cell')
  const design = shards[0]!.design
  const expected = Array.from({ length: design.seedCount }, (_, index) => macroSeed(index + 1)).flatMap((seed) =>
    design.choiceArms.flatMap((choice) => design.gates.map((gate) => `${seed}\u0000${choice}\u0000${gate}`)),
  )
  assertExactKeys(cells.map((cell) => `${cell.seed}\u0000${cell.choiceArm}\u0000${cell.publicityGateId}`), expected, 'gate cells')
  return { cells, files: files.map(fileIdentity), design, commit: shards[0]!.provenance.instrumentCommit }
}

function readRenewal(directory: string): { cells: RenewalFrontierCell[]; files: FileIdentity[]; design: RenewalShard['design']; commit: string } {
  const files = jsonFiles(directory)
  const shards = files.map((path) => JSON.parse(readFileSync(path, 'utf8')) as RenewalShard)
  for (const shard of shards) {
    if (shard.kind !== 'economy-intervention-frontier-renewal-shard' || shard.schemaVersion !== RUNNER_SCHEMA_VERSION || shard.renewalSchemaVersion !== RENEWAL_FRONTIER_SCHEMA_VERSION) throw new Error('renewal input is not a frontier renewal shard')
  }
  validateShardLayout(shards, 'renewal')
  const design = shards[0]!.design
  if (design.seedCount !== RENEWAL_FRONTIER_SEEDS.length || JSON.stringify(design.operatingPolicies) !== JSON.stringify(RENEWAL_FRONTIER_OPERATING_POLICIES) || JSON.stringify(design.treatmentIds) !== JSON.stringify(RENEWAL_FRONTIER_TREATMENTS.map((treatment) => treatment.id))) {
    throw new Error('renewal corpus must retain its fixed 25-seed, 3-policy, 8-treatment factorial')
  }
  for (const shard of shards.slice(1)) {
    assertSameStrings(shard.design.operatingPolicies, design.operatingPolicies, 'renewal policies')
    assertSameStrings(shard.design.treatmentIds, design.treatmentIds, 'renewal treatments')
  }
  const cells = uniqueBy(shards.flatMap((shard) => shard.cells), (cell) => `${cell.seed}\u0000${cell.operatingPolicyId}`, 'renewal cell')
  const expected = RENEWAL_FRONTIER_SEEDS.flatMap((seed) => RENEWAL_FRONTIER_OPERATING_POLICIES.map((policy) => `${seed}\u0000${policy}`))
  assertExactKeys(cells.map((cell) => `${cell.seed}\u0000${cell.operatingPolicyId}`), expected, 'renewal cells')
  for (const cell of cells) {
    assertExactKeys(cell.arms.map((arm) => arm.treatment.id), design.treatmentIds, `renewal treatments ${cell.seed}/${cell.operatingPolicyId}`)
  }
  return { cells, files: files.map(fileIdentity), design, commit: shards[0]!.provenance.instrumentCommit }
}

function pairedRows(
  left: string,
  right: string,
  leftRows: readonly { seed: string }[],
  rightRows: readonly { seed: string }[],
  metric: (row: { seed: string }) => number,
): PairedEffect {
  return pairedEffect(left, right, new Map(leftRows.map((row) => [row.seed, metric(row)])), new Map(rightRows.map((row) => [row.seed, metric(row)])))
}

function choicePairedVsP5(rows: readonly ChoiceRunCompact[], baseline: readonly MacroRunCompact[]): unknown[] {
  const p5 = baseline.filter((row) => row.policy === 'P5_forecastProfitMax')
  return CHOICE_ARMS.filter((arm) => rows.some((row) => row.choiceDiagnostics.arm === arm)).map((arm) => {
    const current = rows.filter((row) => row.choiceDiagnostics.arm === arm)
    return {
      arm,
      endCashVsFrozenP5: pairedRows(arm, 'P5_forecastProfitMax', current, p5, (row) => (row as ChoiceRunCompact).endCash),
      releasesVsFrozenP5: pairedRows(arm, 'P5_forecastProfitMax', current, p5, (row) => (row as ChoiceRunCompact).filmsReleased),
      noProductionWeeksVsFrozenP5: pairedRows(arm, 'P5_forecastProfitMax', current, p5, (row) => (row as ChoiceRunCompact).weeksNoProduction),
    }
  })
}

type StrategyWinShares = {
  comparableSeeds: number
  shares: Record<string, number>
  maximumShare: number | null
  policiesAbove05: number
  policiesAbove10: number
}

function strategyWinShares(
  rows: readonly MacroRunCompact[],
  policies: readonly string[],
): StrategyWinShares {
  const columns = new Map(
    policies.map((policy) => [
      policy,
      new Map(
        rows
          .filter((row) => row.policy === policy)
          .map((row) => [row.seed, row.endCash]),
      ),
    ]),
  )
  const first = columns.get(policies[0]!)
  const seeds =
    first === undefined
      ? []
      : [...first.keys()]
          .filter((seed) => policies.every((policy) => columns.get(policy)?.has(seed) === true))
          .sort()
  const wins = Object.fromEntries(policies.map((policy) => [policy, 0])) as Record<
    string,
    number
  >
  for (const seed of seeds) {
    const best = Math.max(...policies.map((policy) => columns.get(policy)!.get(seed)!))
    const tied = policies.filter((policy) => columns.get(policy)!.get(seed) === best)
    for (const policy of tied) wins[policy] += 1 / tied.length
  }
  if (seeds.length > 0) {
    for (const policy of policies) wins[policy] /= seeds.length
  }
  const shares = Object.values(wins)
  return {
    comparableSeeds: seeds.length,
    shares: wins,
    maximumShare: shares.length === 0 ? null : Math.max(...shares),
    policiesAbove05: shares.filter((share) => share >= 0.05).length,
    policiesAbove10: shares.filter((share) => share >= 0.1).length,
  }
}

function choiceStrategyDiversity(
  rows: readonly ChoiceRunCompact[],
  baseline: readonly MacroRunCompact[],
): Array<{ arm: ChoiceArm; endCashWinSharesAtWeek260: StrategyWinShares }> {
  const retainedPolicies = NORMAL_PLAYER_POLICY_NAMES.filter(
    (policy) => policy !== 'P5_forecastProfitMax',
  )
  return CHOICE_ARMS.filter((arm) =>
    rows.some((row) => row.choiceDiagnostics.arm === arm),
  ).map((arm) => {
    const candidate = rows
      .filter((row) => row.choiceDiagnostics.arm === arm)
      .map((row) => ({ ...row, policy: arm }))
    const candidateSeeds = new Set(candidate.map((row) => row.seed))
    const controls = baseline.filter(
      (row) => retainedPolicies.includes(row.policy) && candidateSeeds.has(row.seed),
    )
    return {
      arm,
      endCashWinSharesAtWeek260: strategyWinShares(
        [...controls, ...candidate],
        [...retainedPolicies, arm],
      ),
    }
  })
}

function capitalStrategyDiversity(
  cells: readonly CapitalCell[],
): Array<{ armId: CapitalArmId; endCashWinSharesAtWeek260: StrategyWinShares }> {
  return CAPITAL_ARM_IDS.filter(
    (armId) =>
      armId !== 'none' &&
      NORMAL_PLAYER_POLICY_NAMES.every((policy) =>
        cells.some((cell) => cell.armId === armId && cell.policy === policy),
      ),
  ).map((armId) => {
    const treated = cells
      .filter(
        (cell) =>
          cell.armId === armId && NORMAL_PLAYER_POLICY_NAMES.includes(cell.policy),
      )
      .map((cell) => cell.macro)
    return {
      armId,
      endCashWinSharesAtWeek260: strategyWinShares(
        treated,
        NORMAL_PLAYER_POLICY_NAMES,
      ),
    }
  })
}

type GateSummary = {
  choiceArm: ChoiceArm
  publicityGateId: ChoicePublicityGateId
  runs: number
  endCash: Distribution
  releases: Distribution
  noProductionWeeks: Distribution
  publicitySpend: Distribution
  publicityCount: Distribution
  engagedWeekFraction: Distribution
  runaway: RateEstimate
  distress: RateEstimate
  negativeEnding: RateEstimate
  terminalDecline: RateEstimate
  rosterWall: RateEstimate
  durableRecoveryAt103AmongDistressed: RateEstimate
  reconciliationFailures: number
}

function aggregateGates(cells: readonly ChoicePublicityGateCell[]): GateSummary[] {
  const keys = [...new Set(cells.map((cell) => `${cell.choiceArm}\u0000${cell.publicityGateId}`))].sort()
  return keys.map((key) => {
    const [choiceArm, publicityGateId] = key.split('\u0000') as [ChoiceArm, ChoicePublicityGateId]
    const rows = cells.filter((cell) => cell.choiceArm === choiceArm && cell.publicityGateId === publicityGateId).map((cell) => cell.macro)
    const distressed = rows.filter((row) => row.distressEntryWeek !== null)
    return {
      choiceArm,
      publicityGateId,
      runs: rows.length,
      endCash: distribution(rows.map((row) => row.endCash)),
      releases: distribution(rows.map((row) => row.filmsReleased)),
      noProductionWeeks: distribution(rows.map((row) => row.weeksNoProduction)),
      publicitySpend: distribution(rows.map((row) => row.publicitySpend)),
      publicityCount: distribution(rows.map((row) => row.publicityCount)),
      engagedWeekFraction: distribution(rows.map((row) => row.engagedWeekFraction)),
      runaway: rate(rows.filter((row) => row.runawaySuccess).length, rows.length),
      distress: rate(rows.filter((row) => row.distressEntryWeek !== null).length, rows.length),
      negativeEnding: rate(rows.filter((row) => row.endCash < 0).length, rows.length),
      terminalDecline: rate(rows.filter((row) => row.terminalDecline).length, rows.length),
      rosterWall: rate(rows.filter((row) => row.rosterWallHit).length, rows.length),
      durableRecoveryAt103AmongDistressed: rate(
        distressed.filter((row) => row.durableRecoveryAt103 === true).length,
        distressed.length,
      ),
      reconciliationFailures: rows.filter((row) => !row.reconciliationOk).length,
    }
  })
}

function publicityGatePairedEffects(
  cells: readonly ChoicePublicityGateCell[],
): Array<{
  choiceArm: ChoiceArm
  gate: ChoicePublicityGateId
  endCashVsNever: PairedEffect
  releasesVsNever: PairedEffect
  noProductionWeeksVsNever: PairedEffect
}> {
  const result = []
  for (const choiceArm of [...new Set(cells.map((cell) => cell.choiceArm))].sort()) {
    const never = cells
      .filter(
        (cell) =>
          cell.choiceArm === choiceArm && cell.publicityGateId === 'never',
      )
      .map((cell) => cell.macro)
    for (const gate of CHOICE_PUBLICITY_GATE_IDS.filter((id) => id !== 'never')) {
      const treated = cells
        .filter(
          (cell) =>
            cell.choiceArm === choiceArm && cell.publicityGateId === gate,
        )
        .map((cell) => cell.macro)
      if (treated.length === 0 || never.length === 0) continue
      result.push({
        choiceArm,
        gate,
        endCashVsNever: pairedRows(
          `${choiceArm}/${gate}`,
          `${choiceArm}/never`,
          treated,
          never,
          (row) => (row as MacroRunCompact).endCash,
        ),
        releasesVsNever: pairedRows(
          `${choiceArm}/${gate}`,
          `${choiceArm}/never`,
          treated,
          never,
          (row) => (row as MacroRunCompact).filmsReleased,
        ),
        noProductionWeeksVsNever: pairedRows(
          `${choiceArm}/${gate}`,
          `${choiceArm}/never`,
          treated,
          never,
          (row) => (row as MacroRunCompact).weeksNoProduction,
        ),
      })
    }
  }
  return result
}

function renewalContrast(
  cells: readonly RenewalFrontierCell[],
  treatmentId: string,
  onlyBaselineFullWall: boolean,
): Record<string, PairedEffect> {
  const controlId = 'sync-w12-full-now'
  const pairs = cells.flatMap((cell) => {
    const control = cell.arms.find((arm) => arm.treatment.id === controlId)
    const treated = cell.arms.find((arm) => arm.treatment.id === treatmentId)
    return control === undefined || treated === undefined || (onlyBaselineFullWall && !control.metrics.zeroRosterAtTreatmentCohortEnd)
      ? []
      : [{ key: `${cell.seed}\u0000${cell.operatingPolicyId}`, control, treated }]
  })
  const effects = (metric: (arm: RenewalFrontierArm) => number) => pairedEffect(
    treatmentId,
    controlId,
    new Map(pairs.map((pair) => [pair.key, metric(pair.treated)])),
    new Map(pairs.map((pair) => [pair.key, metric(pair.control)])),
  )
  return {
    finalCash: effects((arm) => arm.metrics.finalCash),
    releases: effects((arm) => arm.metrics.releases),
    finalActiveContracts: effects((arm) => arm.metrics.finalActiveContracts),
    roleLossEver: effects((arm) => Number(arm.metrics.roleLossEver)),
    zeroRosterAtWeek208: effects((arm) => Number(arm.metrics.zeroRosterAtWeek208)),
    zeroRosterAtTreatmentCohortEnd: effects((arm) => Number(arm.metrics.zeroRosterAtTreatmentCohortEnd)),
    originalLostOwners: effects((arm) => arm.metrics.originalLostOwners),
    recurrenceAcceptedOwners: effects((arm) => arm.metrics.recurrenceAcceptedOwners),
  }
}

function aggregate(flags: Args): void {
  const source = provenance()
  const baseline = readBaseline(flagString(flags, 'baseline-dir'))
  const choiceDirectory = optionalString(flags, 'choice-dir')
  const capitalDirectory = optionalString(flags, 'capital-dir')
  const combinationDirectory = optionalString(flags, 'combination-dir')
  const gatesDirectory = optionalString(flags, 'gates-dir')
  const renewalDirectory = optionalString(flags, 'renewal-dir')
  if ([choiceDirectory, capitalDirectory, combinationDirectory, gatesDirectory, renewalDirectory].every((directory) => directory === undefined)) {
    throw new Error('aggregate needs at least one frontier raw directory')
  }
  const choice = choiceDirectory === undefined ? undefined : readChoice(choiceDirectory)
  const capital = capitalDirectory === undefined ? undefined : readCapital(capitalDirectory)
  const combination = combinationDirectory === undefined ? undefined : readCombination(combinationDirectory)
  const gates = gatesDirectory === undefined ? undefined : readGates(gatesDirectory)
  const renewal = renewalDirectory === undefined ? undefined : readRenewal(renewalDirectory)
  const artifact = {
    schemaVersion: 'economy-intervention-frontier-aggregate-v1',
    provenance: source,
    productionBehaviorChanged: false,
    rawEvidenceExcluded: true,
    frozenEvidence: {
      auditTip: FRONTIER_FROZEN_AUDIT_TIP,
      diagnosisTip: FRONTIER_FROZEN_DIAGNOSIS_TIP,
      macroFiles: baseline.files,
    },
    commands: {
      choice: 'npm run frontier:economy -- choice-shard --seed-count <N> --arms <comma-list> --shard-index <i> --shard-count <n> --out <raw-path>',
      capital: 'npm run frontier:economy -- capital-shard --seed-count <N> --policies <comma-list> --arms <comma-list> --shard-index <i> --shard-count <n> --out <raw-path>',
      combination: 'npm run frontier:economy -- combination-shard --seed-count <N> --choice-arms <comma-list> --capital-arms <comma-list> --shard-index <i> --shard-count <n> --out <raw-path>',
      gates: 'npm run frontier:economy -- gates-shard --seed-count <N> --choice-arms <comma-list> --gates <comma-list> --shard-index <i> --shard-count <n> --out <raw-path>',
      renewal: 'npm run frontier:economy -- renewal-shard --shard-index <i> --shard-count <n> --out <raw-path>',
      aggregate: 'npm run frontier:economy -- aggregate --baseline-dir <Audit-01 macro directory> [--choice-dir <raw dir>] [--capital-dir <raw dir>] [--combination-dir <raw dir>] [--gates-dir <raw dir>] [--renewal-dir <raw dir>] --out <compact JSON>',
    },
    choice: choice === undefined ? undefined : {
      instrumentCommit: choice.commit,
      design: choice.design,
      rawFiles: choice.files,
      summary: aggregateChoiceRuns(choice.rows),
      pairedVsFrozenP5: choicePairedVsP5(choice.rows, baseline.rows),
      strategyDiversity: choiceStrategyDiversity(choice.rows, baseline.rows),
    },
    capital: capital === undefined ? undefined : {
      instrumentCommit: capital.commit,
      design: capital.design,
      rawFiles: capital.files,
      summary: aggregateCapitalRuns(capital.cells),
      pairedVsFrozenCurrent: pairedCapitalEffects(capital.cells, baseline.rows),
      strategyDiversity: capitalStrategyDiversity(capital.cells),
    },
    combinations: combination === undefined ? undefined : {
      instrumentCommit: combination.commit,
      design: combination.design,
      rawFiles: combination.files,
      capitalSummary: aggregateCapitalRuns(combination.cells),
      choiceSummary: aggregateChoiceRuns(combination.cells.map((cell) => ({ ...cell.macro, choiceDiagnostics: cell.choiceDiagnostics }))),
      pairedEnterpriseResourcesVsFrozenP5: combination.design.choiceArms.map((choiceArm) => {
        const rows = combination.cells.filter((cell) => cell.choiceArm === choiceArm)
        const p5 = baseline.rows.filter((row) => row.policy === 'P5_forecastProfitMax')
        return pairedEffect(
          `${choiceArm}/combination/enterprise-resources`,
          'P5_forecastProfitMax/cash',
          new Map(rows.map((row) => [row.seed, row.enterpriseEndResources])),
          new Map(p5.map((row) => [row.seed, row.endCash])),
        )
      }),
    },
    publicityGates: gates === undefined ? undefined : {
      instrumentCommit: gates.commit,
      design: gates.design,
      rawFiles: gates.files,
      summary: aggregateGates(gates.cells),
      pairedVsNever: publicityGatePairedEffects(gates.cells),
    },
    renewal: renewal === undefined ? undefined : {
      instrumentCommit: renewal.commit,
      design: renewal.design,
      rawFiles: renewal.files,
      summary: aggregateRenewalFrontier(renewal.cells),
      pairedVsCurrentAllCells: RENEWAL_FRONTIER_TREATMENTS.filter((treatment) => treatment.id !== 'sync-w12-full-now').map((treatment) => ({ treatmentId: treatment.id, effects: renewalContrast(renewal.cells, treatment.id, false) })),
      pairedVsCurrentBaselineFullWallCells: RENEWAL_FRONTIER_TREATMENTS.filter((treatment) => treatment.id !== 'sync-w12-full-now').map((treatment) => ({ treatmentId: treatment.id, effects: renewalContrast(renewal.cells, treatment.id, true) })),
    },
  }
  writeJson(flagString(flags, 'out'), artifact)
}

function smoke(flags: Args): void {
  const source = provenance()
  const artifact = {
    source,
    choice: runChoiceCell('eta-macro-0001', 'D03_absoluteProfitBaseline'),
    capital: runCapitalCell('eta-macro-0001', resolveMacroPolicies(['P5_forecastProfitMax'])[0]!, 'four-rung-1-estate'),
    combination: runCombinationCell('eta-macro-0001', 'D03_downsideBudget_1', 'four-rung-5-estates'),
    gates: runChoicePublicityGateCell('eta-macro-0001', 'D03_absoluteProfitBaseline', 'maintenance'),
    renewal: runRenewalFrontierCell(RENEWAL_FRONTIER_SEEDS[0]!, RENEWAL_FRONTIER_OPERATING_POLICIES[0]!),
  }
  writeJson(flagString(flags, 'out', 'out/economy-intervention-frontier/smoke.json'), artifact)
}

function help(): void {
  process.stdout.write([
    'Economy Intervention Frontier 03 commands:',
    '  choice-shard      --seed-count N [--arms a,b] --shard-index I --shard-count N --out PATH',
    '  capital-shard     --seed-count N [--policies p,q] [--arms a,b] --shard-index I --shard-count N --out PATH',
    '  combination-shard --seed-count N [--choice-arms a,b] [--capital-arms a,b] --shard-index I --shard-count N --out PATH',
    '  gates-shard       --seed-count N [--choice-arms a,b] [--gates a,b] --shard-index I --shard-count N --out PATH',
    '  renewal-shard     --shard-index I --shard-count N --out PATH',
    '  aggregate --baseline-dir DIR [--choice-dir DIR] [--capital-dir DIR] [--combination-dir DIR] [--gates-dir DIR] [--renewal-dir DIR] --out PATH',
    '  smoke [--out PATH]',
    '',
    `Choice/capital/combination/gates: up to ${String(MACRO_SEED_COUNT)} deterministic macro seeds; renewal: fixed ${String(RENEWAL_FRONTIER_SEEDS.length)} seeds × ${String(RENEWAL_FRONTIER_OPERATING_POLICIES.length)} policies × ${String(RENEWAL_FRONTIER_TREATMENTS.length)} treatments.`,
    'Shard commands reject dirty instrument paths. Aggregate verifies the four pinned Audit-01 macro hashes and emits only compact summaries/manifests.',
  ].join('\n'))
}

const { command, flags } = parseArgs(process.argv.slice(2))
switch (command) {
  case 'choice-shard': runChoiceShard(flags); break
  case 'capital-shard': runCapitalShard(flags); break
  case 'combination-shard': runCombinationShard(flags); break
  case 'gates-shard': runGatesShard(flags); break
  case 'renewal-shard': runRenewalShard(flags); break
  case 'aggregate': aggregate(flags); break
  case 'smoke': smoke(flags); break
  case 'help': help(); break
  default: throw new Error(`unknown economy frontier command ${command}`)
}
