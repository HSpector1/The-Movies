# 1348-C4: lawful rival roster row, and a finding it does not survive the tick

Role: independent test engineer (test-author). Task: revision of record 1348-C3's RED tests,
requested by the coordinator after reading the parent dry run
[1348-X3](1348-X3-rel-sliceA-red-r3-dry-run.md) of `1348-rel-sliceA-red-r3.patch`. Same scratch
tree as 1348-C/C2/C3:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1348-work/tree`.

## The requested change

1348-C3's "BRANCH 2 over 0" control staged a raw `IndustryEmployment` row for r01, spliced into
`hollywood.employment` but left OUT of `hollywood.activeEmploymentOrdinals` — a state the full
save validator rejects (`hollywoodValidation.ts:201`: ordinal membership must equal
`endedWeek===null && endWeekExclusive>tick` for every row). The coordinator's instruction: make
the row lawful (real ordinal membership, contract terms/interval a rival may hold), assert the
full validator accepts it before ticking, and keep the same three branch sentences and RED status
— or, if no lawful construction exists, report the blocking check's file:line and move the branch
to an exported pure accessor `relationshipsReasonSentence(band: 0|1|2): string`.

## What I did

1. **Made the row pass the save validator.** Three separate defects in the C3 row, found and fixed
   in order by re-running `makeSave()` against the staged state after each fix:
   - `contractId` was an arbitrary string (`'p14b10-r01-staged-contract'`). The real format for a
     non-player contract is `${studioId}:contract:${talentId}:${startWeek}`
     (`hollywoodValidation.ts:176-177`). Fixed.
   - The row's ordinal was absent from `activeEmploymentOrdinals` — the coordinator's own named
     defect (`hollywoodValidation.ts:201`). Fixed: computed the row's real ordinal
     (`employment.length` at splice time) and included it.
   - A THIRD defect the coordinator's message did not name, found only by actually running
     `makeSave()`: every employment interval needs a matching `IndustryReceipt` of kind
     `'employment'` (`hollywoodValidation.ts:522-523`, "employment interval lacks exact signing or
     observation receipt") — with the canonical `industry-event-N` id and `hollywood.nextReceipt`
     incremented to match. Fixed by appending a synthetic `entry` receipt alongside the row.
   - **Result: `makeSave(withRivalEdge)` returns `saveVersion: 42` with no throw** — measured
     directly on this scratch tree (disposable probe, not in the patch). The row IS validator-lawful.
2. **Found the row does not survive the tick.** Even validator-lawful, `tick()` on that state
   terminates the injected employee the SAME week, and `rosterAt(after, base.r01, F6.subject,
   F6.W)` returns `[]` post-tick — the row never reaches settlement. Traced to the exact mechanism
   (see "Finding" below) and confirmed it is not fixable with contract-term tuning alone (the
   escape conditions require either a live production/research seat or being within
   `TUNING.HIRING_TERMINATION_CAP_WEEKS` of natural expiry — neither applies to a freshly-staged,
   idle actor).
3. **Applied the coordinator's fallback.** Per the explicit instruction for exactly this outcome,
   "BRANCH 2 over 0" now tests a NEW exported pure accessor, `relationshipsReasonSentence(band: 0 |
   1 | 2): string`, in `src/core/relationships.ts` — a genuine PARENT API DECISION for this
   revision (name and signature exactly as the coordinator proposed), loaded via a dynamic
   `await import('../src/core/relationships.js')` inside the leaf (matching the technique
   `tests/p14b10-mentor-label.test.ts`'s `loadLabels()` already uses for a new export on an
   existing module), asserting `typeof === 'function'` before calling it. This is genuinely RED at
   BASE (the export does not exist), for the correct reason.
4. **"BRANCH 2 over 1" and "BRANCH 1 over 0" are UNCHANGED** from 1348-C3, byte-for-byte — neither
   needs any rival-side signal (r01 naturally holds no employee this subject's roster admits in
   both scenarios), so both remain settlement-path leaves with the same sentences and RED status.
5. Removed the now-unused `IndustryEmployment` type import (the raw-row construction it typed is
   gone from the file); confirmed via the type gate that nothing else references it
   (`noUnusedLocals` is on in this repo's `tsconfig.json`, which would otherwise fail the build).

## Finding: the blocking check is not the save validator

**File:line:** `src/core/hollywoodTick.ts:182-195` (the `staff()` function's rival
surplus-termination loop), not `hollywoodValidation.ts:201` as originally suspected (that specific
check IS satisfiable — see above).

**Mechanism, read directly and confirmed by measurement:**
- `hollywoodTick.ts:182-183` computes `surplus` as every `activeEmploymentOrdinals` member of a
  rival business that is NOT one of the `filled` set — the fixed `RIVAL_TEAM_ROLES` canonical
  production-role slots the earlier part of `staff()` (`:127-159`) explicitly retains or hires for
  — and whose role is not `'scientist'`.
- `hollywoodTick.ts:187` is the only escape: `if(seated.has(id)||e.terms.endWeekExclusive-week<=
  TUNING.HIRING_TERMINATION_CAP_WEEKS)continue` — the person must be actively seated on a live
  production or research project (`industryBusyTalentIds`, `:180-181`), or within
  `HIRING_TERMINATION_CAP_WEEKS` of their contract's own natural expiry.
- `hollywoodTick.ts:190-195` then closes the row (`endedWeek: week`) and mints a `termination`
  receipt, THE SAME WEEK, unconditionally for everyone that fails both escapes.

A freshly-staged actor in no canonical role and no production/research seat, with a normal
208-week term nowhere near expiry, satisfies neither escape. Measured directly on this scratch
tree: the staged row's `endedWeek` read the tick's own processing week immediately post-tick, and
`rosterAt(after, base.r01, F6.subject, F6.W)` returned `[]`. This is a genuine, deterministic
invariant of the rival's own weekly staffing policy — a rival cannot durably hold a person outside
its fixed canonical roles, independent of the save validator, and independent of the specific
contract terms chosen (tried the real `startWeek`/`endWeekExclusive`/`termWeeks` a genuine hire
would use; the termination fires regardless). Avoiding it would require ALSO faking a live
production or research-seat assignment for the injected person — a materially larger, still
entirely synthetic construction (a fake `Production`/`ScriptProject` entry, its own validator
surface, its own risk of yet another undiscovered downstream invariant) that this revision's scope
does not extend to. Reported as the finding the coordinator's instruction asked for, rather than
attempted silently.

## PARENT API DECISION (this revision, per the coordinator's own proposed signature)

`src/core/relationships.ts`: `export function relationshipsReasonSentence(band: 0 | 1 | 2):
string`. Pure, no state parameter — takes the WINNER's own D5 relationships band and returns the
settlement reason sentence 1348-F2 specifies: band 2 → `"their roster holds this person's close
ties"`; band 1 → `"every other offer comes from a roster holding someone this person is at odds
with"` (only reachable as a winning, decisive band via band-0 losers, per 1348-F2's own
structural argument — see 1348-C3's handback). Band 0 is included in the type for exhaustiveness
(a losing band can never itself be the WINNER's band when relationships is decisive) but no
specific return value is pinned for it by this record's tests — not required by the coordinator's
instruction and not asserted here. Production would presumably call this from `chooseProposal` in
place of the flat `DESCRIPTOR_REASON.relationships` lookup, passing `bands.get(winner)!.relationships`
as `band`; not implemented, this is test-authoring only.

## Base / HEAD check

BASE unchanged: `f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8`. Real-repo HEAD at the end of this
revision: `5374e10553fbee7259b7fd91a8724407792eb6a3`. `git diff --stat BASE..HEAD -- src bridge ui
tests` shows the same six unrelated files as every prior handback in this thread (rival-shelving
fixtures + one UI test), no overlap with this record's files.

## Method

Same scratch tree, no rebuild. Iterated the lawful-row construction with a disposable
`describe('PROBE 1348-C4 lawful roster row', ...)` block appended temporarily after the "D5 REASON
SENTENCE" describe block: first measured the exact validator rejection reasons (contractId format,
then the missing receipt), fixed each in turn until `makeSave()` returned `saveVersion: 42`
cleanly, then measured the post-tick roster and found it empty, confirming the deeper defect. The
probe block, and the abandoned raw-row leaf it was investigating, are both removed from the final
patch — replaced by the accessor-based leaf.

