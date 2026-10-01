# 1344-s7 RUNBOOK: the §7 verification of rival screenplay shelving (D-1329-1)

The instrumentation engineer wrote this kit read-only and ran none of it. The parent runs it on the landed candidate,
after the Save43 sweep's recorded gates, one heavy process at a time, in the order below.

Authority:
- 1344-A §7 (:172-185);
- 1344-F (:38-39): also report industry films after week 140 against HEAD's 53, and shelvings per studio per year;
- 1344-F2, and 1344-F3 (:16-17: attribute every natural-route movement from week 93 on; ruling 4: the week-93 viable
  control).

No thresholds are specified: report, attribute, flag the rest to the Owner.

## The kit

| Path | Role |
|---|---|
| `build-trees.sh` | builds `tree/` (candidate) and `old-tree/` (ff803032 source) |
| `probes/s7-lib.ts` | helpers shared by the probes and control (b); copied as `tests/zz-s7-lib.ts` |
| `probes/s7-natural-route.test.ts` | the 1329 natural-chain and rival-economy probes on one chain, plus the §7 measures and the control (c) checks |
| `probes/s7-decide-diag.test.ts` | the 1329 decide-diag, rebuilt as a spy on the public chooser export (no source patch) |
| `probes/compare.py` | anchors against 1329, candidate against old and 1329, first divergence and movements per seed |
| `controls/a-test3.sh` | control (a): test 3 on the candidate |
| `controls/b-player-only.test.ts` | control (b): player-only campaigns in both trees |
| `controls/check.py` | verdicts for controls (a)-(d) |
| `c8/PLAN.md`, `c8/WORKSHEET-TEMPLATE.md`, `c8/worksheet.py` | the C8 re-run and its attribution worksheet |
| `NOTES.md` | what §7 leaves undefined or contradictory |

Every probe uses public exports and the seeded chain only (`p13aGeneratedStudio(seed)` or `generateWorld(seed)`, then
`tick`); nothing calls `Math.random` or reads the clock except for the logged duration. Probe outputs go only to
`out/<run>/`; the shared writer throws on any other path, on a link, and on an existing run directory or file.

## Where it runs

Two scratch trees, never the real repository's working tree:
- `tree/`: `git archive` of the candidate (the 1327-C path list: `src bridge ui generated scripts package*.json
  tsconfig*.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md`, and `tests` without `tests/fixtures`).
- `old-tree/`: the same, with `src` and `generated` from ff803032. That is 1338's source, and its `src` and `generated`
  equal 133aca7a's, the source 1329-A measured (`build-trees.sh` checks both).

Both trees link `docs`, `node_modules`, `art`, `tools` and `tests/fixtures` into the real repository with `ln -sfn` and
commit a scratch base, so `git status` shows any stray write. Every vitest command passes `--no-cache`, so vitest does not
write `results.json` through the `node_modules` link.

## Variables (set once per shell)

```bash
REPO=/Users/zacheryspector/The-Movies-headless-program
E=$REPO/docs/engineering/playability-launch-review/evidence/p14b4-20260919
K=/Users/zacheryspector/studio-scratch/1344-s7
T=$K/tree
O=$K/old-tree
OUT=$K/out
C_SHA=...   # the landed candidate: the real repository's HEAD after the sweep and its recorded gates
```

## Step 0. Preconditions

```bash
pgrep -fl vitest || echo "no vitest running"                   # must print: no vitest running (no tsc either)
git -C "$REPO" diff --stat 9fc79624 "$C_SHA" -- src generated  # must print nothing; build-trees.sh refuses otherwise
df -h /Users/zacheryspector | tail -1
mkdir -p "$OUT" && test ! -e "$OUT/kit-sha256.txt" \
  && (cd "$K" && shasum -a 256 RUNBOOK.md NOTES.md build-trees.sh probes/* controls/* c8/*) > "$OUT/kit-sha256.txt"
```

The `src` check matters: the comparisons assume shelving is the only behavioural change between ff803032 and the
candidate (1344-D5 §2; the P15 modules are pure and imported by no tick path). If other production has landed, stop and
decide how to separate it (NOTES.md item 15).

