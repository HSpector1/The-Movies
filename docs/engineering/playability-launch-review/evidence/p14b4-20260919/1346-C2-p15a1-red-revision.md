# 1346-C2: revision of the P15A.1 Wave 1 RED tests after review 1346-D

Role: independent test engineer (test-author). Task: revise the P15A.1 Wave 1 RED tests in the
same scratch tree, per the coordinator's revision request citing review
[1346-D](1346-D-p15a1-red-review.md) (verdict REFINE, two blocking defects) and the parent's
response [1346-F](1346-F-parent-response-to-1346-D.md) (both defects accepted, two API shapes
fixed).

## What changed, and why

### Blocking Defect 1 (1346-D): the stock term was never independently verified through `assessBatch`

The only leaf that touched `assessBatch`'s stock aggregation, `market-pressure-decomposition-invariant`,
only asserted `pressure ≈ windowTerm + stockTerm` — a tautology if production computes `pressure`
by literally summing those two fields, which is the natural implementation. An implementation that
silently drops stock-lane exposures (`stockTerm ≡ 0` always) would still pass that identity, every
window-only leaf, and both harness leaves (determinism/step-bounds/active-set count do not test
per-assessment value correctness). Fixed by adding four new leaves in
`tests/p15a1-shared-market.test.ts`, in a new describe block "stock term through assessBatch, and
reason codes (1346-D Blocking 1)":

- **`market-stock-term-through-assess-batch`**: a subject with three stock-lane exposures (three
  distinct studios, ages 0/5/10 weeks past the R+4 hand-off) and no window-lane rival at all.
  Asserts `windowTerm === 0`, `stockTerm` against an independently hand-computed sum of
  `0.20 · 2^(−age/13)` (the same closed form `exposureWeight`'s stock formula uses, written again
  from scratch in the test, not called from production), `pressure ≈ stockTerm`, `factor ≈
  expectedFactor(stockTerm)`, and that `reasons` contains a `GENRE_SATURATION`-coded entry and
  neither `SAME_WEEK_RELEASES` nor `WINDOW_RELEASES`.
