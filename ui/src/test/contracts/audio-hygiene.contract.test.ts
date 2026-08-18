// ── PF1-M1 HYGIENE GATE — the Web Audio API lives in exactly one module ──────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M1 and §7, NOT from the
// implementation.
//
// Governing charter law enforced by this file:
//   • "AudioSink seam for tests: … Components never touch an AudioContext — a
//      hygiene test enforces it (§7)."                                 (§5-M1)
//   • "Hygiene gates (new, permanent), all on the hygiene.test.tsx
//      comment-stripping walk: … (2) zero AudioContext / new Audio( outside the
//      sanctioned sink module."                                          (§7)
//
// This reimplements the walk/comment-stripping machinery of ui/src/hygiene.test.tsx
// rather than importing it (that file exports nothing) — the established idiom,
// including its self-guard against a false pass from an empty walk.

import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// this file lives in ui/src/test/contracts → ui/src is two levels up
const uiSrcDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** The ONE module allowed to construct browser audio objects. */
const SANCTIONED = join(uiSrcDir, 'audio', 'sink.ts')

const SKIP_DIRS = new Set(['node_modules', 'dist', 'test', '__tests__', '__mocks__'])

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue
      out.push(...walk(full))
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full)
    }
  }
  return out
}

/** Test files legitimately NAME the forbidden token as a search needle — this one does. */
function isTestFile(path: string): boolean {
  return /\.(test|spec)\.(ts|tsx)$/.test(path) || path.includes(`${sep}test${sep}`)
}

/** Only EXECUTABLE code counts: a comment that documents the ban is not a violation. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1') // line comments (avoid eating "://" in URLs)
}

const FORBIDDEN: readonly { name: string; pattern: RegExp }[] = [
  { name: 'new AudioContext', pattern: /\bnew\s+AudioContext\b/ },
  { name: 'webkitAudioContext', pattern: /\bwebkitAudioContext\b/ },
  { name: 'new Audio(', pattern: /\bnew\s+Audio\s*\(/ },
]

/** The scanner under test: which banned constructions does this SOURCE TEXT contain? */
function violationsIn(source: string): string[] {
  const code = stripComments(source)
  return FORBIDDEN.filter(({ pattern }) => pattern.test(code)).map(({ name }) => name)
}

function shippingFiles(): string[] {
  return walk(uiSrcDir).filter((f) => !isTestFile(f))
}

function relative(path: string): string {
  return path.replace(uiSrcDir, 'ui/src')
}

describe('PF1-M1 hygiene gate — the scanner itself', () => {
  it('flags a synthetic source that constructs an AudioContext (the gate can fail)', () => {
    const fixture = 'export function boom() {\n  const ctx = new AudioContext()\n  return ctx\n}\n'
    expect(violationsIn(fixture)).toContain('new AudioContext')
  })

  it('flags the vendor-prefixed and element forms too', () => {
    expect(violationsIn('const C = window.webkitAudioContext')).toContain('webkitAudioContext')
    expect(violationsIn("const a = new Audio('/audio/x.m4a')")).toContain('new Audio(')
    expect(violationsIn('const a = new  Audio ( )')).toContain('new Audio(')
  })

  it('does NOT flag a comment that merely names the ban (comment-stripping works)', () => {
    const documented =
      '// components never call new AudioContext() — the sink owns it\n' +
      '/* new Audio("x.m4a") is banned outside the sink */\n' +
      'export const NOTE = 1\n'
    expect(violationsIn(documented)).toEqual([])
  })

  it('does not mistake AudioContext as a TYPE for a construction', () => {
    expect(violationsIn('let ctx: AudioContext | null = null')).toEqual([])
  })

  it('does not mistake a URL for a line comment', () => {
    expect(violationsIn("const doc = 'https://example.test/audio' \nconst x = 1")).toEqual([])
  })
})

describe('PF1-M1 hygiene gate — shipping ui/src', () => {
  it('scans a non-trivial number of shipping files (guards against an empty walk)', () => {
    const shipping = shippingFiles()
    expect(shipping.length).toBeGreaterThan(40)
  })

  it('excludes its own contract suite from the scan (this file names the ban)', () => {
    const shipping = shippingFiles().map(relative)
    expect(shipping.some((f) => f.includes('/test/contracts/'))).toBe(false)
  })

  it('constructs browser audio in NO shipping module except ui/src/audio/sink.ts', () => {
    const offenders: string[] = []
    for (const file of shippingFiles()) {
      if (file === SANCTIONED) continue
      const found = violationsIn(readFileSync(file, 'utf8'))
      if (found.length > 0) offenders.push(`${relative(file)} → ${found.join(', ')}`)
    }
    expect(
      offenders,
      `Web Audio construction escaped the sink module: ${offenders.join(' | ')}`,
    ).toEqual([])
  })

  it('keeps the AudioContext type out of components and screens as well', () => {
    // §7 words the gate as "zero AudioContext … outside the sanctioned sink module".
    // A bare type reference is weaker than a construction, so it is reported here as
    // its own assertion rather than folded into the construction gate above.
    const offenders: string[] = []
    for (const file of shippingFiles()) {
      if (file === SANCTIONED) continue
      if (/\bAudioContext\b/.test(stripComments(readFileSync(file, 'utf8')))) {
        offenders.push(relative(file))
      }
    }
    expect(
      offenders,
      `AudioContext referenced outside the sink module: ${offenders.join(', ')}`,
    ).toEqual([])
  })
})
