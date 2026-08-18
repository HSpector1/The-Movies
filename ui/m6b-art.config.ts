import { defineConfig, devices } from '@playwright/test'

const UI_DIR = '/Users/bruce/The Movies - Autonomous Marathon/ui'
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
