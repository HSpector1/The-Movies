# 1348-C2: revision of the slice A RED (per review 1348-D, parent response 1348-F)

Role: independent test engineer (test-author). Task: revision of record 1348-C's RED tests for
P14B relationship slice A, requested by the coordinator after review
[1348-D](1348-D-rel-sliceA-red-review.md) returned REFINE and the parent's response
[1348-F](1348-F-parent-response-to-1348-D.md) accepted both blocking defects. Same scratch tree
as 1348-C: `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1348-work/tree`.

## What changed

1. **`tests/p14b10-mentor-label.test.ts` — per-leaf dynamic import** (1348-D blocking defect 1).
   Replaced the static `import * as relationshipLabels from '../src/core/relationshipLabels.js'`
   (which collapsed all 9 leaves into one suite-level "0 tests collected" failure) with the
   established `1346-C` technique: a `loadLabels()` async helper doing
   `await import('../src/core/relationshipLabels.js')` inside each test body, plus `requireFn`/
   `requireConst` guards (matching `1346-C-p15a1-wave1-red-handback.md`'s `loadMarket()`/
   `requireFn()` pattern exactly, including the "loud, never a vacuous pass" guard comment
   wording). Every `it()` became `async`. **Every expectation is unchanged** — only the import
   mechanism and each leaf's signature changed, per the instruction to keep every expectation.
2. **`tests/p14b5-relationships.test.ts` — new settlement-level D5 leaves** (1348-D blocking
   defect 2). Added a new describe block, `family 6b — D5 SETTLEMENT-LEVEL through the real
   bandsFor`, placed directly after family 6 (reusing that describe block's own private
   `f6Base()`/`settlementAt208()`/`stagedEdge()`/`stage()`/`findEdge()`/`rosterAt()` helpers,
   since they are not exported and the coordinator's message explicitly allowed landing this
   "where it fits best"). Two leaves:
   - **Both present (control, passes at RED):** stages `offCycle` CloseFriends (the file's
     existing `stage()`/`stagedEdge()` helpers), then genuinely RE-SIGNS `base.reliable` — a real
     talent whose OWN first contract already ended at week 52 in this fixture, confirmed a true
     free agent, not a synthetic id — with a real `signContract` action at week 207 (so
     `startWeek < W`, satisfying the strict D1 predicate), then stages that second counterpart
     Enemies-with-evidence (`sharedCompetitions: 3`). A real `tick()` produces a genuine week-208
     settlement: `{kind:'settled', studioId: player, reasons:["their roster holds this person's
     close ties"]}` — identical to the existing single-close-tie leaf's outcome, since D5's
     unchanged combinator picks "close ties" regardless of the co-present enemy signal.
   - **Only the enemy (fails, genuine RED):** reuses the file's own existing "enemies here is
     never read" staging (offCycle Enemies-band closeness) with `sharedCompetitions: 3` added,
     ticked for real. Required outcome under 1347-F Amendment 2: the player's own `relationships`
     band reads 0 ("enemies here"), r01 (whose band stays "none"=1) dominates and wins with the
     D5 sentence. See "Per-leaf RED reasons observed" below for the exact measured mismatch.
   - **Player issuer only, disclosed:** r01's real roster for the subject is genuinely EMPTY in
     this fixture at week 208 (measured: `rosterAt(tick(base.at207), base.r01, F6.subject,
     F6.W)` → `[]`). Reaching a rival-issuer settlement-decisive D5 signal here would need either
     an unproven synthetic rival-employment-row injection or a wholly separate tie-engineered
     fixture; judged disproportionate for this revision. The existing `tiersOnRoster`-level D5
     leaves in `tests/p14b10-conflict-evidence.test.ts` already cover a rival issuer (real rival
     roster) at that documented level and are **kept**, per the parent response: "The
     copied-combinator leaves may stay as documentation."
3. **`tests/p14b10-conflict-evidence.test.ts` — citation fix** (1348-D non-blocking note; parent
   response "Note adopted"). The D1 roster predicate comment and file header cited
   `talentMarket.ts:894-900` (the D2/D6/D7 descriptor computations, unrelated); corrected to the
   actual `rosterAt` definition at `talentMarket.ts:867-874`, confirmed by direct read
   (`function rosterAt(...)` through its closing brace is exactly lines 867-874). The re-derived
   predicate LOGIC was already byte-identical to the real one; only the citation was wrong. Also
   updated the file's D5 SCOPE NOTE to state plainly that the copied-literal `d5Band()` leaves are
   no longer the evidence for "D5's shipped order is unchanged" — that claim now rests on the new
   settlement-level leaves in `tests/p14b5-relationships.test.ts` — and are kept as documentation/
   rival-issuer coverage per the parent response. No assertion in this file changed.

No other line in any of the three files changed. Nothing from slice B added.

## Base / HEAD check

