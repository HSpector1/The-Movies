# 1359-D5: confirmation review of the P15C Wave 2 RED r6 and reference r4

**REFINE.** One required change:

1. In `legacy-old-law-fixture-v1-validates-after-retune`, after I:1206, add the reverse relabel: `refuses(asOfficial({ ...officialOf(frozen), definition: 'campaign-legacy/v1' }), 'outcome')`. The genuine v2 manifest is relabelled as v1 and must refuse on replay. The classification row's clause names the new assertion, and the row's `atRed` and `firstMessageAtRed` stay as they are. Finding 1 gives the reason.

Everything else holds:
- r6 changes what 1353-F7 ruling 3 lists and what 1359-C6 declares, and nothing else.
- The route L helper keeps blob 09de4a54.
- C11, B1, the Wave 1 file, reference r4 and the classification all check out by reading.
- G6240 confirms the counts 7, 37 and 122.

**Scope.** I reviewed read-only on 2026-10-02 CDT, from 01:30 to 01:54, at HEAD bc2f6007 on `wip/headless-program-20260916-ts`. `git diff --stat b0809602 bc2f6007 -- src bridge ui/src tests` prints nothing.
- **Hashes.** The three staged files hash to b20f12f0…, 5385231f… and 66dc946d…. In the author's tree T, `git diff ad4aaa8 main` reproduces the r6 patch byte for byte, and `git diff main ref-r4 -- src` reproduces the reference r4 patch.
- **Scratch trees.** All sit under `/Users/zacheryspector/studio-scratch/1359-d5/`. I built them with `git archive bc2f6007 src tests ':!tests/fixtures'` and then applied the staged patches inside scratch:
  - `r5`, `r6`;
  - `ref3` (r5 plus reference r3);
  - `ref3on6` (r6 plus reference r3);
  - `ref4` (r6 plus reference r4).

  All 13 files that `ref4` touches equal T's `ref-r4` blobs. The scratch directory holds no symlink.
- **What I ran.** No node, vitest, tsc, tsx or vite-node. I did not touch the repo's index, worktree or stash. python3 only read files and printed. `py/g6240-d5.py` (sha256 0c4ddace…) read G6240 from E.

Notation: E is as in the brief.
- I :N is `tests/p15c2-campaign-legacy-integration.test.ts` at r6.
- p15c1 :N is `tests/p15c1-campaign-legacy.test.ts`; HEAD and r6 share its line numbers.
- H :N is `tests/helpers/p15c2-legacy.ts`.
- law :N and tuning :N are `src/core/campaignLegacy.ts` and `src/core/tuning.ts` at reference r4.
- r5 :N is a line of the r5 patch, and C6 :N is a line of the handback.

## What 1359-X5 must show

X5 is queued as staged. `1359-x5/x5.log.meta` waits on pid 74878, then runs r6 b20f12f0 and reference r4 66dc946d under Node v20.20.2.

**At the RED commit (HEAD plus r6):**
- 116 tests: 40 failed and 76 passed. Per file:
  - integration: 35 failed, 2 passed;
  - Wave R: 7 passed;
  - p15c1: 5 failed, 67 passed.
- `check-1359.py red` reports 0 mismatches and 0 unclassified leaves. Every failure's first line equals its `firstMessageAtRed`, the five p15c1 messages included.
- Both controls pass. This is route L's first run on slice A's src (1359-D4 note 4).
- The root type gate exits 0 with no output.

**At reference r4:**
- 113 passed and 3 failed. The failures are C2-C4, each on FIXTURE PENDING.
- C11, B1, the old-law leaf and the five moved p15c1 leaves pass, and `check-1359.py ref` reports 0 mismatches.
- The root type gate exits 2 with X2's 35 errors at X2's positions: `save.ts(10498,53)`, `historical-control.ts(33,3)` and the same 33 test sites. None falls in `campaignLegacy.ts`, `tuning.ts` or a RED file.
- The tree status is clean.

**After the required change.** The change edits one leaf after its first statement, so X5's other 115 rows carry over to the revision. The revised integration file must show the old-law leaf failing at RED with its current first message and passing at reference r4, with the totals unchanged.

## Findings

### 1. The old-law leaf never shows that the validator runs the v1 entry. Blocking.

- **What the leaf asserts:**
  - the v1 manifest validates under live v2 TUNING (I:1203-1204);
  - relabelled as v2, it refuses (I:1206);
  - under RETUNE, both stored manifests validate (I:1220-1221).
