# 1332-C — retained-defect repair R3 (test-only): handback

Role: independent test engineer. Repo `/Users/zacheryspector/The-Movies-headless-program`, branch
`wip/headless-program-20260916-ts`, assigned base commit `ba7a97522c91af4dac4966e48626f317d3a99f2f`
(verified equal to `git rev-parse HEAD` at task start — no drift; re-checked at the end, still equal,
`git status --short` on the real repo empty throughout). Contract:
`E/1332-A-unresolved-attribution-and-repair-r3-plan.md` (rules 1-7) as amended by
`E/1332-F-parent-r3-plan-adoption.md` (F governs where they differ), reviewed REFINE→adopted in
`E/1332-B-r3-plan-review.md`. Measurements: `E/1332-measure/` (probes and runs). Method/rules/handback
form precedent: `E/1327-A-retained-defect-repair-r2-plan.md`, `E/1327-C-retained-r2-handback.md`,
`E/1327-C2-retained-r2-revision.md`.

Tests only; no production code, fixture payload, `tsconfig` or `vitest.config` change — verified by
`git diff --stat` below (3 files, all under `tests/`). No FROZEN/CHECKPOINT pin literal was edited (the
one `postTakeDigestStripped` sha256 constant keeps its exact value; only its comment gained a citation).
The twelve historical promise ids stay exactly as `recordedAffectedIds()` derives them (that function is
untouched).

## Method actually used

Scratch tree built exactly per the task's Method section, at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1332-work/tree`:
```
BASE=ba7a97522c91af4dac4966e48626f317d3a99f2f
git archive $BASE src bridge ui generated scripts package.json package-lock.json tsconfig.json \
  tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md \
  | tar -x -C <tree>
git archive $BASE tests ':!tests/fixtures' | tar -x -C <tree>
ln -s <repo>/tests/fixtures <tree>/tests/fixtures   # read-only
ln -s <repo>/docs <tree>/docs                        # read-only
ln -s <repo>/node_modules <tree>/node_modules        # read-only
ln -s <repo>/art <tree>/art                          # read-only
ln -s <repo>/tools <tree>/tools                      # read-only (present but unused)
cd <tree> && git init -q && git add -A && git commit -q -m "1332-C scratch base at $BASE"
```
Base commit in the scratch tree: `f1016b7f45fcc6d21549619b49b884b779b7d6ba`. One tree only, all edits
made there with the `Edit`/`Read` tools; the real repository's `tests/` tree was never touched (confirmed
at the end — `git status --short` on the real repo shows nothing modified; the only new content is this
handback and its sibling deliverables, written to the scratch `out/` directory per the task's explicit
instruction that the repo's evidence dir is NOT the write target for this task). One `vitest` process at
a time throughout, except the final consolidated run of all three touched files together, which was still
one process. Two disposable, non-committed probes (built under `tests/zz-probe/`, never staged) were used
to re-measure causes independently in this tree; both were deleted immediately after use, confirmed by
`git status --short` showing a clean tree before each edit began.

## Re-measurement (Method step 2), before any edit

**Checkpoint diff** (`bridge-p14b2-checkpoint.test.ts:65`, baseline run in this tree,
`node_modules/.bin/vitest run --project core tests/bridge-p14b2-checkpoint.test.ts --reporter=verbose`):
1 failed / 1 passed. The failure diff (`+` = received, missing from the old expected object) showed
exactly:
```
+     "firstTakeSubjects": Object {
+       "cutoverOrdinal": 5,
+       "facts": Array [],
+       "version": 1,
+     },
```
at one location, and
```
+                   "termination": 0,
```
at four locations (one per `hollywood.businesses[].account.periods[]` entry in this fixture) — matching
1332-A's stated received values (`cutoverOrdinal` 5, four `termination` keys) exactly, re-measured in
this tree rather than copied from the record.

