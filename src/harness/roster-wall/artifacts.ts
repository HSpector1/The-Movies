// Week-208 roster-wall deterministic artifact infrastructure.
//
// ANALYSIS ONLY. This module provides canonical JSON/JSONL, an immutable
// entry-save sink, strict governed paths, recursive digests, exact governed
// campaign replay, semantic verification, and byte-for-byte replay comparison.

import { createHash } from 'node:crypto'
import {
  appendFileSync,
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { TextDecoder } from 'node:util'
import {
  FOUNDING_MINIMUMS,
  canAfford,
  contractOffer,
  expectedWeeklyRunRevenue,
  exportSave,
  importSave,
  renewalWindowOpen,
  stableStringify,
  weeklySalary,
} from '../../core/index.js'
import type { GameState } from '../../core/index.js'
import {
  runRosterWallNeutralEntryCampaign,
  runRosterWallOperatingWeek,
} from './campaign.js'
import type {
  RosterWallOperatingPolicyId,
} from './campaign.js'
import {
  rosterWallContinuationRows,
  runRosterWallContinuationCorpus,
} from './continuation.js'
import {
  orderedRosterWallPlayerPolicyEvidenceRows,
  runRosterWallPlayerPolicy,
  serializeRosterWallPlayerPolicyEvidence,
} from './player-policy.js'
import {
  ROSTER_WALL_EXPECTED_BRANCH,
  ROSTER_WALL_PRODUCTION_AUTHORITY,
  ROSTER_WALL_PRODUCTION_AUTHORITY_TREE,
  acceptedRosterWallSourceProvenance,
  assertRosterWallProvenanceUnchanged,
} from './provenance.js'
import type {
  RosterWallSourceProvenance,
} from './provenance.js'
import type { RosterWallArtifactRecord } from './records.js'
import { runRosterWallMechanicsFixtures } from './fixtures.js'
import {
  makeRosterWallEntryRecord,
  makeRosterWallShadowRecords,
} from './schema.js'
import {
  RosterWallSummaryAccumulator,
  assertRosterWallResearchSummaryMatches,
  renderRosterWallSummaryMarkdown,
  validateRosterWallResearchSummary,
} from './summary.js'

export const ROSTER_WALL_OUTPUT_RELATIVE = join('out', 'week-208-roster-wall')

const REQUIRED_TOP_LEVEL = [
  'entries',
  'entries.jsonl',
  'manifest.json',
  'rows.jsonl',
  'sha256.json',
  'summary.json',
  'summary.md',
] as const

export type RosterWallSha256Entry = {
  path: string
  bytes: number
  sha256: string
}

export type RosterWallSha256Inventory = {
  algorithm: 'sha256'
  files: RosterWallSha256Entry[]
}

export type RosterWallArtifactPaths = {
  directory: string
  entriesDirectory: string
  manifest: string
  entries: string
  rows: string
  summary: string
  markdown: string
  sha256: string
}

export type RosterWallArtifactEntry = {
  entryId: string
  row: unknown
  saveJson: string
}

export type RosterWallArtifactFinalization = {
  manifest: unknown
  summary: unknown
  summaryMarkdown: string
}

export const ROSTER_WALL_ACCEPTED_SCHEMA_VERSION = 'roster-wall-observer-v1' as const
export const ROSTER_WALL_ACCEPTED_EXPERIMENT_ID = 'week-208-roster-wall-v1' as const
export const ROSTER_WALL_ACCEPTED_SEED_SET_ID = 'canonical-facilities-25-v1' as const

export const ROSTER_WALL_ACCEPTED_RECORD_TYPES = [
  'entry',
  'weekly',
  'renewalIntent',
  'boundary',
  'windowShadow',
  'mechanicsFixture',
  'pair',
] as const

export type RosterWallAcceptedRecordType =
  (typeof ROSTER_WALL_ACCEPTED_RECORD_TYPES)[number]
export type RosterWallArtifactProfile = 'smoke' | 'complete'

export const ROSTER_WALL_ACCEPTED_OPERATING_POLICY_IDS = [
  'direct-package',
  'development-casting',
  'scaled-two-team',
] as const
export const ROSTER_WALL_ACCEPTED_ESTATE_POLICY_IDS = [
  'vacant',
  'annex-start-week-0',
] as const
export const ROSTER_WALL_ACCEPTED_FOUNDING_TERM_POLICY_IDS = [
  'all-208',
  'round-robin-mixed',
] as const
export const ROSTER_WALL_ACCEPTED_CONTINUATION_POLICY_IDS = [
  'C0-no-renewal',
  'C1-current-retry-all',
  'C2-cheapest-bonus-first',
  'C3-role-coverage-first',
  'C4-last-legal-role-first',
  'C5-spread-role-first',
  'C6-mixed-term-role-first',
] as const

export type RosterWallAcceptedRecordTypeCounts = Record<
  RosterWallAcceptedRecordType,
  number
>

export type RosterWallAcceptedArtifactCounts = {
  entries: number
  rows: number
  recordTypes: RosterWallAcceptedRecordTypeCounts
}

export type RosterWallAcceptedArtifactMatrix = {
  canonicalSeeds: string[]
  operatingPolicyIds: string[]
  estatePolicyIds: string[]
  foundingTermPolicyIds: string[]
  continuationPolicyIds: string[]
  entryWeek: 196
  primaryHorizonWeeks: 260
  recurrenceHorizonWeeks: 428
  playerPolicyHorizonWeeks: 428
  pairEstatePolicyId: 'vacant'
  maximumTermEntries: number
  playerPolicyEntries: number
  totalEntries: number
  maximumTermWeeklyRows: number
  playerPolicyWeeklyRows: number
  weeklyRows: number
  windowShadowRows: number
  pairRows: number
  mechanicsFixtureRows: 168
}

export type RosterWallAcceptedEntryIndexRow = {
  entryId: string
  mode: 'current' | 'player-policy'
  seed: string
  operatingPolicyId: string
  estatePolicyId: string
  foundingTermPolicyId: string
  initialSaveHash: string
  entrySaveHash: string
  entryStateHash: string
}

export type RosterWallAcceptedArtifactManifest = {
  schemaVersion: typeof ROSTER_WALL_ACCEPTED_SCHEMA_VERSION
  experimentId: typeof ROSTER_WALL_ACCEPTED_EXPERIMENT_ID
  seedSetId: typeof ROSTER_WALL_ACCEPTED_SEED_SET_ID
  profile: RosterWallArtifactProfile
  completeEvidence: boolean
  source: RosterWallSourceProvenance
  matrix: RosterWallAcceptedArtifactMatrix
  counts: RosterWallAcceptedArtifactCounts
  entryIndex: RosterWallAcceptedEntryIndexRow[]
  acceptanceChecks: RosterWallAcceptedAcceptanceChecks
  invariantFailures: 0
  [key: string]: unknown
}

export type RosterWallAcceptedAcceptanceChecks = {
  entryObserverNeutrality: {
    checkedEntries: number
    byteIdenticalEntries: number
    stateHashIdenticalEntries: number
    rngStateIdenticalEntries: number
    failures: 0
  }
  continuationObserverNeutrality: {
    checkedArms: number
    byteIdenticalArms: number
    stateHashIdenticalArms: number
    rngStateIdenticalArms: number
    failures: 0
  }
  playerPolicyObserverNeutrality: {
    checkedRuns: number
    byteIdenticalRuns: number
    stateHashIdenticalRuns: number
    rngStateIdenticalRuns: number
    failures: 0
  }
}

export type RosterWallAcceptedArtifactSummary = {
  schemaVersion: typeof ROSTER_WALL_ACCEPTED_SCHEMA_VERSION
  experimentId: typeof ROSTER_WALL_ACCEPTED_EXPERIMENT_ID
  seedSetId: typeof ROSTER_WALL_ACCEPTED_SEED_SET_ID
  profile: RosterWallArtifactProfile
  completeEvidence: boolean
  source: RosterWallSourceProvenance
  matrix: RosterWallAcceptedArtifactMatrix
  counts: RosterWallAcceptedArtifactCounts
  invariantFailures: 0
  [key: string]: unknown
}

export type RosterWallAcceptedArtifactFinalization = {
  manifest: RosterWallAcceptedArtifactManifest
  summary: RosterWallAcceptedArtifactSummary
  summaryMarkdown: string
  source: RosterWallSourceProvenance
}

export type RosterWallArtifactVerification = {
  paths: RosterWallArtifactPaths
  inventory: RosterWallSha256Inventory
  entryCount: number
  rowCount: number
  files: string[]
}

export type RosterWallAcceptedArtifactVerification =
  RosterWallArtifactVerification & {
    profile: RosterWallArtifactProfile
    manifest: RosterWallAcceptedArtifactManifest
    summary: RosterWallAcceptedArtifactSummary
  }

type RosterWallEntryIndexFact = {
  entryId: string
  entrySaveHash: string | null
}

export type RosterWallArtifactDifference = {
  path: string
  kind: 'missing-left' | 'missing-right' | 'bytes'
  leftSha256: string | null
  rightSha256: string | null
}

export type RosterWallArtifactComparison = {
  byteIdentical: boolean
  differences: RosterWallArtifactDifference[]
  left: RosterWallArtifactVerification
  right: RosterWallArtifactVerification
}

export type RosterWallAcceptedArtifactComparison = Omit<
  RosterWallArtifactComparison,
  'left' | 'right'
> & {
  left: RosterWallAcceptedArtifactVerification
  right: RosterWallAcceptedArtifactVerification
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function canonicalJsonValue(value: unknown, ancestors: Set<object>): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('roster-wall artifacts: canonical JSON rejects non-finite numbers')
    }
    return value
  }
  if (Array.isArray(value)) {
    if (ancestors.has(value)) {
      throw new Error('roster-wall artifacts: canonical JSON rejects cycles')
    }
    for (let index = 0; index < value.length; index++) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) {
        throw new Error('roster-wall artifacts: canonical JSON rejects sparse arrays')
      }
    }
    ancestors.add(value)
    const result = value.map((item) => canonicalJsonValue(item, ancestors))
    ancestors.delete(value)
    return result
  }
  if (typeof value === 'object') {
    const object = value as Record<string, unknown>
    const prototype = Object.getPrototypeOf(object) as object | null
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error('roster-wall artifacts: canonical JSON requires plain data objects')
    }
    if (Object.getOwnPropertySymbols(object).length > 0) {
      throw new Error('roster-wall artifacts: canonical JSON rejects symbol keys')
    }
    const ownNames = Object.getOwnPropertyNames(object)
    const enumerableKeys = Object.keys(object)
    if (ownNames.length !== enumerableKeys.length) {
      throw new Error('roster-wall artifacts: canonical JSON rejects non-enumerable keys')
    }
    for (const key of ownNames) {
      const descriptor = Object.getOwnPropertyDescriptor(object, key)
      if (descriptor === undefined || descriptor.get !== undefined || descriptor.set !== undefined) {
        throw new Error('roster-wall artifacts: canonical JSON rejects accessor properties')
      }
    }
    if (ancestors.has(object)) {
      throw new Error('roster-wall artifacts: canonical JSON rejects cycles')
    }
    ancestors.add(object)
    const result = Object.create(null) as Record<string, unknown>
    for (const key of enumerableKeys.sort(compareText)) {
      const child = object[key]
      if (child === undefined || typeof child === 'function' || typeof child === 'symbol') {
        throw new Error(
          `roster-wall artifacts: canonical JSON rejects unsupported value at ${JSON.stringify(key)}`,
        )
      }
      Object.defineProperty(result, key, {
        configurable: true,
        enumerable: true,
        value: canonicalJsonValue(child, ancestors),
        writable: true,
      })
    }
    ancestors.delete(object)
    return result
  }
  throw new Error(
    `roster-wall artifacts: canonical JSON rejects value of type ${typeof value}`,
  )
}

/** Stable recursive key ordering. Arrays retain their governed order. */
export function rosterWallStableJson(value: unknown, indent = 0): string {
  if (!Number.isInteger(indent) || indent < 0 || indent > 10) {
    throw new Error('roster-wall artifacts: JSON indent must be an integer from 0 through 10')
  }
  return JSON.stringify(canonicalJsonValue(value, new Set()), null, indent)
}

/** Canonical newline-delimited JSON; an empty sequence is the empty file. */
export function rosterWallStableJsonl(values: readonly unknown[]): string {
  return values.length === 0
    ? ''
    : `${values.map((value) => rosterWallStableJson(value)).join('\n')}\n`
}

export function rosterWallSha256(bytes: string | Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

const FILE_BUFFER_BYTES = 1024 * 1024
export const ROSTER_WALL_MAX_JSONL_ROW_BYTES = 16 * 1024 * 1024

function decodeUtf8Fatal(bytes: Uint8Array, label: string): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error(`roster-wall artifacts: ${label} is not valid UTF-8`)
  }
}

function hashRosterWallFile(path: string): { bytes: number; sha256: string } {
  const descriptor = openSync(path, 'r')
  const hash = createHash('sha256')
  const buffer = Buffer.allocUnsafe(FILE_BUFFER_BYTES)
  let bytes = 0
  try {
    while (true) {
      const read = readSync(descriptor, buffer, 0, buffer.length, null)
      if (read === 0) break
      hash.update(buffer.subarray(0, read))
      bytes += read
    }
  } finally {
    closeSync(descriptor)
  }
  return { bytes, sha256: hash.digest('hex') }
}

export function validateRosterWallRunName(runName: string): string {
  if (
    runName === '.' ||
    runName === '..' ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(runName)
  ) {
    throw new Error(
      'roster-wall artifacts: run name must be 1–80 safe filename characters and begin with a letter or digit',
    )
  }
  return runName
}

export function validateRosterWallEntryId(entryId: string): string {
  if (
    entryId === '.' ||
    entryId === '..' ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(entryId)
  ) {
    throw new Error(
      'roster-wall artifacts: entryId must be 1–160 safe filename characters and begin with a letter or digit',
    )
  }
  return entryId
}

function artifactPaths(directory: string): RosterWallArtifactPaths {
  return {
    directory,
    entriesDirectory: join(directory, 'entries'),
    manifest: join(directory, 'manifest.json'),
    entries: join(directory, 'entries.jsonl'),
    rows: join(directory, 'rows.jsonl'),
    summary: join(directory, 'summary.json'),
    markdown: join(directory, 'summary.md'),
    sha256: join(directory, 'sha256.json'),
  }
}

function canonicalRepoRoot(repoRoot: string): string {
  const root = realpathSync(repoRoot)
  if (
    !existsSync(join(root, '.git')) ||
    !existsSync(join(root, 'package.json')) ||
    !existsSync(join(root, 'src', 'core', 'index.ts'))
  ) {
    throw new Error('roster-wall artifacts: repoRoot is not the governed Project: Studio repository')
  }
  return root
}

function governedRunDirectory(repoRoot: string, runName: string): string {
  const safeName = validateRosterWallRunName(runName)
  const outputRoot = resolve(repoRoot, ROSTER_WALL_OUTPUT_RELATIVE)
  const directory = resolve(outputRoot, safeName)
  if (dirname(directory) !== outputRoot) {
    throw new Error('roster-wall artifacts: resolved output escaped the governed root')
  }
  const relativeOutput = relative(repoRoot, outputRoot)
  if (
    relativeOutput === '' ||
    relativeOutput.startsWith('..') ||
    relativeOutput.startsWith(sep)
  ) {
    throw new Error('roster-wall artifacts: governed output root escaped the repository')
  }
  return directory
}

function rejectSymlinkComponents(repoRoot: string, directory: string): void {
  const relativeDirectory = relative(repoRoot, directory)
  let cursor = repoRoot
  for (const component of relativeDirectory.split(sep)) {
    cursor = join(cursor, component)
    if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink()) {
      throw new Error(`roster-wall artifacts: output path contains a symbolic link: ${cursor}`)
    }
  }
}

/** Create one fresh governed run directory, refusing stale files and symlinks. */
export function prepareRosterWallArtifactDirectory(
  repoRoot: string,
  runName: string,
): RosterWallArtifactPaths {
  const root = canonicalRepoRoot(repoRoot)
  const directory = governedRunDirectory(root, runName)
  rejectSymlinkComponents(root, directory)
  if (existsSync(directory)) {
    if (!lstatSync(directory).isDirectory()) {
      throw new Error('roster-wall artifacts: run path exists and is not a directory')
    }
    if (readdirSync(directory).length > 0) {
      throw new Error(
        `roster-wall artifacts: output directory already exists and is not empty: ${directory}`,
      )
    }
  }
  const paths = artifactPaths(directory)
  mkdirSync(paths.entriesDirectory, { recursive: true })
  const canonicalDirectory = realpathSync(directory)
  const outputRoot = resolve(root, ROSTER_WALL_OUTPUT_RELATIVE)
  if (!canonicalDirectory.startsWith(`${outputRoot}${sep}`)) {
    throw new Error('roster-wall artifacts: canonical output escaped the governed root')
  }
  writeFileSync(paths.entries, '', { encoding: 'utf8', flag: 'wx' })
  writeFileSync(paths.rows, '', { encoding: 'utf8', flag: 'wx' })
  return paths
}

function toPortableRelative(root: string, path: string): string {
  return relative(root, path).split(sep).join('/')
}

function walkRegularFiles(
  root: string,
  directory: string,
  excluded: ReadonlySet<string>,
  files: string[],
): void {
  for (const name of readdirSync(directory).sort(compareText)) {
    const path = join(directory, name)
    const info = lstatSync(path)
    const relativePath = toPortableRelative(root, path)
    if (info.isSymbolicLink()) {
      throw new Error(`roster-wall artifacts: artifact contains a symbolic link: ${relativePath}`)
    }
    if (info.isDirectory()) {
      walkRegularFiles(root, path, excluded, files)
      continue
    }
    if (!info.isFile()) {
      throw new Error(`roster-wall artifacts: artifact contains a non-regular file: ${relativePath}`)
    }
    if (!excluded.has(relativePath)) files.push(relativePath)
  }
}

/** Recursively inventory every regular file except explicitly named portable paths. */
export function inventoryRosterWallArtifactDirectory(
  directory: string,
  excluded: ReadonlySet<string> = new Set(),
): RosterWallSha256Inventory {
  const root = realpathSync(directory)
  const files: string[] = []
  walkRegularFiles(root, root, excluded, files)
  files.sort(compareText)
  return {
    algorithm: 'sha256',
    files: files.map((path) => ({ path, ...hashRosterWallFile(join(root, ...path.split('/'))) })),
  }
}

function parseJson(raw: string, label: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`roster-wall artifacts: ${label} is not valid JSON (${message})`)
  }
}

function readCanonicalJson(path: string, label: string, indent: number): unknown {
  const raw = decodeUtf8Fatal(readFileSync(path), label)
  const parsed = parseJson(raw, label)
  const expected = `${rosterWallStableJson(parsed, indent)}\n`
  if (raw !== expected) {
    throw new Error(`roster-wall artifacts: ${label} is not canonical JSON with one trailing newline`)
  }
  return parsed
}

