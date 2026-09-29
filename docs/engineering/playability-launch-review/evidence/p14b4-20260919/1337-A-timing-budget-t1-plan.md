# 1337-A: timing-budget repair T1 (core D17 and `livingTurn.parity`)

Two leaves failed in the latest recorded gates on unchanged source, each at a test time budget below its measured
duration. Both are test-side.

## Measured causes

1. **Core `bridge-p14p3-directing-promises` D17** ("migrates outgoing53 independently and isolates current55
   campaigns"), new in [1333](1333-I-broad-core-attribution.md): "Test timed out in 60000ms." The file's
   `const TIMEOUT = 60_000` (`:30`) bounds D15, D16 and D17 (`:501`, `:586`, `:671`). In the 1333 gate the three
   leaves took 139,426 ms, 116,959 ms and 118,597 ms. D15 and D16 passed past their budget; D17 was cut off. D17
   passes alone in 100,081 ms and 97,285 ms ([1333-I solo runs](1333-I-d17-solo-run1.txt)). It passed in 1321, 1325
   and 1330 on the same imported bytes.

   All three leaves outrun the declared budget, so the constant does not describe their cost. The parent infers why
   only D17 was cut off: Vitest's timer can fire only when the body yields, and D17 awaits a runtime coordinator.
   Whatever the mechanism, the budget is below every measured duration.
2. **UI `livingTurn.parity`** "(a) by hand at the seam — the manual verb, pressed twelve times", in
   [1336](1336-I-broad-ui-attribution.md) and in 1303 (C7): "Unable to find an element by:
   [data-testid="studio-lot-screen"]" at `:110`, the mount helper's first wait with `findBy`'s 1000 ms default. It passes
   alone 3 of 3 on unchanged source ([1336-F](1336-F-parent-response-to-1336-J.md)). The helper has the M1 code shape of
   [1335-A](1335-A-ui-retained-repair-u1-plan.md): an unguarded first wait, no import of the lazily loaded
   `StudioLotScreen` (`ui/src/App.tsx:239`), and only `StudioLotView` mocked (`:83`). The failure depends on load; the
   exact step that outruns the wait is inferred, not isolated.

## Rules

1. Test files only: `tests/bridge-p14p3-directing-promises.test.ts` and `ui/src/lot/livingTurn.parity.test.tsx`. No
   production, fixture, config or setup change.
2. D17: `TIMEOUT` becomes `300_000`, about 2× the slowest measured leaf (139,426 ms), with a comment citing the 1333
   durations. The constant stays shared by D15-D17. No assertion changes.
3. `livingTurn.parity`: the mount helper's first `studio-lot-screen` wait takes `{ timeout: 10_000 }`, the U1 M1 form.
   It stays before `vi.useFakeTimers()`. The comment says the mechanism is inferred. No assertion changes.
4. Nothing else. The NextEvent "orients a cash stop …" leaf passed at 24.8 s of its 30 s budget in 1336 and stays
   as is. The 1124-A and `StudioLotScreen:930` intermittents need their own investigation and are not in T1.
5. The author runs each touched file whole in a scratch tree (the D17 file once; the parity file twice) and the root
   and UI type gates, and reports durations.

## Order

Independent review (1337-B), test-author staging (1337-C, 1327-C method), parent dry run (touched files and type
gates), review, application. The recorded gates follow. If the Owner's D-1329-1 answer opens a natural-chain repair
first, T1 rides along with that repair's recorded core and UI gates rather than taking separate ones. Otherwise T1 gets
its own gates.
