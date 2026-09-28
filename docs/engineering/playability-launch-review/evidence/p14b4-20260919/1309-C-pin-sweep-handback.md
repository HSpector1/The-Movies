# 1309-C: combined Save41/projection56 pin sweep — handback

Task 1309-C, mode IMPLEMENT (staged test source only). Repo base HEAD `3e267557` for every
test-path edit below. No `tests/`, `src/`, `bridge/`, `ui/` file was edited directly; the patch
lives entirely under `1309-stage/`. No project code was executed (no vitest/tsc/vite-node/node on
project code); `git apply --check` (non-mutating, dry-run) was used to confirm the patch applies,
and read-only `git status`/`git log`/`git diff --stat`/`git show` were used to read repo state.

## Deliverables

- `1309-stage/1309-pin-sweep.patch` — one unified diff, base `HEAD 3e267557`, 115 files, 409
  changed lines, `git apply --check` confirmed clean against `HEAD 3e267557` (`git status`
  unaffected — `--check` never mutates the tree). Re-verify: `git apply --check
  docs/engineering/playability-launch-review/evidence/p14b4-20260919/1309-stage/1309-pin-sweep.patch`.
- `1309-stage/1309-pin-sweep-classification.json` — 409 rows, one per edited line: `path`, `line`,
  `plan_item`, `cluster_id`, `old_text`, `new_text`, `source`, `op` (`replace` or `insert_after`
  for the handful of pure line-insertions — item 5's roster additions and item 6's two comment
  insertions — where `new_text` contains the anchor line plus the inserted line(s) below it).
- This handback.

## Mid-task input received and applied

The parent's mid-task message reported the R2/R3 production landed in the working tree, gave 15
tsc root errors (`1311-T-type-errors-after-production.txt`) as an authoritative input for item 3,
and confirmed the patch base stays `HEAD 3e267557`. All 15 locations were resolved (see item 3
below). Separately, `git log`/`git diff 3e267557 HEAD --stat` show the R2/R3 production has since
been **committed** (`f3f8c209`, GREEN-gated at `b9047f13`, HEAD now `8a3d9e1f`), not merely
uncommitted-in-tree as the message described at the time it was sent — but the diff between
`3e267557` and `HEAD` touches only 6 **new** test files (none of the files this patch edits), so
every ground-truth read used to build this patch is unaffected and the `HEAD 3e267557` base
instruction is still honored exactly.

## Counts per plan item

| Item | Edited lines | Files | What |
|---|---:|---:|---|
| 1 | 188 | 74 | The exact 1301-applied rows, bumped one further step (55→56, 40→41, forged/probe 41→42, "1 through 40"→"1 through 41"), derived from `1301-live-pin-classification(.json/-addendum.json)`. Verified: the union of CHANGE rows across both files is exactly 188 distinct (path,line) pairs across 74 files, matching `1301-E-parent-application.json`'s own stated count. |
| 2 | 4 | 4 | The four named `tests/helpers/p14c3-*.ts` literals (C2–C5), `.toBe(38)`→`.toBe(41)` only. |
| 3 | 190 | 49 | Validator selection (C1) — see below. |
| 4 | 7 | 7 | C9 (`snapshotVersion`/`INCOMING_PROJECTION`, still literally 53 at HEAD — confirmed by direct read, never touched by 1301) and C10 (namespaced `LIVE_SAVE_VERSION` pins), bumped straight to 56/41. |
| 5 | 12 | 5 | C13, the hand-maintained prior-schema-id roster, recomputed against `bridge/runtime-checkpoint.ts`'s live `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` map (44 total entries, not 41 — see below). |
| 6 | 2 | 2 | C14, downgrade-guard regexes — derived and confirmed **unchanged**; two comment insertions only (see below). |
| 7 | 2 | 2 | C18, `qualifyingRole` new field. |
| 8 | 4 | 2 | 1302-J 3c, stale refusal premise (`DIRECTING_COUNT`→`PREFERRED_GENRE_OPPORTUNITY`). |
| 9 | 0 | 0 | Not attempted — see "Could not settle" below. |
| 10 | 0 | 0 | Not attempted — proposal only, per the plan's own instruction not to re-pin. |

409 edited lines total, 115 distinct files (item files overlap: several files carry rows from more
than one item, e.g. `tests/bridge-p14b6-relationship-read-models.test.ts` carries items 1, 3, 4
and 5 on different lines).

