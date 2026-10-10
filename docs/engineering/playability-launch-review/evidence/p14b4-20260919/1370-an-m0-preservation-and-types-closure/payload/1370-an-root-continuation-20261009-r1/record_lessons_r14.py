import hashlib,os
from pathlib import Path
A=Path(__file__).parent;b=(A/'LESSONS-r13.md').read_bytes();assert hashlib.sha256(b).hexdigest()=='1ac755d6795553c33eaf76c6054917cb18bfae929ba861b7a348ef375ce7fa43'
t='''

## R14 - live disk reserve and exact compression accounting (2026-10-10 UTC)

Mandatory shared post7509 failed its final current-facts disk-floor check. The original3758096384-byte reserve was enforced, not waived. Final roots/map equality and snapshot/pins emission were never reached, so a completed earlier inventory control path cannot be promoted to a preservation pass. Independent4b333b48/root317c5e58 preserve this precise failed scope. Its scanner35222 was separately observed absent by PID and group; no stale scanner ID was inserted into the original R4 route claims.

Measured host observations showed free space about2.85GiB and swap allocation4GiB. Previously authorized normal Chrome quit/reopen and cache cleanup restored headroom: Google cache192450560 allocated bytes and Chrome Service Worker cache69423104 bytes cleared with roots retained/no open files. npm cleanup partially progressed then refused PermissionError; result9d481eaa remains STOP_CACHE_CLEANUP, not a claim all caches cleared. No privilege escalation, ownership change, project/evidence deletion or new cleanup scope was needed. Free space after cleanup/reopen was5496209408 bytes. Swap allocation later measured2GiB; the timing is consistent with released swap contributing substantially to headroom, but does not establish an exclusive byte-by-byte cause. Fresh reserve is a measurement, not a guarantee during the next scan.

Fresh original post17336 is running at this lesson version with reviewed path-only R7 adapter827e809/rootfd056e8c and new real output identities. Preserve failed7509 regardless of that later result. Do not rerun the gameplay diagnostic merely because its separate protection check needs recovery.

Compression design review b065e4d4 stopped R2's unspecified packet/index costs and speculative8MiB JS heap promise before implementation. R3 defines exact persistent encoded storage:16-byte dedicated header plus the sum of dedicated frames, each9-byte header plus exact compressed bytes. No duplicate packet, pooled backing retention, dictionary or per-kind index array is allowed. Independent4e2f0dcc/rootbafc6e88 adopt this explicit operational accounting amendment for implementation only: the old expanded-total predicate is replaced by retained-encoded accounting at the same2MiB value. Logical16384 and expanded-row64KiB limits, all events/payloads and original gameplay observer caps remain fixed. This must never be described as passing the old expanded-total predicate.

Use bounded codec outputs and exact dedicated frame backing; compare every decompressed byte, reject trailing/noncanonical/corrupt frames, and stream at most two decoded rows. State the finite structural bounds honestly rather than inventing an exact JS heap guarantee. Separate off/on snapshots must survive later begin/reset without sharing mutable frame lists or counters. Preserve the original evaluation comparison projection: inputs/canonicalInputs/result, with captured contexts validated separately. Adding context equality would silently strengthen and change the original baseline contract.

Probe code runs inside real gameplay catches. A codec/allocation/framing error thrown during submitProposal may be swallowed by the existing ordinary-refusal catch. Set a sticky operational-failure primitive before rethrow, then refuse end/accessors if swallowed; keep it distinct from intended observer faults and resource overflow. A caught exception cannot become a missing trace row that passes. Source-backed design is accepted, but implementation, specific public codec controls, affected ordering regressions and real encoded fit are still unqualified at this version.

Reviewer tools also have schemas. Root's first reused R7 adapter checker expected documentary predecessorSourcePins keys; the actual sealed R7 proof used predecessorSourceManifest and other explicit names. Preserve the checker KeyError111f02, then validate the real schema with the same complete source inversion and hash checks. Do not treat a review-tool shape error as a candidate runtime failure or bypass the underlying checks.
'''
p=A/'LESSONS-r14.md'
with p.open('xb') as f:f.write(b+t.encode());f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(str(p),p.stat().st_size,hashlib.sha256(p.read_bytes()).hexdigest())
