// ── PF1-M1 ASSET GATE — provenance and size ──────────────────────────────────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M1 and §7, NOT from the
// implementation.
//
// Governing charter law enforced by this file:
//   • "Asset policy (binding, new …): compressed runtime audio … committed under
//      ui/public/audio/ … every committed file listed in AUDIO-PROVENANCE.md with
//      source and license — project-owned, properly licensed, CC0/public-domain,
//      or generated-for-project only; per-file ≤ 1.5 MB, campaign total ≤ 15 MB."
//                                                                       (§5-M1)
//   • "(3) asset provenance and size: every file under ui/public/audio/** has an
//      AUDIO-PROVENANCE.md row with non-empty source + license, no row lists a
//      missing file, per-file ≤ 1.5 MB and campaign total ≤ 15 MB."         (§7)
//
// This gate is RED until M1's assets and their provenance document land. That is
// the intended behaviour of a gate, not a defect in the suite.

import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// this file lives in ui/src/test/contracts → the repo root is four levels up
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')
const AUDIO_DIR = join(repoRoot, 'ui', 'public', 'audio')

const MAX_FILE_BYTES = Math.round(1.5 * 1024 * 1024) // 1.5 MB per file
const MAX_TOTAL_BYTES = 15 * 1024 * 1024 // 15 MB campaign total

// The provenance document's exact home is not frozen by the charter (§6 names the
// file, not its directory), so the gate accepts the plausible homes and reports
// clearly when none exists.
const PROVENANCE_CANDIDATES = [
  join(repoRoot, 'AUDIO-PROVENANCE.md'),
  join(repoRoot, 'ui', 'AUDIO-PROVENANCE.md'),
  join(repoRoot, 'docs', 'AUDIO-PROVENANCE.md'),
  join(AUDIO_DIR, 'AUDIO-PROVENANCE.md'),
]

/** Documentation living beside the assets is not itself an asset. */
function isAsset(file: string): boolean {
  const name = basename(file)
  return !name.startsWith('.') && !/\.md$/i.test(name)
}

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

function requireAudioDir(): string[] {
  expect(
    existsSync(AUDIO_DIR),
    `M1 AUDIO ASSETS ARE ABSENT: ${relative(repoRoot, AUDIO_DIR)} does not exist. ` +
      'PF1-M1 §5-M1 requires committed runtime audio under ui/public/audio/.',
  ).toBe(true)
  return walk(AUDIO_DIR).filter(isAsset)
}

function provenancePath(): string {
  const found = PROVENANCE_CANDIDATES.find((candidate) => existsSync(candidate))
  expect(
    found,
    'AUDIO-PROVENANCE.md is missing. Looked in: ' +
      PROVENANCE_CANDIDATES.map((c) => relative(repoRoot, c)).join(', '),
  ).toBeDefined()
  return found as string
}

// ── Markdown table parsing ───────────────────────────────────────────────────
type Row = { file: string; source: string; license: string; line: number }

