# 1358-N G1 handback: relationship shapes

The G1 author wrote this on 2026-10-02 (03:57 CDT by `date`) and amended it at 04:12 CDT after the parent's rulings.

## Identity

- **Worktree.** `/Users/zacheryspector/studio-scratch/1358-sweep/g1`, branch `sweep-g1`, base tag `step4` (8e02a44). HEAD is a073a61 after 12 commits titled "1358-N G1: ...". The worktree is clean.
- **Patch.** `patch.diff` is `git -C g1 diff step4 -- tests ui`: 46,845 bytes, sha256 `9b4104a6f04852bb0e8230764c22e45fcfd6b3c80f57aa9477aefd244fe77642`, 13 files, +113/-68.
  - All 13 files are on the G1 list. No ui file changed.
  - `git diff --stat step4 -- . ':!tests' ':!ui/src'` prints nothing.
  - `git apply --check --cached` passes on `step4` under a temporary index.
  - The 13 base blobs at `step4` equal the repo's at HEAD b17e8ac2 and at 5245072a.
- **Classification.** `classification.json` holds 83 objects for 75 census ids:
  - 73 census rows edited, N-0122 with two objects;
  - 2 census rows resolved by an edit on another line (N-0093, N-0094; `old` equals `new`);
  - 7 supporting objects filed under the census row they serve: four type imports, two `OUTGOING_56` constants and the typed member `convertV43ToV44`.
  - Two objects carry status `read`, both N-0122: the live chain at :223 and the staged V42 copy at :186.
- **Deferred.** `deferred.json` holds 10 entries: the 9 census measure rows and one new S9 site (G1-new-1).

## Counts by class (census rows)

| Class | Rows | Edited | Resolved elsewhere | Deferred |
|---|---:|---:|---:|---:|
| S1 | 27 | 27 | 0 | 0 |
| S2 | 13 | 13 | 0 | 0 |
| S3 | 1 | 1 | 0 | 0 |
| S4 | 2 | 2 | 0 | 0 |
| S5 | 3 | 2 | 0 | 1 (N-0140) |
| S6 | 15 | 13 | 2 (N-0093, N-0094) | 0 |
| S7 | 1 | 1 | 0 | 0 |
| S8 | 1 | 0 | 0 | 1 (N-0096) |
| S9 | 5 | 1 (N-0122, read, both halves) | 0 | 4 (N-0101, N-0102, N-0103, N-0105) |
| S10 | 3 | 0 | 0 | 3 (N-0070, N-0071, N-0092) |
| P1 | 2 | 2 | 0 | 0 |
| P2 | 5 | 5 | 0 | 0 |
| P3 | 1 | 1 | 0 | 0 |
| P5 | 5 | 5 | 0 | 0 |
| **Total** | **84** | **73** | **2** | **9 + 1** |

New rows: G1-new-1 (S9). The parent ruled it a closure finding with no edit; its deferred.json entry stays as written. No new edit rows.

## The first move

`tests/p14b5-relationships.test.ts` takes the fix at the type (1358-J sweep item 2; 1358-F7 ruling 1):

- the local `Edge` (now :93-101) gains `competitions: RelationshipEdge['competitions']` and `romance: RelationshipEdge['romance']`, with `RelationshipEdge` added to the type import at :78;
- `mintedEdge` (:227) and `stagedEdge` (:235) write `competitions: []` and `romance: null` after `recent`, in `newEdge`'s key order (`src/core/relationships.ts:300-316`). `stagedEdge` writes them before `...extra`.

The same shape went into the local `Edge` types and staged literals of `bridge-p14b5-relationships`, `bridge-p14b6-d2-withheld-employment-claim` and `bridge-p14b6-relationship-read-models`. It also went into the `p14b10-conflict-evidence` `stagedEdge` and the `p14p4p5-post-capacity` whole-edge oracle.

## The 27 failures of 1358-X5 step 4

Lines in the first column are X5's (step 4); lines in the last column are this patch's post-image.

