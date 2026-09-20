# 506 — Command-only dimensions: independent source review (recovered) and runtime transfer

2026-09-20. Parent: Claude Code (Fable coordinator role) after the Codex coordinator
exhausted its usage at 12:58:41Z. Owner packet `CLAUDE-RESUME-P14B4` (SHA256SUMS verified)
authorizes the runtime change only; gameplay rulings, verification law, ownership, budgets,
work caps and Unity deferral are unchanged. This is NOT a restart of P14B.1.

## Recovered Codex 506 verdict (verbatim)

Source: local Codex rollout log of subagent `/root/t4_contract_auditor`
(thread `01a0b947-b716-7571-bc89-7f499bb06899`), final assistant message
2026-09-20T12:58:35.417Z, delivered to the parent as FINAL_ANSWER at 12:58:39.743Z.
The parent turn ended on the usage limit at 12:58:41.870Z and never persisted it; the
uploaded transcript shows only "Completed". The verdict below was read from the log,
not inferred from that notification. Recovered text SHA256
`32b9443428076f0e2b448fdf82026924740a712c71da9c62d2043f721e75c73e`.

> ## 506 — Qualified KEEP
>
> Read the complete frozen diff and505 handback against503 and immutable `80aec8b`. No concrete correction required.
>
> - **Prepayments MET.** The fresh ten-field literal costs82. Call/setup blocks precede execution. Production/workflow/reservation/task visits, current string spans, maxima and keyed writes are separately covered. The10-unit width update covers eight finite scalar operations plus `write(d)=2`; paired workflow/task maxima fit32/28 respectively.
> - **Inventory reconciles.** New wrapper work is `186 + 44P + 96W + 34R + 46T`, excluding separately charged strings/fact helpers and the explicitly retained old caller2. Empty-list/termination allowances remain.
> - **Fact semantics MET.** Operations remain copy-only; workflows/bindings/tasks request both modes; reservations remain string-only. Every current member contributes afresh. The unchanged exact-reference table retains complete intrinsic facts and atomic upgrades, not combined projections or historical maxima.
> - **Omission boundary MET.** Actual commands do not copy P/Set/setup/technology records. Required ID/director, workflow/task, binding/reservation and static geometry facts remain. Release's concept/title/commitment/mint/sort paths are unchanged.
> - **Scope MET.** Only replay changed. Shared billing-helper executable bodies, full-frame/admission dimensions, owners, Work primitives, caps and command/refusal/provenance/drain order are unchanged. Missing-production refusal still precedes discovery. No casts, new closures or fabricated Dimensions were introduced.
>
> Verified SHA256:
>
> - Source: `5d4851713ff53209b569c813b78a1e22e6b53ab91e27522ceb5a9ee7222a941a`
> - 505 handback: `3d2e75f833c69430ce8bba0ed531900b3feba57aadf7e8be858d3058c83e6dc3`
>
> **Limits:** Bounded actual-source acceptance, not whole-billing certification. Deferred cold observations must still be charged by subsequent full discovery; changed table history prevents inferring net savings. Candidate typechecks/runtime, stale-route completion and preservation of first-take/kernel GREEN remain parent verification obligations. No runtime or edits performed.

## Takeover verification by the incoming parent (read-only, before any edit)

- Worktree `/Users/zacheryspector/The-Movies-headless-program`, branch
  `wip/headless-program-20260916-ts`, HEAD `80aec8b348f7322da552ef3cd35ae9ba671ba488` = exact
  `git ls-remote` tip at takeover. Linked worktree of the main checkout; no stash entries.
- Dirty tracked (8): five shared-header records, `UNITY-INTEGRATION-BACKLOG.md`,
  `src/core/promiseCapacityOwnerReplay.ts` (+62/−4),
  `tests/p14b4-started-replay-background-command.test.ts` (+57/−0). Untracked (7): 502–505
  records and the 504 baseline txt/json/patch. No 506–512 file existed anywhere in the repo.
