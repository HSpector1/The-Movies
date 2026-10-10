import hashlib,os
from pathlib import Path
A=Path(__file__).parent;b=(A/'LESSONS-r12.md').read_bytes();assert hashlib.sha256(b).hexdigest()=='2e98c1cd90a417e68a6e6cb44d1411f8a29bdc3478a8198a635e5a9e64d4475b'
t='''

## R13 - measure the failed resource, then preserve semantics in the repair

Actual fourth run21948 under sourceR11 produced the missing diagnosis. The first capture-off author196 baseline arm retained1,450 logical entries (1,298 calls and152 evaluations),2,075,516 bytes, then attempted a32,241-byte row. Only totalByteCap was true:2,107,757 exceeds2,097,152 by10,605. entryCap and rowByteCap were false. The independent initial audit6eae7a51 authenticates this exact predicate and arithmetic. The original fatal completeness assertion still fails; no truncated trace is admitted. Mandatory original shared post7509 is running at this lesson version, so final protected-STOP admission remains pending.

Generation passed again and its12,428,510-byte fixture packet is exactly byte-identical to R3 (0ae4a9a2), including true pre-market196/197/208 states. This is a measured repeated-packet identity, not full replay/baseline/catch-mutant/neutral acceptance. Keep earned progress distinct from the aggregate STOP and null terminal fields.

Finite source audit791a4774 found no full GameState in helper trace rows. Most calls are small; evaluations retain both full inputs and their canonical serialization, and source-array calls preserve full ordered projections. Calls, evaluation payloads, canonical bytes, context, duplicate-aware indices, multiplicity and order all matter to the accepted consumers. Dropping repeated-looking rows or substituting hashes alone would weaken the proof. Repeated bytes can be compressed losslessly without discarding logical evidence, but fit is not yet measured.

Authority audit e7daa180 separates the original observer512-row/16KiB-row/2MiB contract from the test-only helper16384-entry/64KiB-row/2MiB resource bounds. Their equal total numbers do not make them the same invariant. Adopted helper notes explicitly left sufficiency unmeasured. Any switch from summed expanded JSON bytes to bounded encoded storage is an operational accounting amendment, even if the numeric2MiB limit stays the same. It needs explicit independent review and parent adoption. Preserve logical count and expanded-row limits, charge encoding/framing, and bound reconstruction one row at a time. Do not silently relabel expanded bytes as compressed bytes or predict a pass before actual controls and runtime.

Two root preparation mistakes were caught before execution and preserved. First, fresh runtime paths were correct but EXACT-ARGV still documented prior R2 roles/status and an R3 config. Next, a documentation builder put the new script in argument index4, where the first input belongs; after executable,-I,-B the script is index3. Corrected R6 constructs roles from the authenticated original and validates complete12/10/6 argument vectors, fixed operands and future-null positions. Independent5c5234 accepts it; actual67992/read23931 and independent27e2/root37dc pass. A correct runtime template does not make its emitted command documentation correct. Validate semantic argument roles, not merely string presence or count.
'''
p=A/'LESSONS-r13.md'
with p.open('xb') as f:f.write(b+t.encode());f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(str(p),p.stat().st_size,hashlib.sha256(p.read_bytes()).hexdigest())
