# 818 — P14C.2b QUALIFIED CHECKPOINT: the single final extension

Production source `8599f5f7` (the implementation `8cf6bed2`, follow-ups `25e8fc11` and `8599f5f7`), verified by
the matched pass `816-c2b-full-core` and the final verification `822-c2b-final-verification` (§3). Run 816 on `1b244006`, whose production source is identical: **`fixedSource: true`**, the tested
diff is the empty-tree hash at both ends, and there is no untracked source (2026-09-26 05:58:27–06:49:53 CEST). No
commit was made during the run.

## 1. The player behaviour this slice completed

When someone who announced retirement is still under contract twelve weeks before they retire, their current
employer gets exactly one chance to keep them one more year. Nobody else may bid. The person accepts only if
the offer clears their retirement-adjusted asking price (ask × 1.10, equality accepts). Acceptance moves their
retirement exactly 52 weeks later, the new contract runs from the old decision week to the new retirement week
with no gap and no overlap, the signing bonus is charged once at settlement, and the chance never comes again.
Declining, or making no offer, leaves the retirement where it was. Rivals follow the same law: an incumbent
studio bids at the lowest premium tier that clears the reservation if it can afford the bonus, and attaches no
promise. The player's bridge surfaces never list the extension as an open contest.

## 2. Identities

| | before | after |
| --- | --- | --- |
| save version | 35 | **36** (`RetirementRecord.extensionUsed`, `.extendedFromWeek`; `TalentMarketCase.variant`) |
| projection, schema id, promise rules, protocol | 50 / unchanged / 4 / 4 | UNMOVED; `generated/` clean at every gate |

## 3. Verification

- **Run 816: 366 files (19 failed / 347 passed), 4287 cases (59 failed / 4217 passed / 11 todo).** Against 805:
  RETAINED_SAME_CAUSE 55 (the inherited set; FU-2 failed again, 7 of 9 full runs), VANISHED 7 (809's repairs),
  RETAINED_CHANGED_CAUSE 1 and NEW 3, all four traced by probe to approved C.2b law (817). Every falsifier
  published in 814 before the run held, including the pre-registered return of seed-b's r02-3 row as a rival
  extension at week 416 with `takes` and `rng` unmoved.
- **Requirement coverage.** The independent RED (810) has 51 cases (49 pass + 2 measured `it.todo`) across
  discovery, eligibility, the term rule, the reservation boundary, accept order, the bonus, no chain, decline,
  rival symmetry, promises, Save V36 and every bridge case reader. It was authored in an isolated worktree at the
  scaffold and repaired for test-side defects only (810 §8). Against the scaffold every changed or added case
  fails, except one golden pin meant to hold in both places.
- **Source review 815: KEEP.** Every 806/780 rule is MET at source. The parent closed its three not-verified items
  by shell (18/18 guards and 11/11 arms carry V36 siblings; `ui/src` holds no case reader; projection 50). Its one
  minor defect, a fractional term label, was fixed before the run.
- **End-to-end.** The writer's scripted check and rival probe (811 §5): a player extension moves E 104 → 156
  with one contract `[98, 156)` and one bonus row; tier 1.05 declines with the reservation sentence; a rival
  incumbent extends with no player action; saves round-trip byte-identically; downgrades are refused.
- **C.4 demonstration harness under C.2b (780 §6.2): PASSED on all six seeds (820)** under 782 §7.5, unchanged.
  The five collapsed seeds are identical to run 2; live seed 04 keeps its population (93) and youth floor while
  rivals hold more people (34 live rows against 27) and make 29% more films.
- **Coverage debt restated lawfully (819).** The four cases 817 attributed to C.2b law were restated
  test-side only. seed-b is re-pinned: 48 rows, the new `settlement` digest equals the parent's independent 817
  dump, the author re-measured `receipts` and `employment`, `takes` and `rng` are unmoved, and the extension
  sentence is admitted by name. C2 and B4a assert the extension case. D3 is rebuilt on
  `genuine-v34-c4-all-statuses` (cohort weeks 260 and 312, no extension). Each restated C.2b assertion fails at
  `8e84bb59`.
- **Final verification 822:** run `822-c2b-final-verification` on `dc125578` (production source identical to `8599f5f7`, the 819 repairs
  included), 2026-09-26 07:20:42–08:12:43 CEST, **`fixedSource: true`**, tested diff the empty-tree hash at both
  ends: **366 files (17 failed / 349 passed), 4287 cases (55 failed / 4221 passed / 11 todo)**. Against 816: NEW 0,
  VANISHED 4 (exactly 819's four), RETAINED_SAME_CAUSE 55. Against 805: NEW 0, VANISHED 8 (809's and 819's
  repairs), RETAINED_SAME_CAUSE 55. **Every remaining failure is the inherited set**; FU-2 failed again.
  Comparisons `822-c2b-vs-816-comparison.json` and `822-c2b-vs-805-comparison.json`.

## 4. What this checkpoint does NOT claim

- **UNITY NOT VERIFIED.** No native control was run. The player surface for the extension is C.2-RM's.
- **The bridge proposal path accepts only catalogue terms**, so a player reaches an extension through the bridge
  only when the contract ends exactly at the retirement week (a 52-week term). The engine path is complete for
  every term (811 §6.4).
- W4c (a distrusted or Nemeses issuer on an extension) and W7c (seated past the new E) are measured `it.todo`:
  no lawful construction exists yet. Their predicates are the unchanged C.2a/B-track ones.
- The `ui` project was not run (FU-1 unreturned).
- Every number is PROVISIONAL TUNING (window 12 weeks, factor 1.10). The drop sentence, the extension reason, the
  quote sentence and the week-denominated term label are CANDIDATE wording.

## 5. Process errors in this slice

- **806 §3 and 780 §6.2 said the C.2a and C.4 suites would pass unmodified.** They hold for what those
  sentences checked (the intent/settlement split is equivalent; `p14c2a-core-lifecycle` and `p14c4-cohorts`
  stayed green), but the extension itself moves three C.2a/C.4 cases whose worlds reach an announced employee's
  `E − 12` (817 §3). The contract should have scoped "unmodified" to the split.
- **The writer's green `p14c2a-consumers` at `8cf6bed2` was a silent skip**: synthetic records lacked
  `extensionUsed`, so discovery ignored them. The parent's fail-loud order closed it; the full run then exposed
  the real outcome.
- **The sweep's residual list missed three failures** (813 names one; the matched pass found four). The full
  run is the check that caught them.
- **The first C.2b RED ticked unmigrated V35 states**, the same class as C.4's first RED. It was found by
  root-cause tracing before any change and fixed on the test side.
- **I twice wrote a guessed clock time into the resume notes** (04:45, 05:12) and corrected each to the
  measured time before committing. I also drafted a false cause for a wall-time difference in 820 (an orphan
  that 800 §0 shows was already dead) and corrected it before committing.

LOGIC VERIFIED · UNITY NOT VERIFIED.
