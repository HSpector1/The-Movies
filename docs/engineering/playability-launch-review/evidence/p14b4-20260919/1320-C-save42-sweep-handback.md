# 1320-C — Save42 test pin sweep: handback

Role: independent test engineer. Repo `/Users/zacheryspector/The-Movies-headless-program`,
branch `wip/headless-program-20260916-ts`, base commit `1c5a4d9d` (verified equal to origin at
task start). Method: scratch tree built via `git archive` of `1c5a4d9d` + `git init` + base
commit `bbdb52b` ("1320-C scratch base at HEAD 1c5a4d9d"), `tests/fixtures`, `docs`,
`node_modules` symlinked read-only, never copied. All edits made only in that scratch tree at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/<session>/scratchpad/1320-work/tree`.
No production code, fixture payload, `tsconfig`, or `vitest.config` file was touched. No commit,
no worktree, no edit inside the real repository's `tests/` or `ui/` trees.

## Deliverables

- `E/1320-stage/1320-save42-sweep.patch` — cumulative diff, base `1c5a4d9d` (via `bbdb52b`),
  131 files (126 under `tests/`, 5 under `ui/`), 603 insertions / 500 deletions.
  **Verified**: `GIT_INDEX_FILE=<tmp> git read-tree 1c5a4d9d && git apply --check --cached
  <patch>` from the real repo root — `read-tree` exit 0, `apply --check` exit 0.
- `E/1320-stage/1320-save42-sweep-classification.json` — 500 rows, schema
  `{file, line, old_text, new_text, class, cause, note}`, one row per edit or per
  investigated-and-deliberately-untouched item.
- This file.

## Changes by class (500 classification rows; 494 are actual edits, 6 are `none`-class
investigation/documentation rows for items deliberately left unchanged)

| class | count | description |
|---|---|---|
| S1 | 256 | live validator/converter selection (`validateSaveV41`→`V42`, `saveApi('validateSaveV41')`→`'V42'`, contract `requireFunction` name lookups) |
| S1/S2 | 4 | combined S1 rename + adjacent literal bump in one hunk |
| S1/S4 | 1 | combined |
| S1/S5 | 1 | combined |
| S2 | 127 | live literals (`.toBe(41)`→`42`, bare `saveVersion: 41` object fields, stale test titles, the `film-chronicle.test.ts:923` silent-skip guard) |
| S3 | 36 | future-version sentinels (14 files: `saveVersion: 42`→`43`, `unknown saveVersion 42`→`43`, `1 through 41 only`→`1 through 42 only`, titles) |
| S4 | 37 | live-to-V40-and-older hand-chained converters, manual `convertV42ToV41` insertion |
| S5 | 14 | migration/deep-equal comparisons needing a `sharedCompetitions: 0` sibling helper beside the file's own `withRivalTermination` |
| S6 | 10 | hand-built relationship edges/types needing `sharedCompetitions` added |
| S7 | 6 | catalogue/shape pins (`RELATIONSHIP_DRIVER_KINDS`→`_V31`) |
| S9 | 2 | first-downgrade-guard masking: a bare `saveVersion` relabel on a genuine V42 state left `sharedCompetitions` in place, so the frozen V31 relationship reader refused before the leaf's own intended promise-shape cause fired (`tests/p14p3-directing-promises.test.ts:324,641`, D13/D12) |
| S10 | 0 | natural-chain values — **none found needing a pin move**; not applicable to this sweep |
| none | 6 | investigated, deliberately left unchanged — see "Unresolved items" below |

Files touched: 131 (126 `tests/`, 5 `ui/`).

## Commands actually run and their output

Type gates (final round, after the last edits — background tasks `bofjk3mmq`):
```
cd <tree> && npx tsc -p tsconfig.json --noEmit        # exit 0, empty output
cd <tree> && npx tsc -p tsconfig.bridge.json --noEmit  # exit 0, empty output
cd <tree> && npx tsc -p ui/tsconfig.json --noEmit      # exit 0, empty output
```
Three earlier tsc rounds (`tsc-root-1..6.txt`, `tsc-bridge-1.txt`, `tsc-ui-1..2.txt` in the
scratch dir) each caught and fixed a real TS2345/TS6133 error (documented in the classification
rows for `tests/p14c2rm-writer-continuation.test.ts:247`, `tests/p14c3-transitions.test.ts:14`,
`tests/p14p4p5-screenplay-status.test.ts:320`).

Vitest, one process at a time, targeted files only (never the full core suite — reserved for the
parent):
- Every individually-edited helper/leaf file was run standalone at least once after its own fix
  and confirmed passing (`p14c3-transitions.test.ts` 35/35, `p14p4p5-opportunities.test.ts`
  10/10, `bridge-p14p4p5-opportunities.test.ts` 3/3, the five S5 migration-comparison files
  1/1 each, `p14b5-relationships.test.ts` 45/46 — the 1 remaining is a pre-existing RETAINED-SAME
  hash mismatch at line 546, confirmed out of scope via `1320-M`, `bridge-p14b5-relationships.test.ts`
  13/15 — 2 fixed by me, 5 pre-existing RETAINED-SAME "family 12" failures confirmed untouched,
  `p14b5-t-failure-tuning.test.ts` 1/1 target row fixed, 11 pre-existing failures untouched,
  `p14bf2-acting-discipline.test.ts`, `p14b3-rule-revision.test.ts`, `p14r3-save-v41.test.ts`,
  `bridge-p14c2s-scientist-runtime.test.ts`, `bridge-p14r2r3-prior55.test.ts` all clean in a
  9-file batch run).
- A repo-wide re-scan (`scan2.py`) plus dedicated `grep` passes for bare `saveVersion: 41`
  literals and `!== 41`/`=== 41` guards found several sites the per-file review missed; each is
  documented in its own classification row with the grep/tsc evidence that found it.
- Final 6-file targeted batch (`vrun6.txt`, background task `brp9v262j`): `bridge-p14p3-directing-promises.test.ts`,
  `p14c3-save-v38.test.ts`, `p14b9-save-v42.test.ts`, `p14c3-canonical-rival-history.test.ts`,
  `c2a-m2-sets-save.test.ts`, `p14p3-directing-promises.test.ts` — 5 failed | 1 passed (files),
  19 failed | 73 passed (tests). Every one of the 19 failures was individually triaged (below);
  3 were real remaining defects in files I'd already partially fixed (D17, D13, D12) and were
  fixed in this session; the rest were confirmed pre-existing/out of scope by direct comparison
  against `E/1316-I-failures.json` and `E/1320-M-save42-fallout-rows.json`.
- Final re-run after the D17/D13/D12 fixes (`vrun7.txt`, background task `bzapl6w7v`):
  `tests/p14p3-directing-promises.test.ts` + `tests/bridge-p14p3-directing-promises.test.ts` —
  **1 file failed | 1 file passed (2)**, **3 tests failed | 20 passed (23)**.
  `bridge-p14p3-directing-promises.test.ts`: **3/3 pass** (D15, D16, D17 — D17 confirmed fixed).
  `p14p3-directing-promises.test.ts`: D13 and D12 now **pass** (confirmed fixed); D14, D07, D18
  remain failing — all three confirmed pre-existing/out of scope (below), not new regressions.

## The most consequential single finding: a silent test-vacuity bug

`tests/film-chronicle.test.ts:923` had `if (restored.saveVersion !== 41) return;`. Since
`restored.saveVersion` is now genuinely 42, this stale guard caused an **unconditional early
return that silently skipped every assertion below it** (the `buildFilmChronicle` comparison,
`stableStringify`, `rngState` checks) without the test ever failing. This is a false-pass, not a
false-fail — the kind of gap that would have let the sweep "succeed" while actually testing
nothing in that block. Fixed: `!== 42`.

## A near-miss in my own process

I had written classification rows early on claiming `tests/p13b-s5-save-v24.test.ts` received the
S3 sentinel fix, but the file was accidentally omitted from the bulk-fix script's file list — the
fix was claimed but never applied to disk. Only caught via a final re-verification grep. Fixed
immediately. Recorded here because the classification JSON's early rows for this file are
retroactively true (the fix is now actually on disk) but the process gap itself is worth
surfacing: classification-row claims must be checked against actual file bytes at the end, not
trusted from memory of "I added this file to a list."

## Unresolved items — genuine, pre-existing, non-Save42 defects exposed by unmasking

These are **not** Save42 pin-sweep defects and I did not attempt to fix them (no production code
change, no loosened expectation, no S1–S10 class applies). Each was masked at 1316 by an earlier
Save42-caused failure in the same leaf; fixing that earlier failure (correctly, in scope) exposed
a second, older, unrelated defect one assertion later in the same test body.

1. **`tests/p14c3-save-v38.test.ts:72`** (4 `it.each` leaves: created-week0, preretirement-week207,
   retired-week208, runtime-current208). `migrateToLive(old)` on a genuine V37 fixture produces a
   state carrying `firstTakeSubjects` (introduced at V40 by `convertV39ToV40`,
   `src/core/save.ts:10492-10497` — read directly, confirmed pre-Save42). The comparison's
   expected side (`withRivalTermination(withSharedCompetitions(old.state))`) never had this field
   and no existing wrapper adds it. `diffkeys()` (a small python structural-diff script against
   the vrun6 Expected/Received JSON) confirmed this is the **only** structural difference.
2. **`tests/p14c3-save-v38.test.ts:79`** (`exposes matching strict38 conversion...` leaf):
   `expect(stableStringify(migrateToLive(old))).toBe(stableStringify(converted))` where
   `converted` is permanently pinned at V38 and `migrateToLive` always tracks whatever is live
   (38 at authoring time, 41 at 1316, 42 now). Structurally broken since V39 shipped; 1316's own
   primary already showed this exact class of mismatch, just with `...41...` instead of `...42...`
   in the text. No version-literal or validator-selection pin move can restore verbatim-1316 text
   here without changing the assertion's own logic.
3. **`tests/p14p3-directing-promises.test.ts:366`** (D14): same family as items 1–2. Comparing a
   genuine, sha-pinned V38 fixture's raw state string against `migrateToLive(old.save)`'s state
   string. `diffkeys()` against the vrun7/vrun6 Expected/Received blobs shows three co-mingled
   pre-existing gaps at once: `firstTakeSubjects` (V40), `termination` on every rival business
   period (V41), and `sharedCompetitions` on every relationship edge (V42). Even a Save42-scoped
   partial fix (adding only `sharedCompetitions`) would not make this assertion pass, since the
   other two gaps predate Save42 and remain. D14's remaining assertions (lines 367–370: promises/
   firstTakes/careerLifecycle/rngState equality) are unreached while this line fails first and
   were not further assessed.
4. **`tests/p14p3-directing-promises.test.ts` D07/D18** (`fixture premise: the same fixed rival
   really wins the later focus case`, `tests/helpers/p14p3-fixtures.ts:1085` inside
   `rivalWinner208()`). Confirmed via direct comparison against `E/1320-M-save42-fallout-rows.json`:
   `status_vs_1316 = RETAINED-SAME`, primary text byte-identical to what the final run shows.
   Never masked by a Save42 pin — already failing, at the same place, before Save42 landed. `git
   diff` against the base commit confirms `rivalWinner208()` itself was never touched by this
   sweep (only the unrelated `futureSave()` function in the same helper file was edited).

## Two resumed-correctly cases worth distinguishing from the above (zero fix needed, confirmed)

5. **`tests/c2a-m2-sets-save.test.ts`** (both leaves, `:230:18` and `:286:39`): a genuine success
   case. 1320-M classified both `RETAINED-CHANGED`, masked behind a Save42 sentinel
   (`validateSaveV41: expected vers…`). After the sweep, both now fail with
   `validateSaveV12: state has unknown field "firstTakeSubjects"` via
   `tests/contracts/_v14Contract.ts:520` (`v13TwinOf`) — verified **byte-identical**, full string
   compare, against `E/1316-I-failures.json`'s own recorded `primary` field for both frames. The
   mask cleared as a side effect of fixes elsewhere in the shared `_v14Contract.ts` call chain;
   this file itself needed no direct edit.
6. **`tests/p14c3-canonical-rival-history.test.ts`** (all 6 leaves: K1–K4, L1, L2): resumes at the
   same frame, same assertion shape, and the **same golden expected hash**
   (`2f9ec0fa289a28a188428f9caa59ba969c50f…`, the untouched `CANONICAL_INITIAL_SHA` pin — fixture
   payloads are out of scope) as 1316. Only the *received* hash text differs between 1316
   (`53d1afb4…`) and now (`a7d0034f…`), which is expected and correct: `sha(exportSave(makeSave(state)))`
   is a function of the live save format and will legitimately shift whenever the live version
   changes, independent of any test edit. `grep` confirmed zero `validateSaveV41`/`.toBe(41)`/
   `convertV41` references anywhere in this test file or its helper — nothing to fix.

## S9/S10 pre-declaration

- **S9** (first-downgrade-guard masking): pre-declared as a risk for any raw/manual
  `saveVersion` relabel of a genuine live save feeding a frozen validator directly (bypassing the
  real production downgrade chain). Found and fixed 2 instances
  (`tests/p14p3-directing-promises.test.ts:324` D13, `:641` D12) — both relabeled a real V42 save
  to `saveVersion: 38` without projecting relationships to era 31 first, so the frozen V31
  relationship reader refused on the unrelated `sharedCompetitions` field before the leaf's own
  intended promise-shape refusal could fire. Fixed via `core.relationshipsAtV31(...)` (the same
  production helper `validateSaveV42` itself uses internally, re-exported from
  `src/core/index.ts`) — an import of an existing export, not a production code change. Verified:
  line 325's `api.convertV39ToV38(save)` (the real, full downgrade chain) on the same fixture did
  **not** fail, confirming the diagnosis was isolated to the manual-relabel call sites only.
- **S10** (natural-chain values): none found needing a pin move in this sweep. No natural-chain
  week/tick/id selector depended on a value that Save42 shifted.

## UI

All 12 files identified in `1320-M2` were addressed. `ui/src/screens/StudioCalendar.career.test.tsx:29`
was resolved **transitively** (its dependency `acceptedEvidence()` in
`tests/helpers/p14c3-genuine-evidence-fixtures.ts` was fixed directly) — not independently
re-verified by a dedicated UI vitest run in this pass; `ui/tsc --noEmit` is clean (exit 0) both
before and after, but that only proves type-level correctness, not runtime pass/fail for this one
file. `ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx:1929` was **explicitly not touched**,
per the plan's own instruction that the parent re-measures it after the sweep before any change.

## Explicit named-exception files (from the plan)

- `tests/p14r3-save-v41.test.ts` and the `prior-55` inputs: surgical edit distinguishing
  fresh/live-derived assertions (fixed: lines 121, 211, 216, 224–225, 342–343, 374) from genuine
  V40-fixture-derived assertions (left untouched: lines 253, 281–282, 358, 365, 369, 385, 393,
  410, 425 — all genuine V40→V41 migration output types/values). One additional stale test
  **title** (not logic) was found and fixed in this final pass: line 210,
  `'LIVE_SAVE_VERSION === 41'` → `'LIVE_SAVE_VERSION === 42'` (the body already correctly asserted
  `.toBe(42)`; only the title text was stale/misleading).
- `tests/p14b5-t-failure-tuning.test.ts` ("one frozen validateSaveV31 fed a live edge"): traced to
  `validateRelationshipsRoot`'s implicit era-31 default being called on real engine-produced,
  already-live-shaped state — not a literal call to a function named `validateSaveV31`. Fixed by
  passing explicit era `42` at the 4 call sites that needed it.
- `tests/p14c3-transitions.test.ts` ("one downgrade regex"): needed the full explicit downgrade
  chain (`convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42ToV41(...)))))`)
  since the local 4-key `SaveAPI` type couldn't express it via `saveApi('convertV38ToV37')` alone.
  Verified: 35/35 pass.

## Cleanup

Scratch tree copies remain at
`/private/tmp/claude-501/.../scratchpad/1320-work/tree` for the parent's own inspection if
needed; this is session-scoped scratch space, not part of the repository, and will be removed
per the plan's "the author removes its own copies at the end" instruction once the parent
confirms the patch/classification/handback are sufficient (removing it before that would destroy
the only copy of the verified diff's working tree if the patch needs re-derivation).

## What the parent still needs to measure (explicitly not done here, per the task contract)

- The full core suite run confirming the 151 retained failures now equal
  `E/1316-I-failures.json`'s set **with their exact 1316 primaries**, except the 6 items
  documented above under "Unresolved items" / "resumed-correctly cases" (2 files whose primary
  text legitimately differs from 1316's stale text for measured, disclosed reasons; 3 leaves in 2
  files with a newly-exposed-but-pre-existing secondary defect one assertion later; 2 leaves
  confirmed RETAINED-SAME and never masked).
- The full UI suite run for `1317`'s retained set, in particular independent (not transitive)
  confirmation of `StudioCalendar.career.test.tsx` and the parent's own re-measurement of
  `WorldFirstLotNativeNextEventApp.test.tsx:1929`.
- No new identity check across the whole diff (I verified no new identities in every file I
  directly ran via vitest, but did not run the full suite, per the task's explicit reservation of
  that run to the parent).