**Seam root content at pre/after and termination movements** (`p14b5-relationships.test.ts:546`).
Baseline run: 1 failed (the `:546` leaf) / 45 passed, of 46. Received digest
`d53438d4abc5dd203718d46ea344c4889377e6eb0cd2c2828de1b8a5570d5465` vs expected (FROZEN)
`9702aa6869cf80f82d5133f68137427a0ed44c07ce987e8fe2be66bbb60f3d78`. A disposable probe
(`tests/zz-probe/probe-firstTakeSubjects.test.ts`, replicating `takeWorld()`'s own steps: lift
`genuine-v30-first-take-at-five`, `assignShootingDirector` + `scheduleShootingTake` on `prod-0052`, one
`tick`) logged:
```
PROBE pre.firstTakeSubjects {"version":1,"cutoverOrdinal":24,"facts":[]}
PROBE after.firstTakeSubjects {"version":1,"cutoverOrdinal":24,"facts":[{"eventId":"first-take-event-24","conceptId":"c-00","genre":"comedy","scriptProjectId":null}]}
PROBE termination movements [0,0,0,0,0,0,0,0]
```
— matching 1332-A/1332-F's cited values (`c-00`, `comedy`, `null`, cutover 24, all termination zero)
exactly, re-measured in this tree.

**Twelve subjects' receipts and week-208 market receipts for promise-3/promise-26**
(`p14c3-promise-digest-continuity.test.ts:194`). Baseline run: 1 failed / 7 passed, of 8. First mismatch
(the loop's first failing subject, `promise-3`, second in `recordedAffectedIds()`'s own order):
`expected 'week: 208' but got 'week: 196'`. A disposable probe
(`tests/zz-probe/probe-p14c3.test.ts`, replicating `pre207()`/`tick(original,{develop:true})` directly)
logged, for all twelve ids in `recordedAffectedIds()`'s own order
(`promise-1,3,5,7,9,11,24,26,37,43,45,47`):
- pre-tick (`original`): **every one of the twelve has `contractId: null`** before the tick runs.
- post-tick (`direct`): **ten** get a non-null `contractId` (`…:contract:…:208`) and
  `feasibilityReceipt: {week: 208, rulesVersion: 4, ...}`; **exactly two** (`promise-3`, `promise-26`)
  keep `contractId: null` and their receipt byte-identical to the pre-tick one
  (`week: 196, rulesVersion: 4`, unchanged `inputsDigest`).
- week-208 case-decision receipts for the two unbound subjects (separate probe run, same tree):
  `promise-3` → `{"kind":"declined","week":208,"talentId":"person-studio-de11f27b-r01-1","studioId":null,"reasons":["this person could not separate 2 equally ranked proposals."],"eventId":"talent-market-event-143"}`;
  `promise-26` → `{"kind":"settled","week":208,"talentId":"person-studio-de11f27b-r03-1","studioId":"studio-de11f27b-r03","reasons":["their studio standing ranked higher","they are the current employer"],"eventId":"talent-market-event-155"}`
  (plus a non-empty `dropped` array on the latter, not part of the cited Attribution-3 facts and not
  asserted). All values match 1332-A Attribution 3 / the archived `digest-facts-58c89932.log` exactly,
  re-measured independently in this tree.

These three re-measurements confirm the plan's cited causes and cited values, sourced fresh in this
tree, not copied from `1332-measure/`.

## Changes by file

### `tests/bridge-p14b2-checkpoint.test.ts` (rule 2)

At `:65`'s `toEqual`, added two `const`s derived from the source envelope and the cited lift code
(never a literal): `sourceFirstTakeSubjects = { version: 1, cutoverOrdinal: source.state.firstTakes.length,
facts: [] }` (mirrors `convertV39ToV40`, `src/core/save.ts:10493-10497`) and `sourceBusinesses` (maps every
`hollywood.businesses[].account.periods[].movements` to add `termination: 0`, mirroring `convertV40ToV41`,
`src/core/save.ts:10526-10533`). Both slots (`currentSaveJson`, `savedSaveJson`) keep the same expression,
computed fresh inside the existing per-slot `for` loop (unchanged structure). The received values
(`cutoverOrdinal` 5, four `termination` keys) are cited in a new comment as cross-checks only, per rule 2.

### `tests/p14b5-relationships.test.ts` (rule 3 + 1332-F Amendment 2)

