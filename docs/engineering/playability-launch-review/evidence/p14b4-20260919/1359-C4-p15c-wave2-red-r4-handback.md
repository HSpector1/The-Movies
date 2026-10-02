# 1359-C4 handback: P15C Wave 2 RED r4 and reference r3 (answers 1359-F3)

**Status: staged. No measurement at the final heads.** Route L now founds through the migration origin, the lawful construction 1356-F4 accepted on the basis 1356-F5 states. The reference keys `rankingSnapshots` on (`recordId`, `studioId`). In the scratch tree T (`studio-scratch/1359-red/tree`):

| Branch | Head | Holds |
|---|---|---|
| `main` | 400e10b | RED r4: r3 (389d4b2) plus one commit, tests only |
| `ref-1359-r4` | 7d2156b | r4 plus the staged reference r2 (912b65e) and the r3 ranking key (7d2156b), src only |
| `sibling-1359` | b253fc3 | the unchanged sibling patch, rebased onto r4 |

`main` is checked out and the tree is clean.

**Measurement.** I made four single-file vitest runs between 20:04:00 and 20:07:01 CDT on 2026-10-01, before the recorded gates took the heavy lane (HEAVY-LANE-LOCK: "1344 recorded broad gates, started 2026-10-01 20:08:08 CDT"). They ran at 1207b44 (RED) and a3ff074 (reference). From 20:08 on I ran no measurement, because the lane stayed locked for the recorded core and UI gates and the §7 verification. Nothing ran at the final heads, and the reference r3 pair refusal has no run. The final heads differ from the measured commits only in comments and one dropped `export` on `foundThroughMigration`, which nothing imports: `git diff 1207b44 400e10b` touches two test files, 19 insertions and 17 deletions, and `git diff a3ff074 7d2156b -- src` is empty. The parent's 1359-X2 is the measurement of record. It runs RED r4 and reference r3 alone, the control `legacy-control-late-founding-route-lawful` and the type gate included, and it sets the route and extension budgets (1359-F3 "Budgets").

## The construction: a migration-origin founding at 6188

Route L keeps its seed, its headless OracleAgent year, its idle ticks to 6188 and its headless branch. At 6188, `foundThroughMigration` (tests/helpers/p15c2-route-l.ts:62) replaces `beginFounding` with 1356-C3's `foundMidGame` steps:
1. `beginFoundingHistoricalControl` opens the draft while no industry exists;
2. `signContract` hires the first FOUNDING_MINIMUMS applicants per role (3 actors, 1 director, 1 writer, 1 craft; tuning.ts:386-389) on 208-week terms, the recruitment fund paying the bonuses;
3. `foundStudio` closes the draft;
4. `initializeHollywood(state, 'migration')` starts the industry at 6188 and records the six contracts as `existing-player-contract` rows.

**Why the law accepts it.** No week carries an open draft, so rival method locks pass `technology.ts:897`. The payment rule exempts observed contracts (`hollywoodValidation.ts:568-569`). The end state is the one the frozen V18-to-V19 migration builds (`save.ts:8048-8053`; 1356-F5). A premise in the builder throws by name if any founded state from 6188 to 6241 holds an open draft (p15c2-route-l.ts:100-110).

**Why it serves the leaves.** Under r3, `beginFounding` created the industry at 6188 in the same call that opened the draft. r4 keeps the facts that follow from that: origin `migration` at week 6188 and every studio entered at 6188. The player's side changes from an open draft with no one signed to a closed draft with six contracts. Rival activity after 6188 can differ in detail, since the six signed people leave the market and the unsigned applicants are no longer reserved. No leaf pins a route L rival fact by value, and none asserts the player's cash or roster after the founding: B3, B9 and C12 compare two runs of one state.

