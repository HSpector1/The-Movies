# 1348-C5: three tier premises corrected, a type-only counter added, an honest Mentor budget

Role: independent test engineer (test-author). Task: revision of record 1348-C4's RED tests,
requested by the coordinator after reading the production writer's handback
[1348-E](1348-E-rel-sliceA-production-handback.md) (PARTIAL, 77/80) and the parent's rulings
[1348-F4](1348-F4-parent-rulings-on-1348-E.md) on it. Same scratch tree as every prior round:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1348-work/tree`,
BASE `f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8`.

## Authority read

- [1348-E](1348-E-rel-sliceA-production-handback.md): production status, its findings F1 (three RED
  premises pin the old law) and F2 (two type errors from the required counter), and its own
  measurement of the Mentor positive leaf (50.7 s against a 30 s budget).
- [1348-F4](1348-F4-parent-rulings-on-1348-E.md): the parent's rulings on all three items, which
  this revision implements verbatim.

## What changed

**1. Three tier premises, `tests/p14b5-relationships.test.ts` (1348-F4 item 1 / production F1).**
Three leaves staged an edge at closeness `floor('Enemies')` = 11 with `sharedCompetitions: 3` and
asserted `currentTier(edge, week) === 'Strained'`, commented "measured at BASE (v1)". That is the
OLD law; D-1312-1, 1342-O item 8, 1347-F and `tests/p14b10-conflict-evidence.test.ts:151` all
require that exact pair to read Enemies under v2 evidence-gating. Two of the three leaves' own
SETTLEMENT expectations (the player's `relationships` band reading 0, "enemies here", not 1,
"none") only hold when the edge already reads Enemies — no single law could satisfy the old premise
and the settlement expectation beneath it in the same leaf. Fixed: all three `.toBe('Strained')`
calls become `.toBe('Enemies')`, each with a comment citing 1347-F / 1348-F4 item 1:
- line 1060 (the "both present" control leaf, family 6b) — its title bracket also changed from
  `[control: the shipped combinator order is unchanged]` to
  `[RED under v2, 1347-F/1348-F4: the tier premise below now requires Enemies; the settlement
  outcome is unchanged under either law]`, since the leaf as a whole is no longer a control (see
  reclassification below);
- line 1072 (the "only the enemy" leaf, family 6b);
- line 1166 (BRANCH 1-over-0, the companion-copy block).

A 27-line header note was added immediately above the `family 6b` describe block explaining the
contradiction, the fix, and why it is a genuine defect correction rather than a loosened
expectation (the corrected premise is exactly what D-1312-1 and 1347-F already require; nothing
about the settlement-level meaning of any of the three leaves changes, only the premise each stood
on, and — for the first leaf — its pass/fail status).

**Reclassification (1348-F4 item 1's explicit instruction).** The "both present" leaf was a control
that passed at RED (r2 through r4). Its own settlement assertions were never going to be affected by
this premise fix (the winning band's close-ties sentence does not depend on this one edge's tier
reading), but the corrected premise line itself now fails at BASE (still v1), so the WHOLE leaf now
fails at RED. `1348-rel-sliceA-red-r5-classification.json` moves this leaf's `redStatus` from
`control-passes` to `fails`. The two already-failing leaves' `redReason` text is also updated: their
FIRST failing assertion is now the tier premise itself (thrown before the settlement assertions
below it ever execute), not the settlement receipt as recorded in r3/r4's classification — both
facts are real and both are documented in the r5 classification row, but only one is now what the
test runner actually reports first. Measured exactly (see "RED run" below).

**2. `sharedCompetitions: 0`, `tests/p14b5-t-failure-tuning.test.ts` (1348-F4 item 2 / production
F2).** Two partial-edge literals passed to `currentTier` (lines 295 and 373) lacked
`sharedCompetitions`, which the mandated v2 signature requires. Added `sharedCompetitions: 0` to
both, each with a comment stating the edit is type-only and citing 1348-F4 item 2. Ran the file
before and after the edit to confirm the runtime result is genuinely unchanged (see "Re-run" below):
12/12 both times, byte-identical pass count, because neither literal is ever used at a closeness low
enough for evidence-gating to matter (one checks the Inseparable band, the other a drifted-baseline
peak far above the Enemies band).

**3. Mentor positive leaf budget, `tests/p14b10-mentor-label.test.ts` (1348-F4 item 3 / production
finding).** Investigated and fixed; see "Finding: only one leaf pays the real cost" below for why
only one of the file's nine leaves needed a change.

## Finding: only one leaf pays the real cost, and a `beforeAll` would not add anything

`cohortThreeFilms()` (`tests/helpers/p14c3-cohort-transition-fixtures.ts:214`) is itself memoized
per test-file process (`memo('three-films', ...)`, same file, lines 27-34): the first caller in a
given file's declaration order builds the real fixture (three genuine `commissionScript` ->
`greenlightScriptProject` -> shoot -> release cycles) and every LATER caller in that same file
receives a cheap `clone()` of the cached value. In `tests/p14b10-mentor-label.test.ts`, six of the
nine leaves eventually read `cohortThreeFilms()` (directly, or through the shared `baseAndTakes()`
helper), but only ONE of them — "Mentor — the positive case", the first one declared — is ever the
one to actually pay the build cost. I confirmed this empirically in a SEPARATE throwaway copy (see
"Throwaway confirmation" below, applying the candidate so the fixture build is actually reached):

| Leaf | Measured (this revision, candidate applied) |
|---|---|
| Mentor — the positive case | 50,804 ms (isolated file run) / 73,573 ms / 82,338 ms (run alongside the other two RED files, twice) |
| two of three sharing the director (negative) | 303-414 ms |
| a duplicate first take (negative) | 314-503 ms |
| fewer than three qualifying pictures (negative) | 303-340 ms |
| reading is inert (state) | 985-1,150 ms |
| reading is inert (chemistry/tier/trust) | 375-400 ms |

The other five leaves' existing 30,000 ms budgets are already honest — none comes remotely close to
firing — so they are UNCHANGED. Only the positive leaf's declared 30,000 ms was a false statement
(1348-E measured 50.7 s against it; I independently measured 50.8-82.3 s across four samples,
confirming real, non-trivial variance under machine load, not a one-off).

I considered moving the build into a file-level `beforeAll` (the coordinator's first-offered option)
and rejected it: the existing `memo()` already provides the cross-leaf sharing a `beforeAll` would
add, so a `beforeAll` would only relabel which declared number carries the real cost (the
`beforeAll`'s own timeout parameter), not remove the underlying reason the number can never
literally fire — a purely synchronous fixture build cannot yield control to the event loop, so a
Vitest timeout can only be checked once the function has already returned, at which point it is
simply true or false against the measured time, never actually preemptive. Moving the cost into a
shared hook would also cost this file its per-leaf declaration-order independence (the "1346-C
technique" this file already uses specifically so each leaf's own RED failure is independently
attributable), for no benefit five of six leaves don't already get for free via the memo. Fix: raise
only the positive leaf's own declared budget to an honest number, `180,000` ms — a little under 2.5x
the worst of the four measured samples, generous for slower CI hardware — with a written reason
(both inline at the leaf and in the file's revision-history header) citing the measured numbers and
this reasoning. No expectation in any of the nine leaves changed.

## RED run (BASE-equivalent scratch tree, no production code)

```
node_modules/.bin/vitest run --project core tests/p14b10-conflict-evidence.test.ts tests/p14b10-mentor-label.test.ts tests/p14b5-relationships.test.ts
```

```
Test Files  3 failed (3)
     Tests  27 failed | 53 passed (80)
