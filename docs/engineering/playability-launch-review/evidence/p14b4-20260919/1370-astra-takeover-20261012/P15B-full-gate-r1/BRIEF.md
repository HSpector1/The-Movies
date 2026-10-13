# P15B complete core gate R1: failed; targeted repairs prepared

The production integration gate ran against the preserved159-file Save48 candidate on HEAD d65b27c0c3f07dec811a295efd32d088fe878fba. It completed the full core suite, found new failures, and stopped before UI. P15B has not landed.

| Recorded child | Exit | Time | Actual result |
|---|---:|---:|---|
| Root / UI / Bridge compilers | 0 / 0 / 0 | 43 / 43 / 31 s | Completed |
| Contract / fixture generators | 0 / 0 | 1 / 1 s | Completed |
| D16 | 1 | 91 s | 151 assertions:138 pass,13 fail;25 predecessor assertions uncollected due to collection failure |
| Complete core | 1 | 7,814 s | 5,800:5,607 pass,162 fail,20 skip,11 todo |
| Full UI | — | — | Not run |

Original gate/lane exit98 remains failed. The supplemental recorder returned0 with no postflight errors. Original before/after snapshots differed only in Git diff/status due to HANDOFF AUTO metadata; HEAD, index, staged patch, source files and required inputs were identical. The preliminary AUTO diff was captured during the run; later hook stamps are separate and must not be substituted for the recorded postflight. This is evidence of unchanged tested source, not permission to relabel the original gate successful.

Against actual Save47 core:68 failures have identical complete diagnostic arrays;61 failing identities are new;33 prior failures have changed arrays. Independent review classified those33 as22 stack offsets,7 era-marker changes and4 newly terminal-blocked promise prerequisites. Seven missing identities are five reviewed research-input replacements and two save-boundary title changes; their replacements passed. All17 additional skips belong to a failed doc03 suite with no captured setup cause. Assertion totals alone therefore do not establish completed coverage.

The45 new Bridge failures stop at stale current projection58/schema/hash or exact prior-registry membership expectations. Twelve other new failures concern closure/Legacy/archive controls; four concern finance-report size, commercial lighting setup, and two retirement consumer setups. Complete identities, original diagnostics and independent reviews are preserved. Fixes must execute the later assertions before those failures can be cleared.

Compressed raw JSON and both original freeze snapshots are lossless copies; SOURCE-RECEIPTS.json binds both raw and compressed hashes. Originals remain untouched in the scratch gate directory. No private Owner save or local machine inventory is included.

At the next safe checkpoint, independently reviewed repairs are preserved separately as an UNRUN candidate delta. They are not a P15B source landing. Source qualification still requires the failed-suite cause, lawful pending-family inputs, affected complete suites, complete D16 and full UI, plus independent disposition. Full live recovery/closure and cross-system acceptance remains open; no P16 restack or main merge is authorized by this result.

Resource preflight on2026-10-12 at23:29 CDT measured3,580,056KiB available on the shared Data volume, below the unchanged3,670,016KiB launch minimum by89,960KiB. The5GiB target is short1,662,824KiB. No test, cleanup or floor override followed. Detailed local power/memory/process receipts remain local. The Owner was asked to restore approximately1.6GiB while bounded code preparation continued.
