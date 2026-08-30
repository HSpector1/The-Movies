import { spawnSync } from 'node:child_process'
import {
  lstatSync,
  linkSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { createHash } from 'node:crypto'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { tmpdir } from 'node:os'

export const TYPESCRIPT_REPOSITORY = 'HSpector1/The-Movies'
export const UNITY_REPOSITORY = 'HSpector1/project-studio-unity-visual-spike'

export const CONTRACT_ID = 'project-studio-current-game-unity-bridge'
export const SCHEMA_PATH = 'bridge/schema/project-studio-bridge.schema.json'
export const MANIFEST_PATH = 'generated/unity/project-studio-bridge.contract-manifest.json'
export const TYPESCRIPT_CONTRACT_PATH = 'generated/unity/StudioBridgeDtos.Generated.cs'
export const TYPESCRIPT_FIXTURE_PATH = 'generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs'
export const UNITY_CONTRACT_PATH = 'Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs'
export const UNITY_FIXTURE_PATH = 'Assets/Studio/Tests/EditMode/Generated/StudioBridgeUnionFixtures.Generated.cs'

export const GENERATOR_VERSION = 1
export const ATTESTATION_VERSION = 1
export const FIXTURE_CORPUS_VERSION = 1
export const CURRENT_ACCEPTED_SAVE_VERSION = 15

export const GENERATOR_SOURCE_PATHS = [
  'bridge/schema/canonical.ts',
  'bridge/schema/dsl.ts',
  'package-lock.json',
  'package.json',
  'scripts/bridge-contract-csharp.ts',
  'scripts/generate-bridge-contract.ts',
] as const

export const VERIFIER_SOURCE_PATHS = [
  'package-lock.json',
  'package.json',
  'scripts/bridge-contract-consumer-lock.ts',
  'scripts/verify-bridge-contract-consumer.ts',
] as const

export const FIXTURE_SOURCE_PATHS = [
  'scripts/bridge-contract-csharp.ts',
  'scripts/generate-bridge-contract-fixtures.ts',
  'tests/fixtures/bridge-contract-union-fixtures.ts',
] as const

const MANIFEST_KEYS = [
  'contractId',
  'generatorSourceSha256',
  'generatorVersion',
  'manifestVersion',
  'projectionVersion',
  'protocolVersion',
  'schemaId',
  'typescriptGeneratedContractPath',
  'typescriptGeneratedContractSha256',
  'unityConsumerRepository',
  'unityGeneratedContractPath',
  'unityGeneratedContractSha256',
] as const

const ATTESTATION_KEYS = [
  'attestationVersion',
  'compiledFixtureEditModeFailedCount',
  'compiledFixtureEditModeLogPath',
  'compiledFixtureEditModeLogSha256',
  'compiledFixtureEditModePassedCount',
  'compiledFixtureEditModeResultPath',
  'compiledFixtureEditModeResultSha256',
  'compiledFixtureEditModeSkippedCount',
  'compiledFixtureEditModeTestCount',
  'contractId',
  'contractManifestPath',
  'contractManifestSha256',
  'fixtureCorpusSourceSha256',
  'fixtureCorpusVersion',
  'generatorSourceSha256',
  'generatorVersion',
  'projectionVersion',
  'protocolVersion',
  'saveVersion',
  'schemaId',
  'typescriptClean',
  'typescriptCleanStatusSha256',
  'typescriptGeneratedContractGitBlob',
  'typescriptGeneratedContractPath',
  'typescriptGeneratedContractSha256',
  'typescriptGeneratedFixtureGitBlob',
  'typescriptGeneratedFixturePath',
  'typescriptGeneratedFixtureSha256',
  'typescriptRef',
  'typescriptRepository',
  'typescriptSourceCommit',
  'typescriptTree',
  'unityClean',
  'unityCleanStatusSha256',
  'unityConsumerCommit',
  'unityConsumerRepository',
  'unityGeneratedContractGitBlob',
  'unityGeneratedContractPath',
  'unityGeneratedContractSha256',
  'unityGeneratedFixtureGitBlob',
  'unityGeneratedFixturePath',
  'unityGeneratedFixtureSha256',
  'unityRef',
  'unityTree',
  'verificationCommand',
  'verificationResult',
  'verifierSourceSha256',
] as const

export type Cf09DiagnosticCode =
  | 'CF09_ROOT_NOT_TOPLEVEL'
  | 'CF09_REPOSITORY_MISMATCH'
  | 'CF09_HEAD_MISMATCH'
  | 'CF09_REF_MISMATCH'
  | 'CF09_TYPESCRIPT_DIRTY'
  | 'CF09_UNITY_DIRTY'
  | 'CF09_PATH_INVALID'
  | 'CF09_PATH_REDIRECTED'
  | 'CF09_CONSUMER_MISSING'
  | 'CF09_MANIFEST_MISMATCH'
  | 'CF09_SCHEMA_MISMATCH'
  | 'CF09_PROTOCOL_MISMATCH'
  | 'CF09_PROJECTION_MISMATCH'
  | 'CF09_CONSUMER_HASH_MISMATCH'
  | 'CF09_COMMIT_NOT_FOUND'
  | 'CF09_ATTESTATION_HASH_MISMATCH'
  | 'CF09_GENERATOR_SOURCE_MISMATCH'
  | 'CF09_VERIFIER_SOURCE_MISMATCH'
  | 'CF09_FIXTURE_SOURCE_MISMATCH'
  | 'CF09_GENERATOR_EXECUTION_FAILED'
  | 'CF09_EDITMODE_EVIDENCE_INVALID'

export type Cf09Stage =
  | 'arguments'
  | 'root-preflight'
  | 'repository-identity'
  | 'commit-preflight'
  | 'ref-preflight'
  | 'path-preflight'
  | 'clean-tree'
  | 'manifest-validation'
  | 'schema-validation'
  | 'source-validation'
  | 'consumer-verification'
  | 'regeneration'
  | 'editmode-evidence'
  | 'attestation'

export type RepositoryRole = 'typescript' | 'unity' | 'evidence' | 'verifier'

export interface Cf09Diagnostic {
  readonly code: Cf09DiagnosticCode
  readonly stage: Cf09Stage
  readonly role: RepositoryRole
  readonly root?: string
  readonly commit?: string
  readonly path?: string
  readonly expected?: string | number | boolean
  readonly observed?: string | number | boolean
  readonly remediation: string
}

export class Cf09VerificationError extends Error {
  readonly diagnostic: Cf09Diagnostic

  constructor(diagnostic: Cf09Diagnostic) {
    super(formatDiagnostic(diagnostic))
    this.name = 'Cf09VerificationError'
    this.diagnostic = diagnostic
  }
}

export interface ContractManifestV1 {
  readonly manifestVersion: 1
  readonly contractId: string
  readonly schemaId: string
  readonly protocolVersion: number
  readonly projectionVersion: number
  readonly generatorVersion: number
  readonly generatorSourceSha256: string
  readonly typescriptGeneratedContractPath: string
  readonly typescriptGeneratedContractSha256: string
  readonly unityConsumerRepository: string
  readonly unityGeneratedContractPath: string
  readonly unityGeneratedContractSha256: string
}

export interface ContractPairRequest {
  readonly mode: 'seal' | 'immutable'
  readonly typescriptRoot: string
  readonly typescriptCommit: string
  readonly typescriptRef?: string | undefined
  readonly typescriptRemote?: string | undefined
  readonly unityRoot: string
  readonly unityCommit: string
  readonly unityRef?: string | undefined
  readonly unityRemote?: string | undefined
  readonly runGeneratorCheck?: boolean | undefined
  /** Test-only dependency seam. The production CLI never supplies this hook. */
  readonly remoteRefResolver?: RemoteRefResolver | undefined
}

export type RemoteRefResolver = (input: {
  readonly role: 'typescript' | 'unity'
  readonly root: string
  readonly remote: string
  readonly ref: string
}) => string

export interface ContractPairFacts {
  readonly schemaId: string
  readonly protocolVersion: number
  readonly projectionVersion: number
  readonly generatorVersion: number
  readonly generatorSourceSha256: string
  readonly contractManifestSha256: string
  readonly typescriptCommit: string
  readonly typescriptTree: string
  readonly typescriptRef: string
  readonly typescriptCleanStatusSha256: string
  readonly typescriptGeneratedContractGitBlob: string
  readonly typescriptGeneratedContractSha256: string
  readonly typescriptGeneratedFixtureGitBlob: string
  readonly typescriptGeneratedFixtureSha256: string
  readonly unityCommit: string
  readonly unityTree: string
  readonly unityRef: string
  readonly unityCleanStatusSha256: string
  readonly unityGeneratedContractGitBlob: string
  readonly unityGeneratedContractSha256: string
  readonly unityGeneratedFixtureGitBlob: string
  readonly unityGeneratedFixtureSha256: string
  readonly fixtureCorpusSourceSha256: string
}

export interface EditModeEvidence {
  readonly resultPath: string
  readonly logPath: string
}

export interface ContractGateAttestationV1 {
  readonly attestationVersion: 1
  readonly contractManifestPath: string
  readonly contractManifestSha256: string
  readonly contractId: string
  readonly schemaId: string
  readonly protocolVersion: number
  readonly projectionVersion: number
  readonly saveVersion: number
  readonly generatorVersion: number
  readonly generatorSourceSha256: string
  readonly verifierSourceSha256: string
  readonly fixtureCorpusVersion: number
  readonly fixtureCorpusSourceSha256: string
  readonly typescriptRepository: string
  readonly typescriptSourceCommit: string
  readonly typescriptTree: string
  readonly typescriptRef: string
  readonly typescriptClean: true
  readonly typescriptCleanStatusSha256: string
  readonly typescriptGeneratedContractPath: string
  readonly typescriptGeneratedContractGitBlob: string
  readonly typescriptGeneratedContractSha256: string
  readonly typescriptGeneratedFixturePath: string
  readonly typescriptGeneratedFixtureGitBlob: string
  readonly typescriptGeneratedFixtureSha256: string
  readonly unityConsumerRepository: string
  readonly unityConsumerCommit: string
  readonly unityTree: string
  readonly unityRef: string
  readonly unityClean: true
  readonly unityCleanStatusSha256: string
  readonly unityGeneratedContractPath: string
  readonly unityGeneratedContractGitBlob: string
  readonly unityGeneratedContractSha256: string
  readonly unityGeneratedFixturePath: string
  readonly unityGeneratedFixtureGitBlob: string
  readonly unityGeneratedFixtureSha256: string
  readonly compiledFixtureEditModeResultPath: string
  readonly compiledFixtureEditModeResultSha256: string
  readonly compiledFixtureEditModeLogPath: string
  readonly compiledFixtureEditModeLogSha256: string
  readonly compiledFixtureEditModeTestCount: number
  readonly compiledFixtureEditModePassedCount: number
  readonly compiledFixtureEditModeFailedCount: number
  readonly compiledFixtureEditModeSkippedCount: number
  readonly verificationCommand: readonly string[]
  readonly verificationResult: 'PASS'
}

interface RepositoryContext {
  readonly role: 'typescript' | 'unity'
  readonly root: string
  readonly repository: string
  readonly commit: string
  readonly ref: string | null
  readonly remote: string
  readonly cleanStatusSha256: string
}

interface GitBlob {
  readonly oid: string
  readonly bytes: Buffer
}

interface TestCounts {
  readonly total: number
  readonly passed: number
  readonly failed: number
  readonly skipped: number
}

const EMPTY_SHA256 = sha256(Buffer.alloc(0))
const SHA256_PATTERN = /^[0-9a-f]{64}$/
const COMMIT_PATTERN = /^[0-9a-f]{40}$/
const GIT_OBJECT_PATTERN = /^[0-9a-f]{40,64}$/

function fail(diagnostic: Cf09Diagnostic): never {
  throw new Cf09VerificationError(diagnostic)
}

export function formatDiagnostic(diagnostic: Cf09Diagnostic): string {
  const locations = [
    `stage=${diagnostic.stage}`,
    `role=${diagnostic.role}`,
    diagnostic.commit === undefined ? null : `commit=${diagnostic.commit}`,
    diagnostic.path === undefined ? null : `path=${diagnostic.path}`,
    diagnostic.expected === undefined ? null : `expected=${String(diagnostic.expected)}`,
    diagnostic.observed === undefined ? null : `observed=${String(diagnostic.observed)}`,
  ].filter((entry): entry is string => entry !== null)
  return `${diagnostic.code}: ${locations.join(' ')}; ${diagnostic.remediation}`
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function ordinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson)
  const record = asRecord(value)
  if (record === null) return value
  return Object.fromEntries(
    Object.keys(record).sort(ordinal).map((key) => [key, sortJson(record[key])]),
  )
}

