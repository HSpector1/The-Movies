# 1358-N G4 handback: versions, sentinels and UI

The G4 author wrote this handback on 2026-10-02 at 03:49 CDT. The work happened in worktree
`/Users/zacheryspector/studio-scratch/1358-sweep/g4`, branch `sweep-g4`, which starts at tag `step4` (8e02a44).

## Deliverables

- `patch.diff`: `git -C <worktree> diff step4 -- tests ui`. It is 56,832 bytes with sha256
  `e4af1e3e3dd75f54572a4e0ddab7d0048f5ffef1d07201f450029b475e52cc82`, and it changes 36 files (+120/-120).
  - `git diff --stat step4 -- . ':!tests' ':!ui/src'` prints nothing.
  - The five changed `ui/` files are all `*.test.ts` or `*.test.tsx`.
  - `git apply --check --cached` passes against `step4` with a temporary index, which I wrote under `out/g4` and deleted after.
  - At repo HEAD b17e8ac2, all 37 G4 files carry the same blobs as `step4`, so the patch applies there unchanged.
- `classification.json`: 120 objects, one per census row edited. Every row has status `certain`. `old` and `new` give
  the stripped line at `step4` and at the post-image. No line moved, so post-image line numbers equal the census numbers.
- `deferred.json`: 8 objects. Four are the census `measure` rows; four are new S9 observations (G4-new-1 to G4-new-4).
- Commits on `sweep-g4`:
  - 0b5fd74 (S1);
  - a304127 (S2);
  - 232d0a5 (S3 and P5).

## Counts by class

| Class | Census rows | Edited | Deferred |
|---|---:|---:|---:|
| S1 live validator selection | 51 | 51 | 0 |
| S2 live literals (the eight UI pins included) | 34 | 34 | 0 |
| S3 future-version sentinels | 25 | 25 | 0 |
| P5 renamed titles | 10 | 10 | 0 |
| S9 first-guard masking | 3 | 0 | 3, plus 4 new (G4-new-1 to 4) |
| S10 natural-chain values | 1 | 0 | 1 |
| Total | 124 | 120 | 8 |

36 of the 37 assigned files changed. `tests/p13a-scientist-foundation.test.ts` holds only the S10 row and stays as it is.

## What I checked before editing

- **S1.** Every input is live: `makeSave`, `exportSave(makeSave(...))`, a clone of either, or an explicit
  `LIVE_SAVE_VERSION` stamp (`p14c4-save-v35:277`). Every tamper leaf still meets its own guard.
  - Before it calls the frozen V43 chain, `validateSaveV44` checks only the envelope keys, the version, `checkEnvelope`
    and `validateRelationshipsRoot(raw, 44)` (`src/core/save.ts:10763-10772`).
  - The root check reads `market.tick`, `studioHistory.recordingStartedWeek`, the talent ids and the edges
    (`src/core/relationships.ts:666-811`). No tamper in these files touches any of them.
  - `makeSave` validates through `validateSaveV44` itself (`src/core/save.ts:6571-6572`), so the `makeSave(tampered)`
    leaves in `p14c2b-save-v36` throw there, at the same guard.
  - No renamed call sits under a bare `.toThrow()`, so no S1 row needed an S8 row.
- **S3.** Every regex matches the production message exactly: `validateSave: unknown saveVersion 45 (this build handles
  versions 1 through 44 only)` (`src/core/save.ts:5444-5446`). Stamp 44 now dispatches to `validateSaveV44`
  (`:5443`).
  - The class includes `d17a-adv-migration:274` and `d17b-save-v7:163`.
  - No sentinel leaf in G4 uses a bare `.toThrow()`.
  - Every S3 leaf asserts the unknown-version refusal. The V16 assertion at `d17b-save-v7:167` does not change.
- **film-chronicle.** `:911`, `:922` and the guard at `:923` all moved to 44. The guard now narrows `restored` to
  `SaveFileV44`, which `migrateToCurrentControl(save: SaveFile)` accepts (`tests/_historicalCurrent.ts:11`).
- **The eight UI pins** read the live writer. `exportSaveJson` is `exportCurrentState` (`ui/src/engine/adapter.ts:3779-3781`),
  and `importSaveJson` computes `converted` from `LIVE_SAVE_VERSION` (`:3795`).
- **P5.** No file with a renamed title holds a 1348-I or 1348-I2 identity. The three retained G4 identities sit in
  `p13a-scientist-foundation`, which I left unedited. No renamed title duplicates another title in its file.

## Census rows found wrong

