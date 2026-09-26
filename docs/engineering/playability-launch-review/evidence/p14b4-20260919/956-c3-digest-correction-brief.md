# 956 — bounded serialization prerequisite before C.3

2026-09-26. Actual local/GitHub183252b2c3f1bb8399f68971c0576c213525159d;
outgoing preservation0fc34e9e/953 remains immutable. Exact C.3 law/API942/946 now
reviewed/frozen; implementation is still gated on this correction and independent
C.3 RED. This prerequisite addresses only the demonstrated952 ordering defect.

Independent author owns955 and tests/p14c3-promise-digest-continuity.test.ts.
Parent alone records tests and writes production; reviewer read-only. Source is
not changed before the RED handback/run. All consumed source/HEAD will be frozen
during recorded execution. One heavy process at a time.

The repair will canonicalize object-key order in the inputs passed to the existing
promise receipt digest. Arrays retain their order and all values retain native JSON
semantics, including negative zero, null and omitted undefined object properties.
Use a local pure serializer in promises.ts, avoiding a new core-to-save dependency
or a change to the historical save serializer. No cached/global state or RNG.

Keep fnv1a64, exact feasibility input membership, existing retirement-aware inputs,
classification/bottleneck/selection/rules4, old stored receipt bytes and terminal
outcomes. Change only newly computed digest identity. No detached capacity adapter,
evaluator5, price, promise family or new save/projection shape belongs to this fix.

Required checks: independent RED reproduces actual order dependence; GREEN proves
equivalent permutations and genuine207 public continuation agree, meaningful input
changes remain visible, read-only evaluation/load preserves state/old receipts, and
current52 preserved checkpoint can reopen and replay its actual duplicate command
without changing history. Author must state any unavailable compatibility proof.
Focused existing promise reservation/cast-class/acting-discipline checks protect
neighboring law. Typecheck the changed source; independent stable-diff review.
Do not silently update historical expected hashes, extend timeouts or rewrite T0.

The complete program regression is the required upcoming C.3 matched full gate;
this small prerequisite checkpoint is focused evidence, not a repeated C.2-RM full
qualification or an all-green-suite claim. Final52→53 runtime reset remains required
even if the interim52 duplicate-journal check passes. Record child status and fixed
source identity for every run, then publish recoverable source before C.3 RED.
