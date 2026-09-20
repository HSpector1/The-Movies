# 560 — Enumerator slice implemented (T2) and checked on fixed source

2026-09-20. Claude Code parent. ONE sim-core writer implemented the enumerator slice against the
installed RED (record 558) under the adopted design (record 555 §1/§3). The candidate is FROZEN
and captured in the evidence patches below and in a hash-verified snapshot outside the worktree
(`~/The-Movies-recovery-snapshots/20260920T212500Z-560-enumerator-candidate/`, SHA256SUMS). The
RED file itself was amended afterwards by the test-author (record 561: the two TS7022
annotations and the addition (iii) resolution); every run below carries the amended RED.

## Candidate identity (parent-verified)

- Base HEAD `036ad231291cb65848f20f11b686858fe0d8da56` (the 558 publication; source = first slice
  + 556 fixture reconciliation + the installed enumerator RED).
- NEW `src/core/promiseCapacityEnumerator.ts`, 127 lines, SHA256
  `c0be83a91cf15e5bbf779e9336a697bd19c0b65d95f660866ad85d5c80c697d6`; exports exactly
  `FRESH_TAKE_OFFSET`, `FRESH_ADMISSION_OMISSION`, `earliestStartedTakeWeek`,
  `enumerateOwnerTraces`, `classifyEnumeratedOffer` and `type EnumeratedDomain`; imports only
  `./promiseCapacityKernel.js`, `./promiseCapacityOwnerReplay.js`, `./promiseCapacityOwners.js`,
  `./productionPhases.js`, `./tuning.js` and (type-only) `./types.js`, `./promises.js`; not
  index-exported.
