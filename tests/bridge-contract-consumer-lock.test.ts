import { execFileSync } from 'node:child_process'
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, test } from 'vitest'

import {
  CONTRACT_ID,
  CURRENT_ACCEPTED_SAVE_VERSION,
  FIXTURE_SOURCE_PATHS,
  GENERATOR_SOURCE_PATHS,
  MANIFEST_PATH,
  SCHEMA_PATH,
  TYPESCRIPT_CONTRACT_PATH,
  TYPESCRIPT_FIXTURE_PATH,
  TYPESCRIPT_REPOSITORY,
  UNITY_CONTRACT_PATH,
  UNITY_FIXTURE_PATH,
  UNITY_REPOSITORY,
  VERIFIER_SOURCE_PATHS,
  Cf09VerificationError,
  canonicalJson,
  createAttestation,
  normalizeGithubRepository,
  sha256,
  sourceBundleSha256,
  verifyAttestation,
  verifyContractPair,
  type ContractGateAttestationV1,
  type ContractManifestV1,
  type ContractPairRequest,
} from '../scripts/bridge-contract-consumer-lock.ts'

interface FixtureRepository {
  readonly root: string
  readonly remoteRoot: string
  readonly remoteName: string
  readonly branch: string
  commit: string
}

interface PairFixture {
  readonly ownerRoot: string
  readonly typescript: FixtureRepository
  readonly unity: FixtureRepository
  readonly evidenceRoot: string
  request: ContractPairRequest
}

const fixtureRoots: string[] = []

afterEach(() => {
  while (fixtureRoots.length > 0) {
    rmSync(fixtureRoots.pop()!, { recursive: true, force: true })
  }
})

function git(root: string, args: readonly string[]): string {
  return execFileSync('git', [...args], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_TERMINAL_PROMPT: '0',
      LC_ALL: 'C',
    },
  }).trim()
}

function file(root: string, path: string): string {
  return join(root, ...path.split('/'))
}

function write(root: string, path: string, contents: string | Buffer): void {
  const target = file(root, path)
  mkdirSync(join(target, '..'), { recursive: true })
  writeFileSync(target, contents)
}

function initializeRepository(
  ownerRoot: string,
  name: string,
  remoteName: string,
  branch: string,
  canonicalUrl: string,
): FixtureRepository {
  const root = join(ownerRoot, name)
  const remoteRoot = join(ownerRoot, `${name}-remote.git`)
  mkdirSync(root)
  mkdirSync(remoteRoot)
  git(remoteRoot, ['init', '-q', '--bare'])
  git(root, ['init', '-q', '-b', branch])
  git(root, ['config', 'user.email', 'cf09@example.invalid'])
  git(root, ['config', 'user.name', 'CF-09 Fixture'])
  git(root, ['remote', 'add', remoteName, canonicalUrl])
  return { root, remoteRoot, remoteName, branch, commit: '' }
}

function commit(repository: FixtureRepository, message: string): string {
  git(repository.root, ['add', '-A'])
  git(repository.root, ['commit', '-qm', message])
  repository.commit = git(repository.root, ['rev-parse', 'HEAD'])
  git(repository.root, ['push', '-q', '--force', repository.remoteRoot, `HEAD:refs/heads/${repository.branch}`])
  return repository.commit
}

function schema(): Record<string, unknown> {
  return {
    $defs: {},
    $id: 'urn:project-studio:bridge:protocol-4:projection-11',
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    oneOf: [],
    'x-project-studio': {
      contractId: CONTRACT_ID,
      projectionVersion: 11,
      protocolVersion: 4,
      routes: {},
      transport: 'http-json-localhost',
    },
  }
}

function schemaId(value: unknown): string {
  const sorted = (entry: unknown): unknown => {
    if (Array.isArray(entry)) return entry.map(sorted)
    if (typeof entry !== 'object' || entry === null) return entry
    const record = entry as Record<string, unknown>
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, sorted(record[key])]))
  }
  return `sha256:${sha256(JSON.stringify(sorted(value)))}`
}

