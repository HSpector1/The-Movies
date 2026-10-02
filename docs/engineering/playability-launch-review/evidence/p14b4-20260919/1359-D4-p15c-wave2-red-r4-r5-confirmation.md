<!-- 1359-D4: confirmation review (read-only) of P15C Wave 2 RED r4 and r5, saved verbatim by the parent -->

# 1359-D4: confirmation of the P15C Wave 2 RED r4 and r5

**Verdict: CONFIRMED.** RED r4 and reference r3 answer 1359-F3, r5 answers 1359-F4, and 1359-X2 agrees with both. All seven checks are MET. I found no blocking defect.

**Scope.**
- **Locations.**
  - E is `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919`, read at HEAD b0809602.
  - T is the author's tree, `/Users/zacheryspector/studio-scratch/1359-red/tree`. Its heads are:
    - RED r3 389d4b2, r4 400e10b and r5 c0bc087;
    - reference r2 b6c3395, built on RED r3;
    - reference r3 7d2156b, built on RED r4, and ad81d6d, built on RED r5;
    - sibling r2 8faf9af.
  - X2's outputs are in `/Users/zacheryspector/studio-scratch/1359-x2/`.
- **What I ran.** Read-only git, grep, shasum, and python3 that printed to stdout. I ran no vitest, tsc, node, tsx or vite-node, and I wrote no file.
- **Hashes.**
  - Every staged file hashes as C4 and C5 state.
  - Each staged patch equals its branch diff in T byte for byte:
    - RED r3, r4 and r5: `git diff ad4aaa8..<head>`;
    - reference r2: `389d4b2..b6c3395`;
    - reference r3: `c0bc087..ad81d6d -- src`, and also `400e10b..7d2156b -- src`;
    - sibling r2: `c0bc087..8faf9af`.
  - X2's run-tree commits c7b8099 and f7f44f7 apply exactly the staged RED r4 (8f159ca5…) and reference r3 (733d1f84…).
- **Shorthand.**
  - I is `tests/p15c2-campaign-legacy-integration.test.ts`. Its line numbers are the same at r4 and r5.
  - R is `tests/helpers/p15c2-route-l.ts` at r4. r5 leaves it unchanged.
  - H is `tests/helpers/p15c2-legacy.ts`.

## Checks

### 1. F3: route L is lawful. MET
- **Construction.** `foundThroughMigration` (R:62-72) does four things in order:
  - calls `beginFoundingHistoricalControl` (R:63);
  - signs the first `FOUNDING_MINIMUMS[role]` applicants of each role on 208-week terms (R:66-70);
  - applies `foundStudio`;
  - calls `initializeHollywood(…, 'migration')` (R:71).

  The body is identical to 1356-C3's `foundMidGame` (E/1356-stage/1356-p15a2-wave2-red-r4.patch:546-556).
- **Its source citations hold at HEAD.**
  - `employment.ts:568-570` is `beginFounding`.
  - `employment.ts:573-576` is the historical control, which refuses a living industry.
  - `hollywood.ts:185` with `industryEmployment.ts:29` turns observed contracts into `existing-player-contract` rows.
  - `hollywoodValidation.ts:568-569`, `technology.ts:897` and `save.ts:8048-8053` say what R claims.
  - `actions.ts:1201-1224` and `actions.ts:2560-2580` also match.
- **Premise.**
  - `closed` (R:100-103) throws "route L premise: the founding draft is open at week N (1359-F3)".
  - It wraps the founding state (R:104) and every tick through 6241 (R:108).
  - R:90-92 still refuses any industry before 6188.
- **Control.** I:347-350 adds three assertions:
  - `founded.founding` is null;
  - the player roster is not empty;
  - every roster row is `existing-player-contract`.