## Step 1. Build the trees

```bash
bash "$K/build-trees.sh" "$C_SHA"
```

Writes `out/trees.txt` (candidate and old `src` tree hashes). It refuses to run if either tree exists.

## Step 2. The C8 re-run, in the pristine candidate tree

Run it before any probe file enters the tree, so the run sees exactly the landed tests. Commands, file list and reading
rules are in [c8/PLAN.md](c8/PLAN.md):

```bash
mkdir -p "$OUT/c8"
if [ -e "$OUT/c8/run.txt" ]; then echo "STOP: out/c8/run.txt exists"; else
  (cd "$T" && PATH="$REPO/.venv/bin:$PATH" node_modules/.bin/vitest run --project core --no-cache \
     --reporter=default --reporter=json --outputFile.json="$OUT/c8/run.json" \
     tests/bridge-p14b2-trust.test.ts tests/p14b1-t4-regressions.test.ts tests/p14b2-fixture-preconditions.test.ts \
     tests/p14b4-cast-class-outcomes.test.ts tests/p14b4-rival-seating-preference.test.ts tests/bridge-p14b5-relationships.test.ts) \
     > "$OUT/c8/run.txt" 2>&1
  echo "exit=$?" >> "$OUT/c8/run.txt"
fi
(cd "$T" && python3 "$E/1321-I-attribution.py" "$OUT/c8/run.txt" "$OUT/c8/failures.json")   # refuses an existing output
git -C "$T" status --porcelain     # record anything listed; a tracked change here means a test wrote into the tree
```

Expected exit: 1 (retained rows still fail). Recorded duration: none for these files alone. Under the full 1338 gate they
took 71.5, 111.2, 19.5, 133.2, 67.4 and 100.2 s of file time, run in parallel.

## Step 3. Control (a): test 3, in the pristine candidate tree

```bash
bash "$K/controls/a-test3.sh"      # writes out/control-a.log; expected: exit=0 and "2 passed"
```

`controls/a-test3.sh` states exactly what test 3 compares. Recorded duration: the three shelving files (51 leaves) ran in
90.8 s at 1344-X6; this step runs two leaves of one file.

## Step 4. Install the probes in both trees, and define the runner

```bash
for D in "$T" "$O"; do
  for f in zz-s7-lib.ts zz-s7-natural-route.test.ts zz-s7-decide-diag.test.ts zz-s7-player-only.test.ts; do
    test ! -e "$D/tests/$f" || echo "STOP: $D/tests/$f exists"
  done
  cp "$K/probes/s7-lib.ts" "$D/tests/zz-s7-lib.ts"
  cp "$K/probes/s7-natural-route.test.ts" "$D/tests/zz-s7-natural-route.test.ts"
  cp "$K/probes/s7-decide-diag.test.ts" "$D/tests/zz-s7-decide-diag.test.ts"
  cp "$K/controls/b-player-only.test.ts" "$D/tests/zz-s7-player-only.test.ts"
done

# s7run <tree dir> <candidate|old> <run name> <test file> [VAR=value ...]: one vitest process; log beside the run's outputs
s7run() {
  local dir=$1 tree=$2 run=$3 file=$4; shift 4
  if [ -e "$OUT/$run" ] || [ -e "$OUT/$run.log" ]; then echo "s7run: $run exists, refusing"; return 1; fi
  (cd "$dir" && env S7_TREE="$tree" S7_RUN="$run" "$@" node_modules/.bin/vitest run --project core --no-cache "tests/$file") \
    > "$OUT/$run.log" 2>&1
  echo "exit=$?" >> "$OUT/$run.log"
  grep -aE "^S7 |Tests |exit=" "$OUT/$run.log"
}
```

`S7_TREE` must match the tree: every probe checks it against the source (Save43 present or absent) and throws on a
mismatch.

## Step 5. Smoke runs (short horizons; catch an error before the long runs)

