# Test Transfer Manifest

What verification exists today, what should travel, and what to add during
integration. Commit `8c5a18b`.

## Current reality

There are **no `vitest`/unit tests** in the spike. Verification is done by
**headless browser assertion suites** driven by `puppeteer-core` against the built
app, plus `tsc --noEmit` and the production build. This is appropriate for a
Phaser/WebGL prototype (behavior is only observable in a real browser) but should
be **formalized** into a proper test setup during integration.

| Suite | File | Type | Env | Deps | Production-relevant? |
|-------|------|------|-----|------|----------------------|
| Pass-2 assertions | `tools/capture.mjs verify` | browser smoke/assertion | headless Chrome | puppeteer-core, local Chrome, `preview` server | yes → convert |
| Pass-3 assertions | `tools/capture-pass3.mjs verify` | browser smoke/assertion | headless Chrome | same | yes → convert |
| Pass-1 interaction | `tools/screenshot.mjs` | screenshot + basic assert | headless Chrome | same | superseded → drop |
| typecheck | `npm run typecheck` (`tsc --noEmit`) | static | node | typescript | yes → keep |
| build | `npm run build` | static | node | vite, typescript | yes → keep |

## Assertions that must travel (rewrite as formal tests)

Currently embedded in the two `capture*.mjs verify` blocks. Each should become a
named test. Grouped by kind:

### Snapshot contract / rendering (unit-ish, or browser)
- struggling/successful/celebration/disappointment **fixtures load** (canvas present)
- **fixture switching changes** the lot (active production count changes)
- `fromGameState` produces a valid `StudioLotSnapshot` (pure unit test — add)
- `BUILDING_ACTION` covers every `BuildingId` (pure unit test — add)

### Interaction (browser)
- building **select** sets selection; **deselect** clears it
- **navigation action** reaches the host (`onAction`)
- character **hover** works; character **select** shows a card
- character selection **clears building selection**
- **building selection supersedes** character inspection
- **far zoom** disables character inspection

### Vignette behavior (browser)
- each of the 4 vignettes can be **forced deterministically** (one active at a time)
- **re-force** keeps exactly one active vignette
- **snapshot switch cancels** the active vignette and **frees the actor pool** (`poolInUse === 0`)
- **repeated snapshots** don't strand pool actors

### Lifecycle / leaks (browser)
- **destroy/recreate leaves exactly one canvas**
- repeated snapshot updates **don't leak display objects** (pass-2)
- **no console/page errors** across the run

### Determinism (unit — add)
- **no `Math.random`** in `src/` (a source-scan test; today verified by grep)
- seeded `Rng` is reproducible for a given seed (pure unit test — add)

### Responsive (browser)
- small viewport (1024×640) renders without breaking framing

## To add during integration (do not exist yet)

- **React host lifecycle tests:** mount → update snapshot → unmount leaves no
  canvas/RAF; Strict-Mode double-mount is clean; stale-callback avoidance.
- **Accessibility checks:** `prefers-reduced-motion` attenuation; keyboard focus
  containment; the non-canvas navigation fallback exists.
- **Feature-flag/lazy-load tests:** flag off ⇒ chunk not loaded; chunk failure ⇒
  fallback renders.

## Recommended split at extraction

- **Unit (`vitest`, jsdom/node):** snapshot/adapter shape, `BUILDING_ACTION`
  coverage, `Rng` determinism, no-`Math.random` scan. Fast, no browser.
- **Integration/browser (`playwright` or the existing puppeteer harness):** the
  interaction, vignette, lifecycle, and responsive assertions above — these need a
  real WebGL canvas.
- **Screenshot evidence:** keep `capture*.mjs shots` as a **dev/evidence** script,
  not a CI gate (image diffing across GPUs is flaky under swiftshader).
- **Drop:** `screenshot.mjs` (pass-1, superseded).

## Current results (recorded at freeze)

`typecheck` PASS · `build` PASS · pass-2 `verify` PASS (8 assertions) · pass-3
`verify` PASS (18 assertions). See the dossier for the run record.
