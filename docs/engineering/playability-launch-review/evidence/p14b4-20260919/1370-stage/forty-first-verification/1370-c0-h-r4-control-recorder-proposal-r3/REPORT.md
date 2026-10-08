# H r4/r5 control recorder r3 — scratch source proposal only

Status: **UNRUN / REQUIRES INDEPENDENT STATIC REVIEW AND BINDING**. No real H or dependency tree was scanned or materialized; no Vitest, heavy lane, or Git write was performed.

This versions the frozen r2 proposal in response to its independent `REFINE_STATIC_UNRUN` receipt, SHA-256 `c2797168aa5689857cde31f82e70fb37ecd657250d48a6d4cebe4b6b34e882ea`. The r2 source remains unchanged.

## r3 corrections

* `recorder.tree_snapshot` now captures ACL and xattrs through bounded native macOS APIs, without spawning `/bin/ls -lde` per entry. Native capture holds a nofollow file descriptor for regular files/directories, bounds names/value/ACL sizes, and fails closed on source identity drift. The ACL serialization differs from r2 and therefore needs freshly measured, bound source/dependency/protected digests before any real arm.
* `kill_group` treats `EPERM` or other signal errors as unresolved group evidence, attempts direct child termination and reaping, and returns cleanup errors instead of throwing. `run` makes any failed cleanup a `STOP_SURVIVOR` result and attempts its one-shot receipt through an already validated held directory FD. No timeout was extended: child 90 seconds, recorder 120 seconds.
* `safe_output.validate_parent` rejects both an output location inside a protected root and an output location that is an ancestor of one. It uses canonical nofollow directory chains and held identities.

The prior r2 lane-lock, source/ref/origin checks, xattr-inclusive snapshots, held output placement, 3 GiB floor, 256 MiB admission buffer, stream caps, and child/watcher group cleanup remain in place.

## Tiny scratch evidence

`PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py` passed on synthetic files only. `TEST-RESULT.json` records stable assertions: transient-root timestamp drift with stable tree digest; file and root xattr mutation REDs; ACL mutation RED; symlink and ancestor output path REDs; watcher event and group clearance; bounded output cap; denied group-signal path returning unresolved cleanup evidence while directly reaping its child. The transient fixture was removed by its temporary-directory owner.

## Limits before any real arm

Independent review must assess the exact native ACL/xattr API behavior and all source hashes. A filled binding and same-profile sandbox canary are still required. The 120-second recorder bound includes full source/dependency/protected pre/post snapshots; if the native scan or any guard cannot finish within it, the result is a STOP, not a reason to relax timing silently. Simulated `EPERM` verifies cleanup code behavior, not that macOS will deny `killpg` in the actual sandbox. A group that cannot be proven clear remains `STOP_SURVIVOR` even if the direct child has exited.
