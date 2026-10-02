# 1359-C6 handback: P15C Wave 2 RED r6 and reference r4 (answers 1353-F7 rulings 3-4 and 1353-F6 ruling 3)

**Status: staged in scratch, not run.** I wrote RED r6 (tests only), its classification and reference r4 (`src` only)
on 2026-10-02 (CDT): the edits started at 01:10 and this handback at 01:25. I ran no vitest, node, tsx or vite-node,
and no compile; one slip is recorded under "Deviation". Every expected outcome below rests on reading, except where a
row cites 1359-X2.

Notation. E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919`. T is the scratch tree
`/Users/zacheryspector/studio-scratch/1359-red/tree`. "r5 :N" is a line of `E/1359-stage/1359-p15c-wave2-red-r5.patch`;
"p15c1 :N" is `tests/p15c1-campaign-legacy.test.ts` (HEAD and r6 share its line numbers); "I :N" is
`tests/p15c2-campaign-legacy-integration.test.ts` at r6; "law :N" is `src/core/campaignLegacy.ts` at reference r4.

## Files and branches

| Item | Where |
|---|---|
| RED r6 patch | `1359-p15c-wave2-red-r6.patch`: `git diff ad4aaa8 main` in T, 6 files under `tests/` |
| Classification | `1359-p15c-wave2-red-r6-classification.json`: 116 rows |
| Reference r4 patch | `1359-p15c-wave2-reference-r4.patch`: `git diff main ref-r4 -- src`, 7 files, applies on r6 |
| Sibling | unchanged: `1359-p15c-wave2-sibling-r2.patch` applies to r6 as it stands, so no r3 exists |
| T `main` | 8fa01ae (RED r6): r5 c0bc087 plus one commit |
| T `ref-r4` | 2a9c5f5 (reference r4): 4f7ec0d and 6255fb1 cherry-pick reference r3 onto r6, then one r4 commit |
| T `sibling-1359-on-r6` | 35b0190: sibling r2 rebased onto r6 |

T's base ad4aaa8 still matches HEAD bc2f6007 for every file the patches touch: the blobs of
`tests/p15c-wave-r-retention.test.ts`, `tests/p15c1-campaign-legacy.test.ts` and `src/core/{campaignLegacy,save,tick,types,worldgen,tuning}.ts`
are equal, and the new files exist at neither. So I continued in T.

## Diff summary from r5

### `tests/p15c1-campaign-legacy.test.ts` (16 lines replaced in place, +16/-16)

No line moves, so HEAD's line numbers hold at r6.
- :1, the title: the law is `campaign-legacy/v2`; the record adds "v2 values: 1359-C6".
- :311-312, the restatement comment: it cites 1353-T and 1353-F6 with critic 60, hit line 49 and share floor 20.
- :313, :317, :318, the restated values: 60, 20 and 49.
- :336, the definition pin: `'campaign-legacy/v2'`.
- :382, comment: "critic 70 >= LEGACY_CRITIC_ACCLAIM_MIN=60".
- :581, comment: "54% BMV" (:582 needs no change).
- :629-630, comments: n = 25 and 26 against 20 × 25 = 500 and 20 × 26 = 520.
- :643, comment: "100*5/20 = 25" (:642 needs no change).
- :878, comment: "hits (54% BMV, settled)".
- :1894, :1898, :1899, the TUNING pins: 60, 20 and 49.

### `tests/p15c2-campaign-legacy-integration.test.ts` (+123/-61)

- I :2, the header names r6 (1359-C6 under 1353-F7).
- I :71-74, a new ERAS paragraph: the live law is v2, `LEGACY_DEFINITIONS` keeps v1 frozen beside it, and C11 and
  the old-law leaf test both eras.
- I :142, the helper import gains `type DefinitionEntry`.
- I :687 (r5 :1374), B1: the frozen manifest's definition reads `'campaign-legacy/v2'`.
- I :918-977, new module-scope literals and two local helpers:
  - `ERA_SHAPE` (I :922-937): boundary, mode, ids, bounds and count keys, which 1353-T leaves the same in both eras;
  - `V1` (I :940-949): the fifteen v1 values of r5 :1736-1741, unchanged;
  - `V2` (I :952-961): the fifteen v2 values, 60 / 20 / 49 and the twelve unchanged;
  - `fieldsOf` (I :963-966): an entry's literal fields, without its evaluator;
  - `underThresholds` (I :968-977): sets TUNING's Legacy values for one call and restores each in `finally`.
- I :1089-1111, C11 `legacy-definition-era-guard` (r5 :1715-1765):
  - the first statement stays `definitionsTable()`;
  - :1095 pins the table's key set to v1 and v2;
  - :1097-1098 pin each frozen entry to `V1` and `V2`;
  - :1100 pins the live definition to v2;
  - :1101-1106 pin the live exports to v2's shape;
  - :1107-1108 pin TUNING's Legacy keys and values to `V2`;
  - :1110 probes `'campaign-legacy/v3'`, an id outside the table.
- I :1175-1226, the old-law leaf `legacy-old-law-fixture-v1-validates-after-retune` (r5 :1829-1856), rewritten (see
  "The v1-manifest construction" below). Its first statement stays `genuineFrozen()`.

### Unchanged from r5

`tests/helpers/p15-roots.ts`, `tests/helpers/p15c2-legacy.ts`, `tests/helpers/p15c2-route-l.ts` and
`tests/p15c-wave-r-retention.test.ts`. Their sections of the r6 patch equal r5's byte for byte. `tests/helpers/p15c2-route-l.ts`
keeps blob 09de4a54998340488a1ff1a5e47132b02f0e00a3 (sha256 0a046fbe…), the file producer r4 and 1359-X3 describe.

### Reference r3 to r4 (`git diff 6255fb1 2a9c5f5`, `src` only)

`src/core/tuning.ts` (+6/-6), 1353-T §7.1 with 1353-F6's 49:
- :1036 names `campaign-legacy/v2`; :1037 reads "adopted in 1353-F, amended by 1353-T and 1353-F6" (F7 ruling 7);
- :1042 `LEGACY_CRITIC_ACCLAIM_MIN: 60`, critic band "hit" floor (1353-T);
- :1046 `LEGACY_MIN_SHARE_PERCENT: 20`, one release in five (1353-T);
- :1047 `LEGACY_HIT_REACH_PERCENT: 49`, with F6 ruling 1's measure: 18.1% of seed-b's rival releases as run, 15.2%
  under shared-market pressure (1353-T; 1353-F6);
- :1048 `LEGACY_FLOP_REACH_PERCENT: 30`, with 1353-T's new reason (the rival pool's lower quartile).

`src/core/campaignLegacy.ts` (+70/-42):
- law :1 names v2; law :76-77 carries a one-line doc and `CAMPAIGN_LEGACY_DEFINITION = 'campaign-legacy/v2'`.
- law :101-102 adds `LegacyDefinitionId = 'campaign-legacy/v1' | 'campaign-legacy/v2'`. law :199 (HEAD :192) types
  `definition` with it. law :924 types the table `Readonly<Record<LegacyDefinitionId, LegacyDefinition>>`, so the type
  and the table's keys cannot drift apart.
- law :360: the F1 comment no longer says the definition stays v1.
- law :772-775: `buildLegacyManifest` passes the live id, boundary, mode and TUNING.
- law :777-812: `evaluateLegacyManifest(facts, kind, definition, era)` checks an official manifest against
  `era.boundaryWeek` and stamps `definition` and `era.postFinaleMode`. Before, it stamped the live constants (1353-U
  finding 8).
- law :836: a comment names the fifteen thresholds as every era's.
- law :855: `LegacyDefinition.postFinaleMode` narrows to `typeof LEGACY_POST_FINALE_MODE`, the manifest's own type.
- law :876-927:
  - `V2_THRESHOLDS` sits beside the unchanged `V1_THRESHOLDS`;
  - `LEGACY_ERA_STRUCTURE` holds the shared literal structure (the mode as a literal);
  - `frozenDefinition(id, thresholds)` builds a frozen entry whose `evaluate` passes that entry's own id, boundary,
    mode and thresholds;
  - `LEGACY_DEFINITIONS` holds both entries.
- law :1212: the validator's domain message reads "a domain of its definition" in place of "a v1 domain".

## Moved values and pins, old and new

| Where (r6) | Old (r5, or HEAD for p15c1) | New |
|---|---|---|
| p15c1 :1 | `campaign-legacy/v1` | `campaign-legacy/v2` |
| p15c1 :311-312 | "§5.5 TUNING values … none exists yet" | cites 1353-T and 1353-F6, 60 / 49 / 20 |
| p15c1 :313 `LEGACY_CRITIC_ACCLAIM_MIN` | 70 | 60 |
| p15c1 :317 `LEGACY_MIN_SHARE_PERCENT` | 25 | 20 |
| p15c1 :318 `LEGACY_HIT_REACH_PERCENT` | 90 | 49 |
| p15c1 :336 definition pin | `'campaign-legacy/v1'` | `'campaign-legacy/v2'` |
| p15c1 :393-394 fixture critic, `ACCLAIM + 10` | 80 | 70 |
| p15c1 :591 and :888 fixture gross, `(HIT + 5)%` of `BMV` | 950,000 (95%) | 540,000 (54%) |
| p15c1 :644 `nExact` | 20 | 25 |
| p15c1 :1894 / :1898 / :1899 | 70 / 25 / 90 | 60 / 20 / 49 |
| p15c1 comments :382, :581, :629-630, :643, :878 | v1 arithmetic | v2 arithmetic |
| I :687, B1 (r5 :1374) | `'campaign-legacy/v1'` | `'campaign-legacy/v2'` |
| I :1100, C11 live pin (r5 :1754) | `'campaign-legacy/v1'` | `'campaign-legacy/v2'` |
| I :1107-1108, C11 TUNING table (r5 :1760-1762) | `V1.thresholds` | `V2.thresholds` |
| I :1097, the frozen v1 entry (r5 :1745-1751) | v1's fifteen literals | the same fifteen literals |
| I :1095, :1098 | none | the table's key set; the frozen v2 entry |
| I :1110, unknown-definition probe (r5 :1764) | `'campaign-legacy/v2'` | `'campaign-legacy/v3'` |
| `tuning.ts` :1042 / :1046 / :1047 | 70 / 25 / 90 | 60 / 20 / 49 |
| law :76-77 | `'campaign-legacy/v1'` | `'campaign-legacy/v2'` |

**Fixtures stay on their side (1353-F6 ruling 3).** By reading:
- Critic fixtures are 10, 20, 50, 70 (`ACCLAIM + 10`), 80 (an authored film, never a release), 90 and 99. Only 70 sits
  on a line: v1's, where it counts because the law compares with ≥.
- Gross fixtures are 0, 500, 123,456 (an in-run refusal), 50,000 (5%), 540,000 (54%) and `BMV`. 54% is a hit at 49 and
  none at 90; 5% is a flop in both eras.
- Share fixtures: S-EXACT holds 5 of 25 and S-BELOW 5 of 26, exactly on and just under 20.
- The p15c1 leaves that assert artistic-voice or commercial-engine outcomes keep them in both eras, except the four
  declared below.

## The sweep of r5 (1353-F7 ruling 3, B1)

I searched the r5 patch and sibling r2 for `campaign-legacy/` and for 70, 90 and 25 as whole numbers:
- r5 :1374, :1754 and :1764 are the live pins, moved above.
- r5 :1624 (`campaign-legacy/v0`, C7) is outside the table and stays.
- r5 :1737-1738 are v1's frozen literals, which stay.
- r5 :1838-1839 are r5's arbitrary RETUNE values, kept as they were.
- r5 :1885 is the F1 leaf's authored film (critic 80, audience 70), which never counts as a release.
- r5 :509, :511, :524 and :538 are Wave R timings (90.4 s).
- Sibling r2 has none of these tokens.

## The v1-manifest construction and why it is lawful

**Route: a scoped TUNING swap, not the entry's `evaluate`.** The leaf (I :1175-1226) works in this order:
1. It builds G6240F as before (`genuineFrozen()`, the live step under v2) and takes its adapter facts.
2. It runs Wave 1's own builder, `buildLegacyManifest(facts, 'official2040')`, once inside `underThresholds(V1.thresholds, …)`.
   That sets TUNING's fifteen Legacy values to v1's literals and restores each one in `finally`.
3. It keeps G6240F's stamp (sequence, id, phase triple) and writes the id `campaign-legacy/v1`.
4. Materiality: the player released 122 films before B (catalog `releases`, asserted). 7 score at least critic 70, and
   100 × 7 = 700 < 25 × 122 = 3,050, so v1 holds no artistic voice. G6240F's own v2 manifest reads 37, held:
   100 × 37 = 3,700 ≥ 20 × 122 = 2,440. Both pairs are asserted, `[7, 'notHeld']` and `[37, 'held']`.
5. It asserts that live TUNING equals `V2`. Then `makeSave` accepts the v1 manifest.
6. Relabelled `campaign-legacy/v2`, the same manifest refuses with a message that names `outcome`.
7. It keeps r5's unbumped retune: every value moved, no bump. The live builder now differs from G6240F, both stored
   manifests (v2 and v1) still validate, the live entry's thresholds differ from TUNING, and every value is restored.

**Why it is lawful.**
- It is the manifest a v1 tree freezes for this campaign. A v1 tree ran the same builder under v1's fifteen values,
  which Wave 1 landed and the frozen v1 entry pins as literals (C11). Its constant was `campaign-legacy/v1`. The v2
  tree's builder differs only in those values and that id. The leaf restores the values for the one call and writes the id.
- The stamp is era-free. The law never sees it (1359-A §5), so G6240F's allocator state and phase triple stay consistent.
- The swap is scoped. It covers one builder call. `finally` restores every value, and the leaf asserts the restore, as
  r5 did. Memoized fixtures exist before the swap, and no other leaf runs during it.
- The full validator judges it before any later assertion relies on it (1359-A §8), and nothing saves it to disk.
- It cannot pass vacuously. The validator accepts it only if the frozen v1 entry's replay reproduces it field by field,
  id included. So the fixture checks the entry against Wave 1's builder rather than against itself. Under finding 8's
  defect (a replay that stamps the live id) it refuses at `official.definition`. Under a replay that reads live TUNING it
  refuses at the player's outcome.

**Why not the entry's `evaluate`.** A manifest built and replayed by the same function validates whatever that function
computes, so the leaf would test only the dispatch. That route would also add `evaluate` to the RED's pinned surface. The
swap reuses only what r5 already pins: `buildLegacyManifest`, TUNING by name and the table's literal values.

## Expected results

### At the RED commit (HEAD bc2f6007 plus RED r6)

Three files, 116 tests: **40 failed, 76 passed.**
- The integration file's 35 RED leaves fail with r5's messages, unchanged. C2-C4 fail on FIXTURE PENDING. B1, C11 and
  the old-law leaf keep their first statements, so they fail as r5 declared.
- The 2 controls and the 7 Wave R guards pass.
- Wave 1's file: 5 fail, 67 pass. The five first messages, worked out by reading:

| p15c1 leaf | Lines | First message |
|---|---|---|
| `campaign-legacy-definition-version-export` | :334-337 | `AssertionError: expected 'campaign-legacy/v1' to be 'campaign-legacy/v2' // Object.is equality` (:336) |
| `legacy-archetype-edges-commercial-engine-min-films-n-minus-1-vs-n` | :580-600 | `AssertionError: expected 'notHeld' to be 'held' // Object.is equality` (:599; 540,000 is no hit at 90) |
| `legacy-archetype-edges-artistic-voice-share-exactly-at-threshold` | :627-652 | `AssertionError: expected 'notHeld' to be 'held' // Object.is equality` (:650; 500 < 25 × 25) |
| `legacy-coexist-every-evaluated-archetype-held` | :942-1007 | `AssertionError: ALLSTAR1/commercial-engine: expected 'notHeld' to be 'held' // Object.is equality` (:975) |
| `tuning-legacy-bounded-terms` | :1892-1920 | `AssertionError: expected 70 to be 60 // Object.is equality` (:1894) |

