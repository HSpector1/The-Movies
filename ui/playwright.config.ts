// ── Playwright config — ONE browser smoke over the M1A UI ────────────────────
// Starts Vite as the webServer on a FIXED port (deterministic), runs the single
// end-to-end smoke in ui/e2e, and captures deterministic screenshots. Scoped to
// `e2e/` so it never picks up the vitest component tests (*.test.tsx).

import { defineConfig, devices } from '@playwright/test'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const uiDir = dirname(fileURLToPath(import.meta.url))
const PORT = 5178 // fixed, distinct from the default dev port (5173)

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Deterministic viewport so screenshots are stable across runs.
    viewport: { width: 1280, height: 900 },
    screenshot: 'off', // we capture explicitly at named steps
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Reuse the project's vite dev server on the fixed port. `cwd` = the ui dir so
    // the config path is relative (the repo path contains a space, which would break
    // an unquoted absolute --config argument).
    command: `npx vite --config vite.config.ts --port ${PORT} --strictPort`,
    cwd: uiDir,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
