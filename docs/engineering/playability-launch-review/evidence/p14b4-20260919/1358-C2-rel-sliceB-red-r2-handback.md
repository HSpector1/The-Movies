# 1358-C2: P14B relationship slice B, RED r2 handback

## Status

DONE, with nothing run. The heavy-lane lock held for the whole task, and I started no vitest, tsc, node or tsx process. Every RED result below comes from reading the code at the r2 base. 1358-X measures them.

r2 changes one file, `tests/p14b10-romance.test.ts`. Four of r1's other five files are byte-identical in the patch. The fifth, `tests/p14b5-relationships.test.ts`, keeps r1's title-only rename; only its hunk offset (750 to 775) and index line differ, because the sweep moved the file.

## Base and branch heads

- Real repo `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`, HEAD `469a9547f1a3b53b7c9985ec53beaa55e2a65587` at start (20:25 CDT) and at handback (20:58 CDT).
- Scratch tree `/Users/zacheryspector/studio-scratch/1358-r2/tree`, built by the 1327-C method:
  - `git archive HEAD` of `src bridge ui generated scripts package.json package-lock.json tsconfig.json tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md`, then `tests ':!tests/fixtures'`;
  - `docs`, `node_modules`, `art`, `tools` and `tests/fixtures` linked with `ln -sfn` after checking that no path existed;
  - `git rev-parse HEAD:<path>` matches the real HEAD for every archived path, and `tests` matches apart from the fixtures link.
- Scratch commits on branch `main`, each tagged:
  - `3a52ff1` `base`;
  - `8a3ce4c` `slice-a-red`: r5 (`34c5be75…`);
  - `b1f9c1e` `slice-a`: step3 (`80540869…`);
  - `2024c04` `slice-b-r1`: r1 (`5d7a3591…`). No hunk failed after the sweep; the p14b5 hunk applied at offset 25, so nothing needed a hand port;
  - `fc7d2bf` `slice-b-r2` = `main`.
- The five stray self-links of 1358-F §4 are gone from the real repo (`art/art`, `docs/docs`, `tests/fixtures/fixtures`, `node_modules/node_modules`, `tools/tools` checked).
- The real worktree index (`…/.git/worktrees/The-Movies-headless-program/index`, sha256 `68c50f41…`, written 20:08) and the object store are unchanged by this task.

## The changes, each tied to 1358-F

All line numbers are in `tests/p14b10-romance.test.ts` at r2.

1. **§1, Reading B.** New leaf at :268, `romance-partnered-pair-keeps-growing: …`, in the eligibility describe after the third-party leaf (:251, unchanged).
   - Pair (d,l) holds one open bond with each other and no other bond, at value `100 - ROMANCE_SUCCESS_GAIN + 1`, anchored one week before the write.
   - A shared success (release at `RELATIONSHIP_SUCCESS_CRITIC_SCORE`) must give `min(100, staged + ROMANCE_SUCCESS_GAIN)` = 100 and keep the same single open bond. Reading A would keep 96; a missing cap would give 101.
   - The guard at :270 stops a vacuous pass at RED: without the gain the staged value is NaN, and `toBe` compares NaN with NaN by `Object.is`.
2. **§2, the write seam.** The header at :39-43 states the ruling: `advanceRelationshipsWeek(state, delta, week)`, `src/core/relationships.ts:310` with slice A applied. The 12 leaves keep their calls.
3. **§3, the drift-exemption read site.** The header at :45-53 states the ruling. In the drift describe:
   - :455 replaces r1's first drift leaf. r1 asserted a hold at week 100000 for a value-90 bond anchored at 1000. That bond ends on read at week 1252, so the ruled law drifts the pair to 50 and r1's expected 70 could never pass at GREEN. The new leaf reads at week 1182, inside the partners window (romance `100 - trunc(100 * 78 / 260)` = 70, at least 40).
   - :467 is r1's, unchanged. It pins the `endedWeek` side of `max(lastEventWeek, endedWeek)`.
   - :474 is new and passes at RED. With `lastEventWeek` 950 after `endedWeek` 900 it pins the `lastEventWeek` side: 60, against 57 if production counted from `endedWeek` alone.
   - :483 is new. It covers an ending computed on read, with `endedWeek` still null. The hold stops at the derived week (1252 for value 90 anchored at 1000), dormancy counts from there, and the read equals the recorded-ending read at 1252, 1304 and 1434. 1347-A §5 requires that recording the ending "changes no closeness".
   - :505 is new: `currentTier` keeps a Partners pair at 81 Inseparable. Slice A drifts it to 66, Friends.
   - :514 is new and fails at the type gate only. `@ts-expect-error` at :517 and :519 sits on calls without `romance`; a never-called closure holds them, because production may read `edge.romance` unguarded.
   - Literals typed `Parameters<typeof currentCloseness>[0]` or `Parameters<typeof currentTier>[0]` at :459, :477, :496, :497 and :508 pin the three-key and four-key Picks.
   - The import at :81 adds `RELATIONSHIP_BASELINE`, `RELATIONSHIP_DRIFT_GRACE_WEEKS` and `RELATIONSHIP_DRIFT_RETURN_WEEKS`.