## Re-run (targeted, never a broad suite)

```
node_modules/.bin/vitest run --project core tests/p14b10-conflict-evidence.test.ts tests/p14b10-mentor-label.test.ts
node_modules/.bin/vitest run --project core tests/p14b5-relationships.test.ts        # FULL FILE
node_modules/.bin/tsc --noEmit -p tsconfig.json
```

### `tests/p14b10-conflict-evidence.test.ts` + `tests/p14b10-mentor-label.test.ts`

Unchanged from 1348-C3 (neither file touched this revision): **21 failed, 8 passed** (29 total).

### `tests/p14b5-relationships.test.ts` (full file, 51 tests)

```
Test Files  1 failed (1)
     Tests  5 failed | 46 passed (51)
```

Versus 1348-C3's full-file run (4 failed / 47 passed): net **+1 failed, -1 passed**, exactly the
"BRANCH 2 over 0" leaf moving from a control-pass (settlement path, now-abandoned raw-row
construction) to a genuine RED fail (the new accessor export does not exist at BASE). No other
leaf's outcome moved — confirmed the full 44 pre-existing tests plus `family 6b`'s two leaves and
the sibling `D5 REASON SENTENCE` leaves ("2 over 1", "1 over 0") all read identically to 1348-C3.

## Per-leaf RED reasons observed (changed leaf only)

