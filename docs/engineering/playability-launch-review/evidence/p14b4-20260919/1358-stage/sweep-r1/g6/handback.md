# 1358-N G6 handback: core S1, S2 and S5 files

Group G6 of the Save44 and projection-57 pin sweep. Authored 2026-10-02, finished 03:55 CDT.

- **Worktree:** `/Users/zacheryspector/studio-scratch/1358-sweep/g6`, branch `sweep-g6`, base tag `step4` (8e02a44).
- **Commits:**
  - `2eaee24` "1358-N G6: S1, S2 and S4 certain rows in 33 files": 33 files, +92/-89.
  - `49bafc6` "1358-N G6: S5 draft, withEmptyCompetitionsAndRomance in five p14p4p5 files": 5 files, +31/-5. The parent keeps or drops this commit.
- **Deliverables** in `/Users/zacheryspector/studio-scratch/1358-sweep/out/g6/`:
  - `patch.diff`: `git diff step4 -- tests ui`, both commits, 33 files, +123/-94, sha256 `f49c8210…f523`.
  - `s5-draft.diff`: commit `49bafc6` alone, so `git apply -R` drops the draft.
  - `classification.json`: 104 rows. `deferred.json`: 8 rows.
- **Scope check:** `git diff --stat step4 -- . ':!tests' ':!ui/src'` prints nothing. Repo HEAD b17e8ac2 holds the same blobs as `step4` for all 34 G6 files, so the patch applies there.

## Method

I read every census row in context at `step4`, the post-image `src/core/save.ts` (`LIVE_SAVE_VERSION` :6567, `makeSave` :6571-6572, `validateSaveV44` :10763-10772, `convertV43ToV44` :10776-10781, `convertV44ToV43` :10785-) and the Save43 sweep's edits to the same files (`git show cec3902c`).

A cross-check found every `validateSaveV43` and every `toBe(43)` in the 34 files on a census row:
- 82 lines name `validateSaveV43`: the 81 S1 rows plus the S4 alias at `p14b4-material-evidence-core:40`;
- 19 lines hold `toBe(43)`: the 19 S2 rows.

So each file's edit replaces all of them, and no `validateSaveV43` or `toBe(43)` remains in G6. Every edited site reads a live envelope: `makeSave` output, a `LIVE_SAVE_VERSION` stamp, a `migrateToLive` result, or an export round trip of one. No G6 file builds, stamps or reads a V43 envelope. Twelve p14p4p5 lines carry both an S1 and an S2 row.

## Counts by class

| Class | Census rows | Edited | Deferred | New rows |
|---|---:|---:|---:|---|
| S1 | 81 | 81 | 0 | 2 comment rows (G6-new-1, G6-new-2) |
| S2 | 19 | 19 | 0 | 1 comment row (G6-new-3) |
| S4 | 1 | 1 | 0 | 0 |
| S5 | 5 | 0 (draft in `49bafc6`) | 5 | 0 |
| S8 | 0 | 0 | 2 | 2 (G6-new-4, G6-new-5) |
| S10 | 1 | 0 | 1 | 0 |
| **All** | **107** | **101** | **8** | **5** |

`classification.json` holds the 101 census rows plus the 3 comment rows. `deferred.json` holds the 6 census measure rows plus the 2 new S8 rows. P1-P5, S3, S6, S7 and S9 have no G6 site.

The S4 edit (N-0637) makes `EnvelopeV33` `ReturnType<typeof validateSaveV44>`. That clears X5's TS2322 at `p14b4-material-evidence-core.test.ts(293,9)`, where `migrateToLive` returns a `LiveSaveFile`.

## Census rows found wrong

1. **N-0656** (`p14p4p5-cross-owner:102`, S5). The census expects M2 to decide it, but M2 cannot. `input45()` calls `admitted(state)` at :99 before the comparison at :102. Without the sweep, `admitted` fails at :75 with "expected 44 to be 43", so M2 never reaches :102. The sweep dry run decides this row. The other four S5 comparisons run before `admitted()`, so M2 reaches them.
2. **Two missing S8 rows.** The 1358-N S1 stop rule gives a renamed call under a bare `.toThrow()` an S8 row. The census builds its S8 rows from 1358-J's list only, so it has none for:
   - `p14b1-t4-regressions:86`, inside `rejects()`;
   - `contracts/studio-events:221`, which reaches the validator looked up at :129.

   Both are deferred as G6-new-4 and G6-new-5.

Every other census row matched `step4` text exactly and reads a live envelope.

## New rows

- **G6-new-1** (`c2a-m2-sets-save:231`), **G6-new-2** (:290) and **G6-new-3** (`p14p4p5-delayed-retirement:106`): one inserted comment line each.
  - Each sits under a 1344-N note that says makeSave "stamps the live 43" or "writes the live 43". The note now stands directly above a 44 pin.
  - Each line names 1358-N and the class: `// 1358-N S1: Save44 moves the live stamp to 44, so all three calls name validateSaveV44.`
  - I left the 1344-N notes as written. 1358-N keeps comments that cite moved `save.ts` lines.
  - The census missed these lines because `py/detect.py` skips comment lines.
