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
    //   • structural fingerprints — every plate tuple below is a byte-neutrality fingerprint of
    //     the PLATE renderer at a NAMED fixture, and belongs to that fixture alone (law 25).
    //
    // PLATE TUPLES, RE-MEASURED AT HEAD (browser-suite stabilization, 2026-08-17). M1.5
    // `eebbefd` moved roster presence into `studioLotSnapshot`, which BOTH worlds consume, so
    // every contracted employee the projected company does not already claim now stands on the
    // plate too — one dynamic actor and two display objects each. Decoded bytes (11,096,896)
    // and the single draw call are unchanged in every case, which is what proves the delta is
    // people and not a renderer leak. displayObjects / dynamicActors, by fixture:
    //
    //     commission-workspace managed idle (6 contracts, 0 pictures)   30/13 → 42/19
    //     operational-annex script Working  (8 contracts, 0 pictures)   30/13 → 46/21
    //     governed Week-30 blocked          (15 contracts, 1 picture)   42/19 → 62/29
    //       …with a Gate visitor selected                               43/20 → 63/30
    //     greenlight two-picture formation  (15 contracts, 2 pictures)  54/25 → 64/30
    //
    // The shipped default is the grid world, and M2 has now PAID this suite's grid-world debt:
    // `ui/e2e/tycoon-build-mode-v1.spec.ts` runs on the 5179 origin below with its own
    // grid→screen click helper and its own freshly measured fixture tuple. That is a DIFFERENT
    // WORLD from the plate numbers above, not a regression (and 2.5 MB cheaper). Unit coverage
    // stays `ui/src/lot/tycoon/world.test.ts` plus the tycoon boundary cases in
    // `ui/src/lot/StudioLotView.hollywood.test.ts`. The quarantine on 5178 remains only so the
    // plate-pinned specs keep measuring exactly what they were written to measure, on a path
    // the product still ships.
    //
    // GRID TUPLES, by fixture — displayObjects / dynamicActors / decoded bytes / draw calls:
    //
    //     build-mode "grid managed-idle", Week 0            231 / 14 / 8,806,568 / 6
    //     presence   "grid presence",     Week 0            231 / 14 / 8,807,528 / 6
    //     presence   "grid presence greenlit", Week 0 and 1 231 / 14 / 8,807,528 / 6
    //
    // C1-M6 RE-PIN (the visual warmth pass), re-measured at HEAD from a real run of the two
    // owning specs. Every grid row moved together and for the same three reasons, which are
    // written out in full beside the constants each spec owns:
    //
    //   • objects 174 → 231: +57, the backlot dressing inventory, one Image per authored
    //     prop placement. Authored, so it does not move as a journey advances;
    //   • decoded bytes +260,848 in BOTH studios: eleven new prop bakes, one new scorched-
    //     lawn ground tile, and the differentiated building bakes. Identical delta on two
    //     different rosters is what proves it is world art and not people;
    //   • draws 4 → 6: the counter sums the multi-texture pipeline's batch entries, and a
    //     new entry opens when its texture-unit set is exhausted — twelve more textures,
    //     two more rebinds. No new pass, no new pipeline.
    //
    // Dynamic actors are 14 in every grid row, before and after, including across the
    // greenlit Week-0 → Week-1 playback: the pass touched no person. The plate rows above
    // are a different world and did not move at all — the warmth pass is grid-world art.
    //
    // DOC-DRIFT REPAIR, second occurrence. This table printed 173 in all three rows while
    // the specs that own the fixtures had asserted 174 since the M-D guidance marker; the
    // note below explains the FIRST drift (172 → 173) and was itself left stale by the
    // second. The values above are now the values the specs assert, taken from the same run.
    //
    // M3-UI moved the first of these by exactly ONE display object: the single shared
    // waiting-queue Graphics layer (`tier:presence-queue`). Presence itself adds no object
    // and no actor — it MOVES existing bodies — which is what the greenlit fixture's two
    // identical Week-0/Week-1 tuples prove across a whole week playback. The presence
    // fixtures are a different studio from the build-mode one (their own seed and their own
    // roster), so their decoded-byte figure is theirs alone and is not a re-baseline of it.
    //
    // DOC-DRIFT REPAIR (camera-grammar shift). That first row printed the PRE-M3-UI 172
    // until now, while the spec that owns the fixture — `tycoon-build-mode-v1.spec.ts` —
    // has asserted 173 since M3-UI added the shared queue layer. 173 is the live number,
    // re-measured at HEAD from a full suite run; every other row here is likewise the
    // value its own spec asserts and re-measures. The whole-property camera control added
    // in the same shift is DOM chrome over the canvas, so it moves no figure in this
    // table — objects, actors, decoded bytes and draw calls are all unchanged by it.
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
    // Specs that exercise the shipped grid world use this origin (eight of them as of
    // C1-M6 — `tycoon-build-mode-v1.spec.ts` was merely the first), addressing it
    // absolutely (`GRID_BASE_URL`) rather than through `baseURL`.
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
