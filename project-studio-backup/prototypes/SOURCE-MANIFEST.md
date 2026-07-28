# Prototypes — Source Manifest

Two independent frozen spikes. They are stored side by side but must be restored
as separate repositories. Their code was not rewritten to share structure.

## 2.5D lot spike → `studio-lot-2d/`

- Source path: `/Users/bruce/The Movies - Studio Lot Spike`
- Branch: `studio-lot-spike`
- HEAD: `3806ef65cf0949a4b10e22b73ef1d3fb04a47e40`  (matched expected `3806ef6`: **yes**)
- Commit time: `2026-07-26T13:52:17+02:00`
- Commit subject: `docs(lot-spike): pass-4 authored-asset pipeline spike — Stage A failed review`
- Dirty state at capture: **clean**
- Snapshot type: committed baseline (`git archive HEAD`)
- Tracked-file count: 157
- Files excluded: none (working tree was clean)
- Remote of source: `https://github.com/HSpector1/The-Movies.git` (branch `studio-lot-spike`)

## 3D visual spike → `studio-lot-3d/`

- Source path: `/Users/bruce/The Movies - 3D Visual Spike`
- Branch: `studio-3d-visual-spike`
- HEAD: `591f3aa29074be830b46fddbfe1d6a1289892517`  (matched expected `591f3aa`: **yes**)
- Commit time: `2026-07-26T21:56:26+02:00`
- Commit subject: `docs(3d-spike): record Gate C PASS + OC-01 follow-up`
- Dirty state at capture: **dirty** — 52 modified PNG recaptures under `shots/`, `shots-m3/`
- Snapshot type: committed baseline (`git archive HEAD`)
- Tracked-file count: 141 (incl. 7 Kenney CC0 `.glb` kits + committed proof PNGs)
- Files excluded: the 52 dirty PNG recaptures were **not** included; committed baseline
  PNGs are present. Source dirty files were left untouched.
- Remote of source: **none** (standalone). This backup is the only off-machine copy.

License note: the 3D spike's GLB kits under `public/m2-assets/{car-kit,character,city,factory,nature}/`
are Kenney **CC0** (each ships a `License.txt`; aggregated evidence in `../licenses/`).