function scanCanonicalJsonl(
  path: string,
  label: string,
  onRow?: (row: unknown, index: number, canonicalLine: string) => void,
): number {
  const descriptor = openSync(path, 'r')
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const buffer = Buffer.allocUnsafe(FILE_BUFFER_BYTES)
  let pending = ''
  let count = 0
  let totalBytes = 0
  const consume = (line: string): void => {
    if (line === '') {
      throw new Error(`roster-wall artifacts: ${label} contains an empty record`)
    }
    if (line.includes('\r')) {
      throw new Error(`roster-wall artifacts: ${label} must use LF line endings`)
    }
    if (Buffer.byteLength(line, 'utf8') > ROSTER_WALL_MAX_JSONL_ROW_BYTES) {
      throw new Error(`roster-wall artifacts: ${label} contains a record larger than the governed limit`)
    }
    const parsed = parseJson(line, `${label} line ${String(count + 1)}`)
    if (line !== rosterWallStableJson(parsed)) {
      throw new Error(
        `roster-wall artifacts: ${label} line ${String(count + 1)} is not canonical JSON`,
      )
    }
    onRow?.(parsed, count, line)
    count++
  }
  try {
    while (true) {
      const read = readSync(descriptor, buffer, 0, buffer.length, null)
      if (read === 0) break
      totalBytes += read
      pending += decoder.decode(buffer.subarray(0, read), { stream: true })
      let newline = pending.indexOf('\n')
      while (newline >= 0) {
        consume(pending.slice(0, newline))
        pending = pending.slice(newline + 1)
        newline = pending.indexOf('\n')
      }
      if (Buffer.byteLength(pending, 'utf8') > ROSTER_WALL_MAX_JSONL_ROW_BYTES) {
        throw new Error(`roster-wall artifacts: ${label} contains a record larger than the governed limit`)
      }
    }
    pending += decoder.decode()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`roster-wall artifacts: ${label} is not valid UTF-8`)
    }
    throw error
  } finally {
    closeSync(descriptor)
  }
  if (pending !== '') {
    throw new Error(`roster-wall artifacts: ${label} must end with one LF newline`)
  }
  if (totalBytes === 0) return 0
  return count
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const SHA256_PATTERN = /^[a-f0-9]{64}$/
const GIT_OBJECT_PATTERN = /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/
const ACCEPTED_COMMON_ENVELOPE_KEYS = [
  'schemaVersion',
  'recordType',
  'mode',
  'experimentId',
  'seedSetId',
  'seed',
  'operatingPolicyId',
  'estatePolicyId',
  'foundingTermPolicyId',
  'continuationPolicyId',
  'horizonWeeks',
  'source',
  'initialSaveHash',
  'entryId',
  'entryWeek',
  'entrySaveHash',
  'entryStateHash',
  'week',
] as const

const ACCEPTED_MODES = [
  'current',
  'player-policy',
  'reference-shadow',
  'mechanics-fixture',
] as const
type RosterWallAcceptedMode = (typeof ACCEPTED_MODES)[number]

type RosterWallAcceptedEnvelopeFact = {
  schemaVersion: typeof ROSTER_WALL_ACCEPTED_SCHEMA_VERSION
  recordType: RosterWallAcceptedRecordType
  mode: RosterWallAcceptedMode
  experimentId: typeof ROSTER_WALL_ACCEPTED_EXPERIMENT_ID
  seedSetId: typeof ROSTER_WALL_ACCEPTED_SEED_SET_ID
  seed: string | null
  operatingPolicyId: string | null
  estatePolicyId: string | null
  foundingTermPolicyId: string | null
  continuationPolicyId: string | null
  horizonWeeks: number | null
  source: RosterWallSourceProvenance
  initialSaveHash: string | null
  entryId: string | null
  entryWeek: number | null
  entrySaveHash: string | null
  entryStateHash: string | null
  week: number | null
}

type RosterWallAcceptedEntryFact = RosterWallAcceptedEnvelopeFact & {
  canonicalLine: string
}

function sameCanonicalValue(left: unknown, right: unknown): boolean {
  return rosterWallStableJson(left) === rosterWallStableJson(right)
}

function assertExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
  label: string,
): void {
  const actual = Object.keys(value).sort(compareText)
  const sortedExpected = [...expected].sort(compareText)
  if (!sameCanonicalValue(actual, sortedExpected)) {
    throw new Error(`roster-wall artifacts: ${label} has missing or extra fields`)
  }
}

function requireNonNegativeSafeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new Error(`roster-wall artifacts: ${label} must be a non-negative safe integer`)
  }
  return value as number
}

function requireNullableNonNegativeSafeInteger(
  value: unknown,
  label: string,
): number | null {
  return value === null ? null : requireNonNegativeSafeInteger(value, label)
}

function requireNullableSha256(value: unknown, label: string): string | null {
  if (value === null) return null
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) {
    throw new Error(`roster-wall artifacts: ${label} must be null or a SHA-256 digest`)
  }
  return value
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`roster-wall artifacts: ${label} must be an object`)
  }
  return value
}

function requireArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`roster-wall artifacts: ${label} must be an array`)
  }
  return value
}

function requireFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`roster-wall artifacts: ${label} must be a finite number`)
  }
  return value
}

function requireBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`roster-wall artifacts: ${label} must be boolean`)
  }
  return value
}

function requireNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`roster-wall artifacts: ${label} must be non-empty text`)
  }
  return value
}

function requireSha256(value: unknown, label: string): string {
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) {
    throw new Error(`roster-wall artifacts: ${label} must be a SHA-256 digest`)
  }
  return value
}

function requireStringArray(value: unknown, label: string): string[] {
  return requireArray(value, label).map((item, index) =>
    requireNonEmptyString(item, `${label}[${String(index)}]`),
  )
}

function requireSortedUniqueStringArray(value: unknown, label: string): string[] {
  const strings = requireStringArray(value, label)
  const canonical = [...new Set(strings)].sort(compareText)
  if (!sameCanonicalValue(strings, canonical)) {
    throw new Error(`roster-wall artifacts: ${label} must be sorted and unique`)
  }
  return strings
}

function requireRoleCoverage(value: unknown, label: string): void {
  const coverage = requireRecord(value, label)
  for (const role of ['actor', 'director', 'writer', 'craft']) {
    requireNonNegativeSafeInteger(coverage[role], `${label}.${role}`)
  }
}

function requirePlayerRoleCoverage(value: unknown, label: string): void {
  const coverage = requireRecord(value, label)
  const counts = requireRecord(coverage['counts'], `${label}.counts`)
  requireRoleCoverage(counts, `${label}.counts`)
  const minimums = requireRecord(coverage['minimums'], `${label}.minimums`)
  requireRoleCoverage(minimums, `${label}.minimums`)
  const missingRoles = requireStringArray(coverage['missingRoles'], `${label}.missingRoles`)
  const retainedOwners = requireNonNegativeSafeInteger(
    coverage['retainedOwners'],
    `${label}.retainedOwners`,
  )
  const satisfies = requireBoolean(
    coverage['satisfiesFoundingMinimums'],
    `${label}.satisfiesFoundingMinimums`,
  )
  const expectedMissing = (['actor', 'director', 'writer', 'craft'] as const).filter(
    (role) => (counts[role] as number) < FOUNDING_MINIMUMS[role],
  )
  const countTotal = (['actor', 'director', 'writer', 'craft'] as const).reduce(
    (sum, role) => sum + (counts[role] as number),
    0,
  )
  if (
    !sameCanonicalValue(minimums, FOUNDING_MINIMUMS) ||
    !sameCanonicalValue(missingRoles, expectedMissing) ||
    retainedOwners !== countTotal ||
    satisfies !== (expectedMissing.length === 0)
  ) {
    throw new Error(`roster-wall artifacts: ${label} derived role-coverage facts disagree`)
  }
}

function requireLedgerRows(value: unknown, label: string): Array<Record<string, unknown>> {
  return requireArray(value, label).map((item, index) => {
    const row = requireRecord(item, `${label}[${String(index)}]`)
    requireNonNegativeSafeInteger(row['week'], `${label}[${String(index)}].week`)
    requireNonEmptyString(row['kind'], `${label}[${String(index)}].kind`)
    requireFiniteNumber(row['amount'], `${label}[${String(index)}].amount`)
    requireNonEmptyString(row['note'], `${label}[${String(index)}].note`)
    return row
  })
}

function ledgerOutflow(rows: readonly Record<string, unknown>[], kind: string): number {
  let total = 0
  for (const row of rows) {
    if (row['kind'] === kind) total -= row['amount'] as number
  }
  return total
}

function assertReceiptReconciliation(
  value: unknown,
  receiptRows: readonly Record<string, unknown>[],
  label: string,
): void {
  const receipt = requireRecord(value, label)
  const existing = requireFiniteNumber(
    receipt['scheduledExistingReceipts'],
    `${label}.scheduledExistingReceipts`,
  )
  const opening = requireFiniteNumber(
    receipt['scheduledOpeningReceipts'],
    `${label}.scheduledOpeningReceipts`,
  )
  const scheduled = requireFiniteNumber(receipt['scheduledTotal'], `${label}.scheduledTotal`)
  const ledgerTotal = requireFiniteNumber(receipt['ledgerTotal'], `${label}.ledgerTotal`)
  const rowCount = requireNonNegativeSafeInteger(receipt['ledgerRowCount'], `${label}.ledgerRowCount`)
  const delta = requireFiniteNumber(receipt['delta'], `${label}.delta`)
  const exactLedger = receiptRows.reduce((total, row) => total + (row['amount'] as number), 0)
  if (
    scheduled !== existing + opening ||
    ledgerTotal !== exactLedger ||
    rowCount !== receiptRows.length ||
    delta !== 0 ||
    scheduled !== ledgerTotal
  ) {
    throw new Error(`roster-wall artifacts: ${label} does not reconcile scheduled receipts`)
  }
}

function assertCashReconciliation(value: unknown, label: string): void {
  const cash = requireRecord(value, label)
  if (Object.prototype.hasOwnProperty.call(cash, 'delta')) {
    const expected = requireFiniteNumber(cash['expectedCash'], `${label}.expectedCash`)
    const actual = requireFiniteNumber(cash['actualCash'], `${label}.actualCash`)
    const delta = requireFiniteNumber(cash['delta'], `${label}.delta`)
    requireFiniteNumber(cash['initialCash'], `${label}.initialCash`)
    requireFiniteNumber(cash['fullLedgerTotal'], `${label}.fullLedgerTotal`)
    requireFiniteNumber(cash['suffixLedgerTotal'], `${label}.suffixLedgerTotal`)
    requireNonNegativeSafeInteger(cash['ledgerLength'], `${label}.ledgerLength`)
    if (delta !== 0 || actual !== expected) {
      throw new Error(`roster-wall artifacts: ${label} does not reconcile exactly`)
    }
    return
  }
  const expected = requireFiniteNumber(cash['expectedCash'], `${label}.expectedCash`)
  const actual = requireFiniteNumber(cash['actualCash'], `${label}.actualCash`)
  const residual = requireFiniteNumber(cash['residual'], `${label}.residual`)
  requireNonNegativeSafeInteger(cash['ledgerStart'], `${label}.ledgerStart`)
  requireFiniteNumber(cash['openingCash'], `${label}.openingCash`)
  requireFiniteNumber(cash['reconciledLedgerAmount'], `${label}.reconciledLedgerAmount`)
  if (cash['exact'] !== true || residual !== 0 || actual !== expected) {
    throw new Error(`roster-wall artifacts: ${label} does not reconcile exactly`)
  }
}

function requireStringFrom(
  value: unknown,
  allowed: readonly string[],
  label: string,
): string {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new Error(`roster-wall artifacts: ${label} is not a governed identifier`)
  }
  return value
}

function requireNullableStringFrom(
  value: unknown,
  allowed: readonly string[],
  label: string,
): string | null {
  return value === null ? null : requireStringFrom(value, allowed, label)
}

function parseAcceptedSource(value: unknown, label: string): RosterWallSourceProvenance {
  if (!isRecord(value)) {
    throw new Error(`roster-wall artifacts: ${label} is not a source object`)
  }
  assertExactKeys(
    value,
    [
      'branch',
      'commit',
      'tree',
      'worktreeDirty',
      'runtime',
      'saveVersion',
      'productionAuthorityCommit',
      'productionAuthorityTree',
      'authorityDiffPaths',
    ],
    label,
  )
  if (
    value['branch'] !== ROSTER_WALL_EXPECTED_BRANCH ||
    typeof value['commit'] !== 'string' ||
    !GIT_OBJECT_PATTERN.test(value['commit']) ||
    typeof value['tree'] !== 'string' ||
    !GIT_OBJECT_PATTERN.test(value['tree']) ||
    value['worktreeDirty'] !== false ||
    typeof value['runtime'] !== 'string' ||
    value['runtime'].length === 0 ||
    value['saveVersion'] !== 11 ||
    value['productionAuthorityCommit'] !== ROSTER_WALL_PRODUCTION_AUTHORITY ||
    value['productionAuthorityTree'] !== ROSTER_WALL_PRODUCTION_AUTHORITY_TREE ||
    !Array.isArray(value['authorityDiffPaths'])
  ) {
    throw new Error(`roster-wall artifacts: ${label} is not accepted clean SaveFileV17 provenance`)
  }
  const authorityDiffPaths = value['authorityDiffPaths']
  if (
    authorityDiffPaths.some(
      (path) =>
        typeof path !== 'string' ||
        path === '' ||
        path.startsWith('/') ||
        path.startsWith('../') ||
        path.includes('/../') ||
        path.includes('\\') ||
        !['docs/', 'src/harness/', 'tests/'].some((prefix) => path.startsWith(prefix)),
    ) ||
    authorityDiffPaths.some(
      (path, index) =>
        index > 0 && compareText(authorityDiffPaths[index - 1] as string, path as string) >= 0,
    )
  ) {
    throw new Error(`roster-wall artifacts: ${label} has unsafe or unordered authority diff paths`)
  }
  return {
    branch: value['branch'],
    commit: value['commit'],
    tree: value['tree'],
    worktreeDirty: false,
    runtime: value['runtime'],
    saveVersion: 17,
    productionAuthorityCommit: value['productionAuthorityCommit'],
    productionAuthorityTree: value['productionAuthorityTree'],
    authorityDiffPaths: [...authorityDiffPaths] as string[],
  }
}

function canonicalSeeds(profile: RosterWallArtifactProfile): string[] {
  const count = profile === 'complete' ? 25 : 1
  return Array.from(
    { length: count },
    (_, index) => `facilities-${String(index + 1).padStart(4, '0')}`,
  )
}

/** The only accepted smoke/complete matrix under the frozen Rev. 1 contract. */
export function rosterWallAcceptedArtifactMatrix(
  profile: RosterWallArtifactProfile,
): RosterWallAcceptedArtifactMatrix {
  const seeds = canonicalSeeds(profile)
  const maximumTermEntries = seeds.length * 3 * 2
  const playerPolicyEntries = seeds.length * 3
  const maximumTermWeeklyRows = maximumTermEntries * (7 * 64 + 3 * 232)
  const playerPolicyWeeklyRows = playerPolicyEntries * 428
  return {
    canonicalSeeds: seeds,
    operatingPolicyIds: [...ROSTER_WALL_ACCEPTED_OPERATING_POLICY_IDS],
    estatePolicyIds: [...ROSTER_WALL_ACCEPTED_ESTATE_POLICY_IDS],
    foundingTermPolicyIds: [...ROSTER_WALL_ACCEPTED_FOUNDING_TERM_POLICY_IDS],
    continuationPolicyIds: [...ROSTER_WALL_ACCEPTED_CONTINUATION_POLICY_IDS],
    entryWeek: 196,
    primaryHorizonWeeks: 260,
    recurrenceHorizonWeeks: 428,
    playerPolicyHorizonWeeks: 428,
    pairEstatePolicyId: 'vacant',
    maximumTermEntries,
    playerPolicyEntries,
    totalEntries: maximumTermEntries + playerPolicyEntries,
    maximumTermWeeklyRows,
    playerPolicyWeeklyRows,
    weeklyRows: maximumTermWeeklyRows + playerPolicyWeeklyRows,
    windowShadowRows: maximumTermEntries * 3,
    // Mixed-term and Annex feedback remain descriptive and do not enter the
    // exact-entry paired table. Vacant maximum-term entries have six primary
    // comparisons and two governed Week-428 comparisons against C1.
    pairRows: seeds.length * 3 * 8,
    mechanicsFixtureRows: 168,
  }
}

function parseAcceptedCounts(
  value: unknown,
  label: string,
): RosterWallAcceptedArtifactCounts {
  if (!isRecord(value)) {
    throw new Error(`roster-wall artifacts: ${label} is not a counts object`)
  }
  assertExactKeys(value, ['entries', 'rows', 'recordTypes'], label)
  if (!isRecord(value['recordTypes'])) {
    throw new Error(`roster-wall artifacts: ${label}.recordTypes is not an object`)
  }
  assertExactKeys(value['recordTypes'], ROSTER_WALL_ACCEPTED_RECORD_TYPES, `${label}.recordTypes`)
  const recordTypes = Object.create(null) as RosterWallAcceptedRecordTypeCounts
  for (const recordType of ROSTER_WALL_ACCEPTED_RECORD_TYPES) {
    recordTypes[recordType] = requireNonNegativeSafeInteger(
      value['recordTypes'][recordType],
      `${label}.recordTypes.${recordType}`,
    )
  }
  const entries = requireNonNegativeSafeInteger(value['entries'], `${label}.entries`)
  const rows = requireNonNegativeSafeInteger(value['rows'], `${label}.rows`)
  const recordTotal = ROSTER_WALL_ACCEPTED_RECORD_TYPES.reduce(
    (total, recordType) => total + recordTypes[recordType],
    0,
  )
  if (recordTypes.entry !== entries || recordTotal !== rows) {
    throw new Error(`roster-wall artifacts: ${label} totals do not reconcile`)
  }
  return { entries, rows, recordTypes: { ...recordTypes } }
}

function parseAcceptedMatrix(
  value: unknown,
  profile: RosterWallArtifactProfile,
  label: string,
): RosterWallAcceptedArtifactMatrix {
  if (!isRecord(value)) {
    throw new Error(`roster-wall artifacts: ${label} is not a matrix object`)
  }
  const expected = rosterWallAcceptedArtifactMatrix(profile)
  assertExactKeys(value, Object.keys(expected), label)
  if (!sameCanonicalValue(value, expected)) {
    throw new Error(`roster-wall artifacts: ${label} is not the frozen ${profile} matrix`)
  }
  return structuredClone(expected)
}