```bash
s7run "$T" candidate smoke-c-route zz-s7-natural-route.test.ts S7_WEEKS=20
s7run "$O" old       smoke-o-route zz-s7-natural-route.test.ts S7_WEEKS=20
s7run "$T" candidate smoke-c-diag  zz-s7-decide-diag.test.ts  S7_WEEKS=20
s7run "$O" old       smoke-o-diag  zz-s7-decide-diag.test.ts  S7_WEEKS=20
s7run "$T" candidate smoke-c-po    zz-s7-player-only.test.ts  S7_WEEKS=4
s7run "$O" old       smoke-o-po    zz-s7-player-only.test.ts  S7_WEEKS=4
for f in natural-chain.jsonl rival-economy.jsonl weekly.jsonl; do cmp "$OUT/smoke-c-route/$f" "$OUT/smoke-o-route/$f" && echo "$f equal"; done
cmp "$OUT/smoke-c-po/player-only.cmp.json" "$OUT/smoke-o-po/player-only.cmp.json" && echo "player-only equal"
```

Every run must end `exit=0`. The four `cmp` lines must print "equal": no shelving happens before week 93 on this seed,
so through week 20 the two trees' chains and stripped digests must agree. If they differ, stop: the kit's premise fails.
Fix a probe error in the kit, re-copy (step 4), and re-run under a new smoke name.

## Step 6. The natural-route runs (1344-A §7 bullet 1; 1344-F; 1344-F3; controls c and d)

```bash
s7run "$T" candidate c-p13a-1        zz-s7-natural-route.test.ts S7_SEED=p13a-core-causal-01
s7run "$T" candidate c-p13a-2        zz-s7-natural-route.test.ts S7_SEED=p13a-core-causal-01
s7run "$O" old       o-p13a          zz-s7-natural-route.test.ts S7_SEED=p13a-core-causal-01
s7run "$T" candidate c-seedb         zz-s7-natural-route.test.ts S7_SEED=seed-b
s7run "$O" old       o-seedb         zz-s7-natural-route.test.ts S7_SEED=seed-b
s7run "$T" candidate c-ledger-p13b   zz-s7-natural-route.test.ts S7_SEED=p13b-s8-bridge-probe-01
s7run "$O" old       o-ledger-p13b   zz-s7-natural-route.test.ts S7_SEED=p13b-s8-bridge-probe-01
s7run "$T" candidate c-ledger-p13pub zz-s7-natural-route.test.ts S7_SEED=p13-public-commercial-adoption
s7run "$O" old       o-ledger-p13pub zz-s7-natural-route.test.ts S7_SEED=p13-public-commercial-adoption
```

- `p13a-core-causal-01` is 1329's route and the stalled route of 1344-A §1. `c-p13a-2` is the second run for control (d).
- `seed-b` is the chain of 21 C8 rows (cast-class 9, seating witness 12) and of three UNRESOLVED rows. The two ledger
  seeds are the chains of two UNRESOLVED family 12 rows. The C8 worksheet reads their first shelving and first divergence.
- Each run writes `natural-chain.jsonl` and `rival-economy.jsonl` (1329 formats), `weekly.jsonl` (per tick: stripped-state
  digest and each rival's account digest), `s7.json` (§7 measures, events, control (c) entries) and `final-state.json`
  (key-sorted JSON of the state at tick 520).
- Exit 1 with an `integrity` message means the probe's own model of the chain broke (receipts not append-only, a shelved
  entry gone without a greenlight). The outputs are written first; stop and report it.
- A crash leaves its run directory (possibly empty), and `s7run` refuses the name. Keep it as evidence and free the
  name, because `compare.py` and `check.py` read fixed names:
  `mv "$OUT/<run>" "$OUT/failed-<run>-1"; mv "$OUT/<run>.log" "$OUT/failed-<run>-1.log"`.

Durations: 1329 recorded none, and no record times a 520-week chain. The nearest records: the 130-tick natural-route
leaves took 2.5-4.4 s each with their file alone (1344-E §4); the genesis-to-93 mint took 5.06 s (1344-P2 MANIFEST
`elapsedMs`). Each probe prints its own duration (`ms` on the `S7 natural-route` line); copy them into the report.

