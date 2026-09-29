# 1348-C: independent-test-engineer RED for P14B relationship rulings slice A

Role: independent test engineer (test-author). Task: brief
`brief-1348-rel-sliceA-red.md` (record 1348-C), RED tests for P14B relationship slice A —
tier law v2 with conflict evidence (D-1312-1), D5 (1347-F Amendment 2, shipped order
unchanged), and the Mentor label (HIS-014 with 1347-F Amendment 1). Scope is exactly the
brief's SLICE A SCOPE items 1-5; nothing from slice B (no romance, no Professional Rivals,
no `competitions` log, no Save44, no projection change — 1347-F Addendum: "slice A publishes
nothing new").

## Base check

- BASE at start: `f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8` — verified via `git rev-parse HEAD`
  before any work (matched exactly).
- HEAD at the end of this record: `e374f4c8d9f34204102c5d46ef95f121d2fbc468`. The parent
  committed additional records while this task ran (anticipated by the brief). Checked
  `git diff --stat BASE..HEAD -- src bridge ui tests`: exactly six files changed, all
  unrelated to this record's scope —
  `tests/fixtures/p14/genuine-v42-pre-shelving/{MANIFEST.json,*.json.gz,*.provenance.json}`
  (new rival-shelving fixtures) and `ui/src/lot/StudioLotIdentityReview.test.tsx` (+3 lines,
  unrelated UI test). No file this record patches or reads for source-of-truth (`src/core/
  relationships.ts`, `src/core/talentMarket.ts`, `src/core/professionTransitions.ts`,
  `src/core/careerLifecycle.ts`, `src/core/types.ts`, `tests/p14b10-*`, `tests/p14b5-
  relationships.test.ts`, `tests/p14b9-casting-competition.test.ts`) moved. No collision.
- In the real repo only the three handback files below were written (this file, the patch,
  and the classification JSON), plus the `1348-stage/` directory that holds the latter two.
  No file under `src/`, `bridge/`, `ui/`, or `tests/` in the real repo was touched — every
  test edit lives only in the scratch tree and is captured as a patch.

## Method actually used (1327-C scratch method)

Built the scratch tree exactly per the brief's METHOD block (`git archive $BASE` of
`src bridge ui generated scripts` + config files, `tests` minus `tests/fixtures`, symlinked
`docs node_modules art tools` and `tests/fixtures`, `git init` + one `base` commit). Wrote/edited
tests only inside that tree, ran `node_modules/.bin/vitest run --project core <files>` and
`node_modules/.bin/tsc --noEmit -p tsconfig.json` from inside the scratch tree only. Never ran a
broad suite. Explored fixture data (rival/player rosters, cohort-entrant shapes, a minimal real
casting-competition route) with disposable probe test files inside the scratch tree, all removed
before generating the final patch (confirmed via `git status`/`ls` before `git add -A`).

