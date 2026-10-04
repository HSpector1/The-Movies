# Save45 recorded core supervisor diagnosis

The two measured failures are observation deadlines at different stages. They do not establish a failed durable-authority comparison, and current evidence does not prove an environment-only cause. Recommend one separately recorded, unchanged-timeout run of the entire supervisor test file after UI and d16 finish, at the same published HEAD.

## Recorded facts

Source remained `2eaa697effc38538c37da28b486786ce267a2284` throughout the completed core recording (`fixedSource: true`). Recorder interval: 2026-10-04T21:19:43.453Z through 2026-10-04T23:06:50.802Z; exit 1, no recorder signal/error. Evidence: E/1361-save45-broad-core.json and .txt, with E = docs/engineering/playability-launch-review/evidence/p14b4-20260919. Raw text SHA256 from retained attribution: `b74868f37cfe85e177af97c204516757ae07bef40ffb9d1a49eb6c082e850ae8`.

The supervisor file reports 14 tests, 2 failed, 184573 ms. Its narrow failure sections are .txt:4525–4547; file result and durations are :1326–1337.

| Case | Current measured failure | x3 comparison | What execution reached |
| --- | --- | --- | --- |
| Restarts a SIGKILLed engine on its fixed port without changing durable authority | `Fake Unity did not report replacement.` at test:858; 42807 ms total | x3 failed earlier with `Fake Unity did not report started.` | Initial started and health events, owned engine lock, supervisor readiness, and successful SIGKILL assertion all preceded the failed 30-second replacement wait. Replacement identity, durable session/digest/revision, and later cleanup assertions were not reached. |
| Bounds engine crash loops and never touches an unrelated process | `Fake Unity did not report health.` at test:1052; 21924 ms total | Same x3 primary message | Failed in the initial 20-second health wait, before holding, owned-engine selection, or any of the three deliberate engine kills. This does not measure restart-budget exhaustion. |

Five other x3 supervisor failures pass in the new broad run. The packaged graph case, two-launch private-profile case, outage shutdown, helper cleanup, and concurrent owner/stale-incarnation cases now pass. This is evidence of changed observed reach, not proof that all remaining failures are harmless.

## Source-grounded paths and hypotheses

`tests/bridge-supervisor.test.ts:98–110` polls a requested observer event until its deadline. `FixtureObserver.waitFor` only searches for that named event; it does not surface a fixture `failure` event or an early supervisor exit. The failing waits do not include `processDiagnostics`.

The named executable helper `tests/fixtures/fake-unity-supervisor.mjs` was read as code only, without reading save fixtures. It reports initial health only after unauthenticated and authenticated fetches plus JSON decoding (:127–143). The crash-loop case does not first wait for `started`, so the retained message cannot distinguish slow supervisor startup, failure before helper launch, or helper health-fetch failure. The helper fatal handler writes stderr and sets exit 71 (:202–204), but that stderr is not attached to this test assertion.

For restart, the helper polls authenticated health for a changed runtimeInstanceId, with a 30-second loop and 1-second per-fetch abort (:163–194). It reports `failure` and exits 70 on expiration. The test independently waits 30 seconds from after its SIGKILL. An unchanged identity, unsuccessful health response, connection failure, slow replacement, or supervisor termination can all present as the same missing-event failure; the recorded output does not distinguish them.

The actual supervisor first cleans up the dead engine, then claims a bounded restart budget and waits 200/400/800 ms on the first three attempts before restarting on the fixed port (`bridge/supervisor/supervisor.ts:854–902`). Replacement startup retains a 60-second live-line bound and strict authenticated health handshake (:33–35, :655–680). Unity exit aborts replacement work. Consequently the helper/test 30-second observation window can expire before the supervisor's own startup allowance. Slow startup or scheduling under the broad run is a plausible hypothesis, supported only indirectly by the stage changes and mixed passes; no CPU/load trace or child log presently proves it. A real restart or health defect remains possible. No timeout relaxation is recommended.

## Retained logs and limits

Available retained evidence is the bounded core .txt/.json/.patch/preflight/postflight set and S/1361-land/attr-core-live/{core-failures.json,core-vsx3.json}. These preserve identities, messages, locations and aggregate durations, but the two failure sections contain no supervisor child output.

The test captures supervisor stdout/stderr in memory (`spawnSupervisor`, `processDiagnostics`) and the supervisor writes redacted supervisor.log, engine.log and unity.log in each owned launch directory (:523–533). Test afterEach (:130–137) cleans children and recursively removes each exact temporary profile. Thus those logs are not intentionally retained by this test on these missing-event failures. No unrelated temporary-directory search was performed, and the existence of leftover logs is not claimed.

If a focused failure recurs, a separately reviewed scratch diagnostic must retain only these owned redacted logs and event names/times before teardown, or expose bounded process diagnostics at the failed wait. Do not persist the raw `started` event: it includes the capability. Such instrumentation would be separate evidence, not the unchanged source gate. First perform the unchanged recorded follow-up below.

## Targeted recorded follow-up

After both UI and d16 postflight complete, reserve the sole heavy lane. Use a new exclusive stem, for example `1361-save45-supervisor-followup`, preserving the established recorder preflight/postflight, published exact HEAD check, source cleanliness, five fresh recorder outputs, 5 GiB disk guard, and caffeinate/power practice. Do not edit or reuse an active wrapper or overwrite prior evidence.

The recorder payload command, from repo root, is exactly:

```sh
PATH="$R/.venv/bin:$PATH" node "$E/run-bounded-source-c2.mjs" 1361-save45-supervisor-followup node_modules/.bin/vitest run --project core tests/bridge-supervisor.test.ts --reporter=verbose
```

Here R is the repo root and E is the relative evidence directory defined above. Surround it with the existing guarded `run-bounded-source-guards.py pre ... 0` and `post ...` protocol; run postflight even when Vitest fails. Bind HEAD explicitly to `2eaa697effc38538c37da28b486786ce267a2284` and its remote publication before starting. No test-name filter, retry loop, deadline override, source instrumentation, or assertions change. The whole file is already `describe.sequential` and checks all 14 related cases, including those now passing.

A 14/14 pass is a same-HEAD focused result; it does not erase the two broad-run failures or establish their cause. A recurrence requires retained owned diagnostics and a specific disposition before claiming supervisor closure. No runtime, rerun, source/index edit, fixture payload read, or temporary-directory scan was performed during this diagnosis.
