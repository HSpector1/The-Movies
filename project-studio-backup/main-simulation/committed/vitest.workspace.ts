// ── Vitest workspace: two isolated projects over one repo ────────────────────
// `npm test` (vitest run) runs BOTH projects. Each keeps its own environment so
// the pure core keeps running under `node` (unchanged, 309 tests) while the UI
// component tests run under `jsdom`. This is the mechanism the M1A UI adds without
// touching the core's test behaviour.
//
//   core → environment: 'node'  — the existing tests/**. Byte-identical behaviour.
//   ui   → environment: 'jsdom' — ui/**/*.test.ts(x), with the React plugin +
//           @testing-library/jest-dom matchers via ui/src/test/setup.ts.

import { defineWorkspace } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineWorkspace([
  {
    // The pure simulation core — unchanged node-environment tests.
    test: {
      name: 'core',
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  },
  {
    // The M1A UI — jsdom + React + testing-library.
    plugins: [react()],
    test: {
      name: 'ui',
      environment: 'jsdom',
      globals: true,
      include: ['ui/**/*.test.{ts,tsx}'],
      setupFiles: ['ui/src/test/setup.ts'],
    },
  },
])