- **A wrong validator passes all three.** Take a validator that replays only the live era and accepts any other era after the structural checks. I:1204 and I:1221 accept the v1 manifest without a replay, and I:1206 refuses because the v2 replay runs.
- **No other leaf replays a manifest labelled v1.** `legacy-validate-replay` (I:1128-1173) tampers G6240F, which now carries v2. In r5 that leaf covered the live era, and the live era was v1. The retune moved that coverage to v2 and left v1's evaluator with only an accept path.
- **What the leaf proves today.** It proves acceptance under live v2 TUNING. It proves the frozen v1 entry's replay only for a validator that replays every era. C6:172-175 ("It cannot pass vacuously") and the leaf's own comment (I:1180-1181) both assume such a validator. 1359-F Amendment 1 requires the replay under "the evaluator that the manifest's `definitionVersion` names", and keeps v1 "reachable by the validator".
- **How the fix behaves at reference r4, by reading:**
  - The identity, stamp, bounds and refs checks pass, because the player's 12 qualifying refs are real player films released before B.
  - The v1 entry's replay (law :1362) reads the player's artistic voice as `notHeld` against the stored `held`. `firstDifference` (law :1370-1391) therefore stops at `official.studios[0].archetypes[0].outcome`.
  - A validator that never reaches the v1 entry accepts the state, and the leaf fails.

### 2. The diff from r5. Non-blocking; confirmed.

- In T, `git diff c0bc087 main` touches two files, +139/-77: p15c1 +16/-16 and the integration file +123/-61.
- The integration file's hunks are I:2, I:71-74, I:142, I:687, I:918-977, C11 (I:1089-1111) and the old-law leaf (I:1175-1226). C6:45-67 declares each one.
- The r6 patch's sections for `p15-roots.ts`, `p15c2-legacy.ts`, `p15c2-route-l.ts` and the Wave R file equal r5's byte for byte.
- `p15c2-route-l.ts` is blob 09de4a54998340488a1ff1a5e47132b02f0e00a3 in r5, r6 and ref4 (sha256 0a046fbe…).
- Sibling r2 (d703e29c…) applies to r6, and to r6 plus reference r4.

### 3. C11. Non-blocking; confirmed.

- **What it pins:**
  - I:1095: the table's key set is v1 and v2.
  - I:1097-1098: each entry equals `V1` and `V2` (I:940-961).
  - I:1100: the live id is v2.
  - I:1101-1105: the live exports.
  - I:1107-1108: TUNING's fifteen Legacy keys and values equal `V2`.
  - I:1110: the unknown-definition probe uses `campaign-legacy/v3`.
- `V2` holds 60, 20 and 49 plus v1's other twelve values. `V1` keeps r5's fifteen values (r5 :1736-1741).
- Reference r4's entries (law :868-927) equal those literals field by field, and tuning :1042-1056 equals `V2`.
- **Could a validator that reads live TUNING pass?** It would pass C11 alone, because C11 never runs the validator while TUNING differs from an entry. The old-law leaf fails it twice:
  - At I:1204, the v1 manifest replayed under live v2 TUNING gives 37 held against the stored 7 not held.
  - At I:1220, the v2 manifest replayed under RETUNE differs from the stored one; I:1218 proves the RETUNE build differs.

  Finding 1 covers the remaining case: a validator that never consults the v1 entry.

### 4. B1 and the sweep. Non-blocking; confirmed.

- I:687 expects `campaign-legacy/v2`.
- In r6's added lines, 70, 90, 25 and `campaign-legacy/v1` appear only in these places:
  - v1's frozen literals (I:943-944);
  - the table's key list (I:1095, I:1097);
  - the old-law leaf's v1 id (I:1189);
  - comments (I:1179, I:1192-1193);
  - the F1 leaf's authored film (I:1255), which is never a release;
  - the Wave R timings (90.4 s).
- No live pin remains, and sibling r2 carries none of these tokens.
- C6's sweep of r5 (C6:140-147) leaves out r5 :82 and :84 (the 90_000 budgets) and r5 :1745-1746 and :1831 (lookups of the v1 entry). None of these is a live pin.

### 5. The old-law construction. Non-blocking; confirmed apart from finding 1.

- **Lawful and equivalent.** A v1 tree's freeze runs `buildLegacyManifest(legacyFactsFromState(s, B), 'official2040')` under v1 TUNING, stamps it from `p15Sequence` and names it with its own constant. Each input is era-free on the v2 tree:
  - the adapter reads no threshold (law :989-1112);
  - the stamp reads no era (law :1130-1136);
  - the builder reads TUNING at call time (law :772-775, :846-850), which r5's RETUNE assertion already pins (I:1218).

  I:1188-1189 therefore produce the manifest a v1 tree would freeze for G6240F.
