# Playtest-response measurements (decisions 3b, 4c, 6b) — 2026-10-28, 21:00–21:12 CDT

Engine b3c179b0 (projection 68, Save51), node v20.20.2, the 2-core host, each run in the lane (lane/ holds SELECTION.json, the scripts and the outputs). Read-only on the tree; no test budget involved.

## 3b — save cost on a played campaign (lane/measure-r3, measure-r4)

The Owner route saves are the only operated worlds at hand. The P18 world (week 428) was written by Chrome and Node refuses it (`validateSaveV45: sharedMarket assessment … factor does not reconcile`): the decision 5 limitation, measured live. The P17 cameo world (week 1872, operated to that week by the route) was probed as exported, then ticked idle (no player action) with the probe at 2000 and until the player closed.

| World | Week | Save bytes | makeSave | validateSaveV51 | exportSave | Cash |
|---|---|---|---|---|---|---|
| p17 cameo world as exported | 1872 | 453,449 | 34.7 ms | 20.6 ms | 35.2 ms | 19,873,344 |
| idle to 2000 (128 ticks, 28.0 ms each) | 2000 | 2,141,830 | 194.2 ms | 100.6 ms | 160.1 ms | 3,661,376 |
| idle until the player closed (189 ticks) | 2061 | 2,765,067 | 195.4 ms | 188.2 ms | 265.8 ms | −4,064,640 (closed) |

Growth is about 13 KB per idle week, almost all of it the rival/industry history: of the 1,688,381 bytes added by week 2000, `state.hollywood` grew 1,285,377, `rights` 127,174, `sharedMarket` 56,922, `relationships` 50,680 (lane/measure-r4). At that rate the 8 MiB browser import ceiling (SAVE-11) is crossed near week 2,450 of continuous play; this operated-then-idle studio closed at 2061. Reading: save size and save time at the weeks a played campaign reaches (1,000–2,000) are 0.5–2.8 MB and under 0.3 s per save; the 45–60 MB figure belongs to the deferred-closure arm at 6,240+ weeks (decision 2b: engine stress evidence only). Recommendation under 3b: no performance slice before promotion; carry the rival-history growth rate and the ceiling estimate as a known limit, and treat a history-compaction slice as a later bounded item.

## 4c — rival cash trajectories after cost-cutting entry (Sprint 14 harness files, read offline)