- `src/core/promiseCapacityOwners.ts`, 208 lines (was 198), SHA256
  `5514d847ef969f026abcd3c8fb5b61e47bbc24bd3d0e5a05139571c2cd6f5820`; `git diff --stat` =
  `1 file changed, 16 insertions(+), 6 deletions(-)`, one contiguous hunk in the writable range
  (`export type EnumerationCoverage`, the UNEXPORTED `NO_ENUMERATION` default, the fifth
  `enumeration` parameter, the omissions union, the flags from `enumeration`, the canonical
  `limits` re-literal, the function's own doc comment); the seven runtime exports unchanged.
- Writer-side protected patch (record-check capture: tracked diff + untracked module)
  `81d5d7cd61a2fd31e1888a6d8f790bbe7380901cbdb487d86d26a0ebd3c9cc70` (the snapshot); the runs
  below carry the amended RED as well, so their `testedDiffSha256` differs (recorded per run).
- No test, fixture, kernel, producer, save, bridge, tuning, config or doc file changed by the
  writer; the RED file's SHA256 was unchanged at hand-back (`56df4c5b…75ac`).

## Fixed-source checks — serial, one process at a time, all fixedSource:true on 036ad231 + protected patch 16e522ed…

The protected patch `16e522edda08ee334501e8129eee51e9e556255986e285c967efc1c7194fa36a` = tracked
diff of `src/core/promiseCapacityOwners.ts` (+16/−6) and
`tests/p14b4-owner-enumerator-slice.test.ts` (+23/−15, record 561) + the untracked
`src/core/promiseCapacityEnumerator.ts`; identical in every run below and equal to the parent's
snapshot `~/The-Movies-recovery-snapshots/20260920T213500Z-561-enumerator-red-amended/tracked.patch`.

| Record | Group | UTC interval | Result | Baseline |
| --- | --- | --- | --- | --- |
| 562 | the amended enumerator RED file | 21:36:32.968–21:36:43.898 | 45 PASS (was: fails to load, 559) | RED→GREEN |
| 563 | the first-slice RED file | 21:36:44.143–21:36:53.040 | 33 PASS | identical to 542 |
| 564 | six Ready replay files | 21:36:53.283–21:37:08.565 | 17 PASS; sole original stale-target FAIL at `tests/p14b4-ready-replay-stale-target.test.ts:234` (`expected 'workLimit' to be 'commandRefused'`) | identical to 543/528 |
| 565 | six Started replay files | 21:37:08.806–21:37:25.073 | 28 PASS | identical to 544 |
| 566 | root + UI typecheck | 21:37:25.297–21:38:41.482 | PASS (exit 0, no diagnostics) | identical to 545 |
| 567 | seventeen adjacent/caller files | 21:38:41.706–21:39:20.109 | 203 PASS | identical to 546 |
| 568 | bridge types | 21:39:20.328–21:39:50.374 | exit 2; sole OLD TS2353 at `tests/bridge-p14b4-cast-class.test.ts(364,20)` | identical to 547 |
| 569 | facts + employment lookup | 21:39:50.618–21:39:57.676 | 7 PASS | identical to 548 |
| 570 | eleven live-P2 / kernel groups (the 536 command) | 21:39:57.881–21:42:10.098 | 110 PASS / 83 FAIL; the 83 failing-case lines and the 83 `→` reason lines byte-identical and in the same order as 549 (parent script `compare-fail-sets.py`) | identical to 549/536 |
| 571 | B1/B2/B3 controls + bridge consumers (12 files) | 21:42:10.349–21:43:32.108 | 133 PASS / 1 FAIL / 2 todo; the sole FAIL is the designated `tests/p14b1-trust-chooser.test.ts:439` test 6 (record 110/554), same reason line as 557 | identical to 557 |
| 572 | `bridge-p14b2-trust` | 21:43:32.317–21:43:51.951 | 22 PASS | identical to 557 |
| 573 | twelve historical save files (record 25 command) | 21:43:52.154–21:44:42.851 | 137 PASS | identical to 551/25 |

Writer's own runs (not evidence): the enumerator RED 44/45 at 21:20:09–21:20:18Z and (verbose)
21:23:51–21:24:00Z, the one RED case being the fixture's own UNCONSTRUCTIBLE self-report; the
first-slice RED 33/33; root typecheck exit 2 on the two RED TS7022 lines only; UI typecheck exit
0; bridge typecheck the sole OLD TS2353. Test-author's runs after the amendment (record 561):
45/45, root+UI typecheck exit 0.

Added after the review (574-R Q9 caveat): 575 `575-enumerator-candidate-unamended-red`
(21:51:52.672–21:52:03.267Z, fixedSource:true, protected patch `81d5d7cd…` = the writer-side
snapshot) ran the candidate against the UNAMENDED 558 RED bytes restored from the hashed backup:
44 PASS / 1 FAIL, the sole failure the RED's own `UNCONSTRUCTIBLE` throw at :614; the amended RED
was then restored by copy from the snapshot and re-hashed (`b9da9b76…`, patch `16e522ed…`).

## Findings

- The slice does what 555 §1 adopted and nothing else moves: 45 + 33 + 17 + 28 + 203 + 7 + 133 +
  22 + 137 = 625 focused passes, the 110/83 live-P2 set byte-identical to 549/536, the two
  designated pre-existing failures (Ready stale-target :234; trust-chooser test 6) unchanged; not
  a whole-suite pass; no Owner-acceptance claim; no receipt/rulesVersion/save/projection/kernel/
  producer change; D1 (537 §3), D2 (538-C §2) and 515 §6 stand.
- The 13 fixed-cast cells and the conflicting-claim case now reach PROVEN_FRAGILE /
  PROVEN_IMPOSSIBLE through the adapter without the Ready producer (option β; the fresh-take
  floor certificate), as 555-A predicted; the paper `unbound(support)` cell is measured
  PROVEN_IMPOSSIBLE/completeCountFailure. Windows beyond now+5 stay truthfully UNCERTIFIED with
  the fresh-admission omission (E4).
- The writer's ten design decisions beyond 555 §1 (whole `GameState` as the Started source; the
  `EnumerationCoverage` Pick; traceKey `enumerator:started`; rival-branch shape with
  `preparationWork 1`; `w_e > limits.work` saturation on `producer.omissions`; scan omissions
  emitted before a producer cut; `complete` requiring non-empty attempts; loud `claims.now` and
  safe-integer invariants; rival check before the tariff; the corrected `assembleCapacityInput`
  doc comment with the owners module header :8-9 left describing fixed coverage) are submitted
  to 574-R for review; the parent adopts none of them before that verdict.
