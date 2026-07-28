# tools/

Reserved by the backup structure. This backup did not require any custom restore
tooling: every track restores with plain `git`/`cp`/`npm` steps documented in
`../RECOVERY-GUIDE.md`.

Per-track build/capture tooling lives inside each snapshot, not here:

- Main sim: `main-simulation/committed/` (its own scripts under `tools/` if present)
- 2.5D spike: `prototypes/studio-lot-2d/`
- 3D spike: `prototypes/studio-lot-3d/tools/`
- Asset Lab: `asset-lab/committed/tools/` (`build-manifest.mjs`, etc.) and the Lab03
  capture tools under `asset-lab/wip-recovery/untracked/tools/`