**Rejected: a week-0 founding run to the boundary.** The economy engages at week 0, so every player release would get a run, and the run-less player films A2b and B5 read would not exist. It also adds about 6,190 industry ticks; route L's 53 industry ticks took 3.2-3.5 s. G6240 already covers a fresh-origin campaign at 6240.

## Changes

| Item | Change | Commit |
|---|---|---|
| F3 RED r4, route L | `tests/helpers/p15c2-route-l.ts`: `foundThroughMigration` replaces `beginFounding`; the closed-draft premise covers every founded week; the header states r3's failure and the 1356-F5 basis. | 400e10b |
| F3 RED r4, control | `legacy-control-late-founding-route-lawful` (integration file :338) gains three assertions: a closed draft at 6188, a non-empty player roster, and every roster row `existing-player-contract` (:347-350). Its name stays: the route is still a late founding. The file header describes the new founding. No other leaf changed. | 400e10b |
| F3 producer | `1359-P-p15c2-route-l-producer-r4.ts`: asserts the closed draft at the founding week; MANIFEST `record` becomes `1359-P r4` and `route` names the migration-origin founding. Capture paths, names and MANIFEST keys are unchanged. | `studio-scratch/1359-red/` |
| F3 reference r3 | `src/core/campaignLegacy.ts` `readFacts`: the record-id set becomes a (`recordId`, `studioId`) set keyed by `JSON.stringify([recordId, studioId])`. A repeated pair refuses as `campaign legacy: rankingSnapshots[i] (<recordId>, <studioId>) repeats a (recordId, studioId) pair`. `git diff ref-1359-r3 ref-1359-r4 -- src` is this one hunk. | 912b65e, 7d2156b |
| Classification | 12 rows cite 1359-F3: the control, with new expected text, and the 11 leaves that read route L's founded branch or its captures, each with its route need. 44 rows, 9 controls, 3 fixture-pending, as at r3. | `studio-scratch/1359-red/` |
| Sibling patch | Unchanged. It applies on r4 `main` and on `ref-1359-r4`; `git diff main..sibling-1359` after the rebase still hashes to 6014f074. No sibling r2. | b253fc3 |

Unchanged, as 1359-F3 says: the leaves and their RED reasons, the B7 note, 1355-F5's lookup rule and the F1 relaxation.

## What each route L leaf needs

Route L has no industry before week 6188, at r3 and at r4: the premise at p15c2-route-l.ts:90-92 (r3: :57-59) throws if the headless world reaches 6188 with one.