function cellsOf(line: string): string[] {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function clean(cell: string): string {
  return cell
    .replace(/`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // markdown links → their text
    .replace(/[*_]{1,2}/g, '')
    .trim()
}

function isSeparator(cells: readonly string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{2,}:?$/.test(cell.trim()))
}

function headerIndices(cells: readonly string[]): { file: number; source: number; license: number } | null {
  const lower = cells.map((cell) => clean(cell).toLowerCase())
  const file = lower.findIndex((c) => /\b(file|filename|asset|path|track)\b/.test(c))
  const source = lower.findIndex((c) => /\b(source|origin|provenance)\b/.test(c))
  const license = lower.findIndex((c) => /licen[sc]e/.test(c))
  if (file < 0 || source < 0 || license < 0) return null
  return { file, source, license }
}

function parseRows(markdown: string): Row[] {
  const rows: Row[] = []
  let columns: { file: number; source: number; license: number } | null = null
  const lines = markdown.split('\n')
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!
    if (!line.trim().startsWith('|')) {
      continue
    }
    const cells = cellsOf(line)
    if (isSeparator(cells)) continue
    const header = headerIndices(cells)
    if (header) {
      columns = header
      continue
    }
    if (!columns) continue
    rows.push({
      file: clean(cells[columns.file] ?? ''),
      source: clean(cells[columns.source] ?? ''),
      license: clean(cells[columns.license] ?? ''),
      line: i + 1,
    })
  }
  return rows
}

const PLACEHOLDERS = new Set(['', '-', '—', '–', 'tbd', 'todo', 'n/a', 'na', '?', 'unknown', 'pending'])

function isPlaceholder(value: string): boolean {
  return PLACEHOLDERS.has(value.trim().toLowerCase())
}

/** Which assets have no row? Shared by the real gate and its negative-control fixture. */
function undocumented(assetRelPaths: readonly string[], rows: readonly Row[]): string[] {
  const claimed = new Set(rows.map((row) => basename(row.file)))
  return assetRelPaths.filter((rel) => !claimed.has(basename(rel)))
}

function loadRows(): Row[] {
  const doc = provenancePath()
  const rows = parseRows(readFileSync(doc, 'utf8'))
  expect(
    rows.length,
    `${relative(repoRoot, doc)} must carry a table with File / Source / License columns`,
  ).toBeGreaterThan(0)
  return rows
}

describe('PF1-M1 asset gate — the assets and their provenance exist', () => {
  it('ships committed runtime audio under ui/public/audio/', () => {
    const assets = requireAudioDir()
    expect(assets.length, 'ui/public/audio/ must contain at least one committed asset').toBeGreaterThan(0)
  })

  it('ships an AUDIO-PROVENANCE.md with File / Source / License columns', () => {
    expect(loadRows().length).toBeGreaterThan(0)
  })

  it('commits only compressed runtime formats (§5-M1: .m4a / .mp3 / .ogg)', () => {
    const wrong = requireAudioDir()
      .filter((file) => !/\.(m4a|mp3|ogg|opus|aac|webm)$/i.test(file))
      .map((file) => relative(repoRoot, file))
    expect(wrong, `non-runtime audio formats committed: ${wrong.join(', ')}`).toEqual([])
  })
})

describe('PF1-M1 asset gate — provenance covers every file', () => {
  it('every committed audio file has a provenance row', () => {
    const assets = requireAudioDir().map((file) => relative(AUDIO_DIR, file))
    const missing = undocumented(assets, loadRows())
    expect(
      missing,
      `audio committed without an AUDIO-PROVENANCE.md row: ${missing.join(', ')}`,
    ).toEqual([])
  })

  it('every provenance row names a file that exists', () => {
    const assets = requireAudioDir()
    const present = new Set(assets.map((file) => basename(file)))
    const relPaths = new Set(assets.map((file) => relative(AUDIO_DIR, file).split('\\').join('/')))
    const dangling = loadRows()
      .filter((row) => {
        const asPath = row.file.replace(/^\.?\/?(ui\/)?(public\/)?(audio\/)?/, '')
        return !present.has(basename(row.file)) && !relPaths.has(asPath)
      })
      .map((row) => `line ${row.line}: ${row.file || '(empty file cell)'}`)
    expect(dangling, `AUDIO-PROVENANCE.md rows with no file on disk: ${dangling.join(' | ')}`).toEqual([])
  })

  it('every provenance row carries a non-empty source', () => {
    const bad = loadRows()
      .filter((row) => isPlaceholder(row.source))
      .map((row) => `line ${row.line}: ${row.file}`)
    expect(bad, `provenance rows with no source: ${bad.join(' | ')}`).toEqual([])
  })

  it('every provenance row carries a non-empty license', () => {
    const bad = loadRows()
      .filter((row) => isPlaceholder(row.license))
      .map((row) => `line ${row.line}: ${row.file}`)
    expect(bad, `provenance rows with no license: ${bad.join(' | ')}`).toEqual([])
  })

  it('no provenance row is a duplicate claim on the same file', () => {
    const seen = new Map<string, number>()
    const duplicates: string[] = []
    for (const row of loadRows()) {
      const key = basename(row.file)
      if (seen.has(key)) duplicates.push(`${key} (lines ${seen.get(key)} and ${row.line})`)
      else seen.set(key, row.line)
    }
    expect(duplicates, `duplicate provenance rows: ${duplicates.join(' | ')}`).toEqual([])
  })
})

describe('PF1-M1 asset gate — size budget', () => {
  it('no single file exceeds 1.5 MB', () => {
    const oversized = requireAudioDir()
      .map((file) => ({ file: relative(repoRoot, file), bytes: statSync(file).size }))
      .filter((entry) => entry.bytes > MAX_FILE_BYTES)
      .map((entry) => `${entry.file} (${(entry.bytes / 1024 / 1024).toFixed(2)} MB)`)
    expect(oversized, `files over the 1.5 MB per-file budget: ${oversized.join(', ')}`).toEqual([])
  })

  it('the campaign total stays within 15 MB', () => {
    const total = requireAudioDir().reduce((sum, file) => sum + statSync(file).size, 0)
    expect(
      total,
      `committed audio totals ${(total / 1024 / 1024).toFixed(2)} MB against a 15 MB budget`,
    ).toBeLessThanOrEqual(MAX_TOTAL_BYTES)
  })
})

describe('PF1-M1 asset gate — the parser itself', () => {
  it('reads a well-formed provenance table', () => {
    const fixture = [
      '# Audio provenance',
      '',
      '| File | Source | License | Notes |',
      '| --- | --- | --- | --- |',
      '| `ambience-lot-bed.m4a` | recorded for this project | project-owned | temporary, replaceable |',
      '| ui-select.m4a | freesound.org/s/12345 | CC0 1.0 | |',
    ].join('\n')
    const rows = parseRows(fixture)
    expect(rows.map((r) => r.file)).toEqual(['ambience-lot-bed.m4a', 'ui-select.m4a'])
    expect(rows[0]!.license).toBe('project-owned')
    expect(rows[1]!.source).toBe('freesound.org/s/12345')
  })

  it('flags an undocumented asset (the gate can fail)', () => {
    const fixture = ['| File | Source | License |', '| --- | --- | --- |', '| a.m4a | x | CC0 |'].join(
      '\n',
    )
    const rows = parseRows(fixture)
    expect(undocumented(['a.m4a', 'ghost.m4a'], rows)).toEqual(['ghost.m4a'])
    expect(undocumented(['a.m4a'], rows)).toEqual([])
  })

  it('treats an empty or placeholder cell as no provenance at all', () => {
    const fixture = [
      '| File | Source | License |',
      '| --- | --- | --- |',
      '| a.m4a |  | CC0 |',
      '| b.m4a | somewhere | TBD |',
    ].join('\n')
    const rows = parseRows(fixture)
    expect(isPlaceholder(rows[0]!.source)).toBe(true)
    expect(isPlaceholder(rows[1]!.license)).toBe(true)
    expect(isPlaceholder(rows[1]!.source)).toBe(false)
  })
})