The scratch tree itself is at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1348-work/tree`
(ephemeral; not part of the real repo, not an evidence path).

## Files (patch contents)

- `tests/p14b10-conflict-evidence.test.ts` — NEW. Tier law v2 (item 1), D5 (item 2), negative
  D-1312-1 cases (item 4). 20 leaves.
- `tests/p14b10-mentor-label.test.ts` — NEW. Mentor label (item 3). 9 leaves.
- `tests/p14b5-relationships.test.ts` — EDITED, 2 lines (item 5 pins). Both moved
  `RELATIONSHIP_RULES_VERSION` from `.toBe(1)` to `.toBe(2)`, each with an explanatory comment,
  classified "moves by ruling (1347-F)" per the brief.

Patch: `1348-stage/1348-rel-sliceA-red.patch` (git diff of the scratch tree vs BASE, tests only —
`git diff --stat` confirms 3 files changed, 614 insertions(+), 2 deletions(-), no non-test path).

## Leaf list and exact RED summary

Full per-leaf detail (file, leaf, cited requirement, redStatus, redReason) is in
`1348-stage/1348-rel-sliceA-red-classification.json` (31 rows, valid JSON, verified with
`python3 -m json.load`). Summary counts: 23 `fails` (genuine RED), 8 `control-passes` (already
true on unmodified source, kept as regression guards, not claims of new behavior).

### `tests/p14b10-conflict-evidence.test.ts` (20 leaves; run from the scratch tree)

```
node_modules/.bin/vitest run --project core tests/p14b10-conflict-evidence.test.ts
```

Result: **12 failed, 8 passed** (20 total). Exact tail:

```
 ❯ |core| tests/p14b10-conflict-evidence.test.ts (20 tests | 12 failed) 1178ms
   × P14B10 T1 ... > hasConflictEvidence is a function and RELATIONSHIP_CONFLICT_COMPETITIONS is the Owner's named 3
     → expected 'undefined' to be 'function'
   × P14B10 T1 ... > RELATIONSHIP_RULES_VERSION moves to 2
     → expected 1 to be 2
   × tier law v2 ... > hasConflictEvidence is exactly sharedCompetitions >= RELATIONSHIP_CONFLICT_COMPETITIONS (boundary at 2 vs 3)
     → hasConflictEvidence is not a function
   × tier law v2 ... > three competitions (the Owner's named threshold) in the Enemies band reads Enemies
     → hasConflictEvidence is not a function
   × tier law v2 ... > three competitions with closeness at or below 10 reads Nemeses
     → expected 'Strained' to be 'Nemeses'
   × tier law v2 ... > a pair with only flops/cancellations reports no conflict evidence
     → hasConflictEvidence is not a function
   × tier law v2 ... > recovery keeps the evidence counter itself
     → hasConflictEvidence is not a function
   × tier law v2 ... > drift to Acquaintances at baseline still works with evidence kept
     → expected 'Strained' to be 'Enemies'
   × tier law v2 ... > tiers read current closeness, never peakTier: ... reads Enemies
     → expected 'Strained' to be 'Enemies'
   ✓ the real casting-competition route ... > pair (a,b) reaches sharedCompetitions = 3 with exactly the existing drivers ... [control]
   × the real casting-competition route ... > the real 3-competition pair reports conflict evidence
     → hasConflictEvidence is not a function
   ✓ D5 ... > a player issuer: both a close tie and an enemy on the roster reads `close ties here` (2) [control]
   × D5 ... > a player issuer: only an enemy on the roster reads `enemies here` (0)
     → expected [ 'Strained' ] to deeply equal [ 'Enemies' ]
   ✓ D5 ... > a rival issuer: both a close tie and an enemy on the roster reads `close ties here` (2) [control]
   × D5 ... > a rival issuer: only an enemy on the roster reads `enemies here` (0)
     → expected [ 'Strained' ] to deeply equal [ 'Enemies' ]
```

(The remaining 4 passes not shown above are the two "one/two competitions read Strained"
controls, and the "evidence never moves closeness" and "recovery through positive drivers"
controls — all 8 controls are listed with their reason in the classification JSON.)

### `tests/p14b10-mentor-label.test.ts` (9 leaves; run from the scratch tree)

```
node_modules/.bin/vitest run --project core tests/p14b10-mentor-label.test.ts
```

Result: **suite-level failure, 0 tests collected** (all 9 declared leaves RED via this one
failure, never individually executed):

```
 ❯ |core| tests/p14b10-mentor-label.test.ts (0 test)
 FAIL |core|  tests/p14b10-mentor-label.test.ts [ tests/p14b10-mentor-label.test.ts ]
Error: Failed to load url ../src/core/relationshipLabels.js (resolved id: ../src/core/relationshipLabels.js) in .../tests/p14b10-mentor-label.test.ts. Does the file exist?
```

This is the correct RED for a brand-new module (matches this codebase's own precedent, the
`tests/p14b5-relationships.test.ts` header note for when `relationships.ts` itself did not yet
exist): the whole file fails to collect, never a spurious pass.

**Scaffolding verification (not part of the patch, disclosed for confidence):** because the
suite-level failure means these 9 leaves were never individually *executed* against real logic,
I additionally ran this exact file against a small local reference implementation of
`relationshipLabels.ts` (written to a disposable scratch path, `tests/probe-stub/
relationshipLabels.ts`, deleted before generating the patch — never part of any evidence path).
All 9 leaves passed against that reference (`✓ |core| tests/probe-mentor.test.ts (9 tests)
21271ms`), confirming the fixture-construction logic itself (the `cohortThreeFilms()` reuse, the
in-memory `firstTakes` variants, the genesis/authored-start staging, the byte-equality and
no-effect checks) is internally consistent with a reasonable reading of HIS-014/1347-F Amendment
1, and not merely "RED because the test itself has a bug." This is a confidence-building step,
not a claim that the reference implementation is correct or authoritative — production may
legitimately differ (e.g., on the exact `entryWeek >= week` filter my reference applied), and the
brief's own instruction to "write the test to the authority" governs, not this scratch reference.

### `tests/p14b5-relationships.test.ts` pin edits (2 leaves; run from the scratch tree)

```
node_modules/.bin/vitest run --project core tests/p14b5-relationships.test.ts \
  -t "the hypothesis constants carry the companion values|eight members, byte-equal output|nemesisOnRoster is an enumerated"
```

Result:

```
 ❯ |core| tests/p14b5-relationships.test.ts (46 tests | 2 failed | 43 skipped) 921ms
   × P14B.5 T1 ... > the hypothesis constants carry the companion values named in the expansion and the ONE pinned relation
     → expected 1 to be 2
   × family 4 — TIER RULE under RELATIONSHIP_RULES_VERSION 1 and the D2 reachability (scope (3)-(4)) > eight members, byte-equal output for byte-equal input, and a value in the Enemies/Nemeses bands WITHOUT a conflict record reads Strained
     → expected 1 to be 2
   ✓ family 8 — RESERVATION enumerated and CHEMISTRY read-only (scope (6)-(7); §5.6 :476, :482) > nemesisOnRoster is an enumerated FreezeDrop member; Nemeses needs a conflict record B.5 never mints, so no genuine edge can trip it
```

Both edited pins are RED for the correct, expected reason ("moves by ruling", per the brief).
The third line above is the `:1034` check (see "Pin holds" below).

## Pins that move vs. pins that hold (brief item 5)

- **Moves by ruling (1347-F):** `tests/p14b5-relationships.test.ts` original `:507` and `:753`
  (both `RELATIONSHIP_RULES_VERSION.toBe(1)`). Edited in the patch to `.toBe(2)`, each with a
  comment citing 1347-F Amendment 2 and noting *why* the rest of each surrounding test still
  holds under v2 (see the classification JSON rows for these two leaves; the `:753` leaf's own
  tier-ladder loop is unaffected because it builds every edge through `stagedEdge`, which
  hardcodes `sharedCompetitions: 0` — no evidence, so v2's redirect matches v1's unconditional
  one). Note: because my first edit inserted 3 comment lines above the original `:507`, the
  original `:753` line shifted to `:756`/`:760` in the patched file; the brief's line numbers are
  against the pre-patch file, confirmed by grep before editing.
- **Pin holds, verified by running it (not edited):** `tests/p14b5-relationships.test.ts` original
  `:1034` ("nemesisOnRoster is an enumerated FreezeDrop member...") — ran, **passes** (shown
  above, now at line 1041 due to the same +7 line shift; content unedited). `tests/p14b9-casting-
  competition.test.ts:339` (inside "P2: pair (a,d) competes a second time...") — ran individually,
  **passes**:
  ```
  node_modules/.bin/vitest run --project core tests/p14b9-casting-competition.test.ts \
    -t "pair \(a,d\) competes a second time"
   ✓ |core| tests/p14b9-casting-competition.test.ts (13 tests | 12 skipped) 903ms
     ✓ ... P2: pair (a,d) competes a second time on a different production ...
  ```
  Neither file is part of the patch; these were one-off targeted verification runs the brief
  explicitly asked for ("Check ... still hold (report)"), not broad-suite runs.

## Type-gate output

```
node_modules/.bin/tsc --noEmit -p tsconfig.json
```

Exactly three errors, all expected (missing module/exports, nothing else):

```
tests/p14b10-conflict-evidence.test.ts(86,26): error TS2305: Module '"../src/core/relationships.js"' has no exported member 'RELATIONSHIP_CONFLICT_COMPETITIONS'.
tests/p14b10-conflict-evidence.test.ts(88,34): error TS2305: Module '"../src/core/relationships.js"' has no exported member 'hasConflictEvidence'.
tests/p14b10-mentor-label.test.ts(82,37): error TS2307: Cannot find module '../src/core/relationshipLabels.js' or its corresponding type declarations.
```

(A fourth, self-inflicted TS2352 unsafe-cast error was found and fixed during authoring — see
"Findings" below, item 4 — before this final clean run.)

## Temporary-index apply check

Per the brief, verified the patch applies to BASE using a **scratch `GIT_INDEX_FILE`**, never the
real index, and with `--cached` (index-only; confirmed the real working tree is never touched —
`git status --short` in the real repo was empty both before and after):

```
BASE=f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8
export GIT_INDEX_FILE=<scratch path, deleted after use>
git read-tree $BASE
git apply --check --cached 1348-stage/1348-rel-sliceA-red.patch   # exit 0
git apply --cached 1348-stage/1348-rel-sliceA-red.patch           # exit 0
git write-tree
# -> e24fc3cdae28fcaba73b9e829dfe4fc54b0893a9
git diff-tree -r $BASE e24fc3cdae28fcaba73b9e829dfe4fc54b0893a9
:000000 100644 ... A  tests/p14b10-conflict-evidence.test.ts
:000000 100644 ... A  tests/p14b10-mentor-label.test.ts
:100644 100644 b147a6d..79f3620 M  tests/p14b5-relationships.test.ts
```

(First attempt used `--index` instead of `--cached` and correctly refused with "does not match
index" for the modified file, for a subtle reason worth recording: `--index` applies to the
*working tree* too and re-checks the on-disk file, and something in that combined path did not
line up even though the blob content was independently confirmed byte-identical at BASE via both
`sha256sum` and `git rev-parse $BASE:tests/p14b5-relationships.test.ts` /
`git rev-parse HEAD:tests/p14b5-relationships.test.ts` in the scratch tree, both `b147a6d8...`.
Switched to `--cached`, which only touches the temporary index and is the correct, safe form
for this check regardless. The real repo's working tree was confirmed clean — `git status
--short` — both before this diagnosis and after, so nothing was ever at risk.)

## Findings against the API decisions

1. **D5 test is a targeted `tiersOnRoster` exercise, not a full settlement-receipt test —
   disclosed gap.** `bandsFor`'s descriptor combinator (`talentMarket.ts:911-918`) is private and
   reached only through a full multi-week `TalentMarketCase` settlement (the existing
   `tests/p14b5-relationships.test.ts` family-6 `f6Base()`/`settlementAt208()` apparatus, ~90
   lines, built from a real 207-week campaign to isolate D5 as the sole tie-breaking reason).
   Since 1347-F Amendment 2 explicitly says D5's own code does not change, duplicating that whole
   apparatus for this slice was assessed as disproportionate. Instead this record's D5 leaves
   exercise `tiersOnRoster` — the exact, exported function the module's own docstring calls "the
   D5 / reservation read" (`relationships.ts:410-412`) — fed a real D1 roster (player and rival)
   and combined with the shipped ternary quoted verbatim (comment cites `talentMarket.ts:916-918`,
   never reimplemented judgment). This proves the new evidence-gated `tiersOnRoster` output drives
   the unchanged combinator to the ruling's stated outcome, but it is **not** a settlement-receipt-
   level regression test. If a future package changes anything inside `bandsFor` itself (not just
   `tiersOnRoster`), this record's D5 leaves would not catch it. Recommend a settlement-level D5
   regression test be added alongside slice A's production landing, reusing (or exporting) the
   `f6Base()`-style apparatus, if the parent wants that stronger guarantee.
2. **Mentor fixture staging note.** The positive Mentor case and its "two of three"/"duplicate"/
   "fewer than three" variants all rest on one real, accepted fixture
   (`tests/helpers/p14c3-cohort-transition-fixtures.ts`'s `cohortThreeFilms()`, already used by
   `tests/p14c3-cohort-transition.test.ts`) with in-memory `firstTakes` variants (the p14b5 "I3"
   convention). These are **not** re-run through `makeSave`/`validateSave`, because
   `careerLifecycle.cohorts`'s own validator (`validateCohortReceipts`, `src/core/save.ts:9938`)
   re-derives every receipt from `talent.slice(0, talentCountBefore)` and the exact block position/
   provenance — a synthetic receipt cannot cheaply satisfy it, and this file's edits never touch
   that root anyway. The genesis/authored-start cases use **staged** (in-memory) qualifying-
   picture-shaped `firstTakes` for a person structurally excluded by the CohortReceipt check alone
   — disclosed in the file header, not silently adapted.
3. **`currentTier`'s widened Pick type produced no type-gate break.** The brief's parent API
   decision widens `currentTier`'s parameter type to `Pick<RelationshipEdge, 'closeness' |
   'lastEventWeek' | 'sharedCompetitions'>`. Every existing call site in `tests/p14b5-
   relationships.test.ts` already passes full `Edge`/`RelationshipEdge` values (never object
   literals missing the field), so this widening is structurally compatible and produced no new
   type error against the existing suite — confirmed by the clean type-gate run above.
4. **Self-inflicted type error found and fixed during authoring, not a production API gap.**
   `tests/p14b10-conflict-evidence.test.ts`'s D5 fixture originally cast
   `(Talent | undefined)[]` to a 2-tuple with `as [{id:string},{id:string}]`, which `tsc` correctly
   flagged (TS2352, insufficient overlap). Fixed with a proper type-guarded `.filter()` instead of
   a cast. Recorded here per the "report actual output" convention, not because it reflects
   anything about the production API.
5. **No conflict with the concurrent rival-shelving/UI work.** Confirmed by the BASE→HEAD diff
   above: the parent's concurrent commits during this task touched only rival-shelving fixtures
   and one unrelated UI test, none of which this record reads or writes.

## Summary

- Files: `tests/p14b10-conflict-evidence.test.ts` (new, 20 leaves), `tests/p14b10-mentor-
  label.test.ts` (new, 9 leaves), `tests/p14b5-relationships.test.ts` (edited, 2 leaves).
- Leaf count: 31 total (23 `fails` / genuine RED, 8 `control-passes`, all classified with reasons
  in `1348-stage/1348-rel-sliceA-red-classification.json`).
- RED status: every genuinely-RED leaf fails for the documented, verified reason (missing
  export/module or a value assertion that only holds once evidence-gated tiers/Mentor exist);
  every control-pass leaf is disclosed as already-true-on-unmodified-source, not a claim of new
  behavior.
- Findings: D5 tested at the `tiersOnRoster` level, not full settlement (disclosed gap, item 1
  above); Mentor negative/boundary cases staged via in-memory `firstTakes` variants over one real
  cohort fixture (item 2); no type-gate or concurrency conflicts found beyond one self-inflicted,
  fixed cast issue (items 3-5).
