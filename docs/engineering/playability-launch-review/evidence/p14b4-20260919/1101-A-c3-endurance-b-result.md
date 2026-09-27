# 1101-A — Completed active endurance B replay

1065 closed2026-09-27T04:20:48.228Z after29m43.507s, child0/fixed source
1f4b8429fef335e1fb25bede0b5d2c6014901ba8, empty consumed diff and no untracked
source. Exclusive1052-c3-endurance-B-recording-v1 metadata reports PASS with
null failure/guardFailure; final marker also reports null artifactFailure.
Independent1101-B owns the final artifact disposition before C is released.

The qualified separate recording producer909e822e and codec/provenance inputs
remain unchanged. Original A and its producer remain unchanged and explicitly
identified as legacy baseline/predecessor. The entire game-policy class is the
previously proven identical43293-byte source. No producer-identity equality
between original A and revised B is claimed.

B actually completed6240 attempts/ticks,1072 accepted commands/engine calls,
six creators,122 commissions/greenlights/releases,19 set commands,75 attachments
and121 read groups. It replayed A's exact typed trace and passed its per-command
causal/status comparisons and all canonical/per-root checkpoint comparisons.
B has zero runtime samples by design; it does not repeat A's three disk samples.
Parent directly compared retained midpoint/final whole-save bytes with A:

| Boundary | Bytes | SHA256 | Literal comparison |
| --- | ---: | --- | --- |
|3120|3,644,208|5fea7fc04ef6a16a636f376fcc4791f75f77926ead08ae0b598e566db9091050|Exact A bytes|
|6240|6,720,108|c9bfb1428cf27dad13c26b6f135f3cd3ee00b9303c45076e97abecb357c8aab1|Exact A bytes|

Exactly seven files total16,330,598 bytes. Actual metadata is1,129,812B/SHA
38ad11c77215118970dfcc9cf7d3e7424ac6b205733779adbf8648b2e8db5383.
Encoded observations are3,283,432B/SHA712372488be85c51587aec7ff59e88b023691c994acc62727b5c2c68bf0463f7,
below unchanged16MiB. Commands/checkpoints preserve actual fresh timing values,
so their raw file hashes differ from A; the declared semantic comparisons exclude
only timing fields while preserving command, authority and root identities.
No original artifact was normalized or overwritten.

Measured tick median14.018ms, p9528.482ms, p9934.498ms, maximum365.706ms at
invocation2; peak observed checkpoint RSS833,929,216B, process maxRSS935,932KiB.
These are this instrumented replay's measurements, not latency/native or general
performance qualification. C reload cadence and D read-order/frequency parity
remain unexecuted. Original1056 failure, R8 timeout records, canonical098 Writer
work gap, B5 hashes and full-suite/Owner/native limits remain separate.

Parent uses the free execution lane for reviewed1100 forensic preparation/types/
one bounded counterfactual while independent B review closes. Preserve HEAD/index
through that snapshot's final guards and byte-exact evidence mirroring. Then
publish recoverable results and release C only on actual B PASS plus independent
KEEP.1093/1096 test maintenance remains unapplied until all endurance source
parity work completes.
