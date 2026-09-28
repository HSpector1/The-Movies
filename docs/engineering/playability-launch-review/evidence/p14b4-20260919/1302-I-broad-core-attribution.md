# 1302-I - broad core gate 1302 failure attribution

Task 1302-I, mode VERIFY (evidence reading and stdlib parsing only; no vitest/tsc/node/vite-node run, no
production or test edit). Executed source `993e6b010e7406ea783c2bd5cb420d7fc148aaad`; records published at
`42f216e8f1fa0a9f706640c783f19bf67c9c1e57`. This report attributes every one of the 498 failing cases in the
closed gate `1302-p4p5-broad-core` against the closed `1100-c3-final-core` baseline, using the identity method
recorded in `1119-A-c3-final-full-attribution.md`.

Raw gate log parsed: `1302-p4p5-broad-core.txt`, 30,130,336 bytes, SHA256
`bf48d14f26d62eed1e132edcb24381ad589cad38f78df8f08650bad5694c2510`. The file contains **no ANSI escape bytes**
(`\x1b` count = 0, confirmed by a full-file scan); the task brief's "ANSI colored, strip escapes" note does not
match the actual bytes, and no stripping was performed or needed. Baseline raw log re-parsed for this report:
`1100-c3-final-core.txt`, 683,789 bytes, SHA256 `5e2e00ea5278d420b318ec0f0c1635f2cb067998acbf9ba7fa1512de54469ac6`
(matches the value already recorded in `1119-A-c3-final-full-attribution.md`, confirming this is the same
evidence 1119-A analyzed).

## Method and identity extraction

Both raw logs end with a `Failed Tests N` section: `N` failing test titles printed as headers (` FAIL |core|
<file> > <describe...> > <leaf>`), each followed by its error text and stack frames, terminated by a
`⎯...[i/N]⎯` marker. Vitest groups consecutive leaves that share byte-identical error text under one
printed body (a "shared-header group"); the marker index counts printed **groups**, not individual failing
cases, so the marker's own numerator (1..63 for 1100, 1..329 for 1302) is smaller than the declared total (83,
498). A Python parser split each file on the marker regex, expanded every shared-header group into one row per
header, and verified the expanded row count against the header's own declared total and against the file's own
"Tests N failed" summary line:

| Run | Raw bytes | SHA256 | Declared failed cases | Parsed rows | Declared failed files | Distinct files in parsed rows |
|---|---:|---|---:|---:|---:|---:|
| 1100 baseline | 683,789 | `5e2e00ea...469ac6` | 83 | 83 | 34 | 34 (independently counted) |
| 1302 candidate | 30,130,336 | `bf48d14f...7e3d842` | 498 | 498 | 96 | 96 (independently counted) |