Source: studio-scratch/sprint14-20261028/harness-r2/out/{rival,campaign}/*.rivals.jsonl (per-rival weekly samples from the Sprint 14 natural routes: cash, reserve, operating cost, cost-cutting entry, greenlights, releases, closure). Every rival that entered cost-cutting on any seed (p15a1-w2-market-01: 9 of 9 rivals; p13a-core-causal-01: 9 of 9; seed-b: 4 of 9; p13-public-commercial-adoption: 3 of 5):

- entered with cash ABOVE its reserve (for example 4,315,794 against a 1,243,541 reserve; 6,932,787 against 1,778,670), so entry is not a cash-shortage trigger (hollywoodTick.ts `rivalCostCuttingEntry` reads the decision facts: no greenlight or commission this week, no script work, indexed outcomes);
- then greenlit nothing and released nothing ever again (greenlights +0, releases +0 in every one of 25 cases);
- burned its weekly operating cost (84–136 K) from the entry week until cash reached about −2 M, and closed 90–200 weeks after entry (every case);
- never left cost-cutting: the only exit in the code is a committed corporate loan (corporateConditionLive.ts, 1366-O O6), which no rival takes on these routes.

Rivals that never entered cost-cutting released 40–829 films and ended with 17 M to 4.9 B in cash. Reading for the Owner: this is not starvation and not a stuck state in the sense of a deadlock; it is a one-way mode by design on the current tree: a rival that stops greenlighting for the entry condition's reasons has no producer that resumes greenlighting and no exit other than a loan it never takes, so entry is terminal. Decision 4a (an exit rule when cash and the index recover, or a loan the rival actually takes) versus 4b (accept) is the Owner's; the coordinator recommends 4a as a bounded design slice because every measured entry ends in closure within ~150 weeks regardless of cash at entry.

## 6b — what the eleven p12 campaign-library timeouts spend their time on (lane/measure-r1)

One case ("keeps the shipped Save route and save-before-load consistent", 6.1 s alone against 5,000 ms) replicated step by step under `node --cpu-prof` (lane/measure-r1/p12-profile.ts, p12-case.cpuprofile). Wall time by step under the profiler: createBridgeRuntimeCoordinator 3,503 ms; load with save 3,838 ms; load 1,989 ms; advance 1,691 and 1,944 ms; saveAs 1,075 ms; snapshot 588 ms; dispatch save 521 ms (15.5 s total under the profiler). Self time: `BridgeSchemaError` construction 4,884 ms of 21,653 ms sampled (23%), `project` (bridge/schema/runtime.ts) 2,189 ms, garbage collector 1,135 ms, stableStringify `build` 864 ms, `nonFiniteNumberTail` 553 ms. Inclusive: `snapshot` 5,212 ms, `validateSaveP18` 2,484 ms, `loadBridgeRuntimeCheckpoint` 1,346 ms, `importSave` 1,132 ms, `makeSave` 1,072 ms.

Cause: the schema runtime probes every `oneOf`/`anyOf` alternative by projecting it and catching the thrown `BridgeSchemaError`; a discriminated union of N members throws N − 1 errors per value, each with a stack capture (12 µs with a stack against 4 µs without, err-bench). Repair (6b, in the slice): `firstRefusal` in runtime.ts replays `project`'s checks without throwing before an alternative is projected, with identical messages by construction. The eleven cases are measured alone after the repair in focused-r1; budgets unchanged. If they still exceed their budgets, the Owner's 6a exception is the fallback the ruling names.

### 6b after the repair (lane/focused-r1 on bab5f462, lane/measure-r5 on 6a846c99)

bridge-p12-campaign-library alone, same host, budgets unchanged (5,000 ms; two cases 20,000 ms):

| Case | alone-r7 (e115be4b) | focused-r1 (bab5f462) |
|---|---|---|
| catalogue-only rename (20 s budget) | 7,771 ms | 3,955 ms |
| catalogue-only delete (20 s budget) | 5,124 ms | 2,961 ms |
| shipped Save route and save-before-load | 6,121 FAIL | 5,276 FAIL |
| corrupted cross-world binding | 5,956 FAIL | 6,141 (passed: that case declares a larger budget) |
| saves atomically across the journal | 6,604 FAIL | 2,587 |
| branches CURRENT state, survives restart | 5,591 FAIL | 5,492 FAIL |
| failed writes, conflicts, stale targets | 8,443 FAIL | 5,142 FAIL |
| exact delete/overwrite confirmation | 6,650 FAIL | 5,487 FAIL |
| imports old checkpoints | 5,211 FAIL | passed |
| recovers legacy slots | 7,553 FAIL | 6,618 FAIL |
| branches a full journal | 5,997 FAIL | 4,000 |
| durably save dirty progress (20 s) | 22,449 FAIL | 7,410 |
| durably discard dirty progress (20 s) | 21,424 FAIL | 5,803 |

Eleven failing alone became five, over their 5,000 ms budget by 142 to 1,618 ms. The repeated profile (measure-r5) of the same case: 7,991 ms under the profiler (was 15,524); `snapshot` 944 ms inclusive (was 5,212); `project` 651 ms (was 2,189 self); `firstRefusal` 37 ms. What remains is the save cycle each campaign operation performs on the ~750 KB library (validateSaveP18 2,076 ms inclusive across the case, makeSave 1,009, importSave 935, stableStringify 800, the garbage collector 1,154) plus the coordinator's own world creation (createBridgeRuntimeCoordinator 2,849 inclusive). One further waste is visible but small: the era validators scan the raw save for non-finite numbers once per era layer (four walks of the same object per validate, `nonFiniteNumberTail`, 481 ms self); threading one scan through the chain would save about 5% of a case and would not bring the 6,618 ms case under budget. Reading under the ruling: the remaining cost is inherent to the library size and the validate cycle, so the five residual cases fall to 6a, an exception the Owner declares (the measured alone maxima: 5,276 / 5,492 / 5,142 / 5,487 / 6,618 ms; a per-leaf exception of 10,000 ms on these five, or on the file, would hold with the margin the other p12 cases already have). The agent did not change any budget.
