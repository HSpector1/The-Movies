// ── PF1-M3 HYGIENE GATE — the browser never speaks for the studio ────────────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M3 and §7, NOT from the
// implementation. This is PERMANENT GATE #1 of the four §7 names.
//
// Governing charter law enforced by this file:
//   • "The browser never speaks again: all 9 native-dialog sites replaced … A
//      hygiene gate then asserts zero `alert(` / `confirm(` / `prompt(` — bare or
//      `window.`-qualified — in shipping `ui/src` FOREVER (the hygiene.test.tsx
//      comment-stripping walk, with a positive fixture proving the scanner
//      catches a bare `alert(`)."                                       (§5-M3)
//   • "Hygiene gates (new, permanent), all on the hygiene.test.tsx
//      comment-stripping walk: (1) zero `alert(` / `confirm(` / `prompt(` — bare
//      or `window.`-qualified — in shipping `ui/src`, with a positive fixture
//      proving the scanner catches the bare form."                          (§7)
//
// EXPECTED RED at authoring time: the 8 bare `alert(` calls and the one
// `window.confirm(` in `ui/src/App.tsx` are still standing. The gate names every
// survivor as `path:line` so the failure reads as a work list, not a mystery.
//
// This reimplements the walk/comment-stripping machinery of ui/src/hygiene.test.tsx
// rather than importing it (that file exports nothing) — the established idiom,
// including its self-guard against a false pass from an empty walk.
//
// PRECISION LIMITS (textual scan, honestly stated):
//   • A local helper genuinely NAMED `confirm(` / `alert(` / `prompt(` is flagged.
//     That is deliberate: shadowing a browser-dialog name in the shell is exactly
//     the confusion this gate exists to prevent.
//   • A qualified call through some OTHER object (`logger.alert(...)`) is NOT
//     flagged — only bare and `window.` / `globalThis.` / `self.`-qualified forms.
//   • String literals are not stripped, so a piece of copy that literally contains
//     "alert(" would be flagged. No such copy exists; if it ever does, the fix is
//     the copy, not the gate.
//   • Line numbers are preserved through comment-stripping, so `path:line` always
//     points at the real source line.

import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// this file lives in ui/src/test/contracts → ui/src is two levels up
const uiSrcDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

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

/**
 * Only EXECUTABLE code counts: a comment that documents the ban is not a
 * violation. LINE-PRESERVING — a block comment becomes the same number of blank
 * lines — so reported line numbers match the file on disk.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' ')) // block comments
    .replace(/(^|[^:])\/\/[^\n]*/g, (_match, before: string) => before) // line comments (keep "://")
}

const DIALOGS = ['alert', 'confirm', 'prompt'] as const

const FORBIDDEN: readonly { name: string; pattern: RegExp }[] = DIALOGS.flatMap((dialog) => [
  // Bare call: not a property access, not the tail of a longer identifier
  // (`showAlert(`, `onConfirm(`, `promptUser(` are all fine).
  { name: `${dialog}(`, pattern: new RegExp(String.raw`(?<![\w$.])${dialog}\s*\(`) },
  // Qualified through the global object, however it is spelled.
  {
    name: `window.${dialog}(`,
    pattern: new RegExp(String.raw`\b(?:window|globalThis|self)\s*\.\s*${dialog}\s*\(`),
  },
  // The indexed spelling of the same thing.
  {
    name: `window['${dialog}'](`,
    pattern: new RegExp(String.raw`\b(?:window|globalThis|self)\s*\[\s*['"\`]${dialog}['"\`]\s*\]`),
  },
])

/** The scanner under test: which banned constructions does this SOURCE TEXT contain? */
function violationsIn(source: string): string[] {
  const code = stripComments(source)
  return FORBIDDEN.filter(({ pattern }) => pattern.test(code)).map(({ name }) => name)
}

/** The same scan, reported per line, so a failure reads as a work list. */
function violationLinesIn(source: string): { line: number; name: string; text: string }[] {
  const out: { line: number; name: string; text: string }[] = []
  const lines = stripComments(source).split('\n')
  lines.forEach((text, index) => {
    for (const { name, pattern } of FORBIDDEN) {
      if (pattern.test(text)) out.push({ line: index + 1, name, text: text.trim() })
    }
  })
  return out
}

function shippingFiles(): string[] {
  return walk(uiSrcDir).filter((file) => !isTestFile(file))
}

function relative(path: string): string {
  return path.replace(uiSrcDir, 'ui/src')
}

