# 1095-B — First endurance failure and bounded snapshot diagnostic review

Independent result/source review; no compiler, snapshot, runtime, gameplay or diagnostic was invoked by the reviewer. Disposition: **KEEP the first failure as recorded; REFINE the observer equality oracle only after the bounded two-read diagnostic.** No B/C/D successor or production snapshot change is justified by this failure.

## Actual1056 scope

1056 closed2026-09-27 02:45:00.691 UTC, child1,6.184 seconds, fixed `8599ee2a2254bde7c2e6be61e712cdc4dc686eea` with empty consumed patch. Driver was the reviewed66,372-byte `f7d19d39…`; observer was `ddcb9e27…`. The exclusive `1052-c3-endurance-A-first` directory is retained unchanged.

Independent metadata/log/data readback confirms0 tick attempts and0 completed ticks;16 accepted engine-invoked startup commands, all atweek0; six creators; one set-maintenance command; no commissions, greenlights, releases, promise attachments or runtime sample. Startup completed only through `startup-15`; the seventeenth command and any week1 policy remain unexecuted. The declared initial20M→2B arrangement used the exact1.98B balancing ledger delta.

The first read group attempted one people discovery and two snapshots; zero Calendar, Industry or Market calls followed. Three selected profiles and both snapshot wire parses completed. Public-discovery purity matched the retained complete430,333-byte initial checkpoint SHA256 `597997206fa098ec8664e58b797db30dee30ccd2063cdce371762f5c4159e614`. The second snapshot failed `same-authority repeated snapshot exact response` before its raw-response identity was recorded. Thus1056 itself does not contain a complete recursive diff of both responses and does not prove that only one response path changed.

The five retained files listed by metadata were independently rehashed and all matched. The original failure, input, complete failed-attempt authority, commands and partial observations are preserved. A retained last-admitted checkpoint is not a passed read group; `readWeeks` is correctly empty. No active-period, runtime sample or end-to-end endurance qualification follows from this attempt.

## Source cause and exact invariant

`bridge/session.ts:1511–1583` computes a fresh `metrics.serializationMs = performance.now() - started` for every snapshot. `metrics.payloadBytes` independently measures the snapshot's actual partial JSON payload. Comparing the entire response with the timing value included imposes an unsupported repeatability requirement on telemetry. This is an observer-oracle defect; the source evidence does not show mutated gameplay or authorize changing the production snapshot.

The corrected invariant is exact equality of every snapshot field except the single leaf `/metrics/serializationMs`. In particular retain exact protocol/schema/snapshot/session/revision/week/digest, complete projection, available intents, founding, saved slot, treasury, the metrics object shape and `metrics.payloadBytes`. Every actual timing must be a finite, nonnegative number. Do not require the two timings to differ; equal clock measurements are also lawful. Do not remove all metrics or broadly ignore numeric differences.

Keep raw actual response byte identities before comparing a detached equality view that omits only this one timing leaf. Do not mutate either response or the source state to normalize it. Full current Save38 bytes before/after each read remain equality authority; the driver separately retains its authoritative-state purity check.

## Parent-owned bounded diagnostic contract

Use only the exact retained `metadata.initialCheckpoint` above, admitting its current38 canonical bytes and pinning the metadata/input/producer/source identities before and after. Construct one detached current BridgeSession. Reserve exactly two actual `session.snapshot()` calls at the same session/revision; zero actions, ticks, Save/Load commands or runtime stores. Current validating exports before/after each are read-only admission/purity checks, not gameplay.

Validate both actual snapshot schemas; hash and count both complete responses before any repeat assertion; independently traverse both complete objects to report the exact changed JSON-pointer paths and leaf values. The changed-path set may be empty or contain only `/metrics/serializationMs`. Require the exact equality view with only that single leaf omitted, exact payloadBytes, and finite/nonnegative actual telemetry. Preserve the full current-state equality after each call. No source patch is applied merely because the observed failure suggested this field.

The output remains compact with exact response/input identities, timing values, changed paths, actual call count, purity and guard results; no new scenario, gameplay or broad telemetry policy is added. The diagnostic's exit/result is separate from the retained1056 FAIL. If any other response or state path changes, stop and attribute it; do not expand exclusions. A later observer correction and new exclusive A invocation need their own source freeze/verification, preserving this first attempt and all unexecuted limits.

## Frozen diagnostic source — KEEP

Independently read/hashed parent `1095-c3-snapshot-repeat-observation.ts`:3,670 bytes, SHA256 `56e49b9ea218d91e9cfc233692df65071fe43614f86f682ce956cfa418651ed7`. It pins the retained metadata SHA `6bdc57689fd61d77c26fb35ce1fd1768bc376a81e9d3102c43840e1829cb5181` and complete checkpoint SHA above, requires the failed original source/zero-tick attempt, validates current38 and detached import, and reserves exactly two snapshots.

Both schemas, finite/nonnegative actual timing and full authority after each call are checked. Both actual response identities are emitted before recursive comparison; differing-path output is capped64. The equality view removes only `serializationMs` from a copied metrics object, keeping payloadBytes and all other fields, and never edits either actual response or state. Timing equality is allowed. The original input file is rechecked. Recorder source/HEAD and manual producer before/after pins remain parent-owned prerequisites. No game action, tick, creation, store or persisted evidence mutation exists. **KEEP for the bounded recorded diagnostic; result remains unexecuted at this source review.**

## Actual1057 diagnosis and narrow observer correction

Independently read1057 raw output and metadata: child0, fixed empty source patch on8599ee2a,2026-09-27 02:48:10.098–02:48:15.100 UTC,5.002 seconds. Exactly two snapshots and zero ticks completed; schema/admission/purity/input guards passed. The sole recursive changed path was `/metrics/serializationMs`,547.8463750000001 versus424.3255329999997. Both payloadBytes values were603,724; both complete canonical responses were603,794 bytes, with distinct actual raw hashes `8f88ecc2dd10b689e180c9c82d0068ab87d4526c0a6ea93b57292c379f6b07c3` and `58b0cdd008d9a3bd09cadbbf75ea4ac8d0e13ee7ecd10bda859c454bfee8d1e9`. All other fields were exact. The single-field-omitted equality view was603,758 bytes, SHA `a795bee8d24fb8b39b744ba11bd4282157de65c4165f971c3d965aa53abee865`. These are sample timings, not latency qualification.

Parent's observer-only correction is independently matched at29,949 bytes, SHA `a8685dc06b3ab0d9386420d762b017ac4198d7cb6f21305770dbcd499a763f4a`. The exact diff moves raw response recording before repeat comparison, requires finite/nonnegative timing, and compares a detached response view whose copied metrics omit only serializationMs. Strict schemas, payloadBytes, every other response field, per-group/full authority checks, query/call bounds and all runtime code stay intact. Driver remains66,372-byte `f7d19d39…` unchanged.

**KEEP the measured cause and narrow source correction.** The original1056 FAIL remains. The two-read diagnosis does not qualify the previously unreached Calendar/Industry/Market/runtime/activity paths, and there is no B/C/D progression. Corrected full Bridge typing and a separately recorded exclusive A invocation remain required;1058 typing is pending at this source review.
