# Sprint 14 measurement harness: run recipe (ENTRY items 3 and 4)

Nothing here has run. The lane's first run is also the first import and runtime check (see NOTES.md, "Compile status").

## Files to copy into the worktree root

| File | Purpose |
|---|---|
| `measure-lib.ts` | Shared natural-route loop, read-outs, save probe, rebuild check |
| `campaign-measure.ts` | Item 3: p13a-core-causal-01 to 6240, seed-b to 8791 |
| `rival-recovery-measure.ts` | Item 4: p15a1-w2-market-01 to 6240, p13b-s8-bridge-probe-01 and p13-public-commercial-adoption to 520 |
| `operated-trial-312.ts` | Item 3, week-312 question: the 1367-K operated seed-b trial, Save51 port (two-line diff, NOTES.md) |

Follow the capture67 pattern. On the lane worktree, cut a throwaway snapshot branch from the settled candidate, copy the four files to the root and commit them (as b1726d14 did for capture67.ts). The run.sh verify block needs a clean tree whose HEAD is that snapshot. Create the run directory `S=/Users/zacheryspector/studio-scratch/sprint14-20261028/measure-r1` with `SELECTION.json`, `bind.py` and `launch.sh` copied from `p18-sprint13-20261028/capture67-r3` (change `D`/`S` and the purpose text), and this `run.sh`.

## run.sh

```bash
#!/bin/bash
set -u
export PATH="/usr/local/bin:$PATH"
X=/Users/zacheryspector/studio-scratch/p17-slice-red-20261027-wt
S=/Users/zacheryspector/studio-scratch/sprint14-20261028/measure-r1
cd "$X" || exit 9
. /Users/zacheryspector/studio-scratch/p16-c03-sprint1-20261025/p16-env.sh
[ "$(node --version)" = v20.20.2 ] || exit 9
python3 -I - "$S/SOURCE-MANIFEST.json" "$S/SELECTION.json" <<'VERIFY'
import hashlib,json,subprocess,sys
from pathlib import Path
sel=json.loads(Path(sys.argv[2]).read_text()); head=sel['head']
assert isinstance(head,str) and len(head)==40, 'binding pending'
G=['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks']
assert subprocess.check_output(G+['rev-parse','HEAD'],text=True).strip()==head, 'HEAD differs'
assert subprocess.check_output(G+['status','--porcelain'],text=True)=='', 'tree dirty'
m=json.loads(Path(sys.argv[1]).read_text()); assert len(m)==sel['sourceManifestEntries'] and len(m)>0
for name,expected in m.items(): assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==expected, name
VERIFY
[ "$?" = 0 ] || exit 9
[ ! -e "$S/USED" ] || exit 9
touch "$S/USED"
HEAD=$(git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks rev-parse HEAD)
mkdir "$S/out" "$S/out/operated" "$S/out/campaign" "$S/out/rival" || exit 9
fail=0
run() { local label="$1"; shift; [ "$(df -Pk . | awk 'NR==2 {print $4}')" -ge 3145728 ] || { echo "=== STOP runtime floor"; exit 9; }; local s; s=$(date +%s); echo "=== BEGIN $label"; date -Iseconds; "$@"; local rc=$?; echo "=== END $label exit=$rc elapsed=$(( $(date +%s) - s ))s"; date -Iseconds; [ "$rc" = 0 ] || fail=1; }
run operated312 sh -c 'set -C; exec env PROBE_HORIZON=520 PROBE_CEILING_MS=600000 node node_modules/vite-node/vite-node.mjs operated-trial-312.ts > "$1/result.json" 2> "$1/stderr.txt"' sh "$S/out/operated"
run campaign env CAMPAIGN_OUTPUT="$S/out/campaign" MEASURE_SOURCE_HEAD="$HEAD" node node_modules/vite-node/vite-node.mjs campaign-measure.ts
run rival env RIVAL_OUTPUT="$S/out/rival" MEASURE_SOURCE_HEAD="$HEAD" node node_modules/vite-node/vite-node.mjs rival-recovery-measure.ts
echo "=== CHECKPOINT exit=$fail"; exit "$fail"
```

The verify block and `run()` are capture67-r3's, unchanged. `PROBE_HORIZON=520` and `PROBE_CEILING_MS=600000` are the values the 1367-K trial wrapper passed. `set -C` makes the operated trial's stdout and stderr exclusive creates; the TypeScript drivers write every file with `wx` or `openSync(..., 'wx')`. Nothing writes into the worktree. `p16-env.sh` stays for lane uniformity; no harness reads its variables.

