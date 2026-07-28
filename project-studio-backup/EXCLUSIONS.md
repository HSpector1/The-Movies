# Exclusions

What was deliberately left out of this backup, and why. Exclusion here means
"not warehoused in this recovery branch," not "unimportant." The priority was
recoverable code and documentation, not mirroring every byte on disk.

## Never included (all tracks)

- `.git/` directories from source repos (snapshots are `git archive` extractions,
  so no nested history is embedded)
- `node_modules/` (Asset Lab alone held 328 MB) — restore with the lockfile
- `dist/`, `build/`, `.vite/`, `coverage/`, caches, OS metadata, temp logs
- `.env` files, tokens, credentials, keys, certificates (none were found; none copied)

## 3D visual spike

- 52 dirty working-tree PNG recaptures under `shots/` and `shots-m3/`.
  Only the committed baseline (`591f3aa`) is preserved. The source dirty files
  were left untouched (not cleaned, not restored).

## Asset Lab

- `sources/original-archives/` (257 MB of original downloaded ZIP/RAR packs) —
  redistribution status is prototype-input only; not a runtime dependency
- Full extracted third-party source libraries
- License-unclear loose FBX production props (none were tracked; the committed
  tree contains no `.fbx` and no winterset/Lionhead meshes)
- Legacy Lionhead / "wintersets" runtime assets (present only as documentation:
  `docs/WINTERSETS-ARCHAEOLOGY.md`, which is preserved because it is a finding, not an asset)
- **42 untracked `proof/lab03/*.png` screenshots (~123 MB)** — the Lab03 hero-soundstage
  proof set. Excluded from the copy per owner instruction; every path is listed in
  `asset-lab/wip-recovery/excluded-proof-manifest.txt` so they can be regenerated or
  re-collected from the source machine if needed.

## Governance

- Nothing excluded. The full charter and MASTER-ROADMAP package (7 files) are preserved
  verbatim with SHA-256 hashes in `governance/SOURCE-MANIFEST.md`.

## Scan results at capture

- Secret scan: **clean** (no token/key patterns, no secret-named files)
- Large-file scan: **clean** (largest file in the backup is ~5 MB; nothing over 25 MB;
  nothing approaching GitHub's 100 MB hard limit; Git LFS not required)
- Total backup tree: ~113 MB, 585 payload files (before documentation files)
