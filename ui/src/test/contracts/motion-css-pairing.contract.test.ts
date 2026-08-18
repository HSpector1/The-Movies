// ── PF1-M3 HYGIENE GATE — every OS motion block has a preference twin ────────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §5-M3 and §7, NOT from the
// implementation. This is PERMANENT GATE #4 of the four §7 names.
//
// Governing charter law enforced by this file:
//   • "…implemented by promoting ALL SEVEN CSS `@media (prefers-reduced-motion)`
//      blocks (styles.css ×3, lot.css ×3, LotAuditionWorkspace.css ×1) to a
//      root-class form"                                                 (§5-M3)
//   • "Hygiene gates (new, permanent) … (4) no `@media (prefers-reduced-motion)`
//      block remains without a matching root-class rule."                   (§7)
//
// WHY IT MATTERS: the OS query and the player's setting must reduce the SAME
// motion. A rule that only lives inside `@media (prefers-reduced-motion: reduce)`
// is unreachable for a player whose OS says "full" but who chose Reduced in
// Settings — the setting would be a live control that does nothing, which §5-M3
// forbids by name.
//
// THE PAIRING RULE, mechanically: for every selector inside a
// `@media (prefers-reduced-motion: reduce)` block, the SAME stylesheet must also
// carry that selector under the document-element scope
// `:root[data-motion="reduced"]` (equivalently `html[data-motion="reduced"]`).
//
// EXPECTED RED at authoring time: no `:root[data-motion="reduced"]` rule exists
// anywhere yet, so every block is reported unpaired, named by `file:line`.
//
// PRECISION LIMITS (honest, textual heuristic — NOT a CSS parser):
//   • Selector matching is exact-string after normalising whitespace, combinator
//     spacing and attribute-value quoting. A semantically equivalent but textually
//     different counterpart (`.a *` vs `.a > *`) reads as UNPAIRED. That is a
//     false alarm the implementer fixes by writing the twin the same way, not a
//     hole in the gate.
//   • It does not compare DECLARATIONS: a root-scoped rule that names the selector
//     but zeroes nothing satisfies the textual pairing. Judgement, and the muted +
//     reduced DOM-snapshot baseline (§7), cover that.
//   • A universal root-scoped rule (`:root[data-motion="reduced"] *`) is accepted
//     as covering every selector in the file — it genuinely does.
//   • Coverage is collected from the file with its reduced-motion media blocks
//     removed, so a block can never pair with itself.
//   • Rule extraction assumes reduced-motion blocks contain plain rules, not
//     nested at-rules. None do today; a nested at-rule would need this widened.
//   • The twin must carry the scope as a LITERAL selector prefix — `:root[…] .x`
//     or `html[…] .x`. A functionally identical `:where(:root[…]) .x`, or a
//     custom-property indirection that never names `.x` under the root scope, is
//     reported as unpaired. Write the twin literally, or widen this gate with a
//     ruling — do not weaken it silently.

import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// this file lives in ui/src/test/contracts → ui/src is two levels up
const uiSrcDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

const SKIP_DIRS = new Set(['node_modules', 'dist'])

function walkCss(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue
      out.push(...walkCss(full))
    } else if (entry.endsWith('.css')) {
      out.push(full)
    }
  }
  return out
}

function relative(path: string): string {
  return path.replace(uiSrcDir, 'ui/src').split(sep).join('/')
}

/** Line-preserving CSS comment strip, so reported line numbers match the file. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
}

function lineOf(source: string, index: number): number {
  return source.slice(0, index).split('\n').length
}

/**
 * One selector, normalised for comparison: whitespace collapsed, combinator
 * padding removed, attribute values double-quoted.
 */
function normalizeSelector(selector: string): string {
  return selector
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~])\s*/g, '$1')
    .replace(/\[\s*/g, '[')
    .replace(/\s*\]/g, ']')
    .replace(/\s*=\s*/g, '=')
    .replace(/=['"]?([^'"\]]*)['"]?\]/g, '="$1"]')
    .trim()
}

type MediaBlock = { line: number; selectors: string[] }

/** Every `@media …prefers-reduced-motion…` block in a stylesheet, with its body. */
function reducedMotionBlocks(css: string): { block: MediaBlock; start: number; end: number }[] {
  const found: { block: MediaBlock; start: number; end: number }[] = []
  const atMedia = /@media\b/g
  let match: RegExpExecArray | null
  while ((match = atMedia.exec(css)) !== null) {
    const open = css.indexOf('{', match.index)
    if (open === -1) break
    const prelude = css.slice(match.index, open)
    // Brace-match the block body (declarations inside contain no braces of their own).
    let depth = 1
    let cursor = open + 1
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === '{') depth += 1
      else if (css[cursor] === '}') depth -= 1
      cursor += 1
    }
    if (!/prefers-reduced-motion/.test(prelude)) continue
    const body = css.slice(open + 1, cursor - 1)
    found.push({
      block: { line: lineOf(css, match.index), selectors: ruleSelectors(body) },
      start: match.index,
      end: cursor,
    })
  }
  return found
}

