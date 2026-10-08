# H typecheck/collection runner independent static review r2

**REFINE; unrun.** Frozen inventory hashes and Python AST parse pass. The 11,060-file content/metadata audit is bounded to 512 MiB, but two failure-integrity defects remain.

1. `runner.py:109` launches each compiler/Vitest child with `start_new_session=True`. At `recorder.py:31-39`, a 330-second timeout signals only the lane-run/runner process group. The active child is in a different group and can survive the timeout, continue touching the mirror, and outlive the STOP receipt. Add an explicit runner SIGTERM/SIGINT cleanup handler for `CURRENT`, or have the outer recorder discover and kill/confirm the child group. Test timeout cleanup with a harmless synthetic child.
2. `runner.py:61-75` compares `lstat` before open to `fstat` before/after reading, but never repeats `lstat` after the read. If the pathname is replaced while the original descriptor is read, this pass can accept the old inode; the plan's stated fstat/lstat post-read identity is not implemented. Compare `fstat` with fresh `lstat` after the final byte (and reject symlink/path replacement), with a synthetic mutation refusal.

Keep r2 frozen/unrun. A versioned correction should also check the 300-second deadline during long dependency-content reads, so the outer 330-second recorder is never the first timeout that discovers a stalled hash. Do not claim a read-only mount or immutable dependencies; the intended result is a before/after content-and-metadata audit.