## Item 3 in detail — validator selection went well beyond the cited 33 files

The plan cited "1302-I C1, 33 files." That 33-file set (verified: filtering
`1302-I-failures.json` rows by `cluster_id` starting `C1-` gives exactly 33 distinct files,
matching the plan's own count) was fully resolved: every call site was read in context and
classified live vs. historical (e.g. `tests/p14p3-directing-promises.test.ts`'s direct
`validateSaveV38(...)` calls are all genuinely historical — clones of `outgoing('...')`, a frozen
gzip-pinned V38 fixture, or explicit `{ ...clone(save), saveVersion: 38 }` forgeries — so that
file received **zero** edits from the 33-file pass, correctly).

Two things then widened this item beyond the cited 33 files:

1. Several of the 33 files' actual call sites live in a **shared helper**
   (`tests/helpers/p14b2-fixtures.ts`, `p14c2c-fixtures.ts`, `p14c2rm-fixtures.ts`), not in the
   attributed test file itself — fixed at the helper, once, per the shared-root-cause rule.
2. The parent's mid-task tsc evidence (15 root errors) named 13 further files the dynamic C1
   attribution never saw, because in every one of them `makeSave()`'s return type moved from
   `SaveFileV40` to `SaveFileV41` and the file feeds that live envelope straight into a
   **downgrade chain that used to start at `convertV40ToV39`** (`convertV38ToV37(convertV39ToV38(
   convertV40ToV39(makeSave(state))))`), which is now missing one leading step. The mechanical fix
   — prepend `convertV41ToV40(` around the live envelope — is not invented: it is exactly the
   pattern every `migrateToVNN` in `src/core/save.ts` itself gained
   (`1308-X-production-draft.patch`: `if (save.saveVersion === 41) return migrateToVNN(
   convertV41ToV40(save))`). One of the 13, `tests/p14b4-material-evidence-core.test.ts`, needed
   its `EnvelopeV33` type alias definition (`ReturnType<typeof validateSaveV40>`) bumped instead —
   this file has its own explicit, repeated convention for exactly this ("the NAME stays
   unchanged... the VALUE now reaches the live VNN envelope", present at every prior bump); this
   sweep continues it rather than inventing a new pattern.
3. While fixing the 13 tsc-flagged files, reading their full context surfaced **sibling**
   `validateSaveV40(...)` calls in the same files that tsc could not catch (its parameter type is
   `unknown`, so a stale-name call on a live envelope is a silent runtime defect, not a type
   error) — `tests/p14c2rm-writer-continuation.test.ts` (8 more sites) and
   `tests/p14c3-cohort-transition.test.ts` (3 more), both fixed for internal file coherence.
   `tests/p14p4p5-opportunities.test.ts` has its own `FutureAPI` abstraction pairing
   `validateSaveV40`+`convertV40ToV39` (a live/one-step-below-live pair, unlike p14p3's — see
   below); renamed the whole pair to `validateSaveV41`+`convertV41ToV40` (type, both assert
   messages, 8 call sites, one companion `.toBe(40)`→`.toBe(41)` literal, and the 5 error-message
   regexes whose expected text is literally `validateSaveV40:`, the renamed function's own thrown
   prefix) plus 3 more direct `saves.validateSaveV40(...)` calls in shared local helpers in the
   same file, unrelated to `FutureAPI`.

## Discovered gaps — not fixed, explicitly reported

- **`tests/p14p3-directing-promises.test.ts` + `tests/helpers/p14p3-fixtures.ts`'s
  `FutureSaveAPI`/`futureSave()`.** This is the *same shape* of coupled validate+convert
  abstraction as `p14p4p5-opportunities.test.ts`'s `FutureAPI`, but it is a live/**three**-steps-
  below-live pair (`validateSaveV39` + `convertV39ToV38`, reaching a frozen V38 corpus), not a
  live/one-step-below pair. A correct fix needs the convert side to become a genuine chain
  (`convertV39ToV38(convertV40ToV39(convertV41ToV40(input)))`) while the exposed key name
  plausibly stays `convertV39ToV38` (continuing the "name stays, value tracks live" convention) —
  but this is a real design call about the abstraction's own shape, not a rename, and I did not
  make it unilaterally. Every *other* call in that file is confirmed genuinely historical (see
  above) and correctly untouched. **Not fixed. Flagged for a dedicated increment or an explicit
  Owner/contract-auditor ruling on the chain-vs-rename question.**
- **The wider `validateSaveV40(` population.** A direct grep of `tests/` for `validateSaveV40(`
  found 33 files with at least one occurrence (`/tmp/v40_files.txt`, reproducible with
  `grep -rl 'validateSaveV40(' tests/`). All files the 33-file C1 set and the 13 tsc-flagged files
  needed are fixed; the remainder (roughly 18 more files, e.g.
  `tests/p14b3-reservations.test.ts`, `tests/p14bf2-acting-discipline.test.ts`,
  `tests/p14p4p5-casting-reservation.test.ts` and others in that grep) were **not individually
  read**. Some of these are almost certainly genuinely historical (the two purpose-built R2/R3
  native test files in that list, `tests/bridge-p14r2r3-prior55.test.ts` and
  `tests/p14r3-save-v41.test.ts`, deliberately keep `validateSaveV40` beside a new
  `validateSaveV41` to prove the frozen V40 boundary still works after the bump — reading their
  content confirms this, so they are correctly out of scope). The rest are unverified either way.
  **Recommend a grep-and-classify follow-up before calling the sweep complete.**
- **Item 9 (1302-K widened rival authoring), not attempted.** `authorRivalPromise`
  (`src/core/talentMarket.ts:1441`) was read in full: candidate order depends on `directingFirst`
  (director role, or an actor with a recorded directing credit) and `isProven`, with the P1/P2
  cast-list ordering, then up to two `SPECIFIC_PROJECT` and two `PREFERRED_GENRE_OPPORTUNITY`
  candidates in an order that **itself flips** depending on `isProven` (proven: genre-then-project;
  unproven: project-then-genre) — the plan's one-line paraphrase understates this. Deriving the
  exact expected candidate list/spy sequence for `tests/p14b1-trust-chooser.test.ts` test 7 and
  `tests/p14b4-cast-class-policy.test.ts`'s "natural rival policy" leaf requires tracing this
  algorithm against each fixture's specific talent roster, proven-status and released-film history
  — not tractable to do correctly by hand without executing code, and 1302-I itself only flagged
  these two as "not traced to a shared cause... independent review", not a confident literal fix.
  Inventing a specific array/count here risks being wrong in a way I cannot verify. **Not edited.**
- **Item 10, per the plan's own instruction ("propose... do not re-pin"): no edit.** Proposal:
  `tests/p14b8-waiver-surface-oracle.test.ts:177`'s
  `expect(LIVE_SAVE_VERSION, 'B.8 moves no save law...').toBe(38)` checks a **global, ever-moving**
  constant to prove a claim about **one slice's own local diff** — the two are logically decoupled,
  and the test's own message already concedes this ("a bump here is a plan amendment"). Re-anchor
  by deleting the `LIVE_SAVE_VERSION` assertion and replacing it with a comment recording the same
  historical fact (B.8/744 §6 added no save-version bump, verified once against that slice's own
  diff, not re-checked at every future unrelated bump); the companion
  `PROMISE_RULES_VERSION).toBe(4)` assertion on the next line is a genuinely frozen, non-live-
  tracking check and needs no change. Do not repin the number to 41 — that only re-encodes the
  identical defect for the next bump.
- **A second, independently-discovered "stale prose beside a corrected literal" case in item 5's
  own set:** `tests/bridge-p14b8-waiver-surface.test.ts:788`'s message text ("P3 adds the genuine
  outgoing53 identity: 41 -> 42") describes P3's own local delta; the numeric pin was recomputed
  to 44 (the live total) per item 5's literal rule, but the prose now reads confusingly beside a
  number it never predicted. Not rewritten — flagged only, matching how item 2's "moves coherently
  to38" message text was left alone.
- **`tests/bridge-p14b4-runtime47-compatibility.test.ts`'s it-title** ("requires literal
  projection54/Save39 and exact 42 prior IDs...") names a stale prior-era count in prose; the
  actual `.toEqual([...])` assertion carries no numeric literal (it compares two computed arrays),
  so nothing here needed a literal fix under item 5, and the title was left as historical
  provenance, matching the established convention elsewhere in this codebase for it-titles that
  narrate an authoring-time number rather than assert on it.
- **A registry-extraction correction mid-task:** `bridge/runtime-checkpoint.ts`'s
  `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` map has **44** entries, not 41 — three of them
  (`PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID`, `ACCEPTED_P12_SCHEMA_ID`,
  `R05_NATIVE_FOUNDING_SCHEMA_ID`) are registered by **named-constant reference**
  (`[CONST_NAME, 'label']`), not an inline literal string, and a naive literal-string regex misses
  them. All five item-5 files' claimed sets reconcile exactly against the 44-entry registry once
  this is accounted for (zero "claimed but not in registry" residue after the correction) — this
  is recorded so a reviewer re-deriving these numbers from scratch does not repeat the same
  40-vs-44 undercount.

## A real, unrelated regression noticed while reading 1303-I (report only, not addressed)

`1303-I-broad-ui-attribution.md` cluster C5: `p05a-w2-closed-production` Gate Hiring, 2 cases,
`Error: studioLotSnapshot: invalid or ambiguous Gate Hiring authority` thrown from **production**
source `ui/src/engine/adapter.ts:7264`, byte-identical to the 1101 baseline (not new, not fixed
between 1101 and 1303). This is outside version-pin scope entirely and untouched by this task, but
it is a real defect that remains open regardless of whether this sweep's tests go green.

## Cross-check: 1303-I's only version-pin-shaped UI cluster is already covered

Read `1303-I-broad-ui-attribution.md` in full. Its cluster table (31 UI failures total) has
exactly one version-pin cluster, C8 (`StudioCalendar.career.test.tsx`, 3 cases): the *identical*
`tests/helpers/p14c3-genuine-evidence-fixtures.ts:17` defect item 2 already fixes. Every other UI
cluster (C1–C7) is a timeout, a missing-PIL/environment gap, a DOM race, or the C5 production
defect above — none are version-pin defects, so no `ui/src` file needed an item-3/4/5-style edit
beyond what item 1's own 188-row set already carried for `ui/src` paths (5 files: see the patch
stat).

## Predicted 1302-I / 1303-I identities that should turn green once R2/R3 has landed and this patch applies

- All 146 `C1 validateSaveV38/39-selection` rows (33 distinct files, per direct extraction from
  `1302-I-failures.json` filtered on `cluster_id` — matches the plan's own "33 files" citation
  exactly; 1302-I's inline prose separately says "23 distinct files", which this patch does not
  rely on) plus the newly-discovered sibling sites in the same files.
- All 94+47+23+15 = 179 `C2/C3/C4/C5` helper-literal rows (once item 2's four `.toBe(41)` edits and
  item 3's paired `validateSaveV41` calls in the same helpers both land).
- `C9` (8 rows) and `C10` (3 rows) — item 4.
- `C13` (5 rows, roster) — item 5, **contingent on the registry-size correction above**: if the
  broad rerun still shows a mismatch on any of these five files, check the `.size`/`.toEqual`
  target against the live 44-entry registry before assuming the sweep failed.
- `C14` (2 rows) — item 6, confirmed unchanged; these two should already be green today and stay
  green after R2/R3, since neither cited fixture carries rival-termination data.
- `C18` (2 rows) — item 7.
- The masked RETAINED-CHANGED rows explicitly named by 1302-I (`bridge-p14c3-runtime.test.ts` R8,
  both `c2a-m2-sets-save.test.ts` NEW greenlight leaves, both `p14c3-canonical-rival-history.test.ts`
  L1/L2 leaves) should now reach their originally-documented, still-real 1100/1119-A causes once
  the masking `validateSaveV38` failure in front of them is gone (item 1 + item 3).
- **Not** predicted green: `1302-J`'s "two possible production regressions" (`p14b1-trust-chooser`
  test 7, `p14b4-cast-class-policy` natural rival policy) — item 9, not attempted; the
  `bridge-p14b1-promises.test.ts:400`/`bridge-p14b3-promise-command.test.ts:180` "quote.ok flips to
  true" rows — untouched, out of this plan's ten items entirely; C6/C7/C8/C15/C16/C16b/C17/C19/C20
  and the 20 UNRESOLVED rows — explicitly out of scope per the plan's own "Out of scope" section.

## Reproduction

```
cd /Users/zacheryspector/The-Movies-headless-program
git apply --check docs/engineering/playability-launch-review/evidence/p14b4-20260919/1309-stage/1309-pin-sweep.patch
```
Exit 0, no output, `git status` unaffected (dry run). Apply for real only after 1309-D review and
the R2/R3 GREEN gate, per the plan's ownership section — not done here.
