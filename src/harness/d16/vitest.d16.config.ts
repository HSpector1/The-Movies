// ── D-16 lab spec runner ─────────────────────────────────────────────────────
// ANALYSIS ONLY. The repo's `core` vitest project includes ONLY `tests/**/*.test.ts`
// (vitest.workspace.ts), and this milestone may not touch that config file. So the
// colocated D-16 specs run through THIS config, whose `root` is this directory — which
// also stops the repo-level workspace file from being auto-detected.
//
//   npx vitest run --config src/harness/d16/vitest.d16.config.ts
//
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  test: {
    name: 'd16',
    environment: 'node',
    include: ['*.test.ts'],
  },
})
