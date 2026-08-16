// ── Playwright config — ONE browser smoke over the M1A UI ────────────────────
// Starts Vite as the webServer on a FIXED port (deterministic), runs the single
// end-to-end smoke in ui/e2e, and captures deterministic screenshots. Scoped to
// `e2e/` so it never picks up the vitest component tests (*.test.tsx).

import { defineConfig, devices } from '@playwright/test'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const uiDir = dirname(fileURLToPath(import.meta.url))
const PORT = 5178 // fixed, distinct from the default dev port (5173)
/**
 * TYCOON WORLD CONVERSION M2 — the grid-world browser layer's own origin.
 *
 * `VITE_TYCOON_WORLD` is resolved by `resolveAdoptedPlayerGate`, where ANY explicit
 * rollback wins — including over a localStorage `1`. The quarantine below therefore
 * cannot be lifted per-spec, and one Vite dev server can only ever serve one value of
 * a build-time env var. So the grid world gets a SECOND server on its own fixed port,
 * serving the SHIPPED DEFAULT (no rollback anywhere), while 5178 keeps every existing
 * plate-pinned assertion measuring exactly what it was written to measure. Same config,
 * same command, same `workers: 1` — two origins, because the product has two worlds.
 */
const GRID_PORT = 5179

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts$/,
  // Frozen current-break audits prove a superseded pre-implementation failure at their
  // contract checkpoint. Keep the source as durable evidence without making the accepted
  // post-repair browser suite assert that the old world-unmount defect still exists.
  testIgnore: /.*current-break-audit\.spec\.ts$/,
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
  webServer: [{
    // Reuse the project's vite dev server on the fixed port. `cwd` = the ui dir so
    // the config path is relative (the repo path contains a space, which would break
    // an unquoted absolute --config argument).
    command: `npx vite --config vite.config.ts --port ${PORT} --strictPort`,
    cwd: uiDir,
    // Keep adopted/default-on Studio Home tests independent of rollback variables inherited
    // from a developer shell without positively enabling either gate. Empty values exercise the
    // shipped default; explicit localStorage rollbacks in individual specs still win.
    //
    // TYCOON WORLD CONVERSION M1 — QUARANTINE, NOT A ROLLBACK OF THE PRODUCT.
    //
    // `VITE_TYCOON_WORLD: '0'` pins this browser suite to the RETAINED Operation Hollywood
    // plate. It is deliberate and it is temporary. These specs are inherently plate-specific
    // in two ways that no re-baseline can fix in place:
    //
    //   • world geometry — helpers such as `clickHollywoodWorldPoint` reimplement the plate's
    //     1586×992 canvas and its fit-locked camera to convert a PAINTED-DISTRICT PIXEL into a
    //     screen point. Those pixels do not exist in a 28×26 tile property;
    //   • structural fingerprints — the 30/13/11,096,896/1 and 42/19 and 54/25 tuples are
    //     byte-neutrality fingerprints of the plate renderer at a NAMED fixture. The grid world
    //     measures 149/8/8,180,280/4 at the managed-idle fixture, which is a different world,
    //     not a regression (and 2.9 MB cheaper).
    //
    // The shipped default is the grid world. Its own coverage in M1 is
    // `ui/src/lot/tycoon/world.test.ts` (the spatial record) and the tycoon boundary cases in
    // `ui/src/lot/StudioLotView.hollywood.test.ts`. **M2 owes this suite a grid-world browser
    // layer**: a grid→screen click helper and freshly measured per-fixture tuples. Until then
    // this line keeps every existing browser assertion measuring exactly what it was written to
    // measure, on a path the product still ships.
    env: {
      VITE_STUDIO_LOT_OVERVIEW: '',
      VITE_OPERATION_HOLLYWOOD: '',
      VITE_TYCOON_WORLD: '0',
    },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  }, {
    // The M2 grid-world layer: the SHIPPED DEFAULT world, no rollback of any gate.
    // `ui/e2e/tycoon-build-mode-v1.spec.ts` is the only spec that uses this origin,
    // and it addresses it absolutely (`GRID_BASE_URL`) rather than through `baseURL`.
    command: `npx vite --config vite.config.ts --port ${GRID_PORT} --strictPort`,
    cwd: uiDir,
    env: {
      VITE_STUDIO_LOT_OVERVIEW: '',
      VITE_OPERATION_HOLLYWOOD: '',
      VITE_TYCOON_WORLD: '',
    },
    url: `http://localhost:${GRID_PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  }],
})