BASE unchanged from 1348-C: `f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8`. HEAD at the end of this
revision: `1d4275c052697329bf39c331ab30e9da4167ab6f` (the parent and other concurrent agents
committed further records during this revision, as expected in this environment).
`git diff --stat BASE..HEAD -- src bridge ui tests` shows exactly the same six unrelated files as
1348-C's handback reported (rival-shelving fixtures + one UI test, +307 insertions, 0 relevant
overlap). `git status --short` in the real repo shows a handful of OTHER concurrent agents'
untracked evidence files (e.g. `1344-C-shelving-red-handback.md`, `1351-C-p15a2-red-handback.md`)
appearing during this session — none named `1348-*`, none touched by me; reported for
transparency, not something this revision caused or needs to clean up.

## Method

Same scratch tree, same 1327-C method, no rebuild needed (the tree already existed from 1348-C).
Edited the three files directly, ran disposable probes appended temporarily inside
`tests/p14b5-relationships.test.ts` (a `describe('PROBE 1348-C2 D5 settlement', ...)` block) to
work out the exact re-sign/staging mechanics for the settlement-level leaves before writing the
final versions, then replaced the probe block with the final, documented leaves (no probe code
remains in the patch — confirmed by reading the final file and by the patch's own diff below).

## Durations (measured on this scratch tree)

- `tests/p14b10-conflict-evidence.test.ts` alone: ~7.5s wall (20 tests, includes one ~1.4s real
  casting-competition route and one ~0.9s D5-world build).
- `tests/p14b10-mentor-label.test.ts` alone: ~5s wall (9 tests, each a fast per-leaf import
  rejection; no heavy fixture reached since every leaf fails before constructing one).
- `tests/p14b5-relationships.test.ts`, FULL FILE (48 tests, all describe blocks, not just the
  edited ones): **48.4s test time / 55.3s wall**, 45 passed / 3 failed. The two new "family 6b"
  leaves cost ~14.4s (both-present, first build of `f6Base()`... actually the `f6Base()` memo was
  already warm from family 6's own tests earlier in the same run, so 14.4s reflects the real
  `tick()` + re-sign cost) and ~0.65s (only-enemy, cheaper — no second real signing, and the
  90-second-capped `f6Base()` memo is already warm).
- Root type gate (`tsc --noEmit -p tsconfig.json`): ~30-100s wall depending on cache warmth
  (one run needed to be moved to background and completed after ~100s).

## Files re-run (targeted, never a broad suite)

```
node_modules/.bin/vitest run --project core tests/p14b10-conflict-evidence.test.ts
node_modules/.bin/vitest run --project core tests/p14b10-mentor-label.test.ts
node_modules/.bin/vitest run --project core tests/p14b5-relationships.test.ts        # FULL FILE
node_modules/.bin/tsc --noEmit -p tsconfig.json
```

Running the full `p14b5-relationships.test.ts` file (not just a `-t` pattern) was a deliberate
choice for this revision: the new describe block reuses this file's own private, heavily
tie-engineered fixtures, so the strongest available check that nothing else in the file broke is
running literally everything in it. Result: **45 passed, 3 failed**, and the 3 failures are
exactly the two pre-existing pin edits plus the one new genuine-RED settlement leaf — no other
test's outcome moved.

## Per-leaf RED reasons observed

### `tests/p14b10-mentor-label.test.ts` (9/9 independently measured; full run)

```
 ❯ |core| tests/p14b10-mentor-label.test.ts (9 tests | 9 failed) 29ms
```

Each of the 9 leaves shows this exact line, attributed individually to that leaf (not a single
collection-level line for the whole file):

```
Failed to load url ../src/core/relationshipLabels.js (resolved id: ../src/core/relationshipLabels.js)
in .../tests/p14b10-mentor-label.test.ts. Does the file exist?
```

(The importer path in the error text is this file's own path in every case, since this file's
leaves are the only ones importing this specifier in an isolated single-file run — matching the
`1346-C` precedent's own noted Vite quirk about importer-path attribution when multiple files
share an unresolved specifier, not applicable here since only one file was run.)

### `tests/p14b5-relationships.test.ts` new leaves (targeted + full-file run)

```
✓ family 6b ... > a player issuer: both a close tie and an enemy (with conflict evidence) on the
  roster — settlement reads close ties here (2) [control...]                         734ms (full run)
× family 6b ... > a player issuer: only the enemy (with conflict evidence) on the roster —
  settlement reads enemies here (0), the rival wins                                  510ms (full run)
  → AssertionError: expected 'declined' to be 'settled'
    Expected: "settled"
    Received: "declined"
     ❯ tests/p14b5-relationships.test.ts:1062:26
       expect(receipt.kind).toBe('settled')
```

Full measured receipt at BASE for the "only enemy" leaf (captured during the probe phase, same
staging as the final leaf): `{"kind":"declined","week":208,"talentId":"person-studio-5a47d054-r04-3",
"studioId":null,"reasons":["this person could not separate 2 equally ranked proposals."],
"dropped":[...3 IMPOSSIBLE-attachment entries...],"eventId":"talent-market-event-133"}` — byte-for-byte
identical in shape to the pre-existing family-6 "base (no edge)" leaf's receipt, confirming the v1
redirect makes the enemy-only signal invisible to the settlement exactly as the tier law predicts.

Full measured receipt for the "both present" leaf: `{"kind":"settled","week":208,
"studioId":"studio-5a47d054-player","reasons":["their roster holds this person's close ties"],
"dropped":[...],"eventId":"talent-market-event-133"}` — confirms the "close ties wins" outcome is
reached through the REAL `bandsFor`/`chooseProposal` path (talentMarket.ts:936-987), not a copied
literal.

### `tests/p14b10-conflict-evidence.test.ts` (unchanged behavior, citation-only edit)

Re-run in full: **12 failed, 8 passed** (20 total) — identical counts and identical failure/pass
set to 1348-C's original run; the citation fix touched only comments, confirmed by diffing the
two runs' output (no leaf moved).

## Type-gate output (final)

```
tests/p14b10-conflict-evidence.test.ts(94,26): error TS2305: Module '"../src/core/relationships.js"' has no exported member 'RELATIONSHIP_CONFLICT_COMPETITIONS'.
tests/p14b10-conflict-evidence.test.ts(96,34): error TS2305: Module '"../src/core/relationships.js"' has no exported member 'hasConflictEvidence'.
tests/p14b10-mentor-label.test.ts(95,24): error TS2307: Cannot find module '../src/core/relationshipLabels.js' or its corresponding type declarations.
[exited with code 2]
```

Exactly the same three expected errors as 1348-C (the dynamic-import line in the Mentor file still
type-checks against the missing module, same error class, different line number since the import
moved from a top-level statement to inside `loadLabels()`).

## Temporary-index apply check (against the current HEAD, per this revision's instruction)

```
HEAD=1d4275c052697329bf39c331ab30e9da4167ab6f
export GIT_INDEX_FILE=<scratch path, deleted after use>
git read-tree $HEAD
git apply --check --cached 1348-stage/1348-rel-sliceA-red-r2.patch   # CHECK_OK
git apply --cached 1348-stage/1348-rel-sliceA-red-r2.patch           # APPLY_OK
git write-tree
# -> bdb0163b020701e3c09cbcecc1b2411f4272aaf3
git diff-tree -r $HEAD bdb0163b020701e3c09cbcecc1b2411f4272aaf3
:000000 100644 ... A  tests/p14b10-conflict-evidence.test.ts
:000000 100644 ... A  tests/p14b10-mentor-label.test.ts
:100644 100644 b147a6d..19b896a M  tests/p14b5-relationships.test.ts
```

The patch (`1348-stage/1348-rel-sliceA-red-r2.patch`) is the FULL tests-only diff of the scratch
tree versus the ORIGINAL BASE `f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8` (not an incremental diff
against the r1 patch) — confirmed by `git diff --cached --stat` in the scratch tree, whose own
single `base` commit is still exactly that BASE's archived tree (no intermediate commit was ever
made there). It applies cleanly to a temporary index built from the CURRENT real-repo HEAD, using
`--cached` throughout (never `--index`, which touches the working tree) and a scratch
`GIT_INDEX_FILE`, confirmed never touching the real index or working tree (`git status --short`
before and after this check shows no change attributable to it — the only entries present are
other concurrent agents' own untracked files, named `1344-*`/`1351-*`, not `1348-*`).

## Files (handback)

- `1348-stage/1348-rel-sliceA-red-r2.patch` — full tests-only diff vs BASE (3 files, 33 leaves
  total: 20 in `tests/p14b10-conflict-evidence.test.ts`, 9 in `tests/p14b10-mentor-label.test.ts`,
  4 in `tests/p14b5-relationships.test.ts` — the original 2 pin edits plus 2 new settlement leaves).
- `1348-stage/1348-rel-sliceA-red-r2-classification.json` — 33 rows (24 `fails`, 9
  `control-passes`), each row noting explicitly whether it is unchanged from 1348-C or revised in
  1348-C2 and why.
- This file.

## Summary

Both 1348-D blocking defects closed: (1) Mentor file now gives each of its 9 leaves an
independently-measured RED reason via the established `1346-C` per-leaf dynamic-import technique,
every expectation unchanged; (2) a genuine settlement-level D5 test now exists through the real
`bandsFor`/`chooseProposal` path, reusing `tests/p14b5-relationships.test.ts`'s own `f6Base()`/
`settlementAt208()` apparatus — "both present" passes as a control at BASE (the shipped combinator
order, unchanged, already produces this outcome regardless of the evidence gate), "only enemy"
fails at BASE for the documented reason (v1's unconditional redirect to Strained keeps the
family-6 base tie), and the coverage is PLAYER issuer only, with the empty r01 roster measured and
disclosed rather than silently narrowed. The non-blocking D1-predicate citation is fixed. The
copied-combinator `d5Band()` leaves are kept as documentation and as the only rival-issuer D5
coverage, per the parent's explicit instruction. No expectation was loosened and no production
code was touched.