| # | X5 leaf | X5 message | Cleared by |
|---|---|---|---|
| 1 | family 1, six minted edges (:583) | 16 keys against 14 | N-0090 `mintedEdge` :227, typed by N-0089 :100 |
| 2-6 | family 6: off-cycle (:959), drifted (:979), closed at W (:990), committed at W (:997), enemies here (:1024) | `validateSaveV44: state.relationships[24].competitions is missing` at `stage()` | N-0091 `stagedEdge` :235 |
| 7-8 | family 6b: both present (:1084), enemy only (:1100) | same | N-0091 |
| 9-10 | D5 reason sentence: branch 2 over 1 (:1208), branch 1 over 0 (:1227) | same | N-0091 |
| 11 | family 8, pairChemistry (:1267) | `validateSaveV44: state.relationships[6].competitions is missing` | N-0091 |
| 12 | family 10, round trip (:1311) | `validateSaveV43: expected version 43` | N-0098 :1315 |
| 13 | family 10, missing root (:1317) | expected /relationships/, got the version refusal | N-0099 :1321; the era-44 root check refuses with `validateSaveV44: state.relationships is not an array` (`relationships.ts:673`) |
| 14-26 | family 10, the 13 `expectRefused` leaves (:1319-1346) | expected each pattern, got the version refusal at :1297 | N-0095 :1299 and N-0097 :1305 (era 44). Reading predicts every pattern matches its field's guard; N-0096 lists them and stays deferred to the dry run |
| 27 | family 10, one-edge downgrade (:1359) | `validateSaveV43: expected version 43` | N-0100 :1364 and N-0104 :1444. Reading predicts the four S9 expectations hold unchanged (N-0101, N-0102, N-0103, N-0105, deferred to the dry run) |

1 + 5 + 2 + 2 + 1 + 1 + 1 + 13 + 1 = 27. The three retained 1344-F6 row 6 leaves (family 2 at :656 and :666, family 5 rival release at :874; X5's :654, :664, :872) still stop at the `rivalWorld` premise (:399, X5's :397) and have no edit. The family 2 minted oracle (:662, N-0094) sits behind that premise.

**Type gate in G1 files.** X5's 24 strict-Pick TS2345 errors in `p14b5-relationships` all report `romance` missing from the local `Edge`, and N-0089 adds it. The 2 in `p14b5-t-failure-tuning` (:295, :373) clear with `romance: null` in the Pick literals (N-0109, N-0110). `romance: null` changes nothing at runtime there: `romanceEndWeek(null)` is null, so `currentCloseness` reads as before. The TS2322 at `p14b10-conflict-evidence:108` clears because the literal itself now writes both fields (N-0087). The root config has `exactOptionalPropertyTypes`; the spread of `Partial<RelationshipEdge>` over a left side that holds both fields keeps them required.

## 1358-F9 ruling 3 at `p14b9-save-v42` (the leaf at :169)

- **Lift (N-0118).** `convertV43ToV44(convertV42ToV43(v42))` at :192, with `convertV43ToV44` and `convertV44ToV43` added to the `mods` type (:175, :177).
- **Live chain (N-0121, N-0122, status read).** :223 now reads `convertV42ToV41(convertV43ToV42(convertV44ToV43(newSave)))` and pins `/^migrateToV43: cannot downgrade or discard the competitions log of relationship-edge-24$/`.
  - The guard that throws first is `src/core/save.ts:10789` in `convertV44ToV43`.
  - The greenlight appends one log row with each new slate-pair edge (`src/core/relationships.ts:537`).
  - The acknowledged fixture holds 24 edges, all rival-internal (`person-studio-c64d15fd-r01..r04`); none touches t-act-08, t-act-20 or t-act-24. So the three slate pairs become edges 24-26, and edge 24 is the first with a log row.
  - A comment (:216-222) records the masking and points to the staged V42 pin. The dry run checks the pin.