- Two test-side items were left for the test-author and are closed in record 561.

## Next

574-R independent review of the landed module (contract-auditor, READ-ONLY on the frozen bytes),
then, on KEEP, the qualified checkpoint commit of the three files with records 560/561/574 and
the header refresh.

## 3. Verbatim sim-core writer hand-back (560-W)

As returned, unedited.

```text
## 560-W (T2) — enumerator slice: PARTIAL (44/45 GREEN; the one RED case is the fixture's own self-declared UNCONSTRUCTIBLE; root typecheck fails only inside the not-writable RED file)

**Model observed:** the harness identifies this session as Fable 5.1 (`claude-fable-5-1`); not independently verifiable. The lean-ctx MCP tools named in the user CLAUDE.md were not exposed; I used Bash (read-only reads, the authorized runs), Read, Write, Edit. No Git state change (read-only `rev-parse`/`status`/`diff` only), no network, no installs, no delegation, no test or fixture edited, no synthetic value added.

**Identity:** worktree `/Users/zacheryspector/The-Movies-headless-program`, HEAD `036ad231291cb65848f20f11b686858fe0d8da56`, tree clean at start; RED file SHA256 `56df4c5ba8ae9cd2bc1d0fe3720b3ba921ac02d2f82b5d7b417b2800703875ac` (matches record 558), untouched.

### Files changed (exactly the two writable paths)
`git status --short`: ` M src/core/promiseCapacityOwners.ts`, `?? src/core/promiseCapacityEnumerator.ts`.
`git diff --stat`: `src/core/promiseCapacityOwners.ts | 22 ++++++++++++++++------ ; 1 file changed, 16 insertions(+), 6 deletions(-)` (one contiguous region, original :145-169: the `EnumerationCoverage` type export, the UNEXPORTED `NO_ENUMERATION` constant, the fifth parameter `enumeration: EnumerationCoverage = NO_ENUMERATION`, omissions union `...enumeration.omissions` in place of the literal, flags from `enumeration`, the canonical `limits` re-literal `claims, units, alternatives, work, span`, and the function's own doc comment corrected; the seven runtime exports are unchanged — the RED's RED-11 key pin passed).
- `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityEnumerator.ts` (new, 127 lines) SHA256 `c0be83a91cf15e5bbf779e9336a697bd19c0b65d95f660866ad85d5c80c697d6`
- `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityOwners.ts` (208 lines) SHA256 `5514d847ef969f026abcd3c8fb5b61e47bbc24bd3d0e5a05139571c2cd6f5820`

Exports of the new module (exactly the five pinned): `FRESH_TAKE_OFFSET` (= 5, derived at module load: the highest countdown the phase owner puts in `'shooting'` via `productionPhaseForRemainingTicksOrNull`, then `1 + (TUNING.PRODUCTION_TICKS − that) + 1`; loud throw if the phase owner has no shooting week), `FRESH_ADMISSION_OMISSION` (555 §1 exact wording), `earliestStartedTakeWeek`, `enumerateOwnerTraces`, `classifyEnumeratedOffer`; `export type EnumeratedDomain`. Imports only `promiseCapacityKernel`, `promiseCapacityOwnerReplay`, `promiseCapacityOwners`, `productionPhases`, `tuning`, type-only `types`/`promises`. Not index-exported.

### Runs (all from the worktree root, one process at a time; logs under `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/`)
1. `node_modules/.bin/vitest run --project core tests/p14b4-owner-enumerator-slice.test.ts` — START `2026-09-20T21:20:09Z`, END `21:20:18Z`, EXIT 1. `Test Files  1 failed (1)` / `Tests  1 failed | 44 passed (45)` / `Duration  8.47s (transform 1.81s, setup 0ms, collect 2.44s, tests 5.14s, environment 0ms, prepare 312ms)`. Log `560-W-enumerator-run1.log`.
2. `node_modules/.bin/vitest run --project core tests/p14b4-owner-adapter-first-slice.test.ts` — START `21:20:40Z`, END `21:20:48Z`, EXIT 0. `Test Files  1 passed (1)` / `Tests  33 passed (33)` / `Duration  6.57s (transform 1.76s, setup 0ms, collect 2.45s, tests 3.53s, environment 0ms, prepare 144ms)`. Log `560-W-first-slice-run1.log`.
3. `npm run typecheck` — START `21:20:56Z`, END `21:21:25Z`, EXIT 2. Exactly two errors, both in the RED file: `tests/p14b4-owner-enumerator-slice.test.ts(305,11): error TS7022: 'production' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.` and the same at `(306,11)` for `'workflow'`. No error under `src/`. Because the script is `tsc --noEmit && tsc -p ui/tsconfig.json --noEmit`, the UI half did not execute. Log `560-W-typecheck.log`.
4. `npm run typecheck:bridge` — START `21:21:25Z`, END `21:21:50Z`, EXIT 2, the sole OLD `tests/bridge-p14b4-cast-class.test.ts(364,20): error TS2353` only (expected, not mine). Same log.
5. UI half of check 3 run directly, `node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` — START `21:22:32Z`, END `21:23:11Z`, EXIT 0. Log `560-W-typecheck-ui.log`. (Same named check, second component; run so the parent has the UI result the assignment asked for.)
6. Re-run of 1 with `--reporter=verbose` for per-case evidence — START `21:23:51Z`, END `21:24:00Z`, EXIT 1, identical totals `Tests  1 failed | 44 passed (45)`, `Duration  8.68s`. Log `560-W-enumerator-run2-verbose.log`.

### The one RED case (not changed; not satisfiable within my paths)
`558-T honesty > addition (iii) (555-B Q7): a non-empty production queue is the producer's context cut … else reported UNCONSTRUCTIBLE` — throws its own `Error: UNCONSTRUCTIBLE: the commission was admitted at once (a second Development & Casting slot is free); the queue stays empty` from test :613-614. Observed fact: after the real `commissionScript` on the natural chain's `immediate` state, `queued.productionQueue.length === 0` (the door did not throw). The parenthetical diagnosis is the test-author's; I ran no further probe (not authorized). No producer attempt/cut/class was reached in that case. Whether a commission ever lands in `productionQueue` (the producer's :624 cut reads that queue) is a test-author/parent question; 558 §"Unconstructible cases" anticipated exactly this self-report.