function parseAcceptedEntryIndex(
  value: unknown,
  label: string,
): RosterWallAcceptedEntryIndexRow[] {
  if (!Array.isArray(value)) {
    throw new Error(`roster-wall artifacts: ${label} is not an entry index`)
  }
  return value.map((item, index) => {
    const itemLabel = `${label}[${String(index)}]`
    if (!isRecord(item)) {
      throw new Error(`roster-wall artifacts: ${itemLabel} is not an object`)
    }
    assertExactKeys(
      item,
      [
        'entryId',
        'mode',
        'seed',
        'operatingPolicyId',
        'estatePolicyId',
        'foundingTermPolicyId',
        'initialSaveHash',
        'entrySaveHash',
        'entryStateHash',
      ],
      itemLabel,
    )
    if (
      typeof item['entryId'] !== 'string' ||
      (item['mode'] !== 'current' && item['mode'] !== 'player-policy') ||
      typeof item['seed'] !== 'string' ||
      typeof item['operatingPolicyId'] !== 'string' ||
      typeof item['estatePolicyId'] !== 'string' ||
      typeof item['foundingTermPolicyId'] !== 'string' ||
      typeof item['initialSaveHash'] !== 'string' ||
      !SHA256_PATTERN.test(item['initialSaveHash']) ||
      typeof item['entrySaveHash'] !== 'string' ||
      !SHA256_PATTERN.test(item['entrySaveHash']) ||
      typeof item['entryStateHash'] !== 'string' ||
      !SHA256_PATTERN.test(item['entryStateHash'])
    ) {
      throw new Error(`roster-wall artifacts: ${itemLabel} has invalid entry identity`)
    }
    validateRosterWallEntryId(item['entryId'])
    return {
      entryId: item['entryId'],
      mode: item['mode'],
      seed: item['seed'],
      operatingPolicyId: item['operatingPolicyId'],
      estatePolicyId: item['estatePolicyId'],
      foundingTermPolicyId: item['foundingTermPolicyId'],
      initialSaveHash: item['initialSaveHash'],
      entrySaveHash: item['entrySaveHash'],
      entryStateHash: item['entryStateHash'],
    }
  })
}

function parseAcceptedAcceptanceChecks(
  value: unknown,
  matrix: RosterWallAcceptedArtifactMatrix,
  label: string,
): RosterWallAcceptedAcceptanceChecks {
  const checks = requireRecord(value, label)
  assertExactKeys(
    checks,
    [
      'entryObserverNeutrality',
      'continuationObserverNeutrality',
      'playerPolicyObserverNeutrality',
    ],
    label,
  )
  const parseGroup = (
    raw: unknown,
    keys: readonly [string, string, string, string],
    expected: number,
    groupLabel: string,
  ): Record<string, number> => {
    const group = requireRecord(raw, groupLabel)
    assertExactKeys(group, [...keys, 'failures'], groupLabel)
    const result: Record<string, number> = {}
    for (const key of keys) {
      result[key] = requireNonNegativeSafeInteger(group[key], `${groupLabel}.${key}`)
    }
    if (
      result[keys[0]] !== expected ||
      result[keys[1]] !== expected ||
      result[keys[2]] !== expected ||
      result[keys[3]] !== expected ||
      group['failures'] !== 0
    ) {
      throw new Error(`roster-wall artifacts: ${groupLabel} does not prove exact observer neutrality`)
    }
    return { ...result, failures: 0 }
  }
  const entry = parseGroup(
    checks['entryObserverNeutrality'],
    ['checkedEntries', 'byteIdenticalEntries', 'stateHashIdenticalEntries', 'rngStateIdenticalEntries'],
    matrix.maximumTermEntries,
    `${label}.entryObserverNeutrality`,
  )
  const continuation = parseGroup(
    checks['continuationObserverNeutrality'],
    ['checkedArms', 'byteIdenticalArms', 'stateHashIdenticalArms', 'rngStateIdenticalArms'],
    matrix.maximumTermEntries * 10,
    `${label}.continuationObserverNeutrality`,
  )
  const player = parseGroup(
    checks['playerPolicyObserverNeutrality'],
    ['checkedRuns', 'byteIdenticalRuns', 'stateHashIdenticalRuns', 'rngStateIdenticalRuns'],
    matrix.playerPolicyEntries,
    `${label}.playerPolicyObserverNeutrality`,
  )
  return {
    entryObserverNeutrality: entry as RosterWallAcceptedAcceptanceChecks['entryObserverNeutrality'],
    continuationObserverNeutrality:
      continuation as RosterWallAcceptedAcceptanceChecks['continuationObserverNeutrality'],
    playerPolicyObserverNeutrality:
      player as RosterWallAcceptedAcceptanceChecks['playerPolicyObserverNeutrality'],
  }
}

function assertGovernanceFields(value: Record<string, unknown>, label: string): {
  profile: RosterWallArtifactProfile
  completeEvidence: boolean
  source: RosterWallSourceProvenance
  matrix: RosterWallAcceptedArtifactMatrix
  counts: RosterWallAcceptedArtifactCounts
} {
  for (const key of [
    'schemaVersion',
    'experimentId',
    'seedSetId',
    'profile',
    'completeEvidence',
    'source',
    'matrix',
    'counts',
    'invariantFailures',
  ]) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      throw new Error(`roster-wall artifacts: ${label} lacks governed field ${key}`)
    }
  }
  if (
    value['schemaVersion'] !== ROSTER_WALL_ACCEPTED_SCHEMA_VERSION ||
    value['experimentId'] !== ROSTER_WALL_ACCEPTED_EXPERIMENT_ID ||
    value['seedSetId'] !== ROSTER_WALL_ACCEPTED_SEED_SET_ID ||
    (value['profile'] !== 'smoke' && value['profile'] !== 'complete') ||
    typeof value['completeEvidence'] !== 'boolean' ||
    value['completeEvidence'] !== (value['profile'] === 'complete') ||
    value['invariantFailures'] !== 0
  ) {
    throw new Error(`roster-wall artifacts: ${label} is not an accepted governed envelope`)
  }
  const profile = value['profile']
  return {
    profile,
    completeEvidence: value['completeEvidence'],
    source: parseAcceptedSource(value['source'], `${label}.source`),
    matrix: parseAcceptedMatrix(value['matrix'], profile, `${label}.matrix`),
    counts: parseAcceptedCounts(value['counts'], `${label}.counts`),
  }
}

function parseAcceptedManifest(value: unknown): RosterWallAcceptedArtifactManifest {
  if (!isRecord(value)) {
    throw new Error('roster-wall artifacts: manifest.json is not an object')
  }
  const governed = assertGovernanceFields(value, 'manifest.json')
  const entryIndex = parseAcceptedEntryIndex(value['entryIndex'], 'manifest.json.entryIndex')
  const acceptanceChecks = parseAcceptedAcceptanceChecks(
    value['acceptanceChecks'],
    governed.matrix,
    'manifest.json.acceptanceChecks',
  )
  return {
    schemaVersion: ROSTER_WALL_ACCEPTED_SCHEMA_VERSION,
    experimentId: ROSTER_WALL_ACCEPTED_EXPERIMENT_ID,
    seedSetId: ROSTER_WALL_ACCEPTED_SEED_SET_ID,
    profile: governed.profile,
    completeEvidence: governed.completeEvidence,
    source: governed.source,
    matrix: governed.matrix,
    counts: governed.counts,
    entryIndex,
    acceptanceChecks,
    invariantFailures: 0,
  }
}

function parseAcceptedSummary(value: unknown): RosterWallAcceptedArtifactSummary {
  if (!isRecord(value)) {
    throw new Error('roster-wall artifacts: summary.json is not an object')
  }
  const governed = assertGovernanceFields(value, 'summary.json')
  return validateRosterWallResearchSummary(value, {
    schemaVersion: ROSTER_WALL_ACCEPTED_SCHEMA_VERSION,
    experimentId: ROSTER_WALL_ACCEPTED_EXPERIMENT_ID,
    seedSetId: ROSTER_WALL_ACCEPTED_SEED_SET_ID,
    profile: governed.profile,
    completeEvidence: governed.completeEvidence,
    source: governed.source,
    matrix: governed.matrix,
    counts: governed.counts,
  })
}

function assertAcceptedCommonEnvelope(
  row: unknown,
  label: string,
  source: RosterWallSourceProvenance,
): RosterWallAcceptedEnvelopeFact {
  if (!isRecord(row)) {
    throw new Error(`roster-wall artifacts: ${label} is not an evidence object`)
  }
  for (const key of ACCEPTED_COMMON_ENVELOPE_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(row, key)) {
      throw new Error(`roster-wall artifacts: ${label} omits explicit dimension ${key}`)
    }
  }
  if (
    row['schemaVersion'] !== ROSTER_WALL_ACCEPTED_SCHEMA_VERSION ||
    row['experimentId'] !== ROSTER_WALL_ACCEPTED_EXPERIMENT_ID ||
    row['seedSetId'] !== ROSTER_WALL_ACCEPTED_SEED_SET_ID
  ) {
    throw new Error(`roster-wall artifacts: ${label} has the wrong evidence authority`)
  }
  const recordType = requireStringFrom(
    row['recordType'],
    ROSTER_WALL_ACCEPTED_RECORD_TYPES,
    `${label}.recordType`,
  ) as RosterWallAcceptedRecordType
  const mode = requireStringFrom(row['mode'], ACCEPTED_MODES, `${label}.mode`) as RosterWallAcceptedMode
  const parsedSource = parseAcceptedSource(row['source'], `${label}.source`)
  if (!sameCanonicalValue(parsedSource, source)) {
    throw new Error(`roster-wall artifacts: ${label}.source disagrees with manifest.json`)
  }
  const seed = row['seed'] === null
    ? null
    : typeof row['seed'] === 'string' && row['seed'].length > 0
      ? row['seed']
      : undefined
  if (seed === undefined) {
    throw new Error(`roster-wall artifacts: ${label}.seed must be null or non-empty text`)
  }
  const entryId = row['entryId'] === null
    ? null
    : typeof row['entryId'] === 'string'
      ? validateRosterWallEntryId(row['entryId'])
      : undefined
  if (entryId === undefined) {
    throw new Error(`roster-wall artifacts: ${label}.entryId must be null or a governed ID`)
  }
  return {
    schemaVersion: ROSTER_WALL_ACCEPTED_SCHEMA_VERSION,
    recordType,
    mode,
    experimentId: ROSTER_WALL_ACCEPTED_EXPERIMENT_ID,
    seedSetId: ROSTER_WALL_ACCEPTED_SEED_SET_ID,
    seed,
    operatingPolicyId: requireNullableStringFrom(
      row['operatingPolicyId'],
      ROSTER_WALL_ACCEPTED_OPERATING_POLICY_IDS,
      `${label}.operatingPolicyId`,
    ),
    estatePolicyId: requireNullableStringFrom(
      row['estatePolicyId'],
      ROSTER_WALL_ACCEPTED_ESTATE_POLICY_IDS,
      `${label}.estatePolicyId`,
    ),
    foundingTermPolicyId: requireNullableStringFrom(
      row['foundingTermPolicyId'],
      ROSTER_WALL_ACCEPTED_FOUNDING_TERM_POLICY_IDS,
      `${label}.foundingTermPolicyId`,
    ),
    continuationPolicyId: requireNullableStringFrom(
      row['continuationPolicyId'],
      ROSTER_WALL_ACCEPTED_CONTINUATION_POLICY_IDS,
      `${label}.continuationPolicyId`,
    ),
    horizonWeeks: requireNullableNonNegativeSafeInteger(
      row['horizonWeeks'],
      `${label}.horizonWeeks`,
    ),
    source: parsedSource,
    initialSaveHash: requireNullableSha256(row['initialSaveHash'], `${label}.initialSaveHash`),
    entryId,
    entryWeek: requireNullableNonNegativeSafeInteger(row['entryWeek'], `${label}.entryWeek`),
    entrySaveHash: requireNullableSha256(row['entrySaveHash'], `${label}.entrySaveHash`),
    entryStateHash: requireNullableSha256(row['entryStateHash'], `${label}.entryStateHash`),
    week: requireNullableNonNegativeSafeInteger(row['week'], `${label}.week`),
  }
}

function parseInventory(value: unknown): RosterWallSha256Inventory {
  if (!isRecord(value) || value['algorithm'] !== 'sha256' || !Array.isArray(value['files'])) {
    throw new Error('roster-wall artifacts: sha256.json has an invalid envelope')
  }
  const files: RosterWallSha256Entry[] = value['files'].map((entry, index) => {
    if (
      !isRecord(entry) ||
      typeof entry['path'] !== 'string' ||
      !Number.isSafeInteger(entry['bytes']) ||
      (entry['bytes'] as number) < 0 ||
      typeof entry['sha256'] !== 'string' ||
      !/^[a-f0-9]{64}$/.test(entry['sha256'])
    ) {
      throw new Error(
        `roster-wall artifacts: sha256.json file ${String(index + 1)} is invalid`,
      )
    }
    const path = entry['path']
    if (
      path === '' ||
      path === 'sha256.json' ||
      path.startsWith('/') ||
      path.startsWith('../') ||
      path.includes('/../') ||
      path.includes('\\')
    ) {
      throw new Error(`roster-wall artifacts: sha256.json contains unsafe path ${path}`)
    }
    return { path, bytes: entry['bytes'] as number, sha256: entry['sha256'] }
  })
  if (
    files.some(
      (entry, index) => index > 0 && compareText(files[index - 1]!.path, entry.path) >= 0,
    )
  ) {
    throw new Error('roster-wall artifacts: sha256.json paths are duplicate or not sorted')
  }
  return { algorithm: 'sha256', files }
}

function expectedEntrySavePath(entryId: string): string {
  return `entries/${entryId}.save.json`
}

function assertEntryIndex(
  rows: readonly RosterWallEntryIndexFact[],
  inventory: RosterWallSha256Inventory,
): void {
  const saveEntries = inventory.files.filter(
    (entry) => entry.path.startsWith('entries/') && entry.path.endsWith('.save.json'),
  )
  const seen = new Set<string>()
  const indexedPaths: string[] = []
  for (const row of rows) {
    const entryId = validateRosterWallEntryId(row.entryId)
    if (seen.has(entryId)) {
      throw new Error(`roster-wall artifacts: entries.jsonl repeats entryId ${entryId}`)
    }
    seen.add(entryId)
    const path = expectedEntrySavePath(entryId)
    indexedPaths.push(path)
    const save = saveEntries.find((entry) => entry.path === path)
    if (save === undefined) {
      throw new Error(`roster-wall artifacts: entries.jsonl references missing save ${path}`)
    }
    if (row.entrySaveHash !== null && row.entrySaveHash !== save.sha256) {
      throw new Error(`roster-wall artifacts: entrySaveHash disagrees for ${entryId}`)
    }
  }
  if (
    rosterWallStableJson([...indexedPaths].sort(compareText)) !==
    rosterWallStableJson(saveEntries.map((entry) => entry.path).sort(compareText))
  ) {
    throw new Error('roster-wall artifacts: entry saves and entries.jsonl are not one-to-one')
  }
}

function assertCanonicalEntrySaves(
  directory: string,
  inventory: RosterWallSha256Inventory,
): void {
  for (const entry of inventory.files.filter(
    (candidate) =>
      candidate.path.startsWith('entries/') && candidate.path.endsWith('.save.json'),
  )) {
    const path = join(directory, ...entry.path.split('/'))
    const raw = decodeUtf8Fatal(readFileSync(path), entry.path)
    const parsed = parseJson(raw, entry.path)
    if (raw !== rosterWallStableJson(parsed)) {
      throw new Error(
        `roster-wall artifacts: ${entry.path} must be compact canonical JSON without a trailing newline`,
      )
    }
    assertExactSaveV11(raw, entry.path)
  }
}

function assertExactSaveV11(saveJson: string, label: string): void {
  const imported = importSave(saveJson)
  if (imported.saveVersion !== 17) {
    throw new Error(`roster-wall artifacts: ${label} must be an exact SaveFileV17`)
  }
  const replay = exportSave(imported)
  if (replay !== saveJson) {
    throw new Error(
      `roster-wall artifacts: ${label} is not byte-identical after import/re-export`,
    )
  }
}

function assertFlatEntrySaveDirectory(entriesDirectory: string): void {
  for (const name of readdirSync(entriesDirectory).sort(compareText)) {
    const path = join(entriesDirectory, name)
    const info = lstatSync(path)
    if (info.isSymbolicLink() || !info.isFile() || !name.endsWith('.save.json')) {
      throw new Error(
        `roster-wall artifacts: entries contains a non-canonical save path ${name}`,
      )
    }
    validateRosterWallEntryId(name.slice(0, -'.save.json'.length))
  }
}

function existingGovernedPaths(repoRoot: string, runName: string): RosterWallArtifactPaths {
  const root = canonicalRepoRoot(repoRoot)
  const directory = governedRunDirectory(root, runName)
  rejectSymlinkComponents(root, directory)
  if (!existsSync(directory) || !lstatSync(directory).isDirectory()) {
    throw new Error(`roster-wall artifacts: artifact directory does not exist: ${directory}`)
  }
  const canonicalDirectory = realpathSync(directory)
  const outputRoot = resolve(root, ROSTER_WALL_OUTPUT_RELATIVE)
  if (!canonicalDirectory.startsWith(`${outputRoot}${sep}`)) {
    throw new Error('roster-wall artifacts: canonical artifact escaped the governed root')
  }
  return artifactPaths(directory)
}

/** Strictly verify file set, canonical bytes, entry index, and recursive digest inventory. */
export function verifyRosterWallArtifactDirectory(
  repoRoot: string,
  runName: string,
): RosterWallArtifactVerification {
  const paths = existingGovernedPaths(repoRoot, runName)
  const topLevel = readdirSync(paths.directory).sort(compareText)
  if (rosterWallStableJson(topLevel) !== rosterWallStableJson([...REQUIRED_TOP_LEVEL].sort(compareText))) {
    throw new Error('roster-wall artifacts: artifact has missing or extra top-level paths')
  }
  if (!lstatSync(paths.entriesDirectory).isDirectory()) {
    throw new Error('roster-wall artifacts: entries must be a directory')
  }
  assertFlatEntrySaveDirectory(paths.entriesDirectory)

  readCanonicalJson(paths.manifest, 'manifest.json', 2)
  const entryRows: RosterWallEntryIndexFact[] = []
  const entryCount = scanCanonicalJsonl(paths.entries, 'entries.jsonl', (row, index) => {
    if (!isRecord(row) || typeof row['entryId'] !== 'string') {
      throw new Error(
        `roster-wall artifacts: entries.jsonl row ${String(index + 1)} lacks entryId`,
      )
    }
    entryRows.push({
      entryId: row['entryId'],
      entrySaveHash: typeof row['entrySaveHash'] === 'string' ? row['entrySaveHash'] : null,
    })
  })
  const rowCount = scanCanonicalJsonl(paths.rows, 'rows.jsonl')
  readCanonicalJson(paths.summary, 'summary.json', 2)
  const markdown = decodeUtf8Fatal(readFileSync(paths.markdown), 'summary.md')
  if (markdown.includes('\r') || !markdown.endsWith('\n')) {
    throw new Error('roster-wall artifacts: summary.md must use LF and end with one newline')
  }

  const recordedInventory = parseInventory(readCanonicalJson(paths.sha256, 'sha256.json', 2))
  const computedInventory = inventoryRosterWallArtifactDirectory(
    paths.directory,
    new Set(['sha256.json']),
  )
  if (rosterWallStableJson(recordedInventory) !== rosterWallStableJson(computedInventory)) {
    throw new Error('roster-wall artifacts: sha256.json does not match artifact bytes')
  }
  assertCanonicalEntrySaves(paths.directory, computedInventory)
  assertEntryIndex(entryRows, computedInventory)

  return {
    paths,
    inventory: computedInventory,
    entryCount,
    rowCount,
    files: [...computedInventory.files.map((entry) => entry.path), 'sha256.json'].sort(compareText),
  }
}

type ExpectedAcceptedEntry = {
  entryId: string
  mode: 'current' | 'player-policy'
  seed: string
  operatingPolicyId: string
  estatePolicyId: string
  foundingTermPolicyId: string
}