None. Each row's text matches the `step4` line verbatim, and each edit follows the row's own instruction. I found one
point of tension, recorded for the reviewer rather than as an error. Five P5 rows rename sentinel titles that were
already stale before this sweep: `p13b-s2-save-v22:211`, `p13b-s3-save-v23:124`, `p13b-s8-save-v27:211`,
`p14a1-save-v28:252` and `p14b1-save-v29:202`, which named 43 or "1 through 42". 1358-N's P5 text says stale titles
stay. 1358-J 3k and the census list these five, and 1358-F9 ruling 5 counts them among the 17, so I renamed them.

## New rows

I found no missed edit site. A scan of every line in the 37 files for `43`, `44`, `V43`, `1 through` and
`unknown saveVersion` found only census rows, apart from non-version numbers (fit values, week counts, fixture names).

I added four deferred S9 observations. None is an edit.

- **G4-new-1, `p13b-s8-save-v27:188`.** The leaf runs `save.migrateToV26(makeSave(natural))` with regex
  `/cannot downgrade/i`.
- **G4-new-2, `p13b-s8-save-v27:195`.** The same week-20 campaign meets the same production chain.
- **G4-new-3, `p14c2b-save-v36:74`.** The leaf runs `convertV36ToV35(liveEnvelopeV36(settled))` with regex
  `/downgrade/i`. The chain runs through H's helper `p14c2b-fixtures:69`.
- **G4-new-4, `p14c2b-save-v36:82`.** The same helper chain runs from week 92.

The V39 guard already fires ahead of each leaf's named guard. 1344-X12 measured this; 1344-C5 items 39 and 58 record it,
and the p14c2b file comment dates it to 1309-X3. Save44 can put
`convertV44ToV43` first (`src/core/save.ts:10789-10790`). The loose regexes pass on either guard, so no gate moves.
That probably explains why the census has no row for them.

## Items that need a parent ruling

1. **G4-new-1 to G4-new-4.** The choice is between two treatments:
   - keep them unedited, as 1344 did with the same V39 masking, and record them as closure findings;
   - tighten them to the measured first guard with the S9 masking comment, as 1358-N plans for `p12-starting-world:52`.

   M2 measures :188 and :195, which reach production `migrateToV26` (the 44 arm at `src/core/save.ts:8796`). The dry run
   measures :74 and :82, whose chain sits in H's helper.
2. **The three S9 census rows at `p13b-s3-save-v23:115-117`** stay deferred to M2. Their chains belong to production:
   `migrateToV22`, `V21` and `V20` take the 44 arm first (`src/core/save.ts:8239`, `:8198`, `:10198`). Reading cannot
   settle whether the 12-week `p13aLaboratorySlice()` state holds a log row or a romance track.
   - If M2 shows the V39 message, the leaves need no edit.
   - If it shows `convertV44ToV43`'s, the follow-up unit pins that message and adds the masking comment.
     `p14p4p5-opportunities:327` (`convertV40ToV39` on a V40 envelope) is the candidate that still covers the V39 guard.

## Choices the parent can reverse

- **P5 parentheticals stay verbatim.** Only the numbers the body moves change. The Save43 sweep appended history in
  three of these titles (", then post-1344-N" and "and again for Save43"). I appended nothing. Adding "then
  post-1358-N" would change the ten new identities.
- **No new comments.** Each edit moves a value on one line, the way the Save43 sweep moved the same sites in these files.
  Stale trailing comments, such as the UI's `// current C.3 writer: SaveFileV38.`, stay as written.

## Examined, no edit

- **`p14b4-save-v30-compatibility:216`** (the census no-edit entry). The input is V30, and the expectation states
  `relationships: []` at `:216` and `:221`. Save44 adds nothing to an empty root.
- **Stale titles whose bodies move.** These name an older live version or validator, and they stay under 1358-N P5 and
  F9 ruling 5:
  - `d17a-adv-migration:273`, `d17b-save-v7:161`, `property-state-v13:941` and `script-projects-save-v9:413`;
  - `p13b-s2-save-v22:206`, `p13b-s3-save-v23:120` and `p13b-s5-save-v24:209`;
  - `p14b1-save-v29:109` and `p14b4-save-v30-compatibility:251`;
  - `p14c2b-save-v36:160` and `:164`, and `p14c4-save-v35:56` and `:60`;
  - `p13b-s2-access-identity:181` and `p13b-s3-validation:157`.
- **Pins that follow the constant.** `p14b5-save-v31:200-204` builds its sentinel and message from `LIVE_SAVE_VERSION`,
  and `d11-employment:563` compares against the constant.