### Precondition and observation results (all PASS, run 6 verbatim ✓ lines in the log)
- E1 natural chain LAW and the separate OBSERVATION both passed: the real take on `w.opened` lands exactly at `now + 5`.
- Every loud `requireComplete` precondition held: Started runs on `w.ready` to now+4 (E6), now+5 (E4 at the floor), now+6 (E4 beyond the floor: BOTH flags incomplete with exactly `[FRESH_ADMISSION_OMISSION]`, no throw), on `w.unscheduled` to now+2 (E5: exactly `[startedOmission(w.productionId)]`), on the admitted-this-week state (i) and on `tick(w.ready)` (ii) all completed.
- E2 ×13: one complete attempt, trace and holds byte-equal to the reference Started run keyed by the enumerator's own traceKey, `preparationWork = reference(0) + w_e`, holds to `claims.horizonEndWeek`, certificate `{complete, complete, []}`. E3 ×13 classes as 538 :33; the PAPER `unbound(support)` cell is IMPOSSIBLE/PROVEN_IMPOSSIBLE/completeCountFailure (now measured through the adapter). E7, E9 (200001 throw unrelabelled; span 1 → `['sizeLimit','replay span exceeds limit']`/UNCERTIFIED-sizeLimit), addition (v) saturation (`preparationWork 1`, kernel `workLimit` at `workUsed 1`), E8 purity/permutation, E10 (four-arity byte-identical to RED 7's hand assembly; canonical key order; permuted-literal digest equal).

