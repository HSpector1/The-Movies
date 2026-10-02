# 1361-GP: notes for G-P probe r2, the sibling-roots branch

`1361-GP-probe-r2.ts` is r2 of the G-P probe. r1 (`E/1359-stage/gp/1359-GP-probe.ts`, sha256 f0f0c0f6…) refuses every
P15 root at :50-57, so it stops at week 0 on the gating tree, which carries `p15Sequence`, `powerRanking` and
`sharedMarket`. r2 replaces that refusal with a branch that reads each present sibling root by 1359-A §3.1's row maps,
checks the landed law's record-id rule, and keeps `corporateCondition` on the law's absent path. Everything else
measures as r1 does.

I wrote r2 read-only at HEAD f3fe97d0 and ran nothing: no node, vitest, tsc or vite-node. No reviewer has read it.

- **r2:** 518 lines, sha256 `3d460c228b5b406b44069dad981096efd364af18189dfd2be7fb294944d98144`. A revision after review
  changes the hash; §5.4's script checks the first 16 characters.
- **Authority:** 1361-F ruling 12; 1353-F7 ruling 5 (:60-68); 1361-R Part 1.3 "Gates: G-P" (:338-356) and Q6 (:740-746).

**Citations.** E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`. A bare `:n` or "§" is 1359-A.
"r4" is `E/1359-stage/1359-p15c-wave2-reference-r4.patch`, by patch line. "RED" is
`tests/p15c2-campaign-legacy-integration.test.ts` at HEAD. "Law" is `src/core/campaignLegacy.ts` at HEAD; the gating
tree's law differs from it only by the v2 definition string at :72. "r1 :n" and "r2 :n" are probe lines.

## 1. What r2 does on the gating tree

Per seed, after the route to week 6240:

1. **Refusal.** It stops by name if the state carries `campaignLegacy` or `corporateCondition`, at week 0 and again at
   the freeze.
2. **Adapter.** It reads `powerRanking` and `sharedMarket` when each records from before the boundary, and adds their
   fact arrays and domain rows. `corporateCondition` stays absent. `p15Sequence` feeds no fact.
3. **Law.** The law refuses an authored film's null `settledWeek` first, as on 1359-X4 and 1353-X4, and the F1 bridge
   reruns it. The rerun then refuses `rankingSnapshots[1] repeats a record id`, and the record-id bridge reruns it with
   one id per row and maps each ranking ref back to its record id. Each bridge proves its stand-in inert or stops.
4. **Report.** It writes r1's fields plus `recordIdBridge` and `siblings`, and two new stderr lines.

**No archetype reads a ranking or market fact.** The archetypes (law :585-703) read films, runs, career events,
adoptions, the catalogue and condition events. The sibling facts reach only the sources and three lenses: ranking,
financialBand and market (law :714-717, :731-746). So the branch cannot move a holder or the retune check. It moves the
domain table, those lenses, the manifest bytes and sha256, and the freeze time. Holders move only with the route, for
two reasons:
- slice B's production, which changed `relationships.ts` and `talentMarket.ts` after 1353-X4's tree bc2f6007
  (`git diff --stat bc2f6007 HEAD -- src`);
- P15A.1's commit (c), which puts market pressure into grosses.

## 2. The diff from r1, hunk by hunk

`diff -u E/1359-stage/gp/1359-GP-probe.ts 1361-GP-probe-r2.ts` prints 13 hunks.

| Hunk | r1 lines | r2 lines | Change | Reason |
|---|---|---|---|---|
| 1 | 1, 5 | 1-4, 8 | Names r2 and cites r1 and its two runs. The law line drops "`campaign-legacy/v1`" | Identity. The gating tree carries the v2 values (ruling 12) |
| 2 | 14-17, 19 | 17-21, 23 | Run instructions: the gating tree, the v2 commit, the file name, the out paths. "F1 bridge" becomes "bridges" | Ruling 12. The smoke runs both bridges |
| 3 | after 28 | 33 | Four type imports: `LegacyDomainFact`, `LegacyMarketAssessmentFact`, `LegacyRankingSnapshotFact`, `LegacyRef` | Types for the new code. All four are exported at law :155-157 and :177; vite-node erases them |
| 4 | 44-55 | 49-63 | The refusal of five roots becomes `requireNoRefusedRoots` over two: `campaignLegacy` and `corporateCondition`. `P15_KEYS` stays and now feeds the report | r1 :50-57 is the refusal ruling 12 names. G-P gates the production that adds `campaignLegacy` (1359-F5:25-26). P15B does not join Save45 (1361-F ruling 17), and r2 has no condition row map (§7) |
| 4 | 61-63 | 69-72 | The adapter comment adds §5.1 item 6's sibling rule to "the only week comparisons" | r2 adds that comparison (`siblingBefore`), which made the r1 sentence false |
| 5 | after 70 | 80-103 | `Row`, `rowsOf`, `siblingBefore`, `siblingDomain` | r4's sibling helpers (r4 :377-404), untyped as r4's are |
| 6 | 134 | 167 | The `closedWeek` comment names the renamed refusal | Rename only |
| 6 | after 140 | 174-175 | `ranking` and `market`: each root when it records from before the boundary | §3.1 :58, :60; §5.1 item 6 |
| 7 | 164-168 | 199-205 | The `powerRanking` and `marketAssessments` domain rows come from `siblingDomain`. `corporateCondition` keeps r1's literal row | §3.2 :79-83 with 1355-F2 item 7 |
| 7 | after 169 | 207-224 | The `rankingSnapshots` and `marketAssessments` fact arrays, each added only when its root is present | §3.1 :58, :60. §3.2 :83 leaves an absent root's array undefined |
| 8 | 203 | 258 | r1's `attempt` becomes `lawAttempt`, body unchanged | The new `attempt` wraps it, so `runLaw` keeps its three calls as written |
| 9 | after 214 | 270-331 | The record-id bridge and the new `attempt` | §4 |
| 9 | 216, 221, 228 | 333, 338-339, 346 | `LawRun` gains `recordId`, and `runLaw`'s two refusal returns carry it | Carries the bridge's record into the report. The success returns spread it already |
| 10 | 273 | 391 | The week-0 call uses the renamed refusal | Rename only |
| 11 | 282-283 | 400-403 | The freeze-state comment describes the gating tree, and the freeze call uses the renamed refusal | r1's "HEAD has no ranking or condition step" is false on the gating tree |
| 11 | after 289 | 410-422 | The `siblings` report and one stderr line, `P15 roots at week …` | Shows which roots the freeze read, the rows fed, and `p15Sequence.next` for the watermark check (§5.7) |
| 11 | after 290 | 424-428 | One stderr line, `RECORD-ID BRIDGE …`, when that bridge ran | Disclosure, as r1's `F1 BRIDGE` line discloses F1 |
| 12 | 305-306 | 443-447 | Report fields `recordIdBridge` (after `f1`) and `siblings` (before `domainTable`). The freeze comment names both bridges' reruns as excluded | Output |
| 13 | 355 | 496 | `probe: '1361-GP-r2'` | Identity |

**Unchanged:** the seeds and their parsing, the route loop and its progress lines, `law`, the F1 constants and
`runLaw`'s logic, `adapt`, `outcomeOf`, `holdersOf`, `studioRows`, `retuneCheck`, the summary lines and the exit code.
The stderr prefix stays `[1359-GP]`, so .err files diff line for line against 1359-X4's and 1353-X4's.

**On a tree with no P15 root, r2 computes r1's facts, manifest and report.** `siblingBefore` returns undefined,
`siblingDomain` returns r1's literal rows, the two spreads add no key, and `attempt` passes `lawAttempt`'s result
through. r2 adds only `recordIdBridge` `{landedLawRefusal: null, standInRows: 0}`, `siblings` with empty roots and null
counts, a `P15 roots … none` stderr line, and the new probe id. Control C0 (§5.5) checks this in two 20-week smokes.

## 3. The mapping to §3.1 and §3.2

| Charter | Fact or domain row | Gating-tree source | r2 | r4 | RED |
|---|---|---|---|---|---|
| §3.1 :58 | ranking row `{recordId, week, studioId, rank, band}`; `recordId` per §3.3 A1 | `powerRanking.snapshots[]`: the record's `id` (`power-ranking-<p15DomainSequence>`, 1355-F2 item 5) and `week`; each `rows[]` entry's `studioId`, `rank`, `band` (1356-A §5 :93-98; `tests/p15a2-power-ranking-archive.test.ts:107-123`) | :207-216 | :516-520 | A7 :584-590 |
| §3.1 :60 | market assessment `{assessmentId: releaseId, studioId, week, assessed: true, underPressure: factor < 1}`; `week` per §3.3 A2 | `sharedMarket.assessments[]`: `releaseId`, `studioId`, `week`, `factor` (1355-A §3.3 :90-96; `src/core/sharedMarket.ts:62-74`) | :217-224 | :526-531 | A7 :602-608 |
| §3.1 :59 | condition event `{eventId, studioId, week, from, to}` | none: P15B is not in Save45 (ruling 17) | a present root refuses (:58-65) | :521-525 | A7 :593-601 |
| §3.1 :47 | `closedWeek`: the week of the `→ closed` event; null without the root | none | null (:167), as r1 | :462-468 | A5 :535-560 |
| §3.2 :79 | `powerRanking`: the root's `recordedFromWeek`; watermark the largest `p15DomainSequence` in the root, 0 if none | the records' `p15DomainSequence`; rows carry none (`ROW_KEYS`, archive test :123) | :201 through :94-102 | :515 | `expectedDomains` :302; A8 :639-640 |
| §3.2 :80 | `corporateCondition` | absent | :204, r1's literal | :511-513 | `expectedDomains` :303 |
| §3.2 :81 | `marketAssessments` from `sharedMarket.assessments` | each assessment's `p15DomainSequence` | :205 through :94-102 | :515 | `expectedDomains` :304; A8 :647-649 |
| §3.2 :83 | absent root: `recordedFromWeek` null, watermark 0, no fact array | | :95; spreads :210, :219 | :511-513 | A7 :614-616 |
| §5.1 item 6 (:171-172) | a root recorded from the boundary or later reads as absent | | `siblingBefore` :86-91 | :384-389 | `expectedDomains` :289-291; A7 :624-627 |
| §3.1 :62-66 | never read: cash, costs, revenue, loans, career money | | the sibling reads touch only the fields above, `p15DomainSequence` and `recordedFromWeek`; `p15Sequence.next` feeds only the report | | A3 |

Facts keep r4's key order and row order: records in archive order, rows in record order, assessments in root order.
The law does not depend on either order. Ranking refs sort by week alone (law :735), and one studio has one row per
week (law :488-490).

**The absent `corporateCondition`.** r2 passes the domain row `{corporateCondition, 0, null}` and no `conditionEvents`
array. The law then reads the domain `notRecorded` (law :458, :531), the resilience lens `notRecorded`, and
`resilient-survivor` `notRecorded` for every studio (law :687-690). `retuneCheck` marks that archetype exempt
(r2 :466-474), as on 1359-X4 and 1353-X4.

## 4. The record-id rule

**The rule at HEAD.** Law :477-483 keeps one set of record ids across all ranking rows and refuses a repeat with
`campaign legacy: rankingSnapshots[i] repeats a record id`. §3.1 :58 gives every row of a record that record's id, and
a slice 2a record holds one row per entered studio (1356-A §5 :123). The week-13 record on these routes has more than
one row, so the landed law refuses `rankingSnapshots[1]`. r1's notes predicted this (`E/1359-stage/gp/1359-GP-notes.md`
choice 3).

**What production changes.** 1359-X found the conflict as F-2 (:49-55). 1359-F3 (:29-33) rules that the law keys
uniqueness on (`recordId`, `studioId`), and r4 does so (r4 :76-85). RED A7 (:586-590, :623) and B4 (:738, :749-750)
need that rule. The gating tree does not carry P15C's production, so its law keeps the HEAD rule.

**The bridge (r2 :270-331)** follows the F1 bridge's pattern:
1. `attempt` calls the law. The bridge applies only when the law refuses with exactly the HEAD message (regex r2 :282),
   the named row exists, and every (`recordId`, `studioId`) pair is distinct. Any other result passes through.
2. It records the refusal and the row count in `recordIdBridge`.
3. It runs the law on a copy whose rows carry `JSON.stringify([recordId, studioId])` as their id, then maps every
   `powerRanking` ref back to its row's record id. An unmapped ranking ref stops the probe.
4. It runs a second copy with `JSON.stringify([studioId, recordId])`, whose ids sort in a different order, maps it back,
   and stops by name unless the canonical bytes match.
5. `lawMs` is the first copy's law call alone. The refused call, the second copy and the mapping stay out, as r1 keeps
   the F1 reruns out.

**Why the copy gives 1359-F3's manifest.** `grep -n recordId src/core/campaignLegacy.ts` finds two reads: the row checks
(law :481-483) and the ranking refs (law :736). r4's law hunk changes nothing else in `readFacts`. The ranking refs sort
by week alone, so stand-in ids cannot reorder them, and the map-back restores the ids 1359-F3's law would cite. The
second scheme tests that claim on the run's own data.

**With F1.** `readFacts` reads films before ranking rows (law :336, :474), so the first call refuses F1. Both F1 calls
(`settledWeek` 0 and 6239) then pass through the record-id bridge, and the F1 inertness check compares mapped manifests.

**What the bridge cannot hide.** A repeated (`recordId`, `studioId`) pair fails the precondition, so `lawRefusal` keeps
the landed message and the seed gets no manifest. A `lawRefusal` reading `… repeats a record id` therefore means the
archive or the adapter wrote a duplicate row, which 1359-F3's law would refuse as well.

**Expected on the gating tree.** On both seeds, `recordIdBridge.landedLawRefusal` reads
`campaign legacy: rankingSnapshots[1] repeats a record id`, `standInRows` equals `siblings.rankingRows`, and stderr
carries one `RECORD-ID BRIDGE` line. A null `landedLawRefusal` with ranking rows present means the tree's law already
carries 1359-F3.

## 5. How the parent runs it

### 5.1 The tree

The gating tree of ruling 12: the writer's candidate after P15A.1, which is slice 2a plus P15A.1's (a) and (b), with
(c) only if G2 passed. Build it as 1353-X4 built its tree (1353-X4:12-19):
- an archive of the candidate commit in `/Users/zacheryspector/studio-scratch/1361-prod/tree`, never the writer's
  working tree;
- `node_modules` linked from the repository;
- one tree commit with the v2 values (§5.2).

The probe sits in `../probe` beside the tree, so the `../tree/` import prefix needs no edit. `PROBE_TREE_HEAD` records
the candidate's full commit and the v2 commit, as 1353-X4's `HEADS` did. Run order: after G2 (1361-F, order step 6).

### 5.2 The v2 values

Apply `E/1353-stage/x4/1353-X4-tree-edits.patch` with `git apply` and commit it. It sets four values:
- `CAMPAIGN_LEGACY_DEFINITION` `campaign-legacy/v2` (law :72);
- `LEGACY_CRITIC_ACCLAIM_MIN` 60, `LEGACY_MIN_SHARE_PERCENT` 20, `LEGACY_HIT_REACH_PERCENT` 49
  (`src/core/tuning.ts:1042`, :1046, :1047).

Neither file changed between bc2f6007 and HEAD (`git diff --stat bc2f6007 HEAD -- src/core/tuning.ts
src/core/campaignLegacy.ts` prints nothing), and the slice 2a and P15A.1 references touch neither. So the patch should
apply to the candidate. The script stops if it does not, or if the four values are not in place after it. The JSON's
`law` and `tuning` fields record what ran.

### 5.3 The seeds

`p13a-core-causal-01` and `seed-b` through `p13aGeneratedStudio(seed)`, the probe default. 1359-X4 and 1353-X4 ran
them, and ruling 11 runs G2 on the same two.

### 5.4 The commands

Save this as its own file and run it alone under `lane-run.sh`. Never edit it while it runs; copy it to a new name.

```bash
#!/usr/bin/env bash
# 1361-GP: the gating G-P run (1361-F ruling 12). usage: run-1361-gp.sh <writer tag of the candidate after P15A.1>
# Builds X/tree from that tag, commits the v2 values, checks the probe hash, then runs a 20-week smoke and the full
# routes. Writes only under X.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
E=$R/docs/engineering/playability-launch-review/evidence/p14b4-20260919
W=/Users/zacheryspector/studio-scratch/1361-prod/tree
X=/Users/zacheryspector/studio-scratch/1361-gp-x
PROBE=/Users/zacheryspector/studio-scratch/1361-gp/1361-GP-probe-r2.ts
PROBE_SHA16=3d460c228b5b406b
TAG=${1:?tag}
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ -e "$X" ] && { echo "$X exists"; exit 2; }
CAND=$(git -C "$W" rev-parse "$TAG^{commit}") || exit 2
mkdir -p "$X/tree" "$X/probe" "$X/out"
git -C "$W" archive "$CAND" | tar -x -C "$X/tree"
ln -s "$R/node_modules" "$X/tree/node_modules"
cd "$X/tree" || exit 2
G="git -c user.name=parent -c user.email=parent@local"
git init -q && echo node_modules > .git/info/exclude
$G add -A && $G commit -qm "base $CAND (1361-prod $TAG)"
git apply "$E/1353-stage/x4/1353-X4-tree-edits.patch" || { echo "STOP: the 1353-X4 tree edits do not apply"; exit 3; }
command grep -q "^export const CAMPAIGN_LEGACY_DEFINITION = 'campaign-legacy/v2'$" src/core/campaignLegacy.ts \
  || { echo "STOP: the definition is not v2"; exit 3; }