- **Staged V42 assertion (N-0122, status read; parent ruling, option (a)).** :182-186 stage `sharedCompetitions: 1` on edge 0 of a spread copy of `v42` and pin `/^migrateToV41: cannot downgrade or discard a casting competition$/`.
  - The guard that throws first is `src/core/relationships.ts:849`, the throw in `assertRelationshipsAtV31` (:847-849), called at `src/core/save.ts:10696` in `convertV42ToV41`.
  - `validateSaveV42` admits the copy. Era 42 asks only that the counter be a non-negative integer (`relationships.ts:734`), and `relationshipsAtV31` (:834-837) drops it before the frozen V41 chain runs.
  - The comment says the counter is staged because no pre-Save44 engine remains to write it, and cites 1358-F9 ruling 3 and 1358-F10. Nothing is stripped, and `v42` reaches the lift unchanged.
- **Finding 16 on this fixture.** No contested pair holds an edge, so the greenlight never reaches `relationships.ts:548` here. Without the lift, the leaf would fail at `makeSave` on the 24 V43-shaped edges instead.

## Parent rulings received

1. **N-0122:** option (a), committed as a073a61 (above).
2. **`bridge-p14b6-e714-false-empty-absence-lines` :82:** no edit. The plan's "every local `Edge` type" covers types that build or compare edges.
3. **G1-new-1 (`p14c2s-scientist-retirement` :279-280):** no edit; a closure finding.
4. **N-0101, N-0102, N-0103:** they stay with the dry run.

No item awaits a parent ruling.

## Census rows found wrong or imprecise

