# 805 — P14C.4 QUALIFIED CHECKPOINT: deterministic replenishment

Source `e32c85b4`, verified by run `805-c4-final-verification` on that exact sha: **`fixedSource: true`**, the
tested diff is the empty-tree hash at both ends, `sourceShaAtEnd` is identical, and there is no untracked source
(2026-09-26 02:12:06–03:04:31 CEST).

## 1. The player behaviour this slice completed

Once a campaign year, each film profession receives young newcomers. They refill it up to the accepted founding
size, and they add one extra when nobody in it will still be under 30 by next year. Newcomers are 20–29,
capable-but-unproven, free agents from the day they arrive, and immediately in the hiring market. They age,
sign, work and retire under the same laws as everyone else. A 120-year campaign keeps a working population near
84 and a visible supply of unproven talent in every profession (record 800), where the C.2a world alone ended
with nobody working by about week 4,700 (record 792).

## 2. Identities

| | before | after |
| --- | --- | --- |
| save version | 34 | **35** (`careerLifecycle.cohorts`, append-only receipts) |
| projection, schema id, promise rules, protocol | 50 / unchanged / 4 / 4 | UNMOVED; `generated/` clean at every gate |

## 3. Verification

- **Final run 805: 363 files (19 failed / 344 passed), 4236 cases (63 failed / 4164 passed / 9 todo).** Against
  787: NEW 1 (`p14c2a-save-and-settlement` E1, the predicted class (b) C.4 behaviour), VANISHED 0,
  RETAINED_SAME_CAUSE 62, changed cause 0. Against 803: VANISHED 4, exactly the four test-side fixes traced in
  804, and nothing else moved. FU-2 failed again: 6 of 8 full runs. Comparisons `805-c4-vs-787-comparison.json`
  and `805-c4-vs-803-comparison.json`.
- Matched run 803 (`33234928`, the same source except four test-side fixes): 363 files, 4236 cases, 67 failed
  = 62 retained with the same cause + 5 new, all traced in 804 (1 predicted behaviour, 3 sweep misses,
  1 unlawful test state). Its `fixedSource` is false only because a docs-only commit moved HEAD mid-run;
  the source paths were verified identical.
- Requirement coverage: the independent RED (795) covers A1–A3, B1–B6, C1–C6, D1–D5 and E1 with 50 cases,
  authored in an isolated worktree at the scaffold. It was repaired for test-side defects only (795 §8), and
  every non-justified case fails on the scaffold. The coverage additions (801) close 798's gaps G1 and G3–G5.
  G2 (a rival hiring an entrant) is a measured `it.todo`.
- Source review 798: KEEP. Every 782 §7–§9 and 793 rule is MET at source; all 18 downgrade guards and 10
  conversion arms have V35 siblings.
- **Acceptance demonstration (772 D1):** run 1 FAILED (799, 1 of 3 seeds), traced to a design defect in the
  parent's own youth predicate. Corrected in 782 §9 with the pass condition unchanged. Run 2 PASSED on all six
  seeds, including pre-registered 04–06 (800). Seed 04 is a live economy in which the youth clause is not true
  by construction.

## 4. What this checkpoint does NOT claim

- **UNITY NOT VERIFIED.** No native control was run. The UI surfaces for newcomers are deferred.
- The `ui` project was not run (FU-1 unreturned).
- **Only one live-economy seed.** Five of six measured seeds have insolvent rivals (F-792-1, routed to P15). The
  demonstration proves supply broadly and live-economy access on one seed.
- **The endurance obligation is only partly discharged.** A passive player's 6,240 weeks cost about 17
  CPU-minutes when the industry lives (800 §2). An active player's cost is unmeasured, and no plan bound was
  checked.
- **`freeAgents` is never pruned.** It holds 259–290 ids by week 6,240, mostly retired; the hiring listing grows
  with it.
- Coverage debt carried: C.2a's 7 changed-scenario failures (788) and C.4's p14c2a E1. G2 is an `it.todo`.
- Every count and age is PROVISIONAL TUNING; the youth floor is a delegated reading of the Owner's criterion.

## 5. Process errors in this slice, most of them mine

- **Run 1 of the demonstration failed on MY rule.** §7.1 tested youth at the request instant; the paper model
  (0.935 per seed) did not catch the gap the engine showed (1 of 3).
- **I committed during a recorded run** (803), which broke its `fixedSource` flag. The source-path equivalence
  was proved by diff and a clean final run was added. Rule saved: no commits during recorded runs.
- **An orphaned background process** tripled wall times and briefly looked like a §9 regression. CPU-time
  comparison cleared it.
- **I called F-792-1 systemic from three seeds.** A fourth thrived; corrected in 792.
- **I wrote a false sentence** in 799 ("entrants equal retirements") and corrected it from the data.
- **794's version grep missed `!== 34`**, and three sweep misses followed.
- **The first RED ticked V34 states under the live engine and had vacuous loops.** Both were found by
  root-cause tracing before any change, and fixed on the test side only.
- **Reviewers lacked Glob/Grep** (782-A2, 798) and said so; their claims rest on full reads.

LOGIC VERIFIED · UNITY NOT VERIFIED.