export function canonicalJson(value: unknown): string {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`
}

export function sha256(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function uint32(value: number): Buffer {
  const bytes = Buffer.alloc(4)
  bytes.writeUInt32BE(value)
  return bytes
}

function uint64(value: number): Buffer {
  const bytes = Buffer.alloc(8)
  bytes.writeBigUInt64BE(BigInt(value))
  return bytes
}

export function validateRelativePath(path: string, allowed?: ReadonlySet<string>): string {
  const invalid = path.length === 0
    || path.includes('\0')
    || path.includes('\\')
    || path.includes('%')
    || path.startsWith('/')
    || /^[A-Za-z]:/.test(path)
    || path.split('/').some((part) => part.length === 0 || part === '.' || part === '..')
  if (invalid || (allowed !== undefined && !allowed.has(path))) {
    fail({
      code: 'CF09_PATH_INVALID',
      stage: 'path-preflight',
      role: 'typescript',
      path,
      expected: allowed === undefined ? 'canonical relative path' : [...allowed].join(' | '),
      observed: path,
      remediation: 'Use the fixed reviewed repository-relative contract path.',
    })
  }
  return path
}

export function sourceBundleSha256(entries: ReadonlyMap<string, Buffer>): string {
  const paths = [...entries.keys()].sort(ordinal)
  if (paths.length !== entries.size) {
    fail({
      code: 'CF09_GENERATOR_SOURCE_MISMATCH',
      stage: 'source-validation',
      role: 'typescript',
      expected: 'unique source paths',
      observed: 'duplicate source path',
      remediation: 'Use each closed source-bundle path exactly once.',
    })
  }
  const parts: Buffer[] = [
    Buffer.from('PROJECT_STUDIO_CF09_SOURCE_BUNDLE_V1', 'ascii'),
    Buffer.from([0]),
    uint32(paths.length),
  ]
  for (const path of paths) {
    validateRelativePath(path)
    const pathBytes = Buffer.from(path, 'utf8')
    const content = entries.get(path)
    if (content === undefined) {
      fail({
        code: 'CF09_GENERATOR_SOURCE_MISMATCH',
        stage: 'source-validation',
        role: 'typescript',
        path,
        expected: 'source bytes',
        observed: 'missing',
        remediation: 'Restore the exact closed source bundle.',
      })
    }
    parts.push(uint32(pathBytes.length), pathBytes, uint64(content.length), content)
  }
  return sha256(Buffer.concat(parts))
}

interface CommandResult {
  readonly status: number | null
  readonly stdout: Buffer
}

function command(program: string, args: readonly string[], cwd: string): CommandResult {
  const result = spawnSync(program, [...args], {
    cwd,
    encoding: 'buffer',
    env: {
      ...process.env,
      GIT_OPTIONAL_LOCKS: '0',
      GIT_TERMINAL_PROMPT: '0',
      LANG: 'C',
      LC_ALL: 'C',
    },
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return {
    status: result.status,
    stdout: Buffer.isBuffer(result.stdout) ? result.stdout : Buffer.alloc(0),
  }
}

function git(root: string, args: readonly string[], diagnostic: Cf09Diagnostic): Buffer {
  const result = command('git', args, root)
  if (result.status !== 0) fail(diagnostic)
  return result.stdout
}

function trimAscii(bytes: Buffer): string {
  return bytes.toString('utf8').trim()
}

function requireCommit(value: string, role: 'typescript' | 'unity'): string {
  if (!COMMIT_PATTERN.test(value)) {
    fail({
      code: 'CF09_COMMIT_NOT_FOUND',
      stage: 'arguments',
      role,
      commit: value,
      expected: 'lowercase 40-character commit SHA',
      observed: value,
      remediation: 'Supply the immutable full commit SHA, not a branch, tag, or abbreviation.',
    })
  }
  return value
}

function requireRef(value: string | undefined, role: 'typescript' | 'unity', mode: 'seal' | 'immutable'): string | null {
  if (value === undefined) {
    if (mode === 'seal') {
      fail({
        code: 'CF09_REF_MISMATCH',
        stage: 'arguments',
        role,
        expected: 'refs/heads/<sealed-branch>',
        observed: 'missing',
        remediation: 'Supply the exact fully qualified WIP branch ref.',
      })
    }
    return null
  }
  const result = command('git', ['check-ref-format', value], process.cwd())
  if (!value.startsWith('refs/heads/') || result.status !== 0) {
    fail({
      code: 'CF09_REF_MISMATCH',
      stage: 'arguments',
      role,
      expected: 'valid refs/heads/... ref',
      observed: value,
      remediation: 'Use the exact fully qualified branch ref, without revision syntax.',
    })
  }
  return value
}

export function normalizeGithubRepository(remoteUrl: string): string | null {
  const scp = /^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/.exec(remoteUrl)
  if (scp !== null) return `${scp[1]!}/${scp[2]!}`
  try {
    const parsed = new URL(remoteUrl)
    if (
      !['https:', 'ssh:'].includes(parsed.protocol)
      || parsed.hostname.toLowerCase() !== 'github.com'
      || parsed.port !== ''
      || parsed.search !== ''
      || parsed.hash !== ''
      || (parsed.protocol === 'ssh:' && parsed.username !== 'git')
      || (parsed.protocol === 'https:' && (parsed.username !== '' || parsed.password !== ''))
    ) return null
    const segments = parsed.pathname.split('/').filter((segment) => segment.length > 0)
    if (segments.length !== 2) return null
    const repository = segments[1]!.endsWith('.git') ? segments[1]!.slice(0, -4) : segments[1]!
    if (repository.length === 0) return null
    return `${segments[0]!}/${repository}`
  } catch {
    return null
  }
}

function canonicalRoot(suppliedRoot: string, role: 'typescript' | 'unity'): string {
  if (!isAbsolute(suppliedRoot)) {
    fail({
      code: 'CF09_ROOT_NOT_TOPLEVEL',
      stage: 'root-preflight',
      role,
      root: suppliedRoot,
      expected: 'absolute Git top-level path',
      observed: suppliedRoot,
      remediation: 'Pass the isolated worktree top-level as an absolute path.',
    })
  }
  let suppliedRealpath: string
  try {
    if (lstatSync(suppliedRoot).isSymbolicLink()) {
      fail({
        code: 'CF09_PATH_REDIRECTED',
        stage: 'root-preflight',
        role,
        root: suppliedRoot,
        expected: 'nonsymlinked repository root',
        observed: 'symbolic link',
        remediation: 'Pass the physical isolated Git worktree root.',
      })
    }
    suppliedRealpath = realpathSync.native(suppliedRoot)
  } catch (error) {
    if (error instanceof Cf09VerificationError) throw error
    fail({
      code: 'CF09_ROOT_NOT_TOPLEVEL',
      stage: 'root-preflight',
      role,
      root: suppliedRoot,
      expected: 'existing Git top-level',
      observed: 'missing or unreadable',
      remediation: 'Pass an existing isolated Git worktree root.',
    })
  }
  if (resolve(suppliedRoot) !== suppliedRealpath) {
    fail({
      code: 'CF09_PATH_REDIRECTED',
      stage: 'root-preflight',
      role,
      root: suppliedRoot,
      expected: suppliedRealpath,
      observed: resolve(suppliedRoot),
      remediation: 'Pass the physical nonsymlinked Git worktree root.',
    })
  }
  const topLevel = trimAscii(git(suppliedRealpath, ['rev-parse', '--show-toplevel'], {
    code: 'CF09_ROOT_NOT_TOPLEVEL',
    stage: 'root-preflight',
    role,
    root: suppliedRealpath,
    expected: 'Git top-level',
    observed: 'not a Git worktree',
    remediation: 'Pass the repository top-level, not a parent, child, or copied directory.',
  }))
  let topLevelRealpath: string
  try {
    topLevelRealpath = realpathSync.native(topLevel)
  } catch {
    fail({
      code: 'CF09_ROOT_NOT_TOPLEVEL',
      stage: 'root-preflight',
      role,
      root: suppliedRealpath,
      expected: suppliedRealpath,
      observed: topLevel,
      remediation: 'Repair the Git worktree root before verification.',
    })
  }
  if (topLevelRealpath !== suppliedRealpath) {
    fail({
      code: 'CF09_ROOT_NOT_TOPLEVEL',
      stage: 'root-preflight',
      role,
      root: suppliedRealpath,
      expected: topLevelRealpath,
      observed: suppliedRealpath,
      remediation: 'Pass the exact Git top-level rather than a repository subdirectory.',
    })
  }
  return suppliedRealpath
}

function verifyRepositoryIdentity(root: string, role: 'typescript' | 'unity', remote: string, expected: string): void {
  const rewrites = command('git', ['config', '--get-regexp', '^url\\..*\\.insteadof$'], root)
  if (rewrites.status === 0 && rewrites.stdout.length > 0) {
    fail({
      code: 'CF09_REPOSITORY_MISMATCH',
      stage: 'repository-identity',
      role,
      root,
      expected: 'direct canonical GitHub remote without URL rewrites',
      observed: 'url.*.insteadOf configured',
      remediation: 'Remove URL rewriting from the sealed repository verification environment.',
    })
  }
  const configured = trimAscii(git(root, ['config', '--get', `remote.${remote}.url`], {
    code: 'CF09_REPOSITORY_MISMATCH',
    stage: 'repository-identity',
    role,
    root,
    expected,
    observed: `missing remote ${remote}`,
    remediation: 'Configure the intended canonical GitHub remote before verification.',
  }))
  const normalized = normalizeGithubRepository(configured)
  if (normalized === null || normalized.toLowerCase() !== expected.toLowerCase()) {
    fail({
      code: 'CF09_REPOSITORY_MISMATCH',
      stage: 'repository-identity',
      role,
      root,
      expected,
      observed: normalized ?? 'noncanonical remote URL',
      remediation: 'Use the canonical GitHub repository and intended remote.',
    })
  }
}

function verifyCommitExists(root: string, role: 'typescript' | 'unity', commit: string): void {
  git(root, ['cat-file', '-e', `${commit}^{commit}`], {
    code: 'CF09_COMMIT_NOT_FOUND',
    stage: 'commit-preflight',
    role,
    root,
    commit,
    expected: 'existing commit object',
    observed: 'not found',
    remediation: 'Fetch the exact immutable commit from the canonical remote.',
  })
  const resolved = trimAscii(git(root, ['rev-parse', '--verify', `${commit}^{commit}`], {
    code: 'CF09_COMMIT_NOT_FOUND',
    stage: 'commit-preflight',
    role,
    root,
    commit,
    expected: commit,
    observed: 'unresolvable',
    remediation: 'Fetch the exact immutable commit from the canonical remote.',
  }))
  if (resolved !== commit) {
    fail({
      code: 'CF09_COMMIT_NOT_FOUND',
      stage: 'commit-preflight',
      role,
      root,
      commit,
      expected: commit,
      observed: resolved,
      remediation: 'Supply the exact commit object identity.',
    })
  }
}

function verifySealRef(context: RepositoryContext, remoteRefResolver?: RemoteRefResolver): void {
  const head = trimAscii(git(context.root, ['rev-parse', '--verify', 'HEAD^{commit}'], {
    code: 'CF09_HEAD_MISMATCH',
    stage: 'ref-preflight',
    role: context.role,
    root: context.root,
    commit: context.commit,
    expected: context.commit,
    observed: 'unresolvable HEAD',
    remediation: 'Check out the exact sealed commit before verification.',
  }))
  if (head !== context.commit) {
    fail({
      code: 'CF09_HEAD_MISMATCH',
      stage: 'ref-preflight',
      role: context.role,
      root: context.root,
      commit: context.commit,
      expected: context.commit,
      observed: head,
      remediation: 'Check out the exact sealed commit before verification.',
    })
  }
  const symbolic = command('git', ['symbolic-ref', '-q', 'HEAD'], context.root)
  const observedRef = symbolic.status === 0 ? trimAscii(symbolic.stdout) : '<detached>'
  if (context.ref === null || observedRef !== context.ref) {
    fail({
      code: 'CF09_REF_MISMATCH',
      stage: 'ref-preflight',
      role: context.role,
      root: context.root,
      commit: context.commit,
      expected: context.ref ?? 'refs/heads/<sealed-branch>',
      observed: observedRef,
      remediation: 'Check out the exact sealed WIP branch, not a coincidentally matching branch.',
    })
  }
  const localRef = trimAscii(git(context.root, ['rev-parse', '--verify', `${context.ref}^{commit}`], {
    code: 'CF09_REF_MISMATCH',
    stage: 'ref-preflight',
    role: context.role,
    root: context.root,
    commit: context.commit,
    expected: context.commit,
    observed: 'missing local ref',
    remediation: 'Create or fetch the exact sealed branch ref.',
  }))
  if (localRef !== context.commit) {
    fail({
      code: 'CF09_REF_MISMATCH',
      stage: 'ref-preflight',
      role: context.role,
      root: context.root,
      commit: context.commit,
      expected: context.commit,
      observed: localRef,
      remediation: 'Move only the isolated WIP ref to the exact sealed commit.',
    })
  }
  let remoteCommit = '<missing>'
  let remoteSucceeded = false
  if (remoteRefResolver !== undefined) {
    remoteCommit = remoteRefResolver({
      role: context.role,
      root: context.root,
      remote: context.remote,
      ref: context.ref,
    })
    remoteSucceeded = true
  } else {
    const remoteResult = command('git', ['ls-remote', '--exit-code', '--refs', context.remote, context.ref], context.root)
    const lines = trimAscii(remoteResult.stdout).split('\n').filter((line) => line.length > 0)
    const remoteEntry = lines.length === 1 ? lines[0]!.split('\t') : []
    remoteCommit = remoteEntry.length === 2 && remoteEntry[1] === context.ref ? remoteEntry[0]! : '<missing>'
    remoteSucceeded = remoteResult.status === 0
  }
  if (!remoteSucceeded || remoteCommit !== context.commit) {
    fail({
      code: 'CF09_REF_MISMATCH',
      stage: 'ref-preflight',
      role: context.role,
      root: context.root,
      commit: context.commit,
      expected: context.commit,
      observed: remoteCommit,
      remediation: 'Push the exact immutable WIP commit to the intended canonical remote ref.',
    })
  }
}

function pathInside(root: string, target: string): boolean {
  const delta = relative(root, target)
  return delta === '' || (!delta.startsWith(`..${sep}`) && delta !== '..' && !isAbsolute(delta))
}

function verifyWorktreePath(root: string, path: string, role: 'typescript' | 'unity'): void {
  validateRelativePath(path)
  let cursor = root
  for (const part of path.split('/')) {
    cursor = join(cursor, part)
    let stat
    try {
      stat = lstatSync(cursor)
    } catch {
      fail({
        code: 'CF09_CONSUMER_MISSING',
        stage: 'path-preflight',
        role,
        root,
        path,
        expected: 'regular tracked consumer',
        observed: 'missing',
        remediation: 'Restore the fixed generated consumer path from the exact commit.',
      })
    }
    if (stat.isSymbolicLink()) {
      fail({
        code: 'CF09_PATH_REDIRECTED',
        stage: 'path-preflight',
        role,
        root,
        path,
        expected: 'nonsymlinked contained path',
        observed: `symbolic link at ${relative(root, cursor)}`,
        remediation: 'Replace every redirected component with the reviewed repository path.',
      })
    }
  }
  const target = realpathSync.native(cursor)
  if (!pathInside(root, target) || !lstatSync(target).isFile()) {
    fail({
      code: 'CF09_PATH_REDIRECTED',
      stage: 'path-preflight',
      role,
      root,
      path,
      expected: 'contained regular file',
      observed: pathInside(root, target) ? 'not a regular file' : 'path escape',
      remediation: 'Restore the fixed regular generated-consumer file.',
    })
  }
}

function cleanStatus(root: string, role: 'typescript' | 'unity', commit: string): string {
  const status = git(root, [
    'status',
    '--porcelain=v1',
    '-z',
    '--untracked-files=all',
    '--ignore-submodules=none',
  ], {
    code: role === 'typescript' ? 'CF09_TYPESCRIPT_DIRTY' : 'CF09_UNITY_DIRTY',
    stage: 'clean-tree',
    role,
    root,
    commit,
    expected: 'readable clean status',
    observed: 'git status failed',
    remediation: 'Repair the isolated worktree before verification.',
  })
  if (status.length !== 0) {
    fail({
      code: role === 'typescript' ? 'CF09_TYPESCRIPT_DIRTY' : 'CF09_UNITY_DIRTY',
      stage: 'clean-tree',
      role,
      root,
      commit,
      expected: EMPTY_SHA256,
      observed: sha256(status),
      remediation: 'Commit intended gate changes and remove unintended staged, unstaged, or untracked changes.',
    })
  }
  return sha256(status)
}

interface TreeEntry {
  readonly mode: string
  readonly type: string
  readonly oid: string
  readonly path: string
}

function treeEntry(root: string, role: 'typescript' | 'unity', commit: string, path: string): TreeEntry | null {
  const output = git(root, ['ls-tree', '-z', '--full-tree', commit, '--', path], {
    code: 'CF09_COMMIT_NOT_FOUND',
    stage: 'commit-preflight',
    role,
    root,
    commit,
    path,
    expected: 'readable commit tree',
    observed: 'git ls-tree failed',
    remediation: 'Fetch and verify the exact commit object.',
  })
  const records = output.toString('utf8').split('\0').filter((record) => record.length > 0)
  if (records.length === 0) return null
  if (records.length !== 1) return null
  const match = /^(\d{6}) ([^ ]+) ([0-9a-f]+)\t([\s\S]+)$/.exec(records[0]!)
  if (match === null || match[4] !== path) return null
  return { mode: match[1]!, type: match[2]!, oid: match[3]!, path: match[4]! }
}

function committedBlob(
  root: string,
  role: 'typescript' | 'unity',
  commit: string,
  path: string,
  missingCode: Cf09DiagnosticCode,
): GitBlob {
  validateRelativePath(path)
  const parts = path.split('/')
  for (let index = 1; index < parts.length; index += 1) {
    const prefix = parts.slice(0, index).join('/')
    const entry = treeEntry(root, role, commit, prefix)
    if (entry === null) {
      fail({
        code: missingCode,
        stage: 'path-preflight',
        role,
        root,
        commit,
        path,
        expected: `tree component ${prefix}`,
        observed: 'missing',
        remediation: 'Restore the exact reviewed committed path.',
      })
    }
    if (entry.mode === '120000' || entry.type !== 'tree' || entry.mode !== '040000') {
      fail({
        code: 'CF09_PATH_REDIRECTED',
        stage: 'path-preflight',
        role,
        root,
        commit,
        path,
        expected: `regular tree component ${prefix}`,
        observed: `${entry.mode} ${entry.type}`,
        remediation: 'Remove symlink, submodule, or non-tree redirection from the committed path.',
      })
    }
  }
  const entry = treeEntry(root, role, commit, path)
  if (entry === null) {
    fail({
      code: missingCode,
      stage: 'consumer-verification',
      role,
      root,
      commit,
      path,
      expected: '100644 blob',
      observed: 'missing',
      remediation: 'Commit the exact generated artifact at the fixed reviewed path.',
    })
  }
  if (entry.mode === '120000') {
    fail({
      code: 'CF09_PATH_REDIRECTED',
      stage: 'path-preflight',
      role,
      root,
      commit,
      path,
      expected: '100644 blob',
      observed: '120000 symlink',
      remediation: 'Commit a regular generated file, never a symbolic link.',
    })
  }
  if (entry.mode !== '100644' || entry.type !== 'blob' || !GIT_OBJECT_PATTERN.test(entry.oid)) {
    fail({
      code: 'CF09_PATH_INVALID',
      stage: 'path-preflight',
      role,
      root,
      commit,
      path,
      expected: '100644 blob',
      observed: `${entry.mode} ${entry.type}`,
      remediation: 'Commit the artifact as a non-executable regular Git blob.',
    })
  }
  return {
    oid: entry.oid,
    bytes: git(root, ['cat-file', 'blob', entry.oid], {
      code: 'CF09_COMMIT_NOT_FOUND',
      stage: 'commit-preflight',
      role,
      root,
      commit,
      path,
      expected: entry.oid,
      observed: 'blob unreadable',
      remediation: 'Fetch and verify the complete exact commit object.',
    }),
  }
}

function sourceBundleFromCommit(
  context: RepositoryContext,
  paths: readonly string[],
  code: 'CF09_GENERATOR_SOURCE_MISMATCH' | 'CF09_VERIFIER_SOURCE_MISMATCH' | 'CF09_FIXTURE_SOURCE_MISMATCH',
): string {
  const entries = new Map<string, Buffer>()
  for (const path of paths) {
    try {
      entries.set(path, committedBlob(context.root, context.role, context.commit, path, code).bytes)
    } catch (error) {
      if (error instanceof Cf09VerificationError && error.diagnostic.code === code) throw error
      if (error instanceof Cf09VerificationError && error.diagnostic.code === 'CF09_PATH_REDIRECTED') throw error
      fail({
        code,
        stage: 'source-validation',
        role: context.role,
        root: context.root,
        commit: context.commit,
        path,
        expected: 'regular committed source blob',
        observed: 'missing or invalid',
        remediation: 'Restore the exact closed source bundle in the attested commit.',
      })
    }
  }
  return sourceBundleSha256(entries)
}

function workingSourceBundle(root: string, paths: readonly string[], code: 'CF09_VERIFIER_SOURCE_MISMATCH'): string {
  const entries = new Map<string, Buffer>()
  for (const path of paths) {
    const absolute = join(root, ...path.split('/'))
    try {
      verifyWorktreePath(root, path, 'typescript')
      entries.set(path, readFileSync(absolute))
    } catch (error) {
      if (error instanceof Cf09VerificationError && error.diagnostic.code === 'CF09_PATH_REDIRECTED') throw error
      fail({
        code,
        stage: 'source-validation',
        role: 'verifier',
        root,
        path,
        expected: 'executing verifier source',
        observed: 'missing or unreadable',
        remediation: 'Run the verifier from the exact attested TypeScript source checkout.',
      })
    }
  }
  return sourceBundleSha256(entries)
}

function parseManifest(bytes: Buffer, root: string, commit: string): ContractManifestV1 {
  let value: unknown
  try {
    value = JSON.parse(bytes.toString('utf8'))
  } catch {
    fail({
      code: 'CF09_MANIFEST_MISMATCH',
      stage: 'manifest-validation',
      role: 'typescript',
      root,
      commit,
      path: MANIFEST_PATH,
      expected: 'canonical JSON manifest',
      observed: 'invalid JSON',
      remediation: 'Regenerate the deterministic contract manifest.',
    })
  }
  const record = asRecord(value)
  const keys = record === null ? [] : Object.keys(record).sort(ordinal)
  if (record === null || keys.join('\0') !== [...MANIFEST_KEYS].sort(ordinal).join('\0')) {
    fail({
      code: 'CF09_MANIFEST_MISMATCH',
      stage: 'manifest-validation',
      role: 'typescript',
      root,
      commit,
      path: MANIFEST_PATH,
      expected: [...MANIFEST_KEYS].sort(ordinal).join(','),
      observed: keys.join(','),
      remediation: 'Regenerate the closed manifest without commit fields or unknown keys.',
    })
  }
  if (canonicalJson(record) !== bytes.toString('utf8')) {
    fail({
      code: 'CF09_MANIFEST_MISMATCH',
      stage: 'manifest-validation',
      role: 'typescript',
      root,
      commit,
      path: MANIFEST_PATH,
      expected: 'ordinal canonical JSON with one final line feed',
      observed: sha256(bytes),
      remediation: 'Regenerate the deterministic contract manifest.',
    })
  }
  const manifest = record as unknown as ContractManifestV1
  const valid = manifest.manifestVersion === 1
    && manifest.contractId === CONTRACT_ID
    && typeof manifest.schemaId === 'string'
    && Number.isInteger(manifest.protocolVersion)
    && Number.isInteger(manifest.projectionVersion)
    && manifest.generatorVersion === GENERATOR_VERSION
    && SHA256_PATTERN.test(manifest.generatorSourceSha256)
    && typeof manifest.typescriptGeneratedContractPath === 'string'
    && SHA256_PATTERN.test(manifest.typescriptGeneratedContractSha256)
    && manifest.unityConsumerRepository === UNITY_REPOSITORY
    && typeof manifest.unityGeneratedContractPath === 'string'
    && SHA256_PATTERN.test(manifest.unityGeneratedContractSha256)
  if (!valid) {
    fail({
      code: 'CF09_MANIFEST_MISMATCH',
      stage: 'manifest-validation',
      role: 'typescript',
      root,
      commit,
      path: MANIFEST_PATH,
      expected: 'well-typed manifestVersion 1 fields',
      observed: 'invalid field value',
      remediation: 'Regenerate the manifest from the accepted generator.',
    })
  }
  validateRelativePath(manifest.typescriptGeneratedContractPath, new Set([TYPESCRIPT_CONTRACT_PATH]))
  validateRelativePath(manifest.unityGeneratedContractPath, new Set([UNITY_CONTRACT_PATH]))
  return manifest
}

function schemaFacts(bytes: Buffer, root: string, commit: string): {
  readonly schemaId: string
  readonly contractId: string
  readonly protocolVersion: number
  readonly projectionVersion: number
} {
  let parsed: unknown
  try {
    parsed = JSON.parse(bytes.toString('utf8'))
  } catch {
    fail({
      code: 'CF09_SCHEMA_MISMATCH',
      stage: 'schema-validation',
      role: 'typescript',
      root,
      commit,
      path: SCHEMA_PATH,
      expected: 'valid canonical bridge schema JSON',
      observed: 'invalid JSON',
      remediation: 'Regenerate the canonical bridge schema.',
    })
  }
  const rootRecord = asRecord(parsed)
  const metadata = rootRecord === null ? null : asRecord(rootRecord['x-project-studio'])
  const contractId = metadata?.['contractId']
  const protocolVersion = metadata?.['protocolVersion']
  const projectionVersion = metadata?.['projectionVersion']
  if (
    typeof contractId !== 'string'
    || !Number.isInteger(protocolVersion)
    || !Number.isInteger(projectionVersion)
  ) {
    fail({
      code: 'CF09_SCHEMA_MISMATCH',
      stage: 'schema-validation',
      role: 'typescript',
      root,
      commit,
      path: SCHEMA_PATH,
      expected: 'closed x-project-studio contract metadata',
      observed: 'missing or invalid',
      remediation: 'Regenerate the canonical bridge schema.',
    })
  }
  const compactCanonical = JSON.stringify(sortJson(parsed))
  return {
    schemaId: `sha256:${sha256(compactCanonical)}`,
    contractId,
    protocolVersion: protocolVersion as number,
    projectionVersion: projectionVersion as number,
  }
}

function compare(
  code: Cf09DiagnosticCode,
  stage: Cf09Stage,
  role: RepositoryRole,
  expected: string | number | boolean,
  observed: string | number | boolean,
  remediation: string,
  context: { readonly root?: string; readonly commit?: string; readonly path?: string } = {},
): void {
  if (expected === observed) return
  fail({ code, stage, role, expected, observed, remediation, ...context })
}

function repositoryContext(
  role: 'typescript' | 'unity',
  suppliedRoot: string,
  repository: string,
  suppliedCommit: string,
  suppliedRef: string | undefined,
  suppliedRemote: string | undefined,
  mode: 'seal' | 'immutable',
  remoteRefResolver?: RemoteRefResolver,
): RepositoryContext {
  const root = canonicalRoot(suppliedRoot, role)
  const commit = requireCommit(suppliedCommit, role)
  const ref = requireRef(suppliedRef, role, mode)
  const remote = suppliedRemote ?? (role === 'typescript' ? 'hspector-github' : 'origin')
  if (!/^[A-Za-z0-9._-]+$/.test(remote)) {
    fail({
      code: 'CF09_REPOSITORY_MISMATCH',
      stage: 'arguments',
      role,
      root,
      expected: 'simple configured remote name',
      observed: remote,
      remediation: 'Use the intended configured canonical remote name.',
    })
  }
  verifyRepositoryIdentity(root, role, remote, repository)
  verifyCommitExists(root, role, commit)
  const context: RepositoryContext = {
    role,
    root,
    repository,
    commit,
    ref,
    remote,
    cleanStatusSha256: EMPTY_SHA256,
  }
  if (mode === 'seal') verifySealRef(context, remoteRefResolver)
  return context
}

function runGenerator(root: string, commit: string, mode: 'seal' | 'immutable'): void {
  if (mode === 'seal') {
    for (const script of ['check:bridge-contract', 'check:bridge-contract:fixtures']) {
      const result = command('npm', ['run', script], root)
      if (result.status !== 0) {
        fail({
          code: 'CF09_GENERATOR_EXECUTION_FAILED',
          stage: 'regeneration',
          role: 'typescript',
          root,
          commit,
          expected: `exact committed ${script} PASS`,
          observed: `exit ${String(result.status)}`,
          remediation: `Run and repair the accepted ${script} command at the exact commit.`,
        })
      }
    }
    return
  }

  const temporaryRoot = mkdtempSync(join(tmpdir(), 'project-studio-cf09-immutable-'))
  try {
    const commands: ReadonlyArray<readonly [string, readonly string[]]> = [
      ['git', ['init', '-q']],
      ['git', ['fetch', '-q', '--no-tags', '--depth=1', root, commit]],
      ['git', ['checkout', '-q', '--detach', 'FETCH_HEAD']],
      ['npm', ['ci', '--ignore-scripts', '--no-audit', '--fund=false']],
      ['npm', ['run', 'check:bridge-contract']],
      ['npm', ['run', 'check:bridge-contract:fixtures']],
    ]
    for (const [program, args] of commands) {
      const result = command(program, args, temporaryRoot)
      if (result.status !== 0) {
        fail({
          code: 'CF09_GENERATOR_EXECUTION_FAILED',
          stage: 'regeneration',
          role: 'typescript',
          root,
          commit,
          expected: 'isolated exact-commit generator check PASS',
          observed: `${program} exit ${String(result.status)}`,
          remediation: 'Restore the locked runtime and exact committed generator so immutable regeneration passes.',
        })
      }
    }
    const status = command('git', [
      'status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignore-submodules=none',
    ], temporaryRoot)
    if (status.status !== 0 || status.stdout.length !== 0) {
      fail({
        code: 'CF09_GENERATOR_EXECUTION_FAILED',
        stage: 'regeneration',
        role: 'typescript',
        root,
        commit,
        expected: EMPTY_SHA256,
        observed: sha256(status.stdout),
        remediation: 'Make historical check-only generation leave its isolated checkout clean.',
      })
    }
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true })
  }
}

export function verifyContractPair(request: ContractPairRequest): ContractPairFacts {
  const typescript = repositoryContext(
    'typescript',
    request.typescriptRoot,
    TYPESCRIPT_REPOSITORY,
    request.typescriptCommit,
    request.typescriptRef,
    request.typescriptRemote,
    request.mode,
    request.remoteRefResolver,
  )
  const unity = repositoryContext(
    'unity',
    request.unityRoot,
    UNITY_REPOSITORY,
    request.unityCommit,
    request.unityRef,
    request.unityRemote,
    request.mode,
    request.remoteRefResolver,
  )

  if (request.mode === 'seal') {
    verifyWorktreePath(typescript.root, MANIFEST_PATH, 'typescript')
    verifyWorktreePath(typescript.root, SCHEMA_PATH, 'typescript')
    verifyWorktreePath(typescript.root, TYPESCRIPT_CONTRACT_PATH, 'typescript')
    verifyWorktreePath(typescript.root, TYPESCRIPT_FIXTURE_PATH, 'typescript')
    verifyWorktreePath(unity.root, UNITY_CONTRACT_PATH, 'unity')
    verifyWorktreePath(unity.root, UNITY_FIXTURE_PATH, 'unity')
  }

  const typescriptClean = request.mode === 'seal'
    ? cleanStatus(typescript.root, 'typescript', typescript.commit)
    : EMPTY_SHA256
  const unityClean = request.mode === 'seal'
    ? cleanStatus(unity.root, 'unity', unity.commit)
    : EMPTY_SHA256

  const manifestBlob = committedBlob(
    typescript.root, 'typescript', typescript.commit, MANIFEST_PATH, 'CF09_MANIFEST_MISMATCH',
  )
  const manifest = parseManifest(manifestBlob.bytes, typescript.root, typescript.commit)
  const schemaBlob = committedBlob(
    typescript.root, 'typescript', typescript.commit, SCHEMA_PATH, 'CF09_SCHEMA_MISMATCH',
  )
  const schema = schemaFacts(schemaBlob.bytes, typescript.root, typescript.commit)

  compare('CF09_SCHEMA_MISMATCH', 'schema-validation', 'typescript', schema.schemaId, manifest.schemaId,
    'Regenerate the manifest from the exact canonical schema.',
    { root: typescript.root, commit: typescript.commit, path: MANIFEST_PATH })
  compare('CF09_SCHEMA_MISMATCH', 'schema-validation', 'typescript', CONTRACT_ID, schema.contractId,
    'Restore the accepted bridge contract identity.',
    { root: typescript.root, commit: typescript.commit, path: SCHEMA_PATH })
  compare('CF09_PROTOCOL_MISMATCH', 'schema-validation', 'typescript', schema.protocolVersion, manifest.protocolVersion,
    'Regenerate the contract without an unauthorized protocol version change.',
    { root: typescript.root, commit: typescript.commit, path: MANIFEST_PATH })
  compare('CF09_PROJECTION_MISMATCH', 'schema-validation', 'typescript', schema.projectionVersion, manifest.projectionVersion,
    'Regenerate the contract without an unauthorized projection version change.',
    { root: typescript.root, commit: typescript.commit, path: MANIFEST_PATH })

  const generatorSource = sourceBundleFromCommit(
    typescript, GENERATOR_SOURCE_PATHS, 'CF09_GENERATOR_SOURCE_MISMATCH',
  )
  compare('CF09_GENERATOR_SOURCE_MISMATCH', 'source-validation', 'typescript', generatorSource,
    manifest.generatorSourceSha256, 'Regenerate the manifest with the exact committed generator source bundle.',
    { root: typescript.root, commit: typescript.commit, path: MANIFEST_PATH })

  const tsContract = committedBlob(
    typescript.root, 'typescript', typescript.commit, TYPESCRIPT_CONTRACT_PATH, 'CF09_CONSUMER_MISSING',
  )
  const unityContract = committedBlob(
    unity.root, 'unity', unity.commit, UNITY_CONTRACT_PATH, 'CF09_CONSUMER_MISSING',
  )
  const tsContractHash = sha256(tsContract.bytes)
  const unityContractHash = sha256(unityContract.bytes)
  compare('CF09_CONSUMER_HASH_MISMATCH', 'consumer-verification', 'typescript',
    manifest.typescriptGeneratedContractSha256, tsContractHash,
    'Regenerate and commit the exact TypeScript generated contract blob.',
    { root: typescript.root, commit: typescript.commit, path: TYPESCRIPT_CONTRACT_PATH })
  compare('CF09_CONSUMER_HASH_MISMATCH', 'consumer-verification', 'unity',
    manifest.unityGeneratedContractSha256, unityContractHash,
    'Copy and commit the exact TypeScript generated bytes into the fixed Unity consumer.',
    { root: unity.root, commit: unity.commit, path: UNITY_CONTRACT_PATH })
  compare('CF09_CONSUMER_HASH_MISMATCH', 'consumer-verification', 'unity',
    tsContractHash, unityContractHash,
    'Copy and commit the exact TypeScript generated bytes into the actual Unity repository.',
    { root: unity.root, commit: unity.commit, path: UNITY_CONTRACT_PATH })

  const tsFixture = committedBlob(
    typescript.root, 'typescript', typescript.commit, TYPESCRIPT_FIXTURE_PATH, 'CF09_CONSUMER_MISSING',
  )
  const unityFixture = committedBlob(
    unity.root, 'unity', unity.commit, UNITY_FIXTURE_PATH, 'CF09_CONSUMER_MISSING',
  )
  const tsFixtureHash = sha256(tsFixture.bytes)
  const unityFixtureHash = sha256(unityFixture.bytes)
  compare('CF09_CONSUMER_HASH_MISMATCH', 'consumer-verification', 'unity', tsFixtureHash, unityFixtureHash,
    'Copy and commit the exact generated fixture bytes into the fixed Unity test consumer.',
    { root: unity.root, commit: unity.commit, path: UNITY_FIXTURE_PATH })

  const fixtureSource = sourceBundleFromCommit(
    typescript, FIXTURE_SOURCE_PATHS, 'CF09_FIXTURE_SOURCE_MISMATCH',
  )

  if (request.runGeneratorCheck !== false) runGenerator(typescript.root, typescript.commit, request.mode)

  if (request.mode === 'seal') {
    compare('CF09_TYPESCRIPT_DIRTY', 'clean-tree', 'typescript', typescriptClean,
      cleanStatus(typescript.root, 'typescript', typescript.commit),
      'Do not mutate the TypeScript checkout during verification.',
      { root: typescript.root, commit: typescript.commit })
    compare('CF09_UNITY_DIRTY', 'clean-tree', 'unity', unityClean,
      cleanStatus(unity.root, 'unity', unity.commit),
      'Do not mutate the Unity checkout during verification.',
      { root: unity.root, commit: unity.commit })
  }

  const typescriptTree = trimAscii(git(typescript.root, ['rev-parse', `${typescript.commit}^{tree}`], {
    code: 'CF09_COMMIT_NOT_FOUND', stage: 'commit-preflight', role: 'typescript', root: typescript.root,
    commit: typescript.commit, expected: 'tree object', observed: 'missing', remediation: 'Fetch the exact commit tree.',
  }))
  const unityTree = trimAscii(git(unity.root, ['rev-parse', `${unity.commit}^{tree}`], {
    code: 'CF09_COMMIT_NOT_FOUND', stage: 'commit-preflight', role: 'unity', root: unity.root,
    commit: unity.commit, expected: 'tree object', observed: 'missing', remediation: 'Fetch the exact commit tree.',
  }))

  return {
    schemaId: schema.schemaId,
    protocolVersion: schema.protocolVersion,
    projectionVersion: schema.projectionVersion,
    generatorVersion: manifest.generatorVersion,
    generatorSourceSha256: generatorSource,
    contractManifestSha256: sha256(manifestBlob.bytes),
    typescriptCommit: typescript.commit,
    typescriptTree,
    typescriptRef: typescript.ref ?? '',
    typescriptCleanStatusSha256: typescriptClean,
    typescriptGeneratedContractGitBlob: tsContract.oid,
    typescriptGeneratedContractSha256: tsContractHash,
    typescriptGeneratedFixtureGitBlob: tsFixture.oid,
    typescriptGeneratedFixtureSha256: tsFixtureHash,
    unityCommit: unity.commit,
    unityTree,
    unityRef: unity.ref ?? '',
    unityCleanStatusSha256: unityClean,
    unityGeneratedContractGitBlob: unityContract.oid,
    unityGeneratedContractSha256: unityContractHash,
    unityGeneratedFixtureGitBlob: unityFixture.oid,
    unityGeneratedFixtureSha256: unityFixtureHash,
    fixtureCorpusSourceSha256: fixtureSource,
  }
}

function evidenceFile(path: string, expectedName: string): Buffer {
  if (!isAbsolute(path) || path.split(sep).at(-1) !== expectedName) {
    fail({
      code: 'CF09_PATH_INVALID',
      stage: 'editmode-evidence',
      role: 'evidence',
      path,
      expected: expectedName,
      observed: path,
      remediation: 'Use the canonical artifact filename beneath the explicit evidence root.',
    })
  }
  const parent = resolve(path, '..')
  verifyExternalPath(parent, path, expectedName)
  return readFileSync(path)
}

function verifyExternalPath(root: string, absolutePath: string, relativeName: string): void {
  let canonicalRoot: string
  try {
    canonicalRoot = realpathSync.native(root)
  } catch {
    fail({
      code: 'CF09_PATH_INVALID', stage: 'path-preflight', role: 'evidence', root,
      path: relativeName, expected: 'existing evidence root', observed: 'missing',
      remediation: 'Supply the retained external evidence root.',
    })
  }
  if (resolve(root) !== canonicalRoot || !pathInside(canonicalRoot, resolve(absolutePath))) {
    fail({
      code: 'CF09_PATH_REDIRECTED', stage: 'path-preflight', role: 'evidence', root,
      path: relativeName, expected: 'contained nonsymlinked evidence path', observed: absolutePath,
      remediation: 'Use the physical retained evidence directory and canonical artifact name.',
    })
  }
  let cursor = canonicalRoot
  for (const part of relative(canonicalRoot, absolutePath).split(sep)) {
    cursor = join(cursor, part)
    let stat
    try {
      stat = lstatSync(cursor)
    } catch {
      fail({
        code: 'CF09_EDITMODE_EVIDENCE_INVALID', stage: 'editmode-evidence', role: 'evidence', root,
        path: relativeName, expected: 'retained regular evidence file', observed: 'missing',
        remediation: 'Retain the exact Unity EditMode XML and log.',
      })
    }
    if (stat.isSymbolicLink()) {
      fail({
        code: 'CF09_PATH_REDIRECTED', stage: 'path-preflight', role: 'evidence', root,
        path: relativeName, expected: 'nonsymlinked evidence path', observed: 'symbolic link',
        remediation: 'Use regular retained evidence files without redirection.',
      })
    }
  }
  if (!lstatSync(absolutePath).isFile()) {
    fail({
      code: 'CF09_EDITMODE_EVIDENCE_INVALID', stage: 'editmode-evidence', role: 'evidence', root,
      path: relativeName, expected: 'regular evidence file', observed: 'not a file',
      remediation: 'Retain the exact Unity EditMode XML and log.',
    })
  }
}

function xmlAttribute(attributes: string, name: string): string | null {
  const match = new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(attributes)
  return match?.[1] ?? null
}

function parseEditModeCounts(bytes: Buffer, path: string): TestCounts {
  const root = /<test-run\b([^>]*)>/.exec(bytes.toString('utf8'))
  if (root === null) {
    fail({
      code: 'CF09_EDITMODE_EVIDENCE_INVALID', stage: 'editmode-evidence', role: 'evidence', path,
      expected: 'Unity NUnit test-run result', observed: 'missing test-run root',
      remediation: 'Retain the exact successful full EditMode test XML.',
    })
  }
  const integerAttribute = (name: string): number => {
    const raw = xmlAttribute(root[1]!, name)
    const value = raw === null ? Number.NaN : Number(raw)
    if (!Number.isSafeInteger(value) || value < 0) {
      fail({
        code: 'CF09_EDITMODE_EVIDENCE_INVALID', stage: 'editmode-evidence', role: 'evidence', path,
        expected: `nonnegative ${name}`, observed: raw ?? 'missing',
        remediation: 'Retain a complete Unity NUnit EditMode result.',
      })
    }
    return value
  }
  const total = integerAttribute('testcasecount')
  const passed = integerAttribute('passed')
  const failed = integerAttribute('failed')
  const skipped = integerAttribute('skipped') + integerAttribute('inconclusive')
  const result = xmlAttribute(root[1]!, 'result')
  if (result !== 'Passed' || failed !== 0 || passed + failed + skipped !== total) {
    fail({
      code: 'CF09_EDITMODE_EVIDENCE_INVALID', stage: 'editmode-evidence', role: 'evidence', path,
      expected: 'result=Passed, failed=0, internally consistent counts',
      observed: `result=${result ?? 'missing'} total=${String(total)} passed=${String(passed)} failed=${String(failed)} skipped=${String(skipped)}`,
      remediation: 'Run the single authorized full non-interactive Unity EditMode pass successfully.',
    })
  }
  return { total, passed, failed, skipped }
}

function verificationCommand(input: {
  readonly attestationPath: string
  readonly typescriptRoot: string
  readonly typescriptRemote?: string | undefined
  readonly unityRoot: string
  readonly unityRemote?: string | undefined
  readonly evidenceRoot: string
}): readonly string[] {
  return [
    'npm',
    'run',
    'verify:bridge-contract-consumer',
    '--',
    '--verify-attestation',
    resolve(input.attestationPath),
    '--typescript-root',
    canonicalRoot(input.typescriptRoot, 'typescript'),
    ...(input.typescriptRemote === undefined ? [] : ['--typescript-remote', input.typescriptRemote]),
    '--unity-root',
    canonicalRoot(input.unityRoot, 'unity'),
    ...(input.unityRemote === undefined ? [] : ['--unity-remote', input.unityRemote]),
    '--evidence-root',
    canonicalRootForEvidence(input.evidenceRoot),
  ]
}

export function createAttestation(
  request: ContractPairRequest & {
    readonly saveVersion: number
    readonly attestationPath: string
    readonly editModeEvidence: EditModeEvidence
  },
): ContractGateAttestationV1 {
  if (request.mode !== 'seal') {
    fail({
      code: 'CF09_ATTESTATION_HASH_MISMATCH', stage: 'attestation', role: 'verifier',
      expected: 'seal mode', observed: request.mode,
      remediation: 'Emit an attestation only while both exact pushed WIP commits are checked out and clean.',
    })
  }
  compare('CF09_ATTESTATION_HASH_MISMATCH', 'attestation', 'typescript',
    CURRENT_ACCEPTED_SAVE_VERSION, request.saveVersion,
    'Record the accepted save version without an unauthorized bump.')
  const facts = verifyContractPair(request)
  const verifierAtCommit = sourceBundleFromCommit(
    repositoryContext(
      'typescript', request.typescriptRoot, TYPESCRIPT_REPOSITORY, request.typescriptCommit,
      request.typescriptRef, request.typescriptRemote, 'immutable',
    ),
    VERIFIER_SOURCE_PATHS,
    'CF09_VERIFIER_SOURCE_MISMATCH',
  )
  const executingVerifier = workingSourceBundle(
    canonicalRoot(request.typescriptRoot, 'typescript'), VERIFIER_SOURCE_PATHS, 'CF09_VERIFIER_SOURCE_MISMATCH',
  )
  compare('CF09_VERIFIER_SOURCE_MISMATCH', 'source-validation', 'verifier', verifierAtCommit,
    executingVerifier, 'Run the exact verifier source committed in the attested TypeScript commit.')

  const resultBytes = evidenceFile(request.editModeEvidence.resultPath, 'contract-gate-editmode.xml')
  const logBytes = evidenceFile(request.editModeEvidence.logPath, 'contract-gate-editmode.log')
  const evidenceRoot = resolve(request.editModeEvidence.resultPath, '..')
  compare('CF09_PATH_INVALID', 'editmode-evidence', 'evidence', evidenceRoot,
    resolve(request.editModeEvidence.logPath, '..'),
    'Keep the retained EditMode XML and log under one explicit evidence root.')
  const counts = parseEditModeCounts(resultBytes, 'contract-gate-editmode.xml')
  return {
    attestationVersion: ATTESTATION_VERSION,
    contractManifestPath: MANIFEST_PATH,
    contractManifestSha256: facts.contractManifestSha256,
    contractId: CONTRACT_ID,
    schemaId: facts.schemaId,
    protocolVersion: facts.protocolVersion,
    projectionVersion: facts.projectionVersion,
    saveVersion: request.saveVersion,
    generatorVersion: facts.generatorVersion,
    generatorSourceSha256: facts.generatorSourceSha256,
    verifierSourceSha256: executingVerifier,
    fixtureCorpusVersion: FIXTURE_CORPUS_VERSION,
    fixtureCorpusSourceSha256: facts.fixtureCorpusSourceSha256,
    typescriptRepository: TYPESCRIPT_REPOSITORY,
    typescriptSourceCommit: facts.typescriptCommit,
    typescriptTree: facts.typescriptTree,
    typescriptRef: facts.typescriptRef,
    typescriptClean: true,
    typescriptCleanStatusSha256: facts.typescriptCleanStatusSha256,
    typescriptGeneratedContractPath: TYPESCRIPT_CONTRACT_PATH,
    typescriptGeneratedContractGitBlob: facts.typescriptGeneratedContractGitBlob,
    typescriptGeneratedContractSha256: facts.typescriptGeneratedContractSha256,
    typescriptGeneratedFixturePath: TYPESCRIPT_FIXTURE_PATH,
    typescriptGeneratedFixtureGitBlob: facts.typescriptGeneratedFixtureGitBlob,
    typescriptGeneratedFixtureSha256: facts.typescriptGeneratedFixtureSha256,
    unityConsumerRepository: UNITY_REPOSITORY,
    unityConsumerCommit: facts.unityCommit,
    unityTree: facts.unityTree,
    unityRef: facts.unityRef,
    unityClean: true,
    unityCleanStatusSha256: facts.unityCleanStatusSha256,
    unityGeneratedContractPath: UNITY_CONTRACT_PATH,
    unityGeneratedContractGitBlob: facts.unityGeneratedContractGitBlob,
    unityGeneratedContractSha256: facts.unityGeneratedContractSha256,
    unityGeneratedFixturePath: UNITY_FIXTURE_PATH,
    unityGeneratedFixtureGitBlob: facts.unityGeneratedFixtureGitBlob,
    unityGeneratedFixtureSha256: facts.unityGeneratedFixtureSha256,
    compiledFixtureEditModeResultPath: 'contract-gate-editmode.xml',
    compiledFixtureEditModeResultSha256: sha256(resultBytes),
    compiledFixtureEditModeLogPath: 'contract-gate-editmode.log',
    compiledFixtureEditModeLogSha256: sha256(logBytes),
    compiledFixtureEditModeTestCount: counts.total,
    compiledFixtureEditModePassedCount: counts.passed,
    compiledFixtureEditModeFailedCount: counts.failed,
    compiledFixtureEditModeSkippedCount: counts.skipped,
    verificationCommand: verificationCommand({
      attestationPath: request.attestationPath,
      typescriptRoot: request.typescriptRoot,
      typescriptRemote: request.typescriptRemote,
      unityRoot: request.unityRoot,
      unityRemote: request.unityRemote,
      evidenceRoot,
    }),
    verificationResult: 'PASS',
  }
}

function parseAttestation(bytes: Buffer, path: string): ContractGateAttestationV1 {
  let value: unknown
  try {
    value = JSON.parse(bytes.toString('utf8'))
  } catch {
    fail({
      code: 'CF09_ATTESTATION_HASH_MISMATCH', stage: 'attestation', role: 'verifier', path,
      expected: 'canonical attestation JSON', observed: 'invalid JSON',
      remediation: 'Use the exact emitted post-commit attestation.',
    })
  }
  const record = asRecord(value)
  const keys = record === null ? [] : Object.keys(record).sort(ordinal)
  if (
    record === null
    || keys.join('\0') !== [...ATTESTATION_KEYS].sort(ordinal).join('\0')
    || canonicalJson(record) !== bytes.toString('utf8')
  ) {
    fail({
      code: 'CF09_ATTESTATION_HASH_MISMATCH', stage: 'attestation', role: 'verifier', path,
      expected: [...ATTESTATION_KEYS].sort(ordinal).join(','), observed: keys.join(','),
      remediation: 'Use the unchanged closed canonical attestation emitted after both commits existed.',
    })
  }
  return record as unknown as ContractGateAttestationV1
}

function assertAttestationField(
  field: string,
  expected: string | number | boolean,
  observed: string | number | boolean,
): void {
  compare('CF09_ATTESTATION_HASH_MISMATCH', 'attestation', 'verifier', expected, observed,
    `Restore the attested ${field} to the independently verified value.`, { path: field })
}

export function verifyAttestation(request: {
  readonly attestationPath: string
  readonly typescriptRoot: string
  readonly typescriptRemote?: string | undefined
  readonly unityRoot: string
  readonly unityRemote?: string | undefined
  readonly evidenceRoot: string
  readonly runGeneratorCheck?: boolean | undefined
}): ContractGateAttestationV1 {
  const attestationBytes = evidenceFile(request.attestationPath, request.attestationPath.split(sep).at(-1) ?? '')
  const attestation = parseAttestation(attestationBytes, request.attestationPath)
  const basicValid = attestation.attestationVersion === ATTESTATION_VERSION
    && attestation.contractId === CONTRACT_ID
    && attestation.typescriptRepository === TYPESCRIPT_REPOSITORY
    && attestation.unityConsumerRepository === UNITY_REPOSITORY
    && attestation.contractManifestPath === MANIFEST_PATH
    && attestation.typescriptGeneratedContractPath === TYPESCRIPT_CONTRACT_PATH
    && attestation.typescriptGeneratedFixturePath === TYPESCRIPT_FIXTURE_PATH
    && attestation.unityGeneratedContractPath === UNITY_CONTRACT_PATH
    && attestation.unityGeneratedFixturePath === UNITY_FIXTURE_PATH
    && attestation.saveVersion === CURRENT_ACCEPTED_SAVE_VERSION
    && attestation.fixtureCorpusVersion === FIXTURE_CORPUS_VERSION
    && attestation.verificationResult === 'PASS'
    && attestation.typescriptClean === true
    && attestation.unityClean === true
    && attestation.typescriptCleanStatusSha256 === EMPTY_SHA256
    && attestation.unityCleanStatusSha256 === EMPTY_SHA256
  const commandValid = Array.isArray(attestation.verificationCommand)
    && attestation.verificationCommand.length >= 14
    && attestation.verificationCommand.every((part) =>
      typeof part === 'string' && part.length > 0 && !part.includes('<') && !part.includes('>'))
    && attestation.verificationCommand[0] === 'npm'
    && attestation.verificationCommand.includes('--verify-attestation')
    && attestation.verificationCommand.includes('--typescript-root')
    && attestation.verificationCommand.includes('--unity-root')
    && attestation.verificationCommand.includes('--evidence-root')
  if (!basicValid || !commandValid) {
    fail({
      code: 'CF09_ATTESTATION_HASH_MISMATCH', stage: 'attestation', role: 'verifier',
      path: request.attestationPath, expected: 'closed attestationVersion 1 invariants', observed: 'field mismatch',
      remediation: 'Use the exact unchanged attestation emitted by seal mode.',
    })
  }

  const facts = verifyContractPair({
    mode: 'immutable',
    typescriptRoot: request.typescriptRoot,
    typescriptCommit: attestation.typescriptSourceCommit,
    typescriptRef: attestation.typescriptRef,
    typescriptRemote: request.typescriptRemote,
    unityRoot: request.unityRoot,
    unityCommit: attestation.unityConsumerCommit,
    unityRef: attestation.unityRef,
    unityRemote: request.unityRemote,
    runGeneratorCheck: request.runGeneratorCheck,
  })

  const checks: ReadonlyArray<readonly [string, string | number | boolean, string | number | boolean]> = [
    ['contractManifestSha256', facts.contractManifestSha256, attestation.contractManifestSha256],
    ['schemaId', facts.schemaId, attestation.schemaId],
    ['protocolVersion', facts.protocolVersion, attestation.protocolVersion],
    ['projectionVersion', facts.projectionVersion, attestation.projectionVersion],
    ['generatorVersion', facts.generatorVersion, attestation.generatorVersion],
    ['generatorSourceSha256', facts.generatorSourceSha256, attestation.generatorSourceSha256],
    ['fixtureCorpusSourceSha256', facts.fixtureCorpusSourceSha256, attestation.fixtureCorpusSourceSha256],
    ['typescriptTree', facts.typescriptTree, attestation.typescriptTree],
    ['typescriptGeneratedContractGitBlob', facts.typescriptGeneratedContractGitBlob, attestation.typescriptGeneratedContractGitBlob],
    ['typescriptGeneratedContractSha256', facts.typescriptGeneratedContractSha256, attestation.typescriptGeneratedContractSha256],
    ['typescriptGeneratedFixtureGitBlob', facts.typescriptGeneratedFixtureGitBlob, attestation.typescriptGeneratedFixtureGitBlob],
    ['typescriptGeneratedFixtureSha256', facts.typescriptGeneratedFixtureSha256, attestation.typescriptGeneratedFixtureSha256],
    ['unityTree', facts.unityTree, attestation.unityTree],
    ['unityGeneratedContractGitBlob', facts.unityGeneratedContractGitBlob, attestation.unityGeneratedContractGitBlob],
    ['unityGeneratedContractSha256', facts.unityGeneratedContractSha256, attestation.unityGeneratedContractSha256],
    ['unityGeneratedFixtureGitBlob', facts.unityGeneratedFixtureGitBlob, attestation.unityGeneratedFixtureGitBlob],
    ['unityGeneratedFixtureSha256', facts.unityGeneratedFixtureSha256, attestation.unityGeneratedFixtureSha256],
  ]
  for (const [field, expected, observed] of checks) assertAttestationField(field, expected, observed)

  const tsContext = repositoryContext(
    'typescript', request.typescriptRoot, TYPESCRIPT_REPOSITORY, attestation.typescriptSourceCommit,
    attestation.typescriptRef, request.typescriptRemote, 'immutable',
  )
  const verifierAtCommit = sourceBundleFromCommit(
    tsContext, VERIFIER_SOURCE_PATHS, 'CF09_VERIFIER_SOURCE_MISMATCH',
  )
  const executingVerifier = workingSourceBundle(
    tsContext.root, VERIFIER_SOURCE_PATHS, 'CF09_VERIFIER_SOURCE_MISMATCH',
  )
  compare('CF09_VERIFIER_SOURCE_MISMATCH', 'source-validation', 'verifier', verifierAtCommit,
    attestation.verifierSourceSha256,
    'Use the exact verifier source bundle from the attested TypeScript commit.')
  compare('CF09_VERIFIER_SOURCE_MISMATCH', 'source-validation', 'verifier', verifierAtCommit,
    executingVerifier,
    'Run immutable verification with the exact attested verifier source bundle.')

  const evidenceRoot = canonicalRootForEvidence(request.evidenceRoot)
  const resultPath = join(evidenceRoot, attestation.compiledFixtureEditModeResultPath)
  const logPath = join(evidenceRoot, attestation.compiledFixtureEditModeLogPath)
  const resultBytes = evidenceFile(resultPath, 'contract-gate-editmode.xml')
  const logBytes = evidenceFile(logPath, 'contract-gate-editmode.log')
  const counts = parseEditModeCounts(resultBytes, 'contract-gate-editmode.xml')
  assertAttestationField('compiledFixtureEditModeResultSha256', sha256(resultBytes), attestation.compiledFixtureEditModeResultSha256)
  assertAttestationField('compiledFixtureEditModeLogSha256', sha256(logBytes), attestation.compiledFixtureEditModeLogSha256)
  assertAttestationField('compiledFixtureEditModeTestCount', counts.total, attestation.compiledFixtureEditModeTestCount)
  assertAttestationField('compiledFixtureEditModePassedCount', counts.passed, attestation.compiledFixtureEditModePassedCount)
  assertAttestationField('compiledFixtureEditModeFailedCount', counts.failed, attestation.compiledFixtureEditModeFailedCount)
  assertAttestationField('compiledFixtureEditModeSkippedCount', counts.skipped, attestation.compiledFixtureEditModeSkippedCount)
  return attestation
}

function canonicalRootForEvidence(root: string): string {
  if (!isAbsolute(root)) {
    fail({
      code: 'CF09_PATH_INVALID', stage: 'path-preflight', role: 'evidence', root,
      expected: 'absolute evidence root', observed: root,
      remediation: 'Pass the physical retained evidence directory.',
    })
  }
  let canonical: string
  try {
    canonical = realpathSync.native(root)
  } catch {
    fail({
      code: 'CF09_PATH_INVALID', stage: 'path-preflight', role: 'evidence', root,
      expected: 'existing evidence root', observed: 'missing',
      remediation: 'Pass the retained Unity evidence directory.',
    })
  }
  if (resolve(root) !== canonical || lstatSync(root).isSymbolicLink()) {
    fail({
      code: 'CF09_PATH_REDIRECTED', stage: 'path-preflight', role: 'evidence', root,
      expected: canonical, observed: resolve(root),
      remediation: 'Pass the physical nonsymlinked evidence directory.',
    })
  }
  return canonical
}

export function writeCanonicalJsonExclusive(path: string, value: unknown, forbiddenRoots: readonly string[] = []): void {
  if (!isAbsolute(path)) {
    fail({
      code: 'CF09_PATH_INVALID', stage: 'path-preflight', role: 'evidence', path,
      expected: 'absolute external output path', observed: path,
      remediation: 'Write reports outside both attested repositories.',
    })
  }
  const parent = canonicalRootForEvidence(resolve(path, '..'))
  const target = resolve(path)
  if (!pathInside(parent, target) || forbiddenRoots.some((root) => pathInside(realpathSync.native(root), target))) {
    fail({
      code: 'CF09_PATH_INVALID', stage: 'path-preflight', role: 'evidence', path,
      expected: 'new file outside both repositories', observed: target,
      remediation: 'Write the disposable report or attestation to an external evidence directory.',
    })
  }
  const temporary = join(parent, `.${target.split(sep).at(-1) ?? 'cf09'}.${process.pid}.tmp`)
  try {
    writeFileSync(temporary, canonicalJson(value), { encoding: 'utf8', flag: 'wx', mode: 0o600 })
    linkSync(temporary, target)
    unlinkSync(temporary)
  } catch {
    rmSync(temporary, { force: true })
    fail({
      code: 'CF09_PATH_INVALID', stage: 'path-preflight', role: 'evidence', path,
      expected: 'new writable external output path', observed: 'exists or cannot be created',
      remediation: 'Choose a new external evidence output path; never overwrite an attestation.',
    })
  }
}

export function writeCanonicalJsonAtomic(path: string, value: unknown, forbiddenRoots: readonly string[] = []): void {
  if (!isAbsolute(path)) {
    fail({
      code: 'CF09_PATH_INVALID', stage: 'path-preflight', role: 'evidence', path,
      expected: 'absolute external output path', observed: path,
      remediation: 'Write reports outside both attested repositories.',
    })
  }
  const parent = canonicalRootForEvidence(resolve(path, '..'))
  const target = resolve(path)
  if (forbiddenRoots.some((root) => pathInside(realpathSync.native(root), target))) {
    fail({
      code: 'CF09_PATH_INVALID', stage: 'path-preflight', role: 'evidence', path,
      expected: 'external output path', observed: target,
      remediation: 'Write the disposable report outside both attested repositories.',
    })
  }
  const temporary = join(parent, `.${target.split(sep).at(-1) ?? 'cf09'}.${process.pid}.tmp`)
  try {
    writeFileSync(temporary, canonicalJson(value), { encoding: 'utf8', flag: 'wx', mode: 0o600 })
    renameSync(temporary, target)
  } catch {
    rmSync(temporary, { force: true })
    fail({
      code: 'CF09_PATH_INVALID', stage: 'path-preflight', role: 'evidence', path,
      expected: 'writable external report path', observed: 'cannot publish',
      remediation: 'Choose a writable external report path.',
    })
  }
}

export function verificationReport(facts: ContractPairFacts): Record<string, unknown> {
  return {
    generatedContractSha256: facts.typescriptGeneratedContractSha256,
    generatorSourceSha256: facts.generatorSourceSha256,
    generatorVersion: facts.generatorVersion,
    projectionVersion: facts.projectionVersion,
    protocolVersion: facts.protocolVersion,
    result: 'PASS',
    schemaId: facts.schemaId,
    typescriptCommit: facts.typescriptCommit,
    typescriptGeneratedContractGitBlob: facts.typescriptGeneratedContractGitBlob,
    typescriptRepository: TYPESCRIPT_REPOSITORY,
    unityCommit: facts.unityCommit,
    unityGeneratedContractGitBlob: facts.unityGeneratedContractGitBlob,
    unityRepository: UNITY_REPOSITORY,
    verificationMode: 'seal',
  }
}
