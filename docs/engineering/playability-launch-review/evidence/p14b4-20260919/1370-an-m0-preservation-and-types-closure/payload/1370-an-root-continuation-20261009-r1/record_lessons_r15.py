import hashlib,os
from pathlib import Path
A=Path(__file__).parent
b=(A/'LESSONS-r14.md').read_bytes()
assert hashlib.sha256(b).hexdigest()=='bb53ae7deccec29a3cfbaf91385f4f6be13f45de007efcbeba19bb5927c62e8b'
t='''

## R15 - recovered protection, exact API lifetime and cleanup (2026-10-10 UTC)

Fresh original shared post17336 completed0 after526.112769053012s, including411.1576840189955s inventory. Qualified readback23bca5ae/snapshot33302fe3 preserves exact full immutable map and nine strict roots, released lane and nine scoped PID/group absences. Failed scanner35222 was additionally checked absent by PID and group in separate evidencea8c1ccc4; it was not substituted into original route ownership. Independent R4 observed4c4b1058/rootd684408b now accept the precisely scoped total-byte-cap STOP with genuine repeated natural packet generation and separate full shared protection. Original gameplay21948 remains STOP, original shared post7509 remains disk-floor failure, after-source/dependency proofs and terminal gameplay-prefix fields remain null. Recovery does not require replaying the already completed generation phase.

Lossless representation sourceR2d64262b1 and independent48-case sourcec57c38cf were reviewed, still unrun. Actual fullbody consumers retain paired snapshots across named boundaries unless the assertions are scoped with each pair. The candidate scopes author pair/assertions before freeze pair/assertions, then off-week pair, retaining at most two encoded snapshots at each boundary. Gameplay caller order, event order and all predicates stay unchanged; validator assertion scheduling is explicitly different. Plain synthetic source-case edits happen before codec wrapping and outside expected-negative assertions, so framing or loader failures cannot masquerade as original ordering RED results.

Parent spot-review then found a narrow API gap despite source acceptance: append-after-snapshot threw STORE_CLOSED before setting the sticky failure primitive. The adopted contract explicitly included API failures and contained no misuse exception. The gameplay probe normally avoids this call via active=false; this is a public contract gap, not observed gameplay corruption. Independent review agreed to set state.failed before the throw and add a strict negative requiring subsequent snapshot and already returned view access to reject TRACE_OPERATIONAL. Preserve sealed prior sources/reviews; do not silently edit approved bytes.

Sticky end failures also exposed four finally blocks using end();reset() sequentially. An end error could skip the test API reset. Nested try/end/finally/reset preserves the operational STOP while ensuring reset still runs. This is cleanup correctness, not permission to swallow the error or count it as the intended observer mutant. Fresh implementation/test review and recorded controls are still pending at this version; no codec fit, full qualification, neutrality, ledger closure or P17/P18 completion is claimed.
'''
p=A/'LESSONS-r15.md'
with p.open('xb') as f:f.write(b+t.encode());f.flush();os.fsync(f.fileno())
p.chmod(0o444)
print(str(p),p.stat().st_size,hashlib.sha256(p.read_bytes()).hexdigest())
