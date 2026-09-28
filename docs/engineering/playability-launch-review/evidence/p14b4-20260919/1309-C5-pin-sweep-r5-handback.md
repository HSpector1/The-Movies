# 1309-C5 — sweep r5 handback

Base: `d09ce77e` (verified ancestor of the real repo's current HEAD `b717cb93`; `tests/`
unchanged since `fc0328f8` per the coordinator's own confirmation). Scope: the 5 exact fixes
(Z1–Z5) named in the task message, measured by the parent's full scratch core run on r4
(39 failed files / 165 failed tests / 4482 passed; no row newly failing vs r3).

## Deliverables

- `1309-stage5/1309-pin-sweep-r5.patch` — cumulative vs `d09ce77e`, 146 files (identical file
  set to r4's own patch — all 5 Z-fix files were already touched by r4 for other rulings).
  Verified with the isolated-temp-index technique (`git read-tree d09ce77e` into a scratch
  `GIT_INDEX_FILE`, `git apply --check ... --cached`): exit 0, both from the scratch build
  location and after copying into the real repo. No worktree used.
- `1309-stage5/1309-pin-sweep-r5-classification.json` — 671 rows: r4's 665 rows carried
  forward verbatim + 6 new rows tagged `Z1`–`Z5` (Z3 produced 2 rows: the import-line edit and
  the call-site edit). Rows built by ground-truth `diff -U0` hunk parsing between a freshly
  rebuilt "post-r4, pre-Z" baseline and the edited tree, then validated: every row's
  `old_text` is byte-present in the baseline and `new_text` is byte-present in the final file
  (0 failures across 12 checks).

## Environment note (disclosed, not a defect in the fixes below)

Setting up the r5 scratch baseline (`git archive d09ce77e | tar -x`, run twice for pristine
and work copies) hit a near-full scratch disk (`df -h`: 1.8Gi free of 113Gi, 99% capacity)
mid-extraction. This produced 641 `Write failed`/`Can't create` errors, **all confined to**
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/` (4715 tracked files at
this commit) in the `work` copy only — confirmed by diffing the two copies' non-evidence file
lists (3249 files each, path-identical) and independently confirming `pristine`'s evidence
subtree extracted in full (4715/4715) while `work`'s did not (4037/4715). None of the 641
failures touched `tests/`, `src/`, `bridge/`, `ui/`, or `generated/` — every file I needed for
Z1–Z5 was present and byte-identical to the real repo's current tree before I touched it. I
excluded `docs/` explicitly from the `diff -ruN` step that builds the patch, and confirmed the
final file list (146 files, all tests/src/bridge/ui) shows no docs contamination. This is
recorded here in case the same scratch volume is still under pressure for a later stage.

## Fix-by-fix

**Z1** — `tests/bridge-schema.test.ts:576`. `expect(generatedCsharp).toContain('public const
int ProjectionVersion = 54;')` pinned a stale value; `generated/unity/StudioBridgeDtos.Generated.cs:18`
reads `public const int ProjectionVersion = 56;` (confirmed by direct read). Changed the
literal `54` → `56`.

**Z2** — `tests/p14p4p5-opportunities.test.ts` Q04, line 350. Read the full Q04 block
(lines 318–372) to confirm the diagnosis: `current = saves.migrateToLive(old)` is the V41 live
envelope; `raw` is the genuine-V39 fixture's own serialized bytes (from `pinned39(...)`).
`api.convertV41ToV40(current)` yields a V40 envelope, and comparing its exported bytes to a
V39 `raw` string is a version mismatch by construction. `api.convertV40ToV39` is already
declared on the local `FutureAPI` type and already used at line 306 in this same file, so the
fix reuses the existing accessor rather than introducing a new one:
`saves.exportSave(api.convertV40ToV39(api.convertV41ToV40(current))).toBe(raw)`.

**Z3** — `tests/p14c3-save-v38.test.ts`, describe `'C.3 A11 lossless empty-boundary downgrade
and actual entrant authority'` (line 442), the `it.each([PRE207, CONTINUOUS208])` positive
test (line 443). `current = envelope38(migrated(filename))` is secretly a live V41 envelope
(per `envelope38()`'s own contract); `saveApi('convertV38ToV37')(current)` throws
`"validateSaveV38: expected version 38"` before any semantic downgrade logic runs. Confirmed
`migrateToV37` is a real exported composite migrator in `src/core/save.ts:10329`
(`if (save.saveVersion === 41) return migrateToV37(convertV41ToV40(save)); ...`), already used
the same way in `tests/p14c2s-scientist-retirement.test.ts:256`
(`const outgoing37 = migrateToV37(live)`). Added `migrateToV37` to this file's existing named
import from `../src/core/save.js` (line 11) and replaced the call site at line 446 with
`migrateToV37(current)`. `expect(downgraded.saveVersion).toBe(37)` and
`expect(exportSave(downgraded)).toBe(raw)` (line 447-448) are unchanged and still hold.

  **Left untouched, in scope only per the ruling's own line range**: the second test in the
  same `describe` block, `'refuses loss of a genuine entrant created at the same week as the38
  opening'` (line 452), whose assertion at line 463 (`saveApi('convertV38ToV37')(current)`
  against `.toThrow(/downgrade|entrant|discard/i)`) is built on the exact same
  `envelope38()`-secretly-live pattern and is very likely hitting the identical version-check
  masking. The ruling's coordinates ("~442-446, both PRE207 and CONTINUOUS208") name only the
  `it.each` test; the coordinator's own scoping language ("everything else remaining is out of
  scope or a scratch artifact") is the reason I did not extend the fix there. Flagging this as
  a likely-related, not-yet-authorized item for a future stage — I have not run anything to
  confirm it independently fails, since no project code execution is permitted in this role.

**Z4** — `tests/bridge-p14c2s-scientist-runtime.test.ts`, `it.each(CASES)` at line 102, one
shared assertion at line 119 that both `it.each` leaves (`'842 Scientist ...'` and `'824
retained retirement ...'`) run through. Read the full block (lines 1–140) to confirm: the
comparison `canonicalJson({ ...actual.state, careerLifecycle: oldLifecycle })` vs
`canonicalJson(withRivalTermination(old.state))` never excluded `actual.state.firstTakeSubjects`
(a V40-only root; `old` here is a V36-vintage fixture that never carried it). Confirmed
`firstTakes` (the field `firstTakeSubjects.cutoverOrdinal` is derived from) exists on
`GameStateV36` by inheritance (`src/core/save.ts:10450`'s own construction:
`firstTakeSubjects: { version: 1, cutoverOrdinal: old.state.firstTakes.length, facts: [] }`).
Applied the same exclude-and-assert pattern already used in
`tests/p14p4p5-opportunities.test.ts` Q04 (lines 344-346): destructured `firstTakeSubjects`
out of `actual.state` separately from the existing `careerLifecycle` destructure, asserted its
exact shape, then compared the remainder. One line replaced by 6 (comment + destructure +
assertion + the corrected comparison); no new imports needed (`canonicalJson`,
`withRivalTermination` already present).

**Z5** — `tests/p14c2b-save-v36.test.ts:29` (line 11 relative position aside — confirmed the
absolute line via grep). `validateSaveV36` is imported but, after r4's fix converting all 5 S3
tamper-test call sites to `validateSaveV41(makeSave(X))`, has zero remaining uses in the file
(`grep -n validateSaveV36` returns only the import line itself) — a genuine dead import
(`TS6133`). Removed it from the named-import list from `../src/core/save.js`; the sibling name
`validateSaveV41` on the same line is untouched and still used.

## Reproduction

```bash
cd /Users/zacheryspector/The-Movies-headless-program
TMPIDX=$(mktemp -u); export GIT_INDEX_FILE="$TMPIDX"
git read-tree d09ce77e
git apply --check docs/engineering/playability-launch-review/evidence/p14b4-20260919/1309-stage5/1309-pin-sweep-r5.patch --cached
echo $?   # 0
unset GIT_INDEX_FILE; rm -f "$TMPIDX"
```

## Anything I could not settle without execution

All 5 fixes are literal/regex/import corrections or a substitution of one already-proven
accessor (`api.convertV40ToV39`, `migrateToV37`) for a masked one; none required guessing at a
runtime error message I couldn't otherwise source. The one open item is the Z3-adjacent
negative-refusal test noted above (`p14c3-save-v38.test.ts:463`) — plausible but unconfirmed
without a real run, and explicitly out of the ruling's named line range, so left alone.