## Step 7. The decide-diag runs (1329-A :38)

```bash
s7run "$T" candidate c-diag zz-s7-decide-diag.test.ts S7_SEED=p13a-core-causal-01
s7run "$O" old       o-diag zz-s7-decide-diag.test.ts S7_SEED=p13a-core-causal-01 S7_WEEKS=216
```

`o-diag` stops at tick 216 because 1329's recorded rows end at week 215; it is the diag's anchor. `c-diag` runs 520
weeks; its `stateAtEndSha256` must equal `c-p13a-1`'s `finalStateSha256` (the spy did not perturb the chain). Each
evaluation costs four package searches here (chooser, mirror, self-check, decide's own re-search), so this is the
longest run of the kit.

## Step 8. Control (b): player-only campaigns

```bash
s7run "$T" candidate c-player-only zz-s7-player-only.test.ts
s7run "$O" old       o-player-only zz-s7-player-only.test.ts
```

## Step 9. Remove the probes from both trees

```bash
for D in "$T" "$O"; do rm -f "$D"/tests/zz-s7-*; git -C "$D" status --porcelain; done
```

`git status` must list no change to a tracked file.

## Step 10. Compare, check the controls, fill the worksheet (light; no vitest)

```bash
python3 "$K/probes/compare.py"    # out/compare.json
python3 "$K/controls/check.py"    # out/controls.json
python3 "$K/c8/worksheet.py"      # out/c8/worksheet.md and .json
```

## Step 11. How to read the outputs and compare with 1329

Read in this order.

1. **Anchors** (`compare.json` `anchors`).
   - `naturalChain_old_vs_1329` and `rivalEconomy_old_first31_vs_1329`: the old tree reruns 1329's own probe code on
     1329's source, so both must be EQUAL.
   - `decideDiag_old_vs_1329`: the spy-based diag against 1329's patched rows (r01 and r02, weeks 103-215). Every field
     except `employees` must match; `cash` and `reserve` may differ by 1.
   - `decideDiag_candidate_unperturbed` must be EQUAL.
   - A DIFFERENT anchor goes first in the report, and every statement that compares the candidate with 1329 carries it.
     1344-D5 (defect C1) required the same anchor of the S10 probes.
2. **1329's numbers against the candidate** (`compare.json` `p13a`). 1329-A recorded at 133aca7a, 520 weeks:
   - rivals author 26 promises at week 196 (24 APPEARANCE_COUNT, 2 DIRECTING_COUNT);
   - none is SATISFIED through week 520, and 7 are BROKEN at 416;
   - `firstRivalOpen` 196, `firstRivalSatisfied` -1, `firstShared` -1;
   - `firstTakes` 45 and industry films 53 from week 140 to 520;
   - rival economy to week 300: r01 and r02 hold two ready screenplays and $17-20M, and r01 reaches -$1.4M by week 300;
   - decide-diag: 54 candidates per screenplay, all unviable; best contributions -$180,586 (r01 script-0006) and
     -$115,976 (r01 script-0011).

   Put each value beside the old run's (it must equal 1329's) and the candidate's.
3. **Per studio** (`compare.json` `p13a.studios`; source: `s7.json` `studios`). For each rival:
   - cash at week 520 (the 10-week series is in `s7.json` `series` and `rival-economy.jsonl`);
   - films, `firstTakes`, shelvings with weeks;
   - retries that changed state: viable (greenlit) and economic rejection (`retryWeek` advanced). Cash-blocked retries
     come from `c-diag` rows with `retry: true`; staffing-blocked retries cannot be observed (NOTES.md item 1);
   - after the first shelving: the first announcement, first take and first release at or after its week.
4. **1344-F additions.** `industryFilms` gives both readings of "industry films after week 140" against 53: films at
   week 520, and films added from week 140. `shelvingsPerYear` (year = floor(week / 52)) and
   `maxShelvingsInAny52Weeks` (1344-F Amendment 3 bounds this at four by law) give shelvings per studio per year.
