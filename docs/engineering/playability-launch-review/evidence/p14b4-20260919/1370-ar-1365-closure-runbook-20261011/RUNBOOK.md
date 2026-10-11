# 1370-AR: what must run after the 1365 retune lands before 1365 is closed

Compiled 2026-10-11 by a read-only research agent for the Claude integrator from the records and scripts named at the end. Nothing here ran. Paths: **E** = this evidence directory's parent (`docs/engineering/playability-launch-review/evidence/p14b4-20260919`), **S** = `/Users/zacheryspector/studio-scratch`, **R** = the live repository.

**No historical script runs unchanged on a post-1365 tree.** Each needs a revision and an independent review before it runs.

## Shared setup (as run historically)

- Node v20.20.2 via `export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH`. One heavy job at a time through `bash S/heavy-queue/lane-run.sh 0 <log> <cmd…>`.
- Test trees are `git archive` copies with `node_modules` linked to R's. If memory runs short use `NODE_OPTIONS=--max-old-space-size=5120`, never higher (8 GB machine).
- Disk: the recorded wrappers stop below 5 GiB free; HANDOFF sets a 3.5 GiB floor for heavy runs. On 2026-10-11 the machine had 2.2 GiB free after clearing user caches.

## 1. G2 again (1355-A §5 :181-208; 1361-F5 rulings 1-3; 1361-F2 ruling 4; 1361-F4 ruling 1; `E/1361-stage/g2/1361-G2-notes.md`)

- Command: `bash S/heavy-queue/lane-run.sh 0 S/1361-g2/g2-all.log bash S/1361-g2/run-g2-all.sh`. It builds trees, then runs smoke (40 weeks), control, candidate-1, candidate-2, K4, era-guard, and the report with `RED_JSON=S/1361-prod/x/r2c/p15a1.json`.
- Duration: 41 min on 2026-10-02 (control 11 min, each candidate about 10, K4 9).
- Inputs: seeds `p13a-core-causal-01` and `seed-b` (built as `p13aGeneratedStudio('seed-b')`, not `rivalFixture`), to week 6240. Read-outs at 520, 1560, 3120, 4680 and 6240; K3 starts from the control's week-520 save.
- Environment: the probe reads `PROBE_EXPECT/TREE_HEAD/WEEKS/SEEDS/OUT/K3_FROM`; the report reads `PROBE_CONTROL/CANDIDATE/K4/ERA_GUARD_JSON/RED_JSON`. RED_JSON is the vitest JSON of the three 1355 test files on the candidate. `run.meta` must start `start at <tag> <sha>,`.
- Outputs: `run/out/runs.meta` (every stage exits 0 except era-guard, which exits 1 by design), each run's `progress.txt`, `run/out/report/g2-report.{md,json}`.
- Breaks after 1365:
  - `1361-G2-trees.sh:33` expects the literal `SHARED_MARKET_FACTOR_MAX_PENALTY: 0.25,` and stops at `0.15,`.
  - The report hard-codes Save44 and Save45 (`report:20-21, :275, :383-384`).
  - The probe's `roleOf` (`probe:144`) treats any tree with a `sharedMarket` root as candidate or K4, so a current-era control is misread.
  - After the definition bump the old `market-definition-era-guard` leaf passes even with the penalty at 0, so the report (`:300, :316`) would call K4 a Defect. Point it at `market-retune-definition-v2` in `tests/p15a1-market-retune.test.ts`, whose failure names `factorMaxPenalty`.
  - S paths are hard-coded and the scripts refuse existing outputs: copy them to a new directory.
  - Still fine: the four `decide` call sites in `hollywoodTick.ts` pass the call-site check.
- Control: **not ruled.** It was an archive of e4be3e5c (1360-F2 ruling 6). 1360-F3 ruling 2 moves the control to "the new last writer" after a 1357-Q1 change, and 1363 is that change. The integrator must name it, most likely the commit just below the activation.
- Decision rule (fixed before the run; 1361-F5 ruling 1): only cumulative read-outs count, comparisons are on integers, worst band wins (Defect > Retune > incomplete > Flag > Proceed).
- **Stall trigger** = the rival-stall row reads Retune at any read-out on either seed: `10*c > 11*k` on rival stall weeks summed across rivals (c candidate, k control); or a new candidate stall streak of 52+ weeks overlapping no 52+ week control streak for that rival; or a rival that stopped for good (control's last filming week at least 52 weeks after the candidate's, or the candidate never films).
- History at 0.25: seed-b read Retune at all five read-outs (751 vs 668, +12.4%, 1 new streak, 2 stopped at week 520; -2.4% with 4 stopped at 6240).
- Routes: stall still Retune at 0.15 goes to the Owner (under the 2026-10-10 no-gates order this becomes a recorded integrator ruling); other Retune rows (industry gross below 0.90, or weeks below zero cash at `4*c > 5*k`) mean another delegated amendment, then G1 and G2 again; any K1–K5 failure is a Defect (production fix and a new G2).

## 2. Storage budget = G2's root/save row (1355-A:196; integrator ruling R-C defers the storage fix to this reading)

- Formula: `byteLength(stableStringify(state.sharedMarket)) / byteLength(exportCurrentState(state))` at each read-out (`probe:257-266`). At or under 0.02 proceeds; over 0.02 means a storage fix before Wave 3, not tuning (`report:190-191`).
- History at 0.25: seed-b 2.33 / 2.45 / 3.02 / 3.12 / 3.02%; p13a from 1.58% to 0.63%.
- The founding package's own test measures week 160 on other seeds (1.963% / 2.416%); that is not the ruled number. Rows would need to shrink to roughly 334–447 bytes from about 521.
- Week 8791 belongs to G-L's save timing (1361-F6 ruling 3), not to this budget.

