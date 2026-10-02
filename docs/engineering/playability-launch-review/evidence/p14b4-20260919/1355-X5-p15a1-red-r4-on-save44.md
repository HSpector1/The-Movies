# 1355-X5: the P15A.1 Wave 2 RED r4 on the Save44 base, with its producer

Relationship slice B made Save44 live ([1358-L](1358-L-rel-sliceB-landing.md)). The parent ran RED r4 on the last
Save43 commit and on the Save44 HEAD, and rehearsed the producer 1355-P r3 on the Save44 base.
- **Both bases give the same result.** Every classified leaf has its expected status on both.
- **What differs.** Only computed text differs: two state digests that the mint will pin, and the version digit in two
  FIXTURE PENDING messages. Two load-error messages also name a different importing test file.
- **The root type gate** carries only the RED's own two missing-module errors.
- **The producer** mints on Save44 with the same weeks as 1355-X3.

The run's method is in [1359-X6](1359-X6-p15c-red-r8-on-save44.md) ("How the run went"). Outputs are in
[1355-stage/x5/](1355-stage/x5/).

## Results

| Base | Tests | Root type gate |
|---|---|---|
| OLD 65515b66 (Save43) | 55 failed, 4 passed (59) | 19 errors: slice B RED's 17, plus this RED's 2 |
| NEW 1706d844 (Save44) | 55 failed, 4 passed (59) | 2 errors |

- **The two NEW errors** are this RED's TS2307 for the missing `src/core/p15Phases.js`, which P15A.2 slice 2a supplies:
  - `tests/p15a1-market-integration-phases.test.ts(37,30)`;
  - `tests/p15a1-market-integration.test.ts(110,25)`.
- **The totals** equal 1355-X2's (55 and 4).
- **Against the classification.** All 59 leaves of [1355-p15a1-wave2-red-r4-classification.json](1355-stage/1355-p15a1-wave2-red-r4-classification.json)
  have their expected status on both bases. No leaf is missing or unclassified.

### OLD against NEW: six first messages differ, in three kinds

| Kind | Leaves | OLD | NEW |
|---|---|---|---|
| Computed state digest (FIXTURE PENDING; the producer pins these) | `market-week-diff-confined (K1)` | K1 week 21, committed null, post-tick digest 23ea085e… | K1 week 21, committed null, post-tick digest f3e27c14… |
| | `market-no-pressure-week-identity (K2)` | K2 week 12, digest 083e525c… | K2 week 12, digest 772a86ba… |
| Computed version digit (FIXTURE PENDING) | the two `market-old-save` leaves | "minted by 1355-P at the last Save42 writer" | "… the last Save43 writer" |
| Importing file named in a load error | `market-live-window-stock-retire`, `market-root-append-canonical` | "src/core/p15Phases.ts cannot be loaded … in tests/…" | the same, naming another of the RED's test files |

- **The digests** move because Save44 states carry slice B's `competitions` and `romance` on every edge. The weeks stay.
  1355-A §4 pins them "at the RED commit on unchanged production", and the mint on this base pins NEW's values.
- **The version digit** is computed as `Save${MARKET_STEP - 1}`. It reads Save43 at this RED commit and Save44 once the
  P15 step lands, as it read Save42 on the old base. It is a message, not an assertion.

## The producer on the Save44 base

[run-p15-producers-save44.sh](1359-stage/x6/run-p15-producers-save44.sh) repeats 1355-X3 on 1706d844.
- **Inputs.** The producer is 1355-P r3 (sha256 5007e231…, unchanged) in mint mode, over RED r4 in a tree with a real
  `tests/fixtures/p15`.
- **Not a mint.** Nothing was written to the repository.
- **Exit 0.** [1355-p-dry.txt](1355-stage/x5/1355-p-dry.txt):

  | Output | 1355-X3 (Save43) | 1355-X5 (Save44) |
  |---|---|---|
  | `saveVersion` (both manifests) | 43 | 44 |
  | K1 | week 21, committed null | week 21, committed null |
  | K2 | week 12 | week 12 |
  | M0A | weeks 40 | weeks 40 |
  | shared capture | week 30, `fresh-market-week-30`, 69,635 gzip bytes | week 30, 69,689 gzip bytes |
  | capture premise | recent release `studio-315405e1-r01:film:0`, in-flight `studio-315405e1-r03:film:2`, horror | the same three |

  Manifests: [x5-pins-MANIFEST.json](1355-stage/x5/x5-pins-MANIFEST.json) and
  [x5-capture-MANIFEST.json](1355-stage/x5/x5-capture-MANIFEST.json).

## What follows

- The RED can land on the Save44 base after P15A.2 slice 2a's RED (1355-F4). Its `p15-roots.ts` then becomes a one-line
  edit that adds `'sharedMarket'`.
- The recorded mint follows the RED commit. The producer sits at the E root, because its imports are five levels deep.
  It runs once under the recorder, in mint mode, and writes the shared capture that P15A.2's RED also reads.
- The parent compiles the exact order of RED commits, mints and recorded REDs from the records before the first landing.