function acceptedExpectedEntries(
  matrix: RosterWallAcceptedArtifactMatrix,
): ExpectedAcceptedEntry[] {
  const entries: ExpectedAcceptedEntry[] = []
  for (const seed of matrix.canonicalSeeds) {
    for (const operatingPolicyId of matrix.operatingPolicyIds) {
      for (const estatePolicyId of matrix.estatePolicyIds) {
        entries.push({
          entryId: `maximum.${seed}.${operatingPolicyId}.${estatePolicyId}.all-208`,
          mode: 'current',
          seed,
          operatingPolicyId,
          estatePolicyId,
          foundingTermPolicyId: 'all-208',
        })
      }
    }
  }
  for (const seed of matrix.canonicalSeeds) {
    for (const operatingPolicyId of matrix.operatingPolicyIds) {
      entries.push({
        entryId: `player.${seed}.${operatingPolicyId}.vacant.round-robin-mixed`,
        mode: 'player-policy',
        seed,
        operatingPolicyId,
        estatePolicyId: 'vacant',
        foundingTermPolicyId: 'round-robin-mixed',
      })
    }
  }
  return entries
}

function assertAcceptedEntryDimensions(
  fact: RosterWallAcceptedEnvelopeFact,
  expected: ExpectedAcceptedEntry,
  label: string,
): void {
  if (
    fact.recordType !== 'entry' ||
    fact.mode !== expected.mode ||
    fact.entryId !== expected.entryId ||
    fact.seed !== expected.seed ||
    fact.operatingPolicyId !== expected.operatingPolicyId ||
    fact.estatePolicyId !== expected.estatePolicyId ||
    fact.foundingTermPolicyId !== expected.foundingTermPolicyId ||
    fact.entryWeek !== 196 ||
    fact.week !== 196 ||
    fact.initialSaveHash === null ||
    fact.entrySaveHash === null ||
    fact.entryStateHash === null
  ) {
    throw new Error(`roster-wall artifacts: ${label} is outside the frozen entry matrix`)
  }
  if (
    expected.mode === 'current'
      ? fact.continuationPolicyId !== null || fact.horizonWeeks !== null
      : fact.continuationPolicyId !== 'C1-current-retry-all' || fact.horizonWeeks !== 428
  ) {
    throw new Error(`roster-wall artifacts: ${label} has incompatible entry dimensions`)
  }
}

function assertAcceptedEntryPayload(
  row: Record<string, unknown>,
  fact: RosterWallAcceptedEnvelopeFact,
  label: string,
  state?: GameState,
): void {
  if (row['entryFileSha256'] !== fact.entrySaveHash) {
    throw new Error(`roster-wall artifacts: ${label}.entryFileSha256 disagrees with its save`)
  }
  const cohort = requireArray(row['cohort'], `${label}.cohort`)
  const cash = requireFiniteNumber(row['cash'], `${label}.cash`)
  const rngState = requireNonEmptyString(row['rngState'], `${label}.rngState`)
  requireBoolean(row['economyEngagedEver'], `${label}.economyEngagedEver`)
  assertCashReconciliation(row['cashReconciliation'], `${label}.cashReconciliation`)
  const ledger = requireLedgerRows(row['ledger'], `${label}.ledger`)
  const activeReceipts = requireRecord(row['activeReceipts'], `${label}.activeReceipts`)
  requireFiniteNumber(activeReceipts['expectedThisWeek'], `${label}.activeReceipts.expectedThisWeek`)
  requireArray(activeReceipts['theatricalRuns'], `${label}.activeReceipts.theatricalRuns`)
  const commitments = requireRecord(row['activeCommitments'], `${label}.activeCommitments`)
  requireArray(commitments['productions'], `${label}.activeCommitments.productions`)
  requireArray(commitments['screenplayProjects'], `${label}.activeCommitments.screenplayProjects`)
  requireArray(commitments['castingSessions'], `${label}.activeCommitments.castingSessions`)
  requireRecord(row['construction'], `${label}.construction`)
  requireArray(row['operationsFacilities'], `${label}.operationsFacilities`)
  if (fact.mode === 'player-policy') {
    requirePlayerRoleCoverage(row['roleCoverage'], `${label}.roleCoverage`)
    if (
      row['evidenceLabel'] !== 'descriptive-after-policy-feedback' ||
      row['pairingEligible'] !== false ||
      row['causalClaim'] !== null
    ) {
      throw new Error(`roster-wall artifacts: ${label} mislabels descriptive player-policy evidence`)
    }
  } else {
    requireRoleCoverage(row['roleCoverage'], `${label}.roleCoverage`)
  }
  const replay = requireRecord(row['replay'], `${label}.replay`)
  const replayExact = fact.mode === 'player-policy'
    ? replay['importedSaveVersion'] === 11 &&
      replay['importReexportByteIdentical'] === true &&
      replay['remadeReexportByteIdentical'] === true &&
      replay['freshContinuationImportStateHash'] === fact.entryStateHash &&
      replay['freshContinuationImportMatchesEntry'] === true
    : replay['importedSaveVersion'] === 11 &&
      replay['importedReexportByteIdentical'] === true &&
      replay['remadeReexportByteIdentical'] === true
  if (!replayExact) {
    throw new Error(`roster-wall artifacts: ${label} lacks exact SaveFileV14 replay proof`)
  }
  if (state === undefined) return

  const activeContracts = state.contracts
    .filter(
      (contract) =>
        contract.startWeek <= state.market.tick && state.market.tick < contract.endWeekExclusive,
    )
    .sort((a, b) => compareText(a.talentId, b.talentId))
  const expectedCohort = activeContracts.map((contract) => {
    const talent = state.talent.find((candidate) => candidate.id === contract.talentId)
    if (talent === undefined) {
      throw new Error(`roster-wall artifacts: ${label} save has a contract for unknown talent`)
    }
    return {
      talentId: contract.talentId,
      role: talent.role,
      startWeek: contract.startWeek,
      endWeekExclusive: contract.endWeekExclusive,
      termWeeks: contract.termWeeks,
      annualSalary: contract.annualSalary,
      weeklySalary: weeklySalary(contract.annualSalary),
      signingBonus: contract.signingBonus,
      renewalQuote208: contractOffer(state, contract.talentId, 208),
    }
  })
  const expectedRoleCoverage = { actor: 0, director: 0, writer: 0, craft: 0 }
  for (const member of expectedCohort) expectedRoleCoverage[member.role]++
  const projectedCoverage = fact.mode === 'player-policy'
    ? requireRecord(row['roleCoverage'], `${label}.roleCoverage`)['counts']
    : row['roleCoverage']
  const expectedProductions = structuredClone(state.studio.activeProductions)
  const expectedScreenplayProjects = structuredClone(
    state.scriptDevelopment.projects.filter((project) => project.status !== 'produced'),
  )
  const expectedCastingSessions = structuredClone(state.castingSessions.sessions)
  const expectedConstruction = structuredClone(state.construction)
  const expectedOperationsFacilities = structuredClone(state.operations.facilities)
  if (fact.mode === 'player-policy') {
    expectedProductions.sort((a, b) => compareText(a.id, b.id))
    expectedScreenplayProjects.sort((a, b) => compareText(a.id, b.id))
    expectedCastingSessions.sort((a, b) => compareText(a.id, b.id))
    expectedConstruction.parcels.sort((a, b) => compareText(a.id, b.id))
    expectedConstruction.projects.sort((a, b) => compareText(a.id, b.id))
    expectedOperationsFacilities.sort((a, b) => compareText(a.id, b.id))
  }
  if (
    !sameCanonicalValue(cohort, expectedCohort) ||
    cash !== state.studio.cash ||
    rngState !== state.rngState ||
    row['economyEngagedEver'] !== state.economyEngagedEver ||
    !sameCanonicalValue(ledger, state.ledger) ||
    !sameCanonicalValue(row['cashLedgerCheckpoint'], state.cashLedgerCheckpoint ?? null) ||
    activeReceipts['expectedThisWeek'] !== expectedWeeklyRunRevenue(state) ||
    !sameCanonicalValue(activeReceipts['theatricalRuns'], state.theatricalRuns
      .filter((run) => run.status === 'active')
      .sort((a, b) => compareText(a.productionId, b.productionId))) ||
    !sameCanonicalValue(commitments['productions'], expectedProductions) ||
    !sameCanonicalValue(commitments['screenplayProjects'], expectedScreenplayProjects) ||
    !sameCanonicalValue(commitments['castingSessions'], expectedCastingSessions) ||
    !sameCanonicalValue(row['construction'], expectedConstruction) ||
    !sameCanonicalValue(row['operationsFacilities'], expectedOperationsFacilities) ||
    !sameCanonicalValue(projectedCoverage, expectedRoleCoverage)
  ) {
    throw new Error(`roster-wall artifacts: ${label} projection disagrees with its exact Week-196 save`)
  }
}

function acceptedEntryIndexProjection(
  fact: RosterWallAcceptedEnvelopeFact,
): RosterWallAcceptedEntryIndexRow {
  if (
    fact.mode !== 'current' &&
    fact.mode !== 'player-policy'
  ) {
    throw new Error('roster-wall artifacts: entry index received a non-entry mode')
  }
  return {
    entryId: fact.entryId!,
    mode: fact.mode,
    seed: fact.seed!,
    operatingPolicyId: fact.operatingPolicyId!,
    estatePolicyId: fact.estatePolicyId!,
    foundingTermPolicyId: fact.foundingTermPolicyId!,
    initialSaveHash: fact.initialSaveHash!,
    entrySaveHash: fact.entrySaveHash!,
    entryStateHash: fact.entryStateHash!,
  }
}

function requireAcceptedCampaignIdentity(
  fact: RosterWallAcceptedEnvelopeFact,
  matrix: RosterWallAcceptedArtifactMatrix,
  label: string,
): void {
  if (
    fact.seed === null ||
    !matrix.canonicalSeeds.includes(fact.seed) ||
    fact.operatingPolicyId === null ||
    fact.entryId === null ||
    fact.entryWeek !== 196 ||
    fact.initialSaveHash === null ||
    fact.entrySaveHash === null ||
    fact.entryStateHash === null ||
    fact.week === null
  ) {
    throw new Error(`roster-wall artifacts: ${label} lacks exact campaign identity`)
  }
}

function requireFields(
  row: Record<string, unknown>,
  fields: readonly string[],
  label: string,
): void {
  const missing = fields.filter((field) => !Object.prototype.hasOwnProperty.call(row, field))
  if (missing.length > 0) {
    throw new Error(`roster-wall artifacts: ${label} omits required fields ${missing.join(', ')}`)
  }
}

function assertRenewalIntentPayload(row: Record<string, unknown>, label: string): void {
  requireFields(
    row,
    [
      'intentId', 'contractKey', 'talentId', 'role', 'targetWeek', 'actualWeek', 'orderRank',
      'selectedTerm', 'offer', 'preActionCash', 'affordable', 'accepted', 'rejectionReason',
      'postActionCash', 'signingBonusLedgerIndex', 'signingBonusLedgerEntry', 'rngBefore', 'rngAfter',
    ],
    label,
  )
  requireNonEmptyString(row['intentId'], `${label}.intentId`)
  requireNonEmptyString(row['contractKey'], `${label}.contractKey`)
  const talentId = requireNonEmptyString(row['talentId'], `${label}.talentId`)
  requireStringFrom(row['role'], ['actor', 'director', 'writer', 'craft'], `${label}.role`)
  const actualWeek = requireNonNegativeSafeInteger(row['actualWeek'], `${label}.actualWeek`)
  if (row['targetWeek'] !== null) {
    requireNonNegativeSafeInteger(row['targetWeek'], `${label}.targetWeek`)
  }
  requireNonNegativeSafeInteger(row['orderRank'], `${label}.orderRank`)
  const selectedTerm = requireStringFrom(
    String(row['selectedTerm']),
    ['52', '104', '156', '208'],
    `${label}.selectedTerm`,
  )
  const selectedTermNumber = Number(selectedTerm)
  const offer = requireRecord(row['offer'], `${label}.offer`)
  requireFields(
    offer,
    ['talentId', 'annualSalary', 'signingBonus', 'termWeeks', 'startWeek', 'endWeekExclusive'],
    `${label}.offer`,
  )
  const signingBonus = requireNonNegativeSafeInteger(
    offer['signingBonus'],
    `${label}.offer.signingBonus`,
  )
  requireNonNegativeSafeInteger(offer['annualSalary'], `${label}.offer.annualSalary`)
  const preActionCash = requireFiniteNumber(row['preActionCash'], `${label}.preActionCash`)
  const postActionCash = requireFiniteNumber(row['postActionCash'], `${label}.postActionCash`)
  const affordable = requireBoolean(row['affordable'], `${label}.affordable`)
  const accepted = requireBoolean(row['accepted'], `${label}.accepted`)
  const rngBefore = requireNonEmptyString(row['rngBefore'], `${label}.rngBefore`)
  const rngAfter = requireNonEmptyString(row['rngAfter'], `${label}.rngAfter`)
  if (
    offer['talentId'] !== talentId ||
    offer['termWeeks'] !== selectedTermNumber ||
    offer['startWeek'] !== actualWeek ||
    offer['endWeekExclusive'] !== actualWeek + selectedTermNumber ||
    rngBefore !== rngAfter
  ) {
    throw new Error(`roster-wall artifacts: ${label} offer or RNG invariant failed`)
  }
  if (accepted) {
    const ledgerIndex = requireNonNegativeSafeInteger(
      row['signingBonusLedgerIndex'],
      `${label}.signingBonusLedgerIndex`,
    )
    const ledger = requireRecord(row['signingBonusLedgerEntry'], `${label}.signingBonusLedgerEntry`)
    requireLedgerRows([ledger], `${label}.signingBonusLedgerEntry`)
    if (
      !affordable ||
      row['rejectionReason'] !== null ||
      ledgerIndex < 0 ||
      ledger['kind'] !== 'signingBonus' ||
      ledger['talentId'] !== talentId ||
      ledger['week'] !== actualWeek ||
      ledger['amount'] !== -signingBonus ||
      postActionCash !== preActionCash - signingBonus
    ) {
      throw new Error(`roster-wall artifacts: ${label} accepted-renewal accounting failed`)
    }
  } else if (
    typeof row['rejectionReason'] !== 'string' ||
    row['rejectionReason'].length === 0 ||
    affordable !== false ||
    row['signingBonusLedgerIndex'] !== null ||
    row['signingBonusLedgerEntry'] !== null ||
    postActionCash !== preActionCash
  ) {
    throw new Error(`roster-wall artifacts: ${label} rejected-renewal accounting failed`)
  }
}

function assertCurrentWeeklyPayload(row: Record<string, unknown>, label: string): void {
  requireFields(
    row,
    [
      'arrivalWeek', 'stateHashBefore', 'stateHashAfterRenewals', 'stateHashAfterActions',
      'stateHashAfterTick', 'rngBefore', 'rngAfterRenewals', 'rngAfterActions', 'rngAfterTick',
      'cashBefore', 'cashAfterRenewals', 'cashAfterActions', 'cashAfterTick',
      'cashReconciliationBefore', 'cashReconciliationAfter', 'activeContractTalentIds',
      'roleCoverage', 'missingFoundingRoles', 'renewalOpenOwnerIds',
      'renewalOpenOwners', 'quotedRenewalObligation208', 'renewalPressure', 'renewalIntentIds',
      'scheduledPayroll', 'ledgerPayroll',
      'scheduledOverhead', 'ledgerOverhead', 'signingBonusRows', 'theatricalReceiptRows',
      'theatricalReceiptReconciliation',
      'transitionLedgerRows', 'operatingIntents', 'packageStaffabilityBlockers',
      'packageAffordabilityBlockers', 'activeProductions', 'activeTheatricalReceipts',
      'screenplayProjects', 'castingSessions', 'readyScreenplays', 'packageReadyScreenplays',
      'freeAgentIdsInStateOrder',
      'construction', 'economyEngagedEver', 'absorbingNoDecisionState', 'absorbingProbeReason',
    ],
    label,
  )
  for (const key of ['stateHashBefore', 'stateHashAfterRenewals', 'stateHashAfterActions', 'stateHashAfterTick']) {
    requireSha256(row[key], `${label}.${key}`)
  }
  for (const key of ['rngBefore', 'rngAfterRenewals', 'rngAfterActions', 'rngAfterTick']) {
    requireNonEmptyString(row[key], `${label}.${key}`)
  }
  if (row['rngBefore'] !== row['rngAfterRenewals']) {
    throw new Error(`roster-wall artifacts: ${label} renewal observation consumed RNG`)
  }
  for (const key of ['cashBefore', 'cashAfterRenewals', 'cashAfterActions', 'cashAfterTick']) {
    requireFiniteNumber(row[key], `${label}.${key}`)
  }
  assertCashReconciliation(row['cashReconciliationBefore'], `${label}.cashReconciliationBefore`)
  assertCashReconciliation(row['cashReconciliationAfter'], `${label}.cashReconciliationAfter`)
  const roleCoverage = requireRecord(row['roleCoverage'], `${label}.roleCoverage`)
  requireRoleCoverage(roleCoverage, `${label}.roleCoverage`)
  const activeContractTalentIds = requireSortedUniqueStringArray(
    row['activeContractTalentIds'],
    `${label}.activeContractTalentIds`,
  )
  for (const key of [
    'missingFoundingRoles', 'renewalOpenOwnerIds', 'renewalIntentIds',
    'freeAgentIdsInStateOrder',
  ]) requireStringArray(row[key], `${label}.${key}`)
  const coverageTotal = (['actor', 'director', 'writer', 'craft'] as const).reduce(
    (sum, role) => sum + (roleCoverage[role] as number),
    0,
  )
  if (coverageTotal !== activeContractTalentIds.length) {
    throw new Error(`roster-wall artifacts: ${label} active contracts disagree with role coverage`)
  }
  const renewalOpenOwners = requireArray(
    row['renewalOpenOwners'],
    `${label}.renewalOpenOwners`,
  ).map((value, index) => {
    const owner = requireRecord(value, `${label}.renewalOpenOwners[${String(index)}]`)
    requireFields(owner, ['contractKey', 'talentId', 'signingBonus'], `${label}.renewalOpenOwners[${String(index)}]`)
    const contractKey = requireNonEmptyString(owner['contractKey'], `${label}.renewalOpenOwners.contractKey`)
    const talentId = requireNonEmptyString(owner['talentId'], `${label}.renewalOpenOwners.talentId`)
    const signingBonus = requireNonNegativeSafeInteger(owner['signingBonus'], `${label}.renewalOpenOwners.signingBonus`)
    if (parseRosterWallContractKey(contractKey, `${label}.renewalOpenOwners.contractKey`).talentId !== talentId) {
      throw new Error(`roster-wall artifacts: ${label} renewal-open owner key disagrees`)
    }
    const parsed = parseRosterWallContractKey(contractKey, `${label}.renewalOpenOwners.contractKey`)
    return { contractKey, talentId, signingBonus, endWeekExclusive: parsed.endWeekExclusive }
  })
  const renewalOpenOwnerIds = requireStringArray(
    row['renewalOpenOwnerIds'],
    `${label}.renewalOpenOwnerIds`,
  )
  const quotedRenewalObligation = requireFiniteNumber(
    row['quotedRenewalObligation208'],
    `${label}.quotedRenewalObligation208`,
  )
  if (
    !sameCanonicalValue(renewalOpenOwnerIds, renewalOpenOwners.map((owner) => owner.talentId)) ||
    !sameCanonicalValue(
      renewalOpenOwners,
      [...renewalOpenOwners].sort(
        (left, right) =>
          left.endWeekExclusive - right.endWeekExclusive ||
          compareText(left.talentId, right.talentId),
      ),
    ) ||
    quotedRenewalObligation !== renewalOpenOwners.reduce((sum, owner) => sum + owner.signingBonus, 0) ||
    new Set(renewalOpenOwners.map((owner) => owner.contractKey)).size !== renewalOpenOwners.length
  ) {
    throw new Error(`roster-wall artifacts: ${label} renewal-open projections disagree`)
  }
  for (const key of [
    'activeProductions', 'activeTheatricalReceipts', 'screenplayProjects', 'castingSessions',
    'readyScreenplays', 'packageReadyScreenplays',
  ]) requireNonNegativeSafeInteger(row[key], `${label}.${key}`)
  const ledger = requireLedgerRows(row['transitionLedgerRows'], `${label}.transitionLedgerRows`)
  const signingRows = requireLedgerRows(row['signingBonusRows'], `${label}.signingBonusRows`)
  const receiptRows = requireLedgerRows(row['theatricalReceiptRows'], `${label}.theatricalReceiptRows`)
  const expectedSigning = ledger.filter((entry) => entry['kind'] === 'signingBonus')
  const expectedReceipts = ledger.filter(
    (entry) => entry['kind'] === 'studioRevenue' || entry['kind'] === 'boxOffice',
  )
  assertReceiptReconciliation(
    row['theatricalReceiptReconciliation'],
    receiptRows,
    `${label}.theatricalReceiptReconciliation`,
  )
  const scheduledPayroll = requireFiniteNumber(row['scheduledPayroll'], `${label}.scheduledPayroll`)
  const ledgerPayroll = requireFiniteNumber(row['ledgerPayroll'], `${label}.ledgerPayroll`)
  const scheduledOverhead = requireFiniteNumber(row['scheduledOverhead'], `${label}.scheduledOverhead`)
  const ledgerOverhead = requireFiniteNumber(row['ledgerOverhead'], `${label}.ledgerOverhead`)
  if (
    scheduledPayroll !== ledgerPayroll ||
    ledgerPayroll !== ledgerOutflow(ledger, 'payroll') ||
    scheduledOverhead !== ledgerOverhead ||
    ledgerOverhead !== ledgerOutflow(ledger, 'overhead') ||
    !sameCanonicalValue(signingRows, expectedSigning) ||
    !sameCanonicalValue(receiptRows, expectedReceipts) ||
    row['economyEngagedEver'] !== true ||
    row['absorbingNoDecisionState'] !== false
  ) {
    throw new Error(`roster-wall artifacts: ${label} weekly accounting invariant failed`)
  }
  requireRecord(row['construction'], `${label}.construction`)
  for (const key of ['operatingIntents', 'packageStaffabilityBlockers', 'packageAffordabilityBlockers']) {
    requireArray(row[key], `${label}.${key}`)
  }
}