## 3. G1 again (1355-A:178-180; 1355-X4; `E/1355-stage/g1/1355-G1-notes.md`)

- Command: `bash S/heavy-queue/lane-run.sh 0 S/p15-probes/out/both.lane S/p15-probes/run-both.sh`; inside, from `S/p15-probes/tree`: `PROBE_TREE_HEAD=<sha> PROBE_WEEKS=6240 PROBE_SEEDS=p13a-core-causal-01,seed-b ./node_modules/.bin/vite-node ../probe/1355-G1-probe.ts > ../out/g1.json 2> ../out/g1.err`. Smoke: 20 weeks, p13a only.
- Duration: 7 min 16 s (p13a 82 s, seed-b 352 s).
- Blocker: `1355-G1-probe.ts:169` throws on any `sharedMarket` root, which every tree since Save45 carries. G1 needs a reviewed revision (one option: an unpressured route with the 0.15 law passed explicitly; not ruled).
- Check: exit 0, one `done` line per seed, no WARNING, finalWeek 6240, `dueSetWitness.mismatchWeeks` 0, law and tuning showing v2 / 0.15.
- Bands: median ≥0.95 / ≥0.90 / below; p10 ≥0.85 / ≥0.80 / below; lowest genre mean ≥0.90 / ≥0.85 / below; share of releases at f ≤ 0.95 ≥10% or Flag. At 0.15 every factor stays above 0.85, so p10 and lowest-genre cannot read Retune; reaching f ≤ 0.95 needs pressure of at least 0.81 (was 0.45), so the "too weak to notice" Flag will likely widen.

## 4. d16 at the predecessor, at (c) and at (d) (1361-F4 ruling 2; 1361-F5 ruling 3; 1361-D2 finding F2)

- Scratch command: `bash S/heavy-queue/lane-run.sh 0 S/1361-d16/lane-d16.log bash S/1361-d16/run-d16-base-b-r2.sh` (calls `run-d16.sh <tag> <label>`: `vitest run --config src/harness/d16/vitest.d16.config.ts --no-cache --reporter=default --reporter=json --outputFile.json=…` in an archive tree; 4.5–6 min per tree).
- Recorded command: `bash E/1361-stage/land/recorded-1361.sh d16` from R with pre/post guards (HEAD equal to the fetched remote head, clean source, at least 5 GiB free); 4 min 20 s.
- Rule: 176 cases, 164 pass, exactly the 12 baseline failures with identical messages; any new or changed failure is a finding.
- **Commit (d) was never made** (no `p15a1-d-r1` tag; `driver.ts:1288` still passes no factor) although 1361-F5 ruling 3 says (d) rides with 1365. The integrator added it to the founding r4 round on 2026-10-11.
- The baseline's discovery tests already fail on an empty data set ("expected 0 to be greater than 50"), which hides F2's predicted failures at `driver.test.ts:62` and `:69`; a clean d16 result at (c) proves nothing about F2 by itself.

## 5. G-P and G-L again on (c)'s tree (1361-F ruling 13; 1361-GP-X; 1361-F2 ruling 5; trigger per 1359-F5 ruling 1)

- G-P: `S/1361-gp/run-1361-gp.sh <tag>`; smoke 3 s, full 6 min 40 s. G-L: `S/1361-gl-prep/run-1361-gl-natural.sh <40-hex HEAD> <leaf>`; 13 min 53 s.
- Both probes refuse a post-1365 tree (G-P refuses the `campaignLegacy` and `corporateCondition` roots; G-L requires `LIVE_SAVE_VERSION === 45`). Expectations must be re-fixed before the run, since with (c) active the market domain should read as recorded.

## 6. Other items before calling 1365 closed

- The amendment's own record and independent review: no `1365-*` record exists in E yet (1361-F5 rulings 3 and 5).
- The 45 declared leaves in `E/1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv` pass, with the guard removal visible in the diff (1361-F5 Amendment 1). Founding r3 independently reproduced 45/45.
- 1365's own sweep re-pins the S9 anchors (1361-F7 ruling 2); a mixed-era week must refuse by name (`marketIntegration.ts:230`; 1361-F4 ruling 5).
- The P15A.1 6,240-week normal and hostile harness does not exist yet (1361-F ruling 16); it closes P15A.1 but does not gate the landing.

## Sources

E records 1361-F5, 1361-F4, 1361-F2, 1361-F, 1361-F6, 1361-F7, 1361-G2-X, 1361-G2-F, 1361-D2, 1361-GP-X, 1361-M3, 1361-R, 1361-L, 1355-A, 1355-X4, 1355-F2, 1359-A, 1360-F2, 1360-F3, 1363-A, 1367-K, 1368-E; E stage files under `1361-stage/{g2,d16,gp-x,land,x-r3b}`, `1355-stage/g1`, `1367-stage/{1361-gl-prep,1361-land}`; S `heavy-queue/lane-run.sh`, `1361-g2`, `1361-d16`, `p15-probes`, `1361-prod`; R `src/harness/d16/{driver.ts,vitest.d16.config.ts}`, `src/core/{tuning.ts,hollywoodTick.ts,sharedMarket.ts,marketIntegration.ts}`, `tests/p15a1-market-integration.test.ts`.
