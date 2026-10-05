# Ledger r4 lowspace r2 — post-checkpoint execution plan

**Prepared only; no run authorized by this file.** `S` means `/Users/zacheryspector/studio-scratch`. Execute after the forthcoming GitHub evidence checkpoint is pushed and remote-verified. This uses reviewed `S/1368-ledger-lowspace-runner-proposal-r2/run.py` SHA-256 `7eb654ebd6b45ab297262b38315414643a1ac26d08b3a03c7b78dcd875aa6f4d`, proposal manifest `c22813f8145742b0a8a418d663447e7ed80f1963b419a9ef7bcb823a339dd414`, independent static ACCEPT receipt `S/1368-ledger-lowspace-independent-review-r1/RECEIPT.json` SHA-256 `e06f949b8cdd0f82bbbf0a55b987b8af87e1e666f91a8d0c9b11564f03e1e3d9`, and frozen original r4 manifest `3675e4d50a12bef7c1ffb13186f161844795512b20dc41f736d5872f964b995f`.

Read-only rehash for this plan passed: all 32 frozen r4 manifest members, 12 kit manifest members, four lowspace r2 proposal members and all 197 regular files in each C0/ABC arm. Arm04 combined assembly is `8d027bf8e9cd6aa5e874b6f053e14b5b17be3701c6f4966b3b42610cf7fd6b38`; ABC assembly is `c37c8d1a1c58a6729cc75a6fb5f38fd1158f60c9cf17a54c7b290aeec1a9f259`; ABC source pins are `43ee074d7833ddae4993794b9084d603bb7eebd2943de7b7949e31759b5de336`; kit manifest is `01cea5e3beffcb65032dbd45bbb8c56a44016c913bff27c0f756e58d04353a53` and kit source pins are `a2ba20f3ac5009f11c938ec55b7cb21371f1f8d3b74b7febe0f344e95f93a61a`. The runner independently rechecks these and all exact source/entrypoint/index guards at parent, child and postflight. No frozen kit, arm or live file is edited.

Before **each** launch, confirm the heavy lane is idle, no writer or recorded postflight is active, AC/power is suitable, at least 3 GiB is free, target scratch leaf and five formal stem paths do not exist, and the full local working-branch HEAD equals `git ls-remote --exit-code origin refs/heads/wip/headless-program-20260916-ts`. Set `LEDGER_HEAD` to that **newly verified full SHA after the checkpoint**, not the pre-checkpoint `af16f53feb1edcb51d7e9dff109d43c7be2ec804`. A later docs checkpoint may advance HEAD between modes; recheck and substitute the new full matched HEAD while all pinned source/kit/arm inputs remain identical. The runner refuses mismatched HEAD/source/index. Run through `S/heavy-queue/lane-run.sh` one mode at a time with fresh log paths; never reuse a partial leaf. The 3 GiB floor is an operational choice, not a measured safe minimum.

In the live repo, refresh the command variables before each mode, and stop if the equality check fails:

```sh
LEDGER_HEAD="$(git rev-parse HEAD)"
LEDGER_REMOTE_HEAD="$(git ls-remote --exit-code origin refs/heads/wip/headless-program-20260916-ts | awk '{print $1}')"
test "$LEDGER_HEAD" = "$LEDGER_REMOTE_HEAD"
```

After admitting the types RESULT, set `LEDGER_TYPES_SHA` from its exact path; after admitting clean, set `LEDGER_CLEAN_SHA`. Rehash them again immediately before consuming them:

```sh
LEDGER_TYPES_SHA="$(shasum -a 256 /Users/zacheryspector/studio-scratch/1368-ledger-recorded-runs-r4-lowspace-r2/ABC-types-source-r1/RESULT.json | awk '{print $1}')"
LEDGER_CLEAN_SHA="$(shasum -a 256 /Users/zacheryspector/studio-scratch/1368-ledger-recorded-runs-r4-lowspace-r2/ABC-clean-p13a-r1/RESULT.json | awk '{print $1}')"
```

The clean SHA line applies only after clean completes; do not run it while preparing types or clean.

1. **ABC types.** With `LEDGER_HEAD` set from that exact local/remote check, run:

```sh
bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/heavy-queue/1368-ledger-r4-lowspace-r2-types-r1.log python3 -B /Users/zacheryspector/studio-scratch/1368-ledger-lowspace-runner-proposal-r2/run.py types --arm ABC --head "$LEDGER_HEAD" --manifest-sha256 3675e4d50a12bef7c1ffb13186f161844795512b20dc41f736d5872f964b995f --self-runner-sha256 7eb654ebd6b45ab297262b38315414643a1ac26d08b3a03c7b78dcd875aa6f4d --leaf r1
```

