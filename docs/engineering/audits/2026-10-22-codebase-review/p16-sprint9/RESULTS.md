# Sprint 9 — P16 technical checkpoint gates

## Full-tree gate and reviewed test repair — 2026-10-27, 13:35 CDT

Gameplay source stays 63a63abe63e62825916f3a69b4b4589ae3a7baed on experimental p16-retained-writing-20261026. The Owner paused the foreign Codex/Godot session; the prepared full-tree milestone (p16-sprint4/final-gate) ran once as attempt r3 (11:09:57–13:06:06 CDT, HEAD d2cfef0d, handoff-only above gameplay) through fresh preflight, explicit no-Godot scan and the sole lane, after 357 sparse-excluded tracked inputs were materialized from HEAD blobs. Two earlier attempts the same morning were retired and are preserved under retired-attempts/ (a surviving run.sh subshell ran a second full core beside attempt r2; nothing from them is a result).

Static gates: root and UI typecheck 0 (105 s), Bridge typecheck 0, both Bridge contract checks 0, UI build 0, final source integrity 0. Full core including Bridge: 5,991 tests, 5,859 passed, 118 failed (98 min). Full UI: 2,734 tests, 2,727 passed, 2 failed (15 min). Classified against the Oct 22 baselines (tools/compare-full.py; full-tree-r3/COMPARE-*.txt):

| Class | Core | UI |
| --- | --- | --- |
| NEW (not failing in baseline) | 9 | 0 |
| INHERITED-SAME (same first line) | 94 | 2 |
| INHERITED-CHANGED | 2 | 0 |
| MISSING-INPUT (ENOENT) | 13: 6 unrecoverable r3n1, 7 recoverable tracked inputs | 0 |
| BASELINE-NOT-REPRODUCED | 20 | 1 |
| OVER-BUDGET passes (5,000 ms core / 30,000 ms UI) | 613, max 569,813 ms | 0 |

The nine NEW core failures were six literal Bridge registry pins (SNAPSHOT_VERSION 62, highest prior 61, 50-entry prior roster) left behind when P16 registered projections 63 and 64, and three obsolete refusal expectations in two drafting171 witnesses written before the Sprint 7 continuation producer. A test-only repair (repair-delta/REPAIR.patch, independent review in REVIEW.md, commits 129c3343, ac9e0cf0, 1f39bd89, 71ddea72) updated the pins to 64/63/52 and converted the witnesses. The stopped-drafting171 witness now proves the close-time writer-capacity refusal (quote continuationRequired/writerCapacityUnavailable when the buyer has not activated managed script development; closeAbsorption refuses with retainedScriptCapacityProducerRequired), a guard the review found untested. Focused reruns through the lane: focused-r4 (root types 0; 11 files, 66/68 before the witness correction), witness-r6 and witness-r7 (2/2 within budget). The seven recoverable inputs were materialized and their five files pass (p14c3-force-order 8/8, four p14p4p5 files).

Remaining core failures on this source after the repair: 94 inherited-same, 2 inherited-changed (projection20 migration pin 64 vs 53, the baseline's 62 vs 53; p15c2 legacy-root-downgrade 189.8 s against its 120 s budget) and 6 unrecoverable r3n1 missing-input rows; every one carries its Oct 22 baseline identity (full-tree-r3/AUDIT.md lists the 29 files). No gameplay source changed in this sprint.

Claims: this is the Sprint 5 broad baseline and the Sprint 9 coherent gate on 63a63abe, functionally classified. Timing is not qualified (613 over-budget passes; swap and load were high at launch). Exclusivity is sampled (launch and post scans, foreign evidence directory, a 20-second poll in the coordinator's session). No P16 technical checkpoint is published yet: the Sprint 9 browser transactions (rights purchase/licensing, healthy acquisition, estate outcome, save/reload) have not run, and natural C-08 proof stays OPEN. No Owner acceptance.

Open coverage note from review: the partialWriterTeamProducerRequired and retainedScriptProducerRequired branches of the close guard remain without a witness; tests/bridge-owner-ux-projection20-migration.test.ts keeps its inherited stale pin (53) pending its own repair and review.