Optional: `RIVAL_ROUTES="seed:horizon,..."` (horizon 520 or 6240) replaces the rival list, for example to add `p13a-wait-control-01:6240`.

## Expected durations

Save51 has never run these routes. The Save45 figures below come from 1367-K (`1367-stage/gl-natural-r1/gl.err`, `gl.json`) and the 1367-K trial (`1367-stage/postrelease-trial-r1/run.json`).

| Step | Save45 figure | Expected on Save51 |
|---|---|---|
| operated312, 520 weeks | 47.2 s wall (43.8 s internal) | about 1 min |
| p13a default arm, to the player's closure | 12.1 s to week 1560 | under 30 s if the closure falls near week 1,300 to 1,600 |
| p13a deferred arm, to 6240 | 70.6 s of ticks | 1.5 to 3 min with probes |
| seed-b default arm, to the player's closure | 21.3 s to week 1560 | under 1 min |
| seed-b deferred arm, to 6240 | 318.3 s | 6 to 9 min |
| seed-b deferred arm, 6240 to 8791 | 422.2 s | 8 to 11 min |
| Three-sample save probes at 6240 and 8791 (seed-b) | medians 5.7 s and 10.9 s per pair | about 20 s and 40 s, plus export |
| One-sample probes every 520 weeks | not measured at Save45 | about 2 min in total |
| Rebuilds: p13a to 6240, seed-b to 520 | 70.6 s and 10.7 s | about 1.5 to 2 min |
| campaign total | | about 20 to 35 min |
| rival total (p15a1-w2-market-01 to 6240 in up to two arms, two 520 routes, three 520 rebuilds) | no Save45 natural 6240 timing on record for p15a1-w2-market-01 | about 4 to 12 min |

Each seed runs its deferred arm only when the default arm stops early, so a seed whose player never closes runs once. The expected Save51 numbers are estimates. No run.sh line sets a timeout, matching capture67-r3; if the coordinator wants an outer cap, 90 minutes for the whole run leaves room.

Peak memory follows 1367-K's seed-b 8791 state (a 41.3 MB save), which ran on this Mac at Save45. Outputs total a few tens of MB; no save file is kept.

## Output layout

```
out/operated/result.json     the probe's own stdout JSON (written before its non-qualification throw)
out/operated/stderr.txt      "postrelease weekN, filmsM" every 52 weeks, then any error
out/campaign/CAMPAIGN-RECEIPT.json
out/campaign/<seed>.<arm>.campaign.jsonl      one row per 520 weeks, the horizon and the stop week
out/campaign/<seed>.<arm>.rivals.jsonl        rival rows: every 10 weeks to 520, every 520 after, the stop week, and any week with a cost-cutting change, condition event, loan or closure
out/campaign/<seed>.<arm>.rival-summary.json  per rival: episodes, first events after cutting entry, terminations, refunds, loans, condition events, closure, annual money by kind
out/rival/RIVAL-RECEIPT.json and the same three files per seed and arm
```

Seeds in `out/campaign`: `p13a-core-causal-01`, `seed-b`. Arms: `default` always, `closure-deferred` when `default` stopped at the player's actual closure.

Each campaign row holds: week; player cash, condition stage, closure week, releases (total, 312 to 519, from 312, after 2040), contracts, productions; rivals total, alive, closed, closure-due-not-closed, in cost cutting; industry `filmReleased` receipts by studio; counts of the rights, franchises, cameos and television roots; tick time (interval sum, interval maximum, route cumulative); official Legacy hash and end-of-run presence; save bytes, sha256, makeSave and validateSaveV51 times with medians.

## Exit codes

| Step | 0 | 1 |
|---|---|---|
| campaign, rival | Receipt written, rebuild bytes identical. Findings sit in the receipt and as `FINDING` lines on stderr. | `DETERMINISM-MISMATCH` receipt, or a thrown error with no receipt (partial jsonl rows kept) |
| operated312 | Trial qualified | With `result.json` present and "did not qualify" on stderr: the measured 1367-K outcome. Without `result.json`: an execution error, for example a closure/v1 refusal if the player closed, or a Save51 incompatibility in the unchanged policy |

An operated312 exit 1 therefore sets `CHECKPOINT exit=1` even when the measurement succeeded. Read `result.json` before classifying it.

## How each receipt maps to ENTRY.md

### Item 3, natural long campaign

