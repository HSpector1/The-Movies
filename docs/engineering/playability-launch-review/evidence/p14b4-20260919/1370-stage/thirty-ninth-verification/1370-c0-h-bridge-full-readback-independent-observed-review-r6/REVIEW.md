# H bridge-inclusive full source readback r6 — independent observed review

Decision: **ACCEPT_OBSERVED_H_BRIDGE_FULL_SOURCE_BYTES_ONLY**. The original recorded lane ended actual exit 0, and recorder r3 reports child exit 0 and `groupClear: true`. Its one-shot readback says 1,402 regular files, 99,516,095 bytes and proof digest `1534ca888a99c1f41e3eb2a7201d6d6d56f1343bab3f4040518348cc34d276b4`. The exact r6 source, source/static, outer/static and filled exact receipt SHAs match.

A separate bounded, read-only recorded lane independently streamed every regular file, checked its Git blob OID or overlay SHA, size/mode and stable file identity against H Git and the pinned overlay manifest, rejected extras, and rebuilt the source-order proof digest. It matched all 1,402 files/99,516,095 bytes, 76 directories, 1,479 entries and the sole exact `node_modules` symlink identity. Both recorded lane metas ended exit 0. The original mirror root and link identities match the independent audit, with no partial outputs, lock or surviving child. Production HEAD/source/remote refs remain pinned, worktree clean and AC power present.

The r4 and r5 STOP evidence remains preserved. This accepts source bytes only; H TypeScript, diagnostic collection, 416-tick neutrality, C0/1363 closure and gameplay acceptance remain unproven.
