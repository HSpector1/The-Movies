# 1361-G2-F: parent response to 1361-G2-D, the review of the G2 probe

[1361-G2-D](1361-G2-D-review.md) reviewed the G2 probe for P15A.1 Wave 2 (`/Users/zacheryspector/studio-scratch/1361-g2/`).
- **Verdict:** HOLD, on four required edits to the report and the runner. The probe's design is sound.
- **What it confirmed:**
  - every §5 row maps to code with the right numerator, denominator and control comparison;
  - the `decide` classification matches `hollywoodTick.ts:225-236`;
  - "viable equals filmAnnounced" holds by the code;
  - the digests reproduce `stableStringify`;
  - K3's cold start and its factor-1 re-tick are right;
  - K4's edit and guard suffice.

## Rulings

1. **The four required items are adopted.** The probe author makes them, and the parent checks the diff before the run.
   1. **K1-K5 rows read Defect, never Retune** (1361-F2 ruling 4).
   2. **A "new streak" is judged against the control's whole-run streaks** of 52 weeks or more, not against streaks
      clipped to a read-out's scope.
   3. **Thresholds compare integers.**
      - Stall reads Retune at `10*c > 11*k`, and Flag at `c > k` short of that.
      - Below-zero weeks read Retune at `4*c > 5*k`, and Flag at `10*c > 11*k` short of that.
      - The zero-baseline rule stands.
   4. **`RED_JSON` must come from the frozen (c).** The short sha on the first line of `run.meta` must prefix the
      candidate's tree head.
2. **The recommended items 5 to 10 are adopted:**
   - the spies forward their arguments;
   - an absent K4 directory reads notRun;
   - the report cross-checks the K4 head, the save versions (44 and 45) and the era-guard leaf;
   - each verdict prints its route (storage fix, production fix, or tuning);
   - the heap is capped at 5,120 MB;
   - the digest files stay in scratch, recorded by sha256 and size.
3. **The candidate is fixed.**
   - **The tree:** `p15a1-c-r1` = c524911, on slice 2a r2 (`p15a2-r2` 5eccada).
   - **`RED_JSON`:** `S/1361-prod/x/r2c/p15a1.json`, from the parent's three-tag dry run started at 14:48:56 CDT.
4. **The disclosure stands.** The reviewer ran `vitest --version` once, which ran no test and wrote nothing.
