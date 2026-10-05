# Current integrated A+B+C preservation snapshot

Lossless backup of the exact 708 regular consumed files named by the active diagnostic's `S/1367-recovery-witness-diagnostic-prep/abc-pins.json`, against published base `d1e084b65093a940ff2f224941e8cf52ac69a08a`. This is preservation only: no implementation review, landing, promotion, merge, or passing-gameplay authority.

`full-abc.patch` is **276,665 bytes**, SHA-256 `c6941628c03b4cbf56273d0dbf6a7541b994cdf71da81c1df41302fd31982cf7`. It preserves every difference within that consumed inventory: **31 files, 21 modified and 10 added**. Thirteen modified files are production source; the remainder are tests/helpers and explicit build/diagnostic configurations. All unchanged consumed files retain their exact base identities in the full inventory.

The active candidate was only read. Every named file was a regular nonsymlink file, matched its supplied SHA before capture, and remained byte-identical afterward; the pin document itself remained exact. No fixture payload path, node_modules, symlink target, unenumerated directory, or Owner input was captured. No live/candidate/index/HEAD file was written. No Node, game runtime, tests, or TypeScript ran. Git reads used optional locking disabled, and no fetch, archive creation, checkout or index operation occurred.

## Artifact map

- `BASE-REFERENCE.json`: exact original commit, root tree and src tree. The commit object was verified locally; published status is the parent's supplied fact, not a new network assertion.
- `abc-pins.json`: byte-identical copy of the named active diagnostic inventory.
- `FILE-INVENTORY.json`: all 708 candidate/base file sizes, SHA-256, modes and original Git blob IDs, with each difference classified.
- `CANDIDATE-INVENTORY.json` and `SOURCE-INVENTORY.json`: complete consumed-candidate identities and the source-only subset.
- `PATCHED-FILES.json`: every changed/new file with before/after identities.
- `base-subset/`: exact original Git bytes for the 21 changed files that existed at the base.
- `candidate-subset/`: exact current bytes for all 31 changed/new files.
- `reconstruction/`: a fresh small subset populated from original base blobs, then reconstructed with the unified patch. It is not a runtime checkout.
- `PRESERVATION.json`: source, timing, pin, patch and exact reconstruction receipt.
- `patch-application.stdout.txt` / `.stderr.txt`: ordinary standalone `patch -p1 --batch --forward` receipt, exit 0. There was no Git index or repository in that destination.
- `snapshot.py`: exact fixed-scope preservation procedure. It uses exclusive artifact writes and is not meant to be rerun over the existing snapshot.
- `SHA256.json`: identities of all preserved artifacts, including subset bytes.

Static reconstruction compared every result byte-for-byte against the captured candidate and every authoritative pin. All 31 matched; no mode changes existed. No malformed or binary file needed special handling. The patch therefore reconstructs the preserved consumed candidate from that exact base without relying on any later local specialist source. Files outside the enumerated 708 paths, including possible unenumerated deletions, are outside this claim; this is not a filesystem-wide archive.

## Explicitly unlanded work

`tests/p14d2-disposal-witness-diagnostic.test.ts` and `tsconfig.witness-diagnostic.json` are preserved as **unlanded diagnostic preparation**, not permanent product-test adoption. `tsconfig.recovery-tests.json` is unlanded integration build preparation. The policy/Save46 source and reviewed B/C tests preserve the current candidate exactly, including any currently failing premise or unresolved behavior. No fixes, expectation changes, or runtime results were fabricated during preservation.

This patch contains the candidate's current week 77 consumer state, current historical caller adaptations, public 46 exports and integration corrections as they actually appear in the diagnostic's pinned inventory. It is not a recomposition of earlier proposals and does not silently replace this candidate with later versions. Parent must continue preserving future corrections as a new delta/snapshot rather than overwriting this receipt.

## Parent use

Keep this entire snapshot with the checkpoint's meaningful specialist artifacts after the active recorded run's freeze closes. The unified patch plus base reference and inventories is the compact lossless recovery path; the small byte subsets and reconstruction are independent verification evidence. If later staging to the repository, use the normal parent-owned evidence publication step. Do not apply the full candidate patch to live solely because backup verification passed.

For a future review checkout from exactly the named base, applying `full-abc.patch` reconstructs the differences. Verify every 708 file against `abc-pins.json` before treating it as the preserved candidate; install any separately authorized dependencies or fixture links only under their existing rules. This handback creates no such runtime authorization. Current diagnostic results and promotion readiness remain their own independently reviewed records.
