import { defineConfig, devices } from '@playwright/test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')
const uiDir = resolve(repoRoot, 'ui')
const PORT = 5182

export default defineConfig({
  testDir: here,
  testMatch: 'capture.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1600, height: 900 },
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --config vite.config.ts --host 127.0.0.1 --port ${PORT} --strictPort`,
    cwd: uiDir,
    env: {
      VITE_THREE_LOT: '1',
      VITE_TYCOON_WORLD: '1',
      VITE_AUDIO_MUTED: '1',
    },
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