```

Per file: `p14b10-conflict-evidence.test.ts` 12 failed (unchanged from r4, file not touched this
revision); `p14b10-mentor-label.test.ts` 9 failed (unchanged from r4 — every leaf still fails on its
own `loadLabels()` rejection before the fixture-timing change can matter; the module does not exist
on this tree); `p14b5-relationships.test.ts` 6 failed (up from 5 in r4's full-file run: the "both
present" leaf's net status flip). Arithmetic: r4 was 26 failed / 54 passed; this revision's one
reclassification (control-pass -> fails) yields 27 failed / 53 passed, exactly as measured.

Measured failure text for the three changed premise lines, confirming they now fail on the tier
line itself, before any sentence or settlement assertion runs:

```
FAIL tests/p14b5-relationships.test.ts > family 6b ... > both a close tie and an enemy ...
AssertionError: expected 'Strained' to be 'Enemies'   at tests/p14b5-relationships.test.ts:1060:42

FAIL tests/p14b5-relationships.test.ts > family 6b ... > only the enemy ...
AssertionError: expected 'Strained' to be 'Enemies'   at tests/p14b5-relationships.test.ts:1072:42

FAIL tests/p14b5-relationships.test.ts > D5 REASON SENTENCE ... > BRANCH 1 over 0 ...
AssertionError: expected 'Strained' to be 'Enemies'   at tests/p14b5-relationships.test.ts:1166:42
```

`tests/p14b5-t-failure-tuning.test.ts`, run in isolation before and after the `sharedCompetitions: 0`
edit (checked out the BASE-committed version for "before", restored the edited version for "after"):

```
BEFORE: Test Files  1 passed (1)   Tests  12 passed (12)   Duration 8.20s
AFTER:  Test Files  1 passed (1)   Tests  12 passed (12)   Duration 11.05s
```

Identical pass count, confirming the edit is genuinely type-only (the duration difference is
ordinary machine-load noise, not a behavior change).

## Throwaway confirmation (candidate applied, per this revision's explicit authorization)

A SEPARATE throwaway copy (`scratchpad/1348-work/throwaway-r5`, deleted after use, never the
authoring scratch tree and never the real repo) was built by copying the final r5 test files and
applying `1348-stage/1348-rel-sliceA-production-step3.patch` (sha256
`8054086910c337aebee3504fc6f32c5338255ae4a1820435da66a8693f36f49e`, matching 1348-E's reported
hash) to `src/` only — production code, no test file in the patch. Result:

```
Test Files  3 passed (3)
     Tests  80 passed (80)
