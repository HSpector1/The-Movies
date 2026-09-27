# 1103-B — Independent final verification sequence review

**KEEP on sequencing, source guards, exact commands and attribution boundaries; one prose correction requested.** Reviewed original 1103-A, **16,419 bytes / `89358841101ce66278114244f6bc67a0c1d888c9455b5a0b6748f21e600bdae3`**. No patch application, compiler, test, gameplay, producer or verifier execution occurred. Only file/JSON/hash checks and source/document reads were used. B/1065 remains active, so consumed source/HEAD/index stay frozen.

## Guarded application

Independent hashes match both frozen stage manifests and patches:

| Artifact | Bytes | SHA256 |
|---|---:|---|
| 1093 manifest | 18,545 | `68a42bbae2a04d92f8778621e5e37efc7e891cf1ea62f5a738108c22497a57ea` |
| 1093 patch | 73,024 | `c1ee31f0059ca11b6c94b7bb72469683ee4193782e1f3f78bc9e840cd061f00b` |
| 1096 manifest | 142,004 | `b8bb99baaa1a904059850f4778bce112affdfff9e0b6f2c8c54021013116f78a` |
| 1096 patch | 99,034 | `91307a13f624a797c1bfff4909bc73fd74f5928edc5b9fc668a754b5099cb17e` |

Every 1093/1096 baseline and staged copy matches its declared size/hash. All 37 live 1093 preimages and all 62 captured 1096 `liveSha256` identities still match. All nine overlapping 1096 baselines exactly equal their named 1093 staged result. Consequently the sequence must be 1093 guards/check/apply/postimage proof, then 1096 **baseline** guards/check/apply/postimage proof. Reusing the initial `liveSha256` comparison after 1093 would be wrong on those nine paths; the plan explicitly avoids it. Any new preimage mismatch requires attribution, never reset/force/three-way application or replacement from old copies.

The guarded union is **37 + 62 − 9 = 90 paths**. 1096 changes 60 relative to its own baseline; its two unchanged copies are `tests/bridge-p14b3-promise-command.test.ts` and `tests/bridge-p14b4-runtime47-compatibility.test.ts`, each already changed by 1093. Independent comparison of the **current proposed final bytes** against the original live preimages finds **90 actually changed paths**, with none cancelling back to the original. This is a measured property of these exact staged inputs, not a rule that a guarded union always equals a diff. Parent must independently remeasure the actual final live path set/postimages and retain the intermediate and combined application evidence.

The held B5 original pin table, runner and family12 body are preserved by these stages. A later causal pin amendment would be a separate author-owned diff/review/focused result and could not be silently appended to either frozen patch. All completed endurance/forensic commands and their source-sensitive guards must close before any staging application or index/HEAD movement.

## Commands and gate scope

Data-only comparison confirms 1093's entire `1048`, `1049` and `1051` argv arrays are exactly their actual original recorder commands. 1096's `verificationCommandForParent` equals both the 1053 command and 1084's selection. The 1086/1052 group is deliberately the one exact failed cash leaf; it is not presented as an unchanged whole-scaffold rerun. The manifest-pinned launcher extracts the existing arrays without reconstructing regexes or filenames, records the chosen command and propagates child errors/signals/status. No timeout/worker/env/exclusion change is introduced.

The full core command equals actual 927 (`node_modules/.bin/vitest run --project core`). Full UI uses actual 673/713 (`npm run test:ui`); package.json still expands that to `vitest run --project ui`. One matched invocation suffices; running the equivalent direct command again would not add a distinct gate. Root/UI/Bridge type checks and both generator `--check` commands match 1074's final-gate contract. Bridge `noEmit:true` is present in the unchanged configuration. The ordinary graph includes the original 1052 driver through the observer type import; its extra byte guard remains required. Separate 1098/1100 compiler records are not implicitly replaced by this graph.

The plan preserves real outgoing52/51 artifacts and frozen declaration fixtures; F10/F11 use the measured 1047 body identity. Generator checks do not authorize rewriting historical fixtures or regenerating source without a separately attributed need. No new native consumer gate is represented as executed.

## Attribution and remaining qualification

I checked 1052's raw **101 PASS/1 FAIL/102**, 1049's **49 PASS/62 FAIL/111**, 713's **2655 PASS/30 FAIL/5 skipped plus one unhandled error**, and the exact record commands. The plan correctly treats 936 as a composite qualification over 927 and focused repairs, not a later all-green full run. It keeps the 23 inherited 1088 failures separate from 242 staged boundary causes and the held B5 gameplay cause. Matched identity/complete first-cause attribution, explicit path/title normalization and separate unhandled-error tracking are required; a passed former first assertion does not qualify masked downstream assertions.

The 719 FU-1 three-identical-full-run return condition and FU-2 unchanged 20-second threshold remain intact. The plan neither schedules speculative repetitions nor treats one vanished timeout as a performance fix. K1–K4, failed L1/L2 cached natural premise, both original R8 timeouts, standalone R8 semantic success, actual current1062 validity and any invalid-only1100 collection remain distinct. Funded A/B/C/D evidence cannot erase these limits. A materially changed final candidate requires applicable matched verification; unchanged completed evidence is reused within its actual scope.

## Requested prose correction

Original 1103-A §3 group1 says the single selected failed cash test leaves “Other100 cases.” The actual 1052 result is 102 total, one failed: **101 other cases** remain outside that selected rerun. The author was asked to change that sentence only, preserving the original frozen identity above. No command, case name, assertion, limit or source fix follows from this arithmetic correction. Final corrected document identity will be appended after handback.

## Final named correction — KEEP

The corrected 1103-A is **16,419 bytes / `599a26f832398554be64708132cb5e1d6d4eb5761a636a8917f97462020590d9`**. Independent byte-only reversal of its single `Other101 cases` → `Other100 cases` change reproduces the entire original **16,419-byte / `89358841…`** document exactly. There is no other delta. **Final disposition: KEEP** for the future parent-owned guarded application/verification sequence, subject to the stated active-run closure and actual-result boundaries. Nothing was applied or executed by this review.
