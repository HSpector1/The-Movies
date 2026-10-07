# r10 AG adoption CLEAN failure audit

Run `r10-ag-adoption-20261007-224614` is **FAILED**. This is a static, read-only audit of the existing run. No TS/Node/Vitest/game execution, source or package edit, partial-data cleanup, repin, or pass/admission claim was made.

## Identity and disposition

- Live repository `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`, clean worktree, HEAD and explicit remote branch both `b995a83e5363a3843f9b902e08c2df4dd95840cb`; `HEAD:src` is `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`.
- Package manifest SHA-256 `29495648e2bb4da45e90fd49c0e708d7c8338e22ff4ea2365a38c96e35ce2844`; static review receipt `77bb673a98e8ec61eabcea8de366052cc983b51a24748acb0ae5dcf427be89e1` says `ACCEPT_STATIC_CLEAN_ONLY`.
- AG, `p13-public-commercial-adoption`, clean stage, `EXPLORATORY_720_750`. Target `RESULT.json` SHA-256 `3e1f9a8b67f0d03090c1e1641812d87a816c6b91ac7f22cbe81abbf7a83e9515`: `STAGE_OR_GUARD_FAILURE`, `stagePassed:false`, `child.exit:1`, `child.timedOut:false`, error `child exited nonzero`. Outer `RESULT.json` SHA-256 `5cf2d282355c1c88d4234bb040ffa3f3a9f005ef1c2c668891177ad2128c47f3`: `GUARD_OR_CHILD_FAILURE`, `stagePassed:false`, `childExit:1`, error `runner failed`, elapsed 168.216 seconds of 750. Both `RESULT.sha256.json` seals match the actual RESULT bytes. Lane metadata says exit 1, and lane log repeats outer failure. `WATCHDOG.json` is `FINALIZED_AFTER_RESULT`, with the matching outer RESULT hash.
- The Vitest JSON reports exactly one test, zero passed, one failed. Its sole failure is `AssertionError [ERR_ASSERTION]: complete captures exceed 1 GiB` at `capture`, test line 85. The child wrote its JSON report and exited 1. There is no recorded timeout or second test failure.

## Exact partial boundary

The raw `boundaries.ndjson` is **1,069,911,027 bytes** (SHA-256 `d8fef4ae3a56021778764c121fccd261621e50b6bcc8027819ef8ecd381ec12b`), with 365 complete newline-terminated rows, boundaries and market weeks **0 through 364**. The last row is week 364. The 1 GiB cap is 1,073,741,824 bytes, leaving 3,830,797 bytes after week 364. The capture code constructs the next row, checks its individual 16 MiB cap, then checks `bytes + len <= 1 GiB` before `writeSync`; therefore the assertion occurred at boundary/week **365** and no week-365 row was written. The failed candidate row's exact length is unavailable because it was not retained. The existing rows are partial evidence only; there is no `summary.json`, no 417-boundary clean capture, and no terminal digest admission.

`progress.ndjson` is seven complete rows at 52, 104, 156, 208, 260, 312, and 364; week 364 recorded 130.290 seconds. The expected eighth progress row at 416 is absent. The progress write occurs after the corresponding capture, consistent with failure on the next capture.

## Guards and exits

- Target preflight and postflight are identical: expected HEAD and source tree, package inventory SHA `1de4eaa378ad4bc965738e458cd14cf80439ef7510732c40ac011dc764012351`, runtime digest `377f5d06726f292eb4b6bf80c288e84eb48716906a5ec331d36928ea46124356`, and AC power. Runtime mirror pre/post hashes also match at `599d1730b586f9577fd4b6f3cde5c575e3bc1d4c32cee6a3960189e604735005`.
- Outer preflight measured 4,663,197,696 free bytes against 4,563,402,752 required; last running check measured 3,580,362,752 against 3,221,225,472 required. Both report AC. The outer recorder stopped on nonzero runner exit before its own postflight branch, so no outer postflight measurement is claimed. No disk, AC, log-size, source, remote, inventory, or mirror guard error is reported.
- PGIDs 6497 (runner) and 6617 (Vitest) are in the outer `knownGroups`; cleanup is true for both, `ownershipErrors`, `survivedBeforeCleanup`, and `survivors` are empty. A later `ps` check found neither PID. Target child cap 720 seconds and outer cap 750 seconds were not reached. Logs contain only the written-result messages; both stderr files are empty.

## Static writer assessment

The current test writes one JSON line per boundary as uncompressed UTF-8 via synchronous `writeSync`; it hashes and counts those exact line bytes. Each row contains duplicate large state representations (`originalState`, `save`, and `owner`), so accumulated raw bytes grow while the state grows. The 1 GiB assertion is an output-policy limit, not a game-state mismatch. Removing it without a reviewed storage and verification design would weaken the clean route.

A sound **proposed** revision is to stream the same canonical newline bytes through one lossless gzip writer while updating the existing uncompressed SHA-256 and byte counter before compression. The verifier should stream-decompress, enforce each uncompressed row's 16 MiB bound, parse and validate exactly 417 ordered boundaries, compare the uncompressed byte count and digest with the summary, and also seal the compressed file's bytes. Writer completion and gzip finalization must be awaited before writing `summary.json`; backpressure, compressor error, fsync/close behavior, child failure, and partially written gzip must remain explicit failure states. Replace the raw 1 GiB cap only with an independently reviewed expanded-byte bound and a separately measured compressed disk budget; keep AC, free-space floor, wall limits, exact-source identity, and partial preservation. Compression speed and final file size are unmeasured, so this is static feasibility guidance, not approval to rerun r10 or a claim that a 720-second leaf will pass. A concatenation of independently gzipped rows could retain synchronous writes, but requires explicit concatenated-member verification and may add per-row CPU overhead; the single streaming gzip is the cleaner route.

The raw partial file and all original receipts remain in place. A new versioned, independently reviewed package is required for any changed writer/guard or rerun.

## Source files

- Target: `/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-recorded-r10/ag-adoption-clean-r10-ag-adoption-20261007-224614/`.
- Outer: `/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-outer-recorded-r10/ag-adoption-clean-r10-ag-adoption-20261007-224614/`.
- Source package: `/Users/zacheryspector/studio-scratch/1370-ag-e0g-full-state-clean-proposal-r10/`.
- `HASHES.sha256` alongside this report lists the source artifact hashes.