No duplicate identities within either run. Zero `Unhandled Error`/`Unhandled Rejection` markers in either raw
log (core gates only; the UI unhandled `hollywoodPerformance` error from 1119-A is out of this gate's scope).

**Identity** = the full header text after ` FAIL |core|  ` (file, describe chain and leaf title, exactly as
vitest prints it). **Primary** = the first non-empty message line before the first ` ❯ ` stack-frame line,
outer/line-trailing whitespace trimmed only (no alias, no digit-run normalization at the identity/primary
comparison stage; digit-run normalization was used only as a clustering aid, never for the RETAINED/CHANGED
verdict). **Frame** = the first stack frame whose path matches `(tests|ui/src)/....test.tsx?:LINE:COL` (the
first **test-file** frame, which is frequently a shared helper's own call site, not the deepest production
frame; `all_frames[0]`, the innermost frame regardless of path, was used separately to locate the actual
throwing/asserting source line for cause classification). RETAINED-SAME = same identity, byte-identical primary.
RETAINED-CHANGED = same identity, different primary. NEW = identity only in 1302. VANISHED = identity only in
1100.

## Top-line comparison to 1100

| Verdict | Cases |
|---|---:|
| RETAINED-SAME | 41 |
| RETAINED-CHANGED | 9 |
| NEW | 448 |
| VANISHED | 33 |

41 + 9 + 448 = 498 (all 1302 failures accounted for). 41 + 9 + 33 = 83 (all 1100 failures accounted for). Zero
unhandled-error markers and exactly two timeout cases in the 498 (both RETAINED-SAME, discussed under
Predictions below).

## VANISHED (33): not all are repairs

Of the 33 identities present in 1100 but absent from 1302's failing set, **11 belong to
`tests/bridge-p12-campaign-library.test.ts`**. That file is confirmed absent from gate 1302 entirely (no
` ✓`/` ❯ |core| tests/bridge-p12-campaign-library.test.ts` summary line anywhere in the raw log). It is
one of the six files `1296-A-bounded-regression-scope.md` records as excluded for unresolved Owner-provenance
(`tests/bridge-p12-campaign-library.test.ts`, lines 196/216, inherits an unresolved-provenance hold from
`p06-recovery.checkpoint.json.gz`), matching 1301-A/F's own stated scope ("417 core files minus the six 1296-A
exclusions"). **These 11 vanished identically because the file was never run, not because they were fixed.**

The other **22** are confirmed genuine passes: their containing files were independently found in the raw log's
per-file run summary with a whole-file `✓` (all tests passing) or, for the two files that still have other
(different) failures, a `❯` summary whose failing-leaf titles were checked and confirmed to be **different**
leaves than the vanished ones:

- `casting-sessions-save-v10.test.ts` (5 vanished, file now `✓ (6 tests)`), `d12-economy.test.ts`,
  `d14-star-power.test.ts`, `frozen-save-builder-projection.test.ts`, `p11-finance-report.test.ts` (2),
  `p12-starting-world.test.ts`, `p13b-s1-validation.test.ts` (2), `p13b-s2-validation.test.ts`,
  `p13b-s8-finance.test.ts`, `production-operations-save-v8.test.ts`, `roster-wall-artifacts.test.ts`,
  `ruling-a-development-in-play.test.ts`: all confirmed whole-file `✓` passes in 1302.
- `bridge-p14c2rm-retirement.test.ts` (2 vanished: "an actual release and real retirement preserve..." and
  "SYNTHETIC validated imported role-credit variant..."): file now shows `❯ (21 tests | 2 failed)`, but the
  2 current failures are confirmed to be **different** leaves ("natural retired tiers stay fixed..." and
  "SYNTHETIC imported newer edge withholds..."), both attributed below under C15/`p14c2rm-fixtures.ts:302`.
- `p14b4-cast-class-policy.test.ts` (2 vanished: "age 29"/"age 30" D3 entrant-anchor leaves): file now shows
  `❯ (7 tests | 1 failed)`, and the 1 current failure is a **different** leaf (`:452`, UNRESOLVED below).

All 22 of these vanished identities match the exact leaves 1119-A already attributed to a "historical-carrier
construction boundary" cause (mutating/stripping roots from the current carrier before calling frozen
old-version builders/validators, or age/provenance divergence against the live clock's starting values). This
attribution pass did **not** bisect the commit range between 1100's source
(`6e63f4c82a286dc67271cce0d53a0e586a6b523b`) and 1302's executed source (`993e6b010e7406ea783c2bd5cb420d7fc148aaad`)
to find the exact repairing commit for each; that range spans the full P13B/P14A/P14B/P14C/R2/R3 slice sequence
and a full bisection is outside this VERIFY-mode budget. Confirmed: genuine pass, not exclusion, not renamed
identity (see next paragraph). Repairing commit: **unknown**, flagged as a possible follow-up if the parent
wants it traced.

No VANISHED identity is explained by a leaf-title rename. `1301-E-parent-application.json` records
`"changedLinePairs": 188"` and the parent check `"all 188 changed line pairs differ only in digit runs"`; the
1301 patch changed no title text (spot-checked: `1301-C`/`1301-C2` describe explicit title updates only where a
title itself names the old literal, and the applied-patch parent check would have failed had anything besides
digits changed). Every VANISHED identity above is either excluded (1296-A) or a genuine pass; none is a
renamed-and-still-failing identity masquerading as VANISHED+NEW.

## RETAINED-CHANGED (9): three genuinely benign, four newly masked, two need review

| Identity (short) | 1100 primary | 1302 primary | Verdict |
|---|---|---|---|
| `bridge-p13b-r07-setup.test.ts` "extra pin" | expected 38 to be 37 | expected 40 to be 38 | Same stale-literal site tracked the version bump twice; cluster C10. |
| `bridge-p14c3-runtime.test.ts` R8 | Test timed out in 5000ms | expected 40 to be 38 (line 251) | **Masks the previously-documented R8 timeout** with an earlier stale-pin failure. Falsifies the letter of the 1301-A prediction for this identity (see Predictions). |
| `c2a-m2-sets-save.test.ts` x2 (NEW greenlight leaves) | V13 twin cannot discard profession transition... | expect(...).not.toThrow() but validateSaveV38 thrown | **Masks** the previously-documented V13-twin-discard cause (still real, per 1119-A) with an earlier `validateSaveV38` stale-selection failure (cluster C1). |
| `p14b1-trust-chooser.test.ts` test 7 | search premise failed: required natural authoring witnesses absent within 220 weeks | expected 1 to be less than 1 | Behavior genuinely changed: the natural search now finds a witness, but a boundary assertion (`< 1`) now equals its own bound. **Not a masked pin; flagged for independent review.** |
| `p14b4-cast-class-policy.test.ts` "natural rival policy" | expected ['provenP1'] to deeply equal ArrayContaining | expected length 1 but got 6 | Different failure shape (a scan now returns 6 candidates instead of 1). **Not traced to a source cause; flagged for independent review.** |
| `p14c3-canonical-rival-history.test.ts` L1/L2 x2 | L passive work premise ended without an obligation (the documented canonical-L1/L2 premise) | expected 40 to be 38 (line 144) | **Masks** the documented canonical-L1/L2 premise with an earlier `validateSaveV38` stale-selection failure (cluster C1). Falsifies the letter of the 1301-A prediction for this identity. |
| `world-first-scenery-load-in-provenance.test.ts` | Command failed... `--output .../studio-scenery-export-QfgVby` | Command failed... `--output .../studio-scenery-export-DJQ2ye` | Only the `mkdtempSync`-generated tmp-dir suffix differs; missing-PIL cause byte-identical. Matches the already-authorized 1119-A exporter-path exception exactly. Benign, expected. |

Four of the nine RETAINED-CHANGED cases (R8, both `c2a-m2-sets-save.test.ts` leaves, both `p14c3-canonical-rival-
history.test.ts` L1/L2 leaves) are **not new causes**: they are previously-documented, still-real 1100/1119-A
causes now masked by an earlier `validateSaveV38`/literal-pin failure introduced by the version bump. The
originally-documented causes are not shown to be fixed; they are simply unreached in this run.

## Cluster summary (NEW + RETAINED-CHANGED = 457 cases needing a cause; RETAINED-SAME = 41 already covered by
## 1100/1119-A)

Every row in `1302-I-failures.json` carries `cluster_id`, `cause_class` (a/b/c/e/f per the task's taxonomy, plus
`inherited` for RETAINED-SAME and `policy` for the one site whose correct fix is a design decision, not a
technical one) and a one-line `evidence` pointer to the confirming source read. Counts below are **exact leaf
counts**, never inferred from a cluster's file count.

| Cluster | n | Cause | One-line description |
|---|---:|---|---|
| C1 validateSaveV38/39-selection | 146 | a | Shared production helper `proveProfessionSave` (`src/core/save.ts:10294-10393`) throws `validateSaveV<N>: expected version N` because a test/helper hardcodes the validator **function name** `validateSaveV38`/`validateSaveV39` against a save the current writer actually wrote at version 40. Pin form: hardcoded validator selection, not a `.toBe(N)` literal or a `LIVE_SAVE_VERSION`/`PROJECTION_VERSION`/`BRIDGE_SCHEMA[...]` reference; outside all three 1301-A/F inventory classes by construction. 105 direct throws (75 via `validateSaveV38`, 30 via `validateSaveV39`, confirmed by frame counting) + 41 masked behind a `.toThrow(/other pattern/)` mismatch. Confirmed directly at `tests/contracts/phase-table-agreement.contract.test.ts:104` (`saveOf()`) and matches 1301-D's own retainedFinding for `tests/bridge-p14c2s-scientist-runtime.test.ts:99` ("validator selection ... pre-existing test defect, KEEP, attributed by the broad run"). Spans 23 distinct files. |
| C2 `envelope38` helper literal | 94 | a | `tests/helpers/p14c3-fixtures.ts:126`: `expect(result.saveVersion,'existing live writer moves coherently to38').toBe(38)` on `makeSave()` output. File is `tests/helpers/*.ts`, no `.test.ts` suffix, outside 1301-A's `git ls-files` filter `\.test\.tsx?$` over `tests/**`/`ui/src/**`; never scanned. |
| C3 `acceptedEvidence` helper literal | 47 | a | `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17`: `expect(saved.saveVersion).toBe(38)`. Same helper-file gap as C2, reached via `tests/helpers/p14c3-surface-fixtures.ts` and `tests/helpers/p14c3-canonical-rival-fixtures.ts` memoized wrappers. |
| C8 natural-fixture-search exhaustion | 42 | c | A bounded `while(steps<N) tick()` search throws/asserts when it never finds its target natural condition, across several distinct search targets in distinct files (`tests/p14b1-t4-regressions.test.ts:283` "no multi-beneficiary promise outcome... within 230 weeks", `tests/helpers/p14b2-fixtures.ts:264` "no natural rival-only promise outcome by 240", `tests/p14b4-cast-class-outcomes.test.ts:247` "UNEXECUTED natural rival prerequisites absent by350" x9, `tests/p14b4-rival-seating-preference.test.ts:343`/`:807` "UNEXECUTED natural premise..." x10). Grouped by shared **structure**, not a single proven shared root; not independently confirmed that every member routes through the same `firstTakeSubjects` guard as C7. 21 of the 42 are RETAINED-SAME (already failing this way in 1100), 21 are NEW. |
| C6 `v13TwinOf` historical-carrier premise | 25 | c | `tests/contracts/_v14Contract.ts:520`, `Module.v13TwinOf`: builds a "genuine V13 twin" by stripping later roots from the current carrier, then calls `validateSaveV13`. Now refuses earlier, at `validateSaveV12: state has unknown field "firstTakeSubjects"`, because the twin-builder was never updated to also strip the `firstTakeSubjects` root. Matches 1119-A's already-documented `v13TwinOf`/`_v14Contract.ts:469` family. |
| C4 `second-episode-fixtures` helper literal | 23 | a | `tests/helpers/p14c3-second-episode-fixtures.ts:27`: `expect(save.saveVersion).toBe(38)`. Same helper-file gap as C2. |
| C7 `firstTakeSubjects` migration guard | 23 | c | `src/core/promises.ts:144` `Module.appendFirstTakes`: `if (state.firstTakeSubjects === undefined) throw new Error('promises: migrate to Save40 before recording a first take')`, and `src/core/firstTakeSubjects.ts:21` `subjectForNewTake`: `'first take subject: missing issuing owner or concept'` via the same call chain. Guard introduced by commit `ef38cf9a` ("wip: checkpoint core opportunity predicates and prospective take subjects"; confirmed by `git log -L 140,148:src/core/promises.ts`). Callers (e.g. `tests/p14b5-t-failure-tuning.test.ts` `shoot()`) build/advance a `GameState` fixture that never acquired the `firstTakeSubjects` root. |
| UNRESOLVED | 20 | f | See "What remains unresolved" below. |
| C5 `history-boundary-fixtures` helper literal | 15 | a | `tests/helpers/p14c3-history-boundary-fixtures.ts:26`: `expect(saved.saveVersion).toBe(38)`. Same helper-file gap as C2. |
| RETAINED-INHERITED-FROM-1100 | 9 | inherited | Byte-identical primary to 1100; already attributed at 1100/1119-A time, not re-derived here. Includes the two timeouts (see Predictions). |
| C20 migration-purity / new root | 9 | c | A "nothing else changed by migration" byte-comparison (`canonicalJson(stripped-current) === canonicalJson(old)`) now fails because `current.state` also carries the `firstTakeSubjects` root (same commit as C7) that these comparisons' strip-lists don't know to exclude. Confirmed by direct source read at `tests/bridge-p14c2rm-runtime.test.ts:15-28` (`currentSlot()` strips only 6 named `careerLifecycle` fields, nothing at the `state` top level). Other members (`bridge-p14c3-promise-digest-continuity.test.ts:130`, `p14p3-directing-promises.test.ts:360`, `p14c3-save-v38.test.ts:53,66`) matched by identical JSON-prefix/structure, not independently re-derived line by line. |
| C9 `snapshotVersion`/`INCOMING_PROJECTION` 53-vs-55 | 8 | a | Two confirmed missed pin forms, live PROJECTION_VERSION now 55: (i) a bare wire-response property, `expect(response.snapshotVersion).toBe(53)`, confirmed at `tests/bridge-p13b-s4-office.test.ts:235` and `tests/bridge-r3n4-read-model-deltas.test.ts:351`; (ii) a **local named constant**, `const INCOMING_PROJECTION = 53` (`tests/bridge-p14b6-relationship-read-models.test.ts:100`), later compared symbolically (`expect(PROJECTION_VERSION).toBe(INCOMING_PROJECTION)`, line 758). 1301's own `classification.json` entry for this file (line 756) explicitly noted the L758 assertion "compares PROJECTION_VERSION to a local named constant INCOMING_PROJECTION, not a numeric literal" to justify leaving the it-title alone, but never flagged that the constant's own definition (line 100) is the stale literal. Confirmed the 1301 patch's only touch to this file (hunk `@@-757,7 +757,7@@`) changed the adjacent `LIVE_SAVE_VERSION` literal (38→40), not line 100 or 758. Neither pin form matches any of 1301-A/F's three inventory classes. |
| C15 frozen-validator-chain historical boundary | 7 | c | A test expects a **specific** downstream refusal (`.toThrow(/some named cause/)`) but an earlier frozen validator in the chain refuses first, with a different (often much older, e.g. `validateSaveV11`/`validateSaveV17`/`validateSaveV25`/`validateSaveV34`) message. Same structural family as C6/1119-A's historical-carrier-construction-boundary cause, at other specific historical versions. Includes `tests/helpers/p14c2rm-fixtures.ts:302` (`frozenTies`, "freeze premise: counterpart stays lawfully disclosed"). |
| C17 missing generated evidence fixture | 6 | c | `readFileSync('evidence/Playability-Interaction-01/fixtures/r3n1-dense-02/generated-r3n1-dense-02.checkpoint.json')` throws `ENOENT`. `evidence/` is gitignored (`.gitignore:30` `/Evidence/`, matches case-insensitively on this filesystem); the file was never generated in this environment. Three files (`tests/r3n1-stale-schedule-take-02{,p31,p32}.test.ts`), 2 leaves each. **All 6 are RETAINED-SAME**: this exact ENOENT already failed in 1100, unrelated to the version-literal work. |
| C16 `poachingFixture` term-length premise | 5 | c | `tests/helpers/p14b2-fixtures.ts:198`: `expect(publicPreferredTerm(state, talentId)).toBe(52)` receives `208` (both plausibly week counts, 1 vs 4 years). Not a version/schema literal; a business-logic fixture premise inside a shared `tests/helpers/*.ts` builder. **All 5 are RETAINED-SAME**: already failing this way in 1100, unrelated to 1301. Not traced to the responsible production function/commit. |
| C13 frozen prior-schema-id roster short by 2 | 5 | c | A hand-maintained array literal of prior protocol-4 schema-id SHA-256 hashes (e.g. `tests/bridge-runtime-checkpoint.test.ts:961`, `expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([<41 hardcoded literals>])`) is 2 entries short of the live roster (43), because PROJECTION_VERSION moved 53→54→55 (via 1301) without the frozen list gaining the two newly-retired prior ids. New ids must come from the committed generated artifact (per 1301-F Amendment 2), not be hand-authored; not a literal-only fix. |
| C10 `LIVE_SAVE_VERSION` missed pin forms | 3 | a | Three further pin forms outside all three 1301 inventory classes, live is 40: `save.LIVE_SAVE_VERSION` (namespaced, `tests/p14b1-save-v29.test.ts:110` and, per **1305-D's own flagged gap, independently confirmed RED here**, `tests/p13b-s7-announcements.test.ts:87`), and a locally-parsed JSON field (`const parsedSaveVersion = JSON.parse(saved.saveJson).saveVersion`, `tests/bridge-p13b-r07-setup.test.ts:587`, whose own comment reads "// the CURRENT live version"). None of the three appears among the 56 KEEP rows in `1301-live-pin-classification(.json/-addendum.json)` (checked). |
| C12 generator hash pin, needs re-measurement | 2 | c | `tests/bridge-contract-generator.test.ts:565,725`: byte/SHA-256 hash pins against generated C# output at the old projectionVersion. Matches 1301-D's own retainedFinding for `:564` verbatim ("needs its own re-measurement increment"); regenerating requires running `generateCsharpContract`, outside this task's authorized commands. |
| C18 `qualifyingRole` new field on promiseHistory | 2 | b | `tests/bridge-p14b1-promises.test.ts:301`, `tests/bridge-p14b3-promise-command.test.ts:517`: an inline `toEqual([{...}])` expected-object literal (11 keys, authored before the field existed) now receives a 12-key row with an extra `qualifyingRole:"cast"` field the production read-model gained since. Genuine intended-behavior-change-leaves-old-expectation cause, confirmed directly by source diff. |
| C14 `migrateToVNN` downgrade-regex stale version | 2 | a | `expect(fn).toThrow(/^migrateToV37: cannot downgrade.../)` but the live migrator now throws `migrateToV39: cannot downgrade...` (`tests/p06a-w1-release-authority.test.ts:444`, `tests/p13b-s3-save-v23.test.ts:112`). The expected regex hardcodes an old target-version number inside a function name inside a `/regex/` literal; outside all three 1301 classes. |
| C16b `rivalWinner208` fixture premise | 2 | c | `tests/helpers/p14p3-fixtures.ts:1059`: "fixture premise: the same fixed rival really wins the later focus case" fails. Same shared-natural-fixture-premise family as C16, not independently traced further. |
| C11 deliberate 38-pin, now contradicted | 1 | policy | `tests/p14b8-waiver-surface-oracle.test.ts:177`: `expect(...,"B.8 moves no save law; a bump here is a plan amendment, not an implementation detail").toBe(38)`. Per 1305-D (citing the 1305-C sweep), this is a **known, deliberate** 38 pin, explicitly excluded from that sweep's own corrections because B.8's own slice does not move save law. The live version moved anyway, via other slices. This is a scope/design question (does the assertion mean "B.8 itself" or "the system state after B.8"), not a routine stale-literal fix. **Recommend Owner/parent judgment, not a mechanical correction.** |
| C19 masked throw-pattern mismatch (misc) | 1 | c | `expect(fn).toThrow(/pattern/)` receives a different actual error; the specific underlying cause was not independently traced beyond the message shown for this one row. |
| RETAINED-benign-tmp-suffix | 1 | c | The `world-first-scenery-load-in-provenance.test.ts` RETAINED-CHANGED case; see the RETAINED-CHANGED table above. |

Total classified with a named, source-confirmed or source-consistent cause: 478 / 498 (96.0%). Genuinely
unresolved: 20 / 498 (4.0%).

## What remains unresolved (20 cases, 18 NEW + 2 RETAINED-CHANGED)

No dominant shared signature was found among these after the clustering above; each needs its own source trace
beyond this pass's budget. Listed by file so a follow-up can target them directly:

- `tests/bridge-p14b1-promises.test.ts:400` and `tests/bridge-p14b3-promise-command.test.ts:180`: both
  `expect(quote.ok).toBe(false)` receiving `true`, same file family as C18 but a different assertion
  (promise-quote classification, not the `qualifyingRole` field). **Possibly a real classification-logic
  change; flagged for independent review**, not folded into C18 without confirming the actual cause.
- `tests/bridge-p14b2-checkpoint.test.ts:65`, deep-equal object mismatch (contents not compared here).
- `tests/bridge-p14b5-relationships.test.ts:351,510(x2),527,530`: five distinct assertions in one file (two
  SHA-256 mismatches, two array-length-off-by-one, one empty-vs-nonempty array). Not traced to a shared cause.
- `tests/bridge-schema.test.ts:576`: generated-C#-contains-text assertion; likely the same generator-artifact
  family as C12 but not independently confirmed at this exact line.
- `tests/p13a-scientist-foundation.test.ts:32` (x3): three SHA-256 mismatches, one throwing frame,
  parameterized/looped; likely a single fixture-hash cause, not traced.
- `tests/p14b1-trust-chooser.test.ts:338,620(x2)`: `338` is a distinct string-value mismatch
  (`'compensation'`/`'opportunity'`); `620` is the RETAINED-CHANGED "expected 1 to be less than 1" case already
  flagged for independent review above.
- `tests/p14b4-cancel-causal-proof.test.ts:418`, `tests/p14b4-cast-class-capacity-evaluator5.test.ts:239`: both
  classification-label mismatches (`'IMPOSSIBLE'`/`'FRAGILE'` family); possibly related to each other (same
  causal-classification subsystem), not confirmed.
- `tests/p14b4-cast-class-policy.test.ts:452`: the RETAINED-CHANGED "length 1 but got 6" case already flagged
  above.
- `tests/p14b4-ready-replay-stale-target.test.ts:234`: `'workLimit'`/`'commandRefused'` string mismatch.
- `tests/p14b4-rival-seating-preference.test.ts:483,498,622,690`: four distinct assertions in one file, not
  traced to a shared cause with each other or with the file's own C8/C9-family failures.
- `tests/p14b5-relationships.test.ts:544`: one more SHA-256 mismatch, not confirmed same fixture family as the
  bridge-p14b5-relationships.test.ts ones above.
- `tests/p14b8-waiver-surface-oracle.test.ts:239`: string-value mismatch (`'what remains of the contract cannot
  r...'`, both sides truncated identically in the raw, not diffed further here).
- `tests/p14c2b-save-v36.test.ts:103`: `expect(fn).not.toThrow()` but `migrateToV39: cannot downgrade...` is
  thrown; likely the same historical-substrate-boundary family as C6/C15/C14 but not confirmed at this exact
  site.
- `tests/p14c3-promise-digest-continuity.test.ts:194`: object-shape mismatch (`bottleneck: null` vs a populated
  object).

None of these 20 was assigned a cause by guessing from message text alone; each was checked against the
LOC_MAP/pattern rules above and found not to match. A closer per-line source trace (git blame on the specific
assertion, or reading the called production function) would very likely resolve most of them into the existing
clusters or reveal genuine new ones; that trace is outside this attribution pass's read-only, no-code-execution
budget.

## Clusters flagged as possible production regressions for independent review

Per the task's instruction to flag, not classify, any cluster that could indicate a real defect:

1. **`p14b1-trust-chooser.test.ts` test 7** (RETAINED-CHANGED): behavior genuinely changed from "no witness
   found" to "witness found, but a `< 1` boundary assertion now equals its bound exactly." Not a masked pin.
2. **`p14b4-cast-class-policy.test.ts` "natural rival policy"** (RETAINED-CHANGED): a scan that returned exactly
   1 candidate in 1100 now returns 6. Not a masked pin.
3. **`bridge-p14b1-promises.test.ts:400` / `bridge-p14b3-promise-command.test.ts:180`**: `quote.ok` flips from
   the test's expected `false` to `true` for a case titled "a non-P1 family is refused... before any pipeline
   check runs." If the classification logic genuinely stopped refusing this case, that is a candidate real
   regression in promise-quote refusal, not a fixture or version-literal artifact.
4. **`bridge-runtime-checkpoint.test.ts:972`/C13 family**: confirmed benign (hand-maintained roster genuinely
   short by exactly the two projection bumps 1301 introduced), listed here only to be explicit that it was
   checked and is **not** flagged.

None of these four were confirmed as defects; each needs the specific production function traced (not done
here, per the VERIFY-mode, no-execution boundary) before calling it a regression.

## Prediction scoring against `1301-A`'s "Pre-registered predictions"

- **"None of the 1301-changed sites fails at its changed line."** Spot-checked against the actual patch hunks
  (`1301-live-pin-maintenance-final.patch`) for three files that DO fail nearby (`tests/bridge-p13b-s4-
  office.test.ts`, `tests/bridge-p14b6-relationship-read-models.test.ts`, `tests/bridge-r3n4-read-model-
  deltas.test.ts`): in every case the 1301-changed line (a `LIVE_SAVE_VERSION`/`PROJECTION_VERSION` literal)
  now asserts correctly and passes; the failure is at a **different, untouched** line in the same or an
  adjacent hunk (e.g. `snapshotVersion`/`INCOMING_PROJECTION`, C9). **Not falsified** in the spot-checked sample;
  not exhaustively checked against all 188 changed line pairs across 74 files, but structurally expected to hold
  everywhere, since every confirmed cause in this report (C1-C20) lives in a pin **form** (a validator function
  name, a helper-file literal, a local named constant, a `saveJson`-parsed variable, a regex literal) that all
  three of 1301-A/F's inventory classes exclude by construction.
- **"Inherited identities... recur with the same primary."** **Partially falsified.** The two RETAINED-SAME
  timeouts (`bridge-p13-campaign-isolation.test.ts` 60000ms, `bridge-runtime-checkpoint-prepared-reuse.test.ts`
  20000ms, matching 1119-A's FU-2 family) and the missing-PIL scenery-export failure (RETAINED-CHANGED, benign
  tmp-suffix only) do recur unchanged as predicted. But the documented canonical-L1/L2 premise
  (`p14c3-canonical-rival-history.test.ts`) and the R8-family timeout referenced by name in the prediction
  (`bridge-p14c3-runtime.test.ts`) do **not** recur with their original primary: both are now masked by an
  earlier `validateSaveV38` stale-selection failure (C1), at a line before the code path that produced the
  documented cause is ever reached. The prediction's own escape clause ("A vanished identity needs its repairing
  record named") does not quite fit here either, since these are RETAINED-CHANGED, not VANISHED; the underlying
  1119-A cause is not shown fixed, just unreached.
- **"Every `tests/p14p4p5-*` leaf that passed in its isolated Q gate passes here."** **Confirmed.** Both
  `tests/p14p4p5-opportunities.test.ts` (10 tests) and `tests/p14p4p5-writer-resources.test.ts` (2 tests) show a
  whole-file `✓` in the raw log; no collection-order/parallel-interference signal.
- **"Sites left unchanged under rule 3 may fail. Each such failure is attributed individually, never bulk-
  labelled."** **Confirmed, not violated.** 18 of the 37 files containing at least one 1301 KEEP-classified row
  cross-referenced against `1301-live-pin-classification.json` + `-addendum.json` also contain at least one 1302
  failure (file-level overlap, not proof that the specific KEEP line itself is the failing one in every case;
  every failing row nonetheless carries its own individual `cluster_id`/`cause_class`/`evidence` in
  `1302-I-failures.json`, never a bulk file-level label).

## Limits

No project code, compiler, vitest, node or vite-node was run to produce this report; every claim above traces to
a cited byte range of the two raw logs, a cited source line read with `Read`/`sed`/`grep`, a cited classification
row in `1301-live-pin-classification(.json/-addendum.json)`, or a cited `git log`/`git blame`-style read-only
command. Cause classification for the 20 UNRESOLVED rows is honestly absent, not guessed. Several clusters (C8,
C15, C16, C16b, C19, C20's non-primary members) group failures by **shared structure or shared message pattern**,
not by an independently re-derived shared root cause for every member; those are flagged as such in their
description and should not be read as proving one production commit explains every member. The VANISHED "22
genuine passes" are confirmed by whole-file/different-leaf raw-log evidence, but the specific repairing commit
for each is not identified (the 6e63f4c8..993e6b01 range is large; a full bisection was outside this pass's
budget). No native, Unity, UI, or campaign-isolation testing occurred; this report is core-gate raw-log and
source-read attribution only.

## Recommended next increments, grouped by cause (not authorizing or scheduling any of them)

- **Cause (a), literal-only, largest leverage first:** extend the 1301 pin-inventory grep to also scan
  `tests/helpers/**/*.ts` (not just `*.test.ts(x)`) for the same three patterns plus a fourth: hardcoded
  `validateSaveV<N>`/`migrateToV<N>` function-name references (C1, C14), a `saveJson`/`saveVersion`-derived
  local variable compared to a literal regardless of variable name (C10), and a locally-defined named constant
  (e.g. `INCOMING_PROJECTION`) whose own `const X = N` definition line is itself stale (C9). This would resolve
  C1-C5, C9, C10, C14 (a total of 341 of the 498 rows) with the same literal-only, no-compiler-run discipline
  1301-C already used.
- **Cause (c), needs a re-measurement/regeneration step (out of literal-only scope):** C12 (generator hash pin)
  and C13 (frozen prior-schema-id roster) both need the actual generated schema/contract artifact re-read after
  a real `generateCsharpContract`/schema-generation run, per 1301-D's own retainedFinding; not a text edit.
- **Cause (c), needs an actually-admitted historical substrate (per 1119-A's own stated requirement):** C6 and
  C15 both need the historical-carrier-construction helpers (`v13TwinOf`, and the per-file V25/V34/V17 frozen-
  chain builders) updated to also account for the `firstTakeSubjects` root (and any other root added since they
  were authored) before mutating/stripping toward an old shape.
- **Cause (c), production-guard-vs-fixture gap:** C7, C8's structural members, and C20 all trace to the same
  `firstTakeSubjects` root (commit `ef38cf9a`). A dedicated increment should confirm, per search/fixture, whether
  the base `GameState` fixtures these tests build need to acquire `firstTakeSubjects` via proper migration
  (fixture fix) or whether the guard's own scope needs review (production question); this report does not decide
  which.
- **Cause (c), environment-only:** C17 needs the `evidence/Playability-Interaction-01/fixtures/r3n1-dense-02/`
  generator run (out-of-band, gitignored) before this environment can pass those 3 files; not a test defect.
- **Policy, not a routine fix:** C11 (`tests/p14b8-waiver-surface-oracle.test.ts:177`) needs an Owner/parent
  decision on what the deliberate 38-pin is supposed to mean now that the system-wide version moved via other
  slices.
- **Independent review before any fix:** the four items under "possible production regressions" above.
- **Dedicated per-line trace:** the 20 UNRESOLVED rows listed above, plus the 22 genuinely-vanished identities'
  repairing commits if the parent wants provenance.

No repair, rerun, filter, timeout change or weakened assertion is proposed or performed by this report.