- **X2.**
  - The control passes at RED (x2-red.json, 9,095 ms) and at the reference (7,823 ms).
  - The five route L leaves that fail in 1359-X's x-ref.txt pass in x2-ref.json: B1 (112 ms), B3 (374 ms), B6 (129 ms), C10b (33 ms) and C12 (222 ms).
- **C4's per-leaf table.** Thirteen leaves call `routeL`, `routeAt`, `extension`, `extended`, `captureAt` or `belowStepCaptures`. They are exactly C4's rows, and each line C4 cites is that leaf's `it(` line. I checked every row against the code:
  - A2b (I:431-443) reads `routeAt(B)` and its run-less films.
  - B1 (I:664-693) reads 6238-6241 and saves 6240 and 6241 (I:691-692).
  - B3 (I:695-722) forges an official at 6239 and asserts the marker refusal (I:705).
  - B5 (I:748-764) drops a headless-year film's concept at 6238 and 6239, then reads `extended(6300)`.
  - B6 (I:766-781) asserts rival releases, career events and receipts after B, and saves 6760.
  - B8 (I:783-793) reads only the headless branch.
  - B9 (I:795-803) saves `foundedAtFounding`, reloads it and ticks it to B.
  - C2-C4 (I:819-868) read the captures.
  - C10b (I:1001-1021) reads `extended(6300)`.
  - C12 (I:1075-1083) round-trips 6241.
  - The sibling rows match sibling r2 :50-110.

### 2. F3: the reference r3 ranking key. MET
- **Key.** Reference r3 `campaignLegacy.ts:487-494` (T 7d2156b) keys its uniqueness set on `JSON.stringify([recordId, studioId])`.
- **Refusal.** A repeated pair throws "campaign legacy: rankingSnapshots[i] (<recordId>, <studioId>) repeats a (recordId, studioId) pair" through `fail` (:226-228). The check runs before `knownStudio`.
- **Only change.**
  - `git diff 912b65e 7d2156b` is one hunk in one file, +5/-3.
  - `git diff b6c3395 912b65e -- src` is empty.
  - The two staged patch files differ only in three places: that hunk, the campaignLegacy.ts index line, and a +2 offset in later hunk headers. The other five files are byte-identical.

### 3. F3: "Unchanged". MET
- **Patch.** `git diff 389d4b2 400e10b` touches two files:
  - R, +44/-7: the founding, the premise and the header;
  - I, +13/-4: the header lines :2 and :28-32, and the control's comment and assertions at :344-350.

  No other leaf changes.
- **Classification, r3 to r4.**
  - It keeps the same 44 rows in the same order.
  - Twelve `charterClause` values gain a 1359-F3 note.
  - The control's `expectedFailureToday` text changes.
  - No failing leaf's RED reason changes, and no `control`, `fixturePending` or budget value changes.
- **Other files.** These are unchanged at r4:
  - `p15-roots.ts`;
  - H, which holds 1355-F5's step lookup;
  - the B7 note (85b15bfe…);
  - the sibling patch (6014f074…), which also survives both rebases unchanged.

  The reference's F1 relaxation lies outside the r3 hunk.

### 4. X2 agrees. MET
- **RED (x2-red.json).** 44 tests: 35 failed and 9 passed.
  - I matched each leaf by exact name to the r4 classification. Every failure's first message carries its `expectedFailureToday`, with 0 mismatches:
    - 15 fail on `freezeCampaignLegacyWeek`;
    - 11 fail on `legacyFactsFromState`;
    - 4 fail on the missing root;
    - 1 fails on `LEGACY_DEFINITIONS`;
    - 3 fail as FIXTURE PENDING;
    - the F1 leaf fails on `settledWeek`.
  - The 2 controls and the 7 guards pass.
- **Reference (x2-ref.json).** 116 tests: 113 passed and 3 failed.
  - The 3 failures are C2-C4, each on the FIXTURE PENDING message.
  - The other 41 classified leaves pass, and so do Wave 1's 72.