function assertPlayerWeeklyPayload(row: Record<string, unknown>, label: string): void {
  requireFields(
    row,
    [
      'evidenceLabel', 'startStateHash', 'startRngState', 'startCash', 'stateHashAfterRenewals',
      'rngAfterRenewals', 'cashAfterRenewals', 'stateHashAfterActions', 'rngAfterActions',
      'cashAfterActions', 'renewalOpenContractKeys', 'renewalOpenTalentIds',
      'quotedSigningBonusObligation208', 'renewalIntentIds', 'activeContractTalentIds',
      'operatingIntents', 'appendedLedger',
      'scheduledPayroll', 'ledgerPayroll', 'scheduledOverhead', 'ledgerOverhead',
      'signingBonusRows', 'theatricalReceiptRows', 'theatricalReceiptReconciliation',
      'packageStaffabilityBlockers',
      'packageAffordabilityBlockers', 'arrivalWeek', 'arrivalStateHash', 'arrivalRngState',
      'arrivalCash', 'arrivalRoleCoverage', 'operations',
    ],
    label,
  )
  if (row['evidenceLabel'] !== 'descriptive-after-policy-feedback') {
    throw new Error(`roster-wall artifacts: ${label} lacks the descriptive evidence label`)
  }
  for (const key of ['startStateHash', 'stateHashAfterRenewals', 'stateHashAfterActions', 'arrivalStateHash']) {
    requireSha256(row[key], `${label}.${key}`)
  }
  for (const key of ['startRngState', 'rngAfterRenewals', 'rngAfterActions', 'arrivalRngState']) {
    requireNonEmptyString(row[key], `${label}.${key}`)
  }
  if (row['startRngState'] !== row['rngAfterRenewals']) {
    throw new Error(`roster-wall artifacts: ${label} renewal observation consumed RNG`)
  }
  for (const key of ['startCash', 'cashAfterRenewals', 'cashAfterActions', 'arrivalCash']) {
    assertCashReconciliation(row[key], `${label}.${key}`)
  }
  const ledger = requireLedgerRows(row['appendedLedger'], `${label}.appendedLedger`)
  const signingRows = requireLedgerRows(row['signingBonusRows'], `${label}.signingBonusRows`)
  const receiptRows = requireLedgerRows(row['theatricalReceiptRows'], `${label}.theatricalReceiptRows`)
  assertReceiptReconciliation(
    row['theatricalReceiptReconciliation'],
    receiptRows,
    `${label}.theatricalReceiptReconciliation`,
  )
  const scheduledPayroll = requireFiniteNumber(row['scheduledPayroll'], `${label}.scheduledPayroll`)
  const ledgerPayroll = requireFiniteNumber(row['ledgerPayroll'], `${label}.ledgerPayroll`)
  const scheduledOverhead = requireFiniteNumber(row['scheduledOverhead'], `${label}.scheduledOverhead`)
  const ledgerOverhead = requireFiniteNumber(row['ledgerOverhead'], `${label}.ledgerOverhead`)
  if (
    scheduledPayroll !== ledgerPayroll ||
    ledgerPayroll !== ledgerOutflow(ledger, 'payroll') ||
    scheduledOverhead !== ledgerOverhead ||
    ledgerOverhead !== ledgerOutflow(ledger, 'overhead') ||
    !sameCanonicalValue(signingRows, ledger.filter((entry) => entry['kind'] === 'signingBonus')) ||
    !sameCanonicalValue(
      receiptRows,
      ledger.filter((entry) => entry['kind'] === 'studioRevenue' || entry['kind'] === 'boxOffice'),
    )
  ) {
    throw new Error(`roster-wall artifacts: ${label} weekly accounting invariant failed`)
  }
  for (const key of [
    'renewalOpenContractKeys', 'renewalOpenTalentIds', 'renewalIntentIds',
  ]) requireStringArray(row[key], `${label}.${key}`)
  const activeContractTalentIds = requireSortedUniqueStringArray(
    row['activeContractTalentIds'],
    `${label}.activeContractTalentIds`,
  )
  for (const key of [
    'operatingIntents', 'packageStaffabilityBlockers', 'packageAffordabilityBlockers',
  ]) requireArray(row[key], `${label}.${key}`)
  requirePlayerRoleCoverage(row['arrivalRoleCoverage'], `${label}.arrivalRoleCoverage`)
  const operations = requireRecord(row['operations'], `${label}.operations`)
  requireFields(
    operations,
    [
      'activeContractTalentIds', 'activeContractKeys', 'construction',
      'operationsFacilities', 'freeAgentIdsInStateOrder', 'activeTheatricalReceipts',
      'activeReceiptProductionIds', 'expectedWeeklyRunRevenue', 'activeProductions',
      'activeProductionIds', 'screenplayProjects', 'activeScreenplayProjectIds',
      'castingSessions', 'activeCastingSessionIds', 'readyPackageProxyCount',
      'readyPackageProxyProjectIds', 'readyPackageProxyBasis',
    ],
    `${label}.operations`,
  )
  const projectedActiveContractTalentIds = requireSortedUniqueStringArray(
    operations['activeContractTalentIds'],
    `${label}.operations.activeContractTalentIds`,
  )
  const arrivalRoleCoverage = requireRecord(
    row['arrivalRoleCoverage'],
    `${label}.arrivalRoleCoverage`,
  )
  for (const key of [
    'activeContractKeys', 'freeAgentIdsInStateOrder', 'activeReceiptProductionIds',
    'activeProductionIds', 'activeScreenplayProjectIds', 'activeCastingSessionIds',
    'readyPackageProxyProjectIds',
  ]) requireStringArray(operations[key], `${label}.operations.${key}`)
  for (const key of [
    'activeTheatricalReceipts', 'activeProductions', 'screenplayProjects',
    'castingSessions', 'readyPackageProxyCount',
  ]) requireNonNegativeSafeInteger(operations[key], `${label}.operations.${key}`)
  requireFiniteNumber(
    operations['expectedWeeklyRunRevenue'],
    `${label}.operations.expectedWeeklyRunRevenue`,
  )
  requireRecord(operations['construction'], `${label}.operations.construction`)
  requireArray(operations['operationsFacilities'], `${label}.operations.operationsFacilities`)
  if (
    !sameCanonicalValue(activeContractTalentIds, projectedActiveContractTalentIds) ||
    arrivalRoleCoverage['retainedOwners'] !== activeContractTalentIds.length ||
    operations['activeTheatricalReceipts'] !==
      (operations['activeReceiptProductionIds'] as unknown[]).length ||
    operations['activeProductions'] !== (operations['activeProductionIds'] as unknown[]).length ||
    (operations['screenplayProjects'] as number) <
      (operations['activeScreenplayProjectIds'] as unknown[]).length ||
    (operations['castingSessions'] as number) <
      (operations['activeCastingSessionIds'] as unknown[]).length ||
    operations['readyPackageProxyCount'] !==
      (operations['readyPackageProxyProjectIds'] as unknown[]).length ||
    operations['readyPackageProxyBasis'] !== 'ready-screenplay-projects'
  ) {
    throw new Error(`roster-wall artifacts: ${label} active-contract projection disagrees`)
  }
}

function assertShadowPayload(row: Record<string, unknown>, fact: RosterWallAcceptedEnvelopeFact, label: string): void {
  const warning = requireRecord(row['warning'], `${label}.warning`)
  requireFields(
    warning,
    [
      'week', 'warningRelation', 'expiryWeek', 'weeksToExpiry', 'actionLegal', 'owners',
      'aggregateAllRenewalSigningBonus', 'allRenewalsAffordableNow', 'minimumRoleCoverage',
      'cash', 'weeklyPayroll', 'weeklyOverhead', 'weeklyBurn', 'expectedWeeklyRunRevenue',
      'runwayWeeks', 'runwayInfinite', 'activeCommitments', 'noActionStateHashBefore',
      'noActionStateHashAfter', 'rngBefore', 'rngAfter', 'observationConsumedRng',
    ],
    `${label}.warning`,
  )
  const expectedRelation = fact.week === 156
    ? 'warning-52'
    : fact.week === 182
      ? 'warning-26'
      : 'window-arrival'
  if (
    warning['week'] !== fact.week ||
    warning['warningRelation'] !== expectedRelation ||
    warning['expiryWeek'] !== 208 ||
    warning['weeksToExpiry'] !== 208 - fact.week! ||
    warning['actionLegal'] !== (fact.week === 196) ||
    warning['observationConsumedRng'] !== false ||
    warning['noActionStateHashBefore'] !== warning['noActionStateHashAfter'] ||
    warning['rngBefore'] !== warning['rngAfter']
  ) {
    throw new Error(`roster-wall artifacts: ${label} read-only shadow invariant failed`)
  }
  requireSha256(warning['noActionStateHashBefore'], `${label}.warning.noActionStateHashBefore`)
  requireNonEmptyString(warning['rngBefore'], `${label}.warning.rngBefore`)
  for (const key of [
    'aggregateAllRenewalSigningBonus', 'cash', 'weeklyPayroll', 'weeklyOverhead',
    'weeklyBurn', 'expectedWeeklyRunRevenue',
  ]) requireFiniteNumber(warning[key], `${label}.warning.${key}`)
  requireBoolean(
    warning['allRenewalsAffordableNow'],
    `${label}.warning.allRenewalsAffordableNow`,
  )
  if (warning['runwayWeeks'] !== null) {
    requireFiniteNumber(warning['runwayWeeks'], `${label}.warning.runwayWeeks`)
  }
  requireBoolean(warning['runwayInfinite'], `${label}.warning.runwayInfinite`)
  requireArray(warning['owners'], `${label}.warning.owners`)
  requireRecord(warning['minimumRoleCoverage'], `${label}.warning.minimumRoleCoverage`)
  requireRecord(warning['activeCommitments'], `${label}.warning.activeCommitments`)
}

type RosterWallShadowEntryAuthority = {
  state: GameState
  laterFeasibility: ReadonlyMap<string, number | null>
}

function deriveShadowEntryAuthority(
  state: GameState,
  operatingPolicyId: string,
): RosterWallShadowEntryAuthority {
  const originalContracts = state.contracts
    .filter((contract) => contract.startWeek === 0 && contract.endWeekExclusive === 208)
    .sort((left, right) => compareText(left.talentId, right.talentId))
  const laterFeasibility = new Map<string, number | null>(
    originalContracts.map((contract) => [contract.talentId, null]),
  )
  let replay = structuredClone(state)
  while (replay.market.tick < 208) {
    for (const original of originalContracts) {
      if (laterFeasibility.get(original.talentId) !== null) continue
      const live = replay.contracts.find(
        (contract) =>
          contract.talentId === original.talentId &&
          contract.startWeek === original.startWeek &&
          contract.endWeekExclusive === original.endWeekExclusive,
      )
      if (live === undefined || !renewalWindowOpen(live, replay.market.tick)) continue
      const quote = contractOffer(replay, live.talentId, 208)
      if (canAfford(replay, quote.signingBonus).ok) {
        laterFeasibility.set(live.talentId, replay.market.tick)
      }
    }
    replay = runRosterWallOperatingWeek({
      state: replay,
      operatingPolicyId: operatingPolicyId as RosterWallOperatingPolicyId,
      captureIntents: false,
    }).stateAfterTick
  }
  return { state, laterFeasibility }
}

function minimumShadowCoverage(
  owners: readonly Record<string, unknown>[],
): { talentIds: string[]; signingBonus: number; missingRoles: string[] } {
  let bestIds: string[] | null = null
  let bestCost = Number.POSITIVE_INFINITY
  const combinations = 2 ** owners.length
  for (let mask = 0; mask < combinations; mask++) {
    const counts = { actor: 0, director: 0, writer: 0, craft: 0 }
    const ids: string[] = []
    let cost = 0
    for (let index = 0; index < owners.length; index++) {
      if ((mask & 2 ** index) === 0) continue
      const owner = owners[index]!
      const role = requireStringFrom(
        owner['role'],
        ['actor', 'director', 'writer', 'craft'],
        'shadow owner role',
      ) as keyof typeof counts
      counts[role]++
      ids.push(requireNonEmptyString(owner['talentId'], 'shadow owner talentId'))
      cost += requireFiniteNumber(
        requireRecord(owner['quote'], 'shadow owner quote')['signingBonus'],
        'shadow owner quote.signingBonus',
      )
    }
    const missing = (['actor', 'director', 'writer', 'craft'] as const).filter(
      (role) => counts[role] < FOUNDING_MINIMUMS[role],
    )
    if (missing.length > 0) continue
    ids.sort(compareText)
    const key = ids.join('|')
    const priorKey = bestIds?.join('|') ?? ''
    if (cost < bestCost || (cost === bestCost && (bestIds === null || key < priorKey))) {
      bestIds = ids
      bestCost = cost
    }
  }
  if (bestIds === null) {
    const counts = { actor: 0, director: 0, writer: 0, craft: 0 }
    for (const owner of owners) {
      const role = requireStringFrom(
        owner['role'],
        ['actor', 'director', 'writer', 'craft'],
        'shadow owner role',
      ) as keyof typeof counts
      counts[role]++
    }
    return {
      talentIds: [],
      signingBonus: 0,
      missingRoles: (['actor', 'director', 'writer', 'craft'] as const).filter(
        (role) => counts[role] < FOUNDING_MINIMUMS[role],
      ),
    }
  }
  return { talentIds: bestIds, signingBonus: bestCost, missingRoles: [] }
}

function assertShadowAgainstEntry(
  row: Record<string, unknown>,
  fact: RosterWallAcceptedEnvelopeFact,
  authority: RosterWallShadowEntryAuthority,
  label: string,
): void {
  const warning = requireRecord(row['warning'], `${label}.warning`)
  const owners = requireArray(warning['owners'], `${label}.warning.owners`).map(
    (value, index) => requireRecord(value, `${label}.warning.owners[${String(index)}]`),
  )
  const contracts = authority.state.contracts
    .filter((contract) => contract.startWeek === 0 && contract.endWeekExclusive === 208)
    .sort((left, right) => compareText(left.talentId, right.talentId))
  const expectedOwners = contracts.map((contract) => {
    const talent = authority.state.talent.find((candidate) => candidate.id === contract.talentId)
    if (talent === undefined) {
      throw new Error(`roster-wall artifacts: ${label} entry contract references unknown talent`)
    }
    const quote = contractOffer(authority.state, contract.talentId, 208, fact.week!)
    return {
      talentId: contract.talentId,
      role: talent.role,
      contractStartWeek: contract.startWeek,
      contractEndWeekExclusive: contract.endWeekExclusive,
      renewalWindowOpen: renewalWindowOpen(contract, fact.week!),
      quote,
      affordableNow: (warning['cash'] as number) - quote.signingBonus >= 0,
      earliestLaterLegalFeasibleWeek:
        authority.laterFeasibility.get(contract.talentId) ?? null,
    }
  })
  const ownerIds = owners.map((owner, index) =>
    requireNonEmptyString(owner['talentId'], `${label}.warning.owners[${String(index)}].talentId`),
  )
  if (
    !sameCanonicalValue(owners, expectedOwners) ||
    !sameCanonicalValue(ownerIds, [...ownerIds].sort(compareText)) ||
    new Set(ownerIds).size !== ownerIds.length
  ) {
    throw new Error(`roster-wall artifacts: ${label} shadow owners disagree with its immutable entry`)
  }
  const cash = requireFiniteNumber(warning['cash'], `${label}.warning.cash`)
  const aggregate = expectedOwners.reduce((sum, owner) => sum + owner.quote.signingBonus, 0)
  const minimum = minimumShadowCoverage(owners)
  const minimumPayload = requireRecord(
    warning['minimumRoleCoverage'],
    `${label}.warning.minimumRoleCoverage`,
  )
  const expectedMinimum = {
    ...minimum,
    affordableNow: minimum.missingRoles.length === 0 && cash - minimum.signingBonus >= 0,
  }
  const payroll = requireFiniteNumber(warning['weeklyPayroll'], `${label}.warning.weeklyPayroll`)
  const overhead = requireFiniteNumber(warning['weeklyOverhead'], `${label}.warning.weeklyOverhead`)
  const burn = requireFiniteNumber(warning['weeklyBurn'], `${label}.warning.weeklyBurn`)
  const revenue = requireFiniteNumber(
    warning['expectedWeeklyRunRevenue'],
    `${label}.warning.expectedWeeklyRunRevenue`,
  )
  const netBurn = burn - revenue
  const expectedInfinite = netBurn <= 1e-9
  const expectedRunway = expectedInfinite ? null : Math.floor(cash / netBurn)
  if (
    warning['aggregateAllRenewalSigningBonus'] !== aggregate ||
    warning['allRenewalsAffordableNow'] !== (cash - aggregate >= 0) ||
    !sameCanonicalValue(minimumPayload, expectedMinimum) ||
    burn !== payroll + overhead ||
    warning['runwayInfinite'] !== expectedInfinite ||
    warning['runwayWeeks'] !== expectedRunway ||
    (fact.week === 196 &&
      (cash !== authority.state.studio.cash ||
        warning['noActionStateHashBefore'] !== fact.entryStateHash ||
        warning['rngBefore'] !== authority.state.rngState))
  ) {
    throw new Error(`roster-wall artifacts: ${label} derived shadow facts do not reconcile`)
  }
}

