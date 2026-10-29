# Sprint 19 — portable saves (2026-10-29, 11:05 to 12:35 CDT, CLOSED)

Decision D (../ENTRY.md); the diagnosis and direction are ENTRY.md in this folder. Candidate 53ef65a2, then FIX-1 edb1cee4 (review items, REVIEW.md) on p18-season-20261028 (parent 61c858b9, the Sprint 18 checkpoint), both pushed. Checkpoint: edb1cee4, tag p18-sprint19-checkpoint-20261029 (pushed).

## What changed for the player

- A save written in Chrome loads in the Node runtime and a save written in Node loads in Chrome: the shared-market law now prices through engine-independent arithmetic (era `p15a1-market-v3`), and the records older engines wrote (`p15a1-market-v1`, `-v2`) are accepted when their factor sits within one ULP of the recomputation (only where the law found pressure); everything else in a save still reconciles exactly, and every row must name its week batch's law.
- A rejected import names its cause and says the current studio is unchanged and to keep the file.

## Evidence

| Item | Result |
|---|---|
| Red at the predecessor | the retained measurement (playtest-response/lane/measure-r3/save-cost.json at 6da4206a): the Owner's P18 save REFUSED by Node, "factor does not reconcile with p15a1-market-v2"; the first run of the market test files on the candidate (local/astra19-core-r1-red-expectations.json): 8 failures, of which 6 are era pins in the three p15a1 tests ("live is v2", "table holds v1 and v2", "unknown id v3") and 2 are the new test's validator call (the whole-save validator is the right entry; fixed in the test) |
| Portable arithmetic (local Node measurement, 57,143 samples over the market domain) | max deviation from Math.exp 1.00 ULP, from 2 ** y 1.00 ULP; exact at exp(0), 2^0, 2^−1, 2^3; the Owner-save row: Node 0.9743392133333504, portable 0.9743392133333504, Chrome's stored 0.9743392133333503 |
| Core tests at the candidate (local/astra19-core-r2-green.json) | astra19-portable-market 6 of 6, p15a1-shared-market 33 of 33, p15a1-market-integration 54 of 54, p15a1-market-retune 8 of 8 (the era expectations derived from the v3 rule) |
| Owner's Chrome-written P18 save in Node (local/owner-p18-portability-local.json, read in place, never copied) | IMPORTED (was REFUSED): Save 51, week 428, 72 assessments all v2, import 509 ms, re-export 2,014,848 bytes, reload byte-identical, three-week continuation identical from the original and the reloaded state (week 431) |
| Owner's P17 cameo save in Node (local/owner-p17-portability-local.json) | IMPORTED: Save 51, week 1872, no assessments, reload byte-identical, three-week continuation identical |
| Chrome portability journey (local/astra19-e2e-r1-green.json; installed Google Chrome) | 1 of 1, 47.6 s: the Node-built season world imported through the Start screen, re-exported byte for byte, two real weeks advanced in the page, the page's export equal to Node's own two ticks, those Chrome-written bytes imported in Node (week 430), then imported again in the page (save and reload) |
| `npm run -s typecheck` | exit 0 |
| Lane sprint19-r1 (studio-scratch/astra-20261029/sprint19-r1, bound 53ef65a2; lane/sprint19-r1/) | 11:57:30 to 12:01:41 CDT: root and ui typecheck 0; focused core 10 files 152 of 152 (market, save-step, commission, season witnesses, rights desk); p12 campaign-library file measured once ALONE (below). The script then ended on a staging error (an undefined HEAD variable in the owner-save stage lines under `set -u`); the unreached stages run in sprint19-r2 |
| p12 single measurement (tests/bridge-p12-campaign-library.test.ts alone, 53ef65a2, lane/sprint19-r1/p12-alone.json) | 13 leaves, 7 passed, 6 failed, all six "Test timed out in 5000ms" on the R05 named-campaign-transaction leaves that declare no larger budget; 9 leaves over 5,000 ms, the slowest passing leaf 8,162 ms (it declares its own budget), none over 20,000 ms. Unchanged inherited timing failures (the Sprint 14 qualification already recorded this file's leaves as not timing-qualified alone); no budget changed, no waiver, no shared bottleneck demonstrated by this run |
| Lane sprint19-r2 (studio-scratch/astra-20261029/sprint19-r2, bound 53ef65a2; lane/sprint19-r2/) | 12:02:51 to 12:05:53 CDT, exit 0: the Owner's Chrome-written P18 save IMPORTED in Node under the lane's own binding (Save 51, week 428, 72 v2 assessments, import 417 ms, reload byte-identical, three-week continuation identical to week 431; owner-p18-portability.json); the P17 cameo save IMPORTED (week 1872, continuation identical); focused ui 5 files 60 of 60; three Chrome journeys pass (portability, P18, smoke); integrity 0 |
| Independent review of 53ef65a2 (REVIEW.md) | ACCEPTABLE WITH FIXES, no blocker: the allowance was four to eight ULPs not two to four and covered the stock term needlessly; a forged factor at zero pressure passed; stale comments; Start screen copy; missing tests. All fixed in FIX-1 edb1cee4; the relabel test it asked for exposed that a row relabelled inside a batch priced under another era slipped through, now refused by name |
| FIX-1 at edb1cee4 (local) | market and save-step core files 117 of 117 (local/astra19-core-r4-fix1-green.json; the relabel red first, local/astra19-core-r3-fix1-red-relabel.json), save ui files 54 of 54, Chrome portability journey 1 of 1 with the page reload (local/astra19-e2e-r2-fix1-green.json), typecheck 0 |
| Lane sprint19-r3 (studio-scratch/astra-20261029/sprint19-r3, bound edb1cee4; lane/sprint19-r3/) | 12:20:12 to 12:27:57 CDT, exit 0: typecheck 0; focused core 10 files 143 of 143; the Owner's Chrome-written P18 save IMPORTED in Node (reload byte-identical, three-week continuation identical) and the P17 save likewise; focused ui 5 files 60 of 60; three Chrome journeys pass; integrity 0 |

## Claims

- LANDED: portable arithmetic, era v3, the one-ULP sealed-era factor allowance, the batch-law check, Saves and Start screen copy, source-bound at edb1cee4; reviewed and fixed; lane r3 exit 0; checkpoint tag p18-sprint19-checkpoint-20261029.
- MEASURED: the Owner's actual Chrome-written save in Node; a Node-built save in Chrome with an identical two-week continuation; Chrome bytes back in Node. Not claimed: every browser or operating system (Chrome 150 on macOS 12 and Node 20.20.2 only).
- PRESERVED: monetary fields, identities, recorded transactions and the v1/v2 rows' own numbers; no relabelling; a v3 save refuses by name on an older build.
- DEFERRED: the full core gate, to the Sprint 21 integration milestone (the market change is validator- and era-scoped; the market, save-step, season and rights-desk files ran).
- NOT CLAIMED: timing qualification of the p12 file (its declared budgets stand; the measurement is recorded, not a waiver); Owner acceptance; promotion to main.