Output: `S/1368-ledger-recorded-runs-r4-lowspace-r2/ABC-types-source-r1/RESULT.json`; formal stem `1368-ledger-r4-lowspace-r2-abc-types-source-r1`. Record the actual SHA-256 of this completed RESULT as `LEDGER_TYPES_SHA` only after admission.

2. **ABC clean p13a.** Recheck HEAD/lane/free space, set `LEDGER_HEAD` again, and require the exact types RESULT path and accepted SHA from step 1:

```sh
bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/heavy-queue/1368-ledger-r4-lowspace-r2-clean-p13a-r1.log python3 -B /Users/zacheryspector/studio-scratch/1368-ledger-lowspace-runner-proposal-r2/run.py clean --arm ABC --seed p13a-core-causal-01 --head "$LEDGER_HEAD" --manifest-sha256 3675e4d50a12bef7c1ffb13186f161844795512b20dc41f736d5872f964b995f --self-runner-sha256 7eb654ebd6b45ab297262b38315414643a1ac26d08b3a03c7b78dcd875aa6f4d --leaf r1 --types-receipt /Users/zacheryspector/studio-scratch/1368-ledger-recorded-runs-r4-lowspace-r2/ABC-types-source-r1/RESULT.json --types-receipt-sha256 "$LEDGER_TYPES_SHA"
```

Output: `S/1368-ledger-recorded-runs-r4-lowspace-r2/ABC-clean-p13a-r1/RESULT.json`; formal stem `1368-ledger-r4-lowspace-r2-abc-clean-p13a-r1`. Record its actual accepted SHA-256 as `LEDGER_CLEAN_SHA` only after admission.

3. **ABC observed p13a.** Recheck HEAD/lane/free space and both prerequisite RESULT SHA values, set `LEDGER_HEAD` again, then:

```sh
bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/heavy-queue/1368-ledger-r4-lowspace-r2-observed-p13a-r1.log python3 -B /Users/zacheryspector/studio-scratch/1368-ledger-lowspace-runner-proposal-r2/run.py observed --arm ABC --seed p13a-core-causal-01 --head "$LEDGER_HEAD" --manifest-sha256 3675e4d50a12bef7c1ffb13186f161844795512b20dc41f736d5872f964b995f --self-runner-sha256 7eb654ebd6b45ab297262b38315414643a1ac26d08b3a03c7b78dcd875aa6f4d --leaf r1 --types-receipt /Users/zacheryspector/studio-scratch/1368-ledger-recorded-runs-r4-lowspace-r2/ABC-types-source-r1/RESULT.json --types-receipt-sha256 "$LEDGER_TYPES_SHA" --clean-receipt /Users/zacheryspector/studio-scratch/1368-ledger-recorded-runs-r4-lowspace-r2/ABC-clean-p13a-r1/RESULT.json --clean-receipt-sha256 "$LEDGER_CLEAN_SHA"
```

Output: `S/1368-ledger-recorded-runs-r4-lowspace-r2/ABC-observed-p13a-r1/RESULT.json`; formal stem `1368-ledger-r4-lowspace-r2-abc-observed-p13a-r1`. Never use an r3 or original r4 types/clean receipt as an r2 prerequisite.

**Admission after every mode:** wrapper end and exact formal pre/postflight, record/RESULT command and binding hashes, source/HEAD/index/manual equality, `allGuardsExact`, actual child exit **0**, recorder exit **0**, `timedOut=false`, empty `reportingErrors`, and process-group `cleanupVerified`, `noSurvivors`, `leaderReaped` all true. Rehash every RESULT `artifacts` entry and the formal files. The types mode needs the one TypeScript child exit 0. Clean/observed additionally need `data.completed=true`, `sourcePostflight=true`, exact ABC/p13a/416-week identity and source pins, one JSON test PASS/zero FAIL, and the eight progress weeks 52,104,156,208,260,312,364,416. Observed requires the accepted same-source/same-seed clean and types receipts. A wrapper exit 0 alone proves nothing. A nonzero child, timeout, incomplete/unknown cleanup, missing CHILD/RESULT/postflight or guard mismatch is a failed prerequisite: preserve all original receipts/partial progress and stop, with no blind retry, repin or deadline change. Only after both complete should the unchanged comparator be applied to accepted C0 baseline plus ABC clean/observed under a separately reviewed baseline-source decision; it must prove clean/observed parity and report historical/current differences without assigning cause from timing alone. Four protected C0 digest differences remain unrepinned.

**9:05 PM CDT cutoff (2026-10-05):** no new heavy mode starts at or after 21:05 America/Chicago. If an owned bounded mode is already active then, let its 330-second watchdog and formal postflight finish and preserve the result; do not start the next mode. Stop the sequence at the first failed prerequisite or when the cutoff prevents the next safe launch. The cutoff is a scheduling stop, not a changed simulator timeout, approval to kill a child, or permission to call a missing route complete.