function assertBoundaryPayload(
  row: Record<string, unknown>,
  fact: RosterWallAcceptedEnvelopeFact,
  label: string,
): void {
  if (fact.mode === 'player-policy') {
    requireFields(
      row,
      [
        'evidenceLabel', 'relation', 'talentIds', 'contractKeys', 'roleCoverage',
        'cohortRetainedTalentIds', 'cohortReleasedTalentIds', 'cohortRoleCoverage',
        'missingFoundingRoles', 'weeklyPayroll', 'payrollDelta', 'baseOverhead',
        'baseOverheadDelta', 'employeeOverhead', 'employeeOverheadDelta',
        'totalOverhead', 'overheadDelta', 'activeTheatricalReceipts',
        'expectedWeeklyRunRevenue', 'activeProductions', 'screenplayProjects',
        'castingSessions', 'readyScreenplays', 'packageReadyScreenplays',
        'packageStaffabilityBlockers', 'packageAffordabilityBlockers',
        'transitionLedgerRows', 'cash', 'stateHash', 'rngState',
      ],
      label,
    )
    if (row['evidenceLabel'] !== 'descriptive-after-policy-feedback') {
      throw new Error(`roster-wall artifacts: ${label} lacks the descriptive evidence label`)
    }
    requireStringArray(row['talentIds'], `${label}.talentIds`)
    requireStringArray(row['contractKeys'], `${label}.contractKeys`)
    requirePlayerRoleCoverage(row['roleCoverage'], `${label}.roleCoverage`)
    requireSortedUniqueStringArray(
      row['cohortRetainedTalentIds'],
      `${label}.cohortRetainedTalentIds`,
    )
    requireSortedUniqueStringArray(
      row['cohortReleasedTalentIds'],
      `${label}.cohortReleasedTalentIds`,
    )
    requirePlayerRoleCoverage(row['cohortRoleCoverage'], `${label}.cohortRoleCoverage`)
    requireStringArray(row['missingFoundingRoles'], `${label}.missingFoundingRoles`)
    for (const key of [
      'weeklyPayroll', 'baseOverhead', 'employeeOverhead', 'totalOverhead',
      'activeTheatricalReceipts', 'expectedWeeklyRunRevenue', 'activeProductions',
      'screenplayProjects', 'castingSessions', 'readyScreenplays',
      'packageReadyScreenplays', 'packageStaffabilityBlockers',
      'packageAffordabilityBlockers',
    ]) requireFiniteNumber(row[key], `${label}.${key}`)
    for (const key of [
      'payrollDelta', 'baseOverheadDelta', 'employeeOverheadDelta', 'overheadDelta',
    ]) {
      if (row[key] !== null) requireFiniteNumber(row[key], `${label}.${key}`)
    }
    requireLedgerRows(row['transitionLedgerRows'], `${label}.transitionLedgerRows`)
    assertCashReconciliation(row['cash'], `${label}.cash`)
    const retained = row['cohortRetainedTalentIds'] as string[]
    const released = row['cohortReleasedTalentIds'] as string[]
    const cohortCoverage = requireRecord(row['cohortRoleCoverage'], `${label}.cohortRoleCoverage`)
    const missingRoles = requireStringArray(row['missingFoundingRoles'], `${label}.missingFoundingRoles`)
    const totalOverhead = row['totalOverhead'] as number
    const baseOverhead = row['baseOverhead'] as number
    const employeeOverhead = row['employeeOverhead'] as number
    const cohortMissingRoles = requireStringArray(
      cohortCoverage['missingRoles'],
      `${label}.cohortRoleCoverage.missingRoles`,
    )
    if (
      retained.some((talentId) => released.includes(talentId)) ||
      cohortCoverage['retainedOwners'] !== retained.length ||
      !sameCanonicalValue(missingRoles, cohortMissingRoles) ||
      totalOverhead !== baseOverhead + employeeOverhead ||
      (row['overheadDelta'] !== null &&
        row['overheadDelta'] !==
          (row['baseOverheadDelta'] as number) + (row['employeeOverheadDelta'] as number)) ||
      ((row['relation'] === 'window-arrival' || row['relation'] === 'recurrence-window') &&
        (row['payrollDelta'] !== null ||
          row['baseOverheadDelta'] !== null ||
          row['employeeOverheadDelta'] !== null ||
          row['overheadDelta'] !== null ||
          !sameCanonicalValue(row['transitionLedgerRows'], []) ||
          row['packageStaffabilityBlockers'] !== 0 ||
          row['packageAffordabilityBlockers'] !== 0))
    ) {
      throw new Error(`roster-wall artifacts: ${label} player boundary accounting disagrees`)
    }
  } else {
    requireFields(
      row,
      [
        'relation', 'stateHash', 'rngState', 'arrivalWeek', 'arrivalStateHash', 'arrivalRngState',
        'arrivalCashReconciliation', 'cohortRetainedTalentIds', 'cohortReleasedTalentIds',
        'cohortRoleCoverage', 'missingFoundingRoles', 'weeklyPayroll', 'payrollDelta',
        'baseOverhead', 'baseOverheadDelta', 'employeeOverhead', 'employeeOverheadDelta',
        'totalOverhead', 'overheadDelta', 'activeTheatricalReceipts', 'activeProductions',
        'screenplayProjects', 'castingSessions', 'readyScreenplays', 'packageReadyScreenplays',
        'packageStaffabilityBlockers', 'packageAffordabilityBlockers', 'transitionLedgerRows',
        'cashReconciliation',
      ],
      label,
    )
    requireStringArray(row['cohortRetainedTalentIds'], `${label}.cohortRetainedTalentIds`)
    requireStringArray(row['cohortReleasedTalentIds'], `${label}.cohortReleasedTalentIds`)
    requireRoleCoverage(row['cohortRoleCoverage'], `${label}.cohortRoleCoverage`)
    requireLedgerRows(row['transitionLedgerRows'], `${label}.transitionLedgerRows`)
    assertCashReconciliation(row['cashReconciliation'], `${label}.cashReconciliation`)
    if (row['arrivalCashReconciliation'] !== null) {
      assertCashReconciliation(row['arrivalCashReconciliation'], `${label}.arrivalCashReconciliation`)
    }
  }
  requireNonEmptyString(row['relation'], `${label}.relation`)
  requireSha256(row['stateHash'], `${label}.stateHash`)
  requireNonEmptyString(row['rngState'], `${label}.rngState`)
}

function assertFixturePayload(row: Record<string, unknown>, label: string): void {
  requireFields(
    row,
    [
      'fixtureExperimentId', 'fixtureId', 'cohortSize', 'cohortTalentIds', 'roleComposition',
      'expiryWeekExclusive', 'threshold', 'intents', 'outcome', 'finalRoleCoverage',
      'payrollOverheadLedger', 'expectedInvariants', 'actualInvariants',
    ],
    label,
  )
  requireStringArray(row['cohortTalentIds'], `${label}.cohortTalentIds`)
  requireRoleCoverage(row['roleComposition'], `${label}.roleComposition`)
  const threshold = requireRecord(row['threshold'], `${label}.threshold`)
  requireFields(
    threshold,
    ['thresholdId', 'applicability', 'applicable', 'value', 'referenceAmount', 'adjustment', 'basisTalentIds', 'basisOffers', 'missingRoles'],
    `${label}.threshold`,
  )
  const actual = requireRecord(row['actualInvariants'], `${label}.actualInvariants`)
  const expected = requireRecord(row['expectedInvariants'], `${label}.expectedInvariants`)
  if (
    actual['allPassed'] !== true ||
    actual['executed'] !== expected['executed'] ||
    threshold['applicable'] !== (threshold['applicability'] === 'applicable') ||
    (threshold['applicable'] ? row['outcome'] === null : row['outcome'] !== null)
  ) {
    throw new Error(`roster-wall artifacts: ${label} fixture invariant failed`)
  }
  const intents = requireArray(row['intents'], `${label}.intents`)
  for (let index = 0; index < intents.length; index++) {
    assertRenewalIntentPayload(requireRecord(intents[index], `${label}.intents[${String(index)}]`), `${label}.intents[${String(index)}]`)
  }
  if (actual['executed'] === true) {
    for (const key of [
      'cohortSizeExact', 'halfOpenExpiryExact', 'finalPayrollMatched',
      'acceptedHaveExactlyOneSigningBonus', 'rejectedHaveNoSigningBonus',
      'renewalRngUnchanged', 'finalRngUnchangedWithoutProductions',
      'expiredTransferredToFreeAgents', 'retainedEqualsAcceptedOwners',
      'payrollAndOverheadSeparate', 'cashLedgerReconciles',
    ]) {
      if (actual[key] !== true) {
        throw new Error(`roster-wall artifacts: ${label}.${key} is not proven`)
      }
    }
  }
}

/** Exact accepted-fixture oracle; exposed for adversarial verifier tests. */
export function assertRosterWallAcceptedMechanicsFixtureRows(
  rows: readonly unknown[],
  source: RosterWallSourceProvenance,
): void {
  const actual = rows.map((row) => rosterWallStableJson(row))
  const expected = runRosterWallMechanicsFixtures(source).map((row) => rosterWallStableJson(row))
  if (!sameCanonicalValue(actual, expected)) {
    throw new Error('roster-wall artifacts: mechanics fixtures disagree with canonical execution')
  }
}

function assertPairPayload(row: Record<string, unknown>, fact: RosterWallAcceptedEnvelopeFact, label: string): void {
  requireFields(
    row,
    [
      'baselinePolicyId', 'comparedPolicyId', 'causalBoundaryLabel', 'facilityCausality',
      'estateInterpretation', 'exactEntryPairedTableEligible', 'commonEntry', 'baseline', 'compared',
      'retainedTalentIds', 'releasedTalentIds', 'roleCoverage', 'finalRoleCoverage',
      'acceptedOwnerKeys', 'rejectedOwnerKeys', 'attemptedOriginalOwnerKeys',
      'acceptedOriginalOwnerKeys', 'rejectedOriginalOwnerKeys', 'acceptedOwnerCounts',
      'rejectedOwnerCounts', 'retryAttemptCounts', 'intendedOriginalOwnerCounts',
      'attemptedOriginalOwnerCounts', 'acceptedOriginalOwnerCounts', 'rejectedOriginalOwnerCounts',
      'originalRetryAttemptCounts', 'quotedObligationTotals',
      'quotedOriginalCohortObligationTotals', 'quotedPolicyIntentObligationTotals',
      'quotedOriginalCohortPolicyIntentObligationTotals', 'signingBonusTotals', 'payroll',
      'baseOverhead', 'employeeOverhead', 'totalOverhead', 'activeTheatricalReceipts',
      'theatricalReceiptsReceived', 'activeProductions', 'screenplayProjects', 'castingSessions',
      'readyScreenplays', 'packageReadyScreenplays', 'packageStaffabilityBlockers',
      'packageAffordabilityBlockers', 'finalCash', 'finalStateHash', 'finalRngState', 'recurrence',
    ],
    label,
  )
  const common = requireRecord(row['commonEntry'], `${label}.commonEntry`)
  if (
    common['entrySaveHash'] !== fact.entrySaveHash ||
    common['entryStateHash'] !== fact.entryStateHash ||
    row['exactEntryPairedTableEligible'] !== true ||
    row['estateInterpretation'] !== 'causal-renewal-policy-within-vacant-entry'
  ) {
    throw new Error(`roster-wall artifacts: ${label} exact-entry pair identity failed`)
  }
  assertCashReconciliation(common['cashReconciliation'], `${label}.commonEntry.cashReconciliation`)
  requireRoleCoverage(common['roleCoverage'], `${label}.commonEntry.roleCoverage`)
  for (const key of [
    'acceptedOwnerCounts', 'rejectedOwnerCounts', 'retryAttemptCounts', 'intendedOriginalOwnerCounts',
    'attemptedOriginalOwnerCounts', 'acceptedOriginalOwnerCounts', 'rejectedOriginalOwnerCounts',
    'originalRetryAttemptCounts', 'quotedObligationTotals', 'quotedOriginalCohortObligationTotals',
    'quotedPolicyIntentObligationTotals', 'quotedOriginalCohortPolicyIntentObligationTotals',
    'signingBonusTotals', 'payroll', 'baseOverhead', 'employeeOverhead', 'totalOverhead',
    'activeTheatricalReceipts', 'theatricalReceiptsReceived', 'activeProductions',
    'screenplayProjects', 'castingSessions', 'readyScreenplays', 'packageReadyScreenplays',
    'packageStaffabilityBlockers', 'packageAffordabilityBlockers', 'finalCash',
  ]) {
    const triple = requireRecord(row[key], `${label}.${key}`)
    const baseline = requireFiniteNumber(triple['baseline'], `${label}.${key}.baseline`)
    const compared = requireFiniteNumber(triple['compared'], `${label}.${key}.compared`)
    const delta = requireFiniteNumber(triple['delta'], `${label}.${key}.delta`)
    if (delta !== compared - baseline) {
      throw new Error(`roster-wall artifacts: ${label}.${key} delta does not reconcile`)
    }
  }
}

function assertAcceptedEvidenceDimensions(
  row: Record<string, unknown>,
  fact: RosterWallAcceptedEnvelopeFact,
  matrix: RosterWallAcceptedArtifactMatrix,
  label: string,
): void {
  if (fact.mode === 'mechanics-fixture') {
    if (
      fact.recordType !== 'mechanicsFixture' ||
      fact.seed === null ||
      fact.operatingPolicyId !== null ||
      fact.estatePolicyId !== null ||
      fact.foundingTermPolicyId !== null ||
      fact.continuationPolicyId === null ||
      fact.horizonWeeks !== 12 ||
      fact.initialSaveHash !== null ||
      fact.entryId !== null ||
      fact.entryWeek !== 196 ||
      fact.entrySaveHash !== null ||
      fact.entryStateHash !== null ||
      fact.week !== 196
    ) {
      throw new Error(`roster-wall artifacts: ${label} has incompatible mechanics dimensions`)
    }
    if (
      row['fixtureExperimentId'] !== 'week-208-roster-wall-mechanics-fixtures-v1' ||
      typeof row['fixtureId'] !== 'string' ||
      ![1, 7, 13].includes(row['cohortSize'] as number) ||
      !isRecord(row['threshold']) ||
      !isRecord(row['actualInvariants']) ||
      row['actualInvariants']['allPassed'] !== true
    ) {
      throw new Error(`roster-wall artifacts: ${label} lacks passing fixture semantics`)
    }
    assertFixturePayload(row, label)
    return
  }

  requireAcceptedCampaignIdentity(fact, matrix, label)
  if (fact.mode === 'reference-shadow') {
    if (
      fact.recordType !== 'windowShadow' ||
      fact.estatePolicyId === null ||
      fact.foundingTermPolicyId !== 'all-208' ||
      fact.continuationPolicyId !== null ||
      fact.horizonWeeks !== null ||
      ![156, 182, 196].includes(fact.week!) ||
      !isRecord(row['warning']) ||
      row['warning']['week'] !== fact.week ||
      row['warning']['observationConsumedRng'] !== false
    ) {
      throw new Error(`roster-wall artifacts: ${label} has incompatible shadow semantics`)
    }
    assertShadowPayload(row, fact, label)
    return
  }

  if (fact.mode === 'player-policy') {
    if (
      !['entry', 'weekly', 'renewalIntent', 'boundary'].includes(fact.recordType) ||
      fact.estatePolicyId !== 'vacant' ||
      fact.foundingTermPolicyId !== 'round-robin-mixed' ||
      fact.continuationPolicyId !== 'C1-current-retry-all' ||
      fact.horizonWeeks !== 428 ||
      fact.entryId !==
        `player.${fact.seed!}.${fact.operatingPolicyId!}.vacant.round-robin-mixed` ||
      fact.week! < 0 ||
      fact.week! > 428
    ) {
      throw new Error(`roster-wall artifacts: ${label} has incompatible player-policy dimensions`)
    }
    if (fact.recordType === 'entry') {
      assertAcceptedEntryPayload(row, fact, label)
    } else if (fact.recordType === 'weekly') {
      if (
        fact.week! >= 428 ||
        typeof row['startStateHash'] !== 'string' ||
        !SHA256_PATTERN.test(row['startStateHash']) ||
        typeof row['arrivalStateHash'] !== 'string' ||
        !SHA256_PATTERN.test(row['arrivalStateHash'])
      ) {
        throw new Error(`roster-wall artifacts: ${label} lacks player weekly state facts`)
      }
      assertPlayerWeeklyPayload(row, label)
    } else if (fact.recordType === 'renewalIntent') {
      if (typeof row['intentId'] !== 'string' || row['intentId'].length === 0) {
        throw new Error(`roster-wall artifacts: ${label} lacks a renewal intent ID`)
      }
      assertRenewalIntentPayload(row, label)
    } else {
      if (typeof row['relation'] !== 'string' || row['relation'].length === 0) {
        throw new Error(`roster-wall artifacts: ${label} lacks a boundary relation`)
      }
      assertBoundaryPayload(row, fact, label)
    }
    return
  }

  if (fact.mode !== 'current') {
    throw new Error(`roster-wall artifacts: ${label} has an unsupported evidence mode`)
  }
  if (
    fact.estatePolicyId === null ||
    fact.foundingTermPolicyId !== 'all-208' ||
    fact.entryId !==
      `maximum.${fact.seed!}.${fact.operatingPolicyId!}.${fact.estatePolicyId}.all-208`
  ) {
    throw new Error(`roster-wall artifacts: ${label} has incompatible maximum-term identity`)
  }
  if (fact.recordType === 'entry') {
    if (fact.continuationPolicyId !== null || fact.horizonWeeks !== null || fact.week !== 196) {
      throw new Error(`roster-wall artifacts: ${label} has incompatible entry dimensions`)
    }
    assertAcceptedEntryPayload(row, fact, label)
    return
  }
  if (
    !['weekly', 'renewalIntent', 'boundary', 'pair'].includes(fact.recordType) ||
    fact.continuationPolicyId === null ||
    (fact.horizonWeeks !== 260 && fact.horizonWeeks !== 428) ||
    (fact.horizonWeeks === 428 &&
      !['C1-current-retry-all', 'C5-spread-role-first', 'C6-mixed-term-role-first'].includes(
        fact.continuationPolicyId,
      ))
  ) {
    throw new Error(`roster-wall artifacts: ${label} has incompatible continuation dimensions`)
  }
  if (fact.recordType === 'weekly') {
    if (
      fact.week! < 196 ||
      fact.week! >= fact.horizonWeeks ||
      typeof row['stateHashBefore'] !== 'string' ||
      !SHA256_PATTERN.test(row['stateHashBefore']) ||
      typeof row['stateHashAfterTick'] !== 'string' ||
      !SHA256_PATTERN.test(row['stateHashAfterTick'])
    ) {
      throw new Error(`roster-wall artifacts: ${label} lacks continuation weekly state facts`)
    }
    assertCurrentWeeklyPayload(row, label)
  } else if (fact.recordType === 'renewalIntent') {
    if (
      fact.week! < 196 ||
      fact.week! >= fact.horizonWeeks ||
      typeof row['intentId'] !== 'string' ||
      row['intentId'].length === 0
    ) {
      throw new Error(`roster-wall artifacts: ${label} lacks continuation intent semantics`)
    }
    assertRenewalIntentPayload(row, label)
  } else if (fact.recordType === 'boundary') {
    if (
      fact.week! < 195 ||
      fact.week! > fact.horizonWeeks ||
      typeof row['relation'] !== 'string' ||
      row['relation'].length === 0
    ) {
      throw new Error(`roster-wall artifacts: ${label} lacks continuation boundary semantics`)
    }
    assertBoundaryPayload(row, fact, label)
  } else if (
    fact.estatePolicyId !== 'vacant' ||
    fact.continuationPolicyId === 'C1-current-retry-all' ||
    fact.week !== fact.horizonWeeks ||
    row['baselinePolicyId'] !== 'C1-current-retry-all' ||
    row['comparedPolicyId'] !== fact.continuationPolicyId ||
    row['causalBoundaryLabel'] !==
      'renewal-policy-only-after-byte-identical-week-196-entry' ||
    row['facilityCausality'] !== 'not-estimated-by-within-estate-policy-pair' ||
    !isRecord(row['commonEntry']) ||
    row['commonEntry']['entrySaveHash'] !== fact.entrySaveHash
  ) {
    throw new Error(`roster-wall artifacts: ${label} lacks exact-entry pair semantics`)
  } else {
    assertPairPayload(row, fact, label)
  }
}