- **Type gates.**
  - RED: x2-red-tsc.txt is 0 bytes, and run.log records "red tsc exit 0".
  - Reference: its 35 errors sit at the same file sites as 1359-X's, with positions shifted by the new base. None is in a RED file.

### 5. F4: r5. MET
- **Numbers.**
  - H:35 `ROUTE_MS = 90_000`;
  - H:37 `EXTENSION_MS = 90_000`;
  - H:40 `POST_FREEZE_MS = ROUTE_MS + EXTENSION_MS`;
  - H:43 `FIXTURE_MS = 120_000`;
  - `tests/p15c-wave-r-retention.test.ts:104` `GUARD_BUDGET_MS = 300_000`.
- **Rename.**
  - In I, 77 lines change in place and none moves. Every changed line is in C5's list, and C5's list holds no other line.
  - 74 of the 77 differ only by `s/PROVISIONAL_(ROUTE_MS|EXTENSION_MS|POST_FREEZE_MS|FIXTURE_MS)/\1/`. The other three are the header (I:69) and the two assertion messages (I:366, I:780).
  - The zero-context hunks fall where C5 lists them: H at :4, :27-43, :45 and :51; the Wave R file at :81-84, :104 and :112-113.
- **Comments.**
  - H:28-43 records X2 (Node v22.23.2), F4's rule with both of its factors, and each class's slowest leaf. The numbers match X2 and F4.
  - The Wave R header (:81-84) records the 1359-X and X2 guard times and cites 1359-F3 and 1359-F4.
  - I:69 cites X2 and F4.
- **No other change.**
  - `git diff --stat 400e10b c0bc087` lists only H, I and the Wave R file.
  - R and `p15-roots.ts` are untouched.
  - No in-loop ceiling appears.
- **Sibling r2.** Against the sibling patch it changes 12 lines: :33-34, 50, 68, 70, 83, 85, 98, 100, 110, 112 and 124. Each line only drops `PROVISIONAL_`.
- **Classification.**
  - It keeps 44 rows in r4's order, and `provisionalBudget` becomes `budget`.
  - Each row's value equals the constant its leaf passes to `budgeted`: 44 of 44, with the 7 guards on `GUARD_BUDGET_MS`.
  - `legacy-root-fresh` and the F1 leaf pass no budget. They keep `""` and `null`.
  - Only the 9 control texts change, each dropping the word.
  - `grep PROVISIONAL` finds nothing in the r5 patch, the r5 classification or sibling r2.

### 6. r5 needs no run of its own. MET

| Constant | X2's slowest leaf of the class | Budget ÷ time |
|---|---|---|
| `ROUTE_MS` 90,000 | control 9,095 ms; about 13.4 s alone (F4) | 9.9; 6.7 |
| `EXTENSION_MS` 90,000 | `extension520Ms` 13,707.6 ms (x2-ref.txt:87) | 6.6 |
| `POST_FREEZE_MS` 180,000 | B5 13,879 ms; about 23 s alone (F4) | 13.0; 7.8 |
| `FIXTURE_MS` 120,000 | `legacy-migration-empty-root-genuine-save38` 17,259 ms | 7.0 |
| `GUARD_BUDGET_MS` 300,000 | first guard 51,550 ms | 5.8 |

- **Margins.** The four new budgets meet F4's factor of six. F4 keeps the guard at 300,000 by name (note 1).
- **The renames compile (by reading).**
  - I:123-126 imports the four names H exports at :35-43.
  - Sibling r2 :33-34 imports `FIXTURE_MS` and `ROUTE_MS`.
  - No `PROVISIONAL_` identifier remains under `tests/` at c0bc087, and no other file imports H.
  - Every imported name is used, so `noUnusedLocals` holds. No new name collides with an existing one.
- **Timeouts.** I, H and sibling r2 contain no `async` or `await`, and `budgeted` takes `() => void`. The lowered `it` timeouts therefore cannot fire.

### 7. Open items. MET: no item needs a new ruling