| Leaf (integration file line) | Needs from route L | Industry history before 6188 | Why r4 provides it |
|---|---|---|---|
| `legacy-control-late-founding-route-lawful` (:338) | The founding week, founded 6238-6241, headless 6239-6241; origin `migration` at 6188, every studio entered at 6188, run-less headless-year films, no career event; every state saves | None. Its entry-week assertion rules one out | No state carries an open draft or a `player-contract` row |
| `legacy-adapter-run-status-natural-no-run` (:431) | Player films with no run at 6240 | None. They are player films of weeks 0-52, made headless | r4 keeps the headless year; the founded studio releases nothing |
| `legacy-tick-freezes-once-at-6240` (:664) | Natural founded states 6238-6241 whose industry originates before B, so the 6240 tick freezes; saves at 6240 and 6241 | None. The freeze needs `originWeek` 6188 < B | Same origin as r3; the saves now validate |
| `legacy-freeze-writes-only-its-root` (:695) | A 6239 state that passes every frozen rule, so the forged official refuses on the marker rule alone; one tick to 6240 | None | r3's 6239 refused first at `technology.ts:897` (1359-X F-1) |
| `legacy-adapter-only-at-boundary` (:748) | A headless-year player film whose concept it removes; founded 6238 and 6239; the extension at 6300 | None | Unchanged headless year; lawful founded branch |
| `legacy-ticks-after-freeze` (:766) | 520 post-freeze ticks with rival releases, industry career events and receipts after B; a save at 6760 | None. It needs rivals active after B, and the 6188 entrants are | Passed at a3ff074 |
| `legacy-hollywood-null-no-freeze` (:783) | The headless branch at 6239-6241 | None. It needs no industry | r4 leaves the headless branch alone |
| `legacy-determinism` (:795) | The founding-week state saved, reloaded and re-ticked to the same 6240 official | None | The founding-week state now holds a closed draft and saves |
| `legacy-migration-empty-root`, `-before-boundary`, `-past-boundary` (:819, :849, :861) | 1359-P's captures of route L at 6239 and 6240, with an industry; C3 needs the 6239 capture to freeze on its next tick | None | 1359-P r4 mints from the same route code; r3's route refused `makeSave` from 6238 on (1359-X F-1), so r3's producer could not mint |
| `legacy-validate-refs-post-boundary-row` (:1001) | A 6300 state that passes every frozen rule; an official citing a row of a domain that grew after B | None. It needs rows from 6188-6239, after the founding | Passed at a3ff074, so the 6300 official cites such a row |
| `legacy-round-trip` (:1075) | Founded 6241 saved, loaded and re-saved byte-identically | None | 6241 now saves |
| Sibling B2 and B4b | Founded 6239 and 6240 with P15A.2's ranking root; the 6240 record covers [6188, 6240) | None. The window is the industry's first year | Unchanged leaves; same weeks |
| Sibling C3b | The 6239 capture with a sibling migrated at 6239; `limited` needs studios entered before 6239 | None. Entry at 6188 is earlier | Same captures as C2-C4 |
| Sibling C8b | Founded 6241 with at least one ranking quarter | None. Quarters 6201-6240 follow the origin | Same weeks |

**Verdict.** No leaf on route L needs industry history before 6188, and none needs a founding inside a long-running industry. Every leaf that reads a long industry history reads G6240, the genuine fresh-origin Save38 at 6240, or the genuine Save42 at week 130: the adapter leaves except A2b, B4, the two genuine-capture migration leaves, C5 to C11 except C10b, and both replay leaves.

## Runs (pre-lock, at the measurement commits)

Each run: `node_modules/.bin/vitest run --project core --no-cache --reporter=verbose --reporter=json --outputFile.json=<scratchpad> <one file>`, one process, after `pgrep -f vitest` came back empty and with no lock file.

**RED, `main` at 1207b44**, `tests/p15c2-campaign-legacy-integration.test.ts`, 20:04:00-20:04:25:
```
 ✓ |core| tests/p15c2-campaign-legacy-integration.test.ts > p15c2 controls: the fixtures are lawful at RED and at GREEN > legacy-control-late-founding-route-lawful 5093ms
 ✓ |core| tests/p15c2-campaign-legacy-integration.test.ts > p15c2 controls: the fixtures are lawful at RED and at GREEN > legacy-control-genuine-save38-6240-lawful 5155ms
{"kind":"1359-legacy-route-timing","seed":"1359-legacy-late-founding-01","headlessTo6188":1353.9139969999997,"industry6188To6241":3482.866223}
 Test Files  1 failed (1)
      Tests  35 failed | 2 passed (37)
   Duration  23.16s (transform 1.97s, setup 0ms, collect 2.57s, tests 19.78s, environment 0ms, prepare 101ms)
```
The 35 first messages, from the JSON report, each match the leaf's `expectedFailureToday` in the r4 classification (checked by script; 0 mismatches):
- 15: `RED: src/core/campaignLegacy.ts does not export a function named 'freezeCampaignLegacyWeek' (1359-A §3-§5)`
- 11: the same for `'legacyFactsFromState'`
- 4: `RED: the state carries no campaignLegacy root (1359-A §5: a top-level GameState key)`
- 1: `RED: src/core/campaignLegacy.ts does not export LEGACY_DEFINITIONS (1359-A §5.1 era versioning)`
- 3 (C2, C3, C4): `FIXTURE PENDING: tests/fixtures/p15/p15c2-route-l-captures/MANIFEST.json does not exist; ...`
- 1 (the F1 leaf): `campaign legacy: films[0] (AUTHORED).settledWeek must be a whole week once settled`