**Root type gate** (`tsc -p tsconfig.json --noEmit`): exit 0, no output, by reading. 1359-X2 measured r4 clean. r6
adds plain literal tables, `fieldsOf`, a generic `underThresholds` with a try/finally return, value edits and one type
import, which the file uses.

### At reference r4 (RED r6 plus reference r4)

116 tests: **113 passed, 3 failed** (C2-C4, FIXTURE PENDING until the parent mints the route L captures; then they
pass). Every other row passes, including:
- the five p15c1 leaves above;
- C11;
- B1, whose step now writes v2;
- the old-law leaf.

**Root type gate:** exit 2 with the 35 errors 1359-X2 recorded for reference r3 (`x2-ref-tsc.txt`), at the same
positions: `save.ts:10498`, `harness/roster-wall/historical-control.ts:33` and 33 test sites. All come from the
reference's Save44 shape. None is in `campaignLegacy.ts`, `tuning.ts` or a RED file. By reading:
- No error site's file changed between 85764cd5 and HEAD.
- Slice A's four changed test files add no version-typed call.
- r4's new types follow r3's, which compiled, and the mode uses `as const`.

## Classification

`1359-p15c-wave2-red-r6-classification.json`, 116 rows: r5's 44 in r5's order, then Wave 1's 72 in file order. Each
row keeps r5's fields (`file`, `leaf`, `charterClause`, `expectedFailureToday`, `control`, `fixturePending`, `budget`)
and adds:
- `lines`: the r6 span of the leaf;
- `atRed` and `firstMessageAtRed`: r5's rows carry 1359-X2's recorded first line;
- `atReferenceR4`;
- `redBasis` and `referenceBasis`: "measured" names the run, "reading" says why;
- `readingOnly`: true when no run has executed the leaf as r6 writes it, past its first failing statement.

