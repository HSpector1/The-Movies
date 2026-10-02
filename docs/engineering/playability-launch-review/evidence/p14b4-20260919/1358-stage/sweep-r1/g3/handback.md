# 1358-N G3 handback: Bridge B, 19 files

The G3 test author wrote this on 2026-10-02 at 03:55 CDT. E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`; O = `/Users/zacheryspector/studio-scratch/1358-sweep/out/g3`.

## Identity

- **Worktree:** `/Users/zacheryspector/studio-scratch/1358-sweep/g3`, branch `sweep-g3`, base tag `step4` (8e02a44).
- **Commit:** d698d970807713fc855c959c2a456e04ccd4fc4f, "1358-N G3: S1, S2, P1, P2 and P5 certain rows in the 19 Bridge B files". It is the only commit on `sweep-g3` above `step4`.
- **S5 draft:** commit ba0a25065bc0ba743382ad0ee7d030c500fab73e, made on a detached HEAD and exported as `s5-draft.patch`. No branch or tag points at it.
- **Repo HEAD:** the 19 files have the same blobs at `step4`, at 5245072a and at repo HEAD b17e8ac2, so `patch.diff` applies to repo HEAD as it stands.

## Deliverables in O

| File | What it holds | sha256 |
|---|---|---|
| `patch.diff` | `git diff step4 -- tests ui`: 19 files, +107/-100 | ec9efbecb7ba5d1ee083cfb1d4f1f1222eedbc6f6ed3c97fda2211ebbdd9878a |
| `classification.json` | 104 objects for the 103 certain rows | 734cda1f84a6b7856b82d8b2b9038153cf411c7f7aedfc813c7fac633b38aeac |
| `deferred.json` | the 8 S5 rows and two sites the census did not list | d9e0ec9b0033dbd74f0fdf32b3cecf2faf8e86f78b5602ece0fc712d55f66da6 |
| `s5-draft.patch` | the droppable S5 helper draft, `git am` form | d8e237c7bf4c4c079e6ff4f01fca94cf2d81bdefa29b77e2822c7d058384a697 |

Supporting scripts, each with its output where it prints one: `roster_recompute.py`, `runtime47_keys_check.py`, `verify_diff.py`, `build_classification.py`, `build_deferred.py`.

`git diff --stat step4 -- . ':!tests' ':!ui/src'` prints nothing.

## Counts

| Class | Census rows | Edited | Deferred |
|---|---:|---:|---:|
| S1 | 28 | 28 | 0 |
| S2 | 35 | 35 | 0 |
| P1 | 33 | 33 | 0 |
| P2 | 6 | 6 | 0 |
| P5 | 1 | 1 | 0 |
| S5 | 8 | 0 | 8 |
| **Total** | **111** | **103** | **8** |

- **Lines:** the 103 rows sit on 100 lines. Three lines carry two rows each: `bridge-p14p3-directing-promises:75` (S1, S2), `bridge-p14p4p5-opportunities:66` (S1, S2) and `bridge-p14c3-runtime:160` (P1, S2).
- **Objects:** `classification.json` holds 104 objects. N-0263 has two: the new `OUTGOING_56` constant at :52 and the list at :212.
- **Added lines:** the constant and six comment lines:
  - `bridge-p14b2-checkpoint:92`, one line (N-0238);
  - `bridge-p14p4p5-opportunities:503-504`, two lines (N-0304, N-0305);
  - `bridge-p14r2r3-prior55:169-171`, three lines (N-0313, N-0314).
- **Beyond the census:** `deferred.json` also lists G3-new-1 (S9, no edit) and G3-new-2 (P5, for the parent). I edited no new row.

## The roster pins (P2)

- **Method.** `roster_recompute.py` follows the method the pins' comment states. It is separate code from the planner's `py/roster.py`:
  - it walks the map body of `bridge/runtime-checkpoint.ts` line by line and resolves the three named constants;
  - it reads `OLD_SCHEMA` and the base pin from each test file;
  - it drops `OLD_SCHEMA`, sorts by key and takes the sha256 of the compact JSON.
- **Base check.** At `base` it reproduces both pins exactly, each at length 43:
  - prior55: 11ec9999e052d8e6ce6dbdbb08060d57ad3a7dbb45335182c85806c4d88e4e51;
  - p14p4p5: f62253f540a1b498e953cfb22b9558ca70131a14ef4754352457e75d0f6c13da.
- **New values at `step4`,** each at length 44:
  - `bridge-p14r2r3-prior55:175`: d25c64254ac090a8470cc43b2f02740e149b6f29f75966ba4d2d1684b26654a6;
  - `bridge-p14p4p5-opportunities:506`: afae82e478438adcd177592fca60fc283c0e73bdc5eefc1101a8115de28cce58.

  Both agree with the planner's values.
- **Roster delta.** From `base` to `step4` the roster gains one entry, `[sha256:349b2d3e…fcec1, 'projection-v56']`, and loses none. No P2 stop condition fires. The size moves 44 -> 45 at `bridge-p14b8-waiver-surface:788`.
- **`OUTGOING_56`.** The value is sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1, taken from the step-4 `bridge/runtime-checkpoint.ts:64` entry.
  - It equals the base contract manifest's `schemaId` and the base C# header (`generated/unity/StudioBridgeDtos.Generated.cs:3`).
  - With it, the runtime47 list at :212 equals the 45 step-4 roster keys. Without it, the list equals the 44 base keys (`runtime47_keys_check.py`).

## Census rows found wrong

1. **The 8 S5 rows cannot be decided by M2.** In M2's step-4 tree every one of these leaves stops at an earlier pin before it reaches the comparison:

   | Row | File | Comparison | Stops first at (step-4 line) |
   |---|---|---|---|
   | N-0272 | `bridge-p14c2rm-runtime` | :56 | :53, `toBe(43)` |
   | N-0280 | `bridge-p14c2s-scientist-runtime` | :136 | :124, `validateSaveV43` refusal |
   | N-0282 | `bridge-p14c3-promise-digest-continuity` | :158 | :119, `PROJECTION_VERSION` 56 |
   | N-0292 | `bridge-p14p3-directing-promises` | :134 | :132, `toBe(43)` |
   | N-0296 | `bridge-p14p3-directing-promises` | :370 | :358, `PROJECTION_VERSION` 56 |
   | N-0301 | `bridge-p14p4p5-opportunities` | :93 | :92, `toBe(43)` |
   | N-0307 | `bridge-p14p4p5-opportunities` | :511 | :487, `PROJECTION_VERSION` 56 |
   | N-0317 | `bridge-p14r2r3-prior55` | :190 | :154, `PROJECTION_VERSION` 56 |

   The sweep dry run is the first run that reaches the 8 comparisons, so `deferred.json` names "dry run" as the decider for all 8. The brief and 1358-F9 ruling 1 name M2. In my post-image N-0307 sits at :513 and N-0317 at :193.
2. **N-0238's "why" names the wrong state.** It says the source has `relationships: []`. The expectation writes `relationships: []` itself (:94), and the file's own comment (:50-52) says the V29 -> V31 lift adds that empty root, so the V29 source has none. The conclusion still holds: Save44 adds no edge field here, and the row needs only 43 -> 44.

## New rows

- **No new edited row.** A grep of the 19 files for 43, 56, `validateSaveV43`, `projection-56`, `saveVersion` stamps, the roster forms and the step-4 schema ids finds no live site outside the census rows. The remaining digest and byte pins read fixture, manifest or capture bytes.
- **G3-new-1** (S9, no edit, dry run): `bridge-p14c3-runtime:178`.
  - R2 passes the validated V44 hydrated slot to `migrateToV38`, which sends a V44 save through `convertV44ToV43` (`src/core/save.ts:10535`).
  - The census missed it because it is a `migrateToVnn` dispatch, not a `convertV43ToV42(` call.
  - The slots are genuine V37 bytes migrated forward, so every log is empty, every romance is null, and the chain should pass unchanged.
- **G3-new-2** (P5, parent): the describe title at `bridge-p14r2r3-prior55:146`. See item 1 below.

## Items that need a parent ruling

1. **The prior55 describe title (G3-new-2).** The title reads "P14 1308-C: the outgoing projection55 runtime checkpoint migrates to current56, and each Save40 slot migrates to Save41 independently". Its leaf moves `PROJECTION_VERSION` 56 -> 57. I kept the title for four reasons:
   - the same title already names the stale Save41;
   - 1358-N P5 keeps titles that earlier sweeps left naming an older live version;
   - 1309-E left D17's "isolates current55 campaigns" (`bridge-p14p3-directing-promises:603`) unrenamed when D17's projection pin moved to 56;
   - 1358-F9 ruling 5 fixes the renames at 17.

   If the parent reads P5 to cover "currentNN" titles, the rename is "current56" -> "current57". That makes a new identity for the file's one leaf, which is not a retained 1348-I identity. D17's "current55" would then raise the same question.
2. **Who measures S5.** The 8 S5 rows go to the sweep dry run, not M2 (above). The parent chooses whether x2 runs with `s5-draft.patch` applied, which measures the helper directly, or without it, which shows the raw difference and leaves the helper to a follow-up unit.
3. **The form of the S5 draft.** The draft lives in a patch file, not in a commit on `sweep-g3`, because a helper-only commit breaks the Bridge type gate:
   - `tsconfig.json:8` sets `noUnusedLocals`;
   - `tsconfig.bridge.json` extends it and includes `tests/bridge*.test.ts`;
   - so an unused helper is TS6133.

   The draft therefore also applies each helper at its file's S5 sites. That keeps every S5 measure row untouched on the branch and in `patch.diff`. To keep the draft, run `git am` with `s5-draft.patch` on d698d97. To drop it, leave the file.

## Renamed titles

One rename, N-0211, `tests/bridge-p14a1-release-busy-set.test.ts:214`. It creates a new test identity.

- **Old:** `schema leaf: PROJECTION_VERSION is 56, the schema $id and x-project-studio.projectionVersion move with it, and both new refusal codes reach the generated CONTRACT_REFUSAL_KINDS enum (mirrors the underMarketCase/projection-42 precedent, tests/bridge-p14a1-market.test.ts group 1)`
- **New:** `schema leaf: PROJECTION_VERSION is 57, the schema $id and x-project-studio.projectionVersion move with it, and both new refusal codes reach the generated CONTRACT_REFUSAL_KINDS enum (mirrors the underMarketCase/projection-42 precedent, tests/bridge-p14a1-market.test.ts group 1)`

**Titles and messages left as written.** Earlier sweeps left these stale, so they keep their numbers:
- titles: `bridge-p14a1-market:151`, `bridge-p14a2-market:216, :231, :738`, `bridge-p14a3-world:228, :244`, `bridge-p14b1-promises:206`, `bridge-p14b7-promise-waiver:136`, `bridge-p14b8-waiver-surface:775, :807`, `bridge-p14b4-runtime47-compatibility:206`, `bridge-p14c2rm-runtime:93`, `bridge-p14c2s-scientist-runtime:105`, `bridge-p14p3-directing-promises:603`;
- assertion messages: `bridge-p14b8-waiver-surface:788` ("41 -> 42") and :817 ("live Save39").

## The S5 draft

- **Helpers:** one `withEmptyCompetitionsAndRomance` in each of the six files that hold S5 rows, placed after the file's Save43 helper (1358-F9 ruling 6).
- **What a helper does:** it maps the old state's own edges and adds `competitions: []` and `romance: null`. Five files use the spread form of their `withSharedCompetitions`; prior55 uses its clone-and-mutate form.
- **Call sites:** the draft wraps each of the 8 comparisons outermost in its helper chain. A difference left after the helper is an S10 value or a defect under the S5 stop rule.
- **Types, argued by reading:** the constraint `{ relationships: readonly { competitions?: readonly unknown[]; romance?: unknown }[] }` accepts every V31+ state. `RelationshipEdge` carries both fields at step 4 (`src/core/types.ts:2303`, :2305), and every `GameStateV31`+ alias carries that edge type.

## Checks I ran

- **Diff reversal:** `verify_diff.py` undoes the intended substitutions on all 100 replaced lines and gets the step-4 text back each time. It finds 7 inserted lines: 6 comment lines and the constant.
- **Classification:** each object's new text equals its post-image line (104 of 104).
- **Apply checks** under a temporary index in O: `patch.diff` applies to `step4`, and `s5-draft.patch` applies to d698d97.
- **Added lines:** no em dash and no `Math.random`.

## Process disclosures

- **No test runs.** I ran no node, vitest, tsc, tsx, vite-node or npm. I argued types by reading.
- **Writes:**
  - python3 wrote only under O, and test edits used the editor tool;
  - git writes in the worktree: commit d698d97 on `sweep-g3`, then the draft commit ba0a250 on a detached HEAD, then a checkout of `sweep-g3`;
  - the temporary index files lived in O, and I deleted them.
- **Repo access:** read-only git (`log`, `show`, `rev-parse`). I read no fixture file, listed no `tests/fixtures` path and opened no Owner save.
- **Editor defect.** The editor tool dropped a trailing space three times, each time where an edit string ended in "= ". I caught each one in the diff review and fixed it before the commit it belonged to:
  - `bridge-p14c3-promise-digest-continuity:120`, in d698d97;
  - `bridge-p14c2s-scientist-runtime:39` and `bridge-p14p4p5-opportunities:61`, in the draft.

  Other units using the same tool may carry the same defect. `verify_diff.py`'s reversal check catches it.
