# 1351-C4: P15A.2 Wave 1 RED revision -- writer findings F1/F2 fixed, F3 pinned

Role: independent test engineer (test-author). Task: small revision to the Power Ranking RED
suite, same scratch tree, same base, addressing the two test defects found by the production
writer's handback [1351-E](1351-E-p15a2-production-handback.md) and the parent's ruling
[1351-F](1351-F-parent-response-to-1351-E.md).

## F1: `filmScoreTenths()` float-precision bug, fixed

1351-E: the leaf's own helper computed `10 * (0.5 * (61/100) + 0.5 * 1) * 10`, which in float64 is
`80.49999999999999`, and `floor(x+0.5)` then gives 80, not the correct 81. The assertion at this
line (`.toBe(81)`) was already correct; the helper computing it was wrong. 1351-F confirms and
directs the same fix production already uses: "compute in integer tenths with one division."

**Fix applied** (`tests/p15a2-power-ranking.test.ts`, the `filmScoreTenths` helper): changed from

```ts
const raw = 10 * (CRITIC_SHARE * (criticScore / 100) + (1 - CRITIC_SHARE) * reach)
return roundHalfUp(raw * 10)
```

to

```ts
return roundHalfUp(CRITIC_SHARE * criticScore + (1 - CRITIC_SHARE) * 100 * reach)
```