- **`p14c2b-save-v36:64`.** It downgrades a never-ticked world through H's helper, so its chain holds no log row and no
  track.

## Renamed titles (P5), old and new

The `p13b-s7-announcements` title's own text contains an em dash. I reproduce it exactly.

1. `tests/p13b-r07-save-v25.test.ts:273` (N-0359)
   - old: `an unknown saveVersion 44 is refused, naming the handled range "1 through 43 only" (B4 additive reader boundary; stale numbers corrected post-C.2b)`
   - new: `an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (B4 additive reader boundary; stale numbers corrected post-C.2b)`
2. `tests/p13b-s2-save-v22.test.ts:211` (N-0365)
   - old: `refuses an unknown saveVersion 43 with the updated range (stale number corrected post-C.2b)`
   - new: `refuses an unknown saveVersion 45 with the updated range (stale number corrected post-C.2b)`
3. `tests/p13b-s3-save-v23.test.ts:124` (N-0371)
   - old: `an unknown saveVersion 43 is refused, naming the handled range (stale number corrected post-C.2b)`
   - new: `an unknown saveVersion 45 is refused, naming the handled range (stale number corrected post-C.2b)`
4. `tests/p13b-s5-save-v24.test.ts:213` (N-0377)
   - old: `an unknown saveVersion 44 is refused, naming the handled range "1 through 43 only" (stale numbers corrected post-C.2b)`
   - new: `an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (stale numbers corrected post-C.2b)`
5. `tests/p13b-s6-save-v26.test.ts:221` (N-0380)
   - old: `an unknown saveVersion 44 is refused, naming the handled range "1 through 43 only" (B4 additive reader boundary; stale numbers corrected post-C.2b, then post-1344-N)`
   - new: `an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (B4 additive reader boundary; stale numbers corrected post-C.2b, then post-1344-N)`
6. `tests/p13b-s7-announcements.test.ts:86` (N-0384)
   - old: `LIVE_SAVE_VERSION is 43 (stale title corrected post-C.4 and again for Save43; P13B-S8 made it 27 at the time) — S7 itself changes no save`
   - new: `LIVE_SAVE_VERSION is 44 (stale title corrected post-C.4 and again for Save43; P13B-S8 made it 27 at the time) — S7 itself changes no save`
7. `tests/p13b-s8-save-v27.test.ts:211` (N-0388)
   - old: `an unknown saveVersion 43 is refused, naming the handled range "1 through 42 only" (B4 additive reader boundary; stale numbers corrected post-C.2b)`
   - new: `an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (B4 additive reader boundary; stale numbers corrected post-C.2b)`
8. `tests/p14a1-save-v28.test.ts:252` (N-0391)
   - old: `an unknown saveVersion 43 is refused, naming the handled range "1 through 42 only" (stale numbers corrected post-C.2b)`
   - new: `an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (stale numbers corrected post-C.2b)`
9. `tests/p14b1-save-v29.test.ts:202` (N-0395)
   - old: `an unknown saveVersion 43 is refused, naming the handled range "1 through 42 only" (stale numbers corrected post-C.2b)`
   - new: `an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (stale numbers corrected post-C.2b)`
10. `tests/p14b5-save-v31.test.ts:195` (N-0399)
    - old: `LIVE_SAVE_VERSION is the literal 43 the live writer stamps (stale title corrected post-C.2b and again for Save43; body always asserted the live constant); 30 is the OUTGOING identity (R-VERSION class, re-expressed by 735-T after P14B.7 landed V32)`
    - new: `LIVE_SAVE_VERSION is the literal 44 the live writer stamps (stale title corrected post-C.2b and again for Save43; body always asserted the live constant); 30 is the OUTGOING identity (R-VERSION class, re-expressed by 735-T after P14B.7 landed V32)`

## Process disclosures

- **No test processes.** I ran no node, vitest, tsc, tsx, vite-node or npm process.
- **Edits.** The Read and Edit tools made every test edit, in the G4 worktree only. Git writes were the three commits on
  `sweep-g4` and the temporary index under `out/g4`.
- **The main repo.** I used it read-only:
  - `git show cec3902c` for the Save43 precedent;
  - `git rev-parse` of HEAD blobs;
  - the evidence files and `1348-I-core-failures.json`.
- **Fixtures and Owner saves.** I did not list, scan or read `tests/fixtures`, and I never accessed Owner saves.
- **Scratch files.** The census dump, the precedent diff and the classification generator live in my session
  scratchpad, outside the studio tree. Python wrote only `classification.json` and `deferred.json` under `out/g4`.
