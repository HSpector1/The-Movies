# 1346-C4: floor bound reversal, contribution seam, one-reason-per-code, small revision

Role: independent test engineer (test-author). Task: small revision in the same scratch tree, after
implementation review [1346-J](1346-J-p15a1-implementation-review.md) returned KEEP and the parent's
response [1346-F3](1346-F3-parent-response-to-1346-J.md) took three of its notes before landing
production. Nothing has landed in the real repo's `src/` yet; this revision only touches the tests
in the scratch tree, unchanged in location:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-work/tree`.

## What changed, and why

Only `tests/p15a1-shared-market.test.ts` was edited. `tests/p15a1-shared-market-harness.test.ts` is
byte-identical to the r3 patch. Every leaf not named below is unchanged from r3.

### Note 1: "F1 reversed" — the plain formula (`market-factor-bounds-and-monotonicity`, revised)

1346-F3 quoted verbatim: *"`1 − 0.25 · (1 − e^(−P/2))` equals exactly 0.75 in float64 once P exceeds
about 72. That is correct rounding of an asymptote, not an error. Returning the next double above
0.75 manufactures a value the Owner's formula never produces. Production computes the formula as
written and removes `nextDoubleAbove`."* This directly reverses r1's design, which asserted strict
`pressureFactor(1000) > 0.75` (r1's `market-factor-bounds-and-monotonicity`, unchanged through r2/r3)
— a strict inequality a correct plain-formula implementation cannot satisfy at that P, and which
1346-X4's writer apparently satisfied only by adding a `nextDoubleAbove` nudge, which 1346-J correctly
flagged and 1346-F3 now removes.

**Verified independently before editing**, not assumed from the coordinator's message (`node -e`,
plain-formula `f(P) = 1 - 0.25*(1 - Math.exp(-P/2))`, no test harness involved):

```
P=0.5   0.9447001957678512   > 0.75: true
P=1     0.9016326649281583   > 0.75: true
P=2     0.8419698602928606   > 0.75: true
P=4     0.7838338208091532   > 0.75: true
P=8     0.7545789097221836   > 0.75: true
P=16    0.7500838656569756   > 0.75: true
P=20    0.7500113499824406   > 0.75: true
P=32    0.7500000281337937   (still > 0.75, barely)
P=50    0.750000000003472    (still > 0.75, barely)
P=72    0.75                 (exactly 0.75 in float64)
P=100..1000  0.75             (exactly 0.75 throughout)
```

This confirms 1346-F3's claim about the ~72 crossover exactly, and confirms every P up to 20 stays
strictly above 0.75 with real margin (smallest margin at P=20 is about `1.13e-5`, comfortably outside
float rounding noise). The revised leaf:

- keeps the original strict pairwise checks (`f1 < 1`, `f1 > f2`, `f2 > f4`) unchanged;
- asserts strict `pressureFactor(P) > 0.75` for `P` in `[0.5, 1, 2, 4, 8, 16, 20]` — exactly the
  values 1346-F3 named, "e.g. 0.5, 1, 2, 4, 8, 16, 20";
- asserts `pressureFactor(1000) >= 0.75` (was `> 0.75`) and keeps `<= 1`;
- asserts `pressureFactor(0) === 1` exactly (also covered by the separate, unchanged
  `market-factor-zero-exact` leaf; kept here too per 1346-F3's explicit "f(0) === 1" bullet, and
  because it doubles as the first point of the monotonicity grid below);
- adds a monotone **non-increasing** (not strictly decreasing — the plateau at 0.75 is legitimate)
  check over the 18-point grid `[0, 0.5, 1, 2, 4, 8, 16, 20, 32, 50, 72, 100, 150, 200, 300, 500,
  750, 1000]`, asserting `f(grid[i]) <= f(grid[i-1])` for every consecutive pair. This grid
  deliberately straddles the ~72 plateau boundary on both sides (50 and 72 are consecutive grid
  points spanning the crossover) so the check exercises both the still-strictly-decreasing region
  and the flat-at-0.75 region in one leaf.

### Note 2: the contribution seam (`market-release-contribution-seam`, new)

1323-A §3: *"Contribution. `c = 1` per eligible release in v1. Reach scaling waits for a lawful
public pre-verdict reach fact (P15 open question 2); the scaling seam is one named function
returning 1 in v1."* 1346-F3: *"Production exports `releaseContribution(release: MarketRelease):
number`, returning 1, and every weight is multiplied through it. A test pins the value 1 for a
player and a rival release of any genre."*

New leaf in the "module surface" describe block, added after `market-reason-source-limit-export`.
Constructs one player release and five rival releases spanning all six genres in the catalogue
(`comedy, drama, crime, romance, horror, adventure`), asserts `releaseContribution(release) === 1`
for each. Uses the same dynamic-import + `requireFn` guard pattern as every other leaf in this file,
so it fails loudly at the missing-module reason at RED, exactly like every sibling leaf — no special
case was needed for this leaf's RED mechanics.

I covered all six genres rather than just "several" (the coordinator's word) because the marginal
cost is one extra object per test and it directly rules out a genre-keyed lookup table that happens
to return 1 for only some genres — a stricter and equally cheap check than a partial sample.

### Note 3: "one reason per code" (`market-same-week-two-studios-one-reason`, new)

1346-F3: *"A leaf puts two same-week peers from two different studios against one subject. It
asserts exactly one `SAME_WEEK_RELEASES` reason, `sourceReleaseIds` holding both ids heaviest-first,
and `value` equal to their summed weight."* The coordinator's message added the concrete number:
"value equal to their summed window weight (2.0 for two same-week peers at weight 1.0 each, before
any clamp — state the arithmetic)."

**The arithmetic, stated exactly**: a same-week batch peer (not a stored exposure) always
contributes the flat window weight `1.00` per 1323-A §3 ("`+ Σ 1.00` for k's other genre-g batch
members"). With two peers from two DIFFERENT studios, each studio `k` has exactly one such
contribution, so each studio's own `Wk = 1.00`. The per-studio clamp is `min(Wk, 1.0)`; since
neither studio's raw `Wk` exceeds `1.0` (each is exactly at the cap, not over it), the clamp is a
no-op for both — `min(1.00, 1.0) = 1.00` for each. The subject's pressure is
`Σk min(Wk,1.0) = 1.00 + 1.00 = 2.00` (window term; no stock term, no other exposures in this
scenario). The `SAME_WEEK_RELEASES` reason aggregates both sources' contributions, and per the
already-established "value stays the full sum over every contributor" rule (1346-F Blocking 2,
already pinned and tested for `GENRE_SATURATION`), its `value` is that same raw sum: `1.00 + 1.00 =
2.00`. "Before any clamp" in the coordinator's phrasing is accurate but not doing extra work here —
no clamp actually engages in this two-different-studios scenario, since clamping requires one
studio's own contributions to exceed `1.0`, which needs at least two releases from the SAME studio
(already covered by the separate `market-studio-window-clamp` leaf, unchanged).

New leaf, inserted between `market-window-releases-reason-code` and `market-reason-source-ids-ordering`
in the "stock term through assessBatch, and reason codes" describe block (this leaf is about reason
aggregation, the same family as its neighbors, even though the pressure source here is window/same-week
rather than stock). One subject, two same-week peers `PEER-ZULU` (studio `S-ZULU`) and `PEER-ALPHA`
(studio `S-ALPHA`), same genre, deliberately placed in the batch's `members` array in "zulu-then-alpha"
order (not sorted), so the assertion genuinely proves the tie-break sorts the output rather than
merely echoing input order — the same rigor already used for the two `market-reason-source-ids-ordering*`
leaves in r3. Asserts:

- `result.reasons` has length exactly 1 (one reason total, not two — the "one reason per code"
  requirement, since both sources share the same code);
- that one reason's `code === 'SAME_WEEK_RELEASES'`;
- `value` is `2.0` (tight tolerance `toBeCloseTo(2.0, 9)`, consistent with every other
  independently-derived-value check in this file);
- `sourceReleaseIds` equals exactly `['PEER-ALPHA', 'PEER-ZULU']` — both tied at weight `1.00`, so
  the order is decided purely by the ascending-`releaseId` tie-break rule already pinned in r3 for
  `GENRE_SATURATION` and `WINDOW_RELEASES`; this leaf exercises the same rule a third time, on a
  third code (`SAME_WEEK_RELEASES`).

## Files changed (scratch tree only)

`tests/p15a1-shared-market.test.ts`: 792 → 890 lines (r2/r3's 792-line body plus this revision's net
+98 lines: the revised `market-factor-bounds-and-monotonicity` body, the new
`market-release-contribution-seam` leaf, and the new `market-same-week-two-studios-one-reason` leaf,
plus one new header-banner paragraph). `tests/p15a1-shared-market-harness.test.ts` is untouched
(byte-identical to r3, 194 lines).

Leaf count: **35** (33 from r3, unchanged in body except one; `market-factor-bounds-and-monotonicity`
revised in place; two new leaves: `market-release-contribution-seam`,
`market-same-week-two-studios-one-reason`).

## RED run (revised)

Command, from the scratch tree, unchanged:

```
node_modules/.bin/vitest run --project core tests/p15a1-shared-market.test.ts tests/p15a1-shared-market-harness.test.ts
```

Result: **2 test files failed, 35 tests failed, 0 passed.**

- `market-factor-bounds-and-monotonicity`, `market-release-contribution-seam`, and
  `market-same-week-two-studios-one-reason` all fail on `Error: Failed to load url
  ../src/core/sharedMarket.js (resolved id: ../src/core/sharedMarket.js) in <importer>. Does the
  file exist?` — the module still does not exist in this scratch tree (only the writer's separate
  tree, used for 1346-E/1346-J/1346-X4, has it; this scratch tree was archived from BASE before
  `sharedMarket.ts` existed and was never touched by the writer). Confirmed all three individually
  attributed in the raw per-leaf output, failing at their own dynamic import before any of their new
  or revised assertions execute.
- The remaining 32 leaves are unchanged in RED reason from r3 (31 module-load failures, 1 genuine
  `market-tuning-bounded-terms` value mismatch).

Full raw output:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-work/vitest-red-r4-output.txt`
in this session's scratchpad.

