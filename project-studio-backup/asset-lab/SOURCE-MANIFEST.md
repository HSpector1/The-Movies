# Asset Lab — Source Manifest

- Source path: `/Users/bruce/Project Studio - Asset Lab`
- Branch: `asset-lab-03-hero-soundstage`
- HEAD: `1c86dd330ba7c71061e220bc247424061c3c8895`
- Commit time: `2026-07-28T11:23:55+02:00`
- Commit subject: `docs(lab02): brief, visual-target findings, material-correction root cause, greybox inventory, performance, owner-review guide, integration recommendation + README pointer`
- Dirty state at capture: **dirty** — 10 modified tracked, 0 staged, 52 untracked
- Snapshot type: committed HEAD (`git archive HEAD`) **plus** WIP recovery package
- Remote of source: **none** (standalone). This backup is the only off-machine copy.

## committed/ — 78 tracked files

`git archive` of `1c86dd3`. Contains `src/`, `tools/`, `manifests/` (curation,
optimization, runtime-assets, source-archives, source-assets, validation),
`docs/` (incl. PROVENANCE-REGISTER.md, WINTERSETS-ARCHAEOLOGY.md), `public/runtime-assets.json`,
committed proof PNGs (`proof/*.png`, `proof/lab02/*.png`), package files, TS/Vite config.
No `.fbx`, no winterset/Lionhead meshes, no runtime asset over 25 MB.

## wip-recovery/ — Lab03 hero-soundstage (uncommitted at capture)

Included per repo-owner instruction because this was the only source repo carrying
substantial unsaved work.

- `working-tree.patch` — binary patch of the 10 modified tracked files (~17 KB;
  README.md, package.json, package-lock.json, src/App.tsx, src/camera/CameraController.tsx,
  src/lab/LabContext.tsx, src/lab/cameraBridge.ts, src/scenes.tsx, src/types.ts, src/ui/DevPanel.tsx)
- `staged.patch` — empty (nothing was staged)
- `untracked-manifest.txt` — full list of all 52 untracked paths at capture
- `untracked/` — the 10 recoverable untracked source/doc/tool files, relative paths preserved:
  - `docs/ASSET-LAB-03-BRIEF.md`, `docs/ASSET-LAB-03-INTEGRATION-RECOMMENDATION.md`,
    `docs/ASSET-LAB-03-OWNER-REVIEW-GUIDE.md`, `docs/ASSET-LAB-03-REFINEMENT-LOOP.md`,
    `docs/HERO-SOUNDSTAGE-FINDINGS.md`
  - `src/components/HeroFx.tsx`, `src/components/hero.tsx`, `src/lab/heroMaterials.ts`
  - `tools/capture-lab03.mjs`, `tools/capture-lab03-iter.mjs`
- `excluded-proof-manifest.txt` — the 42 `proof/lab03/*.png` screenshots (~123 MB) that were
  **excluded** from the copy. Regenerate via the capture tools once the lab runs.

WIP patch included: yes. Untracked recovery included: 10 files. Assets excluded: 42 proof PNGs.
Restore instructions: see `../RECOVERY-GUIDE.md` §4.
