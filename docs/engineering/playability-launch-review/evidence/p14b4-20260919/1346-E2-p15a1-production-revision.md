# 1346-E2: P15A.1 Wave 1 production revision (the seam and the plain factor)

Role: the single production writer (sim-core), same scratch tree as
[1346-E](1346-E-p15a1-production-handback.md). Task: take RED r4 and make exactly the three
production changes of [1346-F3](1346-F3-parent-response-to-1346-J.md) and
[1346-X5](1346-X5-red-r4-dry-run.md). Status: **DONE, GREEN 35/35 on RED r4**, three type gates
exit 0, no test edited.

## Base check

- Real-repo HEAD at the start: `95cdd695a91fc8f7b04e12dada7dd472cea1d7c6`. At the end:
  `e8caeb9009553f67be3a239277820d82082f6151`. `git diff --stat 95cdd695 e8caeb90 -- src tests ui
  bridge generated scripts` is empty. Nothing from P15A.1 has landed on either commit.
- RED r4 `1346-stage/1346-p15a1-red-r4.patch`: sha256 `5fb31d61…77a862`, matching the brief.
- In the real repo I wrote only this record and `1346-stage/1346-p15a1-production-r2.patch`.

## Method

Scratch tree:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-prod/tree`,
new branch `e2` from the r3 test commit, which carries no production:

| Commit | Content |
|---|---|
| `78f6db4` | RED r3 (from 1346-E) |
| `244d8ec` | RED r4, tests only: the r3 files removed, r4 applied (a full diff against ea65e796) |
| `c537b4c` | production v1 unchanged (sharedMarket.ts sha256 `31a4e858…`) |
| `9ddf9d0` | production r2: the three changes |

On `c537b4c` the r4 suite gave 34 pass and 1 fail. The failure was
`market-release-contribution-seam: RED: src/core/sharedMarket.ts does not export a function named
'releaseContribution'`, which reproduces 1346-X5.

`1346-stage/1346-p15a1-production-r2.patch` is `git diff 244d8ec 9ddf9d0`. It holds the full
production relative to the r4 test commit, so it applies on top of RED r4. Details: sha256
`3924b0b1bb57ccaed28c18fc0a512a1d71c3e0c80a690195d6e5073a87cfd4c5`, 20,966 bytes, 2 files,
414 insertions. Contents:
- `src/core/sharedMarket.ts`, new, 401 lines, sha256 `eaf076da…`;
- `src/core/tuning.ts`, +13 lines. This hunk is byte-identical to v1's (checked by `diff`).

The v1-to-r2 delta alone is `git diff c537b4c 9ddf9d0`. It touches one file, +35/−32, and is
kept in the scratchpad as `1346-e2-delta-v1-to-r2.patch` (sha256 `0c027f75…`) for the reviewer.

## The three changes (and nothing else)

1. **The seam.** `export function releaseContribution(_release: MarketRelease): number` returns 1.
   Its comment names it the 1323-A §3 reach-scaling seam and says v1 returns 1.
2. **Every weight is routed through the seam once.** Each exposure and member gets
   `c = releaseContribution(release)`, and then:
   - its reason-source weight is `c × lane weight`;
   - every per-offset tally (studio window, genre window, clamped window, stock) adds `c`
     instead of 1, and each term multiplies those sums by the lane weight exactly once
     (`laneSum` and the stock finish);
   - self-exclusion subtracts the subject's own `c` from its studio's window and from the genre
     window.

   A member enters the seam as a `MarketRelease` at the batch week, through a new private
   helper `asRelease`. `foldWindow` gained a `contribution` parameter. Comments that described
   the changed values as "counts" now say "contribution".
3. **The plain factor.** `nextDoubleAbove` and the floor are gone. `pressureFactor` returns
   `1 − 0.25·(1 − e^(−P/2))` as written. Its comment says float64 rounds it to exactly 0.75
   past P ≈ 72.

Unchanged:
- `SHARED_MARKET_DEFINITION` stays `'p15a1-market-v1'`;
- every other function, the TUNING keys and their comment;
- the reason model;
- the digest;
- validation.

## GREEN (RED r4 over production r2)

Command, from the scratch tree:
`node_modules/.bin/vitest run --project core tests/p15a1-shared-market.test.ts tests/p15a1-shared-market-harness.test.ts --reporter=verbose --reporter=json --outputFile.json=../green-r4.json`

```
VITEST-EXIT=0
 Test Files  2 passed (2)
      Tests  35 passed (35)
   Duration  3.67s (transform 367ms, setup 0ms, collect 370ms, tests 2.75s, environment 1ms, prepare 464ms)