**Why this fixes it, exactly.** The old form divides `criticScore` by 100 (`61/100 = 0.61`, not
exactly representable in binary float64) and later re-multiplies by 100 through two separate
operations (`* 10` inside the raw expression's 10-scale, then `* 10` again for tenths) -- each
float operation can introduce sub-ULP rounding error, and at an EXACT half-integer boundary
(80.5) even a `-1e-14` error flips `floor(x+0.5)` from 81 to 80. The new form never divides
`criticScore` at all: `CRITIC_SHARE * criticScore` is `0.5 * 61 = 30.5` (exact in float64, since
0.5 is a power-of-two fraction and 61 is a small integer), and `(1-CRITIC_SHARE)*100*reach` at
`reach=1` is `0.5*100*1=50` (exact). `30.5+50=80.5` is computed as an exact sum of two exact
floats, so `roundHalfUp(80.5) = floor(81.0) = 81`, correctly.

**Every other helper value the file relies on is unchanged.** I enumerated every distinct
`(criticScore, totalGross)` pair used anywhere in the file (24 pairs total, all against
`baseMarketValue = BMV = 1,000,000`), computed each under both the OLD and NEW formula in Node,
and compared:

| critic | gross | old tenths | new tenths | changed? | used in |
|---|---|---|---|---|---|
| 60 | 450,000 | 55 | 55 | no | worked-example leaf |
| **61** | **1,000,000** | **80** | **81** | **YES (the bug)** | film-score-rounds-half-up leaf |
| 10.98 | 1,000,000 | 55 | 55 | no | C2 fractional FR1 |
| 12.98 | 1,000,000 | 56 | 56 | no | C2 fractional FR2 |
| 16.98 | 1,000,000 | 58 | 58 | no | C2 fractional FR3 |
| 10 | 1,000,000 | 55 | 55 | no | HALFEVEN HE1 |
| 12 | 1,000,000 | 56 | 56 | no | HALFEVEN HE2 |
| 20 | 1,000,000 | 60 | 60 | no | HALFODD HO1 |
| 22 | 1,000,000 | 61 | 61 | no | HALFODD HO2 |
| 80 | 1,000,000 | 90 | 90 | no | window-edge AT-W-52/53/W |
| 90 | 1,000,000 | 95 | 95 | no | window-edge-unfinished ATEDGE (excluded from Films regardless) |
| 80 | 0 | 40 | 40 | no | running-film RUN, 2nd snapshot |
| 60 | 1,000,000 | 80 | 80 | no | film-cap F60 / tie-break A / explainability E1 |
| 40 | 1,000,000 | 70 | 70 | no | film-cap F40 / tie-break B / explainability E2 |
| 20 | 1,000,000 | 60 | 60 | no | film-cap F20 / tie-break C1 / explainability E3 |
| 0 | 1,000,000 | 50 | 50 | no | film-cap F00 / tie-break D,E / tied-pair LOW |
| 0 | 0 | 0 | 0 | no | film-cap WEAK |
| 80 | 1,000,000 | 90 | 90 | no | id-owner-swap factsA |
| 20 | 0 | 10 | 10 | no | id-owner-swap factsB |
| 55 | 300,000 | 44 | 44 | no | determinism X1 (equality-only leaf; exact value not asserted) |
| 90 | 1,000,000 | 95 | 95 | no | determinism Y1 / explainability UNFIN (excluded) / entrant LATE-FILM |
| 70 | 600,000 | 68 | 68 | no | standing-injected F / finance-indep A1 (equality-only leaves) |
| 30 | 100,000 | 21 | 21 | no | finance-indep B1 (equality-only leaf) |
| 50 | 200,000 | 36 | 36 | no | honors/distress A1 (structural-only leaf) |
| 100 | 1,000,000 | 100 | 100 | no | explainability OTHER (excluded, cross-studio) / entrant LATE-FILM |

23 of 24 pairs identical; only critic=61 (the only EXACT-half-boundary case in the entire file)
changes, from the wrong 80 to the correct 81. Verification script (Node, run directly against
both formulas): `/tmp/verify_f1.mjs` in this session's scratchpad, reproducible from the table
above.

**The Method-B inline computation in the C2 leaf (`compute-power-ranking-filmstenths-mean-rounding-order-genuinely-fractional`,
lines ~349-352) was deliberately NOT touched.** It reimplements a separate, intentionally-"naive"
raw-tenths formula (`10 * (10 * (CRITIC_SHARE*(critic/100) + (1-CRITIC_SHARE)*reach))`) to model
the REJECTED "average raw scores, then round once" order -- a different concept from F1's
precision bug. Its three inputs (raw tenths 55.49, 56.49, 58.49) are nowhere near an exact-half
boundary, so the float-precision hazard does not reach it (confirmed in the table above: FR1/FR2/FR3
unaffected either way), and touching it was not requested; F1's fix is scoped to the shared
`filmScoreTenths` helper only.

## F2: entrant leaf's window placement, fixed

1351-E: `compute-power-ranking-eligibility-entrant-unranked-lanes-shown-excluded-from-comparison`
runs at `week: 104` (window `[52,104)`), but EARLY's and MID's releases were built at
`releaseTick: 10` -- outside that window. The leaf's own comment already stated the intended
values (EARLY 50, MID 25), so the code contradicted its own comment, and contradicted this same
file's window-edge leaf (which pins `releaseTick=51=W-53` as excluded at `W=104`).

**Fix applied:** the `releases(id, n)` helper inside this leaf builds each release at
`releaseTick: 60` (was `10`), matching `LATE-FILM`'s own tick (already correctly inside the
window before this fix).

**Every assertion in the leaf, re-derived by hand:**

```
W=104, window=[52,104), threshold=W-52=52.
EARLY: enteredWeek=0 (<=52, eligible). 2 releases at tick 60 (in window), no finished films.
  releasesTenths = round(10*min(2,4)/4 *10) = round(50.0) = 50. filmsTenths=0 (no finished film).
  pointsTenths = 0+50 = 50.
MID: enteredWeek=0 (<=52, eligible). 1 release at tick 60 (in window), no finished films.
  releasesTenths = round(10*min(1,4)/4*10) = round(25.0) = 25. filmsTenths=0.
  pointsTenths = 0+25 = 25.
LATE: enteredWeek=60 (>52, unranked). 1 film (LATE-FILM, tick=60, critic=100, gross=BMV, reach=1,
  runEndedByWeek default true): filmsTenths = round(0.5*100+50*1) = round(100.0) = 100.
  That same film also counts as 1 release: releasesTenths = round(10*1/4*10) = 25.
  pointsTenths = 100+25 = 125. countedFilmIds=['LATE-FILM'].
ABLE: enteredWeek=80 (>52, unranked). No films/releases. pointsTenths=0.
ZOOM: enteredWeek=70 (>52, unranked). No films/releases. pointsTenths=0.

Ranked cohort = {EARLY, MID} only (LATE/ABLE/ZOOM excluded from comparison by eligibility).
rank(EARLY) = 1 + count(ranked others with points>50) = 1 + 0 (MID=25, not >50) = 1.
rank(MID)   = 1 + count(ranked others with points>25) = 1 + 1 (EARLY=50>25) = 2.
LATE/ABLE/ZOOM: ranked=false, rank=null (unaffected by their own points, however high).

Presentation: ranked block by rank asc (EARLY=1, MID=2), then unranked block by studioId asc
  among {ABLE, LATE, ZOOM}: ABLE < LATE < ZOOM alphabetically.
  Order: EARLY, MID, ABLE, LATE, ZOOM.
```

