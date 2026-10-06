# S1 evidence archive proposal r1

**Status: proposal; separate independent scope and readback review required before adoption.** No tracked repository file, TypeScript/Vitest/Node game, or commit was changed/run.

This deterministic uncompressed tar preserves both S1 source proposals and their reviews (including r1 REFINE and accepted r2), route r1 REFINE and r2 packages/reviews, the route and supervisor result directories, four full run leaves, the exact 20 current untracked formal files, launch script/template and lane log/meta, and the independent observed result review/receipt. The 36 absolute allowed roots are enumerated in `SCOPE.json`; `MEMBERS.json` pins every path, type, mode, size, content SHA or link target. Nothing is selected by a broad filesystem wildcard at rebuild time.

- Members: **1025** = 938 regular files, 83 directories, 4 symlinks.
- Logical regular-file bytes: **64,717,462**. Primary gzip bytes: **8,147,032**; raw scratch tar bytes: **65,771,520**.
- Primary `EVIDENCE.tar.gz` SHA-256: `20c4605caca8352bbfc5a9d7b2929f4a372b8d536aac1ea26c47dcafdaaa1cf7`. Gzip has empty filename and mtime 0; decompression recovers the raw tar, and a disposable recompression was byte-identical. The raw tar stays scratch-only.
- Raw tar SHA-256: `16f113748342bb0c3855544aab8bed6e9bf95d633553ba53b0da18800f6c7cb1`. Scope SHA-256: `54dac89e5a800d3918dd17ab8b45e1e77da454a8ec38f49477bf93c2b9e36578`. Members SHA-256: `ffaa9d1135b98597d995d875c2a8471c6bb8d61a6c66ab0b011be91d3d3e74d8`.
- Four symlinks are the two `node_modules` entries in each S1 proposal arm; each is stored as a link object, never followed. No dependency targets, Python caches, `.vite`, `.git`, unrelated scratch, or owner saves are included.
- Readback independently checked all 1,025 ordered members, kinds, modes, zero uid/gid/mtime, regular content SHA and symlink target. Rebuilding into a disposable path produced the same tar SHA. This self-check is not the requested independent review.

The builder accepts a single output path, re-scans every listed root without following symlinks, refuses any extra/missing/changed object, and emits deterministic PAX tar entries. A reviewer should rehash SCOPE/MEMBERS/build/tar, inspect the 20 formal file roles and four complete run leaves, and rebuild to a separate temporary tar. The tar is a preservation artifact, not a new S1 observational or causal verdict.
