# 536 — B4 non-replay owner-integration state on the qualified checkpoint

2026-09-20. Claude Code parent. One fixed-source run of the eleven non-replay P14B.4 groups on
clean HEAD `69d16f88c360cbb96c3e9bb9b33d1ee21ff2349b` (record-check, protected patch empty
`e3b0c442…b855`, no untracked source, fixedSource:true, 16:43:47.206–16:46:10.009Z, exit 1,
node v20.20.2). Nothing in source, tests, fixtures, caps or validators changed. Purpose:
establish where the live P2 scope (class-aware capacity, policy, outcomes, Save30, projection
47, bridge) stands after the replay slice 535, before choosing the next bounded task.

## Results (193 cases: 110 PASS, 83 FAIL, 6 files failed, 5 passed)

| File | Result |
| --- | --- |
| `tests/p14b4-capacity-kernel.test.ts` | 41 PASS |
| `tests/p14b4-material-evidence-core.test.ts` | 17 PASS |
| `tests/p14b4-d3-matching.test.ts` | 8 PASS |
| `tests/p14b4-kernel-hold-order-extension.test.ts` | 5 PASS |
| `tests/p14b4-bounded-stable-sort.test.ts` | 7 PASS |
| `tests/bridge-p14b4-cast-class.test.ts` | 12 PASS / 16 FAIL |
| `tests/p14b4-cast-class-capacity.test.ts` | 0 / 15 FAIL |
| `tests/p14b4-cast-class-policy.test.ts` | 4 PASS / 3 FAIL |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 2 PASS / 4 FAIL |
| `tests/p14b4-cast-class-outcomes.test.ts` | 0 / 23 FAIL |
| `tests/p14b4-save-v30-compatibility.test.ts` | 14 PASS / 22 FAIL |

## Failure reasons as printed (83 `→` lines, grouped by the parent from the raw output)

| Count | File | Reason |
| ---: | --- | --- |
| 21 | save-v30-compatibility | `expected { saveVersion: 29, …(3) } to deeply equal { broadcastCache: [], …(3) }` |
| 1 | save-v30-compatibility | `expected 29 to be 30` |
| 12 | cast-class-outcomes | `expected 29 to be 30` |
| 9 | cast-class-outcomes | `UNEXECUTED natural rival prerequisites absent by 350: actual bound OPEN roots in each cast slot AND genuine tagged eligible take required; no synthetic substitute` |
| 2 | cast-class-outcomes | `expected { promiseId: 'promise-0', …(15) } to match object { version: 4, contractId: null, …(2) }` |
| 8 | cast-class-capacity | `validateSaveV29: state.promises[n].predicate.kind is not a field of this record` (n = 0, 1, 2) |
| 7 | cast-class-capacity | `expected 3 to be 4` |
| 9 | bridge-cast-class | `Command envelope is invalid: $: matched no allowed type ($.draft.conceptId …)` |
| 2 | bridge-cast-class | `expected { priorityOrder: [ …(6) ], …(2) } to match object { …(2) }` |
| 2 | bridge-cast-class | `expected false to be true` |
| 1 | bridge-cast-class | `expected { ok: true, quote: { …(7) } } to match object { ok: false, …(2) }` |
| 1 | bridge-cast-class | `expected { disclosure: 'own', …(8) } to match object { Object (disclosure, promise) }` |
| 1 | bridge-cast-class | `expected 'IMPOSSIBLE' to be 'REASONABLY_ACHIEVABLE'` |
| 2 | bridge-cast-class | own/private/public carriers (two 480 ms cases; reasons in the Failed Tests section) |
| 2 | runtime47-compatibility | `expected null to be 4` |
| 1 | runtime47-compatibility | `expected 46 to be 47` |
| 1 | runtime47-compatibility | `expected "spy" to be called 1 times, but got 0 times` |
| 3 | cast-class-policy | `expected { count: 1 } to deeply equal { kind: 'castRoleCount', …(2) }` ×2; `expected { family: 'APPEARANCE_COUNT', …(7) } to deeply equal { …(8) }` |

The counts above are the parent's grouping of the printed reasons only. They are consistent with
the recorded boundaries (23: strict live V29 refuses `predicate.kind`; pure-read helper stops at
rulesVersion 3 vs 4; 29/30/31: 22 unselected future live-writer cases at LIVE_SAVE_VERSION 29;
projection 46 vs 47), but this record does not classify each case by its true stop point. That
classification and the implementation map are the two READ-ONLY specialist tasks 537-A
(sim-core) and 537-B (test-author), dispatched after this run; their verbatim reports and the
adopted next slice will be recorded as 537.

## What this run does and does not establish

- The detached kernel, the material-evidence core, D3 matching, hold-order extension and the
  bounded stable sort remain GREEN on the qualified checkpoint: 78 cases, no regression from
  the 517+526 replay change (which touched only `src/core/promiseCapacityOwnerReplay.ts`).
- The 83 failures are the pre-existing RED of the live P2 scope. None was introduced by 535;
  none is claimed as reached-assertion coverage until 537-B says which are.
- No live version, rules, schema or projection literal moved. No Owner-acceptance claim.
- The 515 §6 Owner / Current Ops decision item on the replay stale route is unchanged.

## Next (bounded)

537-A/B reports → parent adopts ONE RED-backed slice under the 26 live-cutover map's pure
staging boundary (or names why none is lawful yet) → independent review before any writer.
The replay runner-ups C1/C5/C6/C7 (515 §3) remain the alternative and are not started.