1. Import added: `validateFirstTakeSubjects` from `../src/core/firstTakeSubjects.js` — the LAW's own
   structural/content validator (`src/core/firstTakeSubjects.ts:36-89`), the exact function
   `src/core/promises.ts:1633` invokes at `saveVersion === 40`.
2. `FROZEN.postTakeDigestStripped`'s comment gained a citation of this record's counterfactual and the
   re-measured probe output (the sha256 literal itself is byte-identical, unedited).
3. `bytes()` gained, before the existing structural strip:
   - `validateFirstTakeSubjects(state as unknown as Record<string, unknown>)` — asserts the ROOT'S FULL
     CONTENT (version, cutoverOrdinal, and every fact's `eventId`/`conceptId`/`genre`/`scriptProjectId`
     agreement with its owning concept/production/released film) by calling the real law, never a
     reimplementation and never the probe output, closing 1332-B's blocking item 2 (a bare
     existence-check would have left the fact's payload outside every assertion once it left the digest).
   - a throwing loop over every `hollywood.businesses[].account.periods[].movements.termination`,
     matching the file's own `extensionUsed` guard-before-strip convention (rule 3).
   The structural strip itself now also drops the whole `firstTakeSubjects` root and the `termination`
   key from every period's `movements` (via a new `strippedHollywood`), added to the returned/stringified
   object.
4. At the `:546` leaf (renumbered to `:596` by the earlier insertions in this file — confirmed by
   `grep -n "sha(bytes(after))"` after all edits landed), two assertions added before `sha(bytes(after))`:
   `expect(after.firstTakeSubjects.version).toBe(1)` and
   `expect(after.firstTakeSubjects.cutoverOrdinal).toBe(pre.firstTakeSubjects.cutoverOrdinal)` — the
   cross-tick "unchanged" half of Amendment 2's content requirement, which `bytes()` cannot check itself
   (it receives one state at a time).

### `tests/p14c3-promise-digest-continuity.test.ts` (rule 4 + 1332-F Amendment 1)