4. **§4 F4, applied pre-emptively to one leaf.** The ending leaf at :394 gains two guards at :398-399. As r1 wrote it, at RED `formedWeek = 400 - undefined - undefined - 10` is NaN, so the search loop at :406 never runs. The leaf then throws its own "fixture premise failed: the staged track never crosses the exit threshold by `week`". That message blames the fixture for a missing API. It is the r1 F3.3 defect class, which 1358-F §4 accepted as fixed in the 229-week leaf (:173). The guards add nothing at GREEN. Strike them if you want r1's leaves strictly unchanged until 1358-X.
5. **Classification** (`1358-rel-sliceB-red-r2-classification.json`, r1's format, 86 rows: 60 fails, 18 not executed, 8 control-passes). Every row of a changed or added leaf cites 1358-F.
   - Six rows are new or replaced: the partnered leaf, the replaced drift leaf (with `renameOldIdentity`/`renameNewIdentity` for lineage and a note saying it is not title-only), and :474, :483, :505 and :514.
   - Fifteen r1 rows keep their identity and change fields:
     - the 12 seam rows now cite §2, carry `proposedSeam: false` and hold the derived RED in `note`; the ending leaf at :394 also has a new `redReason`;
     - the :467 row cites §3;
     - the two Mentor rows carry `blockedByPreexistingRegression: false` and the task 3 finding in `note`. Their r1 `redReason` stays as the record of r1's run at `c614b7e9`.
   - The other 65 rows equal r1's.

## Mentor leaves after the sweep (task 3)

Both Mentor leaves of `tests/bridge-p14b10-relationship-labels.test.ts` (:232, :242) now reach their own Bridge-level assertion at this base. This is a finding from reading, not a run.

- `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17-18` now reads `toBe(43)` and `validateSaveV43(saved)`. `validateSaveV43` returns its argument (`src/core/save.ts:10668-10674`), and `LIVE_SAVE_VERSION` is 43 (`src/core/save.ts:6560`). The version pin in `acceptedEvidence` therefore holds everywhere `cohortThreeFilms()` calls it: in `cohortSetup`, `hire`, `refreshSet`, `greenlightEvidence` and `release`.
- No other save-version pin sits on that path. `tests/helpers/p14c3-cohort-transition-fixtures.ts` holds none. `tests/helpers/p14c3-fixtures.ts:134` (`envelope38`, already 43) and the frozen V35 helpers in `tests/helpers/p14c2b-fixtures.ts` are not called on it.
- Measured support from the parent's own recorded run: `1344-save43-sweep-broad-core.txt:1915` shows `tests/p14c3-cohort-transition.test.ts (9 tests)` passing at HEAD on the same fixture. I read the file at 20:47 CDT, while the run was still in progress.
- Slice A leaves the route alone. Step 3 changes D5 reason copy and moves `distinctActingFirstTakes` without changing behaviour. The route records no casting competition, so rules version 2 changes no tier on it.
- Derived RED: the director is on the player roster (hired at 2600 for 208 weeks; `rosterAt` in `bridge/relationships.ts:105-112`) and tied, so `directorRow` exists. The row has no `labels` field.
  - At `tests/bridge-p14b10-relationship-labels.test.ts:239`, `toContainEqual` calls `Array.from(undefined)` and throws "TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))".
  - At `:251`, `directorRow.labels.some(…)` throws "TypeError: Cannot read properties of undefined (reading 'some')".

## Producer

Unchanged; no file is delivered. Nothing it uses moved with the new base:

- `LIVE_SAVE_VERSION` is 43;
- `validateSaveV43`, `makeSave`, `exportSave`, `importSave`, `PROJECTION_VERSION` and `SCHEMA_ID` (`bridge/protocol.ts:26`, `:35`) exist;
- the casting route and `screenplayShelving` are as before;
- the sweep touched tests only.

It has a placement defect unrelated to the base; see "Outside the brief" item 2.

## What 1358-X must run

Build the tree as above at real HEAD, apply r5 and step3, then `1358-rel-sliceB-red-r2.patch`.

1. `npx vitest run --project core tests/p14b10-romance.test.ts`. Expected: 33 leaves, 27 failed and 6 passed. The first `baseWorld()` caller (:239) pays `fund(p13aGeneratedStudio())` plus `advanceTo(400)`. I infer about 25-32 s from r1's measurement of a week-400 advance (1358-C F3.2). The other leaves take milliseconds.

| Line | Leaf | Origin | Expected at RED |
|---|---|---|---|
| :129, :140 | the two bindings leaves | r1, measured | fail, as r1 measured ("expected undefined to be 75"; "actual value must be number or bigint, received undefined") |
| :146-:173 | five `currentRomanceValue` leaves | r1, measured | fail, as r1 measured |
| :196-:233 | seven `romanceStatus` leaves | r1, measured | fail, as r1 measured |
| :239 | below Friends, no growth | r1 | **pass** (control): slice A leaves the staged null romance alone |
| :251 | third party's open bond blocks | r1 | **pass** (control, vacuous): the staged value is NaN and reads back NaN |
| :268 | romance-partnered-pair-keeps-growing | new, §1 | fail at :270, "expected 'undefined' to be 'number'" |
| :293 | director-lead gain | r1 | fail at :302, "expected null not to be null" |
| :308 | lead-antagonist gain | r1 | fail at :316, "TypeError: Cannot read properties of null (reading 'value')" |
| :319 | director-support, low proximity | r1 | fail at :329, "expected 200 to be 401" (week - 200 kept, week + 1 expected, week 400) |
| :332 | shared success gain | r1 | fail at :347, the same TypeError, after `sharedSuccesses` reads 1 |
| :350 | rival pair, same law | r1 | fail at :358, the same TypeError |
| :363 | formation at the threshold | r1 | fail at :373, "expected NaN to be undefined" (undefined - undefined staged; the expected constant undefined) |
| :377 | re-formation appends a row | r1 | fail at :389, `toEqual`: one bond row {formedWeek: -100, endedWeek: 300}, two expected |
| :394 | ending persisted at the next touch | changed, §4 F4 | fail at :398, "expected 'undefined' to be 'number'" |
| :419 | endedWeek never moved | r1 | **pass** (control): -100 kept |
| :433 | no romance driver at the ending | r1 | **pass** (control): kinds sharedProduction, sharedProduction, repeatedCollaboration; peak Friends |
| :455 | hold while partners | replaced, §3 | fail at :462, "expected 70 to be 90": dormancy 52 + 260/2 = 182, span 130, `90 + trunc((50 - 90) * 130 / 260)` = 70 |
| :467 | recorded ending, endedWeek side | r1, measured | fail at :471, "expected 50 to be 70", as r1 measured |
| :474 | recorded ending, lastEventWeek side | new, §3 | **pass** (control): `70 + trunc((50 - 70) * 130 / 260)` = 60 |
| :483 | ending computed on read | new, §3 | fail at :484, "expected 'undefined' to be 'function'" |
| :505 | currentTier holds the tier | new, §3 | fail at :511, "expected 'Friends' to be 'Inseparable'": `81 + trunc((50 - 81) * 130 / 260)` = 66 |
| :514 | strict Picks | new, §3 | **pass** at runtime; RED at the type gate only |

Every failure comes from the missing API: absent constants, functions or fields, or slice A's unwidened read. The :319 leaf has an open GREEN question; see "Outside the brief" item 3.

2. Recommended, to confirm task 3: `npx vitest run --project core tests/bridge-p14b10-relationship-labels.test.ts -t "Mentor"`. Expected: 2 failed, 10 skipped, with the TypeErrors above. The first leaf builds `cohortThreeFilms()`, which 1348-C5 measured at 50.8-82.3 s; its budget is 180_000 ms.

3. Root type gate, `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Expected exit 2 with exactly 17 errors, assuming HEAD plus slice A is clean (1344-C5 reports all three gates exit 0 at the sweep candidate; 1348-X5 found no slice A error):

```
tests/p14b10-labels.test.ts(47,10): TS2305 RIVALS_SAME_SLOT_COMPETITIONS
tests/p14b10-labels.test.ts(48,10): TS2305 professionalRivalsEvidence
tests/p14b10-romance.test.ts(78,3) (78,24) (78,48) (78,77): TS2305 ROMANCE_DECAY_WEEKS, ROMANCE_EXIT_THRESHOLD, ROMANCE_FORMATION_THRESHOLD, ROMANCE_GRACE_WEEKS
tests/p14b10-romance.test.ts(79,3) (79,27): TS2305 ROMANCE_PROXIMITY_GAIN, ROMANCE_SUCCESS_GAIN
tests/p14b10-romance.test.ts(80,47) (80,81): TS2305 currentRomanceValue, romanceStatus
tests/p14b10-romance.test.ts(459,90) (477,90) (496,92) (497,91): TS2353 'romance' does not exist in type 'Pick<RelationshipEdge, "closeness" | "lastEventWeek">'
tests/p14b10-romance.test.ts(508,126): TS2353 'romance' does not exist in type 'Pick<RelationshipEdge, "closeness" | "lastEventWeek" | "sharedCompetitions">'
tests/p14b10-romance.test.ts(517,7) (519,7): TS2578 Unused '@ts-expect-error' directive.
```

4. Bridge type gate, `node_modules/.bin/tsc -p tsconfig.bridge.json`. Expected exit 0. `tsconfig.json:24` excludes `tests/bridge*.test.ts`, so r1's root-gate run never type-checked the Bridge file. This gate is its first check, and my expectation comes from reading.

5. Producer dry run, in a tree without symlinked roots. The file must sit where its five `../` reach the repo root, which is E itself and not `E/1358-stage` ("Outside the brief", item 2); set `P14_SAVE43_PRODUCER_HEAD` to that tree's HEAD.
   - Expected: exit 0, and three new files under `tests/fixtures/p14/genuine-v43-pre-romance/` (`MANIFEST.json`, `genuine-v43-pre-romance-week-<N>.json.gz`, its `.provenance.json`).
   - `facts.competitionEdges` should name the three slate pairs (a,b), (b,c), (a,c) at `sharedCompetitions` 2: one competition per production, two productions after the re-greenlight.
   - Reading cannot give N, the first shelving week on seed `r1314-casting-01`; it is at most 400.
   - Run in place from `E/1358-stage`, it fails on import resolution before writing anything.

## Hashes (sha256)

- `1358-rel-sliceB-red-r2.patch`: `e153d5e8aa0338612d0c6db8a44c8cc9ce5958f261c4cc9766b86bea7ccb032d` (102,239 bytes; six files, tests only, no `tests/fixtures` path).
- `1358-rel-sliceB-red-r2-classification.json`: `15f3e3378805ca54b759b6ddd6b30c06dc1f02cdac0ed31075d6386e823ea988` (69,130 bytes).
- `1358-P-save43-producer.ts`: not delivered; the staged file stays `bd49373d579de61604abf1a8238788daece4c94b3c15038184ef980e4ab9f713`.
- This handback cannot hold its own hash; the final report gives it.
- Inputs: r5 `34c5be7553b248ef1a89e9156f8b2d330b1ab1034794a2e2b35b282fd6e36975`, step3 `8054086910c337aebee3504fc6f32c5338255ae4a1820435da66a8693f36f49e`, r1 `5d7a3591ba4c6f5ecf05eb1ddbf5df2258324f2ac2b7f292fba577acc6da4dca`.

## Apply check at the real HEAD (read-only, temporary index)

```
GIT_INDEX_FILE=/Users/zacheryspector/studio-scratch/1358-r2/apply-check.index git -C <repo> read-tree HEAD
GIT_INDEX_FILE=… git -C <repo> apply --check --cached <E>/1348-stage/1348-rel-sliceA-red-r5.patch            # exit 0
GIT_INDEX_FILE=… git -C <repo> apply --check --cached <E>/1348-stage/1348-rel-sliceA-production-step3.patch   # exit 0
cat <E>/1348-stage/1348-rel-sliceA-red-r5.patch <E>/1348-stage/1348-rel-sliceA-production-step3.patch \
    /Users/zacheryspector/studio-scratch/1358-r2/1358-rel-sliceB-red-r2.patch \
  | GIT_INDEX_FILE=… git -C <repo> apply --check --cached -v                                                   # exit 0
rm -f /Users/zacheryspector/studio-scratch/1358-r2/apply-check.index
```

- All three patches check clean at HEAD `469a9547`: r5 and step3 with the offsets the parent saw, and r2 with no offset.
- r2 has to ride in the same input as r5. Its `tests/p14b5-relationships.test.ts` hunk sits on lines r5 adds. `git apply` clears its same-path table (`fn_table`) after each input file, and `--check` writes no index, so passing three file arguments checks r2 against bare HEAD. That form fails on that hunk by design. The single stream chains the three patches in one run and writes nothing.
- The temporary index is deleted. The real index hash and mtime are unchanged, and no object file in the common git dir is newer than 20:25.

## Outside the brief

1. **`src` did change since `c614b7e9`.** The brief says it did not. Commits `3b2dc509` and `321a4378` (P15 Wave 1) add `src/core/corporateCondition.ts`, `studioLoan.ts`, `campaignLegacy.ts` and 40 lines of `TUNING` keys. No runtime module imports them. The only code that enumerates `TUNING` keys is `src/harness/d16/experiment.ts:300`. No slice B leaf is affected, and `generated` is unchanged.
2. **The producer cannot run from `E/1358-stage`.** `1358-P-save43-producer.ts:36-43` imports with five `../` and `:45` sets `ROOT` the same way. Five levels up from `E/1358-stage` is `docs/`, so `bridge/protocol.ts` resolves to `docs/bridge/protocol.ts` and the run fails before any write. 1344-P2 works because it sits in E itself. Its provenance (`:169`) and the GENUINE leaf's assertion message (`tests/p14b10-save-v44.test.ts:126`) name the stage path as well. Fix: run a copy placed in E, or add one `../` to the eight specifiers and `ROOT`.
3. **Open GREEN question for the low-proximity leaf at :319.** It stages a value-50 track anchored 200 weeks back, touches it at week 401, and expects 50 (:328). Suppose the touching write first materializes the decayed value and then resets `anchorWeek`, as `writeEdge` does for closeness and as "the same shape as currentCloseness" (1347-A §2.3) suggests. Then the value is `50 - trunc(50 * 97 / 260)` = 32 and the leaf cannot pass at GREEN. Without materialization, any shared take would restore a decayed romance in full. Please rule. Moving the staged anchor inside `ROMANCE_GRACE_WEEKS` (say `week - 100`) makes the leaf hold under either reading. I left it unchanged. The new partnered leaf anchors at the write week minus one and holds either way.
4. **A budget that cannot fire.** The first `baseWorld()` caller (:239) runs its build inside the default 5 s budget. Vitest 2.1.9 starts the timer only after a synchronous body returns (`node_modules/@vitest/runner/dist/index.js:32-50`), so the budget cannot fire. This is the pattern 1348-F4 item 3 rules out. I cannot measure the build, so I did not add a budget. 1358-X's timing gives the number for an honest one.
5. **Stale describe titles.** The two growth describes (:238, :292) still say "(Proposed seam: advanceRelationshipsWeek)", and the drift describe (:451) says "(Proposed API: … see file header gap 2)". Renaming them would change 14 leaf identities, so I kept them. The header now states both rulings, and its "GAP 2" paragraph keeps the drift pointer resolvable.
6. **Uncertain reading at :483.** I read "endedWeek" in §3 as the ending week computed on read, before any write records it. Without that, the read would jump at the derived ending and jump back when a write records it, which contradicts 1347-A §5 ("changes no closeness"). If you read §3 as the recorded `endedWeek` only, strike that leaf.