- **The `finally` restores every key on every path.**
  - `saved` is taken before the `try` (I:970), and the `finally` (I:974-975) restores every swapped key on return and on throw.
  - I:1185-1186 and I:1214 make each swapped key set equal TUNING's fifteen keys, so no restore writes `undefined`. I:1203 and I:1225 assert the restores.
  - Both swaps are synchronous. vitest isolates each file by default (vitest.config.ts, vitest.workspace.ts), and G6240F and its facts exist before either swap (I:1182, I:1187).
  - The cross-worker hazard named in `src/harness/d16/experiment.ts:19-20` does not arise.
- **Materiality, checked against G6240 with python.**
  - The file has 6,720,108 bytes and sha256 c9bfb142…, which is H:205-208's pin.
  - The player is row 0 of 10 entered studios and has 122 releases, the latest at week 6199.
  - 7 releases score critic 70 or above (the 8th is 69.994). 37 score 60 or above (the 38th is 59.706).
  - Under v1: 100 × 7 = 700 < 25 × 122 = 3,050, not held. Under v2: 100 × 37 = 3,700 ≥ 20 × 122 = 2,440, held.
  - Every rival reads 0 acclaimed and 0 hits in both eras. The player reads 0 hits of 122 settled releases in both. Only the player's artistic-voice result differs between eras.
  - The converters from V38 to V44 copy `studio.releasedFilms` through a JSON round trip only (HEAD `save.ts:10509-10685`; reference `save.ts:10813-10819`).
- **The relabel token is stable.**
  - `firstDifference` (law :1370-1391) walks the replay's keys in emission order.
  - The player is `studios[0]` (law :1047-1049), and artistic voice is `archetypes[0]` (law :796).
  - `archetypeResult` emits `archetypeId`, `outcome`, `limitedBy`, `qualifyingCount` in that order (law :591-595).
  - On G6240 the first difference is therefore `official.studios[0].archetypes[0].outcome`, and law :1366 names it in the refusal.
  - A walk in sorted key order also stops at `outcome`, because `contrary`, `contraryCount` and `limitedBy` match across eras.
  - The token misses only if a production emits `qualifying` or `qualifyingCount` before `outcome`. I:1143 already requires the name `outcome` when only the outcome is tampered.
  - Optional hardening: use `/outcome|qualifying/`, as I:1161 does.
- **The unbumped-retune check.** I:1208-1224 keeps r5's check with all fifteen values moved, asserts that the live build differs, and adds the v1 manifest to the stored manifests that must still validate. I:1223 alone shows only that the live entry's thresholds do not track TUNING; the pin that fails an unbumped retune of the shipped values is C11's I:1107-1108. Together the two meet F7's bullet.

### 6. The Wave 1 file. Non-blocking; confirmed.

- **The 16 changed lines:**
  - :1 is the title;
  - :311-312 now cite 1353-T and 1353-F6;
  - :313, :317 and :318 read 60, 20 and 49;
  - :336 reads v2;
  - :382, :581, :629-630, :643 and :878 restate the v2 arithmetic;
  - :1894, :1898 and :1899 read 60, 20 and 49.

  :582 and :642 carry no v1 number, so they stay unchanged.
- **Each fixture stays on its side of 60, 49 and 20.**
  - Critic literals: 10, 20, 50 (the default), 70 (:393-394), 90 and 99. The 70 fixture sits exactly on v1's line at RED and counts there, because the law compares with ≥.
  - Grosses: 0, 500, 50,000 (5%), 123,456 (an in-run refusal), 540,000 and BMV. `((49 + 5) / 100) × 1,000,000` evaluates to exactly 540,000.0 in doubles, which is a hit at 49 and none at 90.
  - Shares: S-EXACT holds 5 of 25, exactly on 20; S-BELOW holds 5 of 26, just under it.
- **The five failures at RED**, traced against HEAD's law (`campaignLegacy.ts:585-624`, TUNING 70/25/90):
  - :334-337 fails at :336 with `expected 'campaign-legacy/v1' to be 'campaign-legacy/v2'`.
  - :580-600 fails at :599, because 100 × 540,000 < 90 × 1,000,000 leaves CE-N without a hit. :598 passes first.
  - :627-652 fails at :650, because 500 < 25 × 25.
  - :942-1007 fails at :975 on `ALLSTAR1/commercial-engine`. The checks at :951-953 and the voice and audience checks pass first.
  - :1892-1920 fails at :1894 with `expected 70 to be 60`.

  Each message has the format the recorded runs show: E/1353-p15c1-red-recorded.txt:233, and E/1325-r1-broad-core.txt:15313 for the labelled form.