function sourceHash(root: string, paths: readonly string[]): string {
  return sourceBundleSha256(new Map(paths.map((path) => [path, readFileSync(file(root, path))])))
}

function manifestFor(root: string, contractBytes: Buffer): ContractManifestV1 {
  return {
    manifestVersion: 1,
    contractId: CONTRACT_ID,
    schemaId: schemaId(schema()),
    protocolVersion: 4,
    projectionVersion: 11,
    generatorVersion: 1,
    generatorSourceSha256: sourceHash(root, GENERATOR_SOURCE_PATHS),
    typescriptGeneratedContractPath: TYPESCRIPT_CONTRACT_PATH,
    typescriptGeneratedContractSha256: sha256(contractBytes),
    unityConsumerRepository: UNITY_REPOSITORY,
    unityGeneratedContractPath: UNITY_CONTRACT_PATH,
    unityGeneratedContractSha256: sha256(contractBytes),
  }
}

function makePair(): PairFixture {
  const ownerRoot = realpathSync.native(mkdtempSync(join(tmpdir(), 'project-studio-cf09-test-')))
  fixtureRoots.push(ownerRoot)
  const typescript = initializeRepository(
    ownerRoot,
    'typescript',
    'hspector-github',
    'wip/p05a-static-contract-gate-01-ts',
    `https://github.com/${TYPESCRIPT_REPOSITORY}.git`,
  )
  const unity = initializeRepository(
    ownerRoot,
    'unity',
    'origin',
    'wip/p05a-static-contract-gate-01-client',
    `https://github.com/${UNITY_REPOSITORY}.git`,
  )
  const allSources = new Set<string>([
    ...GENERATOR_SOURCE_PATHS,
    ...VERIFIER_SOURCE_PATHS,
    ...FIXTURE_SOURCE_PATHS,
  ])
  for (const path of allSources) write(typescript.root, path, `fixture source ${path}\n`)
  const schemaValue = schema()
  write(typescript.root, SCHEMA_PATH, canonicalJson(schemaValue))
  const contractBytes = Buffer.from('// exact generated C#\n', 'utf8')
  const fixtureBytes = Buffer.from('// exact generated fixture C#\n', 'utf8')
  write(typescript.root, TYPESCRIPT_CONTRACT_PATH, contractBytes)
  write(typescript.root, TYPESCRIPT_FIXTURE_PATH, fixtureBytes)
  write(typescript.root, MANIFEST_PATH, canonicalJson(manifestFor(typescript.root, contractBytes)))
  write(unity.root, UNITY_CONTRACT_PATH, contractBytes)
  write(unity.root, UNITY_FIXTURE_PATH, fixtureBytes)
  commit(typescript, 'fixture TypeScript contract')
  commit(unity, 'fixture Unity consumer')
  const evidenceRoot = join(ownerRoot, 'evidence')
  mkdirSync(evidenceRoot)
  writeFileSync(join(evidenceRoot, 'contract-gate-editmode.xml'), [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<test-run testcasecount="12" result="Passed" passed="11" failed="0" skipped="1" inconclusive="0">',
    '</test-run>',
    '',
  ].join('\n'))
  writeFileSync(join(evidenceRoot, 'contract-gate-editmode.log'), 'full EditMode PASS\n')
  const request: ContractPairRequest = {
    mode: 'seal',
    typescriptRoot: typescript.root,
    typescriptCommit: typescript.commit,
    typescriptRef: `refs/heads/${typescript.branch}`,
    typescriptRemote: typescript.remoteName,
    unityRoot: unity.root,
    unityCommit: unity.commit,
    unityRef: `refs/heads/${unity.branch}`,
    unityRemote: unity.remoteName,
    runGeneratorCheck: false,
    remoteRefResolver: ({ role, ref }) => git(role === 'typescript' ? typescript.remoteRoot : unity.remoteRoot, [
      'rev-parse', ref,
    ]),
  }
  return { ownerRoot, typescript, unity, evidenceRoot, request }
}

function refreshRequest(pair: PairFixture): void {
  pair.request = {
    ...pair.request,
    typescriptCommit: pair.typescript.commit,
    unityCommit: pair.unity.commit,
  }
}

