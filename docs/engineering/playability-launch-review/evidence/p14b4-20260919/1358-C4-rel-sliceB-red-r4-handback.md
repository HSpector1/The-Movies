# 1358-C4: P14B relationship slice B, RED r4 handback

## Status

DONE, with nothing run. I started no vitest, tsc, node or tsx process. r4 applies 1358-F3 items 1-3 and applies alone, as one patch, at the real HEAD `b0809602`. For every leaf r4 leaves unchanged, 1358-X's observed r3 run gives the expected result. Reading the code gives the rest.

## Base and tree

- Real repo `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`, HEAD `b08096020e4dccf8c22d036bbd9fb7ad742e5aea` at 22:21 and at 22:39 CDT.
- Before the archive I confirmed with `git cat-file --batch-check` that all 1,528 needed blobs exist locally. The common git dir held 4,197 object files before and after, so no lazy fetch wrote into the repo.
- Scratch tree `/Users/zacheryspector/studio-scratch/1358-r2/tree-r4`, branch `main`:
  - `34e5418` base. A `git archive` of `b0809602` with `tests` minus `tests/fixtures`, and the producer at its E path in a real `docs` directory. `node_modules`, `art`, `tools` and `tests/fixtures` are linked with `ln -sfn`.
  - `618f43f` (tag `slice-b-r3`). r3's test changes (`git diff slice-a slice-b-r3 -- tests` from the old tree) applied unchanged, with no offset.
  - `286e82e` (tag `slice-b-r4`). The r4 changes: 3 files, 67 insertions, 17 deletions against r3.
- Slice A at HEAD equals the old scratch `slice-a`:
  - `src`, `bridge`, `ui`, `generated`, `scripts`, the package files, the tsconfigs and the vitest configs are blob-equal;
  - `tests` match outside `tests/fixtures`.

  So `src/core/relationships.ts:310` still holds `advanceRelationshipsWeek`, and r3's p14b5 title hunk applies at HEAD.
- The old tree `/Users/zacheryspector/studio-scratch/1358-r2/tree` and the r2 and r3 deliverables stay unchanged.

## Changes per 1358-F3 item

Line numbers are r4 lines.

### Item 1. The producer founds first

File: `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1358-P-save43-producer.ts`, delivered as `/Users/zacheryspector/studio-scratch/1358-r2/1358-P-save43-producer.ts`.

- **The founding call.**
  - :135 reads `let s = foundStudio(fundIfNeeded(s0), market)`; r3 had `let s = fundIfNeeded(s0)`.
  - The first `greenlightCycle` (:136) now commissions from a writer that `foundStudio` (:76-87) signed at :78-80.
- **Order, checked on seed `r1314-casting-01`:**

| Step | `tests/p14b9-casting-competition.test.ts` | `tests/p14b10-conflict-evidence.test.ts` | Producer r4 |
|---|---|---|---|
| Fund | :145 | :237 | :135, `fundIfNeeded` |
| Derive the week-0 market | :146 | :238 | :150, `deriveMarket` |
| Sign writer, director, craft and actors | :147-149, every market actor | :239-241, three actors | :78-80, three actors |
| Strike the mounted set; commission `set-grand-ballroom` | :150-152 | :242-244 | :81-83 |
| Reach week `SET_BUILD_WEEKS_BAND_HIGH` | :153, `advanceTo` | :245, `advanceTo` | :84, that many ticks from week 0 |
| Activate script development and casting | :154 | :246 | :85 |
| Greenlight the contested slate | a different chain | :285 | :136 |
| Cancel, then fund | | :286 | :137 |
| Re-greenlight the same casting session | | :287 | :138 |
| Cancel, then fund | | :288 | :139 |

- **Three equivalences, by reading:**
  1. The producer derives the market from a separate, unfunded `p13aGeneratedStudio(SEED)`. `hiringMarketIds` (`src/core/employment.ts:410-435`) reads free agents, contracts, rival employment, the market epoch and the seed stream. It never reads cash, so the ids match the funded world's.
  2. The producer ticks `SET_BUILD_WEEKS_BAND_HIGH` times from week 0. `src/core/worldgen.ts:676` starts every world at tick 0, so this equals `advanceTo` (`src/harness/p13a/fixtures.ts:13-16`).
  3. `fundIfNeeded` (:115-123) writes the same cash and the same ledger kind and amount as `fund` (`tests/helpers/p14b2-fixtures.ts:15-19`). Its note differs, and it skips a zero delta.