Cross-checked against every assertion actually in the leaf:

| Assertion | Re-derived value | Matches leaf? |
|---|---|---|
| `early.ranked` | `true` | yes |
| `early.rank` | `1` | yes |
| `mid.ranked` | `true` | yes |
| `mid.rank` | `2` | **yes -- this is the one F2 fixed** (was `1`, tied with EARLY, before the tick fix) |
| `late.ranked` | `false` | yes |
| `late.rank` | `null` | yes |
| `late.pointsTenths` | `125` | yes (LATE-FILM was already inside the window before this fix) |
| `late.countedFilmIds` | `['LATE-FILM']` | yes |
| `able.ranked` / `rank` | `false` / `null` | yes |
| `zoom.ranked` / `rank` | `false` / `null` | yes |
| row order | `['EARLY','MID','ABLE','LATE','ZOOM']` | yes |

Only `mid.rank` actually changes behaviour under the fix (from the buggy tie at 1 to the correct
2); every other assertion in the leaf was already consistent with the fixed window placement, or
was already unaffected by the bug (LATE-FILM was never on the broken tick; the presentation-order
assertion coincidentally holds either way because `EARLY < MID` alphabetically regardless of
whether they're tied or ranked 1/2). This matches 1351-E's own report ("the assertions before
:970 pass ... and so do the key and order checks after it").

## F3: authored pre-campaign films count in no lane -- new leaf

Per [1351-F](1351-F-parent-response-to-1351-E.md)'s ruling: "authored pre-campaign films count in
no lane," amending 1350-A §3 by one condition (Films previously named no authored-film
exclusion; only Releases did). Added
`compute-power-ranking-authored-pre-campaign-film-counts-in-no-lane` (inserted immediately after
the existing `compute-power-ranking-releases-lane-excludes-authored-pre-1920-films` leaf, same
`describe` block).

**Design.** `W=26` (`<52`, an "early window": `windowStartWeek=26-52=-26`), `originWeek=0`. One
studio, `'HERITAGE'`, with a single FINISHED (`runEndedByWeek:true`) film at `releaseTick=5`
(trivially inside `[-26,26)`), `authoredPreCampaign:true`, `criticScore=90`, `totalGross=BMV`
(reach=1; if counted it would score `round(0.5*90+50)=95` tenths -- a high, easily-distinguished
value chosen so a wrongly-counted result would be obviously nonzero, not a coincidental 0).

Asserted: `filmsTenths===0`, `countedFilmIds===[]` ("no finished release in the window" reason,
per the same empty-lane behavior already pinned for a studio with zero finished films), `releases===0`,
`releasesTenths===0` (already excluded from Releases by the pre-existing 1350-F rule; still 0 here).

**Control** (closing the loop, same fixture, only `authoredPreCampaign:false`): the identical film
(`criticScore=90`, `totalGross=BMV`, same tick) now counts in BOTH lanes:
`filmsTenths===95` (`round(0.5*90+50*1)=round(95.0)=95`), `countedFilmIds===['CAMPAIGN-FINISHED']`,
`releases===1`, `releasesTenths===25`. This isolates the exclusion as driven specifically by the
`authoredPreCampaign` flag, not by week, tick, or critic score.

**Note on the pre-existing sibling leaf's comment.** The existing
`compute-power-ranking-releases-lane-excludes-authored-pre-1920-films` leaf's own comment (line
~524) still reads "Films lane stays 0 for both regardless of the authored flag, since neither has
a finished run" -- true as written (both its films are `runEndedByWeek:false`, so neither would
count in Films for that independent reason regardless of this ruling), but the comment's closing
clause ("this test only pins the Releases exclusion, which is the only lane 1350-F names") is now
stale given 1351-F's amendment. Per the coordinator's explicit "no other leaf changes," I did not
edit that leaf or its comment; flagging the staleness here rather than silently leaving it
uncommented on.