Full per-leaf mapping (35 rows, `status` marks `unchanged from 1346-C` / `1346-C2` / `1346-C3`,
`REVISED in 1346-C4`, or `NEW in 1346-C4`) is in `1346-stage/1346-p15a1-red-r4-classification.json`.

## Type gate (revised)

Command: `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Exit code 2 (this run needed the
background-task path again — multiple other concurrent sessions' `tsc` invocations were visible via
`ps aux` on the same host during this revision, as in 1346-C3; the completed run's exit code was
captured directly from the finished process, not inferred). Exactly two errors, both and only from
the missing module (line 71 in the main file now, shifted from 59 in r3 by the two new leaves; cause
unchanged):

```
tests/p15a1-shared-market-harness.test.ts(28,24): error TS2307: Cannot find module '../src/core/sharedMarket.js' or its corresponding type declarations.
tests/p15a1-shared-market.test.ts(71,24): error TS2307: Cannot find module '../src/core/sharedMarket.js' or its corresponding type declarations.
```

No other errors. The revised leaf and the two new leaves introduce no other type errors under this
repo's `strict`/`noUnusedLocals`/`noUnusedParameters`/`exactOptionalPropertyTypes` tsconfig.

## Patch and apply-check

Full tests-only diff vs the ORIGINAL base `ea65e796de37e11170c5123e3f4495368b9d5956` (not
incremental against r1/r2/r3): 1096 lines, 2 files, 1084 insertions, 0 deletions
(`tests/p15a1-shared-market.test.ts` 890 lines, `tests/p15a1-shared-market-harness.test.ts` 194
lines).

Verified the patch applies cleanly via a scratch index (never the real repo's index) against both
the original BASE and the real-repo HEAD observed at hand-back time:

```
BASE=ea65e796de37e11170c5123e3f4495368b9d5956
HEAD_NOW=8e8a4e5604bcff50f221f3aff698f1af1226673a
PATCH=1346-stage/1346-p15a1-red-r4.patch