function readManifest(pair: PairFixture): ContractManifestV1 {
  return JSON.parse(readFileSync(file(pair.typescript.root, MANIFEST_PATH), 'utf8')) as ContractManifestV1
}

function writeManifest(pair: PairFixture, manifest: Record<string, unknown> | ContractManifestV1): void {
  write(pair.typescript.root, MANIFEST_PATH, canonicalJson(manifest))
}

function expectCode(action: () => unknown, code: string): Cf09VerificationError {
  try {
    action()
  } catch (error) {
    expect(error).toBeInstanceOf(Cf09VerificationError)
    expect((error as Cf09VerificationError).diagnostic.code).toBe(code)
    expect((error as Cf09VerificationError).diagnostic.stage).toBeTruthy()
    expect((error as Cf09VerificationError).diagnostic.role).toBeTruthy()
    expect((error as Cf09VerificationError).diagnostic.remediation).toBeTruthy()
    return error as Cf09VerificationError
  }
  throw new Error(`expected ${code}`)
}

function updateCommit(pair: PairFixture, role: 'typescript' | 'unity', message: string): void {
  commit(pair[role], message)
  refreshRequest(pair)
}

function attest(pair: PairFixture): ContractGateAttestationV1 {
  return createAttestation({
    ...pair.request,
    saveVersion: CURRENT_ACCEPTED_SAVE_VERSION,
    attestationPath: join(pair.evidenceRoot, 'contract-gate-attestation.json'),
    editModeEvidence: {
      resultPath: join(pair.evidenceRoot, 'contract-gate-editmode.xml'),
      logPath: join(pair.evidenceRoot, 'contract-gate-editmode.log'),
    },
  })
}

function writeAttestation(pair: PairFixture, value: ContractGateAttestationV1 | Record<string, unknown>): string {
  const path = join(pair.evidenceRoot, 'contract-gate-attestation.json')
  writeFileSync(path, canonicalJson(value))
  return path
}

describe('CF-09 source bundle and repository identity', () => {
  test('uses a length-delimited, order-independent source envelope', () => {
    const first = sourceBundleSha256(new Map([
      ['z.ts', Buffer.from('left')],
      ['a.ts', Buffer.from('right')],
    ]))
    const reordered = sourceBundleSha256(new Map([
      ['a.ts', Buffer.from('right')],
      ['z.ts', Buffer.from('left')],
    ]))
    const boundaryMutation = sourceBundleSha256(new Map([
      ['a.ts', Buffer.from('righ')],
      ['z.ts', Buffer.from('tleft')],
    ]))
    expect(reordered).toBe(first)
    expect(boundaryMutation).not.toBe(first)
  })

  test.each([
    ['https://github.com/HSpector1/The-Movies.git', TYPESCRIPT_REPOSITORY],
    ['git@github.com:HSpector1/The-Movies.git', TYPESCRIPT_REPOSITORY],
    ['ssh://git@github.com/HSpector1/The-Movies.git', TYPESCRIPT_REPOSITORY],
    ['https://example.invalid/HSpector1/The-Movies.git', null],
    ['file:///tmp/The-Movies.git', null],
  ])('normalizes only canonical GitHub forms: %s', (remote, expected) => {
    expect(normalizeGithubRepository(remote)).toBe(expected)
  })
})

