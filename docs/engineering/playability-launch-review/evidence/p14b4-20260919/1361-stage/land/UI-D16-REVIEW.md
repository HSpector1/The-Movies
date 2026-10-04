# Independent completed UI and d16 attribution review

Verdict: **UI passes its recorded run; d16 preserves exactly the declared baseline failures.** The completed artifacts support those bounded dispositions. This does not close the separately reviewed core timeout/supervisor follow-ups or approve the entire Save45 checkpoint.

Reviewed by `/root/founding_charter`, 2026-10-04, using only the named completed records, raw reports, guards, baselines and attribution runner. Static Python reads independently recomputed hashes, guard equality, report counts and comparisons. No test/runtime, source/index/HEAD change, fixture read or nested agent was used. The active disclosure follow-up was neither read nor touched. Only this report was written.

## Results and guard attribution

Both runs record source HEAD `2eaa697effc38538c37da28b486786ce267a2284`, unchanged through their respective intervals. Their 1,190-file bounded source inventories, manual pins, index and staged-entry digests match between preflight and postflight. Remote/head identity agrees in the recorded preflight. Tested patches are empty and untracked-source lists are empty at both recorder boundaries. `fixedSource` and `allGuardsExact` are true, with no recorder signal or execution error. All recorded postflight raw/record/patch hashes were independently checked against the completed bytes; the derived attribution guard files agree.

| Run | Recorded UTC interval | Files | Cases | Child exit |
|---|---|---|---|---|
| UI | 23:07:26.332–23:22:16.255 | 204 passed | 2,692 passed; 5 skipped; 0 failed; 2,697 total | 0 |
| d16 | 23:22:59.226–23:27:19.031 | 7 passed; 3 failed; 10 total | 164 passed; 12 failed; 176 total; no pending/todo | 1 |

UI raw summary and independently counted 204 unique `|ui|` file-result rows agree; their per-file test counts sum to 2,697. No failed-case or unhandled-error section was found, and the parsed failure inventory is empty. The five skips remain skips. The failure set equals the x3 empty failure set. All three failure identities in the named 1358 UI baseline are absent from this completed run. That is an observed outcome, not a new causal attribution or a claim that every earlier intermittent condition is permanently fixed.

d16's external JSON report is bound to the exact recorded command and output path. Its report start and every file's start/end fall within the completed recorder interval, and the raw log names that JSON output. There are exactly 176 unique `(relative file, fullName)` case identities. Independent comparison verified the complete identity/status map against the baseline, as well as **every full `failureMessages` array**, not merely the primary sentence. Counts and raw summary agree. No runtime-error test suite is reported.

Normalization is restricted to each run's exact checkout prefix: `/Users/zacheryspector/studio-scratch/1361-d16/base/tree/` for the baseline and `/Users/zacheryspector/The-Movies-headless-program/` for the current run, mapped to `<tree>/`. A prefix immediately followed by `node_modules/` is excluded from replacement. Shared dependency paths, line/column numbers and all other message content remain exact. The resulting 12 failure arrays are identical; there are no new, missing or changed failed identities. The cases remain real baseline failures, not GREEN tests.

## Exact completed artifact hashes

All values below are SHA-256. Evidence paths are under `docs/engineering/playability-launch-review/evidence/p14b4-20260919/` unless prefixed `S/`, which means `/Users/zacheryspector/studio-scratch/`.

| Artifact | SHA-256 |
|---|---|
| `1361-save45-broad-ui.json` | `7e0515b8bc28ef20c1da92c95fec50672f6c5cd6382d25c08bcd0b600522d9e4` |
| `1361-save45-broad-ui.txt` | `1ea18ff09ac49474678636bdc6da66b692fb17abc50d652bc9bcef829f3298fc` |
| `1361-save45-broad-ui-preflight.json` | `e4698135f78cc71ecc4ef4454b336e64db16c553b55bfc77c9bf807b9244ec7d` |
| `1361-save45-broad-ui-postflight.json` | `5efd92f9091194a6325fed1fc5b1f6893d2c4e44701375258694ed7a55536fcc` |
| `1361-save45-broad-d16.json` | `3255f2843e1c364c2874a9dde5c5231b39ad0364e6d32b68067075fca73fb64e` |
| `1361-save45-broad-d16.txt` | `b2d44718d4a4c87187a504d972953bd417cdbd0826d7d5abdc7e1ae3e5f7e905` |
| `1361-save45-broad-d16-preflight.json` | `47f95940e4a635b2c6978f325939dc80c0318a79bcbf3395bad0b47e33998a2d` |
| `1361-save45-broad-d16-postflight.json` | `54fdd951fceaf1d618a42bc95c9fa618199c6a1bf6f83304a754e72713d8494b` |
| Both named `.patch` files, each empty | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `S/1361-land/d16-vitest.json` | `eb0251e7de94cddc73546b6255d891e2260168d06fb95153794f7116798805b9` |
| `1361-stage/d16/d16-base.json` | `55eb745dc0f00853361376f49ae01dac278cbc6a2834b9311a5a4a3153dc5955` |
| `1358-I2-ui-failures.json` | `0ac75b4bfc36538040202685b95e61f99651e6debdd1d72e3a4d6f5663328e2a` |
| `1361-stage/sweep/x3/attr/x3-ui-failures.json` | `ae4e52e012bf7c39bd93bf001fd380865af0f11ba26efc692ab872e0c5d5053c` |
| `S/1361-land/attribute-recorded.py` | `1b596e4dd32c42526fa90c50976004101b38bee2fb1de094d23ab9c4f2b526ab` |
| `S/1361-land/attr-ui-live/guards.json` | `484d6b45cd526a32a9206935c71e9a34b8929b8cc9c2555ac321a8b48f8519da` |
| `S/1361-land/attr-ui-live/ui-failures.json` | `70c4cb059accf867e290f4ec0efedc60d0a1329a45d4d505736781375a880591` |
| `S/1361-land/attr-ui-live/ui-vs1358I.json` | `f66c08157c03c47c384adf1c51af15323d6da6c00813863893d5e654eedc07e3` |
| `S/1361-land/attr-ui-live/ui-vsx3.json` | `c86d504ca22d3085a8bf7d278d57817de68712e13b928f61d2c2e6a798d7e499` |
| `S/1361-land/attr-d16-live/guards.json` | `3c381d7f3ed50529aeeda5f2d2adf4276b92d8008c8254dafc2886470e5b6225` |
| `S/1361-land/attr-d16-live/d16-vsbase.json` | `ed512509350011bc722a4212f78fbde565088133cfc437769842d141f58a082b` |

## Limits

This review verifies completed artifacts and their internal/source-guard attribution; it does not rerun guards against the current working tree or claim a new measurement. UI comparison establishes the reported aggregate/file results and failure sets, not an independent all-case JSON identity/status comparison across historical runs. d16 does provide that full 176-case comparison. No test timeout or expected answer was changed during this review. The separate core follow-up decisions, remaining Save45 capture/fallout gates and future recovery work remain with the parent.