### Design decisions beyond 555 §1 / 558's resolved ambiguities (controlling line each)
1. The Started producer receives the whole `GameState` as `source` (structurally a `StartedOwnerSource<Production>`), not a pick: the producer's only key-iterating bill is `copyCost(production)` on the same row object (replay :677) and it reads `source.market.tick` only, so the bill is identical to the test's pick-based reference — confirmed by E2's byte-equality and `preparationWork` sums.
2. `EnumerationCoverage = Pick<JointTraceCapacityInput['coverage'], 'existingCalendars' | 'allOwnerTraces' | 'omissions'>` — reuses the kernel's own flag/omission shape through the already-imported type, so no import line outside the hunk was touched (precedent: `CapacityLimits = JointTraceCapacityInput['limits']`, owners :39).
3. traceKey literal `'enumerator:started'` (555-A §4 step 3 proposal; the RED pins non-empty only).
4. Rival/absent-industry branch producer shape: `{ fixedHolds: [], attempts: [], preparationWork: 1, omissions: [] }` and `enumeration.omissions: []` (the rival omission is already on claims, 555-A behaviour 1); `preparationWork = w_e` applies E8's "tariff sits inside the producer bill" uniformly (558 says not pinned).
5. Saturation test is `w_e > limits.work`, mirroring the replay's own `preparationWork > limits.work` (replay :2694); the cut string sits on `producer.omissions` (the replay's shape, :2686-2687) and `enumeration.omissions` stays `[]` there.
6. The (a′)/(b)/(c) scan runs before the producer call and its started-picture omissions are emitted even when the producer is later cut (truthful; the flags are incomplete on a cut regardless); `enumeration.omissions` is sorted unique.
7. `complete` additionally requires `producer.attempts.length > 0` — a certificate is never issued over an empty run (the `sizeLimit`-before-plans shape has `attempts: []`).
8. Loud invariants: `claims.now` must equal `{ state.market.tick, 0 }` in `enumerateOwnerTraces`; safe-integer check on `now`/`startTick`/`remainingTicks` in the helper.
9. Order: the rival check precedes the tariff (555 §1 behaviours (1)→(2)); a rival claim under `limits.work 0` therefore returns the empty shape with `preparationWork 1` rather than the cut shape — untested by the RED, noted only.
10. The `assembleCapacityInput` doc comment (inside the hunk's neighbourhood) was corrected because "calendars and traces always incomplete" became false. The module header at owners :8-9 still describes the first slice's fixed coverage; it is outside my writable range and was left as is — flag for the parent.

### Remaining defects / not done
- Root `npm run typecheck` is RED solely on the two TS7022 lines in the RED file (:305-306, the natural-chain loop's `production`/`workflow` locals: a control-flow cycle through `assert.ok` narrowing and the `state = applyActions(state, [... directorId: production.directorId])` back-edge; independent of my module). Fix is test-author scope (an explicit annotation such as `const production: Production | undefined = …` / `const workflow: ProductionWorkflow | undefined = …`). Not edited (tests not writable).
- Addition (iii) UNCONSTRUCTIBLE as above; no synthetic queue entry added.

### Evidence limits
Two enumerator-file runs (default and verbose reporters, identical totals), one first-slice run, the three typechecks; no serial groups, no live P2 groups, no historical saves, no native, no usability, no Save30/projection/Owner-acceptance claim. Test-file typing errors surfaced here for the first time (558 recorded that no typecheck had run). SHA256s are of the uncommitted working-tree bytes.

### Next concrete action
Parent records 560-W, runs the 555 §3 serial groups under `record-check.mjs` on this tree, decides the two test-author items (the TS7022 annotations at :305-306; addition (iii)'s constructibility or its re-scoping), then the independent review of the landed module.
```
