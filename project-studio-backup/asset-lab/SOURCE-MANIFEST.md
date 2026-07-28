# Asset Lab — Source Manifest

> **Updated 2026-07-28 (follow-up commit).** The Asset Lab snapshot was advanced from
> committed HEAD `1c86dd3` (+ WIP recovery) to the now-committed Lab03 HEAD `b6130c81`.
> The original consolidated backup commit `ce4f619` and tag `project-studio-backup-2026-07-28`
> are preserved unchanged in history. This track now reflects `b6130c81`.

- Source path: `/Users/bruce/Project Studio - Asset Lab`
- Branch: `asset-lab-03-hero-soundstage`
- HEAD: `b6130c81bbfae8f6b6ab743fd24c5287b8d1c1e8`
- Parent commit: `1c86dd330ba7c71061e220bc247424061c3c8895` (the previous capture point; linear advance, no rewrite)
- Commit time: `2026-07-28T19:13:34+02:00`
- Commit subject: `Asset Lab 03: refine hero soundstage visual target`
- Dirty state at capture: **clean** (0 staged, 0 unstaged, 0 untracked)
- Snapshot type: committed HEAD (`git archive b6130c81`), 42 tracked Lab03 proof PNGs pruned
- Remote of source: **none** (standalone). This backup is the only off-machine copy.

## committed/ — 88 files (from 130 tracked at b6130c81, minus 42 pruned Lab03 PNGs)

The Lab03 hero-soundstage work that was uncommitted at the original capture is now
**committed** and lives here directly: `src/components/HeroFx.tsx`, `src/components/hero.tsx`,
`src/lab/heroMaterials.ts`, `docs/ASSET-LAB-03-*.md`, `tools/capture-lab03.mjs`,
`tools/capture-lab03-iter.mjs`. Also present: `src/`, `manifests/*.json`, `docs/` (incl.
PROVENANCE-REGISTER.md, WINTERSETS-ARCHAEOLOGY.md), `public/runtime-assets.json`, baseline
proof (`proof/*.png` ×9, `proof/lab02/*.png` ×12), package files, TS/Vite config. No `.fbx`,
no winterset/Lionhead meshes, no runtime asset over 25 MB.

### Excluded from committed/: 42 `proof/lab03/*.png` (~123 MB)

These became **tracked** in `b6130c81` but are still excluded from the backup per instruction
(keep it lean). Every path and its source blob SHA is recorded in
`../asset-lab/committed-excluded-lab03-proof.txt`. Regenerate with `tools/capture-lab03.mjs`,
or fetch them from the live source repo at `b6130c81`.

## wip-recovery/ — SUPERSEDED historical evidence (retained)

Kept for provenance but **superseded by committed HEAD `b6130c81`**. It captured the
working-tree state at the original backup (2026-07-28T17:09Z), before the work was committed.
Its 10 untracked source/doc/tool files and the `working-tree.patch` (against `1c86dd3`) now
correspond to content that is committed in `committed/`. Do not apply the WIP patch to a
tree that is already at `b6130c81`. See `wip-recovery/README.md`.

Restore instructions: see `../RECOVERY-GUIDE.md` §4.
