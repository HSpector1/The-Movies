# AG→E0G r4 four-leaf observed types audit

Decision: **ACCEPT_OBSERVED_TYPES_ONLY**. All four recorded compiler leaves passed. This admits only the TypeScript stage for the two seeds in both arms; it does not admit clean simulation, 416-week neutrality, B-only attribution, or 1363 closure.

The frozen r4 manifest (`0cfa8742a10498d4ca1c68137ca9cb75e3ed9d3e6e8307764e7b729febed507e`), runner, outer, four-command file, and fixed independent review receipt (`fcbf643168b69dd8505d0a08de6414dd2bf0ab3f025c9b6d0bdce6829ece451f`) match their SHA-256 pins. The full 412-file/30-directory/two-symlink inventory, 12 external pins, and genuine fixture source match. The live repo and remote work branch remain at HEAD `5bfae40e1c1a68356fca4df601ed398d2b4dec1a`, source tree `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`, with a clean worktree.

| Arm | Seed | Run ID | Outer elapsed | Result |
| --- | --- | --- | ---: | --- |
| AG | adoption | `ag-adoption-types-ag-adoption-types-20261006-r1` | 49.86s / 330s | TypeScript exit 0 / 300s, no timeout |
| AG | p13a | `ag-p13a-types-ag-p13a-types-20261006-r2` | 48.90s / 330s | TypeScript exit 0 / 300s, no timeout |
| E0G | adoption | `e0g-adoption-types-e0g-adoption-types-20261006-r1` | 36.12s / 330s | TypeScript exit 0 / 300s, no timeout |
| E0G | p13a | `e0g-p13a-types-e0g-p13a-types-20261006-r1` | 36.92s / 330s | TypeScript exit 0 / 300s, no timeout |

For every run, the target and outer results are `STAGE_PASS`; target result, both sidecars, watchdog, and all four logs match their recorded hashes. Both target logs are empty. Preflight and postflight source/runtime inventories match, and the target and outer identities agree with the pinned manifest. The outer recorder reports no ownership errors, no pre-cleanup survivors, successful cleanup of both known process groups, and no final survivors.

The r4 independent static review path had a concurrent reviewer overwrite before these launches; its current REVIEW.md SHA-256 is `2e3da5b12bee308e16f6e24d639fe3a4d4cb15544260fe778f46e729f041fe33`. The fixed five-key RECEIPT.json is unchanged and SHA-pinned in all four outer results. This observed audit does not use the overwritten prose as an immutable input. Preserve the r3 missing-fixture TypeScript failure separately.
