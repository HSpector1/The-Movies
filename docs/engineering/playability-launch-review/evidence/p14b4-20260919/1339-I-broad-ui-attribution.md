# 1339-I: attribution of the recorded broad UI gate after timing repair T1

## Run identity

`vitest run --project ui`, recorded as [1339-t1-broad-ui](1339-t1-broad-ui.json) at source and HEAD 2c645e6b (equal
to the remote at preflight), 18:28:47Z to 18:44:32Z, exit 1, empty tested diff, bounded guards exact. Raw
[1339-t1-broad-ui.txt](1339-t1-broad-ui.txt), 254,124 bytes, sha256
e11d1523ccc086bbff2c3faba5cbdc79d443b659ce7cfd06cfd0a33f1e707fcd. Tally: **5 failed files, 14 failed tests, 2678
passed, 5 skipped** (2697); no unhandled error.

## What changed under the UI project since 1336

Only T1's UI edit: `ui/src/lot/livingTurn.parity.test.tsx`'s first mount wait takes `{ timeout: 10_000 }`
([1337-t1.patch](1337-stage/1337-t1.patch), applied at ff803032). The core edit is under `tests/`, outside the UI
project.

## Result ([1339-I-failures.json](1339-I-failures.json), script [1317-I-attribution.py](1317-I-attribution.py) unchanged)

- Against 1303 (the script's reference): 10 RETAINED-SAME (C3 `PIL` 6, C4 `PIL` 4), 4 NEW.
- Against 1336 (13): **2 gone, 3 new.**
  - Gone: `livingTurn.parity` "(a) by hand at the seam", the T1 UI target, which passes in 7,121 ms. Also
    `StudioLotScreen:930` (focus, intermittent).
  - New, all timing:
    1. `WorldFirstLotNativeCastingReviewApp` "reviews all six event-owned observations …", "Test timed out in 5000ms."
       (9,178 ms). It is the file's first leaf. U1 gave it a 10 s first-mount wait (M1), but its per-leaf budget
       stays 5,000 ms (1335-F2's note). The same leaf passed at 6,914 ms in 1334 and 6,904 ms in 1336.
    2. `WorldFirstWorldInspectorDefault` "never navigates from any of the nine places, and always lands an in-world
       context", "Test timed out in 5000ms." (6,114 ms). It is the file's first leaf: 2,287 ms alone (1335-measure),
       4,373 ms in 1334, 4,523 ms in 1336.
    3. `WorldFirstWorldInspectorDefault` "lands the generic inspector — with name, role and live status …", "Found
       multiple elements by: [data-testid="lot-nav-writers"]" (`:326`), the next leaf. This is the cascade mechanism
       of 1335-A cause 2, here following leaf 2's timeout.
- NextEvent "preserves the exact live-world reaction …" (1124-A) fails again as in 1336.

## Attribution

Every non-environment row is the UI time-budget family. Across the recorded gates, leaves that mount the full `App`
run close to the 5,000 ms default under full-suite load. Which of them crosses it moves from gate to gate.
- 1331: 34 failures;
- 1334: 26 failures;
- 1336: 13 failures after U1;
- 1339: 14 failures, with two first leaves that passed in 1334 and 1336 crossing the default.

No U1 or T1 budgeted leaf fails. Both new timeouts are first leaves of files that mount `App`; the same leaves passed
above 5 s in earlier gates. So whether a leaf is cut off depends on load and on where its body yields. The parent
infers this and has not isolated it.

## Disposition

T1's two targets pass: D17 in [1338](1338-I-broad-core-attribution.md) and `livingTurn.parity` here. The UI gate
fails the ten `PIL` rows, the 1124-A intermittent, and three rows of the same time-budget family on leaves not yet
budgeted. 34 UI test files render the full `App` (`render(<App`). Per-leaf budgets have now moved the failures to new
leaves twice, so the family needs one budget for all App-mount leaves rather than more per-leaf edits. The scope of
that fix is recorded as an open decision in the T1 closure.