/** Every surviving native-dialog site in shipping ui/src, as `path:line — form`. */
function survivingSites(): string[] {
  const sites: string[] = []
  for (const file of shippingFiles()) {
    for (const hit of violationLinesIn(readFileSync(file, 'utf8'))) {
      sites.push(`${relative(file)}:${hit.line} — ${hit.name}`)
    }
  }
  return sites
}

describe('PF1-M3 hygiene gate — the scanner itself (positive fixtures)', () => {
  for (const dialog of DIALOGS) {
    it(`flags a synthetic source containing a BARE ${dialog}( — the gate can fail`, () => {
      const fixture = `export function boom() {\n  ${dialog}('the browser is speaking')\n}\n`
      expect(violationsIn(fixture)).toContain(`${dialog}(`)
      expect(violationLinesIn(fixture)[0]?.line, 'the reported line is the real one').toBe(2)
    })

    it(`flags the window.-qualified ${dialog}( too`, () => {
      expect(violationsIn(`if (window.${dialog}('x')) return`)).toContain(`window.${dialog}(`)
      expect(violationsIn(`if (globalThis.${dialog}('x')) return`)).toContain(`window.${dialog}(`)
      expect(violationsIn(`if (self . ${dialog} ('x')) return`)).toContain(`window.${dialog}(`)
      expect(violationsIn(`window['${dialog}']('x')`)).toContain(`window['${dialog}'](`)
    })
  }

  it('flags all three bare forms in one file at once', () => {
    const fixture = "alert('a')\nif (confirm('b')) {}\nconst n = prompt('c')\n"
    expect(violationsIn(fixture).sort()).toEqual(['alert(', 'confirm(', 'prompt('])
    expect(violationLinesIn(fixture).map((hit) => hit.line)).toEqual([1, 2, 3])
  })

  it('does NOT flag a comment that merely names the ban (comment-stripping works)', () => {
    const documented =
      "// the studio never calls alert('…') — the notice idiom speaks instead\n" +
      '/* window.confirm( and prompt( are banned in shipping ui/src */\n' +
      'export const NOTE = 1\n'
    expect(violationsIn(documented)).toEqual([])
  })

  it('does NOT flag identifiers that merely CONTAIN a dialog name', () => {
    const innocent = [
      'showAlert(message)',
      'setAlert(null)',
      'onConfirm(handler)',
      'confirmDestructiveAction(payload)',
      'promptUser(question)',
      'const promptText = build()',
      'logger.alert(message)',
      'notifier.confirm(question)',
      '<div role="alert">{notice}</div>',
      'aria-live="assertive"',
      'const { confirmLabel } = props',
    ]
    for (const source of innocent) {
      expect(violationsIn(source), `"${source}" is not a browser dialog`).toEqual([])
    }
  })

  it('does not mistake a URL for a line comment', () => {
    expect(violationsIn("const doc = 'https://example.test/alerts'\nconst x = 1")).toEqual([])
  })

  it('preserves line numbers across a multi-line block comment', () => {
    const fixture = '/* one\n   two\n   three */\nalert("late")\n'
    expect(violationLinesIn(fixture)).toEqual([
      { line: 4, name: 'alert(', text: 'alert("late")' },
    ])
  })
})

describe('PF1-M3 hygiene gate — shipping ui/src', () => {
  it('scans a non-trivial number of shipping files (guards against an empty walk)', () => {
    expect(shippingFiles().length).toBeGreaterThan(40)
  })

  it('excludes its own contract suite from the scan (this file names the ban)', () => {
    const shipping = shippingFiles().map(relative)
    expect(shipping.some((file) => file.includes('/test/contracts/'))).toBe(false)
    expect(shipping.some((file) => file.endsWith('.test.ts') || file.endsWith('.test.tsx'))).toBe(
      false,
    )
  })

  it('really does reach App.tsx (the file the 9 dialog sites live in)', () => {
    expect(shippingFiles().map(relative)).toContain('ui/src/App.tsx')
  })

  it('the browser never speaks: ZERO alert( / confirm( / prompt( in shipping ui/src', () => {
    const sites = survivingSites()
    expect(
      sites,
      `the browser still speaks for the studio at ${sites.length} site(s):\n  ${sites.join('\n  ')}`,
    ).toEqual([])
  })

  it('no shipping module reaches for a native dialog by ANY spelling', () => {
    const offenders: string[] = []
    for (const file of shippingFiles()) {
      const found = violationsIn(readFileSync(file, 'utf8'))
      if (found.length > 0) offenders.push(`${relative(file)} → ${found.join(', ')}`)
    }
    expect(
      offenders,
      `native dialogs survive in: ${offenders.join(' | ')}`,
    ).toEqual([])
  })
})
