# 1351-E2: P15A.2 Wave 1 production revision (authored pre-campaign films count in no lane)

Role: the single production writer (sim-core), working in the same scratch tree as
[1351-E](1351-E-p15a2-production-handback.md). **Status: DONE.**
- RED r4 passes 35/35.
- The root, UI and bridge type gates exit 0.
- No test was edited.
- The revision makes exactly one production change.

## Authority

- [1351-F](1351-F-parent-response-to-1351-E.md), the F3 ruling: authored pre-campaign films count in
  no lane. It amends 1350-A §3 by one condition.
- [1351-X4](1351-X4-red-r4-dry-run.md): r4 run over production v1 passes 34 and fails only the F3 leaf
  (`expected 95 to be +0`).
- The coordinator's brief for 1351-E2 allows two edits and nothing else:
  - the Films lane skips films with `authoredPreCampaign === true`, as Releases already does;
  - the header comment's lane description says those films count in no lane.

## Base check

- Real-repo HEAD at start: `60a95044adf93af4576b12a243560c7c3850e361`, as the brief states.
- Real-repo HEAD at the end: `5374e10553fbee7259b7fd91a8724407792eb6a3`. The parent committed two
  docs-only records meanwhile (`684bcf94` for 1346-X6 and `5374e105` for 1352-A).
- `git diff --stat 3abed41c 5374e105 -- src tests ui bridge generated scripts` is empty.
- In the real repo I wrote only this record and `1351-stage/1351-p15a2-production-r2.patch`.
  - `1346-E2` and `1346-p15a1-production-r2.patch` were untracked when I started; `684bcf94`
    committed them.
  - The 1348 r4 files that are untracked now belong to another worker.

## Method

I used the same scratch tree:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1351-prod/tree`.

| Commit | Content | Diff sha256 (first 16) |
|---|---|---|
| `d4f238a` | RED r3 (from 1351-E) | |
| `fb690c3` | RED r4, test-only. The r3 test files were removed and r4 applied, because r4 is a full diff against BASE. Input patch sha256 `3190a76d1da6f686284851c67668f5ea0ddaa196eface77b0cad45298b2afa9a`, the same as 1351-X4. | `46691a0a1f983eb8` (r3→r4) |
| `02b9b0e` | production v1, replayed byte-identical onto r4 | `964c50724793dc74`, the same as `1351-p15a2-production.patch` |
| `a81d75c` | production 1351-E2: the one change | `ebec22c2a5d76c53` (v1→E2 increment) |

The handback patch is `git diff fb690c3 a81d75c`: production only, relative to the r4 test commit.

## The change (v1 → E2: 1 file, 8 insertions, 7 deletions)

**Code.** In `computePowerRanking`'s film loop, the authored check moves into the skip condition:

```ts
-    if (f.releaseTick < windowStartWeek || f.releaseTick >= week) continue
-    if (!f.authoredPreCampaign) releases.set(f.studioId, (releases.get(f.studioId) ?? 0) + 1)
+    if (f.releaseTick < windowStartWeek || f.releaseTick >= week || f.authoredPreCampaign) continue
+    releases.set(f.studioId, (releases.get(f.studioId) ?? 0) + 1)
```

- Releases counts exactly the same films as in v1.
- Films now skips authored films as well.
- Validation still runs on every film before the skip, authored films included. So an authored film
  with a malformed critic score or gross still throws, as in v1.

**Header comment.** The comment now says: "Authored pre-campaign films count in no lane (1351-F amends
1350-A §3): the ranking measures campaign momentum." The Films bullet reads "each campaign film". The
Releases bullet drops its own authored sentence, because the rule now sits at the top of the lane
description.

Nothing else changed: no other logic, TUNING, type or export.

## Files

`1351-stage/1351-p15a2-production-r2.patch`: sha256
`59e59377359b3d2d17ee892559b83bacac10370a8ecf4634a9d68d47b47e5f1f`, 10,505 bytes, 2 files,
189 insertions, 0 deletions.
- `src/core/powerRanking.ts`: new file, 178 lines.
- `src/core/tuning.ts`: +11 lines, unchanged from v1.

## GREEN (RED r4)

Command, from the scratch tree:
`node_modules/.bin/vitest run --project core tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts --reporter=verbose`

Result: **Test Files 2 passed (2); Tests 35 passed (35)**; vitest exit 0.
- Duration 3.05s: transform 529ms, collect 618ms, tests 1.89s, prepare 564ms.
- The 480-snapshot harness leaf took 1553ms. Vitest printed no duration for any other leaf, the
  determinism leaf included.
- Three leaves now pass:
  - `compute-power-ranking-authored-pre-campaign-film-counts-in-no-lane` (new in r4);
  - `compute-power-ranking-film-score-rounds-half-up-at-exact-half-tenth` (F1, fixed in r4);
  - `compute-power-ranking-eligibility-entrant-unranked-lanes-shown-excluded-from-comparison` (F2,
    fixed in r4).
- The documented control passes.

Log: `scratchpad/1351-prod/r4-final.log`.

## Type gates (on a81d75c)

| Gate | Exit | Time | Output |
|---|---|---|---|
| `node_modules/.bin/tsc --noEmit -p tsconfig.json` | 0 | 92 s | none |
| `node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` | 0 | 68 s | none |
| `node_modules/.bin/tsc -p tsconfig.bridge.json` | 0 | 44 s | none (`noEmit: true`; the tree stayed clean) |

No broad suite was run.

## Apply and stacking checks (scratch `GIT_INDEX_FILE` only; the real index was never touched)

- `60a95044` + r4 (`1351-p15a2-red-r4.patch`) applies. `1351-p15a2-production-r2.patch` then passes
  `--check`.
- **Order A:** `60a95044` + r4 + `1351-p15a2-production-r2.patch`, then
  `1346-stage/1346-p15a1-production-r2.patch` (sha256 `3924b0b1…d4c5`) passes `--check`.
- **Order B:** `60a95044` + r4 + `1346-p15a1-production-r2.patch`, then
  `1351-p15a2-production-r2.patch` passes `--check` and applies. The combined index adds 5 files and
  1,832 lines over 60a95044.
- `5374e105` (end HEAD) + r4, then `1351-p15a2-production-r2.patch`, passes `--check`.

The two production patches edit separate regions of `tuning.ts`. The P15A.2 keys follow the
`HOLLYWOOD_*` block, while the P15A.1 keys come before `} as const`, so the order does not matter.

## Limits

- The 1351-E cross-check probe (the exact oracle over 20,000 inputs) ran on v1, not on E2.
  - v1 differs from E2 only on authored films in the window, which the probe's generator did include.
  - I did not re-run the probe, because its oracle encodes the old Films rule and would now report
    those cases as mismatches.
  - The r4 leaf pins the new rule. 1351-X4 shows that the same leaf fails over v1 (95 against 0), so
    the leaf is load-bearing.
- This is evidence about the pure law only. Wave 2 (the archive, tick step and view) and the Wave 4
  playtest judgement are separate.

## Next action

Implementation review of `1351-p15a2-production-r2.patch` on RED r4, then landing by the parent.