describe('CF-09 sealed pair', () => {
  test('binds the exact pushed clean commits and both committed generated blobs', () => {
    const pair = makePair()
    const facts = verifyContractPair(pair.request)
    expect(facts.typescriptCommit).toBe(pair.typescript.commit)
    expect(facts.unityCommit).toBe(pair.unity.commit)
    expect(facts.typescriptGeneratedContractSha256).toBe(facts.unityGeneratedContractSha256)
    expect(facts.typescriptGeneratedFixtureSha256).toBe(facts.unityGeneratedFixtureSha256)
    expect(facts.schemaId).toBe(schemaId(schema()))
    expect(facts.protocolVersion).toBe(4)
    expect(facts.projectionVersion).toBe(11)
  })

  test('rejects the wrong Unity repository before reading a matching file', () => {
    const pair = makePair()
    git(pair.unity.root, ['config', `remote.${pair.unity.remoteName}.url`, 'https://github.com/HSpector1/not-unity.git'])
    expectCode(() => verifyContractPair(pair.request), 'CF09_REPOSITORY_MISMATCH')
  })

  test('rejects a canonical-looking remote redirected by Git URL rewriting', () => {
    const pair = makePair()
    git(pair.unity.root, [
      'config',
      `url.file://${pair.unity.remoteRoot}.insteadOf`,
      `https://github.com/${UNITY_REPOSITORY}.git`,
    ])
    expectCode(() => verifyContractPair(pair.request), 'CF09_REPOSITORY_MISMATCH')
  })

  test('rejects a Unity subdirectory as the wrong root', () => {
    const pair = makePair()
    expectCode(() => verifyContractPair({
      ...pair.request,
      unityRoot: join(pair.unity.root, 'Assets'),
    }), 'CF09_ROOT_NOT_TOPLEVEL')
  })

  test('rejects a nonallowlisted generated-file path', () => {
    const pair = makePair()
    writeManifest(pair, {
      ...readManifest(pair),
      unityGeneratedContractPath: 'Assets/Studio/Runtime/Data/Generated/MatchingCopy.cs',
    })
    updateCommit(pair, 'typescript', 'wrong generated path')
    expectCode(() => verifyContractPair(pair.request), 'CF09_PATH_INVALID')
  })

  test('rejects a stale committed Unity consumer', () => {
    const pair = makePair()
    appendFileSync(file(pair.unity.root, UNITY_CONTRACT_PATH), '// stale\n')
    updateCommit(pair, 'unity', 'stale consumer')
    expectCode(() => verifyContractPair(pair.request), 'CF09_CONSUMER_HASH_MISMATCH')
  })

  test('rejects a one-byte uncommitted consumer drift as dirt before hashing', () => {
    const pair = makePair()
    appendFileSync(file(pair.unity.root, UNITY_CONTRACT_PATH), 'x')
    expectCode(() => verifyContractPair(pair.request), 'CF09_UNITY_DIRTY')
  })

  test('rejects a one-byte committed consumer drift', () => {
    const pair = makePair()
    appendFileSync(file(pair.unity.root, UNITY_CONTRACT_PATH), 'x')
    updateCommit(pair, 'unity', 'one-byte drift')
    expectCode(() => verifyContractPair(pair.request), 'CF09_CONSUMER_HASH_MISMATCH')
  })

  test('rejects a schema identity mismatch', () => {
    const pair = makePair()
    writeManifest(pair, { ...readManifest(pair), schemaId: `sha256:${'0'.repeat(64)}` })
    updateCommit(pair, 'typescript', 'schema mismatch')
    expectCode(() => verifyContractPair(pair.request), 'CF09_SCHEMA_MISMATCH')
  })

  test('rejects a protocol mismatch', () => {
    const pair = makePair()
    writeManifest(pair, { ...readManifest(pair), protocolVersion: 5 })
    updateCommit(pair, 'typescript', 'protocol mismatch')
    expectCode(() => verifyContractPair(pair.request), 'CF09_PROTOCOL_MISMATCH')
  })

  test('rejects a projection mismatch', () => {
    const pair = makePair()
    writeManifest(pair, { ...readManifest(pair), projectionVersion: 12 })
    updateCommit(pair, 'typescript', 'projection mismatch')
    expectCode(() => verifyContractPair(pair.request), 'CF09_PROJECTION_MISMATCH')
  })

  test.each([
    ['staged', (pair: PairFixture) => {
      appendFileSync(file(pair.typescript.root, TYPESCRIPT_CONTRACT_PATH), 'x')
      git(pair.typescript.root, ['add', TYPESCRIPT_CONTRACT_PATH])
    }],
    ['unstaged', (pair: PairFixture) => appendFileSync(file(pair.typescript.root, TYPESCRIPT_CONTRACT_PATH), 'x')],
    ['untracked', (pair: PairFixture) => writeFileSync(join(pair.typescript.root, 'untracked.txt'), 'x')],
  ] as const)('rejects a %s dirty TypeScript tree', (_kind, dirty) => {
    const pair = makePair()
    dirty(pair)
    expectCode(() => verifyContractPair(pair.request), 'CF09_TYPESCRIPT_DIRTY')
  })

  test.each([
    ['staged', (pair: PairFixture) => {
      appendFileSync(file(pair.unity.root, UNITY_CONTRACT_PATH), 'x')
      git(pair.unity.root, ['add', UNITY_CONTRACT_PATH])
    }],
    ['unstaged', (pair: PairFixture) => appendFileSync(file(pair.unity.root, UNITY_CONTRACT_PATH), 'x')],
    ['untracked', (pair: PairFixture) => writeFileSync(join(pair.unity.root, 'untracked.txt'), 'x')],
  ] as const)('rejects a %s dirty Unity tree', (_kind, dirty) => {
    const pair = makePair()
    dirty(pair)
    expectCode(() => verifyContractPair(pair.request), 'CF09_UNITY_DIRTY')
  })

  test('rejects a missing committed consumer without filename fallback', () => {
    const pair = makePair()
    unlinkSync(file(pair.unity.root, UNITY_CONTRACT_PATH))
    updateCommit(pair, 'unity', 'remove consumer')
    expectCode(() => verifyContractPair(pair.request), 'CF09_CONSUMER_MISSING')
  })

  test('rejects a nonexistent immutable commit', () => {
    const pair = makePair()
    expectCode(() => verifyContractPair({
      ...pair.request,
      unityCommit: '0'.repeat(40),
    }), 'CF09_COMMIT_NOT_FOUND')
  })

  test('rejects a manifest/blob mismatch', () => {
    const pair = makePair()
    writeManifest(pair, {
      ...readManifest(pair),
      typescriptGeneratedContractSha256: '0'.repeat(64),
    })
    updateCommit(pair, 'typescript', 'manifest blob mismatch')
    expectCode(() => verifyContractPair(pair.request), 'CF09_CONSUMER_HASH_MISMATCH')
  })

  test('rejects stale real Unity bytes even when a TypeScript-local self-copy matches', () => {
    const pair = makePair()
    write(pair.typescript.root, UNITY_CONTRACT_PATH, readFileSync(file(pair.typescript.root, TYPESCRIPT_CONTRACT_PATH)))
    updateCommit(pair, 'typescript', 'coincidental local Unity copy')
    appendFileSync(file(pair.unity.root, UNITY_CONTRACT_PATH), '// stale real consumer\n')
    updateCommit(pair, 'unity', 'stale actual Unity consumer')
    expectCode(() => verifyContractPair(pair.request), 'CF09_CONSUMER_HASH_MISMATCH')
  })

  test('rejects a committed symlink consumer before content comparison', () => {
    const pair = makePair()
    const target = join(pair.ownerRoot, 'outside.cs')
    writeFileSync(target, '// exact generated C#\n')
    unlinkSync(file(pair.unity.root, UNITY_CONTRACT_PATH))
    symlinkSync(target, file(pair.unity.root, UNITY_CONTRACT_PATH))
    updateCommit(pair, 'unity', 'symlink consumer')
    expectCode(() => verifyContractPair(pair.request), 'CF09_PATH_REDIRECTED')
  })

  test('rejects path traversal rather than normalizing it', () => {
    const pair = makePair()
    writeManifest(pair, {
      ...readManifest(pair),
      unityGeneratedContractPath: '../Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs',
    })
    updateCommit(pair, 'typescript', 'path escape')
    expectCode(() => verifyContractPair(pair.request), 'CF09_PATH_INVALID')
  })

  test('rejects a wrong branch even when it points to identical bytes and commit', () => {
    const pair = makePair()
    git(pair.unity.root, ['branch', 'matching-copy', pair.unity.commit])
    git(pair.unity.root, ['switch', '-q', 'matching-copy'])
    expectCode(() => verifyContractPair(pair.request), 'CF09_REF_MISMATCH')
  })

  test('rejects recursive or unknown manifest commit fields', () => {
    const pair = makePair()
    writeManifest(pair, {
      ...readManifest(pair),
      unityConsumerCommit: pair.unity.commit,
    })
    updateCommit(pair, 'typescript', 'recursive manifest field')
    expectCode(() => verifyContractPair(pair.request), 'CF09_MANIFEST_MISMATCH')
  })

  test('rejects a generator source/manifest mismatch', () => {
    const pair = makePair()
    appendFileSync(file(pair.typescript.root, 'scripts/bridge-contract-csharp.ts'), '// mutation\n')
    updateCommit(pair, 'typescript', 'generator source drift')
    expectCode(() => verifyContractPair(pair.request), 'CF09_GENERATOR_SOURCE_MISMATCH')
  })

  test('generation result is independent of current member/property-like file order', () => {
    const pair = makePair()
    const original = verifyContractPair(pair.request)
    const content = readFileSync(file(pair.typescript.root, TYPESCRIPT_FIXTURE_PATH))
    write(pair.typescript.root, TYPESCRIPT_FIXTURE_PATH, content)
    expect(verifyContractPair(pair.request)).toEqual(original)
  })
})