**Reference, `ref-1359-r4` at a3ff074**, one process per file:
```
 ✓ |core| tests/p15c2-campaign-legacy-integration.test.ts > p15c2 controls: the fixtures are lawful at RED and at GREEN > legacy-control-late-founding-route-lawful 4849ms
{"kind":"1359-legacy-route-timing","seed":"1359-legacy-late-founding-01","headlessTo6188":1295.8274060000003,"industry6188To6241":3219.412932}
{"kind":"1359-legacy-extension-timing","headlessTo6188":1295.8274060000003,"industry6188To6241":3219.412932,"extension520Ms":8966.058558}
 Test Files  1 failed (1)
      Tests  3 failed | 34 passed (37)
   Duration  58.83s (transform 2.00s, setup 0ms, collect 2.63s, tests 55.44s, environment 0ms, prepare 140ms)
```
The 3 failures are C2, C3 and C4, each on the FIXTURE PENDING message above. Every leaf 1359-X saw fail outside the declaration passes: F-1's control, B1, B3, B6, C10b and C12, and F-2's `legacy-adapter-sibling-roots` and `legacy-condition-at-6240-outside`.
```
 ✓ |core| tests/p15c-wave-r-retention.test.ts > p15c wave R: retention guards over the six named roots (1353-A §4 row R) > wave-r-retention-studio-released-films 35006ms
 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  38.48s (transform 1.93s, setup 0ms, collect 2.63s, tests 35.15s, environment 0ms, prepare 99ms)
```
```
 Test Files  1 passed (1)
      Tests  72 passed (72)
   Duration  1.63s (transform 450ms, setup 0ms, collect 358ms, tests 502ms, environment 0ms, prepare 106ms)
```
(`tests/p15c1-campaign-legacy.test.ts`, Wave 1.)

**Times for the route and extension budgets** (JSON report, full-file runs). The first route leaf pays the route build, and B5 pays the extension; a leaf run alone pays them itself.

| Leaf | Budget | RED 1207b44 (ms) | Reference a3ff074 (ms) |
|---|---|---|---|
| control (route build 4,836.8 at RED, 4,515.2 at the reference) | ROUTE 600 s | 5,092.8 | 4,849.2 |
| A2b natural-no-run | ROUTE | 0.9 | 1.7 |
| B1 freezes-once | ROUTE | 0.8 | 112.4 |
| B3 writes-only-its-root | ROUTE | 0.6 | 227.4 |
| B5 only-at-boundary (extension 8,966.1) | POST_FREEZE 2,400 s | 0.7 | 9,101.0 |
| B6 ticks-after-freeze | POST_FREEZE | 0.6 | 71.9 |
| B8 hollywood-null | ROUTE | 0.5 | 44.6 |
| B9 determinism | ROUTE | 0.6 | 2,993.1 |
| C2 / C3 / C4 (FIXTURE PENDING) | FIXTURE / ROUTE / ROUTE | 0.9 / 1.2 / 0.3 | 12.6 / 1.2 / 0.3 |
| C10b refs-post-boundary-row | POST_FREEZE | 0.5 | 41.0 |
| C12 round-trip | ROUTE | 0.6 | 238.6 |
| Wave R guard 1 (pays the campaign; the other six 0.5-78.3) | GUARD 300 s | not run | 35,006.5 |

## Checks

