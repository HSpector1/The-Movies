# H typecheck r8 independent static review

Decision: REFINE_STATIC_UNRUN. The frozen five-file package rehashes correctly and its selfcheck passes. R6 raw/recorder/observed receipt, r4/r5 STOPs, canonical 1,402-row digest and bounded no-follow mirror/dependency walkers are substantively connected. No H mirror, typecheck or heavy route was run.

Launch blockers:

1. `run_child` lines 406–433 lets child stdout/stderr grow without a per-file or aggregate limit, then hashes them with `stdout.read_bytes()` and `stderr.read_bytes()`. The 300-second timer does not bound memory or disk consumption. Add a finite output cap checked while each child is running, stop its whole group on cap exceed, and hash through bounded streaming/stable fd reads. RED: a noisy disposable child crosses the cap and produces a classified STOP with no survivor. Apply equivalent stable nofollow cap/readback to `collection.json`; its size check followed by `read_bytes()` has a pathname growth/replacement gap. Bound the final result write too.

2. `cmd()` and Git roster/tree calls inherit ambient `GIT_*`, and `guard()` checks only local/remote production ref, not the pinned origin URL or evidence ref tip. Add a clean Git environment to every Git subprocess and exact origin/evidence local+remote checks at preflight and repeated guards. RED: spoofing `GIT_DIR`/`GIT_WORK_TREE` or changing origin/evidence must refuse. The r8 binding already has the production identity; pin the evidence tip explicitly.

Version r9; preserve frozen r8 and this REFINE receipt. R9 must be independently static-reviewed before any recorder or exact launch is filled. A source-only review cannot assert H types, diagnostic collection, neutrality or C0 closure.