- **Funding.** `fundIfNeeded` belongs before founding, ahead of the first `signContract`.
  - Both reference routes fund first (p14b9 :145, conflict-evidence :237). p14b9's docstring (:141-143) applies the bootstrap "before any signing bonus is debited (1315-C2 revision, defect 1)".
  - Neither route funds between founding and the first greenlight, so r4 adds no fund there.
  - After founding, the producer funds only after each cancel, as conflict-evidence does at :286 and :288.
- **One change beyond the founding call.** :139 now cancels the second production before it funds, as conflict-evidence does at :288. r3 left that production active.
  - No reference route ticks a greenlit player picture forward.
  - Without a director call, such a picture holds through every natural week of the shelving loop (`src/core/studioCalendar.ts:674`), while payroll and overhead continue (`src/core/studioCalendar.ts:272-273`).
  - With the cancel, the route stays a strict prefix of conflict-evidence's.
  - The (a,b) edge keeps its two competitions, because a cancel moves no competition count: conflict-evidence reaches 3 across two cancels.
  - Reverting the cancel is a one-line change.
- **Text.** The docstring (:124-129) and the provenance `route` string (:177) now describe this route.

### Item 2. Budgets that can fire

- **`baseWorld()`**, in `tests/p14b10-romance.test.ts`:
  - :130 `const BASEWORLD_BUDGET_MS = 90_000` replaces `PROVISIONAL_BASEWORLD_BUDGET_MS = 120_000`.
  - The comment at :126-129 cites 1358-F3 item 2, the 1359-F4 rule and 1358-X's 14,082 ms.
  - The check and its message (:142-143) use the new name. The error name stays `BaseWorldBudgetExceeded`.
  - The file holds no "PROVISIONAL".
- **`rosterWorld()`**, in `tests/bridge-p14b10-relationship-labels.test.ts`:
  - :57 imports `performance` from `node:perf_hooks`.
  - :98 sets `ROSTER_WORLD_BUDGET_MS = 45_000`.
  - The build times itself from :104 to :120. Past the budget it throws `RosterWorldBudgetExceeded` (:121-125).
  - :100 caches the error and :102 rethrows it, so no later leaf rebuilds.
  - The memo and its `structuredClone` are unchanged.
- **`cohortThreeFilms()`**, through the new wrapper `mentorCohort()` (:247-267) in the same file:
  - :251 sets `COHORT_THREE_FILMS_BUDGET_MS = 240_000`.
  - The first call times the build (:257-260) and throws `CohortThreeFilmsBudgetExceeded` past the budget (:261-265).
  - :253 caches the error and :255 rethrows it. Later calls return the helper's memoized clone (:256).
  - Both Mentor leaves call the wrapper (:271, :281).
- **Timeouts.** The two vitest timeouts (:278, :290) keep `180_000` and the 1356-F5 note. The header (:51-54) names the two budgets.
- **Two comment fixes in the `rosterWorld()` block.** The docstring (:90) named `advanceTo(state,400)`, and the comment at :110-111 named a week-400 advance. The code advances to week 150, as :113-118 already explained. Both now say so.

### Item 3. The third-party leaf

- `tests/p14b10-romance.test.ts:277`. A guard loop at :279 checks `ROMANCE_FORMATION_THRESHOLD` and `ROMANCE_PROXIMITY_GAIN` before `baseWorld()`, with the partnered leaf's comment form at :278.
- At RED the leaf fails at :279: "expected 'undefined' to be 'number'".
- At GREEN it passes only if the open bond between l and z blocks both growth and formation: the staged 65 stays 65, and bonds stay `[]`.

### Item 4. Everything else, and the rebase

- No other leaf changed, and r4 renames nothing.
- The header (:12-15) records r4.
- The 17 type-level RED errors stay; r4's six added lines above the drift leaves move their positions.
- `1358-rel-sliceB-red-r4.patch` is `git diff base slice-b-r4`. It is a whole patch against HEAD, not an increment on r3, and covers seven files:
  - the producer;
  - `tests/bridge-p14b10-relationship-labels.test.ts`, `tests/p14b10-competitions-log.test.ts`, `tests/p14b10-labels.test.ts`, `tests/p14b10-romance.test.ts` and `tests/p14b10-save-v44.test.ts`, all new;
  - `tests/p14b5-relationships.test.ts`, the family 4 title only.

## Classification

`1358-rel-sliceB-red-r4-classification.json` has 87 rows: 73 fails, 13 control-passes and 1 not executed. Identities are unchanged.

- **1358-X evidence.** Every row now carries 1358-X's observed r3 outcome, from `x-red-sliceB.json`.
  - All 19 of r3's derived rows matched 1358-X.
  - 18 of them become observed rows.
  - The third-party row stays "not executed", because r4 changes that leaf.
