// Week-208 roster-wall observatory provenance.
//
// ANALYSIS ONLY. Accepted evidence may run only from the governed marathon branch,
// from a clean worktree, and from a descendant whose changes since the repaired
// production authority are confined to documentation, harnesses, and tests.

import { spawnSync } from 'node:child_process'
import { existsSync, realpathSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROSTER_WALL_EXPECTED_BRANCH =
  'operation-hollywood-autonomous-marathon' as const
export const ROSTER_WALL_PRODUCTION_AUTHORITY =
  '8b7e95eb92f6f809522a595b4b458d4f19e26852' as const
export const ROSTER_WALL_PRODUCTION_AUTHORITY_TREE =
  '11bdbb9a12b4419d8b62ca83934ca2def5c70f1d' as const

export const ROSTER_WALL_ALLOWED_AUTHORITY_DIFF_PREFIXES = [
  'docs/',
  'src/harness/',
  'tests/',
] as const

export type RosterWallGitResult = {
  status: number
  stdout: string
  stderr: string
}

export type RosterWallGitRunner = (
  repoRoot: string,
  args: readonly string[],
) => RosterWallGitResult

export type RosterWallSourceProvenance = {
  branch: string
  commit: string
  tree: string
  worktreeDirty: false
  runtime: string
  saveVersion: 13
  productionAuthorityCommit: string
  productionAuthorityTree: string
  authorityDiffPaths: string[]
}

export type RosterWallProvenanceOptions = {
  expectedBranch?: string
  productionAuthority?: string
  allowedDiffPrefixes?: readonly string[]
  gitRunner?: RosterWallGitRunner
  runtime?: string
}


const here = dirname(fileURLToPath(import.meta.url))

function portableRelative(root: string, path: string): string {
  return relative(root, path).split(sep).join('/')
}

/** Find the repository owning this module, never an unrelated current directory. */
export function discoverRosterWallRepoRoot(moduleDirectory = here): string {
  let candidate = resolve(moduleDirectory)
  while (true) {
    if (
      existsSync(join(candidate, '.git')) &&
      existsSync(join(candidate, 'package.json')) &&
      existsSync(join(candidate, 'src', 'core', 'index.ts'))
    ) {
      return realpathSync(candidate)
    }
    const parent = dirname(candidate)
    if (parent === candidate) break
    candidate = parent
  }
  throw new Error(
    `roster-wall provenance: could not discover the repository root from ${resolve(moduleDirectory)}`,
  )
}

/**
 * Accepted evidence must execute the committed TypeScript harness, never an
 * ignored emitted copy under dist/ (or another ignored source shadow).
 */
export function assertRosterWallAcceptedModulePath(
  repoRoot: string,
  moduleUrl: string = import.meta.url,
): void {
  const root = realpathSync(repoRoot)
  const modulePath = realpathSync(fileURLToPath(moduleUrl))
  if (!modulePath.startsWith(`${root}${sep}`)) {
    throw new Error(
      'roster-wall provenance: accepted evidence must attest the same governed repository that owns the executing module',
    )
  }
  const relativePath = portableRelative(root, modulePath)
  if (
    relativePath === '' ||
    relativePath.startsWith('../') ||
    relativePath.startsWith('/') ||
    !relativePath.startsWith('src/harness/roster-wall/') ||
    !relativePath.endsWith('.ts')
  ) {
    throw new Error(
      `roster-wall provenance: accepted evidence must execute committed TypeScript under src/harness/roster-wall, found ${JSON.stringify(relativePath)}`,
    )
  }
}

export const runRosterWallGit: RosterWallGitRunner = (repoRoot, args) => {
  const result = spawnSync('git', [...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  if (result.error !== undefined) throw result.error
  return {
    status: result.status ?? 1,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  }
}

function requireGit(
  gitRunner: RosterWallGitRunner,
  repoRoot: string,
  args: readonly string[],
  label: string,
): string {
  const result = gitRunner(repoRoot, args)
  if (result.status !== 0) {
    const detail = result.stderr === '' ? `exit ${String(result.status)}` : result.stderr
    throw new Error(`roster-wall provenance: ${label} failed (${detail})`)
  }
  return result.stdout
}

function canonicalDiffPaths(raw: string): string[] {
  if (raw === '') return []
  const paths = raw.split('\n')
  if (
    paths.some(
      (path) =>
        path === '' ||
        path.startsWith('/') ||
        path.startsWith('../') ||
        path.includes('/../') ||
        path.includes('\\') ||
        path.includes('\0'),
    )
  ) {
    throw new Error('roster-wall provenance: git reported an unsafe changed path')
  }
  return [...paths].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

function assertAllowedAuthorityDiff(
  paths: readonly string[],
  allowedPrefixes: readonly string[],
): void {
  const invalidPrefix = allowedPrefixes.find(
    (prefix) =>
      prefix === '' ||
      prefix.startsWith('/') ||
      prefix.startsWith('../') ||
      !prefix.endsWith('/'),
  )
  if (invalidPrefix !== undefined) {
    throw new Error(
      `roster-wall provenance: invalid allowed diff prefix ${JSON.stringify(invalidPrefix)}`,
    )
  }
  const disallowed = paths.filter(
    (path) => !allowedPrefixes.some((prefix) => path.startsWith(prefix)),
  )
  if (disallowed.length > 0) {
    throw new Error(
      `roster-wall provenance: production-source changes since authority are not allowed: ${disallowed.join(', ')}`,
    )
  }
}

/**
 * Validate and stamp one accepted evidence authority.
 *
 * This intentionally checks full porcelain output, including untracked files. A
 * locally present untracked harness can change executable behavior and therefore
 * invalidates an accepted artifact just as surely as a tracked modification.
 */
export function rosterWallSourceProvenance(
  repoRoot: string,
  options: RosterWallProvenanceOptions = {},
): RosterWallSourceProvenance {
  const canonicalRoot = realpathSync(repoRoot)
  const gitRunner = options.gitRunner ?? runRosterWallGit
  const expectedBranch = options.expectedBranch ?? ROSTER_WALL_EXPECTED_BRANCH
  const authority = options.productionAuthority ?? ROSTER_WALL_PRODUCTION_AUTHORITY
  const allowedPrefixes =
    options.allowedDiffPrefixes ?? ROSTER_WALL_ALLOWED_AUTHORITY_DIFF_PREFIXES

  const branch = requireGit(
    gitRunner,
    canonicalRoot,
    ['branch', '--show-current'],
    'branch discovery',
  )
  if (branch !== expectedBranch) {
    throw new Error(
      `roster-wall provenance: expected branch ${JSON.stringify(expectedBranch)}, found ${JSON.stringify(branch || '(detached HEAD)')}`,
    )
  }

  const status = requireGit(
    gitRunner,
    canonicalRoot,
    ['status', '--porcelain=v1', '--untracked-files=all'],
    'worktree status',
  )
  if (status !== '') {
    throw new Error('roster-wall provenance: accepted evidence requires a clean worktree')
  }
  const ignoredExecutablePaths = canonicalDiffPaths(
    requireGit(
      gitRunner,
      canonicalRoot,
      [
        'ls-files',
        '--others',
        '--ignored',
        '--exclude-standard',
        '--',
        'docs',
        'src/core',
        'src/harness',
        'tests',
        'ui/src',
      ],
      'ignored executable/source shadow scan',
    ),
  )
  if (ignoredExecutablePaths.length > 0) {
    throw new Error(
      `roster-wall provenance: ignored executable/source shadows are not allowed: ${ignoredExecutablePaths.join(', ')}`,
    )
  }

  const commit = requireGit(gitRunner, canonicalRoot, ['rev-parse', '--verify', 'HEAD'], 'HEAD')
  const tree = requireGit(
    gitRunner,
    canonicalRoot,
    ['rev-parse', '--verify', 'HEAD^{tree}'],
    'HEAD tree',
  )
  const authorityCommit = requireGit(
    gitRunner,
    canonicalRoot,
    ['rev-parse', '--verify', `${authority}^{commit}`],
    'production authority',
  )
  const authorityTree = requireGit(
    gitRunner,
    canonicalRoot,
    ['rev-parse', '--verify', `${authorityCommit}^{tree}`],
    'production authority tree',
  )
  const ancestry = gitRunner(canonicalRoot, [
    'merge-base',
    '--is-ancestor',
    authorityCommit,
    commit,
  ])
  if (ancestry.status !== 0) {
    throw new Error(
      'roster-wall provenance: HEAD is not a descendant of the repaired production authority',
    )
  }

  const authorityDiffPaths = canonicalDiffPaths(
    requireGit(
      gitRunner,
      canonicalRoot,
      ['diff', '--name-only', '--no-renames', `${authorityCommit}..${commit}`, '--'],
      'authority diff',
    ),
  )
  assertAllowedAuthorityDiff(authorityDiffPaths, allowedPrefixes)

  return {
    branch,
    commit,
    tree,
    worktreeDirty: false,
    runtime: options.runtime ?? `node ${process.version}`,
    saveVersion: 13,
    productionAuthorityCommit: authorityCommit,
    productionAuthorityTree: authorityTree,
    authorityDiffPaths,
  }
}

/**
 * Public accepted-evidence provenance. Governance is intentionally not
 * configurable: tests may exercise the generic checker above, but an accepted
 * artifact is always tied to the frozen branch, production authority and path
 * boundary recorded in the research contract.
 */
export function acceptedRosterWallSourceProvenance(
  repoRoot: string,
): RosterWallSourceProvenance {
  assertRosterWallAcceptedModulePath(repoRoot)
  const source = rosterWallSourceProvenance(repoRoot, {
    expectedBranch: ROSTER_WALL_EXPECTED_BRANCH,
    productionAuthority: ROSTER_WALL_PRODUCTION_AUTHORITY,
    allowedDiffPrefixes: ROSTER_WALL_ALLOWED_AUTHORITY_DIFF_PREFIXES,
  })
  if (
    source.productionAuthorityCommit !== ROSTER_WALL_PRODUCTION_AUTHORITY ||
    source.productionAuthorityTree !== ROSTER_WALL_PRODUCTION_AUTHORITY_TREE
  ) {
    throw new Error(
      'roster-wall provenance: accepted evidence production authority or tree disagrees with the frozen contract',
    )
  }
  return source
}

/** Require a final provenance stamp to be the exact accepted start authority. */
export function assertRosterWallProvenanceUnchanged(
  expected: RosterWallSourceProvenance,
  actual: RosterWallSourceProvenance,
): void {
  const expectedBytes = JSON.stringify(expected)
  const actualBytes = JSON.stringify(actual)
  if (expectedBytes !== actualBytes) {
    throw new Error(
      'roster-wall provenance: branch, commit, tree, runtime, or source authority changed during generation',
    )
  }
}