- **`market-stock-term-unclamped-same-studio`**: six stock-lane exposures, all from ONE studio
  (ages 0–5), whose raw sum genuinely exceeds 1.0 (asserted directly: `expectedStockTerm >
  1.0`). Asserts `stockTerm` equals that raw uncapped sum — proving the window term's per-(studio,
  genre) clamp (`min(Wk,1.0)`) does NOT apply to the stock term, per 1323-A §3 "stock term: ...
  unclamped: saturation counts volume." Also asserts the `GENRE_SATURATION` reason's `value` equals
  the same full raw sum (the parent's "value stays the full sum" rule) and that its
  `sourceReleaseIds` is bounded at 5 even though there are 6 contributors.
- **`market-window-releases-reason-code`**: one prior window-lane exposure (offset 1, weight 0.55),
  no same-week peer. Asserts `WINDOW_RELEASES` is present and `SAME_WEEK_RELEASES` is absent —
  proving the two codes are actually distinguished (one for stored pre-batch exposures in the
  window lane, one for same-week batch peers), not merged.
- **`market-reason-source-ids-ordering`**: see Blocking Defect 2 below; this leaf serves both
  defects at once.

### Blocking Defect 2 (1346-D): the large-batch check only bounded TOP-LEVEL array fields

`market-large-batch-linear-storage`'s structural check inspected only `Object.keys(record)` and
each TOP-LEVEL array field's length. It never looked inside `reasons[i].sourceReleaseIds`. An
implementation that keeps the top-level `reasons` array at ≤5 entries but embeds an unbounded,
batch-size-proportional id list inside one reason (e.g. `GENRE_SATURATION` listing every same-genre
batch peer, ~85 of 512 members at this test's parameters) would pass every existing assertion and
plausibly stay under the 3,000-character ceiling too. The parent's response fixes this with an
explicit rule and a new exported constant:

> each reason lists at most five `sourceReleaseIds` (the largest contributors to that reason's
> `value`, ties broken by ascending `releaseId`); `value` stays the full sum over every
> contributor; the bound is `MARKET_REASON_SOURCE_LIMIT = 5`, exported from
> `src/core/sharedMarket.ts`.

Three changes implement this:

1. **`market-large-batch-linear-storage`** (extended, original assertions unchanged): after the
   existing top-level structural checks, a new loop asserts, for every `reason` in both the
   32-release and 512-release results, `Array.isArray(reason.sourceReleaseIds)` and
   `reason.sourceReleaseIds.length <= sourceLimit`, where `sourceLimit` is read from the module
   (`requireConst(market, 'MARKET_REASON_SOURCE_LIMIT')`), not a hardcoded literal — so this leaf
   would also catch a production/tuning mismatch between the constant and the actual cap.
2. **`market-reason-source-limit-export`** (new, in the "module surface" describe block): asserts
   `market.MARKET_REASON_SOURCE_LIMIT === 5`.
3. **`market-reason-source-ids-ordering`** (new): the coordinator's requested "one leaf that checks
   the ordering rule on a small constructed case." Six stock-lane exposures in one genre, ages `[0,
   2, 4, 6, 8, 8]` past the R+4 hand-off — four strictly-decreasing distinct weights plus a
   deliberate TIE at the cutoff (two exposures both at age 8, releaseIds `AAA-TIE` and `ZZZ-TIE`).
   Asserts:
   - `GENRE_SATURATION.value` equals the independently hand-computed sum over **all six**
     contributors (not just the kept five) — reinforcing "value stays the full sum."
   - `sourceReleaseIds` has length exactly 5.
   - the KEPT set is exactly `{TOP1, TOP2, TOP3, TOP4, AAA-TIE}` — `ZZZ-TIE` is dropped, because
     `AAA-TIE` wins the tie at the cutoff by ascending `releaseId` (`'AAA-TIE' < 'ZZZ-TIE'`).
   - `ZZZ-TIE` is explicitly asserted absent (`not.toContain`).

   **Assumption flagged, not silently adapted**: the parent's decision pins the *selection* rule
   (which 5 of the 6 survive) but not an *output order* for the surviving `sourceReleaseIds` array.
   I did not assume one. The test compares `new Set(saturation.sourceReleaseIds)` against the
   expected set, order-independent, rather than asserting an exact array order. If the parent later
   pins an order (e.g. "descending by value, ties ascending by id" or "always canonical ascending
   releaseId order" to match the rest of the module's canonicalization convention), this leaf should
   be tightened to an exact array-equality assertion at that time; until then, asserting an
   unstated order would risk a spurious RED-for-the-wrong-reason at GREEN.

### `market-reasons-capped-at-five` (required change, redesigned)

The coordinator's instruction reframed this leaf: "must assert which codes are retained." Reviewing
the original design against 1346-F's Blocking 2 fix surfaced a premise error in my own original
test, reported here rather than quietly patched over: the original leaf assumed reasons are
generated ONE PER CONTRIBUTING SOURCE RELEASE (seven same-week peers → trim to five reasons). The
parent's Blocking 2 response makes clear reasons instead aggregate ONE ENTRY PER APPLICABLE CODE
(and a reason's own `sourceReleaseIds` list, not the top-level `reasons` array, is what gets
trimmed to 5). Since there are exactly five possible codes (`SAME_WEEK_RELEASES`, `WINDOW_RELEASES`,
`GENRE_SATURATION`, `STUDIO_CLAMPED`, `NO_PRESSURE`) and `NO_PRESSURE` is mutually exclusive with
the other four (it only applies when pressure is exactly zero), "at most five" is the natural
ceiling of the code catalogue itself, not an active trim of excess per-source candidates. The
revised leaf engineers a single subject whose pressure is driven by all four non-`NO_PRESSURE`
codes at once (a same-week peer for `SAME_WEEK_RELEASES`; a lone window-lane exposure for
`WINDOW_RELEASES`; two same-studio window-lane exposures summing past 1.0 for `STUDIO_CLAMPED`
which also contributes to `WINDOW_RELEASES`; one stock-lane exposure for `GENRE_SATURATION`), then
asserts:
- `reasons.length <= 5` (the named cap, still checked, now understood as structural)
- `reasons.length === 4` (exactly the four codes engineered)
- the code SET equals `{SAME_WEEK_RELEASES, WINDOW_RELEASES, GENRE_SATURATION, STUDIO_CLAMPED}`
- `NO_PRESSURE` is absent

I did not assert specific `value`/`sourceReleaseIds` content for `WINDOW_RELEASES` or
`STUDIO_CLAMPED` in this leaf (e.g. whether the clamped studio's raw or post-clamp contribution
feeds the `WINDOW_RELEASES` aggregate's `value`), since the coordinator's ask was "which codes are
retained," not their values, and the authority text does not pin that specific cross-code value
composition; inventing an assertion there would risk the same kind of unpinned-assumption
overreach the review already caught once.

## Non-blocking items from 1346-D, addressed

- **`market-harness-hostile-batch-work-bound-and-active-set`**: added `expect(steps.count).toBeGreaterThan(0)`
  immediately before the existing upper-bound assertion, so this leaf is self-contained (previously
  it only proved non-triviality via the separate `market-step-counter-basic` leaf).
- **A member appended by the batch reports no transition**: unchanged, already correct.
  `market-reduce-exposures-append` asserts `result.transitions` is `[]` for a brand-new member (its
  `releaseWeek === batch.week`, so it has no lane at `batch.week - 1` to transition from — computing
  one would hit `exposureWeight`'s own `t < R` precondition and throw). `market-reduce-exposures-lane-transition`
  only ever feeds `reduceExposures` a PRE-EXISTING exposure (constructed directly in the test, not
  appended in a prior call), so it never exercises the appended-member path. No test changes were
  needed for this note.
- **Explanation of the exact per-week active-set equality** (1346-D: "add it [to 1346-C's
  Tolerances chosen section]"): 1346-C is a sealed, already-delivered record; I am not editing it.
  The explanation belongs here instead. `market-harness-normal-stream-bounded-active-set-and-determinism`
  asserts, every week, both `exposures.length <= expectedActive` (the charter's literal "at most,"
  1323-F Amendment 3) AND the tighter `exposures.length === expectedActive`, where `expectedActive`
  is independently recounted from a release log built outside the exposures array. The exact
  equality is justified, not just plausible, because `reduceExposures`'s own specification (1323-A
  §3) is a strict one-release-to-one-exposure mapping: "each member becomes an exposure," and the
  reducer only ever *drops* retired exposures — it never merges, deduplicates, or otherwise
  aggregates two releases into fewer exposure records. Given that mapping, the count of
  currently-active exposures is not merely bounded above by the trailing-26-week release count; it
  is *identical* to it by construction, for any implementation that satisfies the stated spec. A
  bound weaker than equality would only be necessary if the reducer were permitted to silently drop
  a non-retired exposure for some other reason (deduplication, a studio cap on stored exposures,
  etc.), and nothing in 1323-A/F authorizes that. The `<=` assertion stays in the test alongside the
  `===` one specifically because it is the literal authority-text wording; the `===` is my own
  addition, justified above, and would itself catch a "some non-retired releases silently vanish"
  defect that the literal "at most" wording alone would miss.

## Files changed (scratch tree only)

Both files edited in place at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-work/tree/tests/`:

- `tests/p15a1-shared-market.test.ts`: 561 → 752 lines. Added `requireConst` and `stockWeight`
  helpers; added the `market-reason-source-limit-export` leaf; added a new describe block with four
  leaves (`market-stock-term-through-assess-batch`, `market-stock-term-unclamped-same-studio`,
  `market-window-releases-reason-code`, `market-reason-source-ids-ordering`); redesigned
  `market-reasons-capped-at-five`'s body (name unchanged); extended `market-large-batch-linear-storage`
  with the nested `sourceReleaseIds` bound check. Every other leaf's body and expectations are
  byte-identical to 1346-C.
- `tests/p15a1-shared-market-harness.test.ts`: 185 → 194 lines. Added one assertion
  (`steps.count > 0`) to `market-harness-hostile-batch-work-bound-and-active-set`. Every other leaf
  and assertion is byte-identical to 1346-C.

Leaf count: **32** (27 from 1346-C, unchanged in expectation, plus 5 new: `market-reason-source-limit-export`,
`market-stock-term-through-assess-batch`, `market-stock-term-unclamped-same-studio`,
`market-window-releases-reason-code`, `market-reason-source-ids-ordering`). Two further leaves kept
their names but had their bodies revised/extended per the required changes above
(`market-reasons-capped-at-five`, `market-large-batch-linear-storage`), and one leaf gained one
assertion (`market-harness-hostile-batch-work-bound-and-active-set`).

## RED run (revised)

Command, from the scratch tree, exactly as before:

```
node_modules/.bin/vitest run --project core tests/p15a1-shared-market.test.ts tests/p15a1-shared-market-harness.test.ts
```

Result: **2 test files failed, 32 tests failed, 0 passed.** Every leaf failed for a stated reason:

- 31 leaves: `Error: Failed to load url ../src/core/sharedMarket.js (resolved id:
  ../src/core/sharedMarket.js) in <importer>. Does the file exist?` — the module still does not
  exist, so every leaf that dynamically imports it (including all five new leaves) fails at that
  import, before any of the leaf's own new assertions can run. Confirmed the five new leaves
  individually attributed and failing on this exact line in the raw output (not a vacuous pass, and
  not swallowed by a sibling collection failure).
- 1 leaf (`market-tuning-bounded-terms`, unchanged): `AssertionError: expected undefined to deeply
  equal [ 1, 0.55, 0.55, 0.2 ]`, the same genuine, distinct value-mismatch reason as 1346-C (this
  leaf never imports the missing module).

**Observed Vite importer-path quirk, reproduced again, now in the opposite direction**: in this
revised run, every "Failed to load url ... in `<importer>`" line names
`tests/p15a1-shared-market.test.ts` as the importer, including for the two harness-file leaves —
the reverse of 1346-C's combined run, where every such line named the harness file. This is
consistent with the mechanism already documented in 1346-C (Vite reuses one cached rejected
resolution's error object, whichever file's import fails first in a given process, across all
importers of the identical unresolved specifier within one run); it is a run-order artifact of
running both files in one process, not a defect in either test file, and does not change which
leaves fail or why. The full raw output is at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1346-work/vitest-red-r2-output.txt`
in this session's scratchpad (ephemeral, reproducible by rerunning the command above against the
scratch tree). The classification JSON again elides the importer path as `<importer>` for this
reason.

Full per-leaf mapping (32 rows, with a `status` field marking `unchanged from 1346-C`, `NEW in
1346-C2`, `REVISED in 1346-C2`, or `EXTENDED in 1346-C2`) is in
`1346-stage/1346-p15a1-red-r2-classification.json`.

## Type gate (revised)

Command: `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Exit code 2. Exactly two errors, both
and only from the missing module (line numbers shifted from 1346-C because of the new header
comments and helper functions, cause unchanged):

```
tests/p15a1-shared-market-harness.test.ts(28,24): error TS2307: Cannot find module '../src/core/sharedMarket.js' or its corresponding type declarations.
tests/p15a1-shared-market.test.ts(50,24): error TS2307: Cannot find module '../src/core/sharedMarket.js' or its corresponding type declarations.
```

No other errors. The new helpers (`requireConst`, `stockWeight`) and the five new leaves introduce
no other type errors under this repo's `strict`/`noUnusedLocals`/`noUnusedParameters`/
`exactOptionalPropertyTypes` tsconfig.

## Tolerances (new leaves only; all prior tolerances from 1346-C unchanged)

- **`toBeCloseTo(x, 9)`** for every hand-computed stock-sum comparison
  (`market-stock-term-through-assess-batch`, `market-stock-term-unclamped-same-studio`,
  `market-reason-source-ids-ordering`). Same reasoning as 1346-C: both sides use the identical
  closed-form expression (`0.20 · 2^(−age/13)`, written independently in the test via `stockWeight()`,
  never calling production), so nine decimal digits is an exactness check against float rounding
  noise, not a real approximation tolerance.
- **No new prose-precision tolerances** were needed; the new leaves compare against independently
  computed exact values throughout, not against 1323-A's rounded prose figures.
- **`MARKET_REASON_SOURCE_LIMIT` read from the module, not hardcoded**, in
  `market-large-batch-linear-storage`'s extended check, so a future constant/behavior mismatch in
  production would itself be caught by this leaf rather than masked by a hardcoded `5` in the test.

## Patch and apply-check

Full tests-only diff vs the ORIGINAL base `ea65e796de37e11170c5123e3f4495368b9d5956` (not
incremental against the 1346-C patch): `git diff --cached` in the scratch tree after `git add -A
tests`, where the tree's only commit is still the original `base` commit from the 1327-C method (the
two test files were never committed to that base; they exist only as staged additions), so this
diff already IS the full BASE-relative patch. 958 lines, 2 files, 946 insertions, 0 deletions.

