import { defineConfig, devices } from '@playwright/test'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// PF1-M3 config hygiene. This was a hard-coded absolute path to ANOTHER worktree, so an
// art shot taken from this tree silently exercised a different tree's UI. It is the
// directory this config file lives in, and now it says so.
const UI_DIR = dirname(fileURLToPath(import.meta.url))
const PORT = 5181

export default defineConfig({
  testDir: './e2e',
  testMatch: /m6b-visual-warmth\.artshot\.ts$/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1493, height: 812 },
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1493, height: 812 } } }],
  webServer: [{
    command: `npx vite --config vite.config.ts --port ${PORT} --strictPort`,
    cwd: UI_DIR,
    env: {
      VITE_STUDIO_LOT_OVERVIEW: '',
      VITE_OPERATION_HOLLYWOOD: '',
      VITE_TYCOON_WORLD: '',
    },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  }],
})
