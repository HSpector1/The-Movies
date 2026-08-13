import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { runFacilitiesCorpus } from '../src/harness/facilities/index.js'
import {
  buildFacilitiesArtifacts,
  discoverFacilitiesRepoRoot,
  facilitiesSourceProvenance,
  parseFacilitiesArgs,
  writeFacilitiesArtifacts,
} from '../src/harness/run-facilities-observatory.js'

const SOURCE = {
  sourceCommit: 'artifact-test-commit',
  sourceTree: 'artifact-test-tree',
  worktreeDirty: false,
  runtime: 'node artifact-test',
} as const

const temporaryRoots: string[] = []

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function hasWallClockKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasWallClockKey)
  if (value === null || typeof value !== 'object') return false
  return Object.entries(value as Record<string, unknown>).some(
    ([key, nested]) => /^(date|datetime|timestamp|generatedAt|createdAt)$/i.test(key) || hasWallClockKey(nested),
  )
}

describe('Facilities observatory artifact runner', () => {
  it('parses only the governed flags and expands deterministic seed counts', () => {
    expect(
      parseFacilitiesArgs([
        '--run-name',
        'primary-260',
        '--seeds',
        '3',
        '--policies',
        'direct-package,scaled-two-team',
      ]),
    ).toEqual({
      runName: 'primary-260',
      seeds: ['facilities-0001', 'facilities-0002', 'facilities-0003'],
      horizonWeeks: 260,
      policyIds: ['direct-package', 'scaled-two-team'],
      capacityDelta: 1,
      availableWeek: 0,
    })

    expect(
      parseFacilitiesArgs([
        '--run-name',
        'plus-two-delayed',
        '--seeds',
        '1',
        '--horizon',
        '12',
        '--capacity-delta',
        '2',
        '--available-week',
        '7',
      ]),
    ).toMatchObject({
      horizonWeeks: 12,
      capacityDelta: 2,
      availableWeek: 7,
    })

    expect(() => parseFacilitiesArgs(['--run-name', '../escape', '--seeds', '1'])).toThrow(
      /run-name/,
    )
    expect(() => parseFacilitiesArgs(['--run-name', 'safe', '--seeds', '1', '--wat', 'x'])).toThrow(
      /unknown flag/,
    )
    expect(() => parseFacilitiesArgs(['--run-name', 'safe', '--run-name', 'again', '--seeds', '1'])).toThrow(
      /duplicate flag/,
    )
    expect(() => parseFacilitiesArgs(['--run-name', 'safe'])).toThrow(/--seeds is required/)
    expect(() =>
      parseFacilitiesArgs([
        '--run-name',
        'safe',
        '--seeds',
        '1',
        '--capacity-delta',
        '3',
      ]),
    ).toThrow(/capacity-delta must be exactly 1 or 2/)
    expect(() =>
      parseFacilitiesArgs([
        '--run-name',
        'safe',
        '--seeds',
        '1',
        '--available-week',
        '-1',
      ]),
    ).toThrow(/available-week must be a non-negative integer/)
    expect(() =>
      parseFacilitiesArgs([
        '--run-name',
        'safe',
        '--seeds',
        '1',
        '--horizon',
        '12',
        '--available-week',
        '13',
      ]),
    ).toThrow(/available-week must be no greater than --horizon/)
  })

  it('builds byte-identical timestamp-free artifacts with every evidence mode explicit', () => {
    const firstResult = runFacilitiesCorpus({
      seeds: ['facilities-artifact'],
      policyIds: ['development-casting'],
      horizonWeeks: 208,
      capacityDelta: 2,
      availableWeek: 40,
      source: SOURCE,
    })
    const secondResult = runFacilitiesCorpus({
      seeds: ['facilities-artifact'],
      policyIds: ['development-casting'],
      horizonWeeks: 208,
      capacityDelta: 2,
      availableWeek: 40,
      source: SOURCE,
    })
    const first = buildFacilitiesArtifacts(firstResult)
    const second = buildFacilitiesArtifacts(secondResult)

    expect(first).toEqual(second)
    expect(first.rowsJsonl.endsWith('\n')).toBe(true)
    expect(first.summaryJson.endsWith('\n')).toBe(true)
    expect(first.summaryMarkdown.endsWith('\n')).toBe(true)
    const rows = first.rowsJsonl
      .trimEnd()
      .split('\n')
      .map(
        (line) =>
          JSON.parse(line) as
            | {
                mode: string
                recordType: 'weekly' | 'staffing' | 'intent'
                armConfiguration: { id: string }
              }
            | {
                mode: string
                recordType: 'shadow'
                sourceArmConfiguration: { id: string; capacityDelta: number }
                evaluatedShadowConfiguration: {
                  capability: string
                  capacityDelta: number
                  facilityId: string
                }
                facilityManifest: {
                  id: string
                  capability: string
                  capacity: number
                }[]
              },
      )
    expect(new Set(rows.map((row) => row.mode))).toEqual(
      new Set(['current', 'counterfactual', 'one-boundary-shadow']),
    )
    expect(new Set(rows.map((row) => row.recordType))).toEqual(
      new Set(['weekly', 'staffing', 'intent', 'shadow']),
    )
    const nonShadowRows = rows.filter((row) => row.recordType !== 'shadow')
    const shadowRows = rows.filter((row) => row.recordType === 'shadow')
    expect(new Set(nonShadowRows.map((row) => row.armConfiguration.id))).toEqual(
      new Set([
        'current-capacity',
        'development-casting-plus-one',
        'development-casting-plus-two',
      ]),
    )
    expect(shadowRows.length).toBeGreaterThan(0)
    expect(
      shadowRows.every(
        (row) =>
          !('armConfiguration' in row) &&
          row.sourceArmConfiguration.id === 'current-capacity' &&
          row.sourceArmConfiguration.capacityDelta === 0 &&
          row.evaluatedShadowConfiguration.capacityDelta === 1 &&
          row.facilityManifest.some(
            (facility) =>
              facility.id === row.evaluatedShadowConfiguration.facilityId &&
              facility.capability === row.evaluatedShadowConfiguration.capability &&
              facility.capacity === row.evaluatedShadowConfiguration.capacityDelta,
          ),
      ),
    ).toBe(true)
    expect(
      rows.every(
        (row) =>
          (row as { sourceCommit?: string }).sourceCommit === SOURCE.sourceCommit,
      ),
    ).toBe(true)
    const summary = JSON.parse(first.summaryJson) as {
      fourthSlotMarginals: unknown[]
      aggregate: {
        fourthSlotMarginal: {
          interpretation: string
          causal: boolean
          pairCount: number
        }
      }
    }
    expect(hasWallClockKey(summary)).toBe(false)
    expect(summary.fourthSlotMarginals).toHaveLength(1)
    expect(summary.aggregate.fourthSlotMarginal).toMatchObject({
      interpretation: 'descriptive-after-policy-feedback',
      causal: false,
      pairCount: 1,
    })
    expect(first.summaryMarkdown).toMatch(/research-only/i)
    expect(first.summaryMarkdown).toContain(
      'Counterfactual: +2 Development & Casting capacity, operational at the start of Week 40.',
    )
    expect(first.summaryMarkdown).toContain('Current D&C rejections (full horizon)')
    expect(first.summaryMarkdown).toContain(
      'Counterfactual-arm D&C rejections (full horizon)',
    )
    expect(first.summaryMarkdown).toContain('+2 capacity from Week 40 (inclusive)')
    expect(first.summaryMarkdown).toContain(
      'A rejection recorded in Week 40 belongs to the inclusive post-availability exposure.',
    )
    expect(first.summaryMarkdown).toContain(
      '## Current → requested (+2) boundary shadows and descriptive outcomes',
    )
    expect(first.summaryMarkdown).toContain('## +1 → +2 fourth-slot marginal')
    expect(first.summaryMarkdown).toContain(
      'This comparison is descriptive and noncausal after policy feedback.',
    )
    expect(first.summaryMarkdown).toContain('+1 D&C rejections (full horizon)')
    expect(first.summaryMarkdown).toContain('+2 D&C rejections (full horizon)')
    expect(first.summaryMarkdown).toContain(
      'Release Δ signs (negative / zero / positive)',
    )
    expect(first.summaryMarkdown).toContain(
      'Final-cash Δ signs (negative / zero / positive)',
    )
    expect(first.summaryMarkdown).not.toContain('Fourth-slot marginal: not measured')
    expect(first.summaryMarkdown).toContain('Admitted one-slot D&C boundary shadows')
    expect(first.summaryMarkdown).toMatch(/Utilization alone is not bottleneck evidence/i)
    expect(first.summaryMarkdown).toMatch(/D-17B macroeconomy residuals remain open/i)
    for (const residual of [
      'cash runaway',
      'top-studio economic immortality',
      'week-208 synchronized roster wall',
      'P5 dominance',
      'world-led variance',
      'cheap-film purpose',
      'premium-film purpose',
      'remaining menu breadth',
      'formal G12 timing',
    ]) {
      expect(first.summaryMarkdown).toContain(residual)
    }
  })

  it('writes exactly three governed files and refuses a stale non-empty run directory', () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'facilities-artifacts-'))
    temporaryRoots.push(repoRoot)
    const result = runFacilitiesCorpus({
      seeds: ['facilities-writer'],
      policyIds: ['direct-package'],
      horizonWeeks: 4,
      source: SOURCE,
    })
    const bundle = buildFacilitiesArtifacts(result)
    const paths = writeFacilitiesArtifacts(repoRoot, 'writer-law', bundle)

    expect(bundle.summaryMarkdown).toContain(
      '## Current → requested (+1) boundary shadows and descriptive outcomes',
    )
    expect(bundle.summaryMarkdown).toContain(
      'Fourth-slot marginal: not measured; this corpus requested +1 capacity only.',
    )
    expect(bundle.summaryMarkdown).not.toContain('## +1 → +2 fourth-slot marginal')
    expect(readdirSync(paths.directory).sort()).toEqual([
      'rows.jsonl',
      'summary.json',
      'summary.md',
    ])
    expect(readFileSync(paths.rows, 'utf8')).toBe(bundle.rowsJsonl)
    expect(readFileSync(paths.summary, 'utf8')).toBe(bundle.summaryJson)
    expect(readFileSync(paths.markdown, 'utf8')).toBe(bundle.summaryMarkdown)
    expect(() => writeFacilitiesArtifacts(repoRoot, 'writer-law', bundle)).toThrow(
      /already exists and is not empty/,
    )
  })

  it('treats untracked executable source as dirty provenance', () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'facilities-provenance-'))
    temporaryRoots.push(repoRoot)
    execFileSync('git', ['init', '-q'], { cwd: repoRoot })
    execFileSync('git', ['config', 'user.email', 'observatory@example.invalid'], { cwd: repoRoot })
    execFileSync('git', ['config', 'user.name', 'Facilities Observatory'], { cwd: repoRoot })
    writeFileSync(join(repoRoot, 'tracked.txt'), 'tracked\n')
    execFileSync('git', ['add', 'tracked.txt'], { cwd: repoRoot })
    execFileSync('git', ['commit', '-qm', 'fixture'], { cwd: repoRoot })
    expect(facilitiesSourceProvenance(repoRoot).worktreeDirty).toBe(false)

    writeFileSync(join(repoRoot, 'untracked.ts'), 'export {}\n')
    expect(facilitiesSourceProvenance(repoRoot).worktreeDirty).toBe(true)
  })

  it('discovers the governed root from a compiled dist module location', () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'facilities-root-discovery-'))
    temporaryRoots.push(repoRoot)
    mkdirSync(join(repoRoot, '.git'))
    mkdirSync(join(repoRoot, 'src', 'core'), { recursive: true })
    mkdirSync(join(repoRoot, 'dist', 'src', 'harness'), { recursive: true })
    writeFileSync(join(repoRoot, 'package.json'), '{}\n')
    writeFileSync(join(repoRoot, 'src', 'core', 'index.ts'), 'export {}\n')

    expect(discoverFacilitiesRepoRoot(join(repoRoot, 'dist', 'src', 'harness'))).toBe(
      repoRoot,
    )
  })

  it('cannot bind root discovery to a different valid Project: Studio cwd', () => {
    const governedRoot = discoverFacilitiesRepoRoot()
    const unrelatedRoot = mkdtempSync(join(tmpdir(), 'facilities-unrelated-cwd-'))
    temporaryRoots.push(unrelatedRoot)
    mkdirSync(join(unrelatedRoot, '.git'))
    mkdirSync(join(unrelatedRoot, 'src', 'core'), { recursive: true })
    writeFileSync(join(unrelatedRoot, 'package.json'), '{}\n')
    writeFileSync(join(unrelatedRoot, 'src', 'core', 'index.ts'), 'export {}\n')

    const originalCwd = process.cwd()
    try {
      process.chdir(unrelatedRoot)
      expect(discoverFacilitiesRepoRoot()).toBe(governedRoot)
    } finally {
      process.chdir(originalCwd)
    }
  })

  it('refuses an output-directory symlink even when the target is empty', () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'facilities-symlink-repo-'))
    const outside = mkdtempSync(join(tmpdir(), 'facilities-symlink-outside-'))
    temporaryRoots.push(repoRoot, outside)
    const outputRoot = join(repoRoot, 'out', 'facilities-construction-research')
    mkdirSync(outputRoot, { recursive: true })
    symlinkSync(outside, join(outputRoot, 'escaped-run'))
    const result = runFacilitiesCorpus({
      seeds: ['facilities-symlink'],
      policyIds: ['direct-package'],
      horizonWeeks: 2,
      source: SOURCE,
    })

    expect(() =>
      writeFacilitiesArtifacts(repoRoot, 'escaped-run', buildFacilitiesArtifacts(result)),
    ).toThrow(/symbolic link/)
    expect(readdirSync(outside)).toEqual([])
  })
})