| Item | Status |
|---|---|
| C4 ND1, no tsc | X2's clean RED type gate settles it for r4. r5 compiles by reading (check 6). |
| C4 ND2, pair refusal checked by reading only | F4 is silent. My reading confirms the refusal (check 2). F3 placed the rule in the reference, so it needs no ruling (note 5). |
| C4 ND3, budgets and the in-loop ceiling | F4 settles both: the numbers, and "No in-loop ceiling is required". |
| C4 ND4, the founded studio idle to 6760 | F4 is silent. B6's 6760 save validates at X2's reference, and no leaf reads the cash. No ruling needed. |
| C4 ND5, producer r4 has not run | A parent action: mint with 1359-P r4 before the recorded RED (1359-F2; I:33-35). Producer r4 imports R, so it runs the RED's own route, and it asserts the closed draft (:70). |
| C5 note 1, timeouts moved with the names | Verified in check 6. No ruling needed. |
| C5 note 2, the guard against F4's rule | F4's table sets 300,000 by name, which settles the number (note 1). |

## Defects

None.

## Non-blocking notes

1. **Guard margin.** 300 s is 5.8 times X2's 51,550 ms and 4.1 times 1359-X's 73,964 ms (x-ref.txt:76). F4's rule, rounded up, would give at least 310 s. If the parent wants the rule and the number to agree, one line does it: restate the guard as 1359-F3's exception, or raise it.
2. **Fixture margin against 1359-X.** F4 used X2's times only. 1359-X ran the same two-file shape and timed the unchanged `legacy-migration-empty-root-genuine-save38` at 23,171 ms (x-ref.txt:111). Against that time, `FIXTURE_MS` is 5.2 times.
3. **X2 ran its files in parallel.**
   - X2:51 and H:28 call the X2 times single-file runs.
   - The script ran two files (three at the reference) in one vitest process, and the files overlapped. In x2-red.json the integration file ran from 3.5 s to 38.0 s and the Wave R file from 4.0 s to 55.2 s.
   - C4's one-file runs were faster: control 5,093 ms, guard 35,006 ms. The budgets therefore hold more margin over single-file time than F4 states.
4. **HEAD moved after X2.**
   - X2 ran at 85764cd5. HEAD b0809602 changes five src files for relationship slice A: `relationships.ts`, `talentMarket.ts`, `professionTransitions.ts`, `relationshipLabels.ts` and `index.ts`.
   - No path the three patches touch changed between 85764cd5 and b0809602, so the patches still apply.
   - Route L's rival play and its timings on the new src have not run. The recorded RED will be their first run.
5. **The pair refusal is unexercised.**
   - No leaf and no run feeds a repeated (recordId, studioId) pair.
   - Wave 1's landed rule (`src/core/campaignLegacy.ts:482`, "repeats a record id") has no test either.
   - The production writer must replace that landed rule. A law with no uniqueness rule at all would still pass every leaf here.
6. **Extension weeks.**
   - The closed-draft premise covers 6188-6241. The extension (I:315-327) ticks 6242-6760 without it.
   - Only `beginFoundingDraft` (`employment.ts:544-566`) opens a draft, and `tick` never calls it. B6 also saves 6760, so nothing reopens the draft there.
7. **Unmeasured budgets.**
   - C2-C4 and the five sibling leaves have no GREEN-time measurement. X2 saw C2-C4 fail as FIXTURE PENDING within 17.6 ms.
   - Their budgets rest on their classes.
8. **Record nits.**
   - C5 gives the Wave R diff as +6/-4. `git diff --numstat 400e10b c0bc087` gives +7/-5. C5's line list is right.
   - H:32 says "The slowest measured leaf of each class stands above its number". It can read as a time over budget, but it means the comment line above each constant.
   - X2:41-42 says the five former F-1 leaves pass like the control. At RED they fail by their declared names (x2-red.json).