function addUniqueMatrixFact(set: Set<string>, key: string, label: string): void {
  if (set.has(key)) {
    throw new Error(`roster-wall artifacts: ${label} duplicates matrix cell ${key}`)
  }
  set.add(key)
}

function assertExactMatrixSet(
  actual: ReadonlySet<string>,
  expected: ReadonlySet<string>,
  label: string,
): void {
  if (actual.size !== expected.size) {
    throw new Error(`roster-wall artifacts: ${label} does not fill the frozen matrix`)
  }
  for (const key of expected) {
    if (!actual.has(key)) {
      throw new Error(`roster-wall artifacts: ${label} is missing matrix cell ${key}`)
    }
  }
}

function expectedAcceptedRowMatrices(matrix: RosterWallAcceptedArtifactMatrix): {
  weekly: Set<string>
  shadows: Set<string>
  pairs: Set<string>
  fixtures: Set<string>
} {
  const weekly = new Set<string>()
  const shadows = new Set<string>()
  const pairs = new Set<string>()
  const fixtures = new Set<string>()
  const longPolicies = [
    'C1-current-retry-all',
    'C5-spread-role-first',
    'C6-mixed-term-role-first',
  ]
  const primaryCompared = matrix.continuationPolicyIds.filter(
    (policy) => policy !== 'C1-current-retry-all',
  )
  for (const expected of acceptedExpectedEntries(matrix)) {
    if (expected.mode === 'player-policy') {
      for (let week = 0; week < 428; week++) {
        weekly.add(`${expected.entryId}|C1-current-retry-all|428|${String(week)}`)
      }
      continue
    }
    for (const policy of matrix.continuationPolicyIds) {
      for (let week = 196; week < 260; week++) {
        weekly.add(`${expected.entryId}|${policy}|260|${String(week)}`)
      }
    }
    for (const policy of longPolicies) {
      for (let week = 196; week < 428; week++) {
        weekly.add(`${expected.entryId}|${policy}|428|${String(week)}`)
      }
    }
    for (const week of [156, 182, 196]) {
      shadows.add(`${expected.entryId}|${String(week)}`)
    }
    if (expected.estatePolicyId === 'vacant') {
      for (const policy of primaryCompared) {
        pairs.add(`${expected.entryId}|${policy}|260`)
      }
      for (const policy of ['C5-spread-role-first', 'C6-mixed-term-role-first']) {
        pairs.add(`${expected.entryId}|${policy}|428`)
      }
    }
  }
  const thresholdIds = [
    'cash-negative-one',
    'cash-zero',
    'minimum-single-quote-minus-one',
    'minimum-single-quote-exact',
    'minimum-full-role-coverage-minus-one',
    'minimum-full-role-coverage-exact',
    'all-cohort-bonuses-minus-one',
    'all-cohort-bonuses-exact',
  ]
  for (const cohortSize of [1, 7, 13]) {
    for (const thresholdId of thresholdIds) {
      for (const policy of matrix.continuationPolicyIds) {
        fixtures.add(`${String(cohortSize)}|${thresholdId}|${policy}`)
      }
    }
  }
  return { weekly, shadows, pairs, fixtures }
}

function actualMatrixKey(
  row: Record<string, unknown>,
  fact: RosterWallAcceptedEnvelopeFact,
): { kind: 'weekly' | 'shadows' | 'pairs' | 'fixtures'; key: string } | null {
  if (fact.recordType === 'weekly') {
    return {
      kind: 'weekly',
      key: `${fact.entryId!}|${fact.continuationPolicyId!}|${String(fact.horizonWeeks!)}|${String(fact.week!)}`,
    }
  }
  if (fact.recordType === 'windowShadow') {
    return { kind: 'shadows', key: `${fact.entryId!}|${String(fact.week!)}` }
  }
  if (fact.recordType === 'pair') {
    return {
      kind: 'pairs',
      key: `${fact.entryId!}|${fact.continuationPolicyId!}|${String(fact.horizonWeeks!)}`,
    }
  }
  if (fact.recordType === 'mechanicsFixture') {
    const threshold = row['threshold'] as Record<string, unknown>
    return {
      kind: 'fixtures',
      key: `${String(row['cohortSize'])}|${String(threshold['thresholdId'])}|${fact.continuationPolicyId!}`,
    }
  }
  return null
}

type AcceptedOrderPart = number | string

function compareAcceptedOrder(left: readonly AcceptedOrderPart[], right: readonly AcceptedOrderPart[]): number {
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index++) {
    const a = left[index]
    const b = right[index]
    if (a === b) continue
    if (a === undefined) return -1
    if (b === undefined) return 1
    if (typeof a !== typeof b) {
      throw new Error('roster-wall artifacts: internal canonical order key type mismatch')
    }
    return a < b ? -1 : 1
  }
  return 0
}

function acceptedRowOrderKey(
  row: Record<string, unknown>,
  fact: RosterWallAcceptedEnvelopeFact,
  expectedEntries: readonly ExpectedAcceptedEntry[],
): AcceptedOrderPart[] {
  const entryIndex = fact.entryId === null
    ? expectedEntries.length
    : expectedEntries.findIndex((entry) => entry.entryId === fact.entryId)
  if (entryIndex < 0) {
    throw new Error('roster-wall artifacts: evidence row references an unknown entry')
  }
  if (fact.mode === 'mechanics-fixture') {
    const thresholdIds = [
      'cash-negative-one', 'cash-zero', 'minimum-single-quote-minus-one',
      'minimum-single-quote-exact', 'minimum-full-role-coverage-minus-one',
      'minimum-full-role-coverage-exact', 'all-cohort-bonuses-minus-one',
      'all-cohort-bonuses-exact',
    ]
    const threshold = requireRecord(row['threshold'], 'mechanicsFixture.threshold')
    const cohortIndex = [1, 7, 13].indexOf(row['cohortSize'] as number)
    const thresholdIndex = thresholdIds.indexOf(String(threshold['thresholdId']))
    const policyIndex = ROSTER_WALL_ACCEPTED_CONTINUATION_POLICY_IDS.indexOf(
      fact.continuationPolicyId as (typeof ROSTER_WALL_ACCEPTED_CONTINUATION_POLICY_IDS)[number],
    )
    if (cohortIndex < 0 || thresholdIndex < 0 || policyIndex < 0) {
      throw new Error('roster-wall artifacts: mechanics fixture lacks a canonical order cell')
    }
    return [entryIndex, 0, cohortIndex, thresholdIndex, policyIndex]
  }
  if (fact.recordType === 'entry') return [entryIndex, 0]
  if (fact.mode === 'reference-shadow') {
    return [entryIndex, 1, [156, 182, 196].indexOf(fact.week!)]
  }
  if (fact.mode === 'player-policy') {
    const phase = fact.recordType === 'boundary' ? 0 : fact.recordType === 'renewalIntent' ? 1 : 2
    const tie = fact.recordType === 'boundary'
      ? requireNonEmptyString(row['relation'], 'player boundary relation')
      : fact.recordType === 'renewalIntent'
        ? `${String(requireNonNegativeSafeInteger(row['orderRank'], 'player intent orderRank')).padStart(6, '0')}:${requireNonEmptyString(row['intentId'], 'player intent ID')}`
        : ''
    return [entryIndex, 1, fact.week!, phase, tie]
  }
  if (fact.recordType === 'pair') {
    const primary = fact.horizonWeeks === 260
      ? (ROSTER_WALL_ACCEPTED_CONTINUATION_POLICY_IDS as readonly string[])
          .filter((policy) => policy !== 'C1-current-retry-all')
          .indexOf(fact.continuationPolicyId!)
      : 6 + ['C5-spread-role-first', 'C6-mixed-term-role-first'].indexOf(
          fact.continuationPolicyId!,
        )
    return [entryIndex, 3, primary]
  }
  const primaryPolicyIndex = ROSTER_WALL_ACCEPTED_CONTINUATION_POLICY_IDS.indexOf(
    fact.continuationPolicyId as (typeof ROSTER_WALL_ACCEPTED_CONTINUATION_POLICY_IDS)[number],
  )
  const longPolicyIndex = [
    'C1-current-retry-all', 'C5-spread-role-first', 'C6-mixed-term-role-first',
  ].indexOf(fact.continuationPolicyId!)
  const armIndex = fact.horizonWeeks === 260 ? primaryPolicyIndex : 7 + longPolicyIndex
  const phase = fact.recordType === 'boundary' ? 0 : fact.recordType === 'renewalIntent' ? 1 : 2
  const tie = fact.recordType === 'boundary'
    ? requireNonEmptyString(row['relation'], 'continuation boundary relation')
    : fact.recordType === 'renewalIntent'
      ? `${String(requireNonNegativeSafeInteger(row['orderRank'], 'continuation intent orderRank')).padStart(6, '0')}:${requireNonEmptyString(row['intentId'], 'continuation intent ID')}`
      : ''
  return [entryIndex, 2, armIndex, fact.week!, phase, tie]
}

function assertRowMatchesIndexedEntry(
  fact: RosterWallAcceptedEnvelopeFact,
  indexed: ReadonlyMap<string, RosterWallAcceptedEntryFact>,
  label: string,
): void {
  if (fact.mode === 'mechanics-fixture') return
  const entry = fact.entryId === null ? undefined : indexed.get(fact.entryId)
  if (
    entry === undefined ||
    fact.seed !== entry.seed ||
    fact.operatingPolicyId !== entry.operatingPolicyId ||
    fact.estatePolicyId !== entry.estatePolicyId ||
    fact.foundingTermPolicyId !== entry.foundingTermPolicyId ||
    fact.initialSaveHash !== entry.initialSaveHash ||
    fact.entryWeek !== entry.entryWeek ||
    fact.entrySaveHash !== entry.entrySaveHash ||
    fact.entryStateHash !== entry.entryStateHash
  ) {
    throw new Error(`roster-wall artifacts: ${label} disagrees with its indexed immutable entry`)
  }
}

function assertAcceptedFixedCounts(
  counts: RosterWallAcceptedArtifactCounts,
  matrix: RosterWallAcceptedArtifactMatrix,
  label: string,
): void {
  if (
    counts.entries !== matrix.totalEntries ||
    counts.recordTypes.entry !== matrix.totalEntries ||
    counts.recordTypes.weekly !== matrix.weeklyRows ||
    counts.recordTypes.windowShadow !== matrix.windowShadowRows ||
    counts.recordTypes.pair !== matrix.pairRows ||
    counts.recordTypes.mechanicsFixture !== matrix.mechanicsFixtureRows
  ) {
    throw new Error(`roster-wall artifacts: ${label} does not match the frozen matrix counts`)
  }
}

type ParsedRosterWallContractKey = {
  talentId: string
  startWeek: number
  endWeekExclusive: number
}

function parseRosterWallContractKey(value: string, label: string): ParsedRosterWallContractKey {
  const last = value.lastIndexOf(':')
  const secondLast = value.lastIndexOf(':', last - 1)
  if (last <= 0 || secondLast <= 0) {
    throw new Error(`roster-wall artifacts: ${label} is not a canonical contract key`)
  }
  const talentId = value.slice(0, secondLast)
  const startText = value.slice(secondLast + 1, last)
  const endText = value.slice(last + 1)
  const startWeek = Number(startText)
  const endWeekExclusive = Number(endText)
  if (
    talentId.length === 0 ||
    !Number.isSafeInteger(startWeek) ||
    startWeek < 0 ||
    String(startWeek) !== startText ||
    !Number.isSafeInteger(endWeekExclusive) ||
    endWeekExclusive <= startWeek ||
    String(endWeekExclusive) !== endText
  ) {
    throw new Error(`roster-wall artifacts: ${label} is not a canonical contract key`)
  }
  return { talentId, startWeek, endWeekExclusive }
}

type RosterWallAcceptedReplayEvent = {
  row: RosterWallArtifactRecord
  entrySaveJson: string | null
}

function emptyAcceptedReplayChecks(): RosterWallAcceptedAcceptanceChecks {
  return {
    entryObserverNeutrality: {
      checkedEntries: 0,
      byteIdenticalEntries: 0,
      stateHashIdenticalEntries: 0,
      rngStateIdenticalEntries: 0,
      failures: 0,
    },
    continuationObserverNeutrality: {
      checkedArms: 0,
      byteIdenticalArms: 0,
      stateHashIdenticalArms: 0,
      rngStateIdenticalArms: 0,
      failures: 0,
    },
    playerPolicyObserverNeutrality: {
      checkedRuns: 0,
      byteIdenticalRuns: 0,
      stateHashIdenticalRuns: 0,
      rngStateIdenticalRuns: 0,
      failures: 0,
    },
  }
}

/**
 * Independently regenerate the accepted corpus in canonical global order.
 *
 * Only one governed entry's evidence is retained at a time. Each maximum-term
 * campaign and continuation corpus, including observer-disabled neutrality
 * executions, is completed before the generator advances to the next entry.
 */
function* acceptedRosterWallReplayEvents(
  matrix: RosterWallAcceptedArtifactMatrix,
  source: RosterWallSourceProvenance,
  checks: RosterWallAcceptedAcceptanceChecks,
): Generator<RosterWallAcceptedReplayEvent> {
  for (const seed of matrix.canonicalSeeds) {
    for (const operatingPolicyId of matrix.operatingPolicyIds) {
      for (const estatePolicyId of matrix.estatePolicyIds) {
        const neutral = runRosterWallNeutralEntryCampaign({
          seed,
          operatingPolicyId: operatingPolicyId as RosterWallOperatingPolicyId,
          estatePolicyId: estatePolicyId as 'vacant' | 'annex-start-week-0',
        })
        const entryNeutrality = neutral.observerNeutrality
        if (
          !entryNeutrality.byteIdentical ||
          !entryNeutrality.stateHashIdentical ||
          !entryNeutrality.rngStateIdentical
        ) {
          throw new Error('roster-wall artifacts: deterministic entry replay is not observer-neutral')
        }
        checks.entryObserverNeutrality.checkedEntries++
        checks.entryObserverNeutrality.byteIdenticalEntries++
        checks.entryObserverNeutrality.stateHashIdenticalEntries++
        checks.entryObserverNeutrality.rngStateIdenticalEntries++
        const harvest = neutral.harvest
        yield {
          row: makeRosterWallEntryRecord(harvest, source, 'all-208', 'current'),
          entrySaveJson: harvest.entrySaveBytes,
        }
        for (const shadow of makeRosterWallShadowRecords(harvest, source, 'all-208')) {
          yield { row: shadow, entrySaveJson: null }
        }
        const continuation = runRosterWallContinuationCorpus({
          harvest,
          source,
          includeLongHorizon: true,
        })
        checks.continuationObserverNeutrality.checkedArms +=
          continuation.observerNeutrality.checkedArms
        checks.continuationObserverNeutrality.byteIdenticalArms +=
          continuation.observerNeutrality.byteIdenticalArms
        checks.continuationObserverNeutrality.stateHashIdenticalArms +=
          continuation.observerNeutrality.stateHashIdenticalArms
        checks.continuationObserverNeutrality.rngStateIdenticalArms +=
          continuation.observerNeutrality.rngStateIdenticalArms
        for (const row of rosterWallContinuationRows(continuation)) {
          yield { row, entrySaveJson: null }
        }
      }
    }
  }

  for (const seed of matrix.canonicalSeeds) {
    for (const operatingPolicyId of matrix.operatingPolicyIds) {
      const result = runRosterWallPlayerPolicy({
        seed,
        operatingPolicyId: operatingPolicyId as RosterWallOperatingPolicyId,
      })
      const neutrality = result.observerNeutrality
      if (
        !neutrality.entryByteIdentical ||
        !neutrality.entryStateHashIdentical ||
        !neutrality.finalByteIdentical ||
        !neutrality.finalStateHashIdentical ||
        !neutrality.finalRngStateIdentical
      ) {
        throw new Error('roster-wall artifacts: player-policy replay is not observer-neutral')
      }
      checks.playerPolicyObserverNeutrality.checkedRuns++
      checks.playerPolicyObserverNeutrality.byteIdenticalRuns++
      checks.playerPolicyObserverNeutrality.stateHashIdenticalRuns++
      checks.playerPolicyObserverNeutrality.rngStateIdenticalRuns++
      const evidence = serializeRosterWallPlayerPolicyEvidence(result, source)
      yield { row: evidence.entry, entrySaveJson: result.entry.saveBytes }
      for (const row of orderedRosterWallPlayerPolicyEvidenceRows(evidence)) {
        yield { row, entrySaveJson: null }
      }
    }
  }

  for (const fixture of runRosterWallMechanicsFixtures(source)) {
    yield { row: fixture, entrySaveJson: null }
  }
}

/**
 * Verify the semantic acceptance contract in addition to mechanical bytes.
 * This is the sole verifier accepted evidence and accepted finalization use.
 */
