# 1348-C3: D5 reason-sentence correction and companion-copy test (per re-review 1348-D2, parent decision 1348-F2)

Role: independent test engineer (test-author). Task: revision of record 1348-C2's RED tests,
requested by the coordinator after re-review [1348-D2](1348-D2-rel-sliceA-red-r2-review.md)
returned ACCEPT but its trace exposed a defect the parent then ruled on in
[1348-F2](1348-F2-parent-d5-reason-sentence.md). Same scratch tree as 1348-C/1348-C2:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1348-work/tree`.

## The defect (as the parent stated it)

1348-C2's "only enemy" settlement leaf asserted `reasons: ["their roster holds this person's
close ties"]` for r01's win — but r01 wins there at band 1 ("none"), beating the player's band 0
("enemies here"); r01's own roster holds no close tie at all. The sentence would have been false.
1348-F2's decision: the `relationships` reason now depends on the **winner's own band**, not
merely on "relationships was the decisive descriptor":
- winner band 2 (close ties): `"their roster holds this person's close ties"` — unchanged;
- winner band 1 over a band-0 loser: `"every other offer comes from a roster holding someone this
  person is at odds with"` — NEW.

## What changed

1. **`tests/p14b5-relationships.test.ts`, `family 6b`'s "only enemy" leaf** — expected `reasons`
   changed from the close-ties sentence to the new at-odds sentence. Nothing else in this leaf's
   staging changed (same `stagedEdge`/`stage()`/`tick()` construction as 1348-C2).
2. **New describe block, `D5 REASON SENTENCE — companion-copy test per branch (record 1348-C3,
   parent decision 1348-F2)`**, added directly after `family 6b`, with three dedicated leaves
   pinning each reachable branch's literal sentence through the real settlement path:
   - **BRANCH 2 over 1** (control, passes at BASE): a close tie (band 2) beats a roster holding no
     signal at all (band 1, r01's natural empty-roster state). Pins the UNCHANGED close-ties
     sentence. This is the first place in the whole test suite that pins the LITERAL sentence text
     for this case — the pre-existing family-6 test only checks structural properties (length 1,
     no digit, no name), never the exact string.
   - **BRANCH 2 over 0** (control, passes at BASE): a close tie (band 2, player, real staging)
     beats a roster genuinely holding an evidence-backed enemy (band 0 once v2 lands; band 1 today
     because of the v1 redirect). Pins the SAME close-ties sentence, since 1348-F2's rule depends
     only on the WINNER's band — this leaf's whole point is proving that identity holds even when
     the loser's own band differs, i.e. that a hypothetical wrong implementation which made the
     sentence depend on BOTH proposals' bands (not just the winner's) would be caught. r01's
     roster genuinely holds the enemy for this leaf via a NEW technique: a raw, ordinal-untracked
     `IndustryEmployment` row (rivals have no `signContract`-equivalent action, unlike the player
     side's real re-sign trick from 1348-C2) — see "New technique" below.
   - **BRANCH 1 over 0** (fails, genuine RED at BASE): a roster holding no signal (band 1, r01)
     beats a roster holding an evidence-backed enemy (band 0 once v2 lands, player). Pins the NEW
     at-odds sentence, plus its own sentence-class check (no digit, no person/studio/tier name,
     per 1348-F2: "stays in the sentence class of :744-745"). This scenario is the SAME underlying
     construction as `family 6b`'s "only enemy" leaf (deliberately — the companion-copy convention
     calls for pinning the branch explicitly, even where the scenario is shared with an existing
     leaf), so both leaves are RED for the identical measured reason.

No production export was needed. All three branches are reachable through the real settlement
path using `f6Base()`'s existing two-survivor tie, so the coordinator's fallback ("through the
exported reason accessor if production must export one") does not apply — see "Findings" below.

## New technique: a raw employment row for the RIVAL side

`family 6b`'s "both present" leaf (1348-C2) gave the PLAYER a second roster member by genuinely
re-signing a real, already-free talent (`base.reliable`) via a real `signContract` action — safe
because that action correctly updates `activeEmploymentOrdinals` and every other invariant.
Rivals have no equivalent player-style hiring action reachable from a test. For BRANCH 2-over-0,
r01 needed a genuine roster member for the first time in this file. Built directly as a plain
`IndustryEmployment` row (`hollywoodTypes.ts:74-79`: `{contractId, studioId, terms: Contract,
endedWeek, reason}`), spliced into `state.hollywood.employment` via plain object spread — **not**
added to `state.hollywood.activeEmploymentOrdinals`, and the combined state is **not** re-run
through `stage()`/`live()`/`makeSave()` afterward (which would reject it:
`hollywoodValidation.ts:201` requires every row's ordinal membership to exactly match
`endedWeek===null && endWeekExclusive>week`, which this deliberately-untracked row violates by
design). This mirrors the SAME "real action first, raw/untracked splice after, no further
validation" discipline already used for the Mentor fixtures' in-memory `firstTakes` variants
(1348-C's own documented precedent). Measured empirically on this scratch tree (disposable probe,
not in the patch) before landing the final leaf: `rosterAt(tick(...), base.r01, F6.subject,
F6.W)` correctly returns exactly the injected person, and the settlement runs to completion with
no error, confirming the untracked row is invisible to every system that scans employment via
`activeEmploymentOrdinals` (discovery, payroll, etc.) while remaining visible to `rosterAt`'s own
direct `hollywood.employment` scan (`talentMarket.ts:867-874`, unaffected by ordinals).

## Findings

**No new production export needed.** The coordinator's instruction offered a fallback ("through
the exported reason accessor if production must export one, propose its name/signature") in case
the settlement apparatus could not reach all three branches. It could, using the technique above,
so no new export is proposed. If a future reviewer judges the raw-row-injection technique too
novel for a regression guard that must survive independently of `f6Base()`'s specific fixture,
the fallback path would look like: `export function relationshipsReasonSentence(band: 0 | 1 | 2):
string` in `src/core/relationships.ts` (pure, no state), called from `talentMarket.ts`'s
`chooseProposal` in place of the flat `DESCRIPTOR_REASON.relationships` lookup — named here as a
finding only, not implemented or required by this record.

## Base / HEAD check

BASE unchanged: `f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8`. HEAD at the end of this revision:
`8e8a4e5604bcff50f221f3aff698f1af1226673a`. `git diff --stat BASE..HEAD -- src bridge ui tests`
shows the same six unrelated files as every prior handback in this thread (rival-shelving
fixtures + one UI test), no overlap with this record's files. `git status --short` in the real
repo shows only this revision's own new/updated evidence files plus other concurrent agents'
unrelated untracked records (none named `1348-*`).

## Method

Same scratch tree, no rebuild. Probed the raw-row-injection mechanics with a disposable
`describe('PROBE 1348-C3 2-over-0', ...)` block appended temporarily after `family 6b`, confirmed
the roster/settlement outcome, then replaced the probe with the final three-leaf describe block
(no probe code remains in the patch).

## Re-run (targeted, never a broad suite)

```
node_modules/.bin/vitest run --project core tests/p14b10-conflict-evidence.test.ts tests/p14b10-mentor-label.test.ts
node_modules/.bin/vitest run --project core tests/p14b5-relationships.test.ts        # FULL FILE
node_modules/.bin/tsc --noEmit -p tsconfig.json
```

### `tests/p14b10-conflict-evidence.test.ts` + `tests/p14b10-mentor-label.test.ts`

Unchanged from 1348-C2 (this revision touched neither file): **21 failed, 8 passed** (29 total —
20+9), identical counts and identical failure/pass set.

### `tests/p14b5-relationships.test.ts` (full file, 51 tests)

```
Test Files  1 failed (1)
     Tests  4 failed | 47 passed (51)
```

The 4 failures: the two pre-existing `RELATIONSHIP_RULES_VERSION` pin edits (unchanged, "moves by
ruling"), `family 6b`'s "only enemy" leaf (now pinning the corrected at-odds sentence), and the
new dedicated `BRANCH 1 over 0` leaf. The 47 passes include all 45 pre-existing tests
(unaffected), `family 6b`'s "both present" leaf, and the two new control branches (`2 over 1`,
`2 over 0`). No other test's outcome moved versus the r2 full-file run (45 passed / 3 failed
there; +3 new leaves here, net +2 passed / +1 failed, exactly matching the new leaves' own
individually-measured results below).

## Per-leaf RED reasons observed (new/changed leaves only; full text also in the classification JSON)

```
× family 6b ... > a player issuer: only the enemy (with conflict evidence) on the roster —
  settlement reads enemies here (0), the rival wins with the AT-ODDS sentence (1348-F2)   599ms
  → AssertionError: expected 'declined' to be 'settled'
    Expected: "settled"
    Received: "declined"

✓ D5 REASON SENTENCE ... > BRANCH 2 over 1: ... reads the close-ties sentence, unchanged
  [control]                                                                              1094ms

✓ D5 REASON SENTENCE ... > BRANCH 2 over 0: ... reads the SAME close-ties sentence, the
  winner's own band governs [control]                                                     582ms

× D5 REASON SENTENCE ... > BRANCH 1 over 0: ... reads the NEW at-odds sentence [RED under v1]
                                                                                            484ms
  → AssertionError: expected 'declined' to be 'settled'
    Expected: "settled"
    Received: "declined"
```

Both RED leaves measure the identical receipt at BASE:
`{"kind":"declined","reasons":["this person could not separate 2 equally ranked proposals."]}` —
byte-for-byte the same shape as the pre-existing family-6 base (no-edge) leaf's receipt, confirming
the v1 tier-law redirect (not any change to `chooseProposal`/`bandsFor`) is the sole cause.

## Type-gate output (final)

```
tests/p14b10-conflict-evidence.test.ts(94,26): error TS2305: Module '"../src/core/relationships.js"' has no exported member 'RELATIONSHIP_CONFLICT_COMPETITIONS'.
tests/p14b10-conflict-evidence.test.ts(96,34): error TS2305: Module '"../src/core/relationships.js"' has no exported member 'hasConflictEvidence'.
tests/p14b10-mentor-label.test.ts(95,24): error TS2307: Cannot find module '../src/core/relationshipLabels.js' or its corresponding type declarations.
[exited with code 2]
```

Identical three expected errors; the new `IndustryEmployment`-typed code in
`tests/p14b5-relationships.test.ts` type-checks cleanly (no new errors).

## Temporary-index apply check (against the current HEAD)

```
HEAD=8e8a4e5604bcff50f221f3aff698f1af1226673a
export GIT_INDEX_FILE=<scratch path, deleted after use>
git read-tree $HEAD
git apply --check --cached 1348-stage/1348-rel-sliceA-red-r3.patch   # CHECK_OK
git apply --cached 1348-stage/1348-rel-sliceA-red-r3.patch           # APPLY_OK
git write-tree
# -> 77dbe5ec5d87f794eb83c59031e736f3e2473875
git diff-tree -r $HEAD 77dbe5ec5d87f794eb83c59031e736f3e2473875
:000000 100644 ... A  tests/p14b10-conflict-evidence.test.ts
:000000 100644 ... A  tests/p14b10-mentor-label.test.ts
:100644 100644 b147a6d..76e58bb M  tests/p14b5-relationships.test.ts
```

`--cached` throughout (never `--index`), a scratch `GIT_INDEX_FILE`, confirmed via
`git status --short -- src bridge ui tests` (empty, both before and after) that the real index
and working tree were never touched.

## Files (handback)

- `1348-stage/1348-rel-sliceA-red-r3.patch` — full tests-only diff vs BASE
  `f5b2ab92651d10e33c58f3f628b5d6eca3e96ca8` (3 files, 813 insertions / 2 deletions; 36 leaves
  total: 20 + 9 + 7).
- `1348-stage/1348-rel-sliceA-red-r3-classification.json` — 36 rows (25 `fails`, 11
  `control-passes`).
- This file.

## Summary

The false-reason defect 1348-D2's trace exposed is fixed: the "only enemy" leaf now pins the
parent's corrected at-odds sentence, and a new dedicated three-leaf companion-copy block pins the
literal sentence for all three reachable branches (2-over-1, 2-over-0, 1-over-0) through the real
settlement path — no leaf asserts a sentence the winner's own roster does not support. No new
production export was needed; a fallback export shape is named as a finding only. Everything else
(`tests/p14b10-conflict-evidence.test.ts`, the Mentor file, the two version pins) is byte-unchanged
from 1348-C2. No production code was touched.
