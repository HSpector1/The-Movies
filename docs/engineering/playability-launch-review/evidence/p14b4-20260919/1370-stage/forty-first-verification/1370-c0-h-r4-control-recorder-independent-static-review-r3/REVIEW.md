# Independent static review: H r4 control recorder r3

Decision: **ACCEPT_SOURCE_ONLY_UNRUN**. I did not author r3. This is a static and disposable-fixture decision, not an exact binding, H type pass, comparable control, or C0 attribution.

R2 REFINE receipt `c2797168aa5689857cde31f82e70fb37ecd657250d48a6d4cebe4b6b34e882ea` named three blockers. R3 removes per-entry `/bin/ls -lde` capture and uses bounded native nofollow ACL/xattr reads; the scratch ACL and file/root xattr REDs change the snapshot digest. `kill_group` records denied group signals, tries direct termination/reap, and requires group-clear proof; the simulated EPERM RED returned unresolved STOP evidence with the direct child reaped. `safe_output` now rejects output and receipt ancestors or descendants of protected roots before creation, with symlink and ancestor REDs.

I inspected the r2→r3 recorder and safe-output deltas, native metadata capture, binding and pre/post guard flow, and ran `PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py` in r3: exit 0, all reported synthetic checks PASS. No real H/dependency tree, Vitest, heavy lane, or Git mutation was used.

Exact launch review must still fill and pin current source/ref/remote roles, Stage40 receipt, real source and dependency digests under the new ACL serialization, full protected/receipt roots, actual sandbox profile/probe/command, lane lock/log, one-shot output and AC/disk state. It must verify the 120-second recorder bound includes both full pre/post scans; slow scans are STOP. `fs.watch` coalescence/dropped events, concurrent pathname ABA, and escaped process groups are residual attribution limits; no historical cause can be claimed without separate lineage/path evidence.
