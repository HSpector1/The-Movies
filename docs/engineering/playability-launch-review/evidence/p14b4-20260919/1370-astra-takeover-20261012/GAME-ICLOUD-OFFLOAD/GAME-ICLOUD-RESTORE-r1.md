# Inactive game verification archive — 2026-10-13

Owner authorized game files to be moved to iCloud and offloaded. This bounded archive preserves inactive scratch evidence and old verification source copies. Active production/specialist checkouts, current integration packages, current takeover inputs, preview, Git data, dependency trees, existing symlinks and directories stay local.

Archive: `~/Library/Mobile Documents/com~apple~CloudDocs/The Movies Archive/2026-10-13-inactive-verification/inactive-verification.tar.gz`.

`GAME-ICLOUD-ARCHIVE-MANIFEST-r1.json` records each original relative path, byte hash, mode and timestamps. `GAME-ICLOUD-LOCAL-CONSOLIDATION-r1.jsonl` lists only original files consolidated into the fully verified, still-resident local archive while Apple upload continues. Native archive eviction is a separate later action allowed only after upload confirmation. The archive also contains files that may still be local: do not overwrite them blindly.

For a historical replay, download the archive through Finder first. Check the archive SHA-256 against `GAME-ICLOUD-ARCHIVE-PACK-VERIFIED-r1.json`. Extract into a **fresh temporary directory with sufficient space**, preserving the `studio-scratch/` prefix. Verify needed file hashes against the manifest. Restore only the required missing original paths under `/Users/zacheryspector/studio-scratch`; if a current file already exists, compare and preserve it. Use manifest modes where needed. A future replay must restore its full selected input set before its freeze/preflight; the active P15B continuation does not use these archived paths.

Do not treat an iCloud folder entry alone as proof of upload. See the pack proof, native upload status, eviction receipt, original offload journal and measured free-space receipt. No archive is deleted from iCloud.

Second archive: the same filename under sibling folder `2026-10-13-inactive-verification-2`. Use manifest/pack proof/consolidation journal suffixed `r2` for its 6571 files. First archive has 785 protected originals still local. Never rerun an obsolete deletion helper; use the exact completed journals as the restoration map.
