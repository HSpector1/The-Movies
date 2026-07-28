// ── Vite config for the M1A thin UI ──────────────────────────────────────────
// The UI is a Vite + React 19 + TypeScript app rooted at `ui/`. It imports the
// pure engine ONLY through the public surface `src/core/index.ts`, reached by a
// RELATIVE path from ui/src (Vite compiles the core TS directly — no build step,
// no path alias, one boundary). The single crossing is ui/src/engine/adapter.ts.
//
// `root: __dirname` keeps index.html + the UI sources under ui/, while
// `server.fs.allow` widens the dev-server file whitelist up to the repo root so
// Vite may read ../src/core/*.ts.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const uiDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(uiDir, '..')

export default defineConfig({
  root: uiDir,
  plugins: [react()],
  server: {
    fs: {
      // Allow importing ../src/core/*.ts from ui/src.
      allow: [repoRoot],
    },
  },
  build: {
    outDir: resolve(uiDir, 'dist'),
    emptyOutDir: true,
  },
})