```

The three previously-blocking leaves pass on the candidate (`family 6b` both leaves, `D5 REASON
SENTENCE` all three branches). Root type gate on the SAME throwaway: `tsc --noEmit -p tsconfig.json`
exits **0** — a clean gate, confirming 1348-F4's "next" line ("the writer's probes predict 80 of 80
and a clean root type gate") for this exact RED r5 + candidate combination.

## Type gate on the RED-only tree (no production)

```
node_modules/.bin/tsc --noEmit -p tsconfig.json
```
exits **2**, five errors:
```
tests/p14b10-conflict-evidence.test.ts(94,26): error TS2305: ... no exported member 'RELATIONSHIP_CONFLICT_COMPETITIONS'.
tests/p14b10-conflict-evidence.test.ts(96,34): error TS2305: ... no exported member 'hasConflictEvidence'.
tests/p14b10-mentor-label.test.ts(101,24): error TS2307: Cannot find module '../src/core/relationshipLabels.js' ...
tests/p14b5-t-failure-tuning.test.ts(295,85): error TS2353: Object literal may only specify known properties, and 'sharedCompetitions' does not exist in type 'Pick<RelationshipEdge, "closeness" | "lastEventWeek">'.
tests/p14b5-t-failure-tuning.test.ts(373,174): error TS2353: Object literal may only specify known properties, and 'sharedCompetitions' does not exist in type 'Pick<RelationshipEdge, "closeness" | "lastEventWeek">'.
```

The first three are the SAME three errors every prior revision reported (the Mentor one moved from
line 95 to 101, a pure line-number shift from this revision's added header comments — same error,
same missing module). The last two are NEW and EXPECTED: this tree has no production code, so
`currentTier`'s parameter type is still v1's `Pick<RelationshipEdge, 'closeness' | 'lastEventWeek'>`
— it does not yet recognize `sharedCompetitions` at all, so the literal I added trips TypeScript's
excess-property check on a directly-typed object literal (TS2353). This is the type-level mirror of
every other RED leaf in this record: a test written against a signature that does not exist on this
tree yet, by design. It is not a defect in the edit — the throwaway confirmation above shows these
exact two lines compile cleanly (root gate exit 0) once the candidate's v2 signature lands, matching
1348-E finding F2's own description of the OPPOSITE failure mode (TS2345 "Property is missing") on
the OLD, unfixed literals under that same v2 signature. Reported in full per the "report exact
measured output, never hide a gap" discipline, not filtered out because it is a new number.

## Temporary-index apply check (scratch `GIT_INDEX_FILE`, `--cached` only)

Two targets, per "the RED run (at HEAD 5c2ba11a or later + your patch)":

```
TARGET=5c2ba11a2182f7999d1984848fa12589df428888   # 1348-E's own ending HEAD
CHECK_OK / APPLY_OK
tree: 2d48326065388d6b0db72d7330f90d127c5dfc20
:000000 100644 ... A  tests/p14b10-conflict-evidence.test.ts
:000000 100644 ... A  tests/p14b10-mentor-label.test.ts
:100644 100644 ... M  tests/p14b5-relationships.test.ts
:100644 100644 ... M  tests/p14b5-t-failure-tuning.test.ts

