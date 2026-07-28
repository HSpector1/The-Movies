# Recovery Guide

How to restore each track independently from this branch. Each track is
self-contained; you never need to restore all of them together.

First, get the branch onto a machine:

```bash
git clone https://github.com/HSpector1/The-Movies.git recovered
cd recovered
git checkout backup/project-studio-consolidated-2026-07-28
cd project-studio-backup
```

The snapshots under `*/committed/` and `prototypes/*/` are plain file trees
(extracted with `git archive`), so you can also just copy those directories out.

---

## 1. Main simulation (committed state)

Source was clean at capture, so the committed snapshot is a faithful copy of `1dee0a7`.

```bash
mkdir ~/The-Movies-restored
cp -R main-simulation/committed/. ~/The-Movies-restored/
cd ~/The-Movies-restored
git init && git add -A
git commit -m "Restore main simulation from backup (was phase-5.2-economy @ 1dee0a7)"
npm install        # rebuild node_modules from package-lock.json
npm test           # confirm the sim core passes
```

This gives you a fresh repo at the snapshot content. It does **not** restore the
original commit history — for that, the live remote branch `phase-5.2-economy` is
authoritative and should be preferred if it still exists.

## 2. Main simulation (WIP)

None. The working tree was clean at capture. `wip-recovery/working-tree.patch` and
`staged.patch` are intentionally empty (0 bytes) and `untracked-manifest.txt` is empty.
There is no uncommitted main-sim work to recover from this backup.

## 3. Frozen spikes (2.5D and 3D)

Each restores as an independent repository. Do not combine them.

```bash
# 2.5D lot spike  (was studio-lot-spike @ 3806ef6)
mkdir ~/lot-spike-restored && cp -R prototypes/studio-lot-2d/. ~/lot-spike-restored/
cd ~/lot-spike-restored && git init && git add -A && git commit -m "Restore 2.5D spike @ 3806ef6"

# 3D visual spike (was studio-3d-visual-spike @ 591f3aa)
mkdir ~/3d-spike-restored && cp -R prototypes/studio-lot-3d/. ~/3d-spike-restored/
cd ~/3d-spike-restored && git init && git add -A && git commit -m "Restore 3D spike @ 591f3aa"
npm install && npm run dev
```

The 3D spike's runtime GLB kits under `public/m2-assets/` are Kenney **CC0** (license
evidence in `licenses/3d-spike-kenney-cc0/`). The dirty PNG recaptures from the source
working tree were not backed up; only the committed baseline PNGs are present.

## 4. Asset Lab

The `committed/` snapshot is now at **`b6130c81`** ("refine hero soundstage visual target").
The Lab03 hero-soundstage work is already committed inside it, so there is no WIP patch to apply.

```bash
mkdir ~/asset-lab-restored
cp -R asset-lab/committed/. ~/asset-lab-restored/
cd ~/asset-lab-restored
git init && git add -A && git commit -m "Restore Asset Lab committed HEAD @ b6130c81"
npm install
npm run dev          # launch the lab (hero soundstage boots on Scene E)
node tools/build-manifest.mjs   # regenerate manifests if needed
```

**WIP recovery is SUPERSEDED.** `asset-lab/wip-recovery/` is retained only as historical
evidence of the working-tree state at the original capture (`1c86dd3` era). Do **not** apply
its `working-tree.patch` on top of `b6130c81` — it was generated against `1c86dd3` and would
conflict; the work is already present in `committed/`.

Excluded from the backup: the 42 `proof/lab03/*.png` screenshots (~123 MB). They are **tracked**
in `b6130c81` but were pruned from the archive to keep it lean. Every path and its source blob
SHA is in `asset-lab/committed-excluded-lab03-proof.txt`; regenerate the images with
`tools/capture-lab03.mjs` (and `capture-lab03-iter.mjs`), or fetch them from the live source at
`b6130c81`.

To recover the exact ORIGINAL snapshot (Asset Lab at `1c86dd3` + live WIP package), check out
tag `project-studio-backup-2026-07-28` instead of this commit.

**License caution:** the Asset Lab's *committed* runtime assets are limited to CC0/manifest
data. Any prototype-only, license-unclear inputs (original archives, extracted libraries)
were **not** backed up and must be re-sourced from the original machine, not from this branch.

## 5. Governance

```bash
cp -R governance/. ~/governance-restored/
```

These copies record what the source documents said **at capture (2026-07-27 mtimes)**.
Do not treat them as newer authority than the live package at
`~/Desktop/Project Studio Source Docs/`. If the live package still exists, it wins.
SHA-256 hashes for each file are in `governance/SOURCE-MANIFEST.md` for integrity checks.

---

## Do not

- Do not merge this branch into a working branch to "recover" — copy files out instead.
- Do not apply the Asset Lab WIP patch to a later Asset Lab codebase without checking
  (`git apply --check`) and resolving conflicts by hand.
- Do not treat any WIP-recovery content as reviewed or accepted work.
