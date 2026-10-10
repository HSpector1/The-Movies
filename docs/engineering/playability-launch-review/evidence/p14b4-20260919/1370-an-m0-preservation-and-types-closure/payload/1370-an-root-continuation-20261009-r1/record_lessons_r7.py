import hashlib,json,os
from pathlib import Path
P=Path(__file__).parent
old=P/'LESSONS-r6.md'
assert hashlib.sha256(old.read_bytes()).hexdigest()=='01060214cd1c21d3af1732c0b8e57223bcdd146c2c6daa9e8e644658acbc97f7'
addition='''

## R7 — external configuration repair succeeds with full preservation (2026-10-10 UTC)

The fresh external-config R3 actual tool session56426 completed0. Both compilers and diagnostic collection passed: root54.762s, UI56.218s and collection6.054s; the dependency check also completed0. The complete runner took194.862s and recorder197.555s under the unchanged300/320/330 bounds. All four recorded child root boundaries matched. Complete M0 source and dependency proofs before and after exactly matched the independently qualified post-R6 baseline, including all1740 source files119393120B and historical nonroot metadata. The diagnostic collection contains exactly the expected one core identity,238B/5e6d1f48. External root/workspace configuration copies retain the original project and include semantics.

The mandatory original shared fullpostflight session46072 also completed0. Its guard479.625603808s/inventory374.661748s matched the original immutable map, all nine strict roots and the explicitly narrower shared scratch identity. Readback d9e54a27 records all four actual owned IDs absent and the lane released. Final independent observed review and root admission are pending at this lesson version; successful tools alone are not that admission.

The hard-won repair is to move real configuration bundling writes outside the protected source root, then prove both runtime behavior and complete preservation. This does not restore or waive the original R6 metadata failure. Its root timestamp drift remains honestly recorded. Likewise the R1 live disk-floor STOP remains a failed attempt, separate from this fresh successful run. The equal238B collection output is a newly observed result; equality does not retroactively admit the old collection.

Pure ordering session6493 is now independently and root-admitted: two intended positive cases and sixteen specific assertion refusals. The independent d2e91a68 receipt and root c0e9fb42 adoption close that finite consumer check. These cases do not establish real fixture timing, a full-function catch mutant, or neutral416 behavior.

Source review found another cross-language identity hazard: nanosecond timestamp integers exceed JavaScript's exact Number range. JSON.parse can collapse distinct authority integers into one number. Exact byte/source authority must retain integer identity across language boundaries; a parser or comparison fix itself needs finite meaningful controls, including neighboring large integers and specific malformed-input refusals. The proposed isolated parser and its controls remain unexecuted/unaccepted at this version. Do not claim their correctness from AST inspection alone, and trace serialization so BigInt validation values do not accidentally reach JSON.stringify or become strings.

Failure reports also need three-valued knowledge: after a simulation process starts and fails without a final proof, whether a requested prefix completed can be unknown. Do not report false/no-game merely because the success report is absent; distinguish not started, observed partial or unknown execution, and proven completion.
'''
out=P/'LESSONS-r7.md'
with out.open('x') as f:f.write(old.read_text()+addition);f.flush();os.fsync(f.fileno())
out.chmod(0o444);b=out.read_bytes();print(json.dumps({'path':str(out),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}))