[ "$(command grep -cE '^  LEGACY_(CRITIC_ACCLAIM_MIN: 60|MIN_SHARE_PERCENT: 20|HIT_REACH_PERCENT: 49),' src/core/tuning.ts)" = 3 ] \
  || { echo "STOP: the three v2 values are not in tuning.ts"; exit 3; }
$G commit -qam "v2 values: critic 60, share 20, hit 49, campaign-legacy/v2 (1353-X4 tree edits)"
[ -z "$(git status --porcelain)" ] || { echo "STOP: tree is dirty"; exit 3; }
HEADS="$CAND+$(git rev-parse --short HEAD)"
cp "$PROBE" "$X/probe/"
[ "$(shasum -a 256 "$X/probe/1361-GP-probe-r2.ts" | cut -c1-16)" = "$PROBE_SHA16" ] || { echo "STOP: probe hash differs"; exit 2; }
probe() { # tag weeks seeds
  echo "$1: 1361-GP-probe-r2.ts node $(node --version), tree $HEADS, weeks $2, seeds $3, start $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"
  PROBE_TREE_HEAD=$HEADS PROBE_WEEKS=$2 PROBE_SEEDS=$3 ./node_modules/.bin/vite-node ../probe/1361-GP-probe-r2.ts > "$X/out/$1.json" 2> "$X/out/$1.err"
  local rc=$?
  echo "$1: exit $rc, end $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$X/out/runs.meta"
  return $rc
}
probe smoke-gp 20 p13a-core-causal-01 || { echo "smoke failed"; exit 1; }
probe gp 6240 p13a-core-causal-01,seed-b; echo "gp exit $?"
```

Read the smoke's output (§5.7) before trusting the full run. The script runs the full routes right after a smoke that
exits 0, as 1353-X4's did; split it if you want to read the smoke first.

### 5.5 Optional control C0: r1 and r2 agree without siblings

Two 20-week smokes on the writer's `base` tag (an archive of f3fe97d0, no P15 root) with the v2 edit. About 10 seconds
of runs. It checks hunks 4-12 on the absent path, which no reviewer can run. Save it as its own file too; its `exit`
lines would close an interactive shell.

```bash
#!/usr/bin/env bash
# 1361-GP C0: r1 and r2 on one tree with no P15 root. Writes only under Y.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
E=$R/docs/engineering/playability-launch-review/evidence/p14b4-20260919
W=/Users/zacheryspector/studio-scratch/1361-prod/tree
Y=/Users/zacheryspector/studio-scratch/1361-gp-c0
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ -e "$Y" ] && { echo "$Y exists"; exit 2; }
mkdir -p "$Y/tree" "$Y/probe" "$Y/out"
git -C "$W" archive base | tar -x -C "$Y/tree" && ln -s "$R/node_modules" "$Y/tree/node_modules"
cd "$Y/tree" || exit 2
git init -q && git apply "$E/1353-stage/x4/1353-X4-tree-edits.patch" || { echo "STOP: the tree edits do not apply"; exit 3; }
cp "$E/1359-stage/gp/1359-GP-probe.ts" /Users/zacheryspector/studio-scratch/1361-gp/1361-GP-probe-r2.ts "$Y/probe/"
for f in 1359-GP-probe 1361-GP-probe-r2; do
  PROBE_TREE_HEAD="$(git -C "$W" rev-parse base)+v2" PROBE_WEEKS=20 PROBE_SEEDS=p13a-core-causal-01 \
    ./node_modules/.bin/vite-node "../probe/$f.ts" > "$Y/out/$f.json" 2> "$Y/out/$f.err"; echo "$f exit $?"
