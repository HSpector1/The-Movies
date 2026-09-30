# 1344-M: the Save43 fallout measurement, broad core (recorded)

Status: **measurement only**. Save43 shelving is landed (1344-L) and stays IN PROGRESS until the sweep, verification
and recorded gates close it.

## Run

- Recorded run `1344-save43-broad-core` at HEAD and remote c614b7e9. Command: the 429-file core allowlist, which is
  the 1338 list of 422 plus the seven new p14d1, p15a1 and p15a2 files, with `PATH="$PWD/.venv/bin:$PATH"`.
- Recorder exit code 1 (failing tests). `fixedSource: true`, `allGuardsExact: true`, source sha equal at start and
  end ([json](1344-save43-broad-core.json), [preflight](1344-save43-broad-core-preflight.json),
  [postflight](1344-save43-broad-core-postflight.json)).
- Raw: [1344-save43-broad-core.txt](1344-save43-broad-core.txt), 28,263,976 bytes, sha256
  7815882649b9ace0fd2e3c3124dbdc9307c6c737fe178ec311b3fda706f68a49.
- Tally: **146 failed files, 848 failed tests**, 3,931 passed, 39 skipped, 11 todo (4,829), and 1 unhandled error.
  Duration 7,611.77 s, against 5,128.59 s for 1338 (see Environment).

## Attribution

- The archived [1321-I-attribution.py](1321-I-attribution.py), unchanged, classifies against 1316:
  [1344-I-failures.json](1344-I-failures.json). Result: 849 failed cases (848 tests and 1 suite); 739 NEW,
  69 RETAINED-SAME, 41 RETAINED-CHANGED; 41 of 1316's vanished.
- [1344-I-compare.py](1344-I-compare.py) compares identities and primaries with 1338-I:
  [1344-I-vs1338.json](1344-I-vs1338.json).
  - Self-check: run over 1338-I against 1333-I, it reproduces 1338-I's own result (1 gone, 1 changed, 0 new).
  - **Against 1338: 771 new, 11 changed, 67 same, 1 gone.**
- New rows by first message (normalized digits):

| Count | First message | Sweep class (1320-A pattern) |
|---|---|---|
| 281 | `validateSaveV42: expected version 42` | S1 live validator |
| 248 | `expected 43 to be 42` and other number pins | S2 live literals; some S10 digests |
| 93 | `existing live writer moves coherently to 42` | S2 |
| 26 | a not-throw leaf received `validateSaveV42: expected version 42` | S1 |
| 21 + 15 | migration and envelope deep-equals | S5: migrated expectations gain `screenplayShelving` |
| 13 | `Cannot read properties of undefined (reading 'shelved')` | S6: hand-built businesses lack `screenplayShelving` |
| 8 | future-version sentinels (`versions 1 through 42 only`, `unknown saveVersion 42`) | S3 |
| about 25 | refusal leaves that now stop at `validateSaveV42` before their own guard | S8/S9 |
| 4 | environment rows (below) | not a sweep item |

- **Changed (11).**
  - Six retained leaves now stop at a Save43 pin before their 1338 cause (S1/S2, restore past the pin).
  - Four natural-chain digests or ledgers move (`bridge-p14b5-relationships` family 12 ×3,
    `p14b4-rival-seating-preference`), S10. Shelving changes rival behaviour from week 93 (1344-X6), so each needs
    receipt-derived attribution.
  - One `p14c3-save-v38` byte pin (S2).
- **Gone (1):** the `world-first-scenery-load-in-provenance` exporter row, the benign temporary-directory row of 1338.

## Environment: four contaminated rows and a slower run

- **A stray self-link.** `tests/hygiene.test.ts` failed with `ELOOP: too many symbolic links ...
  tests/fixtures/fixtures`. At 04:16:20, during this run, a specialist re-ran its scratch setup with plain `ln -s`,
  which wrote five self-links into the real repo: `art/art`, `docs/docs`, `tools/tools`, `node_modules/node_modules`
  and `tests/fixtures/fixtures`. The guard's scope excludes them, so `fixedSource` held. The parent removed all five
  by literal path after the postflight. Scratch briefs now use `ln -sfn`.
- **Load.** Specialists ran test files beside the measurement (load averages 10-14 near the end), including a 3-5
  minute Bridge file. The run took 48% longer than 1338. Three new rows are load symptoms:
  - `bridge-p13b-s7-disclosure` item 5 and `bridge-runtime-worker` "durably saves exact response bytes", both at 30 s
    timeouts;
  - `bridge-supervisor` "Fake Unity did not report replacement".
  - The unhandled error is `[vitest-worker]: Timeout calling "onTaskUpdate"`, the same symptom.
- **Rule for the recorded gates that close shelving:** no other test process runs while a recorded gate runs. The
  sweep's gates re-measure these four rows on a quiet machine before any is attributed.

## Next

The Save43 pin sweep plan (1344-N) uses these classes. The UI measurement `1344-save43-broad-ui` runs next on a quiet
machine.
