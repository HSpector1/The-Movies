import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  exportSave,
  generateWorld,
  importSave,
  makeSaveV11,
  stableStringify,
} from '../src/core/index.js'
import {
  assertRosterWallArtifactsByteIdentical,
  assertRosterWallAcceptedMechanicsFixtureRows,
  compareRosterWallArtifactDirectories,
  ROSTER_WALL_ACCEPTED_EXPERIMENT_ID,
  ROSTER_WALL_ACCEPTED_SCHEMA_VERSION,
  ROSTER_WALL_ACCEPTED_SEED_SET_ID,
  ROSTER_WALL_MAX_JSONL_ROW_BYTES,
  RosterWallArtifactWriter,
  inventoryRosterWallArtifactDirectory,
  rosterWallAcceptedArtifactMatrix,
  rosterWallSha256,
  rosterWallStableJson,
  rosterWallStableJsonl,
  validateRosterWallRunName,
  verifyRosterWallAcceptedArtifactDirectory,
  verifyRosterWallArtifactDirectory,
} from '../src/harness/roster-wall/artifacts.js'
import { runRosterWallMechanicsFixtures } from '../src/harness/roster-wall/fixtures.js'
import type {
  RosterWallAcceptedArtifactCounts,
  RosterWallAcceptedArtifactMatrix,
  RosterWallAcceptedArtifactManifest,
  RosterWallAcceptedArtifactSummary,
} from '../src/harness/roster-wall/artifacts.js'
import {
  acceptedRosterWallSourceProvenance,
  discoverRosterWallRepoRoot,
  ROSTER_WALL_EXPECTED_BRANCH,
  rosterWallSourceProvenance,
} from '../src/harness/roster-wall/provenance.js'

const temporaryRoots: string[] = []

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

function temporaryRoot(prefix: string): string {
  const root = mkdtempSync(join(tmpdir(), prefix))
  temporaryRoots.push(root)
  return root
}

function acceptedChecks(matrix: RosterWallAcceptedArtifactMatrix) {
  return {
    entryObserverNeutrality: {
      checkedEntries: matrix.maximumTermEntries,
      byteIdenticalEntries: matrix.maximumTermEntries,
      stateHashIdenticalEntries: matrix.maximumTermEntries,
      rngStateIdenticalEntries: matrix.maximumTermEntries,
      failures: 0 as const,
    },
    continuationObserverNeutrality: {
      checkedArms: matrix.maximumTermEntries * 10,
      byteIdenticalArms: matrix.maximumTermEntries * 10,
      stateHashIdenticalArms: matrix.maximumTermEntries * 10,
      rngStateIdenticalArms: matrix.maximumTermEntries * 10,
      failures: 0 as const,
    },
    playerPolicyObserverNeutrality: {
      checkedRuns: matrix.playerPolicyEntries,
      byteIdenticalRuns: matrix.playerPolicyEntries,
      stateHashIdenticalRuns: matrix.playerPolicyEntries,
      rngStateIdenticalRuns: matrix.playerPolicyEntries,
      failures: 0 as const,
    },
  }
}

function createArtifactRepo(): string {
  const root = temporaryRoot('roster-wall-artifacts-')
  mkdirSync(join(root, '.git'))
  mkdirSync(join(root, 'src', 'core'), { recursive: true })
  writeFileSync(join(root, 'package.json'), '{}\n')
  writeFileSync(join(root, '.gitignore'), 'out/\n')
  writeFileSync(join(root, 'src', 'core', 'index.ts'), 'export {}\n')
  return root
}

type GitFixture = {
  root: string
  authority: string
}

function git(root: string, args: readonly string[]): string {
  return execFileSync('git', [...args], { cwd: root, encoding: 'utf8' }).trim()
}