```
× D5 REASON SENTENCE ... > BRANCH 2 over 0: the exported relationshipsReasonSentence(2) is the
  close-ties sentence, unchanged — the winner's own band governs, no loser band matters
  [RED: export does not exist at BASE]                                                    3ms
  → AssertionError: expected 'undefined' to be 'function'
    Expected: "function"
    Received: "undefined"
```

Unchanged siblings, for completeness:

```
✓ D5 REASON SENTENCE ... > BRANCH 2 over 1: ... [control]                                459ms
× D5 REASON SENTENCE ... > BRANCH 1 over 0: ... [RED under v1]                           202ms
  → AssertionError: expected 'declined' to be 'settled'
✓ family 6b ... > both present [control]                                              12318ms
× family 6b ... > only the enemy ... [RED under v1]                                     282ms
  → AssertionError: expected 'declined' to be 'settled'
```

## Type-gate output (final)

```
tests/p14b10-conflict-evidence.test.ts(94,26): error TS2305: Module '"../src/core/relationships.js"' has no exported member 'RELATIONSHIP_CONFLICT_COMPETITIONS'.
tests/p14b10-conflict-evidence.test.ts(96,34): error TS2305: Module '"../src/core/relationships.js"' has no exported member 'hasConflictEvidence'.
tests/p14b10-mentor-label.test.ts(95,24): error TS2307: Cannot find module '../src/core/relationshipLabels.js' or its corresponding type declarations.
[exited with code 2]
```

Identical three expected errors. The new `relationshipsReasonSentence` accessor is read through a
dynamic import typed as `Record<string, unknown>` (the same defensive pattern used everywhere else
in this thread for a not-yet-existing export), so it produces no NEW type error — `tsc` has
nothing to check statically against a runtime-typed dynamic import. Removing the now-unused
`IndustryEmployment` import kept `noUnusedLocals` satisfied.

## Temporary-index apply check (against HEAD e8caeb90, as instructed)

```
TARGET=e8caeb90
export GIT_INDEX_FILE=<scratch path, deleted after use>
git read-tree $TARGET
git apply --check --cached 1348-stage/1348-rel-sliceA-red-r4.patch   # CHECK_OK
git apply --cached 1348-stage/1348-rel-sliceA-red-r4.patch           # APPLY_OK
git write-tree
# -> 8d4faf38f6771eaca98d88d8662fc12ca39f67cb
git diff-tree -r $TARGET 8d4faf38f6771eaca98d88d8662fc12ca39f67cb
:000000 100644 ... A  tests/p14b10-conflict-evidence.test.ts
:000000 100644 ... A  tests/p14b10-mentor-label.test.ts
:100644 100644 b147a6d..2153965 M  tests/p14b5-relationships.test.ts
```

`--cached` throughout (never `--index`), a scratch `GIT_INDEX_FILE`, confirmed via
`git status --short -- src bridge ui tests` (empty, both before and after) that the real index and
working tree were never touched. Note `e8caeb90` is an earlier ancestor of the real repo's current
HEAD (`5374e105...`, per the base/HEAD check above); the patch also applies cleanly against the
real repo's LATEST HEAD (checked the same way, tree `8d4faf3...` would differ only by the ambient
commit graph, not by any conflicting content — `git diff --stat BASE..HEAD -- src bridge ui tests`
confirms no relevant file moved between `e8caeb90` and the current HEAD either).

## Files (handback)

- `1348-stage/1348-rel-sliceA-red-r4.patch` — full tests-only diff vs BASE
  `f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8` (3 files, 829 insertions / 2 deletions; 36 leaves
  total: 20 + 9 + 7, same count as r3 — one leaf's method changed, none added or removed).
- `1348-stage/1348-rel-sliceA-red-r4-classification.json` — 36 rows (26 `fails`, 10
  `control-passes`).
- This file.

## Summary

The C3 "2 over 0" leaf's save-validator defect is fixed and independently confirmed
(`makeSave()` now accepts the staged state cleanly) — but a SECOND, deeper invariant
(`hollywoodTick.ts:182-195`, the rival's own weekly surplus-termination policy) prevents any
non-canonical-role rival employee from surviving to settlement regardless of contract validity, so
no lawful construction through the real settlement path exists for this branch within this
record's scope. Per the coordinator's own fallback instruction, the branch now tests a new
exported pure accessor, `relationshipsReasonSentence(band: 0|1|2): string`, proposed with the
coordinator's own name/signature, RED at BASE for the correct reason (missing export). "2 over 1"
and "1 over 0" are unchanged. Everything else in the patch (the conflict-evidence file, the Mentor
file, the two version pins, `family 6b`'s two leaves) is byte-unchanged from 1348-C3. No
production code was touched.
