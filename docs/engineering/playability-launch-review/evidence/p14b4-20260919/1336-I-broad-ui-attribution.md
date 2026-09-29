# 1336-I: attribution of the recorded broad UI gate after UI repair U1

## Run identity

`vitest run --project ui`, recorded as [1336-u1-broad-ui](1336-u1-broad-ui.json) at source and HEAD 88eb90d9 (equal
to the remote at preflight), 16:07:57Z to 16:23:32Z, exit 1, empty tested diff, bounded guards exact
(`allGuardsExact: true`, `fixedSource: true`). Raw [1336-u1-broad-ui.txt](1336-u1-broad-ui.txt), 274,092 bytes,
sha256 c594f91e082f8672b5f87b24322be9685123f5c9c5cd4aa270c5abe3cf009e9b. Tally: **5 failed files, 13 failed tests,
2679 passed, 5 skipped** (2697); no unhandled error.

## What changed under the UI project since 1334

Only U1: the six UI test files of [1335-ui-u1-r2.patch](1335-stage/1335-ui-u1-r2.patch), applied at 88eb90d9 and
equal byte for byte to the [1335-X](1335-X-ui-u1-dry-run.md) dry-run tree. No production, config or setup file
changed.

## Result ([1336-I-failures.json](1336-I-failures.json), script [1317-I-attribution.py](1317-I-attribution.py) unchanged)

- Against 1303 (the script's reference): 11 RETAINED-SAME (C3 `PIL` 6, C4 `PIL` 4, C7 `livingTurn.parity` 1) and 2 NEW.
- Against 1334 (26): **16 gone** (every U1 target that failed there), **3 new** (the three rows below). Against 1331
  (34): 23 gone, 2 new.
- **No U1 target fails.** The seven budgeted leaves pass, each longer than the 5000 ms default it replaced:
  - NextEvent "orients a cash stop …": 24,785 ms;
  - NextEvent "clears every next-event transient …": 9,925 ms;
  - Authority "never lets stale …": 10,741 ms;
  - World Inspector "reaches the canonical deep screen …": 5,619 ms;
  - World Inspector sweep: 13,535 ms;
  - Casting Review "greenlights …": 8,070 ms;
  - `livingTurn.scheduler` "auto-pauses …": 5,853 ms.

  C5, the C2 cascade, the scheduler's cascade leaves, the Casting Review first leaf and C6 all pass.

## The three non-environment rows

All three are identities recorded before U1, in files or helpers U1 did not edit.

1. `livingTurn.parity.test.tsx` "(a) by hand at the seam — the manual verb, pressed twelve times": "Unable to find an
   element by: [data-testid="studio-lot-screen"]" at `:110`, the file's own `mountLot` first wait with `findBy`'s
   1000 ms default. The primary equals 1303's C7 row. This is the M1 cold-mount race of 1335-A cause 3 in a file U1
   did not include. The file imports no `StudioLotScreen`, and `App.tsx:239` loads it lazily.
2. `WorldFirstLotNativeNextEventApp.test.tsx` "preserves the exact live-world reaction after a rejected import or
   declined restart": "Unable to find an element by: [data-testid="dashboard-releases-heading"]" at `:1933`, the second
   `openSavesFromExactReaction` wait, 1124-A's unresolved intermittent failure. 1335-C reproduced it in 2 of 3 solo runs
   before any U1 edit touched the file's mount helper, and U1 does not touch that helper.
3. `StudioLotScreen.test.tsx:930` "moves Hollywood keyboard focus to each successor and announces the final take":
   `expect(element).toHaveFocus()`. This is the intermittent focus row of 1322 and 1331, which passes alone (61 of 61,
   1335-measure) and was not part of U1.

## Disposition

U1 removes every identity it targeted: 16 against 1334 and 23 against 1331. The UI gate now fails the ten `PIL`
rows (environment) and three recorded intermittent rows outside U1's edits. Two of those three are 1000 ms `findBy`
waits (M1-like), and one is a focus assertion. The NextEvent "orients a cash stop …" leaf used 24.8 of its 30 s
budget under load; that margin is noted for the next time budgets are reviewed.