function createGitFixture(branch: string = ROSTER_WALL_EXPECTED_BRANCH): GitFixture {
  const root = temporaryRoot('roster-wall-provenance-')
  execFileSync('git', ['init', '-q', '-b', branch], { cwd: root })
  git(root, ['config', 'user.email', 'roster-wall@example.invalid'])
  git(root, ['config', 'user.name', 'Roster Wall Observatory'])
  mkdirSync(join(root, 'src', 'core'), { recursive: true })
  mkdirSync(join(root, 'src', 'harness'), { recursive: true })
  mkdirSync(join(root, 'docs'))
  mkdirSync(join(root, 'tests'))
  writeFileSync(join(root, 'package.json'), '{}\n')
  writeFileSync(join(root, '.gitignore'), 'out/\n')
  writeFileSync(join(root, 'src', 'core', 'index.ts'), 'export const authority = true\n')
  writeFileSync(join(root, 'docs', 'authority.md'), 'authority\n')
  git(root, ['add', '.'])
  git(root, ['commit', '-qm', 'production authority'])
  return { root, authority: git(root, ['rev-parse', 'HEAD']) }
}

function addHarnessOnlyDescendant(fixture: GitFixture): void {
  writeFileSync(join(fixture.root, 'docs', 'observer.md'), 'observer\n')
  writeFileSync(join(fixture.root, 'src', 'harness', 'observer.ts'), 'export {}\n')
  writeFileSync(join(fixture.root, 'tests', 'observer.test.ts'), 'export {}\n')
  git(fixture.root, ['add', '.'])
  git(fixture.root, ['commit', '-qm', 'add observer'])
}

function emptyAcceptedCounts(): RosterWallAcceptedArtifactCounts {
  return {
    entries: 0,
    rows: 0,
    recordTypes: {
      entry: 0,
      weekly: 0,
      renewalIntent: 0,
      boundary: 0,
      windowShadow: 0,
      mechanicsFixture: 0,
      pair: 0,
    },
  }
}

function acceptedTestFinalization(source: ReturnType<typeof rosterWallSourceProvenance>): {
  manifest: RosterWallAcceptedArtifactManifest
  summary: RosterWallAcceptedArtifactSummary
} {
  const matrix = rosterWallAcceptedArtifactMatrix('smoke')
  const counts = emptyAcceptedCounts()
  return {
    manifest: {
      schemaVersion: ROSTER_WALL_ACCEPTED_SCHEMA_VERSION,
      experimentId: ROSTER_WALL_ACCEPTED_EXPERIMENT_ID,
      seedSetId: ROSTER_WALL_ACCEPTED_SEED_SET_ID,
      profile: 'smoke',
      completeEvidence: false,
      source,
      matrix,
      counts,
      entryIndex: [],
      acceptanceChecks: acceptedChecks(matrix),
      invariantFailures: 0,
    },
    summary: {
      schemaVersion: ROSTER_WALL_ACCEPTED_SCHEMA_VERSION,
      experimentId: ROSTER_WALL_ACCEPTED_EXPERIMENT_ID,
      seedSetId: ROSTER_WALL_ACCEPTED_SEED_SET_ID,
      profile: 'smoke',
      completeEvidence: false,
      source,
      matrix,
      counts,
      invariantFailures: 0,
    },
  }
}

const TEST_SHA = 'a'.repeat(64)

function commonAcceptedEnvelope(input: {
  source: ReturnType<typeof rosterWallSourceProvenance>
  recordType: string
  mode: string
  seed: string | null
  operatingPolicyId: string | null
  estatePolicyId: string | null
  foundingTermPolicyId: string | null
  continuationPolicyId: string | null
  horizonWeeks: number | null
  initialSaveHash: string | null
  entryId: string | null
  entrySaveHash: string | null
  entryStateHash: string | null
  entryWeek?: number | null
  week: number | null
}): Record<string, unknown> {
  return {
    schemaVersion: ROSTER_WALL_ACCEPTED_SCHEMA_VERSION,
    recordType: input.recordType,
    mode: input.mode,
    experimentId: ROSTER_WALL_ACCEPTED_EXPERIMENT_ID,
    seedSetId: ROSTER_WALL_ACCEPTED_SEED_SET_ID,
    seed: input.seed,
    operatingPolicyId: input.operatingPolicyId,
    estatePolicyId: input.estatePolicyId,
    foundingTermPolicyId: input.foundingTermPolicyId,
    continuationPolicyId: input.continuationPolicyId,
    horizonWeeks: input.horizonWeeks,
    source: input.source,
    initialSaveHash: input.initialSaveHash,
    entryId: input.entryId,
    entryWeek: input.entryWeek ?? 196,
    entrySaveHash: input.entrySaveHash,
    entryStateHash: input.entryStateHash,
    week: input.week,
  }
}