/** The individual selectors of every `selectorList { … }` rule in a chunk of CSS. */
function ruleSelectors(chunk: string): string[] {
  const selectors: string[] = []
  const rule = /([^{}]+)\{[^{}]*\}/g
  let match: RegExpExecArray | null
  while ((match = rule.exec(chunk)) !== null) {
    for (const part of (match[1] ?? '').split(',')) {
      const normalized = normalizeSelector(part)
      // Skip at-rule preludes and keyframe stops that the flat scan can pick up.
      if (normalized === '' || normalized.startsWith('@') || /^\d+%$/.test(normalized)) continue
      selectors.push(normalized)
    }
  }
  return selectors
}

const ROOT_SCOPE = /^(?::root|html)\[data-motion="reduced"\]\s*/

/** Everything the stylesheet reduces under the PLAYER's setting. */
function rootScopedCoverage(cssWithoutMotionMedia: string): Set<string> {
  const covered = new Set<string>()
  for (const selector of ruleSelectors(cssWithoutMotionMedia)) {
    if (!ROOT_SCOPE.test(selector)) continue
    covered.add(selector.replace(ROOT_SCOPE, '').trim())
  }
  return covered
}

/** A selector counts as paired if the setting reduces the same thing. */
function isCovered(selector: string, covered: ReadonlySet<string>): boolean {
  if (covered.has('*')) return true // a universal root-scoped rule reduces everything
  if (covered.has(selector)) return true
  // A block that targets the document element itself pairs with the bare root rule.
  if (['', ':root', 'html', 'body'].includes(selector) && covered.has('')) return true
  return false
}

type Analysis = {
  blockCount: number
  selectorCount: number
  unpaired: { line: number; selector: string }[]
}

/** The whole gate for ONE stylesheet, as a pure function of its text. */
function analyzeStylesheet(rawCss: string): Analysis {
  const css = stripCssComments(rawCss)
  const blocks = reducedMotionBlocks(css)
  // Blank out the reduced-motion blocks so a block can never pair with itself.
  let scrubbed = css
  for (const { start, end } of [...blocks].reverse()) {
    scrubbed = scrubbed.slice(0, start) + ' '.repeat(end - start) + scrubbed.slice(end)
  }
  const covered = rootScopedCoverage(scrubbed)

  const unpaired: { line: number; selector: string }[] = []
  let selectorCount = 0
  for (const { block } of blocks) {
    for (const selector of block.selectors) {
      selectorCount += 1
      if (!isCovered(selector, covered)) unpaired.push({ line: block.line, selector })
    }
  }
  return { blockCount: blocks.length, selectorCount, unpaired }
}