- **No other p15c1 leaf fails at RED.**
  - The restated constants appear only at :393-394, :591, :644 and :888. The leaves that read them are the five above and the seven passing rows at :379, :1035, :1059, :1134, :1153, :1546 and :1756.
  - Eight leaves have outcomes that read live TUNING: :430, :506, :837, :1009, :1098, :1199, :1259 and :1927. Their fixtures use critic 90, 20, 10 or 50 and grosses of 500 or 5%, so they pass in both eras.

### 7. Reference r4. Non-blocking; confirmed.

- **tuning.ts.** tuning :1036-1037, :1042, :1046, :1047 and :1048 are 1353-T §7.1's six lines.
  - :1047 reads 49 with 1353-F6 ruling 1's measure.
  - :1037 cites 1353-T and 1353-F6, as F7 ruling 7 asks.
- **The law's name and type.**
  - law :1 names v2, and law :77 sets `CAMPAIGN_LEGACY_DEFINITION = 'campaign-legacy/v2'`.
  - law :102 defines `LegacyDefinitionId`, and law :199 types `definition` with it.
  - law :924 types the table as `Record<LegacyDefinitionId, LegacyDefinition>`, so a missing key fails to compile.
- **The frozen entries.**
  - law :878-884 sets `V2_THRESHOLDS` beside the unchanged `V1_THRESHOLDS` (:868-874).
  - `frozenDefinition` (law :915-921) closes over each entry's own id, boundary, mode and thresholds.
  - `evaluateLegacyManifest` checks `era.boundaryWeek` (:783) and stamps `definition` and `era.postFinaleMode` (:808-815). This fixes 1353-U finding 8.
- **Every non-pending leaf passes by reading.** Beyond findings 3, 5 and 6:
  - The leaves that tamper G6240F choose their refs and archetypes generically (I:163-189, I:1131-1137), and they refuse the same way under v2.
  - Every ref v1 cites stays in v2's top twelve, because the higher critic score or gross sorts first. So `findRef` (I:1075) still finds a ref in a grown domain on route L.
- **The root type gate.**
  - No X2 error site's file changed between 85764cd5 and HEAD; `git diff --stat` prints nothing for those files.
  - The reference's `save.ts` is the same in r3 and r4.
  - Slice A's four changed test files add no version-typed call.
  - The r4 types satisfy `LegacyDefinition` by reading.
  - r6's new test code compiles at HEAD: `noUncheckedIndexedAccess` is off in tsconfig.json, and vitest 2.1.9 types `toBe` as generic (`toBe: <E>(expected: E) => void`).

### 8. The classification. Non-blocking; confirmed.

- **Rows.** 116 rows: r5's 44 in r5's order, then Wave 1's 72 in file order.
  - `atRed`: 76 pass, 37 fail, 3 FIXTURE PENDING.
  - `atReferenceR4`: 113 pass, 3 pending.
- **Spans.** Every `lines` span matches its leaf: the 109 single-line `it(` leaves and the 7 multi-line Wave R guards.
- **Agreement with X2.**
  - The 44 r5 rows match X2's `x2-red.json` by name, status and first line, with 0 mismatches.
  - Only three `charterClause` values differ from r5. No `expectedFailureToday`, `control`, `fixturePending` or `budget` value changes.
  - X2's reference run passed all 72 p15c1 leaves.
- **Reading-only rows.** The 15 are B1, C11, the old-law leaf, the five failing p15c1 leaves and the seven passing rows listed in finding 6. The list is complete.

### 9. The deviation. Non-blocking.

- `tsc --version` prints the version and exits. It reads no tsconfig and emits nothing.
- The repo root holds no `*.tsbuildinfo`, and HEAD still reads bc2f6007.
- No part of r6, reference r4 or the recorded run's sources depends on the slip. Its only cost was a sub-second process alongside the recorded run.
- Record nit: C6:285 dates the slip "before 01:10 CDT", but `PROGRESS.txt:88` logs it, untimed, after the 01:10 entry.

### 10. Notes. Non-blocking.

- law :91 and :288 still call the domain set and the awards refusal "v1". Both statements hold in both eras, and production can word them that way.
- p15c1 :50-59 and :70-72 still say the module and the TUNING keys "do not exist yet". That text predates r6 and lies outside 1353-F6 ruling 3's list.
- X5 measures at bc2f6007, a Save43 base. 1353-F7's order puts the mint and the recorded RED after slice B's Save44, so the parent repeats the declaration check on that base; I:151 pins the base's live version as 43.