export function verifyRosterWallAcceptedArtifactDirectory(
  repoRoot: string,
  runName: string,
): RosterWallAcceptedArtifactVerification {
  const verification = verifyRosterWallArtifactDirectory(repoRoot, runName)
  const manifest = parseAcceptedManifest(
    readCanonicalJson(verification.paths.manifest, 'manifest.json', 2),
  )
  const liveSourceAtStart = acceptedRosterWallSourceProvenance(repoRoot)
  if (!sameCanonicalValue(manifest.source, liveSourceAtStart)) {
    throw new Error(
      'roster-wall artifacts: recorded source is not the exact current clean governed Git authority',
    )
  }
  const summary = parseAcceptedSummary(
    readCanonicalJson(verification.paths.summary, 'summary.json', 2),
  )
  if (
    summary.profile !== manifest.profile ||
    summary.completeEvidence !== manifest.completeEvidence ||
    !sameCanonicalValue(summary.source, manifest.source) ||
    !sameCanonicalValue(summary.matrix, manifest.matrix) ||
    !sameCanonicalValue(summary.counts, manifest.counts)
  ) {
    throw new Error('roster-wall artifacts: manifest.json and summary.json governed facts disagree')
  }
  assertAcceptedFixedCounts(manifest.counts, manifest.matrix, 'manifest.json.counts')

  const expectedEntries = acceptedExpectedEntries(manifest.matrix)
  const entryFacts: RosterWallAcceptedEntryFact[] = []
  const entryLines = new Map<string, string>()
  const shadowEntryAuthorities = new Map<string, RosterWallShadowEntryAuthority>()
  scanCanonicalJsonl(verification.paths.entries, 'entries.jsonl', (row, index, canonicalLine) => {
    const label = `entries.jsonl row ${String(index + 1)}`
    if (!isRecord(row)) {
      throw new Error(`roster-wall artifacts: ${label} is not an object`)
    }
    const fact = assertAcceptedCommonEnvelope(row, label, manifest.source)
    const expected = expectedEntries[index]
    if (expected === undefined) {
      throw new Error('roster-wall artifacts: entries.jsonl exceeds the frozen entry matrix')
    }
    assertAcceptedEntryDimensions(fact, expected, label)
    assertAcceptedEntryPayload(row, fact, label)
    const savePath = join(
      verification.paths.entriesDirectory,
      `${fact.entryId!}.save.json`,
    )
    const saveJson = decodeUtf8Fatal(readFileSync(savePath), `${fact.entryId!}.save.json`)
    const imported = importSave(saveJson)
    const stateHash = rosterWallSha256(stableStringify(imported.state))
    if (
      imported.saveVersion !== 17 ||
      imported.state.market.tick !== 196 ||
      rosterWallSha256(saveJson) !== fact.entrySaveHash ||
      stateHash !== fact.entryStateHash
    ) {
      throw new Error(`roster-wall artifacts: ${label} disagrees with its exact Week-196 save`)
    }
    const importedState = imported.state
    assertAcceptedEntryPayload(row, fact, label, importedState)
    if (fact.mode === 'current') {
      shadowEntryAuthorities.set(
        fact.entryId!,
        deriveShadowEntryAuthority(importedState, fact.operatingPolicyId!),
      )
    }
    if (entryLines.has(fact.entryId!)) {
      throw new Error(`roster-wall artifacts: entries.jsonl repeats entryId ${fact.entryId!}`)
    }
    entryLines.set(fact.entryId!, canonicalLine)
    entryFacts.push({ ...fact, canonicalLine })
  })
  if (entryFacts.length !== expectedEntries.length) {
    throw new Error('roster-wall artifacts: entries.jsonl does not fill the frozen entry matrix')
  }
  const projectedIndex = entryFacts.map(acceptedEntryIndexProjection)
  if (!sameCanonicalValue(projectedIndex, manifest.entryIndex)) {
    throw new Error('roster-wall artifacts: manifest entryIndex disagrees with entries.jsonl')
  }
  const indexedEntries = new Map(entryFacts.map((entry) => [entry.entryId!, entry]))

  const actualRecordTypes = Object.fromEntries(
    ROSTER_WALL_ACCEPTED_RECORD_TYPES.map((recordType) => [recordType, 0]),
  ) as RosterWallAcceptedRecordTypeCounts
  const duplicatedEntries = new Set<string>()
  const expectedMatrices = expectedAcceptedRowMatrices(manifest.matrix)
  const actualMatrices = {
    weekly: new Set<string>(),
    shadows: new Set<string>(),
    pairs: new Set<string>(),
    fixtures: new Set<string>(),
  }
  const fixtureRows: unknown[] = []
  let previousOrderKey: AcceptedOrderPart[] | null = null
  const summaryAccumulator = new RosterWallSummaryAccumulator({
    schemaVersion: manifest.schemaVersion,
    experimentId: manifest.experimentId,
    seedSetId: manifest.seedSetId,
    profile: manifest.profile,
    completeEvidence: manifest.completeEvidence,
    source: manifest.source,
    matrix: manifest.matrix,
  })
  const replayChecks = emptyAcceptedReplayChecks()
  const replayEvents = acceptedRosterWallReplayEvents(
    manifest.matrix,
    manifest.source,
    replayChecks,
  )
  const observedRowCount = scanCanonicalJsonl(
    verification.paths.rows,
    'rows.jsonl',
    (row, index, canonicalLine) => {
      const label = `rows.jsonl row ${String(index + 1)}`
      if (!isRecord(row)) {
        throw new Error(`roster-wall artifacts: ${label} is not an object`)
      }
      const replay = replayEvents.next()
      if (replay.done) {
        throw new Error(`roster-wall artifacts: ${label} exceeds deterministic replay output`)
      }
      const expectedCanonicalLine = rosterWallStableJson(replay.value.row)
      if (canonicalLine !== expectedCanonicalLine) {
        throw new Error(
          `roster-wall artifacts: ${label} disagrees with exact deterministic campaign replay`,
        )
      }
      if (replay.value.entrySaveJson !== null) {
        const replayEntryId = requireNonEmptyString(row['entryId'], `${label}.entryId`)
        const recordedEntrySave = decodeUtf8Fatal(
          readFileSync(join(verification.paths.entriesDirectory, `${replayEntryId}.save.json`)),
          `${replayEntryId}.save.json`,
        )
        if (recordedEntrySave !== replay.value.entrySaveJson) {
          throw new Error(
            `roster-wall artifacts: ${label} immutable save disagrees with deterministic campaign replay`,
          )
        }
      }
      const fact = assertAcceptedCommonEnvelope(row, label, manifest.source)
      assertAcceptedEvidenceDimensions(row, fact, manifest.matrix, label)
      assertRowMatchesIndexedEntry(fact, indexedEntries, label)
      if (fact.recordType === 'windowShadow') {
        const authority = shadowEntryAuthorities.get(fact.entryId!)
        if (authority === undefined) {
          throw new Error(`roster-wall artifacts: ${label} lacks immutable shadow authority`)
        }
        assertShadowAgainstEntry(row, fact, authority, label)
      }
      const orderKey = acceptedRowOrderKey(row, fact, expectedEntries)
      if (previousOrderKey !== null && compareAcceptedOrder(previousOrderKey, orderKey) >= 0) {
        throw new Error(`roster-wall artifacts: ${label} violates canonical global row order`)
      }
      previousOrderKey = orderKey
      // Exact canonical execution replay above subsumes the former cross-row
      // caches and joins. Finish the bounded streaming checks for this row and
      // release the parsed object before scanning the next JSONL record.
      if (fact.recordType === 'mechanicsFixture') fixtureRows.push(row)
      actualRecordTypes[fact.recordType]++
      if (fact.recordType === 'entry') {
        const indexedLine = entryLines.get(fact.entryId!)
        if (indexedLine === undefined || indexedLine !== canonicalLine) {
          throw new Error(`roster-wall artifacts: ${label} is not an exact entries.jsonl duplicate`)
        }
        if (duplicatedEntries.has(fact.entryId!)) {
          throw new Error(`roster-wall artifacts: rows.jsonl repeats entry row ${fact.entryId!}`)
        }
        duplicatedEntries.add(fact.entryId!)
      }
      const replayedMatrixFact = actualMatrixKey(row, fact)
      if (replayedMatrixFact !== null) {
        addUniqueMatrixFact(
          actualMatrices[replayedMatrixFact.kind],
          replayedMatrixFact.key,
          `${replayedMatrixFact.kind} rows`,
        )
      }
      summaryAccumulator.observe(row as RosterWallArtifactRecord)
    },
  )
  if (!replayEvents.next().done) {
    throw new Error('roster-wall artifacts: rows.jsonl ended before deterministic replay output')
  }
  if (!sameCanonicalValue(replayChecks, manifest.acceptanceChecks)) {
    throw new Error(
      'roster-wall artifacts: manifest neutrality checks disagree with independent campaign replay',
    )
  }
  if (duplicatedEntries.size !== entryLines.size) {
    throw new Error('roster-wall artifacts: rows.jsonl does not duplicate every entries.jsonl row')
  }
  assertRosterWallAcceptedMechanicsFixtureRows(fixtureRows, manifest.source)
  const actualCounts: RosterWallAcceptedArtifactCounts = {
    entries: entryFacts.length,
    rows: observedRowCount,
    recordTypes: actualRecordTypes,
  }
  if (!sameCanonicalValue(actualCounts, manifest.counts)) {
    throw new Error('roster-wall artifacts: observed row counts disagree with manifest.json')
  }
  assertExactMatrixSet(actualMatrices.weekly, expectedMatrices.weekly, 'weekly rows')
  assertExactMatrixSet(actualMatrices.shadows, expectedMatrices.shadows, 'windowShadow rows')
  assertExactMatrixSet(actualMatrices.pairs, expectedMatrices.pairs, 'pair rows')
  assertExactMatrixSet(actualMatrices.fixtures, expectedMatrices.fixtures, 'mechanicsFixture rows')
  const recomputedSummary = summaryAccumulator.finish()
  assertRosterWallResearchSummaryMatches(summary, recomputedSummary)
  const markdown = decodeUtf8Fatal(readFileSync(verification.paths.markdown), 'summary.md')
  if (markdown !== renderRosterWallSummaryMarkdown(recomputedSummary)) {
    throw new Error('roster-wall artifacts: summary.md does not exactly render streamed summary.json')
  }
  assertRosterWallProvenanceUnchanged(
    liveSourceAtStart,
    acceptedRosterWallSourceProvenance(repoRoot),
  )

  return {
    ...verification,
    profile: manifest.profile,
    manifest,
    summary,
  }
}

/** Streaming sink for large corpora; generated rows need not be retained in memory. */
export class RosterWallArtifactWriter {
  readonly paths: RosterWallArtifactPaths
  private readonly repoRoot: string
  private readonly runName: string
  private readonly entryIds = new Set<string>()
  private rowsBuffer = ''
  private finalized = false

  private static readonly ROW_BUFFER_BYTES = 4 * 1024 * 1024

  constructor(repoRoot: string, runName: string) {
    this.repoRoot = canonicalRepoRoot(repoRoot)
    this.runName = validateRosterWallRunName(runName)
    this.paths = prepareRosterWallArtifactDirectory(this.repoRoot, this.runName)
  }

  writeEntry(entry: RosterWallArtifactEntry): void {
    this.assertOpen()
    const entryId = validateRosterWallEntryId(entry.entryId)
    if (this.entryIds.has(entryId)) {
      throw new Error(`roster-wall artifacts: duplicate immutable entry ${entryId}`)
    }
    if (!isRecord(entry.row) || entry.row['entryId'] !== entryId) {
      throw new Error(`roster-wall artifacts: entry row must carry matching entryId ${entryId}`)
    }
    const parsedSave = parseJson(entry.saveJson, `${entryId}.save.json`)
    if (entry.saveJson !== rosterWallStableJson(parsedSave)) {
      throw new Error(
        `roster-wall artifacts: ${entryId}.save.json must be compact canonical JSON without a trailing newline`,
      )
    }
    assertExactSaveV11(entry.saveJson, `${entryId}.save.json`)
    const saveHash = rosterWallSha256(entry.saveJson)
    if (
      entry.row['entrySaveHash'] !== undefined &&
      entry.row['entrySaveHash'] !== saveHash
    ) {
      throw new Error(`roster-wall artifacts: entrySaveHash disagrees for ${entryId}`)
    }
    const rowJson = rosterWallStableJson(entry.row)
    const savePath = join(this.paths.entriesDirectory, `${entryId}.save.json`)
    writeFileSync(savePath, entry.saveJson, { encoding: 'utf8', flag: 'wx' })
    appendFileSync(this.paths.entries, `${rowJson}\n`, 'utf8')
    this.bufferRowJson(rowJson)
    this.entryIds.add(entryId)
  }

  writeRow(row: unknown): void {
    this.assertOpen()
    this.bufferRowJson(rosterWallStableJson(row))
  }

  writeRows(rows: readonly unknown[]): void {
    this.assertOpen()
    for (const row of rows) this.bufferRowJson(rosterWallStableJson(row))
  }

  finalize(input: RosterWallArtifactFinalization): RosterWallArtifactVerification {
    this.assertOpen()
    if (input.summaryMarkdown.includes('\r') || !input.summaryMarkdown.endsWith('\n')) {
      throw new Error('roster-wall artifacts: summaryMarkdown must use LF and end with one newline')
    }
    this.flushRows()
    writeFileSync(
      this.paths.manifest,
      `${rosterWallStableJson(input.manifest, 2)}\n`,
      { encoding: 'utf8', flag: 'wx' },
    )
    writeFileSync(
      this.paths.summary,
      `${rosterWallStableJson(input.summary, 2)}\n`,
      { encoding: 'utf8', flag: 'wx' },
    )
    writeFileSync(this.paths.markdown, input.summaryMarkdown, {
      encoding: 'utf8',
      flag: 'wx',
    })
    const inventory = inventoryRosterWallArtifactDirectory(
      this.paths.directory,
      new Set(['sha256.json']),
    )
    writeFileSync(
      this.paths.sha256,
      `${rosterWallStableJson(inventory, 2)}\n`,
      { encoding: 'utf8', flag: 'wx' },
    )
    this.finalized = true
    return verifyRosterWallArtifactDirectory(this.repoRoot, this.runName)
  }

  /** Revalidate the exact Git/source stamp immediately before accepted finalization. */
  finalizeAccepted(
    input: RosterWallAcceptedArtifactFinalization,
  ): RosterWallAcceptedArtifactVerification {
    const current = acceptedRosterWallSourceProvenance(this.repoRoot)
    assertRosterWallProvenanceUnchanged(input.source, current)
    this.finalize(input)
    return verifyRosterWallAcceptedArtifactDirectory(this.repoRoot, this.runName)
  }

  private assertOpen(): void {
    if (this.finalized) {
      throw new Error('roster-wall artifacts: writer is already finalized')
    }
  }

  private bufferRowJson(rowJson: string): void {
    if (Buffer.byteLength(rowJson, 'utf8') > ROSTER_WALL_MAX_JSONL_ROW_BYTES) {
      throw new Error('roster-wall artifacts: evidence row exceeds the governed JSONL record limit')
    }
    this.rowsBuffer += `${rowJson}\n`
    if (Buffer.byteLength(this.rowsBuffer, 'utf8') >= RosterWallArtifactWriter.ROW_BUFFER_BYTES) {
      this.flushRows()
    }
  }

  private flushRows(): void {
    if (this.rowsBuffer === '') return
    appendFileSync(this.paths.rows, this.rowsBuffer, 'utf8')
    this.rowsBuffer = ''
  }
}

function fileDigest(directory: string, path: string): string {
  return hashRosterWallFile(join(directory, ...path.split('/'))).sha256
}

function filesAreByteIdentical(leftPath: string, rightPath: string): boolean {
  const left = openSync(leftPath, 'r')
  const right = openSync(rightPath, 'r')
  const leftBuffer = Buffer.allocUnsafe(FILE_BUFFER_BYTES)
  const rightBuffer = Buffer.allocUnsafe(FILE_BUFFER_BYTES)
  try {
    while (true) {
      const leftRead = readSync(left, leftBuffer, 0, leftBuffer.length, null)
      const rightRead = readSync(right, rightBuffer, 0, rightBuffer.length, null)
      if (leftRead !== rightRead) return false
      if (leftRead === 0) return true
      if (!leftBuffer.subarray(0, leftRead).equals(rightBuffer.subarray(0, rightRead))) {
        return false
      }
    }
  } finally {
    closeSync(left)
    closeSync(right)
  }
}

/** Verify two governed artifacts, then compare every file including sha256.json. */
export function compareRosterWallArtifactDirectories(
  repoRoot: string,
  leftRunName: string,
  rightRunName: string,
): RosterWallArtifactComparison {
  const left = verifyRosterWallArtifactDirectory(repoRoot, leftRunName)
  const right = verifyRosterWallArtifactDirectory(repoRoot, rightRunName)
  const paths = [...new Set([...left.files, ...right.files])].sort(compareText)
  const leftPaths = new Set(left.files)
  const rightPaths = new Set(right.files)
  const differences: RosterWallArtifactDifference[] = []
  for (const path of paths) {
    if (!leftPaths.has(path)) {
      differences.push({
        path,
        kind: 'missing-left',
        leftSha256: null,
        rightSha256: fileDigest(right.paths.directory, path),
      })
      continue
    }
    if (!rightPaths.has(path)) {
      differences.push({
        path,
        kind: 'missing-right',
        leftSha256: fileDigest(left.paths.directory, path),
        rightSha256: null,
      })
      continue
    }
    const leftPath = join(left.paths.directory, ...path.split('/'))
    const rightPath = join(right.paths.directory, ...path.split('/'))
    if (!filesAreByteIdentical(leftPath, rightPath)) {
      differences.push({
        path,
        kind: 'bytes',
        leftSha256: hashRosterWallFile(leftPath).sha256,
        rightSha256: hashRosterWallFile(rightPath).sha256,
      })
    }
  }
  return { byteIdentical: differences.length === 0, differences, left, right }
}

export function assertRosterWallArtifactsByteIdentical(
  repoRoot: string,
  leftRunName: string,
  rightRunName: string,
): RosterWallArtifactComparison {
  const comparison = compareRosterWallArtifactDirectories(repoRoot, leftRunName, rightRunName)
  if (!comparison.byteIdentical) {
    throw new Error(
      `roster-wall artifacts: replay differs at ${comparison.differences.map((item) => item.path).join(', ')}`,
    )
  }
  return comparison
}

/**
 * Mechanically verify and compare both corpora first. Byte identity lets one
 * exact semantic replay prove both directories; divergent corpora are each
 * semantically verified before their differences are reported.
 */
export function compareRosterWallAcceptedArtifactDirectories(
  repoRoot: string,
  leftRunName: string,
  rightRunName: string,
): RosterWallAcceptedArtifactComparison {
  const comparison = compareRosterWallArtifactDirectories(repoRoot, leftRunName, rightRunName)
  const left = verifyRosterWallAcceptedArtifactDirectory(repoRoot, leftRunName)
  const right = comparison.byteIdentical
    ? {
        ...comparison.right,
        profile: left.profile,
        manifest: left.manifest,
        summary: left.summary,
      }
    : verifyRosterWallAcceptedArtifactDirectory(repoRoot, rightRunName)
  return { ...comparison, left, right }
}

export function assertRosterWallAcceptedArtifactsByteIdentical(
  repoRoot: string,
  leftRunName: string,
  rightRunName: string,
): RosterWallAcceptedArtifactComparison {
  const comparison = compareRosterWallAcceptedArtifactDirectories(
    repoRoot,
    leftRunName,
    rightRunName,
  )
  if (!comparison.byteIdentical) {
    throw new Error(
      `roster-wall artifacts: accepted replay differs at ${comparison.differences.map((item) => item.path).join(', ')}`,
    )
  }
  return comparison
}