describe('PF1-M3 motion-pairing gate — the analyser itself (fixtures)', () => {
  const MEDIA_ONLY = [
    '@media (prefers-reduced-motion: reduce) {',
    '  .lot-thing,',
    '  .lot-thing * {',
    '    animation: none !important;',
    '  }',
    '}',
    '',
  ].join('\n')

  it('flags a block with NO root-scoped twin (the gate can fail)', () => {
    const analysis = analyzeStylesheet(MEDIA_ONLY)
    expect(analysis.blockCount).toBe(1)
    expect(analysis.selectorCount).toBe(2)
    expect(analysis.unpaired.map((entry) => entry.selector)).toEqual(['.lot-thing', '.lot-thing *'])
    expect(analysis.unpaired[0]?.line, 'the reported line is the @media line').toBe(1)
  })

  it('passes when every selector has a :root[data-motion="reduced"] twin', () => {
    const paired =
      MEDIA_ONLY +
      ':root[data-motion="reduced"] .lot-thing,\n' +
      ':root[data-motion="reduced"] .lot-thing * {\n  animation: none !important;\n}\n'
    expect(analyzeStylesheet(paired).unpaired).toEqual([])
  })

  it('flags a PARTIAL twin (one selector promoted, one forgotten)', () => {
    const partial =
      MEDIA_ONLY + ':root[data-motion="reduced"] .lot-thing {\n  animation: none !important;\n}\n'
    expect(analyzeStylesheet(partial).unpaired.map((entry) => entry.selector)).toEqual([
      '.lot-thing *',
    ])
  })

  it("accepts single quotes, extra whitespace and the html[…] spelling", () => {
    for (const scope of [
      ":root[data-motion='reduced']",
      ':root[ data-motion = "reduced" ]',
      'html[data-motion="reduced"]',
    ]) {
      const paired =
        MEDIA_ONLY + `${scope} .lot-thing, ${scope} .lot-thing * {\n  animation: none;\n}\n`
      expect(analyzeStylesheet(paired).unpaired, `scope spelling: ${scope}`).toEqual([])
    }
  })

  it('accepts a universal root-scoped rule as covering everything in the file', () => {
    const universal = MEDIA_ONLY + ':root[data-motion="reduced"] * {\n  animation: none;\n}\n'
    expect(analyzeStylesheet(universal).unpaired).toEqual([])
  })

  it('does NOT accept a twin for a DIFFERENT selector', () => {
    const wrong =
      MEDIA_ONLY + ':root[data-motion="reduced"] .other-thing {\n  animation: none;\n}\n'
    expect(analyzeStylesheet(wrong).unpaired.length).toBe(2)
  })

  it('does NOT accept a twin that is itself trapped inside the reduced-motion media block', () => {
    const selfPairing = [
      '@media (prefers-reduced-motion: reduce) {',
      '  .lot-thing { animation: none; }',
      '  :root[data-motion="reduced"] .lot-thing { animation: none; }',
      '}',
      '',
    ].join('\n')
    expect(analyzeStylesheet(selfPairing).unpaired.map((entry) => entry.selector)).toContain(
      '.lot-thing',
    )
  })

  it('does NOT accept a rule scoped to some other data-motion value', () => {
    const wrongValue =
      MEDIA_ONLY + ':root[data-motion="full"] .lot-thing {\n  animation: none;\n}\n'
    expect(analyzeStylesheet(wrongValue).unpaired.length).toBe(2)
  })

  it('does not count a commented-out media block, and keeps line numbers honest', () => {
    const commented = '/* @media (prefers-reduced-motion: reduce) {\n  .x { animation: none; }\n} */\n' + MEDIA_ONLY
    const analysis = analyzeStylesheet(commented)
    expect(analysis.blockCount).toBe(1)
    expect(analysis.unpaired[0]?.line).toBe(4)
  })

  it('ignores unrelated @media blocks entirely', () => {
    const unrelated = '@media (max-width: 900px) {\n  .lot-thing { display: none; }\n}\n'
    expect(analyzeStylesheet(unrelated).blockCount).toBe(0)
    expect(analyzeStylesheet(unrelated).unpaired).toEqual([])
  })

  it('ignores @keyframes stops when collecting coverage (no crash, no false pass)', () => {
    const withKeyframes =
      MEDIA_ONLY +
      '@keyframes pulse {\n  0% { opacity: 0; }\n  100% { opacity: 1; }\n}\n' +
      ':root[data-motion="reduced"] .lot-thing, :root[data-motion="reduced"] .lot-thing * { animation: none; }\n'
    expect(analyzeStylesheet(withKeyframes).unpaired).toEqual([])
  })
})

describe('PF1-M3 motion-pairing gate — the shipped stylesheets', () => {
  const files = walkCss(uiSrcDir).sort()
  const analyses = files.map((file) => ({
    path: relative(file),
    analysis: analyzeStylesheet(readFileSync(file, 'utf8')),
  }))

  it('finds the stylesheets the charter names (guards against an empty walk)', () => {
    const paths = analyses.map((entry) => entry.path)
    expect(paths).toContain('ui/src/styles.css')
    expect(paths).toContain('ui/src/lot/lot.css')
    expect(paths).toContain('ui/src/lot/LotAuditionWorkspace.css')
  })

  it('finds at least the seven reduced-motion blocks §5-M3 names', () => {
    // AMBIGUITY (flagged, not resolved): §5-M3 names SEVEN blocks (styles.css ×3,
    // lot.css ×3, LotAuditionWorkspace.css ×1), but PF1-M2 added an eighth to
    // lot.css for the punctuation motion. The count is therefore asserted as a
    // FLOOR, and the pairing gate below is what actually binds — it applies to
    // every block that exists, named or not.
    const total = analyses.reduce((sum, entry) => sum + entry.analysis.blockCount, 0)
    expect(total).toBeGreaterThanOrEqual(7)
  })

  it('every block carries selectors (the extractor is not silently empty)', () => {
    for (const { path, analysis } of analyses) {
      if (analysis.blockCount === 0) continue
      expect(analysis.selectorCount, `${path} has blocks but no selectors`).toBeGreaterThanOrEqual(
        analysis.blockCount,
      )
    }
  })

  it('NO @media (prefers-reduced-motion) selector is missing its :root[data-motion="reduced"] twin', () => {
    const orphans: string[] = []
    for (const { path, analysis } of analyses) {
      for (const { line, selector } of analysis.unpaired) {
        orphans.push(`${path}:${line} — "${selector}" has no :root[data-motion="reduced"] rule`)
      }
    }
    expect(
      orphans,
      `the motion SETTING cannot reach ${orphans.length} rule(s) the OS query reduces:\n  ${orphans.join('\n  ')}`,
    ).toEqual([])
  })
})