describe('CF-09 post-commit attestation', () => {
  test('emits deterministic immutable facts only after both sealed commits exist', () => {
    const pair = makePair()
    const first = attest(pair)
    const second = attest(pair)
    expect(canonicalJson(first)).toBe(canonicalJson(second))
    expect(first.typescriptSourceCommit).toBe(pair.typescript.commit)
    expect(first.unityConsumerCommit).toBe(pair.unity.commit)
    expect(first.saveVersion).toBe(15)
    expect(first.compiledFixtureEditModeTestCount).toBe(12)
    expect(first.compiledFixtureEditModePassedCount).toBe(11)
    expect(first.compiledFixtureEditModeSkippedCount).toBe(1)
    expect(first.verificationCommand.every((part) => !part.includes('<') && !part.includes('>'))).toBe(true)
    expect(first.verificationCommand).toContain(join(pair.evidenceRoot, 'contract-gate-attestation.json'))
    expect(first.verificationCommand).toContain(pair.typescript.root)
    expect(first.verificationCommand).toContain(pair.unity.root)
    expect(first.verificationCommand).toContain(pair.evidenceRoot)
    expect(first).not.toHaveProperty('attestationCommit')
    expect(first).not.toHaveProperty('attestedUtc')
  })

  test('re-verifies immutable commit blobs even after both HEADs move', () => {
    const pair = makePair()
    const attestation = attest(pair)
    const path = writeAttestation(pair, attestation)
    write(pair.typescript.root, 'docs/later.txt', 'later documentation commit\n')
    updateCommit(pair, 'typescript', 'later attestation docs')
    write(pair.unity.root, 'Assets/later.txt', 'later unrelated commit\n')
    updateCommit(pair, 'unity', 'later unrelated commit')
    const verified = verifyAttestation({
      attestationPath: path,
      typescriptRoot: pair.typescript.root,
      typescriptRemote: pair.typescript.remoteName,
      unityRoot: pair.unity.root,
      unityRemote: pair.unity.remoteName,
      evidenceRoot: pair.evidenceRoot,
      runGeneratorCheck: false,
    })
    expect(verified.typescriptSourceCommit).toBe(attestation.typescriptSourceCommit)
    expect(verified.unityConsumerCommit).toBe(attestation.unityConsumerCommit)
  })

  test('rejects an attestation naming a nonexistent commit', () => {
    const pair = makePair()
    const attestation = { ...attest(pair), unityConsumerCommit: '0'.repeat(40) }
    const path = writeAttestation(pair, attestation)
    expectCode(() => verifyAttestation({
      attestationPath: path,
      typescriptRoot: pair.typescript.root,
      typescriptRemote: pair.typescript.remoteName,
      unityRoot: pair.unity.root,
      unityRemote: pair.unity.remoteName,
      evidenceRoot: pair.evidenceRoot,
      runGeneratorCheck: false,
    }), 'CF09_COMMIT_NOT_FOUND')
  })

  test('rejects a manifest hash that does not match the attested commit blob', () => {
    const pair = makePair()
    const attestation = { ...attest(pair), contractManifestSha256: '0'.repeat(64) }
    const path = writeAttestation(pair, attestation)
    expectCode(() => verifyAttestation({
      attestationPath: path,
      typescriptRoot: pair.typescript.root,
      typescriptRemote: pair.typescript.remoteName,
      unityRoot: pair.unity.root,
      unityRemote: pair.unity.remoteName,
      evidenceRoot: pair.evidenceRoot,
      runGeneratorCheck: false,
    }), 'CF09_ATTESTATION_HASH_MISMATCH')
  })

  test('rejects verifier-source drift', () => {
    const pair = makePair()
    const attestation = attest(pair)
    const path = writeAttestation(pair, attestation)
    appendFileSync(file(pair.typescript.root, 'scripts/verify-bridge-contract-consumer.ts'), '// drift\n')
    updateCommit(pair, 'typescript', 'later verifier drift')
    expectCode(() => verifyAttestation({
      attestationPath: path,
      typescriptRoot: pair.typescript.root,
      typescriptRemote: pair.typescript.remoteName,
      unityRoot: pair.unity.root,
      unityRemote: pair.unity.remoteName,
      evidenceRoot: pair.evidenceRoot,
      runGeneratorCheck: false,
    }), 'CF09_VERIFIER_SOURCE_MISMATCH')
  })

  test('rejects fixture-corpus source drift named by the attestation', () => {
    const pair = makePair()
    const attestation = { ...attest(pair), fixtureCorpusSourceSha256: '0'.repeat(64) }
    const path = writeAttestation(pair, attestation)
    expectCode(() => verifyAttestation({
      attestationPath: path,
      typescriptRoot: pair.typescript.root,
      typescriptRemote: pair.typescript.remoteName,
      unityRoot: pair.unity.root,
      unityRemote: pair.unity.remoteName,
      evidenceRoot: pair.evidenceRoot,
      runGeneratorCheck: false,
    }), 'CF09_ATTESTATION_HASH_MISMATCH')
  })

  test('rejects one-byte EditMode evidence drift', () => {
    const pair = makePair()
    const path = writeAttestation(pair, attest(pair))
    appendFileSync(join(pair.evidenceRoot, 'contract-gate-editmode.log'), 'x')
    expectCode(() => verifyAttestation({
      attestationPath: path,
      typescriptRoot: pair.typescript.root,
      typescriptRemote: pair.typescript.remoteName,
      unityRoot: pair.unity.root,
      unityRemote: pair.unity.remoteName,
      evidenceRoot: pair.evidenceRoot,
      runGeneratorCheck: false,
    }), 'CF09_ATTESTATION_HASH_MISMATCH')
  })

  test('rejects symlinked evidence redirection', () => {
    const pair = makePair()
    const path = writeAttestation(pair, attest(pair))
    const external = join(pair.ownerRoot, 'external.log')
    writeFileSync(external, 'full EditMode PASS\n')
    unlinkSync(join(pair.evidenceRoot, 'contract-gate-editmode.log'))
    symlinkSync(external, join(pair.evidenceRoot, 'contract-gate-editmode.log'))
    expectCode(() => verifyAttestation({
      attestationPath: path,
      typescriptRoot: pair.typescript.root,
      typescriptRemote: pair.typescript.remoteName,
      unityRoot: pair.unity.root,
      unityRemote: pair.unity.remoteName,
      evidenceRoot: pair.evidenceRoot,
      runGeneratorCheck: false,
    }), 'CF09_PATH_REDIRECTED')
  })

  test('rejects failed or internally inconsistent full EditMode XML', () => {
    const pair = makePair()
    writeFileSync(join(pair.evidenceRoot, 'contract-gate-editmode.xml'), [
      '<test-run testcasecount="12" result="Failed" passed="10" failed="1" skipped="1" inconclusive="0">',
      '</test-run>',
    ].join('\n'))
    expectCode(() => attest(pair), 'CF09_EDITMODE_EVIDENCE_INVALID')
  })
})