IDX1=$(mktemp); GIT_INDEX_FILE=$IDX1 git read-tree $BASE
GIT_INDEX_FILE=$IDX1 git apply --cached --check "$PATCH"   # exit 0
rm -f "$IDX1"

IDX2=$(mktemp); GIT_INDEX_FILE=$IDX2 git read-tree $HEAD_NOW
GIT_INDEX_FILE=$IDX2 git apply --cached --check "$PATCH"   # exit 0
rm -f "$IDX2"
```

Both exit 0.

## Real repo state at hand-back

Observed HEAD: `8e8a4e5604bcff50f221f3aff698f1af1226673a` — unchanged from the HEAD observed at the
start of this revision (no parent commits landed on the real repo while this revision was in
progress). `git diff --stat ea65e796..8e8a4e56 -- src tests ui bridge` shows the same single file as
every prior 1346 handback in this chain, `ui/src/lot/StudioLotIdentityReview.test.tsx` (+3 lines,
the parent's own prior U3 commit) — no further drift under those four roots, and in particular
`src/core/sharedMarket.ts` from the writer's implementation work (1346-E/1346-J/1346-X4) has **not**
landed on the real repo's `src/` as of this HEAD; that work exists only in the writer's own separate
scratch tree. `git status --short` in the real repo shows only this revision's three handback files.

## Summary

- Revised file (scratch tree only): `tests/p15a1-shared-market.test.ts`. 35 total leaves (32 from
  r3 fully unchanged; `market-factor-bounds-and-monotonicity` revised in place; two new leaves,
  `market-release-contribution-seam` and `market-same-week-two-studios-one-reason`). The harness
  file is byte-identical to r3.
- RED status: 35/35 failed, each for a stated reason (31 missing-module load failures including the
  two new leaves and the revised leaf, 1 genuine TUNING value mismatch, unchanged). Type gate:
  exactly 2 errors, both `TS2307 Cannot find module '../src/core/sharedMarket.js'`, one per file, no
  other errors.
- All three 1346-F3 notes implemented and independently verified before writing (the ~72 plateau
  crossover for note 1; the 2.00 same-week arithmetic and the "no clamp actually engages" fact for
  note 3).
- Handback artifacts: `1346-stage/1346-p15a1-red-r4.patch` (full BASE-relative diff, verified against
  both BASE and current HEAD via scratch indices, exit 0 both), `1346-stage/1346-p15a1-red-r4-classification.json`
  (35 rows), this file.