- **G6-new-4** (`p14b1-t4-regressions:86`, S8, deferred):
  - `rejects()` asserts at :84 that `validateSaveV44` accepts the unmutated live envelope, so a throw at :86 comes from the mutation, never the version.
  - The 15 non-retained `rejects()` identities (:175-:257) tamper promises, proposals and receipts. `validateRelationshipsRoot(raw, 44)` does not read those roots.
  - The 14 identities at :309-:346 are retained 1348-I rows that fail first at :283.
- **G6-new-5** (`contracts/studio-events:221`, S8, deferred). For kind `releaseCommitted`, the bare `.toThrow()` reaches the validator looked up at :129. Line :212 first validates the same live save with the legal row, so the throw comes from the forbidden key.

## Confirmed no-edit sites

- **`p14b3-rule-revision:174` and `p14bf2-acting-discipline:366`** (census no-edit). Both inputs are V29. The expectations state `relationships: []` and stamp `LIVE_SAVE_VERSION`, so Save44 adds nothing to compare.
- **`facility-move-demolish:795-796`** (a census residue line matching /cannot downgrade/). `makeSaveV12` projects the live state itself (`save.ts:6420-6434`) and never calls `convertV44ToV43`. The razed world holds no edge, so the line carries no S9 risk.
- **`p14b4-rival-seating-preference`** holds no version pin. Its S10 row N-0640 gets no edit (1358-F9 ruling 7).

## The S5 draft, commit `49bafc6`

- **Where:** each of the five p14p4p5 files gains `withEmptyCompetitionsAndRomance` beside `withSharedCompetitions` (1358-F9 ruling 6). It reuses the file's `WithRelationships` type.
- **What it does:** it maps the old state's edges and adds the `competitions: []` and `romance: null` that `convertV43ToV44` writes. The comparison wraps its expectation in it, newest era outermost. It strips nothing.
- **Keep it** only if M2 (four rows) and the dry run (N-0656) show exactly those two fields missing on every edge. Any other difference is the 1358-N S5 stop.
- **Line numbers.** `classification.json` follows the full patch. Dropping `49bafc6` moves these rows up:

| File | Row ids | With the draft | Without |
|---|---|---|---|
| `p14p4p5-casting-reservation` | N-0650, N-0651 | :86 | :81 |
| `p14p4p5-cross-owner` | N-0653, N-0654 | :80 | :75 |
| `p14p4p5-cross-owner` | N-0655 | :81 | :76 |
| `p14p4p5-delayed-retirement` | G6-new-3 | :106 | :100 |
| `p14p4p5-delayed-retirement` | N-0657, N-0658 | :107 | :101 |
| `p14p4p5-queued-project-outcome` | N-0666, N-0667 | :104 | :99 |
| `p14p4p5-scenery-capacity` | N-0675, N-0676 | :86 | :81 |

## Items that need a parent ruling

1. **Keep or drop `49bafc6`** after M2 and the dry run report the five S5 comparisons.
2. **N-0656's deciding run.** 1358-F9 ruling 1 assigns all S5 rows to M2. This row needs the sweep dry run, for the reason above.
3. **G6-new-4 and G6-new-5.** Does a bare `.toThrow()` need a pinned message when the unmutated twin validates first (:84; :212)? If yes, the dry run must measure each refusal first.
4. **G6-new-1 to G6-new-3.** Keep the three comment lines or drop them. They change no existing comment text.

## Dependencies outside G6

- **H's helper rows.**
  - `p14b2-setup-wrap-regressions` (:15, :93) builds `retentionFixture()`.
  - `p14b7-promise-waiver:411` builds `historyFixture()`.

  Both helpers live in `tests/helpers/p14b2-fixtures.ts`, whose `validateSaveV43` calls at :122, :244 and :259 are H rows N-0002 to N-0004. These leaves pass only after H lands. G6 defers no helper edit.
- **Retained natural-chain leaves.** These retained identities sit in G6 files:
  - 15 in `p14b1-t4-regressions`, failing at :283;
  - 9 in `p14b4-cast-class-outcomes`, failing at :247;
  - 17 in `p14b4-rival-seating-preference`.

  They search 230 to 350 ticks of natural play, which Save44 steps 2 and 3 can change. G6 edited none of their premises. M2's attribution covers them.

## Renamed titles

None. No title in the 34 files names 43 as the live version, 44 as a sentinel, "1 through 43" or projection 56, and the census gives G6 no P5 row.

## Process

- **Runs:** no node, vitest, tsc, tsx, vite-node or npm process ran.
- **Repo access:** read-only git only (`show`, `log`, `rev-parse`, `grep` with `tests/fixtures` excluded).
- **Files not read:** no fixture or capture file, and no Owner save.
- **Writes:**
  - the 33 test files, through the Edit tool;
  - the two commits on `sweep-g6`;
  - the files in `out/g6`.
- **Scratchpad:** four shell redirects early on wrote read-only listings to the session scratchpad under `/private/tmp`: the G6 file list, a token grep, the 1344 diff of the G6 files and a row dump.