done
command grep -h '"manifestSha256"' "$Y/out/"*.json
```

Pass: both exit 0; the two `manifestSha256` lines match; r2's .err matches r1's line for line apart from the
millisecond figures, plus one `P15 roots at week 20: none; …` line; r2's JSON equals r1's apart from `probe`, the
timings (`routeMs`, `msPerTick`, `freeze`), `recordIdBridge`
`{landedLawRefusal: null, standInRows: 0}` and `siblings` `{roots: [], p15SequenceNext: null, rankingRecords: null,
rankingRows: null, marketRows: null}`. The same pair at 6240 (about 7 minutes each) would also give a no-sibling,
no-pressure baseline on current `src`, which separates slice B's effect on holders from P15A.1's.

### 5.6 Expected runtime

The basis is 1353-X4: the same probe flow, v2 values and Node v20.20.2 (`E/1353-stage/x4/runs.meta`, `gp-v2.err`).

| Run | 1353-X4 measured | Expected here |
|---|---:|---|
| Smoke, p13a, 20 weeks | 3 s | about 3-5 s |
| p13a route to 6240 | 81.3 s (13.0 ms per tick) | 81 s plus the sibling steps' cost |
| seed-b route to 6240 | 332.9 s | 333 s plus the sibling steps' cost |
| Freeze per seed (adapter + law) | 10 ms; 43 ms | tens of ms; report only (1359-A :267) |
| Full run, two seeds | 6 min 56 s | about 7 minutes plus the sibling steps' cost |

r2's own added work is one adapter pass over the sibling rows and up to seven law calls per seed instead of three:
well under a second (estimate). The candidate's tick adds the market batch every week and a ranking record every 13
weeks, and commit (c) changes the routes themselves. Nothing has measured that yet. G2 runs the same candidate on the
same seeds to 6240 first (ruling 11; order step 5), so G2's candidate route times are the better estimate.

For watching the .err: on 1353-X4, p13a reached week 3120 at 31 s and 6240 at 81 s; seed-b reached 3120 at 72 s and
6240 at 333 s.

### 5.7 What the parent checks

**Smoke** (p13a, week 20):
1. Exit 0, `mode` `"smoke"`.
2. stderr, in order: `P15 roots at week 20: p15Sequence, powerRanking, sharedMarket; …; ranking 1 records in R rows; …`,
   then `F1 BRIDGE` with 8 films, then `RECORD-ID BRIDGE` with R rows, then `smoke endOfRun at week 20`. R is the number
   of studios entered by week 13; 1353-X4's smoke manifest lists 5 studios at week 20. With R = 1 no record-id refusal
   arises in the smoke.
3. JSON: `adapterRefusals` `[]`, `lawRefusal` null, `f1.standInFilms` 8.
4. `siblings.p15SequenceNext - 1` equals `rankingRecords + marketRows`: every P15 allocation on this tree is a ranking
   record or an assessment (1355-F2 items 1, 2 and 4).
5. Domain table: `powerRanking` and `marketAssessments` read `recordedFromWeek` 0 and `complete`; `corporateCondition`
   reads 0, null, `notRecorded`.

**Full run:**
1. Exit 0. Both seeds reach `finalWeek` 6240 in `mode` `"g-p"`. `law` reads `campaign-legacy/v2`, and `tuning` reads 60,
   20 and 49 with the other twelve values at v1's.
2. Per seed: `adapterRefusals` `[]`, `lawRefusal` null, `f1.standInFilms` 8, and `recordIdBridge` as §4 expects.
3. `siblings.roots` lists `p15Sequence`, `powerRanking` and `sharedMarket`; `rankingRecords` is 480, one record every 13
   weeks from 13 to 6240 (1356-A §5 :114).
4. `p15SequenceNext - 1` equals `rankingRecords + marketRows`, and equals the `powerRanking` watermark: the week-6240
   record is the tick's last allocation (1355-F2 item 2; ruling 9). The `marketAssessments` watermark sits below it.
   A mismatch means a row lacks its sequence or the tick order differs: stop and ask before reading holders.
5. Domain table: the seven array domains `complete` from week 0, as before; `powerRanking` and `marketAssessments`
   `complete` from week 0; `corporateCondition` `notRecorded`. A `notRecorded` sibling row means its root was missing
   at 6240, and the run is not the gating run.
6. With (c), `marketRows` should be one assessment per release since week 0 (1355-A §3.4 item 3). Without (c), see §6
   item 4.
7. Then the trigger: a non-empty `retuneCheck.retune` under 1359-F5 ruling 1's reading. Compare the holders with
   1353-X4's table; a difference comes from the route (§1), never from the branch.
8. Manifest bytes: roughly 7 KB more per seed than 1353-X4's 35,139 and 60,492 if the route did not change (estimate:
   up to 12 ranking refs of about 45 bytes plus new counts, for 10 studios), well under the 140 KB cap (1359-A :158).
   Keep `manifestCanonical` for G-L's K3.

## 6. What stays unknown until the candidate exists

1. **The roots as the writer lands them.** r2 reads r4's field names untyped: the record's `id`, `week` and
   `rows[].studioId`, `rank`, `band`; the assessment's `releaseId`, `studioId`, `week` and `factor`;
   `p15DomainSequence` on records and assessments; `recordedFromWeek` on both roots. A missing id, week, studio or band
   surfaces as a law refusal by name. Two misreads would stay silent: a missing `factor` reads `underPressure: false`,
   and a missing `p15DomainSequence` lowers a watermark. The check in §5.7 full-run item 4 catches the second. The
   landed REDs pin both names, so a candidate that passes its dry run carries them: `PERSISTED_ROW_KEYS` holds `factor`
   and `p15DomainSequence` (`tests/helpers/p15a1-market-route.ts:42-45`, asserted at
   `tests/p15a1-market-integration.test.ts:389`, :835), and `RECORD_KEYS` holds `id`, `p15DomainSequence` and `week`
   (`tests/p15a2-power-ranking-archive.test.ts:121-123`).
2. **Root seeding.** r2 assumes worldgen seeds both roots with `recordedFromWeek` 0 (1356-A §5 :135; 1355-A §3.5 :137) and
   that `p13aGeneratedStudio` keeps them; `initializeHollywood` spreads the state (`src/core/hollywood.ts:180`). A
   missing root reads absent, and §5.7 full-run item 5 catches it.
3. **The tick's tail.** r2 reads `tick()`'s result at 6240 as the freeze's input. That holds when the ranking record
   is the tick's outermost last step and the freeze would wrap it (ruling 9; 1356-A §4 :76-89). Read the candidate's
   `tick.ts` once it exists.
4. **Commit (c).** Without (c) no market batch runs. If the root still exists it stays empty, and the Legacy reads
   `marketAssessments` `complete` with no assessment, so every studio's market lens counts 0. That is what P15C's
   adapter would read on that tree. Whether a root that records nothing should claim coverage from week 0 is a P15A.1
   question for the parent. No holder depends on it.
5. **The law and tuning files.** If the candidate edits `campaignLegacy.ts` or `tuning.ts`, the v2 patch may not apply,
   and the script stops. If the candidate's law already carries F1 or 1359-F3, the bridges report null refusals, which
   is correct.
6. **The numbers:** holders, manifest bytes, freeze time and run time on the candidate.

## 7. Choices for the reviewer

1. **A present `corporateCondition` refuses.** The alternative implements §3.1 :47 and :59 as r4 does (r4 :462-468,
   :521-525), about ten lines. I chose the refusal: ruling 17 keeps P15B out of Save45, no tree can exercise a
   condition map before the gating run, and a stop by name beats an untested map.
2. **`campaignLegacy` still refuses.** A tree carrying P15C's production belongs to G-L, not G-P.
3. **A probe bridge, not a law edit in the tree.** Ruling 12 puts only the v2 values into the gating tree, and the F1
   bridge is the precedent (1359-X4; 1353-X4).
4. **The stderr prefix stays `[1359-GP]`.** The JSON's `probe` field carries r2's identity.
5. **Untyped sibling reads**, as r4's (and 1361-F ruling 18 for `corporateCondition`). They work whatever names the
   candidate's `types.ts` gives the roots.
