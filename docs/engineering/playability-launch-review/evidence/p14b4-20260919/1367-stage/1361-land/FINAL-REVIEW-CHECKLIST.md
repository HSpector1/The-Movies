# Save45 recorded broad-gate final review checklist

Prepared by `/root/recovery_charter`, 2026-10-04. **Preparation only: no completed broad-run evidence has been reviewed here.** Parent will supply completed artifacts after each successful postflight. Do not inspect active test output, attribute an unfinished run, or infer test success from the wrapper's exit.

`E` means `docs/engineering/playability-launch-review/evidence/p14b4-20260919` in `/Users/zacheryspector/The-Movies-headless-program`. `L` means `/Users/zacheryspector/studio-scratch/1361-land`.

## Authority and fixed inputs

Read narrowly: 1361-F through F8, 1361-X7, `1361-stage/sweep/review-x3-final.md`, current 1361-L, and the attribution/wrapper programs and reviews. The F4 ruling 3 restoration supersedes F2 ruling 3's fallback: Save45 actually lands market (a)/(b), with (c)/(d) held. F5 Amendment 1 fixes **45**, not the earlier 44, residual leaves and uses x-r3b as their baseline.

| Input | Expected identity |
|---|---|
| Exact broad recorded source HEAD | `2eaa697effc38538c37da28b486786ce267a2284` |
| Accepted x3 candidate | `ee289de67e453ce269c98d840a48799265c62993` |
| `L/attribute-recorded.py` SHA256 | `1b596e4dd32c42526fa90c50976004101b38bee2fb1de094d23ab9c4f2b526ab` |
| Original `L/recorded-1361.sh` SHA256 | `65c9c08f21e452843d35e0f5b29779d88d1a2544541270c38088e8a31bd642b4` |
| D16 `L/recorded-1361-d16-json.sh` SHA256 | `91a7ac9cc195f8d7641f1459b2298ee6b8b9c72f5bf807cbe04161602a50fcd5` |

## 1. Establish completion and provenance before reading results

- [ ] Parent confirms each run and postflight are complete. For each suite, inspect all five files at `E/1361-save45-broad-{core,ui,d16}`: `.json`, `.patch`, `.txt`, `-preflight.json`, `-postflight.json`. No missing or partial output is accepted.
- [ ] Recorder has a real end time, `fixedSource: true`, the exact source SHA at both ends, and null signal/error. Pre/post heads match that SHA. Postflight reports `allGuardsExact: true`, fixed source, and child exit equal to the recorder's actual child exit.
- [ ] Independently bind raw text, recorder JSON and patch bytes to postflight hashes. Inspect preserved pre/post source inventory, index/stage and manual-pin guard results. No source/index change during the run or postflight is explained away by a passing suite.
- [ ] Confirm actual commands: the named 448-file core list under `--project core`, `--project ui`, and the exact D16 config/reporter/output command below. Confirm Node v20.20.2 and completed single-lane execution from the supplied metadata. Preserve machine/disk context, including the wrapper's 5,242,880 KiB precondition; AC is an operational request, not a newly invented hard refusal.
- [ ] Recheck reviewed script hashes before relying on their outputs. Attribution writes only a new exclusive external directory, outside the repository, with no symlink ancestors. Keep both the source reports and attribution outputs; do not overwrite baselines or previous attempts.

**Exit interpretation:** the bounded recorder can exit zero because source remained fixed while the test child exited one. The original wrapper also does not convert every postflight failure into its own nonzero exit. Read actual record/postflight facts. An attribution-script zero is likewise not acceptance of every x3 difference.

## 2. Core completeness and exact residual attribution

Expected x3 corpus: **448 files, 5,265 cases: 137 failed, 5,114 passed, 3 skipped, 11 todo**. Failure/pass counts can differ only after explicit attribution; the file/case corpus and skip/todo counts remain governed. Confirm complete collection, final summary, no unhandled errors, and every suite-level/collection error is explained rather than hidden by ordinary test failures. Reconcile parsed rows and actual child exit (one when test failures remain).