- Source SHA256 `5d4851…2941a` = recorded frozen 505; test `dcefec…76ee` = frozen 504;
  505 handback `3d2e75…6dc3`; 503 record `d728ce…9680`; 504 brief `ae6064…51d0`; 504
  baseline patch `865daf…89e1`; HEAD source `5267ff…f1bcb` = 492. All match.
- Protected-patch method recovered: the `record-check.mjs` capture,
  `git diff HEAD --binary -- src bridge tests generated ui scripts package.json
  package-lock.json tsconfig.json tsconfig.bridge.json vitest.config.ts vitest.workspace.ts`
  with no untracked source. The local tree reproduces
  `b6bcfff304a93651577fa662b12e42e6a6e5ecb2007f65a4fa125371a540aa07` exactly. A src-only diff
  hashes `4def41…2ad3` and is NOT the recorded identity.
- Worker liveness: the Codex CLI (VS Code terminal, pids 66792/66793/67529) is alive but idle
  at its usage limit; no open write handles in the worktree; no vitest or other test process.
  The sim-core thread's last writes (source 12:55:30Z; 505 handback 12:57:33Z and 12:57:57Z)
  are all reflected by the matching hashes; its own turn died at 12:59:34Z with no message.
  The test-author thread completed 504 at 12:51:54Z. Nothing was still writing.
- 507–512 plan recovered from the coordinator log (stored 12:53:29Z): 507 ready = 495 args,
  508 started = 496 args, 509 typecheck = 494 args, 510 adjacent = 497 args, 511 bridge types
  = 498 args, 512 independent = 499 args. None had been run before exhaustion; no results exist.
- Non-destructive snapshot (byte copies of every dirty/untracked file, both patches, the
  recovered verdict, SHA256SUMS) at
  `~/The-Movies-recovery-snapshots/20260920T141038Z-p14b4-505-506-claude-takeover`.
  The private transcript stays outside Git.

## Independent Claude contract-auditor re-review

Performed after the IN-PROGRESS recovery commit 34a8db7 by the project-local `contract-auditor`
profile (Read/Glob/Grep only; model override fable, observed as Fable 5.1 `claude-fable-5-1`;
profile default sonnet). It received the frozen candidate, the 492 copy, the protected patch,
records 503/505/504/501 and contracts 176/137/365, NOT the recovered Codex verdict. It read the
whole 2740-line candidate and the actual command owners in operations.ts, sceneryLoadIn.ts and
releaseAuthority.ts. Verdict: **KEEP**, no demonstrated defect; two optional REFINE notes
(documentation of the per-row unit convention in the 505 handback; a bindings-mode preference
explicitly not recommended now). Verbatim handback, SHA256 `7c15405ee02d8ee524650f7cd64684b091f000a3669a93dcea3de2e759c71038`:

> # 506-independent — contract-auditor review of frozen 505 `commandDimensions`
>
> **Verdict: KEEP.** No demonstrated defect in the 505 candidate against 503 / 176 / 365 / 137. Two optional REFINE notes below are documentation/preference items, not failures.
>
> **Status: DONE** for the READ-ONLY static review of items 1–8. Model identity as observable from the harness prompt: "Fable 5.1", model ID `claude-fable-5-1`. Tools used: Read, Glob, Grep only. No edits, no runtime, no delegation. I did not open `506-command-dimensions-source-review.md` or any Codex log.
>
> Sources actually read: 505 candidate `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityOwnerReplay.ts` (all 2740 lines); 492 copy `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/492-promiseCapacityOwnerReplay.ts` at lines 160-174, 838-1077, 1698-1769, 1803-1810, 2462-2469; protected patch `/Users/zacheryspector/The-Movies-recovery-snapshots/20260920T141038Z-p14b4-505-506-claude-takeover/505-protected-source-patch.patch`; records 503, 505, 176, 365, 501, 504; test `tests/p14b4-started-replay-background-command.test.ts` lines 1-80, 320-431; owners `src/core/operations.ts` 60-90, 576-584, 655-823; `src/core/sceneryLoadIn.ts` 95-293; `src/core/releaseAuthority.ts` 34-42, 55-142; Owner logic-first directive (skimmed, no review-criteria change).
>
> ## Requirement classification
>
> ### 1. Scope of change — MET WITH EVIDENCE (with a stated tool limit)
> - New: `LITERAL.commandDimensions` 505:168-169; three Pick types 505:850-853; `commandDimensions` 505:1042-1092; call-site prepayment + call 505:1764-1765.
> - Narrowed signatures only: `workflowUpdate` 505:1093 (492:1036), `geometryBill` 505:1097 (492:1040), `arrivalBill` 505:1105 (492:1048). Bodies 505:1094-1095, 1098-1103, 1106-1128 match 492:1037-1038, 1041-1046, 1049-1071 line for line.
> - Unchanged executable bodies confirmed by side-by-side read: `dimensions` 505:978-1041 = 492:972-1035; `staticDimensionFacts` 505:933-976 = 492:927-970; `dimensionRecordFacts` 505:865-912 = 492:859-906; `dimensionStrings` 505:915-929 = 492:909-923; `executeCommand` 505:1758-1825 = 492:1701-1767 except the one replaced call line; `Work` class not in patch; command owners live in other files the patch does not touch.
> - Frame still calls full `dimensions` 505:1864-1865 (= 492:1806-1807); Ready admission still calls full `dimensions` 505:2524 (= 492:2466). Caller inventory identical between 492 and 505 for `workflowUpdate` (5 sites), `geometryBill` (2), `arrivalBill` (2).
> - Arithmetic: patch hunks sum to +62/−4 as claimed; 2682 + 58 = 2740 matches the frozen line count.
> - Limit: I have no diff tool. Byte-identity outside the hunk regions is inferred from the parent-supplied patch, the line-count reconciliation and my spot reads of every function named in the assignment. Parent should keep the SHA-based patch check as the mechanical proof.
>
> ### 2. Consumed-field sufficiency — MET WITH EVIDENCE
> Every `d.` read on the command path: `executeCommand` 505:1774-1775 (`d.d`, `d.n`, `d.dp`, `d.taskCopy`, `d.workflowCopy`), 1781 (`d.n`, `d.dp`), 1803-1804 (`d.n`, `d.d`), 1814 (`d.dp`); `workflowUpdate` 1095 (`operationsCopy`, `n`, `dp`); `geometryBill` 1101-1103 (`structures`, `provides`, `d`, `placements`, `cells`); `arrivalBill` 1121 (`n`, `d`), 1127 (`workflowCopy`, `taskCopy`). Union is exactly the ten projected fields. `drainEvents` takes no `d`. Because `d: CommandDimensions` is a `Pick`, any other read would be a compile error, so the parent's tsc run is a second proof.
>
> ### 3. Semantic equivalence per field — MET WITH EVIDENCE; DEVIATES: none found
> - `n`, `dp`, `operationsCopy`, `workflowCopy` (seed 98), `taskCopy` (seed 66), `structures/provides/placements/cells`: identical expressions and identical fact modes to 492:983-1023.
> - `d`: command value ≤ full value. Omitted contributions are `workflow.setup` (492:1025-1027), Sets (492:1029), technology rows (492:1031). I checked every command-path owner for reads of those domains: `assignShootingDirector` ops:684-711, `clearSceneryLoadIn` ops:713-739, `arriveDueScenery` ops:760-785 with the replay callback `sceneryLoadInDecision` scenery:280-292 → `sceneryLoadInFor` 188-235 → `facilityBodyCentre` 105-150 (reads `property.structures[].providesFacilityIds`, `placement.facilities[].facilityId/cells` — static facts; `bindings.stageFacilityId/heldSinceWeek/requiresSetBinding` — bindings strings; `reservations[].capability/facilityId` — reservation strings), `scheduleShootingTake` ops:787-807, `requireManagedWorkflow` ops:667-682, `replaceWorkflow` ops:576-584, `releaseCommitmentRefusal` release:69-103 (+ `titleFor` 57-62, `releaseCommitmentFor` 38-42), `withReleaseCommitment` 116-130, `mintReleaseCommitmentId` 34-36. None reads `workflow.setup`, any `StudioSet`, `technology.productions`, `branch.technology`, genre facts, or copies P/bindings beyond what the bills already price. `arrivalBill`'s loop 1108-1119 uses `work.equal` (self-paid spans) and its `4 × equality(d.d)` per workflow covers phase/status/blocker/productionId comparisons in workflow/task domains; `geometryBill`'s `equality(d.d)` terms cover `providesFacilityIds.includes` and placement `facilityId` compares whose operands are static + bindings + reservation strings.
> - Observations (pre-existing, identical in 492, outside 505 scope, not defects of this slice): `operations.mode`, `workflow.blocker.kind/taskId` (nested object, not enumerated by string mode in either version), commitment `commitmentId`/`productionId`, and `production.conceptId` in `titleFor` are not in `d.d` in either version; the 22 floor and per-refusal `detail.length` payment (505:351-354) are what actually bound those today.
>
> ### 4. Prepayment law (176 §1) — MET WITH EVIDENCE; one inventory-convention note
> Independent recount (505 lines):
> - Literal 82: `1 + Σ(1+len)` with lengths n1 d1 dp2 operationsCopy14 workflowCopy12 taskCopy8 structures10 provides8 placements10 cells5 → 71 + 10 + 1 = **82**. Matches.
> - 1764 call site: callee1 + `input.source`2 + `branch.productions`2 + `branch.operations`2 + `work`1 + `prepared.dimensionFacts`2 + call1 + binding1 = 12 nodes × 2 = **24**. The pre-existing 2 at 1763 is retained.
> - 1047 static call: 6 nodes → **12**. 1049 operations fact call: 8 nodes → **16**.
> - 1051 projection: 17 value nodes + binding + construction = 19 ≤ 20 → **40**, plus **82**.
> - 1055 production setup/terminal **4**. 1058 per row **44**: at one unit per scalar operation (the convention the handback itself states for the maxima at 505 record lines 91-95): visit/control 4, two `work.text` call sites 5+5, `d.d` three-operand max 12 + write('d') 2, `d.dp` max 9 + write('dp') 3 → 40 ≤ 44. At two units per node (the handback's stated convention for call expressions) the same row would be 8 + 20 + 26 + 21 = 75 > 44. The handback's inventory for this row is consistent only under the one-unit convention. This is not a 176 violation: 176 fixes no per-node tariff, and the accepted 492 `dimensions` body pays only 4 + 2×2 for the same row work (492:1013-1014 via the `text` closure at 991), so 44 is ≥5× the existing precedent. Recorded as a REFINE-optional documentation note.
> - 1063 workflow setup **6** (4 ops). 1065 per row **24** (visit ≤8 + 8-node call 16). 1067 maxima **32**: (8+13) + (8+2) = 31 ≤ 32. 1070 bindings call **18** (9 nodes). 1072 max **10**. 1074 reservation setup **6**. 1076 per row **24**. 1078 max **10**. 1081 task guard **6** (5 ops). 1083 call **18**. 1085 maxima **28**: (8+9) + (8+2) = 27 ≤ 28. 1090 return **2**.
> - Totals: fixed 24+12+16+40+82+4+6+2 = **186**; per P **44**; per W 24+32+18+10+6+6 = **96**; per R 24+10 = **34**; per T 18+28 = **46**. The claimed `186 + 44P + 96W + 34R + 46T` is the exact sum of the paid literals.
> - Every `work.pay` precedes the statement it covers. No closure, spread, callback or string operation inside a named block: `work.text` pays each span before the numeric `Math.max`; helper bodies pay themselves; loops have setup/terminal allowances and per-visit charges. `commandDimensions` avoids the `text`/`facts` closures that full `dimensions` uses.
> - Over-payments (not defects): call-site 24 vs 0 in 492; static call 12 vs 4; per-production 44 vs ~8.
>
> ### 5. Fact-table semantics (365) — MET WITH EVIDENCE
> Modes identical to the full sweep: operations (true,false) 1050 = 492:978; workflow (true,true) 1066 = 492:1019; bindings (true,true) 1071 = 492:1020; reservation (false,true) 1077 = 492:1021; task (true,true) 1084 = 492:1023. Fresh `d` literal every call; uses the existing `cell` only; iterates current `productions` and `operations.workflows`; exact-reference keying unchanged; `d` is returned and never stored; no branch/ledger/calendar cached. Bindings copy mode is requested although `bindingsCopy` is not projected; 503 lines 19-20 direct this explicitly, and the work is paid by the helper.
>
> ### 6. Ownership and order — MET WITH EVIDENCE
> 505:1760-1762 missing/released refusal precedes 1765 discovery (= 492:1703-1707). Sink 1767-1768, provenance 1769-1770, commandBill 1773-1775, owner dispatch 1777-1818, catch 1819-1823, drain 1824 identical to 492. Error strings unchanged. Cap 200000 at 505:2622 untouched by the patch. No cast (Picks), no closure, no export of any new identifier (grep: all occurrences private), no zero-filled `Dimensions`, no copied owner pipeline.
>
> ### 7. Type safety — MET by reasoning; NOT VERIFIED by tsc
> `Dimensions` is a structural supertype of each Pick, so full `Dimensions` passes at frame 1869 (`arrivalBill`) and 1166/1303/1459 (`workflowUpdate`). `CommandDimensions` contains all `GeometryDimensions` and `WorkflowUpdateDimensions` keys, so 1127, 1775, 1781, 1787 compile. `Pick` preserves mutability, so the assignments at 1060-1061, 1068-1069, 1073, 1079, 1086-1087 are legal. `operationsFacts.copy!` narrows `number | null`. `production.id`/`.directorId` exist on `ProductionClockView` (operations.ts:67-68). All parameters used. Parent must run the typecheck.
>
> ### 8. 504 test change — MET WITH EVIDENCE
> Current file lines 9-11 and 338-391 match the patch exactly; both blocks marked `504 BEGIN/END`; import is a namespace import; the spy at 364-368 calls the captured original owner and records its return, restored at 388; `expect(value.limits.work).toBe(200000)` at 361; no timeout, cap, fixture, helper or existing assertion changed; the original 'resolves a formerly valid ID' case resumes unchanged at 392.
>
> ## Defects
> None demonstrated.
>
> ## Preferences / proposals (separate from defects)
> 1. REFINE-optional: harmonize the 505 handback inventory so the production row uses the same unit convention it states for call expressions, or note explicitly that maxima/assignments are counted at one unit per scalar operation. Source change not required.
> 2. Preference only, not recommended now: bindings could be requested string-only on the command path since `bindingsCopy` is unconsumed there; 503 chose to keep both modes to avoid a second cold scan in the next frame, and that choice is lawful.
>
> ## Evidence limits
> No diff/tsc/runtime/measurement available to me. Byte-identity of untouched regions is inferred, not mechanically proven. No net-savings, route-fit or stale-route claim is made or checkable here. This is a static technical assessment, not Owner acceptance.
>
> ## Remaining parent verification
> Typecheck on the frozen 505 source; serial fixed-source runs of 504 duplicate-commit, 209/222/200 command controls, 276 first-take/kernel (must stay GREEN), 302 stale (report the reached boundary honestly; 505 inherits no claim of fixing it); then the proportionate focused matrix per 503.
>
> ## Next concrete action
> Parent runs the fixed-source typecheck and the serial control set above against SHA `5d4851713ff53209b569c813b78a1e22e6b53ab91e27522ceb5a9ee7222a941a`, then records results in the 506 record alongside this review.

## Status

Both reviews conclude KEEP: the Codex 506 verdict read from the log (Qualified KEEP) and the
independent Claude re-review (KEEP, no demonstrated defect). 507–512 were then run serially on
fixed source 34a8db7 and are qualified in 513: 255 focused passes, the sole original stale-
after-release workLimit failure unchanged, the sole OLD bridge TS2353 unchanged. The IN-PROGRESS
recovery commit was preservation, not a pass. 505 is NOT claimed to fix the stale route; its
reached boundary is measured next (514).