- **Patches reproduce the branches.** In T, `ad4aaa8` plus the RED r4 patch gives `main`'s tree (028a704a); adding the reference r3 patch gives `ref-1359-r4`'s tree (35874fa3).
- **Real HEAD 469a9547.** `GIT_INDEX_FILE=<tmp> git read-tree HEAD && GIT_INDEX_FILE=<tmp> git apply --check --cached <patch>` passes for the RED r4, the reference r3 and the sibling patch, each from a fresh temporary index in my scratchpad, deleted after. Since base 1063ab4f, HEAD changes no `src`, `generated` or `bridge` file. Its test changes (cec3902c, the Save43 pin sweep, 132 files outside `tests/fixtures`) touch no file this RED imports.
- **No write through a link.** `--no-cache` kept vitest's results cache off: the real repo's `node_modules/.vite/vitest/results.json` kept its mtime across all four runs, and `find -newer` found nothing new under the real repo's `node_modules/.vite` or `tests/fixtures/p15`.

## Hashes (sha256)

| File | sha256 |
|---|---|
| `1359-p15c-wave2-red-r4.patch` (`git diff ad4aaa8..main`, 5 files under `tests/`) | 8f159ca54fba31490d179e3624b939d27dda533c6e97d74fb5a970797a1c62e9 |
| `reference/1359-reference-r3.patch` (`git diff main..ref-1359-r4 -- src`) | 733d1f84d363a8c9926444d282a5b82b67a5b48acc8de56ab6b0a67977dbf713 |
| `1359-p15c-wave2-red-r4-classification.json` | c72bd29c55dd535059d1664aee5133561448c817424e7b90409a734a3b0e04c3 |
| `1359-P-p15c2-route-l-producer-r4.ts` | 78c1d1055973dfd98479f511140d9ec44978639b83ae27e6389ffb55ada35186 |
| `1359-p15c-wave2-sibling.patch`, unchanged | 6014f0741b97490b7df3411037a8c323a89da749c1e0d946ee1562c25dc0ada3 |
| `1359-B7-note-for-p15b.md`, unchanged | 85b15bfe29babb57d52afa9ff8c2fb87423c7a7e97a1b1d731cef997a21ab9ec |

## Outside the brief

1. The four runs used `--no-cache` and a JSON reporter writing to my session scratchpad. Run outputs and the run script stay there, outside `studio-scratch`.
2. After 1356-F5 corrected the founding basis (V18-to-V19, not H8), I amended my first r4 commit (1207b44 to 400e10b) and rebuilt `ref-1359-r4` on it by cherry-pick (936bcde and a3ff074 to 912b65e and 7d2156b). The superseded commits stay in the reflog.
3. I rebased `sibling-1359` onto r4 (30dd8f6 to b253fc3); its content is unchanged.
4. I wrote a probe for the pair rule (`tests/zz-probe-1359-c4-ranking-pair.test.ts`, untracked: one record with rows for two studios accepted; one pair repeated at weeks 104 and 117, which the quarter rule cannot catch, refused). The lock stopped it before vitest started, and I deleted it unrun.
5. The apply checks at the real HEAD covered the reference r3 and sibling patches as well as the RED r4, by the same read-only method.

## Not decided

1. No tsc ran. The control's new reads are `founded.founding` and `hollywood.employment[].studioId` and `.reason`; `'existing-player-contract'` is in the reason union (hollywoodTypes.ts:79). Compilation is UNVERIFIED until 1359-X2's type gate.
2. The reference r3 pair refusal is checked by reading only: the pair check runs before `knownStudio`, so the message names the row and the pair.
3. Budgets stay as r3 set them: route 600 s, extension 1,800 s, post-freeze 2,400 s, fixture 600 s, Wave R 300 s. The leaves assert them after the body (1359-F2 item 2). 1356-F5 gave 1356's harness an in-loop ceiling. If the parent wants the same here, the places are the route builder's tick loops and the extension loop (integration file :315-327).
4. The founded studio stays idle from 6188. Its contracts end at 6396, and it pays overhead with no income through 6760. B6's save at 6760 validated at a3ff074. No leaf reads that cash.
5. The producer r4 has not run. The parent mints with it, not with the r3 producer.
