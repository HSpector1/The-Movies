# 1359-X: parent reference run of the P15C Wave 2 RED r3

## How it ran

- **Script.** `/Users/zacheryspector/studio-scratch/1359-x/run-1359-X.sh`, alone in the heavy lane, 19:47-19:51 CDT on
  2026-10-01.
- **Tree.** A fresh scratch tree from repo HEAD 2eaacb29. On it, the staged patches only:
  - RED r3 [1359-p15c-wave2-red-r3.patch](1359-stage/1359-p15c-wave2-red-r3.patch) (sha256 6a4eee26…);
  - then the reference r2 [1359-p15c-wave2-reference-r2.patch](1359-stage/1359-p15c-wave2-reference-r2.patch)
    (9d05d26a…), which applies on r3 (1359-C3).
- **Not minted.** The route L captures mint at the last writer below the P15 step (1359-C2 step 1), so C2-C4 stay
  FIXTURE PENDING.
- **Outputs** stay in scratch (`x-red.txt` and `x-ref.txt` with the verbose reporter, `x-ref-tsc.txt`).

## Results

| Run | Result | Expected (1359-C2/C3) |
|---|---|---|
| RED: `p15c2-campaign-legacy-integration` and `p15c-wave-r-retention` | 36 failed, 8 passed (44); 73.8 s | 35 fail, 2 controls and 7 guards pass |
| Reference: the same two plus Wave 1's `p15c1-campaign-legacy` | 105 passed, **11 failed** (116); 105.7 s | everything passes except C2-C4 |
| Type gate, root, reference | exit 2 | not stated |

At RED, 35 failures are declared:
- 31 fail by name, on a missing export or the missing root;
- 3 are FIXTURE PENDING;
- the F1 law leaf fails on Wave 1's `settledWeek` refusal, as designed.

Every Wave R guard passes at RED and at the reference, and all of Wave 1's tests pass at the reference.

## The failures outside the declaration

**F-1, route L is unlawful under the repo's law.**
- The control `legacy-control-late-founding-route-lawful` fails at RED (12.7 s) and at the reference.
- At the reference, five route L leaves fail the same way:
  - `legacy-tick-freezes-once`;
  - `legacy-ticks-after-freeze`;
  - `legacy-freeze-writes-only…`, whose expected `/campaignLegacy\.official/` refusal never fires;
  - two more leaves, one expecting `/qualifying|contrary|refs/`.
- Every one ends in the frozen V24 rule "Technology save: unfounded or non-player corpus cannot hold technology
  authority" (`src/core/technology.ts:897`).
- Route L calls `beginFounding` at week 6188 and ticks on with the draft open. That call also creates the industry,
  with a migration origin, since route L runs headless before it (corrected after
  [1356-F5](1356-F5-parent-response-to-1356-D3.md)). The new industry's rival method locks then enter the technology
  corpus, the conflict [1356-X](1356-X-p15a2-wave2-reference-run.md) F-2 found.
- Closing the draft with `foundStudio` is no lawful exit. Each draft signing then lacks its ledger payment
  ([1356-F4](1356-F4-parent-ruling-on-1356-C3.md)).
- The other control, `legacy-control-genuine-save38-6240-lawful`, passes (12.7 s).

**F-2, the reference's ranking law contradicts its adapter.**
- `legacy-adapter-sibling-roots` and `legacy-condition-at-6240` fail with "campaign legacy: rankingSnapshots[1]
  repeats a record id" (`src/core/campaignLegacy.ts:491`, reference r2).
- The adapter writes one fact per (record, studio) row (`campaignLegacy.ts:1065`), so a ranking record with two
  studio rows yields two facts with one `recordId`. The RED expects exactly that shape (`power-ranking-3` twice,
  test :574-576), then hands the facts to the law.
- The law must key uniqueness on (`recordId`, `studioId`). The RED is right, and the reference is wrong.

## Measurements for the PROVISIONAL budgets (1359-F2 item 2)

| Item | Measured | Budget |
|---|---|---|
| Wave R campaign, paid by the first guard | 67.3 s at RED, 74.0 s at the reference (the other six reuse it) | `PROVISIONAL_GUARD_BUDGET_MS` 300 s holds with a margin above four times |
| Genuine-save control | 12.7 s | fixture budget 600 s |
| Route L | about 12.7 s for route and validation in its failing control | unmeasurable until route L is lawful; route 600 s and extension 1,800 s wait for the re-run |

[1359-F3](1359-F3-parent-response-to-1359-X.md) rules on these.