At the `:194` leaf (`955 genuine207 normal-development continuation`):
1. Added `preReceipts`, a `Map` from each of the twelve ids to that subject's `feasibilityReceipt` in the
   PRE-TICK state (`original`, before `tick()` runs) — the amended rule 4 baseline ("the receipt it held
   in the pre-tick state, unchanged").
2. Replaced the one literal `expect(root.feasibilityReceipt).toMatchObject({ week: 208, rulesVersion: 4 })`
   inside `selected()` with a derived `expected` object: `root.contractId !== null ? { week: 208,
   rulesVersion: 4 } : { week: preReceipts.get(id)!.week, rulesVersion: preReceipts.get(id)!.rulesVersion }`.
   `contractId` is the derivation signal, cited to `commitWinningPromise`
   (`src/core/talentMarket.ts:1237-1248`), which writes `contractId` and the re-derived receipt together,
   atomically, only for the winning proposal's own promise — independent of the `feasibilityReceipt.week`
   field this very assertion checks, so the derivation is not circular.
3. Added the rule-4 pre-declared-attribution guard: derive `unboundIds` the same way (post-tick
   `contractId === null`), assert it equals exactly `['promise-3', 'promise-26']`, then for each assert
   `contractId` null, the pre-tick receipt week is 196, and the week-208 case-decision receipt
   (`talentMarket.receipts`, matched by `talentId === root.beneficiaryPersonId` and `week === 208`)
   matches the cited event id/kind/studio/reasons from Attribution 3 verbatim.

No existing assertion in any of the three files was weakened, removed or skipped. The `toMatchObject`
literal at `:194` is the only assertion the rules permit to change, and it did — narrowed per subject
using state-derived values, not loosened.

## Commands actually run, with actual outputs

Baseline (before any edit, one process per file, all run from the scratch tree root):
```
node_modules/.bin/vitest run --project core tests/bridge-p14b2-checkpoint.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 1 failed | 1 passed (2)
  → failure at tests/bridge-p14b2-checkpoint.test.ts:65:48 (toEqual diff quoted above)

node_modules/.bin/vitest run --project core tests/p14b5-relationships.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 1 failed | 45 passed (46)
  → failure: expected 'd53438d4...' to be '9702aa68...' at tests/p14b5-relationships.test.ts:546:31

node_modules/.bin/vitest run --project core tests/p14c3-promise-digest-continuity.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 1 failed | 7 passed (8)
  → AssertionError: expected {bottleneck:null,...} to match object {week:208, rulesVersion:4}
    - Expected week: 208  + Received week: 196
    at tests/p14c3-promise-digest-continuity.test.ts:194:39
```

Disposable probes (built outside the touched files, under `tests/zz-probe/`, never staged, deleted
immediately after use):
```
node_modules/.bin/vitest run --project core tests/zz-probe/probe-firstTakeSubjects.test.ts --reporter=verbose
  → 1 passed; logged pre/after firstTakeSubjects and termination movements (quoted above)

node_modules/.bin/vitest run --project core tests/zz-probe/probe-p14c3.test.ts --reporter=verbose
  → 2 passed (one -t filtered); logged the ids order, pre/post contractId+receipt per subject, and the
    week-208 decision receipts for promise-3/promise-26 (quoted above)
```

After every edit landed, per-file re-runs (all green):
```
node_modules/.bin/vitest run --project core tests/bridge-p14b2-checkpoint.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 2 passed (2)

node_modules/.bin/vitest run --project core tests/p14b5-relationships.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 46 passed (46)

node_modules/.bin/vitest run --project core tests/p14c3-promise-digest-continuity.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 8 passed (8)
```

Consolidated single-process run of all three touched files together (confirming no cross-file
interference):
```
node_modules/.bin/vitest run --project core tests/bridge-p14b2-checkpoint.test.ts \
  tests/p14b5-relationships.test.ts tests/p14c3-promise-digest-continuity.test.ts --reporter=verbose
  → Test Files 3 passed (3)
  → Tests 56 passed (56)   [2 + 46 + 8 = 56, matches the three per-file runs exactly]
```

Type gate (root only, per the task's explicit scope — "the root type gate"):
```
node_modules/.bin/tsc --noEmit -p tsconfig.json
  → exit 0, empty output
```

Consumer sweep (no helper function was touched — all three edited symbols, `bytes()` in two files and
the `selected()` closure, are file-local `const`s, never exported):
```
grep -rl "bridge-p14b2-checkpoint\.test\|p14b5-relationships\.test\|p14c3-promise-digest-continuity\.test" tests/
  → one incidental hit, tests/bridge-p14b6-relationship-read-models.test.ts, which cites a DIFFERENTLY
    NAMED file ("bridge-p14b5-relationships.test.ts", a "bridge-" prefixed sibling that is not one of
    the three files in this task's scope) in prose comments only — not an import, not a real consumer
    of any edited file.
```

Patch verification (from the REAL repository root, against the assigned base commit
`ba7a97522c91af4dac4966e48626f317d3a99f2f`, via a temporary index — the real index/worktree were never
touched):
```
TMPIDX=$(mktemp)
GIT_INDEX_FILE="$TMPIDX" git read-tree ba7a97522c91af4dac4966e48626f317d3a99f2f   → exit 0
GIT_INDEX_FILE="$TMPIDX" git apply --cached --check <patch>                       → exit 0
git status --short (real repo)                                                    → empty
```

## `git diff --stat` (scratch tree, against its own base commit `f1016b7f`)

```
 tests/bridge-p14b2-checkpoint.test.ts         | 20 +++++++++-
 tests/p14b5-relationships.test.ts             | 54 ++++++++++++++++++++++++++-
 tests/p14c3-promise-digest-continuity.test.ts | 45 +++++++++++++++++++++-
 3 files changed, 115 insertions(+), 4 deletions(-)
```

## Per-leaf pass reason (rule 6/7)

- **`bridge-p14b2-checkpoint.test.ts:65`** ("opens genuine45 with a new session while preserving both
  distinct gameplay slots byte-for-byte"): the leaf's own `toEqual(exportSave(governed))` assertion now
  runs against an expected object that carries BOTH governed-lift additions (`firstTakeSubjects`,
  `termination: 0` on every rival period) alongside the earlier ones already named in the file's own
  comment history — the digest-affecting `expect(after[slot]).toBe(exportSave(governed))` and the
  `currentStateDigest`/`savedStateDigest` assertions immediately after it now also run for their stated
  reason (byte-exact migration correspondence), no longer masked by the two missing fields.
- **`p14b5-relationships.test.ts:546`** ("no RNG reaches the seam..."): `sha(bytes(after)) ===
  FROZEN.postTakeDigestStripped` now runs for its stated CANNOT-MOVE reason — the whole-state digest
  (minus the four schema-additive fields it was always meant to ignore) is unchanged from the frozen
  historical control, with the two newly-added fields' CONTENT (not just their absence) independently
  asserted first by the law's own validator and the cutoverOrdinal cross-tick check, so nothing about
  `firstTakeSubjects`'s real payload is silently unassured by leaving the digest.
- **`p14c3-promise-digest-continuity.test.ts:194`** ("produces identical208 saves and all twelve actual
  affected receipts..."): the per-subject `toMatchObject` now runs for its stated reason on all twelve
  subjects — ten because `commitWinningPromise` really did bind them at week 208 with `rulesVersion: 4`,
  and two (`promise-3`, `promise-26`) because they were genuinely NOT bound this tick (declined/lost their
  case) and so retain their real, unchanged week-196 receipt — and the pre-declared-attribution guard now
  runs and confirms the derived unbound set is exactly the two Attribution-3 subjects, with their case
  facts verbatim, rather than assuming it.

## Deliverables

Written to `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1332-work/out/`
(the repository's evidence directory is explicitly NOT the write target for this task):

- `1332-retained-r3.patch` — cumulative `git diff` of the scratch tree against its own base commit
  (`f1016b7f`, itself `git archive` of the assigned base `ba7a9752`), 3 files, 115 insertions(+) /
  4 deletions(-). Verified twice: applies cleanly (`--check`) against the real repo's assigned base via a
  temporary index (above), and every file/test in it passes in this tree (per-file and consolidated runs
  above). 15107 bytes. sha256: `582cde20ea1809e18369e9ceaa4b33d3f4e0dd92d5a935afee0ad6fa036b7144`
- `1332-retained-r3-classification.json` — 8 rows (`file, line, old, new, row, cause, rule`), one per
  discrete edit location across the three files (checkpoint: 1 row; relationships: 4 rows — import, FROZEN
  comment, `bytes()` guard+strip, leaf cross-tick check; promise-digest continuity: 3 rows — preReceipts,
  the per-subject `toMatchObject` derivation, the pre-declared-attribution guard). 11027 bytes. sha256:
  `65fd70b367acb34952cac0cd8233300e1e1510da57851580d7d47ffe16620d67`
- This file (`1332-C-retained-r3-handback.md`).

## Leaves NOT touched (out of this task's file-list scope; confirmed unaffected)

The seven D-1329-1 rows (ledger family-12 seeds, `p14b4-rival-seating-preference` :483/:498/:622) and
every other retained row are untouched — none of the three edited files' changes reach
`tests/p14b4-rival-seating-preference.test.ts` or the ledger-family leaves in
`tests/bridge-p14b5-relationships.test.ts` (a differently-named, "bridge-" prefixed file, confirmed not
imported by or importing any of the three touched files). Not re-run in this task (out of scope; no
edit could plausibly reach them).

## Cleanup

Scratch tree at `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1332-work/tree`
retained at the end of this task (writable-role evidence preservation) with the three edits committed
nowhere (no commit was made in either tree beyond the one base commit) — the diff exists only as the
staged patch file above. Both disposable probes were deleted as soon as their measurement was logged
(`git status --short` clean immediately after each). The real repository's `tests/`, `src/`, `ui/` and
config files were never modified — `git status --short` on the real repository, checked at the start and
end of this task, shows nothing; `git rev-parse HEAD` is unchanged (`ba7a97522c91af4dac4966e48626f317d3a99f2f`)
throughout. No commit was made in the real repository; the parent is the only committer, and this task
did not write anything under the repository's own evidence directory, per the task's explicit instruction.
