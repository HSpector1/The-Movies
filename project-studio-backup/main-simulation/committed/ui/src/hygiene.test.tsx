// ── INDEPENDENT UI hygiene suite ─────────────────────────────────────────────
// Governing rule (Phase-5 authorization / project convention):
//   • The UI must contain NO unseeded randomness. There must be zero occurrences of
//     `Math.random` anywhere under ui/src/**. All randomness lives in the seeded
//     engine, reached only through the adapter.
//
// This greps the actual file CONTENTS (not a mocked module), so it catches any
// future reintroduction of Math.random in a component, screen, or the adapter.

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const uiSrcDir = dirname(fileURLToPath(import.meta.url)) // this file lives in ui/src

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...walk(full))
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full)
    }
  }
  return out
}

// Test files legitimately NAME the forbidden token as a search needle (this suite
// does exactly that), matching the core hygiene test's self-exclusion precedent
// (tests/hygiene.test.ts excludes itself). The governing rule targets the UI's
// SHIPPING code — components, screens, and the adapter — so the scan covers every
// non-test .ts/.tsx file under ui/src.
function isTestFile(path: string): boolean {
  return /\.test\.(ts|tsx)$/.test(path)
}

// Strip line comments (`// …`) and block comments (`/* … */`) so a self-documenting
// comment like "no Math.random anywhere" is not counted as unseeded randomness —
// only EXECUTABLE code that references Math.random matters. (The adapter's own header
// asserts its absence in prose; that is documentation, not a random draw.)
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1') // line comments (avoid eating "://" in URLs)
}

describe('UI hygiene: no unseeded randomness', () => {
  it('no shipping source file under ui/src has EXECUTABLE Math.random (seeded RNG only)', () => {
    const shipping = walk(uiSrcDir).filter((f) => !isTestFile(f))
    // Sanity: we actually scanned real shipping files (guards against a false pass
    // from an empty walk — the adapter, App, screens and components must be here).
    expect(shipping.length).toBeGreaterThan(5)

    const offenders: string[] = []
    for (const f of shipping) {
      const code = stripComments(readFileSync(f, 'utf8'))
      // Any reference to Math.random in executable code is a violation (a call, an
      // alias, a passed reference). None should exist — randomness lives in the
      // seeded engine, reached only via the adapter.
      if (/\bMath\s*\.\s*random\b/.test(code)) {
        offenders.push(f.replace(uiSrcDir, 'ui/src'))
      }
    }
    expect(offenders, `Math.random found in shipping UI code: ${offenders.join(', ')}`).toEqual([])
  })

  it('no shipping file INVOKES Math.random() (the strictest check — zero draws)', () => {
    const shipping = walk(uiSrcDir).filter((f) => !isTestFile(f))
    const offenders: string[] = []
    for (const f of shipping) {
      // An invocation is unambiguous randomness regardless of comments.
      if (/\bMath\s*\.\s*random\s*\(/.test(readFileSync(f, 'utf8'))) {
        offenders.push(f.replace(uiSrcDir, 'ui/src'))
      }
    }
    expect(offenders, `Math.random() invoked in: ${offenders.join(', ')}`).toEqual([])
  })
})