function refreshArtifactInventory(root: string, runName: string): void {
  const directory = join(root, 'out', 'week-208-roster-wall', runName)
  const inventory = inventoryRosterWallArtifactDirectory(
    directory,
    new Set(['sha256.json']),
  )
  writeFileSync(
    join(directory, 'sha256.json'),
    `${rosterWallStableJson(inventory, 2)}\n`,
  )
}

function writeAcceptedSmokeArtifact(
  fixture: GitFixture,
  runName: string,
): ReturnType<typeof rosterWallSourceProvenance> {
  const source = rosterWallSourceProvenance(fixture.root, {
    productionAuthority: fixture.authority,
    runtime: 'node accepted-smoke-test',
  })
  source.productionAuthorityCommit = '8b7e95eb92f6f809522a595b4b458d4f19e26852'
  source.productionAuthorityTree = '11bdbb9a12b4419d8b62ca83934ca2def5c70f1d'
  const matrix = rosterWallAcceptedArtifactMatrix('smoke')
  const writer = new RosterWallArtifactWriter(fixture.root, runName)
  const entryIndex: RosterWallAcceptedArtifactManifest['entryIndex'] = []
  const state = generateWorld('accepted-smoke-entry')
  state.market.tick = 196
  const saveJson = exportSave(makeSaveV11(state))
  const imported = importSave(saveJson)
  if (imported.saveVersion !== 11) throw new Error('test fixture did not produce SaveFileV11')
  const entrySaveHash = rosterWallSha256(saveJson)
  const entryStateHash = rosterWallSha256(stableStringify(imported.state))

  const writeCampaignEntry = (
    mode: 'current' | 'player-policy',
    seed: string,
    operatingPolicyId: string,
    estatePolicyId: string,
    foundingTermPolicyId: 'all-208' | 'round-robin-mixed',
  ): { entryId: string; initialSaveHash: string } => {
    const entryId = `${mode === 'current' ? 'maximum' : 'player'}.${seed}.${operatingPolicyId}.${estatePolicyId}.${foundingTermPolicyId}`
    const initialSaveHash = rosterWallSha256(`initial:${entryId}`)
    const row = {
      ...commonAcceptedEnvelope({
        source,
        recordType: 'entry',
        mode,
        seed,
        operatingPolicyId,
        estatePolicyId,
        foundingTermPolicyId,
        continuationPolicyId: mode === 'player-policy' ? 'C1-current-retry-all' : null,
        horizonWeeks: mode === 'player-policy' ? 428 : null,
        initialSaveHash,
        entryId,
        entrySaveHash,
        entryStateHash,
        week: 196,
      }),
      cohort: [],
      cash: imported.state.studio.cash,
      rngState: imported.state.rngState,
      economyEngagedEver: imported.state.economyEngagedEver,
      cashReconciliation: {},
      ledger: imported.state.ledger,
      activeReceipts: {},
      activeCommitments: {},
      construction: imported.state.construction,
      operationsFacilities: imported.state.operations.facilities,
      roleCoverage: {},
      entryFileSha256: entrySaveHash,
      replay: {},
    }
    writer.writeEntry({ entryId, row, saveJson })
    entryIndex.push({
      entryId,
      mode,
      seed,
      operatingPolicyId,
      estatePolicyId,
      foundingTermPolicyId,
      initialSaveHash,
      entrySaveHash,
      entryStateHash,
    })
    return { entryId, initialSaveHash }
  }

  const writeCurrentWeekly = (
    identity: { entryId: string; initialSaveHash: string },
    seed: string,
    operatingPolicyId: string,
    estatePolicyId: string,
    continuationPolicyId: string,
    horizonWeeks: number,
  ): void => {
    for (let week = 196; week < horizonWeeks; week++) {
      writer.writeRow({
        ...commonAcceptedEnvelope({
          source,
          recordType: 'weekly',
          mode: 'current',
          seed,
          operatingPolicyId,
          estatePolicyId,
          foundingTermPolicyId: 'all-208',
          continuationPolicyId,
          horizonWeeks,
          initialSaveHash: identity.initialSaveHash,
          entryId: identity.entryId,
          entrySaveHash,
          entryStateHash,
          week,
        }),
        stateHashBefore: TEST_SHA,
        stateHashAfterTick: TEST_SHA,
      })
    }
  }

  const currentIdentities: Array<{
    seed: string
    operatingPolicyId: string
    estatePolicyId: string
    entryId: string
    initialSaveHash: string
  }> = []
  for (const seed of matrix.canonicalSeeds) {
    for (const operatingPolicyId of matrix.operatingPolicyIds) {
      for (const estatePolicyId of matrix.estatePolicyIds) {
        const identity = writeCampaignEntry(
          'current',
          seed,
          operatingPolicyId,
          estatePolicyId,
          'all-208',
        )
        currentIdentities.push({ seed, operatingPolicyId, estatePolicyId, ...identity })
      }
    }
  }
  for (const identity of currentIdentities) {
    for (const week of [156, 182, 196]) {
      writer.writeRow({
        ...commonAcceptedEnvelope({
          source,
          recordType: 'windowShadow',
          mode: 'reference-shadow',
          seed: identity.seed,
          operatingPolicyId: identity.operatingPolicyId,
          estatePolicyId: identity.estatePolicyId,
          foundingTermPolicyId: 'all-208',
          continuationPolicyId: null,
          horizonWeeks: null,
          initialSaveHash: identity.initialSaveHash,
          entryId: identity.entryId,
          entrySaveHash,
          entryStateHash,
          week,
        }),
        warning: { week, observationConsumedRng: false },
      })
    }
    for (const policy of matrix.continuationPolicyIds) {
      writeCurrentWeekly(
        identity,
        identity.seed,
        identity.operatingPolicyId,
        identity.estatePolicyId,
        policy,
        260,
      )
    }
    for (const policy of [
      'C1-current-retry-all',
      'C5-spread-role-first',
      'C6-mixed-term-role-first',
    ]) {
      writeCurrentWeekly(
        identity,
        identity.seed,
        identity.operatingPolicyId,
        identity.estatePolicyId,
        policy,
        428,
      )
    }
    if (identity.estatePolicyId === 'vacant') {
      for (const [policy, horizonWeeks] of [
        ...matrix.continuationPolicyIds
          .filter((candidate) => candidate !== 'C1-current-retry-all')
          .map((candidate) => [candidate, 260] as const),
        ['C5-spread-role-first', 428] as const,
        ['C6-mixed-term-role-first', 428] as const,
      ]) {
        writer.writeRow({
          ...commonAcceptedEnvelope({
            source,
            recordType: 'pair',
            mode: 'current',
            seed: identity.seed,
            operatingPolicyId: identity.operatingPolicyId,
            estatePolicyId: identity.estatePolicyId,
            foundingTermPolicyId: 'all-208',
            continuationPolicyId: policy,
            horizonWeeks,
            initialSaveHash: identity.initialSaveHash,
            entryId: identity.entryId,
            entrySaveHash,
            entryStateHash,
            week: horizonWeeks,
          }),
          baselinePolicyId: 'C1-current-retry-all',
          comparedPolicyId: policy,
          causalBoundaryLabel:
            'renewal-policy-only-after-byte-identical-week-196-entry',
          facilityCausality: 'not-estimated-by-within-estate-policy-pair',
          commonEntry: { entrySaveHash },
        })
      }
    }
  }

  for (const seed of matrix.canonicalSeeds) {
    for (const operatingPolicyId of matrix.operatingPolicyIds) {
      const identity = writeCampaignEntry(
        'player-policy',
        seed,
        operatingPolicyId,
        'vacant',
        'round-robin-mixed',
      )
      for (let week = 0; week < 428; week++) {
        writer.writeRow({
          ...commonAcceptedEnvelope({
            source,
            recordType: 'weekly',
            mode: 'player-policy',
            seed,
            operatingPolicyId,
            estatePolicyId: 'vacant',
            foundingTermPolicyId: 'round-robin-mixed',
            continuationPolicyId: 'C1-current-retry-all',
            horizonWeeks: 428,
            initialSaveHash: identity.initialSaveHash,
            entryId: identity.entryId,
            entrySaveHash,
            entryStateHash,
            week,
          }),
          startStateHash: TEST_SHA,
          arrivalStateHash: TEST_SHA,
        })
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
      for (const continuationPolicyId of matrix.continuationPolicyIds) {
        writer.writeRow({
          ...commonAcceptedEnvelope({
            source,
            recordType: 'mechanicsFixture',
            mode: 'mechanics-fixture',
            seed: `roster-wall-mechanics-cohort-${String(cohortSize).padStart(2, '0')}`,
            operatingPolicyId: null,
            estatePolicyId: null,
            foundingTermPolicyId: null,
            continuationPolicyId,
            horizonWeeks: 12,
            initialSaveHash: null,
            entryId: null,
            entrySaveHash: null,
            entryStateHash: null,
            week: 196,
          }),
          fixtureExperimentId: 'week-208-roster-wall-mechanics-fixtures-v1',
          fixtureId: `${String(cohortSize)}:${thresholdId}:${continuationPolicyId}`,
          cohortSize,
          threshold: { thresholdId },
          actualInvariants: { allPassed: true },
        })
      }
    }
  }

  const counts: RosterWallAcceptedArtifactCounts = {
    entries: matrix.totalEntries,
    rows:
      matrix.totalEntries +
      matrix.weeklyRows +
      matrix.windowShadowRows +
      matrix.pairRows +
      matrix.mechanicsFixtureRows,
    recordTypes: {
      entry: matrix.totalEntries,
      weekly: matrix.weeklyRows,
      renewalIntent: 0,
      boundary: 0,
      windowShadow: matrix.windowShadowRows,
      mechanicsFixture: matrix.mechanicsFixtureRows,
      pair: matrix.pairRows,
    },
  }
  writer.finalize({
    manifest: {
      schemaVersion: ROSTER_WALL_ACCEPTED_SCHEMA_VERSION,
      experimentId: ROSTER_WALL_ACCEPTED_EXPERIMENT_ID,
      seedSetId: ROSTER_WALL_ACCEPTED_SEED_SET_ID,
      profile: 'smoke',
      completeEvidence: false,
      source,
      matrix,
      counts,
      entryIndex,
      acceptanceChecks: acceptedChecks(matrix),
      invariantFailures: 0,
    },
    summary: {
      schemaVersion: ROSTER_WALL_ACCEPTED_SCHEMA_VERSION,
      experimentId: ROSTER_WALL_ACCEPTED_EXPERIMENT_ID,
      seedSetId: ROSTER_WALL_ACCEPTED_SEED_SET_ID,
      profile: 'smoke',
      completeEvidence: false,
      source,
      matrix,
      counts,
      invariantFailures: 0,
      findings: { H1: 'test-only extension field' },
    },
    summaryMarkdown: '# Accepted smoke\n',
  })
  verifyRosterWallAcceptedArtifactDirectory(fixture.root, runName)
  return source
}

function writeExampleArtifact(root: string, runName: string, cash = 123): void {
  const writer = new RosterWallArtifactWriter(root, runName)
  const state = generateWorld(`fixture-seed-${String(cash)}`)
  const saveJson = exportSave(makeSaveV11(state))
  writer.writeEntry({
    entryId: 'entry-a',
    row: {
      entryId: 'entry-a',
      entrySaveHash: rosterWallSha256(saveJson),
      operatingPolicyId: 'direct-package',
      seed: 'fixture-seed',
    },
    saveJson,
  })
  writer.writeRow({
    entryId: 'entry-a',
    recordType: 'weekly',
    value: cash,
    week: 196,
  })
  writer.finalize({
    manifest: {
      experimentId: 'fixture',
      rowCount: 1,
      source: { commit: 'fixture-commit', worktreeDirty: false },
    },
    summary: { entries: 1, rows: 1 },
    summaryMarkdown: '# Roster wall fixture\n',
  })
}

describe('roster-wall provenance gates', () => {
  it('accepts a clean harness/docs/tests-only descendant and stamps exact source identity', () => {
    const fixture = createGitFixture()
    addHarnessOnlyDescendant(fixture)

    const source = rosterWallSourceProvenance(fixture.root, {
      productionAuthority: fixture.authority,
      runtime: 'node provenance-test',
    })

    expect(source).toEqual({
      branch: ROSTER_WALL_EXPECTED_BRANCH,
      commit: git(fixture.root, ['rev-parse', 'HEAD']),
      tree: git(fixture.root, ['rev-parse', 'HEAD^{tree}']),
      worktreeDirty: false,
      runtime: 'node provenance-test',
      saveVersion: 11,
      productionAuthorityCommit: fixture.authority,
      productionAuthorityTree: git(fixture.root, [
        'rev-parse',
        `${fixture.authority}^{tree}`,
      ]),
      authorityDiffPaths: [
        'docs/observer.md',
        'src/harness/observer.ts',
        'tests/observer.test.ts',
      ],
    })
  })

  it('rejects untracked executable state, a wrong branch, and production-source drift', () => {
    const dirty = createGitFixture()
    writeFileSync(join(dirty.root, 'src', 'harness', 'untracked.ts'), 'export {}\n')
    expect(() =>
      rosterWallSourceProvenance(dirty.root, {
        productionAuthority: dirty.authority,
      }),
    ).toThrow(/clean worktree/)

    const wrongBranch = createGitFixture('not-the-marathon')
    expect(() =>
      rosterWallSourceProvenance(wrongBranch.root, {
        productionAuthority: wrongBranch.authority,
      }),
    ).toThrow(/expected branch/)

    const productionDrift = createGitFixture()
    writeFileSync(
      join(productionDrift.root, 'src', 'core', 'index.ts'),
      'export const authority = false\n',
    )
    git(productionDrift.root, ['add', '.'])
    git(productionDrift.root, ['commit', '-qm', 'change production'])
    expect(() =>
      rosterWallSourceProvenance(productionDrift.root, {
        productionAuthority: productionDrift.authority,
      }),
    ).toThrow(/production-source changes/)
  })

  it('rejects an ignored executable/source shadow', () => {
    const fixture = createGitFixture()
    writeFileSync(join(fixture.root, '.gitignore'), 'src/harness/ignored-shadow.ts\n')
    git(fixture.root, ['add', '.gitignore'])
    git(fixture.root, ['commit', '-qm', 'ignore a source shadow'])
    writeFileSync(join(fixture.root, 'src', 'harness', 'ignored-shadow.ts'), 'export {}\n')

    expect(() =>
      rosterWallSourceProvenance(fixture.root, {
        productionAuthority: fixture.authority,
      }),
    ).toThrow(/ignored executable\/source shadows/)
  })

  it('discovers the owning root from a compiled-module-shaped descendant', () => {
    const root = createArtifactRepo()
    const compiled = join(root, 'dist', 'src', 'harness', 'roster-wall')
    mkdirSync(compiled, { recursive: true })
    expect(discoverRosterWallRepoRoot(compiled)).toBe(realpathSync(root))
  })

  it('rejects accepted attestation of a repository other than the executing checkout', () => {
    const foreign = createGitFixture()
    expect(() => acceptedRosterWallSourceProvenance(foreign.root)).toThrow(
      /same governed repository/,
    )
  })

  it('rejects a clean same-named branch when the authority is not its ancestor', () => {
    const root = createArtifactRepo()
    expect(() =>
      rosterWallSourceProvenance(root, {
        productionAuthority: 'authority',
        gitRunner: (_repoRoot, args) => {
          const command = args.join(' ')
          if (command === 'branch --show-current') {
            return { status: 0, stdout: ROSTER_WALL_EXPECTED_BRANCH, stderr: '' }
          }
          if (command.startsWith('status ')) return { status: 0, stdout: '', stderr: '' }
          if (command === 'rev-parse --verify HEAD') {
            return { status: 0, stdout: 'head', stderr: '' }
          }
          if (command === 'rev-parse --verify HEAD^{tree}') {
            return { status: 0, stdout: 'head-tree', stderr: '' }
          }
          if (command === 'rev-parse --verify authority^{commit}') {
            return { status: 0, stdout: 'authority', stderr: '' }
          }
          if (command === 'rev-parse --verify authority^{tree}') {
            return { status: 0, stdout: 'authority-tree', stderr: '' }
          }
          if (command === 'merge-base --is-ancestor authority head') {
            return { status: 1, stdout: '', stderr: '' }
          }
          return { status: 0, stdout: '', stderr: '' }
        },
      }),
    ).toThrow(/not a descendant/)
  })
})

describe('roster-wall artifact infrastructure', () => {
  it('canonicalizes JSON/JSONL and rejects values that could serialize ambiguously', () => {
    expect(rosterWallStableJson({ z: 1, a: { y: 2, b: 3 } })).toBe(
      '{"a":{"b":3,"y":2},"z":1}',
    )
    expect(rosterWallStableJsonl([{ z: 1, a: 2 }, { b: null }])).toBe(
      '{"a":2,"z":1}\n{"b":null}\n',
    )
    expect(rosterWallStableJsonl([])).toBe('')
    expect(() => rosterWallStableJson({ value: Number.NaN })).toThrow(/non-finite/)
    expect(() => rosterWallStableJson({ value: undefined })).toThrow(/unsupported/)
    const sparse = new Array<unknown>(2)
    sparse[1] = null
    expect(() => rosterWallStableJson(sparse)).toThrow(/sparse/)
    const protoKey = JSON.parse('{"__proto__":{"polluted":true}}') as unknown
    expect(rosterWallStableJson(protoKey)).toBe('{"__proto__":{"polluted":true}}')
    const symbolKey = { ordinary: true } as Record<PropertyKey, unknown>
    symbolKey[Symbol('hidden')] = true
    expect(() => rosterWallStableJson(symbolKey)).toThrow(/symbol/)
  })

  it('writes, inventories, verifies, and exactly replays a complete artifact', () => {
    const root = createArtifactRepo()
    writeExampleArtifact(root, 'first')
    writeExampleArtifact(root, 'second')

    const first = verifyRosterWallArtifactDirectory(root, 'first')
    expect(first.entryCount).toBe(1)
    expect(first.rowCount).toBe(2)
    expect(first.files).toEqual([
      'entries.jsonl',
      'entries/entry-a.save.json',
      'manifest.json',
      'rows.jsonl',
      'sha256.json',
      'summary.json',
      'summary.md',
    ])
    expect(first.inventory.files.map((entry) => entry.path)).not.toContain('sha256.json')
    expect(
      JSON.parse(readFileSync(first.paths.sha256, 'utf8')) as { algorithm: string },
    ).toMatchObject({ algorithm: 'sha256' })

    const comparison = assertRosterWallArtifactsByteIdentical(root, 'first', 'second')
    expect(comparison.byteIdentical).toBe(true)
    expect(comparison.differences).toEqual([])
  })

  it('does not expose an accepted-finalization authority override', () => {
    const accepted = createGitFixture()
    const source = rosterWallSourceProvenance(accepted.root, {
      productionAuthority: accepted.authority,
    })
    const writer = new RosterWallArtifactWriter(accepted.root, 'accepted')
    const saveJson = exportSave(makeSaveV11(generateWorld('accepted-finalization')))
    writer.writeEntry({ entryId: 'entry-a', row: { entryId: 'entry-a' }, saveJson })
    writer.writeRow({ recordType: 'weekly' })
    const acceptedFinalization = acceptedTestFinalization(source)
    expect(() =>
      writer.finalizeAccepted({
        ...acceptedFinalization,
        summaryMarkdown: '# Accepted\n',
        source,
      }),
    ).toThrow(/same governed repository|production authority failed/)
  })

  it('rejects the former skeletal smoke counterfeit before semantic acceptance', () => {
    const fixture = createGitFixture()
    expect(() => writeAcceptedSmokeArtifact(fixture, 'semantic-smoke')).toThrow(
      /same governed repository|production authority failed|summary\.json lacks denominators|governed entry projection|projection disagrees/,
    )
  })

  it('reports a valid deterministic replay difference without conflating file sets', () => {
    const root = createArtifactRepo()
    writeExampleArtifact(root, 'left', 123)
    writeExampleArtifact(root, 'right', 456)

    const comparison = compareRosterWallArtifactDirectories(root, 'left', 'right')
    expect(comparison.byteIdentical).toBe(false)
    expect(comparison.differences.map((difference) => difference.path)).toEqual([
      'entries.jsonl',
      'entries/entry-a.save.json',
      'rows.jsonl',
      'sha256.json',
    ])
    expect(comparison.differences.every((difference) => difference.kind === 'bytes')).toBe(true)
  })

  it('rejects malformed UTF-8 in canonical JSONL instead of decoding replacement characters', () => {
    const root = createArtifactRepo()
    writeExampleArtifact(root, 'invalid-utf8')
    const directory = join(root, 'out', 'week-208-roster-wall', 'invalid-utf8')
    writeFileSync(
      join(directory, 'rows.jsonl'),
      Buffer.from([0x7b, 0x22, 0x78, 0x22, 0x3a, 0x22, 0xff, 0x22, 0x7d, 0x0a]),
    )
    refreshArtifactInventory(root, 'invalid-utf8')
    expect(() => verifyRosterWallArtifactDirectory(root, 'invalid-utf8')).toThrow(/valid UTF-8/)
  })

  it('rejects an oversized JSONL row before buffering it', () => {
    const root = createArtifactRepo()
    const writer = new RosterWallArtifactWriter(root, 'oversized-row')
    expect(() =>
      writer.writeRow({ payload: 'x'.repeat(ROSTER_WALL_MAX_JSONL_ROW_BYTES) }),
    ).toThrow(/governed JSONL record limit/)
  })

  it('rejects rebuilt mechanics semantics against the canonical fixture oracle', () => {
    const fixture = createGitFixture()
    const source = rosterWallSourceProvenance(fixture.root, {
      productionAuthority: fixture.authority,
    })
    source.productionAuthorityCommit = '8b7e95eb92f6f809522a595b4b458d4f19e26852'
    source.productionAuthorityTree = '11bdbb9a12b4419d8b62ca83934ca2def5c70f1d'
    const rows = runRosterWallMechanicsFixtures(source)
    expect(() => assertRosterWallAcceptedMechanicsFixtureRows(rows, source)).not.toThrow()
    const counterfeit = structuredClone(rows)
    counterfeit[0]!.threshold.value = (counterfeit[0]!.threshold.value ?? 0) + 1
    expect(() =>
      assertRosterWallAcceptedMechanicsFixtureRows(counterfeit, source),
    ).toThrow(/canonical execution/)
  })

  it('rejects digest tampering and any extra generated file', () => {
    const root = createArtifactRepo()
    writeExampleArtifact(root, 'tampered')
    const directory = join(root, 'out', 'week-208-roster-wall', 'tampered')
    writeFileSync(join(directory, 'rows.jsonl'), '{"tampered":true}\n')
    expect(() => verifyRosterWallArtifactDirectory(root, 'tampered')).toThrow(/sha256/)

    writeExampleArtifact(root, 'extra')
    const extraDirectory = join(root, 'out', 'week-208-roster-wall', 'extra')
    writeFileSync(join(extraDirectory, 'notes.txt'), 'not governed\n')
    expect(() => verifyRosterWallArtifactDirectory(root, 'extra')).toThrow(/extra top-level/)
  })

  it('refuses traversal, symlink escape, stale output, duplicate entries, and hash mismatch', () => {
    const root = createArtifactRepo()
    expect(() => validateRosterWallRunName('../escape')).toThrow(/run name/)

    const outside = temporaryRoot('roster-wall-outside-')
    const outputRoot = join(root, 'out', 'week-208-roster-wall')
    mkdirSync(outputRoot, { recursive: true })
    symlinkSync(outside, join(outputRoot, 'escaped'))
    expect(() => new RosterWallArtifactWriter(root, 'escaped')).toThrow(/symbolic link/)

    mkdirSync(join(outputRoot, 'stale'))
    writeFileSync(join(outputRoot, 'stale', 'old.txt'), 'old\n')
    expect(() => new RosterWallArtifactWriter(root, 'stale')).toThrow(/not empty/)

    const writer = new RosterWallArtifactWriter(root, 'immutable')
    const saveJson = exportSave(makeSaveV11(generateWorld('immutable-save')))
    writer.writeEntry({ entryId: 'same', row: { entryId: 'same' }, saveJson })
    expect(() =>
      writer.writeEntry({ entryId: 'same', row: { entryId: 'same' }, saveJson }),
    ).toThrow(/duplicate immutable entry/)
    expect(() =>
      writer.writeEntry({
        entryId: 'wrong-hash',
        row: { entryId: 'wrong-hash', entrySaveHash: '0'.repeat(64) },
        saveJson,
      }),
    ).toThrow(/entrySaveHash disagrees/)
  })
})