15 rows are `readingOnly`:
- B1, C11 and the old-law leaf;
- the five failing p15c1 leaves;
- the seven p15c1 leaves whose fixture values derive from a moved constant (:379, :1035, :1059, :1134, :1153,
  :1546, :1756), all passing on both trees.

Every reference r4 outcome rests on reading, since reference r4 has not run. Charter clauses changed on the three
integration rows; their `expectedFailureToday` texts did not.

## Apply checks

All checks ran in `/Users/zacheryspector/studio-scratch/1359-red/applycheck-c6`. I filled it with
`git archive bc2f6007 tests src ':!tests/fixtures'`, so no fixture tree came along, then ran `git init`. Base tree: 9224cb7b.
- `git apply --check` of RED r6 alone at HEAD: OK.
- RED r6 applied, then `--check` of reference r4: OK.
- `--check` of sibling r2 on r6: OK.
- `--check` of sibling r2 on r6 plus reference r4: OK.
- After applying both, all 13 touched files equal T's `ref-r4` blobs.
- In T, sibling r2 rebased onto r6 (`git diff main sibling-1359-on-r6`) hashes to d703e29c…, the staged sibling r2.

I touched no index, worktree or stash of the repo. Repo commands were `git show`, `diff`, `log`, `ls-tree`, `rev-parse`,
`grep` and `archive`.

