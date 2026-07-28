# Project: Studio — Consolidated Recovery Backup

Captured: 2026-07-28 (UTC 2026-07-28T17:09:42Z)
Destination: `HSpector1/The-Movies`, orphan branch `backup/project-studio-consolidated-2026-07-28`

This is a **recovery snapshot**, not an integration branch. See the root `README.md`
for the merge warning. Nothing here modified any source repository.

## What is preserved

| Track | Source repo | Branch | Commit | State captured |
|---|---|---|---|---|
| Main simulation | `~/The Movies` | `phase-5.2-economy` | `1dee0a7` | Committed HEAD (working tree was clean) |
| 2.5D lot spike | `~/The Movies - Studio Lot Spike` | `studio-lot-spike` | `3806ef6` | Committed baseline |
| 3D visual spike | `~/The Movies - 3D Visual Spike` | `studio-3d-visual-spike` | `591f3aa` | Committed baseline (dirty PNG recaptures excluded) |
| Asset Lab | `~/Project Studio - Asset Lab` | `asset-lab-03-hero-soundstage` | `1c86dd3` | Committed HEAD **plus** WIP code/docs recovery |
| Governance | `~/Desktop/Project Studio Source Docs` | (not a repo) | files hashed | Visual charter + MASTER-ROADMAP 00–05 |

The 3D spike and the Asset Lab have **no other GitHub remote**. For those two tracks,
this branch is the only off-machine copy.

## Layout

```
project-studio-backup/
├── README.md               (this file)
├── BACKUP-MANIFEST.json    (machine-readable record of every snapshot)
├── RECOVERY-GUIDE.md       (how to restore each track independently)
├── SOURCE-STATE.md         (exact branch/HEAD/dirty-state of every source)
├── EXCLUSIONS.md           (what was deliberately left out, and why)
│
├── main-simulation/
│   ├── committed/          (git archive of HEAD 1dee0a7 — tracked files only)
│   ├── wip-recovery/       (EMPTY patches — source was clean at capture)
│   └── SOURCE-MANIFEST.md
├── prototypes/
│   ├── studio-lot-2d/      (git archive of 3806ef6)
│   ├── studio-lot-3d/      (git archive of 591f3aa)
│   └── SOURCE-MANIFEST.md
├── asset-lab/
│   ├── committed/          (git archive of 1c86dd3)
│   ├── wip-recovery/       (Lab03 hero-soundstage: patch + untracked source/docs/tools)
│   └── SOURCE-MANIFEST.md
├── governance/
│   ├── visual-charter/
│   ├── master-roadmap/
│   └── SOURCE-MANIFEST.md
├── licenses/               (Kenney CC0 evidence for the 3D spike GLB kits)
└── tools/
```

## Deviation from the original backup spec (recorded, not hidden)

The spec asked to back up the Asset Lab at its **committed HEAD only**, and it built a
detailed WIP-recovery mechanism for the **main simulation**. The actual state at capture
was the reverse: the main simulation was **clean** (nothing to recover), while the Asset
Lab carried substantial **uncommitted** Lab03 hero-soundstage work.

On the repo owner's explicit instruction, the Asset Lab therefore also gets a
`wip-recovery/` package containing the recoverable engineering work (a binary patch of the
10 modified tracked files, plus the untracked source/docs/capture-tool files). The 42
untracked `proof/lab03/*.png` screenshots (~123 MB) were **excluded** from the copy but are
listed in `asset-lab/wip-recovery/excluded-proof-manifest.txt`.

This is the only intentional deviation. It makes the backup a real recovery copy for the
one repository that actually had unsaved work.
