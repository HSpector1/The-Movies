# §7 C8 re-run plan

Authority: 1344-A §7 third bullet ("The 42 C8 rows (21 natural searches) and the UNRESOLVED ledger and seating rows:
re-run on the candidate and attributed on their own evidence. No test is changed to restore an old result, and no hiring
outcome is forced. Rows that still fail stay open with their cause."), 1344-N "Out of scope" (the 42 C8 rows were SAME at
1344-M and belong to §7), 1338-I (the identities and primaries).

## Rows

Fifty rows, listed with exact identities in [WORKSHEET-TEMPLATE.md](WORKSHEET-TEMPLATE.md) in 1338-I order:

| Group | Rows | 1338 frame | Seed, bound | 1338 primary |
|---|---:|---|---|---|
| C8 T4 sharedTakeOutcomes | 15 | `p14b1-t4-regressions.test.ts:283` | p13a-core-causal-01, 230 | no multi-beneficiary promise outcome from a shared real take within 230 weeks |
| C8 rivalFixture | 5 | `bridge-p14b2-trust.test.ts:253, 386, 398, 412`; `p14b2-fixture-preconditions.test.ts:27` | p13a-core-causal-01, 240 | no natural rival-only promise outcome by 240 |
| C1 row, same primary | 1 | `bridge-p14b2-trust.test.ts:363` | p13a-core-causal-01, 240 | no natural rival-only promise outcome by 240 |
| C8 cast-class rivalWorlds | 9 | `p14b4-cast-class-outcomes.test.ts:247` | seed-b, 350 | UNEXECUTED natural rival prerequisites absent by350 |
| C8 seating natural witness | 12 | `p14b4-rival-seating-preference.test.ts:343` | seed-b, 350 | UNEXECUTED natural premise: no rival film decision on 'seed-b' within 350 ticks ... |
| C8 seating seam witness | 1 | `p14b4-rival-seating-preference.test.ts:807` | p13a-core-causal-01, 350 | UNEXECUTED natural premise: no picture on 'p13a-core-causal-01' within 350 ticks ... |
| UNRESOLVED family 12 ledger | 4 | `bridge-p14b5-relationships.test.ts:530, 547, 550` | one per seed, 416 | digests and row counts |
| UNRESOLVED seating | 3 | `p14b4-rival-seating-preference.test.ts:483, 498, 622` | p13a-core-causal-01, seed-b, 350 | decision lists, digest, w202 offers |

The 21 rows of 1329-A's two natural searches are the 15 T4 rows, the 5 rivalFixture rows and the C1 row. 1338-I files the
C1 row under C1, so the 42 C8 rows hold 20 of them (NOTES.md item 12).

## Files

Six whole files, so every leaf's own `beforeAll` and caches run as in the recorded gates. Durations are from the recorded
1338 gate under full-suite load (`1338-t1-broad-core.txt`); no record times these files alone.

| File | 1338 result | 1338 duration |
|---|---|---:|
| `tests/bridge-p14b2-trust.test.ts` | 22 tests, 8 failed (4 C8, 1 C1, 3 C16) | 71.5 s |
| `tests/p14b1-t4-regressions.test.ts` | 34 tests, 15 failed (15 C8) | 111.2 s |
| `tests/p14b2-fixture-preconditions.test.ts` | 5 tests, 2 failed (1 C8, 1 C16) | 19.5 s |
| `tests/p14b4-cast-class-outcomes.test.ts` | 23 tests, 9 failed (9 C8) | 133.2 s |
| `tests/p14b4-rival-seating-preference.test.ts` | 22 tests, 17 failed (13 C8, 3 UNRESOLVED, 1 inherited), 1 skipped | 67.4 s |
| `tests/bridge-p14b5-relationships.test.ts` | 15 tests, 5 failed (4 UNRESOLVED, 1 C16) | 100.2 s |

The six other failing rows in these files (C16 ×5, inherited ×1) are outside §7. `worksheet.py` lists every failure that
is not one of the fifty under "Other failures", so a new failure in these files is visible.

## Commands (RUNBOOK.md step 2, in the pristine candidate tree, before any probe file is copied in)

```bash
mkdir -p "$OUT/c8"
if [ -e "$OUT/c8/run.txt" ]; then echo "STOP: out/c8/run.txt exists"; else
  (cd "$T" && PATH="$REPO/.venv/bin:$PATH" node_modules/.bin/vitest run --project core --no-cache \
     --reporter=default --reporter=json --outputFile.json="$OUT/c8/run.json" \
     tests/bridge-p14b2-trust.test.ts tests/p14b1-t4-regressions.test.ts tests/p14b2-fixture-preconditions.test.ts \
     tests/p14b4-cast-class-outcomes.test.ts tests/p14b4-rival-seating-preference.test.ts tests/bridge-p14b5-relationships.test.ts) \
     > "$OUT/c8/run.txt" 2>&1
  echo "exit=$?" >> "$OUT/c8/run.txt"
fi
(cd "$T" && python3 "$E/1321-I-attribution.py" "$OUT/c8/run.txt" "$OUT/c8/failures.json")   # refuses an existing output
```

- `PATH` matches the recorded gate's command (1344-M); none of the six files starts Python.
- `--no-cache` keeps vitest from writing `results.json` through the `node_modules` link into the real repository.
- The attribution parser is the archived `1321-I-attribution.py`, unchanged, run from the tree root so its relative
  `docs/...` path resolves through the tree's `docs` link (read-only). Its `status_vs_1316` column is not used here.
- The expected exit is 1: rows that still fail make the run fail.

The worksheet comes after the probes and `compare.py` (RUNBOOK.md step 10):

```bash
python3 "$K/c8/worksheet.py"
```

## Reading the worksheet

- **candidate:** FAILED, PASSED, SKIPPED or NOT RUN from the JSON reporter; `samePrimary` compares with 1338.
  `FAILED (absent from failures.json ...)` means the two outputs disagree: stop and read `run.txt`.
- **evidence:** what the kit measured for the row's seed (first shelving, first tick that differs from the ff803032
  chain) and, for the 21 natural-search rows, whether the premise was reached inside the bound.
- **attribution and cause:** the parent's. A row that fails with its 1338 primary, on a search that ends before the
  first shelving shows, keeps its 1338 cause. A row whose primary changed, or that passes, needs receipts that explain
  the change (`compare.json` movements for that seed). A row that cannot be explained returns to the parent as an
  unattributed movement.
- No test changes and no hiring is forced to make a row pass. A row that still fails stays open with its cause.