TARGET=9260baf4f4faa3a8934318aadf8f184b4d4ce1a3   # current real HEAD ("or later")
CHECK_OK / APPLY_OK
tree: cb1c43841c0a8b18dc3691781443179a82633e31
(same 4 files, same op codes)
```

`--cached` throughout, never `--index`; `git status --short -- src bridge ui tests` confirmed empty
before and after both checks. `git diff --stat f5b2ab92..HEAD -- src bridge ui tests` shows 20
unrelated files changed since BASE (P15A/P15B shared-market and power-ranking work, rival-shelving
fixtures, one UI test) — none overlapping this patch's four files.

## Files (handback)

- `1348-stage/1348-rel-sliceA-red-r5.patch` — full tests-only diff vs BASE
  `f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8`; 4 files (876 insertions / 4 deletions): the two files
  new since BASE (conflict-evidence, Mentor) unchanged in content from r4 except the Mentor timing
  fix; `p14b5-relationships.test.ts` carries the three premise fixes plus the header note;
  `p14b5-t-failure-tuning.test.ts` appears in a patch for the first time (2 lines).
- `1348-stage/1348-rel-sliceA-red-r5-classification.json` — 36 rows (27 `fails`, 9
  `control-passes`); built from r4's classification with exactly three rows edited (the
  reclassified "both present" leaf, and the two sibling leaves' `redReason` updated to name the
  tier premise as their new first-failing assertion).
- This file.

## Summary

Fixed the genuine test defect 1348-F4 named: three premises that pinned v1's tier reading on an
edge whose OWN settlement expectations required v2's reading, one of which was silently passing as
a false control. Added a type-only counter field to two unrelated literals, confirmed byte-identical
runtime before and after. Traced the Mentor timing complaint to its root cause (the shared fixture's
own memoization already does the sharing a `beforeAll` would add; only the one leaf that happens to
build it first has a false budget) and corrected only that one leaf's declared number, honestly,
with measured evidence and a rejected alternative documented. RED run: 27 failed / 53 passed (80),
consistent arithmetic with r4's 26/54 plus the one reclassification. Throwaway confirmation against
the candidate: 80/80, clean type gate. RED-only type gate: 5 errors, 3 unchanged and 2 new-but-
expected (excess-property checks against the not-yet-landed v2 signature, confirmed to resolve
cleanly on the candidate). Apply check clean against both 5c2ba11a and the current real HEAD. No
production code touched; no expectation in any pre-existing leaf loosened.