5. **1344-F3 movements** (`compare.json` `seeds.<seed>.divergence`).
   - `firstDifferentTick` should equal the first shelving's processed week plus one. On p13a F3 expects r01
     `script-0006` at week 93, so tick 94.
   - `movementsBeforeFirstShelving` must be empty; a row there is an unattributed movement.
   - Every row of `movements` and `promiseMovements` is a natural-route movement. Attribute each one, using
     `sameStudioLawEventsAtOrBefore` and the candidate diag rows: which evaluation, which outcome, which best
     contribution.
   - A movement at a studio with no law event of its own (talent market or promise effects) is attributed through the
     event that moved it, or flagged.
6. **Controls** (`controls.json`). PASS, FAIL or MISSING, each with its evidence. A FAIL is a finding, reported with
   the entries listed under `failing`.
7. **C8 worksheet** (`out/c8/worksheet.md`). Fill attribution and cause per row, as [c8/PLAN.md](c8/PLAN.md) describes.

## Step 12. Cleanup

```bash
for D in "$T" "$O"; do for l in docs node_modules art tools tests/fixtures; do rm "$D/$l"; done; done   # links only
rm -rf "$T" "$O"
```

`rm` on a link path without a trailing slash removes the link, never its target. `out/` stays as the record.

## Report template (the §7 record)

```markdown
# 1344-<id>: §7 verification of rival screenplay shelving (D-1329-1) on <C_SHA>

No thresholds are specified: report, attribute, flag the rest to the Owner.

## 1. Run identity
- Candidate <C_SHA>, src tree <hash>; old source ff803032, src tree <hash>, equal to 133aca7a (out/trees.txt).
- Kit: out/kit-sha256.txt. Trees built by build-trees.sh; probes copied as tests/zz-s7-*, removed at step 9.
- Machine quiet at every step (pgrep). Table: run, exit, duration (from each log), outputs.

## 2. Anchors
- natural chain, old against 1329: EQUAL | DIFFERENT (first line ...)
- rival economy, first 31 lines: ...
- decide-diag, old against 1329 (r01, r02, weeks 103-215): rows matched, mismatches
- decide-diag on the candidate does not perturb the chain: ...

## 3. The measured stalled route (1344-A §7 bullet 1), p13a-core-causal-01, 520 weeks
| Rival | cash 520 (old / cand) | films | firstTakes | shelvings (weeks) | retries viable / rejected / cash-blocked | first announce, take, release after first shelving |
1329 values beside old and candidate: promises authored, outcomes, firstRivalOpen / Satisfied / Shared, firstTakes,
films, r01 and r02 at week 300.

## 4. 1344-F additions
- Industry films after week 140 against HEAD's 53: films at 520 = <n>; films added from week 140 = <n> (HEAD: 53, 0).
- Shelvings per studio per year (floor(week / 52)) and the most in any 52 weeks (law bound 4).

## 5. Natural-route movements from week 93 (1344-F3)
- Per seed: first different tick, first shelving, accounts at that tick, movements before the first shelving (must be none).
- Movement table: week, studio, kind, id, added or removed, attributed law event, evidence (receipt, diag row).

## 6. Controls
- (a) Test 3's HEAD-equality run: what it compares (controls/a-test3.sh), result.
- (b) Player-only saves: both corpus routes byte-identical across trees; V43 save differs from V42 only in its stamp;
  the player in rival worlds: no shelving receipt, no shelving key.
- (c) No refund or ledger movement at shelving: first shelving per seed exact across trees; every shelving's checks.
- (d) Determinism: c-p13a-1 against c-p13a-2, five files byte for byte, including the key-sorted final state.

## 7. The 42 C8 rows, the C1 row and the 7 UNRESOLVED rows
Counts by candidate status; rows whose primary changed; rows that pass; rows still failing with their cause
(worksheet attached). No test was changed and no hiring was forced.

## 8. Recorded gates
Core and UI, attributed against 1338 and 1343: the sweep's recorded gates <record ids>. This kit runs no gate.

## 9. Flags to the Owner
Measured behaviour with no threshold (for example retries that never succeed, shelved lists that only grow, negative
rival cash), and the open items of NOTES.md that the parent has not ruled on.
```