- [ ] Inspect `core-failures.json`, `core-vs1358I.json`, `core-vsx3.json`, `declared45.json` and their `guards.json`. Independently reconcile identities/primary messages, including uniqueness and every NEW/GONE/CHANGED row. Preserve the actual baseline comparator results as well as the x3 comparison.
- [ ] Exactly **45** P15A.1 failures match `E/1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv` by complete identity and complete primary message, **without normalization**: 40 integration, 4 atomicity, 1 phases. No additional row in these three files is accepted as held (c). The newly held control and changed window-stock guard are already in that exact TSV.
- [ ] Account for the **85 retained baseline identities**. At x3 the comparator reported SAME 78, CHANGED 7, GONE 0. Those seven changed messages were C20's live version digit 44 to 45 and six existing r3n1 ENOENT paths. The six are part of the baseline 85, not seven additional environment rows.
- [ ] Separately account for the **seven x3 NEW supervisor environment failures**: three Fake Unity “started”, three “health”, one “helper”. Together with 45 declared rows, these explain x3's NEW 52 and total 137. A live environment may change these outcomes, but neither an apparent improvement nor a similar count is automatic acceptance. Record the exact identity, old/new message or disappearance, evidence and disposition for every difference.
- [ ] R8 was retained at x3. F7 ruling 8 allows a genuinely measured and attributed GONE timeout outcome without editing the row; it does not pre-authorize arbitrary disappearance of other baseline failures. C20 remains unedited. Do not tune assertions, fixtures or production to conceal retained failures.
- [ ] Confirm named production-stop surfaces still pass: `tests/p13a-causal-core.test.ts` 8/8 and `tests/contracts/v14-byte-parity.contract.test.ts` 6/6. Confirm sibling 5/5 and that no x3-cleared sweep failure returns. Review any recurrence among the 17 deferred S9 pins or four exact S8 first-guard pins as a finding, not an approved residual.

Only exact known checkout prefixes become `<tree>/` in x3/live message comparisons. Shared live `node_modules/` paths stay literal. No broad normalization of numbers, paths, errors or wording is allowed. The exact declared-45 comparison does not use this normalization at all.

## 3. UI completeness and attribution

Expected x3 corpus: **204 files, 2,697 cases: 2,692 passed, 5 skipped, no failures, no todo and no unhandled errors**; child exit zero.

- [ ] Inspect guarded raw summary, `ui-failures.json`, `ui-vs1358I.json` and `ui-vsx3.json`. Reconcile complete files/cases, skip counts, collection errors and child exit independently of wrapper success.
- [ ] Expected comparison is NEW 0; the same three historical numpy/RGBA/PNG pipeline failures are GONE under the already adopted environment correction. Any new failure, return of a historical one, changed collection or unhandled error requires explicit attribution and disposition. The parser alone does not waive suite-level failures.

## 4. D16 complete inventory and full-message parity

Expected corpus: **176 unique cases, 164 passed, exactly 12 failed**, no pending/skipped/todo/unknown statuses; child exit one. Baseline is `E/1361-stage/d16/d16-base.json`, not a newly invented all-green target.

- [ ] The recorded command is `node_modules/.bin/vitest run --config src/harness/d16/vitest.d16.config.ts --reporter=verbose --reporter=json --outputFile.json=/Users/zacheryspector/studio-scratch/1361-land/d16-vitest.json`.
- [ ] Preserve all five recorder files plus the separate regular, non-symlink external JSON. Verify fresh-output/symlink/canonical-parent guards and the logged JSON byte count/SHA256 marked `hashedAfterSuccessfulPostflight: true`; independently recompute that hash after successful postflight.
- [ ] Bind report `startTime` and every file's start/end interval to the actual recorder interval. Reject stale, truncated, incomplete or unbound reports even if totals happen to match.
- [ ] Inspect `d16-vsbase.json` and guarded facts; independently compare the **entire 176-case identity inventory**, actual per-case statuses and all **12 complete failureMessages arrays**, not merely primary messages or header totals. Only baseline/live exact checkout prefixes may normalize; shared live dependency paths remain exact. Every identity/full-message difference is a finding requiring disposition.
- [ ] Distinguish the landed (b) build's D16 result from the held (c)/(d) work. F5 ruling 3 defers (c)/(d) runs to the retune; broad parity does not claim the stored-factor harness change has landed.

