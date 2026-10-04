# 1361-M3: Save45 recorded broad gates and followups

2026-10-04. Core/UI/d16 completed at published `2eaa697effc38538c37da28b486786ce267a2284`. Source/index/manual-input pre/post guards are exact for each. These results retain every failed test; they are not an all-green claim. Both isolated full-file followups passed. Independent final review approves this recorded-baseline checkpoint with all broad133 failures retained; no source/test change or waiver followed from the isolated passes.

## Recorded results

| Selection | Files | Cases | Actual test exit |
|---|---|---|---|
| Core | 448:420pass/28fail | 5265:5118PASS/133FAIL/3SKIP/11TODO | 1 |
| UI | 204pass | 2697:2692PASS/5SKIP | 0 |
| d16 | 10:7pass/3fail | 176:164PASS/12FAIL | 1 |

Runs used pinned Node20.20.2, the reviewed lane/recorders, clean source at the explicit fetched remote HEAD, >=5GiB free at each preflight, and no source/index/HEAD mutation through postflight. The venv was on core/UI PATH. Raw and all five recorder artifacts use stems `1361-save45-broad-core`, `1361-save45-broad-ui`, and `1361-save45-broad-d16` in this directory. Core excludes the same six Owner/native-input files and includes the sibling in the448-file list. Recorder wrapper success is distinct from test-child success.

The [attribution runner](1367-stage/1361-land/attribute-recorded.py) reads only completed fixed-source/postflight captures, binds record/raw/patch hashes and requires full expected inventories. Attributions and compact guard receipts are preserved under [1361-stage/land](1361-stage/land/). Independent [core review](1361-stage/land/CORE-REVIEW.md) reproduced all133 rows and every per-file count; it retains open new-timeout and changed-supervisor disposition.

## Core attribution

Against1358-I: **SAME84, CHANGED1, NEW48, GONE0**. The sole changed prior baseline row is C20, whose message embeds live version45 instead of44. All85 prior failing identities remain. Of the48 new rows,45 are exactly the declared held-c market failures; identity/primary match has zero missing/extra/changed rows and uses no normalization. The other three are the Save As timeout and two supervisor waits described below. Held P15A.1(c) remains scheduled for1365 with the corresponding guard removal; none of those45 are repinned as passes.

Against measuredx3:131same,5gone,1changed,1new. The5gone supervisor cases actually passed in this broad run. The Save As leaf is newly timed out. The changed supervisor restart leaf advanced beyond its old startup failure to the post-SIGKILL replacement wait. The other supervisor health failure is unchanged. Only known absolute checkout prefixes are normalized; shared node_modules paths stay intact.

Preserved comparisons: [exact45](1361-stage/land/attr-core-live/declared45.json), [vs1358-I](1361-stage/land/attr-core-live/core-vs1358I.json), [vsx3](1361-stage/land/attr-core-live/core-vsx3.json). Existing coverage limits remain:15P14B1 terminal premises,26 workflow-carrier observations stopped atV14 history, and4S8 earlier guards. No digest or exception is waived.

## UI and d16 attribution

UI has no failures and the full204-file/2697-case inventory. It equals x3's2692PASS/5SKIP; the three prior numpy-dependent rgba failures are gone with the approved environment installed. This does not reinterpret skipped tests as executed passes.

d16 retains all12 failing identities and their entire `failureMessages` arrays, with exact176-case inventory and164passes. Its reviewed wrapper added a separate exclusive JSON reporter without changing the recorder's five outputs or guards. [JSON report](1361-stage/land/d16-vitest.json) SHA256 `eb0251e7de94cddc73546b6255d891e2260168d06fb95153794f7116798805b9`; baseline `55eb745dc0f00853361376f49ae01dac278cbc6a2834b9311a5a4a3153dc5955`. Only the exact checkout prefixes are normalized. No full-message difference or new d16 failure occurred. Existing bounded d16 review remains scheduled under1365.

Independent [UI/d16 review](1361-stage/land/UI-D16-REVIEW.md) reproduced inventories, failure comparisons and all source/manual/index/postflight guards without executing new tests.

## Followups on unchanged source and deadlines

The [reviewed wrapper](1361-stage/land/recorded-1361-followups.sh) runs each full test file alone with one worker, at the same published HEAD and original timeouts. Its [review](1361-stage/land/followups-wrapper-review.md) confirms all existing guard/output requirements. These are justified by newly observed or changed failures, not repeated attempts to replace the broad result.

- Disclosure: the complete `bridge-p13b-s7-disclosure.test.ts` file passed22/22 in67.86s, exactsource/postflight and childexit0. The broad-run30second Save As announcement timeout passed in9,930ms with the same30,000ms limit. The original broad timeout remains recorded; the isolated pass establishes non-reproduction under the isolated selection, not a proven environmental cause.
- Supervisor: complete14/14PASS in78.50s, exactsource/postflight and childexit0. Restart passed10,273ms and crash-loop passed13,890ms with unchanged limits and actual source. Neither broad failure reproduced in this isolated full-file run. [Diagnosis](1361-stage/land/SUPERVISOR-DIAGNOSIS.md) establishes that broad restart reached initial health, private bridge readiness and actualSIGKILL before missing replacement. The crash-loop leaf failed initialhealth before any deliberate crash. Retained broad output does not contain enough child diagnostics to establish timing pressure as cause.

Independent [followup review](1361-stage/land/FOLLOWUP-REVIEW.md) verified all ten artifacts, exact former failure identities, full22/14case results, source/manual/index equality across broad and isolated runs, unchanged deadlines and actual child/postflight status. Parent adopts PROCEED for the recorded-baseline checkpoint only.

## Remaining Save45 closure

This recorded-gate checkpoint is ready for publication. Save45 G-L/K3 baseline, seed-b6240/8791 and qualified post-2040-release timings, genuine frozen-v2 Legacy capture/catalogue pins, F6 quality guard and required pre-recovery captures remain. Recovery preparation in1367-I remains scratch-only and uncompiled. None of this record claims completed recovery, the later P15/P16/P17/P18 plan or native Unity verification.