Verified the patch applies cleanly via a scratch index (never the real repo's index) against BOTH
the original BASE and the current real-repo HEAD at hand-back time:

```
BASE=ea65e796de37e11170c5123e3f4495368b9d5956
HEAD_NOW=c01b3d7919692946323cc6d487ed5d0eb24ec01f
PATCH=1346-stage/1346-p15a1-red-r2.patch

IDX1=$(mktemp); GIT_INDEX_FILE=$IDX1 git read-tree $BASE
GIT_INDEX_FILE=$IDX1 git apply --cached --check "$PATCH"   # exit 0
rm -f "$IDX1"

IDX2=$(mktemp); GIT_INDEX_FILE=$IDX2 git read-tree $HEAD_NOW
GIT_INDEX_FILE=$IDX2 git apply --cached --check "$PATCH"   # exit 0
rm -f "$IDX2"
```

Both exit 0. `git status --short` in the real repo was empty immediately after (no accidental index
mutation).

## Real repo state at hand-back

The coordinator's message cited real-repo HEAD `e374f4c8`. By the time I checked, one further
parent commit had landed on top of it (`c01b3d79`, docs-only: relationship-slice RED staging and a
Power Ranking charter adoption, both unrelated to P15A.1). Final observed HEAD:
`c01b3d7919692946323cc6d487ed5d0eb24ec01f`. `git diff --stat ea65e796..c01b3d79 -- src tests ui
bridge` shows exactly the same single file as at the original 1346-C handback,
`ui/src/lot/StudioLotIdentityReview.test.tsx` (+3 lines, inside the parent's own prior U3 commit) —
no further drift under those four roots since then. `git status --short` in the real repo is clean
except for this revision's three intended handback files.

## Summary

- Revised files (scratch tree only): `tests/p15a1-shared-market.test.ts` (32 total leaves, 5 new,
  2 revised in place), `tests/p15a1-shared-market-harness.test.ts` (1 leaf extended with one new
  assertion). No other leaf's expectations changed.
- RED status: 32/32 failed, each for a stated reason (31 missing-module load failures including all
  5 new leaves, 1 genuine TUNING value mismatch, unchanged). Type gate: exactly 2 errors, both
  `TS2307 Cannot find module '../src/core/sharedMarket.js'`, one per file, no other errors.
- Both blocking defects from 1346-D are closed by new/revised leaves, per the parent's 1346-F
  decisions (exported `MARKET_REASON_SOURCE_LIMIT = 5`; top-5-by-value/ties-ascending-id selection
  with full-sum `value`). One assumption flagged and not silently resolved: no output ORDER is
  pinned for a reason's `sourceReleaseIds`, only the selection rule; the new ordering leaf asserts
  set membership, not array order.
- All three non-blocking notes from 1346-D addressed (hostile-batch `steps.count > 0`; appended-member
  no-transition behavior confirmed unchanged; the exact per-week active-set equality explained
  above).
- Handback artifacts: `1346-stage/1346-p15a1-red-r2.patch` (full BASE-relative diff, verified against
  both BASE and current HEAD via a scratch index), `1346-stage/1346-p15a1-red-r2-classification.json`
  (32 rows), this file.