## Producer and route helper (1353-F6 ruling 3; 1353-U finding 10)

Producer r4 needs no change. It captures `exportSave(makeSave(routeAt(week)))` for 6239 and 6240 (producer :72-79). It
asserts no `campaignLegacy` root (:61, :75). Its MANIFEST holds the route, sizes, hashes and timings. The route helper
imports only `LEGACY_BOUNDARY_WEEK` from the law (route-l :27) and reads TUNING's `CONTRACT_MAX_WEEKS` and
`TICKS_PER_YEAR` (:68, :87). No captured value depends on the three keys or the definition string, and the helper's
blob is unchanged.

## Uncertain items

1. **Nothing ran.** 1359-X5 is the first execution of r6 and reference r4. The five p15c1 messages follow vitest's
   format as recorded in `E/1353-p15c1-red-recorded.txt` ("AssertionError: expected undefined to be 70 // Object.is
   equality") and, for a labelled `expect`, in 1358's runs ("NAME: expected … // Object.is equality").
2. **7, 37 and 122.**
   - Source: the raw Save38 (`g6240-check.py`, which agrees with 1353-U-g6240.py). The 8th critic score is 69.99 and
     the 38th is 59.71, so both counts sit near their lines.
   - The leaf reads the state migrated to live. By reading `save.ts:10509-10690`, the V39-V43 converters never touch
     `studio.releasedFilms`.
3. **The relabel token `outcome`.** In the reference, the replay's first difference is
   `official.studios[0].archetypes[0].outcome`: the player is row 0, artistic voice is archetype 0, and outcome is its
   first differing field. On G6240 the player's artistic voice is the only outcome that changes between eras. A replay
   that walks fields in another order would name `qualifyingCount` first, and the token would miss.
4. **TypeScript inference.** By reading:
   - `Object.freeze` on `LEGACY_ERA_STRUCTURE` and the spread into each entry should give `LegacyDefinition`'s types.
     The literal shapes are r3's, which compiled at 1359-X2, and the mode carries `as const`.
   - `underThresholds` returns from inside `try` with a bare `finally`, which `noImplicitReturns` accepts.
5. **Route L at HEAD's src.** Carried from 1359-D4 note 4: slice A's src has not yet run under the route L leaves.
6. **G-P.** 1353-X4 and the 48 contingency (1353-F7 ruling 2) are outside r6. A move to 48 would change C11's `V2`
   literal, p15c1 :318 and :1899, and `tuning.ts:1047`, under its own record (F7 ruling 2).

## Deviation

Before 01:10 CDT (the time I logged it in `PROGRESS.txt`), I ran `node_modules/.bin/tsc --version` once in the repo to
read the TypeScript version (5.9.3). It printed the version and compiled nothing, but it is a `tsc` invocation the
brief rules out. Nothing else ran.

## sha256

| File (in `/Users/zacheryspector/studio-scratch/1359-red/`) | sha256 |
|---|---|
| `1359-p15c-wave2-red-r6.patch` (127,690 bytes) | b20f12f00b0eb079395f5920f41492cdab54615debf0a8578ec71ad7ced036e6 |
| `1359-p15c-wave2-red-r6-classification.json` (96,183 bytes) | 5385231f8e1115015a36a4dd7bf6e49758032ae746006df9f81cc63c4e50c5ab |
| `1359-p15c-wave2-reference-r4.patch` (95,857 bytes) | 66dc946d83e3b93aa19af6a7ac8f4a9eacef56044b9584e6fd2b3e29905fa025 |
| `1359-p15c-wave2-sibling-r2.patch`, unchanged | d703e29ca9189bb06bad39985c991f99a73632f9c6feeb5549d886c0354b97f8 |
| `1359-P-p15c2-route-l-producer-r4.ts`, unchanged | 78c1d1055973dfd98479f511140d9ec44978639b83ae27e6389ffb55ada35186 |
| `tree/tests/helpers/p15c2-route-l.ts` (blob 09de4a54…), unchanged | 0a046fbed82026d0a14571dbca7291054064cf66f9d45ad83ad0b1926fdaa0c4 |
| `g6240-check.py` (reads G6240, prints) | 26600332aa0c93ca99683cee7ef3f1da24aef779608c9974b7f94945a101dec7 |
| `edit-p15c1.py` | 728b4611136edcc53763dc06b603a3c6e9ffe4442f4142e8a352a3e79a91aa0e |
| `edit-integration.py` | 8f07780a693d68e85fff34eba8b513944a1e4dd97aa8311e4e5983bcedf6eefe |
| `edit-tuning.py` | dd8fd50e9727252323358ef65146932f3576f8fb5bbbb71943a1cf6c4209a8d2 |
| `edit-law.py` | f2c3c61e147d19d94d1697c9839d2cb220b3b99a04246da63441d03a00f7bc7d |
| `make-classification-r6.py` | 318cab7a6cf798dd28bd5c986a034317f79fcf041f191ca6179908186aa7258b |

The final report gives this handback's own hash. Commit ids in T: `main` 8fa01aef4dbff4ae3971bc74bea8265c9b6ce5a6
(tree c83dad9a), `ref-r4` 2a9c5f523c794510268b590c3248326fa05f0238 (tree f3099b21), `sibling-1359-on-r6`
35b0190f27460096d9d8a0b06b321dba421fce56 (tree cdb2a525).