## Every other leaf unchanged

Confirmed by diff: only `tests/p15a2-power-ranking.test.ts` changed (83 insertions, 10 deletions --
the `filmScoreTenths` helper body/comment, the F1 leaf's comment, the F2 leaf's `releases` helper
tick and its explanatory comment, and the new F3 leaf). `tests/p15a2-power-ranking-harness.test.ts`
is byte-identical across r1-r4 (confirmed: identical hunk in every patch).

## RED run

Command (same as all prior records, from the scratch tree):

```
node_modules/.bin/vitest run --project core tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts
```

Result: **2 test files failed, 34 tests failed, 1 passed (35 total).** All three touched/added
leaves fail for the exact module-load reason, guaranteed by construction (each calls
`await loadPowerRanking()` as its first statement, before the F1/F2 fixes or the F3 leaf's own
logic ever executes):

```
p15a2 power ranking: computePowerRanking worked examples > compute-power-ranking-film-score-rounds-half-up-at-exact-half-tenth
  -> Error: Failed to load url ../src/core/powerRanking.js ... Does the file exist?
p15a2 power ranking: eligibility > compute-power-ranking-eligibility-entrant-unranked-lanes-shown-excluded-from-comparison
  -> Error: Failed to load url ../src/core/powerRanking.js ... Does the file exist?
p15a2 power ranking: window edges and the running-film rule > compute-power-ranking-authored-pre-campaign-film-counts-in-no-lane
  -> Error: Failed to load url ../src/core/powerRanking.js ... Does the file exist?
```

Every other leaf's status is unchanged from r3: 30 of the 34 prior leaves still fail for their
original stated reasons (28 module-load, 1 genuine `TUNING` value mismatch, and now 1 more
module-load from the leaves above), and `compute-power-ranking-standing-independence-no-standing-field-in-type`
still passes as the same documented `control-passes` case (untouched, different `describe` block).
No new control-passing leaf was introduced: the F3 leaf calls the missing module like every other
leaf, so it fails at RED for the module reason, not as a control.

Full per-leaf mapping for all 35 leaves is in `1351-stage/1351-p15a2-red-r4-classification.json`
(r3's 34 rows, unmodified except rows 9 and 32's tightened requirement text documenting the F1/F2
fixes, plus the 1 new F3 row inserted at its actual file position).

## Type gate

Command: `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Exit code 2, exactly the same two
errors as every prior revision, no new errors from the F1/F2/F3 changes:

```
tests/p15a2-power-ranking-harness.test.ts(19,24): error TS2307: Cannot find module '../src/core/powerRanking.js' or its corresponding type declarations.
tests/p15a2-power-ranking.test.ts(31,24): error TS2307: Cannot find module '../src/core/powerRanking.js' or its corresponding type declarations.
```

## Patch verification

`git diff <base>..HEAD -- tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts`
in the scratch tree (base = the scratch tree's own root commit, content-identical to the real
repo's `c01b3d7919692946323cc6d487ed5d0eb24ec01f`) is the full diff for both files, written to
`1351-stage/1351-p15a2-red-r4.patch`. Verified it applies cleanly via a scratch index against
**both** the coordinator-cited real-repo HEAD and the original BASE (never the real repo's own
index):

```
E=docs/engineering/playability-launch-review/evidence/p14b4-20260919

