# Feature-Flag & Lazy-Loading Plan

How the future integration should introduce the studio lot. Binding PM
requirements: **disabled by default, feature-flagged, lazy-loaded.** Recommendation
only — no code this pass.

## Why

- The lot pulls in Phaser (~360 kB gzip; see PHASER-BUNDLE-ASSESSMENT). It must not
  land in the initial bundle.
- Its role is a **complementary overview**, never the sole path to any feature. The
  existing management UI stays primary.

## Flag

| Aspect | Recommendation |
|--------|----------------|
| Flag name | e.g. `studioLotOverview` (host's flag convention) |
| Ownership | Host application's existing flag/config system |
| Default | **off** in all environments until the PM authorizes rollout |
| Dev override | on via local config/env for development |
| Test override | on in integration tests that exercise the panel; off elsewhere |
| Release gating | staged: internal → opt-in → default-on, only after integration acceptance |
| Removal criteria | remove the flag once the lot has shipped default-on and stabilized (no fallback needed) |

## Lazy loading

- Wrap the lot behind a **dynamic import boundary** so Phaser + the lot module load
  only when the flag is on **and** the player opens the lot view:

```tsx
const StudioLotPanel = React.lazy(() => import('@studio/lot/react')) // wrapper module

function StudioLotRoute() {
  if (!flags.studioLotOverview) return <RedirectToManagementUI />
  return (
    <ErrorBoundary fallback={<LotUnavailable />}>
      <Suspense fallback={<LotLoading />}>
        <StudioLotPanel snapshot={selectLotSnapshot(state)} onAction={openScreen} />
      </Suspense>
    </ErrorBoundary>
  )
}
```

- **Dynamic-import boundary:** the `import()` chunk should contain the lot module +
  Phaser, nothing else, so it's a single deferred download.
- **Loading state:** show a lightweight placeholder (`LotLoading`) while the chunk
  and first paint resolve (`onReady` clears it).
- **Failure fallback:** if the chunk fails to load or the panel errors, render a
  non-canvas fallback (`LotUnavailable`) that still routes to the management UI.
- **Non-canvas navigation fallback:** every action the lot exposes
  (`open-studio-overview`, `assemble-film`, `browse-talent`, `review-productions`,
  `view-released-films`, `view-expansion`) **must** also be reachable from the
  primary UI. The lot is an alternate entry, never the only one.

## Diagnostics

If the host has analytics, record: flag exposure, chunk load success/failure +
timing, first-paint (`onReady`) timing, and lot→screen navigations
(`onAction`). Keep it optional; the lot emits no telemetry itself.

## Rollout sequence

1. Land the module behind the flag (off), lazy-loaded, with the React wrapper.
2. Enable in dev + integration tests; verify lifecycle + no regressions.
3. Internal dogfood (flag on for staff).
4. Opt-in for players.
5. Default-on after acceptance; later remove the flag.

## Hard rule

The lot must **never** become the only navigation path to essential features, and
must **never** block the app if its chunk fails to load.
