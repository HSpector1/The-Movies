# Isolated 1361 remote retrieval: disposition proposal

Read-only inspection on 2026-10-07. No deletion or new verification run. The R12 AG p13a clean lane was active during final inspection, so no independent archive readback was launched.

`/Users/zacheryspector/studio-scratch/1370-1361-sweep-remote-retrieved-r2` occupies 56,580 KiB: `.git` 20,604 KiB, materialized published package 35,968 KiB, and two top-level verifier records at 4 KiB allocated each. It is an isolated shallow checkout at `f90aed0908cf1963288936f444811ad698649fc3`; current remote evidence branch is `c36ff10f9dee1eb9493169e4a225f2c8ab97736d`, which contains the remote-restoration report and receipt. `git status --porcelain=v1 --ignored --untracked-files=all` showed no modified tracked paths, exactly one untracked `VERIFY-REMOTE-R2.log.meta`, one ignored `VERIFY-REMOTE-R2.log`, and one ignored generated `SUPPORT/__pycache__/BUILD.cpython-314.pyc`.

The two verifier records are only *hash-referenced* in the published report. Preserve their exact bytes before removing the checkout:

| File under retrieval root | SHA-256 |
|---|---|
| `VERIFY-REMOTE-R2.log` | `b26324111f8541479d16e2a692c02127c68d2ca682d7b4c2ec9b508a6ffbc2b0` |
| `VERIFY-REMOTE-R2.log.meta` | `a5ae9d8ed1a0f0cfdb36cd525971347c1f30a6adeb8697317b295782baf37490` |

Suggested sequence: copy only those two exact files to the evidence branch's `1361-sweep-tree-preservation-remote-review-r2/` directory; hash and publish them in a normal evidence commit; verify the new remote ref and both remote blobs. Then recheck retrieval HEAD, status, and the already published restoration receipt, and remove only the exact isolated retrieval directory using a no-follow traversal. Measure actual free blocks afterward. The generated `.pyc` requires no preservation. The retrieved package is already independently verified as reconstructible from GitHub; its `f90` commit is an ancestor of `c36`.

Potential larger reserve: the published, independently audited 1369 checkpoint-20 archive at work HEAD `b995a83e5363a3843f9b902e08c2df4dd95840cb` contains 3,047 byte-matched members from 33 old scratch source directories, plus formal evidence. Those 33 directories currently occupy 114,160 KiB and are listed in `1369-checkpoint-20-archive-r1/MANIFEST.json`. This is **not yet deletion-cleared**: some roots are code snapshots and the archive intentionally excludes `node_modules` symlinks. A fresh no-extra, all-regular-file byte comparison against the published tar, plus a dependency review for the excluded symlinks, is needed before exact-root disposition. No other >100 MiB set of raw-only scratch output was established as currently redundant in this inspection.