- **The strict-Picks leaf** counts as a control pass because it passes at runtime. Its row says it is RED at the type gate only.
- **Rows with new content:**
  - the third-party leaf;
  - the below-Friends note (the final `baseWorld()` budget);
  - the Rivals-on-a-disclosed-counterpart note (the `rosterWorld()` budget);
  - both Mentor rows. 1358-X's observation replaces r1's stale "BLOCKED" text, and each row's note names the wrapper;
  - the save-v44 GENUINE note (the producer);
  - the type-gate positions in five drift rows.
- **Every other row** gains one note with 1358-X's status and first failure line.
- **Generator:** the session scratchpad's `make_r4_classification.py`. It asserts the romance and Bridge rows against the r4 `it(` titles in order.

## What 1358-X2 must run

1. **Tree.** Build it at the real HEAD `b0809602` by the 1327-C method (`ln -sfn`), then apply `1358-rel-sliceB-red-r4.patch` alone. Slice A has landed, so r5 and step3 no longer apply.
2. **Vitest.** `npx vitest run --project core --no-cache tests/p14b10-romance.test.ts tests/bridge-p14b10-relationship-labels.test.ts`, with 1358-X's reporters.
3. **Type gates**, if the parent wants the new positions confirmed:
   - root, `node_modules/.bin/tsc --noEmit -p tsconfig.json`;
   - Bridge, `node_modules/.bin/tsc -p tsconfig.bridge.json`.
4. **Producer**, by the 1344-X method that 1358-X used:
   - an archive of a commit that holds the r4 producer;
   - a real, empty `tests/fixtures/p14/`;
   - only `node_modules` linked;
   - the producer at its E path;
   - `P14_SAVE43_PRODUCER_HEAD` set to that commit.

## Expected 1358-X2 results

### `tests/p14b10-romance.test.ts`

34 leaves: 29 failed, 5 passed. Only the :277 row changes against 1358-X; every other row is 1358-X's observation moved to r4 lines.

| Line | Leaf | Expected at RED |
|---|---|---|
| :155, :166 | two bindings leaves | fail |
| :172-:199 | five `currentRomanceValue` leaves | fail; the 229-week leaf at its guard, :205 |
| :222-:259 | seven `romanceStatus` leaves | fail |
| :265 | below Friends | **pass** (control); it pays the `baseWorld()` build, 14,082 ms in 1358-X |
| :277 | third party blocks | fail at :279, "expected 'undefined' to be 'number'" (r4 change) |
| :296 | romance-partnered-pair-keeps-growing | fail at :298, "expected 'undefined' to be 'number'" |
| :321 | director-lead gain | fail at :330, "expected null not to be null" |
| :336 | lead-antagonist gain | fail at :344, "TypeError: Cannot read properties of null (reading 'value')" |
| :347 | low proximity, anchor inside grace | fail at :359, "expected 300 to be 401" |
| :364 | materialize first | fail at :366, "expected 'undefined' to be 'number'" |
| :387 | shared success gain | fail at :402, the same TypeError |
| :405 | rival pair | fail at :413, the same TypeError |
| :418 | formation | fail at :428, "expected NaN to be undefined" |
| :432 | re-formation | fail at :444, `toEqual`: one bond row received, two expected |
| :449 | ending persisted | fail at :453, "expected 'undefined' to be 'number'" |
| :474 | endedWeek never moved | **pass** (control) |
| :488 | no romance driver at the ending | **pass** (control) |
| :510 | hold while partners | fail at :517, "expected 70 to be 90" |
| :522 | recorded ending, endedWeek side | fail at :526, "expected 50 to be 70" |
| :529 | recorded ending, lastEventWeek side | **pass** (control) |
| :538 | ending computed on read | fail at :539, "expected 'undefined' to be 'function'" |
| :560 | currentTier holds the tier | fail at :566, "expected 'Friends' to be 'Inseparable'" |
| :569 | strict Picks | **pass** at runtime; RED at the type gate |

### `tests/bridge-p14b10-relationship-labels.test.ts`

12 leaves: 9 failed, 3 passed, the same leaves and messages as 1358-X.

- :140 fails "expected 56 to be 57".
- :146 fails "expected false to be true". It is the first `rosterWorld()` caller: 5,704 ms in 1358-X.
- :168 fails "expected false to be true".
- :181, :192 and :203 fail on the missing `romance` field.
- :222 fails "Cannot read properties of undefined (reading 'find')".
- :160, :212 and :234 pass.
- The Mentor leaves:
  - :270 fails at :277, "TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))". The first `cohortThreeFilms()` build ran 40,219 ms in 1358-X.
  - :280 fails at :289, "TypeError: Cannot read properties of undefined (reading 'some')".

No budget error should fire. 1358-X measured 14,082, 5,704 and 40,219 ms on Node v22.23.2. F3's 1.4 times for Node v20.20.2 gives about 20, 8 and 56 s, against 90, 45 and 240 s.