- **N-0118 (why).** The census cites the TypeError at `relationships.ts:548` "for a contested pair with an existing edge". This fixture has no such pair (read above). The edit stands: without it `makeSave` refuses the 24 lifted edges with `validateSaveV44: ... competitions is missing`.
- **N-0101, N-0102, N-0103 (edit).** The rows say "after the S4 insert, pin the measured first guard". No S4 insert applies here: these leaves call the production `migrateToV30`, `V29`-`V26` and `V25`, which carry their own V44 branches (`save.ts:9242`, :9176, :9064, :8964, :8796, :8618). By reading, `admitted`'s one edge (takeWorld's `relationship-edge-0`, minted by `newEdge` at week 61) holds an empty log and null romance. `convertV44ToV43` therefore passes it, and `save.ts:10744` refuses with the expected rejection-count message. M2 cannot decide these: its tree stops the leaf at :1359 with "expected version 43". The dry run decides.
- **N-0063 (edit).** The strict-Pick reason does not apply in `bridge-p14b5-relationships`: its `currentTier` is typed `(edge: unknown, week: number) => string`. The type change still makes the staged literal at :498 carry both fields.
- **N-0094 (why).** The minted oracle at :662 cannot change status: its leaf is a retained 1344-F6 row 6 failure that stops at :399 (X5's :397) first.
- **Line anchors.** N-0069, N-0075, N-0082 and N-0146 name the counters line of a literal; the fields land on the `recent` line (:498, :97, :293, :350). N-0117's census line :176 is the member the new one sits beside (:177).

## Renamed titles (P5)

Each rename is a new test identity. None is a retained 1348-I identity: the retained identities in G1 files are the five `bridge-p14b5-relationships` family 12 leaves and the three `p14b5-relationships` row 6 leaves.

| File > describe | Old title | New title |
|---|---|---|
| `tests/p14b9-save-v42.test.ts` > `LIVE_SAVE_VERSION and the dispatcher message` | `LIVE_SAVE_VERSION is 43` | `LIVE_SAVE_VERSION is 44` |
| `tests/p14b9-save-v42.test.ts` > `LIVE_SAVE_VERSION and the dispatcher message` | `validateSave names the new ceiling in its unknown-version message ("1 through 43")` | `validateSave names the new ceiling in its unknown-version message ("1 through 44")` |
| `tests/p14d1-rival-shelving-save-v43.test.ts` > `API decisions this file exercises (existence asserted first)` | `validateSaveV43 / convertV42ToV43 / convertV43ToV42 exist as functions; LIVE_SAVE_VERSION is 43` | `validateSaveV43 / convertV42ToV43 / convertV43ToV42 exist as functions; LIVE_SAVE_VERSION is 44` |
| `tests/p14d1-rival-shelving-save-v43.test.ts` > `save-v43-shelving (1344-A §4, §6.9): V42 -> V43 migration` | `migrateToLive carries a genuine V42 save to V43 (LIVE_SAVE_VERSION)` | `migrateToLive carries a genuine V42 save to V44 (LIVE_SAVE_VERSION)` |
| `tests/p14d1-rival-shelving.test.ts` > `API decisions this file exercises (asserted to exist first, per PITFALL)` | `save.ts LIVE_SAVE_VERSION is 43, and validateSaveV43/convertV42ToV43/convertV43ToV42 exist` | `save.ts LIVE_SAVE_VERSION is 44, and validateSaveV43/convertV42ToV43/convertV43ToV42 exist` |

Stale titles that earlier sweeps left stay as written: `bridge-p14b5-relationships:378`, `bridge-p14b6-relationship-read-models:780` and :790, `p14c1-materialized-aging:1032`, and the leaf title at `p14b9-save-v42:169`, which still says `validateSaveV42` admits the greenlit result.

## Examined sites with no edit (beyond `noEditInFiles`)

- **`p14c2s-scientist-retirement:256-268`.** `migrateToV37(live)` and the lift back run on `scientistWorld()`, a genuine V33 capture lifted with no tick. Every log is empty and every romance null, so `convertV44ToV43` passes and the chain succeeds.
- **`p14b5-relationships:1129`.** Family 6c's `SliceBEdge` intersects `Edge` with its own `competitions` and `romance`. That is now redundant but still type-checks, and X5 shows both 6c leaves passing. It stays as the RED wrote it.
- **Edge-spreading sites.** `p14b5-relationships:759` and :826, `bridge-p14b6-relationship-read-models:370` and :593, and `p14p4p5-post-capacity:531` spread engine edges, so the fields come along.
- **`p14c1-materialized-aging:448`.** Family 5 feeds a ticked live state to `convertV33ToV32`. That refusal fires on the age boundary before any edge-key check, as it did with Save42's `sharedCompetitions`.
- **Stale comments.** The `save.ts` line citations in the `p14b5-relationships` 1344 S9 comments (starting at :1389, :1411, :1429 and :1449) stay as written (1358-N out of scope).

## Dependencies on other groups

- **H's `tests/helpers/p14b2-fixtures.ts` S1 rows** (N-0002 to N-0004: `validateSaveV43` at :122, :244 and :259). These leaves depend on them:
  - `bridge-p14b6-relationship-read-models` (W1, W2);
  - `bridge-p14b6-e714-false-empty-absence-lines` (W1);
  - the `bridge-p14b5-relationships` poachingFixture leaf.

  x1 runs after H and G1 both land.

## Process disclosures

- **No runs.** No node, vitest, tsc, tsx, vite-node or npm process ran.
- **Repo reads.** I used read-only git on the repo (`log -p`, `show`, `blame`, `rev-parse`) and touched no index, worktree, branch or stash there.
- **One fixture read.** `tests/fixtures/p14/genuine-v41-pre-casting-drivers/genuine-v41-casting-acknowledged.json.gz`, read with python3 gzip for N-0122 to settle which edge carries the first log row.
  - The gzip and decoded sha256 matched the test's pins (`3e9da830...`, `6fc0e076...`).
  - I printed only the save version, tick, edge count, the ordinal check and the people prefixes.
- **Temporary files.**
  - One grep redirect wrote `/tmp/claude-g1-added.txt`, and one wrote `added.txt` in the session scratchpad. Both sat outside `out/g1`, against the brief. I deleted the first in the same command and the second in the next one.
  - Each apply check used `out/g1/tmp.index`, which I deleted after it.
- **Edit tools.** I edited my worktree's test files with the editor, with python3 string replacements that assert each match count, and with one `sed -i` on a comment in `bridge-p14b5-relationships`. The N-0122 amendment used the editor for the test and python3 for the two JSON files. A python3 check finds each object's `new` text in the post-image ending at its `line`. N-0132 is the one exception: its `line` (305) names the `competitions` delete inside its block (:300-307).
- **Hygiene.** No added line holds an em dash or the literal `Math.random`.
