# r8 AG p13a CLEAN failure audit — 2026-10-07

Scope: read-only inspection of preserved attempts. No TS, Node, Vitest, or simulation was run for this audit; original run files were not changed.

## Corrected run `r8-ag-p13a-clean-20261007-221105`

- The lane wrapper ended exit 1 at 22:11:25 UTC. Its explicit workdir was `/Users/zacheryspector/The-Movies-headless-program`; the old Downloads launch path was not used. The repository remains clean at local and remote `b995a83e5363a3843f9b902e08c2df4dd95840cb`, with `HEAD:src` `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`.
- Outer preflight passed AC and disk: 4,631,838,720 free bytes versus 4,563,402,752 required. Outer launched authenticated runner PID/PGID 1511. Runner passed its package/runtime/source/remote preflight and reviewed types admission, then launched Node/Vitest PID/PGID 1632 with `run --config vitest.neutrality.config.ts --reporter=json --outputFile .../vitest.json` from the AG immutable tree.
- Vitest exited 1 before loading the config. Target stderr SHA `f95fc4c594ebf305d0e40b87883e2dc22e4bb5e0a96820ed06309a944a7d198e` says `EACCES` opening `vitest.neutrality.config.ts.timestamp-1791411084901-2b052a1ec3db4.mjs` in that tree. The tree directory is mode `dr-xr-xr-x`; the TS config is read-only. Installed Vitest's nested Vite writes this temporary bundled config beside the original ESM config in `loadConfigFromBundledFile`. No `vitest.json`, `summary.json`, `boundaries.ndjson`, or `progress.ndjson` exists; the test did not start and no game simulation ran.
- Target RESULT SHA `ab907be564e814272c9c3f27a34846af7281738c27323730a715f808727dcb94` and seal match. It records `STAGE_OR_GUARD_FAILURE`, `stagePassed:false`, child exit 1, no timeout, and `AssertionError('child exited nonzero')`. It has preflight and types admission, no postflight or clean artifacts. Outer RESULT SHA `6d86be30270ad2028581cfb053cacfebe33d9546d89527bbd00c7bbf434c034b` and seal match. It records `GUARD_OR_CHILD_FAILURE`, `stagePassed:false`, child exit 1, no ownership errors, no groups alive before or after cleanup, cleanup true for 1511 and 1632. WATCHDOG is `FINALIZED_AFTER_RESULT`, with matching result SHA. Outer running disk/AC check also passed. PIDs 1511 and 1632 are no longer live.
- This is the sole **observed proximal failure**. Because Vitest never ran the test, no result can establish whether the 416-week simulation or downstream postflight would pass after the config issue is fixed. Preserve the failed receipts and logs.

## Invalid-ID first attempt `r8-ag-p13a-clean-20261007T221049Z`

The 22:10:49 UTC lane wrapper ended exit 1. Bootstrap reached `outer.py` but its run-ID regex (`[a-z0-9-]{1,48}`) rejected the uppercase `T` and `Z` before creating an outer or target leaf or running an environment preflight. No child or game simulation launched. Preserve its lane log and meta as the first failed attempt.

## r9 route recommendation (static, untested)

Build a newly versioned, independently reviewed package that keeps the simulation tree immutable. A `.cjs` Vitest config is the narrow option: installed Vite `isFilePathESM` returns false for `.cjs`, and its CJS config loader compiles the bundled code in memory without writing a sibling timestamp file. Installed `vitest/config` has a `require` export (`dist/config.cjs`). Create and pin the CJS config and update the exact command/inventory/manifest/review; do not alter the frozen r8 package. Keep the same test include, worker and timeout settings. The change must be statically reviewed and then observed in a fresh exclusive lane. An external writable ESM config is another option, but its own module resolution and package membership need explicit design and guards.