### Type gates

- **Root:** exit 2 with exactly 17 errors.

```
tests/p14b10-labels.test.ts(47,10) (48,10): TS2305 RIVALS_SAME_SLOT_COMPETITIONS, professionalRivalsEvidence
tests/p14b10-romance.test.ts(89,3) (89,24) (89,48) (89,77): TS2305 ROMANCE_DECAY_WEEKS, ROMANCE_EXIT_THRESHOLD, ROMANCE_FORMATION_THRESHOLD, ROMANCE_GRACE_WEEKS
tests/p14b10-romance.test.ts(90,3) (90,27): TS2305 ROMANCE_PROXIMITY_GAIN, ROMANCE_SUCCESS_GAIN
tests/p14b10-romance.test.ts(91,47) (91,81): TS2305 currentRomanceValue, romanceStatus
tests/p14b10-romance.test.ts(514,90) (532,90) (551,92) (552,91): TS2353 'romance' does not exist in type 'Pick<RelationshipEdge, "closeness" | "lastEventWeek">'
tests/p14b10-romance.test.ts(563,126): TS2353 'romance' does not exist in type 'Pick<RelationshipEdge, "closeness" | "lastEventWeek" | "sharedCompetitions">'
tests/p14b10-romance.test.ts(572,7) (574,7): TS2578 Unused '@ts-expect-error' directive.
```

- **Bridge:** exit 0. The new import resolves under `"types": ["node"]` (`tsconfig.bridge.json`). `noUnusedLocals` holds, because every new binding is read.
- **UI:** unchanged, exit 0.

### Producer

Expected exit 0, writing these under `tests/fixtures/p14/genuine-v43-pre-romance/`:
- `MANIFEST.json`;
- `genuine-v43-pre-romance-week-<N>.json.gz`;
- its `.provenance.json`.

`facts.competitionEdges` should show the slate pairs (a,b), (b,c) and (a,c), each at `sharedCompetitions` 2. Reading cannot give N, which is at most 400. If no rival shelves by week 400, the run exits 1 with "route premise failed: no rival business reached non-empty screenplayShelving by week 400" before `mkdirSync` (:158), so it writes nothing.

## Apply check at the real HEAD (read-only, temporary index)

```
GIT_INDEX_FILE=/Users/zacheryspector/studio-scratch/1358-r2/r4-apply-check.index git -C <repo> read-tree b08096020e4dccf8c22d036bbd9fb7ad742e5aea
GIT_INDEX_FILE=… git -C <repo> apply --check --cached -v < /Users/zacheryspector/studio-scratch/1358-r2/1358-rel-sliceB-red-r4.patch   # exit 0, all seven files
rm -f /Users/zacheryspector/studio-scratch/1358-r2/r4-apply-check.index
```

- The temporary index and its lock are gone.
- The real worktree index kept its mtime (1790911254) and its hash (`a736124f…`), and the object count stayed 4,197.
- No link points back into itself under the real repo.

## Hashes (sha256)

- `1358-rel-sliceB-red-r4.patch`: `d41ea111f759c9be8ba8920bfe330f4f8eb13a524e6a253e870d9fc1e7569e26` (113,244 bytes)
- `1358-rel-sliceB-red-r4-classification.json`: `3b008e0a28d64eab6c698c5173920aac5cf8bec061ac873678e12cc0e4296282` (90,881 bytes)
- `1358-P-save43-producer.ts`: `04713f73d9a172f76302a860f3b24af925316155d5b504444de4af9ad6a698a3` (13,489 bytes). The copy at HEAD is `73f47859…`.
- Inputs:
  - r3 patch `69f5a673…`;
  - r3 classification `e8d2eac0…`;
  - 1358-X's `x-red-sliceB.json` `dafb13d74ac239fc2656b1476b0a70fbd43809deb1cfc33d454932817949fd54`.
- The final report carries this handback's hash.

## Uncertain

1. **Shelving.** Nobody has measured whether a rival shelves a screenplay by week 400 on `r1314-casting-01`. 1344-P2 saw it near week 94 on another seed.
2. **The second cancel at producer :139.** It is my reading of "reproduces that route", not a ruled item. The parent can drop it with one line.
3. **Contract expiry.** If shelving comes late, the loop passes week 208, when the six contracts signed at week 0 expire. No reference route ticks this studio that far.
4. **The Mentor timer.** It measures a build only when the helper builds inside this file. Neither `vitest.workspace.ts` nor `vitest.config.ts` turns off vitest's default per-file isolation, so the first call builds. With shared modules the timer would see a warm clone: it could pass early, but it could not fail falsely.