## 5. Required manual decision and final report

For each difference write a row with suite, exact identity, baseline/x3/live outcome, full relevant evidence reference, causal attribution, governing ruling and disposition. For SAME rows use exact comparison evidence, not a count-only assertion. Missing corpus, changed declared-45 messages, failed source guards, unexplained failures or unhandled errors remain open findings; the script's output is not a waiver.

Final review should identify exact source and tool hashes, completed run intervals, child exits, all artifact hashes, corpus totals, declared-45 equality, baseline/x3 comparisons, D16 full parity, every manual disposition, and retained limitations. Say **recorded broad gates accepted with the named residuals** only when those checks support it. Do not call the core or D16 suites all green. Parent then updates 1361-M3, 1361-L and HANDOFF at the authorized checkpoint; this reviewer does not edit source, index or those repository records.

## 6. Existing evidence and remaining closure boundaries

Current 1361-L already records source landing/parity to x3, clean root/UI/Bridge types and both generator checks. Four focused recorded runs at published `19d5d06efb1227d1c2788f6119dd2e89cd3f84f5` are recorded complete: archive/isolation 71 passed; archive harness 1 passed; market 45 failed / 14 passed with exact declared messages; Legacy/sibling 121 passed. Keep their source identities distinct from the broad run's HEAD and preserve the documented source parity. Harness campaign 79,802 ms, makeSave 685 ms and validation 366 ms are recorded measurements, not new measurements by this review; the campaign ceiling is 300,000 ms.

Acceptance retains these explicit coverage limits from the x3 independent review:

1. Fifteen P14B.1 terminal-premise failures do not reach their mutants.
2. Twenty-six frozen workflow-carrier observations reach existing V14 history guards, not isolated binding/blocker guards.
3. Four S8 pins cover measured earlier guards, not the masked later invariants. A passing retained regex proves its pattern rather than every detail of a full message.
4. Historical own-era coverage gaps remain: no used-extension own-era input; termination movement-only stops in reconciliation with same-leaf V41 covering the receipt guard; commissioned and finishing writer controls cover different predicates. Live-entrypoint messages were not independently established by full-save guard observations.

Broad acceptance does **not** close these subsequent obligations:

- Save45 G-L baseline, including independent same-route K3/holders/cap and F6 ruling 3 timings for seed-b at 6240, 8791 and after a genuine post-2040 player release. A completed natural subset alone cannot replace the third measurement. Triggers are findings requiring their prescribed route, not accepted merely because measured.
- F6 ruling 2's catalogue `(id, commercialWeek)` pin and genuine frozen-v2 Legacy capture/load/validation leaf. No catalogue or archetype evaluator change lands before both guards; any later change needs the ruled definition-version or append-only solution.
- Held market (c)/(d) retune, its storage fix, G1/G2 and integrated 6,240-week harness. Recovery's later tree must repeat G-L on the same seeds/routes under F2 ruling 5. Save45 retains the disclosed possibility of a 2040 Legacy with no market lens; no Owner-facing Wave 2 build without Waves 3 and 4 is claimed.
- Deferred fail-loud review of `prepareLiveWritingContext`, optional named null-lens refusal/comments, UI competition-factor breakdown, mixed-era named refusal/text fixes and later resolver/P15B responsibilities remain assigned to their subsequent owners. Broad failure attribution neither implements nor waives them.

This checklist performed no tests, runtime attribution, fixture reads, active-log scans or source/index changes. It creates no new product law or approval flow.
