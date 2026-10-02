# 1359-F6: parent response to 1359-D5

[1359-D5](1359-D5-p15c-wave2-red-r6-confirmation.md) returns REFINE on the P15C Wave 2 RED r6 and reference r4
([1359-C6](1359-C6-p15c-wave2-red-r6-handback.md)), with one blocking finding. Everything else holds by reading:
- C11, B1 and the Wave 1 file;
- reference r4, including per-era stamping;
- the classification;
- the G6240 counts (7 and 37 of 122).

## Rulings

1. **Finding 1 is adopted: r7 adds the reverse relabel.**
   - The old-law leaf shows today that a v1 manifest validates. It does not show that the validator replays it
     through the frozen v1 entry. A validator that replays only the live era, and accepts any other era after the
     structural checks, passes every assertion.
   - 1359-F Amendment 1 requires the replay under the evaluator the stored definition names. It also keeps v1
     reachable by the validator.
   - r7 adds, after I:1206, the genuine v2 manifest relabelled as v1, which must refuse on replay at
     `official.studios[0].archetypes[0].outcome`. The row's clause names the new assertion. Its `atRed` and
     `firstMessageAtRed` stay as they are, because the leaf still fails at its first statement at the RED commit.
2. **The optional hardening is adopted.** Both relabel checks match `/outcome|qualifying/`, as I:1161 does, so a
   production that emits `qualifying` or `qualifyingCount` before `outcome` still names the defect.
3. **The dry run measures r7.** 1359-X5 waits in the heavy lane. The parent points it at r7 and r7's classification
   before it starts. At reference r4 the revised leaf must pass with both relabels refusing, and the totals stay 40 and
   76 at the RED commit and 113 passed plus C2-C4 pending at reference r4.
4. **Finding 9: noted.** The `tsc --version` slip compiled and wrote nothing and touched no recorded source. C6:285's
   time is approximate; `PROGRESS.txt:88` logs it untimed after the 01:10 entry.
5. **Finding 10, third note: the P15C RED rebases after slice B.** I:151 pins the base's live save version as 43. The
   P15C mint and recorded RED come after slice B's Save44 production. Before them, the parent re-runs the declaration
   check on that base, and the RED moves I:151 and any other base-version pin to the base it lands on. The first two
   notes (law :91 and :288; p15c1 :50-59 and :70-72) go to Wave 2 production and the next Wave 1 text pass.

No second confirmation review is needed if r7's diff from r6 is the one assertion block and the classification
clause. The parent checks that diff before 1359-X5 runs.
