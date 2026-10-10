import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;old=A/'LESSONS-r8.md';assert hashlib.sha256(old.read_bytes()).hexdigest()=='67c911c0808e8ad762d03c5aacfdc05a218430d2da18606bc809ade8fd11960e'
addition='''

## R9 — proof callers need the right subject, and runtime paths need auditing (2026-10-10 UTC)

Pure32 actual91619 is now independently accepted113d1055 and root-adopted2684b2b4. Keep this closed; a fresh fullfunction wrapper should authenticate and import the already tested immutable R7 helper explicitly, rather than replay32 cases just because wrapper paths changed.

The first real fullfunction attempt95737 failed: helper/recorder2, owned controller1,4.919851471s, no timeout. Its first source check received MIRROR_ROOT, the container, rather than the authenticated CONFIG.mirrorPath leaf. The original guard correctly rejected the container against the expected leaf identity before any subtree enumeration. No runtime output directory or Node game process was reached. Exact named stat observations show the actual leaf still matches the qualified recorded root tuple and the container does not. This is root metadata only, not a completed full M0 source/dependency proof. READBACK2292a2f9 preserves the actual381Bstderr, absent after-proofs and all six scoped PID/PGID absence checks. Mandatory shared fullpostflight89456 remains running at this lesson version.

Reusing byte-exact qualified proof functions does not validate a caller's arguments. Explicitly distinguish an admitted source leaf from its storage container, and bind the leaf to the original authenticated copy adoption before passing it to either complete proof call. A checksum-valid helper can still receive the wrong subject. Do not repin the expected metadata to make that misuse pass.

The controller also emitted a real Python3.14 SyntaxWarning because it returned from finally. That pattern can suppress cleanup exceptions and would violate the recorder's empty-controller-stderr success requirement. Move the return after finally so cleanup errors propagate; do not hide the warning. This differs from the already retained outer recorder warning that has a separate permitted logging scope.

Review of the proposed R8 repair found an executed recorder OUTPUTS constant still pointing to the consumed R1 destination even though CONFIG and RECIPE correctly declared fresh R2 output. The source was stopped before another launch. Audit every executed path selector, including recorder output tables and parent once paths, against the actual fresh route. Correct documentation cannot fix a stale runtime literal. Preserve both the actual R7 failure and the unrun R8 source STOP; fresh R9 is still under preparation/review at this version.
'''
p=A/'LESSONS-r9.md'
with p.open('x') as f:f.write(old.read_text()+addition);f.flush();os.fsync(f.fileno())
p.chmod(0o444);b=p.read_bytes();print(json.dumps({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}))
