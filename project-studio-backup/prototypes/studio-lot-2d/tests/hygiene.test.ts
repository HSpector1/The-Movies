// Phase-1 hygiene test: CLAUDE.md convention "Seeded RNG only. No Math.random()
// anywhere." Scan src/ and tests/ file contents and assert zero occurrences of
// the literal string "Math.random".

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')

// This test file legitimately names the forbidden string in its own source
// (the needle), so exclude it from the scan to avoid a self-referential hit.
const SELF = fileURLToPath(import.meta.url)

function collectTsFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...collectTsFiles(full))
    } else if (full.endsWith('.ts')) {
      out.push(full)
    }
  }
  return out
}

describe('hygiene — no Math.random in src/ or tests/', () => {
  it('finds zero occurrences of the literal "Math.random"', () => {
    const files = [
      ...collectTsFiles(join(repoRoot, 'src')),
      ...collectTsFiles(join(repoRoot, 'tests')),
    ].filter((f) => f !== SELF)

    const offenders: string[] = []
    for (const f of files) {
      const contents = readFileSync(f, 'utf8')
      if (contents.includes('Math.random')) offenders.push(f)
    }

    expect(offenders).toEqual([])
  })
})
