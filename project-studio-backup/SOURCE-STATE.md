# Source State at Capture

Recorded 2026-07-28T17:09:42Z. All source inspection was read-only. No source
repository was edited, staged, stashed, reset, cleaned, checked out, committed,
merged, or rebased.

## Main simulation

- Path: `/Users/bruce/The Movies`
- Branch: `phase-5.2-economy`
- HEAD: `1dee0a717bcae70909554c23c4cf147cc0f29af8`
- Last commit: `1dee0a7  2026-07-28T18:24:42+02:00  D-12: correct weak-commercial calibration route`
- Working tree: **CLEAN** (0 staged, 0 unstaged, 0 untracked)
- Tracked files: 180
- Remote: `hspector-github → https://github.com/HSpector1/The-Movies.git`
- Note: this repository is active in another session and may legitimately advance
  after capture. The snapshot reflects `1dee0a7` at capture time.

## 2.5D lot spike

- Path: `/Users/bruce/The Movies - Studio Lot Spike`
- Branch: `studio-lot-spike`
- HEAD: `3806ef65cf0949a4b10e22b73ef1d3fb04a47e40`  (matches expected `3806ef6`)
- Last commit: `3806ef6  2026-07-26T13:52:17+02:00  docs(lot-spike): pass-4 authored-asset pipeline spike — Stage A failed review`
- Working tree: **CLEAN**
- Tracked files: 157
- Remote: `hspector-github → https://github.com/HSpector1/The-Movies.git`

## 3D visual spike

- Path: `/Users/bruce/The Movies - 3D Visual Spike`
- Branch: `studio-3d-visual-spike`
- HEAD: `591f3aa29074be830b46fddbfe1d6a1289892517`  (matches expected `591f3aa`)
- Last commit: `591f3aa  2026-07-26T21:56:26+02:00  docs(3d-spike): record Gate C PASS + OC-01 follow-up`
- Working tree: **DIRTY** — 52 modified PNG recaptures under `shots/` and `shots-m3/`,
  0 staged, 0 untracked. These are pre-existing recaptures. They were **not** included;
  the committed baseline PNGs (from `591f3aa`) are what the archive contains. The dirty
  files were not cleaned or restored.
- Tracked files: 141 (includes 7 Kenney CC0 `.glb` kits + committed proof PNGs)
- Remote: **none** (standalone repo)

## Asset Lab

- Path: `/Users/bruce/Project Studio - Asset Lab`
- Branch: `asset-lab-03-hero-soundstage`
- HEAD: `1c86dd330ba7c71061e220bc247424061c3c8895`
- Last commit: `1c86dd3  2026-07-28T11:23:55+02:00  docs(lab02): brief, visual-target findings, material-correction root cause, greybox inventory, performance, owner-review guide, integration recommendation + README pointer`
- Working tree: **DIRTY** — 10 modified tracked, 0 staged, 52 untracked
  (10 source/doc/tool files + 42 `proof/lab03/*.png`)
- Tracked files: 78
- Remote: **none** (standalone repo)
- Capture: committed HEAD archived; recoverable WIP code/docs preserved under
  `asset-lab/wip-recovery/`; 42 proof PNGs (~123 MB) excluded and manifested.

## Destination repository

- Repo: `https://github.com/HSpector1/The-Movies.git`
- Default branch (unchanged): `phase-5.1-talent`
- Pre-existing remote branches: `main`, `phase-5.1-talent`, `phase-5.2-economy`,
  `phase-5.2-studio-roster`, `studio-lot-spike`
- Backup branch created: `backup/project-studio-consolidated-2026-07-28` (orphan)
- Pre-existing backup branch/tag with that name: none