```

Load average was 9.07 at the start. Per-leaf durations come from the JSON report
(`green-r4.json` and `green-r4-leaves.txt` in the scratchpad):

| Leaf | Duration |
|---|---|
| `market-harness-normal-stream-bounded-active-set-and-determinism` | 2,349 ms (20,000 ms budget) |
| `market-harness-hostile-batch-work-bound-and-active-set` | 224 ms (5,000 ms default) |
| `market-release-contribution-seam` (new) | 1 ms |
| `market-factor-bounds-and-monotonicity` (revised) | 24 ms |
| `market-same-week-two-studios-one-reason` (new) | 3 ms |
| the other 30 leaves | 0 to 49 ms each (largest: `market-large-batch-linear-storage`, 49 ms) |

## Type gates (r4 tests with production r2)

```
node_modules/.bin/tsc --noEmit -p tsconfig.json          ROOT-TSC-EXIT=0    (no output)
node_modules/.bin/tsc -p ui/tsconfig.json --noEmit       UI-TSC-EXIT=0      (no output)
npm run typecheck:bridge (tsc -p tsconfig.bridge.json)   BRIDGE-TSC-EXIT=0  (no output)
```

## Apply and stacking checks (scratch GIT_INDEX_FILE; the real index was never touched)

| Base | Sequence | Result |
|---|---|---|
| 95cdd695 | r4, then `--check` production-r2 | exit 0 |
| 95cdd695 | r4, production-r2, 1351-p15a2-production | all apply; tree `addc86de…` |
| 95cdd695 | r4, 1351-p15a2-production, production-r2 | all apply; tree `addc86de…` (identical) |
| e8caeb90 | the same two orders | all apply; both trees `69d51df0…` (identical) |
| 5dddfebe (HEAD when this record was written) | r4, production-r2, 1351 | all apply; tree `8020f635…`; no src/tests/ui/bridge/generated/scripts drift since 95cdd695 |

The 1351 patch used is `1351-stage/1351-p15a2-production.patch`, sha256 `964c5072…`. As an
extra check beyond the brief, I applied it on top of production r2 in a throwaway scratch branch
and ran the root type gate: `STACK-ROOT-TSC-EXIT=0`. Both patches add TUNING keys, and they
compile together. The branch was deleted afterwards and the tree re-hashed to `eaf076da…`.

## Writer checks (throwaway probes, not in the patch)

- **The seam is load-bearing on every path.** With `releaseContribution` injected to return 2,
  a subject faced one same-week peer, one window exposure at offset 1 and one stock exposure at
  offset 4, each from a different studio. The assessment was:
  - `stockTerm` 0.4, so the stock path doubles;
  - `SAME_WEEK_RELEASES` 2, so the member path doubles;
  - `WINDOW_RELEASES` 1.1, so the window-exposure path doubles;
  - `windowTerm` 2: both rival windows now exceed the cap, and the subject removed its full
    contribution of 2;
  - `STUDIO_CLAMPED` 3.1.

  Under the same injection, the r4 suite failed 8 leaves, not only the seam leaf. The source
  was restored by copy and re-hashed to `eaf076da…`.
- **Regression against the naive reference** from 1346-E, re-run on r2: 3,260 subjects, max abs
  error 4.3e-14, codes and ids exact in selection order. `pressureFactor(P)` is `toBe`-equal to
  `1 − 0.25·(1 − Math.exp(−P/2))` at P = 60, 70, 72, 73, 76, 77, 80 and 1000, and equals exactly
  0.75 from 72 upward.
- Per 1346-F3, the bit-level permutation claim of 1346-E stays NOT VERIFIED. The accepted
  evidence is the tests at 1e-9. The probes above are writer diagnostics only.

## Notes

- **Exactness depends on whole-number contributions.** Every per-offset sum is a whole number
  only because v1's contribution is 1 (any integer contribution keeps it that way). A future
  reach scaling that returns non-integers would make those sums order-sensitive floats and make
  the self-exclusion subtraction inexact. That change needs its own exactness review and a
  definition bump.
- **A stale TUNING comment.** The TUNING comment on `SHARED_MARKET_FACTOR_MAX_PENALTY` still
  says "bounded in (0.75, 1]". That is the mathematical statement; in float64 the factor reaches
  0.75. The brief allowed no other change, so I left it. Rewording it to "(0.75, 1] in exact
  arithmetic; 0.75 in float64 past P ≈ 72" is optional.
- F2 (the `STUDIO_CLAMPED` value) waits for Wave 2 and F3 (no index export) stands, as 1346-F3
  ruled.

## Evidence limits

This is the pure law only: no integration, save, Bridge, UI or Unity work. I ran only the two
P15A.1 test files, two throwaway probes (removed), the three type gates and one stacked root
type gate. I ran no broad suite. Durations come from a shared machine under load.

## Next action

Parent review of the v1-to-r2 delta. Then land RED r4 and `1346-p15a1-production-r2.patch` as
separate commits via the index. It stacks with P15A.2 in either order. Per 1340-O, live-economy
integration still waits for the rival-shelving verification.
