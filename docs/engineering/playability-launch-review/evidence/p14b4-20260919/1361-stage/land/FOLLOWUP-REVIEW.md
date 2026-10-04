# Independent final disposition: Save45 recorded follow-ups

Reviewer: `/root/recovery_charter`, 2026-10-04. **PROCEED with the recorded-baseline checkpoint.** The two targeted full-file follow-ups pass on unchanged source and original deadlines. They resolve the open core follow-up requirement as **isolated non-reproduction**, without erasing any broad-run failure or establishing an environmental cause. The earlier core review remains historical evidence; this report supplies its requested final disposition.

This verdict concerns publication of the recorded-gate checkpoint, not completion of Save45 G-L/captures, recovery, native Unity verification or the full game plan. It relies on the separate completed UI/D16 independent review for those gates.

## Guard and selection verification

Independently read both complete five-artifact sets, their raw results, the summary and reviewed wrapper. Both runs record source SHA `2eaa697effc38538c37da28b486786ce267a2284` at start/end; preflight remote/head and postflight head agree. Node is v20.20.2. Actual test-child exits are **0**, with null signal/error, fixed source true and exact postflight guards.

For each run, independently compared all pre/post guard scopes, 1,190-file source inventory, **298 manual-pin entries**, index and stage entries. Source inventory/manual facts and index/stage digests also equal the broad core recording, not merely each follow-up's own before/after. Recorded patches are empty. Recomputed every artifact hash against the summary and each postflight's raw/record/patch size/hash. This uses recorded manual facts without opening fixture payloads.

The scratch and preserved wrapper both hash to reviewed `26eb23a63022f5ce367ee26dd00d9e686e93978e33c8ac39b215bcaeaf79298f`. Recorded commands select `--project core` and exactly one full test file with `--maxWorkers=1 --minWorkers=1`. There is no test-name filter, retry flag, timeout override or expectation edit. The disclosure leaf retains **30,000 ms**. Supervisor restart retains its **60,000 ms** outer limit and **30,000 ms** replacement wait; crash-loop retains its **70,000 ms** outer limit and **20,000 ms** initial health wait.

| Follow-up | Recorder UTC interval | Full file | Vitest duration / test-body aggregate |
|---|---|---|---|
| Disclosure | 23:28:35.919–23:29:44.962 | **22/22 passed**, 1 file | 67.86 s / 46.64 s |
| Supervisor | 23:31:04.797–23:32:24.402 | **14/14 passed**, 1 file | 78.50 s / 77.53 s |

Postflights completed at 23:29:45.377 and 23:32:24.841 UTC respectively. Neither output has a failed-test, failed-suite, unhandled-error, unhandled-rejection or uncaught-exception section. These were sequential completed runs, after the completed D16 interval recorded by its independent review.

## Exact formerly failing identities

Compared the complete broad failure identities with the actual pass lines; all three match exactly, not by substring category or aggregate count:

1. `tests/bridge-p13b-s7-disclosure.test.ts > P13B-S7-T3 item 5: Industry announcement row — derived, nullable studioId, excluded from per-studio History, absent for sound, Save As identical > identical in a Save As world: two independently-saved-as campaign slots of the same week-884 state publish byte-identical announcement rows` — broad timeout at the unchanged 30,000 ms limit; **isolated pass in 9,930 ms**. The full-file pass reaches the real Save As/load/announcement equality assertions that the broad timeout did not establish.
2. `tests/bridge-supervisor.test.ts > one-command studio supervisor > restarts a SIGKILLed engine on its fixed port without changing durable authority` — broad `Fake Unity did not report replacement.` after actual SIGKILL; **isolated pass in 10,273 ms**, including the later replacement authority and cleanup assertions. The changed primary relative to x3's startup refusal remains recorded.
3. `tests/bridge-supervisor.test.ts > one-command studio supervisor > bounds engine crash loops and never touches an unrelated process` — broad `Fake Unity did not report health.` before deliberate crashes; **isolated pass in 13,890 ms**, reaching the real crash-loop and unrelated-process assertions.

The disposition for each is **not reproduced in the justified, single-worker full-file follow-up on identical source and original deadlines**. This supports checkpoint acceptance with the observed discrepancy disclosed. It does not prove worker contention, resource pressure, flaky tests or any other causal explanation; it also does not guarantee future broad-run success. No timeout was raised, failure retired or source fix invented. A recurrence remains a finding on its own evidence.

## Artifact binding

Evidence stems are under `E = docs/engineering/playability-launch-review/evidence/p14b4-20260919`.

| Artifact suffix | `1361-save45-bridge-disclosure-followup` SHA256 | `1361-save45-bridge-supervisor-followup` SHA256 |
|---|---|---|
| `.json` | `03df7ea837579b7c811c6cf0d98dc580c62889021bbb64ea95b3d82d8b6499c7` | `0222566508a2ea3d5ac5025d0aa59c378cc247b9c8728164ed5d04e007960e3b` |
| `.txt` | `03925909de253d1beef5a79efbbc5f5b98f4f0a3cf11d50df4f9dc2d2a71c5ab` | `a949cb1f467db72cb3415897f0831fab9f79fcbb61133ff4fcc9e0b0ace1e6da` |
| `-preflight.json` | `ff17f7d5e880bc59330456f4e367bf8e6918ea5d47b6acd91a7a8030ca298907` | `040c6ad89e58cda297a75d6f33b0755893a75157d3ad9665283749e2164c5712` |
| `-postflight.json` | `74726f99111d359c3e8bded22186eab63ec0c7650891a9faaa2bc2983e2398c4` | `9e3d3bbcf0233ded97a9d14c82030fc74d264dd418f8bb74a82662c3bb6ae4dd` |

Both empty `.patch` files hash to `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Independently matched summary `E/1361-stage/land/followups-summary.json` SHA256 is `5b4fa94b1b21358d850ceb63302a6942d6eb2a945594f42210b2f24d31d26bef`.

## Checkpoint wording and retained obligations

The broad core result remains **133 FAIL / 5,118 PASS / 3 SKIP / 11 TODO**, with exactly 45 held-(c) rows, all 85 historical baseline identities and the three followed-up failures. Do not replace it with 130 failures, an all-green claim or a synthetic combined result. Preserve the earlier five actual supervisor GONE outcomes, all original comparison files, unchanged C20 and the full broad/follow-up recordings.

Read the completed `E/1361-stage/land/UI-D16-REVIEW.md`: UI is 2,692 passes / 5 skips over 204 files; D16 retains the complete 176-case inventory and exact 12 baseline failure-message arrays. That independent review, the prior core review and this final follow-up disposition support the recorded-baseline checkpoint together. This reviewer did not re-run those gates.

Parent can update M3's pending opening and supervisor bullet to these completed results and link this review. Preserve the coverage limits (15 terminal premises, 26 earlier workflow/history guards, four S8 earlier guards and historical own-era gaps), held market retune, Save45 G-L/K3 and qualified timing measurements, frozen-v2/catalogue guards and all required pre-recovery captures. These subsequent obligations still block their corresponding later work; publication of the recorded checkpoint does not waive them.

Only completed evidence and narrow unchanged test source were read. Lightweight Python hashes/comparisons only; no runtime, test/typecheck, fixture payload read, source/index change or nested agent. This report is the only write.