| ENTRY clause | Read it from |
|---|---|
| Save51 era with rights, continuations and TV present | `CAMPAIGN-RECEIPT.json` `saveVersion` 51 and `sourceHead`; `eraRoots` in each campaign row shows which roots hold rows on the natural route (the route itself issues no rights, continuation or TV command) |
| Existing seed routes: seed-b to 6240, the default route | `seeds[].arms[]`: `finalWeek`, `findings` |
| Releases, cash, save size, makeSave and validate times | campaign rows: `player`, `industryFilmReleasedReceiptsByStudio`, `save` |
| Compare with 1367-K | The table below |
| Compare with 1368-C | 1368-C measured a different route (unengaged seed-b, delayed paid activation at 6240). Its 6240 save (33,033,972 bytes; makeSave median 4,204 ms; validateSaveV45 median 1,832 ms) is a size reference only. ENTRY puts re-running 1368-C out of scope, so no post-2040 player release is produced here |
| Release after week 312 | `out/operated/result.json`: `recentReleases` (releases with releaseTick 312 to 519), `trialQualified`, `replacementHires`, `checkpoints`, `refusals`. The natural routes report `releasesWeek312to519` as a structural zero |
| Post-2040 behaviour holds | seed-b deferred arm rows at 6240 and later: `legacy.officialFrozen`, `legacy.officialSha256` unchanged through 8791 (a change raises a FINDING), rivals alive and closed, save growth, tick time |
| No cash, no controller fix | `routeActions` in both receipts; operated-trial-312.ts diff in NOTES.md |
| Deterministic replay | `seeds[].determinism.rebuild` (asserted) and `armsAgree` (reported) |

| 1367-K Save45 figure | Save51 field |
|---|---|
| Default route to 6240: 70,637 ms | p13a `closure-deferred` campaign row at 6240, `ticks.routeTickMs` (or the `default` arm if the player never closes) |
| seed-b to 6240: 318,305 ms | seed-b row at 6240, `ticks.routeTickMs` |
| seed-b 6240: 33,541,463 bytes; makeSave median 3,903.865 ms; additional validation median 1,555.147 ms | seed-b row at 6240, `save.bytes`, `save.medianMakeSaveMs`, `save.medianValidateSaveV51Ms` |
| seed-b 8791: 41,261,217 bytes; 7,859.726 ms; 2,737.762 ms | seed-b row at 8791, same fields |
| seed-b to 8791: no player releases, official Legacy unchanged | seed-b row at 8791, `player.releases`, `legacy.officialSha256` against the 6240 row |
| seed-b 8791 player cash −111,865,000, operations managed | seed-b row at 8791, `player.cash`, `player.operationsMode`, plus `player.conditionStage` (closure due on the deferred arm) |

1367-K timed its route without per-checkpoint sampling; this harness keeps rival reads and save probes outside the tick timer, so `routeTickMs` compares like with like. The extra tick time on Save51 includes the P15B to P18 laws.

### Item 4, natural rival recovery and closure

| ENTRY clause | Read it from |
|---|---|
| Verify the 1363-V kit's final-source state first | NOTES.md, "The 1363-V kit" |
| Cash | rivals rows: `cash`, `reserve`, `cashMinusReserve`; summary: `minimumCash`, `minimumCashWeek`, `firstNonpositiveWeek`, `sampledFirstBelowReserveWeek`, `sampledFirstBackAtReserveWeek` |
| Recurring costs and remaining overhead | rivals rows: `weeklyOperatingCost`, `payroll`, `facilityOpex`, `remainingOverhead`, `headcount`, `moneyByKindToDate`; summary: `terminations[].weeklySalaryAvoided`, `annualPeriods` |
| Cash received once | summary: `refunds` (facility disposal), `loans` (principal, total, installments); `moneyByKindToDate.loanPrincipal` |
| Resumed production | summary: `cuttingEpisodes`, `firstAfterFirstCuttingEntry` (hire, commission, greenlight, firstTake, release, revenue; absent means none within the horizon), `greenlightWeeks`, `longestWeeksWithoutGreenlight` |
| Closure | summary: `closure`, `closureDueNotClosed`, `conditionEvents`; campaign rows: `rivals.closed`, `rivals.alive` |
| A measured non-recovery is a finding | summary: `dormantSurvivor` (entered cutting, never closed, no greenlight after entry), and any rival whose `firstAfterFirstCuttingEntry.greenlight` is absent |
| Routes and seeds of 1363-A §6.1 | p13a-core-causal-01 and seed-b from `out/campaign` (one pass serves both items); p15a1-w2-market-01, p13b-s8-bridge-probe-01, p13-public-commercial-adoption from `out/rival` |
| Charter §6.3 (d) determinism | `seeds[].determinism` in both receipts |
