# 1115-B — Independent guarded maintenance helper review

**KEEP for source readiness.** The frozen helper implements the reviewed 1093 →1096 →1110 application order, exact postimages, protected-file guards and six verification argv extractions. The recording clarification in final 1115-A is required: intentional applying modes are mutations, never fixed-source verification. This report releases no operation during D and claims no helper, application or test result.

Reviewed identities:

| Input | Bytes | SHA-256 |
| --- | ---: | --- |
| `1115-c3-guarded-maintenance.mjs` | 18,400 | `5e6ecf38bfbbda091d5d43d9534ed42edd893e08c5f0e4a0d159bcafd84bbbf1` |
| Final `1115-A-c3-guarded-maintenance-handback.md` | 9,480 | `76f6f35e74c126d17e0dc68ef252de8dccfa93007e9174bc4cb87173f3fcfd4b` |

The original 8,234-byte handback / `0bdb225337fe45d531030aa91c910de921a0b7b0b3a5c676bc1df953639ddc3e` is retained explicitly in its amendment. The helper did not change. Review used source reads and independent standard-library data/hash parsing only; no helper mode, syntax check, project module, compiler, gameplay or Git apply was invoked. No live or staged candidate byte was written.

## Independent byte and command checks

Rehashed all three manifest/patch pairs and all 100 copied baseline/candidate pairs. An independent in-memory unified-diff parser, accepting both actual patch header forms, reconstructed each candidate from its exact baseline: 79 hunks/37 changed paths for 1093, 160 hunks/60 changed paths among 62 copies for 1096, and one hunk/one path for 1110. No reconstruction was written to the workspace. The three patch identities remain respectively `c1ee31f0059ca11b6c94b7bb72469683ee4193782e1f3f78bc9e840cd061f00b`, `91307a13f624a797c1bfff4909bc73fd74f5928edc5b9fc668a754b5099cb17e` and `223f9dd43767b4d592160118b68901a231773339acc283a56c720dd9a690efa8`.

Verified nine first/second-stage overlaps, 53 other second-stage baselines, exact B5 layering and all 90 original live preimages. Sequential maps produce the actual changed-path counts **0 →37 →90 →90**, not a sum of overlapping files. Both unchanged second-stage copies still retain their first-stage changes. The helper independently reconstructs the complete final B5 candidate from only the three unique, fixed-offset, same-length literals and pins its declared causal authority inputs. Every other byte stays under the already reviewed 1110 contract.

The first five extracted command arrays preserve 1103's exact ordering; the sixth is the separately required B5 leaf:

| Group | Exact source and independently checked scope |
| --- | --- |
| `1086/1052` | Frozen 1093 `verificationGroups`: the one cash historical-carrier leaf, seven argv elements; exact 1103 leaf name. |
| `1048` | Frozen 1093 array is literally the recorded `1048-c3-current-metadata-first.json` command, including its complete nested Node launcher, selector pin and four extra leaves. |
| `1049` | Frozen 1093 array is literally the recorded `1049-c3-current-runtime-first.json` command: seven whole runtime files. |
| `1051` | Frozen 1093 array is literally the recorded `1051-c3-process-restart-first.json` whole-file command. |
| `1053` | Frozen 1096 array exactly equals the pinned 1084 selection's 65-element argv, including all 61 file paths. |
| `1110` | Frozen 1110 array selects the existing B5 natural-chain leaf; the source adds no alternate seed, filter, timeout or expected-failure threshold. |

The helper returns these arrays without executing, shell quoting or reconstructing their regex. Full type/generated/fixture/core/UI gates remain the separately recorded commands in 1103. Extracting argv does not run or qualify them.

## Application and preservation review

`loadBundle` admits immutable manifests, patches and all copies before deriving the four phase maps. It refuses unexpected patch paths or ordinary-text changes that claim creation/deletion/rename/copy/binary/mode changes. Paths stay under existing `tests/*.ts|tsx` targets; `safePath` rejects absolute/traversal/backslash/NUL/symlink paths. These checks supplement the exact patch pins rather than trusting an arbitrary patch description.

Preflight requires all 90 original target preimages, an empty consumed diff, no untracked consumed input and no staged consumed delta. `sourceSnapshot` captures the actual current HEAD, complete Git index identity and all tracked consumed file bytes. Each later phase compares the full path inventory and every non-target byte against preflight, plus exact target postimages and the derived changed-path set. The five qualified force-order files have additional explicit pins. Newer production, fixtures, generated declarations, UI and unrelated tests cannot be silently reset to an older stage.

Each applying invocation requires its preceding PASS audits under the same producer and output prefix, rechecks their linked started records/patches/prior audits and verifies the appropriate live phase. It runs ordinary `git apply --check`, then rechecks the unchanged live inventory, actual HEAD/index, phase and every guarded input before ordinary `git apply`. There is no `--3way`, index update, force, reset, copy-over repair or implicit next stage. After application it verifies the exact next phase, protects non-target bytes, rechecks frozen inputs and captures the full cumulative diff with renames disabled. A final source snapshot must equal the audited postimage through that capture.

The helper permits a docs-only checkpoint between operations without requiring the historical stage HEAD. It requires actual HEAD and the complete index to remain unchanged within each invocation; consumed staging/commit must wait until final verification. This is compatible with recoverable checkpoints while preserving D's consumed tree during its active run. The helper itself has no D-completion oracle: its execution remains gated by the parent's reviewed sequence after D closes and is reviewed.

Exclusive started/final/patch outputs prevent overwriting prior evidence. An in-operation refusal records FAIL and the actual remaining boundary/diff where readable, sets a nonzero exit and neither rolls back nor retries. Later modes cannot treat that failed audit as a predecessor PASS. A crash can leave only the started record; that is incomplete evidence. Failure preservation is a refusal to hide the state, not a promise that an I/O failure can always write an audit.

Final 1115-A correctly supersedes its earlier generic recorder instruction: direct applies use the helper's explicit before/after audits, because their consumed-source change is intentional. Read-only `preflight`, `verify-final` and `argv` may use a fixed-source recorder. Wrapping an applying mode must preserve/disclose expected drift and its recorder status, never label it fixed-source PASS. No change to helper behavior is needed.

**Final disposition: KEEP, unexecuted.** The independent reconstruction and source review establish readiness for the exact already authorized sequence after D; actual apply audits, paired checks, final types/generated checks, full suites and matched failure attribution are still required. The 23 inherited failures, original canonical L1/L2 and R8 limitations, and the valid-current versus invalid-forensic B5 distinction remain unchanged. Neither helper readiness nor a future byte-application PASS is a gameplay or all-green qualification.