# vs the coordinator-cited HEAD:
CITED=7d61f56e
SCRATCH_INDEX=$(mktemp)
GIT_INDEX_FILE=$SCRATCH_INDEX git read-tree $CITED
GIT_INDEX_FILE=$SCRATCH_INDEX git apply --cached --check "$E/1351-stage/1351-p15a2-red-r4.patch"
# APPLY-CHECK-EXIT vs 7d61f56e = 0
rm -f "$SCRATCH_INDEX"

# vs the original BASE:
BASE=c01b3d7919692946323cc6d487ed5d0eb24ec01f
SCRATCH_INDEX2=$(mktemp)
GIT_INDEX_FILE=$SCRATCH_INDEX2 git read-tree $BASE
GIT_INDEX_FILE=$SCRATCH_INDEX2 git apply --cached --check "$E/1351-stage/1351-p15a2-red-r4.patch"
# APPLY-CHECK-EXIT vs BASE = 0
rm -f "$SCRATCH_INDEX2"
```

Both exit 0. `src/core/powerRanking.ts` is absent at both `7d61f56e` and the real repo's true
current HEAD (checked directly with `git show <rev>:src/core/powerRanking.ts`, both fail to
resolve) -- production has not landed yet, consistent with 1351-F's stated order ("1351-C4 (tests)
-> parent dry run -> production revision 1351-E2 ... -> implementation review -> landing").

## Base/HEAD

Real-repo HEAD at the end of this revision: `fda5f9e29c049e075f9e72d523a4bb7f6bec543c` (two commits
ahead of the coordinator-cited `7d61f56e` by the time this record was finalized -- concurrent
sibling workers' docs-only records, not mine: `e8caeb90 docs(p14): slice A RED r3 (1348-C3) ...`
and one further P15A.1-production-related commit). `git diff --stat` under `src bridge ui tests` is
empty from BASE all the way to this final HEAD (re-checked directly at the end, zero drift across
the whole window). `git status --short` shows only my own two untracked r4 artifacts (plus this
file once written), and, observed but untouched, other concurrent workers' untracked files
(`1344-C2-shelving-red-revision.md` / `1344-stage/1344-shelving-red-r2.*`,
`1346-stage/1346-p15a1-production-r2.patch`).

## Summary

- Fixed F1 in place (the shared `filmScoreTenths` helper's single-division rewrite) and verified
  by hand + a Node script that all 23 other distinct (critic,gross) pairs the file relies on are
  numerically unchanged; only the critic=61 exact-half case changes, from wrong (80) to correct (81).
- Fixed F2 in place (moved the entrant leaf's EARLY/MID release tick from 10 to 60, inside the
  window) and re-derived every one of the leaf's 11 assertions by hand; only `mid.rank` (1->2)
  actually changes under the fix.
- Added 1 new leaf for F3 (`compute-power-ranking-authored-pre-campaign-film-counts-in-no-lane`),
  pinning 1351-F's ruling with both the exclusion case and an `authoredPreCampaign:false` control.
- Every other leaf byte-for-byte unchanged from r3 (34 leaves + harness's 2 = 35 total now).
- RED status: 34/35 failed, all for the module-load reason (28 original + 1 TUNING mismatch is
  actually 27 module-load + 1 TUNING = matches r3's pattern with 3 more module-load leaves added);
  1 passed (the same pre-existing, documented `control-passes` leaf; no new control introduced).
- Type gate: exactly the same 2 `TS2307` errors as every prior revision, no new errors.
- Patch apply-checked clean against both the cited HEAD (`7d61f56e`) and the original BASE.
- Handback artifacts: `1351-stage/1351-p15a2-red-r4.patch` (full diff vs BASE, both files),
  `1351-stage/1351-p15a2-red-r4-classification.json` (35 rows), this file. r1/r2/r3's own
  patch/classification files are left in place, unmodified, as the historical record.
